// minorDomes.js — Dome of the Chain, Ascension, Prophet, Yusuf x2, Sabil Qaitbay,
// Sabil Qasim x3 (reused kiosk), Al-Kas fountain, 8x Mawazin arcades + 1 documented court lamp,
// PLUS Phase 3-STRUCT annex: Islamic Museum, Ashrafiyya/Library facade, madrasa
// strips, Cotton-Gate muqarnas portal, courtyard furniture, lantern posts.
// All positions recorded into ctx.D.poi. Lamps are emissive only (zero real lights).
// Metals strictly via M.* (lead / goldTrim / bronze); arches always DoubleSide.
// STRUCT = blockout→form only (flat M.stone/stoneLight/dark); lookdev in Phase 4-TEX.
import * as THREE from 'three';
import { domeGeo, archFrameGeo } from './geo.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const GY = 2.0;          // esplanade surface
const TY = 2.0 + 3.2;    // central terrace top (platform.js terrH)

function crescent(M, s = 1) {
  const g = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.07 * s, 0.9 * s, 8), M.goldTrim);
  rod.position.y = 0.45 * s; g.add(rod);
  const moon = new THREE.Mesh(new THREE.TorusGeometry(0.27 * s, 0.055 * s, 8, 22, Math.PI * 1.45), M.goldTrim);
  moon.position.y = 1.2 * s; moon.rotation.z = Math.PI * 0.78; g.add(moon);
  return g;
}

function colonnade(M, R, n, h, r = 0.22, mat = null) {
  const g = new THREE.Group();
  const matC = mat || M.marble;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.12, h, 10), matC);
    c.position.set(Math.cos(a) * R, h / 2, Math.sin(a) * R);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(r * 2.6, 0.22, r * 2.6), matC);
    cap.position.set(Math.cos(a) * R, h + 0.11, Math.sin(a) * R);
    g.add(c, cap);
  }
  return g;
}

function archMat(M) {
  const m = M.stoneLight.clone(); m.side = THREE.DoubleSide; return m;
}

// W7: merge loose primitive parts (fence scrolls, taps, trim) into one mesh.
// parts = [geo, x,y,z, rx,ry,rz]; all converted non-indexed (consistent attrs).
function mergedParts(parts, mat, name) {
  const list = parts.map(([g, x, y, z, rx = 0, ry = 0, rz = 0]) => {
    const c = g.index ? g.toNonIndexed() : g.clone();
    c.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
      new THREE.Vector3(1, 1, 1)));
    if (g !== c) g.dispose();
    return c;
  });
  const merged = mergeGeometries(list, false);
  list.forEach((g) => g.dispose());
  const m = new THREE.Mesh(merged, mat);
  m.name = name;
  return m;
}

const CHROME = () => new THREE.MeshStandardMaterial({ color: 0xb9c1c9, roughness: 0.25, metalness: 0.9 });

// ---- Dome of the Chain: 14m-dia pavilion, 11 outer + 6 inner cols h3m,
//      hexagonal drum + grey hemispheric dome ----
function makeChain(M) {
  const G = new THREE.Group(); G.name = 'dome-of-chain';
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.4, 0.6, 28), M.marble);
  floor.position.y = 0.3; G.add(floor);
  const step = new THREE.Mesh(new THREE.CylinderGeometry(7.7, 7.9, 0.3, 28), M.stoneLight);
  step.position.y = 0.05; G.add(step);
  G.add(colonnade(M, 6.3, 11, 3.0));
  G.add(colonnade(M, 2.6, 6, 3.0, 0.24));
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(6.9, 6.9, 0.5, 28), M.stoneLight);
  beam.position.y = 3.0 + 0.45; G.add(beam);
  // hexagonal drum with glowing niches
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.3, 2.2, 6), M.stoneLight);
  drum.position.y = 3.7 + 1.1; G.add(drum);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.3), M.glassWarm);
    w.position.set(Math.sin(a) * 3.22, 4.8, Math.cos(a) * 3.22); w.rotation.y = a; G.add(w);
  }
  const dome = new THREE.Mesh(domeGeo(3.25, 0.95, 36), M.lead);
  dome.position.y = 5.9; G.add(dome);
  const fin = crescent(M, 1.1); fin.position.y = 5.9 + 3.1; G.add(fin);
  return G;
}

// ---- Dome of the Ascension: closed octagon, white dome + cupola ----
function makeAscension(M) {
  const G = new THREE.Group(); G.name = 'dome-ascension';
  const walls = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.7, 3.0, 8), M.stoneLight);
  walls.position.y = 1.5; G.add(walls);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x241a10, roughness: 1, side: THREE.DoubleSide }));
  door.position.set(0, 1.05, 2.68); G.add(door);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.0), M.glassWarm);
    w.position.set(Math.sin(a) * 2.66, 1.9, Math.cos(a) * 2.66); w.rotation.y = a; G.add(w);
  }
  const cornice = new THREE.Mesh(new THREE.CylinderGeometry(2.85, 2.7, 0.35, 8), M.marble);
  cornice.position.y = 3.15; G.add(cornice);
  const dome = new THREE.Mesh(domeGeo(2.6, 0.9, 28), M.white);
  dome.position.y = 3.3; G.add(dome);
  // cupola: 4 mini-columns + cap dome
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.8, 8), M.marble);
    c.position.set(Math.sin(a) * 0.45, 5.95, Math.cos(a) * 0.45); G.add(c);
  }
  const cap = new THREE.Mesh(domeGeo(0.7, 0.95, 16), M.lead);
  cap.position.y = 6.35; G.add(cap);
  const fin = crescent(M, 0.7); fin.position.y = 7.05; G.add(fin);
  return G;
}

