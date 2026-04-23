import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  type: { type: String, enum: ["assignment", "exam", "study", "reminder", "other"], default: "other" },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  color: { type: String, default: "#10b981" },
  notes: String
});

export default mongoose.model("CalendarEvent", calendarEventSchema);
