import Item from "../models/Item.js";
import Trade from "../models/Trade.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

// 1. LISTING APPROVALS (Change #3)
export const getPendingItems = async (req, res) => {
  try {
    const items = await Item.find({ approvalStatus: "pending" }).populate("ownerId", "username email");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewItem = async (req, res) => {
  try {
    const { status } = req.body; // Expects "approved" or "rejected"
    const item = await Item.findById(req.params.id);
    
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.approvalStatus = status;
    // If approved, it is now "available" for the marketplace feed
    if (status === "approved") item.status = "available"; 
    
    await item.save();
    res.json({ message: `Item successfully ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. ESCROW REFUND QUEUE (Change #2)
export const getPendingRefunds = async (req, res) => {
  try {
    // Fetch trades that are completed but escrow is still held
    const trades = await Trade.find({ status: "completed", escrowHeld: true })
      .populate("requester", "username email")
      .populate("receiver", "username email");
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmManualRefund = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade not found" });

    // The admin clicked this AFTER logging into Razorpay Test Dashboard and refunding manually
    trade.escrowHeld = false;
    await trade.save();

    res.json({ message: "Escrow hold released in database" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. CREDIT POINT ANTI-GAMING REVIEWS (Change #5)
export const getPendingCredits = async (req, res) => {
  try {
    const trades = await Trade.find({ creditPointsStatus: "pending_review" })
      .populate("requester", "username")
      .populate("receiver", "username")
      .populate("offeredItems")
      .populate("requestedItems");
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveCreditPoints = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade not found" });

    trade.creditPointsStatus = "awarded";
    const rewardAmount = 50;

    await User.findByIdAndUpdate(trade.requester, { $inc: { creditBalance: rewardAmount } });
    await User.findByIdAndUpdate(trade.receiver, { $inc: { creditBalance: rewardAmount } });
    await trade.save();

    res.json({ message: "Trade verified and SwapCredits awarded to both users" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. DISPUTE RESOLUTION (Change #4)
export const getDisputedTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ status: "disputed" })
      .populate("requester", "username")
      .populate("receiver", "username");
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTradeChatLogs = async (req, res) => {
  try {
    const messages = await Message.find({ tradeId: req.params.tradeId })
      .populate("sender", "username")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade not found" });

    // 1. Reset all items back to "available" so users can trade them again
    await Item.updateMany(
      { _id: { $in: [...trade.offeredItems, ...trade.requestedItems] } },
      { status: "available" }
    );

    // 2. Cancel the trade and release the database escrow hold
    trade.status = "rejected"; // Marks the trade as failed/cancelled
    trade.escrowHeld = false; // Signals that Admin handled the Razorpay refunds
    
    await trade.save();

    res.json({ message: "Dispute resolved. Items released and escrow hold removed." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};