// ---- Dome of the Prophet: open octagon, 8 columns + lead dome ----
function makeProphet(M) {
  const G = new THREE.Group(); G.name = 'dome-prophet';
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.5, 8), M.marble);
  floor.position.y = 0.25; G.add(floor);
  G.add(colonnade(M, 2.9, 8, 2.8, 0.2));
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.4, 8), M.stoneLight);
  beam.position.y = 3.3; G.add(beam);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 1.6, 8), M.stoneLight);
  drum.position.y = 4.3; G.add(drum);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.9), M.glassWarm);
    w.position.set(Math.sin(a) * 2.32, 4.3, Math.cos(a) * 2.32); w.rotation.y = a; G.add(w);
  }
  const dome = new THREE.Mesh(domeGeo(2.35, 0.9, 28), M.lead);
  dome.position.y = 5.1; G.add(dome);
  const fin = crescent(M, 0.9); fin.position.y = 7.25; G.add(fin);
  return G;
}

// ---- Dome of Yusuf: tiny canopy — back wall + 2 columns + small dome ----
function makeYusuf(M) {
  const G = new THREE.Group(); G.name = 'dome-yusuf';
  const wall = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.4, 0.4), M.stone);
  wall.position.set(0, 1.2, -1.2); G.add(wall);
  for (const sx of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 2.2, 8), M.marble);
    c.position.set(sx * 1.1, 1.1, 1.0); G.add(c);
  }
  const slab = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 3.0), M.stoneLight);
  slab.position.y = 2.5; G.add(slab);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.9, 8), M.stoneLight);
  drum.position.y = 3.1; G.add(drum);
  const dome = new THREE.Mesh(domeGeo(1.05, 0.9, 20), M.lead);
  dome.position.y = 3.55; G.add(dome);
  const fin = crescent(M, 0.6); fin.position.y = 4.5; G.add(fin);
  return G;
}

// ---- Sabil Qaitbay: 13m, 3 ablaq tiers + pointed carved-stone dome ----
function makeQaitbay(M) {
  const G = new THREE.Group(); G.name = 'sabil-qaitbay';
  const ablaqDark = new THREE.MeshStandardMaterial({ color: 0x9a6a4a, roughness: 0.85, side: THREE.DoubleSide });
  // tier 1: square base 5x4x5 with ablaq banding + green grille
  const t1 = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 5), M.stoneLight);
  t1.position.y = 2.0; G.add(t1);
  for (let i = 0; i < 4; i++) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(5.12, 0.28, 5.12), i % 2 ? ablaqDark : M.marble);
    band.position.y = 0.9 + i * 0.85; G.add(band);
  }
  const grilleMat = new THREE.MeshStandardMaterial({ color: 0x1e4d33, roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide, emissive: 0x0a2013, emissiveIntensity: 0.4 });
  for (let f = 0; f < 4; f++) {
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.2), grilleMat);
    const a = f * Math.PI / 2;
    gr.position.set(Math.sin(a) * 2.53, 1.7, Math.cos(a) * 2.53); gr.rotation.y = a; G.add(gr);
  }
  // tier 2: octagonal transition with corner colonnettes
  const t2 = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.0, 2.4, 8), M.stoneLight);
  t2.position.y = 5.2; G.add(t2);
  // tier 3: drum with arched openings
  const t3 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.2, 1.9, 8), M.marble);
  t3.position.y = 7.35; G.add(t3);
  const am = archMat(M);
  const niche = archFrameGeo(0.9, 1.4, 0.3, 0.18);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
    const nz = new THREE.Mesh(niche, am);
    nz.position.set(Math.sin(a) * 2.0, 6.8, Math.cos(a) * 2.0); nz.rotation.y = a; G.add(nz);
  }
  // pointed carved-stone dome (riseK > 1)
  const dome = new THREE.Mesh(domeGeo(2.05, 1.3, 28), M.stoneLight);
  dome.position.y = 8.3; G.add(dome);
  const fin = crescent(M, 1.0); fin.position.y = 11.0; G.add(fin);
  return G;
}

