# 0002. Coding standards and lint, format, and CI tooling

**Date**: 2026-10-28
**Status**: In Progress

## Summary

This spec sets how code in this repo is written and checked. ESLint catches bugs and accessibility mistakes, Prettier keeps the formatting the same everywhere, a git hook checks the files you commit, and a GitHub Actions workflow runs every check on each pull request. It also adds a small script that fails the build check if GSAP or Three.js ever sneak into the first JavaScript file the page loads. Once built, an agent or a person can't merge code that breaks the style, the types, or the performance rule from spec 0001 without seeing a red check.

## Context

The scaffold from spec 0001 runs, but nothing checks how code is written beyond strict TypeScript (`pnpm check`). Most code here will be written by AI agents across many sessions. Without a shared, automatic standard, each session drifts a little: quote style, class order, import paths, how promises are handled. Nobody notices until the diffs get noisy and reviews get slow.

The site has specific rules that are easy to break silently. Spec 0001 requires that `gsap` and `three` never reach the first JavaScript chunk, that the page works with JavaScript off, and that every image and link is accessible. Today only a human reading the build output would catch a violation. The repo is also public, so the history and code quality are visible to potential clients.

There are practical constraints. You develop on Windows with `core.autocrlf=true` and no `.gitattributes`, so files check out with CRLF line endings while the tools expect LF. Netlify Free bills every build against a 300 credit monthly budget, so failing builds on Netlify is a costly place to find a lint error. pnpm 12 holds back very new package versions (`minimumReleaseAge`), and the motion modules (`src/motion/gsap.ts`, `scene.ts`) are deliberate stubs with unused parameters until features 13 and 14.

Without a decision, feature 3 onward gets built with no standard, and adding one later means one large reformatting change on top of real work.

## Options considered

### Option 1: Document the standard and enforce it automatically from now on

Write the standard here, add ESLint, Prettier, a pre commit hook, and a CI workflow, then apply the formatter to the existing files once in a single style commit. All new code must pass.

**Pros**:
- Violations are caught at commit time and again on every PR, with no human effort.
- The existing code is tiny (about 10 files), so the one time cleanup is a single small commit.
- Agents get the same immediate feedback a person would.

**Cons**:
- About ten new dev dependencies to keep updated.
- Strict type aware lint rules occasionally flag code that is fine and need a deliberate, commented disable.

### Option 2: Document the standard, enforce it in CI only

Same tools and rules, but no git hook; problems surface only when the PR's CI run finishes.

**Pros**:
- One less moving part locally; commits are never blocked.

**Cons**:
- Feedback comes minutes later, after the push, so fix up commits pile up on branches.
- Agents that commit per milestone would routinely push failing milestones.

### Option 3: Document only

Write the conventions into `AGENTS.md` and rely on review.

**Pros**:
- No tooling to install or maintain.

**Cons**:
- Nothing checks the agents; drift is guaranteed across sessions.
- The spec 0001 bundle rule and accessibility rules stay checked only by eye.

## Decision

**Chosen option**: Option 1: Document the standard and enforce it automatically from now on.

