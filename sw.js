/* Service Worker de Auditoría Técnica — hace instalable la app (PWA) y la mantiene
   offline. Bump de VERSION en cada release (mismo valor que window.VT_VERSION en
   index.html, sin puntos): los assets se cargan con ?v=versión, así que una versión
   nueva nunca lee código viejo; este número sólo controla qué caché se borra al activar.

   Estrategia:
   - Navegación / index.html: SIEMPRE red primero. Con señal el técnico ve la versión
     recién publicada en el primer intento; la caché es el respaldo offline del local.
   - Resto de assets del mismo origen: stale-while-revalidate (responde al instante con
     lo guardado y actualiza de fondo).
   - El SW nuevo se activa sin esperar a cerrar la pestaña (skipWaiting + clients.claim);
     js/pwa.js recarga la app cuando toma el control. */

const VERSION = 'mostaza-auditoria-v2-6-2';
const ESENCIALES = ['./', 'index.html', 'manifest.json', 'css/app.css', 'img/logo.png', 'img/icon-192.png'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  // Cada archivo por separado: si uno falta, el resto igual queda guardado.
  e.waitUntil(caches.open(VERSION).then(function (cache) {
    return Promise.all(ESENCIALES.map(function (url) {
      return cache.add(url).catch(function () { /* opcional: no bloquea la instalación */ });
    }));
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;   // fuentes/CDN externos: directo a la red

  var esNavegacion = e.request.mode === 'navigate' || url.pathname === '/' || /\/index\.html$/.test(url.pathname);

  if (esNavegacion) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).then(function (res) {
        var clone = res.clone();
        caches.open(VERSION).then(function (c) { c.put('index.html', clone).catch(function () {}); });
        return res;
      }).catch(function () {
        return caches.match('index.html', { ignoreSearch: true });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var red = fetch(e.request).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var clone = res.clone();
          caches.open(VERSION).then(function (c) { c.put(e.request, clone).catch(function () {}); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || red;
    })
  );
});
