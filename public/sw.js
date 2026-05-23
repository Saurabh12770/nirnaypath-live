/* Self-uninstalling legacy service worker to clear 'sw.js' scope */
self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    self.registration.unregister()
        .then(() => self.clients.matchAll())
        .then(clients => {
            clients.forEach(client => {
                if (client.navigate) {
                    client.navigate(client.url);
                }
            });
        });
});
