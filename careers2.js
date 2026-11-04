'use strict';
/* ===================== Спорт, криминальный мир, наука, творчество, недвижимость ===================== */
const moneyK = () => 1;

/* ====================== 🏅 СПОРТ И ОЛИМПИАДЫ ====================== */
const SPORTS = [
  { id: 'football', e: '⚽', n: 'Футбол', ol: 's', team: true }, { id: 'hockey', e: '🏒', n: 'Хоккей', ol: 'w', team: true, yr: 1920 },
  { id: 'basket', e: '🏀', n: 'Баскетбол', ol: 's', team: true, yr: 1936 }, { id: 'tennis', e: '🎾', n: 'Теннис', ol: 's' },
  { id: 'box', e: '🥊', n: 'Бокс', ol: 's' }, { id: 'swim', e: '🏊', n: 'Плавание', ol: 's' }, { id: 'run', e: '🏃', n: 'Лёгкая атлетика', ol: 's' },
  { id: 'gym', e: '🤸', n: 'Гимнастика', ol: 's' }, { id: 'skate', e: '⛸️', n: 'Фигурное катание', ol: 'w' }, { id: 'ski', e: '🎿', n: 'Биатлон и лыжи', ol: 'w', yr: 1924 },
  { id: 'cycle', e: '🚴', n: 'Велоспорт', ol: 's' }, { id: 'wrestle', e: '🤼', n: 'Борьба', ol: 's' }, { id: 'esport', e: '🎮', n: 'Киберспорт', yr: 2000 }
];
const SPORT_LVL = ['Секция', 'Юниор', 'Профессионал', 'Сборная страны', 'Легенда спорта'];
const sportDef = () => SPORTS.find((s) => s.id === S.sport.id);
function olympYear(y, kind) {
  if ([1916, 1940, 1944].includes(y)) return false;
  if (kind === 's') return y % 4 === 0 && y >= 1900;
  if (kind === 'w') return y >= 1924 && (y <= 1992 ? y % 4 === 0 : y % 4 === 2);
  return false;
}
function sportSalary() { const sp = S.sport; if (!sp || sp.lvl < 2 || sp.retired || sp.ban) return 0; return Math.round(price([0, 0, 900000, 4000000, 20000000][sp.lvl] * (sp.rating / 80) * (sportDef().team ? 1.3 : 1)) * moneyK()); }
EXTRA_TITLES.sport = '🏅 Спорт';
EXTRA_PANELS.sport = function () {
  const B = $('#sheetBody'); const sp = S.sport;
  if (!sp) {
    card(`<div class="muted">Спортивная карьера</div><div class="big">Выберите вид спорта</div><div class="muted">Начинать лучше в детстве. Талант к спорту и здоровье ускоряют рост.</div>`);
    if (S.age > 25) { B.appendChild(el('<div class="empty">Для профессионального спорта уже поздновато, но любительская секция всегда рада.</div>')); }
    const l = section('Записаться в секцию');
    for (const s of SPORTS.filter((x) => !x.yr || S.year >= x.yr)) item(l, { e: s.e, t: s.n, d: s.ol ? `Олимпийский вид · ${s.ol === 'w' ? 'зимний' : 'летний'}` : 'Чемпионаты мира', disabled: S.age < 5 || S.prison, onClick: act(() => {
      S.sport = { id: s.id, lvl: 0, rating: clamp(Math.round(10 + S.stats.health / 6 + skillOf('sport') / 3 + (S.genes?.includes('athletic') ? 10 : 0) - Math.max(0, S.age - 16) * 2)), gold: 0, silver: 0, bronze: 0, worlds: 0, titles: 0, years: 0, inj: 0, club: '' };
      skills().sport = Math.max(skillOf('sport'), 5);
      return `${s.e} Вы записались в секцию: ${s.n.toLowerCase()}. Тренер говорит, что потенциал есть.`;
    }) });
    return;
  }
  const d = sportDef();
  card(`<div class="muted">${d.e} ${d.n}${sp.club ? ` · ${esc(sp.club)}` : ''}</div><div class="big">${sp.retired ? gv(S, 'Завершил карьеру', 'Завершила карьеру', 'Завершил(а) карьеру') : SPORT_LVL[sp.lvl]}</div><div class="muted">Форма: ${sp.rating}/100${sp.inj ? ` · 🤕 травма (${yrs(sp.inj)})` : ''}${sp.ban ? ` · 🚫 дисквалификация (${yrs(sp.ban)})` : ''}</div><div class="bar-mini"><em style="width:${sp.rating}%"></em></div><div class="medals">🥇 ${sp.gold} · 🥈 ${sp.silver} · 🥉 ${sp.bronze} · 🏆 ЧМ: ${sp.worlds} · титулов ${sp.titles}</div>${sportSalary() ? `<div class="muted">Контракт: ${fmt(sportSalary())} в год</div>` : ''}`);
  if (sp.retired || S.prison) return;
  const l = section('Этот сезон');
  item(l, { e: '🏋️', t: 'Тренироваться на износ', d: '+форма, риск травмы', disabled: S.used.sp_train || sp.inj > 0, onClick: act(() => { S.used.sp_train = 1; if (chance(0.07)) { sp.inj = rnd(1, 2); eff({ health: -10 }); return `🤕 Травма на тренировке. Восстановление: ${yrs(sp.inj)}.`; } const g = rnd(4, 9) + (S.talent === 'sport' ? 2 : 0) - (S.age > 30 ? 3 : 0); sp.rating = clamp(sp.rating + g); skills().sport = clamp(skillOf('sport') + 3); eff({ health: 3, happy: -2 }); return `🏋️ Изнурительные тренировки. Форма +${g}.`; }) });
  item(l, { e: '⛺', t: 'Сборы в горах', d: `${fmt(price(sp.lvl >= 2 ? 0 : 60000))} · ровный рост формы`, disabled: S.used.sp_camp || (sp.lvl < 2 && S.age >= 18 && S.money < price(60000)), onClick: act(() => { S.used.sp_camp = 1; if (sp.lvl < 2 && S.age >= 18) S.money -= price(60000); sp.rating = clamp(sp.rating + rnd(3, 6)); eff({ health: 4 }); return '⛺ Сборы прошли отлично: свежий воздух и режим.'; }) });
  if (sp.lvl >= 2) item(l, { e: '🔁', t: 'Искать новый клуб', d: 'Переход ради денег или титулов', disabled: S.used.sp_tr, onClick: () => { S.used.sp_tr = 1; const offers = Array.from({ length: 3 }, () => ({ n: sportClub(), k: rf(0.8, 1.6) })); Q.push({ e: '🔁', title: 'Трансферные предложения', text: 'Агент принёс три варианта.', choices: offers.map((o) => ({ t: `${o.n} · контракт ×${o.k.toFixed(1)}`, f: () => { sp.club = o.n; const b = Math.round(sportSalary() * (o.k - 0.8)); S.money += Math.max(0, b); eff({ happy: 6 }); return `✍️ Вы подписали контракт с клубом «${o.n}». Подъёмные: ${fmt(Math.max(0, b))}.`; } })).concat([{ t: 'Остаться', f: () => 'Вы решили остаться в родной команде. Фанаты в восторге.' }]) }); pump(); } });
  item(l, { e: '🏁', t: 'Завершить карьеру', d: sp.lvl >= 2 ? 'Стать тренером или комментатором' : 'Бросить спорт', onClick: () => { Q.push({ e: d.e, title: 'Завершить карьеру?', text: 'Вернуться уже не получится.', choices: [{ t: 'Да, пора', cls: 'danger', f: () => { sp.retired = S.year; if (sp.lvl >= 3) { S.fameBonus = (S.fameBonus || 0) + 5; return `🎙️ Прощальный матч! Вы ушли из спорта легендой и стали комментатором.`; } return `${d.e} Вы закончили со спортом.`; } }, { t: 'Ещё повоюем', f: () => null }] }); pump(); } });
};
const CLUB_A = ['Динамо', 'Спартак', 'Олимп', 'Атлант', 'Звезда', 'Торпедо', 'Метеор', 'Феникс', 'Вулкан', 'Титан', 'Буревестник', 'Ракета'];
function sportClub() { const c = pick(C().cities || [S.city]); return `${pick(CLUB_A)} ${c}`; }
YEAR_HOOKS.push(() => {
  const sp = S.sport; if (!sp || sp.retired || S.prison) return;
  const d = sportDef();
  sp.years++; if (sp.inj) sp.inj--; if (sp.ban) sp.ban--;
  sp.rating = clamp(sp.rating + (S.age < 18 ? rnd(1, 4) : S.age < 28 ? rnd(0, 2) : -rnd(2, 5)) + (S.stats.health < 40 ? -3 : 0));
  // ступени
  if (sp.lvl === 0 && sp.rating >= 35 && S.age >= 11) { sp.lvl = 1; log(`${d.e} Вас взяли в юношескую команду. Первые настоящие соревнования!`, 'good'); }
  else if (sp.lvl === 1 && sp.rating >= 55 && S.age >= 16) {
    ev('✍️', 'Профессиональный контракт', `Клуб предлагает вам первый профессиональный контракт: ${d.n.toLowerCase()}.${S.job ? ' Придётся уйти с текущей работы.' : ''}`, [
      { t: 'Подписать!', f: () => { sp.lvl = 2; sp.club = sportClub(); if (S.job) S.job = null; unlock('sportpro'); eff({ happy: 15 }); return `✍️ Вы теперь профессионал! Клуб «${sp.club}».`; } },
      { t: 'Остаться любителем', f: () => { sp.rating = clamp(sp.rating - 10); return 'Вы выбрали учёбу и стабильность.'; } }]);
  } else if (sp.lvl === 2 && sp.rating >= 76) { sp.lvl = 3; S.fameBonus = (S.fameBonus || 0) + 6; log(`🇺🇳 Вас вызвали в сборную страны! ${C().flag}`, 'good'); }
  else if (sp.lvl === 3 && (sp.gold >= 1 || sp.worlds >= 2) && sp.rating >= 85) { sp.lvl = 4; unlock('legend'); S.fameBonus = (S.fameBonus || 0) + 10; log(`🐐 Вас называют легендой. ${d.n}: ваше имя знает каждый болельщик.`, 'good'); }
  if (sp.lvl >= 3 && sp.rating < 60) { sp.lvl = 2; log('📉 Вас больше не вызывают в сборную.', 'bad'); }
  const sal = sportSalary(); if (sal) { S.money += Math.round(sal * (1 - taxRate())); }
  if (sp.lvl >= 2 && !sp.inj && !sp.ban) {
    const sc = sp.rating + rnd(-25, 20);
    if (sc > 85) { sp.titles++; S.money += Math.round(price(sp.lvl * 300000) * moneyK()); log(`${d.e} Сезон мечты: ${d.team ? `«${sp.club}» берёт чемпионский титул!` : 'вы выиграли главный турнир года!'}`, 'good'); eff({ happy: 10 }); }
    else if (sc < 45) { eff({ happy: -4 }); log(`${d.e} Провальный сезон. Болельщики недовольны.`, 'bad'); }
    else if (chance(0.4)) log(`${d.e} Ровный сезон: ${d.team ? `команда в середине таблицы` : 'несколько финалов и полуфиналов'}.`, 'info');
  }
  // допинг
  if (sp.lvl >= 2 && !sp.ban && chance(0.05)) ev('💉', 'Подозрительное предложение', 'Врач команды намекает на «витамины», которые дадут +10 к форме. Никто не узнает…', [
    { t: 'Отказаться', f: () => { eff({ karma: 4 }); return 'Вы остались чисты. Совесть спокойна.'; } },
    { t: 'Согласиться', f: () => { sp.rating = clamp(sp.rating + 10); eff({ karma: -6 }); if (chance(0.35)) { sp.ban = 2; sp.gold = Math.max(0, sp.gold - 1); S.fameBonus = (S.fameBonus || 0) - 15; return '🚫 Допинг-проба положительная! Дисквалификация на 2 года, медаль отобрана. Позор.'; } return '💉 Форма взлетела. Пока никто ничего не заметил.'; } }]);
  // чемпионат мира / Олимпиада
  if (sp.lvl >= 3 && !sp.inj && !sp.ban) {
    if (d.ol && olympYear(S.year, d.ol)) olympEvent();
    else if (S.year >= (typeof wchFrom === 'function' ? wchFrom(d.id) : 1900) && chance(0.55)) { const sc = sp.rating + rnd(-15, 15); if (sc >= 93) { sp.worlds++; unlock('worldchamp'); S.money += Math.round(price(1500000) * moneyK()); S.fameBonus = (S.fameBonus || 0) + 5; eff({ happy: 15 }); log(`🏆 Вы — чемпион мира! ${d.n}, ${S.year}.`, 'good'); } else if (sc >= 82) log(`🏅 Чемпионат мира: вы в призёрах.`, 'good'); else log('🌍 Чемпионат мира: без медалей.', 'info'); }
  }
  if (S.age >= 36 && sp.lvl >= 1 && chance(0.25)) ev('🏁', 'Возраст берёт своё', 'Тело уже не то. Может, пора завершать карьеру?', [
    { t: 'Завершить красиво', f: () => { sp.retired = S.year; if (sp.lvl >= 3) S.fameBonus = (S.fameBonus || 0) + 4; return '🎙️ Вы провели прощальный матч и ушли под овации.'; } },
    { t: 'Ещё сезон!', f: () => 'Вы решили побороться ещё.' }]);
});
function olympEvent() {
  const sp = S.sport; const d = sportDef();
  const city = pick(['Афинах', 'Париже', 'Лондоне', 'Стокгольме', 'Берлине', 'Хельсинки', 'Мельбурне', 'Риме', 'Токио', 'Мехико', 'Мюнхене', 'Монреале', 'Москве', 'Сеуле', 'Барселоне', 'Атланте', 'Сиднее', 'Пекине', 'Рио-де-Жанейро', 'Лос-Анджелесе', 'Брисбене']);
  const go = (mod, risk) => () => {
    if (risk && chance(0.12)) { sp.inj = 1; eff({ health: -12 }); return `🤕 Вы рискнули и получили травму прямо в финале. Без медали.`; }
    const sc = sp.rating + rnd(-18, 14) + mod;
    S.olympics = (S.olympics || 0) + 1;
    if (sc >= 94) { sp.gold++; unlock('olympgold'); S.money += Math.round(price(5000000) * moneyK()); S.fameBonus = (S.fameBonus || 0) + 12; eff({ happy: 25 }); sfx('ach'); return `🥇 ЗОЛОТО! Гимн вашей страны звучит в честь вас. ${d.n}, Олимпиада-${S.year}.`; }
    if (sc >= 86) { sp.silver++; S.money += Math.round(price(1500000) * moneyK()); S.fameBonus = (S.fameBonus || 0) + 6; eff({ happy: 12 }); return `🥈 Серебро Олимпийских игр! Совсем чуть-чуть до золота.`; }
    if (sc >= 79) { sp.bronze++; S.money += Math.round(price(700000) * moneyK()); S.fameBonus = (S.fameBonus || 0) + 4; eff({ happy: 8 }); return `🥉 Бронза Олимпиады! Вы на пьедестале.`; }
    eff({ happy: -8 }); return `😔 Олимпиада: ${rnd(4, 12)}-е место. До медали не дотянули.`;
  };
  ev('🏟️', `Олимпийские игры ${S.year}`, `Вы в составе сборной на Играх в ${city}. Финал через час. Какая тактика?`, [
    { t: '💯 Выложиться на сто процентов', f: go(3, false) }, { t: '🧠 Холодный расчёт', f: go(0, false) }, { t: '🎲 Рискнуть ради золота', f: go(9, true) }]);
}
CAREER_HOOKS.push((l) => item(l, { e: S.sport ? sportDef().e : '🏅', t: 'Спорт', d: S.sport ? `${S.sport.retired ? 'В прошлом' : SPORT_LVL[S.sport.lvl]} · 🥇${S.sport.gold} 🏆${S.sport.worlds}` : 'Секции, профи, сборная, Олимпиады', onClick: () => openPanel('sport') }));
ACTIVITIES.push({ id: 'sportp', cat: 'Тело и здоровье', e: '🏅', t: 'Спортивная карьера', d: 'Секция, клуб, сборная, Олимпиады', min: 5, run: () => { setTimeout(() => openPanel('sport'), 30); return null; } });

