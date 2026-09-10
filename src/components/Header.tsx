import React from 'react';
import { AuthState, Language } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Layers,
  FileCheck2,
  Calculator,
  Compass,
  HardDrive,
  LogOut,
  Sparkles,
  CheckCircle2,
  Database,
  ShieldCheck,
  User,
  LogIn,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'categories' | 'drive' | 'activity' | 'calculator' | 'architect';
  onSelectTab: (tab: 'categories' | 'drive' | 'activity' | 'calculator' | 'architect') => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  authState: AuthState;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onConnectDemoWorkspace?: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  authState,
  onGoogleSignIn,
  onGoogleSignOut,
  onConnectDemoWorkspace,
  onOpenAuthModal,
}) => {
  const isBn = language === 'bn';
  const isDemo = authState.accessToken?.startsWith('demo-');
  const hasUser = !!authState.user;
  const hasDrive = !!authState.accessToken;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo and Brand Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
              <img
                src="/icon.svg"
                alt="DocIntel B2B Platform Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  {isBn ? 'বিটুবি SaaS ও এআই প্ল্যাটফর্ম' : 'B2B SaaS & AI Intelligence'}
                </span>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {isBn ? 'উচ্চ আয়ের ৫টি মডেল' : 'Top 5 Opportunities'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {isBn
                  ? 'উচ্চ আয়ের B2B সফটওয়্যার, গুগল ড্রাইভ ডকুমেন্ট ইন্টেলিজেন্স ও আর্কিটেকচার'
                  : 'High-margin B2B software, Google Drive document intelligence & architecture'}
              </p>
            </div>
          </div>

          {/* Right Action Bar: PWA Install, Language Toggle & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* In-App Mobile/Desktop Install Button */}
            <PWAInstallButton language={language} />

            {/* Language Switcher */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
              <button
                type="button"
                id="lang-btn-bn"
                onClick={() => onToggleLanguage('bn')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  isBn
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                id="lang-btn-en"
                onClick={() => onToggleLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  !isBn
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>

            {/* Firebase Auth & Workspace Status Area */}
            {hasUser ? (
              <div
                id="header-user-badge"
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs border shadow-2xs ${
                  isDemo
                    ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {authState.user?.photoURL ? (
                  <img
                    src={authState.user.photoURL}
                    alt={authState.user.displayName || 'User Profile'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                    {(authState.user?.displayName || authState.user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="font-semibold leading-tight text-slate-800 truncate max-w-[140px]">
                    {authState.user?.displayName || authState.user?.email}
                  </p>
                  <div className="text-[10px] flex items-center gap-1.5 font-medium mt-0.5">
                    <span
                      className="flex items-center gap-1 text-indigo-700 font-semibold"
                      title="Data saved in Firebase Firestore"
                    >
                      <Database className="w-2.5 h-2.5 text-indigo-600" />
                      <span>Firestore</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    {hasDrive ? (
                      <span
                        className={`flex items-center gap-1 ${
                          isDemo ? 'text-blue-700' : 'text-emerald-700'
                        }`}
                      >
                        <HardDrive className="w-3 h-3" />
                        <span>
                          {isDemo
                            ? isBn
                              ? 'ডেমো ড্রাইভ'
                              : 'Demo Drive'
                            : isBn
                            ? 'ড্রাইভ কানেক্টেড'
                            : 'Drive Linked'}
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        id="header-link-drive-btn"
                        onClick={onGoogleSignIn}
                        className="text-blue-600 hover:text-blue-800 underline font-semibold flex items-center gap-0.5 cursor-pointer"
                        title={isBn ? 'গুগল ড্রাইভ ফাইল অডিট করতে যুক্ত করুন' : 'Connect Drive to audit files'}
                      >
                        <HardDrive className="w-2.5 h-2.5" />
                        <span>{isBn ? '+ ড্রাইভ' : '+ Drive'}</span>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  id="signout-drive-btn"
                  onClick={onGoogleSignOut}
                  title={isBn ? 'লগআউট করুন' : 'Sign Out'}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors ml-1 cursor-pointer hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Sign In / Register with Firebase Auth */}
                {onOpenAuthModal && (
                  <button
                    type="button"
                    id="header-auth-modal-btn"
                    onClick={onOpenAuthModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isBn ? 'লগইন / রেজিস্টার' : 'Sign In / Register'}</span>
                  </button>
                )}

                {/* Direct Google Sign-In */}
                <button
                  type="button"
                  id="signin-google-drive-btn"
                  onClick={onGoogleSignIn}
                  disabled={authState.isLoading}
                  title={isBn ? 'গুগল দিয়ে সরাসরি সাইন-ইন ও ড্রাইভ কানেক্ট' : 'Direct Google OAuth & Drive access'}
                  className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition shadow-2xs disabled:opacity-60 cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                  >
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
                  <span>Google</span>
                </button>

                {onConnectDemoWorkspace && (
                  <button
                    type="button"
                    id="connect-demo-workspace-btn"
                    onClick={onConnectDemoWorkspace}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium hover:bg-slate-100 hover:text-slate-900 transition shadow-2xs cursor-pointer"
                    title={
                      isBn
                        ? 'লগইন ছাড়াই ডেমো টেস্ট করুন'
                        : 'Test with Demo workspace without signing in'
                    }
                  >
                    <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isBn ? 'ডেমো' : 'Demo'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-100 py-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            id="nav-tab-categories"
            onClick={() => onSelectTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'categories'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {isBn ? '১-৫ প্রধান ক্যাটাগরি' : 'Top 5 SaaS Categories'}
          </button>

          <button
            type="button"
            id="nav-tab-drive"
            onClick={() => onSelectTab('drive')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'drive'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            {isBn ? 'ডকুমেন্ট ইন্টেলিজেন্স ও ড্রাইভ' : 'Document Intelligence & Drive'}
            {authState.accessToken && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            type="button"
            id="nav-tab-activity"
            onClick={() => onSelectTab('activity')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isBn ? 'কমপ্লায়েন্স অ্যাক্টিভিটি লগ' : 'Compliance Activity Log'}
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold">
              Firestore
            </span>
          </button>

          <button
            type="button"
            id="nav-tab-calculator"
            onClick={() => onSelectTab('calculator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'calculator'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            {isBn ? 'রেভিনিউ মডেল ও প্রফিট ক্যালকুলেটর' : 'Revenue & Profit Modeler'}
          </button>

          <button
            type="button"
            id="nav-tab-architect"
            onClick={() => onSelectTab('architect')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'architect'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {isBn ? 'ইন্ডাস্ট্রি ও টেক স্ট্যাক অ্যাডভাইজার' : 'Tech Stack & Architecture Advisor'}
          </button>
        </nav>
      </div>
    </header>
  );
};
