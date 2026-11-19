// Sugeneruoti paveikslėliai. Jei failo nėra – naudojama SVG grafika iš art.js.
// Failai laikomi www/img/ aplanke. Originalus dėk į sodo-atgaiva/originalai/ ir apdorok įrankiu tools.html.
const ASSET_LIST = [
  // Lentos elementai (kvadratiniai, 256×256)
  { key: 'piece0', file: 'bijunas', kind: 'piece' },
  { key: 'piece1', file: 'obuolys', kind: 'piece' },
  { key: 'piece2', file: 'citrina', kind: 'piece' },
  { key: 'piece3', file: 'monstera_lapas', kind: 'piece' },
  { key: 'piece4', file: 'melynes', kind: 'piece' },
  { key: 'piece5', file: 'vynuoges', kind: 'piece' },
  { key: 'rainbow', file: 'auksine_sekla', kind: 'piece' },
  { key: 'seed', file: 'seklu_maiselis', kind: 'piece' },
  // Kliūtys
  { key: 'stone1', file: 'akmuo', kind: 'piece' },
  { key: 'stone2', file: 'akmuo_samanotas', kind: 'piece' },
  { key: 'stump', file: 'kelmas', kind: 'piece' },
  { key: 'moss', file: 'samanos', kind: 'piece' },
  { key: 'weed', file: 'piktzoles', kind: 'piece' },
  // Terasa
  { key: 'bg_terasa', file: 'fonas_terasa', kind: 'bg' },
  { key: 'it_monstera', file: 'monstera_vazone', kind: 'sticker' },
  { key: 'it_shelf', file: 'lentynele', kind: 'sticker' },
  { key: 'it_hanging', file: 'kabantis_vazonas', kind: 'sticker' },
  { key: 'it_bench', file: 'suoliukas', kind: 'sticker' },
  { key: 'it_tree', file: 'obelis', kind: 'sticker' },
  { key: 'it_greenhouse', file: 'siltnamis', kind: 'sticker' },
  // Sodo kiemas
  { key: 'bg_kiemas', file: 'fonas_kiemas', kind: 'bg' },
  { key: 'it_pond', file: 'tvenkinys', kind: 'sticker' },
  { key: 'it_bridge', file: 'tiltelis', kind: 'sticker' },
  { key: 'it_path', file: 'akmenu_takas', kind: 'sticker' },
  { key: 'it_beds', file: 'darzo_lysves', kind: 'sticker' },
  { key: 'it_well', file: 'sulinys', kind: 'sticker' },
  { key: 'it_beehive', file: 'avilys', kind: 'sticker' },
  { key: 'it_gazebo', file: 'pavesine', kind: 'sticker' },
  // Daržas
  { key: 'mole', file: 'kurmis', kind: 'piece' },
  { key: 'bg_darzas', file: 'fonas_darzas', kind: 'bg' },
  { key: 'it_soil', file: 'sukasta_dirva', kind: 'sticker' },
  { key: 'it_rows', file: 'darzoviu_eiles', kind: 'sticker' },
  { key: 'it_compost', file: 'kompostas', kind: 'sticker' },
  { key: 'it_scarecrow', file: 'baidykle', kind: 'sticker' },
  { key: 'it_pumpkins', file: 'moliugai', kind: 'sticker' },
  { key: 'it_shed', file: 'pasiure', kind: 'sticker' },
  { key: 'it_trees', file: 'vaismedziai', kind: 'sticker' },
  { key: 'it_cart', file: 'vezimelis', kind: 'sticker' },
  { key: 'it_sunflowers', file: 'saulegrazos', kind: 'sticker' },
  // Bitynas
  { key: 'comb', file: 'korys', kind: 'piece' },
  { key: 'honey', file: 'medaus_lasas', kind: 'piece' },
  { key: 'bg_bitynas', file: 'fonas_bitynas', kind: 'bg' },
  { key: 'it_lavender', file: 'levandos', kind: 'sticker' },
  { key: 'it_hives', file: 'aviliai', kind: 'sticker' },
  { key: 'it_clover', file: 'dobilai', kind: 'sticker' },
  { key: 'it_water', file: 'girdykla', kind: 'sticker' },
  { key: 'it_linden', file: 'liepa', kind: 'sticker' },
  { key: 'it_honeyhouse', file: 'medaus_namelis', kind: 'sticker' },
  { key: 'it_table', file: 'degustacijos_stalas', kind: 'sticker' },
  { key: 'it_sundial', file: 'saules_laikrodis', kind: 'sticker' },
  // Oranžerija
  { key: 'pot', file: 'vazonas', kind: 'piece' },
  { key: 'bg_oranzerija', file: 'fonas_oranzerija', kind: 'bg' },
  { key: 'it_fountain', file: 'fontanas', kind: 'sticker' },
  { key: 'it_orchids', file: 'orchidejos', kind: 'sticker' },
  { key: 'it_citrus', file: 'citrinmedziai', kind: 'sticker' },
  { key: 'it_shelves', file: 'stelazai', kind: 'sticker' },
  { key: 'it_palm', file: 'palme', kind: 'sticker' },
  { key: 'it_butterflies', file: 'drugeliai', kind: 'sticker' },
  { key: 'it_teatable', file: 'arbatos_staliukas', kind: 'sticker' },
  { key: 'it_chandelier', file: 'sviestuvas', kind: 'sticker' },
  // Malūnas
  { key: 'sack', file: 'miltu_maisas', kind: 'piece' },
  { key: 'sack_torn', file: 'miltu_maisas_pradrekstas', kind: 'piece' },
  { key: 'grain', file: 'grudai', kind: 'piece' },
  { key: 'bg_malunas', file: 'fonas_malunas', kind: 'bg' },
  { key: 'it_mill', file: 'malunas', kind: 'sticker' },
  { key: 'it_mill_tower', file: 'malunas_be_sparnu', kind: 'sticker' },
  { key: 'it_mill_sails', file: 'malunas_sparnai', kind: 'sticker' },
  { key: 'it_haystacks', file: 'sieno_kupetos', kind: 'sticker' },
  { key: 'it_sheaves', file: 'rugiu_pedai', kind: 'sticker' },
  { key: 'it_oven', file: 'duonos_krosnis', kind: 'sticker' },
  { key: 'it_picnic', file: 'pikniko_kampelis', kind: 'sticker' },
  { key: 'it_poppies', file: 'aguonos', kind: 'sticker' },
  { key: 'it_gate', file: 'vartai', kind: 'sticker' },
  { key: 'it_vane', file: 'vetrunge', kind: 'sticker' },
  { key: 'it_harvest', file: 'derliaus_stalas', kind: 'sticker' },
  // Pagalbos ir kita
  { key: 'b_shovel', file: 'kastuvelis', kind: 'piece' },
  { key: 'b_can', file: 'laistytuvas', kind: 'piece' },
  { key: 'b_rake', file: 'grebliai', kind: 'piece' },
  { key: 'b_bomb', file: 'sprogstantis_startas', kind: 'piece' },
  { key: 'b_moves', file: 'ejimu_paketas', kind: 'piece' },
  { key: 'ice', file: 'salna', kind: 'piece' },
  { key: 'it_lights', file: 'zibinteliai', kind: 'sticker' },
  { key: 'it_swing', file: 'supynes', kind: 'sticker' },
  // Bendra
  { key: 'tuft', file: 'zoles_kuokstas', kind: 'sticker' },
  // Veikėjai (visas kūnas, permatomas fonas)
  ...['normal', 'happy', 'excited', 'surprised', 'sad', 'thinking', 'wink', 'sleep'].map((e) => ({ key: 'pk_' + e, file: 'pukis_' + e, kind: 'char' })),
  // Pūkis be drabužių (ant jo uždedami drabužiai) ir drabužiai atskirai
  ...['normal', 'happy', 'excited', 'surprised', 'sad', 'thinking', 'wink', 'sleep'].map((e) => ({ key: 'pb_' + e, file: 'pukis_be_' + e, kind: 'char' })),
  ...['siaudine', 'geles', 'sodininko', 'berete', 'megzta', 'moliugo', 'lapu', 'kaledu'].map((h) => ({ key: 'hat_' + h, file: 'kepure_' + h, kind: 'sticker' })),
  ...['zalia', 'raudona', 'melyna', 'auksine', 'languota', 'alyvine', 'sirdeliu', 'velyku'].map((s) => ({ key: 'scarf_' + s, file: 'skarele_' + s, kind: 'sticker' })),
  ...['kiskio', 'sirdeliu', 'jonines'].map((h) => ({ key: 'hat_' + h, file: 'kepure_' + h, kind: 'sticker' })),
  // Šventės
  { key: 'ev_margutis', file: 'margutis', kind: 'piece' },
  { key: 'ev_sirdele', file: 'sirdele', kind: 'piece' },
  { key: 'ev_papartis', file: 'papartziedis', kind: 'piece' },
  { key: 'title_art', file: 'titulinis', kind: 'title' },
  ...['normal', 'happy', 'sneaky', 'surprised', 'sad', 'thinking'].map((e) => ({ key: 'kr_' + e, file: 'karolis_' + e, kind: 'char' })),
  ...['normal', 'happy', 'surprised', 'sad', 'thinking', 'wink'].map((e) => ({ key: 'dg_' + e, file: 'dygliukas_' + e, kind: 'char' })),
  ...['normal', 'happy', 'surprised', 'sad', 'thinking', 'wink'].map((e) => ({ key: 'zz_' + e, file: 'zuze_' + e, kind: 'char' })),
  ...['normal', 'happy', 'surprised', 'sad', 'thinking', 'wink'].map((e) => ({ key: 'kv_' + e, file: 'kvakse_' + e, kind: 'char' })),
  ...['normal', 'happy', 'surprised', 'sad', 'thinking', 'wink'].map((e) => ({ key: 'ag_' + e, file: 'agota_' + e, kind: 'char' })),
  // Programėlė
  { key: 'icon', file: 'ikona', kind: 'icon' },
  { key: 'feature', file: 'reklaminis', kind: 'feature' },
];

const Img = (() => {
  const ok = new Set();
  // WebP – daug mažesni failai (ikona lieka PNG – jos reikia programėlės ikonoms)
  const ext = (a) => (a.kind === 'icon' ? 'png' : 'webp');
  const url = (key) => {
    const a = ASSET_LIST.find((x) => x.key === key);
    return a ? `img/${a.file}.${ext(a)}` : '';
  };
  // Užkrauna tik tuos paveikslėlius, kurie yra img/manifest.json sąraše
  async function load() {
    let have = [];
    try {
      const r = await fetch('img/manifest.json', { cache: 'no-store' });
      if (r.ok) have = await r.json();
    } catch (e) { /* paveikslėlių nėra */ }
    const list = ASSET_LIST.filter((a) => have.includes(`${a.file}.${ext(a)}`));
    return Promise.all(list.map((a) => new Promise((res) => {
      const im = new Image();
      im.onload = () => { ok.add(a.key); res(); };
      im.onerror = () => res();
      im.src = url(a.key);
    })));
  }
  const has = (key) => ok.has(key);
  const tag = (key, cls = 'pimg') => `<img class="${cls}" src="${url(key)}" alt="" draggable="false">`;
  return { load, has, url, tag, ext, count: () => ok.size };
})();
