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
let timerInterval = null;
let tabSwitchCount = 0;
let acInstalled = false;

let testState = {
    exam: 'upsc', subject: 'history', testName: '',
    answers: {}, marked: [], visited: [],
    timeLeft: 90 * 60, currentIdx: 0,
    isActive: false, selectedQuestions: [],
    mode: 'full', modeValue: null // 'full', 'drill', 'section'
};

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
   3. BOOT — SINGLE DOMContentLoaded
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
document.addEventListener('DOMContentLoaded', () => {

    /* Cache views */
    VIEW.dashboard = document.getElementById('dashboard');
    VIEW.loading = document.getElementById('loading-screen');
    VIEW.engine = document.getElementById('exam-engine');
    VIEW.result = document.getElementById('result-screen');
    VIEW.userDashboard = document.getElementById('user-dashboard');

    /* Inject CSS enhancements (scrollbar, animations, etc.) */
    injectDynamicCSS();

    /* Init modules */
    initTheme();

    initExamRibbon();
    initLanguageToggle();
    initFilterButtons();
    initStickyHeader();
    initBackToTop();
    initScrollAnimations();
    initFAQ();
    initTypingAnimation();
    initMobileMenu();
    initTipsSlider();
    makeInfiniteSlider('testimonial-slider', 4000);
    animateCounters();
    initTrendingTestButtons();

    /* ✅ Always start on dashboard — subject panel hidden by default */
    showView('dashboard');

    /* Bind result screen buttons here since engine sections exist */
    bindExamControls();

    /* Try to resume an active test session */
    checkExistingTestSession();
});

/* ============================================================ 
   4. VIEW MANAGER – guaranteed visibility control
   ============================================================ */
function showView(id) {
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

    /* Body state – controls header/footer visibility */
    document.body.setAttribute('data-view', id);

    if (id === 'engine') {
        document.body.classList.add('test-mode');
        enterFullscreen();
        installAntiCheat();
    } else {
        document.body.classList.remove('test-mode');
        exitFullscreen();
        uninstallAntiCheat();
        removeFsWarningBanner();
    }

    /* Scroll to top for non-exam pages */
    if (id !== 'engine') window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    toggle.addEventListener('click', () => {
        const dark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', dark ? '' : 'dark');
        if (dark) {
            document.body.removeAttribute('data-theme');
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });
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
    if (testState.isActive && testState.selectedQuestions.length) renderQuestion();
}

/* ============================================================ 
   9. BILINGUAL HELPERS
   ============================================================ */
const L = {
    q: q => currentLanguage === 'hi' ? (q.question_hi || q.question_en || q.question) : (q.question_en || q.question),
    opt: q => currentLanguage === 'hi' ? (q.options_hi || q.options_en || q.options) : (q.options_en || q.options),
    exp: q => currentLanguage === 'hi' ? (q.explanation_hi || q.explanation_en || q.explanation) : (q.explanation_en || q.explanation)
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
async function startTest(testName, subject, questionCount = 100, timeLimit = 90) {
    if (!Auth.isLoggedIn()) {
        alert('Please login to start the mock test.');
        document.getElementById('loginModal').style.display = 'flex';
        return;
    }
    console.log(`[NirnayPath] Starting test: ${testName} for subject: ${subject}`);
    showView('loading');
    try {
        const url = `/api/questions/${subject}`;
        console.log(`[NirnayPath] Fetching: ${url}`);
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`[NirnayPath] Fetch failed: ${res.status} ${res.statusText}`);
            throw new Error(`HTTP ${res.status} – Subject not found`);
        }
        const data = await res.json();
        let raw = Array.isArray(data) ? data : (data.questions || []);
        if (!raw.length) throw new Error('Question bank is empty.');

        const normalized = raw.map(q => ({
            ...q,
            question: L.q(q),
            options: L.opt(q),
            explanation: L.exp(q) || 'No explanation provided.'
        }));

        const selected = shuffleArray([...normalized]).slice(0, Math.min(questionCount, normalized.length));

        testState = {
            exam: currentExam, subject, testName,
            answers: {}, marked: [], visited: [0],
            timeLeft: timeLimit * 60, currentIdx: 0,
            isActive: true, selectedQuestions: selected,
            mode: 'full', modeValue: null
        };
        saveProgress();
        launchExam();
    } catch (err) {
        console.error('[NirnayPath] Test load error:', err);
        alert(`Could not load test.\n\n${err.message}`);
        showView('dashboard');
    }
}

