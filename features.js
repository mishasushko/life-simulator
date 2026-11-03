'use strict';
/* ===================== Таланты, привычки, мини-игры ===================== */

/* ---------- Таланты и хобби ---------- */
const SKILLS = [
  { id: 'music', e: '🎸', name: 'Музыка', verb: 'репетировали', jobs: ['musician'], min: 5, contest: 'музыкальный конкурс' },
  { id: 'sport', e: '⚽', name: 'Спорт', verb: 'тренировались', jobs: ['athlete', 'army', 'fire', 'police'], min: 5, contest: 'соревнования' },
  { id: 'art', e: '🎨', name: 'Рисование', verb: 'рисовали', jobs: ['design', 'actor'], min: 4, contest: 'художественную выставку' },
  { id: 'code', e: '💻', name: 'Программирование', verb: 'писали код', jobs: ['dev', 'engineer', 'scientist'], min: 9, yr: 1975, contest: 'хакатон' },
  { id: 'write', e: '✍️', name: 'Литература', verb: 'писали', jobs: ['journalist', 'lawyer', 'politician'], min: 7, contest: 'литературный конкурс' },
  { id: 'cook', e: '🍳', name: 'Кулинария', verb: 'готовили', jobs: ['cook'], min: 8, contest: 'кулинарное шоу' },
  { id: 'dance', e: '💃', name: 'Танцы', verb: 'танцевали', jobs: ['actor', 'model'], min: 4, contest: 'танцевальный баттл' },
  { id: 'lang', e: '🗣️', name: 'Языки', verb: 'учили языки', jobs: ['teacher', 'journalist', 'pilot', 'finance'], min: 6, contest: 'олимпиаду по языкам' },
  { id: 'acting', e: '🎭', name: 'Актёрское мастерство', verb: 'играли на сцене', jobs: ['actor', 'politician'], min: 6, contest: 'кастинг' },
  { id: 'business', e: '📈', name: 'Предпринимательство', verb: 'изучали бизнес', jobs: ['finance', 'cashier'], min: 12, contest: 'конкурс стартапов' }
];
function skills() { S.skills = S.skills || {}; return S.skills; }
function skillOf(id) { return skills()[id] || 0; }
function jobSkill(jobId) { let best = 0; for (const s of SKILLS) if (s.jobs.includes(jobId)) best = Math.max(best, skillOf(s.id)); return best; }

YEAR_HOOKS.push(function yearSkills() {
  if (!S.talent && S.age >= 1) S.talent = pick(SKILLS).id;
  if (S.age === 6 && !S.talentShown) {
    S.talentShown = true;
    const t = SKILLS.find((x) => x.id === S.talent);
    log(`🌟 Учителя заметили: у вас врождённый талант к направлению «${t.name}». Развивайте его в разделе «Таланты и хобби».`, 'good');
  }
  // навык слегка забывается без практики
  for (const s of SKILLS) { const v = skillOf(s.id); if (v > 0 && !S.practiced?.[s.id]) skills()[s.id] = Math.max(0, v - (v > 60 ? 2 : 1)); }
  S.practiced = {};
  // работа по профилю
  if (S.job) { const k = jobSkill(S.job.id); if (k > 30) S.job.perf = clamp(S.job.perf + Math.round(k / 25)); }
});

const _hire = hire;
hire = function (d, bonus) { return _hire(d, bonus + jobSkill(d.id) / 250); };

