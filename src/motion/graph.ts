// The hero scene's single data file (spec 0009): the workflow graph, the camera,
// and every motion value. HeroScene.astro draws the static SVG from it at build
// time and scene.ts builds the live Three.js scene from it, so both start from the
// same pose. This file imports nothing, so the SVG build never touches Three.js.

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  z: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Six stages flowing left to right, centred on the origin (the point it sways around).
export const GRAPH: Graph = {
  nodes: [
    { id: 's', x: -5, y: 0, z: 0 },
    { id: 'a1', x: -3, y: 1.4, z: 0.6 },
    { id: 'a2', x: -3, y: 0, z: -0.8 },
    { id: 'a3', x: -3, y: -1.4, z: 0.4 },
    { id: 'b1', x: -1, y: 1.9, z: -0.5 },
    { id: 'b2', x: -1, y: 0.6, z: 1.0 },
    { id: 'b3', x: -1, y: -0.6, z: -1.0 },
    { id: 'b4', x: -1, y: -1.9, z: 0.5 },
    { id: 'c1', x: 1, y: 1.9, z: 0.5 },
    { id: 'c2', x: 1, y: 0.6, z: -1.0 },
    { id: 'c3', x: 1, y: -0.6, z: 1.0 },
    { id: 'c4', x: 1, y: -1.9, z: -0.5 },
    { id: 'd1', x: 3, y: 1.4, z: -0.4 },
    { id: 'd2', x: 3, y: 0, z: 0.8 },
    { id: 'd3', x: 3, y: -1.4, z: -0.6 },
    { id: 'e', x: 5, y: 0, z: 0 },
  ],
  edges: [
    { from: 's', to: 'a1' },
    { from: 's', to: 'a2' },
    { from: 's', to: 'a3' },
    { from: 'a1', to: 'b1' },
    { from: 'a1', to: 'b2' },
    { from: 'a2', to: 'b2' },
    { from: 'a2', to: 'b3' },
    { from: 'a3', to: 'b3' },
    { from: 'a3', to: 'b4' },
    { from: 'b1', to: 'c1' },
    { from: 'b2', to: 'c1' },
    { from: 'b2', to: 'c2' },
    { from: 'b3', to: 'c3' },
    { from: 'b4', to: 'c3' },
    { from: 'b4', to: 'c4' },
    { from: 'c1', to: 'd1' },
    { from: 'c2', to: 'd1' },
    { from: 'c2', to: 'd2' },
    { from: 'c3', to: 'd2' },
    { from: 'c3', to: 'd3' },
    { from: 'c4', to: 'd3' },
    { from: 'd1', to: 'e' },
    { from: 'd2', to: 'e' },
    { from: 'd3', to: 'e' },
  ],
};

// A PerspectiveCamera at (0, 0, z) looking at the origin. `fov` is vertical, in degrees.
export const CAMERA = {
  fov: 35,
  z: 14,
  aspect: 16 / 10, // the scene box's CSS aspect ratio
  near: 0.1,
  far: 100,
} as const;

// Motion and look. design.md mirrors these values; keep it in step.
export const SCENE = {
  swayDeg: 18, // ± around the vertical axis through the origin
  swayPeriod: 20, // s for one full back and forth
  tiltDeg: 3, // ± around the horizontal axis through the origin
  tiltPeriod: 26, // s
  fps: 30,
  maxFrameStep: 0.1, // s; the clock never advances more than this per frame
  fadeMs: 300, // canvas crossfade
  nodeSize: 0.011, // dot diameter as a fraction of the box width
  pulseSize: 0.008, // pulse dot diameter, same unit
  edgeOpacity: 0.45, // muted edges
  pulseSpeed: 1.2, // s to cross one edge, whatever its length
  firstPulseDelay: 1, // s of clock time after the first render
  pulseGap: 1.6, // s of clock time between pulse starts
  maxPulses: 2,
  pixelRatioCap: 2,
  minWidth: 1024, // px; below this the loader never imports the scene
} as const;

const DEG = Math.PI / 180;

