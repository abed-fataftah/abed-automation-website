# Design system: Abed Automation (abedautomation.com)

The source of truth for the look of the site. Token values live in the `@theme` block of `src/styles/global.css`; this file explains how to use them. Built by spec 0003 (`docs/specs/0003-design-system-ui-foundation/`). Page briefs: `docs/design/pages/home.md` and `docs/design/pages/404.md`. Visual reference: `docs/design/prototype/abedautomation-prototype.html` (open it in a browser; never copy its Google Fonts link, booking note, or overlay 404). Original handoff notes: `docs/design/handoff.md`. Stack: Astro 7, Tailwind v4, TypeScript, Netlify (spec 0001). Dark theme only. English only, left to right.

## 1. Principles
1. Plain and personal: one person, first person voice ("Hi, I’m Abed."). Never write "we", "our team", or any team wording.
2. Warm charcoal page, off-white text, one coral accent used in three places only: the main button, the hero underline, the focus ring.
3. Structure comes from 1px lines and spacing, never from boxes. No cards, no pills, no icons inside buttons, no arrows, no gradients, no shadows, no glow.
4. One main action on every page: "Book a Free Call", always opening `site.bookingUrl`.
5. Works with no JavaScript. Motion (Release 2) never changes layout and never blocks reading or booking.
6. Never invent testimonials, logos, figures, credentials, results, or prices.

## 2. Color roles
| Token | Value | Use | Contrast |
|---|---|---|---|
| `bg` | #1A1816 | Page background | base |
| `fg` | #F2EDE4 | Headings, body, secondary button text and border, nav hover | 15.18 on bg |
| `muted` | #B9B1A4 | Intro, descriptions, nav links, tools label, footer | 8.34 on bg |
| `line` | #3A3631 | 1px dividers only | 1.48, decorative |
| `accent` | #FF6B57 | Primary button fill, hero underline, focus ring | 6.32 on bg |
| `on-accent` | #1A1816 | Text on primary button | 6.32 on accent |
| `accent-hover` | #FF8571 | Primary button hover | 7.46 with on-accent |
| `accent-pressed` | #E85A47 | Primary button pressed | 5.05 with on-accent |
Rules: coral is a button fill or a line, never body text. Muted text is never smaller than 14px. No other colors may be added without a new token.

## 3. Typography
Family: Schibsted Grotesk (variable), sans-serif, self hosted through Astro's `fonts` option in `astro.config.mjs` (Fontsource provider, files downloaded at build time and served from the site's own domain), Latin subset, weight range 400 to 700, preloaded with `<Font cssVariable="--font-schibsted" preload />` in `Base.astro`, `font-display: swap`. Fallback stack: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif (with a size matched fallback). Weights used: 400 and 700. No other font.
| Role | Size / line | Weight | Tracking | Where |
|---|---|---|---|---|
| Hero title (h1) | 32px / 1.1 below 640px; 40px / 1.08 from 640px | 700 | −1px | Hero only |
| Final CTA title (h2) | 24px / 1.15 below 640px; 28px / 1.15 from 640px | 700 | −0.5px | Final CTA only |
| Section title (h2) | 20px / 1.25 | 700 | 0 | Services, About, Privacy |
| Body | 16px / 1.6 | 400 | 0 | About text, intro |
| Privacy subheading (h3) | 16px / 1.6 | 700 | 0 | Privacy notice topics only, in `fg` |
| Small | 14px / 1.5 | 400 | 0 | Nav, descriptions, tools line, footer, eyebrow |
| Note | 13px / 1.5 | 400 | 0 | Placeholder labels only |
| Brand name | 16px / 1.6 | 700 | 0 | Header |
| Button label | 15px | 700 | 0 | Both buttons |
Hero title max width 640px. Intro max width 460px. Use curly punctuation in all text: ’ “ ”.

## 4. Spacing and layout
Spacing: Tailwind scale, 1 unit = 4px, allowed steps 4, 8, 12, 16, 24, 32, 48, 64, 96.
Container: max 1120px, centered. Page padding 16px below 640px, 24px from 640px. Breakpoints: 640px and 1024px (Tailwind `sm` and `lg`). Mobile design width 390px; check 320px for sideways scroll.
Grid: one column. Services: 1 column below 640px, 2 equal columns from 640px. About: 1 column below 640px; 2 columns (heading across the top, text, photo) from 640px to 1023px; 3 columns `1fr 2fr 1fr`, gap 24px from 1024px.
Vertical rhythm: hero padding 48px (below 640px), 56px (640 to 1023px), 64px (1024px and up). About and final CTA padding 40px (below 640px), 48px (from 640px). Privacy padding 32px. Tools line padding 16px. Services padding 32px; from 640px each column has 24px side padding, the first column 0 on its left edge. Every section is separated by a 1px `line` border on top.
Header: static, not sticky. Below 640px logo and name on one row, nav links on a second row, gap 12px. From 640px one row, name left, nav right.

## 5. Shape
Radius: 6px on buttons only. All else 0. Borders: 1px `line` for dividers, 1px `fg` for the secondary button. Shadows: none. Focus ring: 2px solid `accent`, offset 3px, on `:focus-visible` for every link and button.

