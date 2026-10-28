/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Volume2, VolumeX, Smartphone, RefreshCw, Save, Check, Download, Upload, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  battleSpeed: number; // 1 or 2
  onChangeBattleSpeed: (speed: number) => void;
  onOpenInstall: () => void;
  onResetProgress: () => void;
  onManualSave?: () => void;
  onExportSave?: () => string;
  onImportSave?: (code: string) => boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  battleSpeed,
  onChangeBattleSpeed,
  onOpenInstall,
  onResetProgress,
  onManualSave,
  onExportSave,
  onImportSave,
}) => {
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [importCodeInput, setImportCodeInput] = useState<string>('');
  const [showImportBox, setShowImportBox] = useState<boolean>(false);

  if (!isOpen) return null;

  const triggerSaveNow = () => {
    if (onManualSave) onManualSave();
    sounds.playClick();
    setSaveToast('Progress Saved to Device!');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const copyExportData = () => {
    if (!onExportSave) return;
    const code = onExportSave();
    navigator.clipboard?.writeText(code).then(() => {
      sounds.playClick();
      setSaveToast('Save Code Copied to Clipboard!');
      setTimeout(() => setSaveToast(null), 2500);
    }).catch(() => {
      prompt('Copy your Save Code below:', code);
    });
  };

  const handleApplyImport = () => {
    if (!onImportSave || !importCodeInput.trim()) return;
    const success = onImportSave(importCodeInput.trim());
    if (success) {
      sounds.playClick();
      setSaveToast('Game Progress Restored!');
      setShowImportBox(false);
      setImportCodeInput('');
      setTimeout(() => setSaveToast(null), 2500);
    } else {
      alert('Invalid save code. Please check and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/30 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            ⚙️ Game Settings & Save Data
          </h3>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveToast && (
          <div className="bg-emerald-600 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow animate-bounce">
            <Check className="w-4 h-4" />
            <span>{saveToast}</span>
          </div>
        )}

        <div className="space-y-3 text-xs">
          {/* Auto-Save & Progress Persistence Info */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Auto-Save Active</span>
              </div>
              <button
                onClick={triggerSaveNow}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 text-[11px] transition shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Now</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              All currencies, characters, levels, battle clears, mail, and missions are automatically saved to your browser/device localStorage. Closing or refreshing your app will never restart your progress.
            </p>

            {/* Export & Import buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <button
                onClick={copyExportData}
                className="flex-1 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 font-semibold flex items-center justify-center gap-1 text-[11px] transition"
              >
                <Download className="w-3 h-3 text-indigo-400" />
                <span>Backup Save Code</span>
              </button>
              <button
                onClick={() => setShowImportBox((prev) => !prev)}
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-1 text-[11px] transition"
              >
                <Upload className="w-3 h-3 text-amber-400" />
                <span>Restore Code</span>
              </button>
            </div>

            {showImportBox && (
              <div className="pt-2 space-y-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400">Paste your backup save code below:</div>
                <input
                  type="text"
                  value={importCodeInput}
                  onChange={(e) => setImportCodeInput(e.target.value)}
                  placeholder="Paste base64 save code here..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  onClick={handleApplyImport}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition"
                >
                  Apply & Load Game State
                </button>
              </div>
            )}
          </div>

          {/* Sound Audio Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-white font-semibold">Sound FX (Synthesized)</div>
              <div className="text-slate-400 text-[11px]">Dynamic Web Audio combat sounds</div>
            </div>
            <button
              onClick={() => {
                onToggleSound();
                sounds.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Default Battle Speed */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-white font-semibold">Battle Animation Speed</div>
              <div className="text-slate-400 text-[11px]">Normal 1x vs Rapid 2x Combat</div>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => {
                  sounds.playClick();
                  onChangeBattleSpeed(1);
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  battleSpeed === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onChangeBattleSpeed(2);
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  battleSpeed === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                2x
              </button>
            </div>
          </div>

          {/* Download to Phone PWA */}
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <div className="text-white font-semibold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                Download App to Phone
              </div>
              <div className="text-slate-400 text-[11px]">Install home screen PWA & QR scanner</div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenInstall();
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            >
              Open
            </button>
          </div>

          {/* Reset progress */}
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 flex items-center justify-between">
            <div>
              <div className="text-rose-300 font-semibold">Reset Game Data</div>
              <div className="text-slate-400 text-[11px]">Restore default starter lineup & resources</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset all progress to initial starter state?')) {
                  sounds.playClick();
                  onResetProgress();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-900 text-rose-200 text-[11px] font-bold"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-[10px] text-slate-500">
          Emoji Astral RPG v2.0 • Auto-Saved Offline Progressive Web App
        </div>
      </div>
    </div>
  );
};
