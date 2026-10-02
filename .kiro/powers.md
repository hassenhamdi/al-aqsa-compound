# Powers used in this build (L5)

## Installed / referenced

| Power / pack | What it gave this build | Where it lands |
|---|---|---|
| `threejs-scene` skill (base) | Dome/rib/semi-dome recipes, DoubleSide arches, metals-need-env, 1-light-per-minaret, governor pattern | All structure modules; steering `skills.md` |
| awesome skills pack (`_skills/awesome/skills/`, 20+ skills) | procedural-materials/fields (PBR/stone), procedural-architecture/geometry (arches/muqarnas), procedural-vegetation, bloom/exposure/image-pipeline/shadow-systems (post), procedural-animation/vfx/camera-direction (motion), visual-validation (shots) | `PIPELINE.md` R1–R6 routing; per-doc refs |
| ghibli forks (`_skills/ghibli/`, 8 files) | Mined numbers: day-cycle lighting, night-mode, lantern values, realistic-water params, camera-tour numbers, perf-profiling + headless-verification | `modules/lighting.js` presets; `docs/sky-p5a.md`, `docs/w7-water.md` |
| vibe-kit (`_skills/vibe/`) | Hand-place heroes, instancing-for-repeats, asset-optimization | Vegetation instancing; draw-call pass |
| img2obj refs (img2threejs/img2threejs, vinhhien112/img2obj) | Prop workflow demos (Lantern House, Autumn Tree, Tower Ship) | AGENTS §8 prop pipeline |
| SeedThree via `_thirdparty/dryad` + open-tree.html | Colonization crowns, SPECIES params → `modules/opentree.js` olive bake | `docs/olive-dryad.md` |

## Registry-style entry (our published power — Bonus 2)

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "al-aqsa-lessons",
  "version": "1.0.0",
  "description": "Twelve-stop interactive sanctuary tour (SEE/BUILD/HISTORY/LESSON) plus the studio-lite part-registry method: register/show/solo/frame, owner-per-track, dGPU shot discipline.",
  "author": { "name": "al-aqsa-compound" },
  "keywords": ["three.js", "education", "tour", "studio-registry", "instancing", "visual-validation"]
}
```

Full manifest: `my-power/al-aqsa-lessons/plugin.json`.
