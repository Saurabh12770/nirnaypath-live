/* Nirnay Bot - AI Tutor Logic */

const Chatbot = {
    isOpen: false,
    historyLoaded: false,

    init() {
        this.injectHTML();
        this.setupEventListeners();
        
        // Load history if user is already logged in
        if (Auth.isLoggedIn()) {
            this.loadHistory();
        }
    },

    injectHTML() {
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.className = 'chatbot-container';
        container.innerHTML = `
            <button class="chatbot-toggle" id="chatbotToggle" title="Ask Nirnay Bot">
                <i class="fas fa-robot"></i>
            </button>
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <h4><i class="fas fa-graduation-cap"></i> Nirnay Bot <small>(AI Tutor)</small></h4>
                    <button class="close-chat" id="closeChat" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">&times;</button>
                </div>
                <div class="chatbot-messages" id="chatMessages">
                    <div class="message bot">
                        नमस्ते! मैं आपका <b>Nirnay Bot</b> हूँ। मैं आपकी परीक्षा की तैयारी में कैसे मदद कर सकता हूँ? 
                        (Hello! I am Nirnay Bot. How can I help with your exam prep?)
                    </div>
                </div>
                <div id="typingIndicator" class="typing hidden" style="padding: 0 20px;">Nirnay Bot is thinking...</div>
                <form class="chatbot-input-area" id="chatForm">
                    <input type="text" id="chatInput" placeholder="Type your doubt here..." autocomplete="off">
                    <button type="submit"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        `;
        document.body.appendChild(container);
    },

    setupEventListeners() {
        const toggle = document.getElementById('chatbotToggle');
        const close = document.getElementById('closeChat');
        const window = document.getElementById('chatbotWindow');
        const form = document.getElementById('chatForm');

        toggle.onclick = () => {
            this.isOpen = !this.isOpen;
            window.classList.toggle('active', this.isOpen);
            if (this.isOpen) document.getElementById('chatInput').focus();
        };

        close.onclick = () => {
            this.isOpen = false;
            window.classList.remove('active');
        };

        form.onsubmit = async (e) => {
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
        div.className = `message ${role === 'user' ? 'user' : 'bot'}`;
        
        // Handle markdown-like formatting (simple)
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\n/g, '<br>');
            
        div.innerHTML = formattedText;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    async sendMessage(message) {
        if (!Auth.isLoggedIn()) {
            this.addMessage('bot', 'Please login to chat with me! (कृपया बातचीत करने के लिए लॉगिन करें)');
            return;
        }

        const indicator = document.getElementById('typingIndicator');
        indicator.classList.remove('hidden');

        try {
            const token = Auth.getToken();
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            const data = await res.json();
            indicator.classList.add('hidden');

            if (res.ok) {
                this.addMessage('bot', data.reply);
            } else {
                this.addMessage('bot', `⚠️ ${data.error || 'Something went wrong.'}`);
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

document.addEventListener('DOMContentLoaded', () => Chatbot.init());
