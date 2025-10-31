// Self-contained mock pedometer implementation

export const pedometer = {
    getPermissions: async () => {
        console.log('[MOCK] Pedometer getPermissions');
        return { granted: true };
    },
    requestPermissions: async () => {
        console.log('[MOCK] Pedometer requestPermissions');
        return { granted: true };
    },
    getStepCount: async (startDate: Date | string, endDate: Date | string) => {
        console.log(
            `[MOCK] Pedometer getStepCount: ${startDate} to ${endDate}`
        );
        return { steps: 1000 };
    },
    startStepCounter: async () => {
        console.log('[MOCK] Pedometer startStepCounter');
        return true;
    },
    stopStepCounter: async () => {
        console.log('[MOCK] Pedometer stopStepCounter');
        return true;
    },
    isTracking: async () => {
        console.log('[MOCK] Pedometer isTracking');
        return false;
    },
};