EXTRA_TITLES.hobbies = '🌟 Таланты и хобби';
EXTRA_PANELS.hobbies = function () {
  const t = SKILLS.find((x) => x.id === S.talent);
  card(`<div class="muted">Врождённый талант</div><div class="big">${S.age >= 6 && t ? `${t.e} ${t.name}` : '❔ Пока неизвестен'}</div><div class="muted">Навыки растут от практики и помогают в профессиях, конкурсах и подработке. Без практики понемногу забываются.</div>`);
  const l = section('Навыки');
  for (const s of SKILLS) {
    if (S.age < s.min || (s.yr && S.year < s.yr)) continue;
    const v = skillOf(s.id); const done = S.practiced?.[s.id];
    const n = item(l, { e: s.e, t: `${s.name}${s.id === S.talent && S.age >= 6 ? ' ⭐' : ''}`, d: done ? `Уровень ${v} · уже занимались в этом году` : `Уровень ${v} · нажмите, чтобы позаниматься`, bar: v, disabled: done || !!S.prison, onClick: act(() => practice(s)) });
    n.querySelector('.bar-mini em').style.background = 'var(--indigo)';
  }
  const pro = SKILLS.filter((s) => skillOf(s.id) >= 40);
  if (pro.length && S.age >= 14 && !S.prison) {
    const g = section('Применить талант');
    for (const s of pro) {
      item(g, { e: '🏆', t: `Участвовать: ${s.contest}`, d: S.used['contest_' + s.id] ? 'Уже участвовали в этом году' : `Шанс победы зависит от уровня (${skillOf(s.id)})`, disabled: !!S.used['contest_' + s.id], onClick: act(() => contest(s)) });
      if (skillOf(s.id) >= 60) item(g, { e: '💵', t: `Подработка: ${s.name.toLowerCase()}`, d: S.used['gig_' + s.id] ? 'Уже подрабатывали' : 'Заработать на своём умении', disabled: !!S.used['gig_' + s.id], onClick: act(() => gig(s)) });
    }
  }
};
function practice(s) {
  S.practiced = S.practiced || {}; S.practiced[s.id] = 1;
  const mult = s.id === S.talent ? 1.7 : 1;
  const v = skillOf(s.id);
  const g = Math.max(1, Math.round(rnd(4, 9) * mult * (v > 70 ? 0.6 : 1)));
  skills()[s.id] = clamp(v + g);
  eff({ happy: rnd(1, 4), smarts: ['code', 'write', 'lang', 'business'].includes(s.id) ? 1 : 0, health: s.id === 'sport' || s.id === 'dance' ? 2 : 0, looks: s.id === 'sport' ? 1 : 0 });
  if (S.stress != null) S.stress = clamp(S.stress - 3);
  const nv = skillOf(s.id);
  if (v < 50 && nv >= 50) unlock('skilled');
  if (v < 100 && nv >= 100) unlock('master');
  return [s.e, s.name, `Вы ${s.verb}. Навык +${g} (теперь ${nv}).`];
}
function contest(s) {
  S.used['contest_' + s.id] = 1;
  const v = skillOf(s.id);
  const p = clamp(v / 140 + (s.id === S.talent ? 0.1 : 0), 0.03, 0.85);
  if (chance(p)) {
    const prize = price(rnd(2, 12) * v * 1000);
    S.money += prize; S.followers += rnd(100, 3000) * Math.ceil(v / 20); eff({ happy: 15 });
    unlock('winner'); sfx('coin');
    return ['🏆', 'Победа!', `Вы выиграли ${s.contest}! Приз: ${fmt(prize)}.`];
  }
  eff({ happy: -4 }); skills()[s.id] = clamp(v + 2);
  return ['🥈', 'Не в этот раз', `Вы участвовали в конкурсе «${s.contest}», но жюри выбрало другого. Опыт всё равно пригодится (+2).`];
}
function gig(s) {
  S.used['gig_' + s.id] = 1;
  const pay = wageOf(Math.round(skillOf(s.id) * rnd(1500, 4000)));
  S.money += pay; eff({ happy: 2 }); sfx('coin');
  return ['💵', 'Подработка', `Вы заработали ${fmt(pay)} на своём умении (${s.name.toLowerCase()}).`];
}

