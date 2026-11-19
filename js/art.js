// Visa žaidimo grafika – piešiama SVG, jokių išorinių paveikslėlių.
// Stilius: šiltas, žemiškas (terakota, šalavijų žalia, medis, auksinė šviesa).
const ART = (() => {
  const wrap = (inner, vb = '0 0 100 100') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  // Bendri gradientai, kaukės ir filtrai – įdedami į puslapį vieną kartą
  const DEFS = `
  <radialGradient id="gApple" cx=".35" cy=".32" r=".75"><stop offset="0" stop-color="#f7876a"/><stop offset=".45" stop-color="#cf4630"/><stop offset="1" stop-color="#7d2018"/></radialGradient>
  <radialGradient id="gLemon" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#f0c64a"/><stop offset="1" stop-color="#b9831a"/></radialGradient>
  <radialGradient id="gBerry" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9aa9e0"/><stop offset=".5" stop-color="#4b5aa6"/><stop offset="1" stop-color="#232a58"/></radialGradient>
  <radialGradient id="gGrape" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#cfa6e0"/><stop offset=".5" stop-color="#8a55a6"/><stop offset="1" stop-color="#43205a"/></radialGradient>
  <radialGradient id="gPetal" cx=".5" cy=".95" r="1"><stop offset="0" stop-color="#b9566f"/><stop offset=".45" stop-color="#e59aab"/><stop offset="1" stop-color="#fbe3e6"/></radialGradient>
  <radialGradient id="gPetalIn" cx=".5" cy=".95" r="1"><stop offset="0" stop-color="#a8445f"/><stop offset=".6" stop-color="#e48ea1"/><stop offset="1" stop-color="#f7c9d1"/></radialGradient>
  <radialGradient id="gPollen" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff1b5"/><stop offset="1" stop-color="#d49a2a"/></radialGradient>
  <linearGradient id="gLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8dbb6c"/><stop offset=".55" stop-color="#4f8a45"/><stop offset="1" stop-color="#2c5530"/></linearGradient>
  <linearGradient id="gLeafDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5f8f52"/><stop offset="1" stop-color="#23452a"/></linearGradient>
  <radialGradient id="gStone" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#d9d2c6"/><stop offset=".55" stop-color="#9a9086"/><stop offset="1" stop-color="#5e554c"/></radialGradient>
  <radialGradient id="gFur" cx=".42" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".65" stop-color="#f6efe4"/><stop offset="1" stop-color="#dccdb6"/></radialGradient>
  <linearGradient id="gHat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dc9b"/><stop offset="1" stop-color="#c49b52"/></linearGradient>
  <linearGradient id="gPot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c4a2b"/><stop offset=".38" stop-color="#d9824f"/><stop offset=".7" stop-color="#c26a3d"/><stop offset="1" stop-color="#8e4225"/></linearGradient>
  <linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8875b"/><stop offset="1" stop-color="#7a5236"/></linearGradient>
  <linearGradient id="gWoodV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6e4a31"/><stop offset=".4" stop-color="#a87a52"/><stop offset="1" stop-color="#6e4a31"/></linearGradient>
  <linearGradient id="gSeed" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".5" stop-color="#e2a83c"/><stop offset="1" stop-color="#9c6a1c"/></linearGradient>
  <linearGradient id="gSack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ead2a2"/><stop offset=".6" stop-color="#c9a46a"/><stop offset="1" stop-color="#94703e"/></linearGradient>
  <linearGradient id="gBark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3a24"/><stop offset=".4" stop-color="#8a5f3c"/><stop offset="1" stop-color="#4e3220"/></linearGradient>
  <radialGradient id="gCrow" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#5a6488"/><stop offset=".5" stop-color="#2d3349"/><stop offset="1" stop-color="#161a26"/></radialGradient>
  <linearGradient id="gBeak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2c96a"/><stop offset="1" stop-color="#c4892c"/></linearGradient>
  <radialGradient id="gWater" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#a9d6d0"/><stop offset=".6" stop-color="#5f9fa0"/><stop offset="1" stop-color="#3d7376"/></radialGradient>
  <radialGradient id="gMurk" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#9a9a62"/><stop offset="1" stop-color="#5f5d3a"/></radialGradient>
  <mask id="mMonstera" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
    <rect width="100" height="100" fill="#fff"/>
    <g stroke="#000" stroke-width="4.5" stroke-linecap="round">
      <path d="M8 40 L30 45"/><path d="M12 60 L32 58"/><path d="M24 78 L40 69"/>
      <path d="M92 40 L70 45"/><path d="M88 60 L68 58"/><path d="M76 78 L60 69"/>
    </g>
    <g fill="#000"><ellipse cx="36" cy="34" rx="3" ry="4.5"/><ellipse cx="64" cy="34" rx="3" ry="4.5"/></g>
  </mask>
  <filter id="fGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <radialGradient id="gSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>
  <radialGradient id="gVignette" cx=".55" cy=".4" r=".8"><stop offset=".6" stop-color="#3b2312" stop-opacity="0"/><stop offset="1" stop-color="#3b2312" stop-opacity=".35"/></radialGradient>
  <radialGradient id="gGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2b8"/><stop offset=".4" stop-color="#ffd970" stop-opacity=".7"/><stop offset="1" stop-color="#ffd970" stop-opacity="0"/></radialGradient>`;

  function installDefs() {
    const holder = document.createElement('div');
    holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    holder.setAttribute('aria-hidden', 'true');
    holder.innerHTML = `<svg width="0" height="0" xmlns="http://www.w3.org/2000/svg"><defs>${DEFS}</defs></svg>`;
    document.body.prepend(holder);
  }

  const soft = 'stroke="rgba(60,30,20,.35)" stroke-width="1.5"';
  const shine = (x, y, rx, ry, rot = 0, o = 0.4) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="#fff" opacity="${o}"/>`;

  // 0 – Bijūnas
  const outer = [0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="50" cy="27" rx="16" ry="22" transform="rotate(${a} 50 50)"/>`).join('');
  const inner = [30, 90, 150, 210, 270, 330].map((a) => `<ellipse cx="50" cy="35" rx="11" ry="15" transform="rotate(${a} 50 50)"/>`).join('');
  const flower = wrap(
    `<g fill="url(#gPetal)" stroke="rgba(130,50,70,.35)" stroke-width="1.2">${outer}</g>` +
      `<g fill="url(#gPetalIn)" stroke="rgba(130,50,70,.3)" stroke-width="1">${inner}</g>` +
      `<circle cx="50" cy="50" r="9" fill="url(#gPollen)"/>` +
      `<g fill="#b9781e">${[[46, 47], [53, 46], [50, 53], [55, 52], [45, 53]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3"/>`).join('')}</g>`
  );

  // 1 – Obuolys
  const apple = wrap(
    `<path d="M50 30 C35 18 12 26 14 52 C16 78 34 92 50 84 C66 92 84 78 86 52 C88 26 65 18 50 30Z" fill="url(#gApple)" stroke="rgba(80,15,10,.45)" stroke-width="1.5"/>` +
      `<path d="M50 30 Q52 18 57 10" stroke="#4a2c18" stroke-width="4" fill="none" stroke-linecap="round"/>` +
      `<path d="M55 21 Q68 7 82 13 Q71 28 55 21Z" fill="url(#gLeaf)" stroke="rgba(30,60,30,.5)" stroke-width="1"/>` +
      `<path d="M57 20 Q68 14 78 14" stroke="#c9e3a8" stroke-width="1" fill="none" opacity=".7"/>` +
      shine(31, 46, 6, 12, 12, 0.35) +
      `<g fill="#ffd8b0" opacity=".35">${[[60, 50], [68, 62], [40, 66], [56, 72], [72, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2"/>`).join('')}</g>`
  );

  // 2 – Citrina
  const lemon = wrap(
    `<path d="M8 52 Q14 50 18 42 Q30 22 50 22 Q70 22 82 42 Q86 50 92 52 Q86 54 82 62 Q70 82 50 82 Q30 82 18 62 Q14 54 8 52Z" fill="url(#gLemon)" stroke="rgba(110,70,10,.45)" stroke-width="1.5"/>` +
      `<g fill="#fff8d2" opacity=".45">${[[34, 40], [44, 34], [58, 36], [66, 46], [40, 58], [54, 64], [68, 60], [28, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3"/>`).join('')}</g>` +
      shine(38, 36, 12, 4.5, -15, 0.45) +
      `<path d="M78 34 Q86 16 98 16 Q92 32 78 34Z" fill="url(#gLeaf)" stroke="rgba(30,60,30,.5)" stroke-width="1"/>`
  );

  // 3 – Monsteros lapas
  const leafPath = 'M50 90 C26 86 6 64 8 40 C10 20 30 8 47 14 L50 23 L53 14 C70 8 90 20 92 40 C94 64 74 86 50 90Z';
  const leaf = wrap(
    `<path d="M50 88 Q52 94 58 98" stroke="#3d6a36" stroke-width="3.5" fill="none" stroke-linecap="round"/>` +
      `<g mask="url(#mMonstera)"><path d="${leafPath}" fill="url(#gLeaf)" stroke="rgba(20,50,25,.5)" stroke-width="1.5"/>` +
      `<path d="M50 24 L50 86 M50 42 L30 46 M50 42 L70 46 M50 60 L32 59 M50 60 L68 59 M50 74 L38 72 M50 74 L62 72" stroke="#cfe6b0" stroke-width="1.6" fill="none" opacity=".75" stroke-linecap="round"/></g>` +
      shine(30, 30, 9, 4, -35, 0.25)
  );

  // 4 – Mėlynės
  const berry = (x, y, r) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#gBerry)" stroke="rgba(20,25,60,.5)" stroke-width="1.2"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#dfe6ff" opacity=".12"/>` +
    `<path d="M${x - 4} ${y - r + 4} l2 3 l2 -4 l2 4 l2 -3 l-1 5 h-6z" fill="#1c2147"/>` +
    shine(x - r * 0.4, y - r * 0.15, r * 0.22, r * 0.32, 15, 0.45);
  const blueberry = wrap(
    `<path d="M62 18 Q74 6 88 12 Q78 26 62 18Z" fill="url(#gLeaf)" stroke="rgba(30,60,30,.5)" stroke-width="1"/>` +
      berry(64, 40, 18) + berry(34, 46, 19) + berry(52, 70, 21)
  );

  // 5 – Vynuogės
  const gp = [[32, 42], [50, 40], [68, 42], [41, 58], [59, 58], [50, 75]];
  const grape = wrap(
    `<path d="M50 30 Q51 16 57 8" stroke="#4a2c18" stroke-width="4" fill="none" stroke-linecap="round"/>` +
      `<path d="M52 22 Q36 6 24 15 Q36 30 52 22Z" fill="url(#gLeaf)" stroke="rgba(30,60,30,.5)" stroke-width="1"/>` +
      gp.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="url(#gGrape)" stroke="rgba(50,20,60,.5)" stroke-width="1.2"/>`).join('') +
      gp.map(([x, y]) => `<ellipse cx="${x - 4}" cy="${y - 4}" rx="2.5" ry="3.5" fill="#fff" opacity=".4"/>`).join('')
  );

  // Auksinė sėkla (išvalo vieną spalvą)
  const rays = Array.from({ length: 12 }, (_, i) => `<path d="M50 50 L${50 + 46 * Math.cos((i * Math.PI) / 6)} ${50 + 46 * Math.sin((i * Math.PI) / 6)}" />`).join('');
  const rainbow = wrap(
    `<g stroke="#ffe39a" stroke-width="3" opacity=".7" stroke-linecap="round">${rays}</g>` +
      `<circle cx="50" cy="50" r="30" fill="url(#gGlow)"/>` +
      `<path d="M50 20 C66 30 70 52 62 70 Q56 82 50 84 Q44 82 38 70 C30 52 34 30 50 20Z" fill="url(#gSeed)" stroke="rgba(110,70,10,.55)" stroke-width="1.5"/>` +
      `<path d="M50 26 C46 42 46 62 50 78" stroke="#fff3c4" stroke-width="2" fill="none" opacity=".7"/>` +
      `<path d="M50 20 Q54 10 62 8 Q60 18 50 20Z" fill="url(#gLeaf)"/>` +
      shine(44, 40, 4, 10, 10, 0.5)
  );

  const stone = (lvl) =>
    wrap(
      `<ellipse cx="50" cy="86" rx="38" ry="7" fill="#3b2a1a" opacity=".25"/>` +
        `<path d="M12 66 Q8 38 30 24 Q50 10 72 22 Q94 34 90 62 Q88 86 60 88 L34 88 Q14 86 12 66Z" fill="url(#gStone)" stroke="rgba(40,30,20,.5)" stroke-width="1.5"/>` +
        shine(34, 34, 12, 5, -25, 0.3) +
        (lvl > 1
          ? `<path d="M16 70 Q24 60 36 66 Q44 58 54 66 Q46 74 36 72 Q26 78 16 70Z" fill="#6f8f52" opacity=".9"/><path d="M62 30 Q72 26 80 34 Q72 38 62 30Z" fill="#7fa05e" opacity=".85"/>`
          : `<path d="M52 22 L46 44 L58 54 L50 72 M58 54 L76 60" stroke="#3f3a35" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`)
    );

  const weed = (lvl) =>
    wrap(
      `<g stroke="${lvl > 1 ? '#3e5a2a' : '#5d7d3a'}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".9">` +
        `<path d="M18 96 Q20 66 10 50"/><path d="M32 96 Q34 62 40 42"/><path d="M50 96 Q48 64 56 34"/>` +
        `<path d="M66 96 Q66 68 78 50"/><path d="M82 96 Q86 76 94 66"/>` +
        (lvl > 1
          ? `<path d="M24 96 Q18 74 26 58"/><path d="M58 96 Q62 74 50 60"/><path d="M74 96 Q70 78 64 70"/><path d="M42 96 Q42 82 34 72"/>`
          : '') +
        `</g>`
    );

  const ice = wrap(
    `<rect x="10" y="10" width="80" height="80" rx="14" fill="#cfe6f0" stroke="#7fb0c8" stroke-width="3"/>` +
      `<path d="M24 30 L40 22 M22 46 L54 24" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`
  );

  const shovel = wrap(
    `<rect x="45" y="12" width="10" height="44" rx="4" fill="url(#gWoodV)" stroke="#5a3a22" stroke-width="1.5"/>` +
      `<rect x="33" y="6" width="34" height="11" rx="5" fill="url(#gWoodV)" stroke="#5a3a22" stroke-width="1.5"/>` +
      `<path d="M30 54 H70 V70 Q70 92 50 95 Q30 92 30 70Z" fill="#b9bcb8" stroke="#5f625e" stroke-width="1.5"/>` +
      `<path d="M38 60 V76" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".6"/>`
  );

  // Sėklų maišelis (reikia nuleisti į apačią)
  const seedBag = wrap(
    `<ellipse cx="50" cy="90" rx="28" ry="5" fill="#3b2312" opacity=".25"/>` +
      `<path d="M30 40 Q22 60 26 78 Q30 92 50 92 Q70 92 74 78 Q78 60 70 40Z" fill="url(#gSack)" stroke="rgba(80,50,20,.55)" stroke-width="1.5"/>` +
      `<path d="M32 46 Q50 52 68 46" stroke="#8a6436" stroke-width="2" fill="none"/>` +
      `<path d="M30 40 Q36 30 42 34 Q46 26 50 32 Q54 26 58 34 Q64 30 70 40 Q50 46 30 40Z" fill="#d9b981" stroke="rgba(80,50,20,.5)" stroke-width="1.2"/>` +
      `<path d="M50 34 Q50 20 50 14" stroke="#4f7a3e" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      `<path d="M50 20 Q38 10 32 16 Q40 26 50 20Z M50 16 Q62 4 70 10 Q62 22 50 16Z" fill="url(#gLeaf)"/>` +
      `<g fill="#7a5530" opacity=".55"><ellipse cx="42" cy="66" rx="3" ry="4.5"/><ellipse cx="54" cy="70" rx="3" ry="4.5"/><ellipse cx="48" cy="60" rx="2.5" ry="4"/></g>` +
      `<path d="M38 56 L42 80" stroke="#fff3d6" stroke-width="2" opacity=".35" stroke-linecap="round"/>`
  );

  // Samanos (plinta)
  const moss = wrap(
    `<g fill="#6f8f3e">` +
      `<circle cx="28" cy="34" r="16"/><circle cx="54" cy="26" r="15"/><circle cx="74" cy="42" r="16"/><circle cx="30" cy="66" r="17"/>` +
      `<circle cx="56" cy="58" r="18"/><circle cx="76" cy="74" r="14"/><circle cx="46" cy="80" r="14"/></g>` +
      `<g fill="#8fae52">${[[24, 30], [50, 22], [72, 38], [28, 62], [54, 54], [74, 70], [44, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g>` +
      `<g fill="#c9d98a">${[[22, 26], [48, 18], [70, 34], [26, 58], [52, 50], [72, 66], [42, 72], [62, 30], [36, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2"/>`).join('')}</g>`
  );

  // Kelmas (3 smūgiai)
  const stump = (lvl) =>
    wrap(
      `<ellipse cx="50" cy="88" rx="38" ry="7" fill="#3b2312" opacity=".25"/>` +
        `<path d="M16 40 V76 Q16 88 50 88 Q84 88 84 76 V40Z" fill="url(#gBark)" stroke="rgba(50,30,15,.55)" stroke-width="1.5"/>` +
        `<path d="M28 50 V80 M44 52 V86 M62 52 V86 M76 48 V78" stroke="#4e3220" stroke-width="2" opacity=".55"/>` +
        `<ellipse cx="50" cy="40" rx="34" ry="13" fill="#d8b07a" stroke="rgba(80,50,20,.55)" stroke-width="1.5"/>` +
        `<g fill="none" stroke="#b4874f" stroke-width="1.4"><ellipse cx="50" cy="40" rx="24" ry="9"/><ellipse cx="50" cy="40" rx="14" ry="5"/><ellipse cx="50" cy="40" rx="5" ry="2"/></g>` +
        (lvl < 3 ? `<path d="M30 34 L42 42 L36 48 M64 32 L58 42 L68 46" stroke="#5a3a20" stroke-width="2" fill="none"/>` : '') +
        (lvl < 2 ? `<path d="M20 52 L34 60 L26 72 M80 56 L68 64 L76 76" stroke="#3a2412" stroke-width="2.4" fill="none"/>` : '') +
        `<path d="M78 46 Q90 40 92 30 Q84 36 78 38Z" fill="url(#gLeaf)"/>`
    );

  // Kurmis kauburėlyje
  const mole = wrap(
    `<ellipse cx="50" cy="88" rx="40" ry="7" fill="#3b2312" opacity=".25"/>` +
      `<path d="M8 86 Q14 58 34 54 Q50 50 66 54 Q86 58 92 86Z" fill="#7a5233" stroke="rgba(50,30,15,.5)" stroke-width="1.5"/>` +
      `<g fill="#9a6c46"><circle cx="24" cy="76" r="4"/><circle cx="70" cy="80" r="3.5"/><circle cx="56" cy="70" r="3"/><circle cx="38" cy="82" r="3"/></g>` +
      `<path d="M30 60 Q30 30 50 28 Q70 30 70 60Z" fill="#5d5450" stroke="rgba(30,25,20,.55)" stroke-width="1.5"/>` +
      `<ellipse cx="50" cy="52" rx="10" ry="7" fill="#8a7d76"/>` +
      `<ellipse cx="50" cy="47" rx="5" ry="3.5" fill="#f2a7b0" stroke="#b9666f" stroke-width="1"/>` +
      `<circle cx="42" cy="40" r="2.6" fill="#1b1512"/><circle cx="58" cy="40" r="2.6" fill="#1b1512"/>` +
      `<circle cx="42.8" cy="39.2" r=".9" fill="#fff"/><circle cx="58.8" cy="39.2" r=".9" fill="#fff"/>` +
      `<g fill="#f2c9b8" stroke="#b9866f" stroke-width=".8"><ellipse cx="32" cy="60" rx="6" ry="4"/><ellipse cx="68" cy="60" rx="6" ry="4"/></g>` +
      `<path d="M27 59 l-3 -3 M29 57 l-1 -4 M73 59 l3 -3 M71 57 l1 -4" stroke="#b9866f" stroke-width="1.2" stroke-linecap="round"/>` +
      `<path d="M38 32 Q44 28 50 29" stroke="#8a807a" stroke-width="2" fill="none" opacity=".7"/>`
  );

  // Bičių korys (2 smūgiai) ir medaus lašas
  const hex = (x, y, r) => {
    const p = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return p;
  };
  const comb = (lvl) =>
    wrap(
      `<ellipse cx="50" cy="90" rx="38" ry="6" fill="#3b2312" opacity=".25"/>` +
        [[34, 36], [66, 36], [50, 50], [18, 50], [82, 50], [34, 64], [66, 64], [50, 78]].map(([x, y], i) =>
          `<polygon points="${hex(x, y, 15)}" fill="${i % 3 === 0 ? '#f2b43c' : '#e89e2a'}" stroke="#a8641a" stroke-width="2"/>` +
          `<polygon points="${hex(x, y, 9)}" fill="${i % 2 ? '#ffd86e' : '#c8781e'}" opacity=".85"/>`).join('') +
        `<path d="M44 80 Q46 92 50 94 Q54 92 52 82Z" fill="#f2b43c" stroke="#a8641a" stroke-width="1.2"/>` +
        `<ellipse cx="40" cy="44" rx="5" ry="3" fill="#fff6c8" opacity=".6"/>` +
        (lvl < 2 ? `<path d="M30 30 L40 46 L34 58 M62 40 L70 54" stroke="#5a3010" stroke-width="2.4" fill="none"/>` : '')
    );
  const honeyDrop = wrap(
    `<path d="M50 10 C62 32 80 48 80 64 C80 82 66 92 50 92 C34 92 20 82 20 64 C20 48 38 32 50 10Z" fill="#f2b43c" stroke="#a8641a" stroke-width="3"/>` +
      `<path d="M36 58 Q36 74 48 80" stroke="#fff3c4" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`
  );

  // ---------- Bitė Zuzė ----------
  function beeInner(expr = 'normal') {
    expr = { excited: 'happy', sneaky: 'wink' }[expr] || expr;
    const INKB = '#2a1a10';
    const eye = (x, dy = 0, big = false) =>
      `<ellipse cx="${x}" cy="${98 + dy}" rx="${big ? 10 : 8}" ry="${big ? 12 : 10}" fill="${INKB}"/><circle cx="${x + 3}" cy="${94 + dy}" r="${big ? 3.5 : 3}" fill="#fff"/><circle cx="${x - 2}" cy="${102 + dy}" r="1.4" fill="#fff" opacity=".7"/>` +
      `<path d="M${x - 9} ${88 + dy} l-4 -4 M${x - 5} ${86 + dy} l-2 -5" stroke="${INKB}" stroke-width="2" stroke-linecap="round"/>`;
    const closed = (x) => `<path d="M${x - 9} 100 Q${x} 90 ${x + 9} 100" stroke="${INKB}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    let eyes = eye(80) + eye(120);
    let mouth = `<path d="M92 120 Q100 127 108 120" stroke="${INKB}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    let extra = '';
    switch (expr) {
      case 'happy':
        eyes = closed(80) + closed(120);
        mouth = `<path d="M89 117 Q100 134 111 117Z" fill="#8a2f2f" stroke="${INKB}" stroke-width="2.4"/>`;
        break;
      case 'surprised':
        eyes = eye(80, 0, true) + eye(120, 0, true);
        mouth = `<ellipse cx="100" cy="123" rx="5" ry="6" fill="#8a2f2f" stroke="${INKB}" stroke-width="2.4"/>`;
        break;
      case 'sad':
        eyes = eye(80, 2) + eye(120, 2) + `<path d="M68 82 L90 88 M132 82 L110 88" stroke="${INKB}" stroke-width="2.6" stroke-linecap="round"/>`;
        mouth = `<path d="M92 125 Q100 118 108 125" stroke="${INKB}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        break;
      case 'thinking':
        eyes = eye(80, -4) + eye(120, -4);
        mouth = `<path d="M93 122 Q101 124 109 119" stroke="${INKB}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        extra = `<g fill="#b49a7a"><circle cx="152" cy="64" r="3"/><circle cx="160" cy="54" r="4"/><circle cx="170" cy="42" r="5"/></g>`;
        break;
      case 'wink':
        eyes = closed(80) + eye(120);
        mouth = `<path d="M89 117 Q100 134 111 117Z" fill="#8a2f2f" stroke="${INKB}" stroke-width="2.4"/>`;
        break;
    }
    return `
    <g class="bee-wings" opacity=".75">
      <ellipse cx="62" cy="150" rx="30" ry="44" transform="rotate(-30 62 150)" fill="#e8f4fa" stroke="#a9c8d6" stroke-width="2"/>
      <ellipse cx="138" cy="150" rx="30" ry="44" transform="rotate(30 138 150)" fill="#e8f4fa" stroke="#a9c8d6" stroke-width="2"/>
      <path d="M62 120 Q60 150 70 176 M138 120 Q140 150 130 176" stroke="#a9c8d6" stroke-width="1.5" fill="none"/>
    </g>
    <g class="bee-body">
      <ellipse cx="100" cy="190" rx="52" ry="50" fill="#f2c14e" stroke="#8a5a16" stroke-width="2.5"/>
      <path d="M52 178 Q100 168 148 178 L150 196 Q100 186 50 196Z" fill="#3a2a1a"/>
      <path d="M58 214 Q100 206 142 214 L136 228 Q100 222 64 228Z" fill="#3a2a1a"/>
      <path d="M96 238 L100 252 L104 238Z" fill="#3a2a1a"/>
      <ellipse cx="78" cy="174" rx="10" ry="6" fill="#fff4c4" opacity=".6"/>
      <g fill="#3a2a1a"><ellipse cx="74" cy="236" rx="8" ry="5"/><ellipse cx="126" cy="236" rx="8" ry="5"/></g>
      <path d="M128 168 L150 150" stroke="#8a5a16" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="156" cy="142" rx="10" ry="8" fill="#e9a43c" stroke="#8a5a16" stroke-width="2"/><path d="M148 140 h16 M150 146 h12" stroke="#8a5a16" stroke-width="1.5"/>
    </g>
    <g class="bee-head">
      <path d="M84 62 Q76 36 64 28" stroke="${INKB}" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="63" cy="27" r="6" fill="#3a2a1a"/>
      <path d="M116 62 Q124 36 136 28" stroke="${INKB}" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="137" cy="27" r="6" fill="#3a2a1a"/>
      <circle cx="100" cy="102" r="46" fill="#f7d26a" stroke="#8a5a16" stroke-width="2.5"/>
      <ellipse cx="68" cy="116" rx="9" ry="6" fill="#f0a39a" opacity=".6"/><ellipse cx="132" cy="116" rx="9" ry="6" fill="#f0a39a" opacity=".6"/>
      <g class="pk-eyes">${eyes}</g>
      ${mouth}
      <g transform="translate(118 58) rotate(20)"><circle cx="0" cy="0" r="6" fill="#e59aab"/><circle cx="8" cy="3" r="6" fill="#e59aab"/><circle cx="3" cy="-6" r="6" fill="#e59aab"/><circle cx="3" cy="0" r="3.5" fill="#f3d27a"/></g>
      ${extra}
    </g>`;
  }
  const bee = (expr = 'normal', portrait = false) =>
    `<svg class="bee" viewBox="${portrait ? '22 20 156 156' : '10 10 180 245'}" xmlns="http://www.w3.org/2000/svg">${beeInner(expr)}</svg>`;

  // ---------- Vazonas (pripildomas tam tikros spalvos elementais) ----------
  // fill – 0..1, kiek pripildyta (daigas auga)
  const pot = (fill = 0) => {
    const h = 6 + Math.round(fill * 26);
    return wrap(
      `<ellipse cx="50" cy="92" rx="32" ry="5" fill="#3b2312" opacity=".25"/>` +
      (fill > 0 ? `<path d="M50 44 Q49 ${44 - h / 2} 50 ${44 - h}" stroke="#4f7a32" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
        `<path d="M50 ${44 - h * 0.45} Q38 ${40 - h * 0.6} 34 ${46 - h * 0.6} Q44 ${48 - h * 0.45} 50 ${44 - h * 0.45}Z" fill="#7aa848" stroke="#4f7a32" stroke-width="1.2"/>` +
        `<path d="M50 ${44 - h * 0.75} Q62 ${40 - h * 0.9} 67 ${46 - h * 0.9} Q57 ${49 - h * 0.75} 50 ${44 - h * 0.75}Z" fill="#8cbc55" stroke="#4f7a32" stroke-width="1.2"/>` : '') +
      `<path d="M20 44 H80 L72 90 Q50 95 28 90Z" fill="#c8693c" stroke="#7a3a1c" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<rect x="15" y="36" width="70" height="13" rx="4" fill="#d67a48" stroke="#7a3a1c" stroke-width="2.5"/>` +
      `<ellipse cx="50" cy="38" rx="31" ry="3.5" fill="#5a3a22"/>` +
      `<path d="M28 54 Q30 74 36 86" stroke="#f0a77a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>` +
      `<path d="M30 66 Q50 72 70 66" stroke="#7a3a1c" stroke-width="1.6" fill="none" opacity=".5"/>`
    );
  };

  // ---------- Varlė Kvaksė ----------
  function frogInner(expr = 'normal') {
    expr = { excited: 'happy', sneaky: 'wink' }[expr] || expr;
    const INKF = '#1f2a14';
    const eye = (x, dy = 0, big = false) =>
      `<circle cx="${x}" cy="62" r="24" fill="#8cc152" stroke="#3f6a22" stroke-width="2.5"/>` +
      `<circle cx="${x}" cy="${62 + dy}" r="${big ? 16 : 14}" fill="#fffbea" stroke="${INKF}" stroke-width="1.5"/>` +
      `<circle cx="${x + 2}" cy="${64 + dy}" r="${big ? 7 : 8}" fill="${INKF}"/><circle cx="${x + 5}" cy="${60 + dy}" r="2.6" fill="#fff"/>`;
    const closed = (x) => `<circle cx="${x}" cy="62" r="24" fill="#8cc152" stroke="#3f6a22" stroke-width="2.5"/>` +
      `<path d="M${x - 12} 66 Q${x} 54 ${x + 12} 66" stroke="${INKF}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    let eyes = eye(68) + eye(132);
    let mouth = `<path d="M62 118 Q100 140 138 118" stroke="${INKF}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    let extra = '';
    switch (expr) {
      case 'happy':
        eyes = closed(68) + closed(132);
        mouth = `<path d="M60 114 Q100 156 140 114 Q100 128 60 114Z" fill="#c44a4a" stroke="${INKF}" stroke-width="3"/><path d="M86 130 Q100 142 114 130" fill="#f08a8a"/>`;
        break;
      case 'surprised':
        eyes = eye(68, 0, true) + eye(132, 0, true);
        mouth = `<ellipse cx="100" cy="126" rx="10" ry="12" fill="#c44a4a" stroke="${INKF}" stroke-width="3"/>`;
        break;
      case 'sad':
        eyes = eye(68, 4) + eye(132, 4) + `<path d="M50 40 L78 50 M150 40 L122 50" stroke="${INKF}" stroke-width="3" stroke-linecap="round"/>`;
        mouth = `<path d="M70 130 Q100 112 130 130" stroke="${INKF}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
        break;
      case 'thinking':
        eyes = eye(68, -4) + eye(132, -4);
        mouth = `<path d="M72 124 Q104 128 128 116" stroke="${INKF}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
        extra = `<g fill="#b49a7a"><circle cx="164" cy="40" r="3"/><circle cx="172" cy="28" r="4"/><circle cx="182" cy="14" r="5"/></g>`;
        break;
      case 'wink':
        eyes = closed(68) + eye(132);
        mouth = `<path d="M60 114 Q100 156 140 114 Q100 128 60 114Z" fill="#c44a4a" stroke="${INKF}" stroke-width="3"/>`;
        break;
    }
    return `
    <g class="frog-body">
      <ellipse cx="100" cy="246" rx="70" ry="9" fill="#2a3a1a" opacity=".25"/>
      <path d="M40 240 Q26 214 44 196 Q60 214 64 240Z" fill="#7cb342" stroke="#3f6a22" stroke-width="2.5"/>
      <path d="M160 240 Q174 214 156 196 Q140 214 136 240Z" fill="#7cb342" stroke="#3f6a22" stroke-width="2.5"/>
      <ellipse cx="100" cy="196" rx="62" ry="52" fill="#8cc152" stroke="#3f6a22" stroke-width="2.5"/>
      <ellipse cx="100" cy="206" rx="40" ry="34" fill="#e9f2c4" stroke="#a9bf6a" stroke-width="1.5"/>
      <g fill="#6a9a36"><circle cx="58" cy="176" r="5"/><circle cx="148" cy="190" r="6"/><circle cx="66" cy="210" r="4"/></g>
      <g fill="#7cb342" stroke="#3f6a22" stroke-width="2.2"><path d="M50 236 q-10 4 -14 -2 q8 -2 10 -8 q6 4 4 10Z"/><path d="M150 236 q10 4 14 -2 q-8 -2 -10 -8 q-6 4 -4 10Z"/></g>
    </g>
    <g class="frog-head">
      <ellipse cx="100" cy="106" rx="76" ry="52" fill="#8cc152" stroke="#3f6a22" stroke-width="2.5"/>
      <g class="pk-eyes">${eyes}</g>
      <ellipse cx="54" cy="112" rx="11" ry="7" fill="#f0a39a" opacity=".55"/><ellipse cx="146" cy="112" rx="11" ry="7" fill="#f0a39a" opacity=".55"/>
      <g fill="${INKF}"><circle cx="92" cy="98" r="2.2"/><circle cx="108" cy="98" r="2.2"/></g>
      ${mouth}
      <g transform="translate(150 40)"><path d="M0 0 Q14 -16 26 -4 Q14 8 0 0Z" fill="#f2a7c3" stroke="#b9667f" stroke-width="1.5"/><path d="M0 0 Q-4 -18 10 -22 Q14 -8 0 0Z" fill="#f7c2d6" stroke="#b9667f" stroke-width="1.5"/><circle cx="2" cy="-2" r="4" fill="#f3d27a"/></g>
      ${extra}
    </g>`;
  }
  const frog = (expr = 'normal', portrait = false) =>
    `<svg class="frog" viewBox="${portrait ? '14 12 172 172' : '10 0 180 258'}" xmlns="http://www.w3.org/2000/svg">${frogInner(expr)}</svg>`;

  // ---------- Ežiukas Dygliukas ----------
  function hedgeInner(expr = 'normal') {
    expr = { excited: 'happy' }[expr] || expr;
    const INKH = '#2a1d16';
    const eye = (x, dy = 0, big = false) =>
      `<circle cx="${x}" cy="${104 + dy}" r="${big ? 7 : 5.5}" fill="${INKH}"/><circle cx="${x + 2}" cy="${101 + dy}" r="${big ? 2.5 : 1.9}" fill="#fff"/>`;
    const closed = (x) => `<path d="M${x - 7} 106 Q${x} 98 ${x + 7} 106" stroke="${INKH}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    let eyes = eye(84) + eye(116);
    let mouth = `<path d="M94 132 Q100 137 106 132" stroke="${INKH}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    let extra = '';
    switch (expr) {
      case 'happy':
        eyes = closed(84) + closed(116);
        mouth = `<path d="M92 130 Q100 144 108 130Z" fill="#8a2f2f" stroke="${INKH}" stroke-width="2"/>`;
        break;
      case 'surprised':
        eyes = eye(84, 0, true) + eye(116, 0, true);
        mouth = `<ellipse cx="100" cy="135" rx="4" ry="5" fill="#8a2f2f" stroke="${INKH}" stroke-width="2"/>`;
        extra = `<path d="M74 84 Q82 78 92 82 M108 82 Q118 78 126 84" stroke="${INKH}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
        break;
      case 'sad':
        eyes = eye(84, 2) + eye(116, 2) + `<path d="M74 88 L92 92 M126 88 L108 92" stroke="${INKH}" stroke-width="2.4" stroke-linecap="round"/>`;
        mouth = `<path d="M94 136 Q100 131 106 136" stroke="${INKH}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
        break;
      case 'thinking':
        eyes = eye(84, -3) + eye(116, -3);
        mouth = `<path d="M94 134 Q102 136 108 131" stroke="${INKH}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
        extra = `<g fill="#b49a7a"><circle cx="150" cy="70" r="3"/><circle cx="158" cy="60" r="4"/><circle cx="168" cy="48" r="5"/></g>`;
        break;
      case 'sneaky':
      case 'wink':
        eyes = closed(84) + eye(116);
        mouth = `<path d="M92 130 Q100 144 108 130Z" fill="#8a2f2f" stroke="${INKH}" stroke-width="2"/>`;
        break;
    }
    const spikes = [];
    for (let i = 0; i <= 22; i++) {
      const a = Math.PI * (1.02 + (i / 22) * 0.96);
      const r0 = 56, r1 = 86 + (i % 2) * 8;
      const cx = 100, cy = 140;
      const p = (rr, da) => `${(cx + rr * Math.cos(a + da)).toFixed(1)} ${(cy + rr * Math.sin(a + da)).toFixed(1)}`;
      spikes.push(`<path d="M${p(r0, -0.1)} L${p(r1, 0)} L${p(r0, 0.1)}Z" fill="${i % 2 ? '#6b4a32' : '#8a6440'}"/>`);
    }
    return `
    <g class="hg-body">
      <ellipse cx="100" cy="150" rx="86" ry="78" fill="#5a3d28"/>
      ${spikes.join('')}
      <ellipse cx="100" cy="186" rx="58" ry="52" fill="#e9d2b0"/>
      <ellipse cx="100" cy="196" rx="38" ry="34" fill="#f5e6cc"/>
      <g fill="#d9b88f"><ellipse cx="66" cy="230" rx="16" ry="9"/><ellipse cx="134" cy="230" rx="16" ry="9"/></g>
      <path d="M58 200 Q100 214 142 200 L136 232 Q100 244 64 232Z" fill="#6f8f5a" opacity=".95"/>
      <path d="M86 214 h28 v14 h-28z" fill="#5b7a48"/><path d="M90 214 v-4 M110 214 v-4" stroke="#4c6a3c" stroke-width="2"/>
    </g>
    <g class="hg-head">
      <circle cx="68" cy="76" r="11" fill="#d9b88f"/><circle cx="68" cy="76" r="6" fill="#f0b9b0"/>
      <circle cx="132" cy="76" r="11" fill="#d9b88f"/><circle cx="132" cy="76" r="6" fill="#f0b9b0"/>
      <ellipse cx="100" cy="112" rx="48" ry="42" fill="#f3dfc0"/>
      <ellipse cx="100" cy="128" rx="20" ry="15" fill="#fbecd4"/>
      <ellipse cx="72" cy="122" rx="7" ry="4.5" fill="#f0a39a" opacity=".5"/><ellipse cx="128" cy="122" rx="7" ry="4.5" fill="#f0a39a" opacity=".5"/>
      <g class="pk-eyes">${eyes}</g>
      <g fill="none" stroke="#7a5a36" stroke-width="2.6"><circle cx="84" cy="104" r="12"/><circle cx="116" cy="104" r="12"/><path d="M96 103 Q100 99 104 103"/></g>
      <ellipse cx="100" cy="124" rx="7" ry="5" fill="${INKH}"/><ellipse cx="98" cy="122.5" rx="2.5" ry="1.3" fill="#fff" opacity=".5"/>
      ${mouth}
      ${extra}
    </g>`;
  }
  const hedge = (expr = 'normal', portrait = false) =>
    `<svg class="hedge" viewBox="${portrait ? '22 40 156 156' : '10 30 180 220'}" xmlns="http://www.w3.org/2000/svg">${hedgeInner(expr)}</svg>`;

  // ---------- Varnas Karolis ----------
  function crowInner(expr = 'normal') {
    expr = { excited: 'happy', wink: 'sneaky' }[expr] || expr;
    const eye = (x, look = 0) =>
      `<ellipse cx="${x}" cy="88" rx="13" ry="15" fill="#fffaf0" stroke="#1b1e2b" stroke-width="2"/>` +
      `<circle cx="${x + 3 + look}" cy="${90}" r="6.5" fill="#1b1e2b"/><circle cx="${x + 5 + look}" cy="87" r="2.2" fill="#fff"/>`;
    const closed = (x) => `<path d="M${x - 11} 90 Q${x} 80 ${x + 11} 90" stroke="#fffaf0" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    const lid = (x) => `<ellipse cx="${x}" cy="88" rx="13" ry="15" fill="#fffaf0" stroke="#1b1e2b" stroke-width="2"/><circle cx="${x + 5}" cy="92" r="6" fill="#1b1e2b"/><path d="M${x - 14} 84 Q${x} 76 ${x + 14} 84 L${x + 14} 76 L${x - 14} 76Z" fill="#2c3247"/><path d="M${x - 14} 84 Q${x} 78 ${x + 14} 84" stroke="#1b1e2b" stroke-width="2.5" fill="none"/>`;
    let eyes = eye(82) + eye(118);
    let beak = `<path d="M84 104 Q100 98 116 104 L100 134Z" fill="url(#gBeak)" stroke="#6a4a14" stroke-width="1.5" stroke-linejoin="round"/><path d="M86 106 Q100 104 114 106" stroke="#6a4a14" stroke-width="1.2" fill="none"/>`;
    let extra = '';
    switch (expr) {
      case 'happy':
        eyes = closed(82) + closed(118);
        beak = `<path d="M84 104 Q100 98 116 104 L100 128Z" fill="url(#gBeak)" stroke="#6a4a14" stroke-width="1.5" stroke-linejoin="round"/><path d="M88 110 L100 124 L112 110 Q100 116 88 110Z" fill="#8a2f2f"/>`;
        break;
      case 'sneaky':
        eyes = lid(82) + lid(118);
        extra = `<path d="M66 70 L94 78 M134 70 L106 78" stroke="#1b1e2b" stroke-width="3" stroke-linecap="round"/>`;
        break;
      case 'surprised':
        eyes = `<ellipse cx="82" cy="86" rx="15" ry="17" fill="#fffaf0" stroke="#1b1e2b" stroke-width="2"/><circle cx="82" cy="88" r="5" fill="#1b1e2b"/><ellipse cx="118" cy="86" rx="15" ry="17" fill="#fffaf0" stroke="#1b1e2b" stroke-width="2"/><circle cx="118" cy="88" r="5" fill="#1b1e2b"/>`;
        beak = `<path d="M84 104 Q100 98 116 104 L100 120Z" fill="url(#gBeak)" stroke="#6a4a14" stroke-width="1.5"/><path d="M88 116 Q100 112 112 116 L100 136Z" fill="url(#gBeak)" stroke="#6a4a14" stroke-width="1.5"/>`;
        break;
      case 'sad':
        eyes = eye(82, -2) + eye(118, -2) + `<path d="M68 72 L94 66 M132 72 L106 66" stroke="#1b1e2b" stroke-width="3" stroke-linecap="round"/>`;
        break;
      case 'thinking':
        eyes = eye(82, 4) + eye(118, 4);
        extra = `<g fill="#9a90a8"><circle cx="152" cy="58" r="3"/><circle cx="160" cy="48" r="4"/><circle cx="170" cy="36" r="5"/></g>`;
        break;
    }
    return `
    <g class="kr-body">
      <path d="M78 228 L74 246 M70 246 H80 M122 228 L126 246 M120 246 H130" stroke="#c48a3a" stroke-width="4" stroke-linecap="round"/>
      <path d="M60 210 Q40 236 52 248 Q66 236 78 222Z" fill="#232838"/>
      <ellipse cx="100" cy="178" rx="54" ry="58" fill="url(#gCrow)"/>
      <ellipse cx="100" cy="190" rx="32" ry="38" fill="#3a4160" opacity=".55"/>
      <path d="M48 156 Q30 196 58 226 Q70 200 66 166Z" fill="#1d2131"/>
      <path d="M152 156 Q170 196 142 226 Q130 200 134 166Z" fill="#1d2131"/>
      <path d="M78 140 Q100 152 122 140 L100 168Z" fill="none"/>
      <path d="M100 140 L100 166" stroke="#c9a96a" stroke-width="1.5"/>
      <circle cx="100" cy="170" r="7" fill="url(#gSeed)" stroke="#8a6420" stroke-width="1.5"/><circle cx="98" cy="168" r="2" fill="#fff6d0"/>
    </g>
    <g class="kr-head">
      <path d="M92 46 Q96 30 104 28 Q100 40 102 46 Q110 32 118 34 Q110 42 108 50Z" fill="#232838"/>
      <circle cx="100" cy="92" r="48" fill="url(#gCrow)"/>
      <path d="M62 78 Q70 58 92 54" stroke="#5d6a96" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
      ${eyes}
      ${beak}
      ${extra}
    </g>`;
  }
  const crow = (expr = 'normal', portrait = false) =>
    `<svg class="crow" viewBox="${portrait ? '22 22 156 156' : '20 0 170 252'}" xmlns="http://www.w3.org/2000/svg">${crowInner(expr)}</svg>`;

  // ---------- Pūkis ----------
  const INK = '#3a2a22';
  // Pūkio apranga: skrybėlės ir skarelės
  const HATS = {
    straw: `<ellipse cx="100" cy="48" rx="46" ry="10" fill="url(#gHat)" stroke="#9c7a3c" stroke-width="1.5"/>
        <path d="M76 48 Q75 20 100 20 Q125 20 124 48Z" fill="url(#gHat)" stroke="#9c7a3c" stroke-width="1.5"/>
        <path d="M77 41 Q100 47 123 41 L123.5 34 Q100 40 76.5 34Z" fill="#6f8f5a"/>
        <circle cx="116" cy="38" r="4" fill="#e59aab"/><circle cx="116" cy="38" r="1.6" fill="#f3d27a"/>
        <path d="M84 26 Q92 22 100 23" stroke="#fff6d8" stroke-width="2" fill="none" opacity=".6"/>`,
    flower: `<path d="M62 54 Q100 34 138 54" stroke="#5f8f4e" stroke-width="4" fill="none"/>` +
      [[64, 52, '#e59aab'], [76, 45, '#f3d27a'], [89, 41, '#fffaf0'], [102, 40, '#e59aab'], [115, 42, '#c9a6e0'], [127, 46, '#f3d27a'], [137, 53, '#fffaf0']]
        .map(([x, y, c]) => `<g>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${x + 4 * Math.cos((a * Math.PI) / 180)}" cy="${y + 4 * Math.sin((a * Math.PI) / 180)}" r="3.4" fill="${c}"/>`).join('')}<circle cx="${x}" cy="${y}" r="2.2" fill="#e2a83c"/></g>`).join('') +
      `<g fill="#6f9a52"><ellipse cx="70" cy="50" rx="4" ry="2" transform="rotate(-30 70 50)"/><ellipse cx="96" cy="42" rx="4" ry="2"/><ellipse cx="121" cy="45" rx="4" ry="2" transform="rotate(20 121 45)"/></g>`,
    cap: `<path d="M70 52 Q68 20 100 19 Q132 20 130 52Z" fill="#6f8f5a" stroke="#4c6a3c" stroke-width="1.5"/>
        <path d="M100 20 V52 M84 24 Q86 38 84 52 M116 24 Q114 38 116 52" stroke="#4c6a3c" stroke-width="1.2" fill="none"/>
        <path d="M124 48 Q152 44 164 54 Q144 58 122 54Z" fill="#5b7a48" stroke="#4c6a3c" stroke-width="1.5"/>
        <circle cx="100" cy="19" r="4" fill="#4c6a3c"/><path d="M80 30 Q88 24 96 24" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>`,
    beret: `<ellipse cx="94" cy="36" rx="44" ry="15" transform="rotate(-8 94 36)" fill="#c4673d" stroke="#8f4523" stroke-width="1.5"/>
        <path d="M60 46 Q96 56 132 40" stroke="#8f4523" stroke-width="3" fill="none"/><path d="M96 21 q3 -8 8 -9" stroke="#8f4523" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M70 32 Q84 24 100 24" stroke="#fff" stroke-width="2" opacity=".3" fill="none"/>`,
    winter: `<path d="M68 54 Q66 18 100 16 Q134 18 132 54Z" fill="#c9524a" stroke="#8f3530" stroke-width="1.5"/>
        <path d="M80 22 V52 M90 18 V52 M100 16 V52 M110 18 V52 M120 22 V52" stroke="#a8403a" stroke-width="1.5" opacity=".7"/>
        <rect x="64" y="44" width="72" height="13" rx="6" fill="#f4ead6" stroke="#cdbb9a" stroke-width="1.2"/>
        <path d="M70 50 h4 M78 50 h4 M86 50 h4 M94 50 h4 M102 50 h4 M110 50 h4 M118 50 h4 M126 50 h4" stroke="#cdbb9a" stroke-width="1.5"/>
        <g fill="#fffaf0" stroke="#e0d4bc" stroke-width="1"><circle cx="100" cy="12" r="9"/></g>`,
    santa: `<path d="M66 52 Q70 20 104 14 Q132 10 150 34 Q156 46 146 52Z" fill="#c83a32" stroke="#8f2a24" stroke-width="1.5"/>
        <path d="M104 16 Q124 14 140 30" stroke="#e86a5a" stroke-width="3" fill="none" opacity=".6"/>
        <rect x="62" y="44" width="78" height="14" rx="7" fill="#fffaf0" stroke="#ddd2bf" stroke-width="1.2"/>
        <circle cx="150" cy="52" r="9" fill="#fffaf0" stroke="#ddd2bf" stroke-width="1.2"/>
        <g fill="#4f8a3a"><path d="M76 46 q-6 -8 2 -10 q2 6 -2 10z"/><path d="M82 46 q2 -9 9 -6 q-3 5 -9 6z"/></g><g fill="#d8322a"><circle cx="80" cy="48" r="2.6"/><circle cx="84" cy="46" r="2.2"/></g>`,
    pumpkin: `<path d="M64 50 Q60 22 82 20 Q90 14 100 18 Q110 14 118 20 Q140 22 136 50 Q100 60 64 50Z" fill="#e2803a" stroke="#a8541c" stroke-width="1.5"/>
        <path d="M82 22 Q78 36 82 52 M100 18 V54 M118 22 Q122 36 118 52" stroke="#c4682a" stroke-width="2" fill="none"/>
        <path d="M100 18 Q98 8 104 4" stroke="#5f7a3a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M104 10 Q118 2 124 12 Q112 16 104 10Z" fill="#6f9a52"/><path d="M74 28 Q80 24 86 25" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>`,
    leafcrown: [[62, 54, '#c9603a', -40], [72, 44, '#e2a83c', -25], [84, 38, '#d9783a', -10], [97, 36, '#e9c25a', 0], [110, 37, '#c9603a', 12], [122, 42, '#e2a83c', 28], [133, 50, '#d9783a', 42]]
      .map(([x, y, c, r]) => `<g transform="rotate(${r} ${x} ${y})"><path d="M${x} ${y - 10} Q${x + 8} ${y - 4} ${x} ${y + 8} Q${x - 8} ${y - 4} ${x} ${y - 10}Z" fill="${c}" stroke="rgba(90,40,10,.4)" stroke-width="1"/><path d="M${x} ${y - 8} V${y + 6}" stroke="rgba(90,40,10,.4)" stroke-width="1"/></g>`).join('') +
      `<circle cx="104" cy="40" r="3.5" fill="#a8322a"/><circle cx="108" cy="38" r="3" fill="#a8322a"/>`,
    hearts: `<path d="M70 52 Q68 22 100 20 Q132 22 130 52Z" fill="#c8322e" stroke="#8f2420" stroke-width="1.5"/><ellipse cx="100" cy="50" rx="48" ry="9" fill="#c8322e" stroke="#8f2420" stroke-width="1.5"/><path d="M71 42 Q100 48 129 42 L129 36 Q100 42 71 36Z" fill="#f08aa0"/><path d="M116 34 q-4 -6 -8 0 q4 6 8 8 q4 -2 8 -8 q-4 -6 -8 0z" fill="#f4a6b8"/>`,
    bunny: `<path d="M70 54 Q100 34 130 54" stroke="#f2e6cf" stroke-width="6" fill="none"/><g stroke="#d8c6a2" stroke-width="1.5"><ellipse cx="84" cy="18" rx="10" ry="26" fill="#f6ecd8" transform="rotate(-12 84 18)"/><ellipse cx="116" cy="18" rx="10" ry="26" fill="#f6ecd8" transform="rotate(12 116 18)"/></g><ellipse cx="84" cy="20" rx="5" ry="18" fill="#f2a8a8" transform="rotate(-12 84 20)"/><ellipse cx="116" cy="20" rx="5" ry="18" fill="#f2a8a8" transform="rotate(12 116 20)"/>`,
    midsummer: `<path d="M62 54 Q100 34 138 54" stroke="#4f7a3a" stroke-width="6" fill="none"/>` + [[66, 50, '#fff6e0'], [82, 43, '#f3d27a'], [100, 40, '#fffaf0'], [118, 43, '#f2a8a8'], [134, 50, '#f3d27a']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/><circle cx="${x}" cy="${y}" r="1.8" fill="#e2a83c"/>`).join(''),
    none: '',
  };
  HATS.beret_teal = HATS.beret; HATS.winter_green = HATS.winter; HATS.cap_lilac = HATS.cap;
  const SCARVES = {
    hearts: ['#f2a0a8', '#c0505a', '#d8322a'],
    easter: ['#f3e2b0', '#b89a5a', '#8ab4e8'],
    plaid: ['#a8483a', '#6e2a20', '#f2c14e'],
    lilac: ['#9b7fc0', '#5f4a85', '#fff3fa'],
    green: ['#6f8f5a', '#4f6b3e', '#e9e1c8'],
    red: ['#c4504a', '#8f3530', '#fff3e6'],
    blue: ['#5f7fb2', '#3d5683', '#eef3ff'],
    gold: ['#e2b03c', '#a87a1c', '#fff6d0'],
    pink: ['#f0a3bd', '#c0607e', '#fff3f6'],
    orange: ['#e8823a', '#a8521c', '#fff3e0'],
    mint: ['#9fd0b0', '#5f9a74', '#f2fff6'],
    night: ['#3a4a6a', '#222c44', '#f2e9b0'],
  };
  let outfit = { hat: 'straw', scarf: 'green' };
  function pukisInner(expr = 'normal', look = outfit) {
    const hatId = look.hat;
    const sc = SCARVES[look.scarf] || SCARVES.green;
    const eyeOpen = (x, big = false, dy = 0) =>
      `<ellipse cx="${x}" cy="${94 + dy}" rx="${big ? 7 : 5.5}" ry="${big ? 8.5 : 6.5}" fill="${INK}"/>` +
      `<circle cx="${x + 2}" cy="${91 + dy}" r="${big ? 2.8 : 2.1}" fill="#fff"/>`;
    const eyeClosed = (x) => `<path d="M${x - 8} 96 Q${x} 87 ${x + 8} 96" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    const eyeSad = (x) => `<path d="M${x - 7} 93 Q${x} 99 ${x + 7} 93" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    const smile = `<path d="M100 111 V115 M90 114 Q95 120 100 115 Q105 120 110 114" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    const open = `<path d="M100 111 V114" stroke="${INK}" stroke-width="2.5"/><path d="M88 114 Q100 134 112 114 Q100 118 88 114Z" fill="#7a2e2e" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M94 123 Q100 131 106 123 Q100 120 94 123Z" fill="#ec8c8c"/>`;
    let eyes = eyeOpen(80) + eyeOpen(120);
    let mouth = smile;
    let extra = '';
    switch (expr) {
      case 'happy':
        eyes = eyeClosed(80) + eyeClosed(120);
        mouth = open;
        break;
      case 'excited':
        eyes = eyeOpen(80, true) + eyeOpen(120, true);
        mouth = open;
        extra = `<g fill="#f2c14e"><path d="M40 60 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z"/><path d="M160 54 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/></g>`;
        break;
      case 'surprised':
        eyes = eyeOpen(80, true) + eyeOpen(120, true);
        mouth = `<path d="M100 111 V113" stroke="${INK}" stroke-width="2.5"/><ellipse cx="100" cy="120" rx="5" ry="6.5" fill="#7a2e2e" stroke="${INK}" stroke-width="2.5"/>`;
        extra = `<path d="M70 78 Q78 72 88 76 M112 76 Q122 72 130 78" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        break;
      case 'sad':
        eyes = eyeSad(80) + eyeSad(120);
        mouth = `<path d="M100 111 V115 M91 121 Q100 114 109 121" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        extra = `<path d="M70 82 L86 86 M130 82 L114 86" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><path d="M128 100 Q131 107 128 110 Q125 107 128 100Z" fill="#8cc7e8"/>`;
        break;
      case 'thinking':
        eyes = eyeOpen(80, false, -4) + eyeOpen(120, false, -4);
        mouth = `<path d="M100 111 V115 M93 118 Q101 120 109 115" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        extra = `<g fill="#b49a7a"><circle cx="150" cy="62" r="3"/><circle cx="158" cy="52" r="4"/><circle cx="168" cy="40" r="5"/></g>`;
        break;
      case 'wink':
        eyes = eyeClosed(80) + eyeOpen(120);
        mouth = open;
        break;
      case 'sleep':
        eyes = [80, 120].map((x) => `<path d="M${x - 8} 93 Q${x} 100 ${x + 8} 93" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`).join('');
        mouth = `<path d="M100 111 V114 M94 117 Q100 120 106 117" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        extra = '<g class="pk-zzz" fill="#8a7a6a" font-family="Georgia, serif" font-weight="700"><text x="148" y="60" font-size="16">z</text><text x="160" y="44" font-size="22">Z</text><text x="174" y="24" font-size="28">Z</text></g>';
        break;
    }
    const fluff = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return `<circle cx="${(100 + 52 * Math.cos(a)).toFixed(1)}" cy="${(94 + 46 * Math.sin(a)).toFixed(1)}" r="15"/>`;
    }).join('');
    const bodyFluff = [[52, 170], [48, 200], [50, 228], [148, 170], [152, 200], [150, 228]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14"/>`).join('');
    return `
    <g class="pk-tail" fill="url(#gFur)" stroke="#d6c6ae" stroke-width="1.5"><circle cx="166" cy="214" r="18"/><circle cx="174" cy="196" r="14"/><circle cx="178" cy="182" r="10"/></g>
    <g class="pk-body">
      <g fill="url(#gFur)" stroke="#d6c6ae" stroke-width="1.5">
        ${bodyFluff}
        <path d="M50 244 Q40 170 70 138 L130 138 Q160 170 150 244Z"/>
        <ellipse cx="78" cy="240" rx="17" ry="10"/><ellipse cx="122" cy="240" rx="17" ry="10"/>
      </g>
      <path d="M50 244 Q40 170 70 138 L130 138 Q160 170 150 244Z" fill="url(#gFur)"/>
      <path d="M72 236 v6 M78 236 v7 M84 236 v6 M116 236 v6 M122 236 v7 M128 236 v6" stroke="#d6c6ae" stroke-width="1.5"/>
      <path d="M64 134 Q100 150 136 134 L104 178 Q100 183 96 178Z" fill="${sc[0]}" stroke="${sc[1]}" stroke-width="1.5"/>
      <g fill="${sc[2]}" opacity=".85"><circle cx="86" cy="146" r="2.5"/><circle cx="104" cy="152" r="2.5"/><circle cx="118" cy="144" r="2.5"/><circle cx="98" cy="166" r="2.5"/></g>
    </g>
    <g class="pk-head">
      <g class="pk-ear-l"><path d="M60 70 L50 24 Q56 18 86 50 Z" fill="url(#gFur)" stroke="#d6c6ae" stroke-width="1.5" stroke-linejoin="round"/><path d="M62 60 L56 32 L77 52Z" fill="#efb6ae"/></g>
      <g class="pk-ear-r"><path d="M140 70 L150 24 Q144 18 114 50 Z" fill="url(#gFur)" stroke="#d6c6ae" stroke-width="1.5" stroke-linejoin="round"/><path d="M138 60 L144 32 L123 52Z" fill="#efb6ae"/></g>
      <g fill="url(#gFur)" stroke="#d6c6ae" stroke-width="1.5">${fluff}<circle cx="64" cy="116" r="20"/><circle cx="136" cy="116" r="20"/></g>
      <ellipse cx="100" cy="96" rx="54" ry="48" fill="url(#gFur)"/>
      <ellipse cx="100" cy="112" rx="22" ry="14" fill="#fffdf8" opacity=".9"/>
      <ellipse cx="70" cy="110" rx="8" ry="5" fill="#f0a39a" opacity=".45"/><ellipse cx="130" cy="110" rx="8" ry="5" fill="#f0a39a" opacity=".45"/>
      <g class="pk-eyes">${eyes}</g>
      <ellipse cx="100" cy="106" rx="8" ry="5.5" fill="${INK}"/><ellipse cx="98" cy="104.5" rx="3" ry="1.5" fill="#fff" opacity=".5"/>
      ${mouth}
      <g class="pk-hat">${HATS[hatId] || ''}</g>
      ${extra}
    </g>`;
  }
  const pukis = (expr = 'normal', portrait = false, look) =>
    `<svg class="pukis" viewBox="${portrait ? '22 4 156 156' : '20 0 170 252'}" xmlns="http://www.w3.org/2000/svg">${pukisInner(expr, look || outfit)}</svg>`;

  // Pagalbų ikonos
  const can = wrap(
    `<path d="M24 44 H62 V80 Q62 88 54 88 H32 Q24 88 24 80Z" fill="#7f9fb0" stroke="#4d6a78" stroke-width="1.5"/>` +
      `<path d="M62 52 L86 30 L92 36 L66 62" fill="#7f9fb0" stroke="#4d6a78" stroke-width="1.5" stroke-linejoin="round"/>` +
      `<ellipse cx="89" cy="32" rx="7" ry="4" transform="rotate(-45 89 32)" fill="#9bb8c6" stroke="#4d6a78" stroke-width="1.5"/>` +
      `<path d="M30 44 Q42 18 56 44" stroke="#4d6a78" stroke-width="4" fill="none"/>` +
      `<path d="M30 54 V80" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/>` +
      `<g fill="#8cc7e8"><circle cx="94" cy="44" r="2.5"/><circle cx="98" cy="52" r="2"/><circle cx="90" cy="54" r="2"/></g>`
  );
  const rake = wrap(
    `<rect x="46" y="8" width="8" height="58" rx="3" fill="url(#gWoodV)" stroke="#5a3a22" stroke-width="1.2"/>` +
      `<rect x="22" y="64" width="56" height="9" rx="3" fill="#8a8f8c" stroke="#4f5452" stroke-width="1.2"/>` +
      `<g stroke="#6f7472" stroke-width="4" stroke-linecap="round">${[28, 38, 48, 58, 68].map((x) => `<path d="M${x + 2} 73 V90"/>`).join('')}</g>`
  );
  const setOutfit = (o) => { outfit = { ...outfit, ...o }; };

  return {
    installDefs,
    pieces: [flower, apple, lemon, leaf, blueberry, grape],
    names: ['Bijūnai', 'Obuoliai', 'Citrinos', 'Monsteros lapai', 'Mėlynės', 'Vynuogės'],
    rainbow,
    stone,
    weed,
    ice,
    shovel,
    pukis,
    pukisInner,
    setOutfit,
    can,
    rake,
    booster: (k) => ({ shovel, can, rake })[k],
    crow,
    crowInner,
    seedBag,
    moss,
    stump,
    // Pagal veikėjo vardą
    portrait: (who, expr) => (who === 'Karolis' ? crow(expr, true) : who === 'Dygliukas' ? hedge(expr, true) : who === 'Zuzė' ? bee(expr, true) : who === 'Kvaksė' ? frog(expr, true) : pukis(expr, true)),
    comb,
    honeyDrop,
    bee,
    beeInner,
    frog,
    frogInner,
    pot,
    mole,
    hedge,
    hedgeInner,
    leafPath,
  };
})();

// Malūno kliūtys (be paveikslėlių – kaip akmuo)
ART.sack = (lvl) => ART.stone(lvl);
ART.grain = '<span class="score-ico">🌾</span>';
ART.owl = (expr, portrait) => ART.pukis(expr, portrait);

// Jei yra sugeneruotų paveikslėlių – pakeičiam jais SVG grafiką (trūkstami lieka SVG)
ART.useImages = () => {
  for (let i = 0; i < 6; i++) if (Img.has('piece' + i)) ART.pieces[i] = Img.tag('piece' + i);
  if (Img.has('rainbow')) ART.rainbow = Img.tag('rainbow');
  if (Img.has('seed')) ART.seedBag = Img.tag('seed');
  if (Img.has('moss')) ART.moss = Img.tag('moss');
  if (Img.has('mole')) ART.mole = Img.tag('mole');
  const crack = (lvl) => `<svg class="crack" viewBox="0 0 100 100"><g stroke="#2e2218" stroke-width="3" fill="none" stroke-linejoin="round" opacity=".75">` +
    (lvl < 3 ? '<path d="M50 20 L44 42 L56 52 L48 70"/>' : '') + (lvl < 2 ? '<path d="M24 46 L36 56 L30 72 M76 40 L66 54 L74 70"/>' : '') + '</g></svg>';
  const svgStone = ART.stone;
  ART.stone = (lvl) => {
    const k = lvl > 1 ? 'stone2' : 'stone1';
    if (Img.has(k)) return Img.tag(k);
    if (Img.has('stone1')) return Img.tag('stone1') + crack(lvl);
    return svgStone(lvl);
  };
  const svgStump = ART.stump;
  ART.stump = (lvl) => (Img.has('stump') ? Img.tag('stump') + crack(lvl) : svgStump(lvl));
  // Pagalbos
  const svgBooster = ART.booster;
  ART.booster = (k) => (Img.has('b_' + k) ? Img.tag('b_' + k) : svgBooster(k));
  ART.boosterIcon = (k) => (Img.has('b_' + k) ? Img.tag('b_' + k, 'pimg chip-ic') : null);
  if (Img.has('ice')) ART.ice = Img.tag('ice');
  const svgComb = ART.comb;
  ART.comb = (lvl) => (Img.has('comb') ? Img.tag('comb') + crack(lvl + 1) : svgComb(lvl));
  if (Img.has('honey')) ART.honeyDrop = Img.tag('honey');
  const svgSack = ART.sack;
  ART.sack = (lvl) => (Img.has(lvl > 1 ? 'sack' : 'sack_torn') ? Img.tag(lvl > 1 ? 'sack' : 'sack_torn') : svgSack(lvl));
  if (Img.has('grain')) ART.grain = Img.tag('grain');
  const svgPot = ART.pot;
  ART.pot = (fill) => (Img.has('pot') ? Img.tag('pot') : svgPot(fill));
  const svgWeed = ART.weed;
  ART.weed = (lvl) => (Img.has('weed') ? Img.tag('weed', lvl > 1 ? 'pimg dense' : 'pimg') : svgWeed(lvl));

  // Veikėjai: sugeneruotas paveikslėlis pagal emociją (jei trūksta – „normal“, jei ir jo nėra – SVG)
  const charImg = (prefix, expr, map, portrait) => {
    const e = map[expr] || expr;
    const key = Img.has(prefix + e) ? prefix + e : Img.has(prefix + 'normal') ? prefix + 'normal' : null;
    if (!key) return null;
    return `<span class="charimg${portrait ? ' portrait' : ''}">${Img.tag(key, 'cimg')}</span>`;
  };
  const svgPukis = ART.pukis, svgCrow = ART.crow, svgHedge = ART.hedge, svgBee = ART.bee, svgFrog = ART.frog;
  ART.bee = (expr = 'normal', portrait = false) =>
    charImg('zz_', expr, { excited: 'happy', sneaky: 'wink' }, portrait) || svgBee(expr, portrait);
  const svgOwl = ART.owl;
  ART.owl = (expr = 'normal', portrait = false) =>
    charImg('ag_', expr, { excited: 'happy', sneaky: 'wink', sleep: 'thinking' }, portrait) || svgOwl(expr, portrait);
  ART.frog = (expr = 'normal', portrait = false) =>
    charImg('kv_', expr, { excited: 'happy', sneaky: 'wink' }, portrait) || svgFrog(expr, portrait);
  // Pūkio apranga ant nupiešto Pūkio: Pūkis be drabužių + kepurė + skarelė (atskiri paveikslėliai).
  // Vietos – procentais nuo Pūkio figūros (išmatuota originaliuose ChatGPT paveikslėliuose).
  const PB = { x0: 159, y0: 23, w: 920, h: 1190 };
  const box = (x0, y0, x1, y1) => ({ l: ((x0 - PB.x0) / PB.w) * 100, t: ((y0 - PB.y0) / PB.h) * 100, w: ((x1 - x0) / PB.w) * 100 });
  const WEAR = {
    hat: {
      straw: ['hat_siaudine', box(92, 72, 1160, 589)], flower: ['hat_geles', box(147, 117, 1096, 485)],
      cap: ['hat_sodininko', box(164, 58, 1082, 462)], beret: ['hat_berete', box(196, 50, 1057, 437)],
      winter: ['hat_megzta', box(275, -70, 975, 400)], pumpkin: ['hat_moliugo', box(199, 73, 1050, 436)],
      leafcrown: ['hat_lapu', box(147, 63, 1098, 465)], santa: ['hat_kaledu', box(227, 43, 1153, 471)],
      hearts: ['hat_sirdeliu', box(131, 79, 1119, 569)], bunny: ['hat_kiskio', box(257, -326, 991, 443)], midsummer: ['hat_jonines', box(165, 50, 1095, 560)],
      // Perdažyti variantai (tas pats paveikslėlis + spalvų filtras)
      beret_teal: ['hat_berete', box(196, 50, 1057, 437), 'hue-rotate(140deg) saturate(1.1)'],
      winter_green: ['hat_megzta', box(275, -70, 975, 400), 'hue-rotate(90deg)'],
      cap_lilac: ['hat_sodininko', box(164, 58, 1082, 462), 'hue-rotate(200deg) saturate(.8)'],
    },
    scarf: {
      green: ['scarf_zalia', box(386, 667, 841, 949)], red: ['scarf_raudona', box(394, 664, 836, 948)],
      blue: ['scarf_melyna', box(386, 663, 844, 950)], gold: ['scarf_auksine', box(384, 655, 853, 952)],
      plaid: ['scarf_languota', box(390, 664, 852, 950)], lilac: ['scarf_alyvine', box(388, 662, 864, 951)],
      hearts: ['scarf_sirdeliu', box(384, 665, 843, 954)], easter: ['scarf_velyku', box(383, 667, 845, 956)],
      pink: ['scarf_raudona', box(394, 664, 836, 948), 'hue-rotate(-30deg) saturate(.75) brightness(1.35)'],
      orange: ['scarf_raudona', box(394, 664, 836, 948), 'hue-rotate(28deg) saturate(1.2) brightness(1.15)'],
      mint: ['scarf_zalia', box(386, 667, 841, 949), 'hue-rotate(35deg) brightness(1.2) saturate(.8)'],
      night: ['scarf_melyna', box(386, 663, 844, 950), 'brightness(.55) saturate(1.4)'],
    },
  };
  const PB_EXPR = ['normal', 'happy', 'excited', 'surprised', 'sad', 'thinking', 'wink', 'sleep'];
  // Liūdnas Pūkis nuleidžia galvą – kepurė truputį žemiau
  const HAT_DY = { sad: 1 };
  function dressed(expr, look, portrait) {
    const e = PB_EXPR.includes(expr) ? expr : ({ sneaky: 'wink' })[expr] || 'normal';
    if (!Img.has('pb_' + e)) return null;
    const lay = (slot, dy = 0) => {
      const w = WEAR[slot][look[slot]];
      if (!w || !Img.has(w[0])) return '';
      const b = w[1];
      return `<img class="pkd-${slot}" src="${Img.url(w[0])}" style="left:${b.l.toFixed(1)}%;top:${(b.t + dy).toFixed(1)}%;width:${b.w.toFixed(1)}%${w[2] ? `;filter:${w[2]}` : ''}" alt="" draggable="false">`;
    };
    return `<span class="charimg pkd${portrait ? ' portrait' : ''}"><span class="pkd-in"><img class="pkd-base" src="${Img.url('pb_' + e)}" alt="" draggable="false">${lay('scarf')}${lay('hat', HAT_DY[e] || 0)}</span></span>`;
  }
  const isDefault = (o) => (o.hat || 'straw') === 'straw' && (o.scarf || 'green') === 'green';
  // look – kokią aprangą rodyti (pagal nutylėjimą – dabartinė Pūkio apranga)
  ART.pukis = (expr = 'normal', portrait = false, look) => {
    const o = look || Store.data.outfit || {};
    const full = { hat: o.hat || 'straw', scarf: o.scarf || 'green' };
    if (isDefault(full)) return charImg('pk_', expr, {}, portrait) || svgPukis(expr, portrait, look);
    return dressed(expr, full, portrait) || (look ? svgPukis(expr, portrait, look) : charImg('pk_', expr, {}, portrait)) || svgPukis(expr, portrait, look);
  };
  ART.crow = (expr = 'normal', portrait = false) =>
    charImg('kr_', expr, { excited: 'happy', wink: 'sneaky' }, portrait) || svgCrow(expr, portrait);
  ART.hedge = (expr = 'normal', portrait = false) =>
    charImg('dg_', expr, { excited: 'happy', sneaky: 'wink' }, portrait) || svgHedge(expr, portrait);
  ART.portrait = (who, expr) => (who === 'Karolis' ? ART.crow(expr, true) : who === 'Dygliukas' ? ART.hedge(expr, true) : who === 'Zuzė' ? ART.bee(expr, true) : who === 'Kvaksė' ? ART.frog(expr, true) : who === 'Agota' ? ART.owl(expr, true) : ART.pukis(expr, true));
};
