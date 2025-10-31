/**
 * Generated documentation for barometer module.
 * This file is auto-generated from module_types/barometer.ts
 */

export const barometer = {
  moduleName: "barometer",
  description: "Barometer API for atmospheric pressure sensing. Measures atmospheric pressure and relative altitude changes. Useful for weather monitoring and altitude tracking.",
  userDescription: "Measure atmospheric pressure and track altitude changes for weather monitoring and elevation-based features.",
  
  functions: {
    start: {
      name: "start",
      description: "Starts barometer updates.",
      documentation: `
Signature: (updateInterval?: number) => Promise<boolean>
Param Info:
  - updateInterval: Ms between readings (default: 1000)
`
    },
    
    stop: {
      name: "stop",
      description: "Stops barometer updates.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getCurrentReading: {
      name: "getCurrentReading",
      description: "Gets current pressure reading.",
      documentation: `
Signature: () => Promise<BarometerReading>
`
    },
    
    isRunning: {
      name: "isRunning",
      description: "Checks if barometer is active.",
      documentation: `
Signature: () => Promise<boolean>
`
    }
  },
  
  types: {
    BarometerReading: {
      type: "interface",
      description: "",
      properties: {
        pressure: "Atmospheric pressure in hPa",
        relativeAltitude: "Altitude change in meters",
        timestamp: "Reading timestamp"
      }
    }
  },
  
  example: `
await Native.barometer.start(1000);
const {pressure, relativeAltitude} = await Native.barometer.getCurrentReading();
await Native.barometer.stop();
`
};

// Export for module access
export default barometer;