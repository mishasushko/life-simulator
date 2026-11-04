'use strict';
/* ===================== Слоты, перенос, рекорды друзей, альбом жизней, дневник, сложность ===================== */

/* ---------- 2. Слоты сохранения ---------- */
const SLOT_KEY = 'lifesim_slot';
let curSlot = 1;
try { curSlot = Math.min(3, Math.max(1, parseInt(localStorage.getItem(SLOT_KEY), 10) || 1)); } catch (e) {}
const slotKey = (n) => (n === 1 ? SAVE_KEY : `${SAVE_KEY}_s${n}`);
function readSlot(n) { try { return JSON.parse(localStorage.getItem(slotKey(n))); } catch (e) { return null; } }
save = function () { try { localStorage.setItem(slotKey(curSlot), JSON.stringify(S)); } catch (e) { toast('⚠️ Не удалось сохранить: мало места в браузере'); } };
loadSave = function () { return readSlot(curSlot); };
toStart = function () {
  try { localStorage.removeItem(slotKey(curSlot)); } catch (e) {}
  S = null; Q = [];
  closeSheet(); closeModal();
  $('#game').classList.remove('active'); $('#start').classList.add('active');
  renderSlots();
};
function renderSlots() {
  const box = document.getElementById('slots'); if (!box) return;
  box.innerHTML = '';
  for (let n = 1; n <= 3; n++) {
    const s = readSlot(n);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'slot' + (n === curSlot ? ' on' : '');
    const c = s && COUNTRIES.find((x) => x.id === s.country);
    b.innerHTML = s && s.alive ? `<b>${n}</b><span>${esc(s.first)} ${esc(s.surname || '')}</span><small>${c ? c.flag : ''} ${s.age} · ${s.year}</small>` : `<b>${n}</b><span>Пусто</span><small>новая жизнь</small>`;
    b.onclick = () => { curSlot = n; try { localStorage.setItem(SLOT_KEY, n); } catch (e) {} renderSlots(); };
    box.appendChild(b);
  }
  const s = readSlot(curSlot);
  $('#continueBtn').hidden = !(s && s.alive);
}
(function () {
  const form = document.getElementById('startForm');
  const wrap = el('<div class="slots-wrap"><div class="slots-label">Слот сохранения</div><div class="slots" id="slots"></div></div>');
  form.insertBefore(wrap, form.querySelector('.form-title').nextSibling);
  const diff = el('<label>Сложность<select id="inDiff"><option value="normal">⚖️ Обычная</option><option value="easy">🍼 Лёгкая: богатые родители</option><option value="hard">💀 Хардкор: бедность и болезни</option></select></label>');
  form.insertBefore(diff, document.getElementById('startForm').querySelector('button[type=submit]'));
  const imp = el('<button class="btn ghost" type="button" id="importBtn">📥 Загрузить сохранение с другого устройства</button>');
  form.appendChild(imp);
  imp.onclick = importSave;
  renderSlots();
})();

