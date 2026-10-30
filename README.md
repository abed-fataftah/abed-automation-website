# Abed Automation website

The single page site for abedautomation.com. Built with Astro and Tailwind CSS, hosted on Netlify.

- Every line of copy and the booking URL live in `src/content/site.ts`.
- Architecture decisions: `docs/specs/0001-astro-static-site-netlify/`.
- Feature plan: `docs/scope/scope.md`.

## Commands

Use Node 24 (see `.nvmrc`) and pnpm 12 (pinned in `package.json`).

| Command | What it does |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the local dev server at `localhost:4321` |
| `pnpm check` | Type check the project |
| `pnpm build` | Build the static site into `dist/` |
| `pnpm preview` | Serve the built site locally |
