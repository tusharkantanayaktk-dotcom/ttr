import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    /* ================= CATEGORY / TAB ================= */
    // "normal" = User activity (signins, logins, topups, orders, etc.)
    // "owner"  = Owner activities (settings changes, price adjustments, role updates, etc.)
    type: {
      type: String,
      enum: ["normal", "owner"],
      required: true,
      index: true,
    },

    /* ================= ACTION TYPE ================= */
    action: {
      type: String,
      required: true,
      index: true,
    },

    /* ================= ACTOR DETAILS ================= */
    user: {
      userId: {
        type: String,
        index: true,
        default: null,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        default: null,
      },
      name: {
        type: String,
        default: null,
      },
      phone: {
        type: String,
        default: null,
      },
      userType: {
        type: String,
        default: "user",
      },
    },

    /* ================= HUMAN READABLE SUMMARY ================= */
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    /* ================= TARGET (KEY, USER, GAME, ETC.) ================= */
    target: {
      type: String,
      default: null,
    },

    /* ================= STRUCTURED DETAILS ================= */
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* ================= CLIENT INFO ================= */
    ip: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["success", "failed", "warning", "info"],
      default: "success",
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
ActivityLogSchema.index({ type: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ "user.email": 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

export default mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);
