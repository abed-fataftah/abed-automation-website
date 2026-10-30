// Spec 0011 rule: search and sharing metadata, icons, the sharing card, JSON-LD,
// the sitemap, robots.txt, and heading order, checked against dist/ after a build.
// Expected copy comes from site.ts and the origin from the `site` setting.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const { site } = await import('../src/content/site.ts');
const { default: config } = await import('../astro.config.mjs');

const DIST = resolve('dist');
const CARD_MAX_BYTES = 200 * 1024;

const errors = [];

if (!config.site) {
  console.error('check:seo failed: no `site` setting in astro.config.mjs.');
  process.exit(1);
}
const origin = new URL(config.site);
const home = new URL('/', origin).href;
const at = (path) => new URL(path, origin).href;

function read(file) {
  const path = join(DIST, file);
  if (!existsSync(path)) {
    errors.push(`dist/${file}: missing (run pnpm build first)`);
    return undefined;
  }
  return readFileSync(path);
}

function decode(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) =>
    Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [
        key.toLowerCase(),
        decode(value),
      ]),
    ),
  );
}

// Headings, ignoring anything inside <script> or <template> (AC-8).
function checkHeadings(file, html) {
  const visible = html.replace(/<(script|template)\b[\s\S]*?<\/\1>/gi, '');
  const levels = [...visible.matchAll(/<h([1-6])\b/gi)].map(([, level]) => Number(level));
  const h1s = levels.filter((level) => level === 1).length;
  if (h1s !== 1) errors.push(`${file}: expected exactly one <h1>, found ${h1s}`);
  let previous = 0;
  for (const level of levels) {
    if (level > previous + 1) {
      errors.push(`${file}: heading skips from h${previous || '(none)'} to h${level}`);
      break;
    }
    previous = level;
  }
}

function checkPage(file, { title, description, indexable }) {
  const buffer = read(file);
  if (!buffer) return;
  const html = buffer.toString('utf8');
  const metas = tags(html, 'meta');
  const links = tags(html, 'link');
  const meta = (key, value) => metas.filter((m) => m[key] === value);
  const expect = (label, actual, wanted) => {
    if (actual !== wanted) errors.push(`${file}: ${label} is "${actual}", expected "${wanted}"`);
  };
  const one = (label, list) => {
    if (list.length !== 1) errors.push(`${file}: expected one ${label}, found ${list.length}`);
    return list[0];
  };
  const none = (label, list) => {
    if (list.length > 0) errors.push(`${file}: ${label} must not be present`);
  };

  // AC-1
  const titles = [...html.matchAll(/<title>([^<]*)<\/title>/gi)].map(([, t]) => decode(t));
  expect('<title>', titles.length === 1 ? titles[0] : `${titles.length} titles`, title);
  expect(
    'meta description',
    one('meta description', meta('name', 'description'))?.content,
    description,
  );
  const robots = meta('name', 'robots');
  if (indexable) none('meta robots', robots);
  else expect('meta robots', one('meta robots', robots)?.content, 'noindex');

  // AC-2
  const canonicals = links.filter((l) => l.rel === 'canonical');
  if (indexable) expect('canonical', one('canonical', canonicals)?.href, home);
  else none('canonical', canonicals);

  // AC-3
  const og = {
    'og:type': 'website',
    'og:site_name': site.name,
    'og:title': title,
    'og:description': description,
    'og:image': at('/og.png'),
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/png',
    'og:image:alt': site.meta.card.alt,
  };
  for (const [property, wanted] of Object.entries(og)) {
    expect(property, one(property, meta('property', property))?.content, wanted);
  }
  const twitter = {
    'twitter:card': 'summary_large_image',
    'twitter:image:alt': site.meta.card.alt,
  };
  for (const [name, wanted] of Object.entries(twitter)) {
    expect(name, one(name, meta('name', name))?.content, wanted);
  }
  if (indexable) expect('og:url', one('og:url', meta('property', 'og:url'))?.content, home);
  else none('og:url', meta('property', 'og:url'));

  // AC-5
  const icons = {
    'icon /favicon.ico': links.filter((l) => l.rel === 'icon' && l.href === '/favicon.ico'),
    'icon /favicon.svg': links.filter(
      (l) => l.rel === 'icon' && l.href === '/favicon.svg' && l.type === 'image/svg+xml',
    ),
    'apple-touch-icon': links.filter(
      (l) => l.rel === 'apple-touch-icon' && l.href === '/apple-touch-icon.png',
    ),
  };
  for (const [label, list] of Object.entries(icons)) one(`<link> ${label}`, list);

  // AC-6
  const blocks = [
    ...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ];
  if (indexable) {
    if (blocks.length !== 1) {
      errors.push(`${file}: expected one JSON-LD block, found ${blocks.length}`);
    } else {
      checkJsonLd(file, blocks[0][1]);
    }
  } else {
    none('JSON-LD', blocks);
  }

  // AC-8
  checkHeadings(file, html);
}

