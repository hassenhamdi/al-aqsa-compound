// domeOfRock.js — Dome of the Rock (Qubbat as-Sakhra, 691 CE, Umayyad).
// Octagonal shrine: marble lower story + blue-tile upper story, 16-window drum,
// gilt-wood/lead-gold dome on 32 ribs with crescent finial, walkable interior
// (rock, 2 column rings, ambos, chandeliers, mosaic drum + gilt dome soffit).
import * as THREE from 'three';
import { domeGeo, ribGeo, archFrameGeo, pointedArchPath, canvasTex } from './geo.js';

const SIDE = 20;                                     // outer octagon face width (m)
const R_OCT = SIDE / (2 * Math.sin(Math.PI / 8));    // circumradius ≈ 26.13
const APOTHEM = R_OCT * Math.cos(Math.PI / 8);       // face-plane distance ≈ 24.14
const WALL_LO = 4.9, WALL_HI = 6.1, WALL_H = WALL_LO + WALL_HI; // 11
const DRUM_R = 10.1, DRUM_H = 6.5;
const DOME_R = 10.2, DOME_K = 1.05;                  // rise ≈ 10.7
const TY = 5.22, CX = 0, CZ = -70;                   // terrace-top origin
const OCT_R = Math.PI / 8;                           // cylinder twist so faces hit 45° multiples

