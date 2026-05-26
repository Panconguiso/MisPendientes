const CACHE = "mis-pendientes-v2";
const FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(name => {
          if (name !== CACHE) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) return response;

      return fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response;

        const responseClone = response.clone();
        caches.open(CACHE).then(cache => {
          cache.put(e.request, responseClone);
        });

        return response;
      });
    }).catch(() => {
      return caches.match("/index.html");
    })
  );
});
