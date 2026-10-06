# Security

Report issues privately to joshua@whitcombe.me. Please avoid posting credentials or private data in public issues.

## Controls

- No runtime npm dependencies, SSR, admin API or backend keys in browser assets. The isolated traffic function has server-only access to a dedicated counter store.
- All cached article content is treated as untrusted text and escaped before rendering.
- Only HTTPS external links and validated local paths are rendered as links.
- CSP restricts scripts, styles, images and fonts to the same origin; connections are restricted to the same origin; frames, forms and objects are disabled. No inline scripts or styles are required.
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

## Public project reachability checks

The optional Vercel status function checks only the fixed public article index using HEAD, a five-second timeout and no redirects. It accepts no upstream URL or credentials and returns no upstream body, headers, private identifiers or raw errors. Browser requests remain same-origin. These observations describe public reachability only. Live dots reflect public website page-view reports; the architecture walkthrough is synthetic. Private services are not monitored.

## Public website traffic

The counter exposes only active totals by allowlisted public path, aggregate minute buckets, and aggregate event sequence numbers. It never returns session tokens, view tokens, individual event timestamps or store connection information. Query strings and fragments are excluded. No IP addresses, user agents, referrers, accounts or private service traffic are stored by the counter. Hosting providers may retain their standard access logs.

A random per-tab token and monotonic event sequence reconcile visibility, navigation and reordered network requests. Presence records are pruned after two minutes and the key expires two minutes after its last write; in the absence of further requests a stale record can remain for up to four minutes. Hashed view de-duplication keys expire after 16 minutes. Aggregate buckets cover 15 minutes and the aggregate key expires after 16 minutes of inactivity. DNT, GPC and the footer opt-out stop new presence writes; a departing session may remain counted until its 60-second lease expires.

Writes require a matching HTTP Origin, supported events and paths, bounded body size and random-token format. This is abuse reduction, not authentication: a non-browser client can forge visits. Counts must not be used for billing, security decisions or exact audience measurement. Store operations are atomic and capped per namespace, with dedicated least-scope credentials kept in Vercel environment variables. Missing configuration, timeouts and provider errors are reported generically as unavailable. Preview namespaces are isolated from production. Free-tier command limits and platform request limits still apply; paid upgrades must remain disabled.