export function buildDomeOfRock(ctx) {
  const { scene, M, D } = ctx;
  if (!D.tickers) D.tickers = [];

  const G = new THREE.Group(); G.name = 'domeOfRock';
  G.position.set(CX, TY, CZ); scene.add(G);
  const add = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; G.add(m); return m; };
  const dummy = new THREE.Object3D();
  const noCull = (m) => { m.frustumCulled = false; return m; };
  // face k centre angle; n = outward normal, t = along-face tangent
  const faceFrame = (k) => {
    const a = k * Math.PI / 4;
    return { a, n: new THREE.Vector3(Math.sin(a), 0, Math.cos(a)), t: new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)) };
  };

  // ---------- Phase 4a TEX lookdev (local only — shared M.* never mutated) ----------
  // evidence: marble-detail.jpg (book-matched grey veins, joints, patina),
  // sidepart-2 (green lattice coffers, gilt bosses, marble chevrons, mosaic arches)
  const drawTile = (g, s) => {
    const grad = g.createLinearGradient(0, 0, 0, s);
    grad.addColorStop(0, '#1a4488'); grad.addColorStop(0.55, '#123a7d'); grad.addColorStop(1, '#0d2a5e');
    g.fillStyle = grad; g.fillRect(0, 0, s, s);
    const H = s / 3;
    // lower register: white diamond lattice, turquoise centers
    g.lineWidth = 9; g.strokeStyle = '#f4ecd8';
    for (let i = -1; i < 9; i++) {
      const x0 = i * s / 8;
      g.beginPath(); g.moveTo(x0, s); g.lineTo(x0 + s / 4, s - H); g.lineTo(x0 + s / 2, s - H); g.lineTo(x0 + s, s); g.stroke();
      g.fillStyle = '#3fc1c9';
      g.beginPath(); g.arc(x0 + s / 4, s - H / 2, 24, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#f4ecd8'; g.font = 'bold 28px serif'; g.textAlign = 'center';
      g.fillText('✦', x0 + s / 4, s - H / 2 + 10);
    }
    // middle register: calligraphy band — bold white verticals + gold dots, gold rules
    g.fillStyle = '#0b2350'; g.fillRect(0, s - 2 * H, s, H);
    g.fillStyle = '#e8d27a'; g.fillRect(0, s - 2 * H, s, 8); g.fillRect(0, s - H - 8, s, 8);
    g.strokeStyle = '#f4ecd8'; g.lineWidth = 12; g.lineCap = 'round';
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const x = i * s / 8 + s / 16;
      g.moveTo(x, s - 2 * H + 30); g.lineTo(x, s - H - 30);
      g.moveTo(x - 34, s - H * 1.5); g.lineTo(x + 34, s - H * 1.5);
    }
    g.stroke();
    g.fillStyle = '#e8d27a';
    for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(i * s / 8 + s / 8, s - H * 1.5 - 52, 9, 0, Math.PI * 2); g.fill(); }
    // top register: turquoise palmettes + white dots
    for (let i = 0; i < 8; i++) {
      const x = i * s / 8 + s / 16;
      g.strokeStyle = '#3fc1c9'; g.lineWidth = 8;
      g.beginPath(); g.arc(x, H - 20, 44, Math.PI, 0); g.stroke();
      g.beginPath(); g.arc(x, H - 20, 24, Math.PI, 0); g.stroke();
      g.fillStyle = '#f4ecd8'; g.beginPath(); g.arc(x, 26, 10, 0, Math.PI * 2); g.fill();
    }
  };
  const tileWallTex = canvasTex(1024, drawTile, [24, 1]);
  const tileDrumTex = tileWallTex.clone(); tileDrumTex.repeat.set(10, 1); tileDrumTex.needsUpdate = true;
  const tileMatWall = new THREE.MeshStandardMaterial({ map: tileWallTex, roughness: 0.38, metalness: 0.08, envMapIntensity: 0.6 });
  const tileMatDrum = new THREE.MeshStandardMaterial({ map: tileDrumTex, roughness: 0.42, metalness: 0.08, envMapIntensity: 0.5 });
  // marble revetment: book-matched veins + joints + patina (marble-detail.jpg)
  const marbTex = canvasTex(1024, (g, s) => {
    g.fillStyle = '#eceae4'; g.fillRect(0, 0, s, s);
    for (let v = 0; v < 34; v++) {
      const x0 = (v * 197) % s;
      g.strokeStyle = `rgba(105,110,120,${0.18 + (v % 5) * 0.06})`;
      g.lineWidth = 1 + (v % 4);
      g.beginPath(); let x = x0, y = -10; g.moveTo(x, y);
      for (let k = 0; k < 8; k++) { x += Math.sin(v * 3 + k * 1.7) * 60; y += s / 8; g.lineTo(x, y); }
      g.stroke();
    }
    g.strokeStyle = 'rgba(90,95,105,.3)'; g.lineWidth = 2; // book-match chevrons
    for (let c = 0; c < 4; c++) {
      const cx = c * s / 4 + s / 8;
      g.beginPath(); g.moveTo(cx - 90, 0); g.lineTo(cx, 140); g.lineTo(cx + 90, 0); g.stroke();
      g.beginPath(); g.moveTo(cx - 90, s); g.lineTo(cx, s - 140); g.lineTo(cx + 90, s); g.stroke();
    }
    g.strokeStyle = 'rgba(70,64,54,.55)'; g.lineWidth = 3; // panel joints
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * s / 4, 0); g.lineTo(i * s / 4, s); g.stroke(); }
    g.beginPath(); g.moveTo(0, s / 2); g.lineTo(s, s / 2); g.stroke();
    for (let b = 0; b < 10; b++) { // warm patina
      const bx = (b * 349) % s, by = (b * 271) % s, br = 20 + (b * 13) % 40;
      const rg = g.createRadialGradient(bx, by, 0, bx, by, br);
      rg.addColorStop(0, 'rgba(150,118,72,.10)'); rg.addColorStop(1, 'rgba(150,118,72,0)');
      g.fillStyle = rg; g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill();
    }
  }, [6, 1]);
  const marbleMat = new THREE.MeshStandardMaterial({ map: marbTex, color: 0xf2ede2, roughness: 0.38, metalness: 0.05, envMapIntensity: 0.5 });
  // dome flats a touch deeper so ribs read without bloom blowout (ribs stay bright trim)
  const goldMat = new THREE.MeshStandardMaterial({ map: M.gold.map, color: 0xd9b878, roughness: 0.34, metalness: 1.0, envMapIntensity: 1.0 });
  // ablaq voussoir striping for arcade arches (extrude UVs are meters: 5 bands/m)
  const ablaqTex = canvasTex(256, (g, s) => {
    const bands = ['#e8dcc2', '#e8dcc2', '#33383f', '#e8dcc2', '#7a3a2a'];
    const bh = s / bands.length;
    bands.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * bh, s, bh + 1); });
    g.fillStyle = '#e8c26a'; g.fillRect(0, 0, s, 3);
  }, [1, 1]);

  // ---------- octagon massing: marble lower + tile upper ----------
  const lower = add(new THREE.Mesh(new THREE.CylinderGeometry(R_OCT, R_OCT, WALL_LO, 8, 1, true), marbleMat));
  lower.rotation.y = OCT_R; lower.position.y = WALL_LO / 2;
  const upper = add(new THREE.Mesh(new THREE.CylinderGeometry(R_OCT, R_OCT, WALL_HI, 8, 1, true), tileMatWall));
  upper.rotation.y = OCT_R; upper.position.y = WALL_LO + WALL_HI / 2;

  // ---------- inscription frieze band (gold on deep blue) ----------
  const inscTex = canvasTex(1024, (g, s) => {
    const grad = g.createLinearGradient(0, 0, 0, s);
    grad.addColorStop(0, '#16407f'); grad.addColorStop(1, '#0b2350');
    g.fillStyle = grad; g.fillRect(0, 0, s, s);
    g.fillStyle = '#e8d27a'; g.fillRect(0, 18, s, 10); g.fillRect(0, s - 28, s, 10);
    // one cartouche per tile; horizontally repeated x8
    g.strokeStyle = '#f2dd9a'; g.lineWidth = 10;
    g.beginPath(); g.roundRect(s * 0.08, s * 0.16, s * 0.84, s * 0.68, 40); g.stroke();
    g.lineWidth = 7; g.strokeStyle = '#ffe9b0';
    g.beginPath();
    for (let i = 0; i < 7; i++) {
      const x = s * (0.16 + i * 0.113);
      g.moveTo(x, s * 0.68); g.lineTo(x, s * 0.38);
      g.moveTo(x, s * 0.38); g.quadraticCurveTo(x + 26, s * 0.34, x + 12, s * 0.26);
      g.moveTo(x - 22, s * 0.52); g.lineTo(x + 22, s * 0.52);
    }
    g.stroke();
    g.fillStyle = '#ffffff'; g.font = 'bold 44px serif'; g.textAlign = 'center';
    g.fillText('✦ ✦ ✦', s / 2, s * 0.24);
  }, [8, 1]);
  const bandMat = new THREE.MeshStandardMaterial({ map: inscTex, roughness: 0.45, metalness: 0.15, envMapIntensity: 0.5 });
  const band = add(new THREE.Mesh(new THREE.CylinderGeometry(R_OCT + 0.18, R_OCT + 0.18, 1.4, 8, 1, true), bandMat), false, true);
  band.rotation.y = OCT_R; band.position.y = 10.0;

  // ---------- cornice + roof + parapet curb ----------
  const cornice = add(new THREE.Mesh(new THREE.CylinderGeometry(R_OCT + 0.65, R_OCT + 0.3, 0.6, 8), M.white));
  cornice.rotation.y = OCT_R; cornice.position.y = WALL_H + 0.3;
  // roof RING (never a slab): the drum eye stays open so the interior reads up into dome.
  // (A solid disc here sealed the drum/dome off from inside — same occlusion class as qibli-p3a's buried floor.)
  const roofShape = new THREE.Shape();
  const roofHole = new THREE.Path();
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4 + OCT_R;
    const px = Math.sin(a) * (R_OCT + 0.3), py = Math.cos(a) * (R_OCT + 0.3);
    const qx = Math.sin(a) * 10.0, qy = Math.cos(a) * 10.0;
    if (k === 0) { roofShape.moveTo(px, py); roofHole.moveTo(qx, qy); }
    else { roofShape.lineTo(px, py); roofHole.lineTo(qx, qy); }
  }
  roofShape.closePath(); roofHole.closePath(); roofShape.holes.push(roofHole);
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 0.45, bevelEnabled: false });
  roofGeo.rotateX(-Math.PI / 2);
  const roof = add(new THREE.Mesh(roofGeo, M.lead));
  roof.position.y = WALL_H + 0.0; // slab zone 11.0–11.45, eye r=10 sealed above by drum (r 10.1)
  const ROOF_Y = WALL_H + 0.45;
  const curb = add(new THREE.Mesh(new THREE.CylinderGeometry(R_OCT + 0.3, R_OCT + 0.3, 0.55, 8, 1, true), marbleMat), false, true);
  curb.rotation.y = OCT_R; curb.position.y = ROOF_Y + 0.27;

  // ---------- 7 arch niches per face (56), 36 glazed ----------
  const NICHE_W = 1.9, NICHE_H = 7.6, NICHE_Y = 1.0;
  const frameMat = marbleMat.clone(); frameMat.side = THREE.DoubleSide;
  const niches = noCull(new THREE.InstancedMesh(archFrameGeo(NICHE_W, NICHE_H, 0.55, 0.4), frameMat, 56));
  const glassGeo = new THREE.ShapeGeometry(pointedArchPath(NICHE_W - 0.75, NICHE_H - 1.0), 8);
  const warmGlass = noCull(new THREE.InstancedMesh(glassGeo, M.glassWarm, 24));
  const blueGlass = noCull(new THREE.InstancedMesh(glassGeo, M.glassBlue, 12));
  const blindMat = new THREE.MeshStandardMaterial({ color: 0x141c2e, roughness: 0.9 });
  const blinds = noCull(new THREE.InstancedMesh(new THREE.PlaneGeometry(NICHE_W - 0.7, NICHE_H - 0.9), blindMat, 20));
  let ni = 0, wi = 0, bi = 0, di = 0;
  const placeOnFace = (inst, idx, k, s, y, dist) => {
    const { a, n, t } = faceFrame(k);
    dummy.position.copy(n.clone().multiplyScalar(dist).add(t.clone().multiplyScalar(s)));
    dummy.position.y = y; dummy.rotation.set(0, a, 0); dummy.updateMatrix();
    inst.setMatrixAt(idx, dummy.matrix);
  };
  for (let k = 0; k < 8; k++) {
    const cardinal = k % 2 === 0;
    for (let j = 0; j < 7; j++) {
      const s = (j - 3) * 2.55;
      placeOnFace(niches, ni++, k, s, NICHE_Y, APOTHEM + 0.05);
      const glazed = cardinal ? j !== 3 : (j >= 2 && j <= 4);
      if (glazed) {
        if (cardinal) placeOnFace(warmGlass, wi++, k, s, NICHE_Y + 0.5, APOTHEM - 0.12);
        else placeOnFace(blueGlass, bi++, k, s, NICHE_Y + 0.5, APOTHEM - 0.12);
      } else {
        placeOnFace(blinds, di++, k, s, NICHE_Y + NICHE_H / 2, APOTHEM - 0.18);
      }
    }
  }
  for (const m of [niches, warmGlass, blueGlass, blinds]) {
    m.instanceMatrix.needsUpdate = true; m.castShadow = false; m.receiveShadow = false; G.add(m);
  }
  niches.castShadow = true; // frames cast; glass/blinds do not

  // ---------- 4 cardinal doors + porticos ----------
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x14100b, roughness: 1 });
  for (const k of [0, 2, 4, 6]) {
    const { a, n, t } = faceFrame(k);
    const q = (v) => v.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), a);
    const at = (along, y, out) => n.clone().multiplyScalar(out).add(t.clone().multiplyScalar(along)).setY(y);
    const opening = add(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 4.6), darkMat), false, false);
    opening.position.copy(at(0, 2.3, APOTHEM + 0.02)); opening.rotation.y = a;
    for (const sx of [-0.6, 0.6]) {
      const leaf = add(new THREE.Mesh(new THREE.BoxGeometry(1.15, 4.2, 0.12), M.darkWood), false, false);
      leaf.position.copy(at(sx, 2.1, APOTHEM + 0.14)); leaf.rotation.y = a;
    }
    for (const sx of [-2.0, 2.0]) {
      const col = add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 3.4, 10), marbleMat));
      col.position.copy(at(sx, 1.7, APOTHEM + 2.4));
    }
    const beam = add(new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.5, 1.0), M.white));
    beam.position.copy(at(0, 3.65, APOTHEM + 2.4)); beam.rotation.y = a;
    const slab = add(new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.35, 3.2), M.lead));
    slab.position.copy(at(0, 4.1, APOTHEM + 2.4)); slab.rotation.y = a;
    for (let st = 0; st < 2; st++) {
      const step = add(new THREE.Mesh(new THREE.BoxGeometry(4.6 - st * 0.8, 0.3, 1.4), marbleMat), false, true);
      step.position.copy(at(0, 0.15 + st * 0.3, APOTHEM + 3.2 + st * 0.9)); step.rotation.y = a;
    }
    void q;
  }

  // ---------- drum + 16 windows ----------
  const DRUM_BASE = ROOF_Y;
  const drum = add(new THREE.Mesh(new THREE.CylinderGeometry(DRUM_R, DRUM_R, DRUM_H, 32, 1, true), tileMatDrum));
  drum.position.y = DRUM_BASE + DRUM_H / 2;
  const drumTrim = add(new THREE.Mesh(new THREE.CylinderGeometry(DRUM_R + 0.45, DRUM_R + 0.45, 0.5, 32), M.goldTrim));
  drumTrim.position.y = DRUM_BASE + DRUM_H + 0.1;
  const drumFrameGeo = archFrameGeo(1.5, 3.2, 0.4, 0.32);
  const drumFrameMat = M.white.clone(); drumFrameMat.side = THREE.DoubleSide;
  const dFrames = noCull(new THREE.InstancedMesh(drumFrameGeo, drumFrameMat, 16));
  const dGlassGeo = new THREE.ShapeGeometry(pointedArchPath(0.85, 2.5), 8);
  const dWarm = noCull(new THREE.InstancedMesh(dGlassGeo, M.glassWarm, 8));
  const dBlue = noCull(new THREE.InstancedMesh(dGlassGeo, M.glassBlue, 8));
  let dw = 0, db = 0;
  for (let i = 0; i < 16; i++) {
    const a = (i + 0.5) * Math.PI * 2 / 16;
    const n = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    dummy.position.copy(n.clone().multiplyScalar(DRUM_R + 0.05)); dummy.position.y = DRUM_BASE + 1.3;
    dummy.rotation.set(0, a, 0); dummy.updateMatrix(); dFrames.setMatrixAt(i, dummy.matrix);
    dummy.position.copy(n.clone().multiplyScalar(DRUM_R - 0.1)); dummy.position.y = DRUM_BASE + 1.65;
    dummy.updateMatrix();
    if (i % 2 === 0) dWarm.setMatrixAt(dw++, dummy.matrix); else dBlue.setMatrixAt(db++, dummy.matrix);
  }
  for (const m of [dFrames, dWarm, dBlue]) {
    m.instanceMatrix.needsUpdate = true; m.castShadow = false; m.receiveShadow = false; G.add(m);
  }

  // ---------- gold dome + 32 ribs ----------
  const DOME_BASE = DRUM_BASE + DRUM_H + 0.35;
  const dome = add(new THREE.Mesh(domeGeo(DOME_R, DOME_K, 64), goldMat));
  dome.position.y = DOME_BASE;
  const baseRing = add(new THREE.Mesh(new THREE.TorusGeometry(DOME_R + 0.1, 0.28, 10, 64), M.goldTrim), false, true);
  baseRing.rotation.x = Math.PI / 2; baseRing.position.y = DOME_BASE + 0.1;
  const ribs = noCull(new THREE.InstancedMesh(ribGeo(DOME_R, DOME_K, 0.11), M.goldTrim, 32));
  for (let i = 0; i < 32; i++) {
    dummy.position.set(0, DOME_BASE, 0); dummy.rotation.set(0, i / 32 * Math.PI * 2, 0);
    dummy.updateMatrix(); ribs.setMatrixAt(i, dummy.matrix);
  }
  ribs.instanceMatrix.needsUpdate = true; ribs.castShadow = false; ribs.receiveShadow = false; G.add(ribs);

  // ---------- finial: rod + 3 orbs + crescent ----------
  const APEX = DOME_BASE + DOME_R * DOME_K;
  const rod = add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 2.6, 10), M.goldTrim), false, false);
  rod.position.y = APEX + 1.0; // spans -0.3..+2.3 (was 4.6-long; apex verdict: stack to ~3 m)
  [[0.7, 0.48], [1.35, 0.36], [1.9, 0.26]].forEach(([dy, r]) => {
    const orb = add(new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), M.gold), false, false);
    orb.position.y = APEX + dy;
  });
  const cresMat = M.goldTrim.clone();
  const cres = add(new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.09, 10, 40, Math.PI * 1.35), cresMat), false, false);
  cres.position.y = APEX + 2.3; cres.rotation.z = THREE.MathUtils.degToRad(144); // tip ≈ +3.1
  D.tickers.push((t) => { cresMat.emissiveIntensity = 0.3 + 0.9 * (0.5 + 0.5 * Math.sin(t * 2.2)); });

  // ================= interior =================
  const INT = new THREE.Group(); INT.name = 'domeInterior'; G.add(INT);
  const iadd = (m, cast = false, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; INT.add(m); return m; };

  const floor = iadd(new THREE.Mesh(new THREE.CylinderGeometry(R_OCT - 0.5, R_OCT - 0.5, 0.18, 8), marbleMat));
  floor.rotation.y = OCT_R; floor.position.y = 0.09;
  const carpetRed = iadd(new THREE.Mesh(new THREE.RingGeometry(11, 19.5, 8), M.carpet));
  carpetRed.rotation.set(-Math.PI / 2, 0, OCT_R); carpetRed.position.y = 0.2;
  const carpetGreen = iadd(new THREE.Mesh(new THREE.RingGeometry(8.0, 10.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a6e3f, roughness: 0.95 })));
  carpetGreen.rotation.set(-Math.PI / 2, 0, OCT_R); carpetGreen.position.y = 0.21;

  // sacred rock 17 x 13 x 1.5, jittered top
  const rockGeo = new THREE.BoxGeometry(17, 1.5, 13, 14, 1, 10);
  {
    const p = rockGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) > 0) {
        const x = p.getX(i), z = p.getZ(i);
        p.setY(i, p.getY(i) + Math.abs(Math.sin(x * 1.7) * Math.cos(z * 2.3)) * 0.55 + Math.sin(x * 3.1 + z * 1.3) * 0.12);
      }
    }
    rockGeo.computeVertexNormals();
  }
  const rock = iadd(new THREE.Mesh(rockGeo,
    new THREE.MeshStandardMaterial({ color: 0x6f665c, roughness: 1, envMapIntensity: 0.08 })));
  rock.position.y = 0.9;

  // brass railing rectangle around rock
  {
    const HX = 9.6, HZ = 7.6, pts = [];
    const per = [[-HX, -HZ, HX, -HZ], [HX, -HZ, HX, HZ], [HX, HZ, -HX, HZ], [-HX, HZ, -HX, -HZ]];
    for (const [x0, z0, x1, z1] of per) {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(len / 1.6));
      for (let i = 0; i < n; i++) pts.push([x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n]);
    }
    const posts = noCull(new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), M.bronze, pts.length));
    pts.forEach(([x, z], i) => {
      dummy.position.set(x, 0.65, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
      posts.setMatrixAt(i, dummy.matrix);
    });
    posts.instanceMatrix.needsUpdate = true; posts.castShadow = false; INT.add(posts);
    for (const ry of [0.7, 1.12]) {
      for (const [x0, z0, x1, z1] of per) {
        const len = Math.hypot(x1 - x0, z1 - z0);
        const rail = iadd(new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.06), M.bronze), false, false);
        rail.position.set((x0 + x1) / 2, ry, (z0 + z1) / 2);
        rail.rotation.y = Math.atan2(-(z1 - z0), x1 - x0);
      }
    }
  }

  // two support rings: inner 4 piers + 12 cols (r 6.8), outer 8 piers + 16 cols (r 12.5)
  const colSpots = [], pierSpots = [];
  for (let m = 0; m < 16; m++) {
    const a = m * Math.PI * 2 / 16, r = 6.8;
    (m % 4 === 0 ? pierSpots : colSpots).push([Math.sin(a) * r, Math.cos(a) * r]);
  }
  for (let m = 0; m < 24; m++) {
    const a = m * Math.PI * 2 / 24, r = 12.5;
    (m % 3 === 0 ? pierSpots : colSpots).push([Math.sin(a) * r, Math.cos(a) * r]);
  }
  // dark veined shafts per refs ( Cipollino-like ); exterior M.marble untouched
  const inMarble = marbleMat.clone();
  inMarble.color.set(0x7a7468); inMarble.roughness = 0.55; inMarble.envMapIntensity = 0.25;
  const cols = noCull(new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.38, 5.2, 12), inMarble, colSpots.length));
  const caps = noCull(new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 0.35, 0.95), M.goldTrim, colSpots.length));
  colSpots.forEach(([x, z], i) => {
    dummy.rotation.set(0, 0, 0);
    dummy.position.set(x, 0.15 + 2.6, z); dummy.updateMatrix(); cols.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, 0.15 + 5.2 + 0.17, z); dummy.updateMatrix(); caps.setMatrixAt(i, dummy.matrix);
  });
  const piers = noCull(new THREE.InstancedMesh(new THREE.BoxGeometry(1.15, 5.6, 1.15), inMarble, pierSpots.length));
  pierSpots.forEach(([x, z], i) => {
    dummy.position.set(x, 0.15 + 2.8, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
    piers.setMatrixAt(i, dummy.matrix);
  });
  for (const m of [cols, caps, piers]) {
    m.instanceMatrix.needsUpdate = true; m.castShadow = true; m.receiveShadow = true; INT.add(m);
  }

  // arcade arches over both rings + radial tie-beams
  const archMat = M.interiorWall.clone(); archMat.side = THREE.DoubleSide;
  archMat.map = ablaqTex; archMat.color.set(0xd8cbb2); // ablaq courses calm the arch whiteout
  const mkArches = (count, r, chord) => {
    const im = noCull(new THREE.InstancedMesh(archFrameGeo(chord, 2.3, 0.5, 0.35), archMat, count));
    for (let m = 0; m < count; m++) {
      const a = (m + 0.5) * Math.PI * 2 / count;
      dummy.position.set(Math.sin(a) * r, 5.5, Math.cos(a) * r);
      dummy.rotation.set(0, a, 0); dummy.updateMatrix(); im.setMatrixAt(m, dummy.matrix);
    }
    im.instanceMatrix.needsUpdate = true; im.castShadow = false; INT.add(im);
  };
  mkArches(16, 6.8, 2 * 6.8 * Math.sin(Math.PI / 16));
  mkArches(24, 12.5, 2 * 12.5 * Math.sin(Math.PI / 24));
  const beams = noCull(new THREE.InstancedMesh(new THREE.BoxGeometry(6.7, 0.28, 0.32), M.darkWood, 16));
  for (let m = 0; m < 16; m++) {
    const a = m * Math.PI * 2 / 16;
    dummy.position.set(Math.sin(a) * 9.65, 5.9, Math.cos(a) * 9.65);
    dummy.rotation.set(0, a - Math.PI / 2, 0); dummy.updateMatrix(); beams.setMatrixAt(m, dummy.matrix);
  }
  beams.instanceMatrix.needsUpdate = true; beams.castShadow = false; INT.add(beams);

  // two ring chandeliers (brass torus + emissive globes + wires), one light only
  const mkChandelier = (r, y, globes, topY) => {
    const ring = iadd(new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 8, 48), M.bronze), false, false);
    ring.rotation.x = Math.PI / 2; ring.position.y = y;
    const balls = noCull(new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), M.glassWarm, globes));
    for (let i = 0; i < globes; i++) {
      const a = i / globes * Math.PI * 2;
      dummy.position.set(Math.sin(a) * r, y - 0.18, Math.cos(a) * r);
      dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); balls.setMatrixAt(i, dummy.matrix);
    }
    balls.instanceMatrix.needsUpdate = true; balls.castShadow = false; INT.add(balls);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * Math.PI * 2;
      const wire = iadd(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, topY - y, 5), M.bronze), false, false);
      wire.position.set(Math.sin(a) * r * 0.98, (y + topY) / 2, Math.cos(a) * r * 0.98);
    }
  };
  mkChandelier(3.5, 7.6, 12, 13.5);
  mkChandelier(7.5, 7.0, 20, 11.0);
  const lamp = new THREE.PointLight(0xffd9a0, 16, 45, 2);
  lamp.position.set(0, 7.6, 0); INT.add(lamp);

  // mosaic inner drum (gold/green/blue) + gilt dome soffit + ambulatory ceiling
  const mosTex = canvasTex(1024, (g, s) => {
    g.fillStyle = '#b98f1f'; g.fillRect(0, 0, s, s);
    const cols = ['#1f6e4a', '#14407c'];
    for (let i = 0; i < 8; i++) {
      const x = i * s / 8;
      g.fillStyle = cols[i % 2]; g.fillRect(x + 8, s * 0.2, s / 8 - 16, s * 0.62);
      g.strokeStyle = '#f4ecd8'; g.lineWidth = 6; g.strokeRect(x + 8, s * 0.2, s / 8 - 16, s * 0.62);
      g.fillStyle = '#e8c26a'; g.beginPath(); g.arc(x + s / 16, s * 0.5, 26, 0, Math.PI * 2); g.fill();
      // vegetal scrolls: facing volutes + dot sprigs (sidepart-2)
      g.strokeStyle = 'rgba(232,210,122,.85)'; g.lineWidth = 4;
      const cx = x + s / 16, cy = s * 0.36;
      g.beginPath(); g.arc(cx - 34, cy, 20, 0.4, Math.PI * 1.4); g.stroke();
      g.beginPath(); g.arc(cx + 34, cy, 20, Math.PI * 1.6, Math.PI * 2.6); g.stroke();
      g.fillStyle = '#e8c26a';
      for (const [dx, dy] of [[-52, 44], [52, 44], [0, 88]]) { g.beginPath(); g.arc(cx + dx, s * 0.5 + dy, 6, 0, Math.PI * 2); g.fill(); }
    }
    g.fillStyle = '#0d2a5e'; g.fillRect(0, 0, s, s * 0.1); g.fillRect(0, s * 0.9, s, s * 0.1);
    g.fillStyle = '#e8d27a'; g.font = 'bold 30px serif'; g.textAlign = 'center';
    g.fillText('✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦', s / 2, s * 0.075);
  }, [8, 1]);
  const mosMat = new THREE.MeshStandardMaterial({ map: mosTex, roughness: 0.6, side: THREE.BackSide });
  const innerDrum = iadd(new THREE.Mesh(new THREE.CylinderGeometry(9.9, 9.9, 5.6, 32, 1, true), mosMat), false, false);
  innerDrum.position.y = 8.3; // 5.5–11.1: meets arcade tops, seen through the roof eye
  // gilt soffit: gold + red ogive net + inscription ring (ref 2018-03), calm metal for close range
  const sofTex = canvasTex(512, (g, s) => {
    g.fillStyle = '#caa437'; g.fillRect(0, 0, s, s);
    g.fillStyle = 'rgba(120,70,10,.25)'; g.fillRect(0, 0, s, s * 0.06);
    g.strokeStyle = '#8e2f22'; g.lineWidth = 7;
    g.beginPath(); g.arc(s * 0.5, s * 1.02, s * 0.62, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    g.beginPath(); g.arc(s * 0.5, s * 1.02, s * 0.34, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    g.fillStyle = '#7a1f1f'; g.beginPath(); g.arc(s * 0.5, s * 0.42, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0e3a2a'; g.fillRect(0, s * 0.8, s, s * 0.2);
    g.fillStyle = '#e8d27a'; g.font = 'bold 26px serif'; g.textAlign = 'center';
    g.fillText('✦ ✦ ✦', s / 2, s * 0.94);
  }, [16, 1]);
  const giltBack = new THREE.MeshStandardMaterial({ map: sofTex, roughness: 0.5, metalness: 0.55, envMapIntensity: 0.6, side: THREE.BackSide });
  const innerDome = iadd(new THREE.Mesh(domeGeo(9.9, 1.0, 48), giltBack), false, false);
  innerDome.position.y = 11.1;
  const ceil = iadd(new THREE.Mesh(new THREE.RingGeometry(10.0, R_OCT - 0.4, 8), archMat), false, true);
  ceil.rotation.x = Math.PI / 2; ceil.position.y = 10.95;

  // ambulatory liners: marble dado + mosaic upper (refs 2018-01/03) — hide culled-wall see-through
  const dadoTex = canvasTex(512, (g, s) => {
    g.fillStyle = '#ddd2b8'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 4; i++) {
      const x = i * s / 4;
      g.strokeStyle = '#6a5f4c'; g.lineWidth = 5; g.strokeRect(x + 10, 40, s / 4 - 20, s - 120);
      // book-matched chevron veins (marble-detail.jpg)
      g.strokeStyle = 'rgba(95,100,110,.4)'; g.lineWidth = 2;
      const px = x + s / 8;
      for (const [y0, y1] of [[70, 200], [200, 330]]) {
        g.beginPath(); g.moveTo(px - 44, y0); g.lineTo(px, y1); g.lineTo(px + 44, y0); g.stroke();
      }
      g.strokeStyle = 'rgba(120,115,100,.5)'; g.lineWidth = 2;
      for (let v = 0; v < 3; v++) {
        g.beginPath(); let vx = x + 30 + v * 50, vy = 60; g.moveTo(vx, vy);
        for (let k = 0; k < 5; k++) { vx += (Math.random() - 0.5) * 40; vy += 70; g.lineTo(vx, vy); } g.stroke();
      }
    }
    g.fillStyle = '#3a332a'; g.fillRect(0, s - 60, s, 60);
  }, [16, 1]);
  const dado = iadd(new THREE.Mesh(
    new THREE.CylinderGeometry(APOTHEM - 0.35, APOTHEM - 0.35, 5.7, 8, 1, true),
    new THREE.MeshStandardMaterial({ map: dadoTex, color: 0x9c8f76, roughness: 0.7, envMapIntensity: 0.15, side: THREE.BackSide })), false, true);
  dado.rotation.y = OCT_R; dado.position.y = 3.05; // 0.2–5.9
  const linMosTex = mosTex.clone(); linMosTex.repeat.set(24, 1); linMosTex.needsUpdate = true;
  const liner = iadd(new THREE.Mesh(
    new THREE.CylinderGeometry(APOTHEM - 0.35, APOTHEM - 0.35, 5.0, 8, 1, true),
    new THREE.MeshStandardMaterial({ map: linMosTex, color: 0x8a7a5a, roughness: 0.7, envMapIntensity: 0.15, side: THREE.BackSide })), false, true);
  liner.rotation.y = OCT_R; liner.position.y = 8.4; // 5.9–10.9
  // interior door reads on the liner (dark leaf + wood surround, face inward)
  for (const k of [0, 2, 4, 6]) {
    const { a, n } = faceFrame(k);
    const leaf = iadd(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 4.6), darkMat), false, false);
    leaf.position.copy(n.clone().multiplyScalar(APOTHEM - 0.45)); leaf.position.y = 2.5;
    leaf.rotation.y = a + Math.PI;
    for (const sx of [-1.7, 1.7]) {
      const jamb = iadd(new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.8, 0.25), M.darkWood), false, false);
      const off = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)).multiplyScalar(sx);
      jamb.position.copy(n.clone().multiplyScalar(APOTHEM - 0.5).add(off)); jamb.position.y = 2.5;
      jamb.rotation.y = a;
    }
  }

  // ---------- education / teleport hooks ----------
  D.domePos = new THREE.Vector3(CX, TY + 12, CZ);
  D.domeInterior = new THREE.Vector3(CX, TY + 2.5, CZ);
  D.domeGroup = G; D.domeInteriorGroup = INT;

  return G;
}
