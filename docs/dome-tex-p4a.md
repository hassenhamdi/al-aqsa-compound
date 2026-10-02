# dome-tex-p4a — Dome PBR lookdev (textures only, geometry frozen)
Goal: tile/marble/gold/mosaic upgrade from dome-int/* + dome-ext/* refs. All
local to modules/domeOfRock.js (shared M.* never mutated; qibli mihrab M.tile,
all M.marble/M.gold users elsewhere unaffected). Same meshes, no new lights.
Palette evidence: marble-detail.jpg (book-matched grey veins, joints, patina),
sidepart-2 (green lattice coffers, gilt bosses, marble chevrons, mosaic arches).
Changes (domeOfRock.js): TEX block (~40-106): tile canvas 3 registers (lattice/
calligraphy/palmette, thick white outlines; wall [24,1], drum clone [10,1]);
marble canvas (34 drifting veins, chevrons, joints, patina) → marbleMat +
frameMat/inMarble/floor/portico; goldMat flats deeper (ribs stay bright trim);
ablaq canvas on arcade arches (5 courses/m, fixes p3b PARTIAL); mosaic scrolls
+ dado chevrons enriched. Calls 147-156 (≤200), lights 7, dGPU GL verified.
Shots (?nohud=1, cams verified): dome-tex-p4a-closeup.png (?view=1 [60,24,-10]),
dome-tex-p4a-interior.png (?view=5), closeup-noon.png (same view, noon preset).
| View | Ref | Verdict | Evidence |
| closeup (?view=1) | temple-mount-V4 | PASS | tile registers, gold rib contrast, no bloom blowout |
| closeup noon | marble-detail | PASS | marble bright, veins sub-pixel-correct at 75 m |
| interior (?view=5) | 2018-01/arches | PASS | ablaq arches, mosaic drum, chevron dado, grey shafts |
| gilt soffit closeup | 2018-03 | PARTIAL | apex unseen from allowed views (REFINE row kept) |
Placeholders: none (roof-lead white glare = pre-existing sibling REFINE row).
Next: soffit up-shot verify; rock micro-noise; walk spawn y (unchanged).
Log P5b: finial compressed per gates-p4e §4 (rod 2.6, orbs .48/.36/.26 @
+.7/+1.35/+1.9, crescent +2.3 R.7 → tip ≈+3.1; apex ~36.5); ?view=1 verified,
silhouette compact vs temple-mount-V4-178. REFINE finial row → done.
