// Lygių aprašai.
// Lentos simboliai:  .  paprastas langelis   #  tuščia vieta (nėra langelio)
//                    w  piktžolė (1 sluoksnis)  W  tanki piktžolė (2 sluoksniai)
//                    s  akmuo (1 smūgis)        S  didelis akmuo (2 smūgiai)
//                    i  užšalęs elementas
// Spalvos: 0 gėlė, 1 obuolys, 2 citrina, 3 lapelis, 4 mėlynė, 5 vynuogė
// Tikslai: collect (surinkti), weeds (išravėti), stones (sudaužyti), ice (atšildyti), score (taškai)
// stars – taškų ribos 1, 2 ir 3 žvaigždutėms.

const LEVELS = [
  {
    moves: 20,
    colors: [0, 1, 2, 3, 4],
    goals: [{ kind: 'collect', type: 0, count: 15 }],
    stars: [1500, 5000, 8000],
    intro: 'Sukeisk du gretimus elementus, kad susidarytų 3 ar daugiau vienodų iš eilės.',
    layout: ['.......', '.......', '.......', '.......', '.......', '.......', '.......'],
  },
  {
    moves: 22,
    colors: [0, 1, 2, 3, 4],
    goals: [
      { kind: 'collect', type: 1, count: 20 },
      { kind: 'collect', type: 3, count: 20 },
    ],
    stars: [2000, 6000, 9500],
    intro: '4 iš eilės sukuria dryžuotą elementą – jis išvalo visą eilutę ar stulpelį!',
    layout: ['........', '........', '........', '........', '........', '........', '........', '........'],
  },
  {
    moves: 26,
    colors: [0, 1, 2, 3, 4],
    goals: [{ kind: 'weeds' }],
    stars: [2500, 6500, 10000],
    intro: 'Naujiena – piktžolės! Sudaryk eiles ant žolėtų langelių, kad jas išravėtum.',
    layout: ['........', '..wwww..', '.wwwwww.', '.wwwwww.', '.wwwwww.', '.wwwwww.', '..wwww..', '........'],
  },
  {
    moves: 20,
    colors: [0, 1, 2, 3, 4],
    goals: [{ kind: 'score', score: 6000 }],
    stars: [6000, 9000, 12000],
    intro: 'Surink kuo daugiau taškų! L ar T formos derinys sukuria sprogstantį elementą.',
    layout: ['##....##', '#......#', '........', '........', '........', '........', '#......#', '##....##'],
  },
  {
    moves: 25,
    colors: [0, 1, 3, 4, 5],
    goals: [
      { kind: 'stones' },
      { kind: 'collect', type: 5, count: 15 },
    ],
    stars: [3000, 7000, 11000],
    intro: 'Naujiena – akmenys! Sudaryk eilę šalia akmens arba susprogdink jį.',
    layout: ['........', '........', '..s..s..', '........', 's......s', '........', '..s..s..', '........'],
  },
  {
    moves: 35,
    colors: [0, 1, 2, 3, 4],
    goals: [{ kind: 'weeds' }],
    stars: [3000, 7500, 12000],
    intro: 'Tankios piktžolės – jas reikia išravėti du kartus.',
    layout: ['ww....ww', 'w......w', '...WW...', '..WWWW..', '..WWWW..', '...WW...', 'w......w', 'ww....ww'],
  },
  {
    moves: 27,
    colors: [0, 1, 2, 3, 4],
    goals: [
      { kind: 'ice' },
      { kind: 'collect', type: 3, count: 20 },
    ],
    stars: [3000, 7000, 11000],
    intro: 'Naujiena – šalna! Užšalusių elementų negalima judinti. Įtrauk juos į eilę, kad atitirptų.',
    layout: ['........', '.i....i.', '..i..i..', '...ii...', '...ii...', '..i..i..', '.i....i.', '........'],
  },
  {
    moves: 34,
    colors: [0, 1, 2, 3, 4],
    goals: [{ kind: 'weeds' }, { kind: 'stones' }],
    stars: [3500, 8000, 13000],
    layout: ['ss....ss', 's.wwww.s', '..wwww..', '..wwww..', '..wwww..', '..wwww..', 's.wwww.s', 'ss....ss'],
  },
  {
    moves: 22,
    colors: [0, 1, 2, 3, 5],
    goals: [{ kind: 'weeds' }],
    stars: [3500, 8000, 12500],
    layout: ['##....##', '##.ww.##', '..wwww..', '.wwWWww.', '.wwWWww.', '..wwww..', '##.ww.##', '##....##'],
  },
  {
    moves: 30,
    colors: [0, 1, 2, 3, 4],
    goals: [{ kind: 'weeds' }, { kind: 'ice' }, { kind: 'stones' }],
    stars: [4000, 9000, 14000],
    intro: 'Didysis išbandymas – piktžolės, šalna ir akmenys kartu!',
    layout: ['s......s', '.i.ww.i.', '..wWWw..', 's.WiiW.s', 's.WiiW.s', '..wWWw..', '.i.ww.i.', 's......s'],
  },
];

