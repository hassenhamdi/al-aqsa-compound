# _skills/INDEX.md — selective forks ordered by task then quality
> Agents: read ONLY your task's row. No skill-invocation ceremony — skills are reference
> material; the task brief + AGENTS.md rule. Quality order = best first.

## Trees (current focus)
1. `_thirdparty/dryad/src/` (local clone) + `/home/hassenhamdi/open-tree.html` (local file) —
   PRIMARY. Real code on disk: colonization crowns, cluster sprites, SPECIES params.
2. `_skills/awesome/skills/threejs-procedural-vegetation/` — wind/foliage-normals theory.
3. `_skills/ghibli/threejs-procedural-vegetation.md` — stylized fallback only (we stay photoreal).
4. `dgreenheck/ez-tree` (npm, not vendored) — emergency fallback: bake-to-mesh.

## Stone / brick relief (W1, W8)
1. `apate` (owenyuwono, WebGL2 GLSL, local study via docs): POM walls+pavement, SPOM reveals/parapets, displaced hero-only. Cost table in its README.
2. `_skills/awesome/skills/threejs-parallax-occlusion-mapping/` — height-march theory.

## Water / fountain
1. `_skills/ghibli/threejs-webgl-realistic-water.md` — numbers that worked (r186 scene).
2. `_skills/awesome/skills/threejs-water-optics/` — analytic waves/caustics theory.

## Sky / day-cycle / night
1. `_skills/ghibli/threejs-day-cycle-lighting.md` + `threejs-ghibli-night-mode.md` + `threejs-night-lights-lanterns.md` — mined numbers.
2. `_skills/awesome/skills/threejs-atmosphere-aerial-perspective/` + `threejs-bloom/` + `threejs-exposure-color-grading/` — theory.

## Birds → pigeons
1. `procedural-animals` lib (npm `procedural-animals`, src: animal/registry/species/worker) — crow recolor white + crowd tier. r160+ OK.

## Camera (agents only)
1. `three-freecam` (npm, 1.8kB) — debug fly cam for shots/framing. Users keep OrbitControls.

## Tours / education
1. `_skills/ghibli/threejs-camera-guided-tour.md` — tour numbers.
2. `content/lessons.md` (project) — the lesson contract, overrides all.

## Performance / verification
1. `_skills/ghibli/threejs-webgl-performance-profiling.md` + `threejs-headless-visual-verification.md`.
2. `_skills/awesome/skills/threejs-visual-validation/` + `threejs-shadow-systems/`.

## Rejected (do not use)
- three-gtvbao (needs WebGPURenderer+r184; we are WebGL r170) · tidewater engine (custom WGSL)
- three-vat (needs three>=0.186) · full dryad/ez-tree engine imports · toon/anime-grade styles.
