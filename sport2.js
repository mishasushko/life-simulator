/* ===================== 🏅 Спорт: амплуа, ключевые моменты, турниры эпох, тренеры, спонсоры, жизнь после спорта ===================== */
// Загружается после school.js. Дополняет спорт из careers2.js.
const T3 = (ru, en, uk) => sceneText(ru, en, uk);
const SP_SOV = ['ru', 'ua', 'by', 'kz', 'ge', 'am', 'az', 'uz', 'kg', 'tj', 'tm', 'lt', 'lv', 'ee', 'md'];
const SP_EAST = ['pl', 'cz', 'sk', 'hu', 'bg', 'ro', 'mn', 'cu', 'kp', 'vn'];
const SP_EURO = ['gb', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'be', 'at', 'ch', 'se', 'no', 'dk', 'fi', 'is', 'ie', 'gr', 'tr', 'pl', 'cz', 'sk', 'hu', 'ro', 'bg', 'rs', 'hr', 'si', 'ba', 'me', 'mk', 'al', 'cy', 'mt', 'lu'].concat(SP_SOV);
const SP_LATAM = ['br', 'ar', 'uy', 'mx', 'co', 'cl', 'pe', 've', 'ec', 'bo', 'py', 'cr', 'pa', 'do', 'gt', 'cu'];
// «Любитель» по-советски: никаких профессиональных контрактов до 1989 года
const spSovAm = () => (SP_SOV.includes(S.country) || SP_EAST.includes(S.country)) && S.year < 1989 && !(S.sport && S.sport.abroad);

/* ---------- Амплуа и дисциплины ---------- */
const SP_POS = {
  football: [['gk', '🧤', 'Вратарь', 'Goalkeeper', 'Воротар'], ['def', '🛡️', 'Защитник', 'Defender', 'Захисник'], ['mid', '🎯', 'Полузащитник', 'Midfielder', 'Півзахисник'], ['fw', '⚡', 'Нападающий', 'Striker', 'Нападник']],
  hockey: [['gk', '🥅', 'Вратарь', 'Goaltender', 'Воротар'], ['def', '🛡️', 'Защитник', 'Defenseman', 'Захисник'], ['fw', '⚡', 'Нападающий', 'Forward', 'Нападник']],
  basket: [['pg', '🧠', 'Разыгрывающий', 'Point guard', 'Розігруючий'], ['sf', '🏃', 'Лёгкий форвард', 'Small forward', 'Легкий форвард'], ['c', '🗼', 'Центровой', 'Center', 'Центровий']],
  tennis: [['base', '🎾', 'Игра с задней линии', 'Baseliner', 'Гра із задньої лінії'], ['net', '🏐', 'Подача и выход к сетке', 'Serve-and-volley', 'Подача й вихід до сітки'], ['all', '🌀', 'Универсал', 'All-court player', 'Універсал']],
  box: [['fly', '🪶', 'Наилегчайший вес', 'Flyweight', 'Найлегша вага'], ['mid', '🥊', 'Средний вес', 'Middleweight', 'Середня вага'], ['heavy', '🦍', 'Тяжёлый вес', 'Heavyweight', 'Важка вага']],
  swim: [['free', '🌊', 'Вольный стиль', 'Freestyle', 'Вільний стиль'], ['back', '🔙', 'На спине', 'Backstroke', 'На спині'], ['fly', '🦋', 'Баттерфляй', 'Butterfly', 'Батерфляй'], ['breast', '🐸', 'Брасс', 'Breaststroke', 'Брас']],
  run: [['sprint', '💨', 'Спринт', 'Sprint', 'Спринт'], ['mara', '🛣️', 'Марафон', 'Marathon', 'Марафон'], ['jump', '🦘', 'Прыжки', 'Jumps', 'Стрибки'], ['throw', '🏋️', 'Метания', 'Throws', 'Метання']],
  gym: [['art', '🤸', 'Спортивная гимнастика', 'Artistic gymnastics', 'Спортивна гімнастика'], ['rhy', '🎀', 'Художественная гимнастика', 'Rhythmic gymnastics', 'Художня гімнастика', 1984], ['tramp', '🛝', 'Прыжки на батуте', 'Trampoline', 'Стрибки на батуті', 2000]],
  skate: [['single', '⛸️', 'Одиночное катание', 'Singles', 'Одиночне катання'], ['pair', '👫', 'Парное катание', 'Pairs', 'Парне катання'], ['dance', '💃', 'Танцы на льду', 'Ice dance', 'Танці на льоду', 1976]],
  ski: [['biat', '🎯', 'Биатлон', 'Biathlon', 'Біатлон', 1960], ['xc', '🎿', 'Лыжные гонки', 'Cross-country skiing', 'Лижні перегони'], ['alp', '⛷️', 'Горные лыжи', 'Alpine skiing', 'Гірські лижі', 1936]],
  cycle: [['road', '🚴', 'Шоссе', 'Road racing', 'Шосе'], ['track', '🏟️', 'Трек', 'Track cycling', 'Трек'], ['mtb', '🚵', 'Маунтинбайк', 'Mountain bike', 'Маунтинбайк', 1996], ['bmx', '🛞', 'BMX', 'BMX', 'BMX', 2008]],
  wrestle: [['free', '🤼', 'Вольная борьба', 'Freestyle wrestling', 'Вільна боротьба'], ['greco', '🏛️', 'Греко-римская борьба', 'Greco-Roman wrestling', 'Греко-римська боротьба'], ['judo', '🥋', 'Дзюдо', 'Judo', 'Дзюдо', 1964], ['sambo', '🇷🇺', 'Самбо', 'Sambo', 'Самбо', 1938]],
  esport: [['moba', '🧙', 'Командная стратегия (MOBA)', 'MOBA', 'Командна стратегія (MOBA)', 2009], ['fps', '🔫', 'Шутер', 'Shooter', 'Шутер'], ['rts', '🏰', 'Стратегия в реальном времени', 'Real-time strategy', 'Стратегія в реальному часі'], ['fight', '👊', 'Файтинг', 'Fighting games', 'Файтинг']]
};
const posOpts = (id) => (SP_POS[id] || []).filter((p) => (!p[5] || S.year >= p[5]) && !(S.gender === 'f' && p[0] === 'greco') && !(S.gender === 'm' && p[0] === 'rhy'));
const posOf = (sp) => (SP_POS[sp.id] || []).find((p) => p[0] === sp.pos);
const posName = (p) => (p ? T3(p[2], p[3], p[4]) : '');

/* ---------- Статистика по виду спорта ---------- */
const SP_STAT = {
  football: ['goals', '⚽', 'голов', 'goals', 'голів'], hockey: ['goals', '🏒', 'шайб', 'goals', 'шайб'], basket: ['pts', '🏀', 'очков', 'points', 'очок'],
  tennis: ['wins', '🎾', 'побед в матчах', 'match wins', 'перемог у матчах'], box: ['ko', '💥', 'нокаутов', 'knockouts', 'нокаутів'], swim: ['rec', '⏱️', 'личных рекордов', 'personal bests', 'особистих рекордів'],
  run: ['rec', '⏱️', 'личных рекордов', 'personal bests', 'особистих рекордів'], gym: ['wins', '🤸', 'побед на турнирах', 'tournament wins', 'перемог на турнірах'], skate: ['wins', '⛸️', 'чистых прокатов', 'clean skates', 'чистих прокатів'],
  ski: ['wins', '🎿', 'побед на этапах', 'race wins', 'перемог на етапах'], cycle: ['wins', '🚴', 'выигранных этапов', 'stage wins', 'виграних етапів'], wrestle: ['wins', '🤼', 'чистых побед', 'pins', 'чистих перемог'],
  esport: ['wins', '🎮', 'выигранных турниров', 'tournament wins', 'виграних турнірів']
};
const spStat = (sp) => (sp.pos === 'gk' ? ['clean', sp.id === 'hockey' ? '🥅' : '🧤', 'сухих матчей', 'shutouts', 'сухих матчів'] : SP_STAT[sp.id] || ['wins', '🏅', 'побед', 'wins', 'перемог']);
// с какого года проводится чемпионат мира (у женщин — отдельно)
const WCH_M = { football: 1930, hockey: 1920, basket: 1950, box: 1974, swim: 1973, run: 1983, gym: 1903, skate: 1896, ski: 1925, cycle: 1921, wrestle: 1904, esport: 2001, tennis: 9999 };
const WCH_F = { football: 1991, hockey: 1990, basket: 1953, box: 2001, swim: 1973, run: 1983, gym: 1934, skate: 1906, ski: 1954, cycle: 1958, wrestle: 1987, esport: 2001, tennis: 9999 };
function wchFrom(id) { let y = (S.gender === 'f' ? WCH_F : WCH_M)[id] || 1900; if (id === 'wrestle' && S.sport && S.sport.pos === 'judo') y = S.gender === 'f' ? 1980 : 1956; return y; }
function spAdd(sp, n) { const k = spStat(sp)[0]; sp.st = sp.st || {}; sp.st[k] = (sp.st[k] || 0) + n; }

