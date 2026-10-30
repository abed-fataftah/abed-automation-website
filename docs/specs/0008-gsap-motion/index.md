# 0008. GSAP motion: quiet scroll reveals, drawn lines, hero underline replay, soft hovers

**Date**: 2026-10-30
**Status**: In Progress

## Summary

The home page gets quiet, editorial motion on top of the finished static page. As you scroll, each section below the fold fades up a short distance once, the line above it draws from left to right, and the Services columns and About content appear one after another. The coral hero underline redraws whenever you scroll back up to the hero. Buttons and links get soft 150ms color fades.

Nothing that is already on screen when motion loads ever moves or disappears. Keyboard focus and printing always show content, and with JavaScript off or reduced motion on, the page is exactly today's static page. GSAP and its ScrollTrigger plugin (the part that watches scroll position) live only in `src/motion/gsap.ts` and still load late, after the page is idle.

## Requirements

**User stories**:
- As a small business owner scrolling the page, I want sections to settle in gently as I reach them, so that the site feels considered without slowing my reading.
- As a visitor who starts reading before the motion code arrives, I want nothing I am already looking at to blink out or jump, so that I never lose my place.
- As a keyboard user, I want every link I Tab to to be visible at once, so that I always see where focus is.
- As a visitor with reduced motion set, I want no animation at all, so that the page is calm and identical to the static version.
- As Abed after launch, I want the motion values written down in one place, so that I can tune them without hunting through code.

