import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Sparkles,
  Cpu,
  Compass,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { CommunityIdea, TechnologyIdea } from '../../types';

interface CommunityViewProps {
  communityIdeas: CommunityIdea[];
  techIdeas: TechnologyIdea[];
  onOpenCommunitySubmit: () => void;
  onOpenTechSubmit: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  communityIdeas,
  techIdeas,
  onOpenCommunitySubmit,
  onOpenTechSubmit
}) => {
  const [subTab, setSubTab] = useState<'community' | 'tech'>('community');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
            Societal & Technological Growth
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
            Community & Technology Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Grassroots civic improvements, skill growth initiatives, and digital automation ideas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCommunitySubmit}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Community Idea</span>
          </button>
          <button
            onClick={onOpenTechSubmit}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>+ Tech Idea</span>
          </button>
        </div>
      </div>

      {/* Sub-tab switcher */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSubTab('community')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
            subTab === 'community'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Community Initiatives ({communityIdeas.length})</span>
        </button>
        <button
          onClick={() => setSubTab('tech')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
            subTab === 'tech'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Technology & Automation Ideas ({techIdeas.length})</span>
        </button>
      </div>

      {/* Community Tab Content */}
      {subTab === 'community' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communityIdeas.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Target: {item.target_community}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {item.problem}
                </h3>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-blue-900 block mb-0.5">Proposed Solution:</span>
                  {item.proposed_solution}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-slate-400 block">Expected Benefit</span>
                    <span className="font-semibold text-slate-800">{item.expected_benefit}</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg">
                    <span className="text-emerald-700 block">Expected Impact</span>
                    <span className="font-semibold text-emerald-900">{item.expected_impact}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{item.is_anonymous ? 'Anonymous Citizen' : 'Local Contributor'}</span>
                <span className="text-[11px] text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tech Tab Content */}
      {subTab === 'tech' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {techIdeas.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    Complexity: {item.estimated_complexity}
                  </span>
                  <span className="text-[11px] text-purple-700 font-semibold">
                    Automation Opportunity
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {item.proposed_technology}
                </h3>
                <p className="text-xs text-slate-500 mb-3">{item.problem}</p>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-0.5">Current Manual Process:</span>
                    <span className="text-slate-600">{item.current_process}</span>
                  </div>
                  <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="font-bold text-purple-900 block mb-0.5">Automated Solution:</span>
                    <span className="text-slate-700">{item.automation_opportunity}</span>
                  </div>
                </div>

                <div className="mt-4 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                  <span className="font-bold text-emerald-900 block">Expected Efficiency Gain:</span>
                  <span className="text-emerald-800">{item.expected_benefit}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{item.is_anonymous ? 'Anonymous Innovator' : 'Tech Contributor'}</span>
                <span className="text-[11px] text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
