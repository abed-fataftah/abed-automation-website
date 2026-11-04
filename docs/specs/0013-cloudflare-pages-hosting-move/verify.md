# Verify: move hosting to Cloudflare Pages · spec 0013 · updated 2026-11-04

## Accepted exceptions (2026-11-04)

Abed accepted these as documented exceptions when marking the feature done. The evidence below was never observed and is not claimed as passed; the unticked steps stay unticked.

- **Netlify stopgap (AC-1, and the two Netlify phase steps):** not observed. Netlify was deleted on 2026-11-04 (AC-10), so it can no longer be checked.
- **Pre switch Namecheap DNS comparison (AC-7):** not observed. Namecheap's nameservers no longer answer for the domain. Current evidence: no DS record, Cloudflare nameservers answer every mail record, email both ways works.
- **First build log review (AC-2):** not observed. Current evidence is the latest successful production build log (`c330984`, reported by Abed): Node 24.22.1, pnpm 12.16.1, `sharp` 0.35.5, deploy succeeded.

_Steps derived from spec 0013 acceptance criteria and its Value sourcing table. Steps marked **live** need the named host online._

## Commands

- [x] `CF_PAGES=1 CF_PAGES_BRANCH=main pnpm build` → one Umami tag in `dist/index.html` and `dist/404.html`; `CF_PAGES=1 CF_PAGES_BRANCH=feat/x pnpm build` and plain `pnpm build` → none → AC-4
- [ ] `netlify.toml`: only `script-src` differs from before phase 1; every build command ends with `rm -f dist/_headers` → AC-1, AC-3 · **Not observed.** Not applicable after teardown: `netlify.toml` was removed on 2026-11-04 (AC-10).
- [x] `pnpm verify` → clean (after phase 2 and again after teardown) → AC-10
- [x] After teardown: no `netlify.toml`, no `config/preview-headers`; `grep -r CONTEXT src astro.config.mjs` → no match → AC-10

## UI / manual

- [ ] **live (Netlify, phase 1)**: badge draws, console has no CSP error, Application panel shows no storage keys → AC-1 · **Not observed.** The stopgap ran before this record; the Netlify project was deleted on 2026-11-04, so it can no longer be checked.
- [ ] **live (Netlify, phase 2)**: `curl -sI https://abedautomation.com/` still shows the `netlify.toml` CSP with `'unsafe-inline'` (no `_headers` applied) → AC-3 · **Not observed.** The domain moved to Cloudflare on 2026-11-03 and Netlify was deleted on 2026-11-04, so it can no longer be checked.
- [x] **live (preview)**: `curl -sI` on the deploy hash URL and on the branch alias both show `x-robots-tag: noindex`; the HTML has no Umami tag → AC-2, AC-4
- [ ] **live (pages.dev)**: first build log shows Node 24 and pnpm 12 and `sharp` installed; `curl -sI https://abedautomation.pages.dev/` shows the five headers with a CSP without `'unsafe-inline'`; an `/_astro/` file has the immutable cache header; `/nope` and `/nope/` return 404 with the site's page → AC-2, AC-3, AC-5 · **First build log not read.** Observed 2026-11-04: headers, cache header, and 404s on `abedautomation.pages.dev`. Reported by Abed from the latest production build log (`c330984`, not the first): Node 24.22.1, pnpm 12.16.1, `sharp` 0.35.5, deploy succeeded.
- [x] **live (pages.dev)**: `LIVE_URL=https://abedautomation.pages.dev pnpm check:live` passes → AC-6
- [ ] **live**: DNSSEC off at Namecheap; for each record, `dig <type> <name> @dns1.registrar-servers.com` and `dig <type> <name> @<cloudflare assigned ns>` agree; mail records show DNS only → AC-7 · **Pre switch comparison not observed** (Namecheap nameservers no longer answer). Observed 2026-11-04: no DS record (DNSSEC off); Cloudflare nameservers answer MX, SPF, Google verification, and DKIM; no DMARC or CAA record exists. Email both ways works (Abed).
- [x] **live**: after the switch, a test email both ways arrives → AC-7 (sent and replied by Abed, reported 2026-11-04)
- [x] **live**: `curl -sI http://abedautomation.com/` and `https://www.abedautomation.com/x?y=1` → 301 to `https://abedautomation.com/` and `/x?y=1`; certificate valid; README launch checks pass → AC-8 (2026-11-04; Lighthouse and Umami dashboard launch checks reported by Abed)
- [x] **live**: *Visiting this site* names Cloudflare with a working policy link; *Last updated* is the switch date → AC-9

## Value sourcing

- [x] Production detection reads `CF_PAGES` and `CF_PAGES_BRANCH`, not a dashboard variable → AC-4
- [x] `public/_headers` values match `netlify.toml` minus the stopgap → AC-3
- [x] README records the Cloudflare terms check result → AC-2
