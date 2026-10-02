# whiteout-fix — sunset aerial bleach triaged, warm gate look restored
Correction: w4-sunset PASS was graded vs already-bleached w1/wave shots, not
gate-aerial (gnd-band 177). Cause: albedo/materials brightened after gate by
other owners (mtime evidence) while sunset lights stayed gate-level → linear
HDR overhot; into-sun elev-6 sky + bloom r.6 smear + warm fog stacked to milk.
Fix (lighting.js only): sunset sun 2.2→2.0, exp .78→.72, fogDen .0019→.0013,
fog →0xc68c58, mie .006→.0025 (glare lobe), ray →1.8, cloudOp →.55; new env
IBL ch (noon .85 / sunset .7, night 1.0 kept = verified look); bloom per
w8-postspec §2 driven per preset: thr .9 / rad .4 all, noon .15, night .45
(spec-convergent, no fight if main session applies constructor). Zero geometry
or material edits to others' files. node --check clean.
Proof (?view=0, 12s settle): whiteout-sunset gnd 208→175 (=gate 177), clip
6.7→2.6%, warm gradient back; whiteout-sunset-dome PASS (gold/tiles/terrace
intact, richer); whiteout-noon control clip 12.5→0.0% (gnd 218 PARTIAL: sun
3.0 + bright albedo needs albedo owner; closeups already PASS per W4).
Note: aerial calls 220 (was 193) = other owners' new geometry; mine add zero.
Next: noon/high-sun albedo rebalance belongs to materials/platform owners.
