'use strict';
/* ===================== Дом, генетика и медицина, школа, питомцы, стихии, завещание ===================== */

/* ====================== 🏡 СВОЙ ДОМ ====================== */
const DISTRICTS = [
  { id: 'sleep', e: '🏢', n: 'Спальный район', d: 'Тихо, школы и магазины рядом', happy: 0, val: 1 },
  { id: 'center', e: '🏙️', n: 'Исторический центр', d: 'Всё рядом, но шумно', happy: 2, val: 1.3 },
  { id: 'suburb', e: '🌳', n: 'Пригород', d: 'Воздух и свой двор, долго ехать', happy: 3, val: 0.95, health: 1 },
  { id: 'elite', e: '💎', n: 'Элитный посёлок', d: 'Охрана, соседи-миллионеры', happy: 4, val: 1.7 },
  { id: 'old', e: '🏚️', n: 'Старый промышленный район', d: 'Дёшево, но неспокойно', happy: -2, val: 0.75 }
];
const RENO = [
  { n: 'Без ремонта', k: 0 }, { n: 'Косметический ремонт', k: 0.05 }, { n: 'Капитальный ремонт', k: 0.15 }, { n: 'Дизайнерский ремонт', k: 0.35 }
];
const FURN = [
  { id: 'sofa', e: '🛋️', n: 'Большой диван', c: 30000, comfort: 3 }, { id: 'bed', e: '🛏️', n: 'Ортопедическая кровать', c: 45000, comfort: 3, health: 1 },
  { id: 'kitchen', e: '🍳', n: 'Кухонный гарнитур', c: 150000, comfort: 4 }, { id: 'tv', e: '📺', n: 'Телевизор', c: 60000, comfort: 3, yr: 1950 },
  { id: 'fire', e: '🔥', n: 'Камин', c: 250000, comfort: 5 }, { id: 'cinema', e: '🎬', n: 'Домашний кинотеатр', c: 400000, comfort: 5, yr: 1990 },
  { id: 'books', e: '📚', n: 'Домашняя библиотека', c: 120000, comfort: 4, smarts: 1 }, { id: 'gym', e: '🏋️', n: 'Домашний спортзал', c: 300000, comfort: 4, health: 2 },
  { id: 'garden', e: '🌷', n: 'Сад с беседкой', c: 200000, comfort: 5, house: true }, { id: 'pool', e: '🏊', n: 'Бассейн', c: 1500000, comfort: 8, house: true, health: 1 },
  { id: 'sauna', e: '🧖', n: 'Сауна', c: 500000, comfort: 5, health: 1 }, { id: 'piano', e: '🎹', n: 'Рояль', c: 1200000, comfort: 5 },
  { id: 'robot', e: '🤖', n: 'Робот-пылесос', c: 40000, comfort: 2, yr: 2005 }, { id: 'smart', e: '🏠', n: 'Умный дом', c: 600000, comfort: 6, yr: 2015 },
  { id: 'game', e: '🎮', n: 'Игровая комната', c: 200000, comfort: 4, yr: 1985 }, { id: 'butler', e: '🦾', n: 'Домашний андроид', c: 5000000, comfort: 10, yr: 2040 }
];
function homeAsset() {
  const hs = S.assets.filter((a) => a.type === 'house'); if (!hs.length) return null;
  S.home = S.home || { uid: hs[0].uid, district: 'sleep', reno: 0, cond: 70, furn: [], insured: false };
  let h = hs.find((a) => a.uid === S.home.uid);
  if (!h) { h = hs[0]; S.home = { uid: h.uid, district: 'sleep', reno: 0, cond: 70, furn: [], insured: false }; }
  return h;
}
const homeComfort = () => (S.home ? S.home.furn.reduce((s, id) => s + (FURN.find((f) => f.id === id)?.comfort || 0), 0) + S.home.reno * 3 + Math.round(S.home.cond / 25) : 0);
EXTRA_TITLES.home = '🏡 Мой дом';
EXTRA_PANELS.home = function () {
  const B = $('#sheetBody');
  const h = homeAsset();
  if (!h) { card(`<div class="muted">Жильё</div><div class="big">${S.age < 18 ? 'Вы живёте с семьёй' : 'Вы снимаете жильё'}</div><div class="muted">Купите дом или квартиру в разделе «Имущество», чтобы обустроить своё гнездо.</div>`); btnRow(B, [{ t: '🛍️ К покупкам', cls: 'primary', f: () => openPanel('assets') }]); return; }
  const H = S.home; const D = DISTRICTS.find((d) => d.id === H.district);
  card(`<div class="muted">${h.e} Главное жильё</div><div class="big">${esc(h.name)}</div><div class="muted">${D.e} ${D.n} · ${RENO[H.reno].n} · состояние ${H.cond}%</div><div class="bar-mini"><em style="width:${H.cond}%"></em></div><div class="muted">Уют: ${homeComfort()} · Стоимость: ${fmt(h.value)}${H.insured ? ' · 🛡️ застраховано' : ''}</div>`);
  const hs = S.assets.filter((a) => a.type === 'house');
  if (hs.length > 1) { const l = section('Где живём'); for (const a of hs) item(l, { e: a.uid === H.uid ? '📍' : a.e, t: a.name, d: a.uid === H.uid ? 'Главное жильё' : 'Сделать главным', disabled: a.uid === H.uid, onClick: act(() => { S.home = { uid: a.uid, district: 'sleep', reno: 0, cond: 70, furn: [], insured: false }; return `🏡 Вы переехали: ${a.name}. Мебель придётся покупать заново.`; }) }); }
  const lr = section('Ремонт');
  RENO.forEach((r, i) => { if (!i) return; const cost = Math.round(h.value * r.k); item(lr, { e: ['', '🖌️', '🧱', '✨'][i], t: r.n, d: `${fmt(cost)} · стоимость жилья вырастет`, disabled: S.used.reno || S.money < cost || H.reno > i, onClick: act(() => {
    S.used.reno = 1; S.money -= cost; H.cond = 100;
    if (i > H.reno) { h.value += Math.round(cost * 1.15); H.reno = i; }
    if (chance(0.3)) { eff({ happy: -6 }); return `🧱 ${r.n} затянулся на полгода: бригада пропадала и всё перекрашивала. Но результат того стоил.`; }
    eff({ happy: 8 }); return `✨ ${r.n} закончен! Дом не узнать.`;
  }) }); });
  item(lr, { e: '🔨', t: 'Мелкий ремонт своими руками', d: '+состояние, бесплатно', disabled: S.used.diy || H.cond >= 95, onClick: act(() => { S.used.diy = 1; if (chance(0.15)) { eff({ health: -5 }); return '🔨 Вы упали со стремянки. Ремонт подождёт.'; } H.cond = clamp(H.cond + rnd(10, 20)); eff({ happy: 3 }); return '🔨 Подкрутили, покрасили, заменили. Как новенькое!'; }) });
  const lf = section(`Мебель и удобства · уют ${homeComfort()}`);
  const isFlat = ['room', 'studio', 'penthouse'].includes(h.id);
  for (const f of FURN) {
    if (f.yr && S.year < f.yr) continue; if (f.house && isFlat) continue;
    const have = H.furn.includes(f.id); const c = price(f.c);
    item(lf, { e: f.e, t: f.n, d: have ? 'Уже есть' : `${fmt(c)} · +${f.comfort} уюта`, r: have ? '✅' : '', disabled: have || S.money < c, onClick: act(() => { S.money -= c; H.furn.push(f.id); h.value += Math.round(c * 0.3); eff({ happy: 4 }); if (H.furn.length >= 10) unlock('cozy'); return `${f.e} Теперь дома есть: ${f.n.toLowerCase()}.`; }) });
  }
  const ld = section('Район');
  for (const d of DISTRICTS) {
    if (d.id === H.district) { item(ld, { e: d.e, t: d.n, d: `${d.d} · вы здесь`, r: '📍' }); continue; }
    const fee = Math.round(h.value * 0.05);
    item(ld, { e: d.e, t: `Переехать: ${d.n}`, d: `${d.d} · переезд ${fmt(fee)}`, disabled: S.money < fee || S.used.move, onClick: act(() => {
      S.used.move = 1; S.money -= fee; h.value = Math.round(h.value / D.val * d.val); H.district = d.id; H.furn = H.furn.filter(() => chance(0.85));
      S.people = S.people.filter((p) => p.role !== 'neighbor'); eff({ happy: d.happy + 3 });
      return `${d.e} Вы переехали в район «${d.n}». Новые соседи, новая жизнь.`;
    }) });
  }
  const ln = section('Соседи и страховка');
  const nb = S.people.filter((p) => p.role === 'neighbor' && p.alive);
  for (const p of nb) item(ln, { e: personEmoji(p), t: p.name, d: `Сосед · ${yrs(p.age)}${p.job ? ' · ' + p.job : ''}`, bar: p.close, onClick: () => personModal(p) });
  item(ln, { e: '🥂', t: 'Устроить новоселье для соседей', d: `${fmt(price(30000))} · познакомиться со всеми`, disabled: S.used.housewarm || S.money < price(30000), onClick: act(() => {
    S.used.housewarm = 1; S.money -= price(30000); const n = rnd(1, 3);
    for (let i = 0; i < n; i++) S.people.push(makePerson('neighbor', { age: S.age + rnd(-20, 25), close: rnd(45, 70), job: npcJob() }));
    for (const p of S.people.filter((x) => x.role === 'neighbor')) p.close = clamp(p.close + 8);
    eff({ happy: 6 }); return `🥂 Новоселье удалось! Вы познакомились ещё с ${n} ${plural(n, ['соседом', 'соседями', 'соседями'])}.`;
  }) });
  const prem = Math.round(h.value * 0.006);
  item(ln, { e: '🛡️', t: H.insured ? 'Отменить страховку жилья' : 'Застраховать жильё', d: H.insured ? 'Защищает от пожаров и стихийных бедствий' : `${fmt(prem)} в год · пожары, потопы, землетрясения`, onClick: act(() => { H.insured = !H.insured; return H.insured ? '🛡️ Жильё застраховано.' : 'Страховка отменена.'; }) });
};
const _panelAssetsL = panelAssets;
panelAssets = function () {
  const h = S.age >= 18 && homeAsset();
  if (h) { const l = section('Дом'); item(l, { e: '🏡', t: 'Мой дом', d: `${esc(h.name)} · уют ${homeComfort()} · ${RENO[S.home.reno].n.toLowerCase()}`, onClick: () => openPanel('home') }); }
  _panelAssetsL();
};
YEAR_HOOKS.push(() => {
  const h = S.assets.some((a) => a.type === 'house') && homeAsset(); if (!h || S.prison) return;
  const H = S.home; const D = DISTRICTS.find((d) => d.id === H.district);
  H.cond = clamp(H.cond - rnd(2, 5));
  eff({ happy: Math.min(8, Math.round(homeComfort() / 6)) + D.happy - (H.cond < 30 ? 4 : 0), health: (D.health || 0) + H.furn.reduce((s, id) => s + (FURN.find((f) => f.id === id)?.health || 0), 0) / 2 });
  if (H.furn.includes('books')) eff({ smarts: 1 });
  if (H.insured) S.money -= Math.round(h.value * 0.006);
  if (H.cond < 25 && chance(0.25)) { const c = Math.round(h.value * 0.03); S.money -= c; log(`🚿 Дом разваливается: прорвало трубу. Срочный ремонт: ${fmt(c)}.`, 'bad'); }
  if (D.id === 'old' && chance(0.08)) { eff({ happy: -5 }); log('🚨 В вашем районе снова неспокойно: вскрыли подвал.', 'bad'); }
  const nb = S.people.find((p) => p.role === 'neighbor' && p.alive);
  if (nb && chance(0.1)) {
    const k = rnd(0, 3);
    if (k === 0) ev('🌳', 'Спор из-за забора', `${nb.name} утверждает, что ваш забор стоит на его земле.`, [
      { t: 'Уступить полметра', f: () => { nb.close = clamp(nb.close + 15); eff({ karma: 3 }); return 'Мир дороже. Сосед принёс в благодарность пирог.'; } },
      { t: 'Судиться', f: () => { S.money -= price(50000); if (chance(0.55)) { nb.close = clamp(nb.close - 30); return 'Суд встал на вашу сторону. Сосед больше не здоровается.'; } nb.close = clamp(nb.close - 20); return 'Суд проигран. Забор пришлось переносить.'; } }]);
    else if (k === 1) ev('🏘️', 'Собрание жильцов', 'Обсуждают ремонт подъезда и новую детскую площадку.', [
      { t: 'Возглавить инициативу', f: () => { S.money -= price(20000); eff({ karma: 5, happy: 4 }); for (const p of S.people.filter((x) => x.role === 'neighbor')) p.close = clamp(p.close + 10); unlock('housechair'); return '🏘️ Вас выбрали старшим по дому. Площадку построили!'; } },
      { t: 'Проголосовать и уйти', f: () => 'Вы проголосовали «за» и ушли пить чай.' },
      { t: 'Не пойти', f: () => { for (const p of S.people.filter((x) => x.role === 'neighbor')) p.close = clamp(p.close - 4); return 'Без вас решили поднять взносы.'; } }]);
    else if (k === 2) { nb.close = clamp(nb.close + 6); log(`🐈 ${nb.name} помог${gv(nb, '', 'ла', '(ла)')} снять вашего кота с дерева. Ну или чужого.`, 'info'); }
    else { eff({ happy: 3 }); log(`🍲 ${nb.name} угостил${gv(nb, '', 'а', '(а)')} вас домашним ужином.`, 'good'); }
  }
});

