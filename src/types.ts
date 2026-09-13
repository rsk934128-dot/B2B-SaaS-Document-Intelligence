export type Language = 'bn' | 'en';

export interface SaaSCategory {
  id: string;
  nameBn: string;
  nameEn: string;
  badgeBn: string;
  badgeEn: string;
  iconName: string;
  descriptionBn: string;
  descriptionEn: string;
  keyProductsBn: string[];
  keyProductsEn: string[];
  whyProfitableBn: string;
  whyProfitableEn: string;
  typicalPricingBn: string;
  typicalPricingEn: string;
  grossMargin: string;
  targetAudienceBn: string;
  targetAudienceEn: string;
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    aiOrEngine: string;
    cloud: string;
  };
  sampleDocType: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  iconLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface AuthState {
  user: {
    uid?: string | null;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
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

export type ActivityActionType =
  | 'DOC_ANALYZED'
  | 'AUDIT_SAVED'
  | 'REPORT_EXPORTED_DRIVE'
  | 'AUDIT_DELETED'
  | 'WORKSPACE_AUTH'
  | 'SUBSCRIPTION_UPGRADED'
  | 'SUBSCRIPTION_CANCELLED';

export type ComplianceStatusType = 'COMPLIANT' | 'FLAGGED' | 'REVIEW_REQUIRED' | 'INFO';

export interface ActivityLogItem {
  id: string;
  userId: string;
  actionType: ActivityActionType;
  docName?: string;
  docType?: string;
  details: string;
  complianceStatus: ComplianceStatusType;
  riskScore?: number;
  clientEnvironment?: string;
  createdAt?: any;
}

export interface DocumentAuditResult {
  docName: string;
  docType: 'invoice' | 'contract' | 'cloud_bill' | 'iso20022' | 'construction_spec' | 'general';
  summaryBn: string;
  summaryEn: string;
  riskScore: number; // 0 to 100
  confidenceScore: number; // 0 to 100
  keyEntities: Array<{
    labelBn: string;
    labelEn: string;
    value: string;
    status: 'normal' | 'warning' | 'critical' | 'verified';
  }>;
  auditFindingsBn: string[];
  auditFindingsEn: string[];
  financialImpact: {
    potentialSavingsOrTotal: string;
    currency: string;
    typeBn: string;
    typeEn: string;
  };
  complianceStatus: {
    standard: string;
    isCompliant: boolean;
    notesBn: string;
    notesEn: string;
  }[];
  suggestedActionBn: string;
  suggestedActionEn: string;
}

export type BusinessModelType = 'subscription' | 'usage' | 'savings_percentage';

export interface CalculatorState {
  modelType: BusinessModelType;
  clientCount: number;
  avgPricePerClient: number; // For subscription
  usageTransactions: number; // For usage
  pricePerTransaction: number; // For usage
  avgSavingsPerClient: number; // For % savings
  savingsPercentage: number; // For % savings (e.g. 15%)
  churnRatePercent: number; // e.g. 2%
  cloudCostPerClient: number; // e.g. $15
  fixedMonthlyOverheads: number; // e.g. $1200
  valuationMultiple: number; // e.g. 8x ARR
}

export interface CalculatedFinancials {
  mrr: number;
  arr: number;
  grossRevenueAnnual: number;
  cogsAnnual: number;
  grossProfitAnnual: number;
  grossMarginPercent: number;
  netProfitAnnual: number;
  netMarginPercent: number;
  estimatedValuation: number;
  ltvMonths: number;
  ltvPerCustomer: number;
}

export type SubscriptionTierId = 'starter' | 'professional' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionTier {
  id: SubscriptionTierId;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  highlighted?: boolean;
  badgeBn?: string;
  badgeEn?: string;
  featuresBn: string[];
  featuresEn: string[];
  docLimitPerMonth: number;
  driveSync: boolean;
  compliancePdfs: boolean;
  teamSeats: number;
  dedicatedManager: boolean;
  slaUptime: string;
}

export interface UserSubscription {
  tierId: SubscriptionTierId;
  billingCycle: BillingCycle;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd?: string | number | null;
  docsUsedThisMonth: number;
  docsLimit: number;
  lastPaymentDate?: string | null;
  paymentMethod?: string;
  stripeSessionId?: string | null;
  currency: string;
}

export type NavigationTab =
  | 'categories'
  | 'drive'
  | 'activity'
  | 'calculator'
  | 'architect'
  | 'billing'
  | 'compliance';

export type NotificationType =
  | 'AUDIT_COMPLETED'
  | 'SUBSCRIPTION_CHANGED'
  | 'SYSTEM_ALERT'
  | 'USAGE_ALERT';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface InAppNotification {
  id?: string;
  userId: string;
  type: NotificationType;
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  status: NotificationStatus;
  linkTab?: NavigationTab;
  metadata?: {
    docName?: string;
    riskScore?: number;
    tierId?: string;
    billingCycle?: string;
    timestamp?: string;
  };
  createdAt: any;
}
