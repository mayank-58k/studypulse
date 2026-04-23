import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createSubject,
  deleteSubject,
  getSubjectAverage,
  getSubjectGrades,
  getSubjects,
  updateSubject
} from "../controllers/subjectController.js";

const router = express.Router();
router.use(protect);
router.get("/", getSubjects);
router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);
router.get("/:id/grades", getSubjectGrades);
router.get("/:id/average", getSubjectAverage);

export default router;
