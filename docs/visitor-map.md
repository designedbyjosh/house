# Visitor map and Umami Cloud

The homepage and `/visitors/` show locally bundled Natural Earth country outlines, the current visitor's approximate country, aggregate activity from Umami Cloud and a browser-local visit history. Static writing and navigation still work when either API is unavailable.

## Connection

The Umami Cloud property for `josh.engineer` is `26b0b891-ac3d-4839-be53-5aca4fd164b0`. This is a public tracking identifier, not a credential. The existing Umami hostname is not used. Vercel's **house** project has the production website ID and `https://cloud.umami.is/script.js` configured. Personal country location, last visit and duration work on the free Hobby plan. The optional aggregate map requires Pro API access (the account currently shows a $20/month upgrade with usage overages) and a server-only `UMAMI_API_KEY` Secret. No upgrade or trial was started. Without that optional connection the aggregate counters are hidden and the personal map remains fully usable. Use the account's API-key settings and scope the Vercel variable to Production. Do not put it in Git, browser storage, an issue, or a PR.

The current Cloud account rejected a second property with “Website limit reached.” No plan change or upgrade was made. Preview tracking is disabled unless a separate `UMAMI_PREVIEW_WEBSITE_ID` is deliberately supplied. Preview API access additionally requires its own `UMAMI_PREVIEW_API_KEY`; production credentials are never inherited. Do not point the preview variables at the production property.

`/api/visitor` returns only a validated Vercel country header and public tracker configuration, with `private, no-store`. Local development never trusts a caller-supplied geo header. No coordinates, IP, city, or API key are returned. `/api/visitor-activity` queries the fixed Cloud realtime endpoint with Bearer authentication and projects its response to totals and per-country counts. It never returns session IDs, event rows, referrers, visitor URLs or browser fingerprints. Data is cached for 30 seconds; failures return unavailable, never synthetic zeroes or stale activity. API credentials are not required to collect page views, but are required to display the global aggregates.

The map describes the trailing 30-minute activity window, not an exact count of people online. One marker represents a country label point, not a visitor's physical location. Country counts depend on Umami's session estimation and can be affected by VPNs, blockers and shared devices. The local SVG omits Antarctica and may omit small territories at this scale. The text country label remains available independently of geometry.

## Personal history

`josh.visit-history.v1` stores at most 20 visits for 90 days in localStorage. Each visit stores timestamps, visible-tab time, page-view count and up to 100 distinct paths. Paths exclude search and hash. A new visit starts after 30 minutes without visible activity. Timer intervals are capped and overlapping tabs do not intentionally double-count the same interval. Browser suspension, concurrent writes, storage clearing and clock changes make these approximate browser-local memories, not an authenticated cross-device history. Private/denied storage falls back to this page only.

DNT, GPC and a saved opt-out suppress both the tracker and local-history writes. The controls clear history or pause tracking. The Umami before-send hook strips query strings, fragments and referrer paths and rechecks the opt-out before each event. No local-history data, persistent custom visitor identifier, session replay or precise location is sent to Umami. Ordinary CDN/server request logging is separate from these browser controls.

## Delivery and verification

1. Run `npm run check`, `npm test`, `npm run build`, `npm run verify`, and `node scripts/security-check.mjs` using Node 24.
2. Preview with `PORT=4187 npm run dev`. Missing location and unavailable global activity are expected locally. Check desktop/mobile layout, privacy controls, navigation persistence and browser errors.
3. Review the PR and its Vercel preview. Production hosts retain the AWS static bridge; preview hosts serve the branch's static output. Both visitor API routes are handled by Vercel before the bridge.
4. Configure `UMAMI_API_KEY` as a production Secret, then deliver through the existing PR/CI route. The static release and Vercel functions must both deploy. CSP permits only the approved Umami Cloud script/collection hosts alongside same-origin resources.
5. Verify `/api/visitor` on `josh.engineer` has the expected public property ID and a no-store response. Visit a real page and verify the corresponding page view in the authenticated Cloud dashboard. Check `/api/visitor-activity` returns `connected` with a fresh observation and only allowed aggregate fields. Test DNT/opt-out, reload and backgrounding. A ready preview is not proof of production collection.

Official references: [Cloud API keys](https://docs.umami.is/docs/cloud/api-key), [tracker configuration](https://docs.umami.is/docs/tracker-configuration), [realtime route](https://github.com/umami-software/umami/blob/master/src/app/api/realtime/%5BwebsiteId%5D/route.ts), [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/).
