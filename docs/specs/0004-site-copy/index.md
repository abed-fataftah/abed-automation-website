# 0004. Site copy: voice, content shape, approved deck, and copy guard

**Date**: 2026-10-29
**Status**: In Progress

## Summary

This spec holds every line of page text for the site in one copy deck, written in Abed's own plain, warm, first person voice from facts Abed supplied. A line reaches `src/content/site.ts` (the one file all text lives in) only after Abed marks it approved here. The hero heading is stored in three parts so the coral underline needs no words in the component, and the copyright year comes from the build date. A new `pnpm check:copy` script fails the build on team wording, prices, promises, placeholders, and straight quotes, so the ground rules keep holding after launch.

## Requirements

**User stories**:
- As a small business owner visiting the site, I want plain, honest text about what Abed does, so that I can decide quickly whether a free call is worth booking.
- As Abed, I want to approve every line before it goes live, so that nothing says something I did not say.
- As Abed after launch, I want a check that stops team wording, prices, or placeholders from slipping in, so that a later edit cannot break the brief's ground rules.

**Acceptance criteria**:
- **AC-1**: Every visible string on `/` and on the 404 page comes from `site` in `src/content/site.ts`; no `.astro` file in `src/components`, `src/layouts`, or `src/pages` contains literal copy (only markup, classes, and `site` reads).
- **AC-2**: For every key in the *Copy deck* with status `approved`, the matching `site.ts` value equals the deck text character for character (curly ’ “ ” included). No key with status `draft` or `waiting` is present in `site.ts` on `main`.
- **AC-3**: `SiteContent` matches the *Data model sketch*: `home.heading` is `{ before, emphasis, after }`; `nav`, `tools`, `services`, `about`, `finalCta`, `privacy`, `footer` exist with the listed fields; `pnpm check` passes.
- **AC-4**: The home `<h1>` renders `before`, then `emphasis` wrapped in `<u>`, then `after`, with no added spaces, so its text content reads exactly "I build AI automation, websites, and web apps for small businesses."
- **AC-5**: The footer copyright text renders `footer.copyright` with `{year}` replaced by the build year (`new Date().getFullYear()` at build time). No value in `site.ts` contains a hard coded four digit year from 1900 to 2099.
- **AC-6**: `pnpm check:copy` exits 0 on the approved deck and exits 1 when any `site` string value (except `bookingUrl`) matches a rule in *Copy guard rules*, printing each failure as `<key path>: <rule name> "<matched text>"`. It runs inside `pnpm verify` before `pnpm build`.
- **AC-7**: `check:copy` enforces the length limits in *Copy guard rules* and fails with `<key path>: too long (<n> > <max>)`.
- **AC-8**: Copy content follows the voice rules: first person singular ("I", "my") or addressed to "you"; no team wording; no prices; no promised results; the ecommerce platform is described as in development, never as finished; no age, exact location, client names, or grades. Checked by reading the deck at `/check verify`.

## Decision

**Chosen option**: Option 1: Approved copy deck in this spec, typed split fields in `site.ts`, and a `check:copy` guard.

