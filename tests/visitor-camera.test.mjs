import test from 'node:test';
import assert from 'node:assert/strict';
import {countryFrame,worldFrame} from '../web/visitor-camera.js';
test('country focus fills the wallpaper and keeps the marker inside desktop and mobile viewports',()=>{
  for(const [width,height] of [[1280,900],[390,844],[844,390]]) {
    const frame=countryFrame({x:782,y:280,width:100,height:70},width,height);
    assert(Math.abs(frame.width/frame.height-width/height)<.0001);
    assert(frame.x<782 && frame.x+frame.width>782); assert(frame.y<280 && frame.y+frame.height>280);
    assert(frame.width<900);
  }
});
test('dateline-crossing country geometry stays focused rather than zooming out to the entire world',()=>{
  const frame=countryFrame({x:895,y:250,width:898,height:20},1280,900);
  assert(frame.width<450); assert(frame.x+frame.width>895);
});
test('unknown location retains a finite complete-world fallback, including during zero-size layout',()=>{
  for(const [width,height] of [[1280,900],[390,844],[0,0]]) {
    const frame=worldFrame(width,height);
    assert(Object.values(frame).every(Number.isFinite)); assert(frame.width>=900); assert(frame.height>=370);
  }
});
