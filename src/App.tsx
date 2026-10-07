import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { RulesModal } from './components/RulesModal';
import { ShareSelector, ShareType } from './components/ShareSelector';
import { OpinionForm } from './components/forms/OpinionForm';
import { SuggestChangeForm } from './components/forms/SuggestChangeForm';
import { BusinessFeedbackForm } from './components/forms/BusinessFeedbackForm';
import { CommunityIdeaForm } from './components/forms/CommunityIdeaForm';
import { TechnologyIdeaForm } from './components/forms/TechnologyIdeaForm';
import { HomeView } from './components/views/HomeView';
import { IdeasView } from './components/views/IdeasView';
import { BusinessFeedbackView } from './components/views/BusinessFeedbackView';
import { CommunityView } from './components/views/CommunityView';
import { InsightsView } from './components/views/InsightsView';
import { UserDashboard } from './components/views/UserDashboard';
import { OrgDashboard } from './components/views/OrgDashboard';
import { AdminPanel } from './components/views/AdminPanel';
import { useDarkMode } from './hooks/useDarkMode';

import { api, getStoredToken } from './services/api';
import {
  User,
  UserProfile,
  Topic,
  Opinion,
  Idea,
  Suggestion,
  BusinessFeedback,
  CommunityIdea,
  TechnologyIdea,
  Organization,
  DashboardStats,
  ContributionItem,
  AnalyticsData
} from './types';

