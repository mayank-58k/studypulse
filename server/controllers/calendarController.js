import CalendarEvent from "../models/CalendarEvent.js";

export const getEvents = async (req, res) => res.json(await CalendarEvent.find({ user: req.user._id }).populate("subject"));
export const createEvent = async (req, res) => res.status(201).json(await CalendarEvent.create({ ...req.body, user: req.user._id }));
export const updateEvent = async (req, res) =>
  res.json(await CalendarEvent.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true }));
export const deleteEvent = async (req, res) => {
  await CalendarEvent.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Event deleted" });
};
