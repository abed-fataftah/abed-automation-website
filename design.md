# Design system: Abed Automation (abedautomation.com)

The source of truth for the look of the site. Token values live in the `@theme` block of `src/styles/global.css`; this file explains how to use them. Built by spec 0003 (`docs/specs/0003-design-system-ui-foundation/`) and updated by the homepage redesign, spec 0014 (`docs/specs/0014-homepage-redesign/`), which merged the approved handoff in `docs/design/handoff/` (read its `handoff.md` first; page files in `docs/design/handoff/pages/`). Layout truth for the homepage: the design board at https://claude.ai/artifact/2pUjxVjZaQLgffPYZY5fzL ("Homepage, desktop" at 1280 and "Homepage, phone" at 390), copied in `docs/design/handoff/reference/Main.dc.html` (reference only, never built). Older references (`docs/design/pages/`, `docs/design/prototype/`, `docs/design/handoff.md`) describe the first launch design and are kept for history. Stack: Astro 7, Tailwind v4, TypeScript, Cloudflare Pages. Dark theme only. English only, left to right.

## 1. Principles
1. **One person, plainly.** The page shows one developer, his face, and his real work, in first person ("Hi, I’m Abed."). Never "we", "our team", or any team wording. Never invented numbers, logos, or quotes.
2. **One bold element.** The dotted portrait in the hero is the only eye catching thing. Everything around it stays calm: flat dark surfaces, no gradients, no shadows, no glow. The redesign adds no new entrance animations (the existing spec 0008 reveals stay).
3. **Coral means "act" or "look here".** `accent` is only for booking buttons, the focus ring, the hero underline, step rules and numbers, and small category tags. It never fills a large area.
4. **Both services are equal.** Websites and web apps, and AI automation, always get the same structure, size, and weight.
5. **One main action:** booking the free call, always through `BookCta.astro` and `site.bookingUrl`.
6. **Works with no JavaScript.** Motion and the live portrait never change layout and never block reading or booking.
7. Plain English, short sentences, sentence case everywhere. Never: public prices, contact forms, placeholder text or links, all caps labels, arrows in button text, testimonials, client logos, or result claims.

## 2. Color roles
| Token | Value | Use | Contrast |
|---|---|---|---|
| `bg` | #1A1816 | Page background, pupils in the portrait | base |
| `surface` | #24211E | Service cards, Work image wells | fg 13.7, muted 7.5 |
| `fg` | #F2EDE4 | Headings, body, links, portrait dots | 15.18 on bg |
| `muted` | #B9B1A4 | Supporting text, nav links, footer | 8.34 on bg |
| `line` | #3A3631 | Section dividers, Work card and fact chip borders | 1.48, decorative only |
| `accent` | #FF6B57 | Buttons, focus ring, underline, step rules and numbers, tags | 6.32 on bg, 5.7 on surface |
| `on-accent` | #1A1816 | Text on coral buttons | 6.32 on accent |
| `accent-hover` | #FF8571 | Button hover | 7.46 with on-accent |
| `accent-pressed` | #E85A47 | Button pressed | 5.05 with on-accent |
| `portrait-sclera` | #CFC8BF | Eye whites in the portrait | canvas only |
Rules: coral may be text (step numbers, tags), so it is held to 4.5:1 on `bg` and `surface`. Muted text is never smaller than 14px. `line` is never the only boundary of a control. No other colors may be added without a new token. The handoff names `--color-text` and `--color-text-muted` are `fg` and `muted` here.

## 3. Typography
Family: Schibsted Grotesk (variable), self hosted through Astro's `fonts` option in `astro.config.mjs` (Fontsource provider, files downloaded at build time and served from the site's own domain), Latin subset, weights 400 to 700, preloaded with `<Font cssVariable="--font-schibsted" preload />` in `Base.astro`, `font-display: swap`. Fallback: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif (size matched). Weights used: 400 body, 500 text links, 600 card and step titles, labels, and buttons, 700 h1 and h2. No other font.

