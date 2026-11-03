'use strict';
/* ===================== Сюжеты, эпохи, учёба, деньги, соцсеть ===================== */

const arcs = () => (S.arcs = S.arcs || {});
const alivePeople = (roles) => S.people.filter((p) => p.alive && roles.includes(p.role));
const isUSSR = () => USSR.includes(S.country);

/* ---------- Налоги по странам ---------- */
const TAX = { ru: .13, ua: .195, by: .13, kz: .10, us: .24, gb: .25, ca: .26, au: .27, de: .35, fr: .30, es: .28, it: .32, mx: .20, ar: .25, br: .22, pt: .30, jp: .23, kr: .20, cn: .15, tr: .22, ae: 0, in: .18, ch: .22, no: .30, pl: .17, cz: .15, nl: .37, be: .40, at: .33, ie: .30, se: .32, fi: .30, dk: .38, is: .32, gr: .25, rs: .10, ge: .20, am: .20, az: .14, uz: .12, mn: .10, il: .28, sa: 0, eg: .18, ma: .25, ng: .15, ke: .25, za: .26, th: .12, vn: .15, idn: .15, ph: .20, sg: .10, nz: .25, co: .15, cl: .12, pe: .15, cu: .15 };
taxRate = () => (TAX[S.country] ?? 0.15) + (S.job && jobSalary(S.job) > wageOf(5000000) ? 0.05 : 0);

/* ---------- Кредитный рейтинг ---------- */
creditOk = () => (S.credit ?? 650) >= 580;
YEAR_HOOKS.push(() => {
  if (S.age < 18) return;
  if (S.credit == null) S.credit = 650;
  let d = 5;
  if (S.money < 0) d -= 30;
  if (S.loan) d += 8;
  if (S.cloan) d += S.cloan.missed ? -40 : 6;
  if (S.bankrupt && !S.bankruptSeen) { S.credit = 380; S.bankruptSeen = true; }
  if (S.job) d += 3;
  S.credit = Math.max(300, Math.min(850, S.credit + d));
  // потребительский кредит
  if (S.cloan) {
    S.cloan.bal = Math.round(S.cloan.bal * (1 + S.cloan.rate));
    const pay = Math.min(S.cloan.bal, Math.round(S.cloan.base / 4));
    if (S.money >= pay) { S.money -= pay; S.cloan.bal -= pay; S.cloan.missed = false; log(`💳 Платёж по кредиту: ${fmt(pay)}. Осталось ${fmt(S.cloan.bal)}.`, 'info'); }
    else { S.cloan.missed = true; log('💳 Вы пропустили платёж по кредиту. Рейтинг падает.', 'bad'); }
    if (S.cloan.bal <= 0) { S.cloan = null; log('💳 Кредит полностью погашен!', 'good'); }
  }
  // аренда
  for (const a of S.assets.filter((x) => x.rented)) {
    if (chance(0.08)) { const dmg = Math.round(a.value * 0.03); S.money -= dmg; log(`🏚️ Жильцы в «${a.name}» устроили погром. Ремонт: ${fmt(dmg)}.`, 'bad'); continue; }
    const inc = Math.round(a.value * rf(0.04, 0.06)); S.money += inc; log(`🔑 Доход от аренды «${a.name}»: ${fmt(inc)}.`, 'good');
  }
});

