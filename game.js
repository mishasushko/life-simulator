'use strict';
/* ===================== Жизнь — симулятор ===================== */

const SAVE_KEY = 'lifesim_save_v1';
const ACH_KEY = 'lifesim_ach_v1';
const $ = (s) => document.querySelector(s);

/* ---------- утилиты ---------- */
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const rf = (a, b) => Math.random() * (b - a) + a;
const chance = (p) => Math.random() < p;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function plural(n, f) { n = Math.abs(n) % 100; const n1 = n % 10; if (n > 10 && n < 20) return f[2]; if (n1 > 1 && n1 < 5) return f[1]; if (n1 === 1) return f[0]; return f[2]; }
const yrs = (n) => `${n} ${plural(n, ['год', 'года', 'лет'])}`;
function wpick(list) { const tot = list.reduce((s, x) => s + x.w, 0); let r = Math.random() * tot; for (const x of list) { if ((r -= x.w) < 0) return x; } return list[list.length - 1]; }

let S = null;          // состояние текущей жизни
let Q = [];            // очередь модальных событий
let globalAch = loadAch();

const C = () => COUNTRIES.find((c) => c.id === S.country) || COUNTRIES[0];
const price = (x) => Math.round(x * (0.5 + 0.5 * C().wage));
const wageOf = (x) => Math.round(x * C().wage);

function fmt(base, cur) {
  const c = cur || C();
  const v = base * c.rate;
  const a = Math.abs(v); const sign = v < 0 ? '−' : '';
  let s;
  if (a >= 1e9) s = (a / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace('.', ',') + ' млрд';
  else if (a >= 1e6) s = (a / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace('.', ',') + ' млн';
  else s = Math.round(a).toLocaleString('ru-RU');
  return `${sign}${s} ${c.cur}`;
}

/* ---------- имена ---------- */
function femSurname(s) {
  if (/(ов|ев|ёв|ин|ын)$/.test(s)) return s + 'а';
  if (/ский$/.test(s)) return s.replace(/ский$/, 'ская');
  if (/цкий$/.test(s)) return s.replace(/цкий$/, 'цкая');
  return s;
}
function randFirst(gender, pool) {
  const P = NAMES[pool || C().names];
  if (gender === 'm') return pick(P.m);
  if (gender === 'f') return pick(P.f);
  return pick(chance(0.5) ? P.m : P.f);
}
function surnameFor(base, gender, pool) {
  const P = NAMES[pool || C().names];
  return P.slav && gender === 'f' ? femSurname(base) : base;
}
function randSurnameBase(pool) { return pick(NAMES[pool || C().names].s); }
function npcGender() { return chance(0.5) ? 'm' : 'f'; }
const gv = (p, m, f, n) => (p.gender === 'm' ? m : p.gender === 'f' ? f : (n || m));

/* ---------- сохранение ---------- */
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } }
function loadAch() { try { return JSON.parse(localStorage.getItem(ACH_KEY)) || {}; } catch (e) { return {}; } }
function saveAch() { try { localStorage.setItem(ACH_KEY, JSON.stringify(globalAch)); } catch (e) {} }

/* ---------- лог ---------- */
function newYearBlock() { S.log.push({ age: S.age, year: S.year, items: [] }); if (S.log.length > 140) S.log.shift(); }
function log(t, c = '') { if (!S.log.length) newYearBlock(); S.log[S.log.length - 1].items.push({ t, c }); }

/* ---------- характеристики ---------- */
function eff(o) {
  for (const k of ['happy', 'health', 'smarts', 'looks']) if (o[k]) S.stats[k] = clamp(S.stats[k] + o[k]);
  if (o.karma) S.karma = clamp(S.karma + o.karma);
  if (o.money) S.money += o.money;
}
function netWorth() {
  let w = S.money - (S.loan ? S.loan.bal : 0);
  for (const a of S.assets) w += a.value;
  w += S.inv.deposit + S.inv.stocks + S.inv.crypto;
  if (S.biz) w += S.biz.value;
  return Math.round(w);
}

/* ---------- достижения ---------- */
function unlock(id) {
  if (S.ach[id]) return;
  S.ach[id] = S.age;
  const a = ACHIEVEMENTS.find((x) => x.id === id); if (!a) return;
  const isNew = !globalAch[id];
  globalAch[id] = true; saveAch();
  toast(`${a.e} Достижение: ${a.t}${isNew ? ' · новое!' : ''}`);
  log(`${a.e} Достижение «${a.t}»`, 'good');
}
function checkAch() {
  const nw = netWorth();
  if (nw >= 1e6) unlock('million');
  if (nw >= 1e8) unlock('hundredm');
  if (nw >= 1e9) unlock('billion');
  if (S.money <= -1e6) unlock('debt');
  if (S.stats.smarts >= 100) unlock('genius');
  if (S.stats.looks >= 100) unlock('beauty');
  if (S.stats.health >= 100 && S.age >= 10) unlock('athlete');
  if (S.karma >= 100) unlock('saint');
  if (S.karma <= 0) unlock('villain');
  if (S.followers >= 1e6) unlock('famous');
  if (S.visited.length >= 10) unlock('traveler');
  if (S.assets.filter((a) => a.type === 'car').length >= 3) unlock('collector');
  if (S.pets.filter((p) => p.alive).length >= 3) unlock('pets');
  if (S.people.filter((p) => p.role === 'child').length >= 4) unlock('bigfamily');
  if (S.age >= 90) unlock('old90');
  if (S.age >= 100) unlock('old100');
  if (S.templeVisits >= 10) unlock('faith');
  if (S.generation >= 5) unlock('gen5');
}

/* ===================== Новая жизнь ===================== */
function makePerson(role, o = {}) {
  const gender = o.gender || npcGender();
  const p = {
    id: uid(), role, gender,
    name: o.name || randFirst(gender, o.pool),
    surname: o.surname || '',
    age: o.age ?? 0, close: o.close ?? rnd(55, 90), alive: true,
    looks: o.looks ?? rnd(20, 95), smarts: o.smarts ?? rnd(20, 95),
    job: o.job || '', status: o.status || '', country: o.country || S?.country,
    money: o.money ?? 0
  };
  return p;
}
const NPC_JOBS = ['Учитель', 'Инженер', 'Врач', 'Продавец', 'Водитель', 'Бухгалтер', 'Программист', 'Повар', 'Медсестра', 'Строитель', 'Менеджер', 'Юрист', 'Дизайнер', 'Полицейский', 'Фермер', 'Предприниматель', 'Архитектор', 'Фотограф', 'Безработный', 'Музыкант', 'Учёный', 'Пилот', 'Бариста', 'Журналист'];

function newLife(opts = {}) {
  const country = opts.country || pick(COUNTRIES).id;
  const cObj = COUNTRIES.find((c) => c.id === country);
  const gender = opts.gender || (chance(0.03) ? 'nb' : npcGender());
  const orient = opts.orient || wpick([{ v: 'hetero', w: 80 }, { v: 'homo', w: 7 }, { v: 'bi', w: 8 }, { v: 'pan', w: 3 }, { v: 'ace', w: 2 }]).v;
  const religion = opts.religion || (chance(0.85) ? pick(cObj.rel) : pick(RELIGIONS).id);
  const sBase = opts.surname || pick(NAMES[cObj.names].s);
  S = {
    v: 1, first: opts.first || randFirst(gender, cObj.names), surnameBase: sBase,
    gender, orient, religion, country, birthCountry: country, city: pick(cObj.cities),
    age: 0, year: opts.year || new Date().getFullYear(), birthYear: opts.year || new Date().getFullYear(),
    alive: true, cause: '', money: 0,
    stats: { happy: rnd(60, 100), health: rnd(70, 100), smarts: rnd(10, 100), looks: rnd(10, 100) },
    karma: 50, followers: 0, fame: 0,
    edu: { level: 'none', stage: '', major: '', years: 0, grade: 60, majors: [] },
    job: null, career: [], retired: false, pension: 0,
    biz: null, loan: null, inv: { deposit: 0, stocks: 0, crypto: 0 },
    people: [], pets: [], assets: [], diseases: [],
    prison: null, crimes: 0, out: orient === 'hetero', templeVisits: 0,
    visited: [country], used: {}, log: [], ach: {}, generation: opts.generation || 1,
    stat: { maxNet: 0, partners: 0, jobs: 0, kids: 0 }
  };
  S.surname = surnameFor(sBase, gender, cObj.names);

  // родители
  if (!opts.noParents) {
    const sameSex = chance(0.05);
    const momG = 'f', dadG = sameSex ? 'f' : 'm';
    const pSur = sBase;
    const mom = makePerson('mother', { gender: momG, age: rnd(19, 40), pool: cObj.names, job: pick(NPC_JOBS), surname: surnameFor(pSur, momG, cObj.names), money: rnd(0, 5) * 1e6 });
    const dad = makePerson(sameSex ? 'mother' : 'father', { gender: dadG, age: rnd(20, 45), pool: cObj.names, job: pick(NPC_JOBS), surname: surnameFor(pSur, dadG, cObj.names), money: rnd(0, 5) * 1e6 });
    S.people.push(mom, dad);
    const sib = wpick([{ v: 0, w: 40 }, { v: 1, w: 35 }, { v: 2, w: 18 }, { v: 3, w: 7 }]).v;
    for (let i = 0; i < sib; i++) {
      const g = npcGender();
      S.people.push(makePerson('sibling', { gender: g, age: rnd(1, 12), pool: cObj.names, surname: surnameFor(pSur, g, cObj.names), close: rnd(40, 90) }));
    }
  }
  if (opts.after) opts.after(S);

  newYearBlock();
  const parents = S.people.filter((p) => p.role === 'mother' || p.role === 'father');
  log(`Вы родились ${S.year} года в городе ${S.city}, ${cObj.flag} ${cname(cObj)}.`);
  const nw0 = newsFor(S.year); if (nw0) log(`📰 ${nw0}`, 'news');
  if (parents.length) log(`Ваши родители: ${parents.map((p) => `${p.name} (${p.job.toLowerCase()})`).join(' и ')}.`, 'info');
  if (opts.generation > 1) log(`Поколение ${opts.generation} вашей династии.`, 'info');
  unlock('born');
  save();
}

/* ===================== Год жизни ===================== */
function ageUp() {
  if (!S.alive || !$('#modalWrap').hidden) return;
  S.age++; S.year++; S.used = {};
  newYearBlock();

  // люди и питомцы стареют
  for (const p of S.people) if (p.alive) p.age++;
  for (const p of S.pets) if (p.alive) p.age++;

  const nw = newsFor(S.year); if (nw) log(`📰 ${nw}`, 'news');
  yearEra();
  yearEducation();
  yearPrison();
  yearWork();
  yearMoney();
  yearBody();
  yearPeople();
  yearPets();
  yearDiseases();
  yearEvents();
  yearDeath();

  S.stat.maxNet = Math.max(S.stat.maxNet, netWorth());
  checkAch();
  save();
  render();
  scrollLog();
  pump();
}

function yearEducation() {
  const e = S.edu;
  if (S.prison) return;
  if (S.age === 3) log('Вы пошли в детский сад. 🧸');
  if (S.age === 6) { e.stage = 'school'; e.grade = clamp(S.stats.smarts + rnd(-15, 15)); log('🎒 Вы пошли в первый класс!'); }
  if (e.stage === 'school') {
    eff({ smarts: rnd(0, 3) });
    e.grade = clamp(e.grade + rnd(-6, 6) + (S.stats.smarts > 60 ? 1 : -1));
    if (S.age === 18) {
      e.stage = ''; e.level = 'school';
      const medal = e.grade >= 90;
      log(`🎓 Вы окончили школу${medal ? ' с золотой медалью 🥇' : ''}! Средний балл: ${(2 + e.grade / 33).toFixed(1).replace('.', ',')}.`, 'good');
      Q.push(afterSchoolEvent());
    }
    return;
  }
  if (e.stage === 'college' || e.stage === 'uni' || e.stage === 'master' || e.stage === 'phd') {
    if (e.tuition) { S.money -= e.tuition; log(`Плата за обучение: ${fmt(e.tuition)}.`, 'info'); }
    eff({ smarts: rnd(1, 4), happy: S.job ? -2 : 0 });
    e.grade = clamp(e.grade + rnd(-8, 6));
    e.years--;
    if (e.grade < 12 && chance(0.5)) {
      log('❌ Вас отчислили за неуспеваемость.', 'bad'); eff({ happy: -15 });
      e.stage = ''; e.tuition = 0; return;
    }
    if (e.years <= 0) {
      const map = { college: 'college', uni: 'bachelor', master: 'master', phd: 'phd' };
      e.level = map[e.stage];
      if (e.stage === 'uni') { e.majors.push(e.major); unlock('graduate'); }
      if (e.stage === 'phd') unlock('phd');
      const label = { college: 'колледж', uni: `университет (${MAJORS.find((m) => m.id === e.major)?.name})`, master: 'магистратуру', phd: 'аспирантуру и защитили диссертацию' }[e.stage];
      log(`🎓 Вы окончили ${label}!`, 'good'); eff({ happy: 10 });
      e.stage = ''; e.tuition = 0;
    }
  }
}

function afterSchoolEvent() {
  return {
    e: '🎓', title: 'Что дальше?', text: 'Школа позади. Перед вами весь мир. Чем займётесь?',
    choices: [
      { t: '🏛️ Поступать в университет', f: () => { setTimeout(() => openUniPick('uni'), 50); return null; } },
      { t: '🛠️ Пойти в колледж (3 года)', f: () => enroll('college') },
      { t: '💼 Сразу работать', f: () => { setTimeout(() => openPanel('job'), 50); return 'Вы решили не учиться дальше и искать работу.'; } },
      { t: '🌴 Взять год на отдых', f: () => { eff({ happy: 12 }); return 'Вы взяли год, чтобы отдохнуть и подумать о жизни.'; } }
    ]
  };
}

function enroll(stage, majorId) {
  const e = S.edu;
  if (stage === 'college') { e.stage = 'college'; e.years = 3; e.tuition = 0; e.grade = 60; log('🛠️ Вы поступили в колледж.', 'good'); return null; }
  if (stage === 'uni') {
    const m = MAJORS.find((x) => x.id === majorId);
    if (S.stats.smarts + rnd(-8, 8) < m.minSmarts) { log(`😞 Вы не прошли на «${m.name}». Не хватило баллов.`, 'bad'); eff({ happy: -8 }); return null; }
    const budget = S.stats.smarts >= m.minSmarts + 15;
    e.stage = 'uni'; e.major = m.id; e.years = m.years; e.grade = 60;
    e.tuition = budget ? 0 : price(320000);
    log(`🏛️ Вы поступили на «${m.name}» ${budget ? 'на бюджет! 🎉' : `на платное (${fmt(e.tuition)} в год).`}`, 'good');
    eff({ happy: 10 }); return null;
  }
  if (stage === 'master') { e.stage = 'master'; e.years = 2; e.grade = 60; e.tuition = S.stats.smarts > 75 ? 0 : price(380000); log('📘 Вы поступили в магистратуру.', 'good'); return null; }
  if (stage === 'phd') { e.stage = 'phd'; e.years = 3; e.grade = 60; e.tuition = 0; log('🔬 Вы поступили в аспирантуру.', 'good'); return null; }
}

function yearPrison() {
  if (!S.prison) return;
  S.prison.years--;
  eff({ happy: -rnd(3, 8), health: -rnd(0, 3) });
  if (S.prison.years <= 0) {
    log('🔓 Вы вышли на свободу. Начинаем с чистого листа.', 'good');
    S.prison = null; eff({ happy: 20 });
  } else {
    log(`⛓️ Вы в тюрьме. Осталось: ${yrs(S.prison.years)}.`, 'bad');
    if (chance(0.12)) { eff({ health: -rnd(5, 15) }); log('🥊 На вас напали в столовой.', 'bad'); }
  }
}

