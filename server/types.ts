export type UserRole = 'user' | 'org_admin' | 'admin';

export type UserCategory =
  | 'Individual'
  | 'School'
  | 'College'
  | 'Professional'
  | 'Business / Outlet'
  | 'Community'
  | 'Other';

export type IdeaStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'In Discussion'
  | 'Accepted'
  | 'Implemented';

export interface User {
  id: string;
  email?: string;
  mobile_number?: string;
  google_id?: string;
  is_verified: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  age_group: string;
  category: UserCategory;
  custom_category?: string;
  city: string;
  school_college_org?: string;
  profession?: string;
  avatar_url?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface OtpRecord {
  id: string;
  target: string; // Email address or mobile number
  mobile_number?: string;
  email?: string;
  otp_hash: string;
  salt: string;
  attempts: number;
  max_attempts: number;
  expires_at: number;
  verified_at?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  category: 'School' | 'College' | 'Business' | 'Outlet' | 'Community' | 'Organization';
  location: string;
  description: string;
  contact_email: string;
  is_verified: boolean;
  created_at: string;
}

export interface Topic {
  id: string;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
}

export interface Opinion {
  id: string;
  user_id: string;
  topic_id: string;
  topic_name: string;
  current_opinion: string;
  previous_opinion?: string;
  was_different: 'Yes' | 'No' | 'Not Sure';
  reasons_for_change: string[];
  explanation_for_change?: string;
  confidence_score: number;
  visibility: 'public' | 'anonymous';
  status: 'published' | 'under_review' | 'flagged';
  author_name?: string;
  author_category?: string;
  author_city?: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  target_organization_id?: string;
  target_organization_name?: string;
  what_should_change: string;
  why_change: string;
  beneficiaries: string;
  implementation_plan: string;
  expected_impact: string;
  status: IdeaStatus;
  visibility: 'public' | 'anonymous';
  author_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  category: string;
  title: string;
  problem_description: string;
  proposed_solution: string;
  target_audience: string;
  expected_benefit: string;
  expected_impact: string;
  required_resources?: string;
  status: IdeaStatus;
  visibility: 'public' | 'anonymous';
  author_name?: string;
  status_history: {
    status: IdeaStatus;
    notes?: string;
    updated_at: string;
    updated_by: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface BusinessFeedback {
  id: string;
  user_id: string;
  business_name: string;
  outlet_name: string;
  category: string;
  location: string;
  what_liked: string;
  what_disliked: string;
  what_should_improve: string;
  what_introduce: string;
  growth_suggestion: string;
  business_impact: string[];
  status: 'Received' | 'Reviewed' | 'Action Planned' | 'Resolved';
  visibility: 'public' | 'anonymous';
  author_name?: string;
  created_at: string;
}

export interface CommunityIdea {
  id: string;
  user_id: string;
  topic_category: string;
  problem: string;
  proposed_solution: string;
  target_community: string;
  expected_benefit: string;
  required_resources: string;
  expected_impact: string;
  status: IdeaStatus;
  visibility: 'public' | 'anonymous';
  author_name?: string;
  created_at: string;
}

export interface TechnologyIdea {
  id: string;
  user_id: string;
  problem: string;
  current_process: string;
  proposed_technology: string;
  automation_opportunity: string;
  expected_benefit: string;
  estimated_complexity: 'Low' | 'Medium' | 'High' | 'Enterprise';
  status: IdeaStatus;
  visibility: 'public' | 'anonymous';
  author_name?: string;
  created_at: string;
}

export interface UserConsent {
  id: string;
  user_id: string;
  keep_anonymous: boolean;
  allow_public_display: boolean;
  allow_aggregated_insights: boolean;
  agreed_to_rules: boolean;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export interface ContentReport {
  id: string;
  reporter_user_id: string;
  target_type: 'opinion' | 'idea' | 'suggestion' | 'user';
  target_id: string;
  reason: string;
  details: string;
  status: 'Pending' | 'Reviewed' | 'Dismissed' | 'Action Taken';
  created_at: string;
}
