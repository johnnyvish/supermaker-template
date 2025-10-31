/**
 * Generated documentation for gyroscope module.
 * This file is auto-generated from module_types/gyroscope.ts
 */

export const gyroscope = {
  moduleName: "gyroscope",
  description: "Gyroscope API for rotation sensing. Measures device rotation rate on three axes. Values are in radians per second.",
  userDescription: "Measure device rotation speed around three axes for motion tracking and orientation-based features.",
  
  functions: {
    start: {
      name: "start",
      description: "Starts gyroscope updates.",
      documentation: `
Signature: (updateInterval?: number) => Promise<boolean>
Param Info:
  - updateInterval: Ms between readings (default: 100)
`
    },
    
    stop: {
      name: "stop",
      description: "Stops gyroscope updates.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getCurrentReading: {
      name: "getCurrentReading",
      description: "Gets current rotation rate.",
      documentation: `
Signature: () => Promise<GyroscopeReading>
`
    },
    
    isRunning: {
      name: "isRunning",
      description: "Checks if gyroscope is active.",
      documentation: `
Signature: () => Promise<boolean>
`
    }
  },
  
  types: {
    GyroscopeReading: {
      type: "interface",
      description: "",
      properties: {
        x: "Pitch axis rotation",
        y: "Roll axis rotation",
        z: "Yaw axis rotation"
      }
    }
  },
  
  example: `
await Native.gyroscope.start(100);
const {x, y, z} = await Native.gyroscope.getCurrentReading();
await Native.gyroscope.stop();
`
};

// Export for module access
export default gyroscope;