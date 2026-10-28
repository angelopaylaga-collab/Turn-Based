/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ElementType =
  | 'Fire'
  | 'Ice'
  | 'Lightning'
  | 'Wind'
  | 'Earth'
  | 'Water'
  | 'Light'
  | 'Shadow';

export type PathType =
  | 'Destruction'
  | 'Hunt'
  | 'Erudition'
  | 'Preservation'
  | 'Abundance'
  | 'Harmony'
  | 'Nihility'
  | 'Remembrance'
  | 'Elation';

export type TargetType = 'Single' | 'All' | 'SingleAdjacent' | 'Self' | 'SingleAlly' | 'AllAllies';

export type ActionAnimationType = 'Melee' | 'Ranged' | 'AoE' | 'Buff' | 'Heal' | 'Shield';

export interface SkillKit {
  name: string;
  description: string;
  targetType: TargetType;
  energyGain?: number;
  energyCost?: number;
  multiplier: number;
  toughnessDamage: number;
  cooldown?: number;
  currentCooldown?: number;
  animationType: ActionAnimationType;
  effectDescription?: string;
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  title: string;
  rarity: 4 | 5;
  path: PathType;
  element: ElementType;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number; // e.g. 0.05
  critDmg: number;  // e.g. 1.5
  energy: number;
  maxEnergy: number;
  shield: number;
  basicAtk: SkillKit;
  skill: SkillKit;
  ultimate: SkillKit;
  passiveName: string;
  passiveDesc: string;
  techniqueName: string;
  techniqueDesc: string;
  isUnlocked: boolean;
}

export interface BuffDebuff {
  id: string;
  name: string;
  emoji: string;
  isBuff: boolean;
  duration: number; // in turns
  stat?: 'atk' | 'def' | 'spd' | 'critRate' | 'critDmg' | 'freeze' | 'poison' | 'burn' | 'shield' | 'echo' | 'taunt';
  value: number; // multiplier or percentage (e.g. 0.15 for +15%)
  sourceName?: string;
  element?: ElementType;
}

export interface EnemySkill {
  name: string;
  targetType: TargetType;
  damageMultiplier: number;
  toughnessDamage?: number;
  animationType: ActionAnimationType;
  chargeTurns?: number; // 1 = telegraph charge warning
  effectType?: 'burn' | 'freeze' | 'poison' | 'slow' | 'taunt' | 'bubble' | 'confuse' | 'heal' | 'field';
  description: string;
}

export interface Enemy {
  id: string;
  name: string;
  emoji: string;
  element: ElementType;
  type: 'Common' | 'Elite' | 'Mini-Boss' | 'Boss';
  hp: number;
  maxHp: number;
  toughness: number;
  maxToughness: number;
  isBroken: boolean;
  brokenTurns: number;
  shield: number;
  maxShield: number;
  shieldElement?: ElementType;
  isShieldBroken: boolean;
  shieldBrokenTurns: number;
  atk: number;
  def: number;
  spd: number;
  skills: EnemySkill[];
  activeBuffs: BuffDebuff[];
  phase: number;
  maxPhases: number;
  intent?: EnemySkill;
  chargeCountdown?: number;
  isCharging?: boolean;
}

export interface FieldEffect {
  name: string;
  element: ElementType;
  duration: number;
  description: string;
  boostMultiplier: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isCrit?: boolean;
  isHeal?: boolean;
  isShield?: boolean;
  isBreak?: boolean;
}

export type GameModeType = 'story' | 'moc' | 'pure_onslaught' | 'anomaly';

export interface StageInfo {
  id: string;
  name: string;
  chapter?: number;
  stageNumber?: number;
  mode: GameModeType;
  description: string;
  turnLimit?: number; // for MoC or Pure Onslaught cycles
  recommendedLevel: number;
  enemies: Enemy[];
  firstClearReward: {
    crystals: number;
    coins: number;
  };
  isCleared?: boolean;
  stars?: number;
}