/* ====================== 🕴️ КРИМИНАЛЬНЫЙ МИР ====================== */
const MOB_RANKS = ['Шестёрка', 'Боец', 'Бригадир', 'Смотрящий', 'Правая рука', 'Босс'];
const MOB_AUTH = [0, 15, 35, 55, 75, 92];
const GANGS = ['«Чёрные волки»', 'синдикат «Ворон»', '«Портовые»', 'семья Марчелли', '«Тройка с Заречной»', '«Бархатные перчатки»', '«Железный круг»', '«Ночные короли»', 'клан «Скорпион»', '«Северный ветер»'];
const MOB_JOBS = [
  { id: 'tribute', r: 0, e: '💰', t: 'Собрать дань с ларьков', min: 30000, max: 150000, risk: 0.06, heat: 6, auth: 3 },
  { id: 'parcel', r: 0, e: '📦', t: 'Отвезти «посылку»', min: 50000, max: 300000, risk: 0.08, heat: 7, auth: 4 },
  { id: 'cars', r: 1, e: '🚘', t: 'Угнать партию машин', min: 400000, max: 2000000, risk: 0.12, heat: 12, auth: 6 },
  { id: 'market', r: 2, e: '🏪', t: 'Взять рынок под «крышу»', min: 1000000, max: 5000000, risk: 0.1, heat: 10, auth: 8 },
  { id: 'smuggle', r: 2, e: '🚢', t: 'Контрабанда через порт', min: 2000000, max: 12000000, risk: 0.14, heat: 14, auth: 9 },
  { id: 'cash', r: 3, e: '🚚', t: 'Налёт на инкассаторов', min: 8000000, max: 40000000, risk: 0.22, heat: 22, auth: 12 },
  { id: 'casino', r: 3, e: '🎰', t: 'Подпольное казино', min: 5000000, max: 25000000, risk: 0.1, heat: 12, auth: 8 },
  { id: 'factory', r: 4, e: '🏭', t: 'Рейдерский захват завода', min: 30000000, max: 150000000, risk: 0.18, heat: 20, auth: 12 }
];
const mobOK = () => S.mob && !S.mob.out;
function mobJoin() {
  S.mob = { gang: pick(GANGS), rank: 0, auth: 5, heat: 0, years: 0, lawyer: 0, earned: 0, crew: 0 };
  eff({ karma: -8 }); S.crimes = (S.crimes || 0) + 1;
  return `🕴️ Вас приняли в ${S.mob.gang}. Отсюда так просто не уходят.`;
}
EXTRA_TITLES.mob = '🕴️ Криминальный мир';
EXTRA_PANELS.mob = function () {
  const B = $('#sheetBody'); const M = S.mob;
  if (!M || M.out) {
    card(`<div class="muted">Тёмная сторона</div><div class="big">${M && M.out ? 'Вы вышли из дела' : 'Вы не в банде'}</div><div class="muted">Деньги быстрые, но тюрьма, разборки и полиция рядом.</div>`);
    if (!M && S.age >= 14 && !S.prison) btnRow(B, [{ t: '🕴️ Вступить в банду', cls: 'danger', f: act(() => mobJoin()) }]);
    return;
  }
  const next = MOB_AUTH[M.rank + 1];
  card(`<div class="muted">${esc(M.gang)}</div><div class="big">${MOB_RANKS[M.rank]}</div><div class="muted">Авторитет ${M.auth}/100${next ? ` · до повышения ${Math.max(0, next - M.auth)}` : ''}</div><div class="bar-mini"><em style="width:${M.auth}%"></em></div><div class="muted">🚨 Внимание полиции: ${M.heat}% · 👥 бойцов: ${M.crew} · ⚖️ адвокат: ${['нет', 'опытный', 'звёздный'][M.lawyer]}</div><div class="bar-mini heat"><em style="width:${M.heat}%"></em></div>`);
  if (S.prison) { B.appendChild(el('<div class="empty">Вы за решёткой. Банда помнит о вас и греет передачками.</div>')); return; }
  const l = section('Дела');
  for (const j of MOB_JOBS.filter((x) => x.r <= M.rank)) item(l, { e: j.e, t: j.t, d: `${fmt(price(j.min))}–${fmt(price(j.max))} · риск ${Math.round((j.risk + M.heat / 400) * 100)}%`, disabled: S.used['mob_' + j.id], onClick: act(() => {
    S.used['mob_' + j.id] = 1; M.heat = clamp(M.heat + j.heat); eff({ karma: -rnd(3, 7) }); S.crimes = (S.crimes || 0) + 1;
    if (chance(j.risk + M.heat / 400)) { M.auth = clamp(M.auth - 5); crimeCaught(j.t, Math.ceil(j.heat / 4)); return ['🚨', 'Облава!', 'Дело сорвалось, вас взяли с поличным.']; }
    if (chance(0.06)) { eff({ health: -rnd(10, 30) }); return ['🔫', 'Перестрелка', 'Всё пошло не по плану. Вы ранены, но живы.']; }
    const g = Math.round(price(rnd(j.min, j.max)) * (1 - 0.3 * (M.rank < 5))); S.money += g; M.earned += g; M.auth = clamp(M.auth + j.auth);
    eff({ happy: 4 }); return ['🤑', 'Дело сделано', `${j.t}: ваша доля ${fmt(g)}. Авторитет растёт.`];
  }) });
  const l2 = section('Связи');
  const bribe = price(500000 + M.rank * 400000);
  item(l2, { e: '🤝', t: 'Занести полиции', d: `${fmt(bribe)} · −35% внимания`, disabled: S.used.mob_bribe || S.money < bribe, onClick: act(() => { S.used.mob_bribe = 1; S.money -= bribe; if (chance(0.12)) { crimeCaught('Дача взятки должностному лицу', 3); return ['🚨', 'Подстава', 'Полицейский оказался честным.']; } M.heat = clamp(M.heat - 35); return '🤝 «Вопрос решён». Полиция смотрит в другую сторону.'; }) });
  item(l2, { e: '🕳️', t: 'Залечь на дно', d: '−20% внимания, но без дохода', disabled: S.used.mob_hide, onClick: act(() => { S.used.mob_hide = 1; M.heat = clamp(M.heat - 20); for (const j of MOB_JOBS) S.used['mob_' + j.id] = 1; eff({ happy: -3 }); return '🕳️ Вы залегли на дно на этот год.'; }) });
  item(l2, { e: '⚖️', t: M.lawyer < 2 ? `Нанять ${M.lawyer ? 'звёздного' : 'опытного'} адвоката` : 'Звёздный адвокат на зарплате', d: M.lawyer < 2 ? `${fmt(price(M.lawyer ? 3000000 : 800000))} в год · спасёт в суде` : 'Лучшая защита в стране', disabled: M.lawyer >= 2, onClick: act(() => { M.lawyer++; return `⚖️ У вас теперь ${M.lawyer === 2 ? 'звёздный' : 'опытный'} адвокат. Он берёт много, но дела выигрывает.`; }) });
  if (M.rank >= 2) item(l2, { e: '👥', t: 'Набрать бойцов', d: `${fmt(price(300000))} · пассивный доход и защита`, disabled: S.used.mob_crew || S.money < price(300000), onClick: act(() => { S.used.mob_crew = 1; S.money -= price(300000); M.crew += rnd(2, 5); M.heat = clamp(M.heat + 4); return `👥 Ваша бригада выросла: ${M.crew} человек.`; }) });
  item(l2, { e: '🚪', t: 'Выйти из дела', d: 'Отпустят не всех', onClick: () => { Q.push({ e: '🚪', title: 'Уйти из банды?', text: 'Чем выше ранг, тем опаснее. Можно откупиться или исчезнуть.', choices: [
    { t: `💼 Откупиться (${fmt(price(1000000 * (M.rank + 1)))})`, disabled: S.money < price(1000000 * (M.rank + 1)), f: () => { S.money -= price(1000000 * (M.rank + 1)); M.out = true; eff({ karma: 6, happy: 8 }); return '🚪 Вы откупились и вышли из дела. Начинаете честную жизнь.'; } },
    { t: '🌫️ Просто исчезнуть', f: () => { if (chance(0.25 + M.rank * 0.12)) { if (chance(0.3)) { die('Расправа бывших подельников'); return 'Бывшие друзья нашли вас.'; } eff({ health: -25 }); return '🔪 Вас нашли и «поговорили». Едва выжили, но вы свободны.'; } M.out = true; eff({ happy: 5 }); return '🌫️ Вы сменили номер и уехали. Банда забыла о вас.'; } },
    { t: 'Остаться', f: () => null }] }); pump(); } });
};
YEAR_HOOKS.push(() => {
  const M = S.mob;
  if (!M && S.age >= 15 && S.age <= 35 && S.karma < 40 && !S.prison && chance(0.05)) ev('🕴️', 'Предложение', `Человек в кожаной куртке предлагает «непыльную работу» в ${pick(GANGS)}.`, [
    { t: 'Согласиться', f: () => mobJoin() }, { t: 'Отказаться', f: () => { eff({ karma: 3 }); return 'Вы вежливо отказались.'; } }]);
  if (!mobOK()) return;
  M.years++; M.heat = clamp(M.heat - 6);
  if (M.lawyer) S.money -= price(M.lawyer === 2 ? 3000000 : 800000);
  if (S.prison) { M.auth = clamp(M.auth + 3); return; }
  if (M.rank >= 2) { const inc = price(200000 * M.rank + M.crew * 120000); S.money += inc; if (chance(0.4)) log(`💼 Доля с «точек» бригады: ${fmt(inc)}.`, 'info'); }
  if (M.rank < 5 && M.auth >= MOB_AUTH[M.rank + 1]) {
    const nr = M.rank + 1;
    if (nr === 5) ev('👑', 'Кто будет боссом?', 'Старый босс сдал. Вы можете занять его место, но придётся убрать конкурентов.', [
      { t: '👑 Взять власть', f: () => { if (chance(0.55 + M.crew / 60)) { M.rank = 5; unlock('godfather'); S.fameBonus = (S.fameBonus || 0) + 5; return `👑 Вы теперь босс: ${M.gang}. Город у ваших ног.`; } eff({ health: -20 }); M.auth = clamp(M.auth - 20); return '🔫 Переворот провалился. Вы ранены и потеряли авторитет.'; } },
      { t: 'Остаться правой рукой', f: () => 'Вы решили не лезть на трон.' }]);
    else { M.rank = nr; log(`🕴️ Повышение в банде: теперь вы ${MOB_RANKS[nr].toLowerCase()}.`, 'info'); }
  }
  if (M.rank >= 1 && chance(0.1)) ev('🔫', 'Война банд', `Конкуренты из ${pick(GANGS.filter((g) => g !== M.gang))} заявились на вашу территорию.`, [
    { t: '🔫 Дать бой', f: () => { if (chance(0.5 + M.crew / 50)) { M.auth = clamp(M.auth + 10); M.heat = clamp(M.heat + 15); return '🔫 Вы отбили территорию. Ваш авторитет взлетел.'; } if (chance(0.12)) { die('Убит в бандитской разборке'); return 'Разборка закончилась трагически.'; } eff({ health: -rnd(15, 30) }); M.auth = clamp(M.auth - 8); return '🩸 Тяжёлое поражение. Вы в больнице.'; } },
    { t: '🤝 Договориться', f: () => { const c = price(500000 * (M.rank + 1)); S.money -= c; M.auth = clamp(M.auth - 3); return `🤝 Вы поделили сферы влияния. Это стоило ${fmt(c)}.`; } },
    { t: '🕳️ Отсидеться', f: () => { M.auth = clamp(M.auth - 10); return 'Вас посчитали трусом.'; } }]);
  if (M.heat > 60 && chance(M.heat / 300)) { log('🚔 Полиция провела обыск. Вас задержали.', 'bad'); crimeCaught('Организация преступного сообщества', 4 + M.rank); }
});
/* суды: адвокаты, сделка, присяжные, апелляция */
crimeCaught = function (crimeName, baseYears) {
  unlock('prison');
  const M = mobOK() ? S.mob : null;
  const yrsAsk = baseYears + 1;
  const appeal = (years) => {
    Q.push({ e: '⚖️', title: 'Приговор', text: `Суд признал вас виновным: ${crimeName}. Срок: ${yrs(years)}.`, choices: [
      { t: `📑 Подать апелляцию (${fmt(price(200000))})`, f: () => { S.money -= price(200000); if (chance(0.3)) { const ny = Math.max(1, Math.floor(years / 2)); return `📑 Апелляция частично удовлетворена! ${jail(crimeName, ny)}`; } return `📑 Апелляцию отклонили. ${jail(crimeName, years)}`; } },
      { t: 'Принять приговор', f: () => jail(crimeName, years) }] });
    return null;
  };
  const trial = (win, label) => () => {
    if (chance(win)) { eff({ happy: 8 }); if (M) M.heat = clamp(M.heat - 10); return `⚖️ ${label}: присяжные вынесли оправдательный вердикт! Вы свободны.`; }
    return appeal(baseYears + (label === 'Бесплатный защитник' ? 1 : 0));
  };
  const ch = [];
  if (M && M.lawyer) ch.push({ t: `💼 Ваш ${M.lawyer === 2 ? 'звёздный' : 'опытный'} адвокат`, f: trial(M.lawyer === 2 ? 0.72 : 0.5, 'Адвокат банды') });
  ch.push({ t: `👔 Опытный адвокат (${fmt(price(300000))})`, disabled: S.money < price(300000), f: () => { S.money -= price(300000); return trial(0.45, 'Опытный адвокат')(); } });
  if (S.money >= price(3000000)) ch.push({ t: `⭐ Звёздный адвокат (${fmt(price(3000000))})`, f: () => { S.money -= price(3000000); return trial(0.7, 'Звёздный адвокат')(); } });
  ch.push({ t: '🤝 Сделка со следствием', f: () => {
    if (M) { M.out = true; M.rat = true; S.mob = M; log('🐀 Вы дали показания на подельников. Банда этого не простит.', 'bad'); return jail(crimeName, Math.max(1, Math.floor(baseYears / 2))); }
    return jail(crimeName, Math.max(1, baseYears - 1));
  } });
  if ((M && M.rank >= 2) || (S.karma < 30 && S.money >= price(2000000))) ch.push({ t: `💵 «Договориться» с судьёй (${fmt(price(2000000))})`, disabled: S.money < price(2000000), f: () => { S.money -= price(2000000); if (chance(M ? 0.6 : 0.45)) return '💵 Дело неожиданно развалилось «за отсутствием состава».'; return appeal(baseYears + 2); } });
  ch.push({ t: '🧑‍⚖️ Бесплатный защитник', f: trial(0.15, 'Бесплатный защитник') });
  Q.push({ e: '⚖️', title: 'Суд', text: `Вас обвиняют: ${crimeName}. Прокурор требует ${yrs(yrsAsk)}. Кто будет защищать?`, choices: ch });
};
YEAR_HOOKS.push(() => { if (S.mob && S.mob.rat && !S.prison && chance(0.12)) { if (chance(0.25)) die('Месть бывших подельников'); else { eff({ health: -15, happy: -10 }); log('🐀 Вам передали «привет» от бывших подельников. Вы еле унесли ноги.', 'bad'); } } });
CAREER_HOOKS.push((l) => item(l, { e: '🕴️', t: 'Криминальный мир', d: mobOK() ? `${MOB_RANKS[S.mob.rank]} · ${S.mob.gang}` : 'Банды, «дела», суды и адвокаты', onClick: () => openPanel('mob') }));