/* ---------- Привычки и здоровье ---------- */
function habits() { S.habits = S.habits || { smoke: 0, drink: 0, sleep: 'norm' }; if (S.stress == null) S.stress = 20; return S.habits; }
YEAR_HOOKS.push(function yearHabits() {
  const h = habits();
  // стресс
  let ds = -4;
  if (S.job) ds += S.job.perf > 75 ? 6 : 3;
  if (S.edu.stage && S.edu.stage !== 'school') ds += 3;
  if (S.money < 0) ds += 6;
  if (S.prison) ds += 10;
  if (S.diseases.length) ds += 3;
  if (h.sleep === 'low') ds += 6; if (h.sleep === 'high') ds -= 3;
  if (S.pets.some((p) => p.alive)) ds -= 2;
  S.stress = clamp(S.stress + ds + rnd(-3, 3));
  if (S.stress > 75) { eff({ health: -3, happy: -5 }); if (chance(0.25)) log('😩 Вы на грани выгорания. Стресс зашкаливает.', 'bad'); }
  // привычки
  if (h.smoke > 0) { eff({ health: -Math.ceil(h.smoke / 30), looks: -1 }); S.money -= price(Math.round(h.smoke * 600)); if (chance(h.smoke / 900) && S.age > 30 && !S.diseases.some((d) => d.id === 'cancer')) { S.diseases.push({ id: 'cancer', since: S.age }); log('🚬 Курение не прошло даром: врачи нашли опухоль.', 'bad'); } }
  if (h.drink > 0) { eff({ health: -Math.ceil(h.drink / 35), smarts: h.drink > 60 ? -1 : 0 }); S.money -= price(Math.round(h.drink * 500)); if (h.drink > 60 && chance(0.12) && S.job) { S.job.perf = clamp(S.job.perf - 15); log('🍾 Вы пришли на работу с похмелья. Начальство недовольно.', 'bad'); } }
  if (h.sleep === 'low' && S.job) S.job.perf = clamp(S.job.perf + 2);
  if (h.sleep === 'low') eff({ health: -2 });
  // страховка
  if (S.insured) {
    if (S.age < 18) S.insured = false;
    else { const c = price(45000); S.money -= c; log(`🛡️ Медицинская страховка: ${fmt(c)}.`, 'info'); }
  }
});
// курение и стресс влияют на риск болезней
const _yd = yearDiseases;
yearDiseases = function () {
  const h = habits();
  if (S.stress > 70 && chance(0.15) && !S.diseases.some((d) => d.id === 'depression')) { S.diseases.push({ id: 'depression', since: S.age }); log('🌧️ Хронический стресс перерос в депрессию.', 'bad'); }
  if (h.smoke > 50 && S.age > 40 && chance(0.05) && !S.diseases.some((d) => d.id === 'heart')) { S.diseases.push({ id: 'heart', since: S.age }); log('🫀 У вас обнаружили болезнь сердца.', 'bad'); }
  _yd();
};
// страховка: врач бесплатный, клиника дешевле
(function () {
  const doc = ACTIVITIES.find((a) => a.id === 'doctor'), cl = ACTIVITIES.find((a) => a.id === 'clinic');
  if (doc) Object.defineProperty(doc, 'cost', { get: () => (S && S.insured ? 0 : 15000) });
  if (cl) Object.defineProperty(cl, 'cost', { get: () => (S && S.insured ? 150000 : 600000) });
})();

