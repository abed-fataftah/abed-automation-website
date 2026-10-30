// The only motion code in the initial page. It waits until the page has loaded
// and the browser is idle, then fetches GSAP and the Three.js scene only when
// the visitor's settings and connection allow them. The static page never
// depends on anything loaded here.

import { SCENE } from './graph';

type Cleanup = () => void;

// navigator.connection exists only in Chromium, so it is typed locally.
interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const cleanups: Cleanup[] = [];
let stopped = false;

function onLoadFailure(what: string, error: unknown): void {
  console.warn(`${what} could not load; the page stays static.`, error);
}

function isSlowConnection(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (!connection) return false;
  return (
    connection.saveData === true ||
    connection.effectiveType === '2g' ||
    connection.effectiveType === 'slow-2g'
  );
}

// Pages without motion hooks (the 404 page) never download GSAP.
function hasMotionHooks(): boolean {
  return document.querySelector('[data-reveal], [data-line], [data-underline]') !== null;
}

function stopAll(): void {
  stopped = true;
  while (cleanups.length > 0) cleanups.pop()?.();
}

async function startGsap(): Promise<void> {
  try {
    const { init } = await import('./gsap');
    if (stopped) return;
    cleanups.push(init(document.body));
  } catch (error) {
    onLoadFailure('Motion', error);
  }
}

async function startScene(container: HTMLElement): Promise<void> {
  try {
    const { init } = await import('./scene');
    if (stopped) return;
    cleanups.push(init(container));
  } catch (error) {
    onLoadFailure('The 3D scene', error);
  }
}

function watchScene(): void {
  const container = document.querySelector<HTMLElement>('[data-scene]');
  if (!container || isSlowConnection()) return;
  // Phones and tablets keep the static drawing and never download Three.js. Read once:
  // widening the window later keeps the drawing, narrowing it keeps a running scene.
  if (!window.matchMedia(`(min-width: ${String(SCENE.minWidth)}px)`).matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void startScene(container);
    },
    { rootMargin: '200px' },
  );
  observer.observe(container);
  cleanups.push(() => {
    observer.disconnect();
  });
}

function start(): void {
  if (reducedMotion.matches) return;

  // Turning reduced motion on mid visit stops everything; turning it off does not restart.
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) stopAll();
  });

  if (hasMotionHooks()) void startGsap();
  watchScene();
}

function whenIdle(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

if (document.readyState === 'complete') {
  whenIdle(start);
} else {
  window.addEventListener(
    'load',
    () => {
      whenIdle(start);
    },
    { once: true },
  );
}
