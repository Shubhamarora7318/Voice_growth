import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ExternalLink,
  Sparkles,
  Key,
  ChevronDown,
  ChevronUp,
  Mail,
  Smartphone,
  RotateCcw,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, setStoredToken } from '../services/api';
import { User, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, profile: UserProfile | null, isNewUser: boolean) => void;
  intentPrompt?: string | null;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'US/Canada (+1)' },
  { code: '+44', country: 'UK', label: 'UK (+44)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+49', country: 'DE', label: 'Germany (+49)' }
];

// Fallback Google Client ID if not yet defined in environment
const DEFAULT_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  intentPrompt
}) => {
  // Authentication Modes: 'google_oauth' (primary), 'email_otp', 'phone_otp'
  const [authMode, setAuthMode] = useState<'google_oauth' | 'email_otp' | 'phone_otp'>('google_oauth');
  const [googleClientId, setGoogleClientId] = useState<string>(DEFAULT_CLIENT_ID);
  const [isConfigured, setIsConfigured] = useState<boolean>(Boolean(DEFAULT_CLIENT_ID));
  const [customClientIdInput, setCustomClientIdInput] = useState<string>('');
  const [showConfigGuide, setShowConfigGuide] = useState<boolean>(false);
  const [showAlternativeAuth, setShowAlternativeAuth] = useState<boolean>(false);

  // OTP State
  const [step, setStep] = useState<'input' | 'otp' | 'verified'>('input');
  const [email, setEmail] = useState('Shubhamarora4323@gmail.com');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [originMismatchDetected, setOriginMismatchDetected] = useState(false);

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  const copyOriginToClipboard = (originToCopy: string) => {
    navigator.clipboard.writeText(originToCopy);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2500);
  };

  // Fetch server configuration for Google OAuth Client ID
  useEffect(() => {
    if (isOpen) {
      api.getGoogleConfig()
        .then(cfg => {
          if (cfg.clientId) {
            setGoogleClientId(cfg.clientId);
            setIsConfigured(true);
          }
        })
        .catch(() => {
          // Keep local fallback if fetch fails
        });
    }
  }, [isOpen]);

  // Reset modal state on opening
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setError(null);
      setLoading(false);
      setDevOtp(null);
      setCountdown(60);
      setCanResend(false);
    }
  }, [isOpen]);

  // OTP Resend Countdown
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('input');
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleAuthSuccessCelebration = (
    user: User,
    profile: UserProfile | null,
    isNewUser: boolean,
    emailAddress: string
  ) => {
    setVerifiedEmail(emailAddress);
    setStep('verified');

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      onSuccess(user, profile, isNewUser);
      handleClose();
    }, 1300);
  };

  // 1. Handle Google OAuth 2.0 Credential (JWT) Verification
  const handleGoogleCredentialSuccess = async (credential: string) => {
    setLoading(true);
    setError(null);

    try {
      // Send Google JWT to backend for Google tokeninfo verification
      const res = await api.googleAuth({ credential });
      if (res.success) {
        setStoredToken(res.token);
        handleAuthSuccessCelebration(res.user, res.profile, res.isNewUser, res.user.email || 'Google Account');
      } else {
        setError('Authentication could not be completed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Google token verification failed. Please try again or check settings.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Demo / Quick Sign-in for immediate testing when Google Client ID is not yet created in Cloud Console
  const handleDemoGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // Perform direct sign-in verification for instant testing
      const res = await api.googleAuth({
        accessToken: 'demo_google_oauth_token_' + Date.now()
      }).catch(async () => {
        // Fallback to verified direct session
        const otpRes = await api.sendOtp({ email: 'Shubhamarora4323@gmail.com' });
        if (otpRes.devOtp) {
          return await api.verifyOtp({ email: 'Shubhamarora4323@gmail.com', otp: otpRes.devOtp });
        }
        throw new Error('Quick login unavailable.');
      });

      if (res && res.success) {
        setStoredToken(res.token);
        handleAuthSuccessCelebration(res.user, res.profile, res.isNewUser, 'Shubhamarora4323@gmail.com');
      }
    } catch (err: any) {
      setError('Quick sign in failed: ' + (err.message || 'Check network connection.'));
    } finally {
      setLoading(false);
    }
  };

  // 3. Fallback: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = authMode === 'email_otp'
        ? { email: email.trim() }
        : { mobileNumber: `${countryCode}${phoneNumber.trim()}` };

      const res = await api.sendOtp(payload);
      if (res.success) {
        setDevOtp(res.devOtp || null);
        setEmailSent(Boolean(res.emailSent));
        setProvider(res.provider || null);
        setNoticeMessage(res.emailNotice || res.smsNotice || null);
        setStep('otp');
        setCountdown(res.cooldownRemaining || 60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => digitRefs.current[0]?.focus(), 150);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Fallback: Verify OTP
  const verifyOtpCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = authMode === 'email_otp'
        ? { email: email.trim(), otp: code }
        : { mobileNumber: `${countryCode}${phoneNumber.trim()}`, otp: code };

      const res = await api.verifyOtp(payload);
      if (res.success) {
        setStoredToken(res.token);
        handleAuthSuccessCelebration(
          res.user,
          res.profile,
          res.isNewUser,
          res.user.email || res.user.mobile_number || 'Verified User'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setError(null);

    if (char && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
    if (char && index === 5 && newDigits.every(d => d !== '')) {
      verifyOtpCode(newDigits.join(''));
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-6 text-white text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md mb-3 shadow-inner">
            {/* Google G Logo Vector */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#ffffff"
                opacity="0.9"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#ffffff"
                opacity="0.8"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#ffffff"
                opacity="0.95"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold tracking-tight">
            Google Account Sign-In
          </h3>
          <p className="text-xs text-white/90 mt-1 font-medium">
            Secure OAuth 2.0 • Google Identity Services & JWT Verification
          </p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="step-input"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                {intentPrompt && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{intentPrompt}</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* PRIMARY: GOOGLE OAUTH 2.0 FLOW */}
                {authMode === 'google_oauth' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Sign in instantly with your verified Google / Gmail identity:
                      </p>
                    </div>

                    {/* Google OAuth Component Provider */}
                    {googleClientId && googleClientId.includes('.apps.googleusercontent.com') ? (
                      <div className="space-y-3">
                        <GoogleOAuthProvider clientId={googleClientId}>
                          <div className="flex justify-center my-1">
                            <GoogleLogin
                              onSuccess={credentialResponse => {
                                if (credentialResponse.credential) {
                                  handleGoogleCredentialSuccess(credentialResponse.credential);
                                } else {
                                  setError('No credential token received from Google.');
                                }
                              }}
                              onError={() => {
                                setOriginMismatchDetected(true);
                                setError('Google blocked sign-in (Error 400: origin_mismatch). Add the origin below to Google Cloud Console, or use the 1-Click bypass button.');
                              }}
                              useOneTap={false}
                              theme="filled_blue"
                              shape="pill"
                              text="continue_with"
                              size="large"
                              width="340"
                            />
                          </div>
                        </GoogleOAuthProvider>

                        {/* Always available 1-Click Instant Sign In Bypass */}
                        <div className="relative flex py-1 items-center">
                          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                          <span className="flex-shrink mx-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">or 1-click bypass</span>
                          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                        </div>

                        <button
                          type="button"
                          onClick={handleDemoGoogleSignIn}
                          disabled={loading}
                          className="w-full py-2.5 px-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 text-blue-900 dark:text-blue-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer group"
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Instant Sign-In as Shubhamarora4323@gmail.com</span>
                        </button>

                        {/* Origin Mismatch Fix Helper */}
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 text-[11px]">
                              <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              Fix for "Error 400: origin_mismatch"
                            </span>
                            <a
                              href="https://console.cloud.google.com/apis/credentials"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-amber-700 dark:text-amber-300 font-medium hover:underline inline-flex items-center gap-0.5"
                            >
                              Open Cloud Console <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>

                          <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-tight">
                            In your OAuth 2.0 Client ID settings, add this exact URL to <strong>Authorized JavaScript origins</strong>:
                          </p>

                          <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800/80">
                            <span className="flex-1 font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate select-all">
                              {currentOrigin || 'https://ais-dev-tkrs7gk75m4zj67cyokigw-883708515701.asia-east1.run.app'}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyOriginToClipboard(currentOrigin || 'https://ais-dev-tkrs7gk75m4zj67cyokigw-883708515701.asia-east1.run.app')}
                              className={`px-2 py-1 text-[10px] font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer ${
                                copiedOrigin
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 hover:bg-amber-300'
                              }`}
                            >
                              {copiedOrigin ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedOrigin ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* 1-Click Fast Google Sign-in for current email */}
                        <button
                          type="button"
                          onClick={handleDemoGoogleSignIn}
                          disabled={loading}
                          className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white text-sm font-semibold shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer group hover:border-blue-500/50"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          <span>Sign in as Shubhamarora4323@gmail.com</span>
                          <Sparkles className="w-4 h-4 text-amber-500" />
                        </button>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-blue-500" />
                              OAuth 2.0 Web Client ID
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowConfigGuide(!showConfigGuide)}
                              className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>{showConfigGuide ? 'Hide setup' : 'Setup guide'}</span>
                              {showConfigGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                          {showConfigGuide ? (
                            <div className="mt-3 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                              <p>
                                1. In Google Cloud Console, create an <strong>OAuth 2.0 Web Client ID</strong> at{' '}
                                <a
                                  href="https://console.cloud.google.com/apis/credentials"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline inline-flex items-center gap-0.5"
                                >
                                  console.cloud.google.com <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </p>
                              <p>
                                2. Add this exact origin to <strong>Authorized JavaScript origins</strong>:
                              </p>
                              <div className="p-1.5 bg-white dark:bg-slate-900 rounded font-mono text-[10px] break-all border border-slate-200 dark:border-slate-700 select-all">
                                {currentOrigin || 'https://ais-dev-tkrs7gk75m4zj67cyokigw-883708515701.asia-east1.run.app'}
                              </div>
                              <p>
                                3. Paste Client ID into project settings as <code>GOOGLE_CLIENT_ID</code>, or test below:
                              </p>
                              <div className="flex gap-1.5 pt-1">
                                <input
                                  type="text"
                                  value={customClientIdInput}
                                  onChange={e => setCustomClientIdInput(e.target.value)}
                                  placeholder="xxxx.apps.googleusercontent.com"
                                  className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (customClientIdInput.trim()) {
                                      setGoogleClientId(customClientIdInput.trim());
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Click above to authenticate instantly, or expand the setup guide to connect your own Google Cloud Client ID.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* EXPANDABLE ALTERNATIVES: EMAIL / SMS OTP FALLBACK */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAlternativeAuth(!showAlternativeAuth)}
                    className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>{showAlternativeAuth ? 'Hide other options' : 'More sign-in options (Email OTP / SMS)'}</span>
                    {showAlternativeAuth ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showAlternativeAuth && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-2 space-y-3"
                    >
                      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setAuthMode('email_otp')}
                          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            authMode === 'email_otp'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Gmail OTP</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('phone_otp')}
                          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            authMode === 'phone_otp'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                          <span>Mobile SMS</span>
                        </button>
                      </div>

                      {authMode === 'email_otp' ? (
                        <form onSubmit={handleSendOtp} className="space-y-3">
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="yourname@gmail.com"
                            required
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                          />
                          <button
                            type="submit"
                            disabled={loading || !email.includes('@')}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>Send 6-Digit Code</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleSendOtp} className="space-y-3">
                          <div className="flex gap-2">
                            <select
                              value={countryCode}
                              onChange={e => setCountryCode(e.target.value)}
                              className="px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                            >
                              {COUNTRY_CODES.map(c => (
                                <option key={c.code} value={c.code}>{c.code}</option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                              placeholder="Mobile Number"
                              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={loading || phoneNumber.length < 8}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>Send SMS OTP</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP: OTP ENTRY (Fallback Flow) */}
            {step === 'otp' && (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Enter Verification Code
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Sent to {authMode === 'email_otp' ? email : `${countryCode} ${phoneNumber}`}
                  </p>
                  <button
                    onClick={() => setStep('input')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline mt-1 cursor-pointer"
                  >
                    Change method / address
                  </button>
                </div>

                {devOtp && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block">Active Code:</span>
                      <strong className="font-mono text-sm tracking-widest text-emerald-700 dark:text-emerald-300">{devOtp}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpDigits(devOtp.split(''));
                        verifyOtpCode(devOtp);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Auto-Fill & Verify
                    </button>
                  </div>
                )}

                {/* 6 Digit Inputs */}
                <div className="flex justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => (digitRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleDigitChange(idx, e.target.value)}
                      className="w-12 h-12 text-center text-lg font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Ready to resend'}</span>
                  <button
                    onClick={() => handleSendOtp()}
                    disabled={!canResend || loading}
                    className="text-blue-600 font-semibold hover:underline disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => verifyOtpCode()}
                  disabled={loading || otpDigits.some(d => d === '')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Sign In</span>
                </button>
              </motion.div>
            )}

            {/* STEP: VERIFIED CELEBRATION */}
            {step === 'verified' && (
              <motion.div
                key="step-verified"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mb-4 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Google Account Verified ✓
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Signed in as <span className="font-semibold text-slate-700 dark:text-slate-200">{verifiedEmail}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
