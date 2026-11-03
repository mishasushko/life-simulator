'use strict';
/* Connected life systems. State is lazy so v1 saves remain playable. */
const LIFE_GOALS = [
  { name: 'творчество', job: 'Художник', skill: 'art' },
  { name: 'наука', job: 'Учёный', skill: 'code' },
  { name: 'помощь людям', job: 'Врач', skill: 'lang' },
  { name: 'своё дело', job: 'Предприниматель', skill: 'business' }
];
const LIFE_TIME = { work: 'Работа', family: 'Близкие', study: 'Учёба и хобби', rest: 'Отдых' };
function lifeSystems() {
  const x = S.lifeSystems ||= {};
  x.plan ||= { work: 4, family: 2, study: 2, rest: 2 };
  x.rep ||= { work: 50, family: 50, city: 50 };
  x.legacy ||= { tradition: 'family', generations: 1 };
  x.stories ||= [];
  // An existing save starts in its current country without retroactive migration.
  x.country ??= S.country;
  return x;
}
function lifeRep(key, delta) { const r = lifeSystems().rep; r[key] = clamp(r[key] + delta); }
function lifeNPC(p) {
  return p.lifePath ||= { goal: rnd(0, LIFE_GOALS.length - 1), character: pick(['самостоятельный', 'осторожный', 'общительный']), progress: 0, next: S.year + rnd(1, 3) };
}
function lifeSnapshot() {
  const v = { money: S.money, net: netWorth(), stress: S.stress ?? 20, ...S.stats };
  for (const [id, n] of Object.entries(S.skills || {})) v['skill:' + id] = n;
  for (const p of S.people) v['person:' + p.id] = p.close;
  return v;
}
let lifeCause = 'События года';
function lifeObserveMoney() {
  const state = S;
  let balance = state.money;
  Object.defineProperty(state, 'money', { enumerable: true, configurable: true,
    get: () => balance,
    set: value => {
      const r = state.lifeSystems?.pending, delta = value - balance;
      if (r && delta) {
        const flows = r.cash ||= [];
        const previous = flows[flows.length - 1];
        if (previous && previous.label === lifeCause && Math.sign(previous.delta) === Math.sign(delta)) previous.delta += delta;
        else flows.push({ label: lifeCause, delta });
      }
      balance = value;
    }
  });
}
function lifeMeasure(label, fn) {
  const state = S, report = S?.lifeSystems?.pending;
  if (!report) return fn();
  const before = lifeSnapshot();
  const priorCause = lifeCause;
  let result;
  try { lifeCause = label; result = fn(); } finally { lifeCause = priorCause; }
  if (S === state && state.lifeSystems.pending === report) {
    const after = lifeSnapshot(), changes = {};
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
      // New/deceased people are described in the chronicle, not as 0→closeness.
      if (key.startsWith('person:') && (before[key] == null || after[key] == null)) continue;
      const d = (after[key] || 0) - (before[key] || 0);
      if (d) changes[key] = d;
    }
    if (Object.keys(changes).length) report.steps.push({ label, changes });
  }
  return result;
}
function lifeSigned(v, money = false) { return `${v > 0 ? '+' : ''}${money ? fmt(v) : Math.round(v * 10) / 10}`; }
function lifeReportHTML(r) {
  const labels = { money: 'Баланс', net: 'Капитал', happy: 'Счастье', health: 'Здоровье', smarts: 'Ум', looks: 'Внешность', stress: 'Стресс' };
  const rows = Object.keys(labels).concat([...new Set(r.steps.flatMap(s => Object.keys(s.changes)))].filter(k => k.startsWith('skill:') || k.startsWith('person:')));
  const incoming = (r.cash || []).filter(f => f.delta > 0).reduce((n, f) => n + f.delta, 0);
  const outgoing = -(r.cash || []).filter(f => f.delta < 0).reduce((n, f) => n + f.delta, 0);
  const cash = `<details><summary>Поступления: <b>${esc(fmt(incoming))}</b> · выплаты: <b>${esc(fmt(outgoing))}</b></summary>${(r.cash || []).map(f => `<div class="muted">${esc(f.label)}: ${esc(lifeSigned(f.delta, true))}</div>`).join('')}</details>`;
  return `<div class="life-report">${cash}<div class="muted">${esc(r.year)} год · ${esc(yrs(r.age))}. Изменения за переход года и решения в событиях.</div>${rows.map(key => {
    const parts = r.steps.filter(s => s.changes[key]);
    const delta = parts.reduce((n, s) => n + s.changes[key], 0);
    if (!parts.length) return '';
    const label = labels[key] || (key.startsWith('skill:') ? SKILLS.find(s => s.id === key.slice(6))?.name : S.people.find(p => p.id === key.slice(7))?.name) || 'Отношения';
    return `<details><summary>${esc(label)}: <b>${esc(lifeSigned(delta, key === 'money' || key === 'net'))}</b></summary>${parts.map(s => `<div class="muted">${esc(s.label)}: ${esc(lifeSigned(s.changes[key], key === 'money' || key === 'net'))}</div>`).join('')}</details>`;
  }).join('')}<div class="muted">Поступления и выплаты — движения денег, включая переводы и продажу имущества. Капитал учитывает также долги и переоценку активов.</div></div>`;
}
const _lifePump = pump;
pump = function () {
  if (S && $('#modalWrap').hidden && !Q.length && S.lifeSystems?.pending) {
    const x = lifeSystems(), r = x.pending;
    x.report = r; delete x.pending; save();
    // Death keeps its own final screen; the last report is available in the menu.
    if (S.alive) return showModal({ e: '📅', title: `Итоги ${r.year} года`, html: lifeReportHTML(r), choices: [{ t: 'Продолжить', f: () => null }] });
  }
  return _lifePump();
};
const _lifeShowModal = showModal;
showModal = function (m) {
  return _lifeShowModal({ ...m, choices: m.choices?.map(ch => ({ ...ch, f: () => {
    const state = S, country = state?.country;
    const r = lifeMeasure('Решения в событиях', ch.f);
    if (S === state && S && country !== S.country) lifeMove(country);
    return r;
  } })) });
};
const _lifeAgeUp = ageUp;
ageUp = function () {
  if (!S?.alive || !$('#modalWrap').hidden || Q.length) return;
  const x = lifeSystems();
  if (x.pending) { pump(); return; }
  if (x.country !== S.country) lifeMove(x.country);
  x.pending = { year: S.year + 1, age: S.age + 1, steps: [], cash: [] };
  lifeObserveMoney();
  return _lifeAgeUp();
};
// Preserve existing wrappers and measure every annual phase separately.
for (const [name, label] of [
  ['yearEra', 'События эпохи'], ['yearEducation', 'Образование'], ['yearPrison', 'Заключение'],
  ['yearWork', 'Работа и доходы'], ['yearMoney', 'Быт, долги и инвестиции'],
  ['yearBody', 'Возраст и образ жизни'], ['yearPeople', 'События близких'],
  ['yearPets', 'Питомцы'], ['yearDiseases', 'Болезни и лечение'], ['yearEvents', 'Случайные события'], ['yearDeath', 'Завершение жизни']
]) {
  // Function declarations live on the classic-script global object.
  const previous = window[name];
  window[name] = function (...args) { return lifeMeasure(label, () => previous(...args)); };
}
YEAR_HOOKS.forEach((hook, i) => { YEAR_HOOKS[i] = () => lifeMeasure(hook.name === 'yearSkills' ? 'Практика и забывание навыков' : hook.name === 'yearHabits' ? 'Привычки, сон, работа и стресс' : 'Годовые события', hook); });

