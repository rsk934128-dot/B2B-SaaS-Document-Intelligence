import React, { useState } from 'react';
import { Language } from '../types';
import {
  Compass,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Server,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Send,
  Building,
  Activity,
  CreditCard,
  Cloud,
  Code2,
} from 'lucide-react';

interface ArchitectureAdvisorProps {
  language: Language;
}

interface IndustryArchitecture {
  id: string;
  nameBn: string;
  nameEn: string;
  iconName: string;
  mvpTimeline: string;
  recommendedPricingBn: string;
  recommendedPricingEn: string;
  frontend: string;
  backend: string;
  database: string;
  aiPipeline: string;
  securityCompliance: string;
  gtmStrategyBn: string;
  gtmStrategyEn: string;
  first10CustomersBn: string;
  first10CustomersEn: string;
}

const INDUSTRY_ARCHITECTURES: IndustryArchitecture[] = [
  {
    id: 'construction',
    nameBn: 'কনস্ট্রাকশন ও সিভিল ইঞ্জিনিয়ারিং (Takeoff & Bidding)',
    nameEn: 'Construction & Engineering (Takeoff SaaS)',
    iconName: 'Building',
    mvpTimeline: '6 to 8 weeks',
    recommendedPricingBn: '$৩৫০ - $৬০০ / মাস / কোম্পানি',
    recommendedPricingEn: '$350 - $600 / month / contractor',
    frontend: 'React 19 + HTML5 Canvas / PDF.js rendering for high-resolution 4K blueprint zooming & vector measurements.',
    backend: 'Node.js / Express microservices + Python FastAPI for geometric quantity takeoff (QTO) calculations.',
    database: 'PostgreSQL + PostGIS for spatial drawing vectors, AWS S3 / Cloud Storage for encrypted CAD/PDF blueprint files.',
    aiPipeline: 'Multimodal vision model (Gemini 2.5 Flash) for legend detection, material schedule extraction, and spec matching.',
    securityCompliance: 'Role-based access control (RBAC), multi-tenant data isolation, watermarked drawing exports.',
    gtmStrategyBn: 'লোকাল জেনারেল কন্ট্রাক্টর অ্যাসোসিয়েশন এবং লিঙ্কডইন ইনবক্সিং-এর মাধ্যমে ফ্রি ১টি ব্লুপ্রিন্ট অডিট অফার করে কনভার্ট করা।',
    gtmStrategyEn: 'Direct LinkedIn outreach to mid-market subcontractors offering a free 1-blueprint automated takeoff comparison.',
    first10CustomersBn: 'স্থানীয় ২০টি সাব-কন্ট্রাক্টরকে সরাসরি ডেমো দেখিয়ে ম্যানুয়াল হিসাবের সাথে সফটওয়্যারের গতি তুলনা করে দেখান।',
    first10CustomersEn: 'Conduct live side-by-side speed tests against their manual spreadsheet estimates.',
  },
  {
    id: 'healthcare',
    nameBn: 'হেলথকেয়ার ও স্পেশালাইজড ক্লিনিক (Practice Management & EMR)',
    nameEn: 'Specialized Healthcare & Practice Management',
    iconName: 'Activity',
    mvpTimeline: '8 to 10 weeks',
    recommendedPricingBn: '$২৫০ - $৮০০ / ক্লিনিক / মাস',
    recommendedPricingEn: '$250 - $800 / clinic / month',
    frontend: 'React + Tailwind, fast keyboard-driven clinical charting UI, patient intake iPad kiosk mode.',
    backend: 'Node.js / Go backend with strict FHIR / HL7 clinical data interoperability standard.',
    database: 'PostgreSQL with column-level AES-256 encryption at rest, Redis for realtime appointment slots.',
    aiPipeline: 'Ambient clinical listening / AI scribe converting doctor-patient voice recordings to SOAP notes automatically.',
    securityCompliance: 'HIPAA & HITECH compliance, signed BAA, immutable clinical audit trail, zero-knowledge encryption.',
    gtmStrategyBn: 'ডেন্টাল বা ভেটেরিনারি অ্যাসোসিয়েশনের ওয়েবিনারে স্পন্সর করে ডাক্তারদের সময় বাঁচানোর প্রত্যক্ষ প্রমাণ দেওয়া।',
    gtmStrategyEn: 'Sponsor state dental/specialty medical societies demonstrating 2+ hours daily reduction in charting documentation.',
    first10CustomersBn: 'আপনার পরিচিত ৫টি লোকাল ডেন্টাল বা থেরাপি ক্লিনিকে ৩০ দিনের ফ্রি পাইলট অফার করুন।',
    first10CustomersEn: 'Offer free 30-day trial with white-glove patient data migration from their legacy system.',
  },
  {
    id: 'fintech',
    nameBn: 'ফিনটেক ও ISO 20022 পেমেন্ট ইঞ্জিন (Cross-Border Rails)',
    nameEn: 'FinTech & ISO 20022 Cross-Border Middleware',
    iconName: 'CreditCard',
    mvpTimeline: '10 to 12 weeks',
    recommendedPricingBn: '$১,০০০ - $৩,০০০ / মাস + $০.০৩/মেসেজ',
    recommendedPricingEn: '$1,000 - $3,000 / month + $0.03/message',
    frontend: 'React + Realtime WebSocket feed of live SWIFT/FedNow transactions and schema errors.',
    backend: 'High-throughput Go or Rust service processing XML validation against official ISO 20022 schemas.',
    database: 'PostgreSQL with strict serializable ACID transactions + TimescaleDB for immutable event ledger.',
    aiPipeline: 'Transformer-based anomaly detection identifying fraud, AML sanctions risks, and routing bottlenecks.',
    securityCompliance: 'PCI-DSS Level 1 certification, ISO 27001, Hardware Security Module (HSM) signature verification.',
    gtmStrategyBn: 'ছোট ও মাঝারি ব্যাংক এবং ক্রস-বর্ডার পেমেন্ট কোম্পানিগুলোর কমপ্লায়েন্স ও সিটিওদের সরাসরি পিচ করা।',
    gtmStrategyEn: 'Direct enterprise sales targeting payment facilitators needing to meet SWIFT CBPR+ compliance deadlines.',
    first10CustomersBn: 'যেসব রেমিট্যান্স কোম্পানি এখনও ম্যানুয়ালি MT ফরম্যাট কনভার্ট করছে তাদের কাছে পৌঁছান।',
    first10CustomersEn: 'Target regional remittance companies struggling with SWIFT MT-to-MX conversion errors.',
  },
  {
    id: 'cloudops',
    nameBn: 'ক্লাউড কস্ট গভর্নেন্স ও ফিনঅপস (Cloud Waste Tracker)',
    nameEn: 'Enterprise Cloud Cost & FinOps Governance',
    iconName: 'Cloud',
    mvpTimeline: '4 to 6 weeks',
    recommendedPricingBn: 'সেভ করা বাজেটের ১৫% - ২০% শেয়ার',
    recommendedPricingEn: '15% - 20% of verified monthly cloud savings',
    frontend: 'React + D3.js interactive resource dependency graphs and cloud cost burn charts.',
    backend: 'Node.js / TypeScript worker functions querying AWS Cost Explorer API, GCP Billing, and Azure Monitor.',
    database: 'ClickHouse or DuckDB for fast analytics over millions of hourly billing line items.',
    aiPipeline: 'Machine learning forecasting predicting idle compute spikes and automated right-sizing scripts.',
    securityCompliance: 'Read-only IAM AssumeRole integration (zero write access to client production data), SOC-2 Type II.',
    gtmStrategyBn: 'Tech Twitter/X এবং DevOps কমিউনিটিতে "আপনার ক্লাউড বিলে কতটা অপচয় হচ্ছে ফ্রি স্ক্যান করুন" টুল ছড়িয়ে দেওয়া।',
    gtmStrategyEn: 'Free self-serve read-only scanner finding immediate savings within 5 minutes of IAM connection.',
    first10CustomersBn: 'আপনার পরিচিত ১০ জন স্টার্টআপ সিটিও-র ক্লাউড বিল ফ্রি স্ক্যান করে প্রথম দিনেই $১,০০০+ সেভ করে দিন।',
    first10CustomersEn: 'Scan 10 founder friends’ AWS accounts; find immediate savings and ask for a 15% revenue share.',
  },
  {
    id: 'devtools',
    nameBn: 'ডেভেলপার প্রোডাক্টিভিটি ও ডেটা পাইপলাইন (API Middleware)',
    nameEn: 'Developer Tools & Low-Code API Pipelines',
    iconName: 'Code2',
    mvpTimeline: '6 to 8 weeks',
    recommendedPricingBn: '$৭৫ - $২০০ / সিট / মাস',
    recommendedPricingEn: '$75 - $200 / developer seat / month',
    frontend: 'React, React Flow for drag-and-drop node pipelines, Monaco Code Editor.',
    backend: 'Node.js + Go worker pool for async webhook execution, distributed task queues (BullMQ/Temporal).',
    database: 'PostgreSQL + Redis for distributed locks, Kafka or RabbitMQ for message buffering.',
    aiPipeline: 'Natural language to API schema mapper, auto-generation of TypeScript SDKs and REST docs.',
    securityCompliance: 'End-to-end webhook payload signing (HMAC SHA-256), OAuth token encryption at rest.',
    gtmStrategyBn: 'প্রোডাক্ট হান্ট, গিটহাব ওপেন সোর্স কোর এবং হ্যাকার নিউজে ডেভেলপারদের সরাসরি ব্যবহার করতে দেওয়া।',
    gtmStrategyEn: 'Bottom-up Product-Led Growth (PLG): Open-core model on GitHub and Product Hunt launch.',
    first10CustomersBn: 'সফটওয়্যার ডেভেলপমেন্ট এজেন্সিগুলোর সাথে যোগাযোগ করে ক্লায়েন্ট প্রজেক্টের ইন্টিগ্রেশন সহজ করার প্রস্তাব দিন।',
    first10CustomersEn: 'Partner with software development consultancies to standardize their client integration pipelines.',
  },
];

