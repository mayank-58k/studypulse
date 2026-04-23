export const BADGE_DEFINITIONS = [
  // STREAK
  { id: 'streak_3', title: '3-Day Streak', description: 'Study 3 days in a row', emoji: '🔥', category: 'streak', threshold: 3, field: 'streakCount' },
  { id: 'streak_7', title: '7-Day Streak', description: 'Study 7 days in a row', emoji: '🔥', category: 'streak', threshold: 7, field: 'streakCount' },
  { id: 'streak_14', title: '14-Day Streak', description: 'Study 14 days in a row', emoji: '🔥', category: 'streak', threshold: 14, field: 'streakCount' },
  { id: 'streak_30', title: '30-Day Streak', description: 'Study 30 days in a row', emoji: '🔥', category: 'streak', threshold: 30, field: 'streakCount' },
  { id: 'streak_60', title: '60-Day Streak', description: 'Study 60 days in a row', emoji: '💎', category: 'streak', threshold: 60, field: 'streakCount' },
  { id: 'streak_100', title: '100-Day Streak', description: 'Study 100 days in a row', emoji: '💎', category: 'streak', threshold: 100, field: 'streakCount' },
  { id: 'streak_365', title: '365-Day Streak', description: 'Study a full year in a row', emoji: '👑', category: 'streak', threshold: 365, field: 'streakCount' },
  // SESSIONS
  { id: 'night_owl', title: 'Night Owl', description: 'Studied after 10:00 PM', emoji: '🌙', category: 'sessions' },
  { id: 'early_bird', title: 'Early Bird', description: 'Studied before 7:00 AM', emoji: '🌅', category: 'sessions' },
  { id: 'marathon', title: 'Marathon Runner', description: 'Single session of 4+ hours', emoji: '🏃', category: 'sessions', threshold: 240 },
  { id: 'century_club', title: 'Century Club', description: '100+ total study hours', emoji: '💯', category: 'sessions', threshold: 6000 },
  // ASSIGNMENTS
  { id: 'speed_runner', title: 'Speed Runner', description: 'Completed 1+ hour before due date', emoji: '⚡', category: 'assignments' },
  { id: 'clean_slate', title: 'Clean Slate', description: 'All assignments done for a full week', emoji: '✨', category: 'assignments' },
  { id: 'on_fire', title: 'On Fire', description: '10+ assignments in one day', emoji: '🔥', category: 'assignments', threshold: 10 },
  { id: 'completionist', title: 'Completionist', description: '50+ total assignments completed', emoji: '✅', category: 'assignments', threshold: 50 },
  // GRADES
  { id: 'perfect_score', title: 'Perfect Score', description: '100% on any assignment/test', emoji: '💯', category: 'grades' },
  { id: 'comeback_kid', title: 'Comeback Kid', description: 'Improved 20+ points in a subject', emoji: '📈', category: 'grades' },
  { id: 'consistent', title: 'Consistent', description: '5 A grades in a row in any subject', emoji: '🎯', category: 'grades', threshold: 5 },
  // MILESTONES
  { id: 'first_login', title: 'First Login', description: 'Welcome to StudyPulse!', emoji: '🚀', category: 'milestones' },
  { id: 'profile_complete', title: 'Profile Complete', description: 'All profile fields filled', emoji: '📋', category: 'milestones' },
  // GOALS
  { id: 'goal_crusher', title: 'Goal Crusher', description: 'Completed 5+ goals', emoji: '🏆', category: 'goals', threshold: 5 },
];

export function getBadgeProgress(badgeId, stats) {
  const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
  if (!def || !def.threshold) return { current: 0, target: 1, percent: 0 };

  let current = 0;
  switch (badgeId) {
    case 'streak_3': case 'streak_7': case 'streak_14': case 'streak_30':
    case 'streak_60': case 'streak_100': case 'streak_365':
      current = stats.streakCount || 0; break;
    case 'marathon': current = stats.longestSession || 0; break;
    case 'century_club': current = stats.totalMinutes || 0; break;
    case 'on_fire': current = stats.maxDayAssignments || 0; break;
    case 'completionist': current = stats.totalAssignmentsDone || 0; break;
    case 'consistent': current = stats.gradeStreak || 0; break;
    case 'goal_crusher': current = stats.completedGoals || 0; break;
    default: current = 0;
  }

  const percent = Math.min(100, Math.round((current / def.threshold) * 100));
  return { current, target: def.threshold, percent };
}

export function isBadgeEarned(badgeId, earnedBadges) {
  return earnedBadges.some(b => b.badgeId === badgeId || b.title?.toLowerCase().includes(badgeId.replace(/_/g, ' ')));
}

export const STREAK_CONFETTI_MILESTONES = [3, 7, 30, 100];
