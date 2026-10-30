// The site icon: the monogram on a dark tile, as an SVG string. Width and height
// are the target pixel size, so sharp draws each PNG at its size instead of
// scaling up a small one. Build only.
import { brackets, height, letters, width } from '@/seo/monogram';
import { readTokens } from '@/seo/tokens';

const BOX = 64;
const MARK_WIDTH = 52;
const MARK_X = (BOX - MARK_WIDTH) / 2;
const MARK_Y = (BOX - (MARK_WIDTH * height) / width) / 2;
const SCALE = MARK_WIDTH / width;

export function iconSvg({ rounded, size }: { rounded: boolean; size: number }): string {
  const { bg, fg, accent } = readTokens();
  const radius = rounded ? ' rx="12"' : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(size)}" height="${String(size)}" viewBox="0 0 ${String(BOX)} ${String(BOX)}">` +
    `<rect width="${String(BOX)}" height="${String(BOX)}"${radius} fill="${bg}"/>` +
    `<g transform="translate(${String(MARK_X)} ${MARK_Y.toFixed(2)}) scale(${SCALE.toFixed(5)})">` +
    `<path fill="${fg}" d="${letters}"/>` +
    `<path fill="${accent}" d="${brackets}"/>` +
    `</g></svg>`
  );
}
