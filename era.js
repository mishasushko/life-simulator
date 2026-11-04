/* ===================== Эпоха: карта мира по годам, место и дата рождения, приметы времени ===================== */

/* ---------- Государства, которых больше нет: объединяем их части на карте ---------- */
// m — страны игры или номера ISO (строки из цифр) или '#Имя' контура без номера; a — где ставить подпись
const MAP_BLOCS = [
  { n: 'Российская империя', from: 1900, to: 1917, a: 'ru', m: ['ru', 'ua', 'by', 'kz', 'ge', 'am', 'az', 'uz', 'kg', 'tj', 'tm', 'fi', 'lt', 'lv', 'ee', 'md', 'pl'] },
  { n: 'СССР', from: 1922, to: 1939, a: 'ru', m: ['ru', 'ua', 'by', 'kz', 'ge', 'am', 'az', 'uz', 'kg', 'tj', 'tm'] },
  { n: 'СССР', from: 1940, to: 1991, a: 'ru', m: ['ru', 'ua', 'by', 'kz', 'ge', 'am', 'az', 'uz', 'kg', 'tj', 'tm', 'lt', 'lv', 'ee', 'md'] },
  { n: 'Австро-Венгрия', from: 1900, to: 1918, a: 'at', m: ['at', 'hu', 'cz', 'sk', 'si', 'hr', 'ba'] },
  { n: 'Османская империя', from: 1900, to: 1918, a: 'tr', m: ['tr', 'sy', 'lb', 'iq', 'jo', 'il'] },
  { n: 'Швеция и Норвегия', from: 1900, to: 1905, a: 'se', m: ['se', 'no'] },
  { n: 'Великобритания', from: 1900, to: 1921, a: 'gb', m: ['gb', 'ie'] },
  { n: 'Югославия', from: 1918, to: 1991, a: 'ba', m: ['rs', 'hr', 'si', 'ba', 'me', 'mk', '#Kosovo'] },
  { n: 'Сербия и Черногория', from: 1992, to: 2006, a: 'rs', m: ['rs', 'me', '#Kosovo'] },
  { n: 'Чехословакия', from: 1918, to: 1992, a: 'cz', m: ['cz', 'sk'] },
  { n: 'Британская Индия', from: 1900, to: 1947, a: 'in', m: ['in', 'pk', 'bd'] },
  { n: 'Пакистан', from: 1948, to: 1971, a: 'pk', m: ['pk', 'bd'] },
  { n: 'Французский Индокитай', from: 1900, to: 1954, a: 'la', m: ['vn', 'la', 'kh'] },
  { n: 'Корея', from: 1900, to: 1945, a: 'kp', m: ['kr', 'kp'] },
  { n: 'Эфиопия', from: 1952, to: 1993, a: 'et', m: ['et', '232'] },
  { n: 'ОАР', from: 1958, to: 1961, a: 'eg', m: ['eg', 'sy'] }
];
const eraBlocs = (y) => MAP_BLOCS.filter((b) => y >= b.from && y <= b.to);
function eraBlocOf(id, y) { return eraBlocs(y).find((b) => b.m.includes(id)) || null; }

function drawEraMap(svg, world, feats, path, byNum, cls) {
  if (!S || typeof topojson === 'undefined') return;
  const y = S.year, blocs = eraBlocs(y);
  const geoms = world.objects.countries.geometries;
  const isMember = (b, g) => b.m.some((x) => (x[0] === '#' ? g.properties && g.properties.name === x.slice(1) : /^\d+$/.test(x) ? g.id === x : g.id === ISO_NUM[x]));
  const rank = (c) => (!c ? 0 : c.id === S.country ? 4 : c.id === S.birthCountry ? 3 : S.visited.includes(c.id) ? 2 : 1);
  const layer = svg.append('g').attr('class', 'era-layer');
  for (const b of blocs) {
    const part = geoms.filter((g) => isMember(b, g));
    if (part.length < 2) continue;
    // цвет блока — по «самой важной» стране внутри него: где вы сейчас, родина, посещённая
    const best = part.map((g) => byNum[g.id]).filter(Boolean).sort((p, q) => rank(q) - rank(p))[0];
    const merged = topojson.merge(world, part);
    layer.append('path').datum(merged).attr('d', path).attr('class', cls(best) + ' era-bloc');
    const anchor = feats.find((f) => f.id === ISO_NUM[b.a]);
    if (anchor) {
      const [cx, cy] = path.centroid(anchor);
      const [[x0, y0], [x1, y1]] = path.bounds(merged);
      const fs = Math.max(8, Math.min(22, Math.sqrt((x1 - x0) * (y1 - y0)) / 9));
      if (Number.isFinite(cx)) layer.append('text').attr('x', cx).attr('y', cy + (b.a === 'ru' ? 8 : 0)).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('font-size', fs).attr('class', 'era-label').text(b.n);
    }
  }
  const note = document.querySelector('.map-era-note');
  if (note) note.textContent = blocs.length ? `Карта ${y} года: ${[...new Set(blocs.map((b) => b.n))].join(', ')}.` : `Карта ${y} года.`;
}
const _panelMapEra = panelMap;
panelMap = function () {
  _panelMapEra();
  const lg = document.querySelector('#sheetBody .map-legend');
  if (lg && !document.querySelector('#sheetBody .map-era-note')) lg.insertAdjacentElement('afterend', el(`<div class="muted map-era-note">Карта ${S.year} года.</div>`));
};

