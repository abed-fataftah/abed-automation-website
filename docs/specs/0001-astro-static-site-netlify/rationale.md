# 0001. Astro static site on Netlify: rationale

Decision record for [index.md](index.md). `/develop` does not need this file.

## Context

Abed Automation needs a single page site at abedautomation.com, built and run by one person. Its job is to build trust and send every visitor to one Cal.com booking URL. The brief rules out forms, accounts, a custom booking system, and public pricing, so the site has no data to store and no user to sign in (basis: `docs/scope/scope.md`, ground rules).

The delivery approach is Skateboard: Release 1 must be a plain, readable, accessible page with working booking links and no motion. Release 2 then adds GSAP motion and a Three.js scene, which are heavy (Three.js alone is several hundred kilobytes). So the foundation has to make "readable first, motion later" the default, not something added afterward (basis: `docs/scope/scope.md`, Skateboard approach and Release 2 rules).

Content must be easy to update, and the booking URL must live in one place. Visit counting must be cookieless, so no cookie banner is needed. The scope named Vercel or Netlify as hosts. The current terms matter: Vercel's Hobby plan bans commercial use, and this site advertises paid services. Cost, simplicity, and one person operating the site outweigh scale; traffic will be small.

## Options considered

Each option is a complete stack. All four would host on GitHub with automatic deploys.

### Option 1: Astro static site, Tailwind, Netlify Free (chosen)

Astro 7 outputs static HTML with zero JavaScript by default, styled with Tailwind v4 and deployed to Netlify Free.

**Pros**: no JavaScript unless asked, which matches Skateboard exactly · components and layouts without a runtime · built in image optimization · $0 hosting.
**Cons**: Astro 7 is new (June 2026), so most examples online are out of date · Netlify Free's commercial terms are unconfirmed · no built in analytics.

### Option 2: Plain Vite with TypeScript, Netlify Free

Hand written HTML plus TypeScript modules, bundled by Vite 8.

**Pros**: the lightest toolchain, with nothing to learn beyond the web platform · the same lazy import story.
**Cons**: no components or layouts, so sections become copied HTML · no built in image pipeline · you build by hand what Astro already provides.

### Option 3: SvelteKit 3 with `adapter-static`, Netlify Free

A Svelte app compiled to static files.

**Pros**: clean component syntax · tiny runtime · good static output.
**Cons**: an app framework (routing, load functions, hydration) for a page with no app behavior · ships a small runtime and hydrates by default.

### Option 4: Next.js 16 static export, Vercel Pro

React components exported with `output: 'export'`, hosted on Vercel Pro.

**Pros**: the largest ecosystem · React Three Fiber for the 3D scene · Vercel's polished previews and analytics.
**Cons**: ships the React runtime to every visitor · static export is a secondary path in Next.js · $20 a month, since Vercel Hobby forbids commercial use.

## Rationale

The deciding force is Skateboard's "readable first, motion later". Astro makes zero JavaScript the starting point, so Release 1 is plain HTML by construction. GSAP and Three.js then arrive as opt in chunks behind a loader (basis: progressive enhancement). Option 2 gives the same output but makes you rebuild components and image handling by hand. Options 3 and 4 start from a hydrated app and would need effort to strip back (basis: boring technology, use the least machinery that does the job).

Hosting follows from cost and terms. Vercel Hobby is ruled out for a commercial site, and paying $20 a month for a static page is waste, so Netlify Free wins, pending one check of its terms. The fallback, Netlify Pro or another static host, needs no code change because the output is plain files.

The smaller calls (choices I made for you):
- **No UI framework**: no component has shared state, so a framework runtime would be pure cost.
- **One typed content file**: a short page doesn't justify a CMS or many Markdown files. Type checks plus a build time URL check enforce the "no placeholder links" rule.
- **Self hosted fonts**: keeps the first load free of third party requests, which keeps the privacy notice honest and short (basis: avoiding third party font CDNs for privacy).
- **WebGLRenderer**: works almost everywhere. The release notes don't show WebGPU as the recommended default.
- **No error tracker**: this page has almost no runtime logic. Revisit only if motion code fails in the wild.

## References

**Project sources**:
- `docs/scope/scope.md`: ground rules, Skateboard approach, features 1, 13, 14, 15, 16
- Installed agent skills: `astro`, `tailwind-4-docs`, `gsap-*`, `threejs-*`, `netlify-*` (in `.claude/skills/`)

**Practices & standards**:
- Progressive enhancement (content works without JavaScript; motion layered on top)
- Boring technology / least machinery that does the job
- Respecting `prefers-reduced-motion` and the Save Data hint
- Immutable caching for content hashed build files

**Links** (web verified 2026-10-28):
- Astro 7 release: https://astro.build/blog/astro-7/
- Astro configuration reference (static output default, image service): https://docs.astro.build/en/reference/configuration-reference/
- Astro styling guide (Tailwind v4 via `@tailwindcss/vite`): https://docs.astro.build/en/guides/styling/
- Astro Docs MCP server: https://mcp.docs.astro.build/mcp
- GSAP pricing (100% free, plugins included): https://gsap.com/pricing/
- Three.js releases (r186): https://github.com/mrdoob/three.js/releases
- Vercel fair use guidelines (Hobby is non commercial): https://vercel.com/docs/limits/fair-use-guidelines
- Netlify pricing (Free plan, 300 credits): https://www.netlify.com/pricing/
- Node.js releases (24 LTS): https://nodejs.org/en/about/previous-releases

## Evidence: landscape check (2026-10-28)

Versions from the npm registry on that date: `astro` 7.4.3 · `tailwindcss` and `@tailwindcss/vite` 4.3.3 · `gsap` 3.15.0 · `three` 0.186.1 · `vite` 8.3.5 · `@sveltejs/kit` 3.1.0 · `next` 16.4.3 · `pnpm` 12.16.1. Node 24.22.1 is LTS; Node 26 is Current and may become Active LTS around this date (unconfirmed).

Unverified at write time: Netlify Free commercial use terms · exact Netlify credit rates · Astro `fonts` option stability · whether Three.js now recommends WebGPURenderer by default.
