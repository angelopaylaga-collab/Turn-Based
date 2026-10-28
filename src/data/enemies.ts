/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Enemy, ElementType } from '../types/game';

export const ENEMY_WEAKNESS_MAP: Record<ElementType, ElementType> = {
  Fire: 'Water',
  Ice: 'Fire',
  Lightning: 'Wind',
  Wind: 'Lightning',
  Earth: 'Ice',
  Water: 'Lightning',
  Light: 'Shadow',
  Shadow: 'Light',
};

export function createEnemyInstance(base: Partial<Enemy> & { id: string; name: string; emoji: string; element: ElementType; type: Enemy['type'] }): Enemy {
  return {
    id: `${base.id}_${Math.random().toString(36).substring(2, 7)}`,
    name: base.name,
    emoji: base.emoji,
    element: base.element,
    type: base.type,
    hp: base.hp || 600,
    maxHp: base.maxHp || base.hp || 600,
    toughness: base.toughness || 60,
    maxToughness: base.maxToughness || base.toughness || 60,
    isBroken: false,
    brokenTurns: 0,
    shield: base.shield || 0,
    maxShield: base.maxShield || base.shield || 0,
    shieldElement: base.shieldElement || (base.shield ? base.element : undefined),
    isShieldBroken: false,
    shieldBrokenTurns: 0,
    atk: base.atk || 120,
    def: base.def || 80,
    spd: base.spd || 95,
    skills: base.skills || [
      {
        name: 'Strike',
        targetType: 'Single',
        damageMultiplier: 1.0,
        toughnessDamage: 20,
        animationType: 'Melee',
        description: 'Strikes a hero with physical force.',
      },
    ],
    activeBuffs: [],
    phase: 1,
    maxPhases: base.maxPhases || (base.type === 'Boss' ? 2 : 1),
    isCharging: false,
    chargeCountdown: 0,
  };
}

