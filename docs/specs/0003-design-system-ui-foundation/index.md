# 0003. Design system and UI foundation

**Date**: 2026-10-29
**Status**: In Progress

## Summary

This spec turns the design you approved (direction I2, "Charcoal coral, plainer", from your `design-handoff/` folder) into the shared base every section builds on: color, type, and size tokens in Tailwind, the Schibsted Grotesk font hosted on the site itself, a skip link, a focus ring, the two button styles, and an SVG version of your AD logo. The handoff is the source of truth and is not redesigned here. Header, footer, and the page sections stay in features 6 to 12. They only use what this feature sets up. A small check script keeps the colors honest: it fails the build if a color pair drops below its contrast target or if a raw color value shows up in a component.

## Requirements

**User stories**:
- As a visitor, I want readable, high contrast text and clear buttons on any screen size so that I can understand the offer and book a call without effort.
- As a keyboard user, I want a skip link and a visible focus ring on every link and button so that I always know where I am.
- As Abed (building features 6 to 14), I want one place for every color, size, and button style so that new sections match the approved design without guessing.

**Acceptance criteria**:
- **AC-1**: `src/styles/global.css` holds the approved tokens from the handoff in its `@theme` block: the 9 colors (`bg`, `fg`, `muted`, `line`, `accent`, `on-accent`, `accent-hover`, `accent-pressed`, `placeholder-line`), the type sizes (`hero`, `final`, `title`, `body`, `small`, `note`) with their line heights, plus `hero-lg` (2.5rem, line height 1.08) and `final-lg` (1.75rem, line height 1.15) for 640px and up, `tracking-hero`, `tracking-final`, `radius-button` (6px), and `container-site` (1120px). Tailwind's default color palette is reset, so a class like `bg-red-500` produces no style. The page is dark only (`color-scheme: dark`), with `bg` behind the whole page and `fg` as the default text color.
- **AC-2**: Schibsted Grotesk loads from the site's own domain through Astro's fonts option (Fontsource provider, Latin subset, weight range 400 to 700, `font-display: swap`, preloaded). The fallback stack from the handoff applies while it loads or if it fails. No font request goes to any third party, and no other font family is used.
- **AC-3**: The first Tab press on any page shows a "Skip to content" link (text from `site.ts`) at the top left (8px from the top, 16px from the left), 16px bold, padding 12px by 16px (at least 44px tall), filled `fg` with `bg` text, 6px radius, z index 50. Until focused it is hidden with `sr-only` (shown with `focus:not-sr-only` plus fixed position). Pressing Enter moves focus into `<main id="main">`. Every page has exactly one `<main>`, and the layout provides it.
- **AC-4**: Every link and button shows a 2px solid `accent` outline with a 3px offset on `:focus-visible`. A mouse click shows no ring.
- **AC-5**: `BookCta.astro` renders as the primary button: 48px tall, 0 20px padding, 6px radius, 15px bold `on-accent` text on `accent`. Hover fills `accent-hover` (on devices that can hover), pressed (`:active`) fills `accent-pressed`. State changes are instant: no CSS transitions until feature 13. It is full width below 640px and fits its label from 640px. The booking URL still comes only from `site.bookingUrl`.
- **AC-6**: The secondary button (used only on the 404 page) is 48px tall with a 1px `fg` border, `fg` text, the same radius and padding, and an `accent` border on hover.
- **AC-7**: A `Logo.astro` component renders the AD monogram as an inline SVG, 34px high with width in proportion, with the A and D in `fg` and the `< >` brackets in `accent`. It is hidden from screen readers (decorative, since the name "Abed Automation" sits next to it). Abed approves the redraw by eye before this criterion counts as met.
- **AC-8**: `index.astro` and `404.astro` use the tokens, font, skip link, logo, and buttons. Both pages open with a brand row: the logo, a 12px gap, then the brand name (16px bold, line height 1.6), in `site-wrap`, with 16px above and below it and a 1px `line` border under it. The home page then shows a hero (padding 48px, 56px from 640px, 64px from 1024px): the line "Hi, I’m Abed." (14px `muted`), 16px gap, the `<h1>` from the handoff (`text-hero sm:text-hero-lg`, weight 700, `tracking-hero`, max 640px wide), 16px gap, the intro (16px `muted`, max 460px wide), 24px gap, then the primary button. The coral underline on "AI automation" is not built here (feature 6). The 404 page follows the handoff layout: a block with 48px top and 64px bottom padding holding a "404" line (14px `muted`, not a heading), 16px gap, an `<h1>` (`text-hero sm:text-hero-lg`, 700, `tracking-hero`, max 560px wide), 16px gap, one body sentence (16px `muted`, max 460px wide), 24px gap, and the secondary button to `/`, with the handoff copy and `<meta name="robots" content="noindex">`. Headings use `overflow-wrap: anywhere` so long words wrap at 320px.
- **AC-9**: At 320, 390, 768, and 1280px wide, neither page scrolls sideways (checked as `document.documentElement.scrollWidth <= clientWidth`). Content sits in a centered container of at most 1120px, with 16px side padding below 640px and 24px from 640px.
- **AC-10**: The header is static (not sticky). Every in page anchor target (any element with an `id`, including `#main`) lands 16px below the top of the window. Smooth scrolling applies only when `prefers-reduced-motion` is not set.
- **AC-11**: With JavaScript off, both pages show all their text and the button works. The first load makes no third party request and sets no cookie.
- **AC-12**: `pnpm check:design` checks every approved color pair against its target (4.5 for text, 3.0 for non text) using the values in `global.css`, and fails on a drop. It also fails if any file in `src/components`, `src/layouts`, `src/pages`, or `src/content` contains a raw hex color or an arbitrary color class such as `bg-[#...]`. It runs inside `pnpm verify`, so CI runs it too.
- **AC-13**: `design.md` sits at the repo root, matches the handoff plus the decisions in this spec, and the `design-handoff/` folder is gone, with each file moved to its home (see *Handoff file moves* below).
- **AC-14**: `pnpm verify` exits clean.

