'use strict';
/* ===================== Мини-игры, музыка эпох, праздники ===================== */

/* общий помощник: завершить мини-игру из-за пределов кнопок модалки */
function miniDone(text, cls = '') {
  closeModal(); if (!S) return;
  log(text, cls); toast(text.length > 70 ? text.slice(0, 68) + '…' : text);
  checkAch(); save(); render(); scrollLog(); refreshSheet(); pump();
}
/* модалка может вызвать свой onShow после отрисовки */
const _showModalF = showModal;
showModal = function (m) { _showModalF(m); if (m && m.onShow) try { m.onShow(); } catch (e) { console.error(e); } };

/* ====================== ♟️ ШАХМАТЫ ====================== */
const CH_V = { P: 100, N: 300, B: 320, R: 500, Q: 900, K: 20000 };
const CH_G = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };
const CH_START = () => {
  const b = Array(64).fill('');
  const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let c = 0; c < 8; c++) { b[c] = 'b' + back[c]; b[8 + c] = 'bP'; b[48 + c] = 'wP'; b[56 + c] = 'w' + back[c]; }
  return b;
};
function chMoves(b, side) {
  const out = []; const opp = side === 'w' ? 'b' : 'w';
  const add = (f, t) => { if (t >= 0 && t < 64 && (!b[t] || b[t][0] === opp)) out.push([f, t]); };
  for (let i = 0; i < 64; i++) {
    const p = b[i]; if (!p || p[0] !== side) continue;
    const r = i >> 3, c = i & 7, t = p[1];
    if (t === 'P') {
      const d = side === 'w' ? -1 : 1, one = i + d * 8;
      if (one >= 0 && one < 64 && !b[one]) { out.push([i, one]); const two = one + d * 8; if (r === (side === 'w' ? 6 : 1) && !b[two]) out.push([i, two]); }
      for (const dc of [-1, 1]) { const cc = c + dc, rr = r + d; if (cc < 0 || cc > 7 || rr < 0 || rr > 7) continue; const x = rr * 8 + cc; if (b[x] && b[x][0] === opp) out.push([i, x]); }
    } else if (t === 'N' || t === 'K') {
      const offs = t === 'N' ? [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]] : [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      for (const [dr, dc] of offs) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) add(i, rr * 8 + cc); }
    } else {
      const dirs = t === 'B' ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : t === 'R' ? [[-1, 0], [1, 0], [0, -1], [0, 1]] : [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let rr = r + dr, cc = c + dc;
        while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) { const x = rr * 8 + cc; if (!b[x]) out.push([i, x]); else { if (b[x][0] === opp) out.push([i, x]); break; } rr += dr; cc += dc; }
      }
    }
  }
  return out;
}
function chApply(b, m) {
  const n = b.slice(); const p = n[m[0]]; n[m[1]] = p; n[m[0]] = '';
  if (p[1] === 'P' && (m[1] < 8 || m[1] >= 56)) n[m[1]] = p[0] + 'Q';
  return n;
}
function chAttacked(b, sq, by) { return chMoves(b, by).some((m) => m[1] === sq); }
function chInCheck(b, side) { const k = b.indexOf(side + 'K'); return k < 0 || chAttacked(b, k, side === 'w' ? 'b' : 'w'); }
function chLegal(b, side) { return chMoves(b, side).filter((m) => !chInCheck(chApply(b, m), side)); }
function chEval(b) { // + в пользу чёрных (ИИ)
  let s = 0;
  for (let i = 0; i < 64; i++) {
    const p = b[i]; if (!p) continue;
    let v = CH_V[p[1]]; const r = i >> 3, c = i & 7;
    if (p[1] === 'N' || p[1] === 'B') v += 12 - (Math.abs(3.5 - r) + Math.abs(3.5 - c)) * 4;
    if (p[1] === 'P') v += (p[0] === 'b' ? r : 7 - r) * 6 + (c > 1 && c < 6 ? 4 : 0);
    s += p[0] === 'b' ? v : -v;
  }
  return s;
}
function chSearch(b, depth, side, alpha, beta) {
  if (b.indexOf('wK') < 0) return side === 'b' ? 50000 : -50000;
  if (b.indexOf('bK') < 0) return side === 'b' ? -50000 : 50000;
  if (!depth) return side === 'b' ? chEval(b) : -chEval(b);
  const ms = chMoves(b, side); if (!ms.length) return 0;
  ms.sort((x, y) => (b[y[1]] ? CH_V[b[y[1]][1]] : 0) - (b[x[1]] ? CH_V[b[x[1]][1]] : 0));
  const opp = side === 'w' ? 'b' : 'w';
  for (const m of ms) { const v = -chSearch(chApply(b, m), depth - 1, opp, -beta, -alpha); if (v > alpha) alpha = v; if (alpha >= beta) break; }
  return alpha;
}
function chAI(b, lvl) {
  const ms = chLegal(b, 'b'); if (!ms.length) return null;
  let best = null, bv = -Infinity;
  for (const m of ms) { const v = -chSearch(chApply(b, m), lvl.depth - 1, 'w', -Infinity, Infinity) + Math.random() * lvl.noise; if (v > bv) { bv = v; best = m; } }
  return best;
}
const CHESS_OPP = [
  { e: '🧒', t: 'Сосед по двору', depth: 1, noise: 160, elo: 700, prize: 0 },
  { e: '♟️', t: 'Клубный шахматист', depth: 2, noise: 45, elo: 1300, prize: 15000 },
  { e: '🏆', t: 'Гроссмейстер', depth: 3, noise: 8, elo: 2500, prize: 250000 }
];
function openChess() {
  closeSheet();
  S.elo = S.elo || 800;
  Q.push({ e: '♟️', title: 'Шахматы', text: `Ваш рейтинг: ${S.elo}. С кем сыграем? Вы играете белыми.\nПравила упрощены: без рокировки и взятия на проходе.`, choices: CHESS_OPP.map((o) => ({ t: `${o.e} ${o.t} · ~${o.elo}`, f: () => { chessGame(o); return null; } })).concat([{ t: 'Не сейчас', f: () => null }]) });
  pump();
}
function chessGame(opp) {
  let b = CH_START(), sel = -1, targets = [], plies = 0, busy = false, last = null;
  const draw = () => {
    const B = document.getElementById('chessB'); if (!B) return;
    B.innerHTML = '';
    for (let i = 0; i < 64; i++) {
      const p = b[i]; const r = i >> 3, c = i & 7;
      const sq = document.createElement('button'); sq.type = 'button';
      sq.className = 'sq ' + ((r + c) % 2 ? 'dk' : 'lt') + (i === sel ? ' sel' : '') + (targets.includes(i) ? ' tg' : '') + (last && (last[0] === i || last[1] === i) ? ' last' : '');
      if (p) sq.innerHTML = `<span class="pc ${p[0]}">${CH_G[p[1]]}︎</span>`;
      sq.onclick = () => click(i);
      B.appendChild(sq);
    }
  };
  const msg = (t) => { const m = document.getElementById('chessMsg'); if (m) m.textContent = t; };
  const end = (res) => {
    busy = true;
    setTimeout(() => {
      if (!document.getElementById('chessB')) return;
      const d = Math.round((opp.elo - S.elo) / 25);
      if (res === 'win') {
        S.elo = Math.max(100, S.elo + clamp(20 + d, 5, 60)); eff({ happy: 12, smarts: 3 });
        let pz = ''; if (opp.prize && S.age >= 14) { const g = price(opp.prize); S.money += g; pz = ` Приз: ${fmt(g)}.`; }
        if (opp.depth === 3) unlock('chessgm'); unlock('chesswin'); S.chessWins = (S.chessWins || 0) + 1;
        sfx('ach'); miniDone(`♟️ Мат! Вы победили: ${opp.t.toLowerCase()}. Рейтинг ${S.elo}.${pz}`, 'good');
      } else if (res === 'draw') { S.elo += clamp(Math.round(d / 2), -10, 20); eff({ happy: 3, smarts: 2 }); miniDone(`♟️ Ничья с соперником (${opp.t.toLowerCase()}). Рейтинг ${S.elo}.`); }
      else { S.elo = Math.max(100, S.elo - clamp(20 - d, 4, 40)); eff({ happy: -4, smarts: 1 }); miniDone(`♟️ Поражение: ${opp.t.toLowerCase()} оказался сильнее. Рейтинг ${S.elo}.`, 'bad'); }
    }, 700);
  };
  const after = (side) => {
    const ms = chLegal(b, side);
    if (!ms.length) { if (chInCheck(b, side)) { msg(side === 'b' ? 'Мат! Вы победили 🎉' : 'Вам поставили мат.'); end(side === 'b' ? 'win' : 'lose'); } else { msg('Пат. Ничья.'); end('draw'); } return true; }
    if (plies >= 150) { const e = chEval(b); msg('Партия затянулась, засчитано по материалу.'); end(e < -250 ? 'win' : e > 250 ? 'lose' : 'draw'); return true; }
    if (!b.some((p) => p && p[1] !== 'K')) { msg('Остались одни короли. Ничья.'); end('draw'); return true; }
    if (chInCheck(b, side)) msg(side === 'w' ? 'Вам шах!' : 'Шах!');
    return false;
  };
  const click = (i) => {
    if (busy) return;
    if (b[i] && b[i][0] === 'w') { sel = i; targets = chLegal(b, 'w').filter((m) => m[0] === i).map((m) => m[1]); draw(); return; }
    if (sel >= 0 && targets.includes(i)) {
      b = chApply(b, [sel, i]); last = [sel, i]; sel = -1; targets = []; plies++; sfx('click'); draw(); msg('Соперник думает…');
      if (after('b')) return;
      busy = true;
      setTimeout(() => {
        if (!document.getElementById('chessB')) return;
        const m = chAI(b, opp); if (m) { b = chApply(b, m); last = m; plies++; }
        busy = false; draw(); msg('Ваш ход'); after('w');
      }, 220);
    }
  };
  Q.unshift({ e: opp.e, title: `Партия: ${opp.t}`, html: '<div class="chess" id="chessB"></div><div class="muted" id="chessMsg">Ваш ход. Нажмите на фигуру, затем на клетку.</div>', onShow: draw, choices: [{ t: '🏳️ Сдаться', cls: 'ghost', f: () => { S.elo = Math.max(100, S.elo - 15); eff({ happy: -3 }); return `♟️ Вы сдались в партии с соперником (${opp.t.toLowerCase()}).`; } }] });
}

