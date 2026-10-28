/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Flame, Hourglass, ShieldAlert, Award, Star, ChevronRight, Check } from 'lucide-react';
import { StageInfo, GameModeType } from '../types/game';
import { MOC_STAGES, PURE_ONSLIGHT_STAGES, PURE_ONSLIGHT_BUFFS, PhaseBuffOption, ANOMALY_MODIFIERS, AnomalyBossModifier } from '../data/stages';
import { ENEMY_TEMPLATES } from '../data/enemies';
import { sounds } from '../utils/audio';

interface BattleModesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStage: (stage: StageInfo, phaseBuff?: PhaseBuffOption, anomalyModifiers?: AnomalyBossModifier[]) => void;
  energy: number;
}

export const BattleModesModal: React.FC<BattleModesModalProps> = ({
  isOpen,
  onClose,
  onStartStage,
  energy,
}) => {
  const [activeTab, setActiveTab] = useState<GameModeType>('moc');
  const [selectedPhaseBuff, setSelectedPhaseBuff] = useState<PhaseBuffOption>(PURE_ONSLIGHT_BUFFS[0]);
  const [anomalyMods, setAnomalyMods] = useState<AnomalyBossModifier[]>(ANOMALY_MODIFIERS);
  const [interferenceKeys, setInterferenceKeys] = useState<number>(1);

  if (!isOpen) return null;

  const toggleModifier = (modId: string) => {
    sounds.playClick();
    setAnomalyMods((prev) =>
      prev.map((m) => {
        if (m.id === modId) {
          if (!m.isDisabled && interferenceKeys > 0) {
            setInterferenceKeys((k) => k - 1);
            return { ...m, isDisabled: true };
          } else if (m.isDisabled) {
            setInterferenceKeys((k) => k + 1);
            return { ...m, isDisabled: false };
          }
        }
        return m;
      })
    );
  };

  const handleLaunchAnomaly = () => {
    sounds.playClick();
    const anomalyStage: StageInfo = {
      id: 'anomaly_king',
      name: 'Anomaly Arbitration: King Stage',
      mode: 'anomaly',
      description: 'Face the ultimate King Encounter with customized modifier overrides!',
      recommendedLevel: 45,
      firstClearReward: { crystals: 500, coins: 40000 },
      enemies: [ENEMY_TEMPLATES.ignidra(), ENEMY_TEMPLATES.sentry()],
    };
    onStartStage(anomalyStage, undefined, anomalyMods);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-5xl h-[90vh] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-xl">
              ⚔️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Endgame Battle Modes
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/40 font-semibold">
                  Challenger
                </span>
              </h2>
              <p className="text-xs text-slate-400">MoC, Pure Onslaught, and Anomaly Arbitration</p>
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

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('moc');
            }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'moc'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Hourglass className="w-4 h-4 text-cyan-300" />
            <span>Memory of Chaos</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('pure_onslaught');
            }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'pure_onslaught'
                ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Pure Onslaught</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('anomaly');
            }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'anomaly'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-300" />
            <span>Anomaly Arbitration</span>
          </button>
        </div>

        {/* Mode Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* 1. Memory of Chaos */}
          {activeTab === 'moc' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-cyan-400" />
                    Forgotten Hall: Limited Cycle Clear
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Clear all waves before the Cycle limit runs out. Earn 3 Stars per stage for massive crystal rewards!
                  </p>
                </div>
                <div className="text-xs text-indigo-300 font-semibold px-3 py-1 rounded-lg bg-indigo-900/50 border border-indigo-500/40">
                  Resets in 28 Days
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOC_STAGES.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 transition flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300">Floor {idx + 1}</span>
                        <div className="flex items-center gap-1 text-amber-400 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{stage.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <div className="text-slate-400">
                        Reward: <span className="text-cyan-400 font-bold">+{stage.firstClearReward.crystals} 💎</span>
                      </div>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onStartStage(stage);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-600/30 transition"
                      >
                        <span>Battle</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Pure Onslaught */}
          {activeTab === 'pure_onslaught' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Endless Spawn & Scoring
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Enemies respawn continuously! Rack up score points within 4 cycles to deplete the Boss Gauge.
                  </p>
                </div>
                <div className="text-xs text-amber-300 font-semibold px-3 py-1 rounded-lg bg-amber-900/50 border border-amber-500/40">
                  Target: 30,000 Pts
                </div>
              </div>

              {/* Phase Buff Selection (GDD Mode 2) */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Select Phase Buff (Choose 1)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PURE_ONSLIGHT_BUFFS.map((buff) => {
                    const isSelected = selectedPhaseBuff.id === buff.id;
                    return (
                      <div
                        key={buff.id}
                        onClick={() => {
                          sounds.playClick();
                          setSelectedPhaseBuff(buff);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-900/30 border-amber-400 ring-2 ring-amber-500/30'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{buff.emoji}</span>
                          <span className="text-xs font-bold text-white">{buff.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{buff.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {PURE_ONSLIGHT_STAGES.map((stage) => (
                  <div
                    key={stage.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{stage.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <div className="text-slate-400">
                        Max Score: <span className="text-amber-400 font-bold">40,000 pts</span>
                      </div>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onStartStage(stage, selectedPhaseBuff);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-600/30 transition"
                      >
                        <span>Start Wave</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Anomaly Arbitration */}
          {activeTab === 'anomaly' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    Multi-Team Gauntlet & Boss Interference
                  </h3>
                  <span className="text-xs font-bold text-amber-300">
                    🔑 {interferenceKeys} Keys Available
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Use Interference Keys to deactivate dangerous Boss Modifiers before confronting the King!
                </p>
              </div>

              {/* Boss Modifiers Disable System */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  King Boss Modifiers:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {anomalyMods.map((mod) => (
                    <div
                      key={mod.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 transition ${
                        mod.isDisabled
                          ? 'bg-slate-900/40 border-slate-800 opacity-60 line-through'
                          : 'bg-purple-950/30 border-purple-500/40'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{mod.name}</div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{mod.description}</p>
                      </div>
                      <button
                        onClick={() => toggleModifier(mod.id)}
                        className={`mt-2 py-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                          mod.isDisabled
                            ? 'bg-slate-800 text-slate-400 hover:text-white'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }`}
                      >
                        {mod.isDisabled ? 'Re-enable' : 'Disable with Key 🔑'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">The King Gauntlet Encounter</h4>
                  <p className="text-xs text-slate-400">High-difficulty boss trial with exclusive avatar frame rewards</p>
                </div>
                <button
                  onClick={handleLaunchAnomaly}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
                >
                  <span>Challenge King</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
