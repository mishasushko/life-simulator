'use strict';
/* ===================== Своё дело, слава, политика, армия и разведка ===================== */

/* ====================== СВОЁ ДЕЛО ====================== */
const BIZ_TYPES = [
  { id: 'shop', e: '🏪', n: 'Лавка у дома', cost: 600000, m: 0.10, r: 0.15 },
  { id: 'bakery', e: '🥐', n: 'Пекарня', cost: 1200000, m: 0.12, r: 0.18 },
  { id: 'tailor', e: '🧵', n: 'Ателье', cost: 900000, m: 0.12, r: 0.2, to: 1990 },
  { id: 'tavern', e: '🍺', n: 'Трактир', cost: 1500000, m: 0.14, r: 0.22, to: 1950 },
  { id: 'cafe', e: '☕', n: 'Кофейня', cost: 1500000, m: 0.14, r: 0.25, yr: 1950 },
  { id: 'resto', e: '🍕', n: 'Ресторан', cost: 8000000, m: 0.15, r: 0.28 },
  { id: 'garage', e: '🔧', n: 'Автомастерская', cost: 3000000, m: 0.15, r: 0.18, yr: 1910 },
  { id: 'beauty', e: '💇', n: 'Салон красоты', cost: 2500000, m: 0.16, r: 0.22 },
  { id: 'gym', e: '🏋️', n: 'Фитнес-клуб', cost: 15000000, m: 0.15, r: 0.25, yr: 1970 },
  { id: 'agency', e: '📣', n: 'Рекламное агентство', cost: 4000000, m: 0.2, r: 0.3, yr: 1950 },
  { id: 'eshop', e: '🛍️', n: 'Интернет-магазин', cost: 800000, m: 0.16, r: 0.32, yr: 1996 },
  { id: 'it', e: '💻', n: 'IT-стартап', cost: 5000000, m: 0.22, r: 0.5, yr: 1985 },
  { id: 'hotel', e: '🏨', n: 'Отель', cost: 60000000, m: 0.13, r: 0.18 },
  { id: 'factory', e: '🏭', n: 'Завод', cost: 120000000, m: 0.12, r: 0.2 },
  { id: 'ai', e: '🤖', n: 'ИИ-стартап', cost: 20000000, m: 0.3, r: 0.7, yr: 2020 },
  { id: 'space', e: '🚀', n: 'Космическая компания', cost: 500000000, m: 0.2, r: 0.6, yr: 2005 }
];
const bizDef = (b) => BIZ_TYPES.find((x) => x.id === b.type) || BIZ_TYPES.find((x) => x.n === b.name) || { m: 0.13, r: 0.3, e: b.e || '🏭', n: b.name };
function bizNorm(b) {
  b.staff = b.staff ?? 2; b.quality = b.quality ?? 50; b.branches = b.branches ?? 1; b.rep = b.rep ?? 50;
  b.own = b.own ?? 100; b.strategy = b.strategy || 'normal'; b.hist = b.hist || []; b.years = b.years || 0; b.start = b.start || b.value;
  return b;
}
yearBiz = function () {
  const b = bizNorm(S.biz); const d = bizDef(b);
  const econ = typeof economy === 'function' ? economy() : 'normal';
  const strat = { cheap: [1.15, 0.7, -1], normal: [1, 1, 0], premium: [0.8, 1.45, 1] }[b.strategy];
  const staffFit = Math.min(1.2, b.staff / (2 + b.branches * 2));
  let r = rf(-d.r, d.r) + (b.quality - 50) / 250 + (b.rep - 50) / 300 + (S.stats.smarts - 50) / 500 + (b.boost || 0) + (econ === 'crisis' ? -0.1 : econ === 'boom' ? 0.06 : 0) + (staffFit - 0.8) * 0.2;
  b.boost = 0;
  const revenue = Math.round(b.value * d.m * 3 * strat[0] * (0.6 + staffFit * 0.5));
  const costs = Math.round(b.staff * wageOf(300000) * 0.8 + b.value * 0.02);
  let profit = Math.round((revenue * strat[1] * (1 + r) - costs) * b.own / 100);
  b.value = Math.max(0, Math.round(b.value * (1 + r * 0.6)));
  b.rep = clamp(b.rep + strat[2] * 2 + rnd(-3, 3) + (b.quality > 70 ? 2 : b.quality < 30 ? -3 : 0));
  b.quality = clamp(b.quality - rnd(0, 3));
  b.years++;
  S.money += profit;
  b.hist.push(profit); if (b.hist.length > 30) b.hist.shift();
  log(`${b.e} «${b.name}»: ${profit >= 0 ? 'прибыль' : 'убыток'} ${fmt(profit)} · оценка ${fmt(b.value)}.`, profit >= 0 ? 'good' : 'bad');
  if (chance(0.22)) bizEvent(b);
  if (b.value < b.start * 0.1 || (S.money < -price(5000000) && profit < 0 && chance(0.5))) { log(`💥 Бизнес «${b.name}» обанкротился.`, 'bad'); eff({ happy: -20 }); S.biz = null; return; }
  if (b.value >= price(1e9)) unlock('tycoon');
};
function bizEvent(b) {
  const x = rnd(1, 7);
  if (x === 1) ev('🏬', 'Конкурент', `Напротив «${b.name}» открылся конкурент с ценами ниже ваших.`, [
    { t: 'Снизить цены', f: () => { b.strategy = 'cheap'; b.boost = -0.05; return 'Вы ввязались в ценовую войну.'; } },
    { t: 'Сделать лучше качество', f: () => { S.money -= price(200000); b.quality = clamp(b.quality + 12); return 'Клиенты оценили качество.'; } },
    { t: 'Ничего не делать', f: () => { b.boost = -0.15; return 'Часть клиентов ушла.'; } }]);
  else if (x === 2) ev('🧾', 'Проверка', 'К вам пришла налоговая проверка.', [
    { t: 'Показать честные книги', f: () => chance(0.8) ? (eff({ karma: 2 }), 'Нарушений не нашли.') : (S.money -= price(300000), `Нашли ошибку бухгалтера. Штраф ${fmt(price(300000))}.`) },
    { t: 'Дать взятку', f: () => { eff({ karma: -8 }); S.money -= price(100000); return chance(0.75) ? 'Проверяющий ушёл довольным.' : (crimeCaught('Дача взятки', 2), 'Это была подстава.'); } }]);
  else if (x === 3) { b.rep = clamp(b.rep + 15); b.boost = 0.15; log(`🌟 Блогер-миллионник похвалил «${b.name}». Очереди с утра!`, 'good'); }
  else if (x === 4) ev('🚪', 'Ключевой сотрудник', 'Ваш лучший сотрудник получил предложение от конкурента.', [
    { t: `Повысить зарплату (${fmt(price(150000))})`, f: () => { S.money -= price(150000); b.quality = clamp(b.quality + 3); return 'Сотрудник остался и благодарен вам.'; } },
    { t: 'Отпустить', f: () => { b.quality = clamp(b.quality - 10); b.staff = Math.max(1, b.staff - 1); return 'Он ушёл и увёл пару клиентов.'; } }]);
  else if (x === 5) { const c = Math.round(b.value * rf(0.1, 0.3)); S.money += c; log(`🤝 «${b.name}» заключил крупный контракт: +${fmt(c)}.`, 'good'); }
  else if (x === 6) ev('💼', 'Инвестор', `Инвестор хочет купить 25% «${b.name}» за ${fmt(Math.round(b.value * 0.3))}.`, [
    { t: 'Продать долю', f: () => { if (b.own <= 25) return 'У вас слишком маленькая доля.'; S.money += Math.round(b.value * 0.3); b.own -= 25; b.value = Math.round(b.value * 1.1); return 'Сделка закрыта. Деньги на счету.'; } },
    { t: 'Отказать', f: () => 'Вы сохранили контроль над компанией.' }]);
  else { b.rep = clamp(b.rep - 12); log(`😡 Скандальный отзыв про «${b.name}» разлетелся по городу.`, 'bad'); }
}
EXTRA_TITLES.biz = '🏭 Своё дело';
EXTRA_PANELS.biz = function () {
  if (S.age < 18) { $('#sheetBody').appendChild(el('<div class="empty">Открыть бизнес можно с 18 лет</div>')); return; }
  if (!S.biz) {
    card('<div class="muted">🚀 Начать своё дело</div><div class="big">Выберите нишу</div><div class="muted">Чем выше риск, тем сильнее колебания прибыли. Можно взять кредит в разделе «Кредиты».</div>');
    const l = section('Ниши');
    for (const t of BIZ_TYPES.filter((x) => (!x.yr || S.year >= x.yr) && (!x.to || S.year <= x.to))) {
      const c = price(t.cost);
      item(l, { e: t.e, t: t.n, d: `Вложения: ${fmt(c)} · маржа ${Math.round(t.m * 100)}% · риск ${t.r >= 0.5 ? 'высокий' : t.r >= 0.25 ? 'средний' : 'низкий'}`, disabled: S.money < c, onClick: () => nameBiz(t, c) });
    }
    return;
  }
  const b = bizNorm(S.biz); const d = bizDef(b);
  const last = b.hist.length ? b.hist[b.hist.length - 1] : 0;
  card(`<div class="muted">${b.e} ${esc(d.n || '')} · ${yrs(b.years)} · ваша доля ${b.own}%</div><div class="big">${esc(b.name)}</div><div class="muted">Оценка: ${fmt(b.value)} · прибыль за год: ${fmt(last)}</div><div class="muted">Филиалы: ${b.branches} · сотрудники: ${b.staff} · стратегия: ${{ cheap: 'дёшево', normal: 'обычно', premium: 'премиум' }[b.strategy]}${b.ipo ? ' · на бирже 📈' : ''}</div><div class="muted" style="margin-top:6px">Качество ${b.quality}%</div><div class="bar-mini"><em style="width:${b.quality}%"></em></div><div class="muted">Репутация ${b.rep}%</div><div class="bar-mini"><em style="width:${b.rep}%"></em></div>${b.hist.length > 1 ? sparkSVG(b.hist) : ''}`);
  const A = (l, e, t, d2, key, fn, dis) => item(l, { e, t, d: key && S.used[key] ? 'Уже в этом году' : d2, disabled: (key && S.used[key]) || dis, onClick: act(() => { if (key) S.used[key] = 1; return fn(); }) });
  const l = section('Управление');
  const hireC = wageOf(300000);
  A(l, '🧑‍💼', 'Нанять сотрудника', `Зарплата ~${fmt(hireC)} в год`, null, () => { b.staff++; return `Команда «${b.name}»: ${b.staff} чел.`; });
  if (b.staff > 1) A(l, '👋', 'Сократить сотрудника', 'Экономия, но качество страдает', null, () => { b.staff--; b.quality = clamp(b.quality - 4); eff({ karma: -1 }); return `Команда: ${b.staff} чел.`; });
  const qc = Math.round(b.value * 0.05 + price(50000));
  A(l, '✨', `Улучшить качество (${fmt(qc)})`, '+качество', 'bq', () => { S.money -= qc; b.quality = clamp(b.quality + rnd(8, 15)); return 'Новое оборудование и обучение персонала.'; }, S.money < qc);
  const mc = Math.round(b.value * 0.08 + price(30000));
  A(l, '📣', `Рекламная кампания (${fmt(mc)})`, '+рост в этом году', 'bm', () => { S.money -= mc; b.boost = rf(0.08, 0.25); b.rep = clamp(b.rep + 5); return 'Реклама запущена.'; }, S.money < mc);
  const bc = Math.round(price(bizDef(b).cost || 2000000) * 0.8 * b.branches);
  A(l, '🏬', `Открыть филиал (${fmt(bc)})`, `Сейчас филиалов: ${b.branches}`, 'bb', () => { S.money -= bc; b.branches++; b.value += Math.round(bc * 0.9); b.staff += 2; if (b.branches >= 10) unlock('chain'); return `Открыт филиал №${b.branches}! 🎉`; }, S.money < bc);
  A(l, '🏷️', 'Сменить стратегию цен', 'Дёшево · обычно · премиум', null, () => { Q.push({ e: '🏷️', title: 'Стратегия', text: 'Дёшево — больше клиентов, меньше маржа. Премиум — наоборот, но нужно качество.', choices: [{ t: '💸 Дёшево', f: () => { b.strategy = 'cheap'; return 'Цены снижены.'; } }, { t: '⚖️ Обычно', f: () => { b.strategy = 'normal'; return 'Цены рыночные.'; } }, { t: '💎 Премиум', f: () => { b.strategy = 'premium'; return 'Только премиум.'; } }] }); pump(); return null; });
  const l2 = section('Сделки');
  if (!b.ipo && b.value >= price(300000000) && S.year >= 1920) A(l2, '🔔', 'Выйти на биржу (IPO)', 'Продать 30% акций публике', null, () => { const g = Math.round(b.value * 0.3 * b.own / 100 * 1.2); S.money += g; b.own = Math.round(b.own * 0.7); b.ipo = true; b.value = Math.round(b.value * 1.3); unlock('ipo'); eff({ happy: 15 }); S.followers += 50000; return `IPO прошло успешно! Вы получили ${fmt(g)}.`; });
  const sale = Math.round(b.value * b.own / 100);
  A(l2, '💸', `Продать бизнес (${fmt(sale)})`, '', null, () => { S.money += sale; const n = b.name; S.biz = null; eff({ happy: 8 }); closeSheet(); return `Вы продали «${n}» за ${fmt(sale)}.`; });
  A(l2, '🚪', 'Закрыть бизнес', 'Распродать остатки', null, () => { const g = Math.round(b.value * 0.3 * b.own / 100); S.money += g; S.biz = null; eff({ happy: -6 }); closeSheet(); return `Бизнес закрыт. Остатки проданы за ${fmt(g)}.`; });
};
function nameBiz(t, c) {
  const pre = { shop: ['У дома', 'Продукты', 'Минутка'], bakery: ['Хлебный дом', 'Тёплая булка', 'Колосок'], cafe: ['Зерно', 'Чашка', 'Утро'], resto: ['Баклажан', 'Вкусно', 'Огонь'], it: ['Нейрон', 'Кодекс', 'Облако'], ai: ['Синапс', 'Мысль', 'Альфа'], factory: ['Прогресс', 'Металл', 'Восток'], eshop: ['Корзина', 'Клик', 'Посылка'] }[t.id] || ['Успех', 'Вершина', 'Вектор', 'Импульс'];
  Q.push({ e: t.e, title: t.n, text: `Вложения: ${fmt(c)}. Как назовёте?`, choices: pre.map((n) => ({ t: `«${n}»`, f: () => { S.money -= c; S.biz = bizNorm({ type: t.id, e: t.e, name: n, value: c, start: c, years: 0 }); S.biz.staff = 2; unlock('business'); eff({ happy: 8 }); return `Вы открыли бизнес «${n}»! 🚀`; } })).concat([{ t: `«${S.surname} и партнёры»`, f: () => { S.money -= c; S.biz = bizNorm({ type: t.id, e: t.e, name: `${S.surname} и партнёры`, value: c, start: c, years: 0 }); unlock('business'); eff({ happy: 8 }); return `Вы открыли «${S.surname} и партнёры»! 🚀`; } }, { t: 'Передумать', f: () => null }]) });
  pump();
}
function sparkSVG(arr, h = 40) {
  const w = 280; const mn = Math.min(0, ...arr), mx = Math.max(1, ...arr);
  const pts = arr.map((v, i) => `${(i / Math.max(1, arr.length - 1)) * w},${h - ((v - mn) / (mx - mn)) * h}`).join(' ');
  const zero = h - ((0 - mn) / (mx - mn)) * h;
  return `<svg class="spark" viewBox="0 -2 ${w} ${h + 4}" preserveAspectRatio="none"><line x1="0" x2="${w}" y1="${zero}" y2="${zero}" class="zero"/><polyline points="${pts}"/></svg>`;
}
CAREER_HOOKS.push((l) => item(l, { e: S.biz ? S.biz.e : '🏭', t: 'Своё дело', d: S.biz ? `«${S.biz.name}» · ${fmt(S.biz.value)}` : 'Открыть бизнес: 16 ниш', disabled: S.age < 18, onClick: () => openPanel('biz') }));

