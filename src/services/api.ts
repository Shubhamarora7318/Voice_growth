import {
  User,
  UserProfile,
  Topic,
  Opinion,
  Suggestion,
  Idea,
  BusinessFeedback,
  CommunityIdea,
  TechnologyIdea,
  DashboardStats,
  ContributionItem,
  AnalyticsData,
  Organization,
  IdeaStatus
} from '../types';

const TOKEN_KEY = 'v2g_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Clears all client-side session tokens, session storage, and browser cache memory.
 */
export async function clearClientSessionCache(): Promise<void> {
  // 1. Clear local auth token
  clearStoredToken();

  // 2. Clear all session storage memory
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
  } catch (err) {
    console.warn('Unable to clear sessionStorage:', err);
  }

  // 3. Purge browser Cache API storage (Service Worker and fetch caches)
  try {
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map(name => window.caches.delete(name)));
    }
  } catch (err) {
    console.warn('Unable to clear CacheStorage:', err);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Network request failed');
  }

  return data;
}

export const api = {
  // Auth
  getGoogleConfig: () =>
    request<{ clientId: string; isConfigured: boolean; appUrl: string }>('/api/auth/google/config'),

  googleAuth: (payload: { credential?: string; accessToken?: string }) =>
    request<{ success: boolean; token: string; user: User; profile: UserProfile | null; isNewUser: boolean }>(
      '/api/auth/google',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),

  sendOtp: (params: { email?: string; mobileNumber?: string } | string) => {
    const body = typeof params === 'string'
      ? (params.includes('@') ? { email: params } : { mobileNumber: params })
      : params;

    return request<{
      success: boolean;
      message: string;
      expiresInSeconds?: number;
      devOtp?: string;
      cooldownRemaining?: number;
      emailSent?: boolean;
      smsSent?: boolean;
      provider?: string;
      emailNotice?: string;
      smsNotice?: string;
    }>(
      '/api/auth/send-otp',
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    );
  },

  verifyOtp: (params: { email?: string; mobileNumber?: string; otp: string } | { identifier: string; otp: string }, maybeOtp?: string) => {
    let body: { email?: string; mobileNumber?: string; otp: string };

    if (typeof params === 'string' && maybeOtp) {
      body = (params as string).includes('@')
        ? { email: params, otp: maybeOtp }
        : { mobileNumber: params, otp: maybeOtp };
    } else if ('identifier' in params) {
      body = (params as any).identifier.includes('@')
        ? { email: (params as any).identifier, otp: (params as any).otp }
        : { mobileNumber: (params as any).identifier, otp: (params as any).otp };
    } else {
      body = params as { email?: string; mobileNumber?: string; otp: string };
    }

    return request<{ success: boolean; token: string; user: User; profile: UserProfile | null; isNewUser: boolean }>(
      '/api/auth/verify-otp',
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    );
  },

  getMe: () => request<{ user: User; profile: UserProfile | null }>('/api/auth/me'),

  logout: async () => {
    try {
      await request('/api/auth/logout', {
        method: 'POST',
        cache: 'no-store'
      });
    } catch (e) {
      console.warn('Backend logout request note:', e);
    } finally {
      await clearClientSessionCache();
    }
  },

  // Profile
  getProfile: () => request<UserProfile | null>('/api/profile'),
  saveProfile: (profileData: Partial<UserProfile>) =>
    request<{ success: boolean; profile: UserProfile }>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    }),

  // Topics
  getTopics: () => request<Topic[]>('/api/topics'),
  createTopic: (topic: Partial<Topic>) =>
    request<Topic>('/api/topics', {
      method: 'POST',
      body: JSON.stringify(topic)
    }),

  // Opinions
  getOpinions: () => request<Opinion[]>('/api/opinions'),
  createOpinion: (data: Partial<Opinion>) =>
    request<{ success: boolean; opinion: Opinion }>('/api/opinions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteOpinion: (id: string) =>
    request<{ success: boolean }>(`/api/opinions/${id}`, { method: 'DELETE' }),

  // Suggestions
  getSuggestions: () => request<Suggestion[]>('/api/suggestions'),
  createSuggestion: (data: Partial<Suggestion>) =>
    request<{ success: boolean; suggestion: Suggestion }>('/api/suggestions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Ideas
  getIdeas: () => request<Idea[]>('/api/ideas'),
  createIdea: (data: Partial<Idea>) =>
    request<{ success: boolean; idea: Idea }>('/api/ideas', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateIdeaStatus: (id: string, status: IdeaStatus, notes?: string) =>
    request<{ success: boolean; idea: Idea }>(`/api/ideas/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    }),

  // Business Feedback
  getBusinessFeedback: () => request<BusinessFeedback[]>('/api/business-feedback'),
  createBusinessFeedback: (data: Partial<BusinessFeedback>) =>
    request<{ success: boolean; feedback: BusinessFeedback }>('/api/business-feedback', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Community Ideas
  getCommunityIdeas: () => request<CommunityIdea[]>('/api/community-ideas'),
  createCommunityIdea: (data: Partial<CommunityIdea>) =>
    request<{ success: boolean; item: CommunityIdea }>('/api/community-ideas', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Technology Ideas
  getTechnologyIdeas: () => request<TechnologyIdea[]>('/api/technology-ideas'),
  createTechnologyIdea: (data: Partial<TechnologyIdea>) =>
    request<{ success: boolean; item: TechnologyIdea }>('/api/technology-ideas', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Organizations
  getOrganizations: () => request<Organization[]>('/api/organizations'),

  // Dashboards
  getDashboard: () =>
    request<{
      profile: UserProfile | null;
      stats: DashboardStats;
      myContributions: ContributionItem[];
    }>('/api/dashboard'),

  getInsights: () =>
    request<{
      analytics: AnalyticsData;
      recentOpinions: Opinion[];
      topIdeas: Idea[];
    }>('/api/insights'),

  // Admin
  getAdminAnalytics: () => request<AnalyticsData>('/api/admin/analytics'),
  getAdminUsers: () => request<any[]>('/api/admin/users'),
  getAuditLogs: () => request<any[]>('/api/admin/audit-logs'),

  // Reports
  reportContent: (target_type: string, target_id: string, reason: string, details?: string) =>
    request<{ success: boolean }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ target_type, target_id, reason, details })
    })
};
