const CACHE_STATIC = "static/v11";
const CACHE_DYNAMIC = "dynamic/v9";

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

// Cache then network strategy for api, and cache with network fallback strategy for static files
self.addEventListener("fetch", (event) => {
  const url = "https://httpbin.org/get";

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC).then(async (cache) => {
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then((res) => {
              return caches.open(CACHE_DYNAMIC).then((cache) => {
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch((err) => {
              return caches.open(CACHE_STATIC).then((cache) => {
                if(event.request.url.indexOf('/help')) {
                    return cache.match("/offline.html");
                }
              });
            });
        }
      })
    );
  }
});

// Cache with network fallback strategy
// self.addEventListener("fetch", (event) => {
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
//               return cache.match("/offline.html");
//             });
//           });
//       }
//     })
//   );
// });

// Cache-only strategy
// self.addEventListener("fetch", (event) => {
//   event.respondWith(caches.match(event.request));
// });

// Network-only strategy
// self.addEventListener("fetch", (event) => {
//   fetch(event.request);
// });

// Network with cache fallback strategy
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     fetch(event.request)
//       .then((response) => {
//         return caches.open(CACHE_DYNAMIC).then((cache) => {
//           cache.put(event.request.url, response.clone());
//           return response;
//         });
//       })
//       .catch((err) => {
//         return caches.match(event.request);
//       })
//   );
// });
