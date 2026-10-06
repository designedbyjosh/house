// Opt-in integration check against the configured real Redis store. A unique
// preview namespace and automatic expiry keep production traffic untouched.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readTraffic} from '../api/traffic.js';
const env={...process.env,VERCEL_ENV:'preview',VERCEL_URL:`verification-${randomUUID()}.invalid`};
const start=Date.now();
const first={session:randomUUID(),view:randomUUID(),page:'/projects/',sequence:1,action:'beat',pageview:true};
const second={...first,session:randomUUID(),view:randomUUID(),page:'/articles/'};
const run=(event=null,offset=0)=>readTraffic({env,event,now:start+offset});
let result=await run(first);assert.equal(result.active,1);assert.equal(result.sequence,1);assert(result.accepted);
result=await run(first,50);assert.equal(result.active,1);assert.equal(result.sequence,1);assert(!result.accepted);
await Promise.all([run({...first,sequence:2,pageview:false},100),run(second,100)]);
result=await run(null,200);assert.equal(result.active,2);assert.equal(result.sequence,2);assert.equal(result.pages['/projects/'],1);assert.equal(result.pages['/articles/'],1);
await run({...first,sequence:4,action:'leave',pageview:false},300);
result=await run({...first,sequence:3,pageview:false},400);assert.equal(result.active,1,'delayed heartbeat cannot revive a hidden tab');assert.equal(result.sequence,2);
result=await run({...first,sequence:5,pageview:true},500);assert.equal(result.active,2);assert.equal(result.sequence,2,'visibility resume must not count another view');
const nextPage={...first,view:randomUUID(),sequence:7,page:'/projects/blog/',pageview:true};
result=await run(nextPage,600);assert.equal(result.active,2);assert.equal(result.pages['/projects/']||0,0);assert.equal(result.pages['/projects/blog/'],1);assert.equal(result.sequence,3);
result=await run({...first,sequence:6,action:'leave',pageview:false},700);assert.equal(result.active,2,'old document leave cannot erase a newer page');
result=await run(null,60_700);assert.equal(result.active,0,'presence expires without a leave event');assert.equal(result.sequence,3);
result=await run({...nextPage,sequence:8,pageview:false},17*60_000);assert.equal(result.active,1);assert.equal(result.sequence,3,'long-lived document heartbeat cannot create a page view');assert.equal(result.buckets.reduce((total,b)=>total+b.views,0),0,'old minute buckets are excluded');
assert(!JSON.stringify(result).includes(first.session));assert(!JSON.stringify(result).includes(first.view));
console.log('Real Redis verification passed: concurrent viewers, retry deduplication, hidden tabs, out-of-order navigation, 60-second expiry, 15-minute history and aggregate-only responses. Test keys expire automatically.');
