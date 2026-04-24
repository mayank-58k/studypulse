import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/axios";
import Spinner from "../components/ui/Spinner";

const intensity = ["bg-navy-700", "bg-emerald-900", "bg-emerald-700", "bg-emerald-500", "bg-neon-primary"];
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDateKey = (date) => date.toISOString().slice(0, 10);

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/sessions");
        setSessions(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dailyStats = useMemo(() => {
    const map = {};
    sessions.forEach((session) => {
      const key = formatDateKey(new Date(session.date));
      if (!map[key]) map[key] = { sessions: 0, minutes: 0, subjects: new Set() };
      map[key].sessions += 1;
      map[key].minutes += session.duration;
      if (session.subject?.name) map[key].subjects.add(session.subject.name);
    });
    return map;
  }, [sessions]);

  const heatmap = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 12);
    start.setDate(start.getDate() - start.getDay());

    const cells = [];
    const monthMarkers = [];
    const cursor = new Date(start);
    let weekIndex = 0;

    while (cursor <= end) {
      if (cursor.getDay() === 0) {
        const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`;
        const prev = monthMarkers[monthMarkers.length - 1];
        if (!prev || prev.key !== monthKey) {
          monthMarkers.push({ key: monthKey, label: cursor.toLocaleString("default", { month: "short" }), weekIndex });
        }
        weekIndex += 1;
      }
      const key = formatDateKey(cursor);
      const stat = dailyStats[key];
      cells.push({
        key,
        weekday: cursor.getDay(),
        week: Math.floor((cursor - start) / (1000 * 60 * 60 * 24 * 7)),
        sessions: stat?.sessions || 0,
        minutes: stat?.minutes || 0,
        subjects: stat ? [...stat.subjects] : []
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return { cells, monthMarkers };
  }, [dailyStats]);

  const monthlyBreakdown = useMemo(() => {
    const map = {};
    sessions.forEach((session) => {
      const d = new Date(session.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + session.duration / 60;
    });

    const now = new Date();
    const output = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      output.push({ month: d.toLocaleString("default", { month: "short" }), hours: Number((map[key] || 0).toFixed(1)) });
    }
    return output;
  }, [sessions]);

  if (loading) return <Spinner text="Loading calendar..." />;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-2xl font-display">Study Activity Calendar</h2>
        <p className="text-sm text-white/70">LeetCode-style heatmap for your last 12 months</p>
      </div>

      <div className="card p-4 overflow-auto relative">
        <div className="flex text-xs text-white/60 mb-2 pl-10 min-w-[900px]">
          {heatmap.monthMarkers.map((month) => (
            <div key={month.key} style={{ marginLeft: `${month.weekIndex === 0 ? 0 : month.weekIndex * 14}px` }} className="absolute">
              {month.label}
            </div>
          ))}
        </div>

        <div className="flex gap-2 min-w-[900px] mt-6">
          <div className="grid grid-rows-7 gap-1 pr-2 text-[10px] text-white/55 w-8">
            {dayLabels.map((day) => (
              <span key={day}>{day[0]}</span>
            ))}
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(...heatmap.cells.map((c) => c.week)) + 1}, minmax(0, 1fr))`, gridTemplateRows: "repeat(7, 12px)" }}>
            {heatmap.cells.map((cell) => {
              const level = Math.min(4, cell.sessions);
              return (
                <div
                  key={cell.key}
                  className={`h-3 w-3 rounded-[3px] ${intensity[level]} border border-white/10 hover:scale-125 transition-transform cursor-pointer`}
                  style={{ gridColumn: cell.week + 1, gridRow: cell.weekday + 1 }}
                  onMouseEnter={() => setHovered(cell)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-white/60">
          <span>Less</span>
          {intensity.map((tone, i) => (
            <span key={i} className={`w-3 h-3 rounded-[3px] ${tone} border border-white/10`} />
          ))}
          <span>More</span>
        </div>

        {hovered ? (
          <div className="mt-3 text-xs text-white/80 bg-navy-700/80 border border-white/10 rounded-lg p-2 inline-block">
            <p>{hovered.key}</p>
            <p>{hovered.sessions} sessions</p>
            <p>{hovered.subjects.length ? hovered.subjects.join(", ") : "No subjects logged"}</p>
          </div>
        ) : null}
      </div>

      <div className="card p-4 h-80">
        <h3 className="text-lg font-heading mb-2">Monthly Study Hours</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyBreakdown}>
            <XAxis dataKey="month" stroke="#ffffff88" />
            <YAxis stroke="#ffffff66" />
            <Tooltip formatter={(value) => [`${value}h`, "Hours"]} />
            <Bar dataKey="hours" fill="#00d4ff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
