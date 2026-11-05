# Review, feat/homepage-redesign, 2026-11-05

**Reviewed by**: Sonnet 5.5 (author on unknown)
**Scope**: 60 files, branch vs main (focus on uncommitted changes)
**Verdict**: Approve with nits

## Summary
Replaces the Three.js hero with a lazy loaded dotted canvas portrait, rebuilds the home page, adds /privacy, restyles 404. The uncommitted changes are correct and small: the touch pointerout guard gives the 1.6s hold timer sole ownership of the gaze return, and the header hides the name below the narrow breakpoint. One boundary mismatch between code and docs; no blockers or majors.

## Minor
### 🟡 Header breakpoint is inclusive, docs say "below 390px", `src/components/SiteHeader.astro:37`
**Problem**: Tailwind 4 `max-[390px]` compiles to `width <= 390px`, so the name is hidden at exactly 390px. design.md, the header comment, and verify.md all say "below 390px" and verify.md describes 390 as the case where the name is still shown with nav on row 2.
**Why it matters**: 390px (iPhone 12 to 15 class) is the most common phone width; the name vanishing there is probably unintended and contradicts the documented design.
**Author check (not a defect)**: the built CSS compiles this to `@media not all and (width>=390px)`, which means width below 390, so the name is still shown at exactly 390 (confirmed in Chromium at 389 and 390). No change made.
**Suggested fix (original)**: Use `max-[389px]` (or a `min-[390px]` inverse) if the docs are right; otherwise change the docs to "390px and below". Re-check at 390 and 389.

## Nits
- ⚪ `src/components/SiteHeader.astro:7`, comment line now runs past the 100 col wrapping of its neighbours; rewrap.
- ⚪ `src/motion/portrait.ts:297`, a touch pointer leaving the window while a mouse is also present is fine, but `pointercancel` (touch scroll) is not handled; the timer covers it, so only worth a comment.

## Strengths
- Touch fix is minimal and the reason is documented in a comment; cleanup clears the timer, canvas, aria state, and image opacity.
- Lazy loading contract kept: loader uses dynamic import in try/catch, no hex colors in portrait.ts, booking URL still only via BookCta/site.ts, JS-off fallback image intact.

## Test coverage
none-by-design; gate is `pnpm verify` plus /check verify. Real phone touch check and production Umami check remain pending per author.

## Follow up (2026-11-05, after PR #14 merged)
- Production AC-11 passed. On https://abedautomation.com, each booking button (header, hero, final CTA, 404 body) opened Cal.com in the same tab (no booking made), and the Umami Events activity showed four `book-call` events with `location` `header`, `hero`, `final`, `not-found`.
- Touch testing of the portrait tap still used Chromium touch emulation (Pixel 7 profile) only, not a physical phone. That has not been tried on a real device.
