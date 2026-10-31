# 0012. Daily live check for host injected scripts (after the Netlify badge)

**Date**: 2026-10-31
**Updated**: 2026-10-31, Netlify's badge switch needs a paid plan on this account, so the badge goes away by moving host ([spec 0013](../0013-cloudflare-pages-hosting-move/index.md)); the daily live check stays
**Status**: In Progress

## Summary

Netlify now adds a "Powered by Netlify" badge to Free plan sites. On this site our security policy stops it from drawing, but its empty frame still sits in the bottom right corner and swallows taps, even on the booking button. Netlify's switch to turn it off needs a paid plan, so the badge goes away when the site moves to Cloudflare Pages (spec 0013). A small daily job in GitHub Actions then compares the live page with a fresh build and fails, emailing you, if the host ever adds a script or frame we did not build.

## Requirements

**User stories**:
- As a visitor, I want every part of the page to respond to taps and clicks, with no host branding over it.
- As Abed, I want to hear within a day if the host starts adding code to my pages, without checking by hand.

**Acceptance criteria**:
- **AC-1**: Once abedautomation.com is served by Cloudflare Pages (spec 0013), the HTML served for `https://abedautomation.com/` and for a missing path contains no `/.netlify/scripts/` tag and no `<iframe>`. At 390px wide, the element at the bottom right corner of the viewport is page content, not a fixed overlay.
- **AC-2**: The production Content Security Policy on Cloudflare has no `'unsafe-inline'` in `script-src` (the Netlify stopgap in spec 0013 never carries over). On the live `/`, the DevTools console shows no Content Security Policy error.
- **AC-3**: After a visit to the live `/`, `localStorage` and `sessionStorage` hold no key for abedautomation.com (no `nl-hud:*` key), keeping spec 0010 AC-6 true.
- **AC-4**: `pnpm check:live` fetches the live `/` and the live missing path `/__live-check-404`, and compares each page's script and iframe fingerprints (defined in *Feature design*) with `dist/index.html` and `dist/404.html` from a `CF_PAGES=1 CF_PAGES_BRANCH=main` build. It exits 0 when they match. Otherwise it exits 1 and prints each live item the build lacks under `injected by host`, and each build item the live page lacks under `live differs from main`. It also exits 1 if `/` does not answer 200 or the missing path does not answer 404, if either live page contains the text `/cdn-cgi/` anywhere (host rewrites such as email obfuscation) while the build does not, or if either response carries a `Set-Cookie` header.
- **AC-5**: If a fetch fails (network error, timeout after 15 s, or a 5xx status), `pnpm check:live` waits 30 s and tries once more; a second failure exits 1 with `could not reach <url>`.
- **AC-6**: `.github/workflows/live-check.yml` runs once a day on a schedule and on demand (*Run workflow*), with `contents: read` permission only. It builds `main` with `CF_PAGES=1 CF_PAGES_BRANCH=main` and runs `pnpm check:live`; a failed run triggers GitHub's failure email. `pnpm verify` does not run the live check (it stays offline) and still exits clean.
- **AC-7**: The README says what the daily live check does and what to do when it fails.

## Decision

**Chosen option**: Option 1 as planned was the Netlify switch; that switch needs a paid plan here, so the fallback applied: the badge goes away with the move to Cloudflare Pages (spec 0013). This spec keeps the daily live check that compares the live HTML with a fresh production build.

One new script (`scripts/check-live.mjs`, run by `pnpm check:live`) and one new scheduled workflow guard against the next silent injection, on whichever host serves the domain.

