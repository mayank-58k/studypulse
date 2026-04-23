import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  getOverdueAssignments,
  updateAssignment,
  updateAssignmentStatus
} from "../controllers/assignmentController.js";

const router = express.Router();
router.use(protect);
router.get("/", getAssignments);
router.post("/", createAssignment);
router.put("/:id", updateAssignment);
router.patch("/:id/status", updateAssignmentStatus);
router.delete("/:id", deleteAssignment);
router.get("/overdue", getOverdueAssignments);

export default router;
