// Dalelės lentoje (žiedlapiai, lapeliai, skeveldros, kibirkštys) – piešiama ant <canvas>.
// Silpnesni telefonai: mažiau dalelių ir mažesnė raiška
// Taupus režimas: įjungiamas nustatymuose, o jei nenustatyta – pagal telefono galią ir kadrų dažnį
const liteSaved = (() => {
  try { const s = JSON.parse(localStorage.getItem('sodo-atgaiva-v1') || '{}'); return typeof s.lite === 'boolean' ? s.lite : null; } catch (e) { return null; }
})();
let LITE = liteSaved !== null ? liteSaved : (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
function setLite(on) { LITE = !!on; document.documentElement.classList.toggle('lite', LITE); }
setLite(LITE);
// Jei nenustatyta rankiniu būdu: kelias sekundes pamatuojam kadrus – jei telefonas stringa, įjungiam taupų režimą
if (liteSaved === null && !LITE) {
  window.addEventListener('load', () => setTimeout(() => {
    if (document.visibilityState !== 'visible') return;
    let last = performance.now(), n = 0, slow = 0;
    const t0 = last;
    const probe = (t) => {
      const dt = t - last;
      last = t;
      n++;
      if (dt > 34) slow++;
      if (t - t0 < 3000) return requestAnimationFrame(probe);
      if (n > 20 && slow / n > 0.35 && document.visibilityState === 'visible') setLite(true);
    };
    requestAnimationFrame(probe);
  }, 1500));
}
const Particles = (() => {
  let cv, ctx, W = 0, H = 0, dpr = 1, list = [], raf = 0, last = 0;
  const COLORS = {
    0: ['#f2a7b9', '#e48ea1', '#fbe3e6'],
    1: ['#d9432f', '#f7876a', '#8dbb6c'],
    2: ['#f0c64a', '#fff3b0', '#e2a83c'],
    3: ['#4f8a45', '#8dbb6c', '#2c5530'],
    4: ['#4b5aa6', '#9aa9e0', '#2b3470'],
    5: ['#8a55a6', '#cfa6e0', '#5b2a7a'],
    stone: ['#a99f93', '#7d746a', '#cfc7bb'],
    ice: ['#e6f4fa', '#bfe0ee', '#ffffff'],
    weed: ['#7f9a52', '#5d7d3a', '#a9c07a'],
    moss: ['#6f8f3e', '#8fae52', '#c9d98a'],
    gold: ['#ffe39a', '#f2c14e', '#fff6d6'],
    seed: ['#d9b981', '#c9a46a', '#8dbb6c'],
    flour: ['#fffdf6', '#f6eedd', '#ffffff'],
    grain: ['#e9b54a', '#d99a32', '#f4cf72'],
  };
  const SHAPE = { 0: 'petal', 3: 'leaf', weed: 'leaf', moss: 'dot', gold: 'star', stone: 'chip', ice: 'chip', grain: 'grain' };

  function attach(canvas, w, h) {
    cv = canvas;
    dpr = Math.min(LITE ? 1 : 1.5, window.devicePixelRatio || 1);
    W = w; H = h;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    ctx = cv.getContext('2d');
    list = [];
  }
  function add(p) {
    if (!ctx || list.length > (LITE ? 120 : 260)) return;
    list.push(p);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  function burst(x, y, kind, n = 6, power = 1) {
    if (LITE) n = Math.ceil(n / 2);
    const cols = COLORS[kind] || COLORS.gold;
    const shape = SHAPE[kind] || 'dot';
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rnd(60, 190) * power;
      add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 90 * power, g: shape === 'star' ? 120 : 460,
        life: 0, max: rnd(0.45, 0.85), size: rnd(2.5, 5.5) * (shape === 'chip' ? 0.9 : 1), rot: Math.random() * 6, vr: rnd(-9, 9),
        col: cols[i % cols.length], shape });
    }
  }
  // Miltų debesėlis: minkšti balti kamuoliukai, kurie išsipučia ir lėtai pakyla
  function puff(x, y, n = 9, r = 1) {
    if (LITE) n = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = rnd(4, 16) * r;
      add({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: Math.cos(a) * rnd(18, 55) * r, vy: Math.sin(a) * rnd(10, 40) * r - 28, g: -18,
        life: -rnd(0, 0.08), max: rnd(0.7, 1.1), size: rnd(5, 9) * r, grow: rnd(1.6, 2.6), alpha: 0.75, rot: 0, vr: 0,
        col: COLORS.flour[i % 3], shape: 'dot' });
    }
  }
  function line(x0, y0, x1, y1, n = 22) {
    if (LITE) n = 10;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      add({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, vx: rnd(-30, 30), vy: rnd(-50, 10), g: 60,
        life: -t * 0.15, max: rnd(0.45, 0.7), size: rnd(2.5, 5), rot: 0, vr: rnd(-4, 4), col: COLORS.gold[i % 3], shape: 'star' });
    }
  }
  function sparkleAll(n = 40) {
    if (LITE) n = Math.min(n, 18);
    for (let i = 0; i < n; i++) {
      add({ x: rnd(0, W), y: rnd(0, H), vx: rnd(-20, 20), vy: rnd(-40, 0), g: 40,
        life: -rnd(0, 0.3), max: rnd(0.5, 0.9), size: rnd(3, 6), rot: 0, vr: rnd(-3, 3), col: COLORS.gold[i % 3], shape: 'star' });
    }
  }

  function draw(p) {
    const s = p.size;
    ctx.beginPath();
    if (p.shape === 'petal') ctx.ellipse(0, 0, s * 1.1, s * 0.6, 0, 0, Math.PI * 2);
    else if (p.shape === 'leaf') ctx.ellipse(0, 0, s * 1.3, s * 0.45, 0, 0, Math.PI * 2);
    else if (p.shape === 'grain') ctx.ellipse(0, 0, s * 0.95, s * 0.55, 0, 0, Math.PI * 2);
    else if (p.shape === 'chip') { ctx.moveTo(-s, -s * 0.6); ctx.lineTo(s * 0.9, -s * 0.4); ctx.lineTo(s * 0.4, s * 0.8); ctx.lineTo(-s * 0.7, s * 0.5); ctx.closePath(); }
    else if (p.shape === 'star') {
      for (let k = 0; k < 8; k++) {
        const r = k % 2 ? s * 0.35 : s * 1.2;
        const a = (k * Math.PI) / 4;
        k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(r, 0);
      }
      ctx.closePath();
    } else ctx.arc(0, 0, s * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }

  function tick(t) {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    list = list.filter((p) => {
      p.life += dt;
      if (p.life > p.max) return false;
      if (p.life < 0) return true; // dar nepasirodė
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= p.grow ? 0.94 : 0.985;
      if (p.grow) p.vy *= 0.96;
      p.rot += p.vr * dt;
      const k = 1 - p.life / p.max;
      ctx.globalAlpha = Math.min(1, k * 1.6) * (p.alpha || 1);
      ctx.fillStyle = p.col;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.grow) { const s0 = p.size; p.size = s0 * (1 + (p.life / p.max) * p.grow); draw(p); p.size = s0; } else draw(p);
      ctx.restore();
      return true;
    });
    ctx.globalAlpha = 1;
    if (list.length) raf = requestAnimationFrame(tick);
    else { raf = 0; ctx.clearRect(0, 0, W, H); }
  }

  return { attach, burst, puff, line, sparkleAll };
})();
