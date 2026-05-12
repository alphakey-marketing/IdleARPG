import React, { useState } from 'react';
import { ITEM_SPRITES, SKILL_ICONS, COIN_SPRITE } from './assetMap';
import { ITEMS } from '@idle-arpg/shared/src/gameData';

// ─── Colour palette ──────────────────────────────────────────────────────────
export const COLOURS = {
  bg:             '#0a0a0f',
  panel:          '#1a1a2e',
  panelAlt:       '#16213e',
  panelHighlight: '#1e2040',
  gold:           '#d4a017',
  goldDim:        '#8a6810',
  blue:           '#4a90d9',
  danger:         '#e05c5c',
  success:        '#5ce07a',
  text:           '#e0e0e0',
  textMuted:      '#888888',
  textFaint:      '#444466',
  border:         '#2a2a4a',
  borderBright:   '#4a4a7a',
  common:         '#aaaaaa',
  magic:          '#4a90d9',
  rare:           '#ffd700',
  epic:           '#c060ff',
  legendary:      '#ff8c00',
  seasonal:       '#00e5ff',
} as const;

// Keep COLORS as an alias so existing imports still compile
export const COLORS = COLOURS;

type ColourKey = keyof typeof COLOURS;

// ─── Styles factory ──────────────────────────────────────────────────────────
export const styles = {
  screen: {
    width: '100vw',
    height: '100vh',
    background: COLOURS.bg,
    color: COLOURS.text,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  header: {
    background: COLOURS.panel,
    borderBottom: `1px solid ${COLOURS.border}`,
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  title: {
    color: COLOURS.gold,
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "'Cormorant', serif",
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: 16,
  },
  panel: {
    background: COLOURS.panel,
    border: `1px solid ${COLOURS.border}`,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  panelGold: {
    background: COLOURS.panel,
    border: `1px solid ${COLOURS.gold}`,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    boxShadow: `0 0 10px rgba(212,160,23,0.25)`,
  },
  btn: {
    background: COLOURS.gold,
    color: COLOURS.bg,
    border: 'none',
    borderRadius: 6,
    padding: '8px 18px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  btnSecondary: {
    background: COLOURS.panel,
    color: COLOURS.text,
    border: `1px solid ${COLOURS.border}`,
    borderRadius: 6,
    padding: '8px 18px',
    cursor: 'pointer',
    fontSize: 13,
  },
  btnDanger: {
    background: COLOURS.danger,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 18px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 13,
  },
  btnSuccess: {
    background: COLOURS.success,
    color: COLOURS.bg,
    border: 'none',
    borderRadius: 6,
    padding: '8px 18px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 13,
  },
  navBtn: {
    background: 'transparent',
    color: COLOURS.textMuted,
    border: `1px solid ${COLOURS.border}`,
    borderRadius: 6,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 12,
    marginRight: 6,
  },
  label: {
    color: COLOURS.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  value: {
    color: COLOURS.text,
    fontSize: 14,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums' as const,
  },
  divider: {
    borderTop: `1px solid ${COLOURS.border}`,
    margin: '10px 0',
  },
  tag: (rarity: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    color: COLOURS[rarity as ColourKey] ?? COLOURS.text,
    border: `1px solid ${COLOURS[rarity as ColourKey] ?? COLOURS.border}`,
  }),
};

// ─── NavBar ───────────────────────────────────────────────────────────────────
interface NavBarProps {
  title: string;
  onBack: () => void;
}

export function NavBar({ title, onBack }: NavBarProps) {
  return (
    <div style={styles.header}>
      <button
        style={styles.navBtn}
        onClick={onBack}
        aria-label="Go back"
      >
        &#8592; Back
      </button>
      <span style={styles.title}>{title}</span>
      <span aria-hidden="true" />
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, max, color = COLOURS.blue, height = 10 }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(value / max, 1) * 100 : 0;
  return (
    <div style={{ background: COLOURS.textFaint, borderRadius: 4, height, overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct}%`,
          background: color,
          height: '100%',
          transition: 'width 0.4s ease',
          boxShadow: `0 0 6px ${color}88`,
        }}
      />
    </div>
  );
}

// ─── StatRow ──────────────────────────────────────────────────────────────────
interface StatRowProps {
  label: string;
  value: React.ReactNode;
}

export function StatRow({ label, value }: StatRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
      <span style={{ color: COLOURS.textMuted }}>{label}</span>
      <span style={{ color: COLOURS.text, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

// ─── TileSprite ───────────────────────────────────────────────────────────────
interface TileSpriteProps {
  src: string;
  size?: number;
  scale?: number;
  alt?: string;
  style?: React.CSSProperties;
}

export function TileSprite({ src, size = 16, scale = 1, alt = '', style }: TileSpriteProps) {
  const [errored, setErrored] = useState(false);
  const px = size * scale;
  if (errored) {
    return (
      <div
        role="img"
        aria-label={alt || undefined}
        style={{
          width: px,
          height: px,
          background: COLOURS.panelAlt,
          border: `1px solid ${COLOURS.border}`,
          borderRadius: 2,
          ...style,
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      data-pixel="true"
      width={px}
      height={px}
      onError={() => setErrored(true)}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

// ─── ItemIcon ─────────────────────────────────────────────────────────────────
interface ItemIconProps {
  itemDefId: string;
  size?: number;
}

export function ItemIcon({ itemDefId, size = 32 }: ItemIconProps) {
  const [errored, setErrored] = useState(false);
  const src = ITEM_SPRITES[itemDefId];
  const itemDef = ITEMS[itemDefId];
  const rarity = itemDef?.rarity ?? 'common';
  const scale = Math.max(1, Math.round(size / 16));
  const px = 16 * scale;

  if (errored || !src) {
    return (
      <div
        role="img"
        aria-label={itemDef?.name ?? itemDefId}
        style={{
          width: px,
          height: px,
          background: COLOURS.panelAlt,
          border: `1px solid ${COLOURS.border}`,
          borderRadius: 3,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={itemDef?.name ?? itemDefId}
      data-pixel="true"
      width={px}
      height={px}
      className={`glow-${rarity}`}
      onError={() => setErrored(true)}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
        flexShrink: 0,
        borderRadius: 3,
      }}
    />
  );
}

// ─── SkillIcon ────────────────────────────────────────────────────────────────
interface SkillIconProps {
  skillId: string;
  cooldownPct?: number;
  size?: number;
}

export function SkillIcon({ skillId, cooldownPct = 0, size = 32 }: SkillIconProps) {
  const [errored, setErrored] = useState(false);
  const src = SKILL_ICONS[skillId];

  if (errored || !src) {
    return (
      <div
        role="img"
        aria-label={skillId}
        style={{
          width: size,
          height: size,
          background: COLOURS.panelAlt,
          borderRadius: 6,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <img
        src={src}
        alt={skillId}
        data-pixel="true"
        width={size}
        height={size}
        onError={() => setErrored(true)}
        style={{ imageRendering: 'pixelated', display: 'block' }}
      />
      {cooldownPct > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(0,0,0,${Math.min(0.85, cooldownPct * 0.85)})`,
            borderRadius: 4,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ─── GoldBadge ────────────────────────────────────────────────────────────────
interface GoldBadgeProps {
  amount: number;
}

export function GoldBadge({ amount }: GoldBadgeProps) {
  const [errored, setErrored] = useState(false);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color: COLOURS.gold,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        fontSize: 14,
      }}
    >
      {!errored ? (
        <img
          src={COIN_SPRITE}
          alt=""
          data-pixel="true"
          width={16}
          height={16}
          onError={() => setErrored(true)}
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: COLOURS.gold,
            display: 'inline-block',
          }}
          aria-hidden="true"
        />
      )}
      {amount.toLocaleString()}
    </span>
  );
}

// ─── EnemyTag ─────────────────────────────────────────────────────────────────
interface EnemyTagProps {
  isBoss: boolean;
}

export function EnemyTag({ isBoss }: EnemyTagProps) {
  if (isBoss) {
    return (
      <span
        style={{
          ...styles.tag('legendary'),
          background: `${COLOURS.danger}22`,
          fontFamily: "'KenneyPixel', monospace",
          fontSize: 10,
        }}
      >
        BOSS
      </span>
    );
  }
  return (
    <span
      style={{
        ...styles.tag('common'),
        background: COLOURS.panelAlt,
        fontSize: 10,
      }}
    >
      MOB
    </span>
  );
}

