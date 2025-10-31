import type { LocalAuthAPI } from "@/modules/module_types/localauth";

export const localauth: LocalAuthAPI = {
  authenticate: async (
    promptMessage?: string,
    cancelLabel?: string,
    fallbackLabel?: string,
    disableDeviceFallback?: boolean
  ) => {
    console.log(
      `[MOCK] LocalAuth authenticate: ${promptMessage} cancel: ${cancelLabel} fallback: ${fallbackLabel} disableFallback: ${disableDeviceFallback}`
    );
    return { success: true };
  },
  checkAvailability: async () => {
    console.log("[MOCK] LocalAuth checkAvailability");
    return {
      available: true,
      enrolled: true,
      biometryType: "TouchID",
    };
  },
  isFaceIdSupported: async () => {
    console.log("[MOCK] LocalAuth isFaceIdSupported");
    return true;
  },
};
