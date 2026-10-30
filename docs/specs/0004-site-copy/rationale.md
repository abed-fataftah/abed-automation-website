# 0004. Site copy: rationale

Decision record for [index.md](index.md). `/develop` does not need this file.

## Context

The site is one static page whose job is to get a small business owner to book a free call. The text carries most of that job: there are no testimonials, client logos, figures, or prices to lean on (the brief forbids inventing them), so trust comes from plain, specific, honest wording about one real person.

Forces:
- **Honesty rules from the brief**: one person, never a team; no invented claims, results, or prices; no placeholders at launch. These must hold not only at launch but after every later edit.
- **One content file**: spec 0001 put every string in `src/content/site.ts`, typed with `SiteContent`; components must not hard code text. The hero design (spec 0003, `design.md`) underlines "AI automation" in coral, which needs part of a sentence marked without putting words in the component.
- **Public repo**: drafts and history are visible, so unapproved text must stay on a branch, and approval must be recorded somewhere checkable.
- **Overlapping features**: privacy wording depends on the analytics choice (feature 15), tool names on feature 7, the photo on feature 9, and metadata on feature 11. Writing their text here would either guess or duplicate.
- **Abed's facts** (supplied 2026-10-29, the only source for About and services): Abed Fataftah, developer behind Abed Automation, works remotely; master's degree in Computer Science; five years running a lighting retail business (sales, customers, daily operations); projects: a website for an event and talent agency, AI assistant workflows with n8n, an ecommerce platform in development; automation connects Gmail, Slack, and Telegram with AI; web work uses React, Node.js, PostgreSQL; approach: understand the problem, break work into clear steps, straightforward communication, check it works. To leave out: age, exact location, private client information, grades; distinguish in development work; no claims about results or ongoing support. The footer email `abed@abedautomation.com` is confirmed working; no social links for now; the call is free and no obligation.

## Options considered

### Option 1: Copy deck in the spec, split typed fields, `check:copy` guard

A table of every key, its text, and its status lives in this spec; only approved lines enter `site.ts`. The hero heading is `{ before, emphasis, after }`. A Node script scans every `site` string for banned patterns and length limits inside `pnpm verify`.

**Pros**: line by line approval record; emphasis is type safe with no parsing; rules enforced forever, not just at review.
**Cons**: two places to edit per wording change; the guard's word list is blunt and can force a rewording.

### Option 2: PR review only

Drafts go straight into `site.ts` on a branch; approving the PR approves the copy. No deck, no script.

**Pros**: least ceremony; one place to edit.
**Cons**: no record of which lines were approved; nothing catches team wording or a placeholder added in a quick edit after launch.

### Option 3: Astro content collection (Markdown files per section)

Move copy into `src/content/` Markdown entries with a schema; emphasis via Markdown `*…*`.

**Pros**: friendlier to edit as prose; Astro validates frontmatter.
**Cons**: reverses spec 0001's single typed file; Markdown rendering puts HTML generation into the content path; more moving parts for about thirty short strings.

### Option 4: Deck plus manual review, no script

Same deck and fields as Option 1, without `check:copy`.

**Pros**: no new script to maintain.
**Cons**: the rules depend on someone rereading every edit; the brief's "no placeholders at launch" has no automatic gate, unlike the booking URL, which already has one.

## Rationale

Option 1 is the only one that satisfies both halves of the brief's honesty rule: approved once (the deck) and still true later (the guard). The site has no reviewers besides Abed, so a script is the cheapest second pair of eyes, and the project already uses the same pattern for colors (`check:design`) and the booking placeholder. Split fields beat a parsed marker because a missing or doubled `*` would fail silently at render, while a missing field fails `pnpm check`. Option 3 would undo spec 0001's one file decision for no gain at this size.

Smaller calls made while writing:
- **Guard runs in `pnpm verify` on every branch**, not only in production builds (runner up: production only, like the booking guard). Copy rules have no legitimate draft exception the way the booking placeholder does; failing early on a preview is cheaper.
- **Load `site.ts` with Node's built in type stripping** (Node 24, pinned) instead of scanning the file text with regular expressions (runner up). Importing gives real key paths and real values; the cost is that `site.ts` must stay import free.
- **No allowlist for guard rules.** An exception list becomes the place rules quietly die; a rare false positive is cheaper to reword.
- **Copyright `{year}` token** replaced at build time rather than a separate number field, so the © sign and holder text stay in `site.ts`.
- **About as a string array**, one paragraph per item, so feature 9 renders `<p>` tags without splitting text.
