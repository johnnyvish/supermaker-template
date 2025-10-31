import type { MagnetometerAPI } from "@/modules/module_types/magnetometer";

export const magnetometer: MagnetometerAPI = {
  start: async (updateInterval = 100) => {
    console.log(
      `[MOCK] Magnetometer started with interval: ${updateInterval}ms`
    );
    return true;
  },
  stop: async () => {
    console.log("[MOCK] Magnetometer stopped");
    return true;
  },
  getCurrentReading: async () => {
    console.log("[MOCK] Getting current magnetometer reading");
    return { x: 0, y: 0, z: 0 };
  },
  isRunning: async () => {
    console.log("[MOCK] Checking if magnetometer is running");
    return false;
  },
};
