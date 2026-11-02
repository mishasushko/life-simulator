'use strict';
/* ===================== Портреты и конструктор внешности ===================== */

const SKINS = ['#ffe0cc', '#f6cfae', '#eab98f', '#d39b6a', '#a96d43', '#7a4a2a', '#4f2f1c'];
const HAIR_COLORS = ['#1f1a17', '#3d2a1e', '#6b4226', '#a0672f', '#d9a441', '#f0d58a', '#b5432d', '#e6e2da', '#ff6aa2', '#5b8cff'];
const EYE_COLORS = ['#3b2a1e', '#6b4a2b', '#3f7a3a', '#3a6fb0', '#7a8a96', '#2b2b2b'];
const SHIRTS = ['#ff5a36', '#5b5bf7', '#14935a', '#e69a00', '#1d1a2b', '#e8467c', '#2aa6b8', '#8b5cf6', '#f2f2f2'];
const HAIR_STYLES = [
  { id: 'short', name: 'Короткая' }, { id: 'buzz', name: 'Ёжик' }, { id: 'side', name: 'Пробор' }, { id: 'curly', name: 'Кудри' },
  { id: 'long', name: 'Длинные' }, { id: 'bob', name: 'Каре' }, { id: 'bun', name: 'Пучок' }, { id: 'ponytail', name: 'Хвост' },
  { id: 'mohawk', name: 'Ирокез' }, { id: 'afro', name: 'Афро' }, { id: 'bald', name: 'Лысина' }
];
const DARK_SKIN_C = ['ng', 'ke', 'za', 'br', 'cu', 'co'];
const MID_SKIN_C = ['in', 'eg', 'ma', 'sa', 'ae', 'mx', 'pe', 'th', 'vn', 'idn', 'ph', 'tr', 'az', 'uz', 'am', 'ge', 'il', 'ar', 'cl', 'mn'];

function randomLook(gender, country, parents) {
  const ps = (parents || []).filter((p) => p && p.look);
  let skin;
  if (ps.length) { const a = ps[0].look.skin, b = (ps[1] || ps[0]).look.skin; skin = Math.round((a + b) / 2 + (Math.random() < 0.3 ? rnd(-1, 1) : 0)); }
  else skin = DARK_SKIN_C.includes(country) ? rnd(3, 6) : MID_SKIN_C.includes(country) ? rnd(2, 4) : rnd(0, 3);
  skin = Math.max(0, Math.min(SKINS.length - 1, skin));
  const hairColor = ps.length && chance(0.7) ? pick(ps).look.hairColor : skin >= 4 ? rnd(0, 1) : rnd(0, 6);
  const eyes = ps.length && chance(0.7) ? pick(ps).look.eyes : skin >= 3 ? rnd(0, 1) : rnd(0, 5);
  const styles = gender === 'm' ? ['short', 'buzz', 'side', 'curly', 'afro'] : gender === 'f' ? ['long', 'bob', 'bun', 'ponytail', 'curly', 'afro'] : ['short', 'bob', 'curly', 'side', 'long'];
  let hair = pick(styles); if (hair === 'afro' && skin < 4 && chance(0.7)) hair = pick(styles.filter((x) => x !== 'afro'));
  return { skin, hairColor, eyes, hair, glasses: chance(0.18), beard: gender === 'm' && chance(0.35), shirt: rnd(0, SHIRTS.length - 1) };
}
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = Math.round(Math.min(255, Math.max(0, r * k))); g = Math.round(Math.min(255, Math.max(0, g * k))); b = Math.round(Math.min(255, Math.max(0, b * k))); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
function mix(a, b, t) { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); const c = (s) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t); return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1); }

