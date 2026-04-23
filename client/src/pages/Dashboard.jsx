import { useEffect, useState } from "react";
import { Clock, Flame, BookOpen, Zap } from "lucide-react";
import api from "../api/axios";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import LeaderboardSection from "../components/ui/LeaderboardSection";
import LeetCodeHeatmap from "../components/ui/LeetCodeHeatmap";
import { formatDisplayDate, humanDueDate } from "../utils/dateHelpers";
import { calcWeightedAverage } from "../utils/gpaCalculator";
import { calcPersonalBests, calcWeeklyComparison } from "../utils/leaderboardHelpers";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '🌅' };
  if (h < 17) return { text: 'Good afternoon', emoji: '☀️' };
  return { text: 'Good evening', emoji: '🌙' };
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({ pending: 0, weeklyHours: 0, streak: 0, upcoming: [], badges: [], subjects: [], heatmap: {}, sessions: [] });
  const quotes = ["Discipline turns goals into grades.", "Small sessions every day beat one giant cram.", "Consistency is your secret competitive edge."];
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);
  const { text: greetText, emoji: greetEmoji } = getGreeting();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [assignmentsRes, sessionsRes, weeklyRes, streakRes, badgesRes, subjectsRes, heatmapRes] = await Promise.all([
          api.get("/assignments"), api.get("/sessions"), api.get("/sessions/weekly"),
          api.get("/streak"), api.get("/badges"), api.get("/subjects"), api.get("/sessions/heatmap")
        ]);
        const assignments = assignmentsRes.data || [];
        const upcoming = assignments.filter(a => a.status !== "done").sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);
        const subjectsWithHealth = await Promise.all((subjectsRes.data || []).map(async (subject) => {
          const grades = (await api.get(`/subjects/${subject._id}/grades`)).data;
          return { ...subject, average: calcWeightedAverage(grades) };
        }));
        setState({
          pending: assignments.filter(i => i.status !== "done").length,
          weeklyHours: Number((weeklyRes.data.reduce((acc, i) => acc + i.duration, 0) / 60).toFixed(1)),
          streak: streakRes.data.streakCount || 0,
          upcoming, badges: (badgesRes.data || []).slice(-5).reverse(),
          subjects: subjectsWithHealth, heatmap: heatmapRes.data || {},
          sessions: sessionsRes.data || []
        });
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <SkeletonLoader height="h-20" />
      <div className="grid sm:grid-cols-3 gap-3"><SkeletonLoader height="h-24" count={3} /></div>
      <div className="grid lg:grid-cols-3 gap-3"><SkeletonLoader height="h-48" count={3} /></div>
    </div>
  );

  const records = calcPersonalBests(state.sessions);
  const weekly = calcWeeklyComparison(state.sessions);
  const todayFocus = state.upcoming[0];
  const heatmapSessionCounts = {};
  Object.entries(state.heatmap).forEach(([date, minutes]) => {
    heatmapSessionCounts[date] = Math.ceil(minutes / 30);
  });

  return (
    <div className="space-y-4">
      {/* Header / Greeting */}
      <div className="card p-5">
        <p className="text-sm text-white/50">{formatDisplayDate(new Date())}</p>
        <h2 className="text-2xl font-heading font-bold mt-1">{greetEmoji} {greetText}!</h2>
        {weekly.percentChange !== 0 && (
          <p className="text-sm mt-1" style={{ color: weekly.percentChange > 0 ? '#00ff88' : '#ff6b35' }}>
            {weekly.percentChange > 0 ? '📈' : '📉'} You studied {weekly.thisWeekHours}h this week — that's {Math.abs(weekly.percentChange)}% {weekly.percentChange > 0 ? 'more' : 'less'} than last week
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: "Pending Assignments", value: state.pending, icon: BookOpen, color: '#ff6b35' },
          { label: "Study Hours This Week", value: state.weeklyHours, icon: Clock, color: '#00d4ff' },
          { label: "Current Streak 🔥", value: state.streak, icon: Flame, color: '#00ff88' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">{label}</p>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-3xl font-mono font-bold mt-2" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Today's Focus */}
      {todayFocus && (
        <div className="card p-4 border-neon-primary/20">
          <h3 className="text-sm font-semibold text-neon-primary mb-2 flex items-center gap-2"><Zap size={14} /> Today's Focus</h3>
          <p className="font-semibold">{todayFocus.title}</p>
          <p className="text-xs text-white/50 mt-1">{todayFocus.subject?.name || 'No subject'} • Due {humanDueDate(todayFocus.dueDate)}</p>
        </div>
      )}

      {/* Personal Records */}
      <LeaderboardSection records={records} />

      {/* Heatmap + Upcoming Deadlines */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">Study Activity</h3>
          <LeetCodeHeatmap data={heatmapSessionCounts} />
        </div>
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-3">Upcoming Deadlines</h3>
          <div className="space-y-2">
            {state.upcoming.length ? state.upcoming.map(item => (
              <div key={item._id} className="bg-navy-700/50 rounded-lg p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-white/50">{item.subject?.name || "No subject"}</p></div>
                <p className="text-sm text-neon-warning">{humanDueDate(item.dueDate)}</p>
              </div>
            )) : <p className="text-sm text-white/50">No pending deadlines. 🎉</p>}
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-2">Quote of the Day</h3>
          <p className="text-white/70 italic">"{quote}"</p>
        </div>
      </div>

      {/* Subject Health + Recent Badges */}
      <div className="grid lg:grid-cols-2 gap-3">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">Subject Health</h3>
          <div className="space-y-3">
            {state.subjects.length ? state.subjects.map(subject => (
              <div key={subject._id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80">{subject.name}</span>
                  <span className="font-mono" style={{ color: subject.color || '#00ff88' }}>{subject.average}%</span>
                </div>
                <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(subject.average, 100)}%`, background: subject.color || '#00ff88' }} />
                </div>
              </div>
            )) : <p className="text-sm text-white/50">No subjects yet.</p>}
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">Recent Badges</h3>
          <div className="space-y-2">
            {state.badges.length ? state.badges.map(badge => (
              <div key={badge._id} className="bg-white/5 rounded-lg p-3 flex items-center gap-3 hover:bg-white/8 transition-colors">
                <span className="text-xl">{badge.emoji || '🏆'}</span>
                <div><p className="text-sm font-medium">{badge.title}</p><p className="text-xs text-white/50">{badge.description}</p></div>
              </div>
            )) : <p className="text-sm text-white/50">No badges yet. Keep studying! 💪</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
