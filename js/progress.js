// Pažanga: gyvybės, pagalbos, statistika, dienos užduotys, pasiekimai, Pūkio apranga.
const Progress = (() => {
  const MAX_LIVES = 5;
  const REGEN_MS = 30 * 60 * 1000; // 1 gyvybė kas 30 min.

  const d = () => Store.data;
  const today = () => {
    const n = new Date();
    return `${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}`;
  };

  // ---------- Gyvybės ----------
  function syncLives() {
    const s = d();
    if (s.lives >= MAX_LIVES) { s.livesTs = Date.now(); return; }
    const now = Date.now();
    const gained = Math.floor((now - s.livesTs) / REGEN_MS);
    if (gained > 0) {
      s.lives = Math.min(MAX_LIVES, s.lives + gained);
      s.livesTs = s.lives >= MAX_LIVES ? now : s.livesTs + gained * REGEN_MS;
      Store.save();
    }
  }
  function lives() { syncLives(); return d().lives; }
  function msToNext() {
    syncLives();
    if (d().lives >= MAX_LIVES) return 0;
    return Math.max(0, REGEN_MS - (Date.now() - d().livesTs));
  }
  // Kiek laiko iki visų gyvybių
  function msToFull() {
    syncLives();
    const miss = MAX_LIVES - d().lives;
    return miss <= 0 ? 0 : msToNext() + (miss - 1) * REGEN_MS;
  }
  function loseLife() {
    syncLives();
    const s = d();
    if (s.lives >= MAX_LIVES) s.livesTs = Date.now();
    s.lives = Math.max(0, s.lives - 1);
    Store.save();
  }
  function addLives(n) {
    syncLives();
    const s = d();
    s.lives = Math.min(MAX_LIVES, s.lives + n);
    if (s.lives >= MAX_LIVES) s.livesTs = Date.now();
    Store.save();
  }
  const fmt = (ms) => {
    const t = Math.ceil(ms / 1000);
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  };

  // ---------- Pagalbos ----------
  const BOOSTERS = {
    shovel: { name: 'Kastuvėlis', plural: 'kastuvėliai', desc: 'iškasa vieną langelį' },
    can: { name: 'Laistytuvas', plural: 'laistytuvai', desc: 'išvalo visą eilutę' },
    rake: { name: 'Grėblys', plural: 'grėbliai', desc: 'išvalo visą stulpelį' },
    bomb: { name: 'Sprogstantis startas', plural: 'sprogstantys startai', desc: 'lygis prasideda su sprogstančiu elementu' },
    moves: { name: 'Ėjimų paketas', plural: 'ėjimų paketai', desc: 'papildomi ėjimai lygio pradžioje arba pralaimėjus' },
  };
  function give(reward) {
    const s = d();
    if (reward.type === 'life') addLives(reward.n);
    else if (reward.type === 'stars') s.bonusStars = (s.bonusStars || 0) + reward.n;
    else s.boosters[reward.type] = (s.boosters[reward.type] || 0) + reward.n;
    Store.save();
  }
  // ---------- Prisijungimo serija (7 dienos ratu; praleidus dieną – iš naujo) ----------
  const STREAK = [
    [{ type: 'shovel', n: 1 }],
    [{ type: 'life', n: 2 }],
    [{ type: 'can', n: 1 }],
    [{ type: 'shovel', n: 2 }],
    [{ type: 'rake', n: 1 }, { type: 'life', n: 1 }],
    [{ type: 'bomb', n: 1 }, { type: 'moves', n: 1 }],
    [{ type: 'stars', n: 2 }, { type: 'can', n: 1 }, { type: 'rake', n: 1 }, { type: 'bomb', n: 1 }],
  ];
  const dayKey = (t) => { const x = new Date(t); return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`; };
  // Iškviečiama kartą per dieną: grąžina šiandienos serijos dieną (1–7) ir dovanas
  function checkIn(now = Date.now()) {
    const s = d();
    const today = dayKey(now);
    const yesterday = dayKey(now - 86400000);
    const st = s.streak || { day: 0, last: null, best: 0 };
    if (st.last === today) return null;
    const kept = st.last === yesterday;
    const lost = !!st.last && !kept && st.day > 1;
    st.day = kept ? (st.day % 7) + 1 : 1;
    st.total = kept ? (st.total || 0) + 1 : 1;
    st.best = Math.max(st.best || 0, st.total);
    st.last = today;
    s.streak = st;
    const rewards = STREAK[st.day - 1];
    rewards.forEach(give);
    Store.save();
    return { day: st.day, total: st.total, rewards, lost };
  }
  // Pirmą kartą žaidžiant – serija pradedama nuo rytojaus
  function startStreak(now = Date.now()) {
    const s = d();
    if (!s.streak) { s.streak = { day: 0, last: dayKey(now), total: 0, best: 0 }; Store.save(); }
  }

  function rewardText(r) {
    if (r.type === 'life') return `+${r.n} <span class="heart">♥</span>`;
    if (r.type === 'stars') return `+${r.n} ★`;
    return `+${r.n} ${r.n > 1 ? BOOSTERS[r.type].plural.toLowerCase() : BOOSTERS[r.type].name.toLowerCase()}`;
  }

  // ---------- Statistika ----------
  // Lygio statistika (iš Game): collected{type:n}, specials, bombs, rainbows, effects, bigCascades,
  // weeds, obstacles, moss, seeds, ice, boosters, moves, win, stars
  function record(r) {
    const s = d();
    const t = s.stats;
    const add = (k, v) => { t[k] = (t[k] || 0) + (v || 0); };
    const st = r.stats || {};
    for (const k in st.collected || {}) add('col' + k, st.collected[k]);
    ['specials', 'bombs', 'rainbows', 'effects', 'bigCascades', 'weeds', 'obstacles', 'moss', 'seeds', 'ice', 'boosters', 'moves', 'moles', 'honey', 'combs', 'pots', 'grain', 'sacks', 'combos'].forEach((k) => add(k, st[k]));
    if (r.win) {
      add('wins', 1); add('starsEarned', r.stars);
      if (r.stars >= 3) add('perfect', 1);
      if (!st.boosters) add('cleanWins', 1);
    }
    // Dienos užduotys
    ensureDaily();
    const ev = { ...st, wins: r.win ? 1 : 0, starsEarned: r.win ? r.stars : 0 };
    for (const k in st.collected || {}) ev['col' + k] = st.collected[k];
    const moved = [];
    for (const task of s.daily.tasks) {
      if (task.claimed) continue;
      const was = task.progress;
      task.progress = Math.min(task.target, task.progress + (ev[task.stat] || 0));
      if (task.progress > was) moved.push({ task, was });
    }
    Store.save();
    return moved;
  }

  // ---------- Dienos užduotys ----------
  const GEN = ['bijūnų', 'obuolių', 'citrinų', 'monsteros lapų', 'mėlynių', 'vynuogių'];
  const POOL = [
    (rnd) => { const t = [0, 1, 2, 3, 4][rnd(5)]; return { stat: 'col' + t, target: 50 + rnd(4) * 10, text: (n) => `Surink ${n} ${GEN[t]}`, icon: { piece: t } }; },
    () => ({ stat: 'wins', target: 2, text: (n) => `Įveik ${n} lygius`, icon: { emoji: '🏁' } }),
    () => ({ stat: 'starsEarned', target: 5, text: (n) => `Surink ${n} žvaigždučių lygiuose`, icon: { emoji: '★' } }),
    (rnd) => ({ stat: 'specials', target: 4 + rnd(3), text: (n) => `Sukurk ${n} ypatingus elementus`, icon: { emoji: '✨' } }),
    () => ({ stat: 'bombs', target: 3, text: (n) => `Susprogdink ${n} sprogstančius elementus`, icon: { emoji: '💥' } }),
    () => ({ stat: 'bigCascades', target: 2, text: (n) => `Padaryk ${n} grandines iš 4 ir daugiau`, icon: { emoji: '🔗' } }),
    (rnd) => ({ stat: 'weeds', target: 25 + rnd(3) * 5, text: (n) => `Išravėk ${n} piktžolių`, icon: { emoji: '🌿' } }),
    () => ({ stat: 'obstacles', target: 12, text: (n) => `Sudaužyk ${n} akmenų ar kelmų`, icon: { emoji: '🪨' } }),
    () => ({ stat: 'boosters', target: 1, text: () => 'Panaudok bet kurią pagalbą', icon: { emoji: '🪣' } }),
    (rnd) => ({ stat: 'moves', target: 40 + rnd(3) * 10, text: (n) => `Padaryk ${n} ėjimų`, icon: { emoji: '👆' } }),
    from(8, (rnd) => ({ stat: 'ice', target: 12 + rnd(3) * 4, text: (n) => `Atšildyk ${n} užšalusių langelių`, icon: { emoji: '🧊' } })),
    from(17, (rnd) => ({ stat: 'moss', target: 12 + rnd(3) * 4, text: (n) => `Nuvalyk ${n} samanų`, icon: { emoji: '🍀' } })),
    from(42, (rnd) => ({ stat: 'moles', target: 4 + rnd(3), text: (n) => `Išprašyk ${n} kurmius`, icon: { emoji: '🕳️' } })),
    from(62, (rnd) => ({ stat: 'honey', target: 15 + rnd(3) * 5, text: (n) => `Surink ${n} medaus lašų`, icon: { emoji: '🍯' } })),
    from(62, (rnd) => ({ stat: 'combs', target: 5 + rnd(3), text: (n) => `Sudaužyk ${n} korius`, icon: { emoji: '🐝' } })),
    from(82, (rnd) => ({ stat: 'pots', target: 4 + rnd(3), text: (n) => `Pripildyk ${n} vazonus`, icon: { emoji: '🪴' } })),
    from(102, (rnd) => ({ stat: 'sacks', target: 5 + rnd(3), text: (n) => `Pradraskyk ${n} miltų maišus`, icon: { img: 'sack' } })),
    from(102, (rnd) => ({ stat: 'grain', target: 15 + rnd(3) * 3, text: (n) => `Surink ${n} saujų grūdų`, icon: { img: 'grain' } })),
  ];
  // Užduotis atsiranda tik pasiekus tą lygį (kliūtis jau pažįstama)
  function from(lvl, fn) { fn.min = lvl; return fn; }
  const REWARDS = [
    { type: 'shovel', n: 1 }, { type: 'can', n: 1 }, { type: 'rake', n: 1 }, { type: 'life', n: 1 }, { type: 'shovel', n: 2 }, { type: 'bomb', n: 1 }, { type: 'moves', n: 1 },
  ];
  function seeded(str) {
    let h = 2166136261;
    for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  }
  function ensureDaily() {
    const s = d();
    const t = today();
    if (s.daily && s.daily.date === t) return s.daily;
    const r = seeded(t);
    const rnd = (n) => Math.floor(r() * n);
    const ok = POOL.map((f, i) => i).filter((i) => !POOL[i].min || (s.unlocked || 1) >= POOL[i].min);
    const idx = [];
    while (idx.length < 3) { const i = ok[rnd(ok.length)]; if (!idx.includes(i)) idx.push(i); }
    s.daily = {
      date: t,
      bonusClaimed: false,
      tasks: idx.map((i, k) => {
        const g = POOL[i](rnd);
        return { stat: g.stat, target: g.target, progress: 0, claimed: false, text: g.text(g.target), icon: g.icon, reward: REWARDS[rnd(REWARDS.length)], k };
      }),
    };
    Store.save();
    return s.daily;
  }
  function claimTask(k) {
    const task = ensureDaily().tasks[k];
    if (!task || task.claimed || task.progress < task.target) return null;
    task.claimed = true;
    give(task.reward);
    weekPoint();
    d().stats.dailyDone = (d().stats.dailyDone || 0) + 1;
    Store.save();
    return task.reward;
  }
  const DAILY_BONUS = { type: 'stars', n: 2 };
  function claimBonus() {
    const dl = ensureDaily();
    if (dl.bonusClaimed || !dl.tasks.every((t) => t.claimed)) return null;
    dl.bonusClaimed = true;
    give(DAILY_BONUS);
    weekPoint();
    return DAILY_BONUS;
  }

  // ---------- Savaitės skrynios (taškai už atliktas užduotis; nuo pirmadienio iš naujo) ----------
  const WEEK_GOALS = [
    { at: 5, rewards: [{ type: 'life', n: 2 }, { type: 'shovel', n: 2 }] },
    { at: 12, rewards: [{ type: 'can', n: 1 }, { type: 'rake', n: 1 }, { type: 'stars', n: 2 }] },
    { at: 20, rewards: [{ type: 'stars', n: 5 }, { type: 'bomb', n: 2 }, { type: 'moves', n: 1 }, { type: 'life', n: 3 }], big: true },
  ];
  const WEEK_MAX = 20;
  function weekStart(t = Date.now()) {
    const x = new Date(t);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x;
  }
  function ensureWeek() {
    const s = d();
    const k = dayKey(weekStart().getTime());
    if (!s.week || s.week.key !== k) { s.week = { key: k, pts: 0, got: [] }; Store.save(); }
    return s.week;
  }
  function weekPoint() { const w = ensureWeek(); w.pts++; Store.save(); }
  function weekDaysLeft() { return Math.max(1, Math.ceil((weekStart().getTime() + 7 * 86400000 - Date.now()) / 86400000)); }
  function claimWeek(i) {
    const w = ensureWeek();
    const g = WEEK_GOALS[i];
    if (!g || w.got.includes(i) || w.pts < g.at) return null;
    w.got.push(i);
    g.rewards.forEach(give);
    if (g.big) d().stats.weekBig = (d().stats.weekBig || 0) + 1;
    Store.save();
    return g.rewards;
  }
  const weekReady = () => { const w = ensureWeek(); return WEEK_GOALS.some((g, i) => w.pts >= g.at && !w.got.includes(i)); };

  // ---------- Apranga ----------
  const OUTFITS = {
    hat: [
      { id: 'straw', name: 'Šiaudinė skrybėlė' },
      { id: 'flower', name: 'Gėlių vainikas' },
      { id: 'cap', name: 'Sodininko kepurė' },
      { id: 'beret', name: 'Beretė' },
      { id: 'winter', name: 'Megzta kepurė' },
      { id: 'pumpkin', name: 'Moliūgo kepurė', event: true },
      { id: 'leafcrown', name: 'Rudens lapų vainikas', event: true },
      { id: 'santa', name: 'Kalėdų kepurė', event: true },
      { id: 'hearts', name: 'Širdelių skrybėlaitė', event: true },
      { id: 'bunny', name: 'Kiškio ausytės', event: true },
      { id: 'midsummer', name: 'Joninių vainikas', event: true },
      { id: 'beret_teal', name: 'Smaragdinė beretė' },
      { id: 'winter_green', name: 'Žalia megzta kepurė' },
      { id: 'cap_lilac', name: 'Alyvinė sodininko kepurė' },
      { id: 'none', name: 'Be kepurės' },
    ],
    scarf: [
      { id: 'green', name: 'Žalia skarelė' },
      { id: 'red', name: 'Raudona skarelė' },
      { id: 'blue', name: 'Mėlyna skarelė' },
      { id: 'gold', name: 'Auksinė skarelė' },
      { id: 'plaid', name: 'Languota skarelė', event: true },
      { id: 'lilac', name: 'Alyvinė skarelė', event: true },
      { id: 'hearts', name: 'Širdelių skarelė', event: true },
      { id: 'easter', name: 'Velykų skarelė', event: true },
      { id: 'pink', name: 'Rožinė skarelė' },
      { id: 'orange', name: 'Oranžinė skarelė' },
      { id: 'mint', name: 'Mėtinė skarelė' },
      { id: 'night', name: 'Nakties skarelė' },
    ],
  };

  // ---------- Pasiekimai ----------
  const ACH = [
    { id: 'first', name: 'Pirmoji lysvė', desc: 'Įveik pirmą lygį', stat: 'wins', target: 1, reward: { type: 'outfit', slot: 'scarf', id: 'red' } },
    { id: 'ten', name: 'Darbštuolis', desc: 'Įveik 10 lygių', stat: 'wins', target: 10, reward: { type: 'moves', n: 3 } },
    { id: 'weeds', name: 'Ravėtojas', desc: 'Išravėk 200 piktžolių', stat: 'weeds', target: 200, reward: { type: 'outfit', slot: 'hat', id: 'flower' } },
    { id: 'bombs', name: 'Sprogdintojas', desc: 'Susprogdink 40 sprogstančių elementų', stat: 'bombs', target: 40, reward: { type: 'outfit', slot: 'hat', id: 'cap' } },
    { id: 'rainbow', name: 'Auksinė sėkla', desc: 'Sukurk 10 auksinių sėklų', stat: 'rainbows', target: 10, reward: { type: 'outfit', slot: 'scarf', id: 'gold' } },
    { id: 'stones', name: 'Akmenskaldys', desc: 'Sudaužyk 100 akmenų ar kelmų', stat: 'obstacles', target: 100, reward: { type: 'outfit', slot: 'hat', id: 'beret' } },
    { id: 'stars', name: 'Žvaigždžių rinkėjas', desc: 'Surink 60 žvaigždučių', stat: 'starsTotal', target: 60, reward: { type: 'outfit', slot: 'hat', id: 'winter' } },
    { id: 'garden', name: 'Kiemo šeimininkas', desc: 'Atlik 17 sodo darbų', stat: 'garden', target: 17, reward: { type: 'outfit', slot: 'scarf', id: 'blue' } },
    { id: 'chains', name: 'Grandinių meistras', desc: 'Padaryk 25 grandines iš 4+', stat: 'bigCascades', target: 25, reward: { type: 'can', n: 2 } },
    { id: 'daily', name: 'Kasdienis sodininkas', desc: 'Atlik 15 dienos užduočių', stat: 'dailyDone', target: 15, reward: { type: 'rake', n: 2 } },
    { id: 'moles', name: 'Kurmių gaudytojas', desc: 'Išprašyk 30 kurmių', stat: 'moles', target: 30, reward: { type: 'life', n: 5 } },
    { id: 'honey', name: 'Medaus rinkėjas', desc: 'Surink 150 medaus lašų', stat: 'honey', target: 150, reward: { type: 'bomb', n: 3 } },
    { id: 'pots', name: 'Vazonų meistras', desc: 'Pripildyk 40 vazonų', stat: 'pots', target: 40, reward: { type: 'moves', n: 3 } },
    { id: 'grain', name: 'Malūnininkas', desc: 'Surink 120 saujų grūdų', stat: 'grain', target: 120, reward: { type: 'bomb', n: 3 } },
    { id: 'seeds', name: 'Sėjėjas', desc: 'Nuleisk 30 sėklų maišelių', stat: 'seeds', target: 30, reward: { type: 'life', n: 5 } },
    // Daugiau pasiekimų
    { id: 'wins50', name: 'Patyręs sodininkas', desc: 'Įveik 50 lygių', stat: 'wins', target: 50, reward: { type: 'outfit', slot: 'scarf', id: 'mint' } },
    { id: 'wins150', name: 'Sodo meistras', desc: 'Įveik 150 lygių', stat: 'wins', target: 150, reward: { type: 'outfit', slot: 'hat', id: 'cap_lilac' } },
    { id: 'perfect', name: 'Trys žvaigždutės', desc: 'Įveik 30 lygių su 3 žvaigždutėmis', stat: 'perfect', target: 30, reward: { type: 'outfit', slot: 'scarf', id: 'pink' } },
    { id: 'clean', name: 'Be jokios pagalbos', desc: 'Įveik 25 lygius nenaudodamas pagalbų', stat: 'cleanWins', target: 25, reward: { type: 'outfit', slot: 'hat', id: 'winter_green' } },
    { id: 'peonies', name: 'Bijūnų sodas', desc: 'Surink 1000 bijūnų', stat: 'col0', target: 1000, reward: { type: 'outfit', slot: 'scarf', id: 'orange' } },
    { id: 'specials', name: 'Ypatingų kūrėjas', desc: 'Sukurk 300 ypatingų elementų', stat: 'specials', target: 300, reward: { type: 'can', n: 3 } },
    { id: 'ice', name: 'Šalnos tirpdytojas', desc: 'Atšildyk 150 užšalusių langelių', stat: 'ice', target: 150, reward: { type: 'shovel', n: 3 } },
    { id: 'moss', name: 'Samanų valytojas', desc: 'Nuvalyk 150 samanų', stat: 'moss', target: 150, reward: { type: 'rake', n: 2 } },
    { id: 'combs', name: 'Korių laužytojas', desc: 'Sudaužyk 60 korių', stat: 'combs', target: 60, reward: { type: 'life', n: 5 } },
    { id: 'sacks', name: 'Maišų draskytojas', desc: 'Pradraskyk 60 miltų maišų', stat: 'sacks', target: 60, reward: { type: 'bomb', n: 3 } },
    { id: 'dailylv', name: 'Dienos lygių mėgėjas', desc: 'Įveik 10 dienos lygių', stat: 'dailyLevels', target: 10, reward: { type: 'outfit', slot: 'hat', id: 'beret_teal' } },
    { id: 'loyal', name: 'Ištikimas draugas', desc: 'Užsuk į sodą 7 dienas iš eilės', stat: 'streakBest', target: 7, reward: { type: 'stars', n: 3 } },
    { id: 'weekbig', name: 'Savaitės čempionas', desc: 'Atidaryk 3 didžiąsias savaitės dovanas', stat: 'weekBig', target: 3, reward: { type: 'moves', n: 3 } },
    { id: 'combos', name: 'Derinių meistras', desc: 'Sukeisk du ypatingus elementus 30 kartų', stat: 'combos', target: 30, reward: { type: 'stars', n: 3 } },
    { id: 'speed', name: 'Žaibiškos rankos', desc: 'Greitajame režime surink 30 000 taškų', stat: 'timedBest', target: 30000, reward: { type: 'stars', n: 5 } },
    { id: 'gardenall', name: 'Sodo atgaivintojas', desc: 'Atlik visus sodo darbus', stat: 'garden', target: 0, reward: { type: 'outfit', slot: 'scarf', id: 'night' } },
  ];
  // Visų sodo darbų skaičius žinomas tik įkėlus sodą
  ACH.find((a) => a.id === 'gardenall').target = typeof Garden !== 'undefined' ? Garden.ITEMS.length : 54;
  function statValue(stat) {
    if (stat === 'starsTotal') return Store.totalStars();
    if (stat === 'garden') return d().garden;
    if (stat === 'perfect') return Math.max(d().stats.perfect || 0, Object.values(d().stars || {}).filter((x) => x >= 3).length);
    if (stat === 'timedBest') return d().timedBest || 0;
    if (stat === 'streakBest') return Math.max((d().streak && d().streak.best) || 0, (d().streak && d().streak.total) || 0);
    return d().stats[stat] || 0;
  }
  function achievements() {
    return ACH.map((a) => ({ ...a, value: Math.min(a.target, statValue(a.stat)), done: statValue(a.stat) >= a.target, claimed: !!d().achClaimed[a.id] }));
  }
  function claimable() {
    return achievements().filter((a) => a.done && !a.claimed);
  }
  function claimAch(id) {
    const a = achievements().find((x) => x.id === id);
    if (!a || !a.done || a.claimed) return null;
    d().achClaimed[id] = true;
    if (a.reward.type === 'outfit') {
      d().owned[a.reward.slot].push(a.reward.id);
      d().outfit[a.reward.slot] = a.reward.id;
      ART.setOutfit(d().outfit);
    } else give(a.reward);
    Store.save();
    return a.reward;
  }
  function achRewardText(r) {
    if (r.type === 'outfit') return OUTFITS[r.slot].find((o) => o.id === r.id).name;
    return rewardText(r);
  }

  function init() {
    const s = d();
    if (s.lives == null) { s.lives = MAX_LIVES; s.livesTs = Date.now(); }
    if (!s.boosters) s.boosters = { shovel: s.shovels != null ? s.shovels : 3, can: 1, rake: 1 };
    if (s.boosters.bomb == null) s.boosters.bomb = 1;
    if (s.boosters.moves == null) s.boosters.moves = 1;
    if (!s.stats) s.stats = {};
    if (!s.achClaimed) s.achClaimed = {};
    if (!s.owned) s.owned = { hat: ['straw', 'none'], scarf: ['green'] };
    if (!s.outfit) s.outfit = { hat: 'straw', scarf: 'green' };
    ART.setOutfit(s.outfit);
    syncLives();
    ensureDaily();
    Store.save();
  }

  return {
    STREAK, checkIn, startStreak,
    MAX_LIVES, init, lives, msToNext, msToFull, loseLife, addLives, fmt,
    BOOSTERS, give, rewardText,
    record, ensureDaily, claimTask, claimBonus, DAILY_BONUS,
    ensureWeek, claimWeek, weekReady, weekDaysLeft, WEEK_GOALS, WEEK_MAX,
    OUTFITS, achievements, claimable, claimAch, achRewardText,
  };
})();
