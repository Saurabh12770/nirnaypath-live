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

// Fetch Event - Only handle same-origin requests
self.addEventListener('fetch', event => {
    try {
        const url = new URL(event.request.url);

        // 1. Skip cross-origin requests (Let browser handle them natively)
        // This is the CRITICAL fix to prevent SW from fighting with CSP on external resources
        if (url.origin !== self.location.origin) {
            return; // Do NOT call event.respondWith()
        }

        // 2. API Caching Strategy (Same-origin Network First)
        if (url.pathname.startsWith('/api/questions/') || 
            url.pathname.startsWith('/api/drill/') || 
            url.pathname.startsWith('/api/section/')) {
            event.respondWith(
                fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const clonedResponse = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, clonedResponse);
                        }).catch(err => console.error('[SW] Cache put failed:', err));
                        return response;
                    })
                    .catch(() => caches.match(event.request))
            );
            return;
        }

        // 3. Static Assets Strategy (Same-origin Cache First)
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                return cachedResponse || fetch(event.request).catch(err => {
                    console.warn('[SW] Same-origin fetch failed:', err);
                    return new Response('Network error occurred', { status: 408, statusText: 'Network error occurred' });
                });
            }).catch(err => {
                console.error('[SW] Cache match failed:', err);
                return fetch(event.request);
            })
        );
    } catch (err) {
        console.error('[SW] Fetch handler error:', err);
        // Fallback: let the browser handle it if SW crashes
    }
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
