/**
 * Global AppState - Single Source of Truth
 */
const deepFreeze = (obj) => {
    Object.keys(obj).forEach(prop => {
        if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
            deepFreeze(obj[prop]);
        }
    });
    return Object.freeze(obj);
};

window.AppState = {
    _state: {
        auth: {
            user: null,
            loaded: false
        },
        ui: {
            currentView: 'userDashboard',
            loading: false
        },
        dashboard: {
            profile: null,
            stats: null,
            leaderboard: null
        },
        test: {
            status: 'idle', // idle, loading, active, submitting, review
            subject: '',
            exam: '',
            mode: 'full',
            modeValue: null,
            timeLimit: 0,
            timeLeft: 0,
            currentIdx: 0,
            selectedQuestions: [],
            answers: {},
            visited: [],
            marked: []
        }
    },
    
    _listeners: [],

    // Retrieve a frozen snapshot of the current state
    getState() {
        return deepFreeze(JSON.parse(JSON.stringify(this._state)));
    },

    // Deterministic state mutation
    dispatch(domain, payload) {
        if (!this._state[domain]) {
            console.warn(`Unknown state domain: ${domain}`);
            return;
        }

        // Apply payload updates
        this._state[domain] = { ...this._state[domain], ...payload };
        this._notify();
    },

    // Full reset
    clear() {
        this._state = {
            auth: { user: null, loaded: true },
            ui: { currentView: 'loginModal', loading: false },
            dashboard: { profile: null, stats: null, leaderboard: null },
            test: {
                status: 'idle', subject: '', exam: '', mode: 'full', modeValue: null,
                timeLimit: 0, timeLeft: 0, currentIdx: 0, selectedQuestions: [],
                answers: {}, visited: [], marked: []
            }
        };
        this._notify();
    },

    subscribe(fn) {
        this._listeners.push(fn);
        return () => {
            this._listeners = this._listeners.filter(l => l !== fn);
        };
    },

    _notify() {
        const snapshot = this.getState();
        this._listeners.forEach(fn => {
            try { fn(snapshot); } catch (e) { console.error('AppState listener error:', e); }
        });
    }
};
