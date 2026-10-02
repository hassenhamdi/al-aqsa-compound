# stairs-fix — open terrace stair axes (platform.js only)
Cause: arch ring placed an arch at t=0 on all 4 sides, walling the 14m
stair lane; old solid gable box hung 1.1-1.5m above mid-run steps.
Fix: ring 28→24 (6/side at ±9.5/25/40.5, opening ±8.2); solid gable →
open 3-bay Mawazin arcade (4 piers + lintel, soffit 7.4, center bay ±1.74
void); 8 sloped cheek-walls (±7.25, 0.274 rad). Lane check (node, S lane):
arch 8.2 / cheek 7.25 / bay 1.74 / soffit 7.4 — all PASS. `node --check` clean.
Shots (shot-dgpu.mjs verbatim, D129, cams verified; below-target framing is
impossible — maxPolarAngle 1.52 clamps, so axis shot is grazing not wormseye):
stairs-axis cam [0,16,30]→[0,8,-70] calls 144; stairs-aerial view=0 calls 215.
| axis | photo desc. | PASS | open run, cheeks, arcade crown, Dome behind |
| aerial | regression | PASS | massing intact; 215 dominated by sibling groups (audit: platform only 15+5) |
Next: W3 lane threading (owner); arcade archivolts if closeup demands.
