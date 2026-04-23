import Badge from "../models/Badge.js";
import Grade from "../models/Grade.js";
import StudySession from "../models/StudySession.js";
import Assignment from "../models/Assignment.js";

export const weightedAverage = (grades) => {
  if (!grades.length) return 0;
  const total = grades.reduce((acc, g) => acc + (g.score / g.maxScore) * 100 * g.weight, 0);
  const w = grades.reduce((acc, g) => acc + g.weight, 0);
  return w ? Number((total / w).toFixed(2)) : 0;
};

const definitions = [
  { key: "streak-7", title: "7 Day Streak", description: "Studied 7 days in a row", type: "streak" },
  { key: "streak-30", title: "30 Day Diamond", description: "Studied 30 days in a row", type: "streak" },
  { key: "study-10", title: "10 Study Hours", description: "Reached 10 total study hours", type: "study" },
  { key: "assign-20", title: "Task Crusher", description: "Completed 20 assignments", type: "assignment" }
];

export const checkAndAwardBadges = async (user) => {
  const existing = await Badge.find({ user }).lean();
  const has = (title) => existing.some((b) => b.title === title);
  const sessions = await StudySession.find({ user });
  const doneAssignments = await Assignment.countDocuments({ user, status: "done" });
  const totalMinutes = sessions.reduce((a, s) => a + s.duration, 0);

  const maybeCreate = async (def, condition) => {
    if (condition && !has(def.title)) {
      await Badge.create({ user, title: def.title, description: def.description, type: def.type });
    }
  };

  await maybeCreate(definitions[2], totalMinutes >= 600);
  await maybeCreate(definitions[3], doneAssignments >= 20);
};

export const gpaFromSubjects = async (user, Subject) => {
  const subjects = await Subject.find({ user }).lean();
  const points = [];
  for (const subject of subjects) {
    const grades = await Grade.find({ user, subject: subject._id });
    const avg = weightedAverage(grades);
    const p = avg >= 90 ? 4 : avg >= 80 ? 3 : avg >= 70 ? 2 : avg >= 60 ? 1 : 0;
    points.push(p);
  }
  if (!points.length) return 0;
  return Number((points.reduce((a, b) => a + b, 0) / points.length).toFixed(2));
};
