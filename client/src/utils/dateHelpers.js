import { format, isToday, isTomorrow } from "date-fns";

export function formatDisplayDate(date) {
  if (!date) return "";
  return format(new Date(date), "MMM d, yyyy");
}

export function humanDueDate(date) {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE, MMM d");
}
