# Verify: SEO & sharing metadata · spec 0011 · updated 2026-10-30
_Steps derived from spec 0011 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## Commands
- [ ] `pnpm verify` → exits clean, and its `check:seo` line reads `ok (2 pages, card, icons, sitemap, robots.txt)` → AC-9
- [ ] `pnpm check:design` → passes, and its file count includes `src/seo/` (no hex outside `global.css`) → AC-9
- [ ] Break a copy of `dist/index.html` (remove the canonical, add an `<h4>` before `<main>`) and run `pnpm check:seo` → fails naming each miss; rebuild restores it → AC-9
- [ ] `dist/sitemap-0.xml` → exactly one `<loc>`, `https://abedautomation.com/`; no `404`, `og.png`, or icon URLs → AC-7
- [ ] `dist/robots.txt` → `User-agent: *`, `Allow: /`, last line `Sitemap: https://abedautomation.com/sitemap-index.xml` → AC-7
- [ ] `ls dist` and `git ls-files public` → `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og.png` built; no Astro default favicon left in `public/` → AC-5

## UI / manual
- [ ] View source of `dist/index.html` → title `Abed Automation · AI automation, websites, and web apps`, the new description, one canonical `https://abedautomation.com/` → AC-1, AC-2
- [ ] Same file → every `og:*` and `twitter:*` tag from AC-3, `og:url` equal to the canonical → AC-3
- [ ] View source of `dist/404.html` → title `Page not found · Abed Automation`, `noindex`, no canonical, no `og:url`, no JSON-LD, `og:description` equal to the home description → AC-1, AC-2, AC-3, AC-6
- [ ] Open `dist/og.png` → 1200×630, under 200 KB; centered top to bottom: the AD monogram, the `AUTOMATION` wordmark with the network O, the tagline, `abedautomation.com` at the bottom; Schibsted Grotesk; no coral rule → AC-4
- [ ] Open `dist/og.png` next to `docs/design/assets/logo-original.png` → same lockup proportions (wordmark about as wide as the monogram, the O on the baseline at cap height, coral nodes cutting the ring) → AC-4
- [ ] `grep -r logo-original src dist` → no match (the PNG is never shipped or embedded) → AC-4
- [ ] Change `site.meta.card.tagline`, rebuild, open `dist/og.png` → new text shows; revert → AC-4
- [ ] Change `site.meta.card.alt`, rebuild → both `og:image:alt` and `twitter:image:alt` change; revert → AC-3
- [ ] Change `site.meta.founder` or `site.footer.email`, rebuild → JSON-LD Person name or Organization email changes; revert → AC-6
- [ ] Change `--color-accent` in `global.css` to another valid value, rebuild → the card rule and icon brackets change color; revert → AC-4, AC-5
- [ ] In a scratch copy, remove `--color-accent` from `global.css` and build → the build fails naming `--color-accent` → AC-4
- [ ] Rename the font path in `src/seo/card.ts` and build → the build fails naming the font file; revert → AC-4
- [ ] Change `site` in `astro.config.mjs` to another origin, rebuild → canonical, `og:url`, `og:image`, JSON-LD URLs, the card hostname, the sitemap, and `robots.txt` all follow; revert → AC-2, AC-4, AC-7
- [ ] On a deploy preview, view source → canonical and `og:image` still point at `https://abedautomation.com/` → AC-2
- [ ] Load the deploy preview in a light and a dark browser theme → the tab icon is readable in both → AC-5
- [ ] On an iPhone, Add to Home Screen from the preview → the dark AD tile shows with no black corners → AC-5
- [ ] Open the preview with the browser console open → no Content Security Policy violation → AC-6, AC-9
- [ ] Paste the preview HTML into validator.schema.org → no errors for Organization and Person → AC-6
- [ ] Read the page with a heading outline tool (or `check:seo`) → one `<h1>`, no skipped levels on either page → AC-8

## After feature 16 (live site)
- [ ] Google Rich Results Test on `https://abedautomation.com/` → no errors → AC-6
- [ ] LinkedIn Post Inspector on `https://abedautomation.com/` → card, title, and description show → AC-10
- [ ] Paste the URL into a WhatsApp or Slack message → card, title, and description show → AC-10

## Acceptance-criteria coverage
- AC-1 · view source home and 404, `check:seo`
- AC-2 · canonical steps, origin change, deploy preview
- AC-3 · OG and Twitter tags, alt change, 404 tags
- AC-4 · open the card, tagline change, token and font failures, hostname from origin
- AC-5 · built icon files, light and dark tab, iPhone tile, token change
- AC-6 · JSON-LD copy change, schema.org validator, CSP console, Rich Results Test after launch
- AC-7 · sitemap and robots.txt steps
- AC-8 · heading outline, `check:seo`
- AC-9 · `pnpm verify`, `check:design`, broken copy of the build
- AC-10 · LinkedIn Post Inspector and a WhatsApp or Slack message after launch
