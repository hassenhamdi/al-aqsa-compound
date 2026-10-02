/* sw.js — pre-cache for al-aqsa-compound (app shell + pinned CDN).
   Versioned cache; old caches purged on activate. */
const VERSION = 'aqsa-v1';
const CORE = [
  './', './index.html', './main.js',
  './modules/geo.js', './modules/materials.js', './modules/platform.js',
  './modules/domeOfRock.js', './modules/aqsaMosque.js', './modules/minorDomes.js',
  './modules/minarets.js', './modules/vegetation.js', './modules/oliveGrove.js',
  './modules/opentree.js', './modules/lighting.js', './modules/atmosphere.js',
  './modules/character.js', './modules/cinematic.js', './modules/education.js',
  './modules/studio.js', './modules/water.js', './modules/furniture.js',
  './modules/pigeons.js', './modules/freecam.js', './modules/infill.js',
  './content/lessons.md', './manifest.webmanifest',
];
const CDN = [
  'https://unpkg.com/three@0.170.0/build/three.module.js',
  'https://unpkg.com/three@0.170.0/examples/jsm/controls/OrbitControls.js',
  'https://unpkg.com/three@0.170.0/examples/jsm/objects/Sky.js',
  'https://unpkg.com/three@0.170.0/examples/jsm/environments/RoomEnvironment.js',
  'https://unpkg.com/three@0.170.0/examples/jsm/postprocessing/EffectComposer.js',
  'https://unpkg.com/three@0.170.0/examples/jsm/postprocessing/RenderPass.js',
  'https://unpkg.com/three@0.170.0/examples/jsm/postprocessing/UnrealBloomPass.js',
  'https://unpkg.com/three@0.170.0/examples/jsm/postprocessing/OutputPass.js',
  'https://unpkg.com/three@0.170.0/examples/jsm/utils/BufferGeometryUtils.js',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll([...CORE, ...CDN])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: false }).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('unpkg.com/three@0.170.0/'))) {
      caches.open(VERSION).then((c) => c.put(e.request, copy));
    }
    return res;
  })));
});
