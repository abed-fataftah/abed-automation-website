// Spec 0001 rule, checked per spec 0002: GSAP and Three.js load only through
// dynamic import(), never in the JavaScript a page loads up front.
// Reads every page in dist/, follows static imports from each entry point, and
// fails if any of those chunks contains a library marker. Then measures the
// Three.js scene, loaded later through import(), against a gzipped size budget
// (spec 0009).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = resolve('dist');

// Gzipped KB for the scene's dynamic import closure: the first measured size plus
// about 10%, rounded up to 5 KB, never above 180 (spec 0009). Measured 135.3 KB
// on three 0.186.1.
const SCENE_BUDGET_KB = 150;

const MARKERS = [
  { library: 'GSAP', marker: 'GSAP target' },
  { library: 'Three.js', marker: '__THREE__' },
];

// Attributes may come in any order, quoted with " or ', or unquoted.
const SCRIPT_TAG = /<script\b[^>]*>/gi;
const LINK_TAG = /<link\b[^>]*>/gi;

// Static imports in minified or formatted output. A negative lookbehind keeps
// `import.meta` and identifiers ending in "import" out, and `import(` never
// matches because "(" is not allowed before the specifier.
const STATIC_IMPORT = /(?<![\w$.])import\s*(?:[\w$*{}\s,]+?\s*from\s*)?(["'])([^"']+)\1/g;
const STATIC_REEXPORT =
  /(?<![\w$.])export\s*(?:\*(?:\s*as\s+[\w$]+)?|\{[^}]*\})\s*from\s*(["'])([^"']+)\1/g;
// The minifier writes dynamic import specifiers as template literals, so backticks count.
const DYNAMIC_IMPORT = /(?<![\w$.])import\(\s*(["'`])([^"'`]+)\1\s*\)/g;

function fail(message) {
  console.error(`check:bundle failed: ${message}`);
  process.exit(1);
}

function attr(tag, name) {
  const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i').exec(
    tag,
  );
  return match ? (match[1] ?? match[2] ?? match[3]) : undefined;
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

// Root relative paths resolve against dist/, others against the referring file.
function resolveSpecifier(specifier, fromFile) {
  if (/^(?:[a-z]+:)?\/\//i.test(specifier) || specifier.startsWith('data:')) return undefined;
  const path = specifier.split(/[?#]/)[0];
  return path.startsWith('/') ? join(DIST, path) : resolve(dirname(fromFile), path);
}

function staticTargets(code, file) {
  return [...code.matchAll(STATIC_IMPORT), ...code.matchAll(STATIC_REEXPORT)]
    .map((match) => resolveSpecifier(match[2], file))
    .filter(Boolean);
}

function entryPoints(htmlFile) {
  const html = readFileSync(htmlFile, 'utf8');
  const entries = [];
  for (const [tag] of html.matchAll(SCRIPT_TAG)) {
    const src = attr(tag, 'src');
    if (src && attr(tag, 'type') === 'module') entries.push(src);
  }
  for (const [tag] of html.matchAll(LINK_TAG)) {
    const href = attr(tag, 'href');
    if (href && attr(tag, 'rel')?.split(/\s+/).includes('modulepreload')) entries.push(href);
  }
  return entries.map((src) => resolveSpecifier(src, htmlFile)).filter(Boolean);
}

if (!existsSync(DIST)) fail('dist/ not found. Run `pnpm build` first.');

const pages = htmlFiles(DIST);
const queue = pages.flatMap(entryPoints);
if (queue.length === 0) fail('found no module entry points in dist/, so nothing was checked.');

const seen = new Set();
while (queue.length > 0) {
  const file = queue.pop();
  if (seen.has(file)) continue;
  seen.add(file);
  if (!existsSync(file)) fail(`${relative(DIST, file)} is referenced but missing from dist/.`);

  const code = readFileSync(file, 'utf8');
  for (const { library, marker } of MARKERS) {
    if (code.includes(marker)) {
      fail(
        `${library} found in ${relative(DIST, file)}, which pages load up front. ` +
          'Load it through a dynamic import() (see src/motion/AGENTS.md).',
      );
    }
  }
  queue.push(...staticTargets(code, file));
}

console.log(
  `check:bundle: ${pages.length} pages, ${seen.size} up front chunks, no GSAP or Three.js.`,
);

// Scene budget: an import() target in the up front chunks, plus everything it
// reaches statically, minus what pages already load up front.
function closureOf(target) {
  const files = new Set();
  const pending = [target];
  while (pending.length > 0) {
    const file = pending.pop();
    if (files.has(file) || seen.has(file)) continue;
    if (!existsSync(file)) fail(`${relative(DIST, file)} is referenced but missing from dist/.`);
    files.add(file);
    pending.push(...staticTargets(readFileSync(file, 'utf8'), file));
  }
  return [...files];
}

const dynamicTargets = new Set(
  [...seen].flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(DYNAMIC_IMPORT)]
      .map((match) => resolveSpecifier(match[2], file))
      .filter(Boolean),
  ),
);
const sceneClosure = [...dynamicTargets]
  .map(closureOf)
  .find((files) => files.some((file) => readFileSync(file, 'utf8').includes('__THREE__')));

if (sceneClosure) {
  const bytes = sceneClosure
    .filter((file) => file.endsWith('.js'))
    .reduce((sum, file) => sum + gzipSync(readFileSync(file)).length, 0);
  const kb = (bytes / 1024).toFixed(1);
  if (bytes > SCENE_BUDGET_KB * 1024) {
    fail(`the Three.js scene is ${kb} KB gzipped, over the ${SCENE_BUDGET_KB} KB budget.`);
  }
  console.log(
    `check:bundle passed: Three.js scene ${kb} KB gzipped (budget ${SCENE_BUDGET_KB} KB).`,
  );
} else {
  const home = join(DIST, 'index.html');
  if (existsSync(home) && /\sdata-scene[\s>=]/.test(readFileSync(home, 'utf8'))) {
    fail('the home page has [data-scene] but no dynamic import reaches Three.js.');
  }
  console.log('check:bundle passed: no Three.js scene to measure.');
}
