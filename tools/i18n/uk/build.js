// Builds ../../../uk-data.js from todo.txt (N|S|ru or N|T|ru), tr/*.txt (N|uk), cities and rules.js
const fs = require('fs'); process.chdir(__dirname);
const todo = fs.readFileSync('todo.txt', 'utf8').split('\n').map((l) => { const a = l.indexOf('|'), b = l.indexOf('|', a + 1); return { n: +l.slice(0, a), k: l.slice(a + 1, b), ru: l.slice(b + 1).replace(/\\n/g, '\n') }; });
const tr = {};
for (const f of fs.readdirSync('tr').sort()) for (const line of fs.readFileSync('tr/' + f, 'utf8').split('\n')) { const i = line.indexOf('|'); if (i < 1) continue; tr[+line.slice(0, i)] = line.slice(i + 1).replace(/\\n/g, '\n'); }
const extra = fs.existsSync('extra.txt') ? fs.readFileSync('extra.txt', 'utf8').split('\n').filter((l) => l.includes('|')).map((l) => { const i = l.indexOf('|'); return { ru: l.slice(0, i), uk: l.slice(i + 1), k: /\{\d+\}/.test(l.slice(0, i)) ? 'T' : 'S' }; }) : [];
const EMO = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:[️‍⃣]|\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Modifier})*\s*)/u;
const norm = (s) => { s = s.trim().replace(/^[·,]\s*/, ''); const m = s.match(EMO); if (m) s = s.slice(m[1].length); return s.trim(); };
const S = new Map(), T = []; let missing = 0;
const ruByText = new Map(todo.map((e) => [e.ru, e]));
function addT(ru, uk) { ru = norm(ru); uk = norm(uk); const ph = [...ru.matchAll(/\{(\d+)\}/g)].map((m) => +m[1]); const parts = ru.split(/\{\d+\}/); T.push([parts, ph, uk]); }
for (const e of todo) {
  let uk = tr[e.n];
  if (uk == null) { const m = e.ru.match(/^(.+) \(СССР\)$/); const base = m && ruByText.get(m[1]); if (base && tr[base.n] != null) uk = tr[base.n] + ' (СРСР)'; }
  if (uk == null) { missing++; continue; }
  if (e.k === 'T') addT(e.ru, uk); else if (!S.has(e.ru)) S.set(e.ru, uk);
}
for (const e of extra) { if (e.k === 'T') addT(e.ru, e.uk); else S.set(e.ru, e.uk); }
T.sort((a, b) => b[0].join('').length - a[0].join('').length);
const cr = fs.readFileSync('cities_ru.txt', 'utf8').trim().split(', '), cu = fs.readFileSync('cities_uk.txt', 'utf8').trim().split(', ');
const out = 'const UK_DATA = ' + JSON.stringify({ s: [...S], t: T, c: cr.map((c, i) => [c, cu[i]]) }) + ';\n' + fs.readFileSync('rules.js', 'utf8');
fs.writeFileSync(require('path').join(__dirname, '../../../uk-data.js'), out);
console.log('statics', S.size, 'templates', T.length, 'missing', missing, 'bytes', out.length);
