// Era audit in CI: plays whole lives in many countries and start years (seeded, no browser)
// and checks every text with tools/audit/rules.cjs. Full manual audit: tools/audit/README.md.
// AUDIT=full plays every country in 4 start years (~1 min); default is a 1/4 sample (~15 s).
const test = require('node:test');
const assert = require('node:assert/strict');
const { playLife, run } = require('./lib/play.cjs');
const { checkLife } = require('../tools/audit/rules.cjs');

// Must stay at zero: these are bugs, not judgement calls.
const HARD = /^(ANA |BROKEN|male player pregnant|female conscripted|same-sex parents|child married|child at work|gender placeholder)/;
// News (📰 🗞️) and technology (💡) lines are allowed to name inventions in the year they appear.
const NEWS = /^(📰|🗞️|💡)/;

test('era audit: lives across countries and eras play without crashes, anachronisms or broken text', () => {
  const ids = run('COUNTRIES.map(c => c.id)');
  const full = process.env.AUDIT === 'full';
  const hard = {}, soft = {}, errors = [];
  let lives = 0;
  for (const [yi, y] of [1905, 1940, 1975, 2010].entries()) ids.forEach((c, i) => {
    if (!full && (i + yi) % 4) return;
    const L = playLife(c, y, 65, i * 31 + y); lives++;
    errors.push(...L.errors);
    L.rec = L.rec.filter((r) => !NEWS.test(r[3]));
    checkLife(L, (k, ex) => { const b = HARD.test(k) ? hard : soft; (b[k] = b[k] || []).push(ex); });
  });
  const show = (b) => Object.entries(b).map(([k, v]) => `${k} (${v.length})\n    ${v.slice(0, 3).join('\n    ')}`).join('\n');
  if (Object.keys(soft).length) console.log(`era audit, review by hand:\n${show(soft)}`);
  assert.ok(lives > 100, `played ${lives} lives`);
  assert.deepEqual(errors.slice(0, 5), [], 'exceptions while playing');
  assert.equal(show(hard), '', 'hard era/consistency findings');
});