// Where a node lands in a 0..1 box (top left origin), rotated like the Three.js
// default Euler order XYZ (the Y rotation reaches the point first, then X), then
// projected through CAMERA. Must stay in step with the camera scene.ts builds.
export function project(node: GraphNode, rotY = 0, rotX = 0): { x: number; y: number } {
  const x1 = node.x * Math.cos(rotY) + node.z * Math.sin(rotY);
  const z1 = -node.x * Math.sin(rotY) + node.z * Math.cos(rotY);
  const y2 = node.y * Math.cos(rotX) - z1 * Math.sin(rotX);
  const z2 = node.y * Math.sin(rotX) + z1 * Math.cos(rotX);
  const f = 1 / Math.tan((CAMERA.fov * DEG) / 2);
  const d = CAMERA.z - z2;
  const ndcX = ((f / CAMERA.aspect) * x1) / d;
  const ndcY = (f * y2) / d;
  return { x: (ndcX + 1) / 2, y: (1 - ndcY) / 2 };
}

// Every AC-5 rule. HeroScene.astro calls this, so a broken graph fails the build.
export function assertGraph(graph: Graph): void {
  const fail = (message: string): never => {
    throw new Error(`graph.ts: ${message}`);
  };
  const { nodes, edges } = graph;
  if (nodes.length < 15 || nodes.length > 25)
    fail(`needs 15 to 25 nodes, has ${String(nodes.length)}.`);

  const byId = new Map<string, GraphNode>();
  for (const node of nodes) {
    if (byId.has(node.id)) fail(`node id "${node.id}" is used twice.`);
    byId.set(node.id, node);
    if (Math.abs(node.z) > 1.5) fail(`node "${node.id}" has z ${String(node.z)}, outside ±1.5.`);
  }

  const xs = nodes.map((node) => node.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const starts = nodes.filter((node) => node.x === minX);
  const ends = nodes.filter((node) => node.x === maxX);
  if (starts.length !== 1) fail('needs exactly one start node (smallest x).');
  if (ends.length !== 1) fail('needs exactly one end node (largest x).');
  const [start] = starts;
  const [end] = ends;

  const next = new Map<string, string[]>(nodes.map((node) => [node.id, []]));
  const prev = new Map<string, string[]>(nodes.map((node) => [node.id, []]));
  for (const { from, to } of edges) {
    const a = byId.get(from) ?? fail(`edge ${from}→${to} starts at an unknown node.`);
    const b = byId.get(to) ?? fail(`edge ${from}→${to} ends at an unknown node.`);
    if (a.x >= b.x) fail(`edge ${from}→${to} must go from a lower x to a higher x.`);
    next.get(from)?.push(to);
    prev.get(to)?.push(from);
  }

  const reach = (origin: string, links: Map<string, string[]>): Set<string> => {
    const seen = new Set([origin]);
    const queue = [origin];
    for (let id = queue.pop(); id !== undefined; id = queue.pop()) {
      for (const other of links.get(id) ?? []) {
        if (!seen.has(other)) {
          seen.add(other);
          queue.push(other);
        }
      }
    }
    return seen;
  };
  const fromStart = reach(start.id, next);
  const toEnd = reach(end.id, prev);
  for (const node of nodes) {
    if (!fromStart.has(node.id)) fail(`node "${node.id}" cannot be reached from the start.`);
    if (!toEnd.has(node.id)) fail(`node "${node.id}" does not reach the end.`);
  }

  const centroid = ['x', 'y', 'z'].map(
    (axis) => nodes.reduce((sum, node) => sum + node[axis as 'x' | 'y' | 'z'], 0) / nodes.length,
  );
  if (centroid.some((value) => Math.abs(value) > 0.05)) {
    fail(
      `the node centroid (${centroid.map((v) => v.toFixed(3)).join(', ')}) must sit within 0.05 of the origin.`,
    );
  }

  const margin = 0.08;
  for (const sway of [-SCENE.swayDeg, SCENE.swayDeg]) {
    for (const tilt of [-SCENE.tiltDeg, SCENE.tiltDeg]) {
      for (const node of nodes) {
        const { x, y } = project(node, sway * DEG, tilt * DEG);
        if (x < margin || x > 1 - margin || y < margin || y > 1 - margin) {
          fail(
            `node "${node.id}" comes within 8% of the box edge at sway ${String(sway)}° and tilt ${String(tilt)}°.`,
          );
        }
      }
    }
  }
}
