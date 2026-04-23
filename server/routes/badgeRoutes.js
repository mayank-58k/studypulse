import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkBadges, getBadges } from "../controllers/badgeController.js";

const router = express.Router();
router.use(protect);
router.get("/", getBadges);
router.post("/check", checkBadges);

export default router;
