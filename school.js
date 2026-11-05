/* ===================== 📚 Школьная программа: предметы по классу, стране и эпохе ===================== */
// Загружается после life.js. Массив SUBJ (из life.js) переписывается на месте под текущий класс.

const SCH_SOV = ['ru', 'ua', 'by', 'kz', 'ge', 'am', 'az', 'uz', 'kg', 'tj', 'tm', 'lt', 'lv', 'ee', 'md'];
const SCH_EAST = ['pl', 'cz', 'sk', 'hu', 'bg', 'ro', 'mn'];
const SCH_ANGLO = ['us', 'gb', 'ca', 'au', 'ie', 'nz', 'jm', 'sg', 'za', 'ng', 'gh', 'zw', 'fj', 'ke', 'ug', 'tz'];
const SCH_ARAB = ['ae', 'sa', 'eg', 'ma', 'dz', 'tn', 'iq', 'jo', 'lb', 'sy', 'qa', 'kw', 'om'];
const SCH_MUSLIM = SCH_ARAB.concat(['pk', 'bd', 'ir', 'my', 'idn']);
const SCH_CATH = ['it', 'es', 'pt', 'ie', 'pl', 'at', 'be', 'lu', 'mt', 'hr', 'si', 'mx', 'ar', 'co', 'cl', 'pe', 've', 'ec', 'bo', 'py', 'uy', 'cr', 'pa', 'do', 'gt', 'ph', 'br'];
const SCH_ORTH = ['gr', 'cy', 'rs', 'bg', 'ro', 'me', 'mk'];
const SCH_LATIN = ['gb', 'ie', 'de', 'at', 'ch', 'fr', 'it', 'nl', 'be', 'lu', 'es', 'pt', 'pl', 'cz', 'sk', 'hu', 'se', 'dk', 'no', 'fi', 'hr', 'si'];
const SCH_LANG = {
  ru: 'Русский язык', ua: 'Украинский язык', by: 'Белорусский язык', kz: 'Казахский язык', ge: 'Грузинский язык', am: 'Армянский язык', az: 'Азербайджанский язык',
  uz: 'Узбекский язык', kg: 'Киргизский язык', tj: 'Таджикский язык', tm: 'Туркменский язык', lt: 'Литовский язык', lv: 'Латышский язык', ee: 'Эстонский язык', md: 'Румынский язык',
  de: 'Немецкий язык', at: 'Немецкий язык', ch: 'Немецкий язык', fr: 'Французский язык', be: 'Французский язык', lu: 'Французский язык', sn: 'Французский язык', ci: 'Французский язык', cm: 'Французский язык',
  it: 'Итальянский язык', br: 'Португальский язык', pt: 'Португальский язык', ao: 'Португальский язык', mz: 'Португальский язык', jp: 'Японский язык', kr: 'Корейский язык', kp: 'Корейский язык',
  cn: 'Китайский язык', tw: 'Китайский язык', tr: 'Турецкий язык', in: 'Хинди', pl: 'Польский язык', cz: 'Чешский язык', sk: 'Словацкий язык', nl: 'Нидерландский язык', se: 'Шведский язык',
  fi: 'Финский язык', dk: 'Датский язык', no: 'Норвежский язык', is: 'Исландский язык', gr: 'Греческий язык', cy: 'Греческий язык', rs: 'Сербский язык', hr: 'Хорватский язык', si: 'Словенский язык',
  ba: 'Боснийский язык', me: 'Черногорский язык', mk: 'Македонский язык', al: 'Албанский язык', bg: 'Болгарский язык', ro: 'Румынский язык', hu: 'Венгерский язык', mn: 'Монгольский язык',
  il: 'Иврит', ir: 'Персидский язык', pk: 'Урду', bd: 'Бенгальский язык', lk: 'Сингальский язык', np: 'Непальский язык', my: 'Малайский язык', idn: 'Индонезийский язык', th: 'Тайский язык',
  vn: 'Вьетнамский язык', kh: 'Кхмерский язык', la: 'Лаосский язык', mm: 'Бирманский язык', ph: 'Филиппинский язык', ke: 'Суахили', tz: 'Суахили', ug: 'Английский язык', et: 'Амхарский язык',
  mt: 'Мальтийский язык', mg: 'Малагасийский язык'
};
for (const c of SCH_ANGLO) if (!SCH_LANG[c] || c === 'ug') SCH_LANG[c] = 'Английский язык';
for (const c of SCH_ARAB) SCH_LANG[c] = 'Арабский язык';
for (const c of ['es', 'mx', 'ar', 'co', 'cl', 'pe', 'cu', 've', 'ec', 'bo', 'uy', 'py', 'cr', 'pa', 'do', 'gt']) SCH_LANG[c] = 'Испанский язык';
SCH_LANG.ke = 'Суахили'; SCH_LANG.tz = 'Суахили';

