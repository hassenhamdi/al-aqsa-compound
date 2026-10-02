# MCP usage in this build (L6)

> Server registrations live in `.kiro/mcp.json`. All bridge calls below were
> READ-ONLY (scene/renderer introspection, web lookup). No scene mutation, no
> credentialed writes, no sandbox escape: `threejs-devtools-mcp` attaches to the
> local page bridge; `tavily`/`exa` only fetch public web content.

## threejs-devtools (primary — every visual gate)

- `renderer_info` → `renderer.info.render.calls`, light count, cam — logged by
  `scripts/shot-dgpu.mjs` on every capture; draw-call budget evidence (215 aerial
  vs ≤150 target, REFINE.md).
- `material_list` / `texture_list` → PBR audit passes (dome gilt, qibli ashlar,
  glass palettes in `docs/w8-glass.md`); found duplicated stained/clear palettes.
- `shader_list` → confirmed POM/SPOM stone + water ripple programs compiled once
  (no per-frame recompile).
- Scene-graph reads (`__studio.list` tri counts, `frame()` bounds) drove the
  align-p4b audit (`docs/align-p4b.md`): slab/terrace/6 gates PASS; Maghariba,
  Rahma, Ascension, Al-Kas flagged as owner quests.

## tavily + exa (grounding rule, AGENTS §8)

- Olives → SeedThree technique (Weber-Penn bake → InstancedMesh); recorded in
  `docs/olive-dryad.md`. Furniture/garments/calligraphy → three examples/fonts
  candidates (REFINE.md rows). Water/physics → simple shader + `three/addons`
  (no heavy sim). Each lookup recorded URL + what was borrowed in its doc.
- No keys are stored in-repo; servers run with user-scope env only.
