'use strict';
// Plays whole lives in Node (no browser) and records every text, like tools/audit/world-run.cjs.
const { game } = require('./harness.cjs');
function seeded(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const g = game(); const { run, context: X } = g;
function playLife(c, y, years, seed) {
  const R = seeded(seed); X.Math.random = R;
  const gender = R() < 0.5 ? 'm' : 'f'; const rec = []; const errors = [];
  X.__o = { country: c, year: y, gender }; run('newLife(__o); Q = []; closeModal()');
  const seen = new Set(); const S = () => run('S');
  const grab = () => { for (const b of S().log) for (const i of b.items) if (typeof i.t === 'string' && !seen.has(i.t)) { seen.add(i.t); rec.push([S().year, S().age, S().country, i.t]); } };
  const people = () => S().people.map((x) => `${x.role}:${x.gender}:${x.name}:${x.age}`).join(';');
  rec.push([S().year, 0, c, 'PEOPLE ' + people()]);
  const wrap = X.document.getElementById('modalWrap'), acts = X.document.getElementById('modalActions');
  for (let k = 0; k < years && S().alive; k++) {
    try {
      run('ageUp()');
      for (let j = 0; j < 30 && (!wrap.hidden || run('Q.length')); j++) {
        if (wrap.hidden) run('pump()');
        const bs = acts.children.filter((b) => !b.disabled && typeof b.onclick === 'function' && !/Новая жизнь|Начать заново|Продолжить за/.test(b.textContent || ''));
        rec.push([S().year, S().age, S().country, 'MODAL ' + (X.document.getElementById('modalTitle').textContent || '') + ' :: ' + String(X.document.getElementById('modalText').textContent || '').slice(0, 200)]);
        if (!bs.length) { run('closeModal()'); break; }
        bs[Math.floor(R() * bs.length)].onclick();
      }
    } catch (e) { errors.push(`${S().year} ${c}: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); run('Q = []'); try { run('closeModal()'); } catch (_) {} }
    grab();
  }
  return { c, y, g: gender, rec, errors, alive: S().alive, age: S().age };
}
module.exports = { playLife, run, X };
