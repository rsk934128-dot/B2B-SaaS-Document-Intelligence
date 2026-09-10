import React, { useState, useEffect } from 'react';
import { AuthState, DocumentAuditResult, DriveFile, Language, ComplianceStatusType } from '../types';
import {
  listDriveFiles,
  fetchFileContent,
  saveReportToDrive,
  SAMPLE_DOCUMENTS,
  SampleDoc,
} from '../services/driveService';
import { analyzeDocument } from '../services/auditEngine';
import {
  saveAuditToFirestore,
  subscribeToUserAudits,
  deleteAuditFromFirestore,
  logActivityToFirestore,
  SavedAuditItem,
} from '../services/firestoreService';
import {
  HardDrive,
  FileText,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Download,
  Save,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  Database,
  Trash2,
  History,
  Cloud,
  User,
} from 'lucide-react';

interface DocumentIntelligenceProps {
  language: Language;
  authState: AuthState;
  onGoogleSignIn: () => void;
  onConnectDemoWorkspace?: () => void;
  onOpenAuthModal?: () => void;
  selectedSampleId?: string;
}

export const DocumentIntelligence: React.FC<DocumentIntelligenceProps> = ({
  language,
  authState,
  onGoogleSignIn,
  onConnectDemoWorkspace,
  onOpenAuthModal,
  selectedSampleId,
}) => {
  const isBn = language === 'bn';

  // State for Google Drive
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  // Active document selection & audit state
  const [selectedDocName, setSelectedDocName] = useState<string>('Enterprise_Tech_Invoice_INV-8492.txt');
  const [docContent, setDocContent] = useState<string>(SAMPLE_DOCUMENTS[0].fullContent);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<DocumentAuditResult | null>(null);
  const [showRawContent, setShowRawContent] = useState<boolean>(false);

  // Drive save feedback
  const [isSavingToDrive, setIsSavingToDrive] = useState<boolean>(false);
  const [driveSaveSuccess, setDriveSaveSuccess] = useState<{ name: string; url?: string } | null>(
    null
  );
  const [driveSaveError, setDriveSaveError] = useState<string | null>(null);

  // Firestore Cloud Persistence state
  const [savedAudits, setSavedAudits] = useState<SavedAuditItem[]>([]);
  const [isSavingToFirestore, setIsSavingToFirestore] = useState<boolean>(false);
  const [firestoreSaveSuccess, setFirestoreSaveSuccess] = useState<boolean>(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'analysis' | 'firestore_history'>('analysis');

  // Real-time Firestore subscription for authenticated user
  useEffect(() => {
    const uid = authState.user?.uid;
    if (uid && !authState.accessToken?.startsWith('demo-')) {
      const unsub = subscribeToUserAudits(
        uid,
        (audits) => {
          setSavedAudits(audits);
        },
        (err) => {
          console.warn('Firestore subscription status:', err.message);
        }
      );
      return () => unsub();
    }
  }, [authState.user?.uid, authState.accessToken]);

  // Load sample if specified from parent
  useEffect(() => {
    if (selectedSampleId) {
      const found = SAMPLE_DOCUMENTS.find((d) => d.id === selectedSampleId);
      if (found) {
        setSelectedDocName(found.name);
        setDocContent(found.fullContent);
        runAudit(found.name, found.fullContent);
      }
    }
  }, [selectedSampleId]);

  // Initial audit run
  useEffect(() => {
    if (!auditResult) {
      runAudit(selectedDocName, docContent);
    }
  }, []);

  // Fetch real Google Drive files whenever access token is present
  useEffect(() => {
    if (authState.accessToken) {
      loadDriveFiles(authState.accessToken);
    }
  }, [authState.accessToken]);

  const loadDriveFiles = async (token: string) => {
    setIsLoadingFiles(true);
    setFileError(null);
    try {
      const files = await listDriveFiles(token, searchQuery, filterType);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
      setFileError(err.message || 'Failed to load files from Google Drive');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSelectDriveFile = async (file: DriveFile) => {
    if (!authState.accessToken) return;
    setIsAuditing(true);
    setSelectedDocName(file.name);
    try {
      const content = await fetchFileContent(authState.accessToken, file.id, file.mimeType);
      setDocContent(content);
      await runAudit(file.name, content);
    } catch (err: any) {
      console.error('Failed to load file from drive:', err);
      setFileError(err.message || 'Failed to load file content from Google Drive');
      // If binary or unexportable, fallback to auditing metadata
      const mockMetaContent = `FILE: ${file.name}\nTYPE: ${file.mimeType}\nMODIFIED: ${file.modifiedTime}\nSIZE: ${file.size || 'Unknown'}`;
      setDocContent(mockMetaContent);
      await runAudit(file.name, mockMetaContent);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSelectSample = (sample: SampleDoc) => {
    setSelectedDocName(sample.name);
    setDocContent(sample.fullContent);
    runAudit(sample.name, sample.fullContent);
  };

  const runAudit = async (name: string, content: string) => {
    setIsAuditing(true);
    setDriveSaveSuccess(null);
    try {
      const res = await analyzeDocument(name, content);
      setAuditResult(res);

      // Automatically log compliance activity to Firestore if user is authenticated
      const uid = authState.user?.uid;
      if (uid && !authState.accessToken?.startsWith('demo-')) {
        const complianceStatus: ComplianceStatusType =
          res.riskScore >= 70 ? 'FLAGGED' : res.riskScore >= 30 ? 'REVIEW_REQUIRED' : 'COMPLIANT';

        logActivityToFirestore({
          userId: uid,
          actionType: 'DOC_ANALYZED',
          docName: res.docName,
          docType: res.docType,
          riskScore: res.riskScore,
          details: `Document processed: ${res.summaryEn.slice(0, 320)}`,
          complianceStatus,
          clientEnvironment: authState.accessToken ? 'Google Workspace API v3 (OAuth)' : 'Document Auditor Engine',
        }).catch((e) => console.warn('Activity log write error:', e));
      }
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!authState.accessToken || !auditResult) return;
    setIsSavingToDrive(true);
    try {
      const reportMarkdown = `# Document Intelligence & Audit Report
**Target Document**: ${auditResult.docName}
**Generated Date**: ${new Date().toISOString()}
**Document Category**: ${auditResult.docType}
**Risk Score**: ${auditResult.riskScore}/100 | **Confidence**: ${auditResult.confidenceScore}%

## Executive Summary
${auditResult.summaryEn}
${auditResult.summaryBn}

## Key Entities & Financial Metrics
${auditResult.keyEntities.map((e) => `- **${e.labelEn} (${e.labelBn})**: ${e.value} [${e.status}]`).join('\n')}

## Audit Findings & Flags
${auditResult.auditFindingsEn.map((f) => `- ${f}`).join('\n')}

## Compliance Status
${auditResult.complianceStatus
  .map(
    (c) =>
      `- **${c.standard}**: ${c.isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'} (${c.notesEn})`
  )
  .join('\n')}

## Recommended Action
${auditResult.suggestedActionEn}
`;

      const safeName = `Audit_Report_${auditResult.docName.replace(/[^a-zA-Z0-9_\-\.]/g, '_')}.md`;
      const uploaded = await saveReportToDrive(authState.accessToken, safeName, reportMarkdown);
      setDriveSaveSuccess({ name: uploaded.name, url: uploaded.webViewLink });
      setDriveSaveError(null);

      // Log export action for enterprise compliance audit trail
      const uid = authState.user?.uid;
      if (uid && !authState.accessToken?.startsWith('demo-')) {
        logActivityToFirestore({
          userId: uid,
          actionType: 'REPORT_EXPORTED_DRIVE',
          docName: auditResult.docName,
          docType: auditResult.docType,
          riskScore: auditResult.riskScore,
          details: `Audit report exported to Google Drive root folder: ${safeName}`,
          complianceStatus: 'COMPLIANT',
          clientEnvironment: 'Google Drive v3 API Export Engine',
        }).catch((e) => console.warn('Activity log write error:', e));
      }
    } catch (err: any) {
      setDriveSaveError(err.message || 'Failed to save report to Google Drive');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (!auditResult) return;
    const uid = authState.user?.uid;

    // In demo mode or offline test
    if (!uid || authState.accessToken?.startsWith('demo-')) {
      const mockSaved: SavedAuditItem = {
        id: `audit_demo_${Date.now()}`,
        userId: uid || 'demo-user-101',
        docName: auditResult.docName,
        docType: auditResult.docType,
        riskScore: auditResult.riskScore,
        confidenceScore: auditResult.confidenceScore,
        summaryBn: auditResult.summaryBn,
        summaryEn: auditResult.summaryEn,
        potentialSavings: auditResult.financialImpact?.potentialSavingsOrTotal,
        currency: auditResult.financialImpact?.currency,
        createdAt: new Date(),
      };
      setSavedAudits((prev) => [mockSaved, ...prev]);
      setFirestoreSaveSuccess(true);
      setFirestoreError(null);
      setTimeout(() => setFirestoreSaveSuccess(false), 4500);
      return;
    }

    setIsSavingToFirestore(true);
    setFirestoreError(null);
    try {
      await saveAuditToFirestore(uid, auditResult);
      setFirestoreSaveSuccess(true);
      setTimeout(() => setFirestoreSaveSuccess(false), 4500);

      // Log save action to activity log
      logActivityToFirestore({
        userId: uid,
        actionType: 'AUDIT_SAVED',
        docName: auditResult.docName,
        docType: auditResult.docType,
        riskScore: auditResult.riskScore,
        details: `Audit findings and risk analytics securely saved to Firestore cloud database.`,
        complianceStatus: auditResult.riskScore >= 70 ? 'FLAGGED' : 'COMPLIANT',
        clientEnvironment: 'Firestore Cloud asia-southeast1',
      }).catch((e) => console.warn('Activity log write error:', e));
    } catch (err: any) {
      setFirestoreError(err.message || 'Failed to save audit to Firebase Firestore');
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  const handleDeleteSavedAudit = async (auditId: string) => {
    const uid = authState.user?.uid;
    if (!uid || authState.accessToken?.startsWith('demo-')) {
      setSavedAudits((prev) => prev.filter((a) => a.id !== auditId));
      return;
    }
    try {
      await deleteAuditFromFirestore(uid, auditId);

      // Log deletion action for enterprise audit trail
      logActivityToFirestore({
        userId: uid,
        actionType: 'AUDIT_DELETED',
        docName: auditId,
        details: `User revoked/deleted audit record id [${auditId}] from Firestore.`,
        complianceStatus: 'INFO',
        clientEnvironment: 'Firestore asia-southeast1',
      }).catch((e) => console.warn('Activity log write error:', e));
    } catch (err: any) {
      setFirestoreError(err.message || 'Failed to delete audit from Firestore');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>
              {isBn
                ? 'ক্যাটাগরি ২: এআই ওয়ার্কফ্লো ও ডকুমেন্ট ইন্টেলিজেন্স'
                : 'Category 2: Document Intelligence & Enterprise Audit'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isBn
              ? 'গুগল ড্রাইভ কানেকশন ও স্বায়ত্তশাসিত অডিট ইঞ্জিন'
              : 'Google Drive Document Intelligence & Audit Engine'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            {isBn
              ? 'চালান (Invoice), আইনি চুক্তি (Contract), ক্লাউড বিল (Cloud Bill), বা ISO 20022 ফাইন্যান্সিয়াল মেসেজ স্ক্যান করে রিয়েল-টাইমে অডিট ও অসঙ্গতি শনাক্ত করুন।'
              : 'Autonomous 3-way reconciliation, entity extraction, discrepancy flagging, and compliance verification connected to Google Drive.'}
          </p>
        </div>

        {/* Auth & Drive CTA */}
        {!authState.user ? (
          <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div>
              <span className="block text-xs font-semibold text-slate-800">
                {isBn ? 'ফায়ারবেস ক্লাউড সেভ চালু রাখুন' : 'Enable Firebase Cloud Persistence'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isBn
                  ? 'রেজিস্ট্রেশন বা লগইন করলে আপনার অডিট ও রিপোর্ট সুরক্ষিতভাবে সেভ থাকবে।'
                  : 'Register or log in so your document audit trail persists in Firestore.'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenAuthModal && (
                <button
                  type="button"
                  id="doc-auth-modal-btn"
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isBn ? 'লগইন / রেজিস্টার' : 'Sign In / Register'}</span>
                </button>
              )}
              <button
                type="button"
                id="drive-connect-action-btn"
                onClick={onGoogleSignIn}
                disabled={authState.isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                <span>{isBn ? 'গুগল ড্রাইভ' : 'Google Drive'}</span>
              </button>
            </div>
          </div>
        ) : !authState.accessToken ? (
          <div className="shrink-0 bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isBn ? 'ফায়ারস্টোর ক্লাউড সংযুক্ত' : 'Firestore Cloud Active'}</span>
              </div>
              <span className="text-[11px] text-indigo-700">
                {isBn
                  ? 'আপনার সমস্ত অডিট ফায়ারবেসে সুরক্ষিতভাবে সেভ হচ্ছে।'
                  : 'All audits are securely saved to your private Firestore account.'}
              </span>
            </div>
            <button
              type="button"
              id="drive-connect-action-btn"
              onClick={onGoogleSignIn}
              disabled={authState.isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 transition shadow-2xs cursor-pointer shrink-0"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              <span>{isBn ? '+ গুগল ড্রাইভ যুক্ত করুন' : '+ Connect Google Drive'}</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Explorer (Google Drive + Sample Documents) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Preset Sample B2B Documents */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>{isBn ? '৫টি ক্যাটাগরির ডেমো ডকুমেন্ট' : 'Preset B2B Documents'}</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {isBn ? 'তাত্ক্ষণিক টেস্ট' : 'Ready to Test'}
              </span>
            </h3>

            <div className="space-y-2">
              {SAMPLE_DOCUMENTS.map((sample) => {
                const isSelected = selectedDocName === sample.name;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    id={`sample-doc-${sample.id}`}
                    onClick={() => handleSelectSample(sample)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition border ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-2xs font-medium'
                        : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate pr-2">
                        {sample.name}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-blue-700 font-medium mt-0.5 truncate">
                      {isBn ? sample.categoryTitleBn : sample.categoryTitleEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Google Drive Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {isBn ? 'আপনার গুগল ড্রাইভ ফাইল' : 'Your Google Drive Files'}
                </h3>
              </div>
              {authState.accessToken && (
                <button
                  type="button"
                  id="refresh-drive-btn"
                  onClick={() => authState.accessToken && loadDriveFiles(authState.accessToken)}
                  disabled={isLoadingFiles}
                  title={isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {authState.accessToken ? (
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    id="drive-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      authState.accessToken &&
                      loadDriveFiles(authState.accessToken)
                    }
                    placeholder={
                      isBn ? 'ফাইল খুঁজুন (যেমন: invoice, contract)...' : 'Search files in Drive...'
                    }
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterType('all');
                      if (authState.accessToken) loadDriveFiles(authState.accessToken);
                    }}
                    className={`px-2 py-0.5 rounded ${
                      filterType === 'all'
                        ? 'bg-slate-800 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isBn ? 'সব' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterType('documents');
                      if (authState.accessToken) loadDriveFiles(authState.accessToken);
                    }}
                    className={`px-2 py-0.5 rounded ${
                      filterType === 'documents'
                        ? 'bg-slate-800 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isBn ? 'ডকুমেন্টস / PDF' : 'Docs / PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterType('spreadsheets');
                      if (authState.accessToken) loadDriveFiles(authState.accessToken);
                    }}
                    className={`px-2 py-0.5 rounded ${
                      filterType === 'spreadsheets'
                        ? 'bg-slate-800 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isBn ? 'স্প্রেডশিট' : 'Sheets'}
                  </button>
                </div>

                {/* File List */}
                <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1">
                  {isLoadingFiles ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-blue-600" />
                      <span>{isBn ? 'ড্রাইভ থেকে ফাইল লোড হচ্ছে...' : 'Loading Drive files...'}</span>
                    </div>
                  ) : driveFiles.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                      <p>{isBn ? 'কোনো ফাইল খুঁজে পাওয়া যায়নি' : 'No matching files found'}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isBn
                          ? 'অন্য কোনো সার্চ কিওয়ার্ড দিয়ে চেষ্টা করুন অথবা ডেমো ফাইল অডিট করুন।'
                          : 'Try a different search or use the preset demo documents.'}
                      </p>
                    </div>
                  ) : (
                    driveFiles.map((file) => {
                      const isSelected = selectedDocName === file.name;
                      return (
                        <button
                          key={file.id}
                          type="button"
                          id={`drive-file-${file.id}`}
                          onClick={() => handleSelectDriveFile(file)}
                          className={`w-full text-left p-2 rounded-lg text-xs transition border flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 text-blue-900'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {file.mimeType.includes('spreadsheet') ? (
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            )}
                            <span className="truncate font-medium">{file.name}</span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 text-center space-y-2.5 border border-dashed border-slate-200">
                <p className="text-xs text-slate-600 font-medium">
                  {isBn
                    ? 'আপনার গুগল ড্রাইভের আসল ফাইল সরাসরি অডিট করতে সাইন ইন করুন অথবা ডেমো ড্রাইভ দিয়ে পরীক্ষা করুন'
                    : 'Sign in to audit documents directly from your Google Drive or test with Demo Drive'}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    type="button"
                    id="drive-box-signin-btn"
                    onClick={onGoogleSignIn}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
                  >
                    {isBn ? 'ড্রাইভ সাইন-ইন' : 'Sign in with Google'}
                  </button>
                  {onConnectDemoWorkspace && (
                    <button
                      type="button"
                      id="drive-box-demo-btn"
                      onClick={onConnectDemoWorkspace}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 transition cursor-pointer"
                    >
                      {isBn ? 'ডেমো ড্রাইভ স্পেস' : 'Use Demo Drive'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Automated Document Intelligence & Audit Results */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
            {/* Document Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {isBn ? 'অডিট পর্যালোচনা' : 'Active Document'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedDocName}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isBn ? 'স্বয়ংক্রিয় এআই অডিট ও ইনটেলিজেন্স রিপোর্ট' : 'Autonomous AI Audit & Intelligence Report'}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  id="toggle-raw-doc-btn"
                  onClick={() => {
                    setShowRawContent(!showRawContent);
                    setActiveViewMode('analysis');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium hover:bg-slate-100 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showRawContent ? (isBn ? 'রিপোর্ট দেখুন' : 'View Report') : (isBn ? 'মূল টেক্সট' : 'Raw Document')}</span>
                </button>

                {/* Save to Firestore Button */}
                <button
                  type="button"
                  id="save-report-firestore-btn"
                  onClick={handleSaveToFirestore}
                  disabled={isSavingToFirestore || !auditResult}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>
                    {isSavingToFirestore
                      ? isBn
                        ? 'ক্লাউডে সেভ হচ্ছে...'
                        : 'Saving to Cloud...'
                      : isBn
                      ? 'ক্লাউডে সেভ (Firestore)'
                      : 'Save to Cloud (Firestore)'}
                  </span>
                </button>

                {authState.accessToken ? (
                  <button
                    type="button"
                    id="save-report-drive-btn"
                    onClick={handleSaveToDrive}
                    disabled={isSavingToDrive || !auditResult}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>
                      {isSavingToDrive
                        ? isBn
                          ? 'ড্রাইভে সেভ হচ্ছে...'
                          : 'Saving to Drive...'
                        : isBn
                        ? 'গুগল ড্রাইভে রিপোর্ট সেভ করুন'
                        : 'Save Report to Google Drive'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="signin-to-save-btn"
                    onClick={onGoogleSignIn}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition cursor-pointer"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ড্রাইভে সেভ করতে সাইন-ইন' : 'Sign in to Save to Drive'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* View Mode Switcher: Active Audit vs Firestore Cloud Saved History */}
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="view-mode-audit-btn"
                  onClick={() => {
                    setActiveViewMode('analysis');
                    setShowRawContent(false);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeViewMode === 'analysis' && !showRawContent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isBn ? 'সক্রিয় অডিট বিশ্লেষণ' : 'Active Audit Analysis'}</span>
                </button>

                <button
                  type="button"
                  id="view-mode-firestore-btn"
                  onClick={() => {
                    setActiveViewMode('firestore_history');
                    setShowRawContent(false);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeViewMode === 'firestore_history'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ক্লাউড হিস্ট্রি (Firestore)' : 'Firestore Saved Audits'}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeViewMode === 'firestore_history'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {savedAudits.length}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Cloud className="w-3 h-3 text-indigo-500" />
                <span>{isBn ? 'ফায়ারবেস ক্লাউড স্টোরেজ সিঙ্ক' : 'Firebase Cloud Sync'}</span>
              </div>
            </div>

            {/* Success Alert if saved to Firestore */}
            {firestoreSaveSuccess && (
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    {isBn
                      ? 'অডিট রেকর্ডটি ফায়ারবেস ক্লাউড ডেটাবেজে (Firestore) সফলভাবে সংরক্ষিত হয়েছে!'
                      : 'Audit record successfully persisted to Firebase Firestore cloud database!'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('firestore_history')}
                  className="font-bold underline ml-2 cursor-pointer text-indigo-700 hover:text-indigo-900"
                >
                  {isBn ? 'হিস্ট্রিতে দেখুন' : 'View in History'}
                </button>
              </div>
            )}

            {/* Error Alert if saved to Firestore failed */}
            {firestoreError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900">
                <span>{firestoreError}</span>
                <button
                  type="button"
                  onClick={() => setFirestoreError(null)}
                  className="font-bold underline ml-2 cursor-pointer text-rose-700"
                >
                  {isBn ? 'বন্ধ করুন' : 'Dismiss'}
                </button>
              </div>
            )}

            {/* Error Alert if saved to Drive failed */}
            {driveSaveError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900">
                <span>{driveSaveError}</span>
                <button
                  type="button"
                  onClick={() => setDriveSaveError(null)}
                  className="font-bold underline ml-2 cursor-pointer text-rose-700"
                >
                  {isBn ? 'বন্ধ করুন' : 'Dismiss'}
                </button>
              </div>
            )}

            {/* Success Alert if saved to Drive */}
            {driveSaveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isBn
                      ? `রিপোর্টটি আপনার গুগল ড্রাইভে "${driveSaveSuccess.name}" নামে সফলভাবে সংরক্ষিত হয়েছে!`
                      : `Report saved to your Google Drive as "${driveSaveSuccess.name}"!`}
                  </span>
                </div>
                {driveSaveSuccess.url && (
                  <a
                    href={driveSaveSuccess.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline shrink-0 ml-2"
                  >
                    <span>{isBn ? 'ড্রাইভে খুলুন' : 'Open in Drive'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {showRawContent ? (
              /* Raw Document Preview */
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isBn ? 'ফাইলের মূল টেক্সট কন্টেন্ট' : 'Raw Document Text'}
                </p>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-[480px] whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {docContent}
                </pre>
              </div>
            ) : isAuditing ? (
              /* Loading State */
              <div className="py-16 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
                <p className="text-sm font-semibold text-slate-800">
                  {isBn
                    ? 'ডকুমেন্ট ইন্টেলিজেন্স ইঞ্জিন দিয়ে ডেটা অডিট ও ভ্যালিডেশন হচ্ছে...'
                    : 'Running autonomous document intelligence & cross-validation audit...'}
                </p>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'ট্যাক্স কোড, লাইন আইটেম ও লিগ্যাল ক্লজ পরীক্ষা করা হচ্ছে'
                    : 'Extracting key entities, verifying clauses, and checking compliance...'}
                </p>
              </div>
            ) : activeViewMode === 'firestore_history' ? (
              /* Firestore Saved Audits View */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {isBn ? 'ক্লাউড ডেটাবেজ স্টোরেজ (Firestore)' : 'Cloud Database Storage (Firestore)'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Project: gen-lang-client-0768881149 • Region: asia-southeast1
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {savedAudits.length} {isBn ? 'টি অডিট সংরক্ষিত' : 'Audits Stored'}
                    </span>
                  </div>
                </div>

                {savedAudits.length === 0 ? (
                  <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
                    <Database className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-800">
                      {isBn ? 'এখনও কোন অডিট সংরক্ষিত হয়নি' : 'No Audits Saved Yet in Firestore'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                      {isBn
                        ? 'যেকোন ডকুমেন্ট অডিট সম্পন্ন করে উপরের "ক্লাউডে সেভ (Firestore)" বাটনে ক্লিক করুন। আপনার অডিট ও আর্থিক প্রতিবেদন স্থায়ীভাবে ক্লাউডে সংরক্ষিত থাকবে।'
                        : 'Audit any document from Google Drive or sample datasets and click "Save to Cloud (Firestore)" to securely persist the report and risk analytics.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveViewMode('analysis')}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isBn ? 'বর্তমান অডিটে ফিরে যান' : 'Return to Active Audit'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedAudits.map((item) => {
                      const isHighRisk = (item.riskScore ?? 0) >= 70;
                      const isMedRisk = (item.riskScore ?? 0) >= 30 && (item.riskScore ?? 0) < 70;
                      const dateStr = item.createdAt
                        ? new Date(item.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')
                        : '';

                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                  {item.docName}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  <span className="font-medium capitalize">{item.docType}</span>
                                  {dateStr && (
                                    <>
                                      <span>•</span>
                                      <span>{dateStr}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Risk Score Pill */}
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                  isHighRisk
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : isMedRisk
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {isBn ? 'ঝুঁকি স্কোর' : 'Risk'}: {item.riskScore ?? 0}/100
                              </span>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSavedAudit(item.id)}
                                title={isBn ? 'মুছে ফেলুন' : 'Delete from Firestore'}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Summary */}
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {isBn ? item.summaryBn : item.summaryEn}
                          </p>

                          {/* Footer Info */}
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <div className="flex items-center gap-3">
                              {item.potentialSavings && (
                                <span className="font-semibold text-emerald-700">
                                  {isBn ? 'আর্থিক প্রভাব:' : 'Impact:'} {item.currency || '$'}
                                  {item.potentialSavings.toLocaleString()}
                                </span>
                              )}
                              <span>
                                {isBn ? 'নির্ভুলতা:' : 'Confidence:'} {item.confidenceScore}%
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDocName(item.docName);
                                setActiveViewMode('analysis');
                              }}
                              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                            >
                              <span>{isBn ? 'বিশ্লেষণ দেখুন' : 'Inspect Audit'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : auditResult ? (
              /* Audit Results Display */
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Financial Impact */}
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                    <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                      {isBn ? 'আর্থিক মূল্যায়ন / ভলিউম' : 'Financial Impact / Volume'}
                    </p>
                    <p className="text-xl font-extrabold text-blue-950 mt-1">
                      {auditResult.financialImpact.potentialSavingsOrTotal}
                    </p>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      {isBn
                        ? auditResult.financialImpact.typeBn
                        : auditResult.financialImpact.typeEn}
                    </p>
                  </div>

                  {/* Risk Score */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                    <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                      {isBn ? 'ঝুঁকি স্কোর (Audit Risk)' : 'Risk Assessment Score'}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-extrabold text-amber-950">
                        {auditResult.riskScore}
                      </span>
                      <span className="text-xs text-amber-700">/ 100</span>
                      <span className="text-[11px] px-2 py-0.2 rounded bg-amber-200/80 font-semibold text-amber-900 ml-auto">
                        {auditResult.riskScore > 50
                          ? isBn
                            ? 'উচ্চ ফ্ল্যাগ'
                            : 'Requires Action'
                          : isBn
                          ? 'নিয়ন্ত্রিত'
                          : 'Low Risk'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {isBn ? 'অসঙ্গতি ও অসঙ্গত শর্তের স্তর' : 'Discrepancy and exposure metric'}
                    </p>
                  </div>

                  {/* Confidence Score */}
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                      {isBn ? 'মডেল কনফিডেন্স স্কোর' : 'Model Confidence'}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-extrabold text-emerald-950">
                        {auditResult.confidenceScore}%
                      </span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 ml-auto" />
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      {isBn ? 'স্বয়ংক্রিয়ভাবে এক্সট্র্যাক্টকৃত' : 'Autonomous OCR & rule match'}
                    </p>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isBn ? 'সারসংক্ষেপ (Executive Summary)' : 'Executive Summary'}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {isBn ? auditResult.summaryBn : auditResult.summaryEn}
                  </p>
                </div>

                {/* Extracted Key Entities Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    {isBn ? 'এক্সট্র্যাক্টকৃত প্রধান ডাটা পয়েন্ট ও এন্টিটি' : 'Extracted Entities & Variables'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {auditResult.keyEntities.map((entity, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="text-slate-500 text-[11px]">
                            {isBn ? entity.labelBn : entity.labelEn}
                          </p>
                          <p className="font-bold text-slate-900 mt-0.5">{entity.value}</p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            entity.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entity.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : entity.status === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {entity.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Findings & Flags */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{isBn ? 'শনাক্তকৃত অডিট ফাইন্ডিংস ও সতর্কতা' : 'Audit Findings & Actionable Flags'}</span>
                  </h4>
                  <div className="space-y-2">
                    {(isBn ? auditResult.auditFindingsBn : auditResult.auditFindingsEn).map(
                      (finding, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                          <span className="leading-relaxed font-medium">{finding}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Compliance Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isBn ? 'নিয়ন্ত্রক কমপ্লায়েন্স ও স্ট্যান্ডার্ড ভ্যালিডেশন' : 'Regulatory Standards & Compliance Checklist'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {auditResult.complianceStatus.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5"
                      >
                        {c.isCompliant ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{c.standard}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5">
                            {isBn ? c.notesBn : c.notesEn}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Action Box */}
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs sm:text-sm text-indigo-950 flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {isBn ? 'পরবর্তী প্রস্তাবিত পদক্ষেপ:' : 'Recommended Autonomous Action:'}{' '}
                    </span>
                    <span className="font-medium">
                      {isBn ? auditResult.suggestedActionBn : auditResult.suggestedActionEn}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
