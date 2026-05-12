/**
 * NirnayPath Auth System
 * Handles JWT storage, Login/Signup, and Protected Routes
 */

const Auth = {
    tokenKey: 'np_auth_token',
    refreshKey: 'np_refresh_token',
    userKey: 'np_user_data',

    init() {
        this.checkAuthStatus();
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
        // ... (existing listeners remain same)
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
                this.saveSession(data.token, data.refreshToken, data.user);
                this.updateUI(true, data.user);
                document.getElementById('loginModal').style.display = 'none';
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
                this.saveSession(data.token, data.refreshToken, data.user);
                this.updateUI(true, data.user);
                document.getElementById('loginModal').style.display = 'none';
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

    saveSession(token, refreshToken, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.refreshKey, refreshToken);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    },

    async logout() {
        const refreshToken = localStorage.getItem(this.refreshKey);
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
        } catch (e) { }

        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem('mockTestState');
        this.updateUI(false);
        window.location.reload();
    },

    async refreshAccessToken() {
        const refreshToken = localStorage.getItem(this.refreshKey);
        if (!refreshToken) return null;

        try {
            const response = await fetch('/api/auth/refresh-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem(this.tokenKey, data.token);
                localStorage.setItem(this.refreshKey, data.refreshToken);
                return data.token;
            } else {
                this.logout();
                return null;
            }
        } catch (error) {
            this.logout();
            return null;
        }
    },

    /**
     * Enhanced fetch with automatic retry on token expiration
     */
    async fetchWithAuth(url, options = {}) {
        let token = this.getToken();
        if (!options.headers) options.headers = {};
        options.headers['Authorization'] = `Bearer ${token}`;

        let response = await fetch(url, options);

        if (response.status === 401) {
            let isExpired = false;
            try {
                // Clone to avoid "body used" error if we need to read it
                const clone = response.clone();
                const data = await clone.json();
                if (data.code === 'TOKEN_EXPIRED') isExpired = true;
            } catch (e) {
                // If not JSON or other error, assume not expired but just unauthorized
            }

            if (isExpired) {
                console.log('[Auth] Token expired, attempting refresh...');
                const newToken = await this.refreshAccessToken();
                if (newToken) {
                    options.headers['Authorization'] = `Bearer ${newToken}`;
                    return fetch(url, options);
                }
            }
            
            // If we reached here, either refresh failed or it was a real 401
            // Don't logout on login/refresh calls to avoid loops
            if (!url.includes('/api/auth/')) {
                console.warn('[Auth] Unauthorized access, logging out');
                this.logout();
            }
        }

        return response;
    },

    checkAuthStatus() {
        const token = localStorage.getItem(this.tokenKey);
        const userStr = localStorage.getItem(this.userKey);
        
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                this.updateUI(true, user);
                return true;
            } catch (e) {
                this.logout();
            }
        }
        this.updateUI(false);
        return false;
    },

    updateUI(isLoggedIn, user = null) {
        const loginBtn = document.getElementById('loginBtn');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const candName = document.getElementById('cand-name');
        const adminNavLink = document.getElementById('adminNavLink');
        const mobileAdminNavLink = document.getElementById('mobileAdminNavLink');

        if (isLoggedIn && user) {
            const logoutHtml = `<i class="fas fa-sign-out-alt"></i> Logout`;
            if (loginBtn) {
                loginBtn.innerHTML = logoutHtml;
                loginBtn.onclick = () => this.logout();
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = logoutHtml;
                mobileLoginBtn.onclick = () => this.logout();
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
        } else {
            const loginHtml = `<i class="fas fa-sign-in-alt"></i> Login`;
            if (loginBtn) {
                loginBtn.innerHTML = loginHtml;
                loginBtn.onclick = () => {
                    const modal = document.getElementById('loginModal');
                    if (modal) modal.style.display = 'flex';
                };
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = loginHtml;
                mobileLoginBtn.onclick = () => {
                    const modal = document.getElementById('loginModal');
                    if (modal) modal.style.display = 'flex';
                };
            }
            if (userNameDisplay) userNameDisplay.style.display = 'none';
            if (adminNavLink) adminNavLink.style.display = 'none';
            if (mobileAdminNavLink) mobileAdminNavLink.style.display = 'none';
        }
    },

    getToken() {
        return localStorage.getItem(this.tokenKey);
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    showToast(msg) {
        if (window.showToast) {
            window.showToast(msg, 'var(--primary)', '#fff');
        } else {
            console.log('Toast:', msg);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());
