// L4 PBT — seeded determinism of olive bakes (stdlib node:test only).
// Verbatim RNG math from modules/vegetation.js (mulberry32) and
// modules/opentree.js (rng); constants asserted against modules/vegetation.js.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rng(e) {
  let t = e >>> 0;
  return () => {
    t = (t + 1831565813) | 0;
    let o = Math.imul(t ^ (t >>> 15), 1 | t);
    o = (o + Math.imul(o ^ (o >>> 7), 61 | o)) ^ o;
    return ((o ^ (o >>> 14)) >>> 0) / 4294967296;
  };
}

const seq = (f, n) => Array.from({ length: n }, () => f());

// KEEP-table replica (values copied from modules/vegetation.js) for clearOf determinism.
const KEEP = {
  discs: [
    { x: 32, z: -70, r: 12 }, { x: 70, z: -10, r: 7 }, { x: -45, z: -30, r: 7 },
    { x: -90, z: -60, r: 7 }, { x: 20, z: 30, r: 9 }, { x: -110, z: 30, r: 9 },
    { x: 55, z: 108, r: 6 }, { x: -60, z: 105, r: 6 }, { x: 65.5, z: -70, r: 7 },
  ],
  rects: [
    { x0: -60, x1: 60, z0: -130, z1: -10 },
    { x0: -78, x1: 78, z0: 118, z1: 182 },
    { x0: -50, x1: 50, z0: 112, z1: 190 },
  ],
};
function clearOf(x, z) {
  for (const d of KEEP.discs) {
    const dx = x - d.x, dz = z - d.z;
    if (dx * dx + dz * dz < d.r * d.r) return false;
  }
  for (const r of KEEP.rects) {
    if (x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1) return false;
  }
  return true;
}

describe('bake determinism (REQ-VEG-1)', () => {
  it('mulberry32: same seed => identical 1000-draw sequences, for 100 seeds', () => {
    for (let s = 0; s < 100; s++) {
      assert.deepEqual(seq(mulberry32(s * 7919 + 17), 1000), seq(mulberry32(s * 7919 + 17), 1000));
    }
  });

  it('opentree rng: same seed => identical sequences, for 100 seeds', () => {
    for (let s = 0; s < 100; s++) {
      assert.deepEqual(seq(rng(70701 * 31 + s), 500), seq(rng(70701 * 31 + s), 500));
    }
  });

  it('distinct seeds diverge within 64 draws (50 seed pairs)', () => {
    for (let s = 1; s <= 50; s++) {
      const a = seq(mulberry32(70701), 64), b = seq(mulberry32(70701 + s), 64);
      assert.ok(a.some((v, i) => v !== b[i]), `seed 70701 vs ${70701 + s} identical?`);
    }
  });

  it('draws stay in [0,1) for 200 seeds x 200 draws', () => {
    for (let s = 0; s < 200; s++) {
      for (const v of seq(mulberry32(s), 200)) assert.ok(v >= 0 && v < 1, `out of range: ${v}`);
    }
  });

  it('clearOf: deterministic + boolean over 500 pseudo-random points', () => {
    const R = mulberry32(70701);
    for (let i = 0; i < 500; i++) {
      const x = R() * 300 - 150, z = R() * 450 - 225;
      const a = clearOf(x, z), b = clearOf(x, z);
      assert.equal(typeof a, 'boolean');
      assert.equal(a, b);
    }
  });

  it('clearOf: known masonry points stay excluded (terrace, qibli block, chain)', () => {
    assert.equal(clearOf(0, -70), false); // central terrace rect
    assert.equal(clearOf(0, 150), false); // qibli block rect
    assert.equal(clearOf(32, -70), false); // chain disc
    assert.equal(clearOf(128, -180), true); // open ground NE
  });

  it('bake constants in modules/vegetation.js match spec', () => {
    const src = fs.readFileSync(path.join(ROOT, 'modules/vegetation.js'), 'utf8');
    for (const lit of ['const OLIVE_SEED = 70701', 'const CLUSTER_ANCHORS = 256',
      'const CARD_SCALE = 3.4', 'const TRAD = 8', 'const PRUNE_R = 0.025']) {
      assert.ok(src.includes(lit), `missing: ${lit}`);
    }
    const ot = fs.readFileSync(path.join(ROOT, 'modules/opentree.js'), 'utf8');
    assert.ok(ot.includes('Olea europaea'), 'olive preset missing');
    assert.ok(ot.includes('trunkTop:1.7'), 'olive trunkTop drifted');
  });
});
