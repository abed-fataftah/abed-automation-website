# 0014. Homepage redesign: approved handoff, dotted portrait hero, Work gate, privacy page

**Date**: 2026-11-05
**Status**: In Progress

## Summary

The homepage is rebuilt to the design Abed approved on 2026-11-04 (the handoff in `docs/design/handoff/`). Visitors see both services, real work, and a clear four step process before they are asked to book. A dotted portrait of Abed, whose eyes follow the pointer, replaces the Three.js scene, and Three.js leaves the project. The privacy notice moves to its own `/privacy` page, and the Work section stays out of the build until its real content exists, so nothing unfinished ever ships.

## Requirements

**Design source**: `docs/design/handoff/` (read `handoff.md` first, then `design.md`, `tokens.css`, `pages/home.md`, `pages/privacy.md`, `pages/404.md`). Layout truth is the board at https://claude.ai/artifact/2pUjxVjZaQLgffPYZY5fzL ("Homepage, desktop" and "Homepage, phone"), copied in `reference/Main.dc.html`. Where this spec and the handoff differ, this spec wins (the differences are listed under *Decisions that override the handoff*).

**User stories**:
- As a small business owner, I want to understand both services, see real work, and know what happens after I book, so that booking a call feels safe.
- As a visitor on a phone, with a keyboard, with reduced motion, or with JavaScript off, I want the same complete page, so that nothing depends on my setup.
- As Abed, I want unfinished content to stay out of the build automatically, so that I can merge the redesign before my Work screenshots are ready.

**Acceptance criteria** (the contract):

*Page and layout*
- **AC-1**: `/` renders, in order: header (`#top`, as today), hero (a `<section>` with no id), Services (`#services`), Work (`#work`, only per AC-12), How it works (`#how`), About (`#about`), final CTA, footer. At 320, 390, 768, and 1280px wide, the layout matches `design.md` §4 and `pages/home.md` *Layout*, with no sideways scrolling and nothing clipped.
- **AC-2**: Every visible string, link label, alt text, and meta value comes from `src/content/site.ts` and matches `pages/home.md` *Content* and `pages/privacy.md` (with the overrides below). The phrase `30 minute` appears nowhere in `site`; `30-minute` is used instead, and `pnpm check:copy` fails if `30 minute` returns.
- **AC-3**: The header shows the logo (linking to `#top`), the nav links Services, Work (only when Work renders), How it works, About, and a header size "Book a call" button. Below 900px: logo and button on row 1, nav links wrapping on row 2; from 900px: one row. On `/privacy` and the 404 page the nav links point to `/#…`.
- **AC-4**: With JavaScript off, the hero shows the still portrait image with alt `Portrait of Abed Fataftah drawn in dots`, and every link and button works. No content is hidden in CSS waiting for a script.

*Dotted portrait*
- **AC-5**: When reduced motion is off and `navigator.connection` does not report `saveData`, `2g`, or `slow-2g`, the portrait module loads after `load` plus idle time, at every viewport width. After it draws its first frame, the canvas fades in over 300ms over the still image, the still image is hidden from the accessibility tree, and the canvas carries `role="img"` with the same label as the image alt (read from the image, not hard coded).
- **AC-6**: The live portrait follows a mouse or pen left, right, up, and down with the `TUNING` values from `reference/dotted-portrait.ts` unchanged; looks straight ahead when the pointer leaves the window; on a touch tap looks at the tap for 1.6s, then straight ahead; looks at each booking button while it has keyboard focus. When the pointer is still, or the canvas is off screen, no animation frame loop runs.
- **AC-7**: With `prefers-reduced-motion: reduce` at load, the portrait module and its data are never downloaded and the still image stays. If reduced motion turns on mid visit, tracking stops, the canvas is removed, and the still image returns to the accessibility tree.
- **AC-8**: If the module or its data fails to load or the canvas has no 2D context, the still image stays, one `console.warn` is logged, and nothing else on the page changes.
- **AC-9**: `pnpm check:bundle` fails if the portrait module or `portrait-dots.json` is reachable from any chunk a page loads up front, or if the portrait's gzipped import closure exceeds its budget.
- **AC-10**: Three.js is gone: `three` and `@types/three` are uninstalled; `src/motion/scene.ts`, `src/motion/graph.ts`, and `src/components/HeroScene.astro` are deleted; `check:bundle` has no Three.js marker or scene budget.

