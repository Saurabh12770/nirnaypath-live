/**
 * NirnayPath Live Test Series System
 */

const LiveTests = {
    containerId: 'live-sessions-container',
    
    init() {
        this.fetchUpcoming();
        // Refresh every 5 minutes
        setInterval(() => this.fetchUpcoming(), 300000);
    },

    async fetchUpcoming() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        try {
            const response = await fetch('/api/live/upcoming');
            const sessions = await response.json();
            this.render(sessions);
        } catch (error) {
            console.error('Error fetching live sessions:', error);
            container.innerHTML = '<p class="error-msg">Unable to load live tests.</p>';
        }
    },

    render(sessions) {
        const container = document.getElementById(this.containerId);
        if (!sessions.length) {
            container.innerHTML = `
                <div class="no-live-tests">
                    <i class="fas fa-calendar-alt"></i>
                    <p>No live tests scheduled for today. Check back later!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sessions.map(session => this.createCard(session)).join('');
        this.startCountdowns(sessions);
    },

    createCard(session) {
        const isLive = session.status === 'live';
        const startTime = new Date(session.startTime);
        const formattedDate = startTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const formattedTime = startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="live-test-card np-card hover-lift ${isLive ? 'is-live' : ''}" data-id="${session._id}">
                <div class="live-badge">${isLive ? 'â— LIVE NOW' : 'UPCOMING'}</div>
                <div class="live-card-header">
                    <span class="live-exam-tag">${session.exam.toUpperCase()}</span>
                    <span class="live-duration"><i class="far fa-clock"></i> ${session.duration}m</span>
                </div>
                <h3>${session.subject} Live Series</h3>
                <div class="live-info">
                    <div class="info-item">
                        <i class="fas fa-calendar-day"></i>
                        <span>${formattedDate}, ${formattedTime}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>${session.registeredUsers.length} Registered</span>
                    </div>
                </div>
                ${!isLive ? `<div class="countdown-timer" id="timer-${session._id}">Starting in: --:--:--</div>` : ''}
                <div class="live-card-footer">
                    ${isLive ? 
                        `<button class="live-join-btn primary-btn" onclick="LiveTests.startSession('${session._id}', '${session.subject}')">Join Live Test <i class="fas fa-arrow-right"></i></button>` :
                        `<button class="live-reg-btn secondary-btn" id="reg-${session._id}" onclick="LiveTests.register('${session._id}')">Register for Free</button>`
                    }
                </div>
            </div>
        `;
    },

    async register(sessionId) {
        if (!Auth.isLoggedIn()) {
            window.showToast('Please login to register.', 'var(--danger)');
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }

        try {
            const response = await fetch(`/api/live/register/${sessionId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
            });
            if (response.ok) {
                const btn = document.getElementById(`reg-${sessionId}`);
                btn.textContent = 'Registered âœ…';
                btn.disabled = true;
                btn.classList.add('success-state');
                window.showToast('Registration successful!', 'var(--success)');
            }
        } catch (error) {
            console.error('Registration failed:', error);
        }
    },

    async startSession(sessionId, subject) {
        if (!Auth.isLoggedIn()) {
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }

        window.showToast('Preparing live exam...', 'var(--primary)');
        
        try {
            const response = await fetch(`/api/live/start/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                window.liveQuestions = data.questions;
                window.liveSessionId = data.sessionId;
                // Reuse existing startTest logic
                startTest(subject, `${subject} Live Series`, data.questions.length, data.duration);
            } else {
                window.showToast(data.error || 'Could not join session', 'var(--danger)');
            }
        } catch (error) {
            console.error('Start session error:', error);
        }
    },

    startCountdowns(sessions) {
        sessions.forEach(session => {
            if (session.status === 'upcoming') {
                const timerEl = document.getElementById(`timer-${session._id}`);
                if (!timerEl) return;

                const start = new Date(session.startTime).getTime();
                
                const interval = setInterval(() => {
                    const now = new Date().getTime();
                    const diff = start - now;

                    if (diff <= 0) {
                        clearInterval(interval);
                        timerEl.innerHTML = '<span class="ready-text">READY TO START!</span>';
                        this.fetchUpcoming(); // Refresh to show join button
                        return;
                    }

                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const secs = Math.floor((diff % (1000 * 60)) / 1000);

                    timerEl.textContent = `Starting in: ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                }, 1000);
            }
        });
    }
};

AppLifecycle.register(() => LiveTests.init());

