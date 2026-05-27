if (!window.showToast || window.showToast.isFallback) {
    window.showToast = function(msg, bg = '#1F2937', color = '#FCD34D') {
        document.getElementById('np-fallback-toast')?.remove();
        const t = document.createElement('div');
        t.style.cssText = `position:fixed;bottom:90px;right:20px;z-index:9999;background:${bg};color:${color};padding:14px 22px;border-radius:10px;font-weight:700;font-size:.87rem;box-shadow:0 8px 30px rgba(0,0,0,.35);max-width:340px;font-family:Poppins,sans-serif;border:2px solid ${color};animation:toastIn .35s ease;`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 4500);
    };
}

window.NirnayPath = {
    /**
     * Centered Safe Fetch Wrapper
     */
    async safeFetch(url, options = {}, timeout = 15000) {
        const method = (options.method || 'GET').toUpperCase();
        if (method === 'GET') {
            if (!window.NirnayPath._inFlight) {
                window.NirnayPath._inFlight = new Map();
            }
            if (window.NirnayPath._inFlight.has(url)) {
                return window.NirnayPath._inFlight.get(url);
            }
            const promise = (async () => {
                try {
                    return await window.NirnayPath._executeFetch(url, options, timeout);
                } finally {
                    window.NirnayPath._inFlight.delete(url);
                }
            })();
            window.NirnayPath._inFlight.set(url, promise);
            return promise;
        }
        return window.NirnayPath._executeFetch(url, options, timeout);
    },

    async _executeFetch(url, options = {}, timeout = 15000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const defaultHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (window.Auth && window.Auth.isLoggedIn()) {
            defaultHeaders['Authorization'] = `Bearer ${window.Auth.getToken()}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...defaultHeaders, ...options.headers },
                signal: controller.signal
            });
            clearTimeout(id);

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
                return data;
            }
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (error) {
            clearTimeout(id);
            console.error(`[SafeFetch] Failed: ${url}`, error.message);
            
            if (window.showToast) {
                if (error.name === 'AbortError') window.showToast('Request timed out', 'var(--warning)');
                else if (error.message.includes('Failed to fetch')) window.showToast('Network error', 'var(--danger)');
            }
            throw error;
        }
    },

    /**
     * Initialize Global UI Components (Logo, Theme, Mobile Nav)
     */
    initGlobalUI() {
        // 1. Logo Click Reliability (Disabled on Secure Test Terminal page to prevent accidental abandonment)
        if (!window.location.pathname.includes('test.html')) {
            document.querySelectorAll(".logo").forEach(el => {
                el.style.cursor = 'pointer';
                el.onclick = () => window.location.href = "/index.html";
            });
        }

        // 2. Global Image Fallback
        document.addEventListener("error", function(e) {
            if (e.target.tagName === "IMG") {
                const initials = e.target.alt || "NP";
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;
                e.target.onerror = null;
            }
        }, true);

        // 3. Theme Initialization
        this.initTheme();

        // 4. Mobile Menu
        this.initMobileMenu();
        
        // 5. Language Active State (if toggle exists)
        this.syncLanguageUI();
        
        // 6. Global animation initialization (fixes about.html visibility)
        this.initScrollAnimations();
    },

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.remove('light-mode');
        }

        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = (localStorage.getItem('theme') === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            toggle.onclick = () => {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                if (isDark) {
                    document.documentElement.removeAttribute('data-theme');
                    document.body.classList.add('light-mode');
                    localStorage.setItem('theme', 'light');
                    toggle.innerHTML = '<i class="fas fa-moon"></i>';
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.body.classList.remove('light-mode');
                    localStorage.setItem('theme', 'dark');
                    toggle.innerHTML = '<i class="fas fa-sun"></i>';
                }
            };
        }
    },

    initMobileMenu() {
        const menuToggle = document.getElementById('mobileMenuToggle');
        const closePanel = document.getElementById('closePanelBtn');
        const panel = document.getElementById('mobileNavPanel');
        const overlay = document.getElementById('panelOverlay');

        if (menuToggle && panel && overlay) {
            const open = () => {
                panel.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            };
            const close = () => {
                panel.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            };
            menuToggle.onclick = open;
            if (closePanel) closePanel.onclick = close;
            overlay.onclick = close;
        }
    },

    syncLanguageUI() {
        const lang = localStorage.getItem('np_language') || 'en';
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.dataset.lang === lang) btn.classList.add('active-lang');
            else btn.classList.remove('active-lang');
            
            // Re-bind click listener for dynamic stability
            btn.onclick = () => {
                if (window.setLanguage) window.setLanguage(btn.dataset.lang);
                else {
                    localStorage.setItem('np_language', btn.dataset.lang);
                    this.syncLanguageUI();
                }
            };
        });
    },

    initScrollAnimations() {
        if (window.__scrollAnimationsInitialized) return;
        window.__scrollAnimationsInitialized = true;
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add('active');
                        observer.unobserve(e.target);
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        } else {
            document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
        }
    }
};

// Auto-init on load
AppLifecycle.register(() => window.NirnayPath.initGlobalUI());


// Global Auth UI Sync
if (window.AuthStore) {
    AuthStore.subscribe((state) => {
        const loginBtn = document.getElementById("loginBtn");
        const logoutBtn = document.getElementById("logoutBtn"); // Assuming this exists or is part of auth flow
        const mobileLoginBtn = document.getElementById("mobileLoginBtn");
        const logo = document.querySelector(".logo"); // Using class since logo is usually a class, but let's check what user said

        // The user specifically asked for:
        // if (!loginBtn || !logoutBtn) return;
        // if (state.user) { loginBtn.style.display = "none"; logoutBtn.style.display = "block"; } ...
        // I will implement a robust version that handles the actual NirnayPath structure.

        const execDOM = () => {
            if (state.user) {
                if (loginBtn) loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                if (mobileLoginBtn) mobileLoginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            } else {
                if (loginBtn) loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                if (mobileLoginBtn) mobileLoginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            }

            // Ensure logo is always visible
            document.querySelectorAll('.logo').forEach(l => l.style.display = 'flex');
        };
        if (window.RenderController) RenderController.register(execDOM);
        else execDOM();
    });
}

// Step 5: Enforce Theme Sync via AuthStore
if (window.AuthStore) {
    AuthStore.subscribe(() => {
        if (window.NirnayPath && window.NirnayPath.initTheme) {
            window.NirnayPath.initTheme();
        }
    });
}

