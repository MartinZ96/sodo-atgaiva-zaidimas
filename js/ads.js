// Reklamos. Kol kas – BANDOMOSIOS (rodomas pakaitalas), kad būtų galima pajusti, kaip tai atrodys.
// Kuriant Android programėlę čia bus prijungtas Google AdMob (žr. REKLAMOS.md).
//
// Reklamų vietos:
//   life       – pasibaigus gyvybėms: reklama → +1 gyvybė
//   continue   – pasibaigus ėjimams: reklama → +3 ėjimai (kartą per bandymą)
//   daily      – dienos dovana: reklama → dovana dviguba
//   interstitial – tarp lygių (ne dažniau kaip kas 3 laimėtus lygius, tik nuo 10 lygio)
const Ads = (() => {
  const CFG = {
    rewardedPerDay: 15,      // daugiausiai apdovanojamų reklamų per dieną
    interstitialEvery: 3,    // kas kiek laimėtų lygių
    interstitialFromLevel: 10,
    testSeconds: 5,          // bandomosios reklamos trukmė
  };

  const d = () => Store.data;
  const today = () => { const n = new Date(); return `${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}`; };

  // Ar reklamos išvis rodomos (vėliau: išjungiamos nusipirkus „Be reklamų“)
  const enabled = () => d().adsTest !== false && !d().adsRemoved;

  function counter() {
    const s = d();
    if (!s.adCount || s.adCount.day !== today()) s.adCount = { day: today(), rewarded: 0, wins: 0 };
    return s.adCount;
  }
  const canRewarded = () => enabled() && counter().rewarded < CFG.rewardedPerDay;

  // ── Tikra AdMob reklama (Android programėlėje per Capacitor) ──
  // Kol TEST = true, rodomos Google bandomosios reklamos (pinigų neneša, bet ir nepažeidžia taisyklių).
  // Prieš skelbiant Google Play: TEST = false ir įrašyti savo ID iš admob.google.com (žr. REKLAMOS.md).
  const TEST = true;
  const IDS = {
    rewarded: 'ca-app-pub-3940256099942544/5224354917',      // Google bandomasis ID
    interstitial: 'ca-app-pub-3940256099942544/1033173712',  // Google bandomasis ID
  };
  let ready = null;

  function native() {
    const cap = window.Capacitor;
    if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return null;
    return cap.Plugins && cap.Plugins.AdMob ? cap.Plugins.AdMob : null;
  }

  // Paleidžiama vieną kartą: AdMob + ES sutikimo langas (GDPR), jei jo reikia
  function init() {
    const ad = native();
    if (!ad || ready) return ready;
    ready = (async () => {
      try {
        // Jaukus žaidimas – leidžiamos tik visai šeimai tinkančios reklamos
        await ad.initialize({ initializeForTesting: TEST, maxAdContentRating: 'General' });
        const info = await ad.requestConsentInfo();
        if (info && info.isConsentFormAvailable && info.status === 'REQUIRED') await ad.showConsentForm();
      } catch (e) { /* be interneto ar be sutikimo formos – žaidžiam toliau */ }
    })();
    return ready;
  }

  // Leidžia žaidėjui bet kada pakeisti reklamų sutikimą (ES reikalavimas)
  async function privacyOptions() {
    const ad = native();
    if (!ad) return;
    try {
      await init();
      await ad.showPrivacyOptionsForm();
    } catch (e) {
      toast('Reklamų nustatymai dabar nepasiekiami.');
    }
  }

  function toast(text) {
    const el = document.createElement('div');
    el.className = 'ad-toast';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  // Rodo AdMob reklamą ir laukia, kol ji bus uždaryta. Grąžina, ar gautas apdovanojimas.
  function nativeShow(ad, kind) {
    const rw = kind === 'rewarded';
    const ev = rw ? 'onRewardedVideoAd' : 'interstitialAd';
    return new Promise(async (resolve) => {
      let earned = false, done = false;
      const hs = [];
      const wasMusic = Music.playing;
      const finish = (v) => {
        if (done) return;
        done = true;
        hs.forEach((h) => h && h.remove && h.remove());
        if (wasMusic) Music.start();
        resolve(v);
      };
      try {
        await init();
        if (wasMusic) Music.stop();
        hs.push(await ad.addListener(ev + 'Dismissed', () => setTimeout(() => finish(rw ? earned : true), 300)));
        hs.push(await ad.addListener(ev + 'FailedToShow', () => finish(false)));
        if (rw) hs.push(await ad.addListener('onRewardedVideoAdReward', () => { earned = true; }));
        if (rw) {
          await ad.prepareRewardVideoAd({ adId: IDS.rewarded, isTesting: TEST });
          ad.showRewardVideoAd().then(() => { earned = true; }).catch(() => finish(false));
        } else {
          await ad.prepareInterstitial({ adId: IDS.interstitial, isTesting: TEST });
          ad.showInterstitial().catch(() => finish(false));
        }
      } catch (e) {
        if (rw) toast('Reklama dabar nepasiekiama. Patikrink internetą.');
        finish(false);
      }
    });
  }

  // Bandomoji reklama – pilno ekrano pakaitalas su laikmačiu
  function fakeAd(kind) {
    return new Promise((resolve) => {
      const wasMusic = Music.playing;
      if (wasMusic) Music.stop();
      const el = document.createElement('div');
      el.className = 'fake-ad';
      const secs = kind === 'interstitial' ? 3 : CFG.testSeconds;
      el.innerHTML = `<div class="fa-box"><div class="fa-tag">BANDOMOJI REKLAMA</div>
        <div class="fa-title">${kind === 'interstitial' ? 'Čia bus reklama tarp lygių' : 'Čia bus apdovanojama reklama'}</div>
        <p>Tikroje programėlėje čia rodys Google AdMob reklamą.</p>
        <div class="fa-count">Liko <b>${secs}</b> s</div>
        <button class="btn" disabled>Palauk…</button></div>`;
      document.body.appendChild(el);
      let left = secs;
      const btn = el.querySelector('button');
      const t = setInterval(() => {
        left--;
        el.querySelector('.fa-count b').textContent = Math.max(0, left);
        if (left <= 0) {
          clearInterval(t);
          btn.disabled = false;
          btn.textContent = kind === 'interstitial' ? 'Uždaryti ✕' : 'Atsiimti dovaną';
          btn.classList.add('primary');
        }
      }, 1000);
      btn.onclick = () => {
        el.remove();
        if (wasMusic) Music.start();
        resolve(true);
      };
    });
  }

  // Apdovanojama reklama: grąžina true, jei žiūrėta iki galo
  async function rewarded(placement) {
    if (!canRewarded()) return false;
    let ok = false;
    const ad = native();
    if (ad) {
      ok = await nativeShow(ad, 'rewarded');
    } else {
      ok = await fakeAd('rewarded');
    }
    if (ok) { counter().rewarded++; Store.save(); }
    return ok;
  }

  // Reklama tarp lygių – rodoma retai, tik po laimėjimo
  async function afterWin(levelIndex) {
    if (!enabled() || levelIndex < CFG.interstitialFromLevel - 1) return;
    const c = counter();
    c.wins++;
    Store.save();
    if (c.wins % CFG.interstitialEvery !== 0) return;
    const ad = native();
    if (ad) {
      await nativeShow(ad, 'interstitial');
      return;
    }
    await fakeAd('interstitial');
  }

  return { init, rewarded, afterWin, canRewarded, enabled, privacyOptions, TEST, CFG };
})();
