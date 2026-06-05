'use strict';

(function() {
    async function fetchLiveStats() {
        try {
            const res = await fetch('/api/stats/live');
            if (res.ok) {
                const data = await res.json();
                animateCounter('live-tests-today', data.testsToday || 0);
                animateCounter('live-questions-today', data.questionsToday || 0);
                animateCounter('live-active-today', data.activeLearnersToday || 0);
            }
        } catch (err) {
            console.error('[SocialProof] Error fetching live stats:', err);
        }
    }

    async function fetchAchievementsFeed() {
        const container = document.getElementById('achievements-scroll-container');
        if (!container) return;

        try {
            const res = await fetch('/api/stats/achievements-feed');
            if (res.ok) {
                const data = await res.json();
                renderAchievements(data.feed || []);
            }
        } catch (err) {
            console.error('[SocialProof] Error fetching achievements feed:', err);
        }
    }

    function renderAchievements(feed) {
        const container = document.getElementById('achievements-scroll-container');
        if (!container) return;

        if (feed.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary); font-style: italic;">No recent achievements.</div>';
            return;
        }

        container.innerHTML = feed.map(item => {
            const timeAgo = formatTimeAgo(item.unlockedAt);
            const safeName = escape(item.firstName);
            const safeBadge = escape(item.badgeName);
            const safeIcon = escape(item.icon || '🏅');

            return `
                <div class="achievement-feed-item">
                    <span class="ach-feed-icon">${safeIcon}</span>
                    <div class="ach-feed-details">
                        <strong>${safeName}</strong> unlocked <strong>${safeBadge}</strong>
                    </div>
                    <span class="ach-feed-time">${timeAgo}</span>
                </div>
            `;
        }).join('');
    }

    function formatTimeAgo(dateStr) {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    function animateCounter(id, targetVal) {
        const el = document.getElementById(id);
        if (!el) return;

        const currentVal = parseInt(el.textContent) || 0;
        if (currentVal === targetVal) return;

        const duration = 1000; // 1s animation duration
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress * (2 - progress); // Ease out quad
            const val = Math.floor(currentVal + (targetVal - currentVal) * ease);
            
            el.textContent = val;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = targetVal;
            }
        }

        requestAnimationFrame(update);
    }

    function escape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Initialize with AppLifecycle or fallback to DOMContentLoaded
    if (window.AppLifecycle) {
        window.AppLifecycle.register(() => {
            fetchLiveStats();
            fetchAchievementsFeed();
            
            // Poll every 60s
            setInterval(fetchLiveStats, 60000);
            setInterval(fetchAchievementsFeed, 60000);
        });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            fetchLiveStats();
            fetchAchievementsFeed();
            setInterval(fetchLiveStats, 60000);
            setInterval(fetchAchievementsFeed, 60000);
        });
    }
})();
