/* NirnayPath Service Worker v2.0 */
const CACHE_NAME = 'nirnaypath-cache-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/about.html',
    '/style.css',
    '/script.js',
    '/js/auth.js',
    '/js/dashboard.js',
    '/js/push.js',
    '/js/app.js',
    '/logo.png'
];

// Install Event - Pre-cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Pre-caching offline assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }));
        })
    );
});

// Fetch Event - Hardened to prevent undefined returns
self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            try {
                // Cache-First for static, Network-First for API
                const url = new URL(event.request.url);
                const isApi = url.pathname.startsWith('/api/');

                if (isApi) {
                    try {
                        const response = await fetch(event.request);
                        if (response && response.status === 200) {
                            const clone = response.clone();
                            const cache = await caches.open(CACHE_NAME);
                            cache.put(event.request, clone);
                            return response.clone();
                        }
                        return response || new Response("offline", { status: 503 });
                    } catch (err) {
                        const cached = await caches.match(event.request);
                        return cached ? cached.clone() : new Response("offline", { status: 503 });
                    }
                } else {
                    const cachedResponse = await caches.match(event.request);
                    if (cachedResponse) return cachedResponse.clone();

                    try {
                        const response = await fetch(event.request);
                        if (response && response.status === 200) {
                            const clone = response.clone();
                            const cache = await caches.open(CACHE_NAME);
                            cache.put(event.request, clone);
                            return response.clone();
                        }
                        return response || new Response("offline", { status: 503 });
                    } catch (err) {
                        if (event.request.mode === 'navigate') {
                            const root = await caches.match('/index.html');
                            if (root) return root.clone();
                        }
                        return new Response("offline", { status: 503 });
                    }
                }
            } catch (fatalErr) {
                return new Response("offline", { status: 503 });
            }
        })()
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
