// Žaidimo versija (rodoma nustatymuose; Android – android/app/build.gradle versionName)
const APP_VERSION = '1.0';
// Programėlės „smegenys“: ekranai, sodas, lygių žemėlapis, langai, Pūkio dialogai.
const App = (() => {
  const $ = (s) => document.querySelector(s);

  function show(id) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  }

  // Tekstas iš išsaugojimo įterpiamas į HTML tik „išvalytas“
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  function modal(html, buttons, onReady) {
    return new Promise((resolve) => {
      const m = $('#modal');
      const card = $('#modal-card');
      card.innerHTML = html + '<div class="modal-actions"></div>';
      if (onReady) setTimeout(() => onReady(card), 0);
      const act = card.querySelector('.modal-actions');
      for (const b of buttons) {
        const btn = document.createElement('button');
        btn.className = 'btn ' + (b.cls || '');
        btn.textContent = b.label;
        btn.onclick = () => {
          m.classList.add('hidden');
          Sfx.click();
          resolve(b.value);
        };
        act.appendChild(btn);
      }
      m.classList.remove('hidden');
    });
  }

  const starRow = (n, total = 3) =>
    Array.from({ length: total }, (_, i) => `<span class="${i < n ? 'on' : ''}">★</span>`).join('');
  const pukisSays = (line) =>
    `<div class="pk-say"><div class="pk-mini">${ART.portrait(line.who, line.e)}</div><div class="pk-bubble">${line.t}</div></div>`;

  function goalText(g) {
    switch (g.kind) {
      case 'collect': return `Surink: ${ART.names[g.type].toLowerCase()} – ${g.count}`;
      case 'weeds': return 'Išravėk visas piktžoles';
      case 'stones': return 'Sudaužyk visus akmenis';
      case 'stumps': return 'Išrauk visus kelmus';
      case 'moss': return 'Nuvalyk visas samanas';
      case 'seeds': return 'Nuleisk visus sėklų maišelius';
      case 'moles': return 'Išprašyk visus kurmius';
      case 'combs': return 'Sudaužyk visus korius';
      case 'honey': return `Surink ${g.count} medaus lašų`;
      case 'sacks': return 'Pradraskyk visus miltų maišus';
      case 'grain': return `Surink ${g.count} saujų grūdų`;
      case 'pots': return 'Pripildyk visus vazonus';
      case 'ice': return 'Atšildyk visus užšalusius';
      case 'score': return `Surink ${g.score} taškų`;
    }
  }

  // ---------- Pagrindinis ekranas ----------
  let viewZone = null;

  // ---------- Gyvybės ----------
  function renderLives() {
    const n = Progress.lives();
    const ms = Progress.msToNext();
    $('#home-lives').innerHTML = `<span class="heart">♥</span> ${n}${ms ? `<small>${Progress.fmt(ms)}</small>` : ''}`;
  }
  setInterval(() => {
    if ($('#screen-home').classList.contains('active')) renderLives();
  }, 1000);

  async function noLives() {
    const ms = Progress.msToNext();
    const canAd = Ads.canRewarded();
    const watch = await modal(
      `<h2>Gyvybės baigėsi</h2>${pukisSays({ e: 'sad', t: `Pailsėkim truputį. Nauja gyvybė po ${Progress.fmt(ms)}.${canAd ? ' Arba – pažiūrėk trumpą reklamą ir gausi gyvybę iškart!' : ' Tuo metu gali pasižiūrėti sodą ar atlikti dienos užduotis.'}` })}`,
      canAd
        ? [{ label: 'Palauksiu', value: false }, { label: '▶ Reklama: +1 ♥', value: true, cls: 'primary' }]
        : [{ label: 'Gerai', cls: 'primary' }]
    );
    if (watch && (await Ads.rewarded('life'))) {
      Progress.addLives(1);
      Sfx.unlock();
      renderHome();
    }
  }

  // ---------- Šventimas: konfeti, prizų žetonai, dovanų dėžutė ----------
  const CONF = ['#e48ea1', '#f0c64a', '#8dbb6c', '#9aa9e0', '#f7876a', '#cfa6e0', '#fff3b0'];
  function confetti(n = 40) {
    if (document.documentElement.classList.contains('lite')) n = Math.ceil(n / 2);
    const box = document.createElement('div');
    box.className = 'confetti';
    let h = '';
    for (let i = 0; i < n; i++) {
      const w = 6 + Math.random() * 6;
      h += `<i style="left:${Math.random() * 100}%;background:${CONF[i % CONF.length]};width:${w}px;height:${w * (Math.random() < 0.5 ? 0.5 : 1.4)}px;--x:${(Math.random() - 0.5) * 160}px;--r:${(Math.random() - 0.5) * 1080}deg;animation-delay:${Math.random() * 0.5}s;animation-duration:${1.8 + Math.random() * 1.4}s;border-radius:${Math.random() < 0.4 ? '50%' : '2px'}"></i>`;
    }
    box.innerHTML = h;
    $('#modal').appendChild(box);
    setTimeout(() => box.remove(), 3600);
  }
  const rewardName = (r) => (r.type === 'life' ? (r.n > 1 ? 'gyvybės' : 'gyvybė') : r.type === 'stars' ? 'žvaigždutės sodui'
    : (r.n > 1 ? Progress.BOOSTERS[r.type].plural : Progress.BOOSTERS[r.type].name).toLowerCase());
  const rewardChips = (list) => `<div class="rw-chips">${list.map((r, i) => `<div class="rw-chip" style="animation-delay:${i * 0.14}s"><div class="rw-ico">${rewardIcon(r)}</div><b>+${r.n}</b><small>${rewardName(r)}</small></div>`).join('')}</div>`;
  const giftSvg = (gold) => {
    const [a, b, rib] = gold ? ['#f3cf6a', '#c8932e', '#b8432b'] : ['#e7a58b', '#c46f52', '#6f8f5a'];
    return `<svg viewBox="0 0 100 100"><g class="g-body"><rect x="16" y="44" width="68" height="48" rx="6" fill="${b}"/><rect x="16" y="44" width="68" height="20" rx="4" fill="${a}" opacity=".55"/><rect x="44" y="44" width="12" height="48" fill="${rib}"/></g>
      <g class="g-lid"><rect x="10" y="32" width="80" height="16" rx="5" fill="${a}"/><rect x="44" y="32" width="12" height="16" fill="${rib}"/>
      <path d="M50 32 C36 14 22 22 32 30 C38 34 46 33 50 32 Z M50 32 C64 14 78 22 68 30 C62 34 54 33 50 32 Z" fill="${rib}"/><circle cx="50" cy="31" r="5" fill="${rib}"/></g></svg>`;
  };
  // Langas su dovanų dėžute: paspaudus ji atsidaro ir iššoka prizai
  function giftModal({ title, top = '', rewards, say, gold, buttons }) {
    return modal(`<h2>${title}</h2>${top}<div class="gift-wrap"><button class="gift${gold ? ' gold' : ''}" aria-label="${T('Atidaryk dovaną')}">${giftSvg(gold)}</button>
      <div class="gift-hint">${T('Paspausk dovaną!')}</div><div class="gift-out"></div></div>${say ? pukisSays(say) : ''}`,
    buttons || [{ label: 'Puiku', cls: 'primary' }], (card) => {
      const act = card.querySelector('.modal-actions');
      act.classList.add('wait');
      const g = card.querySelector('.gift');
      const open = () => {
        if (g.classList.contains('open')) return;
        g.classList.add('open');
        Sfx.whoosh();
        setTimeout(() => {
          card.querySelector('.gift-hint').remove();
          card.querySelector('.gift-out').innerHTML = rewardChips(rewards);
          card.querySelector('.gift-wrap').classList.add('opened');
          confetti(gold ? 60 : 40);
          Sfx.unlock();
          act.classList.remove('wait');
        }, 420);
      };
      g.onclick = open;
    });
  }
  // Paprastas prizo langas be dėžutės
  function prizeModal(title, rewards, say) {
    return modal(`<h2>${title}</h2>${rewardChips(rewards)}${say ? pukisSays(say) : ''}`, [{ label: 'Ačiū', cls: 'primary' }], () => { confetti(24); Sfx.unlock(); });
  }

  // ---------- Dienos užduotys ----------
  function taskIcon(t) {
    if (t.icon.piece != null) return ART.pieces[t.icon.piece];
    if (t.icon.img === 'sack') return ART.sack(2);
    if (t.icon.img === 'grain') return ART.grain;
    return t.icon.emoji;
  }
  function renderWeek() {
    const w = Progress.ensureWeek();
    const max = Progress.WEEK_MAX;
    const pct = Math.min(100, (w.pts / max) * 100);
    const chests = Progress.WEEK_GOALS.map((g, i) => {
      const got = w.got.includes(i);
      const ready = !got && w.pts >= g.at;
      return `<button class="wk-chest${got ? ' got' : ready ? ' ready' : ''}${g.big ? ' big' : ''}" data-week="${i}" style="left:${(g.at / max) * 100}%">${giftSvg(g.big)}<small>${got ? '✓' : g.at}</small></button>`;
    }).join('');
    return `<div class="week"><div class="wk-head"><b>${T('Savaitės dovanos')}</b><small>${T('{0} / {1} užduočių · liko {2} d.', [Math.min(w.pts, max), max, Progress.weekDaysLeft()])}</small></div>
      <div class="wk-track"><div class="wk-fill" style="width:${pct}%"></div>${chests}</div></div>`;
  }
  function renderDaily() {
    const dl = Progress.ensureDaily();
    const box = $('#daily-card');
    const doneN = dl.tasks.filter((t) => t.claimed).length;
    let h = renderWeek() + `<h3>Dienos užduotys <small>${doneN}/3 · atsinaujina vidurnaktį</small></h3>`;
    dl.tasks.forEach((t, k) => {
      const pct = Math.round((t.progress / t.target) * 100);
      const ready = t.progress >= t.target && !t.claimed;
      h += `<div class="task-row"><div class="t-ico">${taskIcon(t)}</div>
        <div class="t-main"><b>${esc(t.text)}</b><div class="t-bar"><div style="width:${pct}%"></div></div>
        <div class="t-sub">${t.progress}/${t.target} · prizas: ${Progress.rewardText(t.reward)}</div></div>
        <div class="t-act">${t.claimed ? '<span class="t-done">✓</span>' : ready ? `<button class="btn primary" data-claim="${k}">Atsiimti</button>` : ''}</div></div>`;
    });
    const allClaimed = dl.tasks.every((t) => t.claimed);
    h += `<div class="daily-bonus"><span>Atlik visas 3: ${Progress.rewardText(Progress.DAILY_BONUS)} sodui</span>${
      dl.bonusClaimed ? '<span class="t-done">✓</span>' : allClaimed ? '<button class="btn primary" id="claim-bonus">Atsiimti</button>' : ''}</div>`;
    box.innerHTML = h;
    box.querySelectorAll('[data-claim]').forEach((b) => (b.onclick = async () => {
      const r = Progress.claimTask(+b.dataset.claim);
      if (!r) return;
      Sfx.unlock();
      renderHome();
      await prizeModal('Užduotis atlikta', [r], { e: 'excited', t: 'Šaunu! Rytoj bus naujų užduočių.' });
      renderHome();
    }));
    box.querySelectorAll('[data-week]').forEach((b) => (b.onclick = async () => {
      const i = +b.dataset.week;
      const g = Progress.WEEK_GOALS[i];
      const w = Progress.ensureWeek();
      if (w.got.includes(i)) return;
      if (w.pts < g.at) {
        Sfx.click();
        return Dialog.say([{ e: 'thinking', t: T('Atlik dar {0} užduotis(-ių) – ir ši dovana tavo!', [g.at - w.pts]) }]);
      }
      const r = Progress.claimWeek(i);
      if (!r) return;
      renderHome();
      await giftModal({ title: 'Savaitės dovana', rewards: r, gold: g.big, say: { e: 'excited', t: g.big ? 'Didžioji savaitės dovana! Tu – tikras sodininkas.' : 'Dovana už kruopštų darbą!' } });
      renderHome();
    }));
    const bb = box.querySelector('#claim-bonus');
    if (bb) bb.onclick = async () => {
      const r = Progress.claimBonus();
      if (!r) return;
      renderHome();
      await giftModal({ title: 'Visos užduotys atliktos!', rewards: [r], say: { e: 'happy', t: 'Žvaigždutės sodui! Tikras sodininko darbas.' } });
      renderHome();
    };
  }

  // ---------- Pasiekimai ----------
  let achShowAll = false;
  function renderAchievements() {
    const box = $('#ach-list');
    const all = Progress.achievements();
    const rank = (a) => (a.done && !a.claimed ? 0 : a.claimed ? 2 : 1);
    const list = all.slice().sort((a, b) => rank(a) - rank(b) || (rank(a) === 1 ? b.value / b.target - a.value / a.target : 0));
    const got = all.filter((a) => a.claimed).length;
    let h = `<div class="ach-head">${T('Pasiekta {0} iš {1}', [got, all.length])}<div class="t-bar"><div style="width:${(got / all.length) * 100}%"></div></div></div>`;
    let shownDone = 0;
    list.forEach((a) => {
      if (a.claimed && ++shownDone > 3 && !achShowAll) return;
      const btn = a.done && !a.claimed ? `<button class="btn primary" data-ach="${a.id}">Atsiimti</button>` : a.claimed ? '<span class="t-done">✓</span>' : '';
      h += `<div class="ach-row ${a.done ? 'done' : ''}"><div class="medal">${a.done ? '★' : '☆'}</div>
        <div class="t-main"><b>${a.name}</b><small>${a.desc} · prizas: ${Progress.achRewardText(a.reward)}</small>
        <div class="t-bar"><div style="width:${Math.round((a.value / a.target) * 100)}%"></div></div><div class="t-sub">${a.value}/${a.target}</div></div>
        <div class="t-act">${btn}</div></div>`;
    });
    if (got > 3) h += `<button class="btn soft ach-more" id="ach-more">${achShowAll ? T('Slėpti atsiimtus') : T('Rodyti visus atsiimtus ({0})', [got])}</button>`;
    box.innerHTML = h;
    const more = box.querySelector('#ach-more');
    if (more) more.onclick = () => { achShowAll = !achShowAll; Sfx.click(); renderAchievements(); };
    box.querySelectorAll('[data-ach]').forEach((b) => (b.onclick = async () => {
      const r = Progress.claimAch(b.dataset.ach);
      if (!r) return;
      Sfx.win();
      renderHome();
      const isOutfit = r.type === 'outfit';
      await modal(`<h2>Naujas pasiekimas!</h2>${isOutfit ? `<div class="reward-pop">${Progress.achRewardText(r)}</div><div class="ward-preview">${ART.pukis('excited', false, Store.data.outfit)}</div>` : rewardChips([r])}
        ${pukisSays({ e: 'excited', t: isOutfit ? 'Ar man tinka? Jau apsirengiau!' : 'Pagalbos pravers sunkiose lysvėse!' })}`, [{ label: 'Puiku', cls: 'primary' }], () => confetti(isOutfit ? 50 : 30));
      renderHome();
    }));
  }

  // ---------- Titulinis ekranas ----------
  function showTitle() {
    const d = Store.data;
    const zi = Garden.currentZone(d.garden || 0);
    const bgKey = 'bg_' + Garden.ZONES[zi].id;
    const bg = $('#tt-bg');
    // Nupieštas titulinis paveikslas su visais veikėjais; jei jo nėra – zonos fonas ir Pūkis
    const painted = Img.has('title_art');
    $('#screen-title').classList.toggle('painted', painted);
    if (painted) bg.style.backgroundImage = `url(${Img.url('title_art')})`;
    else if (Img.has(bgKey)) bg.style.backgroundImage = `url(${Img.url(bgKey)})`;
    else if (Img.has('bg_terasa')) bg.style.backgroundImage = `url(${Img.url('bg_terasa')})`;
    $('#tt-pukis').innerHTML = painted ? '' : ART.pukis('happy');
    const lvl = d.unlocked || 1;
    $('#tt-status').innerHTML = d.seenWelcome
      ? `<span>${T('{0} lygis', [Math.min(lvl, LEVELS.length)])}</span><span>★ ${Store.available()}</span><span>${Garden.ZONES[zi].name}</span>`
      : '';
    // Krentantys žiedlapiai
    const pet = $('#tt-petals');
    pet.innerHTML = Array.from({ length: 14 }, () => {
      const c = ['#f2b8c0', '#f7d6a8', '#ffffff', '#e9a3a8'][Math.floor(Math.random() * 4)];
      return `<i style="left:${Math.random() * 100}%;background:${c};animation-duration:${7 + Math.random() * 6}s,${2 + Math.random() * 2}s;animation-delay:-${Math.random() * 12}s,-${Math.random() * 3}s"></i>`;
    }).join('');
    show('screen-title');
    return new Promise((res) => {
      $('#tt-play').onclick = () => {
        Sfx.click();
        const t = $('#screen-title');
        t.classList.add('leaving');
        setTimeout(() => { t.classList.remove('leaving'); show('screen-home'); window.scrollTo(0, 0); res(); }, 350);
      };
    });
  }

  // ---------- Prisijungimo serija ----------
  function rewardIcon(r) {
    if (r.type === 'life') return '<span class="heart">♥</span>';
    if (r.type === 'stars') return '<span class="st-star">★</span>';
    if (['shovel', 'can', 'rake'].includes(r.type)) return ART.booster(r.type);
    return (ART.boosterIcon && ART.boosterIcon(r.type)) || (r.type === 'bomb' ? '💥' : '➕');
  }
  async function showStreak() {
    const res = Progress.checkIn();
    if (!res) return;
    renderHome();
    Sfx.unlock();
    const tiles = Progress.STREAK.map((rw, i) => {
      const n = i + 1;
      const cls = n < res.day ? 'done' : n === res.day ? 'today' : '';
      const ico = n === 7 ? '<span class="st-box">🎁</span>' : rewardIcon(rw[0]);
      return `<div class="st-day ${cls}${n === 7 ? ' big' : ''}"><small>${T('{0} d.', [n])}</small><div class="st-ico">${ico}</div>${n < res.day ? '<i>✓</i>' : ''}</div>`;
    }).join('');
    const say = res.lost ? { e: 'sad', t: 'Oi, vakar nesimatėm… Serija prasideda iš naujo, bet dovana vis tiek yra!' }
      : res.day === 7 ? { e: 'excited', t: 'Septinta diena iš eilės! Štai didžioji dovanų dėžė!' }
      : res.day === 1 ? { e: 'happy', t: 'Labas rytas! Užsuk kasdien – septintą dieną laukia didžioji dovana.' }
      : { e: 'happy', t: `Jau ${res.day} diena iš eilės! Štai šiandienos dovana.` };
    const canAd = Ads.canRewarded();
    const dbl = await giftModal({ title: 'Dienos dovana', top: `<div class="streak">${tiles}</div>`, rewards: res.rewards, say, gold: res.day === 7,
      buttons: canAd ? [{ label: 'Atsiimti', value: false }, { label: '▶ Reklama: ×2', value: true, cls: 'primary' }] : [{ label: 'Atsiimti', value: false, cls: 'primary' }] });
    if (dbl && (await Ads.rewarded('daily'))) {
      res.rewards.forEach((r) => Progress.give(r));
      await prizeModal('Dovana padvigubinta!', res.rewards);
    }
    renderHome();
  }

  // ---------- Nustatymai ----------
  const BACKUP_PREFIX = 'SODAS1:';
  const PRIVACY_URL = 'https://martinz96.github.io/sodo-atgaiva-zaidimas/privatumas.html';
  async function showSettings() {
    Sfx.click();
    const d = Store.data;
    const tog = (key, label, def = true) => {
      const on = d[key] !== undefined ? d[key] !== false : def;
      return `<button class="set-row" data-key="${key}"><span>${label}</span><span class="switch ${on ? 'on' : ''}"><i></i></span></button>`;
    };
    // Garsumo eilutė: jungiklis + slankiklis
    const volRow = (key, volKey, def, label) => {
      const on = d[key] !== false;
      const v = typeof d[volKey] === 'number' ? d[volKey] : def;
      return `<div class="set-vol${on ? '' : ' off'}" data-vol="${volKey}"><button class="set-row" data-key="${key}"><span>${label}</span><span class="switch ${on ? 'on' : ''}"><i></i></span></button>
        <input type="range" min="5" max="100" step="5" value="${v}" aria-label="${label}" style="--p:${v}%"></div>`;
    };
    const h = `<h2>Nustatymai</h2>
      <div class="set-sec">Garsas</div>
      <div class="set-list">${volRow('music', 'musicVol', 70, '🎵 Muzika')}${volRow('sound', 'sfxVol', 80, '🔊 Garsai')}</div>
      <div class="set-sec">Žaidimas</div>
      <div class="set-list">${tog('vibrate', '📳 Vibracija')}${Native.isApp ? tog('notify', '🔔 Priminimai') : ''}${tog('cb', '👁 Simboliai spalvoms atskirti', false)}${tog('lite', '🪶 Taupus režimas (silpnam telefonui)', LITE)}${!Native.isApp || Ads.TEST ? tog('adsTest', '📺 Bandomosios reklamos') : ''}</div>
      <div class="set-sec">Pažanga</div>
      <div class="set-btns">
        <button class="btn soft" id="set-stats">📊 Mano statistika</button>
        <button class="btn soft" id="set-tut">👆 Rodyti mokymą iš naujo</button>
        <button class="btn soft" id="set-export">📋 Kopijuoti pažangos kodą</button>
        <button class="btn soft" id="set-import">📥 Atkurti iš kodo</button>
        <button class="btn soft danger" id="set-reset">🗑 Ištrinti visą pažangą</button>
      </div>
      <div id="set-extra"></div>
      <p class="muted small">Pažanga saugoma tik šiame telefone. Pažangos kodas leidžia ją perkelti į kitą telefoną ar naršyklę.</p>
      <div class="set-sec">Apie</div>
      <div class="set-btns">
        <button class="btn soft" id="set-lang" data-noi18n>🌐 Kalba / Language: <b>${I18N.NAMES[I18N.lang]}</b></button>
        <a class="btn soft" href="${PRIVACY_URL}${I18N.lang === 'lt' ? '' : '#en'}" target="_blank" rel="noopener">🔒 Privatumo politika</a>
        ${Native.isApp ? '<button class="btn soft" id="set-consent">📺 Reklamų privatumo nustatymai</button>' : ''}
      </div>
      <p class="set-ver">${T('Sodo atgaiva · versija {0} · {1} lygių', [APP_VERSION, LEVELS.length])}</p>`;
    const p = modal(h, [{ label: 'Uždaryti', cls: 'primary' }], (card) => {
      card.classList.add('wide');
      card.querySelector('#set-lang').onclick = () => {
        const ls = I18N.langs;
        I18N.setLang(ls[(ls.indexOf(I18N.lang) + 1) % ls.length]);
      };
      const cons = card.querySelector('#set-consent');
      if (cons) cons.onclick = () => Ads.privacyOptions();
      card.querySelectorAll('.set-row').forEach((b) => (b.onclick = () => {
        const k = b.dataset.key;
        d[k] = !b.querySelector('.switch').classList.contains('on');
        Store.save();
        if (k === 'lite') setLite(d[k]);
        if (k === 'cb') document.documentElement.classList.toggle('cb', d[k]);
        if (k === 'notify' && d[k]) Native.reminders.permitted(true);
        const vw = b.closest('.set-vol');
        if (vw) vw.classList.toggle('off', !d[k]);
        b.querySelector('.switch').classList.toggle('on', d[k]);
        if (k === 'music') d[k] ? Music.start() : Music.stop();
        if (k === 'vibrate' && d[k]) Sfx.vibe(40);
        Sfx.click();
      }));
      // Garsumo slankikliai
      card.querySelectorAll('.set-vol input').forEach((inp) => {
        const key = inp.closest('.set-vol').dataset.vol;
        let t = 0;
        inp.oninput = () => {
          d[key] = +inp.value;
          inp.style.setProperty('--p', inp.value + '%');
          if (key === 'musicVol') Music.setVolume();
          else { Sfx.setVolume(); clearTimeout(t); t = setTimeout(() => Sfx.pop(1), 80); }
        };
        inp.onchange = () => Store.save();
      });
      const extra = card.querySelector('#set-extra');
      card.querySelector('#set-stats').onclick = () => {
        const rows = Telemetry.summary();
        if (!rows.length) { extra.innerHTML = '<p class="muted">Statistikos dar nėra – pažaisk kelis lygius.</p>'; return; }
        extra.innerHTML = `<table class="stat-table"><tr><th>Lygis</th><th>Bandymai</th><th>Laimėta</th><th>Vid. ėjimų</th><th>Laikas</th></tr>${rows.map((s) =>
          `<tr><td>${s.lvl + 1}</td><td>${s.tries}</td><td>${s.wins}</td><td>${s.wins ? (s.used / s.wins).toFixed(1) : '–'}</td><td>${Math.round((s.sec / s.tries / 60) * 10) / 10} min</td></tr>`).join('')}</table>
          <p class="muted small">Žaidžiant per namų Wi-Fi statistika automatiškai keliauja į kompiuterį lygių balansui.</p>`;
      };
      card.querySelector('#set-tut').onclick = () => {
        d.tutorialDone = false;
        d.seenTalk = {};
        d.seenWelcome = false;
        Store.save();
        extra.innerHTML = '<p class="gain">Mokymas ir pokalbiai bus rodomi iš naujo.</p>';
      };
      card.querySelector('#set-export').onclick = async () => {
        let code = '';
        try { code = BACKUP_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(d)))); } catch (e) { /* */ }
        extra.innerHTML = `<textarea class="code-box" readonly>${code}</textarea><p class="muted small">Nusikopijuok šį kodą ir išsisaugok (pvz., žinutėje sau).</p>`;
        const ta = extra.querySelector('textarea');
        ta.focus();
        ta.select();
        try { await navigator.clipboard.writeText(code); extra.querySelector('p').textContent = 'Kodas nukopijuotas! Išsisaugok jį saugioje vietoje.'; } catch (e) { /* liko pažymėtas */ }
      };
      card.querySelector('#set-import').onclick = () => {
        extra.innerHTML = `<textarea class="code-box" placeholder="Įklijuok pažangos kodą"></textarea><button class="btn primary" id="do-import">Atkurti</button><p class="muted small" id="imp-msg"></p>`;
        extra.querySelector('#do-import').onclick = () => {
          const raw = extra.querySelector('textarea').value.trim();
          try {
            if (!raw.startsWith(BACKUP_PREFIX)) throw new Error();
            const obj = JSON.parse(decodeURIComponent(escape(atob(raw.slice(BACKUP_PREFIX.length)))));
            if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Number.isInteger(obj.unlocked)) throw new Error();
            // Dienos užduotys ir statistika susikurs iš naujo – iš kodo jų neimam
            delete obj.daily; delete obj.telemetry;
            localStorage.setItem('sodo-atgaiva-v1', JSON.stringify(obj));
            location.reload();
          } catch (e) {
            extra.querySelector('#imp-msg').textContent = 'Kodas netinka. Patikrink, ar nukopijavai visą.';
          }
        };
      };
      card.querySelector('#set-reset').onclick = () => {
        extra.innerHTML = `<p><b>Tikrai ištrinti viską?</b> Lygiai, žvaigždutės, sodas ir Pūkio drabužiai dings negrįžtamai.</p><button class="btn danger-solid" id="do-reset">Taip, ištrinti</button>`;
        extra.querySelector('#do-reset').onclick = () => {
          try { localStorage.removeItem('sodo-atgaiva-v1'); } catch (e) { /* */ }
          location.reload();
        };
      };
    });
    await p;
    $('#modal-card').classList.remove('wide');
    renderHome();
  }

  // ---------- Pūkio spinta ----------
  function renderWardrobe() {
    const d = Store.data;
    const box = $('#ward-box');
    const item = (slot, o) => {
      const owned = d.owned[slot].includes(o.id);
      const on = d.outfit[slot] === o.id;
      const look = { ...d.outfit, [slot]: o.id };
      return `<button class="ward-item ${on ? 'on' : ''} ${owned ? '' : 'locked'}" data-slot="${slot}" data-id="${o.id}" ${owned ? '' : 'disabled'}>
        ${ART.pukis('normal', true, look)}${owned ? o.name : '🔒 ' + o.name + (o.event ? '<br><small>šventės prizas</small>' : '')}</button>`;
    };
    box.innerHTML = `<h2>Pūkio spinta</h2><div class="ward-preview">${ART.pukis('happy', false, d.outfit)}</div>
      <div class="ward-title">Kepurės</div><div class="ward-grid">${Progress.OUTFITS.hat.map((o) => item('hat', o)).join('')}</div>
      <div class="ward-title">Skarelės</div><div class="ward-grid">${Progress.OUTFITS.scarf.map((o) => item('scarf', o)).join('')}</div>
      <p class="muted">Naujų drabužių gausi už pasiekimus.</p>`;
    box.querySelectorAll('.ward-item:not(.locked)').forEach((b) => (b.onclick = () => {
      d.outfit[b.dataset.slot] = b.dataset.id;
      ART.setOutfit(d.outfit);
      Store.save();
      Sfx.click();
      renderHome();
    }));
  }

  // ---------- Gyvas sodas: paspaustas daiktas sureaguoja ----------
  const POKE = {
    sway: ['it_tree', 'it_monstera', 'it_hanging', 'it_sunflowers', 'it_lavender', 'it_linden', 'it_trees', 'it_palm', 'it_orchids', 'it_citrus', 'it_poppies', 'it_clover', 'it_beds', 'it_rows', 'it_sheaves', 'it_haystacks', 'it_scarecrow'],
    bees: ['it_beehive', 'it_hives', 'it_honeyhouse'],
    water: ['it_well', 'it_fountain', 'it_pond', 'it_water'],
    smoke: ['it_oven', 'it_compost'],
    spin: ['it_vane', 'it_sundial'],
    flour: ['it_mill'],
    swing: ['it_swing', 'it_lights', 'it_chandelier'],
    flutter: ['it_butterflies'],
  };
  const pokeKind = (key) => Object.keys(POKE).find((k) => POKE[k].includes(key)) || 'hop';
  // Dalelės sodo paveiksle (paprasti DOM elementai su CSS animacija)
  function gfx(scene, x, y, cls, n, html = '') {
    if (document.documentElement.classList.contains('lite')) n = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'gfx ' + cls;
      p.innerHTML = html;
      p.style.left = x + '%';
      p.style.top = y + '%';
      p.style.setProperty('--dx', (Math.random() - 0.5) * 2 + '');
      p.style.setProperty('--dy', Math.random() + '');
      p.style.animationDelay = Math.random() * 0.25 + 's';
      scene.appendChild(p);
      setTimeout(() => p.remove(), 2600);
    }
  }
  function pokeItem(el, e) {
    const scene = el.closest('.gscene');
    const kind = pokeKind(el.dataset.it);
    const sr = scene.getBoundingClientRect(), r = el.getBoundingClientRect();
    // Taškas: paspaudimo vieta (procentais) ir daikto viršus
    const px = ((e.clientX - sr.left) / sr.width) * 100, py = ((e.clientY - sr.top) / sr.height) * 100;
    const cx = ((r.left + r.width / 2 - sr.left) / sr.width) * 100, top = ((r.top - sr.top) / sr.height) * 100 + 8;
    el.classList.remove('poke', 'p-' + kind);
    void el.offsetWidth;
    el.classList.add('poke', 'p-' + kind);
    setTimeout(() => el.classList.remove('poke', 'p-' + kind), 1300);
    if (kind === 'sway') { Sfx.rustle(); gfx(scene, px, py, 'leaf', 6); if (el.dataset.it === 'it_tree' || el.dataset.it === 'it_citrus') gfx(scene, cx, top + 10, 'fruit' + (el.dataset.it === 'it_citrus' ? ' lemon' : ''), 2); }
    else if (kind === 'bees') { Sfx.buzz(); gfx(scene, cx, top + 5, 'bee', 4, '🐝'); }
    else if (kind === 'water') { Sfx.splash(); gfx(scene, cx, top + 6, 'drop', 9); }
    else if (kind === 'smoke') { Sfx.puffs(); gfx(scene, cx, top, 'smoke', 5); }
    else if (kind === 'spin') { Sfx.whoosh(); gfx(scene, cx, top, 'spark', 4, '✦'); }
    else if (kind === 'flour') {
      const sails = scene.querySelector('.mill-sails img');
      if (sails) { sails.classList.remove('whirl'); void sails.offsetWidth; sails.classList.add('whirl'); setTimeout(() => sails.classList.remove('whirl'), 1700); Sfx.whoosh(); }
      Sfx.sack(); gfx(scene, cx, top + 30, 'smoke flour', 6); gfx(scene, cx, top + 35, 'grain', 6); }
    else if (kind === 'swing') { Sfx.click(); gfx(scene, px, py, 'spark', 5, '✦'); }
    else if (kind === 'flutter') { Sfx.sparkle(); gfx(scene, cx, top + 10, 'bee bfly', 3, '🦋'); }
    else { Sfx.boing(); gfx(scene, px, py, 'spark', 4, '✦'); }
    Sfx.vibe(12);
  }

  // ---------- Sodo albumas: draugai, sodo kampeliai, šventės ----------
  const FRIENDS = [
    { who: '', name: 'Pūkis', met: () => true, at: 1, bio: 'Pūkuotas sodo sargas. Ilgus metus laukė, kol kas nors padės atgaivinti sodą.', likes: 'šiaudinę skrybėlę, bijūnus ir pasikasymą už ausies' },
    { who: 'Karolis', name: 'Karolis', met: (d) => d.metKarolis, at: 11, bio: 'Smalsus varnas iš sodo kiemo. Sako, kad nieko neima – tik „randa“.', likes: 'sagutes, blizgučius ir saulės atšvaitus' },
    { who: 'Dygliukas', name: 'Dygliukas', met: (d) => d.metDyg, at: 41, bio: 'Senas ežys sodininkas su akiniais. Daržą pažįsta geriau už savo spyglius.', likes: 'gerą žemę, ramybę ir šiltą arbatą' },
    { who: 'Zuzė', name: 'Zuzė', fem: true, met: (d) => d.metZuze, at: 61, bio: 'Darbšti bitutė iš bityno. Per dieną aplanko šimtą žiedų.', likes: 'medų, levandas ir šokius ore' },
    { who: 'Kvaksė', name: 'Kvaksė', fem: true, met: (d) => d.metKvakse, at: 81, bio: 'Oranžerijos primadona. Dainuoja arijas, net kai niekas neprašo.', likes: 'orchidėjas, šiltą drėgmę ir plojimus' },
    { who: 'Agota', name: 'Agota', fem: true, met: (d) => d.metAgota, at: 101, bio: 'Išmintinga pelėda iš senojo malūno. Dieną tik apsimeta, kad miega.', likes: 'miltų kvapą, pasakas ir pasnūdimą' },
  ];
  const ALL_EVENTS = () => Events.EVENTS.concat(Events.SEASONS || []);
  const evGot = (ev) => {
    const o = Store.data.owned;
    return o[ev.reward.slot].includes(ev.reward.id) || (ev.reward2 && o[ev.reward2.slot].includes(ev.reward2.id));
  };
  function zoneDone(zi) {
    const start = Garden.ZONES.slice(0, zi).reduce((a, z) => a + z.items.length, 0);
    return Math.max(0, Math.min(Garden.ZONES[zi].items.length, Store.data.garden - start));
  }
  function albumList() {
    const d = Store.data;
    return [
      ...FRIENDS.map((f) => ({ id: 'f_' + f.name, on: !!f.met(d) })),
      ...Garden.ZONES.map((z, i) => ({ id: 'z_' + z.id, on: (d.unlocked || 1) > MAP_ZONES[i].at })),
      ...ALL_EVENTS().map((ev) => ({ id: 'e_' + ev.id, on: evGot(ev) })),
    ];
  }
  const albumNew = () => { const seen = Store.data.albumSeen || []; return albumList().filter((x) => x.on && !seen.includes(x.id)); };
  function renderAlbum() {
    const d = Store.data;
    const box = $('#album-box');
    const list = albumList();
    const seen = d.albumSeen || [];
    const got = list.filter((x) => x.on).length;
    const cls = (id) => { const x = list.find((y) => y.id === id); return (x.on ? '' : ' locked') + (x.on && !seen.includes(id) ? ' new' : ''); };
    const friends = FRIENDS.map((f) => `<button class="alb-st friend${cls('f_' + f.name)}" data-alb="f_${f.name}"><div class="alb-pic">${ART.portrait(f.who || undefined, 'happy')}</div><b>${f.met(d) ? f.name : '?'}</b></button>`).join('');
    const zones = Garden.ZONES.map((z, i) => {
      const bg = Img.has('bg_' + z.id) ? `background-image:url(${Img.url('bg_' + z.id)})` : '';
      const n = zoneDone(i), all = z.items.length;
      return `<button class="alb-st zone${cls('z_' + z.id)}${n >= all ? ' full' : ''}" data-alb="z_${z.id}"><div class="alb-pic" style="${bg}"></div><b>${z.name}</b><small>${n}/${all}</small></button>`;
    }).join('');
    const evs = ALL_EVENTS().map((ev) => `<button class="alb-st ev${cls('e_' + ev.id)}" data-alb="e_${ev.id}"><div class="alb-pic">${evIcon(ev)}</div><b>${ev.label || ev.name}</b></button>`).join('');
    box.innerHTML = `<h2>Sodo albumas</h2><div class="alb-count">${T('Surinkta {0} iš {1} lipdukų', [got, list.length])}</div>
      <div class="t-bar alb-bar"><div style="width:${(got / list.length) * 100}%"></div></div>
      <div class="ward-title">Draugai</div><div class="alb-grid">${friends}</div>
      <div class="ward-title">Sodo kampeliai</div><div class="alb-grid">${zones}</div>
      <div class="ward-title">Šventės</div><div class="alb-grid four">${evs}</div>
      <p class="muted">Lipdukai atsiveria sutikus naujų draugų, pasiekus naujus sodo kampelius ir laimėjus šventių prizus.</p>`;
    box.querySelectorAll('.alb-st').forEach((b) => (b.onclick = () => openSticker(b.dataset.alb)));
    // Pažymim kaip matytus (žymė „Nauja!“ dar matosi šį kartą)
    d.albumSeen = list.filter((x) => x.on).map((x) => x.id);
    Store.save();
    renderBadges();
  }
  function openSticker(id) {
    const d = Store.data;
    Sfx.click();
    const [kind, key] = [id[0], id.slice(2)];
    if (kind === 'f') {
      const f = FRIENDS.find((x) => x.name === key);
      if (!f.met(d)) return Dialog.say([{ e: 'thinking', t: T('Šį draugą sutiksi {0} lygyje.', [f.at]) }]);
      const lines = STORY.chat.filter((l) => l.who === (f.who || undefined));
      const say = lines.length ? Dialog.pick(lines) : null;
      return modal(`<div class="alb-big">${ART.portrait(f.who || undefined, 'happy')}</div><h2>${f.name}</h2><p>${f.bio}</p>
        <p class="alb-likes"><b>${T('Mėgsta:')}</b> ${f.likes}</p><p class="muted">${T(f.fem ? 'Sutikta {0} lygyje' : 'Sutiktas {0} lygyje', [f.at])}</p>${say ? `<div class="pk-bubble alb-q">„${say.t}“</div>` : ''}`,
      [{ label: 'Gražu', cls: 'primary' }]);
    }
    if (kind === 'z') {
      const i = Garden.ZONES.findIndex((z) => z.id === key);
      const z = Garden.ZONES[i];
      if ((d.unlocked || 1) <= MAP_ZONES[i].at) return Dialog.say([{ e: 'thinking', t: T('Šis sodo kampelis atsivers {0} lygyje.', [MAP_ZONES[i].at + 1]) }]);
      const bg = Img.has('bg_' + z.id) ? `background-image:url(${Img.url('bg_' + z.id)})` : '';
      const n = zoneDone(i), all = z.items.length;
      const fr = FRIENDS.find((f) => f.who === (MAP_ZONES[i].who || ''));
      return modal(`<div class="alb-zone" style="${bg}"></div><h2>${z.name}</h2><p>${T('Sodo darbai: {0} iš {1}', [n, all])}${n >= all ? ' ✓' : ''}</p>
        <div class="t-bar"><div style="width:${(n / all) * 100}%"></div></div><p class="muted">${T('Čia gyvena: {0}', [fr ? fr.name : 'Pūkis'])} · ${T('lygiai {0}–{1}', [MAP_ZONES[i].at + 1, (MAP_ZONES[i + 1] ? MAP_ZONES[i + 1].at : LEVELS.length)])}</p>`,
      [{ label: 'Gražu', cls: 'primary' }]);
    }
    const ev = ALL_EVENTS().find((x) => x.id === key);
    if (!evGot(ev)) return Dialog.say([{ e: 'thinking', t: T('Laimėk šios šventės prizą, kai ji vyks: {0}.', [outfitName(evPrize(ev))]) }]);
    return modal(`<div class="alb-big ev">${evIcon(ev)}</div><h2>${ev.label || ev.name}</h2><p>${T('Laimėtas prizas: {0}', [outfitName(evPrize(ev))])}</p>
      <div class="ev-prize">${ART.pukis('happy', true, { ...d.outfit, [ev.reward.slot]: ev.reward.id, ...(ev.reward2 ? { [ev.reward2.slot]: ev.reward2.id } : {}) })}</div>`,
    [{ label: 'Gražu', cls: 'primary' }]);
  }
  function setSeg(seg) {
    document.querySelectorAll('#spinta-seg button').forEach((b) => b.classList.toggle('on', b.dataset.seg === seg));
    $('#ward-box').classList.toggle('hidden', seg !== 'ward');
    $('#album-box').classList.toggle('hidden', seg !== 'album');
    if (seg === 'album') renderAlbum();
  }

  // ---------- Skiltys apačioje ----------
  let homeTab = 'sodas';
  function setTab(t, quiet) {
    homeTab = t;
    document.querySelectorAll('.hpanel').forEach((p) => p.classList.toggle('active', p.id === 'hp-' + t));
    document.querySelectorAll('#tabbar .tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    if (!quiet) Sfx.click();
    window.scrollTo(0, 0);
    if (t === 'lygiai') {
      const n = document.querySelector('#level-map .node.next') || [...document.querySelectorAll('#level-map .node:not(.locked)')].pop();
      if (n) setTimeout(() => n.scrollIntoView({ block: 'center' }), 30);
    }
  }
  function renderBadges() {
    const d = Store.data;
    const dl = Progress.ensureDaily();
    const dailyReady = dl.tasks.some((t) => t.progress >= t.target && !t.claimed) || (dl.tasks.every((t) => t.claimed) && !dl.bonusClaimed);
    const evReady = Events.isActive() && (() => { const s = Events.state(); return s.done.every(Boolean) && !s.claimed; })();
    const item = Garden.ITEMS[d.garden];
    const gardenReady = item && Store.available() >= item.cost;
    const dot = (t, on) => document.querySelector(`#tabbar [data-tab="${t}"]`).classList.toggle('alert', !!on);
    dot('sodas', gardenReady || evReady || (DailyLevel.available() && !DailyLevel.state().won));
    dot('lygiai', chestReady());
    dot('uzduotys', dailyReady || Progress.weekReady() || Progress.claimable().length > 0);
    const albNew = albumNew().length > 0;
    dot('spinta', albNew);
    const sb = document.querySelector('#spinta-seg [data-seg="album"]');
    if (sb) sb.classList.toggle('alert', albNew);
  }

  function renderHome(fresh, mood) {
    const d = Store.data;
    $('#home-stars').textContent = '★ ' + Store.available();
    renderLives();
    renderDaily();
    renderEvent();
    renderDailyLevel();
    renderTimed();
    renderAchievements();
    renderWardrobe();
    const cur = Garden.currentZone(d.garden);
    if (viewZone === null || viewZone > cur) viewZone = cur;
    const tabs = $('#zone-tabs');
    tabs.innerHTML = '';
    if (cur > 0) {
      Garden.ZONES.slice(0, cur + 1).forEach((z, zi) => {
        const b = document.createElement('button');
        b.className = 'zone-tab' + (zi === viewZone ? ' on' : '');
        b.textContent = z.name;
        b.onclick = () => { viewZone = zi; Sfx.click(); renderHome(); };
        tabs.appendChild(b);
      });
    }
    const per = Ambient.period();
    const zItems = Garden.ZONES[viewZone].items.length;
    const local = Math.max(0, Math.min(zItems, d.garden - Garden.zoneStart(viewZone)));
    const m = mood || (per === 'night' ? 'sleep' : undefined);
    Music.setTheme(viewZone);
    $('#garden').innerHTML = Garden.svg(viewZone, d.garden, fresh, m) + Ambient.layer({ wild: local === 0, progress: local / zItems, per, snow: !!(Events.season() && Events.season().snow) });
    renderTask();
    renderMap();
    const next = Math.min(d.unlocked, LEVELS.length);
    const allDone = Object.keys(d.stars).length >= LEVELS.length;
    $('#btn-play').textContent = allDone ? 'Žaisti dar kartą' : `Žaisti ${next} lygį`;
    $('#btn-play').onclick = () => openLevel(allDone ? 0 : next - 1);
    renderBadges();
  }

  function renderTask() {
    const d = Store.data;
    const box = $('#task-card');
    const item = Garden.ITEMS[d.garden];
    const prog = `<div class="task-prog"><div style="width:${(d.garden / Garden.ITEMS.length) * 100}%"></div></div>`;
    if (!item) {
      box.innerHTML = `<div class="task-text"><b>Sodas atgaivintas</b><small>Netrukus – nauji lygiai ir nauji sodo kampeliai.</small></div>${prog}`;
      return;
    }
    const can = Store.available() >= item.cost;
    box.innerHTML = `<div class="task-text"><small>Sodo darbas ${d.garden + 1} iš ${Garden.ITEMS.length}</small><b>${item.name}</b></div>
      <button class="btn ${can ? 'primary' : 'locked'}" id="btn-restore">${item.cost} ★</button>${prog}`;
    $('#btn-restore').onclick = async () => {
      if (Store.available() < item.cost) {
        Sfx.bad();
        await Dialog.say(STORY.noStars);
        return;
      }
      d.spent += item.cost;
      d.garden++;
      Store.save();
      Sfx.unlock();
      viewZone = item.zone;
      renderHome(item.id, 'excited');
      $('#garden').scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(async () => {
        await Dialog.say(item.after);
        const next = Garden.ITEMS[d.garden];
        if (!next) await Dialog.say(STORY.allDone);
        else if (next.zone !== item.zone) {
          // Atsivėrė nauja zona
          viewZone = next.zone;
          renderHome(null, 'excited');
          if (next.zone === 1) { await Dialog.say(d.metKarolis ? STORY.yardStart : Garden.ZONES[1].intro); d.metKarolis = true; }
          if (next.zone === 2) { await Dialog.say(d.metDyg ? STORY.darzasStart : Garden.ZONES[2].intro); d.metDyg = true; d.metKarolis = true; }
          if (next.zone === 3) { await Dialog.say(d.metZuze ? STORY.bitynasStart : Garden.ZONES[3].intro); d.metZuze = true; d.metDyg = true; d.metKarolis = true; }
          if (next.zone === 4) { await Dialog.say(d.metKvakse ? STORY.oranzerijaStart : Garden.ZONES[4].intro); d.metKvakse = true; d.metZuze = true; d.metDyg = true; d.metKarolis = true; }
          if (next.zone === 5) { await Dialog.say(d.metAgota ? STORY.malunasStart : Garden.ZONES[5].intro); d.metAgota = true; d.metKvakse = true; d.metZuze = true; d.metDyg = true; d.metKarolis = true; }
          Store.save();
        }
        renderHome();
      }, 900);
    };
  }

  // Lygių žemėlapis: kiekviena zona su savo fonu, vingiuojantis takelis, sodo daiktai pakelėje
  const MAP_ZONES = [
    { at: 0, z: 'terasa', who: null, deco: ['it_monstera', 'it_bench', 'it_shelf', 'it_tree', 'it_greenhouse'] },
    { at: 10, z: 'kiemas', who: 'Karolis', deco: ['it_well', 'it_beehive', 'it_bridge', 'it_beds', 'it_gazebo', 'it_path'] },
    { at: 40, z: 'darzas', who: 'Dygliukas', deco: ['it_pumpkins', 'it_scarecrow', 'it_cart', 'it_compost', 'it_shed', 'it_sunflowers'] },
    { at: 60, z: 'bitynas', who: 'Zuzė', deco: ['it_hives', 'it_lavender', 'it_honeyhouse', 'it_sundial', 'it_table', 'it_linden'] },
    { at: 80, z: 'oranzerija', who: 'Kvaksė', deco: ['it_palm', 'it_fountain', 'it_orchids', 'it_citrus', 'it_teatable', 'it_shelves'] },
    { at: 100, z: 'malunas', who: 'Agota', deco: ['it_haystacks', 'it_sheaves', 'it_vane', 'it_oven', 'it_gate', 'it_picnic'] },
  ];
  // ---------- Žvaigždžių skrynios žemėlapyje (po kiekvieno 10-o lygio) ----------
  const CHEST_NEED = 24; // iš 30 galimų žvaigždučių tame ruože
  const BOOST_ROT = ['shovel', 'can', 'rake', 'bomb', 'moves'];
  const chestCount = () => Math.floor(LEVELS.length / 10);
  function chestInfo(k) {
    const d = Store.data;
    let have = 0;
    for (let i = k * 10; i < k * 10 + 10; i++) have += d.stars[i] || 0;
    const gold = k % 3 === 2;
    const rewards = gold
      ? [{ type: 'stars', n: 4 }, { type: 'bomb', n: 1 }, { type: 'moves', n: 1 }, { type: 'life', n: 3 }]
      : [{ type: 'stars', n: 2 }, { type: BOOST_ROT[k % BOOST_ROT.length], n: 1 }];
    const got = (d.mapChests || []).includes(k);
    return { k, have, need: CHEST_NEED, gold, rewards, got, ready: !got && have >= CHEST_NEED };
  }
  const chestReady = () => Array.from({ length: chestCount() }, (_, k) => chestInfo(k)).some((c) => c.ready);
  async function openChest(k) {
    const c = chestInfo(k);
    if (c.got) return;
    if (!c.ready) {
      Sfx.click();
      return Dialog.say([{ e: 'thinking', t: T('Surink {0} ★ lygiuose {1}–{2}, ir skrynia atsivers! Dabar turi {3} ★.', [c.need, k * 10 + 1, k * 10 + 10, c.have]) }]);
    }
    const d = Store.data;
    d.mapChests = (d.mapChests || []).concat(k);
    c.rewards.forEach((r) => Progress.give(r));
    Store.save();
    renderHome();
    await giftModal({ title: c.gold ? 'Auksinė skrynia!' : 'Žvaigždžių skrynia', rewards: c.rewards, gold: c.gold,
      say: { e: 'excited', t: c.gold ? 'Auksinė skrynia! Štai kas būna, kai stengiesi.' : 'Visos tos žvaigždutės atsipirko!' } });
    renderHome();
  }

  function renderMap() {
    const d = Store.data;
    const map = $('#level-map');
    const step = 86, GAP = 96;
    const n = LEVELS.length;
    const zoneOf = (i) => MAP_ZONES.filter((c) => c.at <= i).length - 1;
    const ys = LEVELS.map((_, i) => i * step + step / 2 + GAP * (zoneOf(i) + 1));
    const xs = LEVELS.map((_, i) => 50 + 28 * Math.sin(i * 0.9));
    const H = ys[n - 1] + step;
    map.style.height = H + 'px';
    // Sklandus takelis (Catmull-Rom → Bezier)
    let path = `M${xs[0]} ${ys[0]}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = i > 0 ? i - 1 : i, p3 = i + 2 < n ? i + 2 : i + 1;
      const c1x = xs[i] + (xs[i + 1] - xs[p0]) / 6, c1y = ys[i] + (ys[i + 1] - ys[p0]) / 6;
      const c2x = xs[i + 1] - (xs[p3] - xs[i]) / 6, c2y = ys[i + 1] - (ys[p3] - ys[i]) / 6;
      path += ` C${c1x.toFixed(2)} ${c1y.toFixed(1)} ${c2x.toFixed(2)} ${c2y.toFixed(1)} ${xs[i + 1].toFixed(2)} ${ys[i + 1].toFixed(1)}`;
    }
    let h = '';
    // Zonų fonai ir užrašai
    MAP_ZONES.forEach((c, ci) => {
      const top = (ci === 0 ? 0 : ys[c.at] - step / 2 - GAP) ;
      const end = ci < MAP_ZONES.length - 1 ? ys[MAP_ZONES[ci + 1].at] - step / 2 - GAP + 40 : H;
      const bg = 'bg_' + c.z;
      // Zonos paveikslas – plati juosta zonos pradžioje, švelniai išnykstanti
      if (Img.has(bg)) h += `<div class="map-zone" style="top:${top}px;height:${Math.min(end - top, 640)}px;background-image:url(${Img.url(bg)})"></div>`;
      const name = Garden.ZONES[ci] ? Garden.ZONES[ci].name : c.z;
      const who = c.who ? `<span class="mc-who">${ART.portrait(c.who, 'happy')}</span>` : `<span class="mc-who">${ART.pukis('happy', true)}</span>`;
      h += `<div class="map-chapter" style="top:${ys[c.at] - step / 2 - GAP / 2}px">${who}<span class="mc-name">${name}</span></div>`;
    });
    h += `<svg class="map-path" viewBox="0 0 100 ${H}" preserveAspectRatio="none"><path class="mp-edge" d="${path}"/><path class="mp-dirt" d="${path}"/><path class="mp-stones" d="${path}"/></svg>`;
    // Sodo daiktai pakelėje – kas 4 lygius, priešingoje takelio pusėje
    LEVELS.forEach((_, i) => {
      if (i % 4 !== 2 || i % 10 === 9) return;
      const zc = MAP_ZONES[zoneOf(i)];
      const key = zc.deco[Math.floor(i / 4) % zc.deco.length];
      if (!Img.has(key)) return;
      const left = xs[i] < 50 ? 80 : 20;
      h += `<img class="map-deco" src="${Img.url(key)}" style="left:${left}%;top:${ys[i]}px" alt="">`;
    });
    // Skrynios – priešingoje pusėje nei Pūkis
    for (let k = 0; k < chestCount(); k++) {
      const i = k * 10 + 9;
      const c = chestInfo(k);
      const left = xs[i] < 50 ? 84 : 16;
      const reach = i < d.unlocked + 9; // ruožas jau pasiektas
      h += `<button class="map-chest${c.gold ? ' gold' : ''}${c.ready ? ' ready' : ''}${c.got ? ' got' : ''}${reach ? '' : ' far'}" data-chest="${k}" style="left:${left}%;top:${ys[i]}px">
        ${giftSvg(c.gold)}<small>${c.got ? '✓' : `${Math.min(c.have, c.need)}/${c.need}★`}</small></button>`;
    }
    map.innerHTML = h;
    map.querySelectorAll('.map-chest').forEach((b) => (b.onclick = () => openChest(+b.dataset.chest)));
    LEVELS.forEach((_, i) => {
      const unlocked = i < d.unlocked;
      const stars = d.stars[i] || 0;
      const isNext = i === d.unlocked - 1 && !d.stars[i];
      const b = document.createElement('button');
      b.className = 'node' + (unlocked ? '' : ' locked') + (isNext ? ' next' : '') + (stars ? ' cleared' : '') + (stars === 3 ? ' gold' : '');
      b.style.left = xs[i] + '%';
      b.style.top = ys[i] + 'px';
      b.innerHTML = `<span class="num">${unlocked ? i + 1 : '🔒'}</span><span class="node-stars">${unlocked ? starRow(stars) : ''}</span>`;
      if (unlocked) b.onclick = () => openLevel(i);
      map.appendChild(b);
      if (isNext || (i === d.unlocked - 1)) {
        const pk = document.createElement('div');
        pk.className = 'map-pukis';
        pk.style.left = (xs[i] < 50 ? xs[i] + 15 : xs[i] - 15) + '%';
        pk.style.top = ys[i] + 'px';
        pk.innerHTML = ART.pukis('happy');
        map.appendChild(pk);
      }
    });
  }

  // ---------- Lygis ----------
  async function openLevel(i) {
    Sfx.click();
    const d = Store.data;
    if (Progress.lives() <= 0) {
      if ($('#screen-game').classList.contains('active')) goHome();
      return noLives();
    }
    const lvl = LEVELS[i];
    show('screen-game');
    Music.setTheme(MAP_ZONES.filter((c) => c.at <= i).length - 1);
    Game.start(i, onLevelEnd);
    const firstTime = !d.seenTalk[i] && STORY.levels[i];
    if (firstTime) {
      // Pirmą kartą Karolis pasirodo – supažindinam
      if (!d.metKarolis && (i >= 10 || STORY.levels[i].some((l) => l.who === 'Karolis'))) {
        await Dialog.say(Garden.ZONES[1].intro);
        d.metKarolis = true;
      }
      if (!d.metDyg && (i >= 40 || STORY.levels[i].some((l) => l.who === 'Dygliukas'))) {
        await Dialog.say(Garden.ZONES[2].intro);
        d.metDyg = true;
      }
      if (!d.metZuze && (i >= 60 || STORY.levels[i].some((l) => l.who === 'Zuzė'))) {
        await Dialog.say(Garden.ZONES[3].intro);
        d.metZuze = true;
      }
      if (!d.metKvakse && (i >= 80 || STORY.levels[i].some((l) => l.who === 'Kvaksė'))) {
        await Dialog.say(Garden.ZONES[4].intro);
        d.metKvakse = true;
      }
      if (!d.metAgota && (i >= 100 || STORY.levels[i].some((l) => l.who === 'Agota'))) {
        await Dialog.say(Garden.ZONES[5].intro);
        d.metAgota = true;
      }
      await Dialog.say(STORY.levels[i]);
      d.seenTalk[i] = true;
      Store.save();
    }
    const goalsHtml = lvl.goals
      .map((g) => `<li><span class="li-ico">${Game.goalIcon(g)}</span>${goalText(g)}</li>`)
      .join('');
    const best = d.stars[i] ? `<div class="stars-big small">${starRow(d.stars[i])}</div>` : '';
    // Pagalbos prieš lygį (jei turi)
    const pre = ['bomb', 'moves'].filter((k) => (d.boosters[k] || 0) > 0 && !(i === 0 && !d.tutorialDone));
    const preHtml = pre.length
      ? `<div class="pre-title">Pagalbos prieš lygį</div><div class="pre-row">${pre.map((k) =>
        `<button class="pre-chip" data-pre="${k}">${(ART.boosterIcon && ART.boosterIcon(k)) || (k === 'bomb' ? '💥' : '➕')} ${k === 'moves' ? '+3 ėjimai' : Progress.BOOSTERS[k].name}<span>×${d.boosters[k]}</span></button>`).join('')}</div>`
      : '';
    const news = newsCard(i);
    const go = await modal(
      `<h2>${i + 1} lygis</h2>${best}${news}<ul class="goal-list">${goalsHtml}</ul>
       <p class="muted">Ėjimų: <b>${lvl.moves}</b></p>${!news && !firstTime && lvl.intro ? `<p class="intro">${lvl.intro}</p>` : ''}${preHtml}`,
      [{ label: 'Atgal', value: false }, { label: 'Pradėti', value: true, cls: 'primary' }],
      (card) => card.querySelectorAll('.pre-chip').forEach((b) => (b.onclick = () => { b.classList.toggle('on'); Sfx.click(); }))
    );
    if (!go) return goHome();
    const chosen = [...$('#modal-card').querySelectorAll('.pre-chip.on')].map((b) => b.dataset.pre);
    chosen.forEach((k) => { d.boosters[k]--; });
    Store.save();
    Game.applyStart({ bomb: chosen.includes('bomb'), extra: chosen.includes('moves') ? 3 : 0 });
    Telemetry.begin(i, chosen);
    adContinueUsed = false;
    if (i === 0 && !d.tutorialDone) Game.showTutorial();
    else if (news) setTimeout(() => Game.spotlight(newKinds(i)[0].kind), 350);
    else if (!chosen.length) Game.greet();
  }

  // ---------- Naujienos: pirmas lygis su nauja kliūtimi ----------
  const NEW_NAMES = {
    weeds: 'Piktžolės', stones: 'Akmenys', ice: 'Šalna', seeds: 'Sėklų maišeliai', moss: 'Samanos', stumps: 'Kelmai',
    moles: 'Kurmiai', honey: 'Medus', combs: 'Koriai', pots: 'Vazonai', sacks: 'Miltų maišai', grain: 'Grūdai',
  };
  let firstOf = null;
  function newKinds(i) {
    if (!firstOf) {
      firstOf = {};
      LEVELS.forEach((l, k) => (l.goals || []).forEach((g) => { if (NEW_NAMES[g.kind] && firstOf[g.kind] == null) firstOf[g.kind] = k; }));
    }
    return (LEVELS[i].goals || []).filter((g) => firstOf[g.kind] === i);
  }
  function newsCard(i) {
    const n = newKinds(i);
    if (!n.length) return '';
    const g = n[0];
    return `<div class="news"><span class="news-tag">${T('Naujiena!')}</span><div class="news-ico">${Game.goalIcon(g)}</div>
      <div class="news-txt"><b>${NEW_NAMES[g.kind]}</b><p>${(LEVELS[i].intro || '').replace(/^Naujiena – [^!]+! /, '')}</p></div></div>`;
  }

  function goHome() {
    Game.stop();
    show('screen-home');
    renderHome();
    window.scrollTo(0, 0);
  }

  // ---------- Savaitgalio šventė ----------
  function outfitName(rw) {
    const n = Progress.OUTFITS[rw.slot].find((o) => o.id === rw.id).name;
    if (!rw.second) return n;
    const n2 = outfitName(rw.second);
    return T('{0} ir {1}', [T(n), T(n2.startsWith('Velykų') ? n2 : n2[0].toLowerCase() + n2.slice(1))]);
  }
  const evIcon = (ev) => (ev.badge && Img.has(ev.badge) ? Img.tag(ev.badge, 'ev-badge') : ev.icon);
  const evPrize = (ev) => (ev.reward2 ? { ...ev.reward, second: ev.reward2 } : ev.reward);
  function renderEvent() {
    const box = $('#event-card');
    const ev = Events.current();
    const d = Store.data;
    const look = { ...d.outfit, [ev.reward.slot]: ev.reward.id, ...(ev.reward2 ? { [ev.reward2.slot]: ev.reward2.id } : {}) };
    const preview = `<div class="ev-prize">${ART.pukis('happy', true, look)}<span>🎁 ${outfitName(evPrize(ev))}</span></div>`;
    if (!Events.isActive()) {
      box.innerHTML = `<div class="ev-head"><span class="ev-ico">${evIcon(ev)}</span><div><small>Kita savaitgalio šventė</small><b>${ev.name}</b>
        <small>prasidės penktadienį · po ${Events.fmtLeft(Events.msLeft())}</small></div></div>${preview}`;
      box.classList.add('soon');
      return;
    }
    box.classList.remove('soon');
    box.classList.toggle('season', !!ev.seasonal);
    const s = Events.state();
    const next = s.done.findIndex((x) => !x);
    const nodes = ev.levels.map((_, k) => {
      const cls = s.done[k] ? 'done' : k === next ? 'next' : 'locked';
      return `<button class="ev-node ${cls}" ${k === next ? `data-ev="${k}"` : 'disabled'}>${s.done[k] ? '✓' : k + 1}</button>`;
    }).join('<i class="ev-line"></i>');
    const prize = s.claimed
      ? '<p class="ev-claimed">Prizas atsiimtas ✓</p>'
      : s.done.every(Boolean) ? '<button class="btn primary" id="ev-claim">Atsiimti prizą</button>' : preview;
    box.innerHTML = `<div class="ev-head"><span class="ev-ico">${evIcon(ev)}</span><div><small>${ev.seasonal ? ev.label : 'Savaitgalio šventė'} · baigsis po ${Events.fmtLeft(Events.msLeft())}</small><b>${ev.name}</b></div></div>
      <div class="ev-row">${nodes}</div>${prize}`;
    box.querySelectorAll('[data-ev]').forEach((b) => (b.onclick = () => openEventLevel(+b.dataset.ev)));
    const cb = box.querySelector('#ev-claim');
    if (cb) cb.onclick = async () => {
      const rw = Events.claim();
      if (!rw) return;
      Sfx.win();
      renderHome();
      const isOutfit = rw.type === 'outfit';
      await modal(`<h2>Šventės prizas!</h2><div class="reward-pop">${isOutfit ? outfitName(rw) : Progress.rewardText(rw)}</div>
        ${isOutfit ? `<div class="ward-preview">${ART.pukis('excited', false, Store.data.outfit)}</div>` : ''}
        ${pukisSays({ e: 'excited', t: isOutfit ? 'Žiūrėk, kaip man tinka! Ačiū!' : 'Šį drabužį jau turim – tad gavom papildomų ėjimų!' })}`, [{ label: 'Puiku', cls: 'primary' }]);
      renderHome();
    };
  }

  // ---------- Greitasis režimas (60 sekundžių) ----------
  const TIMED_SEC = 60;
  const TIMED_LEVEL = { moves: 999, colors: [0, 1, 2, 3, 4], goals: [], layout: Array(8).fill('........'), stars: [12000, 22000, 32000] };
  function renderTimed() {
    const box = $('#tm-card');
    if (!DailyLevel.available()) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    const d = Store.data;
    box.innerHTML = `<div class="tm-clock">⏱️</div><div class="dlv-main"><small>${T('{0} sekundžių lenktynės', [TIMED_SEC])}</small><b>${T('Greitasis režimas')}</b>
      <div class="tm-rec">${d.timedBest ? T('Rekordas: {0}', [d.timedBest.toLocaleString('lt-LT')]) : T('Surink kuo daugiau taškų!')}</div></div>
      <button class="btn primary" id="tm-play">${T('Žaisti')}</button>`;
    box.querySelector('#tm-play').onclick = () => openTimed();
  }
  async function openTimed() {
    Sfx.click();
    const d = Store.data;
    // Kasdien kitos spalvos – kad nenusibostų
    const r = DailyLevel.make(DailyLevel.dayKey(), 1);
    const lvl = { ...TIMED_LEVEL, colors: r.colors.length >= 5 ? r.colors.slice(0, 5) : TIMED_LEVEL.colors };
    Music.setTheme(Math.floor(Math.random() * MAP_ZONES.length));
    show('screen-game');
    Game.start(-1, onTimedEnd, { level: lvl, title: 'Greitasis režimas', timed: TIMED_SEC, best: d.timedBest || 0 });
    const go = await modal(`<h2>⏱️ ${T('Greitasis režimas')}</h2><p>${T('Turi {0} sekundžių – surink kuo daugiau taškų!', [TIMED_SEC])}</p>
      <ul class="goal-list"><li>⚡ ${T('Didelė grandinė (4+): +2 s')}</li><li>✨ ${T('Du ypatingi kartu: +3 s')}</li></ul>
      <p class="muted">${T('Gyvybės neprarandamos. Už naują rekordą – dovana!')}</p>`,
    [{ label: 'Atgal', value: false }, { label: 'Pradėti', value: true, cls: 'primary' }]);
    if (!go) { Game.stop(); return goHome(); }
    Telemetry.begin('timed');
    Game.startTimer();
    Game.greet();
  }
  async function onTimedEnd(r) {
    const d = Store.data;
    Telemetry.end('timed', { ...r.snap, stars: r.stars });
    Progress.record({ ...r, win: false });
    d.timedPlays = (d.timedPlays || 0) + 1;
    const prev = d.timedBest || 0;
    const rec = r.score > prev;
    if (rec) d.timedBest = r.score;
    // Dovana už rekordą: žvaigždutė sodui ir viena pagalba
    const gift = [{ type: 'stars', n: 1 }, { type: Dialog.pick(['shovel', 'can', 'rake']), n: 1 }];
    if (rec) gift.forEach((x) => Progress.give(x));
    Store.save();
    const fmt = (n) => n.toLocaleString('lt-LT');
    const html = `<div class="win-head"><div class="ribbon"><span>${T(rec ? 'Naujas rekordas!' : 'Laikas baigėsi!')}</span></div></div>
      <div class="stars-big win-stars">${starRow(r.stars)}</div>
      <p class="score-line">Taškai: <b class="count">0</b></p>
      <p class="muted">${rec && prev ? T('Ankstesnis rekordas: {0}', [fmt(prev)]) : !rec ? T('Rekordas: {0}', [fmt(prev)]) : ''}</p>
      ${rec ? rewardChips(gift) : ''}
      ${pukisSays(rec ? { e: 'excited', t: 'Kokie greiti pirštai! Naujas rekordas!' } : { e: 'happy', t: 'Smagu buvo! Pabandom dar kartą?' })}`;
    const choice = await modal(html, [{ label: 'Į sodą', value: 'home' }, { label: 'Dar kartą', value: 'again', cls: 'primary' }], (card) => {
      card.querySelectorAll('.win-stars span').forEach((s, k) => setTimeout(() => { s.classList.add('lit'); if (k < r.stars) Sfx.star(k); }, 250 + k * 330));
      const cnt = card.querySelector('.count');
      const t0 = performance.now();
      const step = (t) => { const p = Math.min(1, (t - t0) / 1100); cnt.textContent = fmt(Math.round(r.score * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
      if (rec) setTimeout(() => confetti(60), 600);
    });
    if (choice === 'again') openTimed();
    else goHome();
  }

  // ---------- Dienos lygis ----------
  function renderDailyLevel() {
    const box = $('#dlv-card');
    if (!DailyLevel.available()) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    const s = DailyLevel.state();
    const lvl = DailyLevel.today();
    const icons = lvl.goals.map((g) => `<span class="dlv-goal">${Game.goalIcon(g)}</span>`).join('');
    const prize = DailyLevel.prize().map((r) => `<span class="dlv-pz">${rewardIcon(r)}<b>+${r.n}</b></span>`).join('');
    const streak = Store.data.dailyLevelStreak && Store.data.dailyLevelLast ? Store.data.dailyLevelStreak : 0;
    box.classList.toggle('done', s.won);
    box.innerHTML = `<div class="dlv-sun">☀️</div><div class="dlv-main"><small>${T('Kasdien – vis kitas lygis')}</small><b>${T('Dienos lygis')}</b>
      <div class="dlv-row">${s.won ? `<span class="dlv-ok">${T('✓ Įveikta! Naujas po {0}', [Events.fmtLeft(DailyLevel.msToMidnight())])}</span>` : `${icons}<span class="dlv-sep">·</span>${prize}`}</div>
      ${streak > 1 ? `<div class="dlv-streak">🔥 ${T('{0} d. iš eilės', [streak])}</div>` : ''}</div>
      ${s.won ? '' : `<button class="btn primary" id="dlv-play">${T('Žaisti')}</button>`}`;
    const b = box.querySelector('#dlv-play');
    if (b) b.onclick = () => openDailyLevel();
  }
  async function openDailyLevel() {
    Sfx.click();
    if (Progress.lives() <= 0) {
      if ($('#screen-game').classList.contains('active')) goHome();
      return noLives();
    }
    const lvl = DailyLevel.today();
    const s = DailyLevel.state();
    s.tries++;
    Store.save();
    Music.setTheme(MAP_ZONES.filter((c) => c.at <= lvl.baseIndex).length - 1);
    show('screen-game');
    Game.start(-1, onDailyEnd, { level: lvl, title: 'Dienos lygis' });
    const goalsHtml = lvl.goals.map((g) => `<li><span class="li-ico">${Game.goalIcon(g)}</span>${goalText(g)}</li>`).join('');
    const go = await modal(
      `<h2>☀️ ${T('Dienos lygis')}</h2><ul class="goal-list">${goalsHtml}</ul><p class="muted">Ėjimų: <b>${lvl.moves}</b></p>
       <p class="intro">${T('Kasdien – naujas lygis ir dovana už pergalę:')}</p>${rewardChips(DailyLevel.prize())}`,
      [{ label: 'Atgal', value: false }, { label: 'Pradėti', value: true, cls: 'primary' }]
    );
    if (!go) return goHome();
    Telemetry.begin('daily:' + lvl.daily);
    adContinueUsed = false;
    Game.greet();
  }
  async function onDailyEnd(r) {
    if (await offerContinue(r)) return;
    Telemetry.end(r.win ? 'win' : 'lose', { ...r.snap, stars: r.stars });
    if (!r.win) Progress.loseLife();
    Progress.record(r);
    if (r.win) {
      const p = DailyLevel.win();
      const st = Store.data.dailyLevelStreak || 1;
      const say = st >= 3 ? { e: 'excited', t: T('Jau {0} dienos iš eilės! Tu tikras sodininkas.', [st]) } : { e: 'happy', t: 'Šaunu! Rytoj lauks naujas dienos lygis.' };
      if (p) await giftModal({ title: 'Dienos lygis įveiktas!', top: `<div class="stars-big pop-in">${starRow(r.stars)}</div>`, rewards: p, say, gold: st >= 7 });
      goHome();
    } else {
      const lv = Progress.lives();
      const choice = await modal(`<h2>Ėjimai baigėsi</h2><p class="muted">${T('Liko gyvybių: {0}', [lv])}</p>${pukisSays(Dialog.pick(STORY.lose))}`,
        [{ label: 'Į sodą', value: 'home' }, { label: 'Bandyti dar', value: 'retry', cls: 'primary' }]);
      if (choice === 'retry') openDailyLevel();
      else goHome();
    }
  }

  async function openEventLevel(k) {
    Sfx.click();
    if (!Events.isActive()) return;
    if (Progress.lives() <= 0) {
      if ($('#screen-game').classList.contains('active')) goHome();
      return noLives();
    }
    const ev = Events.current();
    const s = Events.state();
    const lvl = ev.levels[k];
    show('screen-game');
    Game.start(-1, (r) => onEventEnd(r, k), { level: lvl, title: `${T(ev.name)} ${k + 1}/${ev.levels.length}` });
    if (!s.introSeen) {
      await Dialog.say(Array.isArray(ev.intro) ? ev.intro : [ev.intro]);
      s.introSeen = true;
      Store.save();
    }
    const goalsHtml = lvl.goals.map((g) => `<li><span class="li-ico">${Game.goalIcon(g)}</span>${goalText(g)}</li>`).join('');
    const go = await modal(
      `<h2>${ev.icon} ${T(ev.name)} · ${k + 1}/${ev.levels.length}</h2><ul class="goal-list">${goalsHtml}</ul><p class="muted">Ėjimų: <b>${lvl.moves}</b></p>
       <p class="intro">${ev.levels.length === 3 ? 'Už kiekvieną šventės lygį – dovana, o už visus tris –' : 'Už kiekvieną šventės lygį – dovana, o už visus –'} <b>${outfitName(evPrize(ev))}</b>!</p>`,
      [{ label: 'Atgal', value: false }, { label: 'Pradėti', value: true, cls: 'primary' }]
    );
    if (!go) return goHome();
    Telemetry.begin(`ev:${ev.id}:${k}`);
    adContinueUsed = false;
    Game.greet();
  }

  async function onEventEnd(r, k) {
    const d = Store.data;
    const ev = Events.current();
    if (await offerContinue(r)) return;
    Telemetry.end(r.win ? 'win' : 'lose', { ...r.snap, stars: r.stars });
    if (!r.win) Progress.loseLife();
    Progress.record(r);
    if (r.win) {
      Events.finishLevel(k);
      const gift = Dialog.pick([{ type: 'shovel', n: 1 }, { type: 'can', n: 1 }, { type: 'rake', n: 1 }, { type: 'bomb', n: 1 }]);
      Progress.give(gift);
      const allDone = Events.state().done.every(Boolean);
      const choice = await modal(
        `<h2>Šventės lygis įveiktas!</h2><div class="reward-pop">${Progress.rewardText(gift)}</div>
         ${pukisSays(allDone ? { e: 'excited', t: ev.levels.length === 3 ? 'Visi trys! Eime atsiimti prizo!' : 'Visi šventės lygiai įveikti! Eime atsiimti prizo!' } : Dialog.pick(STORY.win))}`,
        !allDone && k < ev.levels.length - 1 ? [{ label: 'Į sodą', value: 'home' }, { label: 'Kitas', value: 'next', cls: 'primary' }] : [{ label: 'Į sodą', value: 'home', cls: 'primary' }]
      );
      if (choice === 'next') openEventLevel(k + 1);
      else goHome();
    } else {
      const choice = await modal(
        `<h2>Ėjimai baigėsi</h2><p class="gain" style="color:#b8432b">−1 <span class="heart">♥</span> · liko ${Progress.lives()}</p>${pukisSays(Dialog.pick(STORY.lose))}`,
        [{ label: 'Į sodą', value: 'home' }, { label: 'Bandyti dar', value: 'retry', cls: 'primary' }]
      );
      if (choice === 'retry') openEventLevel(k);
      else goHome();
    }
  }

  // Pralaimėjus galima tęsti su „+3 ėjimai“ – tada gyvybė neprarandama
  // Arba už reklamą (kartą per bandymą)
  let adContinueUsed = false;
  async function offerContinue(r) {
    const d = Store.data;
    if (r.win) return false;
    const hasPack = (d.boosters.moves || 0) > 0;
    const canAd = !adContinueUsed && Ads.canRewarded();
    if (!hasPack && !canAd) return false;
    const buttons = [{ label: 'Pasiduoti', value: false }];
    if (canAd) buttons.push({ label: '▶ Reklama: +3', value: 'ad', cls: hasPack ? '' : 'primary' });
    if (hasPack) buttons.push({ label: `Tęsti +3 (×${d.boosters.moves})`, value: 'pack', cls: 'primary' });
    const cont = await modal(
      `<h2>Beveik pavyko!</h2>${pukisSays({ e: 'thinking', t: hasPack ? 'Turime papildomų ėjimų paketą. Tęsiam?' : 'Dar keli ėjimai – ir lysvė bus sutvarkyta! Pažiūrėsim reklamą?' })}`,
      buttons
    );
    if (!cont) return false;
    if (cont === 'ad') {
      if (!(await Ads.rewarded('continue'))) return false;
      adContinueUsed = true;
    } else {
      d.boosters.moves--;
      Store.save();
    }
    Telemetry.addContinue();
    Game.resume(3);
    return true;
  }

  async function onLevelEnd(r) {
    const d = Store.data;
    const i = r.levelIndex;
    if (await offerContinue(r)) return;
    Telemetry.end(r.win ? 'win' : 'lose', { ...r.snap, stars: r.stars });
    const achBefore = Progress.claimable().length;
    if (!r.win) Progress.loseLife();
    const moved = Progress.record(r) || [];
    // Kaip pajudėjo dienos užduotys
    const taskNote = moved.length ? `<div class="end-tasks">${moved.map(({ task: t, was }) => {
      const done = t.progress >= t.target;
      return `<div class="et-row${done ? ' done' : ''}"><span class="t-ico">${taskIcon(t)}</span><div class="t-main"><small>${esc(t.text)}</small>
        <div class="t-bar"><div class="et-fill" style="width:${(was / t.target) * 100}%" data-to="${(t.progress / t.target) * 100}"></div></div></div>
        <b>${done ? '✓' : `${t.progress}/${t.target}`}</b></div>`;
    }).join('')}${moved.some(({ task: t }) => t.progress >= t.target) ? `<p class="et-hint">${T('Užduotis atlikta! Prizas laukia skirtuke „Užduotys“.')}</p>` : ''}</div>` : '';
    const growBars = (card) => setTimeout(() => card.querySelectorAll('.et-fill').forEach((b) => (b.style.width = b.dataset.to + '%')), 700);
    const achNote = () => (Progress.claimable().length > achBefore
      ? `<p class="gain">🏆 Naujas pasiekimas! Atsiimk jį pagrindiniame ekrane.</p>` : '');
    if (r.win) {
      const prev = d.stars[i] || 0;
      const gained = Math.max(0, r.stars - prev);
      d.stars[i] = Math.max(prev, r.stars);
      d.best[i] = Math.max(d.best[i] || 0, r.score);
      if (d.unlocked < i + 2) d.unlocked = Math.min(LEVELS.length, i + 2);
      Store.save();
      const hasNext = i + 1 < LEVELS.length;
      const item = Garden.ITEMS[d.garden];
      const line = item && Store.available() >= item.cost ? STORY.canAfford(item.name)[0] : Dialog.pick(STORY.win);
      const choice = await modal(
        `<div class="win-head"><div class="ribbon"><span>Lysvė sutvarkyta</span></div><small>${T('{0} lygis', [i + 1])}</small></div>
         <div class="stars-big win-stars">${starRow(r.stars)}</div>
         <p class="score-line">Taškai: <b class="count">0</b></p>
         ${gained ? `<p class="gain">+${gained} ★ sodui</p>` : '<p class="muted">Pagerink rezultatą – gausi daugiau žvaigždučių</p>'}
         ${achNote()}${taskNote}${pukisSays(line)}`,
        hasNext
          ? [{ label: 'Į sodą', value: 'home' }, { label: 'Kitas lygis', value: 'next', cls: 'primary' }]
          : [{ label: 'Į sodą', value: 'home', cls: 'primary' }],
        (card) => {
          // Žvaigždutės užsidega viena po kitos, taškai suskaičiuojami
          card.querySelectorAll('.win-stars span').forEach((s, k) => setTimeout(() => {
            s.classList.add('lit');
            if (k < r.stars) Sfx.star(k);
          }, 250 + k * 330));
          const cnt = card.querySelector('.count');
          const t0 = performance.now();
          const step = (t) => {
            const p = Math.min(1, (t - t0) / 1100);
            cnt.textContent = Math.round(r.score * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          setTimeout(() => confetti(r.stars === 3 ? 60 : 30), 250 + r.stars * 330);
          growBars(card);
        }
      );
      await Ads.afterWin(i);
      if (i >= 2) await Native.reminders.askOnce();
      if (choice === 'next') openLevel(i + 1);
      else goHome();
    } else {
      const lv = Progress.lives();
      // Ko trūko iki pergalės
      const goals = LEVELS[i].goals || [];
      const left = (r.snap && r.snap.goalsLeft) || [];
      const miss = goals.map((g, k) => ({ g, n: left[k] || 0 })).filter((x) => x.n > 0);
      const few = miss.length && miss.every((x) => (x.g.kind === 'score' ? x.n <= x.g.score * 0.15 : x.n <= 3));
      const missHtml = miss.length ? `<div class="miss"><small>${few ? T('Trūko visai nedaug!') : T('Dar liko:')}</small><div class="miss-row">${
        miss.map((x) => `<div class="miss-chip"><span class="li-ico">${Game.goalIcon(x.g)}</span><b>${x.n}</b></div>`).join('')}</div></div>` : '';
      const hearts = Array.from({ length: Progress.MAX_LIVES }, (_, k) => `<span class="${k < lv ? 'on' : k === lv ? 'breaking' : ''}">♥</span>`).join('');
      const choice = await modal(
        `<h2>Ėjimai baigėsi</h2>${missHtml}<div class="hearts-row">${hearts}</div><p class="muted lives-left">${T('Liko gyvybių: {0}', [lv])}</p>${achNote()}${taskNote}${pukisSays(Dialog.pick(STORY.lose))}`,
        [{ label: 'Į sodą', value: 'home' }, { label: 'Bandyti dar', value: 'retry', cls: 'primary' }],
        (card) => { setTimeout(() => Sfx.heartBreak(), 450); growBars(card); }
      );
      if (choice === 'retry') openLevel(i);
      else goHome();
    }
  }

  // ---------- Paleidimas ----------
  async function init() {
    ART.installDefs();
    await Img.load();
    ART.useImages();
    // Spalvų neskiriantiems: kiekviena rūšis gauna savo simbolį (rodomas tik įjungus nustatymą)
    ART.pieces = ART.pieces.map((h, i) => h + `<span class="cbs cb${i}" aria-hidden="true"></span>`);
    Store.load();
    const d = Store.data;
    document.documentElement.classList.toggle('cb', d.cb === true);
    if (!d.seenTalk) d.seenTalk = {};
    Progress.init();
    Game.bindInput();
    for (const k of ['shovel', 'can', 'rake']) document.querySelector(`#b-${k} .ico`).innerHTML = ART.booster(k);
    document.querySelectorAll('#tabbar .tab').forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
    document.querySelectorAll('#spinta-seg button').forEach((b) => (b.onclick = () => { Sfx.click(); setSeg(b.dataset.seg); }));

    $('#btn-sound').onclick = showSettings;
    Music.arm();
    $('#btn-back').onclick = async () => {
      if (Game.busy) return;
      const costs = Game.movesMade > 0 && !Game.timed;
      const ok = await modal(`<h2>Išeiti iš lygio?</h2><p>Šio lygio pažanga nebus išsaugota.${costs ? '<br><b style="color:#b8432b">Prarasi 1 <span class="heart">♥</span></b>' : ''}</p>`, [
        { label: 'Likti', value: false },
        { label: 'Išeiti', value: true, cls: 'primary' },
      ]);
      if (ok) {
        if (costs) Progress.loseLife();
        Telemetry.end('quit', Game.snapshot());
        goHome();
      }
    };
    $('#garden').onclick = (e) => {
      // Paspaudus veikėją – jis pastryksi ir pasako ką nors savo
      const ch = e.target.closest && e.target.closest('.gchar');
      if (ch) {
        ch.classList.remove('hop');
        void ch.offsetWidth;
        ch.classList.add('hop');
        Sfx.click();
        const who = ch.dataset.who || undefined;
        const own = STORY.chat.filter((l) => l.who === who);
        if (own.length) return Dialog.say([Dialog.pick(own)]);
      }
      const it = e.target.closest && e.target.closest('.gst[data-it]');
      if (it) return pokeItem(it, e);
      const item = Garden.ITEMS[d.garden];
      if (item && Store.available() >= item.cost) return Dialog.say(STORY.canAfford(item.name));
      Dialog.say([Dialog.pick(STORY.tips.filter((l) => (d.metKarolis || l.who !== 'Karolis') && (d.metDyg || l.who !== 'Dygliukas') && (d.metZuze || l.who !== 'Zuzė') && (d.metKvakse || l.who !== 'Kvaksė') && (d.metAgota || l.who !== 'Agota')))]);
    };
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => Game.relayout(), 200);
    });

    renderHome();
    await showTitle();

    const now = new Date();
    const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    if (!d.seenWelcome) {
      d.seenWelcome = true;
      d.lastDaily = today;
      Progress.startStreak();
      Store.save();
      await Dialog.say(STORY.intro);
      renderHome();
    } else if (d.lastDaily !== today) {
      d.lastDaily = today;
      Store.save();
      await showStreak();
    }
  }

  return { init, setTab, refresh: () => renderHome(), get tab() { return homeTab; } };
})();

window.addEventListener('DOMContentLoaded', App.init);

// Offline režimas (veikia per https arba localhost; Android programėlei nereikia – failai jau telefone)
const inApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
if (!inApp && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
