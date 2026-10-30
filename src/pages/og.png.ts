// The sharing card, written to dist/og.png at build (spec 0011).
import type { APIRoute } from 'astro';
import { site } from '@/content/site';
import { CARD_TYPE, renderCard } from '@/seo/card';

export const GET: APIRoute = async ({ site: origin }) => {
  if (!origin) throw new Error('og.png needs the `site` setting in astro.config.mjs');
  const png = await renderCard({
    tagline: site.meta.card.tagline,
    hostname: origin.hostname,
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': CARD_TYPE } });
};
