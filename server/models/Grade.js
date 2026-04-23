import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  category: { type: String, enum: ["test", "quiz", "assignment", "project", "exam"], required: true },
  title: { type: String, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  weight: { type: Number, default: 1 },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Grade", gradeSchema);
