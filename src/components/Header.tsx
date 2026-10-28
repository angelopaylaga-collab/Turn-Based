/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Smartphone, Settings, Mail, Trophy, Sparkles, BookOpen } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  playerLevel: number;
  crystals: number;
  coins: number;
  energy: number;
  maxEnergy: number;
  unreadMail: boolean;
  unclaimedAchievements: boolean;
  onOpenInstall: () => void;
  onOpenSettings: () => void;
  onOpenMail: () => void;
  onOpenAchievements: () => void;
  onOpenGDD: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  playerLevel,
  crystals,
  coins,
  energy,
  maxEnergy,
  unreadMail,
  unclaimedAchievements,
  onOpenInstall,
  onOpenSettings,
  onOpenMail,
  onOpenAchievements,
  onOpenGDD,
}) => {
  return (
    <header className="w-full bg-slate-950/85 backdrop-blur-md border-b border-indigo-950/80 px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Player Profile & Currencies */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-0.5">
        {/* Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-500 p-0.5 shadow-md shadow-purple-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-lg sm:text-xl">
                🦊
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] px-1 rounded-full border border-slate-900 shadow">
              Lv.{playerLevel}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-white tracking-wide">Trailblazer</div>
            <div className="text-[10px] text-indigo-300">Emoji Astral RPG</div>
          </div>
        </div>

        {/* Currencies */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs">
          {/* Energy ⚡ */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 shadow-inner">
            <span className="text-amber-400 font-bold">⚡</span>
            <span className="font-semibold text-[11px] sm:text-xs">
              {energy}/{maxEnergy}
            </span>
          </div>

          {/* Coins 🪙 */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 shadow-inner">
            <span className="text-yellow-400">🪙</span>
            <span className="font-semibold text-[11px] sm:text-xs font-mono">
              {coins.toLocaleString()}
            </span>
          </div>

          {/* Crystals 💎 */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 border border-indigo-900/50 text-indigo-200 shadow-inner">
            <span className="text-cyan-400">💎</span>
            <span className="font-semibold text-[11px] sm:text-xs font-mono text-cyan-300">
              {crystals.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Install on Phone / Download PWA Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenInstall();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition transform active:scale-95"
          title="Download to Phone / Install PWA"
        >
          <Smartphone className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline">Install to Phone</span>
          <span className="sm:hidden">Install</span>
        </button>

        {/* GDD Reference Book */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenGDD();
          }}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
          title="Game Design Document & PDF"
        >
          <BookOpen className="w-4 h-4 text-purple-400" />
        </button>

        {/* Mail */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenMail();
          }}
          className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
          title="Mail"
        >
          <Mail className="w-4 h-4 text-blue-400" />
          {unreadMail && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
          )}
        </button>

        {/* Achievements */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenAchievements();
          }}
          className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
          title="Achievements"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          {unclaimedAchievements && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenSettings();
          }}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
