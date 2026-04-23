import Goal from "../models/Goal.js";

export const getGoals = async (req, res) => res.json(await Goal.find({ user: req.user._id }));
export const createGoal = async (req, res) => res.status(201).json(await Goal.create({ ...req.body, user: req.user._id }));
export const updateGoal = async (req, res) =>
  res.json(await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true }));
export const deleteGoal = async (req, res) => {
  await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Goal deleted" });
};
export const updateGoalProgress = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  goal.currentValue = req.body.currentValue;
  goal.completed = goal.currentValue >= goal.targetValue || req.body.completed === true;
  await goal.save();
  res.json(goal);
};
