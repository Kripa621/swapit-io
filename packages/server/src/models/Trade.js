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
  enum: ["pending", "accepted", "completed", "rejected"],
  default: "pending"
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
