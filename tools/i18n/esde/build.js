// Builds es-data.js and de-data.js (English → Spanish/German overlay, beta) from tools/i18n/esde/core.txt
const fs = require('fs'), path = require('path');
const lines = fs.readFileSync(path.join(__dirname, 'core.txt'), 'utf8').split('\n').filter((l) => l.includes('|'));
for (const [k, i, v] of [['ES', 1, 'es'], ['DE', 2, 'de']]) {
  const m = {}; for (const l of lines) { const p = l.split('|'); if (p[i]) m[p[0]] = p[i]; }
  fs.writeFileSync(path.join(__dirname, '..', '..', '..', `${v}-data.js`), `const ${k}_DATA = ${JSON.stringify(m)};\n`);
  console.log(v, Object.keys(m).length);
}