/* ---------- Ключевой момент сезона: свой для каждого вида ---------- */
const SP_MOMENT = {
  football: { t: ['Пенальти на последней минуте', 'A last-minute penalty', 'Пенальті на останній хвилині'], x: ['Счёт равный, мяч у вас на точке. Стадион замер.', 'The score is level and the ball is on the spot. The stadium holds its breath.', 'Рахунок рівний, м\'яч у вас на точці. Стадіон завмер.'],
    c: [[['Пробить в девятку', 'Go for the top corner', 'Пробити в дев\'ятку'], -8, 3], [['Пробить по центру «паненкой»', 'A cheeky Panenka down the middle', 'Пробити по центру «паненкою»'], -15, 5], [['Уступить удар партнёру', 'Let a teammate take it', 'Поступитися ударом партнерові'], 99, 0]] },
  hockey: { t: ['Буллит в овертайме', 'A shootout in overtime', 'Булліт в овертаймі'], x: ['Судьба матча решается один на один с вратарём.', 'The game comes down to one-on-one with the goalie.', 'Доля матчу вирішується віч-на-віч із воротарем.'],
    c: [[['Финт и бросок под перекладину', 'Deke and roof it', 'Фінт і кидок під поперечку'], -8, 3], [['Кистевой с ходу', 'A quick wrist shot', 'Кистьовий з ходу'], 0, 1], [['Объехать вратаря', 'Try to skate around the goalie', 'Об\'їхати воротаря'], -14, 4]] },
  basket: { t: ['Последний бросок', 'The last shot', 'Останній кидок'], x: ['Две секунды до сирены, ваша команда проигрывает одно очко.', 'Two seconds left and your team is down by one.', 'Дві секунди до сирени, ваша команда програє одне очко.'],
    c: [[['Трёхочковый с отклонением', 'A fadeaway three', 'Триочковий із відхиленням'], -12, 4], [['Проход под кольцо', 'Drive to the basket', 'Прохід під кільце'], -4, 2], [['Пас открытому партнёру', 'Pass to the open teammate', 'Пас відкритому партнерові'], 2, 1]] },
  tennis: { t: ['Тай-брейк решающего сета', 'A final-set tiebreak', 'Тай-брейк вирішального сету'], x: ['6:6 в тай-брейке. Ваша подача.', '6-6 in the tiebreak. Your serve.', '6:6 у тай-брейку. Ваша подача.'],
    c: [[['Подача навылет', 'Go for an ace', 'Подача навиліт'], -10, 3], [['Длинный розыгрыш', 'Grind out a long rally', 'Довгий розіграш'], 0, 1], [['Укороченный удар', 'A drop shot', 'Укорочений удар'], -12, 3]] },
  box: { t: ['Двенадцатый раунд', 'The twelfth round', 'Дванадцятий раунд'], x: ['По очкам равенство. Соперник устал, но опасен.', 'The scorecards are even. Your opponent is tired but dangerous.', 'За очками рівність. Суперник утомився, але небезпечний.'],
    c: [[['Пойти в размен ради нокаута', 'Trade punches for the knockout', 'Піти на розмін заради нокауту'], -12, 4], [['Работать вторым номером', 'Counterpunch', 'Працювати другим номером'], -2, 1], [['Клинчевать и дотянуть', 'Clinch and survive', 'Клінчувати й дотягнути'], 4, 0]] },
  swim: { t: ['Финал, последние 50 метров', 'The final 50 meters', 'Фінал, останні 50 метрів'], x: ['Вы идёте третьим, касание через полминуты.', 'You are third with half a minute to the wall.', 'Ви йдете третім, торкання за пів хвилини.'],
    c: [[['Рвануть на пределе', 'Sprint all out', 'Рвонути на межі'], -8, 3], [['Держать технику', 'Keep your technique', 'Тримати техніку'], 0, 1], [['Нырнуть подольше после поворота', 'Stay under longer after the turn', 'Пірнути довше після повороту'], -10, 3]] },
  run: { t: ['Решающий забег', 'The deciding race', 'Вирішальний забіг'], x: ['Соперники сильны, но этот старт ваш.', 'Your rivals are strong, but this race is yours to take.', 'Суперники сильні, але цей старт ваш.'],
    c: [[['Рвануть с самого старта', 'Go hard from the start', 'Рвонути з самого старту'], -10, 3], [['Финишный спурт', 'Save it for a finishing kick', 'Фінішний спурт'], -3, 2], [['Бежать за лидером', 'Sit behind the leader', 'Бігти за лідером'], 2, 1]] },
  gym: { t: ['Финал многоборья', 'The all-around final', 'Фінал багатоборства'], x: ['Остался последний снаряд. Судьи ждут.', 'One apparatus left. The judges are waiting.', 'Залишився останній снаряд. Судді чекають.'],
    c: [[['Новый сложнейший элемент', 'Debut your hardest new skill', 'Новий найскладніший елемент'], -14, 4], [['Чистая проверенная программа', 'A clean, proven routine', 'Чиста перевірена програма'], 0, 1], [['Усложнить соскок', 'Upgrade the dismount', 'Ускладнити зіскок'], -7, 2]] },
  skate: { t: ['Произвольная программа', 'The free skate', 'Довільна програма'], x: ['После короткой вы вторые. Музыка вот-вот начнётся.', 'You are second after the short program. The music is about to start.', 'Після короткої ви другі. Музика ось-ось почнеться.'],
    c: [[['Четверной прыжок', 'Go for a quad', 'Четверний стрибок'], -14, 4], [['Чистый прокат без риска', 'A clean, safe skate', 'Чистий прокат без ризику'], 0, 1], [['Сделать ставку на артистизм', 'Bet on artistry', 'Зробити ставку на артистизм'], -4, 2]] },
  ski: { t: ['Последний огневой рубеж', 'The last shooting range', 'Останній вогневий рубіж'], x: ['Вы лидируете, но соперники рядом. Пять мишеней.', 'You are leading, but your rivals are close. Five targets.', 'Ви лідируєте, але суперники поруч. П\'ять мішеней.'],
    c: [[['Стрелять быстро', 'Shoot fast', 'Стріляти швидко'], -10, 3], [['Стрелять аккуратно', 'Shoot carefully', 'Стріляти акуратно'], 0, 1], [['Выложиться на последнем круге', 'Empty the tank on the last lap', 'Викластися на останньому колі'], -6, 2]] },
  cycle: { t: ['Горный этап', 'The mountain stage', 'Гірський етап'], x: ['До вершины десять километров, пелотон растянулся.', 'Ten kilometers to the summit, the peloton is stretched out.', 'До вершини десять кілометрів, пелотон розтягнувся.'],
    c: [[['Атаковать в одиночку', 'Attack solo', 'Атакувати самотужки'], -12, 4], [['Сидеть на колесе у лидера', 'Sit on the leader\'s wheel', 'Сидіти на колесі в лідера'], 0, 1], [['Работать на капитана команды', 'Work for the team leader', 'Працювати на капітана команди'], 6, 0]] },
  wrestle: { t: ['Финальная схватка', 'The final bout', 'Фінальна сутичка'], x: ['Тридцать секунд до конца, вы проигрываете балл.', 'Thirty seconds left and you are down one point.', 'Тридцять секунд до кінця, ви програєте бал.'],
    c: [[['Бросок с амплитудой', 'Go for a big throw', 'Кидок з амплітудою'], -12, 4], [['Проход в ноги', 'Shoot for the legs', 'Прохід у ноги'], -4, 2], [['Терпеть и ждать ошибки', 'Wait for a mistake', 'Терпіти й чекати помилки'], 2, 0]] },
  esport: { t: ['Финал турнира', 'The tournament final', 'Фінал турніру'], x: ['Последняя карта, счёт равный. Зрители в прямом эфире.', 'The final map, the series is tied. The stream is watching.', 'Остання карта, рахунок рівний. Глядачі в прямому ефірі.'],
    c: [[['Агрессивный ранний натиск', 'An early aggressive rush', 'Агресивний ранній натиск'], -10, 3], [['Терпеливая игра', 'A patient game', 'Терпляча гра'], 0, 1], [['Нестандартная стратегия', 'An off-meta strategy', 'Нестандартна стратегія'], -14, 4]] }
};
const SP_GK = { t: ['Пенальти в ваши ворота', 'A penalty against you', 'Пенальті у ваші ворота'], x: ['Лучший бомбардир соперника ставит мяч на точку. Всё решится сейчас.', 'Their top scorer places the ball on the spot. It all comes down to this.', 'Найкращий бомбардир суперника ставить м\'яч на точку. Усе вирішиться зараз.'],
  c: [[['Прыгнуть влево', 'Dive left', 'Стрибнути вліво'], -4, 2], [['Прыгнуть вправо', 'Dive right', 'Стрибнути вправо'], -4, 2], [['Остаться в центре', 'Stay in the middle', 'Залишитися в центрі'], -10, 3]] };