/* ---------- Биржа ---------- */
const COMPANIES = [
  { t: 'NTK', e: '💻', name: 'НеоТех', sec: 'tech', from: 1975, p: 50, v: .35 },
  { t: 'AIX', e: '🤖', name: 'Синапс ИИ', sec: 'ai', from: 2015, p: 5, v: .7 },
  { t: 'GMS', e: '🎮', name: 'Пиксель Геймс', sec: 'tech', from: 1980, p: 8, v: .45 },
  { t: 'SPC', e: '🚀', name: 'Звёздный Путь', sec: 'space', from: 1990, p: 10, v: .6 },
  { t: 'GLX', e: '🚗', name: 'Галактика Авто', sec: 'auto', from: 1920, p: 30, v: .2 },
  { t: 'GRN', e: '🌱', name: 'Зелёная Энергия', sec: 'green', from: 2000, p: 20, v: .4 },
  { t: 'MDG', e: '💊', name: 'МедГен', sec: 'pharma', from: 1950, p: 40, v: .25 },
  { t: 'STL', e: '🏭', name: 'Северная Сталь', sec: 'industry', from: 1920, p: 25, v: .18 },
  { t: 'OIL', e: '🛢️', name: 'Чёрное Золото', sec: 'oil', from: 1920, p: 35, v: .25, div: .04 },
  { t: 'FOD', e: '🍔', name: 'Вкусный Мир', sec: 'food', from: 1920, p: 15, v: .1, div: .03 },
  { t: 'BNK', e: '🏦', name: 'Глобал Банк', sec: 'finance', from: 1920, p: 60, v: .22, div: .035 }
];
function market() {
  S.market = S.market || {}; S.shares = S.shares || {};
  for (const c of COMPANIES) if (S.year >= c.from && S.market[c.t] == null) S.market[c.t] = { p: c.p * rf(0.8, 1.2), ch: 0 };
  return S.market;
}
function eraShock(sec) {
  const y = S.year;
  if (y === 1929 || y === 1930) return -0.45;
  if (y === 2001 && ['tech', 'ai', 'space'].includes(sec)) return -0.55;
  if (y >= 1997 && y <= 1999 && sec === 'tech') return 0.6;
  if (y === 2008) return sec === 'finance' ? -0.6 : -0.35;
  if (y === 2009) return 0.25;
  if (y === 1973 && sec === 'oil') return 0.7;
  if (y === 2020) return sec === 'tech' || sec === 'pharma' ? 0.35 : -0.15;
  if (y >= 2023 && y <= 2030 && sec === 'ai') return 0.4;
  if (y >= 2035 && sec === 'oil') return -0.08;
  if (y >= 2025 && sec === 'green') return 0.08;
  return 0;
}
YEAR_HOOKS.push(() => {
  const M = market();
  for (const c of COMPANIES) {
    const m = M[c.t]; if (!m) continue;
    const r = 0.06 + eraShock(c.sec) + (Math.random() * 2 - 1) * c.v;
    const old = m.p; m.p = Math.max(0.05, m.p * (1 + r)); m.ch = m.p / old - 1;
    const n = S.shares?.[c.t] || 0;
    if (n && c.div) { const d = Math.round(n * m.p * c.div); S.money += d; }
  }
  const held = Object.entries(S.shares || {}).filter(([, n]) => n > 0);
  if (held.length) {
    const val = held.reduce((s, [t, n]) => s + n * M[t].p, 0);
    log(`📈 Портфель акций: ${fmt(Math.round(val))}.`, 'info');
  }
});
const _netWorth = netWorth;
netWorth = function () {
  let w = _netWorth();
  if (S.market && S.shares) for (const [t, n] of Object.entries(S.shares)) if (n && S.market[t]) w += Math.round(n * S.market[t].p);
  if (S.cloan) w -= S.cloan.bal;
  return w;
};
EXTRA_TITLES.market = '📈 Биржа';
EXTRA_PANELS.market = function () {
  const M = market();
  const val = Object.entries(S.shares).reduce((s, [t, n]) => s + (M[t] ? n * M[t].p : 0), 0);
  card(`<div class="muted">Ваш портфель</div><div class="big">${fmt(Math.round(val))}</div><div class="muted">Наличные: ${fmt(S.money)}. Цены меняются раз в год. Кризисы и бумы зависят от эпохи.</div>`);
  const l = section('Компании');
  for (const c of COMPANIES) {
    const m = M[c.t];
    if (!m) { item(l, { e: '⏳', t: c.name, d: `Выйдет на биржу в ${c.from} году`, disabled: true }); continue; }
    const n = S.shares[c.t] || 0; const ch = Math.round(m.ch * 100);
    const it = item(l, { e: c.e, t: `${c.name} · ${c.t}`, d: `${fmt(m.p)} за акцию${n ? ` · у вас ${n.toLocaleString('ru-RU')} шт. (${fmt(Math.round(n * m.p))})` : ''}${c.div ? ' · дивиденды' : ''}`, r: `${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch)}%`, onClick: () => tradeModal(c) });
    it.querySelector('.r').style.color = ch >= 0 ? 'var(--good)' : 'var(--bad)';
  }
};
function tradeModal(c) {
  const m = S.market[c.t]; const n = S.shares[c.t] || 0; const ch = [];
  for (const k of [0.1, 0.25, 1]) { const qty = Math.floor(Math.max(0, S.money) * k / m.p); if (qty > 0) ch.push({ t: `Купить ${qty.toLocaleString('ru-RU')} шт. (${fmt(Math.round(qty * m.p))})`, f: () => { S.money -= Math.round(qty * m.p); S.shares[c.t] = n + qty; sfx('coin'); return `📈 Куплено ${qty} акций «${c.name}».`; } }); }
  if (n) ch.push({ t: `Продать все ${n.toLocaleString('ru-RU')} шт. (${fmt(Math.round(n * m.p))})`, cls: 'ghost', f: () => { S.money += Math.round(n * m.p); S.shares[c.t] = 0; sfx('coin'); return `📉 Проданы акции «${c.name}» на ${fmt(Math.round(n * m.p))}.`; } });
  ch.push({ t: 'Закрыть', f: () => null });
  Q.push({ e: c.e, title: c.name, text: `Цена: ${fmt(m.p)} · за год ${m.ch >= 0 ? '+' : ''}${Math.round(m.ch * 100)}%\nВолатильность: ${c.v >= .5 ? 'очень высокая' : c.v >= .3 ? 'высокая' : c.v >= .2 ? 'средняя' : 'низкая'}`, choices: ch });
  closeSheet(); pump();
}

