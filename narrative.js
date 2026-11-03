'use strict';
/* Dreams, childhood, colleagues, family occasions and a factual biography. */
const LIFE_DREAMS = [
  { id: 'medicine', name: 'Стать врачом', detail: 'Работать в медицине на второй ступени карьеры или выше.' },
  { id: 'music', name: 'Овладеть музыкой', detail: 'Развить музыкальный навык до 80.' },
  { id: 'family', name: 'Создать большую дружную семью', detail: 'Трое живых детей, минимум с двумя близость 70 или выше.' },
  { id: 'world', name: 'Увидеть мир', detail: 'Посетить десять стран.' },
  { id: 'peace', name: 'Жить спокойно', detail: 'Пять взрослых лет подряд: счастье от 75, здоровье от 70, стресс не выше 35.' }
];
const ORIGIN_STYLE = { supportive: 'Поддерживающее воспитание', strict: 'Строгие ожидания', distant: 'Много самостоятельности', independent: 'Нет живущих рядом родителей', unknown: 'Прошлое не записано' };
const ORIGIN_MEANS = { comfortable: 'Обеспеченная семья', ordinary: 'Умеренные средства', limited: 'Ограниченные средства', unknown: 'Нет данных о детстве' };
const ORIGIN_AREA = { quiet: 'Тихий район', busy: 'Оживлённый район', cramped: 'Небольшое жильё', unknown: 'Район детства неизвестен' };
function narrativeState() {
  if (!S.narrative) {
    const parents = S.people.filter(p => p.alive && ['mother', 'father'].includes(p.role));
    const wealth = parents.reduce((n, p) => n + (p.money || 0), 0);
    const known = S.age < 18;
    const options = SKILLS.filter(s => s.min <= Math.max(6, S.age) && (!s.yr || S.year >= s.yr));
    S.narrative = {
      origin: { known, since: S.year, means: known ? wealth >= price(5000000) ? 'comfortable' : wealth >= price(500000) ? 'ordinary' : 'limited' : 'unknown', style: known ? parents.length ? pick(['supportive', 'strict', 'distant']) : 'independent' : 'unknown', area: known ? pick(['quiet', 'busy', 'cramped']) : 'unknown', interest: known ? pick(options)?.id || 'art' : null },
      dreams: [], journal: [], ancestors: [], family: { events: [], seen: {} }, career: [], observed: { country: S.country, edu: S.edu.level, retired: S.retired }
    };
  }
  return S.narrative;
}
function narrativeNote(kind, text, key) {
  const n = narrativeState();
  if (key && n.journal.some(e => e.key === key)) return;
  n.journal.push({ year: S.year, age: S.age, kind, text, key });
  if (n.journal.length > 80) n.journal.shift();
}
const _narrativeNewLife = newLife;
newLife = function (opts = {}) {
  const result = _narrativeNewLife(opts);
  narrativeState();
  narrativeNote('begin', opts.generation ? `Продолжение семейной истории в возрасте ${yrs(S.age)}.` : `Рождение в городе ${S.city}.`);
  save(); return result;
};
function narrativeDreamProgress(id) {
  const n = narrativeState();
  if (id === 'medicine') return { value: Math.min(2, Math.max(S.job?.id === 'doctor' ? S.job.lvl + 1 : 0, ...n.career.filter(j => j.id === 'doctor').map(j => j.lvl + 1))), target: 2 };
  if (id === 'music') return { value: skillOf('music'), target: 80 };
  if (id === 'family') { const kids = S.people.filter(p => p.alive && p.role === 'child'); return { value: Math.min(3, kids.length) + Math.min(2, kids.filter(p => p.close >= 70).length), target: 5 }; }
  if (id === 'world') return { value: new Set(S.visited).size, target: 10 };
  return { value: n.dreams.find(d => d.id === 'peace' && !d.abandoned)?.streak || 0, target: 5 };
}
function chooseLifeDream(id) {
  if (!S.alive || S.age < 6 || !LIFE_DREAMS.some(d => d.id === id)) return 'Выбрать мечту можно с 6 лет.';
  const n = narrativeState(), current = n.dreams.find(d => !d.done && !d.abandoned);
  if (n.dreams.some(d => d.id === id && d.done)) return 'Эта мечта уже исполнена и сохранена в биографии.';
  if (current?.id === id) return 'Вы продолжаете идти к этой мечте.';
  if (current && S.year - current.start < 5) return 'Вернуться к выбору другой мечты можно через пять лет.';
  if (current) { current.abandoned = S.year; narrativeNote('dream', `Мечта «${LIFE_DREAMS.find(d => d.id === current.id).name}» была пересмотрена.`); }
  n.dreams.push({ id, start: S.year, streak: 0 });
  narrativeNote('dream', `Новая мечта: ${LIFE_DREAMS.find(d => d.id === id).name}.`);
  checkLifeDream(false); save();
  return 'У вашей жизни появилась личная цель.';
}
function checkLifeDream(annual = false) {
  const d = narrativeState().dreams.find(d => !d.done && !d.abandoned); if (!d) return;
  if (annual && d.id === 'peace' && d.lastCount !== S.year) {
    d.lastCount = S.year;
    d.streak = S.age >= 18 && S.stats.happy >= 75 && S.stats.health >= 70 && (S.stress ?? 20) <= 35 ? d.streak + 1 : 0;
  }
  const progress = narrativeDreamProgress(d.id);
  if (progress.value < progress.target) return;
  d.done = S.year;
  const name = LIFE_DREAMS.find(x => x.id === d.id).name;
  narrativeNote('dream-done', `Исполнена мечта «${name}».`);
  log(`🌠 Исполнена мечта: ${name}!`, 'good');
  if (S.alive) eff({ happy: 15 });
}

