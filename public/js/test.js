/**
 * NirnayPath Secure CBT Engine
 * Phase 10B: Enterprise Ecosystem & Advanced Integrity
 *
 * FORENSIC PATCH v2.0 — Runtime Bug Fixes:
 *  - Idempotency guards on startCBT / bindCBTControls / initAntiCheat
 *  - Session-ID handshake prevents stale cbt-active auto-start
 *  - Duplicate listener elimination
 *  - Full cleanup on terminate / return-home
 */

let testState = null;
let timerInterval = null;
let heartbeatInterval = null;
let riskScore = 0;
let isHeartbeatFailing = false;

/* ── Idempotency Guards ────────────────────────────────────────────── */
let _cbtStarted        = false;  // prevents startCBT running twice
let _cbtControlsBound  = false;  // prevents bindCBTControls duplicating handlers
let _antiCheatInstalled = false; // prevents initAntiCheat duplicating listeners

/* ── Submit Flow Guards ─────────────────────────────────────────────── */
// Set TRUE when submit confirmation dialog is open OR executeSubmitFlow has begun.
// _onFsChange checks this before showing the violation overlay — a fullscreen exit
// that happens while the candidate is confirming submit must NOT be treated as a
// violation (e.g., user presses Escape while submit-confirm-overlay is visible).
let _isSubmitInProgress = false;

// Prevents executeSubmitFlow from running concurrently when setInterval fires
// multiple times after timeLeft <= 0 before clearInterval executes.
let _submitExecuting = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load State from LocalStorage
    const rawState = localStorage.getItem('mockTestState');
    if (!rawState) {
        alert("No active test session found. Returning to dashboard.");
        window.location.href = '/index.html';
        return;
    }
    
    testState = JSON.parse(rawState);
    if (!testState.isActive) {
        window.location.href = '/index.html';
        return;
    }

    // Initialize Global UI Context
    document.getElementById('cbt-exam-name').textContent = testState.testName || 'Mock Test';
    const user = localStorage.getItem('nirnaypath_user') || 'Aspirant@';
    const name = user.split('@')[0];
    
    document.getElementById('cbt-cand-name').textContent = name;
    document.getElementById('verify-name').textContent = name;
    document.getElementById('verify-exam').textContent = testState.testName || 'Mock Test';
    document.getElementById('verify-roll').textContent = "NP-" + testState.sessionId.substring(0,8).toUpperCase();
    
    const avatarUrl = `https://ui-avatars.com/api/?background=1B3A6B&color=fff&bold=true&name=${encodeURIComponent(name)}`;
    document.getElementById('cbt-avatar-img').src = avatarUrl;
    document.getElementById('verify-avatar').src = avatarUrl;

    // Route depending on resume state
    // ── FORENSIC FIX: Validate the stored session ID matches the current
    //    testState.sessionId before trusting cbt-active.  A stale
    //    sessionStorage entry from a previous test must NOT auto-start a
    //    brand-new session without going through the permission flow.
    const storedActiveSession = sessionStorage.getItem('cbt-active-session');
    const isGenuineResume = (
        sessionStorage.getItem('cbt-active') === 'true' &&
        storedActiveSession &&
        storedActiveSession === testState.sessionId
    );

    if (isGenuineResume) {
        switchScreen('exam-screen');
        startCBT(true);
    } else {
        // Stale cbt-active — clear it and begin normal permission flow
        sessionStorage.removeItem('cbt-active');
        sessionStorage.removeItem('cbt-active-session');
        runSystemDiagnostics();
    }

    const resumeBtn = document.getElementById('btn-resume-fullscreen');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', async () => {
            try { await document.documentElement.requestFullscreen(); } catch (err) { alert("Fullscreen required."); }
        });
    }

    bindScreenFlows();
});

