import type { DeviceAPI } from "@/modules/module_types/device";

// Extend Navigator interface to include deviceMemory
interface ExtendedNavigator extends Navigator {
  deviceMemory?: number;
}

// Check if we're in a browser environment
const isBrowser =
  typeof window !== "undefined" && typeof navigator !== "undefined";

// Helper to detect device type
const getDeviceTypeFromUserAgent = (): string => {
  if (!isBrowser) return "SERVER";

  const userAgent = navigator.userAgent.toLowerCase();

  if (/mobile|android|iphone|ipad|phone|tablet/.test(userAgent)) {
    if (/tablet|ipad/.test(userAgent)) {
      return "TABLET";
    }
    return "PHONE";
  }

  if (/desktop|windows|macintosh|linux/.test(userAgent)) {
    return "DESKTOP";
  }

  return "UNKNOWN";
};

// Helper to extract OS information
const getOSInfo = (): { osName: string; osVersion: string } => {
  if (!isBrowser) {
    return { osName: "Server", osVersion: "unknown" };
  }

  const userAgent = navigator.userAgent;
  const platform = navigator.platform.toLowerCase();

  // Windows
  if (/windows/i.test(userAgent)) {
    const version = userAgent.match(/windows nt ([\d.]+)/i);
    return {
      osName: "Windows",
      osVersion: version ? version[1] : "unknown",
    };
  }

  // macOS
  if (/mac os x/i.test(userAgent) || platform.includes("mac")) {
    const version = userAgent.match(/mac os x ([\d_]+)/i);
    return {
      osName: "macOS",
      osVersion: version ? version[1].replace(/_/g, ".") : "unknown",
    };
  }

  // iOS
  if (/iphone|ipad/i.test(userAgent)) {
    const version = userAgent.match(/os ([\d_]+)/i);
    return {
      osName: "iOS",
      osVersion: version ? version[1].replace(/_/g, ".") : "unknown",
    };
  }

  // Android
  if (/android/i.test(userAgent)) {
    const version = userAgent.match(/android ([\d.]+)/i);
    return {
      osName: "Android",
      osVersion: version ? version[1] : "unknown",
    };
  }

  // Linux
  if (/linux/i.test(userAgent) || platform.includes("linux")) {
    return {
      osName: "Linux",
      osVersion: "unknown",
    };
  }

  return {
    osName: "Unknown",
    osVersion: "unknown",
  };
};

// Helper to estimate memory (this is very approximate in web environments)
const getMemoryEstimate = (): {
  totalMemory: number;
  availableMemory: number;
} => {
  if (!isBrowser) {
    return {
      totalMemory: 8589934592, // 8GB default for server
      availableMemory: 4294967296, // 4GB default available
    };
  }

  // Try to use the DeviceMemory API if available
  if ("deviceMemory" in navigator) {
    const deviceMemory = (navigator as ExtendedNavigator).deviceMemory;
    if (deviceMemory) {
      const totalBytes = deviceMemory * 1024 * 1024 * 1024; // Convert GB to bytes
      const availableBytes = totalBytes * 0.6; // Assume 60% available
      return {
        totalMemory: totalBytes,
        availableMemory: availableBytes,
      };
    }
  }

  // Fallback estimation based on device type
  const deviceType = getDeviceTypeFromUserAgent();
  switch (deviceType) {
    case "PHONE":
      return {
        totalMemory: 4294967296, // 4GB
        availableMemory: 2147483648, // 2GB
      };
    case "TABLET":
      return {
        totalMemory: 6442450944, // 6GB
        availableMemory: 3221225472, // 3GB
      };
    case "DESKTOP":
      return {
        totalMemory: 8589934592, // 8GB
        availableMemory: 4294967296, // 4GB
      };
    default:
      return {
        totalMemory: 2147483648, // 2GB
        availableMemory: 1073741824, // 1GB
      };
  }
};

// Generate a persistent unique device ID
const getOrCreateUniqueId = (): string => {
  if (!isBrowser) {
    return "server-device-id";
  }

  const DEVICE_ID_KEY = "appfactory_device_id";

  // Try to get existing ID
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Generate new ID using various browser fingerprints
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Device fingerprint", 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join("|");

    // Create a simple hash of the fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    deviceId = `web_device_${Math.abs(hash)}_${Date.now()}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
};

export const device: DeviceAPI = {
  getDeviceInfo: async () => {
    console.log("[WEB] Device getDeviceInfo");

    const { osName, osVersion } = getOSInfo();

    return {
      manufacturer:
        isBrowser && "vendor" in navigator
          ? navigator.vendor || "Unknown"
          : "Server",
      model: isBrowser ? navigator.platform : "Server",
      osName,
      osVersion,
      isPhysicalDevice:
        isBrowser && !/simulator|emulator/i.test(navigator.userAgent),
    };
  },

  getDeviceType: async () => {
    console.log("[WEB] Device getDeviceType");
    return getDeviceTypeFromUserAgent();
  },

  getMemoryInfo: async () => {
    console.log("[WEB] Device getMemoryInfo");
    return getMemoryEstimate();
  },

  isDeviceRooted: async () => {
    console.log("[WEB] Device isDeviceRooted");

    if (!isBrowser) {
      return false;
    }

    // In web environment, we can't reliably detect if device is rooted/jailbroken
    // We can only make educated guesses based on certain indicators

    // Check for common root/jailbreak indicators
    const rootIndicators = [
      // Development tools
      "webkitConvertPointFromNodeToPage" in window,
      "webkitConvertPointFromPageToNode" in window,
      // Some debugging tools
      !!window.console &&
        typeof window.console.log.toString === "function" &&
        window.console.log.toString().indexOf("[native code]") === -1,
    ];

    return rootIndicators.some((indicator) => indicator);
  },

  getUniqueId: async () => {
    console.log("[WEB] Device getUniqueId");
    return getOrCreateUniqueId();
  },
};
