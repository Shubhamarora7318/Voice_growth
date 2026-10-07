import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  HelpCircle,
  Plus,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { Topic, User, UserProfile } from '../../types';

interface OpinionFormProps {
  topics: Topic[];
  profile: UserProfile | null;
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
  onOpenAuth: () => void;
}

const CHANGE_FACTORS = [
  'Personal Experience',
  'Education',
  'Technology',
  'Friends',
  'Family',
  'Teacher/Mentor',
  'Work Experience',
  'Social Media',
  'Books',
  'Research',
  'Customer Experience',
  'Other'
];

export const OpinionForm: React.FC<OpinionFormProps> = ({
  topics,
  profile,
  user,
  onSuccess,
  onCancel,
  onOpenAuth
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || 't-edu');
  const [customTopicName, setCustomTopicName] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  const [currentOpinion, setCurrentOpinion] = useState('');
  const [wasDifferent, setWasDifferent] = useState<'Yes' | 'No' | 'Not Sure'>('No');
  const [previousOpinion, setPreviousOpinion] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [otherFactor, setOtherFactor] = useState('');
  const [explanationForChange, setExplanationForChange] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(profile?.is_anonymous ?? false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 5;

  const toggleFactor = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      setSelectedFactors(selectedFactors.filter(f => f !== factor));
    } else {
      setSelectedFactors([...selectedFactors, factor]);
    }
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (isCreatingTopic && !customTopicName.trim()) {
        setError('Please enter a name for your custom topic.');
        return;
      }
    } else if (currentStep === 2) {
      if (!currentOpinion.trim() || currentOpinion.trim().length < 15) {
        setError('Please provide your opinion with at least 15 characters.');
        return;
      }
    } else if (currentStep === 3) {
      if (wasDifferent === 'Yes' && !previousOpinion.trim()) {
        setError('Please describe what you believed previously.');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Please log in with your mobile number before submitting your opinion.');
      onOpenAuth();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let finalTopicId = selectedTopicId;
      let finalTopicName = topics.find(t => t.id === selectedTopicId)?.name || 'General';

      if (isCreatingTopic && customTopicName.trim()) {
        const newTopic = await api.createTopic({
          name: customTopicName.trim(),
          category: 'Community Contribution'
        });
        finalTopicId = newTopic.id;
        finalTopicName = newTopic.name;
      }

      const factors = [...selectedFactors];
      if (otherFactor.trim()) factors.push(otherFactor.trim());

      await api.createOpinion({
        topic_id: finalTopicId,
        topic_name: finalTopicName,
        current_opinion: currentOpinion.trim(),
        previous_opinion: wasDifferent === 'Yes' ? previousOpinion.trim() : undefined,
        was_different: wasDifferent,
        reasons_for_change: factors,
        explanation_for_change: explanationForChange.trim() || undefined,
        confidence_score: 90,
        visibility: isAnonymous ? 'anonymous' : 'public'
      });

      confetti({ particleCount: 70, spread: 60 });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit opinion. Please log in first.');
      if (err.message?.includes('Unauthorized')) {
        onOpenAuth();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hub</span>
        </button>
        <span className="text-xs font-semibold text-slate-500">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Card Container */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-100">
        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                You are browsing as a guest. Please verify your mobile number before submitting your opinion.
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

        <AnimatePresence mode="wait">
          {/* STEP 1: Topic */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-600">
                  Step 1 of 5
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                  What is your opinion about?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a topic domain or create a new topic that fits your viewpoint.
                </p>
              </div>

              {!isCreatingTopic ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {topics.map(topic => (
                      <button
                        type="button"
                        key={topic.id}
                        onClick={() => setSelectedTopicId(topic.id)}
                        className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          selectedTopicId === topic.id
                            ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500 text-emerald-950 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="font-bold">{topic.name}</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {topic.description}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreatingTopic(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create a new topic</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    New Topic Name
                  </label>
                  <input
                    type="text"
                    value={customTopicName}
                    onChange={e => setCustomTopicName(e.target.value)}
                    placeholder="e.g. Higher Education Internship Policies"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCreatingTopic(false)}
                    className="text-xs text-slate-500 hover:underline cursor-pointer"
                  >
                    ← Back to existing topics
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: Current Opinion */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-600">
                  Step 2 of 5
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                  Describe your opinion
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Say what you believe clearly and candidly. The system never judges right or wrong.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  “This is my opinion:”
                </label>
                <textarea
                  rows={6}
                  value={currentOpinion}
                  onChange={e => setCurrentOpinion(e.target.value)}
                  placeholder="Express your viewpoint openly. For example: 'College evaluations should place higher weight on practical projects rather than memorized theory exams...'"
                  className="w-full p-4 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 leading-relaxed placeholder:text-slate-400"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
                  <span>Aim for clear, constructive explanations.</span>
                  <span>{currentOpinion.length} characters</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Previous Opinion */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-600">
                  Step 3 of 5
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                  Was your opinion different in the past?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Understanding how human beliefs evolve helps organizations discover breakthroughs.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['Yes', 'No', 'Not Sure'] as const).map(option => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setWasDifferent(option)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      wasDifferent === option
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {wasDifferent === 'Yes' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 pt-2"
                >
                  <label className="block text-xs font-semibold text-slate-700">
                    What did you believe previously?
                  </label>
                  <textarea
                    rows={4}
                    value={previousOpinion}
                    onChange={e => setPreviousOpinion(e.target.value)}
                    placeholder="e.g. Previously I believed standardized test scores were the only fair indicator of potential..."
                    className="w-full p-3.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 4: What Changed Your Opinion? */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-600">
                  Step 4 of 5
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                  What changed your opinion?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select the key catalyst(s) that transformed your perspective.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {CHANGE_FACTORS.map(factor => {
                  const isSelected = selectedFactors.includes(factor);
                  return (
                    <button
                      type="button"
                      key={factor}
                      onClick={() => toggleFactor(factor)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {factor}
                    </button>
                  );
                })}
              </div>

              {selectedFactors.includes('Other') && (
                <input
                  type="text"
                  value={otherFactor}
                  onChange={e => setOtherFactor(e.target.value)}
                  placeholder="Specify other factor..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              )}
            </motion.div>
          )}

          {/* STEP 5: Explain Perspective & Review Attribution */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-600">
                  Step 5 of 5
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                  What made you change your perspective?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Provide context or narrative behind your journey.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Explain the experience or insight:
                </label>
                <textarea
                  rows={4}
                  value={explanationForChange}
                  onChange={e => setExplanationForChange(e.target.value)}
                  placeholder="e.g. During my summer internship at an engineering firm, I saw firsthand how theoretical memorization didn't solve real production bugs..."
                  className="w-full p-3.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Privacy attribution choice */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Response Attribution
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="opAttribution"
                      checked={!isAnonymous}
                      onChange={() => setIsAnonymous(false)}
                      className="accent-emerald-600"
                    />
                    <span>Associate with profile ({profile?.display_name || 'My Profile'})</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="opAttribution"
                      checked={isAnonymous}
                      onChange={() => setIsAnonymous(true)}
                      className="accent-emerald-600"
                    />
                    <span className="font-semibold text-slate-900">Publish Anonymously</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : !user ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-7 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/25 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Log In to Submit Opinion</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting to MySQL...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit My Opinion</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
