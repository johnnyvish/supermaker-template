/**
 * Generated documentation for device module.
 * This file is auto-generated from module_types/device.ts
 */

export const device = {
  moduleName: "device",
  description: "Device API for hardware and system info. Provides device specifications, memory status, and security state. Useful for analytics and feature compatibility checks.",
  userDescription: "Get device hardware information, OS details, memory status, and unique identifiers for analytics and compatibility.",
  
  functions: {
    getDeviceInfo: {
      name: "getDeviceInfo",
      description: "Gets device information.",
      documentation: `
Signature: () => Promise<DeviceInfo>
`
    },
    
    getDeviceType: {
      name: "getDeviceType",
      description: "Gets device type (phone/tablet).",
      documentation: `
Signature: () => Promise<string>
`
    },
    
    getMemoryInfo: {
      name: "getMemoryInfo",
      description: "Gets memory information.",
      documentation: `
Signature: () => Promise<MemoryInfo>
`
    },
    
    isDeviceRooted: {
      name: "isDeviceRooted",
      description: "Checks if device is rooted/jailbroken.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getUniqueId: {
      name: "getUniqueId",
      description: "Gets unique device identifier.",
      documentation: `
Signature: () => Promise<string>
`
    }
  },
  
  types: {
    DeviceInfo: {
      type: "interface",
      description: "",
      properties: {
        manufacturer: "Device manufacturer",
        model: "Device model name",
        osName: "Operating system name",
        osVersion: "OS version number",
        isPhysicalDevice: "Whether physical device (not simulator)"
      }
    },
    MemoryInfo: {
      type: "interface",
      description: "Device memory status",
      properties: {
        totalMemory: "Total device memory in bytes",
        availableMemory: "Available memory in bytes"
      }
    }
  },
  
  example: `
const info = await Native.device.getDeviceInfo();
const isRooted = await Native.device.isDeviceRooted();
`
};

// Export for module access
export default device;