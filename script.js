const statusSpan = document.getElementById('listening-status');
const transcriptDiv = document.getElementById('transcript');
const outputDiv = document.getElementById('output');
const toggleListenBtn = document.getElementById('toggle-listen');
const pulseCircle = document.getElementById('pulse');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

if (!SpeechRecognition || !synth) {
    statusSpan.textContent = "Speech Recognition / Speech Synthesis not supported";
    toggleListenBtn.disabled = true;
}

let recognition = null;
let listening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false; // we'll restart manually
    recognition.interimResults = false;
    recognition.lang = 'en-US';
}

function speak(text) {
    if (synth.speaking) {
        synth.cancel();
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    synth.speak(utter);
}

// Knowledge base for REX
const knowledgeBase = [
    {
        questions: ["how are you", "how are you doing", "how is rex"],
        answer: () => "I'm doing great, thanks for asking! I'm here to assist you anytime."
    },
    {
        questions: ["what is your name", "who are you"],
        answer: () => "My name is REX, your personal voice assistant."
    },
    {
        questions: ["stop listening", "pause listening", "go to sleep"],
        answer: () => {
            stopListening();
            return "Okay, I am now paused. Say 'start listening' to wake me up.";
        }
    },
    {
        questions: ["start listening", "resume listening", "wake up", "hello rex"],
        answer: () => {
            if (!listening) {
                startListening();
                return "I am back listening now.";
            } else {
                return "I am already listening.";
            }
        }
    },
    {
        questions: ["what time is it", "tell me the time", "current time", "time now"],
        answer: () => {
            const now = new Date();
            return "The current time is " + now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        }
    },
    {
        questions: ["what is the date", "tell me the date", "current date", "date today"],
        answer: () => {
            const today = new Date();
            return "Today's date is " + today.toLocaleDateString();
        }
    },
    {
        questions: ["tell me a joke", "do you know a joke"],
        answer: () => "Why did the programmer quit his job? Because he didn't get arrays."
    },
    {
        questions: ["open calculator"],
        answer: () => {
            openWebsite('https://www.desmos.com/scientific');
            return "Opening the calculator for you.";
        }
    },
    {
        questions: ["open youtube"],
        answer: () => {
            openWebsite('https://www.youtube.com');
            return "Opening YouTube.";
        }
    },
    {
        questions: ["open google"],
        answer: () => {
            openWebsite('https://www.google.com');
            return "Opening Google.";
        }
    },
    {
        questions: ["open github"],
        answer: () => {
            openWebsite('https://github.com');
            return "Opening GitHub.";
        }
    }
];

function openWebsite(url) {
    window.open(url, '_blank');
}

function matchQuestion(text) {
    text = text.toLowerCase();
    for (const entry of knowledgeBase) {
        for (const q of entry.questions) {
            if (text.includes(q)) {
                return entry.answer();
            }
        }
    }
    return null;
}

function startListening() {
    if (!recognition) return;
    if (listening) return;
    recognition.start();
    listening = true;
    statusSpan.textContent = "Listening...";
    toggleListenBtn.classList.remove('paused');
    toggleListenBtn.textContent = "Pause Listening";
    toggleListenBtn.setAttribute('aria-pressed', 'true');
    pulseCircle.classList.add('listening');
}

function stopListening() {
    if (!recognition) return;
    if (!listening) return;
    recognition.stop();
    listening = false;
    statusSpan.textContent = "Paused";
    toggleListenBtn.classList.add('paused');
    toggleListenBtn.textContent = "Start Listening";
    toggleListenBtn.setAttribute('aria-pressed', 'false');
    pulseCircle.classList.remove('listening');
}

function processCommand(command) {
    const resp = matchQuestion(command);
    if (resp !== null) {
        speak(resp);
        outputDiv.textContent = resp;
        return;
    }
    // Default fallback: search web
    speak("Searching the web for " + command);
    outputDiv.textContent = "Searching the web for: " + command;
    openWebsite('https://www.google.com/search?q=' + encodeURIComponent(command));
}

if (recognition) {
    recognition.onstart = () => {
        listening = true;
        statusSpan.textContent = "Listening...";
        toggleListenBtn.classList.remove('paused');
        toggleListenBtn.textContent = "Pause Listening";
        toggleListenBtn.setAttribute('aria-pressed', 'true');
        pulseCircle.classList.add('listening');
    };

    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        transcriptDiv.textContent = `You said: "${speechResult}"`;
        processCommand(speechResult);
    };

    recognition.onerror = (event) => {
        outputDiv.textContent = `Recognition error: ${event.error}`;
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
            // silently restart listening after small delay
            setTimeout(() => {
                if (listening) recognition.start();
            }, 1000);
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            statusSpan.textContent = "Permission denied. Please allow microphone access and reload.";
            stopListening();
        }
    };

    recognition.onend = () => {
        if (listening) {
            // Restart recognition automatically for continuous listen
            recognition.start();
        } else {
            statusSpan.textContent = "Paused";
            pulseCircle.classList.remove('listening');
        }
    };
}

// Initialize paused
stopListening();

toggleListenBtn.addEventListener('click', () => {
    if (listening) {
        stopListening();
        speak("REX is now paused. Say 'start listening' to continue.");
    } else {
        startListening();
        speak("REX is now listening.");
    }
});
