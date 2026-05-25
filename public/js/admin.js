
if (window.__adminScriptLoaded) {
    console.warn("admin.js already loaded, skipping execution.");
} else {
    window.__adminScriptLoaded = true;

    // Track Chart.js instances to avoid re-render errors
    const chartInstances = {};

    // Concurrency / Request registry for AbortController
    const activeControllers = {};
    function startFetch(key) {
        if (activeControllers[key]) {
            try {
                activeControllers[key].abort();
            } catch (e) {}
        }
        activeControllers[key] = new AbortController();
        return activeControllers[key].signal;
    }

    // Helper to escape HTML characters for safe rendering
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

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
            const headers = {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Expected JSON but received ${contentType || 'unknown'}`);
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(`Fetch aborted for URL: ${url}`);
                throw error;
            }
            console.error(`API error [${url}]:`, error.message);
            throw error; // Re-throw so callers can handle it
        } finally {
            hideSpinner();
        }
    }

    const AdminPanel = {
        async init() {
            // NOTE: Do NOT gate on Auth.isLoggedIn() here.
            // Auth.init() is async Ã¢â‚¬â€ its checkAuthStatus() fetch may not have
            // completed yet when initAdminModule() fires on DOMContentLoaded.
            // The /api/user/me call below is the single source of truth for auth.

            // Verify admin role via profile with overlay
            const data = await fetchWithOverlay('/api/user/me');
            if (!data || !data.user || data.user.role !== 'admin') {
                alert('Unauthorized. Admin access only.');
                location.href = '/';
                return;
            }
            document.getElementById('adminName').textContent = data.user.name || 'Admin';

            // Ensure initial sections load properly based on current hash to avoid double concurrent stats fetch
            const initialSection = window.location.hash.slice(1) || 'analytics';
            const initPromises = [this.loadSubjects()];
            if (initialSection !== 'analytics') {
                initPromises.push(this.loadStats());
            }

            await Promise.allSettled(initPromises);
            this.showSection(initialSection);
        },

        showSection(id) {
            const validSections = ['analytics', 'questions', 'users', 'payments', 'live-sessions', 'telemetry'];
            if (!validSections.includes(id)) {
                id = 'analytics';
            }

            const execDOM = () => {
                document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
                const section = document.getElementById(`section-${id}`);
                if (section) section.classList.remove('hidden');
                
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                const navItem = document.getElementById(`nav-${id}`);
                if (navItem) navItem.classList.add('active');
                
                const titleEl = document.getElementById('sectionTitle');
                if (titleEl) {
                    titleEl.textContent = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                }
            };
            if (window.RenderController) RenderController.commit(execDOM);
            else execDOM();
            
            if (id === 'users') this.loadUsers();
            if (id === 'payments') this.loadPayments();
            if (id === 'analytics') this.loadStats();
            if (id === 'live-sessions') AdminLive.loadSessions();
            if (id === 'telemetry') this.loadTelemetry();
        },

        async loadTelemetry() {
            const signal = startFetch('loadTelemetry');
            try {
                const data = await fetchWithOverlay('/api/telemetry/overview', { signal });
                
                const execDOM = () => {
                const grid = document.getElementById('telemetryStatsGrid');
                if (grid) {
                    grid.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-icon" style="background: rgba(99,102,241,0.1); color: #6366f1;"><i class="fas fa-users"></i></div>
                            <h3>${data.activeUsersCount || 0}</h3>
                            <p>Active Clients</p>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i class="fas fa-exclamation-triangle"></i></div>
                            <h3>${data.errorCount || 0}</h3>
                            <p>Total Errors Tracked</p>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: rgba(245,158,11,0.1); color: #f59e0b;"><i class="fas fa-stopwatch"></i></div>
                            <h3>${data.slowApis ? data.slowApis.length : 0}</h3>
                            <p>Recent Slow APIs</p>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: #10b981;"><i class="fas fa-clock"></i></div>
                            <h3>${Math.round((data.avgSessionDurationMs || 0) / 1000)}s</h3>
                            <p>Avg Session Time</p>
                        </div>
                    `;
                }

                const errorsBody = document.getElementById('telemetryErrorsBody');
                if (errorsBody && data.recentErrors) {
                    if (data.recentErrors.length === 0) {
                        errorsBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#888;">No errors tracked.</td></tr>';
                    } else {
                        errorsBody.innerHTML = data.recentErrors.map(e => `
                            <tr>
                                <td>${new Date(e.timestamp).toLocaleTimeString()}</td>
                                <td>${e.message || 'Unknown Error'}</td>
                                <td>${e.source || 'N/A'}</td>
                            </tr>
                        `).join('');
                    }
                }

                const slowApisBody = document.getElementById('telemetrySlowApisBody');
                if (slowApisBody && data.slowApis) {
                    if (data.slowApis.length === 0) {
                        slowApisBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">No slow requests tracked.</td></tr>';
                    } else {
                        slowApisBody.innerHTML = data.slowApis.map(req => `
                            <tr>
                                <td>${req.url}</td>
                                <td>${req.duration}</td>
                                <td>${req.status}</td>
                                <td>${new Date(req.timestamp).toLocaleTimeString()}</td>
                            </tr>
                        `).join('');
                    }
                }

                // Render memory chart if data exists
                if (data.memoryTrend && data.memoryTrend.length > 0 && typeof Chart !== 'undefined') {
                    const ctx = document.getElementById('memoryTrendChart');
                    if (ctx) {
                        if (chartInstances.memoryChart) {
                            try { chartInstances.memoryChart.destroy(); } catch(e){}
                        }
                        chartInstances.memoryChart = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: data.memoryTrend.map(m => new Date(m.timestamp).toLocaleTimeString()),
                                datasets: [{
                                    label: 'JS Heap Size (MB)',
                                    data: data.memoryTrend.map(m => Math.round((m.usedJSHeapSize || 0) / 1024 / 1024)),
                                    borderColor: '#6366f1',
                                    tension: 0.4,
                                    fill: true,
                                    backgroundColor: 'rgba(99,102,241,0.1)'
                                }]
                            },
                            options: { responsive: true, maintainAspectRatio: false }
                        });
                    }
                }
                };
                if (window.RenderController) RenderController.commit(execDOM);
                else execDOM();

            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('Failed to load telemetry:', err);
            }
        },

        async loadStats() {
            const signal = startFetch('loadStats');
            try {
                const rawData = await fetchWithOverlay('/api/admin/stats', { signal });
                
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

                const execDOM = () => {
                const grid = document.getElementById('statsGrid');
                if (grid) {
                    grid.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-icon" style="background: rgba(99,102,241,0.1); color: #6366f1;"><i class="fas fa-users"></i></div>
                            <h3>${data.users.total}</h3>
                            <p>Total Users</p>
                            <span class="stat-trend positive"><i class="fas fa-arrow-up"></i> +4% vs last week</span>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: #10b981;"><i class="fas fa-clipboard-check"></i></div>
                            <h3>${data.tests.total}</h3>
                            <p>Tests Taken</p>
                            <span class="stat-trend positive"><i class="fas fa-arrow-up"></i> +8% vs last week</span>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: rgba(245,158,11,0.1); color: #f59e0b;"><i class="fas fa-crown"></i></div>
                            <h3>${data.users.pro}</h3>
                            <p>Pro Members</p>
                            <span class="stat-trend positive"><i class="fas fa-arrow-up"></i> +15% vs last week</span>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i class="fas fa-user-slash"></i></div>
                            <h3>${data.users.banned}</h3>
                            <p>Banned</p>
                            <span class="stat-trend neutral"><i class="fas fa-minus"></i> Stable</span>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6;"><i class="fas fa-fire"></i></div>
                            <h3>${data.activeUsers}</h3>
                            <p>Active (7d)</p>
                            <span class="stat-trend positive"><i class="fas fa-arrow-up"></i> +6% vs last week</span>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: #10b981;"><i class="fas fa-indian-rupee-sign"></i></div>
                            <h3>Ã¢â€šÂ¹${data.revenue}</h3>
                            <p>Revenue</p>
                            <span class="stat-trend positive"><i class="fas fa-arrow-up"></i> +12% vs last week</span>
                        </div>
                    `;
                }
                this.renderCharts(data);
                };
                if (window.RenderController) RenderController.commit(execDOM);
                else execDOM();
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('Failed to load stats:', err);
                // Show visible error in statsGrid so admins know why it is empty
                const execError = () => {
                const grid = document.getElementById('statsGrid');
                if (grid && grid.innerHTML.trim() === '') {
                    grid.innerHTML = `<div class="stat-card" style="grid-column:1/-1;border-left:4px solid var(--admin-danger);">
                        <div class="stat-icon" style="background:rgba(239,68,68,0.1);color:#ef4444;"><i class="fas fa-exclamation-triangle"></i></div>
                        <h3 style="font-size:1rem;color:#ef4444;">Stats Unavailable</h3>
                        <p style="text-transform:none;font-size:0.85rem;">API error: ${err.message || 'Could not reach /api/admin/stats'}. Check server logs.</p>
                    </div>`;
                }
                };
                if (window.RenderController) RenderController.commit(execError);
                else execError();
            }
        },

        renderCharts(data) {
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js is not loaded yet. Retrying in 200ms...');
                setTimeout(() => this.renderCharts(data), 200);
                return;
            }

            // Destroy existing charts to prevent "Canvas already in use" error
            if (chartInstances.userChart) { 
                try {
                    chartInstances.userChart.destroy(); 
                } catch (e) {}
                delete chartInstances.userChart;
            }
            if (chartInstances.activityChart) { 
                try {
                    chartInstances.activityChart.destroy(); 
                } catch (e) {}
                delete chartInstances.activityChart;
            }

            // Clone and replace canvas elements to purge listeners attached by Chart.js
            let userCanvas = document.getElementById('userChart');
            if (userCanvas) {
                const clone = userCanvas.cloneNode(true);
                userCanvas.replaceWith(clone);
                userCanvas = clone;
            }
            let activityCanvas = document.getElementById('activityChart');
            if (activityCanvas) {
                const clone = activityCanvas.cloneNode(true);
                activityCanvas.replaceWith(clone);
                activityCanvas = clone;
            }

            const freeUsers = Math.max(0, data.users.total - data.users.pro - data.users.banned);

            // 2.5 Chart.js Safety
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
                        type: 'doughnut',
                        data: {
                            labels: ['Free', 'Pro', 'Banned'],
                            datasets: [{
                                data: [freeUsers, data.users.pro, data.users.banned],
                                backgroundColor: ['#1B3A6B', '#f59e0b', '#ef4444'],
                                borderWidth: 2,
                                borderColor: '#ffffff'
                            }]
                        },
                        options: { 
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: { legend: { position: 'bottom' } } 
                        }
                    });
                }
            }

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
                                backgroundColor: '#1B3A6B',
                                borderRadius: 6,
                                maxBarThickness: 40
                            }]
                        },
                        options: { 
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } }, 
                            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } 
                        }
                    });
                }
            }
        },

        async loadSubjects() {
            const signal = startFetch('loadSubjects');
            try {
                const subjects = await fetchWithOverlay('/api/admin/subjects', { signal });
                if (!Array.isArray(subjects)) return;
                const execDOM = () => {
                const select = document.getElementById('subjectSelect');
                if (!select) return;
                select.innerHTML = '<option value="">Select a subject...</option>'; // Reset
                subjects.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s;
                    opt.textContent = s.toUpperCase();
                    select.appendChild(opt);
                });
                };
                if (window.RenderController) RenderController.commit(execDOM);
                else execDOM();
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('Failed to load subjects:', err);
            }
        },

        async loadQuestions() {
            const signal = startFetch('loadQuestions');
            const tbody = document.getElementById('questionsTableBody');
            if (!tbody) return;
            try {
                const select = document.getElementById('subjectSelect');
                const sub = select ? select.value : '';
                if (!sub) return alert('Please select a subject first.');
                
                const execLoading = () => { tbody.innerHTML = '<tr><td colspan="4"><div class="table-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div></td></tr>'; };
                if (window.RenderController) RenderController.commit(execLoading);
                else execLoading();
                
                const data = await fetchWithOverlay(`/api/admin/questions/${sub}?limit=100`, { signal });
                
                const execDOM = () => {
                tbody.innerHTML = '';
                if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4"><div class="table-empty">No questions found for this subject.</div></td></tr>';
                    return;
                }
                
                const rows = data.questions.map(q => `
                    <tr>
                        <td>${escapeHTML(q.topic || '-')}</td>
                        <td><span class="tag tag-free">${escapeHTML(q.difficulty || '-')}</span></td>
                        <td title="${escapeHTML(q.question_en || '')}">${escapeHTML((q.question_en || '').substring(0, 80))}...</td>
                        <td>
                            <button class="admin-btn btn-danger" data-action="delete-question" data-sub="${sub}" data-id="${q._id || q.id}">Del</button>
                        </td>
                    </tr>
                `).join('');
                tbody.innerHTML = rows;
                };
                if (window.RenderController) RenderController.commit(execDOM);
                else execDOM();
            } catch (err) {
                if (err.name === 'AbortError') return;
                const execError = () => { tbody.innerHTML = '<tr><td colspan="4"><div class="table-error">Failed to load questions: ' + err.message + '</div></td></tr>'; };
                if (window.RenderController) RenderController.commit(execError);
                else execError();
            }
        },

        openQuestionModal() {
            const modal = document.getElementById('questionModal');
            if (modal) modal.style.display = 'flex';
        },

        async loadUsers(query = '') {
            const signal = startFetch('loadUsers');
            const tbody = document.getElementById('usersTableBody');
            if (!tbody) return;
            const execLoading = () => { tbody.innerHTML = '<tr><td colspan="5"><div class="table-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div></td></tr>'; };
            if (window.RenderController) RenderController.commit(execLoading);
            else execLoading();
            
            try {
                const url = query ? `/api/admin/users?search=${encodeURIComponent(query)}` : '/api/admin/users';
                const data = await fetchWithOverlay(url, { signal });
                
                const execDOM = () => {
                tbody.innerHTML = '';
                if (!data || !Array.isArray(data.users) || data.users.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5"><div class="table-empty">No users found.</div></td></tr>';
                    return;
                }
                const rows = data.users.map(u => `
                    <tr>
                        <td><strong>${escapeHTML(u.name || 'Unknown')}</strong><br><small>${escapeHTML(u.email || 'No email')}</small></td>
                        <td><span class="tag ${u.plan === 'pro_monthly' ? 'tag-pro' : 'tag-free'}">${u.plan ? u.plan.toUpperCase() : 'FREE'}</span></td>
                        <td><span class="tag" style="background:${u.isActive ? '#dcfce7' : '#fee2e2'}; color:${u.isActive ? '#166534' : '#991b1b'}">${u.isActive ? 'Active' : 'Banned'}</span></td>
                        <td>${u.testsCount || 0}</td>
                        <td>
                            <button class="admin-btn ${u.isActive ? 'btn-danger' : 'btn-success'}" data-action="toggle-user" data-id="${u._id}" data-status="${!u.isActive}">
                                ${u.isActive ? 'Ban' : 'Unban'}
                            </button>
                        </td>
                    </tr>
                `).join('');
                tbody.innerHTML = rows;
                };
                if (window.RenderController) RenderController.commit(execDOM);
                else execDOM();
            } catch (err) {
                if (err.name === 'AbortError') return;
                const execError = () => { tbody.innerHTML = '<tr><td colspan="5"><div class="table-error">Failed to load users: ' + err.message + '</div></td></tr>'; };
                if (window.RenderController) RenderController.commit(execError);
                else execError();
            }
        },

        searchUsers(query) {
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.loadUsers(query);
            }, 300);
        },

        async loadPayments() {
            const signal = startFetch('loadPayments');
            const tbody = document.getElementById('paymentsTableBody');
            if (!tbody) return;
            const execLoading = () => { tbody.innerHTML = '<tr><td colspan="5"><div class="table-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div></td></tr>'; };
            if (window.RenderController) RenderController.commit(execLoading);
            else execLoading();
            
            try {
                const data = await fetchWithOverlay('/api/admin/payments', { signal });
                
                const execDOM = () => {
                tbody.innerHTML = '';
                let revenue = 0;
                if (!Array.isArray(data) || data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5"><div class="table-empty">No payment records yet.</div></td></tr>';
                    const revEl = document.getElementById('totalRevenue');
                    if (revEl) revEl.textContent = 'Ã¢â€šÂ¹0';
                    return;
                }
                
                const rows = data.map(p => {
                    revenue += (p.amount || 0);
                    return `
                        <tr>
                            <td>${escapeHTML(p.userId?.name || 'Unknown')}</td>
                            <td>${escapeHTML(p.planId || '-')}</td>
                            <td>Ã¢â€šÂ¹${p.amount || 0}</td>
                            <td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td>
                            <td><small>${escapeHTML(p.razorpay_payment_id || '-')}</small></td>
                        </tr>
                    `;
                }).join('');
                
                tbody.innerHTML = rows;
                const revEl = document.getElementById('totalRevenue');
                if (revEl) revEl.textContent = 'Ã¢â€šÂ¹' + revenue;
                };
                if (window.RenderController) RenderController.commit(execDOM);
                else execDOM();
            } catch (err) {
                if (err.name === 'AbortError') return;
                const execError = () => { tbody.innerHTML = '<tr><td colspan="5"><div class="table-error">Failed to load payments: ' + err.message + '</div></td></tr>'; };
                if (window.RenderController) RenderController.commit(execError);
                else execError();
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
                correctAnswer: parseInt(document.getElementById('q-correct-answer')?.value || '0')
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
            if (modal && modal.style.display !== 'none') {
                modal.style.display = 'none';
                document.getElementById('questionForm').reset();
                document.getElementById('q-id').value = '';
            }
        }
    };

// 2.3 Remove Any Remaining Spinner Instances
// Ensure spinner is hidden on any unhandled rejections or errors
window.addEventListener('unhandledrejection', hideSpinner);
window.addEventListener('error', hideSpinner);

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â ADMIN LIVE SESSIONS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    const AdminLive = {
        async createSession(e) {
            if (e) e.preventDefault();
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
                alert(`Ã¢Å“â€¦ Session created with ${res.questions.length} questions!`);
                document.getElementById('createLiveSessionForm').reset();
                this.loadSessions();
            } catch (err) {
                alert('Ã¢ÂÅ’ Error: ' + (err.message || 'Failed to create session'));
            } finally {
                hideSpinner();
            }
        },

        async loadSessions() {
            const signal = startFetch('loadSessions');
            const tbody = document.getElementById('liveSessionsTableBody');
            if (!tbody) return;
            const execLoading = () => { tbody.innerHTML = '<tr><td colspan="7"><div class="table-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div></td></tr>'; };
            if (window.RenderController) RenderController.commit(execLoading);
            else execLoading();
            
            try {
                const sessions = await fetchWithOverlay('/api/admin/live-sessions', { signal });
                
                const execDOM = () => {
                if (!Array.isArray(sessions) || !sessions.length) {
                    tbody.innerHTML = '<tr><td colspan="7"><div class="table-empty">No sessions found.</div></td></tr>';
                    return;
                }

                const statusColors = { upcoming: '#f59e0b', live: '#10b981', ended: '#6b7280' };
                tbody.innerHTML = sessions.map(s => `
                    <tr>
                        <td><strong>${escapeHTML(s.exam).toUpperCase()}</strong> / ${escapeHTML(s.subject)}</td>
                        <td>${new Date(s.startTime).toLocaleString('en-IN')}</td>
                        <td>${s.duration} min</td>
                        <td>${s.questions ? s.questions.length : 0}</td>
                        <td>${s.registeredUsers ? s.registeredUsers.length : 0}</td>
                        <td><span style="background:${statusColors[s.status]}20;color:${statusColors[s.status]};padding:3px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;">${escapeHTML(s.status).toUpperCase()}</span></td>
                        <td>
                            ${s.status === 'upcoming' ? `<button class="admin-btn btn-danger" data-action="delete-session" data-id="${s._id}"><i class="fas fa-trash"></i> Cancel</button>` : ''}
                            <a href="/live-leaderboard.html?sessionId=${s._id}" target="_blank" class="admin-btn btn-primary" style="text-decoration:none;"><i class="fas fa-trophy"></i></a>
                        </td>
                    </tr>
                `).join('');
                };
                if (window.RenderController) RenderController.commit(execDOM);
                else execDOM();
            } catch (err) {
                if (err.name === 'AbortError') return;
                const execError = () => { tbody.innerHTML = '<tr><td colspan="7"><div class="table-error">Failed to load sessions: ' + err.message + '</div></td></tr>'; };
                if (window.RenderController) RenderController.commit(execError);
                else execError();
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

    // --- Event Delegation (CSP Safe) ---
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        if (btn.disabled) return;
        btn.disabled = true;
        const action = btn.getAttribute('data-action');
        try {
            if (action === 'delete-question') {
                await AdminPanel.deleteQuestion(btn.getAttribute('data-sub'), btn.getAttribute('data-id'));
            } else if (action === 'toggle-user') {
                await AdminPanel.toggleUserStatus(btn.getAttribute('data-id'), btn.getAttribute('data-status') === 'true');
            } else if (action === 'delete-session') {
                await AdminLive.deleteSession(btn.getAttribute('data-id'));
            }
        } finally {
            btn.disabled = false;
        }
    });

    // Hash change navigation listener
    window.addEventListener('hashchange', () => {
        const id = window.location.hash.slice(1) || 'analytics';
        AdminPanel.showSection(id);
    });

    // --- Static Event Listeners ---
    function initAdminModule() {
        const bind = (id, fn, eventType = 'click') => { 
            const el = document.getElementById(id); 
            if (el) {
                el.addEventListener(eventType, async (...args) => {
                    let submitBtn = null;
                    if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
                        if (el.disabled) return;
                        el.disabled = true;
                    } else if (el.tagName === 'FORM') {
                        submitBtn = el.querySelector('button[type="submit"]');
                        if (submitBtn) {
                            if (submitBtn.disabled) return;
                            submitBtn.disabled = true;
                        }
                    }
                    try {
                        await fn(...args);
                    } finally {
                        if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
                            el.disabled = false;
                        } else if (submitBtn) {
                            submitBtn.disabled = false;
                        }
                    }
                });
            }
        };

        // Routing
        bind('nav-analytics', () => { window.location.hash = 'analytics'; });
        bind('nav-questions', () => { window.location.hash = 'questions'; });
        bind('nav-users', () => { window.location.hash = 'users'; });
        bind('nav-payments', () => { window.location.hash = 'payments'; });
        bind('nav-live-sessions', () => { window.location.hash = 'live-sessions'; });
        bind('nav-telemetry', () => { window.location.hash = 'telemetry'; });
        bind('nav-home', () => location.href = '/');

        bind('btn-logout', () => Auth.logout());
        bind('btn-fetch-questions', () => AdminPanel.loadQuestions());
        bind('btn-add-question', () => AdminPanel.openQuestionModal());
        bind('btn-refresh-sessions', () => AdminLive.loadSessions());

        // Forms and Search listeners
        bind('questionForm', (e) => AdminPanel.saveQuestion(e), 'submit');
        bind('createLiveSessionForm', (e) => AdminLive.createSession(e), 'submit');
        
        const userSearchInput = document.getElementById('userSearch');
        if (userSearchInput) {
            userSearchInput.addEventListener('input', (e) => AdminPanel.searchUsers(e.target.value));
        }

        document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', () => AdminPanel.closeModal()));

        // Modal safeties (Escape key and background click overlay)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                AdminPanel.closeModal();
            }
        });

        const questionModal = document.getElementById('questionModal');
        if (questionModal) {
            questionModal.addEventListener('click', (e) => {
                if (e.target === questionModal) {
                    AdminPanel.closeModal();
                }
            });
        }

        // Initialize panel logic
        if (window.UIState) {
            RenderController.commit(() => {
                AdminPanel.init().catch(err => {
                    console.error("Admin init error:", err);
                    hideSpinner();
                });
            });
        } else {
            AdminPanel.init().catch(err => {
                console.error("Admin init error:", err);
                hideSpinner();
            });
        }
    }

    if (document.readyState === 'loading') {
        AppLifecycle.register(initAdminModule);
    } else {
        initAdminModule();
    }
}



