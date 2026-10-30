// The home screen icon, written to dist/apple-touch-icon.png at build (spec 0011).
// A full square tile: iOS paints transparent corners black and rounds them itself.
import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { iconSvg } from '@/seo/icon';

export const GET: APIRoute = async () => {
  const png = await sharp(Buffer.from(iconSvg({ rounded: false, size: 180 })))
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
