// main.js — assembly: boot sequence, composer, governor, HUD wiring, loop, window.__scene.
// Runs with: python3 -m http.server   (ESM via importmap, three r170)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildMaterials } from './modules/materials.js';
import { buildPlatform } from './modules/platform.js';
import { buildDomeOfRock } from './modules/domeOfRock.js';
import { buildAqsaMosque } from './modules/aqsaMosque.js';
import { buildMinorDomes } from './modules/minorDomes.js';
import { buildWater } from './modules/water.js';
import { buildMinarets } from './modules/minarets.js';
import { buildInfill } from './modules/infill.js';
import { buildOliveGrove } from './modules/oliveGrove.js';
import { buildFurniture } from './modules/furniture.js';
import { buildLighting } from './modules/lighting.js';
import { buildAtmosphere } from './modules/atmosphere.js';
import { buildCharacter } from './modules/character.js';
import { buildPigeons } from './modules/pigeons.js';
import { buildCinematic } from './modules/cinematic.js';
import { buildEducation } from './modules/education.js';
import { buildStudio } from './modules/studio.js';

const $ = (id) => document.getElementById(id);
const barFill = () => document.querySelector('#bar i');
const loadmsg = () => $('loadmsg');
const nextFrame = () => new Promise((r) => requestAnimationFrame(r));

let toastTimer = 0;
function toast(m) {
  const t = $('toast');
  if (!t) return;
  t.textContent = m;
  t.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2400);
}