export default function App() {
  // Dark Mode
  const { isDark, toggleDarkMode } = useDarkMode();

  // Session & User
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Navigation & Forms
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeForm, setActiveForm] = useState<ShareType | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalKey, setAuthModalKey] = useState(0);
  const [authIntentPrompt, setAuthIntentPrompt] = useState<string | null>(null);
  const [pendingFormType, setPendingFormType] = useState<ShareType | null>(null);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [logoutNotification, setLogoutNotification] = useState<string | null>(null);

  // Core Data
  const [topics, setTopics] = useState<Topic[]>([]);
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [businessFeedbacks, setBusinessFeedbacks] = useState<BusinessFeedback[]>([]);
  const [communityIdeas, setCommunityIdeas] = useState<CommunityIdea[]>([]);
  const [techIdeas, setTechIdeas] = useState<TechnologyIdea[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // User Dashboard State
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    opinionsShared: 0,
    ideasSubmitted: 0,
    ideasImplemented: 0,
    communityImpactScore: 0
  });
  const [myContributions, setMyContributions] = useState<ContributionItem[]>([]);

  // Public Analytics
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalOpinions: 0,
    totalIdeas: 0,
    totalSuggestions: 0,
    totalFeedback: 0,
    implementedIdeas: 0,
    opinionsByTopic: {},
    topReasonsForChange: {},
    categoryBreakdown: {}
  });

  const [loadingInitial, setLoadingInitial] = useState(true);

  // 1. Initial Load & Session Recovery
  useEffect(() => {
    loadAllData();
    checkAuthSession();
  }, []);

  // 2. Refresh dashboard when user or view changes
  useEffect(() => {
    if (user && currentView === 'dashboard') {
      loadUserDashboard();
    }
  }, [user, currentView]);

  const checkAuthSession = async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
        setProfile(res.profile);
      }
    } catch {
      // Token might be expired or invalid
    }
  };

  const loadAllData = async () => {
    try {
      const [
        top,
        ops,
        ids,
        sugs,
        biz,
        comm,
        tech,
        orgs,
        ins
      ] = await Promise.all([
        api.getTopics().catch(() => []),
        api.getOpinions().catch(() => []),
        api.getIdeas().catch(() => []),
        api.getSuggestions().catch(() => []),
        api.getBusinessFeedback().catch(() => []),
        api.getCommunityIdeas().catch(() => []),
        api.getTechnologyIdeas().catch(() => []),
        api.getOrganizations().catch(() => []),
        api.getInsights().catch(() => ({ analytics: null, recentOpinions: [], topIdeas: [] }))
      ]);

      setTopics(top);
      setOpinions(ops);
      setIdeas(ids);
      setSuggestions(sugs);
      setBusinessFeedbacks(biz);
      setCommunityIdeas(comm);
      setTechIdeas(tech);
      setOrganizations(orgs);
      if (ins.analytics) {
        setAnalytics(ins.analytics);
      }
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const loadUserDashboard = async () => {
    try {
      const data = await api.getDashboard();
      if (data) {
        setProfile(data.profile);
        setDashboardStats(data.stats);
        setMyContributions(data.myContributions);
      }
    } catch (err) {
      console.error('Failed to load user dashboard', err);
    }
  };

  const openAuthModal = (intent?: string | null, formType?: ShareType | null) => {
    setAuthModalKey(k => k + 1);
    setPendingFormType(formType || null);
    setAuthIntentPrompt(intent || null);
    setAuthModalOpen(true);
  };

  const promptLoginToShare = (type?: ShareType, message?: string) => {
    openAuthModal(
      message ||
      'Please verify your mobile number before sharing an idea, opinion, or feedback so your contribution is credited and protected.',
      type
    );
  };

  const handleAuthSuccess = (authUser: User, authProfile: UserProfile | null, isNewUser: boolean) => {
    setUser(authUser);
    setProfile(authProfile);
    if (isNewUser || !authProfile) {
      setOnboardingModalOpen(true);
    }
    loadAllData();
    loadUserDashboard();

    // If user attempted to share before logging in, route them directly to their desired form
    if (pendingFormType) {
      setActiveForm(pendingFormType);
      setCurrentView('form');
      setPendingFormType(null);
    }
    setAuthIntentPrompt(null);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout note:', e);
    }
    // Fully reset user session, auth modal, and in-memory caches
    setUser(null);
    setProfile(null);
    setDashboardStats({
      opinionsShared: 0,
      ideasSubmitted: 0,
      ideasImplemented: 0,
      communityImpactScore: 0
    });
    setMyContributions([]);
    setPendingFormType(null);
    setActiveForm(null);
    setAuthIntentPrompt(null);
    setAuthModalOpen(false);
    setAuthModalKey(k => k + 1);
    setOnboardingModalOpen(false);
    setRulesModalOpen(false);
    setCurrentView('home');

    // Display confirmation banner
    setLogoutNotification('Session ended. Login credentials and cached memory cleared successfully.');
    setTimeout(() => {
      setLogoutNotification(null);
    }, 4000);

    // Refresh public datasets
    loadAllData();
  };

  const handleOpenForm = (type: ShareType) => {
    if (!user) {
      promptLoginToShare(type, 'Please log in with your mobile number before sharing an idea, opinion, or feedback.');
      return;
    }
    setActiveForm(type);
    setCurrentView('form');
  };

  const handleFormSuccess = () => {
    setActiveForm(null);
    setCurrentView('dashboard');
    loadAllData();
    loadUserDashboard();
  };

  const handleFormCancel = () => {
    setActiveForm(null);
    setCurrentView('share');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={view => {
          setActiveForm(null);
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        profile={profile}
        onOpenAuth={() => openAuthModal()}
        onOpenProfile={() => setOnboardingModalOpen(true)}
        onLogout={handleLogout}
        onOpenRules={() => setRulesModalOpen(true)}
        isDark={isDark}
        onToggleDark={toggleDarkMode}
      />

      {/* Logout / Cache Clear Confirmation Banner */}
      {logoutNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium z-40 transition-all">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{logoutNotification}</span>
            </div>
            <button
              onClick={() => setLogoutNotification(null)}
              className="p-1 hover:bg-emerald-700 rounded-lg text-emerald-100 hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <HomeView
            opinions={opinions}
            ideas={ideas}
            analytics={analytics}
            onShareVoice={() => setCurrentView('share')}
            onExploreIdeas={() => setCurrentView('ideas')}
            onExploreInsights={() => setCurrentView('insights')}
            onSelectCategory={() => setCurrentView('share')}
          />
        )}

        {/* VIEW: SHARE SELECTOR */}
        {currentView === 'share' && (
          <ShareSelector
            onSelect={handleOpenForm}
            user={user}
            onOpenAuth={() => promptLoginToShare(undefined, 'Please log in with your mobile number before sharing an idea or opinion.')}
          />
        )}

        {/* VIEW: ACTIVE FORM */}
        {currentView === 'form' && activeForm && (
          <div>
            {activeForm === 'opinion' && (
              <OpinionForm
                topics={topics}
                profile={profile}
                user={user}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
                onOpenAuth={() => promptLoginToShare('opinion', 'Please sign in with your Google / Gmail account before submitting your opinion.')}
              />
            )}
            {activeForm === 'suggest_change' && (
              <SuggestChangeForm
                organizations={organizations}
                profile={profile}
                user={user}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
                onOpenAuth={() => promptLoginToShare('suggest_change', 'Please sign in with your Google / Gmail account before submitting your suggestion.')}
              />
            )}
            {activeForm === 'business_feedback' && (
              <BusinessFeedbackForm
                profile={profile}
                user={user}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
                onOpenAuth={() => promptLoginToShare('business_feedback', 'Please sign in with your Google / Gmail account before submitting business feedback.')}
              />
            )}
            {activeForm === 'community_idea' && (
              <CommunityIdeaForm
                profile={profile}
                user={user}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
                onOpenAuth={() => promptLoginToShare('community_idea', 'Please sign in with your Google / Gmail account before submitting your community idea.')}
              />
            )}
            {activeForm === 'technology_idea' && (
              <TechnologyIdeaForm
                profile={profile}
                user={user}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
                onOpenAuth={() => promptLoginToShare('technology_idea', 'Please sign in with your Google / Gmail account before submitting your technology idea.')}
              />
            )}
            {activeForm === 'personal_growth' && (
              <OpinionForm
                topics={topics}
                profile={profile}
                user={user}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
                onOpenAuth={() => promptLoginToShare('personal_growth', 'Please sign in with your Google / Gmail account before submitting your reflection.')}
              />
            )}
          </div>
        )}

        {/* VIEW: IDEAS MARKETPLACE & STATUS LIFECYCLE */}
        {currentView === 'ideas' && (
          <IdeasView
            ideas={ideas}
            onRefresh={loadAllData}
            onOpenSubmit={() => handleOpenForm('community_idea')}
            isAdminOrOrg={user?.role === 'admin' || user?.role === 'organization'}
          />
        )}

        {/* VIEW: BUSINESS & OUTLET FEEDBACK */}
        {currentView === 'business' && (
          <BusinessFeedbackView
            feedbacks={businessFeedbacks}
            onOpenSubmit={() => handleOpenForm('business_feedback')}
          />
        )}

        {/* VIEW: COMMUNITY & TECH */}
        {currentView === 'community' && (
          <CommunityView
            communityIdeas={communityIdeas}
            techIdeas={techIdeas}
            onOpenCommunitySubmit={() => handleOpenForm('community_idea')}
            onOpenTechSubmit={() => handleOpenForm('technology_idea')}
          />
        )}

        {/* VIEW: PUBLIC INSIGHTS */}
        {currentView === 'insights' && (
          <InsightsView
            analytics={analytics}
            opinions={opinions}
            ideas={ideas}
          />
        )}

        {/* VIEW: USER DASHBOARD */}
        {currentView === 'dashboard' && (
          <UserDashboard
            user={user}
            profile={profile}
            stats={dashboardStats}
            contributions={myContributions}
            onOpenProfile={() => setOnboardingModalOpen(true)}
            onShareOpinion={() => handleOpenForm('opinion')}
            onShareIdea={() => handleOpenForm('community_idea')}
            onLogout={handleLogout}
          />
        )}

        {/* VIEW: ORG & OUTLET DASHBOARD */}
        {currentView === 'org' && (
          <OrgDashboard
            organizations={organizations}
            feedbacks={businessFeedbacks}
            suggestions={suggestions}
          />
        )}

        {/* VIEW: ADMIN PANEL */}
        {currentView === 'admin' && (
          <AdminPanel analytics={analytics} />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        key={authModalKey}
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthIntentPrompt(null);
          setPendingFormType(null);
        }}
        onSuccess={handleAuthSuccess}
        intentPrompt={authIntentPrompt}
      />

      <OnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
        onProfileSaved={p => setProfile(p)}
        initialProfile={profile}
      />

      <RulesModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
      />
    </div>
  );
}