/* ---------- Место и дата рождения на стартовом экране ---------- */
function startYear() { return clamp(parseInt(($('#inYear') || {}).value, 10) || new Date().getFullYear(), 1900, 2060); }
function fillBirthCity() {
  const sel = $('#inCity'); if (!sel) return;
  const c = COUNTRIES.find((x) => x.id === $('#inCountry').value), was = sel.value, y = startYear();
  sel.innerHTML = '<option value="">🎲 Случайный город</option>' + (c ? c.cities.map((b) => `<option value="${esc(b)}">${esc(cityAt(b, y))}</option>`).join('') : '');
  sel.disabled = !c;
  if (c && c.cities.includes(was)) sel.value = was;
}
function fillBirthDay() {
  const d = $('#inDay'), m = $('#inMonth'); if (!d || !m) return;
  const keep = d.value, mm = +m.value || 1;
  const max = m.value ? monthDays(mm, startYear()) : 31;
  d.innerHTML = '<option value="">🎲 День</option>' + Array.from({ length: max }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
  if (keep && +keep <= max) d.value = keep;
}
(function () {
  const m = $('#inMonth'); if (!m) return;
  m.innerHTML = '<option value="">🎲 Месяц</option>' + MONTHS_NOM.map((n, i) => `<option value="${i + 1}">${n}</option>`).join('');
  fillBirthDay(); fillBirthCity();
  $('#inCountry').addEventListener('change', fillBirthCity);
  $('#inYear').addEventListener('input', () => { fillBirthCity(); fillBirthDay(); });
  m.addEventListener('change', fillBirthDay);
})();

/* ---------- Подсказка о дне рождения ---------- */
YEAR_HOOKS.push(() => { if (S && S.bday && S.age > 0 && S.age % 10 === 0) log(`🎂 ${bdayText()} вам исполнилось ${yrs(S.age)}.`, 'good'); });

/* ---------- Конкурсы талантов — с названиями своего времени ---------- */
(function () {
  const ERA_CONTEST = {
    code: [[1995, 'хакатон'], [0, 'олимпиаду по программированию']],
    cook: [[1960, 'кулинарное шоу'], [0, 'кулинарный конкурс']],
    dance: [[1985, 'танцевальный баттл'], [0, 'танцевальный конкурс']],
    business: [[1995, 'конкурс стартапов'], [0, 'конкурс бизнес-идей']]
  };
  for (const s of SKILLS) {
    const r = ERA_CONTEST[s.id]; if (!r) continue;
    Object.defineProperty(s, 'contest', { configurable: true, get: () => { const y = S ? S.year : new Date().getFullYear(); for (const [from, n] of r) if (y >= from) return n; return r[r.length - 1][1]; } });
  }
})();

/* ---------- Страховка: события из чужого времени не показываем ---------- */
const ERA_EVENT_MIN = { 'Звонок из «банка»': 2005, 'Инвестиционный совет': 2013, 'Конкурс талантов': 1955, 'Хедхантер': 1960, 'Папарацци': 1955, 'Ток-шоу': 1955, 'Взгляды у кулера': 1950, 'ДНК-тест': 2008, 'Стартап друга': 1985 };
const _evEra = ev;
ev = function (e, title, ...rest) {
  const min = ERA_EVENT_MIN[title];
  if (min && S && S.year < min) return;
  return _evEra(e, title, ...rest);
};
