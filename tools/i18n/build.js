const fs = require('fs');
process.chdir(__dirname);
const todo = require(__dirname + '/todo2.json');
const tr = {};
for (const f of fs.readdirSync('tr').sort().filter((f) => /^\d+\.txt$/.test(f))) for (const line of fs.readFileSync('tr/' + f, 'utf8').split('\n')) {
  const i = line.indexOf('|'); if (i < 1) continue; const n = +line.slice(0, i); if (!Number.isFinite(n)) continue;
  tr[n] = line.slice(i + 1).replace(/\\n/g, '\n');
}
const EMO = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:[️‍⃣]|\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Modifier})*\s*)/u;
const CYR = /[А-Яа-яЁёІіЇїЄєҐґЎў]/;
const norm = (s) => { s = s.trim().replace(/^[·,]\s*/, ''); const m = s.match(EMO); if (m) s = s.slice(m[1].length); return s.trim(); };
const segs = (h) => h.split(/<[^>]*>/).map((x) => x.trim()).filter((x) => x);
const S = new Map(), T = [], warn = [];
const addS = (ru, en) => { ru = norm(ru); en = norm(en); if (!ru || !en || !CYR.test(ru) || S.has(ru)) return; S.set(ru, en); };
function addT(ru, en) {
  ru = norm(ru); en = norm(en);
  const ph = [...ru.matchAll(/\{(\d+)\}/g)].map((m) => +m[1]);
  const parts = ru.split(/\{\d+\}/);
  if (!ph.length) return addS(ru, en);
  if (!parts.some((p) => CYR.test(p))) return;
  // drop pure-placeholder edge parts that would be empty is fine
  T.push([parts, ph, en]);
}
let missing = 0;
todo.forEach((e, i) => {
  const en = tr[i]; if (en == null) { missing++; return; }
  const isHtml = /<[a-z!/][^>]*>/i.test(e.ru);
  if (!isHtml) return e.k === 't' ? addT(e.ru, en) : addS(e.ru, en);
  const rs = segs(e.ru);
  let es = /<[a-z!/][^>]*>/i.test(en) ? segs(en) : en.split('¦').map((x) => x.trim());
  if (/<[a-z!/][^>]*>/i.test(en) && rs.length === es.length) { rs.forEach((r, j) => { if (CYR.test(r)) (/\{\d+\}/.test(r) ? addT : addS)(r, es[j]); }); return; }
  const rc = rs.filter((r) => CYR.test(r));
  if (en.includes('¦') || !/<[a-z!/][^>]*>/i.test(en)) {
    if (rc.length === es.length) { rc.forEach((r, j) => (/\{\d+\}/.test(r) ? addT : addS)(r, es[j])); return; }
  }
  warn.push(i + ' ' + rs.length + '/' + rc.length + '/' + es.length + ' ' + e.ru.slice(0, 80));
});
for (const line of fs.readFileSync('tr/extra.txt', 'utf8').split('\n')) { const i = line.indexOf('|'); if (i < 1) continue; const ru = line.slice(0, i).replace(/\\n/g, '\n'), en = line.slice(i + 1).replace(/\\n/g, '\n'); (/\{\d+\}/.test(ru) ? addT : addS)(ru, en); }
// cities
const cr = require(__dirname + '/cities.json'), ce = fs.readFileSync('cities_en.txt', 'utf8').trim().split(', ');
const C = cr.map((c, i) => [c, ce[i]]);
T.sort((a, b) => b[0].join('').length - a[0].join('').length);
const out = 'const EN_DATA = ' + JSON.stringify({ s: [...S], t: T, c: C }) + ';\n';
fs.writeFileSync(require('path').join(__dirname, '../../en-data.js'), out);
console.log('statics', S.size, 'templates', T.length, 'missing', missing, 'bytes', out.length);
console.log(warn.join('\n'));
