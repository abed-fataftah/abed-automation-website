# Handoff: Abed Automation homepage redesign

**Read this file first.** Then read `design.md`, `tokens.css`, and the page files in `pages/` as you build each page.

## 1. Project summary

abedautomation.com is a single-page site for Abed Fataftah (one person, never a team). It offers AI automation, websites, and custom web apps for small businesses, and sends every visitor to one Cal.com page to book a free 30-minute call. This redesign keeps the brand, the stack, and every ground rule from `docs/scope/scope.md`. It changes the page structure so visitors see real work and a clear process before they're asked to book, and it replaces the Three.js hero scene with a dotted portrait of Abed whose eyes follow the pointer.

Main visitor tasks:
1. Understand both services.
2. See real work.
3. Understand what happens after booking.
4. Book the free call.

## 2. Stack and files

The stack is unchanged: Astro 7 static site, Tailwind CSS v4 (theme in `src/styles/global.css`), pnpm, Cloudflare Pages. Copy lives in `src/content/site.ts`, and every booking link goes through `BookCta.astro`. Follow spec 0002: `@/` imports, single quotes, semicolons, `pnpm verify` clean, a `feat/homepage-redesign` branch, one commit per milestone, Conventional Commits.

| Handoff file | Goes to | How |
|---|---|---|
| `design.md` | root `design.md` | Merge. Keep the existing sections it doesn't cover |
| `tokens.css` | `src/styles/global.css` | Merge into the existing `@theme`. Existing values win where marked [APPROX] |
| `pages/home.md`, `pages/privacy.md`, `pages/404.md` | `docs/design/handoff/pages/` | Reference while building |
| `reference/dotted-portrait.ts` | `src/motion/portrait.ts` | Adapt to the existing `src/motion/loader.ts` pattern (dynamic import, cleanup) |
| `assets/portrait-dots.json` | `src/motion/portrait-dots.json` | Imported only by the lazy portrait module |
| `assets/portrait-fallback.png` (920×920, transparent) | `src/assets/portrait-fallback.png` | Rendered with Astro `<Image>` as the no-JavaScript and loading state |
| `assets/abed-about.jpg` (640×800) | `src/assets/abed-about.jpg` | About photo |
| `assets/abed-portrait-source.png`, `assets/make-portrait-dots.py` | `docs/design/assets/` | Source photo and the generator that made the JSON and fallback. Not part of the build. Run it only to regenerate the assets |
| `reference/Main.dc.html` | `docs/design/handoff/reference/` | The approved design board source. Reference only, never built |

## 3. Approved decisions record

| Item | Decision |
|---|---|
| Process | Critique of the live site, then research of 8 reference sites, an approved sitemap, three design directions, then an interactive design board approved by Abed ("ok done", 2026-11-04) |
| Reference sites | KM Web (work cards right after the hero, honest labels), CSS Wizardry (one person, free 30-minute call), Ardeshir Shojaei (numbered steps after the call), XRAY (work named by workflow type), Brittany Chiang (tools attached to projects). Inspiration only; nothing copied |
| Direction | A, "Warm and personal": portrait beside the headline, soft 12px cards, one font, calm dark surfaces |
| Brand | Kept: `#1A1816` background, warm off-white text, coral `#FF6B57`, Schibsted Grotesk, the existing SVG logo |
| Structure | Header → Hero → Services → Work → How it works → About → Final CTA → Footer, plus `/privacy` and the existing 404 page |
| Hero | Dotted portrait (replaces the Three.js scene). The coral underline under "AI automation" stays (Abed asked to keep it) |
| Portrait behavior | Eyes and head follow the pointer, the eyelids follow the gaze, it looks back when the pointer leaves, it looks at booking buttons on keyboard focus, and it looks at a tap for 1.6s on touch. Reduced motion: static. Exact values: `TUNING` in `reference/dotted-portrait.ts` |
| Optional effects | Dots gathering, coral spotlight, eyes closing, and sand dots were tried on the board and **left off**. Don't build them |
| Tokens | `tokens.css`, contrast checked by code |
| Prototype method | Interactive design board (canvas). The booking link was real; nothing else was simulated |

