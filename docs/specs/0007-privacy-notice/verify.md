# Verify: Privacy notice · spec 0007 · 2026-10-30
_Steps derived from spec 0007 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Run `pnpm build && pnpm preview`, open `/` with JavaScript off, scroll to the end → after the final CTA, a section with a 1px top line, 32px padding, h2 `Privacy`, six h3 topics with the deck text in order, body 14px `muted`, no wider than 640px → AC-1, AC-2
- [ ] Under the last paragraph → `Last updated 30 October 2026` (or the ship date); inspect → `<time datetime="YYYY-MM-DD">` matching `site.privacy.updated` → AC-4
- [ ] Inspect the links in the section → three `<a href="https://…">` with no `target`, `fg` and underlined; two `mailto:` links showing `abed@abedautomation.com` → AC-3
- [ ] Network panel: reload `/` and scroll through the privacy section → every request is same origin; Application panel → no cookies → AC-3, AC-7
- [ ] Click each policy link → it opens the Netlify, Cal.com, and Google privacy policy in the same tab; Back returns to the site → AC-3, AC-7
- [ ] Footer on `/` and on `/nope` → a `Privacy` link after the email, 44px tall; click it, and separately Tab to it and press Enter → both land on the section → AC-5
- [ ] Heading outline (DevTools accessibility tree or a headings extension) → h1, h2s, and the six h3s nested under Privacy only → AC-2
- [ ] At 320, 390, 768, 1280 widths → no sideways scroll, no overlap, every inline link focusable with the coral focus ring → AC-8
- [ ] Read the notice against reality → no cookies, no analytics, Netlify host, Cal.com fields name, email, note, Google Workspace calendar and mail, no call recording, no marketing → AC-7

## Commands
- [ ] `pnpm check` → exit 0 with the new `SiteContent.privacy` shape → AC-1
- [ ] `pnpm check:copy` with the approved deck → `check:copy: ok`, exit 0 → AC-6
- [ ] Temporarily set `privacy.updated` to `2026-13-40`, then one link `href` to `http://cal.com/privacy`, then add `our` to a paragraph; run `pnpm check:copy` each time → exit 1 naming the path; then revert → AC-6
- [ ] `pnpm verify` → exit 0 → AC-6
- [ ] `grep -n "h3\|Inline link\|Privacy" design.md` and `grep -n "privacy.body" docs/design/pages/home.md` → the h3 role, inline link style, 44px inline exemption, and privacy rows are present; `grep -n "feature 12" src/components/SiteFooter.astro` → no match → AC-9

## Value sourcing
- [ ] Text: editing a heading or paragraph in `site.privacy.sections` changes only that text; no privacy words in `PrivacyNotice.astro`
- [ ] Email: changing `site.footer.email` changes both mailto links and the footer link
- [ ] Date: changing `site.privacy.updated` changes the shown date and the `datetime` attribute
- [ ] Footer link label comes from `site.footer.privacyLabel` and points to `/#privacy`
- [ ] Colors and spacing: only the `muted`, `fg`, `line`, `accent` tokens; `pnpm check:design` passes

## Acceptance-criteria coverage
- AC-1: UI step 1, command step 1 · AC-2: UI steps 1, 7 · AC-3: UI steps 3, 4, 5 · AC-4: UI step 2 · AC-5: UI step 6 · AC-6: command steps 2, 3, 4 · AC-7: UI steps 4, 5, 9 · AC-8: UI step 8 · AC-9: command step 5

## Added by /develop · 2026-10-30
- [ ] `pnpm check:copy` with `privacy.updated` set to `2026-02-30` (right format, impossible day) → exit 1 naming `privacy.updated`; revert → AC-6
- [ ] Date source edge: set `privacy.updated` to `2026-01-01`, build, and check the page shows `1 January 2026` with `datetime="2026-01-01"` (not 31 December, which would mean a time zone slip); revert → AC-4
- [ ] Rendered HTML: no space inside any link and none before the full stop after it (`…email <a …>abed@abedautomation.com</a>.`); check `dist/index.html` after `pnpm build` → AC-1, AC-3
- [ ] Footer at 640px and wider → email and Privacy links sit on one row, 24px apart, to the right of the copyright; below 640px all three stack → AC-5
