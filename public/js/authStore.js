window.AuthStore = {
    state: {
        user: null,
        loaded: false
    },

    setUser(user) {
        this.state.user = user;
        this.state.loaded = true;
        this.notify();
    },

    clear() {
        this.state.user = null;
        this.state.loaded = true;
        this.notify();
    },

    listeners: [],

    subscribe(fn) {
        this.listeners.push(fn);
    },

    notify() {
        this.listeners.forEach(fn => {
            try {
                fn(this.state);
            } catch (e) {
                console.error(e);
            }
        });
    }
};
