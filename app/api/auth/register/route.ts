import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateUserId } from "@/lib/generateUserId";
import { logActivity } from "@/lib/activityLogger";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Get IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unknown IP";

    const { name, email, phone, password } = body;

    /* ================= BASIC VALIDATION ================= */
    if (
      !name || typeof name !== "string" ||
      !email || typeof email !== "string" ||
      !phone || typeof phone !== "string" ||
      !password || typeof password !== "string"
    ) {
      return Response.json(
        { success: false, message: "All fields are required and must be valid strings" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXISTING USER ================= */
    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (exists) {
      return Response.json(
        { success: false, message: "Email or phone already registered" },
        { status: 400 }
      );
    }

    /* ================= HASH PASSWORD ================= */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ================= GENERATE USER ID ================= */
    const userId = generateUserId(name, phone);

    /* ================= CREATE USER ================= */
    await User.create({
      userId,
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      provider: "local", // 🔒 IMPORTANT
      wallet: 0,
      order: 0,
      userType: "user",
      lastLogin: new Date(),
      lastIp: ip,
    });

    // Log registration activity
    await logActivity({
      type: "normal",
      action: "SIGNUP",
      user: {
        userId,
        email: email.toLowerCase(),
        name,
        phone,
        userType: "user",
      },
      title: "New User Registered",
      description: `New user ${name} registered account with ${email.toLowerCase()}`,
      target: userId,
      details: {
        name,
        email: email.toLowerCase(),
        phone,
        provider: "local",
      },
      ip,
      status: "success",
    });

    return Response.json(
      {
        success: true,
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
