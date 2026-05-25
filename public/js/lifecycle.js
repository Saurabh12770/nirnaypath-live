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
