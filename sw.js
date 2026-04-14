const CACHE_NAME = 'gaba-cache-v2';

// Use self.location to auto-detect the base path (works on both root and subdirectory GitHub Pages)
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '');

const ASSETS_TO_CACHE = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/style.css',
  BASE_PATH + '/script.js',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/icon.png',
  BASE_PATH + '/lib/algebrite.min.js',
  BASE_PATH + '/lib/katex.min.js',
  BASE_PATH + '/lib/katex.min.css',
  BASE_PATH + '/lib/auto-render.min.js',
  BASE_PATH + '/lib/marked.min.js',
  BASE_PATH + '/lib/fonts/KaTeX_Main-Regular.woff2',
  BASE_PATH + '/lib/fonts/KaTeX_Math-Italic.woff2',
  BASE_PATH + '/lib/fonts/KaTeX_Size1-Regular.woff2',
  BASE_PATH + '/lib/fonts/KaTeX_Size4-Regular.woff2'
];

// Install Event: Cache all app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell at base:', BASE_PATH);
      // Catch per-file errors so one missing font won't block install
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Cache failed for:', url, err))
        )
      );
    })
  );
  // Activate immediately without waiting for old SW to be released
  self.skipWaiting();
});

// Activate Event: Claim all clients and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all open pages immediately
      self.clients.claim(),
      // Delete all old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
        );
      })
    ])
  );
});

// Fetch Event: Cache-first strategy (serve from cache, fallback to network)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // If both cache and network fail, return a minimal offline message
        return new Response('<h2>You are offline</h2>', { headers: { 'Content-Type': 'text/html' } });
      });
    })
  );
});
