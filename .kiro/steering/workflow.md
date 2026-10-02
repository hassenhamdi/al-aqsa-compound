# Steering — studio workflow (L2)

> Adapted from `AGENTS.md` §§3–5, 8. Auto-loaded: the owner-per-track contract.

- Studio engine: labeled part registry (`D.register/show/solo/frame`,
  dimension-derived `frame()` fit, `dump/load`), floating panel with per-object
  eye toggles, `tracks/*.md` per object (spec + acceptance views + log).
- Owner-per-track rule: keep export signature, zero new lights, `node --check`
  clean. Shared positions frozen — placement quests (Maghariba/Rahma, Ascension,
  Al-Kas, apex) need owner confirm, never silent moves.
- Structures-first order: geometry → textures/materials → atmosphere/light/shadow/
  animation/quality; walk-mode character + camera last.
- Grounding rule: NEVER build blind. Missing `references/` coverage → web-search,
  download 2+ views to `references/<object>/`, read images, then build; record
  URLs in the doc. Per-prop img2obj workflow (validate → ObjectSculptSpec →
  blockout → form → lookdev → interaction). Trees = SeedThree bake → InstancedMesh.
- dGPU truth path: `scripts/shot-dgpu.mjs` verbatim (Chromium 1228, D129 override,
  `DISPLAY=:1`); Brave `--headless` BANNED (exit 139). Serve from project dir,
  `?nohud=1`, `?view=N` jumps CAMS; verify `INFO.cam` after `flyTo` (intro-flight
  races twice observed). Wait-and-retry if another agent holds the browser.
- Shots: 4+ views (aerial / Dome closeup / Qibli N facade / interior), no
  HUD/markers, letterbox OFF; read PNG + matching `references/*.jpg`;
  View|Ref|PASS/PARTIAL/FAIL + 1-line evidence. Placeholders get
  `userData.placeholder=true` + REFINE.md row — never ship fake detail as final.
- Docs: each task appends `docs/<module>-<topic>.md` (≤40 lines); keep REFINE.md
  current with cross-links; commit coherent pieces on branch, never straight to main.
