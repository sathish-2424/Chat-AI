const inarea = document.querySelector(".inarea input"),
    send = document.querySelector(".bx-paper-plane"),
    chat_area = document.querySelector(".chat-area"),
    result = document.querySelector(".result");

// Configuration object for API keys and settings
const CONFIG = {
    GEMINI_API_KEY: 'AIzaSyD8fCS0zoTMRUMocriHEE9I7VgpYAi4MRs', // Move to environment variables
    HUGGINGFACE_API_KEY: 'Your_HuggingFace_API_Key', // Move to environment variables
    MAX_CHAT_HISTORY: 50,
    TYPING_SPEED: 30, // Faster typing speed for better UX
    THEME: localStorage.getItem('chatTheme') || 'light'
};

// Enhanced chat history management
class ChatHistoryManager {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('chatHistory')) || [];
        this.maxHistory = CONFIG.MAX_CHAT_HISTORY;
    }

    addMessage(type, content, timestamp = new Date()) {
        this.history.push({
            type, // 'user' or 'ai' or 'system'
            content,
            timestamp,
            id: Date.now().toString()
        });
        
        // Keep only recent messages
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(-this.maxHistory);
        }
        
        this.saveToStorage();
    }

    saveToStorage() {
        localStorage.setItem('chatHistory', JSON.stringify(this.history));
    }

    clearHistory() {
        this.history = [];
        this.saveToStorage();
    }

    exportHistory() {
        const dataStr = JSON.stringify(this.history, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    searchHistory(query) {
        return this.history.filter(msg => 
            msg.content.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// Enhanced Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = CONFIG.THEME;
        this.applyTheme();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('chatTheme', this.currentTheme);
    }

    applyTheme() {
        document.body.className = `theme-${this.currentTheme}`;
        document.documentElement.style.setProperty('--primary-color', 
            this.currentTheme === 'dark' ? '#2d3748' : '#ffffff');
        document.documentElement.style.setProperty('--text-color', 
            this.currentTheme === 'dark' ? '#ffffff' : '#333333');
    }
}

// Enhanced typing effect
class TypingEffect {
    static async typeText(element, text, speed = CONFIG.TYPING_SPEED) {
        element.innerHTML = '';
        
        // Convert <br> tags to line breaks for typing, but keep HTML formatting
        const htmlText = text.replace(/<br>/g, '\n');
        const textWithoutHtml = htmlText.replace(/<[^>]*>/g, ''); // Remove HTML tags for typing
        
        // Type character by character
        for (let i = 0; i < textWithoutHtml.length; i++) {
            const char = textWithoutHtml.charAt(i);
            if (char === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += char;
            }
            await new Promise(resolve => setTimeout(resolve, speed));
        }
        
        // After typing is complete, replace with properly formatted HTML
        setTimeout(() => {
            element.innerHTML = text;
        }, 100);
    }
}

// Enhanced NL Module with more patterns and context awareness
class NLModule {
    constructor() {
        this.questionPatterns = {
            'greeting': [/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/i],
            'goodbye': [/\b(bye|goodbye|see you|farewell|goodnight|take care)\b/i],
            'image': [/\b(create|make|generate|draw|design).*(image|picture|photo|artwork|illustration)\b/i],
            'thanks': [/\b(thank you|thanks|appreciate|grateful)\b/i],
            'help': [/\b(help|assist|support|guide|how to)\b/i],
            'weather': [/\b(weather|temperature|forecast|rain|sunny|cloudy)\b/i],
            'time': [/\b(time|date|day|hour|minute|clock)\b/i],
            'math': [/\b(calculate|math|solve|equation|plus|minus|multiply|divide)\b/i],
            'translate': [/\b(translate|translation|language|convert)\b/i],
            'blank': [/^\s*$/],
            'question': [/\?$/],
            'sentiment_positive': [/\b(good|great|awesome|excellent|amazing|wonderful)\b/i],
            'sentiment_negative': [/\b(bad|terrible|awful|horrible|disappointed|frustrated)\b/i]
        };

        this.contextMemory = [];
        this.maxContextMemory = 5;
    }

    recognizeQuestion(text) {
        // Store context
        this.contextMemory.push(text);
        if (this.contextMemory.length > this.maxContextMemory) {
            this.contextMemory.shift();
        }

        for (let key in this.questionPatterns) {
            if (this.questionPatterns[key].some(pattern => pattern.test(text))) {
                return key;
            }
        }
        return 'unknown';
    }

    generateResponse(questionType, originalQuestion) {
        console.log("Recognized Type:", questionType);
        console.log("Original Question:", originalQuestion);
    
        const responses = {
            'greeting': ['Hello! 😊 How can I help you today?', 'Hi there! 👋', 'Hey! What would you like to know?'],
            'goodbye': ['Goodbye! 👋 Take care!', 'See you later! 😸', 'Have a great day! ❤️'],
            'thanks': ["You're welcome! 😊", 'Happy to help!', 'Anytime! 🌟'],
            'help': ['I can help with questions, create images, translate text, solve math problems, and more! What do you need?'],
            'time': [`Current time: ${new Date().toLocaleTimeString()}`],
            'blank': ["There is nothing to display 🤐", "I can't read anything 😵‍💫"],
            'sentiment_positive': ["I'm glad you're feeling positive! 😊", "That's wonderful to hear! ✨"],
            'sentiment_negative': ["I'm sorry you're feeling that way. How can I help? 🤗", "I understand. Let me try to assist you better."]
        };
    
        if (responses[questionType]) {
            let randomResponse = responses[questionType][Math.floor(Math.random() * responses[questionType].length)];
            this.displayResponse(randomResponse);
        } else if (questionType === "image") {
            this.handleImageGeneration();
        } else if (questionType === "math") {
            this.handleMathCalculation(originalQuestion);
        } else if (questionType === "weather") {
            this.handleWeatherRequest(originalQuestion);
        } else if (questionType === "translate") {
            this.handleTranslationRequest(originalQuestion);
        } else {
            console.log("⚠ No predefined response. Calling fetchGeminiResponse...");
            fetchGeminiResponse(originalQuestion);
        }
    }

    displayResponse(responseText) {
        const responseDiv = document.createElement('div');
        responseDiv.className = 'resultres';
        responseDiv.innerHTML = `
            
            <div class="response-text"></div>
        `;
        result.appendChild(responseDiv);
        
        const textElement = responseDiv.querySelector('.response-text');
        TypingEffect.typeText(textElement, responseText);
        smoothScrollToBottom();
        
        // Add to history
        chatHistory.addMessage('ai', responseText);
    }

    handleImageGeneration() {
        console.log("🔹 Image request detected. Calling crt()...");
        crt();
        this.displayResponse("Generating your image... ⏳");
    }

    handleMathCalculation(question) {
        try {
            // Extract mathematical expression
            const mathExpression = question.replace(/[^\d+\-*/().]/g, '');
            if (mathExpression) {
                const result = eval(mathExpression); // Note: Use math.js in production for safety
                this.displayResponse(`The result is: ${result} 🔢`);
            } else {
                fetchGeminiResponse(question);
            }
        } catch (error) {
            this.displayResponse("I couldn't solve that math problem. Let me try a different approach...");
            fetchGeminiResponse(question);
        }
    }

    async handleWeatherRequest(question) {
        // Mock weather response - integrate with actual weather API
        const responses = [
            "I don't have access to real-time weather data, but I'd recommend checking a weather app! 🌤️",
            "For accurate weather information, please check your local weather service. ☀️"
        ];
        this.displayResponse(responses[Math.floor(Math.random() * responses.length)]);
    }

    handleTranslationRequest(question) {
        this.displayResponse("I can help with translations! Please specify what you'd like to translate and to which language. 🌍");
        fetchGeminiResponse(question);
    }
}

// Enhanced error handling
class ErrorHandler {
    static handle(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        const errorMessages = {
            'network': 'Network error. Please check your connection and try again.',
            'api': 'Service temporarily unavailable. Please try again later.',
            'input': 'Invalid input. Please check your message and try again.',
            'general': 'Something went wrong. Please try again.'
        };

        const errorType = this.categorizeError(error);
        const message = errorMessages[errorType] || errorMessages.general;
        
        this.displayError(message);
    }

    static categorizeError(error) {
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
            return 'network';
        }
        if (error.status >= 400 && error.status < 500) {
            return 'api';
        }
        return 'general';
    }

    static displayError(message) {
        result.innerHTML += `
            <div class="resultres error">
                <img src="img/error.png"/>
                <p>${message}</p>
            </div>`;
        smoothScrollToBottom();
    }
}

// Enhanced offline support
class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.setupEventListeners();
        this.pendingRequests = [];
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processPendingRequests();
            this.showStatus('Back online! 🌐');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showStatus('You are offline. Messages will be sent when connection is restored. 📴');
        });
    }

    addPendingRequest(requestData) {
        this.pendingRequests.push(requestData);
    }

    processPendingRequests() {
        while (this.pendingRequests.length > 0) {
            const request = this.pendingRequests.shift();
            // Process pending request
            fetchGeminiResponse(request.question);
        }
    }

    showStatus(message) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message';
        statusDiv.textContent = message;
        result.appendChild(statusDiv);
        setTimeout(() => statusDiv.remove(), 3000);
    }
}

