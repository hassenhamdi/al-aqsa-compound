# emissive-fix — windows dark by day, warm by night, metals never glow
Audit: glassWarm (was 2.0 base/2.6 night), glassBlue (.9/1.56),
goldTrim (.35/.85 night — ribs glowed), aqsa qGlass 1.7 static,
amberGlass 1.8 static, grille .4, crescent pulse (intentional).
Fix (own files): materials.js bases → 0.0 all three; lighting tween:
glassWarm = max(0,e−.5)×.75 (noon 0, night 1.58), glassBlue = 0
always (also the Al-Kas water disc — dark water correct day+night),
goldTrim = 0 always (env does the work). aqsa qGlass (137 windows)
wired to tween via 1-line ticker (map preserved; authorized cross-edit).
Shots (dGPU): emis-noon-facade (121 windows dark ✓), emis-night-facade
(warm moderate ✓, lamps kept), emis-night-dome (ribs dark ✓, drum
windows warm ✓). node --check clean. Server mine — killed after.
Flagged (owner, untouched): amberGlass 1.8 (lanterns glow at noon),
grilleMat .4 (subtle), goldConch clone .35 (mihrab accent, fine).
