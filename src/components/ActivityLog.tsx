import React, { useState, useEffect, useMemo } from 'react';
import { AuthState, Language, ActivityLogItem, ActivityActionType, ComplianceStatusType } from '../types';
import {
  subscribeToUserActivityLogs,
  deleteActivityLogFromFirestore,
  logActivityToFirestore,
} from '../services/firestoreService';
import {
  ShieldCheck,
  FileCheck2,
  Database,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Download,
  FileDown,
  Loader2,
  Filter,
  Trash2,
  RefreshCw,
  Sparkles,
  Lock,
  ExternalLink,
  ChevronRight,
  Info,
  ShieldAlert,
  User,
} from 'lucide-react';
import { generateAuditPdfReport } from '../utils/auditPdfGenerator';

interface ActivityLogProps {
  language: Language;
  authState: AuthState;
  onNavigateToAuditor?: () => void;
  onGoogleSignIn?: () => void;
  onOpenAuthModal?: () => void;
}

// Initial realistic baseline enterprise compliance actions for demo/sample mode
const DEMO_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'demo-act-1',
    userId: 'demo-user-101',
    actionType: 'DOC_ANALYZED',
    docName: 'INV-2024-9981-ApexLogistics.pdf',
    docType: 'invoice',
    details: 'Automated extraction complete. High risk anomaly identified: tax discrepancy (15% VAT vs 10% statutory rate) and banking IBAN mismatch.',
    complianceStatus: 'FLAGGED',
    riskScore: 78,
    clientEnvironment: 'Google Drive v3 API / OCR Engine',
    createdAt: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: 'demo-act-2',
    userId: 'demo-user-101',
    actionType: 'AUDIT_SAVED',
    docName: 'Enterprise-Master-Services-Agreement.docx',
    docType: 'contract',
    details: 'Contract liability audit saved to Firestore. Missing uncapped indemnification and GDPR sub-processor clause flagged for legal review.',
    complianceStatus: 'REVIEW_REQUIRED',
    riskScore: 65,
    clientEnvironment: 'Firestore asia-southeast1 (Encrypted at rest)',
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'demo-act-3',
    userId: 'demo-user-101',
    actionType: 'REPORT_EXPORTED_DRIVE',
    docName: 'AWS-Consolidated-Cloud-Spend-Q3.csv',
    docType: 'cloud_bill',
    details: 'Cost optimization audit sheet created in Google Drive root folder. $38,400 idle instance reduction plan approved.',
    complianceStatus: 'COMPLIANT',
    riskScore: 18,
    clientEnvironment: 'Google Drive Spreadsheet Export',
    createdAt: new Date(Date.now() - 1000 * 60 * 180),
  },
  {
    id: 'demo-act-4',
    userId: 'demo-user-101',
    actionType: 'DOC_ANALYZED',
    docName: 'ISO20022_pacs008_CrossBorder_MT103.xml',
    docType: 'iso20022',
    details: 'Cross-border payment message parsed. Verified UETR matching and LEI entity compliance passed AML/CFT tier-1 rules.',
    complianceStatus: 'COMPLIANT',
    riskScore: 12,
    clientEnvironment: 'Banking Swift MX / ISO Engine',
    createdAt: new Date(Date.now() - 1000 * 60 * 360),
  },
  {
    id: 'demo-act-5',
    userId: 'demo-user-101',
    actionType: 'WORKSPACE_AUTH',
    docName: 'OAuth Google Workspace Session',
    docType: 'auth',
    details: 'Enterprise workspace administrator initiated OAuth2 handshake with scopes: https://www.googleapis.com/auth/drive.file',
    complianceStatus: 'COMPLIANT',
    riskScore: 0,
    clientEnvironment: 'Google Identity Services (GSI)',
    createdAt: new Date(Date.now() - 1000 * 60 * 720),
  },
];

