// Pūkio dialogai ir dialogų langas.
// Emocijos: normal, happy, excited, surprised, sad, thinking, wink
const STORY = {
  intro: [
    { e: 'happy', t: 'O! Labas! Aš – Pūkis. Ilgus metus saugojau šį sodą…' },
    { e: 'sad', t: '…kol jis, na, truputį sulaukėjo. Senoji šeimininkė išvažiavo, ir piktžolės čia tapo tikromis karalienėmis.' },
    { e: 'excited', t: 'Bet tu atvykai! Kartu galime jį atgaivinti – lysvę po lysvės.' },
    { e: 'normal', t: 'Tvarkyk lysves ir rink žvaigždutes. Už jas atliksime sodo darbus.' },
    { e: 'wink', t: 'O čia – trys kastuvėliai. Radau sandėliuke. Jais gali iškasti bet kurį langelį.' },
  ],
  levels: [
    [{ e: 'happy', t: 'Pirmas darbas – surinkim bijūnų žiedų. Iš jų išaugs naujos sėklos!' },
     { e: 'normal', t: 'Sukeisk du gretimus elementus, kad susidarytų trys vienodi iš eilės.' }],
    [{ e: 'excited', t: 'Sudėk keturis iš eilės – gausi dryžuotą elementą. Jis nušluoja visą eilę!' }],
    [{ e: 'sad', t: 'Uch, piktžolės… Jos užkariavo visą lysvę.' },
     { e: 'normal', t: 'Sudaryk eiles ant žolėtų langelių – taip jas išravėsi.' }],
    [{ e: 'wink', t: 'Šįkart svarbiausia – taškai! Pabandyk L arba T formą: gausi sprogstantį elementą.' }],
    [{ e: 'surprised', t: 'Akmenys lysvėse! Kas juos čia primėtė?' },
     { e: 'normal', t: 'Sudaryk eilę šalia akmens arba susprogdink jį.' }],
    [{ e: 'thinking', t: 'Tamsiai žalios piktžolės – užsispyrusios. Jas teks ravėti du kartus.' }],
    [{ e: 'surprised', t: 'Brr! Naktį pašalo. Užšalusių elementų pajudinti negalima.' },
     { e: 'normal', t: 'Įtrauk juos į eilę – ir jie atitirps.' }],
    [{ e: 'normal', t: 'Senasis takas – ir akmenys, ir piktžolės. Dirbsim kartu!' }],
    [{ e: 'happy', t: 'Ši lysvė panaši į didelį žiedą. Išravėkim ją iki paskutinio stiebelio!' }],
    [{ e: 'excited', t: 'Didysis darbas! Piktžolės, šalna ir akmenys – viskas vienoje lysvėje.' },
     { e: 'happy', t: 'Tikiu tavimi!' }],
  ],
  win: [
    { e: 'happy', t: 'Puikiai padirbėta! Sodas tau dėkingas.' },
    { e: 'excited', t: 'Valio! Dar viena lysvė sutvarkyta!' },
    { e: 'happy', t: 'Tu tikras sodininkas! Gal arbatos?' },
    { e: 'excited', t: 'Žiūrėk, kaip viskas sužydo!' },
  ],
  lose: [
    { e: 'sad', t: 'Nieko tokio – ir aš kartais užmiegu darbo viduryje.' },
    { e: 'normal', t: 'Pabandykim dar kartą. Šįkart tikrai pavyks!' },
    { e: 'thinking', t: 'Hmm… Gal kastuvėlis pagelbėtų?' },
  ],
  tips: [
    { e: 'thinking', t: 'Ar žinai, kad 5 iš eilės užaugina auksinę sėklą? Ji išvalo visus vienos rūšies elementus.' },
    { e: 'excited', t: 'Sukeisk du specialius elementus – bus didelis BUM!' },
    { e: 'wink', t: 'Kasdien užsuk – sandėliuke vis randu dovanų.' },
    { e: 'normal', t: 'Pakartok lygį geriau – gausi daugiau žvaigždučių.' },
    { e: 'happy', t: 'Man patinka, kai pasikasai už ausies. Ačiū!' },
  ],
  daily: [{ e: 'excited', t: 'Sandėliuke radau dar vieną kastuvėlį! Imk, tau pravers.' }],
  noStars: [{ e: 'thinking', t: 'Mums dar trūksta žvaigždučių. Sutvarkykim kelias lysves!' }],
  canAfford: (name) => [{ e: 'excited', t: `Turime pakankamai žvaigždučių! Imkimės darbo: ${name.toLowerCase()}?` }],
  allDone: [{ e: 'happy', t: 'Sodas atgaivintas! Netrukus atvyks nauji kaimynai su naujomis lysvėmis…' }],
};

