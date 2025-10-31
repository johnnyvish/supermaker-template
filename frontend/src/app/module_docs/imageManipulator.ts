/**
 * Generated documentation for imageManipulator module.
 * This file is auto-generated from module_types/imageManipulator.ts
 */

export const imageManipulator = {
  moduleName: "imageManipulator",
  description: "Image Manipulator API for editing images. Provides image transformation operations like resize, crop, rotate. Supports format conversion and compression.",
  userDescription: "Transform images with operations like resize, crop, rotate, flip, and format conversion with compression options.",
  
  functions: {
    rotate: {
      name: "rotate",
      description: "Rotates image by degrees.",
      documentation: `
Signature: (imageUri: string, degrees: number) => Promise<ImageResult>
Param Info:
  - degrees: Rotation angle
`
    },
    
    flip: {
      name: "flip",
      description: "Flips image horizontally/vertically.",
      documentation: `
Signature: (imageUri: string, direction: FlipDirection) => Promise<ImageResult>
Param Info:
  - direction: Flip direction
`
    },
    
    resize: {
      name: "resize",
      description: "Resizes image dimensions.",
      documentation: `
Signature: (imageUri: string, width?: number, height?: number) => Promise<ImageResult>
Param Info:
  - width: Target width
  - height: Target height
`
    },
    
    crop: {
      name: "crop",
      description: "Crops image region.",
      documentation: `
Signature: (imageUri: string, originX: number, originY: number, width: number, height: number) => Promise<ImageResult>
Param Info:
  - originX: Crop X position
  - originY: Crop Y position
  - width: Crop width
  - height: Crop height
`
    },
    
    compress: {
      name: "compress",
      description: "Compresses image quality.",
      documentation: `
Signature: (imageUri: string, quality: number) => Promise<ImageResult>
Param Info:
  - quality: Quality 0-1
`
    },
    
    convertFormat: {
      name: "convertFormat",
      description: "Converts image format.",
      documentation: `
Signature: (imageUri: string, format: ImageFormat, includeBase64?: boolean) => Promise<ImageResult>
Param Info:
  - format: Target format
  - includeBase64: Include base64
`
    },
    
    manipulate: {
      name: "manipulate",
      description: "Applies multiple manipulations.",
      documentation: `
Signature: (imageUri: string, actions: ManipulateAction[], saveOptions: SaveOptions) => Promise<ImageResult>
Param Info:
  - actions: List of actions
  - saveOptions: Save settings
`
    }
  },
  
  types: {
    ImageResult: {
      type: "interface",
      description: "",
      properties: {
        uri: "Result image URI",
        width: "Image width in pixels",
        height: "Image height in pixels",
        base64: "Optional base64 data"
      }
    },
    FlipDirection: {
      type: "\"horizontal\" | \"vertical\"",
      description: "Image flip direction"
    },
    ImageFormat: {
      type: "\"jpeg\" | \"png\" | \"webp\"",
      description: "Supported image formats"
    },
    ManipulateAction: {
      type: "interface",
      description: "Image manipulation action",
      properties: {
        type: "Action type"
      }
    },
    SaveOptions: {
      type: "interface",
      description: "Image save options",
      properties: {
        format: "Output format",
        compress: "Compression quality (0-1)",
        base64: "Include base64 in result"
      }
    }
  },
  
  example: `
const result = await Native.imageManipulator.resize(
imageUri, 800, 600
);
`
};

// Export for module access
export default imageManipulator;