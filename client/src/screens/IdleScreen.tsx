import React, { useState } from 'react';
import { useGameStore } from '../store';
import { IDLE_BUILDINGS } from '@idle-arpg/shared/src/gameData';
import { COLORS, styles, NavBar, StatRow } from '../ui';
import { api } from '../api';
import type { PlayerProfile } from '@idle-arpg/shared/src/types';

export default function IdleScreen() {
  const { setScreen, idleBuildings, setIdleBuildings, profile, setProfile } = useGameStore();
  const [collecting, setCollecting] = useState(false);
  const [lastCollected, setLastCollected] = useState<{ gold: number } | null>(null);

  async function collect() {
    setCollecting(true);
    try {
      const result = await api.collectIdle() as { goldCollected: number; newTotal: number };
      setLastCollected({ gold: result.goldCollected });
      if (profile) setProfile({ ...profile, gold: result.newTotal } as PlayerProfile);
      // Refresh buildings
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
      <NavBar title="⛏️ Idle Buildings" onBack={() => setScreen('hub')} />
      <div style={styles.content}>
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
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.gold }}>⛏️ {def.name}</div>
                  <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Level {building.level}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.gold }}>💰 {pendingGold}</div>
                  <div style={{ color: COLORS.textMuted, fontSize: 11 }}>pending</div>
                </div>
              </div>

              {/* Fill bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.textMuted, marginBottom: 3 }}>
                  <span>Storage</span>
                  <span>{(fillPct * 100).toFixed(0)}%</span>
                </div>
                <div style={{ background: '#333', borderRadius: 4, height: 10 }}>
                  <div style={{
                    width: `${fillPct * 100}%`,
                    background: fillPct >= 1 ? COLORS.danger : COLORS.gold,
                    height: '100%',
                    borderRadius: 4,
                    transition: 'width 0.3s',
                  }} />
                </div>
                {fillPct >= 1 && (
                  <div style={{ color: COLORS.danger, fontSize: 11, marginTop: 3 }}>⚠️ Storage full — collect now!</div>
                )}
              </div>

              <StatRow label="Rate" value={`${def.baseRatePerHour * building.level} gold/hr`} />
              <StatRow label="Max storage" value={`${def.maxOfflineHours}h offline`} />
              <StatRow label="Produces" value={def.produces} />
            </div>
          );
        })}

        {lastCollected !== null && (
          <div style={{ ...styles.panel, borderColor: COLORS.success, textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>💰</div>
            <div style={{ color: COLORS.success, fontWeight: 'bold', fontSize: 16 }}>
              Collected {lastCollected.gold} Gold!
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Total: {profile?.gold ?? 0} gold</div>
          </div>
        )}

        <button
          style={{ ...styles.btn, width: '100%', padding: '14px', fontSize: 16, opacity: collecting ? 0.7 : 1 }}
          onClick={collect}
          disabled={collecting}
        >
          {collecting ? 'Collecting...' : '⛏️ Collect Gold'}
        </button>
      </div>
    </div>
  );
}
