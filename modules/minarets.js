// minarets.js — four Haram al-Sharif minarets (Syrian square type + Ottoman Asbat)
// Ghawanima (NW, 38.5m, 6 stories, most decorated) • Silsila (W-center, 35m)
// Fakhriyya (SW, 23m, shortest) • Asbat (N, ~28m, cylindrical Ottoman shaft)
// Common grammar: base 4x4x6 + shaft + moldings + muqarnas corbel (stacked
// cylinders) + balcony + colonnette canopy + lantern + lead dome + crescent.
// ONE real PointLight in this module (Silsila balcony); all other glow is emissive.
import * as THREE from 'three';
import { domeGeo, archFrameGeo } from './geo.js';

const GY = 2.0; // esplanade walking surface

function crescent(M, s = 1) {
  const g = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.08 * s, 1.0 * s, 8), M.goldTrim);
  rod.position.y = 0.5 * s; g.add(rod);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 10, 8), M.goldTrim);
  ball.position.y = 0.95 * s; g.add(ball);
  const moon = new THREE.Mesh(new THREE.TorusGeometry(0.3 * s, 0.06 * s, 8, 22, Math.PI * 1.45), M.goldTrim);
  moon.position.y = 1.35 * s; moon.rotation.z = Math.PI * 0.78; g.add(moon);
  return g;
}

// Muqarnas corbel: stacked flaring cylinders, alternating rotation (octagonal)
function muqarnas(M, r, h, tiers = 4) {
  const g = new THREE.Group();
  for (let i = 0; i < tiers; i++) {
    const rr = r * (1 - 0.14 * i);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr * 0.88, h / tiers, 8), M.stoneLight);
    m.position.y = (i + 0.5) * (h / tiers);
    m.rotation.y = (i % 2) * Math.PI / 8;
    g.add(m);
  }
  return g;
}

function slitWindow(M, w = 0.35, h = 1.1) {
  // narrow glowing slit (emissive, no light) with stone sill
  const g = new THREE.Group();
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.glassWarm);
  g.add(glow);
  const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.12, 0.14), M.stoneLight);
  sill.position.y = -h / 2 - 0.05; sill.position.z = 0.03; g.add(sill);
  return g;
}

