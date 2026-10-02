# w8-glass — shared glass PBR + texture-audit coordination

Goal: glass that reads real under day-0/night-moderate rule
(docs/emissive-fix.md): transmission-feel via env+roughness+
thickness tint, zero WebGPU deps. Own file: modules/materials.js.
Refs: museum/glass-lamp.jpg (enamel lamp), qibli-ne.jpg (dark
day lattice), dome-int/* (drum glow), awesome procedural-materials
(spectral-glass: image-space path is OFFLINE-only — we fake it).
Changes (materials.js): stainedTex canvas 66-80; glassWarm 95 +
glassBlue 96 → MeshPhysical (dielectric metal 0, clearcoat .8,
ior 1.5, thickness/attenuation tint, bases emissive 0.0 — tween
in lighting.js:225-227 untouched); NEW glassClear 100 (lamp
globes, transparent .22, depthWrite false, OPT-IN); NEW
glassStained 104 (leaded lattice, qGlass palette+multiplier,
OPT-IN drop-in). Trim v2: env .85/.7 after drum-day halo read.
Shots (dGPU GTX 1650 Ti, cams verified, favicon 404 only):
| View | Ref | Verdict | Evidence |
| dome ?view=1 noon | temple-mount-V4 | PASS* | gold/tiles read; *roof white = pre-existing glare row |
| drum closeup noon 29m | marble-detail | PARTIAL | insets halo-white <30m — bloom-threshold ownership, not albedo |
| dome ?view=1 night | 2018-01 | PASS | drum windows warm moderate, ribs dark, lamps kept |
| qibli ?view=3 noon | qibli-ne | PASS | 121 windows dark, lattice + honey courses read |
| qibli lattice night 25m | qibli-ne | PASS | amber/green panes moderate, no blowout |
Texture coordination (owners, albedo/roughness audit vs refs):
| owner | finding | ask |
| dome | drum glass untextured flat → halo-prone | adopt glassStained or keep; post threshold first |
| qibli | qGlass 137 windows duplicate stained palette | 1-line swap → M.glassStained + keep ticker (aqsaMosque.js:510) |
| dome/qibli/minarets | lamp globes opaque warm | OPT-IN M.glassClear + ticker gain 0.5x glassWarm |
| struct | amberGlass 1.8 static (flagged emissive-fix) | wire to glassWarm tween or swap glassClear |
Placeholders: none new (buckets/benches stay struct-owner).
Next: main session applies docs/w8-postspec.md §2 deltas, then
re-shoots drum-day + lattice-night; owners adopt glassStained.