function jobSalary(j) {
  const def = JOBS.find((x) => x.id === j.id);
  return Math.round(wageOf(def.salary) * (1 + 0.55 * j.lvl) * (j.bonus || 1));
}

function yearWork() {
  if (S.prison) return;
  const j = S.job;
  if (j) {
    const def = JOBS.find((x) => x.id === j.id);
    const sal = jobSalary(j);
    const net = Math.round(sal * 0.87);
    S.money += net;
    j.years++; j.lvlYears++;
    j.perf = clamp(j.perf + rnd(-9, 5) + Math.round((S.stats.happy - 50) / 20));
    if (def.fame) S.followers += Math.round((j.lvl + 1) ** 3 * rnd(200, 2000));
    if (!def.part && j.perf >= 70 && j.lvlYears >= 2 && j.lvl < def.titles.length - 1 && chance(0.55)) {
      j.lvl++; j.lvlYears = 0; j.perf = 55;
      log(`📈 Повышение! Теперь вы — ${def.titles[j.lvl]}.`, 'good'); eff({ happy: 12 });
      if (j.lvl === def.titles.length - 1) { unlock('top'); if (def.id === 'politician') unlock('president'); }
      if (def.id === 'astro' && j.lvl >= 1) unlock('astronaut');
    } else if (j.perf < 15 && chance(0.6)) {
      log(`🚪 Вас уволили с должности «${def.titles[j.lvl]}».`, 'bad'); eff({ happy: -15 });
      S.job = null;
    }
    if (def.maxAge && S.age > def.maxAge + 5 && chance(0.4) && S.job) { log('⏳ Возраст берёт своё: карьера в спорте завершена.', 'info'); S.job = null; }
    if (def.part && S.age >= 22 && !S.edu.stage) eff({ happy: -2 });
  }
  if (!S.job && !S.retired && S.age >= 18 && !S.edu.stage && !S.biz) { const b = wageOf(110000); S.money += b; log(`🏛️ Пособие по безработице: ${fmt(b)}.`, 'info'); }
  if (S.edu.stage && S.edu.stage !== 'school' && !S.job) { const st = wageOf(40000); S.money += st; }
  if (S.retired && S.pension) S.money += S.pension;
  else if (!S.retired && S.age >= 67 && !S.job) { S.retired = true; S.pension = wageOf(180000); log(`🌅 Вы вышли на государственную пенсию: ${fmt(S.pension)} в год.`, 'info'); unlock('retired'); }
  if (!S.blogged && !(S.job && JOBS.find((j) => j.id === S.job.id).fame)) S.followers = Math.round(S.followers * 0.85);
  const active = S.blogged || (S.job && JOBS.find((j) => j.id === S.job.id).fame);
  S.blogged = false;
  if (S.followers >= 10000 && active) {
    const inc = Math.round(S.followers * 2.5 * C().wage);
    S.money += inc; log(`📱 Доход от блога: ${fmt(inc)}.`, 'info');
  }
  if (S.biz) yearBiz();
}

function yearBiz() {
  const b = S.biz;
  const r = rf(-0.28, 0.42) + (S.stats.smarts - 50) / 400 + (b.boost || 0);
  b.boost = 0;
  const profit = Math.round(b.value * r * 0.4);
  b.value = Math.max(0, Math.round(b.value * (1 + r)));
  b.years++;
  if (profit > 0) { S.money += profit; log(`🏭 «${b.name}» принёс прибыль ${fmt(profit)}.`, 'good'); }
  else log(`🏭 «${b.name}» в убытке: ${fmt(profit)}.`, 'bad'), (S.money += profit);
  if (b.value < b.start * 0.12) { log(`💥 Бизнес «${b.name}» обанкротился.`, 'bad'); eff({ happy: -20 }); S.biz = null; }
}

function yearMoney() {
  if (S.age < 18 || S.prison) return;
  const livesWithParents = S.age < 20 && S.people.some((p) => (p.role === 'mother' || p.role === 'father') && p.alive) && !S.ownHome;
  const home = S.assets.some((a) => a.type === 'house');
  const poor = !S.job && !S.biz && !S.retired && !S.edu.stage;
  let cost = price(poor ? 90000 : 140000); // еда и быт
  if (!home && !livesWithParents) cost += price(poor ? 20000 : S.edu.stage ? 60000 : 220000);
  if (S.money < 0 && S.assets.length && S.money < -netWorth()) {
    const a = S.assets.sort((x, y) => y.value - x.value)[0]; S.money += a.value; S.assets = S.assets.filter((x) => x !== a);
    log(`🏦 Приставы изъяли за долги: ${a.name}.`, 'bad'); eff({ happy: -12 });
  }
  for (const a of S.assets) cost += Math.round(a.value * (a.type === 'house' ? 0.005 : a.type === 'car' ? 0.03 : ['yacht', 'jet'].includes(a.id) ? 0.05 : 0));
  const kids = S.people.filter((p) => p.role === 'child' && p.alive && p.age < 18).length;
  cost += kids * price(120000);
  cost += S.pets.filter((p) => p.alive).length * price(25000);
  S.money -= cost;
  log(`🧾 Расходы на жизнь: ${fmt(cost)}${!home && !livesWithParents ? ' (включая аренду)' : ''}.`, 'info');
  if (S.loan) {
    S.loan.bal = Math.round(S.loan.bal * 1.07);
    const pay = Math.min(S.loan.bal, S.loan.pay);
    S.loan.bal -= pay; S.money -= pay;
    if (S.loan.bal <= 0) { S.loan = null; log('🏦 Ипотека полностью выплачена!', 'good'); eff({ happy: 10 }); }
    else log(`🏦 Платёж по ипотеке: ${fmt(pay)}. Осталось: ${fmt(S.loan.bal)}.`, 'info');
  }
  if (S.money < 0) {
    const pct = Math.round(-S.money * 0.12);
    S.money -= pct; log(`💳 Проценты по долгу: ${fmt(pct)}.`, 'bad'); eff({ happy: -3 });
    if (S.money < -price(3000000) && !S.assets.length) {
      log('⚖️ Вы объявлены банкротом. Долги списаны, но кредитная история испорчена.', 'bad');
      S.money = 0; S.inv = { deposit: 0, stocks: 0, crypto: 0 }; eff({ happy: -20 }); S.bankrupt = (S.bankrupt || 0) + 1;
    }
  }
  // активы
  for (const a of S.assets) {
    const k = a.type === 'house' ? rf(-0.03, 0.09) : a.type === 'car' ? rf(-0.15, -0.07) : ({ watch: 0.02, art: rf(-0.05, 0.15), jewel: 0.03, yacht: -0.07, jet: -0.08 }[a.id] ?? 0);
    a.value = Math.round(a.value * (1 + k));
  }
  // инвестиции
  const I = S.inv;
  if (I.deposit) I.deposit = Math.round(I.deposit * 1.07);
  if (I.stocks) { const r = rf(-0.22, 0.32); I.stocks = Math.round(I.stocks * (1 + r)); log(`📊 Акции: ${r >= 0 ? '+' : ''}${Math.round(r * 100)}%.`, r >= 0 ? 'good' : 'bad'); }
  if (I.crypto) { const r = chance(0.15) ? rf(-0.8, -0.5) : rf(-0.4, 1.2); I.crypto = Math.round(I.crypto * (1 + r)); log(`🪙 Крипта: ${r >= 0 ? '+' : ''}${Math.round(r * 100)}%.`, r >= 0 ? 'good' : 'bad'); }
}

function yearBody() {
  const s = S.stats;
  // здоровье стремится к возрастной норме
  const target = S.age < 45 ? 82 : Math.max(5, 82 - (S.age - 45) * 1.3);
  s.health = clamp(Math.round(s.health + (target - s.health) * 0.12 + rnd(-2, 2)));
  if (S.age > 40) eff({ looks: -rnd(0, 2) });
  if (S.age > 75) eff({ smarts: -rnd(0, 2) });
  if (S.age < 25) eff({ looks: rnd(-1, 2) });
  // счастье стремится к базе
  let base = 55;
  if (S.people.some((p) => p.role === 'partner' && p.alive)) base += 8;
  if (S.assets.some((a) => a.type === 'house')) base += 5;
  if (S.money < 0) base -= 10;
  if (S.pets.some((p) => p.alive)) base += 4;
  if (S.diseases.length) base -= 6;
  s.happy = clamp(Math.round(s.happy + (base - s.happy) * 0.15 + rnd(-4, 4)));
}

function yearPeople() {
  for (const p of S.people) {
    if (!p.alive) continue;
    if (['ex'].includes(p.role)) continue;
    p.close = clamp(p.close - rnd(0, p.role === 'partner' ? 5 : ['mother', 'father', 'child'].includes(p.role) ? 2 : 4));
    // смерть NPC
    const d = p.age > 60 ? ((p.age - 60) ** 2) * 0.0005 : 0.0007;
    if (chance(d)) {
      p.alive = false;
      const r = roleName(p);
      log(`🕯️ ${r} ${p.name} ${gv(p, 'умер', 'умерла', 'ушёл')} в возрасте ${yrs(p.age)}.`, 'bad');
      eff({ happy: -(p.close > 60 ? rnd(15, 30) : rnd(4, 10)) });
      if ((p.role === 'mother' || p.role === 'father') && p.money > 0 && p.close > 30) {
        const share = Math.round(p.money * rf(0.3, 0.9));
        S.money += share; log(`📜 Вы получили наследство: ${fmt(share)}.`, 'good');
      }
      if (p.role === 'partner') { p.role = 'late'; }
      continue;
    }
    if (p.role === 'child' && p.age === 18) { p.job = pick(NPC_JOBS); log(`🎓 ${p.name} ${gv(p, 'вырос и стал', 'выросла и стала', 'вырос(ла) и стал(а)')} самостоятельным человеком.`, 'info'); }
    if (p.role === 'child' && p.age === 25 && chance(0.5)) { log(`💐 ${p.name} ${gv(p, 'женился', 'вышла замуж', 'вступил(а) в брак')}!`, 'good'); eff({ happy: 6 }); }
    if (p.role === 'child' && p.age >= 24 && p.age <= 40 && chance(0.12)) {
      p.grandkids = (p.grandkids || 0) + 1;
      log(`👶 У ${p.name} родился ребёнок. Вы стали ${S.gender === 'm' ? 'дедушкой' : S.gender === 'f' ? 'бабушкой' : 'старшим поколением'}!`, 'good'); eff({ happy: 10 });
    }
    if (p.role === 'partner') {
      if (p.status === 'married' && p.close < 12 && chance(0.4)) {
        const loss = Math.max(0, Math.round(S.money * 0.4));
        S.money -= loss; p.role = 'ex'; p.status = '';
        log(`💔 ${p.name} подал${gv(p, '', 'а', '(а)')} на развод. Вы потеряли ${fmt(loss)} при разделе имущества.`, 'bad'); eff({ happy: -20 });
      } else if (p.status !== 'married' && p.close < 20 && chance(0.5)) {
        p.role = 'ex'; p.status = '';
        log(`💔 ${p.name} бросил${gv(p, '', 'а', '(а)')} вас.`, 'bad'); eff({ happy: -12 });
      }
    }
  }
}

function yearPets() {
  for (const p of S.pets) {
    if (!p.alive) continue;
    const def = PETS.find((x) => x.id === p.type);
    if (p.age > def.life + rnd(-2, 3) || chance(0.01)) {
      p.alive = false; log(`🌈 Ваш питомец ${p.name} (${def.name.toLowerCase()}) ушёл на радугу.`, 'bad'); eff({ happy: -rnd(8, 18) });
    }
  }
}

function yearDiseases() {
  const s = S.stats;
  for (const d of [...S.diseases]) {
    const def = DISEASES.find((x) => x.id === d.id);
    if (S.age < 18 && parentsAlive().length && chance(0.7)) { S.diseases = S.diseases.filter((x) => x !== d); log(`👩‍⚕️ Родители отвели вас к врачу. ${def.name} вылечена.`, 'good'); continue; }
    eff({ health: -Math.round(def.dmg * 0.7), happy: def.happy || 0, smarts: def.smarts || 0 });
    if (chance(def.heal)) { S.diseases = S.diseases.filter((x) => x !== d); log(`💪 Вы поправились: ${def.name.toLowerCase()} отступил${/а$|ь$/.test(def.name) ? 'а' : ''}.`, 'good'); }
  }
  const p = 0.05 + (100 - s.health) / 700 + (S.age > 50 ? (S.age - 50) / 250 : 0);
  if (chance(p)) {
    const pool = DISEASES.filter((d) => (d.minAge || 0) <= S.age && !S.diseases.some((x) => x.id === d.id));
    const wpool = pool.map((d) => ({ v: d, w: d.dmg > 12 ? 1 : d.dmg > 6 ? 3 : 8 }));
    if (wpool.length) {
      const d = wpick(wpool).v;
      S.diseases.push({ id: d.id, since: S.age });
      log(`🤒 Вам поставили диагноз: ${d.name}.`, 'bad'); eff({ happy: -4 });
    }
  }
}

function yearDeath() {
  if (S.stats.health <= 0) { const sd = S.diseases.map((d) => DISEASES.find((x) => x.id === d.id)).sort((a, b) => b.dmg - a.dmg)[0]; return die(sd && sd.dmg >= 8 ? sd.name : S.age > 70 ? 'Естественные причины' : 'Истощение организма'); }
  const life = C().life;
  let p = 0.0004 + Math.max(0, S.age - (life - 14)) ** 2 * 0.0004;
  p *= 1.6 - S.stats.health / 100;
  if (chance(p)) {
    const serious = S.diseases.map((d) => DISEASES.find((x) => x.id === d.id)).filter((d) => d.dmg >= 8);
    die(serious.length ? pick(serious).name : S.age > 70 ? 'Естественные причины' : pick(['Несчастный случай', 'Сердечный приступ', 'ДТП']));
  }
}

function die(cause) {
  if (!S.alive) return;
  S.alive = false; S.cause = cause;
  log(`🪦 Вы умерли в возрасте ${yrs(S.age)}. Причина: ${cause}.`, 'bad');
  if (S.age < 30) unlock('young');
  checkAch(); save();
}

/* ===================== Случайные события ===================== */
function ev(e, title, text, choices) { Q.push({ e, title, text, choices }); }
function partner() { return S.people.find((p) => p.role === 'partner' && p.alive); }
function parentsAlive() { return S.people.filter((p) => (p.role === 'mother' || p.role === 'father') && p.alive); }

