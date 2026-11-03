/* ===================== Мировая таблица рекордов (Supabase REST, без SDK) ===================== */
const ONLINE_KEY = 'lifesim_online_v1';
const onlineCfg = () => (typeof ONLINE_CFG !== 'undefined' && ONLINE_CFG.url && ONLINE_CFG.key ? ONLINE_CFG : null);
function onlineMe() {
  let m = {}; try { m = JSON.parse(localStorage.getItem(ONLINE_KEY)) || {}; } catch (e) {}
  if (!m.pid) { const rb = typeof crypto !== 'undefined' && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(12)) : Array.from({ length: 12 }, () => Math.floor(Math.random() * 256)); m.pid = Array.from(rb, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20); onlineSave(m); }
  return m;
}
function onlineSave(m) { try { localStorage.setItem(ONLINE_KEY, JSON.stringify(m)); } catch (e) {} }
const cleanNick = (s) => String(s || '').replace(/[<>"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);

async function onlineFetch(path, opts = {}) {
  const c = onlineCfg(); if (!c) throw new Error('off');
  const h = { apikey: c.key, 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (/^eyJ/.test(c.key)) h.Authorization = `Bearer ${c.key}`;
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(`${c.url.replace(/\/+$/, '')}/rest/v1/${path}`, { ...opts, headers: h, signal: ctl.signal });
    if (!r.ok) throw new Error('http ' + r.status);
    return r;
  } finally { clearTimeout(tm); }
}

function onlineScore() { return S.daily && S.dailyScore != null ? S.dailyScore : lifeScore(); }
function onlineRow() {
  const sc = onlineScore();
  return {
    pid: onlineMe().pid, nick: cleanNick(onlineMe().nick) || `${S.first} ${S.surname}`.slice(0, 20), score: Math.max(0, Math.min(3000, Math.round(sc))), grade: grade(sc),
    age: Math.max(0, Math.min(130, S.age | 0)), country: String(S.country || '').slice(0, 6), flag: String(C().flag || '').slice(0, 16),
    born: S.birthYear, died: Math.max(S.year, S.birthYear), cause: String(S.cause || '').slice(0, 80), ach: Object.keys(S.ach || {}).length, kids: (S.stat && S.stat.kids) | 0,
    daily: S.daily || null, mode: [S.iron && 'iron', S.diff && S.diff !== 'normal' && S.diff, (S.generation || 1) > 1 && 'dynasty'].filter(Boolean).join(',').slice(0, 20) || null,
    lang: typeof LANG !== 'undefined' ? LANG : 'ru'
  };
}
async function onlineRank(score, daily) {
  try {
    const r = await onlineFetch(`lives?select=id&score=gt.${score}${daily ? `&daily=eq.${daily}` : ''}`, { method: 'HEAD', headers: { Prefer: 'count=exact', Range: '0-0' } });
    const n = +(r.headers.get('content-range') || '').split('/')[1]; return Number.isFinite(n) ? n + 1 : null;
  } catch (e) { return null; }
}
async function onlineSubmit(silent) {
  if (!onlineCfg() || !S || S.alive || S.onlineSent) return false;
  const row = onlineRow(); S.onlineSent = 'sending';
  try {
    await onlineFetch('lives', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) });
    S.onlineSent = true; try { save(); } catch (e) {} document.getElementById('onlineDeathBtn')?.remove();
    const rank = await onlineRank(row.score, row.daily);
    toast(rank ? `🌐 Результат в мировой таблице: место ${rank}` : '🌐 Результат отправлен в мировую таблицу');
    return true;
  } catch (e) {
    S.onlineSent = false;
    if (!silent) toast('⚠️ Не удалось отправить результат. Проверьте интернет.');
    return false;
  }
}
function askNick(then) {
  const m = onlineMe();
  const n = cleanNick(prompt('Имя в мировой таблице (2–20 символов):', m.nick || (S ? `${S.first}` : '')));
  if (n.length < 2) { if (n) toast('Имя слишком короткое'); return; }
  m.nick = n; if (m.auto == null) m.auto = true; onlineSave(m); then && then();
}

