import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getEstimatedValue } from "../services/valuationService.js";

const router = express.Router();

router.post("/estimate", protect, (req, res) => {
  const { category, condition } = req.body;

  const estimatedValue = getEstimatedValue(category, condition);

  res.json({ estimatedValue });
});

export default router;
