# w7-water — Al-Kas water + fountain geometry completion
Goal: realistic basin water (ripple normals, Dome mirror) + missing fountain detail, zero lights.
Refs: alkas-2008.jpg (taps/moldings/bowl/fence), alkas-reflection.jpg (gold Dome in basin), fountains.jpg (Qasim canopy); skills ghibli realistic-water (numbers) + awesome water-optics (analytic order, declared fallback).
Changes — NEW modules/water.js: ShaderMaterial water (normal-only surface), 3 analytic trains + drip rings, 48² CPU wave-eq sim (drips, no PBF), Beer-Lambert constant-depth fallback (0.55/0.12 m), Schlick F0 0.02, sun glints, Dome-mirror lobe, fence stripes, foam; live sun/fog/preset uniforms; noMerge discs. minorDomes.js ONLY fountains: Al-Kas moldings/plinth/8 chrome taps (merged), lathe bowl+dish+vase+spout, bowl/dish water discs, scroll fence (posts/spears/scrolls/rings/rails merged), seat curb; Qasim fascia+eave trim+8 roof ribs+brackets+dome molding (core untouched). main.js: +import/1 maker line.
Shots (dGPU D129, nohud, cam-verified): w7-alkas-closeup (grazing, Dome behind) | w7-qasim (east kiosk) | w7-wide (?view=0).
| View | Ref | Verdict | Evidence |
| alkas closeup | alkas-reflection | PASS | contained gold Dome lobe on water, sky at grazing |
| alkas detail | alkas-2008 | PASS | taps/moldings/scroll fence/seat curb read |
| qasim | fountains.jpg | PASS | ribs/eave/posts read (verified on east kiosk) |
| wide | plan/aerial | PASS | masses intact, no regression vs dgpu-aerial |
Placeholders: none new. REFINE: fountain-water→done; +Qasim Pasha siting row (buried in terrace box, struct-owner issue, not moved).
Next: widen lobe falloff / damp drip-ring zebra at grazing; mist sprites (owner call).
Note: sibling atmosphere/material edits landed mid-task; whiteout aerials were their transient state — final wide matches baseline. lights=7, calls ~140-194, fps 60, node --check clean.
