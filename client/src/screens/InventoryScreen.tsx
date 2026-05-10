import React from 'react';
import { useGameStore } from '../store';
import { ITEMS } from '@idle-arpg/shared/src/gameData';
import { COLORS, styles, NavBar } from '../ui';
import { api } from '../api';
import type { InventoryItem, CharacterState, ItemDef } from '@idle-arpg/shared/src/types';

const SLOT_ORDER = ['weapon', 'helmet', 'armor', 'gloves', 'legs', 'ring', 'necklace'] as const;
const SLOT_ICONS: Record<string, string> = {
  weapon: '⚔️',
  helmet: '🪖',
  armor: '🛡️',
  gloves: '🧤',
  legs: '👖',
  ring: '💍',
  necklace: '📿',
};

function StatDiff({ newDef, currentDef }: { newDef: ItemDef; currentDef: ItemDef | null }) {
  const stats: Array<keyof ItemDef['stats']> = ['attack', 'defense', 'hp', 'crit'];
  const diffs = stats.map(stat => {
    const newVal = (newDef.stats[stat] as number | undefined) ?? 0;
    const oldVal = currentDef ? ((currentDef.stats[stat] as number | undefined) ?? 0) : 0;
    const diff = newVal - oldVal;
    if (diff === 0 && newVal === 0) return null;
    const label = stat === 'crit'
      ? `${diff >= 0 ? '+' : ''}${(diff * 100).toFixed(0)}% crit`
      : `${diff >= 0 ? '+' : ''}${diff} ${stat}`;
    return { label, positive: diff >= 0 };
  }).filter(Boolean);

  if (diffs.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
      {diffs.map((d, i) => d && (
        <span key={i} style={{
          fontSize: 10,
          color: d.positive ? COLORS.success : COLORS.danger,
          fontWeight: 'bold',
        }}>
          {d.label}
        </span>
      ))}
    </div>
  );
}

export default function InventoryScreen() {
  const { setScreen, inventory, character, setInventory, setCharacter } = useGameStore();

  async function equip(item: InventoryItem) {
    try {
      await api.equipItem(item.id);
      const def = ITEMS[item.itemDefId];
      if (!def || !character) return;
      const newEquipped = { ...character.equippedItems };
      // Unequip existing in slot
      Object.keys(newEquipped).forEach(slot => {
        if (slot === def.slot) delete newEquipped[slot];
      });
      newEquipped[def.slot] = item.id;
      setCharacter({ ...character, equippedItems: newEquipped } as CharacterState);
      setInventory(inventory.map(i => {
        if (i.equippedSlot === def.slot) return { ...i, equippedSlot: undefined };
        if (i.id === item.id) return { ...i, equippedSlot: def.slot };
        return i;
      }));
    } catch (e) {
      console.error('Equip failed', e);
    }
  }

  async function unequip(item: InventoryItem) {
    try {
      await api.unequipItem(item.id);
      if (!character) return;
      const newEquipped = { ...character.equippedItems };
      if (item.equippedSlot) delete newEquipped[item.equippedSlot];
      setCharacter({ ...character, equippedItems: newEquipped } as CharacterState);
      setInventory(inventory.map(i => i.id === item.id ? { ...i, equippedSlot: undefined } : i));
    } catch (e) {
      console.error('Unequip failed', e);
    }
  }

  function getEquippedDefForSlot(slot: string): ItemDef | null {
    const itemId = character?.equippedItems[slot];
    if (!itemId) return null;
    const invItem = inventory.find(i => i.id === itemId);
    if (!invItem) return null;
    return ITEMS[invItem.itemDefId] ?? null;
  }

  // Group by slot
  const equipped = SLOT_ORDER.map(slot => {
    const itemId = character?.equippedItems[slot];
    const item = itemId ? inventory.find(i => i.id === itemId) : undefined;
    return { slot, item };
  });

  const unequippedItems = inventory.filter(i => !i.equippedSlot);

  return (
    <div style={styles.screen}>
      <NavBar title="🎒 Inventory" onBack={() => setScreen('hub')} />
      <div style={styles.content}>
        {/* Equipped slots */}
        <div style={styles.panel}>
          <div style={{ fontWeight: 'bold', color: COLORS.gold, marginBottom: 12 }}>Equipped</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {equipped.map(({ slot, item }) => {
              const def = item ? ITEMS[item.itemDefId] : undefined;
              return (
                <div key={slot} style={{
                  background: COLORS.panelAlt,
                  border: `1px solid ${item ? COLORS.gold : COLORS.border}`,
                  borderRadius: 6,
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{SLOT_ICONS[slot]} {slot}</div>
                    {item && def ? (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 'bold', color: COLORS[item.rarity as keyof typeof COLORS] ?? COLORS.text }}>
                          {def.name}
                        </div>
                        <div style={{ fontSize: 10, color: COLORS.textMuted }}>
                          {Object.entries(def.stats)
                            .filter(([, v]) => v)
                            .map(([k, v]) => `${k}: +${typeof v === 'number' && v < 1 ? (v * 100).toFixed(0) + '%' : v}`)
                            .join(', ')}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>— empty —</div>
                    )}
                  </div>
                  {item && (
                    <button style={{ ...styles.btnDanger, padding: '3px 8px', fontSize: 11 }} onClick={() => unequip(item)}>
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bag items */}
        <div style={styles.panel}>
          <div style={{ fontWeight: 'bold', color: COLORS.gold, marginBottom: 12 }}>
            Bag ({unequippedItems.length} items)
          </div>
          {unequippedItems.length === 0 && (
            <div style={{ color: COLORS.textMuted, fontSize: 13 }}>No items in bag. Go fight some monsters!</div>
          )}
          {unequippedItems.map((item) => {
            const def = ITEMS[item.itemDefId];
            const currentDef = def ? getEquippedDefForSlot(def.slot) : null;
            return (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>{def?.name ?? item.itemDefId}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                    {def?.slot} ·{' '}
                    {def && Object.entries(def.stats)
                      .filter(([, v]) => v)
                      .map(([k, v]) => `${k}: +${typeof v === 'number' && v < 1 ? (v * 100).toFixed(0) + '%' : v}`)
                      .join(', ')}
                  </div>
                  {def && <StatDiff newDef={def} currentDef={currentDef} />}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 8 }}>
                  <span style={styles.tag(item.rarity)}>{item.rarity}</span>
                  <button style={{ ...styles.btn, padding: '4px 10px', fontSize: 11 }} onClick={() => equip(item)}>
                    Equip
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
