'use strict';

(function() {
    // Register initialization in AppLifecycle queue
    window.AppLifecycle.register(async () => {
        try {
            const res = await fetch('/api/user/config');
            if (res.ok) {
                const config = await res.json();
                window._npConfig = config;
                console.log('[GrowthConfig] Loaded backend configuration:', window._npConfig);
            } else {
                console.warn('[GrowthConfig] Failed to fetch backend config, status:', res.status);
                window._npConfig = { growthMode: false };
            }
        } catch (err) {
            console.error('[GrowthConfig] Fetch error:', err);
            window._npConfig = { growthMode: false };
        }
    });
})();