/* 1. A fixed annual time budget, applied once before education and work. */
function lifePlanYear() {
  if (S.age < 6 || S.prison) return;
  const x = lifeSystems(), p = x.plan;
  S.stress = clamp((S.stress ?? 20) + (S.job ? (p.work - 4) * 4 : 0) - (p.rest - 2) * 4);
  eff({ health: p.rest === 0 ? -2 : p.rest >= 4 ? 2 : 0, happy: p.rest === 0 ? -3 : p.rest >= 4 ? 3 : 0 });
  if (S.job) { S.job.perf = clamp(S.job.perf + (p.work - 4) * 2); lifeRep('work', p.work >= 4 ? 1 : -1); }
  if (S.edu.stage) S.edu.grade = clamp(S.edu.grade + (p.study - 2) * 2);
  if (p.study >= 3) {
    const options = SKILLS.filter(s => S.age >= s.min && (!s.yr || S.year >= s.yr));
    const sk = options.find(s => s.id === S.talent) || options[0];
    if (sk) { skills()[sk.id] = clamp(skillOf(sk.id) + p.study - 2); (S.practiced ||= {})[sk.id] = 1; }
  }
  for (const person of S.people.filter(v => v.alive && ['partner', 'child', 'mother', 'father', 'friend', 'sibling'].includes(v.role))) person.close = clamp(person.close + (p.family - 2) * 2);
  lifeRep('family', p.family - 2);
  if (S.stress > 75) log('⏳ Высокая нагрузка оставляет мало сил на восстановление.', 'bad');
}
const _lifeEducation = yearEducation;
yearEducation = function () { lifeMeasure('Распределение времени', lifePlanYear); return _lifeEducation(); };
const _lifeSalary = jobSalary;
jobSalary = function (j) {
  const x = lifeSystems();
  const load = S.prison ? 1 : clamp(1 + (x.plan.work - 4) * 0.1, 0.6, 1.4);
  const migration = x.migration;
  const adaptation = migration && !migration.done ? 0.75 + migration.language / 400 : 1;
  return Math.round(_lifeSalary(j) * load * adaptation);
};

