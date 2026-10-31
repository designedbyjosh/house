export function visitorPanel(map) {
  return `<section class="visitor-atlas" aria-labelledby="visitor-heading" data-visitor-panel>
    <div class="atlas-heading"><div><p class="eyebrow">A little connection, across the world</p><h2 id="visitor-heading">You’re here. <em>Hello.</em></h2></div><span class="atlas-status" data-activity-status>Your visit</span></div>
    <div class="atlas-layout"><div class="atlas-world">
      <div class="atlas-coordinate"><span data-location>Finding your country…</span><span>COUNTRY LEVEL · APPROXIMATE</span></div>
      <div class="atlas-map-wrap">${map}</div>
      <div class="atlas-legend"><span><i class="legend-you"></i>Your approximate country</span><span data-global-legend hidden><i class="legend-world"></i>Recent visitors</span><span data-global-legend hidden>Last 30 minutes</span></div>
      <p class="map-caption" data-map-caption>Every outline is a place someone might be reading from.</p>
    </div><aside class="visit-passport" aria-label="Your visit">
      <p class="eyebrow">Your little corner of the internet</p><h3 data-welcome>Make yourself at home.</h3>
      <p class="visit-timer" data-visit-duration>—</p><p class="timer-caption">Time here this visit · visible tabs only</p>
      <dl class="visit-details"><div><dt>Previous visit</dt><dd data-last-visit>No earlier visit saved</dd></div><div><dt>You stayed for</dt><dd data-last-duration>—</dd></div><div><dt>Pages explored this visit</dt><dd data-visit-pages>—</dd></div><div><dt>Visits remembered</dt><dd data-visit-count>—</dd></div></dl>
      <p class="history-note" data-history-note>Remembered only in this browser, for up to 90 days.</p>
    </aside></div>
    <div class="atlas-bottom" data-world-summary hidden><div class="world-totals"><span><strong data-world-visitors>—</strong> visitors</span><span><strong data-world-countries>—</strong> countries</span><span><strong data-world-views>—</strong> page views</span></div><span class="atlas-update" data-activity-update></span></div>
    <details class="atlas-privacy"><summary>About this map &amp; your privacy</summary><div class="privacy-copy"><p>Country comes from an approximate network location; a VPN can change it. Map markers sit at country label points, never your exact location. When aggregate activity is connected, recent countries cover a 30-minute window and refresh every 30 seconds. They do not represent an exact count of people online.</p><p>Your last visit, visible-tab time and pages explored stay in this browser. We keep up to 20 visits for 90 days, with a new visit after 30 minutes away. Clearing browser storage resets this history. Umami receives page views without query strings; we don’t send it this local visit history or an identifying visitor ID. Browser Do Not Track and Global Privacy Control pause analytics and history.</p><div class="privacy-actions"><button type="button" data-clear-history>Clear my visit history</button><button type="button" data-toggle-analytics>Pause analytics &amp; history</button><span role="status" data-privacy-status></span></div><p class="map-attribution">Country outlines: <a href="https://www.naturalearthdata.com/about/terms-of-use/" rel="noreferrer">Natural Earth</a>. Small territories may not appear at this scale.</p></div></details>
    <noscript><p class="atlas-noscript">JavaScript is off. The country outlines are available; live activity and your visit history need JavaScript.</p></noscript>
  </section>`;
}
