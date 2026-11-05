// The live dotted portrait in the hero (spec 0014): Abed's photo drawn as dots on a
// canvas, with eyes and head that follow the pointer. Adapted from the approved
// reference (docs/design/handoff/reference/dotted-portrait.ts). This is the only
// file that imports portrait-dots.json; the loader reaches it only through import(),
// so neither lands in the JavaScript a page loads up front.
//
// The server HTML holds a [data-portrait] container with the still image. init()
// adds a transparent canvas over it, fades it in once its first frame is drawn, and
// moves the image's label onto the canvas. Any failure leaves the still image alone.
import data from './portrait-dots.json';

// `check:bundle` finds this module by this exact text (spec 0014 AC-9).
const WARNING = 'abed-dotted-portrait: the live portrait could not start; the still image stays.';

interface PortraitEye {
  // Eye centre, as a fraction of the canvas width (0 to 1).
  x: number;
  y: number;
  // Measured half width and half height of the eye opening, as a fraction of the width.
  rx: number;
  ry: number;
  // Measured iris radius, as a fraction of the width.
  ir: number;
}

interface PortraitData {
  // The dot grid is n by n.
  n: number;
  // Dot strength per cell, 0 to 255, row by row.
  v: number[];
  // Depth per cell, 0 to 255, used for the head turn parallax.
  d: number[];
  eyes: PortraitEye[];
}

// Typed here, so a regenerated data file with a different shape fails the type check.
const portraitData: PortraitData = data;

interface Colors {
  dot: string;
  sclera: string;
  pupil: string;
}

interface Vec {
  x: number;
  y: number;
}

// Approved tuning values, copied unchanged from the reference. Change them only
// with Abed's approval.
const TUNING = {
  dotRadius: 0.52, // dot radius at full strength, as a fraction of the grid step
  dotGamma: 0.75, // radius = dotRadius * strength ^ dotGamma
  minStrength: 0.03, // cells below this draw nothing
  eyeWidthScale: 0.84, // natural eye opening: measured rx * 0.84
  eyeHalfHeight: 0.0085, // natural eye opening half height, fraction of width
  irisRadius: 0.0105, // fraction of width
  eyeCutoutX: 1.08, // photo dots are skipped inside the eye ellipse scaled by these factors
  eyeCutoutY: 1.25,
  scleraDot: 0.55, // sclera dot radius, as a fraction of its own step (step = eye half height / 2)
  irisTravelX: 0.38, // iris travel, as a fraction of the eye half width
  irisTravelY: 0.7, // iris travel, as a fraction of the eye half height
  lidOpenUp: 0.22, // eye opens 22% wider when looking up
  lidCloseDown: 0.3, // eye opens 30% less when looking down
  eyeShiftY: 0.15, // the eye centre moves 15% of its half height with the gaze
  headShiftX: 0.024, // head turn parallax at full depth, fraction of width
  headShiftY: 0.026,
  eyeEase: 0.22, // per frame: eyes move first
  headEase: 0.09, // per frame: the head follows a moment later
  settle: 0.003, // stop the animation loop below this total movement
  aimRange: 0.7, // pointer distance (fraction of width) that gives a full look
  aimOriginY: 0.33, // the gaze is measured from eye height (fraction of the canvas height)
  touchHoldMs: 1600, // after a tap, look at it for this long, then look back at the visitor
} as const;

// Colors live only in global.css; Tailwind emits the theme colors as :root variables.
function readColors(): Colors | undefined {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => style.getPropertyValue(name).trim();
  const colors = {
    dot: read('--color-fg'),
    sclera: read('--color-portrait-sclera'),
    pupil: read('--color-bg'),
  };
  return colors.dot && colors.sclera && colors.pupil ? colors : undefined;
}

