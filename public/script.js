/* ============================================================
   NirnayPath — Main Script v3.0
   ✅ Single DOMContentLoaded
   ✅ Proper view switching (dashboard shown on load)
   ✅ Fullscreen API integrated (not monkey-patched)
   ✅ Anti-cheat: right-click, F12, tab-switch detection
   ✅ Question slide animation
   ✅ Progress bar, option highlighting
   ✅ Timer with warning color
   ============================================================ */

'use strict';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. STATE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let currentExam = 'upsc';
let currentSubject = 'history';
let currentLanguage = 'en';
let currentFilter = 'All';
window.currentQuestionSet = [];
let timerInterval = null;
let tabSwitchCount = 0;
let acInstalled = false;

/* ── FORENSIC PATCH: one-time guard for module-level fullscreenchange ── */
let _fsListenersInstalled = false;

let _legacyTestState = {
    exam: 'upsc', subject: 'history', testName: '',
    answers: {}, marked: [], visited: [],
    timeLeft: 90 * 60, currentIdx: 0,
    isActive: false, selectedQuestions: [],
    mode: 'full', modeValue: null // 'full', 'drill', 'section'
};

Object.defineProperty(window, 'testState', {
    get: () => {
        if (window.AppState) return AppState._state.test;
        return _legacyTestState;
    },
    set: (val) => {
        if (window.AppState) AppState.dispatch('test', val);
        else _legacyTestState = val;
    }
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. CONSTANTS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const examSubjects = {
    upsc: ['history', 'geography', 'polity', 'economics', 'environment', 'science', 'physics', 'chemistry', 'current'],
    bpsc: ['history', 'geography', 'polity', 'economics', 'bihar', 'science', 'physics', 'chemistry', 'current'],
    bpsc_teacher: ['hindi', 'english', 'math', 'reasoning', 'social_science', 'science', 'physics', 'chemistry', 'current'],
    ssc: ['math', 'reasoning', 'english', 'general_awareness', 'science', 'physics', 'chemistry', 'current'],
    railway: ['math', 'reasoning', 'science', 'physics', 'chemistry', 'general_awareness', 'current'],
    banking: ['aptitude', 'reasoning', 'english', 'computerscience', 'economics', 'current'],
    police: ['general_awareness', 'reasoning', 'math', 'english', 'hindi', 'law', 'police_science', 'current'],
    daroga: ['general_awareness', 'reasoning', 'math', 'hindi', 'english', 'law', 'current'],
    army: ['general_awareness', 'reasoning', 'math', 'english', 'science', 'current']
};

const subjectNames = {
    geography: 'Geography', history: 'History', polity: 'Polity',
    economics: 'Economics', environment: 'Environment',
    science: 'Science', physics: 'Physics', chemistry: 'Chemistry',
    current: 'Current Affairs', bihar: 'Bihar GK', hindi: 'Hindi',
    english: 'English', math: 'Mathematics', reasoning: 'Reasoning',
    social_science: 'Social Science', general_awareness: 'General Awareness',
    aptitude: 'Quantitative Aptitude', computerscience: 'Computer Science',
    law: 'Law', police_science: 'Police Science'
};

const subjectIcons = {
    geography: 'fas fa-earth-asia', history: 'fas fa-landmark',
    polity: 'fas fa-scale-balanced', economics: 'fas fa-chart-line',
    environment: 'fas fa-leaf',
    science: 'fas fa-flask', physics: 'fas fa-atom',
    chemistry: 'fas fa-vial', current: 'fas fa-newspaper',
    bihar: 'fas fa-map-location-dot', hindi: 'fas fa-language',
    english: 'fas fa-language', math: 'fas fa-calculator',
    reasoning: 'fas fa-brain', social_science: 'fas fa-globe-americas',
    general_awareness: 'fas fa-bullhorn', aptitude: 'fas fa-calculator',
    computerscience: 'fas fa-laptop-code', law: 'fas fa-gavel',
    police_science: 'fas fa-shield-alt'
};

const examNames = {
    upsc: 'UPSC IAS', bpsc: 'BPSC Civil Services', bpsc_teacher: 'BPSC Teacher',
    ssc: 'SSC', railway: 'Railway', banking: 'Banking',
    police: 'Police', daroga: 'Daroga', army: 'Army'
};

/* DOM refs to view sections */
const VIEW = {};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2b. UI STATE MACHINE (Phase C — Centralized State Governance)
   Prevents invalid transitions. Enforces:
     HOME → TEST_LOADING → TEST_ACTIVE → RESULT_SCREEN
   Disallows: HOME → TEST_ACTIVE directly
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const UIStateMachine = {
    STATES: {
        HOME:             'HOME',
        TEST_LOADING:     'TEST_LOADING',
        PERMISSION_SCREEN:'PERMISSION_SCREEN',
        TEST_ACTIVE:      'TEST_ACTIVE',
        RESULT_SCREEN:    'RESULT_SCREEN',
        ERROR_SCREEN:     'ERROR_SCREEN'
    },

    /* Valid transitions — only these are allowed */
    TRANSITIONS: {
        HOME:              ['TEST_LOADING'],
        TEST_LOADING:      ['PERMISSION_SCREEN', 'HOME'],   // home=on error
        PERMISSION_SCREEN: ['TEST_ACTIVE', 'HOME'],
        TEST_ACTIVE:       ['RESULT_SCREEN', 'HOME'],       // home=abandon
        RESULT_SCREEN:     ['HOME'],
        ERROR_SCREEN:      ['HOME']
    },

    _current: 'HOME',

    current() { return this._current; },

    transition(next, context = '') {
        const allowed = this.TRANSITIONS[this._current] || [];
        if (!allowed.includes(next)) {
            console.error(
                `[UIStateMachine] INVALID TRANSITION: ${this._current} → ${next}` +
                (context ? ` (context: ${context})` : '')
            );
            return false;
        }
        console.info(`[UIStateMachine] ${this._current} → ${next}` + (context ? ` | ${context}` : ''));
        this._current = next;
        document.body.setAttribute('data-ui-state', next);
        return true;
    },

    /* Force-reset without validation (use only for boot/error recovery) */
    reset(state = 'HOME') {
        this._current = state;
        document.body.setAttribute('data-ui-state', state);
    }
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3. BOOT — SINGLE DOMContentLoaded
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
document.addEventListener('DOMContentLoaded', () => {

    // Guard: Prevent script.js from running on non-home pages
    if (!document.getElementById('dashboard')) {
        console.info('[NirnayPath] Non-home page detected. script.js execution halted.');
        return;
    }

    /* Cache views */
    VIEW.dashboard = document.getElementById('dashboard');
    VIEW.loading = document.getElementById('loading-screen');
    VIEW.engine = document.getElementById('exam-engine');
    VIEW.result = document.getElementById('result-screen');
    VIEW.userDashboard = document.getElementById('user-dashboard');
    VIEW['user-dashboard'] = VIEW.userDashboard; // case-insensitive safety fallback

    /* Inject CSS enhancements (scrollbar, animations, etc.) */
    injectDynamicCSS();

    // Detect if FontAwesome CSS and font files have loaded
    const checkFontAwesome = () => {
        const span = document.createElement('span');
        span.className = 'fa-solid fa-compass';
        span.style.display = 'none';
        document.body.appendChild(span);
        const loaded = document.fonts.check('12px "Font Awesome 6 Free"') || 
                       document.fonts.check('12px "Font Awesome 5 Free"') ||
                       (window.getComputedStyle(span).fontFamily.includes('Font Awesome'));
        document.body.removeChild(span);
        if (loaded) {
            document.body.classList.add('fa-loaded');
        }
    };
    checkFontAwesome();
    document.fonts.ready.then(checkFontAwesome);
    setTimeout(checkFontAwesome, 2000);

    /* Init modules */
    initTheme();

    initExamRibbon();
    initLanguageToggle();
    initFilterButtons();
    initStickyHeader();
    initBackToTop();
    initMobileMenu();

    const initDeferredModules = () => {
        initScrollAnimations();
        initFAQ();
        initTypingAnimation();
        initTipsSlider();
        initHeroSliders();
        makeInfiniteSlider('testimonial-slider', 4000);
        makeInfiniteSlider('trending-slider', 3000);
        animateCounters();
        initTrendingTestButtons();
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(initDeferredModules);
    } else {
        setTimeout(initDeferredModules, 200);
    }

    /* ✅ Always start on dashboard — subject panel hidden by default */
    UIStateMachine.reset('HOME');
    showView('dashboard');

    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'analytics') {
        if (Auth.isLoggedIn()) {
            Dashboard.show();
        } else {
            document.getElementById('loginBtn')?.click();
        }
    }
    const sectionParam = params.get('section');
    if (sectionParam) {
        setTimeout(() => {
            const target = document.getElementById(sectionParam);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    }

    /* Bind result screen buttons here since engine sections exist */
    bindExamControls();

    /* Try to resume an active test session */
    checkExistingTestSession();

    /* ✅ Phase 3: Logo Click Fix */
    document.addEventListener("click", function(e){
        if(e.target.closest(".logo")){
            window.location.href = "/index.html";
        }
    });
});

/* ============================================================
   4. VIEW MANAGER — guaranteed visibility control
   ============================================================ */

/* ── Phase 3: Centralized SPA Lifecycle Hooks ───────────────
   pageUnmount(viewId) — tears down all intervals, resets styles
   pageMount(viewId)   — deduplicates DOM IDs, re-binds hero
   ─────────────────────────────────────────────────────────── */

/** Track the currently active view for lifecycle purposes */
let _activeViewId = null;

/**
 * pageUnmount(viewId)
 * Called BEFORE the outgoing view is hidden.
 * Responsibilities:
 *   1. Stop all hero slider intervals stored in dataset.heroInterval
 *   2. Stop infinite-slider intervals stored in dataset.sliderInterval
 *   3. Reset stale CSS transforms / opacity leaks from slide animations
 *   4. Reset exam timer and body overflow
 *   5. Collapse stale overlays
 */
function pageUnmount(viewId) {
    if (window.logDiagnostic) window.logDiagnostic('pageUnmount:' + viewId);

    // 1. Tear down hero slider intervals (prevent stacking on re-navigation)
    document.querySelectorAll('[data-hero-interval]').forEach(el => {
        const id = Number(el.dataset.heroInterval);
        if (id) clearInterval(id);
        delete el.dataset.heroInterval;
        delete el.dataset.sliderInitialized;
    });

    // 2. Tear down infinite-slider intervals
    document.querySelectorAll('[data-slider-interval]').forEach(el => {
        const id = Number(el.dataset.sliderInterval);
        if (id) clearInterval(id);
        delete el.dataset.sliderInterval;
    });

    // 3. Reset stale opacity/transform from question slide animations
    const qArea = document.querySelector('.question-area');
    if (qArea) {
        qArea.style.opacity = '1';
        qArea.style.transform = 'none';
        qArea.style.transition = 'none';
        qArea.style.display = '';
    }

    // 4. Exam timer + body overflow reset
    clearInterval(timerInterval);
    timerInterval = null;
    document.body.style.pointerEvents = 'auto';
    document.body.style.overflow = '';

    // 5. Collapse stale overlays and banners
    document.querySelectorAll('.cbt-overlay').forEach(el => el.classList.remove('active'));
    removeFsWarningBanner();

    // 6. Ensure mobile navigation panel and overlay are closed on view transitions
    const navPanel = document.getElementById('mobileNavPanel');
    const panelOverlay = document.getElementById('panelOverlay');
    if (navPanel) navPanel.classList.remove('open');
    if (panelOverlay) panelOverlay.classList.remove('active');
}

/**
 * pageMount(viewId)
 * Called AFTER the incoming view becomes visible.
 * Responsibilities:
 *   1. DOM deduplication — purge duplicate element IDs inside the mounting view
 *   2. Re-initialize hero sliders if mounting the dashboard (they were cleared by pageUnmount)
 */
function pageMount(viewId) {
    if (window.logDiagnostic) window.logDiagnostic('pageMount:' + viewId);

    // 1. DOM deduplication guard — remove any elements with duplicate IDs
    //    This catches re-render artifacts from rapid multi-click navigation.
    const idMap = {};
    document.querySelectorAll('[id]').forEach(el => {
        const id = el.id;
        if (!id) return;
        if (idMap[id]) {
            // A duplicate exists — remove the LATER duplicate
            if (window.logDiagnostic) window.logDiagnostic('pageMount:dedup:' + id);
            el.remove();
        } else {
            idMap[id] = true;
        }
    });

    // 2. Re-initialize hero sliders on dashboard mount
    //    (they were torn down by pageUnmount to prevent interval stacking)
    if (viewId === 'dashboard' && typeof initHeroSliders === 'function') {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(initHeroSliders);
        } else {
            setTimeout(initHeroSliders, 100);
        }
    }

    _activeViewId = viewId;
}

/**
 * LEGACY COMPAT — cleanupActiveView()
 * Retained for any call sites not yet migrated to pageUnmount.
 * Now delegates directly to pageUnmount to avoid duplicated logic.
 */
function cleanupActiveView() {
    pageUnmount(_activeViewId || 'unknown');
}

function showView(id) {
    if (window.logDiagnostic) window.logDiagnostic('showView:' + id);

    if (window.AsyncManager) AsyncManager.cancelAll();
    if (window.AppState) AppState.dispatch('ui', { currentView: id });

    // ── Phase 3: Centralized lifecycle — unmount outgoing view
    pageUnmount(_activeViewId || 'unknown');

    /* Hard-hide EVERY view unconditionally */
    Object.values(VIEW).forEach(v => {
        if (v) {
            v.style.display = 'none';
            v.classList.remove('active');
        }
    });

    /* Show only the target view */
    const target = VIEW[id];
    if (target) {
        target.style.display = id === 'dashboard' ? 'block' : 'flex';
        target.classList.add('active');
    }

    /* Reset dashboard sub-sections when returning home */
    if (id === 'dashboard') {
        const subArea = document.getElementById('subject-selection-area');
        const testSel = document.getElementById('testSelection');
        if (subArea) subArea.style.display = 'none';
        if (testSel) testSel.classList.remove('show');
        document.querySelectorAll('.exam-btn').forEach(b => b.classList.remove('active-exam'));
    }

    /* Body state — controls header/footer visibility */
    document.body.setAttribute('data-view', id);

    if (id === 'engine') {
        document.body.classList.add('test-mode');
        installAntiCheat();
    } else {
        document.body.classList.remove('test-mode');
        exitFullscreen();
        uninstallAntiCheat();
        removeFsWarningBanner();
    }

    /* Scroll to top for non-exam pages */
    if (id !== 'engine') window.scrollTo({ top: 0, behavior: 'smooth' });

    // ── Phase 3: Centralized lifecycle — mount incoming view
    pageMount(id);
}

/* ============================================================ 
   4b. NEW PRACTICE MODES (Topic Drills & Sectional Tests)
   ============================================================ */
function switchPracticeMode(mode) {
    const grid = document.getElementById('subject-grid');
    const topicArea = document.getElementById('topic-selection-area');
    const toggles = document.querySelectorAll('.mode-toggle-btn');
    const testSel = document.getElementById('testSelection');
    
    toggles.forEach(btn => {
        btn.classList.toggle('active', (mode === 'full' && btn.innerText.includes('Full')) || (mode === 'drill' && btn.innerText.includes('Topic')));
    });

    if (mode === 'full') {
        grid.style.display = 'grid';
        topicArea.style.display = 'none';
        if (testSel) testSel.style.display = 'block';
    } else {
        grid.style.display = 'none';
        topicArea.style.display = 'block';
        if (testSel) testSel.style.display = 'none';
        TopicDrills.loadTopics(currentSubject);
    }
}

const TopicDrills = {
    async loadTopics(subject) {
        const container = document.getElementById('topic-chips-container');
        const nameEl = document.getElementById('drill-subject-name');
        if (!container) return;
        
        nameEl.textContent = subjectNames[subject] || subject.toUpperCase();
        container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading topics...</div>';
        
        try {
            const res = await fetch(`/api/subject/${subject}/topics`);
            const topics = await res.json();
            
            container.innerHTML = '';
            if (topics.length === 0) {
                container.innerHTML = '<p>No topics found for this subject yet.</p>';
                return;
            }
            
            topics.forEach(topic => {
                const chip = document.createElement('div');
                chip.className = 'topic-chip hover-lift';
                chip.innerHTML = `<span>${topic}</span>`;
                chip.onclick = () => this.startDrill(subject, topic);
                container.appendChild(chip);
            });
        } catch (error) {
            console.error('Error loading topics:', error);
            container.innerHTML = '<p>Failed to load topics.</p>';
        }
    },

    async startDrill(subject, topic) {
        if (!Auth.isLoggedIn()) {
            window.showToast('Please login to start practice.', 'var(--danger)');
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }
        
        document.documentElement.requestFullscreen().catch(() => {});

        showView('loading');
        try {
            const res = await fetch(`/api/drill/${subject}/${topic}?count=20`, {
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
            });
            const questions = await res.json();
            
            if (!res.ok) throw new Error(questions.error || 'Failed to load drill');

            const normalized = questions.map(q => ({
                ...q,
                question: L.q(q),
                options: L.opt(q),
                explanation: L.exp(q) || 'No explanation provided.'
            }));

            testState = {
                exam: currentExam, subject, testName: `Topic Drill: ${topic}`,
                answers: {}, marked: [], visited: [0],
                timeLeft: 20 * 60, currentIdx: 0,
                isActive: true, selectedQuestions: normalized,
                mode: 'drill', modeValue: topic
            };
            
            saveProgress();
            launchExam();
        } catch (error) {
            alert(error.message);
            showView('dashboard');
        }
    }
};

const SectionalTests = {
    sections: [
        { name: "Quantitative Aptitude", icon: "fa-calculator", desc: "Mathematics & Mental Ability" },
        { name: "General Studies", icon: "fa-landmark", desc: "History, Geography, Polity, Science" },
        { name: "Reasoning", icon: "fa-brain", desc: "Logical & Analytical Reasoning" },
        { name: "English Language", icon: "fa-language", desc: "Grammar, Vocab & Comprehension" },
        { name: "Current Affairs", icon: "fa-newspaper", desc: "Daily News & Events Analysis" }
    ],

    openModal() {
        if (!Auth.isLoggedIn()) {
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }
        const modal = document.getElementById('sectionalModal');
        const grid = document.getElementById('sections-grid');
        modal.style.display = 'flex';
        
        grid.innerHTML = '';
        this.sections.forEach(sec => {
            const card = document.createElement('div');
            card.className = 'section-card hover-lift';
            card.innerHTML = `
                <i class="fas ${sec.icon}"></i>
                <h4>${sec.name}</h4>
                <p>${sec.desc}</p>
            `;
            card.onclick = () => this.startSection(sec.name);
            grid.appendChild(card);
        });
    },

    closeModal() {
        document.getElementById('sectionalModal').style.display = 'none';
    },

    async startSection(sectionName) {
        this.closeModal();
        
        document.documentElement.requestFullscreen().catch(() => {});
        showView('loading');
        
        try {
            const res = await fetch(`/api/section/${encodeURIComponent(sectionName)}?count=75`, {
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Failed to load section');

            const normalized = data.questions.map(q => ({
                ...q,
                question: L.q(q),
                options: L.opt(q),
                explanation: L.exp(q) || 'No explanation provided.'
            }));

            testState = {
                exam: 'sectional', subject: 'all', testName: `Sectional: ${sectionName}`,
                answers: {}, marked: [], visited: [0],
                timeLeft: Math.round(data.timeLimit * 60), currentIdx: 0,
                isActive: true, selectedQuestions: normalized,
                mode: 'section', modeValue: sectionName
            };
            
            saveProgress();
            launchExam();
        } catch (error) {
            alert(error.message);
            showView('dashboard');
        }
    }
};

/* ============================================================ 
   5. THEME
   ============================================================ */
function initTheme() {
    if (window.NirnayPath && typeof window.NirnayPath.initTheme === 'function') {
        // Delegate to unified utility implementation
        return;
    }
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.body.classList.remove('light-mode');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.removeAttribute('data-theme');
        document.body.classList.add('light-mode');
        toggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    toggle.onclick = () => {
        const dark = document.body.getAttribute('data-theme') === 'dark';
        if (dark) {
            document.body.removeAttribute('data-theme');
            document.body.classList.add('light-mode');
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            document.body.classList.remove('light-mode');
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
    };
}

/* ============================================================ 
   7. EXAM RIBBON
   ============================================================ */
function initExamRibbon() {
    document.querySelectorAll('.exam-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveExam(btn.dataset.exam);
            /* Show the subject selection area on ribbon click */
            const area = document.getElementById('subject-selection-area');
            if (area) {
                area.style.display = 'block';
                area.classList.add('active');
                setTimeout(() => area.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
            }
        });
    });
}

function setActiveExam(exam) {
    currentExam = exam;
    document.querySelectorAll('.exam-btn').forEach(b => b.classList.remove('active-exam'));
    document.querySelector(`.exam-btn[data-exam="${exam}"]`)?.classList.add('active-exam');
    const nameEl = document.getElementById('current-exam-name');
    if (nameEl) nameEl.textContent = examNames[exam] || exam.toUpperCase();
    renderSubjectCards(exam);
    /* Close test selection panel when switching exams */
    document.getElementById('testSelection')?.classList.remove('show');
}

/* ============================================================ 
   8. LANGUAGE
   ============================================================ */
function initLanguageToggle() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active-lang'));
    document.querySelector(`.lang-btn[data-lang="${lang}"]`)?.classList.add('active-lang');
    
    // ✅ Phase 4: Toggle UI rendering without refetching
    if (testState.isActive && testState.selectedQuestions.length) {
        renderQuestion();
    }
    
    // Also update review screen if visible
    if (document.getElementById('result-screen')?.classList.contains('active')) {
        buildReview();
    }
}

/* ============================================================ 
   9. BILINGUAL HELPERS
   ============================================================ */
const L = {
    q: q => {
        const text = currentLanguage === 'hi' ? (q.question_hi || q.question_en || q.question) : (q.question_en || q.question);
        const resolved = typeof text === 'object' ? (text[currentLanguage] || text.en || text.hi || '') : text;
        return String(resolved).replace(/\s*\[V\d+\]\s*/gi, ' ').trim();
    },
    opt: q => {
        const opts = currentLanguage === 'hi' ? (q.options_hi || q.options_en || q.options) : (q.options_en || q.options);
        if (Array.isArray(opts) && opts.length > 0 && typeof opts[0] === 'object') {
            return opts.map(o => o.text ? (o.text[currentLanguage] || o.text.en || o.text.hi) : (o[currentLanguage] || o.en || o.hi || o));
        }
        return opts;
    },
    exp: q => {
        const text = currentLanguage === 'hi' ? (q.explanation_hi || q.explanation_en || q.explanation) : (q.explanation_en || q.explanation);
        return typeof text === 'object' ? (text[currentLanguage] || text.en || text.hi || '') : text;
    }
};

/* ============================================================ 
   10. SUBJECT CARDS
   ============================================================ */
function renderSubjectCards(exam) {
    const grid = document.getElementById('subject-grid');
    if (!grid) return;
    const subjects = examSubjects[exam] || [];
    grid.innerHTML = subjects.length ? '' : '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);">No subjects available yet.</p>';

    subjects.forEach(key => {
        const name = subjectNames[key] || key.replace('_', ' ').toUpperCase();
        const icon = subjectIcons[key] || 'fas fa-book';
        const card = document.createElement('div');
        card.className = 'subject-card reveal';
        card.dataset.subject = key;
        card.innerHTML = `<i class="${icon}"></i><span>${name}</span>`;
        card.addEventListener('click', () => onSubjectClick(card, key, name));
        grid.appendChild(card);
    });

    /* Re-trigger scroll reveal for freshly injected cards */
    document.querySelectorAll('.subject-card.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('active');
    });
}

function onSubjectClick(card, key, name) {
    document.querySelectorAll('.subject-card').forEach(c => c.classList.remove('active-subject'));
    card.classList.add('active-subject');
    currentSubject = key;

    /* Update test panel heading */
    const sel = document.getElementById('testSelection');
    const heading = sel?.querySelector('.test-header-left h3');
    if (heading) heading.innerHTML = `<i class="fas fa-vial"></i> Mock Tests · <span class="subject-highlight">${name}</span>`;

    /* Show test selection panel */
    if (sel) {
        sel.classList.remove('show');
        requestAnimationFrame(() => {
            sel.classList.add('show');
            setTimeout(() => sel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 350);
        });
    }
    renderTestGrid();
}

/* ============================================================ 
   11. TEST GRID
   ============================================================ */
function renderTestGrid() {
    const grid = document.getElementById('testGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const DIFFS = ['Easy', 'Medium', 'Hard'];
    const QCNTS = [30, 50, 75, 100];
    const TIMES = [30, 45, 60, 90];
    const ICONS = ['fa-brain', 'fa-clock', 'fa-chart-line', 'fa-trophy', 'fa-graduation-cap', 'fa-award'];

    let shown = 0;
    for (let i = 1; i <= 30; i++) {
        const diff = DIFFS[i % 3];
        if (currentFilter !== 'All' && diff !== currentFilter) continue;
        const q = QCNTS[i % 4], t = TIMES[i % 4], icon = ICONS[i % 6];
        const isNew = i <= 5, isHot = i % 7 === 0;
        const badge = isNew ? '<span class="test-card-badge">New</span>' :
            isHot ? '<span class="test-card-badge" style="background:linear-gradient(135deg,#F97316,#EC4899)">Hot</span>' : '';
        const diffClass = { Easy: 'difficulty-easy', Medium: 'difficulty-medium', Hard: 'difficulty-hard' }[diff];

        const card = document.createElement('div');
        card.className = 'test-card';
        card.innerHTML = `
          <div class="test-card-header">
            <div class="test-card-icon"><i class="fas ${icon}"></i></div>${badge}
          </div>
          <h3 class="test-card-title">Mock Test ${i}</h3>
          <p class="test-card-subtitle">Full-length ${subjectNames[currentSubject] || ''} practice test for ${examNames[currentExam]} exam.</p>
          <div class="test-card-stats">
            <div class="test-stat"><i class="fas fa-question-circle"></i><span>${q} Questions</span></div>
            <div class="test-stat"><i class="fas fa-clock"></i><span>${t} mins</span></div>
            <div class="test-stat"><i class="fas fa-chart-bar"></i><span>Analytics</span></div>
          </div>
          <div class="test-card-footer">
            <span class="test-difficulty ${diffClass}"><i class="fas fa-signal"></i> ${diff}</span>
            <button class="test-start-btn"><i class="fas fa-play-circle"></i> Start Test</button>
          </div>`;
        const go = () => startTest(`Mock Test ${i}`, currentSubject, q, t);
        card.querySelector('.test-start-btn').addEventListener('click', e => { e.stopPropagation(); go(); });
        card.addEventListener('click', go);
        grid.appendChild(card);
        shown++;
    }

    if (!shown) {
        grid.innerHTML = `<div class="no-tests-message">
          <i class="fas fa-filter"></i><h3>No ${currentFilter} tests</h3><p>Try a different filter.</p>
          <button class="reset-filter-btn" onclick="setFilter('All')">Show All</button></div>`;
    }
}

/* ============================================================ 
   12. FILTERS
   ============================================================ */
function initFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.textContent.trim()));
    });
}
function setFilter(f) {
    currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === f));
    renderTestGrid();
}

