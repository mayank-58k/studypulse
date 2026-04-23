import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createGrade, deleteGrade, getGpa, getGrades, updateGrade } from "../controllers/gradeController.js";

const router = express.Router();
router.use(protect);
router.get("/", getGrades);
router.post("/", createGrade);
router.put("/:id", updateGrade);
router.delete("/:id", deleteGrade);
router.get("/gpa", getGpa);

export default router;
