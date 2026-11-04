'use strict';
/* ===================== Глубина жизни: последствия, характер, учёба, экономика, приключения, культура, режимы ===================== */

/* ---------- 2. Отголоски прошлого: решения с отложенными последствиями ---------- */
function plant(k, years, d) { S.seeds = S.seeds || []; S.seeds.push({ k, due: S.age + years, d: d || {} }); }
const sx = (m, f) => gv(S, m, f, m);
EVENTS.push(
  { min: 12, max: 30, w: 4, once: 'e_box', run: () => ev('📦', 'Странная просьба', 'Друг детства просит спрятать у вас тяжёлую коробку и ничего не спрашивать.', [
    { t: '🤐 Спрятать и молчать', f: () => { plant('box', rnd(6, 14)); eff({ karma: 1 }); return 'Коробка уехала на антресоль. Вы стараетесь о ней не думать.'; } },
    { t: '👀 Тайком заглянуть', f: () => { plant('boxopen', rnd(5, 12)); eff({ karma: -3 }); return 'Внутри старые письма и пачка облигаций. Вы закрыли крышку, но запомнили всё.'; } },
    { t: '🙅 Отказать', f: () => 'Друг обиделся, но понял.' }
  ]) },
  { min: 6, max: 45, w: 4, once: 'e_tree', run: () => ev('🌱', 'Саженец', 'Во дворе есть пустое место. Можно посадить дерево.', [
    { t: '🌳 Посадить дуб', f: () => { plant('tree', rnd(25, 40), { city: S.city }); eff({ happy: 3, karma: 2 }); return 'Вы посадили маленький дуб. Он едва достаёт вам до колена.'; } },
    { t: '🤷 Не до того', f: () => 'Место так и осталось пустым.' }
  ]) },
  { min: 16, max: 60, w: 4, once: 'e_stranger', run: () => ev('🌧️', 'Незнакомец под дождём', 'У пожилого мужчины заглохла машина на трассе. Ливень, все проезжают мимо.', [
    { t: '🛠️ Остановиться и помочь', f: () => { plant('stranger', rnd(4, 12)); eff({ karma: 5, health: -1 }); return 'Вы промокли до нитки, но машина завелась. Мужчина записал ваш номер.'; } },
    { t: '🚗 Проехать мимо', f: () => { eff({ karma: -2 }); return 'Вы проехали мимо. Кто-нибудь поможет.'; } }
  ]) },
  { min: 10, max: 25, w: 5, once: 'e_letter', run: () => ev('✉️', 'Письмо в будущее', 'В школе предлагают написать письмо себе сорокалетнему.', [
    { t: '✍️ Мечтаю стать богатым', f: () => { plant('letter', Math.max(3, 40 - S.age), { dream: 'rich' }); return 'Письмо запечатано: «Дорогой я, надеюсь, ты уже миллионер».'; } },
    { t: '✍️ Мечтаю о большой семье', f: () => { plant('letter', Math.max(3, 40 - S.age), { dream: 'family' }); return 'Письмо запечатано: «Надеюсь, у тебя дома шумно и весело».'; } },
    { t: '✍️ Мечтаю увидеть мир', f: () => { plant('letter', Math.max(3, 40 - S.age), { dream: 'world' }); return 'Письмо запечатано: «Надеюсь, твой паспорт весь в печатях».'; } },
    { t: '✍️ Мечтаю о любимом деле', f: () => { plant('letter', Math.max(3, 40 - S.age), { dream: 'career' }); return 'Письмо запечатано: «Надеюсь, ты занимаешься тем, что любишь».'; } }
  ]) },
  { min: 18, max: 55, w: 4, once: 'e_penny', cond: () => S.year >= 1950 && S.money > price(60000), run: () => ev('📃', 'Акции за копейки', 'Знакомый продаёт акции крошечной компании из гаража. Говорит, у них «гениальная идея».', [
    { t: `💸 Купить (${fmt(price(50000))})`, f: () => { S.money -= price(50000); plant('penny', rnd(8, 18)); return 'Вы стали совладельцем компании, о которой никто не слышал.'; } },
    { t: '🙄 Не верю', f: () => 'Вы вежливо отказались.' }
  ]) },
  { min: 20, max: 50, w: 4, once: 'e_lie', cond: () => !!S.job, run: () => ev('🙊', 'Ошибка на работе', 'Вы допустили ошибку в отчёте. Никто пока не заметил.', [
    { t: '🤫 Скрыть', f: () => { plant('lie', rnd(2, 8), { job: S.job.id }); S.job.perf = clamp(S.job.perf + 5); return 'Вы тихо подправили цифры. Пронесло… пока.'; } },
    { t: '🙋 Признаться', f: () => { S.job.perf = clamp(S.job.perf - 8); eff({ karma: 4 }); plant('honest', rnd(2, 6)); return 'Начальник нахмурился, но оценил честность.'; } }
  ]) },
  { min: 16, max: 75, w: 4, once: 'e_witness', run: () => ev('🚦', 'Свидетель', 'На ваших глазах дорогая машина сбила велосипедиста и уехала. Вы запомнили номер.', [
    { t: '👮 Дать показания', f: () => { plant('witness', rnd(3, 10)); eff({ karma: 5, happy: -2 }); return 'Вы полдня провели в участке. Водителя нашли.'; } },
    { t: '🤐 Промолчать', f: () => { plant('silent', rnd(3, 10)); eff({ karma: -4 }); return 'Вы сделали вид, что ничего не видели.'; } }
  ]) },
  { min: 7, max: 15, w: 5, once: 'e_promise', cond: () => S.people.some((p) => p.alive && (p.role === 'mother' || p.role === 'father')), run: () => ev('👵', 'Обещание бабушке', 'Бабушка просит пообещать, что вы будете приезжать к ней в деревню каждое лето.', [
    { t: '🤞 Обещаю', f: () => { plant('promise', rnd(10, 22)); eff({ happy: 2 }); return 'Каждое лето теперь пахнет сеном и пирогами.'; } },
    { t: '😬 Не хочу врать', f: () => 'Бабушка вздохнула и погладила вас по голове.' }
  ]) },
  { min: 8, max: 16, w: 5, once: 'e_bully', run: () => ev('🧒', 'Новенький', 'Над тихим новеньким в классе издеваются. Он смотрит на вас.', [
    { t: '🛡️ Заступиться', f: () => { plant('bully', rnd(15, 28)); eff({ karma: 5, health: -2 }); return 'Вам досталось, но больше новенького не трогают. Его зовут Лёва.'; } },
    { t: '🙈 Не вмешиваться', f: () => { eff({ karma: -2 }); return 'Вы отвернулись. Новенький перевёлся через месяц.'; } }
  ]) },
  { min: 18, max: 24, w: 6, once: 'e_dropout', cond: () => S.edu.stage === 'uni', run: () => ev('🎸', 'Бросить всё ради мечты?', 'Вам предлагают уйти из университета и заняться своим делом мечты. Родители против.', [
    { t: '🚀 Бросить учёбу', f: () => { S.edu.stage = ''; S.edu.tuition = 0; plant('dropout', rnd(5, 9)); eff({ happy: 8 }); return 'Вы забрали документы. Свобода пугает и окрыляет.'; } },
    { t: '📚 Доучиться', f: () => { eff({ happy: -3 }); return 'Синица в руках. Вы остались на курсе.'; } }
  ]) },
  { min: 30, max: 75, w: 3, once: 'e_attic', run: () => ev('🗝️', 'Находка на чердаке', `В старом доме вы нашли пачку чужих писем ${S.year >= 1960 ? '1940-х' : S.year >= 1935 ? '1910-х' : 'прошлого века'}${S.year >= 1935 ? ' годов' : ''} с адресом.`, [
    { t: '📮 Найти адресатов', f: () => { plant('attic', rnd(2, 6)); eff({ karma: 3 }); return 'Вы отправили запрос в архив. Посмотрим, что ответят.'; } },
    { t: '🔥 Выбросить', f: () => 'Старые письма отправились в мусор.' }
  ]) }
);
const ECHOES = {
  box: () => chance(0.55) ? (() => { const g = price(rnd(300000, 2000000)); S.money += g; return ['good', `⏳ Друг детства вернулся за коробкой спустя годы и в благодарность перевёл вам ${fmt(g)}. «Ты единственный, кому я доверял».`]; })()
    : (() => { const f = price(rnd(100000, 500000)); S.money -= f; eff({ happy: -10, karma: -3 }); return ['bad', `⏳ Та самая коробка оказалась уликой в старом деле. Полиция нашла её у вас. Штраф: ${fmt(f)}.`]; })(),
  boxopen: () => { eff({ happy: -4 }); return ['info', '⏳ Друг детства забрал коробку и долго смотрел вам в глаза. Похоже, он догадался, что вы её открывали.']; },
  tree: (d) => { eff({ happy: 10, karma: 3 }); return ['good', `⏳ Дуб, который вы посадили${d.city ? ` в городе ${d.city}` : ''}, вырос огромным. Под ним играют чужие дети, а в кроне живут птицы.`]; },
  stranger: () => {
    if (S.age < 60 && chance(0.6)) { const g = price(rnd(500000, 3000000)); S.money += g; return ['good', `⏳ Тот мужчина с трассы оказался владельцем крупной компании. Он нашёл вас и подарил ${fmt(g)} «за то, что не проехали мимо».`]; }
    eff({ happy: 6 }); return ['good', '⏳ Вам пришла открытка: «Спасибо за тот дождливый день. Я рассказываю о вас внукам».'];
  },
  letter: (d) => {
    const ok = { rich: netWorth() >= price(5000000), family: S.people.filter((p) => p.role === 'child').length >= 2, world: S.visited.length >= 5, career: S.job && S.job.lvl >= 2 }[d.dream];
    eff({ happy: ok ? 12 : -6 });
    return [ok ? 'good' : 'bad', ok ? '⏳ Вы открыли письмо из детства. Мечта сбылась! Вы плакали и смеялись одновременно.' : '⏳ Вы открыли письмо из детства. Мечта пока не сбылась. Может, ещё не поздно?'];
  },
  penny: () => {
    const x = Math.random();
    if (x < 0.3) { const g = price(50000) * rnd(30, 80); S.money += g; unlock('pennygold'); return ['good', `⏳ Та гаражная компания стала гигантом! Ваши копеечные акции стоят ${fmt(g)}.`]; }
    if (x < 0.65) { const g = price(50000) * rnd(2, 4); S.money += g; return ['good', `⏳ Компания из гаража выжила и выкупила вашу долю за ${fmt(g)}.`]; }
    return ['bad', '⏳ Гаражная компания тихо закрылась. Акции превратились в красивую бумажку на память.'];
  },
  lie: (d) => {
    if (S.job && S.job.id === d.job && chance(0.6)) { const def = JOBS.find((j) => j.id === S.job.id); S.job = null; eff({ happy: -15, karma: -3 }); return ['bad', `⏳ Аудит раскопал ту давнюю ошибку в отчёте. Вас уволили с должности «${def.titles[0]}».`]; }
    eff({ happy: -3 }); return ['info', '⏳ Иногда ночью вы вспоминаете тот подправленный отчёт. Совесть не спит.'];
  },
  honest: () => { if (S.job) { S.job.perf = clamp(S.job.perf + 15); return ['good', '⏳ Начальник вспомнил вашу честность и предложил повышение при первой возможности.']; } eff({ karma: 2 }); return ['good', '⏳ Бывший начальник дал вам блестящую рекомендацию.']; },
  witness: () => { const g = price(rnd(100000, 600000)); S.money += g; const f = makePerson('friend', { age: S.age + rnd(-8, 8), close: 70 }); S.people.push(f); return ['good', `⏳ Велосипедист, которому вы помогли, разыскал вас. Его семья передала ${fmt(g)}, а сам он стал вашим другом: ${f.name}.`]; },
  silent: () => { eff({ happy: -8 }); return ['bad', '⏳ В новостях показали того велосипедиста: он так и не встал с инвалидного кресла. Вы долго не могли уснуть.']; },
  promise: () => {
    if (chance(0.6)) { const v = price(rnd(800000, 2500000)); S.assets.push({ uid: uid(), type: 'house', id: 'granny', e: '🏡', name: 'Бабушкин дом в деревне', value: v, price: 0 }); eff({ happy: 8 }); return ['good', `⏳ Бабушка оставила вам свой деревенский дом «за все те лета». Стоимость: ${fmt(v)}.`]; }
    eff({ happy: 5 }); return ['good', '⏳ Бабушка всё ещё ждёт вас каждое лето. Пироги такие же вкусные.'];
  },
  bully: () => {
    if (chance(0.5) && S.stats.health < 70) { eff({ health: 20 }); return ['good', '⏳ Ваш врач в больнице оказался тем самым Лёвой из школы. Он вылечил вас лучше всех и отказался брать деньги.']; }
    eff({ happy: 8, karma: 2 }); return ['good', '⏳ Лёва, за которого вы заступились в школе, теперь известный юрист. Он позвал вас на свою свадьбу и назвал «человеком, который всё изменил».'];
  },
  dropout: () => {
    if (chance(0.35)) { const g = price(rnd(5, 40) * 1e6); S.money += g; S.followers += rnd(20000, 300000); eff({ happy: 15 }); unlock('dreamer'); return ['good', `⏳ Риск окупился! Ваше дело мечты выстрелило: ${fmt(g)} и тысячи поклонников.`]; }
    eff({ happy: -10 }); return ['bad', '⏳ Дело мечты так и не взлетело. Иногда вы думаете: «А если бы я тогда доучился…»'];
  },
  attic: () => { eff({ happy: 10, karma: 3 }); return ['good', '⏳ Нашлась внучка автора писем. Она приехала с цветами и рассказала, что прадед погиб на фронте. Эти письма — всё, что от него осталось.']; }
};
YEAR_HOOKS.push(() => {
  if (!S.seeds || !S.seeds.length || S.prison) return;
  const due = S.seeds.filter((x) => x.due <= S.age); if (!due.length) return;
  S.seeds = S.seeds.filter((x) => x.due > S.age);
  for (const x of due.slice(0, 2)) { const f = ECHOES[x.k]; if (!f) continue; const [c, t] = f(x.d || {}); log(t, c); S.echoes = (S.echoes || 0) + 1; }
  if (due.length > 2) S.seeds.push(...due.slice(2).map((x) => ({ ...x, due: S.age + 1 })));
  if ((S.echoes || 0) >= 5) unlock('echoes');
});

