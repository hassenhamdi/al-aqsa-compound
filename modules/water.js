// water.js — Al-Kas basin water (W7).
// Realistic basin water, WebGL-safe: analytic ripple normals (3 directional
// trains + fountain drip rings, ghibli slope-map numbers folded to constants)
// + bounded CPU heightfield ripple sim (48x48 wave eq, drip sources — NO PBF,
// no GPU sim), Beer-Lambert absorption with declared constant-depth fallback
// (basin 0.55 m, dishes 0.12 m), Schlick Fresnel F0=0.02, sun glints,
// Dome-of-the-Rock mirror lobe (alkas-reflection.jpg: gold dome in basin),
// fence-bar stripe shimmer, rim/pedestal foam. Zero real lights.
// Refs: _skills/ghibli/threejs-webgl-realistic-water.md (numbers),
//       _skills/awesome/skills/threejs-water-optics/SKILL.md (analytic order,
//       normal-only surface, declared fallback, energy-balanced mix).
import * as THREE from 'three';

const SIM_N = 48; // basin-level sim: 2304 cells, stepped at 30 Hz — trivial CPU

function makeSim() {
  const N = SIM_N;
  const h = new Float32Array(N * N);
  const v = new Float32Array(N * N);
  const data = new Uint8Array(N * N);
  data.fill(128);
  const tex = new THREE.DataTexture(data, N, N, THREE.RedFormat, THREE.UnsignedByteType);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  const id = (x, y) => y * N + x;
  function drip(cx, cy, amp) {
    const R = 3;
    for (let y = Math.max(1, cy - R); y <= Math.min(N - 2, cy + R); y++)
      for (let x = Math.max(1, cx - R); x <= Math.min(N - 2, cx + R); x++) {
        const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        v[id(x, y)] += amp * Math.exp(-d2 / 2.2);
      }
  }
  function step() {
    for (let y = 1; y < N - 1; y++)
      for (let x = 1; x < N - 1; x++) {
        const i = id(x, y);
        const lap = (h[i - 1] + h[i + 1] + h[i - N] + h[i + N]) * 0.25 - h[i];
        v[i] = (v[i] + lap * 0.9) * 0.985;
      }
    for (let i = 0; i < N * N; i++) {
      h[i] = THREE.MathUtils.clamp(h[i] + v[i], -2, 2);
      data[i] = THREE.MathUtils.clamp(Math.round(128 + h[i] * 60), 0, 255);
    }
    tex.needsUpdate = true;
  }
  return { tex, drip, step };
}

const VERT = /* glsl */`
#include <fog_pars_vertex>
varying vec2 vUv;
varying vec3 vWPos;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWPos = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const FRAG = /* glsl */`
#include <fog_pars_fragment>
varying vec2 vUv;
varying vec3 vWPos;
uniform float uTime;
uniform sampler2D uSim;
uniform float uSimAmp;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uSkyHor;
uniform vec3 uSkyZen;
uniform vec3 uDomeDir;
uniform vec3 uDomeCol;
uniform float uDomeAmt;
uniform float uDepth;
uniform float uRadius;
uniform float uBars;
uniform float uAlpha;

// shared displacement/normal contract: normals derived from the same analytic
// trains that would displace the surface (normal-only surface, flat geometry)
vec2 waveGrad(vec2 p, float t) {
  vec2 g = vec2(0.0);
  g += vec2(0.83, 0.55) * (0.11 * 2.1 * cos(dot(p, vec2(0.83, 0.55)) * 2.1 + t * 1.7));
  g += vec2(-0.42, 0.91) * (0.075 * 3.7 * cos(dot(p, vec2(-0.42, 0.91)) * 3.7 - t * 2.3));
  g += vec2(0.97, -0.24) * (0.045 * 6.3 * cos(dot(p, vec2(0.97, -0.24)) * 6.3 + t * 3.1));
  float L = max(length(p), 1e-3);
  float ring = cos(L * 7.0 - t * 4.2) * exp(-L * 0.5);
  g += (p / L) * ring * 0.12;
  return g;
}

