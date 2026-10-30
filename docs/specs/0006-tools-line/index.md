# 0006. Tools line: verified tool list, plain text, accessible list

**Date**: 2026-10-29
**Status**: In Progress

## Summary

Right after the hero, one quiet line names the tools Abed actually builds with: n8n, OpenAI, Claude, TypeScript, React, Astro, Tailwind CSS, Node.js, and PostgreSQL. They appear as plain text names, with no logos, so nothing looks like a partnership or endorsement and nothing extra has to load. In the code, the names live in `site.tools.items`, the page renders them as a real list (screen readers hear a list of nine tools, not the word "slash"), and the copy check fails the build if the list is ever empty, repeated, or worded like an endorsement.

## Requirements

**User stories**:
- As a small business owner reading the page, I want to see at a glance which tools Abed uses, so that I can tell he works with familiar, current technology.
- As a screen reader user, I want the tools announced as a short list, so that I hear each name cleanly without "slash" between them.
- As Abed after launch, I want the build to stop me if I add a tool name worded as a partnership or certification, so that the line never implies an endorsement.

**Acceptance criteria**:
- **AC-1**: `SiteContent.tools` is `{ label: string; items: string[] }`, and `site.tools.items` is exactly, in this order: `n8n`, `OpenAI`, `Claude`, `TypeScript`, `React`, `Astro`, `Tailwind CSS`, `Node.js`, `PostgreSQL`. `site.tools.label` stays `Tools I work with:` (approved in spec 0004). `pnpm check` passes.
- **AC-2**: On `/`, a `<section id="tools">` comes directly after the hero section, with a 1px `line` border on top and 16px padding above and below. Its visible text reads exactly `Tools I work with: n8n / OpenAI / Claude / TypeScript / React / Astro / Tailwind CSS / Node.js / PostgreSQL`, at 14px, with the label and separators in `muted` and the names in `fg`. It contains no image, SVG, icon, or link, and it renders the same with JavaScript off.
- **AC-3**: The names are in a `<ul role="list">` with one `<li>` per entry of `site.tools.items`. Each " / " separator sits in an `aria-hidden="true"` span written in the template, not in `site.ts`. In the browser accessibility tree the section shows the label text, then a list of 9 items whose names match AC-1, and the word "slash" or a "/" character appears in no accessible name.
- **AC-4**: At 320px, 390px, 768px, and 1280px wide there is no sideways scroll, no tool name breaks across two lines (so `Tailwind CSS` and `Node.js` each stay whole), and no wrapped line starts with a separator.
- **AC-5**: The header nav link "Tools" on `/` (`#tools`) and on the 404 page (`/#tools`) scrolls to this section, by mouse and by keyboard (Tab, then Enter).
- **AC-6**: `pnpm check:copy` fails, naming `tools.items`, when the list is empty, when two items are equal ignoring case, or when any `tools` string contains `partner`, `partners`, `partnered`, `partnership`, `certified`, `official`, `endorsed`, `endorsement`, `sponsor`, `sponsored`, `affiliate`, or `affiliated` (whole words, any case). With the AC-1 list it passes, and it still runs inside `pnpm verify`, which exits 0.
- **AC-7**: `design.md` (section 4 spacing and the section 6 *Tools line* row) and `docs/design/pages/home.md` (the *Tools line* component row and the `tools.items` placeholder row) describe the `<ul role="list">` markup, the template separators, the 16px padding, and the confirmed list, so no design doc still says `<p>` or `[TOOL]`.
- **AC-8**: Every name on the line is a tool Abed confirmed using (2026-10-29). The line names no app Abed only connects to (Gmail, Slack, Telegram stay in the Services copy), and no wording on or around the line suggests a partnership, client relationship, certification, or endorsement.

## Decision

**Chosen option**: Option 1: Plain text names in an accessible list, guarded by `check:copy`.

The nine confirmed names go into `site.tools.items` and render after the hero as one wrapping line of plain text, marked up as a list with hidden separators; `check:copy` gains a tools rule.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.claude/skills/tailwind-4-docs/`) · `accessibility` (`addyosmani/web-quality-skills`, `.claude/skills/accessibility/`)

**Boundaries** (what this feature does not do):
- No logos, icons, or images of any tool, now or in Release 2 motion (see *Key invariants*).
- No links to tool websites: they would add outbound links that read like referrals, and more tab stops in a credibility strip.
- Services copy (which names Gmail, Slack, Telegram) is spec 0004's and does not change.
- Motion on this line belongs to feature 13 and must keep this markup and text.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch** (static content, no database):

| Key | Type | Required | Notes |
|---|---|---|---|
| `tools.label` | `string` | yes | Exists, approved in spec 0004: `Tools I work with:` |
| `tools.items` | `string[]` | yes, at least 1 | New. Display names exactly as each product writes them, in render order, unique ignoring case |

Order rule: automation and AI first (n8n, OpenAI, Claude), then front end (TypeScript, React, Astro, Tailwind CSS), then back end and data (Node.js, PostgreSQL). The array order is the display order; no sorting in code.

**State transitions**: none (static HTML).

**API surface** (no endpoints; the surfaces are the content object, the markup, and the guard):

| Surface | Kind | Inputs | Output | Errors |
|---|---|---|---|---|
| `site.tools` in `src/content/site.ts` | typed content | the label and the 9 names | read by `index.astro` | `pnpm check` type error if `items` is missing or not `string[]` |
| Tools section in `src/pages/index.astro` | markup | `site.tools` | the HTML below | none at runtime |
| `scripts/check-copy.mjs` tools rule | build guard | `site.tools` | `check:copy: ok` | exit 1 listing `tools.items` for empty, duplicate, or endorsement wording |

Target markup, placed right after the hero `<section>` and inline in `index.astro` like the hero (classes are a guide; `/develop` matches the existing utilities):

```astro
<section id="tools" class="border-t border-line">
  <div class="site-wrap py-4 text-small text-muted">
    <p class="inline">{site.tools.label}</p>{' '}
    <ul role="list" class="inline">
      {site.tools.items.map((item, i) => (
        <li class="inline">
          <span class="whitespace-nowrap">
            <span class="text-fg">{item}</span>
            {i < site.tools.items.length - 1 && <span aria-hidden="true"> /</span>}
          </span>{' '}
        </li>
      ))}
    </ul>
  </div>
