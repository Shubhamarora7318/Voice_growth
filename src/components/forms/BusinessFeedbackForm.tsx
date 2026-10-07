import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Store, HelpCircle, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { User, UserProfile } from '../../types';

interface BusinessFeedbackFormProps {
  profile: UserProfile | null;
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
  onOpenAuth: () => void;
}

const BUSINESS_IMPACT_OPTIONS = [
  'Increase Customer Satisfaction',
  'Increase Revenue',
  'Reduce Cost',
  'Improve Service',
  'Improve Technology',
  'Improve Employee Experience',
  'Improve Product',
  'Improve Customer Retention',
  'Other'
];

export const BusinessFeedbackForm: React.FC<BusinessFeedbackFormProps> = ({
  profile,
  user,
  onSuccess,
  onCancel,
  onOpenAuth
}) => {
  const [businessName, setBusinessName] = useState('');
  const [outletName, setOutletName] = useState('');
  const [category, setCategory] = useState('Retail & Supermarket');
  const [location, setLocation] = useState('');

  const [whatLiked, setWhatLiked] = useState('');
  const [whatDisliked, setWhatDisliked] = useState('');
  const [whatShouldImprove, setWhatShouldImprove] = useState('');
  const [whatIntroduce, setWhatIntroduce] = useState('');
  const [growthSuggestion, setGrowthSuggestion] = useState('');
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(['Increase Customer Satisfaction']);
  const [isAnonymous, setIsAnonymous] = useState(profile?.is_anonymous ?? false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleImpact = (impact: string) => {
    if (selectedImpacts.includes(impact)) {
      setSelectedImpacts(selectedImpacts.filter(i => i !== impact));
    } else {
      setSelectedImpacts([...selectedImpacts, impact]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in with your mobile number before submitting business feedback.');
      onOpenAuth();
      return;
    }

    if (!businessName.trim() || !whatShouldImprove.trim() || !growthSuggestion.trim()) {
      setError('Please fill in Business Name, what should improve, and your growth suggestion.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createBusinessFeedback({
        business_name: businessName.trim(),
        outlet_name: outletName.trim() || 'Main Branch',
        category,
        location: location.trim() || 'Local Area',
        what_liked: whatLiked.trim() || 'Staff courtesy and initial store layout',
        what_disliked: whatDisliked.trim() || 'None specific',
        what_should_improve: whatShouldImprove.trim(),
        what_introduce: whatIntroduce.trim() || 'Digital feedback & loyalty kiosk',
        growth_suggestion: growthSuggestion.trim(),
        business_impact: selectedImpacts,
        visibility: isAnonymous ? 'anonymous' : 'public'
      });

      confetti({ particleCount: 60, spread: 60 });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
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
          <span className="text-[11px] font-bold tracking-wider uppercase text-amber-600">
            Outlet & Enterprise Growth
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
            Business / Outlet Feedback
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Help an outlet or brand understand real customer needs and identify operational growth opportunities.
          </p>
        </div>

        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                You are browsing as a guest. Please log in with your mobile number to submit your business feedback.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section A: Business / Outlet Details */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-4">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Outlet / Business Information
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Brand Name *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Metro Hypermarket, Starbucks, Zomato Kitchen"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Outlet / Branch Name
                </label>
                <input
                  type="text"
                  value={outletName}
                  onChange={e => setOutletName(e.target.value)}
                  placeholder="e.g. Central Mall Branch, Indiranagar Hub"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Retail & Supermarket">Retail & Supermarket</option>
                  <option value="Food & Restaurant">Food & Restaurant</option>
                  <option value="Healthcare & Pharmacy">Healthcare & Pharmacy</option>
                  <option value="Banking & Financial Outlet">Banking & Financial Outlet</option>
                  <option value="Apparel & Lifestyle">Apparel & Lifestyle</option>
                  <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                  <option value="Hospitality & Services">Hospitality & Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. MG Road, Bengaluru"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section B: Customer Opinion */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Customer Experience & Observations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What did you like?
                </label>
                <textarea
                  rows={2}
                  value={whatLiked}
                  onChange={e => setWhatLiked(e.target.value)}
                  placeholder="e.g. Well-lit aisles, polite cashier..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What did you dislike?
                </label>
                <textarea
                  rows={2}
                  value={whatDisliked}
                  onChange={e => setWhatDisliked(e.target.value)}
                  placeholder="e.g. 20-minute wait at checkout, missing price tags..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                What should improve? *
              </label>
              <textarea
                rows={2}
                value={whatShouldImprove}
                onChange={e => setWhatShouldImprove(e.target.value)}
                placeholder="e.g. Allocate more staff to billing counters during evening rush hours..."
                required
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                What should the outlet introduce?
              </label>
              <textarea
                rows={2}
                value={whatIntroduce}
                onChange={e => setWhatIntroduce(e.target.value)}
                placeholder="e.g. Self-checkout express kiosks or barcode scanner mobile app..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section C: Growth Suggestion */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Growth Suggestion: How could this business improve its customer experience? *
            </label>
            <textarea
              rows={3}
              value={growthSuggestion}
              onChange={e => setGrowthSuggestion(e.target.value)}
              placeholder="e.g. By piloting a scan-and-go mobile app, this outlet will dramatically cut queues, increase basket velocity, and build loyalty against competing chains..."
              required
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800"
            />
          </div>

          {/* Section D: Business Impact */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Expected Business Impact (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_IMPACT_OPTIONS.map(impact => {
                const isSelected = selectedImpacts.includes(impact);
                return (
                  <button
                    type="button"
                    key={impact}
                    onClick={() => toggleImpact(impact)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {impact}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Attribution:</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="bizAttribution"
                  checked={!isAnonymous}
                  onChange={() => setIsAnonymous(false)}
                  className="accent-amber-600"
                />
                <span>Customer Profile ({profile?.display_name || 'My Profile'})</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="bizAttribution"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(true)}
                  className="accent-amber-600"
                />
                <span className="font-semibold text-slate-900">Anonymous Customer</span>
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
                <span>Log In to Submit Feedback</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Send to Business Dashboard</span>
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
