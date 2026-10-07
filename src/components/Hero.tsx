import React from 'react';
import { motion } from 'motion/react';
import {
  MessageSquareQuote,
  Lightbulb,
  BarChart3,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  GraduationCap,
  Store,
  Users
} from 'lucide-react';

interface HeroProps {
  onShareOpinion: () => void;
  onShareIdea: () => void;
  onExploreInsights: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onShareOpinion,
  onShareIdea,
  onExploreInsights
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background glowing ambient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Core Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-6 backdrop-blur-md shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Every Voice Can Create Change</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display text-white leading-tight"
        >
          Your Opinion. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Your Idea.</span> Your Impact.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal"
        >
          Share what you believe should change. Help individuals, businesses, outlets, organizations,
          and communities discover real opportunities for growth through constructive perspectives.
        </motion.p>

        {/* 4 Core Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left"
        >
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-emerald-400 text-xs font-bold block mb-1">01. Voice</span>
            <p className="text-xs text-slate-200 font-medium">“This is my opinion.”</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-teal-400 text-xs font-bold block mb-1">02. Need</span>
            <p className="text-xs text-slate-200 font-medium">“This is what I think should change.”</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-cyan-400 text-xs font-bold block mb-1">03. Rationale</span>
            <p className="text-xs text-slate-200 font-medium">“This is why I think it should change.”</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-emerald-300 text-xs font-bold block mb-1">04. Growth</span>
            <p className="text-xs text-slate-200 font-medium">“This is how my idea creates growth.”</p>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={onShareOpinion}
            className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Share Your Opinion</span>
          </button>

          <button
            onClick={onShareIdea}
            className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer backdrop-blur-sm"
          >
            <Lightbulb className="w-4 h-4 text-amber-300" />
            <span>Share an Idea</span>
          </button>

          <button
            onClick={onExploreInsights}
            className="px-6 py-3.5 rounded-xl text-slate-300 hover:text-white font-medium text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Explore Insights</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </motion.div>

        {/* User Categories Chips */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500 font-semibold mr-1 uppercase tracking-wider text-[10px]">
            Serving voices across:
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5 text-slate-300">
            <GraduationCap className="w-3 h-3 text-emerald-400" />
            Schools & Colleges
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5 text-slate-300">
            <Building className="w-3 h-3 text-cyan-400" />
            Professionals & Workplaces
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5 text-slate-300">
            <Store className="w-3 h-3 text-amber-400" />
            Businesses & Retail Outlets
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5 text-slate-300">
            <Users className="w-3 h-3 text-teal-400" />
            Communities & Citizens
          </span>
        </div>
      </div>
    </div>
  );
};