const EVENTS = [
  // детство
  { min: 1, max: 1, w: 50, once: 'steps', run: () => log(`👣 Вы сделали первые шаги!`, 'good') },
  { min: 1, max: 2, w: 40, once: 'word', run: () => log(`🗣️ Ваше первое слово: «${pick(['мама', 'папа', 'дай', 'кот', 'нет', 'ням', 'баба', 'машина'])}».`) },
  { min: 2, max: 5, w: 20, once: 'bug', run: () => { log('🐛 Вы съели жука. Мама была в ужасе.'); eff({ health: -2, happy: 3 }); } },
  { min: 3, max: 6, w: 15, run: () => ev('🧸', 'Чужая игрушка', 'В садике другой ребёнок не даёт вам свою игрушку.', [
      { t: 'Отобрать', f: () => { eff({ karma: -4, happy: 3 }); return 'Вы отобрали игрушку. Воспитательница поставила вас в угол.'; } },
      { t: 'Предложить поменяться', f: () => { eff({ karma: 3, smarts: 2 }); return 'Вы обменялись игрушками и подружились.'; } },
      { t: 'Заплакать', f: () => { eff({ happy: -3 }); return 'Вы громко расплакались.'; } }]) },
  { min: 4, max: 10, w: 10, run: () => { log('🎨 Ваш рисунок повесили на стенд лучших работ!', 'good'); eff({ happy: 6 }); } },
  // школа
  { min: 7, max: 16, w: 14, run: () => ev('😠', 'Задира', `Одноклассник по имени ${randFirst('m')} постоянно задирает вас на перемене.`, [
      { t: '👊 Дать сдачи', f: () => chance(0.5 + (S.stats.health - 50) / 200) ? (eff({ happy: 8, karma: -2 }), 'Вы победили в драке. Задира больше не лезет.') : (eff({ health: -8, happy: -6 }), 'Вы проиграли драку и ходили с синяком.') },
      { t: '🧑‍🏫 Рассказать учителю', f: () => { eff({ karma: 2, happy: 2 }); return 'Учитель поговорил с задирой. Стало спокойнее.'; } },
      { t: '🙈 Игнорировать', f: () => { eff({ happy: -5 }); return 'Вы терпели насмешки весь год.'; } }]) },
  { min: 9, max: 17, w: 12, run: () => ev('📝', 'Контрольная', 'Сосед по парте предлагает списать ответы на контрольной.', [
      { t: 'Списать', f: () => chance(0.7) ? (S.edu.grade = clamp(S.edu.grade + 6), eff({ karma: -3 }), 'Вы списали и получили пятёрку.') : (S.edu.grade = clamp(S.edu.grade - 10), eff({ happy: -6 }), 'Вас поймали! Двойка и вызов родителей.') },
      { t: 'Решать самому', f: () => { eff({ smarts: 2, karma: 2 }); S.edu.grade = clamp(S.edu.grade + (S.stats.smarts > 55 ? 4 : -3)); return 'Вы решали сами — честно и с пользой.'; } }]) },
  { min: 10, max: 17, w: 8, cond: () => S.stats.smarts > 65, run: () => ev('🏆', 'Олимпиада', 'Вас приглашают на олимпиаду по математике.', [
      { t: 'Участвовать', f: () => chance(S.stats.smarts / 130) ? (eff({ happy: 12, smarts: 4 }), S.edu.grade = clamp(S.edu.grade + 8), 'Вы заняли первое место! 🥇') : (eff({ smarts: 2 }), 'Не победили, но получили ценный опыт.') },
      { t: 'Отказаться', f: () => 'Вы решили не тратить на это выходные.' }]) },
  { min: 12, max: 17, w: 10, run: () => ev('🚬', 'За гаражами', 'Друзья предлагают вам попробовать сигарету.', [
      { t: 'Попробовать', f: () => { eff({ health: -6, happy: 2, karma: -1 }); return 'Вы закашлялись. Гадость.'; } },
      { t: 'Отказаться', f: () => { eff({ health: 1, karma: 2 }); return 'Вы вежливо отказались.'; } }]) },
  { min: 12, max: 17, w: 10, run: () => ev('💌', 'Записка', 'Кто-то подбросил вам в рюкзак записку с сердечком.', [
      { t: 'Найти автора', f: () => { eff({ happy: 8 }); return 'Это была шутка друзей, но было приятно.'; } },
      { t: 'Выбросить', f: () => 'Вы выбросили записку.' }]) },
  { min: 13, max: 17, w: 8, run: () => ev('🎭', 'Школьный спектакль', 'Вам предлагают главную роль в школьном спектакле.', [
      { t: 'Согласиться', f: () => chance(0.6 + S.stats.looks / 300) ? (eff({ happy: 10, looks: 2 }), S.followers += rnd(20, 200), 'Аплодисменты стоя! 👏') : (eff({ happy: -6 }), 'Вы забыли слова посреди сцены...') },
      { t: 'Отказаться', f: () => 'Вы остались в зрительном зале.' }]) },
  { min: 14, max: 17, w: 8, run: () => ev('🎉', 'Вечеринка', 'Вас позвали на вечеринку, но родители запрещают.', [
      { t: 'Сбежать через окно', f: () => chance(0.5) ? (eff({ happy: 12 }), 'Лучшая ночь в жизни!') : (eff({ happy: -8 }), parentsAlive().forEach((p) => (p.close = clamp(p.close - 10))), 'Родители вас поймали. Домашний арест.') },
      { t: 'Остаться дома', f: () => { eff({ karma: 1 }); parentsAlive().forEach((p) => (p.close = clamp(p.close + 4))); return 'Вы остались дома с родителями.'; } }]) },
  { min: 17, max: 17, w: 30, run: () => ev('💃', 'Выпускной бал', 'Скоро выпускной. С кем пойдёте?', [
      { t: 'С симпатией', f: () => chance(0.55 + (S.stats.looks - 50) / 150) ? (eff({ happy: 15 }), 'Вам сказали «да»! Незабываемый вечер.') : (eff({ happy: -10 }), 'Вам отказали. Пошли с друзьями.') },
      { t: 'С друзьями', f: () => { eff({ happy: 8 }); return 'Вы весело отметили выпускной с друзьями.'; } },
      { t: 'Не пойду', f: () => 'Вы пропустили выпускной.' }]) },
  // взрослая жизнь
  { min: 18, max: 90, w: 8, run: () => ev('👛', 'Находка', `Вы нашли на улице кошелёк. Внутри ${fmt(price(15000))} и документы.`, [
      { t: 'Вернуть владельцу', f: () => { eff({ karma: 8, happy: 4 }); if (chance(0.3)) { S.money += price(10000); return 'Владелец был так благодарен, что дал вознаграждение!'; } return 'Вы вернули кошелёк. Карма +'; } },
      { t: 'Забрать деньги', f: () => { eff({ karma: -8 }); S.money += price(15000); return 'Вы оставили деньги себе.'; } }]) },
  { min: 18, max: 80, w: 7, run: () => { const f = randFirst(); ev('🤝', 'Просьба друга', `Старый знакомый ${f} просит одолжить ${fmt(price(100000))}.`, [
      { t: 'Одолжить', f: () => { S.money -= price(100000); if (chance(0.55)) { S.money += price(110000); eff({ karma: 3 }); return `${f} вернул(а) долг с процентами!`; } eff({ karma: 3, happy: -4 }); return `${f} так и не вернул(а) деньги.`; } },
      { t: 'Отказать', f: () => 'Вы отказали.' }]); } },
  { min: 20, max: 85, w: 1.2, run: () => { const sum = price(rnd(3, 50) * 100000); S.money += sum; log(`📜 Дальний родственник оставил вам наследство: ${fmt(sum)}!`, 'good'); eff({ happy: 10 }); } },
  { min: 18, max: 85, w: 5, cond: () => S.assets.some((a) => a.type === 'car'), run: () => ev('🚗', 'Авария', 'Вы попали в ДТП на перекрёстке.', [
      { t: 'Вызвать полицию', f: () => { eff({ health: -rnd(0, 15) }); return 'Оформили по закону. Страховка всё покрыла.'; } },
      { t: 'Скрыться с места', f: () => chance(0.5) ? (eff({ karma: -12 }), 'Вам удалось уехать незамеченным...') : (crimeCaught('Оставление места ДТП', 1), 'Вас нашли по камерам.') }]) },
  { min: 18, max: 85, w: 5, run: () => { const loss = Math.min(Math.max(S.money, 0), price(rnd(5, 60) * 1000)); S.money -= loss; log(`🦹 Вас ограбили на улице${loss ? ` и забрали ${fmt(loss)}` : ''}.`, 'bad'); eff({ happy: -8 }); } },
  { min: 25, max: 85, w: 5, run: () => ev('📞', 'Звонок из «банка»', 'Вам звонят из «службы безопасности банка» и просят назвать код из СМС.', [
      { t: 'Назвать код', f: () => { const l = Math.max(0, Math.round(S.money * 0.5)); S.money -= l; eff({ happy: -12 }); return `Это были мошенники. Вы потеряли ${fmt(l)}.`; } },
      { t: 'Положить трубку', f: () => { eff({ smarts: 1 }); return 'Вы распознали мошенников. Молодец!'; } }]) },
  { min: 22, max: 60, w: 5, cond: () => S.job, run: () => { const def = JOBS.find((j) => j.id === S.job.id); ev('📨', 'Хедхантер', `Конкурирующая компания предлагает вам должность «${def.titles[Math.min(S.job.lvl + 1, def.titles.length - 1)]}» с зарплатой на 30% выше.`, [
      { t: 'Принять', f: () => { S.job.lvl = Math.min(S.job.lvl + 1, def.titles.length - 1); S.job.bonus = (S.job.bonus || 1) * 1.1; S.job.lvlYears = 0; eff({ happy: 8 }); return 'Вы сменили компанию с повышением!'; } },
      { t: 'Остаться', f: () => { S.job.perf = clamp(S.job.perf + 10); return 'Вы остались. Начальство оценило лояльность.'; } }]); } },
  { min: 25, max: 70, w: 4, run: () => ev('💡', 'Инвестиционный совет', 'Коллега уверяет, что новая монета «MoonCoin» вырастет в 100 раз.', [
      { t: `Вложить ${fmt(price(200000))}`, f: () => { S.money -= price(200000); if (chance(0.12)) { S.money += price(5000000); eff({ happy: 20 }); return 'Монета выстрелила! Вы заработали целое состояние! 🚀'; } eff({ happy: -8 }); return 'Монета обнулилась. Деньги сгорели.'; } },
      { t: 'Не рисковать', f: () => 'Вы прошли мимо.' }]) },
  { min: 18, max: 60, w: 4, run: () => ev('🏃', 'Марафон', 'В городе проходит марафон. Участвуете?', [
      { t: 'Бежать', f: () => chance(S.stats.health / 110) ? (eff({ health: 5, happy: 10 }), 'Вы добежали до финиша! 🏅') : (eff({ health: -5 }), 'Вы сошли с дистанции на 20-м километре.') },
      { t: 'Болеть за других', f: () => { eff({ happy: 2 }); return 'Вы поддерживали бегунов с трибуны.'; } }]) },
  { min: 14, max: 60, w: 3, cond: () => S.year >= 2005, run: () => { const g = rnd(2000, 80000); S.followers += g; log(`🔥 Ваше видео стало вирусным! +${g.toLocaleString('ru-RU')} подписчиков.`, 'good'); eff({ happy: 8 }); } },
  { min: 25, max: 80, w: 3, cond: () => S.money > 0, run: () => { const f = Math.round(S.money * rf(0.05, 0.2)); S.money -= f; log(`🧾 Налоговая проверка нашла ошибки. Штраф: ${fmt(f)}.`, 'bad'); eff({ happy: -6 }); } },
  { min: 5, max: 90, w: 3, run: () => log(pick(['🛸 Вы видели странные огни в небе. НЛО?', '🌈 Вы увидели двойную радугу.', '👻 В вашем доме по ночам что-то скрипит.', '🍀 Вы нашли четырёхлистный клевер.', '⭐ Вы загадали желание на падающую звезду.', '🐈 Чёрная кошка перебежала вам дорогу.'])) },
  { min: 18, max: 75, w: 4, run: () => ev('🎤', 'Конкурс талантов', 'По телевизору открыт кастинг в шоу талантов.', [
      { t: 'Пойти на кастинг', f: () => chance(0.15 + S.stats.looks / 400) ? (S.followers += rnd(50000, 600000), S.money += price(1000000), eff({ happy: 18 }), 'Вы победили в шоу! Слава и приз! 🌟') : (eff({ happy: -5 }), 'Жюри сказало «нет». Ничего, бывает.') },
      { t: 'Смотреть по ТВ', f: () => 'Вы посмотрели шоу с попкорном.' }]) },
  { min: 18, max: 80, w: 4, run: () => ev('🐕', 'Бездомный пёс', 'У подъезда сидит голодный щенок и смотрит на вас.', [
      { t: 'Забрать домой', f: () => { addPet('dog'); eff({ karma: 6, happy: 8 }); return 'Теперь у вас есть верный друг!'; } },
      { t: 'Покормить', f: () => { eff({ karma: 3 }); return 'Вы купили ему сосиску.'; } },
      { t: 'Пройти мимо', f: () => { eff({ karma: -2 }); return 'Вы прошли мимо.'; } }]) },
  { min: 18, max: 70, w: 3, cond: () => S.religion && !['Атеизм', 'Агностицизм'].includes(S.religion), run: () => ev('🙏', 'Религиозный праздник', `Наступает большой праздник вашей веры (${S.religion}). Как проведёте день?`, [
      { t: 'С семьёй и общиной', f: () => { eff({ happy: 8, karma: 3 }); S.people.filter((p) => p.alive && ['mother', 'father', 'sibling', 'child', 'partner'].includes(p.role)).forEach((p) => (p.close = clamp(p.close + 5))); return 'Тёплый день с близкими.'; } },
      { t: 'Как обычный день', f: () => 'Вы провели день как обычно.' }]) },
  { min: 16, max: 60, w: 5, cond: () => !partner() && S.orient !== 'ace', run: () => { const g = loveGender(); const n = randFirst(g); ev('💘', 'Новое знакомство', `${n} (${S.age + rnd(-3, 3)}) явно с вами флиртует.`, [
      { t: 'Пригласить на свидание', f: () => chance(0.45 + S.stats.looks / 250) ? (addPartner(g, n), `Вы начали встречаться с ${n}! 💕`) : (eff({ happy: -5 }), `${n} отказал(а).`) },
      { t: 'Не сейчас', f: () => 'Вы улыбнулись и пошли дальше.' }]); } },
  { min: 20, max: 70, w: 4, cond: () => partner()?.status === 'married', run: () => { const p = partner(); ev('🌹', 'Годовщина', `Сегодня годовщина свадьбы с ${p.name}.`, [
      { t: `Ужин в ресторане (${fmt(price(15000))})`, f: () => { S.money -= price(15000); p.close = clamp(p.close + 15); eff({ happy: 8 }); return 'Романтичный вечер.'; } },
      { t: 'Забыть о ней', f: () => { p.close = clamp(p.close - 20); return `${p.name} очень обидел${gv(p, 'ся', 'ась', 'ся(ась)')}.`; } }]); } },
  { min: 25, max: 75, w: 3, cond: () => partner(), run: () => { const p = partner(); ev('😳', 'Искушение', 'Коллега на корпоративе откровенно вас соблазняет.', [
      { t: 'Поддаться', f: () => { eff({ karma: -10, happy: 5 }); if (chance(0.5)) { p.close = clamp(p.close - 50); return `${p.name} всё узнал${gv(p, '', 'а', '(а)')}... Отношения на грани.`; } return 'Никто не узнал. Пока.'; } },
      { t: 'Остаться верным', f: () => { eff({ karma: 5 }); p.close = clamp(p.close + 5); return 'Вы сохранили верность.'; } }]); } },
  { min: 30, max: 90, w: 3, run: () => ev('🩺', 'Медосмотр', 'Врач рекомендует пройти полное обследование.', [
      { t: `Пройти (${fmt(price(30000))})`, f: () => { S.money -= price(30000); const n = S.diseases.length; S.diseases = S.diseases.filter((d) => !chance(0.5)); eff({ health: 5 }); return n ? 'Вовремя нашли и подлечили проблемы.' : 'Всё в порядке! Здоровье отличное.'; } },
      { t: 'Да ну, я здоров', f: () => 'Вы решили не тратить время.' }]) },
  { min: 40, max: 95, w: 3, run: () => { log('📖 Вы перечитали свой старый дневник и вспомнили юность.', 'info'); eff({ happy: 4 }); } },
  { min: 60, max: 100, w: 4, cond: () => S.people.some((p) => p.role === 'child' && p.alive), run: () => { const c = pick(S.people.filter((p) => p.role === 'child' && p.alive)); log(`👨‍👩‍👧 ${c.name} привез${gv(c, '', 'ла', '(ла)')} внуков в гости.`, 'good'); eff({ happy: 8 }); c.close = clamp(c.close + 5); } },
  { min: 55, max: 95, w: 2, run: () => ev('✍️', 'Мемуары', 'Издательство предлагает написать книгу о вашей жизни.', [
      { t: 'Написать', f: () => { const r = price(rnd(1, 30) * 100000); S.money += r; S.followers += rnd(1000, 50000); eff({ happy: 10, smarts: 3 }); return `Книга вышла! Гонорар: ${fmt(r)}.`; } },
      { t: 'Отказаться', f: () => 'Ваши истории останутся с вами.' }]) },
  { min: 18, max: 80, w: 2, run: () => ev('🎟️', 'Лотерейный билет', 'Кассир предлагает лотерейный билет на сдачу.', [
      { t: 'Взять', f: () => lottery() },
      { t: 'Нет, спасибо', f: () => 'Вы забрали сдачу.' }]) },
  { min: 18, max: 70, w: 2, run: () => { log('🦠 В стране эпидемия гриппа. Вы переболели.', 'bad'); eff({ health: -rnd(3, 10) }); } },
  { min: 21, max: 70, w: 3, run: () => ev('🍸', 'Бар', 'Пьяный посетитель бара толкнул вас и пролил ваш напиток.', [
      { t: 'Ударить', f: () => chance(0.3) ? (crimeCaught('Драка', 1), 'Приехала полиция.') : (eff({ health: -rnd(0, 10), karma: -3 }), 'Драка закончилась ничьей.') },
      { t: 'Попросить извиниться', f: () => { eff({ karma: 2 }); return 'Он извинился и купил вам новый напиток.'; } },
      { t: 'Уйти', f: () => 'Вы ушли домой.' }]) },
  { min: 10, max: 60, w: 3, run: () => { const fr = makePerson('friend', { age: Math.max(5, S.age + rnd(-3, 3)), close: rnd(40, 70) }); S.people.push(fr); log(`👋 Вы познакомились с ${fr.name}. Кажется, это начало дружбы.`, 'good'); } },
  { min: 12, max: 30, w: 3, cond: () => !S.out && S.orient !== 'hetero', run: () => ev('🏳️‍🌈', 'Быть собой', 'Вы давно чувствуете, что хотите рассказать близким о своей ориентации.', [
      { t: 'Совершить каминг-аут', f: () => comingOut() },
      { t: 'Пока подождать', f: () => { eff({ happy: -3 }); return 'Вы решили подождать подходящего момента.'; } }]) },
  { min: 30, max: 85, w: 3, cond: () => S.assets.some((a) => a.type === 'house'), run: () => ev('🔥', 'Пожар', 'В вашем доме загорелась проводка!', [
      { t: 'Тушить самому', f: () => chance(0.6) ? (eff({ karma: 2 }), 'Вы потушили огонь огнетушителем. Герой!') : (eff({ health: -15 }), damageHouse(0.3), 'Вы обожглись, дом пострадал.') },
      { t: 'Звонить 112', f: () => { damageHouse(0.1); return 'Пожарные приехали быстро. Ущерб небольшой.'; } }]) },
  { min: 5, max: 17, w: 4, cond: () => parentsAlive().length === 2 && !S.parentsDivorced, run: () => { if (chance(0.3)) { S.parentsDivorced = true; log('💔 Ваши родители развелись.', 'bad'); eff({ happy: -12 }); } } }
];

