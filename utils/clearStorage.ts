import { storage } from "./storage";

export const clearStorageData = async () => {
  try {
    await storage.clearAll();
  } catch (error) {
    console.error("❌ Error during storage cleanup:", error);
    throw error;
  }
};

export const forceClearAllData = async () => {
  try {
    await storage.clearAll();

    await storage.clearCategories();
    await storage.clearTransfers();
  } catch (error) {
    console.error("❌ Error during force clear:", error);
    throw error;
  }
};

export const clearCategoriesOnly = async () => {
  try {
    await storage.clearCategories();
  } catch (error) {
    console.error("❌ Error clearing categories:", error);
    throw error;
  }
};

export const clearTransfersOnly = async () => {
  try {
    await storage.clearTransfers();
  } catch (error) {
    console.error("❌ Error clearing transfers:", error);
    throw error;
  }
};

export const manuallySeedData = async () => {
  try {
    const { seedData } = await import("./seedData");

    await storage.saveCategories(seedData.categories);
    await storage.saveTransfers(seedData.transfers);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
};
