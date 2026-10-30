# 0005. Booking page on Cal.com

**Date**: 2026-10-29 (updated 2026-10-29: two setup exceptions, AC-5 and AC-9)
**Status**: In Progress

## Summary

Visitors book the free 30 minute intro call on a Cal.com page, `https://cal.com/abedautomation/intro-call`, set up on a free account under abed@abedautomation.com. The call runs on Google Meet, and Abed's Google Calendar blocks busy times automatically. Every "Book a Free Call" button links straight to that page in the same tab, nothing is embedded, and the site still loads nothing from Cal.com until someone clicks. In the code, the real URL replaces the placeholder, the placeholder guard goes away, and a new check fails the build if the URL ever stops pointing at cal.com, which unblocks production deploys.

## Requirements

**User stories**:
- As a small business owner on the site, I want one click to take me to a clear booking page, so that I can pick a time for a free call without writing an email.
- As Abed, I want bookings to land in my Google Calendar with a Meet link and respect my hours and limits, so that intro calls never clash with other work.
- As Abed after launch, I want the build to fail if the booking link is wrong, so that a typo can't quietly break every button.

**Acceptance criteria**:
- **AC-1**: `site.bookingUrl` is the public URL of the Cal.com event (`https://cal.com/abedautomation/intro-call`, or the URL Cal.com actually issues if the username fallback in *Key invariants* applies). That URL string appears in no file under `src/`, `public/`, `scripts/`, `config/`, or in `netlify.toml`, except `src/content/site.ts`.
- **AC-2**: Every "Book a Free Call" button is rendered by `BookCta.astro` as a plain `<a href>` with no `target` attribute. Clicking it opens the Cal.com event page in the same tab, the browser Back button returns to the site, and this works with JavaScript off.
- **AC-3**: `src/content/site.ts` no longer exports `BOOKING_PLACEHOLDER` and has no `CONTEXT` check. When the module loads, `assertBookingUrl` throws if the URL does not parse, if its protocol is not `https:`, or if its hostname is not exactly `cal.com`. `pnpm verify` passes, and a build with `CONTEXT=production` succeeds.
- **AC-4**: The Cal.com event matches every row of *Event settings* below (title, slug, length, description, location, hours, notice, window, buffer, daily limit, booking form, instant confirmation).
- **AC-5**: The public profile `https://cal.com/abedautomation` shows the display name "Abed Automation", the AD monogram avatar, the dark theme, and lists only the intro call (Cal.com's starter event types are deleted). Exception: the brand color is left at Cal.com's default, because the free plan does not offer it (see *Exceptions*).
- **AC-6**: A test booking made from a different email address in a private browser window is confirmed at once. The guest receives a confirmation email with a Google Meet link, the event appears in Abed's Google Calendar with the same Meet link and abed@abedautomation.com as organizer, and that slot disappears from the booking page. After the test booking is cancelled, the slot comes back and nothing remains in the calendar.
- **AC-7**: A busy event placed in Abed's Google Calendar inside working hours removes the matching slots from the booking page; deleting it brings them back.
- **AC-8**: The earliest slot offered is at least 12 hours from now, no date more than 30 days ahead is bookable, and no slot falls outside Monday to Friday, 10:00 to 17:00 in Abed's timezone.
- **AC-9**: The Cal.com account is registered to abed@abedautomation.com, which is a Google account (Calendar and Meet work for it), and the Cal.com account signs in only through "Sign in with Google" with that account. Google 2 Step Verification (a second login step, such as a phone prompt or authenticator code) is on for abed@abedautomation.com. Exception: Cal.com's own two factor setting is not used (see *Exceptions*).

## Decision

**Chosen option**: Option 1: A direct Cal.com event link on a free account, opened in the same tab.

Abed sets up the Cal.com account, calendar connection, availability, and event exactly as in *Feature design*; then `/develop` puts the issued URL into `site.ts` and replaces the placeholder guard with a cal.com host check.

**Who does what**: build plan tasks 1 to 6 happen in the Cal.com and Google dashboards and only Abed can do them; `/develop` walks Abed through them as a checklist and waits for the issued URL. Tasks 7 to 9 are code.

**Boundaries** (what this feature does not do):
- Click counting on the buttons: feature 15 (it hooks into `BookCta.astro`; no UTM or tracking parameters are added to the URL here).
- Privacy wording about what Cal.com collects: feature 12 (see *Follow-up*).
- Button look and placement: specs 0003 and features 6 and 10. Button label: `site.cta.bookLabel` (spec 0004).

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**:
The site stores nothing. All booking data lives outside the repo:

| Where | What it holds |
|---|---|
| Cal.com (account `abedautomation`) | Profile, availability schedule, the intro call event, and each booking: guest name, email, optional note, time, status |
| Google Calendar of abed@abedautomation.com | Busy times (read for conflict checks) and one event per booking with its Meet link (written) |
| `src/content/site.ts` | `bookingUrl: string`, the one public URL (no other field changes) |

**State transitions** (a booking, owned by Cal.com, not the site): booked (instantly confirmed) → rescheduled or cancelled by the guest or Abed from the email links → done after the call. Cal.com defaults apply; the site plays no part.

**Event settings** (the event, AC-4):

| Setting | Value |
|---|---|
| Title | Free Intro Call |
| URL slug | `intro-call` |
| Length | 30 minutes, one fixed length |
| Description | A free 30 minute video call about your website, web app, or automation needs. You tell me what you need, and I’ll share how I’d approach it. No obligation. |
| Location | Google Meet (needs the Google Calendar connection; a Meet link is created per booking) |
| Availability | Monday to Friday, 10:00 to 17:00, in Abed's own timezone (set on the availability schedule) |
| Minimum notice | 12 hours |
| Booking window | 30 calendar days into the future |
| Buffer | 15 minutes after each call, none before |
| Daily limit | At most 3 bookings per day |
| Slot interval | Cal.com default (equal to the 30 minute length) |
| Booking form | Name and email (required, Cal.com built in). The built in "Additional notes" field is relabeled "What would you like to talk about?", stays optional. "Add guests" is hidden. No phone, company, or budget fields. |
| Confirmation | Instant ("requires confirmation" off) |
| Reminders | Cal.com default emails plus the Google Calendar invite; no extra workflows |
| Cancel and reschedule | Cal.com defaults (guest can do either from the confirmation email) |

**Profile and account settings** (AC-5, AC-9; two rows changed by *Exceptions* below):

| Setting | Value |
|---|---|
| Sign up email | abed@abedautomation.com, signed up and signed in through "Sign in with Google" (no Cal.com password) |
| Username | `abedautomation` |
| Display name | Abed Automation |
| Avatar | AD monogram, square 512 × 512 PNG: the monogram from `src/components/Logo.astro` centered on `#1A1816` with A and D in `#F2EDE4` (the site's `fg`) and the brackets in `#FF6B57`. Saved as `docs/design/assets/cal-avatar.png` so it can be made again. |
| Brand color | Skipped: left at Cal.com's default (not offered on the free plan) |
| Theme | Dark (matches the site's charcoal page) |
| Calendar | Google Calendar of the same account, used both for conflict checks and as the destination calendar |
| Two factor authentication | Cal.com's own setting not used; Google 2 Step Verification on for abed@abedautomation.com protects the login instead |
| Starter event types | Deleted, so the profile lists only the intro call |

**Exceptions** (found during setup, recorded 2026-10-29; Abed approved both):

| AC | Planned | What was done | Why it is acceptable |
|---|---|---|---|
| AC-5 | Brand color `#FF6B57` on the Cal.com page | Left at Cal.com's default | The free plan does not offer a brand color. The page still shows the name, avatar, and dark theme, so the click still reads as the same brand. Paying only for a button color is not worth it yet. |
| AC-9 | Cal.com two factor authentication on | Cal.com sign in only through Google; Google 2 Step Verification on | With Google sign in, Cal.com has no password of its own to protect, and its two factor setting covers only email and password logins. The one login that matters is the Google account, and that already needs a second step. It also guards the calendar and Meet, which are the same account. |

**API surface**:
The site has no endpoints. Its one interface is the outbound link:

| Surface | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `BookCta.astro` link | GET (browser navigation, same tab) | none (no query parameters) | the Cal.com event page | public | Cal.com down: the visitor sees Cal.com's own error page; the site shows nothing |
| `assertBookingUrl(site.bookingUrl)` at module load | build time call | `site.bookingUrl` | nothing on success | n/a | throws with a clear message: invalid URL, not https, host not `cal.com` |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Button link | `href` | `site.bookingUrl` |
| `site.bookingUrl` value | the event URL | issued by Cal.com after task 5: `https://cal.com/` + username + `/` + slug |
| Username | `abedautomation` | decided here (fallback in *Key invariants*) |
| Button label | "Book a Free Call" | `site.cta.bookLabel` (spec 0004) |
| Event title, slug, description | text on the Cal.com page | *Event settings* above |
| Times shown to the visitor | slots in the visitor's timezone | Cal.com converts from Abed's schedule timezone to the visitor's browser timezone |
| Abed's timezone | schedule timezone | Abed's local timezone, set on the Cal.com availability schedule in task 4 |
| Free or busy | available slots | Abed's Google Calendar (conflict check) plus the hours, notice, window, buffer, and daily limit above |
| Meet link | join link in the email and calendar event | created by Google Meet through the Google Calendar connection, per booking |
| Organizer shown on invite | abed@abedautomation.com | the Google account connected in task 3 |
| Profile look | avatar, name, theme (color is Cal.com's default) | *Profile and account settings* and *Exceptions* above |
| Host check | `cal.com` | decided here; literal in `site.ts` |

**Key invariants**:
- The booking URL lives only in `site.bookingUrl`, and `BookCta.astro` is the only component that renders it (spec 0001, unchanged).
- The build fails unless the URL is valid, https, and on the host `cal.com`.
- No request to Cal.com happens on page load; Cal.com loads only after a click (spec 0001, unchanged).
- The link carries no `target`, no query parameters, and no tracking.
- Username fallback: if `abedautomation` is taken at sign up, use `abed-automation`; if that is taken too, stop and ask Abed. The AC-1 URL follows whichever username Cal.com issues.
- Abed's calendar is checked for conflicts on every slot; a busy event always wins over the schedule.

**Security model**:
- The site handles no booking data, no secrets, and no credentials. The URL is public.
- Cal.com and Google hold the guest's name, email, optional note, and call time; feature 12 must say so (no regulated data beyond basic contact details).
- The Cal.com account has no password of its own; it signs in only through Google. So the Google account abed@abedautomation.com is the single key to Cal.com, the calendar, and Meet, and it has 2 Step Verification on. Its password and backup codes stay out of the repo.
- Do not add an email and password login to Cal.com later. If one is ever added, turn on Cal.com's own two factor setting with it, or the AC-9 exception no longer holds.
- The existing `Referrer-Policy: strict-origin-when-cross-origin` header sends Cal.com only the site's origin on the click, not a full path.

**Configuration required**:
- No environment variables or secrets. The Netlify `CONTEXT` variable is no longer read by `site.ts`.
- Prerequisites outside the repo: abed@abedautomation.com is a working mailbox that is also a Google account with Calendar and Meet (for example Google Workspace), and a free Cal.com account under it.

**Critical test scenarios**:
- Happy path: from the live preview, click "Book a Free Call", book the first free slot from a second email in a private window, receive the Meet link, see the event in Abed's calendar, then cancel, verifies **AC-2**, **AC-6**
- Failure case: set `bookingUrl` to `https://calendly.com/x`, run `pnpm build`, it fails with the host message; revert, verifies **AC-3**
- Conflict: add a busy block in Abed's Google Calendar at a free slot, refresh the booking page, the slot is gone, verifies **AC-7**
- Limits: the first slot is 12 hours or more away and the date picker stops at 30 days, verifies **AC-8**
- Auth/permission: not applicable to visitors (public page, no login); account side, Cal.com signs in through Google only and the Google account's security page shows 2 Step Verification on, verifies **AC-9**

## Build plan

Skateboard: the thinnest usable whole is "a click books a real call". So the Cal.com side is set up and proven by a real test booking first, then the code takes the real URL in one small change. Tasks 1 to 6 are Abed's, in the dashboards; 7 to 9 are code.

1. Confirm abed@abedautomation.com receives mail, signs in to Google Calendar and Meet, and has Google 2 Step Verification on; if not, stop and decide how to provide it before going on, satisfies **AC-9**
2. Create the free Cal.com account through "Sign in with Google" with that account and username `abedautomation` (fallback per *Key invariants*); set display name and dark theme (brand color skipped, see *Exceptions*); make and upload the square avatar; delete the starter event types, satisfies **AC-5**, **AC-9**
3. Connect the Google Calendar of the same account for conflict checks and as the destination calendar; install Google Meet, satisfies **AC-6**, **AC-7**
4. Set the availability schedule to Monday to Friday, 10:00 to 17:00 in Abed's timezone, satisfies **AC-8**
5. Create the event per *Event settings* (title, slug, length, description, Meet location, notice, window, buffer, daily limit, booking form, instant confirmation); note the issued URL, satisfies **AC-4**, **AC-8**
6. Book a test call from a second email in a private window, check the emails, calendar event, Meet link, and organizer; add a busy block to check conflicts; then cancel and clean up, satisfies **AC-6**, **AC-7**
7. In `src/content/site.ts`, set `bookingUrl` to the issued URL; remove `BOOKING_PLACEHOLDER`, its comment, and the `CONTEXT` branch; add the hostname check (`url.hostname !== 'cal.com'` throws "site.bookingUrl must be a cal.com link") next to the https check, satisfies **AC-1**, **AC-3**
8. Confirm `BookCta.astro` renders no `target` and the URL appears nowhere else (repo search for the URL and for `cal.com` outside `docs/`), satisfies **AC-1**, **AC-2**
9. Run `pnpm verify`, then a build with `CONTEXT=production`; on a branch preview, click each "Book a Free Call" with JavaScript on and off and check Back returns to the site, satisfies **AC-2**, **AC-3**

## Consequences

**Positive**:
- Booking works for real, and production deploys are no longer blocked.
- Zero cost, zero code to maintain for booking itself; changing hours or limits later is a dashboard edit, not a deploy.
- The host check catches a pasted wrong link (another tool, a typo) at build time.

**Negative / tradeoffs**:
- The URL shows `cal.com`, not Abed's domain, and the free plan keeps a small Cal.com footer on the booking page.
- The Cal.com buttons use Cal.com's default color, not the site's coral, so the hand off is a little less seamless.
- Losing access to the Google account also locks Abed out of Cal.com, since there is no separate Cal.com login.
- Booking depends on three outside services (Cal.com, Google Calendar, Google Meet); if any is down, visitors can't book and the site can't help.
- Moving away from Cal.com later (or to a Cal.com custom domain) means editing the host check too, not only the URL.
- If abed@abedautomation.com is not already a Google account, making it one usually means a paid Google Workspace seat.
- No reminder beyond the defaults, so some no shows are likely.

**Neutral**:
- `site.ts` loses its only use of `process.env`, so it no longer cares which Netlify context builds it.
- Several docs describe the placeholder guard and go stale (see *Follow-up*).

## Follow-up

- [ ] `/sync`: root `AGENTS.md` rule "Production builds fail on purpose while `BOOKING_PLACEHOLDER` is set" is stale once task 7 lands; spec 0001 (*Content and booking URL*, the Consequences line about failing production builds, and its `verify.md` placeholder step) and `docs/design/handoff.md` (checklist line about the placeholder) describe the old guard.
- [ ] Feature 12 (privacy notice): say that booking happens on Cal.com, which collects name, email, and an optional note, and that the call runs on Google Meet.
- [ ] Feature 15 (click analytics): count clicks inside `BookCta.astro`; this spec adds no URL parameters, so bookings can't be split by hero vs final CTA on the Cal.com side.
- [ ] After the first month of real bookings, revisit hours, the daily limit, and whether a 24 hour reminder is worth a paid plan. If a paid plan is chosen, set the brand color to `#FF6B57` for both light and dark and close the AC-5 exception.
- [ ] Keep the Google account's backup codes somewhere safe outside the repo, since that account is now the only way into Cal.com.
