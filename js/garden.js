// Sodas – žvaigždutėmis atkuriama scena (ilgalaikis žaidimo tikslas).
// Scena: sena terasa su pergole, už jos – sodas auksinėje popietės šviesoje.
const Garden = (() => {
  const TERRACE = [
    { id: 'clean', name: 'Išvalyti terasą', cost: 2,
      after: [{ e: 'happy', t: 'Kaip švaru! Net lentos sublizgo. Senoji šeimininkė čia kas rytą gerdavo arbatą.' }] },
    { id: 'monstera', name: 'Pasodinti monsterą', cost: 3,
      after: [{ e: 'excited', t: 'Monstera! Jos lapai su skylutėmis – kaip mažos langinės saulei.' }, { e: 'wink', t: 'Laistysiu ją kasdien… na, beveik kasdien.' }] },
    { id: 'shelf', name: 'Pastatyti gėlių lentynėlę', cost: 3,
      after: [{ e: 'happy', t: 'Lentynėlė! Dabar mažiesiems vazonėliams netrūks vietos.' }] },
    { id: 'hanging', name: 'Pakabinti vazonus', cost: 3,
      after: [{ e: 'thinking', t: 'Kabantys augalai… Gražu, bet aš jų nepasieksiu. Laistyti teks tau!' }] },
    { id: 'bench', name: 'Pastatyti suoliuką', cost: 4,
      after: [{ e: 'happy', t: 'Suoliukas! Puiki vieta pogulio pertraukėlei. Mano, žinoma.' }] },
    { id: 'tree', name: 'Atgaivinti obelį', cost: 4,
      after: [{ e: 'excited', t: 'Obelis vėl žaliuoja! Rudenį kepsim obuolių pyragą.' }] },
    { id: 'lights', name: 'Pakabinti žibintėlius', cost: 3,
      after: [{ e: 'happy', t: 'Vakarais čia dabar taip jauku… Ar girdi? Net svirpliai sugrįžo.' }] },
    { id: 'greenhouse', name: 'Atstatyti šiltnamį', cost: 5,
      after: [{ e: 'excited', t: 'Šiltnamis! Sodas vėl gyvas!' }, { e: 'happy', t: 'Ačiū tau. Be tavęs nebūčiau susitvarkęs.' }, { e: 'surprised', t: 'Ššš… Girdi? Už tvoros kažkas kranksi.' }] },
  ];

  const TUFTS = [
    [30, 186], [72, 196], [118, 182], [160, 204], [250, 190], [292, 206], [352, 188], [385, 200],
    [20, 228], [60, 244], [110, 232], [150, 252], [214, 238], [262, 250], [318, 232], [370, 248],
    [40, 158], [140, 154], [230, 160], [300, 156], [370, 162],
  ];
  const tuft = ([x, y], i) => {
    const h = 12 + (i % 4) * 4;
    const col = i % 3 === 0 ? '#7a6a3a' : '#66723a';
    return `<g stroke="${col}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".9">
      <path d="M${x} ${y} q-4 ${-h * 0.6} -8 ${-h}"/><path d="M${x} ${y} q1 ${-h * 0.7} 2 ${-h - 3}"/><path d="M${x} ${y} q5 ${-h * 0.5} 9 ${-h * 0.9}"/></g>`;
  };
  const dryLeaf = (x, y, r, c) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.4" transform="rotate(${r} ${x} ${y})" fill="${c}"/>`;
  const pot = (x, y, w, h, extra = '') =>
    `<ellipse cx="${x + w / 2}" cy="${y + h + 2}" rx="${w * 0.6}" ry="${h * 0.12}" fill="#3b2312" opacity=".25"/>` +
    `<path d="M${x} ${y} H${x + w} L${x + w * 0.88} ${y + h} H${x + w * 0.12}Z" fill="url(#gPot)" ${extra}/>` +
    `<rect x="${x - w * 0.05}" y="${y - h * 0.12}" width="${w * 1.1}" height="${h * 0.18}" rx="2" fill="#c06a3e"/>`;
  const mLeaf = (x, y, s, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-50 -90)"><g mask="url(#mMonstera)"><path d="${ART.leafPath}" fill="url(#gLeaf)" stroke="rgba(20,50,25,.45)" stroke-width="1.5"/><path d="M50 24 L50 86" stroke="#cfe6b0" stroke-width="1.5" opacity=".6"/></g></g>`;
  const trail = (x, y, len, dir = 1) => {
    let s = `<path d="M${x} ${y} q${4 * dir} ${len / 2} ${-2 * dir} ${len}" stroke="#4f7a3e" stroke-width="1.5" fill="none"/>`;
    for (let i = 0; i < len / 6; i++) {
      const yy = y + i * 6 + 4;
      s += `<ellipse cx="${x + (i % 2 ? 3 : -3) * dir}" cy="${yy}" rx="3.2" ry="2.2" transform="rotate(${i % 2 ? 30 : -30} ${x} ${yy})" fill="${i % 3 ? '#6f9a52' : '#8dbb6c'}"/>`;
    }
    return s;
  };

  function terrace(done, fresh, mood) {
    const ITEMS = TERRACE;
    const has = (id) => ITEMS.findIndex((x) => x.id === id) < done;
    const cls = (id) => (fresh === id ? ' class="appear"' : '');
    const clean = has('clean');
    const s = [];

    s.push(`<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="gdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${clean ? '#f2d38c' : '#d9cfae'}"/><stop offset="1" stop-color="${clean ? '#f8ead0' : '#e8e0cc'}"/></linearGradient>
      <linearGradient id="gdGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${clean ? '#b7c486' : '#b2ab84'}"/><stop offset="1" stop-color="${clean ? '#8fa368' : '#968f6a'}"/></linearGradient>
      <linearGradient id="gdDeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${clean ? '#a9784f' : '#8d8070'}"/><stop offset="1" stop-color="${clean ? '#6e4a31' : '#635a4e'}"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#gdSky)"/>
      <circle cx="330" cy="36" r="110" fill="url(#gSun)" opacity="${clean ? 1 : 0.5}"/>`);

    // Tolimi medžiai
    const far = clean ? ['#e3b94f', '#d6a640', '#a9b47a', '#c9a24a', '#97aa6c'] : ['#b9ae84', '#a8a07c', '#9f9a78', '#b0a47e', '#99947a'];
    [[30, 112, 40], [86, 104, 36], [150, 116, 34], [214, 106, 40], [270, 114, 32], [330, 108, 38], [388, 116, 34]].forEach(([x, y, r], i) => {
      s.push(`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="${far[i % far.length]}" opacity=".85"/>`);
    });
    s.push(`<rect y="122" width="400" height="60" fill="url(#gdGround)"/>`);

    // Šiltnamis (fone, kairėje)
    s.push(has('greenhouse')
      ? `<g${cls('greenhouse')}><path d="M44 150 V108 L86 82 L128 108 V150Z" fill="#eaf4ef" fill-opacity=".75" stroke="#f8f4ea" stroke-width="2.5"/>
         <path d="M86 82 V150 M44 124 H128 M65 95 V150 M107 95 V150" stroke="#b9cfc4" stroke-width="1.5"/>
         <g fill="#6f9a52"><ellipse cx="55" cy="146" rx="7" ry="5"/><ellipse cx="76" cy="144" rx="8" ry="6"/><ellipse cx="97" cy="146" rx="7" ry="5"/><ellipse cx="117" cy="145" rx="7" ry="5"/></g>
         <path d="M48 112 L80 92" stroke="#fff" stroke-width="2" opacity=".7"/></g>`
      : `<g stroke="#8e887a" stroke-width="2.5" fill="none" opacity=".8"><path d="M46 150 V112 L70 96"/><path d="M126 150 V110"/><path d="M46 128 H76"/><path d="M98 150 L112 124"/><path d="M86 84 L96 92"/></g>`);

    // Obelis (dešinėje, fone)
    s.push(has('tree')
      ? `<g${cls('tree')}><path d="M340 160 Q336 130 338 110 L346 110 Q348 132 350 160Z" fill="url(#gWoodV)"/>
         <g><circle cx="342" cy="88" r="32" fill="#6f9a52"/><circle cx="316" cy="100" r="20" fill="#5f8a48"/><circle cx="368" cy="100" r="20" fill="#5f8a48"/><circle cx="340" cy="70" r="20" fill="#8dbb6c"/></g>
         <g fill="url(#gApple)"><circle cx="324" cy="88" r="5"/><circle cx="350" cy="76" r="5"/><circle cx="362" cy="98" r="5"/><circle cx="334" cy="104" r="5"/><circle cx="312" cy="104" r="4"/></g></g>`
      : `<g stroke="#7a6a58" stroke-width="4" stroke-linecap="round" fill="none"><path d="M344 160 V104"/><path d="M344 122 L324 98"/><path d="M344 112 L364 90"/><path d="M344 104 L338 80"/><path d="M324 98 L314 100" stroke-width="2.5"/></g>`);

    // Tvora
    s.push(`<g fill="${clean ? '#a07a52' : '#8a7c68'}">${[150, 172, 194, 216, 238, 260, 282].map((x, i) => `<rect x="${x}" y="${clean || i % 3 ? 126 : 134}" width="8" height="${clean || i % 3 ? 34 : 26}" rx="2"/>`).join('')}<rect x="146" y="134" width="146" height="4" rx="2"/><rect x="146" y="148" width="146" height="4" rx="2"/></g>`);

    // Terasa
    s.push(`<path d="M0 172 H400 V260 H0Z" fill="url(#gdDeck)"/>
      <g stroke="${clean ? '#5c3d27' : '#504840'}" stroke-width="1.2" opacity=".55">${[180, 190, 202, 216, 232, 250].map((y) => `<path d="M0 ${y} H400"/>`).join('')}</g>
      <path d="M0 172 H400" stroke="#4a3020" stroke-width="2"/>`);
    if (clean) {
      s.push(`<g fill="#ffe7b0" opacity=".16"><path d="M220 172 L300 172 L250 260 L130 260Z"/><path d="M320 172 L360 172 L340 260 L280 260Z"/></g>`);
    }

    // Pergolė (visada)
    s.push(`<g><rect x="10" y="8" width="12" height="166" fill="url(#gWoodV)"/><rect x="378" y="8" width="12" height="166" fill="url(#gWoodV)"/>
      <rect x="0" y="8" width="400" height="13" fill="url(#gWood)"/><path d="M0 21 H400" stroke="#4a3020" stroke-width="1.5" opacity=".6"/></g>`);
    if (!clean) s.push(`<g stroke="#e9e3d6" stroke-width=".8" opacity=".6" fill="none"><path d="M22 21 L48 21 M22 21 L22 46 M22 21 L42 40 M22 31 Q30 30 32 21 M22 38 Q38 36 40 21"/></g>`);

    // Žibintėliai
    if (has('lights')) {
      const bulbs = [];
      for (let i = 1; i < 16; i++) {
        const x = 16 + i * 23.4;
        const seg = x < 200 ? (x - 16) / 184 : (x - 200) / 184;
        const y = 22 + 18 * Math.sin(Math.PI * seg);
        bulbs.push(`<circle cx="${x}" cy="${y + 3}" r="7" fill="url(#gGlow)"/><circle cx="${x}" cy="${y + 3}" r="2.6" fill="#fff4c4"/>`);
      }
      s.push(`<g${cls('lights')}><path d="M16 22 Q108 58 200 24 Q292 58 384 22" stroke="#3a2a1e" stroke-width="1" fill="none"/>${bulbs.join('')}</g>`);
    }

    // Kabantys vazonai
    if (has('hanging')) {
      s.push(`<g${cls('hanging')}>
        <path d="M110 21 L102 58 M110 21 L118 58" stroke="#c9b48a" stroke-width="1"/>${pot(98, 58, 24, 16)}${trail(104, 70, 30, -1)}${trail(116, 70, 22)}
        <ellipse cx="110" cy="56" rx="14" ry="6" fill="#6f9a52"/>
        <path d="M290 21 L282 50 M290 21 L298 50" stroke="#c9b48a" stroke-width="1"/>${pot(278, 50, 24, 16)}${trail(284, 62, 24, -1)}${trail(296, 62, 34)}
        <ellipse cx="290" cy="48" rx="14" ry="6" fill="#8dbb6c"/></g>`);
    }

    // Suoliukas
    if (has('bench')) {
      s.push(`<g transform="translate(-34 0)"><g${cls('bench')}><ellipse cx="212" cy="188" rx="58" ry="5" fill="#3b2312" opacity=".25"/>
        <rect x="160" y="144" width="104" height="9" rx="3" fill="url(#gWood)"/><rect x="160" y="156" width="104" height="9" rx="3" fill="url(#gWood)"/>
        <rect x="156" y="170" width="112" height="9" rx="3" fill="url(#gWood)"/>
        <path d="M166 179 V190 M258 179 V190 M168 140 V170 M256 140 V170" stroke="#5a3a22" stroke-width="5" stroke-linecap="round"/>
        <rect x="176" y="163" width="72" height="9" rx="4.5" fill="#8fa86e"/><rect x="190" y="150" width="22" height="16" rx="6" fill="#d9a07a" transform="rotate(-8 201 158)"/></g></g>`);
    }

    // Lentynėlė su vazonėliais
    if (has('shelf')) {
      s.push(`<g${cls('shelf')}><ellipse cx="335" cy="214" rx="36" ry="5" fill="#3b2312" opacity=".25"/>
        <path d="M306 214 L318 120 M366 214 L354 120" stroke="url(#gWoodV)" stroke-width="5" stroke-linecap="round"/>
        <rect x="306" y="140" width="60" height="5" rx="2" fill="url(#gWood)"/><rect x="302" y="168" width="68" height="5" rx="2" fill="url(#gWood)"/><rect x="298" y="196" width="76" height="5" rx="2" fill="url(#gWood)"/>
        ${pot(318, 128, 12, 12)}<path d="M324 128 l-5 -9 M324 128 l0 -11 M324 128 l5 -9" stroke="#6f9a52" stroke-width="3" stroke-linecap="round"/>
        ${pot(344, 128, 12, 12)}<circle cx="350" cy="122" r="5" fill="#e59aab"/><circle cx="350" cy="122" r="2" fill="#f3d27a"/>
        ${pot(310, 154, 15, 14)}<g fill="#8a4a8f"><circle cx="314" cy="148" r="4"/><circle cx="321" cy="146" r="4"/><circle cx="318" cy="152" r="3.5"/></g>
        ${pot(342, 154, 15, 14)}<g fill="#6f9a52"><ellipse cx="346" cy="148" rx="4" ry="6"/><ellipse cx="353" cy="148" rx="4" ry="6"/></g>
        ${pot(328, 180, 18, 16)}<path d="M332 180 Q330 166 336 162 M337 180 Q338 164 342 160 M342 180 Q346 168 348 166" stroke="#4f7a3e" stroke-width="3" fill="none" stroke-linecap="round"/></g>`);
    }

    // Monstera
    if (has('monstera')) {
      s.push(`<g${cls('monstera')}>
        ${mLeaf(62, 202, 0.42, -48)}${mLeaf(70, 200, 0.5, -12)}${mLeaf(84, 202, 0.44, 30)}${mLeaf(76, 206, 0.36, 62)}
        ${pot(50, 198, 46, 40)}</g>`);
    }

    // Purvas, piktžolės / auksiniai lapai
    if (!clean) {
      s.push(TUFTS.map(tuft).join(''));
      s.push([[90, 236, 20], [180, 244, 70], [240, 228, 130], [300, 240, 10], [40, 210, 160], [350, 224, 40], [130, 214, 100]].map(([x, y, r], i) => dryLeaf(x, y, r, i % 2 ? '#8a6a3a' : '#a07a40')).join(''));
      s.push(`<g fill="#a35a35" opacity=".85"><path d="M128 238 l10 -6 l4 8z"/><path d="M146 242 l8 2 l-4 6z"/></g>`);
    } else {
      s.push([[120, 240, 20], [190, 252, 70], [262, 236, 130], [36, 248, 10], [372, 236, 160], [300, 254, 40]].map(([x, y, r]) => dryLeaf(x, y, r, '#e9c25a')).join(''));
    }

    // Pūkis
    const expr = mood || (done === 0 ? 'sad' : done >= ITEMS.length ? 'happy' : 'normal');
    s.push(`<g class="g-pukis" transform="translate(206 150) scale(.42)"><ellipse cx="100" cy="246" rx="64" ry="9" fill="#3b2312" opacity=".3"/>${ART.pukisInner(expr)}</g>`);

    // Šviesa, vinjetė, grūdėtumas
    s.push(`<rect width="400" height="260" fill="#ffd98a" opacity="${clean ? 0.08 : 0.03}"/>
      <rect width="400" height="260" fill="url(#gVignette)"/>
      <rect width="400" height="260" filter="url(#fGrain)" opacity=".07" style="mix-blend-mode:multiply"/></svg>`);
    return s.join('');
  }

  // ================= 2 zona: Sodo kiemas =================
  const K = (e, t) => ({ who: 'Karolis', e, t });
  const P = (e, t) => ({ e, t });
  const YARD = [
    { id: 'mow', name: 'Nupjauti žolę', cost: 4,
      after: [P('happy', 'Žolė nupjauta! Dabar matau, kur baigiasi kiemas… ir kur prasideda tvenkinys.')] },
    { id: 'pond', name: 'Išvalyti tvenkinį', cost: 5,
      after: [P('excited', 'Vanduo vėl skaidrus! Žiūrėk – lelijos!'), K('sneaky', 'O dugne – mano blizgučių kolekcija… Ką? Nieko nesakiau.')] },
    { id: 'path', name: 'Nukloti akmenų taką', cost: 4,
      after: [K('happy', 'Akmenėliai! Gražūs, apvalūs… Gal vieną pasiimsiu?'), P('thinking', 'Karoli!')] },
    { id: 'beds', name: 'Įrengti daržo lysves', cost: 5,
      after: [P('happy', 'Lysvės paruoštos! Morkos, salotos, žirniai…'), K('happy', 'Ir slyvos? Aš labai mėgstu slyvas.'), P('wink', 'Slyvos auga medžiuose, Karoli.')] },
    { id: 'well', name: 'Atnaujinti šulinį', cost: 5,
      after: [P('excited', 'Šulinys vėl veikia! Dabar laistyti bus vienas malonumas.')] },
    { id: 'bridge', name: 'Pastatyti tiltelį', cost: 5,
      after: [K('surprised', 'Tiltelis! Dabar ir šunys gali pereiti tvenkinį sausomis kojomis.'), P('wink', 'Nebent kas nors įstumtų…'), K('sneaky', 'Aš? Niekada.')] },
    { id: 'beehive', name: 'Pastatyti avilį', cost: 6,
      after: [P('excited', 'Bitės! Jos apdulkins visą sodą.'), K('sad', 'Tik neikit per arti. Jos manęs nemėgsta. Nežinau kodėl.')] },
    { id: 'swing', name: 'Pakabinti sūpynes', cost: 6,
      after: [P('happy', 'Sūpynės ant senojo ąžuolo! Šeimininkė čia supdavosi dar būdama maža.')] },
    { id: 'gazebo', name: 'Pastatyti pavėsinę', cost: 7,
      after: [P('excited', 'Pavėsinė! Kiemas atgaivintas!'), K('happy', 'Ne blogai… Na gerai. Puikiai. Ačiū jums.'), P('happy', 'Sode darbų niekada nepritrūksta – greitai atsivers naujų kampelių!')] },
  ];

  const YARD_INTRO = [
    P('thinking', 'Ten, už tvoros – senasis kiemas. Seniai ten nebuvau…'),
    K('sneaky', 'Kar-kar! Kas čia lenda į MANO kiemą?'),
    P('surprised', 'Karolis?! Tai tu čia visą laiką gyvenai?'),
    K('normal', 'Kai visi išvažiavo, kažkas turėjo saugoti blizgučius… tai yra, kiemą.'),
    K('thinking', 'Tiesą sakant, vienam tvarkyti sunku. Gal… padėtumėt?'),
    P('happy', 'Žinoma! Kartu bus smagiau.'),
  ];

  function yard(done, fresh, mood) {
    const has = (id) => YARD.findIndex((x) => x.id === id) < done;
    const cls = (id) => (fresh === id ? ' class="appear"' : '');
    const mowed = has('mow');
    const s = [];
    s.push(`<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="gyS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mowed ? '#f0d08a' : '#d6cdaa'}"/><stop offset="1" stop-color="${mowed ? '#f6e8cc' : '#e6dfca'}"/></linearGradient>
      <linearGradient id="gyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mowed ? '#b9c784' : '#aba57c'}"/><stop offset="1" stop-color="${mowed ? '#7f9a58' : '#87835d'}"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#gyS)"/>
      <circle cx="70" cy="30" r="110" fill="url(#gSun)" opacity="${mowed ? 1 : 0.5}"/>`);
    const far = mowed ? ['#d9b04a', '#a9b47a', '#c99a3e', '#97aa6c', '#e3bd5a'] : ['#b5ab84', '#a39d7a', '#aca282', '#9b977a', '#b8ae88'];
    [[20, 98, 34], [70, 92, 30], [130, 100, 28], [270, 96, 34], [330, 90, 32], [390, 100, 30]].forEach(([x, y, r], i) =>
      s.push(`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="${far[i % far.length]}" opacity=".85"/>`));
    s.push(`<rect y="104" width="400" height="156" fill="url(#gyG)"/>`);

    // Senasis ąžuolas (visada)
    s.push(`<path d="M192 152 Q196 110 194 60 Q186 40 170 34 L176 30 Q192 38 200 52 Q206 36 226 28 L230 34 Q212 44 210 64 Q208 110 214 152Z" fill="url(#gWoodV)"/>
      <g fill="${mowed ? '#6f9a52' : '#8a8a62'}"><circle cx="160" cy="26" r="32"/><circle cx="204" cy="10" r="38"/><circle cx="250" cy="24" r="32"/><circle cx="130" cy="8" r="24"/><circle cx="282" cy="6" r="26"/></g>
      <g fill="${mowed ? '#8dbb6c' : '#9c9a72'}" opacity=".8"><circle cx="186" cy="2" r="22"/><circle cx="236" cy="12" r="18"/></g>`);

    // Sūpynės
    if (has('swing')) s.push(`<g${cls('swing')}><path d="M184 50 V128 M216 50 V128" stroke="#cdb487" stroke-width="1.6"/><rect x="178" y="126" width="44" height="7" rx="3" fill="url(#gWood)"/></g>`);

    // Pavėsinė (dešinėje, fone)
    s.push(has('gazebo')
      ? `<g${cls('gazebo')}><ellipse cx="335" cy="152" rx="50" ry="6" fill="#3b2312" opacity=".2"/>
         <path d="M290 92 L335 62 L380 92Z" fill="#9a5a3a" stroke="#6a3a22" stroke-width="1.5"/><path d="M298 92 L335 70 L372 92" fill="none" stroke="#c07a52" stroke-width="2"/>
         <rect x="288" y="92" width="94" height="6" fill="#f4ead6"/>
         <g fill="#f4ead6"><rect x="294" y="98" width="5" height="54"/><rect x="332" y="98" width="5" height="54"/><rect x="370" y="98" width="5" height="54"/></g>
         <path d="M294 132 H375 M294 140 H375" stroke="#f4ead6" stroke-width="2.5"/>
         <path d="M296 98 Q300 110 296 120 M373 98 Q368 112 374 124" stroke="#6f9a52" stroke-width="3" fill="none"/></g>`
      : `<g stroke="#8e877a" stroke-width="3" fill="none" opacity=".85"><path d="M296 152 V110"/><path d="M372 152 V118 L350 104"/><path d="M300 140 L340 152"/><path d="M318 120 L346 112"/></g>`);

    // Šulinys (kairėje, fone)
    s.push(has('well')
      ? `<g${cls('well')}><ellipse cx="56" cy="158" rx="30" ry="5" fill="#3b2312" opacity=".25"/>
         <rect x="32" y="122" width="48" height="34" rx="4" fill="url(#gStone)"/><ellipse cx="56" cy="122" rx="24" ry="6" fill="#4a5a5a"/>
         <path d="M36 132 H76 M36 144 H76 M48 122 V132 M64 132 V144 M50 144 V156" stroke="#6e655c" stroke-width="1.2"/>
         <path d="M36 122 V92 M76 122 V92" stroke="url(#gWoodV)" stroke-width="4"/><path d="M28 94 L56 76 L84 94Z" fill="#9a5a3a" stroke="#6a3a22" stroke-width="1.5"/>
         <path d="M56 96 V110" stroke="#cdb487" stroke-width="1.2"/><path d="M50 110 H62 L60 120 H52Z" fill="#8a6a46"/></g>`
      : `<g><rect x="32" y="130" width="48" height="26" rx="4" fill="url(#gStone)" opacity=".85"/><path d="M40 130 L46 124 L54 130 M62 130 L70 126" stroke="#6e655c" stroke-width="2" fill="none"/><path d="M36 130 L30 108 M76 130 L84 118" stroke="#7a6a58" stroke-width="3"/></g>`);

    // Tvenkinys
    s.push(has('pond')
      ? `<g${cls('pond')}><ellipse cx="128" cy="194" rx="92" ry="26" fill="#6e8a5a"/><ellipse cx="128" cy="192" rx="86" ry="22" fill="url(#gWater)"/>
         <path d="M70 186 Q100 182 130 186 M120 198 Q150 194 176 198" stroke="#e9f6f2" stroke-width="1.5" opacity=".6" fill="none"/>
         <g fill="#5f8f4e"><path d="M80 198 a9 5 0 1 0 1 0 l-1 5z"/><path d="M150 188 a8 4.5 0 1 0 1 0 l-1 4z"/><path d="M104 204 a7 4 0 1 0 1 0 l-1 4z"/></g>
         <circle cx="82" cy="196" r="3.2" fill="#f2c4cf"/><circle cx="152" cy="186" r="3" fill="#fff4f4"/>
         <g stroke="#5f7a3a" stroke-width="2" stroke-linecap="round"><path d="M40 196 q-2 -14 -6 -20"/><path d="M44 198 q0 -16 2 -22"/><path d="M212 194 q2 -12 6 -18"/></g>
         <ellipse cx="44" cy="176" rx="2.5" ry="6" fill="#7a5530"/><ellipse cx="217" cy="176" rx="2.5" ry="6" fill="#7a5530"/></g>`
      : `<g><ellipse cx="128" cy="194" rx="92" ry="26" fill="#77744e"/><ellipse cx="128" cy="192" rx="86" ry="22" fill="url(#gMurk)"/>
         <g fill="#7f8a3e" opacity=".8"><ellipse cx="96" cy="188" rx="16" ry="4"/><ellipse cx="150" cy="198" rx="20" ry="5"/><ellipse cx="120" cy="182" rx="10" ry="3"/></g>
         <path d="M168 186 l8 0 l2 -10 l6 0 l0 14 l-16 0z" fill="#4a3a2a"/></g>`);

    // Tiltelis
    if (has('bridge')) s.push(`<g${cls('bridge')}><path d="M168 202 Q196 172 228 202" stroke="url(#gWood)" stroke-width="9" fill="none"/>
      <path d="M170 190 Q196 160 226 190" stroke="#7a5236" stroke-width="2.5" fill="none"/>
      <path d="M176 198 V186 M188 190 V174 M198 188 V170 M208 190 V174 M220 198 V184" stroke="#7a5236" stroke-width="2"/></g>`);

    // Akmenų takas
    if (has('path')) s.push(`<g${cls('path')}>${[[252, 250, 13], [262, 230, 11], [276, 212, 10], [292, 196, 9], [306, 182, 8], [318, 170, 7], [328, 160, 6]].map(([x, y, r]) =>
      `<ellipse cx="${x}" cy="${y + 2}" rx="${r}" ry="${r * 0.45}" fill="#3b2312" opacity=".2"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.45}" fill="url(#gStone)"/>`).join('')}</g>`);

    // Daržo lysvės
    if (has('beds')) {
      const veg = (x, y, i) => i % 3 === 0
        ? `<circle cx="${x}" cy="${y}" r="6" fill="#8fbf6a"/><circle cx="${x}" cy="${y}" r="3.5" fill="#c7e3a2"/>`
        : i % 3 === 1 ? `<path d="M${x} ${y + 3} l-4 -9 M${x} ${y + 3} l0 -11 M${x} ${y + 3} l4 -9" stroke="#5f8f4e" stroke-width="2.2" stroke-linecap="round"/><path d="M${x - 2} ${y + 3} h4 l-2 5z" fill="#e2803a"/>`
          : `<path d="M${x} ${y + 4} q-6 -6 -2 -12 q4 4 2 12 q6 -6 2 -12" fill="#7fae5a"/>`;
      s.push(`<g${cls('beds')}><ellipse cx="338" cy="246" rx="60" ry="6" fill="#3b2312" opacity=".25"/>
        <rect x="286" y="208" width="100" height="16" rx="2" fill="url(#gWood)"/><rect x="290" y="204" width="92" height="8" fill="#6a4a30"/>
        <rect x="280" y="232" width="112" height="16" rx="2" fill="url(#gWood)"/><rect x="284" y="228" width="104" height="8" fill="#6a4a30"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => veg(298 + i * 15, 202, i)).join('')}${[0, 1, 2, 3, 4, 5, 6].map((i) => veg(292 + i * 15, 226, i + 1)).join('')}</g>`);
    }

    // Avilys
    if (has('beehive')) s.push(`<g${cls('beehive')}><ellipse cx="38" cy="246" rx="24" ry="5" fill="#3b2312" opacity=".25"/>
      <rect x="20" y="214" width="36" height="12" fill="#e9c46a" stroke="#a8782a" stroke-width="1.2"/><rect x="20" y="226" width="36" height="12" fill="#dcb256" stroke="#a8782a" stroke-width="1.2"/>
      <path d="M16 214 L38 202 L60 214Z" fill="#9a5a3a"/><rect x="34" y="232" width="8" height="4" fill="#5a3a20"/>
      <rect x="22" y="238" width="4" height="8" fill="#6a4a30"/><rect x="50" y="238" width="4" height="8" fill="#6a4a30"/>
      <g fill="#3a2a10">${[[66, 206], [74, 196], [60, 192], [80, 210]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.6"/><ellipse cx="${x}" cy="${y - 2}" rx="1.6" ry="1" fill="#fff" opacity=".7"/>`).join('')}</g></g>`);

    // Nepjauta žolė
    if (!mowed) {
      const tall = [[20, 200], [60, 214], [100, 230], [150, 226], [196, 240], [240, 220], [280, 236], [320, 214], [360, 230], [390, 210],
        [40, 250], [130, 252], [230, 254], [300, 252], [370, 254], [250, 160], [290, 170], [110, 150], [20, 160], [380, 170]];
      s.push(tall.map(([x, y], i) => {
        const h = 22 + (i % 5) * 5;
        return `<g stroke="${i % 3 ? '#6d7a3c' : '#837444'}" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M${x} ${y} q-5 ${-h * 0.6} -10 ${-h}"/><path d="M${x} ${y} q1 ${-h * 0.7} 3 ${-h - 4}"/><path d="M${x} ${y} q6 ${-h * 0.5} 11 ${-h * 0.9}"/><path d="M${x + 4} ${y} q4 ${-h * 0.4} 2 ${-h * 0.8}"/></g>`;
      }).join(''));
    } else {
      s.push(`<g>${[[70, 236, '#e59aab'], [96, 248, '#f3d27a'], [230, 246, '#fffaf0'], [262, 254, '#e59aab'], [150, 240, '#c9a6e0']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${c}"/>`).join('')}</g>`);
    }

    // Veikėjai
    const expr = mood || (done === 0 ? 'thinking' : done >= YARD.length ? 'happy' : 'normal');
    s.push(`<path d="M206 104 Q236 96 270 94" stroke="url(#gWood)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M262 94 q6 -8 12 -6 q-4 6 -12 6z" fill="${mowed ? '#8dbb6c' : '#9c9a72'}"/>`);
    s.push(`<g transform="translate(222 36) scale(.24)"><g class="crow">${ART.crowInner(done >= YARD.length ? 'happy' : done === 0 ? 'sneaky' : 'normal')}</g></g>`);
    s.push(`<g class="g-pukis" transform="translate(196 156) scale(.38)"><ellipse cx="100" cy="246" rx="64" ry="9" fill="#3b2312" opacity=".3"/>${ART.pukisInner(expr)}</g>`);

    s.push(`<rect width="400" height="260" fill="#ffd98a" opacity="${mowed ? 0.08 : 0.03}"/>
      <rect width="400" height="260" fill="url(#gVignette)"/>
      <rect width="400" height="260" filter="url(#fGrain)" opacity=".07" style="mix-blend-mode:multiply"/></svg>`);
    return s.join('');
  }

  // ================= 3 zona: Daržas =================
  const D = (e, t) => ({ who: 'Dygliukas', e, t });
  const DARZAS = [
    { id: 'dig', name: 'Sukasti dirvą', cost: 4,
      after: [D('happy', 'Purios žemės kvapas! Dabar kurmiams bus sunkiau slėptis.')] },
    { id: 'rows', name: 'Pasodinti daržovių eiles', cost: 5,
      after: [P('excited', 'Morkos, burokėliai, salotos – viskas eilutėmis!'), D('thinking', 'Kreivokos tos eilutės… Bet tinka.')] },
    { id: 'compost', name: 'Įrengti kompostą', cost: 4,
      after: [D('happy', 'Kompostas – daržo širdis. Iš lapų ir žievelių užaugs nauja žemė.'), K('sad', 'Ten nieko blizgančio. Patikrinau.')] },
    { id: 'scarecrow', name: 'Pastatyti baidyklę', cost: 5,
      after: [K('surprised', 'KAR! Kas ten stovi?!'), P('wink', 'Tai tik baidyklė, Karoli.'), K('sneaky', 'Žinojau. Tiesiog… tikrinau jus.')] },
    { id: 'pumpkins', name: 'Užauginti moliūgus', cost: 5,
      after: [P('excited', 'Moliūgai! Kokie dideli ir apvalūs!'), D('happy', 'Rudenį iš jų virsim sriubą visam kiemui.')] },
    { id: 'shed', name: 'Atnaujinti įrankių pašiūrę', cost: 6,
      after: [D('happy', 'Pagaliau mano grėbliai ir kastuvai turi namus.')] },
    { id: 'trees', name: 'Pasodinti vaismedžių eilę', cost: 6,
      after: [P('happy', 'Kriaušės, slyvos, vyšnios…'), K('excited', 'SLYVOS! Pagaliau!')] },
    { id: 'cart', name: 'Sutaisyti vežimėlį', cost: 5,
      after: [D('normal', 'Dabar derlių vešim vežimėliu, o ne nešiosim po vieną.')] },
    { id: 'sunflowers', name: 'Saulėgrąžų siena', cost: 7,
      after: [P('excited', 'Saulėgrąžos – kaip mažos saulės! Daržas atgaivintas!'), D('happy', 'Dvidešimt rudenų laukiau tokio daržo. Ačiū jums.'), K('happy', 'Ir sėklų bus visai žiemai. Puiku.')] },
  ];
  const DARZAS_INTRO = [
    P('thinking', 'Kiemas sutvarkytas… O kas ten, už senųjų vartų?'),
    K('sneaky', 'Daržas. Bet ten gyvena… jis.'),
    D('surprised', 'Kas čia trypia mano lysves?!'),
    P('happy', 'Labas! Aš Pūkis, o čia Karolis. Mes tvarkom sodą.'),
    D('thinking', 'Hmm… Aš Dygliukas. Prižiūriu šį daržą jau dvidešimt rudenų. Bet kurmiai… jie mane varo iš proto.'),
    D('happy', 'Jei padėsite juos išprašyti – kartu atgaivinsim daržą!'),
    K('sneaky', 'Kurmiai blizgučių nerenka. Aš už.'),
  ];

  function darzas(done, fresh, mood) {
    const has = (id) => DARZAS.findIndex((x) => x.id === id) < done;
    const cls = (id) => (fresh === id ? ' class="appear"' : '');
    const dug = has('dig');
    const s = [];
    s.push(`<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="gdzS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dug ? '#f2cf86' : '#d8cfac'}"/><stop offset="1" stop-color="${dug ? '#f7e7c6' : '#e7dfc9'}"/></linearGradient>
      <linearGradient id="gdzG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dug ? '#bcc47e' : '#aaa47a'}"/><stop offset="1" stop-color="${dug ? '#8f9a5a' : '#88845e'}"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#gdzS)"/>
      <circle cx="200" cy="20" r="120" fill="url(#gSun)" opacity="${dug ? 1 : 0.5}"/>`);
    const far = dug ? ['#d9b04a', '#a9b47a', '#c99a3e', '#97aa6c'] : ['#b5ab84', '#a39d7a', '#aca282', '#9b977a'];
    [[30, 92, 30], [90, 98, 26], [310, 96, 30], [380, 90, 28]].forEach(([x, y, r], i) => s.push(`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="${far[i]}" opacity=".85"/>`));
    s.push(`<rect y="100" width="400" height="160" fill="url(#gdzG)"/>`);
    // Sena tvora fone
    s.push(`<g fill="${dug ? '#a07a52' : '#8a7c68'}">${[110, 130, 150, 170, 190, 210, 230, 250, 270, 290].map((x, i) => `<rect x="${x}" y="${dug || i % 3 ? 104 : 112}" width="6" height="${dug || i % 3 ? 30 : 22}" rx="2"/>`).join('')}<rect x="106" y="112" width="194" height="3" rx="1.5"/><rect x="106" y="124" width="194" height="3" rx="1.5"/></g>`);

    // Saulėgrąžos prie tvoros
    if (has('sunflowers')) {
      let f = '';
      [118, 142, 166, 190, 214, 238, 262, 286].forEach((x, i) => {
        const y = 66 + (i % 2) * 8;
        f += `<path d="M${x} 134 V${y}" stroke="#5f8a3a" stroke-width="3"/><path d="M${x} ${y + 30} q-10 -6 -14 2 q8 4 14 -2z M${x} ${y + 44} q10 -6 14 2 q-8 4 -14 -2z" fill="#6f9a52"/>`;
        f += `<g>${Array.from({ length: 12 }, (_, k) => `<ellipse cx="${x}" cy="${y - 9}" rx="3" ry="6" transform="rotate(${k * 30} ${x} ${y})" fill="#f2c14e"/>`).join('')}<circle cx="${x}" cy="${y}" r="5.5" fill="#6b4226"/></g>`;
      });
      s.push(`<g${cls('sunflowers')}>${f}</g>`);
    }
    // Vaismedžių eilė
    if (has('trees')) {
      const fruit = ['#c9603a', '#8a55a6', '#d9432f', '#e2a83c'];
      s.push(`<g${cls('trees')}>${[318, 348, 378].map((x, i) => `<rect x="${x - 3}" y="108" width="6" height="30" fill="url(#gWoodV)"/><circle cx="${x}" cy="98" r="18" fill="${i % 2 ? '#6f9a52' : '#5f8a48'}"/><circle cx="${x - 6}" cy="94" r="3" fill="${fruit[i]}"/><circle cx="${x + 7}" cy="100" r="3" fill="${fruit[i]}"/><circle cx="${x + 1}" cy="88" r="3" fill="${fruit[i]}"/>`).join('')}</g>`);
    }
    // Pašiūrė
    s.push(has('shed')
      ? `<g${cls('shed')}><ellipse cx="54" cy="150" rx="44" ry="5" fill="#3b2312" opacity=".2"/><rect x="16" y="92" width="76" height="56" fill="url(#gWood)"/>
         <path d="M10 94 L54 66 L98 94Z" fill="#8f4a2e" stroke="#5e2c18" stroke-width="1.5"/><rect x="42" y="110" width="22" height="38" fill="#6a4630"/><circle cx="59" cy="130" r="1.6" fill="#e2c27a"/>
         <path d="M22 100 V146 M32 100 V146 M74 100 V146 M84 100 V146" stroke="#6a4630" stroke-width="1" opacity=".6"/>
         <path d="M70 106 L82 140 M80 104 L72 140" stroke="#5a3a22" stroke-width="2.5"/><rect x="66" y="102" width="20" height="5" fill="#9ea2a0"/></g>`
      : `<g opacity=".85"><rect x="16" y="110" width="76" height="38" fill="#8a7c68"/><path d="M12 112 L40 92 M60 96 L96 112" stroke="#7a6a58" stroke-width="4"/><path d="M40 112 L44 148 M70 116 L64 148" stroke="#6a5a48" stroke-width="2"/></g>`);

    // Dirva ir daržovių eilės
    if (dug) {
      s.push(`<g${cls('dig')}><path d="M40 170 L360 170 L400 236 L0 236Z" fill="#7a5233"/>${[178, 192, 208, 224].map((y) => `<path d="M${30 - (y - 170) * 0.5} ${y} H${370 + (y - 170) * 0.5}" stroke="#5e3d24" stroke-width="3" opacity=".7"/>`).join('')}</g>`);
    }
    if (has('rows')) {
      let v = '';
      [178, 192, 208, 224].forEach((y, ri) => {
        for (let x = 50 - (y - 170) * 0.4; x < 360 + (y - 170) * 0.4; x += 22) {
          if (ri % 2) v += `<path d="M${x} ${y} l-3 -9 M${x} ${y} l0 -11 M${x} ${y} l3 -9" stroke="#5f8f4e" stroke-width="2" stroke-linecap="round"/>`;
          else v += `<circle cx="${x}" cy="${y - 4}" r="5" fill="#8fbf6a"/><circle cx="${x}" cy="${y - 4}" r="2.6" fill="#c7e3a2"/>`;
        }
      });
      s.push(`<g${cls('rows')}>${v}</g>`);
    }
    // Baidyklė
    if (has('scarecrow')) {
      s.push(`<g${cls('scarecrow')}><path d="M200 196 V96" stroke="#7a5236" stroke-width="5"/><path d="M168 122 H232" stroke="#7a5236" stroke-width="4"/>
        <path d="M184 118 H216 L222 160 H178Z" fill="#a8483a"/><path d="M186 130 H214 M184 144 H218 M196 118 V160 M206 118 V160" stroke="#f2c14e" stroke-width="1.4" opacity=".8"/>
        <path d="M168 122 l-6 6 M168 122 l-6 -4 M232 122 l6 6 M232 122 l6 -4" stroke="#e2c27a" stroke-width="2"/>
        <circle cx="200" cy="100" r="13" fill="#e9d2a0"/><circle cx="195" cy="98" r="1.8" fill="#3a2a22"/><circle cx="205" cy="98" r="1.8" fill="#3a2a22"/><path d="M194 105 Q200 109 206 105" stroke="#3a2a22" stroke-width="1.5" fill="none"/>
        <ellipse cx="200" cy="88" rx="22" ry="4" fill="#c49b52"/><path d="M188 88 Q188 72 200 72 Q212 72 212 88Z" fill="#c49b52"/></g>`);
    }
    // Kompostas
    if (has('compost')) s.push(`<g${cls('compost')}><ellipse cx="362" cy="214" rx="30" ry="4" fill="#3b2312" opacity=".25"/><rect x="336" y="176" width="52" height="36" fill="url(#gWood)"/><path d="M336 186 H388 M336 198 H388" stroke="#5a3a22" stroke-width="1.5"/><path d="M340 176 Q350 166 362 172 Q374 164 384 176Z" fill="#6a4a2a"/><path d="M350 170 q4 -6 8 -2 M368 168 q4 -4 8 0" stroke="#8dbb6c" stroke-width="2" fill="none"/></g>`);
    // Moliūgai
    if (has('pumpkins')) {
      const pk = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.25}" ry="${r}" fill="#e2803a" stroke="#a8541c" stroke-width="1.2"/><path d="M${x} ${y - r} V${y + r} M${x - r * 0.6} ${y - r * 0.8} Q${x - r * 0.8} ${y} ${x - r * 0.6} ${y + r * 0.8} M${x + r * 0.6} ${y - r * 0.8} Q${x + r * 0.8} ${y} ${x + r * 0.6} ${y + r * 0.8}" stroke="#c4682a" stroke-width="1.2" fill="none"/><path d="M${x} ${y - r} q1 -6 5 -7" stroke="#5f7a3a" stroke-width="2.5" fill="none"/>`;
      s.push(`<g${cls('pumpkins')}><path d="M20 238 Q60 226 110 240" stroke="#5f8f4e" stroke-width="2" fill="none"/>${pk(36, 238, 12)}${pk(72, 244, 9)}${pk(100, 236, 11)}<path d="M50 230 q-8 -8 -2 -12 q6 2 2 12z M86 236 q8 -8 12 -2 q-4 6 -12 2z" fill="#6f9a52"/></g>`);
    }
    // Vežimėlis
    if (has('cart')) s.push(`<g${cls('cart')}><ellipse cx="282" cy="250" rx="34" ry="4" fill="#3b2312" opacity=".25"/><path d="M252 222 H312 L306 240 H258Z" fill="url(#gWood)" stroke="#5a3a22" stroke-width="1.5"/><circle cx="268" cy="244" r="8" fill="none" stroke="#5a3a22" stroke-width="3"/><circle cx="298" cy="244" r="8" fill="none" stroke="#5a3a22" stroke-width="3"/><path d="M312 224 L336 214" stroke="#5a3a22" stroke-width="3"/>
      <circle cx="266" cy="218" r="6" fill="#e2803a"/><circle cx="280" cy="216" r="6" fill="#8fbf6a"/><circle cx="294" cy="218" r="6" fill="#d9432f"/><path d="M302 220 l6 -10 M304 220 l2 -11" stroke="#5f8f4e" stroke-width="2"/></g>`);

    // Kurmių kauburėliai, kol nesukasta
    if (!dug) {
      s.push([[60, 200], [140, 226], [220, 196], [300, 230], [350, 190], [100, 250]].map(([x, y]) => `<path d="M${x - 14} ${y} Q${x} ${y - 14} ${x + 14} ${y}Z" fill="#7a5233"/><circle cx="${x - 5}" cy="${y - 4}" r="2" fill="#9a6c46"/>`).join(''));
      s.push([[30, 186], [90, 214], [170, 192], [250, 214], [330, 200], [380, 240], [200, 248]].map(([x, y], i) => `<g stroke="${i % 2 ? '#6d7a3c' : '#837444'}" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M${x} ${y} q-5 -12 -9 -20"/><path d="M${x} ${y} q1 -14 3 -24"/><path d="M${x} ${y} q6 -10 10 -18"/></g>`).join(''));
    }

    // Veikėjai: Pūkis, Dygliukas, Karolis (ant baidyklės arba tvoros)
    const expr = mood || (done === 0 ? 'thinking' : done >= DARZAS.length ? 'happy' : 'normal');
    s.push(`<g class="g-pukis" transform="translate(126 150) scale(.38)"><ellipse cx="100" cy="246" rx="64" ry="9" fill="#3b2312" opacity=".3"/>${ART.pukisInner(expr)}</g>`);
    s.push(`<g transform="translate(220 176) scale(.3)"><ellipse cx="100" cy="240" rx="70" ry="9" fill="#3b2312" opacity=".3"/>${ART.hedgeInner(done >= DARZAS.length ? 'happy' : done === 0 ? 'sad' : 'normal')}</g>`);
    s.push(has('scarecrow')
      ? `<g transform="translate(212 74) scale(.2)">${ART.crowInner('sneaky')}</g>`
      : `<g transform="translate(270 80) scale(.2)">${ART.crowInner('normal')}</g>`);

    s.push(`<rect width="400" height="260" fill="#ffd98a" opacity="${dug ? 0.08 : 0.03}"/>
      <rect width="400" height="260" fill="url(#gVignette)"/>
      <rect width="400" height="260" filter="url(#fGrain)" opacity=".07" style="mix-blend-mode:multiply"/></svg>`);
    return s.join('');
  }

  // ================= 4 zona: Bitynas =================
  const Z = (e, t) => ({ who: 'Zuzė', e, t });
  const BITYNAS = [
    { id: 'nettles', name: 'Išrauti dilgėles', cost: 4,
      after: [P('happy', 'Dilgėlės lauk! Dabar čia galima vaikščioti nesikasant.'), Z('happy', 'Bzz! Pagaliau matau savo pievą!')] },
    { id: 'lavender', name: 'Pasodinti levandas', cost: 5,
      after: [Z('excited', 'Levandos! Mano mėgstamiausias kvapas. Bzz-bzz!')] },
    { id: 'hives', name: 'Pastatyti avilių eilę', cost: 5,
      after: [Z('happy', 'Nauji namai mano seserims! Netrukus jų atskris visas spiečius.'), K('sad', 'Spiečius… Aš būsiu ant tvoros. Toli.')] },
    { id: 'clover', name: 'Užsėti dobilų pievą', cost: 5,
      after: [P('excited', 'Dobilai! Gal rasiu keturlapį?'), Z('wink', 'Jei rasi – sakyk man pirmai.')] },
    { id: 'water', name: 'Įrengti bičių girdyklą', cost: 5,
      after: [Z('happy', 'Bitės irgi trokšta! Su akmenėliais, kad nenuskęstume.')] },
    { id: 'linden', name: 'Pasodinti liepą', cost: 6,
      after: [D('happy', 'Liepų medus – pats geriausias. Žinau iš patirties.'), Z('excited', 'Liepa! Po metų iš jos bus aukso spalvos medus!')] },
    { id: 'honeyhouse', name: 'Pastatyti medaus namelį', cost: 6,
      after: [Z('happy', 'Čia laikysim medų, vašką ir žvakes. Bzz – tikra karalystė!')] },
    { id: 'table', name: 'Medaus degustacijos stalas', cost: 6,
      after: [P('excited', 'Medus su blyneliais!'), D('wink', 'Ir su liepžiedžių arbata.'), K('happy', 'O man – su riešutais. Ačiū.')] },
    { id: 'sundial', name: 'Saulės laikrodis', cost: 7,
      after: [Z('excited', 'Bitynas atgaivintas! Ačiū jums, bzz!'), P('happy', 'Kiek daug nuveikėm… Bet sode visada atsiras naujų kampelių!')] },
  ];
  const BITYNAS_INTRO = [
    P('surprised', 'Girdi tą zvimbimą? Už daržo – senasis bitynas!'),
    Z('surprised', 'Bzz! Svečiai? Pagaliau!'),
    Z('normal', 'Aš Zuzė – vyriausioji šio bityno bitė. Na… vienintelė likusi.'),
    Z('sad', 'Koriai sulaukėjo, medus laša kur papuolė. Lipnu visur!'),
    D('happy', 'Bitės – geriausios daržo draugės. Padėsim, Zuze!'),
    Z('happy', 'Bzz-puiku! Medumi apsemtų elementų pajudinti negalima – bet juos galima surinkti!'),
    K('sneaky', 'Medus blizga? …Ne? Tai gerai. Vis tiek padėsiu.'),
  ];

  function bitynas(done, fresh, mood) {
    const has = (id) => BITYNAS.findIndex((x) => x.id === id) < done;
    const cls = (id) => (fresh === id ? ' class="appear"' : '');
    const clean = has('nettles');
    const s = [];
    s.push(`<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="gbS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${clean ? '#f4d38c' : '#d8cfac'}"/><stop offset="1" stop-color="${clean ? '#f8e9cc' : '#e7dfc9'}"/></linearGradient>
      <linearGradient id="gbG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${clean ? '#c2cc84' : '#aaa47a'}"/><stop offset="1" stop-color="${clean ? '#8fa35a' : '#88845e'}"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#gbS)"/>
      <circle cx="90" cy="34" r="110" fill="url(#gSun)" opacity="${clean ? 1 : 0.5}"/>
      <path d="M0 112 Q70 82 150 104 Q240 78 320 100 Q370 88 400 98 V130 H0Z" fill="${clean ? '#a9c07a' : '#a7ab7a'}"/>
      <rect y="108" width="400" height="152" fill="url(#gbG)"/>`);
    // Medaus namelis (fone kairėje)
    s.push(has('honeyhouse')
      ? `<g${cls('honeyhouse')}><rect x="22" y="96" width="70" height="50" fill="url(#gWood)"/><path d="M14 98 L57 70 L100 98Z" fill="#c4673d" stroke="#8f4523" stroke-width="1.5"/>
         <rect x="48" y="114" width="18" height="32" fill="#6a4630"/><circle cx="63" cy="130" r="1.5" fill="#e2c27a"/>
         <rect x="28" y="106" width="14" height="12" fill="#fff3c4" stroke="#6a4630" stroke-width="1.5"/>
         <polygon points="${hex(78, 112, 7)}" fill="#f2b43c" stroke="#a8641a" stroke-width="1.5"/></g>`
      : `<g opacity=".85"><rect x="22" y="112" width="70" height="34" fill="#8a7c68"/><path d="M18 114 L44 96 M70 98 L98 114" stroke="#7a6a58" stroke-width="4"/></g>`);
    // Liepa (dešinėje)
    s.push(has('linden')
      ? `<g${cls('linden')}><path d="M340 160 Q336 120 338 96 L348 96 Q350 122 352 160Z" fill="url(#gWoodV)"/>
         <g fill="#7fa65a"><circle cx="344" cy="74" r="36"/><circle cx="314" cy="90" r="22"/><circle cx="374" cy="90" r="22"/><circle cx="344" cy="50" r="24"/></g>
         <g fill="#f3e08a">${[[326, 70], [356, 58], [364, 86], [334, 94], [348, 40], [318, 84]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g></g>`
      : `<g stroke="#7a6a58" stroke-width="4" stroke-linecap="round" fill="none"><path d="M344 160 V110"/><path d="M344 124 L330 106 M344 116 L358 100"/></g>`);
    // Levandų eilės
    if (has('lavender')) {
      let l = '';
      [[110, 150], [140, 156], [170, 150], [230, 154], [260, 150], [290, 156]].forEach(([x, y]) => {
        l += `<ellipse cx="${x}" cy="${y + 6}" rx="14" ry="5" fill="#6f8f5a"/>`;
        for (let k = -2; k <= 2; k++) l += `<path d="M${x + k * 5} ${y + 6} q${k} -12 ${k * 2} -20" stroke="#6f8f5a" stroke-width="1.5" fill="none"/><ellipse cx="${x + k * 5 + k * 2}" cy="${y - 16}" rx="2.6" ry="6" fill="#9b7fc0"/>`;
      });
      s.push(`<g${cls('lavender')}>${l}</g>`);
    }
    // Dobilų pieva
    if (has('clover')) s.push(`<g${cls('clover')}>${[[40, 220], [80, 236], [130, 228], [270, 238], [320, 224], [370, 240], [200, 250]].map(([x, y]) =>
      `<g fill="#6f9a52"><circle cx="${x - 4}" cy="${y}" r="4"/><circle cx="${x + 4}" cy="${y}" r="4"/><circle cx="${x}" cy="${y - 5}" r="4"/></g><circle cx="${x + 9}" cy="${y - 10}" r="4" fill="#e59aab"/><circle cx="${x + 9}" cy="${y - 10}" r="1.6" fill="#fff"/>`).join('')}</g>`);
    // Avilių eilė
    if (has('hives')) {
      const hv = (x, c) => `<ellipse cx="${x + 16}" cy="${186}" rx="20" ry="3" fill="#3b2312" opacity=".25"/><rect x="${x}" y="156" width="32" height="28" fill="${c}" stroke="#8a5a16" stroke-width="1.2"/><path d="M${x} 170 H${x + 32}" stroke="#8a5a16" stroke-width="1"/><path d="M${x - 4} 158 L${x + 16} 146 L${x + 36} 158Z" fill="#c4673d"/><rect x="${x + 12}" y="178" width="8" height="3" fill="#3a2a1a"/>`;
      s.push(`<g${cls('hives')}>${hv(150, '#f2c14e')}${hv(192, '#e9d2a0')}${hv(234, '#a9c8d6')}</g>`);
    }
    // Girdykla
    if (has('water')) s.push(`<g${cls('water')}><ellipse cx="312" cy="200" rx="26" ry="5" fill="#3b2312" opacity=".25"/><path d="M288 186 H336 L330 198 H294Z" fill="url(#gWood)"/><ellipse cx="312" cy="186" rx="24" ry="5" fill="#6cc3f0"/><g fill="#b5afa8"><circle cx="304" cy="186" r="3"/><circle cx="318" cy="185" r="2.5"/></g></g>`);
    // Degustacijos stalas
    if (has('table')) s.push(`<g${cls('table')}><ellipse cx="96" cy="206" rx="34" ry="4" fill="#3b2312" opacity=".25"/><rect x="62" y="184" width="68" height="6" rx="2" fill="url(#gWood)"/><path d="M68 190 V206 M124 190 V206" stroke="#6a4630" stroke-width="4"/>
      ${[[74, 0], [92, 1], [110, 0]].map(([x, i]) => `<rect x="${x}" y="${170 + i * 2}" width="12" height="${14 - i * 2}" rx="2" fill="#f2b43c" stroke="#a8641a" stroke-width="1"/><rect x="${x - 1}" y="${168 + i * 2}" width="14" height="3" fill="#e9d2a0"/>`).join('')}</g>`);
    // Saulės laikrodis
    if (has('sundial')) s.push(`<g${cls('sundial')}><rect x="194" y="200" width="12" height="26" fill="#cfc7bb" stroke="#8a8178" stroke-width="1.2"/><ellipse cx="200" cy="200" rx="18" ry="5" fill="#e6dfd2" stroke="#8a8178" stroke-width="1.2"/><path d="M200 200 L208 192 V200Z" fill="#8a6420"/><ellipse cx="200" cy="228" rx="16" ry="3" fill="#3b2312" opacity=".25"/></g>`);
    // Dilgėlės, kol neišrautos
    if (!clean) {
      s.push([[30, 196], [70, 214], [118, 190], [160, 230], [210, 204], [250, 226], [300, 196], [340, 220], [380, 204], [100, 246], [280, 250]].map(([x, y], i) => {
        const h = 22 + (i % 4) * 6;
        return `<g stroke="#5f7a3a" stroke-width="2" fill="none"><path d="M${x} ${y} V${y - h}"/></g><g fill="#6d8a44">${[0.3, 0.55, 0.8].map((k) => `<path d="M${x} ${y - h * k} q-8 -2 -10 -8 q6 0 10 6z M${x} ${y - h * k - 3} q8 -2 10 -8 q-6 0 -10 6z"/>`).join('')}</g>`;
      }).join(''));
    }
    // Veikėjai
    const expr = mood || (done === 0 ? 'surprised' : done >= BITYNAS.length ? 'happy' : 'normal');
    s.push(`<g class="g-pukis" transform="translate(140 160) scale(.36)"><ellipse cx="100" cy="246" rx="64" ry="9" fill="#3b2312" opacity=".3"/>${ART.pukisInner(expr)}</g>`);
    s.push(`<g transform="translate(232 96) scale(.26)"><g class="bee">${ART.beeInner(done >= BITYNAS.length ? 'happy' : done === 0 ? 'sad' : 'normal')}</g></g>`);
    s.push(`<g transform="translate(246 182) scale(.26)">${ART.hedgeInner(done >= BITYNAS.length ? 'happy' : 'normal')}</g>`);
    s.push(`<rect width="400" height="260" fill="#ffd98a" opacity="${clean ? 0.08 : 0.03}"/>
      <rect width="400" height="260" fill="url(#gVignette)"/>
      <rect width="400" height="260" filter="url(#fGrain)" opacity=".07" style="mix-blend-mode:multiply"/></svg>`);
    return s.join('');
  }
  const hex = (x, y, r) => Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

  // ================= 5 zona: Oranžerija =================
  const V = (e, t) => ({ who: 'Kvaksė', e, t });
  const ORANZERIJA = [
    { id: 'glass', name: 'Nuvalyti stiklus', cost: 4,
      after: [P('excited', 'Kiek šviesos! Pro švarius stiklus matosi visas sodas.'), V('happy', 'Kva! Pagaliau matau savo publiką!')] },
    { id: 'fountain', name: 'Atgaivinti fontaną', cost: 5,
      after: [V('excited', 'Mano scena! Tai yra… mano fontanas. Kva-kva-kva!'), K('surprised', 'Ji dainuoja. Kiekvieną rytą?')] },
    { id: 'orchids', name: 'Pasodinti orchidėjas', cost: 5,
      after: [P('happy', 'Orchidėjos! Jos atrodo kaip mažos peteliškės.'), V('wink', 'Beveik tokios gražios kaip aš.')] },
    { id: 'citrus', name: 'Citrinmedžiai vazonuose', cost: 5,
      after: [D('happy', 'Citrinos oranžerijoje – kaip pietuose. Šilta ir kvapnu.')] },
    { id: 'shelves', name: 'Daigų stelažai', cost: 5,
      after: [P('thinking', 'Šimtas mažų vazonėlių… Kiekvienam reikės vardo.'), Z('happy', 'Bzz! Aš pirmoji apžiūrėsiu žiedus!')] },
    { id: 'palm', name: 'Pasodinti palmę', cost: 6,
      after: [V('excited', 'Palmė! Dabar čia tikri tropikai. Kva!'), K('happy', 'Iš viršaus matysis visas sodas. Mano naujas sargo bokštas.')] },
    { id: 'butterflies', name: 'Drugelių kampelis', cost: 6,
      after: [P('excited', 'Drugeliai! Tik nebandyk jų gaudyti, Kvakse.'), V('sad', 'Net minčių tokių nebuvo… beveik.')] },
    { id: 'teatable', name: 'Arbatos staliukas', cost: 6,
      after: [P('happy', 'Pinti krėsliukai ir arbata tarp gėlių. Tobula.'), Z('wink', 'Su medumi, žinoma.'), D('happy', 'Ir su obuolių pyragu.')] },
    { id: 'chandelier', name: 'Uždegti senąjį šviestuvą', cost: 7,
      after: [V('excited', 'Šviesos! Muzika! Oranžerija atgaivinta! Kva-a-a!'), P('happy', 'Dabar visas sodas gyvas. Ačiū tau – be tavęs nebūtume susitvarkę.')] },
  ];
  const ORANZERIJA_INTRO = [
    Z('surprised', 'Bzz! Už liepų – senoji stiklinė oranžerija! Ten seniai niekas neužsuko.'),
    P('thinking', 'Stiklai aprasoję… Bet viduje kažkas dainuoja?'),
    V('excited', 'Kva-a-a! Pagaliau publika! Aš Kvaksė – šios oranžerijos primadona!'),
    V('sad', 'Tik va… gėlės vazonuose nudžiūvo. Be žiedų nėra kam dainuoti.'),
    P('happy', 'Mes padėsim! Pasodinsim naujų žiedų.'),
    V('happy', 'Kva! Kiekvienam vazonui reikia savo spalvos žiedų. Sudėk eilę tos spalvos šalia – ir jie pasodinti!'),
    K('sneaky', 'O dainuosi tik dieną, tiesa?'),
  ];

  function oranzerija(done, fresh, mood) {
    const has = (id) => ORANZERIJA.findIndex((x) => x.id === id) < done;
    const cls = (id) => (fresh === id ? ' class="appear"' : '');
    const clean = has('glass');
    const lit = has('chandelier');
    const s = [];
    s.push(`<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="goS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${clean ? '#cfe6e4' : '#c9c8b8'}"/><stop offset="1" stop-color="${clean ? '#eef3e0' : '#dedbc8'}"/></linearGradient>
      <linearGradient id="goF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9b89a"/><stop offset="1" stop-color="#a8957a"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#goS)"/>
      <circle cx="300" cy="30" r="120" fill="url(#gSun)" opacity="${clean ? 0.9 : 0.3}"/>`);
    // Stiklinė siena ir arka
    let frame = '';
    for (let x = 0; x <= 400; x += 40) frame += `<path d="M${x} 0 V150"/>`;
    for (let y = 30; y <= 150; y += 40) frame += `<path d="M0 ${y} H400"/>`;
    s.push(`<g stroke="#f6f4ec" stroke-width="3" opacity=".9" fill="none">${frame}<path d="M0 40 Q200 -40 400 40" stroke-width="5"/></g>`);
    if (!clean) s.push(`<g fill="#a9a48a" opacity=".45">${[[30, 40], [110, 70], [190, 30], [270, 90], [350, 50], [70, 120], [230, 130]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="34" ry="18"/>`).join('')}</g>`);
    // Grindys
    s.push(`<rect y="150" width="400" height="110" fill="url(#goF)"/>
      <g stroke="#8e7c62" stroke-width="1.2" opacity=".6">${[170, 194, 222, 254].map((y) => `<path d="M0 ${y} H400"/>`).join('')}${[-40, 20, 80, 140, 200, 260, 320, 380, 440].map((x) => `<path d="M${200 + (x - 200) * 0.7} 150 L${x} 260"/>`).join('')}</g>`);
    // Šviestuvas
    s.push(`<g${cls('chandelier')}><path d="M200 0 V28" stroke="#6a5a3a" stroke-width="2"/><path d="M176 40 Q200 54 224 40" stroke="#b08a3a" stroke-width="3" fill="none"/>
      <g fill="${lit ? '#fff1b0' : '#d8d2c0'}">${[176, 192, 208, 224].map((x) => `<ellipse cx="${x}" cy="${x === 192 || x === 208 ? 46 : 40}" rx="4" ry="6"/>`).join('')}</g>
      ${lit ? '<circle cx="200" cy="44" r="46" fill="#fff4c4" opacity=".35"/>' : ''}</g>`);
    // Palmė (kairėje)
    if (has('palm')) {
      const fronds = [[150, 34], [120, 40], [90, 30], [60, 40], [30, 34]].map(([a, l]) => {
        const rad = (a * Math.PI) / 180, ex = 60 + l * Math.cos(rad), ey = 104 - l * Math.sin(rad) + 14;
        return `<path d="M60 104 Q${(60 + ex) / 2} ${104 - l * 0.7} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(60 + ex) / 2} ${104 - l * 0.3} 60 104Z"/>`;
      }).join('');
      s.push(`<g${cls('palm')}><path d="M54 200 Q50 150 60 104" stroke="#8a6a44" stroke-width="9" fill="none" stroke-linecap="round"/>
        <g fill="#5f9a4a" stroke="#3f6a2a" stroke-width="1.2">${fronds}</g>
        <path d="M36 200 H76 L70 224 H42Z" fill="#c8693c" stroke="#7a3a1c" stroke-width="1.5"/></g>`);
    }
    // Daigų stelažai (dešinėje)
    if (has('shelves')) s.push(`<g${cls('shelves')}><g stroke="#7a5a3a" stroke-width="3"><path d="M300 110 V170 M380 110 V170"/><path d="M296 124 H384 M296 148 H384"/></g>
      ${[306, 322, 338, 354, 370].map((x, i) => `<path d="M${x - 5} 118 h10 l-2 6 h-6z M${x - 5} 142 h10 l-2 6 h-6z" fill="#c8693c"/><circle cx="${x}" cy="114" r="4" fill="${['#e59aab', '#7aa848', '#f3d27a', '#9b7fc0', '#7aa848'][i]}"/><circle cx="${x}" cy="138" r="3.5" fill="#7aa848"/>`).join('')}</g>`);
    // Fontanas centre
    s.push(has('fountain')
      ? `<g${cls('fountain')}><ellipse cx="200" cy="196" rx="52" ry="12" fill="#8a8178"/><ellipse cx="200" cy="192" rx="48" ry="10" fill="#6cc3f0"/><rect x="194" y="160" width="12" height="32" fill="#cfc7bb"/>
         <ellipse cx="200" cy="160" rx="20" ry="5" fill="#cfc7bb" stroke="#8a8178"/><path d="M200 156 q-14 -20 -24 8 M200 156 q14 -20 24 8" stroke="#9fd8f5" stroke-width="2.5" fill="none" opacity=".9"/>
         <g fill="#7fb05a"><ellipse cx="176" cy="191" rx="8" ry="3"/><ellipse cx="224" cy="193" rx="7" ry="2.5"/></g></g>`
      : '<g><ellipse cx="200" cy="196" rx="52" ry="12" fill="#8a8178"/><ellipse cx="200" cy="192" rx="48" ry="10" fill="#9a9478"/><rect x="194" y="166" width="12" height="26" fill="#b5ad9f"/><path d="M182 190 l10 -6 M214 188 l8 4" stroke="#6a6250" stroke-width="2"/></g>');
    // Orchidėjos
    const potAt = (x, y, c) => `<path d="M${x - 10} ${y} h20 l-3 14 h-14z" fill="${c}" stroke="#7a3a1c"/>`;
    if (has('orchids')) s.push(`<g${cls('orchids')}>${[[110, 214], [290, 214]].map(([x, y]) => potAt(x, y, '#e9e2d6') + `<path d="M${x} ${y} q4 -24 -6 -40" stroke="#5f7a3a" stroke-width="2" fill="none"/>` +
      [[-8, -36], [2, -42], [-2, -28]].map(([dx, dy]) => `<g transform="translate(${x + dx} ${y + dy})"><ellipse rx="6" ry="4" fill="#e7a3d0"/><ellipse rx="3" ry="5" fill="#f4c6e2"/><circle r="1.6" fill="#c4486f"/></g>`).join('')).join('')}</g>`);
    else s.push(`<g opacity=".9">${[[110, 214], [290, 214], [150, 238]].map(([x, y]) => potAt(x, y, '#b5764a') + `<path d="M${x} ${y} q-2 -10 -8 -14 M${x} ${y} q3 -8 8 -10" stroke="#8a7a5a" stroke-width="1.5" fill="none"/>`).join('')}</g>`);
    // Citrinmedžiai
    if (has('citrus')) s.push(`<g${cls('citrus')}>${[[140, 236], [262, 236]].map(([x, y]) => `<path d="M${x - 14} ${y - 18} h28 l-4 22 h-20z" fill="#c8693c" stroke="#7a3a1c" stroke-width="1.5"/><path d="M${x} ${y - 18} V${y - 40}" stroke="#7a5a3a" stroke-width="3"/>
      <circle cx="${x}" cy="${y - 52}" r="18" fill="#6f9a52"/><g fill="#f3d23c">${[[-8, -54], [7, -60], [4, -46], [-4, -64]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="3.4"/>`).join('')}</g>`).join('')}</g>`);
    // Drugeliai
    if (has('butterflies')) s.push(`<g${cls('butterflies')}>${[[90, 90, '#f2a74a'], [330, 76, '#8ab4e8'], [250, 60, '#e59aab']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><path d="M0 0 q-10 -12 -14 -2 q4 8 14 2z M0 0 q10 -12 14 -2 q-4 8 -14 2z" fill="${c}"/><path d="M0 -4 V4" stroke="#3a2a1a" stroke-width="1.5"/></g>`).join('')}</g>`);
    // Arbatos staliukas
    if (has('teatable')) s.push(`<g${cls('teatable')}><ellipse cx="338" cy="232" rx="30" ry="4" fill="#3b2312" opacity=".25"/><ellipse cx="338" cy="206" rx="26" ry="6" fill="#e9dcc0" stroke="#a89470"/><path d="M338 212 V230" stroke="#a89470" stroke-width="3"/>
      <path d="M300 200 q-6 22 4 32 M376 200 q6 22 -4 32" stroke="#c4a46a" stroke-width="4" fill="none"/><rect x="328" y="196" width="10" height="8" rx="2" fill="#fff" stroke="#9a9080"/><circle cx="350" cy="200" r="4" fill="#f2b43c"/></g>`);
    // Veikėjai
    const expr = mood || (done === 0 ? 'surprised' : done >= ORANZERIJA.length ? 'happy' : 'normal');
    s.push(`<g class="g-pukis" transform="translate(126 166) scale(.34)"><ellipse cx="100" cy="246" rx="64" ry="9" fill="#3b2312" opacity=".3"/>${ART.pukisInner(expr)}</g>`);
    s.push(`<g transform="translate(214 148) scale(.2)"><g class="frog">${ART.frogInner(done >= ORANZERIJA.length ? 'happy' : done === 0 ? 'sad' : 'normal')}</g></g>`);
    s.push(`<g transform="translate(300 96) scale(.18)"><g class="bee">${ART.beeInner('normal')}</g></g>`);
    s.push(`<rect width="400" height="260" fill="#ffd98a" opacity="${lit ? 0.12 : clean ? 0.06 : 0.02}"/>
      <rect width="400" height="260" fill="url(#gVignette)"/>
      <rect width="400" height="260" filter="url(#fGrain)" opacity=".07" style="mix-blend-mode:multiply"/></svg>`);
    return s.join('');
  }

  // ================= 6 zona: Malūnas =================
  const A = (e, t) => ({ who: 'Agota', e, t });
  const MALUNAS = [
    { id: 'mow', name: 'Nušienauti kalvą', cost: 4,
      after: [P('happy', 'Kalva vėl matosi! Ir kokia plati pieva.'), A('happy', 'Uhu! Pagaliau matau, kur nusileisti.')] },
    { id: 'mill', name: 'Sutaisyti malūną', cost: 5,
      after: [A('excited', 'Sparnai sukasi! Kaip senais laikais. Uhu-u!'), D('happy', 'Gerai sutepti krumpliaračiai – pusė darbo.')] },
    { id: 'vane', name: 'Pastatyti vėtrungę', cost: 5,
      after: [K('surprised', 'Varinis gaidys ant stulpo? Jis blizga!'), A('wink', 'Rodo, iš kur pučia vėjas. Ne tau, Karoli.')] },
    { id: 'haystacks', name: 'Sukrauti šieno kupetas', cost: 5,
      after: [P('excited', 'Šieno kupetos! Galima į jas šokti?'), A('normal', 'Tik atsargiai – jose miega pelės.')] },
    { id: 'sheaves', name: 'Surišti rugių pėdus', cost: 5,
      after: [A('happy', 'Iš šių rugių bus pati kvapniausia duona.'), Z('happy', 'Bzz! Su medumi – dar kvapnesnė!')] },
    { id: 'gate', name: 'Pataisyti senuosius vartus', cost: 6,
      after: [D('happy', 'Vartai vėl užsidaro. Ir rožė ant stulpo pražydo.'), A('thinking', 'Dabar svečiai žinos, kur įeiti.')] },
    { id: 'oven', name: 'Sumūryti duonos krosnį', cost: 6,
      after: [A('excited', 'Krosnis įkaitusi! Pirmieji kepalai jau kyla.'), P('excited', 'Kaip kvepia…'), V('happy', 'Kva! Šilta kaip oranžerijoje.')] },
    { id: 'poppies', name: 'Užsėti aguonų ir rugiagėlių', cost: 6,
      after: [P('happy', 'Raudona ir mėlyna – kaip vasaros vėliavėlės!'), A('happy', 'Mano mėgstamiausia pieva. Ačiū.')] },
    { id: 'picnic', name: 'Pikniko kampelis', cost: 6,
      after: [P('excited', 'Piknikas! Duona, pienas ir visi draugai.'), K('happy', 'Aš pasiimsiu trupinius. Visus.')] },
    { id: 'harvest', name: 'Derliaus šventės stalas', cost: 7,
      after: [A('excited', 'Malūnas sukasi, krosnis kepa – kalva atgaivinta! Uhu-u!'), P('happy', 'Visas sodas – nuo terasos iki malūno – vėl gyvas. Ačiū tau!')] },
  ];
  const MALUNAS_INTRO = [
    V('surprised', 'Kva! Girdit? Kažkas girgžda ant kalvos už oranžerijos!'),
    P('surprised', 'Senasis vėjo malūnas! Jo sparnai nesisuko daugybę metų.'),
    A('surprised', 'Uhu? Svečiai… dieną? Kokia staigmena.'),
    A('normal', 'Aš Agota. Gyvenu malūno palėpėje ir saugau senuosius grūdus.'),
    A('sad', 'Pelės pradraskė miltų maišus, kalva apaugo, o sparnai sustojo.'),
    P('happy', 'Mes padėsim! Kartu malūnas vėl suksis.'),
    A('happy', 'Uhu! Miltų maišą reikia pradraskyti du kartus – tada išbyra trys saujos grūdų.'),
    K('sneaky', 'Pelės, sakai? …Aš tik paklausiau.'),
  ];
  function malunas(done, fresh, mood) {
    const expr = mood || (done === 0 ? 'thinking' : done >= MALUNAS.length ? 'happy' : 'normal');
    return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="gmS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b9a0"/><stop offset="1" stop-color="#ffe2a8"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#gmS)"/><circle cx="80" cy="50" r="26" fill="#fff1b8"/>
      <path d="M0 130 Q200 70 400 130 V260 H0Z" fill="#a9b860"/><path d="M0 170 Q200 140 400 170 V260 H0Z" fill="#93a64e"/>
      <g transform="translate(190 60)"><path d="M0 70 L8 0 H22 L30 70Z" fill="#c9a06a" stroke="#7a5a3a"/>${done > 1 ? '<g stroke="#7a5a3a" stroke-width="3"><path d="M15 12 L-20 -20 M15 12 L50 -20 M15 12 L-20 44 M15 12 L50 44"/></g>' : ''}</g>
      <g class="g-pukis" transform="translate(126 166) scale(.34)">${ART.pukisInner(expr)}</g></svg>`;
  }

  // ================= Zonos =================
  const ZONES = [
    { id: 'terasa', name: 'Terasa', items: TERRACE, draw: terrace },
    { id: 'kiemas', name: 'Sodo kiemas', items: YARD, draw: yard, intro: YARD_INTRO },
    { id: 'darzas', name: 'Daržas', items: DARZAS, draw: darzas, intro: DARZAS_INTRO },
    { id: 'bitynas', name: 'Bitynas', items: BITYNAS, draw: bitynas, intro: BITYNAS_INTRO },
    { id: 'oranzerija', name: 'Oranžerija', items: ORANZERIJA, draw: oranzerija, intro: ORANZERIJA_INTRO },
    { id: 'malunas', name: 'Malūnas', items: MALUNAS, draw: malunas, intro: MALUNAS_INTRO },
  ];
  // Visi darbai iš eilės; Store.data.garden – kiek jų atlikta iš viso
  const ITEMS = ZONES.flatMap((z, zi) => z.items.map((it) => ({ ...it, zone: zi })));
  const zoneStart = (zi) => ZONES.slice(0, zi).reduce((a, z) => a + z.items.length, 0);
  // Kuri zona dabar aktyvi (kurioje laukia kitas darbas)
  function currentZone(done) {
    for (let zi = 0; zi < ZONES.length; zi++) if (done < zoneStart(zi) + ZONES[zi].items.length) return zi;
    return ZONES.length - 1;
  }
  // ================= Scena iš sugeneruotų paveikslėlių =================
  // Pozicijos – procentais nuo scenos pločio/aukščio: cx (centras), b (apačia nuo viršaus) arba t (viršus), w (plotis)
  const IMG_LAYOUT = {
    terasa: {
      bg: 'bg_terasa', cleanItem: 'clean',
      items: [
        { id: 'greenhouse', key: 'it_greenhouse', cx: 20, b: 72, w: 19, z: 1 },
        { id: 'tree', key: 'it_tree', cx: 83, b: 70, w: 23, z: 1 },
        { id: 'bench', key: 'it_bench', cx: 45, b: 79, w: 27, z: 2 },
        { id: 'shelf', key: 'it_shelf', cx: 84, b: 93, w: 16, z: 3 },
        { id: 'hanging', key: 'it_hanging', cx: 27, t: 6, w: 9, z: 3 },
        { id: 'hanging', key: 'it_hanging', cx: 70, t: 6, w: 9, z: 3 },
        { id: 'monstera', key: 'it_monstera', cx: 13, b: 99, w: 20, z: 4 },
      ],
      pukis: { cx: 58, b: 99, w: 23 },
    },
    kiemas: {
      bg: 'bg_kiemas', cleanItem: 'mow',
      items: [
        { id: 'gazebo', key: 'it_gazebo', cx: 85, b: 66, w: 21, z: 1 },
        { id: 'well', key: 'it_well', cx: 12, b: 68, w: 13, z: 1 },
        { id: 'pond', key: 'it_pond', cx: 30, b: 92, w: 42, z: 2, before: 'murky' },
        { id: 'path', key: 'it_path', cx: 66, b: 101, w: 17, z: 2 },
        { id: 'bridge', key: 'it_bridge', cx: 44, b: 86, w: 18, z: 3 },
        { id: 'beds', key: 'it_beds', cx: 87, b: 100, w: 24, z: 3 },
        { id: 'beehive', key: 'it_beehive', cx: 7, b: 100, w: 11, z: 3 },
      ],
      pukis: { cx: 54, b: 99, w: 20 },
      karolis: { cx: 61, b: 62, w: 8 },
    },
    darzas: {
      bg: 'bg_darzas', cleanItem: 'dig',
      items: [
        { id: 'shed', key: 'it_shed', cx: 13, b: 72, w: 19, z: 1 },
        { id: 'sunflowers', key: 'it_sunflowers', cx: 48, b: 66, w: 38, z: 1 },
        { id: 'trees', key: 'it_trees', cx: 85, b: 68, w: 28, z: 1 },
        { id: 'dig', key: 'it_soil', cx: 50, b: 93, w: 46, z: 2, hideWhen: 'rows' },
        { id: 'rows', key: 'it_rows', cx: 50, b: 93, w: 46, z: 2 },
        { id: 'scarecrow', key: 'it_scarecrow', cx: 78, b: 82, w: 12, z: 3 },
        { id: 'compost', key: 'it_compost', cx: 94, b: 94, w: 11, z: 3 },
        { id: 'pumpkins', key: 'it_pumpkins', cx: 11, b: 100, w: 17, z: 4 },
        { id: 'cart', key: 'it_cart', cx: 26, b: 86, w: 15, z: 3 },
      ],
      pukis: { cx: 36, b: 98, w: 19 },
      hedge: { cx: 66, b: 98, w: 15 },
      karolis: { cx: 84, b: 72, w: 6 },
    },
    bitynas: {
      bg: 'bg_bitynas', cleanItem: 'nettles',
      items: [
        { id: 'honeyhouse', key: 'it_honeyhouse', cx: 13, b: 54, w: 17, z: 1 },
        { id: 'linden', key: 'it_linden', cx: 87, b: 56, w: 22, z: 1 },
        { id: 'hives', key: 'it_hives', cx: 50, b: 58, w: 32, z: 2 },
        { id: 'lavender', key: 'it_lavender', cx: 52, b: 79, w: 46, z: 3 },
        { id: 'water', key: 'it_water', cx: 79, b: 82, w: 17, z: 4 },
        { id: 'table', key: 'it_table', cx: 19, b: 84, w: 20, z: 4 },
        { id: 'clover', key: 'it_clover', cx: 24, b: 101, w: 30, z: 5 },
        { id: 'sundial', key: 'it_sundial', cx: 63, b: 97, w: 8, z: 5 },
      ],
      pukis: { cx: 43, b: 99, w: 17 },
      hedge: { cx: 85, b: 99, w: 12 },
      bee: { cx: 72, b: 44, w: 11 },
    },
    oranzerija: {
      bg: 'bg_oranzerija', cleanItem: 'glass',
      items: [
        { id: 'chandelier', key: 'it_chandelier', cx: 50, t: -2, w: 24, z: 1 },
        { id: 'shelves', key: 'it_shelves', cx: 85, b: 72, w: 22, z: 1 },
        { id: 'palm', key: 'it_palm', cx: 12, b: 86, w: 24, z: 2 },
        { id: 'fountain', key: 'it_fountain', cx: 50, b: 78, w: 22, z: 2 },
        { id: 'butterflies', key: 'it_butterflies', cx: 30, t: 22, w: 14, z: 3 },
        { id: 'teatable', key: 'it_teatable', cx: 78, b: 88, w: 24, z: 3 },
        { id: 'orchids', key: 'it_orchids', cx: 27, b: 99, w: 17, z: 4 },
        { id: 'citrus', key: 'it_citrus', cx: 88, b: 101, w: 20, z: 5 },
      ],
      pukis: { cx: 47, b: 99, w: 17 },
      frog: { cx: 63, b: 82, w: 11 },
    },
    malunas: {
      bg: 'bg_malunas', cleanItem: 'mow',
      items: [
        { id: 'mill', key: 'it_mill', cx: 52, b: 50, w: 27, z: 1, before: 'murky' },
        { id: 'vane', key: 'it_vane', cx: 90, b: 58, w: 7, z: 1 },
        { id: 'haystacks', key: 'it_haystacks', cx: 16, b: 57, w: 26, z: 1 },
        { id: 'sheaves', key: 'it_sheaves', cx: 78, b: 66, w: 15, z: 2 },
        { id: 'gate', key: 'it_gate', cx: 24, b: 74, w: 34, z: 2 },
        { id: 'oven', key: 'it_oven', cx: 87, b: 84, w: 19, z: 3 },
        { id: 'harvest', key: 'it_harvest', cx: 62, b: 87, w: 34, z: 3 },
        { id: 'picnic', key: 'it_picnic', cx: 20, b: 95, w: 22, z: 4 },
        { id: 'poppies', key: 'it_poppies', cx: 50, b: 102, w: 70, z: 5 },
      ],
      pukis: { cx: 42, b: 99, w: 17 },
      owl: { cx: 63, b: 62, w: 11 },
    },
  };
  const TUFT_POS = [[6, 70], [18, 84], [30, 74], [44, 92], [58, 80], [70, 95], [82, 76], [94, 88], [12, 98], [38, 99], [64, 99], [88, 99]];

  function imageScene(zi, local, fresh, mood) {
    const z = ZONES[zi];
    const L = IMG_LAYOUT[z.id];
    const has = (id) => z.items.findIndex((x) => x.id === id) < local;
    const clean = has(L.cleanItem);
    const pos = (o) => `left:${o.cx - o.w / 2}%;width:${o.w}%;${o.t != null ? `top:${o.t}%` : `bottom:${100 - o.b}%`};z-index:${o.z || 1}`;
    let h = `<div class="gscene${clean ? '' : ' wild'}"><img class="gbg" src="${Img.url(L.bg)}" alt="">`;
    for (const it of L.items) {
      if (!Img.has(it.key)) continue;
      const shown = has(it.id) && !(it.hideWhen && has(it.hideWhen));
      if (!shown && (it.before !== 'murky' || has(it.id))) continue;
      // Malūnas iš dviejų dalių: bokštas + besisukantys sparnai (jei abu paveikslėliai yra)
      if (it.key === 'it_mill' && Img.has('it_mill_tower') && Img.has('it_mill_sails')) {
        const SA = 400 / 260;                  // sodo paveikslo plotis / aukštis
        const tw = 12.8, th = tw * SA * (600 / 347); // bokšto plotis ir aukštis (%)
        const top = it.b - th;
        const hx = it.cx - tw / 2 + 0.508 * tw, hy = top + 0.343 * th; // ašies vieta bokšte
        const sw = 22, sh = sw * SA * (598 / 600);
        const cls = `${!shown ? ' murky' : ''}${fresh === it.id ? ' appear' : ''}`;
        const dat = shown ? ' data-it="it_mill"' : '';
        h += `<img class="gst${cls}"${dat} src="${Img.url('it_mill_tower')}" style="left:${it.cx - tw / 2}%;width:${tw}%;bottom:${100 - it.b}%;z-index:${it.z || 1}" alt="">`;
        h += `<span class="mill-sails${cls}${shown ? ' spin' : ''}" style="left:${hx - sw / 2}%;top:${hy - sh / 2}%;width:${sw}%;z-index:${it.z || 1}"><img class="gst"${dat} src="${Img.url('it_mill_sails')}" alt=""></span>`;
        continue;
      }
      h += `<img class="gst${!shown ? ' murky' : ''}${fresh === it.id ? ' appear' : ''}"${shown ? ` data-it="${it.key}"` : ''} src="${Img.url(it.key)}" style="${pos(it)}" alt="">`;
    }
    // Elementai, kurie liko SVG (žibintėliai, sūpynės)
    let over = '';
    if (z.id === 'terasa' && has('lights') && Img.has('it_lights')) {
      h += `<img class="gst${fresh === 'lights' ? ' appear' : ''}" data-it="it_lights" src="${Img.url('it_lights')}" style="left:0;width:100%;top:9%;z-index:2" alt="">`;
    } else if (z.id === 'terasa' && has('lights')) {
      let bulbs = '';
      for (let i = 1; i < 16; i++) {
        const x = 16 + i * 23.4;
        const seg = x < 200 ? (x - 16) / 184 : (x - 200) / 184;
        const y = 22 + 18 * Math.sin(Math.PI * seg);
        bulbs += `<circle cx="${x}" cy="${y + 3}" r="7" fill="url(#gGlow)"/><circle cx="${x}" cy="${y + 3}" r="2.6" fill="#fff4c4"/>`;
      }
      over += `<g${fresh === 'lights' ? ' class="appear"' : ''}><path d="M16 22 Q108 58 200 24 Q292 58 384 22" stroke="#3a2a1e" stroke-width="1" fill="none"/>${bulbs}</g>`;
    }
    if (z.id === 'kiemas' && has('swing') && Img.has('it_swing')) {
      // Sėdynė – paveikslėlis, virvės iki ąžuolo šakos – linijos
      over += `<g${fresh === 'swing' ? ' class="appear"' : ''}><path d="M96.5 76 V116 M127.5 76 V116" stroke="#e6cf9f" stroke-width="1.6"/></g>`;
      h += `<img class="gst${fresh === 'swing' ? ' appear' : ''}" data-it="it_swing" src="${Img.url('it_swing')}" style="left:23.5%;width:9%;bottom:46%;z-index:2" alt="">`;
    } else if (z.id === 'kiemas' && has('swing')) {
      // Sūpynės ant kairės ąžuolo šakos
      over += `<g${fresh === 'swing' ? ' class="appear"' : ''}><path d="M100 76 V138 M126 72 V138" stroke="#cdb487" stroke-width="1.4"/><rect x="94" y="136" width="38" height="6" rx="3" fill="url(#gWood)"/></g>`;
    }
    if (over) h += `<svg class="gover" viewBox="0 0 400 260" preserveAspectRatio="none">${over}</svg>`;
    // Piktžolės, kol neišvalyta
    if (!clean) {
      TUFT_POS.forEach(([x, y], i) => {
        const w = 6 + (i % 3) * 1.5;
        h += Img.has('tuft')
          ? `<img class="gst tuft" src="${Img.url('tuft')}" style="left:${x - w / 2}%;width:${w}%;bottom:${100 - y}%;z-index:6" alt="">`
          : `<svg class="gst tuft" viewBox="0 0 40 30" style="left:${x - w / 2}%;width:${w}%;bottom:${100 - y}%;z-index:6"><g stroke="#6d7a3c" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M20 30 q-5 -14 -10 -24"/><path d="M20 30 q1 -16 3 -28"/><path d="M20 30 q6 -12 11 -22"/></g></svg>`;
      });
    }
    // Veikėjai
    const items = z.items.length;
    const expr = mood || (local === 0 ? (zi === 0 ? 'sad' : 'thinking') : local >= items ? 'happy' : 'normal');
    h += `<div class="gchar" data-who="" style="${pos({ ...L.pukis, z: 7 })}">${ART.pukis(expr)}</div>`;
    if (L.karolis) h += `<div class="gchar" data-who="Karolis" style="${pos({ ...L.karolis, z: 7 })}">${ART.crow(local >= items ? 'happy' : local === 0 ? 'sneaky' : 'normal')}</div>`;
    if (L.bee) h += `<div class="gchar fly" data-who="Zuzė" style="${pos({ ...L.bee, z: 7 })}">${ART.bee(local >= items ? 'happy' : local === 0 ? 'sad' : 'normal')}</div>`;
    if (L.frog) h += `<div class="gchar" data-who="Kvaksė" style="${pos({ ...L.frog, z: 7 })}">${ART.frog(local >= items ? 'happy' : local === 0 ? 'sad' : 'normal')}</div>`;
    if (L.owl) h += `<div class="gchar owl" data-who="Agota" style="${pos({ ...L.owl, z: 7 })}">${ART.owl(local >= items ? 'happy' : local === 0 ? 'sad' : 'normal')}</div>`;
    if (L.hedge) h += `<div class="gchar" data-who="Dygliukas" style="${pos({ ...L.hedge, z: 7 })}">${ART.hedge(local >= items ? 'happy' : local === 0 ? 'sad' : 'normal')}</div>`;
    h += `<div class="gvignette"></div></div>`;
    return h;
  }

  function svg(zi, done, fresh, mood) {
    const local = Math.max(0, Math.min(ZONES[zi].items.length, done - zoneStart(zi)));
    const L = IMG_LAYOUT[ZONES[zi].id];
    if (L && typeof Img !== 'undefined' && Img.has(L.bg)) return imageScene(zi, local, fresh, mood);
    return ZONES[zi].draw(local, fresh, mood);
  }

  return { ZONES, ITEMS, svg, currentZone, zoneStart };
})();