// ---------- Sodo kiemas (11–40 lygiai) ----------
(() => {
  const K = (e, t) => ({ who: 'Karolis', e, t });
  const P = (e, t) => ({ e, t });
  const L = STORY.levels;
  L[10] = [P('thinking', 'Žiūrėk – sėklų maišeliai! Nuleisk juos į lentos apačią, ir jie nukeliaus į daržą.'),
    P('normal', 'Maišelių sunaikinti negalima – tik nuleisti. Išvalyk kelią po jais!')];
  L[11] = [K('happy', 'Daugiau maišelių! Ir obuolių. Obuolius aš irgi mėgstu.')];
  L[12] = [P('thinking', 'Piktžolės prie pat žemės… Maišeliai turės prasiskverbti pro jas.')];
  L[13] = [K('sneaky', 'Varžybos! Kas surinks daugiau taškų – tu ar aš? …Gerai, tu.')];
  L[14] = [K('sad', 'Gerai, gerai… Prisipažįstu. Akmenis į lysves primėčiau aš. Ieškojau blizgančių.'), P('wink', 'Tada padėk juos išrinkti!')];
  L[15] = [K('surprised', 'Kar! Samanos! Jos plinta, jei nespėji jų nuvalyti.'),
    P('normal', 'Kiekvieną ėjimą išvalyk bent vieną samanų lopinėlį – kitaip jos išsiplės.')];
  L[18] = [P('thinking', 'Šalna ir samanos kartu… Šiandien bus vėsi darbo diena.')];
  L[20] = [P('surprised', 'Seni kelmai! Jie kietesni už akmenis – reikės trijų smūgių.'), K('sad', 'Aš ant jų sėdėdavau. Bet ką jau padarysi.')];
  L[25] = [K('happy', 'Šiandien sode visos šešios gėrybių rūšys. Bus sunkiau – bet ir įdomiau!')];
  L[29] = [P('excited', 'Trisdešimtoji lysvė! Kiemas jau beveik atgijo.'), K('happy', 'Ne blogai dirbat. Visai ne blogai.')];
  L[32] = [K('thinking', 'Samanos užkariavo kampus… Jas reikia sustabdyti, kol neišplito.')];
  L[35] = [P('thinking', 'Kelmai, samanos ir šalna. Sunku, bet mes jau patyrę.')];
  L[39] = [K('surprised', 'Paskutinė didžioji lysvė! Visi priešai – vienoje vietoje.'), P('happy', 'Kartu mes tai padarysim!')];
  STORY.yardStart = [P('excited', 'Terasa atgaivinta! Laikas imtis sodo kiemo.'), K('normal', 'Pagaliau. Aš jau seniai laukiu.')];
  STORY.tips.push(K('sneaky', 'Jei rasi ką nors blizgančio – tai mano. Tiesiog sakau.'));
  STORY.tips.push(P('thinking', 'Sėklų maišelius geriausia stumti per stulpelio vidurį – ten mažiau kliūčių.'));
})();

