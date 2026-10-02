# w8-postspec — post pipeline spec (main session applies; composer/main.js untouched by W8)

## 1. Current graph (verified in code, not changed here)
RenderPass → UnrealBloomPass → OutputPass (main.js:271-277). Order
is correct per image-pipeline skill: bloom on linear HDR BEFORE
tone map; OutputPass owns the single ACES tonemap + sRGB conversion
(lighting.js:28-29 sets ACES; materials never tonemap). Exposure is
hand-tuned per preset (0.6-0.88, lighting.js:8-12) with NO luminance
meter — accepted: fixed viewpoints, keep hand-tuned, do NOT add a
64x36 meter (cost without benefit at this scene scale).

## 2. Bloom deltas (spec for main session — evidence: w8 drum-day halo,
emis-night terrace wash; noon white-sky wash pre-exists in
dome-tex-p4a-closeup-noon.png, NOT a W8 regression)
Key fact: threshold acts on linear HDR pre-OutputPass, so it is
exposure-independent — per-preset `strength` is the right lever,
static threshold the wrong one to keep retuning.
- main.js:273-275: `new UnrealBloomPass(res, 0.35, 0.6, 0.82)` →
  `new UnrealBloomPass(res, 0.35, 0.4, 0.9)`: radius .6→.4 (tighter
  halo around <30m window insets), threshold .82→.9 (sunlit stone
  ~1.0+ stops blooming; night emissive 1.58 still blooms).
- lighting.js:8-12 preset `bloom:` noon 0.22→0.15, night 0.55→0.45;
  dawn 0.30 / sunset 0.35 keep. Single-node ownership stays — NO
  selective/dual bloom pass (substitution-restore cost unjustified
  at 150-206 calls on 4GB dGPU).
- Verify: re-shoot w8 drum-day (insets dark) + lattice-night (panes
  moderate, terrace wash down) + emis trio (day-0/night-moderate
  holds). If drum insets still halo at 29m, tighten radius →0.3
  before touching any material.

## 3. AO approach within WebGL r170 (no new deps, ≤26-light budget kept)
NO fullscreen SAO/SSAO pass: three r170 SSAOPass is full-res sampled
(heavy at 1280x800 beside 150+ calls) and fails the skill's halo /
depth-discontinuity conditions on our arch/soffit geometry; GTAO is
not in r170 addons. Instead, zero-runtime-cost grounding:
- (a) baked cavity: darken stone/marble canvas joints + arch soffit
  strips in owner TEX blocks (dome/qibli/struct) — same canvases,
  no geometry (apate eco: POM walls+pavement, SPOM reveals/parapets,
  displaced hero-only — glass/AO get ZERO geometry budget).
- (b) contact discs: radial-gradient dark decals under lantern posts,
  benches, museum/madrasa masses (1 instanced mesh, multiply blend,
  no lights). (c) optional Phase-2 experiment only: SAOPass behind
  the low-quality gate, half-res — never default.
- Verify: terrace-court ?view=2 at sunset — base joints ground the
  masses without screen-space halos.

## 4. Tonemap (no change)
Keep ACESFilmic + OutputPass last. Exposure stays hand-tuned;
re-verify bloom §2 after ANY exposure edit (they compose visually
even though extraction is exposure-independent).
