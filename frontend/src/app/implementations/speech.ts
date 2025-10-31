import type { SpeechAPI } from "@/modules/module_types/speech";

// Check if we're in a browser environment with speech synthesis support
const isBrowser =
  typeof window !== "undefined" && typeof speechSynthesis !== "undefined";

// Global speech synthesis instance
let currentUtterance: SpeechSynthesisUtterance | null = null;
let speechPaused = false;

export const speech: SpeechAPI = {
  speak: async (
    text: string,
    language?: string,
    rate?: number,
    pitch?: number,
    volume?: number,
    voice?: string
  ) => {
    console.log(
      `[WEB] Speech speak: "${text.substring(0, 50)}${
        text.length > 50 ? "..." : ""
      }" lang: ${language}`
    );

    if (!isBrowser) {
      throw new Error("Speech synthesis requires a browser environment");
    }

    // Stop any current speech
    speechSynthesis.cancel();
    speechPaused = false;

    return new Promise<void>((resolve, reject) => {
      try {
        currentUtterance = new SpeechSynthesisUtterance(text);

        // Set language
        if (language) {
          currentUtterance.lang = language;
        }

        // Set rate (0.1 to 10, default 1)
        if (rate !== undefined) {
          currentUtterance.rate = Math.max(0.1, Math.min(10, rate));
        }

        // Set pitch (0 to 2, default 1)
        if (pitch !== undefined) {
          currentUtterance.pitch = Math.max(0, Math.min(2, pitch));
        }

        // Set volume (0 to 1, default 1)
        if (volume !== undefined) {
          currentUtterance.volume = Math.max(0, Math.min(1, volume));
        }

        // Set voice
        if (voice) {
          const voices = speechSynthesis.getVoices();
          const selectedVoice = voices.find(
            (v) =>
              v.name.toLowerCase().includes(voice.toLowerCase()) ||
              v.voiceURI.toLowerCase().includes(voice.toLowerCase())
          );
          if (selectedVoice) {
            currentUtterance.voice = selectedVoice;
          }
        }

        // Set up event handlers
        currentUtterance.onend = () => {
          currentUtterance = null;
          speechPaused = false;
          resolve();
        };

        currentUtterance.onerror = (event) => {
          currentUtterance = null;
          speechPaused = false;
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        // Start speaking
        speechSynthesis.speak(currentUtterance);
      } catch (error) {
        currentUtterance = null;
        speechPaused = false;
        reject(error);
      }
    });
  },

  stop: async () => {
    console.log("[WEB] Speech stop");

    if (!isBrowser) {
      return;
    }

    speechSynthesis.cancel();
    currentUtterance = null;
    speechPaused = false;
  },

  pause: async () => {
    console.log("[WEB] Speech pause");

    if (!isBrowser) {
      return;
    }

    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      speechPaused = true;
    }
  },

  resume: async () => {
    console.log("[WEB] Speech resume");

    if (!isBrowser) {
      return;
    }

    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      speechPaused = false;
    }
  },

  isSpeaking: async () => {
    console.log("[WEB] Speech isSpeaking");

    if (!isBrowser) {
      return false;
    }

    return speechSynthesis.speaking || speechPaused;
  },

  getVoices: async () => {
    console.log("[WEB] Speech getVoices");

    if (!isBrowser) {
      return [];
    }

    return new Promise((resolve) => {
      const getVoicesList = () => {
        const voices = speechSynthesis.getVoices();

        if (voices.length > 0) {
          const voiceList = voices.map((voice) => ({
            identifier: voice.voiceURI,
            name: voice.name,
            language: voice.lang,
            quality: voice.localService ? "high" : "network",
          }));
          resolve(voiceList);
        } else {
          // Voices might not be loaded yet, try again after a short delay
          setTimeout(getVoicesList, 100);
        }
      };

      // Some browsers load voices asynchronously
      if (speechSynthesis.getVoices().length > 0) {
        getVoicesList();
      } else {
        speechSynthesis.onvoiceschanged = getVoicesList;
        // Fallback timeout in case onvoiceschanged doesn't fire
        setTimeout(getVoicesList, 1000);
      }
    });
  },
};