*Booking and analytics*
- **AC-11**: Every booking button renders through `BookCta.astro` with `site.bookingUrl`, opens Cal.com in the same tab, and sends the Umami `book-call` event with its location: `header` (header button, every page), `hero`, `final` (unchanged), and `not-found` (404 page body button).

*Sections*
- **AC-12**: Work renders only when `site.work.items` has at least one item. With zero items, the Work section, its nav link, and the hero "See my work" link are all absent from the HTML. Each item renders as a card (category, optional "In progress" tag, title, body, 16:10 screenshot with alt, optional link); a single card spans the row up to 720px wide; a third card wraps into the normal two column grid. The type makes text, screenshot, and alt required, so an incomplete card cannot be added.
- **AC-13**: Services shows two cards of identical structure and size, Websites and web apps first, then AI automation, each with title, body, "Good places to start", and a bulleted list.
- **AC-14**: How it works is an `<ol>` of four steps (number, h3, body, coral top rule): 1 column below 640px, 2 columns from 640px, 4 columns from 1024px.
- **AC-15**: About shows the photo `abed-about.jpg` (max 300px wide, 4:5, alt `Abed Fataftah, wearing a navy suit jacket over a dark shirt.`), the two paragraphs, the three fact chips, the line `Tools I work with:` followed by `site.tools.items` joined with `, `, and a profile link for each entry in `site.about.profiles` (none rendered when the list is empty).
- **AC-16**: The final CTA shows its heading, body, a large booking button, the line `No cookies. Calls are never recorded.`, and `Prefer email?` followed by a mailto link to `site.footer.email`.

*Other pages*
- **AC-17**: `/privacy` exists: h1 `Privacy`, the six existing sections as h2s with their text unchanged, the "Last updated" date, and a "Back to home" link to `/`. Its title is `Privacy · Abed Automation`, its description is the approved line, its canonical and `og:url` are `https://abedautomation.com/privacy` (no trailing slash), it is indexable, it is in the sitemap, and it carries no JSON-LD (only `/` does). The footer "Privacy" link points to `/privacy` on every page, and `/` no longer contains a `#privacy` section.
- **AC-18**: The 404 page uses the new tokens and layout from `pages/404.md`, keeps its copy and `noindex`, shows a large booking button and a home link in one row (wrapping below 640px), and has no portrait.

*Motion, tokens, quality*
- **AC-19**: Every section after the hero carries the existing `data-line` and `data-reveal` hooks (spec 0008). Every section line finishes drawing, the hero underline replay is unchanged, and with reduced motion the underline shows at full width with no drawing and there is no smooth scrolling.
- **AC-20**: The handoff tokens are merged into the existing `@theme` under existing names; existing color values stay. `pnpm check:design` checks these pairs at 4.5:1: `fg` and `muted` on `bg` and on `surface`, `accent` on `bg` and on `surface` (accent is now also text), `on-accent` on `accent`, `accent-hover`, and `accent-pressed`. Root `design.md` is merged with the handoff `design.md`.
- **AC-21**: One h1 per page; landmarks `header`, `nav aria-label="Main"`, `main`, `footer`; every link and button at least 44px tall with the coral focus ring; tab order as in `handoff.md` §9. Lighthouse accessibility reports no errors on `/`, `/privacy`, and the 404 page.
- **AC-22**: `pnpm verify` exits clean.

## Decision

**Chosen option**: Option 1: Restyle the live page in place, in Skateboard slices, on `feat/homepage-redesign`.