/* ---------- 3. Черты характера ---------- */
const TRAITS = [
  { id: 'brave', e: '🦁', t: 'Смелый', d: 'Легче даются риск, драки и преступления', opp: 'coward' },
  { id: 'coward', e: '🐭', t: 'Осторожный', d: 'Меньше травм и неприятностей, но и меньше удачи', opp: 'brave' },
  { id: 'lazy', e: '🛋️', t: 'Ленивый', d: 'Счастливее, но работает хуже', opp: 'ambitious' },
  { id: 'ambitious', e: '🚀', t: 'Амбициозный', d: 'Быстрее растёт по карьере, но больше стресса', opp: 'lazy' },
  { id: 'kind', e: '💗', t: 'Добрый', d: 'Карма растёт, люди тянутся', opp: 'cruel' },
  { id: 'cruel', e: '🗡️', t: 'Жёсткий', d: 'Карма падает, зато бизнес идёт бойчее', opp: 'kind' },
  { id: 'curious', e: '🔭', t: 'Любознательный', d: 'Ум растёт быстрее' },
  { id: 'charming', e: '✨', t: 'Обаятельный', d: 'Отношения крепче, легче на собеседованиях' },
  { id: 'thrifty', e: '🐷', t: 'Бережливый', d: 'Тратит меньше, копит больше', opp: 'spender' },
  { id: 'spender', e: '🛍️', t: 'Транжира', d: 'Радуется покупкам, но деньги утекают', opp: 'thrifty' },
  { id: 'creative', e: '🎨', t: 'Творческий', d: 'Навыки творчества растут сами' },
  { id: 'athletic', e: '🏃', t: 'Спортивный', d: 'Здоровье крепче' },
  { id: 'optimist', e: '🌞', t: 'Оптимист', d: 'Счастье держится высоко', opp: 'gloomy' },
  { id: 'gloomy', e: '🌧️', t: 'Меланхолик', d: 'Счастье ниже, зато глубокие мысли и творчество', opp: 'optimist' }
];
const hasTrait = (id) => !!(S && S.traits && S.traits.includes(id));
function addTrait(id, quiet) {
  S.traits = S.traits || [];
  if (S.traits.includes(id)) return false;
  const t = TRAITS.find((x) => x.id === id); if (!t) return false;
  if (t.opp && S.traits.includes(t.opp)) { S.traits = S.traits.filter((x) => x !== t.opp); }
  if (S.traits.length >= 4) S.traits.shift();
  S.traits.push(id);
  if (!quiet) log(`${t.e} Характер изменился: вы стали «${t.t.toLowerCase()}».`, 'info');
  return true;
}
function rollTraits(inherit) {
  S.traits = [];
  const pool = TRAITS.map((x) => x.id).sort(() => Math.random() - 0.5);
  if (inherit && inherit.length && chance(0.6)) addTrait(pick(inherit), true);
  for (const id of pool) { if (S.traits.length >= 2) break; addTrait(id, true); }
}
const _newLifeDeep = newLife;
newLife = function (opts = {}) {
  const r = _newLifeDeep(opts);
  if (!S.traits) rollTraits(opts.inheritTraits);
  return r;
};
const _contAsDeep = continueAs;
continueAs = function (k) {
  const tr0 = (S.traits || []).slice(); const seeds = []; const coll = (S.collect || []).slice(); const iron = S.iron;
  _contAsDeep(k);
  S.traits = null; rollTraits(tr0);
  if (coll.length) { S.collect = coll; log(`🧸 Вам досталась коллекция родителя: ${coll.length} ${plural(coll.length, ['вещь', 'вещи', 'вещей'])}.`, 'info'); }
  if (iron) S.iron = true;
  save();
};
YEAR_HOOKS.push(() => {
  if (!S.traits) rollTraits();
  if (S.prison) return;
  if (hasTrait('curious') && chance(0.6)) eff({ smarts: 1 });
  if (hasTrait('athletic') && chance(0.6)) eff({ health: 1 });
  if (hasTrait('optimist')) S.stats.happy = Math.max(S.stats.happy, 35);
  if (hasTrait('gloomy') && chance(0.4)) eff({ happy: -2 });
  if (hasTrait('kind') && chance(0.5)) eff({ karma: 1 });
  if (hasTrait('cruel') && chance(0.4)) eff({ karma: -1 });
  if (hasTrait('lazy')) { eff({ happy: 1 }); if (S.job) S.job.perf = clamp(S.job.perf - 3); }
  if (hasTrait('ambitious') && S.job) { S.job.perf = clamp(S.job.perf + 4); if (chance(0.3)) eff({ happy: -1 }); }
  if (hasTrait('charming')) { for (const p of S.people) if (p.alive && chance(0.3)) p.close = clamp((p.close || 50) + 1); if (S.job) S.job.perf = clamp(S.job.perf + 1); }
  if (hasTrait('thrifty') && S.age >= 18) S.money += Math.round(price(20000));
  if (hasTrait('spender') && S.age >= 18 && S.money > 0) { S.money -= Math.round(Math.min(S.money * 0.03, price(200000))); eff({ happy: 1 }); }
  if ((hasTrait('creative') || hasTrait('gloomy')) && S.age >= 6) { const sk = skills(); const id = pick(['art', 'music', 'write'].filter((x) => SKILLS.some((s) => s.id === x))); if (id) sk[id] = Math.min(100, (sk[id] || 0) + 1); }
  if (hasTrait('cruel') && S.biz) S.biz.value = Math.round(S.biz.value * 1.02);
  if (hasTrait('brave') && chance(0.03) && S.age > 10) { eff({ health: -6 }); log('🩹 Вы полезли туда, куда остальные боялись. Шрам на память.', 'bad'); }
  if (hasTrait('coward') && chance(0.03)) { eff({ happy: -2 }); log('😰 Вы отказались от авантюры. Друзья пошли без вас и отлично провели время.', 'info'); }
  // характер меняется от образа жизни
  if (S.age >= 12 && chance(0.12)) {
    const cand = [];
    if (S.stats.smarts >= 85) cand.push('curious');
    if (S.karma >= 85) cand.push('kind');
    if (S.karma <= 15) cand.push('cruel');
    if (S.stats.health >= 85) cand.push('athletic');
    if (S.stats.happy >= 85) cand.push('optimist');
    if (S.stats.happy <= 20) cand.push('gloomy');
    if (S.money < 0) cand.push('spender');
    if (S.job && S.job.lvl >= 3) cand.push('ambitious');
    if ((S.crimes || 0) >= 3) cand.push('brave');
    if (S.stats.looks >= 85) cand.push('charming');
    const c = cand.filter((x) => !hasTrait(x));
    if (c.length) addTrait(pick(c));
  }
  if ((S.traits || []).length >= 4) unlock('complex');
});
EVENTS.push(
  { min: 14, max: 70, w: 3, cond: () => hasTrait('brave'), run: () => ev('🦁', 'Пожар в подъезде', 'Из соседней квартиры валит дым, внутри кто-то кричит. Пожарные ещё едут.', [
    { t: '🔥 Броситься внутрь', f: () => { if (chance(0.7)) { eff({ karma: 10, health: -8, happy: 10 }); S.followers += rnd(1000, 20000); unlock('hero_fire'); return 'Вы вынесли соседку на руках. Про вас сняли сюжет в новостях!'; } eff({ health: -25 }); return 'Вы надышались дымом и попали в больницу. Соседку спасли пожарные.'; } },
    { t: '📞 Звонить 112 и ждать', f: () => { eff({ karma: 2 }); return 'Пожарные приехали быстро. Все живы.'; } }
  ]) },
  { min: 16, max: 70, w: 3, cond: () => hasTrait('curious'), run: () => ev('🔭', 'Кроличья нора', S.year >= 2000 ? 'Вы наткнулись на загадочную статью в интернете и не спали до утра, читая всё подряд.' : 'Вы наткнулись в библиотеке на загадочную книгу и не спали до утра, читая всё подряд.', [
    { t: '📚 Копать дальше', f: () => { eff({ smarts: rnd(3, 6), health: -2 }); return 'Неделя без сна, зато теперь вы эксперт в истории средневековых замков.'; } },
    { t: '😴 Лечь спать', f: () => 'Здоровый сон победил любопытство.' }
  ]) },
  { min: 18, max: 70, w: 3, cond: () => hasTrait('spender'), run: () => ev('🛍️', 'Распродажа!', 'Скидки до 70%. Корзина сама наполняется.', [
    { t: `💳 Скупить всё (${fmt(price(120000))})`, f: () => { S.money -= price(120000); eff({ happy: 8 }); return S.year >= 2005 ? 'Три пакета одежды и робот-пылесос. Счастье!' : S.year >= 1960 ? 'Три пакета одежды и новый пылесос. Счастье!' : 'Три свёртка одежды и новая шляпка. Счастье!'; } },
    { t: '🚪 Уйти', f: () => { eff({ happy: -3 }); return 'Вы ушли с пустыми руками и тяжёлым сердцем.'; } }
  ]) },
  { min: 16, max: 80, w: 3, cond: () => hasTrait('gloomy'), run: () => ev('🌧️', 'Осенняя тоска', 'Дождь стучит по стеклу уже неделю.', [
    { t: '✍️ Написать стихи', f: () => { const sk = skills(); sk.write = Math.min(100, (sk.write || 0) + 4); eff({ happy: 4 }); return 'Вышло пронзительно. Пожалуй, лучшее, что вы написали.'; } },
    { t: '🧑‍⚕️ Сходить к психологу', f: () => { eff({ happy: 8 }); return 'Стало легче. Оказывается, так бывает у многих.'; } }
  ]) },
  { min: 18, max: 65, w: 3, cond: () => hasTrait('charming'), run: () => ev('✨', 'Нужные люди', 'На вечеринке вы разговорились с влиятельным человеком. Он явно очарован.', [
    { t: '🤝 Попросить о помощи с карьерой', f: () => { if (S.job) { S.job.perf = clamp(S.job.perf + 20); return 'Через неделю начальник вызвал вас и намекнул на повышение.'; } const g = price(200000); S.money += g; return `Вам предложили разовый проект на ${fmt(g)}.`; } },
    { t: '🥂 Просто наслаждаться вечером', f: () => { eff({ happy: 6 }); return 'Прекрасный вечер без корысти.'; } }
  ]) }
);
EXTRA_TITLES.traits = '🧠 Характер';
EXTRA_PANELS.traits = function () {
  const mine = (S.traits || []).map((id) => TRAITS.find((x) => x.id === id)).filter(Boolean);
  card(`<div class="muted">Ваш характер</div><div class="big">${mine.map((t) => t.e).join(' ') || '—'}</div><div class="muted">Черты меняются от поступков и образа жизни. Одновременно — не больше четырёх.</div>`);
  const l = section('Черты');
  for (const t of mine) item(l, { e: t.e, t: t.t, d: t.d });
  const l2 = section('Все черты');
  for (const t of TRAITS.filter((x) => !mine.includes(x))) { const n = item(l2, { e: t.e, t: t.t, d: t.d }); n.style.opacity = '.55'; }
};
MENU_HOOKS.push((l) => item(l, { e: '🧠', t: 'Характер', d: (S.traits || []).map((id) => (TRAITS.find((x) => x.id === id) || {}).t).filter(Boolean).join(', '), onClick: () => openPanel('traits') }));
const _panelProfileDeep = panelProfile;
panelProfile = function () {
  _panelProfileDeep();
  const mine = (S.traits || []).map((id) => TRAITS.find((x) => x.id === id)).filter(Boolean);
  if (mine.length) { const l = section('Характер'); for (const t of mine) item(l, { e: t.e, t: t.t, d: t.d, onClick: () => openPanel('traits') }); }
};