**Acceptance criteria**:
- **AC-1**: With JavaScript off, and separately with `prefers-reduced-motion: reduce`, `/` looks exactly like today. Every section's top line is drawn full width, the hero underline is drawn, no element has an inline `opacity` or `transform`, and links change color instantly on hover. With reduced motion on, the network panel shows no request for the `gsap` chunk.
- **AC-2**: `gsap` (`3.15.x`) and `gsap/ScrollTrigger` are imported only in `src/motion/gsap.ts`. `pnpm check:bundle` passes, and it fails when a static `import 'gsap'` is temporarily added to `loader.ts` (the spec 0002 marker proof). The loader requests the `gsap` chunk only on pages that contain at least one `[data-reveal]`, `[data-line]`, or `[data-underline]` element, so `/404` never downloads it.
- **AC-3**: On `/`, with motion running, the reveal groups (the Tools line, Services, About, the final CTA, and the Privacy notice) each start at opacity 0 and 16px below their resting place (12px below 640px wide), then move to opacity 1 at their resting place over 0.5s with `power2.out` easing. A group without items starts when the group's own top edge reaches 85% of the viewport height; the group wrapper is both the trigger and the animated target. Each plays once per page visit; scrolling back up and down again does not replay it. When a reveal finishes, its inline `opacity` and `transform` are cleared, so the element is styled exactly as on the static page.
- **AC-4**: Each animated target (a group without items, each item on its own, and each line) is judged by its own top edge when `gsap.ts` starts: if that edge is above the bottom of the viewport, the target gets no starting state and never animates. This is judged again on each run of the breakpoint setup (a resize across 640px), so anything already passed stays static. This always covers the hero and the Tools line on tall screens, and it covers whatever was on screen after a visitor opened `/#about` directly or jumped there before motion loaded. No element is ever seen fading out or jumping back.
- **AC-5**: Items (the two Services columns; the About title, each paragraph, and the photo) reveal through `ScrollTrigger.batch`. Each item triggers when its own top reaches 85% of the viewport height. Items that trigger together reveal in page order, 0.08s apart (0.05s below 640px wide); an item further down (for example the About photo on a phone, where it sits below the text) reveals when the visitor reaches it, never while off screen. Every other group reveals as one block.
- **AC-6**: The top lines of the Tools, Services, About, final CTA, and Privacy sections are 1px `line` colored strokes in the same place as today's `border-t`. When motion runs, each line that starts below the fold grows from 0 to full width, anchored on the left, over 0.6s with `power2.out`, once, when its own top reaches 85% of the viewport height. The line's trigger is its section and the content's trigger is the wrapper or items inside it, so a line and its content run in parallel, each on its own trigger. After drawing, the inline `--line-scale` is cleared. The vertical divider between the service columns, the column divider on mobile, and the header and footer lines stay static. In Windows high contrast mode (forced colors) every line stays visible.
- **AC-7**: The hero underline is a 3px `accent` stroke under the emphasis words, within 2px of today's underline position at 390px and 1280px wide, measured against screenshots of the current page taken before the change. It follows the text when the emphasis wraps onto two lines. It is drawn when the page loads and is never hidden while the hero is on screen. The hero section is the trigger, active from `top bottom` to `bottom top`. After the hero's bottom edge scrolls above the top of the viewport, the underline resets to zero width while off screen; if the hero is already above the viewport when `gsap.ts` starts (a restored scroll or a deep link), it resets at start, unseen. When the hero comes back into view from above, the underline redraws over 0.6s with `power2.out`, growing from the left; when the emphasis is wrapped, each line piece grows at the same time. This repeats on every return. In forced colors mode the underline still shows.
- **AC-8**: Reveals and lines animate only `opacity` and `transform` (lines through `--line-scale` in a `scaleX`). The underline animates its `background-size`, which repaints but never moves layout. With motion running, Lighthouse reports a Cumulative Layout Shift of 0 from motion, every element ends at exactly its static position, and there is no sideways scroll at 320px wide.
- **AC-9**: Nothing is hidden with `visibility`, `display`, or `aria-hidden`. The Tab order and the accessibility tree are identical with and without motion. When focus moves into a reveal group that has not revealed yet (for example Tab to the final CTA button), that group (all its pending items) and its section's line jump to their finished state at once and their scroll triggers are killed, so the focused control is fully opaque with its focus ring visible in the same frame, and nothing replays later.
- **AC-10**: Opening print preview before scrolling (or at any point) shows every section fully visible, with all lines and the hero underline drawn. This holds through two independent paths: a `beforeprint` listener that finishes everything pending, and an `@media print` rule in `global.css` that forces `opacity: 1`, `transform: none`, `--line-scale: 1`, and `--underline-scale: 1` with `!important` on every hook (for browsers such as iOS Safari that do not reliably fire `beforeprint`).
- **AC-11**: Turning on reduced motion mid visit returns every element to its static state at once: opacity 1, no transform, all lines and the underline full width, and no scroll triggers left running. Turning it off again does not restart motion (spec 0001 rule). If `gsap.ts` throws partway through starting up, it undoes every starting state it already set before the error reaches the loader, so no content is left hidden.
- **AC-12**: With `prefers-reduced-motion: no-preference`, every link (the primary and secondary buttons, nav links, footer links, and inline privacy links) fades its `color`, `background-color`, `border-color`, and `text-decoration-color` over 150ms `ease-out` on hover and press. The focus ring (`outline`) appears instantly. With reduced motion on, these changes are instant. This needs no JavaScript.
- **AC-13**: `design.md` has a Motion section listing every value from the `MOTION` object in `gsap.ts`, the hover transition, the data attribute hooks, and the rules in this spec (nothing on screen at start moves, no layout moving properties, never hide content in CSS, off with reduced motion). It also states that the hero underline is drawn with a one color `linear-gradient`, which renders as a flat stroke and is allowed under principle 3's "no gradients" (that rule bans visible color blends). The `btn-primary` comment no longer says "No transitions until feature 13". `docs/design/pages/home.md` names the hooks each section carries. `pnpm verify` exits 0.

## Decision

**Chosen option**: Option 1: GSAP ScrollTrigger driven by data attribute hooks, CSS custom properties for lines and the underline, CSS only hover transitions.

Components mark what moves with `data-reveal`, `data-reveal-item`, `data-line`, and `data-underline`. `gsap.ts` reads only those hooks and runs everything inside one `gsap.matchMedia()` scope, whose `revert()` is the cleanup. Lines and the underline become CSS drawn strokes that render full size with no JavaScript, and that GSAP scales through a custom property.

**Implementation skills**: `gsap-core` (`greensock/gsap-skills`, `.claude/skills/gsap-core/`) · `gsap-scrolltrigger` (`greensock/gsap-skills`, `.claude/skills/gsap-scrolltrigger/`) · `gsap-timeline` (`greensock/gsap-skills`, `.claude/skills/gsap-timeline/`) · `gsap-performance` (`greensock/gsap-skills`, `.claude/skills/gsap-performance/`) · `gsap-frameworks` (`greensock/gsap-skills`, `.claude/skills/gsap-frameworks/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.claude/skills/tailwind-4-docs/`) · `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`) · `accessibility` (`addyosmani/web-quality-skills`, `.claude/skills/accessibility/`) · `core-web-vitals` (`addyosmani/web-quality-skills`, `.claude/skills/core-web-vitals/`)

