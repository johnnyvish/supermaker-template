/**
 * Generated documentation for pedometer module.
 * This file is auto-generated from module_types/pedometer.ts
 */

export const pedometer = {
  moduleName: "pedometer",
  description: "Pedometer API for step tracking. Counts steps using device motion sensors. Requires motion activity permission.",
  userDescription: "Track daily step counts and walking activity for fitness and health monitoring applications.",
  
  functions: {
    getPermissions: {
      name: "getPermissions",
      description: "Checks step tracking permission.",
      documentation: `
Signature: () => Promise<PermissionStatus>
`
    },
    
    requestPermissions: {
      name: "requestPermissions",
      description: "Requests step tracking permission.",
      documentation: `
Signature: () => Promise<PermissionStatus>
`
    },
    
    getStepCount: {
      name: "getStepCount",
      description: "Gets steps in date range.",
      documentation: `
Signature: (startDate: Date | string, endDate: Date | string) => Promise<StepCount>
Param Info:
  - startDate: Range start
  - endDate: Range end
`
    },
    
    startStepCounter: {
      name: "startStepCounter",
      description: "Starts step counter.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    stopStepCounter: {
      name: "stopStepCounter",
      description: "Stops step counter.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    isTracking: {
      name: "isTracking",
      description: "Checks if tracking steps.",
      documentation: `
Signature: () => Promise<boolean>
`
    }
  },
  
  types: {
    StepCount: {
      type: "interface",
      description: "",
      properties: {
        steps: "Total step count"
      }
    },
    PermissionStatus: {
      type: "interface",
      description: "Permission status",
      properties: {
        granted: "Permission granted"
      }
    }
  },
  
  example: `
await Native.pedometer.requestPermissions();
await Native.pedometer.startStepCounter();
const {steps} = await Native.pedometer.getStepCount(
new Date(Date.now() - 86400000), new Date()
);
`
};

// Export for module access
export default pedometer;