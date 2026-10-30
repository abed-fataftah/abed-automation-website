// Spec 0003 rule: colors live only in the @theme block of src/styles/global.css,
// and every approved color pair keeps its WCAG 2.2 contrast target.
// Recomputes each pair from the token values, then scans components, layouts,
// pages, and content for raw color values or arbitrary color classes.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const GLOBAL_CSS = resolve('src/styles/global.css');
const SCAN_DIRS = ['src/components', 'src/layouts', 'src/pages', 'src/content', 'src/seo'];
const SCAN_EXTENSIONS = ['.astro', '.ts', '.css'];

// Foreground on background, minimum ratio: 4.5 for text, 3.0 for non text.
// `line` on `bg` is a decorative divider and is not checked.
const PAIRS = [
  { fg: 'fg', bg: 'bg', min: 4.5 },
  { fg: 'muted', bg: 'bg', min: 4.5 },
  { fg: 'accent', bg: 'bg', min: 3.0 },
  { fg: 'on-accent', bg: 'accent', min: 4.5 },
  { fg: 'on-accent', bg: 'accent-hover', min: 4.5 },
  { fg: 'on-accent', bg: 'accent-pressed', min: 4.5 },
  { fg: 'bg', bg: 'fg', min: 4.5 },
];

const errors = [];

// Replace each match with spaces, keeping newlines, so line numbers still line up.
function blank(text, pattern) {
  return text.replace(pattern, (match) => match.replace(/[^\n]/g, ' '));
}

function stripComments(text) {
  let out = blank(text, /\/\*[\s\S]*?\*\//g);
  out = blank(out, /<!--[\s\S]*?-->/g);
  // A `//` after a colon is a URL (https://), not a comment.
  return blank(out, /(?<!:)\/\/[^\n]*/g);
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

// Contrast

function themeBlock(css) {
  const start = /@theme\s*\{/.exec(css);
  if (!start) return undefined;
  let depth = 1;
  for (let i = start.index + start[0].length; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(start.index, i);
  }
  return undefined;
}

function luminance(hex) {
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(full.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

if (!existsSync(GLOBAL_CSS)) {
  console.error('check:design failed: src/styles/global.css not found.');
  process.exit(1);
}

const theme = themeBlock(stripComments(readFileSync(GLOBAL_CSS, 'utf8')));
if (!theme) errors.push('no @theme block found in src/styles/global.css.');

const colors = new Map();
for (const [, name, hex] of (theme ?? '').matchAll(
  /--color-([\w-]+)\s*:\s*#([0-9a-f]{6}|[0-9a-f]{3})\s*;/gi,
)) {
  colors.set(name, hex.toLowerCase());
}

for (const { fg, bg, min } of PAIRS) {
  const missing = [fg, bg].filter((name) => !colors.has(name));
  if (missing.length > 0) {
    errors.push(
      `${fg} on ${bg}: token ${missing.map((n) => `--color-${n}`).join(', ')} not found.`,
    );
    continue;
  }
  const ratio = contrast(colors.get(fg), colors.get(bg));
  if (ratio < min) {
    errors.push(`${fg} on ${bg} is ${ratio.toFixed(2)}, below the ${min.toFixed(1)} target.`);
  }
}

// Raw colors outside global.css

// Anchors and references that look like hex but are not colors: href="#add",
// aria-controls="#..." values, url(#id), and quoted strings such as '#about'.
// A quoted string that is exactly a hex color ('#fff') is still a color.
const ALLOWED_CONTEXTS = [
  /\b(?:href|id|for|aria-[\w-]+)\s*=\s*(["'])[^"'\n]*\1/gi,
  /url\(\s*#[^)]*\)/gi,
  /(["'`])#(?![0-9a-f]{3,8}\1)[a-z][^"'`\n]*\1/gi,
];

const RULES = [
  {
    pattern:
      /\b(?:bg|text|border(?:-[trblxy])?|outline|ring|fill|stroke|decoration)-\[(?:#|rgb|hsl|oklch)/gi,
    reason: 'arbitrary color class',
  },
  { pattern: /(?<![\w&])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi, reason: 'raw hex color' },
  { pattern: /\b(?:rgba?|hsla?|oklch)\(/gi, reason: 'raw color function' },
];

function sourceFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return SCAN_EXTENSIONS.some((ext) => entry.name.endsWith(ext)) ? [path] : [];
  });
}

const files = SCAN_DIRS.flatMap((dir) => sourceFiles(resolve(dir)));
for (const file of files) {
  let text = stripComments(readFileSync(file, 'utf8'));
  for (const context of ALLOWED_CONTEXTS) text = blank(text, context);

  const reported = new Set();
  for (const { pattern, reason } of RULES) {
    for (const match of text.matchAll(pattern)) {
      const line = lineOf(text, match.index);
      if (reported.has(line)) continue;
      reported.add(line);
      errors.push(
        `${relative(process.cwd(), file)}:${line}: ${reason} "${match[0]}". ` +
          'Use a token from src/styles/global.css instead.',
      );
    }
  }
}

if (errors.length > 0) {
  console.error(`check:design failed:\n${errors.map((e) => `  ${e}`).join('\n')}`);
  process.exit(1);
}

console.log(
  `check:design passed: ${PAIRS.length} color pairs meet their targets, ` +
    `${files.length} files hold no raw colors.`,
);