Abed approves each line in the *Copy deck* below; `/develop` copies only approved lines into `site.ts`, extends `SiteContent` to the shape below, and adds `scripts/check-copy.mjs` to `pnpm verify`.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`)

**Boundaries** (what this feature does not write):
- Privacy body text: feature 12, after feature 15 picks the analytics tool. This feature writes only `privacy.title` and `footer.privacyLabel`.
- Tool names in the tools line: feature 7. This feature writes only `tools.label`.
- About photo and its alt text: feature 9.
- Meta title and description, share card text: feature 11 (`meta` stays as it is).
- Section markup and styling (underline color, layout): features 6 to 10. This feature delivers the values; the hero is the only markup it touches (AC-4).

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Voice rules** (apply to every line, now and after launch):
- Plain and warm: short sentences, everyday words, talks to the reader as "you".
- First person singular. Never "we", "our", "us", or any team wording.
- Facts only from Abed. No invented clients, numbers, results, credentials, or testimonials. Name no client.
- Distinguish in development work from finished work in the words themselves.
- No prices, rates, or discounts. The call may be called "free" and "no obligation" (both confirmed true by Abed).
- Curly punctuation (’ “ ”). No [BRACKET] placeholders. "30 minute" is written without a hyphen, matching the scope.
- Leave out age, exact location, private client information, and grades.

**Data model sketch** (the `SiteContent` interface after this feature; `*` marks fields added or reshaped here):

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | unchanged |
| `bookingUrl` | `string` | unchanged; feature 5 |
| `meta` | `{ title, description }` | unchanged; feature 11 |
| `a11y.skipLink` | `string` | unchanged value, now deck approved |
| `cta.bookLabel` | `string` | unchanged value, now deck approved |
| `nav`* | `{ label, tools, services, about }` | `label` is the `aria-label` of `<nav>` |
| `home.eyebrow` | `string` | unchanged |
| `home.heading`* | `{ before, emphasis, after }` | was `string`; `emphasis` gets the `<u>` |
| `home.intro` | `string` | new value |
| `tools`* | `{ label }` | feature 7 adds `items` |
| `services`* | `{ automation: { title, body }, web: { title, body } }` | |
| `about`* | `{ title, body: string[] }` | one array item per paragraph; feature 9 adds photo fields |
| `finalCta`* | `{ title, body }` | |
| `privacy`* | `{ title }` | feature 12 adds the body |
| `footer`* | `{ copyright, email, privacyLabel }` | `copyright` contains the `{year}` token |
| `notFound` | `{ title, code, heading, body, homeLabel }` | unchanged values, now deck approved |

All fields required, all `string` unless shown. `site.ts` keeps `satisfies SiteContent` and stays free of imports (so Node can load it directly, see *Copy guard rules*).

**Copy deck** (the source for `site.ts`; status is `draft` until Abed approves, then `approved` with no other change to the text). All lines approved by Abed on 2026-10-29.

| Key | Text | Status |
|---|---|---|
| `a11y.skipLink` | Skip to content | approved |
| `nav.label` | Main | approved |
| `nav.tools` | Tools | approved |
| `nav.services` | Services | approved |
| `nav.about` | About | approved |
| `cta.bookLabel` | Book a Free Call | approved |
| `home.eyebrow` | Hi, I’m Abed. | approved |
| `home.heading.before` | I build␣ (ends with one space) | approved |
| `home.heading.emphasis` | AI automation | approved |
| `home.heading.after` | , websites, and web apps for small businesses. | approved |
| `home.intro` | I help you cut repetitive work and get the website or app your business needs. It starts with a free 30 minute call. | approved |
| `tools.label` | Tools I work with: | approved |
| `services.automation.title` | AI Automation | approved |
| `services.automation.body` | I connect the tools you already use, such as Gmail, Slack, and Telegram, and add AI to handle the repetitive steps in between. Sorting incoming messages, drafting replies, and routine updates are good places to start. | approved |
| `services.web.title` | Websites and Web Apps | approved |
| `services.web.body` | I build business websites and custom web applications, from a clear site that explains what you offer to a tool shaped around how you work. The focus is practical features that work as intended. | approved |
| `about.title` | About | approved |
| `about.body[0]` | I’m Abed Fataftah, the developer behind Abed Automation. I work remotely with businesses to turn practical needs into working software: websites, web applications, and AI automation. | approved |
| `about.body[1]` | Before this, I spent five years running a lighting retail business, handling sales, customers, and daily operations. It taught me how much time everyday tasks can take, and to start from the problem the software needs to solve. I also hold a master’s degree in Computer Science. | approved |
| `about.body[2]` | My projects include a website for an event and talent agency and AI assistant workflows built with n8n. I’m currently building an ecommerce platform, which is still in development. | approved |
| `about.body[3]` | I start by understanding the business problem, then break the work into clear, manageable steps. I keep communication straightforward and check that what I build works as intended. | approved |
| `finalCta.title` | Have a website, web app, or automation need? Let’s talk. | approved |
| `finalCta.body` | In a free 30 minute call with no obligation, you tell me what you need and I’ll share how I’d approach it. | approved |
| `privacy.title` | Privacy | approved |
| `footer.copyright` | © {year} Abed Automation | approved |
| `footer.email` | abed@abedautomation.com | approved |
| `footer.privacyLabel` | Privacy | approved |
| `notFound.title` | Page not found · Abed Automation | approved |
| `notFound.code` | 404 | approved |
| `notFound.heading` | This page doesn’t exist. | approved |
| `notFound.body` | The link may be broken, or the page may have moved. | approved |
| `notFound.homeLabel` | Back to the home page | approved |

**Rendering contract** (no copy in components):
- Hero: `{site.home.heading.before}<u>{site.home.heading.emphasis}</u>{site.home.heading.after}` inside the `<h1>`, on one line in the template so Astro adds no whitespace.
- Copyright: `site.footer.copyright.replace('{year}', String(new Date().getFullYear()))`, evaluated at build time in the footer component (feature 10). Until feature 10 exists, no page renders it.
- Email link: `href={`mailto:${site.footer.email}`}`, link text `site.footer.email`.
- About: one `<p>` per `about.body` item.

**Copy guard rules** (`scripts/check-copy.mjs`, wired as `"check:copy": "node scripts/check-copy.mjs"`):
- Load: `await import('../src/content/site.ts')` (Node 24 strips the TypeScript types natively; this is why `site.ts` must have no imports). Walk `site` recursively and check every string leaf by its dotted key path (array items as `about.body[2]`). Skip `bookingUrl`.
- Rules (case insensitive, whole words where shown with `\b`). Each rule has a name for the error line:
  - `team-wording`: `\b(we|we’re|we’ll|our|ours|us|team)\b`
  - `price`: `[$€£¥]`, `\b(usd|eur|price|prices|pricing|rate|rates|per hour|discount)\b`
  - `promise`: `\b(guarantee|guaranteed|guarantees|proven|roi)\b`, `100%`
  - `placeholder`: `[`, `]`, `\b(todo|tbd|lorem|sample copy)\b`
  - `straight-quote`: `'` or `"`
  - `hard-year`: `\b(19|20)\d{2}\b`
