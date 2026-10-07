import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Sparkles, HelpCircle, Building, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { Organization, User, UserProfile } from '../../types';

interface SuggestChangeFormProps {
  organizations: Organization[];
  profile: UserProfile | null;
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
  onOpenAuth: () => void;
}

export const SuggestChangeForm: React.FC<SuggestChangeFormProps> = ({
  organizations,
  profile,
  user,
  onSuccess,
  onCancel,
  onOpenAuth
}) => {
  const [targetOrgId, setTargetOrgId] = useState(organizations[0]?.id || '');
  const [customOrgName, setCustomOrgName] = useState('');
  const [title, setTitle] = useState('');
  const [whatShouldChange, setWhatShouldChange] = useState('');
  const [whyChange, setWhyChange] = useState('');
  const [beneficiaries, setBeneficiaries] = useState('');
  const [implementationPlan, setImplementationPlan] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(profile?.is_anonymous ?? false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyExample = () => {
    setTitle('Implement Dynamic QR Attendance System in Classrooms');
    setWhatShouldChange('Replace 15-minute manual roll calls with a dynamic rotating QR scan on the projector at lecture start.');
    setWhyChange('Students and faculty lose ~15% of instructional lecture time to manual roll calling.');
    setBeneficiaries('Students, Lecturers, Department Deans, Academic Counselors');
    setImplementationPlan('Display a timed, rotating QR code on lecture screen scanned via student campus app with geofencing.');
    setExpectedImpact('Reclaims 12 instructional hours per semester per student and delivers real-time attendance analytics.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in with your mobile number before submitting your suggestion.');
      onOpenAuth();
      return;
    }

    if (!whatShouldChange.trim() || !whyChange.trim() || !beneficiaries.trim()) {
      setError('Please fill out what should change, why, and who benefits.');
      return;
    }

    setLoading(true);
    setError(null);

    const targetOrg = organizations.find(o => o.id === targetOrgId);
    const orgName = customOrgName.trim() || targetOrg?.name || 'General Community / Outlet';

    try {
      await api.createSuggestion({
        title: title.trim() || whatShouldChange.slice(0, 60),
        target_organization_id: targetOrgId || undefined,
        target_organization_name: orgName,
        what_should_change: whatShouldChange.trim(),
        why_change: whyChange.trim(),
        beneficiaries: beneficiaries.trim(),
        implementation_plan: implementationPlan.trim() || 'Collaborative review with stakeholders',
        expected_impact: expectedImpact.trim() || 'Improved efficiency and stakeholder satisfaction',
        visibility: isAnonymous ? 'anonymous' : 'public'
      });

      confetti({ particleCount: 65, spread: 55 });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit suggestion.');
      if (err.message?.includes('Unauthorized')) {
        onOpenAuth();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hub</span>
        </button>

        <button
          type="button"
          onClick={handleApplyExample}
          className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example Workflow</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-100">
        <div className="mb-6">
          <span className="text-[11px] font-bold tracking-wider uppercase text-teal-600">
            Structured 5-Step Framework
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
            Suggest a Change
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Focus on clarity, evidence, and beneficiaries. The workflow guides organizations directly to execution.
          </p>
        </div>

        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                You are browsing as a guest. Please log in with your mobile number to submit your suggestion.
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Log In First
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target Organization */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Who is this change for? (Organization / Outlet / School / College)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={targetOrgId}
                  onChange={e => setTargetOrgId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">-- Select Registered Institution/Outlet --</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.category})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={customOrgName}
                  onChange={e => setCustomOrgName(e.target.value)}
                  placeholder="Or enter specific outlet/entity name..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Title of Suggestion
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Modernize student attendance via dynamic QR"
              required
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium text-slate-800"
            />
          </div>

          {/* 1. What Should Change */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center">1</span>
              <label className="text-xs font-bold text-slate-800">What should change?</label>
            </div>
            <textarea
              rows={3}
              value={whatShouldChange}
              onChange={e => setWhatShouldChange(e.target.value)}
              placeholder="Describe the current pain point and what should be altered..."
              required
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
            />
          </div>

          {/* 2. Why Should It Change */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center">2</span>
              <label className="text-xs font-bold text-slate-800">Why should it change?</label>
            </div>
            <textarea
              rows={3}
              value={whyChange}
              onChange={e => setWhyChange(e.target.value)}
              placeholder="Explain the inefficiency, problem, or root rationale..."
              required
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
            />
          </div>

          {/* 3. Who Would Benefit */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center">3</span>
              <label className="text-xs font-bold text-slate-800">Who would benefit?</label>
            </div>
            <input
              type="text"
              value={beneficiaries}
              onChange={e => setBeneficiaries(e.target.value)}
              placeholder="e.g. Students + Teachers + Campus Administration"
              required
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
            />
          </div>

          {/* 4. How Could It Be Implemented */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center">4</span>
              <label className="text-xs font-bold text-slate-800">How could it be implemented?</label>
            </div>
            <textarea
              rows={3}
              value={implementationPlan}
              onChange={e => setImplementationPlan(e.target.value)}
              placeholder="Outline steps, tools, or pilot approaches..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
            />
          </div>

          {/* 5. What Impact Could It Create */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center">5</span>
              <label className="text-xs font-bold text-slate-800">What impact could it create?</label>
            </div>
            <textarea
              rows={3}
              value={expectedImpact}
              onChange={e => setExpectedImpact(e.target.value)}
              placeholder="Quantifiable or qualitative positive change (e.g. saves hours, improves retention)..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
            />
          </div>

          {/* Attribution */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Submission Privacy:</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="sugAttribution"
                  checked={!isAnonymous}
                  onChange={() => setIsAnonymous(false)}
                  className="accent-teal-600"
                />
                <span>{profile?.display_name || 'My Profile'}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="sugAttribution"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(true)}
                  className="accent-teal-600"
                />
                <span className="font-semibold text-slate-900">Anonymous Voice</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {!user ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-7 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Log In to Submit Suggestion</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Suggestion</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
