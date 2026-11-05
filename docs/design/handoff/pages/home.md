# Home

Route: `/` (`src/pages/index.astro`)
Purpose: a visitor understands both services, trusts Abed, and books the free 30-minute call.
Source in scope: features 4 (Site copy), 6 (Header and hero), 7 (Tools), 8 (Services), 9 (About), 10 (Final CTA and footer), 12 (Privacy link), 13 (GSAP motion: hero underline), 14 (replaced by the dotted portrait), 15 (booking click analytics), and the deferred "Selected Work" item.
Design board: https://claude.ai/artifact/2pUjxVjZaQLgffPYZY5fzL, boards "Homepage, desktop" and "Homepage, phone".

## Content (exact copy)

All strings live in `src/content/site.ts`. The key names below are suggestions; map them onto the existing `SiteContent` shape and keep existing keys where they already hold the same text. Text in `[BRACKETS]` is a placeholder that must be replaced before launch (see Open items).

**Header**
- `nav.services`: Services → `#services`
- `nav.work`: Work → `#work`
- `nav.how`: How it works → `#how`
- `nav.about`: About → `#about`
- `nav.book`: Book a call → booking URL
- Logo: the existing approved SVG logo, linking to `#top` (the board shows the text "Abed Automation" in its place)
- Skip link: keep the existing label

**Hero** (`#top`)
- `hero.greeting`: Hi, I'm Abed.
- `hero.heading`: I build AI automation, websites, and web apps for small businesses. ("AI automation" carries the coral underline, as on the current site.)
- `hero.lead`: I help you cut repetitive work and get the website or app your business needs. It starts with a free 30-minute call.
- `hero.cta`: Book a Free Call → booking URL
- `hero.secondary`: See my work → `#work`
- `hero.portraitAlt`: Portrait of Abed Fataftah drawn in dots

**Services** (`#services`)
- `services.heading`: Services
- `services.websites.title`: Websites and web apps
- `services.websites.body`: I build business websites and custom web applications. The focus is practical features that work as intended.
- `services.startLabel`: Good places to start
- `services.websites.starts`: "A clear site that explains what you offer", "A tool shaped around how you work"
- `services.automation.title`: AI automation
- `services.automation.body`: I connect the tools you already use, such as Gmail, Slack, and Telegram, and add AI to handle the repetitive steps in between.
- `services.automation.starts`: "Sorting incoming messages", "Drafting replies", "Routine updates"

**Work** (`#work`)
- `work.heading`: Work
- `work.intro`: A few things I've built, and one I'm still building.
- Card 1
  - `work.items[0].category`: AI automation
  - `work.items[0].title`: AI assistant workflows
  - `work.items[0].body`: Built with n8n. [WHAT STARTS THE WORKFLOW, WHAT THE AI DOES, AND WHERE THE RESULT GOES]
  - `work.items[0].image`: [SCREENSHOT OF THE N8N WORKFLOW, PRIVATE DATA BLURRED], alt [DESCRIBE THE SCREENSHOT]
  - `work.items[0].link`: [GITHUB URL, OR NONE]; label "View on GitHub" if a URL is given
- Card 2
  - `work.items[1].category`: Web app
  - `work.items[1].status`: In progress
  - `work.items[1].title`: SKF ecommerce platform
  - `work.items[1].body`: Still in development. [WHAT IT WILL LET CUSTOMERS DO]
  - `work.items[1].image`: [SCREENSHOT OR DESIGN PREVIEW OF SKF], alt [DESCRIBE THE SCREENSHOT]

**How it works** (`#how`)
- `how.heading`: How it works
- Step 1: "Free 30-minute call". You tell me what you need, and I share how I'd approach it.
- Step 2: "Clear steps". I break the work into clear, manageable steps.
- Step 3: "Straightforward updates". I keep communication straightforward as the work moves along.
- Step 4: "Checked before handover". I check that what I build works as intended.

**About** (`#about`)
- `about.heading`: About
- `about.intro`: I'm Abed Fataftah, the developer behind Abed Automation. I work remotely with businesses to turn practical needs into working software: websites, web applications, and AI automation.
- `about.background`: Before this, I spent five years running a lighting retail business, handling sales, customers, and daily operations. It taught me how much time everyday tasks can take, and to start from the problem the software needs to solve.
- `about.facts`: "5 years running a retail business", "Master's degree in Computer Science", "Works remotely"
- `about.toolsLabel`: Tools I work with:
- `about.tools`: the nine confirmed names already in `site.tools.items` (n8n, OpenAI, Claude, TypeScript, React, Astro, Tailwind CSS, Node.js, PostgreSQL), joined with ", "
- `about.profiles`: [LINKEDIN URL], [GITHUB URL]; labels "LinkedIn" and "GitHub". Leave out any profile without a URL.
- `about.photoAlt`: Abed Fataftah, wearing a navy suit jacket over a dark shirt.

Removed from the current About text: the projects sentence (now the Work section) and the working-method paragraph (now How it works).

**Final CTA**
- `cta.heading`: Have a website, web app, or automation need? Let's talk.
- `cta.body`: In a free 30-minute call with no obligation, you tell me what you need and I'll share how I'd approach it.
- `cta.button`: Book a Free Call → booking URL
- `cta.reassurance`: No cookies. Calls are never recorded.
- `cta.emailLead`: Prefer email?
- Email link text and target: abed@abedautomation.com → `mailto:abed@abedautomation.com`

**Footer**
- `footer.copyright`: © 2026 Abed Automation (keep the existing year logic)
- Email link: abed@abedautomation.com → `mailto:abed@abedautomation.com`
- `footer.privacy`: Privacy → `/privacy`

Copy changes from the current site: "30 minute" becomes "30-minute" everywhere, including the meta description and the Cal.com event description.