/* ============================================================ 
   13. START TEST
   ============================================================ */
let _isStartingTest = false;
async function startTest(testName, subject, questionCount = 100, timeLimit = 90) {
    if (_isStartingTest) {
        console.warn('[NirnayPath] Race condition prevented: startTest already in progress.');
        return;
    }
    _isStartingTest = true;

    if (window.logDiagnostic) window.logDiagnostic('startTest');
    if (!Auth.isLoggedIn()) {
        alert('Please login to start the mock test.');
        document.getElementById('loginModal').style.display = 'flex';
        _isStartingTest = false;
        return;
    }

    // ── STATE MACHINE: HOME → TEST_LOADING
    if (!UIStateMachine.transition('TEST_LOADING', `startTest(${testName})`)) {
        // Already in a test — reset to HOME first to recover
        UIStateMachine.reset('HOME');
        UIStateMachine.transition('TEST_LOADING', `startTest(${testName}) [recovered]`);
    }

    document.documentElement.requestFullscreen().catch(() => {});

    console.log(`[NirnayPath] Starting test: ${testName} for subject: ${subject}`);
    showView('loading');
    try {
        const res = await fetch('/api/test/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify({
                subject: subject,
                count: questionCount,
                timeLimit: timeLimit * 60,
                exam: currentExam
            })
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to initialize test session.');
        }

        const data = await res.json();
        const { sessionId, questions } = data;

        if (!questions || !questions.length) {
            throw new Error('Question bank is empty.');
        }

        // ✅ Phase 4: Store full question set globally
        window.currentQuestionSet = questions;

        const normalized = questions.map(q => ({
            ...q,
            question: L.q(q),
            options: L.opt(q),
            explanation: L.exp(q) || 'No explanation provided.'
        }));

        testState = {
            exam: currentExam, subject, testName,
            answers: {}, marked: [], visited: [0],
            timeLeft: timeLimit * 60, currentIdx: 0,
            isActive: true, selectedQuestions: normalized,
            sessionId: sessionId,
            mode: 'full', modeValue: null
        };

        saveProgress();

        // Phase 10A: Redirect to Secure CBT Terminal
        // State: TEST_LOADING stays until test.html takes over via cbt-active-session
        window.location.href = '/test.html';
    } catch (err) {
        console.error('[NirnayPath] Test load error:', err);
        alert(`Could not load test.\n\n${err.message}`);
        UIStateMachine.reset('HOME');
        showView('dashboard');
    } finally {
        _isStartingTest = false;
    }
}

