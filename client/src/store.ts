import { create } from 'zustand';
import type { CharacterState, InventoryItem, SkillPreset, IdleBuilding, PlayerProfile, MissionProgress, SeasonDef } from '@idle-arpg/shared/src/types';

export type Screen = 'hub' | 'battle' | 'result' | 'inventory' | 'skills' | 'idle' | 'missions' | 'season';

interface MissionProgressWithDef extends MissionProgress {
  definition?: {
    id: string;
    name: string;
    description: string;
    type: string;
    objective: { type: string; count?: number };
    reward: { gold?: number; xp?: number };
  };
}

interface GameState {
  screen: Screen;
  accountId: string | null;
  profile: PlayerProfile | null;
  character: CharacterState | null;
  inventory: InventoryItem[];
  skillPreset: SkillPreset | null;
  idleBuildings: IdleBuilding[];
  missionProgress: MissionProgressWithDef[];
  currentSeason: SeasonDef | null;
  lastBattleResult: BattleResultData | null;
  pendingBattleStage: { stageId: string; stageName: string } | null;
  isLoading: boolean;

  setScreen: (s: Screen) => void;
  setAccountId: (id: string) => void;
  setProfile: (p: PlayerProfile) => void;
  setCharacter: (c: CharacterState) => void;
  setInventory: (inv: InventoryItem[]) => void;
  setSkillPreset: (p: SkillPreset) => void;
  setIdleBuildings: (b: IdleBuilding[]) => void;
  setMissionProgress: (m: MissionProgressWithDef[]) => void;
  setCurrentSeason: (s: SeasonDef) => void;
  setLastBattleResult: (r: BattleResultData | null) => void;
  setPendingBattleStage: (s: { stageId: string; stageName: string } | null) => void;
  setLoading: (v: boolean) => void;
}

export interface BattleResultData {
  won: boolean;
  xpGained: number;
  goldGained: number;
  itemsDropped: InventoryItem[];
  monstersKilled: number;
  stageId: string;
  stageName: string;
  newLevel?: number;
  newGold?: number;
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'hub',
  accountId: null,
  profile: null,
  character: null,
  inventory: [],
  skillPreset: null,
  idleBuildings: [],
  missionProgress: [],
  currentSeason: null,
  lastBattleResult: null,
  pendingBattleStage: null,
  isLoading: true,

  setScreen: (screen) => set({ screen }),
  setAccountId: (accountId) => set({ accountId }),
  setProfile: (profile) => set({ profile }),
  setCharacter: (character) => set({ character }),
  setInventory: (inventory) => set({ inventory }),
  setSkillPreset: (skillPreset) => set({ skillPreset }),
  setIdleBuildings: (idleBuildings) => set({ idleBuildings }),
  setMissionProgress: (missionProgress: MissionProgressWithDef[]) => set({ missionProgress }),
  setCurrentSeason: (currentSeason: SeasonDef) => set({ currentSeason }),
  setLastBattleResult: (lastBattleResult: BattleResultData | null) => set({ lastBattleResult }),
  setPendingBattleStage: (pendingBattleStage: { stageId: string; stageName: string } | null) => set({ pendingBattleStage }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
