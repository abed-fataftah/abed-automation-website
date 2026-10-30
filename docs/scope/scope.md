# Scope: Abed Automation website

A professional single page website for abedautomation.com. It introduces Abed Automation (AI automation, websites, and custom web apps for small businesses), builds trust, and sends every visitor to one Cal.com page to book a free 30 minute introductory call.

**Build approach:** Skateboard (ship the smallest usable whole first, then grow it: a plain, readable page with working booking, then motion, then launch).
**Workflow:** Alpha (after `/develop`, run `/check verify` on the real page). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but you can skip it when you already know the build. Any feature can carry its own tag (for example `· Beta`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

**Ground rules from the brief (apply to every feature):** English only. Present Abed as one person, never a team. No invented testimonials, client logos, figures, credentials, or results. No public pricing of any kind. No contact forms, accounts, or custom booking system. Every main CTA uses the same booking URL, kept in one easy to update place. No placeholder links or unfinished copy at launch.

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | in-progress |
| 2 | Coding standards & tooling | Foundation | in-progress |
| 3 | Design system & UI foundation | Foundation | in-progress |
| 4 | Site copy | Foundation | in-progress |
| 5 | Booking page setup | Release 1 | in-progress |
| 6 | Header, navigation & hero | Release 1 | in-progress |
| 7 | Tools I Work With | Release 1 | in-progress |
| 8 | Services | Release 1 | in-progress |
| 9 | About | Release 1 | in-progress |
| 10 | Final CTA & footer | Release 1 | in-progress |
| 11 | SEO & sharing metadata | Release 1 | planned |
| 12 | Privacy notice | Release 1 | in-progress |
| 13 | GSAP motion | Release 2 | in-progress |
| 14 | Three.js 3D scene | Release 2 | in-progress |
| 15 | Visit & booking click analytics | Launch | in-progress |
| 16 | Deploy & go live | Launch | planned |

## Foundations

### 1. Stack & architecture · in-progress
Choose the frontend framework and the host (Vercel or Netlify), confirmed with you, then scaffold a runnable static site. Also decide where page content and the shared booking URL live so they are easy to update, and how heavy animation code loads only when needed.
**Done when:** the choices are recorded in a spec you approved, the scaffold runs locally, and a production build passes.
spec [0001](../specs/0001-astro-static-site-netlify/index.md) · code in `src/`, `netlify.toml`
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture`
- [x] Verify it: `/check verify stack & architecture`

### 2. Coding standards & tooling · in-progress
Capture conventions from the real scaffolded project, then install lint and format tooling.
**Done when:** root `AGENTS.md` reflects the real stack, and lint and format run clean.
spec [0002](../specs/0002-coding-standards-tooling.md) · code in `eslint.config.js`, `.prettierrc.json`, `scripts/check-bundle.mjs`, `.github/workflows/ci.yml`
- [x] Capture conventions and tooling choices: `/audit`
- [x] Decide the tooling (spec): `/architect coding standards & tooling`
- [x] Build it: `/develop coding standards & tooling`
- [x] Verify it: `/check verify coding standards & tooling`

### 3. Design system & UI foundation · in-progress
Turn your design files into a design spec: colors, type, spacing, layout, buttons, and focus states. LeftClick is a structural reference only, never a design to copy. Waits on the design files you will share.
**Done when:** `design.md` matches your approved direction, works at mobile, tablet, and desktop widths, meets contrast targets, and base components handle keyboard focus.
spec [0003](../specs/0003-design-system-ui-foundation/index.md) · code in `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/`, `src/pages/`, `scripts/check-design.mjs`, `design.md`
- [x] Design it (spec): `/architect design system & UI foundation`
- [x] Build it: `/develop design system & UI foundation`
  - [x] Handoff moved into the repo, root `design.md` updated, tokens and font in place (AC-1, AC-2, AC-4, AC-10, AC-13)
  - [x] Base shell with skip link, both button styles, and the SVG logo approved by you (AC-3, AC-5, AC-6, AC-7)
  - [x] Home and 404 restyled and checked at 320, 390, 768, 1280 (AC-8, AC-9, AC-11)
  - [x] `check:design` script in `pnpm verify`, which passes clean (AC-12, AC-14)
- [x] Verify it: `/check verify design system & UI foundation`

### 4. Site copy · in-progress
All page text in one approved set: headline, supporting line, both service descriptions, your About introduction, final CTA, footer, nav and skip link labels, and the 404 text. Written in plain, professional English from facts you supply. The privacy body is written by feature 12.
**Done when:** you have approved every line, nothing implies a team, and there are no invented claims, promised results, or prices.
spec [0004](../specs/0004-site-copy/index.md) · code in `src/content/site.ts`, `scripts/check-copy.mjs`
- [x] Design it (spec): `/architect site copy`
- [x] Build it: `/develop site copy`
  - [x] `SiteContent` extended and every approved deck line in `site.ts` (AC-2, AC-3, AC-8)
  - [x] Hero renders the split heading, no copy left in components (AC-1, AC-4)
  - [x] `check:copy` guard in `pnpm verify`, design briefs point at the deck, verify passes clean (AC-5, AC-6, AC-7)
- [ ] Verify it: `/check verify site copy`

## Release 1: The usable page (no motion yet)

The smallest site you could actually publish: every required section, readable, accessible, and with a working booking button. Animations come in Release 2, layered on top.

### 5. Booking page setup · in-progress
Set up the Cal.com event for a free 30 minute introductory call, branded for Abed Automation. Confirm the meeting platform and your availability. The booking page opens separately; no calendar is embedded in the site.
**Done when:** a real public booking URL books a test call end to end, and that URL is stored in the one shared place every CTA reads from.
spec [0005](../specs/0005-booking-page-setup/index.md) · code in `src/content/site.ts`, `docs/design/assets/cal-avatar.png`
- [x] Design it (spec): `/architect booking page setup`
- [x] Build it: `/develop booking page setup`
  - [x] Cal.com account, Google Calendar and Meet, availability, and the intro call event set up as specced (AC-4, AC-5, AC-8, AC-9)
  - [x] Test booking made end to end, conflict check confirmed, then cancelled (AC-6, AC-7)
  - [x] Real URL in `site.ts`, placeholder guard replaced by the cal.com check, `pnpm verify` and a production build pass (AC-1, AC-2, AC-3)
- [ ] Verify it: `/check verify booking page setup`

### 6. Header, navigation & hero · in-progress
Business name or logo, simple navigation to sections on the page, the headline, supporting description, and the "Book a Free Call" button.
**Done when:** navigation jumps to each section and works with a keyboard, the hero uses the approved copy, and the CTA opens the shared booking URL.
code in `src/components/SiteHeader.astro`, `src/pages/index.astro`, `src/pages/404.astro`
- [x] Build it: `/develop header, navigation & hero` (nav targets `#tools`, `#services`, `#about` land with features 7, 8, 9)

### 7. Tools I Work With · in-progress
A credibility strip right after the hero, showing only tools you actually use. Decide the verified tool list and how logos are shown so nothing suggests a partnership, client relationship, or endorsement.
**Done when:** every tool listed is one you confirmed, the wording makes clear these are tools you use, and logos are optimized and have text alternatives.
spec [0006](../specs/0006-tools-line/index.md) · code in `src/content/site.ts`, `src/pages/index.astro`, `scripts/check-copy.mjs`
- [x] Design it (spec): `/architect tools i work with`
- [x] Build it: `/develop tools i work with`
  - [x] Nine confirmed names in `site.tools.items` (AC-1, AC-8)
  - [x] Tools section after the hero: accessible list, hidden slashes, clean wrapping, nav jumps (AC-2, AC-3, AC-4, AC-5)
  - [x] `check:copy` tools rule, design docs updated, `pnpm verify` passes (AC-6, AC-7)
- [ ] Verify it: `/check verify tools i work with`

### 8. Services · in-progress
The two service categories: AI Automation (reduce repetitive work, connect workflows) and Websites & Web Apps (business websites and custom applications).
**Done when:** both categories are clearly explained in concise approved copy, with no unconfirmed promises.
code in `src/pages/index.astro` (copy in `src/content/site.ts`, spec [0004](../specs/0004-site-copy/index.md))
- [x] Build it: `/develop services`

### 9. About · in-progress
A short introduction to you, the person behind Abed Automation, so visitors know who they will work with.
**Done when:** it uses only facts you supplied, and any photo is optimized with alt text.
code in `src/pages/index.astro`, `src/assets/abed.png` (copy in `src/content/site.ts`, spec [0004](../specs/0004-site-copy/index.md))
- [x] Build it: `/develop about`

### 10. Final CTA & footer · in-progress
A brief invitation to talk about a website, web app, or automation need, then the footer: business name, email, copyright, and verified social or GitHub links if you supply them.
**Done when:** the CTA opens the same shared booking URL, the email link works, and no link is a placeholder.
code in `src/pages/index.astro`, `src/components/SiteFooter.astro`, `src/pages/404.astro` (copy in `src/content/site.ts`, spec [0004](../specs/0004-site-copy/index.md))
- [x] Build it: `/develop final cta & footer` (the footer Privacy link lands with feature 12, together with its target)

### 11. SEO & sharing metadata
Page title, meta description, favicon, and social sharing card so the site looks right in search and when shared.
**Done when:** title, description, favicon, and social card render correctly, and headings follow a clean semantic order.
- [ ] Build it: `/develop seo & sharing metadata`

### 12. Privacy notice · in-progress
A short privacy note linked from the footer, explaining the cookieless visit counting and that booking happens on Cal.com. Decide how it is shown on a single page site.
**Done when:** the notice is reachable from the footer, uses your approved wording, and matches what the site actually collects.
spec [0007](../specs/0007-privacy-notice/index.md) · code in `src/components/PrivacyNotice.astro`, `src/content/site.ts`, `src/components/SiteFooter.astro`, `scripts/check-copy.mjs`
- [x] Design it (spec): `/architect privacy notice`
- [x] Build it: `/develop privacy notice`
  - [x] Typed `site.privacy` with the approved deck, and the copy guard's date and link rules (AC-1, AC-6, AC-7)
  - [x] `PrivacyNotice.astro` after the final CTA: headings, inline links, last updated date (AC-2, AC-3, AC-4, AC-8)
  - [x] Footer Privacy link to `/#privacy` on every page, design docs updated, `pnpm verify` clean (AC-5, AC-9)
- [ ] Verify it: `/check verify privacy notice`

## Release 2: Motion

Same page, now with purposeful animation. Content and booking buttons stay readable and usable while animations load.

### 13. GSAP motion · in-progress
Section entrances and interface motion built with GSAP. Confirm the animation concepts with you before building.
**Done when:** the concepts you approved work on mobile and desktop, reduced motion settings turn them off or tone them down, and nothing blocks reading or booking.
spec [0008](../specs/0008-gsap-motion/index.md) · code in `src/motion/gsap.ts`, `src/motion/loader.ts`, `src/styles/global.css`, `src/pages/index.astro`
- [x] Design it (spec): `/architect gsap motion`
- [x] Build it: `/develop gsap motion`
  - [x] GSAP installed, bundle marker proven, loader skips pages with no motion hooks (AC-2)
  - [x] Block reveals with every safety path: on screen content untouched, focus and print finish, revert on reduced motion or error (AC-1, AC-3, AC-4, AC-8, AC-9, AC-10, AC-11)
  - [x] Staggered Services and About items, and drawn section lines (AC-5, AC-6)
  - [x] Hero underline replay and CSS hover fades (AC-7, AC-12)
  - [x] `design.md` Motion section, home page brief hooks, `pnpm verify` clean (AC-13)
- [ ] Verify it: `/check verify gsap motion`

### 14. Three.js 3D scene · in-progress
A 3D visual built with Three.js, loaded only when needed. Confirm the concept with you first.
**Done when:** the approved scene runs smoothly, a static fallback shows when 3D is unavailable, reduced motion and mobile get a lighter version, and the hero stays readable while it loads.
spec [0009](../specs/0009-threejs-hero-scene/index.md) · code in `src/motion/graph.ts`, `src/motion/scene.ts`, `src/motion/loader.ts`, `src/components/HeroScene.astro`, `src/pages/index.astro`, `scripts/check-bundle.mjs`
- [x] Design it (spec): `/architect three.js 3d scene`
- [x] Build it: `/develop three.js 3d scene`
  - [x] Graph data file and two column hero with the SVG graph, no JavaScript needed (AC-1, AC-3, AC-4, AC-5, AC-6, AC-13)
  - [x] Three.js installed, bundle marker proven, 1024px loader gate, static scene with crossfade and cleanup (AC-2, AC-6, AC-8, AC-10, AC-11, AC-12, AC-14)
  - [x] Sway, 30 fps loop with pausing, and travelling pulses (AC-7, AC-9)
  - [x] Context loss teardown, scene bundle budget, `design.md` and home brief updated, `pnpm verify` clean (AC-11, AC-14, AC-15)
- [ ] Verify it: `/check verify three.js 3d scene`

## Launch

### 15. Visit & booking click analytics · in-progress
Privacy friendly, cookieless counting of page visits and "Book a Free Call" clicks, so you can see what works without a cookie banner.
**Done when:** visits and every booking CTA click are counted, no cookies are set, and the privacy notice describes it accurately.
spec [0010](../specs/0010-visit-booking-click-analytics/index.md) · code in `src/content/site.ts`, `src/components/BookCta.astro`, `src/layouts/Base.astro`, `src/pages/index.astro`, `astro.config.mjs`, `scripts/check-copy.mjs`
- [x] Design it (spec): `/architect visit & booking click analytics`
- [ ] Build it: `/develop visit & booking click analytics`
  - [x] Abed: Umami Cloud account (EU), commercial use on Hobby confirmed, tracking code copied, privacy wording approved (prerequisite)
  - [x] `site.analytics` with its guard, `BookCta` location attributes, production only script tag, privacy paragraph rewritten, `pnpm verify` clean (AC-1, AC-2, AC-5, AC-8, AC-9, AC-10)
  - [ ] Live checks on abedautomation.com after feature 16: page views, booking click events per location, no storage, Umami only requests (AC-3, AC-4, AC-6, AC-7)
- [ ] Verify it: `/check verify visit & booking click analytics`

### 16. Deploy & go live
Deploy the static site to the host chosen in feature 1, connect abedautomation.com, and run the launch acceptance checklist from the brief. Includes clear setup, local development, build, and deployment instructions.
**Done when:** the site is live on abedautomation.com over HTTPS, the production build passes, every item on the launch checklist passes, and the instructions are written.
- [ ] Build it: `/develop deploy & go live`

## Deferred
Out of scope for launch, kept so the plan stays honest.
- **Selected Work**: GitHub automation projects and the ecommerce UI concept, each clearly labeled as a demo, concept, or work in progress, and only ones you approve · needs a decision
- **Privacy notice for Malaysia**: before running the business from Malaysia, check the notice against the PDPA, including whether a Malay version is needed, and decide whether to name a location · from spec 0007 · needs a decision

## Legend

**The decision box.** Every feature that needs a decision carries one box whose label ends with `(spec)`. Skills find it by that `(spec)` ending, never by its exact wording. Every other box is a build or check step.

**Feature lifecycle** (how a feature changes as it moves):

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | `/architect` when the spec is captured | `Design it` ticked, spec linked, `Build it: /develop <feature>` with 2 to 5 milestones, then `Verify it: /check verify <feature>` |
| `in-progress` (building) | `/develop` | milestones tick one by one, code pointer filled in |
| `done` | you, when you decide (for Alpha, after `/check verify` is the natural point) | the boxes you ran ticked, skipped ones marked skipped |

- **Next step** is the first unticked box.
- **needs a decision** means run `/architect` first; otherwise go straight to `/develop` (or `/audit` for standards and tooling). The tag drops once the spec exists.
- **Detailed build tasks live in each spec's `## Build plan`**, not here. The scope only carries the milestone rollup.
- **Status** moves `planned` → `in-progress` → `done`, plus `dropped` for anything taken out of scope (kept for history).
- **Tier tag** beside a heading (for example `· Beta`) sets that feature's rigor above or below the project default. No tag means it uses the default.
- **Workflow** levels: **Prototype** runs nothing after `/develop`; **Alpha** runs `/check verify`; **Beta** adds `/test`; **GA** adds a fresh model `/check review` and `/document`.
- **Pointer line** (`spec <n> · code in <path>`) appears once a spec or code exists.
