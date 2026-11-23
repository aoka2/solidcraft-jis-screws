import { run } from 'craft:plugin/commands@0.2.0';
import { log } from 'craft:plugin/log@0.2.0';
import { HEADS, threadLength, checkInput } from './spec.js';

function cmd(command, args) {
  try {
    return JSON.parse(run(command, JSON.stringify(args)));
  } catch (e) {
    // jco throws the plugin-error variant as the payload; pass it on unchanged.
    throw e.payload ?? { tag: 'trap', val: `${command}: ${e}` };
  }
}

const T30 = Math.tan(Math.PI / 6);

// Hexagon prism on the XY plane at height z, flats parallel to X.
function hexProfile(z, s, name) {
  cmd('sketch.create', { plane: 'XY', offset: z, name });
  cmd('sketch.draw.dimensioned', {
    command: 'sketch.polygon.circumscribed',
    params: { center: [0, 0], radius: s / 2, sides: 6 },
    dimensions: { radius: String(s / 2) },
  });
  cmd('sketch.constraint.horizontal_vertical', { line: 'l1', mode: 'horizontal' });
  cmd('sketch.finish', {});
}

// Conical chamfer on a hex head's top corners, 30 deg from the top face.
function hexChamfer(body, label, z, s, k) {
  const tool = `${body} chamfer tool`;
  cmd('solid.cylinder', { radius: s, height: k + 1, base: [0, 0, z], operation: 'new', name: `${label} ChamferRing`, body_name: tool });
  cmd('solid.cone', {
    radius: s / 2 + k / T30, top_radius: s / 2 - 1 / T30, height: k + 1, base: [0, 0, z],
    operation: 'cut', targets: [tool], name: `${label} ChamferCone`,
  });
  cmd('solid.combine', { target: body, tools: [tool], operation: 'cut', name: `${label} HeadChamfer` });
}

function makeScrew(params) {
  const { head, size, length: L, thread, dim } = checkInput(params);
  const H = HEADS[head];
  const { d, k } = dim;
  const label = `${H.title} ${size}x${L}`;
  const body = `Screw ${head} ${size}x${L}`;
  // A countersunk length includes the head; every other length is under the head.
  const z0 = H.shape === 'csk' ? L - k : L;
  const top = z0 + k;

  cmd('solid.cylinder', { diameter: d, height: z0, operation: 'new', name: `${label} Shank`, body_name: body });
  const join = { operation: 'join', targets: [body] };
  if (H.shape === 'hex' || H.shape === 'flange') {
    hexProfile(z0, dim.s, `${label} HeadSketch`);
    cmd('solid.extrude', { distance: k, ...join, name: `${label} Head` });
    if (H.shape === 'flange') {
      cmd('solid.cylinder', { diameter: dim.dc, height: dim.c, base: [0, 0, z0], ...join, name: `${label} Flange` });
      // shortcut: the flange's top is a plain cone up to the hex at k - k1; the standard draws its exact profile.
      cmd('solid.cone', {
        radius: dim.dc / 2, top_radius: dim.s / 2, height: k - dim.k1 - dim.c, base: [0, 0, z0 + dim.c],
        ...join, name: `${label} FlangeCone`,
      });
    }
  } else if (H.shape === 'csk') {
    cmd('solid.cone', { radius: dim.dk / 2 - k, top_radius: dim.dk / 2, height: k, base: [0, 0, z0], ...join, name: `${label} Head` });
  } else {
    if (H.dome) {
      // Spherical top through the head's centre and its rim at dome*k; dk and k stay as tabled.
      // shortcut: the sphere radius follows from that rim height, not from a table radius.
      const r = dim.dk / 2, h = k * (1 - H.dome), R = (r * r + h * h) / (2 * h);
      const tool = `${body} head tool`;
      cmd('solid.cylinder', { diameter: dim.dk, height: k, base: [0, 0, z0], operation: 'new', name: `${label} HeadBlank`, body_name: tool });
      cmd('solid.sphere', { radius: R, center: [0, 0, top - R], operation: 'intersect', targets: [tool], name: `${label} HeadDome` });
      cmd('solid.combine', { target: body, tools: [tool], operation: 'join', name: `${label} Head` });
    } else {
      cmd('solid.cylinder', { diameter: dim.dk, height: k, base: [0, 0, z0], ...join, name: `${label} Head` });
    }
    // The rounded top edge keeps dk and k; its radius is for looks, not from a table.
    if (H.round) cmd('solid.fillet', { edges: [[dim.dk / 2, 0, top]], radius: H.round * k, body, name: `${label} HeadRound` });
  }

  const b = thread === 'auto' && H.jisLength ? Math.min(threadLength(d, L), z0) : z0;
  cmd('solid.thread', {
    faces: [{ body, point: [d / 2, 0, z0 / 2] }],
    designation: size, modeled: true, tip: 'start', length: b, ease_out: 'standard', name: `${label} Thread`,
  });

  if (H.shape === 'hex' || H.shape === 'flange') hexChamfer(body, label, z0, dim.s, k);
  if (H.recess === 'hex') {
    hexProfile(top, dim.s, `${label} SocketSketch`);
    cmd('solid.extrude', { distance: dim.t, direction: 'negative', operation: 'cut', targets: [body], name: `${label} Socket` });
  } else if (H.recess === 'cross') {
    // shortcut: two slots (width 0.22 m) trimmed by a cone so the arms narrow with depth like a
    // Phillips recess (26.5 deg to the axis); depth from m and k, not the JIS B 1012 form.
    const m = dim.m ?? 0.55 * dim.dk;
    const w = 0.22 * m;
    const depth = Math.min(0.45 * m, 0.75 * k);
    const tan = Math.tan((26.5 * Math.PI) / 180);
    const tool = `${body} recess tool`;
    for (const [len, wid, n] of [[m + 1, w, 1], [w, m + 1, 2]]) {
      cmd('solid.box', {
        length: len, width: wid, height: depth + 1, center: [0, 0, top - depth / 2 + 0.5],
        ...(n === 1 ? { operation: 'new', body_name: tool } : { operation: 'join', targets: [tool] }), name: `${label} RecessSlot${n}`,
      });
    }
    cmd('solid.cone', {
      radius: m / 2 - depth * tan, top_radius: m / 2 + tan, height: depth + 1, base: [0, 0, top - depth],
      operation: 'intersect', targets: [tool], name: `${label} RecessTaper`,
    });
    cmd('solid.combine', { target: body, tools: [tool], operation: 'cut', name: `${label} Recess` });
  }

  const result = { head: H.title, size, length: L, thread_length: b, fully_threaded: b >= z0, ...dim, maker_dimensions: !!H.maker, body };
  log('info', `made ${JSON.stringify(result)}`);
  return result;
}

export const entry = {
  execute(name, paramsJson) {
    if (name !== 'make') throw { tag: 'invalid-input', val: { field: 'entry', reason: `unknown entry ${name}` } };
    return JSON.stringify(makeScrew(JSON.parse(paramsJson || '{}')));
  },
};
