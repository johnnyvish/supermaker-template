/**
 * Generated documentation for accelerometer module.
 * This file is auto-generated from module_types/accelerometer.ts
 */

export const accelerometer = {
  moduleName: "accelerometer",
  description: "Accelerometer API for device motion sensing. Measures acceleration on 3 axes in G-force units. Stationary device shows Z ≈ 1G (gravity).",
  userDescription: "Detect device motion and orientation by measuring acceleration forces along three axes in real-time.",
  
  functions: {
    start: {
      name: "start",
      description: "Starts accelerometer updates.",
      documentation: `
Signature: (updateInterval?: number) => Promise<boolean>
Param Info:
  - updateInterval: Ms between readings (default: 100)
`
    },
    
    stop: {
      name: "stop",
      description: "Stops accelerometer updates.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getCurrentReading: {
      name: "getCurrentReading",
      description: "Gets current acceleration reading.",
      documentation: `
Signature: () => Promise<AccelerometerReading>
`
    },
    
    isRunning: {
      name: "isRunning",
      description: "Checks if accelerometer is active.",
      documentation: `
Signature: () => Promise<boolean>
`
    }
  },
  
  types: {
    GForce: {
      type: "number",
      description: ""
    },
    AccelerometerReading: {
      type: "interface",
      description: "Three-dimensional acceleration reading",
      properties: {
        x: "Left/right axis",
        y: "Forward/backward axis",
        z: "Up/down axis"
      }
    }
  },
  
  example: `
await Native.accelerometer.start(100);
const {x, y, z} = await Native.accelerometer.getCurrentReading();
await Native.accelerometer.stop();
`
};

// Export for module access
export default accelerometer;