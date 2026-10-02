# dome-p3b — interior readability: capped drum found, rock/soffit fixed
Goal: fix PARTIALs (Rock white void, gilt soffit swirls, hollow lacking walls). Exterior untouched.
Root cause (same occlusion class as qibli-p3a's buried floor): the closed drum
cylinder's tiled BOTTOM CAP (r 10 disc, y 11.45) sealed the drum/dome off the
hall — its planar-UV tile read as the navy "ceiling swirls". Ablation (sunset/
noon/night identical) ruled out sun; RGB tracers (rock red OK; drum green, dome
magenta, arch red NEVER rasterized) + macro zoom (smooth, not texture) nailed it.
Refs: dome-int/arches,2018-01,2018-03,sidepart-1 (dark screen, marble arcades,
ablaq, mosaic drum, gilt dome w/ red net, coffered ceiling).
Changes — modules/domeOfRock.js only: drum+walls openEnded (33-36,136: caps off);
roof disc→extruded RING w/ r10 eye (68-82); inner drum mosaic extended 5.5-11.1
(341); soffit arabesque (gold/red net/inscription, metal .55: 343-354); dado +
mosaic liners block see-through + 4 interior doors (361-400); rock 0x6f665c +
env .08 (225); columns dark clone (263-264); lamp 60→16 d2 (322); archMat dimmed (283).
Shots (headed Chromium D129, ?nohud=1): dome-p3b-final.png (?view=5),
dome-p3b-rock.png (closeup [11,8.6,-57]→[0,9.5,-71]); ablation set base/noon/night.
| View | Ref | Verdict | Evidence |
| dome-interior (?view=5) | 2018-01/03 | PASS | mosaic drum, arches, capitals, dado, carpets read |
| rock closeup | 2018-01 | PASS | grey mass + facets + railing read; micro-noise later |
| arch whiteout @sunset | arches.jpg | PARTIAL | no ablaq striping, blooms vs ref voussoirs |
| gilt soffit closeup | 2018-03 | PARTIAL | apex unseen from allowed views; texture replaced |
Placeholders: none flagged (soffit/arch gaps → REFINE rows, nothing known-fake).
Next: ablaq arch texture; soffit up-shot verify; walk spawn y for dome interior.