/* ====================== 🔬 НАУКА И ИЗОБРЕТЕНИЯ ====================== */
const SCI_FIELDS = [
  { id: 'phys', e: '⚛️', n: 'Физика', prize: 'Нобелевская премия по физике', py: 1901, disc: [['эффект сверхпроводимости при комнатной температуре', 1990], ['новую элементарную частицу', 1930], ['закон поведения квантовых систем', 1920], ['способ управляемого термоядерного синтеза', 2025], ['источник тёмной энергии', 2030], ['новый вид излучения', 1900]] },
  { id: 'chem', e: '🧪', n: 'Химия', prize: 'Нобелевская премия по химии', py: 1901, disc: [['новый химический элемент', 1900], ['катализатор, удешевляющий удобрения', 1910], ['пластик, который разлагается за месяц', 1980], ['сверхёмкую батарею', 2000], ['материал прочнее алмаза', 2010]] },
  { id: 'med', e: '🧬', n: 'Медицина', prize: 'Нобелевская премия по медицине', py: 1901, disc: [['новый антибиотик', 1925], ['вакцину от опасной болезни', 1900], ['механизм старения клеток', 1980], ['лекарство от редкой формы рака', 1990], ['способ выращивать органы', 2020], ['таблетку от болезни Альцгеймера', 2030]] },
  { id: 'math', e: '📐', n: 'Математика', prize: 'Филдсовская премия', py: 1936, disc: [['доказательство знаменитой гипотезы', 1900], ['новую ветвь топологии', 1920], ['алгоритм быстрого разложения чисел', 1970], ['решение задачи тысячелетия', 2000]] },
  { id: 'cs', e: '💻', n: 'Информатика', prize: 'Премия Тьюринга', py: 1966, yr: 1945, disc: [['новый язык программирования', 1955], ['алгоритм сжатия данных', 1970], ['архитектуру нейросетей', 1990], ['квантовый алгоритм', 2000], ['безопасный искусственный интеллект', 2025]] },
  { id: 'econ', e: '📈', n: 'Экономика', prize: 'Нобелевская премия по экономике', py: 1969, yr: 1920, disc: [['теорию поведения рынков', 1930], ['модель борьбы с инфляцией', 1950], ['теорию поведенческих ошибок', 1970], ['модель экономики без бедности', 2010]] },
  { id: 'astro', e: '🔭', n: 'Астрономия', prize: 'Нобелевская премия по физике', py: 1901, disc: [['новую комету', 1900], ['планету у соседней звезды', 1995], ['признаки жизни на спутнике Юпитера', 2030], ['гравитационные волны от далёких звёзд', 2010], ['новую галактику', 1920]] }
];
const INVENTIONS = [
  ['складной зонт', 1900, 1960], ['самоочищающуюся сковороду', 1940], ['механическую овощерезку', 1900, 1990], ['карманный фонарик на динамо', 1900, 1970], ['застёжку-липучку для обуви', 1950],
  ['электрическую зубную щётку', 1955], ['детское автокресло', 1960], ['кухонный таймер-яйцо', 1930], ['портативный радиоприёмник', 1950, 1990], ['калькулятор-часы', 1975, 2005],
  ['GPS-ошейник для собак', 2005], ['приложение для поиска парковки', 2010], ['умную бутылку', 2015], ['дрон для доставки лекарств', 2015], ['гибкий экран', 2018],
  ['голографический телефон', 2035], ['домашний 3D-принтер еды', 2030], ['очки-переводчик', 2028], ['личного робота-повара', 2040], ['антигравитационный скейт', 2050]
];
const sciField = () => SCI_FIELDS.find((f) => f.id === S.sci.field);
const sciPro = () => (S.job && ['scientist', 'doctor', 'engineer', 'dev'].includes(S.job.id)) || ['master', 'phd'].includes(S.edu.level) || S.edu.stage === 'phd';
EXTRA_TITLES.science = '🔬 Наука и изобретения';
EXTRA_PANELS.science = function () {
  const B = $('#sheetBody');
  S.patents = S.patents || 0; S.inventions = S.inventions || [];
  const X = S.sci;
  if (X) {
    const f = sciField();
    card(`<div class="muted">${f.e} ${f.n}</div><div class="big">${X.disc.length ? `${X.disc.length} ${plural(X.disc.length, ['открытие', 'открытия', 'открытий'])}` : 'Исследователь'}</div><div class="muted">📄 Статей: ${X.papers} · 📈 цитирований: ${X.cites.toLocaleString('ru-RU')} · 💡 патентов: ${S.patents}</div>${X.named.length ? `<div class="muted">🏷️ Названо вашим именем: ${X.named.map(esc).join(', ')}</div>` : ''}${S.nobel ? `<div class="muted">🏅 ${esc(f.prize)}, ${S.nobel}</div>` : ''}`);
    if (X.disc.length) { const l = section('Открытия'); for (const d of X.disc) item(l, { e: d.big ? '🌟' : '🔹', t: d.n, d: `${d.y}${d.name ? ` · «${d.name}»` : ''}` }); }
  } else card(`<div class="muted">Наука</div><div class="big">${sciPro() ? 'Можно начать научную карьеру' : 'Изобретатель-любитель'}</div><div class="muted">${sciPro() ? 'Выберите область. Открытия, статьи, именные эффекты и, может быть, Нобелевская премия.' : 'Для науки нужна работа учёным, врачом, инженером или программистом, либо магистратура. Изобретать можно всем!'}</div>`);
  if (S.prison) return;
  if (!X && sciPro()) { const l = section('Выбрать область'); for (const f of SCI_FIELDS.filter((x) => !x.yr || S.year >= x.yr)) item(l, { e: f.e, t: f.n, d: f.prize, onClick: act(() => { S.sci = { field: f.id, papers: 0, cites: 0, disc: [], named: [], years: 0 }; return `${f.e} Вы посвятили себя науке: ${f.n.toLowerCase()}.`; }) }); }
  if (X && sciPro()) {
    const l = section('Исследования');
    item(l, { e: '🔬', t: 'Надёжный проект', d: 'Статьи и цитирования', disabled: S.used.sci_r, onClick: act(() => { S.used.sci_r = 1; const p = rnd(1, 3); X.papers += p; X.cites += rnd(10, 60) * p; eff({ smarts: 2 }); return `📄 Вы опубликовали ${p} ${plural(p, ['статью', 'статьи', 'статей'])}.`; }) });
    item(l, { e: '🚀', t: 'Прорывной проект', d: 'Шанс на открытие, но можно потратить год впустую', disabled: S.used.sci_r, onClick: act(() => { S.used.sci_r = 1; return sciBreak(); }) });
    item(l, { e: '💶', t: 'Подать заявку на грант', d: 'Деньги на лабораторию', disabled: S.used.sci_g, onClick: act(() => { S.used.sci_g = 1; if (chance(0.3 + X.papers / 100)) { const g = price(rnd(5, 40) * 100000); S.money += g; X.grant = 2; return `💶 Грант одобрен: ${fmt(g)}. Следующие два года шансы на открытие выше.`; } return '💶 В гранте отказали. «Недостаточно актуально».'; }) });
    item(l, { e: '🎤', t: 'Выступить на конференции', d: '+цитирования, связи', disabled: S.used.sci_c, onClick: act(() => { S.used.sci_c = 1; X.cites += rnd(50, 400); const c = pick(COUNTRIES.filter((x) => x.id !== S.country)); if (!S.visited.includes(c.id)) S.visited.push(c.id); eff({ happy: 4 }); return `🎤 Ваш доклад в стране ${c.name} собрал полный зал.`; }) });
  }
  const li = section('Изобретения');
  const ideas = INVENTIONS.filter(([n, y, to]) => S.year >= y && (!to || S.year <= to) && !S.inventions.includes(n));
  item(li, { e: '💡', t: 'Изобрести что-нибудь', d: 'Шанс зависит от ума и навыков', disabled: S.used.inv || S.age < 10 || !ideas.length, onClick: act(() => {
    S.used.inv = 1; const idea = pick(ideas)[0];
    if (!chance(0.15 + S.stats.smarts / 200 + skillOf('code') / 500)) { eff({ happy: -2 }); return `🔧 Вы пытались создать ${idea}, но прототип взорвался. Ничего, Эдисон тоже ошибался.`; }
    S.inventions.push(idea);
    Q.push({ e: '💡', title: 'Получилось!', text: `Вы изобрели ${idea}. Что дальше?`, choices: [
      { t: `📜 Запатентовать (${fmt(price(60000))})`, f: () => { S.money -= price(60000); if (chance(0.75)) { S.patents++; unlock('patent'); if (S.patents >= 5) unlock('inventor5'); S.royalty = (S.royalty || 0) + price(rnd(20, 200) * 1000); return `📜 Патент №${rnd(100000, 999999)} выдан! Компании платят вам роялти.`; } return '📜 Патентное бюро нашло похожее изобретение 1987 года. Отказ.'; } },
      { t: `💰 Продать идею компании`, f: () => { const g = price(rnd(2, 30) * 100000); S.money += g; return `💰 Вы продали права за ${fmt(g)}.`; } },
      { t: '🎁 Подарить миру бесплатно', f: () => { eff({ karma: 8, happy: 5 }); S.fameBonus = (S.fameBonus || 0) + 2; return '🎁 Вы выложили чертежи в открытый доступ. Мир благодарен.'; } }] });
    return null;
  }) });
  if (S.inventions.length) B.appendChild(el(`<div class="muted" style="padding:6px 4px">Ваши изобретения: ${S.inventions.map(esc).join(', ')}</div>`));
};
function sciBreak() {
  const X = S.sci; const f = sciField();
  const p = 0.08 + Math.max(0, S.stats.smarts - 55) / 250 + X.papers / 300 + (X.grant ? 0.08 : 0) + (S.genes?.includes('bright') ? 0.04 : 0);
  if (!chance(p)) { eff({ happy: -3 }); return '🧪 Год экспериментов не дал результата. Наука — это терпение.'; }
  const pool = f.disc.filter(([n, y]) => S.year >= y && !X.disc.some((d) => d.n === n));
  const [n] = pool.length ? pick(pool) : [`новый результат в области «${f.n}»`];
  const big = chance(0.45);
  const d = { n, y: S.year, big }; X.disc.push(d); X.papers += 2; X.cites += big ? rnd(3000, 15000) : rnd(300, 2000);
  S.fameBonus = (S.fameBonus || 0) + (big ? 6 : 2); unlock('discovery'); eff({ happy: 15, smarts: 3 });
  const kind = { phys: 'Эффект', chem: 'Реакция', med: 'Метод', math: 'Теорема', cs: 'Алгоритм', econ: 'Модель', astro: 'Комета' }[f.id];
  let nm = `${kind} ${S.surname}`; let k = 2; while (X.named.includes(nm)) nm = `${kind} ${S.surname}–${k++}`;
  Q.push({ e: f.e, title: big ? 'Великое открытие!' : 'Открытие!', text: `Вы открыли ${n}. Коллеги предлагают дать открытию имя.`, choices: [
    { t: `🏷️ «${nm}»`, f: () => { d.name = nm; X.named.push(d.name); return `🏷️ В учебники вошёл «${d.name}».`; } },
    { t: '💐 Назвать в честь мамы', f: () => { const m = S.people.find((p) => p.role === 'mother'); d.name = m ? m.name : 'Мама'; X.named.push(d.name); eff({ happy: 4 }); return `💐 Открытие носит имя «${d.name}». Мама плакала от гордости.`; } },
    { t: '🔢 Скромно, просто номер', f: () => { d.name = `${f.n.slice(0, 2).toUpperCase()}-${rnd(100, 999)}`; eff({ karma: 3 }); return 'Вы остались скромным. Коллеги вас за это уважают.'; } }] });
  return null;
}
YEAR_HOOKS.push(() => {
  if (S.royalty) { S.money += S.royalty; S.royalty = Math.round(S.royalty * 0.92); if (S.royalty < price(1000)) S.royalty = 0; }
  const X = S.sci; if (!X) return;
  X.years = (X.years || 0) + 1; if (X.grant) X.grant--;
  X.cites += Math.round(X.cites * 0.04 + X.papers * 3);
  const f = sciField(); const big = X.disc.filter((d) => d.big).length;
  if (!S.nobel && big && S.year >= f.py && S.age >= 30 && chance(0.03 * big + X.cites / 400000)) {
    ev('📞', 'Звонок из Стокгольма', `Вам присуждена ${f.prize} за ${X.disc.find((d) => d.big).n}!`, [
      { t: '🎤 Прочитать нобелевскую лекцию', f: () => { S.nobel = S.year; unlock('nobel'); const g = price(80000000); S.money += g; S.fameBonus = (S.fameBonus || 0) + 20; eff({ happy: 30 }); return `🏅 ${f.prize}! Вы получили ${fmt(g)} и мировое признание.`; } },
      { t: '💝 Отдать премию на благотворительность', f: () => { S.nobel = S.year; unlock('nobel'); S.fameBonus = (S.fameBonus || 0) + 25; eff({ happy: 25, karma: 20 }); return `🏅 ${f.prize}! Все деньги вы отдали детским больницам.`; } }]);
  }
});
CAREER_HOOKS.push((l) => item(l, { e: '🔬', t: 'Наука и изобретения', d: S.sci ? `${sciField().n} · открытий ${S.sci.disc.length} · патентов ${S.patents || 0}` : 'Открытия, патенты, Нобелевская премия', onClick: () => openPanel('science') }));
ACTIVITIES.push({ id: 'sciact', cat: 'Разум и дух', e: '💡', t: 'Изобретать и исследовать', d: 'Патенты, открытия, премии', min: 10, run: () => { setTimeout(() => openPanel('science'), 30); return null; } });

