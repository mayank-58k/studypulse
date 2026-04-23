export function calcPersonalBests(sessions) {
  if (!sessions || !sessions.length) return { longestSession: 0, bestDay: 0, bestWeek: 0, allTimeTotal: 0, longestSessionDate: null, bestDayDate: null, bestWeekRange: null };

  const allTimeTotal = Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60 * 10) / 10;

  const longestS = sessions.reduce((best, s) => s.duration > best.duration ? s : best, sessions[0]);
  const longestSession = Math.round(longestS.duration / 60 * 10) / 10;
  const longestSessionDate = longestS.date;

  // Best day
  const dayMap = {};
  sessions.forEach(s => {
    const day = new Date(s.date).toISOString().slice(0, 10);
    dayMap[day] = (dayMap[day] || 0) + s.duration;
  });
  const [bestDayDate, bestDayMins] = Object.entries(dayMap).reduce((best, [d, m]) => m > best[1] ? [d, m] : best, ['', 0]);
  const bestDay = Math.round(bestDayMins / 60 * 10) / 10;

  // Best week
  const weekMap = {};
  sessions.forEach(s => {
    const d = new Date(s.date);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const key = monday.toISOString().slice(0, 10);
    weekMap[key] = (weekMap[key] || 0) + s.duration;
  });
  const [bestWeekStart, bestWeekMins] = Object.entries(weekMap).reduce((best, [d, m]) => m > best[1] ? [d, m] : best, ['', 0]);
  const bestWeek = Math.round(bestWeekMins / 60 * 10) / 10;

  let bestWeekRange = null;
  if (bestWeekStart) {
    const start = new Date(bestWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    bestWeekRange = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  return { longestSession, bestDay, bestWeek, allTimeTotal, longestSessionDate, bestDayDate, bestWeekRange };
}

export function calcWeeklyComparison(sessions) {
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const thisWeekMins = sessions.filter(s => new Date(s.date) >= startOfThisWeek).reduce((sum, s) => sum + s.duration, 0);
  const lastWeekMins = sessions.filter(s => {
    const d = new Date(s.date);
    return d >= startOfLastWeek && d < startOfThisWeek;
  }).reduce((sum, s) => sum + s.duration, 0);

  const thisWeekHours = Math.round(thisWeekMins / 60 * 10) / 10;
  const lastWeekHours = Math.round(lastWeekMins / 60 * 10) / 10;

  let percentChange = 0;
  if (lastWeekHours > 0) percentChange = Math.round(((thisWeekHours - lastWeekHours) / lastWeekHours) * 100);

  return { thisWeekHours, lastWeekHours, percentChange };
}