function sportMoment() {
  const sp = S.sport; const d = sportDef(); const m = sp.pos === 'gk' && ['football', 'hockey'].includes(sp.id) ? SP_GK : SP_MOMENT[sp.id]; if (!m) return;
  const st = spStat(sp);
  ev(d.e, T3(...m.t), T3(...m.x), m.c.map(([lab, mod, gain]) => ({ t: T3(...lab), f: () => {
    if (mod === 99) { eff({ karma: 2 }); return T3('Вы уступили. Партнёр забил, команда обнимает вас обоих.', 'You stepped aside. Your teammate scored and the team hugged you both.', 'Ви поступилися. Партнер забив, команда обіймає вас обох.'); }
    const sc = sp.rating + rnd(-20, 20) + mod + (sp.coach ? 3 : 0);
    if (sc >= 70) { spAdd(sp, gain + (sp.id === 'basket' ? rnd(1, 3) : 0)); sp.rating = clamp(sp.rating + 1); S.fameBonus = (S.fameBonus || 0) + gain; eff({ happy: 6 + gain * 2 }); sp.moments = (sp.moments || 0) + 1; if (sp.moments >= 5) unlock('clutch');
      return T3(`🔥 Получилось! Этот момент будут показывать в повторах. ${st[1]} +${gain}`, `🔥 You did it! That moment will be on every highlight reel. ${st[1]} +${gain}`, `🔥 Вийшло! Цей момент показуватимуть у повторах. ${st[1]} +${gain}`); }
    eff({ happy: -5 }); return T3('😣 Не вышло. Соперник празднует, а вы долго смотрите в одну точку.', '😣 It didn\'t work. Your opponent celebrates while you stare into space.', '😣 Не вийшло. Суперник святкує, а ви довго дивитеся в одну точку.');
  } })));
}

/* ---------- Турниры по видам спорта и эпохам ---------- */
function sportCups() {
  const sp = S.sport, c = sp.abroad || S.country, y = S.year, L = [];
  const add = (ru, en, uk, w) => L.push([ru, en, uk, w || 1]);
  if (sp.id === 'football') {
    add('чемпионат страны', 'the national league', 'чемпіонат країни', 3); add('кубок страны', 'the national cup', 'кубок країни', 2);
    if (SP_EURO.includes(c) && y >= 1956) add(y >= 1992 ? 'Лигу чемпионов' : 'Кубок европейских чемпионов', y >= 1992 ? 'the Champions League' : 'the European Cup', y >= 1992 ? 'Лігу чемпіонів' : 'Кубок європейських чемпіонів', 0.5);
    if (SP_LATAM.includes(c) && y >= 1960) add('Кубок Либертадорес', 'the Copa Libertadores', 'Кубок Лібертадорес', 0.5);
  } else if (sp.id === 'hockey') {
    if (['us', 'ca'].includes(c) && y >= 1918) add('Кубок Стэнли', 'the Stanley Cup', 'Кубок Стенлі', 1);
    else if (['ru', 'by', 'kz', 'lv'].includes(c) && y >= 2009) add('Кубок Гагарина', 'the Gagarin Cup', 'Кубок Гагаріна', 2);
    else add('чемпионат страны', 'the national league', 'чемпіонат країни', 2);
    if (SP_EURO.includes(c) && y >= 1997) add('Хоккейную лигу чемпионов', 'the Champions Hockey League', 'Хокейну лігу чемпіонів', 0.5);
  } else if (sp.id === 'basket') {
    if (['us', 'ca'].includes(c) && y >= 1947) add('титул НБА', 'the NBA title', 'титул НБА', 1); else add('чемпионат страны', 'the national league', 'чемпіонат країни', 2);
    if (SP_EURO.includes(c) && y >= 1958) add('Евролигу', 'the EuroLeague', 'Євролігу', 0.6);
  } else if (sp.id === 'tennis') {
    add('Уимблдон', 'Wimbledon', 'Вімблдон', 1); if (y >= 1925) add('«Ролан Гаррос»', 'Roland Garros', '«Ролан Гаррос»', 1); if (y >= 1905) add('Открытый чемпионат Австралии', 'the Australian Open', 'Відкритий чемпіонат Австралії', 0.8); add('Открытый чемпионат США', 'the US Open', 'Відкритий чемпіонат США', 1);
    if (y >= 1970) add('Итоговый турнир года', 'the year-end Finals', 'Підсумковий турнір року', 0.6);
  } else if (sp.id === 'box') {
    if (spSovAm()) add('чемпионат СССР', 'the USSR championship', 'чемпіонат СРСР', 2); else add(y >= 1963 ? 'пояс чемпиона мира WBC' : 'титул чемпиона мира', y >= 1963 ? 'the WBC world title belt' : 'the world title', y >= 1963 ? 'пояс чемпіона світу WBC' : 'титул чемпіона світу', 1);
  } else if (sp.id === 'cycle' && sp.pos !== 'track') {
    if (y >= 1903) add('«Тур де Франс»', 'the Tour de France', '«Тур де Франс»', 1); if (y >= 1909) add('«Джиро д\'Италия»', 'the Giro d\'Italia', '«Джиро д\'Італія»', 1); if (y >= 1935) add('«Вуэльту»', 'the Vuelta a España', '«Вуельту»', 0.8);
    if (spSovAm() && y >= 1948) add('Велогонку Мира', 'the Peace Race', 'Велогонку Миру', 2);
  } else if (sp.id === 'run' && sp.pos === 'mara') {
    add('Бостонский марафон', 'the Boston Marathon', 'Бостонський марафон', 1); if (y >= 1970) add('Нью-Йоркский марафон', 'the New York City Marathon', 'Нью-Йоркський марафон', 1); if (y >= 1981) add('Лондонский марафон', 'the London Marathon', 'Лондонський марафон', 1);
  } else if (sp.id === 'esport') {
    if (y >= 2011 && sp.pos === 'moba') add('The International', 'The International', 'The International', 1); if (y >= 2013 && sp.pos === 'fps') add('мейджор по шутерам', 'a shooter Major', 'мейджор із шутерів', 1); add('онлайн-лигу', 'an online league', 'онлайн-лігу', 2);
  } else {
    add('чемпионат страны', 'the national championship', 'чемпіонат країни', 2); if (y >= 1960) add('этап Кубка мира', 'a World Cup stage', 'етап Кубка світу', 1); if (SP_EURO.includes(S.country) && y >= 1950) add('чемпионат Европы', 'the European Championships', 'чемпіонат Європи', 0.6);
  }
  return L;
}
function pickCup() { const L = sportCups(); const sum = L.reduce((s, x) => s + x[3], 0); let r = Math.random() * sum; for (const x of L) { r -= x[3]; if (r <= 0) return x; } return L[0]; }

