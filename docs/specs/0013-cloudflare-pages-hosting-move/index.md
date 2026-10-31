# 0013. Move hosting from Netlify Free to Cloudflare Pages

**Date**: 2026-10-31
**Status**: Proposed

## Summary

Netlify Free now shows a "Powered by Netlify" badge that only a paid plan removes, and you want no host branding at $0 a month. The site moves to Cloudflare Pages (free static hosting that adds nothing to the page), side by side: it runs on Cloudflare's own address first, passes the live checks there, and only then does the domain switch. Until then, the security policy on Netlify is loosened slightly so the badge draws properly instead of leaving an invisible box that blocks taps. Your Google Workspace email records move to Cloudflare and are checked before the switch, and the privacy notice changes right after it.

## Requirements

**User stories**:
- As a visitor, I want a page with no host branding and nothing blocking taps.
- As Abed, I want free hosting that keeps preview links, headers in git, and deploy on merge, without breaking my Google Workspace email.

**Acceptance criteria**:
- **AC-1** (stopgap, on Netlify): `netlify.toml` `script-src` reads `'self' 'unsafe-inline' https://cloud.umami.is`, and no other directive changes. On the live site the badge draws fully, the console has no Content Security Policy error, and no `localStorage` or `sessionStorage` key appears after a visit. If another directive still blocks the badge, stop and return to `/architect` rather than loosen more.
- **AC-2**: A Cloudflare Pages project named `abedautomation` builds from GitHub: a push to `main` publishes production, and every pull request gets a preview URL. Both preview URL forms (the deploy hash URL and the branch alias) answer with `X-Robots-Tag: noindex`.
- **AC-3**: A Cloudflare production response for `/` carries the same five security headers as today (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `Content-Security-Policy`), with `script-src 'self' https://cloud.umami.is` (no `'unsafe-inline'`), and `/_astro/*` files carry `Cache-Control: public, max-age=31536000, immutable`. They come from `public/_headers`. Netlify never serves that file (its build deletes it).
- **AC-4**: The Umami tag renders only in production builds: a build with `CF_PAGES=1` and `CF_PAGES_BRANCH=main` (or, until Netlify is removed, `CONTEXT=production`) has exactly one Umami tag in `dist/index.html` and `dist/404.html`; any other build has none.
- **AC-5**: On Cloudflare, `/nope` and `/nope/` return status 404 with the site's own 404 page.
- **AC-6**: The HTML and headers served by Cloudflare (preview, `abedautomation.pages.dev`, and later the domain) contain only what the build produced: `pnpm check:live` (spec 0012, including its `/cdn-cgi/` and `Set-Cookie` rules) passes against each.
- **AC-7**: Before the nameservers change: DNSSEC is off at Namecheap; the Cloudflare zone holds every non web record that Namecheap's nameservers answer (at least MX, SPF TXT, Google site verification TXT, and any DMARC, DKIM, and CAA records) with the same values, all DNS only (not proxied); and querying the Cloudflare assigned nameservers directly returns those values. After the switch, a test email to and from `abed@abedautomation.com` arrives.
- **AC-8**: After the switch, `https://abedautomation.com` serves the Cloudflare build with a valid certificate; `http://` and `www` redirect with 301 to `https://abedautomation.com` (path and query kept); every README launch check passes.
- **AC-9**: Once the domain resolves to Cloudflare, within the hour, the *Visiting this site* paragraph names Cloudflare instead of Netlify with the approved wording in *Privacy wording* and a link to Cloudflare's privacy policy, and `privacy.updated` is that date. `pnpm check:copy` passes.
- **AC-10**: Seven days after the switch, the Netlify project is deleted, `netlify.toml` and `config/preview-headers` are removed, the production check reads only `CF_PAGES` and `CF_PAGES_BRANCH`, and `pnpm verify` exits clean.

## Decision

**Chosen option**: Option 1: Cloudflare Pages Free, DNS moved to Cloudflare, side by side cutover after a short `'unsafe-inline'` stopgap on Netlify.

