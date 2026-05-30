/* ============================================================
   NirnayPath Telemetry Engine — v4.1 Emergency Stabilized
   ✅ Singleton guard (no double-init on multi-page loads)
   ✅ Tab-Visibility Pause (no sampling on hidden tabs)
   ✅ Idle Detection (throttle after 3 min inactivity)
   ✅ Exponential Backoff on 429 (Retry-After compliance)
   ✅ Self-tracking loop guard
   ✅ [PATCH v4.1] Memory sampler: 10s → 60s  (6x reduction)
   ✅ [PATCH v4.1] Main flush interval: 15s → 30s (2x reduction)
   ✅ [PATCH v4.1] Min flush cooldown: 10s → 30s (3x reduction)
   ✅ [PATCH v4.1] Post-resume grace period: 5s backoff on tab-visible
   ✅ [PATCH v4.1] Idle flush: 60s → 120s
   ============================================================ */
(function() {
    'use strict';

    /* ── Singleton Guard ────────────────────────────────────────
       Prevents re-execution if telemetry.js is loaded more than
       once in the same browsing context (e.g. multi-page MPA). */
    if (window.__NirnayTelemetryLoaded) return;
    window.__NirnayTelemetryLoaded = true;

    /* ── State ─────────────────────────────────────────────── */
    const queue = [];
    let sessionId = 'anonymous';
    const sessionStart = Date.now();
    let isShuttingDown = false;

    // ── Backoff state ─────────────────────────────────────────
    let backoffUntil = 0;          // timestamp — don't flush before this
    let backoffMultiplier = 1;     // grows on consecutive 429s

    // ── Idle detection ────────────────────────────────────────
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

    // Periodically check idle state (kept at 30s — low cost)
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

    // [PATCH v4.1] MINIMUM_FLUSH_INTERVAL raised from 10s → 30s
    // This is the primary throttle. Even if events arrive rapidly,
    // we will never POST more than once per 30 seconds.
    const MINIMUM_FLUSH_INTERVAL_MS = 30000;

    function track(type, payload) {
        if (isShuttingDown && type !== 'session_end') return;
        queue.push({ type, timestamp: Date.now(), ...payload });
        if (queue.length >= 50) throttleFlush();
    }

    function shouldSuppressFlush() {
        // Suppress if tab is hidden
        if (document.visibilityState === 'hidden') return true;
        // Suppress during backoff window
        if (Date.now() < backoffUntil) return true;
        // Suppress if idle (main interval also gates on !isIdle)
        if (isIdle) return true;
        return false;
    }

    function throttleFlush() {
        if (shouldSuppressFlush()) return;
        const now = Date.now();
        // [PATCH v4.1] Hard minimum: 30s between any two flushes
        if (now - lastFlushTime < MINIMUM_FLUSH_INTERVAL_MS) {
            if (!flushTimeout) {
                flushTimeout = setTimeout(() => {
                    flushTimeout = null;
                    flush();
                }, MINIMUM_FLUSH_INTERVAL_MS - (now - lastFlushTime));
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
                // Parse Retry-After and apply exponential backoff.
                // [PATCH v4.1] Use Retry-After as the BASE (not multiplied before min),
                // ensuring the first retry is at least as long as the server requests.
                const retryAfter = parseInt(response.headers.get('Retry-After') || '30', 10);
                const backoffSeconds = Math.min(retryAfter * backoffMultiplier, 300); // cap at 5 min
                backoffUntil = Date.now() + (backoffSeconds * 1000);
                backoffMultiplier = Math.min(backoffMultiplier * 1.5, 16);
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

    /* ── 3. Memory & DOM Size Sampling ───────────────────────
       [PATCH v4.1] Interval raised from 10s → 60s.
       Previously: 2 events every 10s = 12 events/min = 1 flush/min minimum.
       Now:        2 events every 60s = 2 events/min = 1 flush per ~15 min.   */
    setInterval(() => {
        // Do not sample on hidden tabs or idle sessions
        if (document.visibilityState === 'hidden' || isIdle) return;

        if (performance && performance.memory) {
            track('memory', { usedJSHeapSize: performance.memory.usedJSHeapSize });
        } else {
            track('memory_unsupported', {});
        }
        track('listener_count', { count: document.getElementsByTagName('*').length });
    }, 60000); // [PATCH v4.1] was 10000

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

    /* ── Periodic flush ───────────────────────────────────────
       [PATCH v4.1] Interval raised from 15s → 30s.
       Combined with MINIMUM_FLUSH_INTERVAL_MS=30s, this means
       the absolute maximum rate is 1 POST per 30 seconds.         */
    setInterval(() => {
        if (!isIdle) throttleFlush();
    }, 30000); // [PATCH v4.1] was 15000

    /* ── Idle-friendly slow flush ─────────────────────────────
       [PATCH v4.1] Interval raised from 60s → 120s.              */
    setInterval(() => {
        if (isIdle && queue.length > 0 && !shouldSuppressFlush()) {
            flush();
        }
    }, 120000); // [PATCH v4.1] was 60000

    /* ── Tab Visibility ───────────────────────────────────────
       [PATCH v4.1] On tab-visible resume, apply a 5-second
       grace period before allowing any flush. This prevents the
       immediate POST storm that occurred when the user switched
       back to the tab (memory sampler would fire within seconds
       of resume and immediately trigger throttleFlush).            */
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            track('session_end', { duration: Date.now() - sessionStart });
            isShuttingDown = true;
            beaconFlush();
        } else if (document.visibilityState === 'visible') {
            // Tab became visible again — resume session with grace period
            isShuttingDown = false;
            resetIdleTimer();
            // [PATCH v4.1] Apply 5s grace period to absorb first-frame events
            // without immediately flushing to the server.
            backoffUntil = Math.max(backoffUntil, Date.now() + 5000);
            if (window.logDiagnostic) window.logDiagnostic('telemetry:tab-visible-resume');
        }
    });

    /* ── Expose track globally for other modules ─────────── */
    window.NirnayTelemetry = { track };
})();
