/**
 * Generated documentation for magnetometer module.
 * This file is auto-generated from module_types/magnetometer.ts
 */

export const magnetometer = {
  moduleName: "magnetometer",
  description: "Magnetometer API for magnetic field sensing. Measures Earth's magnetic field and nearby magnetic sources. Values are in microteslas (μT). Used for compass apps.",
  userDescription: "Detect magnetic fields and compass headings for navigation and metal detection features.",
  
  functions: {
    start: {
      name: "start",
      description: "Starts magnetometer updates.",
      documentation: `
Signature: (updateInterval?: number) => Promise<boolean>
Param Info:
  - updateInterval: Ms between readings (default: 100)
`
    },
    
    stop: {
      name: "stop",
      description: "Stops magnetometer updates.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getCurrentReading: {
      name: "getCurrentReading",
      description: "Gets current magnetic field.",
      documentation: `
Signature: () => Promise<MagnetometerReading>
`
    },
    
    isRunning: {
      name: "isRunning",
      description: "Checks if magnetometer is active.",
      documentation: `
Signature: () => Promise<boolean>
`
    }
  },
  
  types: {
    MagnetometerReading: {
      type: "interface",
      description: "",
      properties: {
        x: "X-axis magnetic field",
        y: "Y-axis magnetic field",
        z: "Z-axis magnetic field"
      }
    }
  },
  
  example: `
await Native.magnetometer.start(100);
const {x, y, z} = await Native.magnetometer.getCurrentReading();
await Native.magnetometer.stop();
`
};

// Export for module access
export default magnetometer;