import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import { sendPromotionalMail } from "@/lib/mailer";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();

    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer "))
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userType !== "owner")
      return Response.json({ message: "Forbidden" }, { status: 403 });

    const { subject, headerTitle, bannerUrl, body, recipients } = await req.json();

    if (!subject || !body || !recipients?.length) {
      return Response.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Create campaign record
    const campaign = await Campaign.create({
      subject,
      headerTitle,
      bannerUrl,
      body,
      recipients,
      createdBy: decoded.userId,
      status: "sending",
    });

    // Send emails (In a real app, this should be a background job)
    // We'll do it "in place" but without waiting for all to finish if the list is huge.
    // For now, let's process them.
    
    (async () => {
      let sentCount = 0;
      let failedCount = 0;
      const errors = [];

      for (const email of recipients) {
        try {
          await sendPromotionalMail({
            to: email,
            subject,
            headerTitle,
            bannerUrl,
            body,
          });
          sentCount++;
        } catch (err) {
          console.error(`Failed to send to ${email}:`, err);
          failedCount++;
          errors.push(`${email}: ${err.message}`);
        }

        // Update progress every 5 emails or at the end
        if (sentCount % 5 === 0 || sentCount + failedCount === recipients.length) {
          await Campaign.findByIdAndUpdate(campaign._id, {
            sentCount,
            failedCount,
            errors,
          });
        }
      }

      await Campaign.findByIdAndUpdate(campaign._id, {
        status: failedCount === 0 ? "completed" : (sentCount === 0 ? "failed" : "completed"),
      });
    })();

    return Response.json({
      success: true,
      message: "Campaign started",
      campaignId: campaign._id,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
