/* ===================== Главное меню: компактная форма, «Подробнее», плитки действий ===================== */
(function () {
  const form = document.getElementById('startForm'); if (!form) return;
  const q = (id) => document.getElementById(id);
  const lab = (id) => { const x = q(id); return x && x.closest('label'); };
  const row = (id) => { const l = lab(id); return l && l.parentElement.classList.contains('two') ? l.parentElement : l; };
  const submit = form.querySelector('button[type=submit]');
  // заголовок + «Случайная жизнь в один клик»
  const title = form.querySelector('.form-title');
  const head = el('<div class="form-head"></div>'); title.replaceWith(head); head.appendChild(title);
  const rnd = el('<button class="btn ghost chip-btn" type="button" id="quickBtn" title="Всё случайно">🎲 Случайная жизнь</button>');
  head.appendChild(rnd);
  rnd.onclick = () => { for (const id of ['inName', 'inSurname']) if (q(id)) q(id).value = ''; for (const id of ['inCountry', 'inGender', 'inOrient', 'inReligion', 'inChallenge', 'inScen']) { const s = q(id); if (s) { s.selectedIndex = 0; s.dispatchEvent(new Event('change')); } } if (q('inYear')) q('inYear').value = 1900 + Math.floor(Math.random() * 127); form.requestSubmit ? form.requestSubmit(submit) : submit.click(); };
  // «Продолжить» — сразу под слотами и заметно
  const cont = q('continueBtn'); const slots = form.querySelector('.slots-wrap');
  if (cont) { cont.classList.add('continue-btn'); cont.classList.remove('ghost'); (slots ? slots.after(cont) : head.after(cont)); }
  // основное: имя, год, страна, пол; остальное — в «Подробнее»
  const gRow = row('inGender'); const oLab = lab('inOrient');
  const more = el('<details class="more-opts"><summary><span>⚙️ Подробнее</span><small id="moreSum">город, день рождения, вера, режим, сложность</small></summary><div class="more-body"></div></details>');
  const body = more.querySelector('.more-body');
  if (gRow && oLab && gRow.classList.contains('two')) { const g = lab('inGender'); gRow.before(g); gRow.remove(); }
  submit.before(more);
  const pair = (a, b) => { const d = el('<div class="two"></div>'); for (const x of [a, b]) if (x) d.appendChild(x); body.appendChild(d); };
  const cRow = row('inCity'); if (cRow) body.appendChild(cRow);
  pair(oLab, lab('inReligion'));
  const mRow = row('inMode'); if (mRow) body.appendChild(mRow);
  pair(lab('inDiff'), lab('inScen'));
  const sum = () => {
    const n = ['inCity', 'inDay', 'inMonth', 'inOrient', 'inReligion', 'inChallenge', 'inScen'].filter((id) => q(id) && q(id).selectedIndex > 0).length + (q('inMode') && q('inMode').value !== 'normal' ? 1 : 0) + (q('inDiff') && q('inDiff').value !== 'normal' ? 1 : 0);
    const s = q('moreSum'); if (s) s.textContent = n ? `изменено: ${n}` : 'город, день рождения, вера, режим, сложность';
  };
  body.addEventListener('change', sum); sum();
  try { if (localStorage.getItem('lifesim_more') === '1') more.open = true; more.addEventListener('toggle', () => { try { localStorage.setItem('lifesim_more', more.open ? '1' : '0'); } catch (e) {} }); } catch (e) {}
  // плитки второстепенных действий
  const tiles = el('<div class="start-tiles"></div>'); submit.after(tiles);
  for (const id of ['dailyBtn', 'friendsBtn', 'onlineBtn', 'importBtn']) { const b = q(id); if (b) { b.classList.add('tile-btn'); tiles.appendChild(b); } }
})();