The existing components and `site.ts` are reshaped to the handoff on one branch, each slice keeping `pnpm verify` green, merged as one release; the dotted portrait replaces the Three.js scene as a lazily loaded canvas 2D module under the existing loader contract.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.claude/skills/tailwind-4-docs/`) · `accessibility` (`addyosmani/web-quality-skills`, `.claude/skills/accessibility/`) · `core-web-vitals` (`addyosmani/web-quality-skills`, `.claude/skills/core-web-vitals/`) · `gsap-core` (`greensock/gsap-skills`, `.claude/skills/gsap-core/`) · `seo-sitemap` (`agricidaniel/claude-seo`, `.claude/skills/seo-sitemap/`)

### Decisions made with Abed (2026-11-05)

| Topic | Decision |
|---|---|
| Three.js | Remove fully (AC-10). Spec 0009 becomes Superseded by 0014 |
| `30 minute` | Becomes `30-minute` everywhere, guarded by `check:copy`. Abed changes the Cal.com event description by hand |
| Work content | Not ready. Build the section behind the AC-12 gate; content arrives later as data only |
| Partial Work | Each card ships as soon as its own content is complete; a lone card spans the row |
| Profile URLs | Abed supplies LinkedIn and GitHub URLs during `/develop`; until then the list is empty and nothing renders |
| Reduced motion | Keep the still image; never load the portrait module |
| Devices | Live portrait at every width; skipped on Save Data, `2g`, `slow-2g` |
| Load timing | After `load` plus idle, through the existing loader |
| About photo | New `abed-about.jpg`; delete `src/assets/abed.png` |
| Privacy description | Approved as written in `pages/privacy.md` |
| Reveals | Existing hooks on every section after the hero |
| Final CTA location | Keep `final` (the handoff checklist's `cta` is not used) |
| Token names | Keep existing names; add only new tokens |
| Old specs | Supersede 0009; add one "Updated by 0014" line to 0003, 0004, 0006, 0007, 0008, 0010 |

### Decisions that override the handoff

- Token names: the handoff's `--color-text` is `fg`, `--color-text-muted` is `muted`; `--container-page` is the existing `--container-site`. `--color-portrait-dot` and `--color-portrait-pupil` are not added; the portrait reads `--color-fg` and `--color-bg`.
- The final CTA analytics location stays `final`, not `cta`.
- The 404 body booking button uses the new location `not-found` (the 404 has no existing booking button to keep).
- Reveal and line hooks go on every section after the hero (Abed's call), although the handoff `design.md` says the redesign adds no scroll entrances: these are spec 0008's existing reveals, not new ones.
- The canvas is created by `portrait.ts` over an Astro `<Image>`, instead of the handoff's `<picture>` plus a server rendered `<canvas>`.
- Under reduced motion the still image shows (the module never loads), instead of the handoff's "static frame" on canvas.
- `reference/dotted-portrait.ts` hex fallbacks are removed (colors live only in `global.css`); with reduced motion the module is never loaded, so its `reduce` branch is kept only as a guard.

## Feature design

### Files

| File | Change |
|---|---|
| `src/styles/global.css` | Merge tokens (see *Token merge*); card, pill, step rule utilities; `portrait-canvas` class; print rules (see *Build details*) |
| `astro.config.mjs` | `build: { format: 'file' }`, so pages build to `dist/privacy.html` and Cloudflare Pages serves them at `/privacy` with no trailing slash |
| `src/layouts/Base.astro` | Emit the JSON-LD block only on `/`, with the homepage URL as `url` and `@id` base; other indexable pages keep canonical and `og:url` only |
| `design.md` (root) | Merge the handoff `design.md`; it replaces §1 principle 3 ("no cards, no pills"), the color and type tables, spacing, shape, and components; keeps logo, social card, favicon sections |
| `src/content/site.ts` | New content shape (see *Content model*) and copy |
| `src/components/BookCta.astro` | `size?: 'large' \| 'header'` (default `large`); `location: 'header' \| 'hero' \| 'final' \| 'not-found'` |
| `src/components/SiteHeader.astro` | New nav, header booking button, two row mobile layout; the Work link renders only when `site.work.items` is not empty |
| `src/components/SiteFooter.astro` | Privacy link to `/privacy`; caption size |
| `src/components/DottedPortrait.astro` (new) | `<div data-portrait>` wrapping the Astro `<Image>` of `src/assets/portrait-fallback.png`, `loading="eager"`, alt from `site.home.portraitAlt` |
| `src/components/PrivacyNotice.astro` | Moves to `/privacy`: h2 sections instead of h3, no `section-line` wrapper, no `id="privacy"` |
| `src/pages/index.astro` | New section order and markup; no `HeroScene`, no tools strip, no `PrivacyNotice` |
| `src/pages/privacy.astro` (new) | Header (`home="/"`), h1, `PrivacyNotice`, back link, footer |
| `src/pages/404.astro` | Restyle; large `BookCta location="not-found"` plus home link |
| `src/motion/portrait.ts` (new) | `init(container: HTMLElement): () => void`, adapted from `reference/dotted-portrait.ts`; the only file that imports `portrait-dots.json` |
| `src/motion/portrait-dots.json` (new) | Copied from `docs/design/handoff/assets/portrait-dots.json` |
| `src/motion/loader.ts` | Drop `graph`/`scene`; add `watchPortrait()` |
| `src/assets/portrait-fallback.png`, `src/assets/abed-about.jpg` (new) | From the handoff assets; delete `src/assets/abed.png` |
| `src/assets/work/` (new, holds only `.gitkeep` until content) | Work screenshots, 1600×1000 WebP or PNG |
| `docs/design/assets/` | Move `abed-portrait-source.png` and `make-portrait-dots.py` here (not built) |
| `scripts/check-copy.mjs`, `check-design.mjs`, `check-seo.mjs`, `check-bundle.mjs` | See *Guards* |
| Deleted | `src/motion/scene.ts`, `src/motion/graph.ts`, `src/components/HeroScene.astro`, `src/assets/abed.png`; `three`, `@types/three` from `package.json` |

### Content model (`SiteContent` changes)

Keep existing keys where the text is the same. New or changed:

| Key | Type | Value |
|---|---|---|
| `meta.description` | `string` | Existing text with `30-minute` |
| `nav` | `{ label; services; work; how; about; book }` | `Main`, `Services`, `Work`, `How it works`, `About`, `Book a call` (`tools` removed) |
| `home.eyebrow`, `home.heading` | unchanged | |
| `home.intro` | `string` | Existing text with `30-minute` |
| `home.secondary` | `string` | `See my work` |
| `home.portraitAlt` | `string` | `Portrait of Abed Fataftah drawn in dots` |
| `services` | `{ heading; startLabel; web: Service; automation: Service }`, `Service = { title; body; starts: string[] }` | Strings from `pages/home.md`; rendered web first |
| `work` | `{ heading; intro; inProgressLabel; items: WorkItem[] }` | `items: []` at merge |
| `WorkItem` | `{ category: string; title: string; body: string; image: string; imageAlt: string; inProgress?: true; link?: { label: string; href: string } }` | `image` is a file name in `src/assets/work/` |
| `how` | `{ heading; steps: { title; body }[] }` | Four steps from `pages/home.md` |
| `about` | `{ title; body: [intro, background]; photoAlt; facts: string[]; profiles: { label: string; href: string }[] }` | Two paragraphs and three facts from `pages/home.md`; `profiles: []` until Abed supplies URLs |
| `tools` | `{ label; items }` | Unchanged; rendered inside About |
| `finalCta` | `{ title; body; reassurance; emailLead }` | Body with `30-minute`; `No cookies. Calls are never recorded.`; `Prefer email?` |
| `privacy` | add `metaTitle`, `metaDescription`, `back` | `Privacy · Abed Automation`, the approved description, `Back to home` |

### Value sourcing

| Action | Value | Source |
|---|---|---|
| Any booking button | URL, label | `site.bookingUrl`; `site.cta.bookLabel` (large) or `site.nav.book` (header) |
| Any booking button | Umami event, location | `site.analytics.bookEvent`; the `location` prop per AC-11 |
| Work render decision | Show section, nav link, "See my work" | `site.work.items.length > 0`, read directly from `site` by `index.astro` and by `SiteHeader.astro` (so the nav link follows the same rule on every page) |
| Work card image | Image metadata | `import.meta.glob('/src/assets/work/*.{png,webp,jpg}', { eager: true })` keyed by `WorkItem.image`; a missing file throws at build with the item title; rendered with `<Image>` at `widths={[560, 1120]}` and matching `sizes` |
| Work card tag text | "In progress" | `site.work.inProgressLabel`, shown when `inProgress` is set |
| Portrait canvas label | Accessible name | The fallback `<img>` `alt` attribute in the container, copied by `portrait.ts` |
| Portrait colors | Dot, sclera, pupil | `--color-fg`, `--color-portrait-sclera`, `--color-bg` via `getComputedStyle(document.documentElement)` (Tailwind 4 emits `@theme` colors as `:root` variables); if any is empty, `init` warns and returns a no op cleanup (still image stays) |
| Portrait look targets | Booking buttons | `document.querySelectorAll('[data-book-cta]')` at init |
| Portrait motion | All tuning values | `TUNING` in `portrait.ts`, copied unchanged from the reference |
| Tools line | Names | `site.tools.label` + `site.tools.items.join(', ')` |
| Copyright year | Year | Existing build year logic in `SiteFooter.astro` |
| Privacy page meta | Title, description, canonical | `site.privacy.metaTitle`, `metaDescription`; canonical from the existing `Base.astro` logic for the route |

### Portrait loading contract

- `DottedPortrait.astro` renders only the container and the still image. Container: `position: relative`, `aspect-ratio: 1`, full column width up to 460px. Image: explicit `width`/`height` (no layout shift), `loading="eager"`, `fetchpriority="high"`, filling the container. No canvas exists without JavaScript.
- `portrait.ts` creates the `<canvas>` with class `portrait-canvas`: `position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0; transition: opacity 300ms`, and `.is-ready { opacity: 1 }`, both in `global.css`. The canvas is transparent; the still image stays visible underneath (it is the same dot render), so nothing doubles. The canvas gets no reveal or line hook.
- `loader.ts` `watchPortrait()`: find `[data-portrait]`; return if absent (privacy, 404) or `isSlowConnection()`. No width gate and no IntersectionObserver gate (it is above the fold); it runs inside the existing `start()`, which already returns under reduced motion and waits for `load` plus idle. `startPortrait()` copies the existing pattern: `try`/`catch` around `await import('./portrait')`, then `if (stopped) return` before `init`.
- `portrait.ts` `init(container)`: import the JSON statically (it lands in the portrait chunk), create the canvas, call the adapted `mountDottedPortrait(canvas, data, { lookTargets, onReady })`. `onReady` fires once, on the first `draw()` that runs with a size above 0 (the reference's `if (!size) return` means not drawn). In `onReady`: add `is-ready` to the canvas and set `aria-hidden="true"` on the still image. Cleanup: remove listeners and observers, cancel the frame, remove the canvas, remove `aria-hidden` from the image.
- Mid visit reduced motion: the loader's existing `stopAll()` calls this cleanup (AC-7).

### Token merge

- Colors: keep `bg`, `fg`, `muted`, `line`, `accent`, `on-accent`, `accent-hover`, `accent-pressed` at their current values. Add `--color-surface: #24211e` and `--color-portrait-sclera: #cfc8bf`.
- Type: copy the `tokens.css` and `design.md` §3 values as written (sizes, line heights, letter spacing as `--text-*--letter-spacing` or tracking tokens); replace the existing scale with the handoff roles, reusing names where the role matches (`--text-hero` becomes the clamp value; `--text-small` becomes 15px; `--text-body` stays 16px) and adding `--text-cta-heading`, `--text-section`, `--text-card-title`, `--text-step-title`, `--text-lead`, `--text-greeting`, `--text-body-lg`, `--text-caption`. Remove tokens no longer used (`--text-hero-lg`, `--text-final*`, `--text-title`, `--text-note`, tracking tokens) once nothing references them.
- Spacing and shape: add `--spacing-page-x`, `--spacing-section-y`, `--spacing-hero-top`, `--breakpoint-two-col: 56.25rem`, `--radius-card`, `--radius-pill`; `--radius-button` becomes 8px. Keep `--container-site` (1120px). Motion tokens: spec 0008 values win.

