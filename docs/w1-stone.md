# w1-stone — POM ashlar walls + pavement (platform.js only)
Goal: realistic 3D stone per apate pattern: POM retaining walls+pavement,
SPOM reveals/parapets, displacement hero-only (=none, relief ≤7cm).
Refs: aerial/aerial-silwan-kidron.jpg (honey walls, pale court, dusty slopes),
aerial.jpg, plan-1890 (massing); skill threejs-parallax-occlusion-mapping
(march+refine, height normals, light-ray self-shadow, cost tiers).
Changes (modules/platform.js): STONE_COMMON/ashlarH/stonePOM (~1-120:
world-space height-march onBeforeCompile, mortar AO+self-shadow, sun ticker
lazy-binds DirectionalLight, zero new lights); local clones wallMat (12+5
steps, Herodian 1.15m courses low / 0.75m up, drift+boss) paveMat (8+4,
1.8m slabs, no stagger) trimMat (SPOM parapets/gates/gables); base
0x8a8272→0xa79b7c, ridge→0x7c7f5e; detail fades 90→320m (anti-shimmer).
Shared M.* never mutated. `node --check` clean.
Shots (verbatim scripts/shot-dgpu.mjs, D129, INFO.cam verified):
aerial cam [230,150,270] calls 193; wall cam [60,14,300]→[0,-2,226] calls 191,
lights 7 (404 = favicon only).
| View | Ref | Verdict | Evidence |
| wall closeup | silwan-kidron walls | PASS | staggered bossed courses + mortar relief read |
| aerial | silwan-kidron | PARTIAL | massing/pale court/dusty ground match; sunset haze bleaches E grove (pre-existing preset, not stone) |
Placeholders: none (no fake detail; displacement deferred to WW hero).
Next: WW hero displaced closeup; terrace marble glare is sibling (R4).
