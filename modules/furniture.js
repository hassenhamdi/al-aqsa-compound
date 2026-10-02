// furniture.js — W5 Qibli hall furnishing + Tankiz mosque-lamp replicas.
// img2obj: refs references/museum/glass-lamp.jpg (Tankiz lamp, gilded + enamelled
//   glass 1310-1340: trumpet mouth, globular body, foot, 3 chains) +
//   references/mihrab/minbar-mihrab-03246.jpg (rod-hung lamp row before minbar) +
//   references/qibli-interior.jpg (open carpeted hall, rows face mihrab).
//   ObjectSculptSpec FIRST — see docs/w5-furniture.md.
// Minbar itself untouched (aqsaMosque.js). Zero lights: emissive-only accents,
// ticker-synced to M.glassWarm like aqsaMosque qGlass. Attaches to qibliInterior
// (INT-local coords, floor top y=0.30); world fallback folds INT +0.9 in.
import * as THREE from 'three';
import { canvasTex } from './geo.js';

export function buildFurniture(ctx){
  const { scene, M, D } = ctx;
  const F = new THREE.Group(); F.name = 'qibliFurniture';
  const host = (D && (D.qibliInteriorGroup ||
    (D.qibliInterior && D.qibliInterior.isObject3D && D.qibliInterior))) ||
    scene.getObjectByName('qibliInterior');
  if (host) host.add(F);
  else { F.position.set(0, 2.9, 150); scene.add(F); } // world fallback: G(0,2,150)+INT(0.9)

  const dummy = new THREE.Object3D();
  const FLOOR = 0.32; // carpet top, INT-local

  // ---------- local materials (shared M.* never mutated) ----------
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2f18, roughness: 0.7 });
  const bookMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0x8a6a2a, roughness: 0.4, metalness: 0.9, envMapIntensity: 1.0 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  const pageMat = new THREE.MeshStandardMaterial({ color: 0xece2c8, roughness: 0.9, side: THREE.DoubleSide });

  // Tankiz enamel: gold ground, cobalt script band, red roundels + lamp glyph.
  // Lathe v=1 at mouth = canvas top (flipY). Abstract strokes, not real text.
  const enamelTex = canvasTex(256, (g, s) => {
    g.fillStyle = '#e6d3a3'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#1e40a8'; g.fillRect(0, 0, s, 44); // mouth band
    g.strokeStyle = '#e8c26a'; g.lineWidth = 2;
    for (let r = 0; r < 3; r++){
      const y = 12 + r * 11;
      g.beginPath(); g.moveTo(6, y);
      for (let x = 6; x < s - 6; x += 10) g.lineTo(x, y + (Math.random() - 0.5) * 9);
      g.stroke();
    }
    g.fillStyle = '#c9962e'; g.fillRect(0, 44, s, 5);
    for (let i = 0; i < 4; i++){ // red roundels + white lamp glyph
      const cx = 32 + i * 64, cy = 100;
      g.fillStyle = '#a01f1f';
      g.beginPath(); g.arc(cx, cy, 27, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#e8c26a'; g.lineWidth = 2;
      g.beginPath(); g.arc(cx, cy, 27, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = '#f2e6c8'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(cx - 9, cy - 12); g.lineTo(cx + 9, cy - 12);
      g.lineTo(cx + 5, cy + 2); g.lineTo(cx - 5, cy + 2); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(cx, cy + 2); g.lineTo(cx, cy + 12);
      g.moveTo(cx - 7, cy + 12); g.lineTo(cx + 7, cy + 12); g.stroke();
    }
    g.fillStyle = '#1e40a8'; g.fillRect(0, 148, s, 42); // lower script band
    g.strokeStyle = '#e8c26a'; g.lineWidth = 2;
    for (let r = 0; r < 3; r++){
      const y = 158 + r * 11;
      g.beginPath(); g.moveTo(6, y);
      for (let x = 6; x < s - 6; x += 10) g.lineTo(x, y + (Math.random() - 0.5) * 9);
      g.stroke();
    }
    const shade = g.createLinearGradient(0, 190, 0, s); // body foot shading
    shade.addColorStop(0, 'rgba(120,80,30,0)'); shade.addColorStop(1, 'rgba(120,80,30,.45)');
    g.fillStyle = shade; g.fillRect(0, 190, s, s - 190);
    for (let i = 0; i < 250; i++){ g.fillStyle = `rgba(90,60,25,${Math.random() * 0.12})`; g.fillRect(Math.random() * s, Math.random() * s, 2, 2); }
  }, [2, 1]);
  const lampGlass = new THREE.MeshStandardMaterial({
    map: enamelTex, emissiveMap: enamelTex, emissive: 0xffbe78, emissiveIntensity: 0.5,
    roughness: 0.35, metalness: 0.05, side: THREE.DoubleSide,
  });
  const flameMat = new THREE.MeshStandardMaterial({ color: 0x201408, emissive: 0xffc37a, emissiveIntensity: 1.6 });

  // ---------- 1. mus'haf shelf cases (12, E/W walls) — one unit-box InstancedMesh ----------
  const woodXf = [];
  const woodBox = (w, h, d, x, y, z, rx = 0, ry = 0) => woodXf.push([w, h, d, x, y, z, rx, ry]);
  const bookXf = []; // [x,y,z,sy,thick,color]
  const BOOK_COLS = [0x7a1f1f, 0x1e4d3a, 0x2a3a5c, 0x4a2f18, 0x6b5a2a, 0x3a2a4a, 0x8a6f4d];
  for (const sx of [1, -1]){
    for (const z of [-25, -15, -5, 5, 15, 25]){
      const x = sx * 27.0, bx = sx * 0.14;
      woodBox(0.35, 0.10, 2.14, x, FLOOR + 0.05, z);                 // plinth
      woodBox(0.04, 1.06, 2.20, x + bx + sx * 0.155, FLOOR + 0.57, z); // back
      for (const sz of [-1, 1]) woodBox(0.35, 1.06, 0.06, x, FLOOR + 0.57, z + sz * 1.07); // sides
      woodBox(0.35, 0.05, 2.20, x, FLOOR + 1.125, z);                 // top
      for (const by of [0.42, 0.76, 1.10]){                          // 3 shelf boards
        woodBox(0.30, 0.04, 2.00, x, FLOOR + by, z);
        for (let b = 0; b < 23; b++){                                // book row
          const bz = z - 0.935 + b * 0.085;
          bookXf.push([x, FLOOR + by + 0.02 + 0.15, bz,
            0.86 + Math.random() * 0.2, 0.7 + Math.random() * 0.5,
            BOOK_COLS[(Math.random() * BOOK_COLS.length) | 0]]);
        }
      }
    }
  }

  // ---------- 2. prayer-row dividers (2 rails x 2 segs, centre aisle open) ----------
  const postXf = []; // [x,y,z,h]
  for (const z of [-30, -36]){
    for (const [x0, x1] of [[-18, -2], [2, 18]]){
      woodBox(x1 - x0, 0.07, 0.10, (x0 + x1) / 2, FLOOR + 0.83, z);
      for (let px = x0; px <= x1 + 0.01; px += 4) postXf.push([px, FLOOR, z, 0.9]);
    }
  }

  // ---------- 3. shoe racks (2, by N entry) + pairs ----------
  const shoeXf = []; // [x,y,z,color]
  const SHOE_COLS = [0x2a2018, 0x3a2a1a, 0x1a1a1a, 0x4a3a2a];
  for (const sx of [1, -1]){
    const cx = sx * 4.5, cz = -39.3;
    for (const ex of [-0.88, 0.88]) woodBox(0.04, 1.00, 0.40, cx + ex, FLOOR + 0.50, cz);
    woodBox(1.80, 0.05, 0.40, cx, FLOOR + 1.025, cz);
    woodBox(1.80, 1.00, 0.03, cx, FLOOR + 0.50, cz - 0.185);
    for (const [sy, top] of [[0.38, 0.40], [0.68, 0.70], [1.00, 1.02]]){
      woodBox(1.72, 0.04, 0.36, cx, FLOOR + sy, cz);
      for (const ox of [-0.6, -0.2, 0.2, 0.6]) for (const oz of [-0.09, 0.09])
        shoeXf.push([cx + ox, FLOOR + top + 0.045, cz + oz, SHOE_COLS[(Math.random() * 4) | 0]]);
    }
  }

  // ---------- 4. minbar-side pieces (minbar itself untouched) ----------
  woodBox(4, 0.06, 0.09, -4, FLOOR + 0.66, 37.8);   // sanctuary rails W/E of approach
  woodBox(4, 0.06, 0.09, 10.5, FLOOR + 0.66, 37.8);
  for (const px of [-6, -4, -2, 8.5, 10.5, 12.5]) postXf.push([px, FLOOR, 37.8, 0.7]);
  for (const [lx, lz] of [[-0.24, -0.17], [0.24, -0.17], [-0.24, 0.17], [0.24, 0.17]])
    woodBox(0.06, 0.62, 0.06, 9.2 + lx, FLOOR + 0.31, 34.5 + lz); // kursi lectern legs
  woodBox(0.62, 0.05, 0.45, 9.2, FLOOR + 0.65, 34.5, -0.35);       // sloped rest
  { // open mus'haf on the lectern
    const lg = new THREE.Group(); lg.position.set(9.2, FLOOR + 0.70, 34.5); lg.rotation.x = -0.35; F.add(lg);
    const cov = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.015, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x5c1a1a, roughness: 0.8 }));
    cov.position.y = 0; lg.add(cov);
    for (const s of [-1, 1]){
      const pg = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.012, 0.24), pageMat);
      pg.position.set(s * 0.082, 0.018, 0); pg.rotation.z = -s * 0.12; lg.add(pg);
    }
  }
  const cupPts = [[0.07, 0], [0.075, -0.02], [0.05, -0.06], [0.06, -0.10], [0.03, -0.13], [0.035, -0.15]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const cupGeo = new THREE.LatheGeometry(cupPts, 18);
  for (const sx of [1, -1]){ // brass lamp-stands flanking the mihrab
    const bx = sx * 3.6, bz = 38.6;
    const base = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.12, 12), brassMat);
    base.position.set(bx, FLOOR + 0.06, bz); F.add(base);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 8), brassMat);
    pole.position.set(bx, FLOOR + 1.15, bz); F.add(pole);
    const cup = new THREE.Mesh(cupGeo, lampGlass);
    cup.position.set(bx, FLOOR + 2.20, bz); F.add(cup);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), flameMat);
    fl.position.set(bx, FLOOR + 2.18, bz); F.add(fl);
  }

  // ---------- 5. Tankiz lamp replicas (7, instanced lathe bodies + chains) ----------
  // LAMP_root(hang point) → ring → 3×CHAIN → BODY(pivot rim) → FLAME@mouth.
  const lampPts = [[0.095, -0.56], [0.10, -0.55], [0.06, -0.52], [0.05, -0.49],
    [0.10, -0.45], [0.15, -0.40], [0.158, -0.345], [0.13, -0.29], [0.105, -0.24],
    [0.10, -0.21], [0.125, -0.15], [0.16, -0.09], [0.185, -0.035], [0.19, 0]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const lampGeo = new THREE.LatheGeometry(lampPts, 26);
  const lamps = []; // [x, rimY, z, anchorY]
  for (const lx of [-2.4, -1.2, 0, 1.2, 2.4]) lamps.push([lx, 4.05, 36.2, 4.60]); // mihrab rod row
  lamps.push([-13.5, 4.30, 20, 9.10], [13.5, 4.30, 20, 9.10]);                   // aisle singles
  { // suspension rod before the mihrab (cf. minbar-mihrab-03246 hanging row)
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 6.6, 8), brassMat);
    rod.rotation.z = Math.PI / 2; rod.position.set(0, 4.60, 36.2); F.add(rod);
    for (const s of [-1, 1]){
      const fin = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), brassMat);
      fin.position.set(s * 3.3, 4.60, 36.2); F.add(fin);
    }
  }
  const bodies = new THREE.InstancedMesh(lampGeo, lampGlass, lamps.length);
  const flames = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), flameMat, lamps.length);
  const rings = new THREE.InstancedMesh(new THREE.TorusGeometry(0.05, 0.012, 6, 14), brassMat, lamps.length);
  const chainXf = []; // [bx,by,bz, tx,ty,tz]
  lamps.forEach(([x, rimY, z, anchorY], i) => {
    dummy.position.set(x, rimY, z); dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1); dummy.updateMatrix(); bodies.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, rimY - 0.02, z); dummy.updateMatrix(); flames.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, rimY + 0.55, z);
    dummy.rotation.set(0, anchorY < 5 ? Math.PI / 2 : 0, 0);
    dummy.updateMatrix(); rings.setMatrixAt(i, dummy.matrix);
    for (const a of [Math.PI / 2, Math.PI / 2 + 2.094, Math.PI / 2 + 4.189])
      chainXf.push([x + Math.cos(a) * 0.16, rimY, z + Math.sin(a) * 0.16, x, rimY + 0.55, z]);
    if (anchorY - (rimY + 0.55) > 0.05) chainXf.push([x, rimY + 0.55, z, x, anchorY, z]);
  });
  bodies.frustumCulled = flames.frustumCulled = rings.frustumCulled = false;
  F.add(bodies); F.add(flames); F.add(rings);
  const chains = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 5), brassMat, chainXf.length);
  {
    const up = new THREE.Vector3(0, 1, 0), b = new THREE.Vector3(), t = new THREE.Vector3(), d = new THREE.Vector3();
    chainXf.forEach(([bx, by, bz, tx, ty, tz], i) => {
      b.set(bx, by, bz); t.set(tx, ty, tz); d.subVectors(t, b);
      const len = d.length();
      dummy.position.copy(b).addScaledVector(d, 0.5);
      dummy.quaternion.setFromUnitVectors(up, d.normalize());
      dummy.scale.set(1, len, 1); dummy.updateMatrix(); chains.setMatrixAt(i, dummy.matrix);
    });
    dummy.quaternion.identity(); dummy.scale.set(1, 1, 1);
  }
  chains.frustumCulled = false; F.add(chains);

  // ---------- instanced wood / books / posts / shoes ----------
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const woods = new THREE.InstancedMesh(unitBox, woodMat, woodXf.length);
  woodXf.forEach(([w, h, d, x, y, z, rx, ry], i) => {
    dummy.position.set(x, y, z); dummy.rotation.set(rx, ry, 0);
    dummy.scale.set(w, h, d); dummy.updateMatrix(); woods.setMatrixAt(i, dummy.matrix);
  });
  dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1);
  woods.frustumCulled = false; F.add(woods);
  const books = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.30, 0.07), bookMat, bookXf.length);
  {
    const c = new THREE.Color();
    bookXf.forEach(([x, y, z, sy, th, col], i) => {
      dummy.position.set(x, y, z); dummy.scale.set(1, sy, th);
      dummy.updateMatrix(); books.setMatrixAt(i, dummy.matrix);
      books.setColorAt(i, c.setHex(col));
    });
    dummy.scale.set(1, 1, 1);
  }
  books.instanceColor.needsUpdate = true; books.frustumCulled = false; F.add(books);
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.06, 1, 8), brassMat, postXf.length);
  postXf.forEach(([x, base, z, h], i) => {
    dummy.position.set(x, base + h / 2, z); dummy.scale.set(1, h, 1);
    dummy.updateMatrix(); posts.setMatrixAt(i, dummy.matrix);
  });
  dummy.scale.set(1, 1, 1); posts.frustumCulled = false; F.add(posts);
  const shoes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26, 0.09, 0.11), shoeMat, shoeXf.length);
  {
    const c = new THREE.Color();
    shoeXf.forEach(([x, y, z, col], i) => {
      dummy.position.set(x, y, z); dummy.updateMatrix(); shoes.setMatrixAt(i, dummy.matrix);
      shoes.setColorAt(i, c.setHex(col));
    });
  }
  shoes.instanceColor.needsUpdate = true; shoes.frustumCulled = false; F.add(shoes);

  F.traverse((o) => { if (o.isMesh || o.isInstancedMesh){ o.castShadow = false; o.receiveShadow = true; } });
  D.furniture = F;
  // emissive audit: replicas follow the shared warm-glass day/night tween, never new lights
  (D.tickers ||= []).push(() => {
    lampGlass.emissiveIntensity = M.glassWarm.emissiveIntensity;
    flameMat.emissiveIntensity = M.glassWarm.emissiveIntensity + 0.8;
  });
  return F;
}