### Guards

| Script | Change |
|---|---|
| `check:copy` | Add rule `thirty-minute`: `/\b30 minute/gi`. `MAX_LENGTH`: keep the existing limits on paths that still exist (`home.intro` is 119 of 120 with `30-minute`), drop removed paths, skip array keys, add no new limits. Tools rule unchanged (`site.tools.items`). Add: every `about.profiles[].href` and `work.items[].link.href` is `https://`; profile hosts are `www.linkedin.com`/`linkedin.com` or `github.com`; work link host is `github.com` |
| `check:design` | Add `surface` pairs and raise `accent` on `bg` to 4.5 (AC-20). `portrait.ts` lives in `src/motion`, which the scan does not cover; it holds no color values after the change |
| `check:seo` | Expect sitemap locs `/` and `/privacy`; add `checkPage('privacy.html', { title: site.privacy.metaTitle, description: site.privacy.metaDescription, indexable: true })`; update the final message |
| `check:bundle` | Remove the Three.js marker and scene budget. Add marker `{ library: 'Dotted portrait', marker: 'abed-dotted-portrait' }`, a string literal that only `portrait.ts` contains (its `console.warn` text). Add a gzipped budget for the portrait import closure: first measured size plus about 10%, rounded up to 5 KB, recorded in the script comment, never above 60 KB |

