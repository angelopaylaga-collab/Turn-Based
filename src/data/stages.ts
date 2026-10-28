/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StageInfo } from '../types/game';
import { ENEMY_TEMPLATES } from './enemies';

export const STORY_STAGES: StageInfo[] = [
  // Chapter 1: Whispering Woods
  {
    id: 'story_1_1',
    name: '1-1 Whispering Outskirts',
    chapter: 1,
    stageNumber: 1,
    mode: 'story',
    description: 'A skirmish at the edge of the Whispering Woods. Forest wisps roam freely.',
    recommendedLevel: 5,
    firstClearReward: { crystals: 100, coins: 5000 },
    enemies: [ENEMY_TEMPLATES.wisp(), ENEMY_TEMPLATES.bark()],
  },
  {
    id: 'story_1_2',
    name: '1-2 Deep Canopy',
    chapter: 1,
    stageNumber: 2,
    mode: 'story',
    description: 'Predatory owls and shadow beasts lurk under thick foliage.',
    recommendedLevel: 10,
    firstClearReward: { crystals: 120, coins: 6000 },
    enemies: [ENEMY_TEMPLATES.hoot(), ENEMY_TEMPLATES.wisp(), ENEMY_TEMPLATES.spark()],
  },
  {
    id: 'story_1_3',
    name: '1-3 Shadow Wolf Den',
    chapter: 1,
    stageNumber: 3,
    mode: 'story',
    description: 'Face the ferocious Shadowhound terrorizing the woodland pass.',
    recommendedLevel: 15,
    firstClearReward: { crystals: 160, coins: 8000 },
    enemies: [ENEMY_TEMPLATES.shadowhound(), ENEMY_TEMPLATES.wisp()],
  },

  // Chapter 2: Sunken Ruins
  {
    id: 'story_2_1',
    name: '2-1 Flooded Corridors',
    chapter: 2,
    stageNumber: 1,
    mode: 'story',
    description: 'Submerged ancient halls guarded by frostlets and tidecallers.',
    recommendedLevel: 18,
    firstClearReward: { crystals: 180, coins: 10000 },
    enemies: [ENEMY_TEMPLATES.frostlet(), ENEMY_TEMPLATES.tidecaller()],
  },
  {
    id: 'story_2_2',
    name: '2-2 Glacial Chasm',
    chapter: 2,
    stageNumber: 2,
    mode: 'story',
    description: 'The ancient Icewurm guards the path leading deeper into the abyss.',
    recommendedLevel: 22,
    firstClearReward: { crystals: 220, coins: 12000 },
    enemies: [ENEMY_TEMPLATES.icewurm(), ENEMY_TEMPLATES.frostlet()],
  },
  {
    id: 'story_2_3',
    name: '2-3 Throne of the Tides',
    chapter: 2,
    stageNumber: 3,
    mode: 'story',
    description: 'Confront Hydriss, Queen of the Sunken Ruins!',
    recommendedLevel: 25,
    firstClearReward: { crystals: 300, coins: 15000 },
    enemies: [ENEMY_TEMPLATES.hydriss()],
  },

  // Chapter 3: Clockwork Citadel
  {
    id: 'story_3_1',
    name: '3-1 Gearwork Gate',
    chapter: 3,
    stageNumber: 1,
    mode: 'story',
    description: 'Ancient stone constructs defend the citadel perimeters.',
    recommendedLevel: 28,
    firstClearReward: { crystals: 240, coins: 14000 },
    enemies: [ENEMY_TEMPLATES.sentry(), ENEMY_TEMPLATES.stormcaller()],
  },
  {
    id: 'story_3_2',
    name: '3-2 Heart of the Core',
    chapter: 3,
    stageNumber: 2,
    mode: 'story',
    description: 'The giant Ruin Golem powers the temporal mechanisms.',
    recommendedLevel: 30,
    firstClearReward: { crystals: 280, coins: 16000 },
    enemies: [ENEMY_TEMPLATES.golem(), ENEMY_TEMPLATES.bark()],
  },
  {
    id: 'story_3_3',
    name: '3-3 Temporal Spire',
    chapter: 3,
    stageNumber: 3,
    mode: 'story',
    description: 'Challenge Chronos, master of time dilation and reversal.',
    recommendedLevel: 35,
    firstClearReward: { crystals: 400, coins: 20000 },
    enemies: [ENEMY_TEMPLATES.chronos()],
  },

  // Chapter 4: Dragon’s Spire
  {
    id: 'story_4_1',
    name: '4-1 Scorched Ascent',
    chapter: 4,
    stageNumber: 1,
    mode: 'story',
    description: 'Volcanic heat singes the rocks as stormcallers gather.',
    recommendedLevel: 38,
    firstClearReward: { crystals: 300, coins: 18000 },
    enemies: [ENEMY_TEMPLATES.spark(), ENEMY_TEMPLATES.stormcaller(), ENEMY_TEMPLATES.shadowhound()],
  },
  {
    id: 'story_4_2',
    name: '4-2 The Grand Arena',
    chapter: 4,
    stageNumber: 2,
    mode: 'story',
    description: 'Masquerade the Jester King challenges you to an unpredictable duel.',
    recommendedLevel: 40,
    firstClearReward: { crystals: 350, coins: 22000 },
    enemies: [ENEMY_TEMPLATES.masquerade()],
  },
  {
    id: 'story_4_3',
    name: '4-3 Summit of Embers',
    chapter: 4,
    stageNumber: 3,
    mode: 'story',
    description: 'Face the dread ruler of flames: Ignidra the Pyre Drake!',
    recommendedLevel: 45,
    firstClearReward: { crystals: 500, coins: 30000 },
    enemies: [ENEMY_TEMPLATES.ignidra()],
  },
];

