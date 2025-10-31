import type { NotificationsAPI } from "@/modules/module_types/notifications";

// Type assertion for navigator with badge support
type NavigatorWithBadge = Navigator & {
  setAppBadge?: (count?: number) => Promise<void>;
};

// Check if we're in a browser environment with Notification API support
const isBrowser =
  typeof window !== "undefined" && typeof navigator !== "undefined";
const hasNotifications = isBrowser && "Notification" in window;

// Storage for scheduled notifications
const SCHEDULED_NOTIFICATIONS_KEY = "appfactory_scheduled_notifications";
const scheduledNotifications = new Map<
  string,
  {
    id: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    scheduledTime: number;
    timeoutId?: ReturnType<typeof setTimeout>;
  }
>();

let notificationIdCounter = 0;

// Load scheduled notifications from storage
const loadScheduledNotifications = () => {
  if (!isBrowser) return;

  try {
    const stored = localStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      for (const notification of notifications) {
        scheduledNotifications.set(notification.id, notification);

        // Reschedule if not yet triggered
        const now = Date.now();
        if (notification.scheduledTime > now) {
          const timeoutId = setTimeout(() => {
            showNotification(
              notification.title,
              notification.body,
              notification.data
            );
            scheduledNotifications.delete(notification.id);
            saveScheduledNotifications();
          }, notification.scheduledTime - now);

          notification.timeoutId = timeoutId;
        } else {
          // Remove expired notifications
          scheduledNotifications.delete(notification.id);
        }
      }
      saveScheduledNotifications();
    }
  } catch (error) {
    console.warn("Failed to load scheduled notifications:", error);
  }
};

// Save scheduled notifications to storage
const saveScheduledNotifications = () => {
  if (!isBrowser) return;

  try {
    const notifications = Array.from(scheduledNotifications.values()).map(
      ({ timeoutId, ...rest }) => {
        void timeoutId; // Mark as intentionally unused
        return rest;
      }
    );
    localStorage.setItem(
      SCHEDULED_NOTIFICATIONS_KEY,
      JSON.stringify(notifications)
    );
  } catch (error) {
    console.warn("Failed to save scheduled notifications:", error);
  }
};

// Show a notification
const showNotification = (
  title: string,
  body: string,
  data?: Record<string, unknown>
) => {
  if (!hasNotifications) {
    console.warn("Notifications not supported");
    // Fallback to alert only as last resort
    alert(`${title}\n${body}`);
    return;
  }

  if (Notification.permission === "granted") {
    try {
      // Create a proper web notification
      const notification = new Notification(title, {
        body,
        data,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `notification-${Date.now()}`, // Prevent duplicate notifications
        requireInteraction: false, // Auto-dismiss
      });

      // Handle notification click
      notification.onclick = () => {
        console.log("Notification clicked", data);
        notification.close();
        // Focus the window
        if (window.focus) window.focus();
      };

      // Auto-close after 5 seconds if not clicked
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error("Failed to show notification:", error);
      // Fallback for environments where notifications fail
      alert(`${title}\n${body}`);
    }
  } else {
    console.warn("Notification permission not granted");
    // Don't use alert as fallback here - permission was denied
  }
};

// Initialize on load
if (isBrowser) {
  loadScheduledNotifications();
}

export const notifications: NotificationsAPI = {
  scheduleNotification: async (
    title: string,
    body: string,
    data?: Record<string, unknown>,
    seconds?: number,
    date?: Date | number
  ) => {

    if (!isBrowser) {
      throw new Error("Notifications require a browser environment");
    }

    // Check permissions first
    if (!hasNotifications || Notification.permission === "denied") {
      throw new Error("Notifications are not available or permission denied");
    }

    // Calculate schedule time
    let scheduledTime: number;
    if (date !== undefined) {
      scheduledTime = typeof date === "number" ? date : date.getTime();
    } else if (seconds !== undefined) {
      scheduledTime = Date.now() + seconds * 1000;
    } else {
      // Show immediately
      showNotification(title, body, data);
      return `immediate_${Date.now()}`;
    }

    const id = `notification_${++notificationIdCounter}_${Date.now()}`;

    // Schedule the notification
    const timeoutId = setTimeout(() => {
      showNotification(title, body, data);
      scheduledNotifications.delete(id);
      saveScheduledNotifications();
    }, scheduledTime - Date.now());

    // Store the scheduled notification
    scheduledNotifications.set(id, {
      id,
      title,
      body,
      data,
      scheduledTime,
      timeoutId,
    });

    saveScheduledNotifications();
    return id;
  },

  getAllScheduledNotifications: async () => {

    const notifications = Array.from(scheduledNotifications.values()).map(
      ({ timeoutId, scheduledTime, ...rest }) => {
        void timeoutId; // Mark as intentionally unused
        return {
          ...rest,
          trigger: new Date(scheduledTime),
        };
      }
    );

    return notifications;
  },

  cancelNotification: async (id: string) => {

    const notification = scheduledNotifications.get(id);
    if (notification) {
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
      }
      scheduledNotifications.delete(id);
      saveScheduledNotifications();
      return true;
    }

    return false;
  },

  cancelAllNotifications: async () => {

    // Clear all timeouts
    for (const notification of scheduledNotifications.values()) {
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
      }
    }

    scheduledNotifications.clear();
    saveScheduledNotifications();
    return true;
  },

  getBadgeCount: async () => {

    // Web browsers don't typically support badge counts directly
    // We can store it in localStorage as a workaround
    if (isBrowser) {
      const stored = localStorage.getItem("appfactory_badge_count");
      return stored ? parseInt(stored) : 0;
    }

    return 0;
  },

  setBadgeCount: async (count: number) => {

    if (!isBrowser) {
      return false;
    }

    try {
      localStorage.setItem("appfactory_badge_count", count.toString());

      // Try to set badge on navigator if available (Service Worker API)
      const navigatorWithBadge = navigator as NavigatorWithBadge;
      if (navigatorWithBadge.setAppBadge) {
        await navigatorWithBadge.setAppBadge(count);
      }

      return true;
    } catch (error) {
      console.warn("Failed to set badge count:", error);
      return false;
    }
  },

  requestPermissions: async () => {

    if (!hasNotifications) {
      return { granted: false, alert: false, badge: false, sound: false };
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";

      return {
        granted,
        alert: granted,
        badge: granted,
        sound: granted,
      };
    } catch (error) {
      console.warn("Failed to request notification permissions:", error);
      return { granted: false, alert: false, badge: false, sound: false };
    }
  },
};
