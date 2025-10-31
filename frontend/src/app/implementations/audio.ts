import type { AudioAPI } from "@/modules/module_types/audio";

const audioPlayers = new Map<string, HTMLAudioElement>();
const mediaRecorders = new Map<string, MediaRecorder>();
const recordedChunks = new Map<string, Blob[]>();
let playerIdCounter = 0;
let recorderIdCounter = 0;

export const audio: AudioAPI = {
  play: async (source: string | number) => {
    const playerId = `player-${++playerIdCounter}`;
    const audioElement = new Audio();

    if (typeof source === "string") {
      audioElement.src = source;
    } else {
      // Handle preset sounds
      const sounds: Record<number, string> = {
        1: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn",
        2: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn",
      };
      audioElement.src = sounds[source] || "";
    }

    audioPlayers.set(playerId, audioElement);

    try {
      await audioElement.play();
      return playerId;
    } catch (error) {
      console.error("Audio play error:", error);
      return playerId;
    }
  },

  pause: async (playerId: string) => {
    const player = audioPlayers.get(playerId);
    if (player) {
      player.pause();
      return true;
    }
    return false;
  },

  resume: async (playerId: string) => {
    const player = audioPlayers.get(playerId);
    if (player) {
      try {
        await player.play();
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },

  stop: async (playerId: string) => {
    const player = audioPlayers.get(playerId);
    if (player) {
      player.pause();
      player.currentTime = 0;
      return true;
    }
    return false;
  },

  seekTo: async (playerId: string, seconds: number) => {
    const player = audioPlayers.get(playerId);
    if (player) {
      player.currentTime = seconds;
      return true;
    }
    return false;
  },

  setVolume: async (playerId: string, volume: number) => {
    const player = audioPlayers.get(playerId);
    if (player) {
      player.volume = Math.max(0, Math.min(1, volume));
      return true;
    }
    return false;
  },

  setLooping: async (playerId: string, isLooping: boolean) => {
    const player = audioPlayers.get(playerId);
    if (player) {
      player.loop = isLooping;
      return true;
    }
    return false;
  },

  getStatus: async (playerId: string) => {
    const player = audioPlayers.get(playerId);
    if (player) {
      return {
        isPlaying: !player.paused,
        isPaused: player.paused && player.currentTime > 0,
        isLoaded: player.readyState >= 2,
        isLooping: player.loop,
        positionSeconds: player.currentTime,
        durationSeconds: player.duration || 0,
        volume: player.volume,
      };
    }
    return {
      isPlaying: false,
      isPaused: false,
      isLoaded: false,
      isLooping: false,
      positionSeconds: 0,
      durationSeconds: 0,
      volume: 1,
    };
  },

  release: async (playerId: string) => {
    const player = audioPlayers.get(playerId);
    if (player) {
      player.pause();
      player.src = "";
      audioPlayers.delete(playerId);
      return true;
    }
    return false;
  },

  startRecording: async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      console.warn("MediaDevices API not available");
      return "mock-recorder-id";
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorderId = `recorder-${++recorderIdCounter}`;
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorders.set(recorderId, mediaRecorder);
      recordedChunks.set(recorderId, chunks);
      mediaRecorder.start();

      return recorderId;
    } catch (error) {
      console.error("Recording start error:", error);
      return "mock-recorder-id";
    }
  },

  stopRecording: async (recorderId: string) => {
    const recorder = mediaRecorders.get(recorderId);
    const chunks = recordedChunks.get(recorderId);

    if (recorder && chunks) {
      return new Promise((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);

          // Clean up
          recorder.stream.getTracks().forEach((track) => track.stop());
          mediaRecorders.delete(recorderId);
          recordedChunks.delete(recorderId);

          resolve({ uri: url });
        };

        recorder.stop();
      });
    }

    return { uri: "mock://recording.mp3" };
  },

  pauseRecording: async (recorderId: string) => {
    const recorder = mediaRecorders.get(recorderId);
    if (recorder && recorder.state === "recording") {
      recorder.pause();
      return true;
    }
    return false;
  },

  resumeRecording: async (recorderId: string) => {
    const recorder = mediaRecorders.get(recorderId);
    if (recorder && recorder.state === "paused") {
      recorder.resume();
      return true;
    }
    return false;
  },

  getRecordingStatus: async (recorderId: string) => {
    const recorder = mediaRecorders.get(recorderId);
    if (recorder) {
      const chunks = recordedChunks.get(recorderId) || [];
      const blob = new Blob(chunks, { type: "audio/webm" });
      const uri = chunks.length > 0 ? URL.createObjectURL(blob) : "";

      return {
        isRecording: recorder.state === "recording",
        durationMillis: 0, // Web API doesn't provide duration during recording
        canRecord: true,
        uri: uri,
      };
    }
    return {
      isRecording: false,
      durationMillis: 0,
      canRecord: true,
      uri: "",
    };
  },

  getRecordingPermission: async () => {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      return { granted: true };
    }

    try {
      const result = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      return { granted: result.state === "granted" };
    } catch {
      return { granted: true };
    }
  },

  requestRecordingPermission: async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return { granted: true };
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return { granted: true };
    } catch {
      return { granted: false };
    }
  },
};