</section>
```

Layout notes: label and list flow as one line of text. Each name and its trailing " /" sit in one `whitespace-nowrap` span, so they never split; the explicit `{' '}` after that span (outside it) is the only place the line may wrap, so a wrapped line always starts with a name (AC-4). Astro does not keep whitespace between mapped elements on its own, so those explicit spaces are required; without them names run together. `role="list"` is required because Safari drops list semantics from a `<ul>` whose list markers are removed.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Render tools section | Label text | `site.tools.label` (spec 0004) |
| Render tools section | Each tool name and its order | `site.tools.items`, array order (this spec, AC-1) |
| Render tools section | The separator " / " and its placement after every item but the last | Template constant in `index.astro` (design.md *Tools line* row) |
| Render tools section | Section anchor `tools` | `design.md` section 7 nav targets; header links in `SiteHeader.astro` |
| Render tools section | Colors, size, border, padding | Tokens `muted`, `fg`, `line`; type role *Small*; 16px padding (this spec, from the prototype `.tools` rule) |
| Render tools section | Jump offset when reached through the nav | Existing `[id] { scroll-margin-top: 1rem }` in `global.css` |
| `check:copy` tools rule | Banned word list and the duplicate check | This spec, AC-6 |

**Key invariants**:
- The line shows only names in `site.tools.items`, and every name is one Abed confirmed using. Adding a name later means Abed confirms it, then edits `site.ts` only.
- Plain text only: no logo, icon, image, or link inside `#tools`.
- No tool name, label, or separator is typed in a component except the " / " separator, which is presentation and stays out of `site.ts`.
- `tools.items` is never empty and has no duplicates ignoring case (enforced by `check:copy`).
- Existing `check:copy` rules apply to the names too (no straight quotes, brackets, or team wording), so names are written with plain characters.

**Security model**: public static text; no data collected, no requests, no third party assets. Trademark exposure is limited to naming products factually as tools used, which is why logos and partnership wording are excluded.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: open `/` with JavaScript off; the line after the hero reads exactly the AC-2 text, names in `fg`, label and slashes in `muted`, verifies **AC-1**, **AC-2**
- Accessibility: in the browser accessibility tree (or a screen reader), the section announces the label then "list, 9 items" with each name and no "slash", verifies **AC-3**
- Failure case: temporarily set `tools.items` to `['n8n', 'N8N']`, then to `['Official n8n partner']`, then to `[]`; `pnpm check:copy` exits 1 each time naming `tools.items`, verifies **AC-6**
- Layout: at 320px the line wraps between whole names, `Tailwind CSS` stays on one line, no line starts with "/", no sideways scroll, verifies **AC-4**
- Navigation: Tab to "Tools" in the header, press Enter; the page lands on the line, also from the 404 page, verifies **AC-5**

## Build plan

Skateboard: this feature is small enough to ship whole in one pass; the order goes content, then page, then guard, then docs, so each step leaves `pnpm verify` green.

1. Add `items: string[]` to `SiteContent.tools` and the nine names, in order, to `site.tools.items` in `src/content/site.ts`, satisfies **AC-1**, **AC-8**
2. Render `<section id="tools">` right after the hero in `src/pages/index.astro` with the target markup (list, `role="list"`, trailing hidden separators, no wrap inside items), then check 320, 390, 768, and 1280 widths and the header and 404 nav jumps, satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**
3. Extend `scripts/check-copy.mjs` with the tools rule (non empty, no case insensitive duplicates, banned endorsement words across `tools` strings), try each failure case, then restore, satisfies **AC-6**
4. Update `design.md` (section 4 tools padding, section 6 *Tools line* row) and `docs/design/pages/home.md` (*Tools line* component row, `tools.items` row) to the final markup and list, then run `pnpm verify`, satisfies **AC-7**, **AC-6**

## Consequences

**Positive**:
- The credibility strip ships with zero image weight and zero third party requests, and can never be read as a logo wall of partners.
- Screen reader users hear a clean list; sighted users see exactly the prototype line.
- The guard keeps endorsement wording and accidental duplicates out after launch.

**Negative / tradeoffs**:
- Plain text is less eye catching than logos; recognition depends on the names alone.
- Nine names wrap to two or three lines on a phone, so the strip is taller on mobile than in the prototype.
- The banned word list is blunt: a future tool whose real name contains one of those words would need the rule adjusted.
- Listing developer tools (TypeScript, Astro, Tailwind CSS) means little to some non technical visitors; it is accepted as a signal of current practice.

**Neutral**:
- `check:copy` reports more strings (the nine names), so spec 0004's verify step that expects `ok (35 strings)` will read a higher count.
- Release 2 motion (feature 13) may animate the line but must keep this text, markup, and order.

## Follow-up

- [ ] Spec 0004 `verify.md` command step 1 expects `check:copy: ok (35 strings)`; after this feature the count rises by 9 (to 44 if nothing else changed). Update the expected count when running `/check verify site copy`.
- [ ] `docs/design/handoff.md` section 8 still says "Only n8n is confirmed" for tool names; it is a historical handoff note, so leave it, or mark it superseded by this spec if you want the docs fully current.
