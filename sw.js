// Guia de Bolso — service worker: app funciona offline (narração é feita pela voz do próprio celular)
const CACHE = 'guia-v2-5';
const ASSETS = ['./', './index.html', './pois.json', './manifest.json', './icon.png', './icon-maskable.png'];
const EXTRA = ['https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js']; // mapa: melhor esforço

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).then(() => Promise.all(EXTRA.map(u => c.add(u).catch(() => null))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin && url.hostname !== 'cdnjs.cloudflare.com') return; // Nominatim, OSM etc. vão direto à rede
  // rede primeiro (para pegar atualizações), cache como reserva
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
