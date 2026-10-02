// lighting.js — sun/sky/fog/environment + day-part presets with smooth transitions.
// Total lights created here: 1 directional + 1 hemisphere + 2 point lamps = 4 (≤26 budget).
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// html-port VIEWS (open-tree): golden {elev 6, azim 250}, morning {24, 110},
// midday {55, 170}, exposure 1. Map: dawn→morning, noon→midday,
// sunset→golden (azim E→W sweep 110→170→250 ✓). Night keeps verified values.
// Cloud cover .2/.25/.3 informs sprite-opacity ORDER (noon faintest); absolute
// sprite opacity stays volumetrics-lite tuned (cover fraction ≠ sprite alpha).
// Exposure: html-port's 1.0 lives in THEIR chain (auto-key + AGX + vignette);
// in ours (ACES + RoomEnvironment) 1.0 clips 28.7% at noon — verified
// .72/.88/.78 kept (sky-p5a downward-tuned). Sun geometry IS the port.
//Azim/elev applied exactly; intensities keep horizon falloff (low sun dimmer).
const PRESETS = {
  dawn:   { sun: 0xff9a5c, sunInt: 1.5,  elev: 24, azim: 110, hemi: 0.30, env: 1.0, fog: 0xe0a878, fogDen: 0.0022, exposure: 0.72, bloom: 0.30, bThr: 0.9, bRad: 0.4, stars: 0.0, lamp: 10, emissive: 1.2, moon: 0.0, cloud: 0xf6cfae, cloudOp: 0.62, turb: 6.0, ray: 2.2, mie: 0.006, mieG: 0.8 },
  noon:   { sun: 0xfff2dd, sunInt: 3.0,  elev: 55, azim: 170, hemi: 0.60, env: 0.85, fog: 0xcfe0ea, fogDen: 0.0008, exposure: 0.88, bloom: 0.15, bThr: 0.9, bRad: 0.4, stars: 0.0, lamp: 3,  emissive: 0.5, moon: 0.0, cloud: 0xffffff, cloudOp: 0.40, turb: 3.5, ray: 1.0, mie: 0.006, mieG: 0.8 },
  sunset: { sun: 0xffb168, sunInt: 2.0,  elev: 6,  azim: 250, hemi: 0.35, env: 0.7, fog: 0xc68c58, fogDen: 0.0013, exposure: 0.72, bloom: 0.30, bThr: 0.9, bRad: 0.4, stars: 0.0, lamp: 5, emissive: 1.6, moon: 0.0, cloud: 0xffd2a0, cloudOp: 0.55, turb: 6.0, ray: 1.8, mie: 0.0014, mieG: 0.62 },
  night:  { sun: 0x8aa4ff, sunInt: 0.35, elev: 32, azim: 40,  hemi: 0.12, env: 1.0, fog: 0x0b1020, fogDen: 0.0032, exposure: 0.60, bloom: 0.45, bThr: 0.9, bRad: 0.4, stars: 1.0, lamp: 7, emissive: 2.6, moon: 1.0, cloud: 0x1c2333, cloudOp: 0.30, turb: 6.0, ray: 2.2, mie: 0.006, mieG: 0.8 },
};

function snapshot(p) {
  return {
    sun: new THREE.Color(p.sun), sunInt: p.sunInt, elev: p.elev, azim: p.azim,
    hemi: p.hemi, env: p.env, fog: new THREE.Color(p.fog), fogDen: p.fogDen,
    exposure: p.exposure, bloom: p.bloom, bThr: p.bThr, bRad: p.bRad, stars: p.stars, lamp: p.lamp, emissive: p.emissive,
    moon: p.moon, cloud: new THREE.Color(p.cloud), cloudOp: p.cloudOp, turb: p.turb, ray: p.ray, mie: p.mie, mieG: p.mieG,
  };
}

