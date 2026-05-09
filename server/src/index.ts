import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { getOrCreateAccount, getAccountByToken, saveAccount } from './store';
import { IDLE_BUILDINGS, MISSIONS, SEASONS, xpForLevel, ITEMS, CLASSES } from '../../shared/src/gameData';
import type { BattleResult, InventoryItem, MissionProgress } from '../../shared/src/types';

const app = express();
app.use(cors());
app.use(express.json());

// Auth middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const account = getAccountByToken(token);
  if (!account) {
    res.status(401).json({ error: 'Invalid session' });
    return;
  }
  (req as express.Request & { account: ReturnType<typeof getAccountByToken> }).account = account;
  next();
}

type AuthRequest = express.Request & { account: NonNullable<ReturnType<typeof getAccountByToken>> };

// POST /auth/login
app.post('/auth/login', (req, res) => {
  const { guestId } = req.body as { guestId?: string };
  const accountId = guestId || uuidv4();
  const token = uuidv4();
  const account = getOrCreateAccount(accountId, token);
  account.sessionToken = token;
  account.lastLoginAt = new Date().toISOString();
  saveAccount(account);
  res.json({ accountId, token });
});

// GET /auth/session
app.get('/auth/session', requireAuth, (req, res) => {
  const account = (req as AuthRequest).account;
  res.json({ accountId: account.accountId, valid: true });
});

// GET /player/profile
app.get('/player/profile', requireAuth, (req, res) => {
  res.json((req as AuthRequest).account.profile);
});

// GET /character/state
app.get('/character/state', requireAuth, (req, res) => {
  res.json((req as AuthRequest).account.character);
});

// GET /inventory
app.get('/inventory', requireAuth, (req, res) => {
  res.json((req as AuthRequest).account.inventory);
});

// POST /inventory/equip
app.post('/inventory/equip', requireAuth, (req, res) => {
  const account = (req as AuthRequest).account;
  const { itemId } = req.body as { itemId: string };
  const item = account.inventory.find((i: InventoryItem) => i.id === itemId);
  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  const itemDef = ITEMS[item.itemDefId];
  if (!itemDef) {
    res.status(400).json({ error: 'Unknown item def' });
    return;
  }
  // Unequip anything already in that slot
  account.inventory.forEach((i: InventoryItem) => {
    if (i.equippedSlot === itemDef.slot) delete i.equippedSlot;
  });
  item.equippedSlot = itemDef.slot;
  account.character.equippedItems[itemDef.slot] = item.id;
  saveAccount(account);
  res.json({ success: true, item });
});

// POST /inventory/unequip
app.post('/inventory/unequip', requireAuth, (req, res) => {
  const account = (req as AuthRequest).account;
  const { itemId } = req.body as { itemId: string };
  const item = account.inventory.find((i: InventoryItem) => i.id === itemId);
  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  const slot = item.equippedSlot;
  delete item.equippedSlot;
  if (slot) delete account.character.equippedItems[slot];
  saveAccount(account);
  res.json({ success: true });
});

// GET /skills/presets
app.get('/skills/presets', requireAuth, (req, res) => {
  res.json((req as AuthRequest).account.skillPreset);
});

// PATCH /skills/presets
app.patch('/skills/presets', requireAuth, (req, res) => {
  const account = (req as AuthRequest).account;
  account.skillPreset = { ...account.skillPreset, ...req.body };
  saveAccount(account);
  res.json(account.skillPreset);
});

// GET /idle/buildings
app.get('/idle/buildings', requireAuth, (req, res) => {
  res.json((req as AuthRequest).account.idleBuildings);
});

// POST /idle/collect
app.post('/idle/collect', requireAuth, (req, res) => {
  const account = (req as AuthRequest).account;
  let totalGold = 0;
  account.idleBuildings.forEach((b) => {
    const def = IDLE_BUILDINGS[b.buildingType];
    if (!def || def.produces !== 'gold') return;
    const lastCollected = new Date(b.lastCollectedAt).getTime();
    const now = Date.now();
    const hoursElapsed = Math.min((now - lastCollected) / 3600000, def.maxOfflineHours);
    const ratePerHour = def.baseRatePerHour * b.level;
    const gold = Math.floor(hoursElapsed * ratePerHour);
    totalGold += gold;
    b.lastCollectedAt = new Date().toISOString();
  });
  account.profile.gold += totalGold;
  saveAccount(account);
  res.json({ goldCollected: totalGold, newTotal: account.profile.gold });
});

