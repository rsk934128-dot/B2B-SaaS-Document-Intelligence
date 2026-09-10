import React, { useState } from 'react';
import { Language, SaaSCategory } from '../types';
import { SAAS_CATEGORIES } from '../data/categoriesData';
import {
  Building2,
  Bot,
  CreditCard,
  ShieldAlert,
  Cpu,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Terminal,
  Zap,
} from 'lucide-react';

interface CategoryExplorerProps {
  language: Language;
  onOpenSampleInAuditor: (sampleDocId: string) => void;
}

export const CategoryExplorer: React.FC<CategoryExplorerProps> = ({
  language,
  onOpenSampleInAuditor,
}) => {
  const isBn = language === 'bn';
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(SAAS_CATEGORIES[0].id);

  const selectedCategory =
    SAAS_CATEGORIES.find((c) => c.id === selectedCategoryId) || SAAS_CATEGORIES[0];

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-5 h-5 text-indigo-600" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-emerald-600" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-amber-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-600" />;
      default:
        return <Zap className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/40">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <TrendingUp className="w-3.5 h-3.5" />
            {isBn ? 'মার্কেট ট্রেন্ড ও উচ্চ আয়ের সুযোগ' : 'High-Yield SaaS Opportunity Matrix'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {isBn
              ? 'বর্তমানে সবচেয়ে বেশি আয়ের সম্ভাবনাময় ৫টি প্রধান B2B সফটওয়্যার ক্যাটাগরি'
              : 'Top 5 High-Income B2B Software & SaaS Opportunities in 2026+'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {isBn
              ? 'জেনারেটিভ এআই, ডাটা ইন্টিগ্রেশন এবং অটোমেশনের ব্যাপক চাহিদার কারণে B2B ও সাবস্ক্রিপশন মডেলে সবচেয়ে বেশি আয়ের স্থায়িত্ব এবং লো-চর্ন পাওয়া যাচ্ছে। নিচের প্রতিটি ক্যাটাগরি বিশ্লেষণ ও বাস্তব আর্কিটেকচার দেখে নিন।'
              : 'Generative AI, mission-critical data integrations, and enterprise automation drive durable recurring revenue. B2B and Vertical SaaS provide predictable subscription retention with <1% churn.'}
          </p>
        </div>
      </div>

      {/* 5 Category Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SAAS_CATEGORIES.map((cat, index) => {
          const isSelected = cat.id === selectedCategoryId;
          return (
            <button
              key={cat.id}
              type="button"
              id={`cat-card-${cat.id}`}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`p-4 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <span className="text-[11px] font-bold text-slate-400">#{index + 1}</span>
              </div>
              <p className="font-bold text-sm text-slate-900 line-clamp-1">
                {isBn ? cat.nameBn.split('. ')[1] : cat.nameEn.split('. ')[1]}
              </p>
              <p className="text-[11px] text-blue-700 font-medium mt-1 line-clamp-1">
                {isBn ? cat.badgeBn : cat.badgeEn}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Category Deep Dive Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Deep Dive Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  {isBn ? selectedCategory.badgeBn : selectedCategory.badgeEn}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {isBn ? 'গ্রস মার্জিন:' : 'Gross Margin:'}{' '}
                  <strong className="text-slate-800">{selectedCategory.grossMargin}</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isBn ? selectedCategory.nameBn : selectedCategory.nameEn}
              </h2>
              <p className="text-slate-600 text-sm max-w-3xl">
                {isBn ? selectedCategory.descriptionBn : selectedCategory.descriptionEn}
              </p>
            </div>

            {/* Test Document Auditor CTA */}
            <div className="shrink-0">
              <button
                type="button"
                id="test-doc-btn"
                onClick={() => {
                  const sampleMap: Record<string, string> = {
                    'vertical-saas': 'sample-const-005',
                    'ai-workflow-agents': 'sample-inv-001',
                    'fintech-iso20022': 'sample-iso-004',
                    'cloud-governance': 'sample-cloud-003',
                    'developer-productivity': 'sample-contract-002',
                  };
                  onOpenSampleInAuditor(sampleMap[selectedCategory.id] || 'sample-inv-001');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition shadow-sm hover:shadow"
              >
                <span>
                  {isBn
                    ? 'এই ক্যাটাগরির ডকুমেন্ট অডিট টেস্ট করুন'
                    : 'Test Document Audit in Drive'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Deep Dive Content Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Key Products & Why Profitable */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {isBn ? 'প্রধান প্রডাক্ট ও সফটওয়্যার উদাহরণ' : 'Key Products & Core SaaS Offerings'}
              </h3>
              <div className="space-y-3">
                {(isBn ? selectedCategory.keyProductsBn : selectedCategory.keyProductsEn).map(
                  (product, idx) => {
                    const [title, ...descParts] = product.split(': ');
                    const desc = descParts.join(': ');
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700"
                      >
                        <p className="font-bold text-slate-900 mb-0.5">{title}</p>
                        <p className="text-slate-600 leading-relaxed">{desc || title}</p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Why Profitable Box */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? 'কেন এটি অত্যন্ত লাভজনক?' : 'Why is this Highly Profitable?'}</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                {isBn ? selectedCategory.whyProfitableBn : selectedCategory.whyProfitableEn}
              </p>
            </div>

            {/* Target Audience */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                {isBn ? 'টার্গেট অডিয়েন্স ও বায়ার পারসোনা' : 'Target Audience & Buyer Persona'}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-800">
                {isBn ? selectedCategory.targetAudienceBn : selectedCategory.targetAudienceEn}
              </p>
            </div>
          </div>

          {/* Right Column: Pricing & Production Tech Stack */}
          <div className="space-y-6">
            {/* Pricing Model & ARR Value */}
            <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>{isBn ? 'প্রস্তাবিত প্রাইসিং ও রেভিনিউ মডেল' : 'Recommended Pricing & Contract Size'}</span>
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-blue-900">
                  {isBn ? selectedCategory.typicalPricingBn : selectedCategory.typicalPricingEn}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {isBn
                    ? '১০০ জন ক্লায়েন্টে আনুমানিক ARR: $১৮০,০০০ - $৯০০,০০০+ (৮৫%+ মার্জিন)'
                    : 'Est. ARR with 100 Clients: $180,000 - $900,000+ (85%+ Margin)'}
                </p>
              </div>
            </div>

            {/* Production Architecture & Tech Stack */}
            <div className="p-5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>
                    {isBn
                      ? 'বাস্তবায়নের জন্য সুপারিশকৃত টেক স্ট্যাক'
                      : 'Recommended Production Tech Stack'}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                  Modern 2026
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-xs font-mono">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="text-slate-400 shrink-0 w-24">Frontend:</span>
                  <span className="text-emerald-300 font-sans">
                    {selectedCategory.techStack.frontend}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="text-slate-400 shrink-0 w-24">Backend:</span>
                  <span className="text-blue-300 font-sans">
                    {selectedCategory.techStack.backend}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="text-slate-400 shrink-0 w-24">Database:</span>
                  <span className="text-purple-300 font-sans">
                    {selectedCategory.techStack.database}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="text-slate-400 shrink-0 w-24">AI / Engine:</span>
                  <span className="text-amber-300 font-sans">
                    {selectedCategory.techStack.aiOrEngine}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="text-slate-400 shrink-0 w-24">Cloud & Infra:</span>
                  <span className="text-cyan-300 font-sans">
                    {selectedCategory.techStack.cloud}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
