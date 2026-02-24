import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { 
  getPendingItems, reviewItem, 
  getPendingRefunds, confirmManualRefund,
  getPendingCredits, approveCreditPoints,
  getDisputedTrades, getTradeChatLogs,
  resolveDispute
} from "../controllers/adminController.js";

const router = express.Router();

// All routes here are protected by BOTH middlewares
router.use(protect, admin);

router.get("/items/pending", getPendingItems);
router.put("/items/:id/review", reviewItem);

router.get("/refunds/pending", getPendingRefunds);
router.put("/refunds/:id/confirm", confirmManualRefund);

router.get("/credits/pending", getPendingCredits);
router.put("/credits/:id/approve", approveCreditPoints);

router.get("/disputes", getDisputedTrades);
router.get("/disputes/:tradeId/logs", getTradeChatLogs);
router.put("/disputes/:id/resolve", resolveDispute);

export default router;