### Build details

- **Copy**: every handoff string uses curly quotes and apostrophes in `site.ts` (`I’ve`, `I’m`, `Let’s`); `check:copy` fails on straight ones.
- **Markup**: "Good places to start" is a `<p>`, not a heading. The hero eyebrow (`home.eyebrow`, "Hi, I’m Abed.") renders at `--text-greeting`. The 404 page keeps its `notFound.code` eyebrow above the h1.
- **Booking button sizes**: `btn-primary` stays the large size (min height 48px); a header variant (15px, padding 10px 18px, min height 44px) is selected by `size="header"`. `data-book-cta` stays on both.
- **Header and scrolling**: the header stays static (not sticky), so `[id] { scroll-margin-top: 1rem }` and the existing smooth scroll rule stay unchanged.
- **Print**: replace the `[data-scene]` print rules with `[data-portrait] canvas { display: none !important; }`, so the still image prints.
- **Work layout**: from 900px, two equal columns; a lone card spans both columns with `max-width: 720px`; three or more cards fill the grid row by row.

### Key invariants

- The page is complete with JavaScript off; the canvas is never in server HTML.
- Only `BookCta.astro` renders a booking link; the URL appears nowhere else.
- No `[`, `]`, or placeholder text in `site`; Work items exist only when complete.
- `portrait-dots.json` is imported only by `portrait.ts`; `portrait.ts` is reached only through `import()` in `loader.ts`.
- Both service cards share one markup path (a loop over `[web, automation]`).
- No new third party request on first load, no cookies. Profile and GitHub links are plain links.