/* ====================== 🧬 ГЕНЕТИКА И МЕДИЦИНА ====================== */
const GENES = [
  { id: 'longevity', e: '🌳', n: 'Гены долгожителей', good: true, d: 'Шанс прожить дольше' },
  { id: 'athletic', e: '💪', n: 'Спортивная генетика', good: true, d: '+здоровье с рождения', st: { health: 10 } },
  { id: 'bright', e: '💡', n: 'Светлая голова', good: true, d: '+ум с рождения', st: { smarts: 10 } },
  { id: 'pretty', e: '✨', n: 'Красота по наследству', good: true, d: '+внешность', st: { looks: 10 } },
  { id: 'pitch', e: '🎼', n: 'Абсолютный слух', good: true, d: 'Музыка даётся легко' },
  { id: 'myopia', e: '👓', n: 'Близорукость', d: 'Лечится лазерной коррекцией', st: { looks: -3 } },
  { id: 'heart', e: '💔', n: 'Слабое сердце', d: 'Риск болезней сердца после 40', dis: 'heart', age: 40, p: 0.04 },
  { id: 'diabetes', e: '🍬', n: 'Склонность к диабету', d: 'Риск диабета после 30', dis: 'diabetes', age: 30, p: 0.04 },
  { id: 'cancer', e: '🎗️', n: 'Онкологический риск', d: 'Риск после 35, помогает скрининг', dis: 'cancer', age: 35, p: 0.025 },
  { id: 'alz', e: '🧠', n: 'Риск Альцгеймера', d: 'После 60', dis: 'alzheimer', age: 60, p: 0.03 },
  { id: 'allergy', e: '🤧', n: 'Аллергик', d: 'Весной тяжело', dis: 'allergy', age: 3, p: 0.12 },
  { id: 'hemo', e: '🩸', n: 'Гемофилия', d: 'Опасны травмы', rare: true, st: { health: -10 } }
];
function rollGenes(parentGenes) {
  const out = new Set();
  if (parentGenes) for (const g of parentGenes) if (chance(0.5)) out.add(g);
  const n = rnd(0, 2) + (parentGenes ? 0 : 1);
  for (let i = 0; i < n; i++) { const g = pick(GENES); if (!g.rare || chance(0.15)) out.add(g.id); }
  return [...out];
}
function applyGeneStats() { for (const id of S.genes) { const g = GENES.find((x) => x.id === id); if (g && g.st) eff(g.st); } if (S.genes.includes('pitch')) { skills().music = Math.max(skillOf('music'), 15); } }
const _newLifeG = newLife;
newLife = function (opts = {}) {
  const r = _newLifeG(opts);
  if (!S.genes) { S.genes = rollGenes(null); applyGeneStats(); S.famHist = S.genes.filter((id) => !GENES.find((g) => g.id === id).good && chance(0.6)); }
  return r;
};
const _contAsG = continueAs;
continueAs = function (k) {
  const pg = S.genes || []; const cryo = S.cryo;
  _contAsG(k);
  S.genes = rollGenes(pg); applyGeneStats(); S.genesKnown = false;
  S.famHist = pg.filter((id) => !GENES.find((g) => g.id === id)?.good);
  if (cryo) S.cryoAncestor = true;
  save();
};
YEAR_HOOKS.push(() => {
  if (!S.genes) { S.genes = rollGenes(null); S.famHist = []; }
  for (const id of S.genes) {
    const g = GENES.find((x) => x.id === id); if (!g || !g.dis || S.age < g.age) continue;
    if (id === 'cancer' && S.screening) continue;
    if (!S.diseases.some((d) => d.id === g.dis) && chance(g.p * (S.implants?.includes('pacer') && id === 'heart' ? 0.3 : 1))) {
      S.diseases.push({ id: g.dis, since: S.age }); const def = DISEASES.find((d) => d.id === g.dis);
      log(`🧬 Сказалась наследственность: ${def.name.toLowerCase()}.`, 'bad');
    }
  }
  if (S.genes.includes('hemo') && chance(0.04)) { eff({ health: -8 }); log('🩸 Обычный порез обернулся больницей. Гемофилия.', 'bad'); }
  if (S.screening && S.age >= 35) S.money -= price(20000);
});
const _yearDeathG = yearDeath;
yearDeath = function () {
  if (S.stats.health > 0) {
    const prot = (S.genes?.includes('longevity') ? 0.3 : 0) + (S.lifeExt || 0);
    if (prot > 0 && chance(Math.min(0.85, prot))) return;
  }
  _yearDeathG();
};
const hasImplant = (id) => (S.implants || []).includes(id);
const OPS = [
  { id: 'lasik', e: '👁️', n: 'Лазерная коррекция зрения', yr: 1995, c: 120000, cond: () => S.genes.includes('myopia'), run: () => { S.genes = S.genes.filter((g) => g !== 'myopia'); eff({ looks: 3, happy: 8 }); return '👁️ Вы видите мир чётко без очков!'; } },
  { id: 'bypass', e: '❤️‍🩹', n: 'Шунтирование сердца', yr: 1964, c: 900000, cond: () => S.diseases.some((d) => d.id === 'heart'), risk: 0.03, run: () => { if (chance(0.85)) { S.diseases = S.diseases.filter((d) => d.id !== 'heart'); eff({ health: 15 }); return '❤️‍🩹 Операция прошла успешно, сердце как новое.'; } eff({ health: -10 }); return 'Операция не помогла. Врачи разводят руками.'; } },
  { id: 'tumor', e: '🎗️', n: 'Операция по удалению опухоли', yr: 1900, c: 1500000, cond: () => S.diseases.some((d) => d.id === 'cancer'), risk: 0.05, run: () => { const p = S.year < 1950 ? 0.3 : S.year < 2000 ? 0.55 : S.year < 2030 ? 0.75 : 0.92; if (chance(p)) { S.diseases = S.diseases.filter((d) => d.id !== 'cancer'); eff({ health: 10, happy: 15 }); return '🎗️ Опухоль удалена. Ремиссия!'; } eff({ health: -12 }); return '🎗️ Опухоль удалили не полностью.'; } },
  { id: 'transplant', e: '🫀', n: 'Пересадка органа', yr: 1954, c: 3000000, cond: () => S.stats.health < 35 && S.age >= 30, risk: 0.08, run: () => { eff({ health: rnd(25, 40) }); unlock('transplant'); return '🫀 Донорский орган прижился. Вы получили второй шанс.'; } },
  { id: 'joints', e: '🦴', n: 'Замена суставов', yr: 1970, c: 600000, cond: () => S.age >= 55 && !S.used.joints, risk: 0.01, run: () => { S.used.joints = 1; eff({ health: 8, happy: 6 }); return '🦴 Новые суставы. Вы снова гуляете без боли.'; } },
  { id: 'screen', e: '🔍', n: 'Регулярный онкоскрининг', yr: 1985, c: 20000, cond: () => S.age >= 30 && !S.screening, run: () => { S.screening = true; return '🔍 Вы встали на ежегодный скрининг. Онкориск под контролем.'; } }
];
const IMPLANTS = [
  { id: 'teeth', e: '🦷', n: 'Зубные импланты', yr: 1980, c: 400000, min: 30, run: () => { eff({ looks: 4, happy: 4 }); return '🦷 Голливудская улыбка!'; } },
  { id: 'pacer', e: '🔋', n: 'Кардиостимулятор', yr: 1960, c: 700000, min: 40, cond: () => S.genes.includes('heart') || S.diseases.some((d) => d.id === 'heart'), run: () => { eff({ health: 8 }); return '🔋 Сердце бьётся ровно, риски снижены.'; } },
  { id: 'cochlear', e: '👂', n: 'Слуховой имплант', yr: 1985, c: 900000, min: 60, run: () => { eff({ happy: 8 }); return '👂 Вы снова слышите пение птиц.'; } },
  { id: 'exo', e: '🦿', n: 'Экзоскелет', yr: 2030, c: 2500000, min: 65, run: () => { eff({ health: 10, happy: 8 }); return '🦿 Экзоскелет вернул вам лёгкость движений.'; } },
  { id: 'chip', e: '🧠', n: 'Нейрочип', yr: 2035, c: 8000000, min: 18, risk: 0.02, run: () => { eff({ smarts: 15 }); if (chance(0.2)) { eff({ happy: -10 }); return '🧠 Нейрочип ускорил мышление, но иногда вы слышите рекламу во сне.'; } return '🧠 Нейрочип установлен. Вы думаете быстрее.'; } },
  { id: 'eye', e: '🤖', n: 'Бионический глаз', yr: 2040, c: 6000000, min: 18, run: () => { eff({ looks: 2, smarts: 3 }); return '🤖 Бионический глаз видит в темноте и приближает в 10 раз.'; } }
];
const EXTEND = [
  { id: 'crispr', e: '✂️', n: 'Генная терапия', d: 'Убрать одну наследственную болезнь', yr: 2022, c: 5000000, cond: () => S.genesKnown && S.genes.some((id) => !GENES.find((g) => g.id === id)?.good), run: () => { const bad = S.genes.filter((id) => !GENES.find((g) => g.id === id)?.good); const g = pick(bad); S.genes = S.genes.filter((x) => x !== g); return `✂️ Ген исправлен: «${GENES.find((x) => x.id === g).n}» больше не угрожает.`; } },
  { id: 'rejuv', e: '⏳', n: 'Терапия омоложения', d: 'Здоровье и долголетие', yr: 2035, c: 20000000, min: 50, run: () => { S.lifeExt = Math.min(0.6, (S.lifeExt || 0) + 0.15); eff({ health: 20, looks: 5 }); unlock('rejuv'); return '⏳ Клетки омоложены. Вы выглядите на 10 лет моложе.'; } },
  { id: 'nano', e: '🦠', n: 'Нанороботы в крови', d: 'Вылечить всё и продлить жизнь', yr: 2045, c: 50000000, min: 30, run: () => { S.diseases = []; S.lifeExt = Math.min(0.6, (S.lifeExt || 0) + 0.2); eff({ health: 25 }); return '🦠 Нанороботы вычистили организм. Болезни ушли.'; } },
  { id: 'cryo', e: '🧊', n: 'Контракт на крионику', d: 'После смерти тело заморозят', yr: 1976, c: 15000000, min: 40, cond: () => !S.cryo, run: () => { S.cryo = true; return '🧊 Контракт подписан. Может быть, будущее сумеет вас разбудить.'; } },
  { id: 'upload', e: '💾', n: 'Цифровая копия сознания', d: 'Ваш разум продолжит жить в сети', yr: 2050, c: 30000000, min: 50, cond: () => !S.upload, run: () => { S.upload = true; unlock('digital'); return '💾 Ваше сознание скопировано. Цифровой вы уже пишет вам письма.'; } }
];
EXTRA_TITLES.medicine = '🧬 Генетика и медицина';
EXTRA_PANELS.medicine = function () {
  const B = $('#sheetBody');
  const fh = (S.famHist || []).map((id) => GENES.find((g) => g.id === id)).filter(Boolean);
  if (S.genesKnown) card(`<div class="muted">🧬 Ваш ДНК-профиль</div><div class="genes">${S.genes.length ? S.genes.map((id) => { const g = GENES.find((x) => x.id === id); return `<span class="gene ${g.good ? 'good' : 'bad'}">${g.e} ${esc(g.n)}<small>${esc(g.d)}</small></span>`; }).join('') : '<span class="muted">Ничего примечательного. Обычный геном.</span>'}</div>`);
  else {
    card(`<div class="muted">🧬 Наследственность</div><div class="big">Гены пока загадка</div><div class="muted">${fh.length ? `В семье были случаи: ${fh.map((g) => g.n.toLowerCase()).join(', ')}.` : 'Семейная история ничего тревожного не подсказывает.'}</div>`);
    if (S.year >= 2003) btnRow(B, [{ t: `🧪 Сделать ДНК-тест (${fmt(price(30000))})`, cls: 'primary', disabled: S.money < price(30000) && S.age >= 18, f: act(() => { if (S.age >= 18) S.money -= price(30000); S.genesKnown = true; unlock('dna'); return '🧪 Результаты ДНК-теста готовы. Теперь вы знаете свои риски.'; }) }]);
    else B.appendChild(el(`<div class="empty">ДНК-тесты появятся в начале 2000-х.</div>`));
  }
  const groups = [['Операции', OPS], ['Импланты', IMPLANTS], ['Продление жизни', EXTEND]];
  for (const [title, list] of groups) {
    const av = list.filter((o) => S.year >= o.yr && S.age >= (o.min || 18) && (!o.cond || o.cond()) && !(title === 'Импланты' && hasImplant(o.id)));
    const lock = list.filter((o) => S.year < o.yr).sort((a, b) => a.yr - b.yr)[0];
    if (!av.length && !lock) continue;
    const l = section(title);
    for (const o of av) {
      const c = price(o.c);
      item(l, { e: o.e, t: o.n, d: `${o.d ? o.d + ' · ' : ''}${fmt(c)}${o.risk ? ` · риск ${Math.round(o.risk * 100)}%` : ''}`, disabled: S.money < c || S.used['med_' + o.id], onClick: act(() => {
        S.used['med_' + o.id] = 1; S.money -= c;
        if (o.risk && chance(o.risk)) { if (chance(0.35)) { die(`Осложнения после операции: ${o.n.toLowerCase()}`); return 'Операция закончилась трагически.'; } eff({ health: -15 }); return `😷 Осложнения после операции «${o.n}». Восстановление будет долгим.`; }
        if (title === 'Импланты') { S.implants = S.implants || []; S.implants.push(o.id); if (S.implants.length >= 3) unlock('cyborg'); }
        return o.run();
      }) });
    }
    if (lock) item(l, { e: '🔒', t: lock.n, d: `Появится примерно в ${lock.yr} году` });
  }
};
MENU_HOOKS.unshift((l) => item(l, { e: '🧬', t: 'Генетика и медицина', d: 'ДНК, операции, импланты, долголетие', onClick: () => openPanel('medicine') }));
DEATH_HOOKS.push(() => {
  if (S.cryo) { log('🧊 Ваше тело заморожено в криокамере. Ждём будущего.', 'info'); unlock('cryo'); }
  if (S.upload) log('💾 Ваша цифровая копия продолжает жить в сети и пишет мемуары.', 'info');
});