### Spec changes this redesign needs

Record them through `/architect` before `/develop`. A new scope feature "Homepage redesign" with its own `(spec)` decision box fits the scope's workflow.

| Spec | Change |
|---|---|
| 0006 Tools line | The tools strip after the hero moves into About as one line, "Tools I work with: …". Update the `check:copy` tools rule |
| 0007 Privacy notice | Moves from the `/#privacy` section to its own page at `/privacy`. The footer link changes |
| 0008 GSAP motion | Hero underline replay: unchanged. Section reveals and drawn section lines: unchanged by this design. Check they finish drawing (see §10) |
| 0009 Three.js scene | Replaced by the dotted portrait (canvas 2D, no dependency). Recommended: uninstall `three`, delete `src/motion/scene.ts`, `src/motion/graph.ts`, and `HeroScene.astro`, and remove the Three.js marker from `check:bundle`, because nothing else uses them. Confirm with Abed in `/architect` |
| Deferred "Selected Work" | Becomes the Work section, with two items: n8n workflows, and SKF labeled "In progress" |
| 0004 Site copy | New and changed strings, listed in `pages/home.md` |
| 0010 Analytics | New booking location `header` for the header button |

## 4. Sitemap and navigation

| Page | Route | First release | Menu |
|---|---|---|---|
| Home | `/` | yes | Services `#services` · Work `#work` · How it works `#how` · About `#about` · Book a call (button) |
| Privacy | `/privacy` | yes | Linked from the footer on every page |
| Not found | 404 | yes (restyle) | none |
| Cal.com booking | external | existing | Every booking button |
| One page per project | `/work/<slug>` | no: only after Abed supplies case-study content | none |
| One page per service | `/websites`, `/automation` | no: a separate search-visibility decision | none |

## 5. Page index

- `pages/home.md`: the whole homepage, with every string, the layout at 1280 and 390, the portrait states, and the interactions.
- `pages/privacy.md`: the existing privacy notice on its own page.
- `pages/404.md`: the existing not found page, restyled.

## 6. Shared components and patterns

- **Header** (`SiteHeader.astro`): logo, four nav links, "Book a call." On other pages the links point to `/#…`.
- **Footer** (`SiteFooter.astro`): copyright, email, and "Privacy" → `/privacy`.
- **Booking button** (`BookCta.astro`): large and header sizes, with the location attribute.
- **Text link**: see `design.md` §6.
- **Focus ring**, **section divider**, and **container**: see `design.md` §4 and §5.

## 7. Build order

1. Merge `tokens.css` and `design.md`. Depends on nothing; `pnpm verify` should stay clean.
2. Update `site.ts` with the copy from `pages/home.md`, and update the `check:copy` rules (tools, privacy link, "30-minute"). Depends on 1.
3. Header: the new nav and the `BookCta` header size and location. Depends on 1 and 2.
4. Hero layout with the underline (existing GSAP) and the portrait's still fallback image only, with no JavaScript yet. Remove `HeroScene.astro` from the page. Depends on 3.
5. Portrait module: lazy-loaded `src/motion/portrait.ts` with `portrait-dots.json`, the canvas fade-in, and reduced motion. Prove `check:bundle` stays clean. Depends on 4.
6. Services: the two equal cards. Depends on 2.
7. How it works: the four steps. Depends on 2.
8. About: photo, two paragraphs, facts, tools line, and profile links (only those with a URL). Depends on 2.
9. Final CTA, footer, and the privacy page move (spec 0007). Depends on 2.
10. Work section: build it behind content readiness. If the content isn't ready, leave the section and its two links out (see `pages/home.md` States). Depends on Abed's assets.
11. 404 restyle. Depends on 1.
12. `pnpm verify`, then `/check verify` with the acceptance checklist below.

## 8. Content and assets