| Role | Token | Size | Weight | Line height | Tracking | Where |
|---|---|---|---|---|---|---|
| Hero h1 | `text-hero` | 34 to 56px | 700 | 1.08 | −0.02em | Hero headline, max width 18ch |
| CTA h2 | `text-cta-heading` | 30 to 44px | 700 | 1.12 | −0.015em | Final CTA heading, max width 20ch |
| Section h2 | `text-section` | 28 to 36px | 700 | 1.2 | −0.01em | Services, Work, How it works, About; also the h1 of `/privacy` and the 404 page |
| Card h3 | `text-card-title` | 22px | 600 | 1.3 | 0 | Service and Work card titles; privacy h2s |
| Step h3 | `text-step-title` | 20px | 600 | 1.3 | 0 | How it works titles |
| Lead | `text-lead` | 19px | 400 | 1.55 (hero), 1.6 (About) | 0 | Hero line (muted, max 34em), first About paragraph (`fg`) |
| Greeting | `text-greeting` | 18px | 400 | 1.5 (1.6 in the CTA) | 0 | "Hi, I’m Abed." (muted), final CTA paragraph (muted) |
| Body large | `text-body-lg` | 17px | 400 | 1.6 to 1.65 | 0 | Service body, second About paragraph, Work intro, privacy text, large buttons, text links |
| Body | `text-body` | 16px | 400 | 1.6 (lists 1.8) | 0 | Lists, card body, step body |
| Small | `text-small` | 15px | 400 (600 for labels) | 1.5 | 0 | Nav, "Good places to start" (600), fact chips, tools line, reassurance lines, header button, step numbers (600, coral) |
| Caption | `text-caption` | 14px | 400 (600 for categories) | 1.5 | 0 | Footer, Work category and "In progress" tag |
Use curly punctuation in all text: ’ “ ”.

## 4. Spacing and layout
- Container: `site-wrap` utility, max 1120px (`--container-site`), centered, side padding `--spacing-page-x` (20 to 48px).
- Sections: padding `py-section-y` (56 to 96px) top and bottom. The hero uses `pt-hero-top` (32 to 72px) on top and `pb-section-y` at the bottom.
- Every section after the hero has a 1px top divider in `line`, running full width (the `section-line` utility).
- Section h2 to content gap: 40px. The Work h2 has 12px to its intro line, then 40px to the cards.
- Gaps: hero columns 48px, About columns 48px, cards 24px, steps 32px vertical and 24px horizontal, fact chips 10px, header items 32px apart from 900px, nav links 24px.
- Breakpoints: `sm` 640px, `two-col` 900px (`--breakpoint-two-col`), `lg` 1024px. Check 320, 390, 768, and 1280 for sideways scroll.

| Area | Below 640px | 640 to 899px | 900 to 1023px | 1024px and up |
|---|---|---|---|---|
| Header | Row 1: logo and "Book a call". Row 2: nav links, wrapping | same | one row | one row |
| Hero | 1 column: text, then portrait (max 460px wide) | same | 2 columns: text grows from 440px, portrait grows from 320px to 460px | same |
| Services | 1 column | 1 column | 2 equal columns | same |
| Work | 1 column | 1 column | 2 equal columns; a lone card spans the row up to 720px | same |
| How it works | 1 column | 2 columns | 2 columns | 4 columns |
| About | 1 column: photo (max 300px), then text | same | photo 300px, text max 640px, top aligned | same |
| Footer | wraps to two rows | one row if it fits | one row: copyright left, links right | same |
The header is static, not sticky. Every in page target has `scroll-margin-top: 16px`.

