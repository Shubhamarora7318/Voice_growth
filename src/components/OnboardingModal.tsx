import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Building2, GraduationCap, Briefcase, Users, Store, HelpCircle, Check, Shield } from 'lucide-react';
import { UserCategory, UserProfile } from '../types';
import { api } from '../services/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSaved: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

const CATEGORIES: { value: UserCategory; label: string; desc: string; icon: any }[] = [
  { value: 'Individual', label: 'Individual', desc: 'Share personal viewpoints, ideas, or experiences', icon: User },
  { value: 'School', label: 'School', desc: 'Students, teachers, and school communities', icon: GraduationCap },
  { value: 'College', label: 'College', desc: 'Students, faculty, and collegiate bodies', icon: GraduationCap },
  { value: 'Professional', label: 'Professional', desc: 'Employees, freelancers, and working communities', icon: Briefcase },
  { value: 'Business / Outlet', label: 'Business / Outlet', desc: 'Customers, outlet owners, and service personnel', icon: Store },
  { value: 'Community', label: 'Community', desc: 'Civic, technological, social, or environmental ideas', icon: Users },
  { value: 'Other', label: 'Other', desc: 'Specify another category or background', icon: HelpCircle }
];

const AGE_GROUPS = ['Under 18', '18-24', '25-34', '35-50', '50+'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onProfileSaved,
  initialProfile
}) => {
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || '');
  const [ageGroup, setAgeGroup] = useState(initialProfile?.age_group || '18-24');
  const [category, setCategory] = useState<UserCategory>(initialProfile?.category || 'Individual');
  const [customCategory, setCustomCategory] = useState(initialProfile?.custom_category || '');
  const [city, setCity] = useState(initialProfile?.city || '');
  const [orgName, setOrgName] = useState(initialProfile?.school_college_org || '');
  const [profession, setProfession] = useState(initialProfile?.profession || '');
  const [privacyPreference, setPrivacyPreference] = useState<'anonymous' | 'profile'>(
    initialProfile?.is_anonymous ? 'anonymous' : 'profile'
  );

  // Consent checklist
  const [allowPublic, setAllowPublic] = useState(true);
  const [allowAggregated, setAllowAggregated] = useState(true);
  const [agreedToRules, setAgreedToRules] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please provide a display name or pseudonym.');
      return;
    }
    if (!city.trim()) {
      setError('Please specify your city.');
      return;
    }
    if (!agreedToRules) {
      setError('You must accept the Community Rules to participate responsibly.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.saveProfile({
        display_name: displayName.trim(),
        age_group: ageGroup,
        category: category,
        custom_category: category === 'Other' ? customCategory.trim() : undefined,
        city: city.trim(),
        school_college_org: orgName.trim() || undefined,
        profession: profession.trim() || undefined,
        is_anonymous: privacyPreference === 'anonymous',
        allow_public_display: allowPublic,
        allow_aggregate_research: allowAggregated,
        agreed_to_rules: agreedToRules
      });

      if (res.success && res.profile) {
        onProfileSaved(res.profile);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 my-8 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                User Onboarding
              </span>
              <h3 className="text-xl font-bold mt-1 tracking-tight">Complete Your Profile</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                We respect your privacy. No unnecessary personal details are required.
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md hidden sm:block">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Your Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{cat.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {category === 'Other' && (
              <input
                type="text"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="Specify your category..."
                className="mt-2.5 w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            )}
          </div>

          {/* 2. Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name / Handle *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Rivera or CitizenVoice"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age Group *
              </label>
              <select
                value={ageGroup}
                onChange={e => setAgeGroup(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {AGE_GROUPS.map(ag => (
                  <option key={ag} value={ag}>
                    {ag}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City *</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Bengaluru, Mumbai, Austin"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                School / College / Organization <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="e.g. Stanford University or Apex Corp"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Profession / Designation <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={profession}
                onChange={e => setProfession(e.target.value)}
                placeholder="e.g. Student, Software Architect, Educator"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* 3. Privacy Association Choice */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Default Response Attribution Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                  privacyPreference === 'profile'
                    ? 'border-emerald-600 dark:border-emerald-500 bg-white dark:bg-slate-800 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="attribution"
                  checked={privacyPreference === 'profile'}
                  onChange={() => setPrivacyPreference('profile')}
                  className="accent-emerald-600"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Response Associated With My Profile
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Displays your Display Name & Category badge on submissions
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                  privacyPreference === 'anonymous'
                    ? 'border-emerald-600 dark:border-emerald-500 bg-white dark:bg-slate-800 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="attribution"
                  checked={privacyPreference === 'anonymous'}
                  onChange={() => setPrivacyPreference('anonymous')}
                  className="accent-emerald-600"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Anonymous Response</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Submit as "Anonymous Voice" — never links your name
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 4. Privacy Consent Options */}
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Privacy & Data Usage Consent
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPublic}
                onChange={e => setAllowPublic(e.target.checked)}
                className="mt-0.5 accent-emerald-600"
              />
              <span>Allow my response to be displayed in public discovery streams.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowAggregated}
                onChange={e => setAllowAggregated(e.target.checked)}
                className="mt-0.5 accent-emerald-600"
              />
              <span>
                Allow my responses to be aggregated into public research and organizational insights (mobile number is NEVER shared).
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToRules}
                onChange={e => setAgreedToRules(e.target.checked)}
                className="mt-0.5 accent-emerald-600"
              />
              <span className="font-medium text-slate-900 dark:text-white">
                I agree to the Community Rules: Criticize ideas respectfully, never attack individuals, and do not submit hate speech or private information.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Skip For Now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Profile & Continue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
