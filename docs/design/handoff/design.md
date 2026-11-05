# Design: Abed Automation homepage redesign

This document holds the approved design for the redesigned homepage of abedautomation.com. It updates the root `design.md` from spec 0003. **Merge it into the existing root `design.md`; don't replace that file.** Keep every existing section this file doesn't cover, such as the logo, the social card, and the favicon. Where a value here is marked [APPROX] in `tokens.css`, the existing approved value wins.

Design board (source of truth for layout): https://claude.ai/artifact/2pUjxVjZaQLgffPYZY5fzL, boards "Homepage, desktop" (1280) and "Homepage, phone" (390). A copy of the board source is in `reference/Main.dc.html`.

## 1. Principles

- **One person, plainly.** The page shows one developer, his face, and his real work. Never "we." Never invented numbers, logos, or quotes.
- **One bold element.** The dotted portrait in the hero is the only eye-catching thing. Everything around it stays calm: flat dark surfaces, no gradients, no shadows, no scroll-triggered entrances added by this redesign.
- **Coral means "act" or "look here."** Coral (`--color-accent`) is only for booking buttons, the focus ring, the hero underline, step rules and numbers, and small category tags. It never fills large areas.
- **Both services are equal.** Websites and web apps, and AI automation, always get the same structure, size, and weight.
- **Plain English.** Short sentences, no jargon in headings, sentence case everywhere.
- **Never:** public prices, contact forms, placeholder text or links at launch, all-caps labels, `→` appended to button text.

## 2. Color roles

| Token | Value | Use | Contrast notes |
|---|---|---|---|
| `--color-bg` | `#1A1816` | Page background, pupils in the portrait | base |
| `--color-surface` | `#24211E` | Service cards, Work image wells | text 13.88:1, muted 7.22:1 |
| `--color-text` | `#F3EEE7` [APPROX] | Headings, body, links, portrait dots | 15.34:1 on bg |
| `--color-text-muted` | `#B5ADA3` [APPROX] | Supporting text, nav links, footer | 7.98:1 on bg |
| `--color-accent` | `#FF6B57` | Buttons, focus ring, underline, step rules, step numbers, tags | 6.32:1 on bg, so it's valid as text |
| `--color-accent-hover` | `#FF8574` [APPROX] | Button hover background | 7.47:1 with on-accent text |
| `--color-on-accent` | `#1A1816` | Text on coral buttons | 6.32:1 |
| `--color-line` | `#3A3530` | Section dividers, Work card border, fact chip border | decorative only |
| `--color-portrait-sclera` | `#CFC8BF` | Eye whites in the dotted portrait | canvas only |

## 3. Typography

English only, left to right. One family: **Schibsted Grotesk** (existing self-hosted font from spec 0003).

| Role | Size | Weight | Line height | Letter spacing | Where |
|---|---|---|---|---|---|
| Hero h1 | `--text-hero` (34 to 56px) | 700 | 1.08 | -0.02em | Hero headline, max width 18ch |
| CTA h2 | `--text-cta-heading` (30 to 44px) | 700 | 1.12 | -0.015em | "Have a website…" heading, max width 20ch |
| Section h2 | `--text-section` (28 to 36px) | 700 | 1.2 | -0.01em | Services, Work, How it works, About |
| Card h3 | 22px | 600 | 1.3 | 0 | Service and Work card titles |
| Step h3 | 20px | 600 | 1.3 | 0 | How it works titles |
| Lead | 19px | 400 | 1.55 (hero), 1.6 (About) | 0 | Hero supporting line (muted, max 34em), first About paragraph (text color) |
| Greeting | 18px | 400 | 1.5 | 0 | "Hi, I'm Abed." (muted), final CTA paragraph (muted, line height 1.6) |
| Body large | 17px | 400 | 1.6 to 1.65 | 0 | Service body, second About paragraph, Work intro |
| Body | 16px | 400 | 1.6 (lists 1.8) | 0 | Lists, card body, step body |
| Small | 15px | 400 (600 for labels) | 1.5 | 0 | Nav, "Good places to start" (600), tags (600), fact chips, tools line, reassurance lines |
| Caption | 14px | 400 | 1.5 | 0 | Footer |
| Step number | 15px | 600 | 1.5 | 0 | "1" to "4", coral |

## 4. Spacing and layout

- Content width: `--container-page` (1120px), centered.
- Side padding: `--spacing-page-x` (20 to 48px).
- Section padding top and bottom: `--spacing-section-y` (56 to 96px). The hero uses `--spacing-hero-top` on top and `--spacing-section-y` at the bottom.
- Every section after the hero has a 1px top border in `--color-line`, running full width.
- Section h2 to content gap: 40px. Exception: the Work h2 has a 12px gap to its intro line, then 40px to the cards.
- Gaps: hero columns 48px, About columns 48px, cards 24px, steps 32px vertical and 24px horizontal, fact chips 10px, header items 12px vertical and 32px horizontal, nav links 24px.

| Area | Below 640px | 640 to 899px | 900 to 1023px | 1024px and up |
|---|---|---|---|---|
| Hero | 1 column: text, then portrait (max 460px wide) | same | 2 columns: text grows, portrait 320 to 460px | same |
| Services | 1 column | 1 column | 2 equal columns | same |
| Work | 1 column | 1 column | 2 equal columns | same |
| How it works | 1 column | 2 columns | 2 columns | 4 columns |
| About | 1 column: photo (max 300px), then text | same | photo 300px, text max 640px | same |
| Header | Row 1: logo and "Book a call". Row 2: nav links, wrapping | same | one row | one row |