/* ---------- Перенос между устройствами ---------- */
const BUNDLE_KEYS = () => [SAVE_KEY, `${SAVE_KEY}_s2`, `${SAVE_KEY}_s3`, ACH_KEY, 'lifesim_graves_v1', 'lifesim_challenges_v1', 'lifesim_daily_v1', 'lifesim_album_v1', 'lifesim_friends_v1'];
async function packBundle() {
  const data = {}; for (const k of BUNDLE_KEYS()) { const v = localStorage.getItem(k); if (v) data[k] = v; }
  const json = JSON.stringify({ v: 1, at: Date.now(), data });
  if (typeof CompressionStream !== 'undefined') {
    const buf = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
    let bin = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return 'LIFESIM1:' + btoa(bin);
  }
  return 'LIFESIM0:' + btoa(unescape(encodeURIComponent(json)));
}
async function unpackBundle(code) {
  code = code.trim();
  if (code.startsWith('LIFESIM1:')) {
    const bin = atob(code.slice(9)); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return JSON.parse(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
  }
  if (code.startsWith('LIFESIM0:')) return JSON.parse(decodeURIComponent(escape(atob(code.slice(9)))));
  if (code.startsWith('{')) return JSON.parse(code);
  throw new Error('bad code');
}
async function exportSave() {
  if (S) save();
  const code = await packBundle();
  const blob = new Blob([code], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `zhizn-save-${new Date().toISOString().slice(0, 10)}.lifesim.txt`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  try { await navigator.clipboard.writeText(code); toast('💾 Файл скачан, код скопирован'); } catch (e) { toast('💾 Файл сохранения скачан'); }
}
function importSave() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.txt,.json,.lifesim,text/plain';
  inp.onchange = async () => { const f = inp.files[0]; if (f) applyImport(await f.text()); };
  Q.push({ e: '📥', title: 'Загрузить сохранение', text: 'Выберите файл, скачанный на другом устройстве, или вставьте код.', choices: [
    { t: '📁 Выбрать файл', f: () => { inp.click(); return null; } },
    { t: '📋 Вставить код', f: () => { const c = prompt('Вставьте код сохранения:'); if (c) applyImport(c); return null; } },
    { t: 'Отмена', f: () => null }] });
  if (!S) { showModal(Q.shift()); } else pump();
}
async function applyImport(code) {
  try {
    const b = await unpackBundle(code);
    if (!b || !b.data) throw new Error('empty');
    for (const k in b.data) if (BUNDLE_KEYS().includes(k)) localStorage.setItem(k, b.data[k]);
    globalAch = loadAch();
    toast('✅ Сохранение загружено'); renderSlots();
    if (S) { S = null; toStartKeep(); }
  } catch (e) { toast('⚠️ Не получилось прочитать сохранение'); }
}
function toStartKeep() { closeSheet(); closeModal(); $('#game').classList.remove('active'); $('#start').classList.add('active'); renderSlots(); }
MENU_HOOKS.push((l) => {
  item(l, { e: '💾', t: 'Перенести на другое устройство', d: 'Скачать файл или код со всеми слотами и достижениями', onClick: () => exportSave() });
  item(l, { e: '🗂️', t: 'Сменить слот', d: `Сейчас слот ${curSlot}. Эта жизнь сохранится`, onClick: () => { save(); toStartKeep(); } });
});

/* ---------- 3. Рекорды с друзьями ---------- */
const FR_KEY = 'lifesim_friends_v1';
const friends = () => { try { return JSON.parse(localStorage.getItem(FR_KEY)) || []; } catch (e) { return []; } };
const b64u = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
function addFriendRec(r) {
  if (!r || !r.d || r.s == null || !r.n) return false;
  const all = friends(); if (all.some((x) => x.d === r.d && x.n === r.n && x.s === r.s)) return false;
  all.push({ d: String(r.d).slice(0, 10), n: String(r.n).slice(0, 30), s: +r.s || 0, g: String(r.g || '').slice(0, 2), f: String(r.f || '').slice(0, 8), a: +r.a || 0, p: String(r.p || '').slice(0, 24) });
  try { localStorage.setItem(FR_KEY, JSON.stringify(all.slice(-500))); } catch (e) {}
  return true;
}
function myCode() { return b64u(JSON.stringify({ d: S.daily, n: S.playerName || `${S.first} ${S.surname}`, s: S.dailyScore, g: grade(S.dailyScore), f: C().flag, a: S.age, p: (S.nick || '') })); }
function shareDaily() {
  const link = `${location.origin}${location.pathname}?r=${myCode()}`;
  const text = `🗓️ Ежедневный вызов ${S.daily}: ${S.dailyScore} очков (${grade(S.dailyScore)}), ${gv(S, 'прожил', 'прожила', 'прожил(а)')} ${yrs(S.age)}. Сможешь лучше?`;
  if (navigator.share) navigator.share({ title: 'Жизнь — симулятор', text, url: link }).catch(() => {});
  else navigator.clipboard.writeText(`${text} ${link}`).then(() => toast('🔗 Ссылка скопирована. Отправь её другу!'), () => prompt('Скопируйте ссылку:', link));
}
(function readFriendLink() {
  const m = location.search.match(/[?&]r=([\w-]+)/);
  if (!m) return;
  try { const r = JSON.parse(unb64u(m[1])); if (addFriendRec(r)) setTimeout(() => toast(`🏁 Результат друга (${r.n}): ${r.s} очков. Сыграй тот же день!`), 600); } catch (e) {}
  history.replaceState(null, '', location.pathname);
})();
EXTRA_TITLES.friends = '🏁 Рекорды с друзьями';
EXTRA_PANELS.friends = function () { friendsBody($('#sheetBody')); };
function friendsBody(B) {
  const mine = (typeof dailyRec === 'function' ? dailyRec() : {});
  const fr = friends();
  const dates = [...new Set([...Object.keys(mine), ...fr.map((x) => x.d)])].sort().reverse().slice(0, 14);
  B.appendChild(el(`<div class="card"><div class="muted">Как это работает</div><div class="big">Один день, один старт</div><div class="muted">Сыграйте ежедневный вызов, отправьте другу ссылку с результатом. Когда друг откроет ссылку, ваш результат появится у него в таблице, а он сможет ответить своей.</div></div>`));
  if (!dates.length) { B.appendChild(el('<div class="empty">Пока нет результатов. Начните с «Ежедневного вызова» на стартовом экране.</div>')); }
  for (const d of dates) {
    const rows = fr.filter((x) => x.d === d).map((x) => ({ n: x.n, s: x.s, g: x.g, f: x.f, me: false }));
    if (mine[d]) rows.push({ n: 'Вы', s: mine[d].score, g: mine[d].grade, f: '⭐', me: true });
    rows.sort((a, b) => b.s - a.s);
    B.appendChild(el(`<div class="section-title">${d === today() ? 'Сегодня' : d}</div>`));
    const l = el('<div class="list"></div>'); B.appendChild(l);
    rows.forEach((r, i) => { const n = item(l, { e: ['🥇', '🥈', '🥉'][i] || `${i + 1}`, t: `${r.n} ${r.f}`, r: `${r.g} ${r.s}` }); if (r.me) n.classList.add('me'); });
  }
  btnRow(B, [{ t: '➕ Добавить результат по коду', f: () => { const c = prompt('Вставьте ссылку или код друга:'); if (!c) return; const m = c.match(/r=([\w-]+)/); try { if (addFriendRec(JSON.parse(unb64u(m ? m[1] : c.trim())))) { toast('✅ Добавлено'); if (currentPanel) refreshSheet(); } else toast('Уже есть или неверный код'); } catch (e) { toast('⚠️ Неверный код'); } } }]);
}
MENU_HOOKS.push((l) => item(l, { e: '🏁', t: 'Рекорды с друзьями', d: 'Ежедневный вызов: сравнить результаты', onClick: () => openPanel('friends') }));
(function () {
  const b = el('<button class="btn ghost" type="button" id="friendsBtn">🏆 Рекорды с друзьями</button>');
  const d = document.getElementById('dailyBtn'); d.parentNode.insertBefore(b, d.nextSibling);
  b.onclick = () => { Q.push({ e: '🏆', title: 'Рекорды с друзьями', html: '<div id="frBox"></div>' }); showModal(Q.shift()); friendsBody(document.getElementById('frBox')); };
})();

/* ---------- 10. Альбом прожитых жизней ---------- */
const ALBUM_KEY = 'lifesim_album_v1';
const ALBUM = [
  ['president', '🏛️', 'Глава государства', () => S.pol && S.pol.lvl === 5], ['minister', '💼', 'Министр', () => S.pol && S.pol.lvl >= 4],
  ['mayor', '🏙️', 'Мэр', () => S.pol && S.pol.lvl >= 1], ['spy', '🕵️', 'Шпион', () => !!S.spy || S.retiredSpy], ['spychief', '🎩', 'Директор разведки', () => S.spy && S.spy.lvl === 5],
  ['general', '⭐', 'Генерал', () => S.job && S.job.id === 'army' && S.job.lvl === 5], ['hero', '🎖️', 'Герой войны', () => (S.medals || 0) >= 3], ['veteran', '🪖', 'Ветеран', () => S.veteran],
  ['billionaire', '💎', 'Миллиардер', () => netWorth() >= 1e9], ['millionaire', '💰', 'Миллионер', () => netWorth() >= 1e8], ['tycoon', '🏭', 'Магнат', () => S.biz && S.biz.value >= 1e9],
  ['ceo', '🏢', 'Владелец бизнеса', () => !!S.biz], ['star', '🌟', 'Мегазвезда', () => (S.fame || 0) >= 80], ['blogger', '📱', 'Блогер-миллионник', () => S.followers >= 1e6],
  ['astronaut', '🚀', 'Космонавт', () => S.job && S.job.id === 'astro' && S.job.lvl >= 1], ['doctor', '🩺', 'Главврач', () => S.job && S.job.id === 'doctor' && S.job.lvl === 4],
  ['judge', '⚖️', 'Судья', () => S.job && S.job.id === 'lawyer' && S.job.lvl === 4], ['academic', '🔬', 'Академик', () => S.job && S.job.id === 'scientist' && S.job.lvl === 3],
  ['nobel', '🏅', 'Нобелевский лауреат', () => S.nobel], ['inventor', '💡', 'Изобретатель', () => (S.patents || 0) > 0], ['writer', '📚', 'Писатель', () => (S.works || []).some((w) => w.type === 'book')],
  ['director', '🎬', 'Режиссёр', () => (S.works || []).some((w) => w.type === 'film')], ['rockstar', '🎸', 'Рок-звезда', () => S.job && S.job.id === 'musician' && S.job.lvl === 3],
  ['olympian', '🥇', 'Олимпийский чемпион', () => (S.sport && S.sport.gold) > 0], ['athlete', '⚽', 'Спортсмен', () => !!S.sport],
  ['boss', '🕴️', 'Криминальный авторитет', () => S.mob && S.mob.rank >= 4], ['prisoner', '⛓️', 'Заключённый', () => S.ach.prison != null], ['fugitive', '🏃', 'Беглец', () => S.ach.escape != null],
  ['saint', '😇', 'Святой', () => S.karma >= 100], ['villain', '😈', 'Злодей', () => S.karma <= 0], ['centenarian', '🎂', 'Долгожитель', () => S.age >= 100],
  ['parent5', '👨‍👩‍👧‍👦', 'Многодетный родитель', () => S.stat.kids >= 5], ['traveler', '🧳', 'Путешественник', () => S.visited.length >= 20], ['emigrant', '🛫', 'Эмигрант', () => S.country !== S.birthCountry],
  ['landlord', '🏘️', 'Рантье', () => S.assets.filter((a) => a.type === 'house').length >= 3], ['martian', '🔴', 'Марсианин', () => S.mars], ['phd', '🎓', 'Доктор наук', () => S.edu.level === 'phd'],
  ['dynasty', '👑', 'Основатель династии', () => S.dyn && S.generation >= 3], ['young', '🕯️', 'Ушёл молодым', () => !S.alive && S.age < 30], ['champion', '🏆', 'Чемпион мира', () => (S.sport && S.sport.worlds) > 0]
];
const albumGet = () => { try { return JSON.parse(localStorage.getItem(ALBUM_KEY)) || {}; } catch (e) { return {}; } };
function albumCheck() {
  const A = albumGet(); let got = false;
  for (const [id, e, t, f] of ALBUM) { let ok = false; try { ok = f(); } catch (x) {} if (ok && !A[id]) { A[id] = { n: `${S.first} ${S.surname}`, y: S.year }; got = true; toast(`📔 В альбом жизней: ${e} ${t}`); } }
  if (got) try { localStorage.setItem(ALBUM_KEY, JSON.stringify(A)); } catch (x) {}
}
YEAR_HOOKS.push(albumCheck); DEATH_HOOKS.push(albumCheck);
EXTRA_TITLES.album = '📔 Альбом жизней';
EXTRA_PANELS.album = function () {
  const A = albumGet(); const n = Object.keys(A).length;
  card(`<div class="muted">Кем вы уже были во всех жизнях</div><div class="big">${n} из ${ALBUM.length} ролей</div><div class="bar-mini"><em style="width:${Math.round(n / ALBUM.length * 100)}%"></em></div>`);
  const g = el('<div class="album"></div>'); $('#sheetBody').appendChild(g);
  for (const [id, e, t] of ALBUM) g.appendChild(el(`<div class="alb${A[id] ? ' on' : ''}"><span>${A[id] ? e : '❔'}</span><b>${esc(t)}</b><small>${A[id] ? esc(A[id].n) + ', ' + A[id].y : 'ещё нет'}</small></div>`));
};
MENU_HOOKS.unshift((l) => item(l, { e: '📔', t: 'Альбом жизней', d: `${Object.keys(albumGet()).length} из ${ALBUM.length} ролей`, onClick: () => openPanel('album') }));

/* ---------- 18. Дневник жизни ---------- */
function diaryChapters() {
  const stages = [[0, 6, '👶 Раннее детство'], [7, 17, '🎒 Школьные годы'], [18, 29, '🌱 Молодость'], [30, 49, '💼 Зрелость'], [50, 69, '🍂 Опыт'], [70, 200, '🕯️ Старость']];
  const ch = [];
  for (const [a, b, title] of stages) {
    const items = [];
    for (const blk of S.log) if (blk.age >= a && blk.age <= b) for (const it of blk.items) if (it.c === 'good' || it.c === 'bad' || (it.c !== 'info' && it.c !== 'news' && /[!]/.test(it.t))) items.push({ age: blk.age, year: blk.year, t: it.t, c: it.c });
    if (items.length) ch.push({ title, items: items.slice(0, 14) });
  }
  return ch;
}
function diaryIntro() {
  const c = C(); const par = S.people.filter((p) => p.role === 'mother' || p.role === 'father');
  const job = S.career.length ? JOBS.find((j) => j.id === S.career[S.career.length - 1]) : null;
  const kids = S.people.filter((p) => p.role === 'child');
  return [
    `Меня зовут ${S.first} ${S.surname}. Я родил${S.gender === 'f' ? 'ась' : 'ся'} в ${S.birthYear} году${par.length ? `, в семье ${par.map((p) => p.name).join(' и ')}` : ''}.`,
    S.edu.level !== 'none' ? `Образование: ${EDU_NAME[S.edu.level].toLowerCase()}.` : 'Учёба — это было не моё.',
    job ? `Большую часть жизни я посвятил${S.gender === 'f' ? 'а' : ''} профессии: ${job.name.toLowerCase()}.` : '',
    kids.length ? `У меня ${kids.length} ${plural(kids.length, ['ребёнок', 'ребёнка', 'детей'])}: ${kids.map((k) => k.name).join(', ')}.` : '',
    `Я побывал${S.gender === 'f' ? 'а' : ''} в ${S.visited.length} ${plural(S.visited.length, ['стране', 'странах', 'странах'])}${(S.chron || []).length ? ` и пережил${S.gender === 'f' ? 'а' : ''} ${S.chron.length} ${plural(S.chron.length, ['историческое событие', 'исторических события', 'исторических событий'])}` : ''}.`,
    S.alive ? `Сейчас мне ${yrs(S.age)}, на дворе ${S.year} год, я живу в городе ${S.city}, ${cname(c)}.` : `Моя жизнь закончилась в ${S.year} году, в ${yrs(S.age)}. Причина: ${S.cause.toLowerCase()}.`
  ].filter(Boolean);
}
EXTRA_TITLES.diary = '📖 Дневник жизни';
EXTRA_PANELS.diary = function () {
  const B = $('#sheetBody');
  card(`<div class="diary-intro">${diaryIntro().map((p) => `<p>${esc(p)}</p>`).join('')}</div>`);
  for (const ch of diaryChapters()) {
    B.appendChild(el(`<div class="section-title">${esc(ch.title)}</div>`));
    B.appendChild(el(`<div class="card diary">${ch.items.map((i) => `<p class="${i.c}"><b>${i.year}, ${yrs(i.age)}.</b> ${esc(i.t)}</p>`).join('')}</div>`));
  }
  btnRow(B, [{ t: '⬇️ Скачать дневник', cls: 'primary', f: downloadDiary }].concat(!S.alive ? [{ t: '← Назад к итогам', f: () => { closeSheet(); showDeath(); } }] : []));
};
function downloadDiary() {
  const ch = diaryChapters();
  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Дневник: ${esc(S.first)} ${esc(S.surname)}</title><style>body{font:17px/1.65 Georgia,serif;max-width:680px;margin:40px auto;padding:0 20px;color:#2a2622;background:#fbf8f2}h1{font-size:34px;margin-bottom:4px}h2{margin-top:36px;font-size:22px;border-bottom:1px solid #e5ddd0;padding-bottom:6px}.sub{color:#8a8178}.good{color:#1f7a3d}.bad{color:#a8322a}b{font-weight:700}</style></head><body><h1>${esc(S.first)} ${esc(S.surname)}</h1><div class="sub">${S.birthYear}–${S.alive ? 'наши дни' : S.year} · ${C().flag} ${esc(cname(C()))}</div>${diaryIntro().map((p) => `<p>${esc(p)}</p>`).join('')}${ch.map((c) => `<h2>${esc(c.title)}</h2>${c.items.map((i) => `<p class="${i.c}"><b>${i.year} (${yrs(i.age)}).</b> ${esc(i.t)}</p>`).join('')}`).join('')}<p class="sub" style="margin-top:40px">Записано в игре «Жизнь — симулятор»</p></body></html>`;
  let doc = html;
  if (typeof LANG !== 'undefined' && LANG !== 'ru' && typeof trTree === 'function') { try { const d = new DOMParser().parseFromString(html, 'text/html'); trTree(d.documentElement); d.documentElement.lang = LANG; doc = '<!doctype html>' + d.documentElement.outerHTML; } catch (e) {} }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([doc], { type: 'text/html' })); a.download = `${LANG === 'en' ? 'diary' : 'dnevnik'}-${LANG === 'en' && typeof translit === 'function' ? translit(S.first) : S.first}.html`; document.body.appendChild(a); a.click(); a.remove();
  toast('📖 Дневник скачан');
}
MENU_HOOKS.unshift((l) => item(l, { e: '📖', t: 'Дневник жизни', d: 'Автобиография по главам, можно скачать', onClick: () => openPanel('diary') }));

/* ---------- 20. Сложность ---------- */
const _newLifeD = newLife;
newLife = function (opts = {}) {
  const diff = opts.diff || (opts.generation ? null : (document.getElementById('inDiff') || {}).value) || 'normal';
  const r = _newLifeD(opts);
  if (!opts.generation) {
    S.diff = opts.dmode ? 'normal' : diff;
    const par = S.people.filter((p) => p.role === 'mother' || p.role === 'father');
    if (S.diff === 'easy') { for (const p of par) { p.money = (p.money || 0) * 4 + 20e6; p.job = pick(['Предприниматель', 'Банкир', 'Хирург', 'Юрист', 'Дипломат']); } S.stats.health = Math.max(S.stats.health, 85); S.stats.smarts = Math.max(S.stats.smarts, 60); S.stats.looks = Math.max(S.stats.looks, 60); log('🍼 Лёгкая жизнь: вы родились в обеспеченной семье.', 'info'); }
    if (S.diff === 'hard') { for (const p of par) { p.money = 0; p.job = pick(['Безработный', 'Разнорабочий', 'Уборщик', 'Безработный']); } S.stats.health = Math.min(S.stats.health, 70); S.stats.happy = Math.min(S.stats.happy, 60); log('💀 Хардкор: бедная семья, слабое здоровье. Удачи.', 'bad'); }
  } else S.diff = S.diff || 'normal';
  save();
  return r;
};
YEAR_HOOKS.push(() => {
  if (S.diff === 'easy') {
    if (S.age >= 18 && S.age <= 25 && parentsAlive().length) { const g = price(400000); S.money += g; if (S.age === 18) log(`💳 Родители помогают деньгами каждый год: ${fmt(g)}.`, 'good'); }
    if (S.stats.health < 50) eff({ health: 3 });
  } else if (S.diff === 'hard') {
    if (S.age >= 18 && !S.prison) { const c = price(60000); S.money -= c; }
    if (chance(0.06) && S.age > 3) { const d = pick(DISEASES.filter((x) => (x.minAge || 0) <= S.age && x.dmg < 12)); if (d && !S.diseases.some((x) => x.id === d.id)) { S.diseases.push({ id: d.id, since: S.age }); log(`🤒 Тяжёлая жизнь подкосила здоровье: ${d.name.toLowerCase()}.`, 'bad'); } }
    if (chance(0.05)) { eff({ happy: -6 }); log(pick(['🥶 Зимой отключили отопление.', '💸 Опять не хватило денег до зарплаты.', '🏚️ Протекла крыша.', '🧥 Пришлось донашивать чужую куртку.']), 'bad'); }
  }
});
const _lifeScoreD = lifeScore;
lifeScore = function () { const s = _lifeScoreD(); return Math.round(s * (S.diff === 'hard' ? 1.3 : S.diff === 'easy' ? 0.8 : 1)); };

/* Предупреждение о перезаписи слота + кнопки на экране смерти */
document.getElementById('startForm').addEventListener('submit', (e) => {
  const s = readSlot(curSlot);
  if (s && s.alive && !confirm(`В слоте ${curSlot} идёт жизнь ${s.first} ${s.surname || ''}. Перезаписать её?`)) { e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
const _showDeathMeta = showDeath;
showDeath = function () {
  _showDeathMeta();
  const A = $('#modalActions');
  const mk = (t, f) => { const b = document.createElement('button'); b.className = 'btn ghost'; b.textContent = t; b.onclick = f; A.insertBefore(b, A.lastChild); };
  mk('📖 Дневник жизни', () => { closeModal(); openPanel('diary'); });
  if (S.daily) mk('📤 Отправить результат другу', () => shareDaily());
};