/* ====================== СЛАВА ====================== */
const FAME_T = [[0, 'Никто вас не знает'], [10, 'Местная знаменитость'], [30, 'Известная личность'], [55, 'Звезда'], [80, 'Мегазвезда'], [95, 'Легенда']];
const fameTitle = () => [...FAME_T].reverse().find(([v]) => S.fame >= v)[1];
function calcFame() {
  let f = S.followers > 0 ? Math.log10(S.followers + 1) * 11 : 0;
  if (S.job) { const d = JOBS.find((j) => j.id === S.job.id); if (d && d.fame) f += S.job.lvl * 12; }
  if (S.pol) f += S.pol.lvl * 10;
  if (S.biz && S.biz.ipo) f += 15;
  f += (S.fameBonus || 0);
  return clamp(Math.round(f));
}
YEAR_HOOKS.push(() => {
  S.fameBonus = Math.round((S.fameBonus || 0) * 0.85);
  S.fame = calcFame();
  if (S.fame >= 30 && !S.prison && chance(0.25)) fameEvent();
  if (S.fame >= 80) unlock('megastar');
  if (S.pr) { S.money -= price(400000); }
});
function fameEvent() {
  const x = rnd(1, 5);
  if (x === 1) ev('📸', 'Папарацци', 'Папарацци подкараулили вас у подъезда в пижаме.', [
    { t: 'Улыбнуться и помахать', f: () => { S.fameBonus = (S.fameBonus || 0) + 3; eff({ happy: 2 }); return 'Фото стало мемом. Публика вас обожает.'; } },
    { t: 'Разбить камеру', f: () => { eff({ karma: -5 }); S.money -= price(200000); return `Скандал! Пришлось заплатить ${fmt(price(200000))} по иску.`; } }]);
  else if (x === 2) ev('💌', 'Фанатка', 'Фанат прислал вам свитер с вашим лицом и стихи на 40 страниц.', [
    { t: 'Ответить с благодарностью', f: () => { eff({ karma: 3, happy: 3 }); return 'Фанат счастлив.'; } },
    { t: 'Нанять охрану', f: () => { S.money -= price(150000); return 'Теперь за вами ходят двое в чёрном.'; } }]);
  else if (x === 3 && !S.pr) ev('🗞️', 'Скандал', `Жёлтая пресса пишет, что вы ${pick(['тайно женаты на инопланетянине', 'не платите налоги', 'сделали пять пластических операций', 'поссорились со всеми коллегами'])}.`, [
    { t: 'Опровергнуть', f: () => chance(0.6) ? 'Опровержение сработало.' : (S.fameBonus = (S.fameBonus || 0) - 5, 'Чем больше вы оправдывались, тем больше верили слухам.') },
    { t: 'Подыграть ради хайпа', f: () => { S.fameBonus = (S.fameBonus || 0) + 6; eff({ karma: -3 }); return 'Хайп! Вас обсуждает вся страна.'; } }]);
  else if (x === 4) { const g = price(rnd(5, 30) * 100000) * Math.ceil(S.fame / 30); S.money += g; log(`📺 Вас позвали в рекламу ${pick(['газировки', 'шампуня', 'банка', 'кроссовок', 'майонеза'])}: +${fmt(g)}.`, 'good'); }
  else ev('🎤', 'Ток-шоу', 'Вас зовут на самое популярное ток-шоу страны.', [
    { t: 'Пойти и шутить', f: () => chance(0.5 + S.stats.smarts / 300) ? (S.fameBonus = (S.fameBonus || 0) + 5, 'Вы были неотразимы!') : (S.fameBonus = (S.fameBonus || 0) - 2, 'Шутки не зашли. Неловко.') },
    { t: 'Отказаться', f: () => 'Вы бережёте личное пространство.' }]);
}
EXTRA_TITLES.fame = '⭐ Слава';
EXTRA_PANELS.fame = function () {
  S.fame = calcFame();
  card(`<div class="muted">⭐ Известность</div><div class="big">${fameTitle()}</div><div class="muted">Слава: ${S.fame}/100 · подписчики: ${S.followers.toLocaleString('ru-RU')}${S.pr ? ' · есть пиар-агент' : ''}</div><div class="bar-mini"><em style="width:${S.fame}%"></em></div>`);
  const A = (l, e, t, d, key, fn, dis) => item(l, { e, t, d: key && S.used[key] ? 'Уже в этом году' : d, disabled: (key && S.used[key]) || dis, onClick: act(() => { if (key) S.used[key] = 1; return fn(); }) });
  const l = section('Путь к славе');
  A(l, '🎬', 'Пройти кастинг', 'Шанс попасть в кино или на ТВ', 'cast', () => { if (chance(0.15 + S.stats.looks / 250)) { S.fameBonus = (S.fameBonus || 0) + 10; S.followers += rnd(1000, 20000); S.money += price(200000); return 'Вас взяли на роль в сериале! 🎬'; } return 'Режиссёр сказал: «Мы вам перезвоним».'; });
  A(l, '🎙️', 'Выступить на открытом микрофоне', 'Стендап или песни', 'mic', () => { const ok = chance(0.3 + S.stats.smarts / 300); S.fameBonus = (S.fameBonus || 0) + (ok ? 4 : 0); return ok ? 'Зал аплодировал стоя!' : 'В зале было трое, и один спал.'; });
  if (S.year >= 1950) A(l, '📺', 'Участвовать в реалити-шоу', 'Быстрая слава, но риск для репутации', 'reality', () => { S.fameBonus = (S.fameBonus || 0) + rnd(5, 15); eff({ karma: -rnd(0, 6), happy: rnd(-5, 10) }); return chance(0.2) ? (S.money += price(1000000), 'Вы выиграли реалити-шоу! 🏆') : 'Вас выгнали в середине сезона, но все вас запомнили.'; });
  if (S.fame >= 10) {
    const l2 = section('Для знаменитостей');
    A(l2, '🎤', 'Дать интервью', '+слава', 'interview', () => { S.fameBonus = (S.fameBonus || 0) + 3; return chance(0.15) && !S.pr ? (S.fameBonus -= 6, 'Вы сказали лишнее. Цитату разобрали на мемы.') : 'Интервью разошлось на цитаты.'; });
    A(l2, '🛍️', 'Выпустить мерч', 'Деньги от фанатов', 'merch', () => { const g = price(S.fame * 30000); S.money += g; return `Футболки с вашим лицом принесли ${fmt(g)}.`; });
    A(l2, '🎗️', 'Благотворительный концерт', '+карма, +слава', 'charity2', () => { eff({ karma: 10, happy: 6 }); S.fameBonus = (S.fameBonus || 0) + 2; return 'Вы собрали деньги для детской больницы.'; });
    A(l2, '🌟', 'Красная дорожка', 'Нужна внешность', 'carpet', () => { const ok = S.stats.looks > 60; S.fameBonus = (S.fameBonus || 0) + (ok ? 5 : -2); return ok ? 'Ваш образ — главный в светской хронике.' : 'Модные критики назвали ваш наряд «смелым».'; });
    if (!S.memoir && S.age >= 30) A(l2, '📕', 'Написать автобиографию', 'Один раз в жизни', null, () => { S.memoir = 1; const g = price(S.fame * 80000); S.money += g; unlock('author'); return `Ваша книга стала бестселлером: ${fmt(g)}.`; });
    A(l2, '🧑‍💼', S.pr ? 'Уволить пиар-агента' : `Нанять пиар-агента (${fmt(price(400000))}/год)`, 'Защищает от скандалов', null, () => { S.pr = !S.pr; return S.pr ? 'Пиар-агент взял ваши соцсети под контроль.' : 'Вы снова сами отвечаете за свои слова.'; });
  }
};
CAREER_HOOKS.push((l) => item(l, { e: '⭐', t: 'Слава', d: `${fameTitle()} · ${S.fame || 0}/100`, onClick: () => openPanel('fame') }));

