export function visitorPanel(map, {home=false} = {}) {
  const wallpaper=map.replace('class="country-outlines"','id="country-geometry" class="country-outlines"').replace('<g class="visitor-pins"','<use href="#country-geometry" transform="translate(-900 0)"/><use href="#country-geometry" transform="translate(900 0)"/><g class="visitor-pins"');
  if(home) return `<div class="visitor-experience--home" data-visitor-panel data-visitor-home>
    <div class="visitor-wallpaper" aria-hidden="true">${wallpaper}</div>
    <aside class="visitor-pin-note" aria-label="Your visit" data-home-pin hidden>
      <button class="visitor-pin-trigger" type="button" aria-label="Show your visit details" aria-expanded="false" aria-controls="visitor-pin-card" data-pin-toggle><span class="pin-dot" aria-hidden="true"></span></button>
      <div class="visitor-pin-card" id="visitor-pin-card" data-pin-card hidden>
        <p class="pin-eyebrow">You’re here</p><h2 data-pin-country>Around the world</h2>
        <dl><div class="pin-last"><dt>Last here</dt><dd data-last-visit>First visit</dd></div><div><dt>Saved visits</dt><dd data-pin-visits>—</dd></div><div><dt>Time here</dt><dd data-visit-duration>—</dd></div></dl>
        <a href="/visitors/">Your visits &amp; privacy <span aria-hidden="true">↗</span></a>
      </div>
    </aside>
  </div>`;
  return `<section class="visitor-experience" aria-labelledby="visitor-heading" data-visitor-panel>
    <div class="visitor-wallpaper" aria-hidden="true">${wallpaper}</div>
    <div class="visitor-hero"><p class="eyebrow"><span class="connection-dot" aria-hidden="true"></span><span data-activity-status>Your corner of the world</span></p>
      <h1 id="visitor-heading">You’re here.<br><em data-country-name>Somewhere.</em></h1>
      <p class="visitor-greeting" data-welcome>Make yourself at home.</p>
      <div class="visitor-location"><span data-location>Finding your approximate country…</span><button type="button" data-map-toggle hidden>Show the world <span aria-hidden="true">↗</span></button></div>
    </div>
    <dl class="visit-strip"><div><dt>Time here</dt><dd class="visit-clock" data-visit-duration>—</dd><span>Visible-tab time this visit</span></div><div><dt>Last here</dt><dd data-last-visit>First visit</dd><span data-last-context>History starts with this visit</span></div><div><dt data-last-duration-label>Last stay</dt><dd data-last-duration>—</dd><span data-last-duration-note>Remembered in this browser</span></div><div><dt>Pages explored</dt><dd data-visit-pages>—</dd><span>This visit</span></div></dl>
    <section class="visit-journal" aria-labelledby="history-heading"><div class="journal-heading"><h2 id="history-heading">Your visits</h2><span data-visit-count></span></div><p class="history-note" data-history-note>Saved in this browser for up to 90 days.</p><ol class="visit-history-list" data-visit-history><li>Your first visit will appear here.</li></ol></section>
    <div class="world-summary" data-world-summary hidden><p>Elsewhere, in the last 30 minutes</p><span><strong data-world-visitors>—</strong> visitors</span><span><strong data-world-countries>—</strong> countries</span><span><strong data-world-views>—</strong> page views</span><small data-activity-update></small><p data-map-caption></p></div>
    <details class="visitor-privacy"><summary>About this map &amp; your privacy</summary><div><p>The background is centred on your approximate country, using network location. A VPN can change it. The marker is a country label point, never your exact location. <span data-global-legend hidden>Recent countries cover a 30-minute window and refresh every 30 seconds.</span></p><p>Last here shows the saved activity from before you opened this page. Arriving directly or from another site starts a new visit; refreshes and links within the site continue your recent visit. Thirty minutes away also starts a new visit. We remember up to 20 visits for 90 days in this browser and on this domain. Private browsing or clearing website data can erase that history.</p><p>Umami receives page views without query strings; your local visit history and identifying visitor IDs are never sent. Do Not Track and Global Privacy Control pause analytics and local history.</p><div class="privacy-actions"><button type="button" data-clear-history>Clear my visit history</button><button type="button" data-toggle-analytics>Pause analytics &amp; history</button><span role="status" data-privacy-status></span></div><p class="map-attribution">Country outlines: <a href="https://www.naturalearthdata.com/about/terms-of-use/" rel="noreferrer">Natural Earth</a>. Small territories may not appear at this scale.</p></div></details>
    <noscript><p>JavaScript is off. The outlines remain visible; country focus and visit history need JavaScript.</p></noscript>
  </section>`;
}
