// Žaidimo statistika lygių balansui: kiekvienas bandymas užrašomas telefone,
// o žaidžiant per namų Wi-Fi – dar ir nusiunčiamas į kompiuterį (sodo-atgaiva/statistika/).
// Jokių asmens duomenų: tik lygis, rezultatas, ėjimai, laikas.
const Telemetry = (() => {
  let cur = null;
  const MAX = 800;

  function deviceId() {
    const d = Store.data;
    if (!d.devId) { d.devId = Math.random().toString(36).slice(2, 10); Store.save(); }
    return d.devId;
  }
  // key – lygio numeris (0…) arba „ev:šventė:nr“
  function begin(key, pre = []) {
    cur = { key, pre, t0: Date.now(), continues: 0 };
  }
  function addContinue() { if (cur) cur.continues++; }
  const active = () => !!cur;

  function end(result, snap = {}) {
    if (!cur) return;
    const rec = {
      v: 1,
      lvl: cur.key,
      res: result, // win | lose | quit
      used: snap.movesMade || 0,
      total: snap.movesTotal || 0,
      left: snap.movesLeft || 0,
      goals: snap.goalsLeft || [],
      boosters: snap.boosters || 0,
      pre: cur.pre,
      cont: cur.continues,
      stars: snap.stars || 0,
      score: snap.score || 0,
      sec: Math.round((Date.now() - cur.t0) / 1000),
      at: new Date().toISOString(),
    };
    cur = null;
    if (result === 'quit' && rec.used === 0) return; // tik pažiūrėjo – neskaičiuojam
    const d = Store.data;
    if (!d.telemetry) d.telemetry = [];
    d.telemetry.push(rec);
    if (d.telemetry.length > MAX) d.telemetry.splice(0, d.telemetry.length - MAX);
    Store.save();
    send(rec);
  }

  function send(rec) {
    // Siunčiam tik į namų kompiuterį (vietinis serveris), ne iš viešos svetainės
    const h = location.hostname;
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return;
    if (!(h === 'localhost' || /^192\.168\.|^10\.|^127\./.test(h))) return;
    try {
      fetch('/api/stats', { method: 'POST', body: JSON.stringify({ ...rec, dev: deviceId() }), keepalive: true }).catch(() => {});
    } catch (e) { /* nesvarbu */ }
  }

  // Suvestinė pagal lygius (rodoma nustatymuose)
  function summary() {
    const by = new Map();
    for (const r of Store.data.telemetry || []) {
      if (typeof r.lvl !== 'number') continue;
      const s = by.get(r.lvl) || { lvl: r.lvl, tries: 0, wins: 0, used: 0, sec: 0 };
      s.tries++;
      if (r.res === 'win') { s.wins++; s.used += r.used; }
      s.sec += r.sec;
      by.set(r.lvl, s);
    }
    return [...by.values()].sort((a, b) => a.lvl - b.lvl);
  }

  return { begin, end, addContinue, active, summary };
})();