/* ====================== 🎒 ШКОЛЬНАЯ ЖИЗНЬ ====================== */
const SUBJ = [['math', '📐', 'Математика'], ['lang', '📝', 'Родной язык'], ['hist', '🏛️', 'История'], ['sci', '🔬', 'Естествознание'], ['eng', '🌐', 'Иностранный язык'], ['pe', '🏃', 'Физкультура'], ['art', '🎨', 'Музыка и ИЗО']];
const mark = (v) => (v < 35 ? 2 : v < 55 ? 3 : v < 78 ? 4 : 5);
function schoolInit() {
  const b = S.stats.smarts;
  S.school = { subj: {}, teacher: null, pres: false, olymp: [], yearbook: null, done: false, nick: '' };
  for (const [id] of SUBJ) S.school.subj[id] = clamp(b + rnd(-20, 15) + (id === 'pe' ? (S.stats.health - 60) / 2 : 0));
}
YEAR_HOOKS.push(() => {
  if (S.edu.stage === 'school' && !S.prison) {
    if (!S.school) schoolInit();
    const sc = S.school;
    for (const [id] of SUBJ) sc.subj[id] = clamp(sc.subj[id] + rnd(-6, 6) + (S.stats.smarts > 65 ? 1 : 0) + (sc.teacher && sc.teacher.subj === id ? 2 : 0));
    S.edu.grade = clamp(Math.round(Object.values(sc.subj).reduce((a, b) => a + b, 0) / SUBJ.length * 0.5 + S.edu.grade * 0.5));
    if (!sc.teacher && S.age >= 8 && chance(0.3)) {
      const best = SUBJ.slice().sort((a, b) => sc.subj[b[0]] - sc.subj[a[0]])[0];
      const g = npcGender(); const nm = randFirst(g);
      sc.teacher = { name: nm, g, subj: best[0] };
      log(g === 'f' ? `🍎 У вас появилась любимая учительница: ${nm} (${best[2].toLowerCase()}). С ней урок пролетает незаметно.` : `🍎 У вас появился любимый учитель: ${nm} (${best[2].toLowerCase()}). С ним урок пролетает незаметно.`, 'good');
    }
    if (chance(0.12)) {
      const k = rnd(0, 4);
      if (k === 0) ev('😠', 'Травля', 'Компания старшеклассников начала цепляться к вам на переменах.', [
        { t: 'Дать отпор', f: () => chance(0.4 + S.stats.health / 250) ? (eff({ happy: 6 }), 'Вы дали отпор. От вас отстали и даже зауважали.') : (eff({ health: -6, happy: -6 }), 'Вас побили. Обидно и больно.') },
        { t: 'Рассказать учителю', f: () => { eff({ happy: 2 }); return 'Учитель вмешался. Стало спокойнее.'; } },
        { t: 'Терпеть', f: () => { eff({ happy: -8 }); return 'Вы терпели. Каждый день в школе стал испытанием.'; } }]);
      else if (k === 1) { eff({ happy: 4 }); log(`🚌 Экскурсия всем классом: ${pick(['в музей', 'на завод', 'в зоопарк', 'в планетарий', 'в театр', 'в другой город'])}.`, 'good'); }
      else if (k === 2) { const s = pick(SUBJ); sc.subj[s[0]] = clamp(sc.subj[s[0]] - 10); eff({ happy: -3 }); log(`😩 Провалили контрольную по предмету «${s[2]}». Дома будет разговор.`, 'bad'); }
      else if (k === 3 && S.age >= 13) { eff({ happy: 5 }); log(`💌 На перемене вам подкинули записку: «Ты мне нравишься». Без подписи.`, 'good'); }
      else { eff({ happy: 3 }); log(`📸 Школьный фотограф снял ваш класс. ${pick(['Вы моргнули.', 'Вы получились лучше всех.', 'Кто-то сделал рожки.'])}`, 'info'); }
    }
    if (S.age === 17 && !sc.prom) {
      sc.prom = true;
      ev('💃', 'Выпускной бал', 'Последний школьный вечер. Как проведёте?', [
        { t: '💃 Танцевать до рассвета', f: () => { eff({ happy: 12 }); return 'Встретили рассвет всем классом. Лучшая ночь школьной жизни.'; } },
        { t: S.gender === 'f' ? '👑 Бороться за титул «Королева бала»' : S.gender === 'm' ? '👑 Бороться за титул «Король бала»' : '👑 Бороться за титул «Король/Королева бала»', f: () => chance(S.stats.looks / 140 + (sc.pres ? 0.15 : 0)) ? (eff({ happy: 15 }), unlock('promking'), sc.promKing = true, (S.gender === 'f' ? '👑 Вас выбрали королевой выпускного!' : S.gender === 'm' ? '👑 Вас выбрали королём выпускного!' : '👑 Вас выбрали королём/королевой выпускного!')) : (eff({ happy: 2 }), 'Титул достался другому, но вечер всё равно отличный.') },
        { t: '🏠 Уйти пораньше', f: () => 'Вы ушли с выпускного пораньше. Отоспались.' }]);
    }
  }
  const sc = S.school;
  if (sc && !sc.done && S.edu.stage !== 'school' && S.age >= 15) {
    sc.done = true;
    const avg = Object.values(sc.subj).reduce((s, v) => s + mark(v), 0) / SUBJ.length;
    const noms = [];
    if (S.stats.smarts >= 80) noms.push('🧠 Самый умный');
    if (S.stats.looks >= 80) noms.push('😍 Самая яркая внешность');
    if (S.people.filter((p) => p.role === 'friend' && p.alive).length >= 3) noms.push('🎉 Душа компании');
    if (S.stats.health >= 80 || skillOf('sport') >= 50) noms.push('🏅 Спортсмен выпуска');
    if (S.karma < 35) noms.push('😈 Главный хулиган');
    if (sc.pres) noms.push('🏛️ Скорее всего станет президентом');
    if (sc.olymp.length) noms.push('🏆 Олимпиадник');
    if (S.talent && skillOf(S.talent) >= 40) noms.push(`${SKILLS.find((x) => x.id === S.talent)?.e || '🌟'} Главный талант школы`);
    if (!noms.length) noms.push(pick(['🤫 Самый загадочный', '😴 Мастер спать на уроках', '🍔 Король столовой', '💰 Скорее всего станет миллионером']));
    const quote = pick(['«Всё только начинается»', '«Я ещё вернусь»', '«Спасибо, что терпели»', '«Мечтай смело»', '«Кто не рискует, тот не пьёт лимонад»', '«Увидимся на встрече выпускников»']);
    sc.yearbook = { year: S.year, avg: Math.round(avg * 100) / 100, noms, quote };
    if (avg >= 4.75 && S.edu.level === 'school') { unlock('goldmedal'); eff({ smarts: 3, happy: 8 }); sc.medal = true; log(`🥇 Вы окончили школу с золотой медалью! Средний балл ${sc.yearbook.avg}.`, 'good'); }
    else log(`🎓 Выпускной альбом готов. Средний балл ${sc.yearbook.avg}. Номинации: ${noms.join(', ')}.`, 'info');
  }
});
EXTRA_TITLES.school = '🎒 Школа';
EXTRA_PANELS.school = function () {
  const B = $('#sheetBody');
  if (!S.school && S.edu.stage === 'school') schoolInit();
  const sc = S.school;
  if (!sc) { B.appendChild(el('<div class="empty">Школа начнётся в 6 лет.</div>')); return; }
  const rows = SUBJ.map(([id, e, n]) => `<div class="rc-row"><span>${e} ${n}${sc.teacher && sc.teacher.subj === id ? ' 🍎' : ''}</span><b class="m${mark(sc.subj[id])}">${mark(sc.subj[id])}</b></div>`).join('');
  card(`<div class="muted">📒 Дневник${S.edu.stage === 'school' ? ` · ${Math.min(11, S.age - 5)} класс` : ' · выпуск ' + (sc.yearbook?.year || '')}</div><div class="report">${rows}</div>${sc.teacher ? `<div class="muted">${sc.teacher.g === 'f' ? 'Любимая учительница' : 'Любимый учитель'}: ${esc(sc.teacher.name)}</div>` : ''}${sc.pres ? '<div class="muted">🏛️ Президент школы</div>' : ''}${sc.olymp.length ? `<div class="muted">🏆 Олимпиады: ${sc.olymp.map(esc).join(', ')}</div>` : ''}`);
  if (sc.yearbook) {
    const Y = sc.yearbook;
    B.appendChild(el(`<div class="section-title">Выпускной альбом ${Y.year}</div>`));
    card(`<div class="yearbook"><div class="yb-photo">${typeof playerPortrait === 'function' ? playerPortrait() : avatar()}</div><div><div class="big">${esc(S.first)} ${esc(S.surname)}</div><div class="muted">${esc(Y.quote)}</div><div class="yb-noms">${Y.noms.map((n) => `<span>${esc(n)}</span>`).join('')}</div><div class="muted">Средний балл: ${Y.avg}${sc.medal ? ' · 🥇 золотая медаль' : ''}${sc.promKing ? ' · 👑 король/королева бала' : ''}</div></div></div>`);
  }
  if (S.edu.stage !== 'school' || S.prison) return;
  const l = section('Этот год');
  item(l, { e: '📚', t: 'Подтянуть предмет', d: 'Занятия с репетитором или самостоятельно', disabled: S.used.sc_study, onClick: () => { Q.push({ e: '📚', title: 'Какой предмет?', text: 'Выберите, чем займётесь в этом году.', choices: SUBJ.map(([id, e, n]) => ({ t: `${e} ${n} · ${mark(sc.subj[id])}`, f: () => { S.used.sc_study = 1; const g = rnd(8, 16); sc.subj[id] = clamp(sc.subj[id] + g); eff({ smarts: 2, happy: -2 }); return `${e} Вы подтянули предмет «${n}».`; } })).concat([{ t: 'Отмена', f: () => null }]) }); pump(); } });
  if (S.age >= 9) item(l, { e: '🏆', t: 'Олимпиада', d: 'Шанс зависит от оценки по предмету', disabled: S.used.sc_olymp, onClick: () => { Q.push({ e: '🏆', title: 'Олимпиада', text: 'По какому предмету участвуете?', choices: SUBJ.filter(([id]) => id !== 'pe').map(([id, e, n]) => ({ t: `${e} ${n} · ${mark(sc.subj[id])}`, f: () => {
    S.used.sc_olymp = 1; const v = sc.subj[id] + rnd(-25, 15) + S.stats.smarts / 5;
    const lvl = v > 108 ? 3 : v > 95 ? 2 : v > 80 ? 1 : v > 65 ? 0 : -1;
    if (lvl < 0) { eff({ happy: -2 }); return `${e} Олимпиада по предмету «${n}»: без призового места. Зато опыт.`; }
    const where = ['школьную', 'городскую', 'национальную', 'международную'][lvl];
    sc.olymp.push(`${e} ${['школа', 'город', 'страна', 'мир'][lvl]}`); eff({ smarts: 2 + lvl, happy: 6 + lvl * 3 }); sc.subj[id] = clamp(sc.subj[id] + 4);
    if (lvl >= 2) unlock('olymp');
    if (lvl === 3) { const g = price(300000); S.money += g; return `🌍 Победа на международной олимпиаде по предмету «${n}»! Премия ${fmt(g)} и слава на всю страну.`; }
    return `🏆 Вы выиграли ${where} олимпиаду по предмету «${n}»!`;
  } })).concat([{ t: 'Отмена', f: () => null }]) }); pump(); } });
  if (S.age >= 12 && !sc.pres) item(l, { e: '🗳️', t: 'Баллотироваться в президенты школы', d: 'Нужны харизма и друзья', disabled: S.used.sc_pres, onClick: act(() => {
    S.used.sc_pres = 1; const fr = S.people.filter((p) => p.role === 'friend' && p.alive).length;
    if (chance(0.15 + S.stats.looks / 300 + fr * 0.06 + S.karma / 400)) { sc.pres = true; unlock('classpres'); eff({ happy: 10 }); return '🗳️ Вы победили на школьных выборах! Теперь вы президент школы.'; }
    eff({ happy: -5 }); return '🗳️ Выборы проиграны. Ваш соперник обещал автомат с газировкой.';
  }) });
  item(l, { e: '🏫', t: 'Кружки и секции', d: 'Развить навык и найти друзей', onClick: () => { const a = ACTIVITIES.find((x) => x.id === 'clubs'); if (a && !S.used.clubs) { S.used.clubs = 1; a.run(); closeSheet(); pump(); } else toast('Уже в этом году'); } });
  item(l, { e: '🙈', t: 'Прогулять уроки', d: '+счастье, но могут поймать', disabled: S.used.sc_skip, onClick: act(() => { S.used.sc_skip = 1; eff({ happy: 6 }); for (const [id] of SUBJ) sc.subj[id] = clamp(sc.subj[id] - 2); if (chance(0.4)) { eff({ happy: -8 }); const p = parentsAlive()[0]; if (p) p.close = clamp(p.close - 8); return '🙈 Классная позвонила родителям. Домашний арест на месяц.'; } return '🙈 Вы с друзьями прогуляли уроки и пошли в кино. Никто не узнал.'; }) });
  item(l, { e: '📋', t: 'Списать на контрольной', d: 'Рискованно', disabled: S.used.sc_cheat, onClick: act(() => { S.used.sc_cheat = 1; const s = pick(SUBJ); if (chance(0.35)) { sc.subj[s[0]] = clamp(sc.subj[s[0]] - 12); eff({ karma: -3, happy: -5 }); return `📋 Вас поймали со шпаргалкой. «Два» по предмету «${s[2]}».`; } sc.subj[s[0]] = clamp(sc.subj[s[0]] + 10); eff({ karma: -2 }); return `📋 Списали удачно. Пятёрка по предмету «${s[2]}».`; }) });
};
const _panelJobL = panelJob;
panelJob = function () {
  if ((S.edu.stage === 'school' || S.school) && !S.prison) { const l = section('Школа'); item(l, { e: '🎒', t: 'Школьная жизнь', d: S.edu.stage === 'school' ? 'Оценки, олимпиады, выборы, выпускной' : 'Выпускной альбом', onClick: () => openPanel('school') }); }
  _panelJobL();
};

