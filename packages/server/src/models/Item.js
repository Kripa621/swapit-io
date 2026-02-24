import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    condition: {
      type: String,
      required: true
    },
    // REMOVED estimatedValue
    // ADDED manualPrice for OLX-style user input
    manualPrice: {
      type: Number,
      required: true
    },
    // ADDED receiptImage to enforce invoice uploads
    receiptImage: {
      type: String,
      required: true 
    },
    // ADDED approvalStatus to send items to the Admin Dashboard queue
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending" 
    },
    images: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ["available", "in_trade", "traded"],
      default: "available"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);