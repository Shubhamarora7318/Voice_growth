import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Users,
  Lightbulb,
  Building,
  GraduationCap,
  Store,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { AnalyticsData, Opinion, Idea } from '../../types';

interface InsightsViewProps {
  analytics: AnalyticsData;
  opinions: Opinion[];
  ideas: Idea[];
}

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

export const InsightsView: React.FC<InsightsViewProps> = ({
  analytics,
  opinions,
  ideas
}) => {
  const [activeSegment, setActiveSegment] = useState<string>('All');

  const topicChartData = Object.entries(analytics.opinionsByTopic || {}).map(([topic, count]) => ({
    name: topic.length > 18 ? topic.slice(0, 16) + '...' : topic,
    fullName: topic,
    count
  }));

  const factorChartData = Object.entries(analytics.topReasonsForChange || {}).map(([factor, count]) => ({
    name: factor,
    count
  }));

  const categoryPieData = Object.entries(analytics.categoryBreakdown || {}).map(([cat, count]) => ({
    name: cat,
    value: count
  }));

  const implementedIdeas = ideas.filter(i => i.status === 'Implemented');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Headline */}
      <div className="mb-8">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800">
          Aggregated Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
          Public Insights & Trends
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore what people care about most, how societal opinions transform, and which ideas are being implemented.
        </p>
      </div>

      {/* Top Stat Banners */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Total Opinions</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{analytics.totalOpinions}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Captured candidly</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Solutions Proposed</span>
            <Lightbulb className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{analytics.totalIdeas}</div>
          <span className="text-[11px] text-amber-600 font-medium">In innovation pipeline</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Implemented Ideas</span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{analytics.implementedIdeas}</div>
          <span className="text-[11px] text-cyan-600 font-medium">Real-world impact</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Participating Voices</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{analytics.totalUsers}</div>
          <span className="text-[11px] text-purple-600 font-medium">Verified mobile profiles</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Chart 1: What topics people care about most */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              What Topics People Care About Most
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Volume of opinions and change suggestions submitted across primary topic domains.
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Submissions`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Reasons Why Opinions Change */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Key Catalysts That Shift Human Beliefs
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              What causes individuals to evolve their opinions over time?
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={factorChartData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Responses`, 'Citations']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sector Breakdown & Implemented Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Participation by Audience Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Audience Category Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Distribution of verified contributors.
            </p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real Implemented Growth Stories */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ideas That Successfully Reached Implementation
              </h3>
              <p className="text-xs text-slate-500">
                Witnessing the transition from opinion to tangible institutional action.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Verified Outcomes
            </span>
          </div>

          <div className="space-y-3">
            {implementedIdeas.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Ideas currently transitioning through review and shortlisting phases.
              </p>
            ) : (
              implementedIdeas.slice(0, 3).map(idea => (
                <div
                  key={idea.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Implemented
                      </span>
                      <span className="text-[11px] font-bold text-slate-800">{idea.category}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{idea.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{idea.expected_impact}</p>
                  </div>
                  <div className="shrink-0 text-right sm:border-l sm:border-slate-200 sm:pl-4">
                    <span className="text-[10px] text-slate-400 block">Upvotes</span>
                    <span className="text-sm font-bold text-emerald-700">{idea.votes_count || 12}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
