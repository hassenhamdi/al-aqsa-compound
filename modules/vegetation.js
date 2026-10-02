// vegetation.js — olive bake on open-tree generation math (portable core in
// ./opentree.js, ported from /home/hassenhamdi/open-tree.html species library).
// Olive = retuned oak (spreading sc-crown, low limbs, sparse envelope).
// buildModel → trunk rings from node topology + pipe radii; leafData frames →
// crossed cluster quads; our olive sprite + wind path stay (validated dGPU).
// Reused by 2 InstancedMesh (trunk + clusters) + 1 cypress = 3 calls, ~64 trees.
// Shadows: trunks ON, cluster-cards OFF. No new lights, no new deps.
import * as THREE from 'three';
import { OLIVE, buildModel } from './opentree.js';

const GY = 2.0;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// building / path exclusion discs + rects (keep trees off masonry)
const KEEP = {
  discs: [
    { x: 32, z: -70, r: 12 },     // Dome of the Chain
    { x: 70, z: -10, r: 7 },      // east ablution kiosk
    { x: -45, z: -30, r: 7 },     // Sabil Qasim
    { x: -90, z: -60, r: 7 },     // west ablution kiosk
    { x: 20, z: 30, r: 9 },      // Al-Kas fountain (align-p4b mirror E)
    { x: -110, z: 30, r: 9 },     // Sabil Qaitbay
    { x: 55, z: 108, r: 6 },      // Yusuf east
    { x: -60, z: 105, r: 6 },     // Yusuf south
    { x: 65.5, z: -70, r: 7 },    // east mawazin/stair
  ],
  rects: [
    { x0: -60, x1: 60, z0: -130, z1: -10 },   // central terrace
    { x0: -78, x1: 78, z0: 118, z1: 182 },    // Qibli terrace
    { x0: -50, x1: 50, z0: 112, z1: 190 },    // Qibli mosque block
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

const OLIVE_SEED = 70701;
const CLUSTER_ANCHORS = 256; // stride-sampled leaf frames (fusion need)
const CARD_SCALE = 3.4;      // grown cards fuse the crown at 3-10 m
const TRAD = 8; // radial segments (no visible facets); twig tips pruned below
const PRUNE_R = 0.025; // childless nodes thinner than this are cut (no thorn spikes)

// ---- Trunk rings from the open-tree node graph (par-links + pipe radii).
// Olive look kept: root flare, fluted gnarl on limbs, bark tones.
function bakeOpenTree() {
  const model = buildModel('olive', OLIVE_SEED);
  const n = model.par.length;
  const P = [], C = [], U = [], S = [], I = [];
  let vc = 0, triCount = 0;
  const bark = new THREE.Color(0xffffff); // map carries albedo; verts add warm AO
  const dark = new THREE.Color(0xa89a82);
  const tmp = new THREE.Color();
  const R = mulberry32(70702); // bark stream (isolated from model stream)
  const Y = new THREE.Vector3(0, 1, 0);
  const ringRec = globalThis.__ringRec || null;
  const kids = new Map();
  for (let i = 0; i < n; i++) {
    const pi = model.par[i];
    if (pi < 0) continue;
    if (!kids.has(pi)) kids.set(pi, []);
    kids.get(pi).push(i);
  }
  const ringOf = new Map(); // idx -> {start, side, center, dir}
  function capFan(ringStart, center, flip, swayW) {
    const ci = vc;
    P.push(center.x, center.y, center.z);
    tmp.copy(dark); C.push(tmp.r, tmp.g, tmp.b);
    U.push(0.5, 0); S.push(swayW); vc++;
    for (let k = 0; k < TRAD; k++) {
      const v0 = ringStart + k, v1 = ringStart + (k + 1) % TRAD;
      if (flip) I.push(ci, v1, v0); else I.push(ci, v0, v1);
      triCount++;
    }
  }
  for (let i = 0; i < n; i++) {
    const pi = model.par[i];
    // prune bare twig tips (parent auto-caps; leaf anchors still cover the cut)
    if (pi >= 0 && (kids.get(i) || []).length === 0 && model.prad[i] < PRUNE_R) continue;
    const p = new THREE.Vector3(model.px[i], model.py[i], model.pz[i]);
    let dir, hint = null;
    if (pi >= 0 && ringOf.has(pi)) {
      const pr = ringOf.get(pi);
      const raw = new THREE.Vector3().subVectors(p, pr.center);
      dir = raw.lengthSq() > 1e-12 ? raw.normalize() : Y.clone();
      hint = pr.side;
    } else {
      dir = Y.clone();
    }
    let side = hint ? hint.clone() : new THREE.Vector3(1, 0, 0);
    if (Math.abs(dir.dot(side)) > 0.9) side.set(0, 0, 1);
    side.sub(dir.clone().multiplyScalar(side.dot(dir))).normalize();
    const upv = new THREE.Vector3().crossVectors(dir, side).normalize();
    let radius = Math.max(model.prad[i], 0.008);
    if (p.y < 0.35) radius *= 1 + 0.55 * (1 - p.y / 0.35); // olive root flare
    const lobe = radius > 0.05 ? 0.14 : 0.05;
    const phase = (i * 2.39996) % 6.2832;
    const sway = Math.max(0, Math.min(1, p.y / model.H));
    const start = vc;
    for (let k = 0; k < TRAD; k++) {
      const a = (k / TRAD) * Math.PI * 2;
      const lob = 1 + lobe * Math.cos(a * 5 + phase);
      P.push(
        p.x + (side.x * Math.cos(a) + upv.x * Math.sin(a)) * radius * lob,
        p.y + (side.y * Math.cos(a) + upv.y * Math.sin(a)) * radius * lob,
        p.z + (side.z * Math.cos(a) + upv.z * Math.sin(a)) * radius * lob,
      );
      tmp.copy(bark).lerp(dark, Math.min(0.85, lobe * 2.4 * (0.5 - 0.5 * Math.cos(a * 5 + phase)) + R() * 0.12));
      // thin twigs read darker (their twig-albedo branch + kills wire blowout)
      const twd = radius < 0.03 ? 0.55 : 1.0;
      C.push(tmp.r * twd, tmp.g * twd, tmp.b * twd);
      U.push((k / TRAD) * 2 * Math.PI * radius, p.y); // world-scale metres (bark tile = 1 m)
      S.push(sway);
      vc++;
    }
    if (ringRec) ringRec.push({ start, n: TRAD, c: p.clone() });
    ringOf.set(i, { start, side: side.clone(), center: p.clone(), dir: dir.clone() });
    if (pi >= 0 && ringOf.has(pi)) {
      const c0 = ringOf.get(pi).start;
      for (let k = 0; k < TRAD; k++) {
        const a0 = c0 + k, a1 = c0 + (k + 1) % TRAD;
        const b0 = start + k, b1 = start + (k + 1) % TRAD;
        I.push(a0, a1, b0, a1, b1, b0);
        triCount += 2;
      }
    }
  }
  for (const [pi, pr] of ringOf) {
    const ch = kids.get(pi) || [];
    if (ch.some((c) => ringOf.has(c))) continue; // woody continuation exists
    const c = pr.center.clone().addScaledVector(pr.dir, 0.05);
    capFan(pr.start, c, false, Math.max(0, Math.min(1, c.y / model.H)));
  }
  for (let i = 0; i < n; i++) {
    if (model.par[i] < 0 && ringOf.has(i)) {
      const pr = ringOf.get(i);
      capFan(pr.start, pr.center.clone().add(new THREE.Vector3(0, -0.03, 0)), true, 0);
    }
  }
  const trunkGeo = new THREE.BufferGeometry();
  trunkGeo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  trunkGeo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  trunkGeo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  trunkGeo.setAttribute('aSway', new THREE.Float32BufferAttribute(S, 1));
  trunkGeo.setIndex(I);
  trunkGeo.computeVertexNormals();

  // ---- Cluster quads from open-tree leafData (stride-20 frames).
  // base(0-2) sv(3) u(4-6) su(7) v(8-10); stride-sampled anchors, 2 crossed
  // quads each (0°/90° about v). Tints/occ skipped (ours cover variation).
  const LD = model.leafData, NL = model.nLeaf;
  const stride = Math.max(1, Math.floor(NL / CLUSTER_ANCHORS));
  const sel = [];
  for (let i = 0; i < NL && sel.length < CLUSTER_ANCHORS; i += stride) sel.push(i);
  const QP = [], QU = [], QS = [], QC = [], QI = [];
  let qvc = 0;
  const T = new THREE.Vector3(), Sd = new THREE.Vector3();
  const dummyN = new THREE.Vector3();
  for (const i of sel) {
    const b = i * 20;
    const bx = LD[b], by = LD[b + 1], bz = LD[b + 2];
    const sv = LD[b + 3] * CARD_SCALE, su = LD[b + 7] * CARD_SCALE;
    T.set(LD[b + 8], LD[b + 9], LD[b + 10]).normalize(); // v = blade-up
    dummyN.set(LD[b + 4], LD[b + 5], LD[b + 6]).normalize(); // u = blade-right
    // re-orthogonalize: side ⊥ T
    Sd.crossVectors(dummyN, T);
    if (Sd.lengthSq() < 1e-6) Sd.set(1, 0, 0); else Sd.normalize();
    // NOTE: open-tree u already ⊥ v by construction (crossed frames); enforce:
    const tx = T.y * Sd.z - T.z * Sd.y, ty = T.z * Sd.x - T.x * Sd.z, tz = T.x * Sd.y - T.y * Sd.x;
    const e = 0.45 + 0.55 * Math.max(0, Math.min(1, by / model.H)); // exposure by height
    for (let k = 0; k < 2; k++) {
      const a = k * Math.PI / 2;
      const cA = Math.cos(a), sA = Math.sin(a);
      // Rodrigues roll about T
      const sx = Sd.x * cA + tx * sA, sy = Sd.y * cA + ty * sA, sz = Sd.z * cA + tz * sA;
      const cx = bx + T.x * sv * 0.15, cy = by + T.y * sv * 0.15, cz = bz + T.z * sv * 0.15;
      const quad = [[-0.5, -0.35, su], [0.5, -0.35, su], [-0.5, 0.65, su], [0.5, 0.65, su]];
      quad.forEach(([qus, qsv], ci) => {
        QP.push(
          cx + sx * qus * su + T.x * qsv * sv,
          cy + sy * qus * su + T.y * qsv * sv,
          cz + sz * qus * su + T.z * qsv * sv,
        );
        QU.push(ci % 2, Math.floor(ci / 2));
        QS.push(0.7 + 0.5 * (qsv + 0.35));
        QC.push(e, e, e);
      });
      QI.push(qvc, qvc + 2, qvc + 1, qvc + 1, qvc + 2, qvc + 3);
      qvc += 4;
    }
  }
  const clusterGeo = new THREE.BufferGeometry();
  clusterGeo.setAttribute('position', new THREE.Float32BufferAttribute(QP, 3));
  clusterGeo.setAttribute('uv', new THREE.Float32BufferAttribute(QU, 2));
  clusterGeo.setAttribute('color', new THREE.Float32BufferAttribute(QC, 3));
  clusterGeo.setAttribute('aSway', new THREE.Float32BufferAttribute(QS, 1));
  clusterGeo.setIndex(QI);
  clusterGeo.computeVertexNormals();
  return { trunkGeo, clusterGeo, quads: sel.length * 2, anchors: sel.length, leaves: NL, tris: triCount, H: model.H };
}

// ---- open-tree painters ported 1:1 (oak branch) — olive palette shift ONLY.
// Source: /home/hassenhamdi/open-tree.html drawCluster/drawStem/drawProfileLeaf/
// PROF.oak/jitterCol/hex + FS_BARK oak relief/albedo math. ATLAS=512.
const TAU = Math.PI * 2;
const _clamp01 = (v) => Math.min(1, Math.max(0, v));
function _hex(e) { return `rgb(${e.map((t) => Math.round(Math.min(255, Math.max(0, t))).toFixed(0)).join(',')})`; }
const _add = (e, t) => [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
const _scl = (e, t) => [e[0] * t, e[1] * t, e[2] * t];
function _jitterCol(e, t, o) {
  const r = 1 + (t() - 0.5) * o, n = (t() - 0.5) * o * 40;
  return [e[0] * r + n, e[1] * r + n * 0.4, e[2] * r - n * 0.3];
}
function _drawStem(e, t, o, r) {
  e.strokeStyle = _hex(r); e.lineWidth = o; e.lineCap = 'round';
  e.beginPath(); e.moveTo(t[0][0], t[0][1]);
  for (const n of t.slice(1)) e.lineTo(n[0], n[1]);
  e.stroke();
}
// verbatim oak width profile (4.6-lobe ripple × tip taper)
const PROF_OAK = (e) => {
  const t = Math.pow(Math.sin(Math.PI * Math.pow(e, 0.8)), 0.8) * (0.55 + 0.5 * e);
  const o = 0.5 + 0.5 * Math.cos(TAU * (e * 4.6 + 0.2));
  return t * (1 - 0.45 * Math.pow(o, 3)) * (e < 0.06 ? 0.5 + 8 * e : 1);
};
function _drawProfileLeaf(e, t, o, r, n, a, l, c, s, i = 7) {
  e.save(); e.translate(t, o); e.rotate(r);
  const f = 60, d = [], v = [];
  for (let h = 0; h <= f; h++) {
    const m = h / f, gg = l(m) * a;
    d.push([gg, -m * n]); v.push([-gg * (0.95 + 0.1 * s()), -m * n]);
  }
  e.beginPath(); e.moveTo(0, 0);
  for (const h of d) e.lineTo(h[0], h[1]);
  for (let h = v.length - 1; h >= 0; h--) e.lineTo(v[h][0], v[h][1]);
  e.closePath();
  const p = e.createLinearGradient(0, 0, 0, -n);
  p.addColorStop(0, _hex(_scl(c, 0.9))); p.addColorStop(0.5, _hex(c)); p.addColorStop(1, _hex(_scl(c, 0.92)));
  e.fillStyle = p; e.fill();
  e.strokeStyle = _hex(_scl(c, 0.8)); e.globalAlpha = 0.25; e.lineWidth = 1; e.stroke();
  e.globalAlpha = 0.22; e.strokeStyle = _hex(_add(_scl(c, 1.15), [10, 10, 4]));
  e.lineWidth = Math.max(1, a * 0.06);
  e.beginPath(); e.moveTo(0, 0); e.lineTo(0, -n * 0.97); e.stroke();
  e.lineWidth = Math.max(0.6, a * 0.03);
  for (let h = 1; h <= i; h++) {
    const m = h / (i + 1), gg = l(m) * a * 0.85;
    e.beginPath(); e.moveTo(0, -m * n); e.lineTo(gg, -(m + 0.09) * n);
    e.moveTo(0, -m * n); e.lineTo(-gg, -(m + 0.09) * n); e.stroke();
  }
  e.restore(); e.globalAlpha = 1;
}
// verbatim oak summer palette → olive: desat 0.5 + lift ×1.28 (documented shift)
const OAK_LEAF = [[52, 68, 30], [62, 78, 36], [44, 60, 26]];
const OLIVE_LEAF = OAK_LEAF.map((c) => {
  const lum = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  return [0, 1, 2].map((k) => Math.min(255, (lum + (c[k] - lum) * 0.5) * 1.28));
});
const OAK_STEM = [80, 64, 48];
function oliveClusterTexture() {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.clearRect(0, 0, S, S);
  const R = mulberry32(70703);
  const n = S / 2, a = S - 6;
  // verbatim oak layout: stem + 4 branches + 6-7 profile leaves each
  const j = [n + 4, a - 130];
  const f = [[n - 120, a - 230], [n - 40, a - 310], [n + 55, a - 320], [n + 125, a - 220]];
  _drawStem(g, [[n, a], j], 6, OAK_STEM);
  for (const d of f) _drawStem(g, [j, [(j[0] + d[0]) / 2 + (R() - 0.5) * 16, (j[1] + d[1]) / 2], d], 3.5, OAK_STEM);
  const pick = () => _jitterCol(OLIVE_LEAF[Math.floor(R() * OLIVE_LEAF.length)], R, 0.25);
  for (const d of f) {
    const v = 6 + Math.floor(R() * 2);
    const p = Math.atan2(d[0] - j[0], j[1] - d[1]);
    for (let h = 0; h < v; h++) {
      const m = p - 1.5 + 3 * (h / (v - 1)) + (R() - 0.5) * 0.35;
      const glen = 125 + R() * 60;
      _drawProfileLeaf(g, d[0], d[1], m, glen, glen * 0.36, PROF_OAK, pick(), R, 5);
    }
  }
  // olive fruit dots seated along the branch fan (kept from our validated sprite)
  g.fillStyle = '#2a2521';
  for (let k = 0; k < 10; k++) {
    const fx = n - 110 + R() * 240, fy = a - 300 + R() * 220;
    g.beginPath(); g.arc(fx, fy, 3, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ---- open-tree oak bark baked to canvas (FS_BARK uBarkType 0 math, 1 m tile).
// value-noise + ridged fissures + grey-brown albedo + lichen; linear→sRGB encode.
function _vnoise(x, y, z, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const h = (a, b, cc) => {
    let n = (a * 374761393 + b * 668265261 + cc * 2246822507 + seed * 974634211) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const lerp = (p, q, t) => p + (q - p) * t;
  return lerp(
    lerp(lerp(h(xi, yi, zi), h(xi + 1, yi, zi), u), lerp(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
    lerp(lerp(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), lerp(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v), w);
}
function _ridged(x, y, z, seed) { return 1 - Math.abs(2 * _vnoise(x, y, z, seed) - 1); }
function _sstep(a, b, v) { const t = _clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); }
function bakeBarkTexture() {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  const img = g.createImageData(S, S);
  const d = img.data;
  const enc = (v) => Math.round(255 * Math.pow(Math.max(0, Math.min(1, v)), 1 / 2.2));
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const bx = x / S, bz = y / S; // 1 m tile in metres
    const qx = bx * 7, qy = bz * 1.9;
    const w = _vnoise(qx * 0.5 + 3.1, qy * 0.5, 0.5, 7);
    const r1 = _ridged(qx + w * 1.8, qy, 0.5, 7);
    const r2 = _ridged(qx * 2.2 + 7.0, qy * 2.2, 0.8, 7);
    const br = _sstep(0.35, 0.75, _vnoise(qx, qy * 6.5 / 1.9 + 11.0, 0.3, 7));
    const h = Math.pow(r1, 1.6) * 0.75 + r2 * 0.2 - 0.3 * br * r1;
    const n1 = _vnoise(bx * 2.0 + 21.0, bz * 0.9, 0.2, 7);
    // SUN COMPENSATION ×1.6: open-tree shades alb/π under sunE~20; three.js sun
    // is ~3, so verbatim albedo renders near-black — scaled, not restyled
    const SUN_K = 1.6;
    let r = (0.025 + (0.13 - 0.025) * h) * SUN_K, gg = (0.023 + (0.125 - 0.023) * h) * SUN_K, b = (0.021 + (0.115 - 0.021) * h) * SUN_K;
    const lich = _sstep(0.58, 0.76, n1) * 0.45 * h; // grey-green lichen
    r += (0.13 - r) * lich; gg += (0.15 - gg) * lich; b += (0.10 - b) * lich;
    const i = (y * S + x) * 4;
    d[i] = enc(r); d[i + 1] = enc(gg); d[i + 2] = enc(b); d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ---- wind: onBeforeCompile sway (three-vat fallback — VAT needs three>=0.186) ----
const windU = { value: 0 };
function windify(mat, amp, key) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uWindT = windU;
    sh.vertexShader = 'attribute float aSway;\nuniform float uWindT;\n' + sh.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      {
        vec3 ip = vec3(0.0);
        #ifdef USE_INSTANCING
          ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
        #endif
        // traveling gust + turbulence + ^1.5 flex ease (wind-shader idiom);
        // phase varies within the crown (local pos) so tufts don't lockstep
        float flex = pow(max(aSway, 0.0), 1.5);
        float ph = ip.x * 0.37 + ip.z * 0.73 + position.x * 0.8 + position.z * 0.6;
        float gw = sin(uWindT * 1.6 + ph) * 0.6 + sin(uWindT * 2.9 + ph * 1.7 + position.y * 1.4) * 0.4;
        transformed.x += gw * ${amp.toFixed(3)} * flex;
        transformed.z += cos(uWindT * 1.25 + ph * 1.3) * ${(amp * 0.7).toFixed(3)} * flex;
        #ifdef USE_UV
          transformed.x += sin(uWindT * 4.3 + ph * 3.1) * 0.02 * flex * uv.y; // flutter
        #endif
      }`,
    );
  };
  mat.customProgramCacheKey = () => 'olive-wind-' + key;
}

export function buildVegetation(ctx) {
  const { scene } = ctx;
  ctx.D = ctx.D || {};
  const G = new THREE.Group(); G.name = 'vegetation'; scene.add(G);
  const rand = mulberry32(20260707);

  // ---- sample olive positions: east garden + north patch (unchanged) ----
  const olives = [];
  let guard = 0;
  while (olives.length < 52 && guard++ < 4000) {
    const x = 62 + rand() * 66;          // 62..128
    const z = -175 + rand() * 350;       // -175..175
    if (clearOf(x, z)) olives.push({ x, z, s: 0.8 + rand() * 0.5, r: rand() * Math.PI * 2 });
  }
  guard = 0;
  while (olives.length < 64 && guard++ < 2000) {
    const x = -90 + rand() * 120;        // -90..30
    const z = -205 + rand() * 45;        // -205..-160
    if (clearOf(x, z)) olives.push({ x, z, s: 0.75 + rand() * 0.45, r: rand() * Math.PI * 2 });
  }

  // ---- ONE open-tree olive reused by both InstancedMesh ----
  const baked = bakeOpenTree();

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, map: bakeBarkTexture(), roughness: 0.95, metalness: 0, envMapIntensity: 0.25 });
  windify(trunkMat, 0.035, 'trunk');
  const leafMat = new THREE.MeshStandardMaterial({
    map: oliveClusterTexture(), alphaTest: 0.5, side: THREE.DoubleSide,
    vertexColors: true, roughness: 0.9, metalness: 0, envMapIntensity: 0.25,
  });
  windify(leafMat, 0.12, 'leaf');

  const dummy = new THREE.Object3D();
  const trunkInst = new THREE.InstancedMesh(baked.trunkGeo, trunkMat, olives.length);
  const leafInst = new THREE.InstancedMesh(baked.clusterGeo, leafMat, olives.length);
  const tint = new THREE.Color();
  olives.forEach((t, i) => {
    dummy.position.set(t.x, GY, t.z);
    dummy.scale.set(t.s, t.s * (0.92 + (i % 5) * 0.04), t.s);
    dummy.rotation.set(0, t.r, 0);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);
    leafInst.setMatrixAt(i, dummy.matrix);
    // subtle per-tree variation (sprite already olive-grey)
    const j1 = ((i * 0.37) % 1) * 0.04 - 0.02, j2 = 0.02 * ((i % 3) - 1), j3 = 0.03 * ((i % 4) - 1.5);
    tint.setRGB(0.94 + j1 + j2, 0.95 + j1 + j3, 0.92 + j2 * 0.5 + j3 * 0.5);
    leafInst.setColorAt(i, tint);
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  leafInst.instanceMatrix.needsUpdate = true;
  if (leafInst.instanceColor) leafInst.instanceColor.needsUpdate = true;
  trunkInst.castShadow = true; trunkInst.receiveShadow = true;
  leafInst.castShadow = false; leafInst.receiveShadow = false;
  trunkInst.frustumCulled = false; leafInst.frustumCulled = false;
  // placeholder CLEARED (Dryad dGPU): crossed clusters read volumetric <3m —
  // no flat-card plane, correct grey-green, no floaters (olive-dryad shots)
  G.add(trunkInst, leafInst);

  // wind clock (single shared uniform; main-loop tickers pass elapsed)
  ctx.D.tickers.push((t) => { windU.value = t; });

  // ---- 12 perimeter cypress (10-20m, #2F4A2E), instanced cones ----
  const cypressAt = [
    [-135, -180, 14], [-135, -60, 17], [-135, 120, 12], [-135, 190, 15],
    [135, -180, 16], [135, -60, 13], [135, 60, 18], [135, 150, 11],
    [0, -200, 15], [-60, -200, 12], [100, 170, 14], [100, 195, 16],
  ];
  const cypMat = new THREE.MeshStandardMaterial({ color: 0x2f4a2e, roughness: 0.95, metalness: 0, envMapIntensity: 0.25 });
  const cypGeo = new THREE.ConeGeometry(1.35, 12, 8);
  cypGeo.translate(0, 6, 0); // base at origin so scale = height
  const cypInst = new THREE.InstancedMesh(cypGeo, cypMat, cypressAt.length);
  cypressAt.forEach(([x, z, h], i) => {
    const w = h / 12;                       // keep proportions, height 10-20m
    dummy.position.set(x, GY, z);
    dummy.scale.set(w * 1.3, h / 12, w * 1.3);
    dummy.rotation.set(0, rand() * Math.PI, 0);
    dummy.updateMatrix();
    cypInst.setMatrixAt(i, dummy.matrix);
  });
  cypInst.instanceMatrix.needsUpdate = true;
  cypInst.castShadow = false; cypInst.receiveShadow = false;
  cypInst.frustumCulled = false;
  G.add(cypInst);

  ctx.D.vegetation = { olives: olives.length, cypress: cypressAt.length, trunkTris: baked.tris, clusters: baked.quads + ' open-tree crossed', leaves: baked.leaves, calls: 3, wind: 'onBeforeCompile-fallback' };
  return G;
}