function switchScreen(screenId) {
    document.querySelectorAll('.cbt-screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

/* ============================================================ 
   1. SYSTEM DIAGNOSTIC ENGINE
   ============================================================ */
async function runSystemDiagnostics() {
    switchScreen('system-check-screen');
    const okBtn = document.getElementById('btn-system-ok');
    const errorMsg = document.getElementById('system-error-msg');
    
    let sysReady = true;

    // 1. Check Fullscreen
    const fsOk = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    const fsEl = document.getElementById('check-fullscreen');
    if(fsOk) {
        fsEl.innerHTML = `<i class="fas fa-check-circle text-success" style="color: green; width: 25px;"></i> Fullscreen Supported`;
    } else {
        fsEl.innerHTML = `<i class="fas fa-times-circle text-danger" style="color: red; width: 25px;"></i> Fullscreen Not Supported`;
        sysReady = false;
    }

    // 2. Check Network Latency
    const netEl = document.getElementById('check-network');
    try {
        const start = performance.now();
        await fetch('/api/test/health');
        const latency = performance.now() - start;
        if(latency < 800) {
            netEl.innerHTML = `<i class="fas fa-check-circle text-success" style="color: green; width: 25px;"></i> Network Latency (${Math.round(latency)}ms)`;
        } else {
            netEl.innerHTML = `<i class="fas fa-exclamation-triangle text-warning" style="color: orange; width: 25px;"></i> High Latency (${Math.round(latency)}ms)`;
        }
    } catch(err) {
        netEl.innerHTML = `<i class="fas fa-times-circle text-danger" style="color: red; width: 25px;"></i> Network Disconnected`;
        sysReady = false;
    }

    // 3. Browser Features
    const brEl = document.getElementById('check-browser');
    const cookieOk = navigator.cookieEnabled;
    const storageOk = typeof(Storage) !== "undefined";
    if(cookieOk && storageOk) {
        brEl.innerHTML = `<i class="fas fa-check-circle text-success" style="color: green; width: 25px;"></i> Browser Verified`;
    } else {
        brEl.innerHTML = `<i class="fas fa-times-circle text-danger" style="color: red; width: 25px;"></i> Invalid Browser Settings`;
        sysReady = false;
    }

    if(sysReady) {
        okBtn.style.display = 'inline-block';
    } else {
        errorMsg.textContent = "System Check Failed. Please resolve the errors above to continue.";
        errorMsg.style.display = 'block';
    }
}

function bindScreenFlows() {
    if (window.logDiagnostic) window.logDiagnostic('bindScreenFlows');
    // Sys Check -> Verification
    document.getElementById('btn-system-ok').addEventListener('click', () => {
        switchScreen('candidate-verification-screen');
    });

    // Verification -> Instructions
    const vCheck = document.getElementById('verify-consent-check');
    const vBtn = document.getElementById('btn-verify-proceed');
    vCheck.addEventListener('change', e => vBtn.disabled = !e.target.checked);
    vBtn.addEventListener('click', () => switchScreen('instruction-screen'));

    // Instructions -> Exam
    const iCheck = document.getElementById('consent-check');
    const iBtn = document.getElementById('btn-proceed');
    iCheck.addEventListener('change', e => iBtn.disabled = !e.target.checked);
    iBtn.addEventListener('click', async () => {
        try {
            await document.documentElement.requestFullscreen();
            startCBT();
        } catch (err) {
            alert("Fullscreen permission is required to start the exam.");
        }
    });
}

async function forceFullscreen() {
    if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(e=>console.warn(e));
    }
}

let _cbtStartLock = false;
function startCBT(isResume = false) {
    if (_cbtStartLock) return;
    _cbtStartLock = true;

    if (window.logDiagnostic) window.logDiagnostic('startCBT');
    // ── FORENSIC FIX: Idempotency guard — prevent double-start in any code path
    if (_cbtStarted) {
        console.warn('[CBT] startCBT() called again — ignoring duplicate invocation.');
        _cbtStartLock = false;
        return;
    }
    _cbtStarted = true;

    // Persist session-ID handshake so genuine resume is distinguishable
    sessionStorage.setItem('cbt-active', 'true');
    sessionStorage.setItem('cbt-active-session', testState.sessionId);

    switchScreen('exam-screen');

    if (!testState.visited.includes(testState.currentIdx)) {
        testState.visited.push(testState.currentIdx);
    }

    renderQuestion();
    renderPalette();

    // Start Engine (both guards are idempotent internally)
    initAntiCheat();
    bindCBTControls();

    // Initial sync and start timers — clear any stale ones first
    clearInterval(timerInterval);
    clearInterval(heartbeatInterval);
    forceServerSync();
    timerInterval = setInterval(localTimerTick, 1000);
    heartbeatInterval = setInterval(heartbeatPing, 10000);
    
    _cbtStartLock = false;
}

/* ============================================================ 
   2. EXAM INTEGRITY ENGINE (Weighted Scoring)
   ============================================================ */
let lastBlurTime = 0;

function initAntiCheat() {
    // ── FORENSIC FIX: Idempotency guard — prevents duplicate listeners
    if (_antiCheatInstalled) {
        console.warn('[CBT] initAntiCheat() called again — ignoring duplicate invocation.');
        return;
    }
    _antiCheatInstalled = true;

    // Fullscreen Exit (30 pts)
    const _onFsChange = () => {
        if (!testState || !testState.isActive) return;
        // FIX A: Do NOT show violation overlay when submit flow is in progress.
        // Pressing Escape during the submit confirmation dialog exits fullscreen
        // but must not be treated as a cheating violation — the candidate is
        // actively trying to submit. Without this guard the violation-overlay
        // appears on top of the submit dialog, trapping the candidate.
        if (_isSubmitInProgress) return;
        if (!document.fullscreenElement) {
            increaseRiskScore(30, 'fullscreen_exit');
            document.getElementById('violation-overlay').classList.add('active');
            document.getElementById('exam-screen').style.filter = 'blur(10px)';
        } else {
            document.getElementById('violation-overlay').classList.remove('active');
            document.getElementById('exam-screen').style.filter = 'none';
        }
    };
    document.addEventListener('fullscreenchange', _onFsChange);
    document.addEventListener('webkitfullscreenchange', _onFsChange);

    // Tab Switching (20 pts)
    const _onVisChange = () => {
        if (document.hidden) increaseRiskScore(20, 'tab_switch');
    };
    document.addEventListener('visibilitychange', _onVisChange);

    // Window Blur (Focus Loss - 15 pts, Rapid = 25)
    const _onBlur = () => {
        const now = Date.now();
        if (now - lastBlurTime < 10000) {
            increaseRiskScore(25, 'rapid_focus_loss');
        } else {
            increaseRiskScore(15, 'window_blur');
        }
        lastBlurTime = now;
    };
    window.addEventListener('blur', _onBlur);

    // Clipboard and Context (15 pts)
    const blockCopy = (e) => { e.preventDefault(); increaseRiskScore(15, 'clipboard_usage'); };
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('copy', blockCopy);
    document.addEventListener('cut', blockCopy);
    document.addEventListener('paste', blockCopy);

    // DevTools & Shortcuts (50 pts for DevTools)
    const _onKeyDown = (e) => {
        if (e.key === 'F12') { e.preventDefault(); increaseRiskScore(50, 'devtools_detected'); }
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) { e.preventDefault(); increaseRiskScore(50, 'devtools_detected'); }
        if (e.ctrlKey && ['C', 'V', 'P'].includes(e.key.toUpperCase())) { e.preventDefault(); increaseRiskScore(15, 'shortcut_usage'); }
    };
    document.addEventListener('keydown', _onKeyDown);
}


