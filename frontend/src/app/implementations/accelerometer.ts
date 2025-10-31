import type { AccelerometerAPI } from "@/modules/module_types/accelerometer";
import { sendEventToWebView } from "@/utils";

let accelerometerInterval: ReturnType<typeof setInterval> | null = null;
let currentReading = { x: 0, y: 0, z: 0 };
let isAccelerometerRunning = false;
let motionHandler: ((event: DeviceMotionEvent) => void) | null = null;

export const accelerometer: AccelerometerAPI = {
  start: async (updateInterval = 100) => {
    if (typeof window !== "undefined" && "DeviceMotionEvent" in window) {
      isAccelerometerRunning = true;

      const handleMotion = (event: DeviceMotionEvent) => {
        if (event.accelerationIncludingGravity) {
          currentReading = {
            x: event.accelerationIncludingGravity.x || 0,
            y: event.accelerationIncludingGravity.y || 0,
            z: event.accelerationIncludingGravity.z || 0,
          };

          // Send event to WebView
          sendEventToWebView("accelerometerUpdate", currentReading);
        }
      };

      motionHandler = handleMotion;
      window.addEventListener("devicemotion", handleMotion);

      accelerometerInterval = setInterval(() => {
        // Send current reading at the specified interval
        sendEventToWebView("accelerometerUpdate", currentReading);
      }, updateInterval);

      return true;
    }

    // Fallback to simulated data for environments without DeviceMotion
    isAccelerometerRunning = true;
    accelerometerInterval = setInterval(() => {
      currentReading = {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: 9.8 + (Math.random() * 0.2 - 0.1),
      };

      // Send event to WebView
      sendEventToWebView("accelerometerUpdate", currentReading);
    }, updateInterval);

    return true;
  },

  stop: async () => {
    isAccelerometerRunning = false;

    if (accelerometerInterval) {
      clearInterval(accelerometerInterval);
      accelerometerInterval = null;
    }

    if (typeof window !== "undefined" && motionHandler) {
      window.removeEventListener("devicemotion", motionHandler);
      motionHandler = null;
    }

    return true;
  },

  getCurrentReading: async () => {
    return currentReading;
  },

  isRunning: async () => {
    return isAccelerometerRunning;
  },
};
