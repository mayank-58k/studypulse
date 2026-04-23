import Grade from "../models/Grade.js";
import Subject from "../models/Subject.js";
import { gpaFromSubjects } from "./helpers.js";

export const getGrades = async (req, res) => res.json(await Grade.find({ user: req.user._id }).populate("subject"));
export const createGrade = async (req, res) => res.status(201).json(await Grade.create({ ...req.body, user: req.user._id }));
export const updateGrade = async (req, res) =>
  res.json(await Grade.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true }));
export const deleteGrade = async (req, res) => {
  await Grade.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Grade deleted" });
};
export const getGpa = async (req, res) => res.json({ gpa: await gpaFromSubjects(req.user._id, Subject) });
