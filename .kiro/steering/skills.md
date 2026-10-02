# Steering — skill routing (L2)

> Adapted from `_skills/INDEX.md` (selective forks ordered by task then quality).
> Read ONLY your task's row; skills are reference material.

- Base: `threejs-scene` skill (proportions, dome/rib/semi-dome recipes,
  DoubleSide arches, metals-need-env, 1-light-per-minaret, governor). Local:
  `_skills/awesome/skills/`.
- Trees: `_thirdparty/dryad/src/` + `/home/hassenhamdi/open-tree.html` PRIMARY
  (colonization crowns, SPECIES params); awesome `threejs-procedural-vegetation`
  theory; ghibli vegetation = stylized fallback only (we stay photoreal);
  ez-tree = emergency bake-to-mesh fallback.
- Stone/brick: `apate` (WebGL2 GLSL study) POM walls+pavement, SPOM trim,
  displaced hero-only; awesome `threejs-parallax-occlusion-mapping` theory.
- Water: ghibli `threejs-webgl-realistic-water` numbers; awesome
  `threejs-water-optics` theory. Sky/night: ghibli day-cycle + night-mode +
  lanterns numbers; awesome atmosphere/bloom/exposure theory.
- Birds→pigeons: `procedural-animals` (crow recolor + crowd tier, r160+ OK).
- Tours: ghibli `threejs-camera-guided-tour` numbers; `content/lessons.md`
  overrides all. Perf/verify: ghibli performance-profiling + headless-verification;
  awesome `threejs-visual-validation` + `threejs-shadow-systems`.
- Camera debug: `three-freecam` (agents only; users keep OrbitControls).
- REJECTED (do not use): three-gtvbao (needs WebGPURenderer+r184; we are r170),
  tidewater engine (custom WGSL), three-vat (needs three>=0.186), full
  dryad/ez-tree engine imports, toon/anime-grade styles.
- Web lookup allowed when fidelity blocked (olives → SeedThree; furniture/text →
  three examples/fonts; water → simple shader + `three/addons`); record URL +
  what was borrowed in the doc.
