# 0008. GSAP motion: rationale

The decision record behind [index.md](index.md). `/develop` builds from `index.md`; this file explains why.

## Context

> ⚠️ Premise note: the motion approved here (fade up reveals once, a drawn line, an underline redraw, hover fades) is simple enough that `IntersectionObserver` plus the Web Animations API could do it in about 2KB, with no library. GSAP brings about 45KB gzipped. It stays because spec 0001 already chose GSAP for Release 2, you picked ScrollTrigger, and it gives one `revert()` that restores the static page exactly, which is the safety property this site cares most about. The cost lands after the page is idle and only on the home page. If launch measurements show the late chunk hurting mobile scores, the runner up below is a drop in replacement behind the same `init` contract.

The site is a finished, static, single page (Release 1). Release 2 adds motion on top, and spec 0001 already fixed the frame: GSAP `3.15.x`, loaded through `import()` from `src/motion/loader.ts` only after `load` plus idle time, never when `prefers-reduced-motion: reduce` matches, through `init(root) → cleanup`. The design rules (`design.md`) are strict: plain and personal, structure from 1px lines and spacing, no boxes, shadows, glow, or gradients, coral used in exactly three places, and "motion never changes layout and never blocks reading or booking".

Late loading creates the central problem. By the time GSAP runs, the visitor has already been reading for a moment. The hero, and often the Tools line, are always on screen, and a visitor who followed `/#about` is already in the middle of the page. Any "from" state applied to visible content makes it vanish and come back, which is worse than no motion. The no JavaScript rule also means no content can start hidden in CSS. Every starting state must be applied by the script, and undone exactly if the script stops.

Accessibility forces more constraints. Content at opacity 0 is still in the Tab order, so a keyboard user can focus an invisible button. Printing a half scrolled page prints blank sections. Windows high contrast mode drops CSS backgrounds, and the hero underline and section lines would be the first to vanish if drawn that way. A visitor can switch reduced motion on mid visit.

Doing nothing leaves Release 2 unbuilt. Doing it carelessly risks the one thing the page must do: be read and get someone to book a call.

## Options considered

### Option 1: GSAP ScrollTrigger with data attribute hooks and CSS variable strokes

`gsap.ts` finds elements by `data-reveal`, `data-reveal-item`, `data-line`, and `data-underline`, skips anything on screen at start, and creates one `once` ScrollTrigger per group inside a single `gsap.matchMedia()` scope. Lines and the underline become CSS strokes scaled by a custom property that defaults to fully drawn. Hovers are plain CSS transitions.

**Pros**:
- `mm.revert()` removes every inline style and trigger in one call, so cleanup, reduced motion mid visit, and the startup error path all land on the exact static page.
- `gsap.matchMedia` handles the 640px value switch, and ScrollTrigger handles resize recalculation and the underline's leave and return events without hand written bookkeeping.
- Markup hooks state intent where it applies, and the official gsap skills are installed and cover this exact API.

**Cons**:
- About 45KB gzipped downloaded late, for effects a browser API could do.
- Lines and the underline need custom utilities and a forced colors fallback instead of Tailwind border and decoration classes.

### Option 2: Plain IntersectionObserver and the Web Animations API, no GSAP

The same hooks and CSS strokes, but `gsap.ts` (renamed) uses `IntersectionObserver` for "entered the screen" and `element.animate()` for the fades, with manual stagger delays.

**Pros**:
- About 2KB instead of about 45KB, with no dependency to update.
- Same visual result for these simple, once only effects.

**Cons**:
- Cleanup, the focus and print "finish now" paths, breakpoint switching, and the underline's leave and return logic are all hand written. That is more code for Abed to maintain and more ways to leave something half hidden.
- Departs from spec 0001's GSAP choice, and leaves feature 14 and any later motion without the shared library.

### Option 3: CSS scroll driven animations (`animation-timeline: view()`)

Reveals expressed entirely in CSS, tied to scroll position, with no JavaScript.

**Pros**:
- Zero JavaScript; runs off the main thread.
- Nothing to load, revert, or fail.

**Cons**:
- Scroll timelines scrub (they reverse when you scroll back), so "play once" and "replay the underline only after leaving" cannot be expressed in CSS alone.
- The "leave anything on screen at start untouched" rule needs to know what was visible when motion began, which CSS cannot know. Without it, the from state shows the moment the CSS loads, which breaks the no JavaScript and readability rules for anything below the fold that starts mid animation.
- Browser support is still uneven, so some visitors would get the effect and others not, with no single place to reason about it.

### Option 4: GSAP with selectors kept inside `gsap.ts`

