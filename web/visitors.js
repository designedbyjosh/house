import {HISTORY_KEY, PAUSE_KEY, SESSION_GAP, readHistory, beginVisit, addActiveTime, formatDuration} from './visit-history.js';

const panel = document.querySelector('[data-visitor-panel]');
const set = (name, value) => { const element = panel?.querySelector(`[data-${name}]`); if (element) element.textContent = value; };
let storage;
try { storage = window.localStorage; } catch { /* Private browsing may deny access. */ }
const stored = key => { try { return storage?.getItem(key); } catch { return null; } };
const privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
let paused = privacySignal || stored(PAUSE_KEY) === 'true' || stored('umami.disabled') === '1';
let history = [], persistent = Boolean(storage), lastTick = performance.now(), visible = !document.hidden;
const path = location.pathname.slice(0, 300); // Never retain query strings or fragments.
function save() {
  if (!persistent) return;
  try { storage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { persistent = false; }
}
function renderHistory() {
  if (!panel) return;
  if (paused) {
    set('visit-duration', 'Paused'); set('visit-pages', '—'); set('visit-count', '—');
    set('last-visit', 'History paused'); set('last-duration', '—');
    set('history-note', privacySignal ? 'Your browser privacy preference is being respected.' : 'Analytics and local visit history are paused.');
    return;
  }
  const current = history[0], previous = history[1];
  set('welcome', previous ? 'Good to have you back.' : 'Make yourself at home.');
  set('visit-duration', formatDuration(current?.activeMs || 0));
  set('visit-pages', String(current?.paths.length || 0));
  set('visit-count', String(history.length));
  set('last-visit', previous ? new Intl.DateTimeFormat(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}).format(previous.lastSeen) : 'First remembered visit');
  set('last-duration', previous ? formatDuration(previous.activeMs) : '—');
  set('history-note', persistent ? 'Remembered only in this browser, for up to 90 days.' : 'Browser storage is unavailable. This page only; history won’t be saved.');
}
function start() {
  if (paused) return renderHistory();
  history = beginVisit(readHistory(storage, Date.now()), Date.now(), path);
  save(); renderHistory();
}
function tick() {
  const now = Date.now(), elapsed = performance.now() - lastTick;
  lastTick = performance.now();
  if (paused || !visible) return;
  if (persistent) history = readHistory(storage, now);
  if (!history.length || now - history[0].lastSeen >= SESSION_GAP) history = beginVisit(history, now, path);
  else history = addActiveTime(history, now, elapsed);
  save(); renderHistory();
}
start();
setInterval(tick, 1000);
document.addEventListener('visibilitychange', () => {
  tick(); visible = !document.hidden; lastTick = performance.now();
  if (visible) { tick(); if (panel) refreshActivity(); }
});
window.addEventListener('pagehide', tick);
window.addEventListener('pageshow', event => { if (event.persisted) { lastTick = performance.now(); visible = !document.hidden; tick(); } });
window.addEventListener('storage', event => {
  if ([PAUSE_KEY, 'umami.disabled'].includes(event.key)) location.reload();
  if (event.key === HISTORY_KEY && !paused) { history = readHistory(storage, Date.now()); renderHistory(); }
});
panel?.querySelector('[data-clear-history]')?.addEventListener('click', () => {
  history = [];
  try { storage?.removeItem(HISTORY_KEY); } catch { /* In-memory clear still works. */ }
  if (!paused) { history = beginVisit([], Date.now(), path); save(); }
  renderHistory(); set('privacy-status', 'Earlier visits cleared.');
});
const toggle = panel?.querySelector('[data-toggle-analytics]');
if (toggle) {
  toggle.textContent = paused ? 'Resume analytics & history' : 'Pause analytics & history';
  toggle.disabled = privacySignal;
  toggle.addEventListener('click', () => {
    try {
      if (!storage) throw new Error('No storage');
      storage.setItem(PAUSE_KEY, String(!paused));
      if (!paused) storage.setItem('umami.disabled', '1'); else storage.removeItem('umami.disabled');
      location.reload();
    } catch {
      paused = !paused; renderHistory(); refreshActivity();
      toggle.textContent = paused ? 'Resume analytics & history' : 'Pause analytics & history';
      set('privacy-status', 'Preference applies to this page only; browser storage is unavailable.');
      if (!paused) { start(); connect(); }
    }
  });
}

