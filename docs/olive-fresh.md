# olive-fresh — clean rebuild of the olive grove
Goal: new `modules/oliveGrove.js` (`buildOliveGrove`, standalone:
three + `opentree.js` only), 64 olives, oak-bar density, zero
dull-shot defects (bare/spikes/facets/washout). `vegetation.js` untouched.
Refs: AGENTS.md §§3,4,6,7,8; `_skills/INDEX.md` Trees row
(`open-tree.html` colonization + cluster sprites; dryad rejected —
needs WebGL2 engine); `references/trees/oak-open-tree.png` (density bar).
Changes — `modules/oliveGrove.js`: placements:56 (52 E x62..128 +
12 N, KEEP-outs, GY 2.0); trunk rings:72 (TRAD 10, prune 0.022,
capped ends); crown:166 (320 leafData anchors ×2 crossed quads);
fresh lanceolate sprite:212 (grey-green + silver, fruit dots);
bark tile:291 (sun-comp ×1.6); wind:326; builder + D.poi/tickers:340.
D.poi gets 64 `{name,ar,kind,pos}` olive entries; sway → D.tickers.
Shots (dGPU GTX 1650 Ti, harness sun3+hemi+RoomEnv, INFO.cam verified):
`shots/olive-fresh-closeup.png` (cam–tgt 6.95 m ≈ 7 m) PASS —
dense blades, smooth capped limbs, no spikes/facets/bare; first
pass washed out (palette too light), fixed by darkening to ~[64..96].
`shots/olive-fresh-mid.png` PASS — grove rhythm, fused grey-green
crowns, limbs through gaps. Calls 3 (grove 2 + ground), lights 0 added.
Oak-bar delta: ~640 clusters/tree vs oak ~16k — discrete olive
airiness at closest range, fused by 7 m+. No placeholders. Harness
`olive-harness.html` removed after capture.
Next (main session): wire `buildOliveGrove` in, retire/keep
`vegetation.js` olives to avoid double planting.
