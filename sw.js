const CACHE_NAME = "pwa-cache-v3";
const ASSETS = [
  "/YanushVolodya_WebDev/index.html",
  "/YanushVolodya_WebDev/dashboard.html",
  "/YanushVolodya_WebDev/tasks.html",
  "/YanushVolodya_WebDev/style.css",
  "/YanushVolodya_WebDev/navigation.css",
  "/YanushVolodya_WebDev/header.css",
  "/YanushVolodya_WebDev/script.js",
  "/YanushVolodya_WebDev/sw.js",
  "/YanushVolodya_WebDev/resources/add.svg",
  "/YanushVolodya_WebDev/resources/bell.svg",
  "/YanushVolodya_WebDev/resources/edit.svg",
  "/YanushVolodya_WebDev/resources/home.svg",
  "/YanushVolodya_WebDev/resources/logo-512.png",
  "/YanushVolodya_WebDev/resources/logo-256.png",
  "/YanushVolodya_WebDev/resources/logo-192.png",
  "/YanushVolodya_WebDev/resources/logo-128.png",
  "/YanushVolodya_WebDev/resources/profile.svg",
  "/YanushVolodya_WebDev/resources/remove.svg",
  "/YanushVolodya_WebDev/resources/status-inactive.svg",
  "/YanushVolodya_WebDev/resources/status-active.svg",
  "/YanushVolodya_WebDev/init_sw.js",
  "/YanushVolodya_WebDev/manifest.json",
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