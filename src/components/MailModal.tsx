/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Mail, Gift, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

export interface MailItem {
  id: string;
  sender: string;
  title: string;
  date: string;
  content: string;
  rewards: { crystals?: number; coins?: number; energy?: number };
  isRead: boolean;
  isClaimed: boolean;
}

interface MailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailList: MailItem[];
  onClaimMail: (id: string) => void;
  onClaimAll: () => void;
}

export const MailModal: React.FC<MailModalProps> = ({
  isOpen,
  onClose,
  mailList,
  onClaimMail,
  onClaimAll,
}) => {
  if (!isOpen) return null;

  const hasUnclaimed = mailList.some((m) => !m.isClaimed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/30 p-5 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Astral Mailbox</h3>
          </div>
          <div className="flex items-center gap-2">
            {hasUnclaimed && (
              <button
                onClick={() => {
                  sounds.playVictory();
                  onClaimAll();
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Claim All
              </button>
            )}
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
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {mailList.map((mail) => (
            <div
              key={mail.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-bold text-sm">{mail.title}</div>
                  <div className="text-[10px] text-slate-400">
                    From: {mail.sender} • {mail.date}
                  </div>
                </div>
                {mail.isClaimed ? (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Claimed
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      sounds.playVictory();
                      onClaimMail(mail.id);
                    }}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
                  >
                    Claim
                  </button>
                )}
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">{mail.content}</p>

              {/* Rewards preview */}
              <div className="flex items-center gap-2 pt-1">
                {mail.rewards.crystals && (
                  <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono text-[11px]">
                    +{mail.rewards.crystals} 💎
                  </span>
                )}
                {mail.rewards.coins && (
                  <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-mono text-[11px]">
                    +{mail.rewards.coins.toLocaleString()} 🪙
                  </span>
                )}
                {mail.rewards.energy && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-[11px]">
                    +{mail.rewards.energy} ⚡
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