## 6. Components
| Component | Build | States and rules |
|---|---|---|
| Skip link | Custom `<a href="#main">` as the first element in `<body>` | Hidden off screen; visible on focus at top 8px, left 16px, fill `fg`, text `bg`, 700, padding 12px 16px, radius 6px, z-index 50. |
| Header | `<header>` with logo link and `<nav aria-label="Main">` | Logo link goes to `#top`. |
| Logo | `Logo.astro`: the AD monogram as an inline SVG, height 34px, width auto, `aria-hidden="true"` because the name sits next to it | A and D use `currentColor` (`fg`), the brackets use `fill-accent`. Redrawn from `src/assets/ad-monogram.png`. Favicon uses the monogram only (feature 11). |
| Nav link | `<a>` 14px `muted`, min height 44px, padding 0 8px | Default `muted`; hover `fg` + underline (offset 4px); pressed same as hover; focus ring; no disabled state. |
| Primary button | `BookCta.astro`, styled by the `btn-primary` utility (only ever through `BookCta`) | Height 48px, padding 0 20px, radius 6px, 15px 700 `on-accent` on `accent`. Default `accent`; hover `accent-hover`; pressed `accent-pressed` (colors fade over 150ms, section 11); focus ring; no disabled or loading state (it is a link). Full width below 640px, auto width from 640px. Opens the Cal.com page. |
| Secondary button | `<a class="btn-secondary">` | Height 48px, 1px `fg` border, text `fg`, same radius and padding. Default; hover border `accent`; focus ring. Used only on the 404 page. |
| Hero underline | `<u class="hero-underline" data-underline>` around "AI automation" | 3px `accent` stroke at the old 6px offset position, drawn by the `hero-underline` utility as a one color `linear-gradient` background (a flat stroke, allowed under principle 3: that rule bans visible color blends). Each wrapped line gets its own stroke. Forced colors fall back to a real 3px underline, offset 6px. Redraws on return to the hero (section 11). |
| Tools line | `<section id="tools">`: label in an inline `<p>`, names in an inline `<ul role="list">`, one `<li>` per `site.tools.items` entry | 14px, padding 16px top and bottom; label `muted`, items `fg`. Each " / " separator is written in the template inside an `aria-hidden="true"` span, `muted`, after every item but the last. Each name and its separator sit in one `whitespace-nowrap` span, so a wrapped line always starts with a name. Plain text only: no logos, icons, images, or links (spec 0006). |
| Service block | `<section>` with `<h2>` and `<p>` | No card, no icon. |
| About block | `<section id="about">` | Photo `src/assets/abed.png` through Astro `<Image>`, square, max 160px below 1024px, fills its column from 1024px, alt text in `site.about.photoAlt`. |
| Footer | `<footer>` | Copyright, mailto link, Privacy link (`/#privacy`, so it works from the 404 page too). Links min height 44px, same style. Below 640px stacked, gap 12px; from 640px one row, space between, the two links 24px apart. |
| Privacy notice | `PrivacyNotice.astro`: `<section id="privacy">` after the final CTA, `<h2>` then one `<h3>` and `<p>` per `site.privacy.sections` entry, then the `Last updated` line with a `<time>` | 1px `line` border on top, padding 32px top and bottom. Text *Small* in `muted`, max width 640px, 16px between topics. Every word from `site.privacy` (spec 0007); the date is formatted at build time (en-GB, UTC). |
| Inline link | `<a>` inside a sentence (privacy notice) | `fg`, underline, offset 4px; hover underline `accent`; focus ring. Same tab, plain `https://` or `mailto:` only. Exempt from the 44px rule (section 9). |
All components must be custom built; no UI library is used. Every section's inner container uses the `site-wrap` utility (max 1120px, 16px side padding, 24px from 640px). `Base.astro` provides the skip link, a `header` slot, `<main id="main">`, and a `footer` slot.

## 7. Patterns
Forms: none (no forms on this site). Validation, toasts and inline messages: none. Cards and grids: none; use dividers. Navigation: anchor links only (`#tools`, `#services`, `#about`, `#privacy`), each target has `scroll-margin-top: 16px`. Empty and error pages: only the 404 page (`src/pages/404.astro`): header, "404", title, one sentence, secondary button to `/`, footer. 404 nav links point to `/#tools`, `/#services`, `/#about`.

## 8. Right to left and languages
Not applicable: English only, left to right. Do not add language switching or `dir` handling.

## 9. Accessibility
- Contrast: all ratios in section 2; any new color pair must be checked by code first (4.5 for text, 3.0 for non-text). `pnpm check:design` (`scripts/check-design.mjs`, part of `pnpm verify`) recomputes every pair from `global.css` and fails on a drop; it also fails on a raw color value or arbitrary color class outside `global.css`. A new color means a token, a pair in the script, and a line in section 2.
- Every link and button is at least 44px tall; both buttons are 48px. The one exception is an inline link inside a sentence (privacy notice), which follows the WCAG 2.5.8 inline exception and keeps the focus ring.
- Tab order: skip link, logo, Tools, Services, About, hero button, footer email, footer Privacy (and the final CTA button, in page order).
- One `<h1>` per page. Landmarks: `<header>`, `<nav>`, `<main id="main">`, `<footer>`.
- The coral underline is decoration; the words carry the meaning.
- Motion: smooth scrolling on anchor links, scroll reveals, and hover fades are all off when `prefers-reduced-motion` is set (section 11). Focus inside a section that has not revealed yet shows it at once, and print always shows everything.

