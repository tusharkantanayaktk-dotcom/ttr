import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    headerTitle: { type: String },
    bannerUrl: { type: String },
    body: { type: String, required: true },
    recipients: [{ type: String }],
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    createdBy: { type: String, required: true }, // userId
    status: { type: String, enum: ["pending", "sending", "completed", "failed"], default: "pending" },
    errors: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);
