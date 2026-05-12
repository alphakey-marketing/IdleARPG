import React, { useState } from 'react';
import { useGameStore } from '../store';
import { SKILLS } from '@idle-arpg/shared/src/gameData';
import { COLOURS, styles, NavBar, SkillIcon } from '../ui';
import { api } from '../api';
import type { SkillPreset } from '@idle-arpg/shared/src/types';

const TARGET_MODES = ['boss_first', 'lowest_hp', 'closest'] as const;
const TARGET_LABELS: Record<string, string> = {
  boss_first: 'Boss First',
  lowest_hp:  'Lowest HP',
  closest:    'Closest',
};

export default function SkillsScreen() {
  const { setScreen, skillPreset, setSkillPreset } = useGameStore();
  const [saving, setSaving] = useState(false);
  const [localPreset, setLocalPreset] = useState<SkillPreset | null>(skillPreset);

  if (!localPreset) return null;

  async function save() {
    if (!localPreset) return;
    setSaving(true);
    try {
      await api.updateSkillPreset(localPreset);
      setSkillPreset(localPreset);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  }

  function moveSkill(from: number, to: number) {
    const order = [...localPreset!.skillOrder];
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    setLocalPreset({ ...localPreset!, skillOrder: order });
  }

  return (
    <div style={styles.screen}>
      <NavBar title="Skills" onBack={() => setScreen('hub')} />
      <div style={styles.content}>
        <div style={styles.panel}>
          <div style={{ fontWeight: 'bold', color: COLOURS.gold, marginBottom: 12, fontFamily: "'Cormorant', serif", fontSize: 16 }}>
            Skill Priority Order
          </div>
          <p style={{ fontSize: 12, color: COLOURS.textMuted, marginBottom: 12 }}>
            Skills are used in priority order (top to bottom). Use arrows to reorder.
          </p>
          {localPreset.skillOrder.map((skillId, i) => {
            const skill = SKILLS[skillId];
            if (!skill) return null;
            return (
              <div key={skillId} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px',
                background: COLOURS.panelAlt,
                borderRadius: 8,
                marginBottom: 8,
                border: `1px solid ${COLOURS.border}`,
              }}>
                <span style={{ color: COLOURS.gold, fontWeight: 'bold', fontSize: 14, minWidth: 20, fontFamily: "'Cormorant', serif" }}>
                  #{i + 1}
                </span>
                <SkillIcon skillId={skillId} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 13 }}>{skill.name}</div>
                  <div style={{ fontSize: 11, color: COLOURS.textMuted }}>{skill.description}</div>
                  <div style={{ fontSize: 10, color: COLOURS.blue, marginTop: 3 }}>
                    CD: {skill.cooldown}t · Cost: {skill.resourceCost} · Dmg: {skill.damage}
                    {skill.stunDuration ? ` · Stun: ${skill.stunDuration}t` : ''}
                    {skill.buffDuration ? ` · Buff: ${skill.buffDuration}t` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button
                    style={{ ...styles.btnSecondary, padding: '2px 8px', fontSize: 12 }}
                    disabled={i === 0}
                    onClick={() => moveSkill(i, i - 1)}
                  >Up</button>
                  <button
                    style={{ ...styles.btnSecondary, padding: '2px 8px', fontSize: 12 }}
                    disabled={i === localPreset.skillOrder.length - 1}
                    onClick={() => moveSkill(i, i + 1)}
                  >Dn</button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.panel}>
          <div style={{ fontWeight: 'bold', color: COLOURS.gold, marginBottom: 12 }}>Target Mode</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TARGET_MODES.map(mode => (
              <button
                key={mode}
                onClick={() => setLocalPreset({ ...localPreset, targetMode: mode })}
                style={{
                  ...styles.btnSecondary,
                  borderColor: localPreset.targetMode === mode ? COLOURS.gold : COLOURS.border,
                  color: localPreset.targetMode === mode ? COLOURS.gold : COLOURS.text,
                }}
              >
                {TARGET_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        <button
          style={{ ...styles.btn, opacity: saving ? 0.7 : 1 }}
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Preset'}
        </button>
      </div>
    </div>
  );
}