/* ============================================================ 
   14. LAUNCH EXAM ENGINE
   ============================================================ */
function launchExam() {
    const total = testState.selectedQuestions.length;
    const subName = subjectNames[testState.subject] || testState.subject;

    /* Header title */
    const titleEl = document.getElementById('exam-title');
    if (titleEl) titleEl.textContent = `${examNames[testState.exam] || testState.exam} · ${subName}`;

    /* Update totals */
    setEl('q-total', total);
    setEl('progress-total', total);

    /* Candidate name / avatar */
    const user = localStorage.getItem('nirnaypath_user');
    if (user) {
        setEl('cand-name', user.split('@')[0]);
        const av = document.getElementById('user-avatar');
        if (av) av.src = `https://ui-avatars.com/api/?background=1B3A6B&color=fff&bold=true&name=${encodeURIComponent(user.split('@')[0])}`;
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
    const qData = testState.selectedQuestions[testState.currentIdx];
    if (!qData) return;

    /* Slide animation */
    slideIn(dir);

    /* Mark visited */
    if (!testState.visited.includes(testState.currentIdx)) testState.visited.push(testState.currentIdx);

    /* Q number */
    setEl('q-no', testState.currentIdx + 1);

    /* Question text */
    const qText = L.q(qData) || qData.question || '(Question text unavailable)';
    setEl('q-text', qText);

    /* Options */
    const opts = L.opt(qData) || qData.options || [];
    const optContainer = document.getElementById('options-container');
    if (!optContainer) return;
    optContainer.innerHTML = '';

    if (Array.isArray(opts) && opts.length) {
        opts.forEach((text, idx) => {
            const row = document.createElement('div');
            row.className = 'option-row';
            const saved = testState.answers[testState.currentIdx];
            if (saved === idx) row.classList.add('selected');

            const radio = document.createElement('input');
            radio.type = 'radio'; radio.name = 'q_opt'; radio.value = idx;
            radio.id = `opt_${idx}`;
            if (saved === idx) radio.checked = true;

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
}

/* ============================================================ 
   16. PROGRESS BAR
   ============================================================ */
function updateProgressBar() {
    const total = testState.selectedQuestions.length;
    const answered = Object.keys(testState.answers).length;
    const pct = total ? ((answered / total) * 100) : 0;
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = `${pct}%`;
    setEl('progress-text', answered);
}

/* ============================================================ 
   17. PALETTE
   ============================================================ */
function renderPalette() {
    const grid = document.getElementById('palette-grid');
    if (!grid) return;
    grid.innerHTML = '';
    testState.selectedQuestions.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.id = `pal-${idx}`;
        btn.className = 'p-btn';
        btn.textContent = idx + 1;
        btn.title = `Go to Q${idx + 1}`;
        btn.addEventListener('click', () => {
            saveCurrentAnswer();
            const dir = idx > testState.currentIdx ? 'next' : 'prev';
            testState.currentIdx = idx;
            renderQuestion(dir);
            saveProgress();
        });
        grid.appendChild(btn);
    });
    updatePaletteClasses();
}

function updatePaletteClasses() {
    testState.selectedQuestions.forEach((_, idx) => {
        const btn = document.getElementById(`pal-${idx}`);
        if (!btn) return;
        const visited = testState.visited.includes(idx);
        const answered = testState.answers[idx] !== undefined;
        const marked = testState.marked.includes(idx);
        btn.className = 'p-btn';
        btn.innerHTML = idx + 1;

        if (!visited) btn.classList.add('not-visited');
        else if (answered && marked) { btn.classList.add('answered-marked'); btn.innerHTML = `${idx + 1}<div class="green-dot"></div>`; }
        else if (answered) btn.classList.add('answered');
        else if (marked) btn.classList.add('marked');
        else btn.classList.add('not-answered');
        if (idx === testState.currentIdx) btn.classList.add('current');
    });
}

function updateStats() {
    let answered = 0, notAnswered = 0, marked = 0, ansMarked = 0, notVisited = 0;
    testState.selectedQuestions.forEach((_, i) => {
        if (!testState.visited.includes(i)) notVisited++;
        else if (testState.answers[i] !== undefined) {
            if (testState.marked.includes(i)) ansMarked++; else answered++;
        } else {
            if (testState.marked.includes(i)) marked++; else notAnswered++;
        }
    });
    setEl('c-answered', answered);
    setEl('c-not-answered', notAnswered);
    setEl('c-marked', marked);
    setEl('c-answered-marked', ansMarked);
    setEl('c-not-visited', notVisited);
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

    /* Review & Home */
    on('btn-review', 'click', () => {
        const rc = document.getElementById('review-container');
        if (rc) rc.style.display = rc.style.display === 'none' ? 'block' : 'none';
    });
    on('btn-home', 'click', () => {
        testState = { answers: {}, marked: [], visited: [], isActive: false, selectedQuestions: [] };
        localStorage.removeItem('mockTestState');
        showView('dashboard');
    });
}

function confirmSubmit() {
    const un = testState.selectedQuestions.length - Object.keys(testState.answers).length;
    const msg = un > 0
        ? `You have ${un} unanswered question(s).\n\nAre you sure you want to submit?`
        : 'Submit this test now?';
    if (confirm(msg)) submitTest();
}

/* Wire static trending test buttons in HTML */
function initTrendingTestButtons() {
    document.querySelectorAll('.trend-start-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const exam = btn.dataset.exam;
            const subject = btn.dataset.subject;
            const qCount = parseInt(btn.dataset.questions || '100');
            const tLimit = parseInt(btn.dataset.time || '90');
            if (exam) currentExam = exam;
            if (subject) currentSubject = subject;
            startTest(`${btn.closest('.trend-card')?.querySelector('h3')?.textContent || 'Mock Test'}`, subject, qCount, tLimit);
        });
    });
}

