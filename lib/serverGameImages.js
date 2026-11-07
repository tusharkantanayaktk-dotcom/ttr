import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";

export const GAME_CUSTOM_IMAGES_KEY = "GAME_CUSTOM_IMAGES";

// In-memory cache to prevent repetitive MongoDB queries on high-traffic game pages
let cachedGameImages = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

/**
 * Fetch map of custom game images: { [gameSlug]: imageUrl }
 * Uses memory caching with automatic invalidation.
 * @returns {Promise<Record<string, string>>}
 */
export async function getCustomGameImages() {
  const now = Date.now();
  if (cachedGameImages && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedGameImages;
  }

  try {
    await connectDB();
    const doc = await SystemSetting.findOne({ key: GAME_CUSTOM_IMAGES_KEY }).lean();
    const images = (doc?.value && typeof doc.value === "object" && !Array.isArray(doc.value))
      ? doc.value
      : {};

    cachedGameImages = images;
    lastCacheTime = now;
    return images;
  } catch (error) {
    console.error("Failed to load custom game images from DB:", error);
    return cachedGameImages || {};
  }
}

/**
 * Invalidate in-memory cache when settings are updated
 */
export function invalidateCustomGameImagesCache() {
  cachedGameImages = null;
  lastCacheTime = 0;
}
