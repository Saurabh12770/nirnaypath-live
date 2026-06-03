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
                const btn = document.getElementById('doLogin');
                if (btn) {
                    if (btn.disabled) return;
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
                }
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPass').value;
                try {
                    await this.login(email, password);
                } finally {
                    if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In & Continue Practice';
                    }
                }
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
                this.showOnboardingModal(data.user);
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
        // BUG-07 FIX: If there is no stored session in localStorage, there is
        // nothing to verify on the server. Skip the network call entirely to
        // avoid two spurious 401s (GET /api/user/me + POST /api/auth/refresh-token)
        // on every guest page load.
        if (!localStorage.getItem(this.userKey)) {
            this.updateUI(false);
            return false;
        }

        try {
            const token = this.getToken();
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch('/api/user/me', { 
                headers,
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                this.saveSession(data.user);
                this.updateUI(true, data.user);
                return true;
            } else if (response.status === 401 || response.status === 503) {
                // 401: Token expired/invalid; 503: DB error — clear stale session, update UI as guest
                localStorage.removeItem(this.userKey);
                this.updateUI(false);
                return false;
            }
        } catch (e) {
            console.warn('Auth status check skipped or offline:', e.message);
        }
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
        const mobileDashNavLink = document.getElementById('mobileDashNavLink');

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
            if (mobileDashNavLink) mobileDashNavLink.style.display = 'flex';
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
            if (mobileDashNavLink) mobileDashNavLink.style.display = 'none';
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
    },

    showOnboardingModal(user) {
        let modal = document.getElementById('onboardingModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'onboardingModal';
            modal.className = 'modal-overlay onboarding-modal';
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.75);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                padding: 20px;
                font-family: 'Poppins', sans-serif;
            `;
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="onboarding-card" style="
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
                border-radius: 24px;
                width: 100%;
                max-width: 540px;
                padding: 40px;
                color: #ffffff;
                text-align: center;
                transform: translateY(20px);
                transition: transform 0.3s ease;
                position: relative;
                overflow: hidden;
            ">
                <div style="position: absolute; width: 250px; height: 250px; border-radius: 50%; background: rgba(79, 70, 229, 0.25); filter: blur(60px); top: -80px; left: -80px; pointer-events: none;"></div>
                <div style="position: absolute; width: 250px; height: 250px; border-radius: 50%; background: rgba(236, 72, 153, 0.2); filter: blur(60px); bottom: -80px; right: -80px; pointer-events: none;"></div>

                <div style="font-size: 3.5rem; margin-bottom: 20px;">🎉</div>
                <h2 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; line-height: 1.2;">
                    Welcome, <span style="background: linear-gradient(135deg, #818cf8, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${user.name}</span>!
                </h2>
                <p style="font-size: 0.95rem; color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 30px;">
                    Let's personalize your prep. What is your primary target exam?
                </p>

                <div class="exam-selection-grid" style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin-bottom: 35px;
                ">
                    <button class="onboard-exam-opt" data-exam="upsc" style="
                        background: rgba(255, 255, 255, 0.06);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: #ffffff;
                        padding: 16px;
                        border-radius: 16px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.95rem;
                        transition: all 0.2s ease;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-crown" style="font-size: 1.25rem; color: #f59e0b;"></i>
                        UPSC IAS
                    </button>
                    <button class="onboard-exam-opt" data-exam="bpsc" style="
                        background: rgba(255, 255, 255, 0.06);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: #ffffff;
                        padding: 16px;
                        border-radius: 16px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.95rem;
                        transition: all 0.2s ease;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-landmark" style="font-size: 1.25rem; color: #10b981;"></i>
                        BPSC CCE
                    </button>
                    <button class="onboard-exam-opt" data-exam="ssc" style="
                        background: rgba(255, 255, 255, 0.06);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: #ffffff;
                        padding: 16px;
                        border-radius: 16px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.95rem;
                        transition: all 0.2s ease;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-file-contract" style="font-size: 1.25rem; color: #3b82f6;"></i>
                        SSC CGL
                    </button>
                    <button class="onboard-exam-opt" data-exam="banking" style="
                        background: rgba(255, 255, 255, 0.06);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: #ffffff;
                        padding: 16px;
                        border-radius: 16px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.95rem;
                        transition: all 0.2s ease;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-university" style="font-size: 1.25rem; color: #a855f7;"></i>
                        Banking
                    </button>
                </div>

                <button id="onboardingSubmitBtn" disabled style="
                    background: linear-gradient(135deg, #4f46e5, #ec4899);
                    border: none;
                    color: #ffffff;
                    padding: 16px 40px;
                    border-radius: 99px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: not-allowed;
                    opacity: 0.5;
                    transition: all 0.3s ease;
                    width: 100%;
                    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
                ">
                    Select an Exam to Start
                </button>
            </div>
        `;

        let selectedExam = null;
        const submitBtn = modal.querySelector('#onboardingSubmitBtn');
        const options = modal.querySelectorAll('.onboard-exam-opt');

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => {
                    o.style.background = 'rgba(255, 255, 255, 0.06)';
                    o.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    o.style.boxShadow = 'none';
                });
                
                opt.style.background = 'rgba(79, 70, 229, 0.15)';
                opt.style.borderColor = '#4f46e5';
                opt.style.boxShadow = '0 0 15px rgba(79, 70, 229, 0.3)';
                
                selectedExam = opt.dataset.exam;
                submitBtn.disabled = false;
                submitBtn.style.cursor = 'pointer';
                submitBtn.style.opacity = '1';
                submitBtn.textContent = "Start Preparation 🚀";
            });
        });

        submitBtn.addEventListener('click', () => {
            if (!selectedExam) return;
            
            localStorage.setItem('np_user_exam', selectedExam);
            
            modal.style.opacity = '0';
            modal.querySelector('.onboarding-card').style.transform = 'translateY(20px)';
            setTimeout(() => {
                modal.style.display = 'none';
                
                if (typeof window.setActiveExam === 'function') {
                    window.setActiveExam(selectedExam);
                }
                
                const targetSec = document.getElementById('popular-exams') || document.getElementById('subject-selection-area');
                if (targetSec) {
                    targetSec.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        });

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('.onboarding-card').style.transform = 'translateY(0)';
        }, 50);
    }
};

window.Auth = Auth;
AppLifecycle.register(() => Auth.init());

