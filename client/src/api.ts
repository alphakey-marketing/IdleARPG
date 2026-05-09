const BASE = '/api';

let _token: string | null = localStorage.getItem('session_token');
let _guestId: string | null = localStorage.getItem('guest_id');

export async function login(): Promise<{ accountId: string; token: string }> {
  if (!_guestId) {
    _guestId = crypto.randomUUID();
    localStorage.setItem('guest_id', _guestId);
  }
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestId: _guestId }),
  });
  const data = await res.json() as { accountId: string; token: string };
  _token = data.token;
  localStorage.setItem('session_token', _token);
  return data;
}

async function authFetch(url: string, options: RequestInit = {}): Promise<unknown> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;
  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

export const api = {
  getProfile: () => authFetch('/player/profile'),
  getCharacter: () => authFetch('/character/state'),
  getInventory: () => authFetch('/inventory'),
  equipItem: (itemId: string) => authFetch('/inventory/equip', { method: 'POST', body: JSON.stringify({ itemId }) }),
  unequipItem: (itemId: string) => authFetch('/inventory/unequip', { method: 'POST', body: JSON.stringify({ itemId }) }),
  getSkillPreset: () => authFetch('/skills/presets'),
  updateSkillPreset: (preset: object) => authFetch('/skills/presets', { method: 'PATCH', body: JSON.stringify(preset) }),
  getIdleBuildings: () => authFetch('/idle/buildings'),
  collectIdle: () => authFetch('/idle/collect', { method: 'POST' }),
  startBattle: (stageId: string) => authFetch('/battle/start', { method: 'POST', body: JSON.stringify({ stageId }) }),
  submitBattleResult: (result: object) => authFetch('/battle/submit-result', { method: 'POST', body: JSON.stringify(result) }),
  getCurrentSeason: () => authFetch('/season/current'),
  getDailyMissions: () => authFetch('/missions/daily'),
  claimMission: (missionId: string) => authFetch('/missions/claim', { method: 'POST', body: JSON.stringify({ missionId }) }),
};
