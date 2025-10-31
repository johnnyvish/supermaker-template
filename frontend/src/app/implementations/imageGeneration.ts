import { callProxy } from "@/utils";
import type { ImageGenerationAPI } from "@/modules/module_types/imageGeneration";
import type {
  ProxyResponse,
  ImageGenerationResponse,
} from "@/utils";

// Constants
const DEFAULT_MODEL = "gpt-image-1";

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
  quality: "low" | "medium" | "high" | "auto" = "auto",
  size: "1024x1024" | "1024x1536" | "1536x1024" | "auto" = "auto",
  background: "transparent" | "opaque" = "opaque"
): Promise<string> => {
  try {
    const requestPayload = {
      model: DEFAULT_MODEL,
      prompt: prompt,
      quality: quality === "auto" ? "standard" : quality,
      size: size === "auto" ? "1024x1024" : size,
      background: background,
    };

    const result = await callProxy({
      service: "openai",
      operation: "image_generation",
      payload: requestPayload,
    });

    const proxyResponse = result as ProxyResponse<ImageGenerationResponse>;
    const response = proxyResponse.data;

    if (!response || !response.data || response.data.length === 0) {
      throw new Error("No image data received from API");
    }

    // Handle both URL and base64 responses (different OpenAI models return different formats)
    const imageData = response.data[0];
    if (imageData.url) {
      // Fetch the image from the URL
      const imageResponse = await fetch(imageData.url);
      const imageBlob = await imageResponse.blob();
      return await blobToBase64DataUrl(imageBlob);
    } else if (imageData.b64_json) {
      return `data:image/png;base64,${imageData.b64_json}`;
    } else {
      throw new Error("No valid image data format in API response");
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Image generation failed: ${errorMessage}`);
  }
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
  quality: "low" | "medium" | "high" | "auto" = "auto",
  _size: "1024x1024" | "1024x1536" | "1536x1024" | "auto" = "auto",
  background: "transparent" | "opaque" = "opaque"
): Promise<string> => {
  void _size; // Size parameter reserved for future use
  try {
    // Convert data URL to base64 format expected by Replicate
    const getBase64Data = (dataUrl: string) => {
      const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid data URL format");
      }
      return matches[2];
    };

    // Prepare the payload for Flux Kontext Pro
    const requestPayload: {
      prompt: string;
      input_image: string;
      num_inference_steps?: number;
      output_format?: string;
    } = {
      prompt: prompt,
      input_image: `data:image/png;base64,${getBase64Data(imageDataUrl)}`,
    };

    // Map quality settings to inference steps
    if (quality !== "auto") {
      requestPayload.num_inference_steps =
        quality === "high" ? 50 : quality === "medium" ? 30 : 20;
    }

    // Set output format
    requestPayload.output_format = background === "transparent" ? "png" : "jpg";

    const result = await callProxy({
      service: "replicate",
      operation: "image_edit",
      payload: requestPayload,
    });

    const proxyResponse = result as ProxyResponse<string>;
    const imageUrl = proxyResponse.data;

    // Backend returns the URL string directly
    if (typeof imageUrl === "string") {
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      return await blobToBase64DataUrl(imageBlob);
    } else {
      throw new Error("No valid image URL received from Flux Kontext Dev");
    }
  } catch (error) {
    console.error("Flux Kontext Dev edit error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Image editing with Flux Kontext Dev failed: ${errorMessage}`
    );
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
  quality: "low" | "medium" | "high" | "auto" = "auto",
  size: "1024x1024" | "1024x1536" | "1536x1024" | "auto" = "auto"
): Promise<string> => {
  // Add transparency hint to prompt if not already present
  const enhancedPrompt =
    prompt.toLowerCase().includes("transparent") ||
    prompt.toLowerCase().includes("isolated")
      ? prompt
      : `${prompt}, isolated on transparent background`;

  return generate(enhancedPrompt, quality, size, "transparent");
};

/**
 * Main export with all the functions
 */

export const imageGeneration: ImageGenerationAPI = {
  generate,
  edit,
  generateWithTransparency,
};
