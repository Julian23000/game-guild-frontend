import { Platform } from 'react-native';
import { getToken, getUserId } from './auth';

const DEFAULT_PORT = 3000;
// Use 10.0.2.2 for Android AVD, 10.0.3.2 for Genymotion, localhost for iOS/sim/PC.
const API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:' + DEFAULT_PORT
    : 'http://localhost:' + DEFAULT_PORT;

const MOCK_GAMES = [
  { _id: '1', externalId: 'hollow-knight', name: 'Hollow Knight', platform: 'PC', achievements: ['Dreamer','Radiant','Steel Soul'] },
  { _id: '2', externalId: 'celeste', name: 'Celeste', platform: 'Switch', achievements: ['Core B-Side','Reflection','Golden Strawberries'] },
  { _id: '3', externalId: 'god-of-war', name: 'God of War', platform: 'PS4', achievements: ['Spartan Rage','Legendary'] },
  { _id: '4', externalId: 'rocket-league', name: 'Rocket League', platform: 'PC/Console', achievements: ['Winner','Striker'] },
];

function delay(ms = 120) {
  return new Promise((r) => setTimeout(r, ms));
}

async function authHeaders() {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${txt}`);
  }
  return await res.json();
}

export async function searchGames(q = '') {
  const token = await getToken();
  if (!token) {
    // no token: return mock results immediately
    await delay();
    const term = (q || '').trim().toLowerCase();
    if (!term) return MOCK_GAMES.slice();
    return MOCK_GAMES.filter(
      (g) =>
        (g.name || '').toLowerCase().includes(term) ||
        (g.externalId || '').toLowerCase().includes(term) ||
        (g._id || '').toString() === term
    );
  }

  const url = `${API_BASE}/api/games${q ? `?q=${encodeURIComponent(q)}` : ''}`;
  const headers = await authHeaders();
  try {
    return await fetchJson(url, { headers });
  } catch (err) {
    console.warn('searchGames failed -', err.message);
    // fallback to mock if server call fails even with token
    return MOCK_GAMES;
  }
}

export async function createEntry(payload = {}) {
  const token = await getToken();
  const userId = await getUserId();

  if (!token) {
    // no token: simulate created entry locally
    await delay();
    const created = {
      _id: String(Date.now()),
      userId: userId || null,
      gameId: payload.gameId || null,
      status: payload.status || 'Playing',
      dateStarted: payload.dateStarted || null,
      dateFinished: payload.dateFinished || null,
      notes: payload.notes || '',
      achievementsUnlocked: Number(payload.achievementsUnlocked || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.warn('createEntry: no token, returning simulated entry');
    return created;
  }

  const body = { ...payload, ...(userId ? { userId } : {}) };
  const headers = { 'Content-Type': 'application/json', ...(await authHeaders()) };

  try {
    return await fetchJson(`${API_BASE}/api/entries`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn('createEntry failed -', err.message);
    throw err;
  }
}