EXTRA_TITLES.credit = '💳 Кредиты';
EXTRA_PANELS.credit = function () {
  if (S.credit == null) S.credit = 650;
  const c = S.credit; const lvl = c >= 750 ? 'отличный' : c >= 650 ? 'хороший' : c >= 580 ? 'средний' : 'плохой';
  card(`<div class="muted">Кредитный рейтинг</div><div class="big">${c} · ${lvl}</div><div class="bar-mini"><em style="width:${(c - 300) / 5.5}%"></em></div><div class="muted" style="margin-top:8px">Растёт, когда вы платите вовремя и не уходите в минус. От него зависят ипотека (нужно 580+) и ставка по кредитам.</div>`);
  const l = section('Потребительский кредит');
  if (S.cloan) { item(l, { e: '💳', t: `Долг: ${fmt(S.cloan.bal)}`, d: `Ставка ${Math.round(S.cloan.rate * 100)}% годовых` }); if (S.money > 0) btnRow($('#sheetBody'), [{ t: `Погасить ${fmt(Math.min(S.money, S.cloan.bal))}`, cls: 'primary', f: act(() => { const p = Math.min(S.money, S.cloan.bal); S.money -= p; S.cloan.bal -= p; if (S.cloan.bal <= 0) { S.cloan = null; return 'Кредит погашен досрочно!'; } return `Вы внесли ${fmt(p)}.`; }) }]); return; }
  if (c < 520 || S.age < 18) { l.appendChild(el('<div class="empty">Банк отказывает: слишком низкий рейтинг или возраст.</div>')); return; }
  const rate = c >= 750 ? 0.09 : c >= 650 ? 0.14 : 0.24;
  for (const k of [1, 3, 10]) { const amt = price(Math.round(k * 300000 * (c / 650))); item(l, { e: '🏦', t: `Взять ${fmt(amt)}`, d: `${Math.round(rate * 100)}% годовых, выплата за ~4 года`, onClick: act(() => { S.money += amt; S.cloan = { bal: amt, base: amt, rate }; return `💳 Вы взяли кредит ${fmt(amt)}.`; }) }); }
};
ACTIVITIES.push(
  { id: 'marketp', cat: 'Деньги', e: '📈', t: 'Биржа', d: '11 компаний, кризисы и бумы эпох', min: 18, yr: 1920, run: () => { delete S.used.marketp; setTimeout(() => openPanel('market'), 10); return null; } },
  { id: 'creditp', cat: 'Деньги', e: '💳', t: 'Кредиты и рейтинг', d: 'Кредитный рейтинг и займы', min: 18, run: () => { delete S.used.creditp; setTimeout(() => openPanel('credit'), 10); return null; } }
);

/* ---------- Учёба: кружки, за границей, одноклассники ---------- */
const CLUBS = [['music', '🎹', 'Музыкальная школа'], ['sport', '⚽', 'Футбольная секция'], ['art', '🖌️', 'Художественная школа'], ['code', '🤖', 'Робототехника'], ['acting', '🎭', 'Театральный кружок'], ['dance', '🩰', 'Танцевальная студия'], ['lang', '🇬🇧', 'Курсы языков'], ['write', '📓', 'Литературный клуб']];
ACTIVITIES.push(
  { id: 'clubs', cat: 'Разум и дух', e: '🏫', t: 'Кружки и секции', d: 'Развить навык и найти друзей', min: 6, cond: () => S.edu.stage === 'school', run: () => {
    Q.push({ e: '🏫', title: 'Куда записаться?', text: 'Один кружок на год. Навык растёт быстрее, чем дома.', choices: CLUBS.filter(([id]) => id !== 'code' || S.year >= 1980).map(([id, e, n]) => ({ t: `${e} ${n}`, f: () => {
      skills()[id] = clamp(skillOf(id) + rnd(6, 12) * (id === S.talent ? 1.6 : 1)); S.practiced = S.practiced || {}; S.practiced[id] = 1;
      eff({ happy: 4 });
      if (chance(0.4)) { const f = makePerson('friend', { age: S.age + rnd(-1, 1), close: rnd(50, 75), job: 'Одноклассник' }); S.people.push(f); return `${e} Год в кружке «${n}». Навык вырос, и вы подружились: ${f.name}.`; }
      return `${e} Год в кружке «${n}». Навык заметно вырос.`;
    } })) });
    return null;
  } },
  { id: 'abroad', cat: 'Жизнь', e: '🎓', t: 'Учёба за границей', d: 'Престижный вуз в другой стране', min: 18, cond: () => !S.edu.stage && EDU_RANK[S.edu.level] >= 1, run: () => {
    const opts = COUNTRIES.filter((c) => c.wage >= 1.6 && c.id !== S.country).sort(() => Math.random() - 0.5).slice(0, 6);
    Q.push({ e: '🌍', title: 'Учёба за границей', text: 'Обучение платное и дороже обычного, но диплом ценится выше.', choices: opts.map((c) => ({ t: `${c.flag} ${c.name}`, f: () => {
      Q.push({ e: c.flag, title: 'Специальность', text: `Вуз в стране ${c.name}. Требования выше на 8 баллов.`, choices: MAJORS.map((m) => ({ t: `${m.e} ${m.name} · от ${m.minSmarts + 8}`, f: () => {
        if (S.stats.smarts + rnd(-6, 6) < m.minSmarts + 8) { eff({ happy: -8 }); return `😞 Иностранный вуз отклонил заявку на «${m.name}».`; }
        enroll('uni', m.id);
        if (S.edu.stage === 'uni') { S.edu.abroad = c.id; S.edu.tuition = price(900000); if (!S.visited.includes(c.id)) S.visited.push(c.id); unlock('abroad'); eff({ smarts: 3 }); return `${c.flag} Вас приняли! Учёба за границей: ${fmt(S.edu.tuition)} в год.`; }
        return null;
      } })).concat([{ t: 'Передумать', f: () => null }]) });
      return null;
    } })).concat([{ t: 'Передумать', f: () => null }]) });
    return null;
  } }
);
// диплом зарубежного вуза ценится выше
const _hire2 = hire;
hire = function (d, bonus) { return _hire2(d, bonus + (S.edu.abroad ? 0.08 : 0)); };

