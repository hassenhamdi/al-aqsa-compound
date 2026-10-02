# sky-p5a — night sky earns the crescent; 4 presets consistent, ≤200 calls
Goal: moon crescent + star field + volumetrics-lite clouds, no blowout,
zero new real lights, buildings untouched. Own files only (lighting,
atmosphere + 3-line ?preset= in main.js boot params).
Changes — lighting.js: moon/halo canvas sprites parked low NE (elev 11°,
azim 40°, 1500 out; maxPolarAngle forbids framing higher); bright star
layer (130); PRESETS += moon/cloud/cloudOp; sky-sun sinks to elev -14
by stars channel (smooth dusk, Sky shader goes dark, key light stays
as moonlight); lerp snap (1e-3/hex) so sun settles exactly; dawn
exp .8→.72 sun 1.7→1.5; noon exp .95→.88 hemi .7→.6, cloudOp .5→.4
(latter unverified live, safe direction); night clouds 0x1c2333/.30.
api.state exposes live cur. atmosphere.js: puff-blob cloud texture,
per-preset tint/opacity, mist/dust + flag-cloth night dimming.
Shots (dGPU, nohud): sky-p5a-{dawn,noon,sunset,night}.png +
sky-p5a-moon.png (horns-up crescent + halo + stars: PASS).
Verdicts: night PASS (dark sky, 2 star layers, warm Dome, lamps);
sunset PASS (unchanged hero); dawn PASS (modeling restored, hazy top);
noon PARTIAL (ground readable, sky bright haze).
Calls settled: 184/185/185/189 (night +5 = stars2/moon/halo by design).
Lessons: shadow cache needs settled sun — batch waits 7s→12s; 7s shots
read +26 (unsettled, not real). ?preset= added for preset+custom-cam.
BLOCKED: noon re-shot (DISPLAY contended, rAF stalled ×3; evidence =
settled batch). Server killed after.
Next: turbidity-per-preset for noon blue; Phase-5 gate re-check.
