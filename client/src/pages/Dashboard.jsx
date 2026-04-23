import { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/ui/Spinner";
import { formatDisplayDate, humanDueDate } from "../utils/dateHelpers";
import { calcWeightedAverage } from "../utils/gpaCalculator";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    gpa: 0,
    pending: 0,
    weeklyHours: 0,
    streak: 0,
    upcoming: [],
    badges: [],
    subjects: [],
    heatmap: {}
  });
  const quotes = [
    "Discipline turns goals into grades.",
    "Small sessions every day beat one giant cram.",
    "Consistency is your secret competitive edge."
  ];
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [g, assignmentsRes, sessionsRes, streakRes, badgesRes, subjectsRes, heatmapRes] = await Promise.all([
          api.get("/grades/gpa"),
          api.get("/assignments"),
          api.get("/sessions/weekly"),
          api.get("/streak"),
          api.get("/badges"),
          api.get("/subjects"),
          api.get("/sessions/heatmap")
        ]);
        const assignments = assignmentsRes.data || [];
        const upcoming = assignments
          .filter((a) => a.status !== "done")
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);

        const subjectsWithHealth = await Promise.all(
          (subjectsRes.data || []).map(async (subject) => {
            const grades = (await api.get(`/subjects/${subject._id}/grades`)).data;
            return { ...subject, average: calcWeightedAverage(grades) };
          })
        );

        setState({
          gpa: g.data.gpa || 0,
          pending: assignments.filter((i) => i.status !== "done").length,
          weeklyHours: Number((sessionsRes.data.reduce((acc, i) => acc + i.duration, 0) / 60).toFixed(1)),
          streak: streakRes.data.streakCount || 0,
          upcoming,
          badges: (badgesRes.data || []).slice(-5).reverse(),
          subjects: subjectsWithHealth,
          heatmap: heatmapRes.data || {}
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner text="Loading dashboard..." />;
  const heatmapKeys = Array.from({ length: 180 }).map((_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (179 - idx));
    return date.toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p className="text-sm text-white/60">{formatDisplayDate(new Date())}</p>
        <h2 className="text-3xl font-display mt-1">Dashboard</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["GPA", state.gpa],
          ["Pending Assignments", state.pending],
          ["Study Hours This Week", state.weeklyHours],
          ["Current Streak", state.streak]
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-sm text-white/70">{label}</p>
            <p className="text-3xl text-gold-400 font-mono">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className="card p-4">
          <h3 className="text-lg mb-2">Study Activity Heatmap</h3>
          <div className="grid grid-cols-12 md:grid-cols-18 gap-1">
            {heatmapKeys.map((key) => {
              const minutes = state.heatmap[key] || 0;
              const color =
                minutes > 120 ? "bg-emerald-400" : minutes > 60 ? "bg-emerald-500/80" : minutes > 0 ? "bg-emerald-500/40" : "bg-navy-700";
              return <div key={key} className={`h-3 rounded-sm ${color}`} title={`${key}: ${minutes} min`} />;
            })}
          </div>
        </div>
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-lg mb-3">Upcoming Deadlines</h3>
          <div className="space-y-2">
            {state.upcoming.length ? (
              state.upcoming.map((item) => (
                <div key={item._id} className="bg-navy-700 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p>{item.title}</p>
                    <p className="text-xs text-white/60">{item.subject?.name || "No subject"}</p>
                  </div>
                  <p className="text-sm text-gold-400">{humanDueDate(item.dueDate)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">No pending deadlines.</p>
            )}
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-lg mb-2">Quote of the Day</h3>
          <p className="text-white/80">{quote}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <div className="card p-4">
          <h3 className="text-lg mb-3">Subject Health</h3>
          <div className="space-y-2">
            {state.subjects.map((subject) => (
              <div key={subject._id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{subject.name}</span>
                  <span>{subject.average}%</span>
                </div>
                <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: `${Math.min(subject.average, 100)}%`, background: subject.color || "#10b981" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg mb-3">Recent Badges</h3>
          <div className="space-y-2">
            {state.badges.length ? (
              state.badges.map((badge) => (
                <div key={badge._id} className="bg-navy-700 rounded-lg p-3">
                  <p>{badge.title}</p>
                  <p className="text-xs text-white/60">{badge.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">No badges yet. Keep studying.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
