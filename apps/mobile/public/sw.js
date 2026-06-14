const CACHE_NAME = "fiance-v2";
const PRECACHE = ["/", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET" || !request.url.startsWith("http")) return;

  // Navigations: always network-first so a deploy is picked up immediately.
  // Never cache the HTML response (a stale index.html points at old chunk
  // hashes → mismatched bundle → dead UI). Fall back to the cached app
  // shell only when offline.
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).catch(async () => (await caches.match("/")) ?? Response.error())
    );
    return;
  }

  // Static assets are content-hashed and immutable: cache-first.
  // Always resolve to a valid Response — never respondWith(undefined).
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(() => Response.error());
    })
  );
});