EXTRA_TITLES.health = '🫀 Здоровье и привычки';
EXTRA_PANELS.health = function () {
  const h = habits();
  card(`<div class="muted">Стресс</div><div class="big">${S.stress}/100 ${S.stress > 75 ? '😩' : S.stress > 45 ? '😐' : '😌'}</div><div class="bar-mini"><em style="width:${S.stress}%;background:${S.stress > 75 ? 'var(--bad)' : S.stress > 45 ? 'var(--warn)' : 'var(--good)'}"></em></div><div class="muted" style="margin-top:8px">Курение: ${h.smoke}% · Алкоголь: ${h.drink}% · Сон: ${{ low: 'мало', norm: 'норма', high: 'много' }[h.sleep]}${S.insured ? ' · 🛡️ застрахованы' : ''}</div>`);
  if (S.diseases.length) { const d = section('Диагнозы'); for (const x of S.diseases) item(d, { e: '🤒', t: DISEASES.find((z) => z.id === x.id).name, d: `С ${yrs(x.since)}. Лечение: «Врач» или «Частная клиника» в занятиях` }); }
  const l = section('Режим сна');
  for (const [k, e, t, d] of [['low', '🌙', 'Спать мало', 'Больше успеваете на работе, но здоровье и стресс страдают'], ['norm', '😴', 'Нормальный сон', '7–8 часов, золотая середина'], ['high', '🛌', 'Высыпаться', 'Меньше стресса, но вы чуть медленнее']]) item(l, { e, t: t + (h.sleep === k ? ' ✓' : ''), d, onClick: act(() => { h.sleep = k; return `Режим сна: ${t.toLowerCase()}.`; }) });
  if (S.age < 13) return;
  const b = section('Привычки');
  if (!h.smoke) item(b, { e: '🚬', t: 'Начать курить', d: 'Вредно, дорого и затягивает', onClick: act(() => { h.smoke = 25; eff({ happy: 2, health: -2, karma: -1 }); return 'Вы закурили первую сигарету. Начало плохой привычки.'; }) });
  else {
    item(b, { e: '🚭', t: 'Бросить курить', d: `Зависимость ${h.smoke}%: чем выше, тем тяжелее`, disabled: !!S.used.quitSmoke, onClick: act(() => { S.used.quitSmoke = 1; if (chance(1 - h.smoke / 130)) { h.smoke = 0; eff({ happy: 4, health: 4 }); unlock('quit'); return 'Вы бросили курить! Лёгкие говорят спасибо.'; } h.smoke = clamp(h.smoke - 10); eff({ happy: -5 }); return 'Сорвались через неделю. Но зависимость немного ослабла.'; }) });
    item(b, { e: '🚬', t: 'Курить больше', d: 'Снимает стресс, губит здоровье', disabled: !!S.used.smokeMore, onClick: act(() => { S.used.smokeMore = 1; h.smoke = clamp(h.smoke + 15); S.stress = clamp(S.stress - 6); return 'Пачка в день. Стресс ушёл, здоровье тоже уходит.'; }) });
  }
  if (S.age >= 16) {
    item(b, { e: '🍷', t: 'Выпить с друзьями', d: `Зависимость ${h.drink}%`, disabled: !!S.used.drink, onClick: act(() => { S.used.drink = 1; h.drink = clamp(h.drink + rnd(5, 12)); S.stress = clamp(S.stress - 8); eff({ happy: rnd(3, 8), health: -2 }); if (chance(0.08)) { eff({ health: -10 }); return 'Вечер закончился в травмпункте. Больше так не надо.'; } return 'Отличный вечер в баре.'; }) });
    if (h.drink > 30 || h.smoke > 50) item(b, { e: '🏥', t: 'Реабилитационный центр', d: `Избавиться от зависимостей · ${fmt(price(400000))}`, disabled: !!S.used.rehab, onClick: act(() => { S.used.rehab = 1; S.money -= price(400000); if (chance(0.75)) { h.drink = 0; h.smoke = 0; eff({ happy: 8, health: 8 }); unlock('quit'); return 'Курс реабилитации пройден. Вы свободны от зависимостей.'; } h.drink = clamp(h.drink - 20); return 'Помогло лишь отчасти. Попробуйте ещё.'; }) });
  }
  if (S.age >= 18) {
    const z = section('Забота о себе');
    item(z, { e: '🛡️', t: S.insured ? 'Отменить медстраховку' : 'Купить медстраховку', d: S.insured ? 'Сейчас: врач бесплатно, клиника в 4 раза дешевле' : `${fmt(price(45000))} в год: врач бесплатно, клиника в 4 раза дешевле`, onClick: act(() => { S.insured = !S.insured; return S.insured ? 'Вы оформили медицинскую страховку.' : 'Вы отказались от страховки.'; }) });
    item(z, { e: '🩸', t: 'Сдать кровь', d: '+карма, спасаете жизни', disabled: !!S.used.blood || S.stats.health < 40, onClick: act(() => { S.used.blood = 1; S.donations = (S.donations || 0) + 1; eff({ karma: 5, health: -1 }); if (S.donations >= 10) unlock('donor'); return `Вы сдали кровь в ${S.donations}-й раз. Спасибо!`; }) });
    item(z, { e: '🏖️', t: 'Взять отпуск и отдохнуть', d: 'Сильно снижает стресс', disabled: !!S.used.rest, onClick: act(() => { S.used.rest = 1; S.stress = clamp(S.stress - 25); eff({ happy: 6 }); if (S.job) S.job.perf = clamp(S.job.perf - 3); return 'Две недели тишины. Голова снова ясная.'; }) });
  }
};
ACTIVITIES.unshift(
  { id: 'healthp', cat: 'Тело и здоровье', e: '🫀', t: 'Здоровье и привычки', d: 'Стресс, сон, курение, страховка', min: 0, run: () => { delete S.used.healthp; setTimeout(() => openPanel('health'), 10); return null; } },
  { id: 'hobbiesp', cat: 'Тело и здоровье', e: '🌟', t: 'Таланты и хобби', d: 'Навыки, конкурсы, подработка', min: 4, run: () => { delete S.used.hobbiesp; setTimeout(() => openPanel('hobbies'), 10); return null; } }
);
// медитация, отпуск и терапия снимают стресс
for (const id of ['meditate', 'therapy', 'travel', 'run']) {
  const a = ACTIVITIES.find((x) => x.id === id); if (!a) continue;
  const r = a.run; a.run = function () { habits(); S.stress = clamp(S.stress - (id === 'run' ? 4 : 10)); return r.apply(this, arguments); };
}

