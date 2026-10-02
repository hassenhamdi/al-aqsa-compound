# olive-p2 — Weber–Penn bake: blob canopy → gnarled trunk + 5 leaf-cards
Goal: replace blob canopy (REFINE olive row) with one offline-baked olive
reused by existing InstancedMesh; keep ~64 placements (x62..128 + N patch).
Refs: SeedThree technique (weber-penn.js skeleton/rings/phyllotaxy/tropism —
re-implemented, engine NOT imported); three-vat (VAT needs three>=0.186,
we are r170 → deferred); procedural-vegetation skill (cards, petiole wind).
Changes — vegetation.js: `bakeOliveTrunk` (54; L0 flare/flute/twist + 6
scaffolds golden-angle + 24 twigs, 1084 tris, aSway attr), `bakeLeafCards`
(199; 5 alpha cards at twig tips, hinge weights), `oliveSprigTexture`
(249; fan sprigs + fruit dots canvas), `windify` (296; onBeforeCompile gust,
shared uniform via D.tickers). Placements/KEEP untouched. `leafCards: 5`,
`calls: 3`, shadows trunk-ON/cards-OFF, `placeholder` flag kept (371).
Spikes: SeedThree ADOPT-technique-only (WebGPU-first, 380MB — never in
realtime); three-vat REJECT on r170 peer-dep (no npm dep added, main boot
untouched); wind = shader fallback (trunk 0.035 / leaf 0.12 amp).
Shots (Brave headed D129 NVIDIA, ?nohud=1, HUD OFF): shots/olive-p2-closeup
(mid trees read gnarled-grey + grey-green crown; cards flatten only <3m),
shots/olive-p2-aerial (garden rhythm kept, zero regressions: 186 calls =
perf-p1, audit vegetation inst:3 cast:1, lights 7, 0 boot errors; 404 is
favicon only). Headless gate: 620/620 outward winding, NaN-free.
Verdicts: closeup PARTIAL (card flatness <3m, flagged honest) / mid PASS /
aerial PASS. v1 failed twice honestly (baobab trunk, grass-blade cards).
Placeholders: leafInst.userData.placeholder (closeup limit, not faked).
Next (P3): crossed 2nd card set or impostor LOD for <3m; revisit VAT only
with a three>=0.186 upgrade (main-session decision).
