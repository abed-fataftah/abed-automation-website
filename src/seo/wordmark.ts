// The AUTOMATION wordmark under the monogram, redrawn from the original logo in
// docs/design/assets/ for the sharing card (spec 0011). Logo artwork, not copy.
// No colors here: the card applies them from the tokens.

// The letters on each side of the network O.
export const before = 'AUTOMATI';
export const after = 'N';

// The network O, in a 0 0 100 100 box: a ring with a link and three nodes.
export const viewBox = '0 0 100 100';

export const ring = { cx: 50, cy: 50, r: 38, strokeWidth: 14 };

export const link = { x1: 24, y1: 74, x2: 78, y2: 30, strokeWidth: 6 };

export const nodes = [
  { cx: 24, cy: 74, r: 13 },
  { cx: 51, cy: 52, r: 7 },
  { cx: 78, cy: 30, r: 13 },
];