## 5. Shape

- Radii: buttons `--radius-button` (8px); cards and the About photo `--radius-card` (12px); fact chips and the "In progress" tag `--radius-pill`; the hero underline 2px.
- Borders: 1px solid `--color-line` on the Work cards and fact chips. The "In progress" tag has a 1px solid `--color-accent` border. Service cards have no border; they use `--color-surface`.
- Step rule: a 2px solid `--color-accent` top border on each step, square ends.
- Shadows: none. Gradients: none.
- Focus ring: 2px solid `--color-accent`, outline offset 3px, radius 4px, on every link and button (`:focus-visible`).

## 6. Components

There is no UI library. Use the existing Astro components and Tailwind classes.

| Component | Build | Variant and size | States |
|---|---|---|---|
| Booking button | Existing `BookCta.astro`; it reads the URL from `site.ts` and sets the Umami location attribute | Large: 17px, weight 600, padding 12px 24px, min height 48px. Header: 15px, padding 10px 18px, min height 44px. Background `--color-accent`, text `--color-on-accent`, radius 8px | Hover: background `--color-accent-hover`. Pressed: same as hover. Focus: focus ring. Disabled: never. Loading: none (plain link) |
| Text link "See my work" | Plain `<a href="#work">` | 17px, weight 500, `--color-text`, underline with 5px offset, padding 12px 0 (44px target) | Hover: `--color-accent`. Focus: focus ring |
| Nav link | Existing `SiteHeader.astro` | 15px, `--color-text-muted`, no underline, padding 12px 0 | Hover: `--color-text` (brighter, as on the current site). Focus: focus ring. Current section: none |
| Service card | `<article>` | Background `--color-surface`, radius 12px, padding 32px | Static |
| Work card | `<article>` | 1px `--color-line` border, radius 12px, clips its image. Image well 16:10. Body padding 24px 28px 28px | Static. Card isn't clickable; only its own links are |
| "In progress" tag | `<p>` or `<span>` | 13px, `--color-accent`, 1px coral border, pill radius, padding 2px 10px | Static |
| Step | `<li>` inside `<ol>` | 2px coral top rule, padding top 20px, number, h3, body | Static |
| Fact chip | `<li>` | 15px, 1px `--color-line` border, pill radius, padding 8px 14px | Static |
| Hero underline | `<span aria-hidden="true">` under "AI automation" | Height 0.07em, `--color-accent`, radius 2px, sits 0.02em above the bottom of the inline box | Draws once: existing GSAP underline from spec 0008, 700ms after a 300ms delay. Reduced motion: shown at full width, no animation |
| Dotted portrait | Custom: `reference/dotted-portrait.ts` on a `<canvas>` over `assets/portrait-fallback.png` | Square, width 100% of its column (320 to 460px) | No JavaScript: still fallback image. Loading: still fallback. Ready: canvas replaces the fallback. Data failure: fallback stays. Reduced motion: static frame, no tracking |

## 7. Patterns

- **Forms:** none on this site (ground rule). Booking happens on Cal.com.
- **Cards and grids:** two equal cards per row from 900px, one per row below. Card heights follow their content.
- **Lists:** "Good places to start" uses a bulleted `<ul>`. Steps use `<ol>`. Facts and tools are plain lists.
- **Navigation:** in-page anchors (`#services`, `#work`, `#how`, `#about`) and one booking button. Smooth scrolling only when reduced motion is off (existing behavior).
- **Error page:** the existing `404.astro`, restyled with these tokens (see `pages/404.md`).
- **Messages and toasts:** none.

## 8. Languages

English only, left to right. No right-to-left support and no language switch.

## 9. Accessibility

- Text contrast is at least 4.5:1 everywhere (see the table in `tokens.css`). Re-check it if an [APPROX] value changes.
- Every link and button is at least 44px tall, and the large booking buttons are 48px.
- Focus order follows the page: skip link, logo, nav links, header booking button, hero booking button, "See my work," then content links in order.
- The portrait canvas has `role="img"` and `aria-label="Portrait of Abed Fataftah drawn in dots"`. The fallback image uses the same text as its `alt`. The About photo alt is "Abed Fataftah, wearing a navy suit jacket over a dark shirt."
- The hero underline span is `aria-hidden="true"`; the heading text reads normally.
- **Motion:** the portrait only moves in response to the visitor (pointer, tap, or keyboard focus on a booking button). It stops drawing when it settles or scrolls off screen. With `prefers-reduced-motion: reduce`, the portrait is static and the underline shows without animation.

## 10. Do and do not

1. Do read every booking link from `site.ts` through `BookCta`. Don't hard-code the Cal.com URL.
2. Do keep all copy in `src/content/site.ts`. Don't write copy in components.
3. Do keep both service cards identical in structure. Don't emphasize one service with color or size.
4. Do use coral only for actions and markers. Don't fill a section or card with coral.
5. Do show the still portrait image first. Don't make the hero depend on JavaScript.
6. Do load the portrait code with a dynamic `import()`. Don't put it in the entry chunk.
7. Don't add effects to the portrait (dots gathering, coral spotlight, eyes closing, sand dots) unless Abed approves them. They were tried and left off.
8. Don't ship any `[BRACKETED]` placeholder. Hide a block until its real content exists.
9. Do use sentence case. Don't use all-caps labels or `→` in button text.
10. Don't add shadows, gradients, or new entrance animations.
