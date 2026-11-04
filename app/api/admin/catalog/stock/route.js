import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";
import { getCatalogStock } from "@/lib/serverCatalogStock";

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

const requireOwner = (req) => {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userType !== "owner") {
      return { error: "Forbidden: Owner access required", status: 403 };
    }
    return { decoded };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

/**
 * GET: Fetch global catalog stock configuration
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

    const data = await getCatalogStock();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("GET /api/admin/catalog/stock error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Save global catalog stock configuration (Owner only)
 */
export async function PATCH(req) {
  try {
    const authCheck = requireOwner(req);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await req.json();
    const { outOfStockGames, outOfStockItems } = body || {};

    const cleanGames = Array.isArray(outOfStockGames)
      ? Array.from(new Set(outOfStockGames.map((g) => String(g).trim()).filter(Boolean)))
      : [];

    const cleanItems = Array.isArray(outOfStockItems)
      ? Array.from(new Set(outOfStockItems.map((i) => String(i).trim()).filter(Boolean)))
      : [];

    await connectDB();

    const updated = await SystemSetting.findOneAndUpdate(
      { key: "CATALOG_STOCK_CONFIG" },
      {
        key: "CATALOG_STOCK_CONFIG",
        value: {
          outOfStockGames: cleanGames,
          outOfStockItems: cleanItems,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Catalog stock updated successfully for all users",
      data: updated.value,
    });
  } catch (err) {
    console.error("PATCH /api/admin/catalog/stock error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
