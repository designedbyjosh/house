// The hero is a complete procedural 3D chamber; its poster is a frame of that scene.
export const oceanScene = `<div class="ocean-scene" aria-hidden="true"><div class="ocean-fallback"></div><canvas id="ocean-canvas"></canvas><div class="ocean-shade"></div></div>`;
const controls = `<p class="explore-hint" hidden>Drag to look around · Scroll to move · Esc to exit<br>Arrow keys to look · + / − to move</p><div class="scene-controls"><button class="explore-toggle" type="button" aria-pressed="false" hidden>Explore cave</button><button class="motion-toggle" type="button" aria-pressed="false" hidden>Pause motion</button></div>`;
export function homePage(cards) {
  return `<section class="ocean-hero" aria-labelledby="home-heading">
${oceanScene}
<div class="hero-content"><p class="eyebrow">Software engineer / Sydney</p><h1 id="home-heading">Joshua<br>Whitcombe<span class="name-period">.</span></h1><p class="hero-intro">Engineering, diving, photography and writing.</p><div class="hero-actions"><a class="text-link" href="#my-world">Explore <span aria-hidden="true">↓</span></a><a class="text-link" href="mailto:joshua@whitcombe.me">Contact <span aria-hidden="true">↗</span></a></div></div>
<div class="hero-bottom"><span class="scene-note">INTERACTIVE CAVE / 01</span>${controls}</div><div class="scroll-progress" aria-hidden="true"><span></span></div></section>
<nav class="section-links section-wrap" id="my-world" aria-label="Explore the website"><a href="/engineering/"><span>01 / Engineering</span><span>Projects & systems ↗</span></a><a href="/photography/"><span>02 / Photography</span><span>View archive ↗</span></a><a href="/articles/"><span>03 / Journal</span><span>Read articles ↗</span></a></nav>
<section class="writing-section section-wrap home-writing"><div class="section-kicker"><span>Journal</span><a href="/articles/">All articles ↗</a></div><ul class="article-grid">${cards}</ul></section>
`;
}