function damageHouse(k) { const h = S.assets.find((a) => a.type === 'house'); if (h) h.value = Math.round(h.value * (1 - k)); }

function yearEvents() {
  if (S.prison) { if (chance(0.2)) ev('⛓️', 'Сокамерник', 'Сокамерник предлагает план побега.', [
    { t: 'Участвовать', f: () => tryEscape() }, { t: 'Отказаться', f: () => { S.prison.years = Math.max(1, S.prison.years - (chance(0.3) ? 1 : 0)); return 'Вы отказались. Охрана это заметила.'; } }]); return; }
  const n = chance(0.65) ? 1 : chance(0.3) ? 2 : 0;
  S.seen = S.seen || {};
  const pool = EVENTS.filter((e) => S.age >= e.min && S.age <= e.max && (!e.once || !S.seen[e.once]) && (!e.cond || e.cond()));
  const used = new Set();
  for (let i = 0; i < n && pool.length; i++) {
    const e = wpick(pool.filter((x) => !used.has(x)));
    if (!e) break; used.add(e); if (e.once) S.seen[e.once] = 1; e.run();
  }
}

/* ===================== Люди / любовь ===================== */
function roleName(p) {
  const r = {
    mother: gv(p, 'Отец', 'Мама', 'Родитель'), father: gv(p, 'Папа', 'Мама', 'Родитель'),
    sibling: gv(p, 'Брат', 'Сестра', 'Сиблинг'), child: gv(p, 'Сын', 'Дочь', 'Ребёнок'),
    friend: gv(p, 'Друг', 'Подруга', 'Друг'), ex: gv(p, 'Бывший', 'Бывшая', 'Бывш.'), late: 'Покойный партнёр'
  };
  if (p.role === 'partner') return p.status === 'married' ? gv(p, 'Муж', 'Жена', 'Супруг(а)') : p.status === 'engaged' ? gv(p, 'Жених', 'Невеста', 'Партнёр') : gv(p, 'Парень', 'Девушка', 'Партнёр');
  return r[p.role] || '';
}
function loveGender() {
  const o = S.orient, g = S.gender;
  const opp = g === 'm' ? 'f' : g === 'f' ? 'm' : npcGender();
  if (o === 'hetero') return opp;
  if (o === 'homo') return g === 'nb' ? (chance(0.5) ? 'nb' : npcGender()) : g;
  if (o === 'pan') return chance(0.1) ? 'nb' : npcGender();
  return npcGender();
}
function addPartner(g, name) {
  const p = makePerson('partner', { gender: g, name, age: Math.max(16, S.age + rnd(-5, 5)), close: rnd(60, 90), job: S.age >= 20 ? pick(NPC_JOBS) : 'Учится', status: 'dating', money: rnd(0, 3) * 1e6 });
  S.people.push(p); S.stat.partners++;
  unlock('firstlove'); eff({ happy: 12 });
  return p;
}
function addPet(type) {
  const def = PETS.find((p) => p.id === type);
  S.pets.push({ id: uid(), type, name: pick(PET_NAMES), age: rnd(0, 2), alive: true, close: 80 });
  checkAch();
  return def;
}
function comingOut() {
  S.out = true; unlock('comingout');
  const reacts = [];
  for (const p of S.people.filter((x) => x.alive && ['mother', 'father', 'sibling', 'friend'].includes(x.role))) {
    if (chance(0.78)) { p.close = clamp(p.close + rnd(3, 12)); reacts.push(`${p.name} поддержал${gv(p, '', 'а', '(а)')} вас`); }
    else { p.close = clamp(p.close - rnd(10, 25)); reacts.push(`${p.name} отреагировал${gv(p, '', 'а', '(а)')} холодно`); }
  }
  eff({ happy: 15 });
  return `Вы рассказали близким, кто вы. ${reacts.slice(0, 4).join(', ')}.`;
}

/* ===================== Криминал ===================== */
function crimeCaught(crime, baseYears) {
  unlock('prison');
  Q.push({
    e: '⚖️', title: 'Суд', text: `Вас обвиняют: ${crime}. Прокурор требует ${yrs(baseYears + 1)}.`,
    choices: [
      { t: `Нанять адвоката (${fmt(price(300000))})`, f: () => { S.money -= price(300000); if (chance(0.55)) { eff({ happy: 5 }); return 'Адвокат добился оправдательного приговора! 🎉'; } return jail(crime, baseYears); } },
      { t: 'Признать вину', f: () => jail(crime, Math.max(1, baseYears - 1)) },
      { t: 'Бесплатный защитник', f: () => chance(0.2) ? 'Чудо! Вас оправдали.' : jail(crime, baseYears + 1) }
    ]
  });
}
function jail(crime, years) {
  S.prison = { years, crime };
  if (S.job) { log('Вас уволили с работы.', 'bad'); S.job = null; }
  if (S.edu.stage && S.edu.stage !== 'school') { S.edu.stage = ''; S.edu.tuition = 0; }
  eff({ happy: -25, karma: -5 });
  const p = partner(); if (p && chance(0.4)) { p.role = 'ex'; p.status = ''; log(`💔 ${p.name} ушл${gv(p, 'ёл', 'а', '(а)')} от вас.`, 'bad'); }
  return `Приговор: ${yrs(years)} лишения свободы. ⛓️`;
}
function tryEscape() {
  if (chance(0.22)) { S.prison = null; unlock('escape'); eff({ happy: 20, karma: -5 }); return 'Вы сбежали из тюрьмы! 🏃 Теперь главное — не попадаться.'; }
  S.prison.years += rnd(2, 4); eff({ health: -rnd(5, 15), happy: -10 });
  return `Побег провалился. Срок увеличен до ${yrs(S.prison.years)}.`;
}
function lottery() {
  S.money -= price(500);
  const r = Math.random();
  if (r < 0.002) { const w = price(50000000); S.money += w; unlock('jackpot'); eff({ happy: 40 }); return `🎉 ДЖЕКПОТ! Вы выиграли ${fmt(w)}!`; }
  if (r < 0.03) { const w = price(rnd(10, 200) * 1000); S.money += w; eff({ happy: 8 }); return `Выигрыш: ${fmt(w)}!`; }
  if (r < 0.2) { S.money += price(1000); return `Вы выиграли ${fmt(price(1000))}. Почти окупилось.`; }
  return 'Билет оказался пустым.';
}

