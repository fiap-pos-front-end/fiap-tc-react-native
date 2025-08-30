import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Transfer } from '../types';

const STORAGE_KEYS = {
  CATEGORIES: 'categories',
  TRANSFERS: 'transfers',
} as const;

export const storage = {
  // Category storage
  async getCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  },

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  },

  // Transfer storage
  async getTransfers(): Promise<Transfer[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSFERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting transfers:', error);
      return [];
    }
  },

  async saveTransfers(transfers: Transfer[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
    } catch (error) {
      console.error('Error saving transfers:', error);
      throw error;
    }
  },

  // Clear all data (for testing/reset)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.TRANSFERS]);
      console.log('Storage cleared successfully');
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  // Clear specific data types
  async clearCategories(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      console.log('Categories cleared successfully');
    } catch (error) {
      console.error('Error clearing categories:', error);
      throw error;
    }
  },

  async clearTransfers(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TRANSFERS);
      console.log('Transfers cleared successfully');
    } catch (error) {
      console.error('Error clearing transfers:', error);
      throw error;
    }
  },
};
