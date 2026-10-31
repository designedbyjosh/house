import {HISTORY_KEY, PAUSE_KEY, VisitHistory, formatDuration} from './visit-history.js';
import {countryFrame, worldFrame} from './visitor-camera.js';

const panel = document.querySelector('[data-visitor-panel]');
const set = (name, value) => { const element=panel?.querySelector(`[data-${name}]`); if(element) element.textContent=value; };
let storage, tabStorage;
try { storage=window.localStorage; } catch { /* Storage can be disabled. */ }
try { tabStorage=window.sessionStorage; } catch { /* History can still use local storage. */ }
const stored = key => { try { return storage?.getItem(key); } catch { return null; } };
const privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
let paused = privacySignal || stored(PAUSE_KEY) === 'true' || stored('umami.disabled') === '1';
let tracker=new VisitHistory({storage,sessionStorage:tabStorage}), lastTick=performance.now(), visible=!document.hidden;
const path=location.pathname;
const navigation={navigationType:performance.getEntriesByType('navigation')[0]?.type,referrer:document.referrer,origin:location.origin};
const dateLabel = value => new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(value);
let listSignature='';
function renderHistory() {
  if(!panel) return;
  const list=panel.querySelector('[data-visit-history]');
  if(paused) {
    set('visit-duration','Paused'); set('visit-pages','—'); set('visit-count','History paused');
    set('last-visit','Paused'); set('last-duration','—');
    set('last-context','No new activity is saved');
    set('history-note',privacySignal ? 'Your browser privacy preference pauses local history and analytics.' : 'Local history and analytics are paused.');
    list.replaceChildren(); listSignature=''; return;
  }
  const {current,lastAccess,visits,persistent}=tracker.snapshot();
  set('welcome',lastAccess ? 'Good to have you back.' : 'Make yourself at home.');
  set('visit-duration',formatDuration(current?.activeMs || 0));
  set('visit-pages',String(current?.paths.length || 0));
  set('visit-count',`${visits.length} ${persistent ? 'saved ' : ''}${visits.length===1 ? 'visit' : 'visits'}`);
  set('last-visit',lastAccess ? dateLabel(lastAccess.lastSeen) : 'First visit');
  const sameVisit=lastAccess?.id===current?.id;
  set('last-context',lastAccess ? sameVisit ? 'Earlier in this visit' : 'Before this visit' : 'This visit is your first saved memory');
  set('last-duration',lastAccess ? formatDuration(lastAccess.activeMs) : '—');
  set('last-duration-label',sameVisit ? 'Time already spent' : 'Last stay');
  set('last-duration-note',sameVisit ? 'Before opening this page' : 'Visible-tab time on your last visit');
  set('history-note',persistent ? 'Your recent visits, saved on this browser and domain for up to 90 days.' : 'Browser storage is unavailable. This page is tracked in memory only; it won’t be saved.');
  const recent=visits.slice(0,5);
  const signature=recent.map(v=>`${v.id}:${v.id===current?.id}`).join('|');
  if(signature!==listSignature) {
    list.replaceChildren(); listSignature=signature;
    for(const visit of recent) {
      const row=document.createElement('li'); row.dataset.visitId=visit.id;
      const date=document.createElement('span'); date.className='history-date';
      const time=document.createElement('time'); time.dateTime=new Date(visit.startedAt).toISOString(); time.textContent=dateLabel(visit.startedAt); date.append(time);
      if(visit.id===current?.id) { const badge=document.createElement('span'); badge.className='history-current'; badge.textContent='This visit'; date.append(badge); }
      const duration=document.createElement('span'); duration.className='history-duration';
      const pages=document.createElement('span'); pages.className='history-pages';
      row.append(date,duration,pages); list.append(row);
    }
  }
  for(const [index,visit] of recent.entries()) {
    const row=list.children[index];
    row.querySelector('.history-duration').textContent=formatDuration(visit.activeMs);
    row.querySelector('.history-pages').textContent=`${visit.paths.length} ${visit.paths.length===1 ? 'page' : 'pages'}`;
  }
}
function start() { if(!paused) tracker.start(path,navigation); renderHistory(); }
function tick() {
  const elapsed=performance.now()-lastTick; lastTick=performance.now();
  if(paused || !visible) return;
  tracker.tick(elapsed); renderHistory();
}
start();
setInterval(tick,1000);
document.addEventListener('visibilitychange',()=>{
  tick(); visible=!document.hidden; lastTick=performance.now();
  if(visible) { tick(); if(panel) refreshActivity(); }
});
window.addEventListener('pagehide',()=>{ tick(); visible=false; });
window.addEventListener('pageshow',event=>{ if(event.persisted) { tracker.refresh(); tracker.lastAccess=structuredClone(tracker.snapshot().current || null); lastTick=performance.now(); visible=!document.hidden; tick(); } });
window.addEventListener('storage',event=>{
  if([PAUSE_KEY,'umami.disabled'].includes(event.key)) location.reload();
  if(event.key===HISTORY_KEY && !paused) { tracker.refresh(); renderHistory(); }
});
panel?.querySelector('[data-clear-history]')?.addEventListener('click',()=>{
  tracker.clear({restart:!paused}); renderHistory(); set('privacy-status','Your earlier visits have been cleared.');
});
const toggle=panel?.querySelector('[data-toggle-analytics]');
if(toggle) {
  toggle.textContent=paused ? 'Resume analytics & history' : 'Pause analytics & history'; toggle.disabled=privacySignal;
  toggle.addEventListener('click',()=>{
    try {
      if(!storage) throw new Error('No storage');
      storage.setItem(PAUSE_KEY,String(!paused));
      if(!paused) storage.setItem('umami.disabled','1'); else storage.removeItem('umami.disabled');
      location.reload();
    } catch {
      paused=!paused; renderHistory(); refreshActivity();
      toggle.textContent=paused ? 'Resume analytics & history' : 'Pause analytics & history';
      set('privacy-status','Preference applies to this page only; browser storage is unavailable.');
      if(!paused) { start(); connect(); }
    }
  });
}

