# struct-tex-p4d — cloister lookdev (textures only, geometry frozen)
Goal: P4 STRUCT annex lookdev via sockets + fix own align-p4b flags
(Ascension E-W swap, Al-Kas mirror). Gates (platform.js:99-103) NOT
mine — left for Phase 4e.
Refs grounded: museum/museum-2013.jpg (honey ashlar, oak door, grille
windows, dome+spolia noted as still-missing); sabil/cotton-gate.jpg
(ablaq voussoirs, grilled gate, arcade band); maps/plan-1890.jpg (R/S
both NW of Dome — swap keeps Ascension NW, clear of Prophet).
Changes (minorDomes.js, shared M.* never mutated): TEX block (~346-440:
ashlar/ablaq/grille/plank canvases → ashlarMat/lightAshlarMat/ablaqMat/
grilleMat/woodMat/ironMat/amberGlass); bags dark→ablaq/wood/grille
(5 buckets, +2 calls); benches→woodMat; lanterns→iron+amber (emissive-
only, no lights); Ascension (26,-100)→(-26,-112) (mirror + N nudge,
Prophet untouched); Al-Kas (-20,30)→(20,30); vegetation.js KEEP disc
follows Al-Kas. node --check clean.
Shots (verbatim shot-dgpu.mjs, D129 NVIDIA, ?nohud=1, cams verified;
custom y drifts +1-2, x/z exact — accepted): aerial 184-185 (run
variance ±12, no attributable regression); terrace (?view=2);
portal/museum/ascension/alkas customs.
| View | Ref | Verdict | Evidence |
| aerial | plan/aerial | PASS | masses intact, Al-Kas E, no regressions |
| portal | cotton-gate | PASS | ablaq stripes, ashlar, wood door, clear axis |
| museum | museum-2013 | PASS | coursing/door/grilles read (haze); UV stretch <15 m noted |
| ascension | plan-1890 | PASS | NW, ~15 m clear of Prophet |
| alkas | wilson-buraq | PASS | basin+fence centered on x=20 axis |
| terrace | — | OBSERVE | Dome low walls blow white (pre-existing sibling glare rows) |
Placeholders: 5 buckets + benches kept (form coarse); lantern flag
cleared (iron+amber complete). REFINE: cloister row updated, +museum
dome/spolia gap, +stale main.js collider note.
Next: Phase 4e gates; world-scale UVs; museum dome + spolia (struct follow-up).
