import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing required fields" });
  if (await User.findOne({ email })) return res.status(400).json({ message: "Email already in use" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  res.status(201).json({ token: tokenFor(user._id), user: { ...user.toObject(), password: undefined } });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.json({ token: tokenFor(user._id), user: { ...user.toObject(), password: undefined } });
};

export const me = async (req, res) => res.json(req.user);

export const updateProfile = async (req, res) => {
  const { name, avatar, school, gradeLevel, password } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (name !== undefined) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (school !== undefined) user.school = school;
  if (gradeLevel !== undefined) user.gradeLevel = gradeLevel;
  if (password) user.password = await bcrypt.hash(password, 10);
  await user.save();
  res.json({ ...user.toObject(), password: undefined });
};

export const deleteAccount = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  await User.deleteOne({ _id: req.user._id });
  res.json({ message: "Account deleted" });
};
