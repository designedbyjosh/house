import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source = await readFile(new URL('../web/ocean-fallback.js', import.meta.url), 'utf8');
function scene(reduced = false, contextAvailable = true, imageReady = true) {
  const events = {}, heroEvents = {}, frames = new Map(); let nextFrame = 0, renders = 0, observer;
  const preference = {matches:reduced, addEventListener:(_,fn)=>{events.preference=fn;}};
  const context = new Proxy({}, {get:(_,key)=>{
    if(key==='drawArrays')return ()=>{renders++;};
    if(key==='getShaderParameter'||key==='getProgramParameter')return ()=>true;
    if(key.startsWith('create'))return ()=>({});
    return ()=>{};
  },set:()=>true});
  const button = {hidden:true, setAttribute(name,value){this[name]=value;},addEventListener:(_,fn)=>{events.click=fn;}};
  const image = {complete:imageReady,naturalWidth:imageReady?2560:0,naturalHeight:1440,addEventListener:(_,fn)=>{events.imageLoad=fn;}};
  const hero = {clientHeight:780,querySelector:selector=>selector==='.ocean-fallback'?image:button,getBoundingClientRect:()=>({width:1200,height:780,top:0,left:0}),addEventListener:(name,fn)=>{heroEvents[name]=fn;}};
  const classes=new Set();
  const canvas = {getContext:()=>contextAvailable?context:null,closest:()=>hero,classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)},addEventListener:(name,fn)=>{events[name]=fn;}};
  const document = {hidden:false,querySelector:selector=>selector==='#ocean-canvas'?canvas:null,addEventListener:(name,fn)=>{events[name]=fn;}};
  vm.runInNewContext(source, {document,matchMedia:()=>preference,devicePixelRatio:2,Float32Array,requestAnimationFrame:fn=>{const id=++nextFrame;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(fn){observer=fn;}observe(){}},window:{addEventListener(){}}});
  return {button,frames,events,document,heroEvents,image,classes,get renders(){return renders;},setVisible(value){observer([{isIntersecting:value}]);}};
}
test('reduced motion renders a static scene with no animation loop',()=>{
  const s=scene(true);assert.equal(s.frames.size,0);assert(s.renders>0);assert.equal(s.button['aria-pressed'],'true');assert.equal(s.button.hidden,false);
});
test('pause, hidden tab and offscreen scene stop animation; resume starts only one loop',()=>{
  const s=scene();assert.equal(s.frames.size,1);s.events.click();assert.equal(s.frames.size,0);s.events.click();assert.equal(s.frames.size,1);
  s.document.hidden=true;s.events.visibilitychange();assert.equal(s.frames.size,0);s.document.hidden=false;s.events.visibilitychange();assert.equal(s.frames.size,1);
  s.setVisible(false);assert.equal(s.frames.size,0);s.setVisible(true);assert.equal(s.frames.size,1);s.setVisible(true);assert.equal(s.frames.size,1);
  s.events.preference({matches:true});assert.equal(s.frames.size,0);
});
test('unavailable canvas leaves the static illustration and hides inert controls',()=>{
  const s=scene(false,false);assert.equal(s.frames.size,0);assert.equal(s.button.hidden,true);
});
test('Vercel previews serve their own build; only existing public domains use AWS',async()=>{
  const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
  const bridge=config.routes[0];const host=new RegExp(`^${bridge.has[0].value}$`);
  for(const domain of ['josh.house','josh.engineer','www.josh.house','www.josh.engineer'])assert(host.test(domain));
  for(const domain of ['house-preview.vercel.app','josh.house.evil.test','archive.josh.house'])assert(!host.test(domain));
  const deep=config.routes.find(r=>r.check);const route=new RegExp(`^${deep.src}$`);
  assert.equal('/diving/'.replace(route,deep.dest),'/diving/index.html');assert.equal('/articles/after-aaron'.replace(route,deep.dest),'/articles/after-aaron/index.html');
  assert.equal(config.routes.at(-1).status,404);
});

test('WebGL context loss restores the static image and removes the animation loop',()=>{
  const s=scene();assert(s.classes.has('is-ready'));s.events.webglcontextlost();
  assert.equal(s.frames.size,0);assert.equal(s.button.hidden,true);assert(!s.classes.has('is-ready'));
});
test('the image remains visible until the texture is loaded, including slow connections',()=>{
  const s=scene(false,true,false);assert.equal(s.frames.size,0);assert.equal(s.button.hidden,true);assert(!s.classes.has('is-ready'));
  s.image.naturalWidth=2560;s.events.imageLoad();assert(s.classes.has('is-ready'));assert.equal(s.frames.size,1);
});
