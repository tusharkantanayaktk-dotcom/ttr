import { connectDB } from "@/lib/mongodb";
import PwaStat from "@/models/PwaStat";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { eventType, platform = "other", source = "prompt", userId = null } = body;

    if (!eventType) {
      return Response.json({ success: false, message: "eventType required" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    await PwaStat.create({
      eventType,
      platform,
      source,
      userId,
      ip,
      userAgent,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("PWA track error:", err);
    return Response.json({ success: false, message: "Tracking failed" }, { status: 500 });
  }
}
