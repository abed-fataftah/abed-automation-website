# Abed Automation website

The single page site for abedautomation.com. Built with Astro and Tailwind CSS, hosted on Cloudflare Pages (moving from Netlify, see spec 0013).

- Every line of copy and the booking URL live in `src/content/site.ts`.
- Architecture decisions: `docs/specs/0001-astro-static-site-netlify/`.
- Feature plan: `docs/scope/scope.md`.

## Setup

You need Node 24 (see `.nvmrc`) and pnpm 12 (pinned by `packageManager` in `package.json`, so Corepack picks the right version).

```bash
corepack enable
pnpm install
```

`pnpm install` also sets up a git hook that runs ESLint and Prettier on the files you commit.

## Local development

```bash
pnpm dev
```

The site runs at `localhost:4321` and reloads as you edit. Copy changes go in `src/content/site.ts`; the look is governed by `design.md` and the tokens in `src/styles/global.css`.

The Umami analytics script is left out of every build except the production deploy, so local visits are never counted.

## Commands

| Command | What it does |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the local dev server at `localhost:4321` |
| `pnpm check` | Type check the project |
| `pnpm build` | Build the static site into `dist/` |
| `pnpm preview` | Serve the built site locally |
| `pnpm lint` | Run ESLint (warnings fail; `pnpm lint:fix` fixes what it can) |
| `pnpm format` | Format with Prettier (`pnpm format:check` only checks) |
| `pnpm verify` | The full gate CI runs: type check, lint, format, design and copy checks, build, bundle budget |

| `pnpm check:live` | Compare the live site's scripts and frames with a fresh build (needs the network; not part of `verify`) |

A change is ready when `pnpm verify` exits clean.

## How deploys work

The site is moving from Netlify to Cloudflare Pages (spec 0013), because Netlify Free now adds a "Powered by Netlify" badge to every page and only a paid plan removes it. Until the move is finished, both hosts build `main` from GitHub: Netlify serves the live site, and Cloudflare serves the same build at `abedautomation.pages.dev`. Neither needs secrets.

- A push to `main` deploys production on both hosts.
- Every pull request gets a preview on both. Previews send `X-Robots-Tag: noindex`, so search engines skip them (Cloudflare adds it on its own; Netlify copies in `config/preview-headers`).
- GitHub Actions runs `pnpm verify` on every pull request and on `main`.

The usual flow: work on a branch, open a pull request, check the preview, then merge. To roll back, open the project's **Deployments** list in Cloudflare and choose *Rollback to this deployment* on an earlier one (on Netlify: the **Deploys** list, then publish an earlier deploy).

Security headers, including the Content Security Policy, live in two places for now:

- `public/_headers` for Cloudflare, with the strict policy (no inline scripts).
- `netlify.toml` for Netlify, with the same values plus `'unsafe-inline'` in `script-src`, a stopgap so Netlify's badge draws instead of leaving an empty frame that blocks taps. Netlify's build deletes `_headers`, so it never serves the Cloudflare file.

If you ever add a script, font, or image from another host, add that host to the policy in both files, or the browser will block it.

The Umami tag is only built into production: a Cloudflare build of `main` (`CF_PAGES=1` and `CF_PAGES_BRANCH=main`, both set by Cloudflare) or, until Netlify is removed, Netlify's `CONTEXT=production`.

## Going live on Cloudflare Pages (one time setup)

These steps happen in your Cloudflare and Namecheap accounts, so only you can do them. Take them in order; each phase leaves a working live site.

### Before you start

