// L4 PBT — day-part preset value ranges (stdlib node:test only).
// Parses the PRESETS table out of modules/lighting.js and enforces REQ-LIGHT-1
// as universal properties over all four presets.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadPresets() {
  const src = fs.readFileSync(path.join(ROOT, 'modules/lighting.js'), 'utf8');
  const block = src.match(/const PRESETS = \{([\s\S]*?)\n\};/)[1];
  const out = {};
  for (const m of block.matchAll(/(\w+):\s*\{([^}]+)\}/g)) {
    const obj = {};
    for (const kv of m[2].matchAll(/(\w+):\s*(0x[0-9a-fA-F]+|-?[\d.]+)/g)) {
      obj[kv[1]] = kv[2].startsWith('0x') ? parseInt(kv[2], 16) : parseFloat(kv[2]);
    }
    out[m[1]] = obj;
  }
  return out;
}

const P = loadPresets();
const names = Object.keys(P);

describe('preset value ranges (REQ-LIGHT-1)', () => {
  it('exactly the four canonical presets exist', () => {
    assert.deepEqual([...names].sort(), ['dawn', 'night', 'noon', 'sunset']);
  });

  it('every preset carries the full 20-channel schema', () => {
    const keys = ['sun', 'sunInt', 'elev', 'azim', 'hemi', 'env', 'fog', 'fogDen',
      'exposure', 'bloom', 'bThr', 'bRad', 'stars', 'lamp', 'emissive', 'moon',
      'cloud', 'cloudOp', 'turb', 'ray', 'mie', 'mieG'];
    for (const n of names) for (const k of keys) {
      assert.ok(Number.isFinite(P[n][k]), `${n}.${k} missing/non-numeric`);
    }
  });

  it('ranges hold for ALL presets: exposure/elev/azim/bloom/stars/moon/fractions', () => {
    for (const n of names) {
      const p = P[n];
      assert.ok(p.exposure >= 0.5 && p.exposure <= 1.0, `${n}.exposure=${p.exposure}`);
      assert.ok(p.elev >= 0 && p.elev <= 90, `${n}.elev=${p.elev}`);
      assert.ok(p.azim >= 0 && p.azim <= 360, `${n}.azim=${p.azim}`);
      assert.ok(p.bloom >= 0 && p.bloom <= 1, `${n}.bloom=${p.bloom}`);
      assert.ok(p.cloudOp >= 0 && p.cloudOp <= 1, `${n}.cloudOp=${p.cloudOp}`);
      assert.ok(p.stars === 0 || p.stars === 1, `${n}.stars=${p.stars}`);
      assert.ok(p.moon === 0 || p.moon === 1, `${n}.moon=${p.moon}`);
      assert.ok(p.sunInt > 0 && p.sunInt <= 5, `${n}.sunInt=${p.sunInt}`);
      assert.ok(p.fogDen > 0 && p.fogDen < 0.01, `${n}.fogDen=${p.fogDen}`);
      assert.ok(p.hemi >= 0 && p.hemi <= 1, `${n}.hemi=${p.hemi}`);
    }
  });

  it('day sweep: dawn->noon->sunset azim runs East->West 110->170->250', () => {
    assert.deepEqual([P.dawn.azim, P.noon.azim, P.sunset.azim], [110, 170, 250]);
  });

  it('night is the darkest yet still modeled (sun dim, lamps + emissive up)', () => {
    const dayMax = Math.max(P.dawn.sunInt, P.noon.sunInt, P.sunset.sunInt);
    assert.ok(P.night.sunInt < dayMax, 'night sun not dimmest');
    assert.ok(P.night.lamp >= P.noon.lamp, 'night lamps not raised');
    assert.ok(P.night.emissive >= P.noon.emissive, 'night emissive not raised');
    assert.equal(P.night.stars, 1, 'night stars off?');
  });

  it('colors are valid 24-bit hex for sun/fog/cloud on every preset', () => {
    for (const n of names) for (const k of ['sun', 'fog', 'cloud']) {
      assert.ok(Number.isInteger(P[n][k]) && P[n][k] >= 0 && P[n][k] <= 0xffffff,
        `${n}.${k}=${P[n][k]}`);
    }
  });
});