/* ---------- 4. Образование: топ-вузы, стажировки, гранты, докторская ---------- */
const TOP_UNIS = [
  { id: 'harvard', n: 'Гарвардский университет', c: 'us', yr: 1900 }, { id: 'mit', n: 'Массачусетский технологический институт', c: 'us', yr: 1900 },
  { id: 'stanford', n: 'Стэнфордский университет', c: 'us', yr: 1900 }, { id: 'oxford', n: 'Оксфордский университет', c: 'gb', yr: 1900 },
  { id: 'cambridge', n: 'Кембриджский университет', c: 'gb', yr: 1900 }, { id: 'sorbonne', n: 'Сорбонна', c: 'fr', yr: 1900 },
  { id: 'eth', n: 'Цюрихский политехнический институт', c: 'ch', yr: 1900 }, { id: 'tokyo', n: 'Токийский университет', c: 'jp', yr: 1900 },
  { id: 'msu', n: 'МГУ имени Ломоносова', c: 'ru', yr: 1900 }, { id: 'tsinghua', n: 'Университет Цинхуа', c: 'cn', yr: 1911 },
  { id: 'nus', n: 'Национальный университет Сингапура', c: 'sg', yr: 1980 }, { id: 'heidelberg', n: 'Гейдельбергский университет', c: 'de', yr: 1900 }
];
const INTERN = [
  { e: '🏦', n: 'стажировка в банке', sk: 'smarts' }, { e: '🔬', n: 'стажировка в лаборатории', sk: 'smarts' }, { e: '💻', n: 'стажировка в IT-компании', yr: 1975, sk: 'code' },
  { e: '📰', n: 'стажировка в редакции', sk: 'write' }, { e: '🏛️', n: 'стажировка в министерстве', sk: 'smarts' }, { e: '🎬', n: 'стажировка на киностудии', yr: 1915, sk: 'acting' },
  { e: '🏥', n: 'стажировка в клинике', sk: 'smarts' }, { e: '🌍', n: 'стажировка в международной организации', yr: 1945, sk: 'smarts' }
];
const _jobSalaryDeep = jobSalary;
jobSalary = function (j) {
  if (!j || !JOBS.find((x) => x.id === j.id)) return 0;
  let s = _jobSalaryDeep(j);
  if (S && S.edu) { if (S.edu.top) s *= 1.3; if (S.edu.intern) s *= 1 + 0.05 * Math.min(3, S.edu.intern); if (S.edu.dsc) s *= 1.1; }
  return Math.round(s);
};
EXTRA_TITLES.study = '🎓 Академия';
EXTRA_PANELS.study = function () {
  const e = S.edu; const top = e.top ? TOP_UNIS.find((u) => u.id === e.top) : null;
  const stageName = { uni: 'Университет', master: 'Магистратура', phd: 'Аспирантура', college: 'Колледж', school: 'Школа' }[e.stage] || 'Не учитесь';
  card(`<div class="muted">Учёба</div><div class="big">${stageName}${top ? ` · ${esc(top.n)}` : ''}</div><div class="muted">Стажировки: ${e.intern || 0} · гранты: ${e.grants || 0}${e.dsc ? ' · 🎓 доктор наук' : ''}${e.docYears ? ` · докторская: ещё ${yrs(e.docYears)}` : ''}</div><div class="muted">Топ-вуз даёт +30% к зарплате, каждая стажировка ещё +5%.</div>`);
  const l = section('Возможности');
  const A = (e2, t, d, key, dis, fn) => item(l, { e: e2, t, d: key && S.used[key] ? 'Уже в этом году' : d, disabled: dis || (key && S.used[key]), onClick: act(() => { if (key) S.used[key] = 1; return fn(); }) });
  const studying = ['uni', 'master', 'phd'].includes(e.stage);
  if (studying && !e.top) {
    for (const u of TOP_UNIS.filter((x) => S.year >= x.yr).sort(() => Math.random() - 0.5).slice(0, 3)) {
      const c = COUNTRIES.find((x) => x.id === u.c); const ch = Math.max(3, Math.round((S.stats.smarts - 55) * 2 + (e.grade - 50) * 0.6));
      A(c ? c.flag : '🎓', `Перевестись: ${u.n}`, `Шанс ~${Math.min(90, ch)}% · экзамены и эссе`, 'topuni', S.age < 17, () => {
        if (rnd(1, 100) <= Math.min(90, ch)) { e.top = u.id; e.tuition = S.stats.smarts >= 92 ? 0 : wageOf(2500000); if (c && !S.visited.includes(c.id)) S.visited.push(c.id); unlock('ivy'); eff({ happy: 15 }); return `🎉 Вас приняли: ${u.n}! ${e.tuition ? `Обучение: ${fmt(e.tuition)} в год.` : 'Полная стипендия!'}`; }
        eff({ happy: -6 }); return `📭 ${u.n} ответил отказом. Конкурс был огромный.`;
      });
    }
  }
  if (studying || (S.age >= 18 && S.age <= 30 && !S.job)) {
    const opts = INTERN.filter((x) => !x.yr || S.year >= x.yr);
    const it = opts[(S.age + (e.intern || 0)) % opts.length];
    A(it.e, `Летняя ${it.n}`, '+опыт, +5% к будущей зарплате', 'intern', S.age < 17, () => {
      e.intern = (e.intern || 0) + 1; eff({ smarts: rnd(1, 3), happy: -2 }); if (it.sk !== 'smarts') { const sk = skills(); sk[it.sk] = Math.min(100, (sk[it.sk] || 0) + rnd(3, 6)); }
      const abroad = chance(0.35) ? pick(COUNTRIES.filter((x) => x.id !== S.country && x.wage >= 1)) : null;
      if (abroad && !S.visited.includes(abroad.id)) S.visited.push(abroad.id);
      if (e.intern >= 3) unlock('intern3');
      return `${it.e} Вы прошли: ${it.n}${abroad ? ` (${abroad.flag} ${abroad.name})` : ''}. Наставник обещал рекомендацию.`;
    });
  }
  if (studying) A('🌐', 'Семестр по обмену', `${fmt(price(250000))} · новая страна и друзья`, 'exch', S.money < price(250000), () => {
    const c = pick(COUNTRIES.filter((x) => x.id !== S.country)); S.money -= price(250000); if (!S.visited.includes(c.id)) S.visited.push(c.id);
    const f = makePerson('friend', { age: S.age + rnd(-2, 2), close: 65, pool: c.names, country: c.id }); S.people.push(f);
    eff({ happy: 10, smarts: 2 }); return `🌐 Полгода по обмену: ${c.flag} ${c.name}. Новый друг: ${f.name}.`;
  });
  if (['master', 'phd'].includes(e.stage) || e.level === 'phd' || e.level === 'master') A('💶', 'Подать на исследовательский грант', 'Шанс зависит от ума', 'grant2', false, () => {
    if (chance(Math.min(0.85, S.stats.smarts / 120))) { const g = price(rnd(300000, 1500000)); S.money += g; e.grants = (e.grants || 0) + 1; return `💶 Грант одобрен: ${fmt(g)}!`; }
    return '💶 Заявку отклонили. Рецензент №2 снова недоволен.';
  });
  if (e.level === 'phd' && !e.dsc && !e.docYears) A('📜', 'Писать докторскую диссертацию', '3 года работы, +10% к зарплате, звание доктора наук', null, S.age < 26, () => { e.docYears = 3; return '📜 Вы начали докторскую. Впереди три года архивов и бессонных ночей.'; });
  if (!studying && !['phd'].includes(e.level) && !e.stage && S.age >= 22 && S.age <= 60 && (e.level === 'bachelor' || e.level === 'master')) item(l, { e: '🎓', t: 'Магистратура и аспирантура', d: 'Поступление — в разделе «Работа» → «Учёба»', disabled: true });
  if (!studying && !l.children.length) l.appendChild(el('<div class="empty">Топ-вузы, стажировки и обмен доступны во время учёбы в университете.</div>'));
};
YEAR_HOOKS.push(() => {
  const e = S.edu; if (!e || !e.docYears || S.prison) return;
  e.docYears--; eff({ smarts: rnd(1, 3), happy: -1 });
  if (e.docYears <= 0) { e.dsc = true; delete e.docYears; unlock('dsc'); log('📜 Вы защитили докторскую диссертацию! Теперь вы доктор наук.', 'good'); eff({ happy: 12 }); }
});
CAREER_HOOKS.push((l) => item(l, { e: '🎓', t: 'Академия', d: S.edu.top ? (TOP_UNIS.find((u) => u.id === S.edu.top) || {}).n : 'Топ-вузы, стажировки, гранты, докторская', onClick: () => openPanel('study') }));

