# Al-Aqsa Compound — Design (L1)

## Context & contracts

- `ctx = { scene, M, D }`. `M` comes from `modules/materials.js` (PBR, PMREM
  RoomEnvironment AFTER scene+materials). `D` is shared state: `D.tickers[]`,
  `D.poi[]`, `D.qibliPos/qibliInterior/mihrabPos/domePos/domeInterior/minarets/
  gates/lights`, `D.lightApi`, `D.parts`.
- Every `buildX(ctx)` keeps its export signature and returns its group; units meters.
- `window.__scene = { setView, flyTo, CAMS, preset, quality, info }`;
  `window.__studio = { list, show, solo, all, focus, frame }`.

## Module map (structures → textures → atmosphere → motion → validation)

| Layer | Modules | Notes |
|---|---|---|
| Massing | platform, domeOfRock, aqsaMosque, minorDomes, minarets, infill | hand-placed heroes; arches DoubleSide; rib squash `scale.y=riseK`, R*1.012; semi-domes sunk into drums |
| Surfaces | materials, geo | world-space ashlar POM/SPOM stone; metals need env; merged-box UV discipline |
| Green | opentree (portable bake core), vegetation, oliveGrove | olive = retuned oak, seed 70701; 2 InstancedMesh + cypress = 3 draws; `frustumCulled=false` where spread |
| Sky/light | lighting, atmosphere, water | 4 presets (dawn/noon/sunset/night); sun+hemi+2 lamps = 4 lights here; emissive elsewhere |
| Life | pigeons, character, cinematic, education, furniture | CPU-ticked instancing; 12 POIs + tour order; walk mode last |
| Ops | studio, freecam | post-merge traversal registry; zero sibling edits; `?view=N`, `?nohud=1`, `?preset=` |

## Studio-lite registry (borrowed from `~/Projects/mosque-threejs/studio/`)

- `register(label, objs)` by post-merge `getObjectByName` traversal; interiors
  (`domeInterior`, `qibliInterior`) and `dome-of-chain` keep protected scopes so
  merges never absorb them. `solo()` re-asserts ancestor visibility; `frame()`
  fits dimension-derived bounding spheres on both fovs (margin 1.25).
- Owner-per-track rule: keep export signature, zero new lights, `node --check` clean.

## Render & performance design

- ACES tone mapping, PCFSoft shadows, one 2048 shadow light; shadow ON for
  massing/minarets/domes/instances, OFF for ribs/finials/windows/mist/birds/leaves.
- Governor: EMA fps <27 for 3.5 s → high→med→low; bloom threshold 0.9/radius 0.4.
- Budget target ≤150 draw calls (215 aerial at last count; 45 unique-material
  singletons pending owner consolidation — see REFINE.md).

## Verification design

- dGPU truth path: `scripts/shot-dgpu.mjs` (Chromium 1228, D129 override) on
  `DISPLAY=:1`; 4+ `?nohud=1` views vs `references/*.jpg`; PASS/PARTIAL/FAIL table.
- Placeholders marked `userData.placeholder=true` + REFINE.md row; never shipped
  as final. Docs: `docs/<module>-<topic>.md` ≤40 lines each.
