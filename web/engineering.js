(() => {
 const graph=document.querySelector('#project-graph');if(!graph)return;
 const nodes=[...graph.querySelectorAll('.project-node')], search=document.querySelector('#project-search');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
 const motion=document.querySelector('#graph-motion');
 function renderMotion(){graph.classList.toggle('flow-paused',paused);motion.textContent=paused?'Resume flow':'Pause flow';motion.setAttribute('aria-pressed',String(paused));}
 renderMotion();motion.addEventListener('click',()=>{paused=!paused;renderMotion();});reduced.addEventListener('change',()=>{paused=reduced.matches;renderMotion();});
 function select(node){nodes.forEach(n=>n.setAttribute('aria-pressed',String(n===node)));for(const field of ['name','kind','description'])document.querySelector(`#project-${field}`).textContent=node.dataset[field];document.querySelector('#project-index').textContent=String(nodes.indexOf(node)+1).padStart(2,'0');document.querySelector('#project-link').href=`https://github.com/designedbyjosh/${node.dataset.project}`;}
 nodes.forEach(node=>{node.addEventListener('click',()=>select(node));node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(node);}});});select(nodes[0]);
 search.addEventListener('input',()=>{const term=search.value.trim().toLowerCase();let count=0;nodes.forEach(n=>{const match=(n.dataset.name+' '+n.dataset.kind).toLowerCase().includes(term);n.classList.toggle('is-muted',!match);if(match)count++;});document.querySelector('#graph-status').textContent=term?`${count} matching projects`:'';});
 const initialView=()=>innerWidth<700?{x:150,y:100,w:450,h:300}:{x:0,y:0,w:900,h:600};let view=initialView(),drag;
 function updateView(){graph.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);}
 updateView();
 function zoom(factor){const w=Math.min(1200,Math.max(450,view.w*factor)),h=w*2/3;view={x:view.x+(view.w-w)/2,y:view.y+(view.h-h)/2,w,h};updateView();}
 document.querySelector('#graph-in').addEventListener('click',()=>zoom(.8));document.querySelector('#graph-out').addEventListener('click',()=>zoom(1.25));
 graph.addEventListener('pointerdown',e=>{if(e.target.closest('.project-node'))return;drag={x:e.clientX,y:e.clientY,vx:view.x,vy:view.y};graph.setPointerCapture(e.pointerId);});
 graph.addEventListener('pointermove',e=>{if(!drag)return;const scale=view.w/graph.getBoundingClientRect().width;view.x=drag.vx-(e.clientX-drag.x)*scale;view.y=drag.vy-(e.clientY-drag.y)*scale;updateView();});
 const release=()=>drag=null;graph.addEventListener('pointerup',release);graph.addEventListener('pointercancel',release);
 document.querySelector('#graph-reset').addEventListener('click',()=>{view=initialView();updateView();search.value='';search.dispatchEvent(new Event('input'));select(nodes[0]);});
 const observer=new IntersectionObserver(([entry])=>graph.classList.toggle('flow-hidden',!entry.isIntersecting));observer.observe(graph);document.addEventListener('visibilitychange',()=>graph.classList.toggle('flow-hidden',document.hidden));
})();
