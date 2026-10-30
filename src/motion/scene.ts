// The hero's live workflow graph (spec 0009). The only file that imports `three`;
// loader.ts reaches it through import() on desktop only. It draws the graph from
// src/motion/graph.ts, fades in over the static SVG from the identical pose, sways
// it, and sends pulses along the edges. Every failure ends with the SVG visible.
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Group,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { CAMERA, GRAPH, SCENE, type GraphNode } from './graph';

interface Pulse {
  from: GraphNode;
  to: GraphNode;
  progress: number; // 0..1 along the current edge
}

const DEG = Math.PI / 180;
const FRAME_MS = 1000 / SCENE.fps;
const FRAME_SLACK_MS = 2; // rAF timestamps jitter; without slack a 60Hz screen drops to 20 fps

function tokenColor(element: Element, name: string): Color {
  return new Color(getComputedStyle(element).getPropertyValue(name).trim());
}

// A white disc filling the whole texture, so each point draws as a round dot.
function discTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(32, 32, 32, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function pick<T>(items: readonly T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)];
}

export function init(container: HTMLElement): () => void {
  const fallback = container.querySelector('[data-scene-fallback]');

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
  } catch (error) {
    console.warn('The 3D scene could not start; the static drawing stays.', error);
    return () => undefined;
  }

  const still = new URLSearchParams(location.search).has('scene-still');
  const canvas = renderer.domElement;
  const disposables: { dispose: () => void }[] = [renderer];
  let disposed = false;
  let frame = 0;
  let fadeTimer = 0;
  let resizeObserver: ResizeObserver | undefined;
  let intersectionObserver: IntersectionObserver | undefined;

  function showFallback(): void {
    fallback?.removeAttribute('hidden');
  }

  function hideFallback(): void {
    window.clearTimeout(fadeTimer);
    canvas.removeEventListener('transitionend', hideFallback);
    if (!disposed) fallback?.setAttribute('hidden', '');
  }

  // Safe to call any number of times (reduced motion after a context loss, say).
  function cleanup(): void {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    window.clearTimeout(fadeTimer);
    canvas.removeEventListener('transitionend', hideFallback);
    canvas.removeEventListener('webglcontextlost', cleanup);
    document.removeEventListener('visibilitychange', onVisibility);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    for (const item of disposables) item.dispose();
    if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
    canvas.remove();
    showFallback();
  }

  // Scene

  const fg = tokenColor(container, '--color-fg');
  const muted = tokenColor(container, '--color-muted');
  const scene = new Scene();
  const camera = new PerspectiveCamera(CAMERA.fov, CAMERA.aspect, CAMERA.near, CAMERA.far);
  camera.position.set(0, 0, CAMERA.z);
  camera.lookAt(0, 0, 0);

  const byId = new Map(GRAPH.nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, GraphNode[]>(GRAPH.nodes.map((node) => [node.id, []]));
  for (const { from, to } of GRAPH.edges) {
    const target = byId.get(to);
    if (target) outgoing.get(from)?.push(target);
  }
  const start = GRAPH.nodes.reduce((a, b) => (b.x < a.x ? b : a));

  const edgeGeometry = new LineSegmentsGeometry().setPositions(
    GRAPH.edges.flatMap(({ from, to }) => {
      const a = byId.get(from);
      const b = byId.get(to);
      return a && b ? [a.x, a.y, a.z, b.x, b.y, b.z] : [];
    }),
  );
  // LineSegments2 sets `resolution` to the CSS viewport before each render, so a
  // linewidth of 1 is 1 CSS px at any pixel ratio.
  const edgeMaterial = new LineMaterial({
    color: muted,
    transparent: true,
    opacity: SCENE.edgeOpacity,
    linewidth: 1,
    worldUnits: false,
    depthTest: false,
  });
  const edges = new LineSegments2(edgeGeometry, edgeMaterial);
  edges.renderOrder = 0;

  const disc = discTexture();
  const nodeGeometry = new BufferGeometry();
  nodeGeometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      GRAPH.nodes.flatMap((node) => [node.x, node.y, node.z]),
      3,
    ),
  );
  // With sizeAttenuation off, size is in CSS px; the renderer applies the pixel ratio.
  const nodeMaterial = new PointsMaterial({
    color: fg,
    sizeAttenuation: false,
    map: disc,
    alphaTest: 0.5,
    depthTest: false,
  });
  const nodes = new Points(nodeGeometry, nodeMaterial);
  nodes.renderOrder = 1;

  // Live pulses sit at the front of the buffer; the draw range hides the rest.
  const pulsePositions = new Float32BufferAttribute(new Float32Array(SCENE.maxPulses * 3), 3);
  const pulseGeometry = new BufferGeometry();
  pulseGeometry.setAttribute('position', pulsePositions);
  pulseGeometry.setDrawRange(0, 0);
  const pulseMaterial = new PointsMaterial({
    color: fg,
    sizeAttenuation: false,
    map: disc,
    alphaTest: 0.5,
    depthTest: false,
  });
  const pulseDots = new Points(pulseGeometry, pulseMaterial);
  pulseDots.renderOrder = 2;
  pulseDots.frustumCulled = false; // positions change every frame

  disposables.push(
    edgeGeometry,
    edgeMaterial,
    disc,
    nodeGeometry,
    nodeMaterial,
    pulseGeometry,
    pulseMaterial,
  );

  const graph = new Group();
  graph.add(edges, nodes, pulseDots);
  scene.add(graph);

  // Size and motion

  function setSize(width: number, height: number): void {
    renderer.setSize(width, height, false); // the inline styles below own the CSS size
    nodeMaterial.size = SCENE.nodeSize * width;
    pulseMaterial.size = SCENE.pulseSize * width;
  }

  let t = 0; // animation clock in seconds, 0 at the first render
  let lastSpawn = -Infinity;
  const pulses: Pulse[] = [];

  function spawnPulse(): void {
    const to = pick(outgoing.get(start.id) ?? []);
    if (!to) return;
    pulses.push({ from: start, to, progress: 0 });
    lastSpawn = t;
  }

  function advance(step: number): void {
    t += step;
    graph.rotation.y = SCENE.swayDeg * DEG * Math.sin((2 * Math.PI * t) / SCENE.swayPeriod);
    graph.rotation.x = SCENE.tiltDeg * DEG * Math.sin((2 * Math.PI * t) / SCENE.tiltPeriod);

    for (let i = pulses.length - 1; i >= 0; i--) {
      const pulse = pulses[i];
      pulse.progress += step / SCENE.pulseSpeed;
      while (pulse.progress >= 1) {
        const next = pick(outgoing.get(pulse.to.id) ?? []);
        if (!next) {
          pulses.splice(i, 1); // reached the end node
          break;
        }
        pulse.progress -= 1;
        pulse.from = pulse.to;
        pulse.to = next;
      }
    }
    if (
      t >= SCENE.firstPulseDelay &&
      pulses.length < SCENE.maxPulses &&
      t - lastSpawn >= SCENE.pulseGap
    ) {
      spawnPulse();
    }

    pulses.forEach(({ from, to, progress }, i) => {
      pulsePositions.setXYZ(
        i,
        from.x + (to.x - from.x) * progress,
        from.y + (to.y - from.y) * progress,
        from.z + (to.z - from.z) * progress,
      );
    });
    pulsePositions.needsUpdate = true;
    pulseGeometry.setDrawRange(0, pulses.length);
  }

  function render(): void {
    renderer.render(scene, camera);
  }

  // Loop: 30 fps at most, paused while out of view or in a hidden tab.

  let inView = true;
  let running = false;
  let dirty = false;
  let lastFrame: number | undefined;

  function tick(now: number): void {
    frame = requestAnimationFrame(tick);
    if (lastFrame === undefined) {
      lastFrame = now;
      return;
    }
    if (now - lastFrame < FRAME_MS - FRAME_SLACK_MS) return;
    advance(Math.min((now - lastFrame) / 1000, SCENE.maxFrameStep));
    lastFrame = now;
    render();
  }

  function canRun(): boolean {
    return inView && document.visibilityState === 'visible';
  }

  function updateLoop(): void {
    if (disposed || still) return;
    if (canRun() && !running) {
      running = true;
      lastFrame = undefined;
      if (dirty) render();
      dirty = false;
      frame = requestAnimationFrame(tick);
    } else if (!canRun() && running) {
      running = false;
      cancelAnimationFrame(frame);
    }
  }

  function onVisibility(): void {
    updateLoop();
  }

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE.pixelRatioCap));
    renderer.setClearColor(0x000000, 0);
    const box = container.getBoundingClientRect();
    setSize(box.width, box.height);

    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
      opacity: '0',
      transition: `opacity ${String(SCENE.fadeMs)}ms ease-out`,
      pointerEvents: 'none',
    });
    canvas.tabIndex = -1;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.addEventListener('webglcontextlost', cleanup);
    container.append(canvas);

    // Frame 0 is the SVG's pose (t = 0, rotation 0), so the fade shows no jump.
    render();
    canvas.getBoundingClientRect(); // flush styles so opacity 0 → 1 transitions
    canvas.addEventListener('transitionend', hideFallback);
    fadeTimer = window.setTimeout(hideFallback, SCENE.fadeMs + 50);
    canvas.style.opacity = '1';

    resizeObserver = new ResizeObserver(([entry]) => {
      if (disposed) return;
      setSize(entry.contentRect.width, entry.contentRect.height);
      // Resizing clears the canvas, so draw again now unless the loop is paused.
      if (still || canRun()) render();
      else dirty = true;
    });
    resizeObserver.observe(container);

    if (!still) {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        updateLoop();
      });
      intersectionObserver.observe(container);
      document.addEventListener('visibilitychange', onVisibility);
      updateLoop();
    }
  } catch (error) {
    cleanup();
    throw error;
  }

  return cleanup;
}
