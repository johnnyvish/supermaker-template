import type { ImageManipulatorAPI } from "@/modules/module_types/imageManipulator";

// Action types for image manipulation
type ImageAction = {
  type: string;
  [key: string]: unknown;
};

// Save options interface
interface SaveOptions {
  format?: "jpeg" | "png" | "webp";
  compress?: number;
  includeBase64?: boolean;
}

// Check if we're in a browser environment
const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

// Helper function to load an image from URI
const loadImage = (imageUri: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS for external images
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${imageUri}`));
    img.src = imageUri;
  });
};

// Helper function to create a canvas with specified dimensions
const createCanvas = (
  width: number,
  height: number
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
  if (!isBrowser) {
    throw new Error("Canvas operations require a browser environment");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get 2D rendering context");
  }

  return { canvas, ctx };
};

// Helper function to convert canvas to data URL
const canvasToDataUrl = (
  canvas: HTMLCanvasElement,
  format: "jpeg" | "png" | "webp",
  quality?: number
): string => {
  const mimeType = `image/${format}`;
  if (format === "jpeg") {
    return canvas.toDataURL(mimeType, quality);
  }
  return canvas.toDataURL(mimeType);
};

// Helper function to get image dimensions
const getImageDimensions = (
  img: HTMLImageElement
): { width: number; height: number } => {
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
  };
};

export const imageManipulator: ImageManipulatorAPI = {
  rotate: async (imageUri: string, degrees: number) => {
    console.log(
      `[WEB] ImageManipulator rotate: ${imageUri} by ${degrees} degrees`
    );

    if (!isBrowser) {
      throw new Error("Image manipulation requires a browser environment");
    }

    try {
      const img = await loadImage(imageUri);
      const { width: origWidth, height: origHeight } = getImageDimensions(img);

      // Calculate new dimensions after rotation
      const radians = (degrees * Math.PI) / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      const newWidth = Math.round(origWidth * cos + origHeight * sin);
      const newHeight = Math.round(origWidth * sin + origHeight * cos);

      const { canvas, ctx } = createCanvas(newWidth, newHeight);

      // Move to center, rotate, then move back
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(radians);
      ctx.drawImage(img, -origWidth / 2, -origHeight / 2);

      const uri = canvasToDataUrl(canvas, "png");
      return { uri, width: newWidth, height: newHeight };
    } catch (error) {
      console.warn("Failed to rotate image:", error);
      throw new Error(`Failed to rotate image: ${error}`);
    }
  },

  flip: async (imageUri: string, direction: "horizontal" | "vertical") => {
    console.log(`[WEB] ImageManipulator flip: ${imageUri} ${direction}`);

    if (!isBrowser) {
      throw new Error("Image manipulation requires a browser environment");
    }

    try {
      const img = await loadImage(imageUri);
      const { width, height } = getImageDimensions(img);
      const { canvas, ctx } = createCanvas(width, height);

      if (direction === "horizontal") {
        ctx.scale(-1, 1);
        ctx.drawImage(img, -width, 0);
      } else {
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, -height);
      }

      const uri = canvasToDataUrl(canvas, "png");
      return { uri, width, height };
    } catch (error) {
      console.warn("Failed to flip image:", error);
      throw new Error(`Failed to flip image: ${error}`);
    }
  },

  resize: async (imageUri: string, width?: number, height?: number) => {
    console.log(
      `[WEB] ImageManipulator resize: ${imageUri} to ${width}x${height}`
    );

    if (!isBrowser) {
      throw new Error("Image manipulation requires a browser environment");
    }

    try {
      const img = await loadImage(imageUri);
      const { width: origWidth, height: origHeight } = getImageDimensions(img);

      // Calculate dimensions maintaining aspect ratio if only one dimension is provided
      let newWidth = width || origWidth;
      let newHeight = height || origHeight;

      if (width && !height) {
        const aspectRatio = origHeight / origWidth;
        newHeight = Math.round(width * aspectRatio);
      } else if (height && !width) {
        const aspectRatio = origWidth / origHeight;
        newWidth = Math.round(height * aspectRatio);
      }

      const { canvas, ctx } = createCanvas(newWidth, newHeight);
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const uri = canvasToDataUrl(canvas, "png");
      return { uri, width: newWidth, height: newHeight };
    } catch (error) {
      console.warn("Failed to resize image:", error);
      throw new Error(`Failed to resize image: ${error}`);
    }
  },

  crop: async (
    imageUri: string,
    originX: number,
    originY: number,
    width: number,
    height: number
  ) => {
    console.log(
      `[WEB] ImageManipulator crop: ${imageUri} at (${originX},${originY}) size ${width}x${height}`
    );

    if (!isBrowser) {
      throw new Error("Image manipulation requires a browser environment");
    }

    try {
      const img = await loadImage(imageUri);
      const { canvas, ctx } = createCanvas(width, height);

      // Draw the cropped portion of the image
      ctx.drawImage(img, originX, originY, width, height, 0, 0, width, height);

      const uri = canvasToDataUrl(canvas, "png");
      return { uri, width, height };
    } catch (error) {
      console.warn("Failed to crop image:", error);
      throw new Error(`Failed to crop image: ${error}`);
    }
  },

  compress: async (imageUri: string, quality: number) => {
    console.log(
      `[WEB] ImageManipulator compress: ${imageUri} quality ${quality}`
    );

    if (!isBrowser) {
      throw new Error("Image manipulation requires a browser environment");
    }

    try {
      const img = await loadImage(imageUri);
      const { width, height } = getImageDimensions(img);
      const { canvas, ctx } = createCanvas(width, height);

      ctx.drawImage(img, 0, 0);

      // Compress by converting to JPEG with specified quality
      const uri = canvasToDataUrl(canvas, "jpeg", quality);
      return { uri, width, height };
    } catch (error) {
      console.warn("Failed to compress image:", error);
      throw new Error(`Failed to compress image: ${error}`);
    }
  },

  convertFormat: async (
    imageUri: string,
    format: "jpeg" | "png" | "webp",
    includeBase64?: boolean
  ) => {
    console.log(
      `[WEB] ImageManipulator convertFormat: ${imageUri} to ${format} includeBase64: ${includeBase64}`
    );

    if (!isBrowser) {
      throw new Error("Image manipulation requires a browser environment");
    }

    try {
      const img = await loadImage(imageUri);
      const { width, height } = getImageDimensions(img);
      const { canvas, ctx } = createCanvas(width, height);

      ctx.drawImage(img, 0, 0);

      const uri = canvasToDataUrl(canvas, format);
      const result = { uri, width, height };

      if (includeBase64) {
        // Extract base64 data from data URL
        const base64Data = uri.split(",")[1];
        return { ...result, base64: base64Data };
      }

      return result;
    } catch (error) {
      console.warn("Failed to convert image format:", error);
      throw new Error(`Failed to convert image format: ${error}`);
    }
  },

  manipulate: async (
    imageUri: string,
    actions: Array<ImageAction>,
    saveOptions: SaveOptions
  ) => {
    console.log(
      `[WEB] ImageManipulator manipulate: ${imageUri} with ${actions.length} actions`
    );

    if (!isBrowser) {
      throw new Error("Image manipulation requires a browser environment");
    }

    try {
      let currentUri = imageUri;
      let currentWidth = 0;
      let currentHeight = 0;

      // Apply each action sequentially
      for (const action of actions) {
        switch (action.type) {
          case "rotate":
            const rotateResult = await imageManipulator.rotate(
              currentUri,
              (action.degrees as number) || 0
            );
            currentUri = rotateResult.uri;
            currentWidth = rotateResult.width;
            currentHeight = rotateResult.height;
            break;

          case "flip":
            const flipResult = await imageManipulator.flip(
              currentUri,
              (action.direction as "horizontal" | "vertical") || "horizontal"
            );
            currentUri = flipResult.uri;
            currentWidth = flipResult.width;
            currentHeight = flipResult.height;
            break;

          case "resize":
            const resizeResult = await imageManipulator.resize(
              currentUri,
              action.width as number | undefined,
              action.height as number | undefined
            );
            currentUri = resizeResult.uri;
            currentWidth = resizeResult.width;
            currentHeight = resizeResult.height;
            break;

          case "crop":
            const cropResult = await imageManipulator.crop(
              currentUri,
              (action.originX as number) || 0,
              (action.originY as number) || 0,
              (action.width as number) || currentWidth,
              (action.height as number) || currentHeight
            );
            currentUri = cropResult.uri;
            currentWidth = cropResult.width;
            currentHeight = cropResult.height;
            break;

          default:
            console.warn(
              `Unknown action type: ${(action as { type: string }).type}`
            );
        }
      }

      // Apply final save options
      const format = saveOptions?.format || "png";
      const quality = saveOptions?.compress || 1.0;
      const includeBase64 = saveOptions?.includeBase64 || false;

      const finalResult = await imageManipulator.convertFormat(
        currentUri,
        format,
        includeBase64
      );

      if (format === "jpeg" && quality < 1.0) {
        const compressedResult = await imageManipulator.compress(
          finalResult.uri,
          quality
        );
        return {
          uri: compressedResult.uri,
          width: compressedResult.width,
          height: compressedResult.height,
          base64: includeBase64
            ? compressedResult.uri.split(",")[1]
            : undefined,
        };
      }

      return finalResult;
    } catch (error) {
      console.warn("Failed to manipulate image:", error);
      throw new Error(`Failed to manipulate image: ${error}`);
    }
  },
};
