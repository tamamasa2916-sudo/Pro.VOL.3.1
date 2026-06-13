/* =====================================================
   Service Worker — 定期巡回計算ツール PRO版
   sw_pro.js
   ===================================================== */
var CACHE_NAME = 'teiki-inori-v2';
var ASSETS = [
  '/tamamasa2916/index.html',
  '/tamamasa2916/manifest.json',
  '/tamamasa2916/icon-180.png',
  '/tamamasa2916/icon-192.png',
  '/tamamasa2916/icon-512.png'
];

/* インストール：キャッシュに登録 */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

/* アクティベート：古いキャッシュを削除 */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* フェッチ：キャッシュ優先、なければネット */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var resClone = res.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, resClone);
          });
        }
        return res;
      });
    }).catch(function() {
      return caches.match('/tamamasa2916/index.html');
    })
  );
});

/* skipWaiting メッセージ対応 */
self.addEventListener('message', function(e) {
  if (e.data && e.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
