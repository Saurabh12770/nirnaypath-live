/**
 * NirnayPath Auth System
 * Handles JWT storage, Login/Signup, and Protected Routes
 */

const Auth = {
    tokenKey: 'np_auth_token',
    userKey: 'np_user_data',

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');
        const loginFormContainer = document.getElementById('loginFormContainer');
        const signupFormContainer = document.getElementById('signupFormContainer');

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
                this.saveSession(data.token, data.user);
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
                this.saveSession(data.token, data.user);
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

    saveSession(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem('mockTestState');
        this.updateUI(false);
        window.location.reload();
    },

    checkAuthStatus() {
        const token = localStorage.getItem(this.tokenKey);
        const userStr = localStorage.getItem(this.userKey);
        
        if (token && userStr) {
            const user = JSON.parse(userStr);
            this.updateUI(true, user);
            return true;
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
                loginBtn.onclick = () => document.getElementById('loginModal').style.display = 'flex';
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = loginHtml;
                mobileLoginBtn.onclick = () => document.getElementById('loginModal').style.display = 'flex';
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
