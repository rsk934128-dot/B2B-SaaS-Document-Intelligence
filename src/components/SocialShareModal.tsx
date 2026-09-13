import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Language } from '../types';
import {
  Share2,
  Copy,
  Check,
  X,
  Mail,
  QrCode,
  Sparkles,
  Download,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  Layers,
  ArrowRight,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isBn = language === 'bn';
  const [activeTab, setActiveTab] = useState<'qr' | 'social'>('qr');
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState<180 | 240>(180);
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // App URL for sharing (uses current window location or canonical production URL)
  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-u5wut7rue7kkxxxoea42bn-622126518866.asia-east1.run.app';

  const shareTitle = isBn
    ? 'B2B SaaS & Document Intelligence প্ল্যাটফর্ম'
    : 'B2B SaaS & Document Intelligence Platform';

  const shareDescription = isBn
    ? 'এআই-চালিত ডকুমেন্ট অডিট, গুগল ড্রাইভ ইন্টেলিজেন্স, রিয়েল-টাইম কমপ্লায়েন্স টেলিমেট্রি এবং হাই-ইনকাম বি২বি আর্কিটেকচার প্ল্যাটফর্ম।'
    : 'AI-powered document intelligence, Google Drive auditing, real-time enterprise compliance telemetry, and high-income B2B SaaS architecture.';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleDownloadQr = () => {
    try {
      if (!qrCanvasRef.current) return;
      const canvas = qrCanvasRef.current.querySelector('canvas');
      if (!canvas) return;

      const imageUri = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imageUri;
      downloadLink.download = `Enterprise-App-QRCode-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setQrDownloaded(true);
      setTimeout(() => setQrDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to download QR code image:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch (err) {
        // User dismissed system share
      }
    } else {
      handleCopyLink();
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${shareTitle} - ${shareDescription}`);
  const encodedEmailSubject = encodeURIComponent(shareTitle);
  const encodedEmailBody = encodeURIComponent(
    `${shareDescription}\n\nভিজিট করুন / Access application here: ${shareUrl}`
  );

  const mediaPlatforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      nameBn: 'হোয়াটসঅ্যাপ',
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      bgColor: 'bg-[#25D366]',
      hoverBg: 'hover:bg-[#20bd5a]',
      textColor: 'text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      nameBn: 'লিঙ্কডইন',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bgColor: 'bg-[#0077b5]',
      hoverBg: 'hover:bg-[#00669c]',
      textColor: 'text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      nameBn: 'এক্স (টুইটার)',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      bgColor: 'bg-black',
      hoverBg: 'hover:bg-slate-800',
      textColor: 'text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      nameBn: 'ফেসবুক',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bgColor: 'bg-[#1877F2]',
      hoverBg: 'hover:bg-[#1466d0]',
      textColor: 'text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      ),
    },
    {
      id: 'telegram',
      name: 'Telegram',
      nameBn: 'টেলিগ্রাম',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      bgColor: 'bg-[#229ED9]',
      hoverBg: 'hover:bg-[#1e8ec3]',
      textColor: 'text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      id: 'email',
      name: 'Email',
      nameBn: 'ইমেইল',
      url: `mailto:?subject=${encodedEmailSubject}&body=${encodedEmailBody}`,
      bgColor: 'bg-slate-700',
      hoverBg: 'hover:bg-slate-800',
      textColor: 'text-white',
      icon: <Mail className="w-5 h-5 text-white" />,
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      id="social-share-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-scaleUp"
        id="social-share-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{isBn ? 'অ্যাপটি শেয়ার করুন' : 'Share This Application'}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-2.5 h-2.5" />
                  {isBn ? 'এন্টারপ্রাইজ কুইক-স্ক্যান' : 'Enterprise Quick-Scan'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn
                  ? 'মোবাইল ডিভাইস ও সোশ্যাল মিডিয়া প্ল্যাটফর্মে প্ল্যাটফর্মটি সহজে শেয়ার করুন'
                  : 'Quick mobile QR onboarding and multi-platform enterprise sharing'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-share-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-4 flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            id="tab-qr-code"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>{isBn ? 'কুইক-স্ক্যান QR কোড' : 'Quick-Scan QR Code'}</span>
          </button>

          <button
            type="button"
            id="tab-social-media"
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'social'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isBn ? 'সোশ্যাল মিডিয়া প্ল্যাটফর্ম' : 'Social Platforms'}</span>
          </button>
        </div>

        {/* Tab 1: Enterprise Quick-Scan QR Code Generator Component */}
        {activeTab === 'qr' && (
          <div className="mt-4 space-y-4 animate-fadeIn" id="qr-code-generator-section">
            {/* QR Card Container */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/30 border border-slate-200 flex flex-col items-center justify-center text-center">
              {/* QR Code Canvas with High Precision rendering */}
              <div
                ref={qrCanvasRef}
                className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block relative group"
              >
                <QRCodeCanvas
                  value={shareUrl}
                  size={qrSize}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />

                {/* Subtle center insignia overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                    <Smartphone className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Verified Domain & Live Quick-Scan Link */}
              <div className="mt-3.5 w-full max-w-sm">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBn ? 'নিরাপদ SSL লিঙ্ক সক্রিয়' : 'Verified Secure Link'}</span>
                </div>
                <p className="text-xs font-medium text-slate-700 truncate px-2" title={shareUrl}>
                  {shareUrl}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isBn
                    ? 'স্মার্টফোনের ক্যামেরা বা Google Lens দিয়ে তাৎক্ষণিক স্ক্যান করুন'
                    : 'Scan with smartphone camera or Google Lens to launch directly'}
                </p>
              </div>

              {/* QR Resolution & Actions Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 w-full flex flex-wrap items-center justify-between gap-2">
                {/* Size toggle */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[11px]">
                  <span className="text-slate-400 px-1 font-medium">{isBn ? 'সাইজ:' : 'Size:'}</span>
                  <button
                    type="button"
                    onClick={() => setQrSize(180)}
                    className={`px-2 py-0.5 rounded transition cursor-pointer font-medium ${
                      qrSize === 180 ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    180px
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrSize(240)}
                    className={`px-2 py-0.5 rounded transition cursor-pointer font-medium ${
                      qrSize === 240 ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    240px (HD)
                  </button>
                </div>

                {/* Download QR Button */}
                <button
                  type="button"
                  id="download-qr-btn"
                  onClick={handleDownloadQr}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs ${
                    qrDownloaded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                  }`}
                  title={isBn ? 'QR কোড ছবি ডাউনলোড করুন' : 'Download QR code image'}
                >
                  {qrDownloaded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>{isBn ? 'ডাউনলোড সম্পন্ন!' : 'Downloaded!'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isBn ? 'QR ডাউনলোড (PNG)' : 'Download QR (PNG)'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Social Media Platforms */}
        {activeTab === 'social' && (
          <div className="mt-4 animate-fadeIn" id="social-media-channels-section">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {isBn ? 'সোশ্যাল মিডিয়া প্ল্যাটফর্ম বেছে নিন' : 'Select Sharing Channel'}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {mediaPlatforms.map((platform) => (
                <a
                  key={platform.id}
                  id={`share-channel-${platform.id}`}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-100 transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-xs ${platform.bgColor} ${platform.hoverBg} ${platform.textColor}`}
                >
                  {platform.icon}
                  <span className="text-xs font-bold leading-tight text-center">
                    {isBn ? platform.nameBn : platform.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Quick Copy Link Bar (Always accessible) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isBn ? 'অ্যাপ্লিকেশন লিঙ্ক (Direct Share URL)' : 'Direct Application URL'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 focus:outline-hidden select-all"
            />
            <button
              type="button"
              id="copy-share-url-btn"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isBn ? 'কপি হয়েছে!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isBn ? 'কপি করুন' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Native Share Trigger */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <div className="mt-3 pt-2 flex items-center justify-end">
            <button
              type="button"
              id="native-web-share-btn"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'ডিভাইসের সিস্টেম শেয়ার শিট খুলুন' : 'Open System Share Sheet'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
