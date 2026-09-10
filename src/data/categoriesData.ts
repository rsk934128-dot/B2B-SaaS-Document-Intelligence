import { SaaSCategory } from '../types';

export const SAAS_CATEGORIES: SaaSCategory[] = [
  {
    id: 'vertical-saas',
    nameBn: '১. Vertical SaaS ও Niche B2B Tools',
    nameEn: '1. Vertical SaaS & Niche B2B Tools',
    badgeBn: 'সবচেয়ে কম চর্ন ও বিশ্বস্ত ক্লায়েন্ট',
    badgeEn: 'Lowest Churn & High Retention',
    iconName: 'Building2',
    descriptionBn:
      'জেনেরিক বা সাধারণ সফটওয়্যারের পরিবর্তে নির্দিষ্ট ইন্ডাস্ট্রি যেমন কনস্ট্রাকশন, হেলথকেয়ার ক্লিনিক, ভেটেরিনারি হসপিটাল বা ল ফার্মের জটিল পেইন পয়েন্ট সমাধানকারী সফটওয়্যার।',
    descriptionEn:
      'Industry-specific workflow software tailored for construction, specialized healthcare clinics, veterinary practices, or legal firms with deeply embedded workflows.',
    keyProductsBn: [
      'Construction Bid & Takeoff SaaS: আর্কিটেকচারাল ব্লুপ্রিন্ট ও CAD ড্রয়িং থেকে অটোমেটেড মেটেরিয়াল ও খরচের হিসাব (Cost Estimation)।',
      'Niche Practice Management & CRM: ক্লিনিক ও ল ফার্মের জন্য পেশেন্ট রেকর্ড, অ্যাপয়েন্টমেন্ট শিডিউলিং, কমপ্লায়েন্স ও ইন্টিগ্রেটেড বিলিং।',
      'Specialized Logistics Fleet Tracker: কোল্ড চেইন ফার্মাসিউটিক্যাল ও ইন্ডাস্ট্রিয়াল সাপ্লাই চেইনের তাপমাত্রা ও রুট মনিটরিং।',
    ],
    keyProductsEn: [
      'Construction Bid & Takeoff SaaS: Automated material quantity takeoff (QTO) and competitive cost estimation from CAD/blueprints.',
      'Niche CRM & Practice Management: Specialized patient charts, regulatory compliance, appointment scheduling, and automated billing.',
      'Specialized Logistics Fleet Tracker: Real-time cold-chain temperature and route telemetry for pharmaceutical and industrial freight.',
    ],
    whyProfitableBn:
      'ব্যবসায়ীরা তাদের কাজের জটিলতা, সময় এবং ব্যয়বহুল মানবিক ভুল কমাতে প্রতি মাসে $১০০ থেকে $৫০০+ (এমনকি বড় ফার্মের ক্ষেত্রে $১,০০০+) সাবস্ক্রিপশন ফি সানন্দে পরিশোধ করে। একবার ডেটা ঢুকলে চর্ন রেট <১% এ নেমে আসে।',
    whyProfitableEn:
      'Clients willingly pay $150 to $500+/month because replacing manual calculation errors saves tens of thousands in bids and eliminates operational chaos. Churn is exceptionally low (<1%).',
    typicalPricingBn: '$১৫০ - $৬৫০ / প্রতিষ্ঠান / মাস ($১,৮০০ - $৭,৮০০ ARR/ক্লায়েন্ট)',
    typicalPricingEn: '$150 - $650 / organization / month ($1.8k - $7.8k ARR/client)',
    grossMargin: '84% - 90%',
    targetAudienceBn: 'জেনারেল কন্ট্রাক্টর, সাব-কন্ট্রাক্টর, ডেন্টাল/ফিজিওথেরাপি ক্লিনিক, আইনি ফার্ম, লজিস্টিকস অপারেটর।',
    targetAudienceEn: 'General contractors, trade subcontractors, dental/veterinary clinics, law practices, logistics operators.',
    techStack: {
      frontend: 'React 19 + TypeScript, Tailwind CSS, Canvas / PDF.js rendering for blueprints',
      backend: 'Node.js / Express or Go microservices, FastAPI for geometry/CAD parsers',
      database: 'PostgreSQL + PostGIS (for spatial/geo data), Redis for caching',
      aiOrEngine: 'Computer Vision for CAD line extraction, Vector OCR for spec matching',
      cloud: 'AWS S3 / Google Cloud Storage for blueprint files, Cloud Run / EKS',
    },
    sampleDocType: 'construction_spec',
  },
  {
    id: 'ai-workflow-agents',
    nameBn: '২. AI Workflow Automation & Agentic Tools',
    nameEn: '2. AI Workflow Automation & Agentic Tools',
    badgeBn: 'দ্রুততম আরওআই ও উচ্চ ভ্যালুয়েশন',
    badgeEn: 'Highest Immediate ROI & Valuation Multiple',
    iconName: 'Bot',
    descriptionBn:
      'সাধারণ চ্যাটবট বা ChatGPT Wrapper নয়—বরং নির্দিষ্ট ব্যবসায়িক প্রসেস অটোমেট করে শত শত ঘণ্টা শ্রম বাঁচায় এমন বুদ্ধিমান AI Agents, Document Intelligence এবং অডিট ইঞ্জিন।',
    descriptionEn:
      'Real enterprise agents and document intelligence engines rather than shallow wrappers. Directly ingests invoices, legal agreements, and corporate knowledge bases to eliminate manual labor.',
    keyProductsBn: [
      'Document Intelligence & Audit Software: চালান (Invoices), চুক্তি বা ব্যাংক স্টেটমেন্ট থেকে নিজে থেকেই তথ্য এক্সট্র্যাক্ট, ভ্যালিডেট ও ফ্রড অডিট করা।',
      'Knowledge-Grounded Support Agents: কোম্পানির প্রাইভেট ডাটাবেজ ও টিকেটিং API এর সাথে যুক্ত স্বায়ত্তশাসিত এআই এজেন্ট যা টিকিট ৮০% সমাধান করে।',
      'Multi-Step Agentic Workflow: ইমেইল এলে ডাটা যাচাই করে ERP ও পেমেন্ট গেটওয়েতে নিজে নিজেই এন্ট্রি সম্পন্নকারী ব্যাকগ্রাউন্ড বট।',
    ],
    keyProductsEn: [
      'Document Intelligence & Audit Software: Autonomous extraction, 3-way matching, discrepancy flagging, and validation from invoices and contracts.',
      'Knowledge-Grounded Customer Support Agents: Direct CRM/DB connected autonomous resolvers answering tier-1/2 customer support with tool execution.',
      'Multi-Step Enterprise Automators: Autonomous email parsing, vendor validation, and ERP ledger posting pipelines.',
    ],
    whyProfitableBn:
      'এ ধরনের সফটওয়্যার প্রতি মাসে শত শত ম্যানুয়াল লেবার আওয়ার কমিয়ে কোম্পানির হাজার হাজার ডলার বাঁচায়। ক্লায়েন্টরা নিশ্চিত আরওআই (ROI) দেখে প্রিমিয়াম বা পার্সেন্টেজ ফি দিতে সানন্দে রাজি থাকে।',
    whyProfitableEn:
      'Saves enterprises tens of thousands of dollars in redundant staff costs and eliminates human audit errors. High willingness to pay with annual upfront contracts.',
    typicalPricingBn: '$২০০ - $১,২০০ / মাস + ভলিউম পার ডকুমেন্ট ($০.০২-$০.১০)',
    typicalPricingEn: '$200 - $1,200 / month + per-document processing fees ($0.02-$0.10/doc)',
    grossMargin: '78% - 85%',
    targetAudienceBn: 'অ্যাকাউন্টিং ফার্ম, এন্টারপ্রাইজ প্রকিউরমেন্ট টিম, ই-কমার্স কোম্পানি, এইচআর ও লিগ্যাল ডিপার্টমেন্ট।',
    targetAudienceEn: 'Accounting & audit firms, procurement departments, enterprise e-commerce, insurance adjusters.',
    techStack: {
      frontend: 'React + Motion, Document Viewer with interactive bounding box annotations',
      backend: 'Node.js / Express + Python LangGraph/CrewAI for multi-step agent graphs',
      database: 'PostgreSQL + pgvector or Pinecone for embeddings, Redis BullMQ for async queues',
      aiOrEngine: 'Gemini 2.5 Flash / Gemini Pro for multimodal document extraction & reasoning',
      cloud: 'Serverless Cloud Run, Secure isolated PDF processing containers',
    },
    sampleDocType: 'invoice',
  },
  {
    id: 'fintech-iso20022',
    nameBn: '৩. FinTech, Billing & ISO 20022 Middleware',
    nameEn: '3. FinTech, Billing & ISO 20022 Middleware',
    badgeBn: 'সর্বাধিক টিকিটের রেভিনিউ ও ট্রানজ্যাকশন ফি',
    badgeEn: 'Highest Contract Ticket & Transaction Fees',
    iconName: 'CreditCard',
    descriptionBn:
      'ফাইন্যান্সিয়াল ডাটা সিকিউরিটি, গ্লোবাল পেমেন্ট গেটওয়ে, ব্যাংকিং কমপ্লায়েন্স এবং গ্লোবাল সুইফ্ট রূপান্তরের মধ্যবর্তী সফটওয়্যার ইঞ্জিন।',
    descriptionEn:
      'Mission-critical financial data bridges, subscription lifecycle automation, multi-jurisdiction tax calculation, and ISO 20022 (pacs/pain) messaging engines.',
    keyProductsBn: [
      'ISO 20022 & Cross-Border Payment Engines: ব্যাংকিং মেসেজিং রূপান্তর (SWIFT MT103/202 থেকে আধুনিক MX XML/ISO 20022), ডেটা ভ্যালিডেশন ও কমপ্লায়েন্স।',
      'Subscription & Multi-Tier Billing Layer: ব্যবহারের ওপর ভিত্তি করে জটিল মিটারিং, ডায়নামিক ট্যাক্স ক্যালকুলেশন এবং অটোমেটেড ব্যাংক রিকনসিলিয়েশন।',
      'Treasury Liquidity & FedNow Middleware: রিয়েল-টাইম পেমেন্ট রেল (FedNow, RTP, SEPA Instant) সংযোগকারী আর্কিটেকচার।',
    ],
    keyProductsEn: [
      'ISO 20022 & Cross-Border Payment Engines: SWIFT MT to MX format transformation, schema validation, and regulatory audit middleware.',
      'Subscription & Billing Layer: Complex metered billing, global sales tax nexus calculation, and automated bank reconciliation.',
      'Treasury Liquidity & Instant Rail Middleware: Seamless adapter connecting enterprise ERPs to FedNow, RTP, and SEPA instant rails.',
    ],
    whyProfitableBn:
      'হাই-টিকিট এন্টারপ্রাইজ চুক্তি এবং কোটি কোটি টাকার ট্রানজ্যাকশন ফি থেকে বিশাল ও দীর্ঘমেয়াদী রাজস্ব আসে। রেগুলেশন পরিবর্তনের কারণে এটি ব্যাংক ও ফিনটেক প্রতিষ্ঠানের জন্য বাধ্যতামূলক।',
    whyProfitableEn:
      'Regulatory mandates (SWIFT CBPR+ migration) make ISO 20022 non-negotiable for banks and payment facilitators. Commands high annual contracts and per-transaction royalties.',
    typicalPricingBn: '$৫০০ - $২,৫০০ / মাস বেস ফি + $০.০৩-$০.০৮ পার পেমেন্ট মেসেজ',
    typicalPricingEn: '$500 - $2,500 / month base + $0.03 - $0.08 per payment message processed',
    grossMargin: '85% - 92%',
    targetAudienceBn: 'নব্য ব্যাংক (Neobanks), ক্রস-বর্ডার রেমিট্যান্স কোম্পানি, মার্চেন্ট পেমেন্ট প্রসেসর, ট্রেজারি টিম।',
    targetAudienceEn: 'Regional banks, cross-border payment providers, remittance operators, B2B marketplaces.',
    techStack: {
      frontend: 'React + Tailwind, Live Transaction Stream & Compliance Dashboards',
      backend: 'Go / Rust or high-throughput Node.js with strict ISO 20022 XSD XML validation',
      database: 'PostgreSQL (ACID compliance), TimescaleDB for ledger audit history',
      aiOrEngine: 'Rule-based validation compiler + LLM anomaly detector for anti-money laundering (AML)',
      cloud: 'PCI-DSS certified cloud VPC, Hardware Security Module (HSM) key management',
    },
    sampleDocType: 'iso20022',
  },
  {
    id: 'cloud-governance',
    nameBn: '৪. Cloud Cost Governance & Security Audit',
    nameEn: '4. Cloud Cost Governance & Security Audit',
    badgeBn: 'পার্সেন্টেজ অব সেভিংস (লাভের অংশীদারিত্ব) মডেল',
    badgeEn: 'Performance / % of Savings Monetization',
    iconName: 'ShieldAlert',
    descriptionBn:
      'AWS, Google Cloud বা Azure-এ টেক কোম্পানিগুলোর অপ্রয়োজনীয় ক্লাউড বিল ও সিকিউরিটি ঝুঁকি শনাক্ত করে অটোমেটিক ব্যাকএন্ড খরচ কমিয়ে আনা এবং অডিট ট্রেইল তৈরি।',
    descriptionEn:
      'Automated FinOps and security audit platform that monitors AWS, GCP, and Azure for abandoned disks, zombie instances, overprovisioned databases, and IAM leaks.',
    keyProductsBn: [
      'Cloud Waste & Analytics Tracker: অপ্রয়োজনীয় আইডল ক্লাউড সার্ভার, আনঅ্যাটাচড ডিস্ক ভলিউম ও ক্রস-রিজিয়ন ব্যান্ডউইথ শনাক্ত করে খরচ কমানো।',
      'Security & Audit Log Trackers: সিস্টেম অ্যাক্সেস, রোল-বেসড সিকিউরিটি চেকলিস্ট ও ডেটা ব্রিচ ঠেকাতে ইমিউটেবল অডিট ট্রেইল (Audit Trail) মনিটরিং।',
      'Automated Right-Sizing Bot: উইকেন্ড বা অফ-পিক সময়ে স্বয়ংক্রিয়ভাবে ক্লাস্টার স্কেল-ডাউন করার ইন্টেলিজেন্ট রোবট।',
    ],
    keyProductsEn: [
      'Cloud Waste & Analytics Tracker: Automated detection of unattached EBS volumes, zombie VMs, idle multi-AZ databases, and NAT gateway leaks.',
      'Security & Audit Log Trackers: Immutable audit log capture, RBAC permission drift tracking, and real-time compliance reporting (SOC-2/ISO 27001).',
      'Automated Right-Sizing Bot: Smart scheduled and metric-driven automated staging shutdowns and spot-fleet rebalancing.',
    ],
    whyProfitableBn:
      'ক্লাউড বাজেট থেকে যে পরিমাণ খরচ বাঁচিয়ে দেয়, তার ১০% থেকে ২৫% সরাসরি সফটওয়্যার কোম্পানি ফি হিসেবে পায়। ক্লায়েন্টদের পকেট থেকে বাড়তি টাকা দিতে হয় না বলেই সেলস কনভার্সন অত্যন্ত দ্রুত হয়।',
    whyProfitableEn:
      'Monetized as 15%-25% of verified cloud savings. Since clients pay out of dollars already saved, procurement resistance is practically zero and conversion is frictionless.',
    typicalPricingBn: 'সেভ করা বাজেটের ১৫% - ২৫% অথবা $৩০০-$১,৫০০ ফ্ল্যাট সাবস্ক্রিপশন',
    typicalPricingEn: '15% - 25% of verified monthly savings, or $300 - $1,500/mo flat enterprise tier',
    grossMargin: '88% - 94%',
    targetAudienceBn: 'স্কেল-আপ টেক স্টার্টআপ, SaaS কোম্পানি, DevOps এজেন্সি, ক্লাউড আর্কিটেক্ট ও সিটিও।',
    targetAudienceEn: 'Mid-market tech companies, SaaS scale-ups, DevOps consultancies, enterprise CTOs.',
    techStack: {
      frontend: 'React + D3 / Recharts for live cloud topology and burn-down charts',
      backend: 'Node.js / Go, Cloud Provider SDKs (AWS Boto3/SDK, GCP Cloud Resource Manager)',
      database: 'ClickHouse / TimescaleDB for time-series billing events, PostgreSQL for user rules',
      aiOrEngine: 'Predictive utilization anomaly models + cost forecasting regression',
      cloud: 'Multi-cloud read-only IAM assume role integrations, zero client-data storage',
    },
    sampleDocType: 'cloud_bill',
  },
  {
    id: 'developer-productivity',
    nameBn: '৫. Developer Productivity & Data Pipelines',
    nameEn: '5. Developer Productivity & Data Pipelines',
    badgeBn: 'স্কেলযোগ্য ডেভেলপার ইকোসিস্টেম',
    badgeEn: 'Developer-Led Bottom-Up Growth',
    iconName: 'Cpu',
    descriptionBn:
      'ডেভেলপার ও ডেটা ইঞ্জিনিয়ারদের কাজের গতি বহুগুণ বাড়াতে বা ফ্র্যাগমেন্টেড ডেটা এক ছাদের নিচে আনতে সহায়ক API মিডলওয়্যার ও ইন্টারঅ্যাক্টিভ ড্যাশবোর্ড টুলস।',
    descriptionEn:
      'Tools that unify fragmented siloed data sources into real-time pipelines and empower teams with low-code/no-code operational business intelligence.',
    keyProductsBn: [
      'API Integration Middleware: বিভিন্ন ডেটা সোর্স (CRM, ERP, পেমেন্ট গেটওয়ে) থেকে রিয়েল-টাইমে ডাটা সিঙ্ক ও ব্যাকগ্রাউন্ড জব ম্যানেজমেন্ট।',
      'Interactive Dashboard Engines: ব্যবসায়িক উপাত্তকে সরাসরি সিদ্ধান্তমূলক ভিজ্যুয়ালে রূপান্তর করার নো-কোড/লো-কোড ড্যাশবোর্ড প্ল্যাটফর্ম।',
      'Webhook & Event Router: কোনো ইভেন্ট ফেইল করলে অটোমেটেড রিট্রাই, ডেড-লেটার কিউ এবং অডিট লগ প্রদানকারী টুল।',
    ],
    keyProductsEn: [
      'API Integration Middleware: Bidirectional real-time data sync, schema mapping, and automated background job orchestration between CRM/ERP/Stripe.',
      'Interactive Dashboard Engines: Low-code UI builders turning Postgres/SQL queries into polished internal operational tools in minutes.',
      'Webhook & Event Router: Reliable enterprise event ingestion with automatic exponential backoff, dead-letter queues, and replay capability.',
    ],
    whyProfitableBn:
      'ইঞ্জিনিয়ারিং টিমগুলোকে প্রতি মাসে লাখ লাখ টাকার কাস্টম কোডিং থেকে রক্ষা করে। প্রডাক্ট লেড গ্রোথ (PLG) মডেলে একজন ডেভেলপার ট্রাই করার পর পুরো ইঞ্জিনিয়ারিং টিম প্রিমিয়াম প্ল্যানে আপগ্রেড করে।',
    whyProfitableEn:
      'Bottom-up developer adoption (PLG): developers sign up free, integrate into staging, and organizations happily pay enterprise seat tiers ($50-$200/seat/mo).',
    typicalPricingBn: '$৫০ - $২০০ / ডেভেলপার সিট / মাস অথবা $৪০০ ফ্ল্যাট টিম প্ল্যান',
    typicalPricingEn: '$50 - $200 / developer seat / month, or $400 - $1,500 team tier',
    grossMargin: '85% - 91%',
    targetAudienceBn: 'সফটওয়্যার ডেভেলপমেন্ট এজেন্সি, ইন-হাউস ইঞ্জিনিয়ারিং টিম, প্রোডাক্ট ম্যানেজার, সিটিও।',
    targetAudienceEn: 'Software consultancies, engineering teams, data engineering leads, tech founders.',
    techStack: {
      frontend: 'React, Monaco Editor (code editor), React Flow for node-based visual pipelines',
      backend: 'Node.js / Go, WebSocket for real-time log streaming, Worker nodes',
      database: 'PostgreSQL + Redis for distributed lock & fast queue, DuckDB for fast analytics',
      aiOrEngine: 'Natural Language to SQL / schema generator, automated API documentation parser',
      cloud: 'Docker containerized sandboxes, Kubernetes cluster auto-scaling',
    },
    sampleDocType: 'contract',
  },
];
