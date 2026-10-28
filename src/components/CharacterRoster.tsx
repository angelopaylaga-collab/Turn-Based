/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ArrowUpCircle, Shield, Zap, Sparkles, Check, Heart, Sword, FastForward } from 'lucide-react';
import { Character, PathType, ElementType } from '../types/game';
import { sounds } from '../utils/audio';

interface CharacterRosterProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  activePartyIds: string[];
  onUpdateParty: (newPartyIds: string[]) => void;
  coins: number;
  onLevelUpCharacter: (id: string) => void;
}

const ALL_PATHS: PathType[] = [
  'Destruction',
  'Hunt',
  'Erudition',
  'Preservation',
  'Abundance',
  'Harmony',
  'Nihility',
  'Remembrance',
  'Elation',
];

const ALL_ELEMENTS: ElementType[] = [
  'Fire',
  'Ice',
  'Lightning',
  'Wind',
  'Earth',
  'Water',
  'Light',
  'Shadow',
];

const ELEMENT_COLORS: Record<ElementType, string> = {
  Fire: 'from-orange-500/20 to-red-500/20 border-orange-500/40 text-orange-400',
  Ice: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400',
  Lightning: 'from-yellow-500/20 to-purple-500/20 border-yellow-500/40 text-yellow-400',
  Wind: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
  Earth: 'from-amber-600/20 to-stone-500/20 border-amber-600/40 text-amber-400',
  Water: 'from-blue-600/20 to-indigo-500/20 border-blue-500/40 text-blue-400',
  Light: 'from-yellow-400/20 to-amber-300/20 border-yellow-400/40 text-yellow-300',
  Shadow: 'from-purple-600/20 to-slate-700/20 border-purple-500/40 text-purple-400',
};

