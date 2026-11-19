// Žaidimo ekranas: lentos piešimas, valdymas pirštu, animacijos, tikslai.
const Game = (() => {
  const $ = (s) => document.querySelector(s);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  let st, lvl, idx, moves, score, goals, busy, selected, cs, els, layers, down, shovelMode, hintTimer, onEnd, ended;
  let mossCleared = false;
  let stats = {};
  let lastMoleAt = -1;
  let lastCombAt = -1;
  let honeyGot = 0;
  let grainGot = 0;
  let extraMoves = 0;

  // ---------- Paleidimas ----------
  // ---------- Greitasis režimas: vietoj ėjimų – laikas ----------
  let timed = false, timeLeft = 0, timeTick = 0, lastTick = 0, timeUp = false;
  function stopTimer() { clearInterval(timeTick); timeTick = 0; }
  function addTime(s, where) {
    if (!timed || ended) return;
    timeLeft += s;
    const m = $('#moves').parentElement;
    const f = document.createElement('div');
    f.className = 'time-plus';
    f.textContent = '+' + s + ' s';
    m.appendChild(f);
    setTimeout(() => f.remove(), 1200);
    updateHUD();
  }
  function tick() {
    const now = performance.now();
    const dt = (now - lastTick) / 1000;
    lastTick = now;
    if (document.hidden || ended) return;
    timeLeft = Math.max(0, timeLeft - dt);
    updateHUD();
    if (timeLeft <= 0 && !timeUp) {
      timeUp = true;
      stopTimer();
      if (!busy) endTimed();
    }
  }
  async function endTimed() {
    if (ended) return;
    ended = true;
    stopHint();
    clearTimeout(reactTimer);
    setAvatar('excited');
    toast(T('Laikas!'));
    Sfx.win();
    await wait(900);
    return onEnd({ win: true, timed: true, stars: starsFor(score), score, levelIndex: idx, stats, snap: snapshot() });
  }

  function start(levelIndex, endCb, opts = {}) {
    idx = levelIndex;
    stopTimer();
    timed = !!opts.timed;
    timeLeft = opts.timed || 0;
    timeUp = false;
    lvl = opts.level || LEVELS[idx];
    onEnd = endCb;
    st = Engine.create(lvl);
    moves = lvl.moves;
    score = 0;
    busy = false;
    ended = false;
    selected = null;
    shovelMode = null;
    tutorial = null;
    specialTip = null;
    mossCleared = false;
    lastMoleAt = -1;
    lastCombAt = -1;
    honeyGot = 0;
    grainGot = 0;
    extraMoves = 0;
    stats = { combos: 0, honey: 0, combs: 0, sacks: 0, grain: 0, pots: 0, moles: 0, collected: {}, specials: 0, bombs: 0, rainbows: 0, effects: 0, bigCascades: 0, weeds: 0, obstacles: 0, moss: 0, seeds: 0, ice: 0, boosters: 0, moves: 0 };
    down = null;
    goals =lvl.goals.map((g) => ({ ...g, have: 0 }));
    $('#level-title').textContent = (opts.title ? T(opts.title) : T('{0} lygis', [idx + 1])) + ' · ';
    $('#toast').classList.remove('show');
    $('#g-bubble').classList.remove('show');
    lastExpr = '';
    setAvatar('normal');
    build();
    renderGoals();
    $('#screen-game').classList.toggle('timed', timed);
    if (timed) {
      $('#goals').innerHTML = `<div class="tm-best"><small>${T('Rekordas')}</small><b>${opts.best || 0}</b></div>`;
      $('#moves').nextElementSibling.textContent = T('sek.');
    } else $('#moves').nextElementSibling.textContent = T('ėjimai');
    updateHUD();
  }
  // Laikmatis paleidžiamas tik paspaudus „Pradėti“
  function startTimer() {
    if (!timed) return;
    stopTimer();
    lastTick = performance.now();
    timeTick = setInterval(tick, 100);
  }

  function build() {
    const board = $('#board');
    const wrap = $('#board-wrap');
    board.innerHTML = '';
    els = new Map();
    cs = fitSize();
    board.style.width = cs * st.cols + 'px';
    board.style.height = cs * st.rows + 'px';
    layers = {};
    for (const n of ['tiles', 'pieces', 'over', 'fx']) {
      const d = document.createElement('div');
      d.className = 'layer ' + n;
      board.appendChild(d);
      layers[n] = d;
    }
    const pc = document.createElement('canvas');
    pc.className = 'layer particles';
    board.appendChild(pc);
    Particles.attach(pc, cs * st.cols, cs * st.rows);
    renderStatic();
    Engine.forEachCell(st, (cell, r, c) => {
      if (cell.piece) placeEl(makePieceEl(cell.piece), r, c);
    });
  }

  // Kurmių šuolis: perpiešiam kliūtis ir animuojam perkeltus elementus
  async function jumpMoles(only) {
    const { moves: mv, jumps } = Engine.moveMoles(st, only);
    if (!jumps.length) return;
    renderStatic();
    jumps.forEach((j) => { burst(j.to[0], j.to[1], 'stone-b'); Particles.burst(mid(j.to[1]), mid(j.to[0]), 'stone', 6, 0.8); });
    document.querySelectorAll('.stone.mole').forEach((e) => e.classList.add('popup'));
    Sfx.stone();
    react('surprised', pick(['Kurmis pabėgo!', 'Ten jis!', 'Vėl išniro!']), 1400);
    await syncPieces(mv);
  }

  // Lentos sudrebėjimas
  function shake(strong = false) {
    const b = $('#board');
    b.classList.remove('shake', 'shake2');
    void b.offsetWidth;
    b.classList.add(strong ? 'shake2' : 'shake');
    Sfx.vibe(strong ? [40, 30, 60] : 30);
  }
  const mid = (v) => (v + 0.5) * cs;

  function fitSize() {
    const wrap = $('#board-wrap');
    const W = (wrap.clientWidth || window.innerWidth - 20) - 4;
    const H = (wrap.clientHeight || window.innerHeight - 220) - 4;
    return Math.max(24, Math.floor(Math.min(W / st.cols, H / st.rows, 68)));
  }
  let pendingLayout = false;
  function relayout() {
    if (!st || ended) return;
    if (busy) { pendingLayout = true; return; }
    pendingLayout = false;
    if (fitSize() !== cs) build();
  }
  if (window.ResizeObserver) {
    window.addEventListener('DOMContentLoaded', () => {
      new ResizeObserver(() => relayout()).observe($('#board-wrap'));
    });
  }

  // ---------- Piešimas ----------
  function setBox(el, r, c) {
    el.style.left = c * cs + 'px';
    el.style.top = r * cs + 'px';
    el.style.width = el.style.height = cs + 'px';
  }
  // Lentos pagrindas (langeliai ir kliūtys). Be argumentų – visa lenta; su langelių sąrašu – tik jie.
  const cellEls = new Map();
  function renderCell(r, c) {
    const k = r * 100 + c;
    const old = cellEls.get(k);
    if (old) old.forEach((e) => e.remove());
    const cell = st.cells[r][c];
    const made = [];
    if (cell.hole) { cellEls.set(k, made); return; }
    const t = document.createElement('div');
    t.className = 'tile ' + ((r + c) % 2 ? 'b' : 'a') + (cell.weed ? ' weed' + cell.weed : '') + (cell.moss ? ' moss' : '');
    if (cell.weed) t.innerHTML = ART.weed(cell.weed);
    else if (cell.moss) t.innerHTML = ART.moss;
    setBox(t, r, c);
    layers.tiles.appendChild(t);
    made.push(t);
    if (cell.pot) {
      const p = document.createElement('div');
      p.className = 'stone pot';
      const fill = 1 - cell.pot.left / cell.pot.need;
      p.innerHTML = ART.pot(fill) + `<span class="pot-ic">${ART.pieces[cell.pot.type]}</span><b class="pot-n">${cell.pot.left}</b>`;
      setBox(p, r, c);
      layers.over.appendChild(p);
      made.push(p);
    } else if (cell.stone) {
      const s = document.createElement('div');
      s.className = 'stone';
      s.innerHTML = cell.comb ? ART.comb(cell.stone) : cell.sack ? ART.sack(cell.stone) : cell.mole ? ART.mole : cell.stump ? ART.stump(cell.stone) : ART.stone(cell.stone);
      if (cell.mole) s.classList.add('mole', cell.stone < 2 ? 'hurt' : 'ok');
      setBox(s, r, c);
      layers.over.appendChild(s);
      made.push(s);
    }
    if (cell.ice) {
      const i = document.createElement('div');
      i.className = 'ice';
      if (Img.has('ice')) { i.classList.add('img'); i.innerHTML = Img.tag('ice'); }
      setBox(i, r, c);
      layers.over.appendChild(i);
      made.push(i);
    }
    cellEls.set(k, made);
  }
  function renderStatic(cells) {
    if (cells) {
      const seen = new Set();
      for (const { r, c } of cells) {
        const k = r * 100 + c;
        if (seen.has(k) || !st.cells[r] || !st.cells[r][c]) continue;
        seen.add(k);
        renderCell(r, c);
      }
      return;
    }
    layers.tiles.innerHTML = '';
    layers.over.innerHTML = '';
    cellEls.clear();
    Engine.forEachCell(st, (cell, r, c) => renderCell(r, c));
  }
  function makePieceEl(p) {
    const el = document.createElement('div');
    const inner = document.createElement('div');
    inner.className = 'inner';
    el.appendChild(inner);
    el.style.width = el.style.height = cs + 'px';
    setLook(el, p);
    layers.pieces.appendChild(el);
    els.set(p.id, el);
    return el;
  }
  function setLook(el, p) {
    el.className = 'piece' + (p.special ? ' sp-' + p.special : '') + (p.honey ? ' honey' : '');
    el.firstChild.innerHTML = (p.special === 'rainbow' ? ART.rainbow : p.special === 'seed' ? ART.seedBag : ART.pieces[p.type]) + (p.honey ? '<span class="honeyov"></span>' : '');
  }
  function placeEl(el, r, c) {
    el.style.transform = `translate3d(${c * cs}px, ${r * cs}px, 0)`;
  }
  function refreshAllLooks() {
    Engine.forEachCell(st, (cell) => {
      if (cell.piece && els.has(cell.piece.id)) setLook(els.get(cell.piece.id), cell.piece);
    });
  }

  async function animSwap(list, ms = 200) {
    for (const [id, r, c] of list) {
      const el = els.get(id);
      el.style.transition = `transform ${ms}ms cubic-bezier(.4,0,.2,1)`;
      el.classList.remove('swapping');
      void el.offsetWidth;
      el.classList.add('swapping');
      placeEl(el, r, c);
      setTimeout(() => el.classList.remove('swapping'), ms + 40);
    }
    await wait(ms + 10);
  }

  // Animuoja kritimą: kiekvienas elementas iš savo pradinės vietos į naują.
  async function syncPieces(origin) {
    let maxT = 0;
    const anim = [];
    Engine.forEachCell(st, (cell, r, c) => {
      const p = cell.piece;
      if (!p) return;
      let el = els.get(p.id);
      const from = origin.get(p.id);
      if (!el) {
        el = makePieceEl(p);
        el.style.transition = 'none';
        el.style.opacity = '0';
        placeEl(el, from ? from[0] : r, from ? from[1] : c);
      }
      if (from) {
        // Kritimas su „gravitacija“: ilgesnis kelias – greitesnis, bet ne tiesiškai
        const d = Math.hypot(r - from[0], c - from[1]);
        const t = Math.round(Math.min(150 + Math.sqrt(d) * 105, 520));
        // Žemesni elementai pajuda truputį anksčiau – krenta „bangele“
        const delay = Math.max(0, (st.rows - 1 - r)) * 14 + c * 4;
        maxT = Math.max(maxT, t + delay);
        anim.push([el, r, c, t, delay]);
      }
    });
    void layers.pieces.offsetHeight; // priverstinai pritaikom pradines pozicijas
    for (const [el, r, c, t, delay] of anim) {
      el.style.transition = `transform ${t}ms cubic-bezier(.55,0,.85,.36) ${delay}ms, opacity 220ms ease-out ${delay}ms`;
      el.style.opacity = '1';
      placeEl(el, r, c);
      el.classList.remove('land');
      setTimeout(() => { el.classList.remove('land'); void el.offsetWidth; el.classList.add('land'); }, t + delay);
    }
    Engine.forEachCell(st, (cell) => {
      if (cell.piece) {
        const el = els.get(cell.piece.id);
        if (el && el.style.opacity === '0') el.style.opacity = '1';
      }
    });
    if (maxT) await wait(maxT + 30);
  }

  function fx(e) {
    const d = document.createElement('div');
    const { special, r, c } = e;
    if (special === 'row') {
      d.className = 'fx beam-h';
      d.style.top = r * cs + 'px';
      d.style.height = cs + 'px';
    } else if (special === 'col') {
      d.className = 'fx beam-v';
      d.style.left = c * cs + 'px';
      d.style.width = cs + 'px';
    } else if (special === 'bomb' || special === 'big') {
      const n = special === 'big' ? 5 : 3;
      d.className = 'fx blast';
      d.style.width = d.style.height = n * cs + 'px';
      d.style.left = (c + 0.5) * cs - (n * cs) / 2 + 'px';
      d.style.top = (r + 0.5) * cs - (n * cs) / 2 + 'px';
    } else {
      d.className = 'fx flash';
    }
    layers.fx.appendChild(d);
    setTimeout(() => d.remove(), 650);
    // Dalelės ir garsai
    if (special === 'row') { Particles.line(0, mid(r), cs * st.cols, mid(r)); Sfx.whoosh(); }
    else if (special === 'col') { Particles.line(mid(c), 0, mid(c), cs * st.rows); Sfx.whoosh(); }
    else if (special === 'bomb' || special === 'big') {
      Particles.burst(mid(c), mid(r), 'gold', special === 'big' ? 34 : 20, special === 'big' ? 2 : 1.5);
      Sfx.boom(special === 'big');
      shake(special === 'big');
    } else { Particles.sparkleAll(special === 'all' ? 70 : 40); Sfx.sparkle(); shake(special === 'all'); }
  }
  function burst(r, c, cls) {
    const d = document.createElement('div');
    d.className = 'fx burst ' + cls;
    setBox(d, r, c);
    layers.fx.appendChild(d);
    setTimeout(() => d.remove(), 500);
  }
  function floatText(text, r, c, cls = '') {
    const d = document.createElement('div');
    d.className = 'fx float ' + cls;
    d.textContent = text;
    d.style.left = (c + 0.5) * cs + 'px';
    d.style.top = (r + 0.5) * cs + 'px';
    layers.fx.appendChild(d);
    setTimeout(() => d.remove(), 900);
  }
  // ---------- Didieji deriniai (sukeisti du ypatingi elementai) ----------
  const COMBO_NAMES = {
    all: ['Sodo stebuklas!', 3], rbsp: ['Auksinis lietus!', 3], bombs: ['Didysis sprogimas!', 2],
    linebomb: ['Super šluota!', 2], lines: ['Kryžius!', 1],
  };
  function comboKind(pa, pb) {
    const A = pa.special, B = pb.special;
    if (!A || !B) return null;
    if (A === 'rainbow' && B === 'rainbow') return 'all';
    if (A === 'rainbow' || B === 'rainbow') return 'rbsp';
    if (A === 'bomb' && B === 'bomb') return 'bombs';
    if (A === 'bomb' || B === 'bomb') return 'linebomb';
    return 'lines';
  }
  async function comboShow(kind, r, c) {
    const [name, lvl] = COMBO_NAMES[kind];
    stats.combos = (stats.combos || 0) + 1;
    addTime(lvl === 3 ? 5 : 3);
    const board = $('#board');
    // Šviesos banga iš derinio vietos
    const wave = document.createElement('div');
    wave.className = 'fx combo-wave l' + lvl;
    wave.style.left = (c + 0.5) * cs + 'px';
    wave.style.top = (r + 0.5) * cs + 'px';
    layers.fx.appendChild(wave);
    setTimeout(() => wave.remove(), 1100);
    // Užrašas virš lentos
    const tag = document.createElement('div');
    tag.className = 'combo-tag l' + lvl;
    tag.textContent = T(name);
    $('#board-wrap').appendChild(tag);
    setTimeout(() => tag.remove(), 1700);
    Particles.burst(mid(c), mid(r), 'gold', 10 + lvl * 8, 1 + lvl * 0.35);
    Sfx.combo(lvl);
    react('excited', pick(['Oho-ho-ho!', 'Kas per derinys!', 'Nuostabu!', 'Va čia tai bai!']), 1600);
    board.classList.remove('shake1', 'shake2', 'shake3');
    void board.offsetWidth;
    board.classList.add('shake' + lvl);
    setTimeout(() => board.classList.remove('shake' + lvl), 700);
    await wait(260 + lvl * 60);
  }

  function toast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
  }

  async function animateResolve(res, cascade) {
    res.effects.forEach(fx);
    for (const x of res.removed) {
      Particles.burst(mid(x.c), mid(x.r), x.type >= 0 ? x.type : 'gold', res.removed.length > 20 ? 1 : res.removed.length > 10 ? 2 : 5);
      const el = els.get(x.id);
      if (!el) continue;
      els.delete(x.id);
      el.style.transition = 'none';
      el.classList.add('pop');
      setTimeout(() => el.remove(), 320);
    }
    for (const x of res.created) {
      const el = makePieceEl(st.cells[x.r][x.c].piece);
      placeEl(el, x.r, x.c);
      el.classList.add('born');
    }
    res.stonesHit.forEach((s) => {
      burst(s.r, s.c, 'stone-b');
      if (s.sack) {
        // Miltų maišas: pabyra miltų debesėlis, o pradraskius – ir grūdai
        Particles.puff(mid(s.c), mid(s.r), s.left > 0 ? 8 : 12, s.left > 0 ? 0.9 : 1.2);
        if (s.left <= 0) Particles.burst(mid(s.c), mid(s.r), 'grain', 10, 1);
      } else Particles.burst(mid(s.c), mid(s.r), 'stone', 8, 1.2);
    });
    res.iceBroken.forEach((s) => { burst(s.r, s.c, 'ice-b'); Particles.burst(mid(s.c), mid(s.r), 'ice', 9); });
    res.weedsHit.forEach((s) => { burst(s.r, s.c, 'weed-b'); Particles.burst(mid(s.c), mid(s.r), 'weed', 5, 0.8); });
    res.mossHit.forEach((s) => Particles.burst(mid(s.c), mid(s.r), 'moss', 5, 0.7));
    res.potsHit.forEach((s) => { burst(s.r, s.c, 'pot-b'); Particles.burst(mid(s.c), mid(s.r), s.left <= 0 ? 'gold' : 'weed', s.left <= 0 ? 14 : 6, s.left <= 0 ? 1.3 : 0.8); });
    if (res.potsHit.some((p) => p.left <= 0)) Sfx.unlock();
    if (res.stonesHit.some((h) => h.sack)) Sfx.sack();
    else if (res.stonesHit.length) Sfx.stone();
    if (res.iceBroken.length) Sfx.ice();
    const touched = [...res.stonesHit, ...res.iceBroken, ...res.weedsHit, ...res.potsHit, ...res.mossHit];
    if (touched.length) renderStatic(touched);
    if (res.removed.length) {
      const ar = res.removed.reduce((a, x) => a + x.r, 0) / res.removed.length;
      const ac = res.removed.reduce((a, x) => a + x.c, 0) / res.removed.length;
      floatText('+' + res.points, ar, ac, cascade > 1 ? 'big' : '');
    }
    if (res.removed.length || res.stonesHit.length || res.iceBroken.length) Sfx.pop(cascade);
    await wait(res.effects.length ? 300 : 230);
  }

  // ---------- Pūkio reakcijos ----------
  let reactTimer, lastExpr = '';
  function setAvatar(expr) {
    if (expr === lastExpr) return;
    lastExpr = expr;
    $('#g-avatar').innerHTML = ART.pukis(expr, true);
  }
  function react(expr, text, ms = 1800) {
    setAvatar(expr);
    const b = $('#g-bubble');
    if (text) {
      b.textContent = text;
      b.classList.remove('show');
      void b.offsetWidth;
      b.classList.add('show');
    }
    const av = $('#g-avatar');
    av.classList.remove('hop');
    void av.offsetWidth;
    av.classList.add('hop');
    clearTimeout(reactTimer);
    reactTimer = setTimeout(() => {
      b.classList.remove('show');
      if (!ended) setAvatar(moves <= 3 ? 'surprised' : 'normal');
    }, ms);
  }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function greet() {
    react('happy', pick(['Pirmyn!', 'Sėkmės!', 'Dirbam!']));
  }

  // ---------- Tikslai ir HUD ----------
  function remaining(g) {
    switch (g.kind) {
      case 'collect': return Math.max(0, g.count - g.have);
      case 'weeds': return Engine.count(st, (c) => c.weed > 0);
      case 'stones': return Engine.count(st, (c) => c.stone > 0 && !c.stump && !c.mole && !c.comb && !c.sack);
      case 'sacks': return Engine.count(st, (c) => c.stone > 0 && c.sack);
      case 'grain': return Math.max(0, g.count - grainGot);
      case 'combs': return Engine.count(st, (c) => c.stone > 0 && c.comb);
      case 'honey': return Math.max(0, g.count - honeyGot);
      case 'moles': return Engine.count(st, (c) => c.stone > 0 && c.mole);
      case 'stumps': return Engine.count(st, (c) => c.stone > 0 && c.stump);
      case 'pots': return Engine.count(st, (c) => !!c.pot);
      case 'moss': return Engine.count(st, (c) => c.moss > 0);
      case 'seeds': return Math.max(0, st.seedTotal - st.seedsCollected);
      case 'ice': return Engine.count(st, (c) => c.ice > 0);
      case 'score': return Math.max(0, g.score - score);
    }
    return 0;
  }
  const goalsDone = () => !timed && goals.every((g) => remaining(g) === 0);

  function goalIcon(g) {
    switch (g.kind) {
      case 'collect': return ART.pieces[g.type];
      case 'weeds': return `<span class="mini-tile">${ART.weed(2)}</span>`;
      case 'stones': return ART.stone(2);
      case 'stumps': return ART.stump(3);
      case 'moles': return ART.mole;
      case 'combs': return ART.comb(2);
      case 'honey': return ART.honeyDrop;
      case 'sacks': return ART.sack(2);
      case 'grain': return ART.grain;
      case 'pots': return ART.pot(0.6);
      case 'moss': return `<span class="mini-tile moss">${ART.moss}</span>`;
      case 'seeds': return ART.seedBag;
      case 'ice': return ART.ice;
      case 'score': return '<span class="score-ico">★</span>';
    }
  }
  function renderGoals() {
    const box = $('#goals');
    box.innerHTML = '';
    goals.forEach((g, i) => {
      const d = document.createElement('div');
      d.className = 'goal';
      d.innerHTML = `<div class="goal-ico">${goalIcon(g)}</div><div class="goal-n" id="goal-${i}"></div>`;
      box.appendChild(d);
    });
  }
  function updateHUD() {
    $('#moves').textContent = timed ? Math.ceil(timeLeft) : moves;
    $('#moves').parentElement.classList.toggle('low', timed ? timeLeft <= 10 : moves <= 5);
    $('#score').textContent = score;
    const max = lvl.stars[2];
    $('#progress-fill').style.width = Math.min(100, (score / max) * 100) + '%';
    lvl.stars.forEach((s, i) => {
      const m = $('#mark-' + i);
      m.style.left = (s / max) * 100 + '%';
      m.classList.toggle('on', score >= s);
    });
    goals.forEach((g, i) => {
      const n = remaining(g);
      const el = $('#goal-' + i);
      el.parentElement.classList.toggle('done', n === 0);
      el.textContent = n === 0 ? '✓' : n;
    });
    for (const k of ['shovel', 'can', 'rake']) {
      const n = Store.data.boosters[k] || 0;
      $('#cnt-' + k).textContent = n;
      $('#b-' + k).classList.toggle('active', shovelMode === k);
      $('#b-' + k).classList.toggle('empty', n <= 0);
    }
  }
  function starsFor(s) {
    return 1 + (s >= lvl.stars[1] ? 1 : 0) + (s >= lvl.stars[2] ? 1 : 0);
  }

  // ---------- Ėjimo eiga ----------
  async function runCascade(first) {
    let step = first;
    let cascade = 1;
    let madeSpecial = false;
    const hitMoles = [];
    while (true) {
      const res = Engine.resolve(st, step, cascade);
      if (res.created.length) { madeSpecial = true; noteSpecials(res.created); }
      if (res.mossHit.length) mossCleared = true;
      for (const t in res.collected) stats.collected[t] = (stats.collected[t] || 0) + res.collected[t];
      stats.specials += res.created.length;
      stats.rainbows += res.created.filter((x) => { const c = st.cells[x.r][x.c]; return c.piece && c.piece.special === 'rainbow'; }).length;
      stats.bombs += res.effects.filter((e) => e.special === 'bomb').length;
      stats.effects += res.effects.length;
      stats.weeds += res.weedsHit.length;
      stats.obstacles += res.stonesHit.filter((h) => !h.mole).length;
      stats.moles += res.molesCaught;
      stats.honey += res.honeyGot;
      stats.combs += res.combsBroken;
      stats.pots += res.potsDone;
      honeyGot += res.honeyGot;
      grainGot += res.grainGot;
      stats.grain += res.grainGot;
      stats.sacks += res.sacksBroken;
      if (res.sacksBroken) { react('excited', pick(['Grūdai byra!', 'Maišas pradraskytas – +3 grūdai!', 'Bus miltų!']), 1400); }
      if (res.potsDone) react('excited', pick(['Pražydo!', 'Vazonas pilnas!', 'Kokie žiedai!']), 1400);
      if (res.combsBroken) react('excited', pick(['Bzz! Medus bėga!', 'Korys sudaužytas – +3 lašai!']), 1400);
      res.stonesHit.forEach((h) => { if (h.left <= 0 && st.cells[h.r][h.c] && !st.cells[h.r][h.c].comb && res.combsBroken) Particles.burst(mid(h.c), mid(h.r), 'gold', 10, 1); });
      res.stonesHit.forEach((h) => { if (h.mole && h.left > 0) hitMoles.push([h.r, h.c]); });
      if (res.molesCaught) react('happy', pick(['Kurmis išprašytas!', 'Sudie, kurmi!', 'Vienu mažiau!']), 1400);
      stats.moss += res.mossHit.length;
      stats.ice += res.iceBroken.length;
      score += res.points;
      for (const g of goals) if (g.kind === 'collect') g.have += res.collected[g.type] || 0;
      updateHUD();
      await animateResolve(res, cascade);
      await syncPieces(Engine.gravity(st));
      // Sėklų maišeliai, pasiekę apačią
      while (true) {
        const got = Engine.collectSeeds(st);
        if (!got.length) break;
        for (const s of got) {
          const el = els.get(s.id);
          els.delete(s.id);
          if (el) { el.classList.add('collect'); setTimeout(() => el.remove(), 600); }
          floatText('+1 maišelis', s.r, s.c, 'big');
          Particles.burst(mid(s.c), mid(s.r), 'seed', 12, 1.2);
          Particles.burst(mid(s.c), mid(s.r), 'gold', 8, 0.8);
          stats.seeds++;
          Sfx.vibe(25);
          score += 500;
        }
        Sfx.unlock();
        react('excited', pick(['Maišelis daržui!', 'Puiku, sėklos!', 'Dar vienas!']));
        updateHUD();
        await wait(450);
        await syncPieces(Engine.gravity(st));
      }
      let groups = Engine.findMatches(st);
      // Užkliudyti kurmiai pabėga
      if (!groups.length && hitMoles.length) {
        await jumpMoles(hitMoles.splice(0));
        groups = Engine.findMatches(st);
      }
      if (!groups.length) break;
      cascade++;
      step = { groups };
      // Didelė grandinė – trumpas „sulėtėjimas“
      if (cascade === 4) {
        const b = $('#board');
        b.classList.add('bigmoment');
        Sfx.big();
        Sfx.vibe([20, 30, 20]);
        await wait(320);
        setTimeout(() => b.classList.remove('bigmoment'), 900);
      }
    }
    if (cascade >= 4) stats.bigCascades++;
    if (cascade >= 3) Sfx.vibe(cascade >= 4 ? [30, 40, 50] : 30);
    if (cascade >= 4) addTime(2);
    if (cascade >= 4) { toast('Nuostabu!'); react('excited', pick(['Oho-ho!', 'Nuostabu!', 'Kokia grandinė!'])); }
    else if (cascade === 3) { toast('Puiku!'); react('happy', pick(['Puiku!', 'Šaunu!'])); }
    else if (madeSpecial) react('surprised', pick(['Oho!', 'Žiūrėk, kas išaugo!', 'Ypatingas!']));
  }

  async function attemptSwap(a, b) {
    if (busy || ended) return;
    const A = Engine.get(st, a[0], a[1]);
    const B = Engine.get(st, b[0], b[1]);
    if (!Engine.movable(A) || !Engine.movable(B)) return;
    if (A.piece.honey || B.piece.honey) {
      Sfx.bad();
      react('thinking', pick(['Lipnu! Medumi apsemto nepajudinsi.', 'Užklijuota medumi – sudaryk eilę šalia!']), 1600);
      clearSelection();
      return;
    }
    if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return;
    busy = true;
    clearSelection();
    stopHint();
    endTutorial();
    const pa = A.piece, pb = B.piece;
    Sfx.swap();
    Engine.swap(st, a, b);
    await animSwap([[pa.id, b[0], b[1]], [pb.id, a[0], a[1]]]);

    const ck = comboKind(pa, pb);
    const combo = Engine.combo(st, b, a);
    if (combo) {
      if (!timed) moves--;
      stats.moves++;
      updateHUD();
      if (ck) await comboShow(ck, b[0], b[1]);
      if (combo.converted.length) {
        refreshAllLooks();
        combo.converted.forEach((id) => els.get(id) && els.get(id).classList.add('born'));
        await wait(350);
      }
      combo.fx.forEach(fx);
      await runCascade({ seeds: combo.seeds, noTrigger: combo.noTrigger });
    } else {
      const groups = Engine.findMatches(st);
      if (!groups.length) {
        Sfx.bad();
        react('thinking', pick(['Hmm, taip nesusidės…', 'Gal kitaip?', 'Ne, ne ten.']), 1400);
        Engine.swap(st, a, b);
        await animSwap([[pa.id, a[0], a[1]], [pb.id, b[0], b[1]]]);
        busy = false;
        scheduleHint();
        return;
      }
      if (!timed) moves--;
      stats.moves++;
      updateHUD();
      await runCascade({ groups, prefer: [b, a] });
    }
    await afterTurn();
  }

  // Pagalbos: kastuvėlis (1 langelis), laistytuvas (eilutė), grėblys (stulpelis)
  async function useShovel(p) {
    const k = shovelMode;
    const cell = Engine.get(st, p[0], p[1]);
    if (!k || !cell || cell.hole || (Store.data.boosters[k] || 0) <= 0) return;
    busy = true;
    shovelMode = null;
    stopHint();
    Store.data.boosters[k]--;
    Store.save();
    stats.boosters++;
    updateHUD();
    let seeds = [p];
    if (k === 'can') {
      seeds = Array.from({ length: st.cols }, (_, c) => [p[0], c]);
      fx({ special: 'row', r: p[0], c: p[1] });
      react('happy', 'Laistom!', 1200);
    } else if (k === 'rake') {
      seeds = Array.from({ length: st.rows }, (_, r) => [r, p[1]]);
      fx({ special: 'col', r: p[0], c: p[1] });
      react('happy', 'Grėbiam!', 1200);
    }
    Sfx.special();
    await runCascade({ seeds });
    await afterTurn();
  }

  async function afterTurn() {
    // Samanos plinta, jei šį ėjimą nė vienos neišvalei
    if (!mossCleared && Engine.count(st, (c) => c.moss > 0) > 0 && !goalsDone()) {
      const p = Engine.spreadMoss(st);
      if (p) {
        renderStatic();
        burst(p[0], p[1], 'weed-b');
        react('surprised', pick(['Samanos plinta!', 'Ojoj, samanos!']), 1500);
      }
    }
    mossCleared = false;
    // Kurmiai patys peršoka kas kelis ėjimus
    // Koriai laša medumi kas kelis ėjimus
    if (lvl.combEvery && stats.moves > 0 && stats.moves % lvl.combEvery === 0 && stats.moves !== lastCombAt && Engine.count(st, (c) => c.comb && c.stone > 0) && !goalsDone()) {
      lastCombAt = stats.moves;
      const drips = Engine.dripHoney(st);
      for (const dp of drips) {
        const el = els.get(dp.id);
        if (el) { setLook(el, st.cells[dp.to[0]][dp.to[1]].piece); el.classList.add('drip'); }
        Particles.burst(mid(dp.to[1]), mid(dp.to[0]), 2, 5, 0.6);
      }
      if (drips.length) { Sfx.bad(); react('surprised', pick(['Medus laša!', 'Lipnu lipnu!']), 1300); await wait(350); }
    }
    if (lvl.moleEvery && stats.moves > 0 && stats.moves % lvl.moleEvery === 0 && stats.moves !== lastMoleAt && Engine.count(st, (c) => c.mole && c.stone > 0) && !goalsDone()) {
      lastMoleAt = stats.moves;
      await jumpMoles(null);
      const g = Engine.findMatches(st);
      if (g.length) await runCascade({ groups: g });
    }
    updateHUD();
    if (timed && timeUp) return endTimed();
    if (goalsDone()) {
      ended = true;
      clearTimeout(reactTimer);
      setAvatar('excited');
      await celebrate();
      Sfx.win();
      return onEnd({ win: true, stars: starsFor(score), score, levelIndex: idx, stats, snap: snapshot() });
    }
    if (moves <= 0) {
      ended = true;
      clearTimeout(reactTimer);
      setAvatar('sad');
      await wait(300);
      Sfx.lose();
      return onEnd({ win: false, stars: 0, score, levelIndex: idx, stats, snap: snapshot() });
    }
    if (!Engine.findMove(st)) {
      toast('Nėra ėjimų – maišome!');
      await wait(600);
      const before = new Map();
      Engine.forEachCell(st, (cell, r, c) => { if (cell.piece) before.set(cell.piece.id, [r, c]); });
      Engine.shuffle(st);
      refreshAllLooks();
      await syncPieces(before);
    }
    if (specialTip) showSpecialTip();
    else if (moves <= 5 && moves > 1 && !goalsDone() && boosterTip()) { /* patarimas jau parodytas */ }
    else if (moves === 5) react('surprised', 'Liko 5 ėjimai!');
    else if (moves === 1) react('surprised', 'Paskutinis ėjimas!');
    busy = false;
    if (pendingLayout) relayout();
    scheduleHint();
  }

  // Likę ėjimai virsta dryžuotais elementais – „Sodo šventė“.
  async function celebrate() {
    if (moves <= 0) return;
    toast('Sodo šventė!');
    await wait(500);
    const cands = [];
    Engine.forEachCell(st, (cell, r, c) => {
      if (Engine.movable(cell) && !cell.piece.special) cands.push([r, c]);
    });
    for (let i = cands.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cands[i], cands[j]] = [cands[j], cands[i]];
    }
    const picks = cands.slice(0, Math.min(moves, 12));
    for (const [r, c] of picks) {
      const p = st.cells[r][c].piece;
      p.special = Math.random() < 0.5 ? 'row' : 'col';
      const el = els.get(p.id);
      setLook(el, p);
      el.classList.add('born');
      moves--;
      score += 200;
      updateHUD();
      Sfx.click();
      await wait(90);
    }
    score += moves * 200;
    moves = 0;
    updateHUD();
    await wait(300);
    await runCascade({ seeds: picks });
    // Susprogdinam ir likusius specialius elementus
    const left = [];
    Engine.forEachCell(st, (cell, r, c) => { if (cell.piece && cell.piece.special && !cell.ice) left.push([r, c]); });
    if (left.length) await runCascade({ seeds: left });
    await wait(400);
  }

  // ---------- Prožektorius: paryškina langelius (pvz., su nauja kliūtimi) ----------
  const SPOT = {
    weeds: (c) => c.weed > 0,
    stones: (c) => c.stone > 0 && !c.stump && !c.mole && !c.comb && !c.sack,
    ice: (c) => c.ice > 0,
    moss: (c) => c.moss > 0,
    stumps: (c) => c.stone > 0 && c.stump,
    moles: (c) => c.stone > 0 && c.mole,
    honey: (c) => !!(c.piece && c.piece.honey),
    combs: (c) => c.stone > 0 && c.comb,
    pots: (c) => !!c.pot,
    sacks: (c) => c.stone > 0 && c.sack,
    grain: (c) => c.stone > 0 && c.sack,
    seeds: (c) => !!(c.piece && c.piece.type === -2),
  };
  function spotlight(kind, ms = 3600) {
    const test = typeof kind === 'function' ? kind : SPOT[kind];
    if (!test || !st) return 0;
    let n = 0;
    Engine.forEachCell(st, (cell, r, c) => {
      if (n >= 12 || !test(cell)) return;
      n++;
      const e = document.createElement('div');
      e.className = 'fx spot';
      setBox(e, r, c);
      e.style.animationDelay = (n % 4) * 0.12 + 's';
      layers.fx.appendChild(e);
      setTimeout(() => e.remove(), ms);
    });
    return n;
  }
  // Pirmą kartą sukurtas ypatingas elementas – Pūkis paaiškina, ką jis daro
  const SPECIAL_TIPS = {
    row: 'Dryžuotas elementas! Sukeisk jį su kaimynu arba įtrauk į eilę – nušluos visą eilutę.',
    col: 'Dryžuotas elementas! Sukeisk jį su kaimynu arba įtrauk į eilę – nušluos visą stulpelį.',
    bomb: 'Sprogstantis elementas! Pajudink jį – susprogs viskas aplinkui.',
    rainbow: 'Auksinė sėkla! Sukeisk ją su bet kuriuo elementu – dings visi tokie patys.',
  };
  let specialTip = null;
  function noteSpecials(created) {
    const d = Store.data;
    if (specialTip || (d.stats && d.stats.specials > 40)) return;
    if (!d.seenSpecial) d.seenSpecial = {};
    for (const x of created) {
      const p = st.cells[x.r][x.c].piece;
      const k = p && p.special;
      if (!k || d.seenSpecial[k === 'col' ? 'row' : k]) continue;
      d.seenSpecial[k === 'col' ? 'row' : k] = true;
      Store.save();
      specialTip = { id: p.id, text: SPECIAL_TIPS[k] };
      return;
    }
  }
  function showSpecialTip() {
    if (!specialTip) return;
    const { id, text } = specialTip;
    specialTip = null;
    react('excited', text, 5200);
    const el = els.get(id);
    if (el) { el.classList.add('tut'); setTimeout(() => el.classList.remove('tut'), 4200); }
  }
  // Kastuvėlio patarimas – kartą, kai trūksta ėjimų ir žaidėjas dar nė karto nenaudojo pagalbų
  function boosterTip() {
    const d = Store.data;
    if (d.boosterTip || (d.stats && d.stats.boosters) || stats.boosters) return false;
    const k = ['shovel', 'can', 'rake'].find((x) => (d.boosters[x] || 0) > 0);
    if (!k) return false;
    d.boosterTip = true;
    Store.save();
    react('thinking', k === 'shovel' ? 'Užstrigai? Paspausk kastuvėlį apačioje ir iškask bet kurį langelį!' : 'Užstrigai? Pabandyk pagalbą apačioje – ji padės!', 5200);
    const b = $('#b-' + k);
    b.classList.add('tip');
    setTimeout(() => b.classList.remove('tip'), 6000);
    return true;
  }

  // ---------- Mokymas (pirmas lygis) ----------
  let tutorial = null;
  function showTutorial() {
    const m = Engine.findMove(st);
    if (!m) return;
    const [a, b] = m;
    const hand = document.createElement('div');
    hand.className = 'fx tut-hand';
    hand.textContent = '👆';
    hand.style.left = (a[1] + 0.5) * cs + 'px';
    hand.style.top = (a[0] + 0.55) * cs + 'px';
    hand.style.setProperty('--dx', (b[1] - a[1]) * cs + 'px');
    hand.style.setProperty('--dy', (b[0] - a[0]) * cs + 'px');
    layers.fx.appendChild(hand);
    const ids = [a, b].map(([r, c]) => st.cells[r][c].piece.id);
    ids.forEach((id) => els.get(id) && els.get(id).classList.add('tut'));
    tutorial = { hand, ids };
    react('happy', 'Perbrauk pirštu šį elementą – kaip rodo rankutė!', 60000);
  }
  function endTutorial() {
    if (!tutorial) return;
    tutorial.hand.remove();
    tutorial.ids.forEach((id) => els.get(id) && els.get(id).classList.remove('tut'));
    tutorial = null;
    Store.data.tutorialDone = true;
    Store.save();
    setTimeout(() => react('excited', 'Puiku! Taip ir toliau – rink bijūnus!', 2600), 900);
  }

  // ---------- Pagalbos prieš lygį ir tęsimas ----------
  function applyStart(o = {}) {
    if (o.extra) {
      moves += o.extra;
      extraMoves += o.extra;
      updateHUD();
      react('excited', `+${o.extra} ėjimai!`, 1600);
    }
    if (o.bomb) {
      const cands = [];
      Engine.forEachCell(st, (cell, r, c) => { if (Engine.movable(cell) && !cell.piece.special) cands.push([r, c]); });
      const [r, c] = cands[Math.floor(Math.random() * cands.length)];
      const p = st.cells[r][c].piece;
      p.special = 'bomb';
      const el = els.get(p.id);
      setLook(el, p);
      el.classList.add('born');
      Sfx.special();
    }
  }
  // Būsena statistikai
  function snapshot() {
    return {
      movesMade: stats.moves || 0,
      movesLeft: moves,
      movesTotal: lvl ? lvl.moves + extraMoves : 0,
      goalsLeft: goals ? goals.map((g) => remaining(g)) : [],
      boosters: stats.boosters || 0,
      score,
    };
  }

  function resume(n) {
    extraMoves += n;
    moves = n;
    ended = false;
    busy = false;
    updateHUD();
    setAvatar('excited');
    react('excited', 'Dar kartą! Mes galim!', 1800);
    scheduleHint();
  }

  // ---------- Užuominos ----------
  function stopHint() {
    clearTimeout(hintTimer);
    document.querySelectorAll('.piece.hint').forEach((e) => e.classList.remove('hint'));
  }
  function scheduleHint() {
    stopHint();
    hintTimer = setTimeout(() => {
      if (busy || ended || tutorial) return;
      const m = Engine.findMove(st);
      if (!m) return;
      for (const [r, c] of m) {
        const el = els.get(st.cells[r][c].piece.id);
        if (el) el.classList.add('hint');
      }
    }, idx < 5 ? 4000 : 7000);
  }

  // ---------- Valdymas ----------
  function cellFromEvent(e) {
    const rect = $('#board').getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / cs);
    const r = Math.floor((e.clientY - rect.top) / cs);
    const cell = Engine.get(st, r, c);
    if (!cell || cell.hole) return null;
    return [r, c];
  }
  function clearSelection() {
    if (selected) {
      const cell = Engine.get(st, selected[0], selected[1]);
      if (cell && cell.piece && els.get(cell.piece.id)) els.get(cell.piece.id).classList.remove('selected');
    }
    selected = null;
  }
  function select(p) {
    clearSelection();
    const cell = Engine.get(st, p[0], p[1]);
    if (!Engine.movable(cell)) return;
    selected = p;
    els.get(cell.piece.id).classList.add('selected');
  }
  function handleTap(p) {
    if (shovelMode) return useShovel(p);
    if (selected) {
      const d = Math.abs(selected[0] - p[0]) + Math.abs(selected[1] - p[1]);
      if (d === 1) return attemptSwap(selected, p);
      if (d === 0) return clearSelection();
    }
    select(p);
  }

  function bindInput() {
    const board = $('#board');
    board.addEventListener('pointerdown', (e) => {
      if (busy || ended || !st) return;
      const p = cellFromEvent(e);
      if (!p) return;
      stopHint();
      down = { p, x: e.clientX, y: e.clientY };
      try { board.setPointerCapture(e.pointerId); } catch (err) { /* nesvarbu */ }
    });
    board.addEventListener('pointermove', (e) => {
      if (!down || shovelMode) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < cs * 0.3) return;
      const a = down.p;
      down = null;
      const b = Math.abs(dx) > Math.abs(dy) ? [a[0], a[1] + Math.sign(dx)] : [a[0] + Math.sign(dy), a[1]];
      attemptSwap(a, b);
    });
    board.addEventListener('pointerup', () => {
      if (!down) return;
      const p = down.p;
      down = null;
      handleTap(p);
    });
    board.addEventListener('pointercancel', () => { down = null; });

    $('#g-avatar').addEventListener('click', () => {
      if (ended) return;
      react(pick(['happy', 'wink', 'excited']), pick(['Tau puikiai sekasi!', 'Ieškok keturių iš eilės!', 'Uodžiu… kažkas kvepia obuoliais.', 'Kai pasimesi – palauk, parodysiu ėjimą.']), 2400);
    });

    const HINT = { shovel: 'Bakstelk langelį – iškasiu!', can: 'Bakstelk eilutę – palaistysiu!', rake: 'Bakstelk stulpelį – sugrėbsiu!' };
    for (const k of ['shovel', 'can', 'rake']) {
      $('#b-' + k).addEventListener('click', () => {
        if (busy || ended) return;
        if ((Store.data.boosters[k] || 0) <= 0) {
          react('thinking', `${Progress.BOOSTERS[k].name}: nebeliko. Atlik dienos užduotis!`, 2200);
          return;
        }
        shovelMode = shovelMode === k ? null : k;
        clearSelection();
        if (shovelMode) react('wink', HINT[k], 2600);
        updateHUD();
        Sfx.click();
      });
    }
  }

  function stop() {
    ended = true;
    stopTimer();
    stopHint();
  }

  return {
    start, startTimer, bindInput, relayout, stop, goalIcon, greet, showTutorial, applyStart, resume, spotlight,
    get busy() { return busy; },
    get timed() { return timed; },
    get movesMade() { return stats.moves || 0; },
    snapshot,
    // Testavimui: leidžia daryti ėjimus iš konsolės
    debug: { state: () => st, swap: attemptSwap, cellSize: () => cs, setMoves: (n) => { moves = n; updateHUD(); } },
  };
})();
