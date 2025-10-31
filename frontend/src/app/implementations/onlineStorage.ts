// Self-contained, browser-based implementation backed by localStorage
const STORAGE_KEY_PREFIX = 'online_apps_';

const isBrowser =
    typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const prefixKey = (key: string): string => {
    const appId =
        ((globalThis as Record<string, unknown>).appId as string) || 'web_app';
    return `${STORAGE_KEY_PREFIX}${appId}_${key}`;
};

export const onlineStorage = {
    async getItem(key: string): Promise<string | null> {
        if (!isBrowser) return null;
        try {
            return localStorage.getItem(prefixKey(key));
        } catch (error) {
            console.error('Error getting item:', error);
            return null;
        }
    },

    async setItem(key: string, value: string): Promise<boolean> {
        if (!isBrowser) return false;
        try {
            localStorage.setItem(prefixKey(key), value);
            return true;
        } catch (error) {
            console.error('Error setting item:', error);
            return false;
        }
    },

    async removeItem(key: string): Promise<boolean> {
        if (!isBrowser) return false;
        try {
            localStorage.removeItem(prefixKey(key));
            return true;
        } catch (error) {
            console.error('Error removing item:', error);
            return false;
        }
    },

    async getAllItems(): Promise<Record<string, string | null>> {
        if (!isBrowser) return {};
        try {
            const appId =
                ((globalThis as Record<string, unknown>).appId as string) ||
                'web_app';
            const appSpecificPrefix = `${STORAGE_KEY_PREFIX}${appId}_`;
            const result: Record<string, string | null> = {};
            for (let i = 0; i < localStorage.length; i++) {
                const fullKey = localStorage.key(i);
                if (fullKey && fullKey.startsWith(appSpecificPrefix)) {
                    const cleanKey = fullKey.slice(appSpecificPrefix.length);
                    result[cleanKey] = localStorage.getItem(fullKey);
                }
            }
            return result;
        } catch (error) {
            console.error('Error getting all items:', error);
            return {};
        }
    },

    async clearAllItems(): Promise<boolean> {
        if (!isBrowser) return false;
        try {
            const appId =
                ((globalThis as Record<string, unknown>).appId as string) ||
                'web_app';
            const appSpecificPrefix = `${STORAGE_KEY_PREFIX}${appId}_`;
            const toRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(appSpecificPrefix)) {
                    toRemove.push(key);
                }
            }
            toRemove.forEach((k) => localStorage.removeItem(k));
            return true;
        } catch (error) {
            console.error('Error clearing all items:', error);
            return false;
        }
    },

    async getAllKeys(): Promise<string[]> {
        if (!isBrowser) return [];
        try {
            const appId =
                ((globalThis as Record<string, unknown>).appId as string) ||
                'web_app';
            const appSpecificPrefix = `${STORAGE_KEY_PREFIX}${appId}_`;
            const keys: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const fullKey = localStorage.key(i);
                if (fullKey && fullKey.startsWith(appSpecificPrefix)) {
                    keys.push(fullKey.slice(appSpecificPrefix.length));
                }
            }
            keys.sort();
            return keys;
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    },

    async mergeItem(key: string, value: string): Promise<boolean> {
        try {
            const existingValue = await this.getItem(key);
            if (existingValue) {
                try {
                    const existingObject = JSON.parse(existingValue);
                    const newObject = JSON.parse(value);
                    const mergedValue = JSON.stringify({
                        ...existingObject,
                        ...newObject,
                    });
                    return await this.setItem(key, mergedValue);
                } catch (error) {
                    console.error('Merge error:', error);
                    throw new Error('Cannot merge non-JSON values');
                }
            }
            return await this.setItem(key, value);
        } catch (error) {
            console.error('Error merging item:', error);
            return false;
        }
    },

    async multiGet(keys: string[]): Promise<Record<string, string | null>> {
        if (!isBrowser || keys.length === 0) return {};
        const entries = await Promise.all(
            keys.map(async (k) => [k, await this.getItem(k)] as const)
        );
        return Object.fromEntries(entries);
    },

    async multiSet(keyValuePairs: [string, string][]): Promise<boolean> {
        if (!isBrowser || keyValuePairs.length === 0) return true;
        try {
            for (const [k, v] of keyValuePairs) {
                await this.setItem(k, v);
            }
            return true;
        } catch (error) {
            console.error('Error in multiSet:', error);
            return false;
        }
    },

    async multiRemove(keys: string[]): Promise<boolean> {
        if (!isBrowser || keys.length === 0) return true;
        try {
            for (const k of keys) {
                await this.removeItem(k);
            }
            return true;
        } catch (error) {
            console.error('Error in multiRemove:', error);
            return false;
        }
    },
};
