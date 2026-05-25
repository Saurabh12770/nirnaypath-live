window.UIState = {
    ready: false,
    listeners: [],

    setReady() {
        if (this.ready) return;
        this.ready = true;
        this.listeners.forEach(fn => {
            try {
                fn();
            } catch (e) {
                console.error("UIState onReady error:", e);
            }
        });
        this.listeners = []; // Clear queue after execution

        // IMPORTANT: flush render queue AFTER UI is stable
        if (window.RenderController) window.RenderController.boot();
    },

    onReady(fn) {
        if (this.ready) {
            try { fn(); } catch(e) { console.error(e); }
        } else {
            this.listeners.push(fn);
        }
    }
};

