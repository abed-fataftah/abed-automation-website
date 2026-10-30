# Verify: GSAP motion · spec 0008 · 2026-10-30
_Steps derived from spec 0008 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones. Run against `pnpm build && pnpm preview`, not the dev server, so the real chunks load._

## UI / manual
- [ ] JavaScript off, open `/` at 1280 → identical to the Release 1 page: every section line full width, hero underline drawn, nothing transparent; hover a nav link → color changes instantly → AC-1
- [ ] DevTools rendering: emulate `prefers-reduced-motion: reduce`, reload `/` → no `gsap` chunk in the network panel, no inline `opacity` or `transform` on any element, hovers instant → AC-1, AC-12
- [ ] Network panel on `/404` (motion allowed) → no `gsap` chunk requested → AC-2
- [ ] Fresh load `/` at 1280, wait for idle, scroll slowly to the bottom → Tools (if below the fold), Services, About, final CTA, Privacy each fade up once over about half a second; scroll up and down again → nothing replays → AC-3
- [ ] Same at 390 → shorter drift (12px) and tighter stagger → AC-3, AC-5
- [ ] Services → left column then right column; About → title, each paragraph, then the photo → AC-5
- [ ] At 390, scroll slowly through About → the photo, far below the text, fades in only as it reaches the screen, not while off screen → AC-5
- [ ] After every reveal has played, inspect the revealed elements → no inline `opacity`, `transform`, or `--line-scale` left → AC-3, AC-6
- [ ] Each section's top line grows from the left as the section arrives; the vertical Services divider, the header line, and the footer line never move → AC-6
- [ ] DevTools rendering: emulate `forced-colors: active` → every section line and the hero underline still visible, with and without motion → AC-6, AC-7
- [ ] Hero underline at 390 and 1280: compare a screenshot against the Release 1 page → stroke 3px coral, within 2px of the old position; at 320 the emphasis wraps and both line pieces are underlined → AC-7
- [ ] Scroll until the hero is gone, scroll back to the top → the underline redraws left to right; repeat twice → it redraws every time and is never seen disappearing → AC-7
- [ ] Open `/#about` directly at 1280 → About is never seen fading or moving; sections below still reveal on scroll; scroll back to the top → the hero underline draws in → AC-4, AC-7
- [ ] Resize the window across 640px mid page → nothing already passed fades again; sections below still reveal → AC-4
- [ ] Load `/` at 1280 without scrolling → the hero and anything visible never move or blink when motion starts → AC-4
- [ ] Before scrolling, press Tab repeatedly through the page to the final CTA button → each focused link is fully visible with the coral focus ring the moment focus lands → AC-9
- [ ] Accessibility tree and Tab order with motion on match those with JavaScript off (same elements, same order, nothing `aria-hidden` added) → AC-9
- [ ] Print preview before scrolling → every section fully visible, lines and underline drawn → AC-10
- [ ] DevTools rendering: emulate CSS media type `print` without printing (no `beforeprint`) → still fully visible, through the `@media print` rule → AC-10
- [ ] Mid scroll, toggle reduced motion on in DevTools → everything snaps to its static state at once; toggle it off → motion does not restart → AC-11
- [ ] Temporarily add `throw new Error('test')` after the first starting state is set in `gsap.ts`, rebuild, load `/` → console shows one warning, nothing on the page is transparent or offset; then revert → AC-11
- [ ] Hover and press each link type (primary button, 404 secondary button, nav, footer, inline privacy link) → a soft 150ms color fade; Tab to them → the focus ring appears instantly → AC-12
- [ ] Lighthouse (mobile) on `/` → CLS 0; at 320 no sideways scroll at any point while scrolling → AC-8
- [ ] Performance panel while scrolling → no Layout events tied to motion; only the underline's short repaint shows as paint → AC-8

## Commands
- [ ] `grep -rn "from 'gsap" src` → matches only in `src/motion/gsap.ts` → AC-2
- [ ] Temporarily add `import 'gsap';` to `src/motion/loader.ts`, run `pnpm build && pnpm check:bundle` → fails naming the entry chunk; remove it → passes → AC-2
- [ ] `grep -n "No transitions until feature 13" src/styles/global.css` → no match → AC-13
- [ ] `grep -n -i "motion" design.md` → a Motion section listing 0.5s, 0.6s, `power2.out`, 16px and 12px, 0.08s and 0.05s, `top 85%`, 150ms `ease-out`, the four `data-` hooks, and the rules → AC-13
- [ ] `grep -n "data-reveal\|data-line\|data-underline" docs/design/pages/home.md` → the hooks are named per section → AC-13
- [ ] `pnpm verify` → exit 0 → AC-13

## Value sourcing
- [ ] Changing `MOTION.duration` in `gsap.ts` changes every reveal's length and nothing else
- [ ] Changing `MOTION.distance.small` changes only the drift below 640px
- [ ] Removing `data-reveal` from one section stops only that section's reveal; the page still renders identically
- [ ] Line and underline colors come only from `--color-line` and `--color-accent`; `pnpm check:design` passes

## Acceptance-criteria coverage
- AC-1: UI steps 1, 2 · AC-2: UI step 3, command steps 1, 2 · AC-3: UI steps 4, 5, 8 · AC-4: UI steps 13, 14, 15 · AC-5: UI steps 5, 6, 7 · AC-6: UI steps 8, 9, 10 · AC-7: UI steps 10, 11, 12, 13 · AC-8: UI steps 23, 24 · AC-9: UI steps 16, 17 · AC-10: UI steps 18, 19 · AC-11: UI steps 20, 21 · AC-12: UI steps 2, 22 · AC-13: command steps 3, 4, 5, 6

## Build notes · /develop · 2026-10-30
_Findings from the build. Each step was checked once in headless Chrome against the production build; `/check verify` can rerun them._
- [ ] Hero underline position: before the change the coral stroke sat on screenshot rows 253 to 255 at 390px and 220 to 222 at 1280px (at 320px the emphasis wraps: rows 253 to 255 and 288 to 290). With `hero-underline` and `padding-bottom: 0` it sits 1px off at each width (252 to 254, 221 to 223, 252 and 287), which is inside the 2px limit → AC-7
- [ ] Forced colors (DevTools rendering, `forced-colors: active`): the `<u>` shows a real 3px underline with no background image, and all five `data-line` sections show a visible 1px top border → AC-6, AC-7
- [ ] At 1280, scroll to about 700px, wait for the reveals, then resize to 390: nothing on screen or above it has an inline `opacity` or `transform`, and scrolling down still reveals the rest → AC-4
- [ ] Turn on reduced motion 150ms into a reveal: every hook loses its inline style at once and stays static after 800ms (in flight tweens are reverted too) → AC-11
- [ ] Temporarily add `throw new Error()` right after `items.forEach(hide)` in `setup()`, then build: at 1280 and 390 no hook is left with an inline style, and the console shows one "Motion could not load" warning. Remove the throw → AC-11
- [ ] A `layout-shift` PerformanceObserver records 0 while scrolling top to bottom and back with motion on → AC-8
- [ ] `dist/_astro/gsap.*.js` is about 45KB gzipped (44.9KB at the build) and is requested only on `/`, never on `/404` or with reduced motion on → AC-2, AC-1
