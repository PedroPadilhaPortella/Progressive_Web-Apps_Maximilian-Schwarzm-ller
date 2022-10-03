const CACHE_STATIC = "static/v7";
const CACHE_DYNAMIC = "dynamic/v5";

self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installing Service Worker ...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      console.log("[Service Worker] Precaching AppShell");
      cache.addAll([
        "/",
        "/index.html",
        "/offline.html",
        "/src/js/app.js",
        "/src/js/feed.js",
        "/src/js/material.min.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        "/src/images/main-image.jpg",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      ]);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activating Service Worker ....", event);
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key != CACHE_STATIC && key != CACHE_DYNAMIC) {
            console.log("[Service Worker] Removing all cache ....", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Cache with network fallback strategy
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       } else {
//         return fetch(event.request)
//           .then((res) => {
//             return caches.open(CACHE_DYNAMIC).then((cache) => {
//               cache.put(event.request.url, res.clone());
//               return res;
//             });
//           })
//           .catch((err) => {
//             return caches.open(CACHE_STATIC).then((cache) => {
//                 return cache.match('/offline.html');
//             });
//           });
//       }
//     })
//   );
// });

// Cache-only strategy
// self.addEventListener("fetch", function (event) {
//   event.respondWith(caches.match(event.request));
// });

// Network-only strategy
self.addEventListener("fetch", function (event) {
  fetch(event.request);
});
