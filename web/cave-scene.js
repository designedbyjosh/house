import * as THREE from './vendor/three.webgpu.js';
import {uniform,vec3,vec4,float,mix,sin,cos,positionWorld,positionLocal,normalWorld,instanceIndex,mx_noise_float,pass,screenUV,screenCoordinate,Fn,transformNormalToView} from './vendor/three.tsl.js';
import {gaussianBlur} from './vendor/GaussianBlurNode.js';
import {geology,noise,surface,chamberSurfaces,floorHeight} from './cave-geometry.js';

export function createCave(renderer) {
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x020b10);
  scene.fog=new THREE.FogExp2(0x020b10,.019);
  const camera=new THREE.PerspectiveCamera(56,1,.15,120);
  const clock=uniform(0);
  const rock=new THREE.MeshStandardNodeMaterial({roughness:.91,metalness:.05,side:THREE.DoubleSide});
  const grain=mx_noise_float(positionWorld.mul(1.6)).mul(.5).add(.5);
  rock.colorNode=mix(vec3(.065,.075,.055),vec3(.34,.32,.23),grain);
  const strata=sin(positionWorld.y.mul(13).add(mx_noise_float(positionWorld.mul(.8)).mul(5))).mul(.035).add(.965);
  const pores=mx_noise_float(positionWorld.mul(19)).smoothstep(.15,.65).mul(.18).oneMinus();
  rock.colorNode=rock.colorNode.mul(strata).mul(pores);
  const detail=positionWorld.mul(4.5);
  const h=mx_noise_float(detail);
  const gradient=vec3(mx_noise_float(detail.add(vec3(.06,0,0))).sub(h),mx_noise_float(detail.add(vec3(0,.06,0))).sub(h),mx_noise_float(detail.add(vec3(0,0,.06))).sub(h)).mul(1.6);
  rock.normalNode=transformNormalToView(normalWorld.sub(gradient.sub(normalWorld.mul(gradient.dot(normalWorld)))).normalize());
  // The caustic pattern is evaluated on world-space geometry, not a screen overlay.
  const caustic=sin(positionWorld.x.mul(2.7).add(sin(positionWorld.z.mul(2).add(clock.mul(.3)))))
    .add(sin(positionWorld.z.mul(3).sub(clock.mul(.2)))).abs().mul(-.7).add(1).max(0).pow(14);
  const lightArea=positionWorld.x.sub(7).pow(2).add(positionWorld.z.add(17).pow(2)).mul(-.005).exp();
  rock.emissiveNode=vec3(.012,.035,.024).mul(caustic).mul(normalWorld.y.max(0)).mul(lightArea);
  function mesh(geometry,material=rock,parent=scene){
    const object=new THREE.Mesh(geometry,material);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
  }
  function geometry(data){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(data.positions,3));g.setIndex(new THREE.BufferAttribute(data.indices,1));g.computeVertexNormals();return g;}
  for(const data of chamberSurfaces())mesh(geometry(data));
  function column(x,z,radius,height,ceiling=false){
    const base=ceiling?5.5:floorHeight(x,z)-.3;
    const data=surface(height>16?48:24,height>16?90:32,(u,v)=>{
      const angle=u*Math.PI*2,y=base+(ceiling?-v:v)*height;
      const taper=height>16?.64+.28*Math.sin(v*Math.PI)+.12*Math.sin(v*19+x):ceiling?Math.pow(1-v,.7):Math.pow(1-v,.6);
      const r=radius*(.08+.92*taper)*(1+Math.sin(angle*7+v*5)*.13+Math.sin(angle*13-v*16)*.055)+geology(x+Math.cos(angle)*radius,y,z+Math.sin(angle)*radius)*.7;
      return [x+Math.cos(angle)*Math.max(.04,r)+Math.sin(v*3)*.35,y,z+Math.sin(angle)*Math.max(.04,r)];
    });mesh(geometry(data));
  }
  // Foreground columns and overlapping arches make camera translation legible.
  [[-12,2,4.8,20],[-15,-15,4.1,20],[17,-3,4.2,20],[-10,-33,3.8,20],[15,-40,3.6,20],[-15,-57,2.8,18]].forEach(p=>column(...p));
  for(let i=0;i<80;i++){
    const x=Math.sin(i*2.39)*16,z=14-i*.9;
    if(Math.abs(x-5)<3)continue;
    column(x,z,.4+((i*17)%7)*.12,1+(i%6)*.35,true);
  }
  for(let i=0;i<65;i++){
    const x=10+Math.sin(i*2.4)*5,z=10-i*.8;
    column(x,z,.35+(i%4)*.25,1.5+(i%5)*.6);
  }
  for(let i=0;i<35;i++){
    const x=Math.sin(i*5.7)*18,z=14-i*4.8;
    const g=new THREE.IcosahedronGeometry(1,3),p=g.attributes.position;
    for(let k=0;k<p.count;k++){const a=p.getX(k),b=p.getY(k),c=p.getZ(k),r=1+noise(a*3+i,b*3,c*3)*.2;p.setXYZ(k,a*r,b*r,c*r);}g.computeVertexNormals();
    const b=mesh(g);b.position.set(x,floorHeight(x,z),z);b.scale.set(1+(i%4),.6+(i%3)*.6,1.2+(i%5)*.4);b.rotation.set(i*.1,i*1.9,i*.3);
  }
  // Thin folded flowstone curtains and mineral ledges add detail at several scales.
  for(let i=0;i<16;i++){
    const z=7-i*4.2,side=i%2?1:-1;
    mesh(geometry(surface(64,18,(u,v)=>{
      const depth=z-u*3.8,fold=Math.sin(u*38+i)*.22+Math.sin(u*83)*.065;
      return [side*(11+fold+v*.65),4.8-v*(1.1+Math.sin(u*9+i)*.5)+geology(side*11,4,depth)*.25,depth];
    })));
  }
  const rubble=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),rock,160),rubblePose=new THREE.Object3D();
  for(let i=0;i<160;i++){
    const x=Math.sin(i*13.7)*17,z=18-(i*3.73)%95;
    rubblePose.position.set(x,floorHeight(x,z)+.08,z);rubblePose.scale.set(.12+(i%7)*.09,.07+(i%4)*.08,.15+(i%6)*.11);rubblePose.rotation.set(i*.6,i*1.3,i*.2);rubblePose.updateMatrix();rubble.setMatrixAt(i,rubblePose.matrix);
  }
  rubble.castShadow=rubble.receiveShadow=true;scene.add(rubble);
  const ambient=new THREE.HemisphereLight(0x8fae9c,0x010504,.38);scene.add(ambient);
  const sun=new THREE.SpotLight(0xbce8eb,420,110,.43,.65,1.5);
  sun.position.set(3,3,18);sun.target.position.set(8,0,-18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0003;sun.shadow.normalBias=.12;sun.shadow.camera.near=1;sun.shadow.camera.far=85;scene.add(sun,sun.target);
  const rim=new THREE.DirectionalLight(0x529a85,.28);rim.position.set(13,8,-40);scene.add(rim);
  const waterMaterial=new THREE.MeshStandardNodeMaterial({color:0x49a8b9,emissive:0x97c7af,emissiveIntensity:1.5,roughness:.25,metalness:.5,side:THREE.DoubleSide});
  waterMaterial.positionNode=positionLocal.add(vec3(0,0,sin(positionLocal.x.mul(.7).add(clock.mul(.35))).mul(cos(positionLocal.y.mul(.5).sub(clock.mul(.25)))).mul(.17)));
  const water=mesh(new THREE.PlaneGeometry(80,100,80,100),waterMaterial);water.rotation.x=-Math.PI/2;water.position.set(0,19,-23);water.castShadow=false;water.visible=false;
  // A fully modelled diver: body, mask, twin cylinders, hoses, limbs and fins.
  const diver=new THREE.Group();diver.position.set(6.2,.3,-8);diver.rotation.y=-Math.PI/2;diver.name="swimming-diver";scene.add(diver);
  const suit=new THREE.MeshStandardMaterial({color:0x09131a,roughness:.72});
  const metal=new THREE.MeshStandardMaterial({color:0x8ea8ad,metalness:.75,roughness:.3});
  const accent=new THREE.MeshStandardMaterial({color:0x52666c,roughness:.6});
  function ellipsoid(position,scale,material=suit){const m=mesh(new THREE.SphereGeometry(1,24,16),material,diver);m.position.set(...position);m.scale.set(...scale);return m;}
  function limb(a,b,r,material=suit){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);const m=mesh(new THREE.CapsuleGeometry(r,A.distanceTo(B),6,12),material,diver);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());return m;}
  ellipsoid([0,0,0],[.58,.23,.31]);ellipsoid([-.73,.02,0],[.22,.24,.23]);
  ellipsoid([-.86,.03,.15],[.13,.11,.16],metal);ellipsoid([-.91,.02,.18],[.06,.075,.125],new THREE.MeshStandardMaterial({color:0x163843,metalness:.7,roughness:.1}));
  // Sidemount cylinders hang beside the torso, with independent valves and hoses.
  for(const z of [-.43,.43]){
    const tank=limb([-.36,-.02,z],[.51,-.02,z],.145,metal);tank.name=z<0?'sidemount-left':'sidemount-right';
    limb([-.47,-.02,z],[-.38,-.02,z],.06,accent);
    for(const x of [-.14,.3]){const band=mesh(new THREE.TorusGeometry(.148,.018,6,20),suit,diver);band.rotation.y=Math.PI/2;band.position.set(x,-.02,z);}
    limb([-.2,-.12,z*.5],[-.43,-.39,z*.75],.075);limb([-.43,-.39,z*.75],[-.85,-.28,z*.75],.06);
    const hose=new THREE.CatmullRomCurve3([new THREE.Vector3(-.43,-.02,z),new THREE.Vector3(-.6,.2,z*1.1),new THREE.Vector3(-.88,-.05,.12)]);
    mesh(new THREE.TubeGeometry(hose,24,.023,6,false),suit,diver);
  }
  const legs=[];
  for(const side of [-1,1]){
    const thigh=mesh(new THREE.CapsuleGeometry(.115,1,6,12),suit,diver);
    const shin=mesh(new THREE.CapsuleGeometry(.08,1,6,12),suit,diver);
    const fin=mesh(new THREE.BoxGeometry(.65,.045,.28,3,1,3),accent,diver);
    thigh.name=`thigh-${side}`;shin.name=`shin-${side}`;fin.name=`fin-${side}`;legs.push({side,thigh,shin,fin});
  }
  const up=new THREE.Vector3(0,1,0);
  function segment(object,a,b){const delta=b.clone().sub(a);object.position.copy(a).add(b).multiplyScalar(.5);object.scale.y=delta.length();object.quaternion.setFromUnitVectors(up,delta.normalize());}
  // A slow recovery, paired outward sweep, then a long still glide.
  function kick(time){
    const phase=(time%5.8)/5.8;
    const recover=phase<.23?Math.sin(phase/.23*Math.PI/2):phase<.48?Math.cos((phase-.23)/.25*Math.PI/2):0;
    const spread=phase<.23?Math.sin(phase/.23*Math.PI/2)*.35:phase<.48?Math.sin((phase-.23)/.25*Math.PI)*.5+.35*(1-(phase-.23)/.25):0;
    for(const {side,thigh,shin,fin} of legs){
      const hip=new THREE.Vector3(.4,0,side*.18),knee=new THREE.Vector3(.94,-.06,side*(.2+spread*.5));
      const ankle=new THREE.Vector3(1.43-recover*.48,.02+recover*.45,side*(.23+spread));
      segment(thigh,hip,knee);segment(shin,knee,ankle);
      fin.position.copy(ankle).add(new THREE.Vector3(.28-recover*.1,.03,side*spread*.18));
      fin.rotation.set(side*spread*.4,side*spread*.7,recover*.48);
    }
  }
  // Bubbles are emitted in short breath packets and keep their world positions.
  const bubbleMaterial=new THREE.MeshStandardMaterial({color:0xc6e4e8,metalness:.65,roughness:.12,transparent:true,opacity:.48,depthWrite:false});
  const bubbles=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),bubbleMaterial,36);bubbles.name='exhaled-bubbles';bubbles.frustumCulled=false;scene.add(bubbles);
  const bubblePose=new THREE.Object3D();
  function swimPosition(t){const phase=t*.018+.55;return new THREE.Vector3(4+Math.sin(phase)*2,.3+Math.sin(t*.45)*.04,-25+Math.cos(phase)*16);}
  function swimHeading(t){const phase=t*.018+.55;return Math.atan2(-16*Math.sin(phase),-2*Math.cos(phase));}
  function updateBubbles(time){
    for(let i=0;i<36;i++){
      const delay=(i%12)*.065,cycle=Math.floor((time-delay)/5.5),born=cycle*5.5+delay,age=time-born;
      if(born<0||age>4.7){bubblePose.scale.setScalar(0);}else{
        const heading=swimHeading(born),source=new THREE.Vector3(-.88,.12,.12).applyAxisAngle(up,heading).add(swimPosition(born));
        bubblePose.position.copy(source).add(new THREE.Vector3(Math.sin(i*2.7+age)*.08,age*(.82+(i%3)*.08),Math.sin(i*1.3+age*.6)*.12));
        const radius=(.022+(i%5)*.009)*(1+age*.09);bubblePose.scale.set(radius,radius*.78,radius);
      }
      bubblePose.updateMatrix();bubbles.setMatrixAt(i,bubblePose.matrix);
    }
    bubbles.instanceMatrix.needsUpdate=true;
  }
  const torch=new THREE.SpotLight(0xe0f4da,230,30,.22,.7,1.2);torch.position.set(-.97,-.26,.32);torch.target.position.set(-14,-2,.4);diver.add(torch,torch.target);
  const lamp=ellipsoid([-.97,-.26,.32],[.06,.055,.055],new THREE.MeshBasicMaterial({color:0xe1faff}));
  // Continuous guideline returns toward the camera/entrance (+Z).
  const linePoints=[new THREE.Vector3(12,-2,22),new THREE.Vector3(8,-2.5,5),new THREE.Vector3(5,-2.5,-12),new THREE.Vector3(4,-2.3,-35),new THREE.Vector3(8,-2,-62)];
  const guideline=new THREE.CatmullRomCurve3(linePoints);
  mesh(new THREE.TubeGeometry(guideline,180,.018,6,false),new THREE.MeshStandardMaterial({color:0xd3caa4,roughness:.8}));
  const markerMaterial=new THREE.MeshStandardMaterial({color:0xff6b09,emissive:0x713007,emissiveIntensity:.15,roughness:.6,side:THREE.DoubleSide});
  for(const t of [.22,.43]){
    const point=guideline.getPoint(t),exitDirection=guideline.getTangent(t).negate();
    const shape=new THREE.Shape();shape.moveTo(0,.48);shape.lineTo(-.23,-.22);shape.lineTo(0,-.1);shape.lineTo(.23,-.22);shape.closePath();
    const marker=mesh(new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:false}),markerMaterial);
    marker.position.copy(point);marker.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),exitDirection);
  }
  const motes=new THREE.InstancedMesh(new THREE.SphereGeometry(.013,5,4),new THREE.MeshBasicNodeMaterial({color:0xaccfd3,transparent:true,opacity:.3}),400);
  const dummy=new THREE.Object3D();for(let i=0;i<400;i++){dummy.position.set(Math.sin(i*127.1)*19,Math.sin(i*311.7)*9+2,Math.sin(i*74.7)*35-15);dummy.scale.setScalar(.5+(i%7)*.17);dummy.updateMatrix();motes.setMatrixAt(i,dummy.matrix);}scene.add(motes);
  motes.material.positionNode=positionLocal.add(vec3(sin(clock.mul(.2).add(instanceIndex.toFloat())).mul(.18),sin(clock.mul(.13).add(instanceIndex.toFloat().mul(.7))).mul(.3),0));
  // Real volumetric lighting receives shadows from the chamber meshes.
  const layer=10;torch.layers.enable(layer);
  const volumeMaterial=new THREE.VolumeNodeMaterial();volumeMaterial.steps=20;
  volumeMaterial.offsetNode=sin(screenCoordinate.x.mul(12.9898).add(screenCoordinate.y.mul(78.233))).mul(43758.5453).fract();
  volumeMaterial.scatteringNode=Fn(()=>float(.7));
  const volume=new THREE.Mesh(new THREE.BoxGeometry(65,35,110),volumeMaterial);volume.position.set(0,5,-25);volume.receiveShadow=true;volume.layers.set(layer);scene.add(volume);
  const pipeline=new THREE.RenderPipeline(renderer),scenePass=pass(scene,camera);
  volumeMaterial.depthNode=scenePass.getTextureNode('depth').sample(screenUV);
  const lightPass=pass(scene,camera,{depthBuffer:false}),layers=new THREE.Layers();layers.set(layer);lightPass.setLayers(layers);lightPass.setResolutionScale(.4);
  pipeline.outputNode=scenePass.add(gaussianBlur(lightPass,uniform(.4)).mul(1.1));
  function update(time,x,y,descent,exploreYaw=0,explorePitch=0,zoom=0){
    clock.value=time;const portrait=camera.aspect<.8;
    diver.position.copy(swimPosition(time));diver.rotation.set(0,swimHeading(time),Math.sin(time*.4)*.008);
    const orbit=diver.rotation.y+exploreYaw;
    const offset=new THREE.Vector3(x*2.6,1.4-y*.8+explorePitch*4,(portrait?13:15)-descent*2-zoom*.45).applyAxisAngle(up,orbit);
    camera.position.copy(diver.position).add(offset);
    const look=new THREE.Vector3(portrait?-.4:-3.8,.15+y*.25,0).applyAxisAngle(up,diver.rotation.y).add(diver.position);
    camera.lookAt(look);
    sun.position.copy(camera.position).add(new THREE.Vector3(0,1,0));sun.target.position.copy(diver.position).add(new THREE.Vector3(0,-2,-4));
    kick(time);updateBubbles(time);
    torch.target.position.y=-2+y*1.5;
  }
  function dispose(){pipeline.dispose();const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);if(o.shadow)o.shadow.dispose();});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());}
  return {scene,camera,update,render:()=>pipeline.render(),dispose};
}
