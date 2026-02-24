import express from "express";
import { createItem, getItems, getItemById, getMyItems } from "../controllers/itemController.js";
import { protect } from "../middleware/authMiddleware.js"; // UPDATE: Added curly braces
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getItems); 
router.get("/myitems", protect, getMyItems); 
router.get("/:id", getItemById);

// UPDATE: Changed from .array() to .fields() to accept both inputs
router.post(
  "/", 
  protect, 
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "receiptImage", maxCount: 1 }
  ]), 
  createItem
);

export default router;