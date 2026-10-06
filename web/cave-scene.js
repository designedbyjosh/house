import * as THREE from './vendor/three.webgpu.js';
import {uniform,vec3,float,mix,sin,positionWorld,positionLocal,normalWorld,instanceIndex,mx_noise_float,pass,screenUV,screenCoordinate,Fn,texture,triplanarTexture,bumpMap} from './vendor/three.tsl.js';
import {gaussianBlur} from './vendor/GaussianBlurNode.js';
import {geology,noise,surface,chamberSurfaces,floorHeight} from './cave-geometry.js';

export function createCave(renderer) {
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x020b10);
  scene.fog=new THREE.FogExp2(0x020b10,.019);
  const camera=new THREE.PerspectiveCamera(56,1,.15,120);
  const clock=uniform(0);
  const textures=[],loads=[];
  function loadMaterialMap(name,color=false){
    let resolve,reject;loads.push(new Promise((yes,no)=>{resolve=yes;reject=no;}));
    const map=new THREE.TextureLoader().load(`/assets/materials/limestone-${name}.jpg`,resolve,undefined,reject);
    map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;if(color)map.colorSpace=THREE.SRGBColorSpace;textures.push(map);return texture(map);
  }
  const albedo=loadMaterialMap('color',true),height=loadMaterialMap('height'),roughness=loadMaterialMap('roughness');
  const project=map=>triplanarTexture(map,null,null,float(.2),positionWorld,normalWorld);
  const rock=new THREE.MeshStandardNodeMaterial({roughness:.92,metalness:0,side:THREE.DoubleSide});
  const variation=mx_noise_float(positionWorld.mul(.22)).mul(.17).add(.83);
  rock.colorNode=project(albedo).rgb.mul(vec3(.8,.85,.82)).mul(variation);
  rock.roughnessNode=project(roughness).r.mul(.25).add(.72);
  rock.normalNode=bumpMap(project(height).r,float(.7));
  rock.aoNode=project(height).r.mul(.5).add(.5);
  function mesh(geometry,material=rock,parent=scene){
    const object=new THREE.Mesh(geometry,material);object.castShadow=material!==rock;object.receiveShadow=false;parent.add(object);return object;
  }
  function geometry(data){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(data.positions,3));g.setIndex(new THREE.BufferAttribute(data.indices,1));g.computeVertexNormals();return g;}
  for(const data of chamberSurfaces())mesh(geometry(data));
  function column(x,z,radius,height,ceiling=false){
    const base=ceiling?5.9+geology(x,18,z)*.35:floorHeight(x,z)-.15;
    const data=surface(40,64,(u,v)=>{
      const angle=u*Math.PI*2,y=base+(ceiling?-v:v)*height;
      const taper=height>12?.7+.2*Math.cos(v*Math.PI*2):Math.pow(Math.max(0,1-v),.48)*(1+Math.sin(v*13+x)*.13);
      // Multiplicative displacement cannot invert a thin formation's radius.
      const flutes=1+.065*Math.sin(angle*9+v*4)+.035*Math.sin(angle*17-v*7);
      const erosion=1+noise(x+Math.cos(angle)*2,y*.9,z+Math.sin(angle)*2)*.15;
      const r=radius*taper*flutes*erosion+.008;
      return [x+Math.cos(angle)*r+Math.sin(v*2)*radius*.08,y,z+Math.sin(angle)*r];
    });mesh(geometry(data));
  }
  // Fewer coherent masses, with clustered secondary formations and a clear swim corridor.
  [[-14,5,3,14],[-15,-24,3.2,14],[15,5,3.4,14],[15,-35,3,14]].forEach(p=>column(...p));
  for(let i=0;i<48;i++){
    const x=12+Math.sin(i*2.399)*4,z=10-(i*.73)%67;
    column(x,z,.13+(i%9)*.075,.5+(i%11)*.27,true);
  }
  for(let i=0;i<35;i++){
    const x=13+Math.sin(i*2.4)*3,z=12-(i*.9)%67;
    column(x,z,.18+(i%7)*.1,.65+(i%9)*.37);
  }
  // An actual side tunnel cuts through the chamber wall behind the diver.
  mesh(geometry(surface(180,96,(u,v)=>{
    const angle=v*Math.PI*2,x=17+u*48,r=1+noise(x*.17,Math.cos(angle)*2,Math.sin(angle)*2)*.24+Math.sin(angle*5)*.055+noise(Math.cos(angle)*7,Math.sin(angle)*7,x*.33)*.065;
    return [x,-1+Math.sin(angle)*3.7*r,-14+Math.cos(angle)*9.7*r];
  })));
  const rubbleGeometry=new THREE.IcosahedronGeometry(1,4),rubbleVertices=rubbleGeometry.attributes.position;
  for(let i=0;i<rubbleVertices.count;i++){const a=rubbleVertices.getX(i),b=rubbleVertices.getY(i),c=rubbleVertices.getZ(i),r=1+noise(a*3,b*3,c*3)*.28+noise(a*8,b*8,c*8)*.08;rubbleVertices.setXYZ(i,a*r,b*r,c*r);}rubbleGeometry.computeVertexNormals();
  const rubble=new THREE.InstancedMesh(rubbleGeometry,rock,100),rubblePose=new THREE.Object3D();
  for(let i=0;i<100;i++){
    const x=9+Math.sin(i*13.7)*9,z=18-(i*3.73)%95;
    rubblePose.position.set(x,floorHeight(x,z),z);rubblePose.scale.set(.2+(i%7)*.18,.1+(i%4)*.16,.3+(i%6)*.22);rubblePose.rotation.set(i*.6,i*1.3,i*.2);rubblePose.updateMatrix();rubble.setMatrixAt(i,rubblePose.matrix);
  }
  rubble.castShadow=rubble.receiveShadow=false;scene.add(rubble);
  const ambient=new THREE.HemisphereLight(0x91b3bd,0x111512,.8);scene.add(ambient);
  const sun=new THREE.SpotLight(0xd8e2cd,700,110,.43,.65,1.5);
  sun.position.set(3,3,18);sun.target.position.set(8,0,-18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0003;sun.shadow.normalBias=.12;sun.shadow.camera.near=1;sun.shadow.camera.far=85;scene.add(sun,sun.target);
  const rim=new THREE.DirectionalLight(0x83a5ab,.32);rim.position.set(13,8,-40);scene.add(rim);
  const passageGlow=new THREE.PointLight(0x83b2b8,95,42,1.4);passageGlow.position.set(24,1,-14);scene.add(passageGlow);
  // A fully modelled diver: body, mask, twin cylinders, hoses, limbs and fins.
  const diver=new THREE.Group();diver.position.set(6.2,.3,-8);diver.rotation.y=-Math.PI/2;diver.name="swimming-diver";scene.add(diver);
  const suit=new THREE.MeshStandardMaterial({color:0x111d23,roughness:.85});
  const metal=new THREE.MeshStandardNodeMaterial({metalness:.35,roughness:.55});
  metal.colorNode=mix(vec3(.29,.34,.35),vec3(.52,.57,.56),mx_noise_float(positionLocal.mul(vec3(90,3,90))).mul(.5).add(.5));
  const accent=new THREE.MeshStandardMaterial({color:0x52666c,roughness:.6});
  function ellipsoid(position,scale,material=suit){const m=mesh(new THREE.SphereGeometry(1,24,16),material,diver);m.position.set(...position);m.scale.set(...scale);return m;}
  function limb(a,b,r,material=suit){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);const m=mesh(new THREE.CapsuleGeometry(r,A.distanceTo(B),6,12),material,diver);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());return m;}
  // Tailored torso shape, wing, harness and joints avoid a toy-like capsule silhouette.
  const torso=mesh(new THREE.LatheGeometry([new THREE.Vector2(.13,-.55),new THREE.Vector2(.21,-.43),new THREE.Vector2(.25,-.15),new THREE.Vector2(.3,.18),new THREE.Vector2(.27,.35),new THREE.Vector2(.14,.5)],32),suit,diver);torso.rotation.z=Math.PI/2;torso.scale.z=1.12;
  ellipsoid([.05,.19,0],[.43,.11,.28],accent);
  for(const z of [-.19,.19])limb([-.3,.23,z],[.38,.19,z],.025,accent);
  limb([.34,.05,-.27],[.34,.05,.27],.028,accent);ellipsoid([-.73,.02,0],[.22,.24,.23]);
  ellipsoid([-.86,.03,.15],[.13,.11,.16],metal);ellipsoid([-.91,.02,.18],[.06,.075,.125],new THREE.MeshStandardMaterial({color:0x163843,metalness:.7,roughness:.1}));
  // Sidemount cylinders hang beside the torso, with independent valves and hoses.
  for(const z of [-.43,.43]){
    const tank=limb([-.36,-.02,z],[.51,-.02,z],.145,metal);tank.name=z<0?'sidemount-left':'sidemount-right';
    limb([-.47,-.02,z],[-.38,-.02,z],.06,accent);
    ellipsoid([-.48,-.02,z],[.07,.085,.085],suit);
    for(const x of [-.14,.3]){const band=mesh(new THREE.TorusGeometry(.148,.018,6,20),suit,diver);band.rotation.y=Math.PI/2;band.position.set(x,-.02,z);}
    limb([-.2,-.12,z*.5],[-.43,-.39,z*.75],.075);limb([-.43,-.39,z*.75],[-.85,-.28,z*.75],.06);ellipsoid([-.86,-.28,z*.75],[.11,.07,.085],suit);
    const hose=new THREE.CatmullRomCurve3([new THREE.Vector3(-.43,-.02,z),new THREE.Vector3(-.6,.2,z*1.1),new THREE.Vector3(-.88,-.05,.12)]);
    mesh(new THREE.TubeGeometry(hose,24,.023,6,false),suit,diver);
  }
  const legs=[];
  for(const side of [-1,1]){
    const thigh=mesh(new THREE.CapsuleGeometry(.115,1,6,12),suit,diver);
    const shin=mesh(new THREE.CapsuleGeometry(.08,1,6,12),suit,diver);
    const blade=new THREE.Shape();blade.moveTo(-.3,-.09);blade.lineTo(.25,-.18);blade.quadraticCurveTo(.42,0,.25,.18);blade.lineTo(-.3,.09);blade.closePath();
    const fin=mesh(new THREE.ExtrudeGeometry(blade,{depth:.025,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:2}),accent,diver);fin.geometry.rotateX(Math.PI/2);
    thigh.name=`thigh-${side}`;shin.name=`shin-${side}`;fin.name=`fin-${side}`;const kneePad=ellipsoid([0,0,0],[.16,.12,.13],accent);legs.push({side,thigh,shin,fin,kneePad});
  }
  const up=new THREE.Vector3(0,1,0);
  function segment(object,a,b){const delta=b.clone().sub(a);object.position.copy(a).add(b).multiplyScalar(.5);object.scale.y=delta.length();object.quaternion.setFromUnitVectors(up,delta.normalize());}
  // A slow recovery, paired outward sweep, then a long still glide.
  function kick(time){
    const phase=(time%5.8)/5.8;
    const recover=phase<.23?Math.sin(phase/.23*Math.PI/2):phase<.48?Math.cos((phase-.23)/.25*Math.PI/2):0;
    const spread=phase<.23?Math.sin(phase/.23*Math.PI/2)*.35:phase<.48?Math.sin((phase-.23)/.25*Math.PI)*.5+.35*(1-(phase-.23)/.25):0;
    for(const {side,thigh,shin,fin,kneePad} of legs){
      const hip=new THREE.Vector3(.4,0,side*.18),knee=new THREE.Vector3(.94,-.06,side*(.2+spread*.5));
      const ankle=new THREE.Vector3(1.43-recover*.48,.02+recover*.45,side*(.23+spread));
      segment(thigh,hip,knee);segment(shin,knee,ankle);kneePad.position.copy(knee);
      fin.position.copy(ankle).add(new THREE.Vector3(.28-recover*.1,.03,side*spread*.18));
      fin.rotation.set(side*spread*.4,side*spread*.7,recover*.48);
    }
  }
  // Bubbles are emitted in short breath packets and keep their world positions.
  const bubbleMaterial=new THREE.MeshStandardMaterial({color:0xc6e4e8,metalness:.65,roughness:.12,transparent:true,opacity:.28,depthWrite:false});
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
  const torch=new THREE.SpotLight(0xe0f4da,140,30,.2,.85,1.2);torch.position.set(-.97,-.26,.32);torch.target.position.set(-14,-2,.4);diver.add(torch,torch.target);
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
  const volumeMaterial=new THREE.VolumeNodeMaterial();volumeMaterial.steps=32;
  volumeMaterial.offsetNode=sin(screenCoordinate.x.mul(12.9898).add(screenCoordinate.y.mul(78.233))).mul(43758.5453).fract();
  volumeMaterial.scatteringNode=Fn(()=>float(.12));
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
  function dispose(){pipeline.dispose();textures.forEach(t=>t.dispose());const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);if(o.shadow)o.shadow.dispose();});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());}
  return {scene,camera,ready:Promise.all(loads),update,render:()=>pipeline.render(),dispose};
}
