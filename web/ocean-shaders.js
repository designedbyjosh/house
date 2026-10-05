// Native WGSL render and compute shaders. No graphics framework is shipped.
const common = /* wgsl */ `
struct Uniforms { view: vec4f, motion: vec4f, quality: vec4f }
@group(0) @binding(0) var<uniform> u: Uniforms;
struct Camera { eye:vec3f, forward:vec3f, right:vec3f, up:vec3f }
fn coverScale()->f32 {
  let aspect=u.view.x/u.view.y;let narrow=1.-smoothstep(.7,1.2,aspect);
  return max(1.,aspect/(1672./941.))*mix(1.05,1.16,narrow);
}
fn camera() -> Camera {
  let narrow=1.-smoothstep(.7,1.2,u.view.x/u.view.y);
  let eye=vec3f(u.motion.x*.6,-u.motion.y*.38-u.motion.z*.3,11.-u.motion.z*2.);
  let focusPoint=vec3f(narrow*9.+u.motion.x*.12,-u.motion.y*.08,-25.);
  let f=normalize(focusPoint-eye);let r=normalize(cross(f,vec3f(0,1,0)));
  return Camera(eye,f,r,cross(r,f));
}
`;
// A photographic environment mapped onto an authored depth-relief mesh.
// The depth is an artistic approximation, not a scan of an actual cave.
export const cavernShader = common + /* wgsl */ `
@group(0) @binding(1) var artwork:texture_2d<f32>;
@group(0) @binding(2) var artworkSampler:sampler;
@group(0) @binding(3) var<storage,read> waves:array<vec2f>;
struct Vertex { @builtin(position) position:vec4f, @location(0) uv:vec2f }
fn heightAt(cell:vec2i)->f32 {let p=clamp(cell,vec2i(0),vec2i(127));return waves[u32(p.y*128+p.x)].x;}
fn gradient(cell:vec2i)->vec2f {
  return vec2f(heightAt(cell+vec2i(1,0))-heightAt(cell-vec2i(1,0)),heightAt(cell+vec2i(0,1))-heightAt(cell-vec2i(0,1)));
}
fn rippleNormal(uv:vec2f)->vec2f {
  let p=uv*127.;let cell=vec2i(floor(p));let f=fract(p);
  return mix(mix(gradient(cell),gradient(cell+vec2i(1,0)),f.x),mix(gradient(cell+vec2i(0,1)),gradient(cell+vec2i(1,1)),f.x),f.y);
}
fn relief(uv:vec2f)->f32 {
  let q=(uv-vec2f(.71,.32))*vec2f(3.1,2.1);
  let opening=exp(-dot(q,q));
  let foreground=smoothstep(.55,1.,uv.y)*8.+(1.-smoothstep(.05,.5,uv.x))*5.;
  return 19.+opening*25.-foreground;
}
@vertex fn vertexMain(@builtin(vertex_index) i:u32)->Vertex {
  let corners=array<vec2f,6>(vec2f(0,0),vec2f(1,0),vec2f(0,1),vec2f(0,1),vec2f(1,0),vec2f(1,1));
  let cell=i/6u;let grid=vec2f(240.,136.);
  let uv=(vec2f(f32(cell%240u),f32(cell/240u))+corners[i%6u])/grid;
  let depth=relief(uv);let aspect=1672./941.;
  let world=vec3f((uv.x*2.-1.)*aspect*depth/1.8,(1.-uv.y*2.)*depth/1.8,11.-depth);
  let cam=camera();let rel=world-cam.eye;let z=dot(rel,cam.forward);
  let viewport=u.view.x/u.view.y;let cover=coverScale();
  let xy=vec2f(dot(rel,cam.right)/viewport,dot(rel,cam.up))*1.8*cover;
  return Vertex(vec4f(xy,z*z/80.,z),uv);
}
@fragment fn fragmentMain(v:Vertex)->@location(0) vec4f {
  let time=u.view.z;let uv=v.uv;
  let q=(uv-vec2f(.7,.38))*vec2f(5.,3.);let water=exp(-dot(q,q));
  let flow=vec2f(sin(uv.y*37.+time*.23)+sin(uv.x*29.-time*.17),cos(uv.x*31.+time*.19));
  let ripple=rippleNormal(v.position.xy/u.view.xy)*.025*(.35+water*.65);
  let refracted=clamp(uv+ripple+flow*.00065*water,vec2f(.001),vec2f(.999));
  var colour=textureSample(artwork,artworkSampler,refracted).rgb;
  let caustic=sin(uv.x*19.+uv.y*11.+time*.20)*sin(uv.x*11.-uv.y*24.-time*.16);
  colour*=1.+caustic*.035*water;
  let light=pow(max(0.,1.-length((uv-vec2f(.72+u.motion.x*.008,.34))*vec2f(2.6,1.6))),3.);
  colour+=vec3f(.005,.012,.015)*light*(.5+.5*sin(time*.18+uv.y*6.));
  return vec4f(colour,1.);
}
`;
export const particleCompute = common + /* wgsl */ `
struct Particle { position:vec4f, seed:vec4f }
@group(0) @binding(1) var<storage,read_write> particles:array<Particle>;
@compute @workgroup_size(64) fn computeMain(@builtin(global_invocation_id) id:vec3u){
  if(id.x>=arrayLength(&particles)){return;}
  var p=particles[id.x].position;let seed=particles[id.x].seed;
  let dt=u.view.w;
  p.x+=dt*(sin(p.y*.55+u.view.z*.2+seed.x)*.10+sin(p.z*.31)*.035);
  p.y+=dt*(.04+seed.y*.035);
  p.z+=dt*(sin(p.x*.32+u.view.z*.12)*.04);
  if(p.y>6.){p.y=-4.;}
  particles[id.x].position=p;
}
`;
export const particleRender = common + /* wgsl */ `
struct Particle { position:vec4f, seed:vec4f }
@group(0) @binding(1) var<storage,read> particles:array<Particle>;
struct ParticleVertex { @builtin(position) position:vec4f, @location(0) point:vec2f, @location(1) light:f32 }
@vertex fn vertexMain(@builtin(vertex_index) vertex:u32,@builtin(instance_index) instance:u32)->ParticleVertex {
  let corners=array<vec2f,6>(vec2f(-1,-1),vec2f(1,-1),vec2f(-1,1),vec2f(-1,1),vec2f(1,-1),vec2f(1,1));
  let particle=particles[instance];let cam=camera();let rel=particle.position.xyz-cam.eye;
  let z=dot(rel,cam.forward);let aspect=u.view.x/u.view.y;
  let cover=coverScale();
  let size=(.007+particle.seed.z*.015)*1.8*cover/max(z,.1);
  var xy=vec2f(dot(rel,cam.right)/aspect,dot(rel,cam.up))*1.8*cover/max(z,.1);
  xy+=corners[vertex]*vec2f(size/aspect,size);
  if(z<.1){xy=vec2f(10.);}
  let glow=exp(-length(particle.position.xz-vec2f(4.,-14.))*.08)*.30;
  return ParticleVertex(vec4f(xy,min(z/80.,.999),1.),corners[vertex],glow);
}
@fragment fn fragmentMain(v:ParticleVertex)->@location(0) vec4f {
  let alpha=(1.-smoothstep(.15,1.,length(v.point)))*v.light;
  return vec4f(vec3f(.5,.72,.84)*alpha,alpha);
}
`;

