import React from 'react';
import { motion } from 'motion/react';
import {
  MessageSquareQuote,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  Building,
  Store,
  Users,
  Layers
} from 'lucide-react';
import { Hero } from '../Hero';
import { Opinion, Idea, AnalyticsData } from '../../types';

interface HomeViewProps {
  opinions: Opinion[];
  ideas: Idea[];
  analytics: AnalyticsData;
  onShareVoice: () => void;
  onExploreIdeas: () => void;
  onExploreInsights: () => void;
  onSelectCategory: (cat: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  opinions,
  ideas,
  analytics,
  onShareVoice,
  onExploreIdeas,
  onExploreInsights,
  onSelectCategory
}) => {
  return (
    <div>
      {/* 1. Main Hero */}
      <Hero
        onShareOpinion={onShareVoice}
        onShareIdea={onExploreIdeas}
        onExploreInsights={onExploreInsights}
      />

      {/* 2. Audiences Grid: How Voice2Growth Empowers You */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            Universal Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2 font-display">
            Empowering Every Community Sector
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Whether you are a student suggesting a syllabus update or a customer improving an outlet, your voice reaches those with the power to act.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => onSelectCategory('School')}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Schools & Colleges
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Empower students and faculty to openly suggest teaching improvements, curriculum updates, and campus life enhancements.
            </p>
          </div>

          <div
            onClick={() => onSelectCategory('Professional')}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-cyan-500 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
              Professionals & Workplaces
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Help organizations understand employee sentiments, career friction points, and workplace wellness opportunities.
            </p>
          </div>

          <div
            onClick={() => onSelectCategory('Business / Outlet')}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              Businesses & Outlets
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Enable retail outlets and brands to receive direct, constructive feedback to elevate service, reduce wait times, and improve products.
            </p>
          </div>

          <div
            onClick={() => onSelectCategory('Community')}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              Communities & Society
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Surface high-impact ideas for public infrastructure, skill development, environmental sustainability, and neighborhood growth.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Perspective Evolution Showcase: "How Opinions Evolve" */}
      <div className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                The Anatomy of a Mindset Shift
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1 font-display">
                Real Opinions & Evolving Perspectives
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                See how personal experiences, education, and research help people grow.
              </p>
            </div>

            <button
              onClick={onShareVoice}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>+ Share What You Believe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opinions.slice(0, 3).map(op => (
              <div
                key={op.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-[11px]">
                    <span className="font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50">
                      {op.topic_name}
                    </span>
                    <span className="text-slate-400">
                      {op.visibility === 'anonymous' ? 'Anonymous Voice' : op.author_name || 'Member'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                    “{op.current_opinion}”
                  </h3>

                  {op.previous_opinion && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-600 block mb-0.5">Previous Belief:</span>
                      <p className="text-slate-500 italic">“{op.previous_opinion}”</p>
                    </div>
                  )}

                  {op.reasons_for_change && op.reasons_for_change.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {op.reasons_for_change.map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-100"
                        >
                          Shift Catalyst: {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Confidence Score: {op.confidence_score || 90}%</span>
                  <span>{new Date(op.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Innovation Pipeline Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
              From Opinion to Action
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3 font-display">
              Have an idea to improve a process, school, or business?
            </h2>
            <p className="text-sm text-white/85 mt-2 leading-relaxed">
              Submit your idea into the Innovation Marketplace. Organizations review, shortlist, and implement verified proposals directly.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreIdeas}
                className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Browse Innovation Marketplace
              </button>
              <button
                onClick={onShareVoice}
                className="px-5 py-3 bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
              >
                Submit An Idea Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-white font-bold text-sm">Voice2Growth</span>
            <span className="text-slate-600">|</span>
            <span>“Every Voice Can Create Change.”</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              MySQL Salted Identity & OTP Secured
            </span>
            <span>•</span>
            <span>Privacy First</span>
            <span>•</span>
            <span>Zero Tolerance for Hate Speech</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
