import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Users, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { User, UserProfile } from '../../types';

interface CommunityIdeaFormProps {
  profile: UserProfile | null;
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
  onOpenAuth: () => void;
}

const COMMUNITY_CATEGORIES = [
  'Education',
  'Technology',
  'Employment',
  'Skill Development',
  'Environment',
  'Local Infrastructure',
  'Digital Services',
  'Entrepreneurship',
  'Healthcare',
  'Youth Development',
  'Women Empowerment',
  'Other'
];

export const CommunityIdeaForm: React.FC<CommunityIdeaFormProps> = ({
  profile,
  user,
  onSuccess,
  onCancel,
  onOpenAuth
}) => {
  const [topicCategory, setTopicCategory] = useState(COMMUNITY_CATEGORIES[0]);
  const [problem, setProblem] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [targetCommunity, setTargetCommunity] = useState('');
  const [expectedBenefit, setExpectedBenefit] = useState('');
  const [requiredResources, setRequiredResources] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(profile?.is_anonymous ?? false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in with your mobile number before submitting your idea.');
      onOpenAuth();
      return;
    }

    if (!problem.trim() || !proposedSolution.trim() || !targetCommunity.trim()) {
      setError('Please specify the Problem, Proposed Solution, and Target Community.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Also register as an Idea so it's tracked in the Ideas marketplace & status lifecycle
      await api.createIdea({
        category: topicCategory,
        title: `${topicCategory}: ${problem.slice(0, 50)}...`,
        problem_description: problem.trim(),
        proposed_solution: proposedSolution.trim(),
        target_audience: targetCommunity.trim(),
        expected_benefit: expectedBenefit.trim() || 'Community upliftment',
        expected_impact: expectedImpact.trim() || 'Positive social change',
        required_resources: requiredResources.trim() || 'Civic participation and municipal alignment',
        visibility: isAnonymous ? 'anonymous' : 'public'
      });

      confetti({ particleCount: 60, spread: 60 });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit community idea.');
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
          <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600">
            Collective Impact
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
            Ideas for Community Growth
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Propose sustainable civic, educational, or technological initiatives for neighborhoods, towns, and societies.
          </p>
        </div>

        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                You are currently browsing as a guest. Please log in with your mobile number to submit your idea.
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
          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Community Category
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMUNITY_CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setTopicCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    topicCategory === cat
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Problem */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Problem / Challenge *
            </label>
            <textarea
              rows={3}
              value={problem}
              onChange={e => setProblem(e.target.value)}
              placeholder="What obstacle, deficit, or inefficiency is the community facing?"
              required
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Proposed Solution */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proposed Solution *
            </label>
            <textarea
              rows={3}
              value={proposedSolution}
              onChange={e => setProposedSolution(e.target.value)}
              placeholder="How can this problem be solved collaboratively or systematically?"
              required
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Target Community & Benefit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Community *
              </label>
              <input
                type="text"
                value={targetCommunity}
                onChange={e => setTargetCommunity(e.target.value)}
                placeholder="e.g. Ward 12 youth, senior citizens, public bus commuters"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Benefit
              </label>
              <input
                type="text"
                value={expectedBenefit}
                onChange={e => setExpectedBenefit(e.target.value)}
                placeholder="e.g. Safer streets, 30% less food waste, cleaner air"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Resources & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Resources
              </label>
              <textarea
                rows={2}
                value={requiredResources}
                onChange={e => setRequiredResources(e.target.value)}
                placeholder="e.g. Volunteers, municipal approval, open source software, micro-grant..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Impact
              </label>
              <textarea
                rows={2}
                value={expectedImpact}
                onChange={e => setExpectedImpact(e.target.value)}
                placeholder="e.g. 500+ households positively impacted per month..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Privacy Attribution */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Attribution:</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="commAttribution"
                  checked={!isAnonymous}
                  onChange={() => setIsAnonymous(false)}
                  className="accent-blue-600"
                />
                <span>Profile ({profile?.display_name || 'My Profile'})</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="commAttribution"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(true)}
                  className="accent-blue-600"
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
                <span>Log In to Submit Idea</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting to MySQL...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Community Idea</span>
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