/* ---------- Олимпиады: настоящие столицы игр, бойкоты, женские дисциплины ---------- */
const OLY_S = { 1900: 'Париж', 1904: 'Сент-Луис', 1908: 'Лондон', 1912: 'Стокгольм', 1920: 'Антверпен', 1924: 'Париж', 1928: 'Амстердам', 1932: 'Лос-Анджелес', 1936: 'Берлин', 1948: 'Лондон', 1952: 'Хельсинки', 1956: 'Мельбурн', 1960: 'Рим', 1964: 'Токио', 1968: 'Мехико', 1972: 'Мюнхен', 1976: 'Монреаль', 1980: 'Москва', 1984: 'Лос-Анджелес', 1988: 'Сеул', 1992: 'Барселона', 1996: 'Атланта', 2000: 'Сидней', 2004: 'Афины', 2008: 'Пекин', 2012: 'Лондон', 2016: 'Рио-де-Жанейро', 2021: 'Токио', 2024: 'Париж', 2028: 'Лос-Анджелес', 2032: 'Брисбен' };
const OLY_W = { 1924: 'Шамони', 1928: 'Санкт-Мориц', 1932: 'Лейк-Плэсид', 1936: 'Гармиш-Партенкирхен', 1948: 'Санкт-Мориц', 1952: 'Осло', 1956: 'Кортина-д\'Ампеццо', 1960: 'Скво-Вэлли', 1964: 'Инсбрук', 1968: 'Гренобль', 1972: 'Саппоро', 1976: 'Инсбрук', 1980: 'Лейк-Плэсид', 1984: 'Сараево', 1988: 'Калгари', 1992: 'Альбервиль', 1994: 'Лиллехаммер', 1998: 'Нагано', 2002: 'Солт-Лейк-Сити', 2006: 'Турин', 2010: 'Ванкувер', 2014: 'Сочи', 2018: 'Пхёнчхан', 2022: 'Пекин', 2026: 'Милан и Кортина-д\'Ампеццо', 2030: 'Французские Альпы', 2034: 'Солт-Лейк-Сити' };
const OLY_HOST = { 'Париж': 'fr', 'Сент-Луис': 'us', 'Лондон': 'gb', 'Стокгольм': 'se', 'Антверпен': 'be', 'Амстердам': 'nl', 'Лос-Анджелес': 'us', 'Берлин': 'de', 'Хельсинки': 'fi', 'Мельбурн': 'au', 'Рим': 'it', 'Токио': 'jp', 'Мехико': 'mx', 'Мюнхен': 'de', 'Монреаль': 'ca', 'Москва': 'ru', 'Сеул': 'kr', 'Барселона': 'es', 'Атланта': 'us', 'Сидней': 'au', 'Афины': 'gr', 'Пекин': 'cn', 'Рио-де-Жанейро': 'br', 'Брисбен': 'au', 'Шамони': 'fr', 'Санкт-Мориц': 'ch', 'Лейк-Плэсид': 'us', 'Гармиш-Партенкирхен': 'de', 'Осло': 'no', 'Кортина-д\'Ампеццо': 'it', 'Скво-Вэлли': 'us', 'Инсбрук': 'at', 'Гренобль': 'fr', 'Саппоро': 'jp', 'Сараево': 'ba', 'Калгари': 'ca', 'Альбервиль': 'fr', 'Лиллехаммер': 'no', 'Нагано': 'jp', 'Солт-Лейк-Сити': 'us', 'Турин': 'it', 'Ванкувер': 'ca', 'Сочи': 'ru', 'Пхёнчхан': 'kr', 'Милан и Кортина-д\'Ампеццо': 'it', 'Французские Альпы': 'fr' };
// когда вид спорта появился на Олимпиаде у женщин
const OLY_WOMEN = { football: 1996, hockey: 1998, basket: 1976, tennis: 1900, box: 2012, swim: 1912, run: 1928, gym: 1928, skate: 1908, ski: 1952, cycle: 1984, wrestle: 2004 };
const OLY_MEN = { box: 1904, wrestle: 1904, basket: 1936, hockey: 1920, ski: 1924, football: 1900, cycle: 1896, tennis: 1896 };
const _olympYearSp = olympYear;
olympYear = function (y, kind) {
  if (kind === 's' && y === 2020) return false;
  if (kind === 's' && y === 2021) return true;
  if (!_olympYearSp(y, kind)) return false;
  return true;
};
function olyBlocked() {
  const sp = S.sport, y = S.year, c = S.country; sp.ol = sportDef().ol;
  if (sp.id === 'tennis' && y > 1924 && y < 1988) return T3('Теннис исключён из олимпийской программы (вернётся в 1988 году).', 'Tennis is off the Olympic program (it returns in 1988).', 'Теніс виключено з олімпійської програми (повернеться 1988 року).');
  if (S.gender === 'f' && OLY_WOMEN[sp.id] && y < OLY_WOMEN[sp.id]) return T3(`Женского турнира по этому виду на Олимпиаде пока нет (появится в ${OLY_WOMEN[sp.id]} году).`, `There is no women's Olympic event in this sport yet (it arrives in ${OLY_WOMEN[sp.id]}).`, `Жіночого турніру з цього виду на Олімпіаді поки немає (з'явиться ${OLY_WOMEN[sp.id]} року).`);
  if (OLY_MEN[sp.id] && y < OLY_MEN[sp.id]) return T3('Этого вида пока нет в олимпийской программе.', 'This sport is not on the Olympic program yet.', 'Цього виду поки немає в олімпійській програмі.');
  if (SP_SOV.includes(c) && y >= 1918 && y < 1952) return T3('СССР пока не участвует в Олимпийских играх.', 'The USSR does not take part in the Olympics yet.', 'СРСР поки не бере участі в Олімпійських іграх.');
  if (c === 'de' && [1920, 1924, 1948].includes(y)) return T3('Германию не допустили к Играм.', 'Germany was barred from the Games.', 'Німеччину не допустили до Ігор.');
  if (y === 1980 && sp.ol === 's' && ['us', 'ca', 'jp', 'kr', 'cn', 'ar', 'tr', 'ke', 'no', 'il', 'eg', 'ph', 'th', 'my', 'idn', 'cl'].includes(c)) return T3('Ваша страна бойкотирует Олимпиаду в Москве.', 'Your country is boycotting the Moscow Olympics.', 'Ваша країна бойкотує Олімпіаду в Москві.');
  if (y === 1984 && sp.ol === 's' && (SP_SOV.includes(c) || ['bg', 'cz', 'sk', 'hu', 'pl', 'mn', 'vn', 'cu', 'kp', 'et'].includes(c))) return T3('Соцлагерь бойкотирует Олимпиаду в Лос-Анджелесе.', 'The Eastern bloc is boycotting the Los Angeles Olympics.', 'Соцтабір бойкотує Олімпіаду в Лос-Анджелесі.');
  if (sp.id === 'esport') return T3('Киберспорт пока не олимпийский вид.', 'Esports is not an Olympic sport yet.', 'Кіберспорт поки не олімпійський вид.');
  return null;
}
const _olympEventSp = olympEvent;
olympEvent = function () {
  const sp = S.sport; const d = sportDef();
  const block = olyBlocked();
  if (block) { log(`🏟️ ${T3(`Олимпиада-${S.year}`, `The ${S.year} Olympics`, `Олімпіада-${S.year}`)}: ${block}`, 'info'); eff({ happy: -3 }); return; }
  const city = (d.ol === 'w' ? OLY_W : OLY_S)[S.year] || pick(['Найроби', 'Доха', 'Мумбаи', 'Буэнос-Айрес', 'Стамбул', 'Санкт-Петербург', 'Каир', 'Джакарта']);
  const home = OLY_HOST[city] === S.country;
  if (!sp.flag && sp.lvl >= 4 && chance(0.4)) { sp.flag = S.year; log(T3(`🚩 Вам доверили нести флаг страны на церемонии открытия в городе ${city}!`, `🚩 You carry your country's flag at the opening ceremony in ${city}!`, `🚩 Вам довірили нести прапор країни на церемонії відкриття в місті ${city}!`), 'good'); eff({ happy: 10 }); }
  const go = (mod, risk) => () => {
    if (risk && chance(0.12)) { sp.inj = 1; eff({ health: -12 }); return T3('🤕 Вы рискнули и получили травму прямо в финале. Без медали.', '🤕 You took the risk and got hurt in the final. No medal.', '🤕 Ви ризикнули й травмувалися просто у фіналі. Без медалі.'); }
    const sc = sp.rating + rnd(-18, 14) + mod + (home ? 4 : 0) + (sp.coach ? 2 : 0);
    S.olympics = (S.olympics || 0) + 1;
    const where = `${d.n}, ${city} ${S.year}`;
    if (sc >= 94) { sp.gold++; unlock('olympgold'); S.money += Math.round(price(spSovAm() ? 1200000 : 5000000)); S.fameBonus = (S.fameBonus || 0) + 12; eff({ happy: 25 }); sfx('ach'); sp.olyLog = (sp.olyLog || []).concat(`🥇 ${city} ${S.year}`);
      return T3(`🥇 ЗОЛОТО! Гимн вашей страны звучит в вашу честь. ${where}.${home ? ' Домашние трибуны плачут от счастья.' : ''}`, `🥇 GOLD! Your national anthem plays in your honor. ${where}.${home ? ' The home crowd is in tears of joy.' : ''}`, `🥇 ЗОЛОТО! Гімн вашої країни звучить на вашу честь. ${where}.${home ? ' Домашні трибуни плачуть від щастя.' : ''}`); }
    if (sc >= 86) { sp.silver++; S.money += Math.round(price(1500000)); S.fameBonus = (S.fameBonus || 0) + 6; eff({ happy: 12 }); sp.olyLog = (sp.olyLog || []).concat(`🥈 ${city} ${S.year}`); return T3(`🥈 Серебро Олимпийских игр! ${where}.`, `🥈 Olympic silver! ${where}.`, `🥈 Срібло Олімпійських ігор! ${where}.`); }
    if (sc >= 79) { sp.bronze++; S.money += Math.round(price(700000)); S.fameBonus = (S.fameBonus || 0) + 4; eff({ happy: 8 }); sp.olyLog = (sp.olyLog || []).concat(`🥉 ${city} ${S.year}`); return T3(`🥉 Бронза Олимпиады! ${where}.`, `🥉 Olympic bronze! ${where}.`, `🥉 Бронза Олімпіади! ${where}.`); }
    eff({ happy: -8 }); return T3(`😔 Олимпиада в городе ${city}: ${rnd(4, 12)}-е место.`, `😔 The ${city} Olympics: ${rnd(4, 12)}th place.`, `😔 Олімпіада в місті ${city}: ${rnd(4, 12)}-е місце.`);
  };
  const pos = posOf(sp);
  ev('🏟️', T3(`Олимпийские игры ${S.year}`, `The ${S.year} Olympic Games`, `Олімпійські ігри ${S.year}`), T3(`Игры в городе ${city}${home ? ' — дома!' : ''}. ${pos ? posName(pos) + '. ' : ''}Финал через час. Какая тактика?`, `The Games in ${city}${home ? ', at home!' : ''}. ${pos ? posName(pos) + '. ' : ''}The final is in an hour. What's the plan?`, `Ігри в місті ${city}${home ? ' — удома!' : ''}. ${pos ? posName(pos) + '. ' : ''}Фінал за годину. Яка тактика?`), [
    { t: T3('💯 Выложиться на сто процентов', '💯 Give it everything', '💯 Викластися на всі сто'), f: go(3, false) }, { t: T3('🧠 Холодный расчёт', '🧠 Stay cool and calculated', '🧠 Холодний розрахунок'), f: go(0, false) }, { t: T3('🎲 Рискнуть ради золота', '🎲 Risk it all for gold', '🎲 Ризикнути заради золота'), f: go(9, true) }]);
};

