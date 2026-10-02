// pigeons.js — white courtyard pigeons: ground peckers + wheeling flight flock.
// Technique-borrow: npm `procedural-animals` crow pattern (procedural corvid
// body + triangle wings, white recolor) implemented dependency-free — no new
// npm dep per §6. Crowd tier: 1 InstancedMesh per flock state = 2 draw calls;
// wing flap runs on GPU (aWing/aPhase/aAmp + uPigeonTime), matrices on CPU.
// Size-correct vs 1.7 m human: body ~0.32 m, spread wingspan ~0.6 m.
// Perches: courtyard pavement, Mawazin beams, Al-Kas fountain rim, W parapet.
// Zero lights, no shadows, frustumCulled=false.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WHITE = new THREE.Color(0xf4f1e8); // white recolor (crow->pigeon)
const GREY = new THREE.Color(0xcfc9bd);  // wings / tail shade
const DARK = new THREE.Color(0x3a3630);  // beak / eye-row

// tag geometry with flat vertex color + per-vertex wing flag (-1/0/+1)
function paint(geo, color, wing = 0) {
  const n = geo.attributes.position.count;
  const col = new Float32Array(n * 3);
  const fl = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    col[i * 3] = color.r; col[i * 3 + 1] = color.g; col[i * 3 + 2] = color.b;
    fl[i] = wing;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aWing', new THREE.BufferAttribute(fl, 1));
  return geo;
}

// Extrude/Sphere/Box/Cone primitives are indexed; hand-built quads are not —
// mergeGeometries needs one family, so expand everything to non-indexed.
function unify(parts) {
  return mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)), false);
}

function xform(geo, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(sx, sy, sz),
  );
  geo.applyMatrix4(m);
  return geo;
}

// shared body (origin at feet, facing +z): breast sphere + head + beak + tail
function bodyParts() {
  const parts = [];
  parts.push(paint(xform(new THREE.SphereGeometry(0.075, 10, 8), 0, 0.135, 0.01, 0.9, 1.0, 1.5), WHITE));
  parts.push(paint(xform(new THREE.SphereGeometry(0.045, 10, 8), 0, 0.225, 0.125), WHITE));
  parts.push(paint(xform(new THREE.ConeGeometry(0.013, 0.05, 6), 0, 0.218, 0.185, 1, 1, 1, Math.PI / 2), DARK));
  parts.push(paint(xform(new THREE.BoxGeometry(0.07, 0.018, 0.15), 0, 0.15, -0.185, 1, 1, 1, -0.18), GREY));
  return parts;
}

// folded flank caps for grounded birds
function groundGeo() {
  const parts = bodyParts();
  for (const s of [-1, 1]) {
    parts.push(paint(xform(new THREE.BoxGeometry(0.022, 0.055, 0.19),
      s * 0.062, 0.15, -0.02, 1, 1, 1, 0, 0, s * -0.08), GREY));
  }
  return unify(parts);
}

// spread quad wings for flyers (aWing=±1 so the shader flaps tips)
function wingQuad(s) {
  const g = new THREE.BufferGeometry();
  const v = new Float32Array([
    s * 0.05, 0, 0.07,
    s * 0.30, 0, -0.03,
    s * 0.28, 0, -0.15,
    s * 0.05, 0, 0.07,
    s * 0.28, 0, -0.15,
    s * 0.05, 0, -0.11,
  ]);
  g.setAttribute('position', new THREE.BufferAttribute(v, 3));
  const n = v.length / 3;
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * 3).fill(0).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  return paint(g, GREY, s);
}

function flyGeo() {
  const parts = bodyParts();
  parts.push(xform(wingQuad(-1), 0, 0.165, 0.01));
  parts.push(xform(wingQuad(1), 0, 0.165, 0.01));
  return unify(parts);
}

