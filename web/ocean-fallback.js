/* Cinematic image-based scene: GPU refraction, layered motes and a damped camera.
   The environment is generated artwork, not a photograph from Josh's dive log. */
(() => {
  const canvas = document.querySelector('#ocean-canvas');
  if (!canvas) return;
  const hero = canvas.closest('.ocean-hero');
  const image = hero.querySelector('.ocean-fallback');
  const button = hero.querySelector('.motion-toggle');
  const gl = canvas.getContext('webgl', {alpha: false, antialias: false, powerPreference: 'low-power'});
  if (!gl) return;
  const vertex = `attribute vec2 position; varying vec2 uv;
    void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragment = `precision highp float;
    varying vec2 uv;
    uniform sampler2D scene;
    uniform vec2 resolution, imageSize, camera, cursor;
    uniform float time, descent;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    void main(){
      float aspect=resolution.x/resolution.y;
      float imageAspect=imageSize.x/imageSize.y;
      vec2 cover=vec2(min(1.,aspect/imageAspect),min(1.,imageAspect/aspect));
      // On narrow screens crop towards the opening and the diver, not the black wall.
      vec2 centre=vec2(mix(.5,.68,(1.-smoothstep(.6,1.2,aspect))),.5);
      vec2 p=(uv-.5)*cover*(.96-descent*.025)+centre;
      vec3 base=texture2D(scene,p).rgb;
      float depth=clamp(dot(base,vec3(.21,.72,.07))*1.4+.16,.16,.8);
      p+=camera*vec2(.013,.008)*(1.-depth);
      float n=noise(p*19.+vec2(time*.045,-time*.025));
      p+=vec2(sin(p.y*31.+time*.35),cos(p.x*27.-time*.28))*.0008*depth;
      p+=(n-.5)*.0012;
      vec3 colour=texture2D(scene,p).rgb;
      // Slow light modulation follows bright water, leaving the rock texture intact.
      float light=(noise(p*7.+vec2(time*.06,0.))-.5)*.075;
      colour*=1.+light;
      vec2 aim=(uv-cursor)*vec2(aspect,1.);
      float torch=exp(-dot(aim,aim)*9.);
      colour+=vec3(.025,.043,.055)*torch*(.2+depth);
      // Two depths of sparse suspended particles; no screen-space cursor replacement.
      for(int layer=0;layer<2;layer++){
        float l=float(layer);vec2 q=uv*vec2(aspect,1.)*(45.+l*30.);
        q+=vec2(camera.x*(.25+l*.45),time*(.12+l*.08));
        vec2 cell=floor(q),f=fract(q)-.5;
        float seed=hash(cell+17.*l);
        float mote=(1.-smoothstep(.008,.06,length(f)))*step(.989,seed);
        colour+=vec3(.25,.35,.4)*mote*(.2+depth*.6);
      }
      colour*=1.-descent*.12;
      gl_FragColor=vec4(colour,1.);
    }`;
  function compile(type, source) {
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error('Scene shader unavailable');}
    return shader;
  }
  let program;
  try {
    const vert=compile(gl.VERTEX_SHADER,vertex),frag=compile(gl.FRAGMENT_SHADER,fragment);
    program=gl.createProgram();gl.attachShader(program,vert);gl.attachShader(program,frag);gl.linkProgram(program);
    gl.deleteShader(vert);gl.deleteShader(frag);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Scene program unavailable');
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  } catch { return; }
  const uniforms=Object.fromEntries(['scene','resolution','imageSize','camera','cursor','time','descent'].map(name=>[name,gl.getUniformLocation(program,name)]));
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const pointer={x:0,y:0,targetX:0,targetY:0};
  let ready=false, lost=false, paused=preference.matches || button.getAttribute?.('aria-pressed')==='true', visible=true;
  let frame=0,last=0,time=0,descent=0;
  function draw(){
    if(!ready || lost)return;
    gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
    gl.uniform2f(uniforms.imageSize,image.naturalWidth,image.naturalHeight);
    gl.uniform2f(uniforms.camera,pointer.x,pointer.y);
    gl.uniform2f(uniforms.cursor,.5+pointer.x*.5,.5-pointer.y*.5);
    gl.uniform1f(uniforms.time,time);gl.uniform1f(uniforms.descent,descent);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function tick(now){
    frame=0;
    if(!ready || lost || paused || !visible || document.hidden){last=0;return;}
    if(now-last>=32){time+=Math.min((now-(last||now))/1000,.06);last=now;
      pointer.x+=(pointer.targetX-pointer.x)*.075;pointer.y+=(pointer.targetY-pointer.y)*.075;draw();}
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    cancelAnimationFrame(frame);frame=0;last=0;
    button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Resume motion':'Pause motion';
    if(ready && !lost && !paused && visible && !document.hidden)frame=requestAnimationFrame(tick);
    else draw();
  }
  function resize(){
    const box=hero.getBoundingClientRect();const ratio=Math.min(devicePixelRatio||1,1.5,2200/Math.max(1,box.width));
    canvas.width=Math.round(box.width*ratio);canvas.height=Math.round(box.height*ratio);
    gl.viewport(0,0,canvas.width,canvas.height);draw();
  }
  function load(){
    if(ready || !image.naturalWidth || lost)return;
    try {
      const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
      gl.uniform1i(uniforms.scene,0);
      ready=true;resize();canvas.classList.add('is-ready');if(canvas.dataset)canvas.dataset.renderer='webgl';button.hidden=false;sync();
    } catch {ready=false;}
  }
  image.addEventListener('load',load);
  if(image.complete)load();
  hero.addEventListener('pointermove',event=>{
    if(paused || event.pointerType==='touch')return;
    const b=hero.getBoundingClientRect();pointer.targetX=(event.clientX-b.left)/b.width*2-1;pointer.targetY=(event.clientY-b.top)/b.height*2-1;
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{pointer.targetX=0;pointer.targetY=0;});
  button.addEventListener('click',()=>{paused=!paused;sync();});
  preference.addEventListener('change',event=>{paused=event.matches;pointer.targetX=pointer.x=0;pointer.targetY=pointer.y=0;sync();});
  document.addEventListener('visibilitychange',sync);
  canvas.addEventListener('webglcontextlost',()=>{lost=true;cancelAnimationFrame(frame);canvas.classList.remove('is-ready');button.hidden=true;});
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(hero);
  window.addEventListener('scroll',()=>{if(paused)return;descent=Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/hero.clientHeight));},{passive:true});
})();
