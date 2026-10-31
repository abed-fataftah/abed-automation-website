# 0001. Astro static site on Netlify

**Date**: 2026-10-28
**Status**: In Progress
**Hosting superseded by**: [0013](../0013-cloudflare-pages-hosting-move/index.md) (2026-10-31, Netlify Free now shows a badge; the site moves to Cloudflare Pages). Everything else in this spec stands.

## Summary

The website is built with Astro (a framework that turns components into plain HTML files) and Tailwind CSS (utility classes for styling), written in TypeScript, and hosted free on Netlify from a public GitHub repo. All page text and the one booking link live in a single file, `src/content/site.ts`, so updates happen in one place. The page works fully with no JavaScript; GSAP animation and the Three.js 3D scene download later, only when the visitor's device and settings allow them. There is no server, database, account system, or form.

## Decision

**Chosen option**: Option 1: Astro static site with Tailwind on Netlify Free.

Build a single static page with Astro 7 and Tailwind v4 in strict TypeScript, keep all copy and the booking URL in one typed content file, lazy load GSAP and Three.js behind capability checks, and deploy from GitHub `main` to Netlify Free.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.claude/skills/tailwind-4-docs/`) · `pnpm` (`antfu/skills`, `.claude/skills/pnpm/`) · `netlify-config`, `netlify-deploy`, `netlify-caching`, `netlify-frameworks` (`netlify/context-and-tools`, `.claude/skills/netlify-*/`) · `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-performance`, `gsap-plugins`, `gsap-frameworks` (`greensock/gsap-skills`, `.claude/skills/gsap-*/`) · `threejs-*` (`cloudai-x/threejs-skills`, `.claude/skills/threejs-*/`) · `performance`, `core-web-vitals`, `accessibility`, `seo`, `best-practices`, `web-quality-audit` (`addyosmani/web-quality-skills`, `.claude/skills/<name>/`) · `web-design-guidelines` (`vercel-labs/agent-skills`, `.claude/skills/web-design-guidelines/`)

## Rationale

Reasoning, options, and sources: see [rationale.md](rationale.md).

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Pattern | One static page, no backend | The brief rules out forms, accounts, and custom booking, so there is nothing for a server to do. |
| Language | TypeScript, strict (`astro/tsconfigs/strict`) | Catches a missing booking URL or a misspelled content field at build time, not in a visitor's browser. |
| Framework | Astro `7.4.x`, `output: 'static'` (the default) | Ships plain HTML with zero JavaScript unless asked, which makes Release 1 fast and readable before any motion. |
| Interactive code | No UI framework; Astro components plus `<script>` modules | Nav, GSAP, and Three.js need no shared state, so no React or Svelte runtime is shipped. |
| Styling | Tailwind CSS `4.3.x` via `@tailwindcss/vite` (`pnpm astro add tailwind`) | Design tokens live as CSS variables in one `@theme` block, which maps directly onto the feature 3 design spec. |
| Content | One typed module, `src/content/site.ts` | Every line of copy and the booking URL in one file; field typos fail the build. |
| Booking URL | `site.bookingUrl` constant in that same file | A public value, so no secret handling; one edit updates every CTA. |
| Images | `astro:assets` (`<Image>`, `<Picture>`), sources in `src/assets/` | Resizes and converts to modern formats at build time, with width and height set to prevent layout shift. |
| Fonts | Self hosted via Fontsource variable packages, Latin subset and needed weights only, imported in `Base.astro`; the main text font is preloaded and uses `font-display: swap` (typefaces chosen in feature 3) | No request to Google or any third party, so the privacy notice stays simple; preload plus swap avoids invisible text and layout shift. Runner up: Astro's built in `fonts` option, once its stability is confirmed. |
| Motion | `gsap` `3.15.x` from npm, loaded with dynamic `import()` | GSAP and all its plugins are now free; lazy loading keeps it off the critical path. |
| 3D | `three` `0.186.x` (r186) plus `@types/three` as a dev dependency, `WebGLRenderer`, loaded with dynamic `import()` | WebGL runs on nearly every device; the scene is decorative, so the WebGPU upside is not worth the testing cost. |
| Package manager | pnpm `12.x`, pinned with the `packageManager` field in `package.json`; install scripts for `sharp` and `esbuild` approved with `pnpm approve-builds` (committed) | Strict dependency tree; Netlify detects it from the lockfile. pnpm blocks install scripts by default, and a blocked `sharp` breaks image optimization. |
| Runtime | Node 24 LTS, pinned in `.nvmrc` and `netlify.toml` only | Confirmed LTS; the same version locally and on the host avoids "works on my machine" builds; two pins, not three, so they stay in sync. |
| Code host | GitHub, public repo | Automatic deploys on push; the code can double as a portfolio piece. |
| Hosting | Netlify Free, configured by `netlify.toml` in the repo | $0, custom domain with HTTPS, preview deploys; Vercel Hobby forbids commercial sites. |
| Deploy flow | `main` deploys production; every other branch and PR gets a preview URL | A safe place to check changes before they go live. |
| Dependency updates | Dependabot, `package-ecosystem: npm` (it reads `pnpm-lock.yaml`), monthly, all updates grouped into one PR | Security fixes arrive without daily noise; security alerts still come right away. |
| Analytics | Not chosen here; feature 15 decides | Netlify Free has no analytics, so feature 15 picks a cookieless tool that works on any host. |
| Observability | Netlify deploy logs plus a Lighthouse audit at launch; no error tracker | No runtime logic worth monitoring, and an error tracker would add a third party script. Runner up: a free error tracking tier if motion code starts failing in the wild. |
| Database, auth, server functions | None | Not needed; Netlify Functions, Forms, and Edge Functions stay off. |

## Architecture rules

These are the structural calls the build must follow. `/develop` derives the scaffold steps from this section and the table above.

**Project layout**

```
src/
  content/site.ts      every line of copy + bookingUrl (the only content source)
  pages/index.astro    the one page; composes the section components
  pages/404.astro      branded not found page (otherwise Netlify serves its own)
  layouts/Base.astro   <html> shell, <head>, fonts, global CSS, the motion loader <script>
  components/          one .astro file per section, plus BookCta.astro and Nav.astro
  motion/              loader.ts (capability gates), gsap.ts, scene.ts (Three.js)
  styles/global.css    @import "tailwindcss"; @theme tokens
  assets/              images processed by astro:assets
