# 0010. Visit and booking click analytics with Umami Cloud

**Date**: 2026-10-30
**Status**: In Progress

## Summary

The live site counts page visits and "Book a Free Call" clicks with Umami Cloud (a privacy friendly counting service) on its free Hobby plan, with data stored in the EU. It sets no cookies, so no cookie banner is needed. One deferred script tag goes into the shared layout, but only in Netlify production builds and only counting on abedautomation.com. Each booking button carries two HTML attributes that name the click and say which button it was (hero or final CTA), so no custom JavaScript is written. The privacy notice paragraph *Visiting this site* is rewritten in the same change to name Umami and say what it records.

## Requirements

**User stories**:
- As Abed, I want to see how many people visit and which "Book a Free Call" button they click, so that I can tell what works.
- As a visitor, I want to read the site without cookies or a consent banner, and find a plain account of what is counted.

**Acceptance criteria**:
- **AC-1**: A build with `CONTEXT=production` puts exactly one `<script defer src="{site.analytics.scriptUrl}" data-website-id="{site.analytics.websiteId}" data-domains="{site.analytics.domain}">` in the `<head>` of every page (`/` and `/404.html`). A build without `CONTEXT=production` (local `pnpm build`, `pnpm dev`, CI, deploy previews, branch deploys) has no Umami script tag anywhere in `dist/`.
- **AC-2**: The tracker never changes the page: with the Umami host blocked in DevTools, or with JavaScript off, the page renders and behaves exactly as before, and every "Book a Free Call" button still opens Cal.com in the same tab. The script tag uses `defer`, so it never blocks the first paint.
- **AC-3**: On abedautomation.com, opening `/` sends one page view to Umami, and the Umami dashboard shows it with path `/` within a few minutes. Opening a missing path shows that path in the dashboard as well.
- **AC-4**: Every "Book a Free Call" button has `data-umami-event="{site.analytics.bookEvent}"` and `data-umami-event-location` set to its location (`hero` or `final`). On abedautomation.com, clicking one sends exactly one `book-call` event with that `location` before the browser leaves for Cal.com (the event request shows as completed in the Network panel with "Preserve log" on), Cal.com opens in the same tab, and Back returns to the site. The dashboard shows the event split by `location`.
- **AC-5**: `BookCta.astro` requires a `location` prop typed `'hero' | 'final'`; a `<BookCta />` without it fails `pnpm check`.
- **AC-6**: The site sets no cookies and writes nothing to `localStorage` or `sessionStorage`: after loading `/` on abedautomation.com and clicking a booking button, DevTools Application shows no cookie and no storage key for the site's origin.
- **AC-7**: On first load of `/` on abedautomation.com, every request goes to the site's own origin or to hosts under `umami.is`, and nowhere else.
- **AC-8**: `site.analytics` holds `scriptUrl`, `websiteId`, `domain`, and `bookEvent`, and these values appear in no other file under `src/`. When `site.ts` loads, `assertAnalytics` throws (failing `astro dev`, `astro build`, and `check:copy`) if `scriptUrl` is not `https:`, if its hostname is not `umami.is` or a subdomain of it, if `websiteId` is not a UUID (`8-4-4-4-12` hex), or if `domain` is not exactly `abedautomation.com`.
- **AC-9**: The *Visiting this site* privacy paragraph is the approved wording in *Privacy wording* below, with its Umami link as a `{ text, href }` part to an `https://` address, and `privacy.updated` is the date the change ships. `pnpm check:copy` passes.
- **AC-10**: `pnpm verify` exits clean.

## Decision

**Chosen option**: Option 1: Umami Cloud Hobby (free), EU region, loaded directly from Umami with `defer`, production only, clicks named by HTML attributes.

The site loads Umami's own tracker script in Netlify production builds, counts on abedautomation.com only, and tags each booking button with `data-umami-event` attributes; nothing else on the site changes.

Two prerequisites for Abed come before any code: Umami's terms must allow commercial use on Hobby (if they don't, this spec goes back to `/architect` and nothing is built), and Umami's privacy page must support the notice wording below.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**: no data is stored by the site. Umami Cloud stores page views and events (path, referrer, country, browser, device, event name, `location` property) in its EU region for 6 months on Hobby. The site's only new data is configuration:

| Field (`site.analytics`) | Type | Required | Value |
|---|---|---|---|
| `scriptUrl` | string | yes | `https://cloud.umami.is/script.js` (the `src` from the tracking code Umami shows for the website) |
| `websiteId` | string (UUID) | yes | `15d2c8d1-91bd-4e51-8897-f7ec3bb4fa6c` (the `data-website-id` from that tracking code) |
| `domain` | string | yes | `abedautomation.com` |
| `bookEvent` | string | yes | `book-call` |

**State transitions**: none.

**API surface** (no endpoints; the surfaces are markup):