// POST /battle/start
app.post('/battle/start', requireAuth, (req, res) => {
  const { stageId } = req.body as { stageId: string };
  if (!stageId) {
    res.status(400).json({ error: 'stageId required' });
    return;
  }
  res.json({ battleId: uuidv4(), stageId, startedAt: new Date().toISOString() });
});

// POST /battle/submit-result
app.post('/battle/submit-result', requireAuth, (req, res) => {
  const account = (req as AuthRequest).account;
  const result = req.body as BattleResult;

  // Grant gold
  account.profile.gold += result.goldGained;

  // Grant items
  if (result.itemsDropped) {
    result.itemsDropped.forEach((item: InventoryItem) => {
      account.inventory.push(item);
    });
  }

  // Grant XP and handle level ups
  account.character.xp += result.xpGained;
  while (account.character.xp >= account.character.xpToNextLevel) {
    account.character.xp -= account.character.xpToNextLevel;
    account.character.level += 1;
    const cls = CLASSES[account.character.classId];
    account.character.stats.maxHp = Math.floor(cls.baseStats.hp * (1 + (account.character.level - 1) * 0.12));
    account.character.stats.hp = account.character.stats.maxHp;
    account.character.stats.attack = Math.floor(cls.baseStats.attack * (1 + (account.character.level - 1) * 0.10));
    account.character.stats.defense = Math.floor(cls.baseStats.defense * (1 + (account.character.level - 1) * 0.08));
    account.character.xpToNextLevel = xpForLevel(account.character.level);
  }

  // Update mission progress
  account.missionProgress.forEach((mp: MissionProgress) => {
    if (mp.completed) return;
    const mission = MISSIONS[mp.missionId];
    if (!mission) return;
    if (mission.objective.type === 'kill') {
      mp.progress = Math.min(mp.progress + result.monstersKilled, mission.objective.count);
      if (mp.progress >= mission.objective.count) mp.completed = true;
    }
  });

  saveAccount(account);
  res.json({
    newLevel: account.character.level,
    newXp: account.character.xp,
    newGold: account.profile.gold,
    newStats: account.character.stats,
    missionProgress: account.missionProgress,
  });
});

// GET /season/current
app.get('/season/current', (_req, res) => {
  res.json(SEASONS[0]);
});

// GET /missions/daily
app.get('/missions/daily', requireAuth, (req, res) => {
  const account = (req as AuthRequest).account;
  const result = account.missionProgress.map((mp: MissionProgress) => ({
    ...mp,
    definition: MISSIONS[mp.missionId],
  }));
  res.json(result);
});

// POST /missions/claim
app.post('/missions/claim', requireAuth, (req, res) => {
  const account = (req as AuthRequest).account;
  const { missionId } = req.body as { missionId: string };
  const mp = account.missionProgress.find((m: MissionProgress) => m.missionId === missionId);
  if (!mp) {
    res.status(404).json({ error: 'Mission not found' });
    return;
  }
  if (!mp.completed) {
    res.status(400).json({ error: 'Mission not completed' });
    return;
  }
  if (mp.claimedAt) {
    res.status(400).json({ error: 'Already claimed' });
    return;
  }
  const mission = MISSIONS[missionId];
  if (mission?.reward.gold) account.profile.gold += mission.reward.gold;
  if (mission?.reward.xp) account.character.xp += mission.reward.xp;
  mp.claimedAt = new Date().toISOString();
  saveAccount(account);
  res.json({ success: true, reward: mission?.reward });
});

// POST /admin/season/reset (MVP stub)
app.post('/admin/season/reset', (_req, res) => {
  res.json({ message: 'Season reset scheduled (MVP stub)' });
});

const PORT = parseInt(process.env.PORT ?? '3001', 10);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
