// src/utils/loginLock.ts
const KEY = 'login-locks'; // username -> lockedUntil(ms)

type LockMap = Record<string, number>;

function read(): LockMap {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
function write(m: LockMap) { localStorage.setItem(KEY, JSON.stringify(m)); }

export function saveLock(username: string, lockedUntil: number) {
  const m = read();
  m[username] = lockedUntil;
  write(m);
}
export function getLock(username: string): number | null {
  const lu = read()[username];
  if (!lu) return null;
  if (lu <= Date.now()) { clearLock(username); return null; }
  return lu;
}
export function clearLock(username: string) {
  const m = read();
  if (m[username]) { delete m[username]; write(m); }
}
export function remainingMs(username: string) {
  const lu = getLock(username);
  return lu ? Math.max(0, lu - Date.now()) : 0;
}
export function fmtMMSS(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
