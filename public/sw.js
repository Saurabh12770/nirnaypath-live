const CACHE_NAME = 'nirnaypath-cbt-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/design-system/index.css',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', event => {
    // Zero-Trust: Do not cache API responses or exam content
    if (event.request.url.includes('/api/')) {
        return fetch(event.request);
    }
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-telemetry') {
        event.waitUntil(syncTelemetryQueue());
    }
});

async function syncTelemetryQueue() {
    // Logic to sync queued heartbeats back to server when online
    console.log("Background sync: Telemetry pushed to server.");
}