## Decision

**Chosen option**: Option 1: Tailwind tokens and utilities, built in Astro font loading, and a design check script.

Put the approved handoff tokens in Tailwind's `@theme` (with the default palette removed), define both button styles once as Tailwind `@utility` classes, load Schibsted Grotesk through Astro's fonts option, redraw the logo as an inline SVG component, and enforce contrast and "tokens only" with a script in `pnpm verify`.

**Implementation skills**: `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.claude/skills/tailwind-4-docs/`) · `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`) · `accessibility` (`addyosmani/web-quality-skills`, `.claude/skills/accessibility/`) · `web-design-guidelines` (`vercel-labs/agent-skills`, `.claude/skills/web-design-guidelines/`)

## Rationale

Reasoning, options, and where every handoff file goes: see [rationale.md](rationale.md).

## Feature design

**Design source**: the approved handoff, moved into the repo by this feature. After the move, `design.md` (repo root) is the source of truth for the look. `docs/design/pages/home.md` and `docs/design/pages/404.md` are the page briefs, and `docs/design/prototype/abedautomation-prototype.html` is the visual reference (open it in a browser to compare; never copy its Google Fonts link, booking note, or overlay 404).

**What this feature builds and what it leaves**:

| Built here | Left to |
|---|---|
| Tokens, palette reset, base page styles, focus ring, anchor scroll rules | |
| Font loading | |
| `Base.astro` shell: skip link, `header` slot, `<main id="main">`, `footer` slot, `noindex` prop | |
| `btn-primary` and `btn-secondary` utilities, `BookCta` default style | |
| `Logo.astro` (SVG redraw) | Favicon and share image: feature 11 (they reuse this SVG) |
| Restyled `index.astro` and `404.astro` with a plain brand row (logo plus name) | Full header and nav: feature 6. Footer: feature 10 |
| `scripts/check-design.mjs` | |
| Root `design.md`, `docs/design/` | `AGENTS.md` pointer to `design.md`: `/sync` |
| `placeholder-line` and `note` tokens | Their use (About photo placeholder): feature 9 |

