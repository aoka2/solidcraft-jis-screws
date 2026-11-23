import assert from 'node:assert/strict';
import { HEADS, threadLength, checkInput } from '../src/spec.js';

assert.equal(threadLength(8, 20), 22);    // M8: 2d+6
assert.equal(threadLength(16, 150), 44);  // M16 over 125: 2d+12 (matches Engineers Edge)
assert.equal(threadLength(20, 220), 65);  // over 200: 2d+25
assert.equal(threadLength(20, 125), 46);  // band edge stays in the first band

const hexM8 = checkInput({});
assert.deepEqual([hexM8.head, hexM8.size, hexM8.length, hexM8.thread], ['hex', 'M8', 20, 'auto']);
assert.deepEqual(hexM8.dim, { d: 8, s: 13, k: 5.3 });
const sock = checkInput({ head: 'socket', size: 'M12', length: '40', thread: 'full' });
assert.deepEqual(sock.dim, { d: 12, dk: 18, k: 12, s: 10, t: 6 });
assert.equal(sock.length, 40);

const bads = [{ size: 'M7' }, { length: 0 }, { length: 301 }, { length: 'abc' }, { thread: 'half' },
  { head: 'round' }, { head: 'truss', size: 'M10' }, { head: 'flange', size: 'M3' }, { head: 'csk', size: 'M3', length: 1.5 }];
for (const p of bads) assert.throws(() => checkInput(p), (e) => e.tag === 'invalid-input', JSON.stringify(p));

// Every table row has what its shape needs.
const need = { round: ['dk', 'k'], csk: ['dk', 'k'], hex: ['s', 'k'], flange: ['s', 'dc', 'k', 'k1', 'c'] };
for (const [id, H] of Object.entries(HEADS)) {
  for (const [size, row] of Object.entries(H.sizes)) {
    for (const f of [...need[H.shape], ...(H.recess === 'hex' ? ['s', 't'] : [])]) {
      assert.ok(row[f] > 0, `${id} ${size} ${f}`);
    }
    if (H.recess === 'cross' && H.shape === 'csk') {
      // Same recess numbers as bolt.js: the tapered recess must stay inside the 90 deg head at its bottom.
      const m = row.m ?? 0.55 * row.dk, depth = Math.min(0.45 * m, 0.75 * row.k);
      assert.ok(m / 2 - depth * Math.tan((26.5 * Math.PI) / 180) < row.dk / 2 - depth, `${id} ${size} recess inside head`);
    }
    if (H.recess === 'hex') assert.ok(row.s / Math.sqrt(3) < row.dk / 2 - (H.round ?? 0) * row.k, `${id} ${size} socket fits flat top`);
  }
}
assert.equal(Object.keys(HEADS).length, 10);
console.log('spec ok');