/* ====================== ПОЛИТИКА ====================== */
const PM_C = ['gb', 'ca', 'au', 'nz', 'jp', 'it', 'es', 'nl', 'be', 'se', 'no', 'dk', 'in', 'il', 'hu', 'sk', 'si', 'hr', 'lu', 'mt', 'gr', 'ie', 'th', 'my', 'jm', 'fj', 'pk', 'bd', 'np', 'lk', 'cz', 'pl', 'ee', 'lv', 'lt', 'al', 'mk', 'me', 'ba', 'md', 'am', 'ge'];
const NO_ELECT = ['sa', 'ae', 'qa', 'kw', 'om', 'kp', 'cn', 'cu', 'vn', 'la', 'tm', 'sy', 'mm'];
function polMode() {
  if (['ru', 'ua', 'by'].includes(S.country) && S.year < 1917) return 'empire';
  if (USSR.includes(S.country) && S.year >= 1922 && S.year < 1991) return 'party';
  if (NO_ELECT.includes(S.country) || (S.year < 1945 && ['de', 'it', 'es', 'pt', 'jp'].includes(S.country) && S.year >= ({ de: 1933, it: 1922, es: 1939, pt: 1932, jp: 1940 })[S.country])) return 'party';
  return 'elect';
}
function polTitles() {
  const m = polMode();
  if (m === 'empire') return ['Коллежский регистратор', 'Титулярный советник', 'Коллежский советник', 'Статский советник', 'Тайный советник', 'Канцлер'];
  if (m === 'party') return USSR.includes(S.country) ? ['Комсорг', 'Секретарь парткома', 'Первый секретарь райкома', 'Первый секретарь обкома', 'Член Политбюро', 'Генеральный секретарь'] : ['Член партии', 'Партийный функционер', 'Секретарь горкома', 'Член политбюро', 'Министр', 'Лидер страны'];
  const top = ['de', 'at'].includes(S.country) ? 'Федеральный канцлер' : PM_C.includes(S.country) ? 'Премьер-министр' : 'Президент';
  return ['Муниципальный депутат', 'Мэр', 'Губернатор', 'Депутат парламента', 'Министр', top];
}
const POL_AGE = [21, 25, 30, 30, 32, 35];
const POL_TERM = [4, 5, 5, 5, 4, 6];
const polSalary = (lvl) => wageOf([500000, 1200000, 2000000, 2200000, 3000000, 4500000][lvl]);
YEAR_HOOKS.push(() => {
  const P = S.pol; if (!P || P.lvl < 0 || S.prison) return;
  S.money += Math.round(polSalary(P.lvl) * (1 - taxRate()));
  P.years++;
  P.appr = clamp(P.appr + rnd(-8, 6) + (typeof economy === 'function' ? (economy() === 'crisis' ? -6 : economy() === 'boom' ? 3 : 0) : 0));
  if (polMode() === 'elect') {
    if (P.appr < 12 && chance(0.5)) { log(`🏛️ Импичмент! Вы лишились поста «${P.title}».`, 'bad'); eff({ happy: -20 }); S.pol = null; return; }
    if (P.years >= POL_TERM[P.lvl]) ev('🗳️', 'Выборы', `Ваш срок «${P.title}» истёк. Рейтинг: ${P.appr}%.`, [
      { t: 'Переизбираться', f: () => { if (chance(0.15 + P.appr / 110)) { P.years = 0; P.terms = (P.terms || 1) + 1; return `Вы переизбраны! Срок №${P.terms}.`; } S.pol = null; eff({ happy: -12 }); return 'Вы проиграли выборы.'; } },
      { t: 'Уйти красиво', f: () => { S.pol = null; eff({ happy: 4 }); return 'Вы ушли из политики с высоко поднятой головой.'; } }]);
  } else if (P.appr < 15 && chance(0.4)) { log('🏛️ Вас сняли с поста и отправили «на пенсию».', 'bad'); S.pol = null; return; }
  if (chance(0.15)) polEvent(P);
});
function polEvent(P) {
  const x = rnd(1, 3);
  if (x === 1) ev('💼', 'Конверт', 'Застройщик оставил на столе конверт: просит разрешить стройку в парке.', [
    { t: 'Взять', f: () => { const g = price(rnd(2, 20) * 1000000) * (P.lvl + 1); S.money += g; eff({ karma: -15 }); if (chance(0.25)) { S.pol = null; crimeCaught('Получение взятки', 6); return 'Это была операция антикоррупционной службы!'; } return `Конверт оказался толстым: ${fmt(g)}. Парк вырубят.`; } },
    { t: 'Выгнать', f: () => { eff({ karma: 8 }); P.appr = clamp(P.appr + 5); return 'Вы публично отказались. Рейтинг вырос.'; } }]);
  else if (x === 2) ev('🌊', 'Чрезвычайная ситуация', 'Наводнение затопило районы. Люди ждут ваших действий.', [
    { t: 'Лично руководить спасением', f: () => { P.appr = clamp(P.appr + 12); eff({ health: -3, karma: 5 }); return 'Фото в резиновых сапогах облетели страну.'; } },
    { t: 'Записать видеообращение', f: () => { P.appr = clamp(P.appr - 8); return 'Люди возмущены: «Где вы были?»'; } }]);
  else ev('📰', 'Журналисты', 'Журналисты раскопали историю из вашей юности.', [
    { t: 'Признать и извиниться', f: () => { P.appr = clamp(P.appr - 2); eff({ karma: 3 }); return 'Честность оценили.'; } },
    { t: 'Всё отрицать', f: () => chance(0.5) ? 'История забылась.' : (P.appr = clamp(P.appr - 12), 'Нашлись свидетели. Рейтинг рухнул.') }]);
}
EXTRA_TITLES.politics = '🏛️ Политика';
EXTRA_PANELS.politics = function () {
  const T = polTitles(); const m = polMode(); const P = S.pol;
  const A = (l, e, t, d, key, fn, dis) => item(l, { e, t, d: key && S.used[key] ? 'Уже в этом году' : d, disabled: (key && S.used[key]) || dis, onClick: act(() => { if (key) S.used[key] = 1; return fn(); }) });
  if (P) {
    P.title = T[P.lvl];
    card(`<div class="muted">🏛️ ${m === 'elect' ? `Срок: ${P.years}/${POL_TERM[P.lvl]} лет` : 'Номенклатура'}</div><div class="big">${esc(P.title)}</div><div class="muted">Зарплата: ${fmt(polSalary(P.lvl))} в год · рейтинг ${P.appr}%</div><div class="bar-mini"><em style="width:${P.appr}%"></em></div>`);
    const l = section('Работа');
    A(l, '📜', 'Провести реформу', 'Рискованно, но может поднять рейтинг', 'reform', () => { const ok = chance(0.35 + S.stats.smarts / 250); P.appr = clamp(P.appr + (ok ? rnd(6, 14) : -rnd(5, 12))); return ok ? `Реформа ${pick(['образования', 'здравоохранения', 'транспорта', 'ЖКХ'])} удалась!` : 'Реформа провалилась, люди недовольны.'; });
    A(l, '🎤', 'Выступить перед народом', '+рейтинг', 'speech', () => { const ok = chance(0.4 + S.stats.looks / 300 + S.stats.smarts / 300); P.appr = clamp(P.appr + (ok ? rnd(3, 8) : -3)); return ok ? 'Речь цитируют все газеты.' : 'Вы оговорились, и это стало мемом.'; });
    A(l, '🧹', 'Бороться с коррупцией', '+рейтинг, +карма', 'anti', () => { P.appr = clamp(P.appr + rnd(2, 7)); eff({ karma: 4 }); return 'Несколько чиновников отправились под суд.'; });
    A(l, '💰', 'Брать откаты', '+деньги, риск тюрьмы', 'bribe', () => { const g = price(rnd(5, 40) * 100000) * (P.lvl + 1); S.money += g; eff({ karma: -10 }); if (chance(0.18)) { S.pol = null; crimeCaught('Коррупция', 7); return 'Вас арестовали прямо в кабинете.'; } return `Вы «заработали» ${fmt(g)}.`; });
    if (P.lvl < T.length - 1) A(l, '⬆️', m === 'elect' ? `Баллотироваться: ${T[P.lvl + 1]}` : `Добиваться поста: ${T[P.lvl + 1]}`, `Возраст: ${POL_AGE[P.lvl + 1]}+`, 'run', () => runFor(P.lvl + 1), S.age < POL_AGE[P.lvl + 1]);
    A(l, '🚪', 'Уйти в отставку', '', null, () => { S.pol = null; return 'Вы ушли в отставку.'; });
    return;
  }
  card(`<div class="muted">🏛️ ${m === 'elect' ? 'Демократия: выборы' : m === 'empire' ? 'Империя: государственная служба' : 'Однопартийная система'}</div><div class="big">Вне политики</div><div class="muted">${m === 'elect' ? 'Победа зависит от ума, внешности, кармы, славы и денег на кампанию.' : 'Карьера зависит от лояльности, ума и связей.'}</div>`);
  const l = section('Начать');
  A(l, '🗳️', m === 'elect' ? `Баллотироваться: ${T[0]}` : `Поступить: ${T[0]}`, `Возраст: ${POL_AGE[0]}+${EDU_RANK[S.edu.level] < 1 ? ' · нужен аттестат' : ''}`, 'run', () => runFor(0), S.age < POL_AGE[0] || EDU_RANK[S.edu.level] < 1);
};
function runFor(lvl) {
  const T = polTitles(); const m = polMode();
  if (m !== 'elect') {
    const p = 0.25 + (S.stats.smarts - 50) / 200 + (S.karma - 50) / 300 + (S.pol ? S.pol.appr / 300 : 0) - lvl * 0.04;
    if (chance(clamp(p, 0.05, 0.85))) { S.pol = { lvl, appr: 55, years: 0, title: T[lvl] }; S.job = null; if (lvl === T.length - 1) unlock('president'); eff({ happy: 12 }); return `Вас назначили: ${T[lvl]}.`; }
    return 'Наверху решили, что вы ещё не готовы.';
  }
  const cost = price([200000, 2000000, 10000000, 15000000, 0, 80000000][lvl]);
  Q.push({ e: '🗳️', title: `Выборы: ${T[lvl]}`, text: lvl === 4 ? 'Министра назначают. Нужен высокий рейтинг и связи.' : `Кампания стоит ${fmt(cost)}. Как будете бороться?`, choices: [
    { t: '🤝 Честная кампания', disabled: S.money < cost, f: () => elect(lvl, cost, 0, 2) },
    { t: '📢 Популизм и обещания', disabled: S.money < cost, f: () => elect(lvl, cost, 0.08, -3) },
    { t: '🕵️ Грязные технологии', disabled: S.money < cost, f: () => elect(lvl, cost, 0.14, -12) },
    { t: '🎙️ Победить в дебатах', disabled: S.money < cost, f: () => elect(lvl, cost, (S.stats.smarts - 60) / 150, 0) },
    { t: 'Передумать', f: () => { delete S.used.run; return null; } }] });
  pump(); return null;
}
function elect(lvl, cost, bonus, karma) {
  S.money -= cost; eff({ karma });
  const T = polTitles();
  const p = 0.22 + (S.stats.smarts - 50) / 250 + (S.stats.looks - 50) / 350 + (S.karma - 50) / 300 + (S.fame || 0) / 250 + bonus + (S.pol ? (S.pol.appr - 50) / 200 : 0) - lvl * 0.03;
  if (chance(clamp(p, 0.04, 0.9))) {
    S.pol = { lvl, appr: rnd(45, 65), years: 0, title: T[lvl], terms: 1 }; S.job = null;
    if (lvl === T.length - 1) unlock('president');
    eff({ happy: 18 }); S.followers += 2000 * (lvl + 1) ** 2;
    return `🎉 Победа! Вы избраны: ${T[lvl]}.`;
  }
  eff({ happy: -10 }); return `Вы проиграли выборы (${T[lvl]}). Соперник набрал больше голосов.`;
}
CAREER_HOOKS.push((l) => item(l, { e: '🏛️', t: 'Политика', d: S.pol ? `${S.pol.title} · рейтинг ${S.pol.appr}%` : polMode() === 'elect' ? 'Выборы от депутата до главы государства' : 'Партийная и государственная карьера', onClick: () => openPanel('politics') }));

