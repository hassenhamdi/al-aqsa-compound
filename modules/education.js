// education.js — 12 POIs with HTML markers projected each frame, #side panel + flyTo,
// guided-tour mode with prev/next auto-fly. Exports { tick, tour }.
import * as THREE from 'three';

const POIS = [
  { id: 'dome-rock', n: 1, title: 'Dome of the Rock', ar: 'قبة الصخرة', arch: ['Umayyad 691 CE', 'Octagon Ø20.4m', 'Gilded dome'],
    body: 'Golden ribbed dome over a blue-tiled octagon — white marble base below, cobalt and turquoise geometric tiles with a white calligraphy band above, 16-window drum; inside, two ambulatories ring the bare Rock under a gilt dome.',
    build: '691–692 CE, Abd al-Malik; outer octagon ~20 m/side, walls 11 m; dome Ø20.2 m gold; 4 cardinal doors; inner ring 4 piers + 12 columns; 240 m Kufic band (72 AH).',
    history: 'The Rock (al-Sakhra) — the Prophet’s ﷺ Miʿraj ascent (Qur’an 17:1); the first qibla faced this sanctuary; ʿUmar (15 AH/636) cleared it and prayed here; Saladin restored it after 1187.',
    lesson: 'Why a shrine, not a prayer hall? The double ambulatory is a circumambulation path. What do the mosaics show — and what do they deliberately avoid?',
    refs: ['dome-ext/temple-mount-V4-178.jpg', 'dome-int/arches.jpg', 'dome-int/sidepart-1.jpg', 'dome-int/2018-01.jpg', 'maps/plan-1890.jpg'],
    event: 'Isrāʾ & Miʿrāj · ʿUmar 15 AH',
    pos: [0, 20, -70], view: [64, 30, 6] },
  { id: 'dome-chain', n: 2, title: 'Dome of the Chain', ar: 'قبة السلسلة', arch: ['Umayyad', 'Open pavilion', 'Lead dome'],
    body: 'A small open domed pavilion just east of the Rock — 11 outer + 6 inner columns, no walls, grey hemisphere on a tiled hexagonal drum, mihrab niche on the qibla side.',
    build: 'Umayyad, possibly Abd al-Malik’s prototype; Ø14 m; 17 reused marble columns; Suleiman tiles 1561; third-largest Haram dome.',
    history: 'Judgment-Day scales (mawāzīn) and a chain of justice hung here; bayʿah pledges and scholars’ sittings gathered beside the Dome — open form as place of counsel.',
    lesson: 'Same language as the great Dome at miniature scale. Find the mihrab — which way is qibla?',
    refs: ['chain/chain-dome.jpg', 'chain/chain-01.jpg', 'chain/chain-interior-2013.jpg', 'chain.jpg'],
    event: 'Living sanctuary · counsel',
    pos: [28, 8, -52], view: [46, 22, 44] },
  { id: 'dome-ascension', n: 3, title: 'Dome of the Ascension', ar: 'قبة المعراج', arch: ['Ayyubid 1200', 'Octagonal drum'],
    body: 'A small closed octagon northwest of the Rock — white stone dome with a crown-cupola, clustered columns sealed with marble slabs, door north, mihrab south.',
    build: 'Ayyubid/Crusader-era fabric, Ø5–6 m, white stone plates; Ottoman restorations.',
    history: 'Marks the Miʿraj ascent (17:1; Bukhari/Muslim); pilgrims’ station of duʿāʾ recalling the Prophet’s ﷺ ascent.',
    lesson: 'Isrāʾ vs Miʿrāj — horizontal journey, then vertical ascent. Which surah opens with it?',
    refs: ['maps/plan-1890.jpg'],
    event: 'Isrāʾ & Miʿrāj',
    pos: [-26, 8, -112], view: [-52, 20, -30] },
  { id: 'dome-prophet', n: 4, title: 'Dome of the Prophet', ar: 'قبة النبي', arch: ['Ottoman 1539', 'Free-standing cupola'],
    body: 'An open octagonal pavilion on 8 grey marble columns with red-black-white ablaq arches, lead dome with lantern finial, low seat-wall, mihrab slab.',
    build: '1539 Muhammad Bey, restored 1603–21; Ø3.5–4 m; nightly oil lamp endowed (Haseki Sultan waqf).',
    history: 'Commemorates the Prophet’s ﷺ prayer with the prophets on Laylat al-Isrāʾ; the endowed lamp = continuous hospitality of light.',
    lesson: 'Ablaq spotting — count the alternating stones. Why keep a lamp burning all night?',
    refs: ['maps/plan-1890.jpg'],
    event: 'Isrāʾ & Miʿrāj',
    pos: [-30, 7, -98], view: [-58, 18, 22] },
  { id: 'qibli', n: 5, title: 'Al-Qibli Mosque', ar: 'الجامع القبلي', arch: ['Umayyad origins', '83×56 m', 'Lead dome'],
    body: 'Seven-arched limestone facade (centre taller), silver-grey lead dome over the southern bay; inside, 7 aisled marble columns, red carpets, brass chandeliers, stained-glass glow. Press E in Walk mode to step inside.',
    build: '83×56 m, walls 11 m; 7 aisles (Fatimid al-Zahir 1034–36, from 15); 45 columns (33 marble + 12 stone); dome r~6.5 m apex ~23 m; 121 windows; concrete dome 1969, re-leaded 1983.',
    history: '“al-Masjid al-Aqṣā” of 17:1; second mosque on earth, 40 years after Makkah’s Haram; first qibla until 2 AH; ʿUmar’s wooden mosque 638; Crusader palace/church; Saladin’s 1187 re-consecration; Nur al-Din minbar installed 1187; 1969 arson and reconstruction.',
    lesson: 'Walk the nave — 7 doors, 7 aisles. Why does the dome bay sit near the qibla wall?',
    refs: ['qibli/facade-frontal-04.jpg', 'qibli/facade-section.jpg', 'qibli-ne.jpg', 'qibli-dome.jpg', 'maps/wilson-buraq.png'],
    event: 'First qibla · ʿUmar · Saladin 1187 · 1969',
    pos: [0, 15, 150], view: [8, 12, 84] },
  { id: 'mihrab', n: 6, title: 'Mihrab & Minbar', ar: 'المحراب والمنبر', arch: ['Interior', 'Saladin minbar', 'Mosaic'],
    body: 'Marble-framed niche with mosaic conch on the south axis; to its right the tall wooden minbar — stepped pulpit with interlocked inlay and pointed canopy door.',
    build: 'Mihrab + Crusader-spolia columns; minbar commissioned Aleppo 1168–69 (Nur al-Din), ~6 m, 16,500 interlocked pieces, no nails; burned 1969, rebuilt Jordan 2003–07.',
    history: 'The minbar = liberation vow fulfilled — built before victory, installed after; the khatib’s weekly reminder; one prayer direction, one ummah.',
    lesson: 'How do 16,500 pieces hold with no nails? What does Aleppo→Jerusalem teach about intention preceding victory?',
    refs: ['qibli-interior.jpg'],
    event: 'Saladin 1187 · 1969',
    pos: [6, 5, 166], view: [7, 3, 12] },
  { id: 'alkas', n: 7, title: 'Al-Kas Fountain', ar: 'الكأس', arch: ['Umayyad 709', 'Ablution fountain'],
    body: 'Great circular basin 8–10 m with central fountain column, green iron fence, steel taps, low stone seats — “the Cup” on old plans, on the Dome–Qibli axis.',
    build: 'Umayyad 709, enlarged 1327–28 (Tankiz); cistern-fed; ablution taps ring the basin.',
    history: 'Wuḍūʾ station — purity before prayer (5:6); Tankiz endowments served worshippers and travellers; water charity (sadaqat al-māʾ) as worship.',
    lesson: 'Trace the ritual: taps → seats → mosque door. Why on the axis between Dome and Qibli?',
    refs: ['maps/wilson-buraq.png'],
    event: 'Living sanctuary · waqf',
    pos: [20, 5, 30], view: [-52, 18, 62] },
  { id: 'qaitbay', n: 8, title: 'Sabil of Qaitbay', ar: 'سبيل قايتباي', arch: ['Mamluk 1482', 'Sabil-kuttab'],
    body: 'Three-tiered fountain-house over 13 m — square ablaq base, round drum, pointed arabesque dome with bronze crescent; grilled windows, inscription bands, stairs and bench.',
    build: '1455 Inal, rebuilt 1482 Qaytbay, restored 1882–83; only Mamluk dome outside Cairo with E–W crescent; star-strap interior vaulting.',
    history: 'Mamluk rivalry in charity — free water on the Haram; inscriptions pair Qur’an with the builder: works outlive rulers.',
    lesson: 'Read the tiers: square earth → circle heaven → pointed aspiration. Find the crescent — why E–W?',
    refs: ['sabil/kait-bey-626.jpg', 'sabil/kait-bey-2117.jpg', 'sabil.jpg'],
    event: 'Living sanctuary · waqf',
    pos: [-110, 9, 30], view: [-48, 16, 40] },
  { id: 'qasim', n: 9, title: 'Sabil of Qasim Pasha', ar: 'سبيل قاسم باشا', arch: ['Ottoman 1527', 'Octagonal sabil'],
    body: 'Octagonal kiosk (3.5 m), domed, marble paving, 16 faucets, green-pillared wooden canopy, shallow Naranj pool beside it.',
    build: '1526–27 Qasim Pasha — first Ottoman building on the Haram; lead dome (1920s) → stone (1998).',
    history: 'Ottoman entry in stone — Mamluk-to-Ottoman continuity of care; canopy and benches rest students of the nearby madrasas.',
    lesson: 'First of an era in a small building — what changed, what stayed? Count the faucets and sides.',
    refs: ['fountains.jpg'],
    event: 'Living sanctuary · waqf',
    pos: [-45, 7, -30], view: [-44, 15, 46] },
  { id: 'minarets', n: 10, title: 'The Four Minarets', ar: 'المآذن', arch: ['Mamluk–Ottoman', 'Up to 37 m'],
    body: 'Four square Syrian-type stone towers — Ghawanima (tallest, 38.5 m, decorated), Silsila (35 m, columned balcony), Fakhriyya (shortest, 23 m), Asbat (slender Ottoman cylinder); shaft → muqarnas balcony → lantern → lead dome + crescent.',
    build: 'Mamluk 1278–1367; Asbat crown rebuilt post-1927 quake.',
    history: 'The adhan from al-Aqsa — first raised on Silsila; no minaret east (cemetery/Olives) — the call faces the living city; Bilal’s legacy in every tower.',
    lesson: 'Match each silhouette to its name. Why do all four differ — what does each crown say?',
    refs: ['minaret/fakhriyya-museum.jpg', 'minaret/asbat.jpg', 'minaret/gate-tribes.jpg', 'minaret-silsila.jpg', 'minaret-fakhriyya.jpg'],
    event: 'Living sanctuary · adhan',
    pos: [-140, 42, 90], view: [-64, 22, 30] },
  { id: 'gates', n: 11, title: 'Gates of the Haram', ar: 'الأبواب', arch: ['12 gates', 'Mamluk portals'],
    body: 'Herodian bossed ashlars below (2–13 m blocks), smaller courses and crenellation above; Qattanin’s grand ablaq + muqarnas recess, Asbat’s chamfered arch, Maghariba’s ramp-bridge, Rahma’s sealed double hall.',
    build: 'Herod expansion 19 BCE; 12 gates (11 open); Qattanin portal 1336; walls 19 m exposed / 32 m total.',
    history: 'Each gate a sermon — Silsila (judgment), Qattanin (scholars’ market), Maghariba (guardians; quarter demolished 1967), Rahma (sealed, eschatology). ʿUmar entered by the east; Saladin by the same hope.',
    lesson: 'Pick a gate on the 1890 plan, find its letter, tell its story.',
    refs: ['maps/plan-1890.jpg', 'sabil/cotton-gate.jpg', 'minaret/gate-tribes.jpg', 'misc/platform-portal.jpg'],
    event: 'ʿUmar 15 AH · covenant',
    pos: [-150, 9, 10], view: [-56, 20, 34] },
  { id: 'olives', n: 12, title: 'Olive Garden', ar: 'حديقة الزيتون', arch: ['Garden', 'Ancient olives', 'East court'],
    body: 'Informal olive rows on grass east + north — grey-green crowns, gnarled trunks, cypress sentinels; the vast limestone sahn between monuments holds outdoor prayer.',
    build: '60+ olives 3–6 m, spacing 6–10 m; dust-grey leaf, silver underside; sahn holds Eid crowds.',
    history: '“By the fig and the olive” (95:1) — oath by this land; olives = rootedness (sumud), harvest as communal rite; courtyards hold Eid and iʿtikaf vigils.',
    lesson: 'Stand east at dusk — gold ahead, olives behind. What does an oath “by the olive” imply about this soil?',
    refs: ['aerial/aerial-silwan-kidron.jpg'],
    event: 'Living sanctuary',
    pos: [90, 5, 120], view: [52, 24, 52] },
];
// Guided-tour order follows the events thread (lessons.md): Isrāʾ/Miʿrāj →
// first qibla → ʿUmar covenant → Saladin/1969 → gates → justice/counsel →
// water waqf → adhan → living sanctuary. Values are POIS indices.
const TOUR_ORDER = [0, 2, 3, 4, 5, 10, 1, 6, 7, 8, 9, 11];

