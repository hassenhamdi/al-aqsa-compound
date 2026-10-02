# perf-p1 — 1235 → 186 calls, zero visual change (dGPU verified)
Goal: Phase-1 ≤200 without regression. Method: post-build static merge
in main.js (no sibling geometry edits) + birds→InstancedMesh.
Changes — main.js: import mergeGeometries (9); §3b merge pass (~140-230):
per-(group, material-signature, indexed, shadow-class) merge; emissive
materials uuid-keyed (pulsing crescent safe); shared M.* preferred as
representative; refcounted dispose; flat decals never cast; massing-only
thresholds platform/dome/aqsa 10 m, minarets 8 m, minor-domes none.
main.js audit() +cast counts (was validation PoV). atmosphere.js birds:
27 meshes → 3 InstancedMesh, identical M=T·Ry·T±·Rz compose.
character.js: avatar castShadow off (massing-only rule).
Calls (aerial, high, dGPU): before 1235 (899 renderables, ~600 shadow) →
after 186 (136 renderables, 36 casters). Dome view 794→141.
Per-group mesh: platform 147→13, dome 74→23, aqsa 97→19,
minor 343→16, minarets 161→12, root 36→9. Vegetation already instanced.
Shots (HUD OFF, read): shots/perf-p1-aerial.png, shots/perf-p1-dome.png —
match dgpu-aerial/dome-closeup pixel-language; no holes/regressions.
Gotcha fixed mid-pass: indexed+Extrude mixing fails mergeGeometries
(silently kept originals) — key now splits |ix/|nx.
Placeholders: none new. info() truthful (autoReset=false + per-frame
reset); governor untouched.
Next owner: interiors lamp-balance (Phase 3); crescent-pulse + bird-flap
motion re-check at Phase-5 gate; remaining ~36 calls to reach ≤150:
cloud sprites, visitor meshes, singleton buckets.
