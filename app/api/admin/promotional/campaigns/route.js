import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
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

    const campaigns = await Campaign.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return Response.json({
      success: true,
      data: campaigns,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
