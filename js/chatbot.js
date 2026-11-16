document.addEventListener('DOMContentLoaded', () => {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotModal = document.getElementById('chatbot-modal');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotClear = document.getElementById('chatbot-clear');
    const chatbotBackdrop = document.getElementById('chatbot-backdrop');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotSuggestions = document.querySelector('.chatbot-suggestions');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotBadge = document.querySelector('.chatbot-badge');
    const contactForm = document.getElementById('contact-form');
    const knowledgeBase = window.chatbotKnowledgeBase;
    const storageKey = 'portfolio-chat-history';
    const mobileQuery = window.matchMedia('(max-width: 599px)');
    const badgeSeenKey = 'portfolio-chat-opened';

    if (!knowledgeBase || !chatbotToggle || !chatbotModal || !chatbotClose ||
        !chatbotClear || !chatbotBackdrop || !chatbotInput || !chatbotSend ||
        !chatbotMessages || !chatbotSuggestions || !chatbotContainer) {
        console.error('Chatbot could not initialize because required data or markup is missing.');
        return;
    }

    let history = [];
    let responseTimer = null;
    let isTyping = false;

    try {
        if (chatbotBadge && sessionStorage.getItem(badgeSeenKey) === 'true') chatbotBadge.hidden = true;
    } catch (error) {
        console.error('Unable to restore chatbot badge state:', error);
    }

    function scrollMessagesToBottom() {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function addLinkedText(parent, text) {
        const pattern = /(https?:\/\/[^\s<>]+|www\.[^\s<>]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:[\w-]+\.)+[a-z]{2,}(?:\/[^\s<>]*)?|\+?\d[\d().\s-]{8,}\d)/gi;
        const lines = text.split('\n');

        lines.forEach((line, lineIndex) => {
            let cursor = 0;
            for (const match of line.matchAll(pattern)) {
                const matchText = match[0];
                const start = match.index;
                let linkText = matchText;
                let trailing = '';
                const isUrl = /^(https?:\/\/|www\.|(?:[\w-]+\.)+[a-z]{2,}(?:\/|$))/i.test(linkText);

                if (isUrl) {
                    trailing = linkText.match(/[.,!?;:)\]]+$/)?.[0] || '';
                    linkText = linkText.slice(0, linkText.length - trailing.length);
                }

                const digits = linkText.replace(/\D/g, '');
                const isPhone = /^\+?[\d().\s-]+$/.test(linkText) && digits.length >= 10;
                if (start > cursor) parent.appendChild(document.createTextNode(line.slice(cursor, start)));

                if (linkText.includes('@') && !linkText.startsWith('http')) {
                    const link = document.createElement('a');
                    link.href = `mailto:${linkText}`;
                    link.textContent = linkText;
                    parent.appendChild(link);
                } else if (/^(https?:\/\/|www\.)/i.test(linkText) ||
                    /^(?:[\w-]+\.)+[a-z]{2,}(?:\/|$)/i.test(linkText)) {
                    const link = document.createElement('a');
                    link.href = /^https?:\/\//i.test(linkText) ? linkText : `https://${linkText}`;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = linkText;
                    parent.appendChild(link);
                } else if (isPhone) {
                    const link = document.createElement('a');
                    link.href = `tel:${linkText.replace(/[^\d+]/g, '')}`;
                    link.textContent = linkText;
                    parent.appendChild(link);
                } else {
                    parent.appendChild(document.createTextNode(matchText));
                }

                if (trailing) parent.appendChild(document.createTextNode(trailing));
                cursor = start + matchText.length;
            }

            if (cursor < line.length) parent.appendChild(document.createTextNode(line.slice(cursor)));
            if (lineIndex < lines.length - 1) parent.appendChild(document.createElement('br'));
        });
    }

    function addFormattedText(parent, text) {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const strong = document.createElement('strong');
                addLinkedText(strong, part.slice(2, -2));
                parent.appendChild(strong);
            } else {
                addLinkedText(parent, part);
            }
        });
    }

    function addMessage(text, sender, save = true) {
        const message = document.createElement('div');
        message.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
        const content = document.createElement('div');
        content.className = 'message-content';
        addFormattedText(content, text);
        message.appendChild(content);
        chatbotMessages.appendChild(message);

        if (save) {
            history.push({ sender, text });
            history = history.slice(-100);
            saveHistory();
        }
        requestAnimationFrame(scrollMessagesToBottom);
    }

    function saveHistory() {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(history));
        } catch (error) {
            console.error('Unable to save chatbot conversation:', error);
        }
    }

    function loadHistory() {
        try {
            const stored = sessionStorage.getItem(storageKey);
            if (!stored) return;
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) throw new TypeError('Chat history must be an array.');
            history = parsed.filter(item =>
                item && (item.sender === 'user' || item.sender === 'bot') &&
                typeof item.text === 'string'
            ).slice(-100);
            history.forEach(item => addMessage(item.text, item.sender, false));
            if (history.length) chatbotSuggestions.hidden = true;
        } catch (error) {
            console.error('Unable to restore chatbot conversation:', error);
            history = [];
            try {
                sessionStorage.removeItem(storageKey);
            } catch (storageError) {
                console.error('Unable to remove invalid chatbot conversation:', storageError);
            }
        }
    }

    function normalizeText(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
    }

    function tokensFor(text) {
        return normalizeText(text).split(' ').filter(Boolean);
    }

    function containsPhrase(inputTokens, keyword) {
        const keywordTokens = tokensFor(keyword);
        if (!keywordTokens.length) return false;
        for (let index = 0; index <= inputTokens.length - keywordTokens.length; index++) {
            if (keywordTokens.every((token, offset) => inputTokens[index + offset] === token)) return true;
        }
        return false;
    }

    function getResponse(message) {
        const inputTokens = tokensFor(message);
        let bestCategory = null;
        let bestScore = 0;

        Object.entries(knowledgeBase.categories).forEach(([name, category]) => {
            if (name === 'greetings' && inputTokens.length > 3) return;
            const score = (category.keywords || []).reduce(
                (matched, keyword) => matched + Number(containsPhrase(inputTokens, keyword)), 0
            );
            if (score > bestScore) {
                bestCategory = category;
                bestScore = score;
            }
        });

        const responses = bestCategory?.responses || knowledgeBase.categories.default.responses;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot-message chatbot-typing';
        indicator.setAttribute('role', 'status');
        indicator.setAttribute('aria-label', 'Assistant is typing');
        const content = document.createElement('div');
        content.className = 'message-content';
        for (let index = 0; index < 3; index++) {
            content.appendChild(document.createElement('span'));
        }
        indicator.appendChild(content);
        chatbotMessages.appendChild(indicator);
        requestAnimationFrame(scrollMessagesToBottom);
        return indicator;
    }

    function setBusy(busy) {
        isTyping = busy;
        chatbotSend.disabled = busy;
        chatbotSend.setAttribute('aria-busy', String(busy));
        chatbotInput.setAttribute('aria-disabled', String(busy));
        chatbotSuggestions.querySelectorAll('button').forEach(button => {
            button.disabled = busy;
        });
    }

    function sendMessage(text = chatbotInput.value) {
        const message = text.trim();
        if (!message || isTyping) return;

        addMessage(message, 'user');
        chatbotInput.value = '';
        chatbotSuggestions.hidden = true;
        const response = getResponse(message);
        const typingIndicator = showTypingIndicator();
        setBusy(true);
        responseTimer = setTimeout(() => {
            typingIndicator.remove();
            addMessage(response, 'bot');
            setBusy(false);
            responseTimer = null;
            if (chatbotModal.classList.contains('active')) {
                chatbotInput.focus({ preventScroll: true });
            }
        }, Math.min(1200, Math.max(400, 400 + response.length * 2)));
    }

    function updateVisualViewport() {
        if (!mobileQuery.matches || !chatbotModal.classList.contains('active')) return;
        const viewport = window.visualViewport;
        if (!viewport) return;
        chatbotModal.style.setProperty('--chat-visual-height', `${viewport.height}px`);
        chatbotModal.style.setProperty('--chat-visual-offset', `${viewport.offsetTop}px`);
    }

    function setChatOpen(open) {
        chatbotModal.classList.toggle('active', open);
        chatbotBackdrop.classList.toggle('active', open);
        chatbotModal.setAttribute('aria-hidden', String(!open));
        chatbotModal.inert = !open;
        chatbotToggle.setAttribute('aria-expanded', String(open));
        chatbotToggle.setAttribute('aria-label', open ? 'Close chat' : 'Open Chat');
        document.body.classList.toggle('chatbot-open', open && mobileQuery.matches);
        document.documentElement.classList.toggle('chatbot-open', open && mobileQuery.matches);

        if (open) {
            if (chatbotBadge) {
                chatbotBadge.hidden = true;
                try {
                    sessionStorage.setItem(badgeSeenKey, 'true');
                } catch (error) {
                    console.error('Unable to save chatbot badge state:', error);
                }
            }
            requestAnimationFrame(() => {
                if (chatbotModal.classList.contains('active')) chatbotClose.focus({ preventScroll: true });
            });
            updateVisualViewport();
        } else {
            chatbotInput.blur();
            chatbotToggle.focus({ preventScroll: true });
            chatbotModal.style.removeProperty('--chat-visual-height');
            chatbotModal.style.removeProperty('--chat-visual-offset');
        }
    }

    chatbotModal.inert = true;
    const welcomeContent = chatbotMessages.querySelector('.chatbot-welcome .message-content');
    if (welcomeContent && knowledgeBase.welcome) {
        welcomeContent.replaceChildren();
        addFormattedText(welcomeContent, knowledgeBase.welcome);
    }
    loadHistory();

    chatbotToggle.addEventListener('click', () => {
        setChatOpen(!chatbotModal.classList.contains('active'));
    });
    chatbotClose.addEventListener('click', () => setChatOpen(false));
    chatbotBackdrop.addEventListener('click', () => setChatOpen(false));
    chatbotSend.addEventListener('click', () => sendMessage());
    chatbotInput.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.isComposing) {
            event.preventDefault();
            sendMessage();
        }
    });
    chatbotSuggestions.addEventListener('click', event => {
        const button = event.target.closest('.chatbot-suggestion');
        if (button) sendMessage(button.textContent);
    });
    chatbotClear.addEventListener('click', () => {
        clearTimeout(responseTimer);
        responseTimer = null;
        const typingIndicator = chatbotMessages.querySelector('.chatbot-typing');
        typingIndicator?.remove();
        history = [];
        setBusy(false);
        chatbotInput.value = '';
        try {
            sessionStorage.removeItem(storageKey);
        } catch (error) {
            console.error('Unable to clear chatbot conversation:', error);
        }
        chatbotMessages.querySelectorAll('.message:not(.chatbot-welcome)').forEach(message => message.remove());
        chatbotSuggestions.hidden = false;
        chatbotSuggestions.querySelectorAll('button').forEach(button => {
            button.disabled = false;
        });
        scrollMessagesToBottom();
    });

    document.addEventListener('keydown', event => {
        if (!chatbotModal.classList.contains('active')) return;
        if (event.key === 'Escape') {
            setChatOpen(false);
            return;
        }
        if (event.key === 'Tab') {
            const focusable = [...chatbotModal.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )];
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!chatbotModal.contains(document.activeElement) ||
                (event.shiftKey && document.activeElement === first)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus({ preventScroll: true });
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus({ preventScroll: true });
            }
        }
    });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateVisualViewport);
        window.visualViewport.addEventListener('scroll', updateVisualViewport);
    }

    const handleMobileBreakpoint = event => {
        const shouldLockScroll = event.matches && chatbotModal.classList.contains('active');
        document.body.classList.toggle('chatbot-open', shouldLockScroll);
        document.documentElement.classList.toggle('chatbot-open', shouldLockScroll);
        updateVisualViewport();
    };
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', handleMobileBreakpoint);
    else mobileQuery.addListener(handleMobileBreakpoint);

    const heroButtons = document.querySelector('.hero-buttons');
    const mobileHeroObserver = window.matchMedia('(max-width: 599px)');
    const syncHeroButtonVisibility = () => {
        if (!heroButtons || !('IntersectionObserver' in window) || !mobileHeroObserver.matches) {
            chatbotContainer.classList.remove('chatbot-toggle-hidden');
            return;
        }
        const buttonRect = heroButtons.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const buttonsVisible = buttonRect.bottom > 0 && buttonRect.top < viewportHeight;
        chatbotContainer.classList.toggle('chatbot-toggle-hidden', buttonsVisible);
    };

    if (heroButtons && 'IntersectionObserver' in window) {
        const heroButtonsObserver = new IntersectionObserver(entries => {
            const buttonsVisible = entries.some(entry => entry.isIntersecting);
            chatbotContainer.classList.toggle('chatbot-toggle-hidden', buttonsVisible && mobileHeroObserver.matches);
        }, { threshold: 0.2 });
        heroButtonsObserver.observe(heroButtons);
    }

    syncHeroButtonVisibility();
    window.addEventListener('scroll', syncHeroButtonVisibility, { passive: true });
    window.addEventListener('resize', syncHeroButtonVisibility);
});
