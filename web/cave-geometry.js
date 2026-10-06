// Deterministic world-space geology. These functions produce actual mesh vertices.
const fract = x => x - Math.floor(x);
const mix = (a,b,t) => a+(b-a)*t;
export function noise(x,y,z) {
  const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);
  const fade=t=>t*t*(3-2*t);
  const a=fade(fract(x)),b=fade(fract(y)),c=fade(fract(z));
  const hash=(x,y,z)=>fract(Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453);
  return mix(mix(mix(hash(ix,iy,iz),hash(ix+1,iy,iz),a),mix(hash(ix,iy+1,iz),hash(ix+1,iy+1,iz),a),b),mix(mix(hash(ix,iy,iz+1),hash(ix+1,iy,iz+1),a),mix(hash(ix,iy+1,iz+1),hash(ix+1,iy+1,iz+1),a),b),c)*2-1;
}
export function geology(x,y,z) {
  return noise(x*.24,y*.24,z*.24)*1.9+noise(x*.68,y*.68,z*.68)*.65+noise(x*1.9,y*1.9,z*1.9)*.16;
}
export function surface(columns,rows,point,include=()=>true) {
  const positions=new Float32Array((columns+1)*(rows+1)*3),indices=[];
  for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++)positions.set(point(x/columns,y/rows),(y*(columns+1)+x)*3);
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
    if(!include((x+.5)/columns,(y+.5)/rows))continue;
    const a=y*(columns+1)+x,b=a+1,c=a+columns+1,d=c+1;
    indices.push(a,c,b,b,c,d);
  }
  return {positions,indices:new Uint32Array(indices)};
}
export const floorHeight=(x,z)=>-7+geology(x,0,z)*.65+Math.sin(x*.16+z*.08)*.6;
export function chamberSurfaces() {
  return [
    surface(180,220,(u,v)=>{const x=u*66-33,z=28-v*110;return [x,floorHeight(x,z),z];}),
    // Annular topology follows the opening exactly, avoiding a stair-stepped grid cutout.
    surface(360,80,(u,v)=>{
      const angle=u*Math.PI*2,edge=7.5+noise(Math.cos(angle)*2,9,Math.sin(angle)*2)*.7;
      const radius=edge+(62-edge)*v,x=9+Math.cos(angle)*radius/.9,z=-17+Math.sin(angle)*radius/.8;
      return [x,13+geology(x,18,z)*1.2,z];
    }),
    ...[-1,1].map(side=>surface(180,70,(u,v)=>{const z=25-u*110,y=-9+v*26;const radius=17+Math.sin(z*.09)*3+Math.cos(y*.16)*2;return [side*radius+geology(side*18,y,z),y,z];}))
  ];
}