## 5. Shape
- Radii: buttons `rounded-button` (8px); cards and the About photo `rounded-card` (12px); fact chips and the "In progress" tag `rounded-pill`; the hero underline is a flat stroke.
- Borders: 1px `line` on Work cards and fact chips (`pill border-line`); the "In progress" tag has a 1px `accent` border (`pill border-accent`). Service cards have no border; they use `surface`.
- Step rule: a 2px solid `accent` top border on each step (`step-rule`), square ends.
- Shadows: none. Gradients: none (the hero underline's one color gradient is a flat stroke).
- Focus ring: 2px solid `accent`, offset 3px, on `:focus-visible` for every link and button.

## 6. Components
All components are custom built; no UI library. `Base.astro` provides the skip link, a `header` slot, `<main id="main">`, and a `footer` slot. Every string comes from `src/content/site.ts`.

| Component | Build | Rules and states |
|---|---|---|
| Skip link | `<a href="#main">`, first element in `<body>` | Hidden off screen; visible on focus at top 8px, left 16px, fill `fg`, text `bg`, 700, padding 12px 16px, radius 8px, z-index 50. |
| Header | `SiteHeader.astro`: logo link, `<nav aria-label="Main">`, header booking button | Logo goes to `#top`. Nav: Services, Work (only when Work renders), How it works, About. On `/privacy` and the 404 page the links point to `/#…`. DOM order (logo, nav, button) is the tab order; below 900px the button sits on row 1 beside the logo. Below 390px the name "Abed Automation" is visually hidden (`sr-only`, still the link's accessible name), so the monogram and button fit on row 1 down to 320px. |
| Logo | `Logo.astro`: the AD monogram as an inline SVG, height 34px, `aria-hidden="true"` because the name sits next to it | A and D use `currentColor` (`fg`), the brackets `fill-accent`. Redrawn from `src/assets/ad-monogram.png`. Favicons and the sharing card use the same paths (`src/seo/monogram.ts`). |
| Nav link | `<a>` 15px `muted`, no underline, min height 44px | Hover `fg`; focus ring; no current state. |
| Booking button | `BookCta.astro` (the only component that renders a booking link), `btn-primary` utility | Large (default): 17px, 600, padding 12px 24px, min height 48px. Header (`size="header"`, adds `btn-header`): 15px, padding 10px 18px, min height 44px, label `site.nav.book`. Fill `accent`, text `on-accent`, radius 8px. Hover `accent-hover`; pressed `accent-pressed`; focus ring; no disabled or loading state (it is a link). Same tab. Carries `data-book-cta` and the Umami event with its `location`: `header`, `hero`, `final`, `not-found`. |
| Text link | `text-link` utility ("See my work", "Back to home", the 404 home link) | 17px, 500, `fg`, underline offset 5px, padding 12px 0 (44px target). Hover `accent`; focus ring. |
| Inline link | `inline-link` utility, inside a sentence (privacy notice, final CTA email) | `fg`, underline offset 4px; hover underline `accent`; focus ring. Exempt from the 44px rule (section 9). |
| Dotted portrait | `DottedPortrait.astro` plus `src/motion/portrait.ts` | See section 12. |
| Service card | `<article>` in `index.astro`, one markup path for both | `surface`, radius 12px, padding 32px: h3, body (12px gap), "Good places to start" `<p>` (600, 24px above, 8px below), bulleted `<ul>`. Static. |
| Work card | `<article>` in `index.astro`, only when `site.work.items` is not empty | 1px `line` border, radius 12px, clips its 16:10 image (`surface` well). Body padding 24px 28px 28px: category (14px, 600, coral), optional "In progress" tag, h3, body, optional GitHub text link. The card is not clickable; only its own link is. |
| "In progress" tag | `<p class="pill border-accent">` | 14px, coral, pill radius, padding 2px 10px. |
| Step | `<li class="step-rule">` inside `<ol role="list">` | Number (15px, 600, coral, `aria-hidden` because the list numbers it), h3, body. |
| Fact chip | `<li class="pill border-line">` | 15px, padding 8px 14px. |
| Tools line | One `<p>` in About | `site.tools.label` (600, `fg`) then `site.tools.items` joined with ", " (`muted`). Plain text only: no logos, icons, or links (spec 0006). |
| About photo | Astro `<Image>` of `src/assets/abed-about.jpg` | Max 300px wide, 4:5, radius 12px, alt `site.about.photoAlt`. |
| Profile links | `<ul>` of links in About, one per `site.about.profiles` entry | 15px `fg`, underline, min height 44px; none rendered when the list is empty. |
| Footer | `SiteFooter.astro` | Copyright (build year), mailto link, "Privacy" → `/privacy`. 14px `muted`; links min height 44px, 20px apart; hover `fg` with underline. |
| Privacy notice | `PrivacyNotice.astro` on `src/pages/privacy.astro` | Column max 680px. One h2 (22px, 600, 40px above) and paragraph (17px, line height 1.65, `muted`) per `site.privacy.sections` entry, then "Last updated" (15px) with a `<time>`, then "Back to home". Date formatted at build time (en-GB, UTC). |

## 7. Patterns
- **Forms:** none (ground rule). Booking happens on Cal.com. Validation, toasts, and inline messages: none.
- **Cards and grids:** two equal cards per row from 900px, one per row below. Card heights follow their content.
- **Lists:** "Good places to start" is a bulleted `<ul>`. Steps are an `<ol>`. Facts are a plain list.
- **Navigation:** in page anchors (`#services`, `#work`, `#how`, `#about`) and one booking button. Smooth scrolling only with reduced motion off.
- **Unfinished content:** never shipped. A block with no real content is left out of the build (the Work section, its nav link, and "See my work" all depend on `site.work.items`; profile links on `site.about.profiles`).
- **Pages:** `/` (home), `/privacy` (the notice, indexable, in the sitemap, no JSON-LD), and the 404 page (`noindex`; code, h1, one sentence, a large booking button and a home link in one row from 640px).

## 8. Right to left and languages
Not applicable: English only, left to right. Do not add language switching or `dir` handling.

## 9. Accessibility
- Contrast: all ratios in section 2. `pnpm check:design` (`scripts/check-design.mjs`, part of `pnpm verify`) recomputes every pair from `global.css` and fails on a drop; it also fails on a raw color value or arbitrary color class outside `global.css`. A new color means a token, a pair in the script, and a line in section 2.
- Every link and button is at least 44px tall; the large booking buttons are 48px. The one exception is an inline link inside a sentence, which follows the WCAG 2.5.8 inline exception and keeps the focus ring.
- Tab order: skip link, logo, nav links, header booking button, hero booking button, "See my work" (when Work renders), then content links in page order, then the footer links.
- One `<h1>` per page. Landmarks: `<header>`, `<nav aria-label="Main">`, `<main id="main">`, `<footer>`.
- The coral underline is decoration; the words carry the meaning.
- The portrait: the still image has alt `site.home.portraitAlt`; once the live canvas is drawn it carries `role="img"` with the same label (copied from the image), and the image leaves the accessibility tree, so the label is read once.
- Motion: smooth scrolling, scroll reveals, hover fades, and the live portrait are all off when `prefers-reduced-motion` is set (sections 11 and 12). Focus inside a section that has not revealed yet shows it at once, and print always shows everything.

## 10. Do and do not
1. Do read every color from a token. Do not write a raw hex value in a component.
2. Do read every booking link from `site.ts` through `BookCta`. Do not type the URL anywhere else.
3. Do keep both service cards identical in structure. Do not emphasize one service with color or size.
4. Do use coral only for actions and markers. Do not fill a section or card with coral.
5. Do show the still portrait first. Do not make the hero depend on JavaScript.
6. Do load the portrait code with a dynamic `import()`. Do not put it in the entry chunk.
7. Do not add effects to the portrait (dots gathering, coral spotlight, eyes closing, sand dots) unless Abed approves them. They were tried and left off.
8. Do leave a block out until its real content exists. Do not ship a `[BRACKETED]` placeholder.
9. Do write in first person singular and sentence case. Do not write "we", all caps labels, or arrows in button text.
10. Do host fonts and images yourself. Do not load anything from a third party on first load, and do not add shadows, gradients, or new entrance animations.

## 11. Motion
Quiet and editorial, on top of the finished static page (spec 0008). The page is complete with no JavaScript; motion only ever starts from a state the script sets itself.

Values (the `MOTION` object in `src/motion/gsap.ts` is the source; keep this table in step with it):

| Value | Setting |
|---|---|
| Reveal | opacity 0 to 1 and 16px up to rest (12px below 640px), 0.5s, `power2.out` |
| Reveal start | when the target's top reaches 85% of the viewport height (`top 85%`); plays once per visit |
| Stagger | 0.08s between items that trigger together (0.05s below 640px), in page order |
| Section line | grows from 0 to full width from the left, 0.6s, `power2.out`, once |
| Hero underline | grows from the left, 0.6s, `power2.out`, every time the hero comes back into view from above |
| Hover | `color`, `background-color`, `border-color`, `text-decoration-color` on every link, 150ms `ease-out`; the focus ring appears at once. CSS only, in `global.css` |

Hooks (data attributes in the markup; `gsap.ts` reads nothing else):

| Hook | Put it on | Effect |
|---|---|---|
| `data-reveal` | a section's content wrapper (every section after the hero) | one reveal group; fades up as a block unless it holds items |
| `data-reveal-item` | children of a `data-reveal` group (cards, steps, the About photo and text) | each item reveals on its own trigger, staggered when several trigger together; the wrapper then never animates |
| `data-line` plus the `section-line` utility | every section after the hero | the divider draws once (`--line-scale`) |
| `data-underline` plus the `hero-underline` utility | the hero `<u>` | the replaying underline (`--underline-scale`) |

Rules:
- Nothing on screen when motion starts ever moves or disappears. Each target is judged by its own top edge, again after a resize across 640px.
- Animate only `opacity` and transforms (lines through `--line-scale` in a `scaleX`); the underline animates only `background-size`. Never `visibility`, `display`, `height`, `width`, `clip-path`, or anything that moves layout.
- Never hide content in CSS while waiting for JavaScript. CSS defaults (`--line-scale: 1`, `--underline-scale: 1`) always mean fully drawn, and an `@media print` rule forces every hook to its finished state.
- Off with reduced motion: GSAP never loads, hovers are instant, the underline shows at full width, there is no smooth scrolling, and turning reduced motion on mid visit returns the page to static at once.
- Focus moving into a group that has not revealed yet finishes that group and its line in the same frame.
- No scroll scrubbing, pinning, parallax, smooth scroll libraries, or GSAP driven hovers. No motion on the hero text, header, footer, `/privacy`, or the 404 page.

## 12. Dotted portrait
A portrait of Abed drawn in dots beside the hero text (spec 0014), whose eyes and head follow the pointer. It is the page's one bold element.

Placement: from 900px the hero is two columns, text on the left (grows from 440px), the portrait square on the right (grows from 320px, max 460px), vertically centered. Below 900px the portrait sits under the hero text at full content width, max 460px.

Two layers, one look:
- **Still image** (`DottedPortrait.astro`): `<div data-portrait>` around an Astro `<Image>` of `src/assets/portrait-fallback.png` (920×920, transparent, served as PNG because the dots compress better than WebP), `loading="eager"`, `fetchpriority="high"`, with alt `site.home.portraitAlt`. Everyone sees it first. Visitors with JavaScript off, reduced motion on, Save Data, or a `2g` or `slow-2g` connection only ever see this. The server HTML never holds a canvas.
- **Live canvas** (`src/motion/portrait.ts`, data in `src/motion/portrait-dots.json`, both reached only through `import()` in `loader.ts` after `load` plus idle time, at every width). It is created over the image with the `portrait-canvas` class, draws the same pose, fades in over 300ms, then the still image steps back (opacity 0, out of the accessibility tree). Any failure (no 2D context, a color token missing, the chunk failing to load) leaves the image in place with one `console.warn`.

Look: dots in `fg`, eye whites in `portrait-sclera`, pupils in `bg`, read from the theme variables at start. No coral, glow, gradient, or shadow. Print always shows the still image.

Behavior (the `TUNING` object in `portrait.ts` holds every value, copied unchanged from the approved reference; change them only with Abed's approval):
- A mouse or pen anywhere on the page: the eyes look toward it (easing 0.22 per frame) and the head follows more slowly (0.09). The head turns up to 2.4% of the portrait width sideways and 2.6% up or down; the eye openings widen up to 22% looking up and narrow up to 30% looking down.
- The pointer leaving the window: it looks straight ahead.
- A touch tap: it looks at the tap for 1.6s, then straight ahead.
- Keyboard focus on any booking button (`[data-book-cta]`): the eyes look at it; focus leaving: straight ahead.
- It draws only while something moves and the canvas is on screen; when it settles, no animation frame loop runs.
- Reduced motion on at load: the module never downloads. Turned on mid visit: tracking stops, the canvas is removed, and the still image returns.
- `pnpm check:bundle` fails if the portrait module or its dots data is reachable from any chunk a page loads up front, or if its gzipped download goes over its budget.
