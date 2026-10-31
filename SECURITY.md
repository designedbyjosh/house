# Security

Report issues privately to joshua@whitcombe.me. Please avoid posting credentials or private data in public issues.

## Controls

- No runtime npm dependencies, SSR or admin API in the public website. The optional Umami Cloud API key is server-only in Vercel; it is never embedded in static output or returned to visitors.
- All cached article content is treated as untrusted text and escaped before rendering.
- Only HTTPS external links and validated local paths are rendered as links.
- CSP keeps styles, images and fonts on the same origin and allows only the approved Umami Cloud script and collection hosts for analytics. Frames, forms and objects remain disabled. No inline scripts or styles are required.
- The visitor-location endpoint is non-cacheable. The public analytics endpoint exposes only bounded aggregate counts; upstream sessions, profiles, URLs, errors and credentials are omitted. Preview configurations never inherit production property IDs or credentials.
- DNT, GPC and browser opt-out suppress tracking and local history. Personal visit history is bounded to 20 visits/90 days in the visitor's own browser and is not submitted to Umami. Map markers represent countries, not precise locations.
- HTTPS, HSTS, no-sniff, frame denial, no-referrer and a restrictive Permissions Policy are applied at CloudFront.
- S3 blocks public access and ACLs, encrypts objects, retains version history, denies plaintext transport and restricts reads to the site distribution through OAC.
- GitHub jobs default to read-only access. Only the master deployment job receives id-token write access. Fork/PR jobs cannot assume the AWS role.
- AWS access uses temporary GitHub OIDC sessions with exact repository/branch and audience conditions. Content and infrastructure permissions are separately scoped.
- GitHub Actions are pinned by immutable commit SHA, checked with CodeQL, and monitored by Dependabot.
- Atomic releases, checksums, content recovery records and rollback preserve published writing.

## Boundaries

This migration removes the vulnerable legacy runtime and its active service dependencies. It does not rewrite Git history, rotate credentials in unrelated services, change account-wide AWS security, or claim that automated analysis proves the absence of every possible vulnerability.

The deleted Ghost endpoint used an admin JWT and accepted signups over a query string. It is no longer deployed. If Ghost or other old integrations are restored, issue fresh credentials, keep them in a managed secret store and implement validation, abuse controls and confirmation before accepting subscribers. Never place private integration credentials in browser code or public Git history.

The deployment role does not get IAM administration or access to other buckets and distributions. New infrastructure or IAM changes require a separately reviewed bootstrap. Keep the GitHub production branch protected and restrict who can modify its workflows.
