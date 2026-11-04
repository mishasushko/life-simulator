// Scans world*.json dumps for anachronisms and inconsistencies (rules live in rules.cjs).
const fs = require('fs'); const dir = process.argv[2] || process.cwd();
const { checkLife } = require('./rules.cjs');
const files = fs.readdirSync(dir).filter((f) => /^world\d.*\.json$/.test(f));
const hits = {}; const add = (k, ex) => { (hits[k] = hits[k] || { n: 0, ex: [] }).n++; if (hits[k].ex.length < 3) hits[k].ex.push(ex); };
for (const f of files) for (const L of JSON.parse(fs.readFileSync(dir + '/' + f))) checkLife(L, add);
const ks = Object.keys(hits).sort((a, b) => hits[b].n - hits[a].n);
for (const k of ks) { console.log(`## ${k} — ${hits[k].n}`); for (const e of hits[k].ex) console.log('   ' + e); }
