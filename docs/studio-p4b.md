# studio-p4b — studio-lite toggles (9 labels, ext/int split)
Adapted register/show/solo/all/frame/get/bounds/dump + panel from
~/Projects/mosque-threejs (no import); zero sibling edits.
New modules/studio.js; main.js: import, buildStudio post-merge (§3c),
?solo param, #studio-panel in nohud CSS, T toggle, merge scopes
(chain/dome-int/qibli-int merge in place), int scopes never cast,
failed-merge buckets now enforce shadow policy, static shadow cache
(autoUpdate off; sun-move/size/warmup invalidation) — zero casters move.
Labels: platform, dome-ext/int, qibli-ext/int, chain, minor, minarets,
vegetation. Shots (dGPU, nohud): shots/studio-dome-int-solo.png
(solo=59 calls, interior only) + shots/studio-all-aerial.png (180 calls).
Perf: 186→180 aerial (scope split +12, shadow cache −33, policy fix −2).
Server 8099 pre-existed (shared) — left running.
Next: tracks/*.md, alignment audit, owner lamp-balance (Phase 3).
