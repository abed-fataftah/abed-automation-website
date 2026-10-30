// Spec 0004 rule: every string in `site` follows the voice rules of the brief.
// No team wording, prices, promises, placeholders, straight quotes, or hard
// coded years, and the longer lines stay within their length limits.
// Node loads site.ts directly (it strips the types), so site.ts must not import.
const { site } = await import('../src/content/site.ts');

// Full paths exempt from the text rules; each has its own check below.
const SKIP_PATHS = new Set(['bookingUrl', 'analytics', 'privacy.updated']);

const RULES = [
  { name: 'team-wording', pattern: /\b(?:we|we’re|we’ll|our|ours|us|team)\b/gi },
  { name: 'price', pattern: /[$€£¥]/g },
  { name: 'price', pattern: /\b(?:usd|eur|price|prices|pricing|rate|rates|per hour|discount)\b/gi },
  { name: 'promise', pattern: /\b(?:guarantee|guaranteed|guarantees|proven|roi)\b/gi },
  { name: 'promise', pattern: /100%/g },
  { name: 'placeholder', pattern: /[[\]]/g },
  { name: 'placeholder', pattern: /\b(?:todo|tbd|lorem|sample copy)\b/gi },
  { name: 'straight-quote', pattern: /['"]/g },
  { name: 'hard-year', pattern: /\b(?:19|20)\d{2}\b/g },
];

// Character limits. A key that is an object (the split heading) is measured
// with its parts joined.
const MAX_LENGTH = {
  'home.heading': 80,
  'home.intro': 120,
  'services.automation.body': 230,
  'services.web.body': 230,
  'finalCta.title': 70,
  'finalCta.body': 140,
};

const errors = [];

function strings(value, path) {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, i) => strings(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => {
      const childPath = path ? `${path}.${key}` : key;
      return SKIP_PATHS.has(childPath) ? [] : strings(child, childPath);
    });
  }
  return [];
}

function valueAt(path) {
  return path.split('.').reduce((node, key) => node?.[key], site);
}

const leaves = strings(site, '');
for (const [path, text] of leaves) {
  for (const { name, pattern } of RULES) {
    for (const match of text.matchAll(pattern)) {
      errors.push(`${path}: ${name} "${match[0]}"`);
    }
  }
}

if (!site.footer?.copyright?.includes('{year}')) {
  errors.push('footer.copyright: missing the {year} token');
}

// Spec 0006 rule: the tools line is never empty, never repeats a name, and
// never reads like a partnership or endorsement.
const ENDORSEMENT =
  /\b(?:partner|partners|partnered|partnership|certified|official|endorsed|endorsement|sponsor|sponsored|affiliate|affiliated)\b/gi;
const toolItems = site.tools?.items;
if (!Array.isArray(toolItems) || toolItems.length === 0) {
  errors.push('tools.items: empty');
} else {
  const seen = new Set();
  for (const item of toolItems) {
    const key = String(item).toLowerCase();
    if (seen.has(key)) errors.push(`tools.items: duplicate "${item}"`);
    seen.add(key);
  }
}
for (const [path, text] of strings(site.tools, 'tools')) {
  for (const match of text.matchAll(ENDORSEMENT)) {
    errors.push(`${path}: endorsement "${match[0]}"`);
  }
}

// Spec 0007 rule: the privacy date is a real calendar date, and every outside
// link in the notice is https.
const updated = site.privacy?.updated;
const updatedDate = new Date(`${updated}T00:00:00Z`);
if (
  typeof updated !== 'string' ||
  !/^\d{4}-\d{2}-\d{2}$/.test(updated) ||
  Number.isNaN(updatedDate.getTime()) ||
  updatedDate.toISOString().slice(0, 10) !== updated
) {
  errors.push(`privacy.updated: not a real YYYY-MM-DD date "${updated}"`);
}
(site.privacy?.sections ?? []).forEach((section, i) => {
  section.body.forEach((part, j) => {
    if (typeof part === 'object' && 'href' in part && !part.href.startsWith('https://')) {
      errors.push(
        `privacy.sections[${i}].body[${j}].href: must start with https:// "${part.href}"`,
      );
    }
  });
});

for (const [path, max] of Object.entries(MAX_LENGTH)) {
  const value = valueAt(path);
  const text = typeof value === 'object' && value ? Object.values(value).join('') : value;
  if (typeof text !== 'string') {
    errors.push(`${path}: not found`);
  } else if (text.length > max) {
    errors.push(`${path}: too long (${text.length} > ${max})`);
  }
}

if (errors.length > 0) {
  console.error(`check:copy failed:\n${errors.map((e) => `  ${e}`).join('\n')}`);
  process.exit(1);
}

console.log(`check:copy: ok (${leaves.length} strings)`);