// Ping-pong wave equation: height and velocity stay on the GPU. The cursor
// supplies a small impulse; neighbouring cells propagate and damp the wave.
export const rippleCompute = common + /* wgsl */ `
@group(0) @binding(1) var<storage,read> before:array<vec2f>;
@group(0) @binding(2) var<storage,read_write> after:array<vec2f>;
fn at(p:vec2i)->f32 {let q=clamp(p,vec2i(0),vec2i(127));return before[u32(q.y*128+q.x)].x;}
@compute @workgroup_size(8,8) fn computeMain(@builtin(global_invocation_id) id:vec3u){
  if(any(id.xy>=vec2u(128))){return;}
  let p=vec2i(id.xy);let index=id.y*128u+id.x;let state=before[index];
  let laplacian=at(p+vec2i(1,0))+at(p-vec2i(1,0))+at(p+vec2i(0,1))+at(p-vec2i(0,1))-4.*state.x;
  let q=(vec2f(id.xy)/127.-u.quality.yz)*vec2f(u.view.x/u.view.y,1.);
  let impulse=exp(-dot(q,q)*3500.)*u.quality.w*.55;
  let velocity=(state.y+laplacian*.22+impulse)*.982;
  let edge=smoothstep(0.,6.,f32(min(min(id.x,id.y),min(127u-id.x,127u-id.y))));
  after[index]=vec2f(clamp((state.x+velocity)*.998,-2.,2.),velocity)*edge;
}
`;
