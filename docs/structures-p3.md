# structures-p3 — missing cloister massing (blockout→form, no lookdev)
Audit vs plan.jpg/aerial.jpg: museum block, Ashrafiyya/library face, madrasa
strips, Qattanin muqarnas portal, bench rows, lantern posts all missing;
portico ran unbroken through gate axes. Qibli untouched (Phase 3a).
Built — minorDomes.js STRUCT annex (fits: sabils/mawazin/lamps live here):
helpers socket/newBag/structBucket/portalBayX/stripRun (~330-420);
museum 50×10×22 + portal/sockets (~424); Ashrafiyya 30m ablaq+loggia+
portal+hood (~446); strips S1/S3/N1/N2 + Silsila/Nazir/Rahma bays (~468);
Qattanin pylons+recess+5-tier hood+steps, bay i=14 zero-scaled via
openPorticoGap (pinned assumption, platform-owner review) (~484);
20 benches + 10 lantern posts (5 InstancedMesh) (~510); 3 self-merged
buckets placeholder-flagged → merge-pass skips, shadows kept (~560).
POI: museum, Ashrafiyya, Tankiziyya, rows, Qattanin (+6). No lights.
Shots (verbatim scripts/shot-dgpu.mjs, Chromium D129 NVIDIA, HUD OFF):
struct-p3-aerial (197 calls, +11 vs 186) + struct-p3-cloister (view=6,
lanterns/Al-Kas read) + struct-p3-portal (custom axis: ablaq/loggia/
hood/door/steps read; door sightline clear).
Verdicts: aerial vs plan PASS (mass at shared positions, no regressions);
portal vs sabil.jpg language PASS (form rhythm); portico-gap PARTIAL
(construction-pinned, needs owner confirm); cloister PARTIAL (west faces
out of view=6 frame, covered by portal shot).
Placeholders: 3 buckets + bench/lantern inst (form-only); REFINE rows added
(cloister lookdev, gap surgery). Compliance: Chromium-exe batch first-try
OK on DISPLAY=:1 (my earlier xvfb crash was runner-specific, not the recipe).
Phase-4 handoff: TEX via sockets (door/loggia/hood/vaultstart); Hadid/
Ghawanima axes have no strips (open wall walk — by design); east/south
edges stay open per plan.
