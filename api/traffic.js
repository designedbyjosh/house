import {createHash,randomUUID} from 'node:crypto';
import {publicPages} from '../content/public-pages.js';

export const ACTIVE_MS = 60_000;
export const HISTORY_MINUTES = 15;
const tokenPattern = /^[a-f0-9-]{36}$/;
const routePattern = /^\/(?:[a-z0-9-]+\/)*$/;

// Atomic updates across every function instance. Presence and de-duplication are
// short lived; only minute totals are included in the public response.
export const trafficScript = `
local now = tonumber(ARGV[1])
local action = ARGV[2]
local minute = math.floor(now / 60000)
local requests = redis.call('INCR', KEYS[4])
if requests == 1 then redis.call('EXPIRE', KEYS[4], 120) end
if requests > 1800 then return cjson.encode({error='rate_limited'}) end
local presence = cjson.decode(redis.call('GET', KEYS[1]) or '{}')
local stats = cjson.decode(redis.call('GET', KEYS[2]) or '{"sequence":0,"buckets":{},"pages":{}}')
if not stats.epoch then stats.epoch = ARGV[7] end
for id, session in pairs(presence) do
  if session.at <= now - 120000 then presence[id] = nil end
end
for bucket, counts in pairs(stats.buckets) do
  if tonumber(bucket) < minute - 14 then stats.buckets[bucket] = nil end
end
local accepted = false
if action ~= 'read' then
  local id, page, seq = ARGV[3], ARGV[4], tonumber(ARGV[5])
  local previous = presence[id]
  local size = 0
  for _ in pairs(presence) do size = size + 1 end
  if not previous and size >= 1000 then return cjson.encode({error='capacity'}) end
  if not previous or seq > previous.seq then
    presence[id] = {page=page, seq=seq, at=now, active=action == 'beat'}
    if action == 'beat' and ARGV[6] == '1' and redis.call('SET', KEYS[3], '1', 'EX', 960, 'NX') then
      accepted = true
      stats.sequence = stats.sequence + 1
      stats.pages[page] = (stats.pages[page] or 0) + 1
      local bucket = tostring(minute)
      if not stats.buckets[bucket] then stats.buckets[bucket] = {} end
      stats.buckets[bucket][page] = (stats.buckets[bucket][page] or 0) + 1
    end
  end
  redis.call('SET', KEYS[1], cjson.encode(presence), 'EX', 120)
  redis.call('SET', KEYS[2], cjson.encode(stats), 'EX', 960)
end
local active = {}
local total = 0
for _, session in pairs(presence) do
  if session.active and session.at > now - 60000 then
    total = total + 1
    active[session.page] = (active[session.page] or 0) + 1
  end
end
return cjson.encode({active=total, pages=active, buckets=stats.buckets, sequence=stats.sequence, pageSequences=stats.pages, epoch=stats.epoch, accepted=accepted})
`;

export function normalizePage(value) {
  if (typeof value !== 'string' || value.length > 180) return null;
  const page = value.split(/[?#]/, 1)[0];
  return routePattern.test(page) ? page : null;
}
export function validateEvent(body, allowedPages) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const page = normalizePage(body.page);
  if (!page || !allowedPages.has(page) || typeof body.session !== 'string' || !tokenPattern.test(body.session) || typeof body.view !== 'string' || !tokenPattern.test(body.view) || !Number.isSafeInteger(body.sequence) || body.sequence < 1 || body.sequence > 1e12 || !['beat','leave'].includes(body.action) || typeof body.pageview !== 'boolean') return null;
  return {page, session:body.session, view:body.view, sequence:body.sequence, action:body.action, pageview:body.pageview};
}
export function trafficScope(env) {
  const production = env.VERCEL_ENV === 'production';
  const identity = production ? 'production' : `${env.VERCEL_ENV || 'development'}:${env.VERCEL_URL || 'local'}`;
  return {key:`house:traffic:v1:${createHash('sha256').update(identity).digest('hex').slice(0,24)}`, label:production?'Production traffic':env.VERCEL_ENV==='preview'?'Preview traffic':'Local traffic'};
}
export function publicSnapshot(result, now, scope) {
  const buckets = Array.from({length:HISTORY_MINUTES}, (_, i) => {
    const minute = Math.floor(now / 60000) - HISTORY_MINUTES + 1 + i;
    const pages = result.buckets[String(minute)] || {};
    return {minute:minute*60000, views:Object.values(pages).reduce((sum, value)=>sum+value,0), pages};
  });
  return {state:'live', scope:scope.label, observedAt:new Date(now).toISOString(), activeWindowSeconds:ACTIVE_MS/1000, active:result.active, pages:result.pages, buckets, sequence:result.sequence, pageSequences:result.pageSequences, epoch:result.epoch, accepted:result.accepted};
}
export async function readTraffic({env=process.env, event=null, now=Date.now(), fetcher=fetch}={}) {
  const url = env.TRAFFIC_REDIS_REST_URL || env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.TRAFFIC_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !url.startsWith('https://')) throw new Error('unavailable');
  const scope = trafficScope(env);
  const viewKey = event ? createHash('sha256').update(`${event.session}:${event.view}`).digest('hex') : 'read';
  const response = await fetcher(url, {method:'POST', headers:{Authorization:`Bearer ${token}`, 'Content-Type':'application/json'}, body:JSON.stringify(['EVAL',trafficScript,4,`${scope.key}:presence`,`${scope.key}:stats`,`${scope.key}:view:${viewKey}`,`${scope.key}:budget:${Math.floor(now/60000)}`,now,event?.action||'read',event?.session||'',event?.page||'',event?.sequence||0,event?.pageview?1:0,randomUUID()]), signal:AbortSignal.timeout(4000), redirect:'error'});
  if (!response.ok) throw new Error('unavailable');
  const data = await response.json();
  if (data.error || typeof data.result !== 'string') throw new Error('unavailable');
  const result = JSON.parse(data.result);
  if (result.error) throw new Error(result.error === 'rate_limited' || result.error === 'capacity' ? 'busy' : 'unavailable');
  return publicSnapshot(result, now, scope);
}
export function sameOrigin(req) {
  try {
    const origin = new URL(req.headers.origin);
    return origin.host === req.headers.host && (origin.protocol === 'https:' || (process.env.VERCEL_ENV !== 'production' && ['localhost','127.0.0.1'].includes(origin.hostname) && origin.protocol === 'http:'));
  } catch { return false; }
}
export default async function handler(req, res) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  const send = (status, body) => {res.statusCode=status;res.end(JSON.stringify(body));};
  if (!['GET','POST'].includes(req.method)) {res.setHeader('Allow','GET, POST');return send(405,{state:'unavailable'});}
  try {
    let event=null;
    if (req.method === 'POST') {
      if (!sameOrigin(req)) return send(403,{state:'unavailable'});
      const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? String(req.body) : JSON.stringify(req.body);
      if (!raw || Buffer.byteLength(raw)>1024) return send(400,{state:'unavailable'});
      let parsed;try {parsed=JSON.parse(raw);} catch {return send(400,{state:'unavailable'});}
      event = validateEvent(parsed, publicPages);
      if (!event) return send(400,{state:'unavailable'});
    }
    return send(200,await readTraffic({event}));
  } catch (error) { return send(error.message==='busy'?429:503,{state:'unavailable'}); }
}