/* ===================== Занятия ===================== */
const notInPrison = () => !S.prison;
const ACTIVITIES = [
  // тело
  { id: 'gym', cat: 'Тело и здоровье', e: '🏋️', t: 'Спортзал', d: '+здоровье, +внешность', min: 12, cost: 0, run: () => { const h = rnd(3, 8), l = rnd(0, 3); eff({ health: h, looks: l, happy: 2 }); return ['💪', 'Тренировка', `Отличная тренировка! Здоровье +${h}${l ? `, внешность +${l}` : ''}.`]; } },
  { id: 'run', cat: 'Тело и здоровье', e: '🏃', t: 'Пробежка в парке', d: 'Бесплатно и полезно', min: 8, run: () => { eff({ health: rnd(2, 5), happy: rnd(1, 4) }); return ['🌳', 'Пробежка', 'Свежий воздух и бодрость.']; } },
  { id: 'diet', cat: 'Тело и здоровье', e: '🥗', t: 'Правильное питание', d: '+здоровье на год', min: 14, cost: 30000, run: () => { eff({ health: rnd(3, 7), looks: rnd(1, 3), happy: -2 }); return ['🥦', 'Диета', 'Вы целый год питались правильно. Чувствуете себя лучше.']; } },
  { id: 'doctor', cat: 'Тело и здоровье', e: '🩺', t: 'Врач', d: 'Лечение болезней', min: 0, cost: 15000, freeUnder: 18, run: () => treat(false) },
  { id: 'clinic', cat: 'Тело и здоровье', e: '🏥', t: 'Частная клиника', d: 'Лучшее лечение', min: 18, cost: 600000, run: () => treat(true) },
  { id: 'salon', cat: 'Тело и здоровье', e: '💇', t: 'Салон красоты', d: '+внешность', min: 12, cost: 12000, run: () => { const l = rnd(1, 5); eff({ looks: l, happy: 4 }); return ['💅', 'Салон', `Новый образ! Внешность +${l}.`]; } },
  { id: 'surgery', yr: 1950, cat: 'Тело и здоровье', e: '💉', t: 'Пластическая операция', d: 'Риск есть всегда', min: 18, cost: 700000, run: () => { if (chance(0.82)) { const l = rnd(8, 22); eff({ looks: l, happy: 10 }); return ['✨', 'Успех!', `Операция прошла отлично. Внешность +${l}.`]; } eff({ looks: -rnd(8, 18), health: -8, happy: -15 }); return ['😱', 'Неудача', 'Хирург ошибся. Результат хуже, чем было.']; } },
  // разум и дух
  { id: 'study', cat: 'Разум и дух', e: '📖', t: 'Учиться усерднее', d: '+оценки, +ум', min: 6, cond: () => S.edu.stage, run: () => { S.edu.grade = clamp(S.edu.grade + rnd(6, 14)); eff({ smarts: rnd(1, 4), happy: -2 }); return ['📚', 'Зубрёжка', 'Ваша успеваемость выросла.']; } },
  { id: 'library', cat: 'Разум и дух', e: '📚', t: 'Библиотека', d: '+ум', min: 6, run: () => { const s = rnd(2, 6); eff({ smarts: s, happy: 1 }); return ['📕', 'Библиотека', `Вы прочитали несколько книг. Ум +${s}.`]; } },
  { id: 'lang', cat: 'Разум и дух', e: '🗣️', t: 'Учить иностранный язык', d: '+ум', min: 8, cost: 20000, run: () => { eff({ smarts: rnd(3, 6) }); return ['🌐', 'Язык', `Вы подтянули ${pick(['английский', 'испанский', 'китайский', 'японский', 'французский', 'немецкий', 'корейский', 'арабский'])}.`]; } },
  { id: 'chess', cat: 'Разум и дух', e: '♟️', t: 'Шахматный клуб', d: '+ум', min: 6, run: () => { eff({ smarts: rnd(1, 4), happy: rnd(0, 3) }); return ['♟️', 'Шахматы', chance(0.3) ? 'Вы выиграли турнир клуба!' : 'Партия была напряжённой.']; } },
  { id: 'meditate', cat: 'Разум и дух', e: '🧘', t: 'Медитация', d: '+счастье', min: 10, run: () => { const h = rnd(4, 10); eff({ happy: h, health: 1 }); return ['🧘', 'Медитация', `Вы обрели внутренний покой. Счастье +${h}.`]; } },
  { id: 'therapy', cat: 'Разум и дух', e: '🛋️', t: 'Психотерапевт', d: '+счастье, лечит депрессию', min: 14, cost: 60000, run: () => { eff({ happy: rnd(8, 15) }); const d = S.diseases.find((x) => x.id === 'depression'); if (d && chance(0.6)) { S.diseases = S.diseases.filter((x) => x !== d); return ['🛋️', 'Терапия', 'Вам стало намного легче. Депрессия отступила.']; } return ['🛋️', 'Терапия', 'Разговор с психотерапевтом очень помог.']; } },
  { id: 'temple', cat: 'Разум и дух', e: '🕍', t: 'Посетить храм', d: 'Вера и покой', min: 5, cond: () => !['Атеизм', 'Агностицизм'].includes(S.religion), label: () => `Сходить ${TEMPLE[S.religion] || 'в храм'}`, run: () => { S.templeVisits++; eff({ happy: rnd(3, 8), karma: 2 }); return [RELIGIONS.find((r) => r.id === S.religion)?.e || '🙏', 'Вера', `Вы сходили ${TEMPLE[S.religion] || 'в храм'}. На душе стало светлее.`]; } },
  { id: 'volunteer', cat: 'Разум и дух', e: '🤲', t: 'Волонтёрство', d: '+карма', min: 12, run: () => { eff({ karma: rnd(4, 9), happy: rnd(3, 6) }); return ['🤲', 'Доброе дело', `Вы помогали ${pick(['в приюте для животных', 'в доме престарелых', 'на субботнике', 'в фонде помощи детям', 'на кухне для бездомных'])}.`]; } },
  { id: 'charity', cat: 'Разум и дух', e: '💝', t: 'Пожертвовать 10% капитала', d: '+карма, +счастье', min: 18, cond: () => S.money > 100000, run: () => { const d = Math.round(S.money * 0.1); S.money -= d; eff({ karma: 12, happy: 8 }); S.followers += Math.round(d / 1000); return ['💝', 'Благотворительность', `Вы пожертвовали ${fmt(d)}. Мир стал немного лучше.`]; } },
  // развлечения
  { id: 'games', cat: 'Развлечения', e: '🎮', t: 'Видеоигры', d: '+счастье', min: 5, yr: 1975, run: () => { eff({ happy: rnd(3, 7), health: -1 }); return ['🎮', 'Геймер', `Вы прошли ${pick(['новую RPG', 'кооператив с друзьями', 'хоррор', 'гонки', 'стратегию на 200 часов'])}.`]; } },
  { id: 'party', cat: 'Развлечения', e: '🎉', t: 'Вечеринка', d: 'Новые знакомства', min: 15, run: () => { eff({ happy: rnd(5, 12), health: -rnd(0, 4) }); if (chance(0.35)) { const f = makePerson('friend', { age: S.age + rnd(-3, 3), close: rnd(40, 70) }); S.people.push(f); return ['🎉', 'Вечеринка', `Вы отлично повеселились и подружились с ${f.name}!`]; } return ['🎉', 'Вечеринка', 'Было громко и весело!']; } },
  { id: 'concert', cat: 'Развлечения', e: '🎵', t: 'Концерт', d: '+счастье', min: 12, cost: 8000, run: () => { eff({ happy: rnd(6, 12) }); return ['🎸', 'Концерт', 'Вы сорвали голос, подпевая любимой группе.']; } },
  { id: 'travel', cat: 'Развлечения', e: '✈️', t: 'Путешествие', d: 'Новая страна', min: 18, cost: 180000, run: () => { const opts = COUNTRIES.filter((c) => c.id !== S.country); const c = pick(opts); if (!S.visited.includes(c.id)) S.visited.push(c.id); eff({ happy: rnd(10, 18), smarts: 2 }); return [c.flag, 'Путешествие', `Вы слетали в страну ${c.name} и посетили ${pick(c.cities)}. Посещено стран: ${S.visited.length}.`]; } },
  { id: 'blog', cat: 'Развлечения', e: '📱', t: 'Снять видео для блога', d: 'Подписчики и доход', min: 12, yr: 2005, run: () => { const base = Math.max(30, Math.round(S.followers * rf(0.04, 0.25))); const viral = chance(0.06); const g = Math.round(base * (0.5 + S.stats.looks / 100 + S.stats.smarts / 200) * (viral ? rnd(8, 30) : 1)); S.followers += g; S.blogged = true; eff({ happy: 3 }); return ['📱', viral ? 'Вирусное видео! 🔥' : 'Новое видео', `+${g.toLocaleString('ru-RU')} подписчиков. Всего: ${S.followers.toLocaleString('ru-RU')}.`]; } },
  // любовь
  { id: 'dating', cat: 'Любовь и общение', e: '💘', t: 'Знакомства', label: () => S.year >= 2009 ? 'Приложение для знакомств' : 'Пойти на танцы', d: 'Найти пару', min: 16, cond: () => !partner(), run: () => findLove() },
  { id: 'friend', cat: 'Любовь и общение', e: '👋', t: 'Найти друга', d: 'Новое знакомство', min: 5, run: () => { const f = makePerson('friend', { age: Math.max(5, S.age + rnd(-4, 4)), close: rnd(45, 75) }); S.people.push(f); eff({ happy: 4 }); return ['👋', 'Новый друг', `Вы познакомились с ${f.name}. ${f.gender === 'f' ? 'Она' : 'Он'} кажется классн${f.gender === 'f' ? 'ой' : 'ым'}!`]; } },
  { id: 'pet', cat: 'Любовь и общение', e: '🐾', t: 'Завести питомца', d: 'Пушистый друг', min: 6, run: () => { setTimeout(openPetShop, 30); return null; } },
  { id: 'comingout', cat: 'Любовь и общение', e: '🏳️‍🌈', t: 'Каминг-аут', d: 'Рассказать близким', min: 12, cond: () => !S.out && S.orient !== 'hetero', run: () => ['🏳️‍🌈', 'Быть собой', comingOut()] },
  // риск
  { id: 'casino', cat: 'Азарт и риск', e: '🎰', t: 'Казино', d: 'Удача любит смелых', min: 18, run: () => { setTimeout(openCasino, 30); return null; } },
  { id: 'lottery', cat: 'Азарт и риск', e: '🎟️', t: 'Лотерея', d: 'Шанс на джекпот', min: 18, cost: 500, run: () => { S.money += price(500); return ['🎟️', 'Лотерея', lottery()]; } },
  { id: 'theft', cat: 'Азарт и риск', e: '🧤', t: 'Мелкая кража', d: 'Риск тюрьмы', min: 12, crime: true, run: () => crime('Кража', 0.28, 3000, 40000, 1) },
  { id: 'carjack', cat: 'Азарт и риск', e: '🚘', t: 'Угнать машину', d: 'Серьёзный риск', min: 16, crime: true, run: () => crime('Угон автомобиля', 0.45, 300000, 2500000, 3) },
  { id: 'hack', cat: 'Азарт и риск', e: '💻', t: 'Хакерская атака', d: 'Нужен ум 75+', min: 15, yr: 1990, crime: true, cond: () => S.stats.smarts >= 75, run: () => crime('Кибермошенничество', 0.33, 500000, 15000000, 4) },
  { id: 'heist', cat: 'Азарт и риск', e: '🏦', t: 'Ограбить банк', d: 'Всё или ничего', min: 18, crime: true, run: () => crime('Вооружённое ограбление', 0.72, 5000000, 80000000, 9) },
  // жизнь
  { id: 'emigrate', cat: 'Жизнь', e: '🛫', t: 'Переехать в другую страну', d: 'Новая жизнь за границей', min: 18, cost: 300000, run: () => { S.money += price(300000); setTimeout(openEmigrate, 30); return null; } },
  { id: 'religion', cat: 'Жизнь', e: '🔄', t: 'Сменить религию', d: `Выбор веры`, min: 14, run: () => { setTimeout(openReligion, 30); return null; } },
  { id: 'identity', cat: 'Жизнь', e: '⚧️', t: 'Гендерная идентичность', d: 'Изменить пол', min: 16, run: () => { setTimeout(openGender, 30); return null; } }
];
const PRISON_ACTS = [
  { id: 'p_gym', e: '🏋️', t: 'Тренироваться во дворе', d: '+здоровье', run: () => { eff({ health: rnd(3, 7) }); return ['🏋️', 'Тюремный двор', 'Вы отжимались до изнеможения.']; } },
  { id: 'p_read', e: '📚', t: 'Тюремная библиотека', d: '+ум', run: () => { eff({ smarts: rnd(2, 5) }); return ['📚', 'Книги', 'Вы прочли всё, что было на полке.']; } },
  { id: 'p_good', e: '😇', t: 'Примерное поведение', d: 'Шанс УДО', run: () => { eff({ karma: 3 }); if (chance(0.25)) { S.prison.years = Math.max(0, S.prison.years - 1); return ['😇', 'УДО', `Срок сокращён! Осталось ${yrs(S.prison.years)}.`]; } return ['😇', 'Поведение', 'Охрана отметила ваше поведение.']; } },
  { id: 'p_escape', e: '🏃', t: 'Побег', d: 'Очень рискованно', run: () => ['🏃', 'Побег', tryEscape()] }
];

function crime(name, risk, min, max, years) {
  S.crimes++; eff({ karma: -rnd(5, 12) });
  if (chance(risk)) { crimeCaught(name, years); return ['🚨', 'Попались!', 'Вас задержала полиция.']; }
  const g = price(rnd(min, max)); S.money += g; eff({ happy: 5 });
  return ['🤑', 'Успех', `Вы провернули дело и получили ${fmt(g)}. Не попадайтесь.`];
}
function treat(premium) {
  if (!S.diseases.length) { eff({ health: rnd(2, 5) }); return ['🩺', 'Осмотр', 'Врач сказал, что вы здоровы. Профилактика пошла на пользу.']; }
  const cured = [];
  for (const d of [...S.diseases]) {
    const def = DISEASES.find((x) => x.id === d.id);
    if (chance(premium ? Math.min(0.97, def.cure + 0.35) : def.cure)) { cured.push(def.name); S.diseases = S.diseases.filter((x) => x !== d); }
  }
  eff({ health: premium ? rnd(8, 15) : rnd(2, 6) });
  return cured.length ? ['💊', 'Лечение', `Вылечено: ${cured.join(', ')}.`] : ['😔', 'Лечение', 'Лечение не помогло. Попробуйте ещё раз в следующем году.'];
}
function findLove() {
  if (S.orient === 'ace' && chance(0.5)) return ['🖤', 'Знакомства', 'Вы пообщались с несколькими людьми, но искры не было. И это нормально.'];
  const g = loveGender(); const n = randFirst(g);
  const age = Math.max(16, S.age + rnd(-6, 6));
  const looks = rnd(20, 100);
  Q.push({ e: '💘', title: 'Совпадение!', text: `${n}, ${yrs(age)}. Внешность: ${looks}/100. ${S.age >= 20 ? 'Профессия: ' + pick(NPC_JOBS).toLowerCase() + '.' : ''}`, choices: [
    { t: '💌 Пригласить на свидание', f: () => chance(0.35 + S.stats.looks / 200 - (looks - S.stats.looks) / 300) ? (Object.assign(addPartner(g, n), { age, looks }), `Свидание прошло чудесно! Вы теперь пара с ${n}. 💕`) : (eff({ happy: -4 }), `${n} больше не отвечает на сообщения.`) },
    { t: 'Листать дальше', f: () => 'Вы продолжили поиски.' }] });
  return null;
}

/* ===================== Интерфейс ===================== */
function statColor(v) { return v < 30 ? 'linear-gradient(90deg,#f43f5e,#fb7185)' : v < 60 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#10b981,#34d399)'; }
function avatar() {
  if (!S.alive) return '🪦';
  if (S.prison) return '⛓️';
  const a = S.age, g = S.gender;
  if (a < 3) return '👶';
  if (a < 13) return g === 'm' ? '👦' : g === 'f' ? '👧' : '🧒';
  if (a < 20) return g === 'm' ? '🧑' : g === 'f' ? '👱‍♀️' : '🧑';
  if (a < 60) return g === 'm' ? '👨' : g === 'f' ? '👩' : '🧑';
  return g === 'm' ? '👴' : g === 'f' ? '👵' : '🧓';
}
function statusLine() {
  if (S.prison) return `В тюрьме · ещё ${yrs(S.prison.years)}`;
  if (S.job) { const d = JOBS.find((j) => j.id === S.job.id); return d.titles[S.job.lvl]; }
  if (S.edu.stage === 'school') return `Школьник · ${Math.min(11, S.age - 6 + 1)} класс`;
  if (S.edu.stage) return { college: 'Студент колледжа', uni: 'Студент вуза', master: 'Магистрант', phd: 'Аспирант' }[S.edu.stage];
  if (S.retired) return 'Пенсионер';
  if (S.age < 6) return 'Ребёнок';
  return 'Без работы';
}

function render() {
  const c = C();
  $('#avatar').textContent = avatar();
  $('#pName').textContent = `${S.first} ${S.surname}`;
  $('#pSub').textContent = `${yrs(S.age)} · ${S.year} · ${c.flag} ${S.city} · ${statusLine()}`;
  const m = $('#pMoney'); m.textContent = fmt(S.money); m.classList.toggle('neg', S.money < 0);
  for (const el of document.querySelectorAll('.stat')) {
    const v = S.stats[el.dataset.k];
    el.querySelector('b').textContent = v + '%';
    const em = el.querySelector('em'); em.style.width = v + '%'; em.style.background = statColor(v);
  }
  const kv = $('#karmaVal'); if (kv) { kv.textContent = S.karma + '%'; }
  const fv = $('#fameVal'); if (fv) fv.textContent = S.followers.toLocaleString('ru-RU');
  const nv = $('#netVal'); if (nv) nv.textContent = fmt(netWorth());
  $('#ageBtn').disabled = !S.alive;
  // лог
  const L = $('#log');
  L.innerHTML = S.log.map((b) => `<div class="year"><h4>${b.age === 0 ? 'Рождение' : yrs(b.age)} · ${b.year}</h4>${b.items.map((i) => `<p class="${i.c}">${esc(i.t)}</p>`).join('')}</div>`).join('');
}
function scrollLog() { const L = $('#log'); requestAnimationFrame(() => { L.style.scrollBehavior = 'auto'; L.scrollTop = L.scrollHeight; L.style.scrollBehavior = ''; }); }

let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }

/* ---------- модалки ---------- */
function pump() {
  if (!$('#modalWrap').hidden) return;
  if (Q.length) return showModal(Q.shift());
  if (!S.alive) return showDeath();
}
function showModal(m) {
  $('#modalEmoji').textContent = m.e || '';
  $('#modalTitle').textContent = m.title || '';
  const T = $('#modalText');
  if (m.html) T.innerHTML = m.html; else T.textContent = m.text || '';
  const A = $('#modalActions'); A.innerHTML = '';
  const choices = m.choices && m.choices.length ? m.choices : [{ t: 'Продолжить', f: () => null }];
  choices.forEach((ch, i) => {
    const b = document.createElement('button');
    b.className = 'btn ' + (ch.cls || (i === 0 ? 'primary' : 'ghost'));
    b.textContent = ch.t; b.disabled = !!ch.disabled;
    b.onclick = () => {
      closeModal();
      const r = ch.f();
      if (!S) return;
      if (typeof r === 'string') { log(r); if (!m.silent) toast(r.length > 70 ? r.slice(0, 68) + '…' : r); }
      checkAch(); save(); render(); scrollLog(); refreshSheet();
      pump();
    };
    A.appendChild(b);
  });
  $('#modalWrap').hidden = false;
}
function closeModal() { $('#modalWrap').hidden = true; }
function result(r) {
  if (!r) return;
  const [e, title, text] = r;
  log(text);
  Q.unshift({ e, title, text, silent: true });
}

/* ---------- шторка ---------- */
let currentPanel = null;
function openPanel(name) {
  currentPanel = name;
  const titles = { job: '💼 Учёба и работа', assets: '🏠 Имущество и финансы', people: '💞 Отношения', activities: '🎯 Занятия', menu: '☰ Меню', profile: '🪪 Профиль', ach: '🏆 Достижения', map: '🌍 Карта мира' };
  $('#sheetTitle').textContent = titles[name] || '';
  $('#sheetBody').innerHTML = '';
  ({ job: panelJob, assets: panelAssets, people: panelPeople, activities: panelActivities, menu: panelMenu, profile: panelProfile, ach: panelAch, map: panelMap })[name]();
  $('#sheetWrap').hidden = false;
}
function refreshSheet() { if (!$('#sheetWrap').hidden && currentPanel) { const st = $('#sheetBody').scrollTop; openPanel(currentPanel); $('#sheetBody').scrollTop = st; } }
function closeSheet() { $('#sheetWrap').hidden = true; currentPanel = null; }

function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
function section(title) { $('#sheetBody').appendChild(el(`<div class="section-title">${title}</div>`)); const l = el('<div class="list"></div>'); $('#sheetBody').appendChild(l); return l; }
function item(list, { e, t, d, r, onClick, disabled, bar }) {
  const tag = onClick ? 'button' : 'div';
  const n = el(`<${tag} class="item"><span class="ico">${e}</span><span class="txt"><div class="t">${esc(t)}</div>${d ? `<div class="d">${esc(d)}</div>` : ''}${bar != null ? `<div class="bar-mini"><em style="width:${bar}%"></em></div>` : ''}</span>${r ? `<span class="r">${esc(r)}</span>` : ''}</${tag}>`);
  if (onClick) { n.onclick = onClick; n.disabled = !!disabled; }
  list.appendChild(n); return n;
}
function card(html) { const n = el(`<div class="card">${html}</div>`); $('#sheetBody').appendChild(n); return n; }
function btnRow(parent, btns) {
  const row = el('<div class="row-btns"></div>');
  for (const b of btns) { const x = el(`<button class="btn ${b.cls || 'ghost'}">${esc(b.t)}</button>`); x.disabled = !!b.disabled; x.onclick = b.f; row.appendChild(x); }
  parent.appendChild(row);
}
function act(fn) { return () => { if (!S.alive) return; const r = fn(); if (typeof r === 'string') { log(r); toast(r); } else if (Array.isArray(r)) result(r); checkAch(); save(); render(); scrollLog(); refreshSheet(); pump(); }; }

