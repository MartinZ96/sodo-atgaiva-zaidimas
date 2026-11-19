// Offline režimas: žaidimas išsaugomas telefone ir veikia be interneto.
// Atnaujinimai: rodom tai, kas išsaugota, o fone parsisiunčiam naujausią versiją –
// ji įsijungia kitą kartą atidarius žaidimą.
const CACHE = 'sodo-atgaiva-20261119144640';

const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/lang-en.js', 'js/i18n.js', 'js/art.js', 'js/assets.js', 'js/levels.js', 'js/storage.js', 'js/audio.js', 'js/engine.js',
  'js/particles.js', 'js/game.js', 'js/garden.js', 'js/ambient.js', 'js/story.js', 'js/progress.js',
  'js/events.js', 'js/daily.js', 'js/telemetry.js', 'js/ads.js', 'js/app.js', 'js/native.js',
  'img/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    // Paveikslėliai – pagal img/manifest.json sąrašą
    try {
      const list = await (await fetch('img/manifest.json', { cache: 'no-store' })).json();
      await cache.addAll(list.map((f) => 'img/' + f));
    } catch (err) { /* paveikslėlių nėra – nieko tokio */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (new URL(req.url).pathname.includes('/api/')) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { e.waitUntil(network); return cached; }
    return (await network) || new Response('Nėra ryšio', { status: 503 });
  })());
});
