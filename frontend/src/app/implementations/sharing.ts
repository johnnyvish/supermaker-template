import { storage } from './storage';

// Check if we're in a browser environment with Web Share API support
const isBrowser =
    typeof window !== 'undefined' && typeof navigator !== 'undefined';
const hasWebShare = isBrowser && 'share' in navigator;

// Fallback sharing methods
const fallbackShareText = (text: string): boolean => {
    try {
        // Copy to clipboard as fallback
        if ('clipboard' in navigator) {
            navigator.clipboard.writeText(text);
            alert(
                `Text copied to clipboard: ${text.substring(0, 100)}${
                    text.length > 100 ? '...' : ''
                }`
            );
            return true;
        }

        // Even more basic fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (success) {
            alert(
                `Text copied to clipboard: ${text.substring(0, 100)}${
                    text.length > 100 ? '...' : ''
                }`
            );
        }

        return success;
    } catch (error) {
        console.warn('Fallback text sharing failed:', error);
        return false;
    }
};

const fallbackShareUrl = (url: string): boolean => {
    try {
        // Open in new tab as fallback
        window.open(url, '_blank');
        return true;
    } catch (error) {
        console.warn('Fallback URL sharing failed:', error);
        return false;
    }
};

const fallbackShareFile = (path: string): boolean => {
    try {
        // For file paths that are URLs, open them
        if (
            path.startsWith('http://') ||
            path.startsWith('https://') ||
            path.startsWith('blob:')
        ) {
            const link = document.createElement('a');
            link.href = path;
            link.download = path.split('/').pop() || 'shared-file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return true;
        }

        // For other paths, just copy the path
        return fallbackShareText(path);
    } catch (error) {
        console.warn('Fallback file sharing failed:', error);
        return false;
    }
};

export const sharing = {
    shareFile: async (path: string) => {
        console.log(`[WEB] Sharing shareFile: ${path}`);

        if (!isBrowser) {
            throw new Error('File sharing requires a browser environment');
        }

        try {
            if (hasWebShare) {
                // Try to fetch the file and share it
                if (
                    path.startsWith('http://') ||
                    path.startsWith('https://') ||
                    path.startsWith('blob:')
                ) {
                    try {
                        const response = await fetch(path);
                        const blob = await response.blob();
                        const file = new File(
                            [blob],
                            path.split('/').pop() || 'shared-file',
                            { type: blob.type }
                        );

                        if (
                            navigator.canShare &&
                            navigator.canShare({ files: [file] })
                        ) {
                            await navigator.share({
                                files: [file],
                                title: 'Shared File',
                            });
                            return true;
                        }
                    } catch (shareError) {
                        console.warn(
                            'File sharing with Web Share API failed, using fallback:',
                            shareError
                        );
                    }
                }

                // Fallback to sharing the URL/path as text
                await navigator.share({
                    title: 'Shared File',
                    text: `File: ${path}`,
                    url: path.startsWith('http') ? path : undefined,
                });
                return true;
            }

            // Use fallback method
            return fallbackShareFile(path);
        } catch (error) {
            console.warn('File sharing failed:', error);
            return false;
        }
    },

    shareText: async (text: string) => {
        console.log(
            `[WEB] Sharing shareText: ${text.substring(0, 50)}${
                text.length > 50 ? '...' : ''
            }`
        );

        if (!isBrowser) {
            throw new Error('Text sharing requires a browser environment');
        }

        try {
            if (hasWebShare) {
                await navigator.share({
                    title: 'Shared Text',
                    text: text,
                });
                return true;
            }

            // Use fallback method
            return fallbackShareText(text);
        } catch (error) {
            console.warn('Text sharing failed:', error);
            return false;
        }
    },

    shareURL: async (url: string) => {
        console.log(`[WEB] Sharing shareURL: ${url}`);

        if (!isBrowser) {
            throw new Error('URL sharing requires a browser environment');
        }

        try {
            if (hasWebShare) {
                await navigator.share({
                    title: 'Shared Link',
                    url: url,
                });
                return true;
            }

            // Use fallback method
            return fallbackShareUrl(url);
        } catch (error) {
            console.warn('URL sharing failed:', error);
            return false;
        }
    },

    shareStoredImage: async (key: string) => {
        console.log(`[WEB] Sharing shareStoredImage: ${key}`);

        if (!isBrowser) {
            throw new Error('Image sharing requires a browser environment');
        }

        try {
            // Get the stored image
            const imageDataUrl = await storage.getImageItem(key);
            if (!imageDataUrl) {
                throw new Error(`No image found with key: ${key}`);
            }

            if (hasWebShare) {
                try {
                    // Convert data URL to blob
                    const response = await fetch(imageDataUrl);
                    const blob = await response.blob();
                    const file = new File([blob], `${key}.png`, {
                        type: blob.type,
                    });

                    if (
                        navigator.canShare &&
                        navigator.canShare({ files: [file] })
                    ) {
                        await navigator.share({
                            files: [file],
                            title: `Shared Image: ${key}`,
                        });
                        return true;
                    }
                } catch (shareError) {
                    console.warn(
                        'Image sharing with Web Share API failed, using fallback:',
                        shareError
                    );
                }
            }

            // Fallback: download the image
            const link = document.createElement('a');
            link.href = imageDataUrl;
            link.download = `${key}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return true;
        } catch (error) {
            console.warn('Stored image sharing failed:', error);
            return false;
        }
    },
};
