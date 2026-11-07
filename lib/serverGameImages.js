import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";

export const GAME_CUSTOM_IMAGES_KEY = "GAME_CUSTOM_IMAGES";

/**
 * Fetch map of custom game images: { [gameSlug]: imageUrl }
 * @returns {Promise<Record<string, string>>}
 */
export async function getCustomGameImages() {
  try {
    await connectDB();
    const doc = await SystemSetting.findOne({ key: GAME_CUSTOM_IMAGES_KEY }).lean();
    if (doc?.value && typeof doc.value === "object" && !Array.isArray(doc.value)) {
      return doc.value;
    }
    return {};
  } catch (error) {
    console.error("Failed to load custom game images from DB:", error);
    return {};
  }
}
