/**
 * NirnayPath Auth System
 * Handles Cookie-based authentication and updates UI
 */

const Auth = {
    userKey: 'np_user_data',
    eventListenersSetup: false,
    logoutInProgress: false,

    async init() {
        await this.checkAuthStatus();
        this.setupEventListeners();
        
        // Check for reset success
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('reset') === 'success') {
            this.showToast('Password reset successful! Please login.');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    },

    setupEventListeners() {
        if (this.eventListenersSetup) return;
        this.eventListenersSetup = true;
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');
        const loginFormContainer = document.getElementById('loginFormContainer');
        const signupFormContainer = document.getElementById('signupFormContainer');
        const forgotPasswordFormContainer = document.getElementById('forgotPasswordFormContainer');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        const backToLogin = document.getElementById('backToLogin');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');

        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                loginFormContainer.style.display = 'none';
                signupFormContainer.style.display = 'block';
            });
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                signupFormContainer.style.display = 'none';
                loginFormContainer.style.display = 'block';
            });
        }

        const closeLoginBtn = document.getElementById('closeLogin');
        const loginModal = document.getElementById('loginModal');
        if (closeLoginBtn && loginModal) {
            closeLoginBtn.addEventListener('click', () => {
                loginModal.style.display = 'none';
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPass').value;
                await this.login(email, password);
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('signupName').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPass').value;
                await this.signup(name, email, password);
            });
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                loginFormContainer.style.display = 'none';
                forgotPasswordFormContainer.style.display = 'block';
            });
        }

        if (backToLogin) {
            backToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                forgotPasswordFormContainer.style.display = 'none';
                loginFormContainer.style.display = 'block';
            });
        }

        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('forgotEmail').value;
                await this.forgotPassword(email);
            });
        }

        const loginBtn = document.getElementById('loginBtn');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (loginBtn.textContent.includes('Logout')) {
                    this.logout();
                } else {
                    const modal = document.getElementById('loginModal');
                    if (modal) modal.style.display = 'flex';
                }
            });
        }
        if (mobileLoginBtn) {
            mobileLoginBtn.addEventListener('click', () => {
                if (mobileLoginBtn.textContent.includes('Logout')) {
                    this.logout();
                } else {
                    const modal = document.getElementById('loginModal');
                    if (modal) modal.style.display = 'flex';
                }
            });
        }
    },

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                this.saveSession(data.user);
                this.updateUI(true, data.user);
                const loginModalEl = document.getElementById('loginModal');
                if (loginModalEl) loginModalEl.style.display = 'none'; // Guard: loginModal absent on about/admin pages
                this.showToast('Welcome back, ' + data.user.name);
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    },

    async signup(name, email, password) {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                this.saveSession(data.user);
                this.updateUI(true, data.user);
                const loginModalEl = document.getElementById('loginModal');
                if (loginModalEl) loginModalEl.style.display = 'none'; // Guard: loginModal absent on about/admin pages
                this.showToast('Account created successfully!');
            } else {
                alert(data.error || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during signup');
        }
    },

    async forgotPassword(email) {
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (response.ok) {
                this.showToast(data.message || 'Reset link sent!');
                // Switch back to login
                document.getElementById('forgotPasswordFormContainer').style.display = 'none';
                document.getElementById('loginFormContainer').style.display = 'block';
            } else {
                alert(data.error || 'Request failed');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            alert('An error occurred. Please try again.');
        }
    },

    saveSession(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    },

    async logout() {
        if (this.logoutInProgress) return;
        this.logoutInProgress = true;

        if (window.AsyncManager) AsyncManager.cancelAll();
        if (window.AppState) AppState.clear();

        try {
            await fetch('/api/auth/logout', {
                method: 'POST'
            });
        } catch (e) { }

        localStorage.removeItem(this.userKey);
        localStorage.removeItem('mockTestState');
        this.updateUI(false);
        window.location.reload();
    },

    async refreshAccessToken() {
        try {
            const response = await fetch('/api/auth/refresh-token', {
                method: 'POST'
            });
            return response.ok;
        } catch (error) {
            this.logout();
            return false;
        }
    },

    /**
     * Enhanced fetch with automatic retry on token expiration
     */
    async fetchWithAuth(url, options = {}) {
        const fetchFn = (window.NirnayPath && window.NirnayPath.safeFetch) ? window.NirnayPath.safeFetch : fetch;
        
        let response;
        try {
            response = await fetch(url, options); // First attempt with raw fetch to check 401
        } catch (e) {
            // If raw fetch fails (network), retry with safeFetch for better handling
            return await fetchFn(url, options);
        }

        if (response.status === 401) {
            try {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    return await fetchFn(url, options);
                }
            } catch (e) {
                console.error('Auth check failed:', e);
            }
        }

        return response;
    },

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                this.saveSession(data.user);
                this.updateUI(true, data.user);
                return true;
            }
        } catch (e) {
            console.error('Auth status check failed:', e);
        }
        localStorage.removeItem(this.userKey);
        this.updateUI(false);
        return false;
    },
    updateUI(isLoggedIn, user = null) {
        try {
            if (window.AppState) {
                AppState.dispatch(
                    'auth',
                    {
                        user: isLoggedIn ? user : null,
                        loaded: true
                    }
                );
            }
        } catch(e){
            console.error(
                'AppState sync failed:',
                e
            );
        }

        if (window.AuthStore){
            if(isLoggedIn && user)
                AuthStore.setUser(user);
            else
                AuthStore.clear();
        }


        const loginBtn = document.getElementById('loginBtn');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const candName = document.getElementById('cand-name');
        const adminNavLink = document.getElementById('adminNavLink');
        const mobileAdminNavLink = document.getElementById('mobileAdminNavLink');
        const dashNavLink = document.getElementById('dashNavLink');

        if (isLoggedIn && user) {
            const logoutHtml = `<i class="fas fa-sign-out-alt"></i> Logout`;
            if (loginBtn) {
                loginBtn.innerHTML = logoutHtml;
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = logoutHtml;
            }
            if (userNameDisplay) {
                userNameDisplay.textContent = user.name;
                userNameDisplay.style.display = 'inline-block';
                userNameDisplay.style.cursor = 'pointer';
                userNameDisplay.onclick = () => Dashboard.show();
            }
            if (user.role === 'admin') {
                if (adminNavLink) adminNavLink.style.display = 'inline-block';
                if (mobileAdminNavLink) mobileAdminNavLink.style.display = 'flex';
            } else {
                if (adminNavLink) adminNavLink.style.display = 'none';
                if (mobileAdminNavLink) mobileAdminNavLink.style.display = 'none';
            }
            if (candName) candName.textContent = user.name;
            if (dashNavLink) dashNavLink.style.display = 'inline-block';
        } else {
            const loginHtml = `<i class="fas fa-sign-in-alt"></i> Login`;
            if (loginBtn) {
                loginBtn.innerHTML = loginHtml;
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = loginHtml;
            }
            if (userNameDisplay) userNameDisplay.style.display = 'none';
            if (adminNavLink) adminNavLink.style.display = 'none';
            if (mobileAdminNavLink) mobileAdminNavLink.style.display = 'none';
            if (dashNavLink) dashNavLink.style.display = 'none';
        }
    },

    getToken() {
        try {
            const data = localStorage.getItem(this.userKey);
            if (!data) return null;
            const parsed = JSON.parse(data);
            return parsed.token || null;
        } catch (e) {
            return null;
        }
    },

    isLoggedIn() {
        return !!localStorage.getItem(this.userKey);
    },

    showToast(msg) {
        if (window.showToast) {
            window.showToast(msg, 'var(--primary)', '#fff');
        } else {
            console.log('Toast:', msg);
        }
    }
};

AppLifecycle.register(() => Auth.init());