Adopt ESLint (strict everywhere, type aware for `.ts` files, with Astro and strict accessibility rules) and Prettier (with the Astro and Tailwind plugins), enforce them through a `simple-git-hooks` plus `lint-staged` pre commit hook and a GitHub Actions workflow on every PR and push to `main`, guard the spec 0001 bundle rule with a script, and pin LF line endings.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.claude/skills/tailwind-4-docs/`) · `pnpm` (`antfu/skills`, `.claude/skills/pnpm/`) · `accessibility` (`addyosmani/web-quality-skills`, `.claude/skills/accessibility/`) · `conventional-commit` (`github/awesome-copilot`, `.claude/skills/conventional-commit/`, message format only; this spec and `AGENTS.md` decide when to commit, so ignore its "commit with no confirmation" step)

## Rationale

The deciding force is that agents write most of the code. A standard that only lives in prose is applied unevenly by agents and forgotten across sessions; a standard that fails a command is applied every time. That rules out Option 3. Between Options 1 and 2, the agent workflow (one commit per milestone on a feature branch) makes local feedback matter: a hook that fixes formatting and blocks lint errors on staged files keeps every milestone commit clean, and CI then confirms the whole repo. The hook only touches staged files, so it stays fast.

ESLint with `eslint-plugin-astro` is the only linter that understands both the frontmatter and the template markup of `.astro` files, which is where the accessibility mistakes (missing alt text, unlabeled links) would live. Biome and Oxlint are faster but read only the script part of `.astro` files today. The runner up was Biome for a single fast tool, worth revisiting if its Astro template support matures. Prettier with `prettier-plugin-astro` is the standard Astro formatter for the same reason, and `prettier-plugin-tailwindcss` keeps the long Tailwind class lists (an accepted cost in spec 0001) in one predictable order, which keeps diffs small.

CI runs in GitHub Actions rather than inside the Netlify build because Netlify Free charges credits for every build, failed or not, and its logs are a poor place to read lint output. The bundle check is a small Node script rather than a bundle analysis tool because the rule is narrow (two libraries must not appear in the entry chunk) and needs no dependency. Tests are deferred: the project runs at the Alpha tier (verify on the real page), and the only logic today is the booking URL guard.

## Standard definition

**Canonical pattern** (what clean code looks like here):

```astro
---
// Copy comes from site.ts, imports use the @/ alias, single quotes, semicolons.
import BookCta from '@/components/BookCta.astro';
import { site } from '@/content/site';
---

<section id="services" class="mx-auto max-w-2xl px-4 py-16">
  <h2 class="text-3xl font-bold">{site.services.heading}</h2>
  <img src={photo.src} alt={site.about.photoAlt} width={640} height={480} />
  <BookCta class="mt-8 inline-block rounded bg-black px-5 py-3 text-white" />
</section>
```

Formatting (Prettier, `.prettierrc.json`):

| Setting | Value |
|---|---|
| `printWidth` | `100` |
| `tabWidth` / `useTabs` | `2` / `false` |
| `singleQuote` | `true` |
| `semi` | `true` |
| `trailingComma` | `all` |
| `endOfLine` | `lf` |
| `plugins` | `prettier-plugin-astro`, then `prettier-plugin-tailwindcss` (must be last) |
| `tailwindStylesheet` | `./src/styles/global.css` (Tailwind v4 has no JS config file, so the plugin reads the theme from here) |
| Override for `*.astro` | `parser: astro` |

Linting (ESLint flat config, `eslint.config.js`, in this order):

1. `@eslint/js` recommended.
2. `typescript-eslint` `strictTypeChecked` plus `stylisticTypeChecked`, with `parserOptions.projectService: true`, for `**/*.ts` files. This is where the real logic lives (`site.ts`, `src/motion/`).
3. `.astro` files (`files: ['**/*.astro']`): `typescript-eslint` `strict` plus `stylistic` (the versions without type information), with `parserOptions.parser: tseslint.parser` and `extraFileExtensions: ['.astro']`. Frontmatter here is thin, and type aware rules on `.astro` are the least mature part of this stack, so they stay off.
4. `eslint-plugin-astro` `flat/recommended` plus `flat/jsx-a11y-strict` (needs `eslint-plugin-jsx-a11y` as a direct dev dependency, since pnpm does not hoist peers). If the installed `eslint-plugin-astro` has no `flat/jsx-a11y-strict`, use `flat/jsx-a11y-recommended` and note the swap in this spec.
5. No type information for `**/*.{js,mjs,cjs}` (`eslint.config.js`, `astro.config.mjs`, `scripts/check-bundle.mjs`) and `**/*.astro/*.ts` (the virtual files ESLint makes for `<script>` blocks inside `.astro`): apply `tseslint.configs.disableTypeChecked` to those globs only, never globally. These files are outside the TypeScript project, so type aware rules would crash on them.
6. Project rules:
   - `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: '^_'` and `varsIgnorePattern: '^_'` (the motion stubs use `_root` and `_container`).
   - `no-restricted-imports` with pattern `../*` in `src/**`, message "Use the @/ alias", so parent relative imports fail and the `@/` alias is enforced. Same folder `./` imports stay allowed.
   - `src/motion/gsap.ts` and `src/motion/scene.ts` only: `@typescript-eslint/no-empty-function` off, with a comment saying the stubs return empty cleanups until features 13 and 14, which remove the override.
