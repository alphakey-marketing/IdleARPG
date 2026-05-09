import React, { useState } from 'react';
import { useGameStore } from '../store';
import { MAPS, ITEMS } from '@idle-arpg/shared/src/gameData';
import { COLORS, styles, NavBar } from '../ui';
import PhaserBattle from './PhaserBattle';
import type { CharacterState } from '@idle-arpg/shared/src/types';

type BattlePhase = 'select' | 'fighting';

const MAX_RESOURCE = 100;

export default function BattleScreen() {
  const { setScreen, character, skillPreset, inventory, setLastBattleResult, setCharacter, setInventory, setProfile, profile } = useGameStore();
  const [phase, setPhase] = useState<BattlePhase>('select');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedStageName, setSelectedStageName] = useState<string>('');

  const allMaps = Object.values(MAPS);

  function getEffectiveStats() {
    if (!character) return character;
    const stats = { ...character.stats };
    // Apply equipped item bonuses
    Object.values(character.equippedItems).forEach(itemId => {
      if (!itemId) return;
      const invItem = inventory.find(i => i.id === itemId);
      if (!invItem) return;
      const def = ITEMS[invItem.itemDefId];
      if (!def) return;
      if (def.stats.attack) stats.attack += def.stats.attack;
      if (def.stats.defense) stats.defense += def.stats.defense;
      if (def.stats.hp) { stats.maxHp += def.stats.hp; stats.hp += def.stats.hp; }
      if (def.stats.crit) stats.critChance += def.stats.crit;
    });
    return stats;
  }

  function startBattle(stageId: string, stageName: string) {
    setSelectedStageId(stageId);
    setSelectedStageName(stageName);
    setPhase('fighting');
  }

  function onBattleComplete(result: {
    won: boolean;
    xpGained: number;
    goldGained: number;
    itemsDropped: { id: string; itemDefId: string; rarity: string }[];
    monstersKilled: number;
    stageId: string;
    stageName: string;
  }) {
    import('../api').then(({ api }) => {
      api.submitBattleResult({
        won: result.won,
        xpGained: result.xpGained,
        goldGained: result.goldGained,
        itemsDropped: result.itemsDropped,
        monstersKilled: result.monstersKilled,
        stageId: result.stageId,
      }).then((serverResult) => {
        const sr = serverResult as { newLevel?: number; newXp?: number; newGold?: number; newStats?: CharacterState['stats'] };
        if (character && sr.newStats) {
          setCharacter({
            ...character,
            level: sr.newLevel ?? character.level,
            xp: sr.newXp ?? character.xp,
            stats: sr.newStats,
          });
        }
        if (profile && sr.newGold !== undefined) {
          setProfile({ ...profile, gold: sr.newGold });
        }
        if (result.itemsDropped.length > 0) {
          const currentInv = useGameStore.getState().inventory;
          setInventory([...currentInv, ...result.itemsDropped as typeof currentInv]);
        }
      }).catch(console.error);
    });

    setLastBattleResult({ ...result, itemsDropped: result.itemsDropped as ReturnType<typeof useGameStore.getState>['inventory'] });
    setScreen('result');
  }

  if (phase === 'fighting' && character && skillPreset) {
    const effectiveStats = getEffectiveStats();
    if (!effectiveStats) return null;
    return (
      <PhaserBattle
        stageId={selectedStageId}
        stageName={selectedStageName}
        playerStats={{
          hp: effectiveStats.maxHp,
          maxHp: effectiveStats.maxHp,
          attack: effectiveStats.attack,
          defense: effectiveStats.defense,
          attackSpeed: effectiveStats.attackSpeed,
          critChance: effectiveStats.critChance,
          ticksUntilAttack: effectiveStats.attackSpeed,
          resource: 50,
          maxResource: MAX_RESOURCE,
        }}
        skillOrder={skillPreset.skillOrder}
        targetMode={skillPreset.targetMode}
        onComplete={onBattleComplete}
      />
    );
  }

  return (
    <div style={styles.screen}>
      <NavBar title="⚔️ Battle" onBack={() => setScreen('hub')} />
      <div style={styles.content}>
        <p style={{ color: COLORS.textMuted, marginBottom: 16, fontSize: 13 }}>
          Select a stage to begin auto-battle. Your warrior will fight automatically.
        </p>
        {allMaps.map((map) => (
          <div key={map.id} style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 'bold', color: COLORS.gold, fontSize: 15, marginBottom: 8 }}>
              🗺️ {map.name}
            </div>
            {map.stages.map((stage) => (
              <div
                key={stage.id}
                style={{
                  ...styles.panel,
                  cursor: 'pointer',
                  border: `1px solid ${stage.isBoss ? COLORS.danger : COLORS.border}`,
                  transition: 'border-color 0.2s',
                  marginBottom: 8,
                }}
                onClick={() => startBattle(stage.id, stage.name)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 15, color: stage.isBoss ? COLORS.danger : COLORS.text }}>
                    {stage.isBoss ? '👹 ' : '⚔️ '}{stage.name}
                  </div>
                  {stage.isBoss && (
                    <span style={{ ...styles.tag('legendary'), fontSize: 11 }}>BOSS</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                  {stage.enemies.map(({ enemyId, count }) => `${count}× ${enemyId.replace(/_/g, ' ')}`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