let ownCountry = null, activity = null, fetching = false, activityAvailable = false;
const countryName = code => { try { return new Intl.DisplayNames(undefined, {type:'region'}).of(code) || code; } catch { return code; } };
const svgNS = 'http://www.w3.org/2000/svg';
function drawMap() {
  if (!panel) return;
  const countries = new Set(activity?.countries.map(row => row.code) || []);
  const pins = panel.querySelector('.visitor-pins'); pins.replaceChildren();
  for (const outline of panel.querySelectorAll('[data-country]')) {
    const code = outline.dataset.country, mine = code === ownCountry, recent = countries.has(code);
    outline.dataset.you = String(mine); outline.dataset.recent = String(recent);
    if (!mine && !recent) continue;
    const circle = document.createElementNS(svgNS, 'circle');
    for (const [key, value] of Object.entries({cx:outline.dataset.x, cy:outline.dataset.y, r:mine ? '4' : '2.5'})) circle.setAttribute(key, value);
    pins.append(circle);
    if (mine) { const ring = circle.cloneNode(); ring.setAttribute('r', '9'); ring.setAttribute('class', 'pin-ring'); pins.append(ring); }
  }
}
function unavailable(message) {
  activity = null; drawMap();
  set('activity-status', message); panel?.querySelector('[data-activity-status]')?.setAttribute('data-connected', 'false');
  for (const item of ['visitors','countries','views']) set(`world-${item}`, '—');
  panel?.querySelectorAll('[data-world-summary], [data-global-legend]').forEach(element => { element.hidden = true; });
  set('activity-update', paused ? 'Analytics paused' : 'Live activity is unavailable');
  set('map-caption', ownCountry ? `Hello from ${countryName(ownCountry)}. Your location is approximate.` : 'Country location is unavailable on this connection.');
}
async function refreshActivity() {
  if (!panel || document.hidden || fetching) return;
  if (paused) return unavailable('Privacy mode');
  if (!activityAvailable) return unavailable('Your visit');
  fetching = true;
  try {
    const response = await fetch('/api/visitor-activity', {signal:AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error('Unavailable');
    const result = await response.json();
    if (result.status !== 'connected') return unavailable(result.reason === 'not_configured' ? 'Not connected yet' : 'Connection unavailable');
    const age = Date.now() - Date.parse(result.observedAt);
    if (!Number.isFinite(age) || age > 90000 || age < -10000) throw new Error('Stale activity');
    activity = result; drawMap();
    panel.querySelectorAll('[data-world-summary], [data-global-legend]').forEach(element => { element.hidden = false; });
    set('activity-status', result.environment === 'preview' ? 'Preview activity' : 'Live · Umami Cloud');
    panel.querySelector('[data-activity-status]').dataset.connected = 'true';
    set('world-visitors', String(result.visitors)); set('world-views', String(result.views)); set('world-countries', String(result.countries.length));
    set('activity-update', `Updated ${new Date(result.observedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · 30-minute window`);
    set('map-caption', result.countries.length ? result.countries.slice().sort((a,b)=>b.visitors-a.visitors).slice(0,4).map(row => `${countryName(row.code)} ${row.visitors}`).join(' · ') : 'No recorded visitors in the last 30 minutes.');
  } catch { unavailable('Connection unavailable'); }
  finally { fetching = false; }
}
async function connect() {
  try {
    const response = await fetch('/api/visitor', {cache:'no-store', signal:AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error('Unavailable');
    const config = await response.json();
    activityAvailable = config.activityAvailable === true;
    ownCountry = /^[A-Z]{2}$/.test(config.country || '') ? config.country : null;
    set('location', ownCountry ? `Joining from ${countryName(ownCountry)}` : 'Your country is unavailable');
    drawMap();
    if (!paused && config.analytics && !document.querySelector('script[data-website-id]')) {
      const url = new URL(config.analytics.scriptUrl);
      if (!['https://cloud.umami.is', 'https://analytics.umami.is'].includes(url.origin)) throw new Error('Unsupported tracker');
      const script = document.createElement('script');
      script.defer = true; script.src = url.href;
      script.dataset.websiteId = config.analytics.websiteId;
      script.dataset.excludeSearch = 'true'; script.dataset.excludeHash = 'true'; script.dataset.doNotTrack = 'true';
      script.dataset.beforeSend = 'cleanUmamiEvent';
      // v2/v3 compatible hook: strip referrer queries as well as page queries.
      window.cleanUmamiEvent = (type, payload) => {
        if (paused || privacySignal || stored(PAUSE_KEY) === 'true' || stored('umami.disabled') === '1') return false;
        if (payload.url) payload.url = payload.url.split(/[?#]/)[0];
        if (payload.referrer) { try { const ref = new URL(payload.referrer); payload.referrer = ref.origin; } catch { payload.referrer = ''; } }
        return payload;
      };
      document.head.append(script);
    }
  } catch { set('location', 'Your country is unavailable'); }
  await refreshActivity();
}
connect();
if (panel) setInterval(refreshActivity, 30000);
