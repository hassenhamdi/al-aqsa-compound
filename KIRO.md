# KIRO.md — final-exam evidence map

> Build: Al-Aqsa Compound interactive 3D (`index.html` + `main.js` + `modules/*.js`).
> This pack ADDS ONLY: `.kiro/` + `KIRO.md` + `my-power/` + `test/`.
> Existing code untouched.

## Lesson → evidence

| Lesson | Credits | Artifact | Status |
|---|---|---|---|
| L1 spec-driven dev | 250 | `.kiro/specs/al-aqsa/{requirements,design,tasks}.md` (EARS reqs distilled from `PIPELINE.md` + `tracks/*.md`; no `task_plan.md` exists — noted in requirements) | ready |
| L2 steering | 250 | `.kiro/steering/{stack,workflow,skills}.md` (from `AGENTS.md` + `_skills/INDEX.md`) | ready |
| L3 hooks | 250 | `.kiro/hooks/node-check-on-save.json` (PostFileSave → `node --check`, matches `modules/*.js`); `shot-discipline.json` (reminder on `shots/*.png`) | ready |
| L4 PBT (IDE) | 500 | `test/{bake-determinism,merge-budget,preset-ranges}.test.mjs` — stdlib `node:test`, no new deps | ready — `node --test "test/*.mjs"` green (24/24, exit 0) |
| L5 powers | 500 | `.kiro/powers.md` (threejs-scene + awesome pack + ghibli forks + registry-style entry) | ready |
| L6 MCP | 1000 | `.kiro/mcp.json` (threejs-devtools + tavily + exa) + `.kiro/mcp-usage.md` (read-only bridge calls) | ready |
| L7 custom agents | 1000 | `.kiro/agents/{architect,vegetation-owner,lighting-td,studio-system,validator}.json` (roles, tools, ownership rule; session IDs redacted to role names) | ready |
| All-7 completion | 1000 | this table + green test gate | ready |
| Bonus 2 power packaging | 250 | `my-power/al-aqsa-lessons/{plugin.json,skills/al-aqsa-lessons/SKILL.md,skills/al-aqsa-studio/SKILL.md}` (from `content/lessons.md` + studio method) | ready |
| **Total claimable** | **5000** | (Bonus 1 cloud sessions: not claimed — local dGPU build) | — |

## Verify

```
node --test "test/*.mjs"   # 24 pass, exit 0 (bare `node --test test/` misresolves on node v26 — use the glob)
node --check main.js   # + modules per hook command
```

## Submission checklist (DO NOT git init in this session)

- [ ] FLAG: repo has NO git yet — main session must `git init`, first commit
      dated ≥ Sept 21, push to NEW public GitHub repo (exam: first commit ≥Sept 21).
- [ ] Confirm `node --test "test/*.mjs"` green on a clean checkout (24/24, exit 0).
- [ ] Submit final-exam entry form by **Oct 5 23:59 PT** (Oct 6, 07:59 GMT+1).
