/**
 * AsyncManager - Centralized AbortController management
 */
window.AsyncManager = {
    controllers: {},

    // Returns a new signal for a given context
    getSignal(context) {
        if (this.controllers[context]) {
            this.controllers[context].abort();
        }
        this.controllers[context] = new AbortController();
        return this.controllers[context].signal;
    },

    // Abort a specific context
    cancel(context) {
        if (this.controllers[context]) {
            this.controllers[context].abort();
            delete this.controllers[context];
        }
    },

    // Abort all in-flight requests
    cancelAll() {
        Object.keys(this.controllers).forEach(context => {
            this.controllers[context].abort();
            delete this.controllers[context];
        });
    }
};