YEAR_HOOKS.push(() => {
  if (S.edu.stage === 'school' && chance(0.15) && S.people.filter((p) => p.job === 'Одноклассник').length < 4) {
    const f = makePerson('friend', { age: S.age, close: rnd(45, 75), job: 'Одноклассник' }); S.people.push(f);
    log(`🎒 Вы подружились с одноклассником: ${f.name}.`, 'good');
  }
  if ([28, 38, 48, 58].includes(S.age) && S.people.some((p) => p.job === 'Одноклассник' || p.role === 'rival')) {
    ev('🥂', 'Встреча выпускников', `Прошло ${S.age - 17} лет после школы. Бывшие одноклассники собираются в ресторане.`, [
      { t: 'Пойти', f: () => {
        eff({ happy: 8 });
        const r = S.people.find((p) => p.role === 'rival' && p.alive);
        const brag = netWorth() > price(5000000) ? 'Все спрашивали, как вам удалось так преуспеть.' : 'Было тепло и немного грустно.';
        if (!partner() && S.orient !== 'ace' && chance(0.3)) { const g = loveGender(); const n = randFirst(g); addPartner(g, n); return `Встреча удалась. ${brag} А ещё старая школьная симпатия, ${n}, теперь ваша пара! 💕`; }
        if (r && chance(0.4)) { r.role = 'friend'; r.close = 60; return `Встреча удалась. ${brag} Вы помирились с давним соперником: ${r.name}.`; }
        return `Встреча удалась. ${brag}`;
      } },
      { t: 'Не пойду', f: () => 'Вы остались дома.' }
    ]);
  }
});

/* ---------- Соперники и соседи ---------- */
YEAR_HOOKS.push(() => {
  if (S.age === 9 && !S.people.some((p) => p.role === 'rival')) {
    const r = makePerson('rival', { age: S.age, close: 15, job: 'Одноклассник' }); S.people.push(r);
    log(`😤 У вас появился соперник в классе: ${r.name}. Вечно хочет быть лучше вас.`, 'info');
  }
  const r = S.people.find((p) => p.role === 'rival' && p.alive);
  if (r && S.age > 9 && chance(0.22)) {
    const field = pick([['smarts', 'на контрольной', 'на экзамене', 'в карьере'], ['looks', 'на конкурсе красоты', 'в популярности', 'в соцсетях'], ['health', 'на физкультуре', 'в марафоне', 'в спортзале']]);
    const where = S.age < 18 ? field[1] : S.age < 25 ? field[2] : field[3];
    if (S.stats[field[0]] + rnd(-20, 20) > r[field[0] === 'health' ? 'smarts' : field[0]] || chance(0.3)) { eff({ happy: 5 }); log(`😏 Вы обошли соперника (${r.name}) ${where}.`, 'good'); }
    else { eff({ happy: -5 }); log(`😒 ${r.name} снова обошёл вас ${where}.`, 'bad'); }
  }
  // соседи
  const hasNeighbors = S.people.some((p) => p.role === 'neighbor');
  if (S.age >= 20 && !hasNeighbors && chance(0.5)) {
    const n = makePerson('neighbor', { age: S.age + rnd(-15, 25), close: rnd(30, 60), job: pick(NPC_JOBS) }); S.people.push(n);
    log(`🏠 Вы познакомились с соседом: ${n.name}.`, 'info');
  }
  const nb = S.people.find((p) => p.role === 'neighbor' && p.alive);
  if (nb && chance(0.15)) {
    const kind = rnd(0, 2);
    if (kind === 0) ev('🔊', 'Шумный сосед', `${nb.name} устраивает вечеринку в 3 часа ночи.`, [
      { t: 'Присоединиться', f: () => { eff({ happy: 6, health: -2 }); nb.close = clamp(nb.close + 15); return 'Вы оказались лучшим гостем вечеринки!'; } },
      { t: 'Постучать в стену', f: () => { nb.close = clamp(nb.close - 5); return 'Музыку сделали тише. Ненадолго.'; } },
      { t: 'Вызвать полицию', f: () => { nb.close = clamp(nb.close - 25); eff({ karma: -1 }); return 'Полиция приехала. Сосед теперь смотрит волком.'; } }]);
    else if (kind === 1) ev('💧', 'Потоп', `Вас затопил сосед сверху (${nb.name}).`, [
      { t: 'Потребовать компенсацию', f: () => { if (chance(nb.close / 100 + 0.3)) { S.money += price(80000); return 'Сосед извинился и всё оплатил.'; } nb.close = clamp(nb.close - 20); S.money -= price(80000); return 'Сосед отказался платить. Ремонт за ваш счёт.'; } },
      { t: 'Простить', f: () => { S.money -= price(80000); nb.close = clamp(nb.close + 15); eff({ karma: 4 }); return 'Вы сделали ремонт сами. Сосед в долгу.'; } }]);
    else { nb.close = clamp(nb.close + 8); log(`🧂 ${nb.name} зашёл одолжить соль. Мило поболтали.`, 'info'); }
  }
});

