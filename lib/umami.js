// Server-only Umami integration. Never forward visitor/session rows to the browser.
export const WINDOW_MS = 30 * 60 * 1000;
export const TRACKER_ORIGINS = new Set(['https://cloud.umami.is', 'https://analytics.umami.is']);
const uuid = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
export function configuration(env = process.env) {
  const production = env.VERCEL_ENV === 'production';
  const prefix = production ? 'UMAMI_' : 'UMAMI_PREVIEW_';
  const websiteId = env[`${prefix}WEBSITE_ID`];
  if (!uuid.test(websiteId || '')) return null;
  try {
    const script = new URL(env.UMAMI_SCRIPT_URL);
    if (!TRACKER_ORIGINS.has(script.origin) || script.username || script.password || script.search || script.hash || !['/script.js', '/umami.js'].includes(script.pathname)) return null;
    return {
      websiteId, scriptUrl: script.href,
      apiBase: 'https://api.umami.is/v1',
      credential: env[`${prefix}API_KEY`] || null,
      environment: production ? 'production' : 'preview',
    };
  } catch { return null; }
}
export function countryCode(value) {
  return typeof value === 'string' && /^[A-Z]{2}$/.test(value) && !['XX', 'ZZ', 'T1'].includes(value) ? value : null;
}
function count(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 1e9) throw new Error('Invalid aggregate');
  return value;
}
export function aggregateRealtime(data, now = Date.now()) {
  if (!data || typeof data.countries !== 'object' || Array.isArray(data.countries) || !data.totals) throw new Error('Invalid realtime response');
  const countries = Object.entries(data.countries).flatMap(([code, value]) => countryCode(code.toUpperCase()) ? [{code: code.toUpperCase(), visitors: count(value)}] : []).filter(row => row.visitors > 0).slice(0, 250);
  return {
    status: 'connected', observedAt: new Date(now).toISOString(), windowMinutes: WINDOW_MS / 60000,
    visitors: count(data.totals.visitors), views: count(data.totals.views), countries,
  };
}
export async function readRealtime(config, {fetcher = fetch, now = Date.now()} = {}) {
  const url = new URL(`${config.apiBase}/realtime/${config.websiteId}`);
  url.search = new URLSearchParams({startAt: String(now - WINDOW_MS), endAt: String(now), timezone: 'UTC'}).toString();
  const headers = {Authorization: `Bearer ${config.credential}`};
  const response = await fetcher(url, {headers: {...headers, Accept: 'application/json'}, signal: AbortSignal.timeout(5000), redirect: 'error'});
  if (!response.ok) throw new Error('Analytics unavailable');
  return aggregateRealtime(await response.json(), now);
}
export function json(res, status, body, cache = 'private, no-store') {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = status;
  res.end(JSON.stringify(body));
}
