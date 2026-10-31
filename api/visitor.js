import {configuration, countryCode, json} from '../lib/umami.js';
export default function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return json(res, 405, {error: 'Method not allowed'}); }
  const config = configuration();
  // Vercel supplies this header. Local requests must not be mistaken for geolocation.
  const country = process.env.VERCEL === '1' ? countryCode(req.headers['x-vercel-ip-country']) : null;
  json(res, 200, {country, locationPrecision: 'country', activityAvailable: Boolean(config?.credential), analytics: config ? {websiteId: config.websiteId, scriptUrl: config.scriptUrl, environment: config.environment} : null});
}
