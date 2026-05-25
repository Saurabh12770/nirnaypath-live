window.RenderController = {
    queue: [],
    ready: false,

    register(fn) {
        if (this.ready) fn();
        else this.queue.push(fn);
    },

    commit(fn) {
        // Enforce atomic render batching
        if (this.ready) {
            requestAnimationFrame(() => fn());
        } else {
            this.queue.push(() => requestAnimationFrame(() => fn()));
        }
    },

    boot() {
        this.ready = true;
        this.queue.forEach(fn => fn());
        this.queue = [];
        
        // Step 4 - Force Chart Stabilization Delay
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 150);
    }
};
