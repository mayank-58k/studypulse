import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: String,
    school: String,
    gradeLevel: String,
    streakCount: { type: Number, default: 0 },
    lastActiveDate: Date,
    longestStreak: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model("User", userSchema);