/* ====================== 🐾 ПИТОМЦЫ ====================== */
PETS.push(
  { id: 'hedgehog', e: '🦔', name: 'Ёжик', life: 6, exotic: true, cost: 20000 }, { id: 'iguana', e: '🦎', name: 'Игуана', life: 15, exotic: true, cost: 40000 },
  { id: 'python', e: '🐍', name: 'Питон', life: 25, exotic: true, cost: 90000 }, { id: 'spider', e: '🕷️', name: 'Тарантул', life: 15, exotic: true, cost: 15000 },
  { id: 'fennec', e: '🦊', name: 'Фенек', life: 12, exotic: true, cost: 250000 }, { id: 'owl', e: '🦉', name: 'Сова', life: 20, exotic: true, cost: 180000 },
  { id: 'capybara', e: '🦫', name: 'Капибара', life: 10, exotic: true, cost: 400000 }, { id: 'monkey', e: '🐒', name: 'Обезьянка', life: 25, exotic: true, cost: 600000 }
);
const BREEDS = {
  dog: [['Дворняжка', 0, 35], ['Лабрадор', 60000, 65], ['Хаски', 70000, 70], ['Корги', 90000, 75], ['Немецкая овчарка', 70000, 75], ['Мопс', 50000, 60], ['Бордер-колли', 80000, 80], ['Доберман', 75000, 70], ['Самоед', 120000, 85]],
  cat: [['Беспородная', 0, 35], ['Мейн-кун', 80000, 80], ['Сфинкс', 70000, 70], ['Британская', 50000, 70], ['Сиамская', 40000, 65], ['Бенгальская', 120000, 85], ['Шотландская вислоухая', 60000, 75]],
  horse: [['Тяжеловоз', 0, 40], ['Орловский рысак', 400000, 75], ['Арабская', 1500000, 90], ['Ахалтекинская', 2000000, 95]],
  parrot: [['Волнистый', 0, 40], ['Корелла', 15000, 55], ['Жако', 120000, 85], ['Ара', 300000, 90]]
};
const TRICKS = { dog: ['сидеть', 'лежать', 'дай лапу', 'апорт', 'кувырок', 'служить', 'приносить тапки', 'танцевать на задних лапах'], cat: ['приходить на имя', 'давать лапу', 'прыгать через обруч', 'открывать дверь'], parrot: ['говорить «привет»', 'свистеть мелодию', 'называть вас по имени', 'изображать телефон', 'считать до трёх'], horse: ['галоп', 'прыжок через барьер', 'выездка', 'поклон'], other: ['откликаться на имя', 'брать еду с руки'] };
const petDef = (p) => PETS.find((x) => x.id === p.type) || PETS[0];
openPetShop = function () {
  closeSheet();
  const kid = S.age < 18;
  const ask = (f) => () => { if (kid) { const par = parentsAlive(); if (!par.length || !chance(0.55)) return 'Родители сказали «нет». 😢'; } return f(); };
  const getPet = (type, extra) => { addPet(type); const p = S.pets[S.pets.length - 1]; Object.assign(p, { trained: 0, tricks: [], wins: 0 }, extra); eff({ happy: 10 }); if (S.pets.filter((x) => x.alive).length >= 6) unlock('zoo'); return p; };
  const breedPick = (type) => {
    const d = PETS.find((x) => x.id === type);
    Q.push({ e: d.e, title: `${d.name}: порода`, text: kid ? 'Выберите, кого попросить у родителей.' : 'Породистые лучше выступают на выставках.', choices: BREEDS[type].map(([n, c, q]) => ({ t: `${n}${c ? ` · ${fmt(price(c))}` : ''}`, disabled: !kid && S.money < price(c), f: ask(() => { if (!kid) S.money -= price(c); const p = getPet(type, { breed: n, q: clamp(q + rnd(-10, 10)) }); return `${d.e} У вас ${n.toLowerCase()} по кличке ${p.name}!`; }) })).concat([{ t: 'Назад', f: () => { openPetShop(); return null; } }]) });
  };
  Q.push({ e: '🐾', title: 'Новый питомец', text: kid ? 'Попросите родителей!' : 'Откуда возьмём друга?', choices: [
    { t: '🏠 Взять из приюта · бесплатно', f: ask(() => { const type = pick(['dog', 'dog', 'cat', 'cat', 'rabbit', 'parrot']); const p = getPet(type, { breed: type === 'dog' ? 'Дворняжка' : type === 'cat' ? 'Беспородная' : '', q: rnd(20, 50), shelter: true }); p.age = rnd(1, 6); p.close = 60; eff({ karma: 8 }); unlock('shelter'); return `${petDef(p).e} Вы забрали из приюта: ${petDef(p).name.toLowerCase()} по кличке ${p.name}. Глаза, полные благодарности.`; }) },
    { t: '🐶 Собаки по породам', f: () => { breedPick('dog'); return null; } },
    { t: '🐱 Кошки по породам', f: () => { breedPick('cat'); return null; } },
    { t: '🐹 Небольшие питомцы', f: () => { Q.push({ e: '🐹', title: 'Небольшие питомцы', text: kid ? '' : `Стоимость: ${fmt(price(15000))}`, choices: ['hamster', 'fish', 'rabbit', 'turtle'].map((id) => { const d = PETS.find((x) => x.id === id); return { t: `${d.e} ${d.name}`, f: ask(() => { if (!kid) S.money -= price(15000); const p = getPet(id, { q: rnd(30, 70) }); return `${d.e} У вас новый питомец: ${d.name.toLowerCase()} по кличке ${p.name}!`; }) }; }).concat([{ t: '🦜 Попугаи по видам', f: () => { breedPick('parrot'); return null; } }, { t: 'Назад', f: () => { openPetShop(); return null; } }]) }); return null; } },
    ...(S.age >= 14 ? [{ t: '🐴 Лошади', f: () => { breedPick('horse'); return null; } }] : []),
    ...(S.age >= 18 ? [{ t: '🦎 Экзотика', f: () => { Q.push({ e: '🦎', title: 'Экзотические питомцы', text: 'Нужен особый уход и лицензия.', choices: PETS.filter((x) => x.exotic && (x.id !== 'monkey' || S.year >= 1950)).map((d) => ({ t: `${d.e} ${d.name} · ${fmt(price(d.cost))}`, disabled: S.money < price(d.cost), f: () => { S.money -= price(d.cost); const p = getPet(d.id, { q: rnd(50, 90) }); unlock('exotic'); return `${d.e} В доме поселился необычный жилец: ${d.name.toLowerCase()} по кличке ${p.name}!`; } })).concat([{ t: 'Назад', f: () => { openPetShop(); return null; } }]) }); return null; } }] : []),
    { t: 'Передумать', f: () => null }] });
  pump();
};
EXTRA_TITLES.pets = '🐾 Питомцы';
EXTRA_PANELS.pets = function () {
  const B = $('#sheetBody');
  const pets = S.pets.filter((p) => p.alive);
  btnRow(B, [{ t: '➕ Завести питомца', cls: 'primary', disabled: S.prison, f: () => openPetShop() }]);
  if (!pets.length) { B.appendChild(el('<div class="empty">Питомцев пока нет. Приют ждёт!</div>')); }
  for (const p of pets) {
    const d = petDef(p); p.tricks = p.tricks || []; p.trained = p.trained || 0;
    const tk = ['dog', 'cat', 'parrot', 'horse'].includes(p.type) ? p.type : 'other';
    const showable = ['dog', 'cat', 'horse', 'parrot'].includes(p.type);
    B.appendChild(el(`<div class="section-title">${d.e} ${esc(p.name)}</div>`));
    card(`<div class="muted">${esc(p.breed || d.name)} · ${yrs(p.age)}${p.sick ? ' · 🤒 болеет' : ''}${p.shelter ? ' · из приюта' : ''}</div><div class="pet-bars"><span>❤️ Привязанность</span><div class="bar-mini"><em style="width:${p.close}%"></em></div><span>🎓 Дрессировка</span><div class="bar-mini"><em style="width:${p.trained}%"></em></div></div>${p.tricks.length ? `<div class="muted">Умеет: ${p.tricks.map(esc).join(', ')}</div>` : ''}${p.wins ? `<div class="muted">🏆 Побед на выставках: ${p.wins}${p.champ ? ' · Чемпион породы' : ''}</div>` : ''}`);
    const l = el('<div class="list"></div>'); B.appendChild(l);
    const u = (a) => `pet_${a}_${p.id}`;
    item(l, { e: '🎾', t: 'Поиграть и погулять', d: '+привязанность, +счастье', disabled: S.used[u('play')] || S.prison, onClick: act(() => { S.used[u('play')] = 1; p.close = clamp(p.close + 10); eff({ happy: rnd(3, 6), health: p.type === 'dog' ? 2 : 0 }); return `${d.e} ${p.name} счастлив${p.type === 'cat' ? 'а' : ''}! Отличный день вместе.`; }) });
    item(l, { e: '🎓', t: 'Дрессировка', d: `${fmt(price(8000))} · выучить трюк`, disabled: S.used[u('train')] || S.prison || p.age > d.life - 1, onClick: act(() => {
      S.used[u('train')] = 1; if (S.age >= 18) S.money -= price(8000);
      const gain = rnd(8, 18) + (p.type === 'dog' ? 6 : p.type === 'cat' ? -4 : 0); p.trained = clamp(p.trained + gain);
      const left = TRICKS[tk].filter((t) => !p.tricks.includes(t));
      if (left.length && chance(0.35 + p.trained / 200)) { const t = pick(left); p.tricks.push(t); if (p.tricks.length >= 5) unlock('trainer'); return `🎓 ${p.name} выучил${p.type === 'cat' ? 'а' : ''} новый трюк: «${t}»!`; }
      return `🎓 Тренировка с ${p.name}. Прогресс есть, трюк пока не получается.`;
    }) });
    item(l, { e: '🩺', t: 'Ветеринар', d: `${fmt(price(15000))} · лечение и профилактика`, disabled: S.used[u('vet')] || S.prison, onClick: act(() => {
      S.used[u('vet')] = 1; if (S.age >= 18) S.money -= price(15000);
      if (p.sick) { p.sick = false; return `🩺 Ветеринар вылечил ${p.name}. Снова бодр${p.type === 'cat' ? 'а' : ''}!`; }
      p.bonusLife = Math.min(4, (p.bonusLife || 0) + (chance(0.4) ? 1 : 0)); return `🩺 ${p.name} здоров${p.type === 'cat' ? 'а' : ''}. Профилактика продлевает жизнь.`;
    }) });
    if (showable) item(l, { e: '🏆', t: 'Выставка', d: `${fmt(price(10000))} · шанс зависит от породы и дрессировки`, disabled: S.used[u('show')] || S.prison || S.money < price(10000), onClick: act(() => {
      S.used[u('show')] = 1; S.money -= price(10000);
      const v = (p.q || 40) * 0.55 + p.trained * 0.45 + rnd(-20, 20);
      if (v > 85) { p.wins = (p.wins || 0) + 1; const g = price(p.type === 'horse' ? 500000 : 80000); S.money += g; eff({ happy: 12 }); if (p.wins >= 3) { p.champ = true; unlock('petchamp'); } return `🏆 ${p.name} взял${p.type === 'cat' ? 'а' : ''} первое место на выставке! Приз ${fmt(g)}.`; }
      if (v > 65) { eff({ happy: 5 }); return `🥈 ${p.name}: почётное второе место.`; }
      eff({ happy: -2 }); return `${d.e} ${p.name} больше интересовался судьями, чем подиумом. Без мест.`;
    }) });
    item(l, { e: '🤲', t: 'Отдать в добрые руки', d: 'Если не справляетесь', onClick: () => { Q.push({ e: d.e, title: `Отдать ${p.name}?`, text: 'Питомец будет жить в новой семье.', choices: [{ t: 'Отдать', cls: 'danger', f: () => { S.pets = S.pets.filter((x) => x !== p); eff({ happy: -10 }); return `${d.e} ${p.name} уехал${p.type === 'cat' ? 'а' : ''} в новую семью. Грустно.`; } }, { t: 'Оставить', f: () => null }] }); pump(); } });
  }
};
const _yearPetsL = yearPets;
yearPets = function () {
  for (const p of S.pets) if (p.alive && p.bonusLife) p.age -= p.bonusLife;
  for (const p of S.pets) if (p.alive && p.sick && chance(0.3)) { p.alive = false; log(`🌈 ${p.name} так и не поправил${p.type === 'cat' ? 'ась' : 'ся'}. Ушёл на радугу.`, 'bad'); eff({ happy: -12 }); }
  _yearPetsL();
  for (const p of S.pets) if (p.bonusLife) p.age += p.bonusLife;
  for (const p of S.pets.filter((x) => x.alive)) {
    if (!p.sick && chance(0.07)) { p.sick = true; log(`🤒 ${p.name} заболел${p.type === 'cat' ? 'а' : ''}. Нужен ветеринар!`, 'bad'); }
    if (chance(0.06)) {
      const d = petDef(p);
      const evs = p.type === 'dog' ? [`🐕 ${p.name} спас${''} вас: залаял ночью, когда начался пожар на кухне.`, `🐕 ${p.name} сгрыз ваши любимые ботинки.`, `🐕 ${p.name} подружился с соседской собакой.`]
        : p.type === 'cat' ? [`🐈 ${p.name} принесла вам «подарок» — мышь на подушку.`, `🐈 ${p.name} уронила вазу и смотрела вам в глаза.`, `🐈 ${p.name} спит на вас каждую ночь. Мурчит.`]
          : p.type === 'parrot' ? [`🦜 ${p.name} выучил неприличное слово и сказал его при гостях.`, `🦜 ${p.name} передразнивает ваш будильник.`]
            : [`${d.e} ${p.name} радует вас каждый день.`, `${d.e} ${p.name} сбежал${''}, но вечером нашёлся.`];
      const t = pick(evs); log(t, /спас|радует|мурчит|подружился/i.test(t) ? 'good' : 'info'); eff({ happy: 2 });
      if (S.year >= 2008 && S.age >= 12 && chance(0.25)) { const f = rnd(1000, 80000); S.followers += f; log(`📱 Видео с ${p.name} стало вирусным: +${f.toLocaleString('ru-RU')} подписчиков.`, 'good'); }
    }
  }
};
const _panelPeopleL = panelPeople;
panelPeople = function () {
  const n = S.pets.filter((p) => p.alive).length;
  const l = section('Питомцы'); item(l, { e: '🐾', t: n ? `Мои питомцы · ${n}` : 'Завести питомца', d: 'Дрессировка, ветеринар, выставки, приют, экзотика', onClick: () => openPanel('pets') });
  _panelPeopleL();
};

