'use strict';
/* ===================== Вызовы, ежедневный вызов, династия, графики, путешествия, пасхалки ===================== */

/* ---------- Графики: запись истории жизни ---------- */
function snap() { S.hist = S.hist || []; const last = S.hist[S.hist.length - 1]; const row = { a: S.age, y: S.year, h: S.stats.happy, he: S.stats.health, s: S.stats.smarts, l: S.stats.looks, n: netWorth(), k: S.karma }; if (last && last.a === S.age) S.hist[S.hist.length - 1] = row; else S.hist.push(row); }
YEAR_HOOKS.push(snap);
function lineChart(series, opts = {}) {
  const W = 320, H = opts.h || 140, P = 4;
  const all = series.flatMap((s) => s.v);
  const mn = opts.min ?? Math.min(...all), mx = opts.max ?? Math.max(...all, mn + 1);
  const n = Math.max(...series.map((s) => s.v.length));
  const X = (i) => P + (i / Math.max(1, n - 1)) * (W - 2 * P);
  const Y = (v) => H - P - ((v - mn) / (mx - mn || 1)) * (H - 2 * P);
  const lines = series.map((s) => `<polyline points="${s.v.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}" style="stroke:${s.c}"/>`).join('');
  const zero = mn < 0 && mx > 0 ? `<line x1="${P}" x2="${W - P}" y1="${Y(0)}" y2="${Y(0)}" class="zero"/>` : '';
  const grid = [0.25, 0.5, 0.75].map((f) => `<line x1="${P}" x2="${W - P}" y1="${(P + f * (H - 2 * P)).toFixed(1)}" y2="${(P + f * (H - 2 * P)).toFixed(1)}" class="grid"/>`).join('');
  const legend = series.length > 1 ? `<div class="chart-legend">${series.map((s) => `<span><i style="background:${s.c}"></i>${s.n}</span>`).join('')}</div>` : '';
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${grid}${zero}${lines}</svg>${legend}</div>`;
}
EXTRA_TITLES.charts = '📊 Графики жизни';
EXTRA_PANELS.charts = function () {
  snap();
  const H = S.hist; const B = $('#sheetBody');
  if (!S.alive) btnRow(B, [{ t: '← Назад к итогам', cls: 'primary', f: () => { closeSheet(); showDeath(); } }]);
  if (H.length < 2) { B.appendChild(el('<div class="empty">Проживите хотя бы пару лет, чтобы увидеть графики 📈</div>')); return; }
  const ages = `${H[0].a}–${H[H.length - 1].a} лет`;
  const c1 = card(`<div class="muted">Характеристики · ${ages}</div>${lineChart([{ n: 'Счастье', c: '#f59e0b', v: H.map((x) => x.h) }, { n: 'Здоровье', c: '#16a34a', v: H.map((x) => x.he) }, { n: 'Ум', c: '#5b5bf7', v: H.map((x) => x.s) }, { n: 'Внешность', c: '#e8467c', v: H.map((x) => x.l) }], { min: 0, max: 100 })}`);
  card(`<div class="muted">Капитал · максимум ${fmt(Math.max(...H.map((x) => x.n)))}</div>${lineChart([{ n: 'Капитал', c: '#0ea5e9', v: H.map((x) => x.n) }])}`);
  card(`<div class="muted">Карма</div>${lineChart([{ n: 'Карма', c: '#8b5cf6', v: H.map((x) => x.k) }], { min: 0, max: 100, h: 90 })}`);
  const best = H.reduce((a, b) => (b.h > a.h ? b : a)); const worst = H.reduce((a, b) => (b.h < a.h ? b : a)); const rich = H.reduce((a, b) => (b.n > a.n ? b : a));
  const l = section('Итоговая статистика');
  item(l, { e: '😊', t: 'Самый счастливый год', d: `${best.y} · в ${yrs(best.a)} · счастье ${best.h}` });
  item(l, { e: '😔', t: 'Самый тяжёлый год', d: `${worst.y} · в ${yrs(worst.a)} · счастье ${worst.h}` });
  item(l, { e: '💰', t: 'Пик богатства', d: `${fmt(rich.n)} · в ${yrs(rich.a)}` });
  item(l, { e: '💞', t: 'Отношений', d: `${S.stat.partners} · детей: ${S.stat.kids}` });
  item(l, { e: '💼', t: 'Работ сменили', d: `${S.stat.jobs}${S.biz ? ` · бизнес «${S.biz.name}»` : ''}` });
  item(l, { e: '🌍', t: 'Стран посетили', d: `${S.visited.length}${(S.souv || []).length ? ` · сувениров: ${S.souv.length}` : ''}` });
  item(l, { e: '⚖️', t: 'Преступлений', d: `${S.crimes || 0}` });
  item(l, { e: '🏆', t: 'Достижений за жизнь', d: `${Object.keys(S.ach).length}` });
  item(l, { e: '📜', t: 'Исторических событий пережито', d: `${(S.chron || []).length}` });
  void c1;
};
MENU_HOOKS.unshift((l) => item(l, { e: '📊', t: 'Графики жизни', d: 'Счастье, здоровье, деньги по годам', onClick: () => openPanel('charts') }));
for (const id of ['#sheetClose', '#sheetWrap']) document.querySelector(id).addEventListener('click', () => setTimeout(() => { if (S && !S.alive && $('#sheetWrap').hidden && $('#modalWrap').hidden) pump(); }, 0));

/* ---------- Вызовы ---------- */
const CH_KEY = 'lifesim_challenges_v1', DAILY_KEY = 'lifesim_daily_v1';
const CHALLENGES = [
  { id: 'mil30', e: '💰', t: 'Миллионер до 30', d: 'Капитал 100 млн ₽ до 30 лет', ok: () => S.age < 30 && netWorth() >= 1e8, fail: () => S.age >= 30 },
  { id: 'live100', e: '🎂', t: 'Долгожитель', d: 'Дожить до 100 лет', ok: () => S.age >= 100 },
  { id: 'pres', e: '🏛️', t: 'К вершине власти', d: 'Стать главой государства', ok: () => S.pol && S.pol.lvl === 5 },
  { id: 'kids5', e: '👨‍👩‍👧‍👦', t: 'Многодетность', d: 'Вырастить 5 детей', ok: () => S.stat.kids >= 5 },
  { id: 'world20', e: '🌍', t: 'Гражданин мира', d: 'Посетить 20 стран', ok: () => S.visited.length >= 20 },
  { id: 'saint', e: '😇', t: 'Святой', d: 'Карма 100 без единого преступления', ok: () => S.karma >= 100 && !S.crimes, fail: () => S.crimes > 0 },
  { id: 'escape', e: '🏃', t: 'Побег из Шоушенка', d: 'Сбежать из тюрьмы', ok: () => S.ach.escape != null },
  { id: 'star', e: '🌟', t: 'Звезда', d: 'Слава 80+', ok: () => (S.fame || 0) >= 80 },
  { id: 'tycoon', e: '🏭', t: 'Магнат', d: 'Бизнес дороже 1 млрд ₽', ok: () => S.biz && S.biz.value >= 1e9 },
  { id: 'phd30', e: '🎓', t: 'Вундеркинд', d: 'Стать доктором наук до 30', ok: () => S.edu.level === 'phd' && S.age < 30, fail: () => S.age >= 30 },
  { id: 'spy5', e: '🕵️', t: 'Директор разведки', d: 'Дослужиться до вершины в разведке', ok: () => S.spy && S.spy.lvl === 5 },
  { id: 'noWork', e: '🛋️', t: 'Рантье', d: 'Капитал 10 млн ₽ к 40, ни дня на работе', ok: () => S.age >= 40 && netWorth() >= 1e7 && !S.stat.jobs, fail: () => S.stat.jobs > 0 || (S.age >= 40 && netWorth() < 1e7) },
  { id: 'rags', e: '📈', t: 'Из грязи в князи', d: 'Родиться до 1930 и стать миллиардером', ok: () => S.birthYear < 1930 && netWorth() >= 1e9, fail: () => S.birthYear >= 1930 },
  { id: 'hero', e: '🎖️', t: 'Герой войны', d: 'Получить 3 боевые награды', ok: () => (S.medals || 0) >= 3 },
  { id: 'genius', e: '🧠', t: 'Гений', d: 'Ум 100 и профессор или академик', ok: () => S.stats.smarts >= 100 && S.job && S.job.id === 'scientist' && S.job.lvl >= 2 }
];
const chDone = () => { try { return JSON.parse(localStorage.getItem(CH_KEY)) || {}; } catch (e) { return {}; } };
function chCheck() {
  const c = S.challenge; if (!c || c.done || c.failed) return;
  const d = CHALLENGES.find((x) => x.id === c.id); if (!d) return;
  if (d.ok()) {
    c.done = S.age; const all = chDone(); all[d.id] = (all[d.id] || 0) + 1; try { localStorage.setItem(CH_KEY, JSON.stringify(all)); } catch (e) {}
    log(`🏁 Вызов выполнен: «${d.t}»!`, 'good'); toast(`🏁 Вызов «${d.t}» выполнен!`); sfx('ach'); unlock('challenger'); eff({ happy: 15 });
  } else if (d.fail && d.fail()) { c.failed = S.age; log(`❌ Вызов «${d.t}» провален.`, 'bad'); }
}
YEAR_HOOKS.push(chCheck);
EXTRA_TITLES.challenges = '🏁 Вызовы';
EXTRA_PANELS.challenges = function () {
  const done = chDone(); const c = S.challenge; const cur = c && CHALLENGES.find((x) => x.id === c.id);
  card(`<div class="muted">Текущий вызов</div><div class="big">${cur ? `${cur.e} ${esc(cur.t)}` : 'Без вызова'}</div><div class="muted">${cur ? esc(cur.d) + (c.done != null ? ' · ✅ выполнен' : c.failed != null ? ' · ❌ провален' : ' · в процессе') : 'Выберите цель на эту жизнь'}</div>${S.daily ? `<div class="muted">🗓️ Ежедневный вызов ${esc(S.daily)}</div>` : ''}`);
  const l = section(`Все вызовы · выполнено ${Object.keys(done).length} из ${CHALLENGES.length}`);
  for (const x of CHALLENGES) item(l, { e: x.e, t: x.t, d: x.d + (done[x.id] ? ` · ✅ ×${done[x.id]}` : ''), r: c && c.id === x.id ? '●' : '', disabled: S.daily, onClick: act(() => { S.challenge = { id: x.id }; chCheck(); return `🏁 Новый вызов: «${x.t}». ${x.d}.`; }) });
};
MENU_HOOKS.unshift((l) => item(l, { e: '🏁', t: 'Вызовы', d: S.challenge ? CHALLENGES.find((x) => x.id === S.challenge.id)?.t : 'Цель на эту жизнь', onClick: () => openPanel('challenges') }));
(function () {
  const sel = document.getElementById('inChallenge');
  sel.innerHTML = '<option value="">Без вызова</option><option value="rand">🎲 Случайный</option>' + CHALLENGES.map((c) => `<option value="${c.id}">${c.e} ${c.t}</option>`).join('');
})();

/* ---------- Ежедневный вызов: одинаковый старт для всех ---------- */
function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const dailyRec = () => { try { return JSON.parse(localStorage.getItem(DAILY_KEY)) || {}; } catch (e) { return {}; } };
function startDaily() {
  const key = today(); const seed = parseInt(key.replace(/-/g, ''), 10);
  const R = mulberry(seed); const orig = Math.random;
  try {
    Math.random = R;
    const year = 1900 + Math.floor(R() * 140); const country = COUNTRIES[Math.floor(R() * COUNTRIES.length)].id;
    const ch = CHALLENGES[Math.floor(R() * CHALLENGES.length)].id;
    newLife({ year, country, dmode: 'normal' });
    S.challenge = { id: ch }; S.daily = key;
  } finally { Math.random = orig; }
  log(`🗓️ Ежедневный вызов ${key}: у всех игроков сегодня такой же старт.`, 'info');
  save(); showGame();
}
document.getElementById('dailyBtn').addEventListener('click', startDaily);
(function () {
  const r = dailyRec()[today()];
  if (r) document.getElementById('dailyBtn').textContent = `🗓️ Ежедневный вызов · рекорд ${r.grade} ${r.score}`;
})();
DEATH_HOOKS.push(() => {
  if (!S.daily) return;
  const all = dailyRec(); const sc = lifeScore() + (S.challenge && S.challenge.done != null ? 25 : 0);
  const prev = all[S.daily];
  if (!prev || sc > prev.score) { all[S.daily] = { score: sc, grade: grade(sc) }; try { localStorage.setItem(DAILY_KEY, JSON.stringify(all)); } catch (e) {} }
  S.dailyScore = sc; S.dailyPrev = prev ? prev.score : null;
});

/* ---------- Династия ---------- */
const CRESTS = ['🦁', '🦅', '🐺', '🐻', '🦌', '🐉', '🌹', '⚜️', '🗝️', '⚓', '🌲', '🔥'];
const _newLifeM = newLife;
newLife = function (opts = {}) {
  const mode = opts.dmode || (document.getElementById('inMode') ? document.getElementById('inMode').value : 'normal');
  const chSel = opts.generation || opts.dmode ? '' : (document.getElementById('inChallenge') || {}).value;
  const r = _newLifeM(opts);
  if (!opts.generation && !opts.dyn) {
    if (mode === 'dynasty') { S.dyn = { name: S.surnameBase, crest: pick(CRESTS), founded: S.year, honor: 0, fund: 0, heirlooms: [], bizGen: 0 }; log(`👑 Основана династия ${S.surnameBase}. Герб: ${S.dyn.crest}.`, 'good'); }
    if (chSel) { const id = chSel === 'rand' ? pick(CHALLENGES).id : chSel; S.challenge = { id }; const d = CHALLENGES.find((x) => x.id === id); log(`🏁 Вызов на эту жизнь: «${d.t}». ${d.d}.`, 'info'); }
  }
  if (opts.dyn) S.dyn = opts.dyn;
  snap();
  return r;
};
const _contAs = continueAs;
continueAs = function (k) {
  const old = S; const dyn = old.dyn; const biz = old.biz; const fund = dyn ? dyn.fund : 0;
  const houses = dyn ? old.assets.filter((a) => a.type === 'house') : [];
  const sc = lifeScore();
  if (dyn) { dyn.honor += sc; dyn.fund = 0; if (biz) dyn.bizGen = (dyn.bizGen || 0) + 1; if (old.medals) dyn.heirlooms.push(`🎖️ Ордена ${old.first}`); if (old.memoir) dyn.heirlooms.push(`📕 Мемуары ${old.first}`); if ((old.souv || []).length) dyn.heirlooms.push(old.souv[old.souv.length - 1]); if (old.pol && old.pol.lvl >= 3) dyn.heirlooms.push(`🏛️ Портрет ${old.first} в парламенте`); dyn.heirlooms = dyn.heirlooms.slice(-20); }
  _contAs(k);
  if (dyn) {
    S.dyn = dyn;
    if (fund) { S.dyn.fund = fund; log(`👑 Семейный фонд перешёл к вам без налога: ${fmt(fund)}.`, 'good'); }
    if (biz) { S.biz = biz; S.money -= Math.min(Math.max(S.money, 0), biz.value * 0.87); log(`🏭 Семейный бизнес «${biz.name}» теперь ваш.`, 'good'); if (dyn.bizGen >= 3) unlock('oldmoney'); }
    for (const h of houses) if (!S.assets.some((a) => a.uid === h.uid)) { S.assets.push(h); S.money -= Math.min(Math.max(S.money, 0), h.value * 0.87); }
    if (houses.length) log(`🏡 Вы унаследовали родовое гнездо: ${houses.map((h) => h.name).join(', ')}.`, 'good');
    S.ownHome = houses.length > 0;
    if (S.generation >= 5) unlock('dynasty5');
    if (S.year - dyn.founded >= 100) unlock('century_dyn');
    save(); render();
  }
};
YEAR_HOOKS.push(() => { if (S.dyn && S.dyn.fund > 0) S.dyn.fund = Math.round(S.dyn.fund * 1.05); if (S.dyn && S.dyn.fund >= 1e9) unlock('dynfund'); });
EXTRA_TITLES.dynasty = '👑 Династия';
EXTRA_PANELS.dynasty = function () {
  const D = S.dyn;
  if (!D) {
    card('<div class="muted">👑 Режим династии</div><div class="big">Вы — первый в роду?</div><div class="muted">Основав династию, вы получите семейный фонд без налога на наследство, герб, реликвии, а дом и бизнес будут переходить детям.</div>');
    btnRow($('#sheetBody'), [{ t: '👑 Основать династию', cls: 'primary', f: act(() => { S.dyn = { name: S.surnameBase, crest: pick(CRESTS), founded: S.year, honor: 0, fund: 0, heirlooms: [], bizGen: 0 }; return `Основана династия ${S.surnameBase}. Герб: ${S.dyn.crest}.`; }) }]);
    return;
  }
  const gens = (S.lineage || []).length + 1;
  card(`<div class="dyn-crest">${D.crest}</div><div class="big" style="text-align:center">Дом ${esc(D.name)}</div><div class="muted" style="text-align:center">Основан в ${D.founded} · поколений: ${gens} · честь рода: ${D.honor + lifeScore()}</div>`);
  const l = section('Семейный фонд');
  item(l, { e: '🏦', t: `В фонде: ${fmt(D.fund)}`, d: '+5% в год, переходит наследнику без налога' });
  btnRow($('#sheetBody'), [
    { t: '➕ Внести 25% наличных', disabled: S.money <= 0, f: act(() => { const a = Math.round(S.money * 0.25); S.money -= a; D.fund += a; return `Вы внесли ${fmt(a)} в семейный фонд.`; }) },
    { t: '➖ Взять 10%', disabled: D.fund <= 0, f: act(() => { const a = Math.round(D.fund * 0.1); D.fund -= a; S.money += a; D.honor -= 2; return `Вы взяли из фонда ${fmt(a)}. Предки неодобрительно смотрят с портретов.`; }) }
  ]);
  const l2 = section('Герб и традиции');
  item(l2, { e: D.crest, t: 'Сменить герб', d: 'Символ рода', onClick: act(() => { D.crest = CRESTS[(CRESTS.indexOf(D.crest) + 1) % CRESTS.length]; return `Новый герб: ${D.crest}`; }) });
  item(l2, { e: '🌳', t: 'Древо рода', d: `${gens} ${plural(gens, ['поколение', 'поколения', 'поколений'])}`, onClick: () => openPanel('tree') });
  const l3 = section('Реликвии');
  if (!D.heirlooms.length) l3.appendChild(el('<div class="empty">Пока нет. Реликвии появятся от наград, мемуаров и путешествий предков.</div>'));
  for (const h of D.heirlooms) item(l3, { e: '🗝️', t: h });
  const l4 = section('Цели династии');
  for (const [ok, t] of [[gens >= 5, '5 поколений'], [S.year - D.founded >= 100, '100 лет роду'], [D.fund >= 1e9, 'Фонд 1 млрд ₽'], [(D.bizGen || 0) >= 3, 'Семейный бизнес в 3 поколениях']]) item(l4, { e: ok ? '✅' : '⬜', t });
};
MENU_HOOKS.unshift((l) => item(l, { e: S.dyn ? S.dyn.crest : '👑', t: 'Династия', d: S.dyn ? `Дом ${S.dyn.name} · фонд ${fmt(S.dyn.fund)}` : 'Основать свой род', onClick: () => openPanel('dynasty') }));
/* Наследник без детей: дальний родственник */
const _showDeathM = showDeath;
showDeath = function () {
  _showDeathM();
  const T = $('#modalText'); const A = $('#modalActions');
  const extra = [];
  if (S.challenge) { const d = CHALLENGES.find((x) => x.id === S.challenge.id); if (d) extra.push(`🏁 Вызов «${esc(d.t)}»: ${S.challenge.done != null ? '✅ выполнен' : '❌ не выполнен'}`); }
  if (S.daily) extra.push(`🗓️ Ежедневный ${esc(S.daily)}: ${S.dailyScore} очков${S.dailyPrev != null ? ` · прошлый рекорд ${S.dailyPrev}` : ' · первый результат!'}`);
  if (S.dyn) extra.push(`👑 Дом ${esc(S.dyn.name)} · честь рода ${S.dyn.honor + lifeScore()}`);
  if (extra.length) T.appendChild(el(`<div class="death-extra">${extra.map((x) => `<div>${x}</div>`).join('')}</div>`));
  const mk = (t, f) => { const b = document.createElement('button'); b.className = 'btn ghost'; b.textContent = t; b.onclick = f; A.insertBefore(b, A.lastChild); };
  mk('📊 Графики жизни', () => { closeModal(); openPanel('charts'); });
  if (S.dyn && !S.people.some((p) => p.role === 'child' && p.alive)) mk('🧬 Найти дальнего родственника', () => {
    closeModal();
    const g = npcGender(); const k = makePerson('child', { gender: g, age: rnd(18, 30), surname: surnameFor(S.surnameBase, g, C().names), looks: rnd(30, 90), smarts: rnd(30, 90), close: 30 });
    S.people.push(k); if (S.dyn) S.dyn.honor -= 20; continueAs(k); log('🧬 Династию продолжил дальний родственник. Честь рода немного пострадала.', 'info');
  });
};
ACHIEVEMENTS.push(
  { id: 'challenger', e: '🏁', t: 'Вызов принят', d: 'Выполнить любой вызов' },
  { id: 'dynasty5', e: '👑', t: 'Старый род', d: '5 поколений династии' },
  { id: 'century_dyn', e: '🏰', t: 'Вековая династия', d: 'Роду 100 лет' },
  { id: 'dynfund', e: '💎', t: 'Семейное состояние', d: 'Фонд династии 1 млрд ₽' },
  { id: 'oldmoney', e: '🎩', t: 'Старые деньги', d: 'Семейный бизнес в 3 поколениях' }
);

/* ---------- Путешествия ---------- */
const SOCBLOC = ['bg', 'cz', 'pl', 'hu', 'ro', 'de', 'mn', 'cu', 'vn', 'kp', 'rs', 'sk'];
const SOUVENIRS = { beach: ['🐚 Ракушка', '🕶️ Тёмные очки', '🏄 Доска для серфинга', '🌺 Гавайская рубашка'], city: ['🗼 Брелок с башней', '🧲 Магнит на холодильник', '☕ Кружка с видом', '🖼️ Картина уличного художника'], mountain: ['🧗 Карабин', '🧣 Шерстяной шарф', '🍯 Горный мёд'], cruise: ['⚓ Якорь-брелок', '🧭 Компас', '📸 Фото с капитаном'], safari: ['🦒 Деревянный жираф', '🥁 Барабан джембе', '🪶 Перо марабу'], ski: ['🎿 Значок курорта', '🧤 Варежки'], space: ['🌑 Лунная пыль в колбе', '👨‍🚀 Нашивка экипажа'], home: ['🥟 Банка варенья', '📮 Открытка', '🪆 Матрёшка'] };
const TRIPS = [
  { id: 'home', e: '🚂', t: 'По родной стране', c: 30000, k: 'home', d: 'Поезд, палатка и новые города' },
  { id: 'beach', e: '🏖️', t: 'Пляжный отдых', c: 150000, k: 'beach', d: '+много счастья', where: ['tr', 'eg', 'th', 'es', 'gr', 'it', 'do', 'cu', 'idn', 'mx', 'cy', 'hr', 'me', 'bg', 'tn', 'my', 'lk', 'pt', 'fj', 'ae'] },
  { id: 'city', e: '🏙️', t: 'Город мечты', c: 180000, k: 'city', d: 'Музеи, кафе, архитектура', where: ['fr', 'it', 'gb', 'us', 'jp', 'de', 'es', 'cz', 'at', 'nl', 'hu', 'kr', 'sg', 'ae', 'tr', 'pt', 'ar', 'cn'] },
  { id: 'mountain', e: '⛰️', t: 'Горы и треккинг', c: 120000, k: 'mountain', d: '+здоровье, есть риск', where: ['np', 'ch', 'ge', 'kg', 'pe', 'no', 'is', 'nz', 'at', 'am', 'tj', 'bo'] },
  { id: 'cruise', e: '🚢', t: 'Морской круиз', c: 400000, k: 'cruise', d: 'Несколько стран за раз', where: ['gr', 'it', 'hr', 'no', 'es', 'mt', 'cu', 'jm', 'pa'] },
  { id: 'safari', e: '🦁', t: 'Сафари', c: 450000, k: 'safari', d: 'Львы, слоны и закаты', yr: 1920, where: ['ke', 'tz', 'za', 'ug', 'zw', 'mz'] },
  { id: 'ski', e: '🎿', t: 'Горнолыжный курорт', c: 250000, k: 'ski', d: 'Снег и глинтвейн', yr: 1930, where: ['ch', 'at', 'fr', 'it', 'ca', 'no', 'ge', 'kz', 'ad'] },
  { id: 'space', e: '🚀', t: 'Космический туризм', c: 50000000, k: 'space', d: 'Орбита Земли', yr: 2030 }
];
function canTravelAbroad(to) {
  if (USSR.includes(S.country) && S.year >= 1930 && S.year < 1988 && !USSR.includes(to)) return SOCBLOC.includes(to) && S.karma >= 40;
  if (S.country === 'kp') return false;
  const w = typeof WARS !== 'undefined' && WARS.some((x) => x.ids.includes(to) && S.year >= x.a && S.year <= x.b);
  return !w;
}
EXTRA_TITLES.travel = '✈️ Путешествия';
EXTRA_PANELS.travel = function () {
  const left = 2 - (S.used.trips || 0);
  const transport = S.year < 1930 ? 'пароходом и поездом' : S.year < 1960 ? 'поездом и первыми авиалиниями' : 'самолётом';
  card(`<div class="muted">🧳 Посещено стран: ${S.visited.length} из ${COUNTRIES.length}</div><div class="big">Куда отправимся?</div><div class="muted">Путешествуем ${transport}. Поездок в этом году: ${left}${USSR.includes(S.country) && S.year >= 1930 && S.year < 1988 ? ' · за границу только в соцстраны и с хорошей характеристикой' : ''}</div>`);
  const l = section('Направления');
  for (const t of TRIPS.filter((x) => !x.yr || S.year >= x.yr)) {
    const c = price(t.c);
    item(l, { e: t.e, t: t.t, d: `${t.d} · ${fmt(c)}`, disabled: left <= 0 || S.money < c || S.age < 16 || S.prison, onClick: () => tripPick(t, c) });
  }
  const sv = S.souv || [];
  const l2 = section(`Сувениры · ${sv.length}`);
  if (!sv.length) l2.appendChild(el('<div class="empty">Полка пока пустая</div>'));
  else l2.appendChild(el(`<div class="souv">${sv.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`));
};
function tripPick(t, c) {
  if (t.id === 'home' || t.id === 'space') return act(() => doTrip(t, c, C()))();
  const opts = (t.where || []).map((id) => COUNTRIES.find((x) => x.id === id)).filter((x) => x && x.id !== S.country && canTravelAbroad(x.id));
  if (!opts.length) { toast('Сейчас туда не попасть 🚫'); return; }
  const shown = opts.sort(() => Math.random() - 0.5).slice(0, 5);
  Q.push({ e: t.e, title: t.t, text: 'Выберите страну:', choices: shown.map((x) => ({ t: `${x.flag} ${cname(x)}${S.visited.includes(x.id) ? '' : ' · новая!'}`, f: () => doTrip(t, c, x) })).concat([{ t: 'Отмена', f: () => null }]) });
  pump();
}
function doTrip(t, c, to) {
  S.used.trips = (S.used.trips || 0) + 1; S.money -= c;
  const isNew = !S.visited.includes(to.id); if (isNew) S.visited.push(to.id);
  const city = t.id === 'space' ? 'орбита' : pick(to.cities);
  S.souv = S.souv || []; const sv = `${pick(SOUVENIRS[t.k])} · ${t.id === 'space' ? '🌍' : to.flag}`; if (!S.souv.includes(sv)) S.souv.push(sv);
  eff({ happy: rnd(8, 16), smarts: rnd(0, 2) });
  if (t.id === 'mountain') eff({ health: rnd(2, 6) });
  if (t.id === 'space') { unlock('spacetourist'); return `🚀 Вы облетели Землю на орбите. Планета такая маленькая и хрупкая...`; }
  let tale = '';
  const x = rnd(1, 9);
  if (x === 1) { tale = ' Авиакомпания потеряла ваш багаж. Неделю ходили в одной футболке.'; eff({ happy: -5 }); }
  else if (x === 2) { tale = ' Местная кухня оказалась слишком экзотической — два дня в номере.'; eff({ health: -4 }); }
  else if (x === 3) { tale = ` В кафе вы встретили знаменитость и сделали селфи!`; S.followers += rnd(100, 3000); }
  else if (x === 4) { const f = makePerson('friend', { age: S.age + rnd(-5, 5), close: 60, pool: to.names, country: to.id }); S.people.push(f); tale = ` Вы подружились с местным жителем по имени ${f.name}.`; }
  else if (x === 5 && t.id === 'mountain' && chance(0.3)) { eff({ health: -15 }); tale = ' Вы подвернули ногу на тропе. Спасатели спустили вас вниз.'; }
  else if (x === 6) { const l = Math.min(Math.max(0, S.money), price(20000)); S.money -= l; tale = ' Карманники на рынке оказались профессионалами.'; }
  else if (x === 7) { tale = ' Закат был таким, что вы впервые за долгое время ни о чём не думали.'; eff({ happy: 6 }); }
  else if (x === 8) { tale = ' Вы выучили пару фраз на местном языке.'; eff({ smarts: 2 }); }
  if (S.visited.length >= 30) unlock('globetrotter');
  return `${t.e} ${t.t}: ${to.flag} ${city}${isNew ? ' (новая страна!)' : ''}. Сувенир: ${sv.split(' · ')[0]}.${tale}`;
}
const trAct = ACTIVITIES.find((a) => a.id === 'travel');
if (trAct) { trAct.t = 'Путешествия'; trAct.d = 'Курорты, круизы, сафари, горы'; trAct.cost = 0; trAct.min = 16; trAct.run = () => { delete S.used.travel; setTimeout(() => openPanel('travel'), 10); return null; }; }

ACHIEVEMENTS.push({ id: 'spacetourist', e: '🚀', t: 'Космотурист', d: 'Слетать на орбиту' }, { id: 'globetrotter', e: '🧳', t: 'Глобтроттер', d: 'Посетить 30 стран' });

/* ---------- Пасхалки и редкие события ---------- */
EVENTS.push(
  { min: 10, max: 90, w: 0.25, once: 'ufo', run: () => ev('🛸', 'Яркий свет', 'Ночью над полем зависла светящаяся тарелка. Вас манит луч.', [
    { t: 'Шагнуть в луч', f: () => { eff({ smarts: 15, happy: 10 }); unlock('ufo'); return 'Вы очнулись через три дня в другом городе. Почему-то теперь вы знаете квантовую физику.'; } },
    { t: 'Бежать!', f: () => 'Вы бежали до самого дома. Никто вам не поверил.' }]) },
  { min: 18, max: 80, w: 0.2, once: 'jackpot', run: () => { const g = price(rnd(50, 300) * 1000000); S.money += g; eff({ happy: 30 }); unlock('jackpot'); log(`🎰 Билет, найденный на тротуаре, выиграл джекпот: ${fmt(g)}!`, 'good'); } },
  { min: 16, max: 70, w: 0.3, once: 'double', run: () => ev('🪞', 'Двойник', 'В метро вы встретили человека, похожего на вас как две капли воды.', [
    { t: 'Поменяться жизнями на день', f: () => { eff({ happy: 12 }); unlock('double'); return chance(0.5) ? 'Вы провели день как директор банка. Никто не заметил подмены!' : 'Вы день прожили чужой жизнью. Оказалось, у двойника три кота и тёща.'; } },
    { t: 'Сфотографироваться вместе', f: () => { S.followers += rnd(1000, 50000); return 'Фото «двойников» стало вирусным.'; } }]) },
  { min: 18, max: 80, w: 0.2, once: 'timetravel', cond: () => S.year < 2025, run: () => { const crisis = RECESSION.find((y) => y > S.year) || S.year + 10; ev('⏳', 'Путешественник во времени', `Странный человек в серебристом плаще шепчет: «В ${crisis} году продай всё и купи золото!» — и исчезает.`, [
    { t: 'Запомнить', f: () => { S.ttHint = crisis; unlock('timetraveler'); return `Вы записали дату ${crisis} в блокнот.`; } },
    { t: 'Сумасшедший какой-то', f: () => 'Вы пожали плечами.' }]); } },
  { min: 5, max: 90, w: 0.15, once: 'lightning', run: () => { eff({ health: -10, smarts: 5 }); unlock('lightning'); log('⚡ В вас ударила молния! Вы выжили, а волосы теперь стоят дыбом.', 'bad'); } },
  { min: 6, max: 70, w: 0.3, once: 'dino', run: () => { S.souv = S.souv || []; S.souv.push('🦴 Кость динозавра'); S.money += price(500000); log('🦖 Копая грядку, вы нашли кость динозавра! Музей выкупил её за хорошие деньги.', 'good'); unlock('dino'); } },
  { min: 8, max: 80, w: 0.3, once: 'cat', run: () => ev('🐈‍⬛', 'Говорящий кот', 'Чёрный кот у подъезда отчётливо сказал: «Не ходи завтра на работу».', [
    { t: 'Послушаться', f: () => { eff({ happy: 4 }); return chance(0.5) ? 'На следующий день на офис упала строительная люлька. Спасибо, кот!' : 'Ничего не случилось, но вы выспались.'; } },
    { t: 'Показалось', f: () => 'Кот посмотрел на вас с жалостью.' }]) },
  { min: 25, max: 85, w: 0.2, once: 'royal', run: () => { unlock('royal'); S.money += price(5000000); log((S.year >= 2005 ? '👑 Генеалогический тест показал:' : '👑 Старинные документы в архиве показали:') + ' вы — дальний потомок королевской семьи! Вам прислали фамильный перстень и чек.', 'good'); } },
  { min: 42, max: 42, w: 3, once: 'answer42', run: () => log('🌌 Вам 42. Говорят, это ответ на главный вопрос жизни, вселенной и всего такого.', 'info') },
  { min: 25, max: 25, w: 50, once: 'matrix', cond: () => /^(нео|neo|томас андерсон)$/i.test(S.first), run: () => ev('💊', 'Морфеус', 'Человек в чёрных очках протягивает две таблетки.', [
    { t: '🔴 Красная', f: () => { eff({ smarts: 20, happy: -5 }); unlock('matrix'); return 'Вы проснулись в капсуле. Добро пожаловать в реальный мир.'; } },
    { t: '🔵 Синяя', f: () => { eff({ happy: 10 }); return 'Вы проснулись в своей кровати и верите во всё, во что хотите.'; } }]) }
);
YEAR_HOOKS.push(() => {
  if (S.ttHint && S.year === S.ttHint - 1 && S.inv.stocks) { log('⏳ Вы вспомнили слова путешественника во времени и продали акции.', 'good'); S.money += S.inv.stocks; S.inv.stocks = 0; }
  if (S.birthYear === 2000) unlock('millennium');
});
(function konami() {
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let i = 0;
  document.addEventListener('keydown', (e) => { i = e.key === code[i] ? i + 1 : e.key === code[0] ? 1 : 0; if (i === code.length) { i = 0; if (S && S.alive) { S.money += price(1000000); unlock('konami'); toast('🎮 Код Конами! +' + fmt(price(1000000))); render(); save(); } } });
})();
ACHIEVEMENTS.push(
  { id: 'ufo', e: '🛸', t: 'Похищенный', d: 'Шагнуть в луч НЛО' }, { id: 'jackpot', e: '🎰', t: 'Счастливый билет', d: 'Найти выигрышный билет' },
  { id: 'double', e: '🪞', t: 'Двойник', d: 'Встретить своего двойника' }, { id: 'timetraveler', e: '⏳', t: 'Из будущего', d: 'Встретить путешественника во времени' },
  { id: 'lightning', e: '⚡', t: 'Громоотвод', d: 'Пережить удар молнии' }, { id: 'dino', e: '🦖', t: 'Палеонтолог', d: 'Найти кость динозавра' },
  { id: 'royal', e: '👑', t: 'Голубая кровь', d: 'Узнать о королевских предках' }, { id: 'matrix', e: '💊', t: 'Избранный', d: 'Секрет для тех, кого зовут Нео' },
  { id: 'konami', e: '🎮', t: '↑↑↓↓←→←→BA', d: 'Секретный код' }, { id: 'millennium', e: '🎆', t: 'Дитя миллениума', d: 'Родиться в 2000 году' }
);
