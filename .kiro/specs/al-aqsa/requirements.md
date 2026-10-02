# Al-Aqsa Compound — Feature Spec: Requirements (L1)

> Distilled from `PIPELINE.md` (repo has no `task_plan.md`; PIPELINE.md is the
> de-facto plan) + `tracks/*.md` (dome, qibli, platform, minarets, minor,
> vegetation). EARS-style (`WHEN trigger THE SYSTEM SHALL response`).

## Platform & shared anchors (AGENTS §7)

- REQ-PLAT-1: WHEN the scene boots, THE SYSTEM SHALL place a 300×450 esplanade
  slab with top at y=2, Dome terrace 110² @ (0,-70) and Qibli terrace @ (0,150).
- REQ-PLAT-2: WHEN gates render, THE SYSTEM SHALL show 8 named gates; Maghariba
  and Rahma placements remain OPEN quests (platform owner) per `tracks/platform.md`.
- REQ-ANCHOR-1: WHEN any builder positions the Dome, Qibli, Chain, minarets, or
  olives, THE SYSTEM SHALL use AGENTS §7 coordinates exactly (Dome (0,5.2,-70);
  Qibli (0,2,150) 83×56×11; Chain 32 m E of axis; minarets
  NW(-140,-140) W(-148,60) SW(-140,210) N(60,-218); olives E x62..128).

## Dome of the Rock (`tracks/dome.md`)

- REQ-DOME-1: WHEN the Dome builds, THE SYSTEM SHALL render octagon SIDE=20
  (48.3 face-to-face), drum Ø20.2, gilt ribbed dome with concentric interior (Δxz 0.0).
- REQ-DOME-2: WHEN studio solo runs, THE SYSTEM SHALL toggle `dome-ext` /
  `dome-int` independently (labels survive merge via protected `domeInterior` scope).
- REQ-DOME-3 (open): apex/finial height quest stays tracked in `REFINE.md`.

## Qibli mosque (`tracks/qibli.md`)

- REQ-QIBLI-1: WHEN the hall builds, THE SYSTEM SHALL render a 56×83×11 block
  with 7-arch N arcade rhythm, dome on the southern (qibla) bay, mihrab on the S axis.
- REQ-QIBLI-2: WHEN studio solo runs, THE SYSTEM SHALL toggle `qibli-ext` /
  `qibli-int` independently via protected `qibliInterior` scope.

## Minor domes & fountains (`tracks/minor.md`)

- REQ-MINOR-1: WHEN minor domes build, THE SYSTEM SHALL keep the Chain in its own
  merge scope + `chain` label at (32,-70) Ø19.8.
- REQ-MINOR-2 (open): Ascension E-vs-NW and Al-Kas E-vs-W siting quests stay
  owner-confirmed before any move (shared positions frozen).

## Minarets (`tracks/minarets.md`)

- REQ-MIN-1: WHEN minarets build, THE SYSTEM SHALL place 4 towers at §7 corners
  with per-owner heights recorded in `D.minarets`.
- REQ-MIN-2: WHEN night falls, THE SYSTEM SHALL use at most ONE real PointLight
  (Silsila balcony); all other glow SHALL be emissive (light budget ≤26 total).

## Vegetation (`tracks/vegetation.md`)

- REQ-VEG-1: WHEN olives bake, THE SYSTEM SHALL use seed 70701 deterministically:
  same seed SHALL always yield the same model (verified by `test/` PBT).
- REQ-VEG-2: WHEN trees place, THE SYSTEM SHALL keep masonry clear via `clearOf()`
  discs/rects and render all trees as ≤3 instanced draws (trunk + clusters + cypress).
- REQ-VEG-3: WHEN canopies render, THE SYSTEM SHALL flag blob canopies
  `userData.placeholder=true` until the SeedThree bake lands (Phase 2).

## Light / presets / budgets (cross-cutting)

- REQ-LIGHT-1: WHEN a day-part preset applies, THE SYSTEM SHALL keep every channel
  inside validated ranges (exposure 0.5–1.0, elev 0–90°, azim 0–360°, bloom 0–1;
  dawn→noon→sunset azim sweep 110→170→250) — enforced by `test/` PBT.
- REQ-BUDGET-1: WHEN the scene renders, THE SYSTEM SHALL stay within ≤26 real
  lights, one 2048 shadow light, shadow-casters = massing only, `node --check` clean.
- REQ-BUDGET-2: WHEN fps EMA <27 for 3.5 s, THE SYSTEM SHALL step quality
  high→med→low (pr 2→1.35→1, bloom off + 1024 at low).
- REQ-STUDIO-1: WHEN parts register, THE SYSTEM SHALL expose
  `D.register/show/solo/frame` with labels
  platform/dome-ext/dome-int/qibli-ext/qibli-int/chain/minor/minarets/vegetation.
- REQ-EDU-1: WHEN the tour runs, THE SYSTEM SHALL serve the 12 POIs from
  `content/lessons.md` in `TOUR_ORDER` with flyTo framing.
