/**
 * NirnayPath Referral Controller
 * Isolated module — does NOT touch auth, test, or analytics flows.
 *
 * Responsibilities:
 *  1. Capture ?ref=CODE from URL on landing and persist in sessionStorage.
 *  2. After successful signup, claim the captured referral code via API.
 *  3. Load and render referral stats on the dashboard card.
 *  4. Wire Copy, WhatsApp, Telegram, and native share buttons.
 */

'use strict';

const ReferralController = (() => {

    // ── Constants ─────────────────────────────────────────────────────────────
    const STORAGE_KEY = 'np_pending_ref_code';
    const CARD_SELECTOR = '.referral-card';

    // Milestone table (mirrors XP_ACTIONS in xpService.js)
    const MILESTONES = [1, 5, 10, 25, 50];

    // ── Helpers ───────────────────────────────────────────────────────────────

    function getShareUrl(code) {
        return `${window.location.origin}/?ref=${encodeURIComponent(code)}`;
    }

    function getShareText(code) {
        return `🎓 Join NirnayPath — India's best bilingual mock test platform for UPSC, BPSC, SSC & more!\nUse my referral code *${code}* and get bonus XP on signup.\n👉 ${getShareUrl(code)}`;
    }

    function showToast(msg) {
        if (window.showToast) {
            window.showToast(msg, 'var(--primary)', '#fff');
        } else {
            console.log('[Referral] Toast:', msg);
        }
    }

    // ── Phase 5: Landing URL Capture ──────────────────────────────────────────

    function captureLandingCode() {
        try {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('ref');
            if (code && /^[A-Z0-9]{5,12}$/i.test(code)) {
                sessionStorage.setItem(STORAGE_KEY, code.toUpperCase());
                console.log('[Referral] Captured referral code from URL:', code.toUpperCase());
                // Clean URL without reloading
                const clean = new URL(window.location.href);
                clean.searchParams.delete('ref');
                window.history.replaceState({}, document.title, clean.toString());
            }
        } catch (e) {
            console.warn('[Referral] URL capture failed silently:', e.message);
        }
    }

    // ── Phase 5: Post-Signup Claim ────────────────────────────────────────────

    async function claimPendingReferral() {
        const code = sessionStorage.getItem(STORAGE_KEY);
        if (!code) return;

        try {
            const resp = await fetch('/api/growth/referral/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code })
            });

            if (resp.ok) {
                sessionStorage.removeItem(STORAGE_KEY);
                console.log('[Referral] Referral claimed successfully:', code);
                showToast('🎉 Referral bonus applied! You earned bonus XP.');
            } else {
                const body = await resp.json().catch(() => ({}));
                console.warn('[Referral] Claim failed:', body.error || resp.status);
                // Only remove if it was definitively rejected (not a transient 5xx)
                if (resp.status < 500) {
                    sessionStorage.removeItem(STORAGE_KEY);
                }
            }
        } catch (e) {
            console.warn('[Referral] Claim fetch failed silently:', e.message);
        }
    }

    // ── Phase 4: Stats Loading & Rendering ───────────────────────────────────

    async function loadStats() {
        const card = document.querySelector(CARD_SELECTOR);
        if (!card) return; // Dashboard not yet rendered

        try {
            const resp = await fetch('/api/growth/referral/stats', {
                credentials: 'include'
            });
            if (!resp.ok) {
                console.warn('[Referral] Stats fetch failed:', resp.status);
                return;
            }
            const data = await resp.json();
            renderCard(data);
        } catch (e) {
            console.warn('[Referral] Stats load failed silently:', e.message);
        }
    }

    function renderCard(data) {
        const {
            referralCode = '—',
            referralCount = 0,
            referralRank = '—',
            milestoneReached = 0,
            nextMilestone = 1,
            totalReferralXP = 0
        } = data;

        // Code value
        const codeEl = document.getElementById('ref-code-value');
        if (codeEl) codeEl.textContent = referralCode;

        // Stats
        const countEl = document.getElementById('ref-stat-count');
        if (countEl) countEl.textContent = referralCount;

        const xpEl = document.getElementById('ref-stat-xp');
        if (xpEl) xpEl.textContent = `${totalReferralXP} XP`;

        // Progress bar
        if (nextMilestone) {
            const base = milestoneReached;
            const pct = Math.min(100, Math.round(((referralCount - base) / (nextMilestone - base)) * 100));
            const fillEl = document.getElementById('ref-progress-fill');
            if (fillEl) fillEl.style.width = `${pct}%`;

            const milestoneLabel = document.getElementById('ref-progress-milestone');
            if (milestoneLabel) milestoneLabel.textContent = `Next Milestone: ${nextMilestone} Friends`;

            const pctLabel = document.getElementById('ref-progress-percent');
            if (pctLabel) pctLabel.textContent = `${referralCount}/${nextMilestone}`;
        } else {
            // All milestones reached
            const fillEl = document.getElementById('ref-progress-fill');
            if (fillEl) fillEl.style.width = '100%';

            const milestoneLabel = document.getElementById('ref-progress-milestone');
            if (milestoneLabel) milestoneLabel.textContent = '🏆 All Milestones Reached!';

            const pctLabel = document.getElementById('ref-progress-percent');
            if (pctLabel) pctLabel.textContent = `${referralCount} Friends`;
        }

        // Wire share buttons now that we have the code
        wireButtons(referralCode);
    }

    // ── Phase 4: Button Wiring ────────────────────────────────────────────────

    function wireButtons(code) {
        // Copy button
        const copyBtn = document.getElementById('ref-copy-btn');
        if (copyBtn && !copyBtn.dataset.wired) {
            copyBtn.dataset.wired = '1';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(code).then(() => {
                    showToast('📋 Referral code copied!');
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                    }, 2000);
                }).catch(() => {
                    // Fallback for browsers without clipboard API
                    const ta = document.createElement('textarea');
                    ta.value = code;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    showToast('📋 Referral code copied!');
                });
            });
        }

        // WhatsApp share
        const waBtn = document.getElementById('ref-share-wa');
        if (waBtn && !waBtn.dataset.wired) {
            waBtn.dataset.wired = '1';
            waBtn.addEventListener('click', () => {
                const text = encodeURIComponent(getShareText(code));
                window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
            });
        }

        // Telegram share
        const tgBtn = document.getElementById('ref-share-tg');
        if (tgBtn && !tgBtn.dataset.wired) {
            tgBtn.dataset.wired = '1';
            tgBtn.addEventListener('click', () => {
                const text = encodeURIComponent(getShareText(code));
                const url = encodeURIComponent(getShareUrl(code));
                window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
            });
        }

        // Native share (Web Share API)
        const nativeBtn = document.getElementById('ref-share-native');
        if (nativeBtn && !nativeBtn.dataset.wired) {
            nativeBtn.dataset.wired = '1';
            if (navigator.share) {
                nativeBtn.addEventListener('click', async () => {
                    try {
                        await navigator.share({
                            title: 'Join NirnayPath',
                            text: getShareText(code),
                            url: getShareUrl(code)
                        });
                    } catch (e) {
                        if (e.name !== 'AbortError') {
                            console.warn('[Referral] Native share failed:', e.message);
                        }
                    }
                });
            } else {
                // Hide native share button when API not available; other buttons remain
                nativeBtn.style.display = 'none';
            }
        }
    }

    // ── Phase 5: AppState Integration (signup hook without touching auth.js) ──

    function subscribeToAuthEvents() {
        if (!window.AppState) return;

        let previouslyLoggedIn = false;

        // AppState.subscribe receives the full state snapshot
        AppState.subscribe((state) => {
            const authState = state && state.auth;
            const isLoggedIn = !!(authState && authState.user);

            if (isLoggedIn && !previouslyLoggedIn) {
                // User just logged in or signed up — attempt claim if code is pending
                claimPendingReferral();
                // Load stats whenever user authenticates
                loadStats();
            }

            previouslyLoggedIn = isLoggedIn;
        });
    }

    // ── Public init ───────────────────────────────────────────────────────────

    function init() {
        // Always capture URL code first, before anything else
        captureLandingCode();

        // Subscribe to auth state changes for post-login/signup actions
        subscribeToAuthEvents();

        // If user is already authenticated on load, immediately load stats
        if (window.Auth && window.Auth.isLoggedIn()) {
            // Small defer to let dashboard DOM render
            setTimeout(loadStats, 800);
        }
    }

    return { init, loadStats };

})();

window.ReferralController = ReferralController;

// Register with AppLifecycle — runs after all other scripts have initialised
AppLifecycle.register(() => ReferralController.init());
