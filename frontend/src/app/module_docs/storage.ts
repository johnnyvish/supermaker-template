/**
 * Generated documentation for storage module.
 * This file is auto-generated from module_types/storage.ts
 */

export const storage = {
  moduleName: "storage",
  description: "Storage API for local data persistence. Provides key-value storage for strings and images. Data persists across app launches but not app reinstalls.",
  userDescription: "Store and retrieve data locally on the device including text and images that persist across app sessions.",
  
  functions: {
    getItem: {
      name: "getItem",
      description: "Gets stored value by key.",
      documentation: `
Signature: (key: string) => Promise<string | null>
Param Info:
  - key: The key to retrieve
`
    },
    
    setItem: {
      name: "setItem",
      description: "Stores key-value pair.",
      documentation: `
Signature: (key: string, value: string) => Promise<boolean>
Param Info:
  - key: The key to store under
  - value: The string value to store
`
    },
    
    removeItem: {
      name: "removeItem",
      description: "Removes item by key.",
      documentation: `
Signature: (key: string) => Promise<boolean>
Param Info:
  - key: The key to remove
`
    },
    
    getAllItems: {
      name: "getAllItems",
      description: "Gets all stored items.",
      documentation: `
Signature: () => Promise<Record>
`
    },
    
    setImageItem: {
      name: "setImageItem",
      description: "Stores image data.",
      documentation: `
Signature: (key: string, imageDataUrl: string) => Promise<boolean>
Param Info:
  - key: Storage key for the image
  - imageDataUrl: Base64 encoded image data URL (e.g., "data:image/jpeg;base64,...")
`
    },
    
    getImageItem: {
      name: "getImageItem",
      description: "Gets stored image by key.",
      documentation: `
Signature: (key: string) => Promise<string | null>
Param Info:
  - key: The key to retrieve
`
    },
    
    removeImageItem: {
      name: "removeImageItem",
      description: "Removes stored image.",
      documentation: `
Signature: (key: string) => Promise<boolean>
Param Info:
  - key: The key of the image to remove
`
    },
    
    getAllImageItems: {
      name: "getAllImageItems",
      description: "Gets all stored images metadata.",
      documentation: `
Signature: () => Promise<Record>
`
    }
  },
  
  types: {
    ImageMetadata: {
      type: "interface",
      description: "",
      properties: {
        key: "Original storage key",
        filePath: "Relative file path where image is stored",
        mimeType: "MIME type of the image (e.g., \"image/jpeg\")",
        timestamp: "Timestamp when image was stored"
      }
    }
  },
  
  example: `
await Native.storage.setItem("username", "john_doe");
const username = await Native.storage.getItem("username");
await Native.storage.setImageItem("avatar", imageDataUrl);
`
};

// Export for module access
export default storage;