/* ---------- Соцсеть ---------- */
const POSTS = {
  any: ['Какой чудесный день! ☀️', 'Кто-нибудь знает хорошего стоматолога?', 'Наконец-то отпуск! ✈️', 'Начал(а) бегать по утрам. День 1 🏃', 'Посмотрите на этот закат 🌅', 'Испекла пирог, получился кривым, но вкусным 🥧', 'Понедельник — день тяжёлый 😩', 'Новая стрижка! Как вам? 💇', 'Читаю отличную книгу, всем советую 📚', 'Кто на концерт в субботу? 🎸'],
  child: ['Получил(а) пятёрку! 📝', 'Мама не разрешает собаку 😭', 'Лучший день в лагере ⛺', 'Скоро каникулы!!! 🎉'],
  old: ['Внуки приезжали, такие большие стали ❤️', 'Огород в этом году удался 🍅', 'Вспоминаю молодость… 📷', 'Научился(ась) пользоваться этой вашей соцсетью 👴'],
  partner: ['Люблю тебя! ❤️', 'Лучший человек на свете рядом со мной 💕', 'Наш совместный ужин 🍝'],
  rival: ['Купил(а) новую машину, просто так 😎', 'Очередное повышение. Работаем! 💼', 'Пробежал(а) марафон 🏅', 'Отдыхаю на Мальдивах 🏝️']
};
YEAR_HOOKS.push(() => {
  if (S.year < 2006 || S.age < 10) return;
  S.feed = S.feed || [];
  const people = S.people.filter((p) => p.alive && p.age >= 10 && ['friend', 'sibling', 'partner', 'child', 'rival', 'neighbor', 'mother', 'father', 'grandchild'].includes(p.role));
  for (let i = 0; i < Math.min(people.length, rnd(2, 5)); i++) {
    const p = pick(people);
    const pool = p.role === 'partner' ? POSTS.partner : p.role === 'rival' ? POSTS.rival : p.age < 16 ? POSTS.child : p.age > 60 ? POSTS.old : POSTS.any;
    S.feed.unshift({ id: uid(), pid: p.id, who: p.name, role: roleName(p), e: personEmoji(p), text: pick(pool), likes: rnd(0, 120), year: S.year });
  }
  S.feed = S.feed.slice(0, 40);
});
EXTRA_TITLES.feed = '📱 Лента';
EXTRA_PANELS.feed = function () {
  S.feed = S.feed || [];
  card(`<div class="muted">Ваш профиль</div><div class="big">${S.followers.toLocaleString('ru-RU')} подписчиков</div><div class="muted">Лайкайте посты близких, чтобы стать ближе. Публикуйтесь, чтобы расти.</div>`);
  btnRow($('#sheetBody'), [
    { t: '📸 Фото', disabled: !!S.used.post, f: act(() => post('photo')) },
    { t: '💭 Мысль', disabled: !!S.used.post, f: act(() => post('thought')) },
    { t: '😂 Мем', disabled: !!S.used.post, f: act(() => post('meme')) }
  ]);
  const l = section('Лента');
  if (!S.feed.length) l.appendChild(el('<div class="empty">Пока пусто. Здесь будут посты ваших друзей и родных.</div>'));
  for (const p of S.feed) {
    const n = item(l, { e: p.e, t: `${p.who} · ${p.role}`, d: `${p.text} · ${p.year}`, r: `${p.liked ? '❤️' : '🤍'} ${p.likes}`, onClick: p.liked || p.mine ? null : act(() => { p.liked = true; p.likes++; const who = S.people.find((x) => x.id === p.pid); if (who) who.close = clamp(who.close + 3); return `Вы лайкнули пост: ${p.who}.`; }) });
    if (p.mine) n.style.borderColor = 'var(--accent)';
  }
};
function post(kind) {
  S.used.post = 1;
  const base = Math.max(5, S.followers * rf(0.02, 0.08));
  const k = kind === 'photo' ? S.stats.looks / 50 : kind === 'thought' ? S.stats.smarts / 55 : (chance(0.12) ? 15 : 0.6);
  const likes = Math.round(base * k + rnd(1, 20));
  const gain = Math.round(likes * rf(0.3, 1.2));
  S.followers += gain; S.blogged = true; eff({ happy: 3 });
  const text = { photo: pick(['Новое фото 📸', 'Утро начинается с кофе ☕', 'Я и закат 🌅']), thought: pick(['Иногда нужно просто остановиться и подумать 💭', 'Главное — не сдаваться', 'Делюсь мыслями о жизни…']), meme: pick(['Когда понедельник 😂', 'Я на работе vs я в пятницу 🤣', 'Кот смотрит в душу 😹']) }[kind];
  S.feed = S.feed || []; S.feed.unshift({ id: uid(), who: `${S.first} (вы)`, role: 'ваш пост', e: avatar(), text, likes, year: S.year, mine: true });
  return ['📱', 'Опубликовано', `${likes.toLocaleString('ru-RU')} лайков, +${gain.toLocaleString('ru-RU')} подписчиков.`];
}
ACTIVITIES.push({ id: 'feedp', cat: 'Любовь и общение', e: '📱', t: 'Соцсеть', d: 'Лента друзей, лайки и посты', min: 10, yr: 2006, run: () => { delete S.used.feedp; setTimeout(() => openPanel('feed'), 10); return null; } });

