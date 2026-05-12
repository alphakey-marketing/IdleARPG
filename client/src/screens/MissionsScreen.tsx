import React, { useState } from 'react';
import { useGameStore } from '../store';
import { COLOURS, styles, NavBar, ProgressBar, GoldBadge } from '../ui';
import { api } from '../api';
import type { PlayerProfile } from '@idle-arpg/shared/src/types';

export default function MissionsScreen() {
  const { setScreen, missionProgress, setMissionProgress, profile, setProfile } = useGameStore();
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<{ missionId: string; gold?: number; xp?: number } | null>(null);

  async function claim(missionId: string) {
    setClaiming(missionId);
    try {
      const result = await api.claimMission(missionId) as { success: boolean; reward: { gold?: number; xp?: number } };
      setClaimResult({ missionId, ...result.reward });
      setMissionProgress(
        missionProgress.map(m => m.missionId === missionId
          ? { ...m, claimedAt: new Date().toISOString() }
          : m
        )
      );
      if (result.reward.gold && profile) {
        setProfile({ ...profile, gold: profile.gold + result.reward.gold } as PlayerProfile);
      }
    } catch (e) {
      console.error('Claim failed', e);
    } finally {
      setClaiming(null);
    }
  }

  return (
    <div style={styles.screen}>
      <NavBar title="Daily Missions" onBack={() => setScreen('hub')} />
      <div style={styles.content}>
        <p style={{ color: COLOURS.textMuted, fontSize: 13, marginBottom: 16 }}>
          Complete missions to earn bonus rewards. Resets daily.
        </p>

        {missionProgress.length === 0 && (
          <div style={{ color: COLOURS.textMuted }}>No missions available.</div>
        )}

        {missionProgress.map((mp) => {
          const def = mp.definition;
          if (!def) return null;
          const objective = def.objective as { type: string; count?: number };
          const max = objective.count ?? 1;
          const isComplete = mp.completed;
          const isClaimed = !!mp.claimedAt;

          return (
            <div key={mp.missionId} style={{
              ...styles.panel,
              borderColor: isComplete ? (isClaimed ? COLOURS.border : COLOURS.success) : COLOURS.border,
              opacity: isClaimed ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 15, fontFamily: "'Cormorant', serif" }}>{def.name}</div>
                  <div style={{ color: COLOURS.textMuted, fontSize: 12, marginTop: 2 }}>{def.description}</div>
                </div>
                <span style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: COLOURS.panelAlt,
                  color: isClaimed ? COLOURS.success : (isComplete ? COLOURS.gold : COLOURS.textMuted),
                  fontWeight: 'bold',
                }}>
                  {isClaimed ? 'Claimed' : isComplete ? 'Complete' : 'In Progress'}
                </span>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLOURS.textMuted, marginBottom: 3 }}>
                  <span>Progress</span>
                  <span>{Math.min(mp.progress, max)} / {max}</span>
                </div>
                <ProgressBar value={mp.progress} max={max} color={isComplete ? COLOURS.success : COLOURS.blue} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: COLOURS.gold, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>Reward:</span>
                  {def.reward.gold ? <GoldBadge amount={def.reward.gold} /> : null}
                  {def.reward.xp ? <span style={{ color: COLOURS.blue }}>+{def.reward.xp} XP</span> : null}
                </div>
                {isComplete && !isClaimed && (
                  <button
                    style={{
                      ...styles.btnSuccess,
                      padding: '6px 14px',
                      opacity: claiming === mp.missionId ? 0.7 : 1,
                      boxShadow: `0 0 10px rgba(92,224,122,0.4)`,
                    }}
                    onClick={() => claim(mp.missionId)}
                    disabled={!!claiming}
                  >
                    {claiming === mp.missionId ? 'Claiming...' : 'Claim'}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {claimResult && (
          <div style={{ ...styles.panel, borderColor: COLOURS.success, textAlign: 'center' }}>
            <div style={{ color: COLOURS.success, fontWeight: 'bold', marginBottom: 4 }}>Reward Claimed!</div>
            {claimResult.gold && <GoldBadge amount={claimResult.gold} />}
            {claimResult.xp && <div style={{ color: COLOURS.blue }}>+{claimResult.xp} XP</div>}
          </div>
        )}
      </div>
    </div>
  );
}

