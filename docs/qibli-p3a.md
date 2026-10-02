# qibli-p3a — hall readability: buried floor found, mihrab legible
Goal: fix PARTIAL (floor/carpet white void, mihrab unreadable). Exterior untouched.
Root cause (verified by red-tracer shot): NOT the lamp — the Haram terrace slab
(platform.js qterr, top y=3.2 world) buried the hall floor (was 2.3). Ablation
across sun/points/hemi/env/night/noon changed nothing; tracer proved the white
was terrace marble, invisible carpet 0.9 m underneath.
Refs: references/qibli-interior.jpg (colonnade rhythm, chandeliers, dark end wall).
Changes — modules/aqsaMosque.js only: INT.position.y=0.9 (197, floor meets
terrace); local floorMat albedo ~0.35 rough .78 env .12 (202); carpet map clone
repeat [12,18] (208-210); chandelier PointLight 220→36 decay 2 dist 55 (344);
mihrab gold jambs+lintel + hanging lamp emissive-only (277-290); conch fixed
(ball→cup: dropped Y-flip, DoubleSide gold, 274-276); ceiling/beams/architrave/
qibla-wall/arch-rods lowered locally to clear roof slab (252-254,266,303,308,325).
Shots (Playwright Chromium headed, D129 NVIDIA, ?nohud=1, HUD OFF):
shots/qibli-p3a-interior.png (?view=4), qibli-p3a-mihrab.png (flyTo closeup),
qibli-p3a-facade.png (?view=3, no regression). 117-142 calls, 7 lights, 58fps.
Verdicts: interior PASS (red carpet motif + colonnades + chandeliers read;
mihrab PASS (mosaic frame vs dark niche + gold conch + lamp); facade PASS.
Placeholders: none (old floor/carpet flags removed — cause eliminated).
Next/propose (main session): walk spawn D.qibliInterior y 2→3.6 (floor now 3.2);
system lampQ 7 fine as-is; terrace-marble glare stays sibling REFINE row.
