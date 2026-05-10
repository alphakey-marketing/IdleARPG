export interface SkillDef {
  id: string;
  name: string;
  type: 'basic' | 'active' | 'defensive' | 'passive';
  cooldown: number; // ticks
  resourceCost: number;
  damage: number;
  healAmount?: number;
  buffDuration?: number;
  stunDuration?: number;
  description: string;
}

export interface ClassDef {
  id: string;
  name: string;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    attackSpeed: number; // ticks between auto-attacks
    critChance: number;
  };
  skills: string[]; // skill IDs
}

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  xpReward: number;
  goldReward: number;
  isBoss?: boolean;
}

export interface MapDef {
  id: string;
  name: string;
  stages: StageDef[];
}

export interface StageDef {
  id: string;
  name: string;
  enemies: { enemyId: string; count: number }[];
  isBoss?: boolean;
}

export interface ItemDef {
  id: string;
  name: string;
  slot: 'weapon' | 'helmet' | 'armor' | 'gloves' | 'legs' | 'ring' | 'necklace';
  rarity: 'common' | 'magic' | 'rare' | 'epic' | 'legendary' | 'seasonal';
  stats: Partial<{
    attack: number;
    defense: number;
    hp: number;
    crit: number;
    attackSpeed: number;
  }>;
}

export interface MissionDef {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'seasonal';
  objective: { type: 'kill'; count: number } | { type: 'clear_stage'; stageId: string } | { type: 'defeat_boss'; enemyId: string };
  reward: { gold?: number; xp?: number };
}

export interface IdleBuildingDef {
  id: string;
  name: string;
  produces: 'gold' | 'materials' | 'map_fragments' | 'season_tokens';
  baseRatePerHour: number;
  maxOfflineHours: number;
}

export interface SeasonDef {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  modifier?: string;
}

// Runtime / API types
export interface CharacterState {
  classId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    attackSpeed: number;
    critChance: number;
  };
  equippedItems: Partial<Record<string, string>>; // slot → itemId
  clearedStages?: string[]; // stage IDs the player has cleared at least once
}

export interface InventoryItem {
  id: string;
  itemDefId: string;
  rarity: ItemDef['rarity'];
  equippedSlot?: string;
}

export interface SkillPreset {
  skillOrder: string[];
  targetMode: 'boss_first' | 'lowest_hp' | 'closest';
  autoHealThreshold: number; // percentage 0-1
}

export interface IdleBuilding {
  id: string;
  buildingType: string;
  level: number;
  lastCollectedAt: string; // ISO timestamp
}

export interface PlayerProfile {
  accountId: string;
  currentSeasonId: string;
  accountLevel: number;
  gold: number;
  skillShards: number;
  seasonTokens: number;
}

export interface MissionProgress {
  missionId: string;
  progress: number;
  completed: boolean;
  claimedAt?: string;
}

export interface BattleResult {
  won: boolean;
  xpGained: number;
  goldGained: number;
  itemsDropped: InventoryItem[];
  monstersKilled: number;
  stageId: string;
}
