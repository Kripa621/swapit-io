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

// ACCEPT TRADE
export const acceptTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate("offeredItems")
      .populate("requestedItems");

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    // Calculate total trade value
    const offeredValue = trade.offeredItems.reduce(
      (sum, item) => sum + item.estimatedValue,
      0
    );

    const requestedValue = trade.requestedItems.reduce(
      (sum, item) => sum + item.estimatedValue,
      0
    );

    const totalValue = Math.max(offeredValue, requestedValue);

    // Escrow = 20% of trade value
    const escrowAmount = Math.round(totalValue * 0.2);

    // Deduct escrow from both users
    await User.findByIdAndUpdate(trade.requester, {
      $inc: { creditBalance: -escrowAmount }
    });
    await User.findByIdAndUpdate(trade.receiver, {
      $inc: { creditBalance: -escrowAmount }
    });

    trade.status = "accepted";
    trade.escrowAmount = escrowAmount;
    trade.escrowHeld = true;

    await trade.save();

    res.json({
      message: "Trade accepted, escrow held",
      escrowAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// COMPLETE TRADE WITH CREDIT ADJUSTMENT
export const completeTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate("offeredItems")
      .populate("requestedItems");

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    const offeredValue = trade.offeredItems.reduce(
      (sum, item) => sum + item.estimatedValue,
      0
    );

    const requestedValue = trade.requestedItems.reduce(
      (sum, item) => sum + item.estimatedValue,
      0
    );

    const difference = requestedValue - offeredValue;

    // CREDIT TRANSFER
    if (difference !== 0) {
      if (difference > 0) {
        await User.findByIdAndUpdate(trade.requester, {
          $inc: { creditBalance: -difference }
        });
        await User.findByIdAndUpdate(trade.receiver, {
          $inc: { creditBalance: difference }
        });
      } else {
        await User.findByIdAndUpdate(trade.receiver, {
          $inc: { creditBalance: difference }
        });
        await User.findByIdAndUpdate(trade.requester, {
          $inc: { creditBalance: -difference }
        });
      }
    }

    // Refund escrow
    if (trade.escrowHeld) {
      await User.findByIdAndUpdate(trade.requester, {
        $inc: { creditBalance: trade.escrowAmount }
      });
      await User.findByIdAndUpdate(trade.receiver, {
        $inc: { creditBalance: trade.escrowAmount }
      });

      trade.escrowHeld = false;
    }

    // TRANSFER OWNERSHIP
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
      message: "Trade completed with credit adjustment",
      offeredValue,
      requestedValue,
      creditDifference: difference
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