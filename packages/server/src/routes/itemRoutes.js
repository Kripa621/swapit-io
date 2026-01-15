import express from "express";
import { createItem, getItems, getItemById, getMyItems } from "../controllers/itemController.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes (Marketplace doesn't explicitly require login to VIEW, but usually better to protect)
router.get("/", getItems); 
router.get("/myitems", protect, getMyItems); // Must come before /:id
router.get("/:id", getItemById);

router.post("/", protect, upload.array("images", 5), createItem);

export default router;