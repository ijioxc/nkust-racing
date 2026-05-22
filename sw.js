const CACHE_NAME = 'nkust-racing-v1';

// Install event: skip waiting
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activate event: claim clients and clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Stale-While-Revalidate for most, Cache-First for GLB/WASM
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Exclude Firebase API or API calls from caching
  if (url.hostname.includes('firebaseio.com') || url.hostname.includes('googleapis.com')) {
    return;
  }

  // Cache-First for heavy assets (GLB, WASM)
  if (url.pathname.endsWith('.glb') || url.pathname.endsWith('.wasm')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(response => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          return response;
        });
      })
    );
    return;
  }

  // Stale-While-Revalidate for everything else (HTML, JS, CSS)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' || networkResponse.type === 'cors') {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      }).catch(err => {
        // network failure, just ignore if we have cache
        console.warn('Fetch failed, using cache:', err);
      });

      return cachedResponse || fetchPromise;
    })
  );
});