/* ---------- Сюжетные цепочки ---------- */
YEAR_HOOKS.push(() => {
  if (S.prison || !S.alive) return;
  const A = arcs();
  // 1. стартап друга
  if (A.startup && A.startup.step === 1) {
    A.startup.years++;
    const r = Math.random();
    if (A.startup.years >= 2 && r < 0.15) { const win = A.startup.sum * rnd(8, 25); S.money += win; A.startup.step = 9; unlock('angel'); log(`🚀 Стартап друга (${A.startup.friend}) купила крупная корпорация! Ваша доля: ${fmt(win)}.`, 'good'); eff({ happy: 25 }); }
    else if (r < 0.35) { A.startup.step = 9; log(`💥 Стартап друга (${A.startup.friend}) закрылся. Ваши ${fmt(A.startup.sum)} сгорели.`, 'bad'); eff({ happy: -8 }); }
    else if (A.startup.years >= 5) { const back = Math.round(A.startup.sum * rf(1.2, 3)); S.money += back; A.startup.step = 9; log(`💼 Стартап друга вырос и выкупил вашу долю за ${fmt(back)}.`, 'good'); }
    else log(`🚀 Стартап друга (${A.startup.friend}) пока держится.`, 'info');
  } else if (!A.startup && S.age >= 22 && S.age <= 55 && S.money > price(500000) && chance(0.06)) {
    const f = pick(alivePeople(['friend'])) || { name: randFirst() }; const sum = price(rnd(3, 15) * 100000);
    A.startup = { step: 0 };
    ev('🚀', 'Стартап друга', `${f.name} запускает стартап и просит вложить ${fmt(sum)} в обмен на долю.`, [
      { t: 'Вложить', f: () => { S.money -= sum; A.startup = { step: 1, sum, friend: f.name, years: 0 }; return `Вы стали инвестором стартапа (${f.name}).`; } },
      { t: 'Отказаться', f: () => { A.startup = { step: 9 }; return 'Вы вежливо отказались.'; } }
    ]);
  }
  // 2. роман на работе
  if (A.office && A.office.step === 1 && S.job) {
    A.office.step = 9;
    if (chance(0.5)) { const p = addPartner(A.office.g, A.office.name); p.job = 'Коллега'; log(`💘 Роман на работе перерос в отношения: теперь вы пара с коллегой ${A.office.name}.`, 'good'); }
    else { S.job.perf = clamp(S.job.perf - 25); eff({ happy: -10 }); log('🙈 О романе узнал весь офис. Начальство недовольно, коллеги шепчутся.', 'bad'); if (chance(0.3)) { log('🚪 Вас попросили уйти «по собственному».', 'bad'); S.job = null; } }
  } else if (!A.office && S.job && S.age >= 20 && S.age <= 50 && S.orient !== 'ace' && chance(0.05)) {
    const g = loveGender(); const name = randFirst(g); A.office = { step: 0 };
    ev('☕', 'Взгляды у кулера', `Коллега по имени ${name} явно проявляет к вам интерес. На корпоративе вы оказались рядом.`, [
      { t: 'Ответить взаимностью', f: () => { if (partner()) { const p = partner(); if (chance(0.5)) { p.close = clamp(p.close - 40); relationshipRemember(p, 'betrayal', 'Я узнал о вашем романе на работе.', 0, 30); A.office = { step: 9 }; return `${p.name} обо всём узнал(а). Скандал!`; } } A.office = { step: 1, g, name }; return 'Между вами пробежала искра…'; } },
      { t: 'Держать дистанцию', f: () => { A.office = { step: 9 }; eff({ karma: 2 }); return 'Работа есть работа.'; } }
    ]);
  }
  // 3. тяжба с соседом
  if (A.suit && A.suit.step === 1) {
    A.suit.step = 9;
    if (chance(A.suit.p)) { const w = price(rnd(3, 15) * 100000); S.money += w; eff({ happy: 12 }); log(`⚖️ Суд с соседом выигран! Компенсация: ${fmt(w)}.`, 'good'); }
    else { S.money -= price(200000); eff({ happy: -10 }); log(`⚖️ Суд с соседом проигран. Судебные издержки: ${fmt(price(200000))}.`, 'bad'); }
  } else if (!A.suit && S.assets.some((a) => a.type === 'house') && chance(0.04)) {
    A.suit = { step: 0 };
    ev('🚧', 'Забор раздора', 'Сосед поставил забор на полметра на вашем участке и отказывается его переносить.', [
      { t: `Подать в суд (${fmt(price(150000))})`, f: () => { S.money -= price(150000); A.suit = { step: 1, p: 0.6 }; return 'Иск подан. Решение будет через год.'; } },
      { t: 'Договориться миром', f: () => { A.suit = { step: 9 }; eff({ karma: 3 }); return chance(0.5) ? 'Сосед подумал и перенёс забор.' : 'Сосед не уступил, но вы сохранили нервы.'; } },
      { t: 'Снести забор ночью', f: () => { A.suit = { step: 9 }; eff({ karma: -6 }); return chance(0.6) ? 'Забор исчез. Сосед ничего не доказал.' : (crimeCaught('Порча имущества', 1), 'Вас сняла камера соседа.'); } }
    ]);
  }
  // 4. тайный родственник
  if (!A.dna && S.age >= 25 && S.age <= 70 && chance(0.025)) {
    A.dna = { step: 9 };
    ev('🧬', 'ДНК-тест', 'Вы сделали ДНК-тест ради интереса. Система нашла совпадение: у вас есть сводный брат или сестра!', [
      { t: 'Написать', f: () => { const g = npcGender(); const s2 = makePerson('sibling', { gender: g, age: S.age + rnd(-8, 8), close: rnd(30, 60), job: pick(NPC_JOBS) }); S.people.push(s2); eff({ happy: 10 }); return `Вы познакомились: ${s2.name}. Оказалось, вы очень похожи!`; } },
      { t: 'Не ворошить прошлое', f: () => 'Вы закрыли вкладку.' }
    ]);
  }
  // 5. клад
  if (!A.treasure && S.assets.some((a) => a.id === 'cottage' || a.id === 'mansion' || a.id === 'villa') && chance(0.05)) {
    A.treasure = { step: 9 };
    ev('🗺️', 'Старая карта', 'Разбирая чердак, вы нашли пожелтевшую карту участка с крестиком.', [
      { t: 'Копать!', f: () => { eff({ health: -2 }); if (chance(0.3)) { const w = price(rnd(5, 40) * 100000); S.money += w; unlock('treasure'); return `Под старой яблоней нашёлся сундук с монетами! ${fmt(w)}.`; } return 'Вы перекопали получастка. Нашли только старую подкову.'; } },
      { t: 'Повесить карту на стену', f: () => 'Красивая вещь для интерьера.' }
    ]);
  }
  // 6. наставник
  if (!A.mentor && S.age >= 16 && S.age <= 30 && chance(0.05)) {
    const m = makePerson('friend', { age: S.age + rnd(20, 35), close: 50, job: pick(['Профессор', 'Предприниматель', 'Инженер', 'Врач', 'Юрист']) });
    A.mentor = { step: 0 };
    ev('🧓', 'Наставник', `${m.name}, опытный ${m.job.toLowerCase()}, предлагает стать вашим наставником.`, [
      { t: 'С радостью', f: () => { S.people.push(m); A.mentor = { step: 1, id: m.id }; eff({ smarts: 5 }); return `Теперь у вас есть наставник: ${m.name}.`; } },
      { t: 'Справлюсь сам', f: () => { A.mentor = { step: 9 }; return 'Вы решили идти своим путём.'; } }
    ]);
  } else if (A.mentor && A.mentor.step === 1) {
    eff({ smarts: rnd(1, 3) });
    if (S.job && chance(0.25)) { S.job.perf = clamp(S.job.perf + 15); log('🧓 Наставник замолвил за вас словечко. Начальство впечатлено.', 'good'); }
    if (chance(0.12)) { A.mentor.step = 9; log('🧓 Наставник сказал, что научил вас всему, что знал.', 'info'); }
  }
});

