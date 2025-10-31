import type { GyroscopeAPI } from "@/modules/module_types/gyroscope";
import { sendEventToWebView } from "@/utils";

// Extend DeviceOrientationEvent to include requestPermission for iOS
interface ExtendedDeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Gyroscope state management
let isGyroscopeRunning = false;
let currentReading = { x: 0, y: 0, z: 0 };
let updateInterval = 100;
let intervalId: number | NodeJS.Timeout | null = null;
let previousReading = { alpha: 0, beta: 0, gamma: 0 };

// DeviceOrientationEvent handler
const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
  if (!isGyroscopeRunning) return;

  // Convert orientation changes to angular velocity (gyroscope-like data)
  // This is an approximation since real gyroscope data would be angular velocity
  const alpha = event.alpha || 0; // Z axis rotation
  const beta = event.beta || 0; // X axis rotation
  const gamma = event.gamma || 0; // Y axis rotation

  // Calculate angular velocity as difference over time
  const deltaTime = updateInterval / 1000; // Convert to seconds

  currentReading = {
    x: (beta - previousReading.beta) / deltaTime, // X axis angular velocity
    y: (gamma - previousReading.gamma) / deltaTime, // Y axis angular velocity
    z: (alpha - previousReading.alpha) / deltaTime, // Z axis angular velocity
  };

  previousReading = { alpha, beta, gamma };

  // Send event to WebView
  sendEventToWebView("gyroscopeUpdate", currentReading);
};

// Permission request handler
const requestPermission = async (): Promise<boolean> => {
  if (!isBrowser) return false;

  // Check if DeviceOrientationEvent is available
  if (typeof DeviceOrientationEvent === "undefined") {
    console.warn("DeviceOrientationEvent is not supported in this browser");
    return false;
  }

  // For iOS 13+ devices, we need to request permission
  const extendedEvent =
    DeviceOrientationEvent as typeof DeviceOrientationEvent &
      ExtendedDeviceOrientationEvent;
  if (typeof extendedEvent.requestPermission === "function") {
    try {
      const permission = await extendedEvent.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.warn("Failed to request device orientation permission:", error);
      return false;
    }
  }

  // For other devices, permission is typically granted by default
  return true;
};

export const gyroscope: GyroscopeAPI = {
  start: async (newUpdateInterval = 100) => {
    console.log(`[WEB] Gyroscope start with interval: ${newUpdateInterval}ms`);

    if (!isBrowser) {
      throw new Error("Gyroscope operations require a browser environment");
    }

    if (isGyroscopeRunning) {
      console.warn("Gyroscope is already running");
      return true;
    }

    try {
      // Request permission if needed
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error("Permission denied for device orientation access");
      }

      updateInterval = newUpdateInterval;
      isGyroscopeRunning = true;

      // Add event listener for device orientation
      window.addEventListener(
        "deviceorientation",
        handleDeviceOrientation,
        true
      );

      // Reset previous reading
      previousReading = { alpha: 0, beta: 0, gamma: 0 };
      currentReading = { x: 0, y: 0, z: 0 };

      // Set up interval to dispatch events at the specified rate
      intervalId = window.setInterval(() => {
        if (isGyroscopeRunning) {
          sendEventToWebView("gyroscopeUpdate", currentReading);
        }
      }, updateInterval);

      console.log("Gyroscope started successfully");
      return true;
    } catch (error) {
      console.warn("Failed to start gyroscope:", error);
      isGyroscopeRunning = false;
      return false;
    }
  },

  stop: async () => {
    console.log("[WEB] Gyroscope stop");

    if (!isBrowser) {
      throw new Error("Gyroscope operations require a browser environment");
    }

    try {
      if (!isGyroscopeRunning) {
        console.warn("Gyroscope is not running");
        return true;
      }

      isGyroscopeRunning = false;

      // Remove event listener
      window.removeEventListener(
        "deviceorientation",
        handleDeviceOrientation,
        true
      );

      // Clear interval if it exists
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }

      // Reset readings
      currentReading = { x: 0, y: 0, z: 0 };
      previousReading = { alpha: 0, beta: 0, gamma: 0 };

      console.log("Gyroscope stopped successfully");
      return true;
    } catch (error) {
      console.warn("Failed to stop gyroscope:", error);
      return false;
    }
  },

  getCurrentReading: async () => {
    console.log("[WEB] Gyroscope getCurrentReading");

    if (!isBrowser) {
      throw new Error("Gyroscope operations require a browser environment");
    }

    if (!isGyroscopeRunning) {
      console.warn("Gyroscope is not running. Start it first to get readings.");
      return { x: 0, y: 0, z: 0 };
    }

    return { ...currentReading };
  },

  isRunning: async () => {
    console.log("[WEB] Gyroscope isRunning");

    if (!isBrowser) {
      throw new Error("Gyroscope operations require a browser environment");
    }

    return isGyroscopeRunning;
  },
};
