import mongoose from "mongoose";

const PwaStatSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["install", "launch", "prompt_shown", "prompt_dismiss"],
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ["android", "ios", "windows", "mac", "linux", "other"],
      default: "other",
      index: true,
    },
    source: {
      type: String,
      default: "prompt",
    },
    userId: {
      type: String,
      index: true,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PwaStat || mongoose.model("PwaStat", PwaStatSchema);
