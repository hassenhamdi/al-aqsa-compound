# AGENTS.md — Al-Aqsa Compound (shared ground for all subagents)

> Read this first. Dispatch prompts stay task-specific; shared data lives HERE.
> Modify ONLY in main session. Subagents: read, obey, document concisely.

## 1. Project
- Dir: `/home/hassenhamdi/al-aqsa-compound/` — `index.html` (importmap three@0.170.0, UI ids — DO NOT edit), `main.js`, `modules/*.js`, `references/*.jpg` (10 real photos), `_skills/awesome/skills/*`, `_docs/*`, `PIPELINE.md`, `shots/`.
- Units meters. Haram platform ~300×450 at y=2 top. Dome terrace (0,5.2,-70). Qibli at (0,2,150) 83×56×11.
- ctx = `{scene, M, D}`. `M` from `materials.js`. `D` shared: `D.tickers[]`, `D.poi[]`, `D.qibliPos/qibliInterior/mihrabPos/domePos/domeInterior/minarets/gates/lights`. Each `buildX(ctx)` keeps export signature + returns. Zero new scene lights unless spec says (budget ≤26 total, 1 real PointLight/minaret max, rest emissive).
- `node --check` clean after every edit. `window.__scene = {setView,flyTo,CAMS,preset,quality,info}`.

## 2. Skill routing (repo-based)
- Base: `threejs-scene` skill (proportions, dome/rib/semi-dome recipes, DoubleSide arches, metals-need-env, 1-light-per-minaret, governor). Local: `_skills/awesome/skills/`.
- `threejs-procedural-materials/fields` → textures/PBR. `procedural-architecture/geometry` → massing/arches/muqarnas. `procedural-vegetation` → olives/cypress. `bloom/exposure-color-grading/image-pipeline/shadow-systems` → post. `procedural-animation/vfx/camera-direction` → motion. `visual-validation` → shots.
- Vibe-kit `_skills/vibe/*.md`: hand-place heroes (no RNG scatter for buildings), instancing for repeats, asset-optimization. Conference `_docs/conference-*.md`: perf budgets only. Fluids/glass/pathtracer: OFFLINE only (no WebGPU deps in realtime).
- Web lookup allowed when fidelity blocked: e.g. olives → `SkyeShark/SeedThree`, furniture/garments/calligraphy text → three examples/fonts, water/physics → simple shader + `three/addons` (no heavy sim). Record URL + what was borrowed in doc.
- Studio engine (borrowed from `~/Projects/mosque-threejs/studio/`): labeled part registry
  (`D.register/show/solo/frame`, dimension-derived `frame()` fit, `dump/load`), floating panel
  with per-object eye toggles, `tracks/*.md` per object (spec + acceptance views + log),
  owner-per-track rule (keep export signature, zero new lights, `node --check` clean).

## 3. dGPU browser (GTX 1650 Ti 4GB, driver 610.57) — PROVEN METHOD, do not re-derive
- Nodes: `renderD128=Intel(0x8086)`, `renderD129=NVIDIA(0x10de)`. Always override to D129.
- Prior agents' working scripts (provenance, reuse verbatim): `/tmp/opencode/pwshot/shot.mjs`
  (system builder: perf-p1 + dgpu gate), `/tmp/opencode/vegtest/shoot.mjs` (vegetation owner: olive-p2).
  Canonical copy: `scripts/shot-dgpu.mjs` (playwright-core, cached Chromium).
  Batch upgrade ADOPTED from qibli owner Phase3a `/tmp/opencode/pwshot/multi.mjs`:
  one browser loops `[[url,out,preset,waitMs]]`, adds `--ozone-platform=x11`,
  settle `frames>60`, optional `__scene.preset(p)` + wait per shot.
- Brave `--headless` segfaults (exit 139, all flag combos) — BANNED for captures.
  Headed is the truth path on `DISPLAY=:1` (X1 exists). Firefox headless = fallback only.
- Exact recipe (verified `ANGLE (NVIDIA GTX 1650 Ti, OpenGL 4.5.0)`):
  ```
  python3 -m http.server 8099 &
  node scripts/shot-dgpu.mjs "http://localhost:8099/index.html?nohud=1&view=0" shots/aerial.png
  # custom framing: pos/tgt arrays → __scene.flyTo(pos, tgt, 0.3)
  node scripts/shot-dgpu.mjs "http://localhost:8099/index.html?nohud=1" shots/custom.png "[101,5,-78]" "[94.7,3.6,-85.7]"
  ```
  Script internals (do not change): `chromium.launch({executablePath:
  ~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome, headless:false,
  args:['--render-node-override=/dev/dri/renderD129','--use-gl=angle','--use-angle=gl',
  '--disable-gpu-sandbox','--no-sandbox','--window-size=1280,800']})`,
  viewport 1280×800, settle = `__scene.info` present + `!fly.active` + `frames>90`,
  log `GL_RENDERER` + `info()` (calls/lights/cam), screenshot, non-zero exit on page errors.
  Vegetation-owner variant used Brave executable + `?nohud=1`, loader `.done` + 2500ms settle,
  `flyTo` per view — equivalent, keep Chromium-exe as default.