export const MOC_STAGES: StageInfo[] = [
  {
    id: 'moc_1',
    name: 'Memory of Chaos: Stage 1',
    mode: 'moc',
    description: 'Forgotten Hall Stage 1. Clear all enemies within 12 cycles.',
    turnLimit: 12,
    recommendedLevel: 25,
    firstClearReward: { crystals: 200, coins: 10000 },
    enemies: [ENEMY_TEMPLATES.wisp(), ENEMY_TEMPLATES.shadowhound(), ENEMY_TEMPLATES.hoot()],
  },
  {
    id: 'moc_2',
    name: 'Memory of Chaos: Stage 2',
    mode: 'moc',
    description: 'Earth & Water resonance. Defeat the defensive sentry and caller.',
    turnLimit: 10,
    recommendedLevel: 30,
    firstClearReward: { crystals: 250, coins: 15000 },
    enemies: [ENEMY_TEMPLATES.sentry(), ENEMY_TEMPLATES.tidecaller()],
  },
  {
    id: 'moc_3',
    name: 'Memory of Chaos: Stage 3',
    mode: 'moc',
    description: 'Glacial test. Icewurm with swift frostlets.',
    turnLimit: 10,
    recommendedLevel: 35,
    firstClearReward: { crystals: 300, coins: 20000 },
    enemies: [ENEMY_TEMPLATES.icewurm(), ENEMY_TEMPLATES.frostlet(), ENEMY_TEMPLATES.frostlet()],
  },
  {
    id: 'moc_4',
    name: 'Memory of Chaos: Stage 4',
    mode: 'moc',
    description: 'Electric Tempest duel. Thunderbolts strike frequently.',
    turnLimit: 8,
    recommendedLevel: 40,
    firstClearReward: { crystals: 350, coins: 25000 },
    enemies: [ENEMY_TEMPLATES.stormcaller(), ENEMY_TEMPLATES.tempest()],
  },
  {
    id: 'moc_5',
    name: 'Memory of Chaos: Stage 5',
    mode: 'moc',
    description: 'Temporal distortion with Chronos. High efficiency required!',
    turnLimit: 8,
    recommendedLevel: 45,
    firstClearReward: { crystals: 400, coins: 30000 },
    enemies: [ENEMY_TEMPLATES.chronos(), ENEMY_TEMPLATES.golem()],
  },
  {
    id: 'moc_6',
    name: 'Memory of Chaos: Stage 6 (Floor 12 Final)',
    mode: 'moc',
    description: 'Endgame trial. Ignidra accompanied by high-tier elites.',
    turnLimit: 6,
    recommendedLevel: 50,
    firstClearReward: { crystals: 600, coins: 50000 },
    enemies: [ENEMY_TEMPLATES.ignidra(), ENEMY_TEMPLATES.masquerade()],
  },
];

export interface PhaseBuffOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const PURE_ONSLIGHT_BUFFS: PhaseBuffOption[] = [
  {
    id: 'buff_shatter',
    name: 'Shatter Cascade',
    emoji: '💥',
    description: 'Breaking an enemy toughness immediately triggers an AoE explosion for 400 damage to all foes.',
  },
  {
    id: 'buff_energy',
    name: 'Energy Overload',
    emoji: '⚡',
    description: 'All allies gain +15 extra Energy whenever an enemy is defeated.',
  },
  {
    id: 'buff_surge',
    name: 'Surging Power',
    emoji: '🔥',
    description: 'Every 3 enemies defeated activates Surging Power, increasing party ATK & Crit DMG by 40% for 2 turns.',
  },
];

export const PURE_ONSLIGHT_STAGES: StageInfo[] = [
  {
    id: 'pure_1',
    name: 'Pure Onslaught: Wave 1',
    mode: 'pure_onslaught',
    description: 'Enemies continuously respawn! Defeat as many as possible within 4 cycles to fill the Boss Gauge.',
    turnLimit: 4,
    recommendedLevel: 25,
    firstClearReward: { crystals: 250, coins: 15000 },
    enemies: [ENEMY_TEMPLATES.wisp(), ENEMY_TEMPLATES.spark(), ENEMY_TEMPLATES.hoot()],
  },
  {
    id: 'pure_2',
    name: 'Pure Onslaught: Wave 2',
    mode: 'pure_onslaught',
    description: 'Heavier packs of elemental enemies. High AoE speed clears are rewarded.',
    turnLimit: 4,
    recommendedLevel: 35,
    firstClearReward: { crystals: 350, coins: 25000 },
    enemies: [ENEMY_TEMPLATES.bark(), ENEMY_TEMPLATES.frostlet(), ENEMY_TEMPLATES.spark(), ENEMY_TEMPLATES.wisp()],
  },
];

export interface AnomalyBossModifier {
  id: string;
  name: string;
  description: string;
  isDisabled: boolean;
}

export const ANOMALY_MODIFIERS: AnomalyBossModifier[] = [
  {
    id: 'mod_shield',
    name: 'Iron Aegis',
    description: 'Boss starts with +50% extra elemental shield.',
    isDisabled: false,
  },
  {
    id: 'mod_regen',
    name: 'Rapid Regeneration',
    description: 'Boss restores 10% max HP every 3 turns.',
    isDisabled: false,
  },
  {
    id: 'mod_enrage',
    name: 'Enraged Will',
    description: 'Boss ATK increases by +20% during Phase 2.',
    isDisabled: false,
  },
];
