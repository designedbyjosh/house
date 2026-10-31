import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {configuration, aggregateRealtime, readRealtime, countryCode} from '../lib/umami.js';
import visitor from '../api/visitor.js';
import {readHistory, beginVisit, addActiveTime, SESSION_GAP, HISTORY_KEY} from '../web/visit-history.js';

const id = '12345678-1234-1234-1234-123456789abc';
const env = {VERCEL_ENV:'production', UMAMI_WEBSITE_ID:id, UMAMI_SCRIPT_URL:'https://cloud.umami.is/script.js', UMAMI_API_KEY:'server-only-test-key'};
test('preview and local environments never inherit production tracking or API keys', () => {
  assert.equal(configuration({...env, VERCEL_ENV:'preview'}), null);
  assert.equal(configuration({...env, VERCEL_ENV:undefined}), null);
  const config = configuration({...env, VERCEL_ENV:'preview', UMAMI_PREVIEW_WEBSITE_ID:id});
  assert.equal(config.credential, null); assert.equal(config.environment, 'preview');
});
test('tracker configuration accepts only approved HTTPS Cloud script URLs and website IDs', () => {
  assert.equal(configuration(env).websiteId, id);
  for (const value of ['http://cloud.umami.is/script.js','https://evil.test/script.js','https://name:pass@cloud.umami.is/script.js','https://cloud.umami.is/script.js?secret=1','https://cloud.umami.is/anything']) assert.equal(configuration({...env,UMAMI_SCRIPT_URL:value}),null);
  assert.equal(configuration({...env,UMAMI_WEBSITE_ID:'../../users'}),null);
});
test('public activity contains only aggregate counts, never individual visitor rows', () => {
  const output = aggregateRealtime({countries:{AU:2,US:1,XX:9},totals:{visitors:3,views:8},events:[{sessionId:'private',city:'Sydney',urlPath:'/private'}],referrers:{'private.example':1}}, 100000);
  assert.deepEqual(output.countries,[{code:'AU',visitors:2},{code:'US',visitors:1}]);
  assert.equal(output.visitors,3); assert.equal(output.windowMinutes,30);
  assert(!JSON.stringify(output).includes('private')); assert(!('events' in output));
});
test('malformed upstream data is unavailable instead of invented zeroes', () => {
  for (const data of [{},{countries:[],totals:{}},{countries:{AU:-1},totals:{visitors:1,views:1}},{countries:{AU:1},totals:{visitors:'2',views:1}},{countries:{},totals:{visitors:NaN,views:1}}]) assert.throws(()=>aggregateRealtime(data));
});
test('Cloud calls use Bearer authentication with a fixed destination and timeout', async () => {
  const result = await readRealtime(configuration(env), {now:2000000,fetcher:async (url, options) => {
    assert.equal(url.origin,'https://api.umami.is'); assert.equal(url.pathname,`/v1/realtime/${id}`);
    assert.equal(options.headers.Authorization,'Bearer server-only-test-key'); assert.equal(options.redirect,'error'); assert(options.signal);
    return {ok:true,json:async()=>({countries:{},totals:{visitors:0,views:0}})};
  }});
  assert.equal(result.visitors,0);
  await assert.rejects(readRealtime(configuration(env),{fetcher:async()=>({ok:false})}),/unavailable/);
});
function response() { return {headers:{},setHeader(k,v){this.headers[k]=v;},end(text){this.body=JSON.parse(text);}}; }
test('location responses cannot be shared-cache hits and never include the API secret', () => {
  const previous = {...process.env};
  try {
    Object.assign(process.env,env,{VERCEL:'1'});
    const res=response(); visitor({method:'GET',headers:{'x-vercel-ip-country':'AU'}},res);
    assert.equal(res.body.country,'AU'); assert.equal(res.headers['Cache-Control'],'private, no-store');
    assert(!JSON.stringify(res.body).includes('server-only')); assert.equal(res.body.analytics.websiteId,id);
    delete process.env.VERCEL;
    const local=response(); visitor({method:'GET',headers:{'x-vercel-ip-country':'AU'}},local); assert.equal(local.body.country,null);
    const post=response(); visitor({method:'POST',headers:{}},post); assert.equal(post.statusCode,405);
  } finally { for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key]; Object.assign(process.env,previous); }
});
test('unknown and invalid country headers never become a guessed location', () => {
  for (const value of [undefined,'XX','ZZ','AU,US','<script>','au',['AU']]) assert.equal(countryCode(value),null);
  assert.equal(countryCode('AU'),'AU');
});
const now=1800000000000;
test('navigation resumes a visit, while thirty minutes away starts a new one with its duration intact', () => {
  let history=beginVisit([],now,'/');
  history=addActiveTime(history,now+4000,4000);
  history=beginVisit(history,now+5000,'/articles/');
  assert.equal(history.length,1); assert.equal(history[0].pageviews,2); assert.equal(history[0].activeMs,4000);
  assert.deepEqual(history[0].paths,['/','/articles/']);
  history=beginVisit(history,now+5000+SESSION_GAP,'/visitors/');
  assert.equal(history.length,2); assert.equal(history[1].activeMs,4000); assert.equal(history[0].activeMs,0);
});
test('overlapping tabs and backwards clocks cannot double-count or subtract active time', () => {
  const history=beginVisit([],now,'/');
  addActiveTime(history,now+1000,1000); addActiveTime(history,now+1000,1000);
  assert.equal(history[0].activeMs,1000);
  addActiveTime(history,now-1000,1000); assert.equal(history[0].activeMs,1000);
  addActiveTime(history,now+100000,100000); assert.equal(history[0].activeMs,6000);
});
test('history is bounded, expires after 90 days, and tolerates denied or corrupted storage', () => {
  const valid=beginVisit([],now,'/')[0];
  const storage={getItem:key=>{assert.equal(key,HISTORY_KEY); return JSON.stringify([{...valid,startedAt:now-91*86400000}, {...valid,activeMs:-1}, {...valid,paths:['https://external.test']},...Array.from({length:25},()=>valid)]);}};
  assert.equal(readHistory(storage,now).length,20);
  assert.deepEqual(readHistory({getItem(){throw Error('denied');}},now),[]);
  assert.deepEqual(readHistory({getItem(){return '{';}},now),[]);
});
test('country outlines are local, non-executable, and include major visitor regions',async()=>{
  const svg=await readFile(new URL('../public/assets/maps/world.svg',import.meta.url),'utf8');
  for(const code of ['AU','US','GB','JP','NZ','FR']) assert(svg.includes(`data-country="${code}"`));
  assert(!/<script|<image|<foreignObject|\son\w+=/.test(svg));
});
test('Vercel routes visitor functions before the production-only AWS proxy',async()=>{
  const {routes}=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
  assert.equal(routes[0].dest,'/api/$1');
  for(const rule of routes.filter(r=>r.dest?.startsWith('https:'))) assert(rule.has.some(x=>x.type==='host'));
  assert(routes.some(r=>r.handle==='filesystem'));
});