// ================= 11–40: Sodo kiemas =================
// Naujos kliūtys:  m  samanos (plinta, jei ėjimo metu nė vienos neišvalai)
//                  T  kelmas (3 smūgiai)
// seeds: { total, max } – sėklų maišeliai, kuriuos reikia nuleisti į apačią
(() => {
  const C5 = [0, 1, 2, 3, 4];
  const C6 = [0, 1, 2, 3, 4, 5];
  const stars = (m) => [Math.round(m * 120 / 100) * 100, Math.round(m * 270 / 100) * 100, Math.round(m * 420 / 100) * 100];
  const L = (moves, colors, goals, layout, extra = {}) => {
    const sc = goals.find((g) => g.kind === 'score');
    LEVELS.push({
      moves, colors, goals, layout,
      stars: sc ? [sc.score, Math.round(sc.score * 1.4), Math.round(sc.score * 1.8)] : stars(moves),
      ...extra,
    });
  };
  const P8 = '........';
  const plain = [P8, P8, P8, P8, P8, P8, P8, P8];
  const seeds = { kind: 'seeds' }, weeds = { kind: 'weeds' }, moss = { kind: 'moss' };
  const stones = { kind: 'stones' }, stumps = { kind: 'stumps' }, ice = { kind: 'ice' };
  const col = (type, count) => ({ kind: 'collect', type, count });

  // 11–15: sėklų maišeliai
  L(26, C5, [seeds], plain, { seeds: { total: 2, max: 2 }, intro: 'Sėklų maišelius nuleisk į lentos apačią. Sunaikinti jų negalima!' });
  L(32, C5, [seeds, col(1, 20)], [P8, P8, P8, P8, P8, P8, '..i..i..', P8], { seeds: { total: 2, max: 2 } });
  L(30, C5, [seeds, weeds], [P8, P8, P8, P8, P8, 'wwwwwwww', 'wwwwwwww', P8], { seeds: { total: 3, max: 2 } });
  L(22, C5, [{ kind: 'score', score: 10000 }], ['...##...', P8, P8, '#......#', '#......#', P8, P8, '...##...']);
  L(31, C5, [seeds, stones], [P8, P8, '.s....s.', P8, '..s..s..', P8, '.s....s.', P8], { seeds: { total: 3, max: 2 } });

  // 16–20: samanos
  L(22, C5, [moss], [P8, P8, P8, P8, P8, P8, 'mm....mm', 'mm....mm'], { intro: 'Samanos plinta! Kiekvieną ėjimą išvalyk bent vieną jų lopinėlį.' });
  L(26, C5, [moss, col(3, 20)], [P8, P8, '..mmmm..', '..m..m..', '..m..m..', '..mmmm..', P8, P8]);
  L(28, C5, [moss, seeds], [P8, P8, P8, P8, 'mm....mm', P8, '..mmmm..', P8], { seeds: { total: 2, max: 2 } });
  L(30, C5, [moss, ice], [P8, '.i....i.', P8, 'm.iiii.m', 'm......m', P8, '.i....i.', 'mm....mm']);
  L(30, C5, [moss, stones], ['s......s', P8, '..mmmm..', '.s.mm.s.', '.s.mm.s.', '..mmmm..', P8, 's......s']);

  // 21–25: kelmai
  L(24, C5, [stumps], [P8, P8, '...TT...', P8, P8, '.T....T.', P8, P8], { intro: 'Kelmai kietesni už akmenis – reikės trijų smūgių.' });
  L(37, C5, [weeds, stumps], ['T......T', '.wwwwww.', '.w....w.', '.w.TT.w.', '.w.TT.w.', '.w....w.', '.wwwwww.', 'T......T']);
  L(35, C5, [stumps, seeds], [P8, P8, 'T..TT..T', P8, P8, P8, P8, P8], { seeds: { total: 3, max: 2 } });
  L(30, C5, [stumps, moss], [P8, '.T....T.', P8, '...mm...', '..mmmm..', '..mmmm..', '.T.mm.T.', P8]);
  L(38, C5, [weeds, stumps, seeds], ['T......T', '..wwww..', '.wiwwiw.', P8, P8, '.wiwwiw.', '..wwww..', 'T......T'], { seeds: { total: 2, max: 2 } });

  // 26–30: viskas kartu, 6 rūšys
  L(30, C6, [col(0, 20), col(5, 20)], ['.##..##.', P8, P8, P8, '#......#', '##....##', '###..###', '###..###'], { intro: 'Šiandien sode visos šešios rūšys – sunkiau, bet įdomiau!' });
  L(25, C5, [{ kind: 'score', score: 11000 }], plain);
  L(33, C5, [ice], ['.iiiiii.', P8, P8, 'i.i..i.i', P8, P8, P8, '.iiiiii.']);
  L(34, C5, [seeds, moss], [P8, P8, P8, '.mmmmmm.', P8, P8, 'm......m', 'mm....mm'], { seeds: { total: 4, max: 2 } });
  L(34, C5, [weeds, stones], [P8, '.WWWWWW.', '.W....W.', '.W.ss.W.', '.W.ss.W.', '.W....W.', '.WWWWWW.', P8]);

  // 31–35
  L(30, C5, [stumps], [P8, '.T....T.', P8, '...TT...', '...TT...', P8, '.T....T.', P8]);
  L(35, C5, [seeds], [P8, P8, '#......#', '#......#', '##....##', '##....##', '###..###', '###..###'], { seeds: { total: 3, max: 2 } });
  L(34, C5, [moss], ['mmm..mmm', 'm......m', P8, P8, P8, P8, 'm......m', 'mmm..mmm']);
  L(34, C6, [col(0, 20), col(2, 20), col(4, 20), ice], [P8, '..iiii..', '.i....i.', P8, P8, '.i....i.', '..iiii..', P8]);
  L(36, C5, [weeds, seeds, stones], [P8, '..s..s..', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', '..s..s..', P8, P8], { seeds: { total: 3, max: 2 } });

  // 36–40
  L(40, C5, [stumps, moss, ice], ['T.i..i.T', P8, '..mmmm..', 'i.mTTm.i', 'i.mTTm.i', '..mmmm..', P8, 'T.i..i.T']);
  L(26, C5, [{ kind: 'score', score: 13000 }], ['#......#', P8, P8, '...##...', '...##...', P8, P8, '#......#']);
  L(42, C5, [seeds, weeds], ['WWWWWWWW', P8, P8, P8, P8, P8, 'wwwwwwww', 'WWWWWWWW'], { seeds: { total: 4, max: 3 } });
  L(38, C5, [weeds, stones, ice], ['S.wwww.S', '.wiwwiw.', 'wwWWWWww', 'wiWSSWiw', 'wiWSSWiw', 'wwWWWWww', '.wiwwiw.', 'S.wwww.S']);
  L(40, C5, [weeds, moss, stumps], ['TwwwwwwT', 'wWW..WWw', 'wWmmmmWw', 'w.TmmT.w', 'w.TmmT.w', 'wWmmmmWw', 'wWW..WWw', 'TwwwwwwT'], { intro: 'Didžioji lysvė – visi priešai vienoje vietoje!' });
})();

// ================= 41–60: Daržas =================
// Nauja kliūtis:  k  kurmis (1 smūgis; kas moleEvery ėjimų peršoka į gretimą langelį)
(() => {
  const C5 = [0, 1, 2, 3, 4];
  const C6 = [0, 1, 2, 3, 4, 5];
  const stars = (m) => [Math.round(m * 130 / 100) * 100, Math.round(m * 280 / 100) * 100, Math.round(m * 430 / 100) * 100];
  const L = (moves, colors, goals, layout, extra = {}) => {
    const sc = goals.find((g) => g.kind === 'score');
    LEVELS.push({
      moves, colors, goals, layout, moleEvery: 3,
      stars: sc ? [sc.score, Math.round(sc.score * 1.4), Math.round(sc.score * 1.8)] : stars(moves),
      ...extra,
    });
  };
  const P8 = '........';
  const moles = { kind: 'moles' }, seeds = { kind: 'seeds' }, weeds = { kind: 'weeds' }, moss = { kind: 'moss' };
  const stones = { kind: 'stones' }, stumps = { kind: 'stumps' }, ice = { kind: 'ice' };
  const col = (type, count) => ({ kind: 'collect', type, count });

  // 41–45
  L(18, C5, [moles], [P8, P8, '..k..k..', P8, P8, '....k...', P8, P8], { intro: 'Kurmiui reikia 2 smūgių – po pirmo jis pabėga į kitą vietą! Be to, kas 3 ėjimus kurmiai patys peršoka.' });
  L(22, C5, [moles, col(1, 25)], [P8, '.k....k.', P8, P8, P8, P8, '.k....k.', P8]);
  L(23, C5, [moles, weeds], [P8, P8, 'wwwwwwww', 'w.k..k.w', 'w..k...w', 'wwwwwwww', P8, P8]);
  L(26, C5, [{ kind: 'score', score: 12000 }], ['#......#', P8, '..k..k..', P8, P8, '..k..k..', P8, '#......#']);
  L(34, C5, [moles, seeds], [P8, P8, '.k....k.', P8, '...k....', P8, P8, P8], { seeds: { total: 3, max: 2 } });

  // 46–50
  L(25, C5, [moles, stumps], [P8, '.T....T.', '...k....', P8, P8, '....k...', '.T....T.', P8]);
  L(27, C5, [moles, moss], [P8, '..k..k..', P8, P8, P8, P8, 'mm....mm', 'mmm..mmm']);
  L(25, C5, [moles, ice], [P8, '.i.ii.i.', '..k..k..', P8, P8, '..k..k..', '.i.ii.i.', P8]);
  L(34, C6, [col(0, 20), col(3, 20), col(5, 20)], [P8, P8, P8, '#..##..#', '#..##..#', P8, P8, P8]);
  L(29, C5, [moles, weeds, stones], ['s......s', '.wwwwww.', '.wk..kw.', '.w.ss.w.', '.w.ss.w.', '.wk..kw.', '.wwwwww.', 's......s'], { intro: 'Pusė daržo! Kurmiai, piktžolės ir akmenys vienoje lysvėje.' });

  // 51–55
  L(24, C5, [moles], ['k......k', P8, '..k..k..', P8, P8, '..k..k..', P8, 'k......k'], { moleEvery: 2 });
  L(34, C5, [moles, seeds, weeds], [P8, P8, '.k....k.', P8, P8, 'wwwwwwww', 'wwwwwwww', P8], { seeds: { total: 3, max: 2 } });
  L(36, C5, [moles, moss, stumps], ['T......T', P8, '..k..k..', '...mm...', '...mm...', '..k..k..', P8, 'T......T']);
  L(28, C5, [{ kind: 'score', score: 14000 }], [P8, '.k....k.', P8, '...##...', '...##...', P8, '.k....k.', P8]);
  L(30, C5, [moles, ice, weeds], ['wwi..iww', 'w......w', '..k..k..', 'i......i', 'i......i', '..k..k..', 'w......w', 'wwi..iww'], { intro: 'Kurmių šeima! Jų čia visas būrys.' });

  // 56–60
  L(28, C6, [moles, col(1, 25)], [P8, '..k..k..', P8, '.k....k.', P8, P8, P8, P8]);
  L(34, C5, [moles, seeds, stones], [P8, '.s....s.', '..k..k..', P8, '...k....', P8, '.s....s.', P8], { seeds: { total: 3, max: 2 } });
  L(34, C5, [moles, moss, ice], ['mmi..imm', 'm......m', '..k..k..', P8, P8, '..k..k..', 'm......m', 'mmi..imm']);
  L(38, C5, [moles, weeds, stumps], ['TwwwwwwT', 'wW....Ww', 'w.k..k.w', 'w..TT..w', 'w..TT..w', 'w.k..k.w', 'wW....Ww', 'TwwwwwwT']);
  L(42, C5, [moles, weeds, moss, seeds], ['wwwwwwww', 'w.k..k.w', 'w......w', 'mm.kk.mm', 'mm....mm', 'w......w', 'w.k..k.w', 'wwwwwwww'], { seeds: { total: 2, max: 2 }, intro: 'Didžioji daržo lysvė – visi kurmiai susirinko čia!' });
})();

// ================= 61–80: Bitynas =================
// Naujos kliūtys:  c  bičių korys (2 smūgiai; kas combEvery ėjimų apsemia medumi netoliese esantį elementą)
//                  h  medumi apsemtas elementas (negalima perkelti; sunaikinus – medaus lašas)
// Tikslai: honey (surinkti medaus lašų), combs (sudaužyti visus korius)
(() => {
  const C5 = [0, 1, 2, 3, 4];
  const C6 = [0, 1, 2, 3, 4, 5];
  const stars = (m) => [Math.round(m * 140 / 100) * 100, Math.round(m * 290 / 100) * 100, Math.round(m * 440 / 100) * 100];
  const L = (moves, colors, goals, layout, extra = {}) => {
    const sc = goals.find((g) => g.kind === 'score');
    LEVELS.push({
      moves, colors, goals, layout, moleEvery: 3, combEvery: 3,
      stars: sc ? [sc.score, Math.round(sc.score * 1.4), Math.round(sc.score * 1.8)] : stars(moves),
      ...extra,
    });
  };
  const P8 = '........';
  const honey = (count) => ({ kind: 'honey', count });
  const combs = { kind: 'combs' }, moles = { kind: 'moles' }, seeds = { kind: 'seeds' }, weeds = { kind: 'weeds' };
  const moss = { kind: 'moss' }, stumps = { kind: 'stumps' }, ice = { kind: 'ice' }, stones = { kind: 'stones' };
  const col = (type, count) => ({ kind: 'collect', type, count });

  // 61–65
  L(18, C5, [honey(6)], [P8, P8, '..h..h..', P8, P8, '..h..h..', '...hh...', P8], { intro: 'Medumi apsemto elemento pajudinti negalima – bet sudarius eilę jis sunyksta, o tu gauni medaus lašą!' });
  L(22, C5, [combs, honey(10)], [P8, P8, '..h..h..', '...cc...', P8, '..h..h..', P8, P8], { intro: 'Koriai kas 3 ėjimus apsemia medumi netoliese esantį elementą. Sudaužytas korys (2 smūgiai) duoda 3 medaus lašus!' });
  L(22, C5, [combs, col(0, 25)], [P8, '.c....c.', P8, P8, P8, P8, '.c....c.', P8]);
  L(26, C5, [honey(17)], ['hh....hh', 'h......h', P8, '...cc...', P8, P8, 'h......h', 'hh....hh']);
  L(24, C5, [combs, weeds], [P8, '..c..c..', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', P8, P8, P8]);

  // 66–70
  L(26, C5, [combs, honey(10), moles], ['..h..h..', '.k....k.', P8, '..c..c..', P8, '.h....h.', '...k....', P8]);
  L(26, C5, [{ kind: 'score', score: 15000 }], ['#......#', P8, '..h..h..', '...cc...', P8, '..h..h..', P8, '#......#']);
  L(32, C5, [combs, seeds], [P8, P8, 'c......c', P8, P8, P8, '...cc...', P8], { seeds: { total: 3, max: 2 } });
  L(30, C6, [col(2, 22), col(4, 22), honey(10)], [P8, '.h.hh.h.', P8, '..c..c..', P8, P8, '.h.hh.h.', P8]);
  L(35, C5, [combs, stumps, honey(8)], ['T......T', '..h..h..', '..c..c..', P8, P8, '..c..c..', '..h..h..', 'T......T'], { intro: 'Pusė bityno! Koriai, kelmai ir medus – visi kartu.' });

  // 71–75
  L(30, C5, [combs, moss], ['mm....mm', 'm......m', '...cc...', P8, P8, '...cc...', 'm......m', 'mm....mm']);
  L(28, C5, [honey(22)], ['hhhhhhhh', P8, P8, '..c..c..', P8, P8, P8, 'hhhhhhhh'], { combEvery: 2 });
  L(30, C5, [combs, ice, honey(10)], ['.i....i.', '..i..i..', '...cc...', 'i......i', 'i......i', '...cc...', '..i..i..', '.i....i.']);
  L(28, C5, [{ kind: 'score', score: 17000 }], [P8, '.c....c.', P8, '...##...', '...##...', P8, '.c....c.', P8]);
  L(38, C5, [combs, moles, seeds], ['c......c', '.k....k.', P8, P8, P8, P8, '.k....k.', 'c......c'], { seeds: { total: 2, max: 2 } });

  // 76–80
  L(34, C6, [combs, col(0, 24), col(5, 24)], [P8, '..c..c..', P8, P8, P8, P8, '..c..c..', P8]);
  L(34, C5, [combs, weeds, stones], ['S.wwww.S', '.wwccww.', 'wwwwwwww', 'w.s..s.w', 'w.s..s.w', 'wwwwwwww', '.wwccww.', 'S.wwww.S']);
  L(32, C5, [honey(24), moss], ['hhh..hhh', 'm......m', '..c..c..', P8, P8, '..c..c..', 'm......m', 'hhh..hhh']);
  L(36, C5, [combs, moles, ice], ['ii....ii', 'i.k..k.i', '..c..c..', P8, P8, '..c..c..', 'i.k..k.i', 'ii....ii']);
  L(44, C5, [combs, honey(18), weeds, stumps], ['TwwwwwwT', 'wh.cc.hw', 'w......w', 'wc.hh.cw', 'wc.hh.cw', 'w......w', 'wh.cc.hw', 'TwwwwwwT'], { intro: 'Didžioji bityno lysvė – visi koriai, medus ir kelmai vienoje vietoje!' });
})();

// ================= 81–100: Oranžerija =================
// Nauja kliūtis:  v  vazonas – jį pripildo tos spalvos elementai, sudėti eilėje šalia (visa eilė „pasodinama“).
//                    Sprogimas, palietęs vazoną, įdeda 1. Pilnas vazonas pražysta ir atlaisvina langelį.
//                    potNeed – kiek elementų reikia (numatyta 6); spalvos parenkamos paeiliui.
// Tikslas: pots (pripildyti visus vazonus)
(() => {
  const C5 = [0, 1, 2, 3, 4];
  const C6 = [0, 1, 2, 3, 4, 5];
  const stars = (m) => [Math.round(m * 140 / 100) * 100, Math.round(m * 290 / 100) * 100, Math.round(m * 440 / 100) * 100];
  const L = (moves, colors, goals, layout, extra = {}) => {
    const sc = goals.find((g) => g.kind === 'score');
    LEVELS.push({
      moves, colors, goals, layout, moleEvery: 3, combEvery: 3, potNeed: 6,
      stars: sc ? [sc.score, Math.round(sc.score * 1.4), Math.round(sc.score * 1.8)] : stars(moves),
      ...extra,
    });
  };
  const P8 = '........';
  const pots = { kind: 'pots' }, honey = (count) => ({ kind: 'honey', count });
  const combs = { kind: 'combs' }, moles = { kind: 'moles' }, seeds = { kind: 'seeds' }, weeds = { kind: 'weeds' };
  const moss = { kind: 'moss' }, stumps = { kind: 'stumps' }, ice = { kind: 'ice' }, stones = { kind: 'stones' };
  const col = (type, count) => ({ kind: 'collect', type, count });

  // 81–85
  L(20, C5, [pots], [P8, P8, '..v..v..', P8, P8, P8, P8, P8], { intro: 'Vazonui reikia savo spalvos žiedų! Sudaryk eilę tos spalvos šalia vazono – visa eilė bus pasodinta.' });
  L(28, C5, [pots], [P8, '.v....v.', P8, P8, P8, P8, '.v....v.', P8], { potNeed: 4 });
  L(26, C5, [pots, col(1, 20)], [P8, P8, '...vv...', P8, P8, '...vv...', P8, P8]);
  L(35, C5, [pots, weeds], ['wwwwwwww', 'w.v..v.w', 'wwwwwwww', P8, P8, 'wwwwwwww', 'w.v..v.w', 'wwwwwwww'], { potNeed: 5 });
  L(24, C5, [{ kind: 'score', score: 15000 }], ['#......#', P8, '..v..v..', P8, P8, '..v..v..', P8, '#......#']);

  // 86–90
  L(37, C5, [pots, ice], ['.i....i.', '.ivi.iv.', '.i....i.', P8, P8, '.i....i.', '.vi.ivi.', '.i....i.'], { potNeed: 4, intro: 'Šalna ir oranžerijoje! Užšalusius elementus atšildyk – jie irgi tinka vazonams.' });
  L(34, C5, [pots, stones], ['s......s', '.s.vv.s.', P8, 's......s', 's......s', P8, '.s.vv.s.', 's......s']);
  L(34, C5, [pots], [P8, '.v....v.', P8, '...v....', '....v...', P8, '.v....v.', P8], { potNeed: 5 });
  L(38, C5, [pots, seeds], [P8, '..v..v..', P8, P8, '.v....v.', P8, P8, P8], { seeds: { total: 3, max: 2 }, potNeed: 5 });
  L(40, C5, [pots, stumps, moss], ['T......T', 'm.v..v.m', 'm......m', P8, P8, 'm......m', 'm.v..v.m', 'T......T'], { potNeed: 4, intro: 'Pusė oranžerijos! Vazonai, kelmai ir samanos – visi kartu.' });

  // 91–95
  L(32, C5, [pots, moles], ['.k....k.', '..v..v..', P8, P8, P8, P8, '..v..v..', '.k....k.']);
  L(35, C5, [pots, combs, honey(8)], [P8, '.v.cc.v.', '..h..h..', P8, P8, '..h..h..', '.v....v.', P8], { potNeed: 5 });
  L(43, C5, [pots], ['.v....v.', P8, P8, '...vv...', '...vv...', P8, P8, '.v....v.'], { potNeed: 3 });
  L(28, C5, [{ kind: 'score', score: 17000 }], [P8, '.v....v.', P8, '...##...', '...##...', P8, '.v....v.', P8]);
  L(45, C5, [pots, ice, weeds], ['wwiiiiww', 'w.v..v.w', 'wi....iw', 'w......w', 'w......w', 'wi....iw', 'w.v..v.w', 'wwiiiiww'], { potNeed: 5 });

  // 96–100
  L(36, C5, [pots, col(0, 20)], [P8, '.v....v.', P8, '..v..v..', P8, P8, '.v....v.', P8], { potNeed: 4 });
  L(40, C5, [pots, moss], ['mm....mm', 'm.v..v.m', P8, '...vv...', P8, P8, 'm.v..v.m', 'mm....mm'], { potNeed: 5 });
  L(43, C5, [pots, seeds, stones], ['s......s', '..v..v..', P8, '.s....s.', '.s....s.', P8, '..v..v..', 's......s'], { seeds: { total: 2, max: 2 }, potNeed: 4 });
  L(40, C5, [pots, combs, moles], ['c......c', '.k.vv.k.', P8, P8, P8, P8, '.k.vv.k.', 'c......c']);
  L(46, C5, [pots, weeds, stumps, ice], ['TwwwwwwT', 'wv.ii.vw', 'w......w', 'wi.vv.iw', 'wi.vv.iw', 'w......w', 'wv.ii.vw', 'TwwwwwwT'], { potNeed: 4, intro: 'Didžioji oranžerijos lysvė – visi vazonai laukia žiedų!' });
})();

// ================= 101–120: Malūnas =================
// Nauja kliūtis:  f  miltų maišas (2 smūgiai; pradraskytas išberia 3 saujas grūdų)
// Tikslai: sacks (pradraskyti visus maišus), grain (surinkti grūdų)
(() => {
  const C5 = [0, 1, 2, 3, 4];
  const C6 = [0, 1, 2, 3, 4, 5];
  const stars = (m) => [Math.round(m * 140 / 100) * 100, Math.round(m * 290 / 100) * 100, Math.round(m * 440 / 100) * 100];
  const L = (moves, colors, goals, layout, extra = {}) => {
    const sc = goals.find((g) => g.kind === 'score');
    LEVELS.push({
      moves, colors, goals, layout, moleEvery: 3, combEvery: 3, potNeed: 5,
      stars: sc ? [sc.score, Math.round(sc.score * 1.4), Math.round(sc.score * 1.8)] : stars(moves),
      ...extra,
    });
  };
  const P8 = '........';
  const sacks = { kind: 'sacks' }, grain = (count) => ({ kind: 'grain', count });
  const pots = { kind: 'pots' }, honey = (count) => ({ kind: 'honey', count });
  const combs = { kind: 'combs' }, moles = { kind: 'moles' }, seeds = { kind: 'seeds' }, weeds = { kind: 'weeds' };
  const moss = { kind: 'moss' }, stumps = { kind: 'stumps' }, ice = { kind: 'ice' }, stones = { kind: 'stones' };
  const col = (type, count) => ({ kind: 'collect', type, count });

  // 101–105
  L(15, C5, [sacks], [P8, P8, '..f..f..', P8, P8, '..f..f..', P8, P8], { intro: 'Miltų maišą reikia pradraskyti du kartus – sudaryk eilę šalia arba susprogdink jį.' });
  L(18, C5, [grain(18)], [P8, '.f....f.', P8, '...ff...', '...ff...', P8, '.f....f.', P8], { intro: 'Kiekvienas pradraskytas maišas išberia 3 saujas grūdų!' });
  L(30, C5, [sacks, col(2, 20)], ['f......f', P8, P8, '..f..f..', P8, P8, P8, 'f......f']);
  L(30, C5, [sacks, weeds], ['wwwwwwww', 'w.f..f.w', 'wwwwwwww', P8, P8, 'wwwwwwww', 'w.f..f.w', 'wwwwwwww']);
  L(24, C5, [{ kind: 'score', score: 15000 }], ['#......#', '..f..f..', P8, P8, P8, P8, '..f..f..', '#......#']);

  // 106–110
  L(32, C5, [grain(18), ice], ['.i....i.', '.if..fi.', P8, '..f..f..', P8, P8, '.if..fi.', '.i....i.'], { intro: 'Pašalo ir ant kalvos! Užšalusius elementus atšildyk sudarydamas eilę.' });
  L(32, C5, [sacks, stones], ['s......s', '.f.ss.f.', P8, 's......s', 's......s', P8, '.f.ss.f.', 's......s']);
  L(28, C5, [sacks, pots], [P8, '.f.v..f.', P8, '...f....', '....f...', P8, '.f..v.f.', P8], { intro: 'Kvaksė atnešė vazonų – jiems irgi reikia žiedų.' });
  L(34, C5, [grain(12), seeds], [P8, '..f..f..', P8, P8, '.f....f.', P8, P8, P8], { seeds: { total: 3, max: 2 } });
  L(36, C5, [sacks, stumps, moss], ['T......T', 'm.f..f.m', 'm......m', '...ff...', P8, 'm......m', 'm.f..f.m', 'T......T'], { intro: 'Pusė kalvos! Maišai, kelmai ir samanos – visi kartu.' });

  // 111–115
  L(28, C5, [sacks, moles], ['.k....k.', '..f..f..', P8, P8, P8, P8, '..f..f..', '.k....k.']);
  L(32, C5, [grain(12), combs, honey(8)], [P8, '.f.cc.f.', '..h..h..', P8, P8, '..h..h..', '.f....f.', P8]);
  L(34, C6, [sacks, col(5, 18)], [P8, 'f......f', P8, '..f..f..', '..f..f..', P8, 'f......f', P8]);
  L(28, C5, [{ kind: 'score', score: 17000 }], [P8, '.f....f.', P8, '...##...', '...##...', P8, '.f....f.', P8]);
  L(42, C5, [sacks, ice, weeds], ['wwiiiiww', 'w.f..f.w', 'wi....iw', 'w..ff..w', 'w......w', 'wi....iw', 'w.f..f.w', 'wwiiiiww']);

  // 116–120
  L(30, C5, [grain(36)], ['ff....ff', 'f......f', P8, '...ff...', P8, P8, 'f......f', 'ff....ff']);
  L(40, C5, [sacks, moss, col(0, 18)], ['mm....mm', 'm.f..f.m', P8, '...ff...', P8, P8, 'm.f..f.m', 'mm....mm']);
  L(40, C5, [sacks, seeds, stones], ['s......s', '..f..f..', P8, '.s....s.', '.s....s.', P8, '..f..f..', 's......s'], { seeds: { total: 3, max: 2 } });
  L(34, C5, [sacks, pots, moles], ['f......f', '.k.vv.k.', P8, P8, P8, P8, '.k.ff.k.', 'f......f']);
  L(46, C5, [grain(24), weeds, stumps, ice], ['TwwwwwwT', 'wf.ii.fw', 'w......w', 'wi.ff.iw', 'wi.ff.iw', 'w......w', 'wf.ii.fw', 'TwwwwwwT'], { intro: 'Didžioji malūno lysvė – visi maišai laukia!' });
})();
