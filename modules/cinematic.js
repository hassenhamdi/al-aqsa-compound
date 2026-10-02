// cinematic.js — 6-shot intro flyover with letterbox captions. Skip: canvas click / Esc / C.
// Exports { play, stop, tick }. Tick signature: tick(dt).
import * as THREE from 'three';

function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

export function buildCinematic(ctx) {
  const { camera, controls, renderer } = ctx;
  const cine = document.getElementById('cine');
  const cineTxt = document.getElementById('cineTxt');

  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const qi = () => (ctx.D.qibliInterior || V(0, 3.3, 150)).clone();

  // Shots resolved at play-time so interior anchors always match ctx.D
  const shots = [
    { small: 'AL-AQSA • CINEMATIC', cap: 'Haram al-Sharif — the Noble Sanctuary', dur: 7, pos: () => V(230, 150, 270), tgt: () => V(0, 0, 20) },
    { small: 'DOME OF THE ROCK', cap: 'Gold over the old city — orbital approach', dur: 7, pos: () => V(70, 26, -8), tgt: () => V(0, 14, -70) },
    { small: 'CENTRAL TERRACE', cap: 'Marble court, colonettes & fountains', dur: 6, pos: () => V(24, 9, -24), tgt: () => V(0, 9, -70) },
    { small: 'AL-QIBLI MOSQUE', cap: 'Southern façade beneath lead domes', dur: 7, pos: () => V(10, 9, 228), tgt: () => V(0, 14, 150) },
    { small: 'QIBLI HALL', cap: 'Mihrab, minbar & hanging chandeliers', dur: 7, pos: () => qi().add(V(-4, 1.2, -14)), tgt: () => qi().add(V(6, 1.5, 18)) },
    { small: 'SUNSET', cap: 'Pull back over the ramparts', dur: 8, pos: () => V(-190, 70, 270), tgt: () => V(0, 10, 0) },
  ];

  const st = {
    playing: false, idx: 0, t: 0,
    p0: new THREE.Vector3(), t0: new THREE.Vector3(),
    p1: new THREE.Vector3(), t1: new THREE.Vector3(),
    born: 0,
  };

  function showShot(i) {
    const s = shots[i];
    st.p0.copy(camera.position);
    st.t0.copy(controls.target);
    st.p1.copy(s.pos());
    st.t1.copy(s.tgt());
    st.t = 0;
    if (cineTxt) cineTxt.textContent = s.cap;
    const small = cine ? cine.querySelector('small') : null;
    if (small) small.textContent = s.small;
  }

  function play() {
    if (st.playing) { stop(); return; }
    if (ctx.D.lighting) ctx.D.lighting.setPreset('sunset');
    if (ctx.D.tour && ctx.D.tour.active) ctx.D.tour.stop();
    st.playing = true;
    st.idx = 0;
    st.born = performance.now();
    if (cine) cine.classList.add('on');
    controls.enabled = false;
    if (ctx.flyTo) ctx.flyTo.cancel();
    showShot(0);
  }

  function stop() {
    if (!st.playing) return;
    st.playing = false;
    if (cine) cine.classList.remove('on');
    controls.enabled = true;
  }

  function tick(dt) {
    if (!st.playing) return;
    const s = shots[st.idx];
    st.t += dt;
    const a = ease(Math.min(1, st.t / s.dur));
    camera.position.lerpVectors(st.p0, st.p1, a);
    controls.target.lerpVectors(st.t0, st.t1, a);
    if (st.t >= s.dur) {
      st.idx++;
      if (st.idx >= shots.length) stop();
      else showShot(st.idx);
    }
  }

  // skip on canvas click (HUD button clicks never reach the canvas;
  // a 600ms grace period swallows the click that started playback)
  renderer.domElement.addEventListener('click', () => {
    if (st.playing && performance.now() - st.born > 600) stop();
  });

  const api = { play, stop, tick, get playing() { return st.playing; } };
  ctx.D.cine = api;
  return api;
}