// Initialize managers
const chatHistory = new ChatHistoryManager();
const themeManager = new ThemeManager();
const nLModule = new NLModule();
const offlineManager = new OfflineManager();

// Enhanced event listeners
inarea.addEventListener("keyup", (e) => {
    send.style.display = e.target.value.trim().length > 0 ? "inline" : "none";
    
    // Save draft
    localStorage.setItem('messageDraft', e.target.value);
});

inarea.addEventListener("keydown", (e) => {
    if (e.code === "Space") stopSpeechRecognition();
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        getGeminiResponse(e.target.value.trim());
    }
    
    // Auto-complete suggestions (basic implementation)
    if (e.key === "Tab" && e.target.value.length > 2) {
        e.preventDefault();
        showAutoComplete(e.target.value);
    }
});

send.addEventListener("click", () => {
    getGeminiResponse(inarea.value.trim());
});

// Auto-complete functionality
function showAutoComplete(text) {
    const suggestions = [
        "How to", "What is", "Can you", "Please help", "Create an image of",
        "Translate", "Calculate", "Explain", "Show me", "Tell me about"
    ].filter(suggestion => 
        suggestion.toLowerCase().startsWith(text.toLowerCase())
    );

    if (suggestions.length > 0) {
        // Simple implementation - use the first suggestion
        inarea.value = suggestions[0] + " ";
        inarea.focus();
    }
}

