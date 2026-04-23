import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createEvent, deleteEvent, getEvents, updateEvent } from "../controllers/calendarController.js";

const router = express.Router();
router.use(protect);
router.get("/", getEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