/* ---------- 5. Экономика: раунды инвестиций и новости компаний ---------- */
const ROUNDS = ['Pre-seed', 'Seed', 'Раунд A', 'Раунд B', 'Раунд C', 'Раунд D'];
const STARTUPISH = ['it', 'ai', 'space', 'eshop', 'agency'];
const INVESTORS = [
  { e: '🦈', n: 'Агрессивный фонд', k: 1.6, cut: 1.5, d: 'Много денег, но заберут большую долю' },
  { e: '👼', n: 'Бизнес-ангел', k: 0.8, cut: 0.7, d: 'Меньше денег, мягкие условия, полезные советы' },
  { e: '🏦', n: 'Корпоративный инвестор', k: 1.2, cut: 1.1, d: 'Связи и клиенты, средние условия' }
];
const _bizPanelDeep = EXTRA_PANELS.biz;
EXTRA_PANELS.biz = function () {
  _bizPanelDeep();
  const b = S.biz; if (!b || !STARTUPISH.includes(b.type)) return;
  b.round = b.round || 0;
  const l = section(`🚀 Венчурные раунды · пройдено ${b.round}`);
  if (b.round >= ROUNDS.length) { l.appendChild(el('<div class="empty">Все раунды пройдены. Дальше только IPO.</div>')); return; }
  const need = Math.round((b.start || b.value) * (1.5 ** b.round));
  const can = b.value >= need && (b.years || 0) >= 1 && !S.used.round;
  item(l, { e: '💼', t: `Привлечь ${ROUNDS[b.round]}`, d: can ? 'Выберите инвестора' : S.used.round ? 'Уже в этом году' : `Нужна оценка от ${fmt(need)} и год работы`, disabled: !can, onClick: () => {
    closeSheet();
    Q.push({ e: '🚀', title: ROUNDS[b.round], text: `Оценка компании «${b.name}»: ${fmt(b.value)}. Ваша доля: ${b.own}%. Кого выберете?`, choices: INVESTORS.map((iv) => ({ t: `${iv.e} ${iv.n}`, f: () => {
      S.used.round = 1;
      const raise = Math.round(b.value * rf(0.15, 0.3) * iv.k); const cut = Math.min(40, Math.round(raise / (b.value + raise) * 100 * iv.cut));
      b.own = Math.max(1, Math.round(b.own * (1 - cut / 100))); b.value += raise; b.quality = clamp(b.quality + rnd(4, 10)); b.boost = (b.boost || 0) + rf(0.05, 0.15); b.round++;
      if (iv.e === '👼') eff({ smarts: 2 }); if (iv.e === '🏦') b.rep = clamp(b.rep + 8);
      if (b.value >= price(7e10)) unlock('unicorn');
      return `🚀 ${ROUNDS[b.round - 1]} закрыт: +${fmt(raise)} в компанию. ${iv.n} получил ${cut}%, у вас осталось ${b.own}%.`;
    } })).concat([{ t: 'Передумать', f: () => null }]) });
    pump();
  } });
};
const CO_NEWS = [
  { t: 'выпустила революционный продукт', k: [0.15, 0.45] }, { t: 'попала в скандал с утечкой данных', k: [-0.35, -0.12] },
  { t: 'сменила генерального директора', k: [-0.1, 0.12] }, { t: 'отчиталась о рекордной прибыли', k: [0.1, 0.3] },
  { t: 'объявила о массовых увольнениях', k: [-0.2, -0.02] }, { t: 'купила конкурента', k: [0.05, 0.25] },
  { t: 'проиграла крупный судебный иск', k: [-0.3, -0.08] }, { t: 'получила госконтракт', k: [0.08, 0.22] },
  { t: 'отозвала бракованную продукцию', k: [-0.25, -0.05] }, { t: 'вошла в список самых инновационных компаний', k: [0.05, 0.18] }
];
YEAR_HOOKS.push(() => {
  if (typeof market !== 'function' || typeof COMPANIES === 'undefined' || !chance(0.55)) return;
  const M = market(); const live = COMPANIES.filter((c) => M[c.t]); if (!live.length) return;
  const c = pick(live); const n = pick(CO_NEWS); const k = rf(n.k[0], n.k[1]);
  const m = M[c.t]; const old = m.p; m.p = Math.max(0.05, m.p * (1 + k)); m.ch = (1 + (m.ch || 0)) * (1 + k) - 1; m.news = `${n.t} (${k >= 0 ? '+' : ''}${Math.round(k * 100)}%)`;
  const held = (S.shares || {})[c.t] || 0;
  if (held || chance(0.35)) log(`📰 Биржа: «${c.name}» ${n.t}. Акции ${k >= 0 ? 'выросли' : 'упали'} на ${Math.abs(Math.round(k * 100))}%.${held ? ` Ваш пакет: ${fmt(Math.round(held * m.p))}.` : ''}`, k >= 0 ? (held ? 'good' : 'news') : held ? 'bad' : 'news');
});
const _marketPanelDeep = EXTRA_PANELS.market;
if (_marketPanelDeep) EXTRA_PANELS.market = function () {
  _marketPanelDeep();
  const M = market(); const nw = COMPANIES.filter((c) => M[c.t] && M[c.t].news);
  if (nw.length) { const l = section('📰 Новости компаний'); for (const c of nw.slice(-5)) item(l, { e: c.e, t: c.name, d: M[c.t].news }); }
};

/* ---------- 6. Приключения в путешествиях ---------- */
const QUESTS = [
  { k: 'any', e: '🧒', t: 'Потерявшийся ребёнок', x: 'У фонтана плачет маленький мальчик. Он потерял родителей и не говорит на вашем языке.', c: [
    { t: '🤝 Помочь найти родителей', f: () => { eff({ karma: 6, happy: 4 }); return 'Через час вы нашли его маму. Она обняла вас и подарила браслет ручной работы.'; } },
    { t: '👮 Отвести в полицию', f: () => { eff({ karma: 3 }); return 'Полицейские поблагодарили вас. Мальчика быстро нашли.'; } }] },
  { k: 'beach', e: '🗺️', t: 'Карта сокровищ', x: 'Старый рыбак продаёт «настоящую пиратскую карту» острова.', c: [
    { t: '🏴‍☠️ Купить и искать', f: () => { const r = Math.random(); if (r < 0.25) { const g = price(rnd(200000, 900000)); S.money += g; unlock('treasure'); return `Под пальмой вы откопали сундучок со старинными монетами! Коллекционер купил их за ${fmt(g)}.`; } if (r < 0.65) return 'Вы перекопали полпляжа и нашли только крышку от пива. Зато загорели.'; eff({ health: -8 }); return 'Вы заблудились в мангровых зарослях и наглотались комаров.'; } },
    { t: '😏 Не вестись', f: () => 'Рыбак пожал плечами и пошёл к следующим туристам.' }] },
  { k: 'city', e: '🏺', t: 'Лавка антиквара', x: 'В переулке пыльная лавка. Продавец шепчет, что эта ваза «из императорского дворца».', c: [
    { t: `💸 Купить (${0})`, cost: 30000, f: () => { if (chance(0.2)) { const g = price(30000) * rnd(15, 40); S.money += g; return `Эксперт подтвердил: подлинник XVIII века! Аукцион принёс ${fmt(g)}.`; } return 'Дома на дне вазы вы нашли наклейку «Made in 2010». Ну хоть красивая.'; } },
    { t: '🚶 Уйти', f: () => 'Вы ушли. Ваза проводила вас загадочным взглядом.' }] },
  { k: 'mountain', e: '🌨️', t: 'Метель на перевале', x: 'До вершины два часа, но начинается метель. Гид советует переждать.', c: [
    { t: '🏔️ Идти на вершину', f: () => { if (chance(0.55)) { eff({ happy: 15 }); unlock('summit'); return 'Вы стоите на вершине над облаками. Ради этого стоило жить!'; } eff({ health: -18 }); return 'Метель сбила с пути. Вас нашли спасатели с обморожением.'; } },
    { t: '🛖 Переждать в хижине', f: () => { eff({ happy: 4 }); return 'Ночь в хижине, чай из термоса и истории других альпинистов.'; } }] },
  { k: 'cruise', e: '🌊', t: 'Шторм', x: 'Ночью лайнер попал в шторм. Экипаж просит пассажиров помочь с паникующими людьми.', c: [
    { t: '🦺 Помогать экипажу', f: () => { eff({ karma: 6, health: -3 }); return 'Вы всю ночь успокаивали людей. Капитан пожал вам руку и пригласил на мостик.'; } },
    { t: '🛏️ Лежать в каюте', f: () => { eff({ happy: -4 }); return 'Вас укачало так, что вы поклялись больше не плавать.'; } }] },
  { k: 'safari', e: '🦁', t: 'Львица рядом', x: 'Львица подошла к джипу почти вплотную. Идеальный кадр.', c: [
    { t: '📸 Снять крупным планом', f: () => { if (chance(0.75)) { S.followers += rnd(10000, 200000); return 'Фото облетело весь интернет! Вас называют фотографом года.'; } eff({ health: -20 }); return 'Львица не оценила вспышку. Вас спас рейнджер, но шрам останется.'; } },
    { t: '🤫 Замереть', f: () => 'Львица посмотрела вам в глаза и ушла. Вы этого никогда не забудете.' }] },
  { k: 'any', e: '💒', t: 'Местная свадьба', x: 'Вас случайно позвали на местную свадьбу. Танцы, музыка, сотня гостей.', c: [
    { t: '💃 Танцевать до утра', f: () => { eff({ happy: 10, health: -2 }); const f = makePerson('friend', { age: S.age + rnd(-6, 6), close: 60 }); S.people.push(f); return `Лучшая ночь поездки! Новый друг: ${f.name}.`; } },
    { t: '🙏 Вежливо уйти', f: () => 'Вы поздравили молодых и ушли спать.' }] },
  { k: 'any', e: '🏮', t: 'Ночной рынок', x: 'Торговец предлагает редкую вещицу, но цена кусается.', c: [
    { t: '🗣️ Торговаться', f: () => { if (chance(0.5 + S.stats.smarts / 300)) { S.souv = S.souv || []; S.souv.push('🏮 Редкий фонарик · 🌏'); return 'Вы сбили цену втрое! Редкий фонарик теперь ваш.'; } return 'Торговец обиделся и закрыл лавку.'; } },
    { t: '🍜 Просто поесть', f: () => { eff({ happy: 5 }); return 'Уличная еда оказалась лучшей в жизни.'; } }] },
  { k: 'any', e: '🧭', t: 'Не тот поворот', x: 'Вы заблудились в незнакомом районе. Темнеет, телефон сел.', c: [
    { t: '🗣️ Спросить местных', f: () => { eff({ smarts: 2, happy: 3 }); return 'Местная бабушка проводила вас до отеля и накормила ужином.'; } },
    { t: '🧭 Ориентироваться по звёздам', f: () => { if (chance(0.5)) { eff({ happy: 6 }); return 'Вы вышли к отелю и чувствуете себя настоящим путешественником.'; } eff({ health: -3 }); return 'Вы бродили до рассвета. Ноги гудят.'; } }] },
  { k: 'ski', e: '⛷️', t: 'Чёрная трасса', x: 'Друзья подбивают спуститься по самой сложной трассе.', c: [
    { t: '🔥 Поехать', f: () => { if (chance(0.6)) { eff({ happy: 12 }); return 'Адреналин зашкаливает! Вы спустились без падений.'; } eff({ health: -15 }); return 'Вы кувыркались метров сто. Гипс на месяц.'; } },
    { t: '🍷 Глинтвейн на террасе', f: () => { eff({ happy: 5 }); return 'Вы смотрели на падающих друзей с кружкой глинтвейна.'; } }] }
];
const _doTripDeep = doTrip;
doTrip = function (t, c, to) {
  const r = _doTripDeep(t, c, to);
  if (t.id !== 'space' && chance(0.45)) {
    const pool = QUESTS.filter((q) => q.k === 'any' || q.k === t.k);
    const q = pick(pool);
    const ch = q.c.map((x) => (x.cost ? { t: `💸 Купить (${fmt(price(x.cost))})`, disabled: S.money < price(x.cost), f: () => { S.money -= price(x.cost); S.quests = (S.quests || 0) + 1; if (S.quests >= 5) unlock('adventurer'); return x.f(); } } : { t: x.t, f: () => { S.quests = (S.quests || 0) + 1; if (S.quests >= 5) unlock('adventurer'); return x.f(); } }));
    setTimeout(() => { if (S && S.alive) { Q.push({ e: q.e, title: q.t, text: q.x, choices: ch }); pump(); } }, 60);
  }
  return r;
};

