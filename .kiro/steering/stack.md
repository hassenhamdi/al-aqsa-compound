# Steering — stack & hard rules (L2)

> Adapted from `AGENTS.md` §§1, 6–7. Auto-loaded: do not restate per task.

- three@0.170.0 ESM via importmap; `index.html` UI ids are frozen — DO NOT edit.
- Units meters. Anchors (do not drift): Haram platform ~300×450 top y=2; Dome
  terrace (0,5.2,-70), apex ~29+finial; Qibli (0,2,150) 83×56×11; Chain E of Dome;
  minarets NW(-140,-140) W(-148,60) SW(-140,210) N(60,-218); olives E x62..128.
- `ctx = { scene, M, D }`; keep every `buildX(ctx)` export signature + return.
- Budgets: ≤26 real lights total, 1 PointLight/minaret max (rest emissive), one
  2048 shadow light; shadow ON massing/minarets/domes/instances, OFF
  ribs/finials/windows/mist/birds/leaves-small; draw calls ≤150 target.
- Geometry recipes: rib squash `scale.y=riseK`, R*1.012; semi-dome spheres rotated
  + sunk; arches DoubleSide; PMREM RoomEnvironment AFTER scene+materials;
  InstancedMesh `frustumCulled=false` where spread.
- Governor: EMA fps <27 for 3.5 s → high→med→low (pr 2→1.35→1, bloom off + 1024 at low).
- `node --check` clean after every edit. No `Buffer` in Code Mode (atob/text).
  No new npm deps without main-session approval. No WebGPU-only deps in realtime
  (fluids/glass/pathtracer OFFLINE only).
