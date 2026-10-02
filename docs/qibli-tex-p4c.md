# qibli-tex-p4c — Qibli lookdev (textures only, geometry frozen)
Goal: facade/interior PBR upgrade from qibli/* + root qibli refs. All local to
modules/aqsaMosque.js (shared M.* never mutated — lamp/strips/bulbs keep
M.glassWarm so presets still tween them; floor borrows marble pixels only).
Palette: facade-frontal-04 (honey courses, stain patches), qibli-dome/mosque-8682
(rib seams, oxidation streaks, base patina), facade-section (porch shade, green
doors), inscription-02 (dark script band), qibli-ne (lattice windows).
Changes (aqsaMosque.js): TEX block (~24-160): qStone canvas (course drift, stain/
pale blocks) → walls/parapet/crenels/piers-sides/nave/drum/arches; porchShade
warm tint → piers + porch sides (tuned 0xc08a64→0xd4b49a after rust overshoot);
bandMat abstract inscription panels [8,1] (glyphs abstract, not real text);
leadTex (28 seams, streaks, base patina) → dome; qLeadFlat → roof/gable/porch
roof; doorTex planks+ledges; ceilPaint 3×3 coffers (gold/red/teal); carpetTex2
arch tile #8E1F2F/#D4AF5A [14,20]; colMarble pale veins vs colStone warm bands;
qGlass lattice amber/teal/cobalt emissive → side/drum/oculus windows.
Same meshes, zero new lights. Calls 100-130 (≤200), lights 7, dGPU verified.
Shots (?nohud=1, cams verified): qibli-tex-p4c-facade (?view=3 [55,16,55]),
qibli-tex-p4c-interior (?view=4), qibli-tex-p4c-dome (flyTo [42,32,196]).
| facade (?view=3) | qibli-ne | PASS | honey courses, shaded arcade, lattice glass, ribbed dome |
| dome closeup | qibli-dome/mosque-8682 | PASS | seam rhythm + oxidation, drum lattice, flat grey roof |
| interior (?view=4) | qibli-interior | PASS | coffered ceiling, arch carpet, marble-vs-stone shafts |
Placeholders: none (terrace glare = pre-existing sibling row).
Next: walk-spawn y (p3a proposal stands); inscription legibility if camera nears.
