import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    offeredItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
      }
    ],
    requestedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
      }
    ],
  status: {
      type: String,
      // UPDATE THIS ENUM TO INCLUDE "disputed"
      enum: ["pending", "accepted", "completed", "rejected", "disputed"],
      default: "pending"
    },
    
    // ADD THESE NEW FIELDS:
    termsLocked: {
      type: Boolean,
      default: false // Becomes true when both click "Lock Terms" in chat
    },
    creditPointsStatus: {
      type: String,
      enum: ["none", "pending_review", "awarded"],
      default: "none" // Used to prevent farming on ₹10,000+ items
    },
escrowAmount: {
  type: Number,
  default: 0
},
escrowHeld: {
  type: Boolean,
  default: false
}

  },
  { timestamps: true }
);

export default mongoose.model("Trade", tradeSchema);
