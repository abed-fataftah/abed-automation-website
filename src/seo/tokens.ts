// Reads the color tokens the card and icons need from src/styles/global.css at
// build, so every hex value stays in that one file (spec 0003). Build only.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const NAMES = ['bg', 'fg', 'muted', 'accent'] as const;

export type TokenName = (typeof NAMES)[number];
export type Tokens = Record<TokenName, string>;

let cached: Tokens | undefined;

export function readTokens(): Tokens {
  if (cached) return cached;
  // Endpoint code runs from temporary build chunks, so resolve from the project root.
  const file = path.resolve(process.cwd(), 'src/styles/global.css');
  const css = readFileSync(file, 'utf8');
  const entries = NAMES.map((name) => {
    const match = new RegExp(`--color-${name}\\s*:\\s*(#[0-9a-f]{3,8})\\s*;`, 'i').exec(css);
    if (!match?.[1]) throw new Error(`Color token --color-${name} not found in ${file}`);
    return [name, match[1]] as const;
  });
  cached = Object.fromEntries(entries) as Tokens;
  return cached;
}