// Первый иностранный язык: выбирается один раз на жизнь
function schForeign(c, y) {
  const sc = typeof S !== "undefined" && S && S.school; const r = (sc && sc.flr) || Math.random(); if (sc) sc.flr = r;
  if (SCH_ANGLO.includes(c)) return c === 'us' ? (y < 1960 ? 'Латынь' : 'Испанский язык') : 'Французский язык';
  if (['de', 'at', 'ch'].includes(c)) return y < 1945 ? 'Французский язык' : 'Английский язык';
  if (SCH_SOV.includes(c) || SCH_EAST.includes(c)) {
    if (y < 1918) return r < 0.6 ? 'Французский язык' : 'Немецкий язык';
    if (y < 1945) return r < 0.7 ? 'Немецкий язык' : r < 0.9 ? 'Английский язык' : 'Французский язык';
    if (y < 1992) return r < 0.55 ? 'Английский язык' : r < 0.88 ? 'Немецкий язык' : 'Французский язык';
    return r < 0.85 ? 'Английский язык' : 'Немецкий язык';
  }
  if (y < 1945) return ['fr', 'be', 'lu'].includes(c) ? 'Немецкий язык' : r < 0.5 ? 'Французский язык' : 'Английский язык';
  return 'Английский язык';
}
const SCH_SECOND = { fr: 'Испанский язык', de: 'Французский язык', at: 'Французский язык', es: 'Французский язык', it: 'Испанский язык', nl: 'Немецкий язык', be: 'Нидерландский язык', pl: 'Немецкий язык', se: 'Немецкий язык', dk: 'Немецкий язык', fi: 'Шведский язык', pt: 'Французский язык', ru: 'Немецкий язык' };