7. `eslint-config-prettier` last, so no lint rule fights the formatter.
8. Ignores: `dist/`, `.astro/`, `node_modules/`, `.claude/`, `docs/.agent-cache/`, `public/`, `config/`.

Prettier ignore (`.prettierignore`): `dist/`, `.astro/`, `pnpm-lock.yaml`, `skills-lock.json`, `.claude/`, `public/`, `config/`, and all Markdown (`**/*.md`). Markdown is excluded because the workflow skills edit `AGENTS.md`, `docs/scope/`, and `docs/specs/` by matching exact lines, and Prettier's table padding and emphasis rewriting would break those matches.

Line endings: a `.gitattributes` with `* text=auto eol=lf` plus `*.{ico,png,jpg,jpeg,webp,avif,gif,woff,woff2} binary` (one line per extension, since `.gitattributes` has no brace expansion), and `.editorconfig` with `end_of_line = lf`. Renormalize (`git add --renormalize .`) inside the one style commit (see Rollout), not before it.

`package.json` scripts (names other tools and agents call):

| Script | Command | Purpose |
|---|---|---|
| `lint` | `astro sync && eslint . --max-warnings 0` | Generate Astro's types (a fresh clone has none), then lint everything; any warning fails |
| `lint:fix` | `eslint . --fix` | Auto fix what can be fixed |
| `format` | `prettier --write .` | Format everything |
| `format:check` | `prettier --check .` | Fail on unformatted files |
| `check:bundle` | `node scripts/check-bundle.mjs` | Spec 0001 entry chunk rule (below) |
| `verify` | `pnpm check && pnpm lint && pnpm format:check && pnpm check:design && pnpm check:copy && pnpm build && pnpm check:bundle` | The full local gate, same as CI (`check:design` and `check:copy` were added by later specs) |
| `prepare` | `simple-git-hooks` | Installs the git hook on `pnpm install` |

`prepare` is a root script, so pnpm 12 runs it even though it blocks dependency install scripts; `simple-git-hooks` has no install script of its own, so no `pnpm approve-builds` entry is needed. CI and Netlify set `SKIP_INSTALL_SIMPLE_GIT_HOOKS=1` so the install never tries to write git hooks there.

Existing `dev`, `build`, `preview`, `check`, `astro` scripts stay as they are.

Pre commit hook (`simple-git-hooks` + `lint-staged`, both configured in `package.json`):

- `pre-commit`: `pnpm exec lint-staged`.
- `*.{ts,js,mjs,astro}` → `eslint --fix --max-warnings 0`, then `prettier --write`.
- `*.{css,json,yml,yaml}` → `prettier --write`.
- The hook does not run `astro check` or the build; those are too slow for every commit and CI runs them.

Bundle check (`scripts/check-bundle.mjs`, plain Node, no dependencies):