/* ---------- Клубы по стране ---------- */
const CLUB_STYLE = {
  anglo: [['{c} Юнайтед', '{c} United', '{c} Юнайтед'], ['{c} Сити', '{c} City', '{c} Сіті'], ['{c} Роверс', '{c} Rovers', '{c} Роверс'], ['{c} Уондерерс', '{c} Wanderers', '{c} Вондерерс']],
  us: [['{c} Иглз', '{c} Eagles', '{c} Іглз'], ['{c} Найтс', '{c} Knights', '{c} Найтс'], ['{c} Шторм', '{c} Storm', '{c} Шторм'], ['{c} Рейнджерс', '{c} Rangers', '{c} Рейнджерс']],
  es: [['Реал {c}', 'Real {c}', 'Реал {c}'], ['Атлетико {c}', 'Atlético {c}', 'Атлетіко {c}'], ['Депортиво {c}', 'Deportivo {c}', 'Депортіво {c}'], ['Расинг {c}', 'Racing {c}', 'Расинг {c}']],
  it: [['Спортинг {c}', 'Sporting {c}', 'Спортінг {c}'], ['Аталанта {c}', 'Atalanta {c}', 'Аталанта {c}'], ['Олимпия {c}', 'Olimpia {c}', 'Олімпія {c}'], ['Виртус {c}', 'Virtus {c}', 'Віртус {c}']],
  de: [['Боруссия {c}', 'Borussia {c}', 'Боруссія {c}'], ['Айнтрахт {c}', 'Eintracht {c}', 'Айнтрахт {c}'], ['Фортуна {c}', 'Fortuna {c}', 'Фортуна {c}'], ['СК {c}', 'SC {c}', 'СК {c}']],
  fr: [['Олимпик {c}', 'Olympique {c}', 'Олімпік {c}'], ['Стад {c}', 'Stade {c}', 'Стад {c}'], ['Расинг {c}', 'Racing {c}', 'Расінг {c}'], ['АС {c}', 'AS {c}', 'АС {c}']],
  br: [['Атлетико {c}', 'Atlético {c}', 'Атлетіко {c}'], ['Спорт Клуб {c}', 'Sport Club {c}', 'Спорт Клуб {c}'], ['Насьонал {c}', 'Nacional {c}', 'Насьйонал {c}'], ['Униан {c}', 'União {c}', 'Уніан {c}']],
  jp: [['{c} Фрейя', '{c} Freya', '{c} Фрея'], ['{c} Гамба', '{c} Gamba', '{c} Гамба'], ['{c} Сандерс', '{c} Thunders', '{c} Сандерс'], ['{c} Альбирекс', '{c} Albirex', '{c} Альбірекс']],
  any: [['ФК {c}', 'FC {c}', 'ФК {c}'], ['Спортинг {c}', 'Sporting {c}', 'Спортінг {c}'], ['Униан {c}', 'Union {c}', 'Юніон {c}'], ['Олимпик {c}', 'Olympic {c}', 'Олімпік {c}']]
};
function clubStyle(c) {
  if (SP_SOV.includes(c) || SP_EAST.includes(c) || ['rs', 'hr', 'ba', 'me', 'mk', 'si'].includes(c)) return null;
  if (['gb', 'ie', 'au', 'nz', 'za', 'ng', 'gh', 'jm'].includes(c)) return 'anglo';
  if (['us', 'ca'].includes(c)) return 'us';
  if (['es', 'mx', 'ar', 'co', 'cl', 'pe', 've', 'ec', 'bo', 'uy', 'py', 'cr', 'pa', 'do', 'gt'].includes(c)) return 'es';
  if (['br', 'pt'].includes(c)) return 'br';
  if (['de', 'at', 'ch'].includes(c)) return 'de';
  if (['fr', 'be', 'lu', 'sn', 'ci', 'cm', 'ma', 'tn', 'dz'].includes(c)) return 'fr';
  if (c === 'it') return 'it'; if (c === 'jp') return 'jp';
  return 'any';
}
const _sportClubSp = sportClub;
const ESPORT_TEAMS = ['Nova', 'Phoenix', 'Iron Wolves', 'Neon Tigers', 'Black Comet', 'Zenith', 'Polaris', 'Rogue Owls', 'Crimson Fox', 'Static'];
sportClub = function (cid) {
  if (S.sport && S.sport.id === 'esport') return `${pick(ESPORT_TEAMS)} ${pick(['Gaming', 'Esports', 'Team', 'Club'])}`;
  const co = cid ? COUNTRIES.find((x) => x.id === cid) : C();
  const st = clubStyle(co.id);
  if (!st) { if (!cid) return _sportClubSp(); return `${pick(CLUB_A)} ${cityAt(pick(co.cities), S.year)}`; }
  const city = cityAt(pick(co.cities || [S.city]), S.year); const f = pick(CLUB_STYLE[st]);
  return T3(f[0], f[1], f[2]).replace('{c}', city);
};

/* ---------- Зарплата: советский «любитель» получает ставку, а не контракт ---------- */
const _sportSalarySp = sportSalary;
sportSalary = function () { const v = _sportSalarySp(); if (!v) return 0; let k = spSovAm() ? 0.18 : 1; if (S.sport.abroad) k *= 1.8; if (S.sport.captain) k *= 1.1; return Math.round(v * k); };
function sportLvlNames() { SPORT_LVL[2] = spSovAm() ? 'Мастер спорта' : 'Профессионал'; SPORT_LVL[3] = spSovAm() ? 'Сборная СССР' : 'Сборная страны'; if (!SP_SOV.includes(S.country) && spSovAm()) SPORT_LVL[3] = 'Сборная страны'; }
const _evSp = ev;
ev = function (e, title, text, ...rest) {
  if (title === 'Профессиональный контракт' && S.sport && spSovAm()) {
    title = 'Команда мастеров';
    text = T3('Вас зовут в команду мастеров. Официально вы будете числиться инструктором на заводе, но жить будете спортом.', 'You are invited to a top-flight team. Officially you will be listed as a factory instructor, but sport will be your life.', 'Вас кличуть до команди майстрів. Офіційно ви числитиметеся інструктором на заводі, але житимете спортом.');
    const ch = rest[0];
    if (Array.isArray(ch) && ch[0]) { const f0 = ch[0].f; ch[0] = { t: T3('Согласиться', 'Accept', 'Погодитися'), f: () => { f0(); return T3(`🎖️ Вы мастер спорта и играете за «${S.sport.club}». Квартира от ведомства и талоны на питание прилагаются.`, `🎖️ You are a Master of Sport playing for ${S.sport.club}. A flat from the ministry and meal vouchers come with it.`, `🎖️ Ви майстер спорту й граєте за «${S.sport.club}». Квартира від відомства й талони на харчування додаються.`); } }; }
  }
  return _evSp(e, title, text, ...rest);
};

