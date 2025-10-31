/**
 * Generated documentation for speech module.
 * This file is auto-generated from module_types/speech.ts
 */

export const speech = {
  moduleName: "speech",
  description: "Speech API for text-to-speech. Converts text to spoken audio with customizable voices. Supports multiple languages and voice parameters.",
  userDescription: "Convert text to natural-sounding speech with customizable voices, languages, and speaking parameters.",
  
  functions: {
    speak: {
      name: "speak",
      description: "Speaks text aloud.",
      documentation: `
Signature: (text: string, language?: string, rate?: number, pitch?: number, volume?: number, voice?: string) => Promise<void>
Param Info:
  - text: Text to speak
  - language: Language code
  - rate: Speech rate (0.5-2)
  - pitch: Voice pitch (0.5-2)
  - volume: Volume level (0-1)
  - voice: Voice identifier
`
    },
    
    stop: {
      name: "stop",
      description: "Stops speech playback.",
      documentation: `
Signature: () => Promise<void>
`
    },
    
    pause: {
      name: "pause",
      description: "Pauses speech playback.",
      documentation: `
Signature: () => Promise<void>
`
    },
    
    resume: {
      name: "resume",
      description: "Resumes paused speech.",
      documentation: `
Signature: () => Promise<void>
`
    },
    
    isSpeaking: {
      name: "isSpeaking",
      description: "Checks if currently speaking.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getVoices: {
      name: "getVoices",
      description: "Gets available voices.",
      documentation: `
Signature: () => Promise<Voice[]>
`
    }
  },
  
  types: {
    Voice: {
      type: "interface",
      description: "",
      properties: {
        identifier: "Voice unique ID",
        name: "Voice display name",
        language: "Voice language code",
        quality: "Voice quality level"
      }
    }
  },
  
  example: `
const voices = await Native.speech.getVoices();
await Native.speech.speak("Hello World", "en-US", 1.0, 1.0, 1.0);
`
};

// Export for module access
export default speech;