const Dialog = (() => {
  let el, portrait, text, nameEl, resolveFn, lines, i, typing, typeTimer;

  function setup() {
    el = document.getElementById('dialog');
    portrait = el.querySelector('.dlg-portrait');
    text = el.querySelector('.dlg-text');
    nameEl = el.querySelector('.dlg-name');
    el.addEventListener('click', next);
  }

  function showLine() {
    const l = lines[i];
    portrait.innerHTML = ART.portrait(l.who, l.e || 'normal');
    el.querySelector('.dlg-box').classList.toggle('karolis', l.who === 'Karolis');
    portrait.classList.remove('bounce');
    void portrait.offsetWidth;
    portrait.classList.add('bounce');
    nameEl.textContent = l.who || 'Pūkis';
    text.textContent = '';
    typing = true;
    let n = 0;
    clearInterval(typeTimer);
    typeTimer = setInterval(() => {
      n += 1;
      text.textContent = l.t.slice(0, n);
      if (n % 3 === 0) Sfx.blip();
      if (n >= l.t.length) { clearInterval(typeTimer); typing = false; }
    }, 22);
  }

  function next() {
    if (typing) {
      clearInterval(typeTimer);
      text.textContent = lines[i].t;
      typing = false;
      return;
    }
    i++;
    if (i < lines.length) return showLine();
    el.classList.add('hidden');
    const r = resolveFn;
    resolveFn = null;
    if (r) r();
  }

  function say(ls) {
    if (!el) setup();
    lines = (Array.isArray(ls) ? ls : [ls]).map((l) => ({ ...l, t: T(l.t) }));
    i = 0;
    el.classList.remove('hidden');
    showLine();
    return new Promise((res) => { resolveFn = res; });
  }

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return { say, pick };
})();

// ---------- Daržas (41–60 lygiai) ----------
(() => {
  const D = (e, t) => ({ who: 'Dygliukas', e, t });
  const K = (e, t) => ({ who: 'Karolis', e, t });
  const P = (e, t) => ({ e, t });
  const L = STORY.levels;
  L[40] = [D('surprised', 'Kurmiai! Matai kauburėlius? Jie rausiasi po visu daržu.'),
    D('normal', 'Kurmiui reikia dviejų smūgių. Po pirmo jis pabėga – tad sek, kur išniro!')];
  L[42] = [P('thinking', 'Piktžolės ir kurmiai kartu… Dygliuk, ar visada taip?'), D('sad', 'Kiekvieną pavasarį.')];
  L[44] = [K('sneaky', 'Kurmiai mėgsta sėklas. Aš irgi. Bet aš bent jau prisipažįstu.')];
  L[46] = [D('thinking', 'Samanos mano darže? Turbūt nuo šulinio drėgmės.')];
  L[49] = [D('happy', 'Pusė darbų padaryta! Moliūgai jau pradeda rausti.'), P('excited', 'Ir aš jaučiu sriubos kvapą!')];
  L[50] = [D('surprised', 'Šįkart kurmiai bėgioja dvigubai greičiau! Kas 2 ėjimus.')];
  L[54] = [K('surprised', 'Kurmių šeima! Jų čia visas būrys!'), D('normal', 'Ramiai. Po vieną.')];
  L[59] = [D('excited', 'Paskutinė didžioji daržo lysvė! Išprašykime kurmius visam laikui.'), P('happy', 'Pirmyn!'), K('happy', 'Aš stebėsiu iš viršaus. Strategiškai.')];
  STORY.darzasStart = [P('excited', 'Kiemas atgaivintas! Laikas imtis daržo.'), D('happy', 'Pagaliau! Kurmiai jau laukia… deja.')];
  STORY.tips.push(D('thinking', 'Kurmį lengviausia pagauti, kai jis prie lentos krašto – nėra kur bėgti.'));
})();

// ---------- Bitynas (61–80 lygiai) ----------
(() => {
  const Z = (e, t) => ({ who: 'Zuzė', e, t });
  const D = (e, t) => ({ who: 'Dygliukas', e, t });
  const K = (e, t) => ({ who: 'Karolis', e, t });
  const P = (e, t) => ({ e, t });
  const L = STORY.levels;
  L[60] = [Z('happy', 'Bzz! Matai lipnius elementus? Jie apsemti medumi – jų pajudinti negalima.'),
    Z('wink', 'Bet sudaryk eilę su jais – ir medaus lašas tavo!')];
  L[61] = [Z('surprised', 'O čia – laukiniai koriai! Kas kelis ėjimus jie laša medumi aplink.'),
    Z('happy', 'Sudaužyk korį – gausi net 3 medaus lašus!')];
  L[63] = [P('excited', 'Tiek medaus! Galima paragauti?'), Z('wink', 'Tik vieną lašelį.')];
  L[65] = [K('surprised', 'Kurmiai IR bitės? Šiame sode ramybės nėra.'), D('happy', 'Užtat nuobodu nebūna.')];
  L[69] = [Z('excited', 'Pusė bityno sutvarkyta! Mano sesės jau grįžta.')];
  L[71] = [Z('surprised', 'Bzz! Šie koriai laša dvigubai greičiau – kas 2 ėjimus!')];
  L[75] = [D('thinking', 'Šešios rūšys ir koriai… Reikės kantrybės.'), Z('happy', 'Ir medaus! Medus padeda viskam.')];
  L[79] = [Z('excited', 'Paskutinė didžioji bityno lysvė! Visi koriai susirinko čia.'), P('happy', 'Kartu mes tai padarysim!'), K('sneaky', 'Aš stebėsiu. Iš saugaus atstumo.')];
  STORY.bitynasStart = [P('excited', 'Daržas atgaivintas! Ar girdi zvimbimą?'), Z('happy', 'Bzz! Pagaliau – laukiu jūsų bityne!')];
  STORY.tips.push(Z('wink', 'Sudaužytas korys duoda 3 medaus lašus. Bzz – naudinga žinoti!'));
})();