**Boundaries** (what this feature does not do):
- No motion on the hero text, header, footer, or the 404 page. The hero's only motion is the underline replay.
- No scroll scrubbing, pinning, parallax, smooth scroll libraries, or ScrollSmoother. Reveals play once on their own clock.
- No GSAP driven hovers, lifts, magnetic buttons, or cursor effects. Hovers are CSS only.
- No change to any copy, `site.ts`, the booking link, or `BookCta.astro` (it picks up the hover transition from CSS).
- The Three.js scene (feature 14) is separate. `scene.ts` and the `[data-scene]` path are not touched.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**: none. This feature stores no data. Its only state lives in memory for one page visit (which groups have revealed, whether the underline is reset) and in the `MOTION` constants below.

**State transitions**:
- Reveal group, item, or line: `static` (on screen at start, never touched) · or `waiting` (starting state set) → `revealed` (on scroll past 85%, on focus inside, or on `beforeprint`). `revealed` is final within one run of the breakpoint setup; a resize across 640px reverts and runs the setup again, which re-derives each target from its position (anything passed is `static`).
- Hero underline: `drawn` → `reset` (hero bottom passes above the viewport top, or already above it at start) → `drawing` (hero comes back into view from above) → `drawn`. Repeats. If it is reset when `beforeprint` fires, it jumps to `drawn`.
- Whole module: `running` → `reverted` (cleanup called by the loader on reduced motion, or after a startup error). `reverted` is final.

**API surface** (no endpoints; the surfaces are the module contract, the markup hooks, and the CSS):

| Surface | Kind | Inputs | Output | Errors |
|---|---|---|---|---|
| `init(root: HTMLElement): () => void` in `src/motion/gsap.ts` | module export (contract from spec 0001) | `document.body` from the loader | sets starting states, creates triggers and listeners; returns a cleanup that calls `mm.revert()` and removes the `focusin` and `beforeprint` listeners | throws only after reverting its own work (AC-11); the loader logs once and the page stays static |
| `hasMotionHooks()` check in `src/motion/loader.ts` | loader guard (new, small) | the DOM | `true` if any `[data-reveal], [data-line], [data-underline]` exists | none; `false` means `gsap.ts` is never imported |
| `data-reveal` | markup attribute | on a section's content wrapper | one reveal group | none |
| `data-reveal-item` | markup attribute | on children of a `data-reveal` group | each item is its own target and trigger, revealed through `ScrollTrigger.batch` (staggered in DOM order when several trigger together); when present, only the items animate, never the wrapper | an item outside a group is ignored |
| `data-line` | markup attribute | on an element that also has the `section-line` utility | its top line draws once | none |
| `data-underline` | markup attribute | on the hero `<u>` | the replaying underline | none |
| `section-line` | Tailwind `@utility` in `global.css` | replaces `border-t border-line` on the five sections | `position: relative`, plus a `::before` with `content: ''`, `position: absolute`, `top: 0`, `left: 0`, `width: 100%`, no `z-index`, `height: 0`, `border-top: 1px solid var(--color-line)`, `transform: scaleX(var(--line-scale, 1))`, `transform-origin: left`, `pointer-events: none` | none |
| `hero-underline` | Tailwind `@utility` in `global.css` | replaces `decoration-accent decoration-3 underline-offset-6` on the `<u>` | `text-decoration: none`, an `accent` stroke drawn as `background-image: linear-gradient(var(--color-accent), var(--color-accent))`, `background-repeat: no-repeat`, `background-size: calc(var(--underline-scale, 1) * 100%) 3px`, positioned at the bottom left with `padding-bottom` tuned so the stroke sits within 2px of today's, `box-decoration-break: clone` (plus the `-webkit-` form). Inside `@media (forced-colors: active)`: `background: none` and the old `text-decoration: underline 3px` with offset 6px | none |
| Link transition rule | base layer rule in `global.css` | all `a` elements | inside `@media (prefers-reduced-motion: no-preference)`: `transition-property: color, background-color, border-color, text-decoration-color; transition-duration: 150ms; transition-timing-function: ease-out`. `btn-primary` and `btn-secondary` set no `transition` of their own, so they inherit this rule; press uses the existing `accent-pressed` state | none |
| Print rule | `@media print` block in `global.css` | `[data-reveal], [data-reveal-item], [data-line], [data-underline]` | `opacity: 1 !important; transform: none !important; --line-scale: 1 !important; --underline-scale: 1 !important` | none |