/* ---------- Ежегодно: моменты, турниры, капитанство, спонсоры, стипендия тренера ---------- */
YEAR_HOOKS.unshift(() => { if (S && S.sport) sportLvlNames(); });
YEAR_HOOKS.push(() => {
  const sp = S.sport; if (!sp) return;
  // жизнь после спорта: работа тренером
  if (sp.retired && sp.coachJob && S.alive) { const pay = price([0, 120000, 300000, 800000, 2000000][Math.min(4, sp.lvl)]); S.money += Math.round(pay * (1 - taxRate())); if (chance(0.15)) { sp.pupils = (sp.pupils || 0) + 1; log(T3(`🧑‍🏫 Ваш ученик выиграл первенство страны. Тренерская школа работает!`, `🧑‍🏫 One of your students won the national championship. Your coaching works!`, `🧑‍🏫 Ваш учень виграв першість країни. Тренерська школа працює!`), 'good'); eff({ happy: 6 }); if (sp.pupils >= 3) unlock('mentor'); } }
  if (sp.retired || S.prison || sp.inj || sp.ban) return;
  if (sp.lvl >= 1 && !sp.pos && SP_POS[sp.id]) { const opts = posOpts(sp.id); const p = pick(opts); sp.pos = p[0]; log(T3(`${p[1]} Тренер определил ваше амплуа: ${p[2].toLowerCase()}.`, `${p[1]} Your coach picked your specialty: ${p[3].toLowerCase()}.`, `${p[1]} Тренер визначив ваше амплуа: ${p[4].toLowerCase()}.`), 'info'); }
  if (sp.lvl >= 1 && chance(0.45)) setTimeout(() => { if (S && S.alive && S.sport === sp) { sportMoment(); pump(); } }, 40);
  // сезонная статистика
  if (sp.lvl >= 2) { const base = { clean: rnd(3, 15), goals: sp.pos === 'fw' ? rnd(5, 25) : sp.pos === 'mid' ? rnd(2, 10) : sp.pos === 'def' ? rnd(0, 4) : 0, pts: rnd(300, 1500), wins: rnd(5, 40), ko: rnd(0, 6), rec: chance(0.4) ? 1 : 0 }[spStat(sp)[0]] || 0; spAdd(sp, Math.round(base * sp.rating / 80)); }
  // именной турнир
  if (sp.lvl >= 2 && chance(sp.rating / 260)) { const cup = pickCup(); sp.cups = (sp.cups || []).concat(`${cup[0]} ${S.year}`); sp.titles++; if (sp.id === 'tennis' && !/Итоговый/.test(cup[0])) sp.worlds++; S.money += Math.round(price(sp.lvl * 250000)); eff({ happy: 10 }); S.fameBonus = (S.fameBonus || 0) + 3; log(T3(`🏆 Вы выиграли ${cup[0]}! ${S.year} год навсегда в вашей биографии.`, `🏆 You won ${cup[1]}! ${S.year} is now part of your legend.`, `🏆 Ви виграли ${cup[2]}! ${S.year} рік назавжди у вашій біографії.`), 'good'); if (sp.cups.length >= 5) unlock('cupcollector'); }
  // капитан команды
  if (sportDef().team && sp.lvl >= 2 && !sp.captain && sp.years >= 6 && S.age >= 24 && chance(0.3)) { sp.captain = S.year; S.fameBonus = (S.fameBonus || 0) + 3; log(T3('🅲 Команда выбрала вас капитаном. Повязка на руке — и ответственность за всех.', '🅲 The team made you captain. The armband comes with responsibility for everyone.', '🅲 Команда обрала вас капітаном. Пов\'язка на руці — і відповідальність за всіх.'), 'good'); unlock('captain'); }
  // спонсоры
  if (sp.spons) { if (sp.spons.left-- > 0) S.money += Math.round(sp.spons.sum * (1 - taxRate())); else { log(T3(`🤝 Закончился рекламный контракт: ${sp.spons.n}.`, `🤝 Your sponsorship deal has ended: ${sp.spons.n}.`, `🤝 Закінчився рекламний контракт: ${sp.spons.n}.`), 'info'); sp.spons = null; } }
  // личный тренер
  if (sp.coach) { sp.rating = clamp(sp.rating + rnd(1, 2)); if (S.money < 0 || chance(0.06)) { log(T3(`🧑‍🏫 Ваш тренер ${sp.coach} ушёл работать с другим спортсменом.`, `🧑‍🏫 Your coach ${sp.coach} left to work with another athlete.`, `🧑‍🏫 Ваш тренер ${sp.coach} пішов працювати з іншим спортсменом.`), 'info'); sp.coach = null; } else S.money -= price(sp.lvl >= 2 ? 300000 : 40000); }
});

/* ---------- Панель: новые действия ---------- */
const SPONSORS = (y) => (y < 1960 ? [['табак «Победа»', 'Pobeda tobacco', 'тютюн «Перемога»'], ['мыло «Свежесть»', 'Svezhest soap', 'мило «Свіжість»'], ['шоколад «Старт»', 'Start chocolate', 'шоколад «Старт»']]
  : y < 1990 ? [['кроссовки «Комета»', 'Kometa sneakers', 'кросівки «Комета»'], ['газировка «Бодрость»', 'Bodrost soda', 'газована вода «Бадьорість»'], ['часы «Секунда»', 'Sekunda watches', 'годинники «Секунда»'], ['магнитофоны «Ритм»', 'Ritm tape recorders', 'магнітофони «Ритм»']]
  : y < 2015 ? [['спортивная одежда «Вектор»', 'Vector sportswear', 'спортивний одяг «Вектор»'], ['энергетик «Разряд»', 'Razryad energy drink', 'енергетик «Розряд»'], ['мобильный оператор «Связь+»', 'Svyaz+ mobile', 'мобільний оператор «Зв\'язок+»'], ['банк «Опора»', 'Opora Bank', 'банк «Опора»']]
  : y < 2035 ? [['фитнес-приложение «Пульс»', 'Puls fitness app', 'фітнес-застосунок «Пульс»'], ['электрокары «Вольт»', 'Volt electric cars', 'електрокари «Вольт»'], ['криптобиржа «Блок»', 'Blok crypto exchange', 'криптобіржа «Блок»'], ['стриминг «Поток»', 'Potok streaming', 'стримінг «Потік»']]
  : [['нейросеть «Синапс»', 'Synapse AI', 'нейромережа «Синапс»'], ['орбитальный отель «Зенит»', 'Zenith orbital hotel', 'орбітальний готель «Зеніт»'], ['бионапитки «Гено»', 'Geno bio drinks', 'біонапої «Гено»']]);
