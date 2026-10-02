// atmosphere.js — birds, mist, clouds, waving flags, dust. No shadow flags.
// Registers one ticker into ctx.D.tickers; called as ticker(dt, elapsed).
import * as THREE from 'three';

function radialSprite(size = 128, stops = [[0, 'rgba(255,255,255,.85)'], [0.5, 'rgba(255,255,255,.28)'], [1, 'rgba(255,255,255,0)']]) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) grad.addColorStop(o, col);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function flagTexture() {
  // Palestine-inspired: black / white / green stripes + red hoist triangle
  const c = document.createElement('canvas');
  c.width = 128; c.height = 96;
  const g = c.getContext('2d');
  g.fillStyle = '#111'; g.fillRect(0, 0, 128, 32);
  g.fillStyle = '#f5f5f5'; g.fillRect(0, 32, 128, 32);
  g.fillStyle = '#0d7a3f'; g.fillRect(0, 64, 128, 32);
  g.fillStyle = '#c8102e';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(44, 48); g.lineTo(0, 96); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildAtmosphere(ctx) {
  const { scene } = ctx;
  ctx.D.tickers ||= [];
  const noShadow = (m) => { m.castShadow = false; m.receiveShadow = false; return m; };

  // ---- 9 birds: cone body + 2 triangle wings, MeshBasic dark ----
  // 3 InstancedMesh (bodies / left / right wings); matrices composed per frame
  const birds = [];
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x23202a, side: THREE.DoubleSide, fog: true });
  const wingGeoR = new THREE.BufferGeometry();
  wingGeoR.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.12, 1.25, 0, 0.32, 1.25, 0, -0.32], 3));
  wingGeoR.computeVertexNormals();
  const wingGeoL = wingGeoR.clone();
  wingGeoL.scale(-1, 1, 1);
  const bodyGeo = new THREE.ConeGeometry(0.16, 1.0, 6);
  bodyGeo.rotateX(Math.PI / 2);
  const NB = 9;
  const bodyInst = new THREE.InstancedMesh(bodyGeo, birdMat, NB);
  const wingLInst = new THREE.InstancedMesh(wingGeoL, birdMat, NB);
  const wingRInst = new THREE.InstancedMesh(wingGeoR, birdMat, NB);
  for (const im of [bodyInst, wingLInst, wingRInst]) {
    im.castShadow = false; im.receiveShadow = false; im.frustumCulled = false;
    scene.add(im);
  }
  const _m = new THREE.Matrix4();
  const _mt = new THREE.Matrix4();
  for (let i = 0; i < NB; i++) {
    birds.push({
      i,
      r: 55 + (i % 5) * 14 + Math.random() * 8,
      h: 46 + (i % 4) * 8 + Math.random() * 4,
      sp: 0.06 + Math.random() * 0.07,
      ph: Math.random() * Math.PI * 2,
    });
  }

  // ---- mist: 220 soft points over the esplanade ----
  const MIST = 220;
  const mistPos = new Float32Array(MIST * 3);
  const mistSpd = new Float32Array(MIST);
  for (let i = 0; i < MIST; i++) {
    mistPos[i * 3] = (Math.random() - 0.5) * 300;
    mistPos[i * 3 + 1] = 2.5 + Math.random() * 8;
    mistPos[i * 3 + 2] = (Math.random() - 0.5) * 440;
    mistSpd[i] = 0.6 + Math.random() * 1.4;
  }
  const mistGeo = new THREE.BufferGeometry();
  mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
  const mist = new THREE.Points(mistGeo, new THREE.PointsMaterial({
    map: radialSprite(), size: 14, transparent: true, opacity: 0.10,
    depthWrite: false, color: 0xf3e2c8,
  }));
  mist.frustumCulled = false;
  noShadow(mist);
  scene.add(mist);

  // ---- 6 drifting cloud billboards (volumetrics-lite: per-preset tint +
  // opacity via lighting state; puffier multi-blob texture) ----
  const cloudTex = radialSprite(256, [[0, 'rgba(255,244,230,.95)'], [0.45, 'rgba(255,240,225,.45)'], [1, 'rgba(255,240,225,0)']]);
  const puffTex = (() => {
    const s = 256, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const blob = (x, y, r, a) => {
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(255,246,232,${a})`);
      grad.addColorStop(0.55, `rgba(255,242,226,${a * 0.45})`);
      grad.addColorStop(1, 'rgba(255,242,226,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
    };
    blob(128, 150, 95, 0.9); blob(80, 165, 60, 0.7); blob(178, 165, 62, 0.7);
    blob(105, 120, 52, 0.6); blob(152, 118, 55, 0.6);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const clouds = [];
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: i % 2 ? cloudTex : puffTex, transparent: true, opacity: 0.6, depthWrite: false, fog: false }));
    s.position.set((Math.random() - 0.5) * 700, 130 + Math.random() * 70, (Math.random() - 0.5) * 700);
    const w = 130 + Math.random() * 110;
    s.scale.set(w, w * 0.42, 1);
    noShadow(s);
    scene.add(s);
    clouds.push({ s, y0: s.position.y, drift: 1.0 + Math.random() * 1.6, v: 0.8 + Math.random() * 0.4, ph: Math.random() * Math.PI * 2 });
  }

  // wind (html-port defaults: wind .35; gust = (.55+.45·noise)·uGust).
  // Summed-sine pseudo-noise — no deps, deterministic per frame.
  let wind = 0.35;
  const windN = (t) => 0.5 + 0.28 * Math.sin(t * 0.53) + 0.22 * Math.sin(t * 1.31 + 1.7);
  const gustAt = (t, ph = 0) => (0.55 + 0.45 * windN(t + ph)) * (wind / 0.35);
  function setWind(v) { wind = Math.max(0, Math.min(1.5, v)); }

  // ---- 4 waving flags (Palestine-inspired) on poles ----
  // flag cloth is unlit MeshBasic: dim toward night via lighting state
  const flags = [];
  const flagMats = [];
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.5, metalness: 0.7 });
  const fTex = flagTexture();
  const flagSpots = [[-50, -125], [50, -125], [-70, 122], [70, 122]];
  for (let i = 0; i < flagSpots.length; i++) {
    const [fx, fz] = flagSpots[i];
    const baseY = fz < 0 ? 5.2 : 3.2; // terrace top vs qibli terrace top
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 9, 8), poleMat);
    pole.position.set(fx, baseY + 4.5, fz);
    noShadow(pole);
    scene.add(pole);
    const fg = new THREE.PlaneGeometry(3.1, 1.9, 12, 6);
    fg.translate(1.55, 0, 0); // hoist at x=0
    const fm = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ map: fTex, side: THREE.DoubleSide, fog: true }));
    fm.position.set(fx + 0.12, baseY + 7.6, fz);
    noShadow(fm);
    scene.add(fm);
    flagMats.push(fm.material);
    flags.push({ mesh: fm, base: fg.attributes.position.array.slice(), ph: i * 1.7 });
  }

  // ---- dust motes ----
  const DUST = 260;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 300;
    dustPos[i * 3 + 1] = 2.5 + Math.random() * 12;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 440;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xffd9a0, size: 0.45, transparent: true, opacity: 0.35,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  dust.frustumCulled = false;
  noShadow(dust);
  scene.add(dust);

  const mistMat = mist.material;
  const dustMat = dust.material;

  function tick(dt, t) {
    // birds: circular soaring + wing flap (M = T(pos)·Ry(yaw)·T(±0.08)·Rz(flap))
    for (const b of birds) {
      const a = t * b.sp + b.ph;
      const px = Math.cos(a) * b.r, py = b.h + Math.sin(t * 0.7 + b.ph) * 3, pz = Math.sin(a) * b.r * 0.7 - 20;
      const yaw = Math.atan2(-Math.sin(a) * b.r, Math.cos(a) * b.r * 0.7);
      const flap = Math.sin(t * 9 + b.ph) * 0.55;
      _m.identity();
      _mt.makeTranslation(px, py, pz); _m.multiply(_mt);
      _mt.makeRotationY(yaw); _m.multiply(_mt);
      bodyInst.setMatrixAt(b.i, _m);
      _mt.makeTranslation(-0.08, 0, 0); _m.multiply(_mt);
      _mt.makeRotationZ(-0.12 - flap); _m.multiply(_mt);
      wingLInst.setMatrixAt(b.i, _m);
      // rebuild base for right wing (translation differs)
      _m.identity();
      _mt.makeTranslation(px, py, pz); _m.multiply(_mt);
      _mt.makeRotationY(yaw); _m.multiply(_mt);
      _mt.makeTranslation(0.08, 0, 0); _m.multiply(_mt);
      _mt.makeRotationZ(0.12 + flap); _m.multiply(_mt);
      wingRInst.setMatrixAt(b.i, _m);
    }
    bodyInst.instanceMatrix.needsUpdate = true;
    wingLInst.instanceMatrix.needsUpdate = true;
    wingRInst.instanceMatrix.needsUpdate = true;
    // mist drift + wrap (wind-scaled)
    const mp = mistGeo.attributes.position.array;
    const gMist = 0.5 + gustAt(t);
    for (let i = 0; i < MIST; i++) {
      mp[i * 3] += mistSpd[i] * gMist * dt;
      if (mp[i * 3] > 170) mp[i * 3] = -170;
    }
    mistGeo.attributes.position.needsUpdate = true;
    // clouds: wind-driven drift + wrap + gentle bob; tint/opacity follow the
    // lighting preset (volumetrics-lite). Night tint stays mid-dark (ghibli:
    // night clouds go white fast) — glow-kill at night included.
    const st = ctx.D.lighting ? ctx.D.lighting.state : null;
    for (const c of clouds) {
      const g = gustAt(t, c.ph);
      c.s.position.x += c.drift * g * dt;
      c.s.position.y = c.y0 + Math.sin(t * 0.3 + c.ph) * 3;
      if (c.s.position.x > 420) c.s.position.x = -420;
      if (st) {
        c.s.material.color.copy(st.cloud);
        c.s.material.opacity = st.cloudOp * c.v;
      }
    }
    // flags: vertex wave, amplitude grows away from hoist, scaled by gust
    const gFlag = 0.6 + 0.8 * gustAt(t);
    for (const f of flags) {
      const p = f.mesh.geometry.attributes.position;
      const arr = p.array, base = f.base;
      for (let i = 0; i < p.count; i++) {
        const bx = base[i * 3];
        const k = bx / 3.1;
        arr[i * 3 + 2] = (Math.sin(bx * 1.9 + t * 5 + f.ph) * 0.22 * k
          + Math.sin(bx * 4.2 - t * 7.3 + f.ph) * 0.06 * k) * gFlag;
      }
      p.needsUpdate = true;
      f.mesh.geometry.computeVertexNormals();
    }
    // dust: wind + bob (wind-scaled advection)
    const dp = dustGeo.attributes.position.array;
    const gDust = 0.5 + gustAt(t);
    for (let i = 0; i < DUST; i++) {
      dp[i * 3] += dt * (1.2 + Math.sin(t * 0.5 + i) * 0.5) * gDust;
      dp[i * 3 + 1] += Math.sin(t * 1.3 + i * 1.7) * dt * 0.35;
      if (dp[i * 3] > 160) dp[i * 3] = -160;
      if (dp[i * 3 + 1] < 2.2) dp[i * 3 + 1] = 2.2;
      if (dp[i * 3 + 1] > 15) dp[i * 3 + 1] = 15;
    }
    dustGeo.attributes.position.needsUpdate = true;
    // night dimming: mist/dust fade, unlit flag cloth darkens (stars≈night factor)
    if (st) {
      const night = THREE.MathUtils.clamp(st.stars, 0, 1);
      mistMat.opacity = 0.10 * (1 - 0.6 * night);
      dustMat.opacity = 0.35 * (1 - 0.5 * night);
      const dim = 1 - 0.72 * night;
      for (const m of flagMats) m.color.setScalar(dim);
    }
  }

  ctx.D.tickers.push(tick);
  const atmoApi = { tick, setWind, get wind() { return wind; } };
  ctx.D.atmo = atmoApi;
  return atmoApi;
}
