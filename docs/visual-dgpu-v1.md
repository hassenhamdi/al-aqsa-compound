# visual-dgpu-v1 — first true-dGPU validation (GTX 1650 Ti, ANGLE GL 4.5)
Goal: HUD-free dGPU shots of 5 views; compare vs references/*.jpg.
Refs: aerial.jpg, qibli-ne.jpg, qibli-interior.jpg (+chain/sabil/minaret).
Changes: main.js:274-310 (`setHUD`, `?nohud=1&view=N` instant-jump);
aqsaMosque.js:198,201 + vegetation.js:114 (`userData.placeholder` flags only).
Recipe note: Brave headless GPU proc segfaults (exit 139) on this box incl.
SwiftShader/Vulkan probes; worked: Playwright Chromium headed + D129 +
`--use-angle=gl` → `ANGLE (NVIDIA GTX 1650 Ti, OpenGL 4.5.0)`.
Shots (no HUD/markers verified): shots/dgpu-{aerial,dome-closeup,
qibli-facade,qibli-interior,dome-interior}.png — calls 498-1235, lights 7.
Verdicts: dome-closeup PASS (gold ribs, blue drum, arcade, Chain);
qibli-facade PASS (7-arch rhythm, lead dome, pavers vs qibli-ne);
aerial PARTIAL (massing ok, into-sun west flank hazes white);
interiors PARTIAL (structure ok; qibli floor voids white, Rock hotspot).
Placeholders flagged: qibli floor+carpet (lamp hotspot), olive canopy blobs.
SeedThree verdict: ADOPT technique only — offline Weber–Penn olive bake →
existing InstancedMesh (2-4 calls); DEFER engine (WebGPU-first, 380 MB).
Others: water→adopt Water.js-style cheap shader + local water-optics skill,
reject PBF; calligraphy→adopt CanvasTexture kufic, defer Troika (new dep);
furniture/garments→in-house procedural, defer external/sim.
Next: sibling lamp-balance pass (220/60 units), instancing pass (~500→150
calls), headed re-check of interiors.
