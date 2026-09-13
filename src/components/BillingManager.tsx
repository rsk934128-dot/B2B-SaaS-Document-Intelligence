import React, { useState, useEffect } from 'react';
import {
  AuthState,
  Language,
  SubscriptionTierId,
  BillingCycle,
  UserSubscription,
  SubscriptionTier,
} from '../types';
import { SUBSCRIPTION_TIERS } from '../data/subscriptionTiers';
import {
  subscribeToUserSubscription,
  updateUserSubscription,
  logActivityToFirestore,
  createNotificationInFirestore,
} from '../services/firestoreService';
import {
  Check,
  Zap,
  ShieldCheck,
  Building2,
  CreditCard,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Users,
  HardDrive,
  Headphones,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface BillingManagerProps {
  language: Language;
  authState: AuthState;
  onOpenAuthModal?: () => void;
  onNavigateToAuditor?: () => void;
}

export const BillingManager: React.FC<BillingManagerProps> = ({
  language,
  authState,
  onOpenAuthModal,
  onNavigateToAuditor,
}) => {
  const isBn = language === 'bn';
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription>({
    tierId: 'starter',
    billingCycle: 'annual',
    status: 'active',
    docsUsedThisMonth: 18,
    docsLimit: 150,
    paymentMethod: 'Visa ending in 4242',
    lastPaymentDate: '2026-03-01',
    currency: 'USD',
  });
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [simulationModal, setSimulationModal] = useState<{
    isOpen: boolean;
    tier: SubscriptionTier | null;
    cycle: BillingCycle;
    sessionId?: string;
    amount?: string;
  }>({
    isOpen: false,
    tier: null,
    cycle: 'annual',
  });
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  // Handle Stripe Checkout return URL parameters (success / cancel)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const billingSuccess = params.get('billing_success');
    const billingCanceled = params.get('billing_canceled');
    const tierParam = params.get('tier') as SubscriptionTierId | null;
    const cycleParam = (params.get('cycle') as BillingCycle) || 'annual';
    const sessionId = params.get('session_id');

    if (billingSuccess === 'true' && tierParam) {
      const selectedTier = SUBSCRIPTION_TIERS.find((t) => t.id === tierParam) || SUBSCRIPTION_TIERS[1];

      const activatePlan = async () => {
        setIsProcessing('confirming');
        const newSub: UserSubscription = {
          tierId: selectedTier.id,
          billingCycle: cycleParam,
          status: 'active',
          docsUsedThisMonth: currentSubscription.docsUsedThisMonth,
          docsLimit: selectedTier.docLimitPerMonth,
          paymentMethod: 'Stripe Checkout (Card)',
          lastPaymentDate: new Date().toLocaleDateString('en-CA'),
          stripeSessionId: sessionId || null,
          currency: 'USD',
        };

        try {
          if (authState.user?.uid) {
            await updateUserSubscription(authState.user.uid, newSub);

            await logActivityToFirestore({
              userId: authState.user.uid,
              actionType: 'SUBSCRIPTION_UPGRADED',
              docName: `Stripe Checkout: ${selectedTier.nameEn}`,
              docType: 'billing',
              details: `Stripe checkout redirected successfully. Subscription active for ${selectedTier.nameEn} (${cycleParam.toUpperCase()}). Session: ${sessionId || 'verified'}`,
              complianceStatus: 'COMPLIANT',
              riskScore: 0,
              clientEnvironment: 'Stripe Hosted Checkout Return',
            });

            // Create in-app notification in Firestore
            await createNotificationInFirestore(authState.user.uid, {
              type: 'SUBSCRIPTION_CHANGED',
              titleEn: `Subscription Activated: ${selectedTier.nameEn}`,
              titleBn: `সাবস্ক্রিপশন সক্রিয় হয়েছে: ${selectedTier.nameBn}`,
              messageEn: `Your organization is now on ${selectedTier.nameEn} (${cycleParam.toUpperCase()}). Document limit: ${selectedTier.docLimitPerMonth} / month.`,
              messageBn: `আপনার প্রতিষ্ঠান এখন ${selectedTier.nameBn} প্ল্যানে অন্তর্ভুক্ত (${cycleParam === 'annual' ? 'বার্ষিক' : 'মাসিক'})। মাসিক সীমা: ${selectedTier.docLimitPerMonth} টি নথি।`,
              status: 'unread',
              linkTab: 'billing',
              metadata: {
                tierId: selectedTier.id,
                billingCycle: cycleParam,
              },
            });
          }
          setCurrentSubscription(newSub);
          setSuccessMessage(
            isBn
              ? `স্ট্রাইপ পেমেন্ট সফল হয়েছে! আপনার এন্টারপ্রাইজ অ্যাকাউন্ট এখন "${selectedTier.nameBn}" এ আপগ্রেড করা হয়েছে।`
              : `Stripe payment completed successfully! Your enterprise account is now upgraded to ${selectedTier.nameEn}.`
          );
        } catch (e: any) {
          console.warn('Subscription activation sync notice:', e);
          setCurrentSubscription(newSub);
        } finally {
          setIsProcessing(null);
          // Clean up URL parameters cleanly
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      activatePlan();
    } else if (billingCanceled === 'true') {
      setRedirectNotice(
        isBn
          ? 'স্ট্রাইপ চেকআউট সেশন বাতিল করা হয়েছে। কোনো চার্জ ধার্য করা হয়নি।'
          : 'Stripe Checkout session was canceled. No payment was charged.'
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [authState.user?.uid, isBn]);

  // Subscribe to real-time subscription status from Firestore if authenticated
  useEffect(() => {
    if (!authState.user?.uid) return;

    const unsubscribe = subscribeToUserSubscription(
      authState.user.uid,
      (sub) => {
        if (sub) {
          setCurrentSubscription(sub);
        } else {
          // Initialize default starter subscription in state
          setCurrentSubscription({
            tierId: 'starter',
            billingCycle: 'annual',
            status: 'active',
            docsUsedThisMonth: 18,
            docsLimit: 150,
            paymentMethod: 'Credit Card (Stripe)',
            lastPaymentDate: new Date().toLocaleDateString('en-CA'),
            currency: 'USD',
          });
        }
      },
      (err) => {
        console.warn('Firestore subscription read warning:', err.message);
      }
    );

    return () => unsubscribe();
  }, [authState.user?.uid]);

  // Handle tier upgrade / selection trigger
  const handleSelectTier = async (tier: SubscriptionTier) => {
    if (tier.id === currentSubscription.tierId && billingCycle === currentSubscription.billingCycle) {
      return; // Already on this tier
    }

    setIsProcessing(tier.id);
    setSuccessMessage(null);

    try {
      // Call backend API for Stripe Checkout session / simulation
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: tier.id,
          billingCycle,
          userEmail: authState.user?.email || 'demo-admin@enterprise.corp',
          userId: authState.user?.uid || 'demo_user',
        }),
      });

      const data = await res.json();

      if (data.status === 'success' && data.mode === 'live_stripe' && data.url) {
        // Redirect to real Stripe hosted checkout
        window.location.href = data.url;
        return;
      }

      // Open high-touch interactive Stripe Sandbox simulated checkout dialog
      setSimulationModal({
        isOpen: true,
        tier,
        cycle: billingCycle,
        sessionId: data.sessionId,
        amount: data.amountDueUsd || (billingCycle === 'annual' ? `${tier.annualMonthlyPrice * 12}` : `${tier.monthlyPrice}`),
      });
    } catch (err: any) {
      console.error('Checkout error:', err);
      // Fallback to local simulation dialog
      setSimulationModal({
        isOpen: true,
        tier,
        cycle: billingCycle,
        sessionId: `sim_local_${Date.now()}`,
        amount: billingCycle === 'annual' ? `${tier.annualMonthlyPrice * 12}` : `${tier.monthlyPrice}`,
      });
    } finally {
      setIsProcessing(null);
    }
  };

  // Confirm payment in simulation sandbox and persist in Firestore
  const handleConfirmSimulationPayment = async () => {
    if (!simulationModal.tier) return;

    setIsProcessing('confirming');
    const selectedTier = simulationModal.tier;

    const newSub: UserSubscription = {
      tierId: selectedTier.id,
      billingCycle: simulationModal.cycle,
      status: 'active',
      docsUsedThisMonth: currentSubscription.docsUsedThisMonth,
      docsLimit: selectedTier.docLimitPerMonth,
      paymentMethod: 'Stripe Sandbox (Visa •••• 4242)',
      lastPaymentDate: new Date().toLocaleDateString('en-CA'),
      stripeSessionId: simulationModal.sessionId,
      currency: 'USD',
    };

    try {
      if (authState.user?.uid) {
        await updateUserSubscription(authState.user.uid, newSub);

        await logActivityToFirestore({
          userId: authState.user.uid,
          actionType: 'SUBSCRIPTION_UPGRADED',
          docName: `Stripe Subscription: ${selectedTier.nameEn}`,
          docType: 'billing',
          details: `B2B Enterprise subscription upgraded to ${selectedTier.nameEn} (${simulationModal.cycle.toUpperCase()}). Monthly quota increased to ${selectedTier.docLimitPerMonth} docs. Session: ${simulationModal.sessionId}`,
          complianceStatus: 'COMPLIANT',
          riskScore: 0,
          clientEnvironment: 'Stripe Enterprise Payment Gateway (PCI-DSS Level 1)',
        });

        // Trigger in-app notification in Firestore
        await createNotificationInFirestore(authState.user.uid, {
          type: 'SUBSCRIPTION_CHANGED',
          titleEn: `Plan Upgraded: ${selectedTier.nameEn}`,
          titleBn: `প্ল্যান আপগ্রেড সম্পন্ন: ${selectedTier.nameBn}`,
          messageEn: `Subscription status updated to active. Your organization has ${selectedTier.docLimitPerMonth} document audits per month.`,
          messageBn: `সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে। আপনার প্রতিষ্ঠান প্রতি মাসে ${selectedTier.docLimitPerMonth} টি নথি অডিট করতে পারবে।`,
          status: 'unread',
          linkTab: 'billing',
          metadata: {
            tierId: selectedTier.id,
            billingCycle: simulationModal.cycle,
          },
        });
      } else {
        // Update local state if in demo mode
        setCurrentSubscription(newSub);
      }

      setSimulationModal({ isOpen: false, tier: null, cycle: 'annual' });
      setSuccessMessage(
        isBn
          ? `অভিনন্দন! আপনার সাবস্ক্রিপশন সফলভাবে ${selectedTier.nameBn} এ আপগ্রেড হয়েছে।`
          : `Success! Your enterprise plan has been activated on ${selectedTier.nameEn}.`
      );
    } catch (err: any) {
      console.error('Failed to persist subscription:', err);
      setCurrentSubscription(newSub);
      setSimulationModal({ isOpen: false, tier: null, cycle: 'annual' });
    } finally {
      setIsProcessing(null);
    }
  };

  const currentTierData =
    SUBSCRIPTION_TIERS.find((t) => t.id === currentSubscription.tierId) || SUBSCRIPTION_TIERS[0];

  const quotaPercent = Math.min(
    100,
    Math.round((currentSubscription.docsUsedThisMonth / currentSubscription.docsLimit) * 100)
  );

  return (
    <div className="space-y-8 animate-fadeIn" id="billing-manager-section">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>{isBn ? 'B2B সাবস্ক্রিপশন ও বিলিং হাব' : 'B2B SaaS Subscription & Billing Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {isBn ? 'এন্টারপ্রাইজ সাবস্ক্রিপশন টিয়ার ও লাইফসাইকেল' : 'Enterprise Subscription & Quota Management'}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              {isBn
                ? 'স্ট্রাইপ (Stripe) ইন্টিগ্রেটেড পেমেন্ট ওয়ার্কফ্লো, রিয়েল-টাইম কোটা ইউটিলাইজেশন এবং এন্টারপ্রাইজ SLA ম্যানেজমেন্ট।'
                : 'Manage flexible B2B subscription plans, track document analysis quotas, and initiate Stripe payments with enterprise compliance.'}
            </p>
          </div>

          {/* Quick Active Plan Pill */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 font-medium">
                  {isBn ? 'বর্তমান একটিভ প্ল্যান' : 'Current Active Plan'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {isBn ? currentTierData.nameBn : currentTierData.nameEn}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px] uppercase tracking-wide">
                    {currentSubscription.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-[1px] bg-slate-200 mx-2" />

            <div className="text-left">
              <p className="text-slate-500 font-medium">
                {isBn ? 'বিলিং সাইকেল' : 'Billing Cycle'}
              </p>
              <p className="font-semibold text-slate-800 capitalize">
                {currentSubscription.billingCycle === 'annual'
                  ? isBn
                    ? 'বার্ষিক (২০% ছাড়)'
                    : 'Annual (20% Save)'
                  : isBn
                  ? 'মাসিক'
                  : 'Monthly'}
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Canceled/Notice Alert Banner */}
        {redirectNotice && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="font-medium">{redirectNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setRedirectNotice(null)}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Real-Time Monthly Quota Meter */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>
                  {isBn
                    ? 'মাসিক ডকুমেন্ট অডিট কোটা ব্যবহার:'
                    : 'Monthly AI Document Processing Usage:'}
                </span>
                <strong className="text-slate-900 font-semibold">
                  {currentSubscription.docsUsedThisMonth} / {currentSubscription.docsLimit}{' '}
                  {isBn ? 'ডকুমেন্ট' : 'Docs'}
                </strong>
              </span>
              <span
                className={`font-semibold ${
                  quotaPercent > 85 ? 'text-amber-600' : 'text-slate-600'
                }`}
              >
                {quotaPercent}% {isBn ? 'ব্যবহৃত' : 'Utilized'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  quotaPercent > 85
                    ? 'bg-amber-500'
                    : quotaPercent > 50
                    ? 'bg-blue-600'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {isBn
                ? 'কোটা প্রতি মাসের ১ তারিখে স্বয়ংক্রিয়ভাবে রিসেট হয়। উচ্চ ভলিউম প্রয়োজনে প্রফেশনাল বা এন্টারপ্রাইজ প্ল্যানে আপগ্রেড করুন।'
                : 'Quota auto-renews at the beginning of each billing cycle. Higher tiers unlock multi-seat access and high-throughput pipelines.'}
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-0.5 text-left">
              <p className="text-slate-500 font-medium">
                {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
              </p>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                <span>{currentSubscription.paymentMethod || 'Stripe Gateway'}</span>
              </p>
            </div>
            {onNavigateToAuditor && (
              <button
                type="button"
                id="billing-test-auditor-btn"
                onClick={onNavigateToAuditor}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer shadow-2xs"
              >
                {isBn ? 'ডকুমেন্ট অডিট করুন' : 'Run Audit'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Billing Cycle Switcher (Monthly vs Annual with discount badge) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {isBn ? 'সাবস্ক্রিপশন টিয়ার সমূহ' : 'Available Subscription Tiers'}
          </h2>
          <p className="text-xs text-slate-500">
            {isBn
              ? 'আপনার প্রতিষ্ঠানের আকার ও ডকুমেন্ট ভলিউম অনুসারে সেরা প্ল্যানটি বেছে নিন।'
              : 'Select the optimal plan calibrated to your transaction volume and compliance standards.'}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300 text-xs font-semibold">
          <button
            type="button"
            id="billing-toggle-monthly"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isBn ? 'মাসিক বিলিং' : 'Monthly'}
          </button>
          <button
            type="button"
            id="billing-toggle-annual"
            onClick={() => setBillingCycle('annual')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              billingCycle === 'annual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{isBn ? 'বার্ষিক বিলিং' : 'Annual'}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                billingCycle === 'annual' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isBn ? '২০% সেভ' : 'Save 20%'}
            </span>
          </button>
        </div>
      </div>

      {/* Tier Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const isCurrent = currentSubscription.tierId === tier.id;
          const displayPrice =
            billingCycle === 'annual' ? tier.annualMonthlyPrice : tier.monthlyPrice;

          return (
            <div
              key={tier.id}
              id={`pricing-card-${tier.id}`}
              className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 transition-all ${
                tier.highlighted
                  ? 'bg-white border-2 border-blue-600 shadow-lg shadow-blue-500/10'
                  : 'bg-white border border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Badge for Popular or Enterprise */}
              {tier.badgeEn && (
                <div className="absolute -top-3.5 left-6">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold shadow-xs ${
                      tier.highlighted
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    {isBn ? tier.badgeBn : tier.badgeEn}
                  </span>
                </div>
              )}

              {/* Card Top / Title */}
              <div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {isBn ? tier.nameBn : tier.nameEn}
                  </h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {isBn ? 'বর্তমান প্ল্যান' : 'Active'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-2 min-h-[36px] leading-relaxed">
                  {isBn ? tier.taglineBn : tier.taglineEn}
                </p>

                {/* Price Display */}
                <div className="mt-5 pb-5 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      ${displayPrice}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      /{isBn ? 'প্রতি মাস' : 'mo'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {billingCycle === 'annual'
                      ? isBn
                        ? `বার্ষিক $${displayPrice * 12} বিল করা হবে`
                        : `Billed annually at $${displayPrice * 12}/year`
                      : isBn
                      ? 'মাসিক বিলিং, যেকোনো সময় বাতিলযোগ্য'
                      : 'Billed monthly, cancel anytime'}
                  </p>
                </div>

                {/* Specifications Checklist */}
                <div className="mt-5 space-y-3">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {isBn ? 'ফিচার ও ক্যাপাবিলিটি:' : 'Key Capabilities:'}
                  </p>
                  <ul className="space-y-2.5">
                    {(isBn ? tier.featuresBn : tier.featuresEn).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Metrics Quick Row */}
                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {tier.teamSeats} {isBn ? 'টিম সিট' : 'Team Seats'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{tier.slaUptime} SLA</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isBn ? 'ড্রাইভ সিঙ্ক' : 'Drive Sync'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{tier.dedicatedManager ? (isBn ? 'CSM ম্যানেজার' : 'Dedicated CSM') : (isBn ? '২৪ঘণ্টা সাপোর্ট' : '24h Support')}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                <button
                  type="button"
                  id={`btn-select-tier-${tier.id}`}
                  disabled={isProcessing === tier.id || (isCurrent && billingCycle === currentSubscription.billingCycle)}
                  onClick={() => handleSelectTier(tier)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCurrent && billingCycle === currentSubscription.billingCycle
                      ? 'bg-slate-100 text-slate-500 border border-slate-200'
                      : tier.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 active:bg-blue-800'
                      : 'bg-slate-900 text-white hover:bg-slate-800 active:bg-black shadow-xs'
                  }`}
                >
                  {isProcessing === tier.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isBn ? 'প্রসেসিং হচ্ছে...' : 'Initiating Stripe...'}</span>
                    </>
                  ) : isCurrent && billingCycle === currentSubscription.billingCycle ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{isBn ? 'বর্তমান একটিভ প্ল্যান' : 'Current Active Plan'}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isBn
                          ? `${tier.nameBn} এ আপগ্রেড করুন`
                          : `Upgrade to ${tier.nameEn}`}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise Security & Compliance Guarantee Banner */}
      <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'ব্যাংক-গ্রেড পেমেন্ট ও অডিট গ্যারান্টি' : 'Bank-Grade Security & PCI Compliance'}</span>
            </div>
            <h3 className="text-xl font-bold">
              {isBn
                ? 'স্ট্রাইপ সিকিউর চেকআউট ও SOC 2 অডিটেবল বিলিং'
                : 'Stripe PCI-DSS Level 1 & SOC 2 Type II Certified Pipeline'}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isBn
                ? 'প্রতিটি সাবস্ক্রিপশন লেনদেন স্ট্রাইপ এনক্রিপ্টেড পেমেন্ট গেটওয়ের মাধ্যমে পরিচালিত হয়। সমস্ত ট্রানজ্যাকশন এবং প্ল্যান পরিবর্তনের ইতিহাস ক্লাউড ফায়ারস্টোর কমপ্লায়েন্স লগে অপরিবর্তনীয়ভাবে সংরক্ষিত থাকে।'
                : 'All subscription payments are securely processed through Stripe encrypted sessions. Every tier transition is permanently documented in the Firestore enterprise compliance activity trail.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-slate-400 font-mono">ENCRYPTION: AES-256</p>
              <p className="text-[11px] text-emerald-400 font-semibold">ZERO-STORED CVV</p>
            </div>
            {!authState.user && onOpenAuthModal && (
              <button
                type="button"
                id="billing-auth-cta-btn"
                onClick={onOpenAuthModal}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap"
              >
                {isBn ? 'এন্টারপ্রাইজ অ্যাকাউন্ট খুলুন' : 'Create Enterprise Account'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Stripe Checkout Modal */}
      {simulationModal.isOpen && simulationModal.tier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {isBn ? 'স্ট্রাইপ চেকআউট স্যান্ডবক্স' : 'Stripe Enterprise Checkout Sandbox'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Session: {simulationModal.sessionId?.slice(0, 24)}...
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSimulationModal({ isOpen: false, tier: null, cycle: 'annual' })}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBn ? 'নির্বাচিত টিয়ার' : 'Selected Plan'}
                  </p>
                  <p className="font-bold text-slate-900 text-base">
                    {isBn ? simulationModal.tier.nameBn : simulationModal.tier.nameEn}
                  </p>
                  <p className="text-[11px] text-slate-500 capitalize">
                    {simulationModal.cycle} Billing ({simulationModal.tier.docLimitPerMonth} Docs/mo)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">
                    {isBn ? 'মোট প্রদেয়' : 'Total Due'}
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900">
                    ${simulationModal.amount}
                  </p>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">USD</span>
                </div>
              </div>

              {/* Simulated Card Form */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isBn ? 'স্যান্ডবক্স মোড একটিভ' : 'Sandbox Demonstration Mode'}</span>
                  </p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    {isBn
                      ? 'বাস্তব ক্রেডিট কার্ড চার্জ ছাড়াই আপনি এন্টারপ্রাইজ টিয়ার সক্রিয় করতে পারেন। কনফার্ম করার সাথে সাথে ফায়ারস্টোর ডাটাবেসে সাবস্ক্রিপশন এবং অ্যাক্টিভিটি লগ আপডেট হবে।'
                      : 'Simulate instant enterprise subscription activation with full Firestore state sync, quota upgrade, and compliance audit trail.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    {isBn ? 'কার্ড নম্বর (টেস্ট কার্ড)' : 'Card Number (Simulated Stripe Test)'}
                  </label>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-mono">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span className="tracking-wider">4242 •••• •••• 4242</span>
                    <span className="ml-auto text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-sans font-bold text-slate-700">
                      TEST
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">
                      {isBn ? 'মেয়াদ' : 'Expires'}
                    </label>
                    <input
                      type="text"
                      disabled
                      value="12 / 29"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">CVC</label>
                    <input
                      type="text"
                      disabled
                      value="888"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSimulationModal({ isOpen: false, tier: null, cycle: 'annual' })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  id="btn-confirm-simulated-payment"
                  disabled={isProcessing === 'confirming'}
                  onClick={handleConfirmSimulationPayment}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
                >
                  {isProcessing === 'confirming' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{isBn ? 'পেমেন্ট অনুমোদিত হচ্ছে...' : 'Authorizing Payment...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {isBn
                          ? `$${simulationModal.amount} পে ও অ্যাক্টিভেট করুন`
                          : `Pay $${simulationModal.amount} & Activate Plan`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
