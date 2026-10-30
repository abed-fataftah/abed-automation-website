# Verify: Three.js hero scene · spec 0009 · 2026-10-30
_Steps derived from spec 0009 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones. Run against `pnpm build && pnpm preview`, not the dev server, so the real chunks load._

## UI / manual
- [ ] JavaScript off, open `/` at 1280 → the SVG graph fills the right hero column; at 390 → it sits 32px under the hero button → AC-1, AC-4
- [ ] DevTools rendering: emulate `prefers-reduced-motion: reduce`, reload `/` at 1280 → SVG shown, no scene or `three` chunk in the network panel → AC-1
- [ ] Open `/` at 390 and at 768 with motion allowed → SVG only, no scene or `three` chunk requested → AC-10
- [ ] Fresh load `/` at 1280, wait for idle → the canvas fades in over about 300ms with no visible jump; afterwards the SVG has the `hidden` attribute → AC-8
- [ ] Open `/?scene-still` at 1280 → screenshot; compare with a JavaScript off screenshot → every node centre within 2 CSS px → AC-2
- [ ] Watch for 40s at 1280 → the graph sways about 18° each way over about 20s, never shows side on, pulses run start to end along the lines, at most 2 at once, the first about 1s after the fade; nothing reacts to the mouse or scroll → AC-7
- [ ] Resize from 1280 to 1024 and back → the canvas follows the box, lines stay 1px, dots keep their size relative to the box; narrow below 1024 → the scene keeps running → AC-10
- [ ] Load `/` at 800 wide, then widen past 1024 → the SVG stays, no scene chunk is requested → AC-10
- [ ] Zoom in on an edge on a 2x screen → the line is 1 CSS px, not a hairline; edges are `muted`, dots and pulses `fg`, no coral, no glow → AC-6
- [ ] Performance panel: record 5s at the top, then 5s with the hero scrolled away and 5s in a background tab → frames at about 30 per second only while visible; resuming continues the sway without a jump → AC-9
- [ ] Scroll the hero away, resize the window, scroll back → the canvas is the right size on the first visible frame → AC-9
- [ ] Lighthouse (mobile) on `/` → CLS 0; at 320 no sideways scroll; the hero text never overlaps the box → AC-3
- [ ] Disable WebGL in the browser, load `/` at 1280 → SVG stays, one console warning → AC-11
- [ ] In the console run `document.querySelector('[data-scene] canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()` → the canvas is removed and the SVG returns; then toggle reduced motion on → no error (cleanup runs again safely) → AC-11, AC-12
- [ ] Mid visit, toggle reduced motion on in DevTools → the canvas disappears and the SVG shows at once; a heap snapshot holds no `WebGLRenderer` → AC-12
- [ ] Throttle the CPU 6x, reload, and toggle reduced motion on during the fade → the SVG stays visible and is not hidden afterwards → AC-12
- [ ] Tab through the page with and without the scene → same Tab order; the accessibility tree shows nothing from the scene box → AC-13
- [ ] Print preview with the scene running → the SVG prints, not the canvas → AC-13
- [ ] Open `/404` → no scene box, no scene chunk requested → AC-14

## Commands
- [ ] `grep -rn "from 'three" src` → matches only in `src/motion/scene.ts` → AC-14
- [ ] `grep -n "import" src/motion/graph.ts` → no imports → AC-14
- [ ] Temporarily add `import 'three';` to `src/motion/loader.ts`, run `pnpm build && pnpm check:bundle` → fails naming the entry chunk; remove it → passes and prints the scene closure size under `SCENE_BUDGET_KB` → AC-14
- [ ] Temporarily break `GRAPH` (an edge going right to left, then a node moved off centre so the centroid shifts, then `swayDeg` raised until a node leaves the 8% margin), run `pnpm build` each time → fails with the `assertGraph` message; revert → AC-5
- [ ] `grep -n -i "#[0-9a-f]\{6\}" src/motion/scene.ts src/motion/graph.ts src/components/HeroScene.astro` → no match; `pnpm check:design` passes → AC-6
- [ ] `grep -n -i "scene" design.md docs/design/pages/home.md` → the hero scene section and the two column hero are documented → AC-15
- [ ] `pnpm verify` → exit 0 → AC-15

## Value sourcing
- [ ] Changing a node's `x` in `GRAPH` moves it in both the SVG and the canvas
- [ ] Changing `SCENE.swayDeg` changes only the sway amount
- [ ] Changing `--color-muted` in `global.css` changes the edge color in both the SVG and the canvas
