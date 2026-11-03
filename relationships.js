'use strict';
/* Personal memories and household decisions. All durable state is plain JSON. */
function relationshipState(p) {
  S.relationshipIdentity ||= uid();
  if (!p.relationshipMemory || p.relationshipMemory.owner !== S.relationshipIdentity) {
    p.relationshipMemory = { owner: S.relationshipIdentity, entries: [] };
    save();
  }
  return p.relationshipMemory;
}
function relationshipRemember(p, kind, text, weight = 0, hurt = 0) {
  if (!p) return;
  const r = relationshipState(p);
  const existing = r.entries.find(e => e.year === S.year && e.kind === kind);
  if (existing) return existing;
  const entry = { kind, text, year: S.year, weight, hurt };
  r.entries.push(entry);
  while (r.entries.length > 32) {
    const removable = r.entries.findIndex(e => !e.hurt);
    if (removable >= 0) r.entries.splice(removable, 1);
    else {
      const oldest = r.entries.shift();
      r.entries[0].hurt = Math.min(100, r.entries[0].hurt + oldest.hurt);
      r.entries[0].text = 'Несколько давних обид остались неразрешёнными.';
    }
  }
  return entry;
}
function relationshipHurt(p) { return Math.min(100, relationshipState(p).entries.reduce((n, e) => n + (e.hurt || 0), 0)); }
function relationshipTrust(p) {
  const good = relationshipState(p).entries.filter(e => e.weight > 0 && S.year - e.year <= 10).reduce((n, e) => n + e.weight, 0);
  return clamp(50 + Math.min(25, good) - relationshipHurt(p));
}
function relationshipValid(p) { return S?.alive && p?.alive && S.people.includes(p); }
function coupleValid(p) { return relationshipValid(p) && p.role === 'partner' && p === partner() && S.age >= 18 && p.age >= 18; }
function relationshipAction(p, kind, fn) {
  if (!relationshipValid(p)) return 'Этот разговор уже невозможен.';
  const before = p.close, hurt = relationshipHurt(p);
  const result = fn();
  if (!S || !S.people.includes(p)) return result;
  const labels = {
    time: 'Вы нашли время побыть вместе.', talk: 'Вы выслушали без спешки.', gift: 'Вы подарили подарок.',
    date: 'Вы устроили романтическое свидание.', fight: 'Вы устроили тяжёлую ссору.',
    wedding: 'Вы вместе отпраздновали свадьбу.', breakup: 'Вы решили закончить отношения.'
  };
  if (hurt > 0 && p.close > before && ['gift', 'date', 'time', 'talk'].includes(kind)) {
    p.close = clamp(before + Math.max(1, Math.floor((p.close - before) * (kind === 'gift' ? 0.2 : 0.5))));
  }
  if (kind === 'breakup' && p.couple?.care) coupleFinishCare(p, p.couple);
  const negative = kind === 'fight' || kind === 'breakup';
  relationshipRemember(p, kind, labels[kind] || 'Вы разделили важный момент.', negative ? 0 : kind === 'gift' ? 1 : 3, negative ? kind === 'fight' ? 10 : 20 : 0);
  if (['time', 'talk'].includes(kind)) relationshipState(p).careYear = S.year;
  return result;
}
function relationshipApologize(p) {
  if (!relationshipValid(p) || S.used['apology:' + p.id]) return null;
  S.used['apology:' + p.id] = 1;
  const wound = relationshipState(p).entries.find(e => e.hurt > 0);
  if (!wound) return 'Вы поговорили: неразрешённых обид сейчас нет.';
  wound.hurt = Math.max(0, wound.hurt - 2);
  p.close = clamp(p.close + 2);
  relationshipRemember(p, 'apology', 'Вы признали свою ошибку. На восстановление доверия нужно время.', 1);
  return `${p.name} услышал${gv(p, '', 'а', '(а)')} извинение. Доверие придётся подтверждать поступками.`;
}
function relationshipHTML(p) {
  const r = relationshipState(p);
  return `<div class="relationship-memory"><b>Доверие: ${Math.round(relationshipTrust(p))}/100 · неразрешённые обиды: ${relationshipHurt(p)}</b><div class="muted">Подарки не стирают обиды. Извинения и внимание в разные годы постепенно помогают восстановить доверие.</div>${r.entries.length ? r.entries.slice().reverse().map(e => `<div class="memory-entry"><b>${esc(e.year)}</b> · ${esc(e.text)}${e.hurt ? ` <span class="muted">Обиду ещё помнят: ${e.hurt}</span>` : ''}</div>`).join('') : '<div class="muted">Общие воспоминания ещё впереди.</div>'}</div>`;
}
function openRelationshipMemory(p) {
  Q.push({ e: '🧠', title: `Что помнит ${p.name}`, html: relationshipHTML(p), choices: [
    { t: 'Признать ошибку и извиниться', disabled: !relationshipValid(p) || !relationshipHurt(p) || !!S.used['apology:' + p.id], f: () => relationshipApologize(p) },
    { t: 'Закрыть', f: () => null }
  ] });
  pump();
}
const _relationshipModal = showModal;
showModal = function (m) {
  if (m.personId) {
    const p = S.people.find(p => p.id === m.personId);
    if (p) {
      const extra = [{ t: '🧠 Воспоминания и доверие', f: () => { openRelationshipMemory(p); return null; } }];
      if (coupleValid(p)) extra.push({ t: '🤝 Общие решения', f: () => { closeSheet(); openPanel('couple'); return null; } });
      m = { ...m, text: `${m.text}\nДоверие: ${Math.round(relationshipTrust(p))}/100`, choices: [...extra, ...m.choices.map(ch => ch.relationshipAction ? { ...ch, f: () => relationshipAction(p, ch.relationshipAction, ch.f) } : ch)] };
    }
  }
  return _relationshipModal(m);
};
function coupleState(p) {
  const identity = relationshipState(p).owner;
  if (!p.couple || p.couple.owner !== identity) {
    p.couple = { owner: identity, children: pick(['yes', 'later', 'no']), home: pick(['roots', 'adventure']), career: pick(['ambition', 'balance']) };
    save();
  }
  return p.couple;
}
function coupleOpinion(p, topic, destination) {
  const c = coupleState(p), hurt = relationshipHurt(p);
  if (hurt >= 25 || relationshipTrust(p) < 35 || p.close < 40) return { agree: false, reason: 'Сначала нужно восстановить доверие и обсудить неразрешённые обиды.' };
  if (topic === 'children') {
    const ready = c.preparation?.topic === topic && S.year >= c.preparation.ready;
    if (c.children === 'no') return { agree: false, reason: 'Сейчас партнёр не хочет становиться родителем. Это решение нельзя принять за двоих.' };
    if (c.children === 'later' && !ready) return { agree: false, reason: 'Партнёру нужно время на подготовку к родительству.' };
    if (S.prison || (S.money < 0 && !ready)) return { agree: false, reason: 'Партнёр предлагает сначала разобраться с текущими трудностями.' };
    return { agree: true, reason: 'Партнёр готов вместе планировать появление ребёнка.' };
  }
  if (topic === 'move') {
    const ready = c.preparation?.topic === topic && c.preparation.country === destination && S.year >= c.preparation.ready;
    const known = S.people.some(v => v.alive && v.id !== p.id && v.country === destination && v.close >= 60);
    const agree = c.home === 'adventure' || (ready && p.close >= 60) || (known && relationshipTrust(p) >= 60);
    return { agree, reason: agree ? 'Партнёр готов переехать вместе.' : 'Партнёру важны привычный дом и близкие. Нужно подготовиться или выбрать другой путь.' };
  }
  const agree = c.career === 'balance' && relationshipTrust(p) >= 45;
  return { agree, reason: agree ? 'Партнёр готов временно сократить карьерную нагрузку ради семьи.' : 'Партнёр хочет сохранить свою карьеру и предлагает разделить заботы.' };
}
function couplePromise(p, topic, country) {
  const c = coupleState(p);
  c.preparation = { topic, country, ready: S.year + 1, expires: S.year + 2 };
  relationshipRemember(p, 'preparation:' + topic, 'Вы договорились подготовиться и вернуться к важному разговору через год.', 3);
  return 'Вы решили вернуться к разговору через год. Решение о ребёнке или переезде пока не принято.';
}
function coupleFulfillConversation(p, topic) {
  const c = coupleState(p), promise = c.preparation;
  if (promise?.topic === topic && S.year >= promise.ready) {
    relationshipRemember(p, 'promise-kept:' + topic, 'Вы вернулись к обещанному разговору вовремя.', 5);
    // Retain readiness for the choices in this conversation; clear on resolution.
    promise.discussed = true;
  }
}
function couplePerformMove(country, p, together) {
  const destination = COUNTRIES.find(c => c.id === country), cost = price(300000);
  if (!destination || country === S.country) return 'Вы уже живёте в этой стране.';
  if (S.age < 18 || S.prison || S.money < cost) return 'Сейчас переезд недоступен: нужны свобода действий и деньги на дорогу.';
  if (p && !coupleValid(p)) return 'Обстоятельства пары изменились. Обсудите переезд заново.';
  if (!confirmAction('', cost)) return 'Вы отложили переезд.';
  const from = S.country;
  lifeSystems();
  S.money -= cost; S.country = country; S.city = pick(destination.cities); S.job = null;
  if (!S.visited.includes(country)) S.visited.push(country);
  if (together && p) {
    p.country = country; p.close = clamp(p.close + 5);
    for (const child of S.people.filter(v => v.alive && v.role === 'child' && v.age < 18)) child.country = country;
    relationshipRemember(p, 'move-together', 'Вы вместе выбрали новый дом и переехали.', 6);
  } else if (p) {
    p.close = clamp(p.close - 15);
    relationshipRemember(p, 'left-alone', 'Вы переехали отдельно, хотя партнёр хотел остаться вместе.', 0, 18);
  }
  lifeMove(from); unlock('emigrant'); eff({ happy: 10 });
  return `${destination.flag} Вы ${together && p ? 'вместе ' : ''}переехали: ${cname(destination)}, ${S.city}.`;
}
function requestHouseholdMove(country) {
  const p = partner();
  if (!p || !coupleValid(p)) return couplePerformMove(country, null, false);
  return requestCoupleDecision(p, 'move', country);
}
function coupleSetCare(p, who) {
  if (!coupleValid(p) || S.prison) return 'Обстоятельства пары изменились.';
  const c = coupleState(p);
  if (c.care && S.year < c.care.until) return 'У вас уже действует договорённость о нагрузке.';
  if (!S.people.some(v => v.alive && v.role === 'child' && v.age < 18)) return 'Пока нет несовершеннолетних детей, которым нужен такой план заботы.';
  const previous = { ...lifeSystems().plan };
  const plan = { ...previous };
  const transfer = Math.min(plan.work, who === 'shared' ? 1 : who === 'player' ? 2 : 0);
  plan.work -= transfer; plan.family += transfer;
  lifeSystems().plan = plan;
  c.care = { who, until: S.year + 2, previous, applied: { ...plan }, job: p.job };
  if (who === 'partner') p.job = 'Перерыв в карьере';
  p.close = clamp(p.close + 6);
  relationshipRemember(p, 'shared-care', who === 'player' ? 'Вы сократили рабочую нагрузку, чтобы заботиться о детях.' : who === 'shared' ? 'Вы договорились разделить заботу о детях.' : 'Вы вместе договорились о временном перерыве в карьере партнёра.', 6);
  return 'Договорённость действует два года. Меньше времени на работу означает меньшую зарплату. План можно изменить вручную.';
}
const _relationshipTryBaby = tryBaby;
function requestCoupleDecision(p, topic, country) {
  if (!coupleValid(p) || S.prison) return 'Обсудить это можно со взрослым партнёром, когда вы на свободе.';
  if (topic === 'move' && (!COUNTRIES.some(c => c.id === country) || country === S.country)) return 'Выберите другую страну.';
  const c = coupleState(p), key = `couple:${p.id}:${topic}`;
  if (c.pending) {
    if (c.pending.topic !== topic || c.pending.country !== country) return 'Сначала завершите уже начатый разговор.';
  } else {
    if (S.used[key]) return 'В этом году вы уже обсудили этот вопрос.';
    S.used[key] = 1;
    c.pending = { topic, country, year: S.year };
  }
  coupleFulfillConversation(p, topic);
  const opinion = coupleOpinion(p, topic, country);
  const finish = fn => () => {
    if (!coupleValid(p) || S.prison || c.pending?.topic !== topic || c.pending.country !== country) return 'Обстоятельства изменились. Этот разговор уже завершён или недоступен.';
    delete c.pending;
    const result = fn();
    if (c.preparation?.discussed) delete c.preparation;
    return result;
  };
  const choices = [];
  if (topic === 'children') {
    choices.push({ t: 'Предложить стать родителями сейчас', disabled: S.age > 55, f: finish(() => {
      const current = coupleOpinion(p, topic);
      if (!current.agree || S.age > 55) return current.reason;
      S.used.baby = 1;
      relationshipRemember(p, 'parenthood-consent', 'Вы вместе решили попробовать стать родителями.', 5);
      return _relationshipTryBaby(p);
    }) });
    choices.push({ t: 'Подготовиться и обсудить через год', f: finish(() => couplePromise(p, topic)) });
  } else if (topic === 'move') {
    choices.push({ t: `Предложить переехать вместе (${fmt(price(300000))})`, disabled: S.money < price(300000), f: finish(() => coupleOpinion(p, topic, country).agree ? couplePerformMove(country, p, true) : coupleOpinion(p, topic, country).reason) });
    choices.push({ t: 'Подготовиться и обсудить через год', f: finish(() => couplePromise(p, topic, country)) });
    choices.push({ t: `Переехать отдельно (${fmt(price(300000))}) · отношения −15`, disabled: S.money < price(300000), f: finish(() => couplePerformMove(country, p, false)) });
  } else {
    choices.push({ t: 'Я сокращу работу ради детей', f: finish(() => coupleSetCare(p, 'player')) });
    choices.push({ t: 'Разделим заботы и немного сократим мою нагрузку', f: finish(() => coupleSetCare(p, 'shared')) });
    choices.push({ t: 'Предложить партнёру паузу в карьере', f: finish(() => coupleOpinion(p, topic).agree ? coupleSetCare(p, 'partner') : coupleOpinion(p, topic).reason) });
  }
  choices.push({ t: 'Оставить всё как есть и уважить мнение партнёра', f: finish(() => { relationshipRemember(p, 'respect:' + topic, 'Вы выслушали мнение партнёра и не стали давить.', 3); return 'Вы завершили разговор без изменения планов.'; }) });
  Q.push({ coupleScene: true, e: '🤝', title: { children: 'Общее решение: дети', move: 'Общее решение: переезд', care: 'Общее решение: семья и карьера' }[topic], text: `${p.name}: ${opinion.reason}${country ? `\nПредложение: ${cname(COUNTRIES.find(v => v.id === country))}.` : ''}\nДоверие: ${Math.round(relationshipTrust(p))}/100. Партнёр может согласиться или отказать.`, choices });
  save(); closeSheet(); pump();
  return null;
}
tryBaby = function (p) { return requestCoupleDecision(p, 'children'); };

