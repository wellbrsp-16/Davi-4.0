const CACHE_NAME = 'davi-4-0-sonic-v1';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar interceptação se estiver rodando localmente no localhost ou se for requisição de desenvolvimento do Next.js (HMR)
  const isLocalhost = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
  const isNextDev = event.request.url.includes('_next') || event.request.url.includes('webpack') || event.request.url.includes('hmr');
  
  if (isLocalhost || isNextDev) {
    return; // Pass-through direto para a rede, sem cache
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