/* ---------- 7. Культура эпох и знаменитости ---------- */
const CULTURE = [
  { a: 1900, b: 1912, e: '🎞️', t: 'Синематограф', x: 'В город приехал синематограф! На простыне двигаются живые картинки.', go: 'Пойти на сеанс', c: 500 },
  { a: 1903, b: 1925, e: '🚗', t: 'Первый автомобиль', x: 'По вашей улице впервые проехал автомобиль. Лошади в панике, дети в восторге.', go: 'Побежать следом' },
  { a: 1922, b: 1932, e: '💃', t: 'Чарльстон', x: 'Вся молодёжь сходит с ума по новому танцу — чарльстону.', go: 'Выучить танец', min: 12 },
  { a: 1922, b: 1940, e: '📻', t: 'Радио', x: 'У соседей появилось радио. Весь подъезд собирается послушать концерт.', go: 'Слушать вместе' },
  { a: 1928, b: 1940, e: '🐭', t: 'Звуковые мультфильмы', x: 'В кинотеатрах показывают первые звуковые мультфильмы.', go: 'Сходить в кино', c: 1000 },
  { a: 1935, b: 1950, e: '🎲', t: 'Настольная игра «Монополия»', x: 'Новая игра про недвижимость ссорит целые семьи.', go: 'Сыграть с семьёй', item: { n: 'Первое издание настольной игры', v: 2000, g: 1.08 } },
  { a: 1936, b: 1950, e: '🎺', t: 'Эра свинга', x: 'Биг-бенды играют свинг, танцплощадки забиты.', go: 'На танцы!', min: 14 },
  { a: 1950, b: 1965, e: '📺', t: 'Телевизор', x: 'В доме появился телевизор! Вечером вся улица приходит смотреть передачи.', go: 'Смотреть всем двором' },
  { a: 1954, b: 1965, e: '🎸', t: 'Рок-н-ролл', x: 'По радио крутят рок-н-ролл. Взрослые в ужасе, молодёжь в восторге.', go: 'Танцевать твист', min: 12 },
  { a: 1959, b: 1975, e: '👧', t: 'Модная кукла', x: 'Появилась модная кукла-манекенщица. Все девочки мечтают о ней.', go: 'Купить и не открывать коробку', c: 3000, item: { n: 'Кукла 1959 года в коробке', v: 3000, g: 1.12 }, max: 40 },
  { a: 1963, b: 1970, e: '🎤', t: 'Битломания', x: 'Ливерпульская четвёрка взорвала мир. Пластинки сметают с прилавков.', go: 'Купить пластинку', c: 1500, item: { n: 'Виниловая пластинка 1960-х', v: 1500, g: 1.1 } },
  { a: 1966, b: 1975, e: '👗', t: 'Мини-юбки и клёш', x: 'Мода сошла с ума: мини-юбки, брюки-клёш и цветы в волосах.', go: 'Обновить гардероб', c: 5000, min: 14 },
  { a: 1975, b: 1982, e: '🪩', t: 'Диско', x: 'Зеркальный шар, блёстки и диско до утра.', go: 'На дискотеку', min: 14 },
  { a: 1977, b: 1985, e: '🌌', t: 'Космическая сага', x: 'Вышел фантастический фильм про далёкую галактику. Очереди в кинотеатры на квартал.', go: 'Купить фигурку героя', c: 1000, item: { n: 'Фигурка из космической саги 1977', v: 1000, g: 1.13 } },
  { a: 1980, b: 1988, e: '🧊', t: 'Кубик Рубика', x: 'Все пытаются собрать разноцветный кубик. Почти ни у кого не выходит.', go: 'Собрать кубик', smart: true },
  { a: 1980, b: 1990, e: '👾', t: 'Игровые автоматы', x: 'В парке поставили игровые автоматы. За монетку можно спасать мир.', go: 'Поставить рекорд', c: 300 },
  { a: 1984, b: 1995, e: '🧱', t: 'Падающие блоки', x: 'Гениальная игра с падающими фигурками покорила мир.', go: 'Играть до ночи', smart: true },
  { a: 1985, b: 1998, e: '📼', t: 'Видеомагнитофон', x: 'В видеосалоне крутят боевики. Переводчик гнусавит на все голоса.', go: 'Смотреть боевик', c: 500 },
  { a: 1996, b: 2001, e: '🥚', t: 'Электронный питомец', x: 'У всех на брелоке пищит электронный питомец, которого надо кормить.', go: 'Завести', c: 1200, max: 30, item: { n: 'Электронный питомец 1997 года', v: 1200, g: 1.09 } },
  { a: 1997, b: 2000, e: '🚢', t: 'Фильм про тонущий лайнер', x: 'Весь мир рыдает в кинотеатрах над историей любви на тонущем корабле.', go: 'Сходить в кино', c: 800 },
  { a: 1999, b: 2003, e: '🃏', t: 'Коллекционные карточки', x: 'Дети меняются карточками с карманными монстрами. Редкие стоят целое состояние.', go: 'Собрать редкую карточку', c: 800, item: { n: 'Голографическая карточка 1999', v: 800, g: 1.16 }, max: 25 },
  { a: 1998, b: 2005, e: '🖥️', t: 'Интернет-кафе', x: 'Открылось интернет-кафе. Час в сети — и вы на связи со всем миром.', go: 'Завести электронную почту', smart: true },
  { a: 2001, b: 2008, e: '🎧', t: 'Плеер на тысячу песен', x: 'Вся музыка мира теперь помещается в кармане.', go: 'Купить плеер', c: 15000 },
  { a: 2005, b: 2012, e: '▶️', t: 'Видеохостинги', x: 'Люди выкладывают видео в интернет, и их смотрят миллионы.', go: 'Снять своё видео', fol: true },
  { a: 2007, b: 2013, e: '📱', t: 'Смартфоны', x: 'Телефон без кнопок! Всё управляется пальцем.', go: 'Купить смартфон', c: 30000, item: { n: 'Смартфон первого поколения в коробке', v: 30000, g: 1.07 } },
  { a: 2016, b: 2018, e: '🗺️', t: 'Охота на монстров с телефоном', x: 'Люди бродят по городу с телефонами, ловя виртуальных монстров.', go: 'Ловить всех!', fit: true },
  { a: 2019, b: 2026, e: '🎵', t: 'Короткие видео', x: 'Все снимают пятнадцатисекундные танцы и залипают в ленту.', go: 'Снять тренд', fol: true },
  { a: 2023, b: 2032, e: '🤖', t: 'Нейросети', x: 'Нейросеть пишет стихи, рисует и отвечает на любые вопросы.', go: 'Освоить нейросети', smart: true },
  { a: 2030, b: 2045, e: '🥽', t: 'Виртуальные миры', x: 'Люди проводят вечера в общих виртуальных мирах.', go: 'Купить VR-шлем', c: 40000 },
  { a: 2040, b: 2060, e: '🪐', t: 'Марсианская мода', x: 'В моде всё марсианское: красные комбинезоны и «марсианский» сленг.', go: 'Влиться в тренд', c: 20000 },
  { a: 2050, b: 2080, e: '🧬', t: 'Генетические питомцы', x: 'В продаже светящиеся котики и мини-слоны.', go: 'Посмотреть в зоомагазине' }
];
const STARS = [
  { a: 1900, b: 1930, n: 'звезда немого кино' }, { a: 1925, b: 1960, n: 'знаменитый джазмен' }, { a: 1950, b: 1980, n: 'кумир рок-н-ролла' },
  { a: 1970, b: 1995, n: 'звезда эстрады' }, { a: 1990, b: 2015, n: 'голливудская звезда' }, { a: 2005, b: 2030, n: 'топовый блогер' },
  { a: 2025, b: 2080, n: 'виртуальная поп-звезда' }, { a: 1900, b: 2080, n: 'чемпион мира по футболу' }, { a: 1900, b: 2080, n: 'знаменитый писатель' }
];
EVENTS.push(
  { min: 5, max: 80, w: 7, cond: () => CULTURE.some((x) => S.year >= x.a && S.year <= x.b && !(S.cult || {})[x.t] && S.age >= (x.min || 5) && S.age <= (x.max || 90)), run: () => {
    const opts = CULTURE.filter((x) => S.year >= x.a && S.year <= x.b && !(S.cult || {})[x.t] && S.age >= (x.min || 5) && S.age <= (x.max || 90));
    const x = pick(opts); S.cult = S.cult || {}; S.cult[x.t] = S.year;
    const cost = x.c ? price(x.c) : 0;
    ev(x.e, x.t, x.x, [
      { t: `${x.go}${cost ? ` (${fmt(cost)})` : ''}`, disabled: cost && S.money < cost && S.age >= 16, f: () => {
        if (cost && S.age >= 16) S.money -= cost;
        eff({ happy: rnd(3, 8) });
        if (x.smart) eff({ smarts: rnd(1, 4) });
        if (x.fit) eff({ health: rnd(2, 5) });
        if (x.fol) S.followers += rnd(50, 5000);
        if (x.item) { S.collect = S.collect || []; S.collect.push({ n: x.item.n, e: x.e, y: S.year, v: price(x.item.v), g: x.item.g }); if (S.collect.length >= 5) unlock('collector2'); return `${x.e} Вы на волне эпохи! «${x.item.n}» теперь в вашей коллекции. Кто знает, сколько она будет стоить лет через тридцать…`; }
        S.cultN = (S.cultN || 0) + 1; if (S.cultN >= 8) unlock('zeitgeist');
        return `${x.e} Вы на волне эпохи! Об этом будете рассказывать внукам.`;
      } },
      { t: '🙄 Не моё', f: () => 'Вы пропустили модную волну. Потом ещё будете жалеть.' }
    ]);
  } },
  { min: 12, max: 80, w: 2, cond: () => STARS.some((x) => S.year >= x.a && S.year <= x.b), run: () => {
    const st = pick(STARS.filter((x) => S.year >= x.a && S.year <= x.b));
    ev('🌟', 'Встреча со звездой', `В кафе за соседним столиком сидит ${st.n}. Никто вокруг не узнал.`, [
      { t: '✍️ Попросить автограф', f: () => { S.collect = S.collect || []; S.collect.push({ n: `Автограф: ${st.n}`, e: '✍️', y: S.year, v: price(5000), g: 1.06 }); eff({ happy: 8 }); unlock('autograph'); return 'Звезда улыбнулась и расписалась на салфетке. Салфетка отправилась в коллекцию.'; } },
      { t: '☕ Заговорить по-человечески', f: () => { eff({ happy: 10 }); if (chance(0.25)) { const f = makePerson('friend', { age: S.age + rnd(-10, 10), close: 50 }); f.job = st.n; S.people.push(f); return `Вы проболтали два часа. Теперь у вас в друзьях настоящая знаменитость: ${f.name}!`; } return 'Вы поговорили о погоде и о жизни. Обычный человек, только очень уставший.'; } },
      { t: '🤳 Тайком сфотографировать', f: () => { S.followers += rnd(500, 20000); eff({ karma: -2 }); return 'Фото разлетелось по сети. Вам немного стыдно.'; } }
    ]);
  } }
);
YEAR_HOOKS.push(() => { for (const c of S.collect || []) c.v = Math.round(c.v * (c.g || 1.05) * (S.age > 0 ? 1 : 1)); });
const _netWorthDeep = netWorth;
netWorth = function () { return _netWorthDeep() + (S && S.collect ? S.collect.reduce((s, c) => s + (c.v || 0), 0) : 0); };
EXTRA_TITLES.collection = '🧸 Коллекция';
EXTRA_PANELS.collection = function () {
  const cl = S.collect || [];
  const total = cl.reduce((s, c) => s + c.v, 0);
  card(`<div class="muted">Вещи эпох</div><div class="big">${fmt(total)}</div><div class="muted">Модные вещи, автографы и сувениры со временем дорожают. Можно продать коллекционеру.</div>`);
  const l = section(`Коллекция · ${cl.length}`);
  if (!cl.length) l.appendChild(el('<div class="empty">Пока пусто. Ловите модные волны эпохи — вещи оттуда со временем станут раритетами.</div>'));
  cl.forEach((c, i) => item(l, { e: c.e, t: c.n, d: `с ${c.y} года · сейчас ${fmt(c.v)}`, r: 'Продать', onClick: act(() => { S.money += c.v; S.collect.splice(i, 1); sfx('coin'); if (c.v >= price(1000000)) unlock('raritet'); return `🧸 Коллекционер купил «${c.n}» за ${fmt(c.v)}.`; }) }));
};
MENU_HOOKS.push((l) => item(l, { e: '🧸', t: 'Коллекция', d: `${(S.collect || []).length} вещей эпох`, onClick: () => openPanel('collection') }));

