import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";
import User from "@/models/User";
import { logActivity } from "@/lib/activityLogger";
import { getCustomGameImages, GAME_CUSTOM_IMAGES_KEY } from "@/lib/serverGameImages";

const requireAdminOrOwner = (req) => {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!["owner", "admin"].includes(decoded.userType)) {
      return { error: "Forbidden", status: 403 };
    }
    return { decoded };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

/**
 * GET: Fetch all custom game image links
 */
export async function GET(req) {
  try {
    const authCheck = requireAdminOrOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const data = await getCustomGameImages();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("GET /api/admin/catalog/game-image error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST / PATCH: Update or remove a game's custom image link
 * Body: { gameSlug: string, imageUrl?: string }
 */
export async function POST(req) {
  try {
    const authCheck = requireAdminOrOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await req.json();
    const { gameSlug, imageUrl } = body || {};

    if (!gameSlug || typeof gameSlug !== "string") {
      return NextResponse.json(
        { success: false, message: "Game slug is required" },
        { status: 400 }
      );
    }

    const cleanSlug = gameSlug.trim();
    const cleanUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";

    await connectDB();

    const currentImages = await getCustomGameImages();
    const updatedImages = { ...currentImages };

    if (cleanUrl) {
      updatedImages[cleanSlug] = cleanUrl;
    } else {
      delete updatedImages[cleanSlug];
    }

    const updated = await SystemSetting.findOneAndUpdate(
      { key: GAME_CUSTOM_IMAGES_KEY },
      {
        key: GAME_CUSTOM_IMAGES_KEY,
        value: updatedImages,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Fetch user details for audit logging
    let actorUser = null;
    try {
      actorUser = await User.findById(authCheck.decoded.userId)
        .select("email name userId userType")
        .lean();
    } catch {}

    const actorEmail = actorUser?.email || "admin";

    await logActivity({
      type: authCheck.decoded.userType === "owner" ? "owner" : "admin",
      action: "GAME_IMAGE_UPDATE",
      user: {
        userId: actorUser?.userId || authCheck.decoded.userId,
        email: actorEmail,
        name: actorUser?.name || "Admin",
        userType: authCheck.decoded.userType,
      },
      title: cleanUrl ? "Game Image Updated" : "Game Image Reverted to Default",
      description: cleanUrl
        ? `${actorEmail} updated custom image link for game "${cleanSlug}"`
        : `${actorEmail} removed custom image link for game "${cleanSlug}"`,
      target: `Game: ${cleanSlug}`,
      details: {
        gameSlug: cleanSlug,
        imageUrl: cleanUrl || null,
      },
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: cleanUrl
        ? "Game image link saved successfully"
        : "Game image reverted to default",
      data: updated.value,
    });
  } catch (err) {
    console.error("POST /api/admin/catalog/game-image error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PATCH = POST;
