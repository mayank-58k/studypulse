import Badge from "../models/Badge.js";
import { checkAndAwardBadges } from "./helpers.js";

export const getBadges = async (req, res) => res.json(await Badge.find({ user: req.user._id }));
export const checkBadges = async (req, res) => {
  await checkAndAwardBadges(req.user._id);
  res.json(await Badge.find({ user: req.user._id }));
};
