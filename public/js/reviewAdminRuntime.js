/**
 * Frontend Runtime for Review Admin Dashboard
 * Phase 5
 */

window.reviewAdminState = {
    pending: [],
    quarantine: [],
    analytics: {},
    activeBatch: null,
    loadingStates: {}
};

const runtimeCleanupRegistry = {
    intervals: [],
    clean() {
        this.intervals.forEach(clearInterval);
        this.intervals = [];
    }
};

async function safeFetch(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Unknown server error');
        return data;
    } catch (e) {
        alert('Error: ' + e.message);
        throw e;
    }
}

const ReviewUI = {
    showTab(tabId) {
        const execDOM = () => {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.sidebar nav a').forEach(el => el.classList.remove('active'));
            
            document.getElementById(`tab-${tabId}`).classList.add('active');
            document.querySelector(`.sidebar nav a[onclick*="${tabId}"]`).classList.add('active');
        };
        if (window.RenderController) RenderController.register(execDOM);
        else execDOM();
        
        if (tabId === 'pending') this.loadPending();
        if (tabId === 'quarantine') this.loadQuarantine();
        if (tabId === 'analytics') this.loadAnalytics();
    },

    async loadPending() {
        try {
            const res = await safeFetch('/api/review/pending');
            const execDOM = () => {
                window.reviewAdminState.pending = res.batches;
                document.getElementById('pending-count').innerText = res.batches.length;
                
                const list = document.getElementById('batch-list');
                list.innerHTML = res.batches.map(b => `
                    <div class="card">
                        <h3>${b.subject} - ${b.topic}</h3>
                        <p>Questions: ${b.count}</p>
                        <p>Generated: ${new Date(b.createdAt).toLocaleString()}</p>
                        <div class="warnings">${b.warnings.join('<br>')}</div>
                        <button onclick="ReviewUI.openBatch('${b.id}')">Inspect & Review</button>
                    </div>
                `).join('');
            };
            if (window.RenderController) RenderController.register(execDOM);
            else execDOM();
        } catch (e) {}
    },

    async loadQuarantine() {
        try {
            const res = await safeFetch('/api/review/quarantine');
            const execDOM = () => {
                window.reviewAdminState.quarantine = res.items;
                document.getElementById('quarantine-count').innerText = res.items.length;
                
                const list = document.getElementById('quarantine-list');
                list.innerHTML = res.items.map(q => `
                    <div class="card">
                        <h3>Quarantined Item</h3>
                        <p><strong>Reason:</strong> ${q.reason}</p>
                        <p><strong>Preview:</strong> ${q.questionPreview || 'N/A'}</p>
                        <p><small>${new Date(q.timestamp).toLocaleString()}</small></p>
                        <button onclick="ReviewUI.recoverQuarantine('${q.fingerprint}')">Force Recover</button>
                    </div>
                `).join('');
            };
            if (window.RenderController) RenderController.register(execDOM);
            else execDOM();
        } catch (e) {}
    },

    async loadAnalytics() {
        try {
            const res = await safeFetch('/api/review/analytics');
            const a = res.analytics;
            const execDOM = () => {
                document.getElementById('analytics-panel').innerHTML = `
                    <div class="stat-card"><h4>Approval Rate</h4><div class="value">${a.approvalRate.toFixed(1)}%</div></div>
                    <div class="stat-card"><h4>Pending Batches</h4><div class="value">${a.pendingBatches}</div></div>
                    <div class="stat-card"><h4>Quarantine Size</h4><div class="value">${a.quarantineSize}</div></div>
                `;
            };
            if (window.RenderController) RenderController.register(execDOM);
            else execDOM();
        } catch (e) {}
    },

    async openBatch(id) {
        try {
            const res = await safeFetch(`/api/review/batch/${id}`);
            const execDOM = () => {
                window.reviewAdminState.activeBatch = res.batch;
                
                document.getElementById('modal-title').innerText = `Review Batch: ${res.batch.metadata.subject}`;
                
                const impact = res.coverageImpact;
                document.getElementById('modal-coverage-impact').innerHTML = impact.error ? 
                    `Coverage Impact: ${impact.error}` :
                    `Coverage Score: ${impact.beforeScore} &rarr; <strong>${impact.afterScore}</strong> (${impact.delta > 0 ? '+'+impact.delta : impact.delta})`;

                document.getElementById('modal-questions').innerHTML = res.batch.questions.map((q, idx) => `
                    <div class="q-item">
                        <h4>Q${idx+1}: ${q.question_en}</h4>
                        <div class="hi">${q.question_hi}</div>
                        <ul>
                            ${q.options_en.map((o, i) => `<li class="${i === q.correctAnswer ? 'correct' : ''}">${o}</li>`).join('')}
                        </ul>
                        <p><strong>Explanation:</strong> ${q.explanation_en}</p>
                    </div>
                `).join('');

                document.getElementById('batch-modal').classList.add('active');
            };
            if (window.RenderController) RenderController.register(execDOM);
            else execDOM();
        } catch (e) {}
    },

    closeModal() {
        const execDOM = () => {
            document.getElementById('batch-modal').classList.remove('active');
            window.reviewAdminState.activeBatch = null;
        };
        if (window.RenderController) RenderController.register(execDOM);
        else execDOM();
    },

    async approveActiveBatch() {
        const batch = window.reviewAdminState.activeBatch;
        if (!batch) return;
        if (!confirm('Are you sure you want to approve this batch into production?')) return;

        try {
            await safeFetch(`/api/review/approve/${batch.metadata.generationId}`, { method: 'POST' });
            alert('Batch successfully approved and safely written to DB.');
            this.closeModal();
            this.loadPending();
        } catch (e) {}
    },

    async rejectActiveBatch() {
        const batch = window.reviewAdminState.activeBatch;
        if (!batch) return;
        
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        try {
            await safeFetch(`/api/review/reject/${batch.metadata.generationId}`, { 
                method: 'POST',
                body: JSON.stringify({ reason })
            });
            alert('Batch moved to quarantine.');
            this.closeModal();
            this.loadPending();
        } catch (e) {}
    },

    async recoverQuarantine(fingerprint) {
        const justification = prompt('CRITICAL: Provide justification for forcing recovery of this item:');
        if (!justification) return;

        try {
            await safeFetch(`/api/review/recover/${fingerprint}`, {
                method: 'POST',
                body: JSON.stringify({ justification })
            });
            alert('Item recovered to Pending Queue.');
            this.loadQuarantine();
            this.loadPending();
        } catch(e) {}
    }
};

// Init
window.onload = () => ReviewUI.loadPending();