/* ============================================================ 
   14. LAUNCH EXAM ENGINE
   ============================================================ */
function launchExam() {
    // ── STATE MACHINE: TEST_LOADING → TEST_ACTIVE (drill / sectional modes)
    if (UIStateMachine.current() !== 'TEST_LOADING') {
        // Could be a resume from checkExistingTestSession — allow it
        UIStateMachine.reset('TEST_LOADING');
    }
    UIStateMachine.transition('TEST_ACTIVE', 'launchExam');

    const total = testState.selectedQuestions.length;
    const subName = subjectNames[testState.subject] || testState.subject;

    /* Header title */
    const titleEl = document.getElementById('exam-title');
    if (titleEl) titleEl.textContent = `${examNames[testState.exam] || testState.exam} · ${subName}`;

    /* Update totals */
    setEl('q-total', total);
    setEl('progress-total', total);

    /* Candidate name / avatar */
    // BUG-01 FIX: auth.js writes to 'np_user_data' (JSON), not 'nirnaypath_user'.
    // Previously, this block never ran because nirnaypath_user was always null.
    const _npUserScript = (() => { try { return JSON.parse(localStorage.getItem('np_user_data') || '{}'); } catch(e) { return {}; } })();
    const _candName = _npUserScript.name || '';
    if (_candName) {
        setEl('cand-name', _candName);
        const av = document.getElementById('user-avatar');
        if (av) {
            av.src = `https://ui-avatars.com/api/?background=1B3A6B&color=fff&bold=true&name=${encodeURIComponent(_candName)}`;
            // ✅ Phase 6: ui-avatars fallback
            av.onerror = () => { 
                av.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(_candName)}&background=random`; 
            };
        }
    }

    renderPalette();
    renderQuestion();
    startTimer();
    showView('engine');
}

/* ============================================================ 
   15. RENDER QUESTION
   ============================================================ */
function renderQuestion(dir = 'next') {
    // 1. Get frozen snapshot
    const stateSnapshot = window.AppState ? AppState.getState().test : testState;
    const qData = stateSnapshot.selectedQuestions[stateSnapshot.currentIdx];
    if (!qData) return;

    // Mutate state deterministically
    const visited = new Set(testState.visited);
    visited.add(testState.currentIdx);
    testState.visited = Array.from(visited);

    // 2. Build ViewModel
    const viewModel = Object.freeze({
        dir,
        qNumber: stateSnapshot.currentIdx + 1,
        qText: L.q(qData) || qData.question || '(Question text unavailable)',
        opts: L.opt(qData) || qData.options || [],
        savedAns: stateSnapshot.answers[stateSnapshot.currentIdx]
    });

    // 3. Render Atomic
    const execDOM = () => {
        slideIn(viewModel.dir);
        setEl('q-no', viewModel.qNumber);
        setEl('q-text', viewModel.qText);

        const optContainer = document.getElementById('options-container');
        if (!optContainer) return;
        optContainer.innerHTML = '';

        if (Array.isArray(viewModel.opts) && viewModel.opts.length) {
            viewModel.opts.forEach((text, idx) => {
                const row = document.createElement('div');
                row.className = 'option-row';
                if (viewModel.savedAns === idx) row.classList.add('selected');

                const radio = document.createElement('input');
                radio.type = 'radio'; radio.name = 'q_opt'; radio.value = idx;
                radio.id = `opt_${idx}`;
                if (viewModel.savedAns === idx) radio.checked = true;

                const label = document.createElement('label');
                label.htmlFor = `opt_${idx}`;
                label.textContent = text;

                row.appendChild(radio);
                row.appendChild(label);
                row.addEventListener('click', () => {
                    document.querySelectorAll('.option-row').forEach(r => r.classList.remove('selected'));
                    row.classList.add('selected');
                    radio.checked = true;
                });
                optContainer.appendChild(row);
            });
        } else {
            optContainer.innerHTML = '<p style="color:var(--danger);padding:12px">Options could not be loaded for this question.</p>';
        }

        updateProgressBar();
        updatePaletteClasses();
        updateStats();
    };
    if (window.RenderController) RenderController.commit(execDOM);
    else execDOM();
}

/* ============================================================ 
   16. PROGRESS BAR
   ============================================================ */
function updateProgressBar() {
    const stateSnapshot = window.AppState ? AppState.getState().test : testState;
    const total = stateSnapshot.selectedQuestions.length;
    const answered = Object.keys(stateSnapshot.answers).length;
    
    const viewModel = Object.freeze({
        total,
        answered,
        pct: total ? ((answered / total) * 100) : 0
    });

    const execDOM = () => {
        const fill = document.getElementById('progress-fill');
        if (fill) fill.style.width = `${viewModel.pct}%`;
        setEl('progress-text', viewModel.answered);
    };
    if (window.RenderController) RenderController.commit(execDOM);
    else execDOM();
}

/* ============================================================ 
   17. PALETTE
   ============================================================ */
function renderPalette() {
    const stateSnapshot = window.AppState ? AppState.getState().test : testState;
    const viewModel = Object.freeze({
        questionsCount: stateSnapshot.selectedQuestions.length,
        currentIdx: stateSnapshot.currentIdx
    });

    const execDOM = () => {
        const grid = document.getElementById('palette-grid');
        if (!grid) return;
        grid.innerHTML = '';
        for (let idx = 0; idx < viewModel.questionsCount; idx++) {
            const btn = document.createElement('button');
            btn.id = `pal-${idx}`;
            btn.className = 'p-btn';
            btn.textContent = idx + 1;
            btn.title = `Go to Q${idx + 1}`;
            btn.addEventListener('click', () => {
                saveCurrentAnswer();
                const currentIdx = window.AppState ? AppState._state.test.currentIdx : testState.currentIdx;
                const dir = idx > currentIdx ? 'next' : 'prev';
                testState.currentIdx = idx;
                renderQuestion(dir);
                saveProgress();
            });
            grid.appendChild(btn);
        }
        updatePaletteClasses();
    };
    if (window.RenderController) RenderController.commit(execDOM);
    else execDOM();
}

function updatePaletteClasses() {
    const stateSnapshot = window.AppState ? AppState.getState().test : testState;
    const viewModel = Object.freeze({
        questionsCount: stateSnapshot.selectedQuestions.length,
        visited: stateSnapshot.visited || [],
        answers: stateSnapshot.answers || {},
        marked: stateSnapshot.marked || [],
        currentIdx: stateSnapshot.currentIdx
    });

    const execDOM = () => {
        for (let idx = 0; idx < viewModel.questionsCount; idx++) {
            const btn = document.getElementById(`pal-${idx}`);
            if (!btn) continue;
            
            const visited = viewModel.visited.includes(idx);
            const answered = viewModel.answers[idx] !== undefined;
            const marked = viewModel.marked.includes(idx);
            
            btn.className = 'p-btn';
            btn.innerHTML = idx + 1;

            if (!visited) btn.classList.add('not-visited');
            else if (answered && marked) { btn.classList.add('answered-marked'); btn.innerHTML = `${idx + 1}<div class="green-dot"></div>`; }
            else if (answered) btn.classList.add('answered');
            else if (marked) btn.classList.add('marked');
            else btn.classList.add('not-answered');
            if (idx === viewModel.currentIdx) btn.classList.add('current');
        }
    };
    if (window.RenderController) RenderController.commit(execDOM);
    else execDOM();
}

function updateStats() {
    const stateSnapshot = window.AppState ? AppState.getState().test : testState;
    let answered = 0, notAnswered = 0, marked = 0, ansMarked = 0, notVisited = 0;
    
    stateSnapshot.selectedQuestions.forEach((_, i) => {
        const isVisited = stateSnapshot.visited && stateSnapshot.visited.includes(i);
        const hasAnswer = stateSnapshot.answers && stateSnapshot.answers[i] !== undefined;
        const isMarked = stateSnapshot.marked && stateSnapshot.marked.includes(i);

        if (!isVisited) notVisited++;
        else if (hasAnswer) {
            if (isMarked) ansMarked++; else answered++;
        } else {
            if (isMarked) marked++; else notAnswered++;
        }
    });

    const viewModel = Object.freeze({ answered, notAnswered, marked, ansMarked, notVisited });

    const execDOM = () => {
        setEl('c-answered', viewModel.answered);
        setEl('c-not-answered', viewModel.notAnswered);
        setEl('c-marked', viewModel.marked);
        setEl('c-answered-marked', viewModel.ansMarked);
        setEl('c-not-visited', viewModel.notVisited);
    };
    if (window.RenderController) RenderController.commit(execDOM);
    else execDOM();
}

function saveCurrentAnswer() {
    const sel = document.querySelector('input[name="q_opt"]:checked');
    if (sel) testState.answers[testState.currentIdx] = parseInt(sel.value);
}

/* ============================================================ 
   18. EXAM CONTROLS (bound once after DOMContentLoaded)
   ============================================================ */
function bindExamControls() {
    /* Save & Next */
    on('btn-next', 'click', () => {
        saveCurrentAnswer();
        testState.marked = testState.marked.filter(x => x !== testState.currentIdx);
        if (testState.currentIdx < testState.selectedQuestions.length - 1) testState.currentIdx++;
        saveProgress(); renderQuestion('next');
    });

    /* Previous */
    on('btn-prev', 'click', () => {
        saveCurrentAnswer();
        if (testState.currentIdx > 0) testState.currentIdx--;
        saveProgress(); renderQuestion('prev');
    });

    /* Mark for Review & Next */
    on('btn-mark', 'click', () => {
        saveCurrentAnswer();
        if (!testState.marked.includes(testState.currentIdx)) testState.marked.push(testState.currentIdx);
        if (testState.currentIdx < testState.selectedQuestions.length - 1) testState.currentIdx++;
        saveProgress(); renderQuestion('next');
    });

    /* Clear Response */
    on('btn-clear', 'click', () => {
        delete testState.answers[testState.currentIdx];
        document.querySelectorAll('input[name="q_opt"]').forEach(r => r.checked = false);
        document.querySelectorAll('.option-row').forEach(r => r.classList.remove('selected'));
        saveProgress(); updateProgressBar(); updatePaletteClasses(); updateStats();
    });

    /* Submit (sidebar) */
    on('btn-submit', 'click', () => confirmSubmit());

    /* Submit (header) */
    on('btn-header-submit', 'click', () => confirmSubmit());

    /* Submit Modal Cancel */
    on('submit-modal-cancel', 'click', () => {
        const modal = document.getElementById('submit-confirm-modal');
        if (modal) modal.style.display = 'none';
    });

    /* Submit Modal Confirm */
    on('submit-modal-confirm', 'click', () => {
        const modal = document.getElementById('submit-confirm-modal');
        if (modal) modal.style.display = 'none';
        submitTest();
    });

    /* Review & Home */
    on('btn-review', 'click', () => {
        const rc = document.getElementById('review-container');
        if (rc) rc.style.display = rc.style.display === 'none' ? 'block' : 'none';
    });
    on('btn-home', 'click', () => {
        testState = { answers: {}, marked: [], visited: [], isActive: false, selectedQuestions: [] };
        localStorage.removeItem('mockTestState');
        // ── STATE MACHINE: RESULT_SCREEN → HOME
        UIStateMachine.reset('HOME');
        showView('dashboard');
    });
}

function confirmSubmit() {
    const total = testState.selectedQuestions.length;
    const answered = Object.keys(testState.answers).length;
    const unanswered = total - answered;
    const marked = testState.marked.length;
    
    // Populate stats inside modal
    const statsEl = document.getElementById('submit-modal-stats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Total Questions:</span>
                <strong>${total}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Answered:</span>
                <strong style="color: var(--success);">${answered}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Unanswered:</span>
                <strong style="color: ${unanswered > 0 ? 'var(--danger)' : 'var(--success)'};">${unanswered}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Marked for Review:</span>
                <strong style="color: var(--warning);">${marked}</strong>
            </div>
        `;
    }
    
    const modal = document.getElementById('submit-confirm-modal');
    if (modal) modal.style.display = 'flex';
}

/* Wire static trending test buttons in HTML */
function initTrendingTestButtons() {
    document.addEventListener('click', e => {
        const btn = e.target.closest('.trend-start-btn');
        if (!btn) return;
        
        e.stopPropagation();
        const exam = btn.dataset.exam;
        const subject = btn.dataset.subject;
        const qCount = parseInt(btn.dataset.questions || '100');
        const tLimit = parseInt(btn.dataset.time || '90');
        if (exam) currentExam = exam;
        if (subject) currentSubject = subject;
        startTest(`${btn.closest('.trend-card')?.querySelector('h3')?.textContent || 'Mock Test'}`, subject, qCount, tLimit);
    });
}

/* ============================================================ 
   19. TIMER
   ============================================================ */
function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        if (testState.timeLeft <= 0) { 
            clearInterval(timerInterval); 
            submitTest(); 
            return; 
        }
        testState.timeLeft--;
        updateTimerDisplay();
        const el = document.getElementById('countdown');
        if (el) el.classList.toggle('warning', testState.timeLeft <= 300);
        if (testState.timeLeft % 30 === 0) saveProgress();
    }, 1000);
}