/* Childhood affects future years only; its circumstances do not define destiny. */
function narrativeChildhoodYear() {
  if (!S.alive || S.age < 6 || S.age >= 18 || S.prison) return;
  const o = narrativeState().origin;
  if (!o.known || o.lastYear === S.year) return;
  o.lastYear = S.year;
  if (o.style === 'strict') { S.edu.grade = clamp(S.edu.grade + 2); eff({ happy: -1 }); }
  if (o.style === 'supportive') eff({ happy: 1 });
  if (o.area === 'quiet') S.stress = clamp((S.stress ?? 20) - 1);
  if (o.area === 'busy') eff({ smarts: 1 });
  if (o.area === 'cramped') S.stress = clamp((S.stress ?? 20) + 1);
  if (o.style === 'supportive' && o.interest) {
    skills()[o.interest] = clamp(skillOf(o.interest) + 1);
    (S.practiced ||= {})[o.interest] = 1;
  }
  if (S.age === 6 && !o.schoolFriend) {
    o.schoolFriend = true;
    const friend = makePerson('friend', { age: 6, close: 65, job: 'Одноклассник' }); S.people.push(friend);
    narrativeNote('childhood', `Первый школьный друг: ${friend.name}.`);
    log(`🎒 В школе вы подружились с ${friend.name}.`, 'good');
  }
  if (S.age === 10 && !o.discussion) {
    o.discussion = true;
    const parent = parentsAlive()[0]; if (!parent) return;
    Q.push({ e: '🎨', title: 'Учёба или увлечение?', text: `${parent.name} хочет, чтобы вы больше занимались школьными предметами. Вы хотите развивать собственный интерес.`, choices: [
      { t: 'Обсудить расписание вместе', f: () => {
        if (!relationshipValid(parent) || S.age >= 18) return 'Обстоятельства семьи изменились.';
        const supported = parent.close >= 50 || o.style === 'supportive';
        if (supported) { o.style = 'supportive'; relationshipRemember(parent, 'child-compromise', 'Вы смогли спокойно договориться об учёбе и увлечениях.', 5); narrativeNote('childhood', 'С родителями найден компромисс об учёбе и увлечениях.'); return 'Вы нашли время и для школы, и для своего интереса.'; }
        eff({ smarts: 1 }); return 'Родитель пока не согласился, но вы объяснили, что вам важно.';
      } },
      { t: 'Сосредоточиться на школе', f: () => { if (S.age >= 18) return null; S.edu.grade = clamp(S.edu.grade + 5); eff({ happy: -2 }); narrativeNote('childhood', 'В споре об увлечениях вы выбрали школьную учёбу.'); return 'В этом году вы сделали упор на учёбу.'; } },
      { t: 'Отстоять своё увлечение', f: () => { if (S.age >= 18 || !relationshipValid(parent)) return null; skills()[o.interest] = clamp(skillOf(o.interest) + 5); parent.close = clamp(parent.close - 5); narrativeNote('childhood', 'Вы отстояли собственное увлечение.'); return 'Вы сохранили интерес, хотя договориться с родителем пока не удалось.'; } }
    ] });
  }
}
function childhoodLesson(paid) {
  if (!S.alive || S.age < 6 || S.age >= 18 || S.prison || S.used.childhoodLesson) return null;
  const o = narrativeState().origin, sk = SKILLS.find(s => s.id === o.interest);
  if (!o.known || !sk || S.age < sk.min || (sk.yr && S.year < sk.yr)) return 'Это занятие пока недоступно.';
  const fee = price(15000);
  if (paid) {
    const parent = parentsAlive().find(p => p.money >= fee && p.close >= 40);
    if (!parent) return 'Сейчас родители не могут оплатить занятия. Можно выбрать бесплатный кружок.';
    parent.money -= fee;
    relationshipRemember(parent, 'child-lessons', 'Вы разделили радость от успехов на занятиях.', 3);
  }
  S.used.childhoodLesson = 1;
  skills()[sk.id] = clamp(skillOf(sk.id) + (paid ? 5 : 3)); (S.practiced ||= {})[sk.id] = 1;
  narrativeNote('childhood', `${paid ? 'Занятия с преподавателем' : 'Бесплатный кружок'}: ${sk.name}.`);
  return 'Вы развивали своё увлечение.';
}
const _narrativeEducation = yearEducation;
yearEducation = function () {
  lifeMeasure('Условия детства', narrativeChildhoodYear);
  const before = S.edu.level, result = _narrativeEducation();
  if (before !== S.edu.level) narrativeNote('education', `Получено образование: ${EDU_NAME[S.edu.level] || S.edu.level}.`);
  return result;
};

