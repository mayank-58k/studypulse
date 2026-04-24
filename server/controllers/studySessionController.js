import StudySession from "../models/StudySession.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";
import { checkAndAwardBadges } from "./helpers.js";

export const getSessions = async (req, res) => res.json(await StudySession.find({ user: req.user._id }).populate("subject"));
export const createSession = async (req, res) => {
  const session = await StudySession.create({ ...req.body, user: req.user._id });
  await checkAndAwardBadges(req.user._id);
  res.status(201).json(session);
};
export const deleteSession = async (req, res) => {
  await StudySession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Session deleted" });
};
export const weeklySessions = async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  res.json(await StudySession.find({ user: req.user._id, date: { $gte: since } }));
};
export const heatmapSessions = async (req, res) => {
  const since = new Date();
  since.setMonth(since.getMonth() - 12);
  const sessions = await StudySession.find({ user: req.user._id, date: { $gte: since } });
  const map = {};
  for (const s of sessions) {
    const d = new Date(s.date).toISOString().slice(0, 10);
    map[d] = (map[d] || 0) + s.duration;
  }
  res.json(map);
};

export const getStreak = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ streakCount: user.streakCount, longestStreak: user.longestStreak, lastActiveDate: user.lastActiveDate });
};

export const streakCheckin = async (req, res) => {
  const user = await User.findById(req.user._id);
  const today = new Date();
  const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  const dayDiff = last ? Math.floor((today.setHours(0, 0, 0, 0) - new Date(last).setHours(0, 0, 0, 0)) / 86400000) : null;
  if (dayDiff === null || dayDiff > 1) user.streakCount = 1;
  else if (dayDiff === 1) user.streakCount += 1;
  user.lastActiveDate = new Date();
  user.longestStreak = Math.max(user.longestStreak, user.streakCount);
  await user.save();
  await checkAndAwardBadges(req.user._id);
  res.json({ streakCount: user.streakCount, longestStreak: user.longestStreak });
};

export const checkBadges = async (req, res) => {
  await checkAndAwardBadges(req.user._id);
  res.json(await Badge.find({ user: req.user._id }));
};
