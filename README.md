# Al-Aqsa Compound — Haram al-Sharif interactive discovery

Three.js r170 ESM, no build. Serve: `python3 -m http.server 8099` → `http://localhost:8099/index.html`.

🎬 **[Flyover video](docs/al-aqsa-flyover.mp4)** (8 s, 30 fps — freecam trajectory aerial→Dome→porch→olives) · preview GIF alongside.

## Controls
- **Orbit / Walk / Cinematic / Guided Tour** modes + **Photo 📷** freecam (F enters, WASD+ E/Q fly, F frames labels, **X ultra still**, R/T/V record/replay/export trajectory, P/Esc exits).
- Walk/FPS: WASD + Shift run, Space jump, E enter mosque, V toggles FPS.
- Light: dawn/noon/sunset/night · Quality: auto/high/med/low · 1–9 viewpoints.

## Educative layer
12 gold markers + guided tour following the events thread (Isra'→qibla→Umar→Saladin→1969). Lesson texts: `content/lessons.md`.

## Project map
`AGENTS.md` (shared agent ground) · `PIPELINE.md` · `REFINE.md` · `KIRO.md` (exam evidence map) · `references/` (48 grounded photos + INDEX) · `docs/` (per-task logs, shots, video) · `tracks/` (per-object specs) · `content/lessons.md` · `.kiro/` (specs/steering/hooks/agents/MCP) · `my-power/` (bonus power).

## Capture (dGPU GTX 1650 Ti, D129)
`node scripts/shot-dgpu.mjs "<url>?nohud=1&view=N" shots/x.png` · batch JSON + custom pos/tgt supported.
Video: record traj in photo mode (R), `node scripts/make-video.mjs <traj.json>`.
Rule: visualize with HUD OFF before submit; low-fi → PLACEHOLDER + REFINE row.