## Layout

**Desktop (1280).** Content width 1120px, centered.
1. Header: one row. Logo on the left; nav links and "Book a call" on the right, with nav and button separated by 32px. Padding 20px top and bottom.
2. Hero: two columns with a 48px gap, vertically centered. Left: greeting, h1 (max 18ch), lead (max 34em, 24px above), then the buttons row 32px below (booking button and "See my work," with a 28px gap). Right: the portrait square, 460px max.
3. Services: h2, then two equal cards with a 24px gap. Inside each card: h3, body (12px gap), "Good places to start" (24px above, 8px below), bulleted list.
4. Work: h2, intro (12px below the h2, 40px above the cards), two equal cards with a 24px gap. Each card has a 16:10 image, then its body.
5. How it works: h2, four steps in one row with a 24px gap.
6. About: h2, then the photo (300px wide, 4:5) and text (max 640px) with a 48px gap, top aligned. Facts sit 28px below the paragraphs, the tools line 28px below the facts, profile links 16px below the tools line.
7. Final CTA: h2 (max 20ch), body (20px below, max 34em), button (32px below), reassurance line (20px below), email line (8px below).
8. Footer: one row. Copyright on the left; email and Privacy on the right, with a 20px gap. Padding 28px top and bottom.

**Tablet (768).** Same as phone, except How it works shows two columns and the header stays on one row if it fits.

**Mobile (390).** Header: logo and "Book a call" on the first row, nav links wrapping on the second. Hero: text first, then the portrait at full content width. Every two-column area stacks into one column. The About photo is limited to 300px wide. The footer wraps to two rows.

## Components

| Element | Component | Variant | Props | Notes |
|---|---|---|---|---|
| Header booking button | `BookCta` | header size | location `header` | New Umami location value |
| Hero booking button | `BookCta` | large | location `hero` | Existing location |
| CTA booking button | `BookCta` | large | location `cta` | Existing location; keep its current value name |
| Portrait | new `DottedPortrait.astro`, replacing `HeroScene.astro` | none | none | `<picture>` fallback plus `<canvas>`; code in `src/motion/portrait.ts` from `reference/dotted-portrait.ts`; data in `assets/portrait-dots.json` |
| About photo | Astro `<Image>` | none | `assets/abed-about.jpg` (640×800) | Replaces the current `src/assets/abed.png` usage, or reuse it if Abed prefers |
| Service card, Work card, step, fact chip | markup in `index.astro` | see `design.md` §6 | none | none |

## Data

- The booking URL comes from `site.ts` (feature 5). Do not duplicate it.
- The tools list comes from `site.tools.items` (feature 7), now shown in About.
- The portrait dots come from `portrait-dots.json`: grid size `n` = 110, `v` and `d` hold 12,100 values each (0 to 255), and `eyes` holds two eye centres. Import it inside the lazily loaded portrait module so it stays out of the entry chunk.
- No dates, prices, or numbers are shown except "30-minute," "5 years," and the copyright year.

## States

- **Portrait, no JavaScript:** the still fallback image shows, with its alt text.
- **Portrait, loading:** the still fallback image shows. When the module has drawn its first frame, fade the canvas in over 300ms and hide the fallback from the accessibility tree, so the label isn't read twice. Reduced motion: no fade.
- **Portrait, failed:** the fallback image stays and nothing else changes.
- **Work content missing:** this section must not ship with placeholders. Until Abed supplies the content, leave the Work section, its nav link, and the "See my work" link out of the build together.
- **Booking:** every booking button opens the Cal.com page in the same tab. There is no error state on this site.
- **Empty and success states:** none on this page.

## Interactions

1. Nav link clicked → scrolls to its section (smooth only without reduced motion).
2. Any booking button → opens the Cal.com booking page in the same tab, and Umami counts the click with its location.
3. "See my work" → scrolls to `#work`.
4. Email links → open the visitor's mail app.
5. "Privacy" → opens `/privacy`.
6. Mouse or pen moves anywhere on the page → the portrait's eyes look toward the pointer (easing 0.22 per frame), and the head follows more slowly (easing 0.09 per frame). The head turns up to 2.4% of the portrait width sideways and 2.6% up or down. The eye openings widen up to 22% when looking up and narrow up to 30% when looking down. All values are in `TUNING` in `reference/dotted-portrait.ts`.
7. Pointer leaves the browser window → the portrait looks back at the visitor (straight ahead).
8. Touch tap → the portrait looks at the tap for 1.6 seconds, then looks straight ahead.
9. Tab focus reaches any booking button → the eyes look at that button. Focus leaves → straight ahead.
10. Page loads → the coral underline under "AI automation" draws from left to right once (existing GSAP behavior).

## Accessibility

- Landmarks: `header`, `nav aria-label="Main"`, `main` (the skip link target), `footer`.
- Headings: one h1 (the hero). The h2s are Services, Work, How it works, About, and the final CTA heading. The h3s are cards and steps.
- Steps use `<ol>`. Lists use `<ul>`.
- The portrait canvas has `role="img"` and an `aria-label`. The underline span is `aria-hidden="true"`.
- No live regions are needed.

## SEO

- Keep the title, canonical, Open Graph, JSON-LD, and sitemap from feature 11.
- Description: change "30 minute" to "30-minute" in `site.ts`.
- Share image: unchanged.

## Open items

- Work card text, screenshots (1600×1000 WebP or PNG, 16:10, private data blurred), alt text, and the optional GitHub URL.
- LinkedIn and GitHub URLs for About (or leave the line out).
- Whether to add a step about what happens after the call (for example a written proposal). Abed hasn't decided this.
- Exact token values for the [APPROX] colors: use `global.css`.