/* ============================================================ 
   19. TIMER
   ============================================================ */
function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        if (testState.timeLeft <= 0) { clearInterval(timerInterval); submitTest(); return; }
        testState.timeLeft--;
        updateTimerDisplay();
        const el = document.getElementById('countdown');
        if (el) el.classList.toggle('warning', testState.timeLeft <= 300);
        if (testState.timeLeft % 30 === 0) saveProgress();
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(testState.timeLeft / 60).toString().padStart(2, '0');
    const s = (testState.timeLeft % 60).toString().padStart(2, '0');
    setEl('countdown', `${m}:${s}`);
}

/* ============================================================ 
   20. SUBMIT & RESULT
   ============================================================ */
function submitTest() {
    clearInterval(timerInterval);
    saveCurrentAnswer();
    testState.isActive = false;
    saveProgress();

    /* Robust Answer Comparison Helper */
    const normalize = s => String(s).trim().toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '');

    const resolveFullText = (val, opts) => {
        if (val === undefined || val === null) return '';
        let idx = parseInt(val);
        if (isNaN(idx)) {
            const s = String(val).trim().toUpperCase();
            if (s === 'A') idx = 0;
            else if (s === 'B') idx = 1;
            else if (s === 'C') idx = 2;
            else if (s === 'D') idx = 3;
        }
        return opts[idx] ? normalize(opts[idx]) : normalize(val);
    };

    const isCorrect = (user, correct, opts) => {
        if (user === undefined || user === null) return false;
        const uText = resolveFullText(user, opts);
        const cText = resolveFullText(correct, opts);
        return uText !== '' && uText === cText;
    };

    let correct = 0, attempted = 0;
    testState.selectedQuestions.forEach((q, i) => {
        if (testState.answers[i] !== undefined) {
            attempted++;
            const opts = L.opt(q) || q.options || [];
            if (isCorrect(testState.answers[i], q.correctAnswer, opts)) correct++;
        }
    });
    const total = testState.selectedQuestions.length;
    const incorrect = attempted - correct;
    const unattempted = total - attempted;
    const pct = total ? ((correct / total) * 100).toFixed(2) : '0.00';
    const accuracy = attempted ? ((correct / attempted) * 100).toFixed(1) : '0.0';

    setEl('r-score', correct);
    setEl('r-percent', pct);
    setEl('r-correct', correct);
    setEl('r-incorrect', incorrect);
    setEl('r-unattempted', unattempted);
    setEl('r-attempted', attempted);
    setEl('r-accuracy', accuracy + '%');
    setEl('r-total', total);

    buildReview();
    localStorage.removeItem('mockTestState');
    /* ✅ Fully switch to result — hides exam engine completely */
    showView('result');

    /* Send results to backend for persistent storage */
    const resultsData = {
        exam: testState.exam,
        subject: testState.subject,
        testName: testState.testName,
        score: correct,
        totalQuestions: total,
        correct,
        incorrect,
        unattempted,
        accuracy: parseFloat(accuracy),
        answers: testState.selectedQuestions.map((q, i) => ({
            questionId: q._id || `q-${i}`,
            userAnswer: testState.answers[i] !== undefined ? String(testState.answers[i]) : null,
            correctAnswer: String(q.correctAnswer),
            isCorrect: isCorrect(testState.answers[i], q.correctAnswer, L.opt(q) || q.options || []),
            topic: q.topic || 'General'
        })),
        mode: testState.mode || 'full',
        modeValue: testState.modeValue || null
    };

    fetch('/api/test/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Auth.getToken()}`
        },
        body: JSON.stringify(resultsData)
    })
    .then(res => res.json())
    .then(data => console.log('Test submitted to server:', data))
    .catch(err => console.error('Error submitting test to server:', err));
}

