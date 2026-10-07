import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User as UserIcon,
  Shield,
  Sparkles,
  Lightbulb,
  CheckCircle,
  Clock,
  Edit,
  PlusCircle,
  Lock,
  Mail,
  MessageSquareQuote,
  TrendingUp,
  Tag,
  LogOut
} from 'lucide-react';
import { User, UserProfile, DashboardStats, ContributionItem } from '../../types';

interface UserDashboardProps {
  user: User | null;
  profile: UserProfile | null;
  stats: DashboardStats;
  contributions: ContributionItem[];
  onOpenProfile: () => void;
  onShareOpinion: () => void;
  onShareIdea: () => void;
  onLogout?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  profile,
  stats,
  contributions,
  onOpenProfile,
  onShareOpinion,
  onShareIdea,
  onLogout
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredContributions = contributions.filter(c => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-display">
                  {profile?.display_name || 'Voice Contributor'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {profile?.category || 'Individual'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5">
                <span className="flex items-center gap-1">
                  {user?.email ? (
                    <>
                      <Mail className="w-3 h-3 text-emerald-400" />
                      <span>Gmail: {user.email}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>Mobile: {user?.mobile_number ? `${user.mobile_number.slice(0, 6)}••••` : 'Verified'}</span>
                    </>
                  )}
                </span>
                <span>•</span>
                <span>Age: {profile?.age_group || '18-24'}</span>
                <span>•</span>
                <span>City: {profile?.city || 'Not specified'}</span>
                {profile?.school_college_org && (
                  <>
                    <span>•</span>
                    <span>{profile.school_college_org}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/20 flex items-center gap-1.5 backdrop-blur-sm transition-all cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onShareOpinion}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Share Voice</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                title="End session and purge cache memory"
                className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-red-200 border border-red-400/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Opinions Shared</span>
            <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.opinionsShared}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Recorded securely</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Ideas Submitted</span>
            <Lightbulb className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.ideasSubmitted}</div>
          <span className="text-[11px] text-amber-600 font-medium">In review lifecycle</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Ideas Implemented</span>
            <CheckCircle className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.ideasImplemented}</div>
          <span className="text-[11px] text-cyan-600 font-medium">Tangible impact</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Community Score</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.communityImpactScore}</div>
          <span className="text-[11px] text-purple-600 font-medium">Points earned</span>
        </div>
      </div>

      {/* My Submissions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">My Submissions & Trackers</h2>
            <p className="text-xs text-slate-500">
              Track the progress of your submitted opinions, suggestions, and ideas.
            </p>
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'opinion', 'idea', 'suggestion', 'business_feedback'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                  filterType === type ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredContributions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">You haven't submitted any {filterType !== 'all' ? filterType : 'contributions'} yet.</p>
            <button
              onClick={onShareOpinion}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              Share your first opinion now →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredContributions.map(item => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {item.type.replace('_', ' ')}
                    </span>
                    {item.status && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.preview}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
                    Saved in MySQL
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
