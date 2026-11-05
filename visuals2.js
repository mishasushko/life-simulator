'use strict';
/* ===== Визуал v53: тема эпохи, одежда аватара, иллюстрации к событиям ===== */

// ---------- 1. Тема интерфейса по эпохе ----------
const ERA_THEMES = [
  { id: 'belle', to: 1925, accent: '#a0562a', bg: '#efe6d4', s2: '#f4ecdc', line: '#e0d3bb', name: ['Начало века', 'Early century', 'Початок століття'] },
  { id: 'inter', to: 1946, accent: '#9c3b2c', bg: '#ece6dc', s2: '#f3eee5', line: '#ddd3c3', name: ['Межвоенные и военные годы', 'Interwar & war years', 'Міжвоєнні та воєнні роки'] },
  { id: 'mid', to: 1966, accent: '#2f8a77', bg: '#edf1ea', s2: '#f3f6f0', line: '#d9e1d5', name: ['Середина века', 'Mid-century', 'Середина століття'] },
  { id: 'seventies', to: 1986, accent: '#df6b1f', bg: '#f6ecdb', s2: '#faf2e5', line: '#eadbc2', name: ['70-е и 80-е', 'The 70s & 80s', '70-ті та 80-ті'] },
  { id: 'nineties', to: 2006, accent: '#d23a8c', bg: '#f2eff8', s2: '#f7f5fb', line: '#e2dcef', name: ['90-е и нулевые', 'The 90s & 2000s', '90-ті та нульові'] },
  { id: 'now', to: 2036, accent: null },
  { id: 'future', to: 9999, accent: '#1a9fc4', bg: '#edf3f7', s2: '#f3f7fa', line: '#d8e3ea', name: ['Будущее', 'The future', 'Майбутнє'] }
];
let eraThemeOn = (() => { try { return localStorage.getItem('lifesim_era_theme') !== 'off'; } catch (e) { return true; } })();
function eraThemeFor(y) { return ERA_THEMES.find((t) => y < t.to) || ERA_THEMES[ERA_THEMES.length - 1]; }
function isDarkUI() { const r = document.documentElement; if (r.dataset.theme === 'dark') return true; if (r.dataset.theme === 'light') return false; return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
const ERA_VARS = ['--accent', '--accent-12', '--accent-30', '--accent-15', '--accent-45', '--bg', '--surface2', '--line', '--map-cur', '--bg-65'];
function applyEraTheme() {
  const R = document.documentElement; const st = R.style;
  const game = document.getElementById('game');
  const active = eraThemeOn && typeof S !== 'undefined' && S && game && !game.hidden;
  const t = active ? eraThemeFor(S.year) : null;
  if (!t || !t.accent) { ERA_VARS.forEach((v) => st.removeProperty(v)); delete R.dataset.era; return; }
  if (R.dataset.era === t.id + (isDarkUI() ? 'd' : 'l')) return;
  ERA_VARS.forEach((v) => st.removeProperty(v));
  const dark = isDarkUI(); R.dataset.era = t.id + (dark ? 'd' : 'l');
  st.setProperty('--accent', t.accent); st.setProperty('--map-cur', t.accent);
  st.setProperty('--accent-15', `color-mix(in srgb, ${t.accent} 15%, transparent)`);
  st.setProperty('--accent-45', `color-mix(in srgb, ${t.accent} 45%, transparent)`);
  if (dark) { st.setProperty('--accent-12', `color-mix(in srgb, ${t.accent} 22%, #101018)`); st.setProperty('--accent-30', `color-mix(in srgb, ${t.accent} 45%, #101018)`); return; }
  st.setProperty('--accent-12', `color-mix(in srgb, ${t.accent} 12%, #fff)`); st.setProperty('--accent-30', `color-mix(in srgb, ${t.accent} 35%, #fff)`);
  st.setProperty('--bg', t.bg); st.setProperty('--surface2', t.s2); st.setProperty('--line', t.line); st.setProperty('--bg-65', `color-mix(in srgb, ${t.bg} 65%, transparent)`);
}
const _renderV2 = render;
render = function () { const r = _renderV2.apply(this, arguments); try { applyEraTheme(); } catch (e) {} return r; };
const _showGameV2 = typeof showGame === 'function' ? showGame : null;
if (_showGameV2) showGame = function () { const r = _showGameV2.apply(this, arguments); try { applyEraTheme(); } catch (e) {} return r; };
// при выходе в меню возвращаем обычную тему
setInterval(() => { try { const g = document.getElementById('game'); if ((!g || g.hidden) && document.documentElement.dataset.era) applyEraTheme(); } catch (e) {} }, 800);
if (window.matchMedia) try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { delete document.documentElement.dataset.era; applyEraTheme(); }); } catch (e) {}
if (typeof MENU_HOOKS !== 'undefined') MENU_HOOKS.push((l) => {
  if (!S || typeof item !== 'function') return;
  item(l, { e: '🎨', t: (typeof T3 === 'function' ? T3('Оформление эпохи', 'Era styling', 'Оформлення епохи') : 'Оформление эпохи'), d: eraThemeOn ? '✅' : '⬜', onClick: () => { eraThemeOn = !eraThemeOn; try { localStorage.setItem('lifesim_era_theme', eraThemeOn ? 'on' : 'off'); } catch (e) {} delete document.documentElement.dataset.era; applyEraTheme(); if (typeof openPanel === 'function') openPanel('menu'); } });
});

