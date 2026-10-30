# Abed Automation website

## Stack

- **Language / Runtime**: TypeScript, strict (`astro/tsconfigs/strict`); Node 24, pinned in `.nvmrc` and `netlify.toml` only
- **Framework**: Astro 7.4, static output, no UI framework (Astro components plus `<script>` modules)
- **Key dependencies**: Tailwind CSS 4.3 via `@tailwindcss/vite` (tokens in the `@theme` block of `src/styles/global.css`); GSAP and Three.js later, lazy loaded (see `src/motion/AGENTS.md`)
- **Package manager**: pnpm 12, pinned by `packageManager` in `package.json`
- **Hosting**: Netlify Free from GitHub; `main` deploys production, other branches and PRs get previews. No server, database, forms, or functions.

## Build approach

**Skateboard**: ship the smallest usable whole first, then grow it (a plain readable page with working booking, then motion, then launch).

## Commands

```bash
pnpm install   # install
pnpm dev       # dev server at localhost:4321
pnpm check     # type check (astro check)
pnpm build     # static build into dist/
pnpm preview   # serve the build
pnpm lint      # ESLint, warnings fail (lint:fix to auto fix)
pnpm format    # Prettier write (format:check to check only)
pnpm verify    # the full gate CI runs: check, lint, format:check, check:design, check:copy, build, check:bundle
```

No tests yet. CI (`.github/workflows/ci.yml`) runs `pnpm verify` on pull requests and pushes to `main`; a pre commit hook runs ESLint and Prettier on staged files.

## Specs

Stored in `docs/specs/` as folders: `docs/specs/NNNN-title/` with `index.md`, `rationale.md`, `verify.md`. Feature plan: `docs/scope/scope.md`.

## Rules

- Every line of copy and the booking URL live in `src/content/site.ts` (`site` object, `satisfies SiteContent`). Components read from `site` and never hard code text.
- `src/components/BookCta.astro` is the only component that renders a booking link. The booking URL appears nowhere else.
- The page must be complete and readable with JavaScript off. Never hide content in CSS while waiting for a script.
- Import from `src` with the `@/` alias. A change is done when `pnpm verify` exits clean (the same gate CI runs).
- Design system: build all UI to `design.md` (art direction and component rules); token values live in `src/styles/global.css`.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`), with an optional scope such as `feat(hero):`. Not enforced by a tool.
- No third party requests on first load (self host fonts and images) and no cookies.
- Brief ground rules: English only; Abed is one person, never a team; no invented testimonials, logos, figures, or results; no pricing; no contact forms or accounts.
- The repo is public: never commit secrets; keep unapproved copy on branches.
- `site.ts` checks `bookingUrl` at build time: anything other than an https `cal.com` link fails the build.
- Astro 7 is recent and most examples online are older; trust the `astro` skill and the Astro docs over blog posts.

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

## Agent skills

- [astro](.claude/skills/astro/): `astrolicious/agent-skills`, Astro components, routing, config, CLI
- [tailwind-4-docs](.claude/skills/tailwind-4-docs/): `lombiq/tailwind-agent-skills`, Tailwind v4 utilities and config
- [pnpm](.claude/skills/pnpm/): `antfu/skills`, pnpm commands, settings, approved builds
- [netlify-config](.claude/skills/netlify-config/), [netlify-deploy](.claude/skills/netlify-deploy/), [netlify-caching](.claude/skills/netlify-caching/), [netlify-frameworks](.claude/skills/netlify-frameworks/): `netlify/context-and-tools`, `netlify.toml`, headers, deploys, caching
- [performance](.claude/skills/performance/), [core-web-vitals](.claude/skills/core-web-vitals/), [accessibility](.claude/skills/accessibility/), [seo](.claude/skills/seo/), [best-practices](.claude/skills/best-practices/), [web-quality-audit](.claude/skills/web-quality-audit/): `addyosmani/web-quality-skills`, web quality checks
- [web-design-guidelines](.claude/skills/web-design-guidelines/): `vercel-labs/agent-skills`, UI review against interface guidelines
- [conventional-commit](.claude/skills/conventional-commit/): `github/awesome-copilot`, Conventional Commits messages
- [og-images](.claude/skills/og-images/): `richtabor/agent-skills`, social card layout, fonts, and Satori rules
- [satori](.claude/skills/satori/): `usenotra/skills`, Satori markup, supported CSS, fonts, and errors
- [seo-sitemap](.claude/skills/seo-sitemap/): `agricidaniel/claude-seo`, XML sitemap generation and validation

Declined: `setup-pre-commit` (`mattpocock/skills`, assumes Husky and conflicting Prettier defaults) · `github-actions` (`callstackincubator/agent-skills`, React Native builds only)

MCP servers: astro-docs (recommended), netlify (recommended), lighthouse (recommended), github (recommended)

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Context files

- [src/motion/AGENTS.md](src/motion/AGENTS.md) (GSAP and Three.js lazy loading contract and motion skills)
