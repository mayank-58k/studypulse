import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["gpa", "study_hours", "assignments", "streak", "custom"], default: "custom" },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  deadline: Date,
  completed: { type: Boolean, default: false }
});

export default mongoose.model("Goal", goalSchema);
