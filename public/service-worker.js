/* NirnayPath Service Worker v2.0 */
const CACHE_NAME = 'nirnaypath-cache-v1';
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
    '/images/logo-icon.png'
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

// Fetch Event - Cache-first for static, Network-first for API
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API Caching Strategy (Network First)
    if (url.pathname.startsWith('/api/questions/') || 
        url.pathname.startsWith('/api/drill/') || 
        url.pathname.startsWith('/api/section/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Static Assets Strategy (Cache First)
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});

/* --- Push Notification Listeners --- */
self.addEventListener('push', function(event) {
    if (event.data) {
        const payload = event.data.json();
        const options = {
            body: payload.body,
            icon: payload.icon || '/images/logo-icon.png',
            badge: '/images/logo-icon.png',
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
