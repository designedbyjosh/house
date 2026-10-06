import {scenes,flowEdges} from './project-graph.js';
import {validSnapshot,newViews} from './traffic-client.js';
import {createRenderer} from './project-renderer.js';
import {readStatus} from './project-status.js';
export function nextTrace(scene,scenario,index){
 const edges=flowEdges(scene,scenario);const current=(index+1)%(edges.length+1);
 if(current===edges.length)return {index:current,node:scenario==='blocked'?scene.gate:scene.nodes[0].id,text:scenario==='blocked'?'Access denied. The request stops at the authorization boundary; no downstream operation occurs.':'Trace complete. The result returns over the same authorized connection.'};
 const edge=edges[current],from=scene.nodes.find(n=>n.id===edge.a),to=scene.nodes.find(n=>n.id===edge.b);
 return {index:current,node:to.id,text:`${String(current+1).padStart(2,'0')} / ${from.name} → ${to.name} · ${edge.label}`};
}
if(typeof document!=='undefined')for(const root of document.querySelectorAll('[data-explorer]')){
 const source=scenes[root.dataset.explorer];if(!source)continue;const scene={...source,slug:root.dataset.explorer};
 const $=selector=>root.querySelector(selector),all=selector=>[...root.querySelectorAll(selector)];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const state={mode:['overview','blog'].includes(scene.slug)?'live':'walkthrough',pulses:[],time:.5,selected:scene.nodes[0].id,scenario:'normal',view:'flow',running:!reduced.matches,speed:.8};
 let renderer=null,frame=null,previous=0,traceIndex=-1,traceTimer=null,statusBusy=false,lastStatus=null,pollTimer=null,lastTraffic=null;
 $('[data-scene-title]').textContent=scene.title;$('[data-node-count]').textContent=`${scene.nodes.length} NODES`;
 const select=$('[data-service]');for(const node of scene.nodes){const option=document.createElement('option');option.value=node.id;option.textContent=node.name;select.append(option);}
 function syncPlay(){const button=$('[data-play]');button.textContent=state.running?'Ⅱ Pause':'▶ Play';button.setAttribute('aria-pressed',String(state.running));}
 function selectNode(id){
  const node=scene.nodes.find(n=>n.id===id);if(!node)return;state.selected=id;select.value=id;
  $('[data-node-title]').textContent=node.name;$('[data-node-description]').textContent=node.description;$('[data-node-security]').textContent=node.boundary;
  const link=$('[data-project-link]');link.hidden=!node.project;if(node.project)link.href=`/projects/${node.project}/`;
  const isBlogEdge=(root.dataset.explorer==='blog'&&node.id==='edge')||(root.dataset.explorer==='overview'&&node.id==='blog');
  const observation=isBlogEdge?lastStatus?.blog:null;
  $('[data-node-status]').textContent=observation?.state==='reachable'?'Page reachable':observation?.state==='unavailable'?'Check failed':'Not monitored';
  $('[data-node-status-note]').textContent=isBlogEdge?'Public article URL reachability only. This does not test the private storage or every layer.':'No live health signal is exposed for this private or conceptual component.';
 }
 function setMode(mode){
  state.mode=mode;state.pulses=[];stopTrace();$('[data-mode]').value=mode;$('.transport').hidden=mode==='live';
  $('[data-mode-label]').textContent=mode==='live'?'WEBSITE ACTIVITY':'ARCHITECTURE WALKTHROUGH · SIMULATION';
  $('[data-legend]').textContent=mode==='live'?'Observed page view':'Simulated request / response';
  $('[data-trace-label]').textContent=mode==='live'?'LIVE ACTIVITY':'SIMULATION';
  $('[data-mode-note]').textContent=mode==='live'?(scene.slug==='overview'||scene.slug==='blog'?'A dot represents an observed website page view. Origin reads and private calls are not inferred.':'Website totals appear above. These private services have no public traffic signal, so their connections stay still.'):'A simulation of the permitted service flow. Private traffic is not monitored.';
  $('[data-trace-text]').textContent=mode==='live'?'Waiting for newly observed page views.':'Illustrative traffic. Trace a request to follow each boundary.';
  if(mode==='live'){state.scenario='normal';$('[data-scenario]').value='normal';}
 }
 $('[data-mode]').addEventListener('change',event=>setMode(event.target.value));
 function showTraffic(data){
  const live=validSnapshot(data);const badge=$('[data-traffic-state]');badge.dataset.live=String(live);
  badge.textContent=live?data.scope:'Traffic unavailable';
  if(!live){lastTraffic=null;state.pulses=[];for(const selector of ['[data-active-site]','[data-active-page]','[data-recent-views]'])$(selector).textContent='—';$('[data-traffic-time]').textContent='Waiting for a fresh connection. No activity is assumed.';$('[data-traffic-chart]').replaceChildren();$('[data-chart-detail]').textContent='No fresh traffic data.';$('[data-active-pages]').replaceChildren();return;}
  $('[data-active-site]').textContent=data.active.toLocaleString();
  $('[data-active-page]').textContent=(data.pages[document.body.dataset.trafficPage]||0).toLocaleString();
  $('[data-recent-views]').textContent=data.buckets.reduce((total,bucket)=>total+bucket.views,0).toLocaleString();
  $('[data-traffic-time]').textContent=`${data.scope} · updated ${new Date(data.observedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})} · refreshes every 20s`;
  const svg=$('[data-traffic-chart]'),maximum=Math.max(1,...data.buckets.map(b=>b.views));svg.replaceChildren();
  for(const [index,bucket] of data.buckets.entries()){
   const rect=document.createElementNS('http://www.w3.org/2000/svg','rect'),height=bucket.views?Math.max(3,bucket.views/maximum*64):1;
   const text=`${new Date(bucket.minute).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · ${bucket.views} page ${bucket.views===1?'view':'views'}`;
   for(const [key,value] of Object.entries({x:index*30+3,y:72-height,width:22,height,rx:3,tabindex:0,'aria-label':text}))rect.setAttribute(key,String(value));
   const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=text;rect.append(title);rect.addEventListener('pointerenter',()=>{$('[data-chart-detail]').textContent=text;});rect.addEventListener('focus',()=>{$('[data-chart-detail]').textContent=text;});rect.addEventListener('click',()=>{$('[data-chart-detail]').textContent=text;});svg.append(rect);
  }
  $('[data-chart-detail]').textContent='Last 15 minutes · select a bar to inspect';
  const pages=$('[data-active-pages]');pages.replaceChildren();for(const [path,count] of Object.entries(data.pages).sort((a,b)=>b[1]-a[1])){const item=document.createElement('span');item.textContent=`${path} · ${count}`;pages.append(item);}
  const delta=lastTraffic?newViews(lastTraffic,data):(data.accepted?1:0);lastTraffic=data;
  if(delta&&state.mode==='live'){
   if(!reduced.matches)for(let i=0;i<Math.min(delta,20);i++)state.pulses.push({start:state.time+i*.09});
   $('[data-trace-text]').textContent=`${delta.toLocaleString()} new website page ${delta===1?'view':'views'} observed${reduced.matches?' · motion reduced':''}. ${scene.slug==='overview'||scene.slug==='blog'?'Dots show visits to public pages, not individual network requests.':'Private service traffic remains unmonitored.'}`;
  }
 }
 window.addEventListener('traffic-update',event=>showTraffic(event.detail));
 if(window.houseTraffic)showTraffic(window.houseTraffic);
 $('[data-traffic-refresh]').addEventListener('click',()=>window.houseTrafficRefresh?.());
 function stopTrace(){clearInterval(traceTimer);traceTimer=null;$('[data-trace]').textContent='Trace request';}
 function step(){const trace=nextTrace(scene,state.scenario,traceIndex);traceIndex=trace.index;selectNode(trace.node);$('[data-trace-text]').textContent=trace.text;state.time+=1.2;if(traceIndex===flowEdges(scene,state.scenario).length)stopTrace();}
 select.addEventListener('change',()=>selectNode(select.value));
 $('[data-play]').addEventListener('click',()=>{state.running=!state.running;if(!state.running)stopTrace();syncPlay();});
 $('[data-step]').addEventListener('click',()=>{state.running=false;syncPlay();stopTrace();step();});
 $('[data-trace]').addEventListener('click',()=>{if(traceTimer){stopTrace();return;}traceIndex=-1;step();$('[data-trace]').textContent='Stop trace';traceTimer=setInterval(step,1800);});
 $('[data-reset]').addEventListener('click',()=>{stopTrace();traceIndex=-1;state.time=.5;state.scenario='normal';state.speed=.8;state.running=!reduced.matches;$('[data-scenario]').value='normal';$('[data-speed]').value='.8';$('[data-speed-value]').value='0.8×';renderer?.camera('reset');selectNode(scene.nodes[0].id);$('[data-trace-text]').textContent='Illustrative traffic. Trace a request to follow each boundary.';syncPlay();});
 $('[data-scenario]').addEventListener('change',event=>{state.scenario=event.target.value;traceIndex=-1;stopTrace();$('[data-trace-text]').textContent=state.scenario==='blocked'?'Denied-request simulation. Packets stop at the access boundary.':state.scenario==='provider'?'Explicit provider operation illustrated. No real provider request is sent.':'Authorized request simulation. No real integration is called.';selectNode(state.scenario==='blocked'?scene.gate:scene.nodes[0].id);});
 $('[data-speed]').addEventListener('input',event=>{state.speed=Number(event.target.value);$('[data-speed-value]').value=`${state.speed.toFixed(1)}×`;});
 all('[data-view]').forEach(button=>button.addEventListener('click',()=>{state.view=button.dataset.view;all('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('.status-drawer').hidden=state.view!=='health';if(state.view==='security'){setMode('walkthrough');selectNode(scene.gate);}if(state.view==='health')checkStatus();}));
 all('[data-camera]').forEach(button=>button.addEventListener('click',()=>renderer?.camera(button.dataset.camera)));
 $('[data-fullscreen]').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(root.requestFullscreen)await root.requestFullscreen();else throw new Error('Unavailable');}catch{$('[data-trace-text]').textContent='Fullscreen is unavailable in this browser. The explorer is still usable below.';}});
 const noGraphics=()=>{root.querySelector('.graphics-fallback').hidden=false;$('.world-canvas').hidden=true;all('[data-camera]').forEach(b=>{b.disabled=true;});};
 try{renderer=createRenderer($('.world-canvas'),null,scene,selectNode);}catch{noGraphics();}
 $('.world-canvas').addEventListener('renderer-unavailable',noGraphics);
 function animate(now){if(document.hidden){frame=null;return;}const elapsed=previous?Math.min((now-previous)/1000,.1):0;previous=now;if(state.mode==='live'||state.running)state.time+=elapsed*(state.mode==='live'?1:state.speed);state.pulses=state.pulses.filter(p=>state.time-p.start<3);if(renderer)renderer.render(state);frame=requestAnimationFrame(animate);}
 const format=observation=>observation.state==='reachable'?`Reachable · ${observation.latencyMs} ms`:observation.state==='unavailable'?'Check failed':'No monitor available';
 async function checkStatus(){
  if(statusBusy||document.hidden)return;statusBusy=true;$('[data-health-refresh]').disabled=true;
  try{lastStatus=await readStatus();$('[data-local-status]').textContent=format(lastStatus.local);$('[data-blog-status]').textContent=format(lastStatus.blog);state.blogStatus=lastStatus.blog.state;
   const checked=lastStatus.blog.checkedAt||lastStatus.local.checkedAt;
   $('[data-health-time]').textContent=`Observed ${new Date(checked).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}. Checks refresh every minute while this tab is visible. Public results may be cached for 30 seconds.`;
   selectNode(state.selected);
  }catch{$('[data-health-time]').textContent='Status checks could not complete. No healthy state is assumed.';}finally{statusBusy=false;$('[data-health-refresh]').disabled=false;}
 }
 function startPolling(){clearInterval(pollTimer);pollTimer=setInterval(()=>{if(!document.hidden)checkStatus();},60000);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=null;clearInterval(pollTimer);stopTrace();state.pulses=[];lastTraffic=null;}else{previous=0;if(!frame)frame=requestAnimationFrame(animate);checkStatus();startPolling();}});
 reduced.addEventListener('change',event=>{if(event.matches){state.running=false;stopTrace();syncPlay();}});
 $('[data-health-refresh]').addEventListener('click',checkStatus);
 selectNode(state.selected);setMode(state.mode);syncPlay();frame=requestAnimationFrame(animate);checkStatus();startPolling();
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);clearInterval(pollTimer);stopTrace();},{once:true});
}
