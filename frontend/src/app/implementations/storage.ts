// Local type used for image metadata to keep this file self-contained
type ImageMetadata = {
    key: string;
    filePath: string;
    mimeType: string;
    timestamp: number;
};

// Check if we're in a browser environment
const isBrowser =
    typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Prefix for storage keys to avoid conflicts
const STORAGE_PREFIX = 'appfactory_storage_';
const IMAGE_PREFIX = 'appfactory_images_';

// Helper functions
const getPrefixedKey = (key: string) => STORAGE_PREFIX + key;
const getImageKey = (key: string) => IMAGE_PREFIX + key;

const isImageKey = (fullKey: string) => fullKey.startsWith(IMAGE_PREFIX);
const isStorageKey = (fullKey: string) => fullKey.startsWith(STORAGE_PREFIX);

const removePrefix = (fullKey: string, prefix: string) =>
    fullKey.substring(prefix.length);

// In-memory fallback for SSR/non-browser contexts
const memoryStore = new Map<string, string>();
const memoryImageStore = new Map<string, string>();

export const storage = {
    getItem: async (key: string) => {
        if (!isBrowser) {
            const prefixedKey = getPrefixedKey(key);
            return memoryStore.get(prefixedKey) ?? null;
        }

        try {
            const prefixedKey = getPrefixedKey(key);
            const value = localStorage.getItem(prefixedKey);
            return value;
        } catch (error) {
            console.warn('Failed to get storage item:', error);
            throw new Error(`Failed to get item: ${error}`);
        }
    },

    setItem: async (key: string, value: string) => {
        console.log(
            `[WEB] Storage setItem: ${key} = ${value.substring(0, 100)}${
                value.length > 100 ? '...' : ''
            }`
        );

        if (!isBrowser) {
            const prefixedKey = getPrefixedKey(key);
            memoryStore.set(prefixedKey, value);
            return true;
        }

        try {
            const prefixedKey = getPrefixedKey(key);
            localStorage.setItem(prefixedKey, value);
            return true;
        } catch (error) {
            console.warn('Failed to set storage item:', error);
            return false;
        }
    },

    removeItem: async (key: string) => {
        if (!isBrowser) {
            const prefixedKey = getPrefixedKey(key);
            return memoryStore.delete(prefixedKey);
        }

        try {
            const prefixedKey = getPrefixedKey(key);
            localStorage.removeItem(prefixedKey);
            return true;
        } catch (error) {
            console.warn('Failed to remove storage item:', error);
            return false;
        }
    },

    getAllItems: async () => {
        if (!isBrowser) {
            const items: Record<string, string | null> = {};
            for (const [k, v] of memoryStore.entries()) {
                if (isStorageKey(k) && !isImageKey(k)) {
                    const originalKey = removePrefix(k, STORAGE_PREFIX);
                    items[originalKey] = v ?? null;
                }
            }
            return items;
        }

        try {
            const items: Record<string, string | null> = {};

            for (let i = 0; i < localStorage.length; i++) {
                const fullKey = localStorage.key(i);
                if (fullKey && isStorageKey(fullKey) && !isImageKey(fullKey)) {
                    const originalKey = removePrefix(fullKey, STORAGE_PREFIX);
                    items[originalKey] = localStorage.getItem(fullKey);
                }
            }

            return items;
        } catch (error) {
            console.warn('Failed to get all storage items:', error);
            throw new Error(`Failed to get all items: ${error}`);
        }
    },

    setImageItem: async (key: string, imageDataUrl: string) => {
        console.log(
            `[WEB] Storage setImageItem: ${key}, size: ${imageDataUrl.length} chars`
        );

        if (!isBrowser) {
            // Validate that it's a proper data URL
            if (!imageDataUrl.startsWith('data:image/')) {
                throw new Error('Invalid image data URL format');
            }
            const imageKey = getImageKey(key);
            memoryImageStore.set(imageKey, imageDataUrl);
            return true;
        }

        try {
            // Validate that it's a proper data URL
            if (!imageDataUrl.startsWith('data:image/')) {
                throw new Error('Invalid image data URL format');
            }

            const imageKey = getImageKey(key);
            localStorage.setItem(imageKey, imageDataUrl);
            return true;
        } catch (error) {
            console.warn('Failed to set image item:', error);
            return false;
        }
    },

    getImageItem: async (key: string) => {
        if (!isBrowser) {
            const imageKey = getImageKey(key);
            return memoryImageStore.get(imageKey) ?? null;
        }

        try {
            const imageKey = getImageKey(key);
            const value = localStorage.getItem(imageKey);
            return value;
        } catch (error) {
            console.warn('Failed to get image item:', error);
            throw new Error(`Failed to get image item: ${error}`);
        }
    },

    removeImageItem: async (key: string) => {
        if (!isBrowser) {
            const imageKey = getImageKey(key);
            return memoryImageStore.delete(imageKey);
        }

        try {
            const imageKey = getImageKey(key);
            localStorage.removeItem(imageKey);
            return true;
        } catch (error) {
            console.warn('Failed to remove image item:', error);
            return false;
        }
    },

    getAllImageItems: async () => {
        if (!isBrowser) {
            const items: Record<string, ImageMetadata> = {};
            for (const [k, value] of memoryImageStore.entries()) {
                const originalKey = removePrefix(k, IMAGE_PREFIX);
                if (value) {
                    items[originalKey] = {
                        key: originalKey,
                        filePath: value,
                        mimeType: value.startsWith('data:')
                            ? value.split(';')[0].split(':')[1]
                            : 'image/jpeg',
                        timestamp: Date.now(),
                    };
                }
            }
            return items;
        }

        try {
            const items: Record<string, ImageMetadata> = {};

            for (let i = 0; i < localStorage.length; i++) {
                const fullKey = localStorage.key(i);
                if (fullKey && isImageKey(fullKey)) {
                    const originalKey = removePrefix(fullKey, IMAGE_PREFIX);
                    const value = localStorage.getItem(fullKey);
                    if (value) {
                        // Store image metadata - in web we store the actual data URI as the filePath
                        items[originalKey] = {
                            key: originalKey,
                            filePath: value, // In web, this is the data URI
                            mimeType: value.startsWith('data:')
                                ? value.split(';')[0].split(':')[1]
                                : 'image/jpeg',
                            timestamp: Date.now(),
                        };
                    }
                }
            }

            return items;
        } catch (error) {
            console.warn('Failed to get all image items:', error);
            throw new Error(`Failed to get all image items: ${error}`);
        }
    },
};
