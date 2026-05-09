import React, { useEffect } from 'react';
import { useGameStore } from './store';
import { login, api } from './api';
import HubScreen from './screens/HubScreen';
import BattleScreen from './screens/BattleScreen';
import ResultScreen from './screens/ResultScreen';
import InventoryScreen from './screens/InventoryScreen';
import SkillsScreen from './screens/SkillsScreen';
import IdleScreen from './screens/IdleScreen';
import MissionsScreen from './screens/MissionsScreen';
import SeasonScreen from './screens/SeasonScreen';
import type { PlayerProfile, CharacterState, InventoryItem, SkillPreset, IdleBuilding, SeasonDef } from '@idle-arpg/shared/src/types';

export default function App() {
  const {
    screen,
    isLoading,
    setLoading,
    setAccountId,
    setProfile,
    setCharacter,
    setInventory,
    setSkillPreset,
    setIdleBuildings,
    setMissionProgress,
    setCurrentSeason,
  } = useGameStore();

  useEffect(() => {
    async function init() {
      try {
        const { accountId } = await login();
        setAccountId(accountId);
        const [profile, character, inventory, skillPreset, buildings, missions, season] = await Promise.all([
          api.getProfile(),
          api.getCharacter(),
          api.getInventory(),
          api.getSkillPreset(),
          api.getIdleBuildings(),
          api.getDailyMissions(),
          api.getCurrentSeason(),
        ]);
        setProfile(profile as PlayerProfile);
        setCharacter(character as CharacterState);
        setInventory(inventory as InventoryItem[]);
        setSkillPreset(skillPreset as SkillPreset);
        setIdleBuildings(buildings as IdleBuilding[]);
        setMissionProgress(missions as Parameters<typeof setMissionProgress>[0]);
        setCurrentSeason(season as SeasonDef);
      } catch (e) {
        console.error('Init failed', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 24, color: '#d4a017' }}>
        Loading...
      </div>
    );
  }

  const screens: Record<string, React.ReactElement> = {
    hub: <HubScreen />,
    battle: <BattleScreen />,
    result: <ResultScreen />,
    inventory: <InventoryScreen />,
    skills: <SkillsScreen />,
    idle: <IdleScreen />,
    missions: <MissionsScreen />,
    season: <SeasonScreen />,
  };

  return screens[screen] ?? <HubScreen />;
}