// ---------- 2. Одежда аватара по эпохе и профессии ----------
const SOV_LANDS = ['ru', 'ua', 'by', 'kz', 'ge', 'am', 'az', 'uz', 'kg', 'tj', 'tm', 'lt', 'lv', 'ee', 'md'];
const OUTFIT_JOB = { doctor: 'coat', nurse: 'coat', scientist: 'coat', psych: 'cardigan', cook: 'chef', police: 'uniform', army: 'military', fire: 'fire', pilot: 'pilot', astro: 'astro', build: 'overall', mech: 'overall', lawyer: 'suit', finance: 'suit', politician: 'suit', engineer: 'shirtTie', teacher: 'cardigan', journalist: 'shirtTie', athlete: 'sport', courier: 'jacket', taxi: 'jacket' };
function outfitFor(who) {
  if (!who || who.age < 7) return null;
  const year = S ? S.year - ((S.age || 0) - (who.age || 0)) * 0 : 2000; // год текущий
  const c = S && S.country;
  const jobId = who.job && (who.job.id || who.job);
  if (who.age < 18 && who.age >= 9 && who.age <= 14 && SOV_LANDS.includes(c) && year >= 1925 && year <= 1990) return 'pioneer';
  if (who.age < 18) return year < 1950 ? (who.gender === 'f' ? 'dressOld' : 'schoolOld') : null;
  if (who.retired && who.age >= 62) return 'cardigan';
  if (jobId && OUTFIT_JOB[jobId]) return OUTFIT_JOB[jobId];
  if (year < 1950) return who.gender === 'f' ? 'dressOld' : 'suitOld';
  if (year < 1970 && who.gender === 'm') return 'shirtTie';
  if (year >= 1970 && year < 1986) return 'wideCollar';
  if (year >= 2040) return 'future';
  return null;
}
function outfitSVG(kind, base) {
  const P = 'M18 100 Q20 76 50 74 Q80 76 82 100 Z';
  const torso = (f) => `<path d="${P}" fill="${f}"/>`;
  const V = (f, w) => `<path d="M42 74 L50 ${w || 86} L58 74 Z" fill="${f}"/>`;
  const tie = (f) => `<path d="M48.5 78 L51.5 78 L53 92 L50 96 L47 92 Z" fill="${f}"/>`;
  const lapels = (f) => `<path d="M40 75 L50 90 L44 100 L34 100 Z M60 75 L50 90 L56 100 L66 100 Z" fill="${f}"/>`;
  const ep = (f) => `<rect x="23" y="80" width="11" height="3.5" rx="1.5" fill="${f}" transform="rotate(-18 28 81)"/><rect x="66" y="80" width="11" height="3.5" rx="1.5" fill="${f}" transform="rotate(18 72 81)"/>`;
  const btn = (f) => [86, 92, 98].map((y) => `<circle cx="50" cy="${y}" r="1.3" fill="${f}"/>`).join('');
  switch (kind) {
    case 'coat': return torso('#f4f6f8') + V(base, 86) + lapels('#e3e7ec') + `<rect x="60" y="88" width="9" height="7" rx="1.5" fill="#dfe4ea"/><path d="M63 88 v-4" stroke="#3a6fb0" stroke-width="1.4"/>`;
    case 'chef': return torso('#f7f7f7') + `<g fill="#cfd3d8">${[44, 56].map((x) => [84, 90, 96].map((y) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('')).join('')}</g><path d="M40 75 Q50 80 60 75" stroke="#d6d9de" stroke-width="3" fill="none"/>`;
    case 'uniform': return torso('#24324f') + V('#cfd8e6', 82) + tie('#1a2238') + ep('#d4a640') + `<path d="M62 86 l3 -2 l3 2 l-1 4 h-4 z" fill="#d4a640"/>`;
    case 'military': return torso('#5d6a3e') + V('#4d5833', 84) + ep('#c9a03a') + btn('#c9a03a');
    case 'fire': return torso('#3a2b28') + `<rect x="20" y="90" width="60" height="4" fill="#f2c94c"/><rect x="20" y="95" width="60" height="1.5" fill="#cfd3d8"/>` + V('#2a1f1d', 82);
    case 'pilot': return torso('#1f2a44') + V('#f4f6f8', 84) + tie('#1f2a44') + ep('#e5c25a') + `<path d="M28 88 h10" stroke="#e5c25a" stroke-width="1.6"/>`;
    case 'astro': return torso('#eef0f2') + `<rect x="38" y="84" width="24" height="10" rx="3" fill="#cfd5db"/><circle cx="44" cy="89" r="1.6" fill="#e0244f"/><circle cx="50" cy="89" r="1.6" fill="#3a6fb0"/><circle cx="56" cy="89" r="1.6" fill="#14935a"/>`;
    case 'overall': return torso(base) + `<path d="M30 100 L30 86 L70 86 L70 100 Z" fill="#3e5f8f"/><path d="M34 86 L38 75 M66 86 L62 75" stroke="#3e5f8f" stroke-width="4"/><circle cx="35" cy="87" r="1.6" fill="#d4a640"/><circle cx="65" cy="87" r="1.6" fill="#d4a640"/>`;
    case 'suit': return torso('#2b2f3a') + V('#f4f6f8', 90) + tie('#8b1e2e') + lapels('#23262f');
    case 'suitOld': return torso('#4a4036') + V('#f1ece2', 88) + tie('#2a2420') + lapels('#3e352c') + `<path d="M64 86 l5 -1" stroke="#f1ece2" stroke-width="2"/>`;
    case 'shirtTie': return torso('#eef2f6') + tie('#2f4a7a') + `<path d="M42 74 L50 80 L58 74" fill="none" stroke="#c9d1db" stroke-width="2"/>`;
    case 'cardigan': return torso(shade(base, 0.85)) + V('#f1ece2', 92) + `<g fill="#f1ece2" opacity=".85">${[84, 90, 96].map((y) => `<circle cx="47" cy="${y}" r="1.2"/>`).join('')}</g>`;
    case 'sport': return torso(base) + `<path d="M24 82 L32 100 M76 82 L68 100" stroke="#fff" stroke-width="2.5"/><path d="M42 74 L50 78 L58 74" fill="none" stroke="#fff" stroke-width="2.5"/>`;
    case 'jacket': return torso('#3b3f46') + `<path d="M50 76 V100" stroke="#9aa0a8" stroke-width="1.5"/><path d="M42 74 L50 79 L58 74" fill="none" stroke="#2c2f35" stroke-width="3"/>`;
    case 'pioneer': return torso('#f4f6f8') + `<path d="M40 75 L50 84 L60 75 L56 74 L50 79 L44 74 Z" fill="#d62828"/><path d="M48 82 L42 96 L46 96 L50 85 Z M52 82 L58 96 L54 96 L50 85 Z" fill="#d62828"/>`;
    case 'schoolOld': return torso('#3d4a5c') + `<path d="M40 75 L50 80 L60 75" fill="none" stroke="#f1ece2" stroke-width="3"/>` + btn('#c9a03a');
    case 'dressOld': return torso(shade(base, 0.7)) + `<path d="M40 75 Q45 82 50 78 Q55 82 60 75" fill="#f6f1e6" stroke="#e6dcc9" stroke-width=".8"/>`;
    case 'wideCollar': return torso(base) + `<path d="M42 74 L34 86 L46 80 Z M58 74 L66 86 L54 80 Z" fill="${shade(base, 1.25)}"/>`;
    case 'future': return torso('#e9eef3') + `<path d="M34 80 Q50 96 66 80" fill="none" stroke="#1a9fc4" stroke-width="2.2" opacity=".85"/><circle cx="50" cy="88" r="2.4" fill="#1a9fc4"/>`;
  }
  return '';
}
if (typeof portraitSVG === 'function') {
  const _portraitV2 = portraitSVG;
  portraitSVG = function (look, age, mood, gender) {
    let svg = _portraitV2.apply(this, arguments);
    try {
      if (!S || !look || age < 7) return svg;
      let who = null;
      if (look === S.look) who = { age, gender, job: S.job, retired: S.retired };
      else { const p = (S.people || []).find((x) => x.look === look); if (p) who = { age, gender, job: p.jobId || null, retired: p.age >= 65 }; else who = { age, gender }; }
      const kind = outfitFor(who); if (!kind) return svg;
      const base = SHIRTS[look.shirt] || SHIRTS[0];
      const i = svg.indexOf('<rect x="44" y="'); if (i < 0) return svg;
      svg = svg.slice(0, i) + `<g class="outfit outfit-${kind}">${outfitSVG(kind, base)}</g>` + svg.slice(i);
    } catch (e) {}
    return svg;
  };
}

