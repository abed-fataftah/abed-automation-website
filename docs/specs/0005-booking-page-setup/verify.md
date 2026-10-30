# Verify: Booking page setup · spec 0005 · updated 2026-10-29 (AC-5, AC-9 exceptions)
_Steps derived from spec 0005 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones. Steps marked (Abed) need Abed's accounts._

## UI / manual
- [ ] On a branch preview with JavaScript on, click each "Book a Free Call" button → the Cal.com event page opens in the same tab; Back returns to the site → AC-2
- [ ] Repeat with JavaScript off → same result → AC-2
- [ ] Inspect each booking button → `<a href="https://cal.com/abedautomation/intro-call">` (or the issued URL), no `target` attribute, no query string → AC-1, AC-2
- [ ] Open the event page and compare it with *Event settings*: title, length, description text character for character (curly ’), Google Meet as location, the form shows name, email, optional "What would you like to talk about?", and no "Add guests" → AC-4
- [ ] On the event page, the first offered slot is 12 hours or more away, nothing past 30 days is bookable, and only Monday to Friday, 10:00 to 17:00 (Abed's timezone) is offered → AC-8
- [ ] Open `https://cal.com/abedautomation` → display name "Abed Automation", AD monogram avatar, dark theme, only "Free Intro Call" listed; buttons in Cal.com's default color (accepted exception, not a failure) → AC-5
- [ ] (Abed) In a private window, book a slot with a second email address → confirmed at once; that inbox gets a confirmation with a Meet link; Abed's Google Calendar shows the event with the same Meet link and abed@abedautomation.com as organizer; the slot is gone from the page → AC-6
- [ ] (Abed) Cancel that booking → the slot returns, the calendar event is gone → AC-6
- [ ] (Abed) Add a busy block in Abed's Google Calendar on a free slot, refresh the event page → that slot is gone; delete the block → it returns → AC-7
- [ ] (Abed) Cal.com settings: account email is abed@abedautomation.com and sign in is through Google (no Cal.com password); the Google account's security page shows 2 Step Verification on; Google Meet works for that account. Cal.com's own two factor being off is the accepted exception → AC-9

## Commands
- [ ] `pnpm verify` → exits 0 → AC-3
- [ ] `$env:CONTEXT='production'; pnpm build` (POSIX: `CONTEXT=production pnpm build`) → succeeds → AC-3
- [ ] Temporarily set `bookingUrl` to `https://calendly.com/x`, run `pnpm build` → fails with "must be a cal.com link"; set it to `http://cal.com/abedautomation/intro-call` → fails with "must use https"; set it to `not a url` → fails with "not a valid URL"; revert each → AC-3
- [ ] `grep -rn "BOOKING_PLACEHOLDER\|CONTEXT" src/` → no match → AC-3
- [ ] Search the repo outside `node_modules`, `dist`, and `docs` for the booking URL and for `cal.com` → found only in `src/content/site.ts` → AC-1

## Value sourcing
- [ ] Button `href`: changing only `site.bookingUrl` changes every booking button → comes from `site.bookingUrl`
- [ ] Button label: comes from `site.cta.bookLabel`
- [ ] Event URL: equals `https://cal.com/` + the issued username + `/intro-call`
- [ ] Slot times: shown in the visitor's timezone (change the computer's timezone, the times shift), based on Abed's schedule timezone
- [ ] Free or busy: follows Abed's Google Calendar plus the hours, notice, window, buffer, and daily limit (AC-7, AC-8 steps)
- [ ] Meet link and organizer: come from the connected Google account (AC-6 step)
- [ ] Avatar file: `docs/design/assets/cal-avatar.png` exists and matches the uploaded avatar

## Acceptance-criteria coverage
- AC-1: UI step 3, command step 5 · AC-2: UI steps 1, 2, 3 · AC-3: command steps 1 to 4 · AC-4: UI step 4 · AC-5: UI step 6 · AC-6: UI steps 7, 8 · AC-7: UI step 9 · AC-8: UI step 5 · AC-9: UI step 10
