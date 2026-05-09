import type { ClassDef, SkillDef, EnemyDef, MapDef, ItemDef, MissionDef, IdleBuildingDef, SeasonDef } from './types';

export const SKILLS: Record<string, SkillDef> = {
  slash: {
    id: 'slash',
    name: 'Slash',
    type: 'basic',
    cooldown: 2,
    resourceCost: 0,
    damage: 15,
    description: 'A basic slash attack.',
  },
  shield_bash: {
    id: 'shield_bash',
    name: 'Shield Bash',
    type: 'active',
    cooldown: 6,
    resourceCost: 20,
    damage: 25,
    stunDuration: 2,
    description: 'Bash the enemy with your shield, dealing damage and stunning them.',
  },
  battle_cry: {
    id: 'battle_cry',
    name: 'Battle Cry',
    type: 'defensive',
    cooldown: 10,
    resourceCost: 30,
    damage: 0,
    buffDuration: 4,
    description: 'Increases your attack by 50% for 4 ticks.',
  },
};

export const CLASSES: Record<string, ClassDef> = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    baseStats: {
      hp: 200,
      attack: 20,
      defense: 10,
      attackSpeed: 2,
      critChance: 0.05,
    },
    skills: ['slash', 'shield_bash', 'battle_cry'],
  },
};

export const ENEMIES: Record<string, EnemyDef> = {
  forest_slime: {
    id: 'forest_slime',
    name: 'Forest Slime',
    hp: 40,
    attack: 5,
    defense: 2,
    attackSpeed: 3,
    xpReward: 10,
    goldReward: 3,
  },
  wolf: {
    id: 'wolf',
    name: 'Forest Wolf',
    hp: 70,
    attack: 10,
    defense: 4,
    attackSpeed: 2,
    xpReward: 20,
    goldReward: 8,
  },
  goblin: {
    id: 'goblin',
    name: 'Goblin Scout',
    hp: 55,
    attack: 8,
    defense: 3,
    attackSpeed: 2,
    xpReward: 15,
    goldReward: 6,
  },
  forest_troll: {
    id: 'forest_troll',
    name: 'Forest Troll',
    hp: 350,
    attack: 22,
    defense: 15,
    attackSpeed: 3,
    xpReward: 100,
    goldReward: 50,
    isBoss: true,
  },
};

export const MAPS: Record<string, MapDef> = {
  forest_path: {
    id: 'forest_path',
    name: 'Forest Path',
    stages: [
      {
        id: 'forest_path_1',
        name: 'Stage 1: Mossy Trail',
        enemies: [
          { enemyId: 'forest_slime', count: 3 },
          { enemyId: 'goblin', count: 1 },
        ],
      },
      {
        id: 'forest_path_2',
        name: 'Stage 2: Dark Clearing',
        enemies: [
          { enemyId: 'wolf', count: 2 },
          { enemyId: 'goblin', count: 2 },
        ],
      },
      {
        id: 'forest_path_3',
        name: 'Stage 3: Troll Lair (Boss)',
        enemies: [{ enemyId: 'forest_troll', count: 1 }],
        isBoss: true,
      },
    ],
  },
};

export const ITEMS: Record<string, ItemDef> = {
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    slot: 'weapon',
    rarity: 'common',
    stats: { attack: 10 },
  },
  leather_helmet: {
    id: 'leather_helmet',
    name: 'Leather Helmet',
    slot: 'helmet',
    rarity: 'common',
    stats: { defense: 5, hp: 20 },
  },
  chainmail: {
    id: 'chainmail',
    name: 'Chainmail',
    slot: 'armor',
    rarity: 'common',
    stats: { defense: 8, hp: 30 },
  },
  iron_gauntlets: {
    id: 'iron_gauntlets',
    name: 'Iron Gauntlets',
    slot: 'gloves',
    rarity: 'common',
    stats: { attack: 3, defense: 3 },
  },
  leather_boots: {
    id: 'leather_boots',
    name: 'Leather Boots',
    slot: 'legs',
    rarity: 'common',
    stats: { defense: 4, hp: 15 },
  },
  copper_ring: {
    id: 'copper_ring',
    name: 'Copper Ring',
    slot: 'ring',
    rarity: 'common',
    stats: { crit: 0.03 },
  },
  silver_necklace: {
    id: 'silver_necklace',
    name: 'Silver Necklace',
    slot: 'necklace',
    rarity: 'magic',
    stats: { hp: 40, attack: 5 },
  },
  trollbane_sword: {
    id: 'trollbane_sword',
    name: 'Trollbane Sword',
    slot: 'weapon',
    rarity: 'rare',
    stats: { attack: 25, crit: 0.08 },
  },
  troll_hide_armor: {
    id: 'troll_hide_armor',
    name: 'Troll Hide Armor',
    slot: 'armor',
    rarity: 'rare',
    stats: { defense: 20, hp: 80 },
  },
};

export const MISSIONS: Record<string, MissionDef> = {
  daily_kill_10: {
    id: 'daily_kill_10',
    name: 'Monster Hunter',
    description: 'Kill 10 monsters.',
    type: 'daily',
    objective: { type: 'kill', count: 10 },
    reward: { gold: 50, xp: 100 },
  },
};

export const IDLE_BUILDINGS: Record<string, IdleBuildingDef> = {
  mine: {
    id: 'mine',
    name: 'Mine',
    produces: 'gold',
    baseRatePerHour: 20,
    maxOfflineHours: 8,
  },
};

export const SEASONS: SeasonDef[] = [
  {
    id: 'season_1',
    name: 'Season 1: The Forest Awakens',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const COMMON_ITEM_IDS = ['iron_sword', 'leather_helmet', 'chainmail', 'iron_gauntlets', 'leather_boots', 'copper_ring', 'silver_necklace'];
export const BOSS_ITEM_IDS = ['trollbane_sword', 'troll_hide_armor'];

// XP table: xp needed to reach level N+1
export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(1.4, level - 1));
}
