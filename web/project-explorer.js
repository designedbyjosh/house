import {scenes,flowEdges} from './project-graph.js';
import {createRenderer} from './project-renderer.js';
import {readStatus} from './project-status.js';
export function nextTrace(scene,scenario,index){
 const edges=flowEdges(scene,scenario);const current=(index+1)%(edges.length+1);
 if(current===edges.length)return {index:current,node:scenario==='blocked'?scene.gate:scene.nodes[0].id,text:scenario==='blocked'?'Access denied. The request stops at the authorization boundary; no downstream operation occurs.':'Trace complete. The result returns over the same authorized connection.'};
 const edge=edges[current],from=scene.nodes.find(n=>n.id===edge.a),to=scene.nodes.find(n=>n.id===edge.b);
 return {index:current,node:to.id,text:`${String(current+1).padStart(2,'0')} / ${from.name} → ${to.name} · ${edge.label}`};
}
if(typeof document!=='undefined')for(const root of document.querySelectorAll('[data-explorer]')){
 const scene=scenes[root.dataset.explorer];if(!scene)continue;
 const $=selector=>root.querySelector(selector),all=selector=>[...root.querySelectorAll(selector)];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const state={time:.5,selected:scene.nodes[0].id,scenario:'normal',view:'flow',running:!reduced.matches,speed:.8};
 let renderer=null,frame=null,previous=0,traceIndex=-1,traceTimer=null,statusBusy=false,lastStatus=null,pollTimer=null;
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
 function stopTrace(){clearInterval(traceTimer);traceTimer=null;$('[data-trace]').textContent='Trace request';}
 function step(){const trace=nextTrace(scene,state.scenario,traceIndex);traceIndex=trace.index;selectNode(trace.node);$('[data-trace-text]').textContent=trace.text;state.time+=1.2;if(traceIndex===flowEdges(scene,state.scenario).length)stopTrace();}
 select.addEventListener('change',()=>selectNode(select.value));
 $('[data-play]').addEventListener('click',()=>{state.running=!state.running;if(!state.running)stopTrace();syncPlay();});
 $('[data-step]').addEventListener('click',()=>{state.running=false;syncPlay();stopTrace();step();});
 $('[data-trace]').addEventListener('click',()=>{if(traceTimer){stopTrace();return;}traceIndex=-1;step();$('[data-trace]').textContent='Stop trace';traceTimer=setInterval(step,1800);});
 $('[data-reset]').addEventListener('click',()=>{stopTrace();traceIndex=-1;state.time=.5;state.scenario='normal';state.speed=.8;state.running=!reduced.matches;$('[data-scenario]').value='normal';$('[data-speed]').value='.8';$('[data-speed-value]').value='0.8×';renderer?.camera('reset');selectNode(scene.nodes[0].id);$('[data-trace-text]').textContent='Continuous traffic is illustrative. Trace a request to follow each boundary.';syncPlay();});
 $('[data-scenario]').addEventListener('change',event=>{state.scenario=event.target.value;traceIndex=-1;stopTrace();$('[data-trace-text]').textContent=state.scenario==='blocked'?'Denied-request simulation. Packets stop at the access boundary.':state.scenario==='provider'?'Explicit provider operation illustrated. No real provider request is sent.':'Authorized request simulation. No real integration is called.';selectNode(state.scenario==='blocked'?scene.gate:scene.nodes[0].id);});
 $('[data-speed]').addEventListener('input',event=>{state.speed=Number(event.target.value);$('[data-speed-value]').value=`${state.speed.toFixed(1)}×`;});
 all('[data-view]').forEach(button=>button.addEventListener('click',()=>{state.view=button.dataset.view;all('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('.status-drawer').hidden=state.view!=='health';if(state.view==='security')selectNode(scene.gate);if(state.view==='health')checkStatus();}));
 all('[data-camera]').forEach(button=>button.addEventListener('click',()=>renderer?.camera(button.dataset.camera)));
 $('[data-fullscreen]').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(root.requestFullscreen)await root.requestFullscreen();else throw new Error('Unavailable');}catch{$('[data-trace-text]').textContent='Fullscreen is unavailable in this browser. The explorer is still usable below.';}});
 const noGraphics=()=>{root.querySelector('.graphics-fallback').hidden=false;$('.world-canvas').hidden=true;$('.world-labels').hidden=true;all('[data-camera]').forEach(b=>{b.disabled=true;});};
 try{renderer=createRenderer($('.world-canvas'),$('.world-labels'),scene,selectNode);}catch{noGraphics();}
 $('.world-canvas').addEventListener('renderer-unavailable',noGraphics);
 function animate(now){if(document.hidden){frame=null;return;}const elapsed=previous?Math.min((now-previous)/1000,.1):0;previous=now;if(state.running)state.time+=elapsed*state.speed;if(renderer)renderer.render(state);frame=requestAnimationFrame(animate);}
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
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=null;clearInterval(pollTimer);stopTrace();}else{previous=0;if(!frame)frame=requestAnimationFrame(animate);checkStatus();startPolling();}});
 reduced.addEventListener('change',event=>{if(event.matches){state.running=false;stopTrace();syncPlay();}});
 $('[data-health-refresh]').addEventListener('click',checkStatus);
 selectNode(state.selected);syncPlay();frame=requestAnimationFrame(animate);checkStatus();startPolling();
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);clearInterval(pollTimer);stopTrace();},{once:true});
}
