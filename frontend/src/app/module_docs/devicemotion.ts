/**
 * Generated documentation for devicemotion module.
 * This file is auto-generated from module_types/devicemotion.ts
 */

export const devicemotion = {
  moduleName: "devicemotion",
  description: "Device Motion API for comprehensive motion sensing. Combines accelerometer, gyroscope, and orientation data. Provides both raw and gravity-adjusted acceleration.",
  userDescription: "Track comprehensive device motion including acceleration, rotation, and orientation in real-time for gesture recognition and motion-based interactions.",
  
  functions: {
    start: {
      name: "start",
      description: "Starts motion updates.",
      documentation: `
Signature: (updateInterval?: number) => Promise<boolean>
Param Info:
  - updateInterval: Ms between readings (default: 100)
`
    },
    
    stop: {
      name: "stop",
      description: "Stops motion updates.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getCurrentReading: {
      name: "getCurrentReading",
      description: "Gets current motion reading.",
      documentation: `
Signature: () => Promise<DeviceMotionReading>
`
    },
    
    isRunning: {
      name: "isRunning",
      description: "Checks if motion tracking is active.",
      documentation: `
Signature: () => Promise<boolean>
`
    }
  },
  
  types: {
    Vector3D: {
      type: "interface",
      description: "",
      properties: {
        x: "X-axis value",
        y: "Y-axis value",
        z: "Z-axis value"
      }
    },
    RotationAngles: {
      type: "interface",
      description: "Rotation angles in degrees",
      properties: {
        alpha: "Z-axis rotation (0-360°)",
        beta: "X-axis rotation (-180 to 180°)",
        gamma: "Y-axis rotation (-90 to 90°)"
      }
    },
    DeviceMotionReading: {
      type: "interface",
      description: "Complete motion sensor reading",
      properties: {
        acceleration: "Acceleration excluding gravity (m/s²)",
        accelerationIncludingGravity: "Acceleration including gravity (m/s²)",
        rotation: "Device rotation angles",
        rotationRate: "Rotation rate (degrees/second)",
        orientation: "Device orientation (0-359)"
      }
    }
  },
  
  example: `
await Native.devicemotion.start(50);
const motion = await Native.devicemotion.getCurrentReading();
await Native.devicemotion.stop();
`
};

// Export for module access
export default devicemotion;