// Žaidėjo pažangos išsaugojimas telefone (localStorage).
const Store = (() => {
  const KEY = 'sodo-atgaiva-v1';
  const DEFAULTS = {
    unlocked: 1,     // kiek lygių atrakinta
    stars: {},       // lygio indeksas -> geriausios žvaigždutės
    best: {},        // lygio indeksas -> geriausi taškai
    garden: 0,       // kiek sodo darbų atlikta
    spent: 0,        // kiek žvaigždučių išleista sodui
    shovels: 3,      // kastuvėliai (pagalba)
    lastDaily: null, // paskutinės dienos dovanos data
    sound: true,
    seenWelcome: false,
    seenTalk: {},    // kuriems lygiams Pūkis jau papasakojo įžangą
  };
  let data = { ...DEFAULTS };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      data = Object.assign({}, DEFAULTS, raw ? JSON.parse(raw) : {});
    } catch (e) {
      data = { ...DEFAULTS };
    }
    return data;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* tyliai ignoruojam */ }
  }
  function totalStars() {
    return Object.values(data.stars).reduce((a, b) => a + b, 0);
  }
  return {
    get data() { return data; },
    load,
    save,
    totalStars,
    available: () => totalStars() + (data.bonusStars || 0) - data.spent,
  };
})();
