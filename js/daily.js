// Dienos lygis: kasdien vis kitas lygis, padarytas iš jau įveikto lygio –
// išdėstymas apverčiamas veidrodiškai, pakeičiamos spalvos, pridedama 2 ėjimai.
// Toks lygis visada įveikiamas (pagrindas jau išbandytas), bet kasdien atrodo kitaip.
const DailyLevel = (() => {
  const MIN_UNLOCKED = 5; // rodomas tik baigus pirmuosius lygius (mokymą)
  const dayKey = (t = Date.now()) => { const x = new Date(t); return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`; };
  function seeded(str) {
    let h = 2166136261;
    for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  }
  // Tinkami pagrindai: įveikti lygiai, kurių tikslas ne vien taškai
  function bases(unlocked) {
    const max = Math.min(LEVELS.length, Math.max(1, unlocked - 1));
    const out = [];
    for (let i = 0; i < max; i++) {
      const g = LEVELS[i].goals || [];
      if (g.length && !g.every((x) => x.kind === 'score')) out.push(i);
    }
    return out.length ? out : [0];
  }
  // Sukuria dienos lygį pagal datą ir žaidėjo pažangą
  function make(date = dayKey(), unlocked = 1) {
    const rnd = seeded('dienos-' + date);
    const r = (n) => Math.floor(rnd() * n);
    const list = bases(unlocked);
    // Dažniau – naujesni lygiai (įdomesni), bet kartais ir senesni
    const pick = list[Math.min(list.length - 1, Math.floor(Math.pow(rnd(), 0.6) * list.length))];
    const base = LEVELS[pick];
    // Spalvų sukeitimas: atsitiktinė 6 rūšių perstata
    const perm = [0, 1, 2, 3, 4, 5];
    for (let i = perm.length - 1; i > 0; i--) { const j = r(i + 1); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    const colors = base.colors.map((c) => perm[c]).sort((a, b) => a - b);
    const goals = base.goals.map((g) => (g.kind === 'collect' ? { ...g, type: perm[g.type] } : { ...g }));
    const mirror = rnd() < 0.5;
    const layout = base.layout ? base.layout.map((row) => (mirror ? [...row].reverse().join('') : row)) : base.layout;
    return { ...base, colors, goals, layout, moves: base.moves + 2, baseIndex: pick, daily: date };
  }
  // ---------- Būsena ----------
  const st = () => {
    const d = Store.data;
    const t = dayKey();
    if (!d.dailyLevel || d.dailyLevel.date !== t) d.dailyLevel = { date: t, won: false, tries: 0 };
    return d.dailyLevel;
  };
  const available = () => (Store.data.unlocked || 1) >= MIN_UNLOCKED;
  const today = () => make(dayKey(), Store.data.unlocked || 1);
  // Prizas – tas pats visą dieną: 2 žvaigždutės sodui ir viena pagalba
  function prize() {
    const rnd = seeded('prizas-' + dayKey());
    const b = ['shovel', 'can', 'rake', 'bomb', 'moves'][Math.floor(rnd() * 5)];
    return [{ type: 'stars', n: 2 }, { type: b, n: 1 }];
  }
  function win() {
    const s = st();
    if (s.won) return null;
    s.won = true;
    const d = Store.data;
    d.stats.dailyLevels = (d.stats.dailyLevels || 0) + 1;
    // Serija: kiek dienų iš eilės įveiktas dienos lygis
    const y = dayKey(Date.now() - 86400000);
    d.dailyLevelStreak = d.dailyLevelLast === y ? (d.dailyLevelStreak || 0) + 1 : 1;
    d.dailyLevelLast = s.date;
    const p = prize();
    p.forEach((x) => Progress.give(x));
    Store.save();
    return p;
  }
  function msToMidnight() {
    const n = new Date();
    const m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
    return m - n;
  }
  return { make, today, state: st, available, prize, win, msToMidnight, dayKey, MIN_UNLOCKED };
})();