/* ====================== 🎨 ТВОРЧЕСТВО ====================== */
const WORK_T = [
  { id: 'book', e: '📚', n: 'Книга', skill: 'write', min: 12, cost: 0, sale: 400000, genres: ['Роман', 'Детектив', 'Фантастика', 'Фэнтези', 'Поэзия', 'Мемуары', 'Детская книга', 'Нон-фикшн'] },
  { id: 'album', e: '💿', n: 'Музыкальный альбом', skill: 'music', min: 12, yr: 1910, cost: 300000, sale: 600000, genres: ['Поп', 'Рок', 'Джаз', 'Рэп', 'Электроника', 'Классика', 'Фолк', 'Инди'] },
  { id: 'painting', e: '🖼️', n: 'Картина', skill: 'art', min: 8, cost: 20000, sale: 150000, genres: ['Портрет', 'Пейзаж', 'Абстракция', 'Натюрморт', 'Стрит-арт'] },
  { id: 'film', e: '🎬', n: 'Фильм', skill: 'acting', min: 18, yr: 1910, cost: 3000000, sale: 3000000, genres: ['Драма', 'Комедия', 'Боевик', 'Ужасы', 'Мелодрама', 'Арт-хаус', 'Документальный', 'Мультфильм'] },
  { id: 'game', e: '🕹️', n: 'Видеоигра', skill: 'code', min: 14, yr: 1980, cost: 1000000, sale: 2000000, genres: ['Платформер', 'RPG', 'Шутер', 'Головоломка', 'Стратегия', 'Инди-приключение'] }
];
const TITLE_A = ['Последний', 'Тихий', 'Красный', 'Невидимый', 'Северный', 'Стеклянный', 'Бесконечный', 'Забытый', 'Золотой', 'Ночной', 'Дикий', 'Седьмой'];
const TITLE_B = ['город', 'берег', 'сад', 'поезд', 'горизонт', 'свет', 'дом', 'ветер', 'океан', 'танец', 'шторм', 'маяк'];
const TITLE_C = ['Сто дней', 'Письма', 'Тени', 'Сны', 'Песни', 'Огни', 'Дети', 'Следы'];
const TITLE_D = ['ушедшего лета', 'большого города', 'старого маяка', 'чужой земли', 'последней зимы', 'тёплого моря', 'одной семьи', 'пустых улиц'];
const workTitle = () => (chance(0.5) ? `${pick(TITLE_A)} ${pick(TITLE_B)}` : `${pick(TITLE_C)} ${pick(TITLE_D)}`);
const hotGenre = (t) => t.genres[Math.floor(S.year / 10) % t.genres.length];
function reviews(r, t) {
  const good = ['«Шедевр, который останется на десятилетия»', '«Смело, тонко, по-настоящему»', '«Лучшее, что я видел(а) за год»', '«Автор — голос поколения»', '«Невозможно оторваться»'];
  const mid = ['«Крепко, но без откровений»', '«Есть удачные моменты»', '«Для поклонников жанра»', '«Обещающе, ждём следующую работу»'];
  const bad = ['«Скучно и вторично»', '«Зря потраченное время»', '«Автору стоит взять паузу»', '«Даже обложка лучше содержания»'];
  const pool = r >= 8 ? good : r >= 5 ? mid : bad;
  const who = ['Критик «Вестника»', 'Блогер-обозреватель', 'Журнал «Культура»', t.id === 'film' ? 'Кинокритик' : t.id === 'album' ? 'Музыкальный журнал' : 'Литературный обозреватель'];
  return pool.slice().sort(() => Math.random() - 0.5).slice(0, 2).map((q, i) => `${who[i]}: ${q}`);
}
function createWork(t) {
  const go = (genre, effort) => {
    const cost = price(t.cost) * (effort === 2 ? 2 : 1);
    if (S.money < cost && S.age >= 18) return 'Не хватает денег на производство. 💸';
    if (S.age >= 18) S.money -= cost;
    S.used.work = 1;
    const sk = skillOf(t.skill);
    const q = clamp(Math.round(14 + sk * 0.5 + S.stats.smarts * 0.2 + rnd(-12, 25) + (effort === 2 ? 12 : effort === 0 ? -12 : 0) + (genre === hotGenre(t) ? 8 : 0) + (S.talent === t.skill ? 6 : 0)));
    const rating = Math.max(1, Math.min(10, Math.round(q / 10)));
    const fame = calcFame ? calcFame() : 0;
    const sales = Math.round(t.sale * (rating / 5) ** 2.2 * (1 + fame / 25) * rf(0.5, 1.6));
    const earn = Math.round(price(sales) * moneyK());
    skills()[t.skill] = clamp(sk + rnd(3, 6)); if (S.practiced) S.practiced[t.skill] = 1;
    eff({ happy: effort === 2 ? -4 : 3, health: effort === 2 ? -3 : 0 });
    const w = { id: uid(), type: t.id, title: S._wt || workTitle(), genre, year: S.year, q, rating, earn, total: earn, rev: reviews(rating, t) };
    S._wt = null; S.works = S.works || []; S.works.push(w);
    S.money += earn; S.fameBonus = (S.fameBonus || 0) + Math.max(0, rating - 5);
    if (rating >= 9) unlock('masterpiece'); if (S.works.length >= 5) unlock('prolific');
    if (earn >= price(t.sale * 3)) { unlock('bestseller'); w.hit = true; }
    Q.push({ e: t.e, title: `«${w.title}»`, html: `<div class="muted">${t.n} · ${esc(genre)} · ${S.year}</div><div class="work-rating">${'★'.repeat(Math.round(rating / 2))}${'☆'.repeat(5 - Math.round(rating / 2))} <b>${rating}/10</b></div>${w.rev.map((r) => `<div class="review">${esc(r)}</div>`).join('')}<div class="muted">Доход за первый год: ${fmt(earn)}${w.hit ? ' · 🔥 хит!' : ''}</div>` });
    return `${t.e} Выш${t.id === 'book' || t.id === 'painting' || t.id === 'game' ? 'ла' : 'ел'} ваш${t.id === 'book' || t.id === 'painting' || t.id === 'game' ? 'а' : ''} ${t.n.toLowerCase()} «${w.title}»: ${rating}/10, доход ${fmt(earn)}.`;
  };
  Q.push({ e: t.e, title: `${t.n}: жанр`, text: `Сейчас в моде: ${hotGenre(t).toLowerCase()}. Навык: ${skillOf(t.skill)}/100.`, choices: t.genres.map((g) => ({ t: g === hotGenre(t) ? `🔥 ${g}` : g, f: () => {
    Q.push({ e: t.e, title: 'Сколько сил вложить?', text: `Название: «${S._wt || (S._wt = workTitle())}»`, choices: [
      { t: '⚡ Быстро, ради денег', f: () => go(g, 0) },
      { t: '🙂 Добросовестно', f: () => go(g, 1) },
      { t: `💎 Шедевр (двойной бюджет${t.cost ? `: ${fmt(price(t.cost) * 2)}` : ''})`, f: () => go(g, 2) },
      { t: '✏️ Своё название', f: () => { const n = prompt('Название:', S._wt || ''); if (n && n.trim()) S._wt = n.trim().slice(0, 60); createWorkEffort(t, g, go); return null; } }] });
    return null;
  } })).concat([{ t: 'Отмена', f: () => null }]) });
}
function createWorkEffort(t, g, go) {
  Q.push({ e: t.e, title: 'Сколько сил вложить?', text: `Название: «${S._wt}»`, choices: [{ t: '⚡ Быстро, ради денег', f: () => go(g, 0) }, { t: '🙂 Добросовестно', f: () => go(g, 1) }, { t: '💎 Шедевр', f: () => go(g, 2) }] });
}
EXTRA_TITLES.works = '🎨 Творчество';
EXTRA_PANELS.works = function () {
  const B = $('#sheetBody'); const W = S.works || [];
  const total = W.reduce((s, w) => s + (w.total || 0), 0);
  card(`<div class="muted">Ваше творчество</div><div class="big">${W.length ? `${W.length} ${plural(W.length, ['работа', 'работы', 'работ'])}` : 'Чистый лист'}</div><div class="muted">${W.length ? `Средняя оценка: ${(W.reduce((s, w) => s + w.rating, 0) / W.length).toFixed(1)} · заработано ${fmt(total)}` : 'Книги, альбомы, картины, фильмы и игры. Навыки — в «Талантах».'}</div>`);
  if (!S.prison) {
    const l = section('Создать');
    for (const t of WORK_T.filter((x) => (!x.yr || S.year >= x.yr))) item(l, { e: t.e, t: t.n, d: `Навык: ${skillOf(t.skill)}/100${t.cost ? ` · бюджет ${fmt(price(t.cost))}` : ''} · в моде ${hotGenre(t).toLowerCase()}`, disabled: S.used.work || S.age < t.min || (S.age >= 18 && S.money < price(t.cost)), onClick: () => { createWork(t); closeSheet(); pump(); } });
  }
  if (W.length) {
    const l2 = section('Портфолио');
    for (const w of W.slice().reverse()) { const t = WORK_T.find((x) => x.id === w.type); item(l2, { e: t.e, t: `«${w.title}»${w.hit ? ' 🔥' : ''}${w.award ? ' 🏆' : ''}`, d: `${w.genre} · ${w.year} · ${fmt(w.total)}`, r: `${w.rating}/10`, onClick: () => { Q.push({ e: t.e, title: `«${w.title}»`, html: `<div class="muted">${t.n} · ${esc(w.genre)} · ${w.year}</div><div class="work-rating">${'★'.repeat(Math.round(w.rating / 2))}${'☆'.repeat(5 - Math.round(w.rating / 2))} <b>${w.rating}/10</b></div>${w.rev.map((r) => `<div class="review">${esc(r)}</div>`).join('')}${w.award ? `<div class="muted">🏆 ${esc(w.award)}</div>` : ''}<div class="muted">Всего заработано: ${fmt(w.total)}</div>` }); pump(); } }); }
  }
};
YEAR_HOOKS.push(() => {
  const W = S.works; if (!W || !W.length) return;
  for (const w of W) {
    const age = S.year - w.year; if (age <= 0 || age > 25) continue;
    const r = Math.round(w.earn * (w.rating >= 8 ? 0.35 : 0.15) * 0.8 ** age);
    if (r > 0) { S.money += r; w.total += r; }
    if (age === 1 && w.rating >= 8 && !w.award && chance(0.35)) {
      const t = WORK_T.find((x) => x.id === w.type);
      const prize = { book: 'Литературная премия «Золотое перо»', album: 'Музыкальная премия года', painting: 'Гран-при биеннале', film: 'Главный приз кинофестиваля', game: 'Игра года' }[w.type];
      w.award = prize; unlock('award'); S.fameBonus = (S.fameBonus || 0) + 8; S.money += price(1000000);
      ev('🏆', prize, `${t.e} «${w.title}» получает главную награду!`, [{ t: '🎤 Произнести речь', f: () => { eff({ happy: 20 }); return `🏆 ${prize} за «${w.title}». Зал аплодировал стоя.`; } }, { t: '🙈 Не прийти на церемонию', f: () => { S.fameBonus += 3; return '🙈 Вы не пришли за наградой. Пресса в восторге от вашей загадочности.'; } }]);
    }
  }
});
CAREER_HOOKS.push((l) => item(l, { e: '🎨', t: 'Творчество', d: S.works && S.works.length ? `${S.works.length} работ · последняя «${S.works[S.works.length - 1].title}»` : 'Книги, альбомы, картины, фильмы, игры', onClick: () => openPanel('works') }));
ACTIVITIES.push({ id: 'worksact', cat: 'Развлечения', e: '🎨', t: 'Творить', d: 'Книга, альбом, картина, фильм или игра', min: 8, run: () => { setTimeout(() => openPanel('works'), 30); return null; } });

