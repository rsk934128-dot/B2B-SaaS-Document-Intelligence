import React, { useState, useEffect } from 'react';
import { AuthState, Language } from './types';
import {
  initAuth,
  googleSignIn,
  logout,
  connectDemoWorkspace,
  registerWithEmailPassword,
  loginWithEmailPassword,
  sendPasswordReset,
  getAuthErrorMessage,
} from './services/firebaseAuth';
import { syncUserProfile, logActivityToFirestore } from './services/firestoreService';
import { Header } from './components/Header';
import { CategoryExplorer } from './components/CategoryExplorer';
import { DocumentIntelligence } from './components/DocumentIntelligence';
import { ActivityLog } from './components/ActivityLog';
import { RevenueCalculator } from './components/RevenueCalculator';
import { ArchitectureAdvisor } from './components/ArchitectureAdvisor';
import { AuthModal } from './components/AuthModal';
import {
  Sparkles,
  HardDrive,
  ShieldCheck,
  TrendingUp,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('bn');
  const [currentTab, setCurrentTab] = useState<
    'categories' | 'drive' | 'activity' | 'calculator' | 'architect'
  >('categories');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-inv-001');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Firebase auth & workspace state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: false,
    error: null,
  });

  // Listen to auth changes
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setAuthState({
          user: {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          },
          accessToken: token,
          isLoading: false,
          error: null,
        });

        // Sync user profile to Firestore
        syncUserProfile(user.uid, user.email, user.displayName, language).catch((e) =>
          console.warn('Profile sync warning:', e.message)
        );
      },
      (err) => {
        // Not authenticated or token not cached
        setAuthState((prev) => {
          if (prev.accessToken?.startsWith('demo-')) {
            return prev;
          }
          return {
            ...prev,
            isLoading: false,
            accessToken: null,
          };
        });
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [language]);

  const handleGoogleSignIn = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await googleSignIn();
      if (result.cancelled || !result.accessToken) {
        // User closed or dismissed the popup window - reset loading silently with no error
        setAuthState((prev) => ({ ...prev, isLoading: false, error: null }));
        return;
      }

      setAuthState({
        user: result.user,
        accessToken: result.accessToken,
        isLoading: false,
        error: null,
      });

      if (result.user?.uid) {
        syncUserProfile(result.user.uid, result.user.email, result.user.displayName, language).catch((e) =>
          console.warn('Profile sync warning:', e.message)
        );

        // Record workspace login to Firestore activity log
        logActivityToFirestore({
          userId: result.user.uid,
          actionType: 'WORKSPACE_AUTH',
          docName: 'Google Identity Services (GSI)',
          docType: 'auth',
          details: `User ${result.user.email} authenticated with Google Drive file access permissions.`,
          complianceStatus: 'COMPLIANT',
          riskScore: 0,
          clientEnvironment: 'OAuth2 Web Client Popup',
        }).catch((e) => console.warn('Activity log error:', e));
      }

      // Direct user towards Document Intelligence tab
      setCurrentTab('drive');
    } catch (err: any) {
      const isCancelled =
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        (typeof err?.message === 'string' && err.message.includes('popup-closed-by-user'));

      if (isCancelled) {
        setAuthState((prev) => ({ ...prev, isLoading: false, error: null }));
        return;
      }

      const isBn = language === 'bn';
      const errorMsg =
        err?.code === 'auth/popup-blocked'
          ? (isBn
              ? 'ব্রাউজারে পপআপ ব্লক করা হয়েছে। অনুগ্রহ করে পপআপ অনুমোদন করুন বা ডেমো মোড বেছে নিন।'
              : 'Sign-in popup was blocked by browser. Please enable popups or try Demo Workspace.')
          : (err.message || 'Authentication failed');

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
    }
  };

  const handleEmailRegister = async (email: string, pass: string, name: string) => {
    try {
      const result = await registerWithEmailPassword(email, pass, name);
      if (!result.user) throw new Error('Registration failed');

      setAuthState({
        user: result.user,
        accessToken: result.accessToken || null,
        isLoading: false,
        error: null,
      });

      await syncUserProfile(result.user.uid, result.user.email, result.user.displayName || name, language);

      await logActivityToFirestore({
        userId: result.user.uid,
        actionType: 'WORKSPACE_AUTH',
        docName: 'Firebase Auth (Email/Password Registration)',
        docType: 'auth',
        details: `Enterprise user ${result.user.email} registered. Account profile and audit partition initialized.`,
        complianceStatus: 'COMPLIANT',
        riskScore: 0,
        clientEnvironment: 'Firebase Cloud Authentication (asia-southeast1)',
      });
    } catch (err: any) {
      const msg = getAuthErrorMessage(err, language === 'bn');
      throw new Error(msg);
    }
  };

  const handleEmailLogin = async (email: string, pass: string) => {
    try {
      const result = await loginWithEmailPassword(email, pass);
      if (!result.user) throw new Error('Authentication failed');

      setAuthState({
        user: result.user,
        accessToken: result.accessToken || null,
        isLoading: false,
        error: null,
      });

      await syncUserProfile(result.user.uid, result.user.email, result.user.displayName, language);

      await logActivityToFirestore({
        userId: result.user.uid,
        actionType: 'WORKSPACE_AUTH',
        docName: 'Firebase Auth (Email/Password Login)',
        docType: 'auth',
        details: `Enterprise user ${result.user.email} signed in. Cloud Firestore session established.`,
        complianceStatus: 'COMPLIANT',
        riskScore: 0,
        clientEnvironment: 'Firebase Cloud Authentication (asia-southeast1)',
      });
    } catch (err: any) {
      const msg = getAuthErrorMessage(err, language === 'bn');
      throw new Error(msg);
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordReset(email);
    } catch (err: any) {
      const msg = getAuthErrorMessage(err, language === 'bn');
      throw new Error(msg);
    }
  };

  const handleConnectDemoWorkspace = () => {
    const demo = connectDemoWorkspace();
    setAuthState({
      user: demo.user,
      accessToken: demo.accessToken,
      isLoading: false,
      error: null,
    });
    setCurrentTab('drive');
  };

  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setAuthState({
        user: null,
        accessToken: null,
        isLoading: false,
        error: null,
      });
    } catch {
      setAuthState({
        user: null,
        accessToken: null,
        isLoading: false,
        error: null,
      });
    }
  };

  const handleOpenSampleInAuditor = (sampleDocId: string) => {
    setSelectedSampleId(sampleDocId);
    setCurrentTab('drive');
  };

  const isBn = language === 'bn';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navigation & App Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onToggleLanguage={setLanguage}
        authState={authState}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onConnectDemoWorkspace={handleConnectDemoWorkspace}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Auth Error Banner if present */}
      {authState.error && (
        <div className="bg-rose-50 border-b border-rose-200 py-2 px-4 text-xs text-rose-800 text-center flex items-center justify-center gap-2">
          <span>{authState.error}</span>
          <button
            type="button"
            onClick={() => setAuthState((prev) => ({ ...prev, error: null }))}
            className="font-bold underline cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'categories' && (
          <CategoryExplorer
            language={language}
            onOpenSampleInAuditor={handleOpenSampleInAuditor}
          />
        )}

        {currentTab === 'drive' && (
          <DocumentIntelligence
            language={language}
            authState={authState}
            onGoogleSignIn={handleGoogleSignIn}
            onConnectDemoWorkspace={handleConnectDemoWorkspace}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            selectedSampleId={selectedSampleId}
          />
        )}

        {currentTab === 'activity' && (
          <ActivityLog
            language={language}
            authState={authState}
            onNavigateToAuditor={() => setCurrentTab('drive')}
            onGoogleSignIn={handleGoogleSignIn}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'calculator' && <RevenueCalculator language={language} />}

        {currentTab === 'architect' && <ArchitectureAdvisor language={language} />}
      </main>

      {/* Modal for Firebase Email/Password Registration and Sign-in */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
        onRegister={handleEmailRegister}
        onLogin={handleEmailLogin}
        onPasswordReset={handlePasswordReset}
        onGoogleSignIn={handleGoogleSignIn}
        onConnectDemoWorkspace={handleConnectDemoWorkspace}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              {isBn ? 'B2B SaaS ও ডকুমেন্ট ইন্টেলিজেন্স' : 'B2B SaaS & Document Intelligence Platform'}
            </span>
            <span>•</span>
            <span>{isBn ? 'গুগল ড্রাইভ ও এআই ওয়ার্কফ্লো' : 'Google Drive & AI Workflow Engine'}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isBn ? 'OAuth ড্রাইভ রিড/রাইট কমপ্লায়েন্ট' : 'OAuth Drive Read/Write Ready'}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {isBn ? 'উচ্চ আয় ও লো-চর্ন B2B মডেল' : 'High-Retention Enterprise SaaS'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
