import type { BarometerAPI } from "@/modules/module_types/barometer";

export const barometer: BarometerAPI = {
  start: async (updateInterval = 100) => {
    console.log(`[MOCK] Barometer started with interval: ${updateInterval}ms`);
    return true;
  },
  stop: async () => {
    console.log("[MOCK] Barometer stopped");
    return true;
  },
  getCurrentReading: async () => {
    console.log("[MOCK] Getting current barometer reading");
    return { pressure: 1013.25, relativeAltitude: 0, timestamp: Date.now() };
  },
  isRunning: async () => {
    console.log("[MOCK] Checking if barometer is running");
    return false;
  },
};
