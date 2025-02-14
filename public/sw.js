
const CACHE_NAME = 'east-african-market-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/fallback-icon.svg',
  '/placeholder.svg'
];

// Cache first, then network strategy for images
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
      return networkResponse;
    }
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.warn('Fetch failed:', error);
    throw error;
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache what we can, ignore failures
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Special handling for image requests
  if (event.request.destination === 'image' || 
      event.request.url.includes('images') || 
      event.request.url.includes('icons')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Default fetch handling for other resources
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
                  .catch(err => {
                    console.warn('Failed to cache response:', err);
                  });
              });
            return response;
          })
          .catch(error => {
            console.warn('Fetch failed:', error);
            throw error;
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle immediate claiming of all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
