import { connectDB } from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";

/**
 * Log activity for either "normal" (user activities) or "owner" (admin/owner adjustments).
 * This function handles safety and won't crash callers if logging fails.
 */
export async function logActivity({
  type = "normal", // "normal" | "owner"
  action,          // e.g. "SIGNUP", "LOGIN", "TOPUP_ORDER", "TOPUP_SUCCESS", "SETTINGS_UPDATE", "PRICING_UPDATE"
  user = {},       // { userId, email, name, phone, userType } or decoded token / mongo user
  title,
  description,
  target = null,
  details = {},
  ip = null,
  userAgent = null,
  status = "success",
}) {
  try {
    await connectDB();

    const userObj = {
      userId: user?.userId || null,
      email: user?.email ? String(user.email).trim().toLowerCase() : null,
      name: user?.name || null,
      phone: user?.phone || null,
      userType: user?.userType || (type === "owner" ? "owner" : "user"),
    };

    // If email is missing, attempt to fetch user from DB using userId or _id
    const lookupId = user?.userId || user?._id;
    if (!userObj.email && lookupId) {
      try {
        let dbUser = null;
        if (typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId)) {
          dbUser = await User.findById(lookupId).select("userId email name phone userType").lean();
        }
        if (!dbUser && typeof lookupId === "string") {
          dbUser = await User.findOne({ userId: lookupId }).select("userId email name phone userType").lean();
        }
        if (dbUser) {
          userObj.userId = dbUser.userId || userObj.userId;
          userObj.email = dbUser.email || userObj.email;
          userObj.name = dbUser.name || userObj.name;
          userObj.phone = dbUser.phone || userObj.phone;
          userObj.userType = dbUser.userType || userObj.userType;
        }
      } catch (err) {
        console.error("User lookup failed in activity logger:", err);
      }
    }

    const logEntry = await ActivityLog.create({
      type,
      action,
      user: userObj,
      title: title || `${action} action`,
      description: description || title || "Action logged",
      target,
      details,
      ip,
      userAgent,
      status,
    });

    return logEntry;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
}