function updateTimerDisplay() {
    const stateSnapshot = window.AppState ? AppState.getState().test : testState;
    const viewModel = Object.freeze({
        timeLeft: stateSnapshot.timeLeft
    });

    const execDOM = () => {
        const m = Math.floor(viewModel.timeLeft / 60).toString().padStart(2, '0');
        const s = (viewModel.timeLeft % 60).toString().padStart(2, '0');
        setEl('countdown', `${m}:${s}`);
    };
    if (window.RenderController) RenderController.commit(execDOM);
    else execDOM();
}

/* ============================================================ 
   20. SUBMIT & RESULT
   ============================================================ */
let _cachedServerAnswers = null;

async function submitTest() {
    if (window.AppState) {
        if (AppState.getState().test.status === 'submitting') return; // Prevent double submission
        AppState.dispatch('test', { status: 'submitting' });
    }

    clearInterval(timerInterval);
    saveCurrentAnswer();
    testState.isActive = false;
    saveProgress();

    // Disable header submit and main submit buttons
    const headerSubmit = document.getElementById('btn-header-submit');
    const mainSubmit = document.getElementById('btn-submit');
    if (headerSubmit) headerSubmit.disabled = true;
    if (mainSubmit) mainSubmit.disabled = true;

    // Show loading state
    showView('loading');
    const loadingText = document.querySelector('#loading-screen h3');
    const loadingSubText = document.querySelector('#loading-screen p');
    if (loadingText) loadingText.textContent = 'Submitting your Test...';
    if (loadingSubText) loadingSubText.textContent = 'Please wait, saving your responses securely...';

    const total = testState.selectedQuestions.length;
    const resultsData = {
        sessionId: testState.sessionId,
        exam: testState.exam,
        subject: testState.subject,
        testName: testState.testName,
        score: 0, // placeholder, server recalculates
        totalQuestions: total,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        accuracy: 0.0,
        answers: testState.selectedQuestions.map((q, i) => ({
            questionId: q._id || q.id || `q-${i}`,
            userAnswer: testState.answers[i] !== undefined ? String(testState.answers[i]) : null,
            correctAnswer: String(q.correctAnswer || ''),
            topic: q.topic || 'General',
            explanation_en: q.explanation_en || q.explanation,
            explanation_hi: q.explanation_hi || q.explanation
        })),
        mode: testState.mode || 'full',
        modeValue: testState.modeValue || null
    };

    try {
        const token = Auth.getToken();
        const res = await fetch('/api/test/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(resultsData)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Submission failed');

        const resultId = data.resultId;

        // Fetch finalized server-computed result
        const resultRes = await fetch(`/api/user/result/${resultId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const serverResult = await resultRes.json();
        if (!resultRes.ok) throw new Error(serverResult.error || 'Failed to fetch result');

        // Populate result screen KPI fields using server values
        setEl('r-score', serverResult.score);
        const pct = serverResult.totalQuestions ? ((serverResult.score / serverResult.totalQuestions) * 100).toFixed(2) : '0.00';
        setEl('r-percent', pct);
        setEl('r-correct', serverResult.correct);
        setEl('r-incorrect', serverResult.incorrect);
        setEl('r-unattempted', serverResult.unattempted);
        setEl('r-attempted', serverResult.correct + serverResult.incorrect);
        setEl('r-accuracy', serverResult.accuracy + '%');
        setEl('r-total', serverResult.totalQuestions);

        // Build review card list using server-verified answers
        buildReview(serverResult.answers);

        localStorage.removeItem('mockTestState');

        // Transition views and state machine
        UIStateMachine.transition('RESULT_SCREEN', 'submitTest');
        showView('result');
    } catch (err) {
        console.error('Submission failed:', err);
        alert('Network error during submission. Results are saved locally and will sync when connection restores.');
        // Re-enable buttons
        if (headerSubmit) headerSubmit.disabled = false;
        if (mainSubmit) mainSubmit.disabled = false;
        showView('engine');
        if (window.AppState) AppState.dispatch('test', { status: 'active' });
    }
}

function buildReview(serverAnswers) {
    const rc = document.getElementById('review-container');
    if (!rc) return;

    rc.innerHTML = `
        <div class="review-header-box">
            <h3><i class="fas fa-clipboard-check"></i> Performance Review</h3>
            <p>Review each question to understand your mistakes and learn from the explanations.</p>
        </div>
    `;
    rc.style.display = 'block';

    if (serverAnswers) {
        _cachedServerAnswers = serverAnswers;
    } else if (_cachedServerAnswers) {
        serverAnswers = _cachedServerAnswers;
    }

    const resolveDisplayLabel = (val, opts) => {
        if (val === undefined || val === null || val === 'null') return '<span class="status-empty">Not Attempted</span>';
        let idx = parseInt(val);
        if (isNaN(idx)) {
            const s = String(val).trim().toUpperCase();
            if (s === 'A') idx = 0;
            else if (s === 'B') idx = 1;
            else if (s === 'C') idx = 2;
            else if (s === 'D') idx = 3;
        }
        return opts[idx] || String(val);
    };

    const answersList = serverAnswers || [];
    answersList.forEach((ans, i) => {
        const question = testState.selectedQuestions[i] || {};
        const opts = L.opt(question) || question.options || [];
        
        const userText = resolveDisplayLabel(ans.selected, opts);
        const correctText = resolveDisplayLabel(ans.correct, opts);

        const card = document.createElement('div');
        const isCorrectMatch = ans.isCorrect;
        card.className = `review-card ${isCorrectMatch ? 'correct' : (ans.selected === null || ans.selected === undefined || ans.selected === 'null' ? 'skipped' : 'incorrect')}`;

        const lang = currentLanguage || 'en';
        const qText = lang === 'hi' ? (ans.question_hi || ans.question_en) : ans.question_en;
        const explanation = lang === 'hi' ? (ans.explanation_hi || ans.explanation_en) : ans.explanation_en;

        card.innerHTML = `
            <div class="review-q-meta">
                <span class="q-badge">Question ${i + 1}</span>
                <span class="status-badge">${isCorrectMatch ? '✅ Correct' : (ans.selected === null || ans.selected === undefined || ans.selected === 'null' ? '⚪ Skipped' : '❌ Incorrect')}</span>
            </div>
            <div class="review-q-text">${qText || ''}</div>
            <div class="review-choices">
                <div class="choice-row ${isCorrectMatch ? 'user-correct' : (ans.selected === null || ans.selected === undefined || ans.selected === 'null' ? '' : 'user-wrong')}">
                    <strong>Your Answer:</strong> <span>${userText}</span>
                </div>
                ${!isCorrectMatch ? `
                <div class="choice-row system-correct">
                    <strong>Correct Answer:</strong> <span>${correctText}</span>
                </div>` : ''}
            </div>
            ${explanation ? `
            <div class="review-explanation">
                <strong><i class="fas fa-lightbulb"></i> Explanation:</strong>
                <p>${explanation}</p>
            </div>` : ''}
        `;
        rc.appendChild(card);
    });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   21. SESSION PERSISTENCE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function saveProgress() {
    try { localStorage.setItem('mockTestState', JSON.stringify(testState)); } catch { }
}

function checkExistingTestSession() {
    try {
        const modal = document.getElementById('resume-confirm-modal');
        const titleEl = document.getElementById('resume-modal-title');
        const msgEl = document.getElementById('resume-modal-message');
        const confirmBtn = document.getElementById('resume-modal-confirm');
        const declineBtn = document.getElementById('resume-modal-decline');

        if (!modal || !confirmBtn || !declineBtn) {
            if (sessionStorage.getItem('cbt-active') === 'true') {
                if (confirm('You have an active CBT session. Resume your secure exam?')) {
                    window.location.href = '/test.html';
                } else {
                    sessionStorage.removeItem('cbt-active');
                    sessionStorage.removeItem('cbt-active-session');
                    localStorage.removeItem('mockTestState');
                }
            } else {
                const s = JSON.parse(localStorage.getItem('mockTestState'));
                if (s?.isActive && s.selectedQuestions?.length) {
                    if (confirm('You have an unfinished test. Resume?')) {
                        testState = s;
                        currentExam = s.exam || 'upsc';
                        currentSubject = s.subject || 'history';
                        setActiveExam(currentExam);
                        launchExam();
                    } else { localStorage.removeItem('mockTestState'); }
                } else {
                    const savedExam = localStorage.getItem('np_user_exam');
                    if (savedExam) {
                        setActiveExam(savedExam);
                    }
                }
            }
            return;
        }

        const showModal = (title, message, onConfirm, onDecline) => {
            titleEl.textContent = title;
            msgEl.textContent = message;
            modal.style.display = 'flex';
            
            confirmBtn.onclick = () => {
                modal.style.display = 'none';
                onConfirm();
            };
            declineBtn.onclick = () => {
                modal.style.display = 'none';
                onDecline();
            };
        };

        if (sessionStorage.getItem('cbt-active') === 'true') {
            showModal(
                'Active Session Detected',
                'You have an ongoing secure exam in progress. Would you like to resume your session?',
                () => {
                    window.location.href = '/test.html';
                },
                () => {
                    sessionStorage.removeItem('cbt-active');
                    sessionStorage.removeItem('cbt-active-session');
                    localStorage.removeItem('mockTestState');
                    checkStandardState();
                }
            );
        } else {
            checkStandardState();
        }

        function checkStandardState() {
            const s = JSON.parse(localStorage.getItem('mockTestState'));
            if (s?.isActive && s.selectedQuestions?.length) {
                showModal(
                    'Unfinished Mock Test',
                    'You have a previous mock test session saved. Would you like to resume where you left off?',
                    () => {
                        testState = s;
                        currentExam = s.exam || 'upsc';
                        currentSubject = s.subject || 'history';
                        setActiveExam(currentExam);
                        launchExam();
                    },
                    () => {
                        localStorage.removeItem('mockTestState');
                        applySavedExamOnboarding();
                    }
                );
            } else {
                applySavedExamOnboarding();
            }
        }

        function applySavedExamOnboarding() {
            const savedExam = localStorage.getItem('np_user_exam');
            if (savedExam) {
                setActiveExam(savedExam);
            }
        }

    } catch (e) {
        localStorage.removeItem('mockTestState');
    }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   22. FULLSCREEN API
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function enterFullscreen() {
    const el = document.documentElement;
    (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen || (() => { })).call(el);
}
function exitFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) return;
    if (document.visibilityState !== 'visible') return;
    try {
        (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen || (() => {})).call(document);
    } catch(e) { /* document not active */ }
}

/* Fullscreen exit warning — module-level listeners with one-time guard */
if (!_fsListenersInstalled) {
    _fsListenersInstalled = true;
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(ev => {
        document.addEventListener(ev, () => {
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
            if (!isFs && testState.isActive) showFsWarning();
            else removeFsWarningBanner();
        });
    });
}

function showFsWarning() {
    if (document.getElementById('fs-warning-banner')) return;
    const b = document.createElement('div');
    b.id = 'fs-warning-banner';
    b.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:9999;background:#EF4444;color:#fff;display:flex;align-items:center;justify-content:center;gap:14px;padding:14px 20px;font-weight:700;font-size:.93rem;box-shadow:0 4px 20px rgba(239,68,68,.5);font-family:Poppins,sans-serif;';
    b.innerHTML = `<i class="fas fa-exclamation-triangle"></i> You exited fullscreen — Return to continue exam safely.
      <button onclick="enterFullscreen()" style="background:#fff;color:#EF4444;border:none;padding:7px 18px;border-radius:20px;font-weight:700;cursor:pointer;font-family:inherit;">Re-enter Fullscreen</button>`;
    document.body.appendChild(b);
}
function removeFsWarningBanner() {
    document.getElementById('fs-warning-banner')?.remove();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   23. ANTI-CHEAT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function installAntiCheat() {
    if (acInstalled) return;
    acInstalled = true;
    document.addEventListener('contextmenu', blockCtx);
    document.addEventListener('keydown', blockKeys);
    document.addEventListener('visibilitychange', onVisChange);
    document.body.classList.add('exam-active');
}
function uninstallAntiCheat() {
    if (!acInstalled) return;
    acInstalled = false;
    tabSwitchCount = 0;
    document.removeEventListener('contextmenu', blockCtx);
    document.removeEventListener('keydown', blockKeys);
    document.removeEventListener('visibilitychange', onVisChange);
    document.body.classList.remove('exam-active');
}

function blockCtx(e) { if (testState.isActive) e.preventDefault(); }
function blockKeys(e) {
    if (!testState.isActive) return;
    if (e.key === 'F12') { e.preventDefault(); return; }
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) e.preventDefault();
    if (e.ctrlKey && e.key.toUpperCase() === 'U') e.preventDefault();
}
function onVisChange() {
    if (!testState.isActive || !document.hidden) return;
    tabSwitchCount++;
    showToast(`⚠️ Tab Switch Detected — Warning ${tabSwitchCount}/3`, '#F59E0B', '#1F2937');
    if (tabSwitchCount >= 3) {
        setTimeout(() => { alert('3 tab-switches detected. Test is being auto-submitted.'); submitTest(); }, 600);
    }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   24. QUESTION SLIDE ANIMATION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function slideIn(dir = 'next') {
    const area = document.querySelector('.question-area');
    if (!area) return;
    area.style.transition = 'none';
    area.style.opacity = '0';
    area.style.transform = dir === 'next' ? 'translateX(24px)' : 'translateX(-24px)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        area.style.transition = 'opacity .25s ease, transform .25s ease';
        area.style.opacity = '1';
        area.style.transform = 'translateX(0)';
    }));
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   25. STICKY HEADER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initStickyHeader() {
    const h = document.querySelector('header.sticky-header');
    if (!h) return;
    window.addEventListener('scroll', () => h.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   26. BACK TO TOP
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 280), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   27. SCROLL REVEAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initScrollAnimations() {
    if (window.NirnayPath && window.NirnayPath.initScrollAnimations) {
        window.NirnayPath.initScrollAnimations();
    } else {
        if (window.__scrollAnimationsInitialized) return;
        window.__scrollAnimationsInitialized = true;
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   28. COUNTER ANIMATION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function animateCounters() {
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count) || 0;
            let cur = 0, steps = 55;
            const inc = target / steps;
            const tick = () => {
                cur += inc;
                el.textContent = cur < target ? Math.ceil(cur) + '+' : target + '+';
                if (cur < target) setTimeout(tick, 28);
            };
            tick();
            io.unobserve(el);
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-counter').forEach(el => io.observe(el));
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   29. FAQ
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-header')?.addEventListener('click', () => {
            const open = document.querySelector('.faq-item.active');
            if (open && open !== item) open.classList.remove('active');
            item.classList.toggle('active');
        });
    });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   30. TYPING ANIMATION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initTypingAnimation() {
    const el = document.getElementById('typed-text');
    if (!el) return;
    const phrases = ['NirnayPath', 'Your Success Path'];
    let pi = 0, ci = 0, del = false;
    const type = () => {
        const word = phrases[pi];
        el.textContent = del ? word.substring(0, --ci) : word.substring(0, ++ci);
        let sp = del ? 55 : 110;
        if (!del && ci === word.length) { sp = 2000; del = true; }
        if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; sp = 500; }
        setTimeout(type, sp);
    };
    setTimeout(type, 600);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   31. TIPS SLIDER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initTipsSlider() {
    const track = document.getElementById('tips-slider');
    if (!track) return;
    const tips = [
        { icon: 'fas fa-clock', title: 'Time Management', text: 'Spend no more than 40s per question in competitive exams. Set a daily target and track your progress to stay on schedule.' },
        { icon: 'fas fa-filter', title: 'Elimination Tech', text: "Avoid options with absolutes like 'Always' or 'Never'. Practice this daily to improve your accuracy in multiple-choice questions." },
        { icon: 'fas fa-sync', title: 'Revision Cycle', text: 'Revisit weak topics every 48 hours for best retention. Consistent revision is the key to mastering complex subjects over time.' },
        { icon: 'fas fa-trophy', title: 'Mock Frequency', text: 'Take at least 2 full-length mocks every week. Analyzing your performance in these tests is essential for steady improvement.' }
    ];
    track.innerHTML = tips.map(t => `
      <div class="testimonial-card">
        <i class="${t.icon}" style="font-size:2rem;margin-bottom:14px;display:block;background:var(--gradient);-webkit-background-clip:text;background-clip:text;color:transparent"></i>
        <h4 style="margin-bottom:8px">${t.title}</h4>
        <p style="color:var(--text-secondary);font-size:0.9rem">${t.text}</p>
      </div>`).join('');

    makeInfiniteSlider('tips-slider', 3500);
}

function initHeroSliders() {
    makeHeroSlider('#homeHeroSlider');
    makeHeroSlider('#aboutHeroSlider');
}

function makeHeroSlider(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    // Guard against multiple initializations
    if (container.dataset.sliderInitialized === 'true') return;
    container.dataset.sliderInitialized = 'true';

    const slides = Array.from(container.children).filter(c => c.tagName === 'IMG');
    if (slides.length === 0) return;

    // Load first image immediately
    if (slides[0].dataset.src) {
        slides[0].src = slides[0].dataset.src;
        slides[0].removeAttribute('data-src');
    }
    slides[0].classList.add('active');

    // Lazy load the remaining images asynchronously
    const lazyImages = slides.slice(1);
    const loadRemainingImages = () => {
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadRemainingImages);
    } else {
        setTimeout(loadRemainingImages, 800);
    }

    let currentIndex = 0;
    let isPaused = false;

    function nextSlide() {
        if (isPaused) return;

        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;

        // Ensure target image is loaded before animating active
        const nextImg = slides[currentIndex];
        if (nextImg.dataset.src) {
            nextImg.src = nextImg.dataset.src;
            nextImg.removeAttribute('data-src');
        }
        nextImg.classList.add('active');
    }

    // Store interval on dataset for cleanup safety
    const heroInterval = setInterval(nextSlide, 4500);
    container.dataset.heroInterval = heroInterval;

    container.addEventListener('mouseenter', () => isPaused = true);
    container.addEventListener('mouseleave', () => isPaused = false);
}

/**
 * Trending Mock Tests: 1-card-at-a-time infinite slider
 * Each card is 100% wide; uses CSS transform for animation.
 */
// initTrendingSlider removed in favor of makeInfiniteSlider

/**
 * Universal Infinite Slider Logic
 * @param {string} id - The ID of the slider track
 * @param {number} intervalTime - Time between slides
 */
function makeInfiniteSlider(id, intervalTime = 3000) {
    const track = document.getElementById(id);
    if (!track) return;

    // Wait for content to load
    setTimeout(() => {
        if (track.dataset.sliderInterval) {
            clearInterval(Number(track.dataset.sliderInterval));
        }

        const slides = Array.from(track.children).filter(c => !c.classList.contains('clone'));
        if (slides.length === 0) return;

        let index = 0;
        let isPaused = false;
        let startX = 0;
        let isDragging = false;
        let currentTranslate = 0;
        let prevTranslate = 0;

        function syncClones() {
            const existing = track.querySelectorAll('.clone');
            if (window.innerWidth >= 1024) {
                existing.forEach(el => el.remove());
            } else if (existing.length === 0) {
                slides.forEach(slide => {
                    const clone = slide.cloneNode(true);
                    clone.classList.add('clone');
                    track.appendChild(clone);
                });
            }
        }
        syncClones();

        function getSlideWidth() {
            const firstSlide = track.children[0];
            const gap = parseInt(window.getComputedStyle(track).gap) || 0;
            return firstSlide.offsetWidth + gap;
        }

        function move() {
            if (isPaused || isDragging || document.hidden) return;
            if (window.innerWidth >= 1024) {
                track.style.transform = 'none';
                return;
            }

            index++;
            const slideWidth = getSlideWidth();
            
            track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            track.style.transform = `translateX(-${index * slideWidth}px)`;

            if (index >= slides.length) {
                setTimeout(() => {
                    if (isDragging) return;
                    track.style.transition = 'none';
                    index = 0;
                    track.style.transform = `translateX(0)`;
                }, 600);
            }
        }

        let slideInterval = setInterval(move, intervalTime);
        track.dataset.sliderInterval = slideInterval;

        if (!track.dataset.eventsBound) {
            track.dataset.eventsBound = "true";
            
            track.parentElement.addEventListener('mouseenter', () => isPaused = true);
            track.parentElement.addEventListener('mouseleave', () => isPaused = false);

            track.addEventListener('touchstart', (e) => {
                if (window.innerWidth >= 1024) return;
                isDragging = true;
                isPaused = true;
                startX = e.touches[0].clientX;
                const slideWidth = getSlideWidth();
                prevTranslate = -(index * slideWidth);
                track.style.transition = 'none';
            }, {passive: true});

            track.addEventListener('touchmove', (e) => {
                if (!isDragging || window.innerWidth >= 1024) return;
                const currentPosition = e.touches[0].clientX;
                const diff = currentPosition - startX;
                currentTranslate = prevTranslate + diff;
                track.style.transform = `translateX(${currentTranslate}px)`;
            }, {passive: true});

            track.addEventListener('touchend', (e) => {
                if (!isDragging || window.innerWidth >= 1024) return;
                isDragging = false;
                isPaused = false;
                const slideWidth = getSlideWidth();
                const movedBy = currentTranslate - prevTranslate;
                
                if (movedBy < -50) index++;
                else if (movedBy > 50) index--;

                if (index < 0) index = 0;
                
                track.style.transition = 'transform 0.4s ease-out';
                track.style.transform = `translateX(-${index * slideWidth}px)`;

                if (index >= slides.length) {
                    setTimeout(() => {
                        if (isDragging) return;
                        track.style.transition = 'none';
                        index = 0;
                        track.style.transform = `translateX(0)`;
                    }, 400);
                }
            });

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    clearInterval(Number(track.dataset.sliderInterval));
                } else {
                    const newInterval = setInterval(move, intervalTime);
                    track.dataset.sliderInterval = newInterval;
                }
            });

            window.addEventListener('resize', debounce(() => {
                syncClones();
                if (window.innerWidth >= 1024) {
                    track.style.transition = 'none';
                    track.style.transform = 'none';
                    index = 0;
                } else {
                    track.style.transition = 'none';
                    track.style.transform = `translateX(-${index * getSlideWidth()}px)`;
                }
            }, 150));
        }
    }, 500);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   32. UTILITIES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function on(id, ev, fn) {
    document.getElementById(id)?.addEventListener(ev, fn);
}

window.showToast = function(msg, bg = '#1F2937', color = '#FCD34D') {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:90px;right:20px;z-index:9999;background:${bg};color:${color};padding:14px 22px;border-radius:10px;font-weight:700;font-size:.87rem;box-shadow:0 8px 30px rgba(0,0,0,.35);max-width:340px;font-family:Poppins,sans-serif;border:2px solid ${color};animation:toastIn .35s ease;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4500);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   33. DYNAMIC CSS INJECTION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function injectDynamicCSS() {
    const s = document.createElement('style');
    s.textContent = `
      /* ——— No text selection during exam ——— */
      body.exam-active { user-select:none; -webkit-user-select:none; }

      /* ——— Modern scrollbar ——— */
      ::-webkit-scrollbar            { width:7px; height:7px; }
      ::-webkit-scrollbar-track      { background:transparent; }
      ::-webkit-scrollbar-thumb      { background:rgba(79,70,229,.22); border-radius:10px; }
      ::-webkit-scrollbar-thumb:hover{ background:rgba(79,70,229,.5); }

      /* ——— Palette glow on hover ——— */
      .p-btn:hover              { box-shadow:0 0 0 3px rgba(79,70,229,.2); }
      .p-btn.answered:hover     { box-shadow:0 0 0 3px rgba(22,163,74,.3); }
      .p-btn.not-answered:hover { box-shadow:0 0 0 3px rgba(239,68,68,.3); }
      .p-btn.marked:hover       { box-shadow:0 0 0 3px rgba(217,119,6,.3); }

      /* ——— Question area transition ——— */
      .question-area { will-change:opacity,transform; }

      /* ——— Option ripple ——— */
      .option-row::after {
        content:''; position:absolute; inset:0;
        background:rgba(79,70,229,.06); border-radius:inherit;
        opacity:0; transition:opacity .18s ease; pointer-events:none;
      }
      .option-row:active::after { opacity:1; }

      /* ——— Toast animation ——— */
      @keyframes toastIn {
        from { opacity:0; transform:translateY(12px) scale(.95); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }

      /* ——— About-page stat items (prevent exam palette style bleed) ——— */
      .stats-counter-section .stat-item {
        background:var(--card-bg) !important;
        padding:30px !important;
        border-radius:20px !important;
        border:1px solid var(--border-color) !important;
        box-shadow:var(--shadow) !important;
        flex-direction:column !important;
        align-items:center !important;
        justify-content:center !important;
        text-align:center !important;
        transition:transform .3s ease !important;
        cursor:default !important;
      }
      .stats-counter-section .stat-item:hover { transform:translateY(-5px) !important; }

      /* ——— Result page review visibility ——— */
      #review-container { margin-top:24px; }

      /* ——— Exam body ensures no horizontal overflow ——— */
      #exam-engine { overflow-x:hidden; }

      /* ——— Landscape mobile: palette on right ——— */
      @media (orientation:landscape) and (max-height:500px) {
        .exam-body         { flex-direction:row; }
        .palette-panel     { width:200px; min-height:100vh; }
        .palette-grid      { grid-template-columns:repeat(4,1fr); }
      }

      /* ——— Logo ——— */
      .logo-text { display:flex; flex-direction:column; line-height:1.1; }
      .logo-main { font-size:1.5rem; font-weight:900;
                   background:var(--gradient);-webkit-background-clip:text;
                   background-clip:text;-webkit-text-fill-color:transparent;color:var(--primary);letter-spacing:-.5px; }
      .logo-sub  { font-size:.65rem;font-weight:600;color:var(--primary);
                   letter-spacing:2px;text-transform:uppercase;opacity:.8; }
    `;
    document.head.appendChild(s);

    // ✅ Phase 6: CDN Fallback handling
    setTimeout(() => {
        const faLoaded = Array.from(document.styleSheets).some(s => s.href?.includes('font-awesome'));
        if (!faLoaded) {
            console.warn('CDN: FontAwesome failed to load. Using local fallbacks.');
            const banner = document.createElement('div');
            banner.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;background:#F59E0B;color:#000;text-align:center;padding:8px;font-size:12px;z-index:9999;font-weight:600;';
            banner.innerHTML = '⚠️ Some icons may not load due to CDN connectivity issues. Please check your internet.';
            document.body.appendChild(banner);
        }
    }, 3000);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   34. MOBILE MENU TOGGLE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const navPanel = document.getElementById('mobileNavPanel');
    const panelOverlay = document.getElementById('panelOverlay');
    const closeBtn = document.getElementById('closePanelBtn');
    const panelLinks = document.querySelectorAll('.panel-link');

    if (!toggleBtn || !navPanel || !panelOverlay) return;

    const togglePanel = () => {
        navPanel.classList.toggle('open');
        panelOverlay.classList.toggle('active');
        document.body.style.overflow = navPanel.classList.contains('open') ? 'hidden' : '';
    };

    const closePanel = () => {
        navPanel.classList.remove('open');
        panelOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel();
    });

    closeBtn?.addEventListener('click', closePanel);
    panelOverlay.addEventListener('click', closePanel);

    panelLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.id === 'mobileLoginBtn') {
                e.preventDefault();
                closePanel();
                document.getElementById('loginBtn')?.click();
            } else {
                closePanel();
            }
        });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePanel();
    });
}

// --- UX & Performance Upgrades (Phase 20B) ---
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   35. OFFLINE DETECTION ENGINE (Product Maturity Sprint)
   Non-blocking: shows banner without interrupting active tests
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initOfflineDetection() {
    'use strict';
    let banner = null;
    let onlineTimer = null;

    function getOrCreateBanner() {
        if (!banner) {
            banner = document.createElement('div');
            banner.className = 'offline-warning';
            banner.id = 'np-offline-banner';
            banner.setAttribute('role', 'alert');
            banner.setAttribute('aria-live', 'assertive');
            document.body.prepend(banner);
        }
        return banner;
    }

    function showOfflineBanner() {
        clearTimeout(onlineTimer);
        const b = getOrCreateBanner();
        b.className = 'offline-warning';
        b.innerHTML = '<i class="fas fa-wifi" style="opacity:0.4"></i> You are offline — some features may be unavailable.';
        requestAnimationFrame(() => b.classList.add('show'));
    }

    function showOnlineBanner() {
        const b = getOrCreateBanner();
        b.className = 'offline-warning online show';
        b.innerHTML = '<i class="fas fa-wifi"></i> Connection restored! You\'re back online.';
        onlineTimer = setTimeout(() => b.classList.remove('show'), 3500);
    }

    window.addEventListener('offline', showOfflineBanner);
    window.addEventListener('online',  showOnlineBanner);

    // Silently check initial offline state (defer to avoid blocking first paint)
    if (!navigator.onLine) {
        setTimeout(showOfflineBanner, 1200);
    }
})();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   36. MOBILE BOTTOM NAV BINDING (Product Maturity Sprint)
   Maps bottom nav taps to SPA view transitions
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initMobileBottomNavBinding() {
    'use strict';

    function setActiveBottomNav(id) {
        document.querySelectorAll('.mob-nav-item').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(id);
        if (target) target.classList.add('active');
    }

    const homeBtn      = document.getElementById('mob-nav-home');
    const practiceBtn  = document.getElementById('mob-nav-practice');
    const startBtn     = document.getElementById('mob-nav-start');
    const analyticsBtn = document.getElementById('mob-nav-analytics');

    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showView('dashboard');
            setActiveBottomNav('mob-nav-home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (practiceBtn) {
        practiceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showView('dashboard');
            setActiveBottomNav('mob-nav-practice');
            setTimeout(() => {
                const target = document.getElementById('popular-exams');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }, 150);
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showView('dashboard');
            setActiveBottomNav('mob-nav-start');
            setTimeout(() => {
                const target = document.getElementById('popular-exams');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }, 150);
        });
    }

    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveBottomNav('mob-nav-analytics');
            if (Auth.isLoggedIn()) {
                Dashboard.show();
            } else {
                document.getElementById('loginBtn')?.click();
            }
        });
    }
})();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   37. DYNAMIC EVERGREEN UPDATES (Launch Trust Hardening)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initDynamicUpdates() {
    'use strict';
    try {
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const today = new Date();

        const setDate = (elId, offsetDays) => {
            const el = document.getElementById(elId);
            if (!el) return;
            const d = new Date(today);
            d.setDate(today.getDate() - offsetDays);
            const dayStr = String(d.getDate()).padStart(2, '0');
            const monthStr = months[d.getMonth()];
            el.innerHTML = `${dayStr}<span>${monthStr}</span>`;
        };

        setDate('update-date-1', 1);
        setDate('update-date-2', 3);
        setDate('update-date-3', 5);
        setDate('update-date-4', 7);
    } catch (e) {
        console.error('Failed to initialize dynamic updates:', e);
    }
})();
