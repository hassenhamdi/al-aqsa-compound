// freecam.js — user-facing photo-mode free-fly camera.
// Technique after three-freecam (npm, 1.8kB, MIT): right-drag look (Euler YXZ),
// WASD fly relative to camera quaternion (vertical stays world-up), wheel dolly
// toward pivot (throttle while looking), F frames a focus target via a
// bounding-sphere fit. No dependency vendored (AGENTS.md §6: no new npm deps);
// semantics + numbers (lookSpeed 0.0022, boost x4) follow the package.
// F-frame target here is a __studio part label (bounds() -> center/size).
// User driving: runtime-injected #bFree button in #modes + #help line
// (index.html is FROZEN — DOM injection only), F toggles photo mode
// (F again = next frame), E/Q (+Space) height, X = ULTRA still (forces max
// tier + settle, restores governor), R/T/V = traj record/replay/export JSON,
// P/Esc exits. Exports buildFreecam(ctx); character.js auto-builds it
// (guarded) so the tick runs without main.js edits.
import * as THREE from 'three';

const LOOK = 0.0022; // rad/px, three-freecam default
const SPEED = 12;    // m/s fly
const BOOST = 4;     // Shift multiplier
const NOHUD_CSS = '#top,#side,#tour,#help,#stats,#toast,#cine,.hud,.marker,#studio-panel{display:none!important}';