| Item | Status | File and size |
|---|---|---|
| All copy except the Work cards and profile URLs | final (from the live site and the approved board) | `site.ts` |
| Dotted portrait data | final | `portrait-dots.json`, 62 KB, 110×110 grid |
| Portrait still fallback | final | `portrait-fallback.png`, 920×920, transparent, 21 KB |
| About photo | final | `abed-about.jpg`, 640×800 |
| Logo | final (existing SVG in the repo) | unchanged |
| Work card 1: description, screenshot, alt, GitHub URL | **Abed must provide** | screenshot 1600×1000 (16:10), WebP or PNG, private data blurred |
| Work card 2 (SKF): description, screenshot, alt | **Abed must provide** | screenshot 1600×1000 (16:10) |
| LinkedIn and GitHub URLs | **Abed must provide** (or leave the line out) | `site.ts` |
| Privacy page meta description | new copy, needs Abed's approval | `pages/privacy.md` |

## 9. Key flows

**Book a call.** Visitor clicks any of the three booking buttons → the Cal.com "Free Intro Call" page opens in the same tab → the visitor enters a name and email → the booking is confirmed instantly by Cal.com. Success is visible on Cal.com. The site has no failure state of its own; if Cal.com is down, the link still points to the right page.

**See the work.** "See my work" or the "Work" nav link → scrolls to `#work` → the visitor reads the cards → optionally opens the GitHub link in the same tab.

**Read privacy.** Footer "Privacy" → `/privacy` → "Back to home" → `/`.

**Keyboard only.** Tab → skip link → logo → nav links → "Book a call" (the portrait looks at it) → hero "Book a Free Call" (the portrait looks at it) → "See my work" → content links in order → footer links. Each focused item shows the coral focus ring.

## 10. Open items and unverified points

- Token values marked [APPROX] in `tokens.css` were estimated; use the existing values in `global.css`.
- The portrait animation was approved on the design board by Abed. The designer reviewed it only as still renders, not running in a browser. Verify it at 320, 390, 768, and 1280, with touch, keyboard, and reduced motion.
- The tablet layout wasn't drawn on a board. The rules in `design.md` §4 define it.
- Work card content, screenshots, and profile URLs are missing (see §8).
- After the call, there may be a fifth step (for example a written proposal). Abed hasn't decided; don't add one.
- The existing 404 copy wasn't available to the designer. Keep it as it is.
- A live-site review on 2026-11-04 saw the GSAP section lines under About and the final CTA only partly drawn in screenshots. The reviewer judged it as the animation still running, not a bug. Confirm they always finish drawing, and that reduced motion turns them off.
- The underline animation and section lines come from spec 0008. Their timing on the board (700ms after 300ms) is a reference; keep the spec 0008 values if they differ.

## 11. Acceptance checklist

1. `pnpm verify` passes (types, lint, format, design, copy, build, bundle).
2. `check:bundle`: the portrait module and `portrait-dots.json` aren't in the entry chunk.
3. At 320, 390, 768, and 1280: no sideways scrolling, nothing clipped, and the layouts match `design.md` §4.
4. With JavaScript off: the hero shows the still portrait, and every link and button works.
5. The portrait follows the mouse left, right, up, and down. It looks back when the pointer leaves the window, and settles (no running animation loop) when the pointer is still.
6. Touch: a tap makes the portrait look at it, then return after 1.6s.
7. Keyboard: focusing each booking button makes the eyes look at it, and every link shows the coral focus ring.
8. With `prefers-reduced-motion: reduce`: the portrait is static, the underline appears without drawing, and there's no smooth scrolling.
9. All three booking buttons open the Cal.com URL from `site.ts`, and Umami records each with its own location (`header`, `hero`, `cta`).
10. No text or link contains `[`, `]`, or a placeholder; the `check:copy` guard covers this.
11. Every text pair passes 4.5:1, re-checked if any [APPROX] value changed.
12. Both service cards have the same structure and size, and nothing emphasizes one service over the other except the existing headline underline.
13. `/privacy` shows the full existing notice, the footer link works on every page, and `/privacy` is in the sitemap.
14. The 404 page uses the new tokens and has a working home link and booking button.
15. Lighthouse accessibility shows no errors on `/`, `/privacy`, and the 404 page.
16. The About photo and portrait fallback have the exact alt text from `pages/home.md`.
