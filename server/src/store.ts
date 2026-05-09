import type { CharacterState, InventoryItem, SkillPreset, IdleBuilding, PlayerProfile, MissionProgress } from '../../shared/src/types';
import { CLASSES, IDLE_BUILDINGS, MISSIONS, SEASONS, xpForLevel } from '../../shared/src/gameData';

export interface AccountData {
  accountId: string;
  profile: PlayerProfile;
  character: CharacterState;
  inventory: InventoryItem[];
  skillPreset: SkillPreset;
  idleBuildings: IdleBuilding[];
  missionProgress: MissionProgress[];
  sessionToken: string;
  createdAt: string;
  lastLoginAt: string;
}

const accounts = new Map<string, AccountData>();
const tokenToAccount = new Map<string, string>();

function createDefaultAccount(accountId: string, token: string): AccountData {
  const warrior = CLASSES['warrior'];
  return {
    accountId,
    sessionToken: token,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profile: {
      accountId,
      currentSeasonId: SEASONS[0].id,
      accountLevel: 1,
      gold: 100,
      skillShards: 0,
      seasonTokens: 0,
    },
    character: {
      classId: 'warrior',
      level: 1,
      xp: 0,
      xpToNextLevel: xpForLevel(1),
      stats: {
        hp: warrior.baseStats.hp,
        maxHp: warrior.baseStats.hp,
        attack: warrior.baseStats.attack,
        defense: warrior.baseStats.defense,
        attackSpeed: warrior.baseStats.attackSpeed,
        critChance: warrior.baseStats.critChance,
      },
      equippedItems: {},
    },
    inventory: [],
    skillPreset: {
      skillOrder: [...warrior.skills],
      targetMode: 'boss_first',
      autoHealThreshold: 0.3,
    },
    idleBuildings: [
      {
        id: 'mine',
        buildingType: 'mine',
        level: 1,
        lastCollectedAt: new Date().toISOString(),
      },
    ],
    missionProgress: [
      {
        missionId: 'daily_kill_10',
        progress: 0,
        completed: false,
      },
    ],
  };
}

export function getOrCreateAccount(accountId: string, token: string): AccountData {
  if (!accounts.has(accountId)) {
    const acc = createDefaultAccount(accountId, token);
    accounts.set(accountId, acc);
    tokenToAccount.set(token, accountId);
  }
  return accounts.get(accountId)!;
}

export function getAccountByToken(token: string): AccountData | undefined {
  const accountId = tokenToAccount.get(token);
  if (!accountId) return undefined;
  return accounts.get(accountId);
}

export function saveAccount(data: AccountData): void {
  accounts.set(data.accountId, data);
  tokenToAccount.set(data.sessionToken, data.accountId);
}

export function getAllAccounts(): AccountData[] {
  return Array.from(accounts.values());
}