async function increaseRiskScore(points, type) {
    if (!testState.isActive) return;
    riskScore += points;
    document.getElementById('violation-count').textContent = `Risk Level: ${riskScore}/100`;

    if (riskScore >= 100) {
        terminateTest("Your session was terminated due to critical integrity violations.");
        return;
    }

    try {
        const token = Auth.getToken();
        const res = await fetch('/api/test/violation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ sessionId: testState.sessionId, type, score: riskScore })
        });
        const data = await res.json();
        if (data.locked) terminateTest("Session locked by Server.");
    } catch (err) { console.warn("Violation ping failed", err); }
}

function terminateTest(reason) {
    testState.isActive = false;
    clearInterval(timerInterval);
    clearInterval(heartbeatInterval);
    // ── FORENSIC FIX: Clear BOTH sessionStorage keys on terminate
    sessionStorage.removeItem('cbt-active');
    sessionStorage.removeItem('cbt-active-session');

    document.querySelectorAll('.cbt-overlay').forEach(el => el.classList.remove('active'));

    const termOverlay = document.getElementById('terminated-overlay');
    termOverlay.classList.add('active');
    document.getElementById('terminate-title').textContent = 'Exam Terminated';
    document.getElementById('terminate-message').textContent = reason;
    document.getElementById('terminate-icon').className = 'fas fa-shield-alt terminate-icon';
    document.getElementById('terminate-icon').style.color = '#d32f2f';

    executeSubmitFlow(true);
}

