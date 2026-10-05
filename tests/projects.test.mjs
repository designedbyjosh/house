import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {projects,projectPage,projectsIndex} from '../scripts/projects.mjs';
import {scenes,flowEdges,connectionPoint} from '../web/project-graph.js';
import {nextTrace} from '../web/project-explorer.js';
import {buildModels,cameraMatrix,projectPoint} from '../web/project-renderer.js';
import {readStatus,validObservation} from '../web/project-status.js';
import {checkPublicBlog} from '../api/public-status.js';
for(const [slug,scene] of Object.entries(scenes)){
 test(`${slug}: topology is connected and denied traffic cannot leave the gate`,()=>{
  const ids=new Set(scene.nodes.map(n=>n.id));assert.equal(ids.size,scene.nodes.length);
  for(const edge of scene.edges){assert(ids.has(edge.a));assert(ids.has(edge.b));}
  const blocked=flowEdges(scene,'blocked');assert(blocked.length>0);assert(blocked.some(e=>e.b===scene.gate));assert(blocked.every(e=>e.a!==scene.gate));
  let index=-1;for(let i=0;i<=blocked.length;i++){const trace=nextTrace(scene,'blocked',index);index=trace.index;if(i===blocked.length)assert.match(trace.text,/Access denied/);}
  const normal=flowEdges(scene);assert(!normal.some(e=>e.optional||e.deniedOnly));
 });
 test(`${slug}: finite 3D geometry and usable camera projection`,()=>{
  const vertices=buildModels(scene);assert(vertices.length>5000);assert.equal(vertices.length%27,0);assert(vertices.every(Number.isFinite));
  for(const [w,h] of [[880,580],[340,470]]){
   const m=cameraMatrix(-.24,.69,(scene.nodes.length>6?23:22)*Math.max(1,620/w),w/h,scene.nodes.length>6?[0,0,-1.7]:[0,0,0]);
   for(const node of scene.nodes){const p=projectPoint(node.position,m,w,h);assert(p.visible);assert(p.x>0&&p.x<w,`${slug} clipped horizontally at ${w}`);assert(p.y>0&&p.y<h);}
  }
 });
}
test('Tesla defaults to saved observations and only illustrates provider operations explicitly',()=>{
 assert(!flowEdges(scenes.tesla).some(e=>e.b==='fleet'));assert(flowEdges(scenes.tesla,'provider').some(e=>e.b==='fleet'));
});
test('curved flow connects the expected endpoints',()=>{assert.deepEqual(connectionPoint([0,0,0],[4,0,2],0),[0,.55,0]);assert(Math.abs(connectionPoint([0,0,0],[4,0,2],1)[0]-4)<1e-6);});
test('public descriptions and browser data omit operational identifiers',async()=>{
 const html=projectsIndex()+projects.map(projectPage).join('');const graph=await readFile(new URL('../web/project-graph.js',import.meta.url),'utf8');
 assert(!/\b\d{12}\b|arn:aws:|127\.0\.0\.1|mcp\.whitcombe\.me|i-[a-f0-9]{17}|cognito-idp|BEGIN .*PRIVATE KEY/.test(html+graph));
 assert(!/\son\w+=|<iframe|<form/.test(html));for(const p of projects)assert(projectPage(p).includes('Read the complete flow'));
});
test('status rejects stale, future, invalid and invented healthy responses',()=>{
 const now=Date.now();const observation={state:'reachable',latencyMs:30,checkedAt:new Date(now).toISOString()};assert(validObservation(observation,now));
 for(const value of [{...observation,checkedAt:new Date(now-130000).toISOString()},{...observation,checkedAt:new Date(now+60000).toISOString()},{...observation,state:'healthy'},{...observation,latencyMs:-4}])assert(!validObservation(value,now));
});
test('client failures remain unavailable or unknown rather than healthy',async()=>{
 const failed=await readStatus(async()=>{throw new Error('offline');});assert.equal(failed.local.state,'unavailable');assert.equal(failed.blog.state,'unknown');
 const malformed=await readStatus(async()=>({ok:true,json:async()=>({})}));assert.equal(malformed.local.state,'unavailable');assert.equal(malformed.blog.state,'unknown');
});
test('public monitor uses one fixed HEAD target with no redirects or request data',async()=>{
 let request;const observation=await checkPublicBlog(async(url,options)=>{request={url,options};return {status:200};});
 assert.equal(request.url,'https://josh.engineer/articles/');assert.equal(request.options.method,'HEAD');assert.equal(request.options.redirect,'manual');assert.equal(request.options.body,undefined);assert.equal(observation.state,'reachable');
 for(const status of [301,401,403,500])assert.equal((await checkPublicBlog(async()=>({status}))).state,'unavailable');
 const failed=await checkPublicBlog(async()=>{throw new Error('secret internal message');});assert.equal(failed.state,'unavailable');assert(!JSON.stringify(failed).includes('secret'));
});
test('status route runs before the production proxy and browser policy stays same-origin',async()=>{
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
 assert.equal(config.routes[0].src,'/api/public-status');
 const template=JSON.parse(await readFile(new URL('../infra/site.json',import.meta.url),'utf8'));
 const csp=template.Resources.SecurityHeaders.Properties.ResponseHeadersPolicyConfig.SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy;
 assert(csp.includes("connect-src 'self'"));assert(!csp.includes('unsafe-inline'));
});