/* ---------- панель: работа ---------- */
function panelJob() {
  if (S.prison) { card(`<div class="big">⛓️ Вы в тюрьме</div><div class="muted">Статья: ${esc(S.prison.crime)}. Осталось: ${yrs(S.prison.years)}.</div>`); return; }
  // Образование
  const e = S.edu;
  const eduText = e.stage ? ({ school: `Школа · ${Math.min(11, S.age - 5)} класс`, college: 'Колледж', uni: `Университет · ${MAJORS.find((m) => m.id === e.major)?.name}`, master: 'Магистратура', phd: 'Аспирантура' }[e.stage]) : EDU_NAME[e.level];
  const ec = card(`<div class="muted">🎓 Образование</div><div class="big">${esc(eduText)}</div>${e.stage ? `<div class="muted">Успеваемость: ${e.grade}%${e.years && e.stage !== 'school' ? ` · осталось ${yrs(e.years)}` : ''}</div><div class="bar-mini"><em style="width:${e.grade}%"></em></div>` : ''}${e.majors.length ? `<div class="muted">Дипломы: ${e.majors.map((m) => MAJORS.find((x) => x.id === m)?.name).join(', ')}</div>` : ''}`);
  const eb = [];
  if (e.stage && e.stage !== 'school') eb.push({ t: 'Бросить учёбу', cls: 'danger', f: act(() => { e.stage = ''; e.tuition = 0; eff({ happy: -5 }); return 'Вы бросили учёбу.'; }) });
  if (!e.stage && S.age >= 18 && EDU_RANK[e.level] >= 1) {
    eb.push({ t: '🏛️ Университет', f: () => openUniPick('uni') });
    if (EDU_RANK[e.level] < 2) eb.push({ t: '🛠️ Колледж', f: act(() => enroll('college') || 'Вы поступили в колледж.') });
    if (EDU_RANK[e.level] >= 3 && e.level !== 'master' && e.level !== 'phd') eb.push({ t: '📘 Магистратура', f: act(() => { enroll('master'); return null; }) });
    if (e.level === 'master') eb.push({ t: '🔬 Аспирантура', f: act(() => { enroll('phd'); return null; }) });
  }
  if (!e.stage && S.age >= 18 && e.level === 'none') eb.push({ t: '📜 Получить аттестат (вечерняя школа)', f: act(() => { e.level = 'school'; eff({ smarts: 3 }); return 'Вы сдали экзамены экстерном и получили аттестат.'; }) });
  if (eb.length) btnRow(ec, eb);

  // Работа
  if (S.job) {
    const def = JOBS.find((j) => j.id === S.job.id); const j = S.job;
    const jc = card(`<div class="muted">${def.e} ${esc(def.name)} · ${yrs(j.years)} стажа</div><div class="big">${esc(def.titles[j.lvl])}</div><div class="muted">Зарплата: ${fmt(jobSalary(j))} в год</div><div class="muted">Эффективность: ${j.perf}%</div><div class="bar-mini"><em style="width:${j.perf}%"></em></div>`);
    btnRow(jc, [
      { t: '🔥 Работать усерднее', disabled: S.used.work, f: act(() => { S.used.work = 1; j.perf = clamp(j.perf + rnd(8, 16)); eff({ happy: -3, health: -1 }); return 'Вы пахали как не в себя. Начальство заметило.'; }) },
      { t: '💰 Попросить прибавку', disabled: S.used.raise, f: act(() => { S.used.raise = 1; if (j.perf > 60 && chance(0.55)) { j.bonus = (j.bonus || 1) * 1.12; return 'Прибавка +12% одобрена! 🎉'; } j.perf = clamp(j.perf - 8); return 'Начальник отказал и косо посмотрел.'; }) },
      { t: '🤝 Наладить отношения с коллегами', disabled: S.used.coll, f: act(() => { S.used.coll = 1; j.perf = clamp(j.perf + rnd(2, 7)); eff({ happy: 3 }); return 'Корпоратив удался. Коллеги вас ценят.'; }) },
      { t: '🚪 Уволиться', cls: 'danger', f: act(() => { S.job = null; eff({ happy: 2 }); return `Вы уволились с должности «${def.titles[j.lvl]}».`; }) }
    ]);
  }
  if (S.age >= 55 && !S.retired) {
    const l = section('Пенсия');
    item(l, { e: '🌅', t: 'Выйти на пенсию', d: `Пенсия: ${fmt(Math.max(wageOf(180000), S.job ? Math.round(jobSalary(S.job) * 0.45) : 0))} в год`, onClick: act(() => { S.pension = Math.max(wageOf(180000), S.job ? Math.round(jobSalary(S.job) * 0.45) : 0); S.job = null; S.retired = true; unlock('retired'); eff({ happy: 12 }); return `Вы вышли на пенсию. Ежегодная выплата: ${fmt(S.pension)}.`; }) });
  }

  // Бизнес
  if (S.age >= 18) {
    const l = section('Бизнес');
    if (S.biz) {
      const b = S.biz;
      item(l, { e: b.e, t: b.name, d: `Оценка: ${fmt(b.value)} · ${yrs(b.years)}`, r: '' });
      btnRow($('#sheetBody'), [
        { t: `📣 Маркетинг (${fmt(Math.round(b.value * 0.1))})`, disabled: S.used.biz, f: act(() => { S.used.biz = 1; const c = Math.round(b.value * 0.1); S.money -= c; b.boost = rf(0.05, 0.25); return 'Рекламная кампания запущена.'; }) },
        { t: `💸 Продать за ${fmt(b.value)}`, f: act(() => { S.money += b.value; const n = b.name; S.biz = null; eff({ happy: 8 }); return `Вы продали «${n}».`; }) }
      ]);
    } else {
      const BIZ = [
        { e: '☕', name: 'Кофейня', cost: 1500000 }, { e: '🛍️', name: 'Интернет-магазин', cost: 800000 },
        { e: '🍕', name: 'Ресторан', cost: 8000000 }, { e: '💻', name: 'IT-стартап', cost: 5000000 },
        { e: '🏋️', name: 'Фитнес-клуб', cost: 15000000 }, { e: '🏭', name: 'Завод', cost: 120000000 }
      ];
      for (const b of BIZ) {
        const c = price(b.cost);
        item(l, { e: b.e, t: b.name, d: `Вложения: ${fmt(c)}`, disabled: S.money < c, onClick: act(() => { S.money -= c; S.biz = { e: b.e, name: b.name, value: c, start: c, years: 0 }; unlock('business'); eff({ happy: 8 }); return `Вы открыли бизнес: ${b.name}! 🚀`; }) });
      }
    }
  }

  // Вакансии
  const l = section(S.job ? 'Другие вакансии' : 'Вакансии');
  const list = JOBS.filter((d) => !S.job || d.id !== S.job.id);
  for (const d of list) {
    const why = jobReq(d);
    item(l, { e: d.e, t: d.titles[0] + (d.part ? ' (подработка)' : ''), d: why || `${d.name} · ${fmt(wageOf(d.salary))} в год`, disabled: !!why, onClick: () => applyJob(d) });
  }
}
function jobReq(d) {
  if (d.yr && S.year < d.yr) return `Профессия появится в ${d.yr} году`;
  if (S.age < (d.minAge || 18)) return `С ${yrs(d.minAge || 18)}`;
  if (d.maxAge && S.age > d.maxAge) return `До ${yrs(d.maxAge)}`;
  if (!d.part && S.edu.stage === 'school') return 'Сначала окончите школу';
  if (d.edu && EDU_RANK[S.edu.level] < EDU_RANK[d.edu]) return `Нужно: ${EDU_NAME[d.edu].toLowerCase()}`;
  if (d.major && !S.edu.majors.includes(d.major)) return `Нужен диплом: ${MAJORS.find((m) => m.id === d.major).name}`;
  if (d.minSmarts && S.stats.smarts < d.minSmarts) return `Нужен ум ${d.minSmarts}+`;
  if (d.minHealth && S.stats.health < d.minHealth) return `Нужно здоровье ${d.minHealth}+`;
  if (d.minLooks && S.stats.looks < d.minLooks) return `Нужна внешность ${d.minLooks}+`;
  if (S.used['apply_' + d.id]) return 'Уже откликались в этом году';
  return '';
}
function applyJob(d) {
  S.used['apply_' + d.id] = 1;
  Q.push({ e: '🤝', title: 'Собеседование', text: `Собеседование на должность «${d.titles[0]}». Как будете себя вести?`, choices: [
    { t: '😎 Уверенно', f: () => hire(d, 0.05) },
    { t: '🙂 Скромно и честно', f: () => hire(d, 0) },
    { t: '🤥 Приукрасить резюме', f: () => { eff({ karma: -3 }); return hire(d, chance(0.5) ? 0.15 : -0.3); } }
  ] });
  closeSheet(); pump();
}
function hire(d, bonus) {
  const p = 0.45 + (S.stats.smarts - 50) / 200 + (S.stats.looks - 50) / 400 + bonus + (S.karma - 50) / 500;
  if (!chance(clamp(p, 0.08, 0.95))) { eff({ happy: -4 }); return `Вам отказали в должности «${d.titles[0]}».`; }
  S.job = { id: d.id, lvl: 0, perf: 55, years: 0, lvlYears: 0, bonus: 1 };
  S.career.push(d.id); S.stat.jobs++; unlock('firstjob'); eff({ happy: 8 });
  return `🎉 Вас взяли! Вы теперь ${d.titles[0]} (${fmt(wageOf(d.salary))} в год).`;
}
function openUniPick(stage) {
  closeSheet();
  Q.push({ e: '🏛️', title: 'Выбор специальности', text: 'Куда будете поступать? Проходной балл зависит от вашего ума.', choices: MAJORS.map((m) => ({ t: `${m.e} ${m.name} · от ${m.minSmarts}`, f: () => enroll('uni', m.id) })).concat([{ t: 'Передумать', f: () => null }]) });
  pump();
}

/* ---------- панель: имущество ---------- */
function panelAssets() {
  const I = S.inv;
  const fc = card(`<div class="muted">💳 Чистый капитал</div><div class="big">${fmt(netWorth())}</div><div class="muted">Наличные: ${fmt(S.money)}${S.loan ? ` · Ипотека: ${fmt(S.loan.bal)}` : ''}</div><div class="muted">Вклад: ${fmt(I.deposit)} · Акции: ${fmt(I.stocks)} · Крипта: ${fmt(I.crypto)}</div>`);
  if (S.loan && S.money > 0) btnRow(fc, [{ t: `Погасить ипотеку (${fmt(Math.min(S.money, S.loan.bal))})`, f: act(() => { const p = Math.min(S.money, S.loan.bal); S.money -= p; S.loan.bal -= p; if (S.loan.bal <= 0) { S.loan = null; eff({ happy: 10 }); return 'Ипотека погашена досрочно! 🎉'; } return `Вы внесли ${fmt(p)} в счёт ипотеки.`; }) }]);

  if (S.age >= 18) {
    const l = section('Инвестиции');
    const kinds = [{ k: 'deposit', e: '🏦', t: 'Банковский вклад', d: '+7% в год, без риска' }, { k: 'stocks', e: '📈', t: 'Акции', d: 'В среднем +5%, колебания ±25%' }, { k: 'crypto', e: '🪙', t: 'Криптовалюта', d: 'Может вырасти в разы или обнулиться' }].filter((x) => x.k !== 'crypto' || S.year >= 2010);
    for (const x of kinds) {
      item(l, { e: x.e, t: x.t, d: `${x.d} · сейчас ${fmt(I[x.k])}`, onClick: () => investModal(x) });
    }
  }

  const own = section('Моё имущество');
  if (!S.assets.length) own.appendChild(el('<div class="empty">Пока ничего нет</div>'));
  for (const a of S.assets) {
    item(own, { e: a.e, t: a.name, d: `Стоимость: ${fmt(a.value)} · куплено за ${fmt(a.price)}`, onClick: () => Q.push({ e: a.e, title: a.name, text: `Текущая стоимость: ${fmt(a.value)}.`, choices: [
      { t: `Продать за ${fmt(a.value)}`, f: () => { S.money += a.value; S.assets = S.assets.filter((x) => x !== a); return `Вы продали: ${a.name}.`; } },
      { t: 'Оставить', f: () => null }] }) && pump() });
  }
  // fix chained onClick above: Q.push returns length, so pump is called
  if (S.age < 18) { $('#sheetBody').appendChild(el('<div class="empty">Покупать имущество можно с 18 лет 🙂</div>')); return; }
  if (S.prison) return;
  const groups = [['house', 'Недвижимость'], ['car', 'Транспорт'], ['luxury', 'Роскошь']];
  for (const [k, title] of groups) {
    const l = section(title);
    for (const x of SHOP[k]) {
      if (x.yr && S.year < x.yr) continue;
      const p = price(x.price);
      const canMort = k === 'house' && S.job && !S.loan && S.money >= p * 0.2 && S.money < p;
      item(l, { e: x.e, t: x.name, d: fmt(p) + (canMort ? ' · доступна ипотека' : ''), disabled: S.money < p && !canMort, onClick: () => buyModal(k, x, p, canMort) });
    }
  }
}
function buyModal(type, x, p, canMort) {
  const ch = [];
  if (S.money >= p) ch.push({ t: `Купить за ${fmt(p)}`, f: () => buy(type, x, p, false) });
  if (canMort || (type === 'house' && S.job && !S.loan && S.money >= p * 0.2)) ch.push({ t: `Ипотека: взнос ${fmt(Math.round(p * 0.2))}`, f: () => buy(type, x, p, true) });
  ch.push({ t: 'Отмена', f: () => null });
  Q.push({ e: x.e, title: x.name, text: `Цена: ${fmt(p)}.`, choices: ch }); pump();
}
function buy(type, x, p, mort) {
  if (mort) { const down = Math.round(p * 0.2); S.money -= down; S.loan = { bal: p - down, pay: Math.round((p - down) / 15 + (p - down) * 0.07) }; }
  else S.money -= p;
  S.assets.push({ uid: uid(), type, id: x.id, e: x.e, name: x.name, value: p, price: p });
  if (type === 'house') { unlock('homeowner'); S.ownHome = true; }
  if (x.id === 'island') unlock('island');
  eff({ happy: type === 'luxury' ? 8 : 12 });
  return `🛍️ Вы купили: ${x.name}${mort ? ' (в ипотеку)' : ''}!`;
}
function investModal(x) {
  const I = S.inv; const ch = [];
  for (const k of [0.1, 0.5, 1]) { const a = Math.round(Math.max(0, S.money) * k); if (a > 0) ch.push({ t: `Вложить ${fmt(a)}`, f: () => { S.money -= a; I[x.k] += a; return `Вы вложили ${fmt(a)}: ${x.t.toLowerCase()}.`; } }); }
  if (I[x.k] > 0) ch.push({ t: `Вывести всё (${fmt(I[x.k])})`, cls: 'ghost', f: () => { S.money += I[x.k]; const v = I[x.k]; I[x.k] = 0; return `Вы вывели ${fmt(v)}.`; } });
  ch.push({ t: 'Отмена', f: () => null });
  Q.push({ e: x.e, title: x.t, text: `${x.d}.\nСейчас вложено: ${fmt(I[x.k])}.`, choices: ch }); pump();
}

