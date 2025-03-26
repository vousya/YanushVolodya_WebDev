const CACHE_NAME = "pwa-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/tasks.html",
  "/style.css",
  "/navigation.css",
  "/header.css",
  "/script.js",
  "/sw.js",
  "/resources",
  "/resources/add.svg",
  "/resources/bell.svg",
  "/resources/edit.svg",
  "/resources/home.svg",
  "/resources/logo-512.svg",
  "/resources/logo-256.svg",
  "/resources/logo-192.svg",
  "/resources/logo-128.svg",
  "/resources/profile.svg",
  "/resources/remove.svg",
  "/resources/status-inactive.svg",
  "/resources/status-active.svg"
];

// Встановлення Service Worker та кешування файлів
self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching files');
        return Promise.all(
          ASSETS.map((asset) => {
            return fetch(asset)
              .then((response) => {
                if (!response.ok) {
                  console.warn(`Failed to fetch ${asset}: ${response.status}`);
                  return; // Skip caching this asset
                }
                return cache.put(asset, response);
              })
              .catch((err) => {
                console.error(`Error caching ${asset}: ${err}`);
              });
          })
        ).then(() => console.log('Caching complete'));
      }).catch((err) => console.error('Install failed:', err))
    );
});
  
// Перехоплення запитів і завантаження з кешу
self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});
  
// Оновлення Service Worker і видалення старого кешу
self.addEventListener("activate", (event) => {
    console.log('Updating cache');
    event.waitUntil(
      caches
        .keys()
        .then((keys) => {
          return Promise.all(
            keys
              .filter((key) => key !== CACHE_NAME)
              .map((key) => caches.delete(key))
          );
        })
        .then(() => {
          return self.clients.claim(); // Підключаємо новий SW до всіх вкладок
        })
    );
});