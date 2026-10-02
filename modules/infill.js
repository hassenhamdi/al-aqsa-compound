// infill.js — W2 missing-geometry infill (blockout→form, STRUCT grade).
// Owner: w2-infill. Group 'infill'. Zero lights. Flat shared M.* only.
//
// Audit vs refs (docs/w2-infill.md):
//   Yusuf domes ......... OWNED by minorDomes.js (2x makeYusuf) — position FAIL
//                         (true site: S edge of Dome terrace ~(-2,TY,-14); scene
//                         has them at z=105/108 on GY). Move-fix is minor-owner's;
//                         NOT duplicated here. Refs: references/yusuf/*.jpg (2).
//   Portico bays ......... OWNED by platform.js + STRUCT annex portals — PASS.
//   Library facade ....... OWNED by STRUCT annex ashrafiyya-library — PASS.
//   Ghawanima minaret .... OWNED by minarets.js, tallest (39.9) — PASS.
//   Lamps ................ OWNED (14 garden + 10 lantern posts) — PASS.
//   Dome ceiling ......... OWNED (gilt soffit + inner dome) — PASS.
//   Maghariba ramp ....... MISSING — BUILT HERE as the post-2007 wooden trestle
//                         bridge (only missing item with 2+ photo refs + 2 maps).
//
// Grounding (Maghariba): references/maghariba/mughrabi-bridge-2012.jpg (side:
// enclosed timber walkway, sheet roof, scaffold trestle, canvas gatehouse,
// dogleg near top) + mughrabi-ramp.jpg (front: steep scaffold ascent to gate
// in W wall) + maps/wilson-buraq.png (Bab al Magharibe Passage just N of the
// Maghariba mosque) + maps/plan-1890.jpg (gate P on W wall near SW corner).
// Scene anchors: gate marker (-150,100) platform.js:102; W wall face x=-153;
// outside ground = base top y=-3 (Buraq slab is buried — sibling geometry).
// Blockout proportions: 2 runs, deck w 3.2, roof posts + rail, scaffold bents
// to ground, canvas gatehouse at landing. Real rise (~10 m) compressed to the
// scene's 5 m outside-grade step; noted in doc.
import * as THREE from 'three';

const GY = 2.0;      // esplanade surface
const OUT = -3.0;    // outside ground (base-box top) west of the W wall

// dogleg plan: plaza stair foot -> bend pier -> gate landing (gate z=100)
const P0 = new THREE.Vector3(-178, -1.6, 122);
const P1 = new THREE.Vector3(-162, 0.2, 108);
const P2 = new THREE.Vector3(-152.5, 2.4, 100);

function spanGeo(a, b, w, t) {
  const len = a.distanceTo(b);
  const g = new THREE.BoxGeometry(w, t, len);
  return { g, len };
}

function placeSpan(mesh, a, b, lift) {
  const mid = a.clone().add(b).multiplyScalar(0.5); mid.y += lift;
  mesh.position.copy(mid);
  mesh.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
  mesh.rotation.x = -Math.asin((b.y - a.y) / a.distanceTo(b));
  return mesh;
}

