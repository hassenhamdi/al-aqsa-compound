# w4-celestial — day sky from html-port sun, full+thin-crescent moon, wind clouds
Goal: html-port sun geometry; full moon + thin new-month crescent; wind-driven
clouds; star shimmer; zero wrong-preset glow. Own: lighting.js, atmosphere.js.
Refs: docs/html-port.md (VIEWS sun), docs/emissive-fix.md (day-0 rule kept),
_skills/ghibli/*night-mode (disc ≤1.0, halo carries glow), *day-cycle (horizon falloff).
Changes — lighting.js: PRESETS sun dawn 24/110, noon 55/170, sunset 6/250
(html-port morning/midday/golden; azim E→W sweep); exposure 1.0 REJECTED (other
chain: auto-key+AGX — here clips 28.7%, kept verified .72/.88/.78); noon rayleigh
2.2→1.0 + fogDen .0011→.0008 (clip 26.6→12.5%); fullMoonTex (0.7 gray + maria,
was white blob); crescent bite r62@(128,76)→r68@(128,118) (was half-moon thick,
now ~24px sliver, horns to y≈123); halo cool silver .5α/260px/0.28 (was warm
.85/420/.55 brown-bleed); setMoonPhase (map swap, 0 new calls); hero-star shimmer.
atmosphere.js: gust=(.55+.45·noise)·(wind/.35), wind .35 default, setWind API;
clouds drift×gust + bob; flags/mist/dust wind-scaled. main.js: ?moon= (2 lines,
?preset= precedent) for phase captures. No new real lights (4 ctors); calls ≤193.
Shots (dGPU, 12s settle): w4-dawn/noon/sunset/night (aerial) + moon-full/crescent
+ noon-dome closeup. Verdicts: dawn PASS; sunset PASS; night PASS; full PASS
(maria, tight halo); crescent PASS (thin horns-up); noon PARTIAL aerial (high-sun
albedo+IBL haze, pre-existing) / PASS closeup (gold/tiles/shadow, glass dark ✓).
Glow-kill: moon/halo/stars opacity 0 at all day presets (pixel-verified clean).
Flagged (not mine): finial crescent pulse 0.3–1.2 day+night (domeOfRock.js:280);
amberGlass 1.8 static noon glow (minorDomes.js:441); white unlit context masses.
Next: aerial-noon haze is albedo/IBL, needs albedo owner; tour beat for crescent.
