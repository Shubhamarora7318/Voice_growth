import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Store,
  GraduationCap,
  ThumbsDown,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare
} from 'lucide-react';
import { Organization, BusinessFeedback, Suggestion } from '../../types';

interface OrgDashboardProps {
  organizations: Organization[];
  feedbacks: BusinessFeedback[];
  suggestions: Suggestion[];
}

export const OrgDashboard: React.FC<OrgDashboardProps> = ({
  organizations,
  feedbacks,
  suggestions
}) => {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(organizations[0]?.id || '');

  const activeOrg = organizations.find(o => o.id === selectedOrgId) || organizations[0];

  const orgFeedbacks = feedbacks.filter(
    f => f.business_name.toLowerCase().includes(activeOrg?.name.toLowerCase()) || activeOrg?.category === 'Business / Outlet'
  );

  const orgSuggestions = suggestions.filter(
    s => s.target_organization_name.toLowerCase().includes(activeOrg?.name.toLowerCase()) || !s.target_organization_id
  );

  const handleExportCSV = () => {
    const rows = [
      ['Type', 'Name', 'Detail', 'Suggested Action', 'Date'],
      ...orgFeedbacks.map(f => ['Customer Feedback', f.business_name, f.what_should_improve, f.growth_suggestion, f.created_at]),
      ...orgSuggestions.map(s => ['Stakeholder Suggestion', s.title, s.what_should_change, s.implementation_plan, s.created_at])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(i => `"${(i || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeOrg?.name || 'Organization'}_Voice2Growth_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
            Institutional Stakeholder Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
            Organization & Outlet Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review candid student, customer, employee, and citizen feedback directed at your institution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedOrgId}
            onChange={e => setSelectedOrgId(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.category})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold mb-1">Feedback & Suggestion Volume</div>
          <div className="text-2xl font-black text-slate-900">{orgFeedbacks.length + orgSuggestions.length}</div>
          <span className="text-[11px] text-indigo-600 font-medium">Logged for this entity</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold mb-1">Top Requested Focus</div>
          <div className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
            Customer Experience & Digital Processes
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Primary improvement theme</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold mb-1">Target Beneficiaries</div>
          <div className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
            Students, Shoppers & Staff
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Key constituent group</span>
        </div>
      </div>

      {/* Split Columns: Direct Feedback & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer / Citizen Feedback */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-600" />
              <span>Candid Outlet & Service Insights ({orgFeedbacks.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {orgFeedbacks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No customer feedback logged yet for this location.
              </p>
            ) : (
              orgFeedbacks.map(fb => (
                <div key={fb.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{fb.outlet_name}</span>
                    <span className="text-slate-400">{new Date(fb.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="text-xs">
                    <span className="font-semibold text-rose-800">Identified Friction: </span>
                    <span className="text-slate-700">{fb.what_should_improve}</span>
                  </div>

                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                    <span className="font-bold text-amber-900 block mb-0.5">Proposed Growth Action:</span>
                    <span className="text-slate-800">{fb.growth_suggestion}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Change Suggestions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-teal-600" />
              <span>Institutional Change Proposals ({orgSuggestions.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {orgSuggestions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No structured proposals submitted yet.
              </p>
            ) : (
              orgSuggestions.map(s => (
                <div key={s.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{s.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                      In Review
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Change: </span>
                    {s.what_should_change}
                  </p>

                  <div className="text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                    <span className="font-semibold text-slate-800">Implementation Plan: </span>
                    {s.implementation_plan}
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
