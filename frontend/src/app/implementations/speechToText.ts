// Local event dispatcher to keep this file self-contained
const sendEventToWebView = (eventName: string, detail?: unknown) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
};

// Declare SpeechRecognition types for TypeScript
interface SpeechRecognitionEvent {
    resultIndex: number;
    results: Array<{
        isFinal: boolean;
        0: { transcript: string };
    }>;
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onstart: () => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    start: () => void;
    stop: () => void;
    abort: () => void;
}

declare global {
    interface Window {
        SpeechRecognition?: new () => SpeechRecognition;
        webkitSpeechRecognition?: new () => SpeechRecognition;
    }
}

// Extended Window interface for speech recognition
interface ExtendedWindow extends Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Check for Web Speech API support
const hasSpeechRecognition =
    isBrowser &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

// Speech recognition state management
let recognition: SpeechRecognition | null = null;
let isRecording = false;
let finalTranscript = '';

// Get the SpeechRecognition constructor (with vendor prefix support)
const getSpeechRecognition = (): SpeechRecognition | null => {
    if (!hasSpeechRecognition) return null;

    const extendedWindow = window as ExtendedWindow;
    const SpeechRecognitionConstructor =
        extendedWindow.SpeechRecognition ||
        extendedWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) return null;

    return new SpeechRecognitionConstructor();
};

// Initialize speech recognition with optimal settings
const initializeSpeechRecognition = (): SpeechRecognition | null => {
    const speechRecognition = getSpeechRecognition();

    if (!speechRecognition) return null;

    // Configure recognition settings
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-US'; // Default language
    speechRecognition.maxAlternatives = 1;

    // Event handlers
    speechRecognition.onstart = () => {
        console.log('[WEB] Speech recognition started');
        isRecording = true;
    };

    speechRecognition.onend = () => {
        console.log('[WEB] Speech recognition ended');
        isRecording = false;
    };

    speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('[WEB] Speech recognition error:', event.error);
        isRecording = false;
        // Send error event to WebView
        sendEventToWebView('speechToTextError', { error: event.error });
    };

    speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let currentTranscript = '';
        let currentIsFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            currentTranscript = transcript;
            currentIsFinal = event.results[i].isFinal;

            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        console.log(
            '[WEB] Speech recognition interim result:',
            interimTranscript
        );
        console.log('[WEB] Speech recognition final result:', finalTranscript);

        // Send result event to WebView
        sendEventToWebView('speechToTextResult', {
            transcript: currentTranscript,
            isFinal: currentIsFinal,
            interimTranscript,
            finalTranscript,
        });
    };

    return speechRecognition;
};

export const speechToText = {
    start: async () => {
        console.log('[WEB] SpeechToText start');

        if (!isBrowser) {
            throw new Error(
                'Speech recognition requires a browser environment'
            );
        }

        if (!hasSpeechRecognition) {
            console.warn('Web Speech API is not supported in this browser');
            return false;
        }

        if (isRecording) {
            console.warn('Speech recognition is already running');
            return true;
        }

        try {
            // Initialize recognition if not already done
            if (!recognition) {
                recognition = initializeSpeechRecognition();

                if (!recognition) {
                    throw new Error('Failed to initialize speech recognition');
                }
            }

            // Reset transcript
            finalTranscript = '';

            // Request microphone permission and start recognition
            recognition.start();

            return true;
        } catch (error) {
            console.warn('Failed to start speech recognition:', error);
            isRecording = false;

            // Handle specific error cases
            if (error instanceof Error) {
                if (error.message.includes('not-allowed')) {
                    throw new Error('Microphone permission denied');
                } else if (error.message.includes('no-speech')) {
                    throw new Error('No speech detected');
                } else if (error.message.includes('network')) {
                    throw new Error(
                        'Network error occurred during speech recognition'
                    );
                }
            }

            return false;
        }
    },

    stop: async () => {
        console.log('[WEB] SpeechToText stop');

        if (!isBrowser) {
            throw new Error(
                'Speech recognition requires a browser environment'
            );
        }

        if (!hasSpeechRecognition) {
            console.warn('Web Speech API is not supported in this browser');
            return 'Speech recognition not supported';
        }

        if (!isRecording) {
            console.warn('Speech recognition is not running');
            return finalTranscript || 'No speech was recorded';
        }

        try {
            if (recognition) {
                recognition.stop();

                // Wait a brief moment for final results to be processed
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            const result = finalTranscript.trim() || 'No speech was recognized';

            // Clean up
            finalTranscript = '';

            return result;
        } catch (error) {
            console.warn('Failed to stop speech recognition:', error);
            isRecording = false;

            // Return any partial results we might have
            return (
                finalTranscript.trim() ||
                'Error occurred during speech recognition'
            );
        }
    },
};
