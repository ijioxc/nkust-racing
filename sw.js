const CACHE_NAME = 'nkust-racing-v12';

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

// Fetch event: Stale-While-Revalidate for standard assets, Cache-First for GLB/WASM, Network-First for JSX
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Exclude Firebase API or API calls from caching
  if (url.hostname.includes('firebaseio.com') || url.hostname.includes('googleapis.com')) {
    return;
  }

  // 1. Cache-First for heavy assets (GLB, WASM)
  if (url.pathname.endsWith('.glb') || url.pathname.endsWith('.wasm')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(response => {
          if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          }
          return response;
        }).catch(err => {
          console.error('Fetch heavy asset failed:', err);
          return new Response('Network error', { status: 488 });
        });
      })
    );
    return;
  }

  // 2. Network-First for React JSX components to prevent cache lag React crashes
  if (url.pathname.endsWith('.jsx')) {
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      }).catch(err => {
        console.warn('Fetch JSX from network failed, falling back to cache:', err);
        return caches.match(event.request).then(cachedResponse => {
          return cachedResponse || new Response('Offline network error', { status: 488 });
        });
      })
    );
    return;
  }

  // 3. Stale-While-Revalidate for everything else (HTML, JS, CSS)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      }).catch(err => {
        console.warn('Fetch failed, using cache:', err);
        return cachedResponse || new Response('Network error', { status: 488 });
      });

      return cachedResponse || fetchPromise;
    })
  );
});
