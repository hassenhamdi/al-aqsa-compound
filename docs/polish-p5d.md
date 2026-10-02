# polish-p5d — lamp balance, shadow cache, motion, noon haze
Own files only (lighting.js); no geometry/material sibling edits.
1. Lamp balance (both halls × 4 presets, 8 shots p5d-qi/di-*):
lamp channel 14/4/7/14 → 10/3/5→7; lampD y 11→13.5 (softens Rock);
night exposure .65→.60. Result: Rock grey-beige modeled (was void),
qibli columns graded (was clipped), carpet/chandelier/mosaic intact.
Dome chandelier already 16 (qibli 220→36 lesson applied by owner).
Sunset rock stays hot (direct W-arch sun) — noted, not lamp-caused.
2. Shadow cache: settled calls prove it (102-121 int, 184-189 ext);
mid-transition +26 was unsettled sun, not a bug (waits 7s→12s).
Stale-shadow risk none: sun-move/size/warmup invalidation intact.
3. Motion: zero `new THREE` in any tick (grep); crescent pulse
(2.9 s), bird matrices, flag verts, mist/dust, olive windU all live;
batches error-free. Visual pair-check deferred (stills can't show it).
4. Noon haze: turbidity-per-preset landed (noon 6→3.5, driven in
apply, lerped+snapped). Sky still bright — PARTIAL stands; follow-up:
rayleigh-per-preset or sky-model swap (out of scope).
Shots: p5d-qi/di-{dawn,noon,sunset,night} + sky-p5a-noon, dGPU nohud,
cams verified, 60 fps. node --check clean. Server shared — left on.
Next: Phase-5 gate (qibli-int solo, motion pair-check, finial note).