// ---------- Oranžerija (81–100 lygiai) ----------
(() => {
  const V = (e, t) => ({ who: 'Kvaksė', e, t });
  const Z = (e, t) => ({ who: 'Zuzė', e, t });
  const D = (e, t) => ({ who: 'Dygliukas', e, t });
  const K = (e, t) => ({ who: 'Karolis', e, t });
  const P = (e, t) => ({ e, t });
  const L = STORY.levels;
  L[80] = [V('happy', 'Kva! Matai vazonus? Ant kiekvieno nupieštas žiedas – tokios spalvos jam ir reikia.'),
    V('wink', 'Sudėk eilę tos spalvos šalia vazono – visa eilė bus pasodinta! Skaičius rodo, kiek dar trūksta.')];
  L[82] = [P('thinking', 'Vazonai prie pat vienas kito… Viena eilė gali pripildyti abu!')];
  L[85] = [V('surprised', 'Šalna oranžerijoje?! Mano balsas sušals!'), D('happy', 'Užšalusius atšildyk – jie irgi tinka vazonams.')];
  L[87] = [V('thinking', 'Šešios rūšys žiedų… Kokia paletė! Kaip operoje.')];
  L[89] = [V('excited', 'Pusė oranžerijos! Mano publika auga – net Karolis plojo.'), K('sneaky', 'Aš tik mojavau sparnais. Buvo karšta.')];
  L[90] = [K('surprised', 'Kurmiai ir čia? Jie visur!'), P('happy', 'Sprogimas, palietęs vazoną, irgi įdeda žiedą!')];
  L[91] = [Z('happy', 'Bzz! Koriai ir vazonai – medus ir žiedai kartu. Puiki pora!')];
  L[95] = [V('happy', 'Daugiau žiedų viename vazone – daugiau dainų!'), D('thinking', 'Tik ne per garsiai, prašau.')];
  L[99] = [V('excited', 'Paskutinė didžioji lysvė! Visi vazonai laukia žiedų – ir mano finalinė arija!'), P('happy', 'Kartu mes tai padarysim!'), K('sneaky', 'Aš atsinešiau ausų kamštukus.')];
  STORY.oranzerijaStart = [P('excited', 'Bitynas atgaivintas! Ar girdi dainavimą?'), V('happy', 'Kva-a! Laukiu jūsų oranžerijoje!')];
  STORY.tips.push(V('wink', 'Viena ilga eilė prie vazono pripildo jį iškart. Kva – mano mėgstamiausias triukas!'));
})();

