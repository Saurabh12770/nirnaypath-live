/* ============================================================
   NirnayPath Telemetry Engine — Phase 4 Stabilized
   ✅ Tab-Visibility Pause (no sampling on hidden tabs)
   ✅ Idle Detection (throttle after 3 min inactivity)
   ✅ Exponential Backoff on 429 (Retry-After compliance)
   ✅ Self-tracking loop guard
   ============================================================ */
(function() {
    'use strict';

    /* ── State ─────────────────────────────────────────────── */
    const queue = [];
    let sessionId = 'anonymous';
    const sessionStart = Date.now();
    let isShuttingDown = false;

    // ── Phase 4: Backoff state ────────────────────────────────
    let backoffUntil = 0;          // timestamp — don't flush before this
    let backoffMultiplier = 1;     // grows on consecutive 429s

    // ── Phase 4: Idle detection ───────────────────────────────
    const IDLE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes
    let lastActivityAt = Date.now();
    let isIdle = false;

    function resetIdleTimer() {
        lastActivityAt = Date.now();
        if (isIdle) {
            isIdle = false;
            if (window.logDiagnostic) window.logDiagnostic('telemetry:idle-resume');
        }
    }

    // Track user activity events to detect idle
    ['keyup', 'mousemove', 'scroll', 'touchstart', 'click'].forEach(evt => {
        window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    // Periodically check idle state
    setInterval(() => {
        if (!isIdle && (Date.now() - lastActivityAt) > IDLE_THRESHOLD_MS) {
            isIdle = true;
            if (window.logDiagnostic) window.logDiagnostic('telemetry:idle-detected');
        }
    }, 30000);

    /* ── Session ID ────────────────────────────────────────── */
    try {
        const u = localStorage.getItem('np_user_data');
        if (u) {
            const data = JSON.parse(u);
            if (data && data._id) sessionId = data._id;
            else if (data && data.id) sessionId = data.id;
        }
    } catch(e){}

    /* ── Flush scheduling ───────────────────────────────────── */
    let lastFlushTime = 0;
    let flushTimeout = null;

    function track(type, payload) {
        if (isShuttingDown && type !== 'session_end') return;
        queue.push({ type, timestamp: Date.now(), ...payload });
        if (queue.length >= 50) throttleFlush();
    }

    function shouldSuppressFlush() {
        // ── Phase 4: Suppress if tab is hidden
        if (document.visibilityState === 'hidden') return true;
        // ── Phase 4: Suppress during backoff window
        if (Date.now() < backoffUntil) return true;
        // ── Phase 4: Suppress if idle (reduce to 1-per-min max)
        if (isIdle) return true;
        return false;
    }

    function throttleFlush() {
        if (shouldSuppressFlush()) return;
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

    async function flush() {
        if (shouldSuppressFlush()) return;
        if (queue.length === 0) return;

        lastFlushTime = Date.now();
        if (flushTimeout) {
            clearTimeout(flushTimeout);
            flushTimeout = null;
        }

        const payload = {
            events: queue.splice(0, queue.length),
            sessionId,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };

        try {
            const response = await fetch('/api/telemetry/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            });

            if (response.status === 429) {
                // ── Phase 4: Parse Retry-After and apply exponential backoff
                const retryAfter = parseInt(response.headers.get('Retry-After') || '15', 10);
                const backoffSeconds = Math.min(retryAfter * backoffMultiplier, 300); // cap at 5 min
                backoffUntil = Date.now() + (backoffSeconds * 1000);
                backoffMultiplier = Math.min(backoffMultiplier * 1.5, 16); // cap multiplier
                if (window.logDiagnostic) window.logDiagnostic('telemetry:429:backoff:' + backoffSeconds + 's');
                // Return dropped events to queue front so they aren't lost
                queue.unshift(...payload.events);
                return;
            }

            // Success — reset backoff
            backoffMultiplier = 1;

        } catch(e) {
            // Network error — put events back in queue
            queue.unshift(...payload.events);
        }
    }

    // ── Beacon flush (use for session_end — more reliable on tab close)
    function beaconFlush() {
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
            }
        } catch(e){}
    }

    /* ── 1. JS Errors & Unhandled Rejections ─────────────── */
    window.addEventListener('error', (e) => {
        track('error', { message: e.message, source: e.filename, lineno: e.lineno, colno: e.colno, error: e.error ? e.error.stack : null });
    });
    window.addEventListener('unhandledrejection', (e) => {
        track('error', { message: e.reason ? e.reason.message || String(e.reason) : 'Unhandled Rejection' });
    });

    /* ── 2. Fetch API Latency & Failures ─────────────────── */
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const start = Date.now();
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || 'unknown';
        // Prevent infinite self-tracking loops on telemetry reports
        if (url.includes('/telemetry/')) {
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

    /* ── 3. Memory & DOM Size Sampling ─────────────────────
       Phase 4: Skip when hidden OR idle to prevent 429 spam   */
    setInterval(() => {
        // Phase 4: Do not sample on hidden tabs or idle sessions
        if (document.visibilityState === 'hidden' || isIdle) return;

        if (performance && performance.memory) {
            track('memory', { usedJSHeapSize: performance.memory.usedJSHeapSize });
        } else {
            track('memory_unsupported', {});
        }
        track('listener_count', { count: document.getElementsByTagName('*').length });
    }, 10000);

    /* ── 4. Long Tasks ───────────────────────────────────── */
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

    /* ── 5. Route Navigation Timing ─────────────────────── */
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

    /* ── Periodic flush (Phase 4: gated by suppression logic) */
    setInterval(() => {
        if (!isIdle) throttleFlush();
    }, 15000);

    /* ── Phase 4: Idle-friendly slow flush (once per minute) */
    setInterval(() => {
        if (isIdle && queue.length > 0 && !shouldSuppressFlush()) {
            flush();
        }
    }, 60000);

    /* ── Tab Visibility (Phase 4: full pause + resume logic) */
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            track('session_end', { duration: Date.now() - sessionStart });
            isShuttingDown = true;
            beaconFlush();
        } else if (document.visibilityState === 'visible') {
            // Tab became visible again — resume session
            isShuttingDown = false;
            resetIdleTimer();
            if (window.logDiagnostic) window.logDiagnostic('telemetry:tab-visible-resume');
        }
    });

    /* ── Expose track globally for other modules ─────────── */
    window.NirnayTelemetry = { track };
})();
