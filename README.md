# Joshua Whitcombe’s journal

The website is a static journal built from recovered article text. It does not need Ghost, a database, Spotify websockets, Mapbox, server-side rendering, or third-party analytics to load or build.

## Recovered writing

Six complete article texts were recovered on 5 October 2026 from cached public web pages linked in the original sitemap and article navigation. The raw extracted cache is preserved in `content/snapshot.json`; editable article bodies, their provenance, and SHA-256 checksums are under `content/`.

The journal lives at `/articles/`. Old `/blog/` addresses permanently redirect on AWS, including the previous incorrect widower slug. RSS, a sitemap, the travel note, photography captions, and all 41 photography addresses from the original sitemap are retained.

The cache did not yield the original image bytes or exact publication dates. Missing images are labelled; dates have not been invented. `blog/cliftons` was a source placeholder and is directed to the journal. This is the set of articles recovered from the available cache, not a claim that every historical post has been found.

The old application and its configuration remain recoverable in Git history before this migration.

## Build and verify

Use Node.js 24 LTS. There are no npm dependencies.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run check
node scripts/security-check.mjs
npm test
npm run build
npm run verify
```

`npm run dev` builds and serves a preview at `http://127.0.0.1:4173`. `SITE_URL` optionally changes the canonical HTTPS origin. Article edits require deliberately updating the corresponding SHA-256 in `content/articles.json`.

## Hosting

`infra/site.json` manages the `house-static` CloudFormation stack in Sydney. It provisions encrypted, private, versioned S3 storage; CloudFront with signed origin access; HTTPS redirects; security response headers; and a small edge router for deep links and old blog URLs. S3 data survives stack deletion and replacement.

The AWS archive is `https://archive.josh.house` (CloudFront origin `https://d1bw5pfrth43jy.cloudfront.net`). Existing custom domains remain on their current Vercel entry point, with an explicit external route to AWS in `vercel.json`. This bridge preserves the current domain configuration while AWS serves the website. Moving the DNS itself to CloudFront later requires an ACM certificate in us-east-1 and access to the authoritative DNS for josh.engineer. The template has optional custom-domain parameters for that cutover.

CloudFront pay-as-you-go includes ongoing monthly free allowances for 1 TB of transfer, 10 million requests and 2 million function invocations. S3 storage/requests, traffic above allowances, and any domain/DNS costs may still be billable on this existing account. This architecture has no always-on server, load balancer, NAT gateway or database. See [AWS’s current CloudFront pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/).

## CI/CD

Pull requests and commits to master run syntax, security, article-integrity and local-link checks plus extended CodeQL analysis. Actions are pinned to verified commit SHAs; Dependabot checks action updates weekly. CodeQL also runs weekly.

Only the master branch can assume the scoped `house-github-deploy` role through GitHub OIDC. There are no stored AWS access keys. This role can upload only this site’s release objects, update only this CloudFormation stack through its dedicated execution role, and invalidate only this CloudFront distribution. The execution role is limited to existing site infrastructure, with no IAM or general resource-creation permissions. Policies and trust documents are checked into `infra/`.

After successful checks, deployment uploads every file to `releases/<commit>/` before creating a CloudFormation change set. It rejects resource deletion/replacement, applies the template and release pointer together, waits for propagation, invalidates the cache, and verifies the expected commit, all six article routes, RSS and security headers at the AWS origin, archive.josh.house, josh.house and josh.engineer. Failed live checks restore the previous release. Concurrent master deployments are queued; PR checks can be cancelled.

The manually dispatched **Roll back the website** workflow restores a previously uploaded commit without rebuilding content. Releases are immutable; retrying a partial upload accepts only objects whose checksums match. Old release prefixes are retained for recovery. Do not add a blanket expiry to release objects: it could delete a still-active release.

For infrastructure changes, edit the template and router together and review the PR. Ordinary in-place updates deploy with the site; replacement, domain cutover, new resources and IAM changes need a separately scoped administrative bootstrap. `infra/deployment.json` identifies the account, stack and roles. The only wildcard deployment permission is CloudFormation template validation, which has no resource-level authorization.

## Services left offline

Ghost newsletter signup, the live Spotify feed and Umami analytics were removed from the request path. RSS and a contact link replace the broken signup UI. They have not been silently recreated or migrated with subscriber data or Spotify credentials: those source data and credentials were not available. Photo galleries currently preserve captions and addresses, not the missing original images.

## Security

See [SECURITY.md](SECURITY.md). The site’s HTML escapes content; it does not execute cached HTML, code injection, remote scripts or arbitrary URL schemes. Private S3 access is restricted to the one CloudFront distribution, and insecure S3 transport is denied.
