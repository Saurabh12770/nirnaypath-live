/* app.js - PWA Registration & Install logic */

let deferredPrompt;

const PWA = {
    init() {
        this.registerSW();
        this.initInstallPrompt();
    },

    registerSW() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('SW registered:', reg.scope))
                    .catch(err => console.log('SW registration failed:', err));
            });
        }
    },

    initInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            deferredPrompt = e;
            // Update UI notify the user they can add to home screen
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log('NirnayPath was installed');
            this.hideInstallButton();
        });
    },

    showInstallButton() {
        const installBtn = document.getElementById('installAppBtn');
        if (installBtn) installBtn.style.display = 'block';
    },

    hideInstallButton() {
        const installBtn = document.getElementById('installAppBtn');
        if (installBtn) installBtn.style.display = 'none';
    },

    async install() {
        if (!deferredPrompt) return;
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
        this.hideInstallButton();
    }
};

const PaymentManager = {
    async upgrade(planId = 'pro_monthly') {
        const token = Auth.getToken();
        if (!token) {
            window.showToast('Please login to upgrade.', 'var(--danger)');
            const modal = document.getElementById('loginModal');
            if (modal) modal.style.display = 'flex';
            return;
        }

        try {
            const res = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ planId })
            });

            const order = await res.json();
            if (!res.ok) throw new Error(order.error || order.message);

            const userStr = localStorage.getItem('np_user_data');
            const user = userStr ? JSON.parse(userStr) : {};

            const options = {
                key: order.key_id, // Use key from server
                amount: order.amount,
                currency: order.currency,
                name: "NirnayPath Pro",
                description: planId === 'pro_yearly' ? "Yearly Subscription" : "Monthly Subscription",
                order_id: order.order_id,
                handler: async (response) => {
                    await this.verifyPayment(response, planId);
                },
                prefill: {
                    name: user.name || "",
                    email: user.email || ""
                },
                theme: { color: "#6366f1" },
                modal: {
                    ondismiss: function() {
                        console.log('Checkout dismissed');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Upgrade error:', error);
            window.showToast(error.message, 'var(--danger)');
        }
    },

    async verifyPayment(response, planId) {
        const token = Auth.getToken();
        try {
            const res = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    planId: planId
                })
            });

            const data = await res.json();
            if (data.success) {
                window.showToast('Congratulations! You are now a Pro member.', 'var(--success)');
                document.getElementById('upgradeModal').style.display = 'none';
                
                // Update local storage plan
                const userStr = localStorage.getItem('np_user_data');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.plan = planId;
                    localStorage.setItem('np_user_data', JSON.stringify(user));
                }

                // Refresh dashboard if visible
                if (window.Dashboard) window.Dashboard.show();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            window.showToast('Payment verification failed: ' + error.message, 'var(--danger)');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => PWA.init());