async function boot() {
  const steps = [];
  const ctx = { D: { tickers: [], colliders: [], gates: [] }, toast };
  const setProgress = (frac, msg) => {
    const b = barFill();
    if (b) b.style.width = `${Math.round(frac * 100)}%`;
    const l = loadmsg();
    if (l) l.textContent = msg;
  };

  try {
    // 1 — renderer / scene / camera / controls
    setProgress(0.06, 'creating renderer…');
    await nextFrame();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.info.autoReset = false; // composer does N passes; accumulate then reset manually
    $('app').appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.3, 4000);
    camera.position.set(230, 150, 270);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 8, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = 1.52;
    controls.minDistance = 2;
    controls.maxDistance = 700;

    Object.assign(ctx, { scene, camera, renderer, controls });
    ctx.D.qibliInterior = new THREE.Vector3(0, 3.3, 150);
    ctx.D.domeInterior = new THREE.Vector3(0, 5.4, -70);
    // outdoor walk colliders: terrace mass, qibli mass, Al-Kas + Qasim kiosk
    // (P4d moved Al-Kas (-20,30)->(20,30); old (-30,40)/(-60,-20) were stale)
    ctx.D.colliders.push(
      { x: 0, z: -70, r: 58 },
      { x: 0, z: 150, r: 48 },
      { x: 20, z: 30, r: 7 },
      { x: -45, z: -30, r: 6 },
    );

    // 2 — camera flyTo tween (education + __scene share it)
    const fly = {
      active: false, t: 0, dur: 2.2,
      p0: new THREE.Vector3(), p1: new THREE.Vector3(),
      t0: new THREE.Vector3(), t1: new THREE.Vector3(),
      fly(p, tg, dur = 2.2) {
        this.p0.copy(camera.position); this.t0.copy(controls.target);
        this.p1.copy(p); this.t1.copy(tg);
        this.t = 0; this.dur = dur; this.active = true;
      },
      cancel() { this.active = false; },
      tick(dt) {
        if (!this.active) return;
        this.t += dt;
        const a = this.t >= this.dur ? 1 : (this.t < this.dur / 2
          ? 4 * (this.t / this.dur) ** 3
          : 1 - Math.pow(-2 * (this.t / this.dur) + 2, 3) / 2);
        camera.position.lerpVectors(this.p0, this.p1, a);
        controls.target.lerpVectors(this.t0, this.t1, a);
        if (this.t >= this.dur) this.active = false;
      },
    };
    ctx.flyTo = fly;
    controls.addEventListener('start', () => fly.cancel());

    // 3 — materials → platform → systems (progress per step)
    const makers = [
      ['mixing stone, tile & gold…', () => { ctx.M = buildMaterials(); }],
      ['raising the Haram platform…', () => { buildPlatform(ctx); }],
      ['crowning the Dome of the Rock…', () => { buildDomeOfRock(ctx); }],
      ['raising the Qibli prayer hall…', () => { buildAqsaMosque(ctx); }],
      ['scattering domes & sabils…', () => { buildMinorDomes(ctx); }],
      ['laying still water…', () => { buildWater(ctx); }],
      ['raising four minarets…', () => { buildMinarets(ctx); }],
      ['bridging the Maghariba ramp…', () => { buildInfill(ctx); }],
      ['planting the olive garden…', () => { buildOliveGrove(ctx); }],
      ['furnishing the prayer hall…', () => { buildFurniture(ctx); }],
      ['lighting the sunset sky…', () => { ctx.D.lightApi = buildLighting(ctx); }],
      ['releasing birds & mist…', () => { ctx.D.atmo = buildAtmosphere(ctx); }],
      ['waking the pigeons…', () => { buildPigeons(ctx); }],
      ['waking the visitor…', () => { ctx.D.char = buildCharacter(ctx); }],
      ['loading the camera crew…', () => { ctx.D.cineApi = buildCinematic(ctx); }],
      ['pinning 12 story markers…', () => { ctx.D.eduApi = buildEducation(ctx); ctx.D.tour = ctx.D.eduApi.tour; }],
    ];
    for (let i = 0; i < makers.length; i++) {
      setProgress(0.12 + (i / makers.length) * 0.7, makers[i][0]);
      await nextFrame();
      makers[i][1]();
    }
    steps.push('world');

    // normalize interior anchors: building modules may store Groups;
    // walk/cine/POI code needs Vector3 feet positions
    if (ctx.D.qibliInterior && ctx.D.qibliInterior.isObject3D) {
      ctx.D.qibliInteriorGroup = ctx.D.qibliInterior;
      if (ctx.D.qibliPos && ctx.D.qibliPos.isVector3) ctx.D.qibliInterior = ctx.D.qibliPos.clone();
      else ctx.D.qibliInterior = ctx.D.qibliInteriorGroup.getWorldPosition(new THREE.Vector3());
    }
    if (!ctx.D.qibliInterior || !ctx.D.qibliInterior.isVector3) {
      ctx.D.qibliInterior = new THREE.Vector3(0, 3.3, 150);
    }
    if (!ctx.D.domeInterior || !ctx.D.domeInterior.isVector3) {
      ctx.D.domeInterior = new THREE.Vector3(0, 5.4, -70);
    }
    // P3a walk spawn: hall floor now sits at 3.2 world (was buried at 2.3);
    // feet at 3.6 regardless of which anchor path above resolved.
    ctx.D.qibliInterior.y = 3.6;

    // 3b — Phase-1 static merge pass: fold static Meshes per (group, material,
    // shadow-class) into single draws. Visual-preserving: same geometry /
    // material / world transforms. Skips InstancedMesh, material arrays, morphs,
    // userData.placeholder/noMerge. Shadow: only massing buckets stay casters.
    setProgress(0.84, 'merging static geometry…');
    await nextFrame();
    {
      const _inv = new THREE.Matrix4();
      const _ws = new THREE.Vector3();
      const massGroups = { platform: 10, domeOfRock: 10, aqsaMosque: 10, minarets: 8, 'minor-domes': Infinity, infill: 8 };
      // animated flocks must never merge: explicit exclusion (defense in depth;
      // the allowlist above already omits them, and InstancedMesh is skipped)
      const excludedGroups = new Set(['pigeons']);
      // materials with emissive content may be animated (e.g. pulsing crescent)
      // and must never dedup-merge across distinct objects: uuid-key them
      const noDedup = new Set();
      scene.traverse((o) => {
        const mt = o.material;
        if (o.isMesh && mt && !Array.isArray(mt) && mt.emissive && mt.emissive.getHex() !== 0) noDedup.add(mt);
      });
      const sigOf = (mt) => {
        // custom shaders carry per-object uniforms: never dedup across objects.
        // (This also keeps the two Al-Kas water materials from merging wrong.)
        if (noDedup.has(mt) || mt.isShaderMaterial || mt.isRawShaderMaterial) return 'u:' + mt.uuid;
        return ['s',
          mt.color ? mt.color.getHex() : 0, mt.map ? mt.map.uuid : 0, mt.roughness, mt.metalness,
          mt.envMapIntensity, mt.side, mt.transparent ? 1 : 0, mt.opacity, mt.vertexColors ? 1 : 0,
        ].join('|');
      };
      // live geometry refcounts so shared cached geos are only disposed at zero
      const useCount = new Map();
      scene.traverse((o) => {
        if ((o.isMesh || o.isInstancedMesh) && o.geometry) {
          useCount.set(o.geometry, (useCount.get(o.geometry) || 0) + 1);
        }
      });
      // [maxSpan, minSpan] in world units (scale-aware); thin spans (rails,
      // fence posts, finial rods) never cast even when long — massing only
      const dimsOf = (o) => {
        o.geometry.computeBoundingBox();
        const bb = o.geometry.boundingBox;
        o.updateWorldMatrix(true, false);
        _ws.setFromMatrixScale(o.matrixWorld);
        const dx = (bb.max.x - bb.min.x) * _ws.x, dy = (bb.max.y - bb.min.y) * _ws.y, dz = (bb.max.z - bb.min.z) * _ws.z;
        return [Math.max(dx, dy, dz), Math.min(dx, dy, dz)];
      };
      const sharedMats = new Set(Object.values(ctx.M));
      const isFlat = (g) => g.type === 'PlaneGeometry' || g.type === 'CircleGeometry' || g.type === 'RingGeometry';
      // Phase-4b studio scopes: these subgroups merge internally and keep their
      // meshes, so eye/solo labels survive the perf pass. All else merges at top.
      const PROTECTED = new Set(['dome-of-chain', 'domeInterior', 'qibliInterior']);
      // interiors never cast (enclosed; sun contribution negligible) — massing rule.
      // Applies to merged buckets (below) and to builder-instanced meshes (here).
      const NOCAST_SCOPE = new Set(['domeInterior', 'qibliInterior']);
      for (const sub of NOCAST_SCOPE) {
        const g = scene.getObjectByName(sub);
        if (g) g.traverse((o) => { if (o.isMesh || o.isInstancedMesh) o.castShadow = false; });
      }
      let mergedCount = 0, removedCount = 0;
      const mergeReport = (ctx.D.mergeReport ||= {});
      const matDesc = (mt) => {
        if (!mt || mt.isShaderMaterial || mt.isRawShaderMaterial) return 'shader:' + (mt.uuid || '?').slice(0, 6);
        const c = mt.color ? mt.color.getHex().toString(16) : 'n';
        return `${mt.type}/c${c}/r${mt.roughness}/m${mt.metalness}/DS${mt.side === 2 ? 1 : 0}`;
      };
      for (const [gname, minCast] of Object.entries(massGroups)) {
        if (excludedGroups.has(gname)) continue; // e.g. animated pigeon flocks
        const rep = (mergeReport[gname] ||= { buckets: 0, merged: 0, failed: 0, singles: 0 });
        const G = scene.getObjectByName(gname);
        if (!G) continue;
        G.updateMatrixWorld(true);
        _inv.copy(G.matrixWorld).invert();
        const stash = [];
        G.traverse((o) => {
          if (!o.isMesh || o.isInstancedMesh) return;
          if (Array.isArray(o.material)) return;
          // skipped by design (animated/owner-opt-out/placeholder/morph):
          // still enforce the massing-only shadow policy — a flat water disc
          // or thin decal must never spend a shadow call.
          if (o.userData.placeholder || o.userData.noMerge || (o.geometry.morphAttributes && Object.keys(o.geometry.morphAttributes).length)) {
            const flat = isFlat(o.geometry);
            if (flat) o.castShadow = false;
            else {
              const [maxD, minD] = dimsOf(o);
              if (!(maxD >= minCast && minD >= 0.25)) o.castShadow = false;
            }
            return;
          }
          // scope = nearest top-level child subgroup if protected, else top group
          let node = o;
          while (node.parent && node.parent !== G) node = node.parent;
          const scope = PROTECTED.has(node.name) ? node.name : null;
          const carrier = scope ? node : null;
          // flat decals (pavers, carpets, water, doors, glazing) never cast: massing only
          const [maxD, minD] = dimsOf(o);
          const cast = !NOCAST_SCOPE.has(scope ?? '') && !isFlat(o.geometry) && maxD >= minCast && minD >= 0.25;
          // merge-compat: indexed and non-indexed (Extrude) geos must not mix
          const gx = o.geometry.index ? '|ix' : '|nx';
          stash.push({ o, carrier, key: (scope ?? '') + sigOf(o.material) + gx + (cast ? '|c' : '|n') });
        });
        const buckets = new Map();
        for (const s of stash) {
          if (!buckets.has(s.key)) buckets.set(s.key, []);
          buckets.get(s.key).push(s);
        }
        for (const [key, list] of buckets) {
          const cast = key.endsWith('|c');
          rep.buckets++;
          if (list.length < 2) { rep.singles++; (rep.singleDesc ||= []).push(list[0].o.geometry.type + '~' + matDesc(list[0].o.material)); }
          // representative: prefer the shared registry material so global
          // lighting/emissive tweens keep hitting the same object as before
          const rep2 = list.find((s) => sharedMats.has(s.o.material)) || list[0];
          const mat = rep2.o.material;
          // bake into the scope carrier's local space (carrier == top group if unscoped)
          const dest = list[0].carrier || G;
          let merged = null;
          if (list.length >= 2) {
            dest.updateWorldMatrix(true, false);
            _inv.copy(dest.matrixWorld).invert();
            const geos = list.map((s) => s.o.geometry.clone().applyMatrix4(s.o.matrixWorld).applyMatrix4(_inv));
            try { merged = mergeGeometries(geos, false); } catch { merged = null; }
          } else { /* singles already recorded above */ }
          if (!merged) {
            // singleton or incompatible bucket: still enforce the shadow policy
            for (const s of list) s.o.castShadow = cast;
            if (list.length >= 2) rep.failed++;
            continue;
          }
          rep.merged++;
          const m = new THREE.Mesh(merged, mat);
          m.castShadow = cast;
          m.receiveShadow = true;
          m.matrixAutoUpdate = false;
          m.renderOrder = Math.max(...list.map((s) => s.o.renderOrder || 0));
          // keep the owner's placeholder signal (e.g. infill blockout grade)
          if (G.userData.placeholder) m.userData.placeholder = true;
          dest.add(m);
          mergedCount++;
          for (const s of list) {
            s.o.parent.remove(s.o);
            removedCount++;
            const n = (useCount.get(s.o.geometry) || 1) - 1;
            useCount.set(s.o.geometry, n);
            if (n <= 0) s.o.geometry.dispose();
          }
        }
      }
      ctx.D.mergedMeshes = mergedCount;
      ctx.D.removedMeshes = removedCount;
    }

    // 3c — Phase-4b studio registry (post-merge traversal; zero sibling edits)
    setProgress(0.85, 'registering studio parts…');
    await nextFrame();
    ctx.D.studio = buildStudio(ctx);

    // 4 — composer: Render + Bloom(.35/.6/.82) + Output
    setProgress(0.86, 'grading the film…');
    await nextFrame();
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 0.35, 0.6, 0.82,
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    ctx.composer = composer;
    ctx.D.bloomPass = bloom;
    // re-apply active preset now that the bloom pass exists
    if (ctx.D.lightApi) ctx.D.lightApi.setPreset(ctx.D.lightApi.preset);

    // 5 — viewpoints (keys 1–9)
    const qi = () => ctx.D.qibliInterior.clone();
    const di = () => ctx.D.domeInterior.clone();
    const CAMS = [
      { name: 'Aerial approach', pos: [230, 150, 270], tgt: [0, 0, 20] },
      { name: 'Dome of the Rock', pos: [60, 24, -10], tgt: [0, 14, -70] },
      { name: 'Terrace court', pos: [24, 13, -24], tgt: [0, 9, -70] },
      { name: 'Qibli façade', pos: [55, 16, 55], tgt: [0, 10, 125] },
      { name: 'Qibli interior', pos: qi().add(new THREE.Vector3(-6, 3.6, -10)).toArray(), tgt: [6, 3.4, 166] },
      { name: 'Dome interior', pos: di().add(new THREE.Vector3(0, 1.9, 6)).toArray(), tgt: [0, 8.4, -70] },
      { name: 'Western portico', pos: [-120, 17, 80], tgt: [0, 8, 0] },
      { name: 'Olive garden', pos: [95, 12, 130], tgt: [40, 4, 120] },
      { name: 'Ramparts sunset', pos: [-190, 70, 270], tgt: [0, 10, 0] },
    ];
    const setView = (i) => {
      const c = CAMS[i];
      if (!c) return;
      if (ctx.D.char.mode === 'fps') ctx.D.char.setMode('orbit');
      fly.fly(new THREE.Vector3(...c.pos), new THREE.Vector3(...c.tgt), 2.4);
      toast(`${i + 1} — ${c.name}`);
    };

    // 6 — quality governor: EMA fps; <27 for 3.5s → high→med→low
    const QLEVELS = {
      high: { pr: Math.min(window.devicePixelRatio, 2), bloom: true, shadow: 2048 },
      med: { pr: 1.35, bloom: true, shadow: 1024 },
      low: { pr: 1, bloom: false, shadow: 1024 },
    };
    let quality = 'high';
    let autoQ = true;
    let ema = 60;
    let lowTimer = 0;
    const sun = () => ctx.D.lights && ctx.D.lights.sun;
    function applyQuality(q) {
      quality = q;
      const L = QLEVELS[q];
      renderer.setPixelRatio(L.pr);
      composer.setPixelRatio(L.pr);
      composer.setSize(window.innerWidth, window.innerHeight);
      bloom.enabled = L.bloom;
      const s = sun();
      if (s) {
        s.shadow.mapSize.set(L.shadow, L.shadow);
        if (s.shadow.map) { s.shadow.map.dispose(); s.shadow.map = null; }
      }
      for (const id of ['qHigh', 'qMed', 'qLow', 'qAuto']) $(id)?.classList.remove('on');
      $(q === 'high' ? 'qHigh' : q === 'med' ? 'qMed' : 'qLow')?.classList.add('on');
      if (autoQ) $('qAuto')?.classList.add('on');
    }
    function setQuality(q, auto = false) {
      autoQ = auto;
      if (auto) { applyQuality('high'); ema = 60; lowTimer = 0; }
      else applyQuality(q);
    }
    $('qAuto')?.addEventListener('click', () => { setQuality('high', true); toast('Quality: auto'); });
    $('qHigh')?.addEventListener('click', () => { setQuality('high'); toast('Quality: high'); });
    $('qMed')?.addEventListener('click', () => { setQuality('med'); toast('Quality: medium'); });
    $('qLow')?.addEventListener('click', () => { setQuality('low'); toast('Quality: low'); });

    // 7 — HUD wiring: modes / times / keys
    function setModeUI(mode) {
      for (const id of ['bOrbit', 'bWalk', 'bCine', 'bTour']) $(id)?.classList.remove('on');
      if (mode === 'orbit') $('bOrbit')?.classList.add('on');
      if (mode === 'walk') $('bWalk')?.classList.add('on');
      if (mode === 'cine') $('bCine')?.classList.add('on');
      if (mode === 'tour') $('bTour')?.classList.add('on');
    }
    function goOrbit() {
      ctx.D.cineApi.stop();
      ctx.D.char.setMode('orbit');
      setModeUI('orbit');
    }
    function goWalk() {
      ctx.D.cineApi.stop();
      fly.cancel();
      ctx.D.char.setMode('fps'); // first-person primary; V falls back to third-person
      setModeUI('walk');
    }
    $('bOrbit')?.addEventListener('click', goOrbit);
    $('bWalk')?.addEventListener('click', goWalk);
    $('bCine')?.addEventListener('click', () => {
      if (ctx.D.cineApi.playing) { ctx.D.cineApi.stop(); setModeUI('orbit'); }
      else { ctx.D.char.setMode('orbit'); ctx.D.cineApi.play(); setModeUI('cine'); }
    });
    $('bTour')?.addEventListener('click', () => {
      ctx.D.cineApi.stop();
      if (ctx.D.char.mode === 'fps') ctx.D.char.setMode('orbit');
      ctx.D.tour.toggle();
      setModeUI(ctx.D.tour.active ? 'tour' : 'orbit');
    });
    document.querySelectorAll('#times button').forEach((b) => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#times button').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        ctx.D.lightApi.setPreset(b.dataset.t);
      });
    });
    window.addEventListener('keydown', (e) => {
      if (e.code.startsWith('Digit')) {
        const i = parseInt(e.code.slice(5), 10) - 1;
        if (i >= 0 && i < 9) setView(i);
      } else if (e.code === 'KeyC') {
        $('bCine')?.click();
      } else if (e.code === 'KeyT') {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        ctx.D.studio?.toggle(); // studio panel
      } else if (e.code === 'Escape') {
        if (ctx.D.cineApi.playing) { ctx.D.cineApi.stop(); setModeUI('orbit'); }
        else if (ctx.D.char.mode === 'walk' || ctx.D.char.mode === 'fps') goOrbit();
        else { $('side')?.classList.remove('show'); ctx.D.tour.stop(); }
      }
    });

    // 8 — resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    });

    // 9 — public API
    function setHUD(on) {
      let st = document.getElementById('nohud-style');
      if (on) { if (st) st.remove(); return; }
      if (!st) {
        st = document.createElement('style');
        st.id = 'nohud-style';
        st.textContent = '#top,#side,#tour,#help,#stats,#toast,#cine,.hud,.marker,#vign,#studio-panel{display:none!important}';
        document.head.appendChild(st);
      }
    }
    window.__scene = {
      setView, setHUD, flyTo: (p, t, d) => fly.fly(p, t, d),
      CAMS: CAMS.map((c) => c.name),
      preset: (n) => ctx.D.lightApi.setPreset(n),
      quality: (q) => setQuality(q),
      mergeReport: () => ctx.D.mergeReport || {},
      info: () => {
        let lights = 0;
        scene.traverse((o) => { if (o.isLight) lights++; });
        return { quality, autoQ, fps: Math.round(ema), calls: renderer.info.render.calls, lights,
          fly: { active: fly.active, t: +fly.t.toFixed(2), dur: fly.dur }, frames, lastDt: +lastDt.toFixed(4),
          cam: camera.position.toArray().map((v) => +v.toFixed(1)),
          tgt: controls.target.toArray().map((v) => +v.toFixed(1)) };
      },
      // perf audit: renderable counts grouped by top-level group (for the instancing pass)
      audit: () => {
        const groups = {};
        const casters = [];
        const tally = (o, kind) => {
          let g = o;
          while (g.parent && g.parent !== scene) g = g.parent;
          const n = g.name || '(root)';
          groups[n] = groups[n] || { mesh: 0, inst: 0, pts: 0, cast: 0 };
          groups[n][kind]++;
          if (o.castShadow) {
            groups[n].cast++;
            if (casters.length < 80 && (o.isMesh || o.isInstancedMesh) && o.geometry) {
              o.geometry.computeBoundingBox();
              const bb = o.geometry.boundingBox;
              const s = new THREE.Vector3(); bb.getSize(s);
              const w = new THREE.Vector3().setFromMatrixScale(o.matrixWorld);
              casters.push({ g: n, inst: !!o.isInstancedMesh, nm: o.name || (o.geometry.type + '/' + (o.material && (o.material.name || o.material.type) || '?')),
                s: [+(s.x * w.x).toFixed(1), +(s.y * w.y).toFixed(1), +(s.z * w.z).toFixed(1)] });
            }
          }
        };
        scene.traverse((o) => {
          if (o.isInstancedMesh) tally(o, 'inst');
          else if (o.isMesh) tally(o, 'mesh');
          else if (o.isPoints || o.isSprite) tally(o, 'pts');
        });
        groups._casters = casters;
        return groups;
      },
    };

    // 9b — headless capture params: ?nohud=1 hides all HUD/markers, ?view=N jumps camera instantly
    {
      const params = new URLSearchParams(location.search);
      if (params.get('nohud') === '1') setHUD(false);
      const vi = parseInt(params.get('view') ?? '', 10);
      if (Number.isInteger(vi) && CAMS[vi]) {
        camera.position.set(...CAMS[vi].pos);
        controls.target.set(...CAMS[vi].tgt);
        fly.cancel();
      }
      const solo = params.get('solo') ?? '';
      if (solo && ctx.D.studio) ctx.D.studio.solo(solo);
      // Phase-5a: ?preset= for combined preset+custom-camera captures
      const pre = params.get('preset') ?? '';
      if (pre && ctx.D.lighting) ctx.D.lighting.setPreset(pre);
      // W4 celestial: ?moon=full|crescent for moon-phase captures (sky owner)
      const mph = params.get('moon') ?? '';
      if (mph && ctx.D.lighting && ctx.D.lighting.setMoonPhase) ctx.D.lighting.setMoonPhase(mph);
    }
    // 10 — animate loop
    // PWA pre-cache (no index.html edits: manifest + service worker registered here)
    try {
      const ml = document.createElement('link');
      ml.rel = 'manifest'; ml.href = './manifest.webmanifest';
      document.head.appendChild(ml);
      if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      }
    } catch (_) {}
    // static shadow cache: zero casters move (massing/trunks only — birds, flags,
    // avatar, clouds never cast), so render the 2048 map on demand, not per frame.
    // Invalidated by sun moves (preset transitions), quality-tier resizes, warmup.
    setProgress(1, 'opening the gates…');
    renderer.shadowMap.autoUpdate = false;
    let shadowWarmup = 4;
    const _sunPos = new THREE.Vector3(1e9, 0, 0);
    let _shadowSize = -1;
    const clock = new THREE.Clock();
    let frames = 0;
    let lastDt = 0;
    let fpsTimer = 0;
    const fpsEl = $('fps');
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      lastDt = dt;
      const t = clock.elapsedTime;
      renderer.info.reset();
      const fps = dt > 0 ? 1 / dt : 60;
      ema += (fps - ema) * 0.05;

      if (!ctx.D.cineApi.playing) fly.tick(dt);
      // tickers accept (dt, elapsed); single-arg tickers get elapsed only
      for (const fn of ctx.D.tickers) { if (fn.length >= 2) fn(dt, t); else fn(t); }
      ctx.D.lightApi.tick(dt);
      ctx.D.char.tick(dt);
      ctx.D.cineApi.tick(dt);
      ctx.D.eduApi.tick(dt);
      // orbit controls own the camera except in fps (pointer-look owns it)
      if (!ctx.D.char || ctx.D.char.mode !== 'fps') controls.update();
      // shadow cache invalidation (see §10 note)
      {
        const s = sun();
        if (s) {
          const sz = s.shadow.mapSize.x;
          if (shadowWarmup > 0) { renderer.shadowMap.needsUpdate = true; shadowWarmup--; }
          else if (_sunPos.distanceToSquared(s.position) > 1e-10 || sz !== _shadowSize) {
            renderer.shadowMap.needsUpdate = true;
          }
          _sunPos.copy(s.position);
          _shadowSize = sz;
        }
      }
      composer.render();

      // governor
      if (autoQ && quality !== 'low') {
        if (ema < 27) lowTimer += dt;
        else lowTimer = 0;
        if (lowTimer > 3.5) {
          lowTimer = 0;
          applyQuality(quality === 'high' ? 'med' : 'low');
          toast(`Auto quality → ${quality} (${Math.round(ema)} fps)`);
        }
      }
      // HUD fps + cine button state
      frames++; fpsTimer += dt;
      if (fpsTimer > 0.5) {
        fpsTimer = 0;
        if (fpsEl) fpsEl.textContent = `${Math.round(ema)} fps • ${renderer.info.render.calls} calls`;
        if (!ctx.D.cineApi.playing && document.activeElement?.tagName !== 'BUTTON') {
          // keep cine button honest without fighting manual mode classes
          $('bCine')?.classList.remove('on');
        }
      }
    });

    setTimeout(() => $('loader')?.classList.add('done'), 400);
    toast('Drag to orbit • click gold markers • 1–9 viewpoints');
  } catch (err) {
    console.error(err);
    const l = loadmsg();
    if (l) l.textContent = `failed to boot: ${err.message}`;
  }
}

boot();
