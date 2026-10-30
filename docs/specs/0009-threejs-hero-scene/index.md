# 0009. Three.js hero scene: a swaying workflow graph with travelling pulses

**Date**: 2026-10-30 (updated 2026-10-30: cross check fixes; SVG only below 1024px; line and dot sizing and the dynamic import regex corrected to match Three.js 0.186 and the minified output)
**Status**: In Progress

## Summary

On screens 1024px and wider, the hero gets a decorative 3D picture on its right side: a small left to right workflow graph (dots joined by 1px lines) that sways gently back and forth while small off white pulses travel along its lines, like work moving through an automation. It uses only the existing `fg` and `muted` colors, ignores the pointer and scroll, and renders at 30 frames per second, pausing whenever it is out of view.

Everyone first sees a static SVG drawing of the same graph, built into the HTML from the same data file. Phones and tablets (below 1024px), and visitors with JavaScript off, reduced motion on, a slow connection, or no WebGL (the browser's 3D drawing API), only ever get that drawing and never download Three.js. On desktop, when Three.js has drawn its first frame, the live canvas fades in over the drawing in 300ms from the identical pose, so nothing jumps.

## Requirements

**User stories**:
- As a small business owner landing on the page, I want a calm visual that hints at automation beside the headline, so that the page feels crafted without distracting me from reading.
- As a visitor on a phone, I want the same picture without a large download, so that the page stays fast and light on my data.
- As a visitor with reduced motion set, JavaScript off, or an old device, I want a still picture in the same place, so that the page looks complete and never broken.
- As a visitor reading the hero while the scene loads, I want the text to stay exactly where it is, so that I never lose my place.
- As Abed after launch, I want the graph shape and the motion values in one data file, so that I can tune them without touching rendering code.

**Acceptance criteria**:
- **AC-1**: With JavaScript off, and separately with `prefers-reduced-motion: reduce`, `/` shows the static SVG graph in the hero at every width: right column from 1024px, under the hero button below 1024px. With reduced motion on, the network panel shows no request for the scene or Three.js chunks (the spec 0001 loader gate is unchanged).
- **AC-2**: The SVG fallback is rendered at build time by `HeroScene.astro` from `src/motion/graph.ts`, inline in the HTML (no extra request). Its nodes, edges, and colors match the live scene's first frame: at 1280 wide, with the loop held at frame 0 (the `?scene-still` debug switch in the API table), every node centre in the SVG is within 2 CSS px of the same node in the canvas.
- **AC-3**: The scene box has a fixed 16:10 aspect ratio set in CSS, so neither the SVG, the canvas, nor the crossfade changes layout. The SVG is `display: block` at the box's full width and height, with the default `preserveAspectRatio` (`xMidYMid meet`), so no inline gap adds height. Lighthouse reports a Cumulative Layout Shift of 0 from the scene, the hero text never overlaps the box, and there is no sideways scroll at 320px.
- **AC-4**: From 1024px the hero is a two column grid inside the 1120px container: the existing hero text (eyebrow, h1, intro, button) in the left column, the scene box filling the right column, vertically centred. Below 1024px the box sits under the hero button, 32px below it, full width up to 640px, showing the SVG only.
- **AC-5**: The graph is a left to right flow: 15 to 25 nodes, exactly one start node (smallest `x`) and one end node (largest `x`), every edge goes from a lower `x` to a higher `x`, every node is reachable from the start and reaches the end, node `z` stays within ±1.5 units, the node centroid sits within 0.05 units of the origin (the point the graph sways around), and at every combination of ±`swayDeg` and ±`tiltDeg` every projected node stays at least 8% of the box width and height inside the box edges. `pnpm build` fails with a clear message if `graph.ts` breaks any of these rules.
- **AC-6**: Colors come only from tokens, read at runtime from CSS custom properties (`--color-fg`, `--color-muted`): nodes and pulses in `fg`, edges in `muted` at `SCENE.edgeOpacity`. Edges are 1 CSS px wide in both the SVG and the canvas. No coral, no new token, no glow, no gradient, no shadow, no bloom, no tone mapping. `pnpm check:design` passes (no raw color values outside `global.css`).
- **AC-7**: Motion: the graph group's `rotation.y` is `swayDeg × sin(2πt / swayPeriod)` and its `rotation.x` is `tiltDeg × sin(2πt / tiltPeriod)` (degrees converted to radians), where `t` is the animation clock in seconds, 0 at the first render. Pulses (small `fg` dots) start at the start node, cross each edge in `pulseSpeed` seconds whatever its length, pick a random outgoing edge at each node, and disappear at the end node. At most `maxPulses` (2) are alive; the first starts at `t = firstPulseDelay`, and each next one starts when at least `pulseGap` seconds have passed since the last start and fewer than `maxPulses` are alive. The scene never reacts to the pointer or scroll.
- **AC-8**: Handover: the canvas starts at opacity 0 (set by `scene.ts`, never in CSS). After frame 0 renders, `scene.ts` forces a style flush, then sets opacity 1, which fades over 300ms while the SVG stays fully visible underneath. The SVG gets the `hidden` attribute on the canvas `transitionend`, or after `fadeMs + 50` ms if that event never fires, whichever comes first. Nothing in the hero visibly jumps or blinks during the handover.
- **AC-9**: Rendering is capped at 30 frames per second. The loop stops while the scene box is fully out of the viewport or the tab is hidden, and resumes from the same pose (each frame advances `t` by at most 0.1s, so a pause never makes it jump). A resize while paused renders one frame on resume. With the hero scrolled away, the Performance panel shows no scene frames.
- **AC-10**: The scene loads only when `matchMedia('(min-width: 1024px)')` matches at the moment the loader checks (in addition to the spec 0001 gates). Below 1024px the network panel shows no scene or Three.js chunk. A visitor who widens a narrow window later keeps the SVG; a scene already running keeps running if the window narrows. The canvas follows the box size (`ResizeObserver`), keeping lines at 1 CSS px and node dots at `SCENE.nodeSize` of the box width, with the pixel ratio capped at 2.
- **AC-11**: Failure paths always end at the static SVG: if `WebGLRenderer` creation throws, the SVG stays and the console shows one warning; if the WebGL context is lost mid visit, the loop stops, the canvas is removed, and the SVG is shown again for the rest of the visit; if the scene module fails to load, the loader logs once and the SVG stays.
- **AC-12**: The cleanup returned by `init` (called by the loader when reduced motion turns on mid visit) cancels the loop, the pending handover timer and `transitionend` listener, disconnects every observer and listener, disposes every geometry, material, texture, and the renderer, removes the canvas, and removes `hidden` from the SVG. It is safe to call more than once (for example after a context loss teardown already ran). After it runs, the hero looks exactly like the reduced motion page.
- **AC-13**: The scene box is decorative: the box has `aria-hidden="true"`, the SVG has `focusable="false"`, the canvas is never focusable, and the Tab order and accessibility tree are identical with and without the scene. Print preview always shows the SVG, never the canvas.
- **AC-14**: `three` (`0.186.x`) is imported only in `src/motion/scene.ts` (and its `three/addons` imports), and `graph.ts` imports nothing. `pnpm check:bundle` passes, fails when a static `import 'three'` is temporarily added to `loader.ts` (the spec 0002 `__THREE__` marker proof), and fails when the scene's dynamic import closure is larger than `SCENE_BUDGET_KB` gzipped, printing that size on every run. `SCENE_BUDGET_KB` is the size measured on the first build plus about 10%, rounded up to the next 5 KB, and never above 180.
- **AC-15**: `design.md` documents the hero scene (placement, desktop only live scene, colors, the 30 fps cap, sway and pulse values from `SCENE`, the SVG fallback, and that the scene is the hero's only motion besides the underline). `docs/design/pages/home.md` describes the two column hero. `pnpm verify` exits 0.

## Decision

**Chosen option**: Option 1: a procedural Three.js graph driven by one shared data file, with a build time SVG fallback projected from the same data and camera, live on desktop only.

`src/motion/graph.ts` holds the nodes, edges, camera, and every motion value, imports nothing, and exports a pure `project()` function that copies the Three.js perspective and rotation math. `HeroScene.astro` uses it at build time to draw the inline SVG; `scene.ts` uses it at runtime to build the 3D scene. Edges are drawn with `LineSegments2` and `LineMaterial` from `three/addons` so they are exactly 1 CSS px, node dots and pulses are `Points` with round dots, and a 30 fps `requestAnimationFrame` loop sways the group and moves the pulses. Below 1024px the loader never imports the scene, so phones and tablets get the SVG only.

**Implementation skills**: `threejs-fundamentals` (`cloudai-x/threejs-skills`, `.claude/skills/threejs-fundamentals/`) · `threejs-geometry` (`cloudai-x/threejs-skills`, `.claude/skills/threejs-geometry/`) · `threejs-materials` (`cloudai-x/threejs-skills`, `.claude/skills/threejs-materials/`) · `threejs-performance` (`cloudai-x/threejs-skills`, `.claude/skills/threejs-performance/`) · `threejs-animation` (`cloudai-x/threejs-skills`, `.claude/skills/threejs-animation/`) · `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.claude/skills/tailwind-4-docs/`) · `accessibility` (`addyosmani/web-quality-skills`, `.claude/skills/accessibility/`) · `core-web-vitals` (`addyosmani/web-quality-skills`, `.claude/skills/core-web-vitals/`) · `performance` (`addyosmani/web-quality-skills`, `.claude/skills/performance/`)

**Boundaries** (what this feature does not do):
- No live scene below 1024px. No pointer, scroll, or touch reaction. No camera controls, no raycasting.
- No model files, textures loaded over the network, HDR environments, lights, shadows, or post processing. Everything is procedural and unlit.
- No copy: nothing is added to `site.ts`, because the scene is decorative and carries no words.
- The spec 0001 loader gates (reduced motion, `saveData`, `2g`, the 200px `IntersectionObserver`) stay; this spec adds one more gate (1024px) and changes the contract wording from a fallback `<img>` to a fallback `<svg>`.
- No scene on the 404 page or anywhere but the hero.
- No change to GSAP motion (spec 0008); the hero underline keeps working as it does.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**: no stored data. The only model is the static graph in `src/motion/graph.ts`, which ships in source:

| Export | Shape | Notes |
|---|---|---|
| `GraphNode` | `{ id: string; x: number; y: number; z: number }` | world units; `id` unique; `x` sets the flow order |
| `GraphEdge` | `{ from: string; to: string }` | both ids must exist; `from.x < to.x` |
| `GRAPH` | `{ nodes: GraphNode[]; edges: GraphEdge[] }` | starting layout below |
| `CAMERA` | `{ fov: 35; z: 14 }` | `PerspectiveCamera` with a **vertical** field of view in degrees, at `(0, 0, z)`, looking at the origin; aspect is always 16 / 10 (the box's CSS ratio), near 0.1, far 100 |
| `SCENE` | motion and look constants, see below | the single source; `design.md` mirrors it |
| `project(node, rotY = 0, rotX = 0)` | `(GraphNode, number, number) => { x: number; y: number }` in a 0..1 box | pure copy of the Three.js math, see the API table |
| `assertGraph(graph)` | `(typeof GRAPH) => void`, throws with a message | enforces every rule in AC-5; called in `HeroScene.astro` frontmatter so the build fails |

Starting layout for `GRAPH` (6 stages, 16 nodes, 24 edges; centred on the origin by symmetry; tune freely as long as AC-5 holds):

| Stage `x` | Nodes `id (y, z)` |
|---|---|
| −5 | `s (0, 0)` |
| −3 | `a1 (1.4, 0.6)`, `a2 (0, −0.8)`, `a3 (−1.4, 0.4)` |
| −1 | `b1 (1.9, −0.5)`, `b2 (0.6, 1.0)`, `b3 (−0.6, −1.0)`, `b4 (−1.9, 0.5)` |
| 1 | `c1 (1.9, 0.5)`, `c2 (0.6, −1.0)`, `c3 (−0.6, 1.0)`, `c4 (−1.9, −0.5)` |
| 3 | `d1 (1.4, −0.4)`, `d2 (0, 0.8)`, `d3 (−1.4, −0.6)` |
| 5 | `e (0, 0)` |

Edges: `s→a1`, `s→a2`, `s→a3`, `a1→b1`, `a1→b2`, `a2→b2`, `a2→b3`, `a3→b3`, `a3→b4`, `b1→c1`, `b2→c1`, `b2→c2`, `b3→c3`, `b4→c3`, `b4→c4`, `c1→d1`, `c2→d1`, `c2→d2`, `c3→d2`, `c3→d3`, `c4→d3`, `d1→e`, `d2→e`, `d3→e`.

`SCENE` values (tune in the build, keep `design.md` in step):

```ts
export const SCENE = {
  swayDeg: 18,          // ± around the vertical axis through the origin
  swayPeriod: 20,       // s for one full back and forth
  tiltDeg: 3,           // ± around the horizontal axis through the origin
  tiltPeriod: 26,       // s
  fps: 30,
  maxFrameStep: 0.1,    // s; the clock never advances more than this per frame
  fadeMs: 300,          // canvas crossfade
  nodeSize: 0.011,      // dot diameter as a fraction of the box width (about 6px at 536px)
  pulseSize: 0.008,     // pulse dot diameter, same unit
  edgeOpacity: 0.45,    // muted edges
  pulseSpeed: 1.2,      // s to cross one edge, whatever its length
  firstPulseDelay: 1,   // s of clock time after the first render
  pulseGap: 1.6,        // s of clock time between pulse starts
  maxPulses: 2,
  pixelRatioCap: 2,
  minWidth: 1024,       // px; below this the loader never imports the scene
} as const;
```

**State transitions**:
- Scene box: `static` (SVG only; the whole visit when the loader never imports the scene) → `loading` (module imported, renderer being created) → `fading` (frame 0 drawn, canvas fading in) → `running` (SVG hidden) ⇄ `paused` (out of view or tab hidden). From `loading`, `fading`, `running`, or `paused`: → `static` on renderer creation error, context loss, or cleanup. `static` reached that way is final for the visit.
- Pulse slot: `idle` → `travelling` (spawned at `s`, crossing an edge, `progress` 0 to 1 over `pulseSpeed`) → at each node picks a random outgoing edge → `idle` again at `e`.

**API surface** (no endpoints; the surfaces are the module contract, the component, the loader gate, and the scripts):

| Surface | Kind | Inputs | Output | Errors |
|---|---|---|---|---|
| `init(container: HTMLElement): () => void` in `src/motion/scene.ts` | module export (contract from spec 0001) | the `[data-scene]` box from the loader | appends a canvas, starts the loop, returns the cleanup in AC-12 | renderer creation in `try`/`catch`: on failure, warn once, return a no op cleanup, SVG stays (AC-11) |
| 1024px gate in `watchScene()` in `src/motion/loader.ts` | loader change (additive) | `window.matchMedia('(min-width: 1024px)')` | returns before observing when it does not match | none |
| `HeroScene.astro` in `src/components/` | Astro component, no props | `GRAPH`, `CAMERA`, `SCENE`, `project`, `assertGraph` at build time | `<div data-scene aria-hidden="true" class="relative aspect-[16/10] w-full overflow-hidden max-lg:max-w-160">` holding `<svg data-scene-fallback viewBox="0 0 1600 1000" focusable="false" class="block size-full">`: first one `<line>` per edge (`stroke-muted`, `stroke-opacity` = `SCENE.edgeOpacity`, `stroke-width="1"`, `vector-effect="non-scaling-stroke"`), then one `<circle>` per node (`fill-fg`, `r` = `SCENE.nodeSize / 2 × 1600`), all at `project(node)` × (1600, 1000) | `assertGraph` throws, failing the build |
| `project(node, rotY, rotX)` | pure function in `graph.ts` | a node, rotation in radians (default 0) | rotate like the Three.js default Euler order `XYZ` (Y rotation applied to the point first, then X): `x1 = x cos rotY + z sin rotY`, `z1 = −x sin rotY + z cos rotY`, `y2 = y cos rotX − z1 sin rotX`, `z2 = y sin rotX + z1 cos rotX`; then `f = 1 / tan(fov / 2)`, `d = CAMERA.z − z2`, `ndcX = f / (16/10) × x1 / d`, `ndcY = f × y2 / d`, return `{ x: (ndcX + 1) / 2, y: (1 − ndcY) / 2 }` | none |
| Hero markup in `src/pages/index.astro` | edit | the existing hero section | the section becomes `grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-6`; the existing text goes in a wrapper `<div>`; `<HeroScene />` follows it | none |
| Canvas | created by `scene.ts` | none | inline styles `position: absolute; inset: 0; width: 100%; height: 100%; display: block; opacity: 0; transition: opacity 300ms ease-out; pointer-events: none`; size set with `renderer.setSize(w, h, false)` so Three.js writes no style | none |
| `?scene-still` | debug switch read in `scene.ts` | `new URLSearchParams(location.search).has('scene-still')` | renders frame 0, completes the handover, and never starts the loop; for the AC-2 comparison only | none |
| Print rule in `global.css` | `@media print` | `[data-scene] canvas`, `[data-scene-fallback]` | canvas `display: none !important`; SVG `display: block !important` | none |
| `check:bundle` budget in `scripts/check-bundle.mjs` | script change | `dist/` after `pnpm build` | (1) the up front set is what the script already walks; (2) in those files, find dynamic imports with a separate regex ``/(?<![\w$.])import\(\s*(["'`])([^"'`]+)\1\s*\)/g`` (backticks included, because the minifier writes dynamic import specifiers as template literals), resolved like static ones (relative to the importing file); (3) for each target, walk its static imports and re exports with the existing regexes; the closure is the target plus everything reached, minus the up front set; (4) for the closure that contains `__THREE__`, sum `gzipSync(file).length` per `.js` file (no CSS or other assets); print the size in KB; fail if it is above `SCENE_BUDGET_KB`, and fail if no closure contains `__THREE__` while `/` has `[data-scene]` | fails with the measured size and the limit |

`scene.ts` shape (a guide; `/develop` follows the threejs skills for details):

```ts
import { BufferGeometry, CanvasTexture, Color, Float32BufferAttribute, Group,
  PerspectiveCamera, Points, PointsMaterial, Scene, SRGBColorSpace, WebGLRenderer } from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { CAMERA, GRAPH, SCENE } from './graph';

export function init(container: HTMLElement): () => void {
  // 1. colors: new Color(getComputedStyle(container).getPropertyValue('--color-fg').trim())
  //    (tokens are hex in global.css); same for --color-muted. Tone mapping stays NoToneMapping.
  // 2. try { renderer = new WebGLRenderer({ antialias: true, alpha: true }) } catch → warn once, return () => {}
  //    setClearColor(0x000000, 0); no scene.background; pixelRatio = min(devicePixelRatio, SCENE.pixelRatioCap)
  // 3. size from container.getBoundingClientRect() BEFORE frame 0; setSize(w, h, false)
  // 4. group (pivot at the origin):
  //    edges: LineSegments2 + LineMaterial({ color: muted, transparent: true,
  //           opacity: SCENE.edgeOpacity, linewidth: 1, worldUnits: false });
  //           LineSegments2.onBeforeRender sets resolution from renderer.getViewport(), which is in
  //           CSS px, so linewidth 1 is 1 CSS px at any pixel ratio; never set resolution by hand
  //           (where two edges meet at a node their ends overlap and look a little brighter; accepted,
  //           the node dot covers the joint)
  //    nodes: Points + PointsMaterial({ color: fg, sizeAttenuation: false,
  //           size: SCENE.nodeSize * w, map: disc, alphaTest: 0.5, transparent: false })
  //           with sizeAttenuation off, size is in CSS px; the renderer multiplies it by the
  //           pixel ratio itself (WebGLMaterials), so never multiply by pixelRatio here
  //    disc:  a 64 × 64 CanvasTexture with a white filled circle touching all four edges (no padding),
  //           colorSpace SRGBColorSpace
  //    pulses: Points with a buffer of SCENE.maxPulses positions; geometry.setDrawRange(0, alive)
  //           with live pulses kept at the front of the buffer; size from SCENE.pulseSize
  //    depthTest false on all three materials; renderOrder edges 0 < nodes 1 < pulses 2
  // 5. append canvas (opacity 0), render frame 0 with t = 0 (rotation 0),
  //    void canvas.offsetWidth (style flush), set opacity 1;
  //    hide the SVG on transitionend OR after SCENE.fadeMs + 50 ms, whichever first; keep both cancellable
  // 6. loop (skipped with ?scene-still): requestAnimationFrame; render only when ≥ 1 / SCENE.fps s
  //    have passed; t += min(delta, SCENE.maxFrameStep); rotation from the AC-7 formulas;
  //    pulses: position = lerp(fromNode, toNode, progress), progress += step / SCENE.pulseSpeed
  // 7. IntersectionObserver (pause and resume), visibilitychange, ResizeObserver
  //    (setSize and point sizes; line resolution follows the viewport by itself; if paused, mark dirty and render once on resume),
  //    webglcontextlost on renderer.domElement → teardown to static (no restore)
  // return cleanup: guarded by a `disposed` flag so a second call does nothing (AC-12)
}
```

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| SVG and scene | node positions, edges | `GRAPH` in `graph.ts` (starting layout above) |
| SVG | 2D position of each node | `project(node)` at rotation 0, scaled to the `1600 × 1000` viewBox |
| Scene | camera field of view (vertical), distance, aspect | `CAMERA` (35°, 14) and the fixed 16:10 box ratio |
| Scene first frame | pose | `t = 0` gives rotation 0 by the AC-7 formulas, so it matches the SVG |
| Both | node and pulse color | `--color-fg` token: Tailwind `fill-fg` in the SVG; `getComputedStyle(container).getPropertyValue('--color-fg').trim()` parsed with `new Color()` in the scene (the token is hex) |
| Both | edge color and opacity | `--color-muted` token plus `SCENE.edgeOpacity` |
| Both | edge width | 1 CSS px: `vector-effect="non-scaling-stroke"` in the SVG; `LineMaterial.linewidth` = 1 in the scene, with `resolution` set by `LineSegments2` before each render from the renderer viewport (CSS px) |
| Both | node dot size | `SCENE.nodeSize` × box width (1600 in the SVG viewBox; CSS width in CSS px for `PointsMaterial.size`, which the renderer multiplies by the pixel ratio) |
| Scene | box size in CSS px | `getBoundingClientRect()` before frame 0, then the `ResizeObserver` content rect |
| Scene | pixel ratio | `min(window.devicePixelRatio, SCENE.pixelRatioCap)` |
| Scene | sway, tilt, pulse timing, frame cap, fade | `SCENE` constants; every timer reads the animation clock `t`, never wall time, except the 300ms fade and its backup timer |
| Pulses | which edge to follow | `Math.random()` among the current node's outgoing edges in `GRAPH` |
| Loop | run or pause | `IntersectionObserver` on the container (any pixel visible) and `document.visibilityState` |
| Loader | whether to import the scene at all | spec 0001 gates plus `matchMedia('(min-width: 1024px)')`, read once |
| Budget | `SCENE_BUDGET_KB` | measured on the first build after step 4, plus about 10%, rounded up to 5 KB, capped at 180; a constant in `check-bundle.mjs` |
| AC-2 check | a frozen frame 0 | the `?scene-still` query switch |

**Key invariants**:
- The page is complete with no JavaScript: the SVG is in the HTML, and no CSS hides it. Only `scene.ts` ever sets the canvas opacity or the SVG `hidden` attribute.
- The scene box size comes from its CSS aspect ratio alone; nothing the scene does changes layout.
- `three` and `three/addons` are imported only in `scene.ts`, which is reached only through `import()` in `loader.ts`. `graph.ts` imports nothing, so the SVG build never touches Three.js.
- The SVG and the canvas first frame come from the same data and the same projection; `project()` and the Three.js camera must use the same field of view, distance, aspect, and rotation order.
- Every color is a token read at runtime or through a Tailwind token class; no hex value in `scene.ts`, `graph.ts`, or `HeroScene.astro`.
- Every failure ends with the SVG visible and no canvas. Cleanup runs safely any number of times.
- No coral in the scene; coral stays on the button, the underline, and the focus ring.

**Security model**: none. Static, public, decorative content; no data collected, no third party requests, only same origin JavaScript chunks.

**Configuration required**: none. No environment variables or credentials. New dependencies: `three` `0.186.x` and, as a dev dependency, `@types/three` `0.186.x`.

**Critical test scenarios**:
- Happy path: `pnpm build && pnpm preview`, open `/` at 1280, wait for idle. The SVG graph is replaced by the canvas in a soft fade with no jump; the graph sways and pulses travel left to right, at most two at once. Verifies **AC-2**, **AC-4**, **AC-7**, **AC-8**.
- Mobile: open `/` at 390. The SVG graph shows under the button, and no Three.js chunk is requested. Verifies **AC-4**, **AC-10**.
- Failure case: disable WebGL and load `/`. The SVG stays, one console warning. Then on a normal load, force context loss with the `WEBGL_lose_context` extension: the SVG returns. Then toggle reduced motion on: nothing breaks (cleanup runs a second time safely). Verifies **AC-11**, **AC-12**.
- Failure case: toggle reduced motion on during the 300ms fade. The canvas disappears, the SVG stays visible, and it is not hidden afterwards by the pending timer. Verifies **AC-12**.
- Layout: Lighthouse mobile on `/` reports CLS 0; 320 wide has no sideways scroll. Verifies **AC-3**.
- Budget: `pnpm check:bundle` prints the scene closure size under `SCENE_BUDGET_KB`; a temporary static `import 'three'` in `loader.ts` fails it. Verifies **AC-14**.
- Auth/permission: not applicable (public static page, no roles).

## Build plan

Skateboard: the first milestone is the smallest whole that could ship alone (the two column hero with the SVG graph, which is complete with no Three.js at all, and is all phones will ever get). Then the live scene in its simplest form, then the motion, then the safety paths and the budget. Each milestone leaves `pnpm verify` green and the page shippable.

1. Write `src/motion/graph.ts`: `GraphNode`, `GraphEdge`, `GRAPH` (the starting layout), `CAMERA`, `SCENE`, `project()` with rotation, and `assertGraph()` covering every AC-5 rule (including centroid and the 8% fit at all four sway and tilt extremes). Satisfies **AC-5**.
2. Write `HeroScene.astro` (calls `assertGraph`, draws the inline SVG from `project()` with token classes, `block size-full`) and change the hero in `index.astro` to the two column grid with the scene box under the button below 1024px. Add the print rule to `global.css`. Check 320, 390, 768, 1280. Satisfies **AC-1**, **AC-3**, **AC-4**, **AC-6**, **AC-13**. (First shippable milestone: the page now has its visual with no JavaScript.)
3. Run `pnpm add three@~0.186.0` and `pnpm add -D @types/three@~0.186.0` (check that pnpm's `minimumReleaseAge` accepts them). Prove the `check:bundle` `__THREE__` marker: temporarily add a static `import 'three'` to `loader.ts`, confirm `pnpm build && pnpm check:bundle` fails, then remove it (if the marker is absent from the minified r186 build, replace it and update spec 0002). Remove the ESLint `no-empty-function` override for `scene.ts`. Add the 1024px gate to `watchScene()` in `loader.ts`. Satisfies **AC-10**, **AC-14**.
4. Write `scene.ts` static: renderer in `try`/`catch`, camera from `CAMERA`, edges with `LineSegments2` (`linewidth: 1`, resolution left to `LineSegments2`), round node dots with `Points` and the disc texture, colors from tokens, initial size then `ResizeObserver`, frame 0, the style flush and crossfade with its backup timer, the `?scene-still` switch, and the idempotent cleanup. Compare node positions with the SVG at 1280 using `?scene-still`. Satisfies **AC-2**, **AC-6**, **AC-8**, **AC-10** (resize), **AC-11** (creation failure), **AC-12**.
5. Add the loop: 30 fps cap, the AC-7 sway and tilt formulas on the clamped clock, pause on out of view and hidden tab, one render on resume after a resize. Satisfies **AC-7** (sway), **AC-9**.
6. Add pulses: a pool of `maxPulses` slots in one `Points` object with `setDrawRange`, spawn rule on the clock, `pulseSpeed` per edge, random outgoing edge at each node, freed at the end node. Satisfies **AC-7**.
7. Add the `webglcontextlost` teardown. Extend `check-bundle.mjs` with the dynamic import closure size check, measure the scene closure, set `SCENE_BUDGET_KB` (measured plus about 10%, rounded up to 5 KB, at most 180; if the measurement is above 165 KB, stop and bring it back to `/architect`), and record the size in the PR. Satisfies **AC-11**, **AC-14**.
8. Add the hero scene to `design.md` (placement, desktop only live scene, colors, `SCENE` values, the SVG fallback, the 30 fps cap) and the two column hero to `docs/design/pages/home.md`. Run the steps in `verify.md`, then `pnpm verify`. Satisfies **AC-15**, and rechecks **AC-1** and **AC-3**.

## Consequences

**Positive**:
- The hero gains a distinct, on brand visual that says "automation" without a word or a claim, built from the same lines and dots language as the rest of the page.
- Every visitor sees the graph, even with JavaScript off, because the fallback is real markup drawn from the same data.
- Phones and tablets never download Three.js, so mobile data, battery, and Lighthouse mobile scores are untouched by the scene.
- No asset files: nothing to compress, nothing to export again when the graph changes, and almost no Netlify bandwidth beyond the desktop JavaScript.
- One data file controls the shape and every motion value.

**Negative / tradeoffs**:
- Roughly 130 to 170 KB gzipped of Three.js (plus the `LineSegments2` addon) downloads after idle for every desktop visitor whose settings allow it. It does not affect first paint, but it costs a little of the 300 credit Netlify budget.
- Phones and tablets never see the motion, only the still graph.
- The hero grows taller on phones (the box adds about 224px plus 32px gap at 390 wide), pushing the Tools line further down.
- The hero h1 now wraps in a column about 536px wide at 1280, so it takes one more line than today.
- The scene moves while the hero is on screen. Spec 0008's rule "nothing on screen at start moves" was written for content; the scene is the agreed exception, made safe by starting from the identical pose (see rationale).
- Two drawing paths (SVG and WebGL) must agree; a change to the projection math in one place but not the other shows as a jump at handover. `project()` is the guard, and AC-2 the check.
- During the 300ms fade both drawings show, so lines look slightly brighter for a moment; and WebGL and SVG antialias edges differently. Both are accepted as too small to notice.
- A desktop visitor who loads the page in a narrow window and widens it keeps the SVG for that visit.

**Neutral**:
- Spec 0001's contract gains the 1024px gate, and its wording changes from a fallback `<img>` to a fallback `<svg>`; the rest of the behavior (owned by the section, hidden by `scene.ts` after the first frame) is the same.
- `check:bundle` gains a size budget and a dynamic import walk, a new kind of check beside its marker check.
- `src/motion/AGENTS.md` goes out of date (`three` installed, `graph.ts` added, the SVG fallback, the 1024px gate, the budget); `/sync` owns that.

## Follow-up

- [ ] After the build, `/sync` should update `src/motion/AGENTS.md`: `three` installed, `graph.ts` as the shared data file that imports nothing, the fallback is an inline `<svg data-scene-fallback>`, the 1024px gate, the scene budget, and remove the "not installed yet" gotcha for Three.js.
- [ ] Update spec 0001's wording (fallback `<img>` → fallback `<svg>`, plus the 1024px gate) when this ships, and mark the spec 0002 follow up "prove the bundle check markers" done for Three.js.
- [ ] Spec 0008's follow up "feature 14 must respect AC-4" is answered by this spec's handover rule (identical first pose, crossfade); note it there when 0008 closes.
- [ ] Revisit at launch (feature 16): check the real Lighthouse desktop score with the scene on; if the late chunk shows up in total blocking time, consider the SVG only option on desktop too.
