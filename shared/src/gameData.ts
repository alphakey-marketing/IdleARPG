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
  whirlwind: {
    id: 'whirlwind',
    name: 'Whirlwind',
    type: 'active',
    cooldown: 8,
    resourceCost: 35,
    damage: 40,
    description: 'Spin and strike all enemies for heavy damage.',
  },
  iron_skin: {
    id: 'iron_skin',
    name: 'Iron Skin',
    type: 'defensive',
    cooldown: 12,
    resourceCost: 25,
    damage: 0,
    buffDuration: 5,
    description: 'Harden your skin, reducing incoming damage for 5 ticks.',
  },
  execute: {
    id: 'execute',
    name: 'Execute',
    type: 'active',
    cooldown: 7,
    resourceCost: 30,
    damage: 60,
    description: 'A powerful finishing blow. Deals double damage to enemies below 30% HP.',
  },
  cleave: {
    id: 'cleave',
    name: 'Cleave',
    type: 'active',
    cooldown: 4,
    resourceCost: 15,
    damage: 20,
    description: 'Sweep your weapon in a wide arc, hitting the primary target for bonus damage.',
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
    skills: ['slash', 'shield_bash', 'battle_cry', 'whirlwind', 'iron_skin', 'execute', 'cleave'],
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
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    hp: 60,
    attack: 9,
    defense: 3,
    attackSpeed: 2,
    xpReward: 18,
    goldReward: 7,
  },
  cave_bat: {
    id: 'cave_bat',
    name: 'Cave Bat',
    hp: 35,
    attack: 7,
    defense: 1,
    attackSpeed: 1,
    xpReward: 12,
    goldReward: 5,
  },
  dark_knight: {
    id: 'dark_knight',
    name: 'Dark Knight',
    hp: 120,
    attack: 18,
    defense: 12,
    attackSpeed: 3,
    xpReward: 40,
    goldReward: 20,
  },
  stone_golem: {
    id: 'stone_golem',
    name: 'Stone Golem',
    hp: 500,
    attack: 30,
    defense: 25,
    attackSpeed: 4,
    xpReward: 150,
    goldReward: 80,
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
  stone_caves: {
    id: 'stone_caves',
    name: 'Stone Caves',
    stages: [
      {
        id: 'stone_caves_1',
        name: 'Stage 1: Bat Cavern',
        enemies: [
          { enemyId: 'cave_bat', count: 4 },
          { enemyId: 'skeleton', count: 1 },
        ],
      },
      {
        id: 'stone_caves_2',
        name: 'Stage 2: Crypt Hall',
        enemies: [
          { enemyId: 'skeleton', count: 3 },
          { enemyId: 'dark_knight', count: 1 },
        ],
      },
      {
        id: 'stone_caves_3',
        name: 'Stage 3: Golem Chamber (Boss)',
        enemies: [{ enemyId: 'stone_golem', count: 1 }],
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
  // Stone Caves drops
  bone_dagger: {
    id: 'bone_dagger',
    name: 'Bone Dagger',
    slot: 'weapon',
    rarity: 'common',
    stats: { attack: 8, crit: 0.04 },
  },
  skeleton_helm: {
    id: 'skeleton_helm',
    name: 'Skeleton Helm',
    slot: 'helmet',
    rarity: 'common',
    stats: { defense: 7, hp: 25 },
  },
  dark_plate: {
    id: 'dark_plate',
    name: 'Dark Plate',
    slot: 'armor',
    rarity: 'magic',
    stats: { defense: 14, hp: 50 },
  },
  cave_crystal_ring: {
    id: 'cave_crystal_ring',
    name: 'Cave Crystal Ring',
    slot: 'ring',
    rarity: 'magic',
    stats: { crit: 0.06, attack: 4 },
  },
  golem_gauntlets: {
    id: 'golem_gauntlets',
    name: 'Golem Gauntlets',
    slot: 'gloves',
    rarity: 'rare',
    stats: { attack: 12, defense: 8 },
  },
  stone_boots: {
    id: 'stone_boots',
    name: 'Stone Boots',
    slot: 'legs',
    rarity: 'magic',
    stats: { defense: 10, hp: 35 },
  },
  golem_core_amulet: {
    id: 'golem_core_amulet',
    name: 'Golem Core Amulet',
    slot: 'necklace',
    rarity: 'epic',
    stats: { hp: 100, attack: 15, defense: 10 },
  },
  warrior_belt: {
    id: 'warrior_belt',
    name: "Warrior's Belt",
    slot: 'legs',
    rarity: 'common',
    stats: { defense: 5, hp: 20 },
  },
  battle_ring: {
    id: 'battle_ring',
    name: 'Battle Ring',
    slot: 'ring',
    rarity: 'magic',
    stats: { attack: 8, crit: 0.05 },
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
  daily_kill_25: {
    id: 'daily_kill_25',
    name: 'Veteran Slayer',
    description: 'Kill 25 monsters.',
    type: 'daily',
    objective: { type: 'kill', count: 25 },
    reward: { gold: 120, xp: 250 },
  },
  clear_forest_boss: {
    id: 'clear_forest_boss',
    name: 'Troll Slayer',
    description: 'Defeat the Forest Troll boss.',
    type: 'daily',
    objective: { type: 'defeat_boss', enemyId: 'forest_troll' },
    reward: { gold: 200, xp: 500 },
  },
  clear_stage_1: {
    id: 'clear_stage_1',
    name: 'Forest Explorer',
    description: 'Clear Stage 1: Mossy Trail.',
    type: 'daily',
    objective: { type: 'clear_stage', stageId: 'forest_path_1' },
    reward: { gold: 75, xp: 150 },
  },
  clear_caves_boss: {
    id: 'clear_caves_boss',
    name: 'Golem Breaker',
    description: 'Defeat the Stone Golem boss.',
    type: 'daily',
    objective: { type: 'defeat_boss', enemyId: 'stone_golem' },
    reward: { gold: 300, xp: 800 },
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

export const COMMON_ITEM_IDS = ['iron_sword', 'leather_helmet', 'chainmail', 'iron_gauntlets', 'leather_boots', 'copper_ring', 'silver_necklace', 'bone_dagger', 'skeleton_helm', 'stone_boots', 'warrior_belt'];
export const BOSS_ITEM_IDS = ['trollbane_sword', 'troll_hide_armor'];
export const CAVES_COMMON_ITEM_IDS = ['bone_dagger', 'skeleton_helm', 'dark_plate', 'cave_crystal_ring', 'stone_boots', 'warrior_belt'];
export const CAVES_BOSS_ITEM_IDS = ['golem_gauntlets', 'golem_core_amulet', 'battle_ring'];

// XP table: xp needed to reach level N+1
export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(1.4, level - 1));
}
