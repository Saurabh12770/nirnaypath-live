/**
 * NirnayPath Dashboard System
 * Handles Performance Stats, Streak, and Recent Tests
 */

const Dashboard = {
    async show() {
        return new Promise((resolve) => {
            const fetchAndRender = async () => {
                if (!Auth.isLoggedIn()) {
                    document.getElementById('loginModal').style.display = 'flex';
                    resolve();
                    return;
                }

                const execViewToggle = () => {
                    if (typeof showView === 'function') {
                        showView('userDashboard');
                    } else {
                        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
                        document.getElementById('user-dashboard').classList.add('active');
                    }
                    window.scrollTo(0, 0);
                };

                if (window.RenderController) RenderController.register(execViewToggle);
                else execViewToggle();

                await this.loadData();
                if (window.Intelligence) {
                    await window.Intelligence.init();
                }
                resolve();
            };

            if (window.RenderController) RenderController.register(fetchAndRender);
            else fetchAndRender();
        });
    },

    async loadData() {
        try {
            const signal = window.AsyncManager ? AsyncManager.getSignal('dashboard_load') : undefined;
            // Fetch all required data concurrently
            const [profileRes, statsRes, lbRes] = await Promise.all([
                Auth.fetchWithAuth('/api/user/me', { signal }),
                Auth.fetchWithAuth('/api/user/stats', { signal }),
                Auth.fetchWithAuth('/api/leaderboard/upsc', { signal }).catch(err => {
                    console.warn('Leaderboard fetch failed:', err);
                    return { ok: false, status: 500 };
                })
            ]);

            if (profileRes.status === 401 || statsRes.status === 401) {
                Auth.logout();
                return;
            }

            if (profileRes.ok && statsRes.ok) {
                const profileData = await profileRes.json();
                const statsData = await statsRes.json();
                let lbData = [];
                if (lbRes && lbRes.ok) lbData = await lbRes.json();

                if (window.AppState) {
                    AppState.dispatch('dashboard', {
                        profile: profileData,
                        stats: statsData,
                        leaderboard: lbData
                    });
                } else {
                    this.profileData = profileData;
                    this.statsData = statsData;
                }
                
                const currentState = window.AppState ? AppState.getState().dashboard : { profile: profileData, stats: statsData, leaderboard: lbData };
                const viewModel = this.buildDashboardViewModel(currentState.profile, currentState.stats, currentState.leaderboard);
                
                if (window.RenderController) {
                    RenderController.commit(() => this.renderAtomic(viewModel));
                } else {
                    this.renderAtomic(viewModel);
                }
            } else {
                this.showToast('Failed to load performance data');
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading dashboard data:', error);
        }
    },

    buildDashboardViewModel(profile, stats, lbData) {
        return {
            user: profile.user,
            badges: profile.user.badges || [],
            stats: stats,
            recentTests: profile.recentTests || [],
            leaderboard: lbData
        };
    },

    renderAtomic(vm) {
        this.renderDashboard(vm, vm.stats);
        if (vm.leaderboard) {
            this.renderLeaderboard(vm.leaderboard);
        }
    },

    BADGE_METADATA: {
        'streak7': { name: '7-Day Warrior', desc: 'Maintain a 7-day test streak', icon: 'ðŸ”¥' },
        'test30': { name: 'Prolific Learner', desc: 'Complete 30 mock tests', icon: 'ðŸ“š' },
        'perfect100': { name: 'Century Club', desc: 'Achieve 100% accuracy in a test', icon: 'ðŸŽ¯' },
        'test100': { name: 'Nirnay Path Hero', description: 'Complete 100 mock tests', icon: 'ðŸ†' }
    },

    renderDashboard(profile, stats) {
        // User Info
        const nameDisplay = document.getElementById('dash-user-name');
        if (nameDisplay) {
            nameDisplay.textContent = profile.user.name;
            if (profile.user.plan === 'pro_monthly') {
                const badge = document.createElement('span');
                badge.className = 'pro-badge';
                badge.textContent = 'PRO';
                nameDisplay.appendChild(badge);
            }
        }

        const emailDisplay = document.getElementById('dash-user-email');
        if (emailDisplay) {
            emailDisplay.textContent = profile.user.email;
        }
        
        // Show Upgrade CTA if free
        const upgradeCTA = document.getElementById('dashboard-upgrade-cta');
        if (upgradeCTA) {
            upgradeCTA.style.display = profile.user.plan === 'free' ? 'block' : 'none';
        }

        const streakDisplay = document.getElementById('dash-streak');
        if (streakDisplay) {
            streakDisplay.textContent = profile.user.streakCount || profile.streak || 0;
        }

        const avatarDisplay = document.getElementById('dash-user-avatar');
        if (avatarDisplay) {
            avatarDisplay.src = `https://ui-avatars.com/api/?background=6366f1&color=fff&size=100&bold=true&name=${encodeURIComponent(profile.user.name)}`;
        }

        // Badges
        const badgesContainer = document.getElementById('badges-container');
        if (badgesContainer) {
            badgesContainer.innerHTML = '';
            const userBadges = profile.user.badges || [];
            if (userBadges.length === 0) {
                badgesContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">No badges earned yet. Complete tests to earn badges!</span>';
            } else {
                userBadges.forEach(badgeCode => {
                    const meta = this.BADGE_METADATA[badgeCode];
                    if (meta) {
                        const badgeEl = document.createElement('div');
                        badgeEl.className = 'badge-item';
                        badgeEl.setAttribute('data-description', meta.desc);
                        badgeEl.innerHTML = `
                            <span class="badge-icon">${meta.icon}</span>
                            <span class="badge-name">${meta.name}</span>
                        `;
                        badgesContainer.appendChild(badgeEl);
                    }
                });
            }
        }

        // Summary Stats
        const totalTestsDisplay = document.getElementById('dash-total-tests');
        if (totalTestsDisplay) {
            totalTestsDisplay.textContent = stats.totalTests;
        }
        const avgAccuracyDisplay = document.getElementById('dash-avg-accuracy');
        if (avgAccuracyDisplay) {
            avgAccuracyDisplay.textContent = stats.avgAccuracy + '%';
        }

        // Recent Tests Table
        const tbody = document.getElementById('recent-tests-body');
        if (tbody) {
            tbody.innerHTML = '';
            
            if (!profile.recentTests || profile.recentTests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">No tests taken yet. Start your first mock test!</td></tr>';
            } else {
                profile.recentTests.forEach(test => {
                    const row = document.createElement('tr');
                    const date = new Date(test.createdAt).toLocaleDateString();
                    row.innerHTML = `
                        <td>${date}</td>
                        <td><span class="exam-tag">${test.exam.toUpperCase()}</span> ${test.subject}</td>
                        <td><strong>${test.score}/${test.totalQuestions}</strong></td>
                        <td><div class="accuracy-pill ${this.getAccuracyClass(test.accuracy)}">${test.accuracy}%</div></td>
                        <td><button class="view-btn" onclick="Dashboard.viewResult('${test._id}')">Review</button></td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }

        // Subject Analysis
        const statsContainer = document.getElementById('subject-stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = '';
            
            const subjects = Object.keys(stats.subjectStats || {});
            if (subjects.length === 0) {
                statsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Take tests in different subjects to see analysis.</p>';
            } else {
                subjects.forEach(sub => {
                    const score = stats.subjectStats[sub];
                    const card = document.createElement('div');
                    card.className = 'subject-stat-card';
                    card.innerHTML = `
                        <div class="sub-header">
                            <span>${sub}</span>
                            <span>${score}%</span>
                        </div>
                        <div class="sub-progress">
                            <div class="sub-progress-fill" style="width: ${score}%; background: ${this.getScoreColor(score)}"></div>
                        </div>
                    `;
                    statsContainer.appendChild(card);
                });
            }
        }
    },

    getAccuracyClass(acc) {
        if (acc >= 80) return 'acc-high';
        if (acc >= 50) return 'acc-mid';
        return 'acc-low';
    },

    getScoreColor(score) {
        if (score >= 80) return '#10b981'; // green
        if (score >= 60) return '#6366f1'; // blue
        if (score >= 40) return '#f59e0b'; // amber
        return '#ef4444'; // red
    },

    async viewResult(id) {
        try {
            const signal = window.AsyncManager ? AsyncManager.getSignal('dashboard_view_result') : undefined;
            let currentState = window.AppState ? AppState.getState().dashboard : { profile: this.profileData, stats: this.statsData };
            
            let profile = currentState.profile;
            let stats = currentState.stats;
            
            if (!profile || !stats) {
                const res = await Auth.fetchWithAuth(`/api/user/stats`, { signal });
                stats = await res.json();
                const profileRes = await Auth.fetchWithAuth(`/api/user/me`, { signal });
                profile = await profileRes.json();
                
                if (window.AppState) {
                    AppState.dispatch('dashboard', { profile, stats });
                } else {
                    this.profileData = profile;
                    this.statsData = stats;
                }
            }
            
            const test = profile.recentTests.find(t => t._id === id);
            if (!test) return this.showToast('Test record not found');

            const viewModel = {
                subject: test.subject,
                date: new Date(test.createdAt).toLocaleDateString(),
                score: test.score,
                total: test.totalQuestions,
                accuracy: test.accuracy,
                correct: test.correct || 0,
                wrong: test.incorrect || 0
            };

            const execRender = () => {
                document.getElementById('review-test-meta').textContent = `Subject: ${viewModel.subject} | Date: ${viewModel.date}`;
                document.getElementById('rev-score').textContent = `${viewModel.score}/${viewModel.total}`;
                document.getElementById('rev-acc').textContent = `${viewModel.accuracy}%`;
                document.getElementById('rev-correct').textContent = viewModel.correct;
                document.getElementById('rev-wrong').textContent = viewModel.wrong;
                
                const insights = document.getElementById('review-insights-list');
                insights.innerHTML = '';
                if (viewModel.accuracy >= 80) {
                    insights.innerHTML += '<li>Exceptional accuracy! You have a strong grasp of this subject.</li>';
                    insights.innerHTML += '<li>Tip: Try increasing your speed to gain a competitive edge.</li>';
                } else if (viewModel.accuracy >= 50) {
                    insights.innerHTML += '<li>Stable performance. Consistency is key to improvement.</li>';
                    insights.innerHTML += '<li>Tip: Review your incorrect answers to identify specific weak topics.</li>';
                } else {
                    insights.innerHTML += '<li>Requires focus. Re-read the fundamental concepts of this subject.</li>';
                    insights.innerHTML += '<li>Tip: Practice 10-15 questions daily in this category to build confidence.</li>';
                }

                document.getElementById('reviewModal').style.display = 'flex';
            };

            if (window.RenderController) RenderController.commit(execRender);
            else execRender();
        } catch (e) {
            if (e.name === 'AbortError') return;
            console.error(e);
            this.showToast('Could not load test report');
        }
    },

    async loadLeaderboard(exam) {
        try {
            const signal = window.AsyncManager ? AsyncManager.getSignal('dashboard_leaderboard') : undefined;
            const res = await Auth.fetchWithAuth(`/api/leaderboard/${exam}`, { signal });
            const data = await res.json();
            if (res.ok) {
                if (window.AppState) AppState.dispatch('dashboard', { leaderboard: data });
                const currentState = window.AppState ? AppState.getState().dashboard : { leaderboard: data };
                const execRender = () => this.renderLeaderboard(currentState.leaderboard);
                if (window.RenderController) RenderController.commit(execRender);
                else execRender();
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading leaderboard:', error);
        }
    },

    renderLeaderboard(data) {
        const tbody = document.getElementById('leaderboard-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No results for this exam in the last 7 days.</td></tr>';
            return;
        }

        data.forEach(entry => {
            const row = document.createElement('tr');
            const rankClass = entry.rank <= 3 ? `rank-${entry.rank}` : 'rank-other';
            row.innerHTML = `
                <td><div class="rank-badge ${rankClass}">${entry.rank}</div></td>
                <td><strong>${entry.userName}</strong></td>
                <td>${entry.totalScore}</td>
                <td>${entry.testsCount} tests</td>
            `;
            tbody.appendChild(row);
        });
    },

    showToast(msg) {
        if (window.showToast) {
            window.showToast(msg, 'var(--primary)', '#fff');
        } else {
            alert(msg);
        }
    }
};


