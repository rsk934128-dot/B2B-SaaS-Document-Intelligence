import React, { useState, useMemo } from 'react';
import { BusinessModelType, CalculatorState, CalculatedFinancials, Language } from '../types';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ArrowUpRight,
  Sparkles,
  PieChart,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface RevenueCalculatorProps {
  language: Language;
}

export const RevenueCalculator: React.FC<RevenueCalculatorProps> = ({ language }) => {
  const isBn = language === 'bn';

  const [calcState, setCalcState] = useState<CalculatorState>({
    modelType: 'subscription',
    clientCount: 45,
    avgPricePerClient: 350, // $350/mo
    usageTransactions: 150000,
    pricePerTransaction: 0.045, // $0.045/tx
    avgSavingsPerClient: 8500, // $8,500/mo saved
    savingsPercentage: 18, // 18% of savings
    churnRatePercent: 1.5,
    cloudCostPerClient: 22,
    fixedMonthlyOverheads: 1500,
    valuationMultiple: 8, // 8x ARR multiple
  });

  // Calculate financials based on active model
  const financials: CalculatedFinancials = useMemo(() => {
    let mrr = 0;

    if (calcState.modelType === 'subscription') {
      mrr = calcState.clientCount * calcState.avgPricePerClient;
    } else if (calcState.modelType === 'usage') {
      mrr = calcState.usageTransactions * calcState.pricePerTransaction;
    } else if (calcState.modelType === 'savings_percentage') {
      const totalSavingsGenerated = calcState.clientCount * calcState.avgSavingsPerClient;
      mrr = totalSavingsGenerated * (calcState.savingsPercentage / 100);
    }

    const arr = mrr * 12;
    const monthlyVariableCost = calcState.clientCount * calcState.cloudCostPerClient;
    const annualCogs = (monthlyVariableCost + calcState.fixedMonthlyOverheads) * 12;
    const grossProfitAnnual = Math.max(0, arr - annualCogs);
    const grossMarginPercent = arr > 0 ? (grossProfitAnnual / arr) * 100 : 0;
    const netProfitAnnual = grossProfitAnnual;
    const netMarginPercent = grossMarginPercent;

    // SaaS LTV calculation
    const monthlyChurnDecimal = Math.max(0.005, calcState.churnRatePercent / 100);
    const ltvMonths = 1 / monthlyChurnDecimal;
    const avgMonthlyRevPerClient =
      calcState.clientCount > 0 ? mrr / calcState.clientCount : calcState.avgPricePerClient;
    const ltvPerCustomer = avgMonthlyRevPerClient * ltvMonths * (grossMarginPercent / 100);

    const estimatedValuation = arr * calcState.valuationMultiple;

    return {
      mrr,
      arr,
      grossRevenueAnnual: arr,
      cogsAnnual: annualCogs,
      grossProfitAnnual,
      grossMarginPercent,
      netProfitAnnual,
      netMarginPercent,
      estimatedValuation,
      ltvMonths,
      ltvPerCustomer,
    };
  }, [calcState]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-2">
          <DollarSign className="w-4 h-4" />
          <span>{isBn ? 'আয়ের মডেল ও ইউনিট ইকোনমিক্স' : 'SaaS Unit Economics & Valuation Modeler'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {isBn
            ? 'আয়ের মডেল নির্ধারণ ও প্রফিটাবিলিটি ক্যালকুলেটর'
            : 'Interactive Revenue Model & Valuation Calculator'}
        </h2>
        <p className="text-slate-600 text-sm mt-1 max-w-3xl">
          {isBn
            ? 'আপনার সফটওয়্যারের বিজনেস মডেল (B2B SaaS, Usage-Based, নাকি Percentage of Savings) নির্বাচন করে মাসিক ও বার্ষিক নিট প্রফিট এবং কোম্পানি ভ্যালুয়েশন হিসাব করুন।'
            : 'Simulate recurring revenue, ARR trajectories, customer lifetime value (LTV), and realistic SaaS enterprise valuation multiples.'}
        </p>

        {/* Model Selection Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          {/* Model 1: B2B Subscription */}
          <button
            type="button"
            id="model-subscription-btn"
            onClick={() => setCalcState((prev) => ({ ...prev, modelType: 'subscription' }))}
            className={`p-4 rounded-xl text-left border transition ${
              calcState.modelType === 'subscription'
                ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 text-sm">
                {isBn ? '১. B2B SaaS (ফিক্সড সাবস্ক্রিপশন)' : '1. B2B SaaS Subscription'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-200 text-blue-900">
                {isBn ? 'সবচেয়ে প্রেডিক্টেবল' : 'Predictable'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {isBn
                ? 'প্রতি মাসে ইউজার বা অর্গানাইজেশন প্রতি ফিক্সড চার্জ ($১০০-$৫০০+)।'
                : 'Fixed monthly/annual license fee per organization ($150 - $600/mo).'}
            </p>
          </button>

          {/* Model 2: Usage-Based */}
          <button
            type="button"
            id="model-usage-btn"
            onClick={() => setCalcState((prev) => ({ ...prev, modelType: 'usage' }))}
            className={`p-4 rounded-xl text-left border transition ${
              calcState.modelType === 'usage'
                ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 text-sm">
                {isBn ? '২. Usage-Based / API Tier' : '2. Usage-Based / API Tier'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                {isBn ? 'দ্রুত স্কেলিং' : 'Fast Scaling'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {isBn
                ? 'কতটুকু ডেটা প্রসেস বা API কল করা হলো তার ওপর ভিত্তি করে চার্জ ($০.০২-$০.০৮/কল)।'
                : 'Per-transaction or per-document processing fee (e.g. ISO 20022 & Invoices).'}
            </p>
          </button>

          {/* Model 3: Percentage of Savings */}
          <button
            type="button"
            id="model-savings-btn"
            onClick={() => setCalcState((prev) => ({ ...prev, modelType: 'savings_percentage' }))}
            className={`p-4 rounded-xl text-left border transition ${
              calcState.modelType === 'savings_percentage'
                ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 text-sm">
                {isBn ? '৩. Percentage of Savings' : '3. % of Savings / Revenue'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                {isBn ? 'সহজতম সেলস' : 'Zero Friction'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {isBn
                ? 'সফটওয়্যারের মাধ্যমে ক্লায়েন্ট যা খরচ বাঁচাল তার একটি % নেওয়া (যেমন ১৫-২৫%)।'
                : 'Monetize on verified cloud cost savings or recovered revenues.'}
            </p>
          </button>
        </div>
      </div>

      {/* Main Grid: Input Sliders & Instant Output Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Sliders & Controls */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between border-b border-slate-100 pb-3">
            <span>{isBn ? 'ইনপুট প্যারামিটার ও ভেরিয়েবল' : 'Input Variables & Scale'}</span>
            <span className="text-xs text-blue-600 font-semibold font-mono">
              {calcState.modelType.toUpperCase()}
            </span>
          </h3>

          {/* Dynamic Inputs based on selected model */}
          {calcState.modelType === 'subscription' && (
            <>
              {/* Client Count */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800">
                    {isBn ? 'সক্রিয় B2B ক্লায়েন্ট সংখ্যা:' : 'Active B2B Organizations / Clients:'}
                  </label>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {calcState.clientCount} {isBn ? 'টি কোম্পানি' : 'Clients'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="250"
                  step="5"
                  value={calcState.clientCount}
                  onChange={(e) =>
                    setCalcState((prev) => ({ ...prev, clientCount: Number(e.target.value) }))
                  }
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>5 Clients</span>
                  <span>100 Clients</span>
                  <span>250 Clients</span>
                </div>
              </div>

              {/* Price Per Client */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800">
                    {isBn ? 'গড় মাসিক সাবস্ক্রিপশন ফি:' : 'Average Monthly Subscription Fee:'}
                  </label>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    ${calcState.avgPricePerClient} / {isBn ? 'মাস' : 'month'}
                  </span>
                </div>
                <input
                  type="range"
                  min="99"
                  max="1200"
                  step="25"
                  value={calcState.avgPricePerClient}
                  onChange={(e) =>
                    setCalcState((prev) => ({
                      ...prev,
                      avgPricePerClient: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>$99/mo</span>
                  <span>$500/mo</span>
                  <span>$1,200/mo</span>
                </div>
              </div>
            </>
          )}

          {calcState.modelType === 'usage' && (
            <>
              {/* Monthly Transactions / API Calls */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800">
                    {isBn ? 'মাসিক প্রসেসকৃত ট্রানজ্যাকশন/API কল:' : 'Monthly Processed Transactions / Calls:'}
                  </label>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {calcState.usageTransactions.toLocaleString()} {isBn ? 'টি কল' : 'Transactions'}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="1000000"
                  step="20000"
                  value={calcState.usageTransactions}
                  onChange={(e) =>
                    setCalcState((prev) => ({
                      ...prev,
                      usageTransactions: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>20k</span>
                  <span>500k</span>
                  <span>1,000,000</span>
                </div>
              </div>

              {/* Price Per Transaction */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800">
                    {isBn ? 'প্রতি ট্রানজ্যাকশন/ডকুমেন্ট ফি:' : 'Fee per Transaction / Document:'}
                  </label>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    ${calcState.pricePerTransaction.toFixed(3)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.15"
                  step="0.005"
                  value={calcState.pricePerTransaction}
                  onChange={(e) =>
                    setCalcState((prev) => ({
                      ...prev,
                      pricePerTransaction: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>$0.010</span>
                  <span>$0.050</span>
                  <span>$0.150</span>
                </div>
              </div>
            </>
          )}

          {calcState.modelType === 'savings_percentage' && (
            <>
              {/* Clients */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800">
                    {isBn ? 'ক্লায়েন্ট সংখ্যা (Tech Companies):' : 'Client Count (Cloud Workloads):'}
                  </label>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {calcState.clientCount} {isBn ? 'টি প্রতিষ্ঠান' : 'Clients'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={calcState.clientCount}
                  onChange={(e) =>
                    setCalcState((prev) => ({ ...prev, clientCount: Number(e.target.value) }))
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Average Monthly Cloud Waste Saved Per Client */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800">
                    {isBn ? 'প্রতি ক্লায়েন্টের মাসিক সেভিংস:' : 'Avg. Monthly Savings Delivered / Client:'}
                  </label>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    ${calcState.avgSavingsPerClient.toLocaleString()} / {isBn ? 'মাস' : 'mo'}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="1000"
                  value={calcState.avgSavingsPerClient}
                  onChange={(e) =>
                    setCalcState((prev) => ({
                      ...prev,
                      avgSavingsPerClient: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Commission Percentage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800">
                    {isBn ? 'সফটওয়্যার কোম্পানির ফি (% of Savings):' : 'SaaS Capture % of Savings:'}
                  </label>
                  <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {calcState.savingsPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={calcState.savingsPercentage}
                  onChange={(e) =>
                    setCalcState((prev) => ({
                      ...prev,
                      savingsPercentage: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-emerald-600"
                />
              </div>
            </>
          )}

          {/* Operational Overheads & Valuation Multiple */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isBn ? 'মাসিক চর্ন রেট (Churn):' : 'Monthly Churn %:'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calcState.churnRatePercent}
                  onChange={(e) =>
                    setCalcState((prev) => ({
                      ...prev,
                      churnRatePercent: Number(e.target.value),
                    }))
                  }
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isBn ? 'ভ্যালুয়েশন মাল্টিপল (ARR Multiple):' : 'Valuation Multiple:'}
                </label>
                <select
                  value={calcState.valuationMultiple}
                  onChange={(e) =>
                    setCalcState((prev) => ({
                      ...prev,
                      valuationMultiple: Number(e.target.value),
                    }))
                  }
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                >
                  <option value={6}>6x ARR (Standard)</option>
                  <option value={8}>8x ARR (High-Growth B2B)</option>
                  <option value={10}>10x ARR (AI & Agentic SaaS)</option>
                  <option value={14}>14x ARR (FinTech / Infrastructure)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calculated Metrics & Valuation Output */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main ARR Hero Card */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg space-y-4 border border-blue-800">
            <div className="flex items-center justify-between text-xs text-blue-300">
              <span className="font-semibold uppercase tracking-wider">
                {isBn ? 'বার্ষিক রিকারিং আয় (ARR)' : 'Annual Recurring Revenue (ARR)'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]">
                {financials.grossMarginPercent.toFixed(1)}% Gross Margin
              </span>
            </div>

            <div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                ${Math.round(financials.arr).toLocaleString()}
                <span className="text-base text-blue-200 font-normal ml-1">/ {isBn ? 'বছর' : 'year'}</span>
              </p>
              <p className="text-sm text-blue-200 mt-1">
                {isBn ? 'মাসিক রিকারিং আয় (MRR):' : 'Monthly Recurring Revenue (MRR):'}{' '}
                <strong className="text-white font-mono">
                  ${Math.round(financials.mrr).toLocaleString()} / {isBn ? 'মাস' : 'month'}
                </strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-800/80 text-xs">
              <div>
                <p className="text-blue-300">{isBn ? 'বার্ষিক নিট প্রফিট:' : 'Est. Net Annual Profit:'}</p>
                <p className="text-lg font-bold text-emerald-400 font-mono">
                  ${Math.round(financials.netProfitAnnual).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-blue-300">{isBn ? 'আনুমানিক ভ্যালুয়েশন:' : 'Est. Enterprise Valuation:'}</p>
                <p className="text-lg font-bold text-cyan-300 font-mono">
                  ${(financials.estimatedValuation / 1000000).toFixed(2)}M ({calcState.valuationMultiple}x)
                </p>
              </div>
            </div>
          </div>

          {/* Unit Economics Detailed Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isBn ? 'ইউনিক ইকোনমিক্স ও LTV মেট্রিক্স' : 'Unit Economics & Customer Lifetime Value'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500">{isBn ? 'কাস্টমার লাইফটাইম ভ্যালু (LTV):' : 'Customer Lifetime Value (LTV):'}</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  ${Math.round(financials.ltvPerCustomer).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isBn
                    ? `গড় কাস্টমার রিটেনশন: ${Math.round(financials.ltvMonths)} মাস`
                    : `Average lifespan: ${Math.round(financials.ltvMonths)} months`}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500">{isBn ? 'বার্ষিক ক্লাউড ও সার্ভার খরচ:' : 'Annual Cloud COGS & Infra:'}</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  ${Math.round(financials.cogsAnnual).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isBn
                    ? 'ক্লাউড ও ডেটাবেজ খরচ রাজস্বের ৮-১৫% এর মধ্যে'
                    : 'Lean serverless & cloud storage architecture'}
                </p>
              </div>
            </div>

            {/* Strategic Advice Box */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>{isBn ? 'কৌশলগত পরামর্শ' : 'Strategic Monetization Note'}</span>
              </div>
              <p className="leading-relaxed">
                {isBn
                  ? 'B2B ক্লায়েন্টরা সাধারণত অ্যানুয়াল সাবস্ক্রিপশন (যেমন বার্ষিক ১২ মাস একসাথে) পে করতে পছন্দ করে। এতে করে আপনার প্রথম মাসেই বার্ষিক ক্যাশ-ফ্লো হাতে আসে এবং ওয়ার্কিং ক্যাপিটালের কোনো সংকট হয় না।'
                  : 'B2B enterprise clients readily accept annual upfront billing (12 months prepaid). This provides instant upfront cash-flow to fund engineering and scale without venture debt.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
