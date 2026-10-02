# Al-Aqsa realism pipeline (fidelity / realism / quality constraints)
Source photos: ./references/ (10 direct .jpg). Units meters. three r170 ESM.

## Roles x repo skills
- R1 material-artist: awesome[procedural-materials, procedural-fields, parallax-occlusion-mapping] + vibe[threejs-procedural-materials]
- R2 architect: awesome[procedural-architecture, procedural-geometry] + vibe[procedural-architecture, scene-authoring(hand-place heroes), instancing-materials]
- R3 environment: awesome[procedural-vegetation, atmosphere-aerial-perspective, precipitation-surfaces] (dry Jerusalem: dust not rain)
- R4 lighting-TD: awesome[bloom, exposure-color-grading, image-pipeline, shadow-systems, screen-space-ambient-occlusion]
- R5 motion: awesome[procedural-animation, procedural-vfx, camera-direction] + vibe[motion-design] + conference[collision-rain pattern only for fountain mist, NOT wet ground]
- R6 optimizer/validator: awesome[visual-validation, shadow-systems] + vibe[optimization, visual-verification-gate, dev-lab-authoring] (headed screenshot, `node --check`, draw-call budget <=150, 1 light/minaret)

## Workflow (sequential, reuse subagent on connected context)
P1 materials/textures REALISM (reuse dome/qibli/minor builders) -> P2 geometry detail -> P3 vegetation/terrain -> P4 light/shader/post -> P5 animation/VFX/character/cine -> P6 validation/perf. One subagent at a time. Next task reuses same sessionID if same files.
## Budgets
- draw calls <=150, shadow-casters only massing, ribs/finials/windows/birds/leaves off
- metals need RoomEnvironment PMREM, DoubleSide arches, rib squash scale.y=riseK
- no WebGPU-only deps (fluids/glass/pathtracer offline only)
