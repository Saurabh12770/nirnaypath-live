/* NirnayPath Service Worker v4.0 */
const CACHE_NAME = 'nirnaypath-cache-v4';

// ONLY cache static binary/image assets — NEVER JS, CSS, or HTML
// JS and CSS must always be fetched fresh so deploys take effect immediately
const STATIC_ASSETS = [
    '/logo.png',
    '/manifest.json'
];

// Install Event - Pre-cache only binary assets
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Pre-caching static binary assets');
            // Use individual adds with error swallowing so missing files don't break install
            return Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url)));
        })
    );
});

// Activate Event - Nuke all old caches, take control immediately
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            clients.claim(),
            caches.keys().then(keys => {
                return Promise.all(keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                }));
            })
        ])
    );
});

// Fetch Event - Very conservative: only intercept same-origin image/font requests
self.addEventListener('fetch', event => {
    try {
        const url = new URL(event.request.url);

        // 1. NEVER intercept cross-origin requests
        const excludedDomains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'cdnjs.cloudflare.com',
            'checkout.razorpay.com',
            'cdn.razorpay.com',
            'api.razorpay.com',
            'lumberjack.razorpay.com',
            'ui-avatars.com'
        ];

        if (url.origin !== self.location.origin || excludedDomains.some(domain => url.hostname.includes(domain))) {
            return; // Browser handles it natively
        }

        // 2. NEVER intercept API calls — always go to network
        if (url.pathname.startsWith('/api/')) {
            return;
        }

        // 3. NEVER intercept HTML pages — always get fresh HTML
        const acceptHeader = event.request.headers.get('Accept') || '';
        if (acceptHeader.includes('text/html')) {
            return;
        }

        // 4. NEVER intercept JS or CSS — must always be fresh after deploys
        if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
            return;
        }

        // 5. Cache-first for images and fonts only
        if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf)$/)) {
            event.respondWith(
                caches.match(event.request).then(cached => {
                    return cached || fetch(event.request).then(response => {
                        if (response && response.status === 200) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                        }
                        return response;
                    });
                }).catch(() => fetch(event.request))
            );
            return;
        }

        // 6. Everything else: no interference, let browser handle it
    } catch (err) {
        console.error('[SW] Fetch handler error:', err);
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
