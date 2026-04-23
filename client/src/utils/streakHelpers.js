export function getStreakMessage(days) {
  if (days >= 100) return "Legendary consistency. Keep the crown streak alive!";
  if (days >= 30) return "Diamond discipline unlocked.";
  if (days >= 14) return "Momentum is building fast.";
  if (days >= 7) return "Solid weekly streak. Stay locked in.";
  if (days >= 3) return "Great start. Keep showing up daily.";
  return "One focused session today starts a new streak.";
}

export const streakMilestones = [3, 7, 14, 30, 60, 100, 365];