| Surface | Kind | Key inputs | Output | Gate | Failure |
|---|---|---|---|---|---|
| `Base.astro` head | `<script defer>` tag | `site.analytics.scriptUrl`, `websiteId`, `domain` | the tag, rendered after the font preload | rendered only when `process.env.CONTEXT === 'production'` at build | script blocked or down: no counting, page unchanged |
| `BookCta.astro` | `<a>` attributes | new required prop `location: 'hero' \| 'final'`, `site.analytics.bookEvent` | `data-umami-event` and `data-umami-event-location` on the existing link, beside `data-book-cta` | always rendered (inert without the script) | none; the link works without them |
| `index.astro` | the two `<BookCta>` usages | none | hero gets `location="hero"`, final CTA gets `location="final"` | none | `pnpm check` fails if one is missing (AC-5) |
| `site.ts` | `assertAnalytics(site.analytics)` beside `assertBookingUrl` | the four fields | throws with the field name and value | runs when the module loads | build and dev stop with a clear message (AC-8) |
| `check-copy.mjs` | `SKIP_PATHS` gains `analytics` | none | the config values skip the voice rules (a UUID segment can look like a year) | none | none |

Umami's tracker handles the click: for a same tab link with `data-umami-event`, it cancels the default navigation, sends the event, then sets `location.href`. Build plan step 4 checks this in the browser (AC-4). If it does not hold (the event is cancelled when the page unloads), add a small module in `BookCta.astro` instead: on a plain left click (no modifier key, primary button), `preventDefault`, call `window.umami?.track(bookEvent, { location })`, wait for it or 300 ms, whichever comes first, then set `location.href`. Remove the `data-umami-event` attributes in that case so a click is never counted twice.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Layout head | script URL, website ID | the tracking code Umami shows for the website, copied by Abed into `site.analytics` (build plan step 1) |
| Layout head | counted hostname | `site.analytics.domain`, `abedautomation.com` (feature 16 domain) |
| Layout head | whether to render the tag | Netlify's build variable `process.env.CONTEXT` (`production` on the main deploy), the same variable spec 0001 used |
| Page view | path, referrer, country, browser, device | collected by Umami's tracker; `data-auto-track` left at its default (on) |
| Booking click | event name | `site.analytics.bookEvent`, `book-call` |
| Booking click | `location` property | `BookCta` `location` prop, set per usage in `index.astro` |
| Privacy notice | tool name, what is recorded, region, retention | Umami account settings (EU, chosen at setup) and the Hobby plan (6 months), confirmed by Abed in step 1 |
| Privacy notice | last updated date | `privacy.updated`, set to the ship date |

**Key invariants**:
- At most one analytics script, from a host under `umami.is`, and only in production builds. No other third party request is added.
- `BookCta.astro` stays the only component rendering a booking link; the Umami attributes live only there.
- The site itself sets no cookie and writes no browser storage.
- The tracker is never needed for the page to work: no content, style, or link depends on it.
- Any change to what is counted, the region, or the tool updates the privacy paragraph and `privacy.updated` in the same change (spec 0007 rule).

