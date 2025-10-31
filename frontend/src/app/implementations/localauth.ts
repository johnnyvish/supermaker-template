// Self-contained mock local auth implementation

export const localauth = {
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
        console.log('[MOCK] LocalAuth checkAvailability');
        return {
            available: true,
            enrolled: true,
            biometryType: 'TouchID',
        };
    },
    isFaceIdSupported: async () => {
        console.log('[MOCK] LocalAuth isFaceIdSupported');
        return true;
    },
};
