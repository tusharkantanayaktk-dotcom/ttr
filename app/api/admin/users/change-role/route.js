import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { logActivity } from "@/lib/activityLogger";
import jwt from "jsonwebtoken";

export async function PATCH(req) {
  try {
    await connectDB();

    // ---------------- AUTH ----------------
    const auth = req.headers.get("authorization");

    if (!auth || !auth.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔒 Only OWNER can change roles
    if (decoded.userType !== "owner") {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    // ---------------- BODY ----------------
    const { userId, newUserType } = await req.json();

    if (!userId || !newUserType) {
      return Response.json(
        { message: "userId and newUserType are required" },
        { status: 400 }
      );
    }

    const allowedRoles = ["user", "admin", "owner"];

    if (!allowedRoles.includes(newUserType)) {
      return Response.json(
        { message: "Invalid userType" },
        { status: 400 }
      );
    }

    // ---------------- FETCH USER ----------------
    const user = await User.findOne({ userId });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    /**
     * 🔒 CRITICAL RULES
     */

    // ❌ Owner role cannot be ASSIGNED
    if (newUserType === "owner" && user.userType !== "owner") {
      return Response.json(
        { message: "Owner role cannot be assigned" },
        { status: 403 }
      );
    }

    // ❌ Owner role cannot be DOWNGRADED
    if (user.userType === "owner" && newUserType !== "owner") {
      return Response.json(
        { message: "Owner role cannot be changed" },
        { status: 403 }
      );
    }

    const oldUserType = user.userType;

    // ---------------- UPDATE ----------------
    user.userType = newUserType;
    await user.save();

    // Fetch owner details to log Gmail
    let ownerUser = null;
    try {
      ownerUser = await User.findById(decoded.userId).select("email name userId userType").lean();
    } catch {}

    const ownerEmail = ownerUser?.email || "owner";

    await logActivity({
      type: "owner",
      action: "ROLE_CHANGE",
      user: {
        userId: ownerUser?.userId || decoded.userId,
        email: ownerEmail,
        name: ownerUser?.name || "Owner",
        userType: "owner",
      },
      title: "User Role Updated",
      description: `Owner (${ownerEmail}) changed role of ${user.name || user.email || user.userId} from '${oldUserType}' to '${newUserType}'`,
      target: user.email || user.userId,
      details: {
        ownerEmail,
        targetUserId: user.userId,
        targetEmail: user.email,
        targetName: user.name,
        oldRole: oldUserType,
        newRole: newUserType,
      },
      status: "success",
    });

    return Response.json({
      success: true,
      message: "User role updated successfully",
      data: {
        userId: user.userId,
        userType: user.userType,
      },
    });
  } catch (err) {
    console.error("ROLE UPDATE ERROR:", err);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
