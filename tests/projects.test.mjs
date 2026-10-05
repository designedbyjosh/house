import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {projects, projectPage, projectsIndex} from '../scripts/projects.mjs';
const source = await readFile(new URL('../web/site.js',import.meta.url),'utf8');
function harness(project) {
  const element = (textContent='') => ({textContent, hidden:false, dataset:{}, attributes:{}, events:{},
    setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];},
    addEventListener(k,fn){this.events[k]=fn;},click(){this.events.click?.({currentTarget:this});},
    classList:{values:new Set(),add(...v){v.forEach(x=>this.values.add(x));},remove(...v){v.forEach(x=>this.values.delete(x));},toggle(v,on){on?this.values.add(v):this.values.delete(v);},contains(v){return this.values.has(v);}}});
  const nodes = project.nodes.map(()=>{const n=element();n.button=element();n.querySelector=()=>n.button;return n;});
  const details=project.nodes.map((_,i)=>Object.assign(element(),{dataset:{detail:String(i)}}));
  const security=project.nodes.map(()=>element());
  const singles=Object.fromEntries(['.flow-status','[data-play]','[data-scenario]','.diagram-controls','[data-step]','[data-reset]','[data-security]'].map(s=>[s,element()]));
  singles['[data-scenario]'].value='allowed';singles['[data-security]'].attributes['aria-pressed']='false';
  singles['[data-blocked-text]']=element(project.blocked);
  const diagram=element();diagram.dataset.blockAt=String(project.blockAt);diagram.querySelector=s=>singles[s];
  diagram.querySelectorAll=s=>({'[data-node]':nodes,'[data-detail]':details,'[data-step-text]':project.steps.map(element),'.security-boundary':security}[s]);
  const intervals=new Map();let id=0;
  const document={hidden:false,querySelector:()=>null,querySelectorAll:()=>[diagram],addEventListener(){}};
  vm.runInNewContext(source,{document,window:{matchMedia:()=>({matches:true})},setInterval:fn=>{intervals.set(++id,fn);return id;},clearInterval:id=>intervals.delete(id)});
  return {nodes,details,security,singles,intervals};
}
for (const project of projects) {
 test(`${project.slug}: play, pause, step, reset and permission denial`,()=>{
  const h=harness(project),s=h.singles;
  s['[data-play]'].click();assert.equal(h.intervals.size,1);assert.match(s['.flow-status'].textContent,/Step 1/);
  s['[data-play]'].click();assert.equal(h.intervals.size,0);
  s['[data-step]'].click();assert.match(s['.flow-status'].textContent,/Step 2/);
  s['[data-step]'].click();s['[data-step]'].click();assert.match(s['.flow-status'].textContent,/Flow complete/);
  s['[data-reset]'].click();assert(h.nodes.every(n=>!n.classList.contains('is-active')));
  s['[data-scenario]'].value='blocked';s['[data-scenario]'].events.change();
  for(let i=0;i<=project.blockAt;i++)s['[data-step]'].click();
  assert.match(s['.flow-status'].textContent,/^Blocked/);assert(h.nodes[project.blockAt].classList.contains('is-blocked'));assert.equal(h.intervals.size,0);
  assert(h.nodes.slice(project.blockAt+1).every(n=>!n.classList.contains('is-active')&&!n.classList.contains('is-done')));
  s['[data-security]'].click();assert(h.security.every(n=>!n.hidden));s['[data-security]'].click();assert(h.security.every(n=>n.hidden));
  h.nodes[3].button.click();assert.equal(h.details[3].hidden,false);assert.equal(h.details[0].hidden,true);
 });
}
test('public pages include transcripts and exclude operational identifiers',()=>{
 const html=projectsIndex()+projects.map(projectPage).join('');
 assert.equal(projects.length,5);
 for(const project of projects){assert(html.includes(`/projects/${project.slug}/`));assert(projectPage(project).includes('Read the complete flow'));}
 assert(!/\b\d{12}\b|arn:aws:|127\.0\.0\.1|mcp\.whitcombe\.me|i-[a-f0-9]{17}|cognito-idp|BEGIN .*PRIVATE KEY/.test(html));
 assert(!/\son\w+=|<script|<iframe|<form/.test(html));
 assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(source));
});
