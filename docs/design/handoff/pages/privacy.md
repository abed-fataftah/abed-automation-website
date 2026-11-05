# Privacy

Route: `/privacy` (new page, `src/pages/privacy.astro`)
Purpose: a visitor can read exactly what the site and the booking collect, without the notice taking up the end of the homepage.
Source in scope: feature 12 (Privacy notice, spec 0007). This changes the spec 0007 decision to show the notice as a section after the final CTA at `/#privacy`. Update spec 0007 through `/architect`.
Design board: none. This page reuses the homepage header, footer, and text styles.

## Content (exact copy)

- Keep every existing string in `site.privacy`, unchanged: the headings ("Who runs this site", "Visiting this site", "Booking a call", "Emailing me", "How I use and keep your details", "Your rights"), the body text, the inline links, and "Last updated 3 November 2026."
- `privacy.title`: Privacy (the page h1)
- `privacy.back`: Back to home → `/`
- Page title tag: Privacy · Abed Automation (follow the existing title pattern from feature 11 if it differs)

## Layout

- Desktop (1280): header, then one text column with a 680px maximum width, left aligned inside the 1120px container. h1 in the Section h2 style (28 to 36px, weight 700), then the existing h2 subsections at 22px, weight 600, with 40px above each. Body text 17px, line height 1.65, in `--color-text-muted`. "Last updated" 15px, below the last section. "Back to home" link 40px below that. Then the footer.
- Tablet: same as desktop, with the column at full content width.
- Mobile (390): same, with the column at full content width and side padding `--spacing-page-x`.

## Components

| Element | Component | Notes |
|---|---|---|
| Header and footer | existing `SiteHeader.astro`, `SiteFooter.astro` | Nav links on this page point to `/#services`, `/#work`, `/#how`, and `/#about` |
| Notice body | existing `PrivacyNotice.astro`, moved here | Remove it from `index.astro` |
| Back link | plain `<a href="/">` | Text link style from `design.md` §6 |

## States

- This is static content, so there are no loading, empty, or error states. If someone opens the old `/#privacy`, they land on the homepage; add a redirect only if feature 12's checks require one.

## Interactions

1. Inline links (Umami, Cloudflare, Cal.com, and Google policies) open in the same tab, as today.
2. Email links open the mail app.
3. "Back to home" → `/`.
4. The footer "Privacy" link on this page points to the page itself.

## Accessibility

- One h1 (Privacy), with the existing subsection headings as h2.
- Landmarks: `header`, `main`, `footer`.

## SEO

- Title as above. Description: "How abedautomation.com counts visits without cookies, and what happens to your details when you book a call or email." Add the page to the sitemap. Canonical `https://abedautomation.com/privacy`.

## Open items

- Confirm with Abed that the description line above is acceptable (it's new copy).
- Update the `check:copy` link rules for the new `/privacy` path.
