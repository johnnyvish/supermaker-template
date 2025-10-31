import { supabase } from "@/lib/v1/supabase";
import type { OnlineStorageAPI } from "@/modules/module_types/onlineStorage";

const STORAGE_KEY_PREFIX = "online_apps_";
const TABLE_NAME = "app_factory_storage";

// Helper to prefix keys for online storage
const prefixKey = (key: string): string => {
  // Use a default appId if global.appId is not available in web context
  const appId =
    ((globalThis as Record<string, unknown>).appId as string) || "web_app";
  return `${STORAGE_KEY_PREFIX}${appId}_${key}`;
};

export const onlineStorage: OnlineStorageAPI = {
  async getItem(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("value")
        .eq("key", prefixKey(key))
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found
          return null;
        }
        throw error;
      }

      return data?.value || null;
    } catch (error) {
      console.error("Error getting item:", error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<boolean> {
    try {
      const { error } = await supabase.from(TABLE_NAME).upsert(
        {
          key: prefixKey(key),
          value,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "key",
          ignoreDuplicates: false,
        }
      );

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error setting item:", error);
      return false;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq("key", prefixKey(key));

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error removing item:", error);
      return false;
    }
  },

  async getAllItems(): Promise<Record<string, string | null>> {
    try {
      const appId =
        ((globalThis as Record<string, unknown>).appId as string) || "web_app";
      const appSpecificPrefix = `${STORAGE_KEY_PREFIX}${appId}_`;
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("key, value")
        .like("key", `${appSpecificPrefix}%`);

      if (error) {
        throw error;
      }

      const result: Record<string, string | null> = {};
      data?.forEach((item) => {
        // Remove the full app-specific prefix from the keys in the returned object
        const cleanKey = item.key.slice(appSpecificPrefix.length);
        result[cleanKey] = item.value;
      });

      return result;
    } catch (error) {
      console.error("Error getting all items:", error);
      return {};
    }
  },

  async clearAllItems(): Promise<boolean> {
    try {
      // Delete all rows with our app-specific prefix
      const appId =
        ((globalThis as Record<string, unknown>).appId as string) || "web_app";
      const appSpecificPrefix = `${STORAGE_KEY_PREFIX}${appId}_`;
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .like("key", `${appSpecificPrefix}%`);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error clearing all items:", error);
      return false;
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const appId =
        ((globalThis as Record<string, unknown>).appId as string) || "web_app";
      const appSpecificPrefix = `${STORAGE_KEY_PREFIX}${appId}_`;
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("key")
        .like("key", `${appSpecificPrefix}%`)
        .order("key");

      if (error) {
        throw error;
      }

      return (
        data?.map((item) => item.key.slice(appSpecificPrefix.length)) || []
      );
    } catch (error) {
      console.error("Error getting all keys:", error);
      return [];
    }
  },

  async mergeItem(key: string, value: string): Promise<boolean> {
    try {
      const existingValue = await this.getItem(key);

      if (existingValue) {
        try {
          // Parse both values as JSON
          const existingObject = JSON.parse(existingValue);
          const newObject = JSON.parse(value);

          // Merge the objects
          const mergedValue = JSON.stringify({
            ...existingObject,
            ...newObject,
          });

          // Save the merged value
          return await this.setItem(key, mergedValue);
        } catch (error) {
          console.error("Merge error:", error);
          throw new Error("Cannot merge non-JSON values");
        }
      } else {
        // If no existing value, just set the new value
        return await this.setItem(key, value);
      }
    } catch (error) {
      console.error("Error merging item:", error);
      return false;
    }
  },

  async multiGet(keys: string[]): Promise<Record<string, string | null>> {
    if (keys.length === 0) return {};

    try {
      const prefixedKeys = keys.map((key) => prefixKey(key));
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("key, value")
        .in("key", prefixedKeys);

      if (error) {
        throw error;
      }

      // Create a map of key to value for easy lookup
      const keyValueMap = new Map<string, string>();
      data?.forEach((item) => {
        keyValueMap.set(item.key, item.value);
      });

      // Return the results in the same order as the input keys with original keys
      return Object.fromEntries(
        keys.map((key) => [key, keyValueMap.get(prefixKey(key)) || null])
      );
    } catch (error) {
      console.error("Error in multiGet:", error);
      return {};
    }
  },

  async multiSet(keyValuePairs: [string, string][]): Promise<boolean> {
    if (keyValuePairs.length === 0) return true;

    try {
      const items = keyValuePairs.map(([key, value]) => ({
        key: prefixKey(key),
        value,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from(TABLE_NAME).upsert(items, {
        onConflict: "key",
        ignoreDuplicates: false,
      });

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error in multiSet:", error);
      return false;
    }
  },

  async multiRemove(keys: string[]): Promise<boolean> {
    if (keys.length === 0) return true;

    try {
      const prefixedKeys = keys.map((key) => prefixKey(key));
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .in("key", prefixedKeys);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error in multiRemove:", error);
      return false;
    }
  },
};
