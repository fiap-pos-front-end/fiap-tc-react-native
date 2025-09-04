import { storage } from "./storage";

export const clearStorageData = async () => {
  try {
    console.log("Starting storage cleanup...");

    await storage.clearAll();

    console.log("✅ Storage cleanup completed successfully!");
    console.log("All categories and transfers have been removed.");
    console.log("Please restart the app to see the changes.");
  } catch (error) {
    console.error("❌ Error during storage cleanup:", error);
    throw error;
  }
};

export const forceClearAllData = async () => {
  try {
    console.log("Force clearing all data...");

    await storage.clearAll();

    await storage.clearCategories();
    await storage.clearTransfers();

    console.log("✅ Force clear completed!");
    console.log("All data has been removed. Restart the app.");
  } catch (error) {
    console.error("❌ Error during force clear:", error);
    throw error;
  }
};

export const clearCategoriesOnly = async () => {
  try {
    console.log("Clearing categories only...");
    await storage.clearCategories();
    console.log("✅ Categories cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing categories:", error);
    throw error;
  }
};

export const clearTransfersOnly = async () => {
  try {
    console.log("Clearing transfers only...");
    await storage.clearTransfers();
    console.log("✅ Transfers cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing transfers:", error);
    throw error;
  }
};

export const manuallySeedData = async () => {
  try {
    console.log("Manually seeding data...");

    const { seedData } = await import("./seedData");

    await storage.saveCategories(seedData.categories);
    await storage.saveTransfers(seedData.transfers);

    console.log("✅ Data seeded successfully!");
    console.log("Restart the app to see the seeded data.");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
};
