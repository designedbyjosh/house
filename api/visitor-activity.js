import {configuration, readRealtime, json} from '../lib/umami.js';
let cached, pending;
export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return json(res, 405, {error: 'Method not allowed'}); }
  const config = configuration();
  if (!config?.credential) return json(res, 200, {status: 'unavailable', reason: 'not_configured'});
  const key = `${config.apiBase}:${config.websiteId}`;
  try {
    if (!cached || cached.key !== key || Date.now() - cached.time > 30000) {
      pending ||= readRealtime(config).finally(() => { pending = null; });
      cached = {key, time: Date.now(), data: await pending};
    }
    json(res, 200, {...cached.data, environment: config.environment}, 'public, max-age=0, s-maxage=30');
  } catch {
    // No upstream error body, credential, session ID, URL or visitor profile is public.
    json(res, 503, {status: 'unavailable', reason: 'upstream_unavailable'});
  }
}
