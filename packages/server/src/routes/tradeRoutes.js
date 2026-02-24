import express from "express";
import { 
  createTrade, 
  acceptTrade, 
  completeTrade, 
  rejectTrade, 
  getMyTrades, 
  getTradeById, 
  lockTradeTerms, 
  raiseDispute 
} from "../controllers/tradeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all my trades
router.get("/", protect, getMyTrades);

// Get single trade by ID
router.get("/:id", protect, getTradeById);

// Create a new trade request
router.post("/", protect, createTrade);

// NEW: Lock Terms (Generates Simulated Razorpay Link)
router.put("/:id/lock", protect, lockTradeTerms);

// Accept Trade (Requires terms to be locked)
router.put("/:id/accept", protect, acceptTrade);

// Complete Trade (Meetup successful, triggers escrow hold/rewards)
router.put("/:id/complete", protect, completeTrade);

// Reject/Cancel Trade
router.put("/:id/reject", protect, rejectTrade);

// NEW: Raise a Dispute
router.put("/:id/dispute", protect, raiseDispute);

export default router;