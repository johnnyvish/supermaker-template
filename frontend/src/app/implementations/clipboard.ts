// Self-contained clipboard implementation

// Check if we're in a browser environment with Clipboard API support
const isBrowser =
    typeof window !== 'undefined' && typeof navigator !== 'undefined';
const hasClipboardAPI = isBrowser && 'clipboard' in navigator;

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Helper function to convert base64 to blob
const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

// Helper function to check if string is a valid URL
const isValidUrl = (string: string): boolean => {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
};

export const clipboard = {
    getString: async () => {
        console.log('[WEB] Clipboard getString');

        if (!hasClipboardAPI) {
            throw new Error('Clipboard API not supported in this environment');
        }

        try {
            const text = await navigator.clipboard.readText();
            return text;
        } catch (error) {
            console.warn('Failed to read clipboard text:', error);
            throw new Error(
                'Failed to read clipboard text - permission denied or not supported'
            );
        }
    },

    setString: async (text: string) => {
        console.log(
            `[WEB] Clipboard setString: ${text.substring(0, 50)}${
                text.length > 50 ? '...' : ''
            }`
        );

        if (!hasClipboardAPI) {
            // Fallback for older browsers
            if (
                isBrowser &&
                document.queryCommandSupported &&
                document.queryCommandSupported('copy')
            ) {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            }
            throw new Error('Clipboard API not supported in this environment');
        }

        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('Failed to write clipboard text:', error);
            return false;
        }
    },

    getImage: async () => {
        console.log('[WEB] Clipboard getImage');

        if (!hasClipboardAPI) {
            throw new Error('Clipboard API not supported in this environment');
        }

        try {
            const clipboardItems = await navigator.clipboard.read();

            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        const blob = await clipboardItem.getType(type);
                        const base64 = await blobToBase64(blob);

                        // Create a temporary image to get dimensions
                        return new Promise<{
                            data: string;
                            size: { width: number; height: number };
                        }>((resolve, reject) => {
                            const img = new Image();
                            img.onload = () => {
                                resolve({
                                    data: base64,
                                    size: {
                                        width: img.width,
                                        height: img.height,
                                    },
                                });
                            };
                            img.onerror = reject;
                            img.src = `data:${type};base64,${base64}`;
                        });
                    }
                }
            }

            return null; // No image found
        } catch (error) {
            console.warn('Failed to read clipboard image:', error);
            return null;
        }
    },

    setImage: async (base64Image: string) => {
        console.log(
            `[WEB] Clipboard setImage: ${base64Image.substring(0, 50)}...`
        );

        if (!hasClipboardAPI) {
            throw new Error('Clipboard API not supported in this environment');
        }

        try {
            // Remove data URL prefix if present
            const cleanBase64 = base64Image.replace(
                /^data:image\/\w+;base64,/,
                ''
            );
            const blob = base64ToBlob(cleanBase64);

            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob }),
            ]);

            return true;
        } catch (error) {
            console.warn('Failed to write clipboard image:', error);
            return false;
        }
    },

    getUrl: async () => {
        console.log('[WEB] Clipboard getUrl');

        try {
            const text = await clipboard.getString();
            return isValidUrl(text) ? text : null;
        } catch (error) {
            console.warn('Failed to get URL from clipboard:', error);
            return null;
        }
    },

    setUrl: async (url: string) => {
        console.log(`[WEB] Clipboard setUrl: ${url}`);

        if (!isValidUrl(url)) {
            throw new Error('Invalid URL provided');
        }

        return await clipboard.setString(url);
    },

    hasString: async () => {
        console.log('[WEB] Clipboard hasString');

        if (!hasClipboardAPI) {
            return false;
        }

        try {
            const text = await navigator.clipboard.readText();
            return text.length > 0;
        } catch (error) {
            console.warn('Failed to check clipboard for string:', error);
            return false;
        }
    },

    hasImage: async () => {
        console.log('[WEB] Clipboard hasImage');

        if (!hasClipboardAPI) {
            return false;
        }

        try {
            const clipboardItems = await navigator.clipboard.read();

            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            console.warn('Failed to check clipboard for image:', error);
            return false;
        }
    },

    hasUrl: async () => {
        console.log('[WEB] Clipboard hasUrl');

        try {
            const text = await clipboard.getString();
            return isValidUrl(text);
        } catch (error) {
            console.warn('Failed to check clipboard for URL:', error);
            return false;
        }
    },
};
