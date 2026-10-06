import {WebGPURenderer,ACESFilmicToneMapping} from './vendor/three.webgpu.js';
import {createCave} from './cave-scene.js';

export async function startCave(canvas) {
  const hero=canvas.closest('.ocean-hero'),pauseButton=hero.querySelector('.motion-toggle'),exploreButton=hero.querySelector('.explore-toggle'),hint=hero.querySelector('.explore-hint');
  const renderer=new WebGPURenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;
  const events=new AbortController(),options={signal:events.signal};
  let initialized=false;
  exploreButton.textContent='Explore cave';exploreButton.setAttribute('aria-pressed','false');
  let world,resizeObserver,observer,frame=0,dead=false,visible=true,last=0,time=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches||pauseButton.getAttribute('aria-pressed')==='true';
  let x=0,y=0,targetX=0,targetY=0,descent=0,targetDescent=0,exploring=false,dragging=false,yaw=0,pitch=0,zoom=0,dragX=0,dragY=0;
  let quality=.9,measurements=0,totalTime=0;
  function dispose(){
    if(dead)return;dead=true;cancelAnimationFrame(frame);events.abort();resizeObserver?.disconnect();observer?.disconnect();
    world?.dispose();if(initialized)renderer.dispose().catch(()=>{});canvas.classList.remove('is-ready');pauseButton.hidden=exploreButton.hidden=true;hero.classList.remove('is-exploring');hint.hidden=true;
  }
  // A lost graphics device returns to the scene poster rather than repeatedly
  // allocating new contexts on an unstable device. Initial WebGL2 fallback is
  // handled by WebGPURenderer before the scene is created.
  function fallback(){dispose();}
    window.addEventListener('pagehide',event=>{dispose();if(event.persisted)window.addEventListener('pageshow',()=>{const fresh=canvas.cloneNode(false);canvas.replaceWith(fresh);startCave(fresh).catch(()=>{});},{once:true});},options);
  try {
    await renderer.init();initialized=true;if(dead){renderer.dispose().catch(()=>{});return;}
    renderer.onDeviceLost=fallback;
    world=createCave(renderer);await world.ready;if(dead)return;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    function resize(){const box=hero.getBoundingClientRect();renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5)*quality);renderer.setSize(box.width,box.height,false);world.camera.aspect=box.width/box.height;world.camera.updateProjectionMatrix();draw();}
    function draw(){
      if(dead)return;
      world.update(time,x,y,descent,yaw,pitch,zoom);
      world.render();canvas.classList.add('is-ready');canvas.dataset.renderer=renderer.backend.isWebGPUBackend?'webgpu':'webgl2';pauseButton.hidden=exploreButton.hidden=false;
    }
    function tick(now){
      frame=0;if(dead||paused||!visible||document.hidden){last=0;return;}
      if(!last||now-last>=1000/60-1){const dt=Math.min((now-(last||now-16.67))/1000,.05);last=now;time+=dt;
        x+=(targetX-x)*.075;y+=(targetY-y)*.075;descent+=(targetDescent-descent)*.06;
        const start=performance.now();try{draw();}catch{fallback();return;}
        totalTime+=performance.now()-start;measurements++;
        if(measurements===120){if(totalTime/measurements>24&&quality>.55){quality=Math.max(.55,quality-.15);resize();}measurements=totalTime=0;}
      }
      frame=requestAnimationFrame(tick);
    }
    function sync(){cancelAnimationFrame(frame);last=0;pauseButton.textContent=paused?'Resume motion':'Pause motion';pauseButton.setAttribute('aria-pressed',String(paused));if(!paused&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
    function explore(value){
      exploring=value;dragging=false;hero.classList.toggle('is-exploring',value);exploreButton.textContent=value?'Exit exploration':'Explore cave';exploreButton.setAttribute('aria-pressed',String(value));hint.hidden=!value;
      if(value){hero.setAttribute('tabindex','-1');hero.focus({preventScroll:true});}else{yaw=pitch=zoom=0;targetX=targetY=x=y=0;exploreButton.focus({preventScroll:true});}draw();
    }
    hero.addEventListener('pointermove',event=>{
      if(exploring&&dragging){yaw=Math.max(-.8,Math.min(.8,yaw-(event.clientX-dragX)*.004));pitch=Math.max(-.5,Math.min(.7,pitch+(event.clientY-dragY)*.003));dragX=event.clientX;dragY=event.clientY;draw();return;}
      if(paused||event.pointerType==='touch'||exploring)return;
      const b=hero.getBoundingClientRect();targetX=(event.clientX-b.left)/b.width*2-1;targetY=(event.clientY-b.top)/b.height*2-1;
    },{...options,passive:true});
    hero.addEventListener('pointerdown',event=>{if(!exploring||event.target.closest('button,a'))return;dragging=true;dragX=event.clientX;dragY=event.clientY;hero.setPointerCapture(event.pointerId);},options);
    hero.addEventListener('pointerup',()=>dragging=false,options);hero.addEventListener('pointercancel',()=>dragging=false,options);
    hero.addEventListener('pointerleave',()=>{targetX=targetY=0;},options);
    hero.addEventListener('wheel',event=>{if(!exploring)return;event.preventDefault();zoom=Math.max(-3,Math.min(10,zoom+event.deltaY*.008));draw();},{...options,passive:false});
    hero.addEventListener('keydown',event=>{if(!exploring)return;if(event.key==='Escape'){explore(false);return;}const key=event.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(key))return;event.preventDefault();if(key==='ArrowLeft')yaw=Math.min(.8,yaw+.08);if(key==='ArrowRight')yaw=Math.max(-.8,yaw-.08);if(key==='ArrowUp')pitch=Math.min(.7,pitch+.08);if(key==='ArrowDown')pitch=Math.max(-.5,pitch-.08);if(key==='+')zoom=Math.min(10,zoom+1);if(key==='-')zoom=Math.max(-3,zoom-1);if(key==='Home')yaw=pitch=zoom=0;draw();},options);
    exploreButton.addEventListener('click',()=>explore(!exploring),options);pauseButton.addEventListener('click',()=>{paused=!paused;sync();},options);
    preference.addEventListener('change',e=>{paused=e.matches;sync();},options);
    document.addEventListener('visibilitychange',sync,options);
    window.addEventListener('scroll',()=>{if(paused||exploring)return;targetDescent=Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/hero.clientHeight));},{...options,passive:true});
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(hero);
    observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(hero);
    resize();sync();
  }catch(error){dispose();throw error;}
}