/* ====================== 🏘️ НЕДВИЖИМОСТЬ КАК БИЗНЕС ====================== */
const RE_T = [
  { id: 'flat', e: '🏢', n: 'Квартира под аренду', c: 6000000, y: 0.06, g: 0.03 },
  { id: 'daily', e: '🛏️', n: 'Квартира посуточно', c: 4000000, y: 0.1, g: 0.025, yr: 1990, risk: 0.12 },
  { id: 'shop', e: '🏪', n: 'Торговое помещение', c: 15000000, y: 0.09, g: 0.025 },
  { id: 'office', e: '🏬', n: 'Офисный этаж', c: 40000000, y: 0.08, g: 0.02, yr: 1950 },
  { id: 'storage', e: '🏭', n: 'Склад', c: 25000000, y: 0.1, g: 0.015 },
  { id: 'hotel', e: '🏨', n: 'Мини-отель', c: 80000000, y: 0.11, g: 0.02, risk: 0.1 },
  { id: 'land', e: '🌾', n: 'Участок под застройку', c: 10000000, y: 0, g: 0.05 },
  { id: 'mall', e: '🛍️', n: 'Торговый центр', c: 600000000, y: 0.1, g: 0.02, yr: 1960 }
];
const reDef = (u) => RE_T.find((t) => t.id === u.type) || { e: '🏗️', n: 'Жилой комплекс', y: 0.07, g: 0.03 };
EXTRA_TITLES.realty = '🏘️ Недвижимость';
EXTRA_PANELS.realty = function () {
  const B = $('#sheetBody'); const R = S.realty = S.realty || [];
  const val = R.reduce((s, u) => s + u.value, 0); const inc = R.reduce((s, u) => s + reIncome(u), 0);
  const eco = typeof economy === 'function' ? economy() : 'normal';
  card(`<div class="muted">Портфель недвижимости</div><div class="big">${fmt(val)}</div><div class="muted">${R.length} ${plural(R.length, ['объект', 'объекта', 'объектов'])} · аренда ~${fmt(inc)} в год · рынок: ${eco === 'crisis' ? '📉 кризис, цены падают' : eco === 'boom' ? '📈 бум, цены растут' : '➡️ стабильный'}</div>`);
  if (S.age < 18) { B.appendChild(el('<div class="empty">Инвестировать в недвижимость можно с 18 лет.</div>')); return; }
  for (const u of R) {
    const d = reDef(u);
    const st = u.build ? `🏗️ стройка, осталось ${yrs(u.build)}` : u.flip ? '🔨 ремонт под продажу' : u.tenant ? `🔑 сдано · ${u.tenant === 'risky' ? 'рискованный арендатор' : 'надёжный арендатор'}` : d.y ? 'пустует' : 'ждёт застройки';
    B.appendChild(el(`<div class="section-title">${d.e} ${esc(u.name)}</div>`));
    const l = el('<div class="list"></div>'); B.appendChild(l);
    item(l, { e: '📊', t: `Стоимость ${fmt(u.value)}`, d: `Куплено за ${fmt(u.price)} · ${st}`, r: `${u.value >= u.price ? '+' : ''}${Math.round((u.value / u.price - 1) * 100)}%` });
    if (u.build || u.flip) continue;
    if (d.y) item(l, { e: '🔑', t: u.tenant ? 'Сменить арендатора' : 'Сдать в аренду', d: 'Надёжный платит меньше, рискованный больше', disabled: S.used['re_t' + u.uid], onClick: () => { Q.push({ e: '🔑', title: 'Кому сдаём?', text: `${u.name}. Базовая доходность ${Math.round(d.y * 100)}% в год.`, choices: [
      { t: `🧑‍💼 Надёжный арендатор · ~${fmt(Math.round(u.value * d.y * 0.85))}`, f: () => { S.used['re_t' + u.uid] = 1; u.tenant = 'safe'; return `🔑 ${u.name}: заключён договор с надёжным арендатором.`; } },
      { t: `🎲 Рискованный арендатор · ~${fmt(Math.round(u.value * d.y * 1.3))}`, f: () => { S.used['re_t' + u.uid] = 1; u.tenant = 'risky'; return `🔑 ${u.name}: арендатор платит больше, но кто знает…`; } },
      ...(u.tenant ? [{ t: '🚪 Выселить, пусть пустует', f: () => { u.tenant = null; return 'Объект освобождён.'; } }] : []),
      { t: 'Отмена', f: () => null }] }); pump(); } });
    if (u.type !== 'land') item(l, { e: '🔨', t: 'Ремонт под перепродажу', d: `${fmt(Math.round(u.value * 0.12))} · через год можно продать дороже`, disabled: S.money < u.value * 0.12, onClick: act(() => { const c = Math.round(u.value * 0.12); S.money -= c; u.flip = 1; u.tenant = null; u.price += c; return `🔨 ${u.name}: начат ремонт под продажу.`; }) });
    else item(l, { e: '🏗️', t: 'Построить жилой комплекс', d: `${fmt(u.value * 3)} · 2 года стройки, стоимость ×5`, disabled: S.money < u.value * 3, onClick: act(() => { const c = u.value * 3; S.money -= c; u.price += c; u.build = 2; return `🏗️ На участке «${u.name}» началась стройка!`; }) });
    item(l, { e: '💰', t: `Продать за ${fmt(u.value)}`, d: `Налог с прибыли ${Math.round(taxRate() * 100)}%`, onClick: act(() => { const profit = Math.max(0, u.value - u.price); const net = u.value - Math.round(profit * taxRate()); S.money += net; S.realty = S.realty.filter((x) => x !== u); if (profit > u.price * 0.3) unlock('flipper'); return `💰 Вы продали «${u.name}» за ${fmt(net)} (после налога).`; }) });
  }
  const lb = section('Купить объект');
  for (const t of RE_T.filter((x) => !x.yr || S.year >= x.yr)) {
    const p = price(t.c);
    item(lb, { e: t.e, t: t.n, d: `${fmt(p)}${t.y ? ` · доходность ~${Math.round(t.y * 100)}%` : ' · можно застроить'}`, disabled: S.money < p || S.prison, onClick: act(() => {
      S.money -= p; const c = pick(C().cities || [S.city]);
      S.realty.push({ uid: uid(), type: t.id, name: `${t.n}, ${c}`, price: p, value: p, tenant: null });
      if (S.realty.length >= 5) unlock('landlord5'); if (t.id === 'mall') unlock('mallowner');
      return `${t.e} Вы купили: ${t.n.toLowerCase()} (${c}).`;
    }) });
  }
};
function reIncome(u) { const d = reDef(u); if (!u.tenant || u.build || u.flip) return 0; return Math.round(u.value * d.y * (u.tenant === 'risky' ? 1.3 : 0.85)); }
YEAR_HOOKS.push(() => {
  const R = S.realty; if (!R || !R.length) return;
  const eco = typeof economy === 'function' ? economy() : 'normal';
  let inc = 0;
  for (const u of R) {
    const d = reDef(u);
    const g = eco === 'crisis' ? -rf(0.08, 0.22) : eco === 'boom' ? rf(0.08, 0.2) : d.g + rf(-0.04, 0.04);
    u.value = Math.max(Math.round(u.price * 0.25), Math.round(u.value * (1 + g)));
    if (u.build) { u.build--; if (!u.build) { u.type = 'complex'; u.name = `ЖК на месте участка (${u.name.split(', ')[1] || S.city})`; u.value = Math.round(u.value * 5); unlock('developer'); log(`🏗️ Стройка завершена! Жилой комплекс стоит ${fmt(u.value)}.`, 'good'); } continue; }
    if (u.flip) { u.flip = 0; u.value = Math.round(u.value * rf(1.15, 1.4)); log(`🔨 Ремонт в объекте «${u.name}» закончен. Новая оценка: ${fmt(u.value)}.`, 'good'); continue; }
    if (u.tenant === 'risky' && chance(0.22)) {
      if (chance(0.5)) { log(`😤 Арендатор объекта «${u.name}» сбежал, не заплатив.`, 'bad'); u.tenant = null; }
      else { const c = Math.round(u.value * 0.08); S.money -= c; log(`💥 Арендатор разгромил объект «${u.name}». Ремонт: ${fmt(c)}.`, 'bad'); }
      continue;
    }
    if (d.risk && chance(d.risk)) { log(`🧾 Проверка в объекте «${u.name}»: штраф.`, 'bad'); S.money -= Math.round(u.value * 0.02); }
    inc += reIncome(u);
    S.money -= Math.round(u.value * 0.004);
  }
  if (inc) { const net = Math.round(inc * (1 - taxRate())); S.money += net; if (chance(0.3)) log(`🏘️ Доход от аренды за год: ${fmt(net)}.`, 'info'); }
});
const _netWorthR = netWorth;
netWorth = function () { return _netWorthR() + (S.realty ? S.realty.reduce((s, u) => s + u.value, 0) : 0); };
CAREER_HOOKS.push((l) => item(l, { e: '🏘️', t: 'Недвижимость', d: S.realty && S.realty.length ? `${S.realty.length} объектов · ${fmt(S.realty.reduce((s, u) => s + u.value, 0))}` : 'Аренда, перепродажа, стройка', disabled: S.age < 18, onClick: () => openPanel('realty') }));