// Возвращает список [id, emoji, name] для класса g (1–12) в стране c и году y
function curriculum(c, y, g, sex) {
  const L = []; const add = (id, e, n) => L.push([id, e, n]);
  const sov = SCH_SOV.includes(c), east = SCH_EAST.includes(c), anglo = SCH_ANGLO.includes(c);
  const empire = sov && y < 1918, ussr = sov && y >= 1922 && y <= 1991;
  // язык и литература
  add('lang', '📝', SCH_LANG[c] || 'Родной язык');
  if (ussr && c !== 'ru' && y >= 1938) add('rus', '🇷🇺', 'Русский язык');
  if (sov || east) { if (g <= 4) add('read', '📖', y >= 1996 && c === 'ru' ? 'Литературное чтение' : 'Чтение'); else add('lit', '📚', 'Литература'); }
  else if (g >= 7) add('lit', '📚', 'Литература');
  if ((sov || east) && g <= 4 && y < 1970) add('calli', '✒️', 'Чистописание');
  if (['jp', 'cn', 'tw', 'kr'].includes(c) && g >= 3) add('calli', '🖌️', 'Каллиграфия');
  // математика
  const algGeo = sov || east || c === 'us' || ['fr', 'it', 'es', 'pt', 'gr', 'rs', 'cn', 'vn', 'cu'].includes(c);
  if (algGeo && g >= (c === 'us' ? 8 : 7)) { add('alg', '✖️', 'Алгебра'); add('geom', '📏', 'Геометрия'); if (c === 'us' && g >= 12 && y >= 1960) add('calc', '∫', 'Математический анализ'); }
  else add('math', '📐', 'Математика');
  // природа и науки
  if (g <= 4 || (!sov && !east && g <= 6)) add('sci', '🔬', sov && c === 'ru' && y >= 1996 ? 'Окружающий мир' : sov || east ? 'Природоведение' : 'Естествознание');
  if (g >= (sov || east ? 5 : 7)) {
    if (sov && y < 1965) { if (g <= 6) add('bio', '🌱', 'Ботаника'); else if (g === 7) add('bio', '🐸', 'Зоология'); else if (g === 8) add('bio', '🫀', 'Анатомия'); else add('bio', '🧬', 'Общая биология'); }
    else add('bio', '🧬', 'Биология');
  }
  if (g >= (sov || east ? (y < 2000 ? 6 : 7) : 8)) add('phys', '⚛️', 'Физика');
  if (g >= (sov && y < 1990 ? 7 : 8)) add('chem', '🧪', 'Химия');
  if (g >= (sov ? 6 : 5)) add('geo', '🌍', 'География');
  if (sov && g >= 10 && ((y >= 1932 && y <= 1993) || (c === 'ru' && y >= 2017))) add('astro', '🔭', 'Астрономия');
  // история и общество
  if (g >= 4) add('hist', '🏛️', 'История');
  if (sov && g >= 10 && y >= 1947 && y <= 1955) add('logic', '🧠', 'Логика');
  if (ussr && g >= 10 && y >= 1962) add('soc', '⚖️', 'Обществоведение');
  if (sov && !ussr && y >= 1992 && g >= 6) add('soc', '⚖️', 'Обществознание');
  if (c === 'us' && g >= 9 && y >= 1920) add('civ', '🗽', 'Граждановедение');
  if (['cn', 'vn', 'kp', 'cu'].includes(c) && y >= 1950 && g >= 5) add('pol', '🚩', 'Политическое воспитание');
  if (east && y >= 1949 && y <= 1989 && g >= 9) add('pol', '🚩', 'Основы марксизма');
  if ((c === 'jp' && y >= 1958) || (c === 'kr' && y >= 1963)) add('moral', '🤝', 'Мораль');
  if (c === 'jp' && y < 1946) add('moral', '🤝', 'Сюсин (мораль)');
  // религия
  if (empire || (SCH_ORTH.includes(c) && y < 1945) || (['ge', 'am'].includes(c) && y < 1921)) add('relig', '✝️', 'Закон Божий');
  else if (SCH_ORTH.includes(c) && c === 'gr') add('relig', '✝️', 'Религия');
  else if (SCH_CATH.includes(c) && !(c === 'pl' && y >= 1949 && y < 1990) && !(['hr', 'si'].includes(c) && y >= 1945 && y < 1991) && !(c === 'mx' && y >= 1917) && !(c === 'cu' && y >= 1959)) add('relig', '✝️', 'Религия');
  else if (['de', 'ch', 'nl', 'dk', 'no', 'se', 'fi', 'is'].includes(c) && (y < 1970 || ['de', 'ch', 'no', 'fi'].includes(c))) add('relig', '✝️', 'Религия');
  else if (SCH_MUSLIM.includes(c)) add('relig', '☪️', 'Основы ислама');
  else if (c === 'tr' && y >= 1982) add('relig', '☪️', 'Религиозная культура и этика');
  else if (c === 'il') add('relig', '✡️', 'Танах');
  else if (c === 'ru' && y >= 2012 && g === 4) add('relig', '🕊️', 'Основы религиозных культур и светской этики');
  // иностранные языки
  const fl1 = (sov || east) ? (y >= 2004 ? 2 : 5) : anglo ? (c === 'us' ? 9 : 7) : y >= 2000 ? 3 : 5;
  if (g >= fl1 && !(c === 'us' && y < 1960 && g < 9)) add('eng', '🌐', schForeign(c, y));
  if (east && y >= 1949 && y <= 1989 && g >= 5) add('rus', '🇷🇺', 'Русский язык');
  if (empire && g >= 3) add('latin', '🏺', 'Латынь');
  if (SCH_LATIN.includes(c) && y < 1965 && g >= 5) add('latin', '🏺', 'Латынь');
  if (c === 'us' && y < 1960 && g >= 9 && !L.some((x) => x[2] === 'Латынь')) add('latin', '🏺', 'Латынь');
  if (c === 'in' && g >= 1 && y >= 1948) add('eng2', '🌐', 'Английский язык');
  if (c === 'in' && g >= 6) add('sansk', '🕉️', 'Санскрит');
  if (SCH_SECOND[c] && y >= (c === 'ru' ? 2010 : 1995) && g >= (c === 'ru' ? 5 : 6)) { const n = SCH_SECOND[c]; if (!L.some((x) => x[2] === n)) add('eng3', '🗣️', n); }
  // труд, искусство, спорт
  if (g <= 9) {
    if (y >= 2024 && c === 'ru') add('labor', '🛠️', 'Труд (технология)');
    else if ((sov || east || anglo) && y < (sov ? 1993 : 1975) && g >= 5) add('labor', sex === 'f' ? '🧵' : '🔨', sex === 'f' ? 'Домоводство' : sov || east ? 'Труд (мастерские)' : 'Столярное дело');
    else if ((sov || east) && y < 1993) add('labor', '🛠️', 'Трудовое обучение');
    else if (y >= 1975) add('labor', '🛠️', 'Технология');
  }
  if (g <= (sov ? 7 : 9)) { if (y < 1930) add('art', '🎵', 'Пение и рисование'); else if (sov || east) { add('art', '🎨', 'ИЗО'); add('music', '🎵', 'Музыка'); } else add('art', '🎨', 'Музыка и рисование'); }
  add('pe', '🏃', y < 1920 ? 'Гимнастика' : 'Физкультура');
  if (ussr && g >= 9 && y >= 1968) add('mil', '🎖️', 'Начальная военная подготовка');
  if (sov && !ussr && y >= 1991 && g >= 8) add('mil', '🦺', c === 'ru' && y >= 2024 ? 'Основы безопасности и защиты Родины' : 'ОБЖ');
  // технологии по эпохе
  if (ussr && y >= 1985 && g >= 10) add('it', '💻', 'Информатика и вычислительная техника');
  else if (y >= 1990 && g >= (y >= 2010 ? 5 : 7) && !['kp', 'af'].includes(c)) add('it', '💻', c === 'gb' && y >= 2014 ? 'Программирование' : 'Информатика');
  if (y >= 2018 && g >= 7 && ['ru', 'us', 'gb', 'ca', 'au', 'ua', 'by', 'kz', 'nl', 'de', 'cn', 'sg'].includes(c)) add('fin', '💳', 'Финансовая грамотность');
  if (y >= 2025 && g >= 3 && g <= 8) add('robot', '🤖', 'Робототехника');
  if (y >= 2030 && g >= 5) add('ai', '🧠', 'Основы искусственного интеллекта');
  if (y >= 2035 && g >= 5) add('eco', '🌿', 'Экология и климат');
  if (y >= 2045 && g >= 8) add('space', '🚀', 'Космическая навигация');
  // без повторов по id
  const seen = new Set(); return L.filter(([id]) => (seen.has(id) ? false : (seen.add(id), true)));
}

