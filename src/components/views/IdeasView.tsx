import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lightbulb,
  ThumbsUp,
  MessageCircle,
  Tag,
  Clock,
  CheckCircle,
  Search,
  Filter,
  PlusCircle,
  TrendingUp,
  User
} from 'lucide-react';
import { Idea, IdeaStatus } from '../../types';
import { api } from '../../services/api';

interface IdeasViewProps {
  ideas: Idea[];
  onRefresh: () => void;
  onOpenSubmit: () => void;
  isAdminOrOrg: boolean;
}

const STATUS_CONFIG: Record<IdeaStatus, { label: string; bg: string; text: string; border: string }> = {
  Submitted: { label: 'Submitted', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Under Review': { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'In Discussion': { label: 'In Discussion', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Shortlisted: { label: 'Shortlisted', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  Accepted: { label: 'Accepted', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Implemented: { label: 'Implemented', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
};

export const IdeasView: React.FC<IdeasViewProps> = ({
  ideas,
  onRefresh,
  onOpenSubmit,
  isAdminOrOrg
}) => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statuses: (IdeaStatus | 'All')[] = [
    'All',
    'Submitted',
    'Under Review',
    'In Discussion',
    'Shortlisted',
    'Accepted',
    'Implemented'
  ];

  const filteredIdeas = ideas.filter(idea => {
    const matchesTab = activeTab === 'All' || idea.status === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.problem_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.proposed_solution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleUpvote = (id: string) => {
    setUpvotedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusChange = async (id: string, newStatus: IdeaStatus) => {
    setUpdatingId(id);
    try {
      await api.updateIdeaStatus(id, newStatus, `Updated via Marketplace dashboard`);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
              Innovation Marketplace
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-500">
              {ideas.length} Collective Ideas
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Ideas That Create Growth
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse proposed solutions across education, business, community, and technology. Track idea status from submission to implementation.
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="self-start md:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Propose an Idea</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statuses.map(st => {
            const count = st === 'All' ? ideas.length : ideas.filter(i => i.status === st).length;
            const isSelected = activeTab === st;
            return (
              <button
                key={st}
                onClick={() => setActiveTab(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{st}</span>
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ideas, problem..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">No ideas found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search criteria or submit a new idea.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIdeas.map(idea => {
            const statusStyle = STATUS_CONFIG[idea.status] || STATUS_CONFIG['Submitted'];
            const isUpvoted = upvotedIds[idea.id];
            const upvotesCount = (idea.votes_count || 0) + (isUpvoted ? 1 : 0);

            return (
              <motion.div
                key={idea.id}
                layout
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-500" />
                      {idea.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {statusStyle.label}
                      </span>

                      {/* Admin / Org Status changer */}
                      {isAdminOrOrg && (
                        <select
                          value={idea.status}
                          disabled={updatingId === idea.id}
                          onChange={e => handleStatusChange(idea.id, e.target.value as IdeaStatus)}
                          className="text-[10px] bg-slate-100 border border-slate-200 rounded px-1 py-0.5 font-semibold text-slate-700 focus:outline-none"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="In Discussion">In Discussion</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Implemented">Implemented</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {idea.title}
                  </h3>

                  {/* Problem & Solution */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">Problem: </span>
                      <span className="text-slate-600">{idea.problem_description}</span>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-800">Proposed Solution: </span>
                      <span className="text-slate-700">{idea.proposed_solution}</span>
                    </div>
                  </div>

                  {/* Beneficiaries & Impact tags */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-400 block font-medium">Target Audience</span>
                      <span className="font-semibold text-slate-700">{idea.target_audience}</span>
                    </div>
                    <div className="bg-emerald-50/60 p-2 rounded-lg">
                      <span className="text-emerald-700 block font-medium">Expected Benefit</span>
                      <span className="font-semibold text-emerald-950">{idea.expected_benefit}</span>
                    </div>
                  </div>
                </div>

                {/* Footer attribution & votes */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <User className="w-3.5 h-3.5" />
                    <span>
                      {idea.is_anonymous ? 'Anonymous Voice' : idea.author_name || 'Community Member'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpvote(idea.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isUpvoted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{upvotesCount}</span>
                    </button>

                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{idea.comments_count || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
