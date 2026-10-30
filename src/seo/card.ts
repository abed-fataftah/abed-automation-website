// The 1200×630 sharing card, drawn at build with Satori (markup to SVG) and sharp
// (SVG to PNG). Text comes from the caller, colors from the tokens. Build only.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import {
  brackets,
  height as monogramHeight,
  letters,
  viewBox,
  width as monogramWidth,
} from '@/seo/monogram';
import { readTokens } from '@/seo/tokens';
import * as wordmark from '@/seo/wordmark';

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;
export const CARD_TYPE = 'image/png';

const FONT_FAMILY = 'Schibsted Grotesk';

// The logo lockup, modeled on the original logo in docs/design/assets/.
const MONOGRAM_WIDTH = 300;
const WORDMARK_SIZE = 44;
const WORDMARK_TRACKING = '0.04em';
// Height of a round letter (the O, with overshoot) in Schibsted Grotesk 700 at
// WORDMARK_SIZE, measured on the rendered card. The network O's ring is drawn
// this tall, so it sits on the baseline and reaches the cap line like a letter.
const CAP_HEIGHT = 31;
const RING_EXTENT = 2 * (wordmark.ring.r + wordmark.ring.strokeWidth / 2);
const O_SIZE = Math.round((CAP_HEIGHT * 100) / RING_EXTENT);

interface Node {
  type: string;
  props: Record<string, unknown> & { children?: Node | Node[] | string };
}

function el(
  type: string,
  style: Record<string, unknown>,
  children?: Node['props']['children'],
): Node {
  return { type, props: { style, children } };
}

function circle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return { cx, cy, r };
}

function line({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return { x1, y1, x2, y2 };
}

// Endpoint code runs from temporary build chunks, so resolve from the project root.
function loadFont(weight: 400 | 700) {
  const require = createRequire(path.join(process.cwd(), 'package.json'));
  const file = require.resolve(
    `@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-${String(weight)}-normal.woff`,
  );
  return { name: FONT_FAMILY, data: readFileSync(file), weight, style: 'normal' as const };
}

export async function renderCard({
  tagline,
  hostname,
}: {
  tagline: string;
  hostname: string;
}): Promise<Buffer> {
  const { bg, fg, muted, accent } = readTokens();

  const monogram: Node = {
    type: 'svg',
    props: {
      viewBox,
      width: MONOGRAM_WIDTH,
      height: Math.round((MONOGRAM_WIDTH * monogramHeight) / monogramWidth),
      children: [
        { type: 'path', props: { d: letters, fill: fg } },
        { type: 'path', props: { d: brackets, fill: accent } },
      ],
    },
  };

  // The network O. Node outlines in `bg` cut the ring; the link and then the node
  // fills are painted over them, so the outlines never cut the link or the nodes.
  const networkO: Node = {
    type: 'svg',
    props: {
      viewBox: wordmark.viewBox,
      width: O_SIZE,
      height: O_SIZE,
      children: [
        {
          type: 'circle',
          props: {
            ...circle(wordmark.ring),
            fill: 'none',
            stroke: fg,
            strokeWidth: wordmark.ring.strokeWidth,
          },
        },
        ...wordmark.nodes.map((node) => ({
          type: 'circle',
          props: { ...circle(node), fill: accent, stroke: bg, strokeWidth: 5 },
        })),
        {
          type: 'line',
          props: { ...line(wordmark.link), stroke: accent, strokeWidth: wordmark.link.strokeWidth },
        },
        ...wordmark.nodes.map((node) => ({
          type: 'circle',
          props: { ...circle(node), fill: accent },
        })),
      ],
    },
  };

  const wordmarkRow = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: '20px',
      fontSize: `${String(WORDMARK_SIZE)}px`,
      fontWeight: 700,
      letterSpacing: WORDMARK_TRACKING,
      lineHeight: 1,
      color: fg,
    },
    [
      el('div', { display: 'flex' }, wordmark.before),
      networkO,
      el('div', { display: 'flex' }, wordmark.after),
    ],
  );

  const tree = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      width: `${String(CARD_WIDTH)}px`,
      height: `${String(CARD_HEIGHT)}px`,
      padding: '80px',
      backgroundColor: bg,
      fontFamily: FONT_FAMILY,
    },
    [
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [
          monogram,
          wordmarkRow,
          el(
            'div',
            {
              display: 'flex',
              marginTop: '44px',
              maxWidth: '760px',
              fontSize: '36px',
              fontWeight: 400,
              lineHeight: 1.3,
              color: muted,
              textAlign: 'center',
              textWrap: 'balance',
            },
            tagline,
          ),
        ],
      ),
      el('div', { display: 'flex', fontSize: '26px', fontWeight: 400, color: muted }, hostname),
    ],
  );

  const svg = await satori(tree, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [loadFont(400), loadFont(700)],
  });
  return sharp(Buffer.from(svg)).png({ palette: true }).toBuffer();
}
