/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Download, ArrowDownToLine, Layers, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { GDD_SECTIONS } from '../data/gddContent';
import { sounds } from '../utils/audio';

interface GDDViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GDDViewerModal: React.FC<GDDViewerModalProps> = ({ isOpen, onClose }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(GDD_SECTIONS[0].id);

  if (!isOpen) return null;

  const currentSection = GDD_SECTIONS.find((s) => s.id === activeSectionId) || GDD_SECTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[90vh] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Game Design Document Reference
              </h2>
              <p className="text-xs text-slate-400">Honkai: Star Rail inspired turn-based tactical RPG</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/assets/aistudio/Turn-Based_Game.html_732f52d6.pdf"
              download="Emoji_Tactical_RPG_Game_Design_Document.pdf"
              onClick={() => sounds.playClick()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm"
              title="Download original PDF"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </a>
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
        </div>

        {/* Content Body: Sidebar + Main Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 p-2 md:p-3 space-y-1 overflow-x-auto md:overflow-y-auto flex md:flex-col shrink-0">
            {GDD_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveSectionId(section.id);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 shrink-0 ${
                  activeSectionId === section.id
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white font-bold shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className="text-base">{section.icon}</span>
                <span className="truncate">{section.title}</span>
              </button>
            ))}
          </div>

          {/* Detailed Content Viewer */}
          <div className="flex-1 p-5 md:p-7 overflow-y-auto space-y-6 text-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <span className="text-3xl">{currentSection.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-white">{currentSection.title}</h3>
                <p className="text-xs text-indigo-300">Official Specification</p>
              </div>
            </div>

            <div className="space-y-3">
              {currentSection.content.map((paragraph, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                    paragraph.startsWith('•')
                      ? 'bg-slate-800/20 border-l-2 border-indigo-400 pl-4 text-slate-300'
                      : 'bg-slate-800/40 border border-slate-700/40 text-slate-200'
                  }`}
                >
                  {paragraph}
                </div>
              ))}
            </div>

            {/* If section contains table (e.g. Elemental Shields & Break matrix) */}
            {currentSection.tables && (
              <div className="space-y-3 mt-4">
                <div className="font-semibold text-xs uppercase tracking-wider text-slate-400">
                  Elemental Break & Weakness Reference Table
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-300 uppercase font-semibold text-[11px] border-b border-slate-800">
                      <tr>
                        {currentSection.tables.headers.map((h, i) => (
                          <th key={i} className="px-4 py-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 bg-slate-900/50">
                      {currentSection.tables.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-4 py-2.5 font-medium text-slate-200">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Attachment Source: Turn-Based_Game.html_732f52d6.pdf</span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
