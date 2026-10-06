// The same mesh scene is rendered by WebGPU or WebGL2. No image projection.
(async()=>{
  const canvas=document.querySelector('#ocean-canvas');if(!canvas)return;
  try {const {startCave}=await import('./cave-controller.js');await startCave(canvas);}
  catch(error){console.warn('3D cave unavailable; showing the static fallback.',error);}
})();
