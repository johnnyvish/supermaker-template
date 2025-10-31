/**
 * Generated documentation for fileSystem module.
 * This file is auto-generated from module_types/fileSystem.ts
 */

export const fileSystem = {
  moduleName: "fileSystem",
  description: "File System API for local file operations. Manages files and directories in app-specific storage. Paths are relative to app's document directory.",
  userDescription: "Read, write, and manage files and directories in app-specific local storage for persistent data management.",
  
  functions: {
    readFile: {
      name: "readFile",
      description: "",
      documentation: `
Signature: (path: string) => Promise<string>
`
    },
    
    writeFile: {
      name: "writeFile",
      description: "Writes string content to file.",
      documentation: `
Signature: (path: string, content: string) => Promise<boolean>
`
    },
    
    deleteFile: {
      name: "deleteFile",
      description: "Deletes file at path.",
      documentation: `
Signature: (path: string) => Promise<boolean>
`
    },
    
    fileExists: {
      name: "fileExists",
      description: "Checks if file exists.",
      documentation: `
Signature: (path: string) => Promise<boolean>
`
    },
    
    createDirectory: {
      name: "createDirectory",
      description: "Creates directory at path.",
      documentation: `
Signature: (path: string) => Promise<boolean>
`
    },
    
    listFiles: {
      name: "listFiles",
      description: "Lists files in directory.",
      documentation: `
Signature: (directory?: string) => Promise<string[]>
`
    },
    
    getDocumentDirectory: {
      name: "getDocumentDirectory",
      description: "Gets app document directory path.",
      documentation: `
Signature: () => Promise<string>
`
    },
    
    getCacheDirectory: {
      name: "getCacheDirectory",
      description: "Gets app cache directory path.",
      documentation: `
Signature: () => Promise<string>
`
    }
  },
  
  types: {
  },
  
  example: `
const docDir = await Native.fileSystem.getDocumentDirectory();
await Native.fileSystem.writeFile("data.txt", "Hello World");
const content = await Native.fileSystem.readFile("data.txt");
`
};

// Export for module access
export default fileSystem;