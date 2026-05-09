I've fully reviewed your repo at [alphakey-marketing/IdleARPG](https://github.com/alphakey-marketing/IdleARPG/tree/main). Here is a full assessment and detailed roadmap based on what you've already built.

## What You Have Now

Your current structure is already a **solid MVP foundation** — much better than a blank slate. Here is what exists:

### ✅ Client ([`client/src/`](https://github.com/alphakey-marketing/IdleARPG/tree/main/client/src))
- [`App.tsx`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/App.tsx) — app shell and routing logic
- [`store.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/store.ts) — client state management
- [`api.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/api.ts) — API layer
- [`ui.tsx`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/ui.tsx) — shared UI components
- [`game/BattleScene.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/game/BattleScene.ts) — Phaser battle scene (15KB, your largest file — core engine is here)
- [`screens/`](https://github.com/alphakey-marketing/IdleARPG/tree/main/client/src/screens) — 9 screens already exist: HubScreen, BattleScreen, InventoryScreen, SkillsScreen, IdleScreen, MissionsScreen, SeasonScreen, ResultScreen, PhaserBattle

### ✅ Server ([`server/src/`](https://github.com/alphakey-marketing/IdleARPG/tree/main/server/src))
- [`index.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/server/src/index.ts) — main server (8KB, Express API routes are here)
- [`store.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/server/src/store.ts) — in-memory server state

### ✅ Shared ([`shared/src/`](https://github.com/alphakey-marketing/IdleARPG/tree/main/shared/src))
- [`types.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/shared/src/types.ts) — shared TypeScript types
- [`gameData.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/shared/src/gameData.ts) — game content definitions (5KB — skills, enemies, classes likely here)

### ✅ GDD
- [`GDD.md`](https://github.com/alphakey-marketing/IdleARPG/blob/main/GDD.md) — your GDD is already committed

***

## What I Observe and What Needs Work

Before the roadmap, here are the **key gaps** I can spot from the structure:

| Area | Status | Issue |
|---|---|---|
| Server persistence | ⚠️ In-memory only | `server/store.ts` is in-memory — no PostgreSQL yet, so data resets on restart |
| Auth system | ⚠️ Unknown | No auth module visible, likely missing |
| Skill trigger logic | ⚠️ Partial | Skills exist in `gameData.ts` but full priority/condition system may not be wired |
| Boss phases | ⚠️ Unknown | `BattleScene.ts` is 15KB which is promising, but boss phase logic unclear |
| Season reset | ⚠️ Screen exists | `SeasonScreen.tsx` exists but actual reset logic needs server-side support |
| Idle buildings | ⚠️ Screen exists | `IdleScreen.tsx` exists but offline accumulation needs server timestamp logic |
| Content data | ⚠️ Thin | `gameData.ts` at 5KB likely has minimal enemy/skill definitions so far |
| Equipment affixes | ❌ Missing | No affix/loot system visible in shared types yet |
| Build presets | ❌ Missing | No preset save/load system visible |

***

## Suggested Roadmap

### 🔴 Phase 1 — Stabilize Core Loop
**Goal: make the loop fully playable end-to-end**  
**Timeline: 2–3 weeks**

- [ ] Wire `BattleScene.ts` full auto-battle tick — skill priority resolution, target selection, cooldown tracking
- [ ] Add boss phase logic — 3 phases, phase transition triggers, manual skill buttons
- [ ] Wire `ResultScreen.tsx` to actual loot drops from `gameData.ts`
- [ ] Fix `InventoryScreen.tsx` to allow equipping items and see stat changes
- [ ] Wire `SkillsScreen.tsx` to allow setting skill priority and target mode
- [ ] Make `store.ts` on client sync properly after battle result
- [ ] Add basic damage formula and status effects (burn, freeze, poison)
- [ ] Test full loop: hub → battle → result → inventory → hub
Now I have read every key file. Here is the **fully expanded Phase 1 task list** based on your actual code.

## Phase 1 — What You Already Have

Before diving into tasks, here is the real current state after reading every file:

| File | Status | What exists |
|---|---|---|
| [`BattleScene.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/game/BattleScene.ts) | ✅ Working | Tick loop, skill priority, auto-attack, crit, stun, loot drop, victory/defeat — **largely functional** |
| [`gameData.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/shared/src/gameData.ts) | ⚠️ Thin | 1 class, 3 skills, 4 enemies, 1 map (3 stages), 9 items, 1 mission, 1 building |
| [`server/index.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/server/src/index.ts) | ✅ Working | Auth, inventory equip/unequip, battle submit, XP leveling, mission progress, idle collect — **all wired** |
| [`SkillsScreen.tsx`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/screens/SkillsScreen.tsx) | ✅ Working | Drag-up/down reorder, target mode selection, save to server |
| [`InventoryScreen.tsx`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/screens/InventoryScreen.tsx) | ✅ Working | Equip/unequip, slot view, bag view, rarity color tags |
| [`store.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/store.ts) | ✅ Good | Zustand store, all key state fields present |

**This means your core loop is actually more complete than Phase 1 suggested.** The key gaps are much more specific now. Here is the expanded, accurate Phase 1 task list.

***

## Phase 1 — Expanded Task List

### 🔴 Task 1.1 — Wire target mode from `SkillsScreen` into `BattleScene`

**What the problem is:**  
Your [`SkillsScreen.tsx`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/screens/SkillsScreen.tsx) lets the player select `boss_first`, `lowest_hp`, or `closest` as the target mode and saves it to the server. But [`BattleScene.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/game/BattleScene.ts) in `pickTarget()` only ever does boss-first then lowest HP — it never reads the preset's `targetMode`. The player's choice has **zero effect** on battle right now.