// Draws the portrait on `canvas` and follows the pointer. Calls `onReady` once,
// after the first frame that is actually drawn. Returns the cleanup.
function mountDottedPortrait(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  portrait: PortraitData,
  colors: Colors,
  lookTargets: readonly HTMLElement[],
  onReady: () => void,
): () => void {
  // The loader never loads this module with reduced motion on; kept only as a guard.
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const n = portrait.n;
  const cell = (arr: readonly number[], i: number, j: number): number =>
    (arr[j * n + i] ?? 0) / 255;

  const eyes = portrait.eyes.map((e) => {
    const i = Math.min(n - 1, Math.floor(e.x * n));
    const j = Math.min(n - 1, Math.floor(e.y * n));
    return {
      x: e.x,
      y: e.y,
      rx: e.rx * TUNING.eyeWidthScale,
      ry: TUNING.eyeHalfHeight,
      ir: TUNING.irisRadius,
      depth: cell(portrait.d, i, j),
    };
  });

  const du: number[] = [];
  const dw: number[] = [];
  const dr: number[] = [];
  const dd: number[] = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const strength = cell(portrait.v, i, j);
      if (strength <= TUNING.minStrength) continue;
      const u = (i + 0.5) / n;
      const w = (j + 0.5) / n;
      const inEye = eyes.some((e) => {
        const ex = (u - e.x) / (e.rx * TUNING.eyeCutoutX);
        const ey = (w - e.y) / (e.ry * TUNING.eyeCutoutY);
        return ex * ex + ey * ey < 1;
      });
      if (inEye) continue;
      du.push(u);
      dw.push(w);
      dr.push(TUNING.dotRadius * Math.pow(strength, TUNING.dotGamma));
      dd.push(cell(portrait.d, i, j));
    }
  }

  const eye: Vec = { x: 0, y: 0 };
  const head: Vec = { x: 0, y: 0 };
  let target: Vec = { x: 0, y: 0 };
  let size = 0;
  let dpr = 1;
  let raf = 0;
  let visible = true;
  let ready = false;
  let focused: HTMLElement | null = null;
  let backTimer = 0;

  const resize = (): void => {
    size = canvas.clientWidth;
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
  };

  const draw = (): void => {
    // Not drawn while the canvas has no size.
    if (!size) return;
    const w = size;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sx = head.x * TUNING.headShiftX * w;
    const sy = head.y * TUNING.headShiftY * w;
    const step = w / n;

    const dots = new Path2D();
    for (let k = 0; k < du.length; k++) {
      const depth = dd[k] ?? 0;
      const x = (du[k] ?? 0) * w + depth * sx;
      const y = (dw[k] ?? 0) * w + depth * sy;
      const r = (dr[k] ?? 0) * step;
      dots.moveTo(x + r, y);
      dots.arc(x, y, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = colors.dot;
    ctx.fill(dots);

    const look = eye.y;
    for (const e of eyes) {
      const rx = e.rx * w;
      const ry =
        e.ry *
        w *
        (1 + TUNING.lidOpenUp * Math.max(0, -look) - TUNING.lidCloseDown * Math.max(0, look));
      const cx = e.x * w + e.depth * sx;
      const cy = e.y * w + e.depth * sy + look * e.ry * w * TUNING.eyeShiftY;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.clip();

      const f = ry * 0.5;
      const sclera = new Path2D();
      for (let y = cy - ry; y <= cy + ry; y += f) {
        for (let x = cx - rx; x <= cx + rx; x += f) {
          const nx = (x - cx) / rx;
          const ny = (y - cy) / ry;
          const dist = nx * nx + ny * ny;
          if (dist > 1) continue;
          const r = f * TUNING.scleraDot * (1 - 0.5 * dist);
          sclera.moveTo(x + r, y);
          sclera.arc(x, y, r, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = colors.sclera;
      ctx.fill(sclera);

      const pr = e.ir * w;
      const px = cx + eye.x * rx * TUNING.irisTravelX;
      const py = cy + eye.y * ry * TUNING.irisTravelY;
      ctx.fillStyle = colors.pupil;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.dot;
      ctx.beginPath();
      ctx.arc(px - pr * 0.45, py - pr * 0.4, Math.max(0.8, pr * 0.14), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (!ready) {
      ready = true;
      onReady();
    }
  };

  const stepFrame = (): void => {
    raf = 0;
    eye.x += (target.x - eye.x) * TUNING.eyeEase;
    eye.y += (target.y - eye.y) * TUNING.eyeEase;
    head.x += (target.x - head.x) * TUNING.headEase;
    head.y += (target.y - head.y) * TUNING.headEase;
    draw();
    const moving =
      Math.abs(target.x - eye.x) +
      Math.abs(target.y - eye.y) +
      Math.abs(target.x - head.x) +
      Math.abs(target.y - head.y);
    if (moving > TUNING.settle && visible) kick();
  };

  // One frame at a time, only while something moves and the canvas is on screen.
  const kick = (): void => {
    if (!raf && visible) raf = requestAnimationFrame(stepFrame);
  };

  const home = (): void => {
    target = { x: 0, y: 0 };
    kick();
  };

  const aimAt = (px: number, py: number): void => {
    const rect = canvas.getBoundingClientRect();
    const dx = px - (rect.left + rect.width * 0.5);
    const dy = py - (rect.top + rect.height * TUNING.aimOriginY);
    const dist = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, dist / (rect.width * TUNING.aimRange));
    target = { x: (dx / dist) * k, y: (dy / dist) * k };
    kick();
  };

  resize();
  draw();

  const resizeObserver = new ResizeObserver(() => {
    resize();
    draw();
  });
  resizeObserver.observe(canvas);

  if (reduce) {
    return () => {
      resizeObserver.disconnect();
    };
  }

  const onMove = (e: PointerEvent): void => {
    if (e.pointerType === 'touch' || focused) return;
    aimAt(e.clientX, e.clientY);
  };
  const onDown = (e: PointerEvent): void => {
    if (e.pointerType !== 'touch') return;
    aimAt(e.clientX, e.clientY);
    window.clearTimeout(backTimer);
    backTimer = window.setTimeout(home, TUNING.touchHoldMs);
  };
  const onOut = (e: PointerEvent): void => {
    // A lifted finger fires pointerout with no relatedTarget right after
    // pointerup; the touch hold timer owns the return, so ignore it here.
    if (e.pointerType === 'touch') return;
    if (!e.relatedTarget) home();
  };
  const onFocus = (e: FocusEvent): void => {
    if (!(e.currentTarget instanceof HTMLElement)) return;
    focused = e.currentTarget;
    const rect = focused.getBoundingClientRect();
    aimAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };
  const onBlur = (): void => {
    focused = null;
    home();
  };

  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (visible) kick();
  });
  intersection.observe(canvas);

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('pointerout', onOut);
  for (const el of lookTargets) {
    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
  }

  return () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerout', onOut);
    for (const el of lookTargets) {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    }
    resizeObserver.disconnect();
    intersection.disconnect();
    if (raf) cancelAnimationFrame(raf);
    window.clearTimeout(backTimer);
  };
}

export function init(container: HTMLElement): () => void {
  const image = container.querySelector('img');
  const colors = readColors();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!image || !colors || !ctx) {
    console.warn(WARNING);
    return () => undefined;
  }

  // Hidden from assistive tech until it is drawn, so the label is never read twice.
  canvas.className = 'portrait-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);

  let fade = 0;
  const onReady = (): void => {
    canvas.removeAttribute('aria-hidden');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', image.alt);
    image.setAttribute('aria-hidden', 'true');
    canvas.classList.add('is-ready');
    // Once the canvas covers it (same pose, same dots), the still image steps back, so
    // a turned head never shows the still dots behind it.
    fade = window.setTimeout(() => {
      image.style.opacity = '0';
    }, 300);
  };

  const lookTargets = [...document.querySelectorAll<HTMLElement>('[data-book-cta]')];
  const unmount = mountDottedPortrait(canvas, ctx, portraitData, colors, lookTargets, onReady);

  return () => {
    unmount();
    window.clearTimeout(fade);
    canvas.remove();
    image.removeAttribute('aria-hidden');
    image.style.removeProperty('opacity');
  };
}