**Data model sketch**: no stored data. Two static sources feed the UI.

| Source | Shape | Rules |
|---|---|---|
| `@theme` in `src/styles/global.css` | `--color-*` (9 tokens, after `--color-*: initial`), `--text-*` with `--line-height` pairs, `--tracking-*`, `--radius-button`, `--container-site`, `--font-sans` | Only source of color. Values copied exactly from the handoff `tokens.css`. |
| `:root` in `global.css` | `--focus-ring-width` 2px, `--focus-ring-offset` 3px, `--target-min` 44px, `--button-height` 48px, `--z-skip-link` 50 | Not Tailwind tokens; plain CSS variables used by the base rules and utilities. `--header-height` is removed. |
| `site` in `src/content/site.ts` | adds `a11y.skipLink: string`; `home` becomes `{ eyebrow, heading, intro }`; `notFound` becomes `{ title, code, heading, body, homeLabel }` | All strings required. Curly punctuation (’ “ ”). |

New `site.ts` values:

| Key | Value |
|---|---|
| `a11y.skipLink` | `Skip to content` |
| `home.eyebrow` | `Hi, I’m Abed.` |
| `home.heading` | `I build AI automation, websites, and web apps for small businesses.` |
| `home.intro` | unchanged (feature 4 replaces it) |
| `notFound.code` | `404` |
| `notFound.heading` | `This page doesn’t exist.` |
| `notFound.body` | `The link may be broken, or the page may have moved.` |
| `notFound.title`, `notFound.homeLabel` | unchanged |

**Interface surface** (no HTTP API; these are the component and style contracts):

| Item | Contract |
|---|---|
| `Base.astro` props | `title?: string`, `description?: string` (unchanged), `noindex?: boolean` (adds `<meta name="robots" content="noindex">` when true) |
| `Base.astro` markup | `<body>`: skip link `<a href="#main">` first, then `<slot name="header" />`, then `<main id="main" tabindex="-1">` wrapping the default slot, then `<slot name="footer" />`, then the existing motion loader `<script>`. `<head>` adds the `<Font>` tag for the preload. |
| `Logo.astro` props | `class?: string`. Renders `<svg viewBox="0 0 80 34" aria-hidden="true" focusable="false" class="h-[34px] w-auto text-fg">` (the svg carries `text-fg` itself, so it works in any parent). A and D use `fill="currentColor"`; the brackets use the `fill-accent` class. No hex in the file. |
| `BookCta.astro` | Default class becomes `btn-primary`; a passed `class` is added alongside it, not instead of it. Still the only booking link renderer. |
| `@utility btn-primary` | Plain CSS only (an `@utility` body cannot hold classes like `hover:…`): `display: inline-flex; align-items: center; justify-content: center; width: 100%; min-height: var(--button-height); padding: 0 20px; border: 1px solid transparent; border-radius: var(--radius-button); background-color: var(--color-accent); color: var(--color-on-accent); font-size: 0.9375rem; font-weight: 700; text-decoration: none;` then `@variant sm { width: auto; }`, `@media (hover: hover) { &:hover { background-color: var(--color-accent-hover); } }`, `&:active { background-color: var(--color-accent-pressed); }`. No `transition`. The transparent border keeps the edge visible in Windows high contrast mode. |
| `@utility btn-secondary` | Same box declarations as primary, but `background-color: transparent; border-color: var(--color-fg); color: var(--color-fg);` and hover sets `border-color: var(--color-accent)`. No pressed color change. |
| `@utility site-wrap` | `margin-inline: auto; max-width: var(--container-site); padding-inline: 1rem;` and `@variant sm { padding-inline: 1.5rem; }`. Every section's inner container uses it. |
| Base layer rules | `body`: background `--color-bg`, color `--color-fg`, `--font-sans`, 16px, line height 1.6; `h1, h2`: `overflow-wrap: anywhere`; `a:focus-visible, button:focus-visible`: the focus ring; `main:focus, main:focus-visible`: `outline: none` (focus lands there from the skip link, it is not a control); `[id]`: `scroll-margin-top: 1rem`; smooth scroll inside `prefers-reduced-motion: no-preference` (kept from today). |
| Font config | `astro.config.mjs` `fonts` entry: provider `fontProviders.fontsource()`, name `Schibsted Grotesk`, `cssVariable: '--font-schibsted'`, weights `['400 700']`, styles `['normal']`, subsets `['latin']`, fallbacks `['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif']`, `optimizedFallbacks: true` (the size matched fallback). In `Base.astro` `<head>`: `<Font cssVariable="--font-schibsted" preload />` (from `astro:assets`). In CSS: `@theme inline { --font-sans: var(--font-schibsted); }`. After the build, confirm `dist/` holds one variable Latin font file, not separate 400 and 700 files; if it holds separate files, keep only the 400 file preloaded. Confirm the exact option names in the Astro docs at build time (the API is new). |
| `scripts/check-design.mjs` | `pnpm check:design`, added to `verify` before `build`. No dependencies. Exit 1 with a message naming the pair or the file and line. |