ACHIEVEMENTS.push(
  { id: 'sportpro', e: '✍️', t: 'Профессионал', d: 'Подписать спортивный контракт' }, { id: 'olympgold', e: '🥇', t: 'Олимпийский чемпион', d: 'Выиграть золото Олимпиады' },
  { id: 'worldchamp', e: '🏆', t: 'Чемпион мира', d: 'Выиграть чемпионат мира' }, { id: 'legend', e: '🐐', t: 'Легенда спорта', d: 'Стать легендой' },
  { id: 'godfather', e: '👑', t: 'Крёстный отец', d: 'Стать боссом банды' },
  { id: 'patent', e: '📜', t: 'Патент', d: 'Получить первый патент' }, { id: 'inventor5', e: '💡', t: 'Изобретатель', d: 'Получить 5 патентов' },
  { id: 'discovery', e: '🔬', t: 'Эврика!', d: 'Совершить научное открытие' }, { id: 'nobel', e: '🏅', t: 'Лауреат', d: 'Получить Нобелевскую (или равную) премию' },
  { id: 'masterpiece', e: '💎', t: 'Шедевр', d: 'Создать работу на 9+ баллов' }, { id: 'bestseller', e: '🔥', t: 'Хит', d: 'Создать бестселлер или хит проката' },
  { id: 'prolific', e: '🖋️', t: 'Плодовитый автор', d: 'Создать 5 работ' }, { id: 'award', e: '🏆', t: 'Лауреат премии', d: 'Получить творческую премию' },
  { id: 'landlord5', e: '🏘️', t: 'Рантье', d: 'Владеть 5 объектами недвижимости' }, { id: 'developer', e: '🏗️', t: 'Девелопер', d: 'Построить жилой комплекс' },
  { id: 'flipper', e: '🔨', t: 'Флиппер', d: 'Продать объект с прибылью 30%+' }, { id: 'mallowner', e: '🛍️', t: 'Хозяин ТЦ', d: 'Купить торговый центр' }
);
