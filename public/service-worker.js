/* NirnayPath Service Worker — Phase 5 Stabilized Cache Strategy */
'use strict';

/* ── Cache versioning: bump to force purge of stale v13 assets ── */
const CACHE_VERSION  = 'nirnaypath-v15';
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const API_CACHE      = `${CACHE_VERSION}-api`;
const DYNAMIC_CACHE  = `${CACHE_VERSION}-dynamic`;

/* ── HTML pages: ALWAYS Network-First ────────────────────────────
   Guarantees users receive deployment updates immediately without
   needing a hard refresh. Falls back to cache only when offline.  */
const HTML_PAGES = ['/', '/index.html', '/about.html', '/test.html', '/mobile-app-shell.html'];

/* ── Static assets: Network-First (BUG-M1 FIX) ─────────────────
   Previously used Stale-While-Revalidate for .css/.js, causing
   users to see stale layouts/styles until a second reload after
   deploys. Network-First ensures the newest code is always served
   when online. SWR fallback is used only when the network fails.  */
const NETWORK_FIRST_EXTENSIONS = ['.css', '.js'];

/* ─── Assets to pre-cache on install ──────────────────────────────────── */
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/about.html',
    '/test.html',
    '/mobile-app-shell.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/logo.png',
    '/js/auth.js',
    '/js/dashboard.js',
    '/js/push.js',
    '/js/app.js',
    '/js/offlineStorage.js'
];

/* ─── API routes eligible for network-first caching ─────────────── */
const NETWORK_FIRST_PATTERNS = [
    '/api/questions/',
    '/api/drill/',
    '/api/section/',
    '/api/learning/',
    '/api/recommendations'
];

/* ─── Install: pre-cache all static assets ───────────────────────── */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Pre-caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting()) // Take control immediately
    );
});

