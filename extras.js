'use strict';
/* ===================== Удобство и наследие ===================== */

/* ---------- звук и вибрация ---------- */
const SND_KEY = 'lifesim_sound';
let soundOn = (() => { try { return localStorage.getItem(SND_KEY) !== '0'; } catch (e) { return true; } })();
let actx = null;
const TUNES = {
  age: [[523, .05], [784, .08]], click: [[880, .03]], good: [[660, .06], [880, .09]], bad: [[330, .09], [247, .14]],
  ach: [[523, .07], [659, .07], [784, .07], [1047, .16]], death: [[392, .22], [330, .22], [262, .45]], coin: [[988, .05], [1319, .12]]
};
sfx = function (type) {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    let t = actx.currentTime;
    for (const [f, d] of TUNES[type] || []) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type === 'death' ? 'sine' : 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(type === 'click' ? 0.04 : 0.1, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + 0.03); t += d * 0.9;
    }
    if (navigator.vibrate) navigator.vibrate(type === 'death' ? [60, 50, 200] : type === 'ach' ? [30, 40, 30] : type === 'age' ? 12 : 0);
  } catch (e) {}
};

/* ---------- прожить несколько лет ---------- */
function ageMany(n) {
  if (!S || !S.alive) return;
  for (let i = 0; i < n; i++) {
    if (!S.alive || !$('#modalWrap').hidden || Q.length) break;
    ageUp();
  }
  sfx('age');
}
(function addFastForward() {
  const ab = $('#ageBtn');
  const wrap = document.createElement('div'); wrap.className = 'age-wrap';
  ab.parentNode.insertBefore(wrap, ab); wrap.appendChild(ab);
  const b = document.createElement('button'); b.className = 'age5-btn'; b.id = 'age5Btn'; b.textContent = '+5'; b.title = 'Прожить 5 лет (до первого важного события)'; b.setAttribute('aria-label', 'Прожить 5 лет');
  b.addEventListener('click', (e) => { e.stopPropagation(); ageMany(5); });
  wrap.appendChild(b);
})();

/* ---------- PWA ---------- */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; });

/* ---------- кладбище и рейтинг ---------- */
const GRAVES_KEY = 'lifesim_graves_v1';
function loadGraves() { try { return JSON.parse(localStorage.getItem(GRAVES_KEY)) || []; } catch (e) { return []; } }
function saveGraves(g) { try { localStorage.setItem(GRAVES_KEY, JSON.stringify(g.slice(-300))); } catch (e) {} }
DEATH_HOOKS.push(() => {
  const g = loadGraves();
  const sc = lifeScore();
  const job = S.career.length ? JOBS.find((j) => j.id === S.career[S.career.length - 1]) : null;
  g.push({ id: uid(), name: `${S.first} ${S.surname}`, gender: S.gender, flag: C().flag, country: cname(C()), y1: S.birthYear, y2: S.year, age: S.age, cause: S.cause, net: netWorth(), netStr: fmt(netWorth()), score: sc, grade: grade(sc), gen: S.generation, job: job ? job.titles[Math.min(S.job ? S.job.lvl : 0, job.titles.length - 1)] : '', kids: S.stat.kids, ach: Object.keys(S.ach).length, karma: S.karma, at: Date.now() });
  saveGraves(g);
});

EXTRA_TITLES.graves = '🪦 Кладбище и рейтинг';
EXTRA_PANELS.graves = function () {
  const g = loadGraves();
  if (!g.length) { $('#sheetBody').appendChild(el('<div class="empty">Здесь пока никого нет. Проживите первую жизнь до конца.</div>')); return; }
  const best = [...g].sort((a, b) => b.score - a.score).slice(0, 10);
  const totalYears = g.reduce((s, x) => s + x.age, 0);
  card(`<div class="muted">Прожито жизней: ${g.length}</div><div class="big">${totalYears} ${plural(totalYears, ['год', 'года', 'лет'])} в сумме</div><div class="muted">Самая долгая: ${Math.max(...g.map((x) => x.age))} · самая богатая: ${fmt(Math.max(...g.map((x) => x.net)))}</div>`);
  const l = section('🏆 Лучшие жизни');
  best.forEach((x, i) => item(l, { e: ['🥇', '🥈', '🥉'][i] || `${i + 1}`, t: `${x.name} ${x.flag}`, d: `${x.y1}–${x.y2} · ${yrs(x.age)} · ${x.job || 'без профессии'} · ${x.netStr || fmt(x.net)}`, r: `${x.grade} ${x.score}` }));
  const r = section('🕯️ Недавно ушедшие');
  for (const x of [...g].reverse().slice(0, 40)) item(r, { e: '🪦', t: `${x.name} ${x.flag}`, d: `${x.y1}–${x.y2} · ${yrs(x.age)} · ${x.cause}${x.gen > 1 ? ` · поколение ${x.gen}` : ''}`, r: x.grade });
  btnRow($('#sheetBody'), [{ t: 'Очистить кладбище', cls: 'danger', f: () => { if (confirm('Удалить всю историю прошлых жизней?')) { saveGraves([]); refreshSheet(); } } }]);
};

