# 0013. Rationale: move hosting to Cloudflare Pages

## Context

Spec 0001 put the site on Netlify Free. At launch (2026-10-31) Netlify served every page with a "Powered by Netlify" badge. Spec 0012 planned to switch it off, but on this account the switch needs a paid plan. The site's strict CSP stops the badge drawing, which leaves an empty, fixed 216×92 box at the top `z-index` in the bottom right corner that swallows taps, including on a full width booking button at 390px.

Forces from Abed: no host branding, $0 a month, and keeping PR preview links (not indexed), security headers kept in a repo file, and deploy on merge. Moving DNS is acceptable if email is protected. The domain carries Google Workspace email (MX `smtp.google.com`, SPF, a Google verification record) on Namecheap DNS. Until a move lands, the corner overlay keeps hurting the live site, so the move needs a short term answer as well.

## Options considered

### Option 1: Cloudflare Pages (chosen)

Free static hosting with Git deploys, unlimited previews that send `noindex` by default, and a `_headers` file in the same format Netlify uses.

**Pros**: meets every must keep with no extra tooling; free DNS, CDN, and HTTPS; 500 builds a month is far above this site's needs.
**Cons**: the bare domain needs Cloudflare's nameservers; several zone features (email obfuscation, Rocket Loader, Web Analytics) rewrite pages unless switched off; Free is positioned for projects that "aren't business critical" and the commercial terms were not confirmed (Abed checks before phase 2).

### Option 2: Firebase Hosting (Spark)

Google's free static hosting, no badge found.

**Pros**: works with DNS at the registrar; strong CDN.
**Cons**: 360 MB a day transfer cap; previews need a GitHub Action holding a service account key; preview URLs are not `noindex`; headers live in `firebase.json`.

### Option 3: Render static sites (free)

**Pros**: simple dashboard, free TLS.
**Cons**: headers are set in the dashboard, not a repo file (fails a must keep); preview and bandwidth terms unclear.

### Option 4: Pay for Netlify Personal ($9 a month)

**Pros**: no migration; badge off by default on paid plans.
**Cons**: breaks the $0 budget.

GitHub Pages was ruled out: its docs say it is not allowed for running an online business. Vercel Hobby is non commercial only.

## Rationale

Cloudflare Pages is the only free option that keeps all three must keeps without new tooling, and its `_headers` format means the current headers move almost unchanged. The nameserver move is its real cost, and Abed accepted it with email protected first (AC-7). Its zone features are the main way it could reintroduce what this move escapes, so the spec turns them off explicitly and spec 0012's daily check guards them.

The side by side cutover keeps the domain on a working host at every step, and Namecheap's untouched records make rollback a nameserver change. `'unsafe-inline'` was chosen over a hash for the stopgap because a hash fails silently back into the invisible overlay when Netlify updates its script, while `'unsafe-inline'` on a page with no user input costs little for a few days. Branch based production detection (`CF_PAGES_BRANCH`) needs no dashboard variable, so it cannot be forgotten.

## References

**Project sources**:
- Spec 0001 (hosting, headers), spec 0010 (Umami production gate on `CONTEXT`), spec 0012 (daily live check, `LIVE_URL`)
- `netlify.toml`, `config/preview-headers`, `src/layouts/Base.astro`, `src/content/site.ts` privacy paragraph
- DNS lookup on 2026-10-31: Namecheap nameservers, Google MX, SPF, verification TXT; badge script contacts no outside host

**Practices & standards**:
- Strangler style side by side cutover with DNS rollback
- Strict CSP; synthetic monitoring of production HTML

**Links**:
- Cloudflare Pages headers (`_headers` format): https://developers.cloudflare.com/pages/configuration/headers/
- Cloudflare Pages limits (500 builds, unlimited previews): https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Pages build configuration (`CF_PAGES_BRANCH`): https://developers.cloudflare.com/pages/configuration/build-configuration/
- Cloudflare Pages custom domains (apex needs a Cloudflare zone): https://developers.cloudflare.com/pages/configuration/custom-domains/
- Firebase pricing (Spark limits): https://firebase.google.com/pricing
- Render static sites: https://render.com/docs/static-sites
- GitHub Pages limits (no online business): https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Netlify Powered by Netlify badge: https://docs.netlify.com/manage/projects/powered-by-netlify-badge/