Hook placement on `/` (`src/pages/index.astro` and `src/components/PrivacyNotice.astro`):

| Section | `section-line` + `data-line` on | `data-reveal` on | `data-reveal-item` on |
|---|---|---|---|
| Hero | (no top line) | none | none; the `<u>` gets `hero-underline` and `data-underline` |
| Tools | `<section id="tools">` | its `.site-wrap` div | none |
| Services | `<div id="services">` | the inner grid `.site-wrap` div | each of the two service `<section>` columns (their own `border-t` / `border-l` dividers stay plain CSS borders) |
| About | `<section id="about">` | the inner grid div | the `<h2>`, each `<p>` from `site.about.body`, and the `<Image>` |
| Final CTA | its `<section>` | its `.site-wrap` div | none |
| Privacy | `<section id="privacy">` | its `.site-wrap` div | none |

`gsap.ts` shape (a guide; `/develop` follows the gsap skills for the details):

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// The single source for every motion value; design.md section "Motion" mirrors it.
const MOTION = {
  duration: 0.5,
  lineDuration: 0.6,
  ease: 'power2.out',
  distance: { base: 16, small: 12 },   // px; small applies below 640px
  stagger: { base: 0.08, small: 0.05 }, // s
  start: 'top 85%',
} as const;

export function init(root: HTMLElement): () => void {
  const mm = gsap.matchMedia();
  // mm.add({ small: '(max-width: 639.98px)', base: '(min-width: 640px)' }, (ctx) => {
  //   1. collect targets under root (group wrappers without items, items, lines);
  //      skip any whose own rect.top < window.innerHeight (AC-4)
  //   2. block groups: gsap.set the starting state, one ScrollTrigger
  //      { trigger: wrapper, start: MOTION.start, once: true } playing a tween with
  //      clearProps: 'opacity,transform' on complete
  //   3. items: ScrollTrigger.batch(items, { start: MOTION.start, once: true,
  //      onEnter: (batch) => tween with stagger + clearProps })
  //   4. lines: set --line-scale 0, tween to 1 on a once trigger on the section,
  //      clear --line-scale on complete
  //   5. underline: ScrollTrigger { trigger: hero, start: 'top bottom', end: 'bottom top',
  //      onLeave: set --underline-scale 0, onEnterBack: tween to 1 };
  //      if hero rect.bottom < 0 now, set --underline-scale 0 at start
  //   6. add the focusin and beforeprint listeners here; return a function that
  //      removes them, so each setup run owns its own listeners
  //   focusin → finish the pending group (all its items) and its section line,
  //             kill their triggers (AC-9)
  //   beforeprint → finish everything pending and set the underline to 1 (AC-10)
  // });
  // any throw during setup → mm.revert(), rethrow (AC-11)
  return () => { mm.revert(); };
}
```

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Reveal | duration 0.5s, ease `power2.out`, start `top 85%` | `MOTION` in `gsap.ts`, mirrored in `design.md` (decided here) |
| Reveal | 16px or 12px starting offset; 0.08s or 0.05s stagger | `MOTION.distance` / `MOTION.stagger`, chosen by `gsap.matchMedia` at the 640px breakpoint (`sm` in `design.md` section 4) |
| Reveal | which elements form a group and their stagger order | `data-reveal` / `data-reveal-item` in markup, in DOM order |
| Reveal | trigger element | the wrapper for a block group; each item for items (`ScrollTrigger.batch`); the section for a line |
| Reveal end state | no inline styles left | `clearProps: 'opacity,transform'` (and clearing `--line-scale`) on complete |
| "On screen at start" (AC-4) | whether a target animates | that target's own `getBoundingClientRect().top < window.innerHeight`, read at the start of each breakpoint setup run |
| Underline at start | drawn or reset | hero `getBoundingClientRect().bottom < 0` at start means reset (unseen) |
| Line draw | stroke color and thickness | `--color-line` token and 1px (unchanged from today's `border-t`) |
| Line draw | current width | `--line-scale` custom property, 1 by default in CSS, tweened by GSAP |
| Underline | stroke color and thickness | `--color-accent` token and 3px (today's `decoration-3`) |
| Underline | vertical position | `padding-bottom` in `hero-underline`, tuned in the build to within 2px of baseline screenshots of today's 6px offset underline at 390 and 1280, taken before the change |
| Underline | current width | `--underline-scale` custom property, 1 by default in CSS |
| Underline replay | when to reset and redraw | ScrollTrigger on the hero section: `onLeave` (hero bottom past the viewport top) and `onEnterBack` |
| Focus reveal | which group to finish | the closest `[data-reveal]` ancestor of the `focusin` target (with all its pending items), plus the `[data-line]` section that contains it |
| Hover | 150ms, `ease-out`, the four properties | the link transition rule in `global.css` (decided here) |
| Loader guard | whether to import `gsap.ts` | presence of any hook in the DOM |

**Key invariants**:
- The page is complete with no JavaScript. Every starting state is set by `gsap.ts` at runtime and never in CSS, a class, or markup. CSS defaults (`--line-scale: 1`, `--underline-scale: 1`) always mean "fully drawn".
- Reveals and lines animate only `opacity` and transforms; the underline animates only `background-size`. Never `autoAlpha`, `visibility`, `display`, `height`, `width`, `clip-path`, or anything that moves layout.
- Nothing visible at the moment `init` runs ever changes state, except the underline, which resets only while the hero is fully off screen.
- `gsap` and `gsap/ScrollTrigger` are imported only in `gsap.ts`, which is reached only through `import()` in `loader.ts`.
- All GSAP work and both listeners are created inside the one `gsap.matchMedia()` scope, so a single `mm.revert()` restores the exact static page (inline styles removed, triggers killed, listeners removed).
- Lines use a border, not a background, so they survive forced colors. The underline falls back to `text-decoration` in forced colors.
- No new color, token, or font. Coral stays limited to its three places (`design.md` principle 2): the underline is one of them.

**Security model**: none. Static, public content, no data collected, no new requests beyond a same origin JavaScript chunk.

**Configuration required**: none. No environment variables or credentials. One new dependency: `gsap` `3.15.x` (ScrollTrigger ships inside it).

**Critical test scenarios**:
- Happy path: fresh load at 1280 and 390, wait for idle, scroll top to bottom. Each section below the fold fades up once, its line draws, Services and About stagger, and nothing replays on the way back up. Verifies **AC-3**, **AC-5**, **AC-6**.
- Hero underline: scroll until the hero is gone, scroll back. The underline redraws left to right. Repeat twice. Then shrink to 320 where the emphasis wraps and repeat. Verifies **AC-7**.
- Failure case: open `/#about` directly at 1280, so About is on screen when motion loads. About never fades or moves; sections below still reveal. Verifies **AC-4**.
- Failure case: before scrolling, Tab through the page to the final CTA button. The CTA section is fully visible with the focus ring as soon as focus lands. Verifies **AC-9**.
- Failure case: temporarily add `throw new Error()` after the first `gsap.set` in `init`. Nothing on the page is left transparent. Verifies **AC-11**.
- Reduced motion: toggle reduced motion on in DevTools mid scroll. Everything snaps to static. Reload with it on: no `gsap` chunk requested, hovers instant. Verifies **AC-1**, **AC-11**, **AC-12**.
- Print: print preview before scrolling. All content and lines visible. Verifies **AC-10**.
- Auth/permission: not applicable (public static page, no roles).