const _panelSportSp = EXTRA_PANELS.sport;
EXTRA_PANELS.sport = function () {
  if (S.sport) sportLvlNames();
  _panelSportSp();
  const sp = S.sport; if (!sp) return;
  const st = spStat(sp); const pos = posOf(sp);
  const stats = [];
  if (pos) stats.push(`${pos[1]} ${posName(pos)}`);
  if (sp.st && sp.st[st[0]]) stats.push(`${st[1]} ${sp.st[st[0]]} ${T3(st[2], st[3], st[4])}`);
  if (sp.captain) stats.push(T3('🅲 капитан команды', '🅲 team captain', '🅲 капітан команди'));
  if (sp.abroad) { const co = COUNTRIES.find((x) => x.id === sp.abroad); if (co) stats.push(`${co.flag} ${T3('легионер', 'playing abroad', 'легіонер')}`); }
  if (sp.coach) stats.push(`🧑‍🏫 ${T3('тренер', 'coach', 'тренер')}: ${esc(sp.coach)}`);
  if (sp.spons) stats.push(`🤝 ${esc(sp.spons.n)}`);
  if (stats.length) card(`<div class="muted">${stats.join(' · ')}</div>`);
  if ((sp.cups && sp.cups.length) || (sp.olyLog && sp.olyLog.length)) { const l0 = section(T3('Трофеи', 'Trophies', 'Трофеї')); l0.appendChild(el(`<div class="souv">${(sp.olyLog || []).concat((sp.cups || []).map((x) => '🏆 ' + x)).map((x) => `<span>${esc(x)}</span>`).join('')}</div>`)); }
  if (sp.retired) { afterSportPanel(sp); return; }
  if (S.prison) return;
  const l = section(T3('Карьера', 'Career', 'Кар\'єра'));
  if (SP_POS[sp.id]) item(l, { e: pos ? pos[1] : '🎯', t: T3('Амплуа и дисциплина', 'Specialty', 'Амплуа та дисципліна'), d: pos ? posName(pos) : T3('Пока не выбрано', 'Not chosen yet', 'Поки не обрано'), disabled: S.used.sp_pos, onClick: () => {
    const opts = posOpts(sp.id);
    Q.push({ e: sportDef().e, title: T3('Амплуа', 'Specialty', 'Амплуа'), text: T3('Кем вы будете на площадке?', 'What will you specialize in?', 'Ким ви будете на майданчику?'), choices: opts.map((p) => ({ t: `${p[1]} ${posName(p)}`, f: () => { S.used.sp_pos = 1; if (sp.pos && sp.pos !== p[0]) sp.rating = clamp(sp.rating - 6); sp.pos = p[0]; return T3(`${p[1]} Теперь ваше амплуа: ${p[2].toLowerCase()}.`, `${p[1]} Your specialty is now: ${p[3].toLowerCase()}.`, `${p[1]} Тепер ваше амплуа: ${p[4].toLowerCase()}.`); } })).concat([{ t: T3('Отмена', 'Cancel', 'Скасувати'), f: () => null }]) }); pump();
  } });
  const cc = price(sp.lvl >= 2 ? 300000 : 40000);
  item(l, { e: '🧑‍🏫', t: sp.coach ? T3('Сменить личного тренера', 'Change personal coach', 'Змінити особистого тренера') : T3('Нанять личного тренера', 'Hire a personal coach', 'Найняти особистого тренера'), d: `${fmt(cc)} ${T3('в год · +форма каждый сезон', 'a year · better form every season', 'на рік · +форма щосезону')}`, disabled: S.used.sp_coach || S.money < cc, onClick: act(() => { S.used.sp_coach = 1; const g = chance(0.75) ? 'm' : 'f'; sp.coach = randFirst(g); S.money -= cc; sp.rating = clamp(sp.rating + 2); return T3(`🧑‍🏫 С вами теперь работает тренер ${sp.coach}. Режим, видеоразборы и никаких поблажек.`, `🧑‍🏫 Coach ${sp.coach} now works with you. Strict routine, video reviews and no excuses.`, `🧑‍🏫 Тепер із вами працює тренер ${sp.coach}. Режим, відеорозбори й жодних поблажок.`); }) });
  item(l, { e: '🎬', t: T3('Разбор игр соперников', 'Study your opponents', 'Розбір ігор суперників'), d: T3(S.year < 1950 ? 'Газетные отчёты и записи тренера' : S.year < 1985 ? 'Киноплёнка в тренерской' : S.year < 2010 ? 'Видеокассеты и DVD' : 'Видеоаналитика и статистика', S.year < 1950 ? 'Newspaper reports and coach notes' : S.year < 1985 ? 'Film reels in the coach\'s room' : S.year < 2010 ? 'VHS tapes and DVDs' : 'Video analytics and data', S.year < 1950 ? 'Газетні звіти й записи тренера' : S.year < 1985 ? 'Кіноплівка в тренерській' : S.year < 2010 ? 'Відеокасети й DVD' : 'Відеоаналітика та статистика'), disabled: S.used.sp_study, onClick: act(() => { S.used.sp_study = 1; sp.rating = clamp(sp.rating + rnd(1, 4)); eff({ smarts: 1 }); return T3('🎬 Вы нашли слабое место у главного соперника.', '🎬 You found your main rival\'s weak spot.', '🎬 Ви знайшли слабке місце в головного суперника.'); }) });
  item(l, { e: '🩺', t: T3('Восстановление и физиотерапия', 'Recovery and physio', 'Відновлення й фізіотерапія'), d: sp.inj ? T3('Быстрее вылечить травму', 'Heal your injury faster', 'Швидше вилікувати травму') : T3('Снизить риск травм', 'Lower your injury risk', 'Знизити ризик травм'), disabled: S.used.sp_physio || S.money < price(50000), onClick: act(() => { S.used.sp_physio = 1; S.money -= price(50000); if (sp.inj) { sp.inj = Math.max(0, sp.inj - 1); return T3('🩺 Врачи творят чудеса: вы вернётесь раньше срока.', '🩺 The physios work wonders: you will be back early.', '🩺 Лікарі творять дива: ви повернетеся раніше.'); } eff({ health: 4 }); return T3('🩺 Массаж, лёд и сон по режиму. Тело благодарит.', '🩺 Massage, ice baths and proper sleep. Your body thanks you.', '🩺 Масаж, лід і сон за режимом. Тіло дякує.'); }) });
  if (sp.lvl >= 1) item(l, { e: '🎤', t: T3('Интервью перед стартом', 'Pre-game interview', 'Інтерв\'ю перед стартом'), d: T3('Слава, карма, давление', 'Fame, karma, pressure', 'Слава, карма, тиск'), disabled: S.used.sp_press, onClick: () => { S.used.sp_press = 1; Q.push({ e: '🎤', title: T3('Пресс-конференция', 'Press conference', 'Пресконференція'), text: T3('Журналист спрашивает: «Чего ждать от вас в этом сезоне?»', 'A reporter asks: "What should we expect from you this season?"', 'Журналіст питає: «Чого чекати від вас цього сезону?»'), choices: [
    { t: T3('🙏 «Будем работать и уважать соперника»', '🙏 "We\'ll work hard and respect our opponents"', '🙏 «Працюватимемо й поважатимемо суперника»'), f: () => { eff({ karma: 3 }); return T3('Скромно и достойно. Болельщики оценили.', 'Modest and dignified. The fans approved.', 'Скромно й гідно. Уболівальники оцінили.'); } },
    { t: T3('😎 «Я лучший, и все это знают»', '😎 "I\'m the best and everybody knows it"', '😎 «Я найкращий, і всі це знають»'), f: () => { S.fameBonus = (S.fameBonus || 0) + 3; eff({ karma: -2 }); if (chance(0.5)) { sp.rating = clamp(sp.rating - 3); return T3('Цитату разобрали на мемы, а соперник завёлся. Давление растёт.', 'The quote became a meme and your rival is fired up. The pressure is on.', 'Цитату розібрали на меми, а суперник завівся. Тиск зростає.'); } return T3('Дерзко! Половина болельщиков в восторге.', 'Bold! Half the fans love it.', 'Зухвало! Половина вболівальників у захваті.'); } },
    { t: T3('🤐 Отказаться от вопросов', '🤐 Decline to answer', '🤐 Відмовитися від запитань'), f: () => T3('Вы молча ушли. Журналисты обиделись.', 'You left in silence. The reporters were offended.', 'Ви мовчки пішли. Журналісти образилися.') }] }); pump(); } });
  if (sp.lvl >= 2 && !sp.spons && !spSovAm() && S.year >= 1920) item(l, { e: '🤝', t: T3('Спонсорский контракт', 'Sponsorship deal', 'Спонсорський контракт'), d: T3('Реклама в обмен на деньги', 'Endorsements for money', 'Реклама в обмін на гроші'), disabled: S.used.sp_spons, onClick: () => {
    S.used.sp_spons = 1; const brands = SPONSORS(S.year).slice().sort(() => Math.random() - 0.5).slice(0, 2);
    Q.push({ e: '🤝', title: T3('Предложения спонсоров', 'Sponsor offers', 'Пропозиції спонсорів'), text: T3('Ваш агент получил письма от брендов.', 'Your agent got letters from brands.', 'Ваш агент отримав листи від брендів.'), choices: brands.map((bb) => { const b = T3(bb[0], bb[1], bb[2]); const sum = Math.round(price(rnd(2, 8) * 100000) * (sp.lvl >= 3 ? 3 : 1) * (S.year < 1970 ? 0.3 : 1)); const yrsN = rnd(2, 4); return { t: `${b} · ${fmt(sum)} × ${yrsN}`, f: () => { sp.spons = { n: b, sum, left: yrsN }; if (bb[0].startsWith('табак')) eff({ karma: -3 }); unlock('sponsor'); return T3(`🤝 Вы стали лицом рекламы: ${b}. Ваше фото на щитах по всему городу.`, `🤝 You are now the face of ${b}. Your photo is on billboards all over town.`, `🤝 Ви стали обличчям реклами: ${b}. Ваше фото на щитах по всьому місту.`); } }; }).concat([{ t: T3('Отказаться', 'Decline', 'Відмовитися'), f: () => null }]) }); pump();
  } });
  const foreignTop = { football: ['gb', 'es', 'it', 'de', 'fr'], hockey: ['us', 'ca'], basket: ['us', 'es'], box: ['us'], cycle: ['fr', 'it', 'es'], esport: ['kr', 'us', 'cn'] }[sp.id];
  if (sp.lvl >= 3 && foreignTop && !sp.abroad && !spSovAm()) item(l, { e: '✈️', t: T3('Перейти в зарубежный клуб', 'Move to a club abroad', 'Перейти в закордонний клуб'), d: T3('Сильнейшие лиги мира · контракт ×1.8', 'The strongest leagues · contract ×1.8', 'Найсильніші ліги світу · контракт ×1.8'), disabled: S.used.sp_abroad, onClick: () => {
    S.used.sp_abroad = 1; const opts = foreignTop.filter((x) => x !== S.country).map((id) => COUNTRIES.find((c) => c.id === id)).filter(Boolean);
    if (!opts.length) { toast(T3('Вы уже в сильнейшей лиге', 'You already play in the top league', 'Ви вже в найсильнішій лізі')); return; }
    Q.push({ e: '✈️', title: T3('Легионер', 'Moving abroad', 'Легіонер'), text: T3('Скауты из-за границы следят за вами. Куда?', 'Foreign scouts are watching you. Where to?', 'Скаути з-за кордону стежать за вами. Куди?'), choices: opts.map((co) => { const club = sportClub(co.id); return { t: `${co.flag} ${club}`, f: () => { sp.abroad = co.id; sp.club = club; if (!S.visited.includes(co.id)) S.visited.push(co.id); eff({ happy: 10 }); unlock('legionnaire'); return T3(`✈️ Вы переехали и играете за «${club}». Новый язык, новая жизнь.`, `✈️ You moved abroad and now play for ${club}. A new language, a new life.`, `✈️ Ви переїхали й граєте за «${club}». Нова мова, нове життя.`); } }; }).concat([{ t: T3('Остаться дома', 'Stay home', 'Залишитися вдома'), f: () => null }]) }); pump();
  } });
  if (sp.abroad) item(l, { e: '🏠', t: T3('Вернуться в родную лигу', 'Return to your home league', 'Повернутися до рідної ліги'), d: T3('Ближе к семье', 'Closer to family', 'Ближче до родини'), onClick: act(() => { sp.abroad = null; sp.club = sportClub(); return T3(`🏠 Вы вернулись домой и играете за «${sp.club}».`, `🏠 You came home and now play for ${sp.club}.`, `🏠 Ви повернулися додому й граєте за «${sp.club}».`); }) });
  item(l, { e: '🧒', t: T3('Мастер-класс для детей', 'Kids\' masterclass', 'Майстер-клас для дітей'), d: T3('+карма, +слава', '+karma, +fame', '+карма, +слава'), disabled: S.used.sp_kids || sp.lvl < 2, onClick: act(() => { S.used.sp_kids = 1; eff({ karma: 5, happy: 4 }); S.fameBonus = (S.fameBonus || 0) + 1; return T3('🧒 Сто детей пришли посмотреть на вас. Один сказал, что станет как вы.', '🧒 A hundred kids came to see you. One said he wants to be just like you.', '🧒 Сто дітей прийшли подивитися на вас. Один сказав, що стане таким, як ви.'); }) });
};

