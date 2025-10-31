// Local event dispatcher to keep this file self-contained
const sendEventToWebView = (eventName: string, detail?: unknown) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
};

// Position interface for our location format
interface LocationPosition {
    coords: {
        latitude: number;
        longitude: number;
        altitude: number | null;
        accuracy: number;
        altitudeAccuracy: number | null;
        heading: number | null;
        speed: number | null;
    };
    timestamp: number;
}

// Nominatim API response interface
interface NominatimResponse {
    lat: string;
    lon: string;
    address?: {
        road?: string;
        house_number?: string;
        city?: string;
        town?: string;
        village?: string;
        suburb?: string;
        neighbourhood?: string;
        state?: string;
        province?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
    };
    display_name?: string;
}

// Check if we're in a browser environment with geolocation support
const isBrowser =
    typeof window !== 'undefined' && typeof navigator !== 'undefined';
const hasGeolocation = isBrowser && 'geolocation' in navigator;

// Store active watchers
const activeWatchers = new Map<string, number>();
let watchIdCounter = 0;

// Storage for last known position
const LAST_POSITION_KEY = 'appfactory_last_position';

// Convert accuracy level to options
const getPositionOptions = (
    accuracy?: 'low' | 'balanced' | 'high' | 'highest'
): PositionOptions => {
    const options: PositionOptions = {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
    };

    switch (accuracy) {
        case 'highest':
            options.enableHighAccuracy = true;
            options.timeout = 30000;
            options.maximumAge = 60000; // 1 minute
            break;
        case 'high':
            options.enableHighAccuracy = true;
            options.timeout = 20000;
            options.maximumAge = 120000; // 2 minutes
            break;
        case 'balanced':
            options.enableHighAccuracy = false;
            options.timeout = 15000;
            options.maximumAge = 300000; // 5 minutes
            break;
        case 'low':
            options.enableHighAccuracy = false;
            options.timeout = 10000;
            options.maximumAge = 600000; // 10 minutes
            break;
    }

    return options;
};

// Convert GeolocationPosition to our format
const convertPosition = (position: GeolocationPosition) => {
    return {
        coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
        },
        timestamp: position.timestamp,
    };
};

// Store last known position
const storeLastPosition = (position: LocationPosition) => {
    if (isBrowser) {
        localStorage.setItem(LAST_POSITION_KEY, JSON.stringify(position));
    }
};

// Get stored last position
const getStoredLastPosition = () => {
    if (!isBrowser) return null;
    const stored = localStorage.getItem(LAST_POSITION_KEY);
    return stored ? JSON.parse(stored) : null;
};

// Simple geocoding using a public API (OpenStreetMap Nominatim)
const geocodeWithNominatim = async (address: string) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                address
            )}&limit=5`
        );
        const data = await response.json();

        return (data as NominatimResponse[]).map((item) => ({
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            accuracy: 100, // Approximate accuracy for geocoding
            altitude: undefined,
        }));
    } catch (error) {
        console.warn('Geocoding failed:', error);
        return [];
    }
};

// Simple reverse geocoding using Nominatim
const reverseGeocodeWithNominatim = async (
    latitude: number,
    longitude: number
) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = (await response.json()) as NominatimResponse;

        if (data.address) {
            const addr = data.address;
            return [
                {
                    city: addr.city || addr.town || addr.village || null,
                    district: addr.suburb || addr.neighbourhood || null,
                    streetNumber: addr.house_number || null,
                    street: addr.road || null,
                    region: addr.state || addr.province || null,
                    subregion: null,
                    country: addr.country || null,
                    postalCode: addr.postcode || null,
                    name: data.display_name || null,
                    isoCountryCode: addr.country_code
                        ? addr.country_code.toUpperCase()
                        : null,
                    timezone: null,
                },
            ];
        }

        return [];
    } catch (error) {
        console.warn('Reverse geocoding failed:', error);
        return [];
    }
};

export const location = {
    getCurrentPosition: async (
        accuracy?: 'low' | 'balanced' | 'high' | 'highest'
    ) => {
        console.log(`[WEB] Location getCurrentPosition: ${accuracy}`);

        if (!hasGeolocation) {
            throw new Error('Geolocation is not supported by this browser');
        }

        const options = getPositionOptions(accuracy);

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const result = convertPosition(position);
                    storeLastPosition(result);
                    resolve(result);
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    reject(new Error(`Geolocation failed: ${error.message}`));
                },
                options
            );
        });
    },

    watchPosition: async (
        accuracy?: 'low' | 'balanced' | 'high' | 'highest',
        timeInterval?: number,
        distanceInterval?: number
    ) => {
        console.log(
            `[WEB] Location watchPosition: ${accuracy}, interval: ${timeInterval}, distance: ${distanceInterval}`
        );

        if (!hasGeolocation) {
            throw new Error('Geolocation is not supported by this browser');
        }

        const options = getPositionOptions(accuracy);
        const watchId = `watch_${++watchIdCounter}`;

        // Note: Web Geolocation API doesn't support timeInterval/distanceInterval directly
        // This is a limitation of the web platform

        const nativeWatchId = navigator.geolocation.watchPosition(
            (position) => {
                const result = convertPosition(position);
                storeLastPosition(result);
                // Send location update event to WebView
                sendEventToWebView('locationUpdate', result);
                console.log(`Position update for watch ${watchId}:`, result);
            },
            (error) => {
                console.warn(`Geolocation watch error for ${watchId}:`, error);
                // Send error event to WebView
                sendEventToWebView('locationError', {
                    watchId,
                    error: error.message,
                });
            },
            options
        );

        activeWatchers.set(watchId, nativeWatchId);
        return watchId;
    },

    clearWatch: async (watchId: string) => {
        console.log(`[WEB] Location clearWatch: ${watchId}`);

        const nativeWatchId = activeWatchers.get(watchId);
        if (nativeWatchId !== undefined) {
            navigator.geolocation.clearWatch(nativeWatchId);
            activeWatchers.delete(watchId);
            return true;
        }

        return false;
    },

    geocodeAddress: async (address: string) => {
        console.log(`[WEB] Location geocodeAddress: ${address}`);

        if (!isBrowser) {
            throw new Error('Geocoding requires a browser environment');
        }

        return await geocodeWithNominatim(address);
    },

    reverseGeocode: async (latitude: number, longitude: number) => {
        console.log(`[WEB] Location reverseGeocode: ${latitude}, ${longitude}`);

        if (!isBrowser) {
            throw new Error('Reverse geocoding requires a browser environment');
        }

        return await reverseGeocodeWithNominatim(latitude, longitude);
    },

    isLocationServicesEnabled: async () => {
        console.log('[WEB] Location isLocationServicesEnabled');
        return hasGeolocation;
    },

    getLastKnownPosition: async (
        maxAge?: number,
        requiredAccuracy?: number
    ) => {
        console.log(
            `[WEB] Location getLastKnownPosition: maxAge: ${maxAge}, requiredAccuracy: ${requiredAccuracy}`
        );

        const stored = getStoredLastPosition();
        if (!stored) {
            return null;
        }

        // Check if position is too old
        if (maxAge && Date.now() - stored.timestamp > maxAge) {
            return null;
        }

        // Check if accuracy doesn't meet requirements
        if (
            requiredAccuracy &&
            stored.coords.accuracy &&
            stored.coords.accuracy > requiredAccuracy
        ) {
            return null;
        }

        return stored;
    },
};
