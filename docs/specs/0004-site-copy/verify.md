# Verify: Site copy · spec 0004 · updated 2026-10-29
_Steps derived from spec 0004 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Run `pnpm build && pnpm preview`, open `/` with JavaScript off → every visible string (skip link, eyebrow, heading, intro, CTA label) matches its *Copy deck* line character for character, curly ’ included → AC-1, AC-2
- [ ] Open a missing path (for example `/nope`) with JavaScript off → title, code, heading, body, and back link match the `notFound.*` deck lines → AC-1, AC-2
- [ ] On `/`, inspect the `<h1>` → it is `I build <u>AI automation</u>, websites, and web apps for small businesses.` with no space before the comma; its text content reads exactly "I build AI automation, websites, and web apps for small businesses." → AC-4
- [ ] Read every deck line against the voice rules (first person singular or “you”, no team wording, no prices, no promised results, ecommerce platform described as in development, no age, location, client names, or grades) → AC-8

## Commands
- [ ] `pnpm check:copy` on the approved deck → `check:copy: ok (35 strings)`, exit 0 → AC-6
- [ ] Temporarily set `home.intro` to `We offer a guaranteed $99 package [TBD]`, run `pnpm check:copy` → exit 1, lists `team-wording`, `price`, `promise`, and `placeholder` for `home.intro`; then revert → AC-6
- [ ] Temporarily set `home.intro` to 150 characters, run `pnpm check:copy` → `home.intro: too long (150 > 120)`, exit 1; then revert → AC-7
- [ ] Temporarily set `footer.copyright` to `© 2026 Abed Automation`, run `pnpm check:copy` → `hard-year "2026"` and a missing `{year}` token error, exit 1; then revert → AC-5
- [ ] `grep -rnE '\b(19|20)[0-9]{2}\b' src/content/site.ts` → no match inside a `site` value → AC-5
- [ ] Temporarily delete `home.heading.after` in `site.ts`, run `pnpm check` → type error; then revert → AC-3
- [ ] Compare each *Copy deck* row with status `approved` to `site.ts` → every value equal; no `draft` or `waiting` key present → AC-2
- [ ] Look at the `verify` script in `package.json` → `pnpm check:copy` runs before `pnpm build`; `pnpm verify` exits 0 → AC-6

## Value sourcing
- [ ] Page text: each string on `/` and the 404 page traces to its deck line in `site.ts` (covered by the UI steps above)
- [ ] Hero `<h1>`: changing only `home.heading.emphasis` changes only the underlined part → heading is built from `before`, `emphasis`, `after`
- [ ] Copyright year: no page renders the footer yet (feature 10). When it does, the year shown equals the build year, and `site.ts` still holds `{year}`
- [ ] Copyright holder and © sign: come from `footer.copyright`
- [ ] Email link: once the footer exists, `href` is `mailto:` plus `footer.email`, and the link text is `footer.email`
- [ ] Deck status: every row in the deck reads `approved`, approved by Abed on 2026-10-29
- [ ] About and services facts: match the facts summarized in `rationale.md`, nothing added
- [ ] Guard rules and limits: `scripts/check-copy.mjs` patterns and limits match *Copy guard rules* in the spec

## Acceptance-criteria coverage
- AC-1: UI steps 1, 2 · AC-2: UI steps 1, 2, command step 7 · AC-3: command step 6 · AC-4: UI step 3 · AC-5: command steps 4, 5 · AC-6: command steps 1, 2, 8 · AC-7: command step 3 · AC-8: UI step 4
