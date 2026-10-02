// aqsaMosque.js — Al-Aqsa (Qibli) Mosque: Crusader-to-Ottoman prayer hall, N-S axis
// Footprint 83 (N-S) x 56 x 11H + 1m parapet, grey lead dome at 3/4 south, enterable hypostyle interior.
import * as THREE from 'three';
import { archFrameGeo, domeGeo, semiDomeGeo, canvasTex } from './geo.js';

export function buildAqsaMosque(ctx){
  const { scene, M, D } = ctx;
  const G = new THREE.Group(); G.name = 'aqsaMosque';
  G.position.set(0, 2, 150); // platform-top origin, long axis along z (N-S)
  scene.add(G);

  const W = 56, L = 83, H = 11, T = 0.8;
  const nz = -L / 2, sz = L / 2; // north / south local faces
  const dummy = new THREE.Object3D();
  const add = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; G.add(m); return m; };
  const noShadow = (m) => { m.castShadow = false; m.receiveShadow = false; G.add(m); return m; };

  const inWallDS = M.interiorWall.clone(); inWallDS.side = THREE.DoubleSide;
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0d0b08, roughness: 1 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a22, roughness: 0.7 });

  // ---------- Phase 4c textures (all local; shared M.* never mutated) ----------
  // Palette: qibli/facade-frontal-04 (honey limestone, course drift, stain patches),
  // qibli-dome + qibli/mosque-8682 (rib-seamed lead, white oxidation streaks, brown
  // base patina), facade-section (warm porch shade, green doors), inscription-02
  // (dark script band + dentils above arch), qibli-ne (lattice windows, rose).
  const qStoneTex = canvasTex(512, (g, s) => {
    g.fillStyle = '#d6bd94'; g.fillRect(0, 0, s, s);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++){
      const off = (y % 2) * 32, v = Math.random();
      const r = 205 + Math.random() * 28 | 0;
      g.fillStyle = `rgb(${r},${r - 26 + Math.random() * 10 | 0},${r - 66 + Math.random() * 12 | 0})`;
      g.fillRect(x * 64 + off + 1, y * 64 + 1, 62, 62);
      if (v > 0.93){ g.fillStyle = 'rgba(110,80,55,.28)'; g.fillRect(x * 64 + off + 1, y * 64 + 1, 62, 62); }
      else if (v < 0.07){ g.fillStyle = 'rgba(242,232,208,.22)'; g.fillRect(x * 64 + off + 1, y * 64 + 1, 62, 62); }
      g.fillStyle = 'rgba(90,65,40,.5)'; g.fillRect(x * 64 + off + 1, y * 64 + 61, 62, 2);
    }
    for (let i = 0; i < 700; i++){ g.fillStyle = `rgba(96,70,45,${Math.random() * 0.1})`; g.fillRect(Math.random() * s, Math.random() * s, 2, 2); }
  }, [14, 3]);
  const qStone = new THREE.MeshStandardMaterial({ map: qStoneTex, roughness: 0.88, metalness: 0.02, envMapIntensity: 0.25 });
  const porchShade = new THREE.MeshStandardMaterial({ map: qStoneTex, color: 0xd4b49a, roughness: 0.92, metalness: 0.0, envMapIntensity: 0.12 });
  const qStoneDS = qStone.clone(); qStoneDS.side = THREE.DoubleSide;

  const bandTex = canvasTex(512, (g, s) => { // abstract inscription band (not real text)
    g.fillStyle = '#d9c49c'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#8a6f4d'; g.fillRect(0, 0, s, 10); g.fillRect(0, s - 10, s, 10);
    for (let p = 0; p < 2; p++){
      const x0 = 53 + p * 256;
      g.fillStyle = '#3a3f47'; g.fillRect(x0, 130, 150, s - 260);
      g.strokeStyle = '#d9a441'; g.lineWidth = 3; g.strokeRect(x0, 130, 150, s - 260);
      g.strokeStyle = 'rgba(222,216,196,.85)'; g.lineWidth = 2;
      for (let r = 0; r < 6; r++){
        const y = 165 + r * 36;
        g.beginPath(); g.moveTo(x0 + 14, y);
        for (let x = 14; x < 134; x += 12) g.lineTo(x0 + x, y + (Math.random() - 0.5) * 16);
        g.stroke();
        for (let k = 0; k < 4; k++){ const dx = x0 + 16 + Math.random() * 118; g.beginPath(); g.moveTo(dx, y - 12); g.lineTo(dx, y + 2); g.stroke(); }
      }
    }
  }, [8, 1]);
  const bandMat = new THREE.MeshStandardMaterial({ map: bandTex, roughness: 0.85, envMapIntensity: 0.2 });

  const leadTex = canvasTex(512, (g, s) => { // smooth silver-grey lead, subtle seams (v=0 at base rim)
    const grad = g.createLinearGradient(0, 0, 0, s);
    grad.addColorStop(0, '#676c73'); grad.addColorStop(0.75, '#62676e'); grad.addColorStop(1, '#5c5a54');
    g.fillStyle = grad; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 28; i++){ // raised-seam rhythm, kept subtle
      const x = i * s / 28;
      g.fillStyle = 'rgba(24,26,30,.30)'; g.fillRect(x, 0, 2, s);
      g.fillStyle = 'rgba(205,210,216,.14)'; g.fillRect(x + 2, 0, 2, s);
    }
    for (let i = 0; i < 40; i++){ // faint oxidation streaks bleeding down
      const x = Math.random() * s, w = 2 + Math.random() * 7, y0 = Math.random() * s * 0.4;
      g.fillStyle = `rgba(212,217,222,${0.05 + Math.random() * 0.09})`;
      g.fillRect(x, y0, w, s - y0);
    }
    for (let i = 0; i < 16; i++){ // muted grey-brown base weathering (no copper)
      const x = Math.random() * s, y = s - Math.random() * 90;
      g.fillStyle = `rgba(105,90,75,${0.06 + Math.random() * 0.08})`;
      g.beginPath(); g.ellipse(x, y, 8 + Math.random() * 22, 5 + Math.random() * 10, 0, 0, Math.PI * 2); g.fill();
    }
  }, [1, 1]);
  const qLead = new THREE.MeshStandardMaterial({ map: leadTex, roughness: 0.62, metalness: 0.35, envMapIntensity: 0.6 });
  const qLeadFlat = new THREE.MeshStandardMaterial({ color: 0x555b63, roughness: 0.72, metalness: 0.35, envMapIntensity: 0.5 });

  const doorTex = canvasTex(256, (g, s) => {
    g.fillStyle = '#17352a'; g.fillRect(0, 0, s, s);
    for (let p = 0; p < 5; p++){
      g.fillStyle = `rgba(${10 + Math.random() * 14 | 0},${58 + Math.random() * 14 | 0},${44 + Math.random() * 10 | 0},.6)`;
      g.fillRect(p * s / 5 + 1, 0, s / 5 - 2, s);
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(p * s / 5, 0, 2, s);
    }
    g.fillStyle = 'rgba(0,0,0,.5)';
    for (const y of [s * 0.18, s * 0.5, s * 0.82]) g.fillRect(8, y - 3, s - 16, 6);
    g.fillStyle = 'rgba(220,230,215,.16)';
    for (let i = 0; i < 40; i++) g.fillRect(Math.random() * s, 8, 3, 5 + Math.random() * 8);
  }, [1, 1]);
  const doorMat2 = new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.8, envMapIntensity: 0.25 });

  const ceilTex = canvasTex(512, (g, s) => { // painted-wood coffers: gold trim, red/teal accents
    g.fillStyle = '#3d2716'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 160; i++){ g.fillStyle = `rgba(20,12,6,${Math.random() * 0.25})`; g.fillRect(Math.random() * s, 0, 1 + Math.random() * 2, s); }
    const n = 3, cell = s / n;
    for (let cy = 0; cy < n; cy++) for (let cx = 0; cx < n; cx++){
      const x = cx * cell, y = cy * cell;
      g.strokeStyle = 'rgba(217,164,65,.55)'; g.lineWidth = 3; g.strokeRect(x + 8, y + 8, cell - 16, cell - 16);
      g.fillStyle = '#2c1c10'; g.fillRect(x + 16, y + 16, cell - 32, cell - 32);
      g.fillStyle = 'rgba(142,31,47,.6)'; g.fillRect(x + 26, y + 26, cell - 52, cell - 52);
      g.fillStyle = 'rgba(217,164,65,.75)';
      g.beginPath();
      g.moveTo(x + cell / 2, y + 44); g.lineTo(x + cell - 44, y + cell / 2);
      g.lineTo(x + cell / 2, y + cell - 44); g.lineTo(x + 44, y + cell / 2);
      g.closePath(); g.fill();
      g.fillStyle = 'rgba(63,193,201,.55)';
      g.beginPath(); g.arc(x + cell / 2, y + cell / 2, 12, 0, Math.PI * 2); g.fill();
    }
  }, [9, 13]);
  const ceilPaint = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.85, envMapIntensity: 0.1 });

  const carpetTex2 = canvasTex(512, (g, s) => { // prayer-arch tile: #8E1F2F field, #D4AF5A motif
    g.fillStyle = '#8e1f2f'; g.fillRect(0, 0, s, s);
    g.strokeStyle = '#d4af5a'; g.lineWidth = 8; g.strokeRect(14, 14, s - 28, s - 28);
    g.strokeStyle = 'rgba(212,175,90,.6)'; g.lineWidth = 3; g.strokeRect(34, 34, s - 68, s - 68);
    g.fillStyle = '#6e1420'; g.fillRect(48, 48, s - 96, s - 96);
    // arch motif
    g.strokeStyle = '#d4af5a'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(106, 440); g.lineTo(106, 250);
    g.quadraticCurveTo(106, 130, 256, 96);
    g.quadraticCurveTo(406, 130, 406, 250); g.lineTo(406, 440); g.stroke();
    g.strokeStyle = 'rgba(212,175,90,.55)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(126, 440); g.lineTo(126, 255);
    g.quadraticCurveTo(126, 150, 256, 120);
    g.quadraticCurveTo(386, 150, 386, 255); g.lineTo(386, 440); g.stroke();
    // hanging-lamp diamond + spandrels
    g.fillStyle = '#d4af5a';
    g.beginPath(); g.moveTo(256, 210); g.lineTo(286, 260); g.lineTo(256, 310); g.lineTo(226, 260); g.closePath(); g.fill();
    g.fillStyle = 'rgba(30,77,58,.7)';
    for (const [qx, qy] of [[70, 70], [442, 70], [70, 442], [442, 442]]){
      g.beginPath(); g.arc(qx, qy, 26, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 500; i++){ g.fillStyle = `rgba(0,0,0,${Math.random() * 0.16})`; g.fillRect(Math.random() * s, Math.random() * s, 2, 1); }
  }, [14, 20]);
  const carpetMat2 = new THREE.MeshStandardMaterial({ map: carpetTex2, roughness: 0.96, metalness: 0.0, envMapIntensity: 0.08 });

  const colMarbleTex = canvasTex(256, (g, s) => { // pale cool marble shafts
    g.fillStyle = '#edeae2'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 12; i++){
      g.strokeStyle = `rgba(140,130,115,${0.15 + Math.random() * 0.2})`; g.lineWidth = 1 + Math.random() * 2;
      g.beginPath(); let x = Math.random() * s, y = 0; g.moveTo(x, y);
      for (let k = 0; k < 5; k++){ x += (Math.random() - 0.5) * 60; y += s / 5; g.lineTo(x, y); } g.stroke();
    }
  }, [2, 2]);
  const colMarble = new THREE.MeshStandardMaterial({ map: colMarbleTex, roughness: 0.38, metalness: 0.05, envMapIntensity: 0.5 });
  const colStoneTex = canvasTex(256, (g, s) => { // warm honed stone shafts
    g.fillStyle = '#c9ad83'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 24; i++){
      g.fillStyle = `rgba(${140 + Math.random() * 40 | 0},${105 + Math.random() * 30 | 0},${70 + Math.random() * 22 | 0},.35)`;
      g.fillRect(Math.random() * s, 0, 3 + Math.random() * 10, s);
    }
    for (let i = 0; i < 300; i++){ g.fillStyle = `rgba(90,65,40,${Math.random() * 0.12})`; g.fillRect(Math.random() * s, Math.random() * s, 2, 2); }
  }, [2, 2]);
  const colStone = new THREE.MeshStandardMaterial({ map: colStoneTex, roughness: 0.8, metalness: 0.0, envMapIntensity: 0.2 });

  const glassTex = canvasTex(256, (g, s) => { // lattice + amber/teal/cobalt panes
    const panes = ['#d88f2a', '#2a7f8f', '#d88f2a', '#24447a', '#c9762a', '#2a7f8f'];
    const cell = 32;
    for (let y = 0; y < s / cell; y++) for (let x = 0; x < s / cell; x++){
      g.fillStyle = panes[(x + y * 3) % panes.length];
      g.fillRect(x * cell, y * cell, cell, cell);
      g.fillStyle = `rgba(255,240,210,${Math.random() * 0.18})`;
      g.fillRect(x * cell + 4, y * cell + 4, cell - 8, cell - 8);
    }
    g.strokeStyle = '#16382b'; g.lineWidth = 7;
    for (let i = 0; i <= s / cell; i++){
      g.beginPath(); g.moveTo(i * cell, 0); g.lineTo(i * cell, s); g.stroke();
      g.beginPath(); g.moveTo(0, i * cell); g.lineTo(s, i * cell); g.stroke();
    }
  }, [1, 1]);
  const qGlass = new THREE.MeshStandardMaterial({
    map: glassTex, emissiveMap: glassTex, emissive: 0xffca7a, emissiveIntensity: 1.7,
    color: 0x2a2018, roughness: 0.3, metalness: 0.1,
  });

  // ---------- exterior massing ----------
  // side + south walls (thin boxes so inner faces render for walk-in)
  for (const s of [-1, 1]){
    const w = add(new THREE.Mesh(new THREE.BoxGeometry(T, H, L), qStone));
    w.position.set(s * (W / 2 - T / 2), H / 2, 0);
  }
  // north wall: solid except a real 3m x 5m entry at centre (walkable)
  const doorW = 3, doorH = 5, cx0 = doorW / 2;
  for (const s of [-1, 1]){
    const segW = W / 2 - cx0;
    const w = add(new THREE.Mesh(new THREE.BoxGeometry(segW, H, T), qStone));
    w.position.set(s * (cx0 + segW / 2), H / 2, nz + T / 2);
  }
  const header = add(new THREE.Mesh(new THREE.BoxGeometry(doorW, H - doorH, T), qStone));
  header.position.set(0, doorH + (H - doorH) / 2, nz + T / 2);
  const sw = add(new THREE.Mesh(new THREE.BoxGeometry(W, H, T), qStone));
  sw.position.set(0, H / 2, sz - T / 2);
  // dark entry passage lining
  const passage = add(new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, T + 1.6), darkMat), false, false);
  passage.position.set(0, doorH / 2, nz + T / 2);
  // open door leaves (entry is the 7th, open one)
  for (const s of [-1, 1]){
    const leaf = add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.4, 1.4), woodMat), false, false);
    leaf.position.set(s * (doorW / 2 - 0.1), 2.2, nz - 0.9);
    leaf.rotation.y = s * 0.85;
  }

  // roof slab + parapet + crenellations
  const roof = add(new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.6, L + 0.6), qLeadFlat));
  roof.position.y = H + 0.3;
  const parY = H + 0.6 + 0.5;
  const parNS = new THREE.BoxGeometry(W + 0.6, 1, 0.5);
  const parEW = new THREE.BoxGeometry(0.5, 1, L + 0.6);
  for (const [g, x, z] of [[parNS, 0, nz], [parNS, 0, sz], [parEW, -W / 2, 0], [parEW, W / 2, 0]]){
    const p = add(new THREE.Mesh(g, qStone)); p.position.set(x, parY, z);
  }
  { // crenels: instanced small boxes along parapet top
    const cg = new THREE.BoxGeometry(0.62, 0.55, 0.34);
    const spots = [];
    for (let x = -W / 2; x <= W / 2; x += 1.45){ spots.push([x, nz, 0]); spots.push([x, sz, 0]); }
    for (let z = -L / 2; z <= L / 2; z += 1.45){ spots.push([-W / 2, z, 1]); spots.push([W / 2, z, 1]); }
    const inst = new THREE.InstancedMesh(cg, qStone, spots.length);
    spots.forEach(([a, b, rot], i) => {
      dummy.position.set(rot ? a : a, parY + 0.75, rot ? b : b);
      dummy.rotation.set(0, rot ? Math.PI / 2 : 0, 0); dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.castShadow = false; inst.receiveShadow = false; G.add(inst);
  }

  // ---------- north porch: 7-bay arcade, centre bay taller ----------
  const bayX = (i) => (i - 3) * 7;
  const pz = nz - 4.5; // porch front plane
  const pierG = new THREE.BoxGeometry(1.2, 8, 1);
  for (let i = 0; i < 8; i++){
    const p = add(new THREE.Mesh(pierG, porchShade));
    p.position.set(-24.5 + i * 7, 4, pz);
  }
  const band = add(new THREE.Mesh(new THREE.BoxGeometry(51, 1.4, 1.2), bandMat));
  band.position.set(0, 8.7, pz);
  const proof = add(new THREE.Mesh(new THREE.BoxGeometry(52, 0.7, 5.6), qLeadFlat));
  proof.position.set(0, 9.7, nz - 2.2);
  for (const s of [-1, 1]){ // porch side walls
    const wside = add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 8, 5.2), porchShade));
    wside.position.set(s * 25.2, 4, nz - 2.3);
  }
  { // 7 pointed-arch frames across porch front (centre taller), DoubleSide
    const side = archFrameGeo(5.8, 7, 0.9, 0.45);
    const centre = archFrameGeo(6.4, 8, 0.9, 0.5);
    const mk = (geo, x, h) => {
      const m = new THREE.Mesh(geo, qStoneDS);
      m.position.set(x, 0, pz); m.castShadow = true; m.receiveShadow = true; G.add(m);
      return m;
    };
    for (let i = 0; i < 7; i++) mk(i === 3 ? centre : side, bayX(i));
  }
  { // 7 doors on main north wall behind porch (6 dark planes + centre open passage)
    const dg = new THREE.PlaneGeometry(2.4, 4.6);
    for (let i = 0; i < 7; i++){
      if (i === 3) continue;
      const d = new THREE.Mesh(dg, doorMat2);
      d.position.set(bayX(i), 2.35, nz - 0.05);
      d.rotation.y = Math.PI; d.castShadow = false; G.add(d);
    }
  }

  // ---------- central gable nave (w~12, +3m) running N-S ----------
  const nave = add(new THREE.Mesh(new THREE.BoxGeometry(12, 3, 70), qStone));
  nave.position.set(0, H + 0.6 + 1.5, 0);
  {
    const tri = new THREE.Shape();
    tri.moveTo(-6.3, 0); tri.lineTo(6.3, 0); tri.lineTo(0, 2.4); tri.closePath();
    const pg = new THREE.ExtrudeGeometry(tri, { depth: 70, bevelEnabled: false });
    pg.translate(0, 0, -35);
    const prism = add(new THREE.Mesh(pg, qLeadFlat));
    prism.rotation.y = 0; prism.position.set(0, H + 0.6 + 3, 0);
  }

  // ---------- dome: drum + 16 windows + lead dome + finial, 3/4 south ----------
  const dz = 20, drumR = 7, drumH = 3.2, drumY = H + 0.6 + drumH / 2;
  const drum = add(new THREE.Mesh(new THREE.CylinderGeometry(drumR, drumR, drumH, 32), qStone));
  drum.position.set(0, drumY, dz);
  const domeBaseY = H + 0.6 + drumH;
  const dome = add(new THREE.Mesh(domeGeo(6.5, 0.88, 48), qLead));
  dome.position.set(0, domeBaseY, dz);
  const eave = add(new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 0.35, 48), qLeadFlat));
  eave.position.set(0, domeBaseY - 0.1, dz); // flat overhanging band seals drum top + dome base (no slot)
  { // re-seated ribs: R*1.012 + scale.y=riseK so the arc hugs the squashed shell uniformly
    const ribMat = M.leadDark;
    for (let i = 0; i < 8; i++){
      const rib = new THREE.Mesh(new THREE.TorusGeometry(6.5 * 1.012, 0.05, 5, 40, Math.PI / 2), ribMat);
      rib.position.set(0, domeBaseY, dz);
      rib.rotation.y = (i / 8) * Math.PI;
      rib.scale.y = 0.88;
      rib.castShadow = false; rib.receiveShadow = false; G.add(rib);
    }
  }
  { // modest spike per qibli-dome.jpg: collar + short taper + two orbs + small crescent (~1.7m)
    const fin = new THREE.Group();
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.25, 12), M.bronze);
    collar.position.y = 0.12; fin.add(collar);
    const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.3, 8), M.bronze);
    spike.position.y = 0.85; fin.add(spike);
    const orb1 = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), M.bronze);
    orb1.position.y = 0.62; fin.add(orb1);
    const orb2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), M.bronze);
    orb2.position.y = 1.05; fin.add(orb2);
    const cres = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 6, 18, Math.PI * 1.5), M.bronze);
    cres.position.y = 1.5; fin.add(cres);
    fin.position.set(0, domeBaseY + 6.5 * 0.88 - 0.05, dz);
    fin.traverse((o) => { o.castShadow = false; }); G.add(fin);
  }
  { // 16 drum windows, emissive
    const wg = new THREE.PlaneGeometry(1.1, 1.7);
    const inst = new THREE.InstancedMesh(wg, qGlass, 16);
    for (let i = 0; i < 16; i++){
      const a = (i / 16) * Math.PI * 2;
      dummy.position.set(Math.cos(a) * (drumR + 0.06), drumY, dz + Math.sin(a) * (drumR + 0.06));
      dummy.rotation.set(0, -a + Math.PI / 2, 0); dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.castShadow = false; inst.receiveShadow = false; G.add(inst);
  }

  // ---------- 121 emissive side windows, 2 tiers + south oculus ----------
  {
    const lowG = new THREE.PlaneGeometry(1.3, 2.2);
    const upG = new THREE.PlaneGeometry(1.1, 1.8);
    const low = new THREE.InstancedMesh(lowG, qGlass, 40);
    const up = new THREE.InstancedMesh(upG, qGlass, 80);
    let li = 0, ui = 0;
    for (const s of [-1, 1]){
      for (let i = 0; i < 20; i++){ // lower tier
        const z = -38 + i * 4;
        dummy.position.set(s * (W / 2 + 0.06), 4, z);
        dummy.rotation.set(0, s * Math.PI / 2, 0); dummy.updateMatrix();
        low.setMatrixAt(li++, dummy.matrix);
      }
      for (let i = 0; i < 40; i++){ // upper tier
        const z = -39 + i * 2;
        dummy.position.set(s * (W / 2 + 0.06), 8.2, z);
        dummy.rotation.set(0, s * Math.PI / 2, 0); dummy.updateMatrix();
        up.setMatrixAt(ui++, dummy.matrix);
      }
    }
    low.castShadow = up.castShadow = false;
    low.receiveShadow = up.receiveShadow = false;
    G.add(low); G.add(up);
    const oc = new THREE.Mesh(new THREE.CircleGeometry(1.4, 20), qGlass); // 121st: south oculus
    oc.position.set(0, 8.4, sz + 0.06); oc.castShadow = false; G.add(oc);
  }

  // ================= interior (enterable) =================
  // P3a: INT rides +0.9 — the Haram terrace slab (platform.js qterr, top y=3.2
  // world) buried the hall floor (was 2.3 world); that marble slab, not any lamp,
  // was the "white void". Floor top now meets the terrace; ceiling-side pieces
  // drop 0.9 locally so they stay clear of the roof slab (underside 13.0 world).
  const INT = new THREE.Group(); INT.name = 'qibliInterior'; INT.position.y = 0.9; G.add(INT);
  const iadd = (m, cast = false, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; INT.add(m); return m; };

  // P3a: local floor/carpet materials (shared M.marble/M.carpet stay exterior-grade).
  // Floor albedo cut ~0.8→0.35 + de-glossed so the chandelier point light can't white-out the hall.
  const floorMat = new THREE.MeshStandardMaterial({
    map: M.marble.map, color: 0x9a917d, roughness: 0.78, metalness: 0.0, envMapIntensity: 0.12,
  });
  const floor = iadd(new THREE.Mesh(new THREE.BoxGeometry(W - 1.4, 0.3, L - 1.4), floorMat));
  floor.position.y = 0.15;
  // Carpet: local arch-motif canvas (field #8E1F2F, motif #D4AF5A), tile = one prayer arch.
  const carpet = iadd(new THREE.Mesh(new THREE.PlaneGeometry(50, 76), carpetMat2));
  carpet.rotation.x = -Math.PI / 2; carpet.position.y = 0.32;

  // 45 columns: 6 colonnades / 7 aisles (8+7+8+7+8+7), 33 marble + 12 stone
  const colXs = [-22.5, -13.5, -4.5, 4.5, 13.5, 22.5];
  const marbleXf = [], stoneXf = [];
  colXs.forEach((x, ci) => {
    const n = ci % 2 === 0 ? 8 : 7;
    for (let i = 0; i < n; i++){
      const z = n === 8 ? -35 + i * 10 : -33 + i * 11;
      const idx = marbleXf.length + stoneXf.length;
      (idx < 33 ? marbleXf : stoneXf).push([x, z]);
    }
  });
  const colG = new THREE.CylinderGeometry(0.55, 0.65, 8, 12);
  const mkCols = (list, mat) => {
    const inst = new THREE.InstancedMesh(colG, mat, list.length);
    list.forEach(([x, z], i) => {
      dummy.position.set(x, 4.3, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.castShadow = false; inst.receiveShadow = true; INT.add(inst);
  };
  mkCols(marbleXf, colMarble); mkCols(stoneXf, colStone);
  { // capitals
    const capG = new THREE.BoxGeometry(1.5, 0.5, 1.5);
    const caps = new THREE.InstancedMesh(capG, M.white, 45);
    [...marbleXf, ...stoneXf].forEach(([x, z], i) => {
      dummy.position.set(x, 8.55, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
      caps.setMatrixAt(i, dummy.matrix);
    });
    caps.castShadow = false; INT.add(caps);
  }
  { // longitudinal arcade frames above each colonnade
    const bays = [];
    colXs.forEach((x, ci) => {
      const n = ci % 2 === 0 ? 8 : 7;
      const zs = [];
      for (let i = 0; i < n; i++) zs.push(n === 8 ? -35 + i * 10 : -33 + i * 11);
      for (let i = 0; i < zs.length - 1; i++) bays.push([x, (zs[i] + zs[i + 1]) / 2, zs[i + 1] - zs[i]]);
    });
    const fg = archFrameGeo(8.6, 1.9, 0.5, 0.4);
    const inst = new THREE.InstancedMesh(fg, inWallDS, bays.length);
    bays.forEach(([x, z], i) => {
      dummy.position.set(x, 7.9, z); dummy.rotation.set(0, Math.PI / 2, 0); dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.castShadow = false; INT.add(inst);
    // architrave beams over colonnades
    for (const x of colXs){
      const b = iadd(new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 76), M.interiorWall));
      b.position.set(x, 9.1, 0);
    }
  }

  // qibla (south) liner + mihrab niche + minbar
  const qwall = iadd(new THREE.Mesh(new THREE.BoxGeometry(54, 9.7, 0.6), M.interiorWall));
  qwall.position.set(0, 4.85, sz - 1.1);
  const mihZ = sz - 1.5;
  const mihFrame = iadd(new THREE.Mesh(new THREE.PlaneGeometry(4.4, 5.4), M.tile));
  mihFrame.position.set(0, 2.9, mihZ); mihFrame.rotation.y = Math.PI;
  const mihDark = iadd(new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.4), darkMat), false, false);
  mihDark.position.set(0, 2, mihZ - 0.06); mihDark.rotation.y = Math.PI;
  const goldConch = M.goldTrim.clone(); goldConch.side = THREE.DoubleSide;
  const mihCap = iadd(new THREE.Mesh(semiDomeGeo(1.5), goldConch), false, false);
  mihCap.position.set(0, 3.7, mihZ - 0.1); // apex south into qibla wall, cup opens north — no Y-rotation
  { // P3a mihrab legibility: gold jambs + lintel around the niche so the dark
    // opening reads against the mosaic frame even under low interior light.
    const jambG = new THREE.BoxGeometry(0.35, 5.4, 0.25);
    for (const s of [-1, 1]){
      const j = iadd(new THREE.Mesh(jambG, M.goldTrim), false, false);
      j.position.set(s * 2.35, 2.9, mihZ - 0.05);
    }
    const lin = iadd(new THREE.Mesh(new THREE.BoxGeometry(5.05, 0.35, 0.25), M.goldTrim), false, false);
    lin.position.set(0, 5.75, mihZ - 0.05);
    // hanging lamp before the mihrab (emissive only — zero new lights)
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 6), M.bronze);
    rod.position.set(0, 7.9, mihZ - 2.2); rod.castShadow = false; INT.add(rod);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), M.glassWarm);
    lamp.position.set(0, 5.7, mihZ - 2.2); lamp.castShadow = false; INT.add(lamp);
  }
  { // minbar: stepped 6m, right of mihrab
    const mb = new THREE.Group(); mb.position.set(5, 0.3, sz - 4); INT.add(mb);
    for (let i = 0; i < 6; i++){
      const st = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.9), woodMat);
      st.position.set(0, 0.25 + i * 0.5, -i * 0.85); mb.add(st);
    }
    const plat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.8), woodMat);
    plat.position.set(0, 3.2, -5.4); mb.add(plat);
    for (const s of [-1, 1]){
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.4, 8), woodMat);
      post.position.set(s * 1, 4.4, -5.9); mb.add(post);
    }
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.2, 4), woodMat);
    canopy.position.set(0, 6, -5.9); canopy.rotation.y = Math.PI / 4; mb.add(canopy);
    mb.traverse((o) => { o.castShadow = false; o.receiveShadow = true; });
  }

  // ceiling: painted-wood coffer canvas + cross beams + clerestory glow strips
  const ceil = iadd(new THREE.Mesh(new THREE.PlaneGeometry(54, 81), ceilPaint), false, false);
  ceil.rotation.x = Math.PI / 2; ceil.position.y = 9.7;
  for (let i = 0; i < 10; i++){
    const b = iadd(new THREE.Mesh(new THREE.BoxGeometry(54, 0.5, 1), woodMat));
    b.position.set(0, 9.3, -36 + i * 8);
  }
  for (const s of [-1, 1]){
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(70, 1.6), M.glassWarm);
    glow.position.set(s * (W / 2 - 0.9), 8.6, 0);
    glow.rotation.y = -s * Math.PI / 2; glow.castShadow = false; INT.add(glow);
  }

  // 3 brass chandelier rings + bulbs; exactly ONE PointLight
  {
    const ringG = new THREE.TorusGeometry(1.6, 0.12, 8, 28);
    const bulbG = new THREE.SphereGeometry(0.13, 8, 8);
    const bulbs = new THREE.InstancedMesh(bulbG, M.glassWarm, 30);
    let bi = 0;
    [-15, 0, 15].forEach((z) => {
      const ring = new THREE.Mesh(ringG, M.bronze);
      ring.rotation.x = Math.PI / 2; ring.position.set(0, 7, z);
      ring.castShadow = false; INT.add(ring);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), M.bronze);
      rod.position.set(0, 8.3, z); rod.castShadow = false; INT.add(rod);
      for (let i = 0; i < 10; i++){
        const a = (i / 10) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * 1.6, 6.85, z + Math.sin(a) * 1.6);
        dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
        bulbs.setMatrixAt(bi++, dummy.matrix);
      }
    });
    bulbs.castShadow = false; INT.add(bulbs);
    // P3a: 220→36 (the old value stacked with system lampQ at the same spot and
    // blew the hall white); decay 2 = physical falloff, reach 55m covers the nave.
    const pl = new THREE.PointLight(0xffd9a0, 36, 55, 2);
    pl.position.set(0, 7.5, 0); INT.add(pl); INT.userData.pl = pl;
  }

  // ---------- discovery refs ----------
  D.qibliPos = new THREE.Vector3(0, 2, 150);
  D.qibliInterior = INT;
  D.mihrabPos = new THREE.Vector3(0, 2 + 2, 150 + mihZ);
  // emissive audit: local stained qGlass (137 windows + oculus) follows the
  // shared warm-glass tween instead of its baked 1.7 (glowed at noon)
  (ctx.D.tickers ||= []).push(() => { qGlass.emissiveIntensity = M.glassWarm.emissiveIntensity; });
  return G;
}
