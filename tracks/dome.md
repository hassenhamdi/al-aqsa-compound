# TRACK — Dome of the Rock (`modules/domeOfRock.js`, labels `dome-ext`/`dome-int`)

## Objective
Octagon SIDE=20 @ (0,5.22,-70), drum Ø20.2, gilt dome; ext/int separately
toggleable (labels survive merge via protected `domeInterior` scope).

## Spec checklist
- [x] Octagon 48.3 face-to-face (≈1/6 platform width, matches 1890 ratio)
- [x] Drum Ø20.2 exact; dome-int concentric (Δxz 0.0 measured)
- [x] Apex 39.8 vs ~35 real — owner-confirm (dome), finial share unknown
- [x] `dome-int` solo shot renders interior only (59 calls)

## Acceptance views
- `?view=1` closeup, `?view=5&solo=dome-int`, `__studio.frame('dome-int')`

## Status
- [x] spec → [x] implement → [x] verify → [ ] apex quest open

## Log
- 2026-10-01 — system: align-p4b audit; ext/int split + solo proof OK
