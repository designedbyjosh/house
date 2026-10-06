import test from 'node:test';
import assert from 'node:assert/strict';
import {chamberSurfaces,floorHeight,surface} from '../web/cave-geometry.js';

test('chamber mesh buffers contain finite 3D positions and valid triangle indices',()=>{
  const chamber=chamberSurfaces();assert.equal(chamber.length,4);
  for(const mesh of chamber){
    assert(mesh.positions.length>10000);assert.equal(mesh.indices.length%3,0);
    assert(mesh.positions.every(Number.isFinite));
    assert(mesh.indices.every(i=>i<mesh.positions.length/3));
    for(let axis=0;axis<3;axis++){
      let min=Infinity,max=-Infinity;for(let i=axis;i<mesh.positions.length;i+=3){min=Math.min(min,mesh.positions[i]);max=Math.max(max,mesh.positions[i]);}
      assert(max-min>1,`axis ${axis} must contain actual volume rather than a flat image plane`);
    }
  }
});
test('the cavern has a continuous low roof and floor',()=>{
  const [floor,roof]=chamberSurfaces();
  assert.equal(floor.indices.length,180*220*6);assert.equal(roof.indices.length,180*150*6);
  let minimum=Infinity,maximum=-Infinity;for(let x=-30;x<=30;x+=3)for(let z=-70;z<=20;z+=3){const h=floorHeight(x,z);minimum=Math.min(minimum,h);maximum=Math.max(maximum,h);}
  assert(minimum>-11&&maximum<-3);
});
test('surface generation preserves shared vertices and excludes aperture cells',()=>{
  const grid=surface(2,2,(u,v)=>[u,v,u*v],(u,v)=>u<.5);
  assert.equal(grid.positions.length,27);assert.equal(grid.indices.length,12);
  assert.equal(grid.indices[0],0);assert.equal(grid.indices[1],3);
});