/* ---------- Панель ---------- */
const ONLINE_TABS = [['all', '🏆 За всё время'], ['week', '📅 За неделю'], ['daily', '🗓️ Ежедневный вызов'], ['country', '🌍 Моя страна']];
let onlineTab = 'all';
async function onlineLoad(tab) {
  let q = 'lives?select=pid,nick,score,grade,age,flag,country,born,died,daily,mode,created_at&order=score.desc,created_at.asc&limit=200';
  if (tab === 'week') q += `&created_at=gte.${new Date(Date.now() - 7 * 864e5).toISOString()}`;
  if (tab === 'daily') q += `&daily=eq.${today()}`;
  if (tab === 'country') q += `&country=eq.${encodeURIComponent((S && S.country) || onlineMe().country || 'ru')}`;
  const rows = await (await onlineFetch(q)).json();
  const seen = new Set(), out = [];
  for (const r of rows) { if (seen.has(r.pid)) continue; seen.add(r.pid); out.push(r); if (out.length >= 50) break; }
  return out;
}
function onlineBody(B) {
  B.innerHTML = '';
  const c = onlineCfg(), me = onlineMe();
  if (!c) {
    B.appendChild(el('<div class="card"><div class="big">Мировая таблица ещё не подключена</div><div class="muted">Владельцу игры нужно указать адрес базы в online-config.js. Пока можно соревноваться через «Рекорды с друзьями».</div></div>'));
    return;
  }
  B.appendChild(el(`<div class="card"><div class="muted">Ваше имя в таблице</div><div class="big">${esc(me.nick || 'не выбрано')}</div><div class="muted">После каждой жизни результат ${me.auto ? 'отправляется автоматически' : 'можно отправить кнопкой на экране итогов'}. Лучший результат каждого игрока занимает одно место.</div></div>`));
  btnRow(B, [
    { t: me.nick ? '✏️ Сменить имя' : '✏️ Выбрать имя', f: () => askNick(() => onlineBody(B)) },
    { t: me.auto ? '⏸ Не отправлять сам' : '▶️ Отправлять сам', f: () => { me.auto = !me.auto; onlineSave(me); onlineBody(B); } }
  ]);
  const tabs = el('<div class="row-btns online-tabs"></div>'); B.appendChild(tabs);
  for (const [id, t] of ONLINE_TABS) { const b = el(`<button class="btn ${id === onlineTab ? 'primary' : 'ghost'}">${esc(t)}</button>`); b.onclick = () => { onlineTab = id; onlineBody(B); }; tabs.appendChild(b); }
  const l = el('<div class="list"><div class="empty">Загрузка…</div></div>'); B.appendChild(l);
  const tab = onlineTab;
  onlineLoad(tab).then((rows) => {
    if (tab !== onlineTab || !l.isConnected) return;
    l.innerHTML = '';
    if (!rows.length) { l.appendChild(el('<div class="empty">Здесь пока пусто. Станьте первым!</div>')); return; }
    rows.forEach((r, i) => {
      const n = item(l, { e: ['🥇', '🥈', '🥉'][i] || `${i + 1}`, t: `${r.nick} ${r.flag || ''}`, d: `${r.born}–${r.died} · ${yrs(r.age)}${r.mode && r.mode.includes('iron') ? ' · 🔩' : ''}${r.mode && r.mode.includes('hard') ? ' · 🔥' : ''}`, r: `${r.grade} ${r.score}` });
      if (r.pid === me.pid) n.classList.add('me');
    });
  }).catch(() => { if (l.isConnected) l.innerHTML = '<div class="empty">Не удалось загрузить таблицу. Проверьте интернет и попробуйте ещё раз.</div>'; });
}
EXTRA_TITLES.online = '🌐 Мировая таблица';
EXTRA_PANELS.online = function () { onlineBody($('#sheetBody')); };
MENU_HOOKS.push((l) => item(l, { e: '🌐', t: 'Мировая таблица', d: 'Лучшие жизни игроков со всего мира', onClick: () => openPanel('online') }));
(function () {
  const b = el('<button class="btn ghost" type="button" id="onlineBtn">🌐 Мировая таблица</button>');
  const d = document.getElementById('friendsBtn') || document.getElementById('dailyBtn'); if (!d) return;
  d.parentNode.insertBefore(b, d.nextSibling);
  b.onclick = () => { Q.push({ e: '🌐', title: 'Мировая таблица', html: '<div id="onBox"></div>' }); showModal(Q.shift()); onlineBody(document.getElementById('onBox')); };
})();

/* ---------- Отправка после смерти ---------- */
DEATH_HOOKS.push(() => { if (!onlineCfg()) return; const m = onlineMe(); if (S && S.country) { m.country = S.country; onlineSave(m); } if (onlineCfg() && m.auto && m.nick) setTimeout(() => onlineSubmit(true), 400); });
const _showDeathOnline = showDeath;
showDeath = function () {
  _showDeathOnline();
  if (!onlineCfg() || !S || S.onlineSent === true) return;
  const A = $('#modalActions'); if (!A) return;
  const b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'onlineDeathBtn'; b.textContent = '🌐 В мировую таблицу';
  b.onclick = () => {
    const go = () => onlineSubmit(false).then((ok) => { if (ok) b.remove(); });
    if (!onlineMe().nick) askNick(go); else go();
  };
  A.insertBefore(b, A.lastChild);
};