**Contrast pairs the script checks** (foreground on background, minimum ratio):

| Pair | Minimum | Approved value |
|---|---|---|
| `fg` on `bg` | 4.5 | 15.18 |
| `muted` on `bg` | 4.5 | 8.34 |
| `accent` on `bg` (focus ring, underline, secondary hover border) | 3.0 | 6.32 |
| `on-accent` on `accent` | 4.5 | 6.32 |
| `on-accent` on `accent-hover` | 4.5 | 7.46 |
| `on-accent` on `accent-pressed` | 4.5 | 5.05 |
| `bg` on `fg` (skip link) | 4.5 | 15.18 |
| `placeholder-line` on `bg` | 3.0 | 3.02 |

`line` on `bg` (1.48) is decorative and not checked. Ratios use the WCAG 2.2 relative luminance formula.

**Token parsing**: read the `@theme` block of `global.css`, take each `--color-<name>: #<hex>;` (3 or 6 hex digits, either letter case), ignoring CSS comments.

**Raw color scan rules**: scan `.astro`, `.ts`, and `.css` files under `src/components`, `src/layouts`, `src/pages`, `src/content`, with comments (`//`, `/* */`, `<!-- -->`) stripped first. Flag `#` followed by 3, 4, 6, or 8 hex digits and a word boundary, preceded by a character that is not a letter, digit, or `&`. Do not flag it when it is an anchor or reference: inside `href=`, `id=`, `for=`, any `aria-*=` value, `url(#…)`, or a quoted string whose first character is `#` followed by a letter (such as `'#about'` in `site.ts`). So `#about`, `#add`, and `&#39;` never trip it. Flag arbitrary color classes (`bg-[`, `text-[`, `border-[`, `outline-[`, `fill-[`, `stroke-[`, `decoration-[` followed by `#`, `rgb`, `hsl`, or `oklch`). Also flag `rgb(`, `hsl(`, `oklch(` in those folders. `src/styles/global.css` is the one allowed home for color values.

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Any page renders | every color | `@theme` tokens in `global.css` |
| Any page renders | font family | Astro fonts option, through `--font-sans` |
| Skip link | label "Skip to content" | `site.a11y.skipLink` |
| Skip link | target | the `<main id="main">` in `Base.astro` |
| Brand row | name | `site.name` |
| Brand row | logo | `Logo.astro` (decorative, no alt text) |
| Home | eyebrow, heading, intro | `site.home.eyebrow`, `site.home.heading` (handoff hero text), `site.home.intro` (unchanged until feature 4) |
| Home and 404 | hero and 404 spacing, widths | AC-8 (values from `docs/design/pages/home.md` and `404.md`) |
| Book button | label, URL | `site.cta.bookLabel`, `site.bookingUrl` |
| 404 | page title | `site.notFound.title` |
| 404 | "404" line, heading, body, button label | `site.notFound.code`, `.heading`, `.body`, `.homeLabel` |
| 404 | `noindex` | `noindex` prop on `Base`, set by `404.astro` |
| Contrast check | each ratio | computed from the `--color-*` values parsed out of `global.css`; pairs and minimums from the table above, held in the script |

