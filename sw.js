const CACHE_NAME = 'gaba-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon.png',
  './lib/algebrite.min.js',
  './lib/katex.min.js',
  './lib/katex.min.css',
  './lib/auto-render.min.js',
  './lib/marked.min.js',
  './lib/fonts/KaTeX_Main-Regular.woff2',
  './lib/fonts/KaTeX_Math-Italic.woff2',
  './lib/fonts/KaTeX_Size1-Regular.woff2',
  './lib/fonts/KaTeX_Size4-Regular.woff2'
];

// Install Event: Cache assets individually to prevent a single error from blocking the whole process
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use mapping to catch errors on individual files
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn('Cache failed for:', url)))
      );
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
