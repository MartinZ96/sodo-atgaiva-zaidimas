// Garsai, fono muzika ir vibracija – viskas sugeneruojama naršyklėje (be garso failų).
// Visi garsai eina per bendrą „šiltą“ grandinę: švelnus žemų dažnių filtras, kompresorius ir trumpas aidas,
// todėl skamba minkštai, lyg mediniai varpeliai ir marimba, o ne kaip kompiuterio pyptelėjimai.
const Sfx = (() => {
  let ctx = null, out = null, verb = null, fx = null, fxWet = null;
  // Garsumas 0–100 (nustatymuose); numatytai 80 garsams ir 70 muzikai
  const vol = (k, def) => { const v = Store.data[k]; return (typeof v === 'number' ? v : def) / 100; };
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
      buildChain();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // Trumpas „kambario“ aidas iš sugeneruoto impulso
  function impulse(sec = 1.4, decay = 3) {
    const len = Math.floor(ctx.sampleRate * sec);
    const b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }
  function buildChain() {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2;
    const warm = ctx.createBiquadFilter();
    warm.type = 'lowpass'; warm.frequency.value = 5200; warm.Q.value = 0.5;
    out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(warm); warm.connect(comp); comp.connect(ctx.destination);
    // Aidas – siunčiamas atskirai, kad sausas garsas liktų aiškus
    const conv = ctx.createConvolver();
    conv.buffer = impulse(1.3, 3.2);
    verb = ctx.createGain();
    verb.gain.value = 0.22;
    verb.connect(conv); conv.connect(warm);
    // Žaidimo garsai eina per savo garsumo mazgą (muzika – per savo)
    fx = ctx.createGain(); fx.connect(out);
    fxWet = ctx.createGain(); fxWet.connect(verb);
    setVolume();
  }
  function setVolume() {
    if (!fx) return;
    const v = vol('sfxVol', 80) * 1.25;
    fx.gain.value = v;
    fxWet.gain.value = v;
  }
  const on = () => !!Store.data.sound;

  // Vienas tonas su švelniu įsijungimu (be spragtelėjimo)
  function tone(freq, dur = 0.12, type = 'sine', vol = 0.15, slide = 0, delay = 0, { attack = 0.006, wet = 0.5 } = {}) {
    if (!on()) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(fx);
    if (wet) { const w = c.createGain(); w.gain.value = wet; g.connect(w); w.connect(fxWet); }
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }
  // Marimba / medinis varpelis: pagrindinis tonas + greitai užgęstantys obertonai
  function mallet(freq, dur = 0.5, vol = 0.12, delay = 0) {
    tone(freq, dur, 'sine', vol, 0, delay, { attack: 0.004 });
    tone(freq * 4, dur * 0.18, 'sine', vol * 0.18, 0, delay, { attack: 0.002, wet: 0.2 });
    tone(freq * 2.01, dur * 0.4, 'sine', vol * 0.12, 0, delay, { attack: 0.003 });
  }
  // Varpelis – ilgesnis, skaidresnis
  function bell(freq, dur = 0.6, vol = 0.1, delay = 0) {
    tone(freq, dur, 'sine', vol, 0, delay, { attack: 0.003, wet: 0.8 });
    tone(freq * 2.76, dur * 0.35, 'sine', vol * 0.16, 0, delay, { attack: 0.002, wet: 0.8 });
    tone(freq * 5.4, dur * 0.15, 'sine', vol * 0.06, 0, delay, { attack: 0.002, wet: 0.8 });
  }
  // Vibracija (veikia Android telefonuose)
  function vibe(pattern) {
    if (Store.data.vibrate === false) return;
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* nepalaikoma */ }
  }
  // Triukšmas (vėjui, smūgiams, ledui, miltams)
  let noiseBuf = null;
  function noise(dur, { type = 'bandpass', f0 = 800, f1 = 800, q = 1, vol = 0.15, delay = 0, wet = 0.3 } = {}) {
    if (!on()) return;
    const c = ensure();
    if (!c) return;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t0 = c.currentTime + delay;
    const s = c.createBufferSource();
    s.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + Math.min(0.03, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(fx);
    if (wet) { const w = c.createGain(); w.gain.value = wet; g.connect(w); w.connect(fxWet); }
    s.start(t0);
    s.stop(t0 + dur + 0.05);
  }
  // C-dur pentatonika – grandinės garsai kyla muzikaliai
  const PENTA = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];
  return {
    context: ensure,
    output: () => (ensure(), out),
    setVolume, vol,
    reverb: () => (ensure(), verb),
    vibe,
    pop: (n) => {
      const f = PENTA[Math.min(n - 1, PENTA.length - 1)];
      mallet(f, 0.45, 0.11);
      noise(0.05, { f0: 3000, f1: 1800, q: 2, vol: 0.025, wet: 0 });
    },
    swap: () => noise(0.14, { f0: 500, f1: 1400, q: 1.2, vol: 0.045, wet: 0.1 }),
    bad: () => { mallet(330, 0.25, 0.08); mallet(294, 0.3, 0.07, 0.1); vibe(15); },
    special: () => { noise(0.32, { f0: 500, f1: 2600, q: 1, vol: 0.06 }); bell(1568, 0.5, 0.05, 0.05); vibe(30); },
    whoosh: () => { noise(0.4, { f0: 350, f1: 2200, q: 1.2, vol: 0.08 }); bell(1175, 0.5, 0.05, 0.1); },
    boom: (big) => {
      // Minkštas „pūptelėjimas“ vietoj sprogimo
      tone(big ? 120 : 150, big ? 0.55 : 0.38, 'sine', 0.22, 0.45, 0, { attack: 0.01, wet: 0.3 });
      noise(big ? 0.55 : 0.35, { type: 'lowpass', f0: 900, f1: 140, q: 0.6, vol: big ? 0.18 : 0.12 });
      if (big) bell(1047, 0.8, 0.05, 0.08);
    },
    sparkle: () => [0, 1, 2, 3, 4, 5].forEach((i) => bell(PENTA[4 + (i % 5)] * 1.5, 0.5, 0.035, i * 0.06)),
    big: () => { [0, 2, 4, 7].forEach((k, i) => mallet(PENTA[k], 0.7, 0.08, i * 0.08)); bell(2093, 1, 0.04, 0.32); },
    ice: () => { noise(0.16, { type: 'highpass', f0: 3200, f1: 5200, q: 1, vol: 0.05 }); bell(2349, 0.4, 0.035, 0.02); },
    stone: () => { noise(0.14, { type: 'lowpass', f0: 800, f1: 220, q: 0.8, vol: 0.12, wet: 0.15 }); tone(110, 0.12, 'sine', 0.1, 0.7, 0, { wet: 0.1 }); vibe(18); },
    // Miltų maišas: minkštas „pūkšt“ ir lengvas šnaresys
    sack: () => { tone(95, 0.18, 'sine', 0.13, 0.7, 0, { attack: 0.01, wet: 0.1 }); noise(0.35, { type: 'lowpass', f0: 2400, f1: 500, q: 0.5, vol: 0.07 }); vibe(15); },
    click: () => { tone(880, 0.06, 'sine', 0.05, 0, 0, { attack: 0.003, wet: 0.2 }); noise(0.025, { f0: 2500, f1: 2000, q: 3, vol: 0.02, wet: 0 }); },
    star: (i) => { bell([784, 988, 1175][i] || 1175, 0.8, 0.08); bell(([784, 988, 1175][i] || 1175) * 2, 0.4, 0.025, 0.04); vibe(15); },
    heartBreak: () => { tone(330, 0.25, 'triangle', 0.05, -120, 0, { wet: 0.4 }); tone(247, 0.35, 'triangle', 0.04, -80, 0.12, { wet: 0.5 }); },
    rustle: () => { noise(0.35, { type: 'highpass', f0: 2500, f1: 4500, q: 0.7, vol: 0.05 }); noise(0.25, { type: 'highpass', f0: 3200, f1: 2600, q: 0.7, vol: 0.035, delay: 0.12 }); },
    splash: () => { noise(0.3, { f0: 1200, f1: 500, q: 1.4, vol: 0.09 }); [988, 1319, 1175].forEach((f, i) => tone(f, 0.12, 'sine', 0.03, -300, 0.05 + i * 0.06, { attack: 0.003, wet: 0.6 })); },
    buzz: () => { tone(180, 0.6, 'sawtooth', 0.012, 30, 0, { attack: 0.05, wet: 0.2 }); tone(220, 0.5, 'sawtooth', 0.01, -20, 0.15, { attack: 0.05, wet: 0.2 }); },
    puffs: () => noise(0.6, { type: 'lowpass', f0: 600, f1: 300, q: 0.5, vol: 0.06 }),
    boing: () => { tone(330, 0.25, 'sine', 0.06, 220, 0, { attack: 0.004 }); tone(660, 0.12, 'sine', 0.02, 200, 0.02); },
    // Didysis derinys: kylanti varpelių laiptelių melodija + minkštas žemas smūgis
    combo: (lvl = 1) => {
      noise(0.5, { type: 'lowpass', f0: 900, f1: 120, q: 0.8, vol: 0.12, wet: 0.5 });
      tone(98, 0.6, 'sine', 0.14, -40, 0, { attack: 0.004, wet: 0.3 });
      const notes = lvl >= 3 ? [0, 2, 4, 5, 7, 9] : lvl === 2 ? [0, 2, 4, 7] : [0, 4, 7];
      notes.forEach((k, i) => bell(PENTA[Math.min(PENTA.length - 1, k)] * (lvl >= 3 ? 1 : 0.75), 0.9, 0.06, 0.12 + i * 0.07));
      vibe(lvl >= 3 ? [40, 30, 60, 30, 90] : [30, 30, 60]);
    },
    blip: () => tone(660 + Math.random() * 200, 0.05, 'sine', 0.025, 0, 0, { attack: 0.003, wet: 0.2 }),
    win: () => { [523, 659, 784, 1047].forEach((f, i) => mallet(f, 0.6, 0.1, i * 0.12)); bell(1568, 1.2, 0.06, 0.5); bell(2093, 1.2, 0.04, 0.6); vibe([50, 40, 50, 40, 100]); },
    lose: () => { [392, 330, 262].forEach((f, i) => mallet(f, 0.55, 0.09, i * 0.2)); vibe(120); },
    unlock: () => { [784, 1047, 1319, 1568].forEach((f, i) => bell(f, 0.7, 0.07, i * 0.08)); vibe(25); },
  };
})();

