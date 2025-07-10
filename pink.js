// Fixed selectors to match your HTML
const inarea = document.querySelector("#input-field"), // Changed from ".inarea input"
    send = document.querySelector("#plane"), // Changed from ".bx-paper-plane"
    chat_area = document.querySelector(".chat-area"),
    result = document.querySelector(".result");

// Configuration object for API keys and settings
const CONFIG = {
    GEMINI_API_KEY: 'AIzaSyDBcpPgS2uEn3WC0DoaWtUH0ZJJ8tRRxYM', // Replace with your actual API key
    MAX_CHAT_HISTORY: 50,
    TYPING_SPEED: 30,
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
            type,
            content,
            timestamp,
            id: Date.now().toString()
        });
        
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

// Enhanced typing effect
class TypingEffect {
    static async typeText(element, text, speed = CONFIG.TYPING_SPEED) {
        element.innerHTML = '';
        
        const htmlText = text.replace(/<br>/g, '\n');
        const textWithoutHtml = htmlText.replace(/<[^>]*>/g, '');
        
        for (let i = 0; i < textWithoutHtml.length; i++) {
            const char = textWithoutHtml.charAt(i);
            if (char === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += char;
            }
            await new Promise(resolve => setTimeout(resolve, speed));
        }
        
        setTimeout(() => {
            element.innerHTML = text;
        }, 100);
    }
}

// Enhanced NL Module
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
            this.displayResponse("I can help you create images! Please describe what you'd like to see.");
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
            <img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png"/>
            <div class="response-text"></div>
        `;
        result.appendChild(responseDiv);
        
        const textElement = responseDiv.querySelector('.response-text');
        TypingEffect.typeText(textElement, responseText);
        smoothScrollToBottom();
        
        chatHistory.addMessage('ai', responseText);
    }

    handleMathCalculation(question) {
        try {
            // Simple math evaluation (basic operations only)
            const mathExpression = question.match(/[\d+\-*/().\s]+/g);
            if (mathExpression && mathExpression.length > 0) {
                const cleanExpression = mathExpression[0].replace(/[^\d+\-*/().]/g, '');
                if (cleanExpression && /^[\d+\-*/().\s]+$/.test(cleanExpression)) {
                    const result = Function('"use strict"; return (' + cleanExpression + ')')();
                    this.displayResponse(`The result is: ${result} 🔢`);
                } else {
                    fetchGeminiResponse(question);
                }
            } else {
                fetchGeminiResponse(question);
            }
        } catch (error) {
            this.displayResponse("I couldn't solve that math problem. Let me try a different approach...");
            fetchGeminiResponse(question);
        }
    }

    async handleWeatherRequest(question) {
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
                <img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png"/>
                <p>${message}</p>
            </div>`;
        smoothScrollToBottom();
    }
}

// Initialize managers
const chatHistory = new ChatHistoryManager();
const nLModule = new NLModule();

// Check if elements exist before adding event listeners
if (inarea) {
    inarea.addEventListener("keyup", (e) => {
        if (send) {
            send.style.display = e.target.value.trim().length > 0 ? "inline" : "none";
        }
        localStorage.setItem('messageDraft', e.target.value);
    });

    inarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            getGeminiResponse(e.target.value.trim());
        }
    });
}

if (send) {
    send.addEventListener("click", () => {
        if (inarea) {
            getGeminiResponse(inarea.value.trim());
        }
    });
}

// Enhanced getGeminiResponse function
const getGeminiResponse = (question) => {
    if (!question.trim()) return;

    // Add to history
    chatHistory.addMessage('user', question);

    // Display user question
    if (result) {
        result.innerHTML += `
            <div class="resultTitle">
                <p>${question}</p>
                <img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png"/>
            </div>`;
    }

    if (inarea) {
        inarea.value = "";
    }
    localStorage.removeItem('messageDraft');
    
    if (chat_area) {
        chat_area.style.display = "block";
    }

    const recognizedQuestion = nLModule.recognizeQuestion(question);
    nLModule.generateResponse(recognizedQuestion, question);
};

// Enhanced fetchGeminiResponse with better error handling
const fetchGeminiResponse = async (question, retryCount = 0) => {
    if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        ErrorHandler.displayError("API key not configured. Please add your Gemini API key to the CONFIG object.");
        return;
    }

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

        chatHistory.addMessage('ai', responseData);

        const responseDiv = document.createElement('div');
        responseDiv.className = 'resultres';
        responseDiv.innerHTML = `
            <img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png"/>
            <div class="response-text"></div>
        `;
        
        if (result) {
            result.appendChild(responseDiv);
        }

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

// Enhanced smooth scroll
const smoothScrollToBottom = () => {
    if (result) {
        const lastMessage = result.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }
};

// Enhanced text formatting
const formatResponseText = (text) => {
    return text
        .split("\n")
        .map(line => {
            line = line.replace(/^([\w\s]+):/, '<strong style="font-size: 18px;">$1</strong>:');
            line = line.replace(/`([^`]+)`/g, '<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">$1</code>');
            return line;
        })
        .join("<br>");
};

// Speech recognition setup
let recognition;
let isListening = false;

const initializeSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onresult = (event) => {
            const question = event.results[0][0].transcript;
            if (inarea) {
                inarea.value = question;
                getGeminiResponse(question);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            updateMicrophoneButton();
        };

        recognition.onend = () => {
            isListening = false;
            updateMicrophoneButton();
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
        microphone.style.color = isListening ? '#ff4444' : '#lightgray';
        microphone.title = isListening ? 'Stop listening' : 'Start voice input';
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (inarea && inarea.value.trim()) {
            getGeminiResponse(inarea.value.trim());
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearChat();
    }
});

// Utility functions
function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        if (result) {
            result.innerHTML = '';
        }
        chatHistory.clearHistory();
    }
}

// Initialize everything when page loads
window.addEventListener('load', () => {
    initializeSpeechRecognition();
    
    const draft = localStorage.getItem('messageDraft');
    if (draft && inarea) {
        inarea.value = draft;
        if (send) {
            send.style.display = "inline";
        }
    }
});

// Microphone event listener
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

// Stop speech recognition when clicking input field
if (inarea) {
    inarea.addEventListener("click", () => {
        stopSpeechRecognition();
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    });
}