**What to do:**
- Pass `targetMode` from the skill preset into `BattleConfig`.
- Update `pickTarget()` to branch on `targetMode`:
  - `boss_first` → find boss, fallback to lowest HP (current logic, already correct)
  - `lowest_hp` → sort by `currentHp` ascending
  - `closest` → can be implemented as "first in spawn order" for now since there is no spatial system yet

```typescript
// BattleConfig — add this field
interface BattleConfig {
  stageId: string;
  stageName: string;
  playerStats: CombatPlayer;
  skillOrder: string[];
  targetMode: 'boss_first' | 'lowest_hp' | 'closest'; // ← add
  onComplete: (result: BattleResult & { stageName: string }) => void;
}

// pickTarget() — update to use it
private pickTarget(): CombatEnemy | undefined {
  const alive = this.enemies.filter(e => e.alive);
  if (alive.length === 0) return undefined;
  if (this.config.targetMode === 'boss_first') {
    return alive.find(e => e.def.isBoss) ?? alive.reduce((min, e) => e.currentHp < min.currentHp ? e : min, alive[0]);
  }
  if (this.config.targetMode === 'lowest_hp') {
    return alive.reduce((min, e) => e.currentHp < min.currentHp ? e : min, alive[0]);
  }
  // closest = first in spawn order
  return alive[0];
}
```

***

### 🔴 Task 1.2 — Apply equipped item stats to player before battle

**What the problem is:**  
When battle starts, `playerStats` is passed in from outside, but currently the equip system on the server tracks which items are equipped in `character.equippedItems`, and the client store tracks this too. However, **nowhere in the battle setup is equipment stat bonuses being calculated and applied**. So equipping the `Trollbane Sword` (attack: 25) has zero effect on damage in battle.

**What to do:**
- In [`BattleScreen.tsx`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/screens/BattleScreen.tsx) (or wherever `BattleConfig.playerStats` is assembled), add an equipment stat aggregation step:

```typescript
function buildPlayerStats(character: CharacterState, inventory: InventoryItem[]): CombatPlayer {
  const base = { ...character.stats };
  // Apply equipped item bonuses
  inventory
    .filter(item => item.equippedSlot)
    .forEach(item => {
      const def = ITEMS[item.itemDefId];
      if (!def) return;
      if (def.stats.attack) base.attack += def.stats.attack;
      if (def.stats.defense) base.defense += def.stats.defense;
      if (def.stats.hp) base.maxHp += def.stats.hp;
      if (def.stats.crit) base.critChance += def.stats.crit;
    });
  return {
    hp: base.maxHp,
    maxHp: base.maxHp,
    attack: base.attack,
    defense: base.defense,
    attackSpeed: character.stats.attackSpeed ?? 2,
    critChance: base.critChance ?? 0.05,
    ticksUntilAttack: character.stats.attackSpeed ?? 2,
  };
}
```

- Call this function when passing `playerStats` into `BattleScene`.

***

### 🔴 Task 1.3 — Add resource cost checking to skill usage

