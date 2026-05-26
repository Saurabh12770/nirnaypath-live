(function() {
    const queue = [];
    let sessionId = 'anonymous';
    const sessionStart = Date.now();
    let isShuttingDown = false;

    // Try to load sessionId from localStorage
    try {
        const u = localStorage.getItem('np_user_data');
        if (u) {
            const data = JSON.parse(u);
            if (data && data._id) sessionId = data._id;
            else if (data && data.id) sessionId = data.id;
        }
    } catch(e){}

    let lastFlushTime = 0;
    let flushTimeout = null;

    function track(type, payload) {
        if (isShuttingDown && type !== 'session_end') return;
        queue.push({ type, timestamp: Date.now(), ...payload });
        if (queue.length >= 50) throttleFlush(); 
    }

    function throttleFlush() {
        const now = Date.now();
        if (now - lastFlushTime < 10000) {
            if (!flushTimeout) {
                flushTimeout = setTimeout(() => {
                    flushTimeout = null;
                    flush();
                }, 10000 - (now - lastFlushTime));
            }
            return;
        }
        flush();
    }

    function flush() {
        lastFlushTime = Date.now();
        if (flushTimeout) {
            clearTimeout(flushTimeout);
            flushTimeout = null;
        }
        if (queue.length === 0) return;
        const payload = {
            events: queue.splice(0, queue.length),
            sessionId,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };
        
        try {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/telemetry/report', blob);
            } else {
                fetch('/api/telemetry/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(()=>{});
            }
        } catch(e){}
    }

    // 1. JS Errors & Unhandled Rejections
    window.addEventListener('error', (e) => {
        track('error', { message: e.message, source: e.filename, lineno: e.lineno, colno: e.colno, error: e.error ? e.error.stack : null });
    });
    window.addEventListener('unhandledrejection', (e) => {
        track('error', { message: e.reason ? e.reason.message || String(e.reason) : 'Unhandled Rejection' });
    });

    // 2. Fetch API Latency & Failures
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const start = Date.now();
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || 'unknown';
        // Prevent infinite self-tracking loops on telemetry reports
        if (url.includes('/api/telemetry/report')) {
            return originalFetch.apply(this, args);
        }
        try {
            const response = await originalFetch.apply(this, args);
            const duration = Date.now() - start;
            track('api', { url, duration, status: response.status });
            return response;
        } catch (error) {
            const duration = Date.now() - start;
            track('api', { url, duration, status: 0, error: error.message });
            throw error;
        }
    };

    // 3. Memory & Layout Size Sampling (Every 10s for runtime tests)
    setInterval(() => {
        if (performance && performance.memory) {
            track('memory', { usedJSHeapSize: performance.memory.usedJSHeapSize });
        } else {
            track('memory_unsupported', {});
        }
        track('listener_count', { count: document.getElementsByTagName('*').length }); // proxy for weight
    }, 10000);

    // 4. Long Tasks
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    track('longtask', { duration: entry.duration, name: entry.name });
                }
            });
            observer.observe({ type: 'longtask', buffered: true });
        } catch(e){}
    }

    // 5. Route Navigation Timing
    let lastRoute = window.location.pathname;
    let routeStart = Date.now();
    
    function handleRouteEnd(newRoute) {
        if (newRoute === lastRoute) return;
        track('navigation', { from: lastRoute, to: newRoute, duration: Date.now() - routeStart });
        lastRoute = newRoute;
        routeStart = Date.now();
    }

    const originalPushState = history.pushState;
    history.pushState = function(...args) {
        originalPushState.apply(this, args);
        handleRouteEnd(window.location.pathname);
    };
    
    window.addEventListener('popstate', () => {
        handleRouteEnd(window.location.pathname);
    });

    // Periodic flush
    setInterval(throttleFlush, 15000); // Max 1 request per 15 seconds

    // Page hide/unload
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            track('session_end', { duration: Date.now() - sessionStart });
            isShuttingDown = true;
            flush();
        }
    });
})();