function buildReview() {
    const rc = document.getElementById('review-container');
    if (!rc) return;

    rc.innerHTML = `
        <div class="review-header-box">
            <h3><i class="fas fa-clipboard-check"></i> Performance Review</h3>
            <p>Review each question to understand your mistakes and learn from the explanations.</p>
        </div>
    `;
    rc.style.display = 'block';

    /* Robust Answer Comparison & Text Resolution for Review */
    const normalize = s => String(s).trim().toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '');

    const resolveDisplayLabel = (val, opts) => {
        if (val === undefined || val === null) return '<span class="status-empty">Not Attempted</span>';
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

    testState.selectedQuestions.forEach((q, i) => {
        const opts = L.opt(q) || q.options || [];
        const userAnsId = testState.answers[i];
        const corrAnsRaw = q.correctAnswer;

        const userText = resolveDisplayLabel(userAnsId, opts);
        const correctText = resolveDisplayLabel(corrAnsRaw, opts);

        // Final Comparison for status badge
        const uNorm = userAnsId !== undefined ? normalize(userText) : '';
        const cNorm = normalize(correctText);
        const isMatch = uNorm !== '' && uNorm === cNorm;

        const card = document.createElement('div');
        card.className = `review-card ${isMatch ? 'correct' : (userAnsId === undefined ? 'skipped' : 'incorrect')}`;

        card.innerHTML = `
            <div class="review-q-meta">
                <span class="q-badge">Question ${i + 1}</span>
                <span class="status-badge">${isMatch ? '✅ Correct' : (userAnsId === undefined ? '⚪ Skipped' : '❌ Incorrect')}</span>
            </div>
            <div class="review-q-text">${L.q(q) || q.question}</div>
            <div class="review-choices">
                <div class="choice-row ${isMatch ? 'user-correct' : (userAnsId === undefined ? '' : 'user-wrong')}">
                    <strong>Your Answer:</strong> <span>${userText}</span>
                </div>
                ${!isMatch ? `
                <div class="choice-row system-correct">
                    <strong>Correct Answer:</strong> <span>${correctText}</span>
                </div>` : ''}
            </div>
            ${q.explanation ? `
            <div class="review-explanation">
                <strong><i class="fas fa-lightbulb"></i> Explanation:</strong>
                <p>${q.explanation}</p>
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
        const s = JSON.parse(localStorage.getItem('mockTestState'));
        if (s?.isActive && s.selectedQuestions?.length) {
            if (confirm('You have an unfinished test. Resume?')) {
                testState = s;
                currentExam = s.exam || 'upsc';
                currentSubject = s.subject || 'history';
                setActiveExam(currentExam);
                launchExam();
            } else { localStorage.removeItem('mockTestState'); }
        }
    } catch { localStorage.removeItem('mockTestState'); }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   22. FULLSCREEN API
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function enterFullscreen() {
    const el = document.documentElement;
    (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen || (() => { })).call(el);
}
function exitFullscreen() {
    (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen || (() => { })).call(document);
}

/* Fullscreen exit warning */
['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(ev => {
    document.addEventListener(ev, () => {
        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
        if (!isFs && testState.isActive) showFsWarning();
        else removeFsWarningBanner();
    });
});

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
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
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
        const slides = Array.from(track.children);
        if (slides.length === 0) return;

        // Clone slides for seamless looping
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            track.appendChild(clone);
        });

        let index = 0;
        let isPaused = false;

        function getSlideWidth() {
            const firstSlide = track.children[0];
            const gap = parseInt(window.getComputedStyle(track).gap) || 0;
            return firstSlide.offsetWidth + gap;
        }

        function move() {
            if (isPaused) return;
            index++;
            const slideWidth = getSlideWidth();
            
            track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            track.style.transform = `translateX(-${index * slideWidth}px)`;

            if (index >= slides.length) {
                setTimeout(() => {
                    track.style.transition = 'none';
                    index = 0;
                    track.style.transform = `translateX(0)`;
                }, 600);
            }
        }

        let slideInterval = setInterval(move, intervalTime);

        track.parentElement.addEventListener('mouseenter', () => isPaused = true);
        track.parentElement.addEventListener('mouseleave', () => isPaused = false);

        // Handle window resize
        window.addEventListener('resize', () => {
            track.style.transition = 'none';
            track.style.transform = `translateX(-${index * getSlideWidth()}px)`;
        });
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
                   background-clip:text;color:transparent;letter-spacing:-.5px; }
      .logo-sub  { font-size:.65rem;font-weight:600;color:var(--primary);
                   letter-spacing:2px;text-transform:uppercase;opacity:.8; }
    `;
    document.head.appendChild(s);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   34. MOBILE MENU TOGGLE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initMobileMenu() {
    // Use event delegation for robustness across page transitions/dynamic headers
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#mobileMenuBtn') || e.target.closest('.mobile-menu-btn');
        const closeBtn = e.target.closest('#closeMobileMenu') || e.target.closest('.close-btn');
        const overlay = document.getElementById('mobileMenuOverlay');
        const navLink = e.target.closest('.mobile-nav-link');

        if (btn && overlay) {
            e.preventDefault();
            e.stopPropagation();
            overlay.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = overlay.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            }
        } else if ((closeBtn || navLink) && overlay) {
            overlay.classList.remove('active');
            document.body.classList.remove('menu-open');
            const openBtn = document.getElementById('mobileMenuBtn');
            if (openBtn) {
                const icon = openBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
            // If it was the login link, trigger login
            if (navLink && navLink.id === 'mobileLoginBtn') {
                document.getElementById('loginBtn')?.click();
            }
        } else if (overlay && overlay.classList.contains('active') && !e.target.closest('#mobileMenuOverlay')) {
            // Close menu when clicking outside
            overlay.classList.remove('active');
            document.body.classList.remove('menu-open');
            const openBtn = document.getElementById('mobileMenuBtn');
            if (openBtn) {
                const icon = openBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        }
    });
}
