// character.js — visitor avatar + first-person mode.
// Modes: orbit | walk (third-person follow, fallback) | fps (pointer-lock,
// eye-level 1.7 m, WASD + Shift, head-bob). E teleports into Qibli / Dome
// interiors in walk AND fps. V toggles walk<->fps. Space jumps (grounded
// raycast + analytic ground). Stairs: Dome-terrace 4-side step ramps and
// Qibli-terrace edge ramps are climbable (step-up <= 0.55 m); terrace walls
// and mosque masses block. Exports { tick, setMode } (+ jump/stair state).
import * as THREE from 'three';
import { buildFreecam } from './freecam.js';

const PX = 147;   // walk clamp: platform 300 wide minus margin
const PZ = 222;   // walk clamp: platform 450 deep minus margin
const EYE = 1.7;  // eye height above feet
const LOOK = 0.0025; // mouse sensitivity rad/px
const GRAV = 12.5;   // jump gravity m/s^2
const JUMP_V = 5.0;  // jump impulse (~1.0 m hop)
const STEP_MAX = 0.55; // max climbable step-up (terrace stair rise is 0.45)
const PLAZA_Y = 2.1;   // esplanade feet height (pave top 2.06)
const TERR_Y = 5.22;   // Dome terrace top feet (2 + 3.2 + 0.02)
const QTERR_Y = 3.2;   // Qibli terrace slab top (2.6 + 0.6)

// Analytic walkable ground (feet y). Terrace slab + stair-lane ramps that
// bridge plaza->terrace past the 3.1 m terrace wall; Qibli slab + synthetic
// edge ramps on the open lobes (|x|>=30, clear of the prayer-hall walls).
function analyticY(x, z) {
  let g = PLAZA_Y;
  const ax = Math.abs(x), azt = Math.abs(z + 70);
  if (ax <= 55.9 && azt <= 55.9) g = TERR_Y;
  if (ax >= 4.2 && ax <= 7.2) { // N/S stair lanes (centre |x|<4.2 is the gable)
    if (z > -14.8 && z < -1.4) g = Math.max(g, PLAZA_Y + ((-1.4 - z) / 13.4) * (TERR_Y - PLAZA_Y));
    if (z > -138.6 && z < -125.2) g = Math.max(g, PLAZA_Y + ((z + 138.6) / 13.4) * (TERR_Y - PLAZA_Y));
  }
  if (azt >= 4.2 && azt <= 7.2) { // E/W stair lanes
    if (x > 55.2 && x < 68.6) g = Math.max(g, PLAZA_Y + ((68.6 - x) / 13.4) * (TERR_Y - PLAZA_Y));
    if (x > -68.6 && x < -55.2) g = Math.max(g, PLAZA_Y + ((x + 68.6) / 13.4) * (TERR_Y - PLAZA_Y));
  }
  if (ax <= 75.5 && z >= 119.5 && z <= 180.5) g = Math.max(g, QTERR_Y);
  if (ax >= 30 && ax <= 75) { // Qibli edge ramps (lobes only)
    if (z >= 117 && z < 120) g = Math.max(g, PLAZA_Y + ((z - 117) / 3) * (QTERR_Y - PLAZA_Y));
    if (z > 180 && z <= 183) g = Math.max(g, PLAZA_Y + ((183 - z) / 3) * (QTERR_Y - PLAZA_Y));
  }
  if (z >= 117 && z <= 183) {
    if (x > 75 && x <= 78) g = Math.max(g, PLAZA_Y + ((x - 75) / 3) * (QTERR_Y - PLAZA_Y));
    if (x < -75 && x >= -78) g = Math.max(g, PLAZA_Y + ((-75 - x) / 3) * (QTERR_Y - PLAZA_Y));
  }
  return g;
}

function stairBand(x, z) { // Dome-terrace stair corridors pierce the mass collider
  const ax = Math.abs(x), azt = Math.abs(z + 70);
  return (ax >= 4.2 && ax <= 7.2 && ((z > -14.8 && z < -1.4) || (z > -138.6 && z < -125.2)))
    || (azt >= 4.2 && azt <= 7.2 && ((x > 55.2 && x < 68.6) || (x > -68.6 && x < -55.2)));
}

