window.AppLifecycle = {
    initQueue: [],

    register(fn) {
        this.initQueue.push(fn);
    },

    reset() {
        this.initQueue = [];
    },

    boot() {
        this.initQueue.forEach(fn => {
            try {
                fn();
            } catch (e) {
                console.error("Init error:", e);
            }
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    AppLifecycle.boot();
});

window.addEventListener("beforeunload", () => {
    AppLifecycle.reset();
});

window.addEventListener("load", () => {
    setTimeout(() => {
        if (window.UIState) {
            UIState.setReady();
        }
    }, 50);
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

