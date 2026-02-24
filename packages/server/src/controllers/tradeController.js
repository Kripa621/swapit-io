import Trade from "../models/Trade.js";
import Item from "../models/Item.js";
import User from "../models/User.js";

// CREATE TRADE REQUEST
export const createTrade = async (req, res) => {
  try {
    const { receiver, offeredItems, requestedItems } = req.body;

    await Item.updateMany(
      { _id: { $in: offeredItems } },
      { status: "in_trade" }
    );

    const trade = await Trade.create({
      requester: req.user._id,
      receiver,
      offeredItems,
      requestedItems
    });

    res.status(201).json(trade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ACCEPT TRADE (Triggered after successful Razorpay Test payment)
export const acceptTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate("offeredItems")
      .populate("requestedItems");

    if (!trade) return res.status(404).json({ message: "Trade not found" });

    // SECURITY CHECK: Terms must be locked first
    if (!trade.termsLocked) {
      return res.status(400).json({ message: "Terms must be locked before accepting." });
    }

    // UPDATE: Use manualPrice instead of estimatedValue
    const offeredValue = trade.offeredItems.reduce((sum, item) => sum + item.manualPrice, 0);
    const requestedValue = trade.requestedItems.reduce((sum, item) => sum + item.manualPrice, 0);

    const totalValue = Math.max(offeredValue, requestedValue);
    const escrowAmount = Math.round(totalValue * 0.2);

    trade.status = "accepted";
    trade.escrowAmount = escrowAmount;
    trade.escrowHeld = true; // Represents that the Razorpay test payment succeeded

    await trade.save();

    res.json({
      message: "Trade accepted, escrow secured via Razorpay",
      escrowAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOCK TRADE TERMS & GENERATE PAYMENT LINK
export const lockTradeTerms = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade not found" });

    // Ensure user is part of the trade
    if (trade.requester.toString() !== req.user._id.toString() && trade.receiver.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
    }

    trade.termsLocked = true;
    await trade.save();

    // In a production environment, you would call Razorpay's API here.
    // For ₹0 cost architecture, we generate a simulated Test Mode link.
    const simulatedRazorpayLink = `https://test.razorpay.com/pl_simulated_${trade._id}`;

    res.json({ 
      message: "Terms locked successfully", 
      paymentLink: simulatedRazorpayLink 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// COMPLETE TRADE WITH CREDIT ADJUSTMENT, ESCROW HOLD & ANTI-GAMING REWARDS
export const completeTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate("offeredItems")
      .populate("requestedItems");

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // UPDATE: Use manualPrice instead of estimatedValue
    const offeredValue = trade.offeredItems.reduce(
      (sum, item) => sum + item.manualPrice,
      0
    );

    const requestedValue = trade.requestedItems.reduce(
      (sum, item) => sum + item.manualPrice,
      0
    );

    const difference = requestedValue - offeredValue;

    // 1. CREDIT TRANSFER (Balancing the trade)
    if (difference !== 0) {
      if (difference > 0) {
        // Requester owes money
        await User.findByIdAndUpdate(trade.requester, {
          $inc: { creditBalance: -difference }
        });
        await User.findByIdAndUpdate(trade.receiver, {
          $inc: { creditBalance: difference }
        });
      } else {
        // Receiver owes money (difference is negative)
        await User.findByIdAndUpdate(trade.receiver, {
          $inc: { creditBalance: difference } // difference is negative, so it subtracts
        });
        await User.findByIdAndUpdate(trade.requester, {
          $inc: { creditBalance: -difference } // -(-diff) is positive, so it adds
        });
      }
    }

    // 2. ESCROW HOLD (Change #2)
    // We DO NOT refund escrow here anymore. We leave trade.escrowHeld = true.
    // The Admin Dashboard acts as the notification queue for manual Razorpay refunds.

    // 3. REWARD SYSTEM & ANTI-GAMING (Change #5)
    const totalTradeVolume = offeredValue + requestedValue;
    const hasHighValueItem = [...trade.offeredItems, ...trade.requestedItems]
      .some(item => item.manualPrice > 10000);
    
    let rewardMessage = "";

    if (totalTradeVolume > 10000) {
      if (hasHighValueItem) {
        // Anti-gaming triggered: user manually priced an item > 10,000 to farm the reward
        trade.creditPointsStatus = "pending_review";
        rewardMessage = " High-value item detected. SwapCredits reward is pending admin review.";
      } else {
        // Legitimate high-volume trade (e.g., swapping multiple smaller items totaling > 10,000)
        trade.creditPointsStatus = "awarded";
        const rewardAmount = 50;
        await User.findByIdAndUpdate(trade.requester, { $inc: { creditBalance: rewardAmount } });
        await User.findByIdAndUpdate(trade.receiver, { $inc: { creditBalance: rewardAmount } });
        rewardMessage = ` Both users earned ${rewardAmount} SwapCredits!`;
      }
    } else {
      trade.creditPointsStatus = "none";
    }

    // 4. TRANSFER OWNERSHIP
    await Item.updateMany(
      { _id: { $in: trade.offeredItems.map(i => i._id) } },
      { ownerId: trade.receiver, status: "traded" }
    );

    await Item.updateMany(
      { _id: { $in: trade.requestedItems.map(i => i._id) } },
      { ownerId: trade.requester, status: "traded" }
    );

    trade.status = "completed";
    await trade.save();

    res.json({
      message: "Swap successful! Escrow refund is pending admin verification." + rewardMessage,
      offeredValue,
      requestedValue,
      creditDifference: difference,
      creditStatus: trade.creditPointsStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REJECT TRADE
export const rejectTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade not found" });

    // Ensure only receiver can reject (or requester can cancel)
    if (trade.receiver.toString() !== req.user._id.toString() && trade.requester.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
    }

    // Reset items status to available
    await Item.updateMany(
      { _id: { $in: trade.offeredItems } },
      { status: "available" }
    );

    trade.status = "rejected";
    await trade.save();

    res.json({ message: "Trade rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY TRADES
export const getMyTrades = async (req, res) => {
  try {
    const trades = await Trade.find({
      $or: [{ requester: req.user._id }, { receiver: req.user._id }]
    })
      .populate("requester", "username")
      .populate("receiver", "username")
      .populate("offeredItems")
      .populate("requestedItems")
      .sort({ createdAt: -1 });

    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE TRADE
export const getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate("requester", "username")
      .populate("receiver", "username")
      .populate("offeredItems")
      .populate("requestedItems");

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }
    
    // Security check: Ensure user is part of the trade
    if (trade.requester._id.toString() !== req.user._id.toString() && 
        trade.receiver._id.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
    }

    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RAISE DISPUTE (Change #4)
export const raiseDispute = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade not found" });

    // Security Check: Only participants can dispute
    if (trade.requester.toString() !== req.user._id.toString() && trade.receiver.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
    }

    trade.status = "disputed";
    await trade.save();
    
    res.json({ message: "Dispute raised successfully. Admin notified." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};