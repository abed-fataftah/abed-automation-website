# 0010. Visit and booking click analytics: rationale

Build spec: [index.md](index.md).

## Context

The site is one static page whose only goal is a booked intro call. Abed wants to know how many people visit and which "Book a Free Call" button they press (hero or final CTA), to tell what works. Nothing measures this today: Netlify Free has no analytics, and the site has no server.

The forces are strict. The site sets no cookies, loads nothing from other companies on first load (one cookieless analytics request was pre allowed by spec 0001), and must work fully with JavaScript off. The privacy notice (spec 0007) promises "no analytics" today and must be rewritten, accurately, in the same change that adds any counting. The budget is zero: the tool must be free for a commercial site. The scope also asks for no cookie banner, which rules out anything that stores data on the visitor's device.

Abed chose: count production only, count the 404 page too, count everyone (Do Not Track is not honoured, since nothing personal is kept), accept an undercount from ad blockers and JavaScript off, keep the dashboard private, and come back to `/architect` if the free plan turns out not to allow commercial use.

Without a decision, the launch ships blind, or a quick script tag lands without the notice being updated, which breaks spec 0007's promise.

## Options considered

### Option 1: Umami Cloud Hobby, loaded directly, attribute events

Umami's hosted service on its free Hobby plan (100K events a month, 1 website, 6 months of data), EU region. One deferred script tag from Umami; clicks are counted by `data-umami-event` attributes on the existing link.

**Pros**:
- Free, cookieless, and click events with no custom JavaScript.
- `data-domains` keeps previews and localhost out even if the tag leaks.
- EU region gives the notice a clean, simple sentence.

**Cons**:
- Commercial use on Hobby is not confirmed in the docs read; it must be checked in the terms.
- Two third party requests per visit, and no integrity hash because the script updates in place.
- Data is kept 6 months only.

### Option 2: Umami Cloud Hobby, script copied into the site

The same service, with the tracker file served from `/public` and pointed at Umami with `data-host-url`.

**Pros**:
- Only the page view request goes to another company; the script is same origin and fixed.

**Cons**:
- The copy goes stale when Umami changes its tracker or its API, and nothing warns when it breaks.
- More to own for a gain of one small request.

### Option 3: GoatCounter

A light, open source counter with a hosted free tier.

**Pros**:
- Very small script, simple dashboard.

**Cons**:
- The free hosted tier is described as for non commercial use; commercial terms are unclear.
- Click events need a little JavaScript calling its count function.

### Option 4: Cloudflare Web Analytics

Cloudflare's free, cookieless beacon.

**Pros**:
- Free, cookieless, adds Core Web Vitals.

**Cons**:
- No custom events, so booking clicks cannot be counted, which fails the feature's *Done when*.

## Rationale

Umami Cloud is the only option that meets all three hard forces at once: free for this volume, cookieless (so no banner), and able to count each booking button by plain HTML attributes. That last point matters on a site whose rule is that the page never depends on JavaScript: the attributes are inert without the script, and `BookCta.astro` stays the one place a booking link is built. GoatCounter is the closest runner up, but its commercial terms are the very risk Option 1 carries, plus it needs custom click code. Cloudflare cannot count clicks at all. The commercial use question on Umami's Hobby plan is real, so it is a hard prerequisite with a defined exit (back to `/architect`) rather than an assumption.

Loading the script directly from Umami (Option 1) beats copying it (Option 2) on maintenance: a copied tracker silently breaks when the service changes, and nobody watches a decorative counter. The cost is one extra small request and no integrity hash; on a site with no logins, forms, or personal data, that is a fair trade, and the Content Security Policy in feature 16 narrows it further.

The smaller calls follow the same forces. Production only, by Netlify's `CONTEXT` at build time, keeps tests out of the numbers and keeps the tag out of every non production build, with `data-domains` as a second guard for the `netlify.app` address. The config lives in `site.analytics`, as spec 0001 planned, guarded by a load time assert like the booking URL; it skips the copy rules because a UUID is not copy. A required, typed `location` prop makes every future booking button name itself instead of silently counting as unknown (runner up: an optional prop defaulting to `unknown`). The tracker's own navigation handling is trusted for same tab clicks, with a small, fully specified fallback module if the live check shows events being lost.

### Research summary (2026-10-30)

Confirmed from Umami's pricing page and docs: free Hobby plan (100K events a month, 1 website, 6 month retention); US or EU region chosen at setup and fixed afterwards; `data-domains`, `data-do-not-track`, `data-auto-track`, and `data-umami-event` with `data-umami-event-*` properties; "Umami does not use cookies". Not confirmed: commercial use on Hobby, the tracker's same tab navigation handling, how IP addresses are handled, and the privacy page URL. Each unconfirmed point is a check in build plan step 1 or 4. Cloudflare Web Analytics has no custom events (third party sources). GoatCounter's commercial terms on the free tier were unclear.

## References

**Links**:
- Umami pricing: https://umami.is/pricing
- Umami Cloud FAQ: https://docs.umami.is/docs/cloud/faq
- Umami tracker configuration: https://docs.umami.is/docs/tracker-configuration
- Umami event tracking: https://docs.umami.is/docs/track-events
- GoatCounter: https://goatcounter.com/