- Custom pos/tgt `flyTo` shots race the intro flight (landed mid-tween twice):
  always verify `INFO.cam` matches the request and retry on mismatch.
- Serve from project dir. `?nohud=1` hides HUD/markers, `?view=N` jumps CAMS[N] instantly
  (see `main.js:414-431`, CAMS list `main.js:255-266`). Kill server after.
- RE-READ THIS SECTION AFTER EVERY REWAKE — it changes. Use `scripts/shot-dgpu.mjs`
  verbatim; do NOT invoke `brave` (headless segfaults, headed wastes RAM and races
  other agents on DISPLAY=:1). If the browser fails to launch, another agent is
  likely shooting: wait 60 s and retry, max 3 attempts, then report BLOCKED (never
  improvise a new capture path).

## 4. Visualizing rules (MANDATORY before submit)
- `?nohud=1` / hide `#top,#side,#tour,#help,#stats,.marker,#toast` + `.hud{display:none}` via evaluate. Letterbox `#cine` OFF. No HUD/markers in shots.
- 4+ views: aerial / Dome closeup / Qibli facade (N side) / interior(s). Save `shots/<view>.png`. Read PNG + matching `references/*.jpg`, fill table: View | Ref | PASS/PARTIAL/FAIL | 1-line evidence.
- Compare silhouette → massing → colors → rhythm → details. Trust settled pixels over HUD text.
- Low-quality element → mark `PLACEHOLDER` in code (`userData.placeholder=true`) + add row to `REFINE.md` (object, gap, candidate repo/approach, cost). Never ship fake detail as final.

## 5. Documentation (concise, connected)
- Each task appends `docs/<module>-<topic>.md` (≤40 lines): goal, refs used, changes (file:line), shots, verdicts, placeholders, next. Naming: `docs/dome-materials-v2.md`, `docs/olive-seedthree-spike.md`.
- Keep `REFINE.md` current: `| object | gap | plan | candidate |`. Keep cross-links (Dome↔terrace↔Chain positions). No duplicate docs.
- Commit on branch when coherent piece works (never straight to main if repo).

## 6. Budgets / hard rules
- Draw calls ≤150 target (current ~500 — instancing pass pending). Shadow ON: massing/minarets/domes/instances; OFF: ribs/finials/windows/mist/birds/leaves-small. One 2048 shadow light.
- Rib squash `scale.y=riseK`, R*1.012. Semi-dome = SphereGeometry rotated, sunk into drum. Arches DoubleSide. PMREM RoomEnvironment AFTER scene+materials. InstancedMesh `frustumCulled=false` where spread.
- Governor: EMA fps <27 for 3.5s → high→med→low (pr 2→1.35→1, bloom off + 1024 at low).
- No `Buffer` in Code Mode (use atob/text). No new npm deps without main-session approval.

## 8. Object creation (structures-first order)
- Order: STRUCTURES basic geometry → TEXTURES/materials → atmosphere/light/shadow/animation/quality.
  Character FPS controls+camera = final stage (walk mode until then).
- Grounding rule: NEVER build an object blind. If `references/` lacks it (check
  `references/INDEX.md`), web-search it first, download 2+ views into
  `references/<object>/`, Read the images, then build. Record URLs in the doc.
  Absent-object builds without reference evidence will be rejected at the gate.
- For every prop (furniture, lanterns, trees, sabils): img2obj workflow —
  validate ref → `ObjectSculptSpec` (hierarchy, pivots/sockets) →
  `blockout → form → lookdev → interaction`, compare render vs `references/*.jpg`,
  fix highest-impact diff first. Refs: `img2threejs/img2threejs`,
  `vinhhien112/img2obj` (demos: Tower Ship, Autumn Tree, Lantern House).
- Trees: SeedThree technique (Weber-Penn bake → InstancedMesh, never full engine);
  "ez-tree" has no exact three.js repo — use SeedThree/img2obj-tree path.
## 7. Shared positions (do not drift)
- Dome (0,5.2,-70) apex ~29+finial. Chain E of Dome. Ascension/Prophet NW terrace. Qibli (0,2,150) dome at z≈+20 south. Al-Kas S-center. Qaitbay/Qasim W. Minarets: NW(-140,-140) W(-148,60) SW(-140,210) N(60,-218). Olives E x62..128. See `references/plan.jpg`.