/* 2. Persistent goals, autonomous careers and requests from close people. */
function lifePeopleYear() {
  const candidates = S.people.filter(p => p.alive && p.age >= 6 && ['child', 'partner', 'friend', 'sibling'].includes(p.role));
  for (const p of candidates) {
    const n = lifeNPC(p), goal = LIFE_GOALS[n.goal];
    n.progress = clamp(n.progress + rnd(2, 6) + (n.support ? 3 : 0));
    if (p.age >= 18 && S.year >= n.next) {
      n.next = S.year + rnd(3, 5);
      if (n.progress >= 30) { p.job = goal.job; log(`🌱 ${p.name}: цель «${goal.name}» привела к новой работе — ${p.job}.`, 'good'); }
      else if (chance(0.3)) { p.job = pick(NPC_JOBS); log(`💼 ${p.name} самостоятельно меняет работу: ${p.job}.`, 'info'); }
      if (p.role !== 'partner' && n.character === 'самостоятельный' && chance(0.2)) {
        p.country = pick(COUNTRIES).id;
        log(`🧳 ${p.name} переезжает: ${cname(COUNTRIES.find(c => c.id === p.country))}.`, 'info');
      }
    }
  }
  if (S.prison || S.age < 12) return;
  const p = pick(candidates.filter(p => p.age >= 16 && (!p.lifePath.asked || S.year - p.lifePath.asked >= 5)));
  if (!p || !chance(0.18)) return;
  const n = lifeNPC(p), goal = LIFE_GOALS[n.goal]; n.asked = S.year;
  const fee = price(60000);
  ev('🌱', `${p.name}: свой путь`, `Цель: ${goal.name}. ${p.name} просит поддержки. Характер: ${n.character}.`, [
    { t: 'Поддержать выбор', f: () => { if (!p.alive) return 'Эта встреча уже невозможна.'; n.support = true; p.close = clamp(p.close + 10); lifeRep('family', 3); return `Вы поддержали цель ${p.name}. Решение о будущем остаётся за близким человеком.`; } },
    { t: `Оплатить обучение (${fmt(fee)})`, disabled: S.money < fee, f: () => { if (!p.alive || S.money < fee) return 'Помочь сейчас не получилось.'; S.money -= fee; n.support = true; n.progress = clamp(n.progress + 20); p.close = clamp(p.close + 12); lifeRep('family', 4); return `Вы помогли ${p.name} приблизиться к цели.`; } },
    { t: 'Настоять на своём выборе', f: () => {
      if (!p.alive) return null;
      p.close = clamp(p.close - (n.character === 'самостоятельный' ? 20 : 10)); lifeRep('family', -5);
      if (n.character === 'осторожный') { n.goal = (n.goal + 1) % LIFE_GOALS.length; n.progress = 0; return `${p.name} уступает, но прежнее увлечение осталось незавершённым.`; }
      return `${p.name} выбирает собственный путь. Разговор оставил обиду.`;
    } }
  ]);
}

