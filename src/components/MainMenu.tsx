/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Swords, Users, ShoppingBag, Sparkles, CheckCircle2, ChevronRight, Smartphone } from 'lucide-react';
import { sounds } from '../utils/audio';

interface MainMenuProps {
  onOpenStory: () => void;
  onOpenBattleModes: () => void;
  onOpenCharacters: () => void;
  onOpenShop: () => void;
  onOpenInstall: () => void;
  dailyMissions: { id: string; title: string; progress: number; max: number; claimed: boolean; reward: number }[];
  onClaimMission: (id: string) => void;
  activePartyEmojis: string[];
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onOpenStory,
  onOpenBattleModes,
  onOpenCharacters,
  onOpenShop,
  onOpenInstall,
  dailyMissions,
  onClaimMission,
  activePartyEmojis,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 max-w-6xl mx-auto w-full relative z-10 select-none">
      {/* Hero / Party Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900/80 border border-indigo-500/20 p-5 sm:p-7 shadow-2xl backdrop-blur-md overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Tactical Emoji RPG • Version 2.0
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Astral Realm Expedition
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Master the 9 Paths and 8 Elements. Break enemy shields, stagger bosses, and unleash devastating team ultimates.
            </p>
          </div>

          {/* Active Party Preview */}
          <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Battle Lineup
            </div>
            <div
              onClick={() => {
                sounds.playClick();
                onOpenCharacters();
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-indigo-400 cursor-pointer transition shadow-lg group"
              title="Click to edit lineup in Characters"
            >
              {activePartyEmojis.map((emoji, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 rounded-lg bg-slate-800/90 flex items-center justify-center text-xl border border-slate-700 shadow group-hover:scale-105 transition"
                >
                  {emoji}
                </div>
              ))}
              <div className="px-2 text-xs text-indigo-300 flex items-center gap-0.5 group-hover:text-indigo-200">
                <span>Team</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center 4 Large Buttons (GDD Part 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* 1. Story Campaign */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenStory();
          }}
          className="group relative rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900/90 border border-indigo-500/30 hover:border-indigo-400 p-6 flex flex-col justify-between text-left transition transform hover:-translate-y-1 shadow-xl hover:shadow-indigo-500/20 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">
            📖
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition">
              📖
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-indigo-200 transition">
                Story Campaign
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Embark on main chapters, discover bosses, and unlock legendary warriors.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
            <span>Enter Expedition</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* 2. Battle Modes (Endgame) */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenBattleModes();
          }}
          className="group relative rounded-2xl bg-gradient-to-br from-red-950/40 to-slate-900/90 border border-red-500/30 hover:border-red-400 p-6 flex flex-col justify-between text-left transition transform hover:-translate-y-1 shadow-xl hover:shadow-red-500/20 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">
            ⚔️
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-white group-hover:text-red-200 transition">
                  Battle Modes
                </h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                  Endgame
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Memory of Chaos, Pure Onslaught endless waves, and Anomaly Arbitration.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-red-400 group-hover:text-red-300">
            <span>Challenge Gauntlets</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* 3. Characters */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenCharacters();
          }}
          className="group relative rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900/90 border border-amber-500/30 hover:border-amber-400 p-6 flex flex-col justify-between text-left transition transform hover:-translate-y-1 shadow-xl hover:shadow-amber-500/20 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">
            👥
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition">
              👥
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-amber-200 transition">
                Characters
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Explore 5★ & 4★ heroes across all 9 Paths. Level up, upgrade stats, and build your dream team.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
            <span>Manage Lineup</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* 4. Shop / Warp */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenShop();
          }}
          className="group relative rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 p-6 flex flex-col justify-between text-left transition transform hover:-translate-y-1 shadow-xl hover:shadow-emerald-500/20 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">
            ✨
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 border border-amber-400/50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition">
              🌠
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-white group-hover:text-amber-200 transition">
                  Astral Warp
                </h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  5★ Banners
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Honkai-style Banners with guaranteed 5★ & 4★ pity, event rate-ups, and 20% off Departure Warp.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
            <span>Enter Warp</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
          </div>
        </button>
      </div>

      {/* Bottom Section: Daily Missions + Mobile Install Prompt Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Missions (GDD Part 1) */}
        <div className="md:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">📜</span>
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Daily Missions Tracker
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Resets daily at 04:00</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dailyMissions.map((mission) => (
              <div
                key={mission.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div className="space-y-1">
                  <div className="text-slate-200 font-medium">{mission.title}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>
                      {mission.progress}/{mission.max}
                    </span>
                    <span className="text-cyan-400">+{mission.reward} 💎</span>
                  </div>
                </div>

                {mission.claimed ? (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Claimed
                  </span>
                ) : (
                  <button
                    disabled={mission.progress < mission.max}
                    onClick={() => {
                      sounds.playClick();
                      onClaimMission(mission.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      mission.progress >= mission.max
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm animate-bounce'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Claim
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Download to Phone Quick Banner */}
        <div
          onClick={() => {
            sounds.playClick();
            onOpenInstall();
          }}
          className="rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-950/80 border border-indigo-500/40 p-4 flex flex-col justify-between cursor-pointer hover:border-indigo-400 transition shadow-lg group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-indigo-600/40 text-white text-lg">📱</span>
              <span className="text-[10px] font-bold text-indigo-300 uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                PWA Mobile
              </span>
            </div>
            <div className="text-sm font-bold text-white group-hover:text-indigo-200 transition">
              Download to Phone
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              Scan the QR code or tap to install directly on iPhone or Android for full-screen offline gameplay!
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-300 group-hover:text-indigo-100">
            <span>Install on mobile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
