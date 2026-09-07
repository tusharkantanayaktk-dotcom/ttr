import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, index: true },

    gameSlug: String,
    itemSlug: String,
    itemName: String,
    playerId: String,
    zoneId: String,
    paymentMethod: String,
    price: Number,
    email: String,
    phone: String,
    status: {
      type: String,
      enum: [
        "pending", "success", "failed", "refund",
        "PENDING", "SUCCESS", "FAILED", "REFUND"
      ],
      default: "pending"
    },
    // ✅ NEW: Top-up status
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refund"],
      default: "pending",
    },

    /* ================= TOP-UP STATUS ================= */
    topupStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refund"],
      default: "pending",
    },
    expiresAt: Date,
  },
  { timestamps: true }
);

/* ================= COMPOUND & PERFORMANCE INDEXES ================= */
OrderSchema.index({ createdAt: -1, status: 1 });
OrderSchema.index({ createdAt: -1, paymentStatus: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ gameSlug: 1, status: 1 });
OrderSchema.index({ phone: 1 });
OrderSchema.index({ email: 1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