export function buildInfill(ctx) {
  const { scene, M } = ctx;
  ctx.D = ctx.D || {};
  if (!Array.isArray(ctx.D.poi)) ctx.D.poi = [];
  const G = new THREE.Group(); G.name = 'infill';
  G.userData.placeholder = true; // W2 blockout grade — form only, TEX later
  scene.add(G);
  const add = (m, cast = true) => {
    m.castShadow = cast; m.receiveShadow = true; G.add(m); return m;
  };
  const runs = [[P0, P1], [P1, P2]];

  // deck (wood) + sheet roof (lead-dark) per run
  for (const [a, b] of runs) {
    const d = spanGeo(a, b, 3.2, 0.25);
    add(placeSpan(new THREE.Mesh(d.g, M.darkWood), a, b, -0.35), true);
    const r = spanGeo(a, b, 3.8, 0.12);
    add(placeSpan(new THREE.Mesh(r.g, M.leadDark), a, b, 2.35), true);
  }

  // roof posts + side rails (instanced, non-casting small stuff)
  const dummy = new THREE.Object3D();
  const postPts = [];
  for (const [a, b] of runs) {
    const n = Math.max(2, Math.round(a.distanceTo(b) / 5));
    for (let i = 0; i <= n; i++) {
      const p = a.clone().lerp(b, i / n);
      const side = new THREE.Vector3(b.z - a.z, 0, -(b.x - a.x)).normalize();
      for (const s of [-1.5, 1.5]) {
        postPts.push([p.x + side.x * s, p.y + 0.9, p.z + side.z * s]);
      }
    }
  }
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.09, 0.09, 2.6, 6), M.stone, postPts.length);
  postPts.forEach((p, i) => {
    dummy.position.set(p[0], p[1], p[2]); dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix(); posts.setMatrixAt(i, dummy.matrix);
  });
  posts.instanceMatrix.needsUpdate = true;
  posts.castShadow = false; posts.receiveShadow = true; posts.frustumCulled = false;
  G.add(posts);
  for (const [a, b] of runs) {
    for (const s of [-1.5, 1.5]) {
      const side = new THREE.Vector3(b.z - a.z, 0, -(b.x - a.x)).normalize();
      const a2 = a.clone(); a2.x += side.x * s; a2.z += side.z * s;
      const b2 = b.clone(); b2.x += side.x * s; b2.z += side.z * s;
      const rl = spanGeo(a2, b2, 0.12, 0.12);
      add(placeSpan(new THREE.Mesh(rl.g, M.darkWood), a2, b2, 0.75), false);
    }
  }

  // scaffold trestle bents down to outside ground every ~6 m
  const bents = [];
  for (const [a, b] of runs) {
    const n = Math.max(1, Math.round(a.distanceTo(b) / 6));
    for (let i = 0; i <= n; i++) bents.push(a.clone().lerp(b, i / n));
  }
  const legs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.08, 1, 6), M.stone, bents.length * 2);
  const caps = new THREE.InstancedMesh(new THREE.BoxGeometry(3.6, 0.18, 0.18), M.stone, bents.length);
  let li = 0, ci = 0;
  for (const p of bents) {
    const h = Math.max(0.6, p.y - 0.4 - OUT);
    for (const s of [-1.4, 1.4]) {
      dummy.position.set(p.x, OUT + h / 2, p.z + s * 0.4);
      dummy.scale.set(1, h, 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
      legs.setMatrixAt(li++, dummy.matrix);
    }
    dummy.scale.set(1, 1, 1);
    dummy.position.set(p.x, p.y - 0.5, p.z); dummy.updateMatrix();
    caps.setMatrixAt(ci++, dummy.matrix);
  }
  legs.instanceMatrix.needsUpdate = true; caps.instanceMatrix.needsUpdate = true;
  legs.castShadow = caps.castShadow = false;
  legs.receiveShadow = caps.receiveShadow = true;
  legs.frustumCulled = caps.frustumCulled = false;
  G.add(legs, caps);

  // abutment at stair foot + landing platform + canvas gatehouse at the gate
  const abut = add(new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.6, 4.5), M.stoneLight));
  abut.position.set(P0.x, OUT + 0.8, P0.z);
  const land = add(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 5.0), M.stoneLight));
  land.position.set(P2.x - 0.5, P2.y - 0.3, P2.z);
  const tent = add(new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 3.6), M.stoneLight));
  tent.position.set(P2.x - 0.5, P2.y + 1.0, P2.z);

  ctx.D.poi.push({ name: 'Mughrabi Bridge', ar: 'جسر باب المغاربة', kind: 'bridge', pos: P1.clone() });
  return G;
}
