// The browser tab icon, written to dist/favicon.svg at build (spec 0011).
import type { APIRoute } from 'astro';
import { iconSvg } from '@/seo/icon';

export const GET: APIRoute = () =>
  new Response(iconSvg({ rounded: true, size: 64 }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
