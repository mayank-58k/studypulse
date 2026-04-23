import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import sessionRoutes, { streakRouter } from "./routes/studySessionRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ message: "StudyPulse API running" }));
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/streak", streakRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on ${process.env.PORT || 5000}`);
});