/* ====================== АРМИЯ И РАЗВЕДКА ====================== */
YEAR_HOOKS.push(() => {
  if (!S.alive || S.prison) return;
  // срочная служба
  if (S.conscript) {
    S.conscript--;
    log(pick(['🪖 Вы служите в армии. Подъём в 6:00.', '🪖 Учения на полигоне. Вы научились стрелять и мыть полы.', '🪖 Наряд по кухне: три мешка картошки.', '🪖 Вы получили письмо из дома и перечитали его десять раз.']), 'info');
    eff({ health: rnd(0, 4), happy: -rnd(2, 6) });
    if (chance(0.2)) ev('🪖', 'Казарма', 'Старослужащие требуют, чтобы вы стирали их форму.', [
      { t: 'Отказаться', f: () => chance(0.5) ? (eff({ health: -6, happy: 4 }), 'Вас избили, но больше не трогали.') : (eff({ happy: 6 }), 'Вас зауважали.') },
      { t: 'Подчиниться', f: () => { eff({ happy: -6 }); return 'Вы постирали форму. Обидно.'; } },
      { t: 'Пожаловаться командиру', f: () => { eff({ karma: 2 }); return chance(0.5) ? 'Командир навёл порядок.' : 'Командир отмахнулся.'; } }]);
    if (!S.conscript) { S.served = true; unlock('served'); ev('🎖️', 'Дембель', 'Служба окончена! Что дальше?', [
      { t: 'Домой!', f: () => { eff({ happy: 12 }); return 'Вы вернулись домой. Мама плакала на вокзале.'; } },
      { t: 'Остаться по контракту', f: () => { S.job = { id: 'army', lvl: 1, perf: 60, years: 0, lvlYears: 0, bonus: 1 }; S.career.push('army'); return 'Вы подписали контракт. Теперь вы сержант.'; } }]); }
    return;
  }
  if (S.age === 18 && S.gender !== 'f' && !S.served && conscription() && !S.edu.stage) {
    ev('📨', 'Повестка', 'Вам пришла повестка из военкомата.', [
      { t: 'Пойти служить', f: () => { S.conscript = ['il', 'kr', 'kp', 'sg', 'ch'].includes(S.country) ? 2 : S.year < 1968 ? 3 : S.year < 2008 ? 2 : 1; S.job = null; return `Вы ушли в армию на ${yrs(S.conscript)}.`; } },
      { t: 'Поступить в вуз (отсрочка)', f: () => { setTimeout(() => openUniPick('uni'), 50); return null; } },
      { t: 'Уклониться', f: () => chance(0.35) ? (crimeCaught('Уклонение от службы', 2), 'Вас нашли.') : (eff({ karma: -5 }), 'Вы «потерялись» для военкомата.') }]);
  }
  // военная служба по контракту на войне
  const w = typeof warNow === 'function' ? warNow() : null;
  if (S.job && S.job.id === 'army' && w) {
    S.wars = S.wars || {}; S.wars[w.n] = 1; S.veteran = true;
    if (chance(0.5)) ev('⚔️', 'Фронт', `${w.n}. Ваше подразделение получило приказ.`, [
      { t: 'Повести бойцов в атаку', f: () => { if (chance(w.d * 0.8)) { die('Погиб в бою'); return 'Вы погибли в бою.'; } S.job.perf = clamp(S.job.perf + 15); S.medals = (S.medals || 0) + 1; return 'Задача выполнена. Вас представили к ордену. 🎖️'; } },
      { t: 'Держать оборону', f: () => { eff({ health: -rnd(0, 10) }); S.job.perf = clamp(S.job.perf + 5); return 'Вы удержали позиции.'; } },
      { t: 'Спасать раненых', f: () => { eff({ karma: 8, health: -rnd(0, 6) }); return 'Вы вынесли с поля боя троих товарищей.'; } }]);
  }
  if (S.medals >= 3) unlock('hero');
  // разведка
  const sp = S.spy;
  if (sp) {
    S.money += Math.round(wageOf([500000, 800000, 1200000, 1800000, 2600000, 4000000][sp.lvl]) * (1 - taxRate()));
    sp.years++;
    if (sp.double && chance(0.15)) { S.spy = null; crimeCaught('Государственная измена', 15); return; }
    if (sp.cover < 20 && chance(0.3)) ev('🕵️', 'Провал', 'Вашу легенду раскрыли. За вами следят.', [
      { t: 'Срочно эвакуироваться', f: () => { sp.cover = 60; sp.lvl = Math.max(0, sp.lvl - 1); return 'Вас вывезли в багажнике дипломатической машины.'; } },
      { t: 'Уйти в отставку', f: () => { S.spy = null; S.retiredSpy = true; return 'Вы вышли из игры. Теперь — только мемуары (после рассекречивания).'; } }]);
    sp.cover = clamp(sp.cover + 5);
  } else if (!S.spyAsked && S.age >= 22 && S.age <= 45 && S.stats.smarts >= 65 && EDU_RANK[S.edu.level] >= 3 && chance(0.04)) {
    S.spyAsked = 1;
    ev('🕶️', 'Человек в сером', 'После работы к вам подошёл человек в сером костюме: «Родина нуждается в людях с вашими талантами».', [
      { t: 'Согласиться', f: () => { S.spy = { lvl: 0, cover: 80, missions: 0, years: 0 }; unlock('spy'); return 'Вы прошли подготовку и стали сотрудником разведки. Никому ни слова.'; } },
      { t: 'Отказаться', f: () => 'Человек кивнул и растворился в толпе.' }]);
  }
});
const SPY_T = ['Стажёр', 'Оперативник', 'Агент', 'Резидент', 'Начальник отдела', 'Директор разведки'];
const MISSIONS = [
  { e: '🤝', t: 'Завербовать информатора', s: 'smarts', d: 0.002, c: 8, x: 'Информатор согласился работать на вас.' },
  { e: '👀', t: 'Наружное наблюдение', s: 'health', d: 0.002, c: 5, x: 'Вы выяснили, с кем встречается объект.' },
  { e: '📁', t: 'Добыть секретные документы', s: 'smarts', d: 0.01, c: 15, x: 'Документы у вас. Центр доволен.' },
  { e: '💻', t: 'Кибероперация', s: 'smarts', d: 0.001, c: 6, x: 'Вы проникли в чужую сеть и не оставили следов.', yr: 1990 },
  { e: '🎭', t: 'Внедриться под легендой', s: 'looks', d: 0.008, c: 12, x: 'Вас приняли за своего. Вы — часть их круга.' },
  { e: '🚁', t: 'Эвакуировать агента', s: 'health', d: 0.02, c: 10, x: 'Агент спасён и уже дома.' }
];
EXTRA_TITLES.army = '🎖️ Армия и разведка';
EXTRA_PANELS.army = function () {
  const A = (l, e, t, d, key, fn, dis) => item(l, { e, t, d: key && S.used[key] ? 'Уже в этом году' : d, disabled: (key && S.used[key]) || dis, onClick: act(() => { if (key) S.used[key] = 1; return fn(); }) });
  const army = S.job && S.job.id === 'army';
  const def = JOBS.find((j) => j.id === 'army');
  card(`<div class="muted">🎖️ Военная история</div><div class="big">${army ? def.titles[S.job.lvl] : S.conscript ? 'Срочная служба' : S.served ? 'Отслужил' + (S.gender === 'f' ? 'а' : '') : 'Гражданское лицо'}</div><div class="muted">${conscription() ? 'В стране действует призыв' : 'Армия контрактная'}${S.veteran ? ' · ветеран' : ''}${S.medals ? ` · наград: ${S.medals}` : ''}</div>`);
  const l = section('Армия');
  if (!army && !S.conscript) A(l, '✍️', 'Пойти служить по контракту', `Здоровье 60+ · ${fmt(wageOf(def.salary))} в год`, 'enlist', () => { if (S.age < 18 || S.stats.health < 60) return 'Медкомиссия вас не пропустила.'; S.job = { id: 'army', lvl: 0, perf: 55, years: 0, lvlYears: 0, bonus: 1 }; S.career.push('army'); return 'Вы подписали контракт. Рядовой!'; }, S.age < 18);
  if (army) {
    A(l, '🎯', 'Учения', '+эффективность, +здоровье', 'drill', () => { S.job.perf = clamp(S.job.perf + rnd(6, 12)); eff({ health: rnd(1, 4) }); return 'Отличные результаты на стрельбах.'; });
    A(l, '🏫', 'Военная академия', 'Нужен ум 55+ · повышение', 'acad', () => { if (S.stats.smarts < 55) return 'Не сдали вступительные.'; if (S.job.lvl < def.titles.length - 1) { S.job.lvl++; S.job.lvlYears = 0; return `Вы окончили академию. Новое звание: ${def.titles[S.job.lvl]}!`; } return 'Выше уже некуда.'; });
    A(l, '💪', 'Отбор в спецназ', 'Здоровье 80+', 'spec', () => { if (S.stats.health < 80 || S.special) return S.special ? 'Вы уже в спецназе.' : 'Вы не прошли марш-бросок.'; S.special = true; S.job.bonus = (S.job.bonus || 1) * 1.4; unlock('special'); return 'Вы в спецназе! Берет получен. 💪'; });
    A(l, '🌍', 'Миротворческая миссия', 'Деньги и риск', 'peace', () => { const c2 = pick(COUNTRIES); if (!S.visited.includes(c2.id)) S.visited.push(c2.id); if (chance(0.03)) { die('Погиб в миротворческой миссии'); return 'Вы погибли на миссии.'; } S.money += price(800000); eff({ karma: 5 }); return `Полгода миссии ООН: ${c2.flag} ${c2.name}. +${fmt(price(800000))}.`; });
  }
  const l2 = section('Разведка');
  const sp = S.spy;
  if (!sp) {
    if (S.retiredSpy) l2.appendChild(el('<div class="empty">Вы в отставке. О вашей службе знают только трое.</div>'));
    else A(l2, '🕶️', 'Подать заявку в разведку', 'Ум 70+, высшее образование', 'spyapp', () => { if (S.stats.smarts < 70 || EDU_RANK[S.edu.level] < 3 || S.crimes > 0) return 'Вам не перезвонили. Говорят, проверка нашла что-то в прошлом.'; if (chance(0.5)) { S.spy = { lvl: 0, cover: 80, missions: 0, years: 0 }; unlock('spy'); return 'Вас взяли. Отныне у вас две жизни.'; } return 'Отказ без объяснения причин.'; }, S.age < 21);
    return;
  }
  card(`<div class="muted">🕵️ Совершенно секретно · ${yrs(sp.years)} службы</div><div class="big">${SPY_T[sp.lvl]}</div><div class="muted">Операций: ${sp.missions}${sp.double ? ' · двойной агент 🎭' : ''}</div><div class="muted">Прикрытие ${sp.cover}%</div><div class="bar-mini"><em style="width:${sp.cover}%"></em></div>`);
  for (const m of MISSIONS.filter((x) => !x.yr || S.year >= x.yr)) A(l2, m.e, m.t, `Риск провала прикрытия ${m.c}%`, 'mis_' + m.t, () => {
    const p = 0.45 + (S.stats[m.s] - 50) / 150 + sp.lvl * 0.03;
    if (chance(m.d)) { die('Погиб при исполнении. Подробности засекречены'); return 'Операция закончилась трагически.'; }
    if (chance(clamp(p, 0.15, 0.92))) { sp.missions++; sp.cover = clamp(sp.cover - Math.round(m.c / 3)); if (sp.missions % 4 === 0 && sp.lvl < SPY_T.length - 1) { sp.lvl++; S.money += price(500000); return `${m.x} Повышение: ${SPY_T[sp.lvl]}! 🎖️`; } return m.x; }
    sp.cover = clamp(sp.cover - m.c);
    if (chance(0.15)) { S.spy = null; S.prison = { crime: 'Шпионаж (за рубежом)', years: rnd(3, 8) }; unlock('prison'); return 'Вас арестовали контрразведчики. Ждите обмена.'; }
    return 'Операция сорвалась. Прикрытие под угрозой.';
  });
  if (!sp.double) A(l2, '🎭', 'Стать двойным агентом', 'Деньги ×2, риск измены', null, () => { sp.double = true; S.money += price(3000000); eff({ karma: -15 }); return 'Вы работаете на две стороны. Будьте осторожны.'; });
  A(l2, '🚪', 'Выйти в отставку', '', null, () => { S.spy = null; S.retiredSpy = true; S.pension = Math.max(S.pension || 0, wageOf(400000)); return 'Вы сдали удостоверение. Тайны останутся с вами.'; });
};
CAREER_HOOKS.push((l) => item(l, { e: '🎖️', t: 'Армия и разведка', d: S.spy ? 'Совершенно секретно 🕵️' : S.conscript ? 'Срочная служба' : S.job && S.job.id === 'army' ? 'Военная карьера' : 'Служба, спецназ, разведка', onClick: () => openPanel('army') }));

ACHIEVEMENTS.push(
  { id: 'tycoon', e: '🏦', t: 'Магнат', d: 'Бизнес дороже 1 млрд ₽' }, { id: 'chain', e: '🏬', t: 'Сеть', d: 'Открыть 10 филиалов' },
  { id: 'ipo', e: '🔔', t: 'Звонок на бирже', d: 'Вывести компанию на IPO' }, { id: 'megastar', e: '🌟', t: 'Мегазвезда', d: 'Слава 80+' },
  { id: 'author', e: '📕', t: 'Автор бестселлера', d: 'Написать автобиографию' }, { id: 'served', e: '🪖', t: 'Отслужил', d: 'Пройти срочную службу' },
  { id: 'hero', e: '🎖️', t: 'Герой', d: 'Получить 3 боевые награды' }, { id: 'special', e: '💪', t: 'Спецназ', d: 'Пройти отбор в спецназ' },
  { id: 'spy', e: '🕵️', t: 'Агент', d: 'Поступить на службу в разведку' }
);