- Required: `footer.copyright` contains `{year}`.
- Length limits (characters, after joining the heading parts): `home.heading` 80 · `home.intro` 120 · `services.automation.body` 230 · `services.web.body` 230 · `finalCta.title` 70 · `finalCta.body` 140.
- Exit 1 if any failure, after printing all of them; exit 0 with `check:copy: ok (<n> strings)` otherwise.
- `pnpm verify` becomes: `pnpm check && pnpm lint && pnpm format:check && pnpm check:design && pnpm check:copy && pnpm build && pnpm check:bundle`.

**State transitions** (one deck line):
`draft` → `approved` (Abed approves, text unchanged) · `approved` → `draft` (any wording edit sends it back for approval) · `waiting` (a line that needs a fact not yet supplied; none at the moment).

**API surface**: none. Static content read at build time; the "interface" is the `SiteContent` type above and the `check:copy` command:

| Command | Inputs | Output | Errors |
|---|---|---|---|
| `pnpm check:copy` | `src/content/site.ts` | `check:copy: ok (<n> strings)`, exit 0 | each failure line, exit 1; import failure of `site.ts` prints the Node error, exit 1 |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Render any page text | each string | the approved *Copy deck* line, copied into `site.ts` |
| Render hero `<h1>` | heading with underlined part | `home.heading.{before,emphasis,after}` |
| Render copyright | year | build date: `new Date().getFullYear()` at build time |
| Render copyright | holder text and © sign | `footer.copyright` |
| Render email link | `mailto:` target | derived from `footer.email` |
| Deck line status | `approved` | Abed's approval in this spec (confirmation step or a later edit) |
| Facts in About and services | background, projects, tools named | Abed's supplied facts, 2026-10-29 (summarized in [rationale.md](rationale.md)) |
| `check:copy` rule set and limits | patterns, max lengths | this spec, *Copy guard rules* |

**Key invariants**:
- `site.ts` on `main` holds only `approved` deck lines (plus fields other features own).
- Deck and `site.ts` never disagree; a wording change happens in the deck first, then `site.ts`.
- `pnpm check:copy` passes on `main`.
- No component holds copy (AC-1).

