# 0009. Three.js hero scene: rationale

The decision record behind [index.md](index.md). `/develop` builds from `index.md`; this file explains why.

## Context

> ⚠️ Premise note: a decorative 3D scene is the heaviest thing this site will download, for a page whose only job is to be read and to get someone to book a call. A static SVG of the same graph would give most of the visual effect for about 3KB. The live scene stays because the scope plans it for Release 2 and spec 0001 already chose Three.js for it. This spec also makes the SVG the real foundation: it ships first, it is all that phones, tablets, and every gated visitor get, and the live scene only ever adds to it on desktop.

The site is a finished, static, single page. Release 2 adds motion on top: GSAP reveals (spec 0008) and a Three.js scene (this spec, scope feature 14). Spec 0001 already fixed the loading frame: `three` `0.186.x` with `WebGLRenderer`, reached only through `import()` in `src/motion/loader.ts`, loaded only when the `[data-scene]` box nears the viewport, reduced motion is off, and the connection is not slow. The section owns the box and its fallback, and `scene.ts` hides the fallback after the first frame and disposes everything on cleanup.

The design rules in `design.md` narrow what the scene may look like. The page is warm charcoal with off white text; structure comes from 1px lines and spacing; there are no gradients, glows, or shadows; and coral appears in exactly three places. Motion must never change layout or block reading. A typical 3D hero (glowing particles, bloom, colored gradients, a big model file) breaks almost every one of these rules.

The scope's done line asks for four things: the approved scene runs smoothly, a static fallback shows when 3D is unavailable, reduced motion and mobile get a lighter version, and the hero stays readable while the scene loads. Two forces conflict here. The scope says reduced motion gets a "lighter version", while spec 0001 never loads the scene with reduced motion on. And spec 0008 says nothing on screen when motion starts may move, while a hero scene is on screen by definition.

Budget matters too. Netlify Free bills bandwidth from a 300 credit month, so asset weight is real money. The scene is decorative, so every byte and every frame it costs has to be cheap.

## Options considered

### Option 1: Procedural graph, shared data file, build time SVG fallback

Nodes and edges live in a plain TypeScript file that imports nothing. An Astro component projects them into an inline SVG at build time using a copy of the camera math; `scene.ts` builds the same graph in Three.js with 1 CSS px lines from `LineSegments2` and round `Points` dots, and crossfades in over the SVG from the identical pose.

**Pros**:
- The fallback is real markup in the HTML: zero extra requests, crisp at any size, colored by tokens, and present with JavaScript off.
- The SVG and the scene cannot drift apart, because both come from one data file and one projection.
- No asset pipeline at all: no glTF, no textures, no compression step.
- Lines are exactly 1 CSS px, which is the site's own visual language.

**Cons**:
- The projection math lives twice (Three.js and `project()`), so it must be kept identical; AC-2 checks it.
- `LineSegments2` adds an addon (a few KB) over plain `LineSegments`.
- The graph is authored by hand as coordinates, which is fiddly to tune.

### Option 2: Procedural graph with an exported raster fallback

The same live scene, but the fallback is a PNG or AVIF screenshot of the first frame, committed to `src/assets` and served through Astro `<Image>`.

**Pros**:
- Pixel identical to the WebGL frame, so the handover is perfectly seamless.
- No second drawing path to maintain in code.

**Cons**:
- An extra image request on first load, in the hero, competing with the LCP text.
- Must be exported again by hand whenever the graph, camera, or colors change; it silently goes stale.
- Raster on a 16:10 box at 1x, 2x, and 3x means several files.

### Option 3: Modelled scene loaded as glTF

Author the graph (or a richer object) in Blender, export a compressed glTF, and load it with `GLTFLoader`.

**Pros**:
- Full art control over the look, including shapes beyond dots and lines.
- Designers can change it without touching code.

**Cons**:
- Adds a loader, a decompressor, and a model file to download, all against the bandwidth budget.
- The fallback still has to be made separately.
- Overkill for a graph that is a few dozen points and lines.

### Option 4: No live 3D, SVG only

Ship only the SVG graph, maybe with a CSS animation, and drop Three.js from the plan.

**Pros**:
- About 3KB, no WebGL failure modes, no GPU or battery cost.
- Simplest to build and maintain.

**Cons**:
- No real depth: a 2D sway is not 3D, and the scope and spec 0001 plan a Three.js scene.
- CSS animation on SVG cannot do convincing perspective rotation.

## Rationale

Option 1 is the only one that satisfies all four of the scope's done line items without spending the bandwidth budget. The fallback is not an afterthought: it is what visitors with JavaScript off, reduced motion, slow connections, or no WebGL see, and it is on screen for everyone while the scene loads. Making it real SVG from the same data means the "static fallback" and "hero stays readable while it loads" requirements are met by plain HTML, and the live scene can only ever improve on it. Option 2 gets the same handover with less code, but it puts an image request in the hero and goes stale the first time someone tunes the graph. Option 3 is the boring choice for a rich model, but this is a few dozen points and lines, and a model file buys nothing here. Option 4 is the runner up, and it is what phones and tablets get.

Phones were first planned to get a lighter live scene (lower pixel ratio, no antialiasing, one pulse). The cross check showed why that saves less than it seems: the hero is always in the first viewport, so the loader's 200px gate always fires, and every phone would download the whole Three.js chunk right after load. A lighter mode saves GPU work, not data. Showing only the SVG below 1024px removes the download, the live breakpoint switching, and the light mode settings, at the cost of phones never seeing the motion. The scope asks that mobile get "a lighter version"; the SVG is that version, the same one reduced motion gets.

The reduced motion conflict resolves in favour of spec 0001: a still SVG is the "lighter version". Loading 150KB of Three.js to show a frozen frame that looks identical to the SVG would cost the visitor data for nothing. The spec 0008 rule ("nothing on screen at start moves") was written for content that would vanish and reappear when a script sets a starting state. The scene is decorative and its handover starts from the exact pose the SVG shows, through a short crossfade, so the visitor never sees content blink or jump; then it sways slowly. You chose a hero placement with idle motion, which makes the scene the hero's one deliberate moving element besides the underline.

The smaller calls follow the same forces. `LineSegments2` over plain `LineSegments`: WebGL hairlines are one device pixel, which is half a CSS pixel on a Retina screen, too faint for the `muted` color on charcoal and different from the SVG; the addon costs a few KB and keeps the site's 1px rule (runner up: plain `LineSegments`, accepting thinner lines on high density screens). Round dots through `PointsMaterial` with a tiny generated disc texture and `alphaTest` rather than a custom shader keeps the code inside documented Three.js materials (runner up: a ten line `ShaderMaterial` that discards outside a circle). A 30 fps cap with pause when out of view halves the GPU cost of a scene whose motion is slow enough that nobody can see the difference. On context loss, the scene tears down to the SVG instead of trying to restore, because a decorative scene is not worth a recovery path that can fail in new ways (runner up: restore on `webglcontextrestored`). The SVG stays fully visible under the fading canvas rather than fading out at the same time: keeping it causes a brief, faint brightening of the lines, while fading both causes a visible dip, which is worse. The bundle budget in `check:bundle` exists because Three.js grows silently: one `import * as THREE` or a stray addon can double the chunk without any visible change. It is set from the measured size plus headroom rather than a guessed number, so it catches growth without failing on day one.
