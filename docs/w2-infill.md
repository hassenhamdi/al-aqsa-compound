# w2-infill — missing-geometry audit + Mughrabi bridge blockout
Goal: audit 7 GAP items vs refs; build only missing+grounded geometry in new `modules/infill.js` (`buildInfill(ctx)`); zero lights; `node --check` clean.
Refs: `references/yusuf/*.jpg` (2, Commons) + `references/maghariba/*.jpg` (2, Commons) fetched this task; `maps/plan-1890.jpg` + `maps/wilson-buraq.png` re-read.
| Item | Verdict | Evidence |
| Yusuf domes | FAIL place / owned minorDomes | true site = S edge Dome terrace (~TY,-14), 3.5×2.8 m single aedicule; scene has 2× at z=105/108 on GY — move-fix for minor-owner, NOT duplicated here |
| Portico bays | PASS | platform.js portico + annex portals; i=14 gap already pinned |
| Library facade | PASS | annex ashrafiyya-library ablaq+loggia+hood |
| Maghariba ramp | BUILT here | was absent (w2-maghariba shot: bare ground outside W wall) |
| Ghawanima minaret | PASS | minarets.js tallest (39.9 m, 6 stories, decor) |
| Lamps | PASS | 14 garden + 10 lantern posts, emissive-only |
| Dome ceiling | PASS geom / ref gap | gilt soffit exists; ceiling closeup photos still TODO |
Built — infill.js (~120 lines): Mughrabi trestle bridge P0(-178,-1.6,122)→P1(-162,0.2,108)→P2(-152.5,2.4,100) (21.3 m @4.8° + 12.6 m @10°); wood deck, lead-dark sheet roof, instanced roof posts/rails, scaffold bents to y=-3, abutment + landing + canvas gatehouse; flat M.* only, group `placeholder=true`, 1 POI, 0 lights.
Shots (verbatim shot-dgpu.mjs, D129, ?nohud=1): `shots/w2-aerial.png` (192 calls, 7 lights) + `shots/w2-maghariba.png` (custom [-205,20,145]→[-152,2,100]); pre-wire scene. 404 = favicon only.
Remaining gaps: Yusuf move-fix (minor-owner + yusuf refs above); real 10 m rise compressed to scene 5 m step; Dome-ceiling photo refs; wire-up in main.js (main session).
