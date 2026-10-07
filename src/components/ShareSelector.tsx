import React from 'react';
import { motion } from 'motion/react';
import {
  MessageSquareQuote,
  Sparkles,
  Store,
  Users,
  Cpu,
  Compass,
  ArrowRight,
  Lock,
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { User } from '../types';

export type ShareType =
  | 'opinion'
  | 'suggest_change'
  | 'business_feedback'
  | 'community_idea'
  | 'technology_idea'
  | 'personal_growth';

interface ShareSelectorProps {
  onSelect: (type: ShareType) => void;
  user?: User | null;
  onOpenAuth?: () => void;
}

export const SHARE_OPTIONS: {
  id: ShareType;
  title: string;
  subtitle: string;
  tagline: string;
  icon: any;
  color: string;
  badge: string;
}[] = [
  {
    id: 'opinion',
    title: 'My Opinion',
    subtitle: 'Share your personal viewpoint about a topic.',
    tagline: 'Express how your perspective evolved and what shaped your belief.',
    icon: MessageSquareQuote,
    color: 'emerald',
    badge: 'Perspective'
  },
  {
    id: 'suggest_change',
    title: 'Suggest a Change',
    subtitle: 'Tell us what you believe should be improved.',
    tagline: 'Structured 5-step change framework: Why, Who benefits, Implementation, and Impact.',
    icon: Sparkles,
    color: 'teal',
    badge: 'Structured Action'
  },
  {
    id: 'business_feedback',
    title: 'Business / Outlet Feedback',
    subtitle: 'Help an outlet or business understand what customers need.',
    tagline: 'Directly reached by outlet managers to elevate customer experience and service.',
    icon: Store,
    color: 'amber',
    badge: 'Retail & Service'
  },
  {
    id: 'community_idea',
    title: 'Community Idea',
    subtitle: 'Share an idea that could help your community grow.',
    tagline: 'Civic spaces, youth initiatives, local environment, and neighborhood growth.',
    icon: Users,
    color: 'blue',
    badge: 'Civic Growth'
  },
  {
    id: 'technology_idea',
    title: 'Technology Idea',
    subtitle: 'Suggest technology, automation, or digital improvements.',
    tagline: 'Transform repetitive workflows into digital, automated, or AI-assisted solutions.',
    icon: Cpu,
    color: 'purple',
    badge: 'Innovation'
  },
  {
    id: 'personal_growth',
    title: 'Personal Growth',
    subtitle: 'Share an experience or idea that could help others learn and grow.',
    tagline: 'Lessons from mentors, careers, challenges, and lifelong skills.',
    icon: Compass,
    color: 'indigo',
    badge: 'Learning'
  }
];

export const ShareSelector: React.FC<ShareSelectorProps> = ({
  onSelect,
  user,
  onOpenAuth
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border dark:border-emerald-800/60">
          Selection Hub
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2 font-display">
          What Do You Want to Share?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Select a path below to contribute your voice. Every response is captured without judgment
          and routed to empower people, institutions, or communities.
        </p>
      </div>

      {/* Login Prompt Banner when user is unauthenticated */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Login Required Before Sharing
                </h4>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
                  Step 1 of 2
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Please verify your mobile number before sharing an idea, opinion, or feedback. A verified account ensures your contribution is credited, tracked in your personal dashboard, and protected against spam.
              </p>
            </div>
          </div>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="shrink-0 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Verify Mobile & Login First</span>
            </button>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHARE_OPTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(item.id)}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-600 text-slate-700 dark:text-slate-300 group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:group-hover:bg-emerald-950/60 dark:group-hover:text-emerald-300 transition-colors">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  {item.subtitle}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {item.tagline}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                {user ? (
                  <>
                    <span>Start Submission</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Login to Share</span>
                    </span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-amber-600 dark:text-amber-400" />
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
