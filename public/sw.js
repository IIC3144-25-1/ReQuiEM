const CACHE_NAME = "SurgerySkills-v1";
const URLS_TO_CACHE = [
  '/',
  '/login/',
  '/dashboard/',
  '/admin/',
  '/admin/areas/',
  '/admin/areas/edit/[id]/',
  '/admin/areas/new/',
  '/admin/resident/',
  '/admin/resident/edit/[id]/',
  '/admin/resident/new/',
  '/admin/surgeries/',
  '/admin/surgeries/edit/[id]/',
  '/admin/surgeries/new/',
  '/admin/teacher/',
  '/admin/teacher/edit/[id]/',
  '/admin/teacher/new/',
  '/resident/complete-record/[id]/',
  '/resident/new-record/',
  '/resident/records/',
  '/resident/records/[id]/',
  '/teacher/records/',
  '/teacher/records/[id]/',
  '/teacher/review/[id]/',
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching files");
      const promise = URLS_TO_CACHE.map((url) => {
        return cache.add(url)
      })
      return Promise.allSettled(promise).then((e) => {
        console.log("Service Worker: Files cached", e);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const allowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (!allowlist.includes(key)) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si no hay respuesta en el cache, hacemos la solicitud a la red
        const fetchPromise = fetch(event.request).then(
          (networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            console.log("Service Worker: Fetching from network", event.request.url);
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
            });

            return networkResponse;
          }
        ).catch(() => {
          return response;
        });

        // Si hay una respuesta en el cache, la devolvemos
        return response || fetchPromise;
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("Service Worker: Deleting old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("offline", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || new Response("You are offline.");
    })
  );
});

self.addEventListener("online", (event) => {
  event.respondWith(fetch(event.request));
});
