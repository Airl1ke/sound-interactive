const CACHE = 'ride-the-fields-v3';

const CORE_FILES = [
  '/bike-ride-mixer.html',
  '/manifest.json',
];

const SOUND_FILES = [
  '/sounds/wind.mp3',
  '/sounds/leaves.mp3',
  '/sounds/heartbeat.mp3',
  '/sounds/birds.mp3',
  '/sounds/gravel.mp3',
  '/sounds/breath.mp3',
  '/sounds/chain.mp3',
  '/sounds/ambience.mp3',
];

const ALL_FILES = [...CORE_FILES, ...SOUND_FILES];

// On install: cache everything best-effort so install never fails
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled([...CORE_FILES, ...SOUND_FILES].map(f => cache.add(f)))
    ).then(() => self.skipWaiting())
  );
});

// On activate: clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// On fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache any new successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