function schoolGrade() { return Math.max(1, Math.min(12, S.age - 5)); }
// Привести SUBJ и оценки в соответствие с текущим классом; вернуть список новых предметов
function syncSubjects(quiet) {
  if (!S || !S.school) return [];
  const sc = S.school; const list = curriculum(S.country, S.year, schoolGrade(), S.gender);
  const added = [];
  for (const [id, , n] of list) {
    if (sc.subj[id] == null) { sc.subj[id] = clamp(S.stats.smarts + rnd(-20, 15) + (id === 'pe' ? (S.stats.health - 60) / 2 : 0)); if (!quiet) added.push(n); }
  }
  for (const id of Object.keys(sc.subj)) if (!list.some((x) => x[0] === id)) delete sc.subj[id];
  // название могло смениться (например, «Обществоведение» → «Обществознание»)
  sc.names = sc.names || {};
  for (const [id, , n] of list) { if (!quiet && sc.names[id] && sc.names[id] !== n && !added.includes(n)) added.push(n); sc.names[id] = n; }
  SUBJ.length = 0; list.forEach((x) => SUBJ.push(x));
  sc.list = list.map((x) => x.slice());
  return added;
}

const _schoolInitCur = schoolInit;
schoolInit = function () { _schoolInitCur(); S.school.subj = {}; syncSubjects(true); };
YEAR_HOOKS.unshift(() => {
  if (!S || S.edu.stage !== 'school' || S.prison) return;
  if (!S.school) { schoolInit(); return; }
  const added = syncSubjects(S.age <= 6);
  if (added.length) log(`📚 С ${schoolGrade()} класса в расписании ${added.length > 1 ? 'новые предметы' : 'новый предмет'}: ${added.join(', ')}.`, 'info');
});
const _panelSchoolCur = EXTRA_PANELS.school;
// После выпуска показываем предметы, которые реально изучались (а не дефолтный список)
function restoreSubjects() {
  const sc = S.school; if (!sc || !sc.subj) return;
  const ids = Object.keys(sc.subj); if (!ids.length) return;
  const known = {}; for (const x of (sc.list || []).concat(SUBJ)) known[x[0]] = x;
  const list = ids.map((id) => known[id] || [id, '📘', (sc.names && sc.names[id]) || id]);
  SUBJ.length = 0; list.forEach((x) => SUBJ.push(x));
}
EXTRA_PANELS.school = function () { if (S.school && S.edu.stage === 'school') syncSubjects(true); else restoreSubjects(); return _panelSchoolCur(); };

// Номинации выпускного альбома — по полу
const YB_FEM = { '🧠 Самый умный': '🧠 Самая умная', '🏅 Спортсмен выпуска': '🏅 Спортсменка выпуска', '😈 Главный хулиган': '😈 Главная хулиганка', '🏆 Олимпиадник': '🏆 Олимпиадница', '🤫 Самый загадочный': '🤫 Самая загадочная', '🍔 Король столовой': '🍔 Королева столовой', '💰 Скорее всего станет миллионером': '💰 Скорее всего станет миллионершей' };
YEAR_HOOKS.push(() => {
  const Y = S && S.school && S.school.yearbook;
  if (!Y || S.gender !== 'f' || Y.fem) return;
  Y.noms = Y.noms.map((n) => YB_FEM[n] || n); Y.fem = true;
  const last = S.log.length && S.log[S.log.length - 1].items.find((it) => it.t.startsWith('🎓 Выпускной альбом готов'));
  if (last) for (const [m, f] of Object.entries(YB_FEM)) last.t = last.t.replace(m, f);
});
