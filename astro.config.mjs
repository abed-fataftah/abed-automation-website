// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://abedautomation.com',
  // Pages build to `privacy.html`, which Cloudflare Pages serves at `/privacy`
  // with no trailing slash (spec 0014).
  build: { format: 'file' },
  // Lists the built pages; skips the 404 page and the image and icon endpoints.
  integrations: [sitemap()],
  // Schibsted Grotesk, downloaded at build time and served from the site's own domain.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Schibsted Grotesk',
      cssVariable: '--font-schibsted',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      optimizedFallbacks: true,
    },
  ],
  env: {
    schema: {
      // Cloudflare Pages sets these during its builds: CF_PAGES is "1" and
      // CF_PAGES_BRANCH the branch built ("main" for production). Unset locally
      // and in CI. Read at build time only.
      CF_PAGES: envField.string({ context: 'server', access: 'public', optional: true }),
      CF_PAGES_BRANCH: envField.string({ context: 'server', access: 'public', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