## Build plan

Skateboard: the first milestone is the smallest motion that could ship alone (plain reveals with every safety rule), then lines, the underline, and hovers grow it. Each milestone leaves `pnpm verify` green and the page shippable.

1. Run `pnpm add gsap@~3.15.0` (check that pnpm's `minimumReleaseAge` accepts it). Prove the `check:bundle` GSAP marker: temporarily add a static `import 'gsap'` to `loader.ts`, confirm `pnpm build && pnpm check:bundle` fails, then remove it (if the `GSAP target` marker is absent from the minified library, replace it and update spec 0002). Remove the ESLint `no-empty-function` override for `gsap.ts` only (keep it for `scene.ts`). Satisfies **AC-2**.
2. Add `hasMotionHooks()` to `loader.ts` and call `startGsap()` only when it is true. Satisfies **AC-2**.
3. Add `data-reveal` to the five groups in `index.astro` and `PrivacyNotice.astro`. Write `gsap.ts`: `MOTION`, `gsap.matchMedia` with the two breakpoints, the "on screen at start" skip, one `once` ScrollTrigger per group fading the wrapper as a block with `clearProps` on complete, the `focusin` finish (killing its triggers) and the `beforeprint` finish registered inside the setup, the setup `try`/`catch` that reverts, and the cleanup. Add the `@media print` rule to `global.css`. Satisfies **AC-1**, **AC-3**, **AC-4**, **AC-8**, **AC-9**, **AC-10**, **AC-11**. (First shippable milestone.)
4. Add `data-reveal-item` to the two Services columns and the About title, paragraphs, and photo, and reveal them in `gsap.ts` with `ScrollTrigger.batch` and `MOTION.stagger`, judging each item on its own at start. Satisfies **AC-4**, **AC-5**.
5. Add the `section-line` utility, swap `border-t border-line` for `section-line` plus `data-line` on the five sections, and draw lines in `gsap.ts` through `--line-scale`. Check forced colors in DevTools rendering emulation. Satisfies **AC-6**, **AC-8**.
6. First take baseline screenshots of today's hero underline at 390 and 1280. Then add the `hero-underline` utility with its forced colors fallback, swap the `<u>` classes, tune `padding-bottom` against the baselines, and add the underline replay in `gsap.ts` (including the reset at start when the hero is already above the viewport). Satisfies **AC-7**, **AC-10**.
7. Add the link transition rule to `global.css` and update the `btn-primary` comment. Satisfies **AC-12**.
8. Add the Motion section to `design.md` (values, hooks, rules) and the hook notes to `docs/design/pages/home.md`. Run the checks in `verify.md` at 320, 390, 768, and 1280, then `pnpm verify`. Satisfies **AC-13**, and rechecks **AC-1** and **AC-8**.

## Consequences

**Positive**:
- The page gains motion without risking reading or booking: every failure path (no JS, reduced motion, load error, startup error, focus, print) ends at the static page.
- Hooks in markup make motion visible where it applies, and restyling a section does not silently break it.
- One `MOTION` object plus the `design.md` section make tuning a single edit.
- Hovers improve for every visitor, including those who never load GSAP.

**Negative / tradeoffs**:
- About 45KB gzipped of GSAP plus ScrollTrigger is downloaded after idle on the home page. It does not affect first paint, but it costs mobile data and a little Netlify bandwidth. Plain `IntersectionObserver` could do these effects in about 2KB (see rationale).
- On tall screens many visitors see no reveal at all for the hero and Tools line, by design.
- The section lines and hero underline move from simple Tailwind classes to two custom utilities, and the underline needs a forced colors fallback and pixel tuning. That is more CSS to maintain than a `border-t`.
- Find in page does not move focus, so a search match inside a section the visitor has not reached yet can sit invisible until they scroll there and the reveal plays (about half a second). Accepted: the browser scrolls to the match, which fires the trigger.
- The underline animates `background-size`, which repaints each frame (no layout shift). It is one short stroke for 0.6s, so the cost is negligible.
- The underline position can drift a pixel or two from today's `text-underline-offset` across fonts and zoom levels, because it is now a background stroke.

**Neutral**:
- `loader.ts` gains a small hook check, an additive change to the spec 0001 contract.
- `check:bundle` markers are proven for GSAP (the spec 0002 follow up for feature 13).
- `src/motion/AGENTS.md` will be out of date (gsap installed, ScrollTrigger allowed in `gsap.ts`, loader guard); `/sync` owns that update.

## Follow-up

- [ ] After the build, `/sync` should update `src/motion/AGENTS.md`: `gsap` installed, `gsap/ScrollTrigger` also lives only in `gsap.ts`, the loader's hook check, the data attribute hooks, and remove the "not installed yet" gotcha for GSAP.
- [ ] Spec 0002's follow up "prove the bundle check markers" is done for GSAP by build step 1; Three.js still owes it in feature 14.
- [ ] Feature 14 (Three.js scene) must respect AC-4 (nothing on screen at start moves) and should reuse `MOTION.ease` if it animates anything in the hero.
- [ ] Revisit at launch (feature 16): check the real Lighthouse mobile score with motion on; if total blocking time from the late GSAP chunk shows up, consider the `IntersectionObserver` runner up.
