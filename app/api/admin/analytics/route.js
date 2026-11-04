import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import PwaStat from "@/models/PwaStat";
import jwt from "jsonwebtoken";

/* ================= AUTH HELPER ================= */
function verifyOwnerOrAdmin(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw { status: 401, message: "Unauthorized" };
  }

  const token = auth.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.userType !== "owner" && decoded.userType !== "admin") {
    throw { status: 403, message: "Forbidden" };
  }

  return decoded;
}

export async function GET(req) {
  try {
    await connectDB();
    verifyOwnerOrAdmin(req);

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "1d"; // 1d, 7d, 30d, all
    const customFrom = searchParams.get("from");
    const customTo = searchParams.get("to");

    const now = new Date();
    let startDate = new Date();

    if (customFrom && customTo) {
      startDate = new Date(customFrom);
      if (typeof customFrom === "string" && customFrom.length === 10) {
        startDate.setHours(0, 0, 0, 0);
      }
      const endDate = new Date(customTo);
      if (typeof customTo === "string" && customTo.length === 10) {
        endDate.setHours(23, 59, 59, 999);
      }
      now.setTime(endDate.getTime());
    } else {
      switch (range) {
        case "1d":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "all":
        default:
          startDate = new Date(0); // Epoch
          break;
      }
    }

    const baseMatch = {
      createdAt: { $gte: startDate, $lte: now },
    };

    const successMatch = {
      createdAt: { $gte: startDate, $lte: now },
      status: { $in: ["success", "SUCCESS"] },
    };

    /* ================= 1. CORE KPIS ================= */
    const [
      totalOrdersCount,
      statusCounts,
      revenueStats,
      allTimeOrdersCount
    ] = await Promise.all([
      Order.countDocuments(baseMatch),
      Order.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: { $toLower: "$status" },
            count: { $sum: 1 },
            totalAmount: { $sum: "$price" },
          },
        },
      ]),
      Order.aggregate([
        { $match: successMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$price" },
            successfulOrders: { $sum: 1 },
            avgOrderValue: { $avg: "$price" },
            minOrderValue: { $min: "$price" },
            maxOrderValue: { $max: "$price" },
          },
        },
      ]),
      Order.countDocuments({}),
    ]);

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const successfulOrders = revenueStats[0]?.successfulOrders || 0;
    const aov = successfulOrders > 0 ? totalRevenue / successfulOrders : 0;
    const conversionRate = totalOrdersCount > 0 ? (successfulOrders / totalOrdersCount) * 100 : 0;

    let pendingOrders = 0;
    let failedOrders = 0;
    let refundOrders = 0;

    statusCounts.forEach((s) => {
      const st = s._id?.toLowerCase();
      if (st === "pending") pendingOrders += s.count;
      else if (st === "failed") failedOrders += s.count;
      else if (st === "refund") refundOrders += s.count;
    });

    /* ================= 2. USER RETENTION & RETURNING BUYERS ================= */
    const userOrderFrequency = await Order.aggregate([
      {
        $match: {
          status: { $in: ["success", "SUCCESS"] },
        },
      },
      {
        $project: {
          buyerId: {
            $ifNull: [
              "$userId",
              { $ifNull: ["$phone", { $ifNull: ["$email", "$playerId"] }] },
            ],
          },
          price: 1,
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: "$buyerId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$price" },
          firstOrderDate: { $min: "$createdAt" },
          lastOrderDate: { $max: "$createdAt" },
          periodOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startDate] },
                    { $lte: ["$createdAt", now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          periodSpent: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startDate] },
                    { $lte: ["$createdAt", now] },
                  ],
                },
                "$price",
                0,
              ],
            },
          },
        },
      },
      {
        $match: {
          periodOrders: { $gt: 0 },
        },
      },
    ]);

    let uniqueBuyersCount = userOrderFrequency.length;
    let newBuyersCount = 0;
    let returningBuyersCount = 0;
    let newBuyersRevenue = 0;
    let returningBuyersRevenue = 0;

    userOrderFrequency.forEach((user) => {
      if (user.firstOrderDate >= startDate && user.totalOrders === 1) {
        newBuyersCount++;
        newBuyersRevenue += user.periodSpent;
      } else {
        returningBuyersCount++;
        returningBuyersRevenue += user.periodSpent;
      }
    });

    const returningUserRate =
      uniqueBuyersCount > 0 ? (returningBuyersCount / uniqueBuyersCount) * 100 : 0;
    const avgOrdersPerUser =
      uniqueBuyersCount > 0 ? successfulOrders / uniqueBuyersCount : 0;

    /* ================= 3. PEAK HOURS ANALYSIS ================= */
    const hourlyStats = await Order.aggregate([
      { $match: successMatch },
      {
        $project: {
          hour: {
            $hour: {
              date: "$createdAt",
              timezone: "+05:30",
            },
          },
          price: 1,
        },
      },
      {
        $group: {
          _id: "$hour",
          ordersCount: { $sum: 1 },
          totalRevenue: { $sum: "$price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const hourlyBreakdown = Array.from({ length: 24 }, (_, i) => {
      const match = hourlyStats.find((h) => h._id === i);
      return {
        hour: i,
        label: `${i.toString().padStart(2, "0")}:00`,
        ordersCount: match ? match.ordersCount : 0,
        totalRevenue: match ? match.totalRevenue : 0,
      };
    });

    let peakHour = null;
    let maxHourlyOrders = -1;
    hourlyBreakdown.forEach((h) => {
      if (h.ordersCount > maxHourlyOrders) {
        maxHourlyOrders = h.ordersCount;
        peakHour = h;
      }
    });

    /* ================= 4. HIGHEST SELLING PRODUCTS ================= */
    const topProducts = await Order.aggregate([
      { $match: successMatch },
      {
        $group: {
          _id: {
            itemName: { $ifNull: ["$itemName", "$itemSlug"] },
            gameSlug: { $ifNull: ["$gameSlug", "General"] },
          },
          ordersCount: { $sum: 1 },
          totalRevenue: { $sum: "$price" },
          avgPrice: { $avg: "$price" },
        },
      },
      { $sort: { ordersCount: -1, totalRevenue: -1 } },
      { $limit: 15 },
      {
        $project: {
          _id: 0,
          itemName: "$_id.itemName",
          gameSlug: "$_id.gameSlug",
          ordersCount: 1,
          totalRevenue: 1,
          avgPrice: 1,
        },
      },
    ]);

    /* ================= 5. TOP GAMES BY REVENUE ================= */
    const topGames = await Order.aggregate([
      { $match: successMatch },
      {
        $group: {
          _id: { $ifNull: ["$gameSlug", "unknown"] },
          ordersCount: { $sum: 1 },
          totalRevenue: { $sum: "$price" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          _id: 0,
          gameSlug: "$_id",
          ordersCount: 1,
          totalRevenue: 1,
        },
      },
    ]);

    /* ================= 6. PAYMENT METHODS BREAKDOWN ================= */
    const paymentMethods = await Order.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: { $ifNull: ["$paymentMethod", "other"] },
          totalOrders: { $sum: 1 },
          successfulOrders: {
            $sum: {
              $cond: [{ $in: ["$status", ["success", "SUCCESS"]] }, 1, 0],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["success", "SUCCESS"]] },
                "$price",
                0,
              ],
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    /* ================= 7. TOP SPENDERS ================= */
    const topSpenders = await Order.aggregate([
      { $match: successMatch },
      {
        $group: {
          _id: {
            $ifNull: [
              "$userId",
              { $ifNull: ["$phone", { $ifNull: ["$email", "$playerId"] }] },
            ],
          },
          totalSpent: { $sum: "$price" },
          ordersCount: { $sum: 1 },
          lastOrderDate: { $max: "$createdAt" },
          samplePhone: { $first: "$phone" },
          sampleEmail: { $first: "$email" },
          samplePlayerId: { $first: "$playerId" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 6 },
    ]);

    /* ================= 8. TIMELINE TREND DATA ================= */
    let timelineGroupFormat = "%Y-%m-%d";
    if (range === "1d") {
      timelineGroupFormat = "%Y-%m-%d %H:00";
    }

    const timelineData = await Order.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: {
            $dateToString: {
              format: timelineGroupFormat,
              date: "$createdAt",
              timezone: "+05:30",
            },
          },
          totalOrders: { $sum: 1 },
          successfulOrders: {
            $sum: {
              $cond: [{ $in: ["$status", ["success", "SUCCESS"]] }, 1, 0],
            },
          },
          revenue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["success", "SUCCESS"]] },
                "$price",
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ================= 9. PWA ANALYTICS METRICS ================= */
    const pwaMatch = {
      createdAt: { $gte: startDate, $lte: now },
    };

    let pwaStats = {
      periodPwaInstalls: 0,
      allTimePwaInstalls: 0,
      periodPwaLaunches: 0,
      periodPromptShown: 0,
      periodPromptDismiss: 0,
      installConversionRate: 0,
      platformBreakdown: [],
    };

    try {
      const [
        periodPwaInstalls,
        allTimePwaInstalls,
        periodPwaLaunches,
        periodPromptShown,
        periodPromptDismiss,
        pwaPlatformBreakdown
      ] = await Promise.all([
        PwaStat.countDocuments({ ...pwaMatch, eventType: "install" }),
        PwaStat.countDocuments({ eventType: "install" }),
        PwaStat.countDocuments({ ...pwaMatch, eventType: "launch" }),
        PwaStat.countDocuments({ ...pwaMatch, eventType: "prompt_shown" }),
        PwaStat.countDocuments({ ...pwaMatch, eventType: "prompt_dismiss" }),
        PwaStat.aggregate([
          { $match: { ...pwaMatch, eventType: { $in: ["install", "launch"] } } },
          {
            $group: {
              _id: "$platform",
              installs: {
                $sum: { $cond: [{ $eq: ["$eventType", "install"] }, 1, 0] },
              },
              launches: {
                $sum: { $cond: [{ $eq: ["$eventType", "launch"] }, 1, 0] },
              },
            },
          },
          { $sort: { installs: -1, launches: -1 } },
        ]),
      ]);

      const installConversionRate =
        periodPromptShown > 0
          ? Math.round((periodPwaInstalls / periodPromptShown) * 1000) / 10
          : 0;

      pwaStats = {
        periodPwaInstalls,
        allTimePwaInstalls,
        periodPwaLaunches,
        periodPromptShown,
        periodPromptDismiss,
        installConversionRate,
        platformBreakdown: pwaPlatformBreakdown.map((p) => ({
          platform: p._id || "other",
          installs: p.installs,
          launches: p.launches,
        })),
      };
    } catch (e) {
      console.warn("PWA stats collection error:", e);
    }

    /* ================= 10. RESELLER (B2B) vs RETAIL (B2C) SPLIT ================= */
    let tierSplit = {
      totalResellersRegistered: 0,
      retail: {
        revenue: 0,
        ordersCount: 0,
        aov: 0,
        uniqueBuyers: 0,
        revenueShare: 100,
      },
      reseller: {
        revenue: 0,
        ordersCount: 0,
        aov: 0,
        uniqueBuyers: 0,
        revenueShare: 0,
        activeResellersCount: 0,
      },
      topResellers: [],
    };

    try {
      const resellers = await User.find({ userType: "admin" })
        .select("userId email phone name")
        .lean();

      tierSplit.totalResellersRegistered = resellers.length;

      const resellerUserIds = new Set(resellers.map((u) => u.userId).filter(Boolean));
      const resellerEmails = new Set(resellers.map((u) => u.email?.toLowerCase()).filter(Boolean));
      const resellerPhones = new Set(resellers.map((u) => u.phone).filter(Boolean));

      const periodOrders = await Order.find(successMatch)
        .select("userId email phone price gameSlug itemName createdAt")
        .lean();

      let retailRevenue = 0;
      let retailOrders = 0;
      const retailBuyersSet = new Set();

      let resellerRevenue = 0;
      let resellerOrders = 0;
      const resellerBuyersSet = new Set();
      const resellerContributorsMap = new Map();

      for (const ord of periodOrders) {
        const isReseller =
          (ord.userId && resellerUserIds.has(ord.userId)) ||
          (ord.email && resellerEmails.has(ord.email.toLowerCase())) ||
          (ord.phone && resellerPhones.has(ord.phone));

        const price = Number(ord.price || 0);

        if (isReseller) {
          resellerRevenue += price;
          resellerOrders += 1;
          const key = ord.userId || ord.email || ord.phone || "Reseller";
          resellerBuyersSet.add(key);

          if (!resellerContributorsMap.has(key)) {
            const matchingReseller = resellers.find(
              (r) => r.userId === ord.userId || r.email?.toLowerCase() === ord.email?.toLowerCase() || r.phone === ord.phone
            );
            resellerContributorsMap.set(key, {
              id: key,
              name: matchingReseller?.name || ord.email || ord.phone || "Reseller Partner",
              email: matchingReseller?.email || ord.email || null,
              phone: matchingReseller?.phone || ord.phone || null,
              ordersCount: 0,
              totalSpent: 0,
            });
          }
          const entry = resellerContributorsMap.get(key);
          entry.ordersCount += 1;
          entry.totalSpent += price;
        } else {
          retailRevenue += price;
          retailOrders += 1;
          const buyerKey = ord.userId || ord.email || ord.phone || ord.orderId;
          retailBuyersSet.add(buyerKey);
        }
      }

      const totalPeriodRevenue = retailRevenue + resellerRevenue;
      const retailRevenueShare = totalPeriodRevenue > 0 ? Math.round((retailRevenue / totalPeriodRevenue) * 1000) / 10 : 100;
      const resellerRevenueShare = totalPeriodRevenue > 0 ? Math.round((resellerRevenue / totalPeriodRevenue) * 1000) / 10 : 0;

      const retailAov = retailOrders > 0 ? Math.round((retailRevenue / retailOrders) * 100) / 100 : 0;
      const resellerAov = resellerOrders > 0 ? Math.round((resellerRevenue / resellerOrders) * 100) / 100 : 0;

      const topResellers = Array.from(resellerContributorsMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      tierSplit = {
        totalResellersRegistered: resellers.length,
        retail: {
          revenue: retailRevenue,
          ordersCount: retailOrders,
          aov: retailAov,
          uniqueBuyers: retailBuyersSet.size,
          revenueShare: retailRevenueShare,
        },
        reseller: {
          revenue: resellerRevenue,
          ordersCount: resellerOrders,
          aov: resellerAov,
          uniqueBuyers: resellerBuyersSet.size,
          revenueShare: resellerRevenueShare,
          activeResellersCount: resellerBuyersSet.size,
        },
        topResellers,
      };
    } catch (tierErr) {
      console.warn("Tier split analytics error:", tierErr);
    }

    return Response.json({
      success: true,
      data: {
        range,
        summary: {
          totalRevenue,
          totalOrders: totalOrdersCount,
          successfulOrders,
          pendingOrders,
          failedOrders,
          refundOrders,
          aov: Math.round(aov * 100) / 100,
          conversionRate: Math.round(conversionRate * 10) / 10,
          allTimeOrdersCount,
        },
        userMetrics: {
          uniqueBuyersCount,
          newBuyersCount,
          returningBuyersCount,
          returningUserRate: Math.round(returningUserRate * 10) / 10,
          newBuyersRevenue,
          returningBuyersRevenue,
          avgOrdersPerUser: Math.round(avgOrdersPerUser * 100) / 100,
        },
        tierSplit,
        peakHours: {
          peakHour: peakHour
            ? {
                hour: peakHour.hour,
                label: peakHour.label,
                ordersCount: peakHour.ordersCount,
                totalRevenue: peakHour.totalRevenue,
              }
            : null,
          hourlyBreakdown,
        },
        topProducts,
        topGames,
        paymentMethods,
        topSpenders,
        timelineData,
        pwaStats,
      },
    });
  } catch (err) {
    console.error("Analytics fetch error:", err);
    return Response.json(
      { success: false, message: err.message || "Failed to load analytics" },
      { status: err.status || 500 }
    );
  }
}