/* ====================== 🌪️ СТИХИЙНЫЕ БЕДСТВИЯ ====================== */
const DIS = {
  quake: { e: '🌍', n: 'Землетрясение', d: 'Земля ходит ходуном, рушатся дома.', dmg: 0.4 },
  hurricane: { e: '🌀', n: 'Ураган', d: 'Ветер срывает крыши, отключено электричество.', dmg: 0.3 },
  flood: { e: '🌊', n: 'Наводнение', d: 'Вода поднимается, затоплены улицы.', dmg: 0.3 },
  fire: { e: '🔥', n: 'Лесные пожары', d: 'Огонь подбирается к жилым районам, дым застилает небо.', dmg: 0.35 },
  tsunami: { e: '🌊', n: 'Цунами', d: 'Огромная волна идёт на побережье!', dmg: 0.6 },
  volcano: { e: '🌋', n: 'Извержение вулкана', d: 'Пепел закрыл солнце, лава течёт по склонам.', dmg: 0.45 },
  tornado: { e: '🌪️', n: 'Торнадо', d: 'Воронка идёт прямо на ваш район.', dmg: 0.5 },
  blizzard: { e: '🌨️', n: 'Снежная буря', d: 'Город завалило снегом, дороги перекрыты.', dmg: 0.08 },
  drought: { e: '☀️', n: 'Засуха', d: 'Неурожай, растут цены на еду, не хватает воды.', dmg: 0.05 },
  heat: { e: '🥵', n: 'Аномальная жара', d: 'Сорок градусов в тени, переполнены больницы.', dmg: 0.02 }
};
const REGION_DIS = {
  quake: ['jp', 'tr', 'cl', 'pe', 'idn', 'ph', 'mx', 'ir', 'gr', 'it', 'am', 'ge', 'nz', 'cn', 'af', 'np', 'pk', 'tw', 'ec', 'co', 'kg', 'tj', 'uz', 'kz', 'al', 'rs'],
  hurricane: ['us', 'cu', 'mx', 'ph', 'jp', 'cn', 'vn', 'bd', 'in', 'do', 'ht', 'jm', 'tw', 'au', 'mg', 'mz'],
  flood: ['in', 'bd', 'cn', 'de', 'nl', 'pk', 'th', 'vn', 'idn', 'br', 'ng', 'it', 'gb', 'pl', 'cz', 'ro', 'ru', 'ua', 'ke', 'mm', 'kh', 'la'],
  fire: ['au', 'us', 'gr', 'ca', 'ru', 'pt', 'es', 'tr', 'cl', 'il', 'br'],
  tsunami: ['jp', 'idn', 'th', 'cl', 'lk', 'ph', 'nz'],
  volcano: ['is', 'idn', 'it', 'jp', 'ph', 'nz', 'cl', 'mx', 'ec', 'gt'],
  tornado: ['us', 'ca', 'bd', 'ar'],
  blizzard: ['ru', 'ca', 'kz', 'mn', 'us', 'fi', 'se', 'no', 'is', 'by', 'ua'],
  drought: ['ke', 'et', 'so', 'ng', 'za', 'zw', 'ma', 'eg', 'in', 'au', 'sd', 'ne', 'ml', 'af', 'sy'],
  heat: ['in', 'pk', 'sa', 'ae', 'eg', 'fr', 'es', 'it', 'gr', 'ru', 'us', 'au', 'iq', 'kw']
};
const HIST_DIS = [
  [1902, 'fr', 'volcano', 'Извержение вулкана Мон-Пеле на Мартинике'], [1906, 'us', 'quake', 'Сан-Францисское землетрясение'], [1908, 'it', 'quake', 'Мессинское землетрясение'], [1908, 'ru', 'fire', 'Тунгусский взрыв над тайгой'],
  [1923, 'jp', 'quake', 'Великое землетрясение Канто'], [1927, 'us', 'flood', 'Великое наводнение на Миссисипи'], [1931, 'cn', 'flood', 'Великое наводнение на Янцзы'], [1934, 'us', 'drought', 'Пыльный котёл на Великих равнинах'],
  [1939, 'tr', 'quake', 'Эрзинджанское землетрясение'], [1948, 'tm', 'quake', 'Ашхабадское землетрясение'], [1953, 'nl', 'flood', 'Наводнение в Северном море'], [1960, 'cl', 'quake', 'Великое Чилийское землетрясение'],
  [1966, 'uz', 'quake', 'Ташкентское землетрясение'], [1970, 'pe', 'quake', 'Землетрясение в Анкаше'], [1970, 'bd', 'hurricane', 'Циклон Бхола'], [1976, 'cn', 'quake', 'Таншаньское землетрясение'],
  [1985, 'mx', 'quake', 'Землетрясение в Мехико'], [1985, 'co', 'volcano', 'Извержение вулкана Невадо-дель-Руис'], [1988, 'am', 'quake', 'Спитакское землетрясение'], [1991, 'ph', 'volcano', 'Извержение Пинатубо'],
  [1995, 'jp', 'quake', 'Землетрясение в Кобе'], [1995, 'ru', 'quake', 'Нефтегорское землетрясение'], [1998, 'cn', 'flood', 'Наводнение на Янцзы'], [1999, 'tr', 'quake', 'Измитское землетрясение'],
  [2002, 'cz', 'flood', 'Наводнение в Праге'], [2003, 'fr', 'heat', 'Жара в Европе'], [2004, 'idn', 'tsunami', 'Цунами в Индийском океане'], [2004, 'th', 'tsunami', 'Цунами в Индийском океане'], [2004, 'lk', 'tsunami', 'Цунами в Индийском океане'],
  [2005, 'us', 'hurricane', 'Ураган «Катрина»'], [2005, 'pk', 'quake', 'Кашмирское землетрясение'], [2008, 'cn', 'quake', 'Сычуаньское землетрясение'], [2009, 'au', 'fire', '«Чёрная суббота» в Виктории'],
  [2010, 'ru', 'fire', 'Пожары и смог лета 2010'], [2010, 'cl', 'quake', 'Землетрясение в Мауле'], [2010, 'is', 'volcano', 'Извержение Эйяфьядлайёкюдля'], [2010, 'pk', 'flood', 'Наводнения в Пакистане'],
  [2011, 'jp', 'tsunami', 'Землетрясение и цунами Тохоку'], [2011, 'nz', 'quake', 'Землетрясение в Крайстчерче'], [2012, 'us', 'hurricane', 'Ураган «Сэнди»'], [2012, 'ru', 'flood', 'Наводнение в Крымске'],
  [2013, 'ph', 'hurricane', 'Тайфун «Хайян»'], [2015, 'np', 'quake', 'Землетрясение в Непале'], [2017, 'mx', 'quake', 'Землетрясение в Пуэбле'], [2018, 'gr', 'fire', 'Пожары в Аттике'], [2018, 'idn', 'tsunami', 'Цунами в Палу'],
  [2019, 'au', 'fire', 'Сезон «Чёрное лето»'], [2021, 'de', 'flood', 'Наводнение в долине Ар'], [2022, 'pk', 'flood', 'Наводнения в Пакистане'], [2023, 'tr', 'quake', 'Землетрясение в Турции'], [2023, 'ma', 'quake', 'Землетрясение в Марокко'], [2023, 'ly', 'flood', 'Наводнение в Дерне']
];
function disTypes(c) { return Object.keys(REGION_DIS).filter((k) => REGION_DIS[k].includes(c)); }
function disasterEvent(type, name) {
  const D = DIS[type]; const h = S.assets.some((a) => a.type === 'house') ? homeAsset() : null;
  const ins = S.home && S.home.insured;
  const hit = (k) => { if (!h) return ''; const loss = Math.round(h.value * D.dmg * k * rf(0.5, 1.2)); if (!loss) return ''; if (ins) { if (S.home) S.home.cond = clamp(S.home.cond - 30); return ' Страховка покрыла ущерб дому.'; } h.value = Math.max(Math.round(h.value * 0.2), h.value - loss); if (S.home) S.home.cond = clamp(S.home.cond - 40); return ` Ущерб дому: ${fmt(loss)}.`; };
  S.disasters = (S.disasters || 0) + 1; if (S.disasters >= 3) unlock('natsurvivor');
  if (D.dmg < 0.1) { eff({ happy: -4, health: type === 'heat' ? -3 : -1 }); if (type === 'drought') S.money -= price(20000); log(`${D.e} ${name || D.n}. ${D.d}`, 'bad'); return; }
  ev(D.e, name || D.n, `${D.d} ${S.age < 14 ? 'Родители решают, что делать.' : 'Что будете делать?'}`, S.age < 14 ? [
    { t: 'Держаться за родителей', f: () => { eff({ happy: -10 }); const r = hit(0.7); return `${D.e} Вы с семьёй пережили стихию в укрытии.${r} Страшно было до слёз.`; } }
  ] : [
    { t: '🚗 Эвакуироваться', f: () => { eff({ happy: -8 }); S.money -= price(30000); return `${D.e} Вы эвакуировались вовремя.${hit(1)}`; } },
    { t: '🏠 Остаться и защищать дом', f: () => { if (chance(D.dmg * 0.2)) { if (chance(0.15)) { die(`Погиб${S.gender === 'f' ? 'ла' : ''} во время стихийного бедствия: ${(name || D.n).toLowerCase()}`); return 'Стихия оказалась сильнее.'; } eff({ health: -rnd(15, 30) }); return `${D.e} Вас ранило, пока вы спасали дом.${hit(0.6)}`; } eff({ happy: -4 }); return `${D.e} Вы отстояли дом.${hit(0.4)}`; } },
    { t: '🦺 Помогать спасателям', f: () => { eff({ karma: 12, happy: 4 }); if (chance(0.12)) eff({ health: -rnd(8, 20) }); unlock('rescuer'); S.fameBonus = (S.fameBonus || 0) + 3; return `${D.e} Вы несколько суток разбирали завалы и спасли людей. О вас написали в газете.${hit(1)}`; } },
    ...(S.money > price(1000000) ? [{ t: `💝 Пожертвовать ${fmt(price(500000))}`, f: () => { S.money -= price(500000); eff({ karma: 10, happy: 3 }); return `${D.e} Вы помогли пострадавшим деньгами.${hit(0.8)}`; } }] : [])
  ]);
}
YEAR_HOOKS.push(() => {
  if (!S.alive || S.prison) return;
  const hist = HIST_DIS.filter(([y, c]) => y === S.year && c === S.country);
  if (hist.length) { const [, , t, n] = hist[0]; disasterEvent(t, n); return; }
  const types = disTypes(S.country);
  const warm = S.year > 2020 ? 1 + (S.year - 2020) / 40 : 1;
  if (types.length && chance(0.03 * warm)) disasterEvent(pick(types));
});

