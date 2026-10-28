/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GDDSection {
  id: string;
  title: string;
  icon: string;
  content: string[];
  tables?: {
    headers: string[];
    rows: string[][];
  };
}

export const GDD_SECTIONS: GDDSection[] = [
  {
    id: 'overview',
    title: 'Part 1: Concept & Visual Style',
    icon: '🎮',
    content: [
      'Genre: Turn-based tactical RPG with strategic team building & elemental combat.',
      'Visual Style: Clean, modern, minimalist — characters represented by single emojis with modern real-world names; smooth 2D card-style animations; soft glow effects; readable typography; no clutter.',
      'Core Philosophy: Easy to learn, deep to master — every effect has a clear visual cue; players always understand what is happening and why.',
      'Main Menu Layout: Top Left player info & currencies; Top Right settings & install; Center 4 large buttons (Story, Battle Modes, Characters, Shop); Bottom daily missions & events.',
    ],
  },
  {
    id: 'battle_ui',
    title: 'Part 2: Battle UI & Expiration Rules',
    icon: '⚔️',
    content: [
      'Turn Order Bar: Icons flow horizontally at the top of the screen. Ally units are bright & highlighted; enemies are dimmed. The next active unit pulses with a glow.',
      'Enemy Status Display: HP bar (Green >50%, Yellow 25-50%, Red <25%), Toughness bar above HP, Elemental Shield secondary bar.',
      'Buff & Debuff Expiration System:',
      '• 2+ turns remaining: Solid icon + small number showing turns left (no glow).',
      '• 1 turn remaining (expiring soon): Faint, soft pulsing glow (🟢 Green for Buff, 🔴 Red for Debuff).',
      '• Ending THIS turn: Icon flashes slowly once at the start of the turn, then fades away completely.',
      'Shield Absorption: Visualized as silver numbers with 🛡️ icon.',
      'Critical Hits: Rendered larger and in bold with a sparkle burst effect.',
    ],
    tables: {
      headers: ['Element', 'Color Coding', 'Weakness Counter', 'Break Animation'],
      rows: [
        ['🔥 Fire', 'Bright Orange / Red', '💧 Water', 'Steam burst outward'],
        ['❄️ Ice', 'Pale Cyan / Light Blue', '🔥 Fire', 'Ice shatters into crystals'],
        ['⚡ Lightning', 'Electric Yellow / Violet', '🍃 Wind', 'Sparks fly, electric explosion'],
        ['🍃 Wind', 'Soft Green / Teal', '⚡ Lightning', 'Gust of wind disperses'],
        ['🌍 Earth', 'Sandy Gold / Brown', '❄️ Ice', 'Rocks crumble to dust'],
        ['💧 Water', 'Deep Blue', '⚡ Lightning', 'Water splashes outward'],
        ['✨ Light', 'White / Gold Glow', '🌑 Shadow', 'Bright flash fades to dim'],
        ['🌑 Shadow', 'Deep Purple / Smoky Gray', '✨ Light', 'Dark mist dissolves and rises'],
      ],
    },
  },
  {
    id: 'combat_mechanics',
    title: 'Part 3: Combat Mechanics & Toughness Break',
    icon: '🎯',
    content: [
      'Turn Flow: Start of Turn (Buffs/Debuffs count down & fields tick) → Main Action (Basic ATK, Skill, or Ultimate) → End of Turn (DoT ticks, Energy updates, turn shift).',
      'Energy Rules: Basic ATK +20, Skill +30, Taking Damage +10 to +15. Ultimates cost 90 to 140 Energy.',
      'Enemy Shields & Toughness Break System:',
      '• Toughness Bar: Solid gray bar above HP. Breaks when reduced to 0.',
      '• BREAK Moment: Bar shatters → disappears → enemy staggers → "BREAK" pops up in bold orange. Enemy action delayed by 30-50%, takes +40% DMG for 2 turns, and debuffs last +1 extra turn!',
      '• Elemental Shield: Outline shatters into fragments → "BROKEN" pops up in bold white with element glow. Takes +30-50% DMG for 2 turns.',
      'Field / Zone System: Exactly 1 field can be active at a time. Deploying a new field replaces the old. Boosts matching elements.',
    ],
  },
  {
    id: 'game_modes',
    title: 'Part 4: Endgame Modes Architecture',
    icon: '🏆',
    content: [
      'Mode 1: ⏳ Memory of Chaos (MoC) — Strict turn/cycle limits inspired by Forgotten Hall. Efficiency is paramount. Earn up to 3 stars based on turns remaining.',
      'Mode 2: 🔥 Pure Onslaught — Endless wave spawns inspired by Pure Fiction. 4 cycles limit. Points accumulated from defeating waves damage and fill the Boss Gauge. Select 1 of 3 Phase Buffs beforehand!',
      'Mode 3: ♟️ Anomaly Arbitration — Multi-team gauntlet. 3 consecutive Knight battles followed by a King Stage. Team lock prevents reusing heroes in earlier battles. Interference Keys disable boss modifiers.',
    ],
  },
  {
    id: 'nine_paths',
    title: 'Part 5: 9 Paths & Roles Matrix',
    icon: '🧭',
    content: [
      '⚔️ Destruction: Frontline damage dealers who balance resilience with raw offensive burst.',
      '🏹 Hunt: Single-target assassins with exceptional speed, critical hits, and turn advance mechanics.',
      '🧠 Erudition: Area-of-effect multi-target specialists who clear enemy waves simultaneously.',
      '🛡️ Preservation: Shield generators and defensive stalwarts who reduce incoming harm and retaliate.',
      '💚 Abundance: Life-givers providing direct heals, health-over-time, debuff cleansing, and energy transfer.',
      '🤝 Harmony: Party buffers who enhance team attack, defense, turn speed, and action advance.',
      '💀 Nihility: Debuff and Damage-over-Time (DoT) masters who wither foes with burns, poisons, and defense shred.',
      '🪞 Remembrance: Echo and memory masters who summon translucent duplicates to repeat attacks and rewind turns.',
      '🎉 Elation: High-energy burst and luck catalysts who accelerate party ultimates, proc extra hits, and roll jackpots.',
    ],
  },
];