### Security model

Public static site, no input, no accounts. External links (Cal.com, profiles, GitHub) are same tab plain links, `https://` only, checked by `check:copy`. No new data is collected, so the privacy notice text does not change.

### Configuration required

None. No env vars or secrets.

### Critical test scenarios

- Happy path: at 1280 with a mouse, load `/`, the portrait fades in, follows the pointer, looks at "Book a call" on Tab; click each booking button and see the Umami event with its location, verifies **AC-5**, **AC-6**, **AC-11**
- No JavaScript: the still portrait, every section, and every link work, verifies **AC-4**
- Reduced motion: no portrait chunk in the network panel, still image, no underline draw, verifies **AC-7**, **AC-19**
- Failure: block the portrait chunk; the still image stays, one warning, verifies **AC-8**
- Work gate: with `items: []` no `#work`, no Work nav link, no "See my work"; with one temporary complete item (not committed) one full row card, verifies **AC-12**
- Bundle: `pnpm check:bundle` fails when `portrait.ts` is imported statically from `loader.ts` (temporary edit), verifies **AC-9**

## Build plan

Skateboard: first a complete, readable new page with no live portrait (slices 1 to 6, shippable on their own), then the portrait, then cleanup. One commit per slice, Conventional Commits, `pnpm verify` green after each.

