import {connectionPoint,flowEdges} from './project-graph.js';
export const multiply=(a,b)=>Array.from({length:16},(_,i)=>{const row=i%4,col=Math.floor(i/4);return a[row]*b[col*4]+a[4+row]*b[col*4+1]+a[8+row]*b[col*4+2]+a[12+row]*b[col*4+3];});
const unit=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
export function cameraMatrix(yaw,pitch,distance,aspect,target=[0,0,-1]){
 const eye=[Math.sin(yaw)*Math.cos(pitch)*distance+target[0],Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance+target[2]];
 const z=unit(eye.map((v,i)=>v-target[i])),x=unit(cross([0,1,0],z)),y=cross(z,x);
 const view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];
 const f=1/Math.tan(.7/2),near=.1,far=100;
 const projection=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];
 return multiply(projection,view);
}
export function projectPoint(p,m,width,height){const v=[...p,1],out=[0,1,2,3].map(row=>v.reduce((sum,val,i)=>sum+m[i*4+row]*val,0));return {x:(out[0]/out[3]*.5+.5)*width,y:(-.5*out[1]/out[3]+.5)*height,visible:out[3]>0};}
function geometry(){
 const data=[];const vertex=(p,n,c)=>data.push(...p,...n,...c);
 const tri=(a,b,c,normal,color)=>{vertex(a,normal,color);vertex(b,normal,color);vertex(c,normal,color);};
 const box=(p,s,color)=>{
  const points=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(v=>v.map((n,i)=>p[i]+n*s[i]/2));
  const faces=[[0,3,2,1,0,0,-1],[4,5,6,7,0,0,1],[0,4,7,3,-1,0,0],[1,2,6,5,1,0,0],[3,7,6,2,0,1,0],[0,1,5,4,0,-1,0]];
  for(const [a,b,c,d,...normal] of faces){tri(points[a],points[b],points[c],normal,color);tri(points[a],points[c],points[d],normal,color);}
 };
 const sphere=(p,r,color)=>{for(let j=0;j<8;j++)for(let i=0;i<16;i++){const pt=(x,y)=>[Math.sin(y)*Math.cos(x),Math.cos(y),Math.sin(y)*Math.sin(x)];const a=pt(i*Math.PI/8,j*Math.PI/8),b=pt((i+1)*Math.PI/8,j*Math.PI/8),c=pt((i+1)*Math.PI/8,(j+1)*Math.PI/8),d=pt(i*Math.PI/8,(j+1)*Math.PI/8);for(const q of [a,b,c,a,c,d])vertex(q.map((v,k)=>p[k]+v*r),q,color);}};
 const cylinder=(p,r,h,color)=>{for(let i=0;i<32;i++){const a=i*Math.PI/16,b=(i+1)*Math.PI/16;const lo=t=>[p[0]+Math.cos(t)*r,p[1]-h/2,p[2]+Math.sin(t)*r],hi=t=>[p[0]+Math.cos(t)*r,p[1]+h/2,p[2]+Math.sin(t)*r];const normal=unit([Math.cos((a+b)/2),0,Math.sin((a+b)/2)]);tri(lo(a),lo(b),hi(b),normal,color);tri(lo(a),hi(b),hi(a),normal,color);tri([p[0],p[1]+h/2,p[2]],hi(a),hi(b),[0,1,0],color);tri([p[0],p[1]-h/2,p[2]],lo(b),lo(a),[0,-1,0],color);}};
 return {data,box,sphere,cylinder};
}
export function buildModels(scene){
 const g=geometry(),dark=[.055,.085,.14],metal=[.28,.35,.46],screen=[.03,.12,.17];
 for(const node of scene.nodes){
  const [x,,z]=node.position,c=node.color;const box=(p,s,color)=>g.box([p[0]+x,p[1],p[2]+z],s,color);const sphere=(p,r,color)=>g.sphere([p[0]+x,p[1],p[2]+z],r,color);const cylinder=(p,r,h,color)=>g.cylinder([p[0]+x,p[1],p[2]+z],r,h,color);
  cylinder([0,.04,0],1.25,.14,[.035,.055,.09]);cylinder([0,.13,0],1.06,.06,c.map(v=>v*.38));cylinder([0,.2,0],1,.1,dark);
  if(node.kind==='laptop'){
   box([0,.36,.18],[1.7,.12,1.1],metal);box([0,1.05,-.25],[1.7,1.3,.12],metal);box([0,1.06,-.17],[1.47,1.05,.035],screen);
   for(let i=0;i<4;i++)box([-.2,1.3-i*.19,-.14],[.85-i*.12,.035,.025],c);box([0,.435,.3],[.55,.02,.25],dark);
  }else if(node.kind==='server'){
   box([0,1,0],[1.15,1.5,.8],dark);for(let i=0;i<4;i++){box([0,.45+i*.37,.03],[1.25,.28,.93],metal);box([.4,.46+i*.37,.52],[.08,.08,.025],c);for(let j=0;j<4;j++)box([-.4+j*.13,.46+i*.37,.52],[.05,.09,.025],dark);}
  }else if(node.kind==='database'){
   for(let i=0;i<3;i++){cylinder([0,.5+i*.48,0],.76,.4,metal);cylinder([0,.69+i*.48,0],.77,.04,c.map(v=>v*.8));}
  }else if(node.kind==='phone'){
   box([0,1.1,0],[.85,1.65,.2],metal);box([0,1.14,.12],[.68,1.31,.035],screen);box([0,1.82,.13],[.21,.04,.03],dark);for(let i=0;i<3;i++)box([i%2?.08:-.08,1.48-i*.3,.15],[.41,.14,.03],c);sphere([0,.39,.14],.04,c);
  }else if(node.kind==='car'){
   box([0,.67,0],[1.75,.4,.86],metal);box([-.12,1.02,0],[.95,.36,.78],c.map(v=>v*.6));box([.38,1.05,0],[.06,.26,.68],screen);for(const a of [-.59,.59])for(const b of [-.48,.48])sphere([a,.5,b],.23,dark);for(const z of [-.28,.28])box([.91,.72,z],[.04,.1,.16],c);
  }else if(node.kind==='cloud'){
   sphere([0,1.15,0],.72,metal);sphere([-.65,.93,.06],.46,c.map(v=>v*.6));sphere([.6,1.04,.03],.52,c.map(v=>v*.76));box([0,.7,0],[1.35,.3,.55],metal);
  }else if(node.kind==='gateway'){
   for(const a of [-.7,.7])box([a,1.05,0],[.25,1.6,.45],metal);box([0,1.82,0],[1.65,.2,.45],c);box([0,.43,0],[1.6,.15,.4],metal);for(let i=0;i<4;i++)sphere([-.43+i*.29,1.82,.26],.045,[.75,1,1]);
  }else{
   box([0,1.12,0],[1.14,1.2,.25],metal);sphere([0,.75,0],.56,metal);box([0,1.16,.17],[.12,.56,.05],c);box([0,1.16,.17],[.47,.12,.05],c);
  }
 }
 return new Float32Array(g.data);
}
export function createRenderer(canvas,labels,scene,onSelect){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});if(!gl)throw new Error('WebGL unavailable');
 const vertex=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uMatrix;uniform float uUnlit;uniform float uPointSize;varying vec3 vColor;void main(){gl_Position=uMatrix*vec4(aPosition,1.0);gl_PointSize=uPointSize;float light=.37+.63*max(dot(normalize(aNormal),normalize(vec3(-.5,1.,.6))),0.);vColor=aColor*mix(light,1.,uUnlit);}`;
 const fragment=`precision mediump float;varying vec3 vColor;uniform float uPoint;void main(){float alpha=1.;if(uPoint>.5){float d=length(gl_PointCoord-vec2(.5));alpha=1.-smoothstep(.15,.5,d);if(alpha<.02)discard;}gl_FragColor=vec4(vColor,alpha);}`;
 const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader compilation failed');return s;};
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader linking failed');gl.useProgram(program);
 const attrs=['aPosition','aNormal','aColor'].map(n=>gl.getAttribLocation(program,n));const uniforms=Object.fromEntries(['uMatrix','uUnlit','uPointSize','uPoint'].map(n=>[n,gl.getUniformLocation(program,n)]));
 const modelBuffer=gl.createBuffer(),dynamicBuffer=gl.createBuffer(),models=buildModels(scene);gl.bindBuffer(gl.ARRAY_BUFFER,modelBuffer);gl.bufferData(gl.ARRAY_BUFFER,models,gl.STATIC_DRAW);
 gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
 let yaw=-.24,pitch=.69,distance=scene.nodes.length>6?23:22,width=1,height=1,dpr=1,matrix,targets=[],drag=null,moved=false,lost=false;
 const ctx=labels.getContext('2d');
 function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;dpr=Math.min(window.devicePixelRatio||1,2);for(const c of [canvas,labels]){c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);}gl.viewport(0,0,canvas.width,canvas.height);}
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 function draw(buffer,data,mode,unlit=0,point=0){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);if(data)gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);attrs.forEach((a,i)=>{gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,36,i*12);});gl.uniform1f(uniforms.uUnlit,unlit);gl.uniform1f(uniforms.uPoint,point);gl.uniform1f(uniforms.uPointSize,8*dpr);gl.drawArrays(mode,0,data?data.length/9:models.length/9);}
 const add=(data,p,c)=>data.push(...p,0,1,0,...c);
 const line=(data,a,b,c)=>{add(data,a,c);add(data,b,c);};
 const nodeById=Object.fromEntries(scene.nodes.map(n=>[n.id,n]));
 function render(state){
  if(lost||!width||!height)return;
  matrix=cameraMatrix(yaw,pitch,distance*Math.max(1,620/width),width/height,scene.nodes.length>6?[0,0,-1.7]:[0,0,0]);gl.uniformMatrix4fv(uniforms.uMatrix,false,new Float32Array(matrix));gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const lines=[],dots=[];
  for(let i=-14;i<=14;i++){line(lines,[i,-.1,-14],[i,-.1,14],[.055,.085,.12]);line(lines,[-14,-.1,i],[14,-.1,i],[.055,.085,.12]);}
  const allowed=flowEdges(scene,state.scenario);
  for(const edge of scene.edges){if(edge.deniedOnly&&state.scenario!=='blocked')continue;const a=nodeById[edge.a].position,b=nodeById[edge.b].position,active=allowed.includes(edge);const color=active?(state.view==='security'?[.4,.3,.65]:[.08,.29,.32]):[.12,.13,.19];
   for(let i=0;i<40;i++){if(!active&&i%3===0)continue;line(lines,connectionPoint(a,b,i/40),connectionPoint(a,b,(i+1)/40),color);}
   if(active)for(let i=0;i<5;i++){
    const t=(state.time*.18+i/5)%1;add(dots,connectionPoint(a,b,t),state.scenario==='blocked'?[1,.36,.39]:[.28,1,.84]);
    if(state.scenario!=='blocked')add(dots,connectionPoint(a,b,1-t),[.62,.54,1]);
   }
  }
  for(const node of scene.nodes){const selected=node.id===state.selected;const danger=state.scenario==='blocked'&&node.id===scene.gate;const color=danger?[1,.25,.35]:node.color;const [x,,z]=node.position;
   if(selected||state.view==='security')for(let j=0;j<64;j++){const a=j*Math.PI/32,b=(j+1)*Math.PI/32,r=selected?1.4:1.3;line(lines,[x+Math.cos(a)*r,.3,z+Math.sin(a)*r],[x+Math.cos(b)*r,.3,z+Math.sin(b)*r],color);if(state.view==='security'&&j%4===0)line(lines,[x+Math.cos(a)*r,.3,z+Math.sin(a)*r],[x+Math.cos(a)*r,2.1,z+Math.sin(a)*r],color.map(c=>c*.45));}
  }
  draw(dynamicBuffer,lines,gl.LINES,1);draw(modelBuffer,null,gl.TRIANGLES);gl.depthMask(false);draw(dynamicBuffer,dots,gl.POINTS,1,1);gl.depthMask(true);
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);targets=[];
  for(const node of scene.nodes){const p=projectPoint([node.position[0],2.35,node.position[2]],matrix,width,height);const model=projectPoint([node.position[0],1,node.position[2]],matrix,width,height);if(!p.visible)continue;targets.push({...model,id:node.id});const selected=node.id===state.selected;const shortNames={client:'Client',gateway:'MCP access',discord:'Discord',tesla:'Tesla',whatsapp:'WhatsApp',reader:'Reader',blog:'Blog',storage:'Storage',auth:'Access',entry:'Entry',origin:'Origin',page:'Assets',service:'Service',history:'History',fleet:'Fleet API',bridge:'Bridge',provider:'Provider',events:'Events',state:'State',network:'Network',edge:'Delivery'};const label=width<500?(shortNames[node.id]||node.name):node.name;ctx.font=`${selected?'600':'500'} ${width<500?10:11}px system-ui`;const tw=ctx.measureText(label).width;ctx.fillStyle=selected?'rgba(23,56,63,.96)':'rgba(10,17,29,.87)';ctx.beginPath();ctx.roundRect(p.x-tw/2-12,p.y-14,tw+24,27,5);ctx.fill();ctx.strokeStyle=selected?'#4adac0':'#273649';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=selected?'#bbfff0':'#c1d2e4';ctx.textAlign='center';ctx.fillText(label,p.x,p.y+3);
   if(state.view==='health'){ctx.font='9px monospace';ctx.fillStyle='#718aa5';ctx.fillText((node.id==='blog'||(scene.gate==='origin'&&node.id==='edge'))?(state.blogStatus==='reachable'?'PAGE REACHABLE':state.blogStatus==='unavailable'?'CHECK FAILED':'NOT CHECKED'):'NOT MONITORED',p.x,p.y+28);}
   if(state.view==='security'){ctx.font='9px monospace';ctx.fillStyle=node.id===scene.gate?'#ffbf72':'#947fca';ctx.fillText(node.id===scene.gate?'ACCESS CHECK':'LOGICAL BOUNDARY',p.x,p.y+28);}
  }
 }
 canvas.addEventListener('pointerdown',event=>{drag=[event.clientX,event.clientY];moved=false;canvas.setPointerCapture(event.pointerId);});
 canvas.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag[0],dy=event.clientY-drag[1];if(Math.abs(dx)+Math.abs(dy)>2)moved=true;yaw+=dx*.006;pitch=Math.max(.25,Math.min(1.35,pitch+dy*.004));drag=[event.clientX,event.clientY];});
 canvas.addEventListener('pointerup',event=>{if(!moved){const rect=canvas.getBoundingClientRect();const x=event.clientX-rect.left,y=event.clientY-rect.top;const target=targets.map(t=>({...t,d:Math.hypot(t.x-x,t.y-y)})).sort((a,b)=>a.d-b.d)[0];if(target&&target.d<65)onSelect(target.id);}drag=null;});
 canvas.addEventListener('pointercancel',()=>{drag=null;});
 canvas.addEventListener('wheel',event=>{event.preventDefault();distance=Math.max(13,Math.min(38,distance+event.deltaY*.015));},{passive:false});
 function camera(action){if(action==='left')yaw-=.18;if(action==='right')yaw+=.18;if(action==='in')distance=Math.max(13,distance-2);if(action==='out')distance=Math.min(38,distance+2);if(action==='reset'){yaw=-.24;pitch=.69;distance=scene.nodes.length>6?23:22;}}
 canvas.addEventListener('keydown',event=>{const map={ArrowLeft:'left',ArrowRight:'right','+':'in','=':'in','-':'out',Home:'reset'};if(map[event.key]){event.preventDefault();camera(map[event.key]);}});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;canvas.dispatchEvent(new CustomEvent('renderer-unavailable'));});
 return {render,camera,dispose(){observer.disconnect();gl.deleteBuffer(modelBuffer);gl.deleteBuffer(dynamicBuffer);gl.deleteProgram(program);}};
}