**Key invariants**:
- Colors exist only in `global.css`. No hex, `rgb`, `hsl`, or `oklch` value and no arbitrary color class in components, layouts, or pages (AC-12 enforces it).
- Coral (`accent`) is a button fill, a line of at least 2px, or the focus ring. Never body text.
- `btn-primary` appears only through `BookCta.astro`. One filled button style on the site.
- Radius 6px on buttons only; no shadows, gradients, cards, pills, or icons in buttons.
- No content is hidden in CSS waiting for JavaScript. The skip link is hidden off screen by CSS until focused, which needs no script.
- Muted text is never smaller than 14px.
- Every link and button is at least 44px tall (both buttons and the skip link here; nav and footer links in features 6 and 10).

**Security model**: public static pages, no user data, no input. The font files are fetched at build time and served from the site's own domain, so visitors make no third party request (keeps the privacy notice simple and avoids cookies).

**Critical test scenarios**:
- Happy path: open `/` at 390px, press Tab once, see "Skip to content", press Enter, focus is in `<main>`; Tab again reaches "Book a Free Call" with a coral ring. Verifies AC-3, AC-4, AC-5.
- Layout: open `/` and a bad URL at 320, 390, 768, 1280px; no sideways scroll, button full width only below 640px, 404 shows code line, heading, body, outlined button. Verifies AC-6, AC-8, AC-9.
- Failure case: change `--color-muted` to `#6A645B` in `global.css` and run `pnpm check:design`; it fails naming `muted on bg`. Add `class="text-[#fff]"` to a component; it fails naming the file. Put `href="#about"` in a component; it passes. Verifies AC-12.
- No script: disable JavaScript; both pages read fully and the button opens the booking URL. In the network panel, every request goes to the site's own origin. Verifies AC-2, AC-11.
- Reduced motion: with reduced motion on, clicking an anchor jumps without smooth scrolling. Verifies AC-10.
- Palette reset: a temporary `bg-red-500` on an element renders no red. Verifies AC-1.

**Handoff file moves**:

| From `design-handoff/design-handoff/` | To |
|---|---|
| `design.md` | `design.md` (repo root), with the edits listed under Build plan step 1 |
| `tokens.css` | merged into `src/styles/global.css` (not kept as a file) |
| `handoff.md` | `docs/design/handoff.md` |
| `pages/home.md`, `pages/404.md` | `docs/design/pages/` |
| `prototype/abedautomation-prototype.html` | `docs/design/prototype/` |
| `assets/ad-monogram-transparent.png` | `src/assets/ad-monogram.png` (reference for the SVG; not imported by any page) |
| `assets/logo-original.png` | `docs/design/assets/logo-original.png` |

Then delete `design-handoff/`.

**Configuration required**: none. No environment variables or credentials.

## Build plan

Skateboard: the first three steps already give a usable, restyled page; each later step adds one piece on top, and the page stays shippable after every step.

