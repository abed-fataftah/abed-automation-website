# Abed Automation website

The single page site for abedautomation.com. Built with Astro and Tailwind CSS, hosted on Netlify.

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

The Umami analytics script is left out of every build except Netlify's production deploy, so local visits are never counted.

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

A change is ready when `pnpm verify` exits clean.

## How deploys work

Netlify builds the site from GitHub using `netlify.toml`, so there are no build settings to keep in the Netlify dashboard and no environment variables or secrets.

- A push to `main` deploys the live site.
- Every pull request gets a deploy preview, and other pushed branches get a branch deploy. Both send `X-Robots-Tag: noindex`, so search engines skip them.
- GitHub Actions runs `pnpm verify` on every pull request and on `main`.

The usual flow: work on a branch, open a pull request, check the deploy preview, then merge. To roll back, open the site's **Deploys** list in Netlify and publish an earlier deploy.

Security headers, including the Content Security Policy, live in `netlify.toml`. If you ever add a script, font, or image from another host, add that host to the policy there, or the browser will block it.

## Going live (one time setup)

These steps happen in your Netlify account and at your domain registrar, so only you can do them. Take them in order.

1. **Check the plan.** Read Netlify's terms of service and confirm the Free plan allows a commercial business site. If it does not, use Netlify Pro (or another static host) and update spec 0001.
2. **Create the site.** In Netlify, choose *Add new project*, then *Import an existing project*, connect GitHub, and pick this repository. Netlify reads the build command, publish folder, and Node version from `netlify.toml`; leave the form as it is. Set the production branch to `main`.
3. **Check a preview first.** Open a pull request from your launch branch and look over its deploy preview.
4. **Add the domain.** In the project's *Domain management*, add `abedautomation.com`. Netlify adds `www.abedautomation.com` too and redirects it to the bare domain, which matches the canonical address in `astro.config.mjs`.
5. **Point DNS at Netlify.** Pick one:
   - **Netlify DNS** (simplest): follow Netlify's prompt and change the nameservers at your registrar to the four Netlify shows you.
   - **Keep your registrar's DNS**: add an `A` record for `abedautomation.com` pointing to Netlify's load balancer, and a `CNAME` record for `www` pointing to your `*.netlify.app` address. Use the exact values Netlify shows in *Domain management*.

   DNS changes can take up to a day to spread.
6. **Wait for HTTPS.** Once DNS resolves, Netlify issues a free Let's Encrypt certificate on its own. *Domain management* shows it under *HTTPS*.
7. **Merge to `main`.** Merging the launch pull request deploys the live site.
8. **Run the launch checks** below.

## Launch checks

Run these on `https://abedautomation.com` after the first production deploy. The design checks come from the acceptance checklist in `docs/design/handoff.md` (section 11).

**Hosting**

- [ ] `https://abedautomation.com` loads with a valid certificate.
- [ ] `http://abedautomation.com` and `https://www.abedautomation.com` both redirect to `https://abedautomation.com`.
- [ ] A made up path such as `/nope` shows the 404 page with HTTP status 404.
- [ ] The response headers include `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`, and not `X-Robots-Tag`.
- [ ] The DevTools console shows no Content Security Policy errors, and the 3D scene and motion still run on desktop.

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