/* ---------- панель: люди ---------- */
function panelPeople() {
  const groups = [
    ['Семья', (p) => ['mother', 'father', 'sibling'].includes(p.role)],
    ['Любовь', (p) => p.role === 'partner'],
    ['Дети', (p) => p.role === 'child'],
    ['Друзья', (p) => p.role === 'friend'],
    ['Бывшие', (p) => p.role === 'ex' || p.role === 'late']
  ];
  let any = false;
  for (const [t, f] of groups) {
    const ps = S.people.filter(f); if (!ps.length) continue; any = true;
    const l = section(t);
    for (const p of ps) {
      item(l, { e: p.alive ? personEmoji(p) : '🕯️', t: `${p.name}${p.surname ? ' ' + p.surname : ''}`, d: `${roleName(p)} · ${p.alive ? yrs(p.age) : 'скончал' + gv(p, 'ся', 'ась', 'ся(ась)')}${p.job && p.alive ? ' · ' + p.job : ''}`, bar: p.alive && p.role !== 'ex' ? p.close : null, onClick: p.alive ? () => personModal(p) : null });
    }
  }
  const pets = S.pets.filter((p) => p.alive);
  if (pets.length) {
    const l = section('Питомцы'); any = true;
    for (const p of pets) { const d = PETS.find((x) => x.id === p.type); item(l, { e: d.e, t: p.name, d: `${d.name} · ${yrs(p.age)}`, bar: p.close, onClick: act(() => { if (S.used['pet_' + p.id]) return `${p.name} уже наигрался сегодня.`; S.used['pet_' + p.id] = 1; p.close = clamp(p.close + 10); eff({ happy: rnd(3, 6) }); return `Вы поиграли с ${p.name}. ${d.e}❤️`; }) }); }
  }
  if (!any) $('#sheetBody').appendChild(el('<div class="empty">Вы совсем одни... Найдите друзей в «Занятиях».</div>'));
}
function personEmoji(p) {
  if (p.age < 3) return '👶';
  if (p.age < 13) return p.gender === 'm' ? '👦' : p.gender === 'f' ? '👧' : '🧒';
  if (p.age < 60) return p.gender === 'm' ? '👨' : p.gender === 'f' ? '👩' : '🧑';
  return p.gender === 'm' ? '👴' : p.gender === 'f' ? '👵' : '🧓';
}
function personModal(p) {
  const key = (a) => `${a}_${p.id}`;
  const ch = [];
  const once = (a, fn) => () => { S.used[key(a)] = 1; return fn(); };
  ch.push({ t: '☕ Провести время вместе', disabled: S.used[key('time')], f: once('time', () => { p.close = clamp(p.close + rnd(5, 12)); eff({ happy: rnd(2, 6) }); return `Вы чудесно провели время с ${p.name}.`; }) });
  if (S.age >= 14) ch.push({ t: `🎁 Подарок (${fmt(price(10000))})`, disabled: S.used[key('gift')], f: once('gift', () => { S.money -= price(10000); p.close = clamp(p.close + rnd(8, 15)); return `${p.name} в восторге от подарка!`; }) });
  ch.push({ t: '💬 Поговорить по душам', disabled: S.used[key('talk')], f: once('talk', () => { p.close = clamp(p.close + rnd(2, 8)); eff({ happy: 2 }); return `Вы поговорили с ${p.name} обо всём на свете.`; }) });
  if ((p.role === 'mother' || p.role === 'father') && S.age >= 8) ch.push({ t: '💵 Попросить денег', disabled: S.used[key('money')], f: once('money', () => { if (chance(p.close / 140)) { const s = price(rnd(1, S.age < 18 ? 5 : 50) * 1000); S.money += s; return `${p.name} дал${gv(p, '', 'а', '(а)')} вам ${fmt(s)}.`; } p.close = clamp(p.close - 4); return `${p.name} отказал${gv(p, '', 'а', '(а)')}.`; }) });
  if (p.role === 'child' && S.age >= 18) ch.push({ t: `💸 Дать денег (${fmt(price(50000))})`, f: () => { S.money -= price(50000); p.close = clamp(p.close + 10); eff({ karma: 2 }); return `${p.name} благодарит вас!`; } });
  if (p.role === 'partner') {
    if (p.status === 'dating' && S.age >= 18) ch.push({ t: '💍 Сделать предложение', disabled: S.used[key('prop')], f: once('prop', () => { if (chance(p.close / 110)) { p.status = 'engaged'; eff({ happy: 15 }); return `${p.name} сказал${gv(p, '', 'а', '(а)')} «ДА»! 💍`; } p.close = clamp(p.close - 15); eff({ happy: -12 }); return `${p.name} не готов${gv(p, '', 'а', '(а)')} к такому шагу.`; }) });
    if (p.status === 'engaged') {
      ch.push({ t: `💒 Пышная свадьба (${fmt(price(1500000))})`, f: () => { S.money -= price(1500000); p.status = 'married'; p.close = clamp(p.close + 15); unlock('married'); eff({ happy: 25 }); return `Свадьба века! Вы с ${p.name} теперь в браке. 💒`; } });
      ch.push({ t: '📝 Скромная роспись', f: () => { p.status = 'married'; unlock('married'); eff({ happy: 15 }); return `Вы с ${p.name} расписались. Горько! 🥂`; } });
    }
    if (S.age >= 18 && S.age <= 55) ch.push({ t: '👶 Завести ребёнка', disabled: S.used.baby, f: () => { S.used.baby = 1; return tryBaby(p); } });
    ch.push({ t: '🌹 Романтическое свидание', disabled: S.used[key('date')], f: once('date', () => { S.money -= price(8000); p.close = clamp(p.close + rnd(8, 16)); eff({ happy: 6 }); return 'Ужин при свечах удался. ❤️'; }) });
    ch.push({ t: p.status === 'married' ? '💔 Развестись' : '💔 Расстаться', cls: 'danger', f: () => { const loss = p.status === 'married' ? Math.max(0, Math.round(S.money * 0.4)) : 0; S.money -= loss; p.role = 'ex'; p.status = ''; eff({ happy: -12 }); return `Вы расстались с ${p.name}.${loss ? ` Раздел имущества: −${fmt(loss)}.` : ''}`; } });
  }
  if (p.role === 'friend') ch.push({ t: '🚫 Перестать общаться', cls: 'danger', f: () => { p.role = 'ex_friend'; S.people = S.people.filter((x) => x !== p); return `Вы перестали общаться с ${p.name}.`; } });
  if (p.role !== 'partner') ch.push({ t: '😤 Поссориться', cls: 'danger', disabled: S.used[key('fight')], f: once('fight', () => { p.close = clamp(p.close - rnd(10, 25)); eff({ karma: -2 }); return `Вы громко поругались с ${p.name}.`; }) });
  ch.push({ t: 'Закрыть', f: () => null });
  Q.push({ e: personEmoji(p), title: `${p.name}${p.surname ? ' ' + p.surname : ''}`, text: `${roleName(p)} · ${yrs(p.age)}${p.job ? ' · ' + p.job : ''}\nОтношения: ${p.close}%`, choices: ch });
  pump();
}
function tryBaby(p) {
  const bio = (S.gender === 'm' && p.gender === 'f') || (S.gender === 'f' && p.gender === 'm');
  const motherAge = S.gender === 'f' ? S.age : p.age;
  if (!bio || motherAge > 46) {
    Q.push({ e: '🍼', title: 'Усыновление', text: `Вы можете усыновить ребёнка. Оформление: ${fmt(price(400000))}.`, choices: [
      { t: 'Усыновить', f: () => { S.money -= price(400000); return addChild(p, rnd(0, 6)); } }, { t: 'Не сейчас', f: () => null }] });
    return null;
  }
  if (chance(motherAge < 35 ? 0.6 : 0.3)) return addChild(p, 0);
  return 'Пока не получилось. Попробуйте в следующем году.';
}
function addChild(p, age) {
  const g = npcGender();
  const c = makePerson('child', { gender: g, age, close: 90, surname: surnameFor(S.surnameBase, g, C().names), looks: clamp(Math.round((S.stats.looks + (p?.looks || 50)) / 2 + rnd(-15, 15))), smarts: clamp(Math.round((S.stats.smarts + (p?.smarts || 50)) / 2 + rnd(-15, 15))) });
  c.otherParent = p ? p.id : null;
  S.people.push(c); S.stat.kids++;
  unlock('parent'); eff({ happy: 20 });
  return `👶 У вас ${age ? 'появился' : 'родился'} ${gv(c, 'сын', 'дочь', 'ребёнок')}: ${c.name}!`;
}

/* ---------- панель: занятия ---------- */
function panelActivities() {
  if (S.prison) {
    const l = section('Жизнь за решёткой');
    for (const a of PRISON_ACTS) item(l, { e: a.e, t: a.t, d: S.used[a.id] ? 'Уже в этом году' : a.d, disabled: !!S.used[a.id], onClick: act(() => { S.used[a.id] = 1; return a.run(); }) });
    return;
  }
  const cats = [...new Set(ACTIVITIES.map((a) => a.cat))];
  let any = false;
  for (const c of cats) {
    const acts = ACTIVITIES.filter((a) => a.cat === c && S.age >= a.min && (!a.yr || S.year >= a.yr) && (!a.cond || a.cond()));
    if (!acts.length) continue; any = true;
    const l = section(c);
    for (const a of acts) {
      const cost = a.cost && !(a.freeUnder && S.age < a.freeUnder) ? price(a.cost) : 0;
      const used = S.used[a.id];
      item(l, { e: a.e, t: a.label ? a.label() : a.t, d: used ? 'Уже в этом году' : a.d + (cost ? ` · ${fmt(cost)}` : ''), disabled: used, onClick: act(() => {
        if (cost && S.money < cost && S.age >= 18) { toast('Не хватает денег 💸'); return null; }
        S.used[a.id] = 1; if (cost) S.money -= cost;
        return a.run();
      }) });
    }
  }
  if (!any) $('#sheetBody').appendChild(el('<div class="empty">Вы ещё слишком малы. Просто растите! 🍼</div>'));
}
function openPetShop() {
  Q.push({ e: '🐾', title: 'Кого заведём?', text: S.age >= 18 ? `Стоимость: ${fmt(price(30000))}` : 'Попросите родителей!', choices: PETS.map((p) => ({ t: `${p.e} ${p.name}`, f: () => {
    if (S.age < 18) { const par = parentsAlive(); if (!par.length || !chance(0.55)) return 'Родители сказали «нет». 😢'; }
    else S.money -= price(30000);
    addPet(p.id); const pet = S.pets[S.pets.length - 1]; eff({ happy: 10 });
    return `${p.e} У вас новый питомец: ${p.name.toLowerCase()} по кличке ${pet.name}!`;
  } })).concat([{ t: 'Передумать', f: () => null }]) });
  closeSheet(); pump();
}
function openCasino() {
  const bets = [0.05, 0.25, 1].map((k) => Math.round(Math.max(0, S.money) * k)).filter((x) => x > 0);
  if (!bets.length) { Q.push({ e: '🎰', title: 'Казино', text: 'Охрана не пускает вас без денег.' }); pump(); return; }
  Q.push({ e: '🎰', title: 'Казино', text: 'Рулетка: красное или чёрное? Ставка удваивается при выигрыше.', choices: bets.map((b) => ({ t: `Поставить ${fmt(b)}`, f: () => { if (chance(0.47)) { S.money += b; eff({ happy: 10 }); return `🎉 Выигрыш! +${fmt(b)}`; } S.money -= b; eff({ happy: -10 }); return `😩 Проигрыш. −${fmt(b)}`; } })).concat([{ t: 'Уйти', f: () => null }]) });
  closeSheet(); pump();
}
function openEmigrate() {
  Q.push({ e: '🛫', title: 'Куда переезжаем?', text: `Переезд стоит ${fmt(price(300000))}. Работа будет потеряна.`, choices: COUNTRIES.filter((c) => c.id !== S.country).map((c) => ({ t: `${c.flag} ${cname(c)}`, f: () => {
    S.money -= price(300000); S.country = c.id; S.city = pick(c.cities); if (!S.visited.includes(c.id)) S.visited.push(c.id);
    if (S.job) S.job = null;
    unlock('emigrant'); eff({ happy: 10 });
    return `${c.flag} Вы переехали: ${c.name}, город ${S.city}. Новая страница жизни!`;
  } })).concat([{ t: 'Остаться', f: () => null }]) });
  closeSheet(); pump();
}
function openReligion() {
  Q.push({ e: '🔄', title: 'Выбор веры', text: `Сейчас: ${S.religion}.`, choices: RELIGIONS.filter((r) => r.id !== S.religion).map((r) => ({ t: `${r.e} ${r.id}`, f: () => { S.religion = r.id; unlock('convert'); return `Вы приняли новое мировоззрение: ${r.id}.`; } })).concat([{ t: 'Оставить как есть', f: () => null }]) });
  closeSheet(); pump();
}
function openGender() {
  Q.push({ e: '⚧️', title: 'Гендерная идентичность', text: 'Кем вы себя ощущаете?', choices: GENDERS.filter((g) => g.id !== S.gender).map((g) => ({ t: `${g.e} ${g.name}`, f: () => {
    S.gender = g.id; S.surname = surnameFor(S.surnameBase, g.id, C().names);
    const reacts = []; for (const p of S.people.filter((x) => x.alive && ['mother', 'father', 'sibling', 'friend', 'partner'].includes(x.role))) { if (chance(0.75)) p.close = clamp(p.close + 4); else { p.close = clamp(p.close - 15); reacts.push(p.name); } }
    eff({ happy: 15 });
    return `Вы живёте в согласии с собой. Пол: ${g.name.toLowerCase()}.${reacts.length ? ` Не все приняли это сразу: ${reacts.join(', ')}.` : ' Близкие вас поддержали.'}`;
  } })).concat([{ t: 'Оставить как есть', f: () => null }]) });
  closeSheet(); pump();
}

/* ---------- меню / профиль / достижения ---------- */
function panelMenu() {
  const l = section('Игра');
  item(l, { e: '🪪', t: 'Профиль', d: 'Страна, вера, ориентация, статистика', onClick: () => openPanel('profile') });
  item(l, { e: '🌍', t: 'Карта мира', d: 'Где вы были и куда можно поехать', onClick: () => openPanel('map') });
  item(l, { e: '🏆', t: 'Достижения', d: `${Object.keys(globalAch).length} из ${ACHIEVEMENTS.length}`, onClick: () => openPanel('ach') });
  item(l, { e: '🌱', t: 'Начать новую жизнь', d: 'Текущая будет потеряна', onClick: () => { Q.push({ e: '🌱', title: 'Новая жизнь?', text: 'Текущий прогресс будет удалён.', choices: [{ t: 'Да, начать заново', cls: 'danger', f: () => { toStart(); return null; } }, { t: 'Отмена', f: () => null }] }); closeSheet(); pump(); } });
}
function panelProfile() {
  const c = C(); const bc = COUNTRIES.find((x) => x.id === S.birthCountry);
  const g = GENDERS.find((x) => x.id === S.gender); const o = ORIENTATIONS.find((x) => x.id === S.orient); const r = RELIGIONS.find((x) => x.id === S.religion);
  card(`<div class="big">${avatar()} ${esc(S.first)} ${esc(S.surname)}</div><div class="muted">Поколение ${S.generation} · родом из ${bc.flag} ${bc.name}</div>`);
  const l = section('О вас');
  item(l, { e: c.flag, t: cname(c), d: `Город: ${S.city} · валюта ${c.cur}` });
  item(l, { e: '📅', t: 'Дата рождения', d: `${S.birthYear} год · сейчас ${S.year}` });
  item(l, { e: g.e, t: 'Пол', d: g.name });
  item(l, { e: o.e, t: 'Ориентация', d: o.name + (S.orient !== 'hetero' ? (S.out ? ' · открыто' : ' · скрыто') : '') });
  item(l, { e: r?.e || '🙏', t: 'Мировоззрение', d: S.religion });
  item(l, { e: '😇', t: 'Карма', d: `${S.karma}/100`, bar: S.karma });
  item(l, { e: '📱', t: 'Подписчики', d: S.followers.toLocaleString('ru-RU') });
  item(l, { e: '🎓', t: 'Образование', d: EDU_NAME[S.edu.level] });
  item(l, { e: '🧳', t: 'Страны', d: S.visited.map((id) => COUNTRIES.find((x) => x.id === id)?.flag).join(' ') });
  item(l, { e: '💰', t: 'Чистый капитал', d: fmt(netWorth()) });
  if (S.diseases.length) { const d = section('Здоровье'); for (const x of S.diseases) item(d, { e: '🤒', t: DISEASES.find((z) => z.id === x.id).name, d: `С ${yrs(x.since)}` }); }
}
function panelAch() {
  const l = section(`Открыто ${Object.keys(globalAch).length} из ${ACHIEVEMENTS.length}`);
  for (const a of ACHIEVEMENTS) { const got = globalAch[a.id]; const n = item(l, { e: got ? a.e : '🔒', t: a.t, d: a.d + (S.ach[a.id] != null ? ` · в этой жизни в ${yrs(S.ach[a.id])}` : ''), r: got ? '✓' : '' }); if (!got) n.style.opacity = '.5'; }
}

