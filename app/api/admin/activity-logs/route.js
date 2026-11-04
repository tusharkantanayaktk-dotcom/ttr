import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

// Seed historical user & order activities if ActivityLog is empty for normal tab
async function seedInitialNormalLogsIfEmpty() {
  try {
    const existingCount = await ActivityLog.countDocuments({ type: "normal" });
    if (existingCount > 0) return;

    // 1. Fetch recent users
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const seededLogs = [];

    for (const u of recentUsers) {
      // Registration activity
      seededLogs.push({
        type: "normal",
        action: u.provider === "google" ? "SIGNUP_GOOGLE" : "SIGNUP",
        user: {
          userId: u.userId,
          email: u.email,
          name: u.name,
          phone: u.phone,
          userType: u.userType || "user",
        },
        title: u.provider === "google" ? "Google Signup" : "Account Registered",
        description: `New user ${u.name || u.email || "User"} signed up via ${u.provider === "google" ? "Google" : "Email/Phone"}`,
        target: u.userId,
        details: { provider: u.provider || "local", email: u.email, phone: u.phone },
        ip: u.lastIp || "Unknown",
        status: "success",
        createdAt: u.createdAt || new Date(),
      });

      // Login activity if available
      if (u.lastLogin && u.lastLogin > u.createdAt) {
        seededLogs.push({
          type: "normal",
          action: u.provider === "google" ? "LOGIN_GOOGLE" : "LOGIN",
          user: {
            userId: u.userId,
            email: u.email,
            name: u.name,
            phone: u.phone,
            userType: u.userType || "user",
          },
          title: "User Login",
          description: `User ${u.name || u.email || u.phone} logged in successfully`,
          target: u.userId,
          details: { provider: u.provider || "local" },
          ip: u.lastIp || "Unknown",
          status: "success",
          createdAt: u.lastLogin,
        });
      }
    }

    // 2. Fetch recent orders (topups)
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    for (const o of recentOrders) {
      const isSuccess =
        String(o.status).toLowerCase() === "success" ||
        String(o.topupStatus).toLowerCase() === "success" ||
        String(o.paymentStatus).toLowerCase() === "success";

      seededLogs.push({
        type: "normal",
        action: isSuccess ? "TOPUP_SUCCESS" : "TOPUP_ORDER",
        user: {
          userId: o.userId || null,
          email: o.email || null,
          phone: o.phone || null,
          userType: "user",
        },
        title: isSuccess ? "Topup Completed" : "Topup Order Placed",
        description: `Topup order #${o.orderId} for ${o.itemName || o.gameSlug || "Game item"} (₹${o.price || 0}) by ${o.email || o.phone || "User"}`,
        target: o.orderId,
        details: {
          orderId: o.orderId,
          gameSlug: o.gameSlug,
          itemSlug: o.itemSlug,
          itemName: o.itemName,
          price: o.price,
          status: o.status,
          paymentStatus: o.paymentStatus,
          topupStatus: o.topupStatus,
        },
        status: isSuccess ? "success" : String(o.status).toLowerCase() === "failed" ? "failed" : "info",
        createdAt: o.createdAt || new Date(),
      });
    }

    if (seededLogs.length > 0) {
      await ActivityLog.insertMany(seededLogs, { ordered: false });
    }
  } catch (err) {
    console.error("Failed to seed initial activity logs:", err);
  }
}

export async function GET(req) {
  try {
    await connectDB();

    /* ================= AUTH CHECK ================= */
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = auth.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (decoded.userType !== "owner") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Owner access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "owner" ? "owner" : "normal";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = (searchParams.get("search") || "").trim();
    const action = (searchParams.get("action") || "").trim();
    const status = (searchParams.get("status") || "").trim();

    // If querying normal logs and collection is empty, seed from existing users/orders
    if (type === "normal") {
      await seedInitialNormalLogsIfEmpty();
    }

    /* ================= BUILD QUERY ================= */
    const query = { type };

    if (action && action !== "all") {
      query.action = action;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { "user.email": searchRegex },
        { "user.name": searchRegex },
        { "user.phone": searchRegex },
        { "user.userId": searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { target: searchRegex },
        { ip: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    // Aggregate statistics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [normalCount, ownerCount, normalToday, ownerToday] = await Promise.all([
      ActivityLog.countDocuments({ type: "normal" }),
      ActivityLog.countDocuments({ type: "owner" }),
      ActivityLog.countDocuments({ type: "normal", createdAt: { $gte: todayStart } }),
      ActivityLog.countDocuments({ type: "owner", createdAt: { $gte: todayStart } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
        stats: {
          normalCount,
          ownerCount,
          normalToday,
          ownerToday,
        },
      },
    });
  } catch (err) {
    console.error("GET /api/admin/activity-logs error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