export function buildFreecam(ctx) {
  const { scene, camera, controls } = ctx;
  const renderer = ctx.renderer;
  const canvas = renderer ? renderer.domElement : null;
  const D = ctx.D || (ctx.D = {});
  const toast = (m) => { if (ctx.toast) ctx.toast(m); };

  const state = {
    active: false,
    prevChar: 'orbit',
    keys: new Set(),
    euler: new THREE.Euler(0, 0, 0, 'YXZ'),
    pivot: new THREE.Vector3(),
    pivotDist: 10,
    moveSpeed: SPEED,
    dragging: 'none', // none | look | pan
    labelIdx: 0,
    pendingFrame: null,
    vel: new THREE.Vector3(), // critically-damped fly velocity (no overshoot)
    savedCtl: null,  // orbit-constraint snapshot while active
    origNear: null,  // camera.near snapshot while active
  };

  function labels() {
    if (D.studio) return D.studio.list().map((l) => l.label);
    return ['dome-ext', 'qibli-ext', 'platform', 'minarets', 'vegetation', 'minor', 'chain'];
  }

  function syncPivot() {
    state.pivot.set(0, 0, -state.pivotDist).applyQuaternion(camera.quaternion).add(camera.position);
  }

  function setHUD(on) {
    let st = document.getElementById('free-nohud');
    if (on) { if (st) st.remove(); return; }
    if (!st) {
      st = document.createElement('style');
      st.id = 'free-nohud';
      st.textContent = NOHUD_CSS;
      document.head.appendChild(st);
    }
  }

  function frame(label, dir, zoom = 1.5) {
    if (!D.studio) { state.pendingFrame = label; return false; }
    const b = D.studio.bounds(label);
    if (!b) return false;
    const c = new THREE.Vector3(...b.center);
    const s = new THREE.Vector3(...b.size);
    const r = s.length() / 2;
    const vFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const dist = Math.max(3, ((r * 1.35) / Math.tan(vFov)) / zoom);
    // Iso-style default view (matches __studio.frame semantics); an explicit
    // dir keeps the current shooting angle instead.
    const d = dir ? new THREE.Vector3(...dir).normalize() : new THREE.Vector3(1, 0.3, 1).normalize();
    camera.position.copy(c).addScaledVector(d, dist);
    _m.lookAt(camera.position, c, camera.up);
    _q.setFromRotationMatrix(_m);
    state.euler.setFromQuaternion(_q);
    state.pivotDist = dist;
    syncPivot();
    controls.target.copy(c);
    state.pendingFrame = null;
    toast(`Framed ${label} — X saves PNG`);
    return true;
  }

  function cycle() {
    const ls = labels();
    for (let i = 0; i < ls.length; i++) {
      if (frame(ls[state.labelIdx++ % ls.length])) return true;
    }
    return false;
  }

  // ---- ultra stills: best pixels regardless of live governor tier ----
  // X (and capture_ultra headless): force high tier (device-cap pr, bloom,
  // 2048 shadows), hide HUD/markers, settle 3 rAF, PNG download, then restore
  // prior tier + governor (qAuto click re-arms auto) + HUD state we changed.
  async function capture_ultra() {
    const sc = window.__scene;
    const info0 = sc ? sc.info() : { quality: 'high', autoQ: false };
    const hadNohud = !!document.getElementById('nohud-style');
    try {
      toast('Ultra capture — max quality…');
      try { sc?.setHUD(false); } catch {}
      try { sc?.quality('high'); } catch {}
      for (let i = 0; i < 3; i++) {
        await new Promise((r) => requestAnimationFrame(r)); // let loop render settled tier
      }
      try { if (ctx.composer) ctx.composer.render(); else if (renderer) renderer.render(scene, camera); } catch {}
      const el = renderer ? renderer.domElement : null;
      const blob = el ? await new Promise((res) => { try { el.toBlob(res); } catch { res(null); } }) : null;
      if (!blob) { toast('Capture failed'); return null; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `aqsa-ultra-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast('Ultra frame saved to downloads');
      return { quality: info0.quality, autoQ: info0.autoQ, bytes: blob.size };
    } finally {
      try {
        if (info0.autoQ) document.getElementById('qAuto')?.click(); // re-arm governor
        else sc?.quality(info0.quality);
        if (!hadNohud) sc?.setHUD(true);
      } catch {}
    }
  }

  function capture() { capture_ultra(); } // X key: ultra still

  // ---- trajectory record / replay / headless frame-step ----
  // R toggles time-stamped pose recording (own clock: tick dt sum, so no
  // main.js elapsed dependency). T replays smoothly (CatmullRom pos+tgt).
  // V downloads traj JSON; make-video.mjs drives step_frame headless.
  const traj = {
    rec: null,       // { start, keys[] } while recording
    keys: [], dur: 0, fps: 30,
    replay: null,    // start-clock while replaying
    clock: 0,
    posCurve: null, tgtCurve: null,
  };
  function install_traj(t) {
    const keys = (t.keys || []).map((k) => ({ t: +k.t, pos: [...k.pos], tgt: [...k.tgt] }));
    if (keys.length < 2) return false;
    traj.keys = keys;
    traj.dur = +t.dur || keys[keys.length - 1].t;
    traj.fps = +t.fps || 30;
    traj.posCurve = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)));
    traj.tgtCurve = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.tgt)));
    return true;
  }
  function sample_traj(t) {
    const u = THREE.MathUtils.clamp(traj.dur > 0 ? t / traj.dur : 0, 0, 1);
    return { pos: traj.posCurve.getPoint(u), tgt: traj.tgtCurve.getPoint(u) };
  }
  function apply_pose(pos, tgt) {
    camera.position.copy(pos);
    _m.lookAt(pos, tgt, camera.up);
    _q.setFromRotationMatrix(_m);
    state.euler.setFromQuaternion(_q);
    camera.quaternion.setFromEuler(state.euler);
    state.vel.set(0, 0, 0); // teleports never inherit fly velocity
    camera.quaternion.setFromEuler(state.euler);
    state.pivotDist = Math.max(0.5, pos.distanceTo(tgt));
    syncPivot();
    controls.target.copy(tgt);
  }
  // ---- scripted tour trajectory (12 guided-tour stops) ----
  // Order = education.js TOUR_ORDER [0,2,3,4,5,10,1,6,7,8,9,11]. Each stop
  // keeps the curated POI view angle; distance = max(curated, studio
  // frame-style fit) so the object is fully visible — fit applies only to
  // compact parts (bounds diagonal < 120 m; site-wide labels stay curated).
  // Dwell keys duplicate the pose (CatmullRom rests); +25 m lift midpoints
  // keep transitions aerial (no porch-brushing). Interior mihrab stop dives
  // through the roof briefly — same as the official tour's straight flyTo.
  const TOUR_ORDER = [0, 2, 3, 4, 5, 10, 1, 6, 7, 8, 9, 11];
  // No mihrab fit: stop 6 is an interior niche closeup — the curated 14 m
  // view stands (qibli-int bounds span the whole 83 m hall).
  const TOUR_LABEL = { 0: 'dome-ext', 1: 'chain', 2: 'minor', 3: 'minor',
    4: 'qibli-ext', 7: 'minor', 8: 'minor', 9: 'minarets' };
  function fitDist(label, zoom = 1.5) {
    if (!label || !D.studio) return 0;
    const b = D.studio.bounds(label);
    if (!b) return 0;
    const s = new THREE.Vector3(...b.size);
    if (s.length() >= 120) return 0; // site-wide part: keep curated view
    const vFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    return ((s.length() / 2 * 1.35) / Math.tan(vFov)) / zoom;
  }
  function build_tour_traj(dwell = 3, transit = 2.5, fps = 30) {
    const pois = ctx.D.edu && ctx.D.edu.POIS;
    if (!pois) { toast('Tour data not ready'); return null; }
    const stops = TOUR_ORDER.map((pi) => {
      const p = pois[pi];
      const tgt = new THREE.Vector3(...p.pos);
      const off = new THREE.Vector3(...p.view);
      const dir = off.clone().normalize();
      const dist = Math.max(off.length(), fitDist(TOUR_LABEL[pi]));
      return { n: p.n, title: p.title, tgt, pos: tgt.clone().addScaledVector(dir, dist) };
    });
    const keys = [], sheet = [];
    let t = 0;
    stops.forEach((s, i) => {
      const P = s.pos.toArray().map((v) => +v.toFixed(2));
      const G = s.tgt.toArray().map((v) => +v.toFixed(2));
      keys.push({ t: +t.toFixed(2), pos: P, tgt: G });
      sheet.push({ n: s.n, title: s.title, frame: Math.round((t + dwell / 2) * fps) });
      t += dwell;
      keys.push({ t: +t.toFixed(2), pos: P, tgt: G });
      if (i < stops.length - 1) {
        const nx = stops[i + 1];
        const mid = s.pos.clone().lerp(nx.pos, 0.5); mid.y += 25;
        const mtg = s.tgt.clone().lerp(nx.tgt, 0.5);
        keys.push({ t: +(t + transit / 2).toFixed(2),
          pos: mid.toArray().map((v) => +v.toFixed(2)),
          tgt: mtg.toArray().map((v) => +v.toFixed(2)) });
        t += transit;
      }
    });
    const traj = { dur: +t.toFixed(2), fps, keys };
    install_traj(traj);
    toast(`Tour traj: 12 stops, ${traj.dur.toFixed(0)}s — T replays, V exports`);
    return { traj: record_traj(), stops: sheet };
  }
  function place(pos, tgt) {
    apply_pose(new THREE.Vector3(...pos), new THREE.Vector3(...tgt));
    state.keys.clear();
    return true;
  }
  function pose() {
    return { pos: camera.position.toArray().map((v) => +v.toFixed(3)),
      tgt: state.pivot.toArray().map((v) => +v.toFixed(3)),
      euler: [+state.euler.x.toFixed(5), +state.euler.y.toFixed(5)] };
  }
  function record_traj() {
    return JSON.parse(JSON.stringify({ dur: traj.dur, fps: traj.fps, keys: traj.keys }));
  }
  function load_traj(j) {
    try {
      const t = typeof j === 'string' ? JSON.parse(j) : j;
      if (install_traj(t)) { toast(`Traj loaded: ${traj.keys.length} keys, ${traj.dur.toFixed(1)}s`); return true; }
    } catch {}
    toast('Bad traj JSON');
    return false;
  }
  function step_frame(i, fps) {
    const f = fps || traj.fps || 30;
    if (!traj.posCurve) return null;
    const p = sample_traj(i / f);
    apply_pose(p.pos, p.tgt);
    try { if (ctx.composer) ctx.composer.render(); else if (renderer) renderer.render(scene, camera); } catch {}
    return { i, t: +(i / f).toFixed(3),
      pos: p.pos.toArray().map((v) => +v.toFixed(2)),
      tgt: p.tgt.toArray().map((v) => +v.toFixed(2)) };
  }
  function toggle_rec() {
    if (traj.rec) {
      traj.keys = traj.rec.keys;
      traj.dur = traj.keys.length ? traj.keys[traj.keys.length - 1].t : 0;
      install_traj({ dur: traj.dur, fps: 30, keys: traj.keys });
      traj.rec = null;
      toast(`Rec stopped: ${traj.keys.length} keys, ${traj.dur.toFixed(1)}s — T replays, V exports`);
    } else {
      traj.replay = null;
      traj.rec = { start: traj.clock, keys: [] };
      toast('Recording traj — fly, R stops');
    }
  }
  function toggle_replay() {
    if (traj.replay !== null) { traj.replay = null; toast('Replay stopped'); return; }
    if (!traj.posCurve) { toast('No traj — R records first'); return; }
    traj.replay = traj.clock;
    toast('Replaying traj — WASD cancels');
  }
  function export_traj() {
    const j = record_traj();
    if (!j.keys.length) { toast('No traj — R records first'); return; }
    const blob = new Blob([JSON.stringify(j)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `aqsa-traj-${j.dur.toFixed(0)}s-${j.keys.length}keys.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Traj JSON saved — run: node scripts/make-video.mjs <json>');
  }

  function enter(label) {
    if (state.active) { if (label) frame(label); return; }
    if (ctx.D.char) state.prevChar = ctx.D.char.mode;
    if (ctx.D.cineApi) ctx.D.cineApi.stop();
    if (ctx.flyTo) ctx.flyTo.cancel();
    if (ctx.D.char) ctx.D.char.setMode('orbit');
    if (ctx.D.tour) ctx.D.tour.stop();
    state.euler.setFromQuaternion(camera.quaternion);
    syncPivot();
    controls.enabled = false;
    // Neutralize the orbit fight: main-loop controls.update() still runs and
    // would otherwise clamp every freecam pose (maxPolarAngle 1.52 ratchets
    // level looks +0.76 m/frame at 15 m pivot; minDistance 2 shoves close
    // pivots; damping residuals drift). Snapshot + restore on exit.
    try {
      state.savedCtl = { damping: controls.enableDamping,
        min: controls.minDistance, max: controls.maxDistance,
        maxPolar: controls.maxPolarAngle };
      controls.enableDamping = false;
      controls.minDistance = 0;
      controls.maxPolarAngle = Math.PI;
      state.origNear = camera.near;
    } catch {}
    state.vel.set(0, 0, 0);
    setHUD(false);
    state.active = true;
    state.labelIdx = 0;
    syncModeBtn();
    toast('Photo mode (F): WASD fly • E/Space up, Q down • right-drag look • F frame • X ultra PNG • R/T/V traj • P/Esc exit');
    if (label) frame(label);
  }

  function exit() {
    if (!state.active) return;
    state.active = false;
    state.dragging = 'none';
    state.keys.clear();
    state.vel.set(0, 0, 0);
    releaseLock();
    controls.enabled = true; // orbit owns the camera again
    try {
      if (state.savedCtl) {
        controls.enableDamping = state.savedCtl.damping;
        controls.minDistance = state.savedCtl.min;
        controls.maxDistance = state.savedCtl.max;
        controls.maxPolarAngle = state.savedCtl.maxPolar;
        state.savedCtl = null;
      }
      if (state.origNear !== null) { camera.near = state.origNear; camera.updateProjectionMatrix(); }
    } catch {}
    setHUD(true);
    syncModeBtn();
    toast('Photo mode off — orbit restored');
  }

  function toggle() { if (state.active) exit(); else enter(); }
  function releaseLock() {
    if (document.pointerLockElement) { try { document.exitPointerLock(); } catch {} }
  }

  const _fwd = new THREE.Vector3();
  const _rgt = new THREE.Vector3();
  const _mv = new THREE.Vector3();
  const _m = new THREE.Matrix4();
  const _q = new THREE.Quaternion();

  // 2-arg signature: main.js tickers call length>=2 fns with (dt, t).
  function tick(dt) {
    if (!api._exposed && window.__scene) { window.__scene.free = api; api._exposed = true; }
    if (state.pendingFrame && D.studio) frame(state.pendingFrame);
    if (!state.active) return;
    if (typeof dt !== 'number' || !(dt > 0)) return;
    traj.clock += dt;
    const k = state.keys;
    const has = (c) => k.has(c);
    // live replay: smooth CatmullRom ride; any fly key cancels back to manual
    if (traj.replay !== null) {
      const rt = traj.clock - traj.replay;
      if (rt >= traj.dur || has('KeyW') || has('KeyA') || has('KeyS') || has('KeyD')
        || has('KeyE') || has('KeyQ') || has('Space') || has('ArrowUp')) {
        traj.replay = null;
        state.vel.set(0, 0, 0);
        if (rt >= traj.dur) toast('Replay done');
      } else {
        const p = sample_traj(rt);
        apply_pose(p.pos, p.tgt);
        return;
      }
    }
    if (traj.rec) {
      traj.rec.keys.push({ t: +(traj.clock - traj.rec.start).toFixed(3),
        pos: camera.position.toArray().map((v) => +v.toFixed(2)),
        tgt: state.pivot.toArray().map((v) => +v.toFixed(2)) });
      if (traj.rec.keys.length > 7200) toggle_rec();
    }
    const f = (has('KeyW') || has('ArrowUp') ? 1 : 0) - (has('KeyS') || has('ArrowDown') ? 1 : 0);
    const r = (has('KeyD') || has('ArrowRight') ? 1 : 0) - (has('KeyA') || has('ArrowLeft') ? 1 : 0);
    const u = (has('KeyE') || has('Space') ? 1 : 0) - (has('KeyQ') ? 1 : 0);
    // Close-range stability: speed scales with distance-to-pivot (full SPEED
    // in the open, ~1 m/s at arm's length) + critically-damped velocity
    // (exponential approach, zero overshoot) instead of raw steps.
    const boost = ((has('ShiftLeft') || has('ShiftRight'))) ? BOOST : 1;
    const sp = THREE.MathUtils.clamp(state.pivotDist * 0.9, 1.0, state.moveSpeed) * boost;
    if (f !== 0 || r !== 0 || u !== 0) {
      camera.getWorldDirection(_fwd);
      _rgt.crossVectors(_fwd, camera.up).normalize();
      _mv.set(0, 0, 0).addScaledVector(_fwd, f).addScaledVector(_rgt, r);
      if (_mv.lengthSq() > 1) _mv.normalize();
      _mv.multiplyScalar(sp);
      _mv.y += u * sp; // height stays world-vertical (three-freecam)
    } else _mv.set(0, 0, 0);
    state.vel.lerp(_mv, 1 - Math.exp(-10 * Math.min(dt, 0.05)));
    camera.position.addScaledVector(state.vel, Math.min(dt, 0.05));
    // Dynamic near plane: pull in close to walls, restore on exit.
    const nn = THREE.MathUtils.clamp(state.pivotDist * 0.05, 0.02, state.origNear ?? 0.3);
    if (Math.abs(camera.near - nn) > 0.005) { camera.near = nn; camera.updateProjectionMatrix(); }
    camera.quaternion.setFromEuler(state.euler);
    syncPivot();
    controls.target.copy(state.pivot); // keep main-loop controls.update() harmless
  }

  if (canvas) {
    canvas.addEventListener('pointerdown', (e) => {
      if (!state.active) return;
      if (e.button === 2) {
        state.dragging = 'look';
        try { canvas.requestPointerLock?.(); } catch {}
      } else if (e.button === 1) {
        state.dragging = 'pan';
        e.preventDefault();
      }
    });
    canvas.addEventListener('contextmenu', (e) => { if (state.active) e.preventDefault(); });
    canvas.addEventListener('wheel', (e) => {
      if (!state.active) return;
      e.preventDefault();
      const n = -Math.sign(e.deltaY);
      if (state.dragging === 'look') { // throttle, like the editor
        state.moveSpeed = THREE.MathUtils.clamp(state.moveSpeed * Math.pow(1.15, n), 0.5, 200);
        return;
      }
      camera.getWorldDirection(_fwd);
      const step = state.pivotDist * 0.12 * n;
      camera.position.addScaledVector(_fwd, step);
      state.pivotDist = Math.max(0.5, state.pivotDist - step);
      syncPivot();
    }, { passive: false });
    window.addEventListener('pointermove', (e) => {
      if (!state.active || state.dragging === 'none') return;
      const dx = e.movementX || 0, dy = e.movementY || 0;
      if (!dx && !dy) return;
      if (state.dragging === 'look') {
        state.euler.y -= dx * LOOK;
        state.euler.x = THREE.MathUtils.clamp(state.euler.x - dy * LOOK, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
        camera.quaternion.setFromEuler(state.euler);
      } else if (state.dragging === 'pan') {
        const s = 0.0015 * Math.max(state.pivotDist, 1);
        camera.getWorldDirection(_fwd);
        _rgt.crossVectors(_fwd, camera.up).normalize();
        camera.position.addScaledVector(_rgt, -dx * s).addScaledVector(camera.up, dy * s);
        syncPivot();
      }
    });
    window.addEventListener('pointerup', () => {
      if (!state.active || state.dragging === 'none') return;
      state.dragging = 'none';
      releaseLock();
    });
    window.addEventListener('blur', () => { state.keys.clear(); state.dragging = 'none'; });
  }

  // Swallow mode-breaking keys while shooting (capture phase, before main.js).
  window.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.code === 'KeyP' && !e.repeat) { toggle(); return; }
    if (e.code === 'KeyF' && !e.repeat) { // user shortcut: F enters; F again = next frame
      if (state.active) cycle(); else enter();
      return;
    }
    // traj keys live in photo mode; outside it, hint instead of hijacking
    // (T alone toggles the studio panel in main.js).
    if (e.code === 'KeyR' || e.code === 'KeyT' || e.code === 'KeyV') {
      if (!state.active) {
        if (!e.repeat) toast('Photo mode first (F) — then R rec • T replay • V export');
        return;
      }
      if (!e.repeat) {
        e.stopPropagation();
        if (e.code === 'KeyR') toggle_rec();
        else if (e.code === 'KeyT') toggle_replay();
        else export_traj();
      }
      return;
    }
    if (!state.active) return;
    if (e.code === 'KeyC' || e.code === 'KeyT' || e.code.startsWith('Digit')) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    if (e.code === 'KeyX' && !e.repeat) { capture(); return; }
    if (e.code === 'Escape') { exit(); return; } // main.js goOrbit also fires: compatible
    state.keys.add(e.code);
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
  }, { capture: true });
  window.addEventListener('keyup', (e) => { state.keys.delete(e.code); });

  const api = {
    enter, exit, toggle, frame, cycle, capture, capture_ultra, tick,
    record_traj, load_traj, step_frame, place, pose, build_tour_traj,
    get active() { return state.active; },
    get labels() { return labels(); },
  };
  D.freeApi = api;
  window.__free = api;
  mountUI();

  // User-facing wiring via runtime DOM only (index.html FROZEN): a Photo
  // pill in #modes, a #help line, and clean handoff — any classic mode
  // button exits photo mode first (main.js handlers then run as usual).
  function syncModeBtn() {
    try {
      for (const id of ['bOrbit', 'bWalk', 'bCine', 'bTour']) document.getElementById(id)?.classList.remove('on');
      document.getElementById('bFree')?.classList.toggle('on', state.active);
      if (!state.active) document.getElementById('bOrbit')?.classList.add('on');
    } catch {}
  }
  function mountUI() {
    try {
      const bar = document.getElementById('modes');
      if (bar && !document.getElementById('bFree')) {
        const b = document.createElement('button');
        b.id = 'bFree'; b.textContent = 'Photo 📷'; b.title = 'Free-fly photo mode (F)';
        b.addEventListener('click', () => toggle());
        bar.appendChild(b);
      }
      const help = document.getElementById('help');
      if (help && !document.getElementById('freeHelp')) {
        const s = document.createElement('span');
        s.id = 'freeHelp';
        s.innerHTML = '<br/>📷 <b>Photo (F)</b> free-fly • WASD • E/Space up, Q down • right-drag look • F frame • X ultra PNG • R rec • T replay • V export traj • P exit';
        help.appendChild(s);
      }
      for (const id of ['bOrbit', 'bWalk', 'bCine', 'bTour']) {
        const el = document.getElementById(id);
        if (el && !el.dataset.freeWired) {
          el.dataset.freeWired = '1';
          el.addEventListener('click', () => exit(), { capture: true });
        }
      }
    } catch {}
  }

  // Deep link for captures without main.js edits: ?free=<studio-label>.
  try {
    const q = new URLSearchParams(location.search);
    const fl = q.get('free');
    if (fl) enter(fl === '1' ? 'dome-ext' : fl);
  } catch {}

  return api;
}