// ---------- 3. Иллюстрации к важным событиям ----------
const SCENES = [
  { id: 'wedding', re: /свадьб|поженил|обвенча|wedding|got married|весілл|одружил/i, main: '💒', deco: ['💍', '🥂', '💐', '🕊️'], c: ['#ffd6e4', '#ffeef3'] },
  { id: 'baby', re: /родил(ся|ась|и)|беременн|новорожд|ребёнок появил|baby|pregnan|was born|народив|вагітн/i, main: '👶', deco: ['🍼', '🧸', '💕', '🎀'], c: ['#d6ecff', '#f1f8ff'] },
  { id: 'grad', re: /выпускн|выпуск|диплом|аттестат|graduat|diploma|випуск/i, main: '🎓', deco: ['📜', '🎉', '🏫', '✨'], c: ['#dcdcff', '#f1f0ff'] },
  { id: 'war', re: /войн|фронт|мобилизац|бомбёж|оккупац|\bwar\b|front line|mobiliz|війн/i, main: '🪖', deco: ['💥', '🚩', '🕊️', '🌫️'], c: ['#d9d4cc', '#efebe5'] },
  { id: 'army', re: /армию|повестк|призыв|служб[аеу] в армии|draft|conscript|army|армі/i, main: '🎖️', deco: ['🪖', '🥾', '⭐', '🚂'], c: ['#dfe5cf', '#f1f4e8'] },
  { id: 'death', re: /умер(ла)?\b|скончал|похорон|погиб|died|passed away|funeral|помер|похорон/i, main: '🕯️', deco: ['🥀', '🌧️', '🕊️', '💐'], c: ['#d4d3dc', '#ecebf1'] },
  { id: 'money', re: /лотере|выигрыш|джекпот|наследств|lottery|jackpot|inherit|спадщ/i, main: '💰', deco: ['💸', '🎰', '✨', '🪙'], c: ['#fff0bf', '#fff8e0'] },
  { id: 'job', re: /повышени|приняли на работу|новая работа|promot|hired|підвищен/i, main: '💼', deco: ['📈', '⭐', '🤝', '☕'], c: ['#d7f0e3', '#effaf4'] },
  { id: 'move', re: /переезд|переехал|эмигр|move to|moved|emigra|переїз/i, main: '🚚', deco: ['📦', '🏠', '🗺️', '🧳'], c: ['#e7e0f5', '#f5f1fb'] },
  { id: 'disaster', re: /пожар|землетрясен|наводнен|ураган|fire broke|earthquake|flood|hurricane|пожеж|повін/i, main: '🌪️', deco: ['🔥', '🌊', '🚒', '⚠️'], c: ['#ffd9cc', '#fff0ea'] },
  { id: 'jail', re: /тюрьм|арестова|приговор|prison|arrested|sentenc|в'язниц/i, main: '⛓️', deco: ['🚓', '⚖️', '🔒', '🧱'], c: ['#d8d8de', '#eeeef2'] },
  { id: 'medal', re: /олимпи|чемпион|медал|olymp|champion|medal/i, main: '🏅', deco: ['🏆', '🎉', '🥇', '✨'], c: ['#ffe8b8', '#fff6e0'] },
  { id: 'hosp', re: /больниц|диагноз|операци|hospital|diagnos|surgery|лікарн/i, main: '🏥', deco: ['💊', '🩺', '🩹', '❤️‍🩹'], c: ['#d8eef0', '#eff8f9'] },
  { id: 'retire', re: /пенси[яюи] |на пенсию|retire|на пенсію/i, main: '🌅', deco: ['🎣', '🪴', '☕', '📰'], c: ['#ffe2c7', '#fff3e6'] }
];
function sceneFor(m) {
  if (!m || (m.e && String(m.e).startsWith('<svg'))) return null;
  const txt = (m.title || '') + ' ' + (m.text || '') + ' ' + (m.html ? String(m.html).replace(/<[^>]+>/g, ' ') : '');
  const head = (m.title || '');
  return SCENES.find((s) => s.re.test(head)) || (txt.length < 400 ? SCENES.find((s) => s.re.test(txt)) : null);
}
function sceneHTML(s, m) {
  const main = m.e && !/^\s*$/.test(m.e) && m.e.length <= 8 ? m.e : s.main;
  const deco = s.deco.filter((d) => d !== main).concat(main !== s.main ? [s.main] : []).slice(0, 4).map((d, i) => `<span class="sc-d sc-d${i}">${d}</span>`).join('');
  return `<div class="scene-bg"></div>${deco}<span class="sc-main">${main}</span>`;
}
if (typeof showModal === 'function') {
  const _showModalV2 = showModal;
  showModal = function (m) {
    const r = _showModalV2.apply(this, arguments);
    try {
      const em = document.getElementById('modalEmoji'); if (!em) return r;
      let sc = document.getElementById('modalScene');
      const s = sceneFor(m);
      if (!s) { if (sc) sc.hidden = true; em.style.display = ''; return r; }
      if (!sc) { sc = document.createElement('div'); sc.id = 'modalScene'; sc.className = 'modal-scene'; em.parentNode.insertBefore(sc, em); }
      sc.hidden = false; sc.dataset.scene = s.id;
      sc.style.setProperty('--sc1', s.c[0]); sc.style.setProperty('--sc2', s.c[1]);
      sc.innerHTML = sceneHTML(s, m); em.style.display = 'none';
    } catch (e) {}
    return r;
  };
}