/* ---------- древо рода ---------- */
EXTRA_TITLES.tree = '🌳 Древо рода';
EXTRA_PANELS.tree = function () {
  const B = $('#sheetBody');
  const lin = S.lineage || [];
  const box = el('<div class="tree"></div>');
  const node = (o, cls = '') => el(`<div class="tnode ${cls}"><div class="tgen">${o.gen ? 'Поколение ' + o.gen : ''}</div><div class="tname">${o.e || ''} ${esc(o.name)} ${o.flag || ''}</div><div class="tmeta">${esc(o.meta || '')}</div></div>`);
  for (const a of lin) box.appendChild(node({ gen: a.gen, e: a.gender === 'f' ? '👵' : a.gender === 'm' ? '👴' : '🧓', name: a.name, flag: a.flag, meta: `${a.y1}–${a.y2} · ${yrs(a.age)}${a.job ? ' · ' + a.job : ''} · ${fmt(a.net)}` }));
  box.appendChild(node({ gen: S.generation, e: avatar(), name: `${S.first} ${S.surname}`, flag: C().flag, meta: `${S.birthYear} – ${S.alive ? 'н.в.' : S.year} · ${yrs(S.age)} · это вы` }, 'me'));
  const kids = S.people.filter((p) => p.role === 'child');
  if (kids.length) {
    const row = el('<div class="tkids"></div>');
    for (const k of kids) row.appendChild(el(`<div class="tkid">${k.alive ? personEmoji(k) : '🕯️'}<b>${esc(k.name)}</b><small>${yrs(k.age)}${k.grandkids ? ' · внуков: ' + k.grandkids : ''}</small></div>`));
    box.appendChild(row);
  } else box.appendChild(el('<div class="empty">Детей пока нет. Династия продолжится, только если у вас будет наследник.</div>'));
  B.appendChild(box);
};

/* ---------- карточка итога жизни ---------- */
function lifeCardCanvas() {
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const dark = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() === '#101018';
  const bg = dark ? '#101018' : '#f5f1ea', ink = dark ? '#f1eff7' : '#1d1a2b', muted = dark ? '#9b97ad' : '#7d7889', surf = dark ? '#1b1b26' : '#ffffff', acc = '#ff5a36';
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  x.fillStyle = dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';
  for (let i = 0; i < W; i += 30) for (let j = 0; j < H; j += 30) x.fillRect(i, j, 2, 2);
  const font = (w, s) => `${w} ${s}px Unbounded, Manrope, system-ui, sans-serif`;
  const sc = lifeScore();
  x.fillStyle = acc; x.font = font(700, 34); x.fillText('ЖИЗНЬ · симулятор', 80, 120);
  x.font = '150px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; x.fillText(S.alive ? avatar() : '🪦', 80, 330);
  x.fillStyle = ink; x.font = font(700, 70); wrapText(x, `${S.first} ${S.surname}`, 80, 440, W - 160, 80);
  x.fillStyle = muted; x.font = font(500, 36); x.fillText(`${C().flag} ${cname(C())} · ${S.birthYear}–${S.alive ? 'н.в.' : S.year}`, 80, 560);
  if (!S.alive) x.fillText(`Причина: ${S.cause}`, 80, 615);
  const job = S.career.length ? JOBS.find((j) => j.id === S.career[S.career.length - 1]).name : '—';
  const cells = [['Возраст', yrs(S.age)], ['Оценка', `${grade(sc)} · ${sc}`], ['Капитал', fmt(netWorth())], ['Карьера', job], ['Дети', String(S.stat.kids)], ['Стран', String(S.visited.length)], ['Карма', String(S.karma)], ['Достижения', String(Object.keys(S.ach).length)]];
  cells.forEach(([k, v], i) => {
    const cx = 80 + (i % 2) * 470, cy = 680 + Math.floor(i / 2) * 140;
    x.fillStyle = surf; roundRect(x, cx, cy, 450, 120, 28); x.fill();
    x.fillStyle = muted; x.font = font(600, 24); x.fillText(k.toUpperCase(), cx + 30, cy + 45);
    x.fillStyle = ink; x.font = font(600, 36); x.fillText(v.length > 18 ? v.slice(0, 17) + '…' : v, cx + 30, cy + 92);
  });
  x.fillStyle = acc; roundRect(x, 80, 1300, W - 160, 8, 4); x.fill();
  x.fillStyle = muted; x.font = font(500, 26); x.fillText('mishasushko.github.io/life-simulator', 80, 1275);
  return c;
}
function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function wrapText(x, t, a, b, maxW, lh) { const words = t.split(' '); let line = ''; for (const w of words) { const test = line ? line + ' ' + w : w; if (x.measureText(test).width > maxW && line) { x.fillText(line, a, b); line = w; b += lh; } else line = test; } x.fillText(line, a, b); }
function shareLife() {
  const c = lifeCardCanvas();
  c.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], `zhizn-${S.first}.png`, { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Моя жизнь в симуляторе' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('🖼️ Картинка сохранена');
  }, 'image/png');
}

/* ---------- пункты меню ---------- */
MENU_HOOKS.push((l) => {
  item(l, { e: '🌳', t: 'Древо рода', d: `Поколение ${S.generation}`, onClick: () => openPanel('tree') });
  item(l, { e: '🪦', t: 'Кладбище и рейтинг', d: `Прожито жизней: ${loadGraves().length}`, onClick: () => openPanel('graves') });
  item(l, { e: '📤', t: 'Поделиться историей', d: 'Картинка с итогами жизни', onClick: () => shareLife() });
  item(l, { e: soundOn ? '🔊' : '🔇', t: soundOn ? 'Звук и вибрация: вкл' : 'Звук и вибрация: выкл', d: 'Нажмите, чтобы переключить', onClick: () => { soundOn = !soundOn; try { localStorage.setItem(SND_KEY, soundOn ? '1' : '0'); } catch (e) {} sfx('click'); refreshSheet(); } });
  if (installPrompt) item(l, { e: '📲', t: 'Установить как приложение', d: 'Играть офлайн с главного экрана', onClick: async () => { installPrompt.prompt(); try { await installPrompt.userChoice; } catch (e) {} installPrompt = null; refreshSheet(); } });
});
