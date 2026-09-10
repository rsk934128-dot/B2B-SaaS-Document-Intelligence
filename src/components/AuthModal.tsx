import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Sparkles,
  Loader2,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onRegister: (email: string, pass: string, displayName: string) => Promise<void>;
  onLogin: (email: string, pass: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onConnectDemoWorkspace?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  language,
  onRegister,
  onLogin,
  onPasswordReset,
  onGoogleSignIn,
  onConnectDemoWorkspace,
}: AuthModalProps) {
  const isBn = language === 'bn';

  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes('@')) {
      setError(
        isBn ? 'সঠিক ব্যবসায়িক বা ব্যক্তিগত ইমেইল প্রদান করুন।' : 'Please enter a valid email address.'
      );
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        await onPasswordReset(email);
        setSuccess(
          isBn
            ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে। ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।'
            : 'Password reset email sent! Check your inbox or spam folder.'
        );
      } catch (err: any) {
        setError(err.message || (isBn ? 'রিসেট অনুরোধ ব্যর্থ হয়েছে।' : 'Reset request failed.'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      setError(
        isBn
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        await onRegister(email, password, displayName || (email.split('@')[0]));
      } else {
        await onLogin(email, password);
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || (isBn ? 'অথেনটিকেশন ব্যর্থ হয়েছে।' : 'Authentication failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await onGoogleSignIn();
      handleClose();
    } catch (err: any) {
      setError(err.message || (isBn ? 'গুগল সাইন-ইন ব্যর্থ হয়েছে।' : 'Google sign-in failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAuth = () => {
    if (onConnectDemoWorkspace) {
      onConnectDemoWorkspace();
      handleClose();
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="auth-modal-card"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white relative">
          <button
            type="button"
            id="auth-modal-close-btn"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-white/15 backdrop-blur-xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-100">
              {isBn ? 'ফায়ারবেস ক্লাউড প্রমাণীকরণ' : 'Firebase Cloud Authentication'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold">
            {mode === 'signin' && (isBn ? 'অ্যাকাউন্টে সাইন ইন করুন' : 'Sign In to Account')}
            {mode === 'register' && (isBn ? 'নতুন এন্টারপ্রাইজ অ্যাকাউন্ট' : 'Create Enterprise Account')}
            {mode === 'forgot' && (isBn ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset Account Password')}
          </h2>

          <p className="text-xs text-blue-100 mt-1">
            {isBn
              ? 'ক্লাউড ফায়ারস্টোরে আপনার ডকুমেন্ট অডিট ও কমপ্লায়েন্স ডাটা স্থায়ীভাবে সেভ থাকবে।'
              : 'Your audit reports and compliance history will persist securely in Firestore.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5">
            <button
              type="button"
              id="auth-tab-signin"
              onClick={() => {
                setMode('signin');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                mode === 'signin'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'লগইন (Sign In)' : 'Sign In'}
            </button>
            <button
              type="button"
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                mode === 'register'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'নতুন রেজিস্ট্রেশন (Sign Up)' : 'Sign Up'}
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Status Alerts */}
          {error && (
            <div
              id="auth-error-alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {success && (
            <div
              id="auth-success-alert"
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{success}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="auth-name-input">
                  {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={isBn ? 'যেমন: আব্দুল্লাহ আল মামুন' : 'e.g. Alex Morgan'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="auth-email-input">
                {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700" htmlFor="auth-password-input">
                    {isBn ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      id="auth-forgot-btn"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isBn ? 'কমপক্ষে ৬ অক্ষর' : 'At least 6 characters'}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              id="auth-submit-btn"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'প্রক্রিয়াধীন...' : 'Processing...'}</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <span>{isBn ? 'লগইন করুন' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isBn ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Create Free Account'}</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>{isBn ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-xs text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
                >
                  {isBn ? '← লগইনে ফিরে যান' : '← Back to Sign In'}
                </button>
              </div>
            )}
          </form>

          {/* Social / Direct Workspace Sign-In Alternatives */}
          {mode !== 'forgot' && (
            <>
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-3 bg-white text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  {isBn ? 'অথবা সরাসরি' : 'Or continue with'}
                </span>
              </div>

              <div className="space-y-2">
                {/* Google Sign-in with Drive Integration */}
                <button
                  type="button"
                  id="auth-google-oauth-btn"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 active:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  <span>
                    {isBn ? 'Google দিয়ে লগইন (Drive কানেক্টসহ)' : 'Continue with Google (Drive integrated)'}
                  </span>
                </button>

                {/* Demo Workspace */}
                {onConnectDemoWorkspace && (
                  <button
                    type="button"
                    id="auth-demo-workspace-btn"
                    onClick={handleDemoAuth}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {isBn ? 'লগইন ছাড়াই ডেমো টেস্ট করুন' : 'Test Demo Workspace without signing in'}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Privacy & Cloud Persistence Footer Notice */}
          <div className="pt-2 text-center text-[10px] text-slate-400">
            {isBn
              ? 'নিরাপদ ক্লাউড এনক্রিপশন ও Firebase Firestore রুলস দ্বারা আপনার ডেটা সুরক্ষিত।'
              : 'End-to-end encrypted Firestore rules enforce isolated owner data privacy.'}
          </div>
        </div>
      </div>
    </div>
  );
}
