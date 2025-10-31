/**
 * Generated documentation for imageGeneration module.
 * This file is auto-generated from module_types/imageGeneration.ts
 */

export const imageGeneration = {
  moduleName: "imageGeneration",
  description: "Image Generation API using AI. Creates and edits images from text descriptions. Supports various sizes and transparency options.",
  userDescription: "Generate and edit images using AI from text descriptions with customizable quality and dimensions.",
  
  functions: {
    generate: {
      name: "generate",
      description: "Generates image from text prompt.",
      documentation: `
Signature: (prompt: string, quality?: ImageQuality, size?: ImageSize, background?: BackgroundStyle) => Promise<string>
Param Info:
  - prompt: Text description
  - quality: Output quality
  - size: Image dimensions
  - background: Background style
`
    },
    
    edit: {
      name: "edit",
      description: "Edits existing image with prompt.",
      documentation: `
Signature: (imageDataUrl: string, prompt: string, quality?: ImageQuality, size?: ImageSize, background?: BackgroundStyle) => Promise<string>
Param Info:
  - imageDataUrl: Base64 source image
  - prompt: Edit instructions
  - quality: Output quality
  - size: Image dimensions
  - background: Background style
`
    },
    
    generateWithTransparency: {
      name: "generateWithTransparency",
      description: "Generates image with transparency.",
      documentation: `
Signature: (prompt: string, quality?: ImageQuality, size?: ImageSize) => Promise<string>
Param Info:
  - prompt: Text description
  - quality: Output quality
  - size: Image dimensions
`
    }
  },
  
  types: {
    ImageQuality: {
      type: "\"low\" | \"medium\" | \"high\" | \"auto\"",
      description: ""
    },
    ImageSize: {
      type: "\"1024x1024\" | \"1024x1536\" | \"1536x1024\" | \"auto\"",
      description: "Generated image dimensions"
    },
    BackgroundStyle: {
      type: "\"transparent\" | \"opaque\"",
      description: "Image background style"
    }
  },
  
  example: `
const imageUrl = await Native.imageGeneration.generate(
"A sunset over mountains", "high", "1536x1024"
);
`
};

// Export for module access
export default imageGeneration;