export function buildEducation(ctx) {
  const { camera } = ctx;
  const app = document.getElementById('app');
  const side = document.getElementById('side');
  const tourTxt = document.getElementById('tourTxt');

  const markers = POIS.map((p) => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.position = 'absolute';
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.transform = 'translate(-50%,-100%)';
    el.style.display = 'none';
    el.innerHTML = `<div>${p.n}</div><span>${p.title}</span>`;
    el.addEventListener('click', (ev) => { ev.stopPropagation(); select(p, true); });
    app.appendChild(el);
    return { p, el, v: new THREE.Vector3(p.pos[0], p.pos[1], p.pos[2]) };
  });

  function closeSide() { if (side) side.classList.remove('show'); }

  function select(p, fly = true) {
    if (side) {
      side.innerHTML = `<h3>${p.n}. ${p.title} <em>• stop ${p.n}/12</em></h3>`
        + `<div class="ar">${p.ar}</div><p>${p.body}</p>`
        + `<p><b>BUILD — </b>${p.build}</p>`
        + `<p><b>HISTORY — </b>${p.history}</p>`
        + `<p><b>LESSON — </b>${p.lesson}</p>`
        + `<div class="meta"><span>◈ ${p.event}</span>${p.arch.map((a) => `<span>${a}</span>`).join('')}</div>`
        + `<div class="refs" style="font-size:11px;opacity:.75;margin:6px 0">Refs: ${p.refs.join(' · ')}</div>`
        + `<button id="sideClose">✕ Close panel</button>`;
      side.classList.add('show');
      const btn = document.getElementById('sideClose');
      if (btn) btn.addEventListener('click', closeSide);
    }
    if (fly && ctx.flyTo) {
      const tgt = new THREE.Vector3(p.pos[0], p.pos[1], p.pos[2]);
      const cam = tgt.clone().add(new THREE.Vector3(p.view[0], p.view[1], p.view[2]));
      ctx.flyTo.fly(cam, tgt, 2.4);
    }
    if (tourTxt && !tour.active) tourTxt.innerHTML = `<b>${p.n}/12 — ${p.title}.</b> Press Guided Tour for the full route.`;
  }

  const tour = {
    active: false, i: 0, timer: 0,
    go(n) {
      this.i = ((n % TOUR_ORDER.length) + TOUR_ORDER.length) % TOUR_ORDER.length;
      this.timer = 0;
      const p = POIS[TOUR_ORDER[this.i]];
      select(p, true);
      if (tourTxt) tourTxt.innerHTML = `<b>Stop ${this.i + 1}/12 — ${p.title}.</b> ${p.lesson.slice(0, 90)}…`;
    },
    next() { this.go(this.i + 1); },
    prev() { this.go(this.i - 1); },
    start() {
      this.active = true; this.i = 0; this.timer = 0;
      document.getElementById('bTour')?.classList.add('on');
      this.go(0);
    },
    stop() {
      this.active = false;
      document.getElementById('bTour')?.classList.remove('on');
      if (tourTxt) tourTxt.innerHTML = 'Press <b>Guided Tour</b> or click any gold marker — 12 stops with history & architecture.';
    },
    toggle() { this.active ? this.stop() : this.start(); },
  };

  document.getElementById('tourNext')?.addEventListener('click', () => { if (!tour.active) tour.start(); else tour.next(); });
  document.getElementById('tourPrev')?.addEventListener('click', () => { if (!tour.active) tour.start(); else tour.prev(); });
  document.getElementById('tourClose')?.addEventListener('click', () => { tour.stop(); closeSide(); });

  const _pv = new THREE.Vector3();
  const _toM = new THREE.Vector3();
  const _fwd = new THREE.Vector3();
  function tick(dt) {
    // auto-advance the guided tour every 9 s
    if (tour.active) {
      tour.timer += dt;
      if (tour.timer > 9) tour.next();
    }
    if (!app) return;
    const w = window.innerWidth, h = window.innerHeight;
    const cineOn = ctx.D.cine && ctx.D.cine.playing;
    camera.getWorldDirection(_fwd);
    for (const m of markers) {
      if (cineOn) { m.el.style.display = 'none'; continue; }
      _toM.copy(m.v).sub(camera.position);
      if (_toM.dot(_fwd) <= 0) { m.el.style.display = 'none'; continue; } // behind camera
      _pv.copy(m.v).project(camera);
      if (_pv.z > 1 || _pv.z < -1) { m.el.style.display = 'none'; continue; }
      const x = (_pv.x * 0.5 + 0.5) * w;
      const y = (-_pv.y * 0.5 + 0.5) * h;
      if (x < -40 || x > w + 40 || y < -20 || y > h + 20) { m.el.style.display = 'none'; continue; }
      m.el.style.display = 'block';
      m.el.style.left = `${x.toFixed(1)}px`;
      m.el.style.top = `${y.toFixed(1)}px`;
    }
  }

  const api = { tick, tour, select, POIS };
  ctx.D.edu = api;
  return api;
}
