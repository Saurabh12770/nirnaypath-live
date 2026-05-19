
        // Track Chart.js instances to avoid re-render errors
        const chartInstances = {};

        // 2.1 Mandatory Spinner Timeout
        setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.classList.add('hidden');
                overlay.style.display = 'none';
            }
            console.warn('Loading overlay hidden by timeout.');
        }, 8000);

        // Global spinner functions to handle overlaps
        let spinnerCount = 0;
        function showSpinner() {
            spinnerCount++;
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.classList.remove('hidden');
                overlay.style.display = 'flex';
            }
        }
        function hideSpinner() {
            spinnerCount = Math.max(0, spinnerCount - 1);
            if (spinnerCount === 0) {
                const overlay = document.getElementById('loadingOverlay');
                if (overlay) {
                    overlay.classList.add('hidden');
                    overlay.style.display = 'none';
                }
            }
        }

        // 2.2 Guarantee Overlay Hidden in All fetch Calls
        async function fetchWithOverlay(url, options = {}) {
            showSpinner();
            try {
                const token = Auth.getToken();
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        ...(options.headers || {})
                    }
                });
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error(`Expected JSON but received ${contentType || 'unknown'}`);
                }

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
                return data;
            } catch (error) {
                console.error(`API error [${url}]:`, error.message);
                throw error; // Re-throw so callers can handle it
            } finally {
                hideSpinner();
            }
        }

        const AdminPanel = {
            async init() {
                if (!Auth.isLoggedIn()) {
                    location.href = '/';
                    return;
                }

                // Verify admin role via profile with overlay
                const data = await fetchWithOverlay('/api/user/me');
                if (!data || !data.user || data.user.role !== 'admin') {
                    alert('Unauthorized. Admin access only.');
                    location.href = '/';
                    return;
                }
                document.getElementById('adminName').textContent = data.user.name || 'Admin';

                // Ensure initial sections load properly
                await Promise.allSettled([
                    this.loadStats(),
                    this.loadSubjects()
                ]);
            },

            showSection(id) {
                document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
                const section = document.getElementById(`section-${id}`);
                if (section) section.classList.remove('hidden');
                
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                if (event && event.target) {
                    const navItem = event.target.closest('.nav-item');
                    if (navItem) navItem.classList.add('active');
                }
                
                const titleEl = document.getElementById('sectionTitle');
                if (titleEl) titleEl.textContent = id.charAt(0).toUpperCase() + id.slice(1);
                
                if (id === 'users') this.loadUsers();
                if (id === 'payments') this.loadPayments();
                if (id === 'analytics') this.loadStats();
            },

            async loadStats() {
                try {
                    const rawData = await fetchWithOverlay('/api/admin/stats');
                    
                    // 2.4 Validate All API Responses
                    const data = {
                        users: {
                            total: rawData?.users?.total || 0,
                            pro: rawData?.users?.pro || 0,
                            banned: rawData?.users?.banned || 0
                        },
                        tests: {
                            today: rawData?.tests?.today || 0,
                            week: rawData?.tests?.week || 0,
                            total: rawData?.tests?.total || 0
                        },
                        revenue: rawData?.revenue || 0,
                        activeUsers: rawData?.activeUsers || 0
                    };

                    const grid = document.getElementById('statsGrid');
                    if (grid) {
                        grid.innerHTML = `
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(99,102,241,0.1); color: #6366f1;"><i class="fas fa-users"></i></div>
                                <div><h3>${data.users.total}</h3><p>Total Users</p></div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: #10b981;"><i class="fas fa-clipboard-check"></i></div>
                                <div><h3>${data.tests.total}</h3><p>Tests Taken</p></div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(245,158,11,0.1); color: #f59e0b;"><i class="fas fa-crown"></i></div>
                                <div><h3>${data.users.pro}</h3><p>Pro Members</p></div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i class="fas fa-user-slash"></i></div>
                                <div><h3>${data.users.banned}</h3><p>Banned</p></div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6;"><i class="fas fa-fire"></i></div>
                                <div><h3>${data.activeUsers}</h3><p>Active (7d)</p></div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: #10b981;"><i class="fas fa-indian-rupee-sign"></i></div>
                                <div><h3>₹${data.revenue}</h3><p>Revenue</p></div>
                            </div>
                        `;
                    }
                    this.renderCharts(data);
                } catch (err) {
                    console.error('Failed to load stats:', err);
                }
            },

            renderCharts(data) {
                // Destroy existing charts to prevent "Canvas already in use" error
                if (chartInstances.userChart) { chartInstances.userChart.destroy(); }
                if (chartInstances.activityChart) { chartInstances.activityChart.destroy(); }

                const freeUsers = Math.max(0, data.users.total - data.users.pro - data.users.banned);

                // 2.5 Chart.js Safety
                const userCanvas = document.getElementById('userChart');
                if (userCanvas) {
                    const ctxUser = userCanvas.getContext('2d');
                    if (data.users.total === 0) {
                        ctxUser.clearRect(0, 0, userCanvas.width, userCanvas.height);
                        ctxUser.font = '14px sans-serif';
                        ctxUser.fillStyle = '#94a3b8';
                        ctxUser.textAlign = 'center';
                        ctxUser.fillText('No user data', userCanvas.width / 2, userCanvas.height / 2);
                    } else {
                        chartInstances.userChart = new Chart(ctxUser, {
                            type: 'pie',
                            data: {
                                labels: ['Free', 'Pro', 'Banned'],
                                datasets: [{
                                    data: [freeUsers, data.users.pro, data.users.banned],
                                    backgroundColor: ['#6366f1', '#f59e0b', '#ef4444']
                                }]
                            },
                            options: { plugins: { legend: { position: 'bottom' } } }
                        });
                    }
                }

                const activityCanvas = document.getElementById('activityChart');
                if (activityCanvas) {
                    const ctxActivity = activityCanvas.getContext('2d');
                    if (data.tests.total === 0) {
                        ctxActivity.clearRect(0, 0, activityCanvas.width, activityCanvas.height);
                        ctxActivity.font = '14px sans-serif';
                        ctxActivity.fillStyle = '#94a3b8';
                        ctxActivity.textAlign = 'center';
                        ctxActivity.fillText('No test activity', activityCanvas.width / 2, activityCanvas.height / 2);
                    } else {
                        chartInstances.activityChart = new Chart(ctxActivity, {
                            type: 'bar',
                            data: {
                                labels: ['Today', 'Last 7 Days', 'All Time'],
                                datasets: [{
                                    label: 'Mock Tests Taken',
                                    data: [data.tests.today, data.tests.week, data.tests.total],
                                    backgroundColor: '#1B3A6B'
                                }]
                            },
                            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
                        });
                    }
                }
            },

            async loadSubjects() {
                try {
                    const subjects = await fetchWithOverlay('/api/admin/subjects');
                    if (!Array.isArray(subjects)) return;
                    const select = document.getElementById('subjectSelect');
                    if (!select) return;
                    select.innerHTML = '<option value="">Select a subject...</option>'; // Reset
                    subjects.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s;
                        opt.textContent = s.toUpperCase();
                        select.appendChild(opt);
                    });
                } catch (err) {
                    console.error('Failed to load subjects:', err);
                }
            },

            async loadQuestions() {
                try {
                    const select = document.getElementById('subjectSelect');
                    const sub = select ? select.value : '';
                    if (!sub) return alert('Please select a subject first.');
                    
                    const data = await fetchWithOverlay(`/api/admin/questions/${sub}?limit=100`);
                    const tbody = document.getElementById('questionsTableBody');
                    if (!tbody) return;
                    
                    tbody.innerHTML = '';
                    if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No questions found for this subject.</td></tr>';
                        return;
                    }
                    data.questions.forEach(q => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${q.topic || '-'}</td>
                            <td><span class="tag tag-free">${q.difficulty || '-'}</span></td>
                            <td title="${q.question_en || ''}">${(q.question_en || '').substring(0, 80)}...</td>
                            <td>
                                <button class="admin-btn btn-danger" onclick="AdminPanel.deleteQuestion('${sub}', '${q._id || q.id}')">Del</button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                } catch (err) {
                    alert('Failed to load questions: ' + err.message);
                }
            },

            openQuestionModal() {
                const modal = document.getElementById('questionModal');
                if (modal) modal.style.display = 'flex';
            },

            async loadUsers(query = '') {
                try {
                    const url = query ? `/api/admin/users?search=${encodeURIComponent(query)}` : '/api/admin/users';
                    const data = await fetchWithOverlay(url);
                    const tbody = document.getElementById('usersTableBody');
                    if (!tbody) return;
                    
                    tbody.innerHTML = '';
                    if (!data || !Array.isArray(data.users) || data.users.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No users found.</td></tr>';
                        return;
                    }
                    data.users.forEach(u => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><strong>${u.name || 'Unknown'}</strong><br><small>${u.email || 'No email'}</small></td>
                            <td><span class="tag ${u.plan === 'pro_monthly' ? 'tag-pro' : 'tag-free'}">${u.plan ? u.plan.toUpperCase() : 'FREE'}</span></td>
                            <td><span class="tag" style="background:${u.isActive ? '#dcfce7' : '#fee2e2'}; color:${u.isActive ? '#166534' : '#991b1b'}">${u.isActive ? 'Active' : 'Banned'}</span></td>
                            <td>${u.testsCount || 0}</td>
                            <td>
                                <button class="admin-btn ${u.isActive ? 'btn-danger' : 'btn-success'}" onclick="AdminPanel.toggleUserStatus('${u._id}', ${!u.isActive})">
                                    ${u.isActive ? 'Ban' : 'Unban'}
                                </button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                } catch (err) {
                    console.error('Failed to load users:', err);
                }
            },

            searchUsers(query) {
                if (this.searchTimeout) clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.loadUsers(query);
                }, 300);
            },

            async loadPayments() {
                try {
                    const data = await fetchWithOverlay('/api/admin/payments');
                    const tbody = document.getElementById('paymentsTableBody');
                    if (!tbody) return;
                    
                    tbody.innerHTML = '';
                    let revenue = 0;
                    if (!Array.isArray(data) || data.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No payment records yet.</td></tr>';
                        const revEl = document.getElementById('totalRevenue');
                        if (revEl) revEl.textContent = '₹0';
                        return;
                    }
                    data.forEach(p => {
                        revenue += (p.amount || 0);
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${p.userId?.name || 'Unknown'}</td>
                            <td>${p.planId || '-'}</td>
                            <td>₹${p.amount || 0}</td>
                            <td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td>
                            <td><small>${p.razorpay_payment_id || '-'}</small></td>
                        `;
                        tbody.appendChild(row);
                    });
                    const revEl = document.getElementById('totalRevenue');
                    if (revEl) revEl.textContent = '₹' + revenue;
                } catch (err) {
                    console.error('Failed to load payments:', err);
                }
            },

            async toggleUserStatus(userId, status) {
                try {
                    const result = await fetchWithOverlay(`/api/admin/users/${userId}`, {
                        method: 'PUT',
                        body: JSON.stringify({ isActive: status })
                    });
                    if (result) this.loadUsers();
                } catch (err) {
                    alert('Failed to update user: ' + err.message);
                }
            },

            async deleteQuestion(subject, id) {
                if (!confirm('Delete this question?')) return;
                try {
                    await fetchWithOverlay(`/api/admin/questions/${subject}/${id}`, { method: 'DELETE' });
                    this.loadQuestions();
                } catch (err) {
                    alert('Failed to delete question: ' + err.message);
                }
            },

            async saveQuestion(e) {
                if (e) e.preventDefault();
                const subject = document.getElementById('subjectSelect').value;
                if (!subject) return alert('Select a subject first');

                const id = document.getElementById('q-id').value;
                const payload = {
                    topic: document.getElementById('q-topic').value,
                    difficulty: document.getElementById('q-difficulty').value,
                    question_en: document.getElementById('q-en').value,
                    question_hi: document.getElementById('q-hi').value,
                    options_en: [
                        document.getElementById('q-opt0').value,
                        document.getElementById('q-opt1').value,
                        document.getElementById('q-opt2').value,
                        document.getElementById('q-opt3').value
                    ],
                    explanation_en: document.getElementById('q-exp-en').value,
                    explanation_hi: document.getElementById('q-exp-hi').value,
                    correctAnswer: 0 // First option is always correct in this simple form
                };

                try {
                    const method = id ? 'PUT' : 'POST';
                    const url = id ? `/api/admin/questions/${subject}/${id}` : `/api/admin/questions/${subject}`;
                    await fetchWithOverlay(url, {
                        method,
                        body: JSON.stringify(payload)
                    });
                    alert('Question saved successfully!');
                    this.closeModal();
                    this.loadQuestions();
                } catch (err) {
                    alert('Error saving question: ' + err.message);
                }
            },

            closeModal() {
                const modal = document.getElementById('questionModal');
                if (modal) modal.style.display = 'none';
                document.getElementById('questionForm').reset();
                document.getElementById('q-id').value = '';
            }
        };

        // Attach form submit listener
        document.getElementById('questionForm')?.addEventListener('submit', (e) => AdminPanel.saveQuestion(e));

        // 2.3 Remove Any Remaining Spinner Instances
        // Ensure spinner is hidden on any unhandled rejections or errors
        window.addEventListener('unhandledrejection', hideSpinner);
        window.addEventListener('error', hideSpinner);

        // ════════ ADMIN LIVE SESSIONS ════════
        const AdminLive = {
            async createSession(e) {
                e.preventDefault();
                const payload = {
                    exam: document.getElementById('liveExam').value,
                    subject: document.getElementById('liveSubject').value,
                    startTime: document.getElementById('liveStartTime').value,
                    duration: document.getElementById('liveDuration').value,
                    questionCount: document.getElementById('liveQuestionCount').value
                };

                showSpinner();
                try {
                    const res = await fetchWithOverlay('/api/admin/live-sessions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    alert(`✅ Session created with ${res.questions.length} questions!`);
                    document.getElementById('createLiveSessionForm').reset();
                    this.loadSessions();
                } catch (err) {
                    alert('❌ Error: ' + (err.message || 'Failed to create session'));
                } finally {
                    hideSpinner();
                }
            },

            async loadSessions() {
                const tbody = document.getElementById('liveSessionsTableBody');
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';
                try {
                    const sessions = await fetchWithOverlay('/api/admin/live-sessions');
                    if (!sessions.length) {
                        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;">No sessions found.</td></tr>';
                        return;
                    }

                    const statusColors = { upcoming: '#f59e0b', live: '#10b981', ended: '#6b7280' };
                    tbody.innerHTML = sessions.map(s => `
                        <tr>
                            <td><strong>${s.exam.toUpperCase()}</strong> / ${s.subject}</td>
                            <td>${new Date(s.startTime).toLocaleString('en-IN')}</td>
                            <td>${s.duration} min</td>
                            <td>${s.questions.length}</td>
                            <td>${s.registeredUsers.length}</td>
                            <td><span style="background:${statusColors[s.status]}20;color:${statusColors[s.status]};padding:3px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;">${s.status.toUpperCase()}</span></td>
                            <td>
                                ${s.status === 'upcoming' ? `<button class="admin-btn" style="background:#ef4444;color:white;padding:6px 12px;" onclick="AdminLive.deleteSession('${s._id}')"><i class="fas fa-trash"></i> Cancel</button>` : ''}
                                <a href="/live-leaderboard.html?sessionId=${s._id}" target="_blank" class="admin-btn" style="padding:6px 12px;text-decoration:none;"><i class="fas fa-trophy"></i></a>
                            </td>
                        </tr>
                    `).join('');
                } catch (err) {
                    tbody.innerHTML = '<tr><td colspan="7" style="color:red;text-align:center;">Failed to load sessions.</td></tr>';
                }
            },

            async deleteSession(id) {
                if (!confirm('Cancel this upcoming session? This cannot be undone.')) return;
                showSpinner();
                try {
                    await fetchWithOverlay(`/api/admin/live-sessions/${id}`, { method: 'DELETE' });
                    alert('Session cancelled.');
                    this.loadSessions();
                } catch (err) {
                    alert('Error: ' + (err.message || 'Could not delete session'));
                } finally {
                    hideSpinner();
                }
            }
        };

        document.addEventListener('DOMContentLoaded', () => {
            AdminPanel.init().catch(err => {
                console.error("Admin init error:", err);
                hideSpinner();
            });
        });
    

// --- Event Delegation (CSP Safe) ---
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    if (action === 'delete-question') AdminPanel.deleteQuestion(btn.getAttribute('data-sub'), btn.getAttribute('data-id'));
    if (action === 'toggle-user') AdminPanel.toggleUserStatus(btn.getAttribute('data-id'), btn.getAttribute('data-status') === 'true');
    if (action === 'delete-session') AdminLive.deleteSession(btn.getAttribute('data-id'));
});
// --- Static Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    bind('nav-analytics', () => AdminPanel.showSection('analytics'));
    bind('nav-questions', () => AdminPanel.showSection('questions'));
    bind('nav-users', () => AdminPanel.showSection('users'));
    bind('nav-payments', () => AdminPanel.showSection('payments'));
    bind('nav-live-sessions', () => AdminPanel.showSection('live-sessions'));
    bind('nav-home', () => location.href = '/');
    bind('btn-logout', () => Auth.logout());
    bind('btn-fetch-questions', () => AdminPanel.loadQuestions());
    bind('btn-add-question', () => AdminPanel.openQuestionModal());
    bind('btn-refresh-sessions', () => AdminLive.loadSessions());
    document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', () => AdminPanel.closeModal()));
});
