/* ===================== Подсказки для новичка: первые жизни ===================== */
// Небольшой пузырь над кнопкой «Прожить год». Каждая подсказка показывается один раз;
// «Больше не показывать» выключает все. Ход игры не меняет (не очередь событий, не лог).
const COACH_KEY = 'lifesim_coach_v1';
const COACH_TIPS = [
  { id: 'start', when: () => S.age === 0, ru: '👇 Нажимайте круглую кнопку «+1 год» внизу: так идёт жизнь. События с выбором появятся сами.', en: '👇 Tap the round “+1 year” button below to move through life. Events with choices will pop up on their own.', uk: '👇 Натискайте круглу кнопку «+1 рік» унизу: так плине життя. Події з вибором з’являться самі.' },
  { id: 'menu', when: () => S.age >= 3, ru: '🎯 Кнопки внизу («Занятия», «Люди», «Деньги», «Работа») и меню ☰ открывают все действия. Каждый год можно что-то сделать.', en: '🎯 The buttons below (Activities, People, Money, Work) and the ☰ menu open every action. You can do something every year.', uk: '🎯 Кнопки внизу («Заняття», «Люди», «Гроші», «Робота») і меню ☰ відкривають усі дії. Щороку можна щось зробити.' },
  { id: 'school', when: () => S.age >= 7 && S.edu && S.edu.stage, ru: '📖 Школа началась. «Учиться усерднее» в «Занятиях» поднимает оценки, а от них зависит поступление.', en: '📖 School has started. “Study harder” in Activities raises your grades, and grades decide university.', uk: '📖 Почалася школа. «Вчитися старанніше» в «Заняттях» підвищує оцінки, а від них залежить вступ.' },
  { id: 'map', when: () => S.age >= 12, ru: '🌍 Кнопка с глобусом открывает карту вашего года: границы меняются вместе с историей.', en: '🌍 The globe button opens a map of your year: borders change with history.', uk: '🌍 Кнопка з глобусом відкриває мапу вашого року: кордони змінюються разом з історією.' },
  { id: 'work', when: () => S.age >= 18, ru: '💼 Вы взрослый. Работу ищите в «Работе», а деньги видно вверху экрана.', en: '💼 You are an adult. Find a job under Work; your money is shown at the top.', uk: '💼 Ви дорослі. Роботу шукайте в «Роботі», а гроші видно вгорі екрана.' },
  { id: 'death', when: () => !S.alive, ru: '🏁 Жизнь окончена. Результат можно отправить в мировую таблицу или продолжить за своего ребёнка.', en: '🏁 Your life is over. Send the result to the world table or continue as your child.', uk: '🏁 Життя скінчилося. Результат можна надіслати до світової таблиці або продовжити за свою дитину.' },
];
function coachState() { try { return JSON.parse(localStorage.getItem(COACH_KEY)) || {}; } catch (e) { return {}; } }
function coachSave(s) { try { localStorage.setItem(COACH_KEY, JSON.stringify(s)); } catch (e) {} }
function coachText(t) { return typeof sceneText === 'function' ? sceneText(t.ru, t.en, t.uk) : t.ru; }
function coachHide() { const b = document.getElementById('coach'); if (b && b.remove) b.remove(); }
function coachShow(t) {
  coachHide();
  const host = document.getElementById('game'); if (!host || typeof host.querySelector !== 'function' || typeof el !== 'function') return;
  const off = sceneText('Больше не показывать', 'Don’t show tips', 'Більше не показувати');
  const b = el(`<div id="coach" class="coach" role="status"><span class="coach-t">${esc(coachText(t))}</span><span class="coach-a"><button type="button" class="coach-ok">OK</button><button type="button" class="coach-off">${esc(off)}</button></span></div>`);
  b.querySelector('.coach-ok').onclick = coachHide;
  b.querySelector('.coach-off').onclick = () => { const s = coachState(); s.off = true; coachSave(s); coachHide(); };
  host.appendChild(b);
}
function coachCheck() {
  if (typeof S === 'undefined' || !S) return;
  const s = coachState(); if (s.off) return;
  const m = document.getElementById('modalWrap'), sh = document.getElementById('sheetWrap');
  if ((m && !m.hidden) || (sh && !sh.hidden) || (Q && Q.length)) { clearTimeout(coachCheck.t); coachCheck.t = setTimeout(coachCheck, 1500); return; }
  const t = COACH_TIPS.find((x) => !s[x.id] && x.when()); if (!t) return;
  s[t.id] = 1; coachSave(s); coachShow(t);
}
YEAR_HOOKS.push(coachCheck);
DEATH_HOOKS.push(() => setTimeout(coachCheck, 400));
const _newLifeCoach = newLife;
newLife = function (opts) { const r = _newLifeCoach.apply(this, arguments); coachHide(); setTimeout(coachCheck, 600); return r; };
