import Assignment from "../models/Assignment.js";
import { checkAndAwardBadges } from "./helpers.js";

export const getAssignments = async (req, res) => res.json(await Assignment.find({ user: req.user._id }).populate("subject"));
export const createAssignment = async (req, res) => res.status(201).json(await Assignment.create({ ...req.body, user: req.user._id }));
export const updateAssignment = async (req, res) =>
  res.json(await Assignment.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true }));
export const updateAssignmentStatus = async (req, res) => {
  const item = await Assignment.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status: req.body.status },
    { new: true }
  );
  if (item?.status === "done") await checkAndAwardBadges(req.user._id);
  res.json(item);
};
export const deleteAssignment = async (req, res) => {
  await Assignment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Assignment deleted" });
};
export const getOverdueAssignments = async (req, res) =>
  res.json(await Assignment.find({ user: req.user._id, dueDate: { $lt: new Date() }, status: { $ne: "done" } }));
