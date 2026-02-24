import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import { getEstimatedValue } from "../services/valuationService.js";

const router = express.Router();

router.post("/estimate", protect, (req, res) => {
  // Extract originalPrice along with category and condition
  const { category, condition, originalPrice } = req.body;

  // Pass all three arguments to the service
  // Ensure originalPrice is converted to a Number
  const estimatedValue = getEstimatedValue(category, condition, Number(originalPrice));

  res.json({ estimatedValue });
});

export default router;