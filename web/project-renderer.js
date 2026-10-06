import {flowEdges} from './project-graph.js';

const positions = {
 overview:[[0,2],[1,2],[2,1],[2,2],[2,3],[0,0],[1,0],[2,0]],
 blog:[[0,1],[1,1],[2,0],[2,2]],
 'mcp-platform':[[0,0],[1,0],[1,1],[0,2],[1,2],[2,2]],
 discord:[[0,0],[1,0],[2,0],[2,2],[0,2]],
 tesla:[[0,0],[1,0],[1,1],[0,2],[2,2]],
 whatsapp:[[0,0],[1,0],[1,1],[0,2],[2,2]]
};
const shortNames={client:'Client',gateway:'MCP access',discord:'Discord',tesla:'Tesla',whatsapp:'WhatsApp',reader:'Reader',blog:'Blog',storage:'Storage',auth:'Access',entry:'Entry',origin:'Origin',page:'Assets',service:'Vehicle',history:'Saved data',fleet:'Fleet API',bridge:'Bridge',provider:'Discord API',events:'Events',state:'State',network:'Network',edge:'Delivery'};
const icons={laptop:'▰',server:'▤',database:'▥',phone:'▯',car:'↗',cloud:'☁',gateway:'⇄',shield:'◇'};
export function layoutNodes(scene,width,height){
 const layout=positions[scene.slug] || scene.nodes.map(n=>[n.position[0],n.position[2]]);
 const maxX=Math.max(...layout.map(p=>p[0])),maxY=Math.max(...layout.map(p=>p[1]));
 const cardWidth=Math.min(148,(width-52)/3-10),cardHeight=width<500?58:68;
 const left=22+cardWidth/2,right=width-22-cardWidth/2,top=174,bottom=height-65-cardHeight/2;
 return scene.nodes.map((node,i)=>({...node,x:left+(right-left)*layout[i][0]/(maxX||1),y:top+(bottom-top)*layout[i][1]/(maxY||1),w:cardWidth,h:cardHeight}));
}
export function liveEdges(scene){return scene.edges.filter(edge=>edge.a==='reader'&&['blog','edge'].includes(edge.b));}
export function curve(a,b,t){
 const dx=b.x-a.x,dy=b.y-a.y, bend=Math.abs(dx)<10?0:Math.sign(dy||1)*Math.min(24,Math.abs(dx)*.1);
 return {x:a.x+dx*t,y:a.y+dy*t+Math.sin(Math.PI*t)*bend};
}
export function createRenderer(canvas,_labels,scene,onSelect){
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
 let width=1,height=1,dpr=1,targets=[],zoom=1,panX=0,panY=0,drag=null,moved=false;
 function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 function path(a,b){ctx.beginPath();for(let i=0;i<=30;i++){const p=curve(a,b,i/30);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}}
 function dot(a,b,t,color){const p=curve(a,b,t);ctx.shadowColor=color;ctx.shadowBlur=12;ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
 function render(state){
  if(!width||!height)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
  ctx.fillStyle='#294555';for(let x=18;x<width;x+=24)for(let y=155;y<height-40;y+=24){ctx.globalAlpha=.36;ctx.fillRect(x,y,1,1);}ctx.globalAlpha=1;
  ctx.save();ctx.translate(width/2+panX,height/2+panY);ctx.scale(zoom,zoom);ctx.translate(-width/2,-height/2);
  targets=layoutNodes(scene,width,height);const nodes=Object.fromEntries(targets.map(n=>[n.id,n]));
  const live=state.mode==='live',allowed=live?liveEdges(scene):flowEdges(scene,state.scenario);
  for(const edge of scene.edges){
   if(edge.deniedOnly&&(live||state.scenario!=='blocked'))continue;
   const a=nodes[edge.a],b=nodes[edge.b],active=allowed.includes(edge);
   ctx.strokeStyle=active?(state.view==='security'?'#9b7bdd':'#356c68'):'#2b3647';ctx.lineWidth=active?1.7:1;ctx.setLineDash(active?[]:[4,5]);path(a,b);ctx.stroke();ctx.setLineDash([]);
   if(active&&live){for(const pulse of state.pulses||[]){const progress=(state.time-pulse.start)/2.5;if(progress>=0&&progress<=1)dot(a,b,progress,'#6af2cb');}}
   if(active&&!live){for(let i=0;i<3;i++){const t=(state.time*.18+i/3)%1;dot(a,b,t,state.scenario==='blocked'?'#ff777e':'#6af2cb');if(state.scenario!=='blocked')dot(a,b,1-t,'#b7a1ff');}}
  }
  for(const node of targets){
   const selected=node.id===state.selected,danger=!live&&state.scenario==='blocked'&&node.id===scene.gate;
   const color=danger?'#ff777e':`rgb(${node.color.map(v=>Math.round(v*255)).join(',')})`;
   ctx.shadowColor=selected?color:'transparent';ctx.shadowBlur=selected?13:0;
   ctx.fillStyle=selected?'#152f38':'#101c2c';ctx.strokeStyle=selected||state.view==='security'?color:'#34445b';ctx.lineWidth=selected?1.5:1;
   ctx.beginPath();ctx.roundRect(node.x-node.w/2,node.y-node.h/2,node.w,node.h,9);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
   ctx.textAlign='center';ctx.fillStyle=color;ctx.font='17px system-ui';ctx.fillText(icons[node.kind]||'◇',node.x,node.y-8);
   ctx.fillStyle='#d9e7f3';ctx.font=`500 ${width<500?10:11}px system-ui`;ctx.fillText(width<680?(shortNames[node.id]||node.name):node.name,node.x,node.y+12,node.w-10);
   const tag=state.view==='security'?(node.id===scene.gate?'ACCESS CHECK':'BOUNDARY'):state.view==='health'?((node.id==='blog'||node.id==='edge')?(state.blogStatus==='reachable'?'REACHABLE':state.blogStatus==='unavailable'?'CHECK FAILED':'NO CHECK'):'UNMONITORED'):null;
   if(tag){ctx.font='8px ui-monospace,monospace';ctx.fillStyle=state.view==='security'?'#c9a8ee':'#91a7be';ctx.fillText(tag,node.x,node.y+node.h/2+13);}
  }
  ctx.restore();
 }
 canvas.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY};moved=false;canvas.setPointerCapture(event.pointerId);});
 canvas.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;panX+=dx;panY+=dy;drag={x:event.clientX,y:event.clientY};});
 canvas.addEventListener('pointerup',event=>{if(!moved){const rect=canvas.getBoundingClientRect(),x=(event.clientX-rect.left-width/2-panX)/zoom+width/2,y=(event.clientY-rect.top-height/2-panY)/zoom+height/2;const node=targets.find(n=>Math.abs(n.x-x)<=n.w/2&&Math.abs(n.y-y)<=n.h/2);if(node)onSelect(node.id);}drag=null;});
 canvas.addEventListener('pointercancel',()=>{drag=null;});
 function camera(action){if(action==='left')panX-=30;if(action==='right')panX+=30;if(action==='in')zoom=Math.min(2,zoom*1.15);if(action==='out')zoom=Math.max(.7,zoom/1.15);if(action==='reset'){zoom=1;panX=0;panY=0;}}
 canvas.addEventListener('keydown',event=>{const map={ArrowLeft:'left',ArrowRight:'right','+':'in','=':'in','-':'out',Home:'reset'};if(map[event.key]){event.preventDefault();camera(map[event.key]);}});
 return {render,camera,dispose(){observer.disconnect();}};
}