export const CharacterRoster: React.FC<CharacterRosterProps> = ({
  isOpen,
  onClose,
  characters,
  activePartyIds,
  onUpdateParty,
  coins,
  onLevelUpCharacter,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(activePartyIds[0] || characters[0].id);
  const [filterRarity, setFilterRarity] = useState<4 | 5 | 'All'>('All');
  const [filterPath, setFilterPath] = useState<PathType | 'All'>('All');
  const [filterElement, setFilterElement] = useState<ElementType | 'All'>('All');

  if (!isOpen) return null;

  const selectedChar = characters.find((c) => c.id === selectedCharId) || characters[0];
  const isInParty = activePartyIds.includes(selectedChar.id);

  const filteredCharacters = characters.filter((c) => {
    if (filterRarity !== 'All' && c.rarity !== filterRarity) return false;
    if (filterPath !== 'All' && c.path !== filterPath) return false;
    if (filterElement !== 'All' && c.element !== filterElement) return false;
    return true;
  });

  const handleToggleParty = (charId: string) => {
    sounds.playClick();
    if (activePartyIds.includes(charId)) {
      if (activePartyIds.length === 1) {
        return; // At least 1 character must be in party
      }
      onUpdateParty(activePartyIds.filter((id) => id !== charId));
    } else {
      if (activePartyIds.length < 4) {
        onUpdateParty([...activePartyIds, charId]);
      } else {
        // Replace last member
        const updated = [...activePartyIds.slice(0, 3), charId];
        onUpdateParty(updated);
      }
    }
  };

  const levelUpCost = selectedChar.level * 500;
  const canAffordLevelUp = coins >= levelUpCost && selectedChar.isUnlocked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-6xl h-[92vh] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">
              👥
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Characters & Lineup Formation
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  {characters.filter((c) => c.isUnlocked).length}/{characters.length} Unlocked
                </span>
              </h2>
              <p className="text-xs text-slate-400">Select up to 4 heroes for your active team</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Party Slot preview */}
            <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
              {[0, 1, 2, 3].map((slotIdx) => {
                const charInSlot = characters.find((c) => c.id === activePartyIds[slotIdx]);
                return (
                  <div
                    key={slotIdx}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${
                      charInSlot
                        ? 'bg-indigo-950 border-indigo-500/50 text-white'
                        : 'bg-slate-900/50 border-dashed border-slate-700 text-slate-600'
                    }`}
                  >
                    {charInSlot ? charInSlot.emoji : slotIdx + 1}
                  </div>
                );
              })}
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
        </div>

        {/* Filter bar (Rarity + Path) */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center gap-2 text-xs">
          {/* Rarity Filter */}
          <span className="text-slate-400 font-medium">Rarity:</span>
          {(['All', 5, 4] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                sounds.playClick();
                setFilterRarity(r);
              }}
              className={`px-2.5 py-1 rounded-lg transition font-bold ${
                filterRarity === r
                  ? r === 5
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950'
                    : r === 4
                    ? 'bg-purple-600 text-white'
                    : 'bg-indigo-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {r === 'All' ? 'All' : `${r}★`}
            </button>
          ))}

          <span className="text-slate-600">|</span>

          {/* Path Filter */}
          <span className="text-slate-400 font-medium">Path:</span>
          <button
            onClick={() => {
              sounds.playClick();
              setFilterPath('All');
            }}
            className={`px-2 py-1 rounded-lg transition ${
              filterPath === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {ALL_PATHS.map((path) => (
            <button
              key={path}
              onClick={() => {
                sounds.playClick();
                setFilterPath(path);
              }}
              className={`px-2 py-1 rounded-lg transition ${
                filterPath === path ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {path}
            </button>
          ))}
        </div>

        {/* Main Body: Roster Grid (Left) + Detailed Character Inspector (Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Character Grid */}
          <div className="lg:w-7/12 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredCharacters.map((char) => {
                const isSelected = char.id === selectedCharId;
                const isMember = activePartyIds.includes(char.id);
                const isFiveStar = char.rarity === 5;

                return (
                  <div
                    key={char.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedCharId(char.id);
                    }}
                    className={`relative p-3 rounded-2xl border cursor-pointer transition transform active:scale-95 flex flex-col items-center justify-between text-center gap-1 group ${
                      isSelected
                        ? 'bg-indigo-900/50 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-950'
                        : char.isUnlocked
                        ? isFiveStar
                          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                          : 'bg-purple-950/20 border-purple-500/40 hover:border-purple-400'
                        : 'bg-slate-900/40 border-slate-800/60 opacity-50 grayscale'
                    }`}
                  >
                    {/* Party Indicator */}
                    {isMember && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[8px] font-bold text-slate-950 shadow">
                        IN TEAM
                      </span>
                    )}

                    {/* Rarity & Level */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      <span
                        className={`text-[8px] font-black px-1 rounded ${
                          isFiveStar
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        {char.rarity}★
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        Lv.{char.level}
                      </span>
                    </div>

                    <div className="text-3xl my-2 group-hover:scale-110 transition duration-200">
                      {char.emoji}
                    </div>

                    <div className="w-full">
                      <div className="text-xs font-bold text-white truncate">{char.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {char.element} • {char.path}
                      </div>
                    </div>

                    {!char.isUnlocked && (
                      <div className="text-[9px] font-semibold text-amber-400/80 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/40">
                        Locked
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Character Inspector / Detail Panel */}
          <div className="lg:w-5/12 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/40">
            {/* Hero Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border bg-gradient-to-br shadow-xl ${
                    ELEMENT_COLORS[selectedChar.element]
                  }`}
                >
                  {selectedChar.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-white">{selectedChar.name}</h3>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        selectedChar.rarity === 5
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      }`}
                    >
                      {selectedChar.rarity}★
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-500/30 text-indigo-300">
                      Lv.{selectedChar.level}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300">{selectedChar.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="text-amber-400">
                      {selectedChar.rarity === 5 ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐⭐'}
                    </span>
                    <span>•</span>
                    <span>Path: {selectedChar.path}</span>
                    <span>•</span>
                    <span>Element: {selectedChar.element}</span>
                  </div>
                </div>
              </div>

              {/* Add / Remove from Team */}
              {selectedChar.isUnlocked && (
                <button
                  onClick={() => handleToggleParty(selectedChar.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5 ${
                    isInParty
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  {isInParty ? 'Remove' : 'Deploy to Team'}
                </button>
              )}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 text-emerald-400" /> HP
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono mt-0.5">
                  {selectedChar.maxHp}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Sword className="w-3 h-3 text-red-400" /> ATK
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono mt-0.5">
                  {selectedChar.atk}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-blue-400" /> DEF
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono mt-0.5">
                  {selectedChar.def}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <FastForward className="w-3 h-3 text-amber-400" /> SPD
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono mt-0.5">
                  {selectedChar.spd}
                </div>
              </div>
            </div>

            {/* Level Up Button */}
            {selectedChar.isUnlocked && (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Upgrade Character</div>
                  <div className="text-[11px] text-slate-400">Cost: {levelUpCost.toLocaleString()} Coins 🪙</div>
                </div>
                <button
                  disabled={!canAffordLevelUp}
                  onClick={() => {
                    sounds.playHeal();
                    onLevelUpCharacter(selectedChar.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    canAffordLevelUp
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Level Up
                </button>
              </div>
            )}

            {/* Skill Kit Details */}
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Combat Kit
              </div>

              {/* Basic ATK */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <span>Basic: {selectedChar.basicAtk.name}</span>
                  <span className="text-amber-400 font-mono text-[11px]">+20 ⚡ Energy</span>
                </div>
                <p className="text-slate-400 text-[11px]">{selectedChar.basicAtk.description}</p>
              </div>

              {/* Skill */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-indigo-300 font-bold">
                  <span>Skill: {selectedChar.skill.name}</span>
                  <span className="text-amber-400 font-mono text-[11px]">+30 ⚡ Energy</span>
                </div>
                <p className="text-slate-400 text-[11px]">{selectedChar.skill.description}</p>
              </div>

              {/* Ultimate */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 space-y-1">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Ultimate: {selectedChar.ultimate.name}
                  </span>
                  <span className="text-amber-400 font-mono text-[11px]">
                    Cost: {selectedChar.ultimate.energyCost} ⚡
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{selectedChar.ultimate.description}</p>
              </div>

              {/* Passive & Technique */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-slate-300 font-semibold text-[11px]">
                  Passive: {selectedChar.passiveName}
                </div>
                <p className="text-slate-400 text-[11px]">{selectedChar.passiveDesc}</p>
                <div className="text-slate-300 font-semibold text-[11px] pt-1">
                  Technique: {selectedChar.techniqueName}
                </div>
                <p className="text-slate-400 text-[11px]">{selectedChar.techniqueDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
