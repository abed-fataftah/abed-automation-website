# Verify: Tools line · spec 0006 · 2026-10-29
_Steps derived from spec 0006 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Run `pnpm build && pnpm preview`, open `/` with JavaScript off → right after the hero, a section with a 1px top line reads exactly `Tools I work with: n8n / OpenAI / Claude / TypeScript / React / Astro / Tailwind CSS / Node.js / PostgreSQL`; label and slashes `muted`, names `fg`, 14px → AC-1, AC-2
- [ ] Inspect `#tools` → no `<img>`, `<svg>`, `<a>`, or icon inside; padding 16px top and bottom → AC-2
- [ ] Inspect the markup → `<ul role="list">` with 9 `<li>`; each separator is `<span aria-hidden="true">`, none after the last item → AC-3
- [ ] DevTools accessibility tree (or a screen reader) → label text, then a list of 9 items with the AC-1 names; no "slash" or "/" in any accessible name → AC-3
- [ ] At 320, 390, 768, 1280 widths → no sideways scroll; `Tailwind CSS` and `Node.js` never split; no wrapped line starts with "/" → AC-4
- [ ] Tab to "Tools" in the header and press Enter on `/`, then do the same on a missing path such as `/nope` → both land on the tools line → AC-5
- [ ] Read the line and its surroundings → only Abed's confirmed tools; no Gmail, Slack, or Telegram; no partnership, client, certification, or endorsement wording → AC-8

## Commands
- [ ] `pnpm check` → exit 0 with `tools.items: string[]` in `SiteContent` → AC-1
- [ ] `pnpm check:copy` with the approved list → `check:copy: ok`, exit 0 → AC-6
- [ ] Temporarily set `tools.items` to `[]`, then `['n8n', 'N8N']`, then add `'Official partner'`; run `pnpm check:copy` each time → exit 1 naming `tools.items`; then revert → AC-6
- [ ] `pnpm verify` → exit 0, `check:copy` runs in it → AC-6
- [ ] `grep -n "Tools line\|tools.items\|\[TOOL\]" design.md docs/design/pages/home.md` → rows describe `<ul role="list">`, template separators, 16px padding, the confirmed list; no `<p>` for the tools line and no `[TOOL]` → AC-7

## Value sourcing
- [ ] Label: changing `site.tools.label` changes only the label text
- [ ] Names and order: reordering `site.tools.items` reorders the line; no names appear in `index.astro`
- [ ] Separator: " / " is in `index.astro` only, not in `site.ts`
- [ ] Anchor: header links point to `#tools` / `/#tools`, and the section `id` is `tools`
- [ ] Colors and spacing: only the `muted`, `fg`, `line` tokens and the *Small* type role; `pnpm check:design` passes
- [ ] Jump offset: comes from the existing `[id]` scroll margin in `global.css`

## Acceptance-criteria coverage
- AC-1: UI step 1, command step 1 · AC-2: UI steps 1, 2 · AC-3: UI steps 3, 4 · AC-4: UI step 5 · AC-5: UI step 6 · AC-6: command steps 2, 3, 4 · AC-7: command step 5 · AC-8: UI step 7