Option 1, but `gsap.ts` targets `#services section`, `#about p`, and so on, with no markup changes.

**Pros**:
- No edits to `index.astro` or `PrivacyNotice.astro` for hooks.
- Everything about motion lives in one file.

**Cons**:
- Reordering or restyling a section silently changes or breaks its motion, with no sign in the markup.
- Selectors duplicate the page structure in a second place that the copy and design checks never see.

## Rationale

Option 1 is the only one that meets the hardest force in Context, which is that the page must end up exactly static on every failure path, with the least hand written code. `gsap.matchMedia().revert()` gives that as one call, and it covers reduced motion mid visit, a startup error, and the loader's cleanup alike. Option 2 can reach the same visible result, but every one of those paths becomes bespoke code on a site run by one person, and it walks back a decision spec 0001 already made. The size difference is real but lands after idle, on one page. That is why the premise note keeps Option 2 as the measured fallback instead of dismissing it.

Option 3 fails on behavior, not taste. "Once", "replay only after leaving", and "skip what was on screen when motion started" all need memory of past scroll state, which CSS scroll timelines do not have. Option 4 was offered and declined in favor of markup hooks, because motion that silently breaks on a restyle is exactly the kind of bug no one notices on a static marketing page.

The quiet values (16px, 0.5s, `power2.out`, a 0.08s stagger) follow the design rules: motion should read as the page settling, not performing. Mobile keeps the same concepts with shorter distances and staggers, because a narrow single column makes long sequences feel slow. Phones are likely most visitors, so they should not get a lesser version.

### Smaller calls made in this spec

- **"On screen at start" test**: `rect.top < window.innerHeight` at `init`, per hook. Simple and exact for the "never vanish while seen" rule. Runner up: an `IntersectionObserver` first pass, which is asynchronous and could set a from state a frame after the element was confirmed visible.
- **Opacity, not `autoAlpha`**: `autoAlpha` sets `visibility: hidden` at 0, which removes links from the Tab order and the accessibility tree before reveal. Opacity only keeps both identical to the static page. Runner up: none acceptable.
- **Trigger point `top 85%`**: content starts settling just as it enters the bottom of the screen, so it is finished by the time the eye reaches it. Runner up: `top 90%`, which on short phones starts the reveal before much of the element is visible.
- **Lines drawn with a `::before` border, not a background**: borders stay visible in forced colors, and backgrounds do not. Runner up: a decorative child element, one more node per section for the same result.
- **Underline as a background stroke with a `text-decoration` fallback in forced colors**: the only way to grow it left to right across wrapped lines (`box-decoration-break: clone`). Runner up: dropping the sweep, which you declined.
- **Underline replay only after fully leaving**: the reset is invisible because the hero is off screen, so the rule "nothing seen disappears" holds even for the one repeating effect.
- **Focus and print finish the reveal instead of preventing it**: one `focusin` listener covers the keyboard, and `beforeprint` plus an `@media print` rule cover printing (the CSS rule catches browsers that skip `beforeprint`). Find in page moves no focus, so it falls back to the scroll trigger, which is an accepted short delay. Runner up: rely on ScrollTrigger alone, which leaves a focused control invisible for the length of the fade.
- **Items judged and triggered one by one (`ScrollTrigger.batch`)**: on a phone the About photo sits well below the text, and a single group trigger would play its reveal while it is still off screen. Batch staggers whatever arrives together and reveals the rest as they arrive. Runner up: one trigger per group with a fixed stagger, which is simpler but wastes the effect on tall stacks.
- **`clearProps` after each reveal**: finished elements carry no inline styles, so the page after motion is the same as the static page, and later CSS changes are never masked by leftover GSAP styles.
- **A solid one color `linear-gradient` for the underline**: it renders as a flat stroke, which keeps the "no gradients" principle in spirit (no visible color blend). `check:design` does not scan for gradients, and the `design.md` Motion section records the exception so nobody adds a real gradient on the strength of it.
- **Loader hook check**: `/404` has no hooks, so the loader skips the import, saving about 45KB there. Runner up: let `gsap.ts` load and find nothing, which is simpler but wasteful.
- **Hover transitions in CSS, under `prefers-reduced-motion: no-preference`**: they work with no JavaScript and before GSAP loads, and the focus ring (`outline`) is left out so it always appears instantly. Runner up: Tailwind `motion-safe:transition-colors` on each link, which spreads one rule across many components.
- **Values in one `MOTION` object mirrored in `design.md`**: matches how tokens live in `global.css` with `design.md` explaining them.
