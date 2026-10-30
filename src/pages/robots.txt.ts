// robots.txt, written at build so the domain lives only in astro.config.mjs (spec 0011).
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site: origin }) => {
  if (!origin) throw new Error('robots.txt needs the `site` setting in astro.config.mjs');
  const sitemap = new URL('/sitemap-index.xml', origin).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