function portraitSVG(look, age, mood, gender) {
  const L = look; const skin = SKINS[L.skin] || SKINS[1]; const skinD = shade(skin, 0.86);
  let hc = HAIR_COLORS[L.hairColor] || HAIR_COLORS[0];
  if (age >= 50) hc = mix(hc, '#d9d6d0', Math.min(0.9, (age - 50) / 25));
  const hcD = shade(hc, 0.8);
  const baby = age < 3, kid = age < 13, old = age >= 65;
  const shirt = SHIRTS[L.shirt] || SHIRTS[0];
  let hair = L.hair; if (baby) hair = 'tuft'; if (old && gender === 'm' && L.hair !== 'afro' && (L.skin + L.eyes) % 3 === 0) hair = 'bald';
  const hy = baby ? 50 : 44, hrx = baby ? 25 : 21, hry = baby ? 24 : 24;
  const back = { long: `<path d="M27 40 Q26 78 34 86 L66 86 Q74 78 73 40 Z" fill="${hcD}"/>`, ponytail: `<path d="M68 38 Q86 48 78 74 Q72 62 66 52 Z" fill="${hcD}"/>`, bob: `<path d="M27 42 Q26 66 34 70 L66 70 Q74 66 73 42 Z" fill="${hcD}"/>`, afro: `<circle cx="50" cy="36" r="31" fill="${hcD}"/>`, curly: `<g fill="${hcD}"><circle cx="30" cy="42" r="8"/><circle cx="70" cy="42" r="8"/><circle cx="31" cy="54" r="7"/><circle cx="69" cy="54" r="7"/></g>` }[hair] || '';
  const top = {
    short: `<path d="M29 40 Q30 18 50 18 Q70 18 71 40 Q64 28 50 28 Q36 28 29 40 Z" fill="${hc}"/>`,
    buzz: `<path d="M30 38 Q31 20 50 20 Q69 20 70 38 Q62 30 50 30 Q38 30 30 38 Z" fill="${hc}" opacity=".85"/>`,
    side: `<path d="M28 42 Q28 16 52 17 Q73 19 72 40 Q66 26 46 27 Q40 34 28 42 Z" fill="${hc}"/>`,
    curly: `<g fill="${hc}"><circle cx="36" cy="25" r="9"/><circle cx="50" cy="20" r="10"/><circle cx="64" cy="25" r="9"/><circle cx="29" cy="35" r="7"/><circle cx="71" cy="35" r="7"/></g>`,
    long: `<path d="M28 44 Q27 17 50 17 Q73 17 72 44 Q66 27 50 26 Q34 27 28 44 Z" fill="${hc}"/>`,
    bob: `<path d="M27 46 Q26 17 50 17 Q74 17 73 46 Q70 30 50 28 Q30 30 27 46 Z" fill="${hc}"/>`,
    bun: `<circle cx="50" cy="12" r="9" fill="${hc}"/><path d="M29 40 Q30 18 50 18 Q70 18 71 40 Q64 28 50 28 Q36 28 29 40 Z" fill="${hc}"/>`,
    ponytail: `<path d="M29 40 Q30 18 50 18 Q70 18 71 40 Q64 28 50 28 Q36 28 29 40 Z" fill="${hc}"/>`,
    mohawk: `<path d="M44 30 Q46 6 50 4 Q54 6 56 30 Z" fill="${hc}"/><path d="M31 36 Q36 30 44 30 L56 30 Q64 30 69 36" fill="none" stroke="${hc}" stroke-width="2" opacity=".5"/>`,
    afro: `<path d="M24 42 Q20 12 50 9 Q80 12 76 42 Q70 26 50 26 Q30 26 24 42 Z" fill="${hc}"/>`,
    bald: old ? `<path d="M29 44 Q28 36 31 34 M71 44 Q72 36 69 34" stroke="${hc}" stroke-width="4" fill="none" stroke-linecap="round"/>` : '',
    tuft: `<path d="M48 27 Q50 20 54 24" stroke="${hc}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
  }[hair] || '';
  const eyeC = EYE_COLORS[L.eyes] || EYE_COLORS[0];
  const ey = hy + (baby ? 2 : 1);
  const eyes = mood < 25
    ? `<path d="M37 ${ey} q4 3 8 0 M55 ${ey} q4 3 8 0" stroke="#2b2220" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : `<g><ellipse cx="41" cy="${ey}" rx="3.6" ry="${baby ? 4.2 : 3.8}" fill="#fff"/><ellipse cx="59" cy="${ey}" rx="3.6" ry="${baby ? 4.2 : 3.8}" fill="#fff"/><circle cx="41.4" cy="${ey + .3}" r="2.5" fill="${eyeC}"/><circle cx="59.4" cy="${ey + .3}" r="2.5" fill="${eyeC}"/><circle cx="41.8" cy="${ey - .3}" r="1.1" fill="#111"/><circle cx="59.8" cy="${ey - .3}" r="1.1" fill="#111"/><circle cx="42.6" cy="${ey - 1.2}" r=".6" fill="#fff"/><circle cx="60.6" cy="${ey - 1.2}" r=".6" fill="#fff"/></g>`;
  const brows = baby ? '' : `<path d="M36 ${ey - 7} q5 ${mood < 40 ? 2 : -2} 10 0 M54 ${ey - 7} q5 ${mood < 40 ? 2 : -2} 10 0" stroke="${hcD}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  const my = hy + 12;
  const mouth = mood >= 70 ? `<path d="M42 ${my} Q50 ${my + 8} 58 ${my} Z" fill="#7a2e2e"/><path d="M44 ${my + .5} Q50 ${my + 3} 56 ${my + .5}" fill="#fff"/>`
    : mood >= 40 ? `<path d="M43 ${my + 1} Q50 ${my + 5} 57 ${my + 1}" stroke="#7a2e2e" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
    : `<path d="M43 ${my + 4} Q50 ${my - 1} 57 ${my + 4}" stroke="#7a2e2e" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  const cheeks = kid || mood >= 80 ? `<circle cx="34" cy="${my - 3}" r="3.6" fill="#ff7a7a" opacity=".28"/><circle cx="66" cy="${my - 3}" r="3.6" fill="#ff7a7a" opacity=".28"/>` : '';
  const wrinkles = age >= 55 ? `<path d="M32 ${ey + 1} l-3 -1 M68 ${ey + 1} l3 -1 M42 ${my - 5} q-3 3 -2 6 M58 ${my - 5} q3 3 2 6" stroke="${skinD}" stroke-width="1.2" fill="none" stroke-linecap="round"/>` : '';
  const beard = L.beard && age >= 18 && gender !== 'f' ? `<path d="M30 ${hy + 2} Q31 ${hy + 26} 50 ${hy + 28} Q69 ${hy + 26} 70 ${hy + 2} Q66 ${hy + 16} 58 ${my + 1} Q50 ${my - 3} 42 ${my + 1} Q34 ${hy + 16} 30 ${hy + 2} Z" fill="${hc}" opacity=".92"/>` : '';
  const glasses = L.glasses && age >= 6 ? `<g fill="none" stroke="#2b2b33" stroke-width="1.8"><rect x="34" y="${ey - 5}" width="13" height="10" rx="4"/><rect x="53" y="${ey - 5}" width="13" height="10" rx="4"/><path d="M47 ${ey} h6"/></g>` : '';
  const nose = baby ? '' : `<path d="M50 ${ey + 3} q-2 5 1 6" stroke="${skinD}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  const body = baby ? `<path d="M26 100 Q28 78 50 76 Q72 78 74 100 Z" fill="${shirt}"/>` : `<path d="M18 100 Q20 76 50 74 Q80 76 82 100 Z" fill="${shirt}"/><path d="M42 74 L50 82 L58 74" fill="none" stroke="${shade(shirt, 0.75)}" stroke-width="2"/>`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="portrait-svg">${back}${body}<rect x="44" y="${hy + 16}" width="12" height="12" rx="4" fill="${skinD}"/><ellipse cx="${50 - hrx}" cy="${hy + 2}" rx="4" ry="5.5" fill="${skinD}"/><ellipse cx="${50 + hrx}" cy="${hy + 2}" rx="4" ry="5.5" fill="${skinD}"/><ellipse cx="50" cy="${hy}" rx="${hrx}" ry="${hry}" fill="${skin}"/>${wrinkles}${cheeks}${beard}${eyes}${brows}${nose}${mouth}${glasses}${top}</svg>`;
}

function ensureLooks() {
  if (!S) return;
  const parents = S.people.filter((p) => p.role === 'mother' || p.role === 'father');
  for (const p of parents) if (!p.look) p.look = randomLook(p.gender, S.country);
  if (!S.look) S.look = randomLook(S.gender, S.country, parents);
  for (const p of S.people) if (!p.look) {
    if (p.role === 'child' || p.role === 'grandchild') { const other = S.people.find((x) => x.id === p.otherParent); p.look = randomLook(p.gender, S.country, [{ look: S.look }, other]); }
    else if (p.role === 'sibling') p.look = randomLook(p.gender, S.country, parents);
    else p.look = randomLook(p.gender, S.country);
  }
}
playerPortrait = () => { ensureLooks(); return portraitSVG(S.look, S.age, S.stats.happy, S.gender); };
personPortrait = (p) => { ensureLooks(); return portraitSVG(p.look, p.age, p.close, p.gender); };

// при продолжении за ребёнка его внешность сохраняется
const _continueAs = continueAs;
continueAs = function (k) { ensureLooks(); const look = k.look; _continueAs(k); if (look) { S.look = look; save(); render(); } };

/* ---------- конструктор ---------- */
EXTRA_TITLES.looks = '🪞 Внешность';
EXTRA_PANELS.looks = function () {
  ensureLooks();
  const L = S.look; const B = $('#sheetBody');
  const free = S.age === 0;
  B.appendChild(el(`<div class="look-preview">${portraitSVG(L, Math.max(S.age, 25), 75, S.gender)}${S.age < 25 ? '<small>так вы будете выглядеть взрослым</small>' : ''}</div>`));
  const row = (title, opts, cur, onPick, locked) => {
    section(title + (locked ? ' · с рождения' : ''));
    const wrap = el('<div class="swatches"></div>');
    opts.forEach((o, i) => {
      const b = el(`<button class="sw${i === cur ? ' on' : ''}" ${locked ? 'disabled' : ''} title="${esc(o.name || '')}">${o.c ? `<i style="background:${o.c}"></i>` : esc(o.name)}</button>`);
      b.onclick = () => { onPick(i); save(); render(); refreshSheet(); sfx('click'); };
      wrap.appendChild(b);
    });
    B.appendChild(wrap);
  };
  row('Тон кожи', SKINS.map((c) => ({ c })), L.skin, (i) => (L.skin = i), !free);
  row('Цвет глаз', EYE_COLORS.map((c) => ({ c })), L.eyes, (i) => (L.eyes = i), !free);
  row('Причёска', HAIR_STYLES, HAIR_STYLES.findIndex((h) => h.id === L.hair), (i) => { L.hair = HAIR_STYLES[i].id; if (S.age >= 3) log(`💇 Новая причёска: ${HAIR_STYLES[i].name.toLowerCase()}.`); });
  row('Цвет волос', HAIR_COLORS.map((c) => ({ c })), L.hairColor, (i) => (L.hairColor = i));
  row('Одежда', SHIRTS.map((c) => ({ c })), L.shirt, (i) => (L.shirt = i));
  row('Очки', [{ name: 'Без очков' }, { name: '👓 В очках' }], L.glasses ? 1 : 0, (i) => (L.glasses = !!i));
  if (S.gender !== 'f') row('Борода', [{ name: 'Без бороды' }, { name: '🧔 С бородой' }], L.beard ? 1 : 0, (i) => (L.beard = !!i));
};
MENU_HOOKS.unshift((l) => item(l, { e: '🪞', t: 'Внешность', d: 'Причёска, цвет волос, одежда, очки', onClick: () => openPanel('looks') }));
document.addEventListener('click', (e) => { if (e.target.closest('#avatar') && S && S.alive) openPanel('looks'); });

// портрет на карточке итога жизни
const _shareLife = shareLife;
shareLife = function () {
  ensureLooks();
  const svg = portraitSVG(S.look, S.age, S.alive ? S.stats.happy : 50, S.gender).replace('<svg ', '<svg width="300" height="300" ');
  const img = new Image();
  img.onload = () => { S._portraitImg = img; _shareLife(); S._portraitImg = null; };
  img.onerror = () => _shareLife();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};
const _lifeCard = lifeCardCanvas;
lifeCardCanvas = function () {
  const c = _lifeCard();
  if (S._portraitImg) {
    const x = c.getContext('2d');
    const dark = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() === '#101018';
    x.fillStyle = dark ? '#101018' : '#f5f1ea'; x.fillRect(70, 160, 200, 200);
    x.save(); x.beginPath(); x.arc(170, 260, 95, 0, Math.PI * 2); x.fillStyle = dark ? '#1b1b26' : '#ffffff'; x.fill(); x.clip();
    x.drawImage(S._portraitImg, 75, 165, 190, 190); x.restore();
    if (!S.alive) { x.font = '64px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; x.fillText('🕊️', 230, 350); }
  }
  return c;
};