function qibliLobe(x, z) { // open Qibli-terrace lobes (outside hall walls x±28)
  return Math.abs(x) > 28.5 && Math.abs(x) <= 78 && z >= 116 && z <= 184;
}

export function buildCharacter(ctx) {
  const { scene, camera, controls } = ctx;
  const renderer = ctx.renderer;
  const canvas = renderer ? renderer.domElement : null;
  ctx.D.tickers ||= [];

  const skin = new THREE.MeshStandardMaterial({ color: 0xc9a06a, roughness: 0.7 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x2e6f6a, roughness: 0.8 });
  const clothDark = new THREE.MeshStandardMaterial({ color: 0x1e3a3a, roughness: 0.85 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2ede0, roughness: 0.85 });

  const g = new THREE.Group();
  g.name = 'visitor';
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.85, 6, 14), cloth);
  body.position.y = 1.05;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), skin);
  head.position.y = 1.95;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.30, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), white);
  cap.position.y = 1.99;
  const armGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.72, 8);
  armGeo.translate(0, -0.36, 0); // pivot at shoulder
  const armL = new THREE.Mesh(armGeo, clothDark);
  armL.position.set(-0.46, 1.55, 0);
  const armR = new THREE.Mesh(armGeo, clothDark);
  armR.position.set(0.46, 1.55, 0);
  const legGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.78, 8);
  legGeo.translate(0, -0.39, 0); // pivot at hip
  const legL = new THREE.Mesh(legGeo, clothDark);
  legL.position.set(-0.16, 0.78, 0);
  const legR = new THREE.Mesh(legGeo, clothDark);
  legR.position.set(0.16, 0.78, 0);
  for (const m of [body, head, cap, armL, armR, legL, legR]) { m.castShadow = false; m.receiveShadow = true; g.add(m); }
  g.position.set(0, PLAZA_Y, 60);
  scene.add(g);

  const qibliDoor = new THREE.Vector3(0, 2.1, 118);
  const domeDoor = new THREE.Vector3(0, 2.1, -12);

  const state = {
    mode: 'orbit', // orbit | walk | fps
    keys: {},
    heading: Math.PI,
    yaw: 0, pitch: 0, // fps look (yaw 0 = -z/north)
    bob: 0,
    phase: 0,
    inside: null, // null | 'qibli' | 'dome'
    exit: new THREE.Vector3(0, 2.1, 60),
    exitYaw: 0,
    lastUser: -10,
    lockWanted: false,
    vy: 0,        // vertical velocity (jump / falls)
    grounded: true,
  };

  const toast = (m) => { if (ctx.toast) ctx.toast(m); };
  const now = () => performance.now() / 1000;
  controls.addEventListener('start', () => { state.lastUser = now(); });

  // Ground probe: single downward ray vs the platform group (stairs/terrace
  // slabs refine the analytic ramps to exact step tops). Cached lazily so the
  // Phase-1 merge pass has already run by first tick.
  const _ray = new THREE.Raycaster();
  const _down = new THREE.Vector3(0, -1, 0);
  const _org = new THREE.Vector3();
  let _walkRoot = null;
  function rayGroundY(x, y, z) {
    if (!_walkRoot) {
      _walkRoot = scene.getObjectByName('platform');
      if (!_walkRoot) return null;
      _ray.far = 4;
    }
    _org.set(x, y + 1.2, z);
    _ray.set(_org, _down);
    const hits = _ray.intersectObject(_walkRoot, true);
    if (!hits.length) return null;
    return hits[0].point.y;
  }

  function groundAt(x, z, feetY) {
    const ga = analyticY(x, z);
    const hr = rayGroundY(x, feetY, z);
    // Accept the ray only when it refines (step tops), never when it would
    // teleport (arch above, retaining wall far below).
    if (hr !== null && hr <= feetY + STEP_MAX + 0.02 && hr >= ga - 1.5) return Math.max(ga, hr);
    return ga;
  }

  function tryJump() {
    if (state.inside || state.mode === 'orbit') return;
    if (ctx.D.freeApi && ctx.D.freeApi.active) return;
    if (state.grounded) { state.vy = JUMP_V; state.grounded = false; }
  }

  function interiorOf(name) {
    if (name === 'qibli') return ctx.D.qibliInterior || new THREE.Vector3(0, 3.6, 150);
    return ctx.D.domeInterior || new THREE.Vector3(0, 5.4, -70);
  }

  function enter() {
    if (state.mode !== 'walk' && state.mode !== 'fps') { toast('Switch to Walk mode, then press E near a mosque'); return; }
    if (state.inside) {
      g.position.copy(state.exit);
      state.inside = null;
      state.vy = 0; state.grounded = true;
      if (state.mode === 'fps') state.yaw = state.exitYaw;
      toast('Back outside on the esplanade');
      return;
    }
    const p = g.position;
    const dQ = Math.hypot(p.x - qibliDoor.x, p.z - qibliDoor.z);
    const dD = Math.hypot(p.x - domeDoor.x, p.z - domeDoor.z);
    const target = dQ <= dD ? 'qibli' : 'dome';
    state.exit.copy(p);
    state.exitYaw = state.yaw;
    g.position.copy(interiorOf(target));
    state.inside = target;
    state.vy = 0; state.grounded = true;
    // face the point of interest: mihrab south (+z) in Qibli, north in Dome
    if (state.mode === 'fps') state.yaw = target === 'qibli' ? Math.PI : 0;
    toast(target === 'qibli' ? 'Inside the Qibli prayer hall — mihrab ahead' : 'Inside the Dome of the Rock ambulatory');
  }

  function dropToTarget() {
    // drop the visitor under the current orbit target, snapped to walk ground
    const x = THREE.MathUtils.clamp(controls.target.x, -PX, PX);
    const z = THREE.MathUtils.clamp(controls.target.z, -PZ, PZ);
    g.position.set(x, analyticY(x, z), z);
    state.exit.copy(g.position);
    state.vy = 0; state.grounded = true;
  }

  function lockPointer() {
    if (!canvas || !canvas.requestPointerLock) return false;
    if (document.pointerLockElement === canvas) return true;
    try {
      const r = canvas.requestPointerLock();
      if (r && r.catch) r.catch(() => {});
      return true;
    } catch { return false; }
  }
  function unlockPointer() {
    if (document.pointerLockElement) { try { document.exitPointerLock(); } catch {} }
  }

  function setMode(m) {
    const prev = state.mode;
    state.mode = m === 'fps' ? 'fps' : m === 'walk' ? 'walk' : 'orbit';
    if (state.mode === 'fps') {
      if (prev !== 'fps') {
        if (!state.inside) dropToTarget();
        // continue looking where the avatar faced: heading h (fwd +z-based)
        // maps to fps yaw with fwd=(−sin,−cos)
        state.yaw = state.heading + Math.PI;
        state.pitch = 0;
        state.lockWanted = true;
        lockPointer();
      }
      g.visible = false;
      controls.enabled = false;
      toast('FPS: mouse look • WASD • Shift run • Space jump • E enter • V third-person');
    } else {
      if (prev === 'fps') {
        // hand the avatar back where the eyes are; face travel direction
        state.heading = state.yaw + Math.PI;
        unlockPointer();
      }
      g.visible = true;
      controls.enabled = true;
      if (state.mode === 'walk' && !state.inside && prev !== 'fps') dropToTarget();
      if (state.mode === 'walk') toast('Walk: WASD / arrows • Shift run • Space jump • E enter mosque • V first-person • Esc exit');
    }
  }

  function toggleView() {
    if (state.mode === 'fps') setMode('walk');
    else if (state.mode === 'walk') setMode('fps');
  }

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== canvas && state.mode === 'fps' && state.lockWanted) {
      // user pressed Esc (browser reserves it): fall back, keep position
      state.lockWanted = false;
      setMode('walk');
      toast('Pointer unlocked — third-person (V for FPS)');
    }
  });
  document.addEventListener('pointerlockerror', () => {
    if (state.mode === 'fps') { state.lockWanted = false; toast('Pointer lock unavailable — keyboard walk only (V for third-person)'); }
  });
  document.addEventListener('mousemove', (e) => {
    if (state.mode !== 'fps' || document.pointerLockElement !== canvas) return;
    state.yaw -= e.movementX * LOOK;
    state.pitch = THREE.MathUtils.clamp(state.pitch - e.movementY * LOOK, -1.45, 1.45);
  });

  const _f = new THREE.Vector3();
  const _r = new THREE.Vector3();
  const _mv = new THREE.Vector3();
  const _head = new THREE.Vector3();
  const _des = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  function tick(dt) {
    if (state.mode !== 'walk' && state.mode !== 'fps') return;
    const fps = state.mode === 'fps';
    const k = state.keys;
    const iz = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    const ix = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
    const moving = iz !== 0 || ix !== 0;

    if (moving) {
      if (fps) {
        // move relative to look yaw on the ground plane
        _f.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
        _r.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
      } else {
        _f.subVectors(controls.target, camera.position);
        _f.y = 0;
        if (_f.lengthSq() < 1e-6) _f.set(0, 0, -1);
        _f.normalize();
        _r.set(-_f.z, 0, _f.x); // right vector for y-up ground plane
      }
      _mv.set(0, 0, 0).addScaledVector(_f, iz).addScaledVector(_r, ix);
      if (_mv.lengthSq() > 1) _mv.normalize();
      const speed = (k.ShiftLeft || k.ShiftRight) ? 11 : 5.5;
      const px = g.position.x, pz = g.position.z;
      let nx = px + _mv.x * speed * dt;
      let nz = pz + _mv.z * speed * dt;
      if (!state.inside) {
        // tall faces block: rise over step-up means a wall, not a stair
        const rise = analyticY(nx, nz) - g.position.y;
        if (state.grounded && rise > STEP_MAX + 0.02) { nx = px; nz = pz; }
        // Qibli hall walls guard (qterr top alone would read walkable)
        if (nz >= 119 && nz <= 181 && Math.abs(nx) < 29) { nx = px; nz = pz; }
      }
      g.position.x = nx; g.position.z = nz;
      const want = Math.atan2(_mv.x, _mv.z);
      let d = want - state.heading;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      state.heading += d * Math.min(1, dt * 10);
      state.phase += dt * speed * 1.6;
      const sw = Math.sin(state.phase) * 0.6;
      armL.rotation.x = sw; armR.rotation.x = -sw;
      legL.rotation.x = -sw; legR.rotation.x = sw;
      if (fps) state.bob += dt * speed * 1.4;
    } else {
      armL.rotation.x *= 0.9; armR.rotation.x *= 0.9;
      legL.rotation.x *= 0.9; legR.rotation.x *= 0.9;
    }
    g.rotation.y = state.heading;

    if (state.inside === 'qibli') {
      g.position.x = THREE.MathUtils.clamp(g.position.x, -30, 30);
      g.position.z = THREE.MathUtils.clamp(g.position.z, 128, 172);
      g.position.y = interiorOf('qibli').y;
    } else if (state.inside === 'dome') {
      const dx = g.position.x, dz = g.position.z + 70;
      const d = Math.hypot(dx, dz);
      if (d > 11 && d > 1e-6) { g.position.x = (dx / d) * 11; g.position.z = -70 + (dz / d) * 11; }
      g.position.y = interiorOf('dome').y;
    } else {
      // outdoor: height-aware radius push-out, then clamp to platform
      const cols = ctx.D.colliders || [];
      for (const c of cols) {
        const dx = g.position.x - c.x, dz = g.position.z - c.z;
        const d = Math.hypot(dx, dz);
        const min = c.r + 0.6;
        if (d < min && d > 1e-6) {
          // stairs pierce the Dome mass; terrace-top and Qibli lobes are open
          if (c.x === 0 && c.z === -70
            && (stairBand(g.position.x, g.position.z) || g.position.y >= TERR_Y - STEP_MAX)) continue;
          if (c.x === 0 && c.z === 150 && qibliLobe(g.position.x, g.position.z)) continue;
          g.position.x = c.x + (dx / d) * min;
          g.position.z = c.z + (dz / d) * min;
        }
      }
      g.position.x = THREE.MathUtils.clamp(g.position.x, -PX, PX);
      g.position.z = THREE.MathUtils.clamp(g.position.z, -PZ, PZ);
      // vertical: snap stair steps, fall off edges, land jumps
      const gy = groundAt(g.position.x, g.position.z, g.position.y);
      if (state.grounded) {
        if (gy - g.position.y <= STEP_MAX + 0.02) {
          g.position.y = gy >= g.position.y - 0.4 ? gy : g.position.y;
          if (gy < g.position.y - 0.4) { state.grounded = false; state.vy = 0; }
        } else { state.grounded = false; state.vy = 0; }
      }
      if (!state.grounded) {
        state.vy -= GRAV * dt;
        g.position.y += state.vy * dt;
        if (g.position.y <= gy) { g.position.y = gy; state.vy = 0; state.grounded = true; }
        if (g.position.y < -30) { g.position.y = PLAZA_Y; state.vy = 0; state.grounded = true; }
      }
    }

    if (fps) {
      // first-person: eye at feet + 1.7 m with subtle head-bob; look via yaw/pitch
      const bobA = moving ? 1 : 0;
      const ey = g.position.y + EYE + Math.sin(state.bob * 2) * 0.035 * bobA;
      const ex = g.position.x + Math.cos(state.bob) * 0.02 * bobA;
      camera.position.set(ex, ey, g.position.z);
      camera.rotation.order = 'YXZ';
      camera.rotation.set(state.pitch, state.yaw, Math.sin(state.bob) * 0.006 * bobA);
      _head.set(
        ex - Math.sin(state.yaw) * 10,
        ey + Math.tan(state.pitch) * 10,
        g.position.z - Math.cos(state.yaw) * 10,
      );
      controls.target.copy(_head);
      return;
    }

    // hybrid cam: target glued to visitor; gentle auto-follow when user is idle
    _head.set(g.position.x, g.position.y + 1.6, g.position.z);
    controls.target.lerp(_head, 1 - Math.exp(-8 * dt));
    if (moving && now() - state.lastUser > 2.5) {
      _des.set(
        g.position.x - Math.sin(state.heading) * 8.5,
        g.position.y + 4.5,
        g.position.z - Math.cos(state.heading) * 8.5,
      );
      camera.position.lerp(_des, 1 - Math.exp(-2.2 * dt));
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE' && (state.mode === 'walk' || state.mode === 'fps') && !e.repeat) enter();
    if (e.code === 'KeyV' && (state.mode === 'walk' || state.mode === 'fps') && !e.repeat) toggleView();
    if (e.code === 'Space' && (state.mode === 'walk' || state.mode === 'fps')) {
      e.preventDefault();
      if (!e.repeat) tryJump();
    }
    if (e.code.startsWith('Arrow') && (state.mode === 'walk' || state.mode === 'fps')) e.preventDefault();
    state.keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => { state.keys[e.code] = false; });
  window.addEventListener('blur', () => { state.keys = {}; });

  // Photo-mode freecam (own module; main session wires buttons). Guarded so a
  // later manual build never double-registers listeners/ticks.
  if (!ctx.D.freeApi) {
    const free = buildFreecam(ctx);
    ctx.D.tickers.push((dt, _t) => free.tick(dt));
  }

  const api = { tick, setMode, enter, toggleView,
    get mode() { return state.mode; },
    get position() { return g.position; },
    get grounded() { return state.grounded; },
    teleport(x, z) {
      g.position.set(x, analyticY(x, z), z);
      state.exit.copy(g.position);
      state.vy = 0; state.grounded = true;
      state.inside = null;
    },
  };
  window.__char = api;

  // Deep link for captures without main.js edits: ?fps=x,z[,yawDeg].
  try {
    const q = new URLSearchParams(location.search);
    const fp = q.get('fps');
    if (fp) {
      const [sx, sz, sy] = fp.split(',');
      setMode('fps');
      api.teleport(parseFloat(sx) || 0, parseFloat(sz) || 60);
      if (sy !== undefined) state.yaw = THREE.MathUtils.degToRad(parseFloat(sy) || 0);
      else state.yaw = 0;
    }
  } catch {}

  return api;
}
