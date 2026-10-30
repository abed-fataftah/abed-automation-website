# Verify: Design system & UI foundation · spec 0003 · updated 2026-10-29
_Steps derived from spec 0003 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [x] Open `/` at 390px, press Tab once → "Skip to content" shows at top 8px, left 16px, about 50px tall, `fg` fill with `bg` text, coral ring → AC-3, AC-4
- [x] Press Enter on the skip link → focus moves to `<main id="main">`, no ring on `main` → AC-3
- [x] Press Tab again → "Book a Free Call" gets a 2px coral ring with a 3px gap; click it with the mouse → no ring → AC-4
- [x] Hover the book button on a desktop → fill changes to `accent-hover` instantly; hold the mouse down → `accent-pressed` → AC-5
- [x] Open `/` and a bad URL (for example `/nope`) at 320, 390, 768, 1280px → `document.documentElement.scrollWidth <= clientWidth` on each; button full width below 640px, label width from 640px; content inside a 1120px container with 16px (below 640px) or 24px side padding → AC-8, AC-9
- [x] Home shows brand row (logo, name, 1px line under it), "Hi, I’m Abed.", the h1 from the handoff, the intro, and the button; no coral underline yet → AC-8
- [x] 404 shows the brand row, a "404" line (not a heading), "This page doesn’t exist.", the body sentence, and the outlined "Back to the home page" button to `/`; its border turns coral on hover → AC-6, AC-8
- [x] View the 404 source → `<meta name="robots" content="noindex">` is present; the home page has none → AC-8
- [x] Logo is 34px high, A and D in `fg`, brackets in coral, `aria-hidden="true"` on the svg → AC-7
- [x] Turn on reduced motion, click an in page anchor (add a temporary one) → it jumps with no smooth scroll and lands 16px below the top → AC-10
- [x] Disable JavaScript → both pages show all text and the book button opens the booking URL → AC-11
- [x] Network panel on first load → every request goes to the site's own origin; the font is one woff2 under `/_astro/fonts/`; `document.cookie` is empty → AC-2, AC-11
- [x] DevTools: body `font-family` resolves to Schibsted Grotesk; `document.fonts.check('700 16px "Schibsted Grotesk"')` is true → AC-2
- [x] Add a temporary `class="bg-red-500"` to an element → no red appears → AC-1

## Value sourcing
- [x] Change `site.a11y.skipLink` in `src/content/site.ts` → the skip link label changes → AC-3
- [x] Change `site.name`, `site.home.eyebrow`, `.heading`, `.intro` → the brand row and hero change to match → AC-8
- [x] Change `site.cta.bookLabel` and `site.bookingUrl` (to another https URL) → the button label and link change → AC-5
- [x] Change `site.notFound.title`, `.code`, `.heading`, `.body`, `.homeLabel` → the 404 tab title and text change → AC-8
- [x] Change `--color-accent` in `global.css` → the button fill, focus ring, and logo brackets all follow → AC-1, AC-7

## Commands
- [x] `pnpm check:design` → passes, "8 color pairs meet their targets" → AC-12
- [x] Set `--color-muted: #6A645B` in `global.css`, run `pnpm check:design` → fails naming `muted on bg`; revert → AC-12
- [x] Add `class="text-[#fff]"` to a component → fails naming the file and line; revert → AC-12
- [x] Add `href="#about"` and `href="#add"` to a component → still passes; revert → AC-12
- [x] `pnpm build`, then `ls dist/_astro/fonts` → one woff2 file, preloaded in `dist/index.html` → AC-2
- [x] Confirm `design-handoff/` is gone and `design.md` sits at the repo root with `docs/design/` holding the handoff notes, page briefs, prototype, and original logo → AC-13
- [x] `pnpm verify` → exits 0 → AC-14

## Acceptance-criteria coverage
- AC-1 palette reset, accent change · AC-2 network, font checks, build output · AC-3 skip link steps · AC-4 focus ring steps · AC-5 button hover, value sourcing · AC-6 404 button · AC-7 logo step · AC-8 page content, noindex · AC-9 four widths · AC-10 reduced motion · AC-11 JavaScript off, network · AC-12 check:design pass and fail cases · AC-13 file layout · AC-14 `pnpm verify`
