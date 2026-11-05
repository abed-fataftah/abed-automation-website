# 0014. Homepage redesign: rationale

Decision record for [index.md](index.md). `/develop` does not need this file.

## Context

The live homepage (Release 1 and 2) puts a tools strip and two short service blurbs after the hero, mentions projects only inside an About paragraph, describes the working method in prose, and closes with an in page privacy section. A critique and a study of eight reference sites (recorded in `docs/design/handoff/handoff.md` §3) found visitors are asked to book before they see any real work or know what happens after booking. Abed approved a redesigned board on 2026-11-04.

Forces:
- **Ground rules**: one person, no invented work or figures, no placeholder at launch. Work content and profile URLs do not exist yet, so the build must ship without them and accept them later without code changes.
- **Loading contract (spec 0001)**: the page is complete without JavaScript; motion code loads only through `import()` after `load` plus idle, and `check:bundle` proves it. The new hero element must obey this.
- **Earlier decisions in force**: copy in `site.ts` (0004), tools list (0006), in page privacy notice (0007), GSAP motion (0008), Three.js scene (0009), Umami locations (0010). The redesign changes parts of each.
- **Operational reality**: one person maintains the site; every dependency and guard script is upkeep. The Three.js scene is about 135 KB gzipped and runs only at 1024px and wider.
- **Approved but untested**: the portrait animation was reviewed on a board as still renders, so real device behavior is unverified.

## Options considered

### Option 1: Restyle in place, Skateboard slices, one branch

Reshape the existing components and `site.ts` to the handoff on `feat/homepage-redesign`, slice by slice, merge once.

**Pros**: reuses every guard, component, and the loader; each slice keeps `pnpm verify` green; one review and one revert point.
**Cons**: one larger PR; the old and new page never run side by side for comparison.

### Option 2: Strangler, a new page alongside the old

Build the redesign at a hidden route (for example `/next`), compare, then swap routes and delete the old page.

**Pros**: the live page is untouched until cutover; easy side by side review.
**Cons**: duplicates header, footer, and content shape changes for two pages; the sitemap, SEO, and copy checks must exclude the hidden route; more total work for a single static page with no live traffic risk worth isolating.

### Option 3: New layout, keep the Three.js scene

Apply the new layout but keep spec 0009's scene in the hero.

**Pros**: no new animation code; the scene is already built and verified.
**Cons**: goes against the approved board (the portrait is the one bold element); keeps the heaviest dependency; desktop only.

## Rationale

Option 1 fits the forces best. The site is one static page with a one commit revert path, so the isolation a strangler buys (Option 2) is worth little and costs duplicated guards and routes. Option 3 contradicts the approved design and keeps the most expensive dependency for an effect most visitors (phones) never saw.

Sub decisions, with the pick, why, and runner up:

- **Remove Three.js fully** (Abed): nothing else uses it; keeping dead code and a pinned dependency is upkeep with no payoff. Runner up: keep the files unused.
- **`30-minute`** (Abed): correct compound adjective and what the board shows; a copy rule stops regressions. Runner up: keep spec 0004's unhyphenated form.
- **Work gate by type and empty list** (Abed chose gating; the mechanism is mine): an item type with every field required means an incomplete card cannot compile, and an empty list hides the section, nav link, and hero link from one condition. Runner up: a boolean flag in `site.ts`, rejected because a flag can be on while content is half done.
- **Partial Work** (Abed): show each card as soon as it is complete. Runner up: both or none.
- **Reduced motion keeps the still image** (Abed): the fallback comes from the same dot data, so the static look matches, and the loader already skips all motion under reduced motion. Runner up: load and draw one static frame.
- **Every width, skip slow links** (Abed): the approved tap behavior is a phone feature; slow link rules match spec 0009's. Runner up: desktop only.
- **Load after `load` plus idle** (Abed): the still image is the hero's largest paint, so delaying the module protects load speed. Runner up: load as soon as possible.
- **No IntersectionObserver gate for the portrait** (mine): it sits above the fold on every layout, so the observer would fire at once; the module itself pauses drawing off screen. Runner up: reuse the scene's 200px observer.
- **Canvas created by the script** (mine): keeps the server HTML free of an empty canvas, so nothing waits on JavaScript, and the accessible name is copied from the image alt so no copy lives in motion code. Runner up: render a hidden `<canvas>` in the component.
- **Mid visit reduced motion restores the still image** (mine): matches the at load reduced motion state exactly. Runner up: freeze the last frame, which could leave the eyes looking sideways.
- **New About photo** (Abed): fits the 4:5 layout without cropping. Runner up: crop `abed.png`.
- **Keep token names and color values** (Abed, and the handoff's own merge rule): no renames across components; the approved contrast values stay. Runner up: adopt handoff names.
- **Reveal hooks on every section** (Abed): consistent with spec 0008, no new kind of motion. Runner up: only where they exist today.
- **Keep `final`, add `header` and `not-found`** (Abed for `final`, mine for `not-found`): Umami history stays comparable; the 404 had no booking button to inherit a value from. Runner up for `not-found`: reuse `hero`, rejected because it would mix two pages in one count.
- **`check:bundle` portrait marker and budget** (mine): the same proof spec 0009 used, so the entry chunk rule and the size stay enforced by CI. Runner up: marker only, no budget, rejected because the dot data could grow silently.
- **Supersede 0009, note the rest** (Abed): 0009 is wholly replaced; the others keep most of their decisions. Runner up: rewrite each old spec in place.