// ---- Sabil Qasim kiosk (reused x3): octagon r1.8 h2.5 + dome + green canopy ----
function makeQasim(M, greenMat) {
  const G = new THREE.Group(); G.name = 'sabil-qasim';
  const core = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.9, 2.5, 8), M.stone);
  core.position.y = 1.25; G.add(core);
  const am = archMat(M);
  const niche = archFrameGeo(0.9, 1.5, 0.3, 0.16);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
    const nz = new THREE.Mesh(niche, am);
    nz.position.set(Math.sin(a) * 1.85, 0.7, Math.cos(a) * 1.85); nz.rotation.y = a; G.add(nz);
  }
  const dome = new THREE.Mesh(domeGeo(1.85, 0.85, 24), M.stoneLight);
  dome.position.y = 2.5; G.add(dome);
  // canopy on 8 green columns
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 2.6, 8), greenMat);
    c.position.set(Math.sin(a) * 3.9, 1.3, Math.cos(a) * 3.9); G.add(c);
  }
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.7, 0.35, 12), M.leadDark);
  roof.position.y = 2.75; G.add(roof);
  const fin = crescent(M, 0.6); fin.position.y = 4.2; G.add(fin);
  // ---- W7 canopy trim (refs fountains.jpg): eave fascia + edge trim,
  //      radial roof ribs, post brackets, dome base molding. Core untouched.
  const trim = [];
  trim.push([new THREE.CylinderGeometry(4.55, 4.7, 0.3, 12, 1, true), 0, 2.62, 0]);
  trim.push([new THREE.TorusGeometry(4.62, 0.06, 6, 24), 0, 2.5, 0, Math.PI / 2, 0, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    trim.push([new THREE.BoxGeometry(0.14, 0.07, 4.3), Math.sin(a) * 2.2, 2.96, Math.cos(a) * 2.2, 0, a, 0]);
  }
  trim.push([new THREE.TorusGeometry(1.9, 0.09, 6, 20), 0, 2.55, 0, Math.PI / 2, 0, 0]);
  const lead2 = M.leadDark.clone(); lead2.side = THREE.DoubleSide;
  G.add(mergedParts(trim, lead2, 'qasim-canopy-trim'));
  // knee braces: lean toward center, yawed per post (baked matrices)
  {
    const parts = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const bg = new THREE.BoxGeometry(0.1, 0.7, 0.1);
      bg.rotateX(0.6); // lean in local frame, +z = outward after yaw
      bg.applyMatrix4(new THREE.Matrix4().makeRotationY(a));
      bg.translate(Math.sin(a) * 3.82, 2.42, Math.cos(a) * 3.82);
      parts.push(bg.index ? bg.toNonIndexed() : bg);
    }
    const bm = new THREE.Mesh(mergeGeometries(parts, false), greenMat);
    bm.name = 'qasim-brackets';
    G.add(bm);
  }
  return G;
}

// ---- Al-Kas fountain (W7 completion; refs alkas-2008/alkas-reflection.jpg):
// circular marble basin + molding bands + 8 wall taps, pedestal bowl +
// column + upper dish + vase finial, wrought-iron scroll fence, seat curb.
// Water discs named for modules/water.js (noMerge so the merge pass keeps them).
function makeAlKas(M, greenMat) {
  const G = new THREE.Group(); G.name = 'alkas-fountain';
  const wallMat = M.stoneLight.clone(); wallMat.side = THREE.DoubleSide;
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.9, 1.1, 28, 1, true), wallMat);
  wall.position.y = 0.55; G.add(wall);
  // molding bands + rim + plinth step
  const rimParts = [
    [new THREE.TorusGeometry(4.92, 0.09, 8, 40), 0, 0.18, 0, Math.PI / 2, 0, 0],
    [new THREE.TorusGeometry(4.86, 0.07, 8, 40), 0, 0.95, 0, Math.PI / 2, 0, 0],
    [new THREE.TorusGeometry(4.8, 0.16, 8, 40), 0, 1.12, 0, Math.PI / 2, 0, 0],
  ];
  G.add(mergedParts(rimParts, M.marble, 'alkas-moldings'));
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(5.15, 5.3, 0.22, 28), M.stone);
  plinth.position.y = 0.11; G.add(plinth);
  const bed = new THREE.Mesh(new THREE.CircleGeometry(4.8, 28), M.stone);
  bed.rotation.x = -Math.PI / 2; bed.position.y = 0.12; G.add(bed);
  // main water disc (upgraded by modules/water.js)
  const water = new THREE.Mesh(new THREE.CircleGeometry(4.55, 56), M.glassBlue);
  water.rotation.x = -Math.PI / 2; water.position.y = 0.78;
  water.name = 'alkas-water';
  water.userData.noMerge = true;
  water.castShadow = false; water.receiveShadow = false;
  G.add(water);
  // 8 chrome wall taps (plate + spout + knob), baked matrices → 1 call
  {
    const geos = [];
    const put = (g, px, py, pz) => { g.translate(px, py, pz); geos.push(g.index ? g.toNonIndexed() : g); };
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const px = Math.sin(a), pz = Math.cos(a);
      const plate = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 12);
      plate.rotateX(Math.PI / 2); plate.applyMatrix4(new THREE.Matrix4().makeRotationY(a));
      put(plate, px * 4.93, 0.55, pz * 4.93);
      const sp = new THREE.CylinderGeometry(0.035, 0.045, 0.28, 8);
      sp.rotateZ(Math.PI / 2); sp.applyMatrix4(new THREE.Matrix4().makeRotationY(a - Math.PI / 2));
      put(sp, px * 5.02, 0.5, pz * 5.02);
      put(new THREE.SphereGeometry(0.05, 8, 6), px * 5.02, 0.63, pz * 5.02);
    }
    const tm = new THREE.Mesh(mergeGeometries(geos, false), CHROME());
    tm.name = 'alkas-taps';
    G.add(tm);
  }
  // centerpiece: foot + shaft + pedestal bowl + column + dish + vase + spout
  const bowlPts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    bowlPts.push(new THREE.Vector2(0.3 + 1.3 * Math.pow(t, 0.7), 0.05 + 0.5 * t * t));
  }
  const dishPts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    dishPts.push(new THREE.Vector2(0.15 + 0.65 * Math.pow(t, 0.8), 0.03 + 0.25 * t * t));
  }
  const vasePts = [
    new THREE.Vector2(0.02, 0), new THREE.Vector2(0.24, 0.02), new THREE.Vector2(0.3, 0.18),
    new THREE.Vector2(0.2, 0.42), new THREE.Vector2(0.12, 0.52), new THREE.Vector2(0.11, 0.66),
    new THREE.Vector2(0.16, 0.72),
  ];
  const center = new THREE.Group(); center.name = 'alkas-centerpiece'; G.add(center);
  const marbleDS = M.marble.clone(); marbleDS.side = THREE.DoubleSide; // lathe bowls seen from above/below
  const cadd = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; center.add(m); return m; };
  cadd(new THREE.CylinderGeometry(0.62, 0.78, 0.5, 12), M.marble, 0.37);
  cadd(new THREE.CylinderGeometry(0.4, 0.5, 0.95, 10), M.marble, 1.05);
  cadd(new THREE.LatheGeometry(bowlPts, 24), marbleDS, 1.35);
  cadd(new THREE.CylinderGeometry(0.22, 0.28, 0.85, 10), M.marble, 2.2);
  cadd(new THREE.LatheGeometry(dishPts, 20), marbleDS, 2.6);
  cadd(new THREE.LatheGeometry(vasePts, 16), marbleDS, 2.85);
  cadd(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 8), CHROME(), 3.65);
  cadd(new THREE.SphereGeometry(0.08, 10, 8), M.marble, 3.42);
  // bowl + dish water discs (upgraded by modules/water.js)
  for (const [r, y, nm] of [[1.42, 1.72, 'alkas-bowl-water'], [0.68, 2.8, 'alkas-dish-water']]) {
    const w = new THREE.Mesh(new THREE.CircleGeometry(r, 28), M.glassBlue);
    w.rotation.x = -Math.PI / 2; w.position.y = y;
    w.name = nm; w.userData.noMerge = true;
    w.castShadow = false; w.receiveShadow = false;
    center.add(w);
  }
  // wrought-iron scroll fence (r 6.1) + seat curb ring — merged green → 1 call
  {
    const parts = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const px = Math.sin(a) * 6.1, pz = Math.cos(a) * 6.1;
      const tall = i % 3 === 0;
      parts.push([new THREE.CylinderGeometry(0.055, 0.065, tall ? 1.35 : 1.1, 6), px, tall ? 0.675 : 0.55, pz]);
      if (tall) {
        parts.push([new THREE.ConeGeometry(0.09, 0.3, 8), px, 1.5, pz]);
        parts.push([new THREE.BoxGeometry(0.3, 0.05, 0.05), px, 1.32, pz, 0, a, 0]);
      } else {
        parts.push([new THREE.SphereGeometry(0.07, 8, 6), px, 1.16, pz]);
      }
      // scroll arcs face tangentially (plane contains tangent dir)
      const mid = a + Math.PI / 18;
      const mx = Math.sin(mid) * 6.1, mz = Math.cos(mid) * 6.1;
      parts.push([new THREE.TorusGeometry(0.3, 0.028, 6, 12, Math.PI * 1.2), mx, 0.78, mz, 0, mid + Math.PI / 2, 0.4]);
      parts.push([new THREE.TorusGeometry(0.22, 0.028, 6, 14), mx, 0.2, mz, 0, mid + Math.PI / 2, 0]);
    }
    for (const ry of [0.32, 0.62, 0.95])
      parts.push([new THREE.TorusGeometry(6.1, 0.04, 6, 64), 0, ry, 0, Math.PI / 2, 0, 0]);
    G.add(mergedParts(parts, greenMat, 'alkas-fence'));
    // seat curb: low stone ring outside fence doubles as seating
    const curb = new THREE.Mesh(new THREE.CylinderGeometry(7.0, 7.1, 0.45, 36, 1, true), wallMat);
    curb.position.y = 0.225; G.add(curb);
    const seat = new THREE.Mesh(new THREE.TorusGeometry(7.02, 0.1, 8, 48), M.marble);
    seat.rotation.x = Math.PI / 2; seat.position.y = 0.47; G.add(seat);
  }
  return G;
}

