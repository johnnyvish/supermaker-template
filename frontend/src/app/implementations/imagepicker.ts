import type { ImagePickerAPI } from "@/modules/module_types/imagepicker";

// Check if we're in a browser environment
const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

// Helper to convert file to data URL
const fileToDataUrl = (file: File, quality?: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;

      // Apply quality compression if needed and file is an image
      if (quality && quality < 1 && file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const compressedDataUrl = canvas.toDataURL(file.type, quality);
            resolve(compressedDataUrl);
          } else {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      } else {
        resolve(result);
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to create file input
const createFileInput = (
  accept: string,
  capture?: string
): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    if (capture) {
      input.setAttribute("capture", capture);
    }
    input.style.display = "none";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      document.body.removeChild(input);
      resolve(file || null);
    };

    input.oncancel = () => {
      document.body.removeChild(input);
      resolve(null);
    };

    document.body.appendChild(input);
    input.click();
  });
};

// Helper to access camera using getUserMedia
const accessCamera = async (
  cameraType?: "front" | "back",
  quality?: number
): Promise<string | null> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera access not supported");
  }

  try {
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: cameraType === "front" ? "user" : "environment",
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    return new Promise((resolve) => {
      // Create video element
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.style.position = "fixed";
      video.style.top = "50%";
      video.style.left = "50%";
      video.style.transform = "translate(-50%, -50%)";
      video.style.zIndex = "10000";
      video.style.border = "2px solid #000";

      // Create capture button
      const captureBtn = document.createElement("button");
      captureBtn.textContent = "Capture";
      captureBtn.style.position = "fixed";
      captureBtn.style.bottom = "20px";
      captureBtn.style.left = "50%";
      captureBtn.style.transform = "translateX(-50%)";
      captureBtn.style.zIndex = "10001";
      captureBtn.style.padding = "10px 20px";
      captureBtn.style.fontSize = "16px";

      // Create cancel button
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.style.position = "fixed";
      cancelBtn.style.bottom = "20px";
      cancelBtn.style.right = "20px";
      cancelBtn.style.zIndex = "10001";
      cancelBtn.style.padding = "10px 20px";
      cancelBtn.style.fontSize = "16px";

      const cleanup = () => {
        stream.getTracks().forEach((track) => track.stop());
        document.body.removeChild(video);
        document.body.removeChild(captureBtn);
        document.body.removeChild(cancelBtn);
      };

      captureBtn.onclick = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          const dataUrl = canvas.toDataURL("image/jpeg", quality || 0.8);
          cleanup();
          resolve(dataUrl);
        } else {
          cleanup();
          resolve(null);
        }
      };

      cancelBtn.onclick = () => {
        cleanup();
        resolve(null);
      };

      document.body.appendChild(video);
      document.body.appendChild(captureBtn);
      document.body.appendChild(cancelBtn);
    });
  } catch (error) {
    console.warn("Camera access failed:", error);
    throw new Error("Failed to access camera");
  }
};

export const imagepicker: ImagePickerAPI = {
  pickImage: async (allowsEditing?: boolean, quality?: number) => {
    console.log(
      `[WEB] ImagePicker pickImage: editing: ${allowsEditing}, quality: ${quality}`
    );

    if (!isBrowser) {
      throw new Error("Image picking requires a browser environment");
    }

    try {
      const file = await createFileInput("image/*");
      if (!file) {
        return null;
      }

      const dataUrl = await fileToDataUrl(file, quality);

      // If editing is allowed, we could add basic editing functionality here
      // For now, we'll just return the selected image

      return dataUrl;
    } catch (error) {
      console.warn("Image picking failed:", error);
      return null;
    }
  },

  takePicture: async (
    allowsEditing?: boolean,
    quality?: number,
    cameraType?: "front" | "back"
  ) => {
    console.log(
      `[WEB] ImagePicker takePicture: editing: ${allowsEditing}, quality: ${quality}, camera: ${cameraType}`
    );

    if (!isBrowser) {
      throw new Error("Taking pictures requires a browser environment");
    }

    try {
      // First try to use getUserMedia for camera access
      if (navigator.mediaDevices) {
        return await accessCamera(cameraType, quality);
      }

      // Fallback to file input with camera capture
      const file = await createFileInput("image/*", "camera");
      if (!file) {
        return null;
      }

      return await fileToDataUrl(file, quality);
    } catch (error) {
      console.warn("Taking picture failed:", error);

      // Final fallback to regular file picker
      try {
        const file = await createFileInput("image/*");
        if (!file) {
          return null;
        }
        return await fileToDataUrl(file, quality);
      } catch (fallbackError) {
        console.warn("Fallback image picking failed:", fallbackError);
        return null;
      }
    }
  },

  requestCameraPermission: async () => {
    console.log("[WEB] ImagePicker requestCameraPermission");

    if (!isBrowser) {
      return false;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      // Test camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.warn("Camera permission denied:", error);
      return false;
    }
  },

  requestMediaLibraryPermission: async () => {
    console.log("[WEB] ImagePicker requestMediaLibraryPermission");

    // In web browsers, file access is granted through user interaction
    // No explicit permission needed for file picker
    return isBrowser;
  },
};