/* 3. A 10-year personal story with a midpoint decision and delayed endings. */
function lifeStoryYear() {
  const x = lifeSystems();
  for (const a of x.stories.filter(a => !a.done)) {
    const p = S.people.find(p => p.id === a.person);
    if (!p?.alive) { a.done = true; a.ending = 'Проект остался памятью о близком человеке.'; log(`🕯️ ${a.ending}`, 'info'); continue; }
    const elapsed = S.year - a.start;
    if (elapsed >= 5 && !a.mid) {
      a.mid = true;
      ev('📖', 'Общее дело: пятый год', `${p.name} предлагает расширить ваш образовательный проект. Прошлое доверие и репутация повлияют на итог.`, [
        { t: 'Развивать вместе', f: () => { a.choice = 'together'; p.close = clamp(p.close + 8); lifeRep('city', 3); return 'Вы договорились делить ответственность.'; } },
        { t: 'Потребовать полный контроль', f: () => { a.choice = 'control'; p.close = clamp(p.close - 15); return 'Проект продолжается, но доверия стало меньше.'; } },
        { t: 'Передать проект другу', f: () => { a.choice = 'gift'; lifeRep('city', 8); return 'Вы передали своё дело другу и сохранили связь с проектом.'; } }
      ]);
    }
    if (elapsed >= 10) {
      a.done = true;
      if (a.choice === 'gift') { a.ending = 'Ваш проект стал городской школой. Друг помнит вашу помощь.'; lifeRep('city', 10); }
      else if (a.choice === 'control' || p.close < 35) { a.ending = 'Вы разошлись во взглядах. Друг открыл конкурирующий проект.'; p.close = clamp(p.close - 12); }
      else if (x.rep.city >= 55 && p.close >= 55) { a.ending = 'Десять лет доверия: проект получил грант, а вы — надёжного союзника.'; S.money += price(250000); p.close = clamp(p.close + 10); lifeRep('work', 6); }
      else { a.ending = 'Проект остался небольшим, но помог первым ученикам.'; lifeRep('city', 5); }
      log(`📖 ${a.ending}`, 'info');
    }
  }
}
function lifeStartStory() {
  const x = lifeSystems(), friends = S.people.filter(p => p.alive && p.role === 'friend' && p.age >= 18);
  const fee = price(100000);
  if (S.age < 18 || S.prison || !friends.length || x.stories.length || S.money < fee) return 'Нужны взрослый друг, свободные средства и возможность работать над проектом.';
  const p = friends.slice().sort((a, b) => b.close - a.close)[0];
  S.money -= fee; x.stories.push({ person: p.id, name: p.name, start: S.year, done: false });
  return `📖 Вы с ${p.name} основали образовательный проект. Впереди десять лет совместной истории.`;
}

/* 4. All moves use one detection path, including historical forced migration. */
function lifeMove(from) {
  const x = lifeSystems();
  if (from === S.country) return;
  x.country = S.country;
  const contacts = S.people.filter(p => p.alive && p.country === S.country && p.close >= 50).length;
  x.migration = { country: S.country, since: S.year, language: clamp(skillOf('lang') + contacts * 10), network: Math.min(60, contacts * 20), diploma: !['bachelor', 'master', 'phd'].includes(S.edu.level), residence: 0, done: false };
  log('🛬 Новая страна: язык, подтверждение диплома, статус проживания и круг общения потребуют времени. Откройте «Адаптация после переезда».', 'info');
}
function lifeMigrationYear() {
  const x = lifeSystems(); if (x.country !== S.country) lifeMove(x.country);
  const m = x.migration; if (!m || m.done) return;
  m.language = clamp(m.language + 10 + Math.floor(skillOf('lang') / 10));
  m.network = clamp(m.network + (x.plan.family >= 3 ? 15 : 8));
  m.residence = Math.min(3, m.residence + 1);
  if (m.language < 50) { S.stress = clamp((S.stress ?? 20) + 5); eff({ happy: -2 }); }
  if (!m.diploma && m.language >= 60 && S.year - m.since >= 3) { m.diploma = true; log('🎓 Диплом подтверждён после периода профессиональной адаптации.', 'good'); }
  if (m.language >= 60 && m.network >= 40 && m.diploma && m.residence >= 3) { m.done = true; log('🏡 Адаптация завершена: вы освоились в новой стране.', 'good'); eff({ happy: 8 }); }
}
function lifeMigrationAction(key) {
  const m = lifeSystems().migration;
  if (!m || m.done || S.prison || S.used['adapt:' + key]) return null;
  const fee = price(key === 'diploma' ? 80000 : 20000);
  if (S.money < fee) return 'Не хватает денег.';
  S.money -= fee; S.used['adapt:' + key] = 1;
  if (key === 'diploma') m.diploma = true;
  else m[key] = clamp(m[key] + 25);
  return '🛬 Вы сделали ещё один шаг к жизни в новой стране.';
}