- Reads every `.html` file in `dist/` and collects the entry points: each `<script>` with `type="module"` and a `src` (attributes in any order, quoted with `"` or `'`), plus each `<link rel="modulepreload" href>`. Paths resolve against `dist/`.
- Follows the static imports inside those files to build the set of chunks the page loads up front. It must match minified forms: `import"./a.js"`, `import{x}from"./a.js"`, `import x from"./a.js"`, and `export{x}from"./a.js"`, with or without spaces. It never follows `import(` calls, which are the lazy loads spec 0001 allows.
- Fails with a clear message naming the chunk if any of those files contains a GSAP marker (`GSAP target`) or a Three.js marker (`__THREE__`).
- Fails if it found zero entry points (a check that scanned nothing must not pass).
- Exits 0 otherwise, with a one line summary of how many pages and chunks it scanned.
- The markers must be proven when `gsap` and `three` are first installed (features 13 and 14): temporarily add a static import, confirm the check fails, then remove it. If a marker does not appear in the minified library, replace it with one that does and update this spec.

CI (`.github/workflows/ci.yml`):

| Setting | Value |
|---|---|
| Triggers | `pull_request` (any branch), `push` to `main` |
| Permissions | `contents: read` |
| Concurrency | one run per ref, cancel in progress |
| Runner | `ubuntu-latest` |
| Steps | checkout → `pnpm/action-setup` (reads `packageManager`) → `actions/setup-node` with `node-version-file: .nvmrc` and pnpm cache → `pnpm install --frozen-lockfile` → `pnpm verify` (one step, so CI and the local gate can never drift apart) |
| Environment | `SKIP_INSTALL_SIMPLE_GIT_HOOKS=1`; no secrets; `CONTEXT` is unset, so the booking placeholder guard in `site.ts` allows the build |

Netlify: add `SKIP_INSTALL_SIMPLE_GIT_HOOKS = "1"` to `[build.environment]` in `netlify.toml`. The Netlify build command stays `pnpm build`; GitHub Actions is the check, and Netlify is the deploy.

Dependabot: add a second `package-ecosystem: github-actions` entry to `.github/dependabot.yml`, monthly, all updates grouped, matching the npm entry.

Editor:

- `.vscode/extensions.json` recommends `astro-build.astro-vscode`, `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `bradlc.vscode-tailwindcss`.
- `.vscode/settings.json`: Prettier as default formatter, format on save, ESLint validates `astro`, `typescript`, `javascript`.
- `.editorconfig`: `root = true`, UTF-8, LF, 2 space indent, final newline, trim trailing whitespace (except `*.md`).

Commits and branches:

- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`), with an optional scope such as `feat(hero):`. Not enforced by a tool.
- Agents building a feature work on a `feat/<feature-slug>` branch, commit once per build milestone, and open a PR to `main`. `main` stays deployable.

**Replaces**:
- Formatting by hand or by whatever an editor defaults to.
- Checking the spec 0001 bundle rule by reading `dist/` by eye.
- CRLF line endings in the working tree on Windows.

**Enforcement**:
ESLint (`eslint.config.js`) and Prettier (`.prettierrc.json`) run on staged files in the pre commit hook and on the whole repo in `.github/workflows/ci.yml`, together with `astro check`, the build, and `scripts/check-bundle.mjs`. Warnings fail (`--max-warnings 0`). Conventional Commits and the branch flow are conventions recorded in `AGENTS.md`, not enforced by a tool.

**Rollout**:
Single migration commit for the existing code, then enforced for all new code. In the tooling feature, after the configs and `.gitattributes` land: run `git add --renormalize .`, `pnpm format`, and `pnpm lint:fix`, fix what remains by hand, and commit it alone as `style: apply prettier and eslint` so real changes stay readable in history.

**Exceptions**:
- A lint rule may be disabled for one line or one file with an `eslint-disable` comment that states the reason. Never disable a rule repo wide to make a single case pass.
- Markdown files are not formatted by Prettier (see above).
- `.claude/` (installed agent skills) is never linted or formatted; it belongs to its upstream repos.
- Tailwind class sorting does not run in `.astro` files (found by `/check verify`, 2026-10-30). `prettier-plugin-astro` 1.x parses templates into a new JSX style tree, and `prettier-plugin-tailwindcss` 0.8.1 (its newest release) still walks the old tree, so it skips every class attribute without an error. Sorting still works in other file types. Accepted rather than pinning `prettier-plugin-astro` to 0.14.1, which would put formatting on the old `@astrojs/compiler` parser that Astro 7 no longer uses. Existing class lists were already in sorted order when this was found; until it is fixed, write new class lists in Tailwind's order by hand.

