# perf-p2 — wave content into the merge (222→215; ≤200 PARTIAL)
Goal: aerial ≤200, zero visual change. Extended main.js merge only.
Changes — main.js: massGroups += infill:8; excludedGroups={pigeons}
(animated flocks never merge); ShaderMaterial uuid-key (fixes latent
basin/dish uniform mix-up); renderOrder preserved on merged; placeholder
flag transferred (infill blockout grade kept); minDim≥0.25 rule (rails,
fence posts, finial rods stop casting); shadow policy now also enforced
on skipped meshes (noMerge/placeholder/array) — water discs keep geometry
(noMerge respected) but lose 3 stray shadow calls; mergeReport +
singleton descriptors + caster names added to audit (diagnostics kept).
Result: infill 11→4 mesh (7→1 cast); calls 222→215 stable ×3 runs.
Proof (dGPU, HUD OFF, cams exact): perf-p2-aerial (215), perf-p2-flock
(152, water ripples correct, pigeons flying), perf-p2-qibli (118,
furniture intact). No regressions; pigeons/instancing untouched.
Gap: 45 unique-material singletons need owner consolidation (near-dup
white cylinders/boxes across dome+aqsa ≈ −8); + poles/root pass ≈ −3.
Even full wishlist ≈ 204 — ≤200 needs structural pass (see REFINE).
node --check clean. Server mine — killed after.
