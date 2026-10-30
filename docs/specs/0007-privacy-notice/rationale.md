# 0007. Privacy notice: rationale

Decision record for [index.md](index.md). `/develop` builds from the index; this file explains why.

## Context

The site is one static page on Netlify with no forms, accounts, cookies, or third party requests on first load (spec 0001). Visitors still leave data behind: Netlify keeps request logs for every visit, the booking button sends people to Cal.com, which collects a name, email, and note and writes the booking into Abed's Google Workspace calendar with a Meet link (spec 0005), and anyone can email abed@abedautomation.com. Feature 15 will later add cookieless visit counting. The scope asks for a short notice, reachable from the footer, that matches what the site actually collects, and spec 0004 left only the `Privacy` title and footer label for this feature.

The legal ground is unsettled. Abed works alone, is based in Palestine today, which has no general data protection law in force as far as is known here, and plans to move to Malaysia within months. Malaysia's Personal Data Protection Act will likely apply once the business runs from there, and it expects notices in Malay as well as English, which conflicts with the site's English only rule. GDPR reaches a business outside the EU only when it clearly targets people in the EU; clients may come from anywhere, so its notice basics are the safest common standard to write to, without claiming any one law governs. This is not legal advice, and none was sought.

Design constraints shape the form: the page must read fully with JavaScript off, every line of copy lives in `site.ts`, the copy guard bans team wording, written years, straight quotes, and brackets, and `design.md` already reserves a `#privacy` section above the footer with 32px padding and an h2. There is no h3 style and no style for links inside running text yet. Without a notice, the footer link stays missing, visitors can't learn what Cal.com and Netlify do with their details, and Release 1 ships with a known gap.

## Options considered

### Option 1: In page `#privacy` section from typed text parts

A section after the final CTA, rendered by one component from `site.privacy`: six short h3 topics, each one paragraph made of text, link, and email parts, plus a build time "last updated" date. The footer links to `/#privacy`.

**Pros**:
- Matches `design.md`, the prototype, and the handoff, which all plan this section; no new route, title, or metadata.
- Reachable from every page with one link, readable with JavaScript off, nothing to load.
- Typed parts let real links and the shared email sit inside sentences while every word stays in `site.ts`.

**Cons**:
- Adds a block of fine print to the end of a page meant to sell.
- The parts array is clumsier to edit than a plain string.
- A later, longer notice (for example a Malay version) would crowd the page.

### Option 2: Separate `/privacy` page

Its own route with the shared header and footer, the same content, and a footer link to `/privacy`.

**Pros**:
- Keeps the home page short and focused on booking.
- Room to grow into a longer or bilingual notice without touching the home layout.

**Cons**:
- A second page to title, describe, keep out of the nav, and decide indexing for (feature 11).
- Contradicts design.md, the prototype, and the 404 nav plan, which all point at `#privacy`.
- A click away from the content it qualifies, for a notice only six paragraphs long.

### Option 3: Collapsed `<details>` section on the page

The same section, with the body folded under a native disclosure that works without JavaScript.

**Pros**:
- The page looks shorter; the content is still in the HTML.

**Cons**:
- The footer link lands on a closed box, so the visitor needs a second click.
- Search for text in the page (Ctrl+F) and some screen readers handle closed `<details>` inconsistently, which works against "never hide content".

### Option 4: Plain text paragraphs with no links

The same section, but each topic is a plain string; services are named without links to their policies.

**Pros**:
- Simplest content shape: `string[]`, nothing to render beyond text.

**Cons**:
- Visitors must look up Netlify's, Cal.com's, and Google's policies themselves, though those hold the details Abed can't control.
- The email can't be a link without duplicating the address in the text.

## Rationale

Option 1 is the only one that honours every existing plan (design.md, the prototype, the 404 page's `/#privacy` link) while keeping the notice one click from any page with JavaScript off. A separate page earns its cost only when the content outgrows the home page, which a six paragraph plain notice does not; if the Malaysia follow-up adds a Malay version, moving to a route then is a contained change, because the content already lives in one typed object and one component.

Plain words with the GDPR basics fit a sole trader whose clients may be anywhere and whose own jurisdiction is about to change: it states who, what, why, who else, how long, and what you can ask, which is what every modern privacy law asks for, without the legal tone that would clash with the page. Leaving the country out keeps the notice true through the move, and writing only today's facts (no analytics yet) keeps it accurate at every release; feature 15 adds its paragraph with the tool itself.

The typed parts (`string`, `{ text, href }`, `{ email: true }`) are the smallest shape that allows links inside sentences without putting markup or a duplicate email in `site.ts`. A date field validated by the copy guard is needed because the guard rejects written years in copy; keeping the ISO date apart and formatting it at build time solves that without weakening the rule for any other string. The 21 day reply window meets both GDPR's one month limit and the PDPA's 21 day access window, so it will not need changing after the move.

### Smaller calls made in this spec

- **Rendering in a component** (`PrivacyNotice.astro`) rather than inline in `index.astro` like the hero: the parts renderer and date formatting are logic the page should not carry. Runner up: inline, like the tools line.
- **h3 at 16px / 1.6, 700, `fg`**: one step above the 14px body so topics scan, reusing existing size tokens. Runner up: 14px bold, which reads too close to the body.
- **Inline links in `fg` with an underline, hover underline in `accent`**: underline makes them distinct without relying on color, and accent stays non text as design.md requires. Runner up: `muted` with underline, which loses contrast against the surrounding text.
- **Footer link to `/#privacy` on every page**: one href that works on both `/` and the 404 page. Runner up: `#privacy` on home only, which needs a page check in the footer.
- **Policy links open in the same tab**, matching the booking link (spec 0005). Runner up: new tab, which adds a `target` and hides the Back button.
