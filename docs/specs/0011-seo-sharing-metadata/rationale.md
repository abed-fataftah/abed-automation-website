# 0011. SEO and sharing metadata: rationale

The build spec is [index.md](index.md). This file is the decision record: why, and what else was weighed.

## Context

The page is plain and readable but undersells itself to search and sharing. Its title is just `Abed Automation`, which tells a searcher nothing about the service, and its 67 character description leaves most of the space Google shows unused. It has no canonical address, so the `netlify.app` address and links with tracking parameters can count as separate pages. It has no Open Graph tags, so a shared link shows a bare URL or whatever the platform guesses. The favicon is still Astro's default logo, although `design.md` names the AD monogram for it.

Forces that shaped the choice:
- **Copy lives in one place.** `AGENTS.md` requires every line of copy in `src/content/site.ts`. A sharing image with words baked in is copy too.
- **Colors live in one place.** Spec 0003 and `check:design` forbid raw color values outside `global.css`, but an image renderer needs real values.
- **No third party requests, no runtime.** The site is static on Netlify Free with a strict CSP (feature 16); anything new must be a file on the site's own domain, made at build time.
- **One person, rarely changing.** A single page whose copy changes a few times a year; Abed maintains it alone, so a manual step that must be remembered is a real risk.
- **The font.** The site's Schibsted Grotesk is a variable WOFF2 from Astro's font loader, which image renderers like Satori cannot read.

## Options considered

### Option 1: Build time card with Satori plus sharp, tags from `site.ts` (chosen)

Static Astro endpoints draw `og.png` and the icons during `astro build` from `site.ts`, the tokens, and a static copy of the font; `Base.astro` renders all tags from `site.ts`.

**Pros**: text and colors cannot drift; no manual step; reuses sharp, which Astro already installs. **Cons**: one 0.x library (Satori) plus a second copy of the font; a little build time.

### Option 2: Script that writes a committed PNG

A small script, run by hand when copy changes, draws the card into `public/`.

**Pros**: no new build dependencies; the build stays as it is. **Cons**: the card silently goes stale when someone edits `site.ts` and forgets the script; a binary in git for each change.

### Option 3: Card made by hand in a design tool

Abed designs the card in Figma or Canva and commits the PNG.

**Pros**: full creative control, no code. **Cons**: card text lives outside `site.ts`, breaking the copy rule; colors and type can drift from the tokens; every copy change is design work.

### Option 4: Astro OG image integration (for example `astro-og-canvas`)

A community integration that renders cards from frontmatter with CanvasKit.

**Pros**: less code to write. **Cons**: built around content collections, which this site does not use; a heavier WASM renderer; another community package with its own release rhythm; less control over the exact layout.

## Rationale

Option 1 is the only one that honors both "copy in `site.ts`" and "colors in `global.css`" without a step a solo maintainer has to remember. Option 2 meets the rules on the day it runs and then fails quietly, the worst kind of failure for a one person site. Option 3 breaks the copy rule outright, and Option 4 brings more machinery than a single card needs.

Two choices inside Option 1 were made during the conversation:
- **sharp instead of resvg.** Satori draws text as shapes, so the SVG needs no font at render time and sharp (already present through Astro) rasterizes it correctly. That keeps one native image library in the tree instead of two.
- **Fontsource static WOFF for the card font.** Satori needs TTF, OTF, or WOFF, without variable axes. The Fontsource package is the same family, versioned and updated by Dependabot, so no font binaries are committed.

The other picks:
- **Title `Abed Automation · AI automation, websites, and web apps`.** It names the services in 54 characters, short enough to avoid truncation, and matches the existing `Page not found · Abed Automation` separator.
- **Description naming Abed and the free call.** It ties the brand to a person (one person, never a team) and gives a reason to click, in 121 characters. It reuses approved hero wording, so it adds no new claims.
- **Monogram, name, tagline, and domain on the card.** It reads at thumbnail size and needs no photo kept current; the domain shows where the link goes on platforms that hide it.
- **Update (2026-10-30): the full logo, centered.** Abed asked for the full logo (monogram over the AUTOMATION wordmark) on the card. The only source is `docs/design/assets/logo-original.png`, a 1254px raster whose background (`#181717`) and coral (`#fd6f58`) are close to, but not, the tokens (`#1a1816`, `#ff6b57`). Three sources were weighed: rebuild it as vectors (chosen: sharp at any size, exact token colors, the site's own font), embed the PNG (exact letterforms, but raster, a faint edge where the backgrounds differ, and it breaks the "colors from the tokens" rule), or wait for a vector export (most faithful, but blocks the card on a file that may not exist). Rebuilding keeps every earlier rule intact and leaves one file, `src/seo/wordmark.ts`, to swap if a real vector turns up. Centered matches how the logo was designed to sit; the coral rule is dropped because the logo already carries the accent. The full name leaves the card face but stays in the alt text, the title, and the page.
- **Monogram on a dark tile for icons.** The monogram's cream letters vanish on light tabs; a tile in the page background works everywhere, and the ICO and Apple icon cannot adapt to themes anyway.
- **Organization plus founder in JSON-LD.** It helps Google connect the business name to Abed. No address, because Abed works remotely, and no ratings or figures, because the brief forbids invented ones.
- **`@astrojs/sitemap`.** Barely needed for one URL today, but official, tiny, and correct the day a second page appears.
- **Canonical only on indexable pages.** The 404 page is already `noindex`; a canonical there would be contradictory.

Runner up overall: Option 2, if Satori ever becomes a maintenance burden; the same `src/seo/card.ts` could run from a script instead of an endpoint.

The decision was also checked against the installed community skills: `satori` sets the markup rules (flex on every container, explicit units, no HTML entities), `og-images` the 1200×630 size and layout pattern, and `seo-sitemap` the sitemap validation rules (absolute URLs, no noindex pages listed).
