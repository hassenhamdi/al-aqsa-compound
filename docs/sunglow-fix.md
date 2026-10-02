# sunglow-fix — eye-level sunset sun tamed (disc contained, mood kept)
Cause: into-sun eye-level frames sat inside the Sky mie aura (mieCoefficient
.0025 × HG g.8 peak ≈45×) + bloom smear → sky-band blown 17.6%, Dome dissolved.
Disc core itself is shader-hardcoded (sunE·19000, three r170 Sky) — no uniform
tames it; the aura (~all of the blown area) is treatable. Same disease as the
aerial whiteout (docs/whiteout-fix.md), one stop closer.
Fix (lighting.js only): sunset mie .0025→.0014 (halve aura energy), new mieG
channel .8→.62 (HG peak ~45→~18, softer/wider), sunset bloom .35→.30 (small
w8-spec deviation, eye-level evidence). Exposure .72, turb, ray untouched.
main.js:273 constructor NOT touched (not my file; runtime drive already pins
thr .9/rad .4 every frame). For main session: `new UnrealBloomPass(res, 0.35,
0.6, 0.82)` → `new UnrealBloomPass(res, 0.35, 0.4, 0.9)` (w8-postspec §2).
Proof (sunset, eye-level into azim 250): sunglow-before → sunglow-after:
sky blown 17.6→0.2%, full-frame clip 7.3→0.1%; sun = small disc + corona,
Dome gold/tiles/arcade fully read, terrace warm, lamps on. sunglow-hud.png =
same framing HUD-on (Sunset active, 143 calls). node --check clean.
Next: true disc-core clamp needs a Sky shader patch (main-session call); dawn
could take the same mieG treatment if its aura ever complains.