**Gate before phase 2**: the Cloudflare dashboard must still offer a Pages project connected to GitHub with preview deployments, and the build must expose `CF_PAGES` and `CF_PAGES_BRANCH`. If new static sites are only offered as Workers (for example with `WORKERS_CI_BRANCH` instead), stop and return to `/architect`; the variables, preview behaviour, and ACs would change.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`) · `best-practices` (`addyosmani/web-quality-skills`, `.claude/skills/best-practices/`). No installed skill covers Cloudflare (see *Follow-up*).

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**: none. Configuration only.

**Pages project** (set once in the dashboard, recorded in `README.md`):

| Setting | Value |
|---|---|
| Project name | `abedautomation` (public as `abedautomation.pages.dev`) |
| Account sign in | an email address not on abedautomation.com, so the account stays recoverable if domain email breaks; two factor on |
| Source | GitHub `abed-fataftah/abed-automation-website`, this repository only; production branch `main`; previews for all pull requests |
| Framework preset | None |
| Root directory | blank (repo root) |
| Build command | `pnpm build` |
| Output directory | `dist` |
| Environment variables (production and preview) | `NODE_VERSION=24`, `SKIP_INSTALL_SIMPLE_GIT_HOOKS=1` |
| Install fallback | only if the first build log shows the wrong pnpm (not 12.x) or `sharp` fails: build command `corepack enable && pnpm install --frozen-lockfile && pnpm build` |
| Custom domain | `abedautomation.com` only |

**DNS zone** (Cloudflare, after import):

| Name | Record | Proxy | Note |
|---|---|---|---|
| `abedautomation.com` | created by the Pages custom domain (flattened CNAME to `abedautomation.pages.dev`) | Proxied | added once the zone is Active |
| `www` | `AAAA 100::` (placeholder) | Proxied | answered by the redirect rule; never a Pages custom domain |
| Mail and verification (MX, SPF, site verification, DMARC, DKIM, CAA, any others) | as on Namecheap | DNS only | copied record by record, same values |
| Imported Netlify records (apex `A`/`ALIAS`, `www` `CNAME` to `*.netlify.app`) and any Namecheap parking or URL redirect records | deleted | | they would compete with Pages |

**Zone settings** (each would otherwise add code, cookies, or rewrites):

| Setting | State |
|---|---|
| Email Address Obfuscation, Rocket Loader, Web Analytics automatic setup, Zaraz, Always Online, Speed Brain, Cloudflare Fonts, Hotlink Protection, Bot Fight Mode | Off |
| SSL/TLS mode | Full (strict) |
| Always Use HTTPS | On |
| Redirect Rule `www to apex` | `http.host eq "www.abedautomation.com"` → 301 to `concat("https://abedautomation.com", http.request.uri.path)`, query kept |
| HSTS | Off for now (see *Follow-up*) |

**Code surfaces**:

| Surface | Change | Phase |
|---|---|---|
| `netlify.toml` | `script-src` gains `'unsafe-inline'` (phase 1); all build commands become `pnpm build && rm -f dist/_headers` (phase 2); file deleted (phase 4) | 1, 2, 4 |
| `public/_headers` | New: `/*` and `/_astro/*` rules in Cloudflare `_headers` format, today's values with the strict CSP | 2 |
| `config/preview-headers` | Unchanged until deleted (Cloudflare previews get `noindex` from the platform) | 4 |
| `astro.config.mjs` | `env.schema` gains `CF_PAGES` and `CF_PAGES_BRANCH` (`envField.string`, server, public, optional); `CONTEXT` removed in phase 4 | 2, 4 |
| `src/layouts/Base.astro` | `countVisits = (CF_PAGES === '1' && CF_PAGES_BRANCH === 'main') \|\| CONTEXT === 'production'`; the `CONTEXT` part removed in phase 4 | 2, 4 |
| `src/content/site.ts` | *Visiting this site* host sentence and link, `privacy.updated` | 3 |
| `README.md` | Deploy and going live sections rewritten for Cloudflare (tables above, DNS move, rollback), and the result of the terms check | 2, 3 |

**Value sourcing**:

| Action | Value | Source |
|---|---|---|
| Production check | is this the production build | `CF_PAGES` is `1` and `CF_PAGES_BRANCH` is `main` (both set by Cloudflare Pages); during the overlap also Netlify's `CONTEXT` |
| Headers | header values | today's `netlify.toml` values, minus the stopgap `'unsafe-inline'` |
| Preview noindex | `X-Robots-Tag: noindex` | Cloudflare Pages default for preview deployments; the same `_headers` serves previews and adds nothing |
| 404 status | 404 with the site's page | Cloudflare Pages default when `404.html` sits at the output root and no `_redirects` exists |
| Build runtime | Node and pnpm | `NODE_VERSION=24` (matches `.nvmrc`); pnpm from `packageManager`, checked in the first build log |
| DNS records to copy | every non web record | answers from Namecheap's own nameservers (`dig <type> <name> @dns1.registrar-servers.com` for MX, TXT on the apex, `_dmarc`, `google._domainkey`, CAA), compared one by one with the Cloudflare zone |
| Redirect target | canonical origin | `site` in `astro.config.mjs` (`https://abedautomation.com`) |
| Privacy notice | host name and policy link | Cloudflare's privacy policy URL, confirmed by Abed in phase 3 |
| Commercial use | allowed or not | Cloudflare's Self Serve Subscription Agreement and the Pages terms it links, read by Abed; result written in `README.md` |
| Pre switch live check | base URL | `LIVE_URL=https://abedautomation.pages.dev` (spec 0012 override) |

**Privacy wording** (draft for Abed's approval; replaces the Netlify sentence and link at the end of *Visiting this site*):

> `… Apart from Umami, the site loads nothing from other companies while you read it. It is hosted by Cloudflare, which processes technical details of each visit, such as your IP address, browser, and the page you open, to deliver the site and keep it secure. See `
> `{ text: 'Cloudflare’s privacy policy', href: <URL confirmed in phase 3> }` `'.'`

**Key invariants**:
- The production CSP on Cloudflare never contains `'unsafe-inline'` in `script-src`; the stopgap exists only on Netlify, and only in `script-src`.
- No Cloudflare feature may add a script, a cookie, or an HTML rewrite; the daily live check (spec 0012) is the guard.
- Mail records are DNS only and in the Cloudflare zone, confirmed against Cloudflare's nameservers, before the nameservers change.
- From the switch until the end of the rollback window, no DNS record changes at Namecheap or in Cloudflare (so a rollback lands on the same records).
- The notice names the host serving the domain, except for the short, accepted window while nameservers spread (see *Migration plan*).

**Security model**: public static site, no secrets in the repo. The Cloudflare and Namecheap accounts hold the only control; two factor sign in on both, and the Cloudflare sign in email is not on this domain. The Cloudflare GitHub app gets access to this one repository only.

**Configuration required**: no repo secrets. Dashboard only: the Pages project, zone, and DNS tables above.

**Critical test scenarios**:
- Stopgap: after merging the CSP change, the live badge draws and the console is clean, verifies **AC-1**
- Side by side: a pull request preview (both URL forms `noindex`, no Umami tag) and `abedautomation.pages.dev` (headers, Umami tag, `/nope` and `/nope/` 404, `LIVE_URL=https://abedautomation.pages.dev pnpm check:live` passes), verifies **AC-2** to **AC-6**
- Email before the switch: each record queried at Cloudflare's assigned nameservers matches Namecheap's; after the switch, test mail both ways, verifies **AC-7**
- Cutover: `curl` the apex, `http://`, and `www` with a path and query; run the README launch checks, verifies **AC-8**, **AC-9**
- Teardown: `pnpm verify` clean with no Netlify files; a build without `CF_PAGES=1` and `CF_PAGES_BRANCH=main` has no Umami tag, verifies **AC-4**, **AC-10**

## Build plan

Skateboard, in four phases; each leaves a working live site.

1. Stopgap: add `'unsafe-inline'` to `script-src` in `netlify.toml` (nothing else), merge, check the live badge, console, and storage. Satisfies **AC-1**
2. Side by side: Abed reads Cloudflare's terms (stop if a commercial site is not allowed) and confirms the *Gate before phase 2*. Add `public/_headers`, the Netlify `rm -f dist/_headers` build commands, the `CF_PAGES` and `CF_PAGES_BRANCH` env fields and the production check; `pnpm verify`; merge (Netlify keeps serving unchanged). Abed creates the Pages project with the settings above; check the first build log (Node 24, pnpm 12, `sharp`), a pull request preview, and `abedautomation.pages.dev`. Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-6**
3. Switch (Abed, one sitting, then the merge): a day ahead, lower the TTL of the Namecheap records to the minimum and confirm DNSSEC is off. Add the domain to Cloudflare, build the DNS zone from the table, compare every record against Namecheap's nameservers and then against Cloudflare's assigned nameservers, set the zone settings and redirect rule, and approve the privacy wording. Change the nameservers at Namecheap; when the zone shows Active, add `abedautomation.com` as the Pages custom domain. Once the domain resolves to Cloudflare, merge the privacy change within the hour. Test email, run the launch checks. Satisfies **AC-7**, **AC-8**, **AC-9**
4. Teardown (7 days after the switch, if no rollback was needed): remove `netlify.toml`, `config/preview-headers`, and `CONTEXT`; `pnpm verify`; merge; delete the Netlify project and uninstall Netlify's GitHub app. Satisfies **AC-4**, **AC-10**

## Migration plan

**Strategy**: side by side (strangler style): the new host runs on its own address until proven, then the domain moves.
**Phases**: the four Build plan phases.
**Accepted window**: between the nameserver change and full propagation (up to 48 hours), some visitors still reach Netlify, which serves the same site and, after the privacy merge, a notice naming Cloudflare. The content is identical and both hosts process the same technical details; accepted as short and benign.
**Rollback**: before phase 3, nothing to roll back (the domain still points at Netlify). During the 7 days after the switch, set the Namecheap nameservers back to `dns1.registrar-servers.com` and `dns2.registrar-servers.com` (the old records stay there, untouched, and no record changes are made meanwhile) and revert the privacy commit; Netlify still serves `main` with the stopgap CSP and keeps its custom domain configured. Expect up to 48 hours for the rollback to spread as well.
**Risks**: an email record missed or proxied (mitigated by AC-7 before the switch); a record left pointing at Netlify (the DNS table deletes them); a zone feature left on (AC-6 and the daily check); Cloudflare no longer offering Pages (the gate before phase 2).

## Consequences

**Positive**:
- No host branding and no invisible overlay, still at $0; previews, headers in git, and deploy on merge all stay.
- Cloudflare's free CDN and DNS include free HTTPS.

**Negative / tradeoffs**:
- For a few days the live site shows the Netlify badge and runs with `'unsafe-inline'` (low risk: no user input on the page).
- DNS moves to Cloudflare, so Cloudflare controls both hosting and DNS; email depends on its zone being right.
- Cloudflare markets Free for projects that "aren't business critical"; if its terms ever exclude this site, the next option is Firebase Hosting (360 MB a day cap).
- Cloudflare is steering new static sites toward Workers; Pages may freeze or change, which would bring this decision back.
- The production site is also reachable at `abedautomation.pages.dev`; the canonical link points search engines at the domain.
- Netlify keeps building `main` for the 7 day window, a second public copy until teardown.

**Neutral**:
- The rest of spec 0001 (Astro, Tailwind, motion, copy in `site.ts`) is unchanged.
- Spec 0012's daily check now guards Cloudflare and gains `/cdn-cgi/` and `Set-Cookie` rules.

## Follow-up

- [ ] `/sync`: spec 0001 hosting row and root `AGENTS.md` (*Stack: Hosting*, the `netlify-*` skills) should name Cloudflare Pages and point here; spec 0010 AC-1 should read the production check from this spec.
- [ ] No Cloudflare agent skill is installed; consider finding one for Pages and `_headers` before phase 2.
- [ ] After a stable week on Cloudflare, decide on HSTS (zone setting or a `Strict-Transport-Security` header).
- [ ] Abed: two factor sign in on Cloudflare and Namecheap.
