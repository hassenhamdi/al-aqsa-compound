// oliveGrove.js — fresh olive rebuild (open-tree colonization crowns).
// Standalone: imports ONLY three + ./opentree.js (geo/math helper).
// Recipe: buildModel('olive') node graph → smooth trunk rings (TRAD 10,
// pruned twig tips, capped ends) + leafData frames → dense crossed cluster
// quads with a fresh-painted lanceolate olive sprite (grey-green/silvery).
// Placements: documented scheme — 52 east garden (x62..128, z-175..175) +
// 12 north patch (x-90..30, z-205..-160), GY=2.0, masonry KEEP-outs.
// Defect bar (oak-open-tree.png + dull-shot review): no bare crowns, no
// thorn spikes, no trunk facets, no IBL washout (envMapIntensity 0.25).
// Calls: 2 (trunk + cluster InstancedMesh). Zero lights. Shadows: trunk
// ON, leaves OFF. Sway ticker → D.tickers, positions → D.poi.
import * as THREE from 'three';
import { OLIVE, buildModel } from './opentree.js';

const GY = 2.0;
const TRAD = 10;          // smooth (no facets); 8 was the proven minimum
const PRUNE_R = 0.022;    // childless twigs thinner than this are cut (no spikes)
const ANCHORS = 320;      // stride-sampled leaf frames per crown (dense, not bare)
const CARD_SCALE = 3.2;   // grown cards fuse the crown at 3-10 m
const SEED = 70701;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Masonry exclusion discs + rects (shared positions — keep trees off buildings)
const KEEP = {
  discs: [
    { x: 32, z: -70, r: 12 }, { x: 70, z: -10, r: 7 }, { x: -45, z: -30, r: 7 },
    { x: -90, z: -60, r: 7 }, { x: 20, z: 30, r: 9 }, { x: -110, z: 30, r: 9 },
    { x: 55, z: 108, r: 6 }, { x: -60, z: 105, r: 6 }, { x: 65.5, z: -70, r: 7 },
  ],
  rects: [
    { x0: -60, x1: 60, z0: -130, z1: -10 }, { x0: -78, x1: 78, z0: 118, z1: 182 },
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

function sampleGroves(rand) {
  const out = [];
  let guard = 0;
  while (out.length < 52 && guard++ < 4000) {
    const x = 62 + rand() * 66, z = -175 + rand() * 350;
    if (clearOf(x, z)) out.push({ x, z, s: 0.8 + rand() * 0.5, r: rand() * Math.PI * 2 });
  }
  guard = 0;
  while (out.length < 64 && guard++ < 2000) {
    const x = -90 + rand() * 120, z = -205 + rand() * 45;
    if (clearOf(x, z)) out.push({ x, z, s: 0.75 + rand() * 0.45, r: rand() * Math.PI * 2 });
  }
  return out;
}

// ---- Trunk: smooth rings from node par-links + pipe radii, flared base ----
function bakeTrunk(model) {
  const n = model.par.length;
  const P = [], C = [], U = [], S = [], I = [];
  const kids = new Map();
  for (let i = 0; i < n; i++) {
    const pi = model.par[i];
    if (pi < 0) continue;
    if (!kids.has(pi)) kids.set(pi, []);
    kids.get(pi).push(i);
  }
  const Y = new THREE.Vector3(0, 1, 0);
  const bark = new THREE.Color(0xffffff), dark = new THREE.Color(0xa89a82), tmp = new THREE.Color();
  const R = mulberry32(SEED + 2);
  const ringOf = new Map();
  let vc = 0, tris = 0;
  const capFan = (start, center, flip, swayW) => {
    const ci = vc;
    P.push(center.x, center.y, center.z);
    tmp.copy(dark); C.push(tmp.r, tmp.g, tmp.b);
    U.push(0.5, 0); S.push(swayW); vc++;
    for (let k = 0; k < TRAD; k++) {
      const v0 = start + k, v1 = start + (k + 1) % TRAD;
      if (flip) I.push(ci, v1, v0); else I.push(ci, v0, v1);
      tris++;
    }
  };
  for (let i = 0; i < n; i++) {
    const pi = model.par[i];
    if (pi >= 0 && (kids.get(i) || []).length === 0 && model.prad[i] < PRUNE_R) continue;
    const p = new THREE.Vector3(model.px[i], model.py[i], model.pz[i]);
    let dir, hint = null;
    if (pi >= 0 && ringOf.has(pi)) {
      const pr = ringOf.get(pi);
      const raw = new THREE.Vector3().subVectors(p, pr.center);
      dir = raw.lengthSq() > 1e-12 ? raw.normalize() : Y.clone();
      hint = pr.side;
    } else dir = Y.clone();
    let side = hint ? hint.clone() : new THREE.Vector3(1, 0, 0);
    if (Math.abs(dir.dot(side)) > 0.9) side.set(0, 0, 1);
    side.sub(dir.clone().multiplyScalar(side.dot(dir))).normalize();
    const upv = new THREE.Vector3().crossVectors(dir, side).normalize();
    let radius = Math.max(model.prad[i], 0.008);
    if (p.y < 0.35) radius *= 1 + 0.55 * (1 - p.y / 0.35); // root flare
    const lobe = radius > 0.05 ? 0.12 : 0.04;             // gnarl flute, subtle
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
      const twd = radius < 0.03 ? 0.55 : 1.0; // thin twigs darker (no wire blowout)
      C.push(tmp.r * twd, tmp.g * twd, tmp.b * twd);
      U.push((k / TRAD) * 2 * Math.PI * radius, p.y);
      S.push(sway);
      vc++;
    }
    ringOf.set(i, { start, side: side.clone(), center: p.clone(), dir: dir.clone() });
    if (pi >= 0 && ringOf.has(pi)) {
      const c0 = ringOf.get(pi).start;
      for (let k = 0; k < TRAD; k++) {
        const a0 = c0 + k, a1 = c0 + (k + 1) % TRAD, b0 = start + k, b1 = start + (k + 1) % TRAD;
        I.push(a0, a1, b0, a1, b1, b0);
        tris += 2;
      }
    }
  }
  for (const [pi, pr] of ringOf) {           // cap every open woody end
    if ((kids.get(pi) || []).some((c) => ringOf.has(c))) continue;
    capFan(pr.start, pr.center.clone().addScaledVector(pr.dir, 0.05), false,
      Math.max(0, Math.min(1, pr.center.y / model.H)));
  }
  for (let i = 0; i < n; i++) {              // cap the buried base
    if (model.par[i] < 0 && ringOf.has(i)) {
      const pr = ringOf.get(i);
      capFan(pr.start, pr.center.clone().add(new THREE.Vector3(0, -0.03, 0)), true, 0);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.setAttribute('aSway', new THREE.Float32BufferAttribute(S, 1));
  g.setIndex(I);
  g.computeVertexNormals();
  return { geo: g, tris };
}

// ---- Crown: crossed cluster quads from open-tree leafData frames ----
function bakeCrown(model) {
  const LD = model.leafData, NL = model.nLeaf;
  const stride = Math.max(1, Math.floor(NL / ANCHORS));
  const sel = [];
  for (let i = 0; i < NL && sel.length < ANCHORS; i += stride) sel.push(i);
  const QP = [], QU = [], QS = [], QC = [], QI = [];
  let qvc = 0;
  const T = new THREE.Vector3(), Sd = new THREE.Vector3(), Nr = new THREE.Vector3();
  for (const i of sel) {
    const b = i * 20;
    const bx = LD[b], by = LD[b + 1], bz = LD[b + 2];
    const sv = LD[b + 3] * CARD_SCALE, su = LD[b + 7] * CARD_SCALE;
    T.set(LD[b + 8], LD[b + 9], LD[b + 10]).normalize();
    Nr.set(LD[b + 4], LD[b + 5], LD[b + 6]).normalize();
    Sd.crossVectors(Nr, T);
    if (Sd.lengthSq() < 1e-6) Sd.set(1, 0, 0); else Sd.normalize();
    const tx = T.y * Sd.z - T.z * Sd.y, ty = T.z * Sd.x - T.x * Sd.z, tz = T.x * Sd.y - T.y * Sd.x;
    const e = 0.45 + 0.55 * Math.max(0, Math.min(1, by / model.H));
    for (let k = 0; k < 2; k++) {
      const a = k * Math.PI / 2, cA = Math.cos(a), sA = Math.sin(a);
      const sx = Sd.x * cA + tx * sA, sy = Sd.y * cA + ty * sA, sz = Sd.z * cA + tz * sA;
      const cx = bx + T.x * sv * 0.15, cy = by + T.y * sv * 0.15, cz = bz + T.z * sv * 0.15;
      const quad = [[-0.5, -0.35], [0.5, -0.35], [-0.5, 0.65], [0.5, 0.65]];
      quad.forEach(([qus, qsv], ci) => {
        QP.push(cx + sx * qus * su + T.x * qsv * sv, cy + sy * qus * su + T.y * qsv * sv, cz + sz * qus * su + T.z * qsv * sv);
        QU.push(ci % 2, Math.floor(ci / 2));
        QS.push(0.7 + 0.5 * (qsv + 0.35));
        QC.push(e, e, e);
      });
      QI.push(qvc, qvc + 2, qvc + 1, qvc + 1, qvc + 2, qvc + 3);
      qvc += 4;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(QP, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(QU, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(QC, 3));
  g.setAttribute('aSway', new THREE.Float32BufferAttribute(QS, 1));
  g.setIndex(QI);
  g.computeVertexNormals();
  return { geo: g, quads: sel.length * 2, anchors: sel.length, leaves: NL };
}

// ---- Fresh lanceolate olive sprite: narrow grey-green blades, silvery
// undersides, dense fan + fruit dots. Painted here (not the oak lobe path).
const OLIVE_BLADES = [[74, 84, 58], [86, 94, 64], [64, 74, 50], [96, 102, 78]];
function oliveSprayTexture() {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.clearRect(0, 0, S, S);
  const R = mulberry32(SEED + 3);
  const cx = S / 2, base = S - 8;
  g.lineCap = 'round';
  // woody fan stems
  g.strokeStyle = 'rgb(74,60,46)';
  const tips = [];
  for (let b = 0; b < 7; b++) {
    const tx = cx - 165 + b * 55 + (R() - 0.5) * 30, ty = 110 + R() * 90;
    tips.push([tx, ty]);
    g.lineWidth = b === 3 ? 6 : 3.5;
    g.beginPath(); g.moveTo(cx, base);
    g.quadraticCurveTo((cx + tx) / 2 + (R() - 0.5) * 40, (base + ty) / 2, tx, ty);
    g.stroke();
  }
  // dense lanceolate blades along each stem (~100 per canvas)
  for (const [tx, ty] of tips) {
    const nB = 8 + Math.floor(R() * 3);
    for (let k = 0; k < nB; k++) {
      const f = 0.25 + 0.75 * (k / (nB - 1));
      const px = cx + (tx - cx) * f, py = base + (ty - base) * f;
      for (const sd of [-1, 1]) {
        if (R() < 0.12) continue;
        const len = 60 + R() * 55, wid = 8 + R() * 6;
        const ang = Math.atan2(tx - cx, base - ty) + sd * (0.7 + R() * 0.5);
        const col = OLIVE_BLADES[Math.floor(R() * OLIVE_BLADES.length)];
        const silver = R() < 0.3; // underside flash
        g.save(); g.translate(px, py); g.rotate(ang);
        const grad = g.createLinearGradient(0, 0, 0, -len);
        const cc = (v) => Math.round(silver ? Math.min(255, v * 1.3 + 12) : v);
        grad.addColorStop(0, `rgb(${cc(col[0] * 0.85)},${cc(col[1] * 0.85)},${cc(col[2] * 0.85)})`);
        grad.addColorStop(1, `rgb(${cc(col[0])},${cc(col[1])},${cc(col[2])})`);
        g.fillStyle = grad;
        g.beginPath();
        g.moveTo(0, 0);
        g.quadraticCurveTo(wid, -len * 0.4, 0, -len);
        g.quadraticCurveTo(-wid, -len * 0.4, 0, 0);
        g.fill();
        g.strokeStyle = `rgba(${Math.round(col[0] * 0.7)},${Math.round(col[1] * 0.7)},${Math.round(col[2] * 0.65)},0.5)`;
        g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -len + 4); g.stroke();
        g.restore();
      }
    }
  }
  // olive fruit dots seated in the fan
  g.fillStyle = '#2a2521';
  for (let k = 0; k < 12; k++) {
    g.beginPath();
    g.arc(cx - 140 + R() * 280, 130 + R() * 260, 3.2, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ---- Bark tile: fissured grey-brown, sun-compensated albedo ----
const _c01 = (v) => Math.min(1, Math.max(0, v));
function _h3(x, y, z, seed) {
  let n = (Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265261) ^ Math.imul(z | 0, 2246822507) ^ Math.imul(seed | 0, 974634211)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
function _vn3(x, y, z, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const L = (p, q, t) => p + (q - p) * t;
  return L(
    L(L(_h3(xi, yi, zi, seed), _h3(xi + 1, yi, zi, seed), u), L(_h3(xi, yi + 1, zi, seed), _h3(xi + 1, yi + 1, zi, seed), u), v),
    L(L(_h3(xi, yi, zi + 1, seed), _h3(xi + 1, yi, zi + 1, seed), u), L(_h3(xi, yi + 1, zi + 1, seed), _h3(xi + 1, yi + 1, zi + 1, seed), u), v), w);
}
function barkTexture() {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  const img = g.createImageData(S, S);
  const d = img.data;
  const enc = (v) => Math.round(255 * Math.pow(_c01(v), 1 / 2.2));
  const ss = (a, b, v) => { const t = _c01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const bx = x / S, bz = y / S;
    const qx = bx * 7, qy = bz * 1.9;
    const w = _vn3(qx * 0.5 + 3.1, qy * 0.5, 0.5, 7);
    const r1 = 1 - Math.abs(2 * _vn3(qx + w * 1.8, qy, 0.5, 7) - 1);
    const r2 = 1 - Math.abs(2 * _vn3(qx * 2.2 + 7.0, qy * 2.2, 0.8, 7) - 1);
    const br = ss(0.35, 0.75, _vn3(qx, qy * 6.5 / 1.9 + 11.0, 0.3, 7));
    const h = Math.pow(r1, 1.6) * 0.75 + r2 * 0.2 - 0.3 * br * r1;
    const n1 = _vn3(bx * 2.0 + 21.0, bz * 0.9, 0.2, 7);
    const K = 1.6; // sun compensation (baked albedo reads near-black under sun~3)
    let r = (0.025 + 0.105 * h) * K, gg = (0.023 + 0.102 * h) * K, b = (0.021 + 0.094 * h) * K;
    const lich = ss(0.58, 0.76, n1) * 0.45 * h;
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

// ---- Wind: shared clock uniform, onBeforeCompile sway (no new deps) ----
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
        float flex = pow(max(aSway, 0.0), 1.5);
        float ph = ip.x * 0.37 + ip.z * 0.73 + position.x * 0.8 + position.z * 0.6;
        float gw = sin(uWindT * 1.6 + ph) * 0.6 + sin(uWindT * 2.9 + ph * 1.7 + position.y * 1.4) * 0.4;
        transformed.x += gw * ${amp.toFixed(3)} * flex;
        transformed.z += cos(uWindT * 1.25 + ph * 1.3) * ${(amp * 0.7).toFixed(3)} * flex;
        #ifdef USE_UV
          transformed.x += sin(uWindT * 4.3 + ph * 3.1) * 0.02 * flex * uv.y;
        #endif
      }`,
    );
  };
  mat.customProgramCacheKey = () => 'olivegrove-wind-' + key;
}

export function buildOliveGrove(ctx) {
  const { scene } = ctx;
  ctx.D = ctx.D || {};
  if (!Array.isArray(ctx.D.poi)) ctx.D.poi = [];
  if (!Array.isArray(ctx.D.tickers)) ctx.D.tickers = [];
  const G = new THREE.Group();
  G.name = 'olive-grove';
  scene.add(G);

  const rand = mulberry32(20260707);
  const grove = sampleGroves(rand);
  const model = buildModel('olive', SEED);
  void OLIVE;
  const trunk = bakeTrunk(model);
  const crown = bakeCrown(model);

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, vertexColors: true, map: barkTexture(),
    roughness: 0.95, metalness: 0, envMapIntensity: 0.25,
  });
  windify(trunkMat, 0.035, 'trunk');
  const leafMat = new THREE.MeshStandardMaterial({
    map: oliveSprayTexture(), alphaTest: 0.5, side: THREE.DoubleSide,
    vertexColors: true, roughness: 0.9, metalness: 0, envMapIntensity: 0.25,
  });
  windify(leafMat, 0.12, 'leaf');

  const dummy = new THREE.Object3D();
  const trunkInst = new THREE.InstancedMesh(trunk.geo, trunkMat, grove.length);
  const leafInst = new THREE.InstancedMesh(crown.geo, leafMat, grove.length);
  const tint = new THREE.Color();
  grove.forEach((t, i) => {
    dummy.position.set(t.x, GY, t.z);
    dummy.scale.set(t.s, t.s * (0.92 + (i % 5) * 0.04), t.s);
    dummy.rotation.set(0, t.r, 0);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);
    leafInst.setMatrixAt(i, dummy.matrix);
    const j1 = ((i * 0.37) % 1) * 0.04 - 0.02, j2 = 0.02 * ((i % 3) - 1), j3 = 0.03 * ((i % 4) - 1.5);
    tint.setRGB(0.94 + j1 + j2, 0.95 + j1 + j3, 0.92 + j2 * 0.5 + j3 * 0.5);
    leafInst.setColorAt(i, tint);
    ctx.D.poi.push({ name: `Olive ${i < 52 ? 'E' : 'N'}-${i}`, ar: 'زيتون', kind: 'olive', pos: dummy.position.clone() });
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  leafInst.instanceMatrix.needsUpdate = true;
  if (leafInst.instanceColor) leafInst.instanceColor.needsUpdate = true;
  trunkInst.castShadow = true; trunkInst.receiveShadow = true;   // trunks ON
  leafInst.castShadow = false; leafInst.receiveShadow = false;    // leaves OFF
  trunkInst.frustumCulled = false; leafInst.frustumCulled = false;
  G.add(trunkInst, leafInst);

  ctx.D.tickers.push((t) => { windU.value = t; });
  ctx.D.oliveGrove = {
    olives: grove.length, trunkTris: trunk.tris, clusters: crown.quads + ' crossed',
    leaves: crown.leaves, anchors: crown.anchors, calls: 2, wind: 'onBeforeCompile',
  };
  return G;
}
