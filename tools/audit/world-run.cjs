// For each country and start year: play one life with random choices, dump every text with the year it appeared.
const { chromium } = require('playwright'); const fs = require('fs');
const YEARS = (process.argv[2] || '2026,1970,1935,1900').split(',').map(Number);
const YRS = +(process.argv[3] || 60);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  p.on('dialog', (d) => d.accept());
  await p.route(/fonts\.(googleapis|gstatic)|supabase/, (r) => r.abort());
  await p.goto('http://localhost:8765/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  const ids = await p.evaluate(() => COUNTRIES.map((c) => c.id));
  const out = [];
  for (const y of YEARS) for (const c of ids) {
    try {
      const r = await p.evaluate(async ([c, y, YRS]) => {
        const rec = []; const W = () => new Promise((r) => setTimeout(r, 0));
        const g = Math.random() < 0.5 ? 'm' : 'f';
        newLife({ country: c, year: y, gender: g });
        const seen = new Set();
        const grab = () => { if (!S) return; for (const blk of S.log) for (const i of blk.items) { const k = i.t; if (typeof k === 'string' && !seen.has(k)) { seen.add(k); rec.push([S.year, S.age, S.country, k]); } } };
        const people = () => S.people.map((x) => `${x.role}:${x.gender}:${x.name}:${x.age}`).join(';');
        rec.push([S.year, 0, c, 'PEOPLE ' + people()]);
        for (let k = 0; k < YRS && S && S.alive; k++) {
          ageUp(); await W();
          for (let j = 0; j < 30 && (!document.getElementById('modalWrap').hidden || Q.length); j++) {
            if (document.getElementById('modalWrap').hidden) pump();
            const t = document.getElementById('modalTitle').textContent, tx = document.getElementById('modalText').textContent;
            const bs = [...document.querySelectorAll('#modalActions button')].filter((x) => !x.disabled && !/Новая жизнь|Начать заново|Продолжить за/.test(x.textContent));
            if (S) rec.push([S.year, S.age, S.country, 'MODAL ' + t + ' :: ' + tx.slice(0, 200) + ' || ' + bs.map((x) => x.textContent).join(' / ')]);
            if (!bs.length || !S) break; bs[Math.floor(Math.random() * bs.length)].click(); await W();
          }
          grab(); if (!S || !S.alive) break;
        }
        if (S) rec.push([S.year, S.age, S.country, 'END ' + S.gender + ' ' + people()]);
        return { g, rec };
      }, [c, y, YRS]);
      out.push({ c, y, g: r.g, rec: r.rec });
    } catch (e) { errs.push(c + ' ' + y + ' ' + e.message.slice(0, 200)); await p.goto('http://localhost:8765/'); await p.waitForTimeout(500); }
  }
  fs.writeFileSync((process.env.OUT || process.cwd()) + '/world' + YEARS.join('_') + '.json', JSON.stringify(out));
  console.log('lives', out.length, 'texts', out.reduce((s, x) => s + x.rec.length, 0)); console.log('ERRS', [...new Set(errs)].slice(0, 30).join('\n'));
  await b.close();
})();
