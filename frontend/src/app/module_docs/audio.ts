/**
 * Generated documentation for audio module.
 * This file is auto-generated from module_types/audio.ts
 */

export const audio = {
  moduleName: "audio",
  description: "Audio playback and recording API. Handles audio playback from URLs/assets and device recording. Each play() call returns a unique player ID for control.",
  userDescription: "Play audio files, control playback, and record audio from the device microphone with full control over volume and playback state.",
  
  functions: {
    play: {
      name: "play",
      description: "Plays audio from source.",
      documentation: `
Signature: (source: string | number) => Promise<string>
Param Info:
  - source: URL string or asset ID number
`
    },
    
    pause: {
      name: "pause",
      description: "Pauses audio playback.",
      documentation: `
Signature: (playerId: string) => Promise<boolean>
Param Info:
  - playerId: ID of the player to pause
`
    },
    
    resume: {
      name: "resume",
      description: "Resumes paused audio.",
      documentation: `
Signature: (playerId: string) => Promise<boolean>
Param Info:
  - playerId: ID of the player to resume
`
    },
    
    stop: {
      name: "stop",
      description: "Stops audio playback.",
      documentation: `
Signature: (playerId: string) => Promise<boolean>
Param Info:
  - playerId: ID of the player to stop
`
    },
    
    seekTo: {
      name: "seekTo",
      description: "Seeks to position in audio.",
      documentation: `
Signature: (playerId: string, seconds: number) => Promise<boolean>
Param Info:
  - seconds: Target position
`
    },
    
    setVolume: {
      name: "setVolume",
      description: "Sets audio volume.",
      documentation: `
Signature: (playerId: string, volume: number) => Promise<boolean>
Param Info:
  - volume: Level from 0 to 1
`
    },
    
    setLooping: {
      name: "setLooping",
      description: "Sets whether audio loops.",
      documentation: `
Signature: (playerId: string, isLooping: boolean) => Promise<boolean>
Param Info:
  - playerId: ID of the player
  - isLooping: Whether to loop the audio
`
    },
    
    getStatus: {
      name: "getStatus",
      description: "Gets current playback status.",
      documentation: `
Signature: (playerId: string) => Promise<AudioStatus>
Param Info:
  - playerId: ID of the player
`
    },
    
    release: {
      name: "release",
      description: "Releases audio resources.",
      documentation: `
Signature: (playerId: string) => Promise<boolean>
Param Info:
  - playerId: ID of the player to release
`
    },
    
    startRecording: {
      name: "startRecording",
      description: "Starts audio recording.",
      documentation: `
Signature: () => Promise<string>
`
    },
    
    stopRecording: {
      name: "stopRecording",
      description: "Stops recording and saves file.",
      documentation: `
Signature: (recorderId: string) => Promise<{ uri: string }>
Param Info:
  - recorderId: ID of the recorder
`
    },
    
    pauseRecording: {
      name: "pauseRecording",
      description: "Pauses active recording.",
      documentation: `
Signature: (recorderId: string) => Promise<boolean>
Param Info:
  - recorderId: ID of the recorder to pause
`
    },
    
    resumeRecording: {
      name: "resumeRecording",
      description: "Resumes paused recording.",
      documentation: `
Signature: (recorderId: string) => Promise<boolean>
Param Info:
  - recorderId: ID of the recorder to resume
`
    },
    
    getRecordingStatus: {
      name: "getRecordingStatus",
      description: "Gets recording status info.",
      documentation: `
Signature: (recorderId: string) => Promise<RecordingStatus>
Param Info:
  - recorderId: ID of the recorder
`
    },
    
    getRecordingPermission: {
      name: "getRecordingPermission",
      description: "Checks recording permission.",
      documentation: `
Signature: () => Promise<{ granted: boolean }>
`
    },
    
    requestRecordingPermission: {
      name: "requestRecordingPermission",
      description: "Requests recording permission.",
      documentation: `
Signature: () => Promise<{ granted: boolean }>
`
    }
  },
  
  types: {
    AudioStatus: {
      type: "interface",
      description: "",
      properties: {
        isPlaying: "Whether audio is playing",
        isPaused: "Whether audio is paused",
        isLoaded: "Whether audio is loaded",
        isLooping: "Whether audio is looping",
        positionSeconds: "Current position in seconds",
        durationSeconds: "Total duration in seconds",
        volume: "Volume level (0-1)"
      }
    },
    RecordingStatus: {
      type: "interface",
      description: "Recording status information",
      properties: {
        isRecording: "Whether recording is active",
        durationMillis: "Recording duration in milliseconds",
        canRecord: "Whether recording is possible",
        uri: "Recording file URI"
      }
    }
  },
  
  example: `
const playerId = await Native.audio.play("https://example.com/song.mp3");
await Native.audio.setVolume(playerId, 0.5);
await Native.audio.stop(playerId);
`
};

// Export for module access
export default audio;