/* 5. Reputation is local to each circle and opens concrete opportunities. */
function lifeReputationYear() {
  const x = lifeSystems();
  if (S.crimes > (x.crimes || 0)) { lifeRep('city', -Math.min(20, (S.crimes - (x.crimes || 0)) * 5)); lifeRep('work', -5); }
  x.crimes = S.crimes;
  if (S.job?.perf >= 75) lifeRep('work', 2);
  if (S.age >= 18 && !S.prison && x.rep.family >= 75 && S.money < 0 && S.year - (x.familyHelp || 0) >= 5) {
    const relative = S.people.find(p => p.alive && ['mother', 'father', 'sibling'].includes(p.role) && p.close >= 60 && p.money >= price(100000));
    if (relative) {
      const help = Math.min(-S.money, price(100000)); relative.money -= help; S.money += help; x.familyHelp = S.year;
      log(`💞 ${relative.name} помог вам в трудный год: ${fmt(help)}. Семейное доверие сохранилось.`, 'good');
    }
  }
  if (S.age >= 18 && !S.prison && x.rep.city >= 75 && S.year - (x.invitation || 0) >= 5) {
    x.invitation = S.year;
    const friend = makePerson('friend', { age: Math.max(18, S.age + rnd(-5, 5)), close: 60, job: pick(NPC_JOBS), country: S.country });
    S.people.push(friend); log(`🌳 Вас пригласили в местное сообщество. Новое знакомство: ${friend.name}.`, 'good');
  }
  if (S.age >= 18 && x.rep.work >= 75 && S.job && !S.prison && S.year - (x.recommendation || 0) >= 5) {
    x.recommendation = S.year; S.job.perf = clamp(S.job.perf + 10);
    log('🤝 Коллеги рекомендовали вас руководству: профессиональная репутация помогла карьере.', 'good');
  }
}

/* 6. Traditions, contacts and a business survive succession. */
const _lifeContinueAs = continueAs;
continueAs = function (k) {
  const old = S, x = lifeSystems();
  const legacy = { ...x.legacy, generations: x.legacy.generations + 1 };
  const contacts = old.people.filter(p => p.alive && p.role === 'friend' && p.close >= 70 && p.age > k.age).slice(0, 2).map(p => ({ ...p, lifePath: p.lifePath ? { ...p.lifePath } : undefined, close: 50 }));
  const biz = old.biz ? JSON.parse(JSON.stringify(old.biz)) : null;
  const heirShare = old.will?.shares?.[k.id] ?? (100 / Math.max(1, willHeirs().length));
  _lifeContinueAs(k);
  const next = lifeSystems(); next.legacy = legacy;
  for (const p of contacts) if (!S.people.some(v => v.id === p.id)) S.people.push(p);
  if (biz && !S.biz && heirShare >= 50 && S.money >= Math.round(biz.value * 0.87 * heirShare / 100)) {
    // Convert inherited cash to the business rather than duplicating its value.
    S.money -= Math.round(biz.value * 0.87 * heirShare / 100);
    biz.value = Math.round(biz.value * 0.87 * heirShare / 100); S.biz = biz;
    log(`🏭 Вы продолжаете семейное дело «${biz.name}». Его стоимость учтена в вашей доле наследства.`, 'info');
  }
  next.rep.work = clamp(50 + (x.rep.work - 50) * 0.25);
  next.rep.city = clamp(50 + (x.rep.city - 50) * 0.25);
  log(`🧵 Семейная традиция и ${contacts.length} старых знакомств перешли следующему поколению.`, 'info');
  save(); render();
};
function lifeLegacyYear() {
  const t = lifeSystems().legacy.tradition;
  if (t === 'family') { for (const p of S.people.filter(p => p.alive && ['child', 'sibling', 'partner'].includes(p.role))) p.close = clamp(p.close + 1); }
  else if (t === 'learning' && S.age >= 6) eff({ smarts: 1 });
  else if (t === 'service' && S.age >= 12) lifeRep('city', 1);
}
YEAR_HOOKS.push(() => lifeMeasure('Самостоятельная жизнь близких', lifePeopleYear));
YEAR_HOOKS.push(() => lifeMeasure('Многолетние истории', lifeStoryYear));
YEAR_HOOKS.push(() => lifeMeasure('Адаптация после переезда', lifeMigrationYear));
YEAR_HOOKS.push(() => lifeMeasure('Репутация и рекомендации', lifeReputationYear));
YEAR_HOOKS.push(() => lifeMeasure('Семейная традиция', lifeLegacyYear));

