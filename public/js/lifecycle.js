window.AppLifecycle = {
    initQueue: [],

    register(fn) {
        this.initQueue.push(fn);
    },

    reset() {
        this.initQueue = [];
    },

    async boot() {
        // 1. AUTH READY: Initialize authentication first and wait for it
        if (window.Auth && typeof window.Auth.init === 'function') {
            try {
                await window.Auth.init();
            } catch (e) {
                console.error("Auth init failed:", e);
            }
        }

        // 2. STATE READY: Run other initializers and mark state ready
        const remainingInits = this.initQueue.filter(fn => {
            const fnStr = fn.toString();
            return !fnStr.includes('Auth.init');
        });

        for (const fn of remainingInits) {
            try {
                const res = fn();
                if (res instanceof Promise) await res;
            } catch (e) {
                console.error("Initializer failed:", e);
            }
        }

        if (window.UIState) {
            window.UIState.setReady();
        }

        // 3. ROUTE READY: Wait for routing/navigation and session checks to settle
        if (window.checkExistingTestSession) {
            try {
                await window.checkExistingTestSession();
            } catch (e) {
                console.error("checkExistingTestSession failed:", e);
            }
        }

        // 4. RENDER: Allow RenderController to boot and flush rendering to DOM
        if (window.RenderController) {
            window.RenderController.boot();
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    AppLifecycle.boot();
});

window.addEventListener("beforeunload", () => {
    AppLifecycle.reset();
});

// Safe window.showToast fallback definition
if (!window.showToast) {
    window.showToast = function(msg, bg = '#1F2937', color = '#FCD34D') {
        console.log("[Toast Fallback]:", msg);
        const showFallback = () => {
            let t = document.getElementById('np-fallback-toast');
            if (!t) {
                t = document.createElement('div');
                t.id = 'np-fallback-toast';
                t.style.cssText = 'position:fixed;bottom:90px;right:20px;z-index:9999;background:#1F2937;color:#FCD34D;padding:14px 22px;border-radius:10px;font-weight:700;font-size:.87rem;box-shadow:0 8px 30px rgba(0,0,0,.35);max-width:340px;font-family:sans-serif;border:2px solid #FCD34D;transition:opacity 0.35s ease;';
                document.body.appendChild(t);
            }
            t.textContent = msg;
            t.style.background = bg;
            t.style.color = color;
            t.style.borderColor = color;
            t.style.opacity = '1';
            t.style.display = 'block';
            if (window.__fallbackToastTimeout) clearTimeout(window.__fallbackToastTimeout);
            window.__fallbackToastTimeout = setTimeout(() => {
                t.style.opacity = '0';
                setTimeout(() => { t.style.display = 'none'; }, 350);
            }, 4500);
        };
        if (document.body) showFallback();
        else document.addEventListener('DOMContentLoaded', showFallback);
    };
    window.showToast.isFallback = true;
}

