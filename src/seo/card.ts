// The 1200×630 sharing card, drawn at build with Satori (markup to SVG) and sharp
// (SVG to PNG). Text comes from the caller, colors from the tokens. Build only.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { brackets, letters, viewBox } from '@/seo/monogram';
import { readTokens } from '@/seo/tokens';

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;
export const CARD_TYPE = 'image/png';

const FONT_FAMILY = 'Schibsted Grotesk';

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

// Endpoint code runs from temporary build chunks, so resolve from the project root.
function loadFont(weight: 400 | 700) {
  const require = createRequire(path.join(process.cwd(), 'package.json'));
  const file = require.resolve(
    `@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-${String(weight)}-normal.woff`,
  );
  return { name: FONT_FAMILY, data: readFileSync(file), weight, style: 'normal' as const };
}

export async function renderCard({
  name,
  tagline,
  hostname,
}: {
  name: string;
  tagline: string;
  hostname: string;
}): Promise<Buffer> {
  const { bg, fg, muted, accent } = readTokens();

  const monogram: Node = {
    type: 'svg',
    props: {
      viewBox,
      width: 226,
      height: 112,
      children: [
        { type: 'path', props: { d: letters, fill: fg } },
        { type: 'path', props: { d: brackets, fill: accent } },
      ],
    },
  };

  const tree = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      width: `${String(CARD_WIDTH)}px`,
      height: `${String(CARD_HEIGHT)}px`,
      padding: '80px',
      backgroundColor: bg,
      fontFamily: FONT_FAMILY,
    },
    [
      el('div', { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }, [
        monogram,
        el(
          'div',
          {
            display: 'flex',
            marginTop: '48px',
            fontSize: '76px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: fg,
          },
          name,
        ),
        el('div', {
          display: 'flex',
          marginTop: '28px',
          width: '120px',
          height: '6px',
          backgroundColor: accent,
        }),
        el(
          'div',
          {
            display: 'flex',
            marginTop: '28px',
            maxWidth: '900px',
            fontSize: '40px',
            fontWeight: 400,
            lineHeight: 1.3,
            color: muted,
            textWrap: 'balance',
          },
          tagline,
        ),
      ]),
      el('div', { display: 'flex', fontSize: '28px', fontWeight: 400, color: muted }, hostname),
    ],
  );

  const svg = await satori(tree, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [loadFont(400), loadFont(700)],
  });
  return sharp(Buffer.from(svg)).png({ palette: true }).toBuffer();
}