/* ---------- смерть ---------- */
function lifeScore() {
  const nw = netWorth();
  let s = S.age * 0.6 + Object.keys(S.ach).length * 3 + S.stats.happy * 0.2 + S.karma * 0.15 + Math.log10(Math.max(1, nw)) * 3 + S.stat.kids * 3;
  return Math.round(s);
}
function grade(s) { return s >= 120 ? 'S' : s >= 95 ? 'A' : s >= 75 ? 'B' : s >= 55 ? 'C' : s >= 35 ? 'D' : 'F'; }
function showDeath() {
  const nw = netWorth(); const sc = lifeScore();
  const kids = S.people.filter((p) => p.role === 'child' && p.alive);
  const job = S.career.length ? JOBS.find((j) => j.id === S.career[S.career.length - 1]) : null;
  const html = `<span>${esc(S.first)} ${esc(S.surname)} · ${S.birthYear}–${S.year}</span><br><span>Причина: ${esc(S.cause)}</span><div class="summary" style="margin-top:14px">
    <div><small>Возраст</small><b>${yrs(S.age)}</b></div><div><small>Оценка жизни</small><b>${grade(sc)} · ${sc}</b></div>
    <div><small>Капитал</small><b>${fmt(nw)}</b></div><div><small>Дети</small><b>${S.stat.kids}</b></div>
    <div><small>Карьера</small><b>${job ? esc(job.name) : '—'}</b></div><div><small>Достижения</small><b>${Object.keys(S.ach).length}</b></div>
    <div><small>Карма</small><b>${S.karma}</b></div><div><small>Стран</small><b>${S.visited.length}</b></div></div>`;
  const ch = [];
  if (kids.length) ch.push({ t: '🧬 Продолжить за ребёнка', f: () => { setTimeout(pickHeir, 30); return null; } });
  ch.push({ t: '🌱 Новая жизнь', cls: kids.length ? 'ghost' : 'primary', f: () => { toStart(); return null; } });
  showModal({ e: '🪦', title: 'Покойтесь с миром', html, choices: ch });
}
function pickHeir() {
  const kids = S.people.filter((p) => p.role === 'child' && p.alive);
  showModal({ e: '🧬', title: 'Наследник', text: `Наследство: ${fmt(netWorth())} (минус налог 13%). За кого продолжите?`, choices: kids.map((k) => ({ t: `${personEmoji(k)} ${k.name}, ${yrs(k.age)}`, f: () => { continueAs(k); return null; } })) });
}
function continueAs(k) {
  const old = S;
  const inherit = Math.round(netWorth() * 0.87);
  const otherParent = old.people.find((p) => p.id === k.otherParent && p.alive);
  const siblings = old.people.filter((p) => p.role === 'child' && p.alive && p.id !== k.id);
  newLife({
    country: old.country, gender: k.gender, first: k.name, surname: old.surnameBase, religion: old.religion,
    generation: old.generation + 1, noParents: true,
    after: (s) => {
      s.age = k.age; s.year = old.year; s.birthYear = old.year - k.age; s.city = old.city;
      s.stats.looks = k.looks; s.stats.smarts = k.smarts; s.stats.happy = 40; s.stats.health = rnd(60, 100);
      s.money = inherit; s.visited = [...old.visited];
      if (otherParent) s.people.push({ ...otherParent, role: otherParent.gender === 'm' ? 'father' : 'mother', close: k.close });
      for (const sb of siblings) s.people.push({ ...sb, role: 'sibling' });
      if (k.age >= 18) { s.edu.level = k.age >= 23 && chance(0.6) ? 'bachelor' : 'school'; if (s.edu.level === 'bachelor') s.edu.majors.push(pick(MAJORS).id); }
      else if (k.age >= 6) { s.edu.stage = 'school'; s.edu.grade = clamp(k.smarts + rnd(-10, 10)); }
      s.ach = {};
    }
  });
  log(`🕯️ Вы похоронили своего родителя, ${old.first}. Наследство: ${fmt(inherit)}.`, 'info');
  unlock('dynasty');
  save(); showGame();
}


/* ===================== Эпоха ===================== */
const USSR = ['ru', 'ua', 'by', 'kz', 'ge', 'am', 'az', 'uz'];
function cname(c) { return USSR.includes(c.id) && S && S.year < 1992 ? `${c.name} (СССР)` : c.name; }
const WAR = { ru: [1941, 1945], ua: [1941, 1945], by: [1941, 1945], kz: [1941, 1945], de: [1939, 1945], gb: [1939, 1945], fr: [1939, 1945], it: [1940, 1945], jp: [1941, 1945], us: [1942, 1945], ca: [1939, 1945], au: [1939, 1945], ge: [1941, 1945], am: [1941, 1945], az: [1941, 1945], uz: [1941, 1945], pl: [1939, 1945], cz: [1939, 1945], nl: [1940, 1945], be: [1940, 1945], gr: [1940, 1944], rs: [1941, 1945], nz: [1939, 1945], fi: [1939, 1944], no: [1940, 1945] };
function yearEra() {
  const y = S.year, w = WAR[S.country];
  if (w && y >= w[0] && y <= w[1]) {
    eff({ happy: -rnd(4, 10), health: -rnd(0, 4) });
    if (S.age >= 18 && S.age <= 50 && !S.prison && !S.warDone) {
      S.warDone = true;
      ev('🎖️', 'Мобилизация', 'Идёт война. Вам пришла повестка.', [
        { t: 'Отправиться на фронт', f: () => { eff({ karma: 8 }); if (chance(0.22)) { die('Погиб на войне'); return 'Вы погибли, защищая свою страну. Вечная память.'; } eff({ health: -rnd(5, 25), happy: -10 }); S.veteran = true; return 'Вы прошли войну и вернулись домой ветераном. 🎖️'; } },
        { t: 'Работать в тылу', f: () => { eff({ health: -rnd(2, 8), karma: 3 }); return 'Вы работали на заводе по 12 часов, помогая фронту.'; } },
        { t: 'Уклониться', f: () => chance(0.4) ? (crimeCaught('Уклонение от призыва', 3), 'Вас нашли.') : (eff({ karma: -12 }), 'Вам удалось скрыться.') }
      ]);
    } else if (S.age < 18) log('🕯️ Идёт война. Детство пришлось на тяжёлые годы.', 'bad');
  }
  if (y === 1929 || y === 1930) { if (S.inv.stocks) { S.inv.stocks = Math.round(S.inv.stocks * 0.4); log('📉 Великая депрессия обрушила ваши акции.', 'bad'); } if (S.job && chance(0.25)) { S.job = null; log('📉 Из-за кризиса вас сократили.', 'bad'); } }
  if (y === 2008) { if (S.inv.stocks) { S.inv.stocks = Math.round(S.inv.stocks * 0.6); log('📉 Финансовый кризис: акции упали на 40%.', 'bad'); } if (S.job && chance(0.12)) { S.job = null; log('📉 Кризис: вас сократили.', 'bad'); } }
  if (y === 1992 && USSR.includes(S.country) && S.money > 0) { S.money = Math.round(S.money * 0.15); log('💸 Гиперинфляция съела почти все ваши сбережения.', 'bad'); }
  if (y === 1998 && S.country === 'ru' && S.money > 0) { S.money = Math.round(S.money * 0.6); log('💸 Дефолт: рубль обесценился.', 'bad'); }
  if (y === 2020) { if (chance(0.3)) { eff({ health: -rnd(3, 12) }); log('🦠 Вы переболели ковидом.', 'bad'); } if (S.biz) S.biz.value = Math.round(S.biz.value * 0.75); eff({ happy: -4 }); }
  if (y === 1969 || y === 1961) eff({ happy: 3 });
}

/* ===================== Карта мира ===================== */
let mapLibs = null;
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
function ensureMapLibs() {
  if (!mapLibs) mapLibs = Promise.all([
    loadScript('vendor/d3.min.js'),
    loadScript('vendor/topojson-client.min.js')
  ]).then(() => fetch('vendor/countries-110m.json')).then((r) => r.json()).catch((e) => { mapLibs = null; throw e; });
  return mapLibs;
}
function panelMap() {
  const B = $('#sheetBody');
  const legend = el(`<div class="map-legend"><span><i style="background:#22d3ee"></i>Сейчас</span><span><i style="background:#f472b6"></i>Родина</span><span><i style="background:#8b5cf6"></i>Посещено</span><span><i style="background:#3b3f63"></i>Можно поехать</span></div>`);
  const box = el('<div class="map-box"><div class="empty">Загружаем карту… 🌍</div></div>');
  B.appendChild(legend); B.appendChild(box);
  const l = section(`Посещено стран: ${S.visited.length} из ${COUNTRIES.length}`);
  for (const c of COUNTRIES) item(l, { e: c.flag, t: cname(c), d: `${c.id === S.country ? 'Вы здесь · ' : S.visited.includes(c.id) ? 'Посещено · ' : ''}Продолжительность жизни ${c.life} · доходы ×${c.wage}`, onClick: () => countryModal(c) });
  ensureMapLibs().then((world) => {
    if (currentPanel !== 'map') return;
    const W = 960, H = 500;
    const feats = topojson.feature(world, world.objects.countries).features;
    const proj = d3.geoNaturalEarth1().fitSize([W, H], { type: 'Sphere' });
    const path = d3.geoPath(proj);
    const byNum = {}; for (const c of COUNTRIES) byNum[ISO_NUM[c.id]] = c;
    const color = (c) => !c ? '#1c1f36' : c.id === S.country ? '#22d3ee' : c.id === S.birthCountry ? '#f472b6' : S.visited.includes(c.id) ? '#8b5cf6' : '#3b3f63';
    box.innerHTML = '';
    const svg = d3.select(box).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('class', 'world');
    svg.append('path').attr('d', path({ type: 'Sphere' })).attr('fill', 'rgba(255,255,255,.03)');
    svg.append('path').attr('d', path(d3.geoGraticule10())).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,.05)');
    svg.selectAll('path.c').data(feats).join('path').attr('class', (d) => 'c' + (byNum[d.id] ? ' play' : ''))
      .attr('d', path).attr('fill', (d) => color(byNum[d.id])).attr('stroke', '#0b0d17').attr('stroke-width', 0.5)
      .on('click', (e, d) => { const c = byNum[d.id]; if (c) countryModal(c); })
      .append('title').text((d) => byNum[d.id] ? `${byNum[d.id].flag} ${cname(byNum[d.id])}` : (d.properties && d.properties.name) || '');
    const cur = feats.find((f) => f.id === ISO_NUM[S.country]);
    if (cur) { const [x, y] = path.centroid(cur); svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('font-size', 26).attr('class', 'pin').text('📍'); }
  }).catch(() => { box.innerHTML = '<div class="empty">Не удалось загрузить карту. Проверьте интернет.</div>'; });
}
function countryModal(c) {
  const ch = [];
  const here = c.id === S.country;
  if (!here && S.age >= 18 && !S.prison) {
    ch.push({ t: `✈️ Слетать в отпуск (${fmt(price(180000))})`, disabled: S.used.travel || S.money < price(180000), f: () => { S.used.travel = 1; S.money -= price(180000); if (!S.visited.includes(c.id)) S.visited.push(c.id); eff({ happy: rnd(10, 18), smarts: 2 }); return `${c.flag} Вы отдохнули: ${pick(c.cities)}, ${cname(c)}.`; } });
    ch.push({ t: `🛫 Переехать насовсем (${fmt(price(300000))})`, disabled: S.money < price(300000), f: () => { S.money -= price(300000); S.country = c.id; S.city = pick(c.cities); if (!S.visited.includes(c.id)) S.visited.push(c.id); if (S.job) S.job = null; unlock('emigrant'); eff({ happy: 10 }); return `${c.flag} Вы переехали: ${cname(c)}, город ${S.city}.`; } });
  }
  ch.push({ t: 'Закрыть', f: () => null });
  Q.push({ e: c.flag, title: cname(c), text: `${here ? 'Вы живёте здесь.\n' : ''}Города: ${c.cities.join(', ')}\nВалюта: ${c.cur} · уровень доходов ×${c.wage}\nПродолжительность жизни: ${c.life}\nОсновные религии: ${c.rel.join(', ')}`, choices: ch });
  closeSheet(); pump();
}

/* ===================== Старт ===================== */
function fillStartForm() {
  $('#inYear').value = new Date().getFullYear();
  const sc = $('#inCountry');
  sc.innerHTML = '<option value="">🎲 Случайная страна</option>' + COUNTRIES.map((c) => `<option value="${c.id}">${c.flag} ${c.name}</option>`).join('');
  $('#inGender').innerHTML = '<option value="">🎲 Случайно</option>' + GENDERS.map((g) => `<option value="${g.id}">${g.e} ${g.name}</option>`).join('');
  $('#inOrient').innerHTML = '<option value="">🎲 Случайно</option>' + ORIENTATIONS.map((g) => `<option value="${g.id}">${g.e} ${g.name}</option>`).join('');
  $('#inReligion').innerHTML = '<option value="">🎲 По стране</option>' + RELIGIONS.map((r) => `<option value="${r.id}">${r.e} ${r.id}</option>`).join('');
}
function toStart() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  S = null; Q = [];
  closeSheet(); closeModal();
  $('#continueBtn').hidden = true;
  $('#game').classList.remove('active'); $('#start').classList.add('active');
}
function showGame() { $('#start').classList.remove('active'); $('#game').classList.add('active'); render(); scrollLog(); pump(); }

$('#startForm').addEventListener('submit', (e) => {
  e.preventDefault();
  newLife({
    first: $('#inName').value.trim() || undefined,
    surname: $('#inSurname').value.trim() || undefined,
    country: $('#inCountry').value || undefined,
    gender: $('#inGender').value || undefined,
    orient: $('#inOrient').value || undefined,
    religion: $('#inReligion').value || undefined,
    year: clamp(parseInt($('#inYear').value, 10) || new Date().getFullYear(), 1920, 2060)
  });
  showGame();
});
$('#continueBtn').addEventListener('click', () => { const s = loadSave(); if (s) { S = s; showGame(); } });
$('#ageBtn').addEventListener('click', ageUp);
$('#menuBtn').addEventListener('click', () => openPanel('menu'));
$('#mapBtn').addEventListener('click', () => { if (S) openPanel('map'); });
$('#sheetClose').addEventListener('click', closeSheet);
$('#sheetWrap').addEventListener('click', (e) => { if (e.target.id === 'sheetWrap') closeSheet(); });
document.querySelectorAll('.dock-btn').forEach((b) => b.addEventListener('click', () => { if (S && S.alive) openPanel(b.dataset.panel); }));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); if ((e.key === ' ' || e.key === 'Enter') && S && $('#modalWrap').hidden && $('#sheetWrap').hidden && $('#game').classList.contains('active') && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); ageUp(); } });

fillStartForm();
const existing = loadSave();
if (existing && existing.alive) $('#continueBtn').hidden = false;
