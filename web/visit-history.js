export const HISTORY_KEY = 'josh.visit-history.v1';
export const PAUSE_KEY = 'josh.analytics-paused';
export const SESSION_GAP = 30 * 60 * 1000;
const RETENTION = 90 * 24 * 60 * 60 * 1000;
export function readHistory(storage, now) {
  try {
    const data = JSON.parse(storage.getItem(HISTORY_KEY));
    if (!Array.isArray(data)) return [];
    return data.filter(v => v && Number.isFinite(v.startedAt) && v.startedAt <= now && v.startedAt > now - RETENTION && Number.isFinite(v.lastSeen) && v.lastSeen >= v.startedAt && v.lastSeen <= now && Number.isFinite(v.activeMs) && v.activeMs >= 0 && v.activeMs <= RETENTION && Number.isSafeInteger(v.pageviews) && v.pageviews > 0 && Array.isArray(v.paths) && v.paths.length <= 100 && v.paths.every(p => typeof p === 'string' && /^\/(?!\/)/.test(p) && p.length <= 300)).sort((a,b) => b.lastSeen - a.lastSeen).slice(0, 20);
  } catch { return []; }
}
export function beginVisit(history, now, path) {
  const visits = structuredClone(history);
  if (!visits.length || now - visits[0].lastSeen >= SESSION_GAP) visits.unshift({startedAt: now, lastSeen: now, activeMs: 0, pageviews: 0, paths: []});
  const visit = visits[0];
  visit.lastSeen = now; visit.pageviews += 1;
  if (!visit.paths.includes(path) && visit.paths.length < 100) visit.paths.push(path);
  return visits.slice(0, 20);
}
export function addActiveTime(visits, now, elapsedMs) {
  if (!visits.length) return visits;
  const visit = visits[0];
  // Overlapping visible tabs count the same wall-clock interval only once.
  const elapsed = Math.max(0, Math.min(elapsedMs, now - visit.lastSeen, 5000));
  visit.activeMs += elapsed; visit.lastSeen = Math.max(visit.lastSeen, now);
  return visits;
}
export function formatDuration(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds / 60) % 60}m`;
}
