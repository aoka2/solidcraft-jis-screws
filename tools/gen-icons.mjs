// Writes icons/<head>.svg: a side-view silhouette of each head on a threaded shank.
// SolidCraft icon rules: 64x64 viewBox, absolute M/L/Q/Z paths, currentColor, no text or styles.
import { mkdirSync, writeFileSync } from 'node:fs';

// Head outlines; the y of the head's underside is where the shank starts.
// Cross-recess heads get a V notch on top, socket heads a square one.
const heads = {
  pan: { under: 26, d: 'M12 26 L12 16 Q12 10 18 10 L28 10 L32 14 L36 10 L46 10 Q52 10 52 16 L52 26 Z' },
  csk: { under: 30, d: 'M8 12 L28 12 L32 16 L36 12 L56 12 L38 30 L26 30 Z' },
  truss: { under: 24, d: 'M5 24 L5 21 Q14 12 28 11 L32 15 L36 11 Q50 12 59 21 L59 24 Z' },
  smallcsk: { under: 28, d: 'M14 16 L29 16 L32 19 L35 16 L50 16 L38 28 L26 28 Z' },
  hex: { under: 26, d: 'M12 12 L14 10 L22 10 L22 26 L12 26 Z M24 10 L40 10 L40 26 L24 26 Z M42 10 L50 10 L52 12 L52 26 L42 26 Z' },
  flange: { under: 28, d: 'M14 12 L16 10 L22 10 L22 21 L14 21 Z M24 10 L40 10 L40 21 L24 21 Z M42 10 L48 10 L50 12 L50 21 L42 21 Z M6 28 L6 25 L12 21 L52 21 L58 25 L58 28 Z' },
  socket: { under: 28, d: 'M16 28 L16 10 Q16 8 18 8 L27 8 L27 12 L37 12 L37 8 L46 8 Q48 8 48 10 L48 28 Z' },
  button: { under: 24, d: 'M10 24 L10 21 Q14 9 27 7 L27 10 L37 10 L37 7 Q50 9 54 21 L54 24 Z' },
  low: { under: 26, d: 'M16 26 L16 16 Q16 14 18 14 L27 14 L27 17 L37 17 L37 14 L46 14 Q48 14 48 16 L48 26 Z' },
  ultralow: { under: 26, d: 'M10 26 L10 22 Q10 21 12 21 L28 21 L28 23 L36 23 L36 21 L52 21 Q54 21 54 22 L54 26 Z' },
};

// Shank from the head down to y 60, its sides zigzagged for the thread.
function shank(top) {
  const pts = [];
  for (let y = top, i = 0; y <= 60; y += 3, i++) pts.push([i % 2 ? 37 : 39, Math.min(y, 60)]);
  const right = pts.map(([x, y]) => `L${x} ${y}`).join(' ');
  const left = pts.slice().reverse().map(([x, y]) => `L${64 - x} ${y}`).join(' ');
  return `M${64 - 38} ${top} L38 ${top} ${right} L38 60 L26 60 ${left} Z`;
}

mkdirSync(new URL('../icons/', import.meta.url), { recursive: true });
for (const [id, h] of Object.entries(heads)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">`
    + `<path fill="currentColor" d="${h.d}"/>`
    + `<path fill="currentColor" opacity="0.6" d="${shank(h.under)}"/></svg>\n`;
  writeFileSync(new URL(`../icons/${id}.svg`, import.meta.url), svg);
}
console.log(`icons: ${Object.keys(heads).length}`);
