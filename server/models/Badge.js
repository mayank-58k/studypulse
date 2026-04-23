import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: "Award" },
  earnedAt: { type: Date, default: Date.now },
  type: { type: String, enum: ["streak", "grade", "study", "assignment", "milestone"], required: true }
});

export default mongoose.model("Badge", badgeSchema);
