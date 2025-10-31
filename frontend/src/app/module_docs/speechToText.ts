/**
 * Generated documentation for speechToText module.
 * This file is auto-generated from module_types/speechToText.ts
 */

export const speechToText = {
  moduleName: "speechToText",
  description: "Speech-to-Text API for voice input. Converts spoken audio to text using device speech recognition. Requires microphone permission.",
  userDescription: "Convert spoken words to text using device speech recognition for voice input and dictation features.",
  
  functions: {
    start: {
      name: "start",
      description: "",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    stop: {
      name: "stop",
      description: "Stops recognition and returns text. Ends the current speech recognition session and returns the transcribed text. Must be called after start() to retrieve the recognized speech.",
      documentation: `
Signature: () => Promise<string>
`
    }
  },
  
  types: {
  },
  
  example: `
await Native.speechToText.start();
// User speaks...
const text = await Native.speechToText.stop();
`
};

// Export for module access
export default speechToText;