/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trophy, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  reward: number; // crystals
  progress: number;
  max: number;
  isClaimed: boolean;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: AchievementItem[];
  onClaimAchievement: (id: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  onClaimAchievement,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/30 p-5 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Achievements & Trophies</h3>
          </div>
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

        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {achievements.map((ach) => {
            const isCompleted = ach.progress >= ach.max;
            return (
              <div
                key={ach.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{ach.title}</span>
                    <span className="text-cyan-400 font-mono text-[11px]">+{ach.reward} 💎</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{ach.description}</p>
                  <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden bg-slate-800 max-w-xs mt-1">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (ach.progress / ach.max) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="shrink-0">
                  {ach.isClaimed ? (
                    <span className="text-slate-500 text-[11px] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Claimed
                    </span>
                  ) : (
                    <button
                      disabled={!isCompleted}
                      onClick={() => {
                        sounds.playVictory();
                        onClaimAchievement(ach.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                        isCompleted
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md animate-bounce'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
