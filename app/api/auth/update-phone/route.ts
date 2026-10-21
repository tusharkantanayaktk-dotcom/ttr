import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));

    // Read token from Authorization header or body
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token && body?.token) {
      token = body.token;
    }

    if (!token) {
      return Response.json(
        { success: false, message: "Unauthorized. Please sign in again." },
        { status: 401 }
      );
    }

    let decoded: { userId: string; userType: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        userType: string;
      };
    } catch {
      return Response.json(
        { success: false, message: "Invalid or expired session. Please sign in again." },
        { status: 401 }
      );
    }

    const rawPhone = body?.phone;
    if (!rawPhone || typeof rawPhone !== "string") {
      return Response.json(
        { success: false, message: "Please provide a valid phone number." },
        { status: 400 }
      );
    }

    // Clean phone number: remove non-digits
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.slice(2);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.slice(1);
    }

    // Must be exactly 10 digits
    if (cleanPhone.length !== 10) {
      return Response.json(
        { success: false, message: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Check if phone number is already registered by another account
    const existingUser = await User.findOne({
      phone: cleanPhone,
      _id: { $ne: decoded.userId },
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "This phone number is already registered to another account.",
        },
        { status: 400 }
      );
    }

    // Find and update current user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return Response.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    user.phone = cleanPhone;
    await user.save();

    return Response.json({
      success: true,
      message: "Phone number updated successfully.",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        userId: user.userId,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Update Phone Error:", error);
    return Response.json(
      { success: false, message: "Server error updating phone number." },
      { status: 500 }
    );
  }
}