/* ---------- События эпох ---------- */
EVENTS.push(
  { min: 16, max: 80, w: 6, cond: () => isUSSR() && S.year >= 1975 && S.year <= 1991, run: () => ev('🧾', 'Дефицит', 'В магазин «выбросили» импортные сапоги. Очередь на три квартала.', [
    { t: 'Отстоять очередь', f: () => { eff({ happy: chance(0.5) ? 6 : -4, health: -1 }); return chance(0.5) ? 'Достались! Последняя пара.' : 'Перед вами всё закончилось.'; } },
    { t: 'Купить у спекулянта', f: () => { S.money -= price(15000); eff({ happy: 5, karma: -1 }); return 'Втридорога, зато без очереди.'; } },
    { t: 'Обойдусь', f: () => 'Старые ещё походят.' }]) },
  { min: 20, max: 60, w: 6, cond: () => isUSSR() && S.year >= 1987 && S.year <= 1991 && !S.biz, run: () => ev('🛠️', 'Кооператив', 'Перестройка! Теперь можно открыть свой кооператив.', [
    { t: `Открыть (${fmt(price(200000))})`, f: () => { S.money -= price(200000); S.biz = { e: '🛠️', name: 'Кооператив', value: price(200000), start: price(200000), years: 0 }; unlock('business'); return 'Вы открыли кооператив. Время первых предпринимателей!'; } },
    { t: 'Подождать', f: () => 'Вы решили посмотреть, что будет дальше.' }]) },
  { min: 18, max: 85, w: 8, cond: () => isUSSR() && S.year >= 1992 && S.year <= 1993 && !S.voucher, run: () => { S.voucher = 1; ev('📄', 'Ваучер', 'Вам выдали приватизационный чек. Что с ним делать?', [
    { t: 'Вложить в акции завода', f: () => { if (chance(0.15)) { const w = price(rnd(10, 60) * 100000); S.money += w; return `Завод выжил и подорожал! ${fmt(w)}.`; } return 'Завод обанкротился. Ваучер превратился в бумажку.'; } },
    { t: 'Вложить в чековый фонд', f: () => 'Фонд исчез вместе с основателями.' },
    { t: 'Продать у метро', f: () => { S.money += price(8000); return 'Вы обменяли ваучер на пару бутылок и немного денег.'; } }]); } },
  { min: 18, max: 85, w: 8, cond: () => isUSSR() && S.year === 1994 && !S.mmm, run: () => { S.mmm = 1; ev('📺', 'Финансовая пирамида', 'По телевизору обещают доход 1000% годовых. Соседи уже вложились.', [
    { t: 'Вложить всё', f: () => { const v = Math.max(0, S.money); if (chance(0.2)) { S.money += v; return 'Вы успели забрать деньги вдвое больше до краха!'; } S.money -= v; eff({ happy: -15 }); return 'Пирамида рухнула. Все сбережения потеряны.'; } },
    { t: 'Не верю в сказки', f: () => { eff({ smarts: 2 }); return 'Через полгода пирамида рухнула. Вы оказались правы.'; } }]); } },
  { min: 18, max: 75, w: 6, cond: () => isUSSR() && S.year >= 1992 && S.year <= 1999 && S.biz, run: () => ev('🕶️', 'Крыша', 'К вам в офис пришли крепкие ребята в кожанках и предлагают «защиту».', [
    { t: `Платить (${fmt(price(300000))} в год)`, f: () => { S.money -= price(300000); return 'Теперь у вас есть «крыша».'; } },
    { t: 'Отказать', f: () => { if (chance(0.5)) { S.biz.value = Math.round(S.biz.value * 0.6); eff({ health: -15 }); return 'Офис разгромили, а вас избили.'; } return 'Обошлось. Видимо, нашли кого попроще.'; } },
    { t: 'Обратиться в милицию', f: () => chance(0.3) ? 'Бандитов задержали!' : (eff({ happy: -8 }), 'Милиция развела руками.') }]) },
  { min: 20, max: 70, w: 5, cond: () => S.year >= 1997 && S.year <= 1999 && !S.dotcom, run: () => { S.dotcom = { sum: 0 }; ev('🌐', 'Интернет-лихорадка', 'Все скупают акции интернет-компаний. Сосед заработал миллион на сайте про корм для собак.', [
    { t: `Вложить ${fmt(price(500000))}`, f: () => { S.money -= price(500000); S.dotcom = { sum: price(500000) }; return 'Вы вложились в доткомы!'; } },
    { t: 'Не лезть', f: () => 'Вы остались в стороне.' }]); } },
  { min: 20, max: 75, w: 50, cond: () => S.dotcom && S.dotcom.sum && S.year >= 2000 && S.year <= 2001, run: () => { const s = S.dotcom.sum; S.dotcom.sum = 0; ev('💥', 'Пузырь лопнул', 'Акции интернет-компаний рушатся одна за другой.', [
    { t: 'Срочно продать', f: () => { const back = Math.round(s * (chance(0.4) ? 1.8 : 0.3)); S.money += back; return `Вы продали за ${fmt(back)}.`; } },
    { t: 'Держать до конца', f: () => { const back = Math.round(s * (chance(0.1) ? 6 : 0.05)); S.money += back; return back > s ? `Ваша компания выжила и стала гигантом! ${fmt(back)}.` : 'Компания обанкротилась.'; } }]); } },
  { min: 8, max: 90, w: 5, cond: () => S.year >= 1955 && S.year <= 1970 && !S.tv, run: () => { S.tv = 1; ev('📺', 'Телевизор', 'В магазине появились телевизоры! Вся семья мечтает.', [
    { t: `Купить (${fmt(price(60000))})`, f: () => { S.money -= price(60000); eff({ happy: 10 }); return 'Теперь соседи приходят к вам смотреть фильмы.'; } },
    { t: 'Не сейчас', f: () => 'Будете ходить к соседям.' }]); } },
  { min: 8, max: 90, w: 5, cond: () => S.year >= 1982 && S.year <= 1995 && !S.vcr, run: () => { S.vcr = 1; ev('📼', 'Видеомагнитофон', 'Друзья достали видеомагнитофон и кассеты с боевиками.', [
    { t: 'Смотреть всю ночь', f: () => { eff({ happy: 8, health: -1 }); return 'Вы пересмотрели все кассеты. Гнусавый перевод навсегда в памяти.'; } },
    { t: 'Спать', f: () => 'Вы выспались.' }]); } },
  { min: 10, max: 90, w: 6, cond: () => S.year >= 2007 && S.year <= 2011 && !S.phone, run: () => { S.phone = 1; ev('📱', 'Смартфон', 'Вышли смартфоны с сенсорным экраном. Все только о них и говорят.', [
    { t: `Купить (${fmt(price(40000))})`, f: () => { S.money -= price(40000); eff({ happy: 8 }); return 'Вы влюбились в свой новый телефон.'; } },
    { t: 'Мне и кнопочный хорош', f: () => 'Ваш телефон держит заряд неделю. Это тоже плюс.' }]); } },
  { min: 18, max: 80, w: 6, cond: () => S.year >= 2035 && !S.implant, run: () => { S.implant = 1; ev('🧠', 'Нейроимплант', 'Клиника предлагает вживить нейроимплант: память и скорость мышления выше.', [
    { t: `Вживить (${fmt(price(2000000))})`, f: () => { S.money -= price(2000000); if (chance(0.85)) { eff({ smarts: 15 }); unlock('cyborg'); return 'Мир стал ярче и понятнее. Ум +15.'; } eff({ health: -20 }); return 'Организм отторг имплант. Тяжёлая операция.'; } },
    { t: 'Я против', f: () => 'Вы остались стопроцентным человеком.' }]); } },
  { min: 25, max: 90, w: 5, cond: () => S.year >= 2032 && !S.robot, run: () => { S.robot = 1; ev('🤖', 'Робот-помощник', 'В продаже домашние роботы: готовят, убирают, гуляют с собакой.', [
    { t: `Купить (${fmt(price(1500000))})`, f: () => { S.money -= price(1500000); eff({ happy: 10, health: 3 }); return 'Робот по имени Вася теперь член семьи.'; } },
    { t: 'Сам справлюсь', f: () => 'Вы по-прежнему моете посуду сами.' }]); } },
  { min: 5, max: 90, w: 30, cond: () => S.year === 1961 || S.year === 1969, run: () => { eff({ happy: 6 }); log(S.year === 1961 ? '🚀 Вся страна у радиоприёмников: человек в космосе! Вы запомнили этот день навсегда.' : '🌕 Вы смотрели трансляцию высадки на Луну, затаив дыхание.', 'good'); } }
);

/* ---------- достижения ---------- */
ACHIEVEMENTS.push(
  { id: 'abroad', e: '🎓', t: 'Студент мира', d: 'Поступить в вуз за границей' },
  { id: 'angel', e: '👼', t: 'Бизнес-ангел', d: 'Заработать на стартапе друга' },
  { id: 'treasure', e: '💰', t: 'Кладоискатель', d: 'Найти клад' },
  { id: 'cyborg', e: '🦾', t: 'Киборг', d: 'Вживить нейроимплант' },
  { id: 'investor', e: '📊', t: 'Инвестор', d: 'Портфель акций дороже 10 млн ₽' }
);
YEAR_HOOKS.push(() => {
  if (S.market && S.shares) { const v = Object.entries(S.shares).reduce((s, [t, n]) => s + (S.market[t] ? n * S.market[t].p : 0), 0); if (v >= 1e7) unlock('investor'); }
});

