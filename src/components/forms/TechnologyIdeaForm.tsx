import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Cpu, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { User, UserProfile } from '../../types';

interface TechnologyIdeaFormProps {
  profile: UserProfile | null;
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
  onOpenAuth: () => void;
}

export const TechnologyIdeaForm: React.FC<TechnologyIdeaFormProps> = ({
  profile,
  user,
  onSuccess,
  onCancel,
  onOpenAuth
}) => {
  const [problem, setProblem] = useState('');
  const [currentProcess, setCurrentProcess] = useState('');
  const [proposedTechnology, setProposedTechnology] = useState('');
  const [automationOpportunity, setAutomationOpportunity] = useState('');
  const [expectedBenefit, setExpectedBenefit] = useState('');
  const [estimatedComplexity, setEstimatedComplexity] = useState<'Low' | 'Medium' | 'High' | 'Enterprise'>('Medium');
  const [isAnonymous, setIsAnonymous] = useState(profile?.is_anonymous ?? false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in with your mobile number before submitting your tech idea.');
      onOpenAuth();
      return;
    }

    if (!problem.trim() || !proposedTechnology.trim() || !automationOpportunity.trim()) {
      setError('Please specify the Problem, Proposed Technology, and Automation Opportunity.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create both in tech ideas and main idea repository
      await api.createIdea({
        category: 'Technology',
        title: `Tech Idea: ${proposedTechnology.slice(0, 50)}`,
        problem_description: problem.trim(),
        proposed_solution: `${proposedTechnology.trim()} | Automation: ${automationOpportunity.trim()}`,
        target_audience: 'Engineers, Institutions, & Tech Innovators',
        expected_benefit: expectedBenefit.trim() || 'Process modernization & digital accuracy',
        expected_impact: `Estimated Complexity: ${estimatedComplexity}. Reduces manual overhead.`,
        required_resources: 'Software stack, APIs, and cloud hosting',
        visibility: isAnonymous ? 'anonymous' : 'public'
      });

      confetti({ particleCount: 60, spread: 60 });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit technology idea.');
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
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-100">
        <div className="mb-6">
          <span className="text-[11px] font-bold tracking-wider uppercase text-purple-600">
            Digital Transformation
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
            Technology & Innovation Marketplace
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Propose software, automation, IoT, or AI solutions for problems you experience in daily life, study, or work.
          </p>
        </div>

        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                You are currently browsing as a guest. Please log in with your mobile number to submit your tech idea.
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
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              What technology could solve a problem you currently experience? *
            </label>
            <textarea
              rows={3}
              value={problem}
              onChange={e => setProblem(e.target.value)}
              placeholder="Describe the current pain point or manual friction..."
              required
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Process (How is it done today?)
            </label>
            <textarea
              rows={2}
              value={currentProcess}
              onChange={e => setCurrentProcess(e.target.value)}
              placeholder="e.g. Paper logbooks, repetitive spreadsheets, manual WhatsApp messaging..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proposed Technology Solution *
            </label>
            <input
              type="text"
              value={proposedTechnology}
              onChange={e => setProposedTechnology(e.target.value)}
              placeholder="e.g. NFC tag-based smart equipment maintenance web app"
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Automation Opportunity *
            </label>
            <textarea
              rows={2}
              value={automationOpportunity}
              onChange={e => setAutomationOpportunity(e.target.value)}
              placeholder="What manual step can be completely automated by code, webhook, or AI?"
              required
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Benefit
              </label>
              <input
                type="text"
                value={expectedBenefit}
                onChange={e => setExpectedBenefit(e.target.value)}
                placeholder="e.g. 99% uptime and zero lost log entries"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Complexity
              </label>
              <select
                value={estimatedComplexity}
                onChange={e => setEstimatedComplexity(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
              >
                <option value="Low">Low (Simple script / form / notification)</option>
                <option value="Medium">Medium (Database + responsive UI + notifications)</option>
                <option value="High">High (Hardware sensors, edge devices, or complex AI)</option>
                <option value="Enterprise">Enterprise (Multi-tenant system integration)</option>
              </select>
            </div>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Attribution:</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="techAttribution"
                  checked={!isAnonymous}
                  onChange={() => setIsAnonymous(false)}
                  className="accent-purple-600"
                />
                <span>Profile ({profile?.display_name || 'My Profile'})</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="techAttribution"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(true)}
                  className="accent-purple-600"
                />
                <span className="font-semibold text-slate-900">Anonymous Innovator</span>
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
                <span>Log In to Submit Tech Idea</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting to MySQL...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit to Marketplace</span>
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
