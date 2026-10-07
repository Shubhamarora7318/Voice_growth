import React from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, ShieldCheck, CheckCircle2, AlertOctagon, HeartHandshake } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    {
      title: '1. Constructive Opinions Only',
      desc: 'Focus on problems and solutions, not blind venting. State what should change, why, and how.',
      icon: CheckCircle2,
      color: 'text-emerald-600'
    },
    {
      title: '2. Respectful Communication',
      desc: 'Criticize ideas, not individuals or names. Maintain professional decorum at all times.',
      icon: HeartHandshake,
      color: 'text-blue-600'
    },
    {
      title: '3. Zero Tolerance for Hate Speech',
      desc: 'Hate speech, profanity, vulgarity, racism, or harassment will lead to immediate account suspension.',
      icon: AlertOctagon,
      color: 'text-rose-600'
    },
    {
      title: '4. No Defamation or Slander',
      desc: 'Do not attack private persons or circulate unverified rumors about outlets, staff, or faculty.',
      icon: ShieldCheck,
      color: 'text-amber-600'
    },
    {
      title: '5. Authentic, Real Experiences',
      desc: 'Share genuine observations from your real school, workplace, outlet visit, or community life.',
      icon: BookOpen,
      color: 'text-teal-600'
    },
    {
      title: '6. Absolute Privacy Protection',
      desc: 'Never include personal phone numbers, physical addresses, or confidential credentials in submissions.',
      icon: ShieldCheck,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white flex items-center justify-between">
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300">
              Governance & Integrity
            </span>
            <h3 className="text-xl font-bold mt-1">Community Guidelines</h3>
            <p className="text-xs text-slate-300">
              Principles that empower productive change across Voice2Growth.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${rule.color}`} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rule.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </motion.div>
    </div>
  );
};