/* ---------- Жизнь после спорта ---------- */
function afterSportPanel(sp) {
  const l = section(T3('После спорта', 'After sport', 'Після спорту'));
  item(l, { e: '🧑‍🏫', t: sp.coachJob ? T3('Вы работаете тренером', 'You are a coach', 'Ви працюєте тренером') : T3('Стать тренером', 'Become a coach', 'Стати тренером'), d: T3('Зарплата и ученики', 'Salary and students', 'Зарплата й учні'), disabled: !!sp.coachJob || S.prison, onClick: act(() => { sp.coachJob = S.year; unlock('mentor0'); return T3(`🧑‍🏫 Вы начали тренировать. ${sportDef().n}: теперь вы по другую сторону.`, `🧑‍🏫 You started coaching. You are on the other side now.`, `🧑‍🏫 Ви почали тренувати. Тепер ви по інший бік.`); }) });
  item(l, { e: '🏫', t: T3('Открыть спортивную школу', 'Open a sports academy', 'Відкрити спортивну школу'), d: fmt(price(3000000)), disabled: !!sp.school || S.money < price(3000000) || (SP_SOV.includes(S.country) && S.year < 1988), onClick: act(() => { S.money -= price(3000000); sp.school = S.year; eff({ karma: 8, happy: 8 }); return T3('🏫 Ваша спортивная школа открылась. Очередь из родителей с детьми у дверей.', '🏫 Your sports academy has opened. Parents with kids are lining up at the door.', '🏫 Ваша спортивна школа відкрилася. Черга з батьків із дітьми біля дверей.'); }) });
  item(l, { e: '📖', t: T3('Написать мемуары', 'Write your memoir', 'Написати мемуари'), d: T3('Деньги и слава', 'Money and fame', 'Гроші й слава'), disabled: !!sp.memoir || sp.lvl < 2, onClick: act(() => { sp.memoir = S.year; const g = Math.round(price(sp.lvl * 400000) * (sp.gold + 1)); S.money += g; S.fameBonus = (S.fameBonus || 0) + 2; return T3(`📖 Книга о вашей карьере стала бестселлером. Гонорар: ${fmt(g)}.`, `📖 Your sports memoir became a bestseller. Advance: ${fmt(g)}.`, `📖 Книга про вашу кар'єру стала бестселером. Гонорар: ${fmt(g)}.`); }) });
  if (sp.lvl >= 4 && !sp.hof) item(l, { e: '🏛️', t: T3('Зал славы', 'Hall of Fame', 'Зала слави'), d: T3('Церемония включения', 'Induction ceremony', 'Церемонія включення'), onClick: act(() => { sp.hof = S.year; eff({ happy: 15 }); unlock('halloffame'); return T3('🏛️ Ваше имя внесено в Зал славы. Зал аплодирует стоя.', '🏛️ You were inducted into the Hall of Fame to a standing ovation.', '🏛️ Ваше ім\'я внесено до Зали слави. Зала аплодує стоячи.'); }) });
  if (S.year >= 1950) item(l, { e: '🎙️', t: T3('Комментировать матчи', 'Commentate games', 'Коментувати матчі'), d: S.year < 1960 ? T3('На радио', 'On the radio', 'На радіо') : T3('На телевидении', 'On TV', 'На телебаченні'), disabled: S.used.sp_comm, onClick: act(() => { S.used.sp_comm = 1; const g = price(150000 * Math.max(1, sp.lvl)); S.money += g; S.fameBonus = (S.fameBonus || 0) + 1; return T3(`🎙️ Ваш репортаж о финале разошёлся на цитаты. Гонорар: ${fmt(g)}.`, `🎙️ Your commentary on the final is being quoted everywhere. Fee: ${fmt(g)}.`, `🎙️ Ваш репортаж про фінал розійшовся на цитати. Гонорар: ${fmt(g)}.`); }) });
}

ACHIEVEMENTS.push(
  { id: 'clutch', e: '🔥', t: 'Человек-момент', d: 'Решить исход пяти ключевых моментов' }, { id: 'cupcollector', e: '🏆', t: 'Коллекционер кубков', d: 'Выиграть пять именных турниров' },
  { id: 'captain', e: '🅲', t: 'Капитан', d: 'Стать капитаном команды' }, { id: 'sponsor', e: '🤝', t: 'Лицо бренда', d: 'Подписать спонсорский контракт' },
  { id: 'legionnaire', e: '✈️', t: 'Легионер', d: 'Перейти в зарубежный клуб' }, { id: 'mentor0', e: '🧑‍🏫', t: 'Тренер', d: 'Стать тренером после карьеры' },
  { id: 'mentor', e: '🎓', t: 'Наставник чемпионов', d: 'Воспитать трёх чемпионов страны' }, { id: 'halloffame', e: '🏛️', t: 'Зал славы', d: 'Попасть в Зал славы' }
);