function checkJsonLd(file, text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    errors.push(`${file}: JSON-LD does not parse (${error.message})`);
    return;
  }
  const graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
  const org = graph.find((node) => node['@type'] === 'Organization');
  const person = graph.find((node) => node['@type'] === 'Person');
  const fail = (reason) => errors.push(`${file}: JSON-LD ${reason}`);
  if (data['@context'] !== 'https://schema.org') fail('@context is not https://schema.org');
  if (!org) return fail('has no Organization');
  if (!person) return fail('has no Person');
  const wanted = [
    ['Organization name', org.name, site.name],
    ['Organization url', org.url, home],
    ['Organization logo', org.logo, at('/apple-touch-icon.png')],
    ['Organization email', org.email, site.footer.email],
    ['Person name', person.name, site.meta.founder],
  ];
  for (const [label, actual, value] of wanted) {
    if (actual !== value) fail(`${label} is "${actual}", expected "${value}"`);
  }
  if (!org['@id'] || org.founder?.['@id'] !== person['@id'])
    fail('Organization founder does not link to the Person @id');
  if (!person['@id'] || person.worksFor?.['@id'] !== org['@id'])
    fail('Person worksFor does not link to the Organization @id');
}

// Width and height from a PNG's IHDR chunk.
function pngSize(buffer) {
  const signature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== signature) return undefined;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function checkPng(file, width, height, maxBytes) {
  const buffer = read(file);
  if (!buffer) return;
  const size = pngSize(buffer);
  if (!size) return errors.push(`dist/${file}: not a PNG`);
  if (size.width !== width || size.height !== height) {
    errors.push(`dist/${file}: is ${size.width}×${size.height}, expected ${width}×${height}`);
  }
  if (maxBytes && buffer.length > maxBytes) {
    errors.push(`dist/${file}: is ${buffer.length} bytes, over the ${maxBytes} byte limit`);
  }
}

// AC-5: one 48×48 PNG in an ICO wrapper, as src/seo/ico.ts writes it.
function checkIco() {
  const buffer = read('favicon.ico');
  if (!buffer) return;
  const fail = (reason) => errors.push(`dist/favicon.ico: ${reason}`);
  if (buffer.length < 22) return fail('too short to be an ICO');
  if (buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) return fail('bad ICO header');
  if (buffer.readUInt16LE(4) !== 1) fail(`holds ${buffer.readUInt16LE(4)} images, expected 1`);
  if (buffer[6] !== 48 || buffer[7] !== 48)
    fail(`entry is ${buffer[6]}×${buffer[7]}, expected 48×48`);
  const length = buffer.readUInt32LE(14);
  const offset = buffer.readUInt32LE(18);
  if (offset + length !== buffer.length)
    return fail('image length and offset do not match the file');
  const size = pngSize(buffer.subarray(offset));
  if (!size) return fail('image is not a PNG');
  if (size.width !== 48 || size.height !== 48)
    fail(`PNG is ${size.width}×${size.height}, expected 48×48`);
}

// AC-7
function checkSitemap() {
  const index = read('sitemap-index.xml')?.toString('utf8');
  if (index && !index.includes(`<loc>${at('/sitemap-0.xml')}</loc>`)) {
    errors.push('dist/sitemap-index.xml: does not list sitemap-0.xml');
  }
  const child = read('sitemap-0.xml')?.toString('utf8');
  if (child) {
    const locs = [...child.matchAll(/<loc>([^<]*)<\/loc>/g)].map(([, loc]) => loc);
    if (locs.length !== 1 || locs[0] !== home) {
      errors.push(`dist/sitemap-0.xml: lists ${JSON.stringify(locs)}, expected only ${home}`);
    }
  }
  const robots = read('robots.txt')?.toString('utf8');
  if (robots) {
    if (!/^User-agent: \*$/m.test(robots) || !/^Allow: \/$/m.test(robots)) {
      errors.push('dist/robots.txt: does not allow everything');
    }
    if (robots.trim().split('\n').at(-1) !== `Sitemap: ${at('/sitemap-index.xml')}`) {
      errors.push('dist/robots.txt: does not end with the Sitemap line');
    }
  }
}

checkPage('index.html', {
  title: site.meta.title,
  description: site.meta.description,
  indexable: true,
});
checkPage('404.html', {
  title: site.notFound.title,
  description: site.meta.description,
  indexable: false,
});
checkPng('og.png', 1200, 630, CARD_MAX_BYTES);
checkPng('apple-touch-icon.png', 180, 180);
checkIco();
const favicon = read('favicon.svg');
if (favicon && !favicon.toString('utf8').startsWith('<svg'))
  errors.push('dist/favicon.svg: not an SVG');
checkSitemap();

if (errors.length > 0) {
  console.error(`check:seo failed:\n${errors.map((e) => `  ${e}`).join('\n')}`);
  process.exit(1);
}

console.log('check:seo: ok (2 pages, card, icons, sitemap, robots.txt)');
