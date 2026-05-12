import React from 'react';
import { useGameStore } from '../store';
import { ITEMS } from '@idle-arpg/shared/src/gameData';
import { COLOURS, styles, NavBar, ItemIcon, GoldBadge } from '../ui';

export default function ResultScreen() {
  const { lastBattleResult, setScreen, setPendingBattleStage } = useGameStore();

  if (!lastBattleResult) {
    return (
      <div style={styles.screen}>
        <NavBar title="Battle Result" onBack={() => setScreen('hub')} />
        <div style={styles.content}><p>No result.</p></div>
      </div>
    );
  }

  const { won, xpGained, goldGained, itemsDropped, monstersKilled, stageName, stageId } = lastBattleResult;

  function handleRepeat() {
    setPendingBattleStage({ stageId, stageName });
    setScreen('battle');
  }

  return (
    <div style={styles.screen}>
      <NavBar title="Battle Result" onBack={() => setScreen('hub')} />
      <div style={styles.content}>
        {/* Victory / Defeat header */}
        <div style={{
          ...styles.panel,
          textAlign: 'center',
          borderColor: won ? COLOURS.success : COLOURS.danger,
        }}>
          <div style={{
            fontSize: 34,
            fontWeight: 'bold',
            fontFamily: "'KenneyFuture', monospace",
            color: won ? COLOURS.success : COLOURS.danger,
            marginBottom: 4,
          }}>
            {won ? 'VICTORY!' : 'DEFEATED'}
          </div>
          <div style={{ color: COLOURS.textMuted, fontSize: 13 }}>{stageName}</div>
        </div>

        {/* Rewards */}
        <div style={styles.panel}>
          <div style={{ fontWeight: 'bold', color: COLOURS.gold, marginBottom: 12, fontFamily: "'Cormorant', serif", fontSize: 16 }}>
            Rewards
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: COLOURS.blue, fontWeight: 'bold', fontSize: 18 }}>+{xpGained}</div>
              <div style={{ color: COLOURS.textMuted, fontSize: 11 }}>XP</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <GoldBadge amount={goldGained} />
              <div style={{ color: COLOURS.textMuted, fontSize: 11 }}>Gold</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: COLOURS.text, fontWeight: 'bold', fontSize: 18 }}>{monstersKilled}</div>
              <div style={{ color: COLOURS.textMuted, fontSize: 11 }}>Kills</div>
            </div>
          </div>
        </div>

        {/* Items dropped */}
        {itemsDropped.length > 0 && (
          <div style={styles.panel}>
            <div style={{ fontWeight: 'bold', color: COLOURS.gold, marginBottom: 12, fontFamily: "'Cormorant', serif", fontSize: 16 }}>
              Items Dropped ({itemsDropped.length})
            </div>
            {itemsDropped.map((item) => {
              const def = ITEMS[item.itemDefId];
              const statsText = def
                ? Object.entries(def.stats)
                    .filter(([, v]) => v)
                    .map(([k, v]) => `+${typeof v === 'number' && v < 1 ? (v * 100).toFixed(0) + '%' : v} ${k.toUpperCase()}`)
                    .join(' · ')
                : '';
              return (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: `1px solid ${COLOURS.border}`,
                }}>
                  <ItemIcon itemDefId={item.itemDefId} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontWeight: 'bold',
                        fontSize: 13,
                        color: COLOURS[item.rarity as keyof typeof COLOURS] ?? COLOURS.text,
                      }}>
                        {def?.name ?? item.itemDefId}
                      </span>
                      <span style={styles.tag(item.rarity)}>{item.rarity}</span>
                    </div>
                    {def && (
                      <div style={{ fontSize: 11, color: COLOURS.textMuted, marginTop: 2 }}>
                        {def.slot}{statsText ? ` · ${statsText}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {won ? (
            <>
              <button style={styles.btn} onClick={handleRepeat}>
                Repeat Stage
              </button>
              <button style={styles.btnSecondary} onClick={() => setScreen('hub')}>
                Return to Hub
              </button>
            </>
          ) : (
            <>
              <button style={styles.btn} onClick={handleRepeat}>
                Retry
              </button>
              <button style={styles.btnSecondary} onClick={() => setScreen('hub')}>
                Return to Hub
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
