/**
 * NirnayPath Global Utilities & UI Stabilization
 */

window.NirnayPath = {
    /**
     * Centered Safe Fetch Wrapper
     */
    async safeFetch(url, options = {}, timeout = 15000) {
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
        // 1. Logo Click Reliability
        document.querySelectorAll(".logo").forEach(el => {
            el.style.cursor = 'pointer';
            el.onclick = () => window.location.href = "/index.html";
        });

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
    },

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            document.body.classList.remove('light-mode');
        }

        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = (localStorage.getItem('theme') === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            toggle.onclick = () => {
                const isDark = document.body.getAttribute('data-theme') === 'dark';
                if (isDark) {
                    document.body.removeAttribute('data-theme');
                    document.body.classList.add('light-mode');
                    localStorage.setItem('theme', 'light');
                    toggle.innerHTML = '<i class="fas fa-moon"></i>';
                } else {
                    document.body.setAttribute('data-theme', 'dark');
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
    }
};

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => window.NirnayPath.initGlobalUI());
