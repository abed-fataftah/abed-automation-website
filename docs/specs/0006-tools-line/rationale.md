# 0006. Tools line: rationale

Decision record for [index.md](index.md). `/develop` does not need this file.

## Context

The page has no testimonials, client logos, or figures (the brief forbids inventing them), so a short list of real tools is one of the few honest trust signals available. It sits right after the hero, the most read spot after the headline, so it must be quick to scan and impossible to misread as a list of partners or clients.

Forces:
- **Honesty rule**: only tools Abed actually uses, and nothing that suggests a partnership, client relationship, certification, or endorsement. Logos of other companies are the classic way a strip like this starts to look like a partner wall.
- **Design system already speaks**: `design.md` (spec 0003) defines the tools line as one 14px line, label `muted`, names `fg`, separated by " / ", plain text, no logos. The prototype shows `Tools I work with: n8n / [TOOL] / [TOOL]`.
- **Accessibility**: a plain paragraph with slashes makes screen readers say "slash" between every name.
- **No third party requests, no JavaScript dependency**: anything shown must be self hosted and visible with JavaScript off.
- **One content file**: names belong in `site.ts` (spec 0001, spec 0004 reserved `tools.items` for this feature); the copy guard `check:copy` already checks every `site` string.

**Abed's confirmed tools** (2026-10-29): n8n, OpenAI, Claude, TypeScript, React, Astro, Tailwind CSS, Node.js, PostgreSQL. Gmail, Slack, and Telegram were offered and left out: they are apps Abed connects in automations rather than tools he builds with, and the Services copy already names them. Abed was unsure they sound professional on this line; leaving them out keeps it a short list of build tools.

## Options considered

### Option 1: Plain text names in an accessible list (chosen)

Names in `site.tools.items`, rendered as an inline `<ul role="list">` with hidden " / " separators, exactly matching the design visually. `check:copy` guards the list.

**Pros**: matches `design.md` and the prototype; no assets; no endorsement look; clean screen reader output.
**Cons**: less visual pull than logos; slightly more markup than a paragraph.

### Option 2: Monochrome logos with names

Small single color SVG marks before each name, self hosted, with the name as the text alternative.

**Pros**: faster recognition; more visual interest under the hero.
**Cons**: changes `design.md` (which says no logos); adds nine SVG files to source, size, and keep current; each brand has its own logo usage rules; a row of logos is exactly what reads as partners or clients.

### Option 3: Plain `<p>` exactly as written in design.md

One paragraph: label, then names joined with " / ".

**Pros**: simplest possible markup; matches the design doc word for word.
**Cons**: screen readers read "slash" between names; no list structure to tell how many tools there are.

## Rationale

The honesty rule is the force that decides this. Logos are the biggest risk of implying endorsement, and they also break the design system's "plain text, no logos" rule and add assets to a site that loads nothing it does not need, so Option 2 costs the most and buys the riskiest kind of credibility. Between the two text options the visual result is identical; the list markup only changes what assistive technology hears, so Option 1 costs a few lines of markup to fix a real accessibility wart in Option 3. Keeping the separators in the template, not in `site.ts`, means the content stays a clean array that the guard can check item by item.

Choices made while writing (pick, why, runner up):
- **Inline in `index.astro`, not a new component**: the hero is inline too and the 404 page does not show the line; runner up `ToolsLine.astro`, worth it only if a second page ever reuses it.
- **Trailing separator inside each item**: a wrapped line then always starts with a name; runner up a leading separator, which puts "/" at the start of wrapped lines.
- **`role="list"` on the `<ul>`**: Safari drops list semantics when list markers are removed; runner up relying on default semantics, which fails there.
- **No `aria-labelledby` on the list**: the label paragraph is read right before the list, so naming the list again would read the label twice; runner up labelling the list, useful only if the label moves away from it.
- **No section heading**: the design has none and the line is not a content section with a title; the nav still reaches it by `id`; runner up a visually hidden `<h2>`, which adds a heading level for one line.
- **Guard scoped to `tools` strings**: the endorsement word list could produce false hits elsewhere in the copy (for example "partner with you"); runner up a site wide rule.
- **16px vertical padding**: taken from the prototype `.tools` rule (`--space-4`), not yet written in `design.md`; runner up 24px, which the prototype does not use.
