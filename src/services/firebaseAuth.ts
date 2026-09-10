import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Storage keys for persistent sessions
const DRIVE_TOKEN_KEY = 'b2b_saas_drive_token';
const DEMO_USER_KEY = 'b2b_saas_demo_user';

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with required Drive scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory access token cache with sessionStorage backing
let cachedAccessToken: string | null = null;
try {
  cachedAccessToken = sessionStorage.getItem(DRIVE_TOKEN_KEY);
} catch {
  // Ignore sessionStorage access errors in restricted iframe
}
let isSigningIn = false;

export interface SignInResult {
  user: {
    uid?: string | null;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
  accessToken: string | null;
  cancelled?: boolean;
}

/**
 * Initialize persistent auth listener.
 * Preserves user session and restores credentials and Firestore connection across page reloads.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: (error?: string) => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Clear demo flag if a real user is signed in
      try {
        sessionStorage.removeItem(DEMO_USER_KEY);
      } catch {}

      // Retrieve cached Drive token if available
      let driveToken = cachedAccessToken;
      if (!driveToken) {
        try {
          driveToken = sessionStorage.getItem(DRIVE_TOKEN_KEY);
          if (driveToken) cachedAccessToken = driveToken;
        } catch {}
      }

      if (onAuthSuccess) {
        onAuthSuccess(user, driveToken || null);
      }
    } else {
      // Check if demo workspace was active in session
      let isDemoActive = false;
      try {
        isDemoActive = sessionStorage.getItem(DEMO_USER_KEY) === 'true';
      } catch {}

      if (isDemoActive && cachedAccessToken?.startsWith('demo-')) {
        // Keep demo active
        return;
      }

      if (!cachedAccessToken?.startsWith('demo-')) {
        cachedAccessToken = null;
        try {
          sessionStorage.removeItem(DRIVE_TOKEN_KEY);
        } catch {}
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Register a new user with Email and Password in Firebase Auth.
 * Automatically saves user record and profile in Firebase.
 */
export const registerWithEmailPassword = async (
  email: string,
  password: string,
  displayName?: string
): Promise<SignInResult> => {
  try {
    isSigningIn = true;
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

    if (displayName && displayName.trim()) {
      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      });
    }

    // Check if there was already an access token stored
    let driveToken = cachedAccessToken;
    if (!driveToken) {
      try {
        driveToken = sessionStorage.getItem(DRIVE_TOKEN_KEY);
      } catch {}
    }

    return {
      user: {
        uid: credential.user.uid,
        displayName: displayName?.trim() || credential.user.displayName,
        email: credential.user.email,
        photoURL: credential.user.photoURL,
      },
      accessToken: driveToken || null,
    };
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign in existing user with Email and Password in Firebase Auth.
 */
export const loginWithEmailPassword = async (
  email: string,
  password: string
): Promise<SignInResult> => {
  try {
    isSigningIn = true;
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

    let driveToken = cachedAccessToken;
    if (!driveToken) {
      try {
        driveToken = sessionStorage.getItem(DRIVE_TOKEN_KEY);
      } catch {}
    }

    return {
      user: {
        uid: credential.user.uid,
        displayName: credential.user.displayName,
        email: credential.user.email,
        photoURL: credential.user.photoURL,
      },
      accessToken: driveToken || null,
    };
  } finally {
    isSigningIn = false;
  }
};

/**
 * Send password reset email to user via Firebase Auth
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email.trim());
};

/**
 * Sign in or link with Google Workspace OAuth (with Google Drive scopes)
 */
export const googleSignIn = async (): Promise<SignInResult> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get Google Drive access token from authentication');
    }

    cachedAccessToken = credential.accessToken;
    try {
      sessionStorage.setItem(DRIVE_TOKEN_KEY, credential.accessToken);
      sessionStorage.removeItem(DEMO_USER_KEY);
    } catch {}

    return {
      user: {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      },
      accessToken: cachedAccessToken,
    };
  } catch (error: any) {
    const isCancelled =
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      (typeof error?.message === 'string' && error.message.includes('popup-closed-by-user'));

    if (isCancelled) {
      return {
        user: null,
        accessToken: null,
        cancelled: true,
      };
    }

    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by browser. Please enable popups or try the Demo Workspace.');
    }

    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Connect Demo Workspace for instant evaluation without logging in
 */
export const connectDemoWorkspace = (): SignInResult => {
  cachedAccessToken = 'demo-enterprise-workspace-token';
  try {
    sessionStorage.setItem(DEMO_USER_KEY, 'true');
    sessionStorage.setItem(DRIVE_TOKEN_KEY, cachedAccessToken);
  } catch {}

  return {
    user: {
      uid: 'demo-user-101',
      displayName: 'Enterprise B2B Auditor (Demo)',
      email: 'demo.auditor@enterprise.cloud',
      photoURL: null,
    },
    accessToken: cachedAccessToken,
  };
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    return sessionStorage.getItem(DRIVE_TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Sign out and clear all cached sessions
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch {
    // Ignore signOut errors if only in demo mode
  } finally {
    cachedAccessToken = null;
    try {
      sessionStorage.removeItem(DRIVE_TOKEN_KEY);
      sessionStorage.removeItem(DEMO_USER_KEY);
    } catch {}
  }
};

/**
 * Translate common Firebase Auth error codes to user-friendly messages in BN & EN
 */
export const getAuthErrorMessage = (error: any, isBn: boolean): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return isBn
        ? 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত আছে। অনুগ্রহ করে লগইন করুন।'
        : 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return isBn
        ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন।'
        : 'Please provide a valid email address.';
    case 'auth/weak-password':
      return isBn
        ? 'পাসওয়ার্ডটি খুব সহজ। অনুগ্রহ করে অন্তত ৬ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।'
        : 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return isBn
        ? 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।'
        : 'Invalid email or password. Please verify and try again.';
    case 'auth/too-many-requests':
      return isBn
        ? 'অতিরিক্ত ভুল প্রচেষ্টার কারণে সাময়িকভাবে বন্ধ করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'
        : 'Access temporarily blocked due to multiple failed attempts. Try again later.';
    case 'auth/network-request-failed':
      return isBn
        ? 'ইন্টারনেট সংযোগ বিচ্ছিন্ন অথবা নেটওয়ার্ক সমস্যা। সংযোগ পরীক্ষা করুন।'
        : 'Network connection issue. Please check your network connection.';
    case 'auth/popup-blocked':
      return isBn
        ? 'ব্রাউজারে পপআপ ব্লক করা হয়েছে। অনুগ্রহ করে পপআপ অনুমোদন করুন।'
        : 'Popup was blocked by your browser. Please allow popups for this site.';
    default:
      return error?.message || (isBn ? 'অথেনটিকেশন ব্যর্থ হয়েছে।' : 'Authentication failed.');
  }
};

