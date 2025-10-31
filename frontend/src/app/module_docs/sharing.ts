/**
 * Generated documentation for sharing module.
 * This file is auto-generated from module_types/sharing.ts
 */

export const sharing = {
  moduleName: "sharing",
  description: "Sharing API for content sharing. Opens native share sheet for files, text, URLs, and images. Allows sharing to other apps and services.",
  userDescription: "Share content to other apps and social media using the native share sheet for files, text, and URLs.",
  
  functions: {
    shareFile: {
      name: "shareFile",
      description: "",
      documentation: `
Signature: (path: string) => Promise<boolean>
`
    },
    
    shareText: {
      name: "shareText",
      description: "Shares text content.",
      documentation: `
Signature: (text: string) => Promise<boolean>
`
    },
    
    shareURL: {
      name: "shareURL",
      description: "Shares URL link.",
      documentation: `
Signature: (url: string) => Promise<boolean>
`
    },
    
    shareStoredImage: {
      name: "shareStoredImage",
      description: "Shares stored image by key.",
      documentation: `
Signature: (key: string) => Promise<boolean>
`
    }
  },
  
  types: {
  },
  
  example: `
await Native.sharing.shareText("Check this out!");
await Native.sharing.shareURL("https://example.com");
`
};

// Export for module access
export default sharing;