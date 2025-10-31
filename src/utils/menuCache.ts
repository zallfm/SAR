import type { MenuItem } from "../api/auth.api";

const KEY = "SAR_MENU_CACHE_V1"; // bump versi kalau schema berubah
type CacheEntry = { data: MenuItem[]; ts: number };
type CacheShape = Record<string, CacheEntry>; // key = `${username}_${role}`

const TTL_MS = 24 * 60 * 60 * 1000; // 24 jam (ubah kalau perlu)

function readAll(): CacheShape {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CacheShape) : {};
  } catch {
    return {};
  }
}
function writeAll(obj: CacheShape) {
  try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch {}
}

export function loadMenu(username: string, role: string): MenuItem[] | null {
  if (!username || !role) return null;
  const cache = readAll();
  const k = `${username}_${role}`;
  const entry = cache[k];
  if (!entry) return null;
  // TTL
  if (Date.now() - entry.ts > TTL_MS) return null;
  return entry.data ?? null;
}

export function saveMenu(username: string, role: string, data: MenuItem[]) {
  if (!username || !role) return;
  const cache = readAll();
  const k = `${username}_${role}`;
  cache[k] = { data, ts: Date.now() };
  writeAll(cache);
}

export function clearAllMenus() {
  try { localStorage.removeItem(KEY); } catch {}
}

export function clearMenu(username: string, role: string) {
  const cache = readAll();
  const k = `${username}_${role}`;
  if (cache[k]) {
    delete cache[k];
    writeAll(cache);
  }
}
