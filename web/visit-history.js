export const HISTORY_KEY = 'josh.visit-history.v1';
export const SESSION_KEY = 'josh.visit-session.v1';
export const NAVIGATION_KEY = 'josh.visit-navigation.v1';
export const PAUSE_KEY = 'josh.analytics-paused';
export const SESSION_GAP = 30 * 60 * 1000;
const RETENTION = 90 * 24 * 60 * 60 * 1000;
export function readHistory(storage, now) {
  try {
    const data = JSON.parse(storage.getItem(HISTORY_KEY));
    if (!Array.isArray(data)) return [];
    return data.filter(v => v && Number.isFinite(v.startedAt) && v.startedAt <= now && v.startedAt > now - RETENTION && Number.isFinite(v.lastSeen) && v.lastSeen >= v.startedAt && v.lastSeen <= now && Number.isFinite(v.activeMs) && v.activeMs >= 0 && v.activeMs <= RETENTION && Number.isSafeInteger(v.pageviews) && v.pageviews > 0 && Array.isArray(v.paths) && v.paths.length <= 100 && v.paths.every(p => typeof p === 'string' && /^\/(?!\/)/.test(p) && p.length <= 300))
      .map(v => ({id: typeof v.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(v.id) ? v.id : `legacy-${v.startedAt}`, startedAt:v.startedAt, lastSeen:v.lastSeen, activeMs:v.activeMs, pageviews:v.pageviews, paths:[...v.paths]}))
      .sort((a,b) => b.lastSeen - a.lastSeen).slice(0, 20);
  } catch { return []; }
}
export function beginVisit(history, now, path, {resumeId = null, newId = crypto.randomUUID()} = {}) {
  const visits = structuredClone(history);
  let visit = visits.find(v => v.id === resumeId && now - v.lastSeen < SESSION_GAP && now >= v.lastSeen);
  if (!visit) { visit = {id:newId, startedAt:now, lastSeen:now, activeMs:0, pageviews:0, paths:[]}; visits.unshift(visit); }
  visit.lastSeen = now; visit.pageviews += 1;
  if (!visit.paths.includes(path) && visit.paths.length < 100) visit.paths.push(path);
  return {visits:visits.sort((a,b)=>b.lastSeen-a.lastSeen).slice(0,20), visitId:visit.id};
}
export function addActiveTime(visits, now, elapsedMs, visitId = visits[0]?.id) {
  const visit = visits.find(v=>v.id === visitId);
  if (!visit) return visits;
  // A shared visit can be open in multiple tabs; overlapping time counts once.
  const elapsed = Math.max(0, Math.min(elapsedMs, now - visit.lastSeen, 5000));
  visit.activeMs += elapsed; visit.lastSeen = Math.max(visit.lastSeen, now);
  return visits.sort((a,b)=>b.lastSeen-a.lastSeen);
}
export function resumesVisit({navigationType, referrer, origin}) {
  if (['reload','back_forward'].includes(navigationType)) return true;
  try { return new URL(referrer).origin === origin; } catch { return false; }
}
// The browser controller and tests use the same lifecycle, including tab storage.
export class VisitHistory {
  constructor({storage, sessionStorage, now = Date.now, newId = () => crypto.randomUUID()}) {
    this.storage=storage; this.sessionStorage=sessionStorage; this.now=now; this.newId=newId;
    this.persistent=Boolean(storage); this.visits=[]; this.visitId=null; this.lastAccess=null;
  }
  start(path, navigation = {}) {
    this.path=path.split(/[?#]/)[0].slice(0,300);
    const now=this.now(); this.visits=readHistory(this.storage,now);
    // Keep the pre-entry snapshot: a quick return or refresh must not hide it.
    this.lastAccess=this.visits[0] ? structuredClone(this.visits[0]) : null;
    let resumeId=null;
    let pending;
    try { pending=JSON.parse(this.sessionStorage?.getItem(NAVIGATION_KEY) || 'null'); this.sessionStorage?.removeItem(NAVIGATION_KEY); } catch {}
    const internal=pending?.path===this.path && now>=pending.at && now-pending.at<10000;
    if(internal) resumeId=pending.visitId;
    else if (resumesVisit(navigation)) {
      try { resumeId=this.sessionStorage?.getItem(SESSION_KEY) || this.visits[0]?.id; }
      catch { resumeId=this.visits[0]?.id; }
    }
    if(resumeId) this.lastAccess=structuredClone(this.visits.find(v=>v.id===resumeId) || this.lastAccess);
    this.open(now,resumeId); return this.snapshot();
  }
  prepareNavigation(path) {
    // Production deliberately sends no referrer; carry only the local path in this tab.
    try { this.sessionStorage?.setItem(NAVIGATION_KEY,JSON.stringify({visitId:this.visitId,path:path.split(/[?#]/)[0].slice(0,300),at:this.now()})); } catch {}
  }
  open(now,resumeId=null) {
    const opened=beginVisit(this.visits,now,this.path,{resumeId,newId:this.newId()});
    this.visits=opened.visits; this.visitId=opened.visitId;
    try { this.sessionStorage?.setItem(SESSION_KEY,this.visitId); } catch { /* History can still persist. */ }
    this.save();
  }
  save() {
    if (!this.persistent) return;
    try { this.storage.setItem(HISTORY_KEY,JSON.stringify(this.visits)); }
    catch { this.persistent=false; }
  }
  tick(elapsedMs, visible=true) {
    if (!visible) return this.snapshot();
    const now=this.now();
    if (this.persistent) this.visits=readHistory(this.storage,now);
    const current=this.visits.find(v=>v.id===this.visitId);
    if (!current || now-current.lastSeen >= SESSION_GAP) {
      this.lastAccess=this.visits[0] ? structuredClone(this.visits[0]) : null;
      this.open(now);
    } else {
      addActiveTime(this.visits,now,elapsedMs,this.visitId); this.save();
    }
    return this.snapshot();
  }
  refresh() {
    if (this.persistent) this.visits=readHistory(this.storage,this.now());
    if (!this.visits.length) this.lastAccess=null;
    return this.snapshot();
  }
  clear({restart=true}={}) {
    this.visits=[]; this.lastAccess=null;
    try { this.sessionStorage?.removeItem(NAVIGATION_KEY); } catch {}
    try { this.storage?.removeItem(HISTORY_KEY); } catch { /* Clear page memory too. */ }
    if(restart) this.open(this.now());
    else { this.visitId=null; try { this.sessionStorage?.removeItem(SESSION_KEY); } catch {} }
    return this.snapshot();
  }
  snapshot() {
    return {visits:this.visits, current:this.visits.find(v=>v.id===this.visitId), lastAccess:this.lastAccess, persistent:this.persistent};
  }
}
export function formatDuration(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds / 60) % 60}m`;
}
