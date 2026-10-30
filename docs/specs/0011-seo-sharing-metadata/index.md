# 0011. SEO and sharing metadata: search copy, a build time social card, monogram icons, JSON-LD, sitemap

**Date**: 2026-10-30
**Updated**: 2026-10-30, the card shows the full logo (monogram over the AUTOMATION wordmark), centered
**Status**: In Progress

## Summary

The home page gets a clearer search title and description, a canonical address, and Open Graph and Twitter tags, so it reads well in Google and looks right when shared. The sharing card (the 1200×630 image link previews show) shows the full Abed Automation logo, the AD monogram over the AUTOMATION wordmark with its network O, centered above the tagline. It is drawn at build time from `site.ts`, the logo drawing, and the design tokens with Satori (a library that turns layout markup into an SVG image) and sharp (Astro's image library, which turns that SVG into a PNG), so its text can never drift from the copy. The Astro default favicon is replaced with the AD monogram on a dark tile, drawn the same way. A small JSON-LD block (structured data Google reads, which browsers never run) names Abed Automation and its founder, and `@astrojs/sitemap` publishes a sitemap that `robots.txt` points to.

## Requirements

**User stories**:
- As someone searching for help with automation or a website, I want the result to say what Abed does, so that I know whether to click.
- As someone who receives the link in LinkedIn, WhatsApp, Slack, or X, I want a clean branded preview, so that the link looks trustworthy.
- As Abed, I want every word on the card and in the metadata to come from `site.ts`, so that one edit updates everything.

**Acceptance criteria**:
- **AC-1**: The home page `<title>` is `site.meta.title`, exactly `Abed Automation · AI automation, websites, and web apps`, and its `<meta name="description">` is `site.meta.description`, exactly `Abed Fataftah builds AI automation, websites, and custom web apps for small businesses. Start with a free 30 minute call.` The 404 page keeps `Page not found · Abed Automation` and its `noindex`.
- **AC-2**: The home page has exactly one `<link rel="canonical" href="https://abedautomation.com/">`, built from `site` in `astro.config.mjs`. The 404 page has no canonical tag. A deploy preview still points its canonical at `https://abedautomation.com/`.
- **AC-3**: Every page has `og:type` (`website`), `og:site_name` (`site.name`), `og:title` and `og:description` (the page's title and description; the 404 page keeps inheriting `site.meta.description`), `og:image` (`https://abedautomation.com/og.png`), `og:image:width` `1200`, `og:image:height` `630`, `og:image:type` `image/png`, `og:image:alt` (`site.meta.card.alt`), `twitter:card` `summary_large_image`, and `twitter:image:alt` (`site.meta.card.alt`; X reads this rather than `og:image:alt`, and falls back to Open Graph for title, description, and image). The home page also has `og:url` equal to its canonical; the 404 page has none.
- **AC-4**: The build writes `dist/og.png`, a 1200×630 PNG under 200 KB, showing (top to bottom, centered horizontally) the full logo, `site.meta.card.tagline`, and at the bottom the hostname of `site` (`abedautomation.com`). The full logo is the AD monogram above the wordmark `AUTOMATION`, whose `O` is the network O (a ring with a coral line and three coral nodes), all drawn as vectors, never embedded from `logo-original.png`. Text is set in Schibsted Grotesk; every color is read from the `--color-*` tokens in `src/styles/global.css`. Changing `site.meta.card.tagline` and rebuilding changes the image with no other edit. `site.name` is not drawn as text on the card; it stays in `og:image:alt`.
- **AC-5**: The build writes `dist/favicon.svg` (the monogram on a rounded `bg` tile), `dist/favicon.ico` (a valid ICO holding one 48×48 PNG of the rounded art), and `dist/apple-touch-icon.png` (180×180, the same art on a full square tile with no rounding or transparency, since iOS paints transparent corners black). Both PNGs are sharp at their size (drawn at that size, not scaled up from a smaller one). The head links all three. Astro's default favicon files are gone from `public/`. The icon stays readable on both a light and a dark browser tab.
- **AC-6**: The home page has exactly one `<script type="application/ld+json">` describing an `Organization` (`site.name`, the canonical URL, a logo, `site.footer.email`, founder) and a `Person` (`site.meta.founder`) linked to each other by `@id`. Google's Rich Results Test or the schema.org validator reports no errors. The 404 page has none. The Content Security Policy logs no violation for it.
- **AC-7**: The build writes `dist/sitemap-index.xml` and one child sitemap listing exactly `https://abedautomation.com/`. The 404 page and the image and icon files are not listed. `dist/robots.txt` allows everything and ends with `Sitemap: https://abedautomation.com/sitemap-index.xml`.
- **AC-8**: `dist/index.html` and `dist/404.html` each have exactly one `<h1>`, and heading levels never skip (no `<h3>` before an `<h2>`, and so on), counting every heading in the page (the privacy notice included) and ignoring anything inside `<script>` or `<template>`.
- **AC-9**: `pnpm check:seo` (new, part of `pnpm verify`) checks AC-1 to AC-8 against `dist/` and fails with a named reason on any miss. `pnpm verify` exits clean, `check:design` still finds no raw color outside `global.css`, and the page still makes no new request at runtime (everything new is a file on the site's own domain).
- **AC-10**: After feature 16 puts the site live, pasting `https://abedautomation.com/` into LinkedIn's Post Inspector and a WhatsApp or Slack message shows the card, title, and description.

## Decision

**Chosen option**: Option 1: metadata from `site.ts` in `Base.astro`, with the card and icons rendered at build time by static Astro endpoints using Satori plus sharp, plus JSON-LD and `@astrojs/sitemap`.

Search and sharing tags live in the shared layout and read only from `site.ts` and the Astro `site` setting; images are produced during `astro build`, never by hand and never at request time.

**Implementation skills**: `satori` (`usenotra/skills`, `.claude/skills/satori/`) · `og-images` (`richtabor/agent-skills`, `.claude/skills/og-images/`; written for Next.js `next/og`, so use only its layout and font advice, not its file conventions) · `seo-sitemap` (`agricidaniel/claude-seo`, `.claude/skills/seo-sitemap/`; its analysis helper script is not installed, so use only its validation rules) · `seo` (`addyosmani/web-quality-skills`, `.claude/skills/seo/`) · `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**: no stored data. New and changed fields in `SiteContent` (`src/content/site.ts`), all copy, all approved in this spec:

| Field | Type | Value |
|---|---|---|
| `meta.title` (changed) | string | `Abed Automation · AI automation, websites, and web apps` |
| `meta.description` (changed) | string | `Abed Fataftah builds AI automation, websites, and custom web apps for small businesses. Start with a free 30 minute call.` |
| `meta.founder` (new) | string | `Abed Fataftah` |
| `meta.card.tagline` (new) | string | `AI automation, websites, and web apps for small businesses.` |
| `meta.card.alt` (new) | string | `Abed Automation: AI automation, websites, and web apps for small businesses.` |

Reused unchanged: `site.name` (`Abed Automation`), `site.footer.email`, `site.notFound.title`.

**State transitions**: none.

**API surface** (static files written at build; Astro endpoints in `src/pages/`, all prerendered, none run on Netlify):

| File (endpoint) | Method | Key inputs | Output | Auth | Key errors |
|---|---|---|---|---|---|
| `/og.png` (`src/pages/og.png.ts`) | GET at build | `site.name`, `site.meta.card.tagline`, `context.site`, tokens, two font files, monogram | 1200×630 `image/png` | public | missing font or Satori error fails the build |
| `/favicon.svg` (`src/pages/favicon.svg.ts`) | GET at build | monogram, tokens | `image/svg+xml`, rounded tile | public | none |
| `/favicon.ico` (`src/pages/favicon.ico.ts`) | GET at build | the rounded icon SVG | ICO wrapping one 48×48 PNG | public | sharp error fails the build |
| `/apple-touch-icon.png` (`src/pages/apple-touch-icon.png.ts`) | GET at build | the square icon SVG | 180×180 `image/png` | public | sharp error fails the build |
| `/robots.txt` (`src/pages/robots.txt.ts`) | GET at build | `context.site` | `text/plain`, `User-agent: *`, `Allow: /`, `Sitemap:` line | public | none |

Each endpoint exports `GET: APIRoute` and returns `new Response(body, { headers: { 'Content-Type': … } })`; static output prerenders them with no extra flag. Endpoints read the site URL from the endpoint context (`context.site`), never from env inside shared helpers.
| `/sitemap-index.xml`, `/sitemap-0.xml` | written by `@astrojs/sitemap` | `site` setting, built pages | XML | public | none |
| `Base.astro` head | render | `title`, `description`, `noindex` props; `Astro.url`, `Astro.site` | the tags in AC-1 to AC-3, AC-5, AC-6 | public | none |

Shared build helpers in a new `src/seo/` folder (build only; nothing here reaches the browser). Astro bundles endpoint code into temporary chunks, so file reads never use paths relative to `import.meta.url`; they resolve from `process.cwd()` (the project root during `astro build`). `satori` and `sharp` stay external packages (the default for `node_modules` in a static build).
- `src/seo/tokens.ts`: reads `--color-bg`, `--color-fg`, `--color-muted`, `--color-accent` from `path.resolve(process.cwd(), 'src/styles/global.css')` with a regex at build and throws naming any token it cannot find. This keeps every hex value in `global.css` (spec 0003).
- `src/seo/monogram.ts`: exports only the two monogram path strings (`letters`, `brackets`), the `viewBox` (`0 0 68.82 34`), and its natural `width` and `height`, with no colors. `Logo.astro` imports the paths instead of holding its own copy and keeps its own coloring (`currentColor` and `fill-accent`), so the header looks unchanged. The icon and card builders apply colors from the tokens.
- `src/seo/icon.ts`: `iconSvg({ rounded, size })` builds the icon SVG string with `width` and `height` set to `size` and a 64×64 `viewBox`: a square in `bg` (`rx` 12 when `rounded`, none otherwise), the monogram 52 units wide, centered horizontally at x 6 and vertically at y `(64 - 52 × 34 / 68.82) / 2` (about 19.15), letters in `fg`, brackets in `accent`. Setting `width` and `height` to the target size makes sharp draw it at that size instead of scaling up a 64px image. `favicon.svg` uses `{ rounded: true, size: 64 }`, the ICO `{ rounded: true, size: 48 }`, the Apple icon and JSON-LD logo `{ rounded: false, size: 180 }`.
- `src/seo/ico.ts`: wraps one PNG in an ICO file: a 6 byte header (reserved 0, type 1, count 1), one 16 byte entry (width 48, height 48, colors 0, reserved 0, planes 1, bit depth 32, PNG byte length, offset 22), then the PNG bytes. All numbers little endian.
- `src/seo/wordmark.ts`: the wordmark part of the logo, no colors: `before` (`AUTOMATI`) and `after` (`N`), the letters on each side of the network O, plus the network O drawing in a `0 0 100 100` box: `ring` (circle center 50 50, radius 38, stroke width 14), `link` (a line from 24 74 to 78 30, stroke width 6), and `nodes` (circles at 24 74 radius 13, 51 52 radius 7, 78 30 radius 13). The letters are part of the logo artwork, like the monogram paths, so they live here and not in `site.ts`.
- `src/seo/card.ts`: `renderCard({ tagline, hostname })` builds the Satori element tree as plain `{ type, props }` objects (no React or JSX), loads the fonts, calls Satori, and returns the PNG via sharp. It reads no env; the endpoint passes `hostname` from `context.site`. It also exports `CARD_WIDTH` (1200) and `CARD_HEIGHT` (630).

**Card layout** (1200×630, follows the `satori` skill: every container `display: 'flex'`, explicit units, `flexDirection: 'column'`), modeled on `docs/design/assets/logo-original.png`:
- Root: background `bg`, `boxSizing: 'border-box'`, explicit 1200×630px, padding 80px, a column with `alignItems: 'center'`.
- Main group (`flexGrow: 1`, `justifyContent: 'center'`, `alignItems: 'center'`), the logo then the tagline:
  - The monogram as an inline `svg` element in the tree (`{ type: 'svg', props: { viewBox, width: 300, height: 148, children: [two path elements] } }`, letters `fg`, brackets `accent`), not an `<img>` data URI, which nests one SVG inside another and renders unreliably in sharp.
  - 20px gap, then the wordmark as one row (`flexDirection: 'row'`, `alignItems: 'center'`): `before` as text, the network O as an inline `svg` (`viewBox: '0 0 100 100'`), `after` as text. Text at 48px weight 700 `fg`, letter spacing `0.04em`, line height 1. The O's width and height equal the cap height of Schibsted Grotesk at that size (about 34px; measure it once at build time by eye and fix the number in `card.ts`), with the same letter spacing gap on each side. Ring stroke `fg`, link and nodes `accent`, each node with a `bg` stroke of width 5 so it cuts the ring as in the original. The finished wordmark is about as wide as the monogram (within 15%), as in the original.
  - 44px gap, then `site.meta.card.tagline` at 36px weight 400 `muted`, centered (`textAlign: 'center'`), `maxWidth` 760px, `textWrap: 'balance'` (if the installed Satori rejects `balance`, drop it and keep the `maxWidth`).
- Bottom: the hostname passed in, at 26px weight 400 `muted`, centered.
- No coral rule (the logo carries the accent), no gradients, shadows, cards, pills, or icons beyond the logo (`design.md` section 10).
- Fonts: `@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-400-normal.woff` and `...-latin-700-normal.woff`, resolved with `createRequire(path.join(process.cwd(), 'package.json')).resolve(…)` and read with `node:fs`; passed to Satori as `{ name: 'Schibsted Grotesk', weight: 400 | 700, style: 'normal' }`.
- PNG: `sharp(svg).png({ palette: true })`, which keeps a flat card well under 200 KB.

**Head tags in `Base.astro`** (in this order, after the description):
- `canonical` = `new URL(Astro.url.pathname, Astro.site)`, rendered only when `noindex` is false. With two pages this means the home page only.
- Open Graph and Twitter tags per AC-3 (`property=` on `og:*`, `name=` on `twitter:*`); `og:url` only alongside the canonical. `og:image` = `new URL('/og.png', Astro.site)`.
- Icons: `<link rel="icon" href="/favicon.ico" sizes="any">`, `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`. These replace the two existing icon links.
- JSON-LD, only when `noindex` is false: `<script type="application/ld+json" is:inline set:html={json} />`, where `json` is `JSON.stringify({ "@context": "https://schema.org", "@graph": [organization, person] }).replace(/</g, '\\u003c')` (the six character escape, so no value can close the script tag). Type is `Organization`, not `ProfessionalService` (that type expects an address). The two nodes:
  - `{ "@type": "Organization", "@id": "<canonical>#organization", "name": site.name, "url": <canonical>, "logo": <site>/apple-touch-icon.png, "email": site.footer.email, "founder": { "@id": "<canonical>#founder" } }`
  - `{ "@type": "Person", "@id": "<canonical>#founder", "name": site.meta.founder, "url": <canonical>, "worksFor": { "@id": "<canonical>#organization" } }`
  - No address, phone, `sameAs`, ratings, or prices (the brief bans invented figures; no social profiles are verified yet).

**Sitemap**: add `@astrojs/sitemap` to `integrations` in `astro.config.mjs` with no options; it skips the 404 page and non HTML endpoints on its own. Delete `public/robots.txt` in favor of the endpoint above.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Head render | page title, description | `Base` props, defaulting to `site.meta.title`, `site.meta.description` (404 passes `site.notFound.title` and inherits the description) |
| Head render | `og:image:alt`, `twitter:image:alt` | `site.meta.card.alt` |
| Head render | canonical URL, `og:url`, JSON-LD URLs | `Astro.url.pathname` resolved against `Astro.site` (`site` in `astro.config.mjs`) |
| Head render | whether canonical, `og:url`, JSON-LD render | the existing `noindex` prop (false on home, true on 404) |
| Head render | `og:site_name`, Organization name | `site.name` |
| Head render | `og:image` URL, logo URL | fixed paths `/og.png`, `/apple-touch-icon.png` resolved against `Astro.site` |
| Head render | `og:image:width`, `height`, `type` | constants 1200, 630, `image/png`, exported from `src/seo/card.ts` and used by both the endpoint and the head |
| Head render | `og:image:alt` | `site.meta.card.alt` |
| Head render | Organization email, Person name | `site.footer.email`, `site.meta.founder` |
| Card render | tagline | `site.meta.card.tagline` |
| Card render | wordmark letters, network O shape | `src/seo/wordmark.ts` (logo artwork, not copy) |
| Card render | hostname | `context.site.hostname` in the `og.png` endpoint, passed to `renderCard` |
| Icon render | pixel size, rounding | the `size` and `rounded` arguments each endpoint passes to `iconSvg` |
| `check:seo` | expected title, description, alt, founder, email | `site` imported from `src/content/site.ts` (as `scripts/check-copy.mjs` does) |
| `check:seo` | expected origin | default export of `astro.config.mjs`, its `.site` |
| Card and icon render | colors | `--color-bg`, `--color-fg`, `--color-muted`, `--color-accent` read from `src/styles/global.css` by `src/seo/tokens.ts` |
| Card render | font data | `@fontsource/schibsted-grotesk` 400 and 700 latin WOFF files |
| Card and icon render | monogram shape | `src/seo/monogram.ts` (moved out of `Logo.astro`) |
| Robots render | sitemap URL | `new URL('/sitemap-index.xml', context.site)` |
| Sitemap | listed URLs | built pages, filtered by `@astrojs/sitemap` |

**Key invariants**:
- No copy outside `site.ts`: every visible word in the head, the card, and JSON-LD reads from `site` (AGENTS.md rule). The hostname is configuration, read from the `site` setting. The wordmark `AUTOMATION` is logo artwork, kept in `src/seo/wordmark.ts` beside the monogram, not copy.
- No hex value outside `global.css`; card and icon colors are read from the tokens at build.
- Every image, icon, and sitemap is a static file on the site's own domain; nothing is fetched from another host at build or at runtime.
- One canonical address, `https://abedautomation.com/`, on every deploy, previews included (previews stay out of search through their `noindex` header).
- A failure while drawing the card or icons fails the build; there is no fallback image.
- The header logo, the icons, and the card share one monogram drawing. The card's full logo is built from vectors and token colors only; `logo-original.png` is a reference, never shipped or embedded.
- A file in `public/` and an endpoint must never claim the same path: `public/favicon.svg`, `public/favicon.ico`, and `public/robots.txt` are deleted in the same commit that adds their endpoints.
- `check:design` scans `src/seo/` too, so no hex literal can hide there.

**Security model**: public static files only; no secrets, no user data. JSON-LD carries only public facts already on the page (name, URL, the footer email). The `<` escape stops any value from breaking out of the script tag. The existing CSP (`netlify.toml`) needs no change: `application/ld+json` is a data block browsers do not run, and every new image is `'self'`.

**Configuration required**: none. New packages: `satori` `^0.63.2`, `@fontsource/schibsted-grotesk` `^5.3.0` (dev dependency), `@astrojs/sitemap` `^3.7.4` (declares no Astro peer range; 3.x is the line current with Astro 7), and `sharp` `0.35.5` as a direct dependency, exactly the version Astro already installs, so there is still only one copy. If pnpm's minimum release age blocks one, add that exact `package@version` to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`, as was done for `astro@7.4.3`.

**Critical test scenarios**:
- Happy path: `pnpm build`, open `dist/og.png` and see the layout in AC-4; `pnpm check:seo` passes; view source of `dist/index.html` for the tags, verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-6**
- Copy flows through: change `site.meta.card.tagline`, rebuild, the card text changes; revert, verifies **AC-4**
- Icons: load the preview in a light and a dark browser theme; the tab icon is readable in both; an iPhone home screen shortcut shows the tile, verifies **AC-5**
- 404 stays out: `dist/404.html` has no canonical, no `og:url`, no JSON-LD, and is missing from the sitemap, verifies **AC-2**, **AC-3**, **AC-6**, **AC-7**
- Failure case: rename the font path, `pnpm build` fails naming it; remove `--color-accent` from a scratch copy of the token reader input, the build fails naming the token, verifies **AC-4**, **AC-9**
- Structured data: paste the deploy preview HTML into the schema.org validator (or the live URL into Google's Rich Results Test after launch), no errors, verifies **AC-6**
- Live share: LinkedIn Post Inspector and a WhatsApp message show the card, verifies **AC-10**

## Build plan

Skateboard: the plain tags first (they help on their own), then the generated images, then the extras and the guard.

1. `site.ts`: change `meta.title` and `meta.description`; add `meta.founder` and `meta.card` with its type in `SiteContent`. `Base.astro`: canonical, Open Graph (pointing at `/og.png`), and Twitter tags per the head design. `pnpm check:copy` passes, satisfies **AC-1**, **AC-2**, **AC-3**
2. Move the monogram paths into `src/seo/monogram.ts` and import them in `Logo.astro` (header looks unchanged). Add `src/seo/tokens.ts`, `src/seo/icon.ts`, and `src/seo/ico.ts`; add `src/seo` to `SCAN_DIRS` in `scripts/check-design.mjs`; add the `favicon.svg`, `favicon.ico`, and `apple-touch-icon.png` endpoints; replace the head icon links; delete `public/favicon.svg` and `public/favicon.ico` in the same commit, satisfies **AC-5**, **AC-9**
3. Install `satori`, `@fontsource/schibsted-grotesk`, and `sharp` (pinned to Astro's version). Add `src/seo/card.ts` and the `og.png` endpoint per the card layout; open the PNG and compare with AC-4, satisfies **AC-4**
4. Add the JSON-LD block to `Base.astro`. Install `@astrojs/sitemap`, add it to `astro.config.mjs`, replace `public/robots.txt` with the `robots.txt` endpoint, satisfies **AC-6**, **AC-7**
5. Add `scripts/check-seo.mjs` and a `check:seo` script; add it to `verify` after `build`. It imports `site` from `src/content/site.ts` and the default export of `astro.config.mjs` for the origin, then reads with regex (no HTML parser): `dist/index.html` and `dist/404.html` (titles, descriptions, canonical, `property=` OG tags, `name=` Twitter tags, JSON-LD parse and shape, one `<h1>`, no skipped heading levels outside `<script>` and `<template>`), `dist/og.png` and `dist/apple-touch-icon.png` (width and height from the PNG header, `og.png` under 200 KB), `dist/favicon.ico` (the header and entry in `src/seo/ico.ts`), `dist/sitemap-0.xml` (exactly one `<loc>`, the origin), and `dist/robots.txt` (the `Sitemap:` line). `pnpm verify` clean, satisfies **AC-8**, **AC-9**
6. Rework the card to the centered full logo: add `src/seo/wordmark.ts`, change `renderCard` to `{ tagline, hostname }` and the card layout above, update the `og.png` endpoint call; open the PNG next to `logo-original.png` and compare the lockup proportions, satisfies **AC-4**
7. After feature 16: run the live share checks and the Rich Results Test on abedautomation.com, satisfies **AC-6**, **AC-10**

## Consequences

**Positive**:
- One edit in `site.ts` updates the search result, the share preview, and the card image together.
- The favicon finally matches the brand, and the header logo and icons share one drawing.
- `check:seo` keeps future edits from silently dropping a tag or breaking the heading order.

**Negative / tradeoffs**:
- Three new packages (`satori`, `@fontsource/schibsted-grotesk`, `@astrojs/sitemap`) and `sharp` becomes a direct dependency; each needs Dependabot updates. Satori is still a 0.x library, so a minor update can change rendering; look at the card after any Satori bump.
- Builds take a little longer (one PNG, two icons; well under a second each).
- The card font is a second copy of Schibsted Grotesk (static WOFF from Fontsource) beside the site's variable WOFF2 from Astro's font loader; if the site font ever changes, change both.
- Link previews cache hard: LinkedIn, Slack, and WhatsApp may keep showing an old card for days after a change. LinkedIn's Post Inspector forces a refresh.
- Until feature 16 puts the domain live, a preview's tags point at `https://abedautomation.com/og.png`, which does not resolve yet, so share previews can only be checked after launch (AC-10).
- The card has no photo, so it is less personal than a portrait card.
- The card's wordmark is set in Schibsted Grotesk, so its letters are close to, but not identical with, the rounder typeface in `logo-original.png`. If a vector export of the original logo turns up, trace its wordmark into `src/seo/wordmark.ts` and change only that file.
- The card no longer spells out "Abed"; the full name is in the alt text, the title, and the page.

**Neutral**:
- `pnpm` may enforce a minimum release age on new packages (see `pnpm-workspace.yaml`); pick versions old enough, or add a dated entry to `minimumReleaseAgeExclude` as was done for `astro`.
- `Logo.astro` changes from inline paths to imported ones; its markup and look stay the same.
- `robots.txt` moves from `public/` to an endpoint so the domain lives in one place.

## Follow-up

- [ ] `/sync`: add the three new skills (`satori`, `og-images`, `seo-sitemap`) to root `AGENTS.md` `## Agent skills`, with the notes from the Implementation skills line, and add `satori-mcp-server` and `mcp-svg-render` to its `Declined:` line (they need Blob storage or rely on resvg, which this design does not use).
- [ ] `/sync`: `design.md` section 6, Logo row: the monogram paths now live in `src/seo/monogram.ts`, and the favicon note is done.
- [ ] `/sync`: `src/seo/` is a new build only folder; `AGENTS.md` may want one line saying nothing in it may be imported by client code.
- [ ] If Abed adds verified social or GitHub profiles to the footer later, add them to the Organization's `sameAs` in the same change.
- [ ] `/sync`: `design.md` section 6 could note that the full logo (monogram over wordmark) now exists as a vector on the sharing card, in `src/seo/wordmark.ts`.
- [ ] Feature 16's launch checks: add "share preview shows the card" and "Rich Results Test passes" to the README list when this ships.
