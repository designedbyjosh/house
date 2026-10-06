import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import handler,{normalizePage,validateEvent,readTraffic,trafficScope,publicSnapshot,trafficScript} from '../api/traffic.js';
import {publicPages} from '../content/public-pages.js';
import {validSnapshot,newViews} from '../web/traffic-client.js';
const event=()=>({session:randomUUID(),view:randomUUID(),page:'/projects/',sequence:1,action:'beat',pageview:true});
const raw=(now=Date.now())=>({active:2,pages:{'/projects/':2},buckets:{[Math.floor(now/60000)]:{'/projects/':1}},epoch:'test',sequence:1,pageSequences:{'/projects/':1},accepted:true});
test('traffic accepts only public canonical paths and bounded anonymous events',()=>{
 assert(validateEvent(event(),publicPages));assert.equal(normalizePage('/projects/?private=value#fragment'),'/projects/');
 for(const change of [{page:'/private/'},{page:'https://evil.test/'},{page:'/projects/../private/'},{session:'real-person@example.com'},{sequence:-1},{sequence:Infinity},{action:'delete'},{pageview:'yes'},{view:'x'.repeat(10000)}])assert.equal(validateEvent({...event(),...change},publicPages),null);
});
test('production, preview deployments and local counters cannot share a namespace',()=>{
 const keys=[trafficScope({VERCEL_ENV:'production',VERCEL_URL:'one'}).key,trafficScope({VERCEL_ENV:'preview',VERCEL_URL:'one'}).key,trafficScope({VERCEL_ENV:'preview',VERCEL_URL:'two'}).key,trafficScope({}).key];assert.equal(new Set(keys).size,4);assert.equal(keys[0],trafficScope({VERCEL_ENV:'production',VERCEL_URL:'two'}).key);
});
test('public snapshots expose only counts and 15 filled minute buckets',()=>{
 const now=Date.now();const snapshot=publicSnapshot({...raw(now),sessions:{secret:'private'},token:'secret'},now,{label:'Preview traffic'});
 assert(validSnapshot(snapshot,now));assert.equal(snapshot.buckets.length,15);assert.equal(snapshot.buckets.reduce((sum,b)=>sum+b.views,0),1);assert(!JSON.stringify(snapshot).includes('secret'));
 for(const change of [{active:-1},{state:'healthy'},{observedAt:new Date(now-50000).toISOString()},{observedAt:'bad'},{buckets:[]},{pages:{private:1}}])assert(!validSnapshot({...snapshot,...change},now));
 assert.equal(newViews(null,snapshot),0);assert.equal(newViews(snapshot,{...snapshot,sequence:4}),3);assert.equal(newViews(snapshot,{...snapshot,epoch:'new',sequence:4}),0);assert.equal(newViews(snapshot,{...snapshot,sequence:0}),0);
});
test('Redis credentials stay on the server and requests use atomic bounded script',async()=>{
 let request;const now=Date.now(),input=event();
 const snapshot=await readTraffic({env:{KV_REST_API_URL:'https://store.example',KV_REST_API_TOKEN:'test-secret'},event:input,now,fetcher:async(url,options)=>{request={url,...options};return {ok:true,json:async()=>({result:JSON.stringify(raw(now))})};}});
 assert(validSnapshot(snapshot));assert.equal(request.headers.Authorization,'Bearer test-secret');const command=JSON.parse(request.body);assert.equal(command[0],'EVAL');assert.equal(command[1],trafficScript);assert.equal(command[2],4);assert(!command[5].includes(input.view));assert.equal(command.at(-2),1);assert(request.signal);assert.equal(request.redirect,'error');assert(!JSON.stringify(snapshot).includes('test-secret'));
 await assert.rejects(readTraffic({env:{}}),/unavailable/);
 await assert.rejects(readTraffic({env:{KV_REST_API_URL:'https://store.example',KV_REST_API_TOKEN:'test'},fetcher:async()=>({ok:false})}),/unavailable/);
});
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=JSON.parse(body);}};}
test('API rejects cross-origin writes, arbitrary paths, oversized bodies and unsupported methods',async()=>{
 for(const [req,status] of [[{method:'DELETE',headers:{}},405],[{method:'POST',headers:{origin:'https://elsewhere.test',host:'site.test'},body:event()},403],[{method:'POST',headers:{origin:'https://site.test',host:'site.test'},body:{...event(),page:'/admin/'}},400],[{method:'POST',headers:{origin:'https://site.test',host:'site.test'},body:'x'.repeat(1025)},400]]){const res=response();await handler(req,res);assert.equal(res.statusCode,status);assert.deepEqual(res.body,{state:'unavailable'});assert.equal(res.headers['Cache-Control'],'no-store');assert(!('Access-Control-Allow-Origin' in res.headers));}
});
test('traffic route precedes the production static proxy and browser code contains no store configuration',async()=>{
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url)));assert(config.routes.findIndex(r=>r.src==='/api/traffic')<config.routes.findIndex(r=>r.has));
 const client=await readFile(new URL('../web/traffic-client.js',import.meta.url),'utf8');assert(!/UPSTASH|KV_REST|Authorization|referrer|userAgent/.test(client));
});
