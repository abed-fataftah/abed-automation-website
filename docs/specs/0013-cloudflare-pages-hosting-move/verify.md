# Verify: move hosting to Cloudflare Pages · spec 0013 · updated 2026-10-31

_Steps derived from spec 0013 acceptance criteria and its Value sourcing table. Steps marked **live** need the named host online._

## Commands

- [ ] `CF_PAGES=1 CF_PAGES_BRANCH=main pnpm build` → one Umami tag in `dist/index.html` and `dist/404.html`; `CF_PAGES=1 CF_PAGES_BRANCH=feat/x pnpm build` and plain `pnpm build` → none → AC-4
- [ ] `netlify.toml`: only `script-src` differs from before phase 1; every build command ends with `rm -f dist/_headers` → AC-1, AC-3
- [ ] `pnpm verify` → clean (after phase 2 and again after teardown) → AC-10
- [ ] After teardown: no `netlify.toml`, no `config/preview-headers`; `grep -r CONTEXT src astro.config.mjs` → no match → AC-10

## UI / manual

- [ ] **live (Netlify, phase 1)**: badge draws, console has no CSP error, Application panel shows no storage keys → AC-1
- [ ] **live (Netlify, phase 2)**: `curl -sI https://abedautomation.com/` still shows the `netlify.toml` CSP with `'unsafe-inline'` (no `_headers` applied) → AC-3
- [ ] **live (preview)**: `curl -sI` on the deploy hash URL and on the branch alias both show `x-robots-tag: noindex`; the HTML has no Umami tag → AC-2, AC-4
- [ ] **live (pages.dev)**: first build log shows Node 24 and pnpm 12 and `sharp` installed; `curl -sI https://abedautomation.pages.dev/` shows the five headers with a CSP without `'unsafe-inline'`; an `/_astro/` file has the immutable cache header; `/nope` and `/nope/` return 404 with the site's page → AC-2, AC-3, AC-5
- [ ] **live (pages.dev)**: `LIVE_URL=https://abedautomation.pages.dev pnpm check:live` passes → AC-6
- [ ] **live**: DNSSEC off at Namecheap; for each record, `dig <type> <name> @dns1.registrar-servers.com` and `dig <type> <name> @<cloudflare assigned ns>` agree; mail records show DNS only → AC-7
- [ ] **live**: after the switch, a test email both ways arrives → AC-7
- [ ] **live**: `curl -sI http://abedautomation.com/` and `https://www.abedautomation.com/x?y=1` → 301 to `https://abedautomation.com/` and `/x?y=1`; certificate valid; README launch checks pass → AC-8
- [ ] **live**: *Visiting this site* names Cloudflare with a working policy link; *Last updated* is the switch date → AC-9

## Value sourcing

- [ ] Production detection reads `CF_PAGES` and `CF_PAGES_BRANCH`, not a dashboard variable → AC-4
- [ ] `public/_headers` values match `netlify.toml` minus the stopgap → AC-3
- [ ] README records the Cloudflare terms check result → AC-2
