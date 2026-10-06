// A short-lived random tab token, never an account or cross-site identity.
const KEY='house-presence-v1';
export function validSnapshot(value, now=Date.now()) {
  const count=n=>Number.isSafeInteger(n)&&n>=0;
  const counts=v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.entries(v).every(([k,n])=>/^\/(?:[a-z0-9-]+\/)*$/.test(k)&&count(n));
  return value?.state==='live' && ['Production traffic','Preview traffic','Local traffic'].includes(value.scope) && Number.isFinite(Date.parse(value.observedAt)) && Math.abs(now-Date.parse(value.observedAt))<45000 && count(value.active) && counts(value.pages) && count(value.sequence) && counts(value.pageSequences) && typeof value.epoch==='string' && Array.isArray(value.buckets) && value.buckets.length===15 && value.buckets.every(b=>count(b.minute)&&count(b.views)&&counts(b.pages));
}
export function newViews(previous, current) {
  if (!previous || previous.epoch!==current.epoch) return 0;
  return Math.max(0,current.sequence-previous.sequence);
}
if (typeof document !== 'undefined' && document.body.dataset.trafficPage) {
  const page = document.body.dataset.trafficPage;
  let session, sequence=0, snapshot=null, busy=false, timer, failures=0, recorded=false;
  const view = crypto.randomUUID();
  let optedOut=navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true;
  try {optedOut ||= localStorage.getItem('house-traffic-optout')==='1';const saved=JSON.parse(sessionStorage.getItem(KEY)||'null');if(/^[a-f0-9-]{36}$/.test(saved?.session||'')&&Number.isSafeInteger(saved?.sequence)&&saved.sequence>=0&&saved.sequence<1e12){session=saved.session;sequence=saved.sequence;}} catch {}
  session ||= crypto.randomUUID();
  function publish(data) {snapshot=data;window.houseTraffic=data;window.dispatchEvent(new CustomEvent('traffic-update',{detail:data}));}
  function body(action) {sequence++;try{sessionStorage.setItem(KEY,JSON.stringify({session,sequence}));}catch{}return JSON.stringify({session,view,page,sequence,action,pageview:!recorded});}
  function leave() {
    if(optedOut)return;
    const payload=body('leave');
    fetch('/api/traffic',{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true,credentials:'omit'}).catch(()=>{});
  }
  async function refresh() {
    if(document.hidden||busy)return;
    busy=true;const writing=!optedOut;
    try {
      const response=await fetch('/api/traffic',!writing?{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(6000)}:{method:'POST',headers:{'Content-Type':'application/json'},body:body('beat'),credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(6000)});
      const data=await response.json();
      if(!response.ok||!validSnapshot(data))throw new Error('unavailable');
      if(writing)recorded=true;failures=0;publish(data);
    } catch {failures++;publish({state:'unavailable'});}
    finally {busy=false;clearTimeout(timer);if(!document.hidden)timer=setTimeout(refresh,Math.min(20000*2**Math.min(failures,3),160000));}
  }
  window.houseTrafficRefresh=refresh;
  document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(document.hidden)leave();else refresh();});
  window.addEventListener('pagehide',()=>{clearTimeout(timer);leave();});
  window.addEventListener('pageshow',event=>{if(event.persisted)refresh();});
  const toggle=document.querySelector('[data-traffic-optout]');
  function syncToggle(){if(toggle){toggle.textContent=optedOut?'Counting off on this browser':'Exclude this browser';toggle.setAttribute('aria-pressed',String(optedOut));toggle.disabled=navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true;}}
  toggle?.addEventListener('click',()=>{if(!optedOut)leave();optedOut=!optedOut;try{localStorage.setItem('house-traffic-optout',optedOut?'1':'0');}catch{}syncToggle();refresh();});
  window.addEventListener('storage',event=>{if(event.key==='house-traffic-optout'){if(!optedOut)leave();optedOut=event.newValue==='1'||navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true;syncToggle();refresh();}});
  syncToggle();refresh();
  // Never leave a green live badge attached to an old snapshot.
  setInterval(()=>{if(snapshot?.state==='live'&&!validSnapshot(snapshot))publish({state:'unavailable'});},5000);
}