/* ---------- Мини-игры: казино ---------- */
openCasino = function () {
  closeSheet();
  Q.push({ e: '🎰', title: 'Казино', text: `Во что сыграем? Наличные: ${fmt(S.money)}.`, choices: [
    { t: '🎡 Рулетка', f: () => { roulette(); return null; } },
    { t: '🃏 Блэкджек', f: () => { blackjack(); return null; } },
    { t: '🍒 Слоты', f: () => { slots(); return null; } },
    { t: 'Уйти', f: () => null }
  ] });
  pump();
};
function betChoices(next) {
  const bets = [0.02, 0.1, 0.5].map((k) => Math.max(price(1000), Math.round(Math.max(0, S.money) * k))).filter((x, i, a) => x <= S.money && a.indexOf(x) === i);
  if (!bets.length) { Q.push({ e: '🚫', title: 'Нет денег', text: 'Охрана вежливо провожает вас к выходу.' }); return; }
  Q.push({ e: '💰', title: 'Ставка', text: 'Сколько ставите?', choices: bets.map((b) => ({ t: fmt(b), f: () => { next(b); return null; } })).concat([{ t: 'Передумать', f: () => null }]) });
}
const RED = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
function roulette() {
  betChoices((bet) => {
    const opts = [['🔴 Красное', (n) => RED.includes(n), 2], ['⚫ Чёрное', (n) => n && !RED.includes(n), 2], ['2️⃣ Чётное', (n) => n && n % 2 === 0, 2], ['1️⃣ Нечётное', (n) => n % 2 === 1, 2], ['🎯 1–12', (n) => n >= 1 && n <= 12, 3], ['🍀 Число 7', (n) => n === 7, 36]];
    Q.push({ e: '🎡', title: 'Рулетка', text: `Ставка ${fmt(bet)}. На что ставите?`, choices: opts.map(([t, win, k]) => ({ t: `${t} · ×${k}`, f: () => {
      const n = rnd(0, 36); const col = n === 0 ? '🟢' : RED.includes(n) ? '🔴' : '⚫';
      if (win(n)) { const g = bet * (k - 1); S.money += g; eff({ happy: 8 }); sfx('coin'); Q.push({ e: col, title: `Выпало ${n}!`, text: `Вы выиграли ${fmt(g)}! 🎉`, choices: [{ t: 'Ещё раз', f: () => { roulette(); return null; } }, { t: 'Хватит', f: () => null }] }); return `🎡 Рулетка: выпало ${n}, выигрыш ${fmt(g)}.`; }
      S.money -= bet; eff({ happy: -6 }); sfx('bad');
      Q.push({ e: col, title: `Выпало ${n}`, text: `Ставка ${fmt(bet)} проиграна.`, choices: [{ t: 'Отыграться', f: () => { roulette(); return null; } }, { t: 'Хватит', f: () => null }] });
      return `🎡 Рулетка: выпало ${n}, проигрыш ${fmt(bet)}.`;
    } })) });
  });
}
function slots() {
  betChoices((bet) => {
    const R = ['🍒', '🍋', '🔔', '⭐', '💎', '7️⃣'];
    const r = [pick(R), pick(R), pick(R)];
    let k = 0;
    if (r[0] === r[1] && r[1] === r[2]) k = r[0] === '7️⃣' ? 50 : r[0] === '💎' ? 20 : 8;
    else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) k = 1.5;
    const res = k ? Math.round(bet * (k - 1)) : -bet;
    S.money += res; if (k >= 8) { unlock('jackpot'); sfx('ach'); } else if (k) sfx('coin'); else sfx('bad');
    eff({ happy: k ? 6 : -4 });
    Q.push({ e: '🎰', title: r.join(' '), text: k ? `Выигрыш: ${fmt(res + bet)}!` : `Не повезло. −${fmt(bet)}.`, choices: [{ t: 'Крутить ещё', f: () => { slots(); return null; } }, { t: 'Хватит', f: () => null }] });
  });
}
function blackjack() {
  betChoices((bet) => {
    const deck = []; for (const s of ['♠', '♥', '♦', '♣']) for (const r of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']) deck.push(r + s);
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    const me = [deck.pop(), deck.pop()], dl = [deck.pop(), deck.pop()];
    const val = (h) => { let v = 0, a = 0; for (const c of h) { const r = c.slice(0, -1); v += r === 'A' ? 11 : 'JQK'.includes(r) ? 10 : +r; if (r === 'A') a++; } while (v > 21 && a--) v -= 10; return v; };
    const show = (h) => h.map((c) => `<span class="card-p${/[♥♦]/.test(c) ? ' red' : ''}">${c}</span>`).join('');
    const finish = () => {
      while (val(dl) < 17) dl.push(deck.pop());
      const m = val(me), d = val(dl);
      let res, title;
      if (m > 21) { res = -bet; title = 'Перебор 💥'; }
      else if (d > 21 || m > d) { res = m === 21 && me.length === 2 ? Math.round(bet * 1.5) : bet; title = 'Победа! 🎉'; }
      else if (m === d) { res = 0; title = 'Ничья 🤝'; }
      else { res = -bet; title = 'Дилер выиграл'; }
      S.money += res; eff({ happy: res > 0 ? 7 : res < 0 ? -5 : 0 }); sfx(res > 0 ? 'coin' : res < 0 ? 'bad' : 'click');
      Q.push({ e: '🃏', title, html: `<div class="cards-row"><small>Дилер · ${d}</small>${show(dl)}</div><div class="cards-row"><small>Вы · ${m}</small>${show(me)}</div><div>${res > 0 ? `+${fmt(res)}` : res < 0 ? `−${fmt(-res)}` : 'Ставка возвращена'}</div>`, choices: [{ t: 'Ещё раздача', f: () => { blackjack(); return null; } }, { t: 'Хватит', f: () => null }] });
      return `🃏 Блэкджек: ${res > 0 ? 'победа' : res < 0 ? (m > 21 ? 'перебор' : 'проигрыш') : 'ничья'} (${m} против ${d}).`;
    };
    const turn = () => {
      const m = val(me);
      if (m >= 21) { finish(); return; }
      Q.push({ e: '🃏', title: `Блэкджек · ставка ${fmt(bet)}`, html: `<div class="cards-row"><small>Дилер</small>${show([dl[0]])}<span class="card-p back">🂠</span></div><div class="cards-row"><small>Вы · ${m}</small>${show(me)}</div>`, choices: [
        { t: '➕ Ещё карту', f: () => { me.push(deck.pop()); turn(); return null; } },
        { t: '✋ Хватит', f: () => finish() },
        ...(S.money >= bet * 2 && me.length === 2 ? [{ t: '✖️2 Удвоить', f: () => { bet *= 2; me.push(deck.pop()); return finish(); } }] : [])
      ] });
    };
    turn();
  });
}

/* ---------- Мини-игра: побег из тюрьмы ---------- */
(function () {
  const esc = PRISON_ACTS.find((a) => a.id === 'p_escape');
  if (!esc) return;
  esc.run = () => { setTimeout(startEscape, 10); return null; };
})();
function startEscape() {
  const path = [pick(['left', 'right', 'straight']), pick(['left', 'right', 'straight']), pick(['left', 'right', 'straight'])];
  const scenes = ['Вы выбрались из камеры в тёмный коридор. Слышны шаги охраны.', 'Прачечная. Три выхода, и один из них ведёт к стене.', 'Двор. Прожектор вот-вот повернётся в вашу сторону!'];
  let ok = 0;
  const step = (i) => {
    if (i === 3) {
      if (ok >= 2 || (ok === 1 && chance(0.25))) { S.prison = null; unlock('escape'); eff({ happy: 20, karma: -5 }); sfx('ach'); Q.push({ e: '🏃', title: 'Свобода!', text: 'Вы перелезли через стену и растворились в ночи.' }); return 'Вы сбежали из тюрьмы! 🏃'; }
      S.prison.years += rnd(2, 4); eff({ health: -rnd(5, 15), happy: -10 }); sfx('bad');
      Q.push({ e: '🚨', title: 'Пойманы', text: `Охрана вас заметила. Срок увеличен до ${yrs(S.prison.years)}.` });
      return `Побег провалился. Срок: ${yrs(S.prison.years)}.`;
    }
    Q.push({ e: ['🚪', '🧺', '🔦'][i], title: `Побег · шаг ${i + 1} из 3`, text: scenes[i], choices: [['left', '⬅️ Налево'], ['straight', '⬆️ Прямо'], ['right', '➡️ Направо']].map(([k, t]) => ({ t, f: () => { if (k === path[i]) ok++; return step(i + 1); } })) });
    return null;
  };
  closeSheet(); step(0); pump();
}

/* ---------- Мини-игра: экзамены и собеседование ---------- */
const QUIZ = [
  ['Сколько планет в Солнечной системе?', ['8', '9', '7'], 0], ['Самая длинная река в мире?', ['Нил', 'Волга', 'Дунай'], 0],
  ['Сколько будет 15 × 4?', ['60', '45', '75'], 0], ['Кто написал «Войну и мир»?', ['Толстой', 'Пушкин', 'Чехов'], 0],
  ['Химическая формула воды?', ['H₂O', 'CO₂', 'O₂'], 0], ['Столица Австралии?', ['Канберра', 'Сидней', 'Мельбурн'], 0],
  ['Сколько градусов в прямом угле?', ['90', '180', '45'], 0], ['Самый большой океан?', ['Тихий', 'Атлантический', 'Индийский'], 0],
  ['Кто открыл закон всемирного тяготения?', ['Ньютон', 'Эйнштейн', 'Галилей'], 0], ['Сколько минут в сутках?', ['1440', '1200', '3600'], 0],
  ['Какой газ растения поглощают при фотосинтезе?', ['Углекислый', 'Кислород', 'Азот'], 0], ['√144 = ?', ['12', '14', '11'], 0],
  ['Автор «Ромео и Джульетты»?', ['Шекспир', 'Гёте', 'Данте'], 0], ['Самая высокая гора мира?', ['Эверест', 'Эльбрус', 'Килиманджаро'], 0],
  ['Сколько хромосом у человека?', ['46', '23', '48'], 0], ['В каком году человек полетел в космос?', ['1961', '1957', '1969'], 0],
  ['Как называется наша галактика?', ['Млечный Путь', 'Андромеда', 'Туманность Ориона'], 0], ['2 в 10-й степени?', ['1024', '512', '2048'], 0],
  ['Сколько континентов на Земле?', ['6', '5', '7'], 2], ['Главный орган кровообращения?', ['Сердце', 'Печень', 'Лёгкие'], 0],
  ['Сколько сторон у шестиугольника?', ['6', '8', '5'], 0], ['Скорость света примерно…', ['300 000 км/с', '30 000 км/с', '3 000 км/с'], 0],
  ['Кто нарисовал «Мону Лизу»?', ['Леонардо да Винчи', 'Микеланджело', 'Рафаэль'], 0], ['Чему равно π до сотых?', ['3,14', '3,41', '3,12'], 0]
];
const EXAM_NAME = { ru: 'ЕГЭ', by: 'ЦТ', kz: 'ЕНТ', ua: 'НМТ', us: 'SAT', ca: 'SAT', gb: 'A-levels', ie: 'Leaving Certificate', de: 'Abitur', at: 'Matura', ch: 'Matura', fr: 'Baccalauréat', be: 'выпускные экзамены', cn: 'Гаокао', kr: 'Сунын', jp: 'единый вступительный экзамен', it: 'Maturità', es: 'EBAU', in: 'JEE' };
function shuffleQ(q) { const opts = q[1].map((t, i) => ({ t, ok: i === q[2] })); for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; } return opts; }
function quiz(n, title, e, onDone) {
  const qs = [...QUIZ].sort(() => Math.random() - 0.5).slice(0, n);
  let right = 0;
  const step = (i) => {
    if (i === n) return onDone(right);
    const q = qs[i];
    Q.push({ e, title: `${title} · ${i + 1}/${n}`, text: q[0], silent: true, choices: shuffleQ(q).map((o) => ({ t: o.t, f: () => { if (o.ok) right++; return step(i + 1); } })) });
    return null;
  };
  step(0);
}
const _afterSchool = afterSchoolEvent;
afterSchoolEvent = function () {
  const ex = EXAM_NAME[S.country] || 'выпускные экзамены';
  return { e: '📝', title: `Экзамен: ${ex}`, text: `Пора сдавать ${ex}. Ответьте на 5 вопросов: от результата зависит бюджетное место и стипендия.`, choices: [
    { t: 'Начать экзамен', f: () => { quiz(5, ex, '📝', (r) => {
      const score = clamp(Math.round(r * 16 + S.stats.smarts * 0.2 + rnd(-5, 5)));
      S.edu.exam = score;
      if (score >= 90) unlock('topexam');
      Q.push({ e: score >= 80 ? '🥇' : score >= 50 ? '📄' : '😬', title: `Результат: ${score} баллов`, text: `Правильных ответов: ${r} из 5.${score >= 80 ? '\nОтлично! Бюджетное место гарантировано, а при 90+ будет стипендия.' : score >= 50 ? '\nНеплохо, но на бюджет можно и не пройти.' : '\nСлабовато. Поступить будет сложно.'}` });
      Q.push(_afterSchool());
      return `📝 ${ex}: ${score} баллов.`;
    }); return null; } },
    { t: 'Пропустить экзамены', f: () => { S.edu.exam = 0; Q.push(_afterSchool()); return 'Вы не пошли на экзамены.'; } }
  ] };
};
applyJob = function (d) {
  S.used['apply_' + d.id] = 1;
  closeSheet();
  const QS = [
    ['Почему вы хотите работать именно у нас?', [['Меня вдохновляет ваша миссия и я изучил компанию', 0.08], ['Мне нужны деньги', -0.05], ['Просто мимо проходил', -0.12]]],
    ['Ваша главная слабость?', [['Иногда беру на себя слишком много, учусь делегировать', 0.06], ['У меня нет слабостей', -0.06], ['Опаздываю. Постоянно.', -0.12]]],
    ['Где вы видите себя через 5 лет?', [['Выросшим профессионалом в вашей команде', 0.07], ['На вашем месте', 0.02], ['На пляже с коктейлем', -0.08]]],
    ['Расскажите о конфликте и как вы его решили', [['Выслушал обе стороны и нашёл компромисс', 0.08], ['Доказал, что прав я', -0.04], ['Конфликтов не бывает, я со всеми молчу', -0.03]]],
    ['Какую зарплату вы ожидаете?', [['По рынку, готов обсуждать', 0.05], ['Вдвое больше, чем вы предлагаете', -0.08], ['Сколько дадите', -0.02]]]
  ].sort(() => Math.random() - 0.5).slice(0, 2);
  let extra = 0;
  const ask = (i) => {
    if (i === QS.length) {
      Q.push({ e: '🤝', title: 'Финал собеседования', text: 'Последний вопрос: как подаёте себя?', choices: [
        { t: '😎 Уверенно', f: () => hire(d, 0.05 + extra) },
        { t: '🙂 Скромно и честно', f: () => hire(d, extra) },
        { t: '🤥 Приукрасить резюме', f: () => { eff({ karma: -3 }); return hire(d, extra + (chance(0.5) ? 0.15 : -0.3)); } }
      ] });
      return null;
    }
    const [q, ans] = QS[i];
    Q.push({ e: '💼', title: `Собеседование: ${d.titles[0]}`, text: q, silent: true, choices: [...ans].sort(() => Math.random() - 0.5).map(([t, v]) => ({ t, f: () => { extra += v; return ask(i + 1); } })) });
    return null;
  };
  ask(0); pump();
};

/* ---------- новые достижения ---------- */
ACHIEVEMENTS.push(
  { id: 'skilled', e: '🎯', t: 'Умелец', d: 'Прокачать любой навык до 50' },
  { id: 'master', e: '🥋', t: 'Мастер', d: 'Прокачать навык до 100' },
  { id: 'winner', e: '🏆', t: 'Чемпион', d: 'Победить в конкурсе талантов' },
  { id: 'quit', e: '🚭', t: 'Сила воли', d: 'Избавиться от вредной привычки' },
  { id: 'donor', e: '🩸', t: 'Почётный донор', d: 'Сдать кровь 10 раз' },
  { id: 'topexam', e: '💯', t: 'Отличник', d: 'Набрать 90+ на выпускных экзаменах' }
);

