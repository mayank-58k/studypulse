import Badge from "../models/Badge.js";
import Grade from "../models/Grade.js";
import StudySession from "../models/StudySession.js";
import Assignment from "../models/Assignment.js";
import Goal from "../models/Goal.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";

export const weightedAverage = (grades) => {
  if (!grades.length) return 0;
  const total = grades.reduce((acc, g) => acc + (g.score / g.maxScore) * 100 * g.weight, 0);
  const w = grades.reduce((acc, g) => acc + g.weight, 0);
  return w ? Number((total / w).toFixed(2)) : 0;
};

const badgeDefinitions = [
  { title: "3 Day Streak", description: "Hit a 3-day streak", type: "streak", check: ({ user }) => user.streakCount >= 3 },
  { title: "7 Day Streak", description: "Studied 7 days in a row", type: "streak", check: ({ user }) => user.streakCount >= 7 },
  { title: "14 Day Streak", description: "Hit a 14-day streak", type: "streak", check: ({ user }) => user.streakCount >= 14 },
  { title: "30 Day Streak", description: "Studied 30 days in a row", type: "streak", check: ({ user }) => user.streakCount >= 30 },
  { title: "60 Day Streak", description: "Maintained a 60-day streak", type: "streak", check: ({ user }) => user.streakCount >= 60 },
  { title: "100 Day Streak", description: "Maintained a 100-day streak", type: "streak", check: ({ user }) => user.streakCount >= 100 },
  { title: "365 Day Streak", description: "Legendary 365-day streak", type: "streak", check: ({ user }) => user.streakCount >= 365 },
  { title: "Night Owl", description: "Studied after 10pm", type: "study", check: ({ sessions }) => sessions.some((s) => new Date(s.date).getHours() >= 22) },
  { title: "Early Bird", description: "Studied before 7am", type: "study", check: ({ sessions }) => sessions.some((s) => new Date(s.date).getHours() < 7) },
  { title: "Marathon", description: "Completed a 4h+ session", type: "study", check: ({ sessions }) => sessions.some((s) => s.duration >= 240) },
  { title: "Century", description: "Reached 100 total hours", type: "study", check: ({ totalMinutes }) => totalMinutes >= 6000 },
  {
    title: "Speed Runner",
    description: "Completed an assignment 1h before due",
    type: "assignment",
    check: ({ doneAssignments }) =>
      doneAssignments.some((a) => a.dueDate && a.updatedAt && new Date(a.updatedAt).getTime() <= new Date(a.dueDate).getTime() - 60 * 60 * 1000)
  },
  {
    title: "Clean Slate",
    description: "Finished all due assignments this week",
    type: "assignment",
    check: ({ doneAssignments }) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return doneAssignments.filter((a) => new Date(a.updatedAt) >= weekAgo).length >= 7;
    }
  },
  {
    title: "On Fire",
    description: "Completed 10 assignments in one day",
    type: "assignment",
    check: ({ doneAssignmentsByDayMax }) => doneAssignmentsByDayMax >= 10
  },
  { title: "Perfect Score", description: "Scored 100% on a graded item", type: "grade", check: ({ grades }) => grades.some((g) => g.score >= g.maxScore) },
  {
    title: "Comeback Kid",
    description: "Improved after a low grade",
    type: "grade",
    check: ({ sortedGrades }) => {
      let hadLow = false;
      for (const grade of sortedGrades) {
        const pct = (grade.score / grade.maxScore) * 100;
        if (pct < 60) hadLow = true;
        if (hadLow && pct >= 85) return true;
      }
      return false;
    }
  },
  {
    title: "Consistent",
    description: "5 grades >= 90 in a row",
    type: "grade",
    check: ({ sortedGrades }) => {
      let streak = 0;
      for (const grade of sortedGrades) {
        const pct = (grade.score / grade.maxScore) * 100;
        if (pct >= 90) streak += 1;
        else streak = 0;
        if (streak >= 5) return true;
      }
      return false;
    }
  },
  { title: "First Login", description: "Joined StudyPulse", type: "milestone", check: () => true },
  {
    title: "Profile Complete",
    description: "Completed your profile details",
    type: "milestone",
    check: ({ user }) => Boolean(user.name && user.email && user.school && user.gradeLevel)
  },
  { title: "Goal Crusher", description: "Completed 3 goals", type: "milestone", check: ({ goalsCompleted }) => goalsCompleted >= 3 },
  {
    title: "Subject Master",
    description: "Maintain 95%+ average in a subject",
    type: "grade",
    check: ({ gradesBySubject }) =>
      Object.values(gradesBySubject).some((subjectGrades) => subjectGrades.length >= 3 && weightedAverage(subjectGrades) >= 95)
  }
];

export const checkAndAwardBadges = async (user) => {
  const [existing, sessions, doneAssignments, grades, goals, subjects, userDoc] = await Promise.all([
    Badge.find({ user }).lean(),
    StudySession.find({ user }).lean(),
    Assignment.find({ user, status: "done" }).lean(),
    Grade.find({ user }).lean(),
    Goal.find({ user }).lean(),
    Subject.find({ user }).lean(),
    User.findById(user).lean()
  ]);

  const has = (title) => existing.some((b) => b.title === title);
  const totalMinutes = sessions.reduce((a, s) => a + s.duration, 0);
  const doneByDay = doneAssignments.reduce((acc, assignment) => {
    const key = new Date(assignment.updatedAt || assignment.createdAt).toISOString().slice(0, 10);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const doneAssignmentsByDayMax = Math.max(0, ...Object.values(doneByDay));
  const sortedGrades = [...grades].sort((a, b) => new Date(a.date) - new Date(b.date));
  const goalsCompleted = goals.filter((g) => g.completed).length;
  const gradesBySubject = subjects.reduce((acc, subject) => {
    acc[subject._id] = grades.filter((g) => String(g.subject) === String(subject._id));
    return acc;
  }, {});

  for (const def of badgeDefinitions) {
    if (has(def.title)) continue;
    const earned = def.check({
      user: userDoc,
      sessions,
      totalMinutes,
      doneAssignments,
      doneAssignmentsByDayMax,
      grades,
      sortedGrades,
      goalsCompleted,
      gradesBySubject
    });
    if (earned) await Badge.create({ user, title: def.title, description: def.description, type: def.type });
  }
};

export const gpaFromSubjects = async (user, SubjectModel) => {
  const subjects = await SubjectModel.find({ user }).lean();
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
