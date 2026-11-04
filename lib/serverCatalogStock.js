import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";

/**
 * Fetch global catalog stock configuration from MongoDB SystemSetting.
 * Out of stock settings apply globally to ALL user types (guests, users, members, admins).
 *
 * @returns {Promise<{ outOfStockGames: string[], outOfStockItems: string[] }>}
 */
export async function getCatalogStock() {
  try {
    await connectDB();
    const doc = await SystemSetting.findOne({ key: "CATALOG_STOCK_CONFIG" }).lean();
    const val = doc?.value || {};

    return {
      outOfStockGames: Array.isArray(val.outOfStockGames) ? val.outOfStockGames : [],
      outOfStockItems: Array.isArray(val.outOfStockItems) ? val.outOfStockItems : [],
    };
  } catch (error) {
    console.error("Failed to load catalog stock from DB:", error);
    return {
      outOfStockGames: [],
      outOfStockItems: [],
    };
  }
}

/**
 * Check if a game is available in stock globally.
 */
export function isGameInStock(gameSlug, stockConfig) {
  if (!gameSlug || !stockConfig) return true;
  const list = stockConfig.outOfStockGames || [];
  return !list.includes(gameSlug);
}

/**
 * Check if a specific item is available in stock globally.
 */
export function isItemInStock(gameSlug, itemSlug, stockConfig) {
  if (!stockConfig) return true;
  if (!isGameInStock(gameSlug, stockConfig)) return false;
  if (!itemSlug) return true;

  const itemList = stockConfig.outOfStockItems || [];
  const key = `${gameSlug}::${itemSlug}`;
  return !itemList.includes(key);
}
