# 0005. Booking page on Cal.com: rationale

Build spec: [index.md](index.md).

## Context

The site has one job: send visitors to a free 30 minute intro call. The brief rules out forms, accounts, and a custom booking system, and names Cal.com as the booking tool. Spec 0001 already fixed how the site holds the link: one `site.bookingUrl` value, rendered only by `BookCta.astro`, with a placeholder that blocks production builds until this feature delivers a real URL. Production can't ship until then.

The forces:
- Abed is one person running the business alone, so the booking setup must cost nothing to run and need no code to change hours or limits.
- Spec 0001 requires no third party requests on first load and a page that works fully without JavaScript.
- The scope says the booking page "opens separately" and no calendar is embedded.
- Visitors are small business owners: few are technical, many are on phones, and every extra field or step loses some of them.
- Abed's other work (builds for clients) needs protected time, so availability needs real limits.
- Spending so far stays on free tiers (Netlify Free, spec 0001).

## Options considered

### Option 1: Direct Cal.com event link (chosen)

`site.bookingUrl` holds `https://cal.com/abedautomation/intro-call`; buttons link straight to it.

**Pros**:
- Free, nothing to host or maintain, one hop for the visitor.
- Cal.com is a known booking brand, which reads as trustworthy.

**Cons**:
- The URL shows cal.com, not abedautomation.com; the free plan keeps a small Cal.com footer.

### Option 2: Short link on the site's domain

`abedautomation.com/book` redirects (a Netlify rule) to the Cal.com page.

**Pros**:
- A clean URL on Abed's own domain, handy in email signatures and on cards.
- Swapping booking tools later is a one line redirect change.

**Cons**:
- The real URL then lives in `netlify.toml` too, which breaks spec 0001's one place rule unless buttons point at `/book`, and then the build check can no longer see the real URL.
- One extra redirect on every click.

### Option 3: Cal.com custom domain

`book.abedautomation.com` served by Cal.com.

**Pros**:
- The most polished result: own domain, and usually no Cal.com branding.

**Cons**:
- Needs a paid Cal.com plan (as of the time of writing; check current pricing), plus DNS setup, for a page that gets a handful of visits.

### Option 4: Embedded Cal.com calendar

Cal.com's embed script shows the calendar inside the page.

**Pros**:
- The visitor never leaves the site.

**Cons**:
- Loads Cal.com scripts, which breaks the no third party requests rule (spec 0001) unless it waits for a click, and does nothing with JavaScript off. The scope already ruled it out.

## Rationale

Option 1 is the only one that meets every force at no cost: free, no code to run, one URL in one place that the build can still check. Option 2's nicer URL isn't worth splitting the URL across two files and losing the build check, and Option 3 pays monthly for polish a single page site doesn't need yet. Option 4 conflicts with spec 0001 and the scope. If a branded URL matters later, Option 3 is the upgrade path; it changes only the URL and the host check.

Each smaller choice, with the pick and the runner up (Abed chose the first nine; the rest were settled here):

| Choice | Pick | Why | Runner up |
|---|---|---|---|
| Account | New free account, username `abedautomation` | Matches the business name and domain | `abed` (very likely taken) |
| Organizer | abed@abedautomation.com, a Google account | Business address on every invite, same as the footer | Personal Gmail (works now, looks personal) |
| Meeting platform | Google Meet | Already in Google; guests join in the browser | Cal Video (no extra account, less familiar) |
| Link opens | Same tab | Back button works; no screen reader warning needed; still not embedded | New tab with a visible hint |
| Hours | Mon to Fri, 10:00 to 17:00 | Business hours with mornings kept for build work | 09:00 to 18:00 |
| Notice, window | 12 hours, 30 days | Allows next morning bookings; avoids far off dates that get forgotten | 24 hours, 14 days |
| Limits | 15 minutes after each call, 3 calls a day | Time for notes; build days stay mostly free | Buffer with no daily cap |
| Booking form | One optional question | Context for the call without adding friction | Same question, required |
| Confirmation | Instant | No waiting for a free call; the limits already protect time | Abed approves each booking |
| Event name | "Free Intro Call", `/intro-call` | Short, matches the button | "Free 30 Minute Call", `/free-call` |
| Branding | Free plan: name, avatar, dark theme (brand color dropped at setup, see below) | Close to the site's look at no cost | Paid plan with brand color and without Cal.com branding |
| Theme | Dark | Matches the site's charcoal page, so the click feels like the same brand (changed from light at review) | Light |
| Reminders | Cal.com defaults | Free, nothing to set up | A 24 hour reminder (may need a paid plan) |
| Placeholder guard | Remove it, add a `cal.com` host check | The placeholder becomes dead code; the host check keeps a real guard | Swap the URL and leave the dead code |
| Notes field | Relabel Cal.com's built in "Additional notes" | Avoids two text boxes on the form | Add a new custom field |
| Add guests field | Hidden | Fewest fields; a guest can still forward the invite | Keep it visible |
| Starter event types | Delete them | The profile page then shows only the intro call | Hide them |
| Avatar | Square 512 × 512 PNG made from the logo SVG | The existing PNG is 388 × 192 and would crop badly in Cal.com's circle | Use the PNG as is |
| Two factor login | Google sign in for Cal.com, with Google 2 Step Verification (changed at setup, see below) | Whoever controls these accounts controls Abed's calendar and client contacts; one strong login covers both | Cal.com password plus Cal.com two factor |
| Username taken | Fall back to `abed-automation`, then ask | Keeps the brand in the URL | Ask Abed straight away |
| Cancel and reschedule | Cal.com defaults | Guests fix their own mistakes with no email back and forth | Turn off guest rescheduling |
| Build check | Hostname exactly `cal.com` | Catches a wrong tool or a typo; a custom domain later needs only a one line edit | Also check the path shape (too brittle) |

## Exceptions found during setup (2026-10-29)

Two planned settings changed once the real dashboards were in front of us. Abed approved both; the build spec records them under *Exceptions*.

**AC-5, brand color.** The plan assumed the free plan lets you set a brand color. During setup it was not available, so the color stays at Cal.com's default. The choices were to pay for a plan to get it, or to accept the default. Paying monthly for one button color on a page that gets a handful of visits goes against the "free tiers only" force, and the name, avatar, and dark theme already carry the brand. Revisit if a paid plan is ever chosen for other reasons (reminders, no Cal.com footer).

**AC-9, two factor.** The plan assumed a Cal.com email and password login with Cal.com's own two factor on. Abed signed up with "Sign in with Google" instead. Cal.com's two factor setting protects its own password login; with Google sign in there is no Cal.com password, so the real lock is the Google account. Google 2 Step Verification is on, which protects Cal.com, the calendar, and Meet with one strong login instead of two. The runner up (add a Cal.com password just to turn on Cal.com two factor) would add a second way in, which makes the setup weaker, not stronger. The tradeoff: losing the Google account means losing Cal.com too, so the Google backup codes matter.
