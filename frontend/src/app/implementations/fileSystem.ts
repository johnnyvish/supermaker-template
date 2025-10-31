import type { FileSystemAPI } from "@/modules/module_types/fileSystem";

// Check if we're in a browser environment
const isBrowser =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

// Prefixes for different storage types
const FILESYSTEM_PREFIX = "appfactory_fs_";
const DIRECTORY_PREFIX = "appfactory_dir_";

// Helper functions
const getFileKey = (path: string) => FILESYSTEM_PREFIX + path;
const getDirKey = (path: string) => DIRECTORY_PREFIX + path;
const sanitizePath = (path: string) => path.replace(/[<>:"|?*]/g, "_");
const normalizePath = (path: string) => {
  // Remove leading slash and normalize path separators
  return path.replace(/^\/+/, "").replace(/\/+/g, "/");
};

// Virtual directory structure in localStorage
const getDirectoryContents = (dirPath: string): string[] => {
  if (!isBrowser) return [];

  const normalizedDir = normalizePath(dirPath);
  const prefix = getFileKey(normalizedDir === "" ? "" : normalizedDir + "/");
  const contents: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const relativePath = key.substring(prefix.length);
      const fileName = relativePath.split("/")[0];
      if (fileName && !contents.includes(fileName)) {
        contents.push(fileName);
      }
    }
  }

  return contents;
};

export const fileSystem: FileSystemAPI = {
  readFile: async (path: string) => {
    console.log(`[WEB] FileSystem readFile: ${path}`);

    if (!isBrowser) {
      throw new Error("FileSystem operations require a browser environment");
    }

    try {
      const normalizedPath = normalizePath(sanitizePath(path));
      const fileKey = getFileKey(normalizedPath);
      const content = localStorage.getItem(fileKey);

      if (content === null) {
        throw new Error(`File not found: ${path}`);
      }

      return content;
    } catch (error) {
      console.warn("Failed to read file:", error);
      throw new Error(`Failed to read file: ${error}`);
    }
  },

  writeFile: async (path: string, content: string) => {
    console.log(
      `[WEB] FileSystem writeFile: ${path} with ${content.length} chars`
    );

    if (!isBrowser) {
      throw new Error("FileSystem operations require a browser environment");
    }

    try {
      const normalizedPath = normalizePath(sanitizePath(path));
      const fileKey = getFileKey(normalizedPath);

      // Create parent directories if they don't exist
      const pathParts = normalizedPath.split("/");
      if (pathParts.length > 1) {
        for (let i = 1; i < pathParts.length; i++) {
          const dirPath = pathParts.slice(0, i).join("/");
          const dirKey = getDirKey(dirPath);
          if (!localStorage.getItem(dirKey)) {
            localStorage.setItem(dirKey, "directory");
          }
        }
      }

      localStorage.setItem(fileKey, content);
      return true;
    } catch (error) {
      console.warn("Failed to write file:", error);
      return false;
    }
  },

  deleteFile: async (path: string) => {
    console.log(`[WEB] FileSystem deleteFile: ${path}`);

    if (!isBrowser) {
      throw new Error("FileSystem operations require a browser environment");
    }

    try {
      const normalizedPath = normalizePath(sanitizePath(path));
      const fileKey = getFileKey(normalizedPath);

      if (!localStorage.getItem(fileKey)) {
        return false; // File doesn't exist
      }

      localStorage.removeItem(fileKey);
      return true;
    } catch (error) {
      console.warn("Failed to delete file:", error);
      return false;
    }
  },

  fileExists: async (path: string) => {
    console.log(`[WEB] FileSystem fileExists: ${path}`);

    if (!isBrowser) {
      throw new Error("FileSystem operations require a browser environment");
    }

    try {
      const normalizedPath = normalizePath(sanitizePath(path));
      const fileKey = getFileKey(normalizedPath);
      return localStorage.getItem(fileKey) !== null;
    } catch (error) {
      console.warn("Failed to check file existence:", error);
      return false;
    }
  },

  createDirectory: async (path: string) => {
    console.log(`[WEB] FileSystem createDirectory: ${path}`);

    if (!isBrowser) {
      throw new Error("FileSystem operations require a browser environment");
    }

    try {
      const normalizedPath = normalizePath(sanitizePath(path));

      // Create parent directories if they don't exist
      const pathParts = normalizedPath.split("/");
      for (let i = 1; i <= pathParts.length; i++) {
        const dirPath = pathParts.slice(0, i).join("/");
        const parentDirKey = getDirKey(dirPath);
        if (!localStorage.getItem(parentDirKey)) {
          localStorage.setItem(parentDirKey, "directory");
        }
      }

      return true;
    } catch (error) {
      console.warn("Failed to create directory:", error);
      return false;
    }
  },

  listFiles: async (directory?: string) => {
    console.log(`[WEB] FileSystem listFiles: ${directory || "root"}`);

    if (!isBrowser) {
      throw new Error("FileSystem operations require a browser environment");
    }

    try {
      const dirPath = directory ? normalizePath(sanitizePath(directory)) : "";
      return getDirectoryContents(dirPath);
    } catch (error) {
      console.warn("Failed to list files:", error);
      return [];
    }
  },

  getDocumentDirectory: async () => {
    console.log("[WEB] FileSystem getDocumentDirectory");

    if (!isBrowser) {
      throw new Error("FileSystem operations require a browser environment");
    }

    // Create documents directory if it doesn't exist
    const documentsPath = "documents";
    const dirKey = getDirKey(documentsPath);
    if (!localStorage.getItem(dirKey)) {
      localStorage.setItem(dirKey, "directory");
    }

    return "/documents";
  },

  getCacheDirectory: async () => {
    console.log("[WEB] FileSystem getCacheDirectory");

    if (!isBrowser) {
      throw new Error("FileSystem operations require a browser environment");
    }

    // Create cache directory if it doesn't exist
    const cachePath = "cache";
    const dirKey = getDirKey(cachePath);
    if (!localStorage.getItem(dirKey)) {
      localStorage.setItem(dirKey, "directory");
    }

    return "/cache";
  },
};
