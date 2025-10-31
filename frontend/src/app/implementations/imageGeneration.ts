// Self-contained image generation using Canvas as a placeholder

/**
 * Convert blob to base64 data URL
 */
const blobToBase64DataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const makeCanvas = (w: number, h: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
};

const sizeToDims = (
    size: '1024x1024' | '1024x1536' | '1536x1024' | 'auto'
): { w: number; h: number } => {
    switch (size) {
        case '1024x1536':
            return { w: 1024, h: 1536 };
        case '1536x1024':
            return { w: 1536, h: 1024 };
        case 'auto':
        case '1024x1024':
        default:
            return { w: 1024, h: 1024 };
    }
};

const drawPlaceholder = async (
    prompt: string,
    size: '1024x1024' | '1024x1536' | '1536x1024' | 'auto',
    background: 'transparent' | 'opaque'
): Promise<string> => {
    if (typeof document === 'undefined') {
        // Server-side fallback: 1x1 transparent PNG
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
    }

    const { w, h } = sizeToDims(size);
    const canvas = makeCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/png');

    if (background === 'opaque') {
        ctx.fillStyle = '#f2f2f2';
        ctx.fillRect(0, 0, w, h);
    } else {
        // Transparent background by default
        ctx.clearRect(0, 0, w, h);
    }

    // Simple gradient box
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#4f46e5');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    ctx.fillRect(20, 20, w - 40, h - 40);

    // Draw prompt text
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.max(16, Math.min(28, Math.floor(w / 36)))}px Arial`;
    const words = prompt.slice(0, 160).split(' ');
    const maxWidth = w - 80;
    let line = '';
    let y = 80;
    for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxWidth) {
            ctx.fillText(line, 40, y);
            line = word + ' ';
            y += 32;
        } else {
            line = test;
        }
    }
    if (line) ctx.fillText(line, 40, y);

    return canvas.toDataURL('image/png');
};

/**
 * Generate an image from a text prompt
 * @param prompt Text description of the image
 * @param quality Optional quality setting
 * @param size Optional size setting
 * @param background Optional background setting
 * @returns Base64 data URL of the generated image
 */

export const generate = async (
    prompt: string,
    quality: 'low' | 'medium' | 'high' | 'auto' = 'auto',
    size: '1024x1024' | '1024x1536' | '1536x1024' | 'auto' = 'auto',
    background: 'transparent' | 'opaque' = 'opaque'
): Promise<string> => {
    void quality; // quality is a no-op for the placeholder
    return drawPlaceholder(prompt, size, background);
};

/**
 * Edit an existing image using AI
 * @param imageDataUrl Base64 data URL of the image to edit
 * @param prompt Description of the changes to make
 * @param maskDataUrl Optional mask image (transparent areas will be replaced)
 * @param quality Optional quality setting
 * @param size Optional size setting
 * @param background Optional background setting
 * @returns Base64 data URL of the edited image
 */
export const edit = async (
    imageDataUrl: string,
    prompt: string,
    quality: 'low' | 'medium' | 'high' | 'auto' = 'auto',
    _size: '1024x1024' | '1024x1536' | '1536x1024' | 'auto' = 'auto',
    background: 'transparent' | 'opaque' = 'opaque'
): Promise<string> => {
    void _size;
    void quality;
    if (typeof document === 'undefined') return imageDataUrl;
    try {
        // Draw the original image, then overlay prompt text as a simple "edit"
        const img = new Image();
        const dataUrl = await new Promise<string>((resolve, reject) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(imageDataUrl);
                ctx.drawImage(img, 0, 0);

                // Optional background handling: if transparent requested, keep alpha
                if (background === 'opaque') {
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.globalCompositeOperation = 'source-over';
                }

                // Overlay a subtle edit marker and prompt snippet
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
                ctx.fillStyle = '#ffffff';
                ctx.font = `${Math.max(
                    14,
                    Math.floor(canvas.width / 40)
                )}px Arial`;
                const text = `Edited: ${prompt.slice(0, 80)}`;
                ctx.fillText(text, 16, canvas.height - 20);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(imageDataUrl);
            img.src = imageDataUrl;
        });
        return dataUrl;
    } catch (error) {
        console.warn('Local edit failed:', error);
        return imageDataUrl;
    }
};

/**
 * Generate an image with transparent background
 * @param prompt Text description of the image (works best with isolated subjects)
 * @param quality Optional quality setting
 * @param size Optional size setting
 * @returns Base64 data URL of the generated PNG image with transparency
 */
export const generateWithTransparency = async (
    prompt: string,
    quality: 'low' | 'medium' | 'high' | 'auto' = 'auto',
    size: '1024x1024' | '1024x1536' | '1536x1024' | 'auto' = 'auto'
): Promise<string> => {
    // Add transparency hint to prompt if not already present
    const enhancedPrompt =
        prompt.toLowerCase().includes('transparent') ||
        prompt.toLowerCase().includes('isolated')
            ? prompt
            : `${prompt}, isolated on transparent background`;

    return generate(enhancedPrompt, quality, size, 'transparent');
};

/**
 * Main export with all the functions
 */

export const imageGeneration = {
    generate,
    edit,
    generateWithTransparency,
};