## 10. Do and do not
1. Do read every color from a token. Do not write a raw hex value in a component.
2. Do keep "Book a Free Call" as the only filled button. Do not add a second filled button.
3. Do use `site.bookingUrl` for every booking link. Do not type the URL anywhere else.
4. Do use lines and spacing for structure. Do not add cards, shadows, gradients, pills, or arrow icons.
5. Do write in first person singular. Do not write "we", "our team", or "our clients".
6. Do keep placeholders visible in square brackets until the real content exists. Do not ship a placeholder.
7. Do keep coral off body text. Do not use coral smaller than a 2px line unless it is a button fill.
8. Do check 320px, 390px, 768px, and 1280px for sideways scroll. Do not let wide content push the page sideways.
9. Do host fonts and images yourself. Do not load anything from a third party on first load.
10. Do add alt text to every informative image. Do not add prices, testimonials, client logos, or result claims.

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
| `data-reveal` | a section's content wrapper | one reveal group; fades up as a block unless it holds items |
| `data-reveal-item` | children of a `data-reveal` group | each item reveals on its own trigger, staggered when several trigger together; the wrapper then never animates |
| `data-line` plus the `section-line` utility | a section that has a top divider | the divider draws once (`--line-scale`); replaces `border-t border-line` |
| `data-underline` plus the `hero-underline` utility | the hero `<u>` | the replaying underline (`--underline-scale`) |

Rules:
- Nothing on screen when motion starts ever moves or disappears. Each target is judged by its own top edge, again after a resize across 640px.
- Animate only `opacity` and transforms (lines through `--line-scale` in a `scaleX`); the underline animates only `background-size`. Never `visibility`, `display`, `height`, `width`, `clip-path`, or anything that moves layout.
- Never hide content in CSS while waiting for JavaScript. CSS defaults (`--line-scale: 1`, `--underline-scale: 1`) always mean fully drawn, and an `@media print` rule forces every hook to its finished state.
- Off with reduced motion: GSAP never loads, hovers are instant, and turning reduced motion on mid visit returns the page to static at once.
- Focus moving into a group that has not revealed yet finishes that group and its line in the same frame.
- No scroll scrubbing, pinning, parallax, smooth scroll libraries, or GSAP driven hovers. No motion on the hero text, header, footer, or the 404 page.
- The header and footer lines, and the dividers between the service columns, stay plain static borders.

## 12. Hero scene
A decorative workflow graph beside the hero text (spec 0009): dots joined by 1px lines, flowing left to right, that sway gently while small dots travel along the lines like work moving through an automation. It carries no words and no meaning a visitor needs; the box is `aria-hidden`.

Placement: from 1024px the hero is two columns inside the 1120px container, text on the left, the scene box filling the right column, vertically centred. Below 1024px the box sits 32px under the hero button, full width up to 640px. The box has a fixed 16:10 aspect ratio, so nothing in it ever moves layout.

Two drawings, one source (`src/motion/graph.ts` holds the graph, the camera, and every value below):
- **Static SVG** (`HeroScene.astro`), inline in the HTML, drawn at build time. Everyone sees it first. Phones and tablets, and visitors with JavaScript off, reduced motion on, a slow connection, or no WebGL, only ever see this.
- **Live scene** (`src/motion/scene.ts`), desktop only (1024px and up when the loader checks). It fades in over the SVG in 300ms from the identical pose, then the SVG is hidden. Any failure (no WebGL, lost context, reduced motion turned on) puts the SVG back.

Look: nodes and travelling dots in `fg`, lines in `muted` at 45% opacity, 1 CSS px wide. Nothing else: no coral, no glow, gradient, shadow, or bloom. Print always shows the SVG.

Values (the `SCENE` object in `graph.ts` is the source; keep this table in step with it):

| Value | Setting |
|---|---|
| Sway | ±18° around the vertical axis, one full back and forth every 20s |
| Tilt | ±3° around the horizontal axis, every 26s |
| Frame rate | at most 30 fps; paused while the box is out of view or the tab is hidden |
| Node dot | 1.1% of the box width (about 6px at 536px) |
| Travelling dot | 0.8% of the box width; 1.2s per line whatever its length; first after 1s, then at least 1.6s apart; at most 2 at once; a random branch at each node |
| Crossfade | 300ms |

Rules:
- The scene is the hero's only motion besides the underline, and the agreed exception to "nothing on screen moves when motion starts": it starts from exactly the pose the SVG shows.
- No pointer, scroll, or touch reaction; no camera controls.
- Three.js loads only on desktop through the motion loader, and its download stays under the `check:bundle` budget.