**Security model**: no data is collected. The repo is public, so the deck and any draft are visible once pushed: drafts live only on a feature branch until approved (rule from spec 0001). Published personal data is limited to what Abed approved: name, the business email, remote work, the degree, the retail background. No age, location, grades, or client names.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: after the build, view `/` with JavaScript off and compare each visible string to its deck line, verifies **AC-1**, **AC-2**, **AC-4**.
- Failure case: temporarily set `home.intro` to "We offer a guaranteed $99 package [TBD]" and run `pnpm check:copy`; it exits 1 and lists `team-wording`, `promise`, `price`, and `placeholder` for `home.intro`, verifies **AC-6**.
- Failure case: a 150 character `home.intro` fails with `too long (150 > 120)`, verifies **AC-7**.
- Year: `site.ts` contains `{year}`, not `2026`; a `hard-year` value fails the check, verifies **AC-5**.
- Type: remove `home.heading.after` and `pnpm check` fails, verifies **AC-3**.
- Review: read every deck line against the voice rules, verifies **AC-8**.

## Build plan

Skateboard: the smallest usable whole is real, approved text on the existing hero and 404 plus the guard; the other sections already have their values waiting in `site.ts` when features 6 to 10 render them.

1. Confirm every deck line is `approved` (in this spec). Any line still `draft` stays out of `site.ts`, satisfies **AC-2**, **AC-8**.
2. Extend `SiteContent` and `site` in `src/content/site.ts` to the *Data model sketch*, with the approved values, satisfies **AC-2**, **AC-3**.
3. Update `src/pages/index.astro` to render the split heading per the *Rendering contract*, and confirm `404.astro` and `index.astro` hold no literal copy, satisfies **AC-1**, **AC-4**.
4. Add `scripts/check-copy.mjs` per *Copy guard rules*, the `check:copy` script in `package.json`, and insert it into `pnpm verify` before `pnpm build`. Prove each rule fires once by hand with a temporary bad value, then revert, satisfies **AC-5**, **AC-6**, **AC-7**.
5. Point the *Content (exact copy)* table in `docs/design/pages/home.md` and `docs/design/pages/404.md` at this deck (replace the sample copy rows with a line saying the deck in spec 0004 is the source), then run `pnpm verify` clean, satisfies **AC-2**.

## Consequences

**Positive**:
- One approved record of every line, so "Abed approved every line" is checkable.
- Ground rules are enforced by a script, so they survive edits after launch.
- Features 6 to 10 only render; they never write copy.

**Negative / tradeoffs**:
- Every wording edit touches two places (deck, then `site.ts`) and needs approval again.
- The guard's word rules are blunt: a legitimate "us" or "rate" (for example "accurate" is fine, "rate" alone is not) needs rewording rather than an exception. There is deliberately no allowlist.
- `site.ts` must stay import free so Node can load it without Astro; adding an import later breaks `check:copy` until the loader changes.
- The deck lives in a public repo; once approved it is public history even if reworded later.

**Neutral**:
- The copyright year changes only when the site is rebuilt; a deploy each January (or any deploy) refreshes it.
- `meta.description` still repeats the old intro until feature 11 rewrites it.

## Follow-up

- [x] Scope feature 4's description listed "privacy wording"; it moved to feature 12 (this spec, *Boundaries*). Row reworded on 2026-10-29.
- [ ] Feature 7 (Tools I Work With): Abed named these tools in the About facts: n8n, Gmail, Slack, Telegram, React, Node.js, PostgreSQL. Feature 7 still confirms the final list and wording.
- [ ] Feature 9 (About): the photo and its alt text are still owed; the text is ready in this deck.
- [ ] Feature 11 (SEO): write `meta.title` and `meta.description` in the voice rules above, and let `check:copy` cover them (it already scans `meta`).
- [ ] Feature 12 (Privacy notice): the body text must pass `check:copy`.
- [ ] The Selected Work section (deferred in scope) should reuse the same rule: in development work labeled as such.
