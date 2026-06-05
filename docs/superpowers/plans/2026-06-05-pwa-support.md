# TeamTodo PWA 支持实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 TeamTodo 添加 PWA 支持，让用户在手机浏览器中"添加到主屏幕"，像原生 App 一样全屏使用，并支持离线回退页面。

**Architecture:** 手动配置 PWA（不使用 vite-plugin-pwa）。创建 manifest.json 定义 App 元数据，创建 Service Worker 实现缓存策略（App Shell 缓存优先，API 请求网络优先，离线回退到 offline.html）。更新 index.html 引用 manifest 并注册 Service Worker。

**Tech Stack:** PWA Manifest, Service Worker API, Cache API

---

## 文件结构

### 新建文件

```
public/
├── manifest.json       # PWA 元数据（名称、图标、颜色、显示模式）
└── sw.js               # Service Worker（缓存策略 + 离线回退）
```

### 修改文件

```
index.html              # 添加 manifest 引用、meta tags、SW 注册脚本
```

### 已存在（无需修改）

```
public/
├── icons/
│   ├── icon.svg          # 矢量图标
│   ├── icon-192x192.png  # PWA 标准图标
│   └── icon-512x512.png  # PWA 大图标
├── offline.html          # 离线回退页面
vite.config.js            # Vite 配置（public/ 目录默认自动复制，无需改动）
```

---

## Task 1: 创建 PWA Manifest

**Files:**
- Create: `public/manifest.json`

- [ ] **Step 1: 创建 manifest.json**

```json
{
  "name": "TeamTodo - 团队待办事项",
  "short_name": "TeamTodo",
  "description": "团队协作看板式待办事项管理工具",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0c0e1a",
  "theme_color": "#0c0e1a",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 2: 验证 JSON 格式**

```bash
cd "D:/Desktop/待办事项"
python -c "import json; json.load(open('public/manifest.json')); print('Valid JSON')"
```

Expected: `Valid JSON`

---

## Task 2: 创建 Service Worker

**Files:**
- Create: `public/sw.js`

- [ ] **Step 1: 创建 Service Worker**

```js
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
```

---

## Task 3: 更新 index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加 manifest 引用和 PWA meta tags**

在 `<head>` 中，`<title>` 之前添加：

```html
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0c0e1a" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="TeamTodo" />
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
```

- [ ] **Step 2: 更新 favicon**

将现有的：
```html
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

替换为：
```html
    <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
```

- [ ] **Step 3: 添加 Service Worker 注册脚本**

在 `</body>` 之前、`<script type="module" src="/src/main.jsx"></script>` 之后添加：

```html
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js');
        });
      }
    </script>
```

- [ ] **Step 4: 验证完整的 index.html**

最终 `index.html` 应该是：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0c0e1a" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="TeamTodo" />
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
    <title>TeamTodo - 团队待办事项</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js');
        });
      }
    </script>
  </body>
</html>
```

---

## Task 4: 构建验证 + 本机测试

- [ ] **Step 1: 构建前端**

```bash
cd "D:/Desktop/待办事项"
npm run build
```

Expected: 构建成功，无错误。

- [ ] **Step 2: 检查 dist 目录包含 PWA 文件**

```bash
ls "D:/Desktop/待办事项/dist/"
ls "D:/Desktop/待办事项/dist/icons/"
```

Expected: `dist/` 中包含 `manifest.json`、`sw.js`、`offline.html`，`dist/icons/` 中包含图标文件。

- [ ] **Step 3: 启动服务并用浏览器 DevTools 验证**

启动后端和前端：
```bash
cd "D:/Desktop/待办事项/backend" && python -m uvicorn main:app --reload
```
```bash
cd "D:/Desktop/待办事项" && npm run dev
```

打开 http://localhost:5173，按 F12 打开 DevTools：
1. **Application → Manifest** — 应显示 App 名称、图标、颜色
2. **Application → Service Workers** — 应显示 sw.js 已注册
3. **Network** — 刷新页面后检查 manifest.json 和 sw.js 正常加载

- [ ] **Step 4: 测试离线回退**

在 DevTools → Network 中勾选 **Offline**，然后刷新页面。应该看到 offline.html 的"信号丢失"页面。取消 Offline 后刷新恢复正常。
