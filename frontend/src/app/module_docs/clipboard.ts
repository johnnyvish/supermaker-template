/**
 * Generated documentation for clipboard module.
 * This file is auto-generated from module_types/clipboard.ts
 */

export const clipboard = {
  moduleName: "clipboard",
  description: "Clipboard API for system clipboard access. Handles text, images, and URLs in the system clipboard. Supports checking content type before reading.",
  userDescription: "Copy and paste text, images, and URLs to and from the system clipboard for seamless content sharing.",
  
  functions: {
    getString: {
      name: "getString",
      description: "Gets clipboard text content.",
      documentation: `
Signature: () => Promise<string>
`
    },
    
    setString: {
      name: "setString",
      description: "Sets clipboard text content.",
      documentation: `
Signature: (text: string) => Promise<boolean>
`
    },
    
    getImage: {
      name: "getImage",
      description: "Gets clipboard image if available.",
      documentation: `
Signature: () => Promise<ClipboardImage | null>
`
    },
    
    setImage: {
      name: "setImage",
      description: "Sets clipboard image from base64.",
      documentation: `
Signature: (base64Image: string) => Promise<boolean>
`
    },
    
    getUrl: {
      name: "getUrl",
      description: "Gets clipboard URL if available.",
      documentation: `
Signature: () => Promise<string | null>
`
    },
    
    setUrl: {
      name: "setUrl",
      description: "Sets clipboard URL.",
      documentation: `
Signature: (url: string) => Promise<boolean>
`
    },
    
    hasString: {
      name: "hasString",
      description: "Checks if clipboard has text.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    hasImage: {
      name: "hasImage",
      description: "Checks if clipboard has image.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    hasUrl: {
      name: "hasUrl",
      description: "Checks if clipboard has URL.",
      documentation: `
Signature: () => Promise<boolean>
`
    }
  },
  
  types: {
    ClipboardImage: {
      type: "interface",
      description: "",
      properties: {
        data: "Base64 encoded image",
        size: "Image dimensions"
      }
    }
  },
  
  example: `
await Native.clipboard.setString("Hello World");
const text = await Native.clipboard.getString();
`
};

// Export for module access
export default clipboard;