public/                favicon.svg + favicon.png fallback, robots.txt (allow all), social card image
netlify.toml
.nvmrc
.gitignore             node_modules, dist, .astro, .env*, .netlify
.github/dependabot.yml
skills-lock.json       committed (records the installed agent skills)
```

The layout leaves room for more static routes (for example `/privacy` if feature 12 picks a separate page) without changing the architecture.

**Content and booking URL**

- `site.ts` exports one `site` object typed with `satisfies SiteContent` (TypeScript checks every field exists and has the right type without widening the values).
- `site.bookingUrl` is the only place the Cal.com URL appears in the repo. `site.ts` checks it when the module loads (it is imported by every page, so a throw stops `astro dev` and `astro build` with a clear message): it must parse with `new URL()` and use `https:`.
- Until feature 5 delivers the real URL, `site.ts` holds an exported `BOOKING_PLACEHOLDER` constant as the value. Local and preview builds allow it. A build where `process.env.CONTEXT === 'production'` (Netlify's production deploy) throws while the placeholder is still set, so a placeholder can never go live.
- `BookCta.astro` is the only component that renders a booking link, and it always reads `site.bookingUrl`. Every "Book a Free Call" button uses it. This also gives feature 15 one place to count clicks.
- Components never hard code copy; they read it from `site`.

**Lazy loading contract (heavy code)**

- The HTML and CSS alone produce a complete, readable page with working booking links. No content starts hidden in CSS while waiting for JavaScript; any "from" state is applied by the motion script itself, after it loads.
- `motion/loader.ts` is the only motion code in the initial page. `Base.astro` includes it as a `<script>` (Astro bundles it as a deferred module). It starts after the `load` event, inside `requestIdleCallback` (falling back to `setTimeout` where that is missing), and decides what to fetch:
  - **GSAP**: `import('./gsap')` only if `prefers-reduced-motion: reduce` does not match.
  - **Three.js**: `import('./scene')` only when the `[data-scene]` container comes within about 200px of the viewport (`IntersectionObserver`), and only if reduced motion is off and `navigator.connection` (Chromium only, typed by a local cast) does not report `saveData` or an `effectiveType` of `2g` or `slow-2g`.
- `gsap` and `three` are imported only inside `motion/gsap.ts` and `motion/scene.ts`, and those modules are reached only through `import()`. Nothing else imports them statically, so neither library lands in the entry chunk.
- **Plug in contract** (features 13 and 14 fill these in without changing the loader):
  - `motion/gsap.ts` exports `init(root: HTMLElement): () => void`, returning a cleanup function.
  - `motion/scene.ts` exports `init(container: HTMLElement): () => void`, returning a cleanup function that disposes the renderer.
  - The scene container is an element with `data-scene`, and the static fallback `<img>` sits inside it. The section component owns both. `scene.ts` hides the fallback only after the first frame renders.
- WebGL support is tested by creating the `WebGLRenderer` inside `try`/`catch` (no throwaway probe context). On failure, the fallback stays.
- Reduced motion is checked at start. A `change` listener on that media query calls both cleanups if a visitor turns reduced motion on during the visit; turning it off mid visit does not start motion.
- Each dynamic import is wrapped in `try`/`catch`. A failed load leaves the static page untouched and logs once to the console.
- Animation concepts and the scene itself are decided in features 13 and 14.

**Navigation without JavaScript**

- Navigation is plain `<a href="#section">` links to section ids. On desktop they are always visible; on small screens they sit in a `<details>`/`<summary>` menu that opens with no script (feature 6 styles it).
- `scroll-behavior: smooth` applies only inside `@media (prefers-reduced-motion: no-preference)`. Each section gets a `scroll-margin-top` equal to the header height, so a sticky header never covers a heading.

**Netlify configuration (`netlify.toml`)**

| Setting | Value |
|---|---|
| Build command | `pnpm build` |
| Publish directory | `dist` |
| `NODE_VERSION` | `24` |
| Headers on `/*` | `X-Content-Type-Options: nosniff` · `Referrer-Policy: strict-origin-when-cross-origin` · `X-Frame-Options: DENY` · `Permissions-Policy: camera=(), microphone=(), geolocation=()` |
| Headers on `/_astro/*` | `Cache-Control: public, max-age=31536000, immutable` (hashed build files never change; keep Astro's default `build.assets` folder name) |
| Deploy previews and branch deploys | Add `X-Robots-Tag: noindex`, so search engines never index preview URLs |

A full Content Security Policy (a header listing which scripts may run) is left to feature 16, once feature 15 has named its analytics domain.

**Astro configuration**

- `site: 'https://abedautomation.com'`, so canonical URLs and the social card resolve correctly (feature 11 builds on this).
- `build.format: 'directory'` (the default), so extra routes such as `/privacy` get clean URLs.
- No server adapter (static output needs none).
- `tsconfig.json` extends `astro/tsconfigs/strict` and maps the alias `@/*` to `src/*`.

**Scaffold done check** (the scope's "production build passes"): `pnpm astro check && pnpm build` exits clean, and the entry JavaScript chunk in `dist/_astro/` contains no `three` or `gsap` code.

**Configuration required**: none. No environment variables, secrets, or API keys.

**Key invariants**

- With JavaScript disabled, every section is readable and every booking CTA opens `site.bookingUrl`.
- The booking URL exists in exactly one place in the codebase.
- The first page load makes no third party requests (fonts and images are self hosted; Cal.com loads only when a visitor clicks). Feature 15 may add exactly one cookieless analytics request.
- The site sets no cookies.
- The build output is static files only; no server code runs on Netlify.

## Consequences

**Positive**:
- Release 1 ships as plain HTML: fast on mobile, accessible by default, and nothing for an attacker to target.
- Hosting costs $0, and every branch gets a preview URL.
- Copy and booking link updates are a one file edit.

**Negative / tradeoffs**:
- Netlify's pricing page does not say whether the Free plan allows commercial use; if it does not, hosting becomes Netlify Pro at $20 a month (or a move to another static host).
- The Free plan has a 300 credit monthly budget. Every deploy (production, preview, and the monthly Dependabot PR) spends credits, and heavy 3D assets or video spend bandwidth credits, so feature 14 must keep its assets small.
- Until feature 5 is done, Netlify production builds fail on purpose (the booking placeholder guard). Use branch previews to check work before then.
- Netlify Free has no analytics, so feature 15 adds a third party cookieless tool and the privacy notice must name it.
- Any text change needs a commit and a deploy; there is no editing dashboard.
- The repo is public, including `docs/` (scope and specs) and `.claude/` (agent skills), which stay committed on purpose: they hold no secrets and show how the site was built. Drafts, commit messages, and history are visible, so unapproved copy stays on branches until you approve it, and secrets are never committed.
- Astro 7 came out in June 2026, so blog posts and examples online often show older versions. Rely on the Astro docs MCP and the `astro` skill instead.
- Tailwind puts many classes in the markup; long class lists in components are the accepted cost.

**Neutral**:
- Content and the booking URL are part of the code, so analytics, SEO, and copy features all read from `src/content/site.ts`.
- Lint and format tooling is not chosen here; feature 2 (`/audit`) captures it.

## Follow-up

- [ ] Before feature 16 (launch), read Netlify's terms of service and confirm the Free plan allows a commercial business site. If not, choose Netlify Pro or another host and update this spec.
- [ ] Connect the MCP servers you picked (a settings step only you can do): Astro Docs (`claude mcp add --transport http astro-docs https://mcp.docs.astro.build/mcp`), Netlify (`@netlify/mcp`, needs a personal access token), Lighthouse (`danielsogl/lighthouse-mcp-server`), GitHub (`github/github-mcp-server`).
- [ ] Project wide skill conventions not yet in root `AGENTS.md` `## Agent skills` (there is no `AGENTS.md` yet; feature 2 `/audit` creates it): `astro`, `tailwind-4-docs`, `pnpm`, `netlify-*`, `web-design-guidelines`, and the web quality set (`performance`, `core-web-vitals`, `accessibility`, `seo`, `best-practices`, `web-quality-audit`).
- [ ] Area skill conventions for motion belong in a nested `src/motion/AGENTS.md`, not root: `gsap-*` and `threejs-*`. Root gets a one line pointer to it.
- [ ] Record the connected MCP servers on the `MCP servers:` line of root `AGENTS.md` once they are connected.
- [ ] Commit `skills-lock.json` with the scaffold so the installed skills can be restored on another machine.
- [ ] Feature 3: if Astro's built in `fonts` option is confirmed stable in Astro 7, it may replace Fontsource; either way fonts stay self hosted.
- [ ] Feature 15: the analytics tool must be cookieless and host independent, since Netlify Free offers none.
- [ ] Feature 16: add the Content Security Policy header once the analytics domain is known.
- [ ] Revisit the Node pin when Node 26 becomes Active LTS.