// ---- Mawazin arcade: 2 pillars + inner columns + 3 pointed arches ----
function makeMawazin(M) {
  const G = new THREE.Group(); G.name = 'mawazin';
  const am = archMat(M);
  for (const sx of [-2.6, 2.6]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4.2, 0.9), M.stoneLight);
    p.position.set(sx, 2.1, 0); G.add(p);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), M.marble);
    cap.position.set(sx, 4.3, 0); G.add(cap);
  }
  for (const sx of [-0.9, 0.9]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 3.6, 10), M.marble);
    c.position.set(sx, 1.8, 0); G.add(c);
  }
  const ag = archFrameGeo(2.2, 2.9, 0.6, 0.32);
  for (const sx of [-1.75, 0, 1.75]) {
    const a = new THREE.Mesh(ag, am);
    a.position.set(sx, 1.35, 0); G.add(a);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.6, 0.9), M.stoneLight);
  beam.position.y = 4.55; G.add(beam);
  return G;
}

function makeLamp(M, poleMat) {
  const G = new THREE.Group(); G.name = 'lamp';
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 4.6, 8), poleMat);
  pole.position.y = 2.3; G.add(pole);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 8), M.bronze);
  collar.position.y = 4.4; G.add(collar);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), M.glassWarm);
  globe.position.y = 4.85; G.add(globe);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.35, 8), poleMat);
  cap.position.y = 5.2; G.add(cap);
  return G;
}

