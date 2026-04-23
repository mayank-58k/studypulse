import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createSession,
  deleteSession,
  getSessions,
  getStreak,
  heatmapSessions,
  streakCheckin,
  weeklySessions
} from "../controllers/studySessionController.js";

const router = express.Router();
router.use(protect);
router.get("/", getSessions);
router.post("/", createSession);
router.delete("/:id", deleteSession);
router.get("/weekly", weeklySessions);
router.get("/heatmap", heatmapSessions);

export const streakRouter = express.Router();
streakRouter.use(protect);
streakRouter.get("/", getStreak);
streakRouter.post("/checkin", streakCheckin);

export default router;