export function buildPigeons(ctx) {
  const { scene } = ctx;
  ctx.D.tickers ||= [];
  const G = new THREE.Group();
  G.name = 'pigeons';
  scene.add(G);
  const rand = mulberry32(20261002);

  // one shared unlit material; GPU flap via onBeforeCompile (MeshBasic-safe)
  const uTime = { value: 0 };
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: true });
  const baseCol = new THREE.Color(0xffffff);
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uPigeonTime = uTime;
    sh.vertexShader = 'attribute float aWing;\nattribute float aPhase;\nattribute float aAmp;\nuniform float uPigeonTime;\n'
      + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nfloat pgFlap = sin(uPigeonTime * 9.0 + aPhase) * aAmp * abs(aWing);\ntransformed.y += pgFlap * abs(transformed.x) * 0.7;');
  };

  // ---- ground flock: 26 (15 courtyard + 5 Al-Kas rim + 4 Mawazin beams + 2 parapet)
  const GY = 2.06; // esplanade pavement top (platform.js pave)
  const ground = [];
  const rimC = [20, 30]; // Al-Kas center (minorDomes.js place at 20,GY,30)
  const rimTop = 2.0 + 1.12 + 0.16; // basin wall + rim torus top
  for (const a of [0.3, 1.5, 2.6, 3.9, 5.2]) {
    ground.push({ x: rimC[0] + Math.cos(a) * 4.8, y: rimTop, z: rimC[1] + Math.sin(a) * 4.8, yaw: -a + Math.PI / 2 + (rand() - 0.5), peck: rand() < 0.4, ph: rand() * 6.28 });
  }
  const beamTop = 2.0 + 4.55 + 0.3; // Mawazin beam top (minorDomes.js)
  for (const [bx, bz] of [[12, -6.5], [-12, -6.5], [65.5, -72], [-65.5, -68]]) {
    ground.push({ x: bx, y: beamTop, z: bz, yaw: rand() * 6.28, peck: rand() < 0.5, ph: rand() * 6.28 });
  }
  ground.push({ x: 148.9, y: 3.5, z: 40, yaw: -Math.PI / 2, peck: false, ph: rand() * 6.28 }); // W parapet top
  ground.push({ x: 30, y: 3.5, z: -224, yaw: Math.PI, peck: false, ph: rand() * 6.28 });       // N parapet top
  let guard = 0;
  while (ground.length < 26 && guard++ < 400) { // courtyard scatter, clear of Al-Kas + kiosks
    const x = -40 + rand() * 100, z = -10 + rand() * 70;
    if (Math.hypot(x - rimC[0], z - rimC[1]) < 7.5) continue;
    if (Math.hypot(x + 45, z + 30) < 6) continue;
    ground.push({ x, y: GY, z, yaw: rand() * 6.28, peck: rand() < 0.45, ph: rand() * 6.28 });
  }

  const gGeo = groundGeo();
  gGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(new Float32Array(ground.length), 1));
  gGeo.setAttribute('aAmp', new THREE.InstancedBufferAttribute(new Float32Array(ground.length), 1));
  const gInst = new THREE.InstancedMesh(gGeo, mat, ground.length);
  gInst.castShadow = false; gInst.receiveShadow = false; gInst.frustumCulled = false;
  G.add(gInst);

  // ---- flight flock: 12 wheeling above the courtyard
  const FLY = 12;
  const flyers = [];
  for (let i = 0; i < FLY; i++) {
    flyers.push({
      r: 34 + (i % 4) * 7 + rand() * 4,
      h: 26 + (i % 3) * 5 + rand() * 3,
      sp: 0.07 + rand() * 0.05,
      ph: (i / FLY) * Math.PI * 2 + rand() * 0.5,
    });
  }
  const fGeo = flyGeo();
  const fPhase = new Float32Array(FLY), fAmp = new Float32Array(FLY);
  flyers.forEach((f, i) => { fPhase[i] = f.ph * 7.0; fAmp[i] = 0.75 + (i % 3) * 0.12; });
  fGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(fPhase, 1));
  fGeo.setAttribute('aAmp', new THREE.InstancedBufferAttribute(fAmp, 1));
  const fInst = new THREE.InstancedMesh(fGeo, mat, FLY);
  fInst.castShadow = false; fInst.receiveShadow = false; fInst.frustumCulled = false;
  G.add(fInst);

  const dummy = new THREE.Object3D();
  function tick(dt, t) {
    uTime.value = t;
    for (let i = 0; i < ground.length; i++) { // perched / pecking / idle
      const p = ground[i];
      const dip = p.peck ? Math.pow(Math.max(0, Math.sin(t * 1.4 + p.ph)), 3) * 0.62 : 0;
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(dip, p.yaw, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      gInst.setMatrixAt(i, dummy.matrix);
    }
    gInst.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < FLY; i++) { // wheeling flock over courtyard center
      const f = flyers[i];
      const a = t * f.sp + f.ph;
      const px = Math.cos(a) * f.r;
      const pz = 30 + Math.sin(a) * f.r * 0.75;
      const py = f.h + Math.sin(t * 0.5 + f.ph) * 2.0;
      const yaw = Math.atan2(-Math.sin(a) * f.r, Math.cos(a) * f.r * 0.75);
      dummy.position.set(px, py, pz);
      dummy.rotation.set(0, yaw, 0.32); // banked into the wheel
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      fInst.setMatrixAt(i, dummy.matrix);
    }
    fInst.instanceMatrix.needsUpdate = true;
    const st = ctx.D.lighting ? ctx.D.lighting.state : null; // night dim like flags
    if (st) mat.color.setScalar(baseCol.r * (1 - 0.72 * THREE.MathUtils.clamp(st.stars, 0, 1)));
  }
  tick(0, 0);
  ctx.D.tickers.push(tick);
  ctx.D.pigeons = { ground: ground.length, fly: FLY, calls: 2 };
  return G;
}
