/**
 * Generated documentation for imagepicker module.
 * This file is auto-generated from module_types/imagepicker.ts
 */

export const imagepicker = {
  moduleName: "imagepicker",
  description: "Image Picker API for camera and gallery. Captures photos and selects images from device gallery. Requires permissions for camera and media library access.",
  userDescription: "Capture photos with the device camera or select images from the photo gallery with optional editing capabilities.",
  
  functions: {
    pickImage: {
      name: "pickImage",
      description: "Picks image from gallery.",
      documentation: `
Signature: (allowsEditing?: boolean, quality?: number) => Promise<string | null>
Param Info:
  - allowsEditing: Allow editing
  - quality: Image quality (0-1)
`
    },
    
    takePicture: {
      name: "takePicture",
      description: "Takes photo with camera.",
      documentation: `
Signature: (allowsEditing?: boolean, quality?: number, cameraType?: CameraType) => Promise<string | null>
Param Info:
  - allowsEditing: Allow editing
  - quality: Image quality (0-1)
  - cameraType: Camera to use
`
    },
    
    requestCameraPermission: {
      name: "requestCameraPermission",
      description: "Requests camera permission.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    requestMediaLibraryPermission: {
      name: "requestMediaLibraryPermission",
      description: "Requests media library permission.",
      documentation: `
Signature: () => Promise<boolean>
`
    }
  },
  
  types: {
    CameraType: {
      type: "\"front\" | \"back\"",
      description: ""
    }
  },
  
  example: `
await Native.imagepicker.requestCameraPermission();
const imageUri = await Native.imagepicker.takePicture(true, 0.8);
`
};

// Export for module access
export default imagepicker;