// cfg: { key, shaft:'square'|'cyl', base, shaftH, stories, muqH, balc, canopyH, lantH, domeR, decor }
function makeMinaret(M, cfg) {
  const G = new THREE.Group();
  G.name = 'minaret-' + cfg.key;
  let y = 0;
  const put = (m) => { G.add(m); return m; };

  // plinth + base 4x4x6
  const plinth = put(new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.0, 5.2), M.stone));
  plinth.position.y = y + 0.5; y += 1.0;
  const base = put(new THREE.Mesh(new THREE.BoxGeometry(4, 6, 4), M.stone));
  base.position.y = y + 3; y += 6;
  // base door (west face) — dark inset, DoubleSide frame
  const door = put(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), new THREE.MeshStandardMaterial({ color: 0x1a140e, roughness: 1, side: THREE.DoubleSide })));
  door.position.set(0, y - 6 + 1.6, -2.01); door.rotation.y = Math.PI;

  // shaft
  const shaftW = cfg.shaft === 'cyl' ? 0 : 3.0;
  const shaftR = 1.7;
  let shaft;
  if (cfg.shaft === 'cyl') {
    shaft = put(new THREE.Mesh(new THREE.CylinderGeometry(shaftR * 0.92, shaftR, cfg.shaftH, 16), M.stoneLight));
  } else {
    shaft = put(new THREE.Mesh(new THREE.BoxGeometry(shaftW, cfg.shaftH, shaftW), M.stone));
  }
  shaft.position.y = y + cfg.shaftH / 2;

  // string-course moldings divide the stories
  const n = cfg.stories;
  for (let i = 1; i <= n; i++) {
    const my = y + (cfg.shaftH * i) / (n + 0.4);
    const w = cfg.shaft === 'cyl' ? shaftR * 2 + 0.35 : shaftW + 0.4;
    const mold = put(new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, w), M.stoneLight));
    mold.position.y = my;
    if (cfg.shaft === 'cyl') { mold.geometry = new THREE.CylinderGeometry(shaftR + 0.18, shaftR + 0.18, 0.32, 16); }
  }
  // slit windows up the shaft (emissive, alternating faces)
  const slits = Math.max(2, Math.round(cfg.shaftH / 5));
  for (let i = 0; i < slits; i++) {
    const s = slitWindow(M, 0.32, cfg.key === 'ghawanima' ? 1.3 : 1.0);
    const sy = y + 3 + i * ((cfg.shaftH - 4) / Math.max(1, slits - 1));
    const face = i % 4;
    const off = cfg.shaft === 'cyl' ? shaftR + 0.02 : shaftW / 2 + 0.02;
    if (face === 0) { s.position.set(0, sy, off); }
    if (face === 1) { s.position.set(off, sy, 0); s.rotation.y = Math.PI / 2; }
    if (face === 2) { s.position.set(0, sy, -off); s.rotation.y = Math.PI; }
    if (face === 3) { s.position.set(-off, sy, 0); s.rotation.y = -Math.PI / 2; }
    G.add(s);
  }
  // Ghawanima: blind-arch panels (most decorated) — shared cached geo, DoubleSide
  if (cfg.decor) {
    const archMat = M.stoneLight.clone(); archMat.side = THREE.DoubleSide;
    const panel = archFrameGeo(1.7, 2.6, 0.18, 0.22);
    for (let f = 0; f < 4; f++) {
      const p = new THREE.Mesh(panel, archMat);
      const py = y + cfg.shaftH * 0.45;
      const off = shaftW / 2 + 0.02;
      if (f === 0) p.position.set(0, py, off);
      if (f === 1) { p.position.set(off, py, 0); p.rotation.y = Math.PI / 2; }
      if (f === 2) { p.position.set(0, py, -off); p.rotation.y = Math.PI; }
      if (f === 3) { p.position.set(-off, py, 0); p.rotation.y = -Math.PI / 2; }
      G.add(p);
    }
    // ablaq band near shaft crown (alternating light/dark course)
    const band = put(new THREE.Mesh(
      new THREE.BoxGeometry(shaftW + 0.15, 0.7, shaftW + 0.15),
      new THREE.MeshStandardMaterial({ color: 0x9a6a4a, roughness: 0.85, side: THREE.DoubleSide })));
    band.position.y = y + cfg.shaftH - 1.2;
  }
  y += cfg.shaftH;

  // muqarnas corbel under balcony
  const corbelR = cfg.shaft === 'cyl' ? shaftR + 1.0 : 2.9;
  const corbel = muqarnas(M, corbelR, cfg.muqH, cfg.decor ? 5 : 4);
  corbel.position.y = y; G.add(corbel); y += cfg.muqH;

  // balcony floor + parapet
  const balcW = cfg.balc;
  const floor = put(new THREE.Mesh(new THREE.BoxGeometry(balcW, 0.45, balcW), M.stoneLight));
  floor.position.y = y + 0.22; y += 0.45;
  const par = put(new THREE.Mesh(new THREE.BoxGeometry(balcW, 0.9, 0.25), M.stoneLight));
  par.position.set(0, y + 0.45, balcW / 2 - 0.12);
  const par2 = par.clone(); par2.position.z = -balcW / 2 + 0.12; G.add(par2);
  const par3 = put(new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, balcW), M.stoneLight));
  par3.position.set(balcW / 2 - 0.12, y + 0.45, 0);
  const par4 = par3.clone(); par4.position.x = -balcW / 2 + 0.12; G.add(par4);

  // colonnette canopy (photo: wooden roof carried on slender columns)
  const colH = cfg.canopyH;
  const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  if (cfg.decor) corners.push([0, -1], [0, 1], [-1, 0], [1, 0]); // 8 colonnettes
  for (const [sx, sz] of corners) {
    const c = put(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, colH, 8), M.marble));
    c.position.set(sx * (balcW / 2 - 0.35), y + colH / 2, sz * (balcW / 2 - 0.35));
  }
  const roof = put(new THREE.Mesh(new THREE.BoxGeometry(balcW + 1.6, 0.28, balcW + 1.6), M.darkWood));
  roof.position.y = y + colH; y += colH + 0.14;

  // lantern (octagonal) with glowing arched openings
  const lantR = 1.9, lantH = cfg.lantH;
  const lant = put(new THREE.Mesh(new THREE.CylinderGeometry(lantR, lantR * 1.06, lantH, 8), M.stoneLight));
  lant.position.y = y + lantH / 2;
  for (let f = 0; f < 4; f++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.6), M.glassWarm);
    const a = f * Math.PI / 2 + Math.PI / 8;
    win.position.set(Math.sin(a) * (lantR + 0.03), y + lantH * 0.52, Math.cos(a) * (lantR + 0.03));
    win.rotation.y = a; G.add(win);
  }
  y += lantH;
  const cornice = put(new THREE.Mesh(new THREE.CylinderGeometry(lantR + 0.3, lantR + 0.1, 0.35, 8), M.stoneLight));
  cornice.position.y = y + 0.17; y += 0.35;

  // lead dome + crescent (metals only via M.*)
  const dome = put(new THREE.Mesh(domeGeo(cfg.domeR, 0.92, 32), M.lead));
  dome.position.y = y; y += cfg.domeR * 0.92;
  const fin = crescent(M, 1.0);
  fin.position.y = y; G.add(fin); y += 1.6;

  G.userData.height = y;
  G.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return G;
}

