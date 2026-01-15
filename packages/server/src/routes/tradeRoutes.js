import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createTrade,
  acceptTrade,
  completeTrade,
  rejectTrade,
  getMyTrades,
  getTradeById // Imported new controller
} from "../controllers/tradeController.js";

const router = express.Router();

router.post("/", protect, createTrade);
router.get("/", protect, getMyTrades); // Fetch my trades
router.get("/:id", protect, getTradeById); // GET single trade details
router.put("/:id/accept", protect, acceptTrade);
router.put("/:id/complete", protect, completeTrade);
router.put("/:id/reject", protect, rejectTrade); // Reject trade

export default router;