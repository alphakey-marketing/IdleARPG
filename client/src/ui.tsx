import React from 'react';

export const COLORS = {
  bg: '#0a0a0f',
  panel: '#1a1a2e',
  panelAlt: '#16213e',
  gold: '#d4a017',
  blue: '#4a90d9',
  danger: '#e05c5c',
  success: '#5ce07a',
  text: '#e0e0e0',
  textMuted: '#888',
  border: '#2a2a4a',
  common: '#aaa',
  magic: '#4a90d9',
  rare: '#ffd700',
  epic: '#c060ff',
  legendary: '#ff8c00',
  seasonal: '#00e5ff',
};

export const styles = {
  screen: {
    width: '100vw',
    height: '100vh',
    background: COLORS.bg,
    color: COLORS.text,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  header: {
    background: COLORS.panel,
    borderBottom: `1px solid ${COLORS.border}`,
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  title: {
    color: COLORS.gold,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: 20,
  },
  panel: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  btn: {
    background: COLORS.gold,
    color: '#0a0a0f',
    border: 'none',
    borderRadius: 6,
    padding: '8px 18px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnSecondary: {
    background: COLORS.panel,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '8px 18px',
    cursor: 'pointer',
    fontSize: 14,
  },
  btnDanger: {
    background: COLORS.danger,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 18px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnSuccess: {
    background: COLORS.success,
    color: '#0a0a0f',
    border: 'none',
    borderRadius: 6,
    padding: '8px 18px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 14,
  },
  navBtn: {
    background: 'transparent',
    color: COLORS.textMuted,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 12,
    marginRight: 6,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  value: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  tag: (rarity: string) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS[rarity as keyof typeof COLORS] ?? COLORS.text,
    border: `1px solid ${COLORS[rarity as keyof typeof COLORS] ?? COLORS.border}`,
  }),
};

interface NavBarProps {
  title: string;
  onBack: () => void;
}

export function NavBar({ title, onBack }: NavBarProps) {
  return (
    <div style={styles.header}>
      <button style={styles.navBtn} onClick={onBack}>← Back</button>
      <span style={styles.title}>{title}</span>
      <span />
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, max, color = COLORS.blue, height = 10 }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(value / max, 1) * 100 : 0;
  return (
    <div style={{ background: '#333', borderRadius: 4, height, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, background: color, height: '100%', transition: 'width 0.3s' }} />
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: React.ReactNode;
}

export function StatRow({ label, value }: StatRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
      <span style={{ color: COLORS.textMuted }}>{label}</span>
      <span style={{ color: COLORS.text, fontWeight: 'bold' }}>{value}</span>
    </div>
  );
}
