# 0003. Design system and UI foundation: rationale

## Context

Every section of the site (features 6 to 12) and the later motion work (features 13 and 14) needs the same colors, type, spacing, buttons, and focus behavior. Without one shared base, each feature picks its own values, and the single page drifts into small inconsistencies that read as unprofessional, which matters for a one person business whose site is the first impression.

Abed has already done the design work. The handoff (`design-handoff/design-handoff/`) holds an approved direction (I2, "Charcoal coral, plainer"), a full `design.md`, a `tokens.css` in Tailwind v4 format, briefs for the home and 404 pages, a working prototype approved on Abed's own device, and the logo as an AI generated PNG. So the open question is not what the site looks like. It is how that design becomes code that the next features cannot accidentally break.

Forces at play:
- The stack is fixed by spec 0001: Astro 7, Tailwind 4 via `@tailwindcss/vite`, no UI framework, static output, nothing loaded from a third party on first load, no cookies, full readability with JavaScript off.
- The handoff demands contrast "computed by code" and bans raw color values in components. A rule written only in a document tends to get broken quietly.
- The handoff and spec 0001 disagree in two places: 0001 planned a sticky header and a `<details>` menu on small screens. The handoff (and the prototype) uses a static header on two rows with no menu.
- Spec 0001 left font loading open (Fontsource package, or Astro's built in fonts option once stable).
- The handoff folder sits in a public repo and includes a 1.2 MB image the site never uses.
- `BookCta.astro` must remain the only component that renders a booking link.

## Options considered

### Option 1: Tailwind tokens and utilities, built in Astro font loading, and a design check script

Copy the handoff tokens into Tailwind's `@theme` with the default palette reset, define the two buttons and the page container once as `@utility` classes, load the font through Astro's fonts option, redraw the logo as an inline SVG component, and add a dependency free script to `pnpm verify` that checks contrast pairs and scans components for raw colors.

**Pros**:
- One styling system. Tokens become Tailwind classes (`bg-bg`, `text-muted`), so components never need a color value.
- The palette reset and the script make the design rules enforceable, not just written down.
- The fonts option self hosts, preloads, and generates a size matched fallback font, which cuts layout shift.
- No new dependencies.

**Cons**:
- The fonts option is newer than the Fontsource package and fetches the font at build time, so a Fontsource outage fails the build.
- A small script to maintain, plus a short allow rule so anchor links like `#add` are not mistaken for colors.

### Option 2: Port the prototype stylesheet as is

Lift the prototype's CSS (`.btn`, `.wrap`, section rules) into a plain stylesheet and use Tailwind only for layout. Fonts through the `@fontsource-variable` package as the handoff suggested.

**Pros**:
- Fastest way to a pixel match, since that CSS is what Abed approved.
- The npm font package is pinned in the lockfile and needs no network at build.

**Cons**:
- Two styling systems in one small codebase; each new section must choose between them.
- The prototype CSS carries prototype only parts (Google Fonts link, booking note, overlay 404) that must be picked out by hand.
- Nothing stops raw colors or broken contrast later.

### Option 3: A component per style (`Button.astro` with variants), tokens as plain CSS variables

Keep tokens as CSS variables outside Tailwind's theme and wrap every styled element in an Astro component with props.

**Pros**:
- Each style has a typed API.

**Cons**:
- Tailwind cannot generate classes from tokens it does not know, so components fall back to `var(--color-...)` in arbitrary values.
- A `Button.astro` that renders links sits awkwardly next to the rule that `BookCta` is the only booking link renderer.
- More files for a site with two buttons.

## Rationale

Option 1 fits the forces best. The handoff `tokens.css` was already written in Tailwind v4 `@theme` format for this stack, so it drops in without translation. Resetting the default palette turns the handoff rule "no other colors without a new token" into something Tailwind enforces by itself. The check script covers what the palette reset cannot (contrast math and hex values typed into markup), and because CI runs `pnpm verify`, it guards every future feature for free. The `@utility` approach keeps one definition per button while leaving `BookCta.astro` as the only booking link renderer, which a `Button.astro` (Option 3) would muddy.

The prototype's appeal (Option 2) is speed, but its stylesheet is a review artifact with prototype only parts, and copying it creates a second styling system that every later feature has to reconcile. The tokens and the page briefs carry everything the prototype shows.

On fonts, Abed chose Astro's fonts option over the handoff's npm package suggestion. Both self host. The fonts option wins on layout shift (automatic fallback metrics) and on less hand written `<head>` code, at the cost of a build time fetch. That cost is acceptable for a site that deploys a few times a month: a failed build leaves the live site untouched. Runner up: `@fontsource-variable/schibsted-grotesk` 5.3.0, which is the fallback if the fonts option misbehaves.

The header conflict goes to the handoff: it is the newer, approved, device tested design, and a static two row header needs no JavaScript and no `<details>` menu, which is simpler than spec 0001's plan. Scroll margin drops from a header height variable to a fixed 16px because nothing covers the top of the window anymore.

Smaller calls made while writing:
- **Weight 500 dropped.** The handoff lists it, but no type role uses it and the prototype never sets it. With a variable font the range 400 to 700 is one file anyway. Runner up: keep 500 listed for later use.
- **Base owns `<main>` through slots.** It guarantees one `<main id="main">` per page for the skip link target. Runner up: each page writes its own `<main>`, which is easy to forget on a new page.
- **Transparent 1px border on the primary button.** Windows high contrast mode removes background fills; the border keeps the button's edge visible. Runner up: a `forced-colors` media query, which is more code for the same result.
- **`site-wrap` utility.** Every section repeats the same container and padding; one utility keeps the 1120px and 16/24px values in one place. Runner up: inline classes per section.
- **404 copy from the handoff now.** It matches the approved layout; feature 4 may still reword it.
- **Home hero text from the handoff now** ("Hi, I’m Abed." plus the hero heading), added after the cross check. Otherwise the brand row and the heading would both say "Abed Automation". The coral underline stays in feature 6.
- **Button utilities in plain CSS.** A Tailwind 4 `@utility` body cannot hold classes with variants, so hover, pressed, and the 640px width change are written as nested CSS (found by the cross check).
- **Monogram PNG kept in `src/assets/`** as the drawing reference, per Abed's choice. It is never imported, so it never ships.

## Handoff inventory

What the handoff contained, and what this spec does with each part:

| Handoff item | Used as |
|---|---|
| Direction I2, color roles, type scale, spacing, shape, components, do and do not list (`design.md`) | Root `design.md`, edited for this spec's decisions |
| Contrast table (`tokens.css`) | The pair table in `scripts/check-design.mjs` |
| Build order (`handoff.md` section 7) | Steps 1 to 4 here; steps 3 and 5 belong to features 6 to 12 |
| Acceptance checklist (`handoff.md` section 11) | Foundation items folded into AC-1 to AC-14; header, footer, section, booking, and launch items stay with features 5 to 16 |
| Open items (copy, tool list, About, photo, privacy wording, booking URL, email, share image) | Not this feature; they stay with features 4, 5, 7, 9, 11, 12 |
| Prototype only parts (booking note, overlay 404, Google Fonts link) | Not shipped |

## Conflicts with spec 0001, resolved

| Spec 0001 said | This spec | Why |
|---|---|---|
| Small screen nav in a `<details>`/`<summary>` menu | Static header, two rows below 640px, no menu | The approved design; works with no script and no extra control |
| Sticky header, `scroll-margin-top` equal to `--header-height` | Not sticky; `scroll-margin-top: 1rem`; `--header-height` removed | Nothing overlays the content anymore |
| Fonts via Fontsource packages, Astro fonts option as runner up | Astro fonts option with the Fontsource provider | Abed's pick; settles 0001's open follow-up |
