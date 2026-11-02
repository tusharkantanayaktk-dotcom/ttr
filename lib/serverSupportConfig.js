import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";
import { formatSupportConfig } from "@/lib/config";

// Helper to fetch live config from database (Server-side only)
export async function getDbSupportConfig() {
  try {
    await connectDB();
    const doc = await SystemSetting.findOne({ key: "SUPPORT_CONFIG" }).lean();
    if (doc?.value) {
      return formatSupportConfig(doc.value);
    }
  } catch (err) {
    console.error("Error loading SUPPORT_CONFIG from database:", err);
  }
  return formatSupportConfig();
}
