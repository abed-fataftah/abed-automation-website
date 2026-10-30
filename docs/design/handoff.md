# Handoff: abedautomation.com design (give this to Claude Code first)

## 1. Project summary
A one-page English site for Abed Automation: AI automation, websites, and web apps for small businesses. It builds trust and sends every visitor to one Cal.com page to book a free 30 minute call. Abed is one person, never a team. No pricing, forms, accounts, testimonials, client logos, or invented claims. Main tasks: understand what Abed offers, see who he is, click "Book a Free Call". Source: `scope.md`, features 3, 6 to 12.

## 2. Stack and files
Stack (spec 0001): Astro 7, Tailwind v4, strict TypeScript, Netlify Free, pnpm. Copy and the booking URL live in `src/content/site.ts`.
| Handoff file | Goes to |
|---|---|
| `design.md` | repo root `design.md` (add it to the `AGENTS.md` skill and convention list) |
| `tokens.css` | merge into `src/styles/global.css` after `@import "tailwindcss";` |
| `assets/ad-monogram-transparent.png` | `src/assets/` (reference until the SVG exists) |
| `assets/logo-original.png` | `src/assets/` (original, with the word AUTOMATION; not used in the header) |
| `pages/home.md`, `pages/404.md` | read while building `src/pages/index.astro` and `src/pages/404.astro` |
| `prototype/abedautomation-prototype.html` | reference only; open in a browser to compare |
Fonts: `pnpm add @fontsource-variable/schibsted-grotesk` (version 5.3.0, license OFL-1.1, checked on the npm registry), import in `Base.astro`, Latin subset, weights 400, 500, 700, preload the 400 file.

## 3. Approved decisions record
- Foundation: dark only; Schibsted Grotesk; colors, type, spacing, shape in `tokens.css` and `design.md`; contrast computed by code.
- Direction: I2 "Charcoal coral, plainer". Brand: the AD monogram logo supplied by Abed (code brackets inside the A, coral accent), shown with the text "Abed Automation".
- Reference sites that shaped it (only two were read directly, so this is weak evidence): brittanychiang.com (text-led single page, anchor nav; built with Next.js, Tailwind, Vercel, verified) and linear.app/enterprise (one clear action, plain footer). Inspiration only; nothing copied.
- Prototype method: real code (single HTML file with the exact tokens), reviewed and approved by Abed on his device.
- Pages approved: home, 404. Mobile header uses two rows, no hamburger menu, because the page must work without JavaScript.

## 4. Sitemap and navigation
| Page | Route | Release |
|---|---|---|
| Home (header, hero, tools, services, about, final CTA, privacy, footer) | `/` | 1 |
| Not found | any unknown path | 1 |
| Booking | external Cal.com page, opens separately | 1 (feature 5) |
Nav (home): Tools `#tools`, Services `#services`, About `#about`. Footer: email, Privacy `#privacy`. Release 2 adds GSAP motion and a Three.js scene to the existing hero and sections; no new pages. Deferred: Selected Work.

## 5. Page index
- Home: introduces Abed, lists two services, sends visitors to booking. → `pages/home.md`
- 404: tells visitors the page is missing, links home. → `pages/404.md`

## 6. Shared components and patterns
Header, nav link, primary button (used twice on home), secondary button (404 only), footer, skip link, logo. All defined once in `design.md` section 6. Patterns: dividers instead of cards; no forms or toasts.

## 7. Build order
1. `tokens.css` merge and font install (needs nothing). 2. `Base.astro`: skip link, `<head>`, fonts, global CSS. 3. Header and footer components. 4. Primary and secondary buttons. 5. Home sections in page order: hero, tools, services, About, final CTA, Privacy. 6. 404 page. 7. Check at 320, 390, 768, 1280 widths. Features 11 (SEO), 12 (privacy wording), 13 and 14 (motion) come after this.

## 8. Content and assets
| Item | Status | File and size expected |
|---|---|---|
| Logo monogram | Supplied as PNG (AI-generated, with the word AUTOMATION and tiny dots in the O) | Needed: SVG redraw of the AD mark, 40px high; favicon from the monogram only (32x32 and 180x180 PNG, plus SVG) |
| Page text | Sample, not approved (feature 4) | `src/content/site.ts` |
| Tool names | Only n8n is confirmed | text only; Abed lists the rest |
| About text and photo | Missing | photo square, at least 640x640, optimized, with alt text |
| Booking URL | Missing (feature 5) | one https URL in `site.bookingUrl` |
| Privacy wording | Missing (feature 12) | short text |
| Share image | Missing (feature 11) | 1200x630 PNG, dark background, logo and name |
| Footer email | Abed’s stated address, to confirm | abed@abedautomation.com |

## 9. Key flows
1. Book a call: visitor clicks "Book a Free Call" (hero or final CTA) → Cal.com page opens at `site.bookingUrl` → success: visitor books a slot on Cal.com. Failure: if Cal.com is down, the visitor sees Cal.com’s own error page; the site has nothing to do and shows no message.
2. Navigate: click a nav link → page scrolls to the section; keyboard Tab and Enter do the same.
3. Lost visitor: opens a bad URL → 404 page → "Back to the home page" → `/`.
4. Email: click the footer email → mail app opens.

## 10. Open items and unverified points
- Not confirmed: final copy, About text, photo, tool list, privacy wording, booking URL, footer email, share image.
- Unverified: only 2 reference sites were read directly; the prototype was approved by eye on Abed’s device, not run through an automated browser test; Netlify’s real headers and the 404 status code (check in feature 16); whether Astro’s built in `fonts` option replaces Fontsource (spec 0001 open item).
- Prototype-only things that must not ship: the booking note, the overlay 404, Google Fonts links.

## 11. Acceptance checklist
- [ ] 390px: no sideways scroll; header on two rows; both buttons full width and 48px tall.
- [ ] 1280px: content width max 1120px; About in 3 columns; services in 2 columns.
- [ ] 768px: About in 2 columns; services in 2 columns.
- [ ] 320px: no sideways scroll.
- [ ] All text and button pairs match the contrast table in `tokens.css` (run an automated check).
- [ ] Tab order matches `design.md` section 9; focus ring visible on every link and button.
- [ ] First Tab press shows "Skip to content"; Enter moves focus to `<main>`.
- [ ] Every link and button is at least 44px tall.
- [ ] Both "Book a Free Call" buttons read `site.bookingUrl`; the URL appears in no other file.
- [ ] Production build fails if `bookingUrl` is a placeholder or not https (spec 0001 check still passes).
- [ ] With JavaScript off, all text is visible and the button works.
- [ ] No third party request and no cookie on first load; fonts are self-hosted.
- [ ] No raw hex colors in components; all colors come from tokens.
- [ ] No cards, shadows, gradients, pills, or arrow icons.
- [ ] One `<h1>` per page; landmarks present.
- [ ] Unknown URL shows the 404 page with HTTP status 404 on Netlify.
- [ ] Reduced motion on: smooth scrolling is off and no motion code loads.
- [ ] No placeholder in square brackets remains at launch (scope ground rule).
