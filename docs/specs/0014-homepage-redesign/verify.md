# Verify: Homepage redesign · spec 0014 · 2026-11-05
_Steps derived from spec 0014 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] `pnpm build && pnpm preview`, open `/` at 1280 → header, hero, Services, How it works, About, final CTA, footer in that order (Work absent while `site.work.items` is empty); compare with the board and `pages/home.md` *Layout* → AC-1
- [ ] Repeat at 320, 390, 768 → no sideways scroll (`document.documentElement.scrollWidth <= innerWidth`), nothing clipped, columns per `design.md` §4 → AC-1, AC-14
- [ ] Header at 390 → logo and "Book a call" on row 1, nav wrapping on row 2; at 1280 → one row; on `/privacy` and `/nope` the nav links point to `/#…` → AC-3
- [ ] JavaScript off → still portrait with alt `Portrait of Abed Fataftah drawn in dots`; every link and button works; no `<canvas>` in the DOM → AC-4
- [ ] JavaScript on, 1280, mouse → after load the canvas fades in over about 300ms; inspect → canvas `role="img"` with the alt text as its label, image `aria-hidden="true"` → AC-5
- [ ] Move the mouse left, right, up, down → eyes then head follow; move out of the window → looks straight ahead; hold still → Performance panel shows no running frame loop; scroll the hero off screen → no frames → AC-6
- [ ] Phone (real device or touch emulation) at 390 → portrait loads; tap the page → it looks at the tap, then straight ahead after about 1.6s → AC-5, AC-6
- [ ] Tab through the page → skip link, logo, nav links, "Book a call" (eyes look at it), "Book a Free Call" (eyes look at it), content links, footer links; every item shows the coral ring → AC-6, AC-21
- [ ] Emulate `prefers-reduced-motion: reduce`, reload → no portrait chunk in the Network panel, still image, underline already full width, nav click jumps without smooth scroll → AC-7, AC-19
- [ ] With motion on, switch reduced motion on mid visit → tracking stops, canvas removed, image no longer `aria-hidden` → AC-7
- [ ] DevTools network request blocking on the portrait chunk, reload → still image stays, one `console.warn`, rest of the page normal → AC-8
- [ ] Emulate Save Data or `2g` (Chromium) → no portrait chunk requested → AC-5
- [ ] Click each booking button (header, hero, final CTA, 404 body) with the Umami tracker allowed → Cal.com opens in the same tab; Umami shows `book-call` with `header`, `hero`, `final`, `not-found` → AC-11
- [ ] Services → two cards, same structure and size, Websites and web apps first → AC-13
- [ ] About → `abed-about.jpg` at max 300px wide, 4:5, exact alt; two paragraphs; three fact chips; `Tools I work with: n8n, OpenAI, …, PostgreSQL`; profile links only for entries present → AC-15
- [ ] Final CTA → heading, body, large button, `No cookies. Calls are never recorded.`, `Prefer email?` with a mailto link → AC-16
- [ ] Scroll the whole page with motion on → every section line finishes drawing, reveals play once, underline replay unchanged → AC-19
- [ ] `/privacy` → h1 Privacy, six h2 sections with unchanged text, Last updated date, Back to home → `/`; footer Privacy → `/privacy` from `/`, `/privacy`, `/nope`; `/` has no `#privacy` → AC-17
- [ ] `/nope` → new tokens, booking button and home link in one row at 1280, wrapped at 390, no portrait → AC-18
- [ ] Lighthouse accessibility on `/`, `/privacy`, `/nope` → no errors; heading outline has one h1 per page → AC-21

## Commands
- [ ] `pnpm verify` → exit 0 → AC-22
- [ ] `pnpm check:copy` after temporarily writing `30 minute` into `home.intro` → exit 1 naming the path; revert → AC-2
- [ ] `pnpm check:design` → passes with the `surface` and accent as text pairs listed → AC-20
- [ ] `pnpm build && pnpm check:seo` → `dist/privacy.html` checked, canonical `https://abedautomation.com/privacy` (no slash), sitemap lists `/` and `/privacy` only, JSON-LD only in `dist/index.html` → AC-17
- [ ] Print preview of `/` with the portrait live → the still image prints, no canvas → AC-4
- [ ] Temporarily import `./portrait` statically in `loader.ts`, `pnpm build && pnpm check:bundle` → exit 1 naming the portrait; revert → AC-9
- [ ] `pnpm check:bundle` output names the measured portrait closure size under its budget → AC-9
- [ ] `grep -rn "three\|HeroScene\|graph\b" package.json src scripts` → no matches; `pnpm-lock.yaml` has no `three` → AC-10
- [ ] Temporarily add one complete Work item (and its image in `src/assets/work/`), build → `#work` with one full row card, Work nav link, "See my work"; add an item with a missing image file → build fails naming it; revert both → AC-12

## Value sourcing
- [ ] Changing `site.bookingUrl` changes all four booking buttons and nothing else holds the URL
- [ ] Changing `home.portraitAlt` changes both the image alt and the canvas label
- [ ] Emptying `about.profiles` removes the profile line; one entry renders one link
- [ ] Changing `site.tools.items` changes the About tools line
- [ ] `portrait.ts` contains no hex color; colors come from `--color-fg`, `--color-portrait-sclera`, `--color-bg`

## Acceptance-criteria coverage
- AC-1: UI 1, 2 · AC-2: Commands 2 · AC-3: UI 3 · AC-4: UI 4 · AC-5: UI 5, 7, 12 · AC-6: UI 6, 7, 8 · AC-7: UI 9, 10 · AC-8: UI 11 · AC-9: Commands 5, 6 · AC-10: Commands 7 · AC-11: UI 13 · AC-12: Commands 8 · AC-13: UI 14 · AC-14: UI 2 · AC-15: UI 15 · AC-16: UI 16 · AC-17: UI 18, Commands 4 · AC-18: UI 19 · AC-19: UI 9, 17 · AC-20: Commands 3 · AC-21: UI 8, 20 · AC-22: Commands 1
