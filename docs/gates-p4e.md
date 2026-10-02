# gates-p4e — gate fixes + walk spawn + collider refresh + apex verdict
1. Gates (platform.js:99-103, owned this phase): Maghariba (60,225,S)
-> (-150,100,W wall) per wilson Bab al Magharibe Passage; Rahma
(-40,-225,N) -> (150,-140,E wall) per plan-1890 Golden Gate. along=1
(E/W opening) both. D.gates + portals update together (same loop);
education gates POI (-150,9,10) still valid, untouched.
2. Walk spawn (main.js): D.qibliInterior.y = 3.6 after anchor normalize
(P3a: hall floor at 3.2 world). D.qibliPos source untouched (sibling).
E-enter verified: gates-p4e-enter.png shows carpet/columns at eye
level, not buried — enter+exit logic unchanged, lands correctly.
3. Colliders (main.js:73-78): stale (-30,40)/(-60,-20) -> Al-Kas
(20,30,r7, P4d move) + Qasim kiosk (-45,-30,r6).
4. Dome apex verdict (no edit; dome-owner review): measured 39.8 =
terrace 5.2 + walls 11 + drum 6.5 + rise 10.7 + finial ~5.2. Drum/dome
ratios match photos (drum 0.32Ø, rise 0.52Ø); excess is the finial
stack (rod 4.6 + orbs + crescent @+4.35 ≈ 5.3 vs real ~2.5-3).
Recommend: compress finial (rod→2.6, cres→+2.6), saves ~2.5 m;
optionally drum 6.5→6.0. Structure itself PASS.
Shots (dGPU, nohud, cams verified): gates-p4e-aerial (184 calls),
gates-p4e-maghariba (portal mass W edge z≈100, into-sun haze),
gates-p4e-enter (167). node --check clean (main.js, platform.js).
Next: dome-owner finial pass; qibli-int solo (Phase 5 gate).
