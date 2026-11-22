// Service worker do Gestor SSS: guarda a casca do app (HTML/CSS/JS) para abrir
// offline. Os dados (gastos, config, dashboard) ficam no localStorage, não aqui.
var CACHE = "gestor-sss-v1";
var SHELL = ["./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  // nunca cacheia chamadas ao Apps Script - sempre precisa ser rede/online
  if (req.url.indexOf("script.google.com") !== -1) return;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then(function (cached) {
      return cached || fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        return res;
      }).catch(function () { return cached; });
    })
  );
});