## Consequences

**Positive**:
- Every commit is formatted and lint clean, so diffs show only real changes.
- Missing alt text, invalid ARIA, floating promises, and unsafe `any` are caught as the code is written.
- The spec 0001 performance rule (no GSAP or Three.js in the entry chunk) is checked on every PR instead of by eye.
- `pnpm verify` gives agents and you one command that matches CI exactly.

**Negative / tradeoffs**:
- About ten new dev dependencies (`eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`, `eslint-plugin-jsx-a11y`, `eslint-config-prettier`, `prettier`, `prettier-plugin-astro`, `prettier-plugin-tailwindcss`, `simple-git-hooks`, `lint-staged`) and the Dependabot PRs that come with them.
- `.astro` frontmatter gets strict rules without type information, so a floating promise or unsafe `any` written there is not caught. Keep real logic in `.ts` files, where the full type aware rules run.
- pnpm 12's `minimumReleaseAge` may refuse a version published in the last day; pick the previous release rather than adding exclusions casually.
- The commit hook adds a second or two to each commit. It can be skipped with `--no-verify`, but CI still catches anything skipped.
- No automated tests yet. The booking URL guard and the no JavaScript behaviour are checked only by the build and by `/check verify`.
- GitHub Actions minutes are free for public repos, but a workflow that fails on `main` does not stop Netlify from deploying; branch protection (below) is what makes CI a real gate.

**Neutral**:
- Markdown is left to the workflow skills and humans; Prettier never touches it.
- Prettier's `printWidth: 100` and the class sorter will rewrap and reorder a few lines in the existing files during the one time migration.

## Follow-up

- [ ] Your local branch is `master` and no GitHub remote exists yet. Spec 0001 and this CI workflow assume `main`. Rename it (`git branch -m master main`) before the first push.
- [ ] After the repo is on GitHub, turn on branch protection for `main` requiring the CI check to pass. Until you do, CI only advises: a red PR can still merge, and Netlify will deploy it. This is the step that makes the standard binding (a GitHub settings step only you can do).
- [ ] Record in root `AGENTS.md` (owned by `/sync`): the new scripts in `## Commands` (`pnpm lint`, `pnpm format`, `pnpm verify`), a `## Git` block (`- integration: on` / `- branch prefix: feat/` / `- commit: per-milestone`), Conventional Commits under `## Rules`, and replace "No test, lint, or format tooling yet" with "No tests yet".
- [ ] Record in root `AGENTS.md` `## Agent skills` (owned by `/sync`): a bullet for `conventional-commit` (`github/awesome-copilot`), and a `Declined:` line for `setup-pre-commit` (`mattpocock/skills`, assumes Husky and conflicting Prettier defaults) and `github-actions` (`callstackincubator/agent-skills`, React Native builds only), so they are not offered again.
- [ ] When features 13 and 14 install `gsap` and `three`, prove the bundle check markers with a deliberate static import (see Standard definition).
- [ ] Revisit tests (Vitest for `site.ts` logic, a Playwright smoke test with JavaScript off) when the tier moves past Alpha or real logic appears.
- [ ] Revisit a dead code check (Knip) at launch (feature 16), once the motion stubs are filled in.
- [ ] When Dependabot bumps `prettier-plugin-tailwindcss` or `prettier-plugin-astro`, check that `.astro` class sorting works again: format a scratch `.astro` file containing `class="p-4 flex"` and expect `class="flex p-4"`. Once it does, run `pnpm format` and drop the matching entry under Exceptions.
