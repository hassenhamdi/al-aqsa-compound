// studio.js — studio-lite part registry (adapted from
// ~/Projects/mosque-threejs/modules/studio.js: register/show/solo/all/frame/
// get/bounds/dump pattern + window.__studio + floating panel; no import).
// Registration is by post-merge scene traversal (group names); ZERO edits to
// sibling builders. Interiors toggle separately from exteriors.
import * as THREE from 'three';

export function buildStudio(ctx) {
  const { scene, camera, controls } = ctx;
  const D = ctx.D || (ctx.D = {});
  const parts = {};
  D.parts = parts;

  const byName = (n) => scene.getObjectByName(n);
  const register = (label, objs) => {
    const arr = Array.isArray(objs) ? objs : [objs];
    parts[label] = { objects: arr.filter(Boolean), visible: true };
  };
  register('platform', byName('platform') ? [byName('platform')] : []);
  register('dome-ext', (() => {
    const g = byName('domeOfRock'); if (!g) return [];
    return g.children.filter((c) => (c.isMesh || c.isInstancedMesh) && c.name !== 'domeInterior');
  })());
  register('dome-int', byName('domeInterior') ? [byName('domeInterior')] : []);
  register('qibli-ext', (() => {
    const g = byName('aqsaMosque'); if (!g) return [];
    return g.children.filter((c) => (c.isMesh || c.isInstancedMesh) && c.name !== 'qibliInterior');
  })());
  register('qibli-int', byName('qibliInterior') ? [byName('qibliInterior')] : []);
  register('chain', byName('dome-of-chain') ? [byName('dome-of-chain')] : []);
  register('minor', (() => {
    const g = byName('minor-domes'); if (!g) return [];
    return g.children.filter((c) => c.isMesh || c.isInstancedMesh);
  })());
  register('minarets', byName('minarets') ? [byName('minarets')] : []);
  register('vegetation', byName('vegetation') ? [byName('vegetation')] : []);

  function countTris(o) {
    let t = 0;
    o.traverse((c) => {
      if (c.isMesh || c.isInstancedMesh) {
        const g = c.geometry; if (!g) return;
        const n = (g.index ? g.index.count : g.attributes.position.count) / 3;
        t += Math.round(n * (c.isInstancedMesh ? c.count : 1));
      }
    });
    return t;
  }

  const api = {
    list() {
      return Object.keys(parts).sort().map((label) => {
        const p = parts[label];
        return { label, n: p.objects.length, visible: p.visible,
          tris: p.objects.reduce((a, o) => a + countTris(o), 0) };
      });
    },
    show(label, on = true) {
      const p = parts[label]; if (!p) return false;
      p.visible = on;
      p.objects.forEach((o) => { o.visible = on; });
      refreshPanel(); return true;
    },
    solo(label) {
      if (!parts[label]) return false;
      Object.entries(parts).forEach(([l, p]) => {
        const on = l === label;
        p.visible = on;
        p.objects.forEach((o) => { o.visible = on; });
      });
      // keep ancestors of shown objects visible (labels nest inside top groups)
      parts[label].objects.forEach((o) => {
        let n = o.parent;
        while (n && n !== scene) { n.visible = true; n = n.parent; }
      });
      refreshPanel(); return true;
    },
    all() {
      Object.values(parts).forEach((p) => {
        p.visible = true; p.objects.forEach((o) => { o.visible = true; });
      });
      // ancestors may have been left visible=true already; ensure top groups on
      for (const g of ['platform', 'domeOfRock', 'aqsaMosque', 'minor-domes', 'minarets', 'vegetation']) {
        const o = byName(g); if (o) o.visible = true;
      }
      refreshPanel(); return true;
    },
    focus(label, dir = [1, 0.55, 1]) { return api.frame(label, { dir }); },
    // bounding-sphere fit on both fovs; zoom>1 dollies in. Returns framing used.
    frame(labels, opts = {}) {
      const ls = Array.isArray(labels) ? labels : [labels];
      const box3 = new THREE.Box3(); let any = false;
      ls.forEach((l) => {
        const p = parts[l]; if (!p) return;
        p.objects.forEach((o) => { if (o.visible) { box3.expandByObject(o); any = true; } });
      });
      if (!any || box3.isEmpty()) return null;
      const c = box3.getCenter(new THREE.Vector3());
      const sphere = box3.getBoundingSphere(new THREE.Sphere());
      const vFov = THREE.MathUtils.degToRad(camera.fov) / 2;
      const hFov = Math.atan(Math.tan(vFov) * camera.aspect);
      const margin = opts.margin || 1.25, zoom = opts.zoom || 1;
      const dist = Math.max(sphere.radius / Math.sin(vFov), sphere.radius / Math.sin(hFov)) * margin / zoom;
      const dir = (opts.dir ? new THREE.Vector3(...opts.dir) : new THREE.Vector3(1, 0.55, 1)).normalize();
      camera.position.copy(c).addScaledVector(dir, dist);
      if (ctx.flyTo) ctx.flyTo.cancel();
      controls.target.copy(c); controls.update();
      return { center: c.toArray().map((v) => +v.toFixed(2)), distance: +dist.toFixed(2),
        radius: +sphere.radius.toFixed(2), labels: ls };
    },
    view(label, name = 'iso') {
      const dirs = { iso: [1, 0.55, 1], front: [0, 0.25, 1], side: [1, 0.25, 0], back: [0, 0.25, -1], top: [0.01, 1, 0.01] };
      return api.frame(label, { dir: dirs[name] || dirs.iso });
    },
    get(label) {
      const p = parts[label]; if (!p || p.objects.length !== 1) return null;
      const o = p.objects[0];
      return { p: o.position.toArray().map((v) => +v.toFixed(2)),
        s: o.scale.toArray().map((v) => +v.toFixed(3)),
        r: [+o.rotation.x.toFixed(3), +o.rotation.y.toFixed(3), +o.rotation.z.toFixed(3)] };
    },
    bounds(label) {
      const p = parts[label]; if (!p) return null;
      const box3 = new THREE.Box3();
      p.objects.forEach((o) => { if (o.visible) box3.expandByObject(o); });
      if (box3.isEmpty()) return null;
      const s = box3.getSize(new THREE.Vector3());
      const c = box3.getCenter(new THREE.Vector3());
      return { min: box3.min.toArray().map((v) => +v.toFixed(2)),
        max: box3.max.toArray().map((v) => +v.toFixed(2)),
        size: s.toArray().map((v) => +v.toFixed(2)),
        center: c.toArray().map((v) => +v.toFixed(2)) };
    },
    dump() {
      const out = {};
      Object.entries(parts).forEach(([label, p]) => {
        if (p.objects.length === 1) {
          const g = api.get(label);
          out[label] = g ? { ...g, v: p.visible } : { v: p.visible };
        } else out[label] = { n: p.objects.length, v: p.visible };
      });
      return out;
    },
  };
  D.studio = api;
  window.__studio = api;

  // ---- floating panel (hidden under ?nohud=1 via #studio-panel rule) ----
  let panel = null;
  function refreshPanel() { if (panel) renderRows(); }
  function renderRows() {
    const host = panel.querySelector('#studioRows'); host.innerHTML = '';
    api.list().forEach(({ label, n, visible, tris }) => {
      const row = document.createElement('div'); row.className = 'st-row';
      const eye = document.createElement('button');
      eye.textContent = visible ? '◉' : '○'; eye.title = 'toggle ' + label;
      eye.onclick = () => api.show(label, !parts[label].visible);
      const nm = document.createElement('span');
      nm.textContent = `${label} ×${n} · ${(tris / 1000).toFixed(0)}k`;
      nm.title = 'click = frame';
      nm.onclick = () => api.frame(label);
      const so = document.createElement('button'); so.textContent = 'solo';
      so.onclick = () => api.solo(label);
      const vw = document.createElement('button'); vw.textContent = 'view';
      vw.onclick = () => api.frame(label);
      row.append(eye, nm, so, vw); host.append(row);
    });
  }
  function buildPanel() {
    panel = document.createElement('aside'); panel.id = 'studio-panel';
    panel.style.display = 'none';
    panel.innerHTML = `<h2>Studio · parts <span id="studioCount"></span></h2>
      <div class="st-btns"><button id="stAll">All</button></div>
      <div id="studioRows"></div>`;
    const css = document.createElement('style');
    css.textContent = '#studio-panel{position:fixed;left:12px;top:76px;z-index:40;max-height:70vh;overflow:auto;background:rgba(10,12,18,.88);border:1px solid #4a3f28;border-radius:10px;color:#e8e2d2;font:12px/1.5 system-ui;padding:10px 12px;min-width:230px}#studio-panel h2{margin:0 0 6px;font-size:13px}#studio-panel .st-row{display:flex;gap:6px;align-items:center;margin:3px 0}#studio-panel button{cursor:pointer;background:#2a2417;color:#e8e2d2;border:1px solid #6a5c38;border-radius:6px;padding:2px 8px}#studio-panel span{flex:1;cursor:pointer}';
    document.head.append(css);
    document.body.append(panel);
    panel.querySelector('#stAll').onclick = () => api.all();
    renderRows();
  }
  api.toggle = () => {
    if (!panel) buildPanel();
    panel.style.display = panel.style.display === 'none' ? '' : 'none';
    if (panel.style.display !== 'none') {
      renderRows();
      panel.querySelector('#studioCount').textContent = `(${Object.keys(parts).length})`;
    }
  };
  api._refresh = refreshPanel;
  return api;
}