/* ====================== 📜 ЗАВЕЩАНИЕ ====================== */
const willHeirs = () => S.people.filter((p) => p.alive && (p.role === 'child' || (p.role === 'partner' && p.status === 'married')));
EXTRA_TITLES.will = '📜 Завещание';
EXTRA_PANELS.will = function () {
  const B = $('#sheetBody');
  const H = willHeirs();
  if (!H.length) { card('<div class="big">Наследников пока нет</div><div class="muted">Без завещания всё перейдёт государству или дальним родственникам. Завещание можно составить, когда появятся дети или супруг(а).</div>'); return; }
  S.willDraft = S.willDraft || (S.will ? JSON.parse(JSON.stringify(S.will)) : { shares: {}, charity: 0 });
  const W = S.willDraft;
  for (const p of H) if (W.shares[p.id] == null) W.shares[p.id] = Math.floor(100 / H.length / 10) * 10;
  for (const id of Object.keys(W.shares)) if (!H.some((p) => p.id === id)) delete W.shares[id];
  const total = () => Object.values(W.shares).reduce((s, v) => s + v, 0) + W.charity;
  card(`<div class="muted">Наследство сейчас</div><div class="big">${fmt(netWorth())}</div><div class="muted">${S.will ? `Завещание заверено в ${S.will.year} году.` : 'Завещания нет: по закону всё делится поровну.'} Распределено: <b>${total()}%</b>${total() !== 100 ? ' (нужно 100%)' : ''}</div>`);
  const l = section('Кому и сколько');
  const step = (obj, key, d) => () => { obj[key] = Math.max(0, Math.min(100, obj[key] + d)); refreshSheet(); };
  for (const p of H) {
    const row = item(l, { e: personEmoji(p), t: `${p.name} · ${roleName(p)}`, d: `${yrs(p.age)} · отношения ${p.close}%`, r: `${W.shares[p.id]}%` });
    row.appendChild(el('<span class="will-st"></span>'));
    const st = row.querySelector('.will-st');
    for (const [t, d] of [['−', -10], ['+', 10]]) { const b = document.createElement('button'); b.className = 'btn ghost sm'; b.textContent = t; b.onclick = step(W.shares, p.id, d); st.appendChild(b); }
  }
  const cr = item(l, { e: '💝', t: 'Благотворительность', d: 'Фонд помощи детям и науке', r: `${W.charity}%` });
  cr.appendChild(el('<span class="will-st"></span>'));
  for (const [t, d] of [['−', -10], ['+', 10]]) { const b = document.createElement('button'); b.className = 'btn ghost sm'; b.textContent = t; b.onclick = step(W, 'charity', d); cr.querySelector('.will-st').appendChild(b); }
  const fee = price(20000);
  btnRow(B, [
    { t: `✍️ Заверить у нотариуса (${fmt(fee)})`, cls: 'primary', disabled: total() !== 100 || S.money < fee, f: act(() => { S.money -= fee; S.will = { shares: { ...W.shares }, charity: W.charity, year: S.year }; S.willDraft = null; unlock('will'); const fav = H.slice().sort((a, b) => W.shares[b.id] - W.shares[a.id]); const uneq = H.length > 1 && W.shares[fav[0].id] !== W.shares[fav[fav.length - 1].id]; if (uneq && chance(0.4)) { const p = fav[fav.length - 1]; p.close = clamp(p.close - 15); return `📜 Завещание заверено. ${p.name} как-то узнал${gv(p, '', 'а', '(а)')} о своей доле и обиделся.`; } return '📜 Завещание заверено нотариусом.'; }) },
    { t: '⚖️ Поровну', f: () => { const n = H.length; for (const p of H) W.shares[p.id] = Math.floor((100 - W.charity) / n); W.shares[H[0].id] += 100 - W.charity - Math.floor((100 - W.charity) / n) * n; refreshSheet(); } },
    ...(S.will ? [{ t: '🗑️ Отменить завещание', f: act(() => { S.will = null; S.willDraft = null; return 'Завещание отменено.'; }) }] : [])
  ]);
};
MENU_HOOKS.push((l) => { if (S.age >= 18) item(l, { e: '📜', t: 'Завещание', d: S.will ? `Заверено в ${S.will.year} году` : 'Решить, кому что достанется', onClick: () => openPanel('will') }); });
const _contAsW = continueAs;
continueAs = function (k) {
  const old = S; const heirs = willHeirs(); const W = old.will;
  let share; let reason;
  if (W && W.shares[k.id] != null) { share = W.shares[k.id] / 100; reason = `По завещанию вам досталось ${W.shares[k.id]}%.`; }
  else { share = heirs.length ? 1 / heirs.length : 1; reason = heirs.length > 1 ? `Завещания не было: по закону наследство поделено на ${heirs.length} ${plural(heirs.length, ['часть', 'части', 'частей'])}.` : ''; }
  const sibs = heirs.filter((p) => p.role === 'child' && p.id !== k.id);
  const charity = W ? W.charity : 0;
  const oldName = old.first;
  _contAsW(k);
  if (S.money > 0) S.money = Math.round(S.money * share);
  if (reason) log(`📜 ${reason}${charity ? ` ${charity}% ушло на благотворительность, в городе открыли сквер имени ${oldName}.` : ''}`, 'info');
  if (W && sibs.length) {
    const my = W.shares[k.id] || 0;
    const hurt = sibs.filter((p) => (W.shares[p.id] || 0) < my);
    const angry = sibs.filter((p) => (W.shares[p.id] || 0) > my);
    for (const s of S.people.filter((p) => p.role === 'sibling')) {
      if (hurt.some((h) => h.id === s.id)) s.close = clamp(s.close - 25);
      if (angry.some((h) => h.id === s.id)) s.close = clamp(s.close + 5);
    }
    const sib = S.people.find((p) => p.role === 'sibling' && hurt.some((h) => h.id === p.id));
    if (sib && chance(0.6)) ev('⚖️', 'Спор о наследстве', `${sib.name} считает, что завещание несправедливо, и грозит судом.`, [
      { t: `🤝 Отдать часть (${fmt(Math.round(Math.max(0, S.money) * 0.2))})`, f: () => { S.money -= Math.round(Math.max(0, S.money) * 0.2); sib.close = clamp(sib.close + 30); eff({ karma: 5 }); return `🤝 Вы поделились с ${sib.name}. Семья сохранила мир.`; } },
      { t: '⚖️ Судиться', f: () => { S.money -= price(200000); if (chance(0.6)) { sib.close = 0; return '⚖️ Суд оставил завещание в силе. Но с братом/сестрой вы больше не общаетесь.'; } S.money = Math.round(S.money * 0.6); sib.close = clamp(sib.close - 10); return '⚖️ Суд пересмотрел завещание не в вашу пользу.'; } },
      { t: '🚪 Проигнорировать', f: () => { sib.close = clamp(sib.close - 20); return 'Вы не ответили. Отношения испорчены.'; } }]);
    else if (!hurt.length && sibs.length) log('🕊️ Наследство разделили без споров. Семья стала только ближе.', 'good');
  }
  S.will = null;
  save(); render();
};