1. **Check the terms.** Read Cloudflare's Self Serve Subscription Agreement and the Pages terms it links, and confirm a commercial business site may run on the Free plan. If it may not, stop here and run `/architect` again (the next option is Firebase Hosting).

   **Result (checked 2026-10-31): allowed.** No Cloudflare term limits the Free plan to personal or non commercial use, so this business site may run on it.
   - [Self Serve Subscription Agreement](https://www.cloudflare.com/terms/) (last updated 2025-09-12): nothing restricts Free to non commercial use. Section 2.6 (Free and Trial Services) only says Cloudflare carries no liability for harm from Free Services, and section 11 provides every service "as is" and "as available".
   - [Service Specific Terms, Developer Platform](https://www.cloudflare.com/service-specific-terms-developer-platform/) (last updated 2026-09-28), which covers Pages: it says the platform "can be used to host content" and does not address commercial websites. Cloudflare may temporarily limit storage or requests, may change `pages.dev` subdomain names (usually with a week's notice), and may remove illegal or harmful content.
   - [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) (last updated 2026-09-05): on Free, 500 builds a month, 1 build at a time, 20,000 files per site, 25 MiB per file, 100 custom domains per project. No bandwidth cap and no commercial use rule.
   - Positioning, not a rule: third party summaries quote Cloudflare describing Free as suited to projects that "aren't business critical", with no uptime guarantee (that starts on Business). The current [plans page](https://www.cloudflare.com/plans/) does not use that wording. This site accepts that tradeoff (spec 0013, *Consequences*).

   Check again if Cloudflare's terms change, or before you depend on the site for anything that needs an uptime guarantee.
2. **Check that Pages is still offered.** The dashboard must still let you create a Pages project connected to GitHub, with preview deployments. If new static sites are only offered as Workers, stop and run `/architect` again; the build variables and preview behaviour would change.

   **Result (checked 2026-10-31): offered.** The `abedautomation` Pages project was created, connected to GitHub, and deployed `main` to `abedautomation.pages.dev`.
3. **Set up the account.** Sign up with an email address that is not on abedautomation.com, so you can still sign in if domain email ever breaks. Turn on two factor sign in on Cloudflare and on Namecheap.

### Side by side (Netlify keeps serving the domain)

4. **Create the Pages project** with these settings:

   | Setting | Value |
   |---|---|
   | Project name | `abedautomation` (public as `abedautomation.pages.dev`) |
   | Source | GitHub `abed-fataftah/abed-automation-website`, this repository only; production branch `main`; previews for all pull requests |
   | Framework preset | None |
   | Root directory | blank |
   | Build command | `pnpm build` |
   | Output directory | `dist` |
   | Environment variables (production and preview) | `NODE_VERSION=24`, `SKIP_INSTALL_SIMPLE_GIT_HOOKS=1` |

5. **Read the first build log.** Check it shows Node 24 and pnpm 12, and that `sharp` installs. If pnpm is the wrong version or `sharp` fails, change the build command to `corepack enable && pnpm install --frozen-lockfile && pnpm build`.
6. **Check a pull request preview.** Both preview addresses (the deploy hash one and the branch one) should answer with `X-Robots-Tag: noindex` (`curl -sI <url>`), and the page should have no Umami tag.
7. **Check `abedautomation.pages.dev`.** The five security headers are there, with no `'unsafe-inline'` in `script-src`; `/_astro/` files carry `Cache-Control: public, max-age=31536000, immutable`; `/nope` and `/nope/` show the 404 page with status 404. Then run the live check against it:

   ```bash
   CF_PAGES=1 CF_PAGES_BRANCH=main pnpm build
   LIVE_URL=https://abedautomation.pages.dev pnpm check:live
   ```

### Switch the domain (one sitting)

8. **A day ahead,** lower the TTL of every record at Namecheap to the minimum and confirm DNSSEC is off.
9. **Add `abedautomation.com` to Cloudflare** (Free plan) and let it import the records. Then fix the zone:
   - Delete the imported Netlify records (apex `A` or `ALIAS`, `www` `CNAME` to `*.netlify.app`) and any Namecheap parking or URL redirect records.
   - Add `www` as `AAAA 100::`, proxied (only the redirect rule below answers it).
   - Keep every mail and verification record (MX, SPF, Google site verification, DMARC, DKIM, CAA, any others) with the same values, set to **DNS only**, not proxied.
10. **Compare every record twice.** First ask Namecheap's own nameservers, then the two nameservers Cloudflare assigned you, and check each answer matches:

    ```bash
    dig MX abedautomation.com @dns1.registrar-servers.com
    dig TXT abedautomation.com @dns1.registrar-servers.com
    dig TXT _dmarc.abedautomation.com @dns1.registrar-servers.com
    dig TXT google._domainkey.abedautomation.com @dns1.registrar-servers.com
    dig CAA abedautomation.com @dns1.registrar-servers.com
    ```

    Repeat each with `@<your Cloudflare nameserver>`. Do not go on until every mail record matches.
11. **Set the zone settings.**

    | Setting | State |
    |---|---|
    | Email Address Obfuscation, Rocket Loader, Web Analytics automatic setup, Zaraz, Always Online, Speed Brain, Cloudflare Fonts, Hotlink Protection, Bot Fight Mode | Off |
    | SSL/TLS mode | Full (strict) |
    | Always Use HTTPS | On |
    | Redirect Rule `www to apex` | `http.host eq "www.abedautomation.com"` → 301 to `concat("https://abedautomation.com", http.request.uri.path)`, query kept |
    | HSTS | Off for now |

    Each of the features turned off would add code, cookies, or rewrites to the page.
12. **Approve the privacy wording** in spec 0013 (*Privacy wording*) and confirm the link to Cloudflare's privacy policy, so the change is ready on a branch.
13. **Change the nameservers** at Namecheap to the two Cloudflare assigned. When the zone shows *Active*, add `abedautomation.com` as a custom domain on the Pages project (never `www`).
14. **Within the hour** of the domain resolving to Cloudflare, merge the privacy change.
15. **Send a test email** to and from `abed@abedautomation.com`, then run the launch checks below.

### Roll back (within 7 days of the switch)

Set the Namecheap nameservers back to `dns1.registrar-servers.com` and `dns2.registrar-servers.com` and revert the privacy commit. Netlify still serves `main` and keeps its custom domain, and the old records at Namecheap stay untouched. Make no DNS changes at Namecheap or Cloudflare during these 7 days, so a rollback lands on the same records. It can take up to 48 hours to spread.

### Remove Netlify (7 days after the switch)

If no rollback was needed, run `/develop deploy & go live` again to remove `netlify.toml`, `config/preview-headers`, and `CONTEXT`. Once that is merged, delete the Netlify project and uninstall Netlify's GitHub app.

## Launch checks

Run these on `https://abedautomation.com` after the first production deploy. The design checks come from the acceptance checklist in `docs/design/handoff.md` (section 11).

**Hosting**

- [ ] `https://abedautomation.com` loads with a valid certificate.
- [ ] `http://abedautomation.com` and `https://www.abedautomation.com` both redirect to `https://abedautomation.com`.
- [ ] A made up path such as `/nope` shows the 404 page with HTTP status 404.
- [ ] The response headers include `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`, and not `X-Robots-Tag`.
- [ ] The DevTools console shows no Content Security Policy errors, and the 3D scene and motion still run on desktop.
- [ ] `CF_PAGES=1 CF_PAGES_BRANCH=main pnpm build && pnpm check:live` passes: no script, frame, `/cdn-cgi/` rewrite, or cookie the build did not make.

**Page** (from `docs/design/handoff.md`)

- [ ] At 320px and 390px there is no sideways scroll; at 390px the header sits on two rows and both buttons are full width and 48px tall.
- [ ] At 768px, About is in 2 columns and services in 2 columns; at 1280px, content is at most 1120px wide, About is in 3 columns, services in 2.
- [ ] The first Tab press shows "Skip to content", and Enter moves focus to `<main>`; tab order matches `design.md` section 9 and every focus ring is visible.
- [ ] Every link and button is at least 44px tall; one `<h1>` per page; landmarks present.
- [ ] Both "Book a Free Call" buttons open the Cal.com intro call in the same tab.
- [ ] With JavaScript off, all text is visible and the booking buttons work.
- [ ] With reduced motion on, smooth scrolling is off and no motion code loads.
- [ ] No placeholder text in square brackets anywhere.
- [ ] Lighthouse (mobile) shows no accessibility, best practices, or SEO failures.

**Analytics and privacy** (spec 0010)

- [ ] No cookies and no local or session storage after a visit and a booking click.
- [ ] Every request on first load goes to `abedautomation.com` or a host under `umami.is`.
- [ ] The Umami dashboard shows the page view, and a `book-call` event with the right `location` for each booking button.

The automated items (contrast tokens, raw colors, banned components, the booking URL living in one file, the bundle budget) already run in `pnpm verify`.
