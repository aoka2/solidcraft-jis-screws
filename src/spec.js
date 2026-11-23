// Head dimensions per head type (mm). d nominal; dk head dia; k head height; s hex across flats
// (head or socket); t socket depth; m cross recess dia (ref); dc/c flange dia/thickness.
// Sources are noted per head; "maker" heads have no JIS table and follow one maker's catalogue.
const D = { M3: 3, M4: 4, M5: 5, M6: 6, M8: 8, M10: 10, M12: 12, M16: 16, M20: 20 };

export const HEADS = {
  // JIS B 1111 / ISO 7045 (Engineers Edge; fasten.it prints dk 6 / 10, k 3.8 for M3 / M5).
  pan: {
    title: 'ナベ', shape: 'round', round: 0.6, recess: 'cross',
    sizes: { M3: { dk: 5.6, k: 2.4, m: 3 }, M4: { dk: 8, k: 3.1, m: 4.4 }, M5: { dk: 9.5, k: 3.7, m: 4.9 },
      M6: { dk: 12, k: 4.6, m: 6.9 }, M8: { dk: 16, k: 6, m: 9 }, M10: { dk: 20, k: 7.5, m: 10.1 } },
  },
  // JIS B 1111 / ISO 7046-1 (fasten.it), 90 deg head.
  csk: {
    title: '皿', shape: 'csk', recess: 'cross',
    sizes: { M3: { dk: 5.5, k: 1.65, m: 3.2 }, M4: { dk: 8.4, k: 2.7, m: 4.6 }, M5: { dk: 9.3, k: 2.7, m: 5.2 },
      M6: { dk: 11.3, k: 3.3, m: 6.8 }, M8: { dk: 15.8, k: 4.65, m: 8.9 }, M10: { dk: 18.3, k: 5, m: 10 } },
  },
  // JIS B 1111 附属書JA (Ikeda Kinzoku table).
  truss: {
    title: 'トラス', shape: 'round', dome: 0.25, recess: 'cross',
    sizes: { M3: { dk: 6.9, k: 1.9, m: 2.9 }, M4: { dk: 9.4, k: 2.5, m: 4.3 }, M5: { dk: 11.8, k: 3.1, m: 5 },
      M6: { dk: 14, k: 3.7, m: 6.3 }, M8: { dk: 17.8, k: 4.8, m: 7.8 } },
  },
  // Maker (Tsuruga 小頭皿 table), 90 deg. shortcut: m is not in the table, 0.55*dk is assumed; replace with a maker value when found.
  smallcsk: {
    title: '小形皿', shape: 'csk', recess: 'cross', maker: true,
    sizes: { M3: { dk: 5, k: 1.3 }, M4: { dk: 6, k: 1.4 }, M5: { dk: 8, k: 1.9 }, M6: { dk: 10, k: 2.4 }, M8: { dk: 12, k: 2.6 } },
  },
  // JIS B 1180 / ISO 4014.
  hex: {
    title: '六角', shape: 'hex', jisLength: true,
    sizes: { M3: { s: 5.5, k: 2 }, M4: { s: 7, k: 2.8 }, M5: { s: 8, k: 3.5 }, M6: { s: 10, k: 4 }, M8: { s: 13, k: 5.3 },
      M10: { s: 16, k: 6.4 }, M12: { s: 18, k: 7.5 }, M16: { s: 24, k: 10 }, M20: { s: 30, k: 12.5 } },
  },
  // JIS B 1189 附属書JA 2種 (Onoue / alumania). k1 = min wrenching height. shortcut: c read from a flattened table.
  flange: {
    title: 'フランジ付き', shape: 'flange', jisLength: true,
    sizes: { M5: { s: 8, dc: 12, k: 5, k1: 3, c: 0.7 }, M6: { s: 10, dc: 14, k: 6, k1: 3.6, c: 0.8 },
      M8: { s: 12, dc: 17.5, k: 8, k1: 4.8, c: 1 }, M10: { s: 14, dc: 21, k: 10, k1: 6, c: 1.2 },
      M12: { s: 17, dc: 25, k: 11.5, k1: 7.2, c: 1.4 }, M16: { s: 22, dc: 33, k: 15, k1: 9.6, c: 1.8 } },
  },
  // JIS B 1176 / ISO 4762 (fasten.it).
  socket: {
    title: '六角穴付き', shape: 'round', recess: 'hex',
    sizes: { M3: { dk: 5.5, k: 3, s: 2.5, t: 1.3 }, M4: { dk: 7, k: 4, s: 3, t: 2 }, M5: { dk: 8.5, k: 5, s: 4, t: 2.5 },
      M6: { dk: 10, k: 6, s: 5, t: 3 }, M8: { dk: 13, k: 8, s: 6, t: 4 }, M10: { dk: 16, k: 10, s: 8, t: 5 },
      M12: { dk: 18, k: 12, s: 10, t: 6 }, M16: { dk: 24, k: 16, s: 14, t: 8 }, M20: { dk: 30, k: 20, s: 17, t: 10 } },
  },
  // ISO 7380-1 (fasten.it).
  button: {
    title: 'ボタン', shape: 'round', dome: 0.2, recess: 'hex',
    sizes: { M3: { dk: 5.7, k: 1.65, s: 2, t: 1.04 }, M4: { dk: 7.6, k: 2.2, s: 2.5, t: 1.3 }, M5: { dk: 9.5, k: 2.75, s: 3, t: 1.56 },
      M6: { dk: 10.5, k: 3.3, s: 4, t: 2.08 }, M8: { dk: 14, k: 4.4, s: 5, t: 2.6 }, M10: { dk: 17.5, k: 5.5, s: 6, t: 3.12 },
      M12: { dk: 21, k: 6.6, s: 8, t: 4.16 }, M16: { dk: 28, k: 8.8, s: 10, t: 5.2 } },
  },
  // Maker (Saima, DIN 7984 table).
  low: {
    title: '低頭', shape: 'round', recess: 'hex', maker: true,
    sizes: { M3: { dk: 5.5, k: 2, s: 2, t: 1.5 }, M4: { dk: 7, k: 2.8, s: 2.5, t: 2.3 }, M5: { dk: 8.5, k: 3.5, s: 3, t: 2.7 },
      M6: { dk: 10, k: 4, s: 4, t: 3 }, M8: { dk: 13, k: 5, s: 5, t: 3.8 }, M10: { dk: 16, k: 6, s: 7, t: 4.5 },
      M12: { dk: 18, k: 7, s: 8, t: 5 }, M16: { dk: 24, k: 9, s: 12, t: 5.5 }, M20: { dk: 30, k: 11, s: 14, t: 7.5 } },
  },
  // Maker (Takayama 六角穴付極低頭ボルト). The socket is deeper than the head, as printed.
  ultralow: {
    title: '極低頭', shape: 'round', recess: 'hex', maker: true,
    sizes: { M3: { dk: 6, k: 1.3, s: 1.5, t: 2 }, M4: { dk: 8, k: 1.5, s: 2, t: 2.5 }, M5: { dk: 9, k: 1.5, s: 3, t: 3 },
      M6: { dk: 10, k: 1.5, s: 3, t: 4 }, M8: { dk: 13, k: 1.5, s: 4, t: 5 }, M10: { dk: 16, k: 1.5, s: 5, t: 6 } },
  },
};

