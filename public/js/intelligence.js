/**
 * NirnayPath Student Intelligence Engine v1.0
 * FAANG-grade analytics and gamification logic
 */

const Intelligence = {
    charts: {},
    
    async init(options = {}) {
        return new Promise((resolve) => {
            const fetchAndRender = async () => {
                console.log('[Intelligence] Awakening engine...');
                
                try {
                    const plan = options?.plan || 'free';
                    const isPro = plan !== 'free' || !!(window._npConfig && window._npConfig.growthMode);

                    // Fetch overview and trends (free routes)
                    const overviewPromise = this.fetchData('/api/analytics/overview');
                    const trendsPromise = this.fetchData('/api/analytics/trends');

                    // Fetch gated routes conditionally
                    const topicsPromise = isPro ? this.fetchData('/api/analytics/topics') : Promise.resolve(null);
                    const readinessPromise = isPro ? this.fetchData('/api/analytics/readiness') : Promise.resolve(null);
                    
                    const [overview, topics, trends, readiness] = await Promise.all([
                        overviewPromise,
                        topicsPromise,
                        trendsPromise,
                        readinessPromise
                    ]);
                    
                    const leaderboardData = await this.fetchData('/api/leaderboard/global').catch(e => null);

                    const executeDOM = () => {
                        this.showLoading();
                        
                        // Graceful degradation: only render what we have
                        if (overview) {
                            this.renderProfile(overview);
                            this.renderGamification(overview);
                            this.renderStats(overview);
                        } else {
                            console.warn('[Intelligence] Overview data unavailable.');
                        }

                        if (isPro && readiness) {
                            this.renderReadiness(readiness);
                        } else {
                            this.renderLockedWidget('readinessChart', 'Exam Readiness', 'Unlock predictive readiness scores & performance estimations.');
                        }

                        if (trends) {
                            this.renderTrends(trends);
                            this.renderHeatmap(trends);
                        }

                        if (isPro && topics) {
                            this.renderMastery(topics);
                            this.renderRecommendations(topics);
                        } else {
                            this.renderLockedWidget('masteryChart', 'Topic Mastery Radar', 'Unlock topic-wise radar charts & personalized drill focus points.');
                            this.renderLockedRecommendations();
                        }

                        console.log('[Intelligence] Engine online. Partial/Full sync complete.');
                        
                        const dashboardEl = document.querySelector('.intel-dashboard');
                        if (dashboardEl) dashboardEl.style.opacity = '1';
                    };

                    if (window.RenderController) {
                        RenderController.commit(executeDOM);
                    } else {
                        executeDOM();
                    }
                    
                } catch (error) {
                    console.error('[Intelligence] Engine fatal failure:', error);
                    window.showToast('System error syncing intelligence data', 'var(--danger)');
                }
                resolve();
            };

            if (window.RenderController) {
                RenderController.commit(fetchAndRender);
            } else {
                fetchAndRender();
            }
        });
    },

    renderLockedWidget(canvasId, title, description) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const card = canvas.closest('.glass');
        if (!card) return;
        
        // Destroy existing chart if any
        const chartKey = canvasId === 'readinessChart' ? 'readiness' : (canvasId === 'masteryChart' ? 'mastery' : null);
        if (chartKey && this.charts[chartKey]) {
            this.charts[chartKey].destroy();
            this.charts[chartKey] = null;
        }

        // Remove existing overlay if any
        const existing = card.querySelector('.premium-locked-overlay');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.className = 'premium-locked-overlay';
        overlay.innerHTML = `
            <i class="fas fa-lock lock-icon"></i>
            <h4>${title}</h4>
            <p>${description}</p>
            <button onclick="document.getElementById('upgradeModal').style.display = 'flex';">Unlock with PRO</button>
        `;
        card.style.position = 'relative';
        card.appendChild(overlay);
    },

    renderLockedRecommendations() {
        const container = document.getElementById('topic-recommendations');
        if (!container) return;
        container.innerHTML = `
            <div class="rec-item locked-rec-item" style="border-left: 4px solid var(--accent); opacity: 0.85;">
                <i class="fas fa-lock" style="color: var(--accent); font-size: 1.2rem; margin-right: 10px;"></i>
                <div class="rec-text">
                    <h4>Personalized Recommendations Gated</h4>
                    <p>Upgrade to Pro to view AI-curated focus points and weak-area drills based on your mock exam performance.</p>
                </div>
                <button class="btn-primary-xs" onclick="document.getElementById('upgradeModal').style.display = 'flex';" style="margin-left: auto;">Upgrade</button>
            </div>
        `;
    },

    async fetchData(url) {
        try {
            const res = await Auth.fetchWithAuth(url);
            if (!res.ok) {
                console.warn(`[Intelligence] API returned ${res.status} for ${url}. May require premium.`);
                return null;
            }
            return res.json();
        } catch (err) {
            console.error(`[Intelligence] Network error for ${url}:`, err);
            return null;
        }
    },

    showLoading() {
        // Simple opacity fade for smooth transition
        const dashEl = document.querySelector('.intel-dashboard');
        if (dashEl) dashEl.style.opacity = '0.7';
    },

    renderProfile(overview) {
        const totalTestsEl = document.getElementById('dash-total-tests');
        if (totalTestsEl) totalTestsEl.textContent = overview.totalTests;
        
        const avgAccEl = document.getElementById('dash-avg-accuracy');
        if (avgAccEl) avgAccEl.textContent = Math.round(overview.avgAccuracy || 0) + '%';
        
        const avgTimeEl = document.getElementById('dash-avg-time');
        if (avgTimeEl) avgTimeEl.textContent = Math.round(overview.avgTimePerTest || 0) + 's';
        
        const user = JSON.parse(localStorage.getItem('np_user_data') || '{}');
        if (user.name) {
            const userNameEl = document.getElementById('dash-user-name');
            if (userNameEl) userNameEl.textContent = user.name;
            
            const userEmailEl = document.getElementById('dash-user-email');
            if (userEmailEl) userEmailEl.textContent = user.email;
            
            const userAvatarEl = document.getElementById('dash-user-avatar');
            if (userAvatarEl) userAvatarEl.src = `https://ui-avatars.com/api/?background=6366f1&color=fff&size=200&bold=true&name=${encodeURIComponent(user.name)}`;
        }
    },

    renderGamification(overview) {
        // XP Formula: (Total Correct * 10) + (Total Tests * 50)
        const totalXP = (overview.totalCorrect * 10) + (overview.totalTests * 50);
        const level = Math.floor(totalXP / 1000) + 1;
        const currentLevelXP = totalXP % 1000;
        const progress = (currentLevelXP / 1000) * 100;

        const prevLevel = parseInt(localStorage.getItem('np_user_level') || '1');
        if (level > prevLevel) {
            window.showToast(`LEVEL UP! You are now Level ${level}`, 'var(--success)', '#fff');
            localStorage.setItem('np_user_level', level);
        }

        const levelEl = document.getElementById('user-level');
        if (levelEl) levelEl.textContent = level;
        
        const xpEl = document.getElementById('user-xp');
        if (xpEl) xpEl.textContent = `${totalXP} XP`;
        
        const xpFillEl = document.getElementById('xp-fill');
        if (xpFillEl) xpFillEl.style.width = `${progress}%`;
        
        const xpRemEl = document.getElementById('xp-remaining');
        if (xpRemEl) xpRemEl.textContent = 1000 - currentLevelXP;
    },

    renderStats(overview) {
        // Update high level metrics
        const totalTestsEl = document.getElementById('dash-total-tests');
        if (totalTestsEl) totalTestsEl.textContent = overview.totalTests;
    },

    renderReadiness(readiness) {
        const ctx = document.getElementById('readinessChart');
        if (!ctx) return;

        const card = ctx.closest('.glass');
        if (card) {
            const overlay = card.querySelector('.premium-locked-overlay');
            if (overlay) overlay.remove();
        }

        if (this.charts.readiness) this.charts.readiness.destroy();

        const score = readiness.score || 0;
        
        this.charts.readiness = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [score, 100 - score],
                    backgroundColor: [
                        score > 70 ? '#10b981' : score > 40 ? '#6366f1' : '#ef4444',
                        'rgba(0,0,0,0.05)'
                    ],
                    borderWidth: 0,
                    circumference: 270,
                    rotation: 225,
                    cutout: '85%',
                    borderRadius: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });

        const readinessValueEl = document.getElementById('readiness-value');
        if (readinessValueEl) readinessValueEl.textContent = `${score}%`;
        
        const readinessConfEl = document.getElementById('readiness-confidence');
        if (readinessConfEl) readinessConfEl.textContent = readiness.confidence || 'Low Confidence';
        
        const readinessMsgEl = document.getElementById('readiness-message');
        if (readinessMsgEl) readinessMsgEl.textContent = readiness.message || 'Keep practicing to improve your score.';
    },

    renderTrends(trends) {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;

        if (this.charts.trends) this.charts.trends.destroy();

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trends.map(t => t._id),
                datasets: [{
                    label: 'Accuracy %',
                    data: trends.map(t => Math.round(t.avgAccuracy)),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#6366f1',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, max: 100, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    renderMastery(topics) {
        const ctx = document.getElementById('masteryChart');
        if (!ctx) return;

        const card = ctx.closest('.glass');
        if (card) {
            const overlay = card.querySelector('.premium-locked-overlay');
            if (overlay) overlay.remove();
        }

        if (this.charts.mastery) this.charts.mastery.destroy();

        const data = topics.all.slice(0, 6); // Top 6 topics for radar

        this.charts.mastery = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.map(t => t.topicName),
                datasets: [{
                    label: 'Mastery',
                    data: data.map(t => Math.round(t.avgAccuracy)),
                    backgroundColor: 'rgba(236, 72, 153, 0.2)',
                    borderColor: '#ec4899',
                    pointBackgroundColor: '#ec4899',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { display: false },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });

        if (data.length > 0) {
            const bestSubEl = document.getElementById('dash-best-subject');
            if (bestSubEl) bestSubEl.textContent = data[0].topicName;
        }
    },

    renderRecommendations(topics) {
        const container = document.getElementById('topic-recommendations');
        if (!container) return;

        const weak = topics.weakest.filter(t => t.avgAccuracy < 60).slice(0, 3);
        
        if (weak.length === 0) {
            container.innerHTML = `
                <div class="rec-item positive">
                    <i class="fas fa-check-circle"></i>
                    <div class="rec-text">
                        <h4>Excellent Coverage</h4>
                        <p>You have no critical weak spots. Continue full mocks to maintain momentum.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = weak.map(t => `
            <div class="rec-item">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="rec-text">
                    <h4>Focus on ${t.topicName}</h4>
                    <p>Accuracy: ${Math.round(t.avgAccuracy)}%. We recommend taking 2 extra drills in this topic.</p>
                </div>
                <button class="btn-primary-xs" onclick="switchPracticeMode('drill')">Practice</button>
            </div>
        `).join('');
    },

    renderHeatmap(trends) {
        const container = document.getElementById('consistency-heatmap');
        if (!container) return;
        
        container.innerHTML = '';
        const today = new Date();
        const activeDates = new Set(trends.map(t => t._id));

        // Create 28 cells for a 4-week lookback
        for (let i = 27; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            if (activeDates.has(dateStr)) cell.classList.add('active');
            cell.title = dateStr;
            container.appendChild(cell);
        }
    },

    async renderGlobalLeaderboard() {
        try {
            const data = await this.fetchData('/api/leaderboard/global');
            const tbody = document.getElementById('recent-tests-body'); // Reusing panel for speed in this phase
            // Wait, I should probably use a dedicated place or just enhance the existing recent tests
        } catch (e) {
            console.error('Leaderboard fetch failed', e);
        }
    }
};

window.Intelligence = Intelligence;


