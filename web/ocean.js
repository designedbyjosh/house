/* A tiny software-rendered 3D seascape. No GPU, third-party code or network required. */
(() => {
  const canvas = document.querySelector('#ocean-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const hero = canvas.closest('.ocean-hero');
  const button = hero.querySelector('.motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = {x: 0, y: 0, targetX: 0, targetY: 0};
  let width = 0, height = 0, time = 0, last = 0, frame = 0;
  let visible = true, paused = preference.matches, scroll = 0;
  const particles = Array.from({length: 60}, (_, i) => ({x: ((i * 7919) % 1000) / 1000, y: ((i * 3571) % 1000) / 1000, z: 0.3 + (i % 7) / 10}));
  const floor = (x, z) => 1.65 + Math.sin(x * 1.2 + z * 0.25) * 0.3 + Math.cos(z * 0.7 + x * 0.4) * 0.28 + Math.sin(x * 2.4 - z * 0.6) * 0.12;
  // World coordinates pass through a small yaw/pitch camera and perspective projection.
  function project(x, y, z) {
    const yaw = pointer.x * 0.09;
    const rx = x * Math.cos(yaw) - z * Math.sin(yaw);
    const rz = z * Math.cos(yaw) + x * Math.sin(yaw) + 7;
    const focal = Math.min(width * 0.7, 790);
    return [width * 0.72 + rx * focal / rz, height * (0.43 - scroll * 0.07) + (y + pointer.y * 0.24) * focal / rz, rz];
  }
  function poly(points, fill, stroke) {
    ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    if (fill) {ctx.closePath(); ctx.fillStyle = fill; ctx.fill();}
    if (stroke) {ctx.strokeStyle = stroke; ctx.lineWidth = 0.65; ctx.stroke();}
  }
  function terrain() {
    for (let z = 21; z >= -3; z -= 0.7) {
      for (let x = -9; x < 10; x += 0.7) {
        const points = [[x,z],[x+0.7,z],[x+0.7,z+0.7],[x,z+0.7]].map(([xx,zz]) => project(xx, floor(xx,zz), zz));
        const light = 16 + (Math.sin(x + z * 0.2) + 1) * 5;
        poly(points, `hsl(181 35% ${light}%)`, `rgba(125,211,188,${0.045 + 0.1 * (1-z/25)})`);
      }
    }
    // Water-surface contours recede above the diver.
    for(let z=2; z<26; z+=1.2){
      const line=[];
      for(let x=-15;x<=15;x+=0.4) line.push(project(x,-2.7 + Math.sin(x*1.5+z+time*0.35)*0.065,z));
      poly(line,null,`rgba(166,233,204,${0.06+z*0.003})`);
    }
  }
  function diver() {
    const [x,y] = project(0.35 + Math.sin(time * 0.22) * 0.14, -0.05 + Math.sin(time * 0.6) * 0.06, 0);
    const scale = Math.min(width / 1100, 1.2);
    ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale); ctx.rotate(-0.18 + pointer.y * 0.04);
    // A soft torch cone sweeps towards the cursor.
    ctx.save(); ctx.translate(89,25); ctx.rotate(pointer.y * 0.32);
    const beam = ctx.createLinearGradient(0,0,450,0);
    beam.addColorStop(0,'rgba(220,245,205,.26)'); beam.addColorStop(1,'rgba(130,224,206,0)');
    poly([[0,0],[460,-80],[460,110]],beam); ctx.restore();
    const kick=Math.sin(time*1.3)*6;
    ctx.lineCap='round'; ctx.lineJoin='round';
    function limb(points,color,weight){ctx.beginPath();points.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.strokeStyle=color;ctx.lineWidth=weight;ctx.stroke();}
    limb([[-27,4],[-66,16],[-99,-2+kick]],'#092d35',15);
    limb([[-28,13],[-61,42],[-101,36-kick]],'#061e2a',16);
    poly([[-96,-8+kick],[-126,-25+kick],[-150,-21+kick],[-140,-6+kick],[-104,4+kick]],'#b4c7a0','#d4e4c0');
    poly([[-98,29-kick],[-134,28-kick],[-151,43-kick],[-136,51-kick],[-100,41-kick]],'#70988a','#a8c8ac');
    ctx.fillStyle='#0a2631';ctx.beginPath();ctx.ellipse(0,5,45,20,0,0,Math.PI*2);ctx.fill();
    const tank=ctx.createLinearGradient(0,-35,0,-8);tank.addColorStop(0,'#b2d4c2');tank.addColorStop(.4,'#739e96');tank.addColorStop(1,'#315961');
    ctx.fillStyle=tank;ctx.beginPath();ctx.roundRect(-33,-31,66,22,10);ctx.fill();
    ctx.fillStyle='#1e3e44';ctx.fillRect(-14,-31,6,22);ctx.fillRect(16,-31,6,22);
    limb([[28,-23],[48,-17],[58,6]],'#061d28',3);
    limb([[25,12],[54,36],[82,26]],'#0c3139',11);
    ctx.fillStyle='#b7b9a0';ctx.beginPath();ctx.arc(82,26,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c8dac0';ctx.fillRect(85,22,12,7);
    ctx.fillStyle='#082530';ctx.beginPath();ctx.ellipse(48,-2,15,17,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#74c4b8';ctx.beginPath();ctx.roundRect(49,-10,16,10,3);ctx.fill();
    limb([[60,3],[65,7],[58,11]],'#324d49',3);
    ctx.restore();
    for(let i=0;i<9;i++){
      const progress=(time*0.19+i/9)%1;
      const bx=x+62*scale+Math.sin(progress*7+i)*10*scale;
      const by=y-15*scale-progress*230*scale;
      ctx.beginPath();ctx.arc(bx,by,(2+progress*5)*scale,0,Math.PI*2);
      ctx.strokeStyle=`rgba(195,233,217,${(1-progress)*0.42})`;ctx.lineWidth=0.9;ctx.stroke();
    }
  }
  function draw() {
    if(!width || !height)return;
    ctx.clearRect(0,0,width,height);
    const water=ctx.createLinearGradient(0,0,width*0.3,height);
    water.addColorStop(0,'#17545a');water.addColorStop(.45,'#0b3942');water.addColorStop(1,'#051c29');
    ctx.fillStyle=water;ctx.fillRect(0,0,width,height);
    const glow=ctx.createRadialGradient(width*.8,-100,20,width*.8,-100,height*1.1);
    glow.addColorStop(0,'rgba(142,218,174,.35)');glow.addColorStop(1,'rgba(102,197,176,0)');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    for(let i=0;i<6;i++){
      const x=width*(.45+i*.12)+Math.sin(time*.14+i)*18;
      const ray=ctx.createLinearGradient(x,0,x-100,height);
      ray.addColorStop(0,'rgba(175,232,198,.08)');ray.addColorStop(1,'rgba(150,230,191,0)');
      poly([[x,0],[x+22,0],[x+130,height],[x-270,height]],ray);
    }
    terrain();
    const fog=ctx.createLinearGradient(0,height*.5,0,height);
    fog.addColorStop(0,'rgba(5,29,39,0)');fog.addColorStop(1,'rgba(3,20,30,.9)');
    ctx.fillStyle=fog;ctx.fillRect(0,0,width,height);
    particles.forEach(p=>{
      const x=(p.x*width+pointer.x*p.z*18+Math.sin(time*.1+p.y*9)*12+width)%width;
      const y=(p.y*height-time*p.z*4+height*100)%height;
      ctx.fillStyle=`rgba(197,233,216,${p.z*.32})`;ctx.beginPath();ctx.arc(x,y,p.z*1.5,0,Math.PI*2);ctx.fill();
    });
    // A distant shoal gives the scene a scale beyond the swimmer.
    for(let i=0;i<11;i++){
      const [x,y]=project(1.5+(i%5)*.48+Math.sin(time*.14)*.4,-.3+Math.floor(i/5)*.25+Math.sin(i)*.2,6+i%3);
      poly([[x-5,y],[x+3,y-2],[x+7,y-5],[x+6,y],[x+7,y+4],[x+2,y+1]],'rgba(130,180,164,.35)');
    }
    diver();
  }
  function tick(now) {
    frame=0;
    if(paused || !visible || document.hidden){last=0;return;}
    if(now-last>=32){
      time+=Math.min((now-(last||now))/1000,.06);last=now;
      pointer.x+=(pointer.targetX-pointer.x)*.065;pointer.y+=(pointer.targetY-pointer.y)*.065;
      draw();
    }
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);frame=0;last=0;
    button.setAttribute('aria-pressed',String(paused));
    button.textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';
    if(!paused && visible && !document.hidden)frame=requestAnimationFrame(tick);
    else draw();
  }
  function resize(){
    const box=hero.getBoundingClientRect();width=box.width;height=box.height;
    const ratio=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);draw();
  }
  hero.addEventListener('pointermove',event=>{
    if(paused || event.pointerType==='touch')return;
    const box=hero.getBoundingClientRect();
    pointer.targetX=((event.clientX-box.left)/width-.5)*2;
    pointer.targetY=((event.clientY-box.top)/height-.5)*2;
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{pointer.targetX=0;pointer.targetY=0;});
  button.addEventListener('click',()=>{paused=!paused;sync();});
  preference.addEventListener('change',event=>{paused=event.matches;sync();});
  document.addEventListener('visibilitychange',sync);
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(hero);
  const depth=document.querySelector('#depth-value');
  window.addEventListener('scroll',()=>{
    scroll=Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/height));
    if(depth)depth.textContent=String(Math.round(scroll*30)).padStart(2,'0');
  },{passive:true});
  button.hidden=false;resize();sync();
})();