export const SIZE_NAMES = Object.keys(D);
export const MAX_LENGTH = 300;

// Reference thread length b for hex bolts. shortcut: the band over 200 (2d+25) is not checked against a source yet.
export function threadLength(d, L) {
  if (L <= 125) return 2 * d + 6;
  if (L <= 200) return 2 * d + 12;
  return 2 * d + 25;
}

const bad = (field, reason) => ({ tag: 'invalid-input', val: { field, reason } });

// Returns the checked input plus the dimensions it resolves to; nothing is built from outside these tables.
export function checkInput(p) {
  const head = p.head ?? 'hex';
  if (!(head in HEADS)) throw bad('head', `頭の種類 ${head} はありません`);
  const H = HEADS[head];
  const size = p.size ?? 'M8';
  if (!(size in H.sizes)) {
    throw bad('size', `${H.title}のサイズは ${Object.keys(H.sizes).join(', ')} から選んでください（入力: ${size}）`);
  }
  const length = Number(p.length ?? 20);
  if (!Number.isFinite(length) || length < 1 || length > MAX_LENGTH) {
    throw bad('length', `長さは 1〜${MAX_LENGTH} mm にしてください（入力: ${p.length}）`);
  }
  const dim = { d: D[size], ...H.sizes[size] };
  if (H.shape === 'csk' && length <= dim.k) {
    throw bad('length', `${H.title}の長さは頭を含むので ${dim.k} mm より長くしてください（入力: ${length}）`);
  }
  const thread = p.thread ?? 'auto';
  if (thread !== 'auto' && thread !== 'full') throw bad('thread', `ねじは auto か full です（入力: ${thread}）`);
  return { head, size, length, thread, dim };
}