**Privacy wording** (draft for Abed's approval; replaces the first string of the *Visiting this site* body, keeping the Netlify link part after it):

> The site sets no cookies. To see how many people visit and which booking button they use, it counts visits with Umami, a privacy friendly service that works without cookies. Umami records the page you open, the site that sent you, and your country, browser, and device type, never your name or email address. This data is stored in the EU and kept for six months. See
> `{ text: 'Umami’s privacy policy', href: <the privacy page URL confirmed in step 1> }`
> `. Apart from Umami, the site loads nothing from other companies while you read it. It is hosted by Netlify, which processes technical details of each visit, such as your IP address, browser, and the page you open, to deliver the site and keep it secure. See `
> `{ text: 'Netlify’s privacy policy', href: 'https://www.netlify.com/privacy/' }` `'.'`

**Security model**: public static markup; no secrets. The website ID is public by design (it ships in the HTML), so it lives in the repo. The Umami dashboard is private, behind Abed's Umami login on abed@abedautomation.com; no share link. Compliance: cookieless counting needs no consent banner under the ePrivacy cookie rule, since nothing is stored on the device; the notice names the processor, purpose, data, region, and retention (GDPR Article 13 basics, as in spec 0007). No Subresource Integrity hash, because Umami updates the script in place (see *Consequences*).

**Configuration required**:
- No environment variables or secrets. Netlify's built in `CONTEXT` variable is read at build time.
- Prerequisite (Abed, before coding): an Umami Cloud Hobby account on abed@abedautomation.com, EU data region, with a website for `abedautomation.com`.

**Critical test scenarios**:
- Happy path: on abedautomation.com, open `/`, click the hero button, go Back, click the final CTA button; the dashboard shows two page views and two `book-call` events, one per `location`, verifies **AC-3**, **AC-4**
- Failure case: block `*.umami.is` in DevTools and reload; the page and both booking buttons behave exactly as before, verifies **AC-2**
- Gate: `pnpm build` then `grep -r umami dist/` finds nothing; `CONTEXT=production pnpm build` finds one tag per page, verifies **AC-1**
- Guard: set `websiteId` to `abc`, then `scriptUrl` to `http://cloud.umami.is/script.js`, then `domain` to `www.abedautomation.com`; `pnpm build` fails each time naming the field, verifies **AC-8**
- No storage: on abedautomation.com, the Application panel shows no cookies and no storage keys after a visit and a click, verifies **AC-6**

## Build plan

Skateboard: the smallest whole that counts both things ships first (tag plus attributes plus honest notice, together, because the notice must never be wrong), then live verification at launch.

1. Abed: read Umami Cloud's terms and confirm the Hobby plan allows commercial use; if not, stop and bring this spec back to `/architect`. Create the account on abed@abedautomation.com, pick the EU region, add website `abedautomation.com`, copy the tracking code's `src` and `data-website-id`. Open Umami's privacy page, note its URL, and check it supports the *Privacy wording* (no cookies, what is recorded). Approve or adjust the wording. Prerequisite for every AC.
2. `site.ts`: add `analytics` to `SiteContent` and the `site` object with the four values; add `assertAnalytics` beside `assertBookingUrl`. `check-copy.mjs`: add `analytics` to `SKIP_PATHS`. satisfies **AC-8**
3. `BookCta.astro`: add the required `location` prop and the two `data-umami-event` attributes; set `location` on both usages in `index.astro`. `Base.astro`: render the deferred script tag in the head when `process.env.CONTEXT === 'production'`. Rewrite the *Visiting this site* paragraph with the approved wording and set `privacy.updated`. Run `pnpm verify`, then `CONTEXT=production pnpm build` and check `dist/`. satisfies **AC-1**, **AC-2**, **AC-5**, **AC-9**, **AC-10**
4. After feature 16 puts abedautomation.com live: run the happy path, failure case, and no storage scenarios on the live site, and check the click navigation behaviour in the Network panel; if the event is lost, apply the fallback module in *Feature design* and repeat. satisfies **AC-3**, **AC-4**, **AC-6**, **AC-7**

## Consequences

**Positive**:
- Visits and each booking button's clicks become visible, with no cookie banner and no custom JavaScript.
- Previews, local runs, and CI never pollute the numbers.
- The notice stays honest: the wording ships in the same change as the tag.

**Negative / tradeoffs**:
- A third party script now runs on every production page, an exception to the "no third party requests on first load" rule and two requests per visit (script, then page view), not the "exactly one" spec 0001 expected.
- Ad blockers and JavaScript off mean an undercount; the numbers are trends, not exact counts.
- No Subresource Integrity: if Umami's script host were compromised, the script would run on the site. Accepted for a site with no logins, forms, or personal data; the Content Security Policy in feature 16 limits what it can reach.
- Free Hobby keeps only 6 months of data and depends on Umami keeping a free plan; losing it means paying or coming back to `/architect`.
- Counting can only be checked end to end on the live domain, so AC-3, AC-4, AC-6, and AC-7 wait for feature 16.

**Neutral**:
- `BookCta` gains a required prop; any future booking button must name its location (add a value to the union).
- `check:copy` skips `analytics`, guarded by `assertAnalytics` instead.

## Follow-up

- [ ] Feature 16: the Content Security Policy must allow the Umami host in `script-src` and `connect-src` (the host from `site.analytics.scriptUrl`, plus the host the tracker posts to, seen in the Network panel).
- [ ] `/sync`: root `AGENTS.md` rule "No third party requests on first load" needs the Umami exception; spec 0001's "exactly one cookieless analytics request" now reads two requests to Umami.
- [ ] `/sync`: record in root `AGENTS.md` `Declined:` that Agent Skills and MCP servers for Umami were offered and declined.
- [ ] Spec 0007 AC-3 and AC-7 ("no request to any other origin", "no analytics") become untrue when this ships; `/sync` should flag them stale.
- [ ] `docs/.agent-cache/` is not in `.gitignore`; decide whether the research cache should be committed.

## References

**Project sources**:
- Spec 0001: analytics deferred to feature 15, cookieless and host independent, `BookCta.astro` as the one place to count clicks, `process.env.CONTEXT` as the production signal
- Spec 0005: booking links open in the same tab with no `target` (AC-2)
- Spec 0007: the privacy notice rule and the *Visiting this site* paragraph this rewrites
- `AGENTS.md`: no cookies, no third party requests on first load, copy lives in `site.ts`

**Practices & standards**:
- Cookieless analytics needs no consent under the ePrivacy cookie rule (nothing stored on the device)
- GDPR Article 13 transparency basics
- Progressive enhancement: the tracker is optional, the page never depends on it

**Links**:
- Umami pricing (Hobby plan limits): https://umami.is/pricing
- Umami Cloud FAQ (free Hobby plan, EU or US region chosen at setup): https://docs.umami.is/docs/cloud/faq
- Umami tracker configuration (`data-domains`, `data-do-not-track`, `data-auto-track`): https://docs.umami.is/docs/tracker-configuration
- Umami event tracking (`data-umami-event`, `data-umami-event-*`): https://docs.umami.is/docs/track-events
