import React, { useState } from 'react';
import { useGameStore } from '../store';
import { IDLE_BUILDINGS } from '@idle-arpg/shared/src/gameData';
import { COLOURS, styles, NavBar, StatRow, ProgressBar, GoldBadge } from '../ui';
import { MINE_TILE } from '../assetMap';
import { api } from '../api';
import type { PlayerProfile } from '@idle-arpg/shared/src/types';

export default function IdleScreen() {
  const { setScreen, idleBuildings, setIdleBuildings, profile, setProfile } = useGameStore();
  const [collecting, setCollecting] = useState(false);
  const [lastCollected, setLastCollected] = useState<{ gold: number } | null>(null);
  const [headerError, setHeaderError] = useState(false);

  async function collect() {
    setCollecting(true);
    try {
      const result = await api.collectIdle() as { goldCollected: number; newTotal: number };
      setLastCollected({ gold: result.goldCollected });
      if (profile) setProfile({ ...profile, gold: result.newTotal } as PlayerProfile);
      const buildings = await api.getIdleBuildings();
      setIdleBuildings(buildings as typeof idleBuildings);
    } catch (e) {
      console.error('Collect failed', e);
    } finally {
      setCollecting(false);
    }
  }

  return (
    <div style={styles.screen}>
      <NavBar title="Idle Buildings" onBack={() => setScreen('hub')} />
      <div style={styles.content}>
        {/* Decorative header sprite */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          {!headerError ? (
            <img
              src={MINE_TILE}
              alt="Mine entrance"
              data-pixel="true"
              width={64}
              height={64}
              onError={() => setHeaderError(true)}
              style={{ imageRendering: 'pixelated', opacity: 0.7 }}
            />
          ) : (
            <div style={{
              display: 'inline-block',
              width: 64,
              height: 64,
              background: COLOURS.panelAlt,
              borderRadius: 4,
            }} aria-hidden="true" />
          )}
        </div>

        {idleBuildings.map((building) => {
          const def = IDLE_BUILDINGS[building.buildingType];
          if (!def) return null;

          const lastCollectedTime = new Date(building.lastCollectedAt).getTime();
          const hoursElapsed = Math.min((Date.now() - lastCollectedTime) / 3600000, def.maxOfflineHours);
          const pendingGold = Math.floor(hoursElapsed * def.baseRatePerHour * building.level);
          const fillPct = hoursElapsed / def.maxOfflineHours;

          return (
            <div key={building.id} style={styles.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 'bold', color: COLOURS.gold, fontFamily: "'Cormorant', serif" }}>
                    {def.name}
                  </div>
                  <div style={{ color: COLOURS.textMuted, fontSize: 12 }}>Level {building.level}</div>
                </div>
                <GoldBadge amount={pendingGold} />
              </div>

              {/* Fill bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLOURS.textMuted, marginBottom: 3 }}>
                  <span>Storage</span>
                  <span>{(fillPct * 100).toFixed(0)}%</span>
                </div>
                <ProgressBar
                  value={fillPct}
                  max={1}
                  color={fillPct >= 1 ? COLOURS.danger : COLOURS.gold}
                  height={10}
                />
                {fillPct >= 1 && (
                  <div style={{ color: COLOURS.danger, fontSize: 11, marginTop: 3 }}>
                    Storage full — collect now!
                  </div>
                )}
              </div>

              <StatRow label="Rate" value={`${def.baseRatePerHour * building.level} gold/hr`} />
              <StatRow label="Max storage" value={`${def.maxOfflineHours}h offline`} />
              <StatRow label="Produces" value={def.produces} />
            </div>
          );
        })}

        {lastCollected !== null && (
          <div style={{ ...styles.panel, borderColor: COLOURS.success, textAlign: 'center' }}>
            <GoldBadge amount={lastCollected.gold} />
            <div style={{ color: COLOURS.success, fontWeight: 'bold', fontSize: 15, marginTop: 4 }}>
              Collected!
            </div>
            <div style={{ color: COLOURS.textMuted, fontSize: 12 }}>Total: {profile?.gold ?? 0} gold</div>
          </div>
        )}

        <button
          style={{ ...styles.btn, width: '100%', padding: '14px', fontSize: 15, opacity: collecting ? 0.7 : 1 }}
          onClick={collect}
          disabled={collecting}
        >
          {collecting ? 'Collecting...' : 'Collect Gold'}
        </button>
      </div>
    </div>
  );
}
