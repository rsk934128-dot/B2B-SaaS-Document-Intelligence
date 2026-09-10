import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [showGenericGuide, setShowGenericGuide] = useState<boolean>(false);

  const isBn = language === 'bn';

  // If already running as an installed standalone app, hide install trigger
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>{isBn ? 'ইনস্টলড' : 'Installed'}</span>
      </div>
    );
  }

  // Native prompt available (Chrome, Android, Edge, Desktop)
  if (isInstallable) {
    return (
      <button
        type="button"
        id="pwa-native-install-btn"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-xs hover:shadow-blue-500/20 transition cursor-pointer"
        title={isBn ? 'ডিভাইসে অ্যাপ ইনস্টল করুন' : 'Install App on Device'}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{isBn ? 'অ্যাপ ইনস্টল করুন' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          title={isBn ? 'আইফোনে অ্যাপ ইনস্টল করুন' : 'Install on iPhone / iPad'}
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>{isBn ? 'iOS ইনস্টল' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/icon.svg"
                  alt="App Logo"
                  className="w-12 h-12 rounded-xl shadow-md border border-slate-700"
                />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isBn ? 'আইফোন / আইপ্যাডে ইনস্টল করুন' : 'Install on iPhone / iPad'}
                  </h3>
                  <p className="text-xs text-slate-400">DocIntel B2B Platform</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ১
                  </div>
                  <div>
                    {isBn ? (
                      <>
                        সাফারি ব্রাউজারের নিচের টুলবারে <strong className="text-blue-400">Share</strong> (
                        <Share2 className="inline w-3.5 h-3.5 mx-0.5" />
                        ) বাটনে ট্যাপ করুন।
                      </>
                    ) : (
                      <>
                        Tap the <strong className="text-blue-400">Share</strong> icon in the Safari toolbar (
                        <Share2 className="inline w-3.5 h-3.5 mx-0.5" />
                        ).
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ২
                  </div>
                  <div>
                    {isBn ? (
                      <>
                        মেনু স্ক্রল করে <strong className="text-emerald-400">Add to Home Screen</strong> (
                        <PlusSquare className="inline w-3.5 h-3.5 mx-0.5" />
                        ) অপশনটি নির্বাচন করুন।
                      </>
                    ) : (
                      <>
                        Scroll down and select <strong className="text-emerald-400">Add to Home Screen</strong> (
                        <PlusSquare className="inline w-3.5 h-3.5 mx-0.5" />
                        ).
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ৩
                  </div>
                  <div>
                    {isBn ? (
                      <>
                        উপরের ডানপাশে <strong className="text-blue-400">Add</strong> বাটনে ট্যাপ করলেই হোম স্ক্রিনে সুন্দর লোগোসহ অ্যাপটি ইনস্টল হয়ে যাবে!
                      </>
                    ) : (
                      <>
                        Tap <strong className="text-blue-400">Add</strong> in the top right to install the app with its official logo on your home screen!
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
              >
                {isBn ? 'বুঝেছি, বন্ধ করুন' : 'Got it, Close'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for desktop / other mobile browsers where beforeinstallprompt hasn't fired yet
  return (
    <>
      <button
        type="button"
        id="pwa-generic-install-btn"
        onClick={() => setShowGenericGuide(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
        title={isBn ? 'মোবাইল বা পিসিতে ইনস্টল করুন' : 'Install on Mobile or Desktop'}
      >
        <Download className="w-3.5 h-3.5 text-blue-400" />
        <span>{isBn ? 'ইনস্টল' : 'Install'}</span>
      </button>

      {showGenericGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100">
            <button
              type="button"
              onClick={() => setShowGenericGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src="/icon.svg"
                alt="App Logo"
                className="w-12 h-12 rounded-xl shadow-md border border-slate-700"
              />
              <div>
                <h3 className="text-base font-bold text-white">
                  {isBn ? 'মোবাইল বা কম্পিউটারে অ্যাপ ইনস্টল করুন' : 'Install Application on Device'}
                </h3>
                <p className="text-xs text-slate-400">DocIntel B2B Platform • Progressive Web App</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <p>
                {isBn ? (
                  <>
                    <strong className="text-blue-400">মোবাইল ডিভাইস (Chrome / Android):</strong> ব্রাউজারের থ্রি-ডট (⋮) মেনুতে ট্যাপ করে <strong>"Install app"</strong> বা <strong>"Add to Home screen"</strong> চাপুন। হোম স্ক্রিনে আমাদের লোগোসহ অ্যাপটি যুক্ত হবে।
                  </>
                ) : (
                  <>
                    <strong className="text-blue-400">Mobile (Chrome / Android):</strong> Tap the three dots (⋮) in your browser menu and choose <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </>
                )}
              </p>
              <p>
                {isBn ? (
                  <>
                    <strong className="text-emerald-400">কম্পিউটার (Chrome / Edge):</strong> অ্যাড্রেস বারের ডানপাশে ইনস্টল আইকন (
                    <Download className="inline w-3 h-3 mx-0.5" />
                    ) অথবা থ্রি-ডট মেনু থেকে <strong>"Install DocIntel B2B"</strong> সিলেক্ট করুন।
                  </>
                ) : (
                  <>
                    <strong className="text-emerald-400">Desktop (Chrome / Edge):</strong> Click the install icon in the address bar or select <strong>"Install DocIntel B2B"</strong> from the menu.
                  </>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGenericGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
            >
              {isBn ? 'ঠিক আছে' : 'OK, Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
