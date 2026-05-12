import React, { useState } from 'react';
import { useGameStore } from '../store';
import { COLOURS, styles, ProgressBar, StatRow, TileSprite, GoldBadge } from '../ui';
import { CHAR_SPRITES, NAV_ICONS } from '../assetMap';

const NAV_BUTTONS = [
  { label: 'Battle',    screen: 'battle',    iconKey: 'battle' },
  { label: 'Inventory', screen: 'inventory', iconKey: 'inventory' },
  { label: 'Skills',    screen: 'skills',    iconKey: 'skills' },
  { label: 'Mine',      screen: 'idle',      iconKey: 'idle' },
  { label: 'Missions',  screen: 'missions',  iconKey: 'missions' },
  { label: 'Season',    screen: 'season',    iconKey: 'season' },
] as const;

export default function HubScreen() {
  const { setScreen, profile, character } = useGameStore();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={styles.screen}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>Seasonal Idle ARPG</span>
        {profile && <GoldBadge amount={profile.gold} />}
      </div>

      <div style={styles.content}>
        {/* Character Panel */}
        {character && (
          <div style={styles.panelGold}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
              <TileSprite
                src={CHAR_SPRITES['warrior'] ?? ''}
                size={16}
                scale={5}
                alt="Warrior character"
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: COLOURS.gold,
                  fontFamily: "'Cormorant', serif",
                  lineHeight: 1.1,
                }}>
                  Warrior
                </div>
                <div style={{ color: COLOURS.textMuted, fontSize: 13 }}>Level {character.level}</div>
              </div>
              <GoldBadge amount={profile?.gold ?? 0} />
            </div>

            {/* XP bar */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLOURS.textMuted, marginBottom: 3 }}>
                <span>XP</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {character.xp} / {character.xpToNextLevel}
                </span>
              </div>
              <ProgressBar value={character.xp} max={character.xpToNextLevel} color={COLOURS.blue} height={8} />
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              <StatRow label="ATK" value={character.stats.attack} />
              <StatRow label="DEF" value={character.stats.defense} />
              <StatRow label="SPD" value={character.stats.attackSpeed} />
              <StatRow label="CRIT" value={`${(character.stats.critChance * 100).toFixed(0)}%`} />
            </div>
          </div>
        )}

        {/* Navigation Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {NAV_BUTTONS.map(({ label, screen, iconKey }) => {
            const isHovered = hovered === screen;
            return (
              <button
                key={screen}
                onClick={() => setScreen(screen)}
                onMouseEnter={() => setHovered(screen)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: COLOURS.panel,
                  color: isHovered ? COLOURS.gold : COLOURS.text,
                  border: `1px solid ${isHovered ? COLOURS.gold : COLOURS.border}`,
                  borderRadius: 10,
                  padding: '16px 10px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                  boxShadow: isHovered ? `0 4px 12px rgba(212,160,23,0.2)` : 'none',
                }}
              >
                <TileSprite
                  src={NAV_ICONS[iconKey] ?? ''}
                  size={20}
                  scale={1}
                  alt=""
                  style={{ opacity: isHovered ? 1 : 0.7 }}
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
