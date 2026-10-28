/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Download, Smartphone, QrCode, Share, Check, X, ArrowDownToLine, Monitor, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sounds } from '../utils/audio';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'ios' | 'android' | 'pdf'>('qr');

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-pbdjde6nzrvvunxx4kxrr3-873081854110.asia-east1.run.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeInstall = async () => {
    sounds.playClick();
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30 shadow-2xl shadow-indigo-950/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
              📱
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Download to Your Phone
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PWA Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">Play full-screen offline without an app store</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1 text-xs">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('qr');
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Scan QR
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('ios');
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            iPhone / iPad
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('android');
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Android
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('pdf');
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'pdf'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            GDD PDF
          </button>
        </div>

        {/* Tab content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Direct Install Button if supported by current browser */}
          {isInstallable && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/40 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-emerald-300">Ready to Install Directly</div>
                <div className="text-xs text-slate-300">Install to your home screen with 1 tap</div>
              </div>
              <button
                onClick={handleNativeInstall}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
              >
                <ArrowDownToLine className="w-4 h-4" />
                Install Now
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              This app is already running in standalone installed PWA mode!
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-xl shadow-black/40 border border-indigo-200">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Scan QR Code to open on phone" className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-sm">Generating QR...</div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Scan with your phone's camera</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Point your phone's camera at this QR code to instantly open the game, then tap "Add to Home Screen" to download!
                </p>
              </div>

              {/* App URL copy */}
              <div className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="truncate text-slate-400 flex-1 px-2 font-mono">{appUrl}</span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shrink-0 transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="font-semibold text-indigo-300 flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4" />
                  How to install on iPhone & iPad (Safari):
                </div>
                <ol className="space-y-2.5 text-slate-300 list-decimal list-inside pl-1">
                  <li className="leading-relaxed">
                    Open this game in <strong className="text-white">Safari</strong> on your iPhone.
                  </li>
                  <li className="leading-relaxed">
                    Tap the <strong className="text-white">Share</strong> button at the bottom of the screen (the square with an arrow pointing up 📤).
                  </li>
                  <li className="leading-relaxed">
                    Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> (➕).
                  </li>
                  <li className="leading-relaxed">
                    Tap <strong className="text-white">"Add"</strong> in the top-right corner.
                  </li>
                  <li className="leading-relaxed text-emerald-400 font-medium">
                    The game icon ⚔️ will now be on your home screen and launches full-screen like a native app!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="font-semibold text-emerald-300 flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4" />
                  How to install on Android (Chrome / Brave / Edge):
                </div>
                <ol className="space-y-2.5 text-slate-300 list-decimal list-inside pl-1">
                  <li className="leading-relaxed">
                    Open this game in <strong className="text-white">Google Chrome</strong> on your Android phone.
                  </li>
                  <li className="leading-relaxed">
                    Tap the <strong className="text-white">three dots menu (⋮)</strong> in the top-right corner.
                  </li>
                  <li className="leading-relaxed">
                    Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
                  </li>
                  <li className="leading-relaxed">
                    Confirm by tapping <strong className="text-white">Install</strong>.
                  </li>
                  <li className="leading-relaxed text-emerald-400 font-medium">
                    The game will install directly as a native standalone app with offline support!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="font-semibold text-purple-300 flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Download Game Design Document (.pdf)
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Download the complete 31-page Game Design Document containing all 9 Paths, 8 Elements, 27 Characters, Boss AI systems, and visual cue rules directly to your phone or desktop:
                </p>

                <a
                  href="/assets/aistudio/Turn-Based_Game.html_732f52d6.pdf"
                  download="Emoji_Tactical_RPG_Game_Design_Document.pdf"
                  onClick={() => sounds.playClick()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition text-sm"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Download Game Design Document PDF
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Service worker & offline cache active
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
