# references/INDEX.md — what each object has (grounding map)

Root (10, full-size): `qibli-ne.jpg` `qibli-dome.jpg` `qibli-interior.jpg` `aerial.jpg`
`plan.jpg` `chain.jpg` `sabil.jpg` `fountains.jpg` `minaret-silsila.jpg` `minaret-fakhriyya.jpg`

| Object | Views | Files |
|---|---|---|
| Dome of the Rock ext | 3 | `dome-ext/temple-mount-V4-178.jpg` (wide), `dome-ext/marble-detail.jpg`, root wide shots |
| Dome of the Rock int | 6 | `dome-int/arches.jpg` `sidepart-1/2.jpg` `2018-01/03.jpg` (+ceiling TODO re-fetch) |
| Dome of the Chain | 5 | root `chain.jpg` + `chain/chain-dome.jpg` `chain-01.jpg` `selselsh.jpg` `chain-interior-2013.jpg` |
| Qibli facade | 6 | root `qibli-ne.jpg` + `qibli/facade-frontal-04.jpg` `facade-section.jpg` `mosque-8682.jpg` `inscription-02.jpg` |
| Qibli dome | 1 | root `qibli-dome.jpg` |
| Qibli interior | 2 | root `qibli-interior.jpg` + `mihrab/minbar-mihrab-03246.jpg` (historic cedar minbar!) |
| Sabil Qaitbay | 4 | root `sabil.jpg` + `sabil/kait-bey-626.jpg` `kait-bey-2117.jpg` `cotton-gate.jpg` |
| Fountains/Qasim | 1 | root `fountains.jpg` |
| Fakhriyya minaret | 3 | root `minaret-fakhriyya.jpg` + `minaret/fakhriyya-museum.jpg` `museum/museum-fakhriyya-2013.jpg` |
| Asbat minaret/gate | 2 | `minaret/asbat.jpg` `gate-tribes.jpg` |
| Silsila minaret | 1 | root `minaret-silsila.jpg` (NEEDS +1 closeup) |
| Museum | 3 | `museum/museum-2013.jpg` `glass-lamp.jpg` (interior ref!) `museum-fakhriyya-2013.jpg` |
| Qanatir/Mawazin | 2 | `misc/qanatir.jpg` `misc/platform-portal.jpg` |
| Plan/map | 1 | root `plan.jpg` |

GAPS remaining: Prophet (query returned ∅ — retry 'Qubbat an-Nabi'), Yusuf dome(s), Maghariba ramp, Ghawanima minaret, portico bays, library facade, olive closeup, lamps, Dome ceiling.
Rule (AGENTS.md §8): no object built blind — 2+ views + Read first.

## Maps — abstract + real, multiple zooms (all visually verified)
| File | Type / zoom | Verdict |
|---|---|---|
| root `plan.jpg` | modern labeled overview | KEEP as orientation map |
| `maps/plan-1890.jpg` | abstract full-compound plan, gates A–Z, Platform/Dome/Chain/Ascension/Aqsa grid/Stables/Golden Gate | EXCELLENT — primary layout authority |
| `maps/wilson-buraq.png` | zoomed survey, SW sector: Bab Silsila/Salam, Maghariba passage, Masjed al-Aksa piers, Al-Kas "Cup", cisterns | EXCELLENT — model SW detail from this |
| `aerial/aerial-silwan-kidron.jpg` | real wide aerial from SE: full platform, gold dome, Qibli, walls, Kidron/Olives/city topography | SUPERB — primary massing/terrain authority |
| root `aerial.jpg` | real aerial SE | KEEP as second angle |
| `aerial/old-city-wide.jpg` | NOT aerial — west skyline (Lutheran tower, Dome, Olives behind) | KEEP as skyline/massing ref |
| `aerial/ne-corner-2014.jpg` | tight crop: Asbat minaret + cypress | MINOR value |

## Lessons (img+text grounding)
`content/lessons.md` — 12 stops + events thread; each entry cites the exact files above.
GAP tags inside mark images still to fetch (Asbat done; Ascension/Prophet/Yusuf/Al-Kas/Qattanin/Maghariba/Ghawanima/portico/library/olive-closeup/mihrab-minbar/Dome-ceiling pending).

| Ascension | 2 | `ascension/ascension-2008.jpg` `ascension-04.jpg` |
| Al-Kas | 2 | `alkas/alkas-2008.jpg` `alkas-reflection.jpg` (Dome mirrored in water!) |
| Qattanin gate | 2 | `gates/qattanin-6036.jpg` `qattanin-gate.jpg` |

## Trees (open-tree bar)
`trees/oak-open-tree.png` — English Oak 14.3 m from `/home/hassenhamdi/open-tree.html` (single-file species library: oak/maple/birch/willow/pine/spruce, space-colonization crowns, hash params `#oak`, forest instancing 15k trees @27fps). Generation math is plain JS (Skeleton/colonize/buildModel/SPECIES) — portable technique source alongside dryad.