/* Player-facing panels; available from the menu and relevant existing panels. */
Object.assign(EXTRA_TITLES, { lifeplan: '⏳ План года', lifepaths: '🌱 Жизнь близких', lifestories: '📖 Личные истории', adaptation: '🛬 Адаптация после переезда', reputation: '🤝 Репутация', legacy: '🧵 Семейное наследие', yearreport: '📅 Последний итог года' });
EXTRA_PANELS.yearreport = () => { const r = lifeSystems().report; card(r ? lifeReportHTML(r) : '<div class="muted">Итог появится после первого прожитого года.</div>'); };
EXTRA_PANELS.lifeplan = () => {
  const p = lifeSystems().plan;
  card('<div class="big">10 долей времени на год</div><div class="muted">Изменения применятся при следующем +1 год. Работа: каждая доля сверх 4 даёт +10% зарплаты, +2 к результативности и +4 стресса; ниже 4 — обратный эффект. Близкие: каждая доля сверх 2 даёт +2 к отношениям. Учёба: сверх 2 даёт +2 к оценкам и практику таланта. Отдых: сверх 2 снижает стресс на 4 за долю; от 4 улучшает здоровье. В тюрьме план не применяется.</div>');
  btnRow($('#sheetBody'), [
    { t: 'Обычная нагрузка', f: act(() => { lifeSystems().plan = { work: 4, family: 2, study: 2, rest: 2 }; }) },
    { t: 'Усиленная', f: act(() => { lifeSystems().plan = { work: 6, family: 1, study: 2, rest: 1 }; }) },
    { t: 'Сокращённая', f: act(() => { lifeSystems().plan = { work: 2, family: 3, study: 2, rest: 3 }; }) }
  ]);
  const list = section('Распределение');
  for (const [id, label] of Object.entries(LIFE_TIME)) {
    const row = item(list, { e: '⏳', t: label, r: `${p[id]}/10` });
    btnRow(row, [{ t: '−', disabled: id === 'rest' || p[id] <= 0, f: act(() => { if (p[id] > 0) { p[id]--; p.rest++; } }) }, { t: '+', disabled: id === 'rest' ? p.work + p.family + p.study === 0 : p.rest === 0, f: act(() => {
      if (id === 'rest') { const key = ['work', 'family', 'study'].find(k => p[k] > 0); if (key) { p[key]--; p.rest++; } }
      else if (p.rest > 0) { p[id]++; p.rest--; }
    }) }]);
  }
  card('<div class="muted">Сначала освободите время кнопкой «−»: оно перейдёт в отдых. Затем добавьте его нужному занятию. До 6 лет план не действует.</div>');
};
EXTRA_PANELS.lifepaths = () => {
  const list = section('Цели и характер');
  for (const p of S.people.filter(p => p.alive && p.age >= 6 && ['child', 'partner', 'friend', 'sibling'].includes(p.role))) {
    const n = lifeNPC(p), goal = LIFE_GOALS[n.goal];
    item(list, { e: personEmoji(p), t: p.name, d: `${goal.name} · ${n.character} · ${p.job || 'пока учится'} · отношения ${p.close}%`, bar: n.progress });
  }
  if (!list.children.length) card('<div class="muted">Здесь появятся близкие от 6 лет.</div>');
};
EXTRA_PANELS.lifestories = () => {
  const x = lifeSystems();
  for (const a of x.stories) card(`<b>Общее дело · ${esc(a.name)}</b><div class="muted">С ${a.start} года · ${a.done ? esc(a.ending) : `прошло ${S.year - a.start} лет из 10`}</div>`);
  const l = section('Новая история');
  item(l, { e: '📖', t: 'Основать образовательный проект с другом', d: `История на 10 лет · ${fmt(price(100000))} · взрослый друг`, disabled: S.age < 18 || !!S.prison || !!x.stories.length || S.money < price(100000) || !S.people.some(p => p.alive && p.role === 'friend' && p.age >= 18), onClick: act(lifeStartStory) });
};
EXTRA_PANELS.adaptation = () => {
  const m = lifeSystems().migration;
  if (!m) { card('<div class="muted">Период адаптации начнётся после переезда в другую страну.</div>'); return; }
  card(`<div class="big">${m.done ? 'Вы освоились' : 'Новый дом'}</div><div class="muted">Язык: ${m.language}% · знакомства: ${m.network}% · диплом: ${m.diploma ? 'подтверждён / не требуется' : 'ожидает подтверждения'} · статус проживания: ${m.residence}/3. Пока идёт адаптация, зарплата составляет 75–100% от обычной. Это игровые условия адаптации.</div>`);
  const list = section('Шаги адаптации');
  for (const [key, name] of [['language', 'Курсы языка'], ['network', 'Местный клуб знакомств'], ['diploma', 'Подтвердить диплом']]) item(list, { e: '🛬', t: name, d: fmt(price(key === 'diploma' ? 80000 : 20000)), disabled: m.done || !!S.prison || !!S.used['adapt:' + key] || (key === 'diploma' ? m.diploma : m[key] >= 100) || S.money < price(key === 'diploma' ? 80000 : 20000), onClick: act(() => lifeMigrationAction(key)) });
};
EXTRA_PANELS.reputation = () => {
  const r = lifeSystems().rep, l = section('Круги доверия');
  for (const [id, label] of [['work', 'Коллеги'], ['family', 'Близкие'], ['city', 'Город']]) item(l, { e: '🤝', t: label, r: `${Math.round(r[id])}/100`, bar: r[id] });
  card('<div class="muted">От 75 доверия коллеги рекомендуют вас руководству раз в 5 лет. Семейный план и поддержка целей влияют на доверие близких. Городская репутация влияет на исход общего дела. От 75 доверия близкие могут помочь с долгами, а городское сообщество приглашает вас и знакомит с людьми раз в 5 лет. Преступления снижают доверие города и коллег.</div>');
  item(l, { e: '🌳', t: 'Помочь городскому сообществу', d: 'Раз в год · +6 к доверию города, +3 к счастью', disabled: S.age < 12 || !!S.prison || !!S.used.community, onClick: act(() => { if (S.used.community || S.prison || S.age < 12) return null; S.used.community = 1; lifeRep('city', 6); eff({ happy: 3 }); return '🌳 Вы помогли соседям с общим делом.'; }) });
};
EXTRA_PANELS.legacy = () => {
  const x = lifeSystems(), names = { family: 'Забота о семье', learning: 'Любовь к учёбе', service: 'Помощь сообществу' };
  card(`<div class="big">${esc(names[x.legacy.tradition])}</div><div class="muted">Традиция живёт ${x.legacy.generations} поколений. Семья: +1 к отношениям в год. Учёба: +1 к уму с 6 лет. Сообщество: +1 к городской репутации с 12 лет. Передаются до двух семейных знакомств и часть репутации. Семейный бизнес наследуется при доле от 50%, если её хватает на его стоимость.</div>`);
  const l = section('Семейная традиция');
  for (const [id, label] of Object.entries(names)) item(l, { e: '🧵', t: label, r: x.legacy.tradition === id ? '✓' : '', disabled: !!S.used.tradition, onClick: act(() => { if (S.used.tradition) return null; x.legacy.tradition = id; S.used.tradition = 1; return `Семейная традиция: ${label}.`; }) });
};
function lifeLinks(list, ids) { for (const id of ids) item(list, { e: EXTRA_TITLES[id].split(' ')[0], t: EXTRA_TITLES[id].split(' ').slice(1).join(' '), onClick: () => openPanel(id) }); }
MENU_HOOKS.push(list => lifeLinks(list, ['yearreport', 'lifeplan', 'lifepaths', 'lifestories', 'adaptation', 'reputation', 'legacy']));
const _lifePanelPeople = panelPeople;
panelPeople = function () { lifeLinks(section('Личные истории'), ['lifepaths', 'lifestories', 'legacy']); _lifePanelPeople(); };
const _lifePanelJob = panelJob;
panelJob = function () { lifeLinks(section('Планы и возможности'), ['lifeplan', 'adaptation', 'reputation']); _lifePanelJob(); };
