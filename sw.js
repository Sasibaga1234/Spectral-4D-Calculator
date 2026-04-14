const CACHE_NAME = 'gaba-cache-v3';

// Use self.location to auto-detect the base path (works on root and subdirectory deployments)
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '');

// App shell assets (local files only)
const LOCAL_ASSETS = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/style.css',
  BASE_PATH + '/script.js',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/icon.png'
];

// CDN assets to also cache for offline use
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',
  'https://cdn.jsdelivr.net/npm/algebrite@1.4.0/dist/algebrite.bundle-for-browser.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

// Install Event: Cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell at base:', BASE_PATH);
      const allAssets = [...LOCAL_ASSETS, ...CDN_ASSETS];
      // Catch per-file errors so one missing file won't block install
      return Promise.allSettled(
        allAssets.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Cache failed for:', url))
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate Event: Claim all clients and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
        );
      })
    ])
  );
});

// Fetch Event: Cache-first strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        return new Response('<h2 style="font-family:sans-serif;padding:2rem">You are offline. Please reconnect to use Gaba.</h2>', {
          headers: { 'Content-Type': 'text/html' }
        });
      });
    })
  );
});