export const ArchitectureAdvisor: React.FC<ArchitectureAdvisorProps> = ({ language }) => {
  const isBn = language === 'bn';

  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('construction');
  const [userQuery, setUserQuery] = useState<string>('');
  const [customAdvice, setCustomAdvice] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const selectedArch =
    INDUSTRY_ARCHITECTURES.find((a) => a.id === selectedIndustryId) || INDUSTRY_ARCHITECTURES[0];

  const handleAskAdvice = async () => {
    if (!userQuery.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: selectedArch.nameEn,
          query: userQuery,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.advice) {
          setCustomAdvice(data.advice);
          setIsGenerating(false);
          return;
        }
      }
    } catch {
      // Fallback custom generated guidance
    }

    // High quality tailored fallback
    setTimeout(() => {
      if (isBn) {
        setCustomAdvice(
          `আপনার নির্বাচিত ইন্ডাস্ট্রি "${selectedArch.nameBn}"-এর জন্য সুনির্দিষ্ট পরামর্শ:\n` +
            `১. প্রোডাক্ট স্কোপিং (MVP): শুরুতে সব ফিচার বানাতে যাবেন না। শুধুমাত্র একটি প্রধান জটিল পেইন পয়েন্ট সমাধান করুন (যেমন: স্বয়ংক্রিয় কোটেশন তৈরি বা ড্রাইভ থেকে দ্রুত অডিট)।\n` +
            `২. টেকনিক্যাল স্ট্যাক: ফ্রন্টএন্ডে React + Tailwind, ব্যাকএন্ডে Node.js / Express বা Go, এবং ডেটাবেজে নির্ভরযোগ্য PostgreSQL ব্যবহার করাই বর্তমান মার্কেটের সেরা সিদ্ধান্ত।\n` +
            `৩. আয়ের মডেল: গ্রাহকদের কাছ থেকে প্রথম থেকেই পেইড সাবস্ক্রিপশন ($২০০-$৫০০/মাস) অথবা সেভিংসের ওপর পার্সেন্টেজ নিন। ফ্রি প্ল্যান এড়িয়ে চলুন—B2B গ্রাহকরা ফ্রি সফটওয়্যারকে অপেশাদার মনে করে।\n` +
            `৪. প্রথম ক্লায়েন্ট একুইজিশন: লিঙ্কডইনে সরাসরি সিদ্ধান্ত গ্রহণকারী (CTO, VP of Operations, বা ফার্ম ওনার)-দের ১টি স্পেসিফিক ডেমো অফার করুন।`
        );
      } else {
        setCustomAdvice(
          `Tailored Strategic Blueprint for "${selectedArch.nameEn}":\n` +
            `1. MVP Scope Discipline: Do not build an all-in-one suite on day one. Focus on one high-value bottleneck (e.g., 3-minute automated takeoffs or instant error audit).\n` +
            `2. Production Stack: Pair React 19 + Tailwind with Node.js/Express and ACID-compliant PostgreSQL. Keep AI operations asynchronous via BullMQ background workers.\n` +
            `3. Monetization: Never offer permanent free tiers in B2B. Charge $250 - $600/month or an annual contract. High pricing signals enterprise reliability.\n` +
            `4. First 10 Customers: Offer high-touch manual onboarding and guaranteed data migration to remove all friction.`
        );
      }
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>{isBn ? 'ইন্ডাস্ট্রি ও প্রোডাক্ট আর্কিটেক্ট' : 'Industry Architecture & Tech Stack Planner'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {isBn
            ? 'নির্দিষ্ট ইন্ডাস্ট্রি অনুযায়ী প্রোডাক্ট আর্কিটেকচার ও টেক স্ট্যাক'
            : 'Target Industry Architecture & Production Stack Selector'}
        </h2>
        <p className="text-slate-600 text-sm max-w-3xl">
          {isBn
            ? 'কোন নির্দিষ্ট ইন্ডাস্ট্রি লক্ষ্য করে সফটওয়্যার বানাতে চাইছেন নির্বাচন করুন। নিচের ব্লুপ্রিন্ট থেকে ব্যাকএন্ড, ফ্রন্টএন্ড, ডেটাবেজ, এআই পাইপলাইন এবং প্রথম ১০ জন B2B ক্লায়েন্ট পাওয়ার বাস্তবসম্মত কৌশল দেখুন।'
            : 'Select your target vertical to explore production architectures, security compliance requirements, and go-to-market strategies to acquire your first 10 paying enterprise clients.'}
        </p>

        {/* Industry Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
          {INDUSTRY_ARCHITECTURES.map((ind) => {
            const isSelected = ind.id === selectedIndustryId;
            return (
              <button
                key={ind.id}
                type="button"
                id={`arch-ind-${ind.id}`}
                onClick={() => setSelectedIndustryId(ind.id)}
                className={`p-3.5 rounded-xl text-left border transition ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 line-clamp-2">
                  {isBn ? ind.nameBn : ind.nameEn}
                </div>
                <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                  MVP: {ind.mvpTimeline}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Industry Production Blueprint */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
              {isBn ? 'বাস্তবায়ন ব্লুপ্রিন্ট' : 'Production Blueprint'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {isBn ? selectedArch.nameBn : selectedArch.nameEn}
            </h3>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs px-3.5 py-1.5 rounded-lg font-bold">
            {isBn ? selectedArch.recommendedPricingBn : selectedArch.recommendedPricingEn}
          </div>
        </div>

        {/* 4-Box Technical Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Frontend */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>{isBn ? 'ফ্রন্টএন্ড আর্কিটেকচার' : 'Frontend Architecture'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedArch.frontend}
            </p>
          </div>

          {/* Backend */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'ব্যাকএন্ড ও এপিআই ইঞ্জিন' : 'Backend & API Microservices'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedArch.backend}
            </p>
          </div>

          {/* Database */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4 text-purple-600" />
              <span>{isBn ? 'ডেটাবেজ ও স্টোরেজ লেয়ার' : 'Database & Durable Persistence'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedArch.database}
            </p>
          </div>

          {/* AI & Agent Pipeline */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-amber-600" />
              <span>{isBn ? 'এআই ও অটোমেশন পাইপলাইন' : 'AI & Autonomous Agent Pipeline'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedArch.aiPipeline}
            </p>
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{isBn ? 'সিকিউরিটি ও নিয়ন্ত্রক কমপ্লায়েন্স' : 'Security, Isolation & Regulatory Compliance'}</span>
          </div>
          <p className="text-xs font-mono text-slate-300">{selectedArch.securityCompliance}</p>
        </div>

        {/* GTM & First 10 Customers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
            <p className="font-bold text-blue-950 text-xs uppercase tracking-wider">
              {isBn ? 'গো-টু-মার্কেট (GTM) কৌশল' : 'Go-To-Market Strategy'}
            </p>
            <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
              {isBn ? selectedArch.gtmStrategyBn : selectedArch.gtmStrategyEn}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <p className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
              {isBn ? 'প্রথম ১০ জন পেইড ক্লায়েন্ট পাওয়ার উপায়' : 'How to Close Your First 10 B2B Deals'}
            </p>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
              {isBn ? selectedArch.first10CustomersBn : selectedArch.first10CustomersEn}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Architecture Consultation Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>
            {isBn
              ? 'আপনার নির্দিষ্ট ইন্ডাস্ট্রির জন্য প্রশ্ন বা কাস্টম আলোচনা'
              : 'Ask a Specific Architecture or Business Model Question'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          {isBn
            ? 'যেমন: "ডেন্টাল ক্লিনিকের জন্য HIPAA কমপ্লায়েন্স কীভাবে বজায় রাখব?", অথবা "ISO 20022 তে কীভাবে রিয়েল-টাইম ভ্যালিডেশন করব?"'
            : 'Ask any specific technical, regulatory, or business model question about this stack.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            id="arch-query-input"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAdvice()}
            placeholder={
              isBn
                ? 'আপনার নির্দিষ্ট ইন্ডাস্ট্রি বা প্রযুক্তি সম্পর্কিত প্রশ্ন লিখুন...'
                : 'Type your specific architecture question...'
            }
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            id="arch-submit-btn"
            onClick={handleAskAdvice}
            disabled={isGenerating || !userQuery.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isGenerating ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isBn ? 'পরামর্শ পান' : 'Get Architecture Advice'}</span>
          </button>
        </div>

        {customAdvice && (
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs sm:text-sm text-indigo-950 whitespace-pre-wrap leading-relaxed space-y-2">
            <p className="font-bold text-indigo-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>{isBn ? 'বিশেষজ্ঞ আর্কিটেক্টের পরামর্শ:' : 'Expert Architecture Guidance:'}</span>
            </p>
            <div className="text-slate-800">{customAdvice}</div>
          </div>
        )}
      </div>
    </div>
  );
};
