/**
 * Dotted portrait: Abed's photo drawn as dots on a canvas, with eyes and head that follow the
 * pointer. Reference implementation ported from the approved design board
 * (reference/Main.dc.html). It has no dependencies.
 *
 * Load it lazily with a dynamic import() so it stays out of the entry chunk (spec 0001), and show
 * assets/portrait-fallback.png until mountDottedPortrait() has drawn its first frame.
 */

export interface PortraitEye {
  /** Eye centre, as a fraction of the canvas width (0 to 1). */
  x: number;
  y: number;
  /** Measured half width and half height of the eye opening, as a fraction of the width. */
  rx: number;
  ry: number;
  /** Measured iris radius, as a fraction of the width. */
  ir: number;
}

export interface PortraitData {
  /** The dot grid is n by n. */
  n: number;
  /** Dot strength per cell, 0 to 255, row by row. */
  v: number[];
  /** Depth per cell, 0 to 255, used for the head-turn parallax. */
  d: number[];
  eyes: PortraitEye[];
}

export interface PortraitOptions {
  /** Elements the eyes look at while they have keyboard focus: every "Book" call to action. */
  lookTargets?: readonly HTMLElement[];
}

interface Vec {
  x: number;
  y: number;
}

/** Approved tuning values. Change them only with Abed's approval. */
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
  headShiftX: 0.024, // head-turn parallax at full depth, fraction of width
  headShiftY: 0.026,
  eyeEase: 0.22, // per frame: eyes move first
  headEase: 0.09, // per frame: the head follows a moment later
  settle: 0.003, // stop the animation loop below this total movement
  aimRange: 0.7, // pointer distance (fraction of width) that gives a full look
  aimOriginY: 0.33, // the gaze is measured from eye height (fraction of the canvas height)
  touchHoldMs: 1600, // after a tap, look at it for this long, then look back at the visitor
} as const;

export function mountDottedPortrait(
  canvas: HTMLCanvasElement,
  data: PortraitData,
  options: PortraitOptions = {},
): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const style = getComputedStyle(canvas);
  const readColor = (name: string, fallback: string): string =>
    style.getPropertyValue(name).trim() || fallback;
  const dotColor = readColor('--color-portrait-dot', '#F3EEE7');
  const scleraColor = readColor('--color-portrait-sclera', '#CFC8BF');
  const pupilColor = readColor('--color-portrait-pupil', '#1A1816');

  const n = data.n;
  const cell = (arr: readonly number[], i: number, j: number): number => (arr[j * n + i] ?? 0) / 255;

  const eyes = data.eyes.map((e) => {
    const i = Math.min(n - 1, Math.floor(e.x * n));
    const j = Math.min(n - 1, Math.floor(e.y * n));
    return {
      x: e.x,
      y: e.y,
      rx: e.rx * TUNING.eyeWidthScale,
      ry: TUNING.eyeHalfHeight,
      ir: TUNING.irisRadius,
      depth: cell(data.d, i, j),
    };
  });

  const du: number[] = [];
  const dw: number[] = [];
  const dr: number[] = [];
  const dd: number[] = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const strength = cell(data.v, i, j);
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
      dd.push(cell(data.d, i, j));
    }
  }

  const eye: Vec = { x: 0, y: 0 };
  const head: Vec = { x: 0, y: 0 };
  let target: Vec = { x: 0, y: 0 };
  let size = 0;
  let dpr = 1;
  let raf = 0;
  let visible = true;
  let focused: HTMLElement | null = null;
  let backTimer = 0;

  const resize = (): void => {
    size = canvas.clientWidth;
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
  };

  const draw = (): void => {
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
    ctx.fillStyle = dotColor;
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
      ctx.fillStyle = scleraColor;
      ctx.fill(sclera);

      const pr = e.ir * w;
      const px = cx + eye.x * rx * TUNING.irisTravelX;
      const py = cy + eye.y * ry * TUNING.irisTravelY;
      ctx.fillStyle = pupilColor;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(px - pr * 0.45, py - pr * 0.4, Math.max(0.8, pr * 0.14), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
  const targets = options.lookTargets ?? [];
  for (const el of targets) {
    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
  }

  return () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerout', onOut);
    for (const el of targets) {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    }
    resizeObserver.disconnect();
    intersection.disconnect();
    if (raf) cancelAnimationFrame(raf);
    window.clearTimeout(backTimer);
  };
}
