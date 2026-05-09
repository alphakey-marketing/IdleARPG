import React, { useMemo } from 'react';
import { useGameStore } from '../store';
import { COLORS, styles, NavBar, ProgressBar } from '../ui';

export default function SeasonScreen() {
  const { setScreen, currentSeason } = useGameStore();

  const timeRemaining = useMemo(() => {
    if (!currentSeason) return null;
    const end = new Date(currentSeason.endDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, end - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes, total: diff };
  }, [currentSeason]);

  const seasonProgress = useMemo(() => {
    if (!currentSeason || !timeRemaining) return 0;
    const start = new Date(currentSeason.startDate).getTime();
    const end = new Date(currentSeason.endDate).getTime();
    const total = end - start;
    const elapsed = Date.now() - start;
    return Math.min(elapsed / total, 1);
  }, [currentSeason, timeRemaining]);

  if (!currentSeason) return null;

  const SEASON_PHASES = [
    { name: 'Early Game', description: 'Learn the basics. Farm Forest Path, unlock gear slots.', icon: '🌱' },
    { name: 'Mid Game', description: 'Push to Stage 3. Challenge the Forest Troll boss.', icon: '⚔️' },
    { name: 'End Game', description: 'Optimize your build. Farm boss drops and max out stats.', icon: '🏆' },
  ];

  return (
    <div style={styles.screen}>
      <NavBar title="🌿 Season" onBack={() => setScreen('hub')} />
      <div style={styles.content}>
        {/* Season header */}
        <div style={{ ...styles.panel, textAlign: 'center', borderColor: COLORS.success }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌲</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.success, marginBottom: 4 }}>
            {currentSeason.name}
          </div>
          {currentSeason.modifier && (
            <div style={{ color: COLORS.blue, fontSize: 13, marginBottom: 8 }}>
              Modifier: {currentSeason.modifier}
            </div>
          )}
        </div>

        {/* Time remaining */}
        {timeRemaining && (
          <div style={styles.panel}>
            <div style={{ fontWeight: 'bold', color: COLORS.gold, marginBottom: 12 }}>Season Timer</div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 14 }}>
              {[
                { val: timeRemaining.days, label: 'Days' },
                { val: timeRemaining.hours, label: 'Hours' },
                { val: timeRemaining.minutes, label: 'Minutes' },
              ].map(({ val, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.gold }}>{val}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Season Progress</div>
            <ProgressBar value={seasonProgress} max={1} color={COLORS.success} height={12} />
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, textAlign: 'right' }}>
              {(seasonProgress * 100).toFixed(1)}% complete
            </div>
          </div>
        )}

        {/* Season phases */}
        <div style={styles.panel}>
          <div style={{ fontWeight: 'bold', color: COLORS.gold, marginBottom: 12 }}>Season Phases</div>
          {SEASON_PHASES.map((phase, i) => {
            const phaseProgress = seasonProgress;
            const phaseStart = i / SEASON_PHASES.length;
            const isActive = phaseProgress >= phaseStart && phaseProgress < (i + 1) / SEASON_PHASES.length;
            const isDone = phaseProgress >= (i + 1) / SEASON_PHASES.length;

            return (
              <div key={phase.name} style={{
                display: 'flex',
                gap: 12,
                padding: '10px',
                borderRadius: 8,
                marginBottom: 8,
                background: isActive ? COLORS.panelAlt : 'transparent',
                border: `1px solid ${isActive ? COLORS.gold : COLORS.border}`,
                opacity: isDone ? 0.5 : 1,
              }}>
                <div style={{ fontSize: 24 }}>{isDone ? '✅' : phase.icon}</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: isActive ? COLORS.gold : COLORS.text }}>
                    Phase {i + 1}: {phase.name}
                    {isActive && <span style={{ fontSize: 11, color: COLORS.gold }}> ← Current</span>}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>{phase.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Season reset info */}
        <div style={{ ...styles.panel, borderColor: COLORS.danger }}>
          <div style={{ fontWeight: 'bold', color: COLORS.danger, marginBottom: 8 }}>⚠️ Season Reset</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>
            When the season ends, character progression resets. Your account level and cosmetics are preserved.
            Each new season introduces a unique modifier that changes gameplay.
          </div>
        </div>
      </div>
    </div>
  );
}
