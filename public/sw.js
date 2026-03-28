// Service Worker pour ModelFit PWA
// Gère le cache et le fonctionnement hors-ligne

const CACHE_NAME = 'modelfit-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de cache: network-first avec fallback cache
self.addEventListener('fetch', event => {
  // Ne pas cacher les requêtes API Groq
  if (event.request.url.includes('api.groq.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache la réponse si elle est valide
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Fallback au cache en cas d'erreur réseau
        return caches.match(event.request)
          .then(response => response || new Response('Hors ligne - Vérifiez votre connexion'));
      })
  );
});
