// Evidence-shape guard: every Kiro-exam artifact exists and parses.
// (Structural, not property-based — keeps `node --test test/` as the single gate.)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const must = (p) => assert.ok(fs.existsSync(path.join(ROOT, p)), `missing: ${p}`);

describe('exam evidence shape', () => {
  it('spec / steering / hooks / mcp / agents trees exist', () => {
    for (const p of ['.kiro/specs/al-aqsa/requirements.md', '.kiro/specs/al-aqsa/design.md',
      '.kiro/specs/al-aqsa/tasks.md', '.kiro/steering/stack.md', '.kiro/steering/workflow.md',
      '.kiro/steering/skills.md', '.kiro/hooks/node-check-on-save.json',
      '.kiro/hooks/shot-discipline.json', '.kiro/mcp.json', '.kiro/powers.md', 'KIRO.md']) must(p);
    assert.ok(fs.readdirSync(path.join(ROOT, '.kiro/agents')).filter((f) => f.endsWith('.json')).length >= 4,
      'fewer than 4 custom agents');
  });

  it('hooks are valid v1 hook JSON with trigger+matcher+command', () => {
    for (const f of ['node-check-on-save.json', 'shot-discipline.json']) {
      const h = JSON.parse(fs.readFileSync(path.join(ROOT, '.kiro/hooks', f), 'utf8'));
      assert.equal(h.version, 'v1');
      assert.ok(Array.isArray(h.hooks) && h.hooks.length > 0);
      for (const hk of h.hooks) {
        assert.ok(hk.name && hk.trigger && hk.matcher && hk.action?.command, `bad hook in ${f}`);
      }
    }
    const check = JSON.parse(fs.readFileSync(path.join(ROOT, '.kiro/hooks/node-check-on-save.json'), 'utf8'));
    assert.ok(check.hooks[0].matcher.includes('modules'), 'check hook must match modules/*.js');
  });

  it('mcp.json declares the three servers used in this build', () => {
    const m = JSON.parse(fs.readFileSync(path.join(ROOT, '.kiro/mcp.json'), 'utf8'));
    for (const s of ['threejs-devtools', 'tavily', 'exa']) {
      assert.ok(Object.keys(m.mcpServers).some((k) => k.includes(s)), `mcp server missing: ${s}`);
    }
  });

  it('power plugin manifest is present and valid', () => {
    const pj = JSON.parse(fs.readFileSync(
      path.join(ROOT, 'my-power/al-aqsa-lessons/plugin.json'), 'utf8'));
    assert.ok(pj.name && pj.version && pj.description, 'plugin.json incomplete');
    assert.ok(fs.existsSync(path.join(ROOT, 'my-power/al-aqsa-lessons/skills/al-aqsa-lessons/SKILL.md')));
    assert.ok(fs.existsSync(path.join(ROOT, 'my-power/al-aqsa-lessons/skills/al-aqsa-studio/SKILL.md')));
  });

  it('no existing-code files were touched by this pack (spot-check mtimes stay old)', () => {
    // Pack may only ADD: .kiro/, KIRO.md, my-power/, test/. Any modified
    // tracked source would be a scope violation — assert key files predate the pack.
    const packBirth = Math.min(
      fs.statSync(path.join(ROOT, 'test/bake-determinism.test.mjs')).mtimeMs,
      fs.statSync(path.join(ROOT, 'KIRO.md')).mtimeMs);
    for (const f of ['main.js', 'index.html', 'AGENTS.md', 'modules/lighting.js']) {
      assert.ok(fs.statSync(path.join(ROOT, f)).mtimeMs < packBirth, `${f} was touched!`);
    }
  });
});
