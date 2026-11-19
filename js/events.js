// Savaitgalio šventės: penktadienį–sekmadienį 3 ypatingi lygiai, už juos – retas Pūkio drabužis.
// Šventės keičiasi kas savaitę ratu.
const Events = (() => {
  const C5 = [0, 1, 2, 3, 4];
  const C6 = [0, 1, 2, 3, 4, 5];
  const P8 = '........';
  const plain = [P8, P8, P8, P8, P8, P8, P8, P8];
  const col = (type, count) => ({ kind: 'collect', type, count });
  const L = (moves, colors, goals, layout, extra = {}) => ({
    moves, colors, goals, layout, moleEvery: 3,
    stars: [moves * 130, moves * 280, moves * 430].map((v) => Math.round(v / 100) * 100),
    ...extra,
  });

  const EVENTS = [
    {
      id: 'derlius', name: 'Rudens derlius', icon: '🍎', reward: { slot: 'hat', id: 'pumpkin' },
      intro: { e: 'excited', t: 'Rudens derlius! Surinkim kuo daugiau obuolių ir citrinų – Dygliukas žada pyragą.' },
      levels: [
        L(20, C5, [col(1, 30)], plain),
        L(24, C5, [col(1, 25), col(2, 25)], ['##....##', '#......#', P8, P8, P8, P8, '#......#', '##....##']),
        L(32, C6, [col(1, 25), col(2, 25), col(4, 25)], ['.##..##.', P8, P8, P8, '#......#', '##....##', '###..###', '###..###']),
      ],
    },
    {
      id: 'salna', name: 'Šalnų savaitgalis', icon: '❄️', reward: { slot: 'scarf', id: 'plaid' },
      intro: { e: 'surprised', t: 'Brr! Šalnų savaitgalis. Atšildykim sodą, kol neapšalo visai!' },
      levels: [
        L(25, C5, [{ kind: 'ice' }], [P8, '.i.ii.i.', P8, 'i......i', 'i......i', P8, '.i.ii.i.', P8]),
        L(32, C5, [{ kind: 'ice' }, col(4, 20)], ['iiiiiiii', P8, P8, '..iiii..', '..iiii..', P8, P8, 'iiiiiiii']),
        L(34, C5, [{ kind: 'ice' }, { kind: 'stones' }], ['s.iiii.s', '.i....i.', 'i.iSSi.i', 'i.i..i.i', 'i.i..i.i', 'i.iSSi.i', '.i....i.', 's.iiii.s']),
      ],
    },
    {
      id: 'kurmiai', name: 'Kurmių naktis', icon: '🌙', reward: { slot: 'hat', id: 'leafcrown' },
      intro: { who: 'Dygliukas', e: 'surprised', t: 'Kurmių naktis! Jie išlindo visi vienu metu. Padėkit!' },
      levels: [
        L(22, C5, [{ kind: 'moles' }], [P8, '.k....k.', P8, '...k....', P8, '....k...', '.k....k.', P8]),
        L(26, C5, [{ kind: 'moles' }, { kind: 'weeds' }], ['wwwwwwww', 'w.k..k.w', 'w......w', 'w..kk..w', 'w......w', 'w.k..k.w', 'w......w', 'wwwwwwww']),
        L(36, C5, [{ kind: 'moles' }, { kind: 'stumps' }], ['T......T', '.k.k.k..', P8, '..T..T..', '..T..T..', P8, '..k.k.k.', 'T......T'], { moleEvery: 2 }),
      ],
    },
    {
      id: 'muge', name: 'Sėklų mugė', icon: '🌻', reward: { slot: 'scarf', id: 'lilac' },
      intro: { who: 'Karolis', e: 'happy', t: 'Sėklų mugė! Daug maišelių, daug sėklų… ir nė vieno blizgučio. Gerai jau.' },
      levels: [
        L(25, C5, [{ kind: 'seeds' }], plain, { seeds: { total: 3, max: 2 } }),
        L(32, C5, [{ kind: 'seeds' }, { kind: 'moss' }], [P8, P8, P8, P8, 'm......m', 'mm....mm', 'mmm..mmm', P8], { seeds: { total: 3, max: 2 } }),
        L(38, C5, [{ kind: 'seeds' }, { kind: 'weeds' }], ['WWWWWWWW', P8, P8, P8, P8, P8, 'wwwwwwww', 'WWWWWWWW'], { seeds: { total: 3, max: 2 } }),
      ],
    },
  ];

  // Didžiosios šventės pagal datas – tuo metu jos pakeičia savaitgalio šventes.
  // from/to – [mėnuo, diena] imtinai; gali pereiti per Naujuosius metus.
  const SEASONS = [
    {
      id: 'kaledos', name: 'Kalėdos sode', label: 'Kalėdų šventė', icon: '🎄', seasonal: true, snow: true,
      from: [12, 15], to: [1, 6], reward: { slot: 'hat', id: 'santa' },
      intro: [
        { e: 'excited', t: 'Sniegas! Sodas visas baltas – kaip pyragas su cukraus pudra!' },
        { e: 'happy', t: 'Iki Kalėdų papuoškim sodą: surinkim obuolių, atšildykim takus ir išdalinkim dovanas.' },
        { e: 'wink', t: 'Įveiksim visus septynis šventės lygius – ir gausiu tikrą Kalėdų kepurę!' },
      ],
      levels: [
        L(24, C5, [col(1, 30), { kind: 'ice' }], [P8, '.i....i.', P8, '...ii...', '...ii...', P8, '.i....i.', P8]),
        L(24, C5, [col(1, 30), col(4, 30)], ['#......#', P8, P8, P8, P8, P8, P8, '#......#']),
        L(32, C5, [{ kind: 'seeds' }, { kind: 'ice' }], [P8, P8, P8, 'i......i', 'ii....ii', P8, P8, P8], { seeds: { total: 3, max: 2 } }),
        L(30, C5, [{ kind: 'pots' }], [P8, '.v....v.', P8, P8, P8, P8, '.v....v.', P8], { potNeed: 4, potTypes: [1, 4] }),
        L(34, C5, [{ kind: 'ice' }, { kind: 'stones' }], ['iiiiiiii', 'i.s..s.i', P8, P8, P8, P8, 'i.s..s.i', 'iiiiiiii']),
        L(28, C5, [col(1, 30), { kind: 'honey', count: 14 }], [P8, '..h..h..', '...cc...', P8, P8, '...cc...', '..h..h..', P8], { combEvery: 3 }),
        L(42, C5, [{ kind: 'ice' }, { kind: 'pots' }, col(1, 25)], ['ii....ii', 'i.v..v.i', P8, '..i..i..', '..i..i..', P8, 'i.v..v.i', 'ii....ii'], { potNeed: 4, potTypes: [1, 4, 2] }),
      ],
    },
    {
      id: 'valentinas', name: 'Širdelių šventė', label: 'Valentino diena', icon: '💝', seasonal: true, badge: 'ev_sirdele',
      from: [2, 8], to: [2, 16], reward: { slot: 'hat', id: 'hearts' }, reward2: { slot: 'scarf', id: 'hearts' },
      intro: [
        { e: 'excited', t: 'Širdelių šventė! Visas sodas kvepia rožėmis ir pyragais.' },
        { who: 'Karolis', e: 'sneaky', t: 'Raudonos širdelės blizga… Gal vieną paimsiu? Draugystei.' },
        { e: 'wink', t: 'Įveiksim visus šventės lygius – gausiu širdelių skrybėlaitę ir skarelę!' },
      ],
      levels: [
        L(26, C5, [col(0, 30)], [P8, P8, '.##..##.', P8, P8, '#......#', '##....##', '###..###']),
        L(26, C5, [col(0, 25), col(1, 25)], [P8, '..w..w..', '.wwwwww.', '.wwwwww.', '..wwww..', '...ww...', P8, P8]),
        L(30, C5, [{ kind: 'pots' }], [P8, '.v....v.', P8, P8, P8, P8, '...vv...', P8], { potNeed: 4, potTypes: [0, 1] }),
        L(24, C5, [{ kind: 'honey', count: 10 }, col(0, 20)], [P8, '..h..h..', '...cc...', P8, P8, '..h..h..', P8, P8], { combEvery: 3 }),
        L(32, C5, [{ kind: 'seeds' }, { kind: 'weeds' }], [P8, P8, P8, 'w......w', 'ww....ww', 'www..www', P8, P8], { seeds: { total: 3, max: 2 } }),
        L(32, C5, [{ kind: 'sacks' }, col(0, 25)], [P8, '.f....f.', P8, '...ff...', P8, P8, '.f....f.', P8]),
        L(40, C5, [{ kind: 'pots' }, { kind: 'ice' }, col(1, 25)], ['ii....ii', 'i.v..v.i', P8, '..i..i..', '..i..i..', P8, 'i.v..v.i', 'ii....ii'], { potNeed: 4, potTypes: [0, 1, 4] }),
      ],
    },
    {
      id: 'velykos', name: 'Velykos sode', label: 'Velykų šventė', icon: '🥚', seasonal: true, badge: 'ev_margutis', easter: true,
      reward: { slot: 'hat', id: 'bunny' }, reward2: { slot: 'scarf', id: 'easter' },
      intro: [
        { e: 'excited', t: 'Velykos! Kažkas sode paslėpė margučius!' },
        { who: 'Dygliukas', e: 'wink', t: 'Ne aš. Nors… gal vieną. Po kopūstu.' },
        { e: 'happy', t: 'Surinkim juos ir pasipuoškim – už visus lygius gausiu kiškio ausytes!' },
      ],
      levels: [
        L(30, C5, [{ kind: 'seeds' }], [P8, P8, P8, P8, P8, P8, P8, P8], { seeds: { total: 3, max: 2 } }),
        L(26, C5, [col(2, 25), col(4, 25)], ['#......#', P8, '..ww....', '.wwww...', '...wwww.', '....ww..', P8, '#......#']),
        L(30, C5, [{ kind: 'moles' }, col(3, 20)], [P8, '.k....k.', P8, '...k....', '....k...', P8, '.k....k.', P8]),
        L(34, C5, [{ kind: 'pots' }], [P8, '.v....v.', P8, '...vv...', P8, P8, '.v....v.', P8], { potNeed: 4, potTypes: [2, 4, 0] }),
        L(36, C5, [{ kind: 'grain', count: 12 }, { kind: 'weeds' }], ['wwwwwwww', 'w.f..f.w', 'w......w', P8, P8, 'w......w', 'w.f..f.w', 'wwwwwwww']),
        L(34, C5, [{ kind: 'seeds' }, { kind: 'moss' }], [P8, P8, P8, P8, 'm......m', 'mm....mm', 'mmm..mmm', P8], { seeds: { total: 3, max: 2 } }),
        L(40, C5, [{ kind: 'pots' }, { kind: 'moles' }, { kind: 'weeds' }], ['wwwwwwww', 'wk.vv.kw', 'w......w', P8, P8, 'w......w', 'wk.vv.kw', 'wwwwwwww'], { potNeed: 4, potTypes: [2, 4] }),
      ],
    },
    {
      id: 'jonines', name: 'Joninių naktis', label: 'Joninės', icon: '🌿', seasonal: true, badge: 'ev_papartis',
      from: [6, 18], to: [6, 26], reward: { slot: 'hat', id: 'midsummer' },
      intro: [
        { e: 'excited', t: 'Joninės! Trumpiausia naktis – ir papartis, sako, pražysta!' },
        { who: 'Agota', e: 'wink', t: 'Uhu. Aš jį mačiau. Bet vietos nepasakysiu – teks paieškoti.' },
        { e: 'happy', t: 'Įveiksim visus šventės lygius – nusipinsiu tikrą Joninių vainiką!' },
      ],
      levels: [
        L(22, C5, [col(3, 30)], [P8, P8, P8, '...##...', '...##...', P8, P8, P8]),
        L(26, C5, [{ kind: 'moss' }], ['m......m', P8, P8, '...mm...', '...mm...', P8, P8, 'm......m']),
        L(40, C5, [{ kind: 'weeds' }, col(0, 25)], ['WWWWWWWW', 'w......w', P8, P8, P8, P8, 'w......w', 'WWWWWWWW']),
        L(36, C5, [{ kind: 'sacks' }, { kind: 'stumps' }], ['T......T', '.f....f.', P8, '...ff...', P8, P8, '.f....f.', 'T......T']),
        L(34, C5, [{ kind: 'honey', count: 22 }], ['hh....hh', P8, '..c..c..', P8, P8, '..c..c..', P8, 'hh....hh'], { combEvery: 3 }),
        L(38, C5, [{ kind: 'pots' }, { kind: 'moss' }], ['mm....mm', 'm.v..v.m', P8, P8, P8, P8, 'm.v..v.m', 'mm....mm'], { potNeed: 4, potTypes: [3, 0] }),
        L(42, C5, [{ kind: 'grain', count: 18 }, { kind: 'moss' }, { kind: 'seeds' }], ['m......m', '.f....f.', P8, '..f..f..', P8, P8, '.f....f.', 'm......m'], { seeds: { total: 3, max: 2 } }),
      ],
    },
  ];

  // Velykų sekmadienis (Gregoriaus kalendorius); šventė – savaitė prieš ir po
  function easterDate(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }
  const datePair = (dt) => [dt.getMonth() + 1, dt.getDate()];

  const DAY = 86400000;
  let debugNow = null; // testavimui
  const now = () => (debugNow ? new Date(debugNow) : new Date());
  const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // Savaitės numeris nuo 2024-01-01 (pirmadienis) – Pr–Sk priklauso tai pačiai savaitei
  function weekIndex(d = now()) {
    return Math.floor((midnight(d) - new Date(2024, 0, 1)) / (7 * DAY) + 1e-6);
  }
  // Ar dabar vyksta didžioji šventė; grąžina ją su raktu (pvz. kaledos-2026) ir pabaigos laiku
  function season(d = now()) {
    const m = d.getMonth() + 1, day = d.getDate(), y = d.getFullYear();
    const v = m * 100 + day;
    for (const s0 of SEASONS) {
      let s = s0;
      if (s.easter) {
        const e = easterDate(y);
        s = { ...s, from: datePair(new Date(e.getTime() - 7 * DAY)), to: datePair(new Date(e.getTime() + 7 * DAY)) };
      }
      const a = s.from[0] * 100 + s.from[1], b = s.to[0] * 100 + s.to[1];
      const wraps = a > b;
      const inside = wraps ? v >= a || v <= b : v >= a && v <= b;
      if (!inside) continue;
      const startYear = wraps && v <= b ? y - 1 : y;
      const endYear = wraps ? startYear + 1 : startYear;
      const end = new Date(endYear, s.to[0] - 1, s.to[1] + 1).getTime();
      return { ...s, week: s.id + '-' + startYear, end };
    }
    return null;
  }
  function isActive(d = now()) {
    if (season(d)) return true;
    const g = d.getDay();
    return g === 5 || g === 6 || g === 0;
  }
  function current(d = now()) {
    const se = season(d);
    if (se) return se;
    const w = weekIndex(d);
    return { ...EVENTS[w % EVENTS.length], week: w };
  }
  // Iki šventės pabaigos (pirmadienio 00:00) arba pradžios (penktadienio 00:00)
  function msLeft(d = now()) {
    const se = season(d);
    if (se) return se.end - d.getTime();
    const m = midnight(d);
    const g = d.getDay();
    const toMon = ((8 - g) % 7 || 7) * DAY;
    const toFri = ((5 - g + 7) % 7) * DAY;
    return isActive(d) ? m.getTime() + toMon - d.getTime() : m.getTime() + toFri - d.getTime();
  }
  function fmtLeft(ms) {
    const h = Math.floor(ms / 3600000);
    const days = Math.floor(h / 24);
    return days >= 1 ? `${days} d. ${h % 24} val.` : `${h} val. ${Math.floor((ms % 3600000) / 60000)} min.`;
  }
  function state() {
    const d = Store.data;
    const ev = current();
    if (!d.events) d.events = {};
    if (!d.events[ev.week]) d.events[ev.week] = { done: ev.levels.map(() => false), claimed: false, introSeen: false };
    return d.events[ev.week];
  }
  function finishLevel(k) {
    const s = state();
    s.done[k] = true;
    Store.save();
  }
  // Prizas už visus 3 lygius: drabužis (arba, jei jau turi, pagalbos)
  function claim() {
    const s = state();
    if (s.claimed || !s.done.every(Boolean)) return null;
    s.claimed = true;
    const ev = current();
    const d = Store.data;
    let reward;
    if (!d.owned[ev.reward.slot].includes(ev.reward.id)) {
      d.owned[ev.reward.slot].push(ev.reward.id);
      d.outfit[ev.reward.slot] = ev.reward.id;
      ART.setOutfit(d.outfit);
      reward = { type: 'outfit', ...ev.reward };
    } else {
      reward = { type: 'moves', n: 3 };
      Progress.give(reward);
    }
    // Antras prizas (pvz. skarelė prie kepurės)
    if (ev.reward2 && !d.owned[ev.reward2.slot].includes(ev.reward2.id)) {
      d.owned[ev.reward2.slot].push(ev.reward2.id);
      d.outfit[ev.reward2.slot] = ev.reward2.id;
      ART.setOutfit(d.outfit);
      if (reward.type === 'outfit') reward.second = ev.reward2;
      else reward = { type: 'outfit', ...ev.reward2 };
    }
    Store.save();
    return reward;
  }

  return {
    EVENTS, SEASONS, season, current, isActive, msLeft, fmtLeft, state, finishLevel, claim,
    setDebugNow: (d) => { debugNow = d; },
  };
})();
