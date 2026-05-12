/* NirnayPath Service Worker v5.0 (Stable & Safe) */
const CACHE_NAME = 'nirnaypath-v5';

const LOCAL_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/js/auth.js',
    '/logo.png'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(LOCAL_ASSETS).catch(err => console.warn('Precaching partial:', err));
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            clients.claim(),
            caches.keys().then(keys => {
                return Promise.all(keys.map(key => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                }));
            })
        ])
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // 1. DO NOT intercept cross-origin requests
    if (url.origin !== self.location.origin) return;

    // 2. DO NOT cache POST requests
    if (event.request.method !== 'GET') return;

    // 3. Network-first for everything else
    event.respondWith(
        fetch(event.request).then(response => {
            if (response && response.status === 200) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
        }).catch(() => {
            return caches.match(event.request);
        })
    );
});

/* --- Push Notification Listeners --- */
self.addEventListener('push', function(event) {
    if (event.data) {
        const payload = event.data.json();
        const options = {
            body: payload.body,
            icon: payload.icon || '/logo.png',
            badge: '/logo.png',
            vibrate: [100, 50, 100],
            data: { url: payload.data ? payload.data.url : '/' }
        };
        event.waitUntil(self.registration.showNotification(payload.title, options));
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});
