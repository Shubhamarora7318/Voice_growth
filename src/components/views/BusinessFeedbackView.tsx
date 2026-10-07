import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Store,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  PlusCircle,
  Search,
  CheckCircle2
} from 'lucide-react';
import { BusinessFeedback } from '../../types';

interface BusinessFeedbackViewProps {
  feedbacks: BusinessFeedback[];
  onOpenSubmit: () => void;
}

export const BusinessFeedbackView: React.FC<BusinessFeedbackViewProps> = ({
  feedbacks,
  onOpenSubmit
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Retail & Supermarket', 'Food & Restaurant', 'Healthcare & Pharmacy', 'Apparel & Lifestyle'];

  const filtered = feedbacks.filter(fb => {
    const matchesCat = categoryFilter === 'All' || fb.category === categoryFilter;
    const matchesSearch =
      !search.trim() ||
      fb.business_name.toLowerCase().includes(search.toLowerCase()) ||
      fb.outlet_name.toLowerCase().includes(search.toLowerCase()) ||
      fb.location.toLowerCase().includes(search.toLowerCase()) ||
      fb.growth_suggestion.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            Outlets & Businesses
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
            Customer Voice & Outlet Growth
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Honest feedback and actionable customer suggestions to help retail stores, branches, and service outlets grow.
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="self-start md:self-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Outlet Feedback</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search brand, outlet, city..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(fb => (
          <motion.div
            key={fb.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{fb.business_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700">{fb.outlet_name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {fb.location}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {fb.category}
                </span>
              </div>

              {/* Liked & Disliked */}
              <div className="space-y-2 mt-4 text-xs">
                {fb.what_liked && (
                  <div className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-900">What went well: </span>
                      <span className="text-slate-700">{fb.what_liked}</span>
                    </div>
                  </div>
                )}

                {fb.what_should_improve && (
                  <div className="flex items-start gap-2 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                    <ThumbsDown className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-900">Needs improvement: </span>
                      <span className="text-slate-700">{fb.what_should_improve}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Growth Suggestion */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  <span>Growth Opportunity</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {fb.growth_suggestion}
                </p>
              </div>

              {/* Impact chips */}
              {fb.business_impact && fb.business_impact.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {fb.business_impact.map((imp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600"
                    >
                      ✓ {imp}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{fb.is_anonymous ? 'Anonymous Customer' : fb.author_name || 'Verified Customer'}</span>
              <span className="text-[11px] text-slate-400">
                {new Date(fb.created_at).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
