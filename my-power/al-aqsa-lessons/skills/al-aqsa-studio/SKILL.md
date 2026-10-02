---
name: al-aqsa-studio
description: Studio-lite part-registry method for multi-owner three.js scenes. Use when adding toggleable parts, solo views, or dimension-derived camera framing.
---

# Al-Aqsa Studio method

- Register by **post-merge traversal** (`getObjectByName`), never by editing
  sibling builders. Protect interior scopes (`domeInterior`, `qibliInterior`)
  and singletons (`dome-of-chain`) — merges must not absorb them.
- API: `register / show / solo / all / focus / frame / list / bounds / dump`.
  `frame()` fits bounding spheres on both fovs (margin 1.25).
- Owner-per-track: `tracks/<object>.md` (spec + acceptance views + log), keep
  export signature, zero new lights, `node --check` clean.
- Capture: serve from project dir, `?nohud=1`, `?view=N` jumps CAMS, settle
  `frames>90`, always verify cam matches the `flyTo` request.
