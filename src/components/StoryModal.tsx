/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Star, ChevronRight, Check } from 'lucide-react';
import { StageInfo } from '../types/game';
import { STORY_STAGES } from '../data/stages';
import { sounds } from '../utils/audio';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStage: (stage: StageInfo) => void;
  clearedStageIds: string[];
}

const CHAPTERS = [
  { id: 1, title: 'Chapter 1: Whispering Woods', icon: '🌲', desc: 'Awakening beneath the forest canopy.' },
  { id: 2, title: 'Chapter 2: Sunken Ruins', icon: '🌊', desc: 'Submerged halls of the ancient Queen.' },
  { id: 3, title: 'Chapter 3: Clockwork Citadel', icon: '⚙️', desc: 'Mechanical gears of the timekeeper.' },
  { id: 4, title: 'Chapter 4: Dragon’s Spire', icon: '🐉', desc: 'The volcanic throne of Ignidra.' },
];

export const StoryModal: React.FC<StoryModalProps> = ({
  isOpen,
  onClose,
  onStartStage,
  clearedStageIds,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number>(1);

  if (!isOpen) return null;

  const currentStages = STORY_STAGES.filter((s) => s.chapter === selectedChapter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-5xl h-[90vh] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Story Campaign Expeditions
              </h2>
              <p className="text-xs text-slate-400">Progress through chapters and claim clear rewards</p>
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

        {/* Chapter Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2 text-xs overflow-x-auto">
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                sounds.playClick();
                setSelectedChapter(ch.id);
              }}
              className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                selectedChapter === ch.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <span className="text-base">{ch.icon}</span>
              <span className="truncate">{ch.title}</span>
            </button>
          ))}
        </div>

        {/* Chapter Stages List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {currentStages.map((stage) => {
            const isCleared = clearedStageIds.includes(stage.id);
            return (
              <div
                key={stage.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-200 transition">
                      {stage.name}
                    </span>
                    {isCleared && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Cleared
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      Rec. Lv.{stage.recommendedLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{stage.description}</p>

                  {/* Enemy lineup preview */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-500">Enemies:</span>
                    {stage.enemies.map((enemy, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-xs text-slate-200 flex items-center gap-1"
                        title={`${enemy.name} (${enemy.element})`}
                      >
                        <span>{enemy.emoji}</span>
                        <span className="text-[10px] text-slate-400">{enemy.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right text-xs">
                    <div className="text-[10px] text-slate-400 uppercase">First Clear</div>
                    <div className="text-cyan-400 font-bold font-mono">
                      +{stage.firstClearReward.crystals} 💎
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onStartStage(stage);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-1"
                  >
                    <span>Deploy</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
