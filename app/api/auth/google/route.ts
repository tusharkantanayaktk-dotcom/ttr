import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { logActivity } from "@/lib/activityLogger";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { generateUserId } from "@/lib/generateUserId";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token } = await req.json();

    // Get IP address
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unknown IP";

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (e) {
      // If ID token verification fails, try as access token
      const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
      if (res.ok) {
        payload = await res.json();
      } else {
        return Response.json(
          { success: false, message: "Invalid Google token" },
          { status: 401 }
        );
      }
    }

    if (!payload?.email) {
      return Response.json(
        { success: false, message: "Invalid Google token" },
        { status: 401 }
      );
    }

    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });
    const isNewUser = !user;

    /* ================= CREATE USER IF NEW ================= */
    if (!user) {
      user = await User.create({
        userId: generateUserId(name || "user", Date.now().toString()),
        name,
        email,
        password: null,         // 🔐 no password
        provider: "google",
        googleId: sub,
        avatar: picture,
        wallet: 0,
        order: 0,
        userType: "user",
        lastLogin: new Date(),
        lastIp: ip,
      });

      // Log Google Signup
      await logActivity({
        type: "normal",
        action: "SIGNUP_GOOGLE",
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          userType: "user",
        },
        title: "New Google Signup",
        description: `New user ${name || email} registered using Google account (${email})`,
        target: user.userId,
        details: {
          name,
          email,
          provider: "google",
          googleId: sub,
        },
        ip,
        status: "success",
      });
    } else {
      user.lastLogin = new Date();
      user.lastIp = ip;
      if (!user.googleId) user.googleId = sub;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();

      // Log Google Login
      await logActivity({
        type: "normal",
        action: "LOGIN_GOOGLE",
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: user.userType,
        },
        title: "Google Login",
        description: `User ${user.name || user.email} signed in via Google (${user.email})`,
        target: user.userId,
        details: {
          email: user.email,
          provider: "google",
        },
        ip,
        status: "success",
      });
    }

    /* ================= JWT ================= */
    const jwtToken = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const hasPhone = Boolean(user.phone && typeof user.phone === "string" && user.phone.trim().length > 0);

    return Response.json({
      success: true,
      token: jwtToken,
      needsPhone: !hasPhone,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        userId: user.userId,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return Response.json(
      { success: false, message: "Google authentication failed" },
      { status: 500 }
    );
  }
}
