# w5-furniture — Qibli furnishing + Tankiz lamp replicas
Spec (ObjectSculptSpec; validate→spec→blockout→form→lookdev):
LAMP: HANG ring→3×CHAIN→BODY lathe (foot Ø.2, globe Ø.31, flare Ø.38, h.55, pivot rim)→FLAME sphere@mouth; enamel canvas: gold ground, cobalt script bands, red roundels + white lamp glyph (abstract, not text).
HALL: SHELF case 2.2×1.1×.35 + 3 boards + BOOK rows (22/shelf) | DIVIDER posts+bar (centre aisle open) | SHOE rack + pairs | MINBAR-SIDE only (minbar untouched): kursi lectern + open mus'haf, 2 brass stands, sanctuary rails.
Refs: museum/glass-lamp.jpg (Tankiz 1310–1340) + mihrab/minbar-mihrab-03246.jpg (rod-hung row) + qibli-interior.jpg (rows/carpets) + lessons stops 5,6. Grounding PARTIAL: single lamp closeup (2nd view still GAP).
Changes: NEW modules/furniture.js buildFurniture(ctx)→qibliInterior (world fallback 0,2.9,150). 1 unit-box inst (121 wood parts), books 828 inst w/ palette, posts 26, shoes 48, lamps 7 lathe + 23 chains + 7 rings/flames, rod/lectern/stands meshes (14). Zero lights; ticker syncs lampGlass/flame to M.glassWarm.
Verify: node --check clean; runtime smoke (DOM-stubbed, three 0.170): host attach ✓, 14 meshes + 1067 inst, 0 lights, 0 casters, ticker runs; transient symlink removed (repo untouched).
Shots: PENDING wiring — main session adds maker + scripts/shot-dgpu.mjs ?view=4 (Qibli interior) vs qibli-interior.jpg.
Placeholders: none (enamel is stylized replica — declared, not fake-final).
Next: main session wires makers[] + ?view=4 shot; optionally close REFINE row 14 (furniture) on PASS.
