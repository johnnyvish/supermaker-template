/**
 * Generated documentation for localauth module.
 * This file is auto-generated from module_types/localauth.ts
 */

export const localauth = {
  moduleName: "localauth",
  description: "Local Authentication API for biometric security. Provides Face ID, Touch ID, and fingerprint authentication. Falls back to device passcode when biometrics unavailable.",
  userDescription: "Secure app access with biometric authentication using Face ID, Touch ID, or fingerprint scanning.",
  
  functions: {
    authenticate: {
      name: "authenticate",
      description: "Authenticates with biometrics.",
      documentation: `
Signature: (promptMessage?: string, cancelLabel?: string, fallbackLabel?: string, disableDeviceFallback?: boolean) => Promise<AuthResult>
Param Info:
  - promptMessage: Message to show
  - cancelLabel: Cancel button text
  - fallbackLabel: Fallback button text
  - disableDeviceFallback: Disable PIN fallback
`
    },
    
    checkAvailability: {
      name: "checkAvailability",
      description: "Checks biometric availability.",
      documentation: `
Signature: () => Promise<BiometricStatus>
`
    },
    
    isFaceIdSupported: {
      name: "isFaceIdSupported",
      description: "Checks if Face ID is supported.",
      documentation: `
Signature: () => Promise<boolean>
`
    }
  },
  
  types: {
    AuthResult: {
      type: "interface",
      description: "",
      properties: {
        success: "Whether authentication succeeded",
        error: "Error message if failed"
      }
    },
    BiometricStatus: {
      type: "interface",
      description: "Biometric availability status",
      properties: {
        available: "Hardware available",
        enrolled: "User has enrolled biometrics",
        biometryType: "Type of biometry (FaceID/TouchID/Fingerprint)"
      }
    }
  },
  
  example: `
const {success} = await Native.localauth.authenticate(
"Please authenticate to continue"
);
`
};

// Export for module access
export default localauth;