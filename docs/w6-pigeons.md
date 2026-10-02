# W6 pigeons — white courtyard life

Goal: white pigeons (perched/pecking/idle + wheeling flight flock), size-correct
vs 1.7 m human; 9 existing dark birds in atmosphere.js untouched.
Refs: `procedural-animals` crow pattern borrowed as technique (no new dep, §6);
positions from platform.js (pave y=2.06, parapet top 3.5) + minorDomes.js
(Al-Kas rim 3.28 @ (20,30), Mawazin beam 6.85).
Changes: NEW `modules/pigeons.js` only — `buildPigeons(ctx)`; 26 ground +
12 flyers; 2 InstancedMesh (2 draw calls); GPU flap via onBeforeCompile
(aWing/aPhase/aAmp + uPigeonTime); MeshBasic vertexColors; zero lights,
no shadows, frustumCulled=false; seeded RNG; night-dim via lighting state.
WIRE-UP (main session): `import { buildPigeons } from './modules/pigeons.js'`
+ makers row `['waking the pigeons…', () => { buildPigeons(ctx); }]` after
atmosphere; group `pigeons` is merge-pass-safe (not in massGroups).
Shots: `/tmp/opencode/pigeon-test.png` (harness: rim perches PASS, scale PASS);
`shots/courtyard-flock.png` = pre-wire framing baseline (Al-Kas + Dome).
Verdict: geometry/shader verified on dGPU (ANGLE GTX 1650 Ti, calls=5 in
harness); in-scene pigeon pixels pending wire-up.
Placeholders: none. Next: main wires in, re-shoot courtyard-flock with flock.
