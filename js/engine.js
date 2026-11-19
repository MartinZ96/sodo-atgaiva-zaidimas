// Žaidimo variklis: lentos būsena, sutapimai, specialūs elementai, gravitacija.
// Čia nėra jokio piešimo – tik logika, todėl ją lengva tobulinti ir testuoti.
const Engine = (() => {
  let nextId = 1;
  const key = (r, c) => r * 100 + c;
  const unkey = (k) => [Math.floor(k / 100), k % 100];
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const rand = (n) => Math.floor(Math.random() * n);

  function newPiece(type, special = null) {
    return { id: nextId++, type, special };
  }
  function get(st, r, c) {
    if (r < 0 || c < 0 || r >= st.rows || c >= st.cols) return null;
    return st.cells[r][c];
  }
  const isFree = (cell) => cell && !cell.hole && !cell.stone && !cell.piece;
  const movable = (cell) => !!(cell && !cell.hole && cell.piece && !cell.ice);
  function randColor(st) {
    return st.colors[rand(st.colors.length)];
  }
  function typeAt(st, r, c) {
    const cell = get(st, r, c);
    if (!cell || !cell.piece || cell.piece.special === 'rainbow') return -1;
    return cell.piece.type;
  }
  function wouldMatch(st, r, c, t) {
    return (
      (typeAt(st, r, c - 1) === t && typeAt(st, r, c - 2) === t) ||
      (typeAt(st, r - 1, c) === t && typeAt(st, r - 2, c) === t)
    );
  }
  function forEachCell(st, fn) {
    for (let r = 0; r < st.rows; r++) for (let c = 0; c < st.cols; c++) fn(st.cells[r][c], r, c);
  }
  function count(st, pred) {
    let n = 0;
    forEachCell(st, (cell) => { if (!cell.hole && pred(cell)) n++; });
    return n;
  }

  // ---------- Sukūrimas ----------
  function create(level) {
    const rows = level.layout.length;
    const cols = level.layout[0].length;
    const cells = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const ch = level.layout[r][c];
        row.push({
          hole: ch === '#',
          weed: ch === 'w' ? 1 : ch === 'W' ? 2 : 0,
          stone: ch === 's' || ch === 'v' ? 1 : ch === 'S' || ch === 'k' || ch === 'c' || ch === 'f' ? 2 : ch === 'T' ? 3 : 0,
          stump: ch === 'T',
          mole: ch === 'k',
          comb: ch === 'c',
          sack: ch === 'f',
          pot: null,
          moss: ch === 'm' ? 1 : 0,
          ice: ch === 'i' ? 1 : 0,
          piece: null,
        });
      }
      cells.push(row);
    }
    const st = { rows, cols, cells, colors: level.colors, seedTotal: 0, seedLeft: 0, seedMax: 0, seedsCollected: 0 };
    // 'v' – vazonas: jį pripildo tos spalvos elementai, sudėti šalia (spalvos – paeiliui, nuo atsitiktinės)
    let potI = Math.floor(Math.random() * level.colors.length);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (level.layout[r][c] !== 'v') continue;
      const types = level.potTypes || level.colors;
      const type = types[potI % types.length];
      cells[r][c].pot = { type, need: level.potNeed || 6, left: level.potNeed || 6 };
      potI++;
    }
    if (level.seeds) {
      st.seedTotal = level.seeds.total;
      st.seedMax = level.seeds.max || 2;
      st.seedLeft = st.seedTotal;
    }
    fillInitial(st);
    placeInitialSeeds(st);
    // 'h' – elementas, apsemtas medumi
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (level.layout[r][c] === 'h' && cells[r][c].piece && !cells[r][c].piece.special) cells[r][c].piece.honey = true;
    }
    return st;
  }

  // Sėklų maišeliai: pradžioje padedami viršutinėje eilėje
  function placeInitialSeeds(st) {
    if (!st.seedLeft) return;
    const cand = [];
    for (let c = 0; c < st.cols; c++) {
      for (let r = 0; r < st.rows; r++) {
        const cell = st.cells[r][c];
        if (cell.hole) continue;
        if (movable(cell) && !cell.piece.special && !isBottom(st, r, c)) cand.push([r, c]);
        break;
      }
    }
    for (let i = cand.length - 1; i > 0; i--) { const j = rand(i + 1); [cand[i], cand[j]] = [cand[j], cand[i]]; }
    const n = Math.min(st.seedMax, st.seedLeft, cand.length);
    for (let i = 0; i < n; i++) {
      const [r, c] = cand[i];
      st.cells[r][c].piece = newPiece(-2, 'seed');
      st.seedLeft--;
    }
  }
  const isSeed = (p) => p && p.special === 'seed';
  const isPower = (p) => p && p.special && p.special !== 'seed';
  function isBottom(st, r, c) {
    for (let y = r + 1; y < st.rows; y++) if (!st.cells[y][c].hole) return false;
    return true;
  }
  function seedsOnBoard(st) {
    return count(st, (cell) => isSeed(cell.piece));
  }
  // Nuleisti iki apačios maišeliai surenkami
  function collectSeeds(st) {
    const out = [];
    forEachCell(st, (cell, r, c) => {
      if (isSeed(cell.piece) && isBottom(st, r, c)) {
        out.push({ id: cell.piece.id, r, c });
        cell.piece = null;
        st.seedsCollected++;
      }
    });
    return out;
  }

  // Medumi apsemto elemento negalima perkelti (bet jis krenta ir gali būti sunaikintas)
  const canSwap = (cell) => movable(cell) && !cell.piece.honey;

  // Koriai: kiekvienas apsemia medumi vieną netoliese esantį elementą
  function dripHoney(st) {
    const out = [];
    forEachCell(st, (cell, r, c) => {
      if (!cell.comb || cell.stone <= 0) return;
      for (const R of [1, 2]) {
        const cand = [];
        for (let dr = -R; dr <= R; dr++) for (let dc = -R; dc <= R; dc++) {
          const n = get(st, r + dr, c + dc);
          if (n && movable(n) && !n.piece.special && !n.piece.honey) cand.push([r + dr, c + dc]);
        }
        if (cand.length) {
          const [y, x] = cand[rand(cand.length)];
          st.cells[y][x].piece.honey = true;
          out.push({ from: [r, c], to: [y, x], id: st.cells[y][x].piece.id });
          break;
        }
      }
    });
    return out;
  }

  // Kurmiai: kas kelis ėjimus peršoka į gretimą langelį (elementas iš ten persikelia į jo vietą)
  // only – tik šie kurmiai (pvz., ką tik užkliudyti); kitaip – visi
  function moveMoles(st, only = null) {
    const moves = new Map(); // piece id -> [r, c] iš kur
    const jumps = [];
    const moles = [];
    forEachCell(st, (cell, r, c) => { if (cell.mole && cell.stone > 0) moles.push([r, c]); });
    if (only) { const ks = new Set(only.map(([r, c]) => key(r, c))); for (let i = moles.length - 1; i >= 0; i--) if (!ks.has(key(...moles[i]))) moles.splice(i, 1); }
    for (const [r, c] of moles) {
      const cand = [];
      for (const [dr, dc] of DIRS) {
        const n = get(st, r + dr, c + dc);
        if (n && !n.hole && !n.stone && !n.ice && !n.weed && !n.moss && n.piece && !isSeed(n.piece)) cand.push([r + dr, c + dc]);
      }
      if (!cand.length) continue;
      const [tr, tc] = cand[rand(cand.length)];
      const from = st.cells[r][c], to = st.cells[tr][tc];
      from.piece = to.piece;
      to.piece = null;
      moves.set(from.piece.id, [tr, tc]);
      to.stone = from.stone; to.mole = true;
      from.stone = 0; from.mole = false;
      jumps.push({ from: [r, c], to: [tr, tc] });
    }
    return { moves, jumps };
  }

  // Samanos plinta į gretimą langelį, jei ėjimo metu nė vienos neišvalei
  function spreadMoss(st) {
    const cand = [];
    forEachCell(st, (cell, r, c) => {
      if (!cell.moss) return;
      for (const [dr, dc] of DIRS) {
        const n = get(st, r + dr, c + dc);
        if (n && !n.hole && !n.stone && !n.moss && !n.weed && !n.ice) cand.push([r + dr, c + dc]);
      }
    });
    if (!cand.length) return null;
    const [r, c] = cand[rand(cand.length)];
    st.cells[r][c].moss = 1;
    return [r, c];
  }

  function fillInitial(st) {
    for (let attempt = 0; attempt < 200; attempt++) {
      forEachCell(st, (cell) => { cell.piece = null; });
      forEachCell(st, (cell, r, c) => {
        if (cell.hole || cell.stone) return;
        let t, tries = 0;
        do { t = randColor(st); tries++; } while (tries < 30 && wouldMatch(st, r, c, t));
        cell.piece = newPiece(t);
      });
      if (!findMatches(st).length && findMove(st)) return;
    }
  }

  // ---------- Sutapimai ----------
  function findMatches(st) {
    const runs = [];
    for (let r = 0; r < st.rows; r++) {
      let c = 0;
      while (c < st.cols) {
        const t = typeAt(st, r, c);
        let e = c + 1;
        if (t >= 0) while (e < st.cols && typeAt(st, r, e) === t) e++;
        if (t >= 0 && e - c >= 3) {
          const cells = [];
          for (let x = c; x < e; x++) cells.push([r, x]);
          runs.push({ dir: 'h', cells, type: t });
        }
        c = e;
      }
    }
    for (let c = 0; c < st.cols; c++) {
      let r = 0;
      while (r < st.rows) {
        const t = typeAt(st, r, c);
        let e = r + 1;
        if (t >= 0) while (e < st.rows && typeAt(st, e, c) === t) e++;
        if (t >= 0 && e - r >= 3) {
          const cells = [];
          for (let y = r; y < e; y++) cells.push([y, c]);
          runs.push({ dir: 'v', cells, type: t });
        }
        r = e;
      }
    }
    // Sujungiam susikertančias eiles (L ir T formos)
    const parent = runs.map((_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const owner = new Map();
    runs.forEach((run, i) =>
      run.cells.forEach(([r, c]) => {
        const k = key(r, c);
        if (owner.has(k)) parent[find(i)] = find(owner.get(k));
        else owner.set(k, i);
      })
    );
    const groups = new Map();
    runs.forEach((run, i) => {
      const g = find(i);
      if (!groups.has(g)) groups.set(g, { runs: [], cells: new Map(), type: run.type });
      const G = groups.get(g);
      G.runs.push(run);
      run.cells.forEach(([r, c]) => G.cells.set(key(r, c), [r, c]));
    });
    return [...groups.values()];
  }

  function decideSpecial(st, g, prefer) {
    let maxH = 0, maxV = 0, longest = null;
    for (const run of g.runs) {
      const L = run.cells.length;
      if (run.dir === 'h') maxH = Math.max(maxH, L);
      else maxV = Math.max(maxV, L);
      if (!longest || L > longest.cells.length) longest = run;
    }
    let special = null;
    if (Math.max(maxH, maxV) >= 5) special = 'rainbow';
    else if (maxH >= 3 && maxV >= 3) special = 'bomb';
    else if (maxH === 4) special = 'row';
    else if (maxV === 4) special = 'col';
    if (!special) return null;

    const ok = ([r, c]) => !st.cells[r][c].ice;
    let pos = null;
    for (const p of prefer || []) {
      if (g.cells.has(key(p[0], p[1])) && ok(p)) { pos = p; break; }
    }
    if (!pos && special === 'bomb') {
      const hs = new Set();
      g.runs.filter((x) => x.dir === 'h').forEach((x) => x.cells.forEach(([a, b]) => hs.add(key(a, b))));
      const inter = g.runs
        .filter((x) => x.dir === 'v')
        .flatMap((x) => x.cells)
        .find((p) => hs.has(key(p[0], p[1])) && ok(p));
      if (inter) pos = inter;
    }
    if (!pos) {
      const cs = longest.cells;
      const mid = cs[Math.floor((cs.length - 1) / 2)];
      pos = ok(mid) ? mid : [...g.cells.values()].find(ok);
    }
    if (!pos) return null;
    return { r: pos[0], c: pos[1], special, type: g.type };
  }

  function mostCommonColor(st) {
    const cnt = {};
    forEachCell(st, (cell) => {
      if (cell.piece && cell.piece.type >= 0 && !cell.ice) cnt[cell.piece.type] = (cnt[cell.piece.type] || 0) + 1;
    });
    let best = st.colors[0], n = -1;
    for (const t in cnt) if (cnt[t] > n) { n = cnt[t]; best = +t; }
    return best;
  }

  function area(st, special, r, c) {
    const out = [];
    if (special === 'row') for (let x = 0; x < st.cols; x++) out.push([r, x]);
    else if (special === 'col') for (let y = 0; y < st.rows; y++) out.push([y, c]);
    else if (special === 'bomb' || special === 'big') {
      const R = special === 'big' ? 2 : 1;
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) out.push([r + dy, c + dx]);
    } else if (special === 'rainbow') {
      const t = mostCommonColor(st);
      forEachCell(st, (cell, y, x) => { if (cell.piece && cell.piece.type === t) out.push([y, x]); });
    }
    return out;
  }

  // Vienas „valymo“ žingsnis: pašalina sutapimus ir viską, ką pasiekia specialūs elementai.
  function resolve(st, { groups = [], seeds = [], prefer = null, noTrigger = new Set() }, cascade = 1) {
    const creates = [];
    const matched = new Set();
    const queue = [];
    const groupTypes = groups.map((g) => (g.type !== undefined ? g.type : -1));
    for (const g of groups) {
      const cr = decideSpecial(st, g, prefer);
      if (cr) creates.push(cr);
      for (const [k, p] of g.cells) { matched.add(k); queue.push(p); }
    }
    for (const s of seeds) queue.push(s);

    const hitSet = new Set();
    const effects = [];
    while (queue.length) {
      const [r, c] = queue.shift();
      const cell = get(st, r, c);
      if (!cell || cell.hole) continue;
      const k = key(r, c);
      if (hitSet.has(k)) continue;
      hitSet.add(k);
      const p = cell.piece;
      if (isPower(p) && !cell.ice && !noTrigger.has(p.id)) {
        noTrigger.add(p.id);
        effects.push({ special: p.special, r, c });
        for (const a of area(st, p.special, r, c)) queue.push(a);
      }
    }

    const res = { removed: [], created: [], effects, stonesHit: [], potsHit: [], potsDone: 0, molesCaught: 0, combsBroken: 0, honeyGot: 0, sacksBroken: 0, grainGot: 0, iceBroken: [], weedsHit: [], mossHit: [], collected: {}, points: 0 };
    const stoneDone = new Set();
    // Vazonas: pripildomas n elementų; pilnas – pražysta ir išnyksta
    const fillPot = (r, c, n, type) => {
      const cell = get(st, r, c);
      if (!cell || !cell.pot) return;
      cell.pot.left = Math.max(0, cell.pot.left - n);
      res.potsHit.push({ r, c, left: cell.pot.left, n, type: type === undefined ? cell.pot.type : type });
      if (cell.pot.left <= 0) { cell.pot = null; cell.stone = 0; res.potsDone++; }
    };
    const damageStone = (r, c) => {
      const cell = get(st, r, c);
      const k = key(r, c);
      if (!cell || !cell.stone || cell.pot || stoneDone.has(k)) return;
      stoneDone.add(k);
      cell.stone--;
      res.stonesHit.push({ r, c, left: cell.stone, mole: cell.mole, sack: cell.sack });
      if (cell.mole && cell.stone <= 0) { cell.mole = false; res.molesCaught++; }
      if (cell.comb && cell.stone <= 0) { cell.comb = false; res.combsBroken++; res.honeyGot += 3; } // sudaužytas korys – 3 medaus lašai
      if (cell.sack && cell.stone <= 0) { cell.sack = false; res.sacksBroken++; res.grainGot += 3; } // pradraskytas miltų maišas – 3 saujos grūdų
    };

    for (const k of hitSet) {
      const [r, c] = unkey(k);
      const cell = st.cells[r][c];
      if (cell.pot) { fillPot(r, c, 1); continue; }
      if (cell.stone) { damageStone(r, c); continue; }
      if (cell.ice) { cell.ice = 0; res.iceBroken.push({ r, c }); continue; }
      if (cell.piece) {
        const p = cell.piece;
        if (isSeed(p)) continue; // maišelių sunaikinti negalima – juos reikia nuleisti
        res.removed.push({ id: p.id, r, c, type: p.type, special: p.special });
        if (p.honey) res.honeyGot++;
        if (p.type >= 0) res.collected[p.type] = (res.collected[p.type] || 0) + 1;
        cell.piece = null;
        if (cell.weed > 0) { cell.weed--; res.weedsHit.push({ r, c, left: cell.weed }); }
        if (cell.moss) { cell.moss = 0; res.mossHit.push({ r, c }); }
      }
    }
    for (const k of matched) {
      const [r, c] = unkey(k);
      for (const [dr, dc] of DIRS) damageStone(r + dr, c + dc);
    }
    // Sutapimas šalia tos pačios spalvos vazono – visa eilė „pasodinama“ į jį
    groups.forEach((g, gi) => {
      const t = groupTypes[gi];
      if (t < 0) return;
      const pots = new Set();
      for (const [, [r, c]] of g.cells) for (const [dr, dc] of DIRS) {
        const n = get(st, r + dr, c + dc);
        if (n && n.pot && n.pot.type === t) pots.add(key(r + dr, c + dc));
      }
      for (const pk of pots) { const [r, c] = unkey(pk); fillPot(r, c, g.cells.size, t); }
    });
    for (const cr of creates) {
      const cell = st.cells[cr.r][cr.c];
      if (cell.piece || cell.stone) continue;
      const p = newPiece(cr.special === 'rainbow' ? -1 : cr.type, cr.special);
      cell.piece = p;
      res.created.push({ id: p.id, r: cr.r, c: cr.c });
    }
    res.points = res.removed.length * 60 * cascade + effects.length * 120 + res.stonesHit.length * 40 + res.mossHit.length * 30 + res.potsHit.length * 50 + res.potsDone * 200;
    return res;
  }

  // Dviejų specialių elementų derinys (arba sėkla + bet kas)
  function combo(st, a, b) {
    const A = st.cells[a[0]][a[1]].piece;
    const B = st.cells[b[0]][b[1]].piece;
    const sa = isPower(A) ? A.special : null;
    const sb = isPower(B) ? B.special : null;
    const isRb = sa === 'rainbow' || sb === 'rainbow';
    if (!isRb && (!sa || !sb)) return null;
    if (isSeed(A) || isSeed(B)) return null;

    const noTrigger = new Set([A.id, B.id]);
    const seeds = [a, b];
    const fx = [];
    const converted = [];
    const [r, c] = b;
    const line = (s) => s === 'row' || s === 'col';

    if (sa === 'rainbow' && sb === 'rainbow') {
      forEachCell(st, (cell, y, x) => { if (!cell.hole) seeds.push([y, x]); });
      fx.push({ special: 'all', r, c });
    } else if (isRb) {
      const other = sa === 'rainbow' ? B : A;
      const t = other.type;
      if (!other.special) {
        forEachCell(st, (cell, y, x) => {
          if (cell.piece && cell.piece.type === t && cell.piece.special !== 'rainbow') seeds.push([y, x]);
        });
        fx.push({ special: 'rainbow', r, c, type: t });
      } else {
        noTrigger.delete(other.id);
        forEachCell(st, (cell, y, x) => {
          const p = cell.piece;
          if (!p || p.type !== t || p.special || cell.ice) return;
          p.special = other.special === 'bomb' ? 'bomb' : Math.random() < 0.5 ? 'row' : 'col';
          converted.push(p.id);
          seeds.push([y, x]);
        });
        fx.push({ special: 'rainbow', r, c, type: t });
      }
    } else if (line(sa) && line(sb)) {
      seeds.push(...area(st, 'row', r, c), ...area(st, 'col', r, c));
      fx.push({ special: 'row', r, c }, { special: 'col', r, c });
    } else if (sa === 'bomb' && sb === 'bomb') {
      seeds.push(...area(st, 'big', r, c));
      fx.push({ special: 'big', r, c });
    } else {
      for (let d = -1; d <= 1; d++) {
        seeds.push(...area(st, 'row', r + d, c), ...area(st, 'col', r, c + d));
        if (r + d >= 0 && r + d < st.rows) fx.push({ special: 'row', r: r + d, c });
        if (c + d >= 0 && c + d < st.cols) fx.push({ special: 'col', r, c: c + d });
      }
    }
    return { seeds, noTrigger, fx, converted };
  }

  // ---------- Gravitacija ----------
  function isSpawn(st, r, c) {
    for (let y = r - 1; y >= 0; y--) if (!st.cells[y][c].hole) return false;
    return true;
  }
  function gravity(st) {
    const origin = new Map(); // piece id -> [r, c] iš kur atkeliavo
    const spawnCount = new Array(st.cols).fill(0);
    const moveTo = (fr, fc, tr, tc) => {
      const p = st.cells[fr][fc].piece;
      if (!origin.has(p.id)) origin.set(p.id, [fr, fc]);
      st.cells[tr][tc].piece = p;
      st.cells[fr][fc].piece = null;
    };
    let onBoard = st.seedLeft ? seedsOnBoard(st) : 0;
    const spawn = () => {
      if (st.seedLeft > 0 && onBoard < st.seedMax && Math.random() < 0.12) {
        st.seedLeft--;
        onBoard++;
        return newPiece(-2, 'seed');
      }
      return newPiece(randColor(st));
    };
    let changed = true, guard = 0;
    while (changed && guard++ < 1000) {
      changed = false;
      for (let r = st.rows - 1; r >= 0; r--) {
        for (let c = 0; c < st.cols; c++) {
          const cell = st.cells[r][c];
          if (!isFree(cell)) continue;
          if (isSpawn(st, r, c)) {
            const p = spawn();
            spawnCount[c]++;
            origin.set(p.id, [r - spawnCount[c], c]);
            cell.piece = p;
            changed = true;
          } else if (movable(st.cells[r - 1][c])) {
            moveTo(r - 1, c, r, c);
            changed = true;
          }
        }
      }
      if (changed) continue;
      // Įstrižai – kai tiesiai virš langelio yra kliūtis
      outer: for (let r = st.rows - 1; r > 0; r--) {
        for (let c = 0; c < st.cols; c++) {
          const cell = st.cells[r][c];
          if (!isFree(cell)) continue;
          const up = st.cells[r - 1][c];
          if (isFree(up) || movable(up)) continue;
          for (const dc of [-1, 1]) {
            const d = get(st, r - 1, c + dc);
            if (movable(d)) { moveTo(r - 1, c + dc, r, c); changed = true; break outer; }
          }
        }
      }
    }
    // Uždari langeliai, kurių niekas negali pasiekti (pvz., tarp akmenų) – užaugam naują elementą vietoje
    forEachCell(st, (cell, r, c) => {
      if (isFree(cell)) {
        const p = newPiece(randColor(st));
        origin.set(p.id, [r, c]);
        cell.piece = p;
      }
    });
    return origin;
  }

  // ---------- Ėjimų paieška ir maišymas ----------
  function swap(st, a, b) {
    const A = st.cells[a[0]][a[1]], B = st.cells[b[0]][b[1]];
    const t = A.piece; A.piece = B.piece; B.piece = t;
  }
  function findMove(st) {
    for (let r = 0; r < st.rows; r++) {
      for (let c = 0; c < st.cols; c++) {
        const A = st.cells[r][c];
        if (!canSwap(A)) continue;
        for (const [dr, dc] of [[0, 1], [1, 0]]) {
          const B = get(st, r + dr, c + dc);
          if (!canSwap(B)) continue;
          const a = [r, c], b = [r + dr, c + dc];
          const pa = A.piece, pb = B.piece;
          if (!isSeed(pa) && !isSeed(pb) && ((pa.special && pb.special) || pa.special === 'rainbow' || pb.special === 'rainbow')) return [a, b];
          swap(st, a, b);
          const ok = findMatches(st).length > 0;
          swap(st, a, b);
          if (ok) return [a, b];
        }
      }
    }
    return null;
  }
  function shuffle(st) {
    const slots = [], ps = [];
    forEachCell(st, (cell, r, c) => {
      if (movable(cell) && !cell.piece.special && !cell.piece.honey) { slots.push([r, c]); ps.push(cell.piece); }
    });
    for (let t = 0; t < 200; t++) {
      for (let i = ps.length - 1; i > 0; i--) { const j = rand(i + 1); [ps[i], ps[j]] = [ps[j], ps[i]]; }
      slots.forEach(([r, c], i) => { st.cells[r][c].piece = ps[i]; });
      if (!findMatches(st).length && findMove(st)) return;
    }
    for (let t = 0; t < 100; t++) {
      slots.forEach(([r, c]) => {
        const p = st.cells[r][c].piece;
        let tries = 0;
        do { p.type = randColor(st); tries++; } while (tries < 30 && wouldMatch(st, r, c, p.type));
      });
      if (!findMatches(st).length && findMove(st)) return;
    }
  }

  return {
    create, get, movable, findMatches, resolve, combo, gravity, swap, findMove, shuffle, count, forEachCell,
    collectSeeds, spreadMoss, isSeed, moveMoles, dripHoney, canSwap,
  };
})();
