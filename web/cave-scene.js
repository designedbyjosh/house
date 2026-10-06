import * as THREE from './vendor/three.webgpu.js';
import {uniform,vec3,vec4,float,mix,sin,cos,positionWorld,positionLocal,normalWorld,instanceIndex,mx_noise_float,pass,screenUV,screenCoordinate,Fn,transformNormalToView} from './vendor/three.tsl.js';
import {gaussianBlur} from './vendor/GaussianBlurNode.js';
import {geology,noise,surface,chamberSurfaces,floorHeight} from './cave-geometry.js';

export function createCave(renderer) {
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x031b1b);
  scene.fog=new THREE.FogExp2(0x031b1b,.019);
  const camera=new THREE.PerspectiveCamera(56,1,.15,120);
  const clock=uniform(0);
  const rock=new THREE.MeshStandardNodeMaterial({roughness:.91,metalness:.05,side:THREE.DoubleSide});
  const grain=mx_noise_float(positionWorld.mul(1.6)).mul(.5).add(.5);
  rock.colorNode=mix(vec3(.065,.075,.055),vec3(.34,.32,.23),grain);
  const strata=sin(positionWorld.y.mul(13).add(mx_noise_float(positionWorld.mul(.8)).mul(5))).mul(.035).add(.965);
  rock.colorNode=rock.colorNode.mul(strata);
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
    const base=ceiling?13:floorHeight(x,z)-.3;
    const data=surface(48,90,(u,v)=>{
      const angle=u*Math.PI*2,y=base+(ceiling?-v:v)*height;
      const taper=height>16?.64+.28*Math.sin(v*Math.PI)+.12*Math.sin(v*19+x):ceiling?Math.pow(1-v,.7):Math.pow(1-v,.6);
      const r=radius*(.08+.92*taper)*(1+Math.sin(angle*7+v*5)*.13+Math.sin(angle*13-v*16)*.055)+geology(x+Math.cos(angle)*radius,y,z+Math.sin(angle)*radius)*.7;
      return [x+Math.cos(angle)*Math.max(.04,r)+Math.sin(v*3)*.35,y,z+Math.sin(angle)*Math.max(.04,r)];
    });mesh(geometry(data));
  }
  // Foreground columns and overlapping arches make camera translation legible.
  [[-12,2,4.8,20],[-15,-15,4.1,20],[17,-3,4.2,20],[-10,-33,3.8,20],[15,-40,3.6,20],[-15,-57,2.8,18]].forEach(p=>column(...p));
  for(let i=0;i<20;i++){
    const x=Math.sin(i*2.39)*16,z=14-i*2.45;
    if(Math.hypot(x-9,z+17)<12)continue;
    column(x,z,.4+((i*17)%7)*.12,2+(i%6)*.8,true);
  }
  for(let i=0;i<10;i++){
    const x=Math.sin(i*2.4)*17,z=4-i*4.8;
    column(x,z,.35+(i%4)*.25,1.5+(i%5)*1.1);
  }
  for(let i=0;i<35;i++){
    const x=Math.sin(i*5.7)*18,z=14-i*4.8;
    const g=new THREE.IcosahedronGeometry(1,3),p=g.attributes.position;
    for(let k=0;k<p.count;k++){const a=p.getX(k),b=p.getY(k),c=p.getZ(k),r=1+noise(a*3+i,b*3,c*3)*.2;p.setXYZ(k,a*r,b*r,c*r);}g.computeVertexNormals();
    const b=mesh(g);b.position.set(x,floorHeight(x,z),z);b.scale.set(1+(i%4),.6+(i%3)*.6,1.2+(i%5)*.4);b.rotation.set(i*.1,i*1.9,i*.3);
  }
  const ambient=new THREE.HemisphereLight(0x8fae9c,0x010504,.38);scene.add(ambient);
  const sun=new THREE.SpotLight(0xc9ead8,1450,110,.43,.65,1.5);
  sun.position.set(10,20,-15);sun.target.position.set(0,-7,-23);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0003;sun.shadow.normalBias=.12;sun.shadow.camera.near=1;sun.shadow.camera.far=85;scene.add(sun,sun.target);
  const rim=new THREE.DirectionalLight(0x529a85,.28);rim.position.set(13,8,-40);scene.add(rim);
  const waterMaterial=new THREE.MeshStandardNodeMaterial({color:0x49a8b9,emissive:0x97c7af,emissiveIntensity:1.5,roughness:.25,metalness:.5,side:THREE.DoubleSide});
  waterMaterial.positionNode=positionLocal.add(vec3(0,0,sin(positionLocal.x.mul(.7).add(clock.mul(.35))).mul(cos(positionLocal.y.mul(.5).sub(clock.mul(.25)))).mul(.17)));
  const water=mesh(new THREE.PlaneGeometry(80,100,80,100),waterMaterial);water.rotation.x=-Math.PI/2;water.position.set(0,19,-23);water.castShadow=false;
  // A fully modelled diver: body, mask, twin cylinders, hoses, limbs and fins.
  const diver=new THREE.Group();diver.position.set(6.2,.3,-8);diver.rotation.y=-.18;scene.add(diver);
  const suit=new THREE.MeshStandardMaterial({color:0x09131a,roughness:.72});
  const metal=new THREE.MeshStandardMaterial({color:0x8ea8ad,metalness:.75,roughness:.3});
  const accent=new THREE.MeshStandardMaterial({color:0x52666c,roughness:.6});
  function ellipsoid(position,scale,material=suit){const m=mesh(new THREE.SphereGeometry(1,24,16),material,diver);m.position.set(...position);m.scale.set(...scale);return m;}
  function limb(a,b,r,material=suit){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);const m=mesh(new THREE.CapsuleGeometry(r,A.distanceTo(B),6,12),material,diver);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());return m;}
  ellipsoid([0,0,0],[.58,.23,.31]);ellipsoid([-.73,.02,0],[.22,.24,.23]);
  ellipsoid([-.86,.03,.15],[.13,.11,.16],metal);ellipsoid([-.91,.02,.18],[.06,.075,.125],new THREE.MeshStandardMaterial({color:0x163843,metalness:.7,roughness:.1}));
  for(const z of [-.2,.2]){
    limb([-.37,.34,z],[.46,.34,z],.13,metal);limb([-.2,-.12,z],[ -.43,-.39,z*1.6],.075);limb([-.43,-.39,z*1.6],[-.85,-.28,z*1.6],.06);
    limb([.42,0,z],[.97,-.16,z*1.2],.12);limb([.97,-.16,z*1.2],[1.3,.04,z*1.45],.08);
  }
  const fins=[];
  for(const z of [-.32,.32]){const fin=mesh(new THREE.BoxGeometry(.63,.045,.26,3,1,3),accent,diver);fin.position.set(1.6,.04,z);fin.rotation.z=.08;fins.push(fin);}
  const hose=new THREE.CatmullRomCurve3([new THREE.Vector3(.25,.4,.28),new THREE.Vector3(-.35,.62,.4),new THREE.Vector3(-.82,-.01,.24)]);
  mesh(new THREE.TubeGeometry(hose,30,.032,8,false),suit,diver);
  const torch=new THREE.SpotLight(0xe0f4da,230,30,.22,.7,1.2);torch.position.set(-.97,-.26,.32);torch.target.position.set(-14,-2,.4);diver.add(torch,torch.target);
  const lamp=ellipsoid([-.97,-.26,.32],[.06,.055,.055],new THREE.MeshBasicMaterial({color:0xe1faff}));
  const motes=new THREE.InstancedMesh(new THREE.SphereGeometry(.013,5,4),new THREE.MeshBasicNodeMaterial({color:0xaccfd3,transparent:true,opacity:.3}),400);
  const dummy=new THREE.Object3D();for(let i=0;i<400;i++){dummy.position.set(Math.sin(i*127.1)*19,Math.sin(i*311.7)*9+2,Math.sin(i*74.7)*35-15);dummy.scale.setScalar(.5+(i%7)*.17);dummy.updateMatrix();motes.setMatrixAt(i,dummy.matrix);}scene.add(motes);
  motes.material.positionNode=positionLocal.add(vec3(sin(clock.mul(.2).add(instanceIndex.toFloat())).mul(.18),sin(clock.mul(.13).add(instanceIndex.toFloat().mul(.7))).mul(.3),0));
  // Real volumetric lighting receives shadows from the chamber meshes.
  const layer=10;sun.layers.enable(layer);torch.layers.enable(layer);
  for(let i=0;i<3;i++){
    const beam=new THREE.SpotLight(0xb8d9c6,1700,65,.035+i*.009,.7,1);
    beam.position.set(7+i*1.1,18,-16-i*.7);beam.target.position.set(4+i*1.2,-8,-23-i*.8);
    beam.layers.set(layer);scene.add(beam,beam.target);
  }
  const volumeMaterial=new THREE.VolumeNodeMaterial();volumeMaterial.steps=20;
  volumeMaterial.offsetNode=sin(screenCoordinate.x.mul(12.9898).add(screenCoordinate.y.mul(78.233))).mul(43758.5453).fract();
  volumeMaterial.scatteringNode=Fn(()=>float(3.));
  const volume=new THREE.Mesh(new THREE.BoxGeometry(65,35,110),volumeMaterial);volume.position.set(0,5,-25);volume.receiveShadow=true;volume.layers.set(layer);scene.add(volume);
  const pipeline=new THREE.RenderPipeline(renderer),scenePass=pass(scene,camera);
  volumeMaterial.depthNode=scenePass.getTextureNode('depth').sample(screenUV);
  const lightPass=pass(scene,camera,{depthBuffer:false}),layers=new THREE.Layers();layers.set(layer);lightPass.setLayers(layers);lightPass.setResolutionScale(.4);
  pipeline.outputNode=scenePass.add(gaussianBlur(lightPass,uniform(.4)).mul(1.1));
  function update(time,x,y,descent,exploreYaw=0,explorePitch=0,zoom=0){
    clock.value=time;const portrait=camera.aspect<.8;
    camera.position.set(-1+x*2.6+Math.sin(exploreYaw)*11,2-y*1.1+explorePitch*6,20-descent*7+Math.cos(exploreYaw)*11-11-zoom);
    camera.lookAt(portrait?5.8:2.5,1+y*.45,-15);
    diver.position.y=.3+Math.sin(time*.6)*.12;diver.rotation.z=Math.sin(time*.4)*.025;
    fins.forEach((fin,i)=>fin.rotation.z=.08+Math.sin(time*.7+i*.3)*.07);
    torch.target.position.y=-2+y*1.5;
  }
  function dispose(){pipeline.dispose();const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);if(o.shadow)o.shadow.dispose();});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());}
  return {scene,camera,update,render:()=>pipeline.render(),dispose};
}
