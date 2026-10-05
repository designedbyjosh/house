import {cavernShader, particleCompute, particleRender, rippleCompute} from './ocean-shaders.js';

const PARTICLES = 512;

// No framework or runtime dependency: WGSL render and compute pipelines share a
// camera/uniform buffer. The still image remains visible throughout compilation.
export async function startWebGPU(canvas, onFailure) {
  if (!navigator.gpu || !isSecureContext) return false;
  const adapter = await navigator.gpu.requestAdapter({powerPreference:'low-power'});
  if (!adapter) return false;
  const device = await adapter.requestDevice();
  const hero = canvas.closest('.ocean-hero');
  const button = hero.querySelector('.motion-toggle');
  const format = navigator.gpu.getPreferredCanvasFormat();
  let context, depth, resizeObserver, intersectionObserver, raf=0, stopped=false;
  const events=new AbortController();const options={signal:events.signal};
  const resources=[];
  function dispose(){
    if(stopped)return;stopped=true;cancelAnimationFrame(raf);events.abort();
    resizeObserver?.disconnect();intersectionObserver?.disconnect();
    canvas.classList.remove('is-ready');delete canvas.dataset.renderer;button.hidden=true;
    depth?.destroy();resources.forEach(resource=>resource.destroy());context?.unconfigure();device.destroy();
  }
  function fail(){if(stopped)return;dispose();onFailure();}
  try {
    const modules=[cavernShader,particleCompute,particleRender,rippleCompute].map((code,i)=>device.createShaderModule({label:['Cavern / depth relief','Motes / compute','Motes / instanced draw','Water / wave equation'][i],code}));
    for (const module of modules) {
      const info=await module.getCompilationInfo();
      const errors=info.messages.filter(m=>m.type==='error');
      if(errors.length)throw new Error(errors.map(m=>`${m.lineNum}: ${m.message}`).join('\n'));
    }
    const [scenePipeline,computePipeline,motePipeline,wavePipeline]=await Promise.all([
      device.createRenderPipelineAsync({label:'Textured 3D cavern',layout:'auto',vertex:{module:modules[0],entryPoint:'vertexMain'},fragment:{module:modules[0],entryPoint:'fragmentMain',targets:[{format}]},primitive:{topology:'triangle-list'},depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'always'}}),
      device.createComputePipelineAsync({label:'Underwater currents',layout:'auto',compute:{module:modules[1],entryPoint:'computeMain'}}),
      device.createRenderPipelineAsync({label:'Depth-tested suspended particles',layout:'auto',vertex:{module:modules[2],entryPoint:'vertexMain'},fragment:{module:modules[2],entryPoint:'fragmentMain',targets:[{format,blend:{color:{srcFactor:'one',dstFactor:'one-minus-src-alpha'},alpha:{srcFactor:'one',dstFactor:'one-minus-src-alpha'}}}]},primitive:{topology:'triangle-list'},depthStencil:{format:'depth24plus',depthWriteEnabled:false,depthCompare:'less'}}),
      device.createComputePipelineAsync({label:'Cursor wave propagation',layout:'auto',compute:{module:modules[3],entryPoint:'computeMain'}})
    ]);
    const source=hero.querySelector('.ocean-fallback');
    await source.decode();
    const bitmap=await createImageBitmap(source);
    const artwork=device.createTexture({label:'Cavern photographic colour',size:[bitmap.width,bitmap.height],format:'rgba8unorm',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});resources.push(artwork);
    device.queue.copyExternalImageToTexture({source:bitmap},{texture:artwork},[bitmap.width,bitmap.height]);bitmap.close();
    const sampler=device.createSampler({magFilter:'linear',minFilter:'linear',addressModeU:'clamp-to-edge',addressModeV:'clamp-to-edge'});
    const uniforms=device.createBuffer({label:'Shared scene state',size:48,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});resources.push(uniforms);
    const particles=device.createBuffer({label:'GPU-resident particle positions',size:PARTICLES*32,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});resources.push(particles);
    const initial=new Float32Array(PARTICLES*8);
    let seed=3917;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<PARTICLES;i++)initial.set([random()*17-8,random()*10-4,random()*36-26,1,random()*6,random(),random(),random()],i*8);
    device.queue.writeBuffer(particles,0,initial);
    const entries=[{binding:0,resource:{buffer:uniforms}},{binding:1,resource:{buffer:particles}}];
    const waves=[0,1].map(()=>device.createBuffer({label:'Wave height and velocity',size:128*128*8,usage:GPUBufferUsage.STORAGE}));resources.push(...waves);
    const sceneGroups=waves.map(buffer=>device.createBindGroup({layout:scenePipeline.getBindGroupLayout(0),entries:[entries[0],{binding:1,resource:artwork.createView()},{binding:2,resource:sampler},{binding:3,resource:{buffer}}]}));
    const waveGroups=waves.map((buffer,i)=>device.createBindGroup({layout:wavePipeline.getBindGroupLayout(0),entries:[entries[0],{binding:1,resource:{buffer}},{binding:2,resource:{buffer:waves[1-i]}}]}));
    let waveIndex=0;
    const computeGroup=device.createBindGroup({layout:computePipeline.getBindGroupLayout(0),entries});
    const moteGroup=device.createBindGroup({layout:motePipeline.getBindGroupLayout(0),entries});
    context=canvas.getContext('webgpu');
    if(!context)throw new Error('WebGPU canvas unavailable');
    context.configure({device,format,alphaMode:'opaque'});
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const pointer={x:0,y:0,targetX:0,targetY:0,cursorX:.5,cursorY:.5,impulse:0};
    let paused=preference.matches,visible=true,busy=false,pendingRedraw=false,last=0,time=0,frames=0;
    let scale=.75,elapsed=0,completed=0,scroll=0,targetScroll=0;
    const values=new Float32Array(12);
    device.lost.then(fail);
    device.addEventListener('uncapturederror',fail,options);
    function resize(){
      if(stopped)return;
      const box=hero.getBoundingClientRect();const ratio=Math.min(devicePixelRatio||1,1.5)*scale;
      const cap=Math.min(1,1600/Math.max(1,box.width*ratio));
      canvas.width=Math.max(1,Math.round(box.width*ratio*cap));canvas.height=Math.max(1,Math.round(box.height*ratio*cap));
      depth?.destroy();depth=device.createTexture({label:'World-space occlusion',size:[canvas.width,canvas.height],format:'depth24plus',usage:GPUTextureUsage.RENDER_ATTACHMENT});
      if(visible&&!document.hidden)render(0);
    }
    function render(dt){
      if(stopped || !depth)return;
      if(busy){if(dt===0)pendingRedraw=true;return;}
      try {
      busy=true;const started=performance.now();
      values.set([canvas.width,canvas.height,time,dt,pointer.x,pointer.y,scroll,frames,scale,pointer.cursorX,pointer.cursorY,dt>0?pointer.impulse:0]);
      pointer.impulse=0;
      device.queue.writeBuffer(uniforms,0,values);
      const encoder=device.createCommandEncoder();
      if(dt>0){const compute=encoder.beginComputePass();compute.setPipeline(computePipeline);compute.setBindGroup(0,computeGroup);compute.dispatchWorkgroups(PARTICLES/64);compute.setPipeline(wavePipeline);compute.setBindGroup(0,waveGroups[waveIndex]);compute.dispatchWorkgroups(16,16);compute.end();waveIndex=1-waveIndex;}
      const pass=encoder.beginRenderPass({colorAttachments:[{view:context.getCurrentTexture().createView(),clearValue:{r:.002,g:.008,b:.014,a:1},loadOp:'clear',storeOp:'store'}],depthStencilAttachment:{view:depth.createView(),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'discard'}});
      pass.setPipeline(scenePipeline);pass.setBindGroup(0,sceneGroups[waveIndex]);pass.draw(240*136*6);
      pass.setPipeline(motePipeline);pass.setBindGroup(0,moteGroup);pass.draw(6,PARTICLES);pass.end();
      device.queue.submit([encoder.finish()]);frames++;
      device.queue.onSubmittedWorkDone().then(()=>{
        busy=false;if(stopped)return;
        canvas.classList.add('is-ready');canvas.dataset.renderer='webgpu';button.hidden=false;
        elapsed+=performance.now()-started;completed++;
        // Adapt after warmup, never queue multiple expensive frames behind the GPU.
        if(completed>=45 && !paused){
          const average=elapsed/completed;const previous=scale;
          if(average>28)scale=Math.max(.4,scale*.84);
          else if(average<13)scale=Math.min(1,scale+.05);
          elapsed=0;completed=0;if(previous!==scale)resize();
        }
        if(pendingRedraw){pendingRedraw=false;render(0);}
      }).catch(fail);
      } catch {fail();}
    }
    function tick(now){
      raf=0;if(stopped||paused||!visible||document.hidden){last=0;return;}
      if(!busy&&(!last||now-last>=1000/60-1)){
        const delta=Math.min((now-(last||now-1000/60))/1000,.045);last=now;time+=delta;pointer.x+=(pointer.targetX-pointer.x)*.065;pointer.y+=(pointer.targetY-pointer.y)*.065;scroll+=(targetScroll-scroll)*.06;render(delta);}
      raf=requestAnimationFrame(tick);
    }
    function sync(){
      if(stopped)return;cancelAnimationFrame(raf);last=0;
      button.textContent=paused?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));
      if(!paused&&visible&&!document.hidden)raf=requestAnimationFrame(tick);else if(paused&&visible&&!document.hidden)render(0);
    }
    hero.addEventListener('pointermove',event=>{if(paused||event.pointerType==='touch')return;const b=hero.getBoundingClientRect();const x=(event.clientX-b.left)/b.width,y=(event.clientY-b.top)/b.height;
      pointer.impulse=Math.min(1,pointer.impulse+Math.hypot(x-pointer.cursorX,y-pointer.cursorY)*12);
      pointer.cursorX=x;pointer.cursorY=y;pointer.targetX=x*2-1;pointer.targetY=y*2-1;},{...options,passive:true});
    hero.addEventListener('pointerleave',()=>{pointer.targetX=0;pointer.targetY=0;},options);
    button.addEventListener('click',()=>{paused=!paused;sync();},options);
    preference.addEventListener('change',event=>{paused=event.matches;sync();},options);
    document.addEventListener('visibilitychange',sync,options);
    window.addEventListener('scroll',()=>{if(paused)return;targetScroll=Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/hero.clientHeight));},{...options,passive:true});
    // Register restoration only after pagehide so initial pageshow cannot consume it.
    window.addEventListener('pagehide',event=>{
      dispose();
      if(event.persisted)window.addEventListener('pageshow',restored=>{if(restored.persisted)onFailure();},{once:true});
    },options);
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(hero);
    intersectionObserver=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});intersectionObserver.observe(hero);
    resize();sync();
    return true;
  } catch(error){
    dispose();
    console.warn('WebGPU scene unavailable; using the image renderer.',error);
    return false;
  }
}