/* ====================== 🧠 ВИКТОРИНА ====================== */
const QUIZ_TV = [
  ['Сколько дней в високосном году?', ['365', '366', '364', '360'], 1, 1], ['Какая планета ближе всех к Солнцу?', ['Венера', 'Марс', 'Меркурий', 'Земля'], 2, 1],
  ['Столица Японии?', ['Киото', 'Осака', 'Сеул', 'Токио'], 3, 1], ['Сколько ног у паука?', ['6', '8', '10', '12'], 1, 1],
  ['Какой цвет получится из синего и жёлтого?', ['Зелёный', 'Фиолетовый', 'Оранжевый', 'Коричневый'], 0, 1], ['Самый большой океан Земли?', ['Атлантический', 'Индийский', 'Тихий', 'Северный Ледовитый'], 2, 1],
  ['Кто написал «Евгения Онегина»?', ['Лермонтов', 'Пушкин', 'Гоголь', 'Толстой'], 1, 1], ['Сколько секунд в одном часе?', ['360', '1200', '3600', '6000'], 2, 1],
  ['Какое животное называют «кораблём пустыни»?', ['Верблюд', 'Лошадь', 'Слон', 'Страус'], 0, 1], ['В какой стране находятся пирамиды Гизы?', ['Мексика', 'Ирак', 'Египет', 'Судан'], 2, 1],
  ['Какой газ растения поглощают при фотосинтезе?', ['Кислород', 'Азот', 'Водород', 'Углекислый газ'], 3, 1], ['Сколько цветов у радуги?', ['5', '6', '7', '8'], 2, 1],
  ['Химический символ золота?', ['Ag', 'Au', 'Gd', 'Go'], 1, 2], ['Кто написал «Войну и мир»?', ['Достоевский', 'Чехов', 'Толстой', 'Тургенев'], 2, 2],
  ['Самая длинная река Европы?', ['Дунай', 'Волга', 'Днепр', 'Рейн'], 1, 2], ['В каком году Гагарин полетел в космос?', ['1957', '1961', '1965', '1969'], 1, 2],
  ['Столица Австралии?', ['Сидней', 'Мельбурн', 'Канберра', 'Перт'], 2, 2], ['Какой орган вырабатывает инсулин?', ['Печень', 'Почки', 'Селезёнка', 'Поджелудочная железа'], 3, 2],
  ['Кто написал «Мону Лизу»?', ['Микеланджело', 'Рафаэль', 'Леонардо да Винчи', 'Боттичелли'], 2, 2], ['Самая высокая гора мира?', ['Эверест', 'К2', 'Эльбрус', 'Килиманджаро'], 0, 2],
  ['Самая маленькая страна мира?', ['Монако', 'Ватикан', 'Сан-Марино', 'Лихтенштейн'], 1, 2], ['Сколько игроков одной команды на футбольном поле?', ['9', '10', '11', '12'], 2, 2],
  ['Кто открыл закон всемирного тяготения?', ['Галилей', 'Ньютон', 'Кеплер', 'Эйнштейн'], 1, 2], ['Сколько струн у классической гитары?', ['4', '5', '6', '7'], 2, 2],
  ['Какая валюта в Японии?', ['Юань', 'Вона', 'Иена', 'Бат'], 2, 2], ['Сколько часовых поясов в России?', ['7', '9', '11', '13'], 2, 2],
  ['Сколько костей в теле взрослого человека?', ['186', '206', '226', '256'], 1, 3], ['Кто автор «Мастера и Маргариты»?', ['Пастернак', 'Набоков', 'Булгаков', 'Шолохов'], 2, 3],
  ['Скорость света в вакууме примерно равна…', ['30 000 км/с', '150 000 км/с', '300 000 км/с', '1 000 000 км/с'], 2, 3], ['В каком году пала Берлинская стена?', ['1985', '1987', '1989', '1991'], 2, 3],
  ['Кто открыл периодический закон химических элементов?', ['Ломоносов', 'Менделеев', 'Бутлеров', 'Лавуазье'], 1, 3], ['У какой планеты самые длинные сутки?', ['Меркурий', 'Венера', 'Юпитер', 'Марс'], 1, 3],
  ['Столица Канады?', ['Торонто', 'Монреаль', 'Ванкувер', 'Оттава'], 3, 3], ['Самое глубокое озеро мира?', ['Танганьика', 'Байкал', 'Каспийское', 'Верхнее'], 1, 3],
  ['Кто написал музыку балета «Лебединое озеро»?', ['Римский-Корсаков', 'Мусоргский', 'Чайковский', 'Рахманинов'], 2, 3], ['Сколько хромосом в клетке человека?', ['23', '44', '46', '48'], 2, 3],
  ['Какой металл жидкий при комнатной температуре?', ['Галлий', 'Ртуть', 'Олово', 'Свинец'], 1, 3], ['Кто первым ступил на Луну?', ['Базз Олдрин', 'Юрий Гагарин', 'Нил Армстронг', 'Джон Гленн'], 2, 3],
  ['Как называется наука о грибах?', ['Миология', 'Микология', 'Фикология', 'Бриология'], 1, 3], ['Какая страна подарила США Статую Свободы?', ['Великобритания', 'Франция', 'Испания', 'Нидерланды'], 1, 3],
  ['Сколько сердец у осьминога?', ['1', '2', '3', '8'], 2, 3], ['В каком году началась Первая мировая война?', ['1905', '1912', '1914', '1918'], 2, 3],
  ['Какой элемент самый распространённый во Вселенной?', ['Кислород', 'Гелий', 'Углерод', 'Водород'], 3, 3], ['Какой город раньше назывался Константинополь?', ['Афины', 'Стамбул', 'Каир', 'Рим'], 1, 3]
];
const QUIZ_LADDER = [1000, 2000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
function openQuiz() {
  closeSheet();
  const pool = (d, n) => QUIZ_TV.filter((q) => q[3] === d).sort(() => Math.random() - 0.5).slice(0, n);
  const qs = [...pool(1, 3), ...pool(2, 4), ...pool(3, 3)];
  const st = { i: 0, fifty: true, friend: true, hall: true };
  const prize = (i) => price(QUIZ_LADDER[i]);
  const safe = (i) => (i >= 5 ? prize(4) : 0);
  const finish = (won, text, cls) => { if (won > 0) S.money += won; S.quizBest = Math.max(S.quizBest || 0, st.i); if (st.i >= 10) unlock('quizking'); eff({ happy: won > 0 ? 8 : -3, smarts: 2 }); return text + (won > 0 ? ` Выигрыш: ${fmt(won)}.` : ''); };
  const ask = (hide = [], hint = '') => {
    const q = qs[st.i];
    const ladder = QUIZ_LADDER.map((_, j) => `<span class="${j === st.i ? 'on' : j < st.i ? 'ok' : ''}${j === 4 ? ' safe' : ''}">${fmt(prize(j))}</span>`).reverse().join('');
    Q.unshift({ e: '🧠', title: `Вопрос ${st.i + 1} из 10 · ${fmt(prize(st.i))}`, html: `<div class="quiz-q">${esc(q[0])}</div>${hint ? `<div class="quiz-hint">${esc(hint)}</div>` : ''}<div class="quiz-ladder">${ladder}</div>`, choices: [
      ...q[1].map((a, k) => ({ t: `${'ABCD'[k]}: ${a}`, cls: 'ghost', disabled: hide.includes(k), f: () => {
        if (k === q[2]) { sfx('good'); st.i++; if (st.i >= 10) return finish(prize(9), '🏆 Вы ответили на все 10 вопросов! Главный приз ваш!'); ask(); return null; }
        sfx('bad'); return finish(safe(st.i), `🧠 Неверно! Правильный ответ: ${q[1][q[2]]}.`);
      } })),
      ...(st.fifty ? [{ t: '✂️ 50 на 50', cls: 'ghost', f: () => { st.fifty = false; const wrong = [0, 1, 2, 3].filter((k) => k !== q[2]).sort(() => Math.random() - 0.5).slice(0, 2); ask(wrong); return null; } }] : []),
      ...(st.friend ? [{ t: '📞 Звонок другу', cls: 'ghost', f: () => { st.friend = false; const ok = chance(0.55 + S.stats.smarts / 400); const a = ok ? q[2] : rnd(0, 3); const fr = S.people.find((p) => p.role === 'friend' && p.alive); ask(hide, `${fr ? fr.name : 'Друг'}: «Думаю, это ${q[1][a]}… ${ok ? 'почти уверен' : 'но это не точно'}».`); return null; } }] : []),
      ...(st.hall ? [{ t: '👥 Помощь зала', cls: 'ghost', f: () => { st.hall = false; const v = [0, 0, 0, 0]; let left = 100; const cw = rnd(35, 70) - q[3] * 8; v[q[2]] = cw; left -= cw; [0, 1, 2, 3].filter((k) => k !== q[2]).forEach((k, j, a) => { const x = j === a.length - 1 ? left : rnd(0, left); v[k] = x; left -= x; }); ask(hide, `Зал: ${v.map((x, k) => `${'ABCD'[k]} ${x}%`).join(' · ')}`); return null; } }] : []),
      ...(st.i > 0 ? [{ t: `💰 Забрать ${fmt(prize(st.i - 1))}`, cls: 'ghost', f: () => finish(prize(st.i - 1), '🧠 Вы забрали деньги и ушли из игры.') }] : [])
    ] });
  };
  Q.push({ e: '🧠', title: 'Телевикторина «Эрудит»', text: `10 вопросов, главный приз ${fmt(prize(9))}. Несгораемая сумма: ${fmt(prize(4))}. Три подсказки. Готовы?`, choices: [{ t: 'Играть!', f: () => { ask(); return null; } }, { t: 'Не сейчас', f: () => null }] });
  pump();
}

/* ====================== 🏎️ ГОНКИ ====================== */
function openRace() {
  closeSheet();
  const car = S.assets.find((a) => a.type === 'car');
  const kinds = [
    { id: 'kart', e: '🏁', t: 'Картинг', d: 'Безопасно и весело', fee: 3000, prize: 20000, risk: 0.02, min: 8 },
    { id: 'pro', e: '🏎️', t: 'Любительский чемпионат', d: 'Взнос и призовые', fee: 50000, prize: 400000, risk: 0.05, min: 18, yr: 1920 },
    { id: 'street', e: '🌃', t: 'Ночные уличные гонки', d: car ? `На вашей машине: ${car.name}. Нелегально!` : 'Нужна своя машина', fee: 0, prize: 300000, risk: 0.12, min: 16, need: !car, illegal: true, yr: 1950 }
  ].filter((k) => S.age >= k.min && (!k.yr || S.year >= k.yr));
  if (!kinds.length) { Q.push({ e: '🏁', title: 'Гонки', text: 'Пока рановато для гонок. Подрастите!' }); pump(); return; }
  Q.push({ e: '🏎️', title: 'Гонки', text: `Навык вождения: ${S.raceSkill || 0}/100.`, choices: kinds.map((k) => ({ t: `${k.e} ${k.t}${k.fee ? ` · ${fmt(price(k.fee))}` : ''}`, disabled: k.need || (k.fee && S.money < price(k.fee)), f: () => { raceGo(k, car); return null; } })).concat([{ t: 'Не сейчас', f: () => null }]) });
  pump();
}
function raceGo(k, car) {
  if (k.fee) S.money -= price(k.fee);
  const st = { lap: 0, pos: rnd(4, 7), tyres: 0, n: 8 };
  const carBonus = car ? Math.min(12, Math.log10(Math.max(10, car.value)) * 1.6 - 6) : 0;
  const skill = () => (S.raceSkill || 0) / 100 * 0.35 + S.stats.health / 400 + (k.id === 'street' ? carBonus / 60 : 0);
  const lap = (note = '') => {
    st.lap++;
    Q.unshift({ e: '🏎️', title: `${k.t} · круг ${st.lap} из 3`, html: `${note ? `<div class="race-note">${esc(note)}</div>` : ''}<div class="race-track">${Array.from({ length: st.n }, (_, i) => `<span class="${i + 1 === st.pos ? 'me' : ''}">${i + 1 === st.pos ? '🚗' : '🚙'}</span>`).join('')}</div><div class="muted">Вы на ${st.pos}-м месте из ${st.n}</div>`, choices: [
      { t: '🚀 Атаковать', f: () => step(0.32 + skill(), 2, k.risk * 1.6) },
      { t: '➡️ Держать темп', f: () => step(0.22 + skill() * 0.7, 1, k.risk * 0.6) },
      { t: '🛞 Беречь шины', f: () => { st.tyres = 0.15; return step(0.1, 1, k.risk * 0.2); } }
    ] });
  };
  const step = (pGain, maxGain, crash) => {
    if (chance(Math.max(0.01, crash - (S.raceSkill || 0) / 1000))) {
      const dmg = rnd(5, 25); eff({ health: -dmg, happy: -10 });
      if (k.illegal && car) car.value = Math.round(car.value * 0.6);
      S.raceSkill = clamp((S.raceSkill || 0) + 2);
      if (k.illegal && chance(0.004)) { die('Авария на уличных гонках'); return '💥 Смертельная авария на ночной трассе.'; }
      return `💥 Авария на ${st.lap}-м круге! Здоровье −${dmg}.${k.illegal && car ? ' Машина разбита.' : ''}`;
    }
    const b = st.tyres; st.tyres = 0;
    if (chance(pGain + b)) st.pos = Math.max(1, st.pos - rnd(1, maxGain)); else if (chance(0.35)) st.pos = Math.min(st.n, st.pos + 1);
    if (st.lap < 3) { lap(pick(['Соперник прижимает к бортику!', 'Впереди крутой поворот.', 'Пошёл дождь, трасса скользкая.', 'Толпа ревёт на трибунах!', 'Вы видите просвет для обгона.'])); return null; }
    S.raceSkill = clamp((S.raceSkill || 0) + rnd(2, 5));
    if (k.illegal && chance(0.18)) { S.money -= price(30000); eff({ karma: -3 }); return `🚓 Полиция накрыла гонку! Штраф ${fmt(price(30000))}. Вы финишировали ${st.pos}-м.`; }
    const pr = st.pos === 1 ? price(k.prize) : st.pos === 2 ? price(k.prize * 0.4) : st.pos === 3 ? price(k.prize * 0.2) : 0;
    S.money += pr; eff({ happy: st.pos <= 3 ? 12 : 3 });
    if (st.pos === 1) { unlock('racer'); S.raceWins = (S.raceWins || 0) + 1; sfx('ach'); }
    return `${st.pos === 1 ? '🏆 Победа' : st.pos <= 3 ? `🥈 ${st.pos}-е место` : `🏁 ${st.pos}-е место`} в гонке «${k.t}»${pr ? `. Призовые: ${fmt(pr)}` : ''}.`;
  };
  lap('Старт! Моторы ревут.');
}

/* ====================== 🎣 РЫБАЛКА ====================== */
const FISH = [
  { e: '🐟', n: 'Плотва', w: [0.1, 0.4], p: 150, r: 30 }, { e: '🐟', n: 'Окунь', w: [0.2, 1.2], p: 300, r: 25 }, { e: '🐠', n: 'Карась', w: [0.2, 1.5], p: 250, r: 22 },
  { e: '🐟', n: 'Лещ', w: [0.5, 3], p: 500, r: 14 }, { e: '🐊', n: 'Щука', w: [1, 9], p: 1200, r: 9 }, { e: '🐟', n: 'Судак', w: [1, 6], p: 1500, r: 7 },
  { e: '🐋', n: 'Сом', w: [5, 60], p: 3000, r: 3 }, { e: '🥾', n: 'Старый ботинок', w: [0.5, 1], p: 0, r: 6 }, { e: '🐡', n: 'Золотая рыбка', w: [0.05, 0.1], p: 0, r: 0.5, gold: true }
];
const FISH_SEA = [
  { e: '🐟', n: 'Скумбрия', w: [0.3, 1.5], p: 600, r: 25 }, { e: '🐠', n: 'Дорадо', w: [1, 8], p: 2500, r: 12 }, { e: '🦑', n: 'Кальмар', w: [0.3, 2], p: 900, r: 12 },
  { e: '🐟', n: 'Тунец', w: [10, 120], p: 9000, r: 4 }, { e: '🗡️', n: 'Марлин', w: [50, 400], p: 30000, r: 1.2 }, { e: '🦈', n: 'Акула', w: [30, 300], p: 0, r: 1, shark: true }, { e: '🐡', n: 'Золотая рыбка', w: [0.05, 0.1], p: 0, r: 0.4, gold: true }
];
function openFishing() {
  closeSheet();
  const spots = [
    { e: '🏞️', t: 'Речка у дома', pool: FISH, cost: 0, mult: 1 },
    { e: '🛶', t: 'Озеро на лодке', pool: FISH.filter((f) => f.n !== 'Плотва'), cost: 2000, mult: 1.3 },
    { e: '❄️', t: 'Зимняя рыбалка на льду', pool: FISH.filter((f) => !['Сом', 'Карась'].includes(f.n)), cost: 1000, mult: 1.1, ice: true },
    { e: '🌊', t: 'Морская рыбалка на катере', pool: FISH_SEA, cost: 60000, mult: 1, min: 16 }
  ].filter((s) => !s.min || S.age >= s.min);
  Q.push({ e: '🎣', title: 'Рыбалка', text: `Рекорд: ${S.fishRec ? `${S.fishRec.n}, ${S.fishRec.w} кг` : 'пока нет'}. Куда поедем?`, choices: spots.map((s) => ({ t: `${s.e} ${s.t}${s.cost ? ` · ${fmt(price(s.cost))}` : ''}`, disabled: s.cost && S.age >= 18 && S.money < price(s.cost), f: () => { if (s.cost && S.age >= 18) S.money -= price(s.cost); fishGo(s); return null; } })).concat([{ t: 'Не сейчас', f: () => null }]) });
  pump();
}
function fishGo(spot) {
  const st = { casts: 5, catch: [], timer: null, bite: false, fish: null };
  const clear = () => { clearTimeout(st.timer); st.timer = null; };
  const ui = (t) => { const m = document.getElementById('fishMsg'); if (m) m.textContent = t; };
  const cast = () => {
    const btn = document.getElementById('fishHook'); const fl = document.getElementById('fishFloat'); if (!btn) return;
    if (st.casts <= 0) return done();
    st.casts--; st.bite = false; fl.className = 'fish-float'; btn.textContent = '🪝 Подсечь!';
    ui(`Заброс! Ждём поклёвку… Осталось забросов: ${st.casts}`);
    st.fish = wpick(spot.pool.map((f) => ({ v: f, w: f.r }))).v;
    st.timer = setTimeout(() => {
      if (!document.getElementById('fishHook')) return;
      st.bite = true; fl.className = 'fish-float bite'; ui('❗ Клюёт! Подсекайте!'); sfx('click');
      const win = Math.max(450, 1150 - (st.fish.w[1] > 20 ? 400 : st.fish.w[1] > 3 ? 200 : 0) + (S.fishSkill || 0) * 4);
      st.timer = setTimeout(() => { if (!document.getElementById('fishHook')) return; st.bite = false; fl.className = 'fish-float'; ui('Сорвалась… Рыба ушла.'); btn.textContent = '🎣 Забросить'; }, win);
    }, rnd(1200, 4200));
  };
  const hook = () => {
    const btn = document.getElementById('fishHook'); if (!btn) return;
    if (!st.timer && !st.bite) return cast();
    if (!st.bite) { clear(); ui('Слишком рано, рыба испугалась.'); btn.textContent = '🎣 Забросить'; return; }
    clear(); st.bite = false; document.getElementById('fishFloat').className = 'fish-float';
    const f = st.fish; const w = Math.round(rf(f.w[0], f.w[1]) * spot.mult * 100) / 100;
    st.catch.push({ ...f, wt: w }); sfx('coin');
    S.fishSkill = clamp((S.fishSkill || 0) + 2);
    ui(`${f.e} Поймали: ${f.n}, ${w} кг!${f.gold ? ' Она просит отпустить её и обещает исполнить желание…' : f.shark ? ' Вы еле вытащили её и отпустили.' : ''}`);
    document.getElementById('fishBag').innerHTML = st.catch.map((x) => `<span title="${esc(x.n)}">${x.e}</span>`).join('');
    btn.textContent = st.casts > 0 ? '🎣 Забросить' : '🧺 Домой';
  };
  const done = () => {
    clear();
    const real = st.catch.filter((x) => !x.gold && !x.shark && x.p);
    const total = Math.round(real.reduce((s, x) => s + x.wt, 0) * 100) / 100;
    const value = price(Math.round(real.reduce((s, x) => s + x.p * x.wt, 0)));
    const best = st.catch.filter((x) => x.p || x.shark).sort((a, b) => b.wt - a.wt)[0];
    let rec = '';
    if (best && (!S.fishRec || best.wt > S.fishRec.w)) { S.fishRec = { n: best.n, w: best.wt }; rec = ` 🏅 Новый личный рекорд: ${best.n}, ${best.wt} кг!`; if (best.wt >= 50) unlock('bigfish'); }
    const gold = st.catch.some((x) => x.gold);
    if (gold) { eff({ happy: 20, karma: 5 }); S.money += price(rnd(100, 1000) * 1000); unlock('goldfish'); }
    eff({ happy: 4 + Math.min(10, st.catch.length * 2), health: 2 });
    if (value) S.money += value;
    miniDone(`🎣 Рыбалка: ${spot.t.toLowerCase()}. Улов: ${st.catch.length ? st.catch.map((x) => x.n.toLowerCase()).join(', ') : 'ничего'}${total ? ` (${total} кг, можно продать за ${fmt(value)})` : ''}.${gold ? ' 🐡 Желание исполнилось: на счёт упали деньги!' : ''}${rec}`, st.catch.length ? 'good' : '');
  };
  Q.unshift({ e: spot.e, title: spot.t, html: '<div class="fish-pond"><div class="fish-float" id="fishFloat">🔴</div></div><div class="muted" id="fishMsg">Нажмите «Забросить», дождитесь поклёвки и успейте подсечь.</div><div class="fish-bag" id="fishBag"></div><button class="btn primary" type="button" id="fishHook">🎣 Забросить</button>', onShow: () => { document.getElementById('fishHook').onclick = () => (st.casts <= 0 && !st.timer && !st.bite ? done() : hook()); }, choices: [{ t: '🧺 Смотать удочки', cls: 'ghost', f: () => { setTimeout(() => { if (!S) return; clear(); }, 0); const n = st.catch.filter((x) => x.p).length; if (n) { const v = price(Math.round(st.catch.filter((x) => x.p).reduce((s, x) => s + x.p * x.wt, 0))); S.money += v; eff({ happy: 4 }); return `🎣 Улов: ${n} ${plural(n, ['рыба', 'рыбы', 'рыб'])}, продано за ${fmt(v)}.`; } eff({ happy: 1 }); return '🎣 Посидели с удочкой на свежем воздухе.'; } }] });
  pump();
}

ACTIVITIES.push(
  { id: 'mg_chess', cat: 'Мини-игры', e: '♟️', t: 'Сыграть в шахматы', d: 'Настоящая партия против соперника', min: 6, run: () => { setTimeout(openChess, 30); return null; } },
  { id: 'mg_quiz', cat: 'Мини-игры', e: '🧠', t: 'Телевикторина «Эрудит»', d: '10 вопросов, главный приз и подсказки', min: 12, yr: 1955, run: () => { setTimeout(openQuiz, 30); return null; } },
  { id: 'mg_race', cat: 'Мини-игры', e: '🏎️', t: 'Гонки', d: 'Картинг, чемпионат или уличные заезды', min: 8, yr: 1910, run: () => { setTimeout(openRace, 30); return null; } },
  { id: 'mg_fish', cat: 'Мини-игры', e: '🎣', t: 'Рыбалка', d: 'Успейте подсечь, побейте рекорд', min: 5, run: () => { setTimeout(openFishing, 30); return null; } }
);

/* ====================== 🎵 МУЗЫКА ЭПОХ ====================== */
const MUSIC_KEY = 'lifesim_music';
const ERA_MUSIC = [
  { to: 1929, name: 'Граммофон: вальсы и рэгтайм', bpm: 96, beats: 3, wave: 'triangle', bass: 'sine', drums: false, prog: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]], swing: 0, crackle: true },
  { to: 1959, name: 'Свинг и джаз-бэнды', bpm: 118, beats: 4, wave: 'sine', bass: 'triangle', drums: 'brush', prog: [[62, 65, 69, 72], [67, 71, 74, 77], [60, 64, 67, 71], [57, 60, 64, 67]], swing: 0.18, crackle: true },
  { to: 1979, name: 'Рок-н-ролл и бит', bpm: 132, beats: 4, wave: 'square', bass: 'square', drums: 'rock', prog: [[60, 64, 67], [70, 74, 77], [65, 69, 72], [60, 64, 67]], swing: 0 },
  { to: 1999, name: 'Синти-поп и диско', bpm: 116, beats: 4, wave: 'sawtooth', bass: 'sawtooth', drums: 'disco', prog: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], swing: 0, arp: true },
  { to: 2029, name: 'Поп и электроника', bpm: 104, beats: 4, wave: 'triangle', bass: 'sine', drums: 'edm', prog: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], swing: 0, arp: true },
  { to: 9999, name: 'Эмбиент будущего', bpm: 72, beats: 4, wave: 'sine', bass: 'sine', drums: 'soft', prog: [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 68]], swing: 0, pad: true }
];
let musicOn = (() => { try { return localStorage.getItem(MUSIC_KEY) === '1'; } catch (e) { return false; } })();
const MUS = { timer: null, next: 0, step: 0, gain: null, noise: null };
const musicYear = () => (S ? S.year : +(document.getElementById('inYear') || {}).value || new Date().getFullYear());
const eraMusic = () => ERA_MUSIC.find((m) => musicYear() <= m.to);
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
function musNote(f, t, d, type, vol) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(MUS.gain); o.start(t); o.stop(t + d + 0.05);
}
function musNoise(t, d, vol, hp) {
  if (!MUS.noise) { const b = actx.createBuffer(1, actx.sampleRate * 0.5, actx.sampleRate); const ch = b.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; MUS.noise = b; }
  const s = actx.createBufferSource(), g = actx.createGain(), f = actx.createBiquadFilter();
  s.buffer = MUS.noise; f.type = 'highpass'; f.frequency.value = hp;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f).connect(g).connect(MUS.gain); s.start(t); s.stop(t + d + 0.02);
}
function musKick(t, vol) { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); o.connect(g).connect(MUS.gain); o.start(t); o.stop(t + 0.25); }
function musTick() {
  const E = eraMusic(); const spb = 60 / E.bpm / 2; // восьмые
  while (MUS.next < actx.currentTime + 0.35) {
    const s = MUS.step, t = MUS.next + (s % 2 ? E.swing * spb : 0);
    const per = E.beats * 2; const bar = Math.floor(s / per) % E.prog.length; const pos = s % per;
    const ch = E.prog[bar];
    if (pos === 0) { musNote(mtof(ch[0] - 24), t, spb * per * 0.9, E.bass, 0.11); if (E.pad) for (const n of ch) musNote(mtof(n), t, spb * per * 1.1, 'sine', 0.025); }
    if (E.beats === 3 && (pos === 2 || pos === 4)) for (const n of ch.slice(1)) musNote(mtof(n), t, spb * 1.4, E.wave, 0.03);
    if (E.beats === 4 && !E.arp && !E.pad && (pos === 2 || pos === 6)) for (const n of ch) musNote(mtof(n), t, spb * 1.2, E.wave, E.wave === 'square' ? 0.014 : 0.026);
    if (E.arp && pos % 1 === 0) musNote(mtof(ch[pos % ch.length] + (pos >= 4 ? 12 : 0)), t, spb * 0.9, E.wave, E.wave === 'sawtooth' ? 0.012 : 0.022);
    if (!E.pad && (s * 7 + bar * 3) % 5 === 0 && pos % 2 === 0) musNote(mtof(ch[(s >> 1) % ch.length] + 12), t, spb * 1.6, E.beats === 3 ? 'triangle' : E.wave === 'square' ? 'triangle' : E.wave, 0.028);
    if (E.pad && pos === 4 && bar % 2) musNote(mtof(ch[2] + 12), t, spb * 6, 'sine', 0.02);
    if (E.drums === 'rock') { if (pos === 0 || pos === 4) musKick(t, 0.22); if (pos === 2 || pos === 6) musNoise(t, 0.12, 0.09, 1500); musNoise(t, 0.03, 0.025, 7000); }
    if (E.drums === 'disco' || E.drums === 'edm') { if (pos % 2 === 0) musKick(t, E.drums === 'edm' ? 0.26 : 0.18); if (pos % 2 === 1) musNoise(t, 0.05, 0.04, 8000); if (pos === 2 || pos === 6) musNoise(t, 0.15, 0.06, 1800); }
    if (E.drums === 'brush') { musNoise(t, 0.09, 0.018, 3000); if (pos === 0 || pos === 4) musKick(t, 0.07); }
    if (E.drums === 'soft' && pos === 0) musKick(t, 0.05);
    if (E.crackle && Math.random() < 0.5) musNoise(t + Math.random() * spb, 0.01, 0.012, 4000);
    MUS.next += spb; MUS.step++;
  }
}
function musicStart() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    if (MUS.timer) return;
    MUS.gain = actx.createGain(); MUS.gain.gain.value = 0.55; MUS.gain.connect(actx.destination);
    MUS.next = actx.currentTime + 0.1; MUS.step = 0;
    MUS.timer = setInterval(musTick, 110);
  } catch (e) {}
}
function musicStop() { clearInterval(MUS.timer); MUS.timer = null; if (MUS.gain) { try { MUS.gain.gain.setTargetAtTime(0.0001, actx.currentTime, 0.2); } catch (e) {} MUS.gain = null; } }
function musicToggle() { musicOn = !musicOn; try { localStorage.setItem(MUSIC_KEY, musicOn ? '1' : '0'); } catch (e) {} if (musicOn) { musicStart(); toast(`🎵 Играет: ${eraMusic().name}`); } else { musicStop(); toast('🔇 Музыка выключена'); } }
document.addEventListener('pointerdown', function once() { if (musicOn) musicStart(); document.removeEventListener('pointerdown', once); });
let lastEraName = '';
YEAR_HOOKS.push(() => {
  const E = eraMusic();
  if (E.name !== lastEraName) { if (lastEraName && musicOn) toast(`🎵 Новая эпоха в музыке: ${E.name}`); lastEraName = E.name; }
  if (S.age >= 10 && S.age <= 35 && chance(0.12)) {
    const y = S.year;
    const hit = y < 1920 ? 'по граммофону крутят вальсы и первые пластинки' : y < 1940 ? 'все танцуют фокстрот и чарльстон' : y < 1955 ? 'по радио играют джаз-бэнды и военные песни' : y < 1965 ? 'во дворе слушают рок-н-ролл на «рёбрах»' : y < 1975 ? 'все сходят с ума по бит-группам' : y < 1985 ? 'на дискотеках гремит диско' : y < 1995 ? 'на кассетах синти-поп и рок' : y < 2005 ? 'с CD-плееров звучит поп и рэп' : y < 2015 ? 'в плеере на телефоне сотни треков' : y < 2030 ? 'стриминг подбирает музыку за вас' : 'нейросеть сочиняет песни под ваше настроение';
    log(`🎶 Музыка ${Math.floor(y / 10) * 10}-х: ${hit}.`, 'info');
  }
});
MENU_HOOKS.push((l) => item(l, { e: musicOn ? '🎵' : '🔇', t: `Музыка эпохи: ${musicOn ? 'вкл' : 'выкл'}`, d: eraMusic().name, onClick: () => { musicToggle(); refreshSheet(); } }));
/* звуки событий звучат по-разному в разные эпохи */
sfx = function (type) {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const y = musicYear(); const wave = type === 'death' ? 'sine' : y < 1950 ? 'sine' : y < 1980 ? 'square' : y < 2000 ? 'sawtooth' : 'triangle';
    const vol = wave === 'square' || wave === 'sawtooth' ? 0.05 : 0.1;
    let t = actx.currentTime;
    for (const [f, d] of TUNES[type] || []) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = wave; o.frequency.value = f;
      if (y < 1950 && wave === 'sine') { const lfo = actx.createOscillator(), lg = actx.createGain(); lfo.frequency.value = 6; lg.gain.value = 4; lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t + d + 0.05); }
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(type === 'click' ? 0.03 : vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + 0.03); t += d * 0.9;
    }
    if (navigator.vibrate) navigator.vibrate(type === 'death' ? [60, 50, 200] : type === 'ach' ? [30, 40, 30] : type === 'age' ? 12 : 0);
  } catch (e) {}
};

