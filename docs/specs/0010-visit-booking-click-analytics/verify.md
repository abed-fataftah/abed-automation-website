# Verify: visit & booking click analytics · spec 0010 · updated 2026-10-30

_Steps derived from spec 0010 acceptance criteria and its Value sourcing table. `/check verify` runs these; `/test` locks the durable ones. Steps marked **live** need abedautomation.com online (feature 16)._

## Commands

- [ ] `pnpm build`, then search `dist/` for `cloud.umami.is` → no match; `dist/index.html` has `data-umami-event="book-call"` with `data-umami-event-location="hero"` and `"final"` → AC-1, AC-4
- [ ] `CONTEXT=production pnpm build` → exactly one `<script defer src="https://cloud.umami.is/script.js" data-website-id="15d2c8d1-91bd-4e51-8897-f7ec3bb4fa6c" data-domains="abedautomation.com">` in `dist/index.html` and in `dist/404.html`; then rebuild with `pnpm build` → AC-1
- [ ] Temporarily change one `<BookCta location="hero" />` to `<BookCta />` → `pnpm check` fails on `index.astro`; restore → AC-5
- [ ] Temporarily set `analytics.websiteId` to `abc`, then `scriptUrl` to `http://cloud.umami.is/script.js`, then `domain` to `www.abedautomation.com` → `pnpm check:copy` (and `pnpm build`) fails each time naming the field; restore → AC-8
- [ ] `pnpm verify` → exits clean → AC-9, AC-10

## UI / manual

- [ ] Open `/#privacy` → the *Visiting this site* paragraph matches the spec's *Privacy wording*, both links (Umami, Netlify) open their policies in the same tab, and *Last updated* shows the ship date → AC-9
- [ ] With JavaScript off, click each "Book a Free Call" → Cal.com opens in the same tab, Back returns → AC-2
- [ ] **live**: block `*.umami.is` in DevTools and reload → page looks and behaves the same, both booking buttons still open Cal.com → AC-2
- [ ] **live**: open `/` → the Network panel shows the Umami script and one page view request; the Umami dashboard shows path `/` within a few minutes → AC-3
- [ ] **live**: open a missing path such as `/nope` → the dashboard shows `/nope` → AC-3
- [ ] **live**: with "Preserve log" on, click the hero button → one `book-call` event request with `location` `hero` completes before Cal.com loads, Cal.com opens in the same tab, Back returns; repeat with the final CTA (`final`) → the dashboard shows `book-call` split by `location`. If the event is cancelled, apply the fallback module in the spec's *Feature design* → AC-4
- [ ] **live**: after a visit and a click, DevTools Application shows no cookies and no `localStorage` or `sessionStorage` keys for abedautomation.com → AC-6
- [ ] **live**: on first load of `/`, every request is to abedautomation.com or a host under `umami.is` → AC-7
- [ ] **live**: open the site at its `netlify.app` address → no page view reaches the dashboard (`data-domains` guard) → AC-1

## Value sourcing

- [ ] Script URL and website ID in the production tag equal the tracking code in Umami's website settings → AC-1, AC-8
- [ ] The tag renders only when Netlify's `CONTEXT` is `production` (read through `astro:env`): a deploy preview's HTML has no Umami script tag → AC-1
- [ ] Umami's website settings show the EU region, matching the notice → AC-9

## Acceptance criteria coverage

- AC-1: commands 1 and 2, the `netlify.app` step, value sourcing 1 and 2 · AC-2: JavaScript off, blocked host · AC-3: page view, missing path · AC-4: command 1, click events · AC-5: command 3 · AC-6: no storage · AC-7: requests · AC-8: command 4, value sourcing 1 · AC-9: privacy paragraph, region, command 5 · AC-10: command 5
