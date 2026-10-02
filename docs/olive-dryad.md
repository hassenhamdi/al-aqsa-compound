# olive-dryad — official dryad core vendored + olive lookdev
Goal: replace reimplementation with OFFICIAL code (scope change).
Vendored (modules/dryad/, MIT verbatim + headers + LICENSE-dryad):
rng/allometry/colorRamp/skeleton/proportions/foliage/leafTexture.
Viewer/HDRI/leafMesh NOT imported; our InstancedMesh + wind path stays.
Pipeline (vegetation.js): olive genome → buildSkeleton →
solveProportions → trunk rings; generateFoliage (SoA 1387) →
stride-sampled anchors → expandClumpsToCrossedCards → quads; sprite =
makeLeafClusterTexture + olive grade (desat 55% — nursery green burns
in our sunset). Olive genes: trunkHeight .42, crownStart .45, taper .5,
leafSize 1.3, leafWidth .5, leafLength .25, pigment .23, aridity .5.
Adopted from source: body+apical anchors, ±30% size, pipe/droop radii,
exposure tint, alphaTest .5, flex^1.5 + traveling phase + flutter.
Deferred: normal maps, canopy-blend, translucency, skeletal bones.
Shots (verbatim, D129, cams exact): closeup PASS (silvery tufts,
gnarled limbs, no floaters/planes); mid PASS (garden rhythm, 106-127
calls, 7 lights). Rejected en route: sparse 24-anchor + neon sprite.
Calls 3, placements unchanged, shadows trunk-ON/cards-OFF.
Next: skeletal wind needs three>=0.186-grade wiring (future).
SOURCE SWITCH (user order): open-tree math INSTEAD of dryad — modules/dryad/
removed, no dead imports (clone left untouched). Ported core:
modules/opentree.js (math, Skeleton, colonize, buildModel, SPECIES + olive
preset: retuned oak, H4.6, sparse envelope; NOT ported: GL/atlas/forest).
Trunk rings from node par-links + pipe radii; 256 leafData anchors × 2
crossed quads; own olive sprite/wind kept. Oak bar is the density bar.
DEFECTS FIXED (user side-by-side): foliage-absent → 256 anchors + dense
sprite + ×3.4 cards (was 96×2.2 over 4%-cover sprite); hexagon trunk →
TRAD 8; thorn spikes → pruned + leaf-covered; washout → envMapIntensity
0.25 (was default 1.0 = 4× IBL). Closeup reframed 2.7→7 m (4 m crown).
Verdicts: closeup PASS (full crown, limbs through leaves, dappled);
mid PASS (grove rhythm, fps 53, 122 calls). Oak-bar delta: per-tree
clusters still ~60× fewer — discrete tufts at closest range vs fused
mass; olive airiness makes this acceptable. No other species eyeballed
(oak retune verified sufficient).
Oak bar (references/trees/oak-open-tree.png, 14.3 m English Oak, summer):
hero carries ~16k fused clusters with limbs reading through gaps.
DIRECT PORT (user order, this session): open-tree painters verbatim —
drawCluster oak layout (stem + 4 branches + ~25 profile leaves),
PROF.oak ripple, midrib + side veins, jitterCol .25, oak bark fissure +
albedo math as 1 m canvas tile; olive palette shift ONLY (desat .5 +
lift ×1.28). Sun-model comp: bark albedo ×1.6 (their sunE~20 vs ours
~3). VIEWS/sky/shadow numbers filed in docs/html-port.md (lighting.js
untouched). Closeup now reads continuous crown (was starburst tufts);
mid grove PASS (124 calls, fps 60, zero regressions).
