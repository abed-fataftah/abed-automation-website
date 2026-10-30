# Home
Route: `/` (file `src/pages/index.astro`, layout `src/layouts/Base.astro`)
Purpose: introduce Abed Automation, build trust, and send every visitor to the one Cal.com booking page.
Source in scope: features 6, 7, 8, 9, 10, 12 (copy is the deck in spec 0004; privacy wording is the deck in spec 0007)
Design direction: I2 "Charcoal coral, plainer", approved. Tokens in `design.md` and `tokens.css`.

## Content (exact copy)
The source of every line is the approved *Copy deck* in [spec 0004](../../specs/0004-site-copy/index.md), copied into `src/content/site.ts`. Do not copy text from here; read the deck. What the deck does not hold yet:

| Item | Note |
|---|---|
| hero heading underline | `home.heading.emphasis` ("AI automation") renders in `<u>`, with a 3px accent underline, offset 6px (feature 6) |
| tools.items | confirmed 2026-10-29, in order: n8n, OpenAI, Claude, TypeScript, React, Astro, Tailwind CSS, Node.js, PostgreSQL; plain text, no logos, no partnership wording; `check:copy` guards it ([spec 0006](../../specs/0006-tools-line/index.md)) |
| about.photo | photo of Abed plus alt text (feature 9) |
| privacy.body | six headed paragraphs plus a `Last updated` date, from the approved deck in [spec 0007](../../specs/0007-privacy-notice/index.md); h3 topics, inline links, no analytics wording until feature 15 |
| footer privacy link | `footer.privacyLabel`, links to `/#privacy` |
| booking URL | `site.bookingUrl` (one place only; every "Book a Free Call" reads it; opens the Cal.com page) |

## Layout
Desktop (1280): single column, container max 1120px, page padding 24px. Order: header, hero, tools line, services (2 equal columns, 1px divider), About (3-column grid 1fr 2fr 1fr, gap 24, heading / text / photo), final CTA, Privacy, footer. About and final CTA padding 48px top and bottom; hero padding 64px; Privacy padding 32px. Dividers: 1px `line` color between every section.
Hero (from 1024px): two columns inside the container (gap 24px), hero text on the left, the scene box (16:10, decorative workflow graph, `design.md` section 12) filling the right column, vertically centred. Below 1024px the box sits 32px under the hero button, full width up to 640px, static drawing only.
Tablet (768): same order. Services stay 2 columns. About becomes 2 columns (text, photo), heading above.
Mobile (390): page padding 16px. Header on two rows: logo and name, then the three links. Hero title 32px/1.1. Buttons full width, 48px tall. Services stacked with a 1px divider. About stacked; photo max width 160px. About and final CTA padding 40px; hero padding 48px. Footer items stacked.

## Components
| Element | Component | Variant / props | Notes |
|---|---|---|---|
| Logo | `<img>` or inline SVG | AD monogram, 34px high | Custom SVG redrawn from the PNG. Alt text empty when the name sits next to it. |
| Nav links | `<a href="#tools">`, `#services`, `#about` | muted, 14px | Hover: `fg` color + underline. Visible focus ring. |
| Book button | `<a class=btn>` | accent fill, `on-accent` text, 6px radius, min height 48 | States in `design.md`. Opens `site.bookingUrl`. Same component in hero and final CTA. |
| Tools line | `<section id="tools">` with inline `<p>` label and inline `<ul role="list">` | 14px muted, items `fg`, padding 16px | Plain text. " / " separators live in the template, `aria-hidden="true"`; names never break across lines. |
| Service block | `<section>` | h2 20px + 14px muted body | No card, no icon. |
| Hero scene | `HeroScene.astro` (`[data-scene]` box with an inline `<svg data-scene-fallback>`) | no props | `aria-hidden`, never focusable. Live Three.js canvas on desktop only (`src/motion/scene.ts`). Drawn from `src/motion/graph.ts`. |
| About photo | Astro `<Image>` | square, optimized, alt text | Dashed placeholder until the file exists. |

## Data
Static. All text from `src/content/site.ts`. The build fails if `bookingUrl` is the placeholder or not https (spec 0001).

## States
Loading: none, the page is static HTML. Empty and error: none on this page. Not found: see the 404 page file. Reduced motion: no motion code loads, hovers are instant, and the page is exactly the static layout.

## Motion hooks
Motion rules and values live in `design.md` section 11 (spec 0008). Each section carries these hooks:

| Section | `section-line` + `data-line` on | `data-reveal` on | `data-reveal-item` on |
|---|---|---|---|
| Hero | (no top line) | none | none; the `<u>` has `hero-underline` and `data-underline` |
| Tools | `<section id="tools">` | its `site-wrap` div | none |
| Services | `<div id="services">` | the inner grid `site-wrap` div | each of the two service `<section>` columns (their dividers stay plain borders) |
| About | `<section id="about">` | the inner grid div | the `<h2>`, each paragraph, and the photo |
| Final CTA | its `<section>` | its `site-wrap` div | none |
| Privacy | `<section id="privacy">` (in `PrivacyNotice.astro`) | its `site-wrap` div | none |

## Interactions
1. Click a nav link → page scrolls to that section (`#tools`, `#services`, `#about`); works with the keyboard (Tab, Enter).
2. Click "Book a Free Call" (hero or final CTA) → the Cal.com page for `site.bookingUrl` opens.
3. Click footer "Privacy" → scrolls to `#privacy`.
4. Click the footer email → opens the mail app with `mailto:abed@abedautomation.com`.
5. First Tab press shows a "Skip to content" link as the first focus stop; Enter jumps to `<main>`.

## Accessibility
One `<h1>` (hero title); sections use `<h2>`. Landmarks: `<header>`, `<nav aria-label="Main">`, `<main id="main">`, `<footer>`. Focus order follows visual order. Focus ring 2px accent, 3px offset. All targets at least 44px. Contrast ratios in `tokens.css`. The coral underline is decoration; meaning is also in the words.

## SEO
Title and description: from feature 11 (open). Share image rule: 1200 by 630, dark background, logo and name. Structured data: none until the facts are approved.

## Open items
Final copy (feature 4); verified tool names; About text, photo, alt text; privacy wording (feature 12); real booking URL (feature 5); confirm footer email; redrawn SVG logo; any social or GitHub links (verified only).