// Rami fono muzika: kiekviena sodo zona turi savo nuotaiką (dermė, tempas, instrumentas).
const Music = (() => {
  let ctx, bus, timer, nextTime = 0, step = 0, playing = false;
  // Temos: akordai (MIDI), takto ilgis, melodijos garsaeilis ir instrumentas
  const THEMES = [
    // 0 Terasa – šilta C-dur, varpeliai
    { beat: 0.62, bar: 8, chords: [[48, 52, 55, 60], [45, 48, 52, 57], [41, 45, 48, 53], [43, 47, 50, 55]], scale: [60, 62, 64, 67, 69, 72, 74, 76], lead: 'bell', density: 0.55 },
    // 1 Kiemas – G-dur, žaisminga marimba
    { beat: 0.5, bar: 8, chords: [[43, 47, 50, 55], [40, 43, 47, 52], [36, 40, 43, 48], [38, 42, 45, 50]], scale: [62, 64, 67, 69, 71, 74, 76, 79], lead: 'mallet', density: 0.6 },
    // 2 Daržas – F-dur, liaudiška fleita
    { beat: 0.58, bar: 8, chords: [[41, 45, 48, 53], [46, 50, 53, 58], [41, 45, 48, 53], [36, 40, 43, 48]], scale: [65, 67, 69, 72, 74, 77, 79, 81], lead: 'flute', density: 0.45 },
    // 3 Bitynas – D-dur, pizzicato (bitučių žingsneliai)
    { beat: 0.42, bar: 8, chords: [[38, 42, 45, 50], [43, 47, 50, 55], [35, 38, 42, 47], [45, 49, 52, 57]], scale: [62, 64, 66, 69, 71, 74, 76, 78], lead: 'pluck', density: 0.65 },
    // 4 Oranžerija – a-moll valsas (3/4)
    { beat: 0.55, bar: 6, chords: [[45, 48, 52, 57], [41, 45, 48, 53], [48, 52, 55, 60], [40, 44, 47, 52]], scale: [64, 67, 69, 71, 72, 74, 76, 79], lead: 'bell', density: 0.5, waltz: true },
    // 5 Malūnas – liaudiška dermė su burdonu (kaip senose dainose)
    { beat: 0.6, bar: 8, chords: [[43, 50, 55], [43, 50, 55], [41, 48, 53], [43, 50, 55]], scale: [62, 64, 65, 67, 69, 72, 74, 77], lead: 'flute', density: 0.5, drone: 31 },
  ];
  let theme = THEMES[0], themeId = 0;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function setup() {
    bus = ctx.createGain();
    bus.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2400;
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.46;
    const fb = ctx.createGain();
    fb.gain.value = 0.25;
    const wet = ctx.createGain();
    wet.gain.value = 0.28;
    const dest = Sfx.output() || ctx.destination;
    bus.connect(lp);
    lp.connect(dest);
    lp.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(dest);
    const rv = Sfx.reverb();
    if (rv) { const s = ctx.createGain(); s.gain.value = 0.6; lp.connect(s); s.connect(rv); }
  }
  function note(freq, t, dur, type, vol, attack = 0.02, vib = 0) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    if (vib) {
      // Švelnus vibrato fleitai
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = 5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(freq * vib, t + dur * 0.5);
      l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function lead(m, t) {
    const f = mtof(m + 12), B = theme.beat;
    switch (theme.lead) {
      case 'mallet': note(f, t, B * 1.6, 'sine', 0.05, 0.005); note(f * 4, t, B * 0.25, 'sine', 0.008, 0.003); break;
      case 'flute': note(f, t, B * 2.4, 'sine', 0.04, 0.09, 0.006); note(f * 2, t, B * 1.6, 'sine', 0.006, 0.12); break;
      case 'pluck': note(f, t, B * 0.9, 'triangle', 0.035, 0.004); note(f * 2, t, B * 0.3, 'sine', 0.01, 0.003); break;
      default: note(f, t, B * 2.2, 'sine', 0.045, 0.01); note(f * 2, t, B * 0.7, 'sine', 0.008, 0.01);
    }
  }
  let lastMel = 64;
  function schedule() {
    const T = theme, B = T.beat, BAR = T.bar;
    while (nextTime < ctx.currentTime + 0.8) {
      const bar = Math.floor(step / BAR) % T.chords.length;
      const beat = step % BAR;
      const ch = T.chords[bar];
      if (beat === 0) {
        ch.forEach((m) => note(mtof(m), nextTime, B * (BAR + 0.5), 'sine', 0.026, 1.2));
        note(mtof(ch[0] - 12), nextTime, B * (T.waltz ? 1.8 : 3.5), 'triangle', 0.05, 0.04);
        if (T.drone) note(mtof(T.drone), nextTime, B * (BAR + 0.6), 'sine', 0.03, 0.8);
      }
      if (T.waltz && (beat === 2 || beat === 4)) ch.slice(1).forEach((m) => note(mtof(m + 12), nextTime, B * 0.8, 'sine', 0.012, 0.01));
      if (!T.waltz && beat === BAR / 2) note(mtof(ch[0] - 12 + 7), nextTime, B * 3.5, 'triangle', 0.035, 0.04);
      const chance = (beat % 2 === 0 ? 1 : 0.4) * T.density;
      if (step % (BAR * 8) < BAR * 7 && Math.random() < chance) {
        // Melodija juda mažais žingsniais – skamba dainingiau
        const near = T.scale.filter((m) => Math.abs(m - lastMel) <= 5);
        const pool = near.filter((m) => ch.some((c) => (m - c) % 12 === 0));
        const pick = (pool.length && Math.random() < 0.6 ? pool : near.length ? near : T.scale);
        const m = pick[Math.floor(Math.random() * pick.length)];
        lastMel = m;
        lead(m, nextTime);
      }
      nextTime += B;
      step++;
    }
  }
  function start() {
    if (playing || Store.data.music === false) return;
    ctx = Sfx.context();
    if (!ctx) return;
    if (!bus) setup();
    playing = true;
    nextTime = ctx.currentTime + 0.15;
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setValueAtTime(bus.gain.value, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(0.9 * Sfx.vol('musicVol', 70) / 0.7, ctx.currentTime + 3);
    schedule();
    timer = setInterval(schedule, 250);
  }
  function stop() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    if (bus && ctx) {
      bus.gain.cancelScheduledValues(ctx.currentTime);
      bus.gain.setValueAtTime(bus.gain.value, ctx.currentTime);
      bus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    }
  }
  // Kita zona – kita melodija; keičiasi švelniai nuo kito takto
  function setTheme(i) {
    const k = Math.max(0, Math.min(THEMES.length - 1, i | 0));
    if (k === themeId) return;
    themeId = k;
    theme = THEMES[k];
    step = 0;
    lastMel = theme.scale[2];
  }
  // Muzika paleidžiama tik po pirmo palietimo (naršyklių taisyklė)
  function arm() {
    const go = () => { start(); document.removeEventListener('pointerdown', go); };
    document.addEventListener('pointerdown', go);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (ctx) start();
    });
  }
  // Garsumo keitimas iš nustatymų – iš karto, bet švelniai
  function setVolume() {
    if (!bus || !ctx || !playing) return;
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setValueAtTime(bus.gain.value, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(0.9 * Sfx.vol('musicVol', 70) / 0.7, ctx.currentTime + 0.15);
  }
  return { start, stop, arm, setTheme, setVolume, get playing() { return playing; } };
})();
