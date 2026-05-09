import React from 'react';
import { useGameStore } from '../store';
import { COLORS, styles, ProgressBar, StatRow } from '../ui';

const NAV_BUTTONS = [
  { label: '⚔️ Battle', screen: 'battle' },
  { label: '🎒 Inventory', screen: 'inventory' },
  { label: '✨ Skills', screen: 'skills' },
  { label: '⛏️ Mine', screen: 'idle' },
  { label: '📋 Missions', screen: 'missions' },
  { label: '🌿 Season', screen: 'season' },
] as const;

export default function HubScreen() {
  const { setScreen, profile, character } = useGameStore();

  return (
    <div style={styles.screen}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>⚔️ Seasonal Idle ARPG</span>
        <span style={{ color: COLORS.gold, fontWeight: 'bold', fontSize: 14 }}>
          💰 {profile?.gold ?? 0} Gold
        </span>
      </div>

      <div style={styles.content}>
        {/* Character Panel */}
        {character && (
          <div style={styles.panel}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.gold }}>
                  🛡️ Warrior
                </div>
                <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Level {character.level}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13 }}>
                <div style={{ color: COLORS.danger }}>❤️ {character.stats.maxHp} HP</div>
                <div style={{ color: COLORS.blue }}>⚔️ {character.stats.attack} ATK</div>
              </div>
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.textMuted, marginBottom: 3 }}>
                <span>XP</span>
                <span>{character.xp} / {character.xpToNextLevel}</span>
              </div>
              <ProgressBar value={character.xp} max={character.xpToNextLevel} color={COLORS.blue} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
              <StatRow label="DEF" value={character.stats.defense} />
              <StatRow label="SPD" value={character.stats.attackSpeed} />
              <StatRow label="CRIT" value={`${(character.stats.critChance * 100).toFixed(0)}%`} />
            </div>
          </div>
        )}

        {/* Navigation Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {NAV_BUTTONS.map(({ label, screen }) => (
            <button
              key={screen}
              onClick={() => setScreen(screen)}
              style={{
                background: COLORS.panel,
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: '20px 10px',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 'bold',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