/* ---------- 8. Режим «Железная жизнь» ---------- */
(function () {
  const m = document.getElementById('inMode');
  if (m && !m.querySelector('option[value="iron"]')) m.appendChild(el('<option value="iron">☠️ Железная жизнь</option>'));
})();
const IRON_KEY = 'lifesim_iron_v1';
const ironRecs = () => { try { return JSON.parse(localStorage.getItem(IRON_KEY)) || []; } catch (e) { return []; } };
const _newLifeIron = newLife;
newLife = function (opts = {}) {
  const mEl = document.getElementById('inMode');
  const iron = !opts.generation && !opts.dmode && !opts.daily && mEl && mEl.value === 'iron';
  if (iron) {
    const c = pick(COUNTRIES);
    opts = { ...opts, country: c.id, year: rnd(1900, 2040), first: undefined, surname: undefined, gender: undefined, orient: undefined, religion: undefined, diff: 'hard' };
  }
  const r = _newLifeIron(opts);
  if (iron) { S.iron = true; S.diff = 'hard'; log('☠️ Железная жизнь: случайная страна и год, бедность, одна попытка. Смерть окончательна.', 'bad'); save(); }
  return r;
};
const _lifeScoreIron = lifeScore;
lifeScore = function () { const s = _lifeScoreIron(); return S && S.iron ? Math.round(s * 1.25) : s; };
DEATH_HOOKS.push(() => {
  if (!S.iron || S.ironSaved) return;
  S.ironSaved = 1;
  const all = ironRecs(); all.push({ n: `${S.first} ${S.surname}`, f: C().flag, y1: S.birthYear, y2: S.year, age: S.age, sc: lifeScore(), g: grade(lifeScore()) });
  all.sort((a, b) => b.sc - a.sc);
  try { localStorage.setItem(IRON_KEY, JSON.stringify(all.slice(0, 30))); } catch (e) {}
  if (S.age >= 80) unlock('ironman');
});
const _showDeathIron = showDeath;
showDeath = function () {
  _showDeathIron();
  if (!S || !S.iron) return;
  for (const b of document.querySelectorAll('#modalActions button')) if (/Продолжить за|Найти дальнего/.test(b.textContent)) b.remove();
  const T = document.getElementById('modalText') || document.querySelector('#modalBody');
  const best = ironRecs()[0];
  if (T) T.appendChild(el(`<div class="death-extra"><div>☠️ Железная жизнь окончена. Лучший результат: ${best ? `${esc(best.n)} · ${best.sc}` : '—'}</div></div>`));
};
EXTRA_TITLES.ironrec = '☠️ Железные жизни';
EXTRA_PANELS.ironrec = function () {
  const all = ironRecs();
  const l = section(`Рекорды · ${all.length}`);
  if (!all.length) l.appendChild(el('<div class="empty">Выберите режим «☠️ Железная жизнь» на стартовом экране: случайный старт, бедность и никаких наследников.</div>'));
  all.forEach((r, i) => item(l, { e: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '☠️', t: `${r.f} ${r.n}`, d: `${r.y1}–${r.y2} · ${yrs(r.age)}`, r: `${r.g} · ${r.sc}` }));
};
MENU_HOOKS.push((l) => item(l, { e: '☠️', t: 'Железные жизни', d: S.iron ? 'Вы в железном режиме' : 'Рекорды хардкор-режима', onClick: () => openPanel('ironrec') }));

