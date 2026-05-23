/* NirnayPath Service Worker — Phase 12 PWA Upgrade */
'use strict';

const CACHE_VERSION = 'nirnaypath-v12';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;

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

/* ─── API routes eligible for network-first caching ─────────────────── */
const NETWORK_FIRST_PATTERNS = [
    '/api/questions/',
    '/api/drill/',
    '/api/section/',
    '/api/learning/',
    '/api/recommendations'
];

/* ─── Install: pre-cache all static assets ───────────────────────────── */
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

/* ─── Activate: purge stale caches ───────────────────────────────────── */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            // Include legacy cache explicitly to ensure complete purge
            const legacyCache = 'nirnaypath-cbt-v1';
            const keysToDelete = keys.filter(key => key !== STATIC_CACHE && key !== API_CACHE);
            if (keys.includes(legacyCache) && !keysToDelete.includes(legacyCache)) {
                keysToDelete.push(legacyCache);
            }
            return Promise.all(
                keysToDelete.map(key => {
                    console.log('[SW] Deleting stale cache:', key);
                    return caches.delete(key);
                })
            );
        }).then(() => self.clients.claim()) // Take control of existing clients
    );
});

/* ─── Fetch: routing strategy ────────────────────────────────────────── */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and chrome-extension requests
    if (request.method !== 'GET' || url.protocol.startsWith('chrome')) return;

    // Learning sync endpoint — always network, never cache
    if (url.pathname === '/api/learning/sync') {
        return; // Let it pass through directly
    }

    // Network-first for eligible API routes
    const isNetworkFirst = NETWORK_FIRST_PATTERNS.some(p => url.pathname.startsWith(p));
    if (isNetworkFirst) {
        event.respondWith(networkFirstWithCache(request, API_CACHE, 300)); // 5 min TTL
        return;
    }

    // Skip all other /api/ routes (auth, payment, admin) — always fresh from network
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // Cache-first with network fallback for static assets
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
