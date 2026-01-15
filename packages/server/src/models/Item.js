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
    estimatedValue: {
      type: Number,
      required: true
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
