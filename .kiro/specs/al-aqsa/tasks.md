# Al-Aqsa Compound — Tasks (L1)

> Source: `PIPELINE.md` P1–P6 + `tracks/*.md` status lines. `[x]` = verified in
> repo; `[ ]` = open quest (owner-confirmed, positions frozen until then).

## P1 materials/textures (R1)

- [x] Dome ablaq + gilt PBR vs 2018-01 (`docs/dome-tex-p4a.md`)
- [x] Qibli ashlar + arcade (`docs/qibli-tex-p4c.md`); struct tex (`docs/struct-tex-p4d.md`)
- [x] W1 stone POM/SPOM cost table (`docs/w1-stone.md`); W8 glass/postspec (`docs/w8-glass.md`, `docs/w8-postspec.md`)
- [ ] Terrace marble glare trim (REFINE.md — R1, low)

## P2 geometry (R2)

- [x] Structures P3 massing: dome/qibli/minor/minarets/platform (`docs/structures-p3.md`, `docs/dome-p3b.md`, `docs/qibli-p3a.md`)
- [x] W2 infill + stairs fix (`docs/w2-infill.md`, `docs/stairs-fix.md`)
- [ ] Gate placement audit: Maghariba + Rahma (platform owner)
- [ ] Ascension + Al-Kas siting confirm (minor owner); apex quest (dome owner)

## P3 vegetation/terrain (R3)

- [x] Olive placement PASS vs plan (`docs/olive-p2.md`, `docs/olive-fresh.md`)
- [x] Dryad/open-tree bake core ported (`docs/olive-dryad.md`, `modules/opentree.js`)
- [ ] Phase 2 SeedThree card bake (technique-only, no engine import)
- [ ] Cypress perimeter re-add as 1 instanced mesh (trivial)

## P4 light/shader/post (R4)

- [x] Sky/day-cycle/night presets + emissive fix (`docs/sky-p5a.md`, `docs/emissive-fix.md`, `docs/sunglow-fix.md`, `docs/sun-audit.md`)
- [x] Shadow systems + W7 water (`docs/w7-water.md`); poles audit (`docs/poles.md`)
- [ ] Drum-glass bloom-threshold adoption (main, low)

## P5 animation/VFX/education (R5)

- [x] Motion + freecam UI + W6 pigeons + W4 celestial (`docs/w3-motion.md`, `docs/w3-freecam-ui.md`, `docs/w6-pigeons.md`, `docs/w4-celestial.md`)
- [x] Education 12 POIs + tour (`docs/edu-p5c.md`); W5 furniture (`docs/w5-furniture.md`)
- [ ] Crowds VAT bake (needs three>=0.186 check — currently r170, blocked)

## P6 validation/perf (R6)

- [x] Perf P1/P2 dGPU gates (`docs/perf-p1.md`, `docs/perf-p2.md`, `docs/visual-dgpu-v1.md`)
- [x] Align P4b audit all tracks; studio P4b registry (`docs/align-p4b.md`, `docs/studio-p4b.md`)
- [x] FPS governor + gates/enter passes (`docs/fps-p6.md`, `docs/gates-p4e.md`, `docs/gate-final.md`)
- [ ] Draw-call consolidation to ≤150 (med); Kiro-exam evidence pack (this tree)
