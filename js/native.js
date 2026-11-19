// Android programėlės ypatybės (veikia tik programėlėje, naršyklėje nieko nedaro):
//   „Atgal“ mygtukas, būsenos juosta, AdMob paleidimas. (Muzika fone sustoja per visibilitychange.)
const Native = (() => {
  const cap = window.Capacitor;
  const isApp = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const P = isApp ? cap.Plugins : {};
  const $ = (s) => document.querySelector(s);
  const visible = (el) => el && !el.classList.contains('hidden');

  // Telefono „Atgal“: uždaro langą → išeina iš lygio → suskleidžia programėlę
  function back() {
    if (document.querySelector('.fake-ad')) return;
    const dlg = $('#dialog');
    if (visible(dlg)) { dlg.click(); return; }
    const modal = $('#modal');
    if (visible(modal)) {
      const btns = modal.querySelectorAll('.modal-actions .btn');
      if (btns.length) btns[0].click();   // pirmas mygtukas – „Ne“, „Likti“ ar vienintelis
      return;
    }
    if ($('#screen-game').classList.contains('active')) { $('#btn-back').click(); return; }
    if (App.tab && App.tab !== 'sodas') { App.setTab('sodas'); return; }
    if (P.App) P.App.minimizeApp();
  }

  function init() {
    if (!isApp) return;
    document.documentElement.classList.add('native-app');
    if (P.App) {
      P.App.addListener('backButton', back);
    }
    if (P.StatusBar) {
      P.StatusBar.setStyle({ style: 'LIGHT' }).catch(() => {});
      P.StatusBar.setBackgroundColor({ color: '#efe2c8' }).catch(() => {});
    }
    Ads.init();
  }

  // ---------- Priminimai (vietiniai pranešimai telefone) ----------
  // Suplanuojami, kai žaidėjas išeina iš žaidimo, ir atšaukiami jam grįžus.
  const LN = () => P.LocalNotifications;
  const IDS = [1, 2, 3, 4];
  // Pranešimai tik dieną: 10–21 val.
  function daytime(t) {
    const x = new Date(t);
    if (x.getHours() < 10) x.setHours(10, 0, 0, 0);
    else if (x.getHours() >= 21) { x.setDate(x.getDate() + 1); x.setHours(10, 0, 0, 0); }
    return x;
  }
  const at = (dayOffset, h) => { const x = new Date(); x.setDate(x.getDate() + dayOffset); x.setHours(h, 0, 0, 0); return x; };
  async function cancelAll() {
    if (!LN()) return;
    try { await LN().cancel({ notifications: IDS.map((id) => ({ id })) }); } catch (e) { /* nieko */ }
  }
  async function permitted(ask) {
    if (!LN()) return false;
    try {
      let p = await LN().checkPermissions();
      if (p.display === 'granted') return true;
      if (!ask || p.display === 'denied') return false;
      p = await LN().requestPermissions();
      return p.display === 'granted';
    } catch (e) { return false; }
  }
  // Leidimo paklausiam vieną kartą, kai žaidėjas jau įsijautė (po kelių lygių)
  async function askOnce() {
    const d = Store.data;
    if (!isApp || d.notify === false || d.notifyAsked || (d.unlocked || 1) < 4) return;
    d.notifyAsked = true;
    Store.save();
    await permitted(true);
  }
  async function schedule() {
    if (!isApp || !LN()) return;
    await cancelAll();
    const d = Store.data;
    if (d.notify === false || !(await permitted(false))) return;
    const list = [];
    const now = Date.now();
    // 1. Gyvybės vėl pilnos
    const full = Progress.msToFull();
    if (full > 0) list.push({ id: 1, title: T('Gyvybės vėl pilnos 💚'), body: T('Pūkis laukia sode – galim tvarkyti lysves!'), schedule: { at: daytime(now + full) } });
    // 2. Rytdienos dienos lygis ir dovana (arba šiandien 18 val., jei dar neįveiktas)
    const dlvOpen = typeof DailyLevel !== 'undefined' && DailyLevel.available() && !DailyLevel.state().won;
    const today18 = at(0, 18);
    if (dlvOpen && today18.getTime() > now + 30 * 60000) list.push({ id: 2, title: T('Dienos lygis laukia ☀️'), body: T('Šiandienos lygis dar neįveiktas – už jį laukia dovana.'), schedule: { at: today18 } });
    else list.push({ id: 2, title: T('Nauja dienos dovana 🎁'), body: T('Sandėliuke vėl kažkas yra! Užsuk pasiimti.'), schedule: { at: at(1, 18) } });
    // 3. Ilgiau nesimatėm
    list.push({ id: 3, title: T('Pūkis pasiilgo tavęs 🐶'), body: T('Sode jau išdygo naujų piktžolių… Gal padėsi?'), schedule: { at: at(3, 18) } });
    // 4. Savaitgalio šventė prasideda (penktadienį 10 val.)
    if (!Events.isActive()) {
      const ms = Events.msLeft();
      const start = new Date(now + ms);
      start.setHours(10, 0, 0, 0);
      if (start.getTime() > now) {
        const ev = Events.current(new Date(now + ms + 3600000));
        list.push({ id: 4, title: T('Prasidėjo šventė: {0} 🎉', [T(ev.name)]), body: T('Įveik šventės lygius ir laimėk naują drabužį Pūkiui!'), schedule: { at: start } });
      }
    }
    list.forEach((n) => { n.smallIcon = 'ic_stat_leaf'; n.iconColor = '#6f8f5a'; });
    try { await LN().schedule({ notifications: list }); } catch (e) { /* nieko */ }
  }
  if (isApp) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) schedule();
      else cancelAll();
    });
    window.addEventListener('DOMContentLoaded', () => setTimeout(cancelAll, 500));
  }

  return { isApp, init, back, reminders: { schedule, cancelAll, askOnce, permitted } };
})();

window.addEventListener('DOMContentLoaded', Native.init);
