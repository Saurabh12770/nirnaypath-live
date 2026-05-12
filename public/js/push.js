/* push.js - Handles push notification subscription */

const PushManager = {
    publicVapidKey: 'BNUaS5vSyhaHFhm2k0dXnO1sS3Y-WfWbN7PjrxmaNdtr-gwGCbT64DcgYgBhIKxgIi5c3ySUheGlcJTyhpQ9K5I',

    async init() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            console.log('Push notifications supported');
            this.registerServiceWorker();
        }
    },

    async registerServiceWorker() {
        try {
            const register = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });
            console.log('Service Worker Registered');

            // If user is logged in, try to subscribe
            if (Auth.isLoggedIn()) {
                this.checkSubscription(register);
            }
        } catch (error) {
            console.error('Service Worker Registration Error:', error);
        }
    },

    async checkSubscription(register) {
        let subscription = await register.pushManager.getSubscription();
        
        if (!subscription) {
            this.subscribeUser(register);
        } else {
            console.log('User already subscribed to push');
            // Optionally update subscription on backend to be safe
            this.sendSubscriptionToBackend(subscription);
        }
    },

    async subscribeUser(register) {
        try {
            if (!register.active) {
                console.warn('Service Worker not active yet. Subscription deferred.');
                return;
            }
            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey)
            });

            console.log('User Subscribed:', subscription);
            await this.sendSubscriptionToBackend(subscription);
        } catch (error) {
            if (Notification.permission === 'denied') {
                console.warn('Permission for notifications was denied');
            } else {
                console.error('Failed to subscribe user:', error);
            }
        }
    },

    async sendSubscriptionToBackend(subscription) {
        const token = Auth.getToken();
        if (!token) return;

        try {
            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                console.log('Subscription saved to backend');
            }
        } catch (error) {
            console.error('Error sending subscription to backend:', error);
        }
    },

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
};

// Initialize after Auth is available
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure Auth is initialized
    setTimeout(() => {
        if (Auth.isLoggedIn()) {
            PushManager.init();
        }
    }, 1000);
});