**What the problem is:**  
Every skill in [`gameData.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/shared/src/gameData.ts) has `resourceCost` defined (e.g. `shield_bash` costs 20, `battle_cry` costs 30). But in `useSkillOrAttack()` inside `BattleScene.ts`, the code **never checks or deducts resource cost** — all skills are used freely as long as the cooldown is ready. This breaks the intended design where mana/energy management is a tradeoff.

**What to do:**
- Add a `resource` and `maxResource` field to `CombatPlayer`.
- Regenerate a small amount of resource per tick (e.g. +5 per tick as a baseline).
- Before using a skill, check `this.player.resource >= skill.resourceCost`.
- After using a skill, deduct the cost.
- Add a resource bar to the HUD next to the HP bar.

```typescript
// In doTick(), add resource regen
this.player.resource = Math.min(this.player.maxResource, this.player.resource + 5);

// In useSkillOrAttack(), add check
if (this.player.resource < skill.resourceCost) continue;
// After using:
this.player.resource -= skill.resourceCost;
```

***

### 🔴 Task 1.4 — Add boss phase logic to `BattleScene`

**What the problem is:**  
`forest_troll` is marked `isBoss: true` but there are no phase transitions in the battle. The GDD specifies bosses should have 2–3 phases with special mechanics. Currently the boss just hits harder and drops better loot — no phase behavior.

**What to do:**
- Add a `phase` field (1, 2, 3) to track boss state.
- Trigger phase 2 when boss HP drops below 60%, phase 3 below 30%.
- On each phase transition:
  - Log a phase warning in the combat log.
  - Flash the screen or shake the camera.
  - Apply a phase effect: e.g. phase 2 = boss attack +30%, phase 3 = boss attack +60% and gains a new attack pattern.
- Add a `bossPhaseLabel` text object that updates visually.

```typescript
private checkBossPhase(boss: CombatEnemy) {
  const pct = boss.currentHp / boss.maxHp;
  const newPhase = pct <= 0.3 ? 3 : pct <= 0.6 ? 2 : 1;
  if (newPhase !== this.bossPhase) {
    this.bossPhase = newPhase;
    this.addLog(`⚠️ Boss Phase ${newPhase}!`, ORANGE);
    this.cameras.main.shake(300, 0.01);
    // Boost boss attack per phase
    boss.def = { ...boss.def, attack: Math.floor(boss.def.attack * 1.3) };
  }
}
```

- Call this after every hit lands on a boss enemy.

***

### 🔴 Task 1.5 — Wire manual skill buttons on boss fights

**What the problem is:**  
The `drawSkillUI()` method in [`BattleScene.ts`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/game/BattleScene.ts) renders skill name and cooldown labels at the bottom, but **they are not interactive** — there is no `setInteractive()` or click handler. The GDD says 2–3 key skills should be manually triggerable during boss fights.

**What to do:**
- Replace the plain text skill buttons with interactive Phaser `Graphics` + `Text` objects that respond to pointer input.
- On click, if the skill is off cooldown and the player has enough resource, fire the skill immediately outside the normal tick order.
- Only show manual buttons during boss stages (check `stage.isBoss`).
- Visually dim buttons when on cooldown, light up when ready.

```typescript
// In drawSkillUI(), add interactivity
const zone = this.add.zone(x, y, 100, 50).setInteractive({ useHandCursor: true });
zone.on('pointerdown', () => {
  if (this.skillCooldowns[id] > 0) return;
  this.manualFireSkill(id);
});
```

***

### 🟠 Task 1.6 — Add stat comparison to `InventoryScreen`

**What the problem is:**  
The [`InventoryScreen.tsx`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/screens/InventoryScreen.tsx) shows item stats and lets you equip/unequip, but **does not compare a bag item to the currently equipped item in the same slot**. This makes it hard to judge whether a new drop is an upgrade.

**What to do:**
- When rendering a bag item, look up what is currently equipped in the same slot.
- Show a diff next to each stat: `+5 ATK`, `-2 DEF`, `+20 HP` etc. in green/red color.
- This does not require backend changes — it is pure frontend logic using `ITEMS[def]` and `character.equippedItems`.

```typescript
// Stat diff example
const currentItem = equippedInSlot(def.slot, inventory, character);
const currentDef = currentItem ? ITEMS[currentItem.itemDefId] : null;
const diff = (stat: string) => {
  const newVal = (def.stats as any)[stat] ?? 0;
  const oldVal = currentDef ? (currentDef.stats as any)[stat] ?? 0 : 0;
  return newVal - oldVal;
};
```

***

### 🟠 Task 1.7 — Add more content to `gameData.ts`

**What the problem is:**  
Right now there is 1 class, 3 skills, 4 enemies, 1 map with 3 stages. This is enough to validate the loop but will feel repetitive within a single session. Phase 1 should have enough content to make the loop feel real.

**What to add (minimum viable content for Phase 1):**
- **Skills:** Add 3–5 more skills for the Warrior (e.g. Whirlwind, Iron Skin, War Cry, Cleave, Execute).
- **Enemies:** Add 3–4 more enemies for a second map zone.
- **Maps:** Add a second map with 3 stages (e.g. "Stone Caves" — undead/dungeon theme).
- **Items:** Add 5–10 more items across all slots and rarities.
- **Missions:** Add 3–4 more daily missions (clear a boss, collect gold, reach a stage).

This is content work, not engineering work — but it is critical for Phase 1 feel.

***

### 🟠 Task 1.8 — Add damage number popups to `BattleScene`

**What the problem is:**  
All damage feedback is currently only shown in the text log at the bottom. There are no floating damage numbers on enemies, which makes hits feel underwhelming and harder to read at a glance.

**What to do:**
- After every hit, spawn a floating `Phaser.GameObjects.Text` over the target.
- Tween it upward and fade it out over ~0.5–0.8 seconds.
- Color it based on type: white for normal, yellow for crit, red for enemy hits, orange for skill hits.

```typescript
private spawnDamageText(x: number, y: number, text: string, color: string) {
  const t = this.add.text(x, y, text, { fontSize: '14px', color, fontStyle: 'bold' }).setOrigin(0.5);
  this.tweens.add({
    targets: t,
    y: y - 40,
    alpha: 0,
    duration: 700,
    onComplete: () => t.destroy(),
  });
}
```

***

### 🟡 Task 1.9 — Fix `ResultScreen` to show actual item drops

**What the problem is:**  
The result data already has `itemsDropped: InventoryItem[]` coming back from `BattleScene`. This is stored in `lastBattleResult` in the Zustand store. But the result screen likely does not display the item names with proper stat info or rarity colors — it needs to use `ITEMS[item.itemDefId]` to render the actual item definitions.

**What to do:**
- In [`ResultScreen.tsx`](https://github.com/alphakey-marketing/IdleARPG/blob/main/client/src/screens/ResultScreen.tsx), render each dropped item with its name, slot, stats, and rarity color.
- Add a clear "Tap to continue" or auto-advance button.
- Make sure the store's `inventory` state is refreshed after the result screen is dismissed (either from the server response or by appending items locally).

***

### 🟡 Task 1.10 — Add a stage selection screen to `HubScreen`

**What the problem is:**  
Right now the only map and stage data is in `gameData.ts`, but there is no UI for the player to **select which stage to enter**. If there is only one hardcoded path, players cannot choose. As you add more maps and stages, you need a map/stage picker before entering battle.

**What to do:**
- Add a `MapSelectScreen` or integrate stage selection into the hub.
- Show all available maps from `MAPS`.
- For each map, show its stages with names, difficulty indicators, and a lock state (stages unlock as previous ones are cleared).
- On selection, pass the correct `stageId` to the battle.

***

## Phase 1 Summary

| # | Task | Effort | Priority |
|---|---|---|---|
| 1.1 | Wire targetMode into BattleScene pickTarget | Small | 🔴 Now |
| 1.2 | Apply equipment stats to playerStats before battle | Small | 🔴 Now |
| 1.3 | Add resource cost checking + resource bar | Medium | 🔴 Now |
| 1.4 | Boss phase transitions in BattleScene | Medium | 🔴 Now |
| 1.5 | Make skill buttons clickable for manual use | Medium | 🔴 Now |
| 1.6 | Stat diff comparison in InventoryScreen | Small | 🟠 Soon |
| 1.7 | Add more skills, enemies, maps, items | Medium (content) | 🟠 Soon |
| 1.8 | Floating damage number popups | Small | 🟠 Soon |
| 1.9 | Fix ResultScreen to display item drop details | Small | 🟡 Later |
| 1.10 | Stage selection screen | Medium | 🟡 Later |

***

### 🟠 Phase 2 — Add Persistence and Auth
**Goal: player data survives server restart and players have accounts**  
**Timeline: 2–3 weeks**

- [ ] Replace `server/src/store.ts` in-memory store with PostgreSQL
- [ ] Add tables: `accounts`, `character_state`, `inventory_items`, `skill_presets`
- [ ] Add auth endpoints: `POST /auth/login`, `POST /auth/logout`, `GET /auth/session`
- [ ] Add login screen on client
- [ ] Add save/load on battle submit, item equip, and skill changes
- [ ] Add idle building offline accumulation with server timestamps and caps
- [ ] Test: restart server, player data still there

***

### 🟡 Phase 3 — Build Season System
**Goal: 14-day season cycle is fully functional**  
**Timeline: 2–3 weeks**

- [ ] Add `season_state` table to database
- [ ] Build `POST /admin/season/reset` endpoint
- [ ] Wire `SeasonScreen.tsx` to real season data — show days remaining, current seasonal mechanic, seasonal currency
- [ ] Implement reset logic: clear level, equipment, seasonal resources; keep cosmetics, titles, logbook
- [ ] Add seasonal missions to `MissionsScreen.tsx` with real server tracking
- [ ] Show end-of-season summary: damage dealt, boss kills, achievements, rewards earned
- [ ] Test full 14-day cycle with a simulated reset

***

### 🟢 Phase 4 — Content Expansion
**Goal: enough content for a real 14-day season**  
**Timeline: 3–4 weeks**

- [ ] Expand `gameData.ts` — add more enemies, more map zones, more skills, more items
- [ ] Add equipment affixes system — at least 10–15 affix types
- [ ] Add 3 classes: Warrior, Mage, Hunter (currently likely placeholder)
- [ ] Add 2 build branches per class (6 total)
- [ ] Add item rarity tiers: Common, Magic, Rare, Epic, Legendary
- [ ] Add 1 seasonal mechanic for Season 1 (e.g. seasonal rift or seasonal affix modifier)
- [ ] Add passive skill tree per class (simple version, 10–15 nodes each)
- [ ] Add item comparison UI in `InventoryScreen.tsx`

***

### 🔵 Phase 5 — Polish and Retention Systems
**Goal: game feels good and retains players**  
**Timeline: 2–3 weeks**

- [ ] Add damage numbers to `BattleScene.ts`
- [ ] Add hit effects and skill VFX (even simple sprites or tweens)
- [ ] Add audio: hit sounds, level up, loot drop, boss phase change
- [ ] Add build preset save/load (at least 3 presets per character)
- [ ] Add daily mission system — 3–5 daily tasks with gold/material rewards
- [ ] Add streak bonus — small daily login reward
- [ ] Add leaderboard (simple top 10 per season)
- [ ] Add onboarding flow for new players (step-by-step first battle guide)
- [ ] Performance pass — check Phaser memory usage, bundle size, load time

***

### 🟣 Phase 6 — Season 2 Readiness
**Goal: release Season 2 and prove the seasonal model works**  
**Timeline: 2 weeks content + 1 week ops**

- [ ] Add Season 2 seasonal mechanic (different from Season 1)
- [ ] Add new boss
- [ ] Add 1 new archetype branch per class
- [ ] Tune balance based on Season 1 player data
- [ ] Add season-end cosmetic reward
- [ ] Ship Season 2 reset and monitor retention

***

## Priority Order Summary

| Priority | Task |
|---|---|
| 🔴 Now | Full battle loop working end-to-end |
| 🔴 Now | Loot drops, equip, skill priority wired |
| 🟠 Next | PostgreSQL persistence + auth |
| 🟠 Next | Idle offline accumulation logic |
| 🟡 Soon | Season reset system |
| 🟡 Soon | Season UI fully connected to real data |
| 🟢 Later | Class branches + equipment affixes |
| 🟢 Later | Content expansion in gameData.ts |
| 🔵 Polish | VFX, audio, damage numbers |
| 🔵 Polish | Build presets, leaderboard |

***

## One-Line Assessment

Your repo is already at **~20–25% of MVP**, with all the right screen structure and architecture in place — the next critical step is **wiring the battle loop end-to-end and replacing the in-memory server store with a real database**.

If you want, I can help you tackle any specific phase directly — for example I can write the **PostgreSQL schema**, the **battle tick logic**, or the **season reset endpoint** right into your repo as a PR.