/* A stable roster belongs to an employment, rather than to a profession title. */
function workplaceState() {
  const n = narrativeState(); if (!S.job) return null;
  S.job.workplaceId ||= `${uid()}:${S.year}:${S.stat.jobs}`;
  if (!n.workplace || n.workplace.id !== S.job.workplaceId) {
    n.formerWorkplaces ||= [];
    if (n.workplace) n.formerWorkplaces.push(n.workplace);
    n.formerWorkplaces = n.formerWorkplaces.slice(-5);
    const roles = [['boss', 'Руководитель'], ['mentor', 'Наставник'], ['colleague', 'Коллега'], ['workrival', 'Конкурент']];
    const people = roles.map(([role, job]) => { const p = makePerson(role, { age: Math.max(18, S.age + rnd(-4, 12)), close: role === 'workrival' ? 35 : 60, job, country: S.country }); p.workTemper = pick(['требовательный', 'спокойный', 'общительный']); p.id = `${p.id}:${role}:${S.job.workplaceId}`; S.people.push(p); return p.id; });
    n.workplace = { id: S.job.workplaceId, job: S.job.id, since: S.year, people };
    narrativeNote('work', `Вы познакомились с коллективом: ${people.map(id => S.people.find(p => p.id === id).name).join(', ')}.`);
  }
  return n.workplace;
}
const _narrativeRoleName = roleName;
roleName = function (p) { return ({ boss: 'Руководитель', mentor: 'Наставник', colleague: 'Коллега', workrival: 'Конкурент по работе' })[p.role] || _narrativeRoleName(p); };
function workplaceValid(w, p) { return S.alive && S.job?.workplaceId === w.id && narrativeState().workplace === w && !S.prison && (!p || relationshipValid(p)); }
function workplaceProject(w, colleague, choice) {
  if (!workplaceValid(w, colleague) || w.resolved === S.year) return 'Этот рабочий проект уже завершён или коллектив изменился.';
  w.resolved = S.year; delete w.pending;
  if (choice === 'help') {
    S.job.perf = clamp(S.job.perf + 3); colleague.close = clamp(colleague.close + 10); eff({ happy: -2 });
    relationshipRemember(colleague, 'work-help', 'Вы помогли мне закончить сложный проект.', 6); lifeRep('work', 3);
    narrativeNote('work', `Вы помогли коллеге ${colleague.name} с трудным проектом.`);
    return 'Вы потратили время, но заслужили доверие коллеги.';
  }
  if (choice === 'credit') {
    S.job.perf = clamp(S.job.perf + 8); colleague.close = clamp(colleague.close - 18); lifeRep('work', -6);
    relationshipRemember(colleague, 'stolen-credit', 'Вы присвоили себе результаты моей работы.', 0, 20);
    narrativeNote('work', `Вы присвоили результаты проекта коллеги ${colleague.name}.`);
    return 'Результат заметили, но коллега запомнил ваш поступок.';
  }
  S.job.perf = clamp(S.job.perf + 1); return 'Вы сосредоточились на своей части работы.';
}
function workplacePromotion(w, colleague, choice) {
  if (!workplaceValid(w, colleague) || w.promotionResolved === S.year) return 'Предложение уже неактуально.';
  w.promotionResolved = S.year; delete w.pending;
  const definition = JOBS.find(j => j.id === S.job.id);
  if (!definition || S.job.lvl >= definition.titles.length - 1 || S.job.perf < 65) return 'Сейчас предложение о повышении недоступно.';
  if (choice === 'recommend') {
    colleague.close = clamp(colleague.close + 12); lifeRep('work', 5);
    relationshipRemember(colleague, 'recommendation', 'Вы рекомендовали меня руководителю, хотя могли выбрать себя.', 8);
    narrativeNote('work', `Вы поддержали карьеру коллеги ${colleague.name}.`);
    return 'Вы рекомендовали коллегу. Собственное повышение придётся подождать.';
  }
  S.job.lvl++; S.job.lvlYears = 0; S.job.perf = 55;
  colleague.close = clamp(colleague.close - 5);
  relationshipRemember(colleague, 'career-rivalry', 'Вы заняли должность, на которую я тоже рассчитывал.', 0, 5);
  recordNarrativeCareer();
  return `Вы приняли повышение: ${definition.titles[S.job.lvl]}. Коллеге нужно время привыкнуть.`;
}
function recordNarrativeCareer() {
  if (!S.job) return;
  const d = JOBS.find(d => d.id === S.job.id); if (!d) return;
  const n = narrativeState(), key = `${S.job.workplaceId || S.job.id}:${S.job.lvl}`;
  if (!n.career.some(e => e.key === key)) {
    n.career.push({ key, id: S.job.id, lvl: S.job.lvl, title: d.titles[S.job.lvl], year: S.year });
    n.career = n.career.slice(-40);
    narrativeNote('career', `Работа: ${d.titles[S.job.lvl]}.`);
  }
}
function narrativeWorkYear() {
  if (!S.alive || !S.job || S.prison) return;
  const w = workplaceState();
  if (w.pending && w.pending.year < S.year) delete w.pending;
  if (w.pending) return;
  const people = w.people.map(id => S.people.find(p => p.id === id && p.alive)).filter(Boolean);
  const boss = people.find(p => p.role === 'boss'), mentor = people.find(p => p.role === 'mentor');
  const elapsed = S.year - w.since;
  const colleague = people.find(p => p.role === (elapsed > 0 && elapsed % 6 === 0 ? 'workrival' : 'colleague')) || people.find(p => p.role === 'colleague');
  if (boss) S.job.perf = clamp(S.job.perf + (boss.close >= 70 ? 2 : boss.close < 30 ? -2 : 0) - (boss.workTemper === 'требовательный' && S.job.perf < 50 ? 1 : 0));
  if (mentor && mentor.close >= 65 && relationshipTrust(mentor) >= 45) { S.job.perf = clamp(S.job.perf + 2); eff({ smarts: 1 }); }
  if (!colleague || w.lastEvent === S.year) return;
  const def = JOBS.find(d => d.id === S.job.id);
  if (elapsed > 0 && elapsed % 5 === 0 && def && S.job.lvl < def.titles.length - 1 && S.job.perf >= 65) {
    w.lastEvent = S.year;
    w.pending = { kind: 'promotion', person: colleague.id, year: S.year }; openWorkplaceEvent(w);
  } else if (elapsed > 0 && elapsed % 3 === 0) {
    w.lastEvent = S.year;
    w.pending = { kind: 'project', person: colleague.id, year: S.year }; openWorkplaceEvent(w);
  }
}
function openWorkplaceEvent(w) {
  const event = w.pending, colleague = S.people.find(p => p.id === event?.person);
  if (!event || event.year !== S.year || !workplaceValid(w, colleague) || !colleague) return;
  if (event.kind === 'promotion') Q.push({ e: '📈', title: 'Повышение или поддержка коллеги?', text: `Вы и ${colleague.name} претендуете на следующую должность. Руководитель готов выслушать вашу рекомендацию.`, choices: [
    { t: 'Принять предложение', f: () => workplacePromotion(w, colleague, 'accept') },
    { t: 'Рекомендовать коллегу', f: () => workplacePromotion(w, colleague, 'recommend') }
  ] });
  else Q.push({ e: '🤝', title: 'Общий рабочий проект', text: `${colleague.name} не успевает закончить проект. Ваш выбор повлияет на доверие и карьеру.`, choices: [
    { t: 'Помочь коллеге', f: () => workplaceProject(w, colleague, 'help') },
    { t: 'Представить результат как свою работу', f: () => workplaceProject(w, colleague, 'credit') },
    { t: 'Остаться при своей задаче', f: () => workplaceProject(w, colleague, 'own') }
  ] });
}
const _narrativeHire = hire;
hire = function (...args) { const old = S.job, result = _narrativeHire(...args); if (S.job && S.job !== old) { S.job.workplaceId = `${uid()}:${S.year}:${S.stat.jobs}`; workplaceState(); recordNarrativeCareer(); checkLifeDream(false); } return result; };
const _narrativeWork = yearWork;
yearWork = function () { const result = _narrativeWork(); lifeMeasure('Коллеги, наставник и рабочие решения', narrativeWorkYear); recordNarrativeCareer(); return result; };

