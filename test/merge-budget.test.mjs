// L4 PBT — merge-budget + studio-scope invariants (stdlib node:test only).
// Static source properties over modules/*.js: light budget, protected scopes,
// export-signature preservation, placement anchors.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MOD = path.join(ROOT, 'modules');
const files = fs.readdirSync(MOD).filter((f) => f.endsWith('.js'));
const src = Object.fromEntries(files.map((f) => [f, fs.readFileSync(path.join(MOD, f), 'utf8')]));
const count = (s, re) => (s.match(re) || []).length;

describe('merge-budget + scope invariants (REQ-BUDGET-1, REQ-STUDIO-1, REQ-MIN-2)', () => {
  it('total constructed real lights across modules stays within budget <= 26', () => {
    let total = 0;
    const per = {};
    for (const [f, s] of Object.entries(src)) {
      const n = count(s, /new THREE\.(PointLight|DirectionalLight|SpotLight)/g);
      per[f] = n; total += n;
    }
    assert.ok(total <= 26, `light budget blown: ${total} ${JSON.stringify(per)}`);
    assert.ok(total >= 5, `suspiciously few lights (${total}) — builders deleted?`);
  });

  it('minarets.js holds exactly ONE real PointLight (rest emissive)', () => {
    assert.equal(count(src['minarets.js'], /new THREE\.PointLight/g), 1);
  });

  it('protected interior/chain scopes survive merge (studio + builders agree)', () => {
    for (const name of ['domeInterior', 'qibliInterior', 'dome-of-chain']) {
      assert.ok(src['studio.js'].includes(name), `studio.js lost scope ${name}`);
    }
    assert.ok(src['domeOfRock.js'].includes('domeInterior'), 'dome builder lost interior scope');
    assert.ok(src['aqsaMosque.js'].includes('qibliInterior'), 'qibli builder lost interior scope');
    assert.ok(src['minorDomes.js'].includes('dome-of-chain'), 'minor builder lost chain scope');
  });

  it('all nine studio labels registered', () => {
    for (const l of ['platform', 'dome-ext', 'dome-int', 'qibli-ext', 'qibli-int',
      'chain', 'minor', 'minarets', 'vegetation']) {
      assert.ok(src['studio.js'].includes(`register('${l}'`), `label missing: ${l}`);
    }
  });

  it('every builder keeps buildX(ctx) export signature', () => {
    const builders = ['platform.js', 'domeOfRock.js', 'aqsaMosque.js', 'minorDomes.js',
      'minarets.js', 'vegetation.js', 'lighting.js', 'studio.js'];
    for (const f of builders) {
      assert.ok(/export function build\w+\s*\(\s*ctx\s*\)/.test(src[f]), `${f}: signature drifted`);
    }
  });

  it('AGENTS section-7 anchors present in source (no drift)', () => {
    const all = Object.values(src).join('\n');
    for (const anchor of ['-140', '-148', '60', '-218', '-70', '150']) {
      assert.ok(all.includes(anchor), `anchor ${anchor} vanished from modules`);
    }
    assert.ok(src['minarets.js'].includes('Silsila'), 'silsila lamp ownership note lost');
  });
});
