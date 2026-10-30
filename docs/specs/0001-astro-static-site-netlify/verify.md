# Verify: Stack & architecture · spec 0001 · updated 2026-10-28
_Steps derived from spec 0001 (the scope's Done when, the scaffold done check, and the key invariants; this spec has no numbered acceptance criteria, so each step names the rule it checks). `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [x] Run `pnpm dev`, open `http://localhost:4321/` → the page shows the heading, intro, and a "Book a Free Call" link → Done when: scaffold runs locally
- [x] Open `http://localhost:4321/does-not-exist` → the branded 404 page shows with a link back home → layout: `pages/404.astro`
- [x] With JavaScript disabled in the browser, reload `/` → all text is visible and "Book a Free Call" opens `site.bookingUrl` → invariant: page works with no JavaScript
- [x] In DevTools Network, reload `/` with normal settings → a small `gsap.*.js` chunk loads after the page is idle; no `scene.*.js` loads (there is no `[data-scene]` yet); no request leaves `localhost` → lazy loading contract, invariant: no third party requests
- [x] Turn on "prefers reduced motion" (DevTools Rendering panel), reload → no `gsap.*.js` request → lazy loading contract: reduced motion
- [x] In DevTools Application, check cookies for `localhost` → none set → invariant: no cookies

## Commands
- [x] `pnpm astro check && pnpm build` → both exit 0 → Done when: production build passes (scaffold done check)
- [x] Open the entry chunk `dist/_astro/Base.astro_astro_type_script_*.js` → it references `gsap.*.js` and `scene.*.js` only through `import()`, and contains no GSAP or Three.js code → scaffold done check
- [x] `CONTEXT=production pnpm build` (PowerShell: `$env:CONTEXT='production'; pnpm build`) → the build fails with "site.bookingUrl is still the placeholder" → booking URL placeholder guard
- [x] In `src/content/site.ts`, set `bookingUrl` to `http://example.com` and run `pnpm build` → the build fails with "must use https" (undo afterwards) → booking URL check on load
- [x] Search the repo (excluding `node_modules`, `dist`, `docs`) for `example.com/booking` and `cal.com` → the booking URL appears only in `src/content/site.ts` → invariant: booking URL in exactly one place
- [x] Read `netlify.toml` → build command `pnpm build`, publish `dist`, `NODE_VERSION = "24"`, the four security headers on `/*`, the immutable cache header on `/_astro/*`, and preview and branch contexts copying `config/preview-headers` (noindex) into `dist/_headers` → Netlify configuration table
- [x] Check `.nvmrc` is `24` and `package.json` has `"packageManager": "pnpm@12.16.1"` → runtime and package manager pins

## Acceptance-criteria coverage
- Done when (scaffold runs locally): dev server step
- Done when (production build passes): check and build step, entry chunk step
- Booking URL rules: placeholder guard, https check, single place search
- Lazy loading contract: Network step, reduced motion step, entry chunk step
- Key invariants (no JavaScript needed, no third party requests, no cookies, static output only): JavaScript off step, Network step, cookies step, build output in `dist/`
- Netlify and runtime configuration: `netlify.toml` step, pins step
- Not checkable before deploy: the real headers and noindex on Netlify (check in feature 16 once the site is connected)
