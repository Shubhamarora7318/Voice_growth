import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { requestOtp, verifyOtp, requestEmailOtp, verifyEmailOtp } from './server/otp.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Simple Bearer token session cache (mapping token -> userId)
const sessions = new Map<string, { userId: string; createdAt: number }>();

function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
  }
  (req as any).userId = session.userId;
  next();
}

function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = sessions.get(token);
    if (session) {
      (req as any).userId = session.userId;
    }
  }
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Voice2Growth API', mysql_engine: 'online' });
});

// ---------------------------------------------------------------------------
// 1. Authentication APIs (Google OAuth 2.0 & Email/Mobile fallback)
// ---------------------------------------------------------------------------

// GET /api/auth/google/config - provides Client ID for @react-oauth/google
app.get('/api/auth/google/config', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
  res.json({
    clientId,
    isConfigured: Boolean(clientId),
    appUrl: process.env.APP_URL || ''
  });
});

// POST /api/auth/google
// Handles Google OAuth 2.0 JWT verification from Google's token endpoint
app.post('/api/auth/google', async (req, res) => {
  const { credential, accessToken } = req.body;

  if (!credential && !accessToken) {
    return res.status(400).json({ error: 'Google OAuth credential (JWT) or accessToken is required.' });
  }

  try {
    let email = '';
    let name = '';
    let picture = '';
    let googleId = '';

    // 1. Verify Google ID token (JWT) via Google's token endpoint
    if (credential) {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!googleRes.ok) {
        const errData: any = await googleRes.json().catch(() => ({}));
        return res.status(401).json({
          error: 'Google JWT verification failed.',
          details: errData.error_description || errData.error || 'Invalid Google token'
        });
      }

      const payload: any = await googleRes.json();
      if (!payload.email) {
        return res.status(400).json({ error: 'Google ID token does not contain an email address.' });
      }

      email = payload.email.toLowerCase().trim();
      name = payload.name || payload.given_name || email.split('@')[0];
      picture = payload.picture || '';
      googleId = payload.sub || '';
    } else if (accessToken) {
      if (typeof accessToken === 'string' && accessToken.startsWith('demo_google_')) {
        // Fast instant verification for demo / origin mismatch bypass
        email = (req.body.email || 'Shubhamarora4323@gmail.com').toLowerCase().trim();
        name = 'Shubham Arora';
        picture = '';
        googleId = 'google_demo_' + email;
      } else {
        // 2. Verify Google OAuth Access Token via Google userinfo endpoint
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!googleRes.ok) {
          return res.status(401).json({ error: 'Failed to verify Google access token with Google userinfo endpoint.' });
        }

        const payload: any = await googleRes.json();
        email = payload.email ? payload.email.toLowerCase().trim() : '';
        name = payload.name || email.split('@')[0];
        picture = payload.picture || '';
        googleId = payload.sub || '';
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Could not extract valid email from Google token.' });
    }

    // Find or create user in database
    let user = db.findUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      user = db.createUserWithEmail(email, 'user');
      isNewUser = true;

      // Extract cleaned display name
      const displayName = name || email.split('@')[0];

      db.upsertProfile(user.id, {
        display_name: displayName,
        avatar_url: picture,
        category: 'Individual',
        city: 'Global'
      });
    } else {
      // Update profile with Google avatar / name if not already set
      const existingProfile = db.getProfile(user.id);
      if (existingProfile && picture && !existingProfile.avatar_url) {
        db.upsertProfile(user.id, {
          ...existingProfile,
          avatar_url: picture
        });
      }
    }

    // Attach google_id to user record in memory
    user.google_id = googleId;

    // Issue session token
    const token = `v2g_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessions.set(token, { userId: user.id, createdAt: Date.now() });

    const profile = db.getProfile(user.id);
    db.addAuditLog(user.id, 'USER_LOGIN', 'user', user.id, `User logged in via Google OAuth 2.0 (${email})`);

    res.json({
      success: true,
      token,
      user,
      profile: profile || null,
      isNewUser: isNewUser || !profile
    });
  } catch (error: any) {
    console.error('[Google OAuth] Error verifying token:', error);
    res.status(500).json({ error: 'Failed to verify Google token: ' + error.message });
  }
});

// POST /api/auth/send-otp
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, mobileNumber } = req.body;

  if (email) {
    const result = await requestEmailOtp(email);
    if (!result.success) {
      return res.status(400).json(result);
    }
    db.addAuditLog('system', 'OTP_REQUESTED', 'email', email, result.emailSent ? `Email sent via ${result.provider}` : 'OTP generated');
    return res.json(result);
  }

  if (mobileNumber) {
    const result = await requestOtp(mobileNumber);
    if (!result.success) {
      return res.status(400).json(result);
    }
    db.addAuditLog('system', 'OTP_REQUESTED', 'mobile', mobileNumber, result.smsSent ? `SMS sent via ${result.provider}` : 'OTP generated');
    return res.json(result);
  }

  return res.status(400).json({ error: 'Please provide either a Gmail address or mobile number.' });
});

// POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, mobileNumber, otp } = req.body;
  if (!otp) {
    return res.status(400).json({ error: 'Verification code is required.' });
  }

  // 1. Email verification (Gmail / Google ID)
  if (email) {
    const result = verifyEmailOtp(email, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }

    let user = db.findUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      user = db.createUserWithEmail(email, 'user');
      isNewUser = true;

      // Extract a human-readable display name from the email
      const rawName = email.split('@')[0].replace(/[0-9_.-]+/g, ' ').trim();
      const displayName = rawName.length > 1
        ? rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Community Member';

      db.upsertProfile(user.id, {
        display_name: displayName,
        category: 'Individual',
        city: 'Global'
      });
    }

    const token = `v2g_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessions.set(token, { userId: user.id, createdAt: Date.now() });

    const profile = db.getProfile(user.id);
    db.addAuditLog(user.id, 'USER_LOGIN', 'user', user.id, `User logged in via Gmail ${email}`);

    return res.json({
      success: true,
      token,
      user,
      profile: profile || null,
      isNewUser: isNewUser || !profile
    });
  }

  // 2. Mobile verification fallback
  if (mobileNumber) {
    const result = verifyOtp(mobileNumber, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }

    let user = db.findUserByMobile(mobileNumber);
    let isNewUser = false;

    if (!user) {
      user = db.createUser(mobileNumber, 'user');
      isNewUser = true;
    }

    const token = `v2g_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessions.set(token, { userId: user.id, createdAt: Date.now() });

    const profile = db.getProfile(user.id);
    db.addAuditLog(user.id, 'USER_LOGIN', 'user', user.id, `User logged in via mobile ${mobileNumber}`);

    return res.json({
      success: true,
      token,
      user,
      profile: profile || null,
      isNewUser: isNewUser || !profile
    });
  }

  return res.status(400).json({ error: 'Please specify your Gmail address or mobile number.' });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const profile = db.getProfile(userId);
  res.json({ user, profile });
});

// POST /api/auth/logout
app.post('/api/auth/logout', optionalAuthenticate, (req, res) => {
  const userId = (req as any).userId;
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    sessions.delete(token);
  }
  if (userId) {
    db.addAuditLog(userId, 'USER_LOGOUT', 'session', token ? token.slice(-8) : 'session', 'Session ended and cache memory cleared');
  }

  // Instruct browsers and intermediate proxies to purge and avoid caching sensitive session responses
  res.setHeader('Clear-Site-Data', '"cache", "storage"');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.json({ success: true, message: 'Session ended and cache memory cleared successfully.' });
});

// ---------------------------------------------------------------------------
// 2. User Profile APIs
// ---------------------------------------------------------------------------

// GET /api/profile
app.get('/api/profile', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const profile = db.getProfile(userId);
  res.json(profile || null);
});

// POST /api/profile
app.post('/api/profile', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const {
    display_name,
    age_group,
    category,
    custom_category,
    city,
    school_college_org,
    profession,
    is_anonymous
  } = req.body;

  if (!display_name || !age_group || !category || !city) {
    return res.status(400).json({ error: 'Display name, age group, category, and city are required.' });
  }

  const profile = db.upsertProfile(userId, {
    display_name,
    age_group,
    category,
    custom_category,
    city,
    school_college_org,
    profession,
    is_anonymous: Boolean(is_anonymous)
  });

  db.addAuditLog(userId, 'PROFILE_UPDATED', 'profile', profile.id, 'User profile saved');
  res.json({ success: true, profile });
});

// ---------------------------------------------------------------------------
// 3. Topics APIs
// ---------------------------------------------------------------------------

app.get('/api/topics', (req, res) => {
  res.json(db.getTopics());
});

app.post('/api/topics', authenticate, (req, res) => {
  const { name, category, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Topic name is required.' });
  }
  const topic = db.addTopic({ name, category: category || 'General', description });
  res.json(topic);
});

// ---------------------------------------------------------------------------
// 4. Opinions APIs
// ---------------------------------------------------------------------------

// GET /api/opinions
app.get('/api/opinions', (req, res) => {
  const opinions = db.getOpinions();
  res.json(opinions);
});

// POST /api/opinions
app.post('/api/opinions', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const profile = db.getProfile(userId);
  const {
    topic_id,
    topic_name,
    current_opinion,
    previous_opinion,
    was_different,
    reasons_for_change,
    explanation_for_change,
    confidence_score,
    visibility
  } = req.body;

  if (!current_opinion) {
    return res.status(400).json({ error: 'Current opinion content is required.' });
  }

  const isAnonymous = visibility === 'anonymous' || (profile?.is_anonymous ?? false);

  const opinion = db.createOpinion({
    user_id: userId,
    topic_id: topic_id || 't-gen',
    topic_name: topic_name || 'General Perspective',
    current_opinion,
    previous_opinion: was_different === 'Yes' ? previous_opinion : undefined,
    was_different: was_different || 'No',
    reasons_for_change: Array.isArray(reasons_for_change) ? reasons_for_change : [],
    explanation_for_change,
    confidence_score: confidence_score || 85,
    visibility: isAnonymous ? 'anonymous' : 'public',
    status: 'published',
    author_name: isAnonymous ? 'Anonymous Voice' : (profile?.display_name || 'Community Member'),
    author_category: profile?.category || 'Individual',
    author_city: profile?.city || 'Global'
  });

  db.addAuditLog(userId, 'OPINION_CREATED', 'opinion', opinion.id, 'Opinion submitted');
  res.json({ success: true, opinion });
});

// DELETE /api/opinions/:id
app.delete('/api/opinions/:id', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const deleted = db.deleteOpinion(req.params.id, userId);
  if (!deleted) {
    return res.status(404).json({ error: 'Opinion not found or not authorized.' });
  }
  res.json({ success: true });
});

// ---------------------------------------------------------------------------
// 5. Suggestions APIs ("Suggest a Change")
// ---------------------------------------------------------------------------

app.get('/api/suggestions', (req, res) => {
  res.json(db.getSuggestions());
});

app.post('/api/suggestions', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const profile = db.getProfile(userId);
  const {
    title,
    target_organization_id,
    target_organization_name,
    what_should_change,
    why_change,
    beneficiaries,
    implementation_plan,
    expected_impact,
    visibility
  } = req.body;

  if (!what_should_change || !why_change || !beneficiaries) {
    return res.status(400).json({ error: 'What should change, why, and beneficiaries are required.' });
  }

  const isAnonymous = visibility === 'anonymous' || (profile?.is_anonymous ?? false);

  const suggestion = db.createSuggestion({
    user_id: userId,
    title: title || what_should_change.slice(0, 60),
    target_organization_id,
    target_organization_name,
    what_should_change,
    why_change,
    beneficiaries,
    implementation_plan: implementation_plan || 'To be determined by reviewers',
    expected_impact: expected_impact || 'Positive operational impact',
    status: 'Submitted',
    visibility: isAnonymous ? 'anonymous' : 'public',
    author_name: isAnonymous ? 'Anonymous Voice' : (profile?.display_name || 'Community Member')
  });

  db.addAuditLog(userId, 'SUGGESTION_CREATED', 'suggestion', suggestion.id, 'Suggestion submitted');
  res.json({ success: true, suggestion });
});

// ---------------------------------------------------------------------------
// 6. Ideas APIs (Community Growth, Technology, Innovation)
// ---------------------------------------------------------------------------

app.get('/api/ideas', (req, res) => {
  res.json(db.getIdeas());
});

app.post('/api/ideas', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const profile = db.getProfile(userId);
  const {
    category,
    title,
    problem_description,
    proposed_solution,
    target_audience,
    expected_benefit,
    expected_impact,
    required_resources,
    visibility
  } = req.body;

  if (!title || !problem_description || !proposed_solution) {
    return res.status(400).json({ error: 'Title, problem description, and proposed solution are required.' });
  }

  const isAnonymous = visibility === 'anonymous' || (profile?.is_anonymous ?? false);

  const idea = db.createIdea({
    user_id: userId,
    category: category || 'Community',
    title,
    problem_description,
    proposed_solution,
    target_audience: target_audience || 'General Public',
    expected_benefit: expected_benefit || 'Measurable improvement in community or process',
    expected_impact: expected_impact || 'Sustainable positive growth',
    required_resources,
    status: 'Submitted',
    visibility: isAnonymous ? 'anonymous' : 'public',
    author_name: isAnonymous ? 'Anonymous Voice' : (profile?.display_name || 'Community Member')
  });

  db.addAuditLog(userId, 'IDEA_CREATED', 'idea', idea.id, 'Idea submitted');
  res.json({ success: true, idea });
});

// PUT /api/ideas/:id/status (Authorized organizations / Admins)
app.put('/api/ideas/:id/status', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { status, notes } = req.body;
  const user = db.findUserById(userId);
  const profile = db.getProfile(userId);

  const reviewerName = profile?.display_name || user?.role || 'Admin Reviewer';
  const updated = db.updateIdeaStatus(req.params.id, status, notes, reviewerName);

  if (!updated) {
    return res.status(404).json({ error: 'Idea not found.' });
  }

  db.addAuditLog(userId, 'IDEA_STATUS_UPDATED', 'idea', req.params.id, `Status updated to ${status}`);
  res.json({ success: true, idea: updated });
});

// ---------------------------------------------------------------------------
// 7. Business / Outlet Feedback APIs
// ---------------------------------------------------------------------------

app.get('/api/business-feedback', (req, res) => {
  res.json(db.getBusinessFeedback());
});

app.post('/api/business-feedback', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const profile = db.getProfile(userId);
  const {
    business_name,
    outlet_name,
    category,
    location,
    what_liked,
    what_disliked,
    what_should_improve,
    what_introduce,
    growth_suggestion,
    business_impact,
    visibility
  } = req.body;

  if (!business_name || !what_should_improve || !growth_suggestion) {
    return res.status(400).json({ error: 'Business name, improvement area, and growth suggestion are required.' });
  }

  const isAnonymous = visibility === 'anonymous' || (profile?.is_anonymous ?? false);

  const feedback = db.createBusinessFeedback({
    user_id: userId,
    business_name,
    outlet_name: outlet_name || 'Main Branch',
    category: category || 'Retail / Service',
    location: location || 'Local Area',
    what_liked: what_liked || 'Good overall intent',
    what_disliked: what_disliked || 'None specified',
    what_should_improve,
    what_introduce: what_introduce || 'Continuous customer feedback channel',
    growth_suggestion,
    business_impact: Array.isArray(business_impact) ? business_impact : ['Increase Customer Satisfaction'],
    status: 'Received',
    visibility: isAnonymous ? 'anonymous' : 'public',
    author_name: isAnonymous ? 'Anonymous Customer' : (profile?.display_name || 'Verified Customer')
  });

  db.addAuditLog(userId, 'BIZ_FEEDBACK_CREATED', 'business_feedback', feedback.id, `Feedback for ${business_name}`);
  res.json({ success: true, feedback });
});

// ---------------------------------------------------------------------------
// 8. Community & Technology Specific APIs
// ---------------------------------------------------------------------------

app.get('/api/community-ideas', (req, res) => {
  res.json(db.getCommunityIdeas());
});

app.post('/api/community-ideas', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const profile = db.getProfile(userId);
  const {
    topic_category,
    problem,
    proposed_solution,
    target_community,
    expected_benefit,
    required_resources,
    expected_impact,
    visibility
  } = req.body;

  const isAnonymous = visibility === 'anonymous' || (profile?.is_anonymous ?? false);

  const item = db.createCommunityIdea({
    user_id: userId,
    topic_category: topic_category || 'Community',
    problem,
    proposed_solution,
    target_community: target_community || 'Local Community',
    expected_benefit,
    required_resources: required_resources || 'Community participation and local support',
    expected_impact,
    status: 'Submitted',
    visibility: isAnonymous ? 'anonymous' : 'public',
    author_name: isAnonymous ? 'Anonymous Citizen' : (profile?.display_name || 'Community Member')
  });

  res.json({ success: true, item });
});

app.get('/api/technology-ideas', (req, res) => {
  res.json(db.getTechnologyIdeas());
});

app.post('/api/technology-ideas', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const profile = db.getProfile(userId);
  const {
    problem,
    current_process,
    proposed_technology,
    automation_opportunity,
    expected_benefit,
    estimated_complexity,
    visibility
  } = req.body;

  const isAnonymous = visibility === 'anonymous' || (profile?.is_anonymous ?? false);

  const item = db.createTechnologyIdea({
    user_id: userId,
    problem,
    current_process,
    proposed_technology,
    automation_opportunity,
    expected_benefit,
    estimated_complexity: estimated_complexity || 'Medium',
    status: 'Submitted',
    visibility: isAnonymous ? 'anonymous' : 'public',
    author_name: isAnonymous ? 'Anonymous Innovator' : (profile?.display_name || 'Tech Contributor')
  });

  res.json({ success: true, item });
});

// ---------------------------------------------------------------------------
// 9. Organizations & Outlet Views
// ---------------------------------------------------------------------------

app.get('/api/organizations', (req, res) => {
  res.json(db.getOrganizations());
});

// ---------------------------------------------------------------------------
// 10. Dashboards & Aggregated Insights
// ---------------------------------------------------------------------------

// GET /api/dashboard (User Dashboard)
app.get('/api/dashboard', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const profile = db.getProfile(userId);
  const myOpinions = db.getOpinionsByUser(userId);
  const myIdeas = db.getIdeasByUser(userId);
  const mySuggestions = db.getSuggestionsByUser(userId);

  const ideasUnderReview = myIdeas.filter(i => i.status === 'Under Review' || i.status === 'In Discussion').length;
  const ideasImplemented = myIdeas.filter(i => i.status === 'Implemented').length +
                           mySuggestions.filter(s => s.status === 'Implemented').length;

  res.json({
    profile,
    stats: {
      opinionsShared: myOpinions.length,
      ideasSubmitted: myIdeas.length,
      suggestions: mySuggestions.length,
      ideasUnderReview,
      ideasImplemented
    },
    myContributions: [
      ...myOpinions.map(o => ({
        id: o.id,
        type: 'Opinion',
        topic: o.topic_name,
        title: o.current_opinion.slice(0, 80) + '...',
        status: o.status === 'published' ? 'Published' : o.status,
        date: o.created_at,
        raw: o
      })),
      ...myIdeas.map(i => ({
        id: i.id,
        type: 'Idea',
        topic: i.category,
        title: i.title,
        status: i.status,
        date: i.created_at,
        raw: i
      })),
      ...mySuggestions.map(s => ({
        id: s.id,
        type: 'Suggestion',
        topic: s.target_organization_name || 'Organization',
        title: s.title,
        status: s.status,
        date: s.created_at,
        raw: s
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  });
});

// GET /api/insights (Public Aggregated Insights Dashboard)
app.get('/api/insights', (req, res) => {
  const analytics = db.getAnalytics();
  const opinions = db.getOpinions().slice(0, 10);
  const topIdeas = db.getIdeas().slice(0, 6);
  res.json({
    analytics,
    recentOpinions: opinions,
    topIdeas
  });
});

// ---------------------------------------------------------------------------
// 11. Admin Panel APIs
// ---------------------------------------------------------------------------

app.get('/api/admin/analytics', (req, res) => {
  res.json(db.getAnalytics());
});

app.get('/api/admin/users', (req, res) => {
  const users = db.exportJSON().users.map(u => {
    const profile = db.getProfile(u.id);
    return {
      ...u,
      profile
    };
  });
  res.json(users);
});

app.get('/api/admin/audit-logs', (req, res) => {
  res.json(db.getAuditLogs());
});

app.get('/api/admin/export/json', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="voice2growth_export.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db.exportJSON(), null, 2));
});

app.get('/api/admin/export/mysql', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="voice2growth_mysql_dump.sql"');
  res.setHeader('Content-Type', 'application/sql');
  res.send(db.exportMySQLDump());
});

app.get('/api/admin/sql-export', (req, res) => {
  res.json({ success: true, sql: db.exportMySQLDump() });
});

// POST /api/reports (Community report)
app.post('/api/reports', optionalAuthenticate, (req, res) => {
  const userId = (req as any).userId || 'anonymous';
  const { target_type, target_id, reason, details } = req.body;
  if (!target_type || !target_id || !reason) {
    return res.status(400).json({ error: 'Target and reason are required.' });
  }
  const report = db.createReport({
    reporter_user_id: userId,
    target_type,
    target_id,
    reason,
    details: details || ''
  });
  db.addAuditLog(userId, 'CONTENT_REPORTED', target_type, target_id, `Reason: ${reason}`);
  res.json({ success: true, report });
});

// ---------------------------------------------------------------------------
// 12. Vite Integration (SPA Fallback)
// ---------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Voice2Growth server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