export function buildLighting(ctx) {
  const { scene, renderer } = ctx;
  ctx.D.tickers ||= [];

  // renderer baseline: ACES tone mapping, soft shadows
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // image-based environment so gold/lead PBR reads correctly day & night
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  // physical sky
  const sky = new Sky();
  sky.scale.setScalar(2200);
  sky.material.uniforms.turbidity.value = 6; // all four driven per-preset in apply()
  sky.material.uniforms.rayleigh.value = 2.2;
  sky.material.uniforms.mieCoefficient.value = 0.006;
  sky.material.uniforms.mieDirectionalG.value = 0.8;
  scene.add(sky);

  // sun (key light) — 2048 shadow map, ±90m ortho bounds
  const sun = new THREE.DirectionalLight(0xffb168, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -90; sun.shadow.camera.right = 90;
  sun.shadow.camera.top = 90; sun.shadow.camera.bottom = -90;
  sun.shadow.camera.near = 10; sun.shadow.camera.far = 900;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.4;
  scene.add(sun);
  scene.add(sun.target);

  // sky bounce
  const hemi = new THREE.HemisphereLight(0xbdd3e6, 0x8a6f4d, 0.45);
  scene.add(hemi);

  // warm dusk haze
  scene.fog = new THREE.FogExp2(0xd9a06b, 0.0028);

  // interior accent lamps (no shadows): Qibli hall + Dome ambulatory
  const lampQ = new THREE.PointLight(0xffc37a, 18, 70, 2);
  lampQ.position.set(0, 9, 150);
  scene.add(lampQ);
  const lampD = new THREE.PointLight(0xffc37a, 18, 70, 2);
  lampD.position.set(0, 13.5, -70); // high + wide: softens the Rock hotspot below
  scene.add(lampD);

  // night stars (Points, inside the sky box which spans ±1100)
  const N = 700;
  const sp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2;
    const y = 0.06 + Math.random() * 0.94;
    const rxz = Math.sqrt(Math.max(0, 1 - y * y));
    const R = 800 + Math.random() * 200;
    sp[i * 3] = Math.cos(a) * rxz * R;
    sp[i * 3 + 1] = y * R;
    sp[i * 3 + 2] = Math.sin(a) * rxz * R;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xcfe0ff, size: 1.6, sizeAttenuation: false,
    transparent: true, opacity: 0, fog: false, depthWrite: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  stars.visible = false;
  stars.frustumCulled = false;
  scene.add(stars);

  // bright star layer (130 prominent stars, same night gate)
  const NB2 = 130;
  const sp2 = new Float32Array(NB2 * 3);
  for (let i = 0; i < NB2; i++) {
    const a = Math.random() * Math.PI * 2;
    const y = 0.15 + Math.random() * 0.85;
    const rxz = Math.sqrt(Math.max(0, 1 - y * y));
    const R = 850 + Math.random() * 150;
    sp2[i * 3] = Math.cos(a) * rxz * R;
    sp2[i * 3 + 1] = y * R;
    sp2[i * 3 + 2] = Math.sin(a) * rxz * R;
  }
  const starGeo2 = new THREE.BufferGeometry();
  starGeo2.setAttribute('position', new THREE.BufferAttribute(sp2, 3));
  const starMat2 = new THREE.PointsMaterial({
    color: 0xfff4e0, size: 2.8, sizeAttenuation: false,
    transparent: true, opacity: 0, fog: false, depthWrite: false,
  });
  const stars2 = new THREE.Points(starGeo2, starMat2);
  stars2.visible = false;
  stars2.frustumCulled = false;
  scene.add(stars2);

  // moon crescent (canvas horns-up crescent + halo sprites, emissive-only,
  // zero real lights). Parked on the night-sun vector so the Sky glow sits
  // behind it; opacity driven by the moon preset channel.
  // moon (emissive-look sprites only, zero real lights). Parked on the
  // night-sun vector so the Sky glow sits behind it; opacity driven by the
  // moon preset channel (0 at all day presets → hard glow-kill by day).
  // Two phases, one sprite (zero new draw calls): full mottled disc
  // (default night) + thin new-month crescent. Ghibli rule: disc ≤1.0 so
  // maria survive bloom; the halo carries the glow, restrained.
  function fullMoonTex() {
    const s = 256, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    // disc ~0.7 linear (ghibli: under bloom threshold so maria survive;
    // near-white sRGB blew to a blob in W4 first proof)
    const disc = g.createRadialGradient(128, 128, 10, 128, 128, 100);
    disc.addColorStop(0, '#d9d4c6');
    disc.addColorStop(0.8, '#c4beb0');
    disc.addColorStop(0.95, '#a8a294');
    disc.addColorStop(1, 'rgba(168,162,148,0)');
    g.fillStyle = disc;
    g.beginPath(); g.arc(128, 128, 100, 0, Math.PI * 2); g.fill();
    // maria blotches (soft, dark, under bloom threshold)
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    g.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 14; i++) {
      const x = 128 + (rnd() - 0.5) * 130, y = 128 + (rnd() - 0.5) * 130;
      const r = 8 + rnd() * 22;
      const m = g.createRadialGradient(x, y, 0, x, y, r);
      m.addColorStop(0, 'rgba(110,104,92,0.5)');
      m.addColorStop(1, 'rgba(110,104,92,0)');
      g.fillStyle = m;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function crescentTex() {
    const s = 256, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const disc = g.createRadialGradient(128, 140, 8, 128, 140, 70);
    disc.addColorStop(0, '#fffdf4');
    disc.addColorStop(0.75, '#f3e6c8');
    disc.addColorStop(1, 'rgba(243,230,200,0.85)');
    g.fillStyle = disc;
    g.beginPath(); g.arc(128, 140, 70, 0, Math.PI * 2); g.fill();
    // thin new-month sliver: deep top bite → ~24px lit band, horns reach
    // y≈123 (high horns-up). Was r62@(128,76) = half-moon thick — fixed.
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(128, 118, 68, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function haloTex() {
    const s = 256, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    // cool silver (ghibli moon-blue), restrained peak — warm white bloomed
    // brown over the indigo sky in W4 first proof
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, 'rgba(216,224,248,0.5)');
    grad.addColorStop(0.35, 'rgba(208,218,246,0.16)');
    grad.addColorStop(1, 'rgba(208,218,246,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const fullTex = fullMoonTex();
  const cresTex = crescentTex();
  const moonMat = new THREE.SpriteMaterial({ map: fullTex, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const moon = new THREE.Sprite(moonMat);
  moon.scale.set(130, 130, 1);
  const haloMat = new THREE.SpriteMaterial({ map: haloTex(), transparent: true, opacity: 0, fog: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.set(260, 260, 1); // restrained: was 420 (bloom-bleed risk)
  {
    // parked low NE crescent (elev ~11°): OrbitControls caps upward gaze at
    // ~3° above horizontal (maxPolarAngle), so a high moon could never frame.
    // The key light stays at night.elev 32 for modeling; mismatch invisible.
    const phi = THREE.MathUtils.degToRad(90 - 11);
    const theta = THREE.MathUtils.degToRad(PRESETS.night.azim);
    const mp = new THREE.Vector3().setFromSphericalCoords(1500, phi, theta);
    moon.position.copy(mp);
    halo.position.copy(mp);
  }
  moon.visible = false;
  halo.visible = false;
  moon.frustumCulled = false;
  halo.frustumCulled = false;
  scene.add(moon);
  scene.add(halo);

  // preset state with smooth lerp
  const cur = snapshot(PRESETS.sunset);
  let tgt = snapshot(PRESETS.sunset);
  let currentName = 'sunset';
  let elapsed = 0; // internal clock for hero-star shimmer

  function setPreset(name) {
    if (!PRESETS[name]) return;
    tgt = snapshot(PRESETS[name]);
    currentName = name;
  }

  function placeSun() {
    const phi = THREE.MathUtils.degToRad(90 - cur.elev);
    const theta = THREE.MathUtils.degToRad(cur.azim);
    sun.position.setFromSphericalCoords(320, phi, theta);
    // sky sun decouples at night: sink it below the horizon so the Sky shader
    // goes dark while the (bluish, dim) key light keeps shading as moonlight.
    // Driven by the lerped stars channel → smooth dusk transition, no pop.
    if (sky.material.uniforms.sunPosition) {
      const nightK = THREE.MathUtils.clamp(cur.stars, 0, 1);
      const skyElev = cur.elev + (-14 - cur.elev) * nightK;
      const skyPhi = THREE.MathUtils.degToRad(90 - skyElev);
      sky.material.uniforms.sunPosition.value.setFromSphericalCoords(320, skyPhi, theta);
    }
  }

  function apply() {
    sun.color.copy(cur.sun);
    sun.intensity = cur.sunInt;
    // shadow-systems skill §9: scale normal bias by world-space texel width
    // (ortho 180m / mapSize; base 0.4 tuned at 2048; mapSize owned by the
    // quality governor — read only, never written here).
    sun.shadow.normalBias = 0.4 * (2048 / sun.shadow.mapSize.x);
    sky.material.uniforms.turbidity.value = cur.turb;
    sky.material.uniforms.rayleigh.value = cur.ray;
    sky.material.uniforms.mieCoefficient.value = cur.mie; // sunset .0014: halves aura energy
    sky.material.uniforms.mieDirectionalG.value = cur.mieG; // sunset .62: softens HG peak ~2.5x
    // single-writer shared sun state (day-cycle skill §uSun*): direction goes
    // to shaders, color + luminance (intensity, linear-ish) follow the preset.
    if (ctx.D.sunUniforms) {
      ctx.D.sunUniforms.uSunDir.value.copy(sun.position).normalize();
      ctx.D.sunUniforms.uSunColor.value.copy(cur.sun);
      ctx.D.sunUniforms.uSunLum.value = cur.sunInt;
    }
    hemi.intensity = cur.hemi;
    // per-preset skylight IBL (r170 Scene.environmentIntensity): golden hour
    // carries less skylight than noon; night kept 1.0 (verified night look)
    if ('environmentIntensity' in scene) scene.environmentIntensity = cur.env;
    scene.fog.color.copy(cur.fog);
    scene.fog.density = cur.fogDen;
    renderer.toneMappingExposure = cur.exposure;
    starMat.opacity = cur.stars;
    stars.visible = cur.stars > 0.02;
    // hero-layer shimmer (ghibli .55+.45 sin feel, global approx — no shader):
    // dim layer steady so the field never breathes as one card.
    starMat2.opacity = cur.stars * (0.82 + 0.18 * Math.sin(elapsed * 1.6));
    stars2.visible = cur.stars > 0.02;
    moonMat.opacity = cur.moon;
    moon.visible = cur.moon > 0.02;
    haloMat.opacity = 0.28 * cur.moon; // restrained: was 0.55 (halo-bleed)
    halo.visible = cur.moon > 0.02;
    lampQ.intensity = cur.lamp;
    lampD.intensity = cur.lamp;
    if (ctx.D.bloomPass) {
      // w8-postspec §2 values, driven per preset (threshold is linear-HDR
      // pre-tonemap, so per-preset strength stays the right lever; .9/.4
      // match the spec'd constructor — no fight if main session applies it)
      ctx.D.bloomPass.strength = cur.bloom;
      ctx.D.bloomPass.threshold = cur.bThr;
      ctx.D.bloomPass.radius = cur.bRad;
    }
    if (ctx.M) {
      // emissive audit: day glass reflects sky (no emission); night windows read
      // lit-warm but never blow; goldTrim metal glows NEVER (env does the work);
      // glassBlue stays dark always (it is also the Al-Kas water disc).
      if (ctx.M.glassWarm) ctx.M.glassWarm.emissiveIntensity = Math.max(0, cur.emissive - 0.5) * 0.75;
      if (ctx.M.glassBlue) ctx.M.glassBlue.emissiveIntensity = 0.0;
      if (ctx.M.goldTrim) ctx.M.goldTrim.emissiveIntensity = 0.0;
    }
    placeSun();
  }

  // moon phase: 'full' (default night) | 'crescent' (thin new-month).
  // Map swap on the single sprite — zero new lights, zero new draw calls.
  function setMoonPhase(ph) {
    const cres = ph === 'crescent';
    if (moonMat.map === (cres ? cresTex : fullTex)) return;
    moonMat.map = cres ? cresTex : fullTex;
    moonMat.needsUpdate = true;
    moon.scale.set(cres ? 95 : 130, cres ? 95 : 130, 1); // delicate sliver
  }

  function tick(dt) {
    elapsed += Math.min(dt, 0.05);
    const k = 1 - Math.exp(-1.6 * dt);
    cur.sun.lerp(tgt.sun, k);
    cur.fog.lerp(tgt.fog, k);
    cur.cloud.lerp(tgt.cloud, k);
    for (const key of ['sunInt', 'elev', 'azim', 'hemi', 'env', 'fogDen', 'exposure', 'bloom', 'bThr', 'bRad', 'stars', 'lamp', 'emissive', 'moon', 'cloudOp', 'turb', 'ray', 'mie', 'mieG']) {
      cur[key] += (tgt[key] - cur[key]) * k;
      // snap: asymptotic lerp never lands exactly, which would keep the sun
      // (and the static shadow cache) perpetually dirty — settle hard.
      if (Math.abs(tgt[key] - cur[key]) < 1e-4) cur[key] = tgt[key];
    }
    if (cur.sun.getHex() === tgt.sun.getHex()) cur.sun.copy(tgt.sun);
    if (cur.fog.getHex() === tgt.fog.getHex()) cur.fog.copy(tgt.fog);
    if (cur.cloud.getHex() === tgt.cloud.getHex()) cur.cloud.copy(tgt.cloud);
    apply();
  }

  apply();
  ctx.D.lights = { sun, hemi, sky, stars, lampQ, lampD };
  // single-writer sun state for future shader consumers (day-cycle skill:
  // uSunDir/uSunColor/uSunLum). No consumers yet — sprites tint CPU-side —
  // but every sun-driven value now has exactly one source of truth.
  const sunDirV = new THREE.Vector3(0, 1, 0);
  const sunColorV = new THREE.Color(0xffffff);
  ctx.D.sunUniforms = {
    uSunDir: { value: sunDirV },
    uSunColor: { value: sunColorV },
    uSunLum: { value: 1.0 },
  };
  const api = { setPreset, setMoonPhase, tick, get preset() { return currentName; }, get state() { return cur; } };
  ctx.D.lighting = api;
  return api;
}
