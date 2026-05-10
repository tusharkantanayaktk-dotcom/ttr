import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer "))
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userType !== "owner")
      return Response.json({ message: "Forbidden" }, { status: 403 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [mailsToday, totalReach, databaseCount] = await Promise.all([
      Campaign.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$sentCount" } } }
      ]),
      Campaign.aggregate([
        { $group: { _id: null, total: { $sum: "$sentCount" } } }
      ]),
      User.countDocuments({})
    ]);

    return Response.json({
      success: true,
      data: {
        mailsToday: mailsToday[0]?.total || 0,
        totalReach: totalReach[0]?.total || 0,
        external: 0, // This can be refined if we track external contacts
        database: databaseCount,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
