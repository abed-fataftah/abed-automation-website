// Spec 0012 rule: the live site serves only what the build produced. Compares the
// script and iframe tags of the live / and a missing path with dist/index.html and
// dist/404.html, so a host that injects a badge, snippet, or rewrite fails the
// check. Needs the network; run it after `CF_PAGES=1 CF_PAGES_BRANCH=main pnpm build`.
// The base URL is the `site` setting, or LIVE_URL to check another address.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const { default: config } = await import('../astro.config.mjs');

const DIST = resolve('dist');
const MISSING_PATH = '/__live-check-404';
const TIMEOUT_MS = 15_000;
const RETRY_AFTER_MS = 30_000;

const base = process.env.LIVE_URL || config.site;
if (!base) {
  console.error('check:live failed: no `site` setting in astro.config.mjs and no LIVE_URL.');
  process.exit(1);
}

const errors = [];

function attribute(tag, name) {
  const match = tag.match(
    new RegExp(`\\s${name}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?`, 'i'),
  );
  if (!match) return undefined;
  return match[1] ?? match[2] ?? match[3] ?? '';
}

// One fingerprint per script and iframe tag (spec 0012, Fingerprint rules).
function fingerprints(html) {
  const list = [];
  for (const [, open, content] of html.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script>/gi)) {
    const src = attribute(open, 'src');
    if (src !== undefined) {
      list.push(`script src=${src}`);
    } else {
      const type = attribute(open, 'type') || 'classic';
      const hash = createHash('sha256').update(content.trim()).digest('hex').slice(0, 12);
      list.push(`script inline ${type} sha256:${hash}`);
    }
  }
  for (const [tag] of html.matchAll(/<iframe\b[^>]*>/gi)) {
    const src = attribute(tag, 'src');
    const srcdoc = attribute(tag, 'srcdoc');
    list.push(`iframe src=${src || (srcdoc !== undefined ? 'srcdoc' : 'none')}`);
  }
  return list;
}

// Items in `a` that `b` lacks, counting repeats (multiset difference).
function missingFrom(a, b) {
  const left = [...b];
  return a.filter((item) => {
    const index = left.indexOf(item);
    if (index === -1) return true;
    left.splice(index, 1);
    return false;
  });
}

async function fetchOnce(url) {
  const response = await fetch(url, {
    headers: { 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (response.status >= 500) throw new Error(`status ${response.status}`);
  return { status: response.status, headers: response.headers, html: await response.text() };
}

// One retry after a network error, timeout, or 5xx (AC-5).
async function fetchLive(url) {
  try {
    return await fetchOnce(url);
  } catch (error) {
    console.log(`check:live: ${url} failed (${error.message}), retrying in 30 s`);
    await sleep(RETRY_AFTER_MS);
    try {
      return await fetchOnce(url);
    } catch {
      errors.push(`could not reach ${url}`);
      return undefined;
    }
  }
}

async function checkPage(label, url, file, expectedStatus) {
  const path = join(DIST, file);
  if (!existsSync(path)) {
    errors.push(`dist/${file}: missing (run CF_PAGES=1 CF_PAGES_BRANCH=main pnpm build first)`);
    return;
  }
  const built = readFileSync(path, 'utf8');
  const live = await fetchLive(url);
  if (!live) return;

  if (live.status !== expectedStatus) {
    errors.push(`${label}: status ${live.status}, expected ${expectedStatus}`);
  }
  if (live.headers.has('set-cookie')) {
    errors.push(`${label}: response sets a cookie (Set-Cookie header)`);
  }
  if (live.html.includes('/cdn-cgi/') && !built.includes('/cdn-cgi/')) {
    errors.push(`${label}: page contains /cdn-cgi/ (a host rewrite) that the build lacks`);
  }

  const liveItems = fingerprints(live.html);
  const builtItems = fingerprints(built);
  const injected = missingFrom(liveItems, builtItems);
  const differs = missingFrom(builtItems, liveItems);
  if (injected.length > 0) {
    errors.push(`${label}: injected by host:\n${injected.map((i) => `      ${i}`).join('\n')}`);
  }
  if (differs.length > 0) {
    errors.push(
      `${label}: live differs from main:\n${differs.map((i) => `      ${i}`).join('\n')}`,
    );
  }
}

const home = new URL('/', base);
home.searchParams.set('live-check', String(Date.now()));
await checkPage('/', home.href, 'index.html', 200);
await checkPage(MISSING_PATH, new URL(MISSING_PATH, base).href, '404.html', 404);

if (errors.length > 0) {
  console.error(`check:live failed for ${base}:\n${errors.map((e) => `  ${e}`).join('\n')}`);
  process.exit(1);
}

console.log(`check:live: ok (${base}, / and ${MISSING_PATH} match the build)`);
