/**
 * Chat Logic using Groq API with Session Management
 */

// Configuration
const API_KEY_PART1 = 'gsk_WwA08j7xz3AKfs'; // REPLACE WITH YOUR ACTUAL API KEY PART 1
const API_KEY_PART2 = 'gUvcJ5WGdyb3FYevqtpaN'; // REPLACE WITH YOUR ACTUAL API KEY PART 2
const API_KEY_PART3 = 'AK7ja9IvNOlQDXMR8'; // REPLACE WITH YOUR ACTUAL API KEY PART 3

const API_KEY = API_KEY_PART1 + API_KEY_PART2 + API_KEY_PART3;

const SUBJECT = (typeof AI_CONFIG !== 'undefined') ? AI_CONFIG.subject : 'Conhecimentos Gerais';
const BASE_PROMPT = (typeof AI_CONFIG !== 'undefined') ? AI_CONFIG.systemPrompt : 'Você é um Agente Tutor de IA avançado.';
const MODEL = 'llama-3.3-70b-versatile';

// State
let currentSessionId = null;
let sessions = []; // Array of { id, name, messages: [], lastModified }

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    // History Modal Elements
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const closeHistoryBtn = document.getElementById('close-history');
    const sessionsList = document.getElementById('sessions-list');
    const newChatBtn = document.getElementById('new-chat-btn');

    // Confirmation Modal Elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmCancelBtn = document.getElementById('confirm-cancel');
    const chatInputArea = document.querySelector('.chat-input-area');
    
    let sessionToDeleteId = null;

    // Initialize
    loadSessions();
    
    const lastActiveId = localStorage.getItem('chat_last_active_session');
    const lastActiveSession = sessions.find(s => s.id === lastActiveId);

    if (lastActiveSession) {
        switchSession(lastActiveSession.id);
    } else if (sessions.length > 0) {
        // Load most recent session if no last active found or it was deleted
        switchSession(sessions[0].id);
    } else {
        createNewSession();
    }

    // Event Listeners
    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
    
    userInput.addEventListener('input', () => {
        if (userInput.value.trim().length > 0) {
            chatInputArea.classList.add('has-text');
        } else {
            chatInputArea.classList.remove('has-text');
        }
    });

    historyBtn.addEventListener('click', () => {
        renderSessionsList();
        historyModal.classList.add('active');
    });

    closeHistoryBtn.addEventListener('click', () => {
        historyModal.classList.remove('active');
    });

    newChatBtn.addEventListener('click', () => {
        createNewSession();
        historyModal.classList.remove('active');
    });

    // Confirmation Modal Listeners
    confirmCancelBtn.addEventListener('click', () => {
        confirmModal.classList.remove('active');
        sessionToDeleteId = null;
    });

    confirmYesBtn.addEventListener('click', () => {
        if (sessionToDeleteId) {
            performDeleteSession(sessionToDeleteId);
            confirmModal.classList.remove('active');
            sessionToDeleteId = null;
        }
    });

    // --- Core Chat Logic ---

    async function handleSendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // User Message
        addMessageToUI('user', text);
        saveMessageToSession('user', text);
        
        userInput.value = '';
        chatInputArea.classList.remove('has-text');
        scrollToBottom();

        // Loading State
        const loadingId = addLoadingIndicator();
        scrollToBottom();

        try {
            const response = await fetchGroqCompletion(text);
            removeMessageFromUI(loadingId);
            
            // Use typing effect for AI response
            await typeMessageToUI('ai', response);
            saveMessageToSession('ai', response);
            
            // Update session name if it's the first interaction
            const currentSession = sessions.find(s => s.id === currentSessionId);
            if (currentSession && currentSession.messages.length <= 2) {
                generateSessionName(text);
            }

        } catch (error) {
            removeMessageFromUI(loadingId);
            addMessageToUI('system', `Erro: ${error.message}`);
        }
        
        scrollToBottom();
    }

    function addMessageToUI(role, text) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.id = `msg-${Date.now()}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.innerHTML = formatText(text);
        
        div.appendChild(bubble);
        messagesContainer.appendChild(div);
        return div.id;
    }

    function typeMessageToUI(role, text) {
        return new Promise(resolve => {
            const div = document.createElement('div');
            div.className = `message ${role}`;
            div.id = `msg-${Date.now()}`;
            
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            div.appendChild(bubble);
            messagesContainer.appendChild(div);

            const formattedText = formatText(text);
            let index = 0;
            
            // Faster typing speed (10ms)
            const interval = setInterval(() => {
                if (index < formattedText.length) {
                    // Handle HTML tags (like <br>)
                    if (formattedText[index] === '<') {
                        const closeIndex = formattedText.indexOf('>', index);
                        if (closeIndex !== -1) {
                            bubble.innerHTML += formattedText.substring(index, closeIndex + 1);
                            index = closeIndex + 1;
                        } else {
                            bubble.innerHTML += formattedText[index];
                            index++;
                        }
                    } else {
                        bubble.innerHTML += formattedText[index];
                        index++;
                    }
                    scrollToBottom();
                } else {
                    clearInterval(interval);
                    resolve(div.id);
                }
            }, 10);
        });
    }

    function addLoadingIndicator() {
        const div = document.createElement('div');
        div.className = 'message ai loading';
        div.id = `loading-${Date.now()}`;
        div.innerHTML = '<div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
        messagesContainer.appendChild(div);
        return div.id;
    }

    function removeMessageFromUI(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function formatText(text) {
        let formatted = text;

        // Bold (**text** or __text__)
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Italic (*text* or _text_)
        formatted = formatted.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Inline Code (`text`)
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bullet Points (lines starting with - or *)
        // We use a lookahead to ensure we don't break bold/italic parsing if they start a line
        formatted = formatted.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
        
        // Wrap consecutive <li> elements in <ul>
        // This is a simple approximation. For full markdown support, a library is better, 
        // but this works for simple lists.
        formatted = formatted.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
        // Fix nested <ul>s created by the simple regex above (e.g. <ul><li>...</li></ul><ul><li>...</li></ul> -> <ul><li>...</li><li>...</li></ul>)
        formatted = formatted.replace(/<\/ul><ul>/g, '');

        // Newlines
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    // --- Session Management ---

    function loadSessions() {
        const saved = localStorage.getItem('chat_sessions');
        if (saved) {
            sessions = JSON.parse(saved);
            // Sort by last modified (newest first)
            sessions.sort((a, b) => b.lastModified - a.lastModified);
        }
    }

    function saveSessions() {
        localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }

    function createNewSession() {
        const newSession = {
            id: Date.now().toString(),
            name: 'Nova Conversa',
            messages: [],
            lastModified: Date.now()
        };
        sessions.unshift(newSession);
        saveSessions();
        switchSession(newSession.id);
        renderSessionsList();
    }

    async function switchSession(sessionId) {
        currentSessionId = sessionId;
        localStorage.setItem('chat_last_active_session', sessionId);
        const session = sessions.find(s => s.id === sessionId);
        
        // Clear UI
        messagesContainer.innerHTML = '';
        
        if (session) {
            // Render messages
            if (session.messages.length === 0) {
                // Generate custom welcome
                const loadingId = addLoadingIndicator();
                try {
                    const messages = [
                        { role: 'system', content: `${BASE_PROMPT} O assunto atual é ${SUBJECT}.` },
                        { role: 'user', content: "Apresente-se ao usuário. Mantenha curto e amigável." } 
                    ];
                    
                    const responseText = await callGroqAPI(messages);
                    
                    removeMessageFromUI(loadingId);
                    await typeMessageToUI('ai', responseText);
                    saveMessageToSession('ai', responseText);
                    
                } catch (e) {
                    removeMessageFromUI(loadingId);
                    // Fallback
                    const fallback = `Olá! Eu sou sua professora de ${SUBJECT}.`;
                    await typeMessageToUI('ai', fallback);
                    saveMessageToSession('ai', fallback);
                }
            } else {
                session.messages.forEach(msg => addMessageToUI(msg.role, msg.text));
            }
        }
        scrollToBottom();
    }

    function saveMessageToSession(role, text) {
        const session = sessions.find(s => s.id === currentSessionId);
        if (session) {
            session.messages.push({ role, text });
            session.lastModified = Date.now();
            
            // Re-sort sessions
            sessions.sort((a, b) => b.lastModified - a.lastModified);
            saveSessions();
        }
    }

    function deleteSession(sessionId, e) {
        e.stopPropagation();
        sessionToDeleteId = sessionId;
        confirmModal.classList.add('active');
    }

    function performDeleteSession(sessionId) {
        sessions = sessions.filter(s => s.id !== sessionId);
        saveSessions();
        renderSessionsList();
        
        if (currentSessionId === sessionId) {
            if (sessions.length > 0) {
                switchSession(sessions[0].id);
            } else {
                createNewSession();
            }
        }
    }

    function renameSession(sessionId, newName) {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            session.name = newName;
            saveSessions();
        }
    }

    function generateSessionName(firstUserMessage) {
        const session = sessions.find(s => s.id === currentSessionId);
        if (session) {
            // Simple truncation
            let name = firstUserMessage.substring(0, 30);
            if (firstUserMessage.length > 30) name += '...';
            session.name = name;
            saveSessions();
        }
    }

    // --- UI Rendering for History ---

    function renderSessionsList() {
        sessionsList.innerHTML = '';
        
        sessions.forEach(session => {
            const item = document.createElement('div');
            item.className = `session-item ${session.id === currentSessionId ? 'active' : ''}`;
            item.onclick = () => {
                switchSession(session.id);
                historyModal.classList.remove('active');
            };

            // Name Input (for renaming)
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = session.name;
            nameInput.className = 'session-name-input';
            nameInput.onclick = (e) => e.stopPropagation(); // Prevent switching when clicking input
            nameInput.onchange = (e) => renameSession(session.id, e.target.value);

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-session-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.onclick = (e) => deleteSession(session.id, e);

            item.appendChild(nameInput);
            item.appendChild(deleteBtn);
            sessionsList.appendChild(item);
        });
    }

    // --- API Interaction ---
    async function callGroqAPI(messages) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: MODEL,
                temperature: 0.6, // Slightly lower for better reasoning
                max_tokens: 450   // Reduced limit for concise replies
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Falha ao conectar com a IA');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async function fetchGroqCompletion(userMessage) {
        const session = sessions.find(s => s.id === currentSessionId);
        const history = session ? session.messages : [];

        const messages = [
            { role: 'system', content: `${BASE_PROMPT} O assunto atual é ${SUBJECT}.` },
            ...history.map(m => ({ 
                role: m.role === 'ai' ? 'assistant' : 'user', 
                content: m.text 
            })),
            { role: 'user', content: userMessage } // Add current message
        ];

        // Keep context window reasonable but larger for better memory
        // Llama 3.3 70b has a large context window, so we can pass more history.
        // Passing the last 50 messages ensures good short-term memory without hitting limits too fast.
        const recentMessages = messages.slice(-50); 
        
        // Ensure System Prompt is ALWAYS the first message
        if (messages.length > 0 && messages[0].role === 'system') {
             if (recentMessages[0].role !== 'system') {
                 recentMessages.unshift(messages[0]);
             }
        }

        return await callGroqAPI(recentMessages);
    }
});
