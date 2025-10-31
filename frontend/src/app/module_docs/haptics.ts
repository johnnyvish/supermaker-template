/**
 * Generated documentation for haptics module.
 * This file is auto-generated from module_types/haptics.ts
 */

export const haptics = {
  moduleName: "haptics",
  description: "Haptics API for tactile feedback. Provides various haptic patterns for user interactions. Enhances UI feedback with physical sensations.",
  userDescription: "Provide tactile feedback through vibrations for enhanced user interactions and UI response confirmation.",
  
  functions: {
    selection: {
      name: "selection",
      description: "Triggers selection haptic feedback.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    impact: {
      name: "impact",
      description: "Triggers impact haptic feedback.",
      documentation: `
Signature: (style: ImpactStyle) => Promise<boolean>
Param Info:
  - style: Impact intensity
`
    },
    
    impactLight: {
      name: "impactLight",
      description: "Triggers light impact feedback.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    impactMedium: {
      name: "impactMedium",
      description: "Triggers medium impact feedback.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    impactHeavy: {
      name: "impactHeavy",
      description: "Triggers heavy impact feedback.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    notification: {
      name: "notification",
      description: "Triggers notification haptic feedback.",
      documentation: `
Signature: (type: NotificationType) => Promise<boolean>
Param Info:
  - type: Notification type
`
    },
    
    notifySuccess: {
      name: "notifySuccess",
      description: "Triggers success notification feedback.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    notifyWarning: {
      name: "notifyWarning",
      description: "Triggers warning notification feedback.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    notifyError: {
      name: "notifyError",
      description: "Triggers error notification feedback.",
      documentation: `
Signature: () => Promise<boolean>
`
    }
  },
  
  types: {
    ImpactStyle: {
      type: "\"light\" | \"medium\" | \"heavy\" | \"rigid\" | \"soft\"",
      description: ""
    },
    NotificationType: {
      type: "\"success\" | \"warning\" | \"error\"",
      description: "Notification feedback type"
    }
  },
  
  example: `
await Native.haptics.impact("medium");
await Native.haptics.notifySuccess();
`
};

// Export for module access
export default haptics;