export function buildMinorDomes(ctx) {
  const { scene, M } = ctx;
  ctx.D = ctx.D || {};
  if (!Array.isArray(ctx.D.poi)) ctx.D.poi = [];
  const G = new THREE.Group(); G.name = 'minor-domes'; scene.add(G);
  const poi = (name, ar, obj, kind) => {
    ctx.D.poi.push({ name, ar, kind, pos: obj.position.clone() });
  };
  const place = (obj, x, y, z, ry = 0) => {
    obj.position.set(x, y, z); obj.rotation.y = ry; G.add(obj); return obj;
  };
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x1f6a3d, roughness: 0.55, metalness: 0.3, side: THREE.DoubleSide });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x23282e, roughness: 0.6, metalness: 0.3 });

  place(makeChain(M), 32, TY, -70, 0.3);
  poi('Dome of the Chain', 'قبة السلسلة', G.children[G.children.length - 1], 'dome');
  // align-p4b: E-W mirror (was 26 = NE) + 12 m N nudge for Prophet clearance
  place(makeAscension(M), -26, TY, -112, -0.2);
  poi('Dome of the Ascension', 'قبة المعراج', G.children[G.children.length - 1], 'dome');
  place(makeProphet(M), -30, TY, -98, 0.15);
  poi("Dome of the Prophet", 'قبة النبي', G.children[G.children.length - 1], 'dome');

  place(makeYusuf(M), -60, GY, 105, 0.4);
  poi('Dome of Yusuf (south)', 'قبة يوسف', G.children[G.children.length - 1], 'dome');
  place(makeYusuf(M), 55, GY, 108, -0.5);
  poi('Dome of Yusuf (east)', 'قبة يوسف', G.children[G.children.length - 1], 'dome');

  place(makeQaitbay(M), -110, GY, 30, 0.5);
  poi('Sabil Qaitbay', 'سبيل قايتباي', G.children[G.children.length - 1], 'sabil');

  place(makeQasim(M, greenMat), -45, GY, -30, 0.2);
  poi('Sabil Qasim Pasha', 'سبيل قاسم باشا', G.children[G.children.length - 1], 'sabil');
  place(makeQasim(M, greenMat), 70, GY, -10, -0.3);
  poi('Ablution kiosk (east)', 'سبيل', G.children[G.children.length - 1], 'sabil');
  place(makeQasim(M, greenMat), -90, GY, -60, 0.9);
  poi('Ablution kiosk (west)', 'سبيل', G.children[G.children.length - 1], 'sabil');

  // align-p4b: mirror offset E of axis (was x=-20 = W per refs)
  place(makeAlKas(M, greenMat), 20, GY, 30, 0);
  poi('Al-Kas Fountain', 'الكأس', G.children[G.children.length - 1], 'fountain');

  // 8 Mawazin arcades flanking the 4 terrace stairs (2 per stair)
  const mw = [
    [10, -133.5, 0], [-10, -133.5, 0],       // north stair
    [10, -6.5, 0], [-10, -6.5, 0],           // south stair
    [65.5, -80, Math.PI / 2], [65.5, -60, Math.PI / 2],   // east stair
    [-65.5, -80, Math.PI / 2], [-65.5, -60, Math.PI / 2], // west stair
  ];
  mw.forEach(([x, z, ry], i) => {
    place(makeMawazin(M), x, GY, z, ry);
    poi('Mawazin ' + (i + 1), 'موازين', G.children[G.children.length - 1], 'mawazin');
  });

  // POLE-AUDIT 2026-10-02: 14-strong globe row REMOVED — zero photo
  // documentation (INDEX GAPS: lamps; fountains/sabil/qanatir/qibli-ne show
  // no globe lamps). ONE documented courtyard lamp kept, snapped to the
  // street-lamp in references/qibli-ne.jpg (N facade centre, ~14 m out):
  // single-view evidence + guessed style → PLACEHOLDER, needs 2nd view.
  const lampKept = place(makeLamp(M, poleMat), 6, GY, 108, 0);
  lampKept.userData.placeholder = true;

  // ---- Phase 3-STRUCT annex (blockout→form; massing casts, small stuff not) ----
  const structFix = buildStructuresAnnex(ctx, G, place, poi);

  G.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  for (const o of structFix) { o.castShadow = false; }
  return G;
}

// ================= Phase 3-STRUCT annex → Phase 4d TEX =================
// ObjectSculptSpec (§8): each structure = named Group holding ONLY sockets
// (Object3D 'socket-*' + userData.sockets, zero draw calls); geometry lives in
// 5 self-merged buckets (ashlar / light-ashlar / ablaq / wood / grille) +
// 5 small InstancedMesh. Buckets carry userData.placeholder (merge pass skips,
// shadow flags preserved). TEX only — geometry frozen. Shared M.* never
// mutated: all lookdev materials are local (dome-tex-p4a pattern).
// Refs: museum/museum-2013.jpg (honey ashlar, oak door, grille windows),
// sabil/cotton-gate.jpg (ablaq voussoirs, grilled gate, arcade band).
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

function structCanvasTex(size, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function paintAshlar(g, s, base, joint, courseH) {
  g.fillStyle = base; g.fillRect(0, 0, s, s);
  let row = 0;
  for (let y = 0; y < s; y += courseH, row++) {
    const off = (row % 2) * courseH * 1.5;
    for (let x = -courseH * 2; x < s + courseH * 2; x += courseH * 3) {
      const v = (Math.random() - 0.5) * 22;
      g.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 250 : 10},${v > 0 ? 235 : 0},${Math.abs(v) / 255})`;
      g.fillRect(x + off + 1, y + 1, courseH * 3 - 2, courseH - 2);
    }
    g.fillStyle = joint; g.fillRect(0, y, s, 2);
  }
  g.fillStyle = joint;
  for (let y = 0, row2 = 0; y < s; y += courseH, row2++)
    for (let x = -courseH * 2; x < s + courseH * 2; x += courseH * 3) {
      const vx = x + (row2 % 2) * courseH * 1.5;
      g.fillRect(vx, y, 2, courseH);
    }
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(70,50,30,${Math.random() * 0.09})`;
    g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
  }
}