void main() {
  vec2 c = vUv * 2.0 - 1.0;
  float r = length(c);
  vec2 p = c * uRadius;
  float dist = distance(cameraPosition, vWPos);
  float att = 0.9 / (1.0 + dist * 0.035); // ripple distance fade (ghibli)
  vec2 g = waveGrad(p, uTime) * att;
  float e = 1.0 / ${SIM_N}.0;
  float hx = texture2D(uSim, vUv + vec2(e, 0.0)).r - texture2D(uSim, vUv - vec2(e, 0.0)).r;
  float hz = texture2D(uSim, vUv + vec2(0.0, e)).r - texture2D(uSim, vUv - vec2(0.0, e)).r;
  g += vec2(hx, hz) * uSimAmp * att;
  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 V = normalize(cameraPosition - vWPos);
  vec3 R = reflect(-V, N);
  R.y = abs(R.y);
  float ndv = max(dot(N, V), 0.0);
  float F = 0.02 + 0.98 * pow(1.0 - ndv, 5.0); // Schlick, F0 = 0.02
  // body: Beer-Lambert, constant-depth fallback (declared, not scene thickness)
  vec3 absorb = vec3(0.95, 0.24, 0.20);
  vec3 T = exp(-uDepth * absorb);
  float shimmer = texture2D(uSim, vUv).r - 0.5;
  vec3 body = uDeep * (0.5 + 0.5 * T.g) + uShallow * (1.0 - T.r) * 0.4;
  body += uSkyHor * 0.06; // ambient lift: steep views never go black
  body += vec3(0.06, 0.09, 0.08) * shimmer;
  // reflection: live sky horizon + sun tint; Dome mirror lobe (gold, ~10 deg)
  vec3 sky = mix(uSkyHor, uSkyZen, clamp(R.y * 1.4, 0.0, 1.0));
  sky += uSunCol * pow(max(dot(R, uSunDir), 0.0), 6.0) * 0.3;
  float ang = acos(clamp(dot(R, uDomeDir), -1.0, 1.0));
  sky += uDomeCol * exp(-ang * ang / 0.02) * uDomeAmt;
  // fence-bar stripe shimmer near rim (18 bars)
  float bars = 0.5 + 0.5 * cos(atan(c.y, c.x) * uBars);
  sky *= 1.0 - smoothstep(0.7, 0.98, r) * bars * 0.22;
  vec3 col = mix(body, sky, F); // energy-conserving blend, no add-all
  col += uSunCol * pow(max(dot(R, uSunDir), 0.0), 700.0) * 1.6; // glints
  float foam = smoothstep(0.955, 1.0, r) + (1.0 - smoothstep(0.05, 0.13, r)) * 0.7;
  foam *= 0.6 + 0.4 * sin(uTime * 3.0 + r * 36.0);
  col = mix(col, vec3(0.82, 0.86, 0.80), clamp(foam, 0.0, 1.0) * 0.45);
  gl_FragColor = vec4(col, uAlpha);
  #include <fog_fragment>
}`;

const ZENITH = { dawn: 0x7fa8c8, noon: 0x3f7fd0, sunset: 0x5f7fc0, night: 0x0a1230 };

function waterMaterial(sim, opts) {
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 }, uSim: { value: sim.tex }, uSimAmp: { value: 0.45 },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunCol: { value: new THREE.Color(1, 0.8, 0.6) },
      uDeep: { value: new THREE.Color(0x14342a) },
      uShallow: { value: new THREE.Color(0x4a6a58) },
      uSkyHor: { value: new THREE.Color(0xd9a06b) },
      uSkyZen: { value: new THREE.Color(0x5f7fc0) },
      uDomeDir: { value: new THREE.Vector3(0, 1, 0) },
      uDomeCol: { value: new THREE.Color(0xd9a441).multiplyScalar(0.9) },
      uDomeAmt: { value: opts.dome }, uDepth: { value: opts.depth },
      uRadius: { value: opts.radius }, uBars: { value: 18 },
      uAlpha: { value: opts.alpha },
    },
  ]);
  const m = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false, fog: true,
  });
  return m;
}

export function buildWater(ctx) {
  const { scene } = ctx;
  ctx.D.tickers ||= [];
  const basin = scene.getObjectByName('alkas-water');
  if (!basin) return null;
  const sim = makeSim();

  const basinPos = basin.getWorldPosition(new THREE.Vector3());
  // Dome gold mid-height ~18 m at (0,?,-70): mirror-lobe target direction
  const domeDir = new THREE.Vector3(0, 18, -70).sub(basinPos).normalize();

  const basinMat = waterMaterial(sim, { depth: 0.55, radius: 4.55, dome: 1.0, alpha: 0.93 });
  basinMat.uniforms.uDomeDir.value.copy(domeDir);
  basinMat.uniforms.uSim.value = sim.tex; // merge() clones textures: rebind live sim tex
  basin.material = basinMat;
  basin.renderOrder = 2;

  const dishMat = waterMaterial(sim, { depth: 0.12, radius: 1.4, dome: 0.5, alpha: 0.95 });
  dishMat.uniforms.uDomeDir.value.copy(domeDir);
  dishMat.uniforms.uSim.value = sim.tex;
  for (const nm of ['alkas-bowl-water', 'alkas-dish-water']) {
    const w = scene.getObjectByName(nm);
    if (w) { w.material = dishMat; w.renderOrder = 2; }
  }

  let acc = 0, dripT = 0, dropT = 0;
  ctx.D.tickers.push((dt, t) => {
    const tt = t || 0;
    const step = Math.min(dt || 0.016, 0.05);
    acc += step; dripT += step; dropT += step;
    if (dripT > 0.4) { dripT = 0; sim.drip(SIM_N >> 1, SIM_N >> 1, 1.2); } // fountain drip
    if (dropT > 0.9) { // stray drop (wind/visitors)
      dropT = 0;
      sim.drip(6 + Math.floor(Math.random() * (SIM_N - 12)), 6 + Math.floor(Math.random() * (SIM_N - 12)), 0.7);
    }
    let n = 0;
    while (acc > 1 / 30 && n < 2) { sim.step(); acc -= 1 / 30; n++; }
    for (const m of [basinMat, dishMat]) {
      m.uniforms.uTime.value = tt;
      const sun = ctx.D.lights && ctx.D.lights.sun;
      if (sun) {
        m.uniforms.uSunDir.value.copy(sun.position).normalize();
        m.uniforms.uSunCol.value.copy(sun.color).multiplyScalar(Math.min(sun.intensity * 0.25, 1.0));
      }
      if (scene.fog) m.uniforms.uSkyHor.value.copy(scene.fog.color);
      const pre = ctx.D.lightApi && ctx.D.lightApi.preset;
      if (pre && ZENITH[pre] !== undefined) m.uniforms.uSkyZen.value.setHex(ZENITH[pre]);
    }
  });
  return { basinMat, dishMat };
}
