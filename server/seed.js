import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Subject from "./models/Subject.js";
import Grade from "./models/Grade.js";
import Assignment from "./models/Assignment.js";
import StudySession from "./models/StudySession.js";
import Goal from "./models/Goal.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Subject.deleteMany({}),
    Grade.deleteMany({}),
    Assignment.deleteMany({}),
    StudySession.deleteMany({}),
    Goal.deleteMany({})
  ]);

  const user = await User.create({
    name: "Demo Student",
    email: "demo@studypulse.dev",
    password: await bcrypt.hash("password123", 10),
    school: "StudyPulse High",
    gradeLevel: "11"
  });

  const math = await Subject.create({ user: user._id, name: "Mathematics", color: "#f0b429", semester: "Spring" });
  const cs = await Subject.create({ user: user._id, name: "Computer Science", color: "#10b981", semester: "Spring" });
  await Grade.create([
    { user: user._id, subject: math._id, category: "test", title: "Algebra Test", score: 88, maxScore: 100, weight: 2 },
    { user: user._id, subject: cs._id, category: "project", title: "React App", score: 95, maxScore: 100, weight: 3 }
  ]);
  await Assignment.create([
    { user: user._id, subject: math._id, title: "Worksheet 6", dueDate: new Date(), priority: "medium", status: "todo" },
    { user: user._id, subject: cs._id, title: "API Integration", dueDate: new Date(), priority: "high", status: "inprogress" }
  ]);
  await StudySession.create({ user: user._id, subject: cs._id, duration: 50, type: "pomodoro", notes: "Frontend focus" });
  await Goal.create({ user: user._id, title: "Reach 3.5 GPA", type: "gpa", targetValue: 3.5, currentValue: 3.1 });

  console.log("Seed complete. Login: demo@studypulse.dev / password123");
  await mongoose.disconnect();
};

seed();
