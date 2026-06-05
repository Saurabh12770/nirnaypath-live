'use strict';

const GrowthBanners = {
    async loadBanners() {
        const container = document.getElementById('engagement-banner-zone');
        if (!container) return;

        if (!window.Auth || !Auth.isLoggedIn()) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        try {
            const signal = window.AsyncManager ? AsyncManager.getSignal('engagement_banners_load') : undefined;
            const res = await Auth.fetchWithAuth('/api/engagement/smart-feed', { signal });
            
            if (res.ok) {
                const data = await res.json();
                this.render(data.feed || []);
            } else {
                console.warn('[GrowthBanners] Failed to fetch smart-feed:', res.status);
                container.innerHTML = '';
                container.style.display = 'none';
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error('[GrowthBanners] Error fetching smart-feed:', err);
            container.innerHTML = '';
            container.style.display = 'none';
        }
    },

    render(feedItems) {
        const container = document.getElementById('engagement-banner-zone');
        if (!container) return;

        if (feedItems.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = feedItems.map(item => {
            const isJsAction = item.actionLink.startsWith('javascript:');
            const hrefAttr = isJsAction ? '#' : item.actionLink;
            const onclickAttr = isJsAction ? item.actionLink.replace('javascript:', '') : '';

            // Strict HTML escaping for dynamic inputs (icon/actionText)
            const safeIcon = this._escape(item.icon || '💡');
            const safeActionText = this._escape(item.actionText || 'Explore');
            
            // Note: item.message is composed strictly on the server with hardcoded bold tags
            // and safe DB strings. We still sanitize inputs in server composition.
            return `
                <div class="engagement-banner ${item.type || 'primary'}">
                    <div class="banner-left">
                        <span class="banner-icon">${safeIcon}</span>
                        <span class="banner-message">${item.message}</span>
                    </div>
                    <a href="${hrefAttr}" 
                       class="banner-action-btn" 
                       ${onclickAttr ? `onclick="${onclickAttr}; return false;"` : ''}>
                        ${safeActionText}
                    </a>
                </div>
            `;
        }).join('');
    },

    _escape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};
