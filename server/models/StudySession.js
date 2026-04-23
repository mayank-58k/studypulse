import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ["pomodoro", "manual"], default: "pomodoro" },
  notes: String
});

export default mongoose.model("StudySession", studySessionSchema);
