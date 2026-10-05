import test from 'node:test';
import assert from 'node:assert/strict';
import {startWebGPU} from '../web/ocean-gpu.js';

function globals(t, values) {
  for (const [key, value] of Object.entries(values)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {configurable:true, value});
    t.after(() => original ? Object.defineProperty(globalThis,key,original) : delete globalThis[key]);
  }
}

test('WebGPU capability checks leave the HTML fallback untouched', async t => {
  const canvas = {getContext(){throw new Error('must not touch canvas');}};
  const navigator={};
  globals(t, {navigator, isSecureContext:true});
  assert.equal(await startWebGPU(canvas, () => assert.fail()), false);
  navigator.gpu={requestAdapter:async()=>null};
  assert.equal(await startWebGPU(canvas, () => assert.fail()), false);
});

test('insecure contexts never request a GPU adapter', async t => {
  globals(t, {navigator:{gpu:{requestAdapter(){assert.fail();}}}, isSecureContext:false});
  assert.equal(await startWebGPU({}, () => assert.fail()), false);
});

for (const failure of ['shader compilation', 'pipeline creation', 'image decoding']) {
  test(`${failure} failure releases the device and retains the still image`, async t => {
    let destroyed=0, contexts=0, warnings=0;
    const classes=new Set();const button={hidden:true};
    const canvas={
      dataset:{},classList:{remove:name=>classes.delete(name)},
      closest:()=>({querySelector:selector=>selector==='.motion-toggle'?button:{decode:async()=>{throw new Error('decode unavailable');}}}),
      getContext(){contexts++;throw new Error('must retain static image');}
    };
    const device={
      createShaderModule:()=>({getCompilationInfo:async()=>({messages:failure==='shader compilation'?[{type:'error',lineNum:1,message:'invalid WGSL'}]:[]})}),
      createRenderPipelineAsync:async()=>{if(failure==='pipeline creation')throw new Error('pipeline unavailable');return {};},
      createComputePipelineAsync:async()=>({}),
      destroy(){destroyed++;}
    };
    globals(t, {
      navigator:{gpu:{requestAdapter:async()=>({requestDevice:async()=>device}),getPreferredCanvasFormat:()=> 'bgra8unorm'}},
      isSecureContext:true,cancelAnimationFrame(){},console:{warn(){warnings++;}}
    });
    assert.equal(await startWebGPU(canvas,()=>assert.fail()),false);
    assert.equal(destroyed,1);assert.equal(contexts,0);assert.equal(button.hidden,true);assert.equal(warnings,1);
  });
}
