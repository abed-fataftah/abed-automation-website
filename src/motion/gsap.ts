// Scroll motion for the home page (spec 0008). This is the only file that imports
// GSAP; the loader reaches it through a dynamic import, after the page is idle.
// Components mark what moves with data attributes, and every starting state is
// set here at runtime, never in CSS, so the page is complete without this file.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// The single source for every motion value; design.md section "Motion" mirrors it.
const MOTION = {
  duration: 0.5,
  lineDuration: 0.6,
  ease: 'power2.out',
  distance: { base: 16, small: 12 }, // px; small applies below 640px
  stagger: { base: 0.08, small: 0.05 }, // s
  start: 'top 85%',
} as const;

const QUERIES = { small: '(max-width: 639.98px)', base: '(min-width: 640px)' };

// Wraps a callback so the tweens it creates later join the matchMedia context.
type Wrap = <F extends (...args: never[]) => void>(func: F) => F;

// Anything on screen when a setup run starts stays static (AC-4).
function startsBelowFold(element: Element): boolean {
  return element.getBoundingClientRect().top >= window.innerHeight;
}

function byPageOrder(a: Element, b: Element): number {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

// One run per breakpoint. Everything created here, including tweens started later
// by wrapped callbacks, belongs to the matchMedia context, so its revert restores
// the static page. Returns the listener cleanup the context calls on revert.
function setup(root: HTMLElement, small: boolean, safe: Wrap): () => void {
  const distance = small ? MOTION.distance.small : MOTION.distance.base;
  const stagger = small ? MOTION.stagger.small : MOTION.stagger.base;

  // Targets that have a starting state and have not finished, with their trigger.
  const waiting = new Map<HTMLElement, ScrollTrigger | undefined>();

  const finish = safe((element: HTMLElement) => {
    waiting.get(element)?.kill();
    waiting.delete(element);
    gsap.killTweensOf(element);
    gsap.set(element, {
      clearProps: element.hasAttribute('data-line') ? '--line-scale' : 'opacity,transform',
    });
  });

  const reveal = safe((targets: HTMLElement[]) => {
    targets.sort(byPageOrder).forEach((element, i) => {
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: MOTION.duration,
        ease: MOTION.ease,
        delay: i * stagger,
        clearProps: 'opacity,transform',
        onComplete: () => waiting.delete(element),
      });
    });
  });

  const hide = (element: HTMLElement) => {
    gsap.set(element, { opacity: 0, y: distance });
    waiting.set(element, undefined);
  };

  // Groups with items animate only their items; the rest animate as one block.
  const groups = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
  const items: HTMLElement[] = [];
  for (const group of groups) {
    const groupItems = [...group.querySelectorAll<HTMLElement>('[data-reveal-item]')];
    if (groupItems.length > 0) {
      items.push(...groupItems.filter(startsBelowFold));
    } else if (startsBelowFold(group)) {
      hide(group);
      waiting.set(
        group,
        ScrollTrigger.create({
          trigger: group,
          start: MOTION.start,
          once: true,
          onEnter: () => {
            reveal([group]);
          },
        }),
      );
    }
  }

  items.forEach(hide);
  const itemTriggers = ScrollTrigger.batch(items, {
    start: MOTION.start,
    once: true,
    onEnter: (targets) => {
      reveal(targets as HTMLElement[]);
    },
  });
  items.forEach((item, i) => waiting.set(item, itemTriggers[i]));

  for (const line of root.querySelectorAll<HTMLElement>('[data-line]')) {
    if (!startsBelowFold(line)) continue;
    gsap.set(line, { '--line-scale': 0 });
    waiting.set(
      line,
      ScrollTrigger.create({
        trigger: line,
        start: MOTION.start,
        once: true,
        onEnter: safe(() => {
          gsap.to(line, {
            '--line-scale': 1,
            duration: MOTION.lineDuration,
            ease: MOTION.ease,
            clearProps: '--line-scale',
            onComplete: () => waiting.delete(line),
          });
        }),
      }),
    );
  }

  // The hero underline resets while the hero is off screen above, and redraws
  // each time the hero comes back into view (AC-7).
  const underline = root.querySelector<HTMLElement>('[data-underline]');
  const hero = underline?.closest('section');
  if (underline && hero) {
    const reset = safe(() => {
      gsap.killTweensOf(underline);
      gsap.set(underline, { '--underline-scale': 0 });
    });
    if (hero.getBoundingClientRect().bottom < 0) reset();
    ScrollTrigger.create({
      trigger: hero,
      start: 'top bottom',
      end: 'bottom top',
      onLeave: reset,
      onEnterBack: safe(() => {
        gsap.fromTo(
          underline,
          { '--underline-scale': 0 },
          {
            '--underline-scale': 1,
            duration: MOTION.lineDuration,
            ease: MOTION.ease,
            clearProps: '--underline-scale',
          },
        );
      }),
    });
  }

  // Focus inside a waiting group finishes it and its section line at once (AC-9).
  const onFocusIn = (event: FocusEvent) => {
    if (!(event.target instanceof Element)) return;
    const group = event.target.closest<HTMLElement>('[data-reveal]');
    const line = event.target.closest<HTMLElement>('[data-line]');
    if (group) {
      [group, ...group.querySelectorAll<HTMLElement>('[data-reveal-item]')]
        .filter((element) => waiting.has(element))
        .forEach(finish);
    }
    if (line && waiting.has(line)) finish(line);
  };

  // Printing shows everything; global.css also forces this for browsers that
  // skip beforeprint (AC-10).
  const onBeforePrint = safe(() => {
    [...waiting.keys()].forEach(finish);
    if (underline) {
      gsap.killTweensOf(underline);
      gsap.set(underline, { clearProps: '--underline-scale' });
    }
  });

  root.addEventListener('focusin', onFocusIn);
  window.addEventListener('beforeprint', onBeforePrint);
  return () => {
    root.removeEventListener('focusin', onFocusIn);
    window.removeEventListener('beforeprint', onBeforePrint);
  };
}

export function init(root: HTMLElement): () => void {
  const mm = gsap.matchMedia();
  let started = false;
  let failure: { error: unknown } | undefined;

  // GSAP leaves its current context set if a setup function throws, so errors
  // are caught inside and the revert happens outside the context (AC-11).
  mm.add(QUERIES, (context, contextSafe) => {
    const wrap: Wrap = (func) => (contextSafe ? (contextSafe(func) as typeof func) : func);
    try {
      return setup(root, context.conditions?.small === true, wrap);
    } catch (error) {
      if (!started) {
        failure = { error };
        return undefined;
      }
      // A rerun after a resize: nothing above can catch it, so revert here.
      queueMicrotask(() => {
        mm.revert();
        console.warn('Motion stopped; the page stays static.', error);
      });
      return undefined;
    }
  });
  started = true;

  if (failure) {
    mm.revert();
    throw new Error('Motion setup failed and was reverted.', { cause: failure.error });
  }
  return () => {
    mm.revert();
  };
}