/* Invitations have durable data; modal callbacks may be recreated after reload. */
const FAMILY_OCCASIONS = { graduation: 'Выпускной', wedding: 'Свадьба ребёнка', jubilee: 'Семейный юбилей', anniversary: 'Годовщина свадьбы', reunion: 'Встреча родственников' };
function addFamilyOccasion(p, kind) {
  const f = narrativeState().family, id = `${p.id}:${kind}:${S.year}`;
  if (f.seen[id]) return;
  f.seen[id] = true;
  const event = { id, person: p.id, name: p.name, kind, year: S.year, status: 'pending' };
  f.events.push(event);
  while (f.events.length > 24) { const old = f.events.findIndex(e => e.status !== 'pending'); if (old < 0) break; f.events.splice(old, 1); }
  return event;
}
function resolveFamilyOccasion(event, choice) {
  const f = narrativeState().family;
  if (!S.alive || !f.events.includes(event) || event.status !== 'pending') return 'Это приглашение уже закрыто.';
  const p = S.people.find(p => p.id === event.person);
  if (!p?.alive) { event.status = 'cancelled'; return 'Обстоятельства изменились, встреча отменена.'; }
  if (event.year !== S.year) return 'Это событие уже осталось в прошлом.';
  const cost = choice === 'organize' ? price(80000) : choice === 'attend' ? price(p.country && p.country !== S.country ? 40000 : 10000) : 0;
  if (cost && (S.prison || S.money < cost)) return 'Сейчас не получится приехать или оплатить праздник. Можно поздравить на расстоянии.';
  S.money -= cost; event.status = choice;
  if (choice === 'skip') {
    p.close = clamp(p.close - 8); relationshipRemember(p, 'missed:' + event.id, `Вы пропустили важное событие: ${FAMILY_OCCASIONS[event.kind]}.`, 0, 8);
  } else {
    p.close = clamp(p.close + (choice === 'organize' ? 12 : choice === 'attend' ? 8 : 3));
    relationshipRemember(p, 'family:' + event.id, `${choice === 'remote' ? 'Вы поздравили на расстоянии' : choice === 'organize' ? 'Вы помогли устроить праздник' : 'Вы пришли поддержать меня'}: ${FAMILY_OCCASIONS[event.kind]}.`, choice === 'remote' ? 2 : 6);
    eff({ happy: choice === 'remote' ? 2 : 6 });
  }
  narrativeNote('family', `${FAMILY_OCCASIONS[event.kind]}: ${p.name}. ${choice === 'skip' ? 'Вы не участвовали.' : choice === 'remote' ? 'Вы поздравили на расстоянии.' : 'Вы участвовали в празднике.'}`);
  saveFamilyPhoto(event, p, choice);
  checkLifeDream(false);
  return choice === 'skip' ? 'Близкий человек запомнил ваше отсутствие.' : 'Ваше внимание осталось в семейной памяти.';
}
function openFamilyOccasion(event) {
  if (!narrativeState().family.events.includes(event) || event.status !== 'pending') return;
  const p = S.people.find(p => p.id === event.person), valid = p?.alive && event.year === S.year;
  const travel = price(p?.country && p.country !== S.country ? 40000 : 10000);
  Q.push({ e: '🎉', title: FAMILY_OCCASIONS[event.kind], text: `${event.name} приглашает вас на семейное событие ${event.year} года. Можно поддержать лично или поздравить на расстоянии.`, choices: [
    { t: `Приехать (${fmt(travel)})`, disabled: !valid || !!S.prison || S.money < travel, f: () => resolveFamilyOccasion(event, 'attend') },
    { t: `Помочь с организацией (${fmt(price(80000))})`, disabled: !valid || !!S.prison || S.money < price(80000), f: () => resolveFamilyOccasion(event, 'organize') },
    { t: 'Поздравить на расстоянии', disabled: !valid, f: () => resolveFamilyOccasion(event, 'remote') },
    { t: 'Пропустить', f: () => resolveFamilyOccasion(event, 'skip') }
  ] });
}
function narrativeFamilyYear() {
  const f = narrativeState().family;
  for (const event of f.events.filter(e => e.status === 'pending')) {
    const p = S.people.find(p => p.id === event.person);
    if (!p?.alive) event.status = 'cancelled';
    else if (event.year < S.year) { event.status = 'missed'; p.close = clamp(p.close - 5); relationshipRemember(p, 'missed:' + event.id, `Приглашение на событие «${FAMILY_OCCASIONS[event.kind]}» осталось без ответа.`, 0, 6); }
  }
  for (const p of S.people.filter(p => p.alive)) {
    if (p.role === 'child' && p.schoolGraduatedYear === S.year) addFamilyOccasion(p, 'graduation');
    if (p.role === 'child' && p.familyMarriedYear === S.year) addFamilyOccasion(p, 'wedding');
    if (['mother', 'father', 'sibling'].includes(p.role) && p.age >= 40 && p.age % 10 === 0) addFamilyOccasion(p, 'jubilee');
    if (p.role === 'partner' && p.status === 'married' && p.marriedYear && S.year > p.marriedYear && (S.year - p.marriedYear) % 5 === 0) addFamilyOccasion(p, 'anniversary');
  }
  const pending = f.events.find(e => e.status === 'pending');
  if (pending && f.lastShown !== S.year) { f.lastShown = S.year; openFamilyOccasion(pending); }
  // Bound old deduplication keys without losing current invitations.
  f.seen = Object.fromEntries(Object.entries(f.seen).filter(([id]) => Number(id.split(':').at(-1)) >= S.year - 2));
}
function startFamilyReunion() {
  const f = narrativeState().family;
  if (!S.alive || S.age < 18 || S.prison || S.year - (f.lastReunion ?? -Infinity) < 5) return 'Семейную встречу можно предложить раз в пять лет, начиная с 18 лет.';
  const p = S.people.find(p => p.alive && ['mother', 'father', 'sibling', 'child'].includes(p.role));
  if (!p) return 'Пока нет родственников, которых можно пригласить.';
  const e = addFamilyOccasion(p, 'reunion');
  if (!e) return 'Встреча уже предложена.';
  f.lastReunion = S.year; openFamilyOccasion(e); closeSheet(); pump(); return null;
}

