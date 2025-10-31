// Local event dispatcher to keep this file self-contained
const sendEventToWebView = (eventName: string, detail?: unknown) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
};

let motionInterval: ReturnType<typeof setInterval> | null = null;
let orientationInterval: ReturnType<typeof setInterval> | null = null;
let isMotionRunning = false;
let currentMotionData = {
    acceleration: { x: 0, y: 0, z: 0 },
    accelerationIncludingGravity: { x: 0, y: 0, z: 9.81 },
    rotation: { alpha: 0, beta: 0, gamma: 0 },
    rotationRate: { alpha: 0, beta: 0, gamma: 0 },
    orientation: 0,
};

export const devicemotion = {
    start: async (updateInterval = 100) => {
        if (typeof window !== 'undefined') {
            isMotionRunning = true;

            // Handle DeviceMotionEvent
            if ('DeviceMotionEvent' in window) {
                const handleMotion = (event: DeviceMotionEvent) => {
                    currentMotionData.acceleration = {
                        x: event.acceleration?.x || 0,
                        y: event.acceleration?.y || 0,
                        z: event.acceleration?.z || 0,
                    };
                    currentMotionData.accelerationIncludingGravity = {
                        x: event.accelerationIncludingGravity?.x || 0,
                        y: event.accelerationIncludingGravity?.y || 0,
                        z: event.accelerationIncludingGravity?.z || 9.81,
                    };
                    currentMotionData.rotationRate = {
                        alpha: event.rotationRate?.alpha || 0,
                        beta: event.rotationRate?.beta || 0,
                        gamma: event.rotationRate?.gamma || 0,
                    };
                };
                window.addEventListener('devicemotion', handleMotion);
            }

            // Handle DeviceOrientationEvent
            if ('DeviceOrientationEvent' in window) {
                const handleOrientation = (event: DeviceOrientationEvent) => {
                    currentMotionData.rotation = {
                        alpha: event.alpha || 0,
                        beta: event.beta || 0,
                        gamma: event.gamma || 0,
                    };
                    // Calculate orientation (0: portrait, 90: landscape-left, -90: landscape-right, 180: portrait-upside-down)
                    if (window.orientation !== undefined) {
                        currentMotionData.orientation = window.orientation;
                    }
                };
                window.addEventListener('deviceorientation', handleOrientation);
            }

            // Handle orientation change
            if ('orientationchange' in window) {
                const handleOrientationChange = () => {
                    if (window.orientation !== undefined) {
                        currentMotionData.orientation = window.orientation;
                    }
                };
                window.addEventListener(
                    'orientationchange',
                    handleOrientationChange
                );
            }

            // Set up polling interval to send events
            motionInterval = setInterval(() => {
                sendEventToWebView('devicemotionUpdate', currentMotionData);
            }, updateInterval);

            return true;
        }

        // Fallback to simulated data
        isMotionRunning = true;
        motionInterval = setInterval(() => {
            const time = Date.now() / 1000;
            currentMotionData = {
                acceleration: {
                    x: Math.sin(time) * 0.5,
                    y: Math.cos(time) * 0.5,
                    z: Math.sin(time * 0.5) * 0.2,
                },
                accelerationIncludingGravity: {
                    x: Math.sin(time) * 0.5,
                    y: Math.cos(time) * 0.5,
                    z: 9.81 + Math.sin(time * 0.5) * 0.2,
                },
                rotation: {
                    alpha: (time * 10) % 360,
                    beta: Math.sin(time) * 45,
                    gamma: Math.cos(time) * 45,
                },
                rotationRate: {
                    alpha: 10,
                    beta: Math.cos(time) * 45,
                    gamma: -Math.sin(time) * 45,
                },
                orientation: 0,
            };

            // Send event to WebView
            sendEventToWebView('devicemotionUpdate', currentMotionData);
        }, updateInterval);

        return true;
    },

    stop: async () => {
        isMotionRunning = false;

        if (motionInterval) {
            clearInterval(motionInterval);
            motionInterval = null;
        }

        if (orientationInterval) {
            clearInterval(orientationInterval);
            orientationInterval = null;
        }

        if (typeof window !== 'undefined') {
            window.removeEventListener('devicemotion', () => {});
            window.removeEventListener('deviceorientation', () => {});
            window.removeEventListener('orientationchange', () => {});
        }

        return true;
    },

    getCurrentReading: async () => {
        return currentMotionData;
    },

    isRunning: async () => {
        return isMotionRunning;
    },
};