/* ---------- 9. Сценарии старта ---------- */
const SCENARIOS = [
  { id: 'orphan', e: '🧺', t: 'Сирота 1920-х', d: 'Детский дом, голод и надежда', year: 1921, c: ['ru', 'ua', 'by'] },
  { id: 'heir', e: '🎩', t: 'Наследник миллиардера', d: 'Золотая ложка и огромные ожидания', c: ['us', 'gb', 'ch', 'ae', 'jp', 'de'] },
  { id: 'refugee', e: '🧳', t: 'Беженец', d: 'Детство в стране, где идёт война' },
  { id: 'star', e: '🎬', t: 'Ребёнок-звезда', d: 'Слава с пелёнок', c: ['us', 'gb', 'fr', 'in', 'kr', 'jp'] },
  { id: 'prodigy', e: '🧠', t: 'Вундеркинд', d: 'Гениальный ум, но трудно с людьми' },
  { id: 'immigrant', e: '🗽', t: 'Эмигрант в Америку', d: 'Пароход, остров Эллис и новая жизнь', year: 1902, c: ['it', 'ie', 'pl', 'de', 'gr'] },
  { id: 'farm', e: '🚜', t: 'Деревенский ребёнок', d: 'Ферма, свежий воздух и тяжёлый труд' },
  { id: 'twins', e: '👯', t: 'Близнец', d: 'У вас есть брат или сестра-близнец' },
  { id: 'lottery', e: '🎰', t: 'Семья лотерейщиков', d: 'Родители выиграют джекпот, когда вам будет 10' }
];
(function () {
  const form = document.getElementById('startForm'); if (!form) return;
  const lab = el(`<label>Сценарий<select id="inScen"><option value="">Без сценария</option>${SCENARIOS.map((s) => `<option value="${s.id}">${s.e} ${s.t}</option>`).join('')}</select></label>`);
  form.insertBefore(lab, form.querySelector('button[type=submit]'));
})();
const _newLifeScen = newLife;
newLife = function (opts = {}) {
  const sel = document.getElementById('inScen');
  const sc = !opts.generation && !opts.dmode && !opts.daily && sel && sel.value ? SCENARIOS.find((x) => x.id === sel.value) : null;
  if (sc && !(document.getElementById('inMode') || {}).value?.startsWith('iron')) {
    opts = { ...opts };
    if (sc.year) opts.year = sc.year;
    if (sc.c) opts.country = pick(sc.c);
    if (sc.id === 'refugee') { const w = pick(WARS.filter((x) => x.a >= 1905 && x.ids.some((id) => COUNTRIES.some((c) => c.id === id)))); opts.year = w.a - 1; opts.country = w.ids.find((id) => COUNTRIES.some((c) => c.id === id)); }
  }
  const r = _newLifeScen(opts);
  if (!sc || S.iron) return r;
  S.scenario = sc.id;
  const par = S.people.filter((p) => p.role === 'mother' || p.role === 'father');
  if (sc.id === 'orphan') { for (const p of par) { p.alive = false; p.deathAge = p.age; } S.stats.happy = Math.min(S.stats.happy, 45); S.stats.health = Math.min(S.stats.health, 70); log('🧺 Сценарий: вы остались сиротой. Детский дом стал вашим первым домом.', 'bad'); }
  if (sc.id === 'heir') { for (const p of par) { p.money = price(5e8); p.job = 'Предприниматель'; } S.trust = true; S.stats.looks = Math.max(S.stats.looks, 70); log('🎩 Сценарий: вы родились в семье миллиардеров. В 18 лет откроется трастовый фонд.', 'good'); }
  if (sc.id === 'refugee') { S.refugee = true; log('🧳 Сценарий: вы родились в стране, где вот-вот начнётся война.', 'bad'); }
  if (sc.id === 'star') { S.followers = 5000; S.fame = Math.max(S.fame || 0, 20); S.stats.looks = Math.max(S.stats.looks, 80); log('🎬 Сценарий: вас уже снимают в рекламе подгузников. Камера любит вас.', 'good'); }
  if (sc.id === 'prodigy') { S.stats.smarts = 100; S.stats.happy = Math.min(S.stats.happy, 60); addTrait('curious', true); log('🧠 Сценарий: вы заговорили в полгода и читаете в два. Врачи разводят руками.', 'good'); }
  if (sc.id === 'immigrant') { S.immigrant = true; for (const p of par) p.money = Math.min(p.money || 0, price(100000)); log('🗽 Сценарий: семья копит на билеты в Америку.', 'info'); }
  if (sc.id === 'farm') { S.farm = true; S.stats.health = Math.max(S.stats.health, 85); addTrait('athletic', true); log('🚜 Сценарий: вы родились на ферме. Петухи вместо будильника.', 'info'); }
  if (sc.id === 'twins') { const g = chance(0.5) ? S.gender : npcGender(); const tw = makePerson('sibling', { gender: g === 'nb' ? npcGender() : g, age: 0, pool: C().names, surname: S.surname, close: 95, looks: S.stats.looks, smarts: clamp(S.stats.smarts + rnd(-15, 15)) }); tw.twin = true; S.people.push(tw); log(`👯 Сценарий: у вас есть близнец — ${tw.name}.`, 'good'); }
  if (sc.id === 'lottery') { S.lotteryFam = true; log('🎰 Сценарий: родители каждую неделю покупают лотерейный билет. Говорят, однажды повезёт.', 'info'); }
  unlock('scenario');
  save();
  return r;
};
YEAR_HOOKS.push(() => {
  if (S.trust && S.age === 18) { const g = price(5e7); S.money += g; log(`🎩 Открылся трастовый фонд: ${fmt(g)}. Теперь всё зависит от вас.`, 'good'); delete S.trust; }
  if (S.refugee && S.age === 3) {
    const safe = COUNTRIES.filter((c) => c.wage >= 1 && c.id !== S.country && !WARS.some((w) => w.ids.includes(c.id) && S.year >= w.a && S.year <= w.b));
    const to = pick(safe.length ? safe : COUNTRIES); S.country = to.id; S.city = pick(to.cities); if (!S.visited.includes(to.id)) S.visited.push(to.id);
    log(`🧳 Семья бежала от войны. Новая родина: ${to.flag} ${to.name}, город ${S.city}. Всё имущество — два чемодана.`, 'bad'); delete S.refugee; eff({ happy: -10 });
  }
  if (S.immigrant && S.age === 5) {
    const us = COUNTRIES.find((c) => c.id === 'us'); S.country = 'us'; S.city = 'Нью-Йорк'; if (!S.visited.includes('us')) S.visited.push('us');
    log(`🗽 Две недели в трюме парохода, остров Эллис и статуя Свободы в тумане. Вы в Америке! ${us ? us.flag : ''}`, 'good'); delete S.immigrant; eff({ happy: 8 });
  }
  if (S.farm && S.age >= 6 && S.age <= 16 && chance(0.25)) { eff({ health: 2, smarts: -1 }); log(pick(['🐄 Утром доили корову, потом бегом в школу.', '🌾 Всё лето помогали на сенокосе.', '🐣 Вы выходили слабого цыплёнка.']), 'info'); }
  if (S.farm && S.age === 30 && chance(0.7)) { const v = price(3000000); S.assets.push({ uid: uid(), type: 'house', id: 'farm', e: '🚜', name: 'Семейная ферма', value: v, price: 0 }); log(`🚜 Родители передали вам семейную ферму. Стоимость: ${fmt(v)}.`, 'good'); delete S.farm; }
  if (S.lotteryFam && S.age === 10) { const g = price(rnd(2, 8) * 1e7); for (const p of S.people.filter((x) => (x.role === 'mother' || x.role === 'father') && x.alive)) p.money = (p.money || 0) + g / 2; log(`🎰 ДЖЕКПОТ! Родители выиграли ${fmt(g)}. Жизнь семьи перевернулась.`, 'good'); delete S.lotteryFam; eff({ happy: 15 }); }
  if (S.scenario === 'star' && S.age >= 3 && S.age <= 15 && chance(0.3)) { S.followers += rnd(1000, 50000); const g = price(rnd(50000, 400000)); S.money += g; log(`🎬 Съёмки в ${pick(['рекламе', 'сериале', 'кино', 'клипе'])}: гонорар ${fmt(g)}.`, 'good'); }
  if (S.scenario === 'prodigy' && S.age >= 8 && S.age <= 14 && chance(0.25)) { eff({ happy: -3 }); log(pick(['🧠 Одноклассники считают вас странным. Зато вы решили задачу для 11 класса.', '🧠 Вас показали по телевизору как самого юного шахматного гения.', '🧠 Учителя не знают, чему вас ещё учить.']), 'info'); }
});

/* ---------- 10. Витрина трофеев и секретные достижения ---------- */
const TROPHY_KEY = 'lifesim_trophies_v1';
const TROPHY_IDS = ['olympgold', 'worldchamp', 'nobel', 'president', 'billion', 'old100', 'astronaut', 'godfather', 'legend', 'masterpiece', 'award', 'unicorn', 'ironman', 'dsc', 'treasure', 'summit', 'pennygold', 'immortal', 'triple', 'raritet', 'ivy', 'hero_fire'];
const trophies = () => { try { return JSON.parse(localStorage.getItem(TROPHY_KEY)) || []; } catch (e) { return []; } };
const _unlockDeep = unlock;
unlock = function (id) {
  const had = S && S.ach && S.ach[id] != null;
  _unlockDeep(id);
  if (!had && S && TROPHY_IDS.includes(id)) {
    const a = ACHIEVEMENTS.find((x) => x.id === id); if (!a) return;
    const all = trophies(); all.push({ id, e: a.e, t: a.t, who: `${S.first} ${S.surname}`, f: C().flag, y: S.year, age: S.age });
    try { localStorage.setItem(TROPHY_KEY, JSON.stringify(all.slice(-200))); } catch (e) {}
  }
};
ACHIEVEMENTS.push(
  { id: 'echoes', e: '⏳', t: 'Эхо прошлого', d: 'Пережить 5 последствий старых решений' },
  { id: 'pennygold', e: '📃', t: 'Акции из гаража', d: 'Разбогатеть на копеечных акциях' },
  { id: 'dreamer', e: '🎸', t: 'Мечтатель', d: 'Бросить учёбу ради мечты и победить' },
  { id: 'complex', e: '🧩', t: 'Сложная натура', d: 'Четыре черты характера одновременно' },
  { id: 'hero_fire', e: '🔥', t: 'Герой подъезда', d: 'Вынести человека из огня' },
  { id: 'ivy', e: '🏛️', t: 'Элита', d: 'Поступить в топ-вуз мира' },
  { id: 'intern3', e: '💼', t: 'Вечный стажёр', d: 'Пройти три стажировки' },
  { id: 'dsc', e: '📜', t: 'Доктор наук', d: 'Защитить докторскую' },
  { id: 'unicorn', e: '🦄', t: 'Единорог', d: 'Стартап дороже миллиарда долларов' },
  { id: 'treasure', e: '🏴‍☠️', t: 'Кладоискатель', d: 'Найти сокровище по карте' },
  { id: 'summit', e: '🏔️', t: 'Над облаками', d: 'Покорить вершину в метель' },
  { id: 'adventurer', e: '🧭', t: 'Искатель приключений', d: 'Пройти 5 дорожных приключений' },
  { id: 'zeitgeist', e: '🌊', t: 'Дух времени', d: 'Поймать 8 модных волн эпохи' },
  { id: 'collector2', e: '🧸', t: 'Хранитель эпох', d: 'Собрать 5 вещей эпох' },
  { id: 'raritet', e: '💎', t: 'Раритет', d: 'Продать вещь эпохи за миллион' },
  { id: 'autograph', e: '✍️', t: 'Автограф', d: 'Получить автограф знаменитости' },
  { id: 'ironman', e: '☠️', t: 'Железный человек', d: 'Дожить до 80 в железной жизни' },
  { id: 'scenario', e: '📜', t: 'По сценарию', d: 'Начать жизнь со сценария' },
  { id: 'immortal', e: '🧛', t: 'Бессмертный', d: '???', secret: true, sd: 'Дожить до 110 лет' },
  { id: 'nomad', e: '🐫', t: 'Кочевник', d: '???', secret: true, sd: 'Пожить в 5 разных странах' },
  { id: 'redeemed', e: '😇', t: 'Искупление', d: '???', secret: true, sd: 'Поднять карму со дна до 90+' },
  { id: 'lateparent', e: '👴', t: 'Поздний родитель', d: '???', secret: true, sd: 'Стать родителем после 55' },
  { id: 'broke_rich', e: '🎢', t: 'Американские горки', d: '???', secret: true, sd: 'Быть миллионером и уйти в долги' },
  { id: 'triple', e: '👑', t: 'Тройная корона', d: '???', secret: true, sd: 'Олимпийское золото, Нобелевка или президентство — любые два в одной жизни' },
  { id: 'catlady', e: '🐈', t: 'Кошачья душа', d: '???', secret: true, sd: 'Четыре кошки одновременно' },
  { id: 'hermit', e: '🏚️', t: 'Отшельник', d: '???', secret: true, sd: 'Дожить до 70 без друзей и партнёра' }
);
YEAR_HOOKS.push(() => {
  if (S.age >= 110) unlock('immortal');
  S.lived = S.lived || [S.birthCountry || S.country]; if (!S.lived.includes(S.country)) S.lived.push(S.country);
  if (S.lived.length >= 5) unlock('nomad');
  if (S.karma <= 5) S.wasBad = 1; if (S.wasBad && S.karma >= 90) unlock('redeemed');
  if (S.age >= 55 && S.people.some((p) => p.role === 'child' && p.age === 0)) unlock('lateparent');
  if (netWorth() >= 1e6) S.wasRich = 1; if (S.wasRich && S.money <= -price(1000000)) unlock('broke_rich');
  const big = ['olympgold', 'nobel', 'president'].filter((id) => S.ach[id] != null).length; if (big >= 2) unlock('triple');
  if (S.pets.filter((p) => p.alive && /кот|кош/i.test(p.type || p.kind || p.name || '')).length >= 4) unlock('catlady');
  if (S.age >= 70 && !S.people.some((p) => p.alive && ['friend', 'partner', 'spouse'].includes(p.role))) unlock('hermit');
});
const _panelAchDeep = panelAch;
panelAch = function () {
  _panelAchDeep();
  const B = document.getElementById('sheetBody');
  for (const a of ACHIEVEMENTS.filter((x) => x.secret)) {
    const got = globalAch[a.id];
    for (const n of B.querySelectorAll('.item')) { const t = n.querySelector('.t, b, .title'); if (t && t.textContent.trim() === a.t) { if (!got) { t.textContent = '??? Секретное'; const d = n.querySelector('.d, small, .desc'); if (d) d.textContent = 'Условие откроется, когда вы его выполните'; } else { const d = n.querySelector('.d, small, .desc'); if (d) d.textContent = a.sd; } } }
  }
};
EXTRA_TITLES.trophies = '🏆 Витрина трофеев';
EXTRA_PANELS.trophies = function () {
  const all = trophies();
  card(`<div class="muted">Трофеи всех ваших жизней</div><div class="big">${all.length}</div><div class="muted">Сюда попадают главные победы: медали, премии, рекорды и легендарные поступки.</div>`);
  if (!all.length) { card('<div class="empty">Витрина пуста. Выиграйте Олимпиаду, Нобелевку или доживите до 100 лет.</div>'); return; }
  const g = el('<div class="trophy-grid"></div>');
  for (const t of all.slice().reverse()) {
    const n = el(`<button class="trophy"><span class="tr-e">${t.e}</span><b>${esc(t.t)}</b><small>${t.f || ''} ${esc(t.who)} · ${t.y}</small></button>`);
    n.onclick = () => toast(`${t.e} ${t.t}: ${t.who}, ${yrs(t.age)}, ${t.y}`);
    g.appendChild(n);
  }
  document.getElementById('sheetBody').appendChild(g);
};
MENU_HOOKS.unshift((l) => item(l, { e: '🏆', t: 'Витрина трофеев', d: `${trophies().length} трофеев за все жизни`, onClick: () => openPanel('trophies') }));

