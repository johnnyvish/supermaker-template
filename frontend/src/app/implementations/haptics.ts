import type { HapticsAPI } from "@/modules/module_types/haptics";

// Check if we're in a browser environment with vibration support
const isBrowser =
  typeof window !== "undefined" && typeof navigator !== "undefined";
const hasVibration = isBrowser && "vibrate" in navigator;

// Vibration patterns for different haptic feedback types
const VIBRATION_PATTERNS = {
  selection: [10], // Short, light tap
  light: [20],
  medium: [40],
  heavy: [80],
  rigid: [30, 10, 30], // Sharp pattern
  soft: [60], // Longer, gentler vibration
  success: [100, 50, 100], // Double pulse
  warning: [200, 100, 200, 100, 200], // Triple pulse
  error: [500], // Long vibration
};

// Helper function to trigger vibration
const vibrate = (pattern: number[]): boolean => {
  if (!hasVibration) {
    console.warn("Vibration API not supported");
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch (error) {
    console.warn("Failed to trigger vibration:", error);
    return false;
  }
};

export const haptics: HapticsAPI = {
  selection: async () => {
    console.log("[WEB] Haptics selection");
    return vibrate(VIBRATION_PATTERNS.selection);
  },

  impact: async (style: "light" | "medium" | "heavy" | "rigid" | "soft") => {
    console.log(`[WEB] Haptics impact: ${style}`);
    return vibrate(VIBRATION_PATTERNS[style]);
  },

  impactLight: async () => {
    console.log("[WEB] Haptics impactLight");
    return vibrate(VIBRATION_PATTERNS.light);
  },

  impactMedium: async () => {
    console.log("[WEB] Haptics impactMedium");
    return vibrate(VIBRATION_PATTERNS.medium);
  },

  impactHeavy: async () => {
    console.log("[WEB] Haptics impactHeavy");
    return vibrate(VIBRATION_PATTERNS.heavy);
  },

  notification: async (type: "success" | "warning" | "error") => {
    console.log(`[WEB] Haptics notification: ${type}`);
    return vibrate(VIBRATION_PATTERNS[type]);
  },

  notifySuccess: async () => {
    console.log("[WEB] Haptics notifySuccess");
    return vibrate(VIBRATION_PATTERNS.success);
  },

  notifyWarning: async () => {
    console.log("[WEB] Haptics notifyWarning");
    return vibrate(VIBRATION_PATTERNS.warning);
  },

  notifyError: async () => {
    console.log("[WEB] Haptics notifyError");
    return vibrate(VIBRATION_PATTERNS.error);
  },
};
