/**
 * Generated documentation for notifications module.
 * This file is auto-generated from module_types/notifications.ts
 */

export const notifications = {
  moduleName: "notifications",
  description: "Notifications API for local notifications. Schedules and manages local push notifications. Requires permission for alerts, badges, and sounds.",
  userDescription: "Schedule local push notifications, manage app badges, and send timely reminders to users even when the app is in the background.",
  
  functions: {
    scheduleNotification: {
      name: "scheduleNotification",
      description: "Schedules local notification.",
      documentation: `
Signature: (title: string, body: string, data?: Record, seconds?: number, date?: Date | number) => Promise<string>
Param Info:
  - title: Notification title
  - body: Notification message
  - data: Custom data payload
  - seconds: Delay in seconds
  - date: Specific trigger time
`
    },
    
    getAllScheduledNotifications: {
      name: "getAllScheduledNotifications",
      description: "Gets all scheduled notifications.",
      documentation: `
Signature: () => Promise<ScheduledNotification[]>
`
    },
    
    cancelNotification: {
      name: "cancelNotification",
      description: "Cancels scheduled notification.",
      documentation: `
Signature: (id: string) => Promise<boolean>
Param Info:
  - id: Notification ID to cancel
`
    },
    
    cancelAllNotifications: {
      name: "cancelAllNotifications",
      description: "Cancels all notifications.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getBadgeCount: {
      name: "getBadgeCount",
      description: "Gets app badge count.",
      documentation: `
Signature: () => Promise<number>
`
    },
    
    setBadgeCount: {
      name: "setBadgeCount",
      description: "Sets app badge count.",
      documentation: `
Signature: (count: number) => Promise<boolean>
Param Info:
  - count: Number to display on app badge (0 to clear)
`
    },
    
    requestPermissions: {
      name: "requestPermissions",
      description: "Requests notification permissions.",
      documentation: `
Signature: () => Promise<NotificationPermissions>
`
    }
  },
  
  types: {
    ScheduledNotification: {
      type: "interface",
      description: "",
      properties: {
        id: "Notification ID",
        title: "Notification title",
        body: "Notification body text",
        data: "Custom data payload",
        trigger: "Scheduled trigger time"
      }
    },
    NotificationPermissions: {
      type: "interface",
      description: "Notification permission status",
      properties: {
        granted: "Permission granted",
        alert: "Alert permission",
        badge: "Badge permission",
        sound: "Sound permission"
      }
    }
  },
  
  example: `
await Native.notifications.requestPermissions();
const id = await Native.notifications.scheduleNotification(
"Reminder", "Don't forget!", {}, 3600
);
`
};

// Export for module access
export default notifications;