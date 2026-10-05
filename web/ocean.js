// Progressive enhancement: native WebGPU, image-based WebGL, then static HTML.
(async () => {
  const canvas=document.querySelector('#ocean-canvas');
  if(!canvas)return;
  let fallbackStarted=false;
  async function fallback(){
    if(fallbackStarted)return;fallbackStarted=true;
    // A canvas cannot switch from a WebGPU context to WebGL in-place.
    const current=document.querySelector('#ocean-canvas');
    const replacement=current.cloneNode(false);replacement.classList.remove('is-ready');delete replacement.dataset.renderer;
    current.replaceWith(replacement);
    try {await import('./ocean-fallback.js');} catch {/* The still image is already rendered. */}
  }
  try {
    const {startWebGPU}=await import('./ocean-gpu.js');
    if(!await startWebGPU(canvas,fallback))await fallback();
  } catch {await fallback();}
})();
