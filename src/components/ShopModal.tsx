/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Coins,
  Zap,
  Info,
  Clock,
  ChevronRight,
  RotateCcw,
  Star,
  Flame,
  Award,
  Layers,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Character, ElementType, PathType } from '../types/game';
import { sounds } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  crystals: number;
  coins: number;
  energy: number;
  maxEnergy: number;
  characters: Character[];
  onUnlockCharacter: (characterId: string) => void;
  onAddCrystals: (amount: number) => void;
  onAddCoins: (amount: number) => void;
  onAddEnergy: (amount: number) => void;
}

export type BannerId = 'event_ember' | 'event_voltrix' | 'departure' | 'stellar' | 'supplies';

interface WarpPullResult {
  id: string;
  name: string;
  emoji: string;
  rarity: 3 | 4 | 5;
  type: 'character' | 'lightcone';
  path?: PathType;
  element?: ElementType;
  title?: string;
  isNew?: boolean;
}

const ELEMENT_COLORS: Record<ElementType, string> = {
  Fire: 'text-orange-400 bg-orange-500/20 border-orange-500/40',
  Ice: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40',
  Lightning: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40',
  Wind: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
  Earth: 'text-amber-500 bg-amber-600/20 border-amber-600/40',
  Water: 'text-blue-400 bg-blue-500/20 border-blue-500/40',
  Light: 'text-yellow-300 bg-yellow-400/20 border-yellow-400/40',
  Shadow: 'text-purple-400 bg-purple-500/20 border-purple-500/40',
};

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  crystals,
  coins,
  energy,
  maxEnergy,
  characters,
  onUnlockCharacter,
  onAddCrystals,
  onAddCoins,
  onAddEnergy,
}) => {
  const [activeBanner, setActiveBanner] = useState<BannerId>('event_ember');
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [hasClaimedDaily, setHasClaimedDaily] = useState<boolean>(false);

  // Persistent Pity Counters
  const [pity5, setPity5] = useState<number>(() => {
    try {
      const s = localStorage.getItem('HSR_PITY_5');
      if (s) return parseInt(s, 10);
    } catch {}
    return 14;
  });

  const [pity4, setPity4] = useState<number>(() => {
    try {
      const s = localStorage.getItem('HSR_PITY_4');
      if (s) return parseInt(s, 10);
    } catch {}
    return 3;
  });

  const [departurePulls, setDeparturePulls] = useState<number>(() => {
    try {
      const s = localStorage.getItem('HSR_DEPARTURE_PULLS');
      if (s) return parseInt(s, 10);
    } catch {}
    return 0;
  });

  const [warpHistory, setWarpHistory] = useState<
    { name: string; rarity: number; time: string; banner: string }[]
  >(() => {
    try {
      const s = localStorage.getItem('HSR_WARP_HISTORY');
      if (s) return JSON.parse(s);
    } catch {}
    return [];
  });

  // Animation & Reveal state
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [warpRarityHighest, setWarpRarityHighest] = useState<3 | 4 | 5>(3);
  const [warpResults, setWarpResults] = useState<WarpPullResult[] | null>(null);
  const [spotlightHero, setSpotlightHero] = useState<WarpPullResult | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('HSR_PITY_5', pity5.toString());
      localStorage.setItem('HSR_PITY_4', pity4.toString());
      localStorage.setItem('HSR_DEPARTURE_PULLS', departurePulls.toString());
      localStorage.setItem('HSR_WARP_HISTORY', JSON.stringify(warpHistory));
    } catch {}
  }, [pity5, pity4, departurePulls, warpHistory]);

  if (!isOpen) return null;

  // 5-Star and 4-Star Character Pools
  const fiveStars = characters.filter((c) => c.rarity === 5);
  const fourStars = characters.filter((c) => c.rarity === 4);

  // Three-star consolation Light Cones
  const THREE_STAR_LIGHT_CONES = [
    { name: 'Darting Arrow', emoji: '🏹', path: 'Hunt' },
    { name: 'Adversarial', emoji: '⚔️', path: 'Hunt' },
    { name: 'Passkey', emoji: '🗝️', path: 'Erudition' },
    { name: 'Amber Shield', emoji: '🛡️', path: 'Preservation' },
    { name: 'Cornucopia', emoji: '🏺', path: 'Abundance' },
    { name: 'Chorus Baton', emoji: '🎶', path: 'Harmony' },
    { name: 'Void Snare', emoji: '🕸️', path: 'Nihility' },
    { name: 'Shattered Mirror', emoji: '🪞', path: 'Remembrance' },
    { name: 'Hidden Dice', emoji: '🎲', path: 'Elation' },
  ];

  // Perform single roll logic using exact HSR probabilities & pity
  const rollOne = (banner: BannerId, currentPity5: number, currentPity4: number) => {
    let finalPity5 = currentPity5 + 1;
    let finalPity4 = currentPity4 + 1;

    // Soft pity starts at 74 pulls: rate increases by 6% per pull up to guaranteed 100% at 90
    let fiveStarProb = 0.006;
    if (finalPity5 >= 74) {
      fiveStarProb = 0.006 + (finalPity5 - 73) * 0.06;
    }
    if (finalPity5 >= 90) fiveStarProb = 1.0;

    // 4-star guaranteed at 10
    let fourStarProb = 0.051;
    if (finalPity4 >= 10) fourStarProb = 1.0;

    const roll = Math.random();
    let result: WarpPullResult;

    if (roll < fiveStarProb) {
      // 5-STAR PULL!
      finalPity5 = 0;
      finalPity4 = 0;

      let chosenHero: Character;
      if (banner === 'event_ember') {
        // 50% featured rate-up Ember, or 50% other 5★
        if (Math.random() < 0.5) {
          chosenHero = characters.find((c) => c.id === 'ember') || fiveStars[0];
        } else {
          chosenHero = fiveStars[Math.floor(Math.random() * fiveStars.length)];
        }
      } else if (banner === 'event_voltrix') {
        if (Math.random() < 0.5) {
          chosenHero = characters.find((c) => c.id === 'voltrix') || fiveStars[0];
        } else {
          chosenHero = fiveStars[Math.floor(Math.random() * fiveStars.length)];
        }
      } else {
        chosenHero = fiveStars[Math.floor(Math.random() * fiveStars.length)];
      }

      const isNew = !chosenHero.isUnlocked;
      if (isNew) {
        onUnlockCharacter(chosenHero.id);
      } else {
        // Duplicate compensation: +25,000 Coins
        onAddCoins(25000);
      }

      result = {
        id: chosenHero.id,
        name: chosenHero.name,
        emoji: chosenHero.emoji,
        rarity: 5,
        type: 'character',
        path: chosenHero.path,
        element: chosenHero.element,
        title: chosenHero.title,
        isNew,
      };
    } else if (roll < fiveStarProb + fourStarProb) {
      // 4-STAR PULL!
      finalPity4 = 0;

      const chosenHero = fourStars[Math.floor(Math.random() * fourStars.length)];
      const isNew = !chosenHero.isUnlocked;
      if (isNew) {
        onUnlockCharacter(chosenHero.id);
      } else {
        onAddCoins(10000);
      }

      result = {
        id: chosenHero.id,
        name: chosenHero.name,
        emoji: chosenHero.emoji,
        rarity: 4,
        type: 'character',
        path: chosenHero.path,
        element: chosenHero.element,
        title: chosenHero.title,
        isNew,
      };
    } else {
      // 3-STAR CONSOLATION LIGHT CONE
      const lc = THREE_STAR_LIGHT_CONES[Math.floor(Math.random() * THREE_STAR_LIGHT_CONES.length)];
      onAddCoins(2000);
      result = {
        id: `lc_${Math.random()}`,
        name: lc.name,
        emoji: lc.emoji,
        rarity: 3,
        type: 'lightcone',
        path: lc.path as PathType,
        title: '3★ Light Cone (+2,000 Credits)',
        isNew: false,
      };
    }

    return { result, newPity5: finalPity5, newPity4: finalPity4 };
  };

  const handleWarp = (count: 1 | 10) => {
    let cost = count === 1 ? 160 : 1600;
    if (activeBanner === 'departure' && count === 10) {
      cost = 1280; // 20% discount on 10-pull
    }

    if (crystals < cost) {
      alert(`Not enough Stellar Jade (Crystals)! Requires ${cost} 💎.`);
      return;
    }

    onAddCrystals(-cost);
    sounds.playUltimate('Light');

    let currentPity5 = pity5;
    let currentPity4 = pity4;
    const batchResults: WarpPullResult[] = [];
    let highestRarity: 3 | 4 | 5 = 3;

    for (let i = 0; i < count; i++) {
      const { result, newPity5, newPity4 } = rollOne(activeBanner, currentPity5, currentPity4);
      currentPity5 = newPity5;
      currentPity4 = newPity4;
      batchResults.push(result);
      if (result.rarity > highestRarity) {
        highestRarity = result.rarity;
      }
    }

    setPity5(currentPity5);
    setPity4(currentPity4);
    if (activeBanner === 'departure') {
      setDeparturePulls((prev) => Math.min(50, prev + count));
    }

    // Add to warp history
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWarpHistory((prev) => [
      ...batchResults.map((r) => ({
        name: r.name,
        rarity: r.rarity,
        time: nowStr,
        banner: activeBanner,
      })),
      ...prev.slice(0, 40),
    ]);

    setWarpRarityHighest(highestRarity);
    setIsWarping(true);

    // If 5-star pulled, trigger huge confetti
    if (highestRarity === 5) {
      setTimeout(() => {
        sounds.playVictory();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'],
        });
      }, 1800);
    } else if (highestRarity === 4) {
      setTimeout(() => {
        sounds.playBreak();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#c084fc', '#a855f7', '#7e22ce', '#ffffff'],
        });
      }, 1800);
    }

    // Timer to display results
    setTimeout(() => {
      setIsWarping(false);
      const top5Star = batchResults.find((r) => r.rarity === 5);
      if (top5Star) {
        setSpotlightHero(top5Star);
      }
      setWarpResults(batchResults);
    }, 2200);
  };

  const handleClaimDailyPack = () => {
    sounds.playVictory();
    setHasClaimedDaily(true);
    onAddCrystals(160);
    onAddCoins(30000);
    onAddEnergy(60);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg animate-fadeIn select-none">
      <div className="relative w-full max-w-6xl h-[92vh] rounded-3xl bg-[#0b0c1c] border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* ========================================================= */}
        {/* TOP STATUS BAR: Crystals, Credits, Energy, Details, Close */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-950/80 border-b border-indigo-950/80 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Astral Express Warp
            </span>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
              <span>Stellar Jade & Passes</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Badges */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 text-xs font-bold text-amber-300">
              <span>💎</span>
              <span>{crystals.toLocaleString()}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 text-xs font-bold text-slate-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{coins.toLocaleString()}</span>
            </div>

            {/* Details & Probabilities Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsDetailsOpen(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1 transition"
              title="View Probabilities & Drop Rates"
            >
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Details</span>
            </button>

            {/* History Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsHistoryOpen(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition"
              title="Warp History"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Records</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY: Left Banner Navigation + Center Banner Display */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT COLUMN: BANNER TABS (Honkai Star Rail Style) */}
          <div className="w-full md:w-64 bg-slate-950/70 border-r border-indigo-950/80 p-2 sm:p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0">
            {/* Banner 1: Ember Event Warp */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveBanner('event_ember');
              }}
              className={`p-2.5 rounded-2xl text-left transition flex items-center gap-3 shrink-0 md:shrink border ${
                activeBanner === 'event_ember'
                  ? 'bg-gradient-to-r from-orange-950/80 to-amber-950/60 border-orange-500/70 shadow-lg shadow-orange-950/50 scale-102 ring-1 ring-orange-400'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-2xl shrink-0">
                🦊
              </div>
              <div className="truncate">
                <div className="text-[10px] uppercase font-black text-orange-400 flex items-center gap-1">
                  <span>5★ EVENT</span>
                  <span className="text-[9px]">🔥</span>
                </div>
                <div className="text-xs font-bold text-white truncate">Flames of Sovereign</div>
                <div className="text-[10px] text-slate-400">Rate UP: Ember</div>
              </div>
            </button>

            {/* Banner 2: Voltrix Event Warp */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveBanner('event_voltrix');
              }}
              className={`p-2.5 rounded-2xl text-left transition flex items-center gap-3 shrink-0 md:shrink border ${
                activeBanner === 'event_voltrix'
                  ? 'bg-gradient-to-r from-yellow-950/80 to-indigo-950/60 border-yellow-500/70 shadow-lg shadow-yellow-950/50 scale-102 ring-1 ring-yellow-400'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-yellow-600/30 border border-yellow-500/40 flex items-center justify-center text-2xl shrink-0">
                ⚡
              </div>
              <div className="truncate">
                <div className="text-[10px] uppercase font-black text-yellow-400 flex items-center gap-1">
                  <span>5★ EVENT</span>
                  <span className="text-[9px]">⚡</span>
                </div>
                <div className="text-xs font-bold text-white truncate">Thunder Archon</div>
                <div className="text-[10px] text-slate-400">Rate UP: Voltrix</div>
              </div>
            </button>

            {/* Banner 3: Departure Warp (20% OFF Starter) */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveBanner('departure');
              }}
              className={`p-2.5 rounded-2xl text-left transition flex items-center gap-3 shrink-0 md:shrink border ${
                activeBanner === 'departure'
                  ? 'bg-gradient-to-r from-emerald-950/80 to-teal-950/60 border-emerald-500/70 shadow-lg shadow-emerald-950/50 scale-102 ring-1 ring-emerald-400'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-2xl shrink-0">
                🚀
              </div>
              <div className="truncate">
                <div className="text-[10px] uppercase font-black text-emerald-400 flex items-center gap-1">
                  <span>20% OFF</span>
                  <span className="text-[8px] bg-emerald-500/20 px-1 rounded">50 PULLS</span>
                </div>
                <div className="text-xs font-bold text-white truncate">Departure Warp</div>
                <div className="text-[10px] text-slate-400">Guaranteed 5★ Hero</div>
              </div>
            </button>

            {/* Banner 4: Regular Stellar Warp */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveBanner('stellar');
              }}
              className={`p-2.5 rounded-2xl text-left transition flex items-center gap-3 shrink-0 md:shrink border ${
                activeBanner === 'stellar'
                  ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/60 border-indigo-500/70 shadow-lg shadow-indigo-950/50 scale-102 ring-1 ring-indigo-400'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-2xl shrink-0">
                🌌
              </div>
              <div className="truncate">
                <div className="text-[10px] uppercase font-black text-indigo-400">STANDARD</div>
                <div className="text-xs font-bold text-white truncate">Stellar Warp</div>
                <div className="text-[10px] text-slate-400">Permanent Hero Pool</div>
              </div>
            </button>

            {/* Banner 5: Supplies & Credit Exchange */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveBanner('supplies');
              }}
              className={`p-2.5 rounded-2xl text-left transition flex items-center gap-3 shrink-0 md:shrink border mt-auto ${
                activeBanner === 'supplies'
                  ? 'bg-gradient-to-r from-amber-950/80 to-orange-950/60 border-amber-500/70 shadow-lg shadow-amber-950/50 scale-102 ring-1 ring-amber-400'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
                🛒
              </div>
              <div className="truncate">
                <div className="text-[10px] uppercase font-black text-amber-400">STORE</div>
                <div className="text-xs font-bold text-white truncate">Astral Supplies</div>
                <div className="text-[10px] text-slate-400">Daily Rewards & Packs</div>
              </div>
            </button>
          </div>

          {/* ========================================================= */}
          {/* CENTER: BANNER ART & WARP CONTROLS */}
          {/* ========================================================= */}
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto relative">
            {/* 1. EMBER EVENT BANNER */}
            {activeBanner === 'event_ember' && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                {/* Banner Hero Showcase */}
                <div className="relative rounded-3xl bg-gradient-to-tr from-red-950 via-slate-900 to-amber-950 border-2 border-orange-500/50 p-6 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[300px]">
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/30 border border-orange-500/50 text-orange-300 text-[10px] font-black uppercase tracking-wider">
                          CHARACTER EVENT WARP
                        </span>
                        <span className="flex text-amber-400 text-xs">⭐⭐⭐⭐⭐</span>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                        Flames of the Sovereign
                      </h2>
                      <p className="text-xs sm:text-sm text-orange-200 font-semibold max-w-lg">
                        Featured 5★ <strong>Ember</strong> (Fire • Destruction) — Vanguard of the Solar Inferno!
                      </p>
                    </div>

                    {/* Featured 5-Star Character Visual */}
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 p-1 shadow-2xl shadow-orange-500/40">
                        <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-5xl sm:text-6xl">
                          🦊
                        </div>
                      </div>
                      <div className="mt-1 text-xs font-black text-amber-300">EMBER (5★)</div>
                    </div>
                  </div>

                  {/* Rate-Up 4-Star Heroes preview */}
                  <div className="relative z-10 pt-4 border-t border-orange-950/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-300">Rate-Up 4★ Companions:</span>
                      <div className="flex items-center gap-1.5">
                        {[
                          { emoji: '⚔️', name: 'Kai', star: '⭐⭐⭐⭐' },
                          { emoji: '🌸', name: 'Flora', star: '⭐⭐⭐⭐' },
                          { emoji: '🗿', name: 'Stone', star: '⭐⭐⭐⭐' },
                        ].map((h, i) => (
                          <div
                            key={i}
                            className="px-2 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center gap-1 text-xs text-purple-200 font-bold"
                          >
                            <span>{h.emoji}</span>
                            <span>{h.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pity Counter Display */}
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-300">
                        5★ Pity: <strong>{pity5}/90</strong> (Guaranteed at 90)
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-purple-500/40 text-purple-300">
                        4★ Pity: <strong>{pity4}/10</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Warp Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    disabled={crystals < 160}
                    onClick={() => handleWarp(1)}
                    className={`px-6 py-3.5 rounded-2xl font-black text-xs transition transform active:scale-95 shadow-xl flex flex-col items-center gap-0.5 ${
                      crystals >= 160
                        ? 'bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-800 hover:from-indigo-900 hover:to-indigo-700 border border-indigo-400 text-white shadow-indigo-600/30 cursor-pointer'
                        : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>1x Warp</span>
                    <span className="text-[10px] text-cyan-300 font-mono">160 💎</span>
                  </button>

                  <button
                    disabled={crystals < 1600}
                    onClick={() => handleWarp(10)}
                    className={`px-8 py-3.5 rounded-2xl font-black text-xs transition transform active:scale-95 shadow-2xl flex flex-col items-center gap-0.5 ${
                      crystals >= 1600
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/40 cursor-pointer ring-2 ring-yellow-200'
                        : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      10x Warp
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-slate-900">
                      1,600 💎 (Guaranteed 4★+)
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. VOLTRIX EVENT BANNER */}
            {activeBanner === 'event_voltrix' && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="relative rounded-3xl bg-gradient-to-tr from-yellow-950 via-slate-900 to-purple-950 border-2 border-yellow-500/50 p-6 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[300px]">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 text-[10px] font-black uppercase tracking-wider">
                          CHARACTER EVENT WARP
                        </span>
                        <span className="flex text-amber-400 text-xs">⭐⭐⭐⭐⭐</span>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                        Thunder Archon's Descent
                      </h2>
                      <p className="text-xs sm:text-sm text-yellow-200 font-semibold max-w-lg">
                        Featured 5★ <strong>Voltrix</strong> (Lightning • Erudition) — Archon of High-Voltage Cataclysm!
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-purple-600 p-1 shadow-2xl shadow-yellow-500/40">
                        <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-5xl sm:text-6xl">
                          ⚡
                        </div>
                      </div>
                      <div className="mt-1 text-xs font-black text-amber-300">VOLTRIX (5★)</div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-yellow-950/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-300">Rate-Up 4★ Companions:</span>
                      <div className="flex items-center gap-1.5">
                        {[
                          { emoji: '⚡', name: 'Spark', star: '⭐⭐⭐⭐' },
                          { emoji: '🍃', name: 'Gale', star: '⭐⭐⭐⭐' },
                          { emoji: '🔥', name: 'Blaze', star: '⭐⭐⭐⭐' },
                        ].map((h, i) => (
                          <div
                            key={i}
                            className="px-2 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center gap-1 text-xs text-purple-200 font-bold"
                          >
                            <span>{h.emoji}</span>
                            <span>{h.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-300">
                        5★ Pity: <strong>{pity5}/90</strong> (Guaranteed at 90)
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-purple-500/40 text-purple-300">
                        4★ Pity: <strong>{pity4}/10</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    disabled={crystals < 160}
                    onClick={() => handleWarp(1)}
                    className="px-6 py-3.5 rounded-2xl font-black text-xs bg-slate-900 hover:bg-slate-800 border border-indigo-400 text-white transition flex flex-col items-center gap-0.5"
                  >
                    <span>1x Warp</span>
                    <span className="text-[10px] text-cyan-300 font-mono">160 💎</span>
                  </button>

                  <button
                    disabled={crystals < 1600}
                    onClick={() => handleWarp(10)}
                    className="px-8 py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 transition flex flex-col items-center gap-0.5 shadow-xl ring-2 ring-yellow-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      10x Warp
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-slate-900">
                      1,600 💎 (Guaranteed 4★+)
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. DEPARTURE WARP (20% OFF) */}
            {activeBanner === 'departure' && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="relative rounded-3xl bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/50 p-6 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[300px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                        STARTER VOYAGE • 20% DISCOUNT
                      </span>
                      <span className="flex text-amber-400 text-xs">⭐⭐⭐⭐⭐</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      Departure Warp
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-200 font-semibold max-w-lg">
                      Guaranteed at least one <strong>5-Star Character</strong> within 50 Warps! 20% off for sets of 10 Warps (8 Passes = 1,280 Crystals instead of 1,600)!
                    </p>
                    <div className="pt-2 text-xs font-mono font-bold text-slate-300">
                      Progress: <span className="text-emerald-400">{departurePulls} / 50</span> Warps Completed
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-emerald-950/80">
                    <span className="text-xs text-slate-300 font-semibold">Available 5★ Pool:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {fiveStars.map((f) => (
                        <span
                          key={f.id}
                          className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-[10px] text-amber-300 font-bold flex items-center gap-1"
                        >
                          <span>{f.emoji}</span>
                          <span>{f.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    disabled={crystals < 1280 || departurePulls >= 50}
                    onClick={() => handleWarp(10)}
                    className={`px-8 py-3.5 rounded-2xl font-black text-xs transition transform active:scale-95 shadow-2xl flex flex-col items-center gap-0.5 ${
                      crystals >= 1280 && departurePulls < 50
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 ring-2 ring-emerald-200 cursor-pointer shadow-emerald-500/40'
                        : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      10x Warp (20% OFF!)
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-slate-900">
                      1,280 💎 (Guaranteed 5★ within 50!)
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. STELLAR WARP (Permanent standard) */}
            {activeBanner === 'stellar' && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="relative rounded-3xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950 border-2 border-indigo-500/50 p-6 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[300px]">
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                      PERMANENT STELLAR WARP
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      Cosmic Odyssey
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-200 font-semibold max-w-lg">
                      Summon from the permanent pool of Astral Express characters across all 9 Paths and 8 Elements!
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-indigo-950/80">
                    <div className="text-xs text-slate-400">
                      Total Characters in Pool: <strong className="text-white">{characters.length}</strong>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-300">
                        5★ Pity: <strong>{pity5}/90</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-purple-500/40 text-purple-300">
                        4★ Pity: <strong>{pity4}/10</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    disabled={crystals < 160}
                    onClick={() => handleWarp(1)}
                    className="px-6 py-3.5 rounded-2xl font-black text-xs bg-slate-900 hover:bg-slate-800 border border-indigo-400 text-white transition flex flex-col items-center gap-0.5"
                  >
                    <span>1x Warp</span>
                    <span className="text-[10px] text-cyan-300 font-mono">160 💎</span>
                  </button>

                  <button
                    disabled={crystals < 1600}
                    onClick={() => handleWarp(10)}
                    className="px-8 py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 transition flex flex-col items-center gap-0.5 shadow-xl ring-2 ring-yellow-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      10x Warp
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-slate-900">
                      1,600 💎 (Guaranteed 4★+)
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. ASTRAL SUPPLIES & STORE */}
            {activeBanner === 'supplies' && (
              <div className="flex-1 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    Astral Expedition Supplies & Credit Exchange
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Daily Free Supplies */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-500/40 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        DAILY FREE SHIPMENT
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">Trailblazer Care Package</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Claim 160 Stellar Jade (1x Free Warp), 30,000 Credits, and 60 Energy!
                      </p>
                    </div>
                    <button
                      disabled={hasClaimedDaily}
                      onClick={handleClaimDailyPack}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow ${
                        hasClaimedDaily
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      }`}
                    >
                      {hasClaimedDaily ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Claimed Today</span>
                        </>
                      ) : (
                        <span>Claim Daily Supplies (Free)</span>
                      )}
                    </button>
                  </div>

                  {/* Energy Refill Fuel */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/60 to-slate-900 border border-cyan-500/40 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        ENERGY FUEL
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">Trailblaze Fuel Refill</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Instantly restores +60 Energy for stage expeditions.
                      </p>
                    </div>
                    <button
                      disabled={crystals < 50}
                      onClick={() => {
                        sounds.playClick();
                        onAddCrystals(-50);
                        onAddEnergy(60);
                      }}
                      className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition flex items-center justify-center gap-1"
                    >
                      <span>Refill 60 Energy</span>
                      <span className="text-[10px] text-cyan-200 font-mono">(50 💎)</span>
                    </button>
                  </div>

                  {/* Credit Crate */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/60 to-slate-900 border border-amber-500/40 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        CREDIT SHIPMENT
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">Astral Credit Cache</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Receive 100,000 Credits to level up characters and abilities.
                      </p>
                    </div>
                    <button
                      disabled={crystals < 100}
                      onClick={() => {
                        sounds.playClick();
                        onAddCrystals(-100);
                        onAddCoins(100000);
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-600/30 transition flex items-center justify-center gap-1"
                    >
                      <span>100,000 Credits</span>
                      <span className="text-[10px] font-mono">(100 💎)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* WARP CINEMATIC OVERLAY (Hyperspace Express Jump) */}
        {/* ========================================================= */}
        {isWarping && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 select-none animate-fadeIn">
            <button
              onClick={() => {
                setIsWarping(false);
                setWarpResults(
                  warpResults || [
                    {
                      id: 'skip_demo',
                      name: 'Warp Complete',
                      emoji: '✨',
                      rarity: warpRarityHighest,
                      type: 'character',
                    },
                  ]
                );
              }}
              className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition z-50"
            >
              Skip &gt;&gt;
            </button>

            {/* Hyperspace beam */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-72 h-72 sm:w-96 sm:h-96 rounded-full border-4 animate-ping duration-1000 pointer-events-none ${
                  warpRarityHighest === 5
                    ? 'border-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.9)]'
                    : warpRarityHighest === 4
                    ? 'border-purple-400 shadow-[0_0_80px_rgba(192,132,252,0.9)]'
                    : 'border-blue-400 shadow-[0_0_50px_rgba(96,165,250,0.7)]'
                }`}
              />

              <div className="text-8xl sm:text-9xl animate-bounce my-4 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]">
                🚂
              </div>

              <div
                className={`text-2xl sm:text-3xl font-black uppercase tracking-widest ${
                  warpRarityHighest === 5
                    ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]'
                    : warpRarityHighest === 4
                    ? 'text-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.9)]'
                    : 'text-cyan-400'
                }`}
              >
                {warpRarityHighest === 5 ? '🌟 5-STAR MANIFESTATION! 🌟' : warpRarityHighest === 4 ? '✨ 4-STAR MANIFESTATION! ✨' : 'HYPERSPACE JUMP'}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-2 animate-pulse">
                Astral Express breaking dimensional barrier...
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5-STAR SPLASH CARD SPOTLIGHT MODAL */}
        {/* ========================================================= */}
        {spotlightHero && !isWarping && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 select-none animate-scaleUp">
            <div className="relative max-w-md w-full rounded-3xl bg-gradient-to-b from-amber-950 via-slate-900 to-indigo-950 border-2 border-amber-400 p-6 shadow-2xl text-center space-y-4">
              <div className="flex items-center justify-center gap-1 text-amber-400 text-lg">
                ⭐⭐⭐⭐⭐
              </div>

              <div className="text-7xl sm:text-8xl my-2 filter drop-shadow-[0_0_25px_rgba(251,191,36,0.8)] animate-bounce">
                {spotlightHero.emoji}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {spotlightHero.isNew ? '🎉 NEW HERO UNLOCKED!' : '⭐ DUPLICATE CONVERTED (+25,000 Credits)'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {spotlightHero.name}
                </h3>
                <p className="text-xs text-amber-300 font-semibold">{spotlightHero.title}</p>
                <div className="text-xs text-slate-400">
                  Path of {spotlightHero.path} • {spotlightHero.element} Element
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setSpotlightHero(null);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg transition transform active:scale-95"
              >
                Proceed to Results
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* RESULTS GRID MODAL (10-Pull Summary) */}
        {/* ========================================================= */}
        {warpResults && !isWarping && !spotlightHero && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none animate-fadeIn">
            <div className="relative w-full max-w-4xl rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/50 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Warp Results
                </h3>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setWarpResults(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
                >
                  Confirm & Close
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {warpResults.map((r, i) => (
                  <div
                    key={i}
                    className={`relative p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition ${
                      r.rarity === 5
                        ? 'bg-gradient-to-b from-amber-950/70 to-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20'
                        : r.rarity === 4
                        ? 'bg-gradient-to-b from-purple-950/70 to-slate-900 border-purple-500 ring-1 ring-purple-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {/* Badge */}
                    <div className="w-full flex justify-between items-center text-[9px] font-black">
                      <span
                        className={
                          r.rarity === 5
                            ? 'text-amber-400'
                            : r.rarity === 4
                            ? 'text-purple-400'
                            : 'text-slate-500'
                        }
                      >
                        {r.rarity === 5 ? '5★' : r.rarity === 4 ? '4★' : '3★'}
                      </span>
                      {r.isNew && (
                        <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[8px] animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>

                    <div className="text-4xl my-2">{r.emoji}</div>

                    <div className="w-full">
                      <div className="text-xs font-bold text-white truncate">{r.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {r.type === 'character' ? `${r.element} • ${r.path}` : r.path}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons in Result Modal */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  disabled={crystals < (activeBanner === 'departure' ? 1280 : 1600)}
                  onClick={() => {
                    setWarpResults(null);
                    handleWarp(10);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs transition shadow-md"
                >
                  Warp Again (10x)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DETAILS & PROBABILITIES MODAL (HSR Exact Rules) */}
        {/* ========================================================= */}
        {isDetailsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
            <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/40 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  Warp Details & Drop Probabilities
                </h3>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsDetailsOpen(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40">
                  <div className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                    <span>🌟 5-Star Character Probabilities</span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-slate-300">
                    <li>• <strong>Base Drop Rate:</strong> 0.600%</li>
                    <li>• <strong>Consolidated Rate (including Pity):</strong> 1.600%</li>
                    <li>• <strong>Guaranteed 5★:</strong> Within at most <strong>90 Warps</strong> (Hard Pity).</li>
                    <li>• <strong>Soft Pity:</strong> Begins at pull 74, increasing drop chance by +6% per pull!</li>
                    <li>• <strong>50/50 Rate-Up:</strong> In Event Warps, 50% chance to be the featured hero!</li>
                  </ul>
                </div>

                <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40">
                  <div className="font-bold text-purple-300 text-sm flex items-center gap-1.5">
                    <span>✨ 4-Star Character Probabilities</span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-slate-300">
                    <li>• <strong>Base Drop Rate:</strong> 5.100%</li>
                    <li>• <strong>Consolidated Rate (including Pity):</strong> 13.000%</li>
                    <li>• <strong>Guaranteed 4★:</strong> Every <strong>10 Warps</strong> guarantees at least one 4-Star character or above!</li>
                  </ul>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-300 text-sm">
                    3-Star Light Cones & Astral Shards
                  </div>
                  <p className="mt-1 text-slate-400">
                    Base Drop Rate: 94.300%. Each 3★ item granted provides +2,000 Credits automatically!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* WARP RECORDS / HISTORY MODAL */}
        {/* ========================================================= */}
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
            <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/40 p-5 shadow-2xl space-y-3 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Warp Records
                </h3>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsHistoryOpen(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 text-xs">
                {warpHistory.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">No Warp records found yet.</div>
                ) : (
                  warpHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black ${
                            item.rarity === 5
                              ? 'text-amber-400'
                              : item.rarity === 4
                              ? 'text-purple-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.rarity === 5 ? '5★' : item.rarity === 4 ? '4★' : '3★'}
                        </span>
                        <span className="font-semibold text-white">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
