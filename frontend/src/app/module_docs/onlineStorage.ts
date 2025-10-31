/**
 * Generated documentation for onlineStorage module.
 * This file is auto-generated from module_types/onlineStorage.ts
 */

export const onlineStorage = {
  moduleName: "onlineStorage",
  description: "Online Storage API for cloud data sync. Provides key-value storage with cloud synchronization. Data persists across app installs and device changes.",
  userDescription: "Store and sync key-value data across devices with cloud backup for persistent user preferences and settings.",
  
  functions: {
    getItem: {
      name: "getItem",
      description: "",
      documentation: `
Signature: (key: string) => Promise<string | null>
`
    },
    
    setItem: {
      name: "setItem",
      description: "Stores key-value pair.",
      documentation: `
Signature: (key: string, value: string) => Promise<boolean>
`
    },
    
    removeItem: {
      name: "removeItem",
      description: "Removes item by key.",
      documentation: `
Signature: (key: string) => Promise<boolean>
`
    },
    
    getAllItems: {
      name: "getAllItems",
      description: "Gets all stored items.",
      documentation: `
Signature: () => Promise<Record>
`
    },
    
    clearAllItems: {
      name: "clearAllItems",
      description: "Clears all storage.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getAllKeys: {
      name: "getAllKeys",
      description: "Gets all storage keys.",
      documentation: `
Signature: () => Promise<string[]>
`
    },
    
    mergeItem: {
      name: "mergeItem",
      description: "Merges value with existing.",
      documentation: `
Signature: (key: string, value: string) => Promise<boolean>
`
    },
    
    multiGet: {
      name: "multiGet",
      description: "Gets multiple items.",
      documentation: `
Signature: (keys: string[]) => Promise<Record>
`
    },
    
    multiSet: {
      name: "multiSet",
      description: "Sets multiple items.",
      documentation: `
Signature: (keyValuePairs: [string, string][]) => Promise<boolean>
`
    },
    
    multiRemove: {
      name: "multiRemove",
      description: "Removes multiple items.",
      documentation: `
Signature: (keys: string[]) => Promise<boolean>
`
    }
  },
  
  types: {
  },
  
  example: `
await Native.onlineStorage.setItem("user_prefs", JSON.stringify(prefs));
const data = await Native.onlineStorage.getItem("user_prefs");
`
};

// Export for module access
export default onlineStorage;