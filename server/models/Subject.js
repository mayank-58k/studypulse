import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    color: { type: String, default: "#f0b429" },
    icon: { type: String, default: "BookOpen" },
    targetGrade: Number,
    semester: String
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model("Subject", subjectSchema);