ACHIEVEMENTS.push(
  { id: 'cozy', e: '🛋️', t: 'Уютное гнёздышко', d: 'Обставить дом 10 предметами' }, { id: 'housechair', e: '🏘️', t: 'Старший по дому', d: 'Возглавить собрание жильцов' },
  { id: 'dna', e: '🧪', t: 'Знаю свои гены', d: 'Сделать ДНК-тест' }, { id: 'transplant', e: '🫀', t: 'Второй шанс', d: 'Пережить пересадку органа' },
  { id: 'cyborg', e: '🤖', t: 'Киборг', d: 'Установить 3 импланта' }, { id: 'rejuv', e: '⏳', t: 'Вечная молодость', d: 'Пройти терапию омоложения' },
  { id: 'cryo', e: '🧊', t: 'До встречи в будущем', d: 'Заморозить себя после смерти' }, { id: 'digital', e: '💾', t: 'Цифровое бессмертие', d: 'Скопировать сознание' },
  { id: 'goldmedal', e: '🥇', t: 'Золотая медаль', d: 'Окончить школу на отлично' }, { id: 'olymp', e: '🏆', t: 'Олимпиадник', d: 'Победить на олимпиаде уровня страны' },
  { id: 'classpres', e: '🗳️', t: 'Президент школы', d: 'Выиграть школьные выборы' }, { id: 'promking', e: '👑', t: 'Король бала', d: 'Стать королём или королевой выпускного' },
  { id: 'shelter', e: '🏠', t: 'Друг из приюта', d: 'Взять питомца из приюта' }, { id: 'exotic', e: '🦎', t: 'Экзотика', d: 'Завести экзотического питомца' },
  { id: 'trainer', e: '🎓', t: 'Дрессировщик', d: 'Научить питомца 5 трюкам' }, { id: 'petchamp', e: '🏆', t: 'Чемпион породы', d: '3 победы на выставках' }, { id: 'zoo', e: '🦁', t: 'Домашний зоопарк', d: '6 питомцев одновременно' },
  { id: 'natsurvivor', e: '🌪️', t: 'Пережил стихию', d: 'Пережить 3 стихийных бедствия' }, { id: 'rescuer', e: '🦺', t: 'Спасатель', d: 'Помогать спасателям во время бедствия' },
  { id: 'will', e: '📜', t: 'Последняя воля', d: 'Заверить завещание' }
);
