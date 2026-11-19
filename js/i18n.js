// Kalbos. Žaidimas parašytas lietuviškai; kitai kalbai tekstai verčiami „ant ekrano“:
// kiekvienas naujai atsiradęs tekstas surandamas žodyne (pvz., js/lang-en.js) ir pakeičiamas.
// Žodyno raktas – lietuviškas tekstas, {0}, {1}… – kintamos dalys (skaičiai, pavadinimai).
// Naujas tekstas žaidime → pridėk jį į lang-en.js. Trūkstamus rodo: I18N.missing (konsolėje).
const I18N = (() => {
  const KEY = 'sodo-atgaiva-lang';
  const SAVE_KEY = 'sodo-atgaiva-v1';
  const DICTS = { en: typeof LANG_EN !== 'undefined' ? LANG_EN : {} };
  const NAMES = { lt: 'Lietuvių', en: 'English' };

  function detect() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && (saved === 'lt' || DICTS[saved])) return saved;
      // Esamiems žaidėjams (jau turi pažangos) paliekame lietuvių kalbą
      if (localStorage.getItem(SAVE_KEY)) return 'lt';
    } catch (e) { /* be saugyklos */ }
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'lt';
    return /^lt\b/i.test(nav) ? 'lt' : 'en';
  }
  const lang = detect();
  const on = lang !== 'lt';
  const dict = new Map();
  const pats = [];
  const values = new Set();
  const missing = new Set();
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const esc = (s) => s.replace(/[.*+?^$()|[\]\\]/g, '\\$&');

  if (on) {
    for (const [k, v] of Object.entries(DICTS[lang])) {
      values.add(norm(v));
      if (/\{\d\}/.test(k)) {
        const re = new RegExp('^' + esc(norm(k)).replace(/\\?\{(\d)\\?\}/g, '(.*?)') + '$');
        const order = [...k.matchAll(/\{(\d)\}/g)].map((m) => +m[1]);
        pats.push({ re, order, v });
      } else dict.set(norm(k), v);
    }
    // Ilgesni (konkretesni) šablonai tikrinami pirmiau
    pats.sort((a, b) => b.re.source.replace(/\(\.\*\?\)/g, '').length - a.re.source.replace(/\(\.\*\?\)/g, '').length);
  }

  // Vienos frazės vertimas (kintamos dalys irgi bandomos versti)
  function part(g) {
    if (!g || !/[A-Za-zÀ-ž]/.test(g)) return g;
    if (dict.has(g)) return dict.get(g);
    const num = g.match(/^([+×-]?\d+\s+)(.+)$/);
    if (num) return num[1] + part(num[2]);
    const cap = g[0].toUpperCase() + g.slice(1);
    if (dict.has(cap)) {
      const r = dict.get(cap);
      if (g === g.toLowerCase()) return r.toLowerCase();
      return g[0] === g[0].toLowerCase() ? r[0].toLowerCase() + r.slice(1) : r;
    }
    return g;
  }
  function tr(s, vars) {
    if (vars) s = s.replace(/\{(\d)\}/g, (m, i) => (vars[i] !== undefined ? '\u0002' + i + '\u0003' : m));
    let out = s;
    if (on) {
      const n = norm(s);
      if (dict.has(n)) out = dict.get(n);
      else {
        out = null;
        for (const p of pats) {
          const m = n.match(p.re);
          if (!m) continue;
          const groups = [];
          p.order.forEach((idx, j) => (groups[idx] = part(m[j + 1])));
          out = p.v.replace(/\{(\d)\}/g, (x, i) => (groups[i] !== undefined ? groups[i] : ''));
          break;
        }
        // Priekyje ženkliukas (🔒, ✓, ★…)? Verčiam likusią dalį
        const pre = out === null && n.match(/^([^A-Za-zÀ-ž{\u0002]+)([A-Za-zÀ-ž].*)$/);
        if (pre && pre[1].trim()) { const r = tr(pre[2]); if (r !== pre[2]) out = pre[1] + r; }
        if (out === null) { out = s; if (/[a-ząčęėįšųūž]{2}/i.test(n) && !values.has(n)) missing.add(n); }
      }
    }
    if (vars) {
      out = out.replace(/\u0002(\d)\u0003/g, (m, i) => part(String(vars[i])));
      if (on) values.add(norm(out));
    }
    return out;
  }

  // ---- Automatinis ekrano vertimas ----
  const ATTRS = ['aria-label', 'placeholder', 'title'];
  const skip = (node) => {
    for (let el = node.parentNode; el && el.nodeType === 1; el = el.parentNode) {
      if (el.hasAttribute('data-noi18n') || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return true;
    }
    return false;
  };
  const done = new WeakMap();   // jau išversti tekstai (kad nebūtų verčiama antrą kartą)
  function textNode(node) {
    const s = node.data;
    if (done.get(node) === s || !/[A-Za-zÀ-ž]{2}/.test(s) || skip(node)) return;
    const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0];
    const core = s.slice(lead.length, s.length - trail.length);
    if (values.has(norm(core))) return;
    const t = tr(core);
    if (t !== core) node.data = lead + t + trail;
    done.set(node, node.data);
  }
  function element(el) {
    for (const a of ATTRS) {
      const v = el.getAttribute && el.getAttribute(a);
      if (v && /[A-Za-zÀ-ž]{2}/.test(v)) { const t = tr(v); if (t !== v) el.setAttribute(a, t); }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return textNode(root);
    if (root.nodeType !== 1 || root.hasAttribute('data-noi18n')) return;
    element(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) textNode(n);
      else element(n);
    }
  }
  function start() {
    if (!on) return;
    document.documentElement.lang = lang;
    document.title = tr(document.title);
    walk(document.body);
    new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === 'characterData') textNode(m.target);
        else if (m.type === 'attributes') element(m.target);
        else m.addedNodes.forEach(walk);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function setLang(l) {
    try { localStorage.setItem(KEY, l); } catch (e) { /* nieko */ }
    location.reload();
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);

  return { lang, on, t: tr, setLang, NAMES, langs: ['lt', ...Object.keys(DICTS)], missing };
})();
const T = I18N.t;
