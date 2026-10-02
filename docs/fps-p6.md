# fps-p6 — first-person pointer-lock mode (FINAL character stage)
Own files only (character.js rewrite + main.js mode wiring); no lights.
Modes: orbit | walk (third-person follow, fallback) | fps (primary).
FPS: pointer-lock mouse look (YXZ euler, ±83° pitch), WASD+Shift on
look yaw, eye = feet+1.7 m + subtle bob/roll, avatar hidden, controls
disabled + skipped in loop (else OrbitControls fights look). V toggles
walk<->fps; E works in both (Qibli faces mihrab, Dome faces north,
yaw restored on exit); Esc browser-exits lock → walk fallback;
bCine/bTour/setView force orbit first (camera ownership).
Collision unchanged and shared: colliders + interior boxes + platform
clamp run in fps too; eye inherits them (no wall clipping by construction).
Bug found+fixed: main.js + character.js BOTH bound KeyE → E double-fired
(enter instantly exited); main branch removed, character solely owns E.
Shots (dGPU, HUD ON, Walk pill): fps-p6-courtyard (eye-level Dome +
portico framing, 127 calls) + fps-p6-enter (Dome ambulatory interior,
112 calls). V-toggle + lock-fail toast verified in harness.
Unverified headless: actual mouse-look deltas (API-standard path).
#help bar still lists old keys (index.html frozen) — toasts teach V.
Next: none — character complete; gate in Phase-5.
