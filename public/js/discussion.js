/**
 * NirnayPath – Discussion Forum Engine
 * Handles per-question threaded discussions in the test review flow.
 * Requires Auth (auth.js) to be loaded first for getToken().
 */

const Discussion = (() => {
    let _currentQuestionId = null;

    // ── Helpers ──────────────────────────────────────────────────────────────
    function _getToken() {
        // Reuse Auth from auth.js
        return typeof Auth !== 'undefined' ? Auth.getToken() : null;
    }

    function _getCurrentUserId() {
        try {
            const u = JSON.parse(localStorage.getItem('np_user_data') || '{}');
            return u._id || u.id || null;
        } catch { return null; }
    }

    function _isAdmin() {
        try {
            const u = JSON.parse(localStorage.getItem('np_user_data') || '{}');
            return u.role === 'admin';
        } catch { return false; }
    }

    function _timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    function _esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Render ────────────────────────────────────────────────────────────────
    function _renderComment(c, isReply = false) {
        const myId = _getCurrentUserId();
        const canDelete = _isAdmin() || (myId && (c.userId?._id === myId || c.userId?.toString() === myId));
        const indent = isReply ? 'margin-left:24px;border-left:3px solid rgba(99,102,241,0.25);padding-left:12px;' : '';

        return `
            <div class="disc-comment" id="disc-${c._id}" style="${indent}margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-weight:700;font-size:0.85rem;">${_esc(c.userId?.name || 'Anonymous')}</span>
                    <span style="font-size:0.75rem;color:#888;">${_timeAgo(c.createdAt)}</span>
                </div>
                <div style="font-size:0.9rem;line-height:1.5;margin-bottom:6px;">${_esc(c.text)}</div>
                <div style="display:flex;gap:12px;font-size:0.8rem;">
                    ${!isReply ? `<button onclick="Discussion.startReply('${c._id}')" style="background:none;border:none;cursor:pointer;color:var(--primary);font-weight:600;padding:0;">↩ Reply</button>` : ''}
                    ${canDelete ? `<button onclick="Discussion.deleteComment('${c._id}')" style="background:none;border:none;cursor:pointer;color:#ef4444;font-weight:600;padding:0;">🗑 Delete</button>` : ''}
                </div>
                ${!isReply && c.replies?.length ? `<div class="disc-replies" style="margin-top:10px;">${c.replies.map(r => _renderComment(r, true)).join('')}</div>` : ''}
                <div id="reply-form-${c._id}" style="display:none;margin-top:8px;">
                    <textarea id="reply-text-${c._id}" placeholder="Write a reply…" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;font-size:0.85rem;resize:vertical;min-height:60px;box-sizing:border-box;"></textarea>
                    <div style="display:flex;gap:8px;margin-top:6px;">
                        <button onclick="Discussion.postComment(null,'${c._id}',document.getElementById('reply-text-${c._id}').value)" style="background:var(--primary);color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:0.82rem;font-weight:600;">Post Reply</button>
                        <button onclick="document.getElementById('reply-form-${c._id}').style.display='none'" style="background:none;border:1px solid #ddd;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.82rem;">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }

    function _renderThread(comments) {
        const thread = document.getElementById('discussion-thread');
        if (!thread) return;
        if (!comments.length) {
            thread.innerHTML = '<p style="color:#888;font-size:0.88rem;text-align:center;padding:20px 0;">No comments yet. Be the first to ask a question!</p>';
            return;
        }
        thread.innerHTML = comments.map(c => _renderComment(c)).join('');
    }

    // ── Public API ────────────────────────────────────────────────────────────
    async function openDiscussion(questionId) {
        _currentQuestionId = questionId;

        const modal = document.getElementById('discussion-modal');
        const title = document.getElementById('discussion-modal-title');
        if (!modal) return;

        if (title) title.textContent = `Discussion – Question ${questionId}`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        await _loadThread();
    }

    async function _loadThread() {
        const thread = document.getElementById('discussion-thread');
        if (!thread || !_currentQuestionId) return;

        thread.innerHTML = '<p style="text-align:center;padding:20px 0;color:#888;">Loading…</p>';

        try {
            const res = await fetch(`/api/discussion/${_currentQuestionId}`);
            const data = await res.json();
            _renderThread(Array.isArray(data) ? data : []);
        } catch (err) {
            thread.innerHTML = '<p style="color:#ef4444;text-align:center;">Failed to load comments.</p>';
        }
    }

    function closeDiscussion() {
        const modal = document.getElementById('discussion-modal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
        _currentQuestionId = null;
    }

    function startReply(parentId) {
        // Hide all open reply forms first
        document.querySelectorAll('[id^="reply-form-"]').forEach(el => el.style.display = 'none');
        const form = document.getElementById(`reply-form-${parentId}`);
        if (form) {
            form.style.display = 'block';
            const ta = document.getElementById(`reply-text-${parentId}`);
            if (ta) ta.focus();
        }
    }

    async function postComment(questionId, parentId, text) {
        const qid = questionId || _currentQuestionId;
        if (!qid) return;

        const token = _getToken();
        if (!token) {
            alert('Please log in to post a comment.');
            return;
        }
        if (!text || !text.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        try {
            const res = await fetch(`/api/discussion/${qid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: text.trim(), parentId: parentId || null })
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to post comment.');
                return;
            }

            // Clear main textarea if top-level
            if (!parentId) {
                const input = document.getElementById('discussion-input');
                if (input) input.value = '';
            }

            // Refresh thread
            await _loadThread();
        } catch (err) {
            alert('An error occurred. Please try again.');
        }
    }

    async function deleteComment(commentId) {
        if (!confirm('Delete this comment?')) return;

        const token = _getToken();
        if (!token) return;

        try {
            const res = await fetch(`/api/discussion/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                await _loadThread();
            } else {
                const data = await res.json();
                alert(data.error || 'Could not delete comment.');
            }
        } catch (err) {
            alert('Error deleting comment.');
        }
    }

    // ── Boot: wire event delegation for discussion buttons in review ──────────
    function init() {
        // Event delegation: handle any .discussion-toggle-btn click on the page
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.discussion-toggle-btn');
            if (btn) {
                const qid = btn.dataset.qid;
                if (qid) openDiscussion(qid);
            }
        });

        // Close on backdrop click
        const modal = document.getElementById('discussion-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeDiscussion();
            });
        }

        // Submit button
        const submitBtn = document.getElementById('discussion-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                const input = document.getElementById('discussion-input');
                postComment(null, null, input?.value || '');
            });
        }

        // Ctrl+Enter shortcut in textarea
        const input = document.getElementById('discussion-input');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    postComment(null, null, input.value);
                }
            });
        }
    }

    return { init, openDiscussion, closeDiscussion, postComment, deleteComment, startReply };
})();

document.addEventListener('DOMContentLoaded', () => Discussion.init());
