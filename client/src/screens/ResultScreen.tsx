import React from 'react';
import { useGameStore } from '../store';
import { ITEMS } from '@idle-arpg/shared/src/gameData';
import { COLORS, styles, NavBar } from '../ui';

export default function ResultScreen() {
  const { lastBattleResult, setScreen } = useGameStore();

  if (!lastBattleResult) {
    return (
      <div style={styles.screen}>
        <NavBar title="Battle Result" onBack={() => setScreen('hub')} />
        <div style={styles.content}><p>No result.</p></div>
      </div>
    );
  }

  const { won, xpGained, goldGained, itemsDropped, monstersKilled, stageName } = lastBattleResult;

  return (
    <div style={styles.screen}>
      <NavBar title="Battle Result" onBack={() => setScreen('hub')} />
      <div style={styles.content}>
        <div style={{
          ...styles.panel,
          textAlign: 'center',
          borderColor: won ? COLORS.success : COLORS.danger,
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{won ? '🏆' : '💀'}</div>
          <div style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: won ? COLORS.success : COLORS.danger,
            marginBottom: 4,
          }}>
            {won ? 'VICTORY!' : 'DEFEATED'}
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 13 }}>{stageName}</div>
        </div>

        <div style={styles.panel}>
          <div style={{ fontWeight: 'bold', color: COLORS.gold, marginBottom: 10 }}>Rewards</div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>⭐</div>
              <div style={{ color: COLORS.blue, fontWeight: 'bold' }}>+{xpGained}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 11 }}>XP</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>💰</div>
              <div style={{ color: COLORS.gold, fontWeight: 'bold' }}>+{goldGained}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 11 }}>Gold</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>⚔️</div>
              <div style={{ color: COLORS.text, fontWeight: 'bold' }}>{monstersKilled}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 11 }}>Kills</div>
            </div>
          </div>
        </div>

        {itemsDropped.length > 0 && (
          <div style={styles.panel}>
            <div style={{ fontWeight: 'bold', color: COLORS.gold, marginBottom: 10 }}>Items Dropped</div>
            {itemsDropped.map((item) => {
              const def = ITEMS[item.itemDefId];
              return (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: `1px solid ${COLORS.border}`,
                }}>
                  <span style={{ fontWeight: 'bold' }}>{def?.name ?? item.itemDefId}</span>
                  <span style={styles.tag(item.rarity)}>{item.rarity}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={styles.btn} onClick={() => setScreen('battle')}>
            ⚔️ Battle Again
          </button>
          <button style={styles.btnSecondary} onClick={() => setScreen('hub')}>
            🏠 Hub
          </button>
        </div>
      </div>
    </div>
  );
}
