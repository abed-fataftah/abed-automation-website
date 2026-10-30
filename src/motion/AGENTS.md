# Motion

## Overview

All animation and 3D code for the site. The page must be complete and readable without anything here; this folder only adds GSAP motion (feature 13) and a Three.js scene (feature 14) on top, loaded late and only when the visitor's settings and connection allow it. The contract below comes from spec 0001.

## Key files

| File | Owns |
|---|---|
| `loader.ts` | The only motion code in the first page load. Waits for `load` plus idle time, checks reduced motion and connection speed, then dynamically imports `gsap.ts` and `scene.ts`. |
| `gsap.ts` | `init(root: HTMLElement): () => void`. The only file that imports `gsap`. |
| `scene.ts` | `init(container: HTMLElement): () => void`. The only file that imports `three`. |
| `graph.ts` | The hero graph, camera, and motion values (spec 0009). Imports nothing; `HeroScene.astro` draws the static SVG from it and `scene.ts` the live scene. |

## Conventions

- Import `gsap` only in `gsap.ts` and `three` only in `scene.ts`. Reach both modules only through `import()` in `loader.ts`, never a static import, so neither library lands in the entry chunk.
- Keep the `init` signatures above. Each returns a cleanup function; the loader collects them and calls them all when reduced motion turns on mid visit. Turning it off mid visit does not restart motion.
- No content starts hidden in CSS while waiting for JavaScript. Any "from" state is set by the motion script itself after it loads.
- GSAP loads only when `prefers-reduced-motion: reduce` does not match and the page has a `[data-reveal]`, `[data-line]`, or `[data-underline]` hook.
- The 3D scene loads only when the `[data-scene]` container comes within about 200px of the viewport, reduced motion is off, the viewport is at least `SCENE.minWidth` (1024px) wide at load, and `navigator.connection` does not report `saveData`, `2g`, or `slow-2g`.
- `HeroScene.astro` owns the `[data-scene]` container and its static `[data-scene-fallback]` SVG. `scene.ts` hides the fallback only after the first frame renders.
- Create the `WebGLRenderer` inside `try`/`catch` (no throwaway probe context). On failure, leave the fallback in place. The cleanup must dispose the renderer.
- Every dynamic import stays wrapped in `try`/`catch`; a failure logs once and leaves the static page untouched.

## Gotchas

- Done check after any change here: `pnpm check && pnpm build`, then confirm the entry JavaScript chunk in `dist/_astro/` contains no `gsap` or `three` code.
- `pnpm check:bundle` (part of `pnpm verify`) also fails when the Three.js scene's gzipped import closure goes over its budget.
- `gsap` 3.15.x and `three` 0.186.x (plus `@types/three`) are pinned with `~`; keep them on those minors unless a spec says otherwise.
- Keep 3D assets small: Netlify Free bills bandwidth from a 300 credit monthly budget.

## Agent skills

- [gsap-core](../../.claude/skills/gsap-core/): `greensock/gsap-skills`, core tweens, easing, `matchMedia` for reduced motion
- [gsap-timeline](../../.claude/skills/gsap-timeline/): `greensock/gsap-skills`, sequencing with timelines
- [gsap-scrolltrigger](../../.claude/skills/gsap-scrolltrigger/): `greensock/gsap-skills`, scroll linked animation
- [gsap-plugins](../../.claude/skills/gsap-plugins/): `greensock/gsap-skills`, plugin registration and use
- [gsap-performance](../../.claude/skills/gsap-performance/): `greensock/gsap-skills`, transforms, avoiding layout thrash
- [gsap-frameworks](../../.claude/skills/gsap-frameworks/): `greensock/gsap-skills`, setup and cleanup outside React
- [threejs-fundamentals](../../.claude/skills/threejs-fundamentals/): `cloudai-x/threejs-skills`, scene, camera, renderer, cleanup
- [threejs-performance](../../.claude/skills/threejs-performance/): `cloudai-x/threejs-skills`, draw calls, memory, frame cost
- [threejs-asset-pipeline](../../.claude/skills/threejs-asset-pipeline/): `cloudai-x/threejs-skills`, shrinking glTF and textures
- The other `threejs-*` skills (`animation`, `geometry`, `interaction`, `lighting`, `loaders`, `materials`, `postprocessing`, `shaders`, `textures`) live in [.claude/skills/](../../.claude/skills/), `cloudai-x/threejs-skills`; load the one that matches the task.

## Related specs

- [0001 Astro static site on Netlify](../../docs/specs/0001-astro-static-site-netlify/index.md) (lazy loading contract)
- [0008 GSAP motion](../../docs/specs/0008-gsap-motion/index.md)
- [0009 Three.js hero scene](../../docs/specs/0009-threejs-hero-scene/index.md)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
