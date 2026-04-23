import Subject from "../models/Subject.js";
import Grade from "../models/Grade.js";
import { weightedAverage } from "./helpers.js";

export const getSubjects = async (req, res) => res.json(await Subject.find({ user: req.user._id }));
export const createSubject = async (req, res) => res.status(201).json(await Subject.create({ ...req.body, user: req.user._id }));
export const updateSubject = async (req, res) =>
  res.json(await Subject.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true }));
export const deleteSubject = async (req, res) => {
  await Subject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Subject deleted" });
};
export const getSubjectGrades = async (req, res) => res.json(await Grade.find({ user: req.user._id, subject: req.params.id }));
export const getSubjectAverage = async (req, res) => {
  const grades = await Grade.find({ user: req.user._id, subject: req.params.id });
  res.json({ average: weightedAverage(grades) });
};
