# sun-audit — sun/light skills conformance (lighting.js/atmosphere.js scope)
| skill | rule | our state | gap |
| day-cycle (ghibli) | one applySun writer; warm→noon + horizon falloff; shared uSun* | apply() single writer ✓; falloff ✓ | shared uniforms missing → FIXED (D.sunUniforms, zero consumers yet) |
| atmosphere-aerial | sky+haze share sun/coeffs/exposure; analytic tier OK small scene | Sky+key share elev/azim ✓; fog hand-tuned (tier-accepted) | fog not scattering-derived — accepted, documented |
| exposure-grading | HDR→meter→adapt→1 tonemap→out; no exposure-as-crutch | OutputPass sole tonemap ✓; hand-tuned exp (w8-accepted, no meter) | exp trims mask albedo scale — flagged to materials owners |
| shadow-systems | bounded single map OK; static cache; bias ∝ texel; targeted invalidation | static cache + settle-exact ✓; invalidate on sun-move ✓ (main.js) | bias fixed → FIXED (normalBias scales 2048/mapSize, read-only) |
| bloom | threshold on linear HDR pre-tonemap; per-preset strength; single node | thr .9 HDR ✓; strength/preset ✓; single node per w8 ✓ | selective dual rejected per w8 — stands |
| image-pipeline ×2 | order HDR→atmo→bloom→exp→tonemap→grade→out; tonemap once; DOM UI exempt | order ✓ (Render→Bloom→Output); UI is DOM ✓; governor toggles bloom ✓ | no effect-only views (?nobloom needs main.js boot — filed below) |
Fixes this task (own files): normalBias auto-scale; D.sunUniforms writer.
No look changes (bias identical at 2048; uniforms unconsumed) — batch proves it.
Proof (?view=0, 12s): audit-dawn (206/0.0% PASS) audit-noon (225/0.0% PARTIAL,
bright but unclipped) audit-sunset (187/0.0%, gnd 174=gate PASS) audit-night
(85/0.0% PASS; +20L vs w4 = others' new geometry, not mine). node --check clean.
Remaining for others — main session: bloom ctor `UnrealBloomPass(res,.35,.6,.82)`
→`(res,.35,.4,.9)` (runtime already pins it); ?nobloom effect view; meter-vs-hand
verdict stands. Albedo owners: noon sun 3.0 vs brightened stone (aerial high-key).
Shadow: texel-snapped transitions (2s fades only; rest-exact today) — future.