/* Biography is assembled from recorded game facts, never invented episodes. */
function narrativeBiographyData() {
  const n = narrativeState();
  return { name: `${S.first} ${S.surname}`, birth: S.birthYear, year: S.year, age: S.age, alive: S.alive, cause: S.cause,
    professions: [...new Set(S.career)].map(id => JOBS.find(j => j.id === id)?.name).filter(Boolean),
    place: `${cname(C())}, ${S.city}`, origin: { ...n.origin }, career: n.career.map(j => ({ ...j })),
    dreams: n.dreams.map(d => ({ ...d })), children: S.people.filter(p => p.role === 'child').map(p => ({ name: p.name, alive: p.alive })),
    close: S.people.filter(p => p.alive && !['ex', 'workrival'].includes(p.role) && p.close >= 70).sort((a, b) => b.close - a.close).slice(0, 5).map(p => ({ name: p.name, role: roleName(p) })),
    milestones: n.journal.map(e => ({ ...e })), ancestors: n.ancestors.map(a => ({ ...a })) };
}
function narrativeBiographyHTML(data) {
  const dreamName = id => LIFE_DREAMS.find(d => d.id === id)?.name || id;
  const completed = data.dreams.filter(d => d.done), unfinished = data.dreams.find(d => !d.done && !d.abandoned);
  return `<div class="life-biography"><p><b>${esc(data.name)}</b> · ${esc(data.birth)}–${data.alive ? 'сейчас' : esc(data.year)}. ${esc(yrs(data.age))}. ${esc(data.place)}.</p>${!data.alive ? `<p>Причина смерти: ${esc(data.cause)}.</p>` : ''}<p>${data.origin.known ? `Записанные условия с ${data.origin.since} года: ${esc(ORIGIN_MEANS[data.origin.means])}; ${esc(ORIGIN_STYLE[data.origin.style])}; ${esc(ORIGIN_AREA[data.origin.area])}.` : 'Сведений о прошлом детстве в этом сохранении нет.'}</p><p>Известные профессиональные направления: ${data.professions.length ? data.professions.map(esc).join(', ') : 'пока не записаны'}. Карьерные ступени: ${data.career.length ? data.career.map(j => `${esc(j.year)} — ${esc(j.title)}`).join('; ') : 'карьерные ступени ещё не записаны'}.</p><p>Дети: ${data.children.length ? data.children.map(p => `${esc(p.name)}${p.alive ? '' : ' (в памяти семьи)'}`).join(', ') : 'нет'}. Близкие люди: ${data.close.length ? data.close.map(p => `${esc(p.name)} (${esc(p.role)})`).join(', ') : 'пока не отмечены'}.</p><p>Исполненные мечты: ${completed.length ? completed.map(d => `${esc(dreamName(d.id))} (${d.done})`).join(', ') : 'пока нет'}.${unfinished ? ` Незавершённая мечта: ${esc(dreamName(unfinished.id))}.` : ''}</p><details open><summary>Главы жизни</summary>${data.milestones.slice(-30).map(e => `<p><b>${esc(e.year)}</b> · ${esc(e.text)}</p>`).join('') || '<p>История начнёт заполняться новыми событиями.</p>'}</details>${data.ancestors.length ? `<details><summary>Семейная хроника</summary>${data.ancestors.map(a => `<p><b>${esc(a.name)}</b> · ${a.birth}–${a.year}. ${esc(a.summary)}</p>`).join('')}</details>` : ''}</div>`;
}
function openLifeBiography() {
  const data = narrativeState().finalBiography || narrativeBiographyData();
  showModal({ e: '📖', title: 'Биография', html: narrativeBiographyHTML(data), choices: [{ t: S.alive ? 'Закрыть' : 'Вернуться к итогам жизни', f: () => { if (!S.alive) showDeath(); return null; } }] });
}
const _narrativeModal = showModal;
showModal = function (m) {
  if (m.e === '🪦' && m.title === 'Покойтесь с миром') m = { ...m, choices: [{ t: '📖 Прочитать биографию', f: () => { openLifeBiography(); return null; } }, ...m.choices] };
  return _narrativeModal(m);
};
DEATH_HOOKS.push(() => { narrativeNote('death', `Жизнь завершилась в возрасте ${yrs(S.age)}. Причина: ${S.cause}.`, 'death'); narrativeState().finalBiography = narrativeBiographyData(); });
const _narrativeContinue = continueAs;
continueAs = function (kid) {
  const n = narrativeState(), bio = n.finalBiography || narrativeBiographyData();
  const goals = bio.dreams.filter(d => d.done).map(d => LIFE_DREAMS.find(x => x.id === d.id)?.name).filter(Boolean);
  const record = { name: bio.name, birth: bio.birth, year: bio.year, summary: `${goals.length ? 'Исполненные мечты: ' + goals.join(', ') + '. ' : ''}${bio.milestones.slice(-3).map(e => e.text).join(' ')}` };
  const ancestors = [...n.ancestors, record].slice(-8);
  _narrativeContinue(kid); narrativeState().ancestors = ancestors; save(); render();
};
const _narrativeAddChild = addChild;
addChild = function (...args) { const old = S.people.length, result = _narrativeAddChild(...args); if (S.people.length > old) { const child = S.people[S.people.length - 1]; narrativeNote('family', `В семье появился ребёнок: ${child.name}.`); checkLifeDream(false); } return result; };
function narrativeYear() {
  if (!S.alive) return;
  const n = narrativeState();
  if (n.observed.country !== S.country) narrativeNote('move', `К этому году новый дом: ${cname(C())}, ${S.city}.`);
  if (!n.observed.retired && S.retired) narrativeNote('retirement', 'Начался период жизни на пенсии.');
  n.observed = { country: S.country, edu: S.edu.level, retired: S.retired };
  narrativeFamilyYear(); checkLifeDream(true);
  if (S.age === 12 && !n.dreams.length) Q.push({ e: '🌠', title: 'О чём вы мечтаете?', text: 'Можно выбрать личную цель. Со временем её разрешено пересмотреть.', choices: [{ t: 'Выбрать мечту', f: () => { openPanel('dreams'); return null; } }, { t: 'Пока не знаю', f: () => null }] });
  if ([30, 50].includes(S.age) && n.dreams.some(d => !d.done && !d.abandoned)) Q.push({ e: '🌠', title: 'Переосмыслить мечту?', text: 'За эти годы ваша жизнь изменилась. Можно сохранить цель или выбрать другую.', choices: [{ t: 'Продолжать свой путь', f: () => 'Вы решили сохранить свою мечту.' }, { t: 'Посмотреть другие цели', f: () => { openPanel('dreams'); return null; } }] });
}
YEAR_HOOKS.push(() => lifeMeasure('Мечты и семейные события', narrativeYear));

