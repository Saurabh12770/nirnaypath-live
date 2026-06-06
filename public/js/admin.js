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

    // Wrapper for API fetch requests with token handling and overlay
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
            throw error;
        } finally {
            hideSpinner();
        }
    }

    // ══════════════════════════════════════════════════════════
    // ADMIN PANEL core
    // ══════════════════════════════════════════════════════════
    const AdminPanel = {
        _bootComplete: false,
        async init() {
            showSpinner();
            try {
                // Verify admin privileges
                const data = await fetchWithOverlay('/api/auth/me');
                if (!data || !data.user || data.user.role !== 'admin') {
                    alert('Unauthorized. Admin access only.');
                    location.href = '/';
                    return;
                }
                document.getElementById('adminName').textContent = data.user.name || 'Admin';

                // Load initial layout elements concurrently
                await Promise.all([
                    this.loadStats(),
                    this.loadSubjects(),
                    AdminNotes.populateFilters()
                ]);

                this._bootComplete = true;

                // Show default hash section or default to analytics
                const initialSection = window.location.hash.slice(1) || 'analytics';
                this.showSection(initialSection);
            } catch (err) {
                console.error("Admin dashboard initialization failed:", err);
                alert('Unauthorized or session expired. Admin access only.');
                location.href = '/';
            } finally {
                hideSpinner();
            }
        },

        showSection(id) {
            const validSections = ['analytics', 'questions', 'notes', 'syllabus', 'users'];
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
            
            if (this._bootComplete) {
                if (id === 'analytics') this.loadStats();
                if (id === 'questions') this.loadQuestions();
                if (id === 'notes') AdminNotes.loadNotes();
                if (id === 'syllabus') AdminSyllabus.loadSyllabus();
                if (id === 'users') this.loadUsers();
            } else {
                if (id === 'notes') AdminNotes.loadNotes();
                if (id === 'syllabus') AdminSyllabus.loadSyllabus();
                if (id === 'users') this.loadUsers();
            }
        },

        async loadStats() {
            const signal = startFetch('loadStats');
            try {
                const rawData = await fetchWithOverlay('/api/admin/stats', { signal });
                
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
                    questions: {
                        total: rawData?.questions?.total || 0
                    },
                    notes: {
                        total: rawData?.notes?.total || 0
                    },
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
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: #10b981;"><i class="fas fa-crown"></i></div>
                                <h3>${data.users.pro}</h3>
                                <p>Pro Members</p>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i class="fas fa-user-slash"></i></div>
                                <h3>${data.users.banned}</h3>
                                <p>Banned Users</p>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6;"><i class="fas fa-clipboard-check"></i></div>
                                <h3>${data.tests.total}</h3>
                                <p>Tests Taken</p>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(245,158,11,0.1); color: #f59e0b;"><i class="fas fa-question-circle"></i></div>
                                <h3>${data.questions.total}</h3>
                                <p>Questions In DB</p>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: #10b981;"><i class="fas fa-file-alt"></i></div>
                                <h3>${data.notes.total}</h3>
                                <p>Syllabus Notes</p>
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
            }
        },

        renderCharts(data) {
            if (typeof Chart === 'undefined') {
                setTimeout(() => this.renderCharts(data), 200);
                return;
            }

            if (chartInstances.userChart) { 
                try { chartInstances.userChart.destroy(); } catch (e) {}
                delete chartInstances.userChart;
            }
            if (chartInstances.activityChart) { 
                try { chartInstances.activityChart.destroy(); } catch (e) {}
                delete chartInstances.activityChart;
            }

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
                    select.innerHTML = '<option value="">Select a subject...</option>';
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
                if (!sub) return;
                
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
                            <td>${escapeHTML(q.topic || q.topicId || '-')}</td>
                            <td><span class="tag tag-free">${escapeHTML(q.difficulty || '-')}</span></td>
                            <td title="${escapeHTML(q.question_en || q.text || '')}">${escapeHTML((q.question_en || q.text || '').substring(0, 80))}...</td>
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
                            <td><span class="tag ${['pro_monthly', 'pro_yearly'].includes(u.plan) ? 'tag-pro' : 'tag-free'}">${u.plan ? u.plan.toUpperCase() : 'FREE'}</span></td>
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
                correctAnswer: 0 // Default correct is first option
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

    // ══════════════════════════════════════════════════════════
    // NOTES EDITOR CONTROLLER
    // ══════════════════════════════════════════════════════════
    const AdminNotes = {
        async populateFilters() {
            try {
                const syllabus = await fetchWithOverlay('/api/admin/syllabus');
                const examSelect = document.getElementById('noteExamFilter');
                const subjectSelect = document.getElementById('noteSubjectFilter');
                if (!examSelect || !subjectSelect) return;
                
                examSelect.innerHTML = '<option value="">All Exams</option>';
                subjectSelect.innerHTML = '<option value="">All Subjects</option>';
                
                const exams = syllabus.exams || [];
                exams.forEach(e => {
                    const opt = document.createElement('option');
                    opt.value = e.id;
                    opt.textContent = e.name;
                    examSelect.appendChild(opt);
                });
                
                const seenSubjects = new Set();
                exams.forEach(e => {
                    (e.subjects || []).forEach(s => {
                        if (!seenSubjects.has(s.id)) {
                            seenSubjects.add(s.id);
                            const opt = document.createElement('option');
                            opt.value = s.id;
                            opt.textContent = s.name;
                            subjectSelect.appendChild(opt);
                        }
                    });
                });
            } catch (err) {
                console.error('Failed to populate notes filters:', err);
            }
        },

        async loadNotes() {
            const signal = startFetch('loadNotes');
            const tbody = document.getElementById('notesTableBody');
            if (!tbody) return;
            
            tbody.innerHTML = '<tr><td colspan="5"><div class="table-loading"><i class="fas fa-spinner fa-spin"></i> Loading notes...</div></td></tr>';
            
            try {
                const exam = document.getElementById('noteExamFilter')?.value || '';
                const subject = document.getElementById('noteSubjectFilter')?.value || '';
                const search = document.getElementById('noteSearch')?.value || '';
                
                let url = `/api/admin/learning-content?limit=100`;
                if (exam) url += `&exam=${encodeURIComponent(exam)}`;
                if (subject) url += `&subject=${encodeURIComponent(subject)}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;
                
                const data = await fetchWithOverlay(url, { signal });
                tbody.innerHTML = '';
                
                if (!data || !Array.isArray(data.items) || data.items.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5"><div class="table-empty">No notes found matching current filters.</div></td></tr>';
                    return;
                }
                
                tbody.innerHTML = data.items.map(item => `
                    <tr>
                        <td><strong>${escapeHTML(item.exam)}</strong></td>
                        <td><span class="tag tag-free">${escapeHTML(item.subject)}</span></td>
                        <td>${escapeHTML(item.topic)}</td>
                        <td>${escapeHTML(item.subTopic)}</td>
                        <td>
                            <button class="admin-btn btn-primary btn-sm" onclick="AdminNotes.openNoteModal('${item._id}')"><i class="fas fa-edit"></i> Edit</button>
                            <button class="admin-btn btn-danger btn-sm" onclick="AdminNotes.deleteNote('${item._id}')"><i class="fas fa-trash"></i> Del</button>
                        </td>
                    </tr>
                `).join('');
            } catch (err) {
                if (err.name === 'AbortError') return;
                tbody.innerHTML = `<tr><td colspan="5"><div class="table-error">Failed to load notes: ${escapeHTML(err.message)}</div></td></tr>`;
            }
        },

        async openNoteModal(id = '') {
            const modal = document.getElementById('noteModal');
            const form = document.getElementById('noteForm');
            if (!modal || !form) return;
            
            form.reset();
            document.getElementById('n-id').value = '';
            
            if (id) {
                document.getElementById('noteModalTitle').textContent = 'Edit Learning Content Note';
                showSpinner();
                try {
                    const item = await fetchWithOverlay(`/api/admin/learning-content/${id}`);
                    document.getElementById('n-id').value = item._id || '';
                    document.getElementById('n-exam').value = item.exam || '';
                    document.getElementById('n-subject').value = item.subject || '';
                    document.getElementById('n-topic').value = item.topic || '';
                    document.getElementById('n-subtopic').value = item.subTopic || '';
                    document.getElementById('n-introduction').value = item.introduction || '';
                    document.getElementById('n-conceptExplanation').value = item.conceptExplanation || '';
                    document.getElementById('n-detailedNotes').value = item.detailedNotes || '';
                    document.getElementById('n-facts').value = (item.importantFacts || []).join('\n');
                    document.getElementById('n-examples').value = (item.examples || []).join('\n');
                    document.getElementById('n-pyqs').value = (item.pyqReferences || []).join('\n');
                    document.getElementById('n-revisionNotes').value = item.revisionNotes || '';
                    document.getElementById('n-mcqsJson').value = item.practiceMcqs && item.practiceMcqs.length ? JSON.stringify(item.practiceMcqs, null, 2) : '';
                } catch (err) {
                    alert('Failed to load note details: ' + err.message);
                    return;
                } finally {
                    hideSpinner();
                }
            } else {
                document.getElementById('noteModalTitle').textContent = 'Add New Learning Content Note';
            }
            modal.style.display = 'flex';
        },

        async saveNote(e) {
            if (e) e.preventDefault();
            const id = document.getElementById('n-id').value;
            const payload = {
                exam: document.getElementById('n-exam').value.trim(),
                subject: document.getElementById('n-subject').value.trim(),
                topic: document.getElementById('n-topic').value.trim(),
                subTopic: document.getElementById('n-subtopic').value.trim(),
                introduction: document.getElementById('n-introduction').value,
                conceptExplanation: document.getElementById('n-conceptExplanation').value,
                detailedNotes: document.getElementById('n-detailedNotes').value,
                importantFacts: document.getElementById('n-facts').value.split('\n').map(f => f.trim()).filter(Boolean),
                examples: document.getElementById('n-examples').value.split('\n').map(e => e.trim()).filter(Boolean),
                pyqReferences: document.getElementById('n-pyqs').value.split('\n').map(p => p.trim()).filter(Boolean),
                revisionNotes: document.getElementById('n-revisionNotes').value,
                practiceMcqs: []
            };
            
            const mcqsText = document.getElementById('n-mcqsJson').value.trim();
            if (mcqsText) {
                try {
                    payload.practiceMcqs = JSON.parse(mcqsText);
                    if (!Array.isArray(payload.practiceMcqs)) {
                        alert('Practice MCQs must be an array of objects.');
                        return;
                    }
                } catch (err) {
                    alert('Invalid Practice MCQs JSON format: ' + err.message);
                    return;
                }
            }

            showSpinner();
            try {
                const url = id ? `/api/admin/learning-content/${id}` : '/api/admin/learning-content';
                const method = id ? 'PUT' : 'POST';
                await fetchWithOverlay(url, {
                    method,
                    body: JSON.stringify(payload)
                });
                alert('Note saved successfully!');
                this.closeModal();
                this.loadNotes();
                AdminPanel.loadStats();
            } catch (err) {
                alert('Failed to save note: ' + err.message);
            } finally {
                hideSpinner();
            }
        },

        async deleteNote(id) {
            if (!confirm('Are you sure you want to delete this syllabus note?')) return;
            showSpinner();
            try {
                await fetchWithOverlay(`/api/admin/learning-content/${id}`, { method: 'DELETE' });
                alert('Note deleted successfully.');
                this.loadNotes();
                AdminPanel.loadStats();
            } catch (err) {
                alert('Failed to delete note: ' + err.message);
            } finally {
                hideSpinner();
            }
        },

        closeModal() {
            const modal = document.getElementById('noteModal');
            if (modal) {
                modal.style.display = 'none';
                document.getElementById('noteForm').reset();
                document.getElementById('n-id').value = '';
            }
        }
    };

    // ══════════════════════════════════════════════════════════
    // SYLLABUS INDEX CONTROLLER
    // ══════════════════════════════════════════════════════════
    const AdminSyllabus = {
        async loadSyllabus() {
            const signal = startFetch('loadSyllabus');
            try {
                const data = await fetchWithOverlay('/api/admin/syllabus', { signal });
                
                const execDOM = () => {
                    const jsonInput = document.getElementById('syllabusJsonInput');
                    if (jsonInput) {
                        jsonInput.value = JSON.stringify(data, null, 2);
                    }
                    this.renderVisualTree(data);
                };
                if (window.RenderController) RenderController.commit(execDOM);
                else execDOM();
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('Failed to load syllabus index:', err);
            }
        },

        async saveSyllabus(e) {
            if (e) e.preventDefault();
            const jsonInput = document.getElementById('syllabusJsonInput');
            if (!jsonInput) return;
            
            let payload;
            try {
                payload = JSON.parse(jsonInput.value);
            } catch (err) {
                alert('Invalid JSON structure: ' + err.message);
                return;
            }

            showSpinner();
            try {
                await fetchWithOverlay('/api/admin/syllabus', {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                alert('Syllabus updated successfully!');
                this.loadSyllabus();
                AdminPanel.loadSubjects();
                AdminNotes.populateFilters();
            } catch (err) {
                alert('Failed to save syllabus: ' + err.message);
            } finally {
                hideSpinner();
            }
        },

        renderVisualTree(data) {
            const container = document.getElementById('syllabusVisualTree');
            if (!container) return;
            if (!data || !Array.isArray(data.exams)) {
                container.innerHTML = '<p style="color:#ef4444;">Invalid syllabus hierarchy.</p>';
                return;
            }
            let html = '<ul style="list-style-type: none; padding-left: 0; margin: 0;">';
            data.exams.forEach(exam => {
                html += `
                    <li style="margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <strong style="color:var(--admin-primary); font-size:1.05rem;"><span style="margin-right: 5px;">${exam.icon || '📌'}</span>${escapeHTML(exam.name)} (${escapeHTML(exam.id)})</strong>
                        <p style="margin:4px 0 8px 0; color:var(--admin-text-muted); font-size:0.85rem;">${escapeHTML(exam.description || '')}</p>
                        <ul style="list-style-type: none; padding-left: 15px; border-left: 2px dashed #cbd5e1; margin: 0;">
                `;
                if (exam.subjects && exam.subjects.length > 0) {
                    exam.subjects.forEach(subject => {
                        html += `
                            <li style="margin-top: 6px; display: flex; align-items: center; gap: 8px;">
                                <span style="font-weight:600; font-size: 0.9rem;">${subject.icon || '📚'} ${escapeHTML(subject.name)}</span>
                                <code style="background:#f1f5f9; padding:1px 5px; border-radius:4px; font-size:0.75rem;">ID: ${escapeHTML(subject.id)}</code>
                                <code style="background:#ecfdf5; color:#065f46; padding:1px 5px; border-radius:4px; font-size:0.75rem;">Key: ${escapeHTML(subject.dataKey)}</code>
                            </li>
                        `;
                    });
                } else {
                    html += '<li style="color:#94a3b8; font-style:italic; font-size: 0.85rem;">No subjects defined.</li>';
                }
                html += '</ul></li>';
            });
            html += '</ul>';
            container.innerHTML = html;
        }
    };

    // Global exposer for event triggers inside HTML
    window.AdminNotes = AdminNotes;
    window.AdminSyllabus = AdminSyllabus;

    window.addEventListener('unhandledrejection', hideSpinner);
    window.addEventListener('error', hideSpinner);

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

        // Tab routing bindings
        bind('nav-analytics', () => { window.location.hash = 'analytics'; });
        bind('nav-questions', () => { window.location.hash = 'questions'; });
        bind('nav-notes', () => { window.location.hash = 'notes'; });
        bind('nav-syllabus', () => { window.location.hash = 'syllabus'; });
        bind('nav-users', () => { window.location.hash = 'users'; });
        bind('nav-home', () => location.href = '/');

        bind('btn-logout', () => Auth.logout());
        bind('btn-fetch-questions', () => AdminPanel.loadQuestions());
        bind('btn-add-question', () => AdminPanel.openQuestionModal());
        bind('btn-add-note', () => AdminNotes.openNoteModal());

        // Forms and search bindings
        bind('questionForm', (e) => AdminPanel.saveQuestion(e), 'submit');
        bind('noteForm', (e) => AdminNotes.saveNote(e), 'submit');
        bind('syllabusForm', (e) => AdminSyllabus.saveSyllabus(e), 'submit');
        
        const userSearchInput = document.getElementById('userSearch');
        if (userSearchInput) {
            userSearchInput.addEventListener('input', (e) => AdminPanel.searchUsers(e.target.value));
        }

        const noteExamFilter = document.getElementById('noteExamFilter');
        if (noteExamFilter) {
            noteExamFilter.addEventListener('change', () => AdminNotes.loadNotes());
        }

        const noteSubjectFilter = document.getElementById('noteSubjectFilter');
        if (noteSubjectFilter) {
            noteSubjectFilter.addEventListener('change', () => AdminNotes.loadNotes());
        }

        const noteSearch = document.getElementById('noteSearch');
        if (noteSearch) {
            noteSearch.addEventListener('input', (e) => {
                if (window.noteSearchTimeout) clearTimeout(window.noteSearchTimeout);
                window.noteSearchTimeout = setTimeout(() => {
                    AdminNotes.loadNotes();
                }, 300);
            });
        }

        document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', () => {
            AdminPanel.closeModal();
            AdminNotes.closeModal();
        }));

        // Modal safeties (Escape key and overlay background clicks)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                AdminPanel.closeModal();
                AdminNotes.closeModal();
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

        const noteModal = document.getElementById('noteModal');
        if (noteModal) {
            noteModal.addEventListener('click', (e) => {
                if (e.target === noteModal) {
                    AdminNotes.closeModal();
                }
            });
        }

        // Initialize Panel logic
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
