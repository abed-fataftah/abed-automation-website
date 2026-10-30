# 0007. Privacy notice: in page section, plain words, linked from the footer

**Date**: 2026-10-30
**Status**: In Progress

## Summary

The privacy notice is a short `#privacy` section at the end of the home page, just above the footer, and the footer gets its Privacy link to it on every page. In six small headed paragraphs it says, in plain words, who runs the site, what happens when you visit (no cookies, no analytics, Netlify's server logs), what Cal.com and Google handle when you book, how long Abed keeps your details, and what you can ask for. It describes only what the site does today; feature 15 adds its analytics paragraph when it ships. All wording sits in `src/content/site.ts` as typed text, links, and email parts; the copy check keeps guarding it, and a new "last updated" date shows when it last changed.

## Requirements

**User stories**:
- As a small business owner on the site, I want to find out quickly what happens to my data when I visit or book, so that I can book a call without worrying.
- As a careful visitor, I want links to the policies of the services that handle my details, so that I can read what Abed can't control.
- As Abed, I want the notice to state only what is true, in one place I can edit, so that it stays accurate as analytics arrive and I move country.

**Acceptance criteria**:
- **AC-1**: `SiteContent.privacy` is `{ title: string; updatedLabel: string; updated: string; sections: { heading: string; body: PrivacyPart[] }[] }`, where `PrivacyPart` is `string | { text: string; href: string } | { email: true }`. `site.privacy` matches the *Approved deck* below word for word, part for part, in order. `pnpm check` passes.
- **AC-2**: On `/`, a `<section id="privacy">` comes directly after the final CTA section and before the footer, with a 1px `line` border on top and 32px padding above and below. It holds an `<h2>` reading `Privacy` (type role *Section title*), then one `<h3>` plus one `<p>` per entry of `site.privacy.sections`, in order. Body text is the *Small* role in `muted`, at most 640px wide. The heading outline reads h1, then h2s, with the six h3s under the Privacy h2 only. It all renders with JavaScript off.
- **AC-3**: Each `{ text, href }` part renders as a plain `<a href>` to an `https://` address, with no `target` attribute, in `fg` with an underline. Each `{ email: true }` part renders as `<a href="mailto:…">` showing `site.footer.email`. With the Network panel open, loading `/` and scrolling through the section makes no request to any other origin, and `document.cookie` stays empty.
- **AC-4**: Under the last paragraph, a line reads `Last updated 30 October 2026`, where the date is a `<time datetime="2026-10-30">` built at build time from `site.privacy.updated` (format: day, full month name, year, UTC, English).
- **AC-5**: The footer on `/` and on the 404 page shows a link with the text `site.footer.privacyLabel` (`Privacy`) to `/#privacy`, after the email link, at least 44px tall, styled like the email link. Clicking it, or reaching it with Tab and pressing Enter, lands on the privacy section from both pages. The tab order ends: footer email, footer Privacy.
- **AC-6**: `pnpm check:copy` runs every existing rule on every privacy string (so no `we`, `our`, `us`, written year, straight quote, or bracket), skips only `privacy.updated` for those text rules, and fails naming the path when `privacy.updated` is not a real `YYYY-MM-DD` date or when any privacy link `href` does not start with `https://`. With the approved deck it passes, and `pnpm verify` exits 0.
- **AC-7**: Every statement in the notice is true on the day it ships: the site sets no cookies, has no analytics, and loads nothing from another origin while reading; Netlify hosts it; Cal.com collects name, email, and an optional note (spec 0005); bookings go to Abed's Google Workspace calendar with a Meet link; mail is in Google Workspace; calls are not recorded; details are not sold or used for marketing.
- **AC-8**: At 320px, 390px, 768px, and 1280px wide the section has no sideways scroll and no text overlaps; every link in the paragraphs stays readable and focusable with a visible focus ring.
- **AC-9**: `design.md` (section 3 typography, section 6 components, section 9 accessibility) and `docs/design/pages/home.md` (the `privacy.body` row) describe the h3 role, the inline link style, the inline link exemption from the 44px rule, and the privacy section, and `SiteFooter.astro` no longer carries the "lands with feature 12" comment.

## Decision

**Chosen option**: Option 1: An in page `#privacy` section built from typed text parts, linked from the footer.

The notice renders from `site.privacy` through a new `PrivacyNotice.astro` component placed after the final CTA, in short headed paragraphs that cover the GDPR basics in plain words, with no country named and no legal tone.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.claude/skills/tailwind-4-docs/`) · `accessibility` (`addyosmani/web-quality-skills`, `.claude/skills/accessibility/`)

**Boundaries** (what this feature does not do):
- No analytics wording. Feature 15 rewrites the *Visiting this site* paragraph and bumps `privacy.updated` when it ships (see *Follow-up*).
- No cookie banner, consent tool, or settings: the site sets no cookies, so none is needed.
- No header nav link: Privacy is reachable from the footer only, like the prototype.
- No Malay version and no Malaysia specific wording yet (see *Follow-up*). No postal address or Impressum.
- No separate `/privacy` route.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch** (static content, no database):

| Key | Type | Required | Notes |
|---|---|---|---|
| `privacy.title` | `string` | yes | Exists, approved in spec 0004: `Privacy` |
| `privacy.updatedLabel` | `string` | yes | New: `Last updated` |
| `privacy.updated` | `string` | yes | New: ISO date `YYYY-MM-DD` of the last wording change. Exempt from the text rules, validated as a date instead (AC-6) |
| `privacy.sections` | `{ heading: string; body: PrivacyPart[] }[]` | yes, at least 1 | New. One entry per h3 and paragraph, in display order |
| `PrivacyPart` | `string \| { text: string; href: string } \| { email: true }` | n/a | Exported type in `site.ts`. A string is plain text; `{ text, href }` is an outside link; `{ email: true }` is the footer email as a mailto link, so the address lives once |
| `footer.privacyLabel` | `string` | yes | Exists, approved in spec 0004: `Privacy` |

Parts join with no added spaces: each string carries its own spaces and punctuation around a link.

**Approved deck** (proposed; Abed approves or edits it in the spec review, then `/develop` copies it into `site.ts` exactly):

```ts
privacy: {
  title: 'Privacy',
  updatedLabel: 'Last updated',
  updated: '2026-10-30', // set to the ship date when built
  sections: [
    {
      heading: 'Who runs this site',
      body: [
        'This site is run by Abed Fataftah, trading as Abed Automation. For any question about your data, email ',
        { email: true },
        '.',
      ],
    },
    {
      heading: 'Visiting this site',
      body: [
        'The site sets no cookies, uses no analytics or tracking, and loads nothing from other companies while you read it. It is hosted by Netlify, which processes technical details of each visit, such as your IP address, browser, and the page you open, to deliver the site and keep it secure. See ',
        { text: 'Netlify’s privacy policy', href: 'https://www.netlify.com/privacy/' },
        '.',
      ],
    },
    {
      heading: 'Booking a call',
      body: [
        'Booking happens on Cal.com, which collects your name, your email address, and any note you add. The booking is then added to my Google Workspace calendar with a Google Meet link. Calls are never recorded. See the privacy policies of ',
        { text: 'Cal.com', href: 'https://cal.com/privacy' },
        ' and ',
        { text: 'Google', href: 'https://policies.google.com/privacy' },
        '.',
      ],
    },
    {
      heading: 'Emailing me',
      body: ['If you email me, your message is kept in my Google Workspace mailbox, which Google hosts.'],
    },
    {
      heading: 'How I use and keep your details',
      body: [
        'I use your details only to reply to you, prepare the call, and do any work you ask me to do. I never sell them or send you marketing emails. I keep them for as long as that conversation or project needs them, and if no work follows, I delete them within 12 months of the last contact. Netlify, Cal.com, and Google may store data outside your country, including in the United States.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'You can ask to see, correct, or delete your details, or object to how they are used, by emailing ',
        { email: true },
        '. I’ll reply within 21 days. You can also complain to the data protection authority where you live.',
      ],
    },
  ],
},
```

The three policy URLs are written from knowledge, not fetched; `/develop` opens each once to confirm it loads the policy (verify.md) and swaps in the current address if one moved.

**State transitions**: none (static HTML).

**API surface** (no endpoints; the surfaces are the content object, the markup, and the guard):

| Surface | Kind | Inputs | Output | Errors |
|---|---|---|---|---|
| `site.privacy` and `PrivacyPart` in `src/content/site.ts` | typed content | the deck above | read by `PrivacyNotice.astro` | `pnpm check` type error on a wrong shape |
| `src/components/PrivacyNotice.astro` | component | `site.privacy`, `site.footer.email` | the section markup below | none at runtime |
| Placement in `src/pages/index.astro` | markup | none | `<PrivacyNotice />` after the final CTA section | none |
| `src/components/SiteFooter.astro` | markup | `site.footer.privacyLabel` | link to `/#privacy` after the email link | none |
| `scripts/check-copy.mjs` privacy rules | build guard | `site.privacy` | `check:copy: ok` | exit 1 naming `privacy.updated` or `privacy.sections[i].body[j].href` |

Target markup (classes are a guide; `/develop` matches the existing utilities):

```astro
<section id="privacy" class="border-t border-line">
  <div class="site-wrap py-8">
    <h2 class="text-title font-bold">{site.privacy.title}</h2>
    <div class="mt-4 flex max-w-160 flex-col gap-4 text-small text-muted">
      {site.privacy.sections.map((section) => (
        <div>
          <h3 class="mb-1 text-body font-bold text-fg">{section.heading}</h3>
          <p>{/* each part: string as text, { text, href } as an inline link, { email } as a mailto link */}</p>
        </div>
      ))}
      <p>{site.privacy.updatedLabel} <time datetime={site.privacy.updated}>{formatted}</time></p>
    </div>
  </div>
</section>
```

Inline link style: `text-fg underline underline-offset-4`, hover `decoration-accent`, the global focus ring. Inline links sit inside a sentence, so they follow the WCAG 2.5.8 inline exception to the 44px target rule; footer links keep 44px. The date is formatted once at build time with `toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })` on `new Date(site.privacy.updated)`. Like the tools line, rendered parts need no extra spaces between them in the template; write them on one line or use the `prettier-ignore` pattern from the hero so Prettier adds no whitespace.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Render section | Section title `Privacy` | `site.privacy.title` (spec 0004) |
| Render section | Each h3 and paragraph, and their order | `site.privacy.sections`, array order (this spec, *Approved deck*) |
| Render section | Outside link text and address | `{ text, href }` parts in the deck |
| Render section | Email address and its mailto link | `site.footer.email` (spec 0004), through `{ email: true }` parts |
| Render section | `Last updated` label | `site.privacy.updatedLabel` |
| Render section | The date shown and the `datetime` attribute | Derived from `site.privacy.updated`, formatted at build time in UTC, en-GB |
| Render section | Placement after the final CTA | This spec, AC-2 (design.md section 4 page order) |
| Render section | Colors, sizes, border, padding, max width | Tokens `muted`, `fg`, `line`, `accent` (hover underline only); roles *Section title*, *Small*, new *Privacy subheading*; 32px padding (design.md); 640px max width (this spec) |
| Footer link | Label, target | `site.footer.privacyLabel` (spec 0004); `/#privacy` (docs/design/pages/404.md) |
| Footer link | Jump offset | Existing `[id] { scroll-margin-top: 1rem }` in `global.css` |
| Notice facts | Cal.com fields, Google Meet, calendar | Spec 0005 *Feature design* |
| Notice facts | No cookies, no third party on load, Netlify host | AGENTS.md rules, spec 0001 |
| Notice facts | Google Workspace mail, no recording, no marketing, 12 month retention, no location, contact name | Abed's answers in this design session, 2026-10-30 |
| Notice facts | 21 day reply time | This spec (meets both GDPR's one month and Malaysia's PDPA 21 day access window) |

**Key invariants**:
- The notice states only what is true now. Any change that adds a request to another origin, a cookie, analytics, a new data processor, or call recording must update the notice and `privacy.updated` in the same change.
- Every word of the notice lives in `site.privacy`; the component writes no copy. The email address lives only in `site.footer.email`.
- No country, address, or named authority appears in the notice (Abed is moving; see *Follow-up*).
- Outside links are plain `https://` links in the same tab; nothing loads from them until clicked.
- First person singular only; the existing `check:copy` rules apply to every privacy string.

**Security model**: public static text. The site collects nothing itself; the notice describes processing done by Netlify (request logs), Cal.com (booking form), and Google (calendar, Meet, mail). Compliance scope: written to the GDPR Article 13 basics as good practice (identity, contact, purposes, recipients, transfers, retention, rights, complaint), with no claim that any one law governs; Malaysia's PDPA is a follow-up for the move. No secrets, no input, no new attack surface.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: open `/` with JavaScript off, scroll to the end; after the final CTA a Privacy section shows six h3 topics with the deck text and `Last updated 30 October 2026`, verifies **AC-1**, **AC-2**, **AC-4**
- Navigation: Tab to the footer Privacy link on `/` and on `/nope`, press Enter; both land on the section, verifies **AC-5**
- No leaks: with the Network panel open, load and scroll `/`; every request is same origin and `document.cookie` is empty; then click the Netlify link and it opens the policy in the same tab, verifies **AC-3**, **AC-7**
- Failure case: set `privacy.updated` to `2026-13-40`, then a link `href` to `http://cal.com/privacy`, then add the word `our` to a paragraph; `pnpm check:copy` exits 1 each time naming the path, verifies **AC-6**
- Layout: at 320px no sideways scroll and links wrap within text, verifies **AC-8**

## Build plan

Skateboard: small enough to ship whole in one pass, ordered content, guard, page, footer, docs, so `pnpm verify` stays green after each step.

1. Export `PrivacyPart`, extend `SiteContent.privacy`, and add the approved deck to `site.privacy` in `src/content/site.ts`, with `updated` set to the ship date, satisfies **AC-1**, **AC-7**
2. Extend `scripts/check-copy.mjs`: skip the full path `privacy.updated` for the text rules (the current skip only handles top level keys), validate it as a real `YYYY-MM-DD` date, and require `https://` on every privacy link `href`; try each failure case, then restore, satisfies **AC-6**
3. Build `src/components/PrivacyNotice.astro` (parts renderer, inline link style, build time date) and place it after the final CTA in `src/pages/index.astro`; add `h3` to the `overflow-wrap` rule in `global.css`; check the four widths, satisfies **AC-2**, **AC-3**, **AC-4**, **AC-8**
4. Add the Privacy link to `SiteFooter.astro` after the email link (`/#privacy`, same classes) and remove its "lands with feature 12" comment; check from `/` and the 404 page, satisfies **AC-5**, **AC-9**
5. Update `design.md` (section 3: *Privacy subheading (h3)* row, 16px / 1.6, 700, `fg`; section 6: *Privacy notice* and *Inline link* rows; section 9: inline links exempt from the 44px rule) and the `privacy.body` row in `docs/design/pages/home.md`; open each policy link once to confirm it resolves; run `pnpm verify`, satisfies **AC-9**, **AC-7**

## Consequences

**Positive**:
- Visitors get a clear, honest answer one click from any page, with no cookie banner and no extra request.
- The wording is plain enough for small business owners yet covers what GDPR expects a notice to say.
- One typed source and the copy guard keep the text, links, and date from drifting into placeholder or team wording.

**Negative / tradeoffs**:
- The home page grows by a section of fine print, roughly a phone screen tall.
- Abed now owns real promises: deleting booking and email details within 12 months when no work follows (Cal.com, Calendar, and inbox), and replying to requests within 21 days.
- The notice must be edited by hand whenever processing changes; nothing detects a new third party request automatically.
- The policy URLs belong to other companies and may move; a broken link is only caught by a manual check.
- No location means visitors can't see which law applies; acceptable while Abed is between countries, revisited after the move.

**Neutral**:
- `check:copy` reports more strings (about 20 more), so spec 0004's verify step expecting a fixed count will read higher.
- design.md gains an h3 role and an inline link style that later text sections may reuse.
- Release 2 motion (feature 13) may animate the section but must keep its text, markup, and order.

## Follow-up

- [ ] Feature 15 (analytics): rewrite the *Visiting this site* paragraph to name the tool and what it counts, and bump `privacy.updated`, in the same change that adds the tool. Its *Done when* already requires this.
- [ ] Before operating the business from Malaysia: check the PDPA (Personal Data Protection Act 2010, as amended) against this notice, including whether a Malay version is required, which would need an exception to the English only rule; then decide whether to name a location. Run `/architect privacy notice` again to update this spec.
- [ ] Abed: set a recurring reminder (for example every six months) to delete Cal.com bookings, calendar events, and emails older than 12 months where no work followed.
- [ ] Feature 16 (go live): when the Content Security Policy is added, keep the notice's "nothing from other companies" statement true.
- [ ] Scope feature 12's description mentions "cookieless visit counting"; until feature 15 ships the notice says there is no analytics. Reword the row if you want it exact.