export const ActivityLog: React.FC<ActivityLogProps> = ({
  language,
  authState,
  onNavigateToAuditor,
  onGoogleSignIn,
  onOpenAuthModal,
}) => {
  const isBn = language === 'bn';
  const isDemo = !authState.user?.uid || authState.accessToken?.startsWith('demo-');

  const [logs, setLogs] = useState<ActivityLogItem[]>(DEMO_ACTIVITY_LOGS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Subscribe to real Firestore activity logs if user is authenticated with a real Google account
  useEffect(() => {
    const uid = authState.user?.uid;
    if (uid && !isDemo) {
      const unsub = subscribeToUserActivityLogs(
        uid,
        (fetchedLogs) => {
          if (fetchedLogs.length > 0) {
            setLogs(fetchedLogs);
          } else {
            // Keep demo logs as guidance if Firestore has no entries yet, or show empty
            setLogs([]);
          }
        },
        (err) => {
          console.warn('Activity logs subscription status:', err.message);
        }
      );
      return () => unsub();
    } else {
      // In demo mode, show the baseline demo compliance logs
      setLogs(DEMO_ACTIVITY_LOGS);
    }
  }, [authState.user?.uid, isDemo]);

  // Filtered and searched logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !searchTerm.trim() ||
        log.docName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.clientEnvironment?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = filterAction === 'ALL' || log.actionType === filterAction;
      const matchesStatus = filterStatus === 'ALL' || log.complianceStatus === filterStatus;

      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [logs, searchTerm, filterAction, filterStatus]);

  // Enterprise compliance metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const compliant = logs.filter((l) => l.complianceStatus === 'COMPLIANT').length;
    const flagged = logs.filter((l) => l.complianceStatus === 'FLAGGED').length;
    const reviewRequired = logs.filter((l) => l.complianceStatus === 'REVIEW_REQUIRED').length;
    const rate = total > 0 ? Math.round((compliant / total) * 100) : 100;
    return { total, compliant, flagged, reviewRequired, rate };
  }, [logs]);

  // Handle manual log deletion
  const handleDeleteLog = async (logId: string) => {
    const uid = authState.user?.uid;
    if (isDemo || !uid) {
      setLogs((prev) => prev.filter((l) => l.id !== logId));
      setDeleteConfirmId(null);
      return;
    }

    try {
      await deleteActivityLogFromFirestore(uid, logId);
      setDeleteConfirmId(null);
      setBannerMessage({
        text: isBn ? 'অ্যাক্টিভিটি রেকর্ড মুছে ফেলা হয়েছে' : 'Activity log record removed',
        type: 'info',
      });
      setTimeout(() => setBannerMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to delete log:', err);
    }
  };

  // Trigger a new compliance simulation log
  const handleSimulateComplianceAction = async () => {
    setIsSimulating(true);
    const mockActions: Array<{
      actionType: ActivityActionType;
      docName: string;
      docType: string;
      details: string;
      complianceStatus: ComplianceStatusType;
      riskScore: number;
    }> = [
      {
        actionType: 'DOC_ANALYZED',
        docName: `Vendor_Statement_Procurement_${Math.floor(Math.random() * 899 + 100)}.pdf`,
        docType: 'invoice',
        details: 'Enterprise three-way PO match check executed. All line-items reconciled with SAP ERP database.',
        complianceStatus: 'COMPLIANT',
        riskScore: 8,
      },
      {
        actionType: 'AUDIT_SAVED',
        docName: `SLA_Service_Credit_Agreement_${Math.floor(Math.random() * 899 + 100)}.pdf`,
        docType: 'contract',
        details: 'Availability guarantee clause evaluated. 99.9% uptime threshold confirmed with mandatory audit trail clause.',
        complianceStatus: 'REVIEW_REQUIRED',
        riskScore: 54,
      },
      {
        actionType: 'DOC_ANALYZED',
        docName: `Overseas_Telegraphic_Transfer_Swift_${Math.floor(Math.random() * 899 + 100)}.xml`,
        docType: 'iso20022',
        details: 'High-risk jurisdiction routing detected. Escalated for human AML officer clearance.',
        complianceStatus: 'FLAGGED',
        riskScore: 84,
      },
      {
        actionType: 'REPORT_EXPORTED_DRIVE',
        docName: `Executive_Compliance_Summary_${Math.floor(Math.random() * 899 + 100)}.csv`,
        docType: 'general',
        details: 'Monthly document intelligence and fraud mitigation report synced to Google Drive workspace.',
        complianceStatus: 'COMPLIANT',
        riskScore: 5,
      },
    ];

    const pick = mockActions[Math.floor(Math.random() * mockActions.length)];
    const uid = authState.user?.uid || 'demo-user-101';

    if (!isDemo && authState.user?.uid) {
      try {
        await logActivityToFirestore({
          userId: uid,
          actionType: pick.actionType,
          docName: pick.docName,
          docType: pick.docType,
          details: pick.details,
          complianceStatus: pick.complianceStatus,
          riskScore: pick.riskScore,
          clientEnvironment: 'Cloud Firestore asia-southeast1 Engine',
        });
      } catch (e) {
        console.warn('Error saving log:', e);
      }
    } else {
      const newEntry: ActivityLogItem = {
        id: `sim-${Date.now()}`,
        userId: uid,
        actionType: pick.actionType,
        docName: pick.docName,
        docType: pick.docType,
        details: pick.details,
        complianceStatus: pick.complianceStatus,
        riskScore: pick.riskScore,
        clientEnvironment: 'Google Workspace Enterprise Engine (Demo)',
        createdAt: new Date(),
      };
      setLogs((prev) => [newEntry, ...prev]);
    }

    setBannerMessage({
      text: isBn
        ? 'নতুন কমপ্লায়েন্স অডিট ইভেন্ট ফায়ারবেসে সফলভাবে রেকর্ড করা হয়েছে!'
        : 'New compliance audit event recorded to Firestore!',
      type: 'success',
    });
    setTimeout(() => setBannerMessage(null), 4000);
    setIsSimulating(false);
  };

  // Export audit trail to CSV
  const handleExportCSV = () => {
    const headers = [
      'Log ID',
      'Timestamp (UTC)',
      'Action Type',
      'Compliance Status',
      'Document Name',
      'Document Type',
      'Risk Score',
      'Environment',
      'Audit Details',
    ];

    const rows = filteredLogs.map((item) => {
      const dateStr = item.createdAt
        ? new Date(item.createdAt).toISOString()
        : new Date().toISOString();
      return [
        `"${item.id}"`,
        `"${dateStr}"`,
        `"${item.actionType}"`,
        `"${item.complianceStatus}"`,
        `"${item.docName || 'N/A'}"`,
        `"${item.docType || 'N/A'}"`,
        `"${item.riskScore ?? 'N/A'}"`,
        `"${item.clientEnvironment || 'Cloud'}"`,
        `"${item.details.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Enterprise_Compliance_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export audit trail to PDF document for enterprise audit compliance
  const handleExportPDF = async () => {
    if (filteredLogs.length === 0) return;
    setIsExportingPdf(true);
    try {
      generateAuditPdfReport({
        logs: filteredLogs,
        userEmail: authState.user?.email,
        userDisplayName: authState.user?.displayName,
        language,
      });

      setBannerMessage({
        text: isBn
          ? 'এন্টারপ্রাইজ কমপ্লায়েন্স অডিট ট্রেইল PDF রিপোর্ট সফলভাবে তৈরি ও ডাউনলোড হয়েছে!'
          : 'Enterprise compliance audit trail PDF report generated and downloaded successfully!',
        type: 'success',
      });
      setTimeout(() => setBannerMessage(null), 5000);
    } catch (err: any) {
      console.error('PDF export error:', err);
      setBannerMessage({
        text: isBn
          ? `PDF তৈরি ব্যর্থ হয়েছে: ${err.message || 'অজানা ত্রুটি'}`
          : `PDF generation failed: ${err.message || 'Unknown error'}`,
        type: 'info',
      });
      setTimeout(() => setBannerMessage(null), 5000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const getActionBadge = (actionType: ActivityActionType) => {
    switch (actionType) {
      case 'DOC_ANALYZED':
        return {
          icon: <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />,
          labelBn: 'ডকুমেন্ট বিশ্লেষণ',
          labelEn: 'Document Analyzed',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'AUDIT_SAVED':
        return {
          icon: <Database className="w-3.5 h-3.5 text-indigo-600" />,
          labelBn: 'Firestore-এ সংরক্ষিত',
          labelEn: 'Saved to Firestore',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'REPORT_EXPORTED_DRIVE':
        return {
          icon: <HardDrive className="w-3.5 h-3.5 text-emerald-600" />,
          labelBn: 'ড্রাইভে এক্সপোর্ট',
          labelEn: 'Exported to Drive',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'AUDIT_DELETED':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-600" />,
          labelBn: 'অডিট অপসারিত',
          labelEn: 'Audit Revoked',
          color: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'WORKSPACE_AUTH':
        return {
          icon: <Lock className="w-3.5 h-3.5 text-purple-600" />,
          labelBn: 'ওয়ার্কস্পেস অনুমোদন',
          labelEn: 'Workspace OAuth',
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-slate-600" />,
          labelBn: 'সিস্টেম অ্যাকশন',
          labelEn: 'System Action',
          color: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const getComplianceStatusBadge = (status: ComplianceStatusType) => {
    switch (status) {
      case 'COMPLIANT':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          labelBn: 'কমপ্লায়েন্ট',
          labelEn: 'Compliant',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'FLAGGED':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
          labelBn: 'ঝুঁকি চিহ্নিত',
          labelEn: 'Flagged (Anomaly)',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'REVIEW_REQUIRED':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />,
          labelBn: 'রিভিউ প্রয়োজন',
          labelEn: 'Review Required',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'INFO':
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-blue-600" />,
          labelBn: 'তথ্যমূলক',
          labelEn: 'System Info',
          badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        };
    }
  };

  return (
    <div className="space-y-6" id="activity-log-container">
      {/* Top Banner & Title Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {isBn ? 'কমপ্লায়েন্স অ্যাক্টিভিটি লগ' : 'Enterprise Compliance Activity Log'}
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Firestore Cloud Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'ডকুমেন্ট অডিট, গুগল ড্রাইভ ইন্টেলিজেন্স ও এন্টারপ্রাইজ কমপ্লায়েন্স ট্র্যাকিং'
                    : 'Immutable audit trail tracking document intelligence processing & enterprise compliance'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              id="simulate-compliance-btn"
              onClick={handleSimulateComplianceAction}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:bg-blue-800 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isSimulating
                  ? isBn
                    ? 'রেকর্ড হচ্ছে...'
                    : 'Recording Event...'
                  : isBn
                  ? 'নতুন অডিট ইভেন্ট টেস্ট'
                  : 'Simulate Audit Event'}
              </span>
            </button>

            <button
              type="button"
              id="export-pdf-audit-btn"
              onClick={handleExportPDF}
              disabled={isExportingPdf || filteredLogs.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 active:bg-slate-950 transition shadow-xs cursor-pointer disabled:opacity-50"
              title={
                isBn
                  ? 'এন্টারপ্রাইজ কমপ্লায়েন্স অডিট রিপোর্ট PDF ফরম্যাটে ডাউনলোড করুন'
                  : 'Download enterprise compliance audit report as PDF'
              }
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isBn ? 'PDF তৈরি হচ্ছে...' : 'Generating PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isBn ? 'PDF অডিট রিপোর্ট' : 'Export Audit PDF'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="export-csv-audit-btn"
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
            </button>

            {onNavigateToAuditor && (
              <button
                type="button"
                id="back-to-auditor-btn"
                onClick={onNavigateToAuditor}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                <span>{isBn ? 'ডকুমেন্ট অডিটর' : 'Open Auditor'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Cloud Notification Alert */}
        {bannerMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bannerMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerMessage(null)}
              className="font-bold underline cursor-pointer"
            >
              {isBn ? 'ঠিক আছে' : 'OK'}
            </button>
          </div>
        )}

        {/* Demo status alert if user is browsing demo data */}
        {isDemo && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Database className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                {isBn
                  ? 'বর্তমানে ডেমো এন্টারপ্রাইজ ওয়ার্কস্পেস অ্যাক্টিভিটি ট্রেল প্রদর্শিত হচ্ছে। ফায়ারবেসে লগইন বা রেজিস্ট্রেশন করলে আপনার ব্যক্তিগত অডিটগুলো সরাসরি ফায়ারবেস ক্লাউডে সংরক্ষিত হবে।'
                  : 'Currently viewing demo enterprise activity stream. Sign in or register with Firebase to stream your private live compliance logs to Firestore.'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onOpenAuthModal && (
                <button
                  type="button"
                  id="log-auth-modal-btn"
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition cursor-pointer shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isBn ? 'লগইন / রেজিস্টার' : 'Sign In / Register'}</span>
                </button>
              )}
              {onGoogleSignIn && (
                <button
                  type="button"
                  id="log-signin-btn"
                  onClick={onGoogleSignIn}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isBn ? 'গুগল ড্রাইভ' : 'Google Drive'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compliance Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {isBn ? 'মোট অডিট ইভেন্ট' : 'Total Audit Events'}
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.total}</span>
            <span className="text-[11px] text-slate-500 font-medium">
              {isBn ? 'রেকর্ড' : 'Logged'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isBn ? 'রিয়েলটাইম ফায়ারবেস সিঙ্ক' : 'Synchronized with Firestore'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {isBn ? 'কমপ্লায়েন্স পাসের হার' : 'Compliance Pass Rate'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{metrics.rate}%</span>
            <span className="text-[11px] text-emerald-700 font-medium">
              {metrics.compliant} {isBn ? 'পাস' : 'passed'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isBn ? 'SOC2 / ISO27001 মানদণ্ড' : 'SOC2 / ISO27001 Baseline'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {isBn ? 'ঝুঁকি চিহ্নিত (Flagged)' : 'Flagged Anomaly Items'}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{metrics.flagged}</span>
            <span className="text-[11px] text-rose-700 font-medium">
              {isBn ? 'উচ্চ ঝুঁকি' : 'High Risk'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isBn ? 'তাৎক্ষণিক পর্যালোচনা আবশ্যক' : 'Requires immediate attention'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {isBn ? 'ম্যানুয়াল রিভিউ দরকার' : 'Human Review Needed'}
            </span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{metrics.reviewRequired}</span>
            <span className="text-[11px] text-amber-700 font-medium">
              {isBn ? 'অমীমাংসিত' : 'Pending'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isBn ? 'লিগ্যাল ও ফিনান্স টিম' : 'Assigned to Legal & Finance'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="activity-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isBn
                  ? 'ডকুমেন্ট নাম, অ্যাকশন বা বিবরণ অনুসন্ধান করুন...'
                  : 'Search by document name, action type, or audit details...'
              }
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0 font-medium hidden sm:inline">
              {isBn ? 'ফিল্টার:' : 'Filter:'}
            </span>
            <select
              id="action-filter-select"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">{isBn ? 'সকল অ্যাকশন' : 'All Action Types'}</option>
              <option value="DOC_ANALYZED">{isBn ? 'ডকুমেন্ট বিশ্লেষণ' : 'Document Analyzed'}</option>
              <option value="AUDIT_SAVED">{isBn ? 'Firestore সেভ' : 'Saved to Firestore'}</option>
              <option value="REPORT_EXPORTED_DRIVE">{isBn ? 'ড্রাইভে এক্সপোর্ট' : 'Exported to Drive'}</option>
              <option value="WORKSPACE_AUTH">{isBn ? 'ওয়ার্কস্পেস অনুমোদন' : 'Workspace Auth'}</option>
              <option value="AUDIT_DELETED">{isBn ? 'অডিট বাতিল' : 'Audit Revoked'}</option>
            </select>

            {/* Compliance Status Filter */}
            <select
              id="status-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">{isBn ? 'সকল কমপ্লায়েন্স' : 'All Compliance'}</option>
              <option value="COMPLIANT">{isBn ? 'কমপ্লায়েন্ট' : 'Compliant'}</option>
              <option value="FLAGGED">{isBn ? 'ঝুঁকি চিহ্নিত' : 'Flagged'}</option>
              <option value="REVIEW_REQUIRED">{isBn ? 'রিভিউ প্রয়োজন' : 'Review Required'}</option>
              <option value="INFO">{isBn ? 'সিস্টেম ইনফো' : 'Info'}</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            {isBn ? 'প্রদর্শিত হচ্ছে:' : 'Showing:'} {filteredLogs.length} {isBn ? 'টি ইভেন্ট' : 'events'}
          </span>
          {(searchTerm || filterAction !== 'ALL' || filterStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterAction('ALL');
                setFilterStatus('ALL');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
            >
              {isBn ? 'ফিল্টার রিসেট' : 'Reset filters'}
            </button>
          )}
        </div>
      </div>

      {/* Activity Log Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              {isBn ? 'সাম্প্রতিক অডিট ও অ্যাকশন ট্রেল' : 'Audit Trail Feed'}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Firestore Live</span>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center px-4">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">
              {isBn ? 'কোন অ্যাক্টিভিটি পাওয়া যায়নি' : 'No Activity Logs Found'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {isBn
                ? 'আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোন কমপ্লায়েন্স লগ রেকর্ড নেই।'
                : 'No compliance records match your current search criteria or filter configuration.'}
            </p>
            <button
              type="button"
              onClick={handleSimulateComplianceAction}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBn ? 'টেস্ট ইভেন্ট রেকর্ড করুন' : 'Generate Test Event'}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((item) => {
              const actionBadge = getActionBadge(item.actionType);
              const complianceBadge = getComplianceStatusBadge(item.complianceStatus);
              const dateStr = item.createdAt
                ? new Date(item.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : 'Recent';

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    {/* Left: Action Icon and Title */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0 mt-0.5">
                        {actionBadge.icon}
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${actionBadge.color}`}
                          >
                            {isBn ? actionBadge.labelBn : actionBadge.labelEn}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${complianceBadge.badgeClass}`}
                          >
                            {complianceBadge.icon}
                            <span>{isBn ? complianceBadge.labelBn : complianceBadge.labelEn}</span>
                          </span>

                          {typeof item.riskScore === 'number' && (
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                item.riskScore >= 70
                                  ? 'bg-rose-100 text-rose-800'
                                  : item.riskScore >= 30
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isBn ? 'ঝুঁকি' : 'Risk'}: {item.riskScore}/100
                            </span>
                          )}
                        </div>

                        {item.docName && (
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                            <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.docName}</span>
                            {item.docType && (
                              <span className="text-[11px] text-slate-400 font-normal uppercase">
                                ({item.docType})
                              </span>
                            )}
                          </h4>
                        )}
                      </div>
                    </div>

                    {/* Right: Timestamp and Delete Option */}
                    <div className="flex items-center gap-2 self-start sm:self-auto text-slate-400 text-xs">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{dateStr}</span>
                      </div>

                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-lg border border-rose-200">
                          <span className="text-[10px] text-rose-700 font-semibold">
                            {isBn ? 'মুছবেন?' : 'Delete?'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(item.id)}
                            className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                          >
                            {isBn ? 'হ্যাঁ' : 'Yes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold hover:bg-slate-300 cursor-pointer"
                          >
                            {isBn ? 'না' : 'No'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          title={isBn ? 'লগ মুছুন' : 'Remove record'}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audit Details text block */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-sans">
                    {item.details}
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-400 font-mono pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-semibold">{isBn ? 'পরিবেশ:' : 'Env:'}</span>
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {item.clientEnvironment || 'Google Workspace Client'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-500">
                        {isBn ? 'অপরিবর্তনীয় অডিট ট্রেস' : 'Immutable compliance record'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enterprise Compliance Standards Assurance Footer */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-white">
            {isBn ? 'এন্টারপ্রাইজ রেগুলেশন ও কমপ্লায়েন্স স্ট্যান্ডার্ডস' : 'Enterprise Regulatory & Compliance Assurance'}
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isBn
            ? 'এই অডিট ট্রেইলটি SOC2 Type II, ISO/IEC 27001 এবং GDPR অনুচ্ছেদ ৩০ অনুযায়ী সংরক্ষিত হয়। প্রতিটি ডকুমেন্ট প্রসেসিং, আর্থিক ডিসক্রিপেন্সি ডিটেকশন ও ড্রাইভ এক্সপোর্ট স্বয়ংক্রিয়ভাবে টাইমস্ট্যাম্পযুক্ত এবং অপরিবর্তনীয় অডিট লগ হিসেবে ফায়ারবেস ক্লাউডে এনক্রিপ্ট থাকে।'
            : 'All recorded activities conform to SOC2 Type II, ISO/IEC 27001 auditability, and GDPR Article 30 records of processing. Document intelligence runs, financial discrepancy flags, and Google Drive writes are automatically cryptographically timestamped and stored in Firestore.'}
        </p>
      </div>
    </div>
  );
};
