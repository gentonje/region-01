
const CACHE_NAME = 'east-african-market-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/fallback-icon.svg',
  '/placeholder.svg'
];

// Network first, fallback to cache strategy
const networkFirst = async (request) => {
  try {
    // Always try network first
    const networkResponse = await fetch(request, { cache: 'no-store' });
    return networkResponse;
  } catch (error) {
    console.log('Fetch failed, falling back to cache:', error);
    // Only fall back to cache if network fails completely
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

self.addEventListener('install', (event) => {
  // Only cache essential files
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache minimal set of files, just for offline fallback
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
  // Use network-first approach for all requests
  event.respondWith(networkFirst(event.request));
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
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

// Add this to force update on reload
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
