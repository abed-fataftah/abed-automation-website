// The fallback tab icon for browsers without SVG icons, written to
// dist/favicon.ico at build (spec 0011): one 48×48 PNG in an ICO wrapper.
import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { pngToIco } from '@/seo/ico';
import { iconSvg } from '@/seo/icon';

const SIZE = 48;

export const GET: APIRoute = async () => {
  const png = await sharp(Buffer.from(iconSvg({ rounded: true, size: SIZE })))
    .png()
    .toBuffer();
  return new Response(pngToIco(png, SIZE), { headers: { 'Content-Type': 'image/x-icon' } });
};