// Enhanced getGeminiResponse function
const getGeminiResponse = (question) => {
    if (!question.trim()) return;

    // Add to history
    chatHistory.addMessage('user', question);

    // Display user question
    result.innerHTML += `
        <div class="resultTitle">
            <p>${question}</p>
            <img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png"/>
        </div>`;

    inarea.value = "";
    localStorage.removeItem('messageDraft'); // Clear saved draft
    chat_area.style.display = "block";

    // Check if offline
    if (!offlineManager.isOnline) {
        offlineManager.addPendingRequest({question, timestamp: new Date()});
        result.innerHTML += `
            <div class="resultres offline">
                <img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png"/>
                <p>Message saved. Will be sent when you're back online. 📴</p>
            </div>`;
        return;
    }

    const recognizedQuestion = nLModule.recognizeQuestion(question);
    nLModule.generateResponse(recognizedQuestion, question);
};

// Enhanced fetchGeminiResponse with retry logic
const fetchGeminiResponse = async (question, retryCount = 0) => {
    const maxRetries = 3;
    const AIURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

    try {
        const response = await fetch(AIURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: question }] }],
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
            throw new Error("Invalid response from AI");
        }

        let responseData = data.candidates[0].content.parts[0].text;
        responseData = responseData.replace(/\*/g, '').replace(/\n/g, '<br>');
        responseData = formatResponseText(responseData);

        // Add to history
        chatHistory.addMessage('ai', responseData);

        // Create response element
        const responseDiv = document.createElement('div');
        responseDiv.className = 'resultres';
        responseDiv.innerHTML = `
            
            <div class="response-text"></div>
        `;
        result.appendChild(responseDiv);

        // Clean response data and apply typing animation
        const textElement = responseDiv.querySelector('.response-text');
        await TypingEffect.typeText(textElement, responseData);
        
        smoothScrollToBottom();

    } catch (error) {
        console.error("Error fetching AI response:", error);
        
        if (retryCount < maxRetries) {
            console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => fetchGeminiResponse(question, retryCount + 1), 1000 * (retryCount + 1));
        } else {
            ErrorHandler.handle(error, 'fetchGeminiResponse');
        }
    }
};