/* ============================================================ 
   3. HEARTBEAT & RECOVERY PROTOCOL
   ============================================================ */
function localTimerTick() {
    if (testState.timeLeft <= 0) return;
    testState.timeLeft--;
    updateTimerDisplay();
    
    if (testState.timeLeft <= 0) executeSubmitFlow(true);
}

function updateTimerDisplay() {
    const h = Math.floor(testState.timeLeft / 3600).toString().padStart(2, '0');
    const m = Math.floor((testState.timeLeft % 3600) / 60).toString().padStart(2, '0');
    const s = (testState.timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('cbt-time-display').textContent = testState.timeLimit >= 3600 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

async function forceServerSync() {
    if (!testState.isActive) return;
    try {
        const token = Auth.getToken();
        const res = await fetch(`/api/test/sync/${testState.sessionId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            if (data.isExpired || data.status !== 'active') {
                testState.timeLeft = 0; executeSubmitFlow(true);
            } else {
                testState.timeLeft = data.timeLeft; updateTimerDisplay();
            }
        }
    } catch(err){}
}

async function heartbeatPing() {
    if (!testState.isActive) return;
    
    localStorage.setItem('mockTestState', JSON.stringify(testState)); // Local fallback cache
    
    const payload = {
        sessionId: testState.sessionId,
        clientState: {
            fullscreen: !!document.fullscreenElement,
            visible: !document.hidden,
            focus: document.hasFocus()
        },
        metrics: {
            currentQuestion: testState.currentIdx,
            riskScore: riskScore
        },
        answers: testState.answers,
        markedForReview: testState.marked
    };

    try {
        const token = Auth.getToken();
        const start = performance.now();
        const res = await fetch('/api/test/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            isHeartbeatFailing = false;
            const data = await res.json();
            if (data.isExpired) { testState.timeLeft = 0; executeSubmitFlow(true); }
            else if (data.timeLeft) {
                // Correct drift smoothly
                if (Math.abs(testState.timeLeft - data.timeLeft) > 3) testState.timeLeft = data.timeLeft;
            }
        } else {
            if (res.status === 403) terminateTest("Session terminated by server.");
        }
    } catch(err) {
        console.warn("[HEARTBEAT] Connection failed. Running in isolated mode.");
        isHeartbeatFailing = true;
    }
}

/* ============================================================ 
   4. CBT RENDERING ENGINE
   ============================================================ */
let questionEntryTime = 0;

function renderQuestion() {
    const qData = testState.selectedQuestions[testState.currentIdx];
    if (!qData) return;
    questionEntryTime = Date.now();

    document.getElementById('q-current-num').textContent = testState.currentIdx + 1;
    
    const lang = document.getElementById('cbt-lang-select').value;
    const qTextRaw = lang === 'hi' ? (qData.question_hi || qData.question_en || qData.question) : (qData.question_en || qData.question);
    const qText = typeof qTextRaw === 'object' ? (qTextRaw[lang] || qTextRaw.en || qTextRaw.hi || '') : qTextRaw;
    document.getElementById('q-text-content').innerHTML = String(qText).replace(/\s*\[V\d+\]\s*/gi, ' ').trim();

    // Options
    const optContainer = document.getElementById('q-options-container');
    optContainer.innerHTML = '';
    
    const optsRaw = lang === 'hi' ? (qData.options_hi || qData.options_en || qData.options) : (qData.options_en || qData.options);
    let opts = optsRaw;
    if (Array.isArray(optsRaw) && optsRaw.length > 0 && typeof optsRaw[0] === 'object') {
        opts = optsRaw.map(o => o.text ? (o.text[lang] || o.text.en || o.text.hi) : (o[lang] || o.en || o.hi || o));
    }

    if (Array.isArray(opts)) {
        opts.forEach((text, idx) => {
            const isChecked = testState.answers[testState.currentIdx] === idx;
            const row = document.createElement('div');
            row.className = 'q-option-row';
            row.innerHTML = `
                <input type="radio" name="cbt_opt" id="opt_${idx}" value="${idx}" ${isChecked ? 'checked' : ''}>
                <label for="opt_${idx}" style="cursor:pointer;flex:1;">${text}</label>
            `;
            row.addEventListener('click', () => {
                document.getElementById(`opt_${idx}`).checked = true;
                saveLocalAnswer(idx);
            });
            optContainer.appendChild(row);
        });
    }

    // Trigger MathJax Reparse
    if (window.MathJax) {
        window.MathJax.typesetPromise([document.getElementById('q-text-content'), document.getElementById('q-options-container')]).catch(err=>console.warn(err));
    }
}

function renderPalette() {
    const grid = document.getElementById('cbt-palette-grid');
    grid.innerHTML = '';
    
    testState.selectedQuestions.forEach((_, i) => {
        const btn = document.createElement('div');
        btn.id = `pal-${i}`;
        btn.className = 'p-btn';
        btn.textContent = i + 1;
        
        btn.addEventListener('click', () => {
            testState.currentIdx = i;
            if (!testState.visited.includes(i)) testState.visited.push(i);
            renderQuestion();
            updatePaletteClasses();
            heartbeatPing(); // trigger immediate save
        });
        grid.appendChild(btn);
    });
    updatePaletteClasses();
}

function updatePaletteClasses() {
    testState.selectedQuestions.forEach((_, i) => {
        const btn = document.getElementById(`pal-${i}`);
        if (!btn) return;
        
        const visited = testState.visited.includes(i);
        const answered = testState.answers[i] !== undefined;
        const marked = testState.marked.includes(i);
        
        btn.className = 'p-btn';
        btn.innerHTML = i + 1;

        if (!visited) btn.classList.add('not-visited');
        else if (answered && marked) { btn.classList.add('answered-marked'); btn.innerHTML = `${i + 1}<div class="green-dot"></div>`; }
        else if (answered) btn.classList.add('answered');
        else if (marked) btn.classList.add('marked');
        else btn.classList.add('not-answered');
        
        if (i === testState.currentIdx) btn.classList.add('active-q');
    });
}

function saveLocalAnswer(val) {
    if (val !== undefined) {
        testState.answers[testState.currentIdx] = val;
        localStorage.setItem('mockTestState', JSON.stringify(testState));
        updatePaletteClasses();
        // IMMEDIATE sync to server to prevent mid-test data loss
        heartbeatPing();
    }
    // Rapid answer tracking logic for behavior detection
    const duration = Date.now() - questionEntryTime;
    if (duration < 500) increaseRiskScore(5, 'rapid_answering'); // 5 points for spamming answers
}

function bindCBTControls() {
    if (window.logDiagnostic) window.logDiagnostic('bindCBTControls');
    // ── FORENSIC FIX: Idempotency guard — prevents duplicate handlers if
    //    bindCBTControls is ever called more than once in the page lifecycle
    if (_cbtControlsBound) {
        console.warn('[CBT] bindCBTControls() called again — ignoring duplicate binding.');
        return;
    }
    _cbtControlsBound = true;

    document.getElementById('cbt-lang-select').addEventListener('change', renderQuestion);

    document.getElementById('btn-save-next').addEventListener('click', () => {
        testState.marked = testState.marked.filter(x => x !== testState.currentIdx);
        advanceQuestion();
    });

    document.getElementById('btn-mark-review').addEventListener('click', () => {
        if (!testState.marked.includes(testState.currentIdx)) {
            testState.marked.push(testState.currentIdx);
        }
        advanceQuestion();
    });

    document.getElementById('btn-clear-response').addEventListener('click', () => {
        delete testState.answers[testState.currentIdx];
        document.querySelectorAll('input[name="cbt_opt"]').forEach(r => r.checked = false);
        updatePaletteClasses();
        localStorage.setItem('mockTestState', JSON.stringify(testState));
        heartbeatPing();
    });

    document.getElementById('btn-submit-test').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showSubmitConfirmation();
    });
    document.getElementById('btn-cancel-submit').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // FIX A: If the candidate cancels the submit, reset the in-progress flag
        // so fullscreen enforcement resumes normally.
        _isSubmitInProgress = false;
        document.getElementById('submit-confirm-overlay').classList.remove('active');
    });
    document.getElementById('btn-confirm-submit').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        executeSubmitFlow(false);
    });

    document.getElementById('btn-return-home').addEventListener('click', () => {
        // ── FORENSIC FIX: Full state cleanup before navigating home
        clearInterval(timerInterval);
        clearInterval(heartbeatInterval);
        sessionStorage.removeItem('cbt-active');
        sessionStorage.removeItem('cbt-active-session');
        localStorage.removeItem('mockTestState');
        window.location.href = '/index.html';
    });
}

function advanceQuestion() {
    if (testState.currentIdx < testState.selectedQuestions.length - 1) {
        testState.currentIdx++;
        if (!testState.visited.includes(testState.currentIdx)) testState.visited.push(testState.currentIdx);
    }
    renderQuestion();
    updatePaletteClasses();
    localStorage.setItem('mockTestState', JSON.stringify(testState));
    heartbeatPing();
}

function showSubmitConfirmation() {
    // FIX A: Mark submit as in-progress so _onFsChange ignores fullscreen
    // exits that happen while this confirmation dialog is visible.
    _isSubmitInProgress = true;

    let ans = 0, notAns = 0, mark = 0, ansMark = 0, notVis = 0;
    const total = testState.selectedQuestions.length;
    
    for (let i=0; i<total; i++) {
        const visited = testState.visited.includes(i);
        const answered = testState.answers[i] !== undefined;
        const marked = testState.marked.includes(i);
        if (!visited) notVis++;
        else if (answered && marked) ansMark++;
        else if (answered) ans++;
        else if (marked) mark++;
        else notAns++;
    }
    
    document.getElementById('s-ans').textContent = ans;
    document.getElementById('s-not-ans').textContent = notAns;
    document.getElementById('s-mark').textContent = mark;
    document.getElementById('s-ans-mark').textContent = ansMark;
    document.getElementById('s-not-vis').textContent = notVis;
    
    document.getElementById('submit-confirm-overlay').classList.add('active');
}

async function executeSubmitFlow(isForced) {
    // FIX B: Idempotency guard — prevents concurrent executions when
    // setInterval fires localTimerTick multiple times after timeLeft <= 0
    // before clearInterval on line below executes (async boundary gap).
    if (_submitExecuting) return;
    _submitExecuting = true;
    _isSubmitInProgress = true; // ensure flag is set for forced/timer submits too

    clearInterval(timerInterval);
    clearInterval(heartbeatInterval);
    testState.isActive = false;
    // ── FORENSIC FIX: Remove BOTH session keys on normal submit
    sessionStorage.removeItem('cbt-active');
    sessionStorage.removeItem('cbt-active-session');
    
    document.querySelectorAll('.cbt-overlay').forEach(el => el.classList.remove('active'));
    
    // Evaluation Logic
    const normalize = s => String(s).trim().toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '');
    const resolveFullText = (val, opts) => {
        if (val === undefined || val === null) return '';
        let idx = parseInt(val);
        if (isNaN(idx)) {
            const s = String(val).trim().toUpperCase();
            if (s === 'A') idx = 0; else if (s === 'B') idx = 1; else if (s === 'C') idx = 2; else if (s === 'D') idx = 3;
        }
        return opts[idx] ? normalize(opts[idx]) : normalize(val);
    };

    let correct = 0, attempted = 0;
    testState.selectedQuestions.forEach((q, i) => {
        if (testState.answers[i] !== undefined) {
            attempted++;
            const opts = q.options_en || q.options || []; 
            const userChoice = resolveFullText(testState.answers[i], opts);
            const correctOpt = resolveFullText(q.correctAnswer, opts);
            if (userChoice !== '' && userChoice === correctOpt) correct++;
        }
    });

    const total = testState.selectedQuestions.length;
    const accuracy = attempted ? ((correct / attempted) * 100).toFixed(1) : '0.0';

    const payload = {
        sessionId: testState.sessionId,
        exam: testState.exam,
        subject: testState.subject,
        testName: testState.testName,
        score: correct,
        totalQuestions: total,
        correct,
        incorrect: attempted - correct,
        unattempted: total - attempted,
        accuracy: parseFloat(accuracy),
        answers: testState.selectedQuestions.map((q, i) => ({
            questionId: q._id || q.id || `q-${i}`,
            userAnswer: testState.answers[i] !== undefined ? String(testState.answers[i]) : null,
            correctAnswer: String(q.correctAnswer),
            topic: q.topic || 'General'
        })),
        mode: testState.mode || 'full'
    };

    try {
        const token = Auth.getToken();
        await fetch('/api/test/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        
        localStorage.removeItem('mockTestState');
        // FIX C: Await exitFullscreen so fullscreenchange fires and resolves
        // BEFORE we show the terminated-overlay. Without await, the browser
        // fires fullscreenchange asynchronously — if _onFsChange runs after
        // terminated-overlay appears, it could race with it.
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            try {
                await (document.exitFullscreen || document.webkitExitFullscreen || (() => Promise.resolve())).call(document);
            } catch (fsErr) {
                console.warn("Error exiting fullscreen:", fsErr);
            }
        }
        if (isForced) {
            document.getElementById('terminated-overlay').classList.add('active');
        } else {
            const termOverlay = document.getElementById('terminated-overlay');
            if (termOverlay) {
                termOverlay.classList.add('active');
                document.getElementById('terminate-title').textContent = 'Test Submitted';
                document.getElementById('terminate-message').textContent = 'Your responses have been saved securely.';
                const termIcon = document.getElementById('terminate-icon');
                if (termIcon) {
                    termIcon.className = 'fas fa-check-circle terminate-icon';
                    termIcon.style.color = '#10b981';
                }
            }
        }
    } catch (err) {
        console.error("Submit failed", err);
        alert("Network error during submission. Results are saved locally and will sync when connection restores.");
    }
}
