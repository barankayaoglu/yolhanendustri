// Yalnız uygulama kabuğunu saklar; B2B'nin kendisi (fiyat, stok, sipariş) her zaman canlı gelir.
const ONBELLEK = "yolhan-uygulama-v1";
const KABUK = ["./", "manifest.json", "uyg-192.png", "uyg-apple-180.png"];

self.addEventListener("install", (e) => e.waitUntil(caches.open(ONBELLEK).then((c) => c.addAll(KABUK)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== ONBELLEK).map((k) => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