function paintAblaq(g, s) {
  const ch = 64;
  for (let y = 0, r = 0; y < s; y += ch, r++) {
    g.fillStyle = r % 2 ? '#9e5a38' : '#e8dcc0'; g.fillRect(0, y, s, ch);
    g.fillStyle = '#f2ead6'; g.fillRect(0, y, s, 3);
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(60,30,15,${Math.random() * 0.08})`;
      g.fillRect(Math.random() * s, y + Math.random() * ch, 3, 2);
    }
  }
}

function paintGrille(g, s) {
  g.fillStyle = '#100d0a'; g.fillRect(0, 0, s, s);
  for (let x = 10; x < s; x += 42) {
    g.fillStyle = '#3d434b'; g.fillRect(x, 0, 5, s);
    g.fillStyle = 'rgba(200,210,220,.35)'; g.fillRect(x, 0, 1, s);
  }
  g.fillStyle = '#33383f';
  g.fillRect(0, s * 0.3, s, 6); g.fillRect(0, s * 0.68, s, 6);
}

function paintPlank(g, s) {
  const ph = s / 5;
  for (let p = 0; p < 5; p++) {
    const v = 108 + Math.random() * 24;
    g.fillStyle = `rgb(${v | 0},${(v * 0.72) | 0},${(v * 0.47) | 0})`;
    g.fillRect(0, p * ph, s, ph);
    g.strokeStyle = 'rgba(50,32,14,.5)'; g.lineWidth = 1;
    for (let k = 0; k < 7; k++) {
      g.beginPath();
      const gy = p * ph + Math.random() * ph;
      g.moveTo(0, gy);
      g.bezierCurveTo(s * 0.3, gy + 3, s * 0.6, gy - 3, s, gy + 2);
      g.stroke();
    }
    g.fillStyle = '#3d2c18'; g.fillRect(0, p * ph, s, 3);
  }
}

function buildStructTex() {
  return {
    ashlarMat: new THREE.MeshStandardMaterial({
      map: structCanvasTex(512, (g, s) => paintAshlar(g, s, '#d9bd8d', 'rgba(90,65,35,.55)', 30)),
      roughness: 0.92, metalness: 0 }),
    lightAshlarMat: new THREE.MeshStandardMaterial({
      map: structCanvasTex(512, (g, s) => paintAshlar(g, s, '#e4d3ac', 'rgba(100,80,50,.45)', 36)),
      roughness: 0.9, metalness: 0, side: THREE.DoubleSide }),
    ablaqMat: new THREE.MeshStandardMaterial({
      map: structCanvasTex(512, paintAblaq), roughness: 0.85, metalness: 0 }),
    grilleMat: new THREE.MeshStandardMaterial({
      map: structCanvasTex(256, paintGrille), roughness: 0.6, metalness: 0.4 }),
    woodMat: new THREE.MeshStandardMaterial({
      map: structCanvasTex(256, paintPlank), roughness: 0.8, metalness: 0 }),
    ironMat: new THREE.MeshStandardMaterial({ color: 0x2b2f34, roughness: 0.45, metalness: 0.85 }),
    amberGlass: new THREE.MeshStandardMaterial({
      color: 0x1f1408, emissive: 0xffb45e, emissiveIntensity: 1.8, roughness: 0.35, metalness: 0.1 }),
  };
}

function socket(parent, name, x, y, z) {
  const o = new THREE.Object3D();
  o.name = 'socket-' + name; o.position.set(x, y, z);
  parent.userData.sockets = parent.userData.sockets || {};
  parent.userData.sockets[name] = o.position.clone();
  parent.add(o); return o;
}

function newBag() {
  const a = [];
  return { a,
    put(geo, x, y, z, o = {}) {
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(o.rx || 0, o.ry || 0, o.rz || 0)),
        new THREE.Vector3(o.sx || 1, o.sy || 1, o.sz || 1));
      a.push({ g: geo, m, shared: !!o.shared });
    } };
}

function structBucket(G, mat, bag, cast, tag) {
  const parts = bag.a.map((it) => {
    const c = it.g.index ? it.g.toNonIndexed() : it.g.clone();
    c.applyMatrix4(it.m);
    if (!it.shared) it.g.dispose();
    return c;
  });
  const merged = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  const mesh = new THREE.Mesh(merged, mat);
  mesh.name = 'struct-' + tag;
  mesh.castShadow = cast; mesh.receiveShadow = true;
  mesh.userData.placeholder = true; // STRUCT form + P4d TEX; finer carving is Phase-5+ (flag also merge-skips)
  G.add(mesh); return mesh;
}

// Cross-module (platform.js owns the mesh): zero-scale the single west-portico
// instance blocking the Cotton-Gate axis. Pinned assumption: west colonnade =
// count-26 cylinder InstancedMesh, bay i → t=(i-12.5)*6.4 (i=14 → t≈9.6).
// Reversible; flagged for platform-owner review.
function openPorticoGap(ctx, count, idx) {
  const plat = ctx.scene.getObjectByName('platform');
  if (!plat) return;
  const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  plat.traverse((o) => {
    if (o.isInstancedMesh && o.count === count && o.geometry.type === 'CylinderGeometry') {
      o.setMatrixAt(idx, zero); o.instanceMatrix.needsUpdate = true;
    }
  });
}

// gate bay portal facing +x (pylons flank along z, arch + dark door inset)
function portalBayX(bags, x, zc, half, h) {
  bags.light.put(box(1.6, h, 1.6), x, GY + h / 2, zc - half);
  bags.light.put(box(1.6, h, 1.6), x, GY + h / 2, zc + half);
  bags.light.put(archFrameGeo(half * 2 - 1.5, h - 2.5, 0.9, 0.35), x, GY, zc, { ry: Math.PI / 2, shared: true });
  bags.grille.put(box(0.3, h - 4.6, half * 2 - 3), x + 0.75, GY + (h - 4.6) / 2, zc);
}

// madrasa facade strip with rhythm arches; faces courtyard (+x or -z)
function stripRun(bags, cx, cz, len, h, along) {
  const archN = Math.max(1, Math.floor(len / 5));
  if (along === 'z') {
    bags.stone.put(box(3, h, len), cx, GY + h / 2, cz);
    bags.light.put(box(3.4, 0.5, len + 0.4), cx, GY + h + 0.25, cz);
    const ag = archFrameGeo(2.2, 3.0, 0.5, 0.28);
    for (let i = 0; i < archN; i++)
      bags.light.put(ag, cx + 1.55, GY + 1.2, cz - len / 2 + (i + 0.5) * (len / archN), { ry: Math.PI / 2, shared: true });
  } else {
    bags.stone.put(box(len, h, 3), cx, GY + h / 2, cz);
    bags.light.put(box(len + 0.4, 0.5, 3.4), cx, GY + h + 0.25, cz);
    const ag = archFrameGeo(2.2, 3.0, 0.5, 0.28);
    for (let i = 0; i < archN; i++)
      bags.light.put(ag, cx - len / 2 + (i + 0.5) * (len / archN), GY + 1.2, cz - 1.55, { shared: true });
  }
}

function buildStructuresAnnex(ctx, G, place, poi) {
  const { M } = ctx;
  const fix = []; // small stuff: castShadow=false after the group traverse
  const bags = { stone: newBag(), light: newBag(), ablaq: newBag(), wood: newBag(), grille: newBag() };
  const T = buildStructTex(); // local P4d lookdev (shared M.* untouched)

  // ---- 1. Islamic Museum: SW vaulted block (former Crusader refectory) ----
  // Spec: long 2-storey bar 50×10×22 at (-80,163), east portal to Qibli court.
  {
    const grp = new THREE.Group(); grp.name = 'museum-islamic'; G.add(grp);
    const cx = -80, cz = 163;
    bags.stone.put(box(50, 10, 22), cx, GY + 5, cz);
    bags.light.put(box(44, 4, 18), cx, GY + 12, cz);
    bags.light.put(box(50.6, 0.8, 22.6), cx, GY + 10.4, cz);
    bags.light.put(box(2, 12, 8), cx + 25.5, GY + 6, cz);          // east portal mass
    bags.wood.put(box(0.4, 4.5, 2.8), cx + 26.4, GY + 2.25, cz);   // oak door inset
    for (let i = 0; i < 6; i++) bags.grille.put(box(0.3, 1.8, 1.2), cx + 25.05, GY + 7, cz - 9 + i * 3.6);
    for (let i = 0; i < 4; i++) bags.grille.put(box(1.2, 1.8, 0.3), cx - 18 + i * 12, GY + 7, cz + 11.05);
    socket(grp, 'door', cx + 26.5, GY, cz);
    socket(grp, 'vaultstart', cx - 20, GY + 8, cz);
    socket(grp, 'court-axis', cx + 30, GY, cz);
    poi('Islamic Museum', 'المتحف الإسلامي', { position: new THREE.Vector3(cx, GY, cz) }, 'museum');
  }

  // ---- 2. Ashrafiyya madrasa / al-Aqsa Library: 2-storey ablaq facade ----
  // Spec: 30m frontage facing +x at x≈-147.5 (z -28..2), ablaq bands, upper
  // loggia, muqarnas portal, crenellated crown.
  {
    const grp = new THREE.Group(); grp.name = 'ashrafiyya-library'; G.add(grp);
    const cx = -147.5, zc = -13;
    bags.stone.put(box(3, 5, 30), cx, GY + 2.5, zc);
    bags.ablaq.put(box(3.2, 0.4, 30.2), cx, GY + 3.2, zc);          // ablaq band 1
    bags.ablaq.put(box(3.2, 0.4, 30.2), cx, GY + 4.4, zc);          // ablaq band 2
    bags.light.put(box(3, 4.5, 30), cx, GY + 7.25, zc);
    bags.light.put(box(3.4, 0.5, 30.4), cx, GY + 9.7, zc);
    const lg = archFrameGeo(2.6, 3.4, 0.5, 0.3);
    for (const z of [-25, -19, -7, -1]) bags.light.put(lg, cx + 1.6, GY + 5.6, z, { ry: Math.PI / 2, shared: true });
    for (let i = 0; i < 8; i++) bags.light.put(box(0.9, 0.7, 1.2), cx, GY + 10.3, -26.5 + i * 3.6);
    bags.light.put(box(1.6, 9, 2.2), cx + 1.2, GY + 4.5, zc - 3.2); // portal pylons
    bags.light.put(box(1.6, 9, 2.2), cx + 1.2, GY + 4.5, zc + 3.2);
    for (let t = 0; t < 4; t++)                                    // muqarnas hood
      bags.light.put(new THREE.CylinderGeometry(2.4 - t * 0.35, (2.4 - t * 0.35) * 0.9, 0.55, 8), cx + 1.2, GY + 8.2 + t * 0.55, zc);
    bags.wood.put(box(0.4, 3.6, 2.4), cx + 2.0, GY + 1.8, zc);
    socket(grp, 'door', cx + 2.2, GY, zc);
    socket(grp, 'loggia', cx + 1.8, GY + 5.6, zc);
    socket(grp, 'hood', cx + 1.2, GY + 10.2, zc);
    poi('Ashrafiyya / Library', 'الأشرفية والمكتبة', { position: new THREE.Vector3(cx, GY, zc) }, 'madrasa');
  }

  // ---- 3. Madrasa facade strips (Tankiziyya S1, west row S3, north rows) ----
  stripRun(bags, -147.5, 45, 18, 8, 'z');    // S1 Tankiziyya (z 36..54)
  stripRun(bags, -147.5, -58, 24, 8, 'z');   // S3 west row (z -70..-46)
  stripRun(bags, -70, -221.5, 40, 8, 'x');   // N1 (x -90..-50)
  stripRun(bags, 0, -221.5, 40, 8, 'x');     // N2 (x -20..20)
  {
    const grp = new THREE.Group(); grp.name = 'madrasa-rows'; G.add(grp);
    socket(grp, 'tankiziyya-door', -145.5, GY, 45);
    socket(grp, 'north-door', -70, GY, -219.5);
    poi('Tankiziyya Madrasa', 'التنكزية', { position: new THREE.Vector3(-147.5, GY, 45) }, 'madrasa');
    poi('Madrasa rows', 'مدارس', { position: new THREE.Vector3(-70, GY, -221.5) }, 'madrasa');
  }
  portalBayX(bags, -146, 60, 3.9, 8);        // Silsila passage (spans portico bay)
  portalBayX(bags, -146, -40, 2.6, 7);       // Nazir passage
  { // Rahma passage (north, faces courtyard): narrow to clear portico column
    bags.light.put(box(1.6, 7, 1.6), -41.5, GY + 3.5, -221.5);
    bags.light.put(box(1.6, 7, 1.6), -36.5, GY + 3.5, -221.5);
    bags.light.put(archFrameGeo(3.4, 4.6, 0.9, 0.3), -39, GY, -221.5, { shared: true });
    bags.wood.put(box(2.4, 3.2, 0.3), -39, GY + 1.6, -221.8);
  }

  // ---- 4. Cotton-Gate (Bab al-Qattanin) muqarnas recess ----
  {
    const grp = new THREE.Group(); grp.name = 'bab-qattanin'; G.add(grp);
    const x = -146, zc = 10;
    bags.light.put(box(2.2, 11, 2.6), x, GY + 5.5, zc - 4.2);
    bags.light.put(box(2.2, 11, 2.6), x, GY + 5.5, zc + 4.2);
    bags.light.put(archFrameGeo(5.6, 8, 1.2, 0.4), x, GY, zc, { ry: Math.PI / 2, shared: true });
    for (let t = 0; t < 5; t++) {            // muqarnas hood over recess
      const r = 3.1 - t * 0.38;
      bags.light.put(new THREE.CylinderGeometry(r * 0.82, r, 0.6, 8), x, GY + 8.4 + t * 0.6, zc);
    }
    bags.wood.put(box(0.4, 4.2, 3.0), x + 1.0, GY + 2.1, zc);
    for (let k = 0; k < 2; k++) bags.stone.put(box(1.6, 0.35, 7 - k * 0.5), x + 2.4 + k * 1.3, GY + 0.12, zc);
    socket(grp, 'door', x + 1.2, GY, zc);
    socket(grp, 'hood', x, GY + 11.4, zc);
    socket(grp, 'stair-top', x + 2.2, GY, zc);
    poi('Bab al-Qattanin', 'باب القطانين', { position: new THREE.Vector3(x, GY, zc) }, 'gate');
    openPorticoGap(ctx, 26, 14); // bay i=14 (t≈9.6) blocks the gate axis
  }

  // ---- 5. Courtyard furniture: stone bench rows (1 InstancedMesh) ----
  {
    const spots = [];
    for (let i = 0; i < 8; i++) { spots.push([-28 + i * 8, GY, 98, 0]); spots.push([-28 + i * 8, GY, 103, 0]); }
    spots.push([46, TY, -58, 0.3], [46, TY, -82, -0.3], [-46, TY, -62, 0.3], [-46, TY, -78, -0.3]);
    const inst = new THREE.InstancedMesh(box(1.8, 0.45, 0.55), T.woodMat, spots.length);
    const d = new THREE.Object3D();
    spots.forEach(([x, y, z, ry], i) => {
      d.position.set(x, y + 0.225, z); d.rotation.set(0, ry, 0); d.updateMatrix();
      inst.setMatrixAt(i, d.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.name = 'furniture-benches';
    inst.userData.placeholder = true; // STRUCT: Phase-4 adds racks/tables
    inst.frustumCulled = false;
    G.add(inst); fix.push(inst);
  }

  // POLE-AUDIT 2026-10-02: 10 lantern posts REMOVED — undocumented in
  // every references/ view checked (fountains/sabil/qanatir/aerials show
  // bare terrace + courts). Restore only with 2+ photo views + positions.

  // ---- self-merged buckets (3 calls, shadows preserved via placeholder flag) ----
  structBucket(G, T.ashlarMat, bags.stone, true, 'mass-ashlar');
  structBucket(G, T.lightAshlarMat, bags.light, true, 'mass-light');
  fix.push(structBucket(G, T.ablaqMat, bags.ablaq, false, 'ablaq-bands'));
  fix.push(structBucket(G, M.darkWood, bags.wood, false, 'wood-doors'));
  fix.push(structBucket(G, T.grilleMat, bags.grille, false, 'grille-insets'));
  return fix;
}