**Implementation skills**: `netlify-config` (`netlify/context-and-tools`, `.claude/skills/netlify-config/`) · `best-practices` (`addyosmani/web-quality-skills`, `.claude/skills/best-practices/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**: none stored. The check builds two in memory lists per page and compares them.

**Fingerprint rules** (the same for the live page and the build):

| Tag | Fingerprint |
|---|---|
| `<script src="…">` | `script src=<src as written>` |
| `<script>` with inline content (any `type`, including `application/ld+json`) | `script inline <type or "classic"> sha256:<first 12 hex of the SHA-256 of the trimmed content>` |
| `<iframe …>` | `iframe src=<src, or "srcdoc" if it has srcdoc, or "none">` |

Lists are compared as multisets (a tag that appears twice must appear twice on both sides). Tags are found with a plain regular expression over the HTML (`<script\b[^>]*>([\s\S]*?)<\/script>` and `<iframe\b[^>]*>`), which is enough for Astro's static output; no HTML parser dependency.

**State transitions**: none.

**API surface** (no endpoints; the surfaces are a script, a workflow, and one host setting):

| Surface | Kind | Inputs | Output | Failure |
|---|---|---|---|---|
| `scripts/check-live.mjs` (`pnpm check:live`) | Node script, no dependencies | `dist/index.html`, `dist/404.html`, base URL | exit 0, or exit 1 with grouped differences | network: one retry, then `could not reach` (AC-5) |
| `.github/workflows/live-check.yml` | Scheduled GitHub Actions workflow | `schedule` (daily, `cron: '17 6 * * *'`, UTC, off the hour to dodge GitHub's busy top of hour) and `workflow_dispatch` | a passing or failing run; failure email | same setup steps as `ci.yml`; a build failure also fails the run |
| `README.md` | Docs | none | *Going live* step for the badge; a short note on the live check | none |
| `package.json` | Script entry | none | `"check:live": "node scripts/check-live.mjs"`, not added to `verify` | none |

**Value sourcing**:

| Action | Value produced / used | Source |
|---|---|---|
| Live check | base URL | `site` in `astro.config.mjs` (`https://abedautomation.com`), read by importing the config file's default export; overridable with the `LIVE_URL` environment variable for debugging |
| Live check | expected fingerprints for `/` | `dist/index.html` from `CF_PAGES=1 CF_PAGES_BRANCH=main pnpm build` of the checked out commit |
| Live check | expected fingerprints for the missing path | `dist/404.html` from the same build (Netlify serves it for unknown paths) |
| Live check | missing path | constant `/__live-check-404` in the script |
| Live check | expected statuses | 200 for `/`, 404 for the missing path |
| Live check | timeout and retry | constants in the script: 15 s per request, one retry after 30 s |
| Live check | fresh response | request header `Cache-Control: no-cache` and a cache busting query `?live-check=<run timestamp>` on `/` |
| Workflow | which commit is built | the default branch (`main`) checked out by the scheduled run |
| Workflow | who is told on failure | GitHub's built in email to the user who last changed the workflow's `cron` line (Abed) |

**Key invariants**:
- The CSP never gains `'unsafe-inline'` in `script-src` to make a host widget work.
- The site never hides or removes Netlify's elements with its own CSS or script; fixes happen at the host or by moving host.
- `pnpm verify` stays offline and deterministic; network checks live only in `check:live`.
- The live check never runs page JavaScript, so it never sends an Umami page view.

**Fallback trigger** (fired 2026-10-31): the switch needed a paid plan, so the move in spec 0013 replaces it. If the next host ever injects something, the check fails and the same rule applies: no workaround in the page, fix it at the host or move again.

**Security model**: public site, no secrets. The workflow uses the default `GITHUB_TOKEN` with `contents: read` only, makes plain GET requests to the public site, and installs only the locked dependencies (`pnpm install --frozen-lockfile`).

**Configuration required**: none. No secrets or new environment variables (`LIVE_URL` is an optional local override, never set in CI).

**Critical test scenarios**:
- Happy path: after the move to Cloudflare, run the workflow on demand → it passes; the live HTML has no `/.netlify/scripts/` tag and no iframe, verifies **AC-1**, **AC-4**, **AC-6**
- Detection: before the Netlify project is deleted, `LIVE_URL=https://stunning-malasada-b87ced.netlify.app pnpm check:live` → fails and lists `script src=/.netlify/scripts/hud?variant=public` under `injected by host`, verifies **AC-4**
- Drift: run `pnpm check:live` locally after changing a script on a branch (not deployed) → fails under `live differs from main`, verifies **AC-4**
- Network failure: `LIVE_URL=https://localhost:9 pnpm check:live` → one retry, then `could not reach`, exit 1, verifies **AC-5**
- No overlay: on the live site at 390px, scroll a booking button to the bottom right and tap its right half → Cal.com opens, verifies **AC-1**
- Policy and storage: live `/` console has no CSP error, Application panel shows no storage keys, verifies **AC-2**, **AC-3**

## Build plan

Skateboard: the script first (it checks the Cloudflare address before the switch), the daily job once the domain has moved, then the docs. Spec 0013 owns the move itself.

1. Write `scripts/check-live.mjs` and the `check:live` script entry, matching the existing `scripts/check-*.mjs` style; run it with `LIVE_URL` against the Cloudflare `*.pages.dev` address (pass) and the Netlify address (fail). Satisfies **AC-4**, **AC-5**
2. After spec 0013's switch: confirm live `/` and `/nope` have no `/.netlify/scripts/` tag, no iframe, no CSP console error, and no storage keys. Satisfies **AC-1**, **AC-2**, **AC-3**
3. Add `.github/workflows/live-check.yml` (setup steps copied from `ci.yml`, building with `CF_PAGES=1 CF_PAGES_BRANCH=main`), push, and run it on demand once (pass). Satisfies **AC-6**
4. README: add a short *Live check* note (what it compares, what a failure means, and that GitHub pauses scheduled workflows after 60 days without repo activity). Run `pnpm verify`. Satisfies **AC-6**, **AC-7**

## Consequences

**Positive**:
- Any future host injection (badge, snippet, proxy) is caught within a day, not by a visitor.
- The check also notices when the live site lags `main` (a failed or stuck deploy).

**Negative / tradeoffs**:
- GitHub pauses scheduled workflows in a public repo after 60 days with no commits; GitHub emails first, and the workflow must be re-enabled by hand.
- A run that lands while a deploy is still publishing can fail under `live differs from main`; rerun it. Each run costs a few free Actions minutes (a production build).
- The regex based tag scan only suits static HTML like Astro's output; a page that builds tags in unusual ways would need a real parser.

**Neutral**:
- The host move and its privacy notice change live in spec 0013; this spec is only the guard.

## Follow-up

- [ ] `/sync`: root `AGENTS.md` *Commands* could list `pnpm check:live` (network, not in `verify`).