export function buildMinarets(ctx) {
  const { scene, M } = ctx;
  ctx.D = ctx.D || {};
  const G = new THREE.Group(); G.name = 'minarets'; scene.add(G);

  const defs = [
    // key, shaft, base.., target totals: 38.5 / 35 / 23 / 28
    { key: 'ghawanima', shaft: 'square', shaftH: 20.0, stories: 6, muqH: 1.6, balc: 5.4, canopyH: 2.6, lantH: 4.0, domeR: 2.4, decor: true, pos: [-140, -140], name: 'Ghawanima Minaret' },
    { key: 'silsila', shaft: 'square', shaftH: 16.5, stories: 4, muqH: 1.5, balc: 5.2, canopyH: 2.5, lantH: 3.8, domeR: 2.3, decor: false, pos: [-148, 60], name: 'Silsila Minaret' },
    { key: 'fakhriyya', shaft: 'square', shaftH: 8.0, stories: 2, muqH: 1.2, balc: 4.8, canopyH: 2.2, lantH: 2.6, domeR: 1.9, decor: false, pos: [-140, 210], name: 'Fakhriyya Minaret' },
    { key: 'asbat', shaft: 'cyl', shaftH: 13.0, stories: 3, muqH: 1.4, balc: 5.0, canopyH: 2.4, lantH: 2.8, domeR: 2.0, decor: false, pos: [60, -218], name: 'Asbat Minaret' },
  ];

  ctx.D.minarets = [];
  let silsilaBalcony = null;
  for (const d of defs) {
    const m = makeMinaret(M, d);
    m.position.set(d.pos[0], GY, d.pos[1]);
    G.add(m);
    ctx.D.minarets.push({ name: d.name, key: d.key, pos: m.position.clone(), height: m.userData.height });
    if (d.key === 'silsila') silsilaBalcony = m;
  }

  // THE single real light in this module: warm lamp on the Silsila balcony
  if (silsilaBalcony) {
    const lamp = new THREE.PointLight(0xffc37a, 55, 42, 2);
    lamp.position.set(0, 6 + 16.5 + 1.5 + 2.2, 0); // above balcony floor
    silsilaBalcony.add(lamp);
  }
  return G;
}
