import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category, Transfer } from "../types";

const STORAGE_KEYS = {
  CATEGORIES: "categories",
  TRANSFERS: "transfers",
} as const;

export const storage = {
  async getCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  },

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(categories)
      );
    } catch (error) {
      console.error("Error saving categories:", error);
      throw error;
    }
  },

  async getTransfers(): Promise<Transfer[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSFERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting transfers:", error);
      return [];
    }
  },

  async saveTransfers(transfers: Transfer[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSFERS,
        JSON.stringify(transfers)
      );
    } catch (error) {
      console.error("Error saving transfers:", error);
      throw error;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.TRANSFERS,
      ]);
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  },

  async clearCategories(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    } catch (error) {
      console.error("Error clearing categories:", error);
      throw error;
    }
  },

  async clearTransfers(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TRANSFERS);
    } catch (error) {
      console.error("Error clearing transfers:", error);
      throw error;
    }
  },
};