// Preset factory templates from GDD
export const ENEMY_TEMPLATES = {
  // Commons
  wisp: () =>
    createEnemyInstance({
      id: 'wisp',
      name: 'Wisp',
      emoji: '👻',
      element: 'Shadow',
      type: 'Common',
      hp: 550,
      toughness: 40,
      atk: 105,
      def: 60,
      spd: 102,
      skills: [
        {
          name: 'Shadow Touch',
          targetType: 'Single',
          damageMultiplier: 0.95,
          animationType: 'Ranged',
          description: 'Touches the target with chilling darkness.',
        },
      ],
    }),

  hoot: () =>
    createEnemyInstance({
      id: 'hoot',
      name: 'Hoot',
      emoji: '🦉',
      element: 'Wind',
      type: 'Common',
      hp: 520,
      toughness: 45,
      atk: 110,
      def: 55,
      spd: 115,
      skills: [
        {
          name: 'Gust',
          targetType: 'Single',
          damageMultiplier: 0.9,
          effectType: 'slow',
          animationType: 'Ranged',
          description: 'Flaps wings unleashing a brisk gust, reducing speed.',
        },
      ],
    }),

  bark: () =>
    createEnemyInstance({
      id: 'bark',
      name: 'Bark',
      emoji: '🪵',
      element: 'Earth',
      type: 'Common',
      hp: 750,
      toughness: 60,
      atk: 95,
      def: 95,
      spd: 82,
      skills: [
        {
          name: 'Ram',
          targetType: 'Single',
          damageMultiplier: 1.1,
          animationType: 'Melee',
          description: 'Rams forward with sturdy wooden mass.',
        },
      ],
    }),

  spark: () =>
    createEnemyInstance({
      id: 'spark',
      name: 'Spark',
      emoji: '🔥',
      element: 'Fire',
      type: 'Common',
      hp: 540,
      toughness: 40,
      atk: 115,
      def: 60,
      spd: 106,
      skills: [
        {
          name: 'Singe',
          targetType: 'Single',
          damageMultiplier: 1.0,
          effectType: 'burn',
          animationType: 'Ranged',
          description: 'Shoots burning ember with 25% chance to burn.',
        },
      ],
    }),

  frostlet: () =>
    createEnemyInstance({
      id: 'frostlet',
      name: 'Frostlet',
      emoji: '❄️',
      element: 'Ice',
      type: 'Common',
      hp: 530,
      toughness: 50,
      atk: 100,
      def: 70,
      spd: 98,
      skills: [
        {
          name: 'Nip',
          targetType: 'Single',
          damageMultiplier: 0.95,
          effectType: 'freeze',
          animationType: 'Ranged',
          description: 'Chills an ally with frostbite.',
        },
      ],
    }),

  // Elites
  shadowhound: () =>
    createEnemyInstance({
      id: 'shadowhound',
      name: 'Shadowhound',
      emoji: '🐺',
      element: 'Shadow',
      type: 'Elite',
      hp: 1450,
      toughness: 90,
      shield: 250,
      shieldElement: 'Shadow',
      atk: 155,
      def: 95,
      spd: 112,
      skills: [
        {
          name: 'Bite x2',
          targetType: 'Single',
          damageMultiplier: 1.45,
          animationType: 'Melee',
          description: 'Fiercely bites target twice in rapid succession.',
        },
        {
          name: 'Howl',
          targetType: 'All',
          damageMultiplier: 0.8,
          animationType: 'AoE',
          description: 'Howls menacingly, buffing enemy ATK.',
        },
      ],
    }),

  sentry: () =>
    createEnemyInstance({
      id: 'sentry',
      name: 'Sentry',
      emoji: '🗿',
      element: 'Earth',
      type: 'Elite',
      hp: 1850,
      toughness: 120,
      shield: 350,
      shieldElement: 'Earth',
      atk: 140,
      def: 145,
      spd: 88,
      skills: [
        {
          name: 'Slam',
          targetType: 'Single',
          damageMultiplier: 1.3,
          animationType: 'Melee',
          description: 'Slams stone pillar directly onto single target.',
        },
        {
          name: 'Stone Guard',
          targetType: 'Self',
          damageMultiplier: 0,
          effectType: 'taunt',
          animationType: 'Shield',
          description: 'Hardens stone armor (+30% DEF) and forces attacks onto self.',
        },
      ],
    }),

  tidecaller: () =>
    createEnemyInstance({
      id: 'tidecaller',
      name: 'Tidecaller',
      emoji: '🌊',
      element: 'Water',
      type: 'Elite',
      hp: 1380,
      toughness: 85,
      shield: 220,
      shieldElement: 'Water',
      atk: 135,
      def: 85,
      spd: 104,
      skills: [
        {
          name: 'Waterbolt',
          targetType: 'Single',
          damageMultiplier: 1.25,
          animationType: 'Ranged',
          description: 'Hurls swirling pressure bolt.',
        },
        {
          name: 'Healing Wave',
          targetType: 'AllAllies',
          damageMultiplier: 0,
          effectType: 'heal',
          animationType: 'Heal',
          description: 'Restores 20% max HP to all enemy allies.',
        },
      ],
    }),

  stormcaller: () =>
    createEnemyInstance({
      id: 'stormcaller',
      name: 'Stormcaller',
      emoji: '⚡',
      element: 'Lightning',
      type: 'Elite',
      hp: 1320,
      toughness: 80,
      shield: 200,
      shieldElement: 'Lightning',
      atk: 160,
      def: 80,
      spd: 114,
      skills: [
        {
          name: 'Chain Shock',
          targetType: 'SingleAdjacent',
          damageMultiplier: 1.2,
          animationType: 'Ranged',
          description: 'Arcs high-voltage electricity between heroes.',
        },
        {
          name: 'Thunderclap',
          targetType: 'All',
          damageMultiplier: 1.1,
          animationType: 'AoE',
          description: 'Calls down thunder on entire party.',
        },
      ],
    }),

  // Mini-Bosses
  icewurm: () =>
    createEnemyInstance({
      id: 'icewurm',
      name: 'Icewurm',
      emoji: '🧊',
      element: 'Ice',
      type: 'Mini-Boss',
      hp: 2400,
      toughness: 130,
      shield: 400,
      shieldElement: 'Ice',
      atk: 165,
      def: 110,
      spd: 96,
      skills: [
        {
          name: 'Burrow & Emerge',
          targetType: 'Single',
          damageMultiplier: 1.9,
          effectType: 'freeze',
          animationType: 'Melee',
          description: 'Dives underground and bursts upward with freezing fury.',
        },
        {
          name: 'Tailswipe',
          targetType: 'All',
          damageMultiplier: 1.15,
          animationType: 'AoE',
          description: 'Sweeps frozen tail across all party members.',
        },
      ],
    }),

  golem: () =>
    createEnemyInstance({
      id: 'golem',
      name: 'Ruin Golem',
      emoji: '⚙️',
      element: 'Earth',
      type: 'Mini-Boss',
      hp: 2800,
      toughness: 160,
      shield: 450,
      shieldElement: 'Earth',
      atk: 175,
      def: 135,
      spd: 86,
      skills: [
        {
          name: 'Heavy Fist',
          targetType: 'Single',
          damageMultiplier: 1.7,
          animationType: 'Melee',
          description: 'Crushes target under heavy metallic arm.',
        },
        {
          name: 'Eye Laser Cannon',
          targetType: 'All',
          damageMultiplier: 2.2,
          chargeTurns: 1,
          animationType: 'AoE',
          description: 'Charges glowing eye core for a catastrophic beam next turn!',
        },
      ],
    }),

  // Bosses
  ignidra: () =>
    createEnemyInstance({
      id: 'ignidra',
      name: 'Ignidra the Pyre Drake',
      emoji: '🐉',
      element: 'Fire',
      type: 'Boss',
      hp: 4200,
      toughness: 180,
      shield: 600,
      shieldElement: 'Fire',
      atk: 185,
      def: 120,
      spd: 104,
      maxPhases: 2,
      skills: [
        {
          name: 'Firebreath',
          targetType: 'All',
          damageMultiplier: 1.35,
          effectType: 'burn',
          animationType: 'AoE',
          description: 'Breathes sweeping cone of molten dragonfire.',
        },
        {
          name: 'Tailswipe',
          targetType: 'SingleAdjacent',
          damageMultiplier: 1.45,
          animationType: 'Melee',
          description: 'Slams barbed tail into frontline heroes.',
        },
        {
          name: 'Inferno Overdrive',
          targetType: 'All',
          damageMultiplier: 2.5,
          chargeTurns: 1,
          animationType: 'AoE',
          description: 'Phase 2: Rears back as the floor glows fiery magma, preparing Inferno!',
        },
      ],
    }),

  hydriss: () =>
    createEnemyInstance({
      id: 'hydriss',
      name: 'Hydriss the Abyssal Queen',
      emoji: '🌊',
      element: 'Water',
      type: 'Boss',
      hp: 4000,
      toughness: 170,
      shield: 580,
      shieldElement: 'Water',
      atk: 175,
      def: 125,
      spd: 108,
      maxPhases: 2,
      skills: [
        {
          name: 'Tidal Wave',
          targetType: 'All',
          damageMultiplier: 1.3,
          animationType: 'AoE',
          description: 'Summons crushing tidal breaker.',
        },
        {
          name: 'Bubble Prison',
          targetType: 'Single',
          damageMultiplier: 1.0,
          effectType: 'bubble',
          animationType: 'Ranged',
          description: 'Traps an ally in dense water sphere preventing action.',
        },
        {
          name: 'Whirlpool Cataclysm',
          targetType: 'All',
          damageMultiplier: 2.2,
          chargeTurns: 1,
          animationType: 'AoE',
          description: 'Phase 2: Summons whirlpool pulling heroes and delaying action by 40%.',
        },
      ],
    }),

  tempest: () =>
    createEnemyInstance({
      id: 'tempest',
      name: 'Tempest the Living Maelstrom',
      emoji: '⛈️',
      element: 'Lightning',
      type: 'Boss',
      hp: 3900,
      toughness: 165,
      shield: 550,
      shieldElement: 'Lightning',
      atk: 195,
      def: 110,
      spd: 116,
      maxPhases: 2,
      skills: [
        {
          name: 'Thunderbolt',
          targetType: 'Single',
          damageMultiplier: 1.7,
          animationType: 'Ranged',
          description: 'Fierce lightning strike from the upper clouds.',
        },
        {
          name: 'Stormcloud Arc',
          targetType: 'All',
          damageMultiplier: 1.35,
          animationType: 'AoE',
          description: 'Electrifies the field with crackling static.',
        },
        {
          name: 'Judgment Bolt',
          targetType: 'Single',
          damageMultiplier: 2.8,
          chargeTurns: 1,
          animationType: 'Ranged',
          description: 'Phase 2: Warning beam locks on hero before apocalyptic lightning strike.',
        },
      ],
    }),

  chronos: () =>
    createEnemyInstance({
      id: 'chronos',
      name: 'Chronos the Timeless Arbiter',
      emoji: '⏳',
      element: 'Light',
      type: 'Boss',
      hp: 4400,
      toughness: 190,
      shield: 620,
      shieldElement: 'Light',
      atk: 180,
      def: 130,
      spd: 110,
      maxPhases: 2,
      skills: [
        {
          name: 'Sandblast',
          targetType: 'All',
          damageMultiplier: 1.3,
          animationType: 'AoE',
          description: 'Hourglass sands ravage heroes with time dust.',
        },
        {
          name: 'Time Dilation',
          targetType: 'Single',
          damageMultiplier: 1.1,
          effectType: 'slow',
          animationType: 'Ranged',
          description: 'Slows single ally speed by 35% for 2 turns.',
        },
        {
          name: 'Time Stop',
          targetType: 'All',
          damageMultiplier: 2.1,
          chargeTurns: 1,
          animationType: 'AoE',
          description: 'Phase 2: Freezes time for all heroes while Chronos acts twice!',
        },
      ],
    }),

  masquerade: () =>
    createEnemyInstance({
      id: 'masquerade',
      name: 'Masquerade the Jester King',
      emoji: '🎭',
      element: 'Shadow',
      type: 'Boss',
      hp: 4300,
      toughness: 175,
      shield: 600,
      shieldElement: 'Shadow',
      atk: 190,
      def: 120,
      spd: 112,
      maxPhases: 2,
      skills: [
        {
          name: 'Jest of Chaos',
          targetType: 'SingleAdjacent',
          damageMultiplier: 1.3,
          animationType: 'Ranged',
          description: 'Fires laughing theatrical mask dealing mixed shadow damage.',
        },
        {
          name: 'Prank Confuse',
          targetType: 'Single',
          damageMultiplier: 0.8,
          effectType: 'confuse',
          animationType: 'Ranged',
          description: 'Confuses ally into losing their next action.',
        },
        {
          name: 'Grand Performance',
          targetType: 'All',
          damageMultiplier: 2.4,
          chargeTurns: 1,
          animationType: 'AoE',
          description: 'Phase 2: Curtain rises on grand spectacle dealing heavy chaos damage!',
        },
      ],
    }),
};
