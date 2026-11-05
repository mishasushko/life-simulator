/* ===================== Анимации: шторки, деньги, характеристики, достижения, кнопка года ===================== */
(function () {
  if (typeof document === 'undefined' || !document.body || typeof Element === 'undefined' || !Element.prototype.animate) return;
  const calm = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 1. Пункты шторки появляются волной
  const _open = openPanel;
  openPanel = function (name) {
    const r = _open.apply(this, arguments);
    if (!calm()) { let i = 0; for (const n of document.querySelectorAll('#sheetBody > *, #sheetBody .list > .item, #sheetBody .list > .menu-entry')) { if (i > 18) break; n.style.setProperty('--ai', i++); n.classList.add('anim-in'); } }
    return r;
  };
  // 2. Деньги: всплывающее «+/−» и плавный счётчик; 3. характеристики: пульс кольца
  let lastMoney = null, lastStats = {}, lastId = null;
  const _render = render;
  render = function () {
    const r = _render.apply(this, arguments);
    try {
      if (!S) return r;
      const id = S.first + S.birthYear;
      if (id !== lastId) { lastId = id; lastMoney = S.money; lastStats = { ...S.stats }; return r; }
      if (calm()) { lastMoney = S.money; lastStats = { ...S.stats }; return r; }
      const pm = document.getElementById('pMoney');
      if (pm && lastMoney != null && S.money !== lastMoney) {
        const d = S.money - lastMoney; const f = document.createElement('span');
        f.className = 'money-float ' + (d > 0 ? 'up' : 'down'); f.textContent = (d > 0 ? '+' : '−') + fmt(Math.abs(d)).replace(/^−/, '');
        pm.parentNode.style.position = 'relative'; pm.parentNode.appendChild(f); setTimeout(() => f.remove(), 1500);
        pm.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1.2)' });
      }
      for (const ring of document.querySelectorAll('.ring[data-k]')) {
        const k = ring.dataset.k, v = S.stats[k], o = lastStats[k];
        if (o != null && v !== o && Math.abs(v - o) >= 1) { ring.classList.remove('ring-up', 'ring-down'); void ring.offsetWidth; ring.classList.add(v > o ? 'ring-up' : 'ring-down'); }
      }
      lastMoney = S.money; lastStats = { ...S.stats };
    } catch (e) {}
    return r;
  };
  // 4. Достижение — конфетти
  const _unlock = unlock;
  unlock = function (id) {
    const had = S && S.ach && S.ach[id] != null;
    const r = _unlock.apply(this, arguments);
    if (!had && S && S.ach && S.ach[id] != null && !calm()) confetti();
    return r;
  };
  function confetti() {
    const box = document.createElement('div'); box.className = 'confetti'; document.body.appendChild(box);
    const cols = ['#ff5a36', '#ffc83d', '#2bb673', '#3d8bff', '#b45cff'];
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('i'); p.style.background = cols[i % cols.length]; p.style.left = 50 + (Math.random() * 30 - 15) + '%'; box.appendChild(p);
      const x = (Math.random() - 0.5) * 520, y = -(180 + Math.random() * 260), rot = Math.random() * 720;
      p.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${x * 0.6}px, ${y}px) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.45 }, { transform: `translate(${x}px, ${y + 420}px) rotate(${rot}deg)`, opacity: 0 }], { duration: 1500 + Math.random() * 700, easing: 'cubic-bezier(.15,.7,.4,1)', fill: 'forwards' });
    }
    setTimeout(() => box.remove(), 2400);
  }
  window.lifeConfetti = confetti;
  // 5. Кнопка «+1 год»: волна от нажатия
  const age = document.getElementById('ageBtn');
  if (age) age.addEventListener('pointerdown', (e) => {
    if (calm()) return; const r = age.getBoundingClientRect(); const w = document.createElement('span'); w.className = 'age-ripple';
    w.style.left = (e.clientX - r.left) + 'px'; w.style.top = (e.clientY - r.top) + 'px'; age.appendChild(w); setTimeout(() => w.remove(), 650);
  });
  // 6. Экран игры появляется плавно
  const _sg = typeof showGame === 'function' ? showGame : null;
  if (_sg) showGame = function () { const r = _sg.apply(this, arguments); const g = document.getElementById('game'); if (g && !calm()) g.animate([{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'ease-out' }); return r; };
})();