/* ─── Activate: purge ALL stale caches ───────────────────────────── */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            const validCaches = [STATIC_CACHE, API_CACHE, DYNAMIC_CACHE];
            return Promise.all(
                keys
                    .filter(key => !validCaches.includes(key))
                    .map(key => {
                        console.log('[SW] Deleting stale cache:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

/* ─── Fetch: routing strategy ────────────────────────────────────── */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // ── NETWORK STABILIZATION GUARD ──────────────────────────────
    // NEVER intercept mutation requests (POST, PUT, DELETE, PATCH).
    if (request.method !== 'GET') return;

    // Skip chrome-extension and non-http(s) protocols
    if (url.protocol.startsWith('chrome') || !url.protocol.startsWith('http')) return;

    // ── EXTERNAL CDN BYPASS ──────────────────────────────────────
    const externalCDNs = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com',
        'jsdelivr.net',
        'cdn.jsdelivr.net'
    ];
    const isExternalCDN = externalCDNs.some(cdn => url.hostname === cdn || url.hostname.endsWith('.' + cdn));
    if (isExternalCDN) return;

    // ── EXPLICIT TELEMETRY BYPASS ─────────────────────────────────
    if (url.pathname.startsWith('/api/telemetry/')) return;

    // Learning sync endpoint — always network, never cache
    if (url.pathname === '/api/learning/sync') return;

    // ── PHASE 3 SAFETY RULES: NEVER cache critical API routes ──
    const isCriticalRoute = 
        url.pathname.startsWith('/api/auth/') ||
        url.pathname.startsWith('/api/user/') ||
        url.pathname.startsWith('/api/test/');
    if (isCriticalRoute) return;

    // ── Phase 5: HTML pages → Network-First ──────────────────────
    const isHTMLPage = HTML_PAGES.includes(url.pathname) ||
                       url.pathname === '/' ||
                       request.headers.get('accept')?.includes('text/html');
    if (isHTMLPage) {
        event.respondWith(networkFirstHTML(request));
        return;
    }

    // ── BUG-M1 FIX: CSS/JS → Network-First (always fresh when online) ─
    // BUG-M2 FIX: Normalize cache key by stripping version query strings
    const isNetworkFirstAsset = NETWORK_FIRST_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
    if (isNetworkFirstAsset) {
        // Normalize request: strip ?v=... query params to avoid cache duplicates
        const normalizedUrl = new URL(request.url);
        normalizedUrl.search = '';
        const normalizedRequest = new Request(normalizedUrl.toString(), { headers: request.headers });
        event.respondWith(networkFirstAsset(normalizedRequest, DYNAMIC_CACHE));
        return;
    }

    // Network-first for eligible API routes
    const isNetworkFirst = NETWORK_FIRST_PATTERNS.some(p => url.pathname.startsWith(p));
    if (isNetworkFirst) {
        event.respondWith(networkFirstWithCache(request, API_CACHE, 300)); // 5 min TTL
        return;
    }

    // Skip all other /api/ routes (auth, payment, admin) — always fresh
    if (url.pathname.startsWith('/api/')) return;

    // Remaining static assets — cache-first
    event.respondWith(cacheFirstWithNetworkFallback(request));
});

/* ─── Strategy: Network-first, cache on success ─────────────────────── */
async function networkFirstWithCache(request, cacheName, maxAgeSeconds) {
    try {
        const networkResponse = await fetch(request.clone());
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            const responseToCache = networkResponse.clone();
            // Attach a timestamp header for TTL enforcement
            const headers = new Headers(responseToCache.headers);
            headers.append('sw-cached-at', Date.now().toString());
            const body = await responseToCache.blob();
            cache.put(request, new Response(body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers
            }));
        }
        return networkResponse;
    } catch (_err) {
        // Offline fallback — check cache, respect TTL
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            const cachedAt = parseInt(cachedResponse.headers.get('sw-cached-at') || '0');
            const ageSeconds = (Date.now() - cachedAt) / 1000;
            if (ageSeconds <= maxAgeSeconds) {
                return cachedResponse;
            }
        }
        return new Response(
            JSON.stringify({ error: 'offline', message: 'You are offline. Please try again when connected.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

/* ─── Strategy: Cache-first, network fallback ────────────────────────── */
async function cacheFirstWithNetworkFallback(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
        const networkResponse = await fetch(request);
        // Cache successful static responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (_err) {
        // Return offline shell for HTML navigation requests
        if (request.headers.get('accept')?.includes('text/html')) {
            const shell = await caches.match('/mobile-app-shell.html');
            if (shell) return shell;
        }
        return new Response('Offline', { status: 503 });
    }
}

/* ─── Strategy: Network-First for HTML pages (Phase 5) ──────────────────
   Ensures every navigation gets the latest HTML from the server.
   Only falls back to cache when genuinely offline.                        */
async function networkFirstHTML(request) {
    try {
        const networkResponse = await fetch(request.clone());
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (_err) {
        // Offline: serve from cache
        const cached = await caches.match(request);
        if (cached) return cached;
        // Last-resort: serve the offline app shell
        const shell = await caches.match('/mobile-app-shell.html');
        if (shell) return shell;
        return new Response('<h1>You are offline</h1>', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

/* ─── Strategy: Network-First for CSS/JS (BUG-M1 fix) ───────────────────
   Always fetches fresh JS/CSS from network when online. Only falls back
   to cache if network fails (offline), ensuring post-deploy style updates
   are visible immediately without requiring a hard refresh.              */
async function networkFirstAsset(request, cacheName) {
    const cache = await caches.open(cacheName);
    try {
        const networkResponse = await fetch(request.clone());
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (_err) {
        // Offline fallback: serve from cache
        const cached = await cache.match(request);
        if (cached) return cached;
        return new Response('/* offline */', {
            status: 503,
            headers: { 'Content-Type': 'text/css' }
        });
    }
}

/* ─── Background Sync: flush offline test attempts ──────────────────── */
self.addEventListener('sync', event => {
    if (event.tag === 'sync-offline-attempts') {
        event.waitUntil(syncOfflineAttempts());
    }
    if (event.tag === 'sync-telemetry') {
        event.waitUntil(syncTelemetryQueue());
    }
});

async function syncOfflineAttempts() {
    // Signal all open clients to trigger their NirnayPathOfflineStorage.syncToServer()
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
        client.postMessage({ type: 'NIRNAYPATH_SYNC_REQUEST', tag: 'sync-offline-attempts' });
    }
    console.log('[SW] Background sync: notified clients to flush offline attempt queue.');
}

async function syncTelemetryQueue() {
    console.log('[SW] Background sync: telemetry queue flush triggered.');
}

/* ─── Push Notifications ─────────────────────────────────────────────── */
self.addEventListener('push', event => {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch (_) {
        payload = { title: 'NirnayPath', body: event.data.text() };
    }

    const options = {
        body: payload.body || 'You have a new update from NirnayPath.',
        icon: payload.icon || '/logo.png',
        badge: '/logo.png',
        vibrate: [100, 50, 100],
        tag: payload.tag || 'nirnaypath-notification',
        renotify: true,
        data: {
            url: payload.data?.url || '/',
            type: payload.type || 'general'
        },
        actions: payload.actions || [
            { action: 'open', title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(payload.title || 'NirnayPath', options)
    );
});

/* ─── Notification Click ─────────────────────────────────────────────── */
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Focus existing tab if open
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new tab
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

/* ─── Message from client (e.g. cache profile data) ─────────────────── */
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