/* ====================== 🎉 ПРАЗДНИКИ, ДНИ РОЖДЕНИЯ, СЕЗОНЫ ====================== */
function bdayGift() {
  const y = S.year, a = S.age, g = S.gender;
  // m — мальчику, f — девочке, n — всем
  const kid = (m, f, n) => pick(g === 'm' ? m.concat(n) : g === 'f' ? f.concat(n) : n.concat(m.slice(0, 1), f.slice(0, 1)));
  if (a < 7) return y < 1930 ? kid(['деревянную саблю', 'деревянную лошадку'], ['тряпичную куклу', 'кукольную колыбельку'], ['юлу', 'книжку с картинками'])
    : y < 1960 ? kid(['жестяную машинку', 'деревянный грузовик'], ['куклу', 'кукольную посуду'], ['плюшевого мишку', 'кубики'])
    : y < 1990 ? kid(['железную дорогу', 'игрушечный грузовик'], ['куклу', 'кукольный домик'], ['конструктор', 'мяч'])
    : y < 2010 ? kid(['радиоуправляемую машинку', 'набор солдатиков'], ['куклу с гардеробом', 'кукольный домик'], ['конструктор', 'интерактивную игрушку'])
    : kid(['радиоуправляемую машинку', 'набор динозавров'], ['кукольный домик', 'набор для рукоделия'], ['детский планшет', 'робота', 'огромный конструктор']);
  if (a < 18) return pick(y < 1930 ? ['коньки', 'книгу сказок', 'карманные часы'] : y < 1960 ? ['велосипед', 'фотоаппарат', 'футбольный мяч'] : y < 1970 ? ['транзисторный радиоприёмник', 'велосипед', 'наручные часы'] : y < 1985 ? ['кассетный магнитофон', 'велосипед', 'джинсы'] : y < 1996 ? ['игровую приставку', 'плеер', 'джинсы'] : y < 2005 ? ['игровую приставку', 'плеер', 'мобильник'] : y < 2025 ? ['смартфон', 'наушники', 'игровую приставку'] : ['VR-очки', 'робота-помощника', 'умные часы']);
  return pick([g === 'm' ? 'одеколон' : 'духи', 'часы', 'книгу', y < 1990 ? 'хрустальную вазу' : 'сертификат в спа', y < 1950 ? 'патефонную пластинку' : 'поездку на выходные', 'картину', y < 1990 ? 'набор фарфоровых чашек' : 'кофемашину', 'свитер ручной вязки', 'носки (опять)']);
}
const MILESTONE = [16, 18, 21, 30, 40, 50, 60, 70, 75, 80, 90, 100];
YEAR_HOOKS.push(() => {
  if (!S.alive || S.age < 1) return;
  const par = parentsAlive(); const pt = partner();
  // день рождения
  if (S.age < 18 && par.length && !S.prison) {
    const g = bdayGift(); const good = chance(0.8);
    eff({ happy: good ? rnd(2, 5) : -1 });
    if (S.age <= 12 || chance(0.5)) log((par.length > 1 ? `🎂 День рождения! Родители подарили вам ${g}.` : gv(par[0], `🎂 День рождения! ${par[0].name} подарил вам ${g}.`, `🎂 День рождения! ${par[0].name} подарила вам ${g}.`, `🎂 День рождения! ${par[0].name} подарил(а) вам ${g}.`)) + (good ? '' : ' Вы мечтали совсем о другом.'), good ? 'good' : '');
  } else if (pt && chance(0.6) && !S.prison) {
    const g = bdayGift(); const great = chance(pt.close / 120);
    pt.close = clamp(pt.close + (great ? 2 : 0)); eff({ happy: great ? 5 : 1 });
    log(gv(pt, `🎁 ${pt.name} подарил вам на день рождения ${g}.`, `🎁 ${pt.name} подарила вам на день рождения ${g}.`, `🎁 ${pt.name} подарил(а) вам на день рождения ${g}.`) + (great ? gv(pt, ' Угадал идеально!', ' Угадала идеально!', ' Угадал(а) идеально!') : ''), great ? 'good' : '');
  }
  if (MILESTONE.includes(S.age) && !S.prison) {
    const friends = S.people.filter((p) => p.alive && ['friend', 'sibling', 'partner', 'child'].includes(p.role));
    const cost = price(S.age >= 30 ? 150000 : 40000);
    ev('🎉', `Юбилей: ${yrs(S.age)}!`, `Круглая дата. Как отметим?${friends.length ? ` Позвать можно ${friends.length} ${plural(friends.length, ['близкого', 'близких', 'близких'])}.` : ''}`, [
      { t: `🥳 Большая вечеринка (${fmt(cost)})`, disabled: S.money < cost && S.age >= 18, f: () => { if (S.age >= 18) S.money -= cost; for (const p of friends) p.close = clamp(p.close + rnd(3, 8)); eff({ happy: rnd(12, 20), health: -rnd(0, 3) }); if (chance(0.3)) { const f = makePerson('friend', { age: S.age + rnd(-5, 5), close: rnd(45, 65) }); S.people.push(f); return `🥳 Праздник удался! Гости танцевали до утра. Новое знакомство: ${f.name}.`; } return '🥳 Праздник удался! Гости танцевали до утра.'; } },
      { t: '🍰 Тихий семейный ужин', f: () => { for (const p of friends.filter((x) => x.role !== 'friend')) p.close = clamp(p.close + rnd(4, 10)); eff({ happy: rnd(6, 10) }); return '🍰 Тёплый вечер с самыми близкими. Лучший подарок.'; } },
      ...(S.age >= 18 ? [{ t: `✈️ Улететь в путешествие (${fmt(price(200000))})`, disabled: S.money < price(200000), f: () => { S.money -= price(200000); const c = pick(COUNTRIES.filter((x) => x.id !== S.country)); if (!S.visited.includes(c.id)) S.visited.push(c.id); eff({ happy: rnd(12, 18) }); return `${c.flag} Вы встретили ${yrs(S.age)} в стране ${c.name}. Незабываемо!`; } }] : []),
      { t: '🙈 Не отмечать', f: () => { eff({ happy: -3 }); return 'Вы сделали вид, что это обычный день.'; } }
    ]);
  }
  // главный зимний праздник
  if (!S.prison && chance(0.3)) holidayEvent();
  // национальный праздник и местные традиции
  if (chance(0.12)) { const h = NAT_HOLIDAY[S.country]; if (h && S.year >= (h[2] || 0)) { eff({ happy: 2 }); log(`🎆 ${h[0]}: ${h[1]}.`, 'info'); } }
  if (S.age >= 4 && S.age <= 12 && S.year >= 1935 && ['us', 'ca', 'gb', 'ie'].includes(S.country) && chance(0.25)) { eff({ happy: 4 }); log(`🎃 Хэллоуин! Вы нарядились ${pick(['вампиром', 'привидением', S.year >= 1940 ? 'супергероем' : 'пиратом', 'тыквой', 'ведьмой'])} и собрали мешок конфет.`, 'good'); }
  if (['ru', 'ua', 'by'].includes(S.country) && chance(0.08)) log('🥞 Масленица: блины, чучело и катание с горки.', 'info');
  if (S.country === 'in' && chance(0.1)) { eff({ happy: 3 }); log('🎨 Холи: вы вернулись домой разноцветным с головы до ног.', 'good'); }
  if (S.country === 'br' && S.age >= 16 && chance(0.12)) { eff({ happy: 5, health: -1 }); log('💃 Карнавал! Вы танцевали самбу всю ночь.', 'good'); }
  // сезоны
  if (chance(0.35)) {
    const pool = S.age < 14 ? ['❄️ Зима: катались с горки до темноты.', '☃️ Слепили во дворе огромного снеговика.', '🌸 Весна: пускали кораблики по ручьям.', '☀️ Лето у бабушки: речка, малина и комары.', '🍂 Осень: собирали каштаны и листья для гербария.', '⛈️ Летняя гроза застала вас по дороге домой. Было весело!']
      : S.age < 60 ? ['❄️ Зима выдалась суровой, но уютной.', '🌷 Весной вы впервые за долгое время гуляли без цели.', '🏖️ Летом удалось выбраться на море.', '🍁 Осенью накатила лёгкая хандра.', '🌞 Это лето было по-настоящему жарким.', S.year < 1960 ? '🌧️ Дождливая осень. Много чая и книг.' : S.year < 1995 ? '🌧️ Дождливая осень. Много чая и телевизора.' : '🌧️ Дождливая осень. Много чая и сериалов.']
        : ['🌱 Весной вы посадили рассаду на подоконнике.', '🪑 Лето на лавочке во дворе с соседями.', '🍎 Осенью собрали урожай яблок.', '🧣 Зимой вязали шарфы для внуков.'];
    let pl = pool;
    if (HOT_LANDS.includes(S.country)) pl = S.age < 14 ? ['🌧️ Сезон дождей: бегали босиком по тёплым лужам.', '🥭 Сезон фруктов: объедались манго прямо с дерева.', '☀️ Каникулы: целыми днями играли на улице до заката.', '⛈️ Ливень застал вас по дороге домой. Было весело!', '🌴 Нашли во дворе огромного жука и показывали всем.'] : S.age < 60 ? ['🌧️ Сезон дождей выдался долгим.', '🌞 Жара стояла такая, что спасал только вентилятор.', '🏖️ Удалось выбраться на побережье.', '🌴 Вы впервые за долгое время гуляли без цели.'] : ['🌱 Вы посадили зелень в горшках на балконе.', '🪑 Вечера на лавочке во дворе с соседями.', '🌞 Пережидали жару в тени с внуками.'];
    else if (!SNOW_SLAV.includes(S.country)) pl = pool.map((x) => x === '☀️ Лето у бабушки: речка, малина и комары.' ? '☀️ Каникулы у бабушки с дедушкой.' : x);
    const t = pick(pl); eff({ happy: /хандра|суровой/.test(t) ? -2 : 2 }); log(t, 'info');
  }
});
const HOT_LANDS = ['ae', 'sa', 'eg', 'ng', 'ke', 'th', 'vn', 'idn', 'ph', 'sg', 'in', 'br', 'co', 've', 'ec', 'cu', 'do', 'jm', 'gt', 'hn', 'ni', 'sv', 'cr', 'pa', 'bs', 'tt', 'gh', 'tz', 'ug', 'sn', 'ci', 'cm', 'ao', 'mz', 'mg', 'fj', 'ml', 'bj', 'qa', 'kw', 'om', 'bh', 'iq', 'pk', 'bd', 'lk', 'kh', 'la', 'mm', 'my', 'py', 'mx'];
const SNOW_SLAV = ['ru', 'ua', 'by', 'kz', 'pl', 'lt', 'lv', 'ee', 'md', 'rs', 'bg', 'cz', 'sk'];
const NAT_HOLIDAY = {
  ru: ['День Победы', 'салют, парад и бессмертные истории дедов', 1945], ua: ['День Независимости', 'вышиванки и концерты на площади', 1991], by: ['День Независимости', 'парад и салют', 1944], kz: ['Наурыз', 'вся семья ела наурыз-коже', 1988],
  us: ['День независимости', 'барбекю и фейерверки 4 июля'], gb: ['Ночь Гая Фокса', 'костры и фейерверки'], fr: ['День взятия Бастилии', 'парад на Елисейских полях'], de: ['Октоберфест', 'кружки, сосиски и духовой оркестр'],
  es: ['Томатина', 'весь город кидался помидорами', 1945], it: ['Феррагосто', 'вся Италия на пляжах'], jp: ['Ханами', 'пикник под цветущей сакурой'], kr: ['Чхусок', 'семья собралась за рисовыми пирожками'],
  cn: ['День образования КНР', 'неделя выходных', 1949], in: ['Дивали', 'тысячи огней и сладости'], br: ['День независимости', 'военный парад'], mx: ['День мёртвых', 'алтари, черепа из сахара и цветы'],
  ar: ['День независимости', 'асадо с друзьями'], tr: ['День Республики', 'флаги на каждом балконе', 1923], ie: ['День святого Патрика', 'всё вокруг стало зелёным'], ca: ['День Канады', 'кленовые флаги и фейерверки'],
  au: ['День Австралии', 'барбекю на пляже'], pl: ['День Независимости', 'марш по Варшаве', 1918], cz: ['День основания Чехословакии', 'праздничные концерты', 1918], ge: ['Ртвели', 'сбор винограда и застолье'],
  am: ['Вардавар', 'все обливали друг друга водой'], uz: ['Навруз', 'сумаляк варили всю ночь'], il: ['Пурим', 'карнавал и сладости'], th: ['Сонгкран', 'водяные битвы на улицах'], vn: ['Тет', 'семейный Новый год по лунному календарю'], se: ['Мидсоммар', 'танцы вокруг майского шеста'], no: ['День Конституции', 'дети маршировали с флажками'], gr: ['Пасха', 'красные яйца и ягнёнок на вертеле'], nl: ['День короля', 'весь город в оранжевом'], ch: ['Национальный день', 'костры в горах'], fi: ['Юханнус', 'сауна и костёр на озере'], eg: ['Шам эн-Нессим', 'пикник на берегу Нила'], ng: ['День независимости', 'музыка на улицах', 1960], za: ['День свободы', 'концерты и барбекю', 1994]
};
function holidayEvent() {
  const rel = S.religion; const c = S.country;
  let h;
  if (['cn', 'vn', 'kr', 'sg', 'mn', 'tw'].includes(c)) h = { e: '🧧', n: 'Лунный Новый год', d: 'Красные конверты, фейерверки и пельмени.' };
  else if (rel === 'Ислам') h = { e: '🌙', n: 'Ураза-байрам', d: 'Праздник после поста: угощения и подарки детям.' };
  else if (rel === 'Индуизм') h = { e: '🪔', n: 'Дивали', d: 'Праздник огней: лампы, сладости и семейные визиты.' };
  else if (rel === 'Иудаизм') h = { e: '🕎', n: 'Ханука', d: 'Восемь свечей, латкесы и игра в дрейдл.' };
  else if (['ir', 'tj', 'az', 'af'].includes(c)) h = { e: '🌱', n: 'Навруз', d: 'Весенний Новый год: проращённая пшеница и прыжки через костёр.' };
  else if (USSR.includes(c) || ['bg', 'mn', 'rs'].includes(c)) h = { e: '🎄', n: 'Новый год', d: S.year < 1936 && USSR.includes(c) ? 'Ёлку ставить не принято, но праздник всё равно чувствуется.' : 'Ёлка, мандарины, салаты и бой курантов в полночь.' };
  else if (['Православие', 'Католицизм', 'Протестантизм'].includes(rel) || (!['jp', 'th', 'kh', 'la', 'mm', 'lk', 'np', 'kp', 'tw', 'my', 'bd', 'pk', 'ir', 'iq', 'sa', 'ae', 'qa', 'kw', 'om', 'bh', 'jo', 'sy', 'dz', 'tn', 'ma', 'eg', 'sn', 'ml', 'tj', 'tm', 'uz', 'kg', 'in', 'il'].includes(c) && !['Ислам', 'Буддизм', 'Синтоизм', 'Сикхизм', 'Даосизм'].includes(rel))) h = { e: '🎄', n: 'Рождество', d: 'Ёлка, подарки и вся семья за одним столом.', tree: 1 };
  else if (c === 'jp') h = { e: '🎍', n: 'Сёгацу', d: 'Японский Новый год: моти, первый визит в храм и открытки всем знакомым.' };
  else if (rel === 'Сикхизм') h = { e: '🪯', n: 'Вайсакхи', d: 'Праздник урожая: гурдвара, общая трапеза и танцы.' };
  else if (rel === 'Буддизм' || ['th', 'kh', 'la', 'mm', 'lk'].includes(c)) h = { e: '💦', n: 'Буддийский Новый год', d: 'Храм, подношения монахам и шумные водяные битвы.' };
  else if (rel === 'Ислам' || ['sa', 'ae', 'qa', 'kw', 'om', 'bh', 'ir', 'iq', 'pk', 'bd'].includes(c)) h = { e: '🐑', n: 'Курбан-байрам', d: 'Вся семья в сборе, угощение и подарки детям.' };
  else h = { e: '🎆', n: 'Новый год', d: 'Фейерверки, угощения и вся семья за одним столом.' };
  if (h.e === '🎄') h.tree = 1;
  const fam = S.people.filter((p) => p.alive && ['mother', 'father', 'sibling', 'partner', 'child', 'grandchild'].includes(p.role));
  const gift = price(S.age >= 18 ? 15000 : 0);
  ev(h.e, h.n, h.d, [
    { t: '👨‍👩‍👧 Встретить с семьёй', f: () => { for (const p of fam) p.close = clamp(p.close + rnd(2, 6)); eff({ happy: rnd(5, 10) }); if (S.age < 14) return h.tree ? `${h.e} ${h.n} дома. Под ёлкой вас ждал подарок: ${bdayGift()}.` : `${h.e} ${h.n} дома. Вам подарили: ${bdayGift()}.`; return `${h.e} ${h.n} в кругу семьи. Тепло, шумно и вкусно.`; } },
    ...(S.age >= 16 ? [{ t: '🎉 С друзьями', f: () => { eff({ happy: rnd(6, 12), health: -rnd(0, 3) }); return `${h.e} ${h.n} с друзьями. Было весело до самого утра.`; } }] : []),
    ...(S.age >= 18 ? [{ t: `🎁 Подарки всем (${fmt(gift * Math.max(1, fam.length))})`, disabled: S.money < gift * Math.max(1, fam.length), f: () => { S.money -= gift * Math.max(1, fam.length); for (const p of fam) p.close = clamp(p.close + rnd(6, 12)); eff({ happy: 6, karma: 2 }); return `${h.e} Вы задарили всех подарками. Близкие растроганы.`; } }] : []),
    ...(S.job ? [{ t: '💼 Выйти на смену за двойную оплату', f: () => { const w = Math.round(jobSalary(S.job) / 50); S.money += w; eff({ happy: -4 }); return `${h.e} Праздник на работе. Зато +${fmt(w)}.`; } }] : []),
    ...(S.age >= 16 ? [{ t: '😶 Провести в одиночестве', f: () => { eff({ happy: -5 }); return `${h.e} ${h.n} в одиночестве. Грустно, но тихо.`; } }] : [])
  ]);
}

ACHIEVEMENTS.push(
  { id: 'chesswin', e: '♟️', t: 'Шах и мат', d: 'Выиграть партию в шахматы' },
  { id: 'chessgm', e: '👑', t: 'Победитель гроссмейстера', d: 'Обыграть гроссмейстера' },
  { id: 'quizking', e: '🧠', t: 'Главный эрудит', d: 'Ответить на все 10 вопросов викторины' },
  { id: 'racer', e: '🏎️', t: 'Гонщик', d: 'Выиграть гонку' },
  { id: 'bigfish', e: '🐋', t: 'Рыба мечты', d: 'Поймать рыбу весом 50+ кг' },
  { id: 'goldfish', e: '🐡', t: 'Золотая рыбка', d: 'Поймать золотую рыбку' }
);