// Response action functions (removed - buttons are hidden)

// Enhanced smooth scroll
const smoothScrollToBottom = () => {
    const lastMessage = result.lastElementChild;
    if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
    }
};

// Enhanced text formatting
const formatResponseText = (text) => {
    return text
        .split("\n") // Split by actual newlines instead of <br>
        .map(line => {
            // Bold text before colons
            line = line.replace(/^([\w\s]+):/, '<strong style="font-size: 18px;">$1</strong>:');
            // Highlight code blocks
            line = line.replace(/`([^`]+)`/g, '<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">$1</code>');
            return line;
        })
        .join("<br>"); // Join with <br> for HTML display
};

// Enhanced image generation
const crt = async () => {
    const picture = document.getElementById("img");
    if (picture) picture.style.display = "none";

    const url = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-3.5-large-turbo";
    const headers = {
        "Authorization": `Bearer ${CONFIG.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
    };

    const textInput = document.getElementById("text");
    const body = {
        "inputs": textInput ? textInput.value : "A beautiful landscape"
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const currentbol = await response.blob();
            const objectURL = URL.createObjectURL(currentbol);
            if (picture) {
                picture.src = objectURL;
                picture.style.display = "block";
            }
        } else {
            throw new Error(`Image generation failed: ${response.status}`);
        }
    } catch (error) {
        ErrorHandler.handle(error, 'Image Generation');
    }
};

// Enhanced speech recognition
let recognition;
let isListening = false;

const initializeSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = true;

        recognition.onresult = (event) => {
            const question = event.results[event.results.length - 1][0].transcript;
            inarea.value = question;
            getGeminiResponse(question);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            updateMicrophoneButton();
        };

        recognition.onend = () => {
            if (isListening) {
                recognition.start();
            }
        };
    }
};

const startSpeechRecognition = () => {
    if (recognition && !isListening) {
        isListening = true;
        recognition.start();
        updateMicrophoneButton();
    }
};

const stopSpeechRecognition = () => {
    isListening = false;
    if (recognition) {
        recognition.stop();
    }
    updateMicrophoneButton();
};

const updateMicrophoneButton = () => {
    const microphone = document.getElementById("phone");
    if (microphone) {
        microphone.style.color = isListening ? '#ff4444' : '#333';
        microphone.title = isListening ? 'Stop listening' : 'Start voice input';
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to send message
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (inarea.value.trim()) {
            getGeminiResponse(inarea.value.trim());
        }
    }
    
    // Ctrl/Cmd + K to clear chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearChat();
    }
    
    // Ctrl/Cmd + D to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        themeManager.toggleTheme();
    }
});

// Additional utility functions
function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        result.innerHTML = '';
        chatHistory.clearHistory();
    }
}

function exportChat() {
    chatHistory.exportHistory();
}

function searchChat() {
    const query = prompt('Enter search term:');
    if (query) {
        const results = chatHistory.searchHistory(query);
        if (results.length > 0) {
            console.log('Search results:', results);
            // Display results in a modal or highlight in chat
        } else {
            alert('No results found.');
        }
    }
}

// Load draft message on page load
window.addEventListener('load', () => {
    initializeSpeechRecognition();
    
    const draft = localStorage.getItem('messageDraft');
    if (draft) {
        inarea.value = draft;
        send.style.display = "inline";
    }
});

// Event listeners for new features
const microphone = document.getElementById("phone");
if (microphone) {
    microphone.addEventListener("click", () => {
        if (isListening) {
            stopSpeechRecognition();
        } else {
            startSpeechRecognition();
        }
    });
}

const inputAreaEl = document.querySelector(".inarea input");
if (inputAreaEl) {
    inputAreaEl.addEventListener("click", () => {
        stopSpeechRecognition();
        window.speechSynthesis.cancel();
    });
}