let ownCountry = null, activity = null, fetching = false, activityAvailable = false;
const countryName = code => { try { return new Intl.DisplayNames(undefined, {type:'region'}).of(code) || code; } catch { return code; } };
const svgNS = 'http://www.w3.org/2000/svg';
const wallpaper=panel?.querySelector('.visitor-wallpaper');
const map=panel?.querySelector('.visitor-map');
const mapToggle=panel?.querySelector('[data-map-toggle]');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let frame=null, animation=null, focusedCountry=null, showWorld=false;
function applyFrame(value) {
  frame=value; map.setAttribute('viewBox',`${value.x} ${value.y} ${value.width} ${value.height}`);
  const unit=value.width/Math.max(1,wallpaper.clientWidth);
  panel.querySelectorAll('.visitor-pins circle').forEach(circle=>circle.setAttribute('r',String(unit*(circle.classList.contains('pin-ring') ? 10 : 3.5))));
}
function focusCamera(animate=true) {
  if(!map || !wallpaper) return;
  const outline=[...panel.querySelectorAll('[data-country]')].find(p=>p.dataset.country===ownCountry);
  const bounds=outline?.getBBox();
  const target=outline && !showWorld ? countryFrame({x:Number(outline.dataset.x),y:Number(outline.dataset.y),width:bounds.width,height:bounds.height},wallpaper.clientWidth,wallpaper.clientHeight) : worldFrame(wallpaper.clientWidth,wallpaper.clientHeight);
  if(animation) cancelAnimationFrame(animation);
  if(!frame || !animate || reducedMotion.matches) { applyFrame(target); return; }
  const from={...frame},started=performance.now();
  const move=now=>{
    const progress=Math.min(1,(now-started)/1300),ease=1-(1-progress)**3;
    applyFrame(Object.fromEntries(Object.keys(target).map(key=>[key,from[key]+(target[key]-from[key])*ease])));
    if(progress<1) animation=requestAnimationFrame(move); else animation=null;
  };
  animation=requestAnimationFrame(move);
}
if(wallpaper) {
  new ResizeObserver(()=>focusCamera(false)).observe(wallpaper);
  reducedMotion.addEventListener('change',()=>focusCamera(false));
  mapToggle.addEventListener('click',()=>{ showWorld=!showWorld; mapToggle.textContent=showWorld ? 'Focus on my country ↗' : 'Show the world ↗'; focusCamera(); });
  focusCamera(false);
}
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
  const canFocus=[...panel.querySelectorAll('[data-country]')].some(p=>p.dataset.country===ownCountry);
  mapToggle.hidden=!canFocus;
  if(focusedCountry!==ownCountry) { focusedCountry=ownCountry; focusCamera(); }
  else if(frame) applyFrame(frame);
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
  if (!activityAvailable) return unavailable('Your corner of the world');
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
    set('country-name',ownCountry ? `${countryName(ownCountry)}.` : 'Somewhere.');
    set('location',ownCountry ? `${countryName(ownCountry)} · approximate country` : 'Country location is unavailable');
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
