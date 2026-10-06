import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=(await readFile(new URL('../web/cave-controller.js',import.meta.url),'utf8')).replace(/^import .+;\n/gm,'').replace('export async function','async function')+'\nglobalThis.start=startCave;';
async function setup({reduced=false,fail=false}={}){
  const events={},frames=new Map();let frame=0,renders=0,disposed=0,visibleCallback;
  const control=()=>({hidden:true,textContent:'',attrs:{'aria-pressed':'false'},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},addEventListener(n,fn){this[n]=fn;},focus(){}});
  const pause=control(),explore=control(),hint={hidden:true},classes=new Set();
  const hero={clientHeight:900,classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle:(k,v)=>v?classes.add(k):classes.delete(k)},querySelector:s=>s==='.motion-toggle'?pause:s==='.explore-toggle'?explore:hint,getBoundingClientRect:()=>({width:1440,height:900,left:0,top:0}),addEventListener:(n,fn)=>events[n]=fn,setAttribute(){},focus(){},setPointerCapture(){}};
  const canvas={dataset:{},classList:{add(){},remove(){}},closest:()=>hero};
  const document={hidden:false,addEventListener:(n,fn)=>events[n]=fn};
  const context={document,window:{addEventListener:(n,fn)=>events[n]=fn},matchMedia:()=>({matches:reduced,addEventListener:(n,fn)=>events.preference=fn}),devicePixelRatio:1,AbortController,performance,console,requestAnimationFrame:fn=>{const id=++frame;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),ResizeObserver:class{observe(){}disconnect(){}},IntersectionObserver:class{constructor(fn){visibleCallback=fn;}observe(){}disconnect(){}},ACESFilmicToneMapping:1,
    WebGPURenderer:class {backend={isWebGPUBackend:true};shadowMap={};async init(){if(fail)throw Error('no graphics context');}setPixelRatio(){}setSize(){}async compileAsync(){}async dispose(){disposed++;}},
    createCave:()=>({scene:{},camera:{updateProjectionMatrix(){}},update(){},render(){renders++;},dispose(){}})};
  vm.createContext(context);vm.runInContext(source,context);
  return {start:()=>context.start(canvas),pause,explore,hint,events,frames,document,classes,visible:v=>visibleCallback([{isIntersecting:v}]),get renders(){return renders;},get disposed(){return disposed;}};
}
test('a failed graphics initialization leaves controls hidden and does not dispose an uninitialized renderer',async()=>{
  const s=await setup({fail:true});await assert.rejects(s.start(),/no graphics context/);assert.equal(s.disposed,0);assert(s.pause.hidden&&s.explore.hidden);assert.equal(s.frames.size,0);
});
test('pause, reduced motion, hidden tabs and offscreen state stop the cave loop',async()=>{
  const s=await setup();await s.start();assert.equal(s.frames.size,1);s.pause.click();assert.equal(s.frames.size,0);s.pause.click();assert.equal(s.frames.size,1);
  s.document.hidden=true;s.events.visibilitychange();assert.equal(s.frames.size,0);s.document.hidden=false;s.events.visibilitychange();assert.equal(s.frames.size,1);
  s.visible(false);assert.equal(s.frames.size,0);s.visible(true);s.visible(true);assert.equal(s.frames.size,1);
  s.events.preference({matches:true});assert.equal(s.frames.size,0);s.events.pagehide({persisted:false});assert.equal(s.disposed,1);
});
test('reduced motion allows deliberate keyboard exploration without starting animation',async()=>{
  const s=await setup({reduced:true});await s.start();assert.equal(s.frames.size,0);s.explore.click();assert(s.classes.has('is-exploring'));assert.equal(s.hint.hidden,false);
  const before=s.renders;s.events.keydown({key:'ArrowLeft',preventDefault(){}});assert(s.renders>before);assert.equal(s.frames.size,0);
  s.events.keydown({key:'Escape'});assert(!s.classes.has('is-exploring'));assert.equal(s.hint.hidden,true);assert.equal(s.explore.attrs['aria-pressed'],'false');
});
