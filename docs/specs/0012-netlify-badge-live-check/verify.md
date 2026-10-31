# Verify: daily live check for host injected scripts · spec 0012 · updated 2026-10-31

_Steps derived from spec 0012 acceptance criteria and its Value sourcing table. `/check verify` runs these; `/test` locks the durable ones. Steps marked **live** need abedautomation.com online._

## Commands

- [ ] `CF_PAGES=1 CF_PAGES_BRANCH=main pnpm build`, then `pnpm check:live` → exits 0 → AC-4
- [ ] Serve a copy of `dist/` locally with a `mailto:` link changed to `/cdn-cgi/l/email-protection` and a `Set-Cookie` header, point `LIVE_URL` at it → exits 1 naming both → AC-4
- [ ] `LIVE_URL=https://localhost:9 pnpm check:live` → retries once after 30 s, then prints `could not reach` and exits 1 → AC-5
- [ ] On a branch, change any `<script>` (for example add one to `Base.astro`), `CF_PAGES=1 CF_PAGES_BRANCH=main pnpm build`, `pnpm check:live` → exits 1 listing it under `live differs from main`; revert and rebuild → AC-4
- [ ] The Cloudflare headers file (spec 0013) `script-src` → no `'unsafe-inline'` → AC-2
- [ ] `pnpm verify` → exits clean and does not run `check:live` → AC-6

## UI / manual

- [ ] **live**: `curl -s https://abedautomation.com/ | grep -E "/.netlify/scripts/|<iframe"` → no match; same for `/nope` → AC-1
- [ ] **live**: at 390px, scroll a "Book a Free Call" button into the bottom right corner and tap its right half → Cal.com opens → AC-1
- [ ] **live**: DevTools console on `/` shows no Content Security Policy error; Application panel shows no `localStorage` or `sessionStorage` key → AC-2, AC-3
- [ ] **live**: GitHub Actions, *Live check*, *Run workflow* → passes; the workflow file has a daily `schedule`, `workflow_dispatch`, and `permissions: contents: read` → AC-6
- [ ] **live**: before the Netlify project is deleted, `LIVE_URL=https://stunning-malasada-b87ced.netlify.app pnpm check:live` → fails listing `script src=/.netlify/scripts/hud?variant=public` under `injected by host` → AC-4
- [ ] README has the live check note → AC-7

## Value sourcing

- [ ] The base URL comes from `site` in `astro.config.mjs`, not a second copy of the domain in the script → AC-4
- [ ] Expected fingerprints come from `dist/` of a `CF_PAGES=1 CF_PAGES_BRANCH=main` build of the checked out commit, not a hard coded list → AC-4
