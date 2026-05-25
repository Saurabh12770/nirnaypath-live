/* Nirnay Bot - AI Tutor Logic */

const Chatbot = {
    isOpen: false,
    historyLoaded: false,

    init() {
        this.injectHTML();
        this.setupEventListeners();
    },

    injectHTML() {
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.className = 'chatbot-container';
        container.innerHTML = `
            <button class="chatbot-toggle" id="chatbotToggle" title="Ask Nirnay Help Center">
                <i class="fas fa-headset"></i>
            </button>
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <h4><i class="fas fa-headset"></i> Nirnay Help Center</h4>
                    <button class="close-chat" id="closeChat" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">&times;</button>
                </div>
                <div class="chatbot-messages" id="chatMessages">
                    <div class="message bot">
                        à¤¨à¤®à¤¸à¥à¤¤à¥‡! à¤®à¥ˆà¤‚ Nirnay Help Center à¤¹à¥‚à¤à¥¤ à¤†à¤ªà¤•à¥€ à¤ªà¤°à¥€à¤•à¥à¤·à¤¾ à¤•à¥€ à¤¤à¥ˆà¤¯à¤¾à¤°à¥€ à¤®à¥‡à¤‚ à¤•à¥ˆà¤¸à¥‡ à¤®à¤¦à¤¦ à¤•à¤° à¤¸à¤•à¤¤à¤¾ à¤¹à¥‚à¤?<br><br>
                        (Hello! I am Nirnay Help Center. How can I assist you with your exam preparation?)
                    </div>
                </div>
                <div id="fallbackNotice" class="fallback-notice hidden">AI key not set â€“ basic responses enabled</div>
                <div id="typingIndicator" class="typing hidden" style="padding: 0 20px;">Nirnay Help Center is typing...</div>
                <form class="chatbot-input-area" id="chatForm">
                    <input type="text" id="chatInput" placeholder="Type your doubt here..." autocomplete="off">
                    <button type="submit"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        `;
        const execDOM = () => { document.body.appendChild(container); };
        if (window.RenderController) RenderController.register(execDOM);
        else execDOM();
    },

    setupEventListeners() {
        const toggle = document.getElementById('chatbotToggle');
        const close = document.getElementById('closeChat');
        const window = document.getElementById('chatbotWindow');
        const form = document.getElementById('chatForm');

        toggle.onclick = () => {
            if (window.UIState && !UIState.ready) return;
            this.isOpen = !this.isOpen;
            window.classList.toggle('active', this.isOpen);
            if (this.isOpen) {
                document.getElementById('chatInput').focus();
                if (Auth.isLoggedIn()) {
                    this.loadHistory();
                }
            }
        };

        close.onclick = () => {
            if (window.UIState && !UIState.ready) return;
            this.isOpen = false;
            window.classList.remove('active');
        };

        form.onsubmit = async (e) => {
            if (window.UIState && !UIState.ready) {
                e.preventDefault();
                return;
            }
            e.preventDefault();
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            if (!message) return;

            input.value = '';
            this.addMessage('user', message);
            await this.sendMessage(message);
        };
    },

    addMessage(role, text) {
        const container = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = `chatbot-message ${role === 'user' ? 'user' : 'bot'}`;
        
        // Handle markdown-like formatting (simple)
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\n/g, '<br>');
            
        const execDOM = () => {
            div.innerHTML = formattedText;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        };
        if (window.RenderController) RenderController.register(execDOM);
        else execDOM();
    },

    async sendMessage(message) {
        const indicator = document.getElementById('typingIndicator');
        indicator.classList.remove('hidden');

        try {
            const token = Auth.getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ message })
            });

            const data = await res.json();
            indicator.classList.add('hidden');

            if (res.ok) {
                this.addMessage('bot', data.reply);
                const fallbackNotice = document.getElementById('fallbackNotice');
                if (data.isFallback) {
                    fallbackNotice.classList.remove('hidden');
                } else {
                    fallbackNotice.classList.add('hidden');
                }
            } else {
                this.addMessage('bot', `âš ï¸  ${data.error || 'Something went wrong.'}`);
            }
        } catch (error) {
            indicator.classList.add('hidden');
            this.addMessage('bot', 'Sorry, I am having trouble connecting right now.');
        }
    },

    async loadHistory() {
        if (this.historyLoaded) return;
        try {
            const token = Auth.getToken();
            const res = await fetch('/api/chat/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const history = await res.json();
            
            if (res.ok && history.length > 0) {
                const container = document.getElementById('chatMessages');
                // container.innerHTML = ''; // Keep welcome message or not?
                history.forEach(msg => {
                    this.addMessage(msg.role === 'user' ? 'user' : 'bot', msg.content);
                });
                this.historyLoaded = true;
            }
        } catch (e) {
            console.error('Failed to load chat history');
        }
    }
};

AppLifecycle.register(() => {
    // PAGE ISOLATION GUARD: Do NOT run chatbot on admin or test pages.
    // These pages have their own layouts and the chatbot widget causes
    // visual pollution (floating background, z-index conflicts).
    const path = window.location.pathname;
    const isAdminPage = path.includes('/admin') || path.endsWith('admin.html');
    const isTestPage  = path.includes('/test')  || path.endsWith('test.html');
    if (isAdminPage || isTestPage) {
        console.info('[Chatbot] Skipped on admin/test page.');
        return;
    }

    const init = () => {
        if (window.UIState) UIState.onReady(() => Chatbot.init());
        else Chatbot.init();
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(init);
    } else {

