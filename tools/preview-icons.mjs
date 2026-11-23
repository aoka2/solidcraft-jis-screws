// Writes icons-preview.svg: all head icons in one row, for looking at them outside the app.
import { readFileSync, writeFileSync } from 'node:fs';
const ids = ['pan', 'csk', 'truss', 'smallcsk', 'hex', 'flange', 'socket', 'button', 'low', 'ultralow'];
const g = ids.map((id, i) => {
  const inner = readFileSync(new URL(`../icons/${id}.svg`, import.meta.url), 'utf8').replace(/<svg[^>]*>|<\/svg>\n?/g, '');
  return `<g transform="translate(${i * 72 + 4} 4)" color="#444">${inner}</g>`;
}).join('');
writeFileSync(new URL('../icons-preview.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 724 72" width="1448" height="144"><rect width="724" height="72" fill="#fff"/>${g}</svg>\n`);
