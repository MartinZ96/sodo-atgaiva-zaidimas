// Gyvas sodas: paros laikas, drugeliai, krentantys lapai, jonvabaliai.
const Ambient = (() => {
  const r = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // rytas 5–10, diena 10–17, vakaras 17–21, naktis 21–5
  function period(date = new Date()) {
    const h = date.getHours();
    if (h >= 5 && h < 10) return 'morning';
    if (h >= 10 && h < 17) return 'day';
    if (h >= 17 && h < 21) return 'evening';
    return 'night';
  }

  const WING = ['#f2c14e', '#e59aab', '#fffaf0', '#a9c8ea', '#f0a35a'];
  function butterfly() {
    const c = pick(WING);
    const pts = Array.from({ length: 5 }, () => [r(8, 88), r(12, 70)]);
    const vars = pts.map(([x, y], i) => `--x${i}:${x}%;--y${i}:${y}%`).join(';');
    return `<div class="amb-bfly" style="${vars};animation-duration:${r(14, 22)}s;animation-delay:-${r(0, 20)}s">
      <svg viewBox="0 0 20 16"><g class="w l"><ellipse cx="6" cy="6" rx="5.5" ry="4.5" fill="${c}"/><ellipse cx="7" cy="12" rx="3.5" ry="3" fill="${c}"/></g>
      <g class="w r"><ellipse cx="14" cy="6" rx="5.5" ry="4.5" fill="${c}"/><ellipse cx="13" cy="12" rx="3.5" ry="3" fill="${c}"/></g>
      <path d="M10 3 V14" stroke="#3a2a22" stroke-width="1.6" stroke-linecap="round"/></svg></div>`;
  }
  // Nupiešti drugeliai iš oranžerijos paveikslėlio (900×798): kiekvieno vieta paveikslėlyje
  const BF = [[0, 0, 400, 268], [492, 4, 408, 268], [196, 262, 495, 286], [16, 536, 404, 260], [468, 528, 408, 272]];
  function paintedButterfly() {
    const [x, y, w, h] = pick(BF);
    const url = Img.url('it_butterflies');
    const size = `background-image:url(${url});background-size:${((900 / w) * 200).toFixed(1)}% auto`;
    const py = ((y / (798 - h)) * 100).toFixed(2);
    const pxL = ((x / (900 - w / 2)) * 100).toFixed(2), pxR = (((x + w / 2) / (900 - w / 2)) * 100).toFixed(2);
    const pts = Array.from({ length: 5 }, () => [r(8, 88), r(12, 70)]);
    const vars = pts.map(([px, pyy], i) => `--x${i}:${px}%;--y${i}:${pyy}%`).join(';');
    const flap = r(0.18, 0.26).toFixed(2);
    return `<div class="amb-bfly painted" style="${vars};animation-duration:${r(14, 22)}s;animation-delay:-${r(0, 20)}s;aspect-ratio:${w}/${h}">
      <i class="bw l" style="${size};background-position:${pxL}% ${py}%;animation-duration:${flap}s"></i><i class="bw r" style="${size};background-position:${pxR}% ${py}%;animation-duration:${flap}s"></i></div>`;
  }
  const LEAF = ['#e9c25a', '#d9a640', '#c98a3a', '#b9c46a'];
  function leaf(wild) {
    const c = wild ? pick(['#9a8a5a', '#8a6a3a', '#a89a6a']) : pick(LEAF);
    return `<div class="amb-leaf" style="left:${r(2, 95)}%;animation-duration:${r(9, 15)}s;animation-delay:-${r(0, 14)}s">
      <div class="sway" style="animation-duration:${r(2.2, 3.4)}s"><svg viewBox="0 0 12 8"><ellipse cx="6" cy="4" rx="5.5" ry="2.6" fill="${c}"/><path d="M1 4 H11" stroke="rgba(80,50,20,.4)" stroke-width=".6"/></svg></div></div>`;
  }
  function firefly() {
    return `<div class="amb-fly" style="left:${r(4, 94)}%;top:${r(30, 92)}%;--dx:${r(-30, 30)}px;--dy:${r(-24, 10)}px;animation-duration:${r(4, 8)}s,${r(1.6, 3.2)}s;animation-delay:-${r(0, 6)}s,-${r(0, 3)}s"></div>`;
  }

  function flake() {
    const s = r(3, 7);
    return `<div class="amb-snow" style="left:${r(0, 100)}%;width:${s}px;height:${s}px;animation-duration:${r(6, 12)}s,${r(2, 4)}s;animation-delay:-${r(0, 12)}s,-${r(0, 4)}s;opacity:${r(0.6, 1).toFixed(2)}"></div>`;
  }
  // Kalėdinė girlianda per viršų
  function garland() {
    const cols = ['#e9524a', '#f3c64a', '#6fb06a', '#6aa8e0'];
    let b = '';
    for (let i = 0; i < 17; i++) {
      const x = 2 + i * 6;
      const y = 6 + 5 * Math.sin((Math.PI * ((x - 2) % 48)) / 48);
      b += `<circle cx="${x}" cy="${y + 1.6}" r="1.3" fill="${cols[i % 4]}" class="bulb" style="animation-delay:-${(i % 4) * 0.5}s"/>`;
    }
    return `<svg class="amb-garland" viewBox="0 0 100 16" preserveAspectRatio="xMidYMin meet"><path d="M2 6 Q26 16 50 6 Q74 16 98 6" stroke="#3a4a2a" stroke-width=".5" fill="none"/>${b}</svg>`;
  }

  // Grąžina sluoksnį, kuris dedamas virš sodo scenos
  function layer({ wild, progress, per = period(), snow = false }) {
    let h = `<div class="ambient ${per}${wild ? ' wild' : ''}${snow ? ' snowy' : ''}"><div class="gtint"></div>`;
    if (snow) {
      h += '<div class="amb-snowground"></div>' + garland();
      for (let i = 0; i < 26; i++) h += flake();
      h += '</div>';
      return h;
    }
    const leaves = per === 'night' ? 2 : wild ? 3 : 5;
    for (let i = 0; i < leaves; i++) h += leaf(wild);
    if (!wild && per !== 'night') {
      const n = Math.min(4, 1 + Math.floor(progress * 4));
      for (let i = 0; i < n; i++) h += Img.has('it_butterflies') ? paintedButterfly() : butterfly();
    }
    const flies = per === 'night' ? 12 : per === 'evening' ? 5 : 0;
    for (let i = 0; i < flies; i++) h += firefly();
    h += '</div>';
    return h;
  }

  return { period, layer };
})();