function coupleFinishCare(p, c) {
  if (!c.care) return;
  if (c.care.who === 'partner' && p.job === 'Перерыв в карьере') p.job = c.care.job;
  if (Object.keys(LIFE_TIME).every(k => lifeSystems().plan[k] === c.care.applied[k])) lifeSystems().plan = { ...c.care.previous };
  delete c.care;
  log('🤝 Временный план заботы о детях завершён. Нагрузку можно обсудить заново.', 'info');
}
function relationshipYear() {
  for (const p of S.people) {
    const c = p.couple;
    if (c && c.owner === S.relationshipIdentity && c.care && (!coupleValid(p) || S.year >= c.care.until)) coupleFinishCare(p, c);
  }
  for (const p of S.people.filter(p => p.alive && p.relationshipMemory && p.relationshipMemory.owner === S.relationshipIdentity)) {
    const r = relationshipState(p);
    if (r.careYear === S.year - 1 && !r.entries.some(e => e.year === S.year - 1 && e.hurt > 0)) {
      for (const entry of r.entries) entry.hurt = Math.max(0, (entry.hurt || 0) - 3);
    }
    const hurt = relationshipHurt(p);
    if (hurt >= 10) p.close = clamp(p.close - Math.min(3, Math.floor(hurt / 10)));
  }
  const p = partner(); if (!p || !coupleValid(p)) return;
  const c = coupleState(p);
  if (c.preparation && S.year > c.preparation.expires) {
    if (!c.preparation.discussed) { relationshipRemember(p, 'promise-broken:' + c.preparation.topic, 'Вы не вернулись к обещанному разговору.', 0, 10); p.close = clamp(p.close - 5); log(`🧠 ${p.name} помнит, что важный разговор был отложен и забыт.`, 'bad'); }
    delete c.preparation;
  }
  if (p.country && p.country !== S.country) { p.close = clamp(p.close - 2); log('💌 Отношения на расстоянии требуют больше внимания.', 'info'); }
  const children = S.people.some(v => v.alive && v.role === 'child' && v.age < 12);
  if (!c.pending && !c.care && children && lifeSystems().plan.work >= 5 && S.year - (c.lastRequest || 0) >= 3 && !S.prison) {
    c.lastRequest = S.year;
    // Queue during the annual pipeline; do not open a modal until all hooks finish.
    c.pendingRequest = true;
    Q.push({ e: '🤝', title: `${p.name}: нам нужно поговорить`, text: 'Партнёр просит разделить заботу о детях и обсудить рабочую нагрузку.', choices: [
      { t: 'Обсудить вместе', f: () => { delete c.pendingRequest; return requestCoupleDecision(p, 'care'); } },
      { t: 'Не сейчас', f: () => { delete c.pendingRequest; if (!coupleValid(p)) return null; relationshipRemember(p, 'ignored-care', 'Вы отмахнулись от просьбы разделить заботу о детях.', 0, 8); p.close = clamp(p.close - 5); return 'Партнёр почувствовал, что его просьбу не услышали.'; } }
    ] });
  }
}
YEAR_HOOKS.push(() => lifeMeasure('Память отношений и договорённости пары', relationshipYear));
EXTRA_TITLES.couple = '🤝 Общие решения пары';
EXTRA_PANELS.couple = function () {
  const p = partner();
  if (!p || !coupleValid(p)) { card('<div class="muted">Этот раздел доступен, когда вы и ваш партнёр достигли 18 лет.</div>'); return; }
  const c = coupleState(p);
  const wishes = { yes: 'готов обсуждать родительство сейчас', later: 'хочет подготовиться к родительству', no: 'сейчас не хочет детей', roots: 'ценит привычный дом', adventure: 'открыт к переезду', ambition: 'хочет сохранить карьеру', balance: 'готов менять нагрузку ради семьи' };
  card(`<b>${esc(p.name)}</b><div class="muted">${esc([wishes[c.children], wishes[c.home], wishes[c.career]].join(' · '))}</div>${relationshipHTML(p)}`);
  if (c.care) card(`<div class="muted">План заботы действует до ${c.care.until} года. ${c.care.who === 'partner' ? 'Партнёр временно сделал паузу в карьере.' : 'Ваша рабочая нагрузка временно сокращена.'}</div>`);
  if (c.preparation) card(`<div class="muted">Вы обещали вернуться к разговору ${c.preparation.ready} года.</div>`);
  const list = section('Обсудить');
  if (c.pending) item(list, { e: '💬', t: 'Продолжить начатый разговор', onClick: act(() => requestCoupleDecision(p, c.pending.topic, c.pending.country)) });
  item(list, { e: '👶', t: 'Дети и родительство', disabled: !!c.pending || !!S.prison || !!S.used[`couple:${p.id}:children`] || S.age > 55, onClick: act(() => requestCoupleDecision(p, 'children')) });
  item(list, { e: '🛫', t: 'Где будем жить', disabled: !!c.pending || !!S.prison, onClick: () => { closeSheet(); openEmigrate(); } });
  item(list, { e: '⏳', t: 'Семья и карьера', disabled: !!c.pending || !!S.prison || !!c.care || !S.people.some(v => v.alive && v.role === 'child' && v.age < 18) || !!S.used[`couple:${p.id}:care`], onClick: act(() => requestCoupleDecision(p, 'care')) });
};
const _relationshipPeoplePanel = panelPeople;
panelPeople = function () { const list = section('Доверие и договорённости'); item(list, { e: '🤝', t: 'Общие решения пары', onClick: () => openPanel('couple') }); _relationshipPeoplePanel(); };
MENU_HOOKS.push(list => { if (partner()) item(list, { e: '🤝', t: 'Общие решения пары', onClick: () => openPanel('couple') }); });
