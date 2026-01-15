import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js"; // Import getMe
import protect from "../middleware/authMiddleware.js"; // Import protect

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe); // Add this line

export default router;