1. Merge tokens into `global.css` and the handoff `design.md` into root `design.md`; extend `check:design` pairs, satisfies **AC-20**
2. Reshape `SiteContent` and `site` with the new copy (`30-minute`, Work with `items: []`, profiles empty); update `check:copy` rules and `MAX_LENGTH` paths; components keep compiling, satisfies **AC-2**
3. `BookCta` sizes and locations; `SiteHeader` new nav, header button, mobile two rows, gated Work link; `SiteFooter` caption size, satisfies **AC-3**, **AC-11**, **AC-21**
4. Rebuild `index.astro`: hero with `DottedPortrait` (still image only) and the conditional "See my work"; Services; gated Work; How it works; About (new photo, facts, tools line, profiles); final CTA; reveal and line hooks on every section after the hero; remove `HeroScene`, the tools strip, and `PrivacyNotice` from the page; check the four widths, satisfies **AC-1**, **AC-4**, **AC-12**, **AC-13**, **AC-14**, **AC-15**, **AC-16**, **AC-19**
5. Privacy page: `build.format: 'file'`, JSON-LD only on `/` in `Base.astro`, `privacy.astro`, `PrivacyNotice` heading levels, footer link to `/privacy`, `check:seo` for the new page and sitemap, satisfies **AC-17**
6. Restyle `404.astro` with the booking button and home link, satisfies **AC-18**, **AC-11**
7. Portrait module: `portrait.ts` and `portrait-dots.json`, `watchPortrait()` in the loader, `portrait-canvas` styles and print rule, fade in and accessibility swap, cleanup; `check:bundle` marker and measured budget, satisfies **AC-5**, **AC-6**, **AC-7**, **AC-8**, **AC-9**
8. Remove Three.js: uninstall, delete `scene.ts`, `graph.ts`, `HeroScene.astro`, `abed.png`; strip the Three.js parts of `check:bundle`; move the portrait source and generator to `docs/design/assets/`, satisfies **AC-10**
9. Add Abed's LinkedIn and GitHub URLs to `site.about.profiles` when given, satisfies **AC-15**
10. `pnpm verify`, then `/check verify` with `verify.md` (includes Lighthouse accessibility on three pages and real touch and keyboard checks), satisfies **AC-21**, **AC-22**

Later, outside this feature's done gate: add Work items as data (text, screenshot in `src/assets/work/`, alt, optional GitHub link) whenever ready; no code change.

## Consequences

**Positive**:
- Visitors see work and process before the ask; the hero's bold element costs about one small chunk instead of a 135 KB gzipped 3D library, and it now runs on phones too.
- Three.js, its skills, and its budget leave the codebase; one fewer pinned dependency.
- The Work gate is enforced by types, so unfinished cards cannot ship.

**Negative / tradeoffs**:
- The live portrait now downloads on phones (one portrait chunk, bounded by the `check:bundle` budget) where the old scene never did.
- With zero Work items the redesign ships without the "see real work" part of its own goal until Abed adds content.
- Old `/#privacy` links now land on the top of the homepage; a hash cannot be redirected by the host.
- The portrait tuning was approved on still renders and a board, not a real browser; real device checks may surface changes that need Abed's approval.
- Umami location `header` and `not-found` start fresh; `final` keeps its history.

**Neutral**:
- Revert is one revert of the merge commit; no data or external config migrates, except the Cal.com description (manual).
- Spec 0009 is superseded; 0003, 0004, 0006, 0007, 0008, 0010 each carry an "Updated by 0014" line.

## Follow-up

- [ ] Abed: change "30 minute" to "30-minute" in the Cal.com "Free Intro Call" event description (outside the repo)
- [ ] Abed: supply LinkedIn and GitHub URLs during `/develop` (build plan task 9)
- [ ] Abed: supply Work card content (text, 1600×1000 screenshot with private data blurred, alt, optional GitHub URL) when ready
- [ ] `/sync` after the build: root `AGENTS.md` (Three.js mention, `check:bundle` description) and `src/motion/AGENTS.md` (files table, scene rules, Three.js skills, portrait contract)
- [ ] Open (Abed, not part of this build): whether How it works gets a fifth step after the call
- [ ] Consider removing the now unused `threejs-*` skills from `.claude/skills/` once Three.js is gone

## Rationale

Reasoning and options: see [rationale.md](rationale.md). Verify steps: see [verify.md](verify.md).