1. Move the handoff files per *Handoff file moves*. Edit the root `design.md` for this spec's decisions: section 3 loads the font through Astro's fonts option (not the `@fontsource-variable` package) with a 400 to 700 range (drop the unused 500); section 4 says the header is static, not sticky; section 6 names `btn-primary`, `btn-secondary`, `site-wrap`, and `Logo.astro` (inline SVG); section 9 notes `pnpm check:design`. Search the moved `design.md` for `btn2`, `class="btn"`, `<img>`, `sticky`, `@fontsource`, and the "copy into global.css" sentence, and fix each; rewrite its links to `docs/design/`. In spec 0001, add a one line pointer to this spec under *Navigation without JavaScript* and tick its fonts follow up. Delete `design-handoff/`. Satisfies **AC-13**.
2. Rewrite `global.css`: `@theme` with `--color-*: initial` then the handoff tokens, `@theme inline` for `--font-sans`, the `:root` variables (drop `--header-height`), base layer body and heading styles, focus ring rule, `main:focus` rule, `[id]` scroll margin 1rem, smooth scroll kept inside the reduced motion query. Satisfies **AC-1**, **AC-4**, **AC-10**.
3. Add the `fonts` entry to `astro.config.mjs` and the `<Font>` tag to `Base.astro`. Rework `Base.astro` into the slot shell with the skip link and `noindex` prop. Add `a11y.skipLink`, `home.eyebrow`, the new `home.heading`, and the new `notFound` fields to `site.ts` (and its type). Satisfies **AC-2**, **AC-3**.
4. Add `@utility site-wrap`, `btn-primary`, `btn-secondary` to `global.css`; make `btn-primary` the `BookCta` default. Satisfies **AC-5**, **AC-6**.
5. Draw `Logo.astro` from `src/assets/ad-monogram.png` and show it to Abed for approval. Satisfies **AC-7**.
6. Restyle `index.astro` (brand row, eyebrow, heading, intro, button) and `404.astro` (handoff layout and copy, `noindex`). Remove their own `<main>` tags now that `Base` provides it. Satisfies **AC-8**, **AC-9**, **AC-11**.
7. Write `scripts/check-design.mjs`, add `"check:design"` to `package.json`, and put it in `verify` before `build`. Satisfies **AC-12**.
8. Check 320, 390, 768, 1280px, keyboard order, JavaScript off, reduced motion, and the network panel; then run `pnpm verify`. Satisfies **AC-9**, **AC-10**, **AC-11**, **AC-14**.

## Consequences

**Positive**:
- Features 6 to 12 build with named classes (`bg-bg`, `text-muted`, `btn-primary`, `site-wrap`) and cannot drift from the approved look without the check failing.
- A later color tweak that breaks contrast fails in CI, not in front of visitors.
- The font is fast and private: self hosted, preloaded, with a size matched fallback that limits layout shift.

**Negative / tradeoffs**:
- Astro's fonts option downloads the font from Fontsource during the build. If Fontsource is unreachable, the Netlify build fails (it does not ship a broken page). The npm package would have avoided that build time network step.
- Resetting Tailwind's palette means every new color needs a token, a contrast pair in the script, and a line in `design.md`. That friction is on purpose.
- The SVG logo is a hand redraw of an AI generated PNG, so it is close, not identical. Abed's approval is the gate.
- Until features 6 and 10 land, both pages have only a brand row: no nav, no footer.

**Neutral**:
- Spec 0001's plan for a `<details>` menu on small screens and a sticky header with header height scroll margin is replaced by the static two row header from the handoff. Spec 0001 carries a pointer to this spec.
- `Base.astro` now owns `<main>`; pages pass content into it instead of writing their own.

## Follow-up

- [ ] `/sync`: add `design.md` to root `AGENTS.md` (as the design source of truth) and note the `check:design` script in Commands.
- [ ] Feature 6 builds the header (logo, name, nav) into the `header` slot; feature 10 builds the footer into the `footer` slot. Both use `site-wrap` and the 44px target rule.
- [ ] Feature 11 makes the favicon (SVG, 32px and 180px PNG) and share image from `Logo.astro`'s SVG.
- [ ] Feature 9 uses `placeholder-line` and `text-note` for the photo placeholder, then deletes the `placeholder-line` token (and its contrast pair) once the real photo exists.
- [ ] Feature 16: confirm Netlify serves `404.astro` with HTTP status 404.
- [ ] Spec 0001 follow-up on Astro's fonts option is settled here; tick it there.