// ---------- Malūnas (101–120 lygiai) ----------
(() => {
  const A = (e, t) => ({ who: 'Agota', e, t });
  const V = (e, t) => ({ who: 'Kvaksė', e, t });
  const Z = (e, t) => ({ who: 'Zuzė', e, t });
  const D = (e, t) => ({ who: 'Dygliukas', e, t });
  const K = (e, t) => ({ who: 'Karolis', e, t });
  const P = (e, t) => ({ e, t });
  const L = STORY.levels;
  L[100] = [A('normal', 'Uhu. Matai miltų maišus? Pelės juos apgraužė, bet grūdai dar viduje.'),
    A('happy', 'Sudaryk eilę šalia maišo du kartus – jis pradrėks ir išbers grūdus.')];
  L[101] = [A('wink', 'Kiekvienas pradraskytas maišas – trys saujos grūdų. Skaičiuok!')];
  L[103] = [P('thinking', 'Piktžolės ir ant kalvos… Jos tikrai visur.'), A('normal', 'Ten, kur nėra pelių, yra piktžolių. Toks gamtos dėsnis.')];
  L[105] = [A('surprised', 'Uhu! Šalna! Mano plunksnos pasišiaušė.'), D('happy', 'Užšalusius atšildyk – grūdai nuo to nenukentės.')];
  L[107] = [V('excited', 'Kva! Atnešiau vazonų ir čia! Gėlės prie malūno – kaip operos dekoracijos.'), A('thinking', 'Kol jos nedainuoja naktį, aš neprieštarauju.')];
  L[109] = [A('excited', 'Pusė kalvos sutvarkyta! Sparnai jau girgžda iš džiaugsmo.'), K('sneaky', 'Arba iš senatvės.')];
  L[110] = [K('surprised', 'Kurmiai ir čia?! Jie seka mus po visą sodą.'), A('wink', 'Kurmiai bent jau ne pelės.')];
  L[111] = [Z('happy', 'Bzz! Medus ir grūdai – bus medaus duonos!'), A('happy', 'Agota pritaria.')];
  L[112] = [A('thinking', 'Šešios rūšys… Prireiks išminties. Ir kantrybės.')];
  L[115] = [P('excited', 'Tiek maišų! Iš jų bus miltų visai žiemai.'), A('happy', 'Ir pyragų. Daug pyragų.')];
  L[119] = [A('excited', 'Paskutinė didžioji lysvė! Kai ją sutvarkysim, malūnas suksis kasdien.'), P('happy', 'Kartu mes tai padarysim!'), K('sneaky', 'Aš saugosiu trupinius.')];
  STORY.malunasStart = [P('excited', 'Oranžerija atgaivinta! Girdi girgždėjimą ant kalvos?'), A('happy', 'Uhu! Laukiu jūsų prie malūno.')];
  STORY.tips.push(A('wink', 'Sprogimas, palietęs miltų maišą, irgi jį pradrasko. Uhu – išmintinga!'));
})();

// Ką veikėjai pasako, kai juos paspaudi sode
(() => {
  const W = (who) => (e, t) => ({ who, e, t });
  const P = (e, t) => ({ e, t });
  const K = W('Karolis'), D = W('Dygliukas'), Z = W('Zuzė'), V = W('Kvaksė'), A = W('Agota');
  STORY.chat = [
    P('happy', 'Kutena! Hi-hi.'), P('wink', 'Gal pažaidžiam dar vieną lygį?'), P('excited', 'Uosčiau – ir radau kaulą! Na… šaknį.'), P('thinking', 'Kur aš palikau savo kastuvėlį?'),
    K('sneaky', 'Aš nieko nepaėmiau. Tas sagutes radau.'), K('happy', 'Kar! Matei, kaip blizga saulė ant stogo?'), K('thinking', 'Ar ant malūno sparnų būna blizgučių?'),
    D('happy', 'Gera žemė – pusė derliaus.'), D('wink', 'Akiniai ant nosies, kastuvas rankoje – ir viskas tvarkoj.'), D('thinking', 'Kurmiai vėl kasinėja… Girdžiu juos.'),
    Z('happy', 'Bzz! Šiandien aplankiau šimtą žiedų!'), Z('wink', 'Medaus? Tik šaukštelį.'), Z('excited', 'Bzz-bzz! Nekutenk sparnelių!'),
    V('excited', 'Kva! Nori išgirsti ariją? Ne? Vis tiek padainuosiu.'), V('happy', 'Šilta, drėgna, gražu – tobula oranžerija.'), V('wink', 'Aš ne varlė. Aš – primadona.'),
    A('thinking', 'Uhu. Išmintis – tai žinoti, kada pamiegoti.'), A('happy', 'Malūnas girgžda – vadinasi, gyvas.'), A('wink', 'Dieną aš tik apsimetu, kad miegu.'),
  ];
})();
