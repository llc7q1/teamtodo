// public/sw.js
const CACHE_NAME = 'teamtodo-v1';

// App Shell 资源 — 安装时预缓存
const APP_SHELL = [
  '/',
  '/offline.html',
];

// 安装：预缓存 App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 请求拦截
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API 请求：网络优先，失败不缓存
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ detail: '网络连接失败' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // 静态资源：缓存优先，回退到网络，最终回退到离线页
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // 缓存成功的 GET 请求
          if (response.ok && event.request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // 导航请求回退到离线页
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('', { status: 503 });
        });
    })
  );
});
