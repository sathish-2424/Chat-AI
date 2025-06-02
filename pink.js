const inarea = document.querySelector(".inarea input"),
    send = document.querySelector(".bx-paper-plane"),
    chat_area = document.querySelector(".chat-area"),
    result = document.querySelector(".result");

inarea.addEventListener("keyup", (e) => {
    send.style.display = e.target.value.trim().length > 0 ? "inline" : "none";
});

inarea.addEventListener("keydown", (e) => {
    if (e.code === "Space") stopSpeechRecognition();
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        getGeminiResponse(e.target.value.trim());
    }
});

send.addEventListener("click", () => {
    getGeminiResponse(inarea.value.trim());
});

class NLModule {
    constructor() {
        this.questionPatterns = {
            'greeting': [/\bhello\b|\bhi\b|\bhey\b/i],
            'goodbye': [/\bbye\b|\bsee you\b|\bgoodnight\b/i],
            'image': [/\bcreate an image\b|\bdo you create an image\b|\bmake an image\b|\bgenerate an image\b|\bdraw\b|\bpicture\b/i],
            'thanks': [/\bthank you\b|\bthanks\b/i],
            'blank': [/^\s*$/]
        };

    }

    recognizeQuestion(text) {
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
            'greeting': ['Hello! 😊', 'Hi there!', 'Hey! 👋'],
            'goodbye': ['Goodbye! 👋', 'See you later! 😽', 'Take care! ❤️'],
            'thanks': ["You're welcome! 😊", 'No problem!', 'Anytime!'],
            'blank': ["There is nothing to display 🤐", "I can't read anything 😵‍💫"]
        };
    
        if (responses[questionType]) {
            let randomResponse = responses[questionType][Math.floor(Math.random() * responses[questionType].length)];
            result.innerHTML += `
                <div class="resultres">
                    <img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png"/>
                    <p>${randomResponse}</p>
                </div>`;
            smoothScrollToBottom();
        } else if (questionType === "image") {
            console.log("🔹 Image request detected. Calling `crt()`...");
            crt(); // Call the image generation function
            
            result.innerHTML += `
                <div class="resultres">
                    <img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png"/>
                    <p>Generating your image... ⏳</p>
                    <img id="generatedImage" src="" alt="Generated Image" style="max-width: 100%; height: auto; display: none;"/>
                </div>`;
            
            // Wait for image to load and then update src
            setTimeout(() => {
                if (picture && picture.src) {
                    document.getElementById("generatedImage").src = picture.src;
                    document.getElementById("generatedImage").style.display = "block";
                }
            }, 3000); // Adjust delay based on API speed
    
            smoothScrollToBottom();
        } else {
            console.log("⚠ No predefined response. Calling `fetchGeminiResponse()`...");
            fetchGeminiResponse(originalQuestion);
        }
    }
}    

const nLModule = new NLModule();

const getGeminiResponse = (question) => {
    // Move previous messages upward

    // Display new question
    result.innerHTML += `
        <div class="resultTitle"><p>${question}</p><img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png"/></div>`;

    inarea.value = "";
    chat_area.style.display = "block";

    const recognizedQuestion = nLModule.recognizeQuestion(question);
    nLModule.generateResponse(recognizedQuestion, question);
};


const smoothScrollToBottom = () => {
    const lastMessage = document.querySelector(".resultres:last-child");
    if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
    }
};


const formatResponseText = (text) => {
    return text
        .split("<br>") // Split text by new lines
        .map(line => line.replace(/^([\w\s]+):/, '<strong style="font-size: 18px;">$1</strong>:')) // Bold words before ":"
        .join("<br>"); // Rejoin with new line formatting
};

const fetchGeminiResponse = (question) => {
    const AIURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyD8fCS0zoTMRUMocriHEE9I7VgpYAi4MRs`;

    fetch(AIURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: question }] }],
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
            throw new Error("Invalid response from AI");
        }

        let responseData = data.candidates[0].content.parts[0].text;
        responseData = responseData.replace(/\*/g, '').replace(/\n/g, '<br>');
        responseData = formatResponseText(responseData); // Apply proper formatting

        // Speech synthesis
        // const speech = new SpeechSynthesisUtterance(responseData.replace(/<br>/g, '\n'));
        // speech.voice = window.speechSynthesis.getVoices().find(voice => voice.name.includes(1));
        // window.speechSynthesis.speak(speech);

        result.innerHTML += `
        <div class="resultres"><img src="img/logo/ChatGPT Image Mar 29, 2025, 06_22_42 AM.png"/>
            <div id="typeEffect">${responseData}</div> 
        </div>`;
    })
    .catch(error => {
        console.error("Error fetching AI response:", error);
        result.innerHTML += `
            <div class="resultres">
                <img src="img/error.png"/>
                <p>Sorry, I couldn't process your request. Please try again later.</p>
            </div>`;
    });



const nLModule = new NLModule();
const recognizedQuestion = nLModule.recognizequestion(question);
nLModule.generateResponse(recognizedQuestion, question);
};

let output = document.getElementById("output");
let picture = document.getElementById("img");
let copy = document.getElementById("copy");
let don = document.getElementById("don");
let crtButton = document.getElementById("crt");
let text = document.getElementById("text");
let currentbol;

const fetchData = async (url, headers, method, body) => {
    const options = {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    };
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            console.error(`HTTP error, Status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
};

const blobToBase64 = async () => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(currentbol);
    });
};

// Events
const crt = async () => {
    picture.style.display = "none";

    const url = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-3.5-large-turbo";
    const headers = {
        "Authorization": "Bearer Your_HuggingFace_API_Key", // Replace with your actual Hugging Face API key
        "Content-Type": "application/json"
    };

    const body = {
        "inputs": text.value
    };
    const method = "POST";
    const response = await fetchData(url, headers, method, body);

    if (response) {
        currentbol = await response.blob();
        const objectURL = URL.createObjectURL(currentbol);
        picture.src = objectURL;
        picture.style.display = "block";
    }
};


const jsonEscape = str => {
    return str.replace(new RegExp("\r?\n\n", "g"), "<br>").replace(new RegExp("\r?\n", "g"), "<br>");
};

let recognition;
let isListening = false;

const initializeSpeechRecognition = () => {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const question = event.results[0][0].transcript;
        addQuestionToChatHistory(question);
        getGeminiResponse(question, true);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert('Speech recognition error: ' + event.error);
    };

    recognition.onend = () => {
        if (isListening) {
            recognition.start();
        }
    };
};
const startSpeechRecognition = () => {
    if (!isListening) {
        isListening = true;
        recognition.start();
    }
};

const stopSpeechRecognition = () => {
    isListening = false;
    if (recognition) {
        recognition.stop();
    }
};
const microphone = document.getElementById("phone");
microphone.addEventListener("click", startSpeechRecognition);

const mick = document.getElementById("inputArea");
mick.addEventListener("click", stopSpeechRecognition);

const inputAreaEl = document.querySelector(".inarea input");
inputAreaEl.addEventListener("click", () => {
    stopSpeechRecognition();
    window.speechSynthesis.cancel();
});

window.addEventListener("load", initializeSpeechRecognition);