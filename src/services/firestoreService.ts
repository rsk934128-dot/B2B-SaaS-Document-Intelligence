import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { app, auth } from './firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  DocumentAuditResult,
  Language,
  ActivityLogItem,
  ActivityActionType,
  ComplianceStatusType,
} from '../types';

// Initialize Firestore with custom databaseId as required by Firebase skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot as required by Firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface SavedAuditItem {
  id: string;
  userId: string;
  docName: string;
  docType: string;
  riskScore: number;
  confidenceScore: number;
  summaryBn?: string;
  summaryEn?: string;
  potentialSavings?: string;
  currency?: string;
  createdAt?: any;
}

/**
 * Save an audit result to user's audits subcollection
 */
export async function saveAuditToFirestore(
  userId: string,
  audit: DocumentAuditResult
): Promise<string> {
  const auditId = `audit_${Date.now()}`;
  const path = `users/${userId}/audits/${auditId}`;

  const cleanDocName = (audit.docName || 'Document').slice(0, 255);
  const cleanDocType = (audit.docType || 'general').slice(0, 60);

  const payload = {
    userId,
    docName: cleanDocName,
    docType: cleanDocType,
    riskScore: Math.max(0, Math.min(100, Math.round(audit.riskScore))),
    confidenceScore: Math.max(0, Math.min(100, Math.round(audit.confidenceScore))),
    summaryBn: (audit.summaryBn || '').slice(0, 1990),
    summaryEn: (audit.summaryEn || '').slice(0, 1990),
    potentialSavings: (audit.financialImpact?.potentialSavingsOrTotal || '').slice(0, 120),
    currency: (audit.financialImpact?.currency || '$').slice(0, 15),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', userId, 'audits', auditId), payload);
    return auditId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Subscribe to user's saved audits in real-time
 */
export function subscribeToUserAudits(
  userId: string,
  onUpdate: (audits: SavedAuditItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = `users/${userId}/audits`;
  const auditsCol = collection(db, 'users', userId, 'audits');
  const q = query(auditsCol, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedAuditItem[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: d.userId,
          docName: d.docName,
          docType: d.docType,
          riskScore: d.riskScore,
          confidenceScore: d.confidenceScore,
          summaryBn: d.summaryBn,
          summaryEn: d.summaryEn,
          potentialSavings: d.potentialSavings,
          currency: d.currency,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt,
        };
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Delete a saved audit from Firestore
 */
export async function deleteAuditFromFirestore(userId: string, auditId: string): Promise<void> {
  const path = `users/${userId}/audits/${auditId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'audits', auditId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Sync user profile to Firestore
 */
export async function syncUserProfile(
  userId: string,
  email: string,
  displayName?: string | null,
  preferredLanguage?: Language
): Promise<void> {
  const path = `users/${userId}`;
  const userDocRef = doc(db, 'users', userId);

  const payload: Record<string, any> = {
    userId,
    email: email.slice(0, 250),
    createdAt: serverTimestamp(),
  };

  if (displayName) {
    payload.displayName = displayName.slice(0, 120);
  }
  if (preferredLanguage) {
    payload.preferredLanguage = preferredLanguage;
  }

  try {
    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface LogActivityParams {
  userId: string;
  actionType: ActivityActionType;
  details: string;
  complianceStatus: ComplianceStatusType;
  docName?: string;
  docType?: string;
  riskScore?: number;
  clientEnvironment?: string;
}

/**
 * Log user action to Firestore for enterprise compliance auditing
 */
export async function logActivityToFirestore(params: LogActivityParams): Promise<string> {
  const logId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${params.userId}/activity_logs/${logId}`;
  const logDocRef = doc(db, 'users', params.userId, 'activity_logs', logId);

  const payload: Record<string, any> = {
    userId: params.userId,
    actionType: params.actionType,
    details: params.details.slice(0, 950),
    complianceStatus: params.complianceStatus,
    createdAt: serverTimestamp(),
  };

  if (params.docName) payload.docName = params.docName.slice(0, 250);
  if (params.docType) payload.docType = params.docType.slice(0, 60);
  if (typeof params.riskScore === 'number') {
    payload.riskScore = Math.max(0, Math.min(100, Math.round(params.riskScore)));
  }
  if (params.clientEnvironment) {
    payload.clientEnvironment = params.clientEnvironment.slice(0, 120);
  }

  try {
    await setDoc(logDocRef, payload);
    return logId;
  } catch (error) {
    console.warn('Activity log write note (non-blocking):', error);
    return logId;
  }
}

/**
 * Real-time listener for user compliance activity logs
 */
export function subscribeToUserActivityLogs(
  userId: string,
  onUpdate: (logs: ActivityLogItem[]) => void,
  onError?: (error: Error) => void
) {
  const path = `users/${userId}/activity_logs`;
  const logsCol = collection(db, 'users', userId, 'activity_logs');
  const q = query(logsCol, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ActivityLogItem[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: d.userId,
          actionType: d.actionType as ActivityActionType,
          docName: d.docName,
          docType: d.docType,
          details: d.details || '',
          complianceStatus: (d.complianceStatus as ComplianceStatusType) || 'INFO',
          riskScore: d.riskScore,
          clientEnvironment: d.clientEnvironment,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt,
        };
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Delete an activity log entry (compliance management)
 */
export async function deleteActivityLogFromFirestore(userId: string, logId: string): Promise<void> {
  const path = `users/${userId}/activity_logs/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'activity_logs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