Object.assign(EXTRA_TITLES, { dreams: '🌠 Личные мечты', childhood: '🎒 Детство и воспитание', workplace: '🏢 Рабочий коллектив', familyevents: '🎉 Семейные события', biography: '📖 Биография' });
EXTRA_PANELS.dreams = function () {
  const n = narrativeState(), list = section('Личные цели');
  card('<div class="muted">Выбор доступен с 6 лет. Неисполненную мечту можно сменить через пять лет. Исполненные цели остаются в биографии.</div>');
  for (const dream of LIFE_DREAMS) {
    const chosen = n.dreams.find(d => d.id === dream.id && !d.abandoned), progress = narrativeDreamProgress(dream.id);
    item(list, { e: chosen?.done ? '🌠' : '✨', t: dream.name, d: `${dream.detail}${chosen ? ` · ${chosen.done ? 'исполнена в ' + chosen.done : progress.value + '/' + progress.target}` : ''}`, onClick: act(() => chooseLifeDream(dream.id)), disabled: S.age < 6 || !!chosen?.done });
  }
};
EXTRA_PANELS.childhood = function () {
  const o = narrativeState().origin;
  card(`<b>${esc(ORIGIN_MEANS[o.means])}</b><div class="muted">${esc(ORIGIN_STYLE[o.style])} · ${esc(ORIGIN_AREA[o.area])}. ${o.known ? `Условия записаны с ${o.since} года.` : 'Прошлое взрослого персонажа не реконструируется.'}</div>`);
  const list = section('Возможности до 18 лет');
  const disabled = S.age < 6 || S.age >= 18 || !!S.prison || !!S.used.childhoodLesson || !o.known;
  item(list, { e: '🎨', t: 'Бесплатный кружок', d: '+3 к собственному увлечению · раз в год', disabled, onClick: act(() => childhoodLesson(false)) });
  item(list, { e: '🎹', t: 'Попросить оплатить занятия', d: '+5 к увлечению; нужны средства и поддержка родителей', disabled, onClick: act(() => childhoodLesson(true)) });
};
EXTRA_PANELS.workplace = function () {
  const active = workplaceState(), w = active || narrativeState().workplace, former = narrativeState().formerWorkplaces || [];
  if (!active) card('<div class="muted">Новый коллектив появится, когда вы устроитесь на работу.</div>');
  if (active?.pending && active.pending.year === S.year) item(section('Незавершённое решение'), { e: '💬', t: 'Вернуться к рабочему разговору', onClick: () => { openWorkplaceEvent(active); closeSheet(); pump(); } });
  for (const team of [...(w ? [w] : []), ...former.slice().reverse()]) {
    const list = section(team === active ? 'Ваши коллеги' : `Прежний коллектив · с ${team.since} года`);
    for (const id of team.people) { const p = S.people.find(p => p.id === id); if (!p) continue; item(list, { e: p.alive ? personEmoji(p) : '🕯️', t: p.name, d: `${roleName(p)} · ${p.workTemper || 'характер пока не известен'} · ${p.alive ? 'доверие ' + Math.round(relationshipTrust(p)) : 'ушёл из жизни'}`, bar: p.alive ? p.close : undefined, onClick: p.alive ? () => personModal(p) : undefined }); }
  }
  card('<div class="muted">Наставник с близостью от 65 помогает учиться. Отношения с руководителем влияют на результативность. Совместные проекты и предложения повышения дают выбор между карьерой и поддержкой коллег.</div>');
  save();
};
EXTRA_PANELS.familyevents = function () {
  const f = narrativeState().family, list = section('Приглашения и семейная память');
  for (const e of f.events.slice().reverse()) item(list, { e: '🎉', t: `${FAMILY_OCCASIONS[e.kind]} · ${e.name}`, d: `${e.year} · ${{ pending: 'ждёт ответа', attend: 'вы приехали', organize: 'вы помогли', remote: 'вы поздравили', skip: 'вы отказались', missed: 'вы пропустили', cancelled: 'отменено' }[e.status]}`, onClick: e.status === 'pending' ? () => { openFamilyOccasion(e); closeSheet(); pump(); } : undefined });
  item(list, { e: '👪', t: 'Предложить встречу родственников', d: 'Раз в пять лет · с 18 лет', disabled: S.age < 18 || !!S.prison || S.year - (f.lastReunion ?? -Infinity) < 5, onClick: act(startFamilyReunion) });
};
EXTRA_PANELS.biography = () => card(narrativeBiographyHTML(narrativeState().finalBiography || narrativeBiographyData()));
function narrativeLinks(list, names) { for (const name of names) item(list, { e: EXTRA_TITLES[name].split(' ')[0], t: EXTRA_TITLES[name].split(' ').slice(1).join(' '), onClick: () => openPanel(name) }); }
MENU_HOOKS.push(list => narrativeLinks(list, ['dreams', 'childhood', 'workplace', 'familyevents', 'biography']));
const _narrativeJobPanel = panelJob;
panelJob = function () { narrativeLinks(section('Личный путь'), ['dreams', 'workplace', 'childhood']); _narrativeJobPanel(); };
const _narrativePeoplePanel = panelPeople;
panelPeople = function () { narrativeLinks(section('Семейные главы'), ['familyevents', 'biography']); _narrativePeoplePanel(); };