/* ---------- 11. Интерактивное древо династии ---------- */
EXTRA_PANELS.tree = function () {
  const B = document.getElementById('sheetBody');
  const lin = S.lineage || [];
  card(`<div class="muted">Древо рода ${esc(S.surnameBase || S.surname)}</div><div class="big">${lin.length + 1} ${plural(lin.length + 1, ['поколение', 'поколения', 'поколений'])}</div><div class="muted">Нажмите на человека, чтобы узнать его историю.</div>`);
  const T = el('<div class="ftree"></div>');
  const info = (o) => () => showModal({ e: o.e, title: o.name, html: `<div class="muted">${esc(o.sub || '')}</div>${(o.lines || []).map((x) => `<div>${x}</div>`).join('')}`, choices: [{ t: 'Закрыть', f: () => null }] });
  const node = (o, cls = '') => { const n = el(`<button class="fnode ${cls}"><span class="fe">${o.e}</span><b>${esc(o.name)}</b><small>${esc(o.sub || '')}</small></button>`); n.onclick = info(o); return n; };
  const row = (nodes, cls = '') => { const r = el(`<div class="frow ${cls}"></div>`); for (const n of nodes) r.appendChild(n); T.appendChild(r); };
  for (const a of lin) {
    row([node({ e: a.gender === 'f' ? '👩' : '👨', name: a.name, sub: `${a.flag || ''} ${a.y1}–${a.y2}`, lines: [`Поколение ${a.gen}`, `Прожил${a.gender === 'f' ? 'а' : ''} ${yrs(a.age)}`, a.job ? `Профессия: ${esc(a.job)}` : '', `Капитал: ${fmt(a.net || 0)}`, a.cause ? `Причина смерти: ${esc(a.cause)}` : ''].filter(Boolean) }, 'anc')], 'gen');
    T.appendChild(el('<div class="fline"></div>'));
  }
  const par = S.people.filter((p) => p.role === 'mother' || p.role === 'father');
  if (!lin.length && par.length) { row(par.map((p) => node({ e: p.alive ? personEmoji(p) : '🕯️', name: p.name, sub: `${roleName(p)}${p.alive ? ` · ${yrs(p.age)}` : ''}`, lines: [p.job ? `Профессия: ${esc(p.job)}` : '', `Отношения: ${p.close || 0}%`].filter(Boolean) }))); T.appendChild(el('<div class="fline"></div>')); }
  const sibs = S.people.filter((p) => p.role === 'sibling');
  const me = node({ e: avatar(), name: `${S.first} ${S.surname}`, sub: `${C().flag} ${S.birthYear}–${S.alive ? 'н.в.' : S.year} · это вы`, lines: [`Возраст: ${yrs(S.age)}`, `Капитал: ${fmt(netWorth())}`, (S.traits || []).length ? `Характер: ${(S.traits || []).map((id) => (TRAITS.find((x) => x.id === id) || {}).t).join(', ')}` : ''].filter(Boolean) }, 'me');
  const partner = S.people.find((p) => p.alive && ['spouse', 'partner'].includes(p.role));
  row([...sibs.slice(0, 2).map((p) => node({ e: p.alive ? personEmoji(p) : '🕯️', name: p.name, sub: p.twin ? 'близнец' : roleName(p), lines: [`Возраст: ${yrs(p.age)}`] }, 'side')), me, ...(partner ? [node({ e: '💞', name: partner.name, sub: roleName(partner), lines: [`Возраст: ${yrs(partner.age)}`, `Отношения: ${partner.close || 0}%`] }, 'side')] : [])]);
  const kids = S.people.filter((p) => p.role === 'child');
  if (kids.length) {
    T.appendChild(el('<div class="fline"></div>'));
    row(kids.map((k) => node({ e: k.alive ? personEmoji(k) : '🕯️', name: k.name, sub: `${k.alive ? yrs(k.age) : 'умер'}${k.grandkids ? ` · внуков: ${k.grandkids}` : ''}`, lines: [`Отношения: ${k.close || 0}%`, k.job ? `Профессия: ${esc(k.job)}` : ''].filter(Boolean) }, 'kid')), 'kids');
    const gk = S.people.filter((p) => p.role === 'grandchild');
    if (gk.length) { T.appendChild(el('<div class="fline"></div>')); row(gk.slice(0, 12).map((k) => node({ e: k.alive ? personEmoji(k) : '🕯️', name: k.name, sub: `внук · ${yrs(k.age)}`, lines: [k.parentName ? `Родитель: ${esc(k.parentName)}` : ''].filter(Boolean) }, 'kid')), 'kids'); }
  } else T.appendChild(el('<div class="empty">Детей пока нет. Династия продолжится, только если появится наследник.</div>'));
  B.appendChild(T);
  setTimeout(() => { const m = T.querySelector('.me'); if (m) m.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 50);
};

/* ---------- 12. Звуки событий и живой аватар ---------- */
if (typeof TUNES !== 'undefined') Object.assign(TUNES, {
  event: [[587, .05], [740, .07]], birthday: [[392, .12], [392, .08], [440, .2], [392, .2], [523, .2], [494, .35]],
  goodyear: [[523, .06], [659, .06], [784, .12]], badyear: [[349, .1], [294, .18]], money: [[1047, .04], [1319, .04], [1568, .1]]
});
const _showModalDeep = showModal;
showModal = function (m) { const r = _showModalDeep(m); if (m && m.title !== 'Покойтесь с миром' && m.e !== '🪦') sfx('event'); return r; };
const _ageUpDeep = ageUp;
ageUp = function () {
  const before = S && S.log ? S.log.length : 0; const wasAlive = S && S.alive;
  _ageUpDeep();
  if (!S || !wasAlive || !S.alive || S.log.length === before) return;
  const items = S.log[S.log.length - 1].items; const g = items.filter((x) => x.c === 'good').length; const b = items.filter((x) => x.c === 'bad').length;
  setTimeout(() => { if (!S) return; if (S.age > 0 && S.age % 10 === 0) sfx('birthday'); else if (g - b >= 2) sfx('goodyear'); else if (b - g >= 2) sfx('badyear'); }, 220);
  const av = document.getElementById('avatar'); if (av) { av.classList.remove('aged'); void av.offsetWidth; av.classList.add('aged'); }
};
if (typeof portraitSVG === 'function') {
  const _portraitDeep = portraitSVG;
  portraitSVG = function (look, age, mood, gender) {
    let s = _portraitDeep(look, age, mood, gender);
    let extra = '';
    if (age >= 70) extra += '<g fill="#8a5a3a" opacity=".22"><circle cx="35" cy="34" r="1.6"/><circle cx="64" cy="31" r="1.3"/><circle cx="60" cy="58" r="1.2"/></g>';
    if (age >= 80) extra += '<path d="M33 30 q8 -3 16 0 M51 30 q8 -3 16 0" stroke="#9b7b66" stroke-width="1" fill="none" opacity=".45"/>';
    if (age >= 78) extra += '<g><rect x="82" y="58" width="3.2" height="42" rx="1.5" fill="#6b4226"/><path d="M83.6 58 q0 -7 7 -7" stroke="#6b4226" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>';
    if (age < 2) extra += '<g><circle cx="50" cy="62" r="5" fill="#8ad0ff" stroke="#4aa8e6" stroke-width="1.2"/><rect x="47.5" y="59.5" width="5" height="5" rx="2" fill="#fff" opacity=".8"/></g>';
    const hat = S && S.alive && age > 0 && age % 10 === 0 && look === S.look;
    if (hat) extra += '<g><path d="M40 16 L50 -4 L60 16 Z" fill="#ff5a8a" stroke="#fff" stroke-width="1.2"/><circle cx="50" cy="-4" r="3" fill="#ffd34d"/><circle cx="45" cy="9" r="1.6" fill="#fff"/><circle cx="54" cy="5" r="1.6" fill="#fff"/></g>';
    if (extra) s = s.replace('</svg>', `${extra}</svg>`).replace('viewBox="0 0 100 100"', hat ? 'viewBox="0 -8 100 108"' : 'viewBox="0 0 100 100"');